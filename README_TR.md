[🇬🇧 For English Documentation click here (README.md)](./README.md)

---

# 🤖 ChatGPT Chrome Kenar Paneli ve Akıllı Web Sayfası Ayıklayıcısı

[![Chrome Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Sürüm](https://img.shields.io/badge/sürüm-1.4-blue.svg)](./manifest.json)
[![Lisans](https://img.shields.io/badge/lisans-MIT-orange.svg)](./README_TR.md#lisans)
[![Dil Desteği](https://img.shields.io/badge/dil-Türkçe%20%7C%20English-purple.svg)](./_locales/)

**ChatGPT Kenar Paneli**, Google Chrome üzerinde gezinirken tek bir klavye kısayolu (`Alt+Shift+C`) veya tarayıcı simgesiyle ChatGPT'yi yan panelde anında açmanızı sağlayan; web sayfalarının, haberlerin, e-postaların ve sosyal medya akışlarının içeriğini **Mozilla Readability** motoruyla çöplerden arındırıp **Markdown** formatında ChatGPT'ye aktaran gelişmiş bir Chrome uzantısıdır (Manifest V3).

---

## 🌟 Neden Bu Eklenti?

Klasik eklentilerin aksine bu proje:
1. **Sekme Değiştirme Derdine Son Verir**: ChatGPT ekranı her zaman tarayıcının sağ kenarında sabit veya açılır kapa formda yanınızdadır.
2. **Web Sayfalarını Çöpsüz Aktarır**: Web sitelerindeki reklamlar, çerez pencereleri, yan menüler ve alt bilgiler elenir. ChatGPT'ye yalnızca sayfanın gerçek makale/içerik gövdesi gönderilir.
3. **Tablo ve Kod Bloklarını Korumaktadır**: E-ticaret ürün karşılaştırmaları, teknik özellik tabloları ve yazılım kodları Markdown formatında bozulmadan iletilir.
4. **Resmi ChatGPT Temasıyla Uumludur**: ChatGPT'nin orijinal koyu teması (`#212121` ve `#171717`) ile birebir estetik uyum sağlar.

---

## 🚀 Öne Çıkan Özellikler

### ⚡ 1. Anında Kenar Paneli (Side Panel)
- `Alt+Shift+C` kısayolu ile panel anında açılır/kapanır.
- Panel boyutlandırılırken veya kapatılırken kasma/takılma yapmaz (GPU katman izolasyonu ve sürükleme optimizasyonu uygulanmıştır).

### 🧹 2. Mozilla Readability & GFM Markdown Motoru
- Firefox'un resmi okuyucu modu olan **`@mozilla/readability`** motorunu kullanır.
- Ayıklanan içeriği **GitHub Flavored Markdown (GFM)** formatına dönüştürür.
- Tablolar (`| Başlık |`), kod blokları (```code```) ve listeler kusursuz korunur.

### 🎯 3. Özel Web Uygulaması Adaptörleri
- **Gmail Adaptörü**: Gelen kutusunu veya e-posta mesajını tararken `Birincil sekmeniz boş...`, `5.120 GB kotanın...` gibi boş sekme doldurma yazılarını ve kota dipnotlarını %100 temizler.
- **YouTube Adaptörü**: Video başlığı, kanalı ve açıklamasını ayıklar; oynatıcı ve yorum çöplerini eler.
- **X (Twitter) Adaptörü**: Zaman akışındaki tweet'leri temiz bir şekilde alır; `Gündemdekiler`, `Kimi Takip Etmeli` ve reklamları kaldırır.

### 🌐 4. Türkçe ve İngilizce Dil Desteği (i18n)
- Chrome tarayıcı diliniz Türkçe ise tüm arayüz ve ChatGPT'ye gönderilen prompt başlıkları **Türkçe** hazırlanır.
- Tarayıcı diliniz İngilizce ise tüm arayüz, buton ipuçları ve prompt başlıkları otomatik olarak **İngilizce** hazırlanır.

---

## 🛠️ Kurulum Adımları

Eklentiyi bilgisayarınıza kurup çalıştırmak için şu adımları izleyin:

1. **Repoyu Bilgisayarınıza İndirin**:
   ```bash
   git clone https://github.com/ozymandias-get/chatgpt-sidepanel-extension.git
   ```
2. **Chrome Uzantılar Sayfasını Açın**:
   - Adres çubuğuna `chrome://extensions` yazın ve `Enter` tuşuna basın.
3. **Geliştirici Modunu Açın**:
   - Sayfanın sağ üst köşesindeki **Geliştirici modu** (Developer mode) anahtarını açık konuma getirin.
4. **Eklentiyi Yükleyin**:
   - Sol üstte beliren **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
   - İndirdiğiniz `chatgpt-sidepanel-extension` klasörünü seçin.
5. **Kullanmaya Başlayın!**
   - Sağ üstteki uzantı simgesine tıklayın veya `Alt+Shift+C` kısayoluna basın.

---

## 🖱️ Kullanım Rehberi

| Aksiyon | Nasıl Yapılır? |
|---|---|
| **Kenar Panelini Aç/Kapat** | `Alt+Shift+C` kısayoluna basın veya eklenti simgesine tıklayın. |
| **Mevcut Web Sayfasını Aktar** | Kenar panelinin üst barındaki 📄 **Sayfayı Aktar** butonuna tıklayın. |
| **Seçili Metni Aktar** | Herhangi bir sitede metni fareyle seçin, **Sağ Tık > Seçili Metni ChatGPT'ye Gönder** seçeneğini kullanın. |
| **Sayfayı Sağ Tık İle Analiz Et** | Herhangi bir sitenin boş yerine sağ tıklayın, **Sağ Tık > Mevcut Sayfayı ChatGPT ile Analiz Et** deyin. |
| **Otomatik Gönderimi Aç/Kapat** | Üst bardaki **Otomatik Gönder** anahtarını (toggle) kullanın. |
| **Yeni Sohbet Başlat** | Üst bardaki ➕ **Yeni Sohbet** butonuna tıklayın. |

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlev |
|---|---|
| `Alt + Shift + C` | ChatGPT Kenar Panelini Aç / Kapat |

*(İsteğe bağlı olarak `chrome://extensions/shortcuts` adresinden kısayolu değiştirebilirsiniz).*

---

## 📂 Proje Dizin Yapısı

```
chatgpt-sidepanel-extension/
├── _locales/
│   ├── tr/messages.json       # Türkçe yerelleştirme metinleri
│   └── en/messages.json       # İngilizce yerelleştirme metinleri
├── icons/
│   ├── chatgpt_official.svg   # Orijinal OpenAI vektör logosu
│   ├── icon16.png             # 16px simge
│   ├── icon32.png             # 32px simge
│   ├── icon48.png             # 48px simge
│   └── icon128.png            # 128px simge
├── src/
│   └── extractor.js           # Mozilla Readability & Turndown kaynak kodu
├── background.js              # Service Worker & Sağ tık menü kontrolü
├── sidepanel.html             # Kenar paneli arayüzü
├── sidepanel.js               # Kenar paneli mantığı ve mesajlaşma
├── dom-extractor.js           # Derlenmiş 119 KB yüksek performanslı ayıklayıcı
├── chatgpt-inject.js          # ChatGPT iframe içi enjeksiyon kodu
├── rules.json                 # DeclarativeNetRequest kuralları
├── manifest.json              # Chrome Uzantısı Manifest V3 yapılandırması
├── README.md                  # İngilizce dokümantasyon
└── README_TR.md               # Türkçe dokümantasyon
```

---

## ⚙️ Geliştiriciler İçin Derleme (Build)

Eğer `src/extractor.js` dosyasında değişiklik yaparsanız, `dom-extractor.js` dosyasını yeniden derlemek için şu komutu çalıştırabilirsiniz:

```bash
# Bağımlılıkları yükleyin
npm install

# Modüler motoru derleyin
npx esbuild src/extractor.js --bundle --format=iife --outfile=dom-extractor.js
```

---

## ❓ Sıkça Sorulan Sorular (SSS)

**S: ChatGPT oturumu gerekli mi?**  
C: Evet, kenar paneli ChatGPT'nin resmi web arayüzünü yükler. Bir kez oturum açmanız yeterlidir.

**S: Verilerim herhangi bir sunucuya gönderiliyor mu?**  
C: Hayır! Tüm sayfa okuma ve ayıklama işlemleri %100 yerel olarak tarayıcınızın içinde gerçekleşir.

---

## 📜 Lisans

Bu proje [MIT Lisansı](./README_TR.md) ile lisanslanmıştır. Serbestçe kullanabilir, geliştirebilir ve paylaşabilirsiniz.
