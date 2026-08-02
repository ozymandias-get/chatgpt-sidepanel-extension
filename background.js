const ASK_MENU_ID = "ask-chatgpt";
const ASK_PAGE_MENU_ID = "ask-page-chatgpt";

async function enablePanelBehavior() {
  try {
    if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === "function") {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (err) {
    console.warn("Panel davranışı ayarlanamadı:", err);
  }
}

function setupContextMenu() {
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

chrome.runtime.onInstalled.addListener(() => {
  enablePanelBehavior();
  setupContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  enablePanelBehavior();
});

chrome.action.onClicked.addListener((tab) => {
  const windowId = tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;
  chrome.sidePanel.open({ windowId }).catch(() => {});
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const windowId = tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;

  if (info.menuItemId === ASK_MENU_ID) {
    const text = (info.selectionText || "").trim();
    if (!text) return;

    chrome.sidePanel.open({ windowId }).catch(() => {});
    chrome.storage.local.set({ pendingAsk: { text, ts: Date.now() } }).catch(() => {});
  } else if (info.menuItemId === ASK_PAGE_MENU_ID) {
    if (!tab || !tab.id) return;

    chrome.sidePanel.open({ windowId }).catch(() => {});

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
        chrome.storage.local.set({ pendingAsk: { text: promptText, ts: Date.now() } }).catch(() => {});
      }
    } catch (err) {
      console.error("Sayfa analizi başlatılamadı:", err);
    }
  }
});
