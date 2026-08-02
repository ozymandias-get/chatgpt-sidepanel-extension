import { isRestrictedUrl } from "../common/utils.js";
import { showToast } from "./ui-manager.js";

export async function handleSendPage(deliverCallback, toastEl) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showToast(toastEl, chrome.i18n.getMessage("noTabFound") || "Aktif sekme bulunamadı");
      return;
    }

    const url = tab.url || "";
    if (isRestrictedUrl(url)) {
      showToast(toastEl, chrome.i18n.getMessage("internalPagesBlocked") || "Tarayıcı iç sayfaları aktarılamaz");
      return;
    }

    showToast(toastEl, chrome.i18n.getMessage("toastExtracting") || "Sayfa içeriği ayıklanıyor...");

    // 1. Inject bundled Mozilla Readability + Turndown engine
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["dom-extractor.js"]
    });

    // 2. Execute extraction
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (typeof window.extractPageContext === "function" ? window.extractPageContext() : "")
    });

    const promptText = response?.result;
    if (promptText && typeof promptText === "string" && promptText.trim().length > 0) {
      deliverCallback(promptText);
    } else {
      showToast(toastEl, chrome.i18n.getMessage("cannotExtractText") || "Sayfa metni alınamadı");
    }
  } catch (err) {
    console.warn("Sayfa aktarılamadı:", err);
    showToast(toastEl, chrome.i18n.getMessage("extractError") || "Sayfa aktarılamadı (Eklentiyi yenileyin)");
  }
}
