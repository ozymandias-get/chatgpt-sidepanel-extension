/**
 * Sidepanel Manager for Background Service Worker
 */

export async function enablePanelBehavior() {
  try {
    if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === "function") {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (err) {
    console.warn("Panel davranışı ayarlanamadı:", err);
  }
}

export function openSidePanel(windowId) {
  const targetWindowId = windowId ?? chrome.windows.WINDOW_ID_CURRENT;
  if (chrome.sidePanel && typeof chrome.sidePanel.open === "function") {
    chrome.sidePanel.open({ windowId: targetWindowId }).catch(() => {});
  }
}
