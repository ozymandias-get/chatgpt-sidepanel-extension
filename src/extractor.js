import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * Master Web Page Content Extractor
 * Combines Mozilla Readability (Firefox Reader Engine), Turndown HTML-to-Markdown converter,
 * GFM Markdown Plugin (Tables, Code Blocks), site-specific DOM adapters (Gmail, YouTube, X/Twitter, etc.),
 * and intelligent multi-language i18n prompt formatting (Turkish / English).
 */
function extractPageContext() {
  try {
    const rawTitle = document.title || "Adsız Sayfa";
    const title = rawTitle.replace(/\s*(-|\||\/)\s*(YouTube|Gmail|Google|Twitter|X|LinkedIn|Facebook|Instagram|GitHub)$/i, "").trim();
    const url = location.href || "";
    const hostname = location.hostname.toLowerCase();
    const isYouTube = hostname.includes("youtube.com");
    const isGmail = hostname.includes("mail.google.com");
    const isX = hostname.includes("x.com") || hostname.includes("twitter.com");

    const lang = (navigator.language || "").toLowerCase();
    const isEn = lang.startsWith("en");

    let textContent = "";

    // 1. Specialized Web App Adapters
    if (isGmail) {
      const mainEl = document.querySelector("div[role='main'], .F[role='main'], div.UI") || document.body;
      textContent = cleanWebAppText(mainEl);
    } else if (isYouTube) {
      const mainEl = document.querySelector("#above-the-fold, ytd-watch-metadata, #primary-inner") || document.body;
      textContent = cleanWebAppText(mainEl);
    } else if (isX) {
      const mainEl = document.querySelector("div[data-testid='primaryColumn'], main[role='main']") || document.body;
      textContent = cleanWebAppText(mainEl);
    } else {
      // 2. Mozilla Readability Engine (Firefox Reader Mode Algorithm)
      try {
        const documentClone = document.cloneNode(true);
        
        // Strip noise nodes before passing to Readability
        const preStripSelectors = [
          "script", "style", "noscript", "svg", "iframe", "canvas",
          "nav", "footer", "aside",
          "[aria-hidden='true']", ".cookie-banner", "#cookie-banner", ".ad", ".ads",
          "#cookie-consent", ".cookie-popup", "[role='dialog']", ".social-share"
        ];
        preStripSelectors.forEach((selector) => {
          try {
            documentClone.querySelectorAll(selector).forEach((el) => el.remove());
          } catch (e) {}
        });

        const reader = new Readability(documentClone, {
          charThreshold: 20,
          keepClasses: false
        });
        const article = reader.parse();

        if (article && article.content) {
          const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-'
          });

          // Enable GitHub Flavored Markdown (Tables, Strikethrough, Task lists)
          try {
            turndownService.use(gfm);
          } catch (gfmErr) {}

          // Disable image tags in Markdown output to keep LLM prompt concise
          turndownService.addRule('no-images', {
            filter: ['img'],
            replacement: () => ''
          });

          textContent = turndownService.turndown(article.content);
        }
      } catch (readabilityErr) {
        console.warn("Readability parsing fallback:", readabilityErr);
      }

      // Fallback if Readability returned empty content or failed
      if (!textContent || textContent.trim().length < 60) {
        const mainEl = document.querySelector("main, article, [role='main'], #content, .content, .post-content, .article-body") || document.body;
        textContent = cleanWebAppText(mainEl);
      }
    }

    // 3. Post-Processing & Markdown Cleaning
    textContent = textContent
      .replace(/\[\s*\]\([^)]+\)/g, "") // Remove empty markdown links like [](url) or [\n](url)
      .replace(/^#+\s*$/gm, "")         // Remove empty Markdown headers like ##
      .replace(/\n{3,}/g, "\n\n")       // Collapse 3+ newlines to 2
      .trim();

    const truncateNote = isEn
      ? "\n\n...[Content truncated due to length]"
      : "\n\n...[İçeriğin devamı sığmadığı için kesildi]";

    if (textContent.length > 5000) {
      textContent = textContent.slice(0, 5000) + truncateNote;
    }

    const headerText = isEn ? "[Webpage Analysis]" : "[Web Sayfası Analizi]";
    const titleText = isEn ? "Title" : "Başlık";
    const linkText = isEn ? "Link" : "Bağlantı";
    const contentText = isEn ? "Page Content" : "Sayfa İçeriği";
    const closingText = isEn
      ? "Please analyze this webpage in detail and summarize it for me."
      : "Lütfen bu web sayfasını detaylı analiz et ve bana özetle.";

    let formattedPrompt = `${headerText}\n📌 ${titleText}: ${title}\n🔗 ${linkText}: ${url}\n\n📄 ${contentText}:\n${textContent}\n\n${closingText}`;

    return formattedPrompt;
  } catch (err) {
    return `[Web Sayfası Analizi]\nBaşlık: ${document.title}\nURL: ${location.href}\n\nSayfa metni ayıklanırken hata oluştu: ${err.message}`;
  }
}

