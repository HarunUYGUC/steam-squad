# 🎮 SteamSquad — Steam Kütüphane Eşleştirici (Chrome Extension)

> **"Bu akşam hep birlikte ne oynuyoruz?"** kararsızlığına son! Arkadaş gruplarınızın Steam kütüphanelerini saniyeler içinde karşılaştıran, indirimleri yakalayan, anket ve çarkıfelek ile hızlıca oyun seçmenizi sağlayan modern bir Chrome Yan Panel (Side Panel) eklentisi.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen)
![Version](https://img.shields.io/badge/version-1.4.2-blue)
![Privacy First](https://img.shields.io/badge/Privacy-Zero%20Password-blue)
![Platform](https://img.shields.io/badge/Chrome-Side%20Panel-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Temel Özellikler

- 🔒 **Şifresiz & Güvenli Mimari:** Şifre veya hesap girişi gerekmez. Yalnızca açık Steam Profil Linki (`steamcommunity.com/id/kullaniciadi`) veya SteamID64 ile çalışır.
- 👥 **Dinamik Ekip Yönetimi (Ekipler & Şablonlar):**
  - **`[👥 Tüm Ekip]`**: Varsayılan ana ekip, eklenen herkesi otomatik olarak dahil eder.
  - **`[➕ Ekip Oluştur]`**: *"Duo Takımı"*, *"5v5 CS Ekibi"*, *"Hafta Sonu 4'lüsü"* gibi özel alt ekipler oluşturup istediğiniz oyuncuları kolayca işaretleyin.
- 🎯 **Akıllı Kesişim & Eksik Oyuncu Filtreleri:**
  - **Herkeste Var:** Kadrodaki herkesin kütüphanesinde olan ortak oyunları anında listeler.
  - **1 Kişide Yok & 2 Kişide Yok:** Eksik olan oyuncuları ve oyunun güncel Steam Türkiye (MENA-USD) indirimli fiyatını listeler.
  - **💬 Arkadaşa Davet/Satın Alma Mesajı:** Eksik oyunu olan arkadaşınız için tek tıkla kopyalanabilir kişiselleştirilmiş Steam davet mesajı üretir.
- ☑️ **"Oynandı" Takibi:**
  - Daha önce oynadığınız oyunları tek tıkla *"Oynandı"* olarak işaretleyin.
  - Oynanan oyunlar **Anket Oluşturucu**, **Çarkıfelek** ve **Veto Arenası**'ndan otomatik olarak hariç tutulur.
- 📋 **Tek Tıkla Discord & WhatsApp Anket Oluşturucu:** Arkadaşlarınızın eklenti kurmasına gerek kalmadan grup içi oylama yapmak için hazır formatlı anket metnini panoya kopyalar.
- 🎡 **Çarkıfelek & Veto Eleme Arenası:**
  - Seçtiğiniz filtrelere (`Herkeste Var`, `1 Kişide Yok` vb.) göre dinamik güncellenen 32+ oyun kapasiteli eleme arenası ve ses efektli çarkıfelek.
- 🔑 **İsteğe Bağlı Steam Web API Key Desteği:**
  - 100'den fazla oyunu olan dev kütüphaneleri eksiksiz çekmek için ücretsiz API anahtarı desteği (yerel hafızada şifreli saklanır, istendiğinde tek tıkla silinebilir).
  - Steam Mağaza istek sınırlamalarına karşı dahili kuyruk ve kota koruması (Rate Limiter).

---

## 📂 Proje Dizin Yapısı

```
steam-squad/
├── manifest.json              # Manifest V3 (Side Panel, Storage, Steam Host İzinleri)
├── CHROMEWEBSTORE.md          # Chrome Web Store mağaza listelemesi ve izin açıklamaları
├── README.md                  # Proje tanıtım ve kurulum kılavuzu
├── docs/                      # Mimari ve veri akış dokümantasyonları
│   ├── APP_ARCHITECTURE.md   # Genel uygulama çalışma mimarisi ve modül ilişkileri
│   ├── DATA_ARCHITECTURE.md  # Veri akış ve kütüphane analiz mimarisi dokümanı
│   ├── DEPENDENCY_GRAPH.md   # Modül bağımlılık şeması ve import hiyerarşisi
│   ├── dependency-graph.html # Standalone interaktif ve görsel bağımlılık şeması (Diagram Design)
│   └── dependency-graph.png  # Bağımlılık grafiğinin görsel PNG formatı
├── icons/                     # 16, 48, 128px PNG eklenti ikonları
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── src/
    ├── background/
    │   └── service-worker.js  # Yan panel açılış yönetimi ve background servisi
    ├── sidepanel/
    │   ├── sidepanel.html     # Ana yan panel arayüzü
    │   ├── sidepanel.css      # Steam estetiğinde koyu tema stilleri
    │   ├── sidepanel.js       # UI durum yönetimi ve olay koordinasyonu
    │   ├── squad-manager.js   # Ekip yönetimi, Tüm Ekip / Özel Ekipler mimarisi
    │   ├── overlap-engine.js  # Kütüphane kesişim ve filtreleme motoru
    │   ├── poll-generator.js  # Discord / WhatsApp hazır anket üreticisi
    │   └── roulette.js        # Canvas çarkıfelek, sentezleyici sesler ve Veto arenası
    └── services/
        ├── steam-service.js   # Steam API, XML kütüphane ayrıştırıcı ve hız sınırlamalı mağaza servisi
        └── game-metadata.js   # 400+ oyunluk çok oyunculu mod ve kapasite veritabanı
```

---

## 🛠️ Kurulum & Geliştirici Modunda Yükleme

1. **Google Chrome** tarayıcınızı açın.
2. Adres çubuğuna `chrome://extensions` yazın ve Enter'a basın.
3. Sağ üst köşedeki **"Geliştirici modu" (Developer mode)** anahtarını açık konuma getirin.
4. Sol üstteki **"Paketlenmemiş öğe yükle" (Load unpacked)** butonuna tıklayın.
5. Bu proje klasörünü (`steam-squad`) seçin.
6. Tarayıcının sağ üstündeki Eklentiler menüsünden **SteamSquad** ikonuna tıklayarak Yan Paneli açın!

---

## 📄 Lisans
MIT License. Steam ve Steam logosu, Valve Corporation'ın tescilli ticari markalarıdır. Bu proje Valve Corporation ile bağlantılı değildir.
