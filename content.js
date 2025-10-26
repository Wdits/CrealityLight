(function () {
  const CONFIG_KEY = 'creality_light_config_v1';

  function loadConfig() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get([CONFIG_KEY], (res) => {
          resolve(res[CONFIG_KEY] || {});
        });
      } catch (e) {
        resolve({});
      }
    });
  }

  function saveConfig(cfg) {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.set({ [CONFIG_KEY]: cfg }, resolve);
      } catch (e) {
        resolve();
      }
    });
  }

  function isTargetPage() {
    const hasVideo = document.querySelector('#remoteVideos');
    const title = document.title || '';
    return !!hasVideo || /Video On Demand/i.test(title);
  }

  function createSwitch() {
    const container = document.createElement('div');
    container.className = 'cls-switch-container';

    // Fancy bubble panel
    const panel = document.createElement('div');
    panel.className = 'cls-panel';

    const header = document.createElement('div');
    header.className = 'cls-header';

    // SVG icon (light bulb)
    const svgNS = 'http://www.w3.org/2000/svg';
    const icon = document.createElementNS(svgNS, 'svg');
    icon.setAttribute('class', 'cls-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '22');
    icon.setAttribute('height', '22');
    const path = document.createElementNS(svgNS, 'path');
    // Light bulb outline (monochrome white)
    path.setAttribute('d', 'M9 21h6v-1H9v1zm3-20C7.48 1 4 4.48 4 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-4.52-3.48-8-8-8z');
    icon.appendChild(path);

    const title = document.createElement('span');
    title.className = 'cls-title';
    title.textContent = 'Light';

    header.appendChild(icon);
    header.appendChild(title);

    const label = document.createElement('label');
    label.className = 'cls-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'cls-light-toggle';

    const slider = document.createElement('span');
    slider.className = 'cls-slider';
    slider.title = 'Toggle chamber light';

    label.appendChild(input);
    label.appendChild(slider);

    // Second control: Dark mode
    const dmWrap = document.createElement('div');
    dmWrap.className = 'cls-dark-row';
    const dmTitle = document.createElement('span');
    dmTitle.className = 'cls-subtitle';
    dmTitle.textContent = 'Dark mode';
    const dmLabel = document.createElement('label');
    dmLabel.className = 'cls-switch';
    const dmInput = document.createElement('input');
    dmInput.type = 'checkbox';
    dmInput.id = 'cls-dark-toggle';
    const dmSlider = document.createElement('span');
    dmSlider.className = 'cls-slider';
    dmLabel.appendChild(dmInput);
    dmLabel.appendChild(dmSlider);
    dmWrap.appendChild(dmTitle);
    dmWrap.appendChild(dmLabel);

    panel.appendChild(header);
    panel.appendChild(label);
    panel.appendChild(dmWrap);
    container.appendChild(panel);

    document.documentElement.appendChild(container);
    return { lightInput: input, darkInput: dmInput, container };
  }

  async function connectAndSend(wsUrl, payload) {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          ws.send(JSON.stringify(payload));
          setTimeout(() => {
            try { ws.close(); } catch (e) {}
            resolve();
          }, 100);
        };
        ws.onerror = (ev) => reject(new Error('WebSocket error'));
        ws.onclose = () => {};
      } catch (e) {
        reject(e);
      }
    });
  }

  async function init() {
    if (!isTargetPage()) return;

    const cfg = await loadConfig();
    const defaultWs = `ws://${location.hostname}:9999/`;
    const wsUrl = (cfg.wsUrl || '').trim() || defaultWs;

    const { lightInput, darkInput, container } = createSwitch();
    let busy = false;
    lightInput.addEventListener('change', async () => {
      if (busy) return;
      busy = true;
      const wantOn = lightInput.checked;
      try {
        await connectAndSend(wsUrl, {
          method: 'set',
          params: { lightSw: wantOn ? 1 : 0 },
        });
        // Persist last state so UI won't reset on position change
        cfg.lastLightOn = wantOn;
        await saveConfig(cfg);
      } catch (e) {
        console.warn('[Creality Light] WS send failed', e);
        // Revert UI on failure
        lightInput.checked = !wantOn;
      } finally {
        busy = false;
      }
    });

    // Dark mode toggle
    const applyDark = (on) => {
      const root = document.documentElement;
      if (on) {
        root.classList.add('cls-dark');
      } else {
        root.classList.remove('cls-dark');
      }
    };
    if (cfg.dark === true) {
      darkInput.checked = true;
      applyDark(true);
    }
    if (typeof cfg.lastLightOn === 'boolean') {
      lightInput.checked = !!cfg.lastLightOn;
    }
    darkInput.addEventListener('change', async () => {
      const on = darkInput.checked;
      applyDark(on);
      cfg.dark = on;
      await saveConfig(cfg);
    });
    // Apply overlay position (fixed) left/center/right
    const pos = (cfg.overlayPos || 'right');
    container.classList.remove('pos-left', 'pos-center', 'pos-right');
    container.classList.add('pos-' + pos);
    // Save default if missing
    if (!cfg.overlayPos) {
      cfg.overlayPos = pos;
      await saveConfig(cfg);
    }
  }

  // Delay until DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


