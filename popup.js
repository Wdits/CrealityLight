(function(){
  const KEY = 'creality_light_config_v1';
  let ipInput, saveBtn, statusEl, openOptions;

  function load() {
    try {
      chrome.storage.sync.get([KEY], (res) => {
        const cfg = res[KEY] || {};
        // Show only IP; derive ws url automatically
        const currentUrl = cfg.wsUrl || '';
        const ip = (currentUrl.match(/ws:\/\/(.*?):\d+\//)?.[1]) || '';
        ipInput.value = ip;
        // Set default selection for overlay position
        const pos = cfg.overlayPos || 'right';
        const radios = document.getElementsByName('overlayPos');
        for (const r of radios) {
          if (r.value === pos) r.checked = true;
        }
      });
    } catch (e) {}
  }

  function sanitizeIp(raw) {
    let s = (raw || '').trim();
    // Remove protocol prefixes
    s = s.replace(/^https?:\/\//i, '').replace(/^wss?:\/\//i, '');
    // Remove path/query
    s = s.split('/')[0].split('\\')[0];
    // Remove port if provided
    s = s.replace(/:\d+$/, '');
    return s;
  }

  function isValidIPv4(ip) {
    const m = ip.match(/^([0-9]{1,3}\.){3}[0-9]{1,3}$/);
    if (!m) return false;
    return ip.split('.').every(oct => Number(oct) >= 0 && Number(oct) <= 255);
  }

  function save() {
    const ipRaw = sanitizeIp(ipInput.value);
    // overlay position
    let overlayPos = 'right';
    const radios = document.getElementsByName('overlayPos');
    for (const r of radios) { if (r.checked) overlayPos = r.value; }

    chrome.storage.sync.get([KEY], (res) => {
      const oldCfg = res[KEY] || {};
      let wsUrl = oldCfg.wsUrl || '';
      // Update wsUrl only if user typed something
      if (ipRaw) {
        if (!isValidIPv4(ipRaw)) {
          statusEl.textContent = 'Invalid IP';
          return;
        }
        wsUrl = `ws://${ipRaw}:9999/`;
      }
      if (!wsUrl) {
        statusEl.textContent = 'Enter IP';
        return;
      }
      const newCfg = { ...oldCfg, wsUrl, overlayPos };
      chrome.storage.sync.set({ [KEY]: newCfg }, () => {
        // Reflect sanitized IP in the input to avoid confusion
        const match = wsUrl.match(/ws:\/\/(.*?):\d+\//);
        if (match) ipInput.value = match[1];
        statusEl.textContent = 'Saved';
        setTimeout(() => statusEl.textContent = '', 1500);
      });
    });
  }

  function init() {
    ipInput = document.getElementById('printerIp');
    saveBtn = document.getElementById('save');
    statusEl = document.getElementById('status');
    openOptions = document.getElementById('openOptions');
    if (saveBtn) saveBtn.addEventListener('click', save);
    if (openOptions) openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());
    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