function cleanWebAppText(rootEl) {
  if (!rootEl) return "";
  const clone = rootEl.cloneNode(true);

  const noiseSelectors = [
    "script", "style", "noscript", "svg", "iframe", "canvas",
    "nav", "footer", "header", "aside",
    "[aria-hidden='true']", ".cookie-banner", "#cookie-banner", ".ad", ".ads",
    "#cookie-consent", ".cookie-popup", "[role='dialog']",
    // YouTube noise
    "#related", "#comments", "#secondary", "ytd-watch-next-secondary-results-renderer",
    "ytd-merch-shelf-renderer", ".html5-video-player", ".ytp-chrome-bottom",
    "ytd-engagement-panel-section-list-renderer", "ytd-button-renderer",
    // Gmail noise
    ".G-atb", ".aeJ", ".aeN", "[role='toolbar']", "[role='navigation']", ".storage-info", ".quota",
    // X / Twitter noise
    "div[data-testid='sidebarColumn']", "div[data-testid='trending']",
    "[aria-label='Kimi takip etmeli']", "[aria-label='Gündemdekiler']",
    "[aria-label='Who to follow']", "[aria-label='Trends']",
    "[data-testid='keyboard-shortcuts']"
  ];

  noiseSelectors.forEach((selector) => {
    try {
      clone.querySelectorAll(selector).forEach((el) => el.remove());
    } catch (e) {}
  });

  const blockTags = new Set(["DIV", "P", "TR", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "SECTION", "ARTICLE", "HEADER", "FOOTER", "TABLE", "MAIN", "FORM"]);
  
  function extractBlockText(node) {
    let out = "";
    if (node.nodeType === 3) return node.nodeValue;
    if (node.nodeType !== 1) return "";

    const tagName = node.tagName.toUpperCase();
    if (node.style && (node.style.display === "none" || node.style.visibility === "hidden")) {
      return "";
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      out += extractBlockText(node.childNodes[i]);
    }

    if (blockTags.has(tagName)) {
      out = "\n" + out + "\n";
    }
    return out;
  }

  const rawText = extractBlockText(clone);

  const noisePhrases = [
    // Gmail UI noise
    "sekmeniz boş", "sekme eklemek veya çıkarmak", "ileti dizisinin önemli olduğunu öğretmek",
    "kotanın %", "son hesap etkinliği", "şartlar · gizlilik", "program politikaları",
    "herhangi bir ileti dizisi seçilmedi", "tümühiçbiriokunanlar", "dikey bölme", "yatay bölme",
    "bölme yok", "1 satırdan 1–1", "posta alınıyor", "diğer tanıtımlar e-postaları",
    "pazarlama, ilgi alanları", "onaylar, makbuzlar", "sosyal ağlardan",
    // YouTube UI noise
    "abone ol", "abone olundu", "beğen", "paylaş", "soru", "kaydet", "klip oluşturun",
    "daha fazla göster", "daha az göster", "iptal", "klibi paylaş", "sesi aç", "canlı",
    "sıradaki", "yakında", "şimdi oynat", "ücretli tanıtım içerir", "bilgi", "alışveriş",
    "videolar", "hakkında", "soru sorun", "yanıt alın, konuları keşfedin ve daha fazlasını yapın.",
    "kırpmaya reklam bittikten sonra devam edin", "reklam oynatılırken klip oluşturamazsınız",
    "herkese açık", "yorumlar", "tümü", "ilgili", "size özel", "son yüklenenler", "izlenenler",
    // X / Twitter UI noise
    "klavye kısayollarını", "keyboard_shortcuts", "who to follow", "gündemdekiler",
    "x'te canlı", "reklam", "claim your welcome bonus", "türkiye tarihinde gündemde",
    "spor · gündemdekiler"
  ];

  const rawLines = rawText.split(/\r?\n/);
  const cleanLines = [];
  let lastLine = "";

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim().replace(/\s+/g, " ");
    if (!line || line.length < 3) continue;

    const lower = line.toLowerCase();
    let isNoise = false;
    for (let j = 0; j < noisePhrases.length; j++) {
      if (lower.includes(noisePhrases[j])) {
        isNoise = true;
        break;
      }
    }
    if (isNoise) continue;

    if (/^(nan|nan \/ nan|\d+\/\d+|\d+\.\d+ saniye|\d+:\d+.*)$/i.test(line)) continue;
    if (/^\d+(\s*abone|\s*görüntüleme|\s*b|\s*mn|\s*beğeni)*$/i.test(line) && line.length < 20) continue;

    if (lastLine) {
      const overlapLen = Math.min(Math.min(line.length, lastLine.length), 22);
      if (overlapLen > 6 && line.slice(0, overlapLen) === lastLine.slice(0, overlapLen)) {
        if (line.length > lastLine.length) {
          cleanLines[cleanLines.length - 1] = line;
          lastLine = line;
        }
        continue;
      }
    }

    cleanLines.push(line);
    lastLine = line;
  }

  return cleanLines.join("\n");
}

if (typeof window !== "undefined") {
  window.extractPageContext = extractPageContext;
}

export { extractPageContext };
