/**
 * Native Chrome Extension i18n Translation Engine for Sidepanel
 */
export function applyI18n() {
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
