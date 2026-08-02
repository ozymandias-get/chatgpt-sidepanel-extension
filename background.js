import { enablePanelBehavior, openSidePanel } from "./src/background/panel-manager.js";
import { setupContextMenu, handleContextMenuClick } from "./src/background/context-menu.js";

chrome.runtime.onInstalled.addListener(() => {
  enablePanelBehavior();
  setupContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  enablePanelBehavior();
});

chrome.action.onClicked.addListener((tab) => {
  const windowId = tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;
  openSidePanel(windowId);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleContextMenuClick(info, tab);
});
