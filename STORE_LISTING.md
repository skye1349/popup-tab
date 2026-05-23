# Chrome Web Store Listing Draft

## Name

Popup Tab

## Short Description

Toggle the active tab between a regular Chrome tab and a popup window.

## Detailed Description

Popup Tab gives you a fast keyboard shortcut for turning the current Chrome tab into a focused popup window, then restoring it back into a normal tab when you are done.

Use it for video calls, dashboards, docs, music players, timers, or any page you want to keep separate without losing the ability to bring it back into your tab strip.

Features:

- Toggle the active tab into a popup window.
- Toggle the popup window back into a normal tab.
- Restore to the original Chrome window and tab position when possible.
- Customize the shortcut in Chrome's extension shortcut settings.
- No analytics, tracking, or remote network requests.

## Suggested Category

Productivity

## Privacy Disclosure Notes

Popup Tab does not collect or transmit user data. The `tabs` permission is used to move the active tab between window types. The `storage` permission is used only for session-scoped restore state.

## Permission Justifications

### tabs

Required to identify the active tab and move it between a normal Chrome window and a popup window.

### storage

Required to store session-only restore state, including the original window ID and tab index while a tab is popped out.

## Remote Code

No remote code is used.

## Data Collection

No user data is collected.

## Required Listing Images

- Extension icon: `icons/icon-128.png`
- Small promotional image: `store-assets/small-promo-440x280.png`
- Screenshot: `store-assets/screenshot-options-1280x800.png`
