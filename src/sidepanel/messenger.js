import { ASK_DELIVERY_ATTEMPTS, ASK_DELIVERY_INTERVAL_MS } from "../common/constants.js";
import { getAutoSendSetting } from "../common/storage-service.js";
import { showToast } from "./ui-manager.js";

let currentAskId = null;
let askTimer = null;

export async function deliverToChatGPT(iframeEl, toastEl, text) {
  const autoSend = await getAutoSendSetting();
  showToast(toastEl, chrome.i18n.getMessage("toastTransferring") || "Metin ChatGPT'ye aktarılıyor...");

  const id = "ask-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  currentAskId = id;
  let attempt = 0;

  const send = () => {
    if (currentAskId !== id) return;
    attempt += 1;
    try {
      if (iframeEl && iframeEl.contentWindow) {
        iframeEl.contentWindow.postMessage(
          { type: "ASK_CHATGPT", text, id, autoSend },
          "*"
        );
      }
    } catch (err) {
      if (askTimer) clearTimeout(askTimer);
      askTimer = null;
      return;
    }

    if (attempt < ASK_DELIVERY_ATTEMPTS) {
      askTimer = setTimeout(send, ASK_DELIVERY_INTERVAL_MS);
    } else {
      askTimer = null;
    }
  };

  send();
}

export function listenForAck(iframeEl, toastEl) {
  window.addEventListener("message", (event) => {
    if (event.source !== iframeEl.contentWindow) return;
    const data = event.data;
    if (data && data.type === "ASK_CHATGPT_ACK" && data.id && data.id === currentAskId) {
      currentAskId = null;
      if (askTimer) {
        clearTimeout(askTimer);
        askTimer = null;
      }
      showToast(toastEl, chrome.i18n.getMessage("toastTextTransferred") || "Metin ChatGPT'ye aktarıldı");
    }
  });
}
