import { isVisible } from "./dom-utils.js";

export function findEditor() {
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

export function insertTextIntoElement(editor, text) {
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
