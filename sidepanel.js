(function () {
  "use strict";

  const IFRAME_URL = "https://chatgpt.com/";
  const LOAD_TIMEOUT_MS = 20000;
  const MAX_RETRIES = 1;
  const ASK_DELIVERY_ATTEMPTS = 20;
  const ASK_DELIVERY_INTERVAL_MS = 1000;

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
  let currentAskId = null;
  let askTimer = null;
  let toastTimer = null;

  // Native Chrome Extension i18n Translation Engine
  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const msg = chrome.i18n.getMessage(key);
      if (msg) {
        if (el.children.length > 0) {
          const textNode = Array.from(el.childNodes).find((n) => n.nodeType === 3);
          if (textNode) textNode.nodeValue = msg;
          else el.append(msg);
        } else {
          el.textContent = msg;
        }
      }
    });

    document.querySelectorAll("[data-i18n-tooltip]").forEach((el) => {
      const key = el.getAttribute("data-i18n-tooltip");
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.setAttribute("data-tooltip", msg);
    });
  }

  function showLoading() {
    errorOverlay.classList.add("hidden");
    loading.classList.remove("hidden");
  }

  function showError() {
    loading.classList.add("hidden");
    errorOverlay.classList.remove("hidden");
  }

  function showToast(message) {
    if (!toast) return;
    if (message) {
      const span = toast.querySelector("span");
      if (span) span.textContent = message;
    }
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  function startTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (loading && !loading.classList.contains("hidden")) {
        showError();
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
    showLoading();
    startTimer();
    iframe.src = IFRAME_URL;
  }

  function openInTab() {
    chrome.tabs.create({ url: IFRAME_URL });
  }

  iframe.addEventListener("load", () => {
    clearTimer();
    loading.classList.add("hidden");
    errorOverlay.classList.add("hidden");
  });

  iframe.addEventListener("error", () => {
    clearTimer();
    if (retries < MAX_RETRIES) {
      retries += 1;
      load();
    } else {
      showError();
    }
  });

  newChatBtn?.addEventListener("click", () => {
    showLoading();
    startTimer();
    iframe.src = IFRAME_URL;
  });

  reloadBtn?.addEventListener("click", () => {
    showLoading();
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

  async function handleSendPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        showToast(chrome.i18n.getMessage("noTabFound") || "Aktif sekme bulunamadı");
        return;
      }

      const url = tab.url || "";
      if (
        url.startsWith("chrome://") ||
        url.startsWith("edge://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("about:") ||
        url.startsWith("view-source:")
      ) {
        showToast(chrome.i18n.getMessage("internalPagesBlocked") || "Tarayıcı iç sayfaları aktarılamaz");
        return;
      }

      showToast(chrome.i18n.getMessage("toastExtracting") || "Sayfa içeriği ayıklanıyor...");

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
        deliverToChatGPT(promptText);
      } else {
        showToast(chrome.i18n.getMessage("cannotExtractText") || "Sayfa metni alınamadı");
      }
    } catch (err) {
      console.error("Sayfa aktarılamadı:", err);
      showToast(chrome.i18n.getMessage("extractError") || "Sayfa aktarılamadı (Eklentiyi yenileyin)");
    }
  }

  sendPageBtn?.addEventListener("click", handleSendPage);

  function updateAutoSendTooltip(isChecked) {
    if (autoSendWrapper) {
      const key = isChecked ? "autoSendOn" : "autoSendOff";
      const fallback = isChecked ? "Otomatik Gönder: Açık" : "Otomatik Gönder: Kapalı";
      autoSendWrapper.setAttribute("data-tooltip", chrome.i18n.getMessage(key) || fallback);
    }
  }

  async function initAutoSendToggle() {
    try {
      const { autoSend } = await chrome.storage.sync.get({ autoSend: true });
      const isChecked = autoSend !== false;
      if (autoSendToggle) autoSendToggle.checked = isChecked;
      updateAutoSendTooltip(isChecked);
    } catch (err) {
      console.error("Otomatik gönder ayarı okunamadı:", err);
    }
  }

  autoSendToggle?.addEventListener("change", () => {
    const isChecked = autoSendToggle.checked;
    updateAutoSendTooltip(isChecked);
    chrome.storage.sync.set({ autoSend: isChecked }).then(() => {
      const key = isChecked ? "autoSendOn" : "autoSendOff";
      const fallback = isChecked ? "Otomatik gönderim açık" : "Otomatik gönderim kapalı";
      showToast(chrome.i18n.getMessage(key) || fallback);
    }).catch((err) => {
      console.error("Ayar kaydedilemedi:", err);
    });
  });

  async function deliverToChatGPT(text) {
    let autoSend = true;
    try {
      const settings = await chrome.storage.sync.get({ autoSend: true });
      autoSend = settings.autoSend !== false;
    } catch (err) {
      console.error("Ayar okunamadı:", err);
    }

    showToast(chrome.i18n.getMessage("toastTransferring") || "Metin ChatGPT'ye aktarılıyor...");

    const id = "ask-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    currentAskId = id;
    let attempt = 0;

    const send = () => {
      if (currentAskId !== id) return;
      attempt += 1;
      try {
        iframe.contentWindow.postMessage(
          { type: "ASK_CHATGPT", text, id, autoSend },
          "https://chatgpt.com"
        );
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

  window.addEventListener("message", (event) => {
    if (event.source !== iframe.contentWindow) return;
    const data = event.data;
    if (data && data.type === "ASK_CHATGPT_ACK" && data.id && data.id === currentAskId) {
      currentAskId = null;
      if (askTimer) {
        clearTimeout(askTimer);
        askTimer = null;
      }
      showToast(chrome.i18n.getMessage("toastTextTransferred") || "Metin ChatGPT'ye aktarıldı");
    }
  });

  async function checkPendingAsk() {
    try {
      const { pendingAsk } = await chrome.storage.local.get("pendingAsk");
      if (!pendingAsk || typeof pendingAsk.text !== "string" || !pendingAsk.text) return;
      await chrome.storage.local.remove("pendingAsk");
      deliverToChatGPT(pendingAsk.text);
    } catch (err) {
      console.error("Bekleyen soru okunamadı:", err);
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.pendingAsk || !changes.pendingAsk.newValue) return;
    const value = changes.pendingAsk.newValue;
    chrome.storage.local.remove("pendingAsk").catch(() => {});
    if (value && typeof value.text === "string" && value.text) {
      deliverToChatGPT(value.text);
    }
  });

  // Performance optimization: prevent iframe layout thrashing & IPC drag lag during panel resize
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!iframe) return;
    iframe.style.pointerEvents = "none";
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      iframe.style.pointerEvents = "auto";
    }, 150);
  });

  // Initialize
  applyI18n();
  initAutoSendToggle();
  checkPendingAsk();
  load();
})();
