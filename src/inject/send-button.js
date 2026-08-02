import { isVisible } from "./dom-utils.js";

export function findSendButton() {
  // 1. Scoped search inside form or composer container (Fastest)
  const composer = document.querySelector("form") || document.querySelector("main");
  const primarySelectors = [
    "button[data-testid='send-button']",
    "button[aria-label*='gönder' i]",
    "button[aria-label*='send' i]",
    "button[data-testid='composer-speech-button'] ~ button",
    "#prompt-textarea ~ button"
  ];

  const root = composer || document;
  for (let i = 0; i < primarySelectors.length; i++) {
    const el = root.querySelector(primarySelectors[i]);
    if (el && isVisible(el)) return el;
  }

  // 2. Scoped fallback inside composer only
  if (composer) {
    const buttons = composer.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const aria = (btn.getAttribute("aria-label") || "").toLowerCase();
      const testId = (btn.getAttribute("data-testid") || "").toLowerCase();
      if ((aria.includes("send") || aria.includes("gönder") || testId.includes("send")) && isVisible(btn)) {
        return btn;
      }
    }
  }

  return null;
}

export function isDisabled(el) {
  return (
    el.disabled === true ||
    el.getAttribute("aria-disabled") === "true" ||
    el.classList.contains("disabled") ||
    el.hasAttribute("data-disabled")
  );
}
