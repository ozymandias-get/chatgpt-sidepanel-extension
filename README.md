[🇹🇷 Türkçe Dokümantasyon için tıklayın (README_TR.md)](./README_TR.md)

---

# 🤖 ChatGPT Chrome Side Panel & Smart Web Extractor

> [!CAUTION]
> **DISCLAIMER & LEGAL NOTICE**  
> This extension is **NOT an official product or official extension of OpenAI or ChatGPT**. It is an independent, open-source productivity tool developed to embed ChatGPT's web interface into Chrome's native side panel. All product names, logos, and brands are property of their respective owners.

[![Chrome Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/version-1.4-blue.svg)](./manifest.json)
[![Direct Download](https://img.shields.io/badge/Download-v1.4%20ZIP-green.svg)](https://github.com/ozymandias-get/chatgpt-sidepanel-extension/releases/download/v1.4/chatgpt-sidepanel-extension-v1.4.zip)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](./README.md#license)

---

## 📦 Direct Download & Quick Installation (Recommended)

To install and use the extension immediately without building source code:

1. 📥 **[Download Latest Release ZIP (v1.4 ZIP)](https://github.com/ozymandias-get/chatgpt-sidepanel-extension/releases/download/v1.4/chatgpt-sidepanel-extension-v1.4.zip)**  
   *(Or visit the [Releases Page](https://github.com/ozymandias-get/chatgpt-sidepanel-extension/releases/latest) to grab `chatgpt-sidepanel-extension-v1.4.zip`).*
2. 📂 Extract the `.zip` file to any folder on your computer.
3. 🌐 Open Chrome and navigate to `chrome://extensions`.
4. ⚙️ Enable **Developer Mode** toggle in the top-right corner.
5. 📁 Click **Load unpacked** in the top-left corner and select the extracted folder.
6. 🎉 **Done!** Press `Alt+Shift+C` to open the side panel and start chatting!

---

## 🌟 Why Use This Extension?

1. **No More Tab Switching**: ChatGPT stays right beside your active browsing workspace in a smooth, resizable side panel.
2. **Noise-Free Content Extraction**: Automatically strips ads, banners, navigation menus, cookie popups, and footers. Only the core article/content body is extracted and sent to ChatGPT.
3. **Preserves Tables & Code Blocks**: Technical specification tables, e-commerce product comparison tables, and code snippets are preserved in clean GitHub-Flavored Markdown.
4. **Seamless ChatGPT Dark UI Theme**: Styled to match ChatGPT's official `#212121` and `#171717` dark mode theme seamlessly.

---

## 🚀 Key Features

### ⚡ 1. Instant Side Panel & Hotkey Support
- Press `Alt+Shift+C` or click the toolbar icon to toggle the side panel instantly.
- Optimized for smooth resizing with GPU layer isolation and iframe containment (no dragging lag or layout thrashing).

### 🧹 2. Mozilla Readability & GFM Markdown Engine
- Built on Firefox's official **`@mozilla/readability`** engine.
- Converts extracted HTML into **GitHub Flavored Markdown (GFM)** using `turndown-plugin-gfm`.
- Markdown tables (`| Header |`), code blocks (```code```), and bullet lists are preserved with 100% fidelity.

### 🎯 3. Specialized Web App Adapters
- **Gmail Adapter**: Extracts active email body or inbox threads while stripping empty tab placeholders (`Primary tab is empty...`) and storage/quota footers.
- **YouTube Adapter**: Extracts video title, channel name, and description while omitting player overlays and comment sections.
- **X (Twitter) Adapter**: Extracts clean timeline tweets while stripping trending sidebars (`Who to follow`, `Trends`), keyboard shortcut popups, and ads.

### 🌐 4. Native Turkish & English Support (i18n)
- Automatically adapts UI labels, tooltips, context menus, and prompt headers based on your Chrome browser language settings (**Turkish** or **English**).

---

## 🖱️ How to Use

| Action | How to Trigger |
|---|---|
| **Toggle Side Panel** | Press `Alt + Shift + C` or click the toolbar icon. |
| **Send Web Page Content** | Click the 📄 **Send Page** icon in the side panel topbar. |
| **Send Selected Text** | Highlight text on any page, right-click, and select **Send Selected Text to ChatGPT**. |
| **Analyze Current Page** | Right-click anywhere on a webpage and select **Analyze Current Page with ChatGPT**. |
| **Toggle Auto Send** | Click the **Auto Send** switch in the topbar header. |
| **Start New Chat** | Click the ➕ **New Chat** button in the topbar header. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt + Shift + C` | Open / Close ChatGPT Side Panel |

---

## 📂 Project Directory Structure

```
chatgpt-sidepanel-extension/
├── _locales/
│   ├── tr/messages.json       # Turkish locale strings
│   └── en/messages.json       # English locale strings
├── icons/
│   ├── chatgpt_official.svg   # Official OpenAI vector logo
│   ├── icon16.png             # 16px extension icon
│   ├── icon32.png             # 32px extension icon
│   ├── icon48.png             # 48px extension icon
│   └── icon128.png            # 128px extension icon
├── src/
│   └── extractor.js           # Mozilla Readability & Turndown source code
├── background.js              # Service Worker & Context menu controller
├── sidepanel.html             # Topbar header & iframe layout
├── sidepanel.js               # Side panel UI controller & IPC messaging
├── dom-extractor.js           # Bundled 119 KB high-performance extractor
├── chatgpt-inject.js          # ChatGPT iframe injection script
├── rules.json                 # DeclarativeNetRequest rules
├── manifest.json              # Extension Manifest V3 configuration
├── README.md                  # English master documentation
└── README_TR.md               # Turkish master documentation
```

---

## 📜 License

This project is licensed under the [MIT License](./README.md#license).
