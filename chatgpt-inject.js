(async () => {
  "use strict";

  const { findEditor, insertTextIntoElement } = await import(chrome.runtime.getURL("src/inject/editor-inserter.js"));
  const { findSendButton, isDisabled } = await import(chrome.runtime.getURL("src/inject/send-button.js"));

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
