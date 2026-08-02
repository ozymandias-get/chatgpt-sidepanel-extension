import { IFRAME_URL, LOAD_TIMEOUT_MS, MAX_RETRIES } from "./src/common/constants.js";
import { getAutoSendSetting, setAutoSendSetting, getPendingAsk, clearPendingAsk } from "./src/common/storage-service.js";
import { applyI18n } from "./src/sidepanel/i18n-manager.js";
import { showLoading, showError, showToast, updateAutoSendTooltip, setupResizeOptimization } from "./src/sidepanel/ui-manager.js";
import { deliverToChatGPT, listenForAck } from "./src/sidepanel/messenger.js";
import { handleSendPage } from "./src/sidepanel/page-handler.js";

(function () {
  "use strict";

  const iframe = document.getElementById("chatgpt");
  const loading = document.getElementById("loading");
  const errorOverlay = document.getElementById("error");
  const toast = document.getElementById("toast");

  const newChatBtn = document.getElementById("new-chat");
  const reloadBtn = document.getElementById("reload");
  const openTabBtn = document.getElementById("open-tab");
  const retryBtn = document.getElementById("retry");
  const openTabErrorBtn = document.getElementById("open-tab-error");
  const sendPageBtn = document.getElementById("send-page");

  const autoSendToggle = document.getElementById("auto-send-toggle");
  const autoSendWrapper = document.getElementById("auto-send-wrapper");

  let timer = null;
  let retries = 0;

  function startTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (loading && !loading.classList.contains("hidden")) {
        showError(loading, errorOverlay);
      }
    }, LOAD_TIMEOUT_MS);
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function load() {
    showLoading(loading, errorOverlay);
    startTimer();
    iframe.src = IFRAME_URL;
  }

  function openInTab() {
    chrome.tabs.create({ url: IFRAME_URL });
  }

  iframe?.addEventListener("load", () => {
    clearTimer();
    loading?.classList.add("hidden");
    errorOverlay?.classList.add("hidden");
  });

  iframe?.addEventListener("error", () => {
    clearTimer();
    if (retries < MAX_RETRIES) {
      retries += 1;
      load();
    } else {
      showError(loading, errorOverlay);
    }
  });

  newChatBtn?.addEventListener("click", () => {
    showLoading(loading, errorOverlay);
    startTimer();
    iframe.src = IFRAME_URL;
  });

  reloadBtn?.addEventListener("click", () => {
    showLoading(loading, errorOverlay);
    startTimer();
    try {
      iframe.contentWindow.location.reload();
    } catch (err) {
      iframe.src = IFRAME_URL;
    }
  });

  retryBtn?.addEventListener("click", () => {
    retries = 0;
    load();
  });

  openTabBtn?.addEventListener("click", openInTab);
  openTabErrorBtn?.addEventListener("click", openInTab);

  sendPageBtn?.addEventListener("click", () => {
    handleSendPage((text) => deliverToChatGPT(iframe, toast, text), toast);
  });

  async function initAutoSendToggle() {
    const isChecked = await getAutoSendSetting();
    if (autoSendToggle) autoSendToggle.checked = isChecked;
    updateAutoSendTooltip(autoSendWrapper, isChecked);
  }

  autoSendToggle?.addEventListener("change", async () => {
    const isChecked = autoSendToggle.checked;
    updateAutoSendTooltip(autoSendWrapper, isChecked);
    const success = await setAutoSendSetting(isChecked);
    if (success) {
      const key = isChecked ? "autoSendOn" : "autoSendOff";
      const fallback = isChecked ? "Otomatik gönderim açık" : "Otomatik gönderim kapalı";
      showToast(toast, chrome.i18n.getMessage(key) || fallback);
    }
  });

  async function checkPendingAsk() {
    const pendingAsk = await getPendingAsk();
    if (!pendingAsk || typeof pendingAsk.text !== "string" || !pendingAsk.text) return;
    await clearPendingAsk();
    deliverToChatGPT(iframe, toast, pendingAsk.text);
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.pendingAsk || !changes.pendingAsk.newValue) return;
    const value = changes.pendingAsk.newValue;
    clearPendingAsk();
    if (value && typeof value.text === "string" && value.text) {
      deliverToChatGPT(iframe, toast, value.text);
    }
  });

  // Initialize
  applyI18n();
  initAutoSendToggle();
  listenForAck(iframe, toast);
  setupResizeOptimization(iframe);
  checkPendingAsk();
  load();
})();
