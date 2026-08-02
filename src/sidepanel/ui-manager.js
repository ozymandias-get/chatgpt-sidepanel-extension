/**
 * UI Manager for Toast Notifications, Overlays, and Tooltips in Sidepanel
 */

let toastTimer = null;

export function showLoading(loadingEl, errorOverlayEl) {
  errorOverlayEl.classList.add("hidden");
  loadingEl.classList.remove("hidden");
}

export function showError(loadingEl, errorOverlayEl) {
  loadingEl.classList.add("hidden");
  errorOverlayEl.classList.remove("hidden");
}

export function hideOverlays(loadingEl, errorOverlayEl) {
  loadingEl.classList.add("hidden");
  errorOverlayEl.classList.add("hidden");
}

export function showToast(toastEl, message) {
  if (!toastEl) return;
  if (message) {
    const span = toastEl.querySelector("span");
    if (span) span.textContent = message;
  }
  toastEl.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2800);
}

export function updateAutoSendTooltip(autoSendWrapperEl, isChecked) {
  if (autoSendWrapperEl) {
    const key = isChecked ? "autoSendOn" : "autoSendOff";
    const fallback = isChecked ? "Otomatik Gönder: Açık" : "Otomatik Gönder: Kapalı";
    autoSendWrapperEl.setAttribute("data-tooltip", chrome.i18n.getMessage(key) || fallback);
  }
}

export function setupResizeOptimization(iframeEl) {
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!iframeEl) return;
    iframeEl.style.pointerEvents = "none";
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      iframeEl.style.pointerEvents = "auto";
    }, 150);
  });
}
