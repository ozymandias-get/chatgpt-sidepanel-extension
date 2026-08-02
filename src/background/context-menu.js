import { ASK_MENU_ID, ASK_PAGE_MENU_ID } from "../common/constants.js";
import { isRestrictedUrl } from "../common/utils.js";
import { setPendingAsk } from "../common/storage-service.js";
import { openSidePanel } from "./panel-manager.js";

export function setupContextMenu() {
  const askTextTitle = chrome.i18n.getMessage("contextMenuAskText") || "Seçili Metni ChatGPT'ye Gönder";
  const askPageTitle = chrome.i18n.getMessage("contextMenuAskPage") || "Mevcut Sayfayı ChatGPT ile Analiz Et";

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: ASK_MENU_ID,
      title: askTextTitle,
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: ASK_PAGE_MENU_ID,
      title: askPageTitle,
      contexts: ["page"]
    });
  });
}

export async function handleContextMenuClick(info, tab) {
  const windowId = tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;

  if (info.menuItemId === ASK_MENU_ID) {
    const text = (info.selectionText || "").trim();
    if (!text) return;

    openSidePanel(windowId);
    await setPendingAsk(text);
  } else if (info.menuItemId === ASK_PAGE_MENU_ID) {
    if (!tab || !tab.id) return;

    const url = tab.url || info.pageUrl || "";
    if (isRestrictedUrl(url)) return;

    openSidePanel(windowId);

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["dom-extractor.js"]
      });

      const [response] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => (typeof window.extractPageContext === "function" ? window.extractPageContext() : "")
      });

      const promptText = response?.result;
      if (promptText && typeof promptText === "string" && promptText.trim().length > 0) {
        await setPendingAsk(promptText);
      }
    } catch (err) {
      console.warn("Sayfa analizi başlatılamadı:", err);
    }
  }
}
