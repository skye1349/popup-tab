chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "pop-current-tab") {
    return;
  }

  await toggleCurrentTab();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(getTabStateKey(tabId));
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

async function toggleCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id || tab.windowId === undefined) {
    return;
  }

  const currentWindow = await chrome.windows.get(tab.windowId);

  if (currentWindow.type === "popup") {
    await restorePopupTab(tab);
    return;
  }

  await popCurrentTab(tab, currentWindow);
}

async function popCurrentTab(tab, sourceWindow) {
  await chrome.storage.session.set({
    [getTabStateKey(tab.id)]: {
      sourceWindowId: tab.windowId,
      sourceIndex: tab.index
    }
  });

  const popupBounds = getPopupBounds(sourceWindow);

  await chrome.windows.create({
    tabId: tab.id,
    type: "popup",
    focused: true,
    ...popupBounds
  });
}

async function restorePopupTab(tab) {
  const stateKey = getTabStateKey(tab.id);
  const storedState = await chrome.storage.session.get(stateKey);
  const tabState = storedState[stateKey];
  const targetWindow = await getRestoreWindow(tabState?.sourceWindowId);

  if (!targetWindow?.id) {
    await chrome.windows.create({
      tabId: tab.id,
      type: "normal",
      focused: true
    });
    await chrome.storage.session.remove(stateKey);
    return;
  }

  const tabsInTargetWindow = await chrome.tabs.query({
    windowId: targetWindow.id
  });
  const targetIndex = clamp(
    tabState?.sourceIndex ?? tabsInTargetWindow.length,
    0,
    tabsInTargetWindow.length
  );

  await chrome.tabs.move(tab.id, {
    windowId: targetWindow.id,
    index: targetIndex
  });
  await chrome.windows.update(targetWindow.id, { focused: true });
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.storage.session.remove(stateKey);
}

async function getRestoreWindow(sourceWindowId) {
  if (sourceWindowId !== undefined) {
    try {
      const sourceWindow = await chrome.windows.get(sourceWindowId);
      if (sourceWindow.type === "normal") {
        return sourceWindow;
      }
    } catch {
      // The original window may have been closed while the tab was popped out.
    }
  }

  const normalWindows = await chrome.windows.getAll({
    windowTypes: ["normal"]
  });

  return normalWindows[0];
}

function getTabStateKey(tabId) {
  return `popup-tab:${tabId}`;
}

function getPopupBounds(sourceWindow) {
  const fallbackWidth = 1100;
  const fallbackHeight = 720;

  const sourceWidth = sourceWindow.width ?? fallbackWidth;
  const sourceHeight = sourceWindow.height ?? fallbackHeight;
  const width = clamp(Math.round(sourceWidth * 0.82), 640, 1400);
  const height = clamp(Math.round(sourceHeight * 0.82), 480, 1000);

  const sourceLeft = sourceWindow.left ?? 80;
  const sourceTop = sourceWindow.top ?? 80;
  const left = sourceLeft + Math.max(24, Math.round((sourceWidth - width) / 2));
  const top = sourceTop + Math.max(24, Math.round((sourceHeight - height) / 2));

  return { left, top, width, height };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
