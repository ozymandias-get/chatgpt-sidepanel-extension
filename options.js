(function () {
  "use strict";

  const toggle = document.getElementById("auto-send");
  const statusMsg = document.getElementById("status");
  let statusTimer = null;

  function flashStatus() {
    if (!statusMsg) return;
    statusMsg.classList.add("show");
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      statusMsg.classList.remove("show");
    }, 2000);
  }

  async function load() {
    try {
      const { autoSend } = await chrome.storage.sync.get({ autoSend: true });
      toggle.checked = autoSend !== false;
    } catch (err) {
      console.error("Ayar okunamadı:", err);
    }
  }

  toggle?.addEventListener("change", () => {
    chrome.storage.sync.set({ autoSend: toggle.checked }).then(() => {
      flashStatus();
    }).catch((err) => {
      console.error("Ayar kaydedilemedi:", err);
    });
  });

  load();
})();
