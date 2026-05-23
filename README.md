# Popup Tab

A Chrome extension that toggles the active tab between a normal Chrome tab and its own popup window with a keyboard shortcut.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `/Users/skye/Documents/popup-tab`.

## Shortcut

Default shortcut:

- macOS: `Command+Shift+Y`
- Other platforms: `Alt+P`

Press the shortcut once to move the current tab into a popup window. Press it again while focused in that popup window to move it back into a normal tab.

Chrome can override or disable extension shortcuts. To edit it, open `chrome://extensions/shortcuts` and set **Toggle the current tab between tab and popup**.

You can also click the extension icon and open the options page, which links directly to Chrome's shortcut settings.

## Package for Chrome Web Store

```sh
npm run generate:icons
npm run generate:store-assets
npm run package
```

The uploadable ZIP will be created at `dist/popup-tab.zip`.

Store listing assets live in `store-assets/`.

## Public GitHub Repo

Create a public repo on GitHub, then connect this local project:

```sh
git remote add origin https://github.com/YOUR_USERNAME/popup-tab.git
git branch -M main
git push -u origin main
```

## Notes

Some protected Chrome pages, such as internal `chrome://` pages, may not be movable by extensions.
