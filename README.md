My goal with this extension was to bypass Creality Print’s “exclusive features.” I’ve always preferred Orca for my own reasons, but it doesn’t let you control the onboard camera light.

This extension fixes that, it sends a packet directly to your printer to toggle the onboard camera LED, simply by flipping a fancy switch on <PRINTER_IP>:8000. There’s also a Dark Mode toggle, because why not.

## Why would i want this?
You no longer need to use any apps just to toggle your printer’s camera light from your computer!

<img width="1122" height="114" alt="image" src="https://github.com/user-attachments/assets/3301c3dd-54d7-4a48-9865-5adb1cd39fba" />

## How to Install & Use

Download or clone this repository.
Click the green Code → Download ZIP button, then extract it somewhere on your computer.

Open Chrome and go to:
chrome://extensions

Enable “Developer mode.”
You’ll find the toggle switch in the top-right corner of the Extensions page.

Click “Load unpacked.”

Select the folder where you extracted the project (the one containing manifest.json) (You need to select the folder containing the files).

The extension should now appear in your list, you can pin it to the toolbar if you want quick access.

Open the extension menu and configure it with your printer own address and preferred position.

Go to your printer’s camera page (http://<PRINTER_IP>:8000) and you’ll see a new LED switch (and Dark Mode toggle).
