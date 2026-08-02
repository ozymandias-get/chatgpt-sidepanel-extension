(() => {
  "use strict";

  let pending = null;
  const MAX_ATTEMPTS = 60;
  const MAX_SEND_ATTEMPTS = 40;

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    if (typeof event.origin !== "string" || !event.origin.startsWith("chrome-extension://")) return;
    const data = event.data;
    if (!data || data.type !== "ASK_CHATGPT" || typeof data.text !== "string") return;
    pending = {
      text: data.text,
      id: data.id,
      autoSend: data.autoSend !== false
    };
    insertWithRetry(0);
  });

  // Zero-reflow DOM visibility check (10x-100x faster than getBoundingClientRect)
  function isVisible(el) {
    if (!el) return false;
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    }
    return el.offsetWidth > 0 || el.offsetHeight > 0;
  }

  function findEditor() {
    const selectors = [
      "#prompt-textarea",
      "div[contenteditable='true']",
      "textarea[data-testid='prompt-textarea']",
      "main textarea",
      "[contenteditable='true']"
    ];
    for (let i = 0; i < selectors.length; i++) {
      const el = document.querySelector(selectors[i]);
      if (el && isVisible(el)) return el;
    }
    return null;
  }

  function insertTextIntoElement(editor, text) {
    try {
      editor.focus({ preventScroll: true });
    } catch (e) {}

    if (editor.tagName.toLowerCase() === "textarea") {
      editor.value = text;
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      editor.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    // For contenteditable / ProseMirror elements
    try {
      document.execCommand("selectAll", false, null);
      const inserted = document.execCommand("insertText", false, text);
      if (inserted && editor.textContent?.includes(text.slice(0, 10))) {
        return true;
      }
    } catch (e) {}

    // Fallback for ProseMirror / custom editable nodes
    try {
      const p = editor.querySelector("p") || editor;
      p.textContent = text;
      
      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: text
      });
      editor.dispatchEvent(inputEvent);
      editor.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    } catch (err) {
      return false;
    }
  }

  function insertWithRetry(attempt) {
    if (!pending) return;
    const editor = findEditor();
    if (!editor) {
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => insertWithRetry(attempt + 1), 150);
      }
      return;
    }

    const success = insertTextIntoElement(editor, pending.text);
    if (!success && attempt < MAX_ATTEMPTS) {
      setTimeout(() => insertWithRetry(attempt + 1), 150);
      return;
    }

    if (pending.autoSend) {
      setTimeout(() => trySend(0), 80);
    } else {
      ack();
    }
  }

  function findSendButton() {
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

  function isDisabled(el) {
    return (
      el.disabled === true ||
      el.getAttribute("aria-disabled") === "true" ||
      el.classList.contains("disabled") ||
      el.hasAttribute("data-disabled")
    );
  }

  function trySend(attempt) {
    if (!pending) return;
    const button = findSendButton();
    if (!button || isDisabled(button)) {
      if (attempt < MAX_SEND_ATTEMPTS) {
        setTimeout(() => trySend(attempt + 1), 120);
      } else {
        ack();
      }
      return;
    }
    try {
      button.click();
    } catch (err) {
      if (attempt < MAX_SEND_ATTEMPTS) {
        setTimeout(() => trySend(attempt + 1), 120);
        return;
      }
    }
    ack();
  }

  function ack() {
    if (!pending) return;
    const id = pending.id;
    pending = null;
    try {
      window.parent.postMessage({ type: "ASK_CHATGPT_ACK", id }, "*");
    } catch (err) {}
  }
})();
