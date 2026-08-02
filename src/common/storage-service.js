/**
 * Storage service wrapper for chrome.storage APIs
 */

export async function getAutoSendSetting() {
  try {
    const { autoSend } = await chrome.storage.sync.get({ autoSend: true });
    return autoSend !== false;
  } catch (err) {
    console.error("Storage error getting autoSend:", err);
    return true;
  }
}

export async function setAutoSendSetting(value) {
  try {
    await chrome.storage.sync.set({ autoSend: Boolean(value) });
    return true;
  } catch (err) {
    console.error("Storage error setting autoSend:", err);
    return false;
  }
}

export async function setPendingAsk(text) {
  try {
    await chrome.storage.local.set({ pendingAsk: { text, ts: Date.now() } });
  } catch (err) {
    console.error("Storage error setting pendingAsk:", err);
  }
}

export async function getPendingAsk() {
  try {
    const { pendingAsk } = await chrome.storage.local.get("pendingAsk");
    return pendingAsk || null;
  } catch (err) {
    console.error("Storage error getting pendingAsk:", err);
    return null;
  }
}

export async function clearPendingAsk() {
  try {
    await chrome.storage.local.remove("pendingAsk");
  } catch (err) {
    console.error("Storage error clearing pendingAsk:", err);
  }
}
