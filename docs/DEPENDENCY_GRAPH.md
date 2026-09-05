# 📊 SteamSquad — Bağımlılık Grafiği (Dependency Graph)

Bu doküman, **SteamSquad** Chrome eklentisinin modülleri arasındaki tüm `import` ve bağımlılık ilişkilerini görsel ve teknik olarak açıklamaktadır.

---

## 🗺️ 1. Görsel Bağımlılık Şeması

![SteamSquad Modül Bağımlılık Grafiği](dependency-graph.png)

<details>
<summary><b>📐 Mermaid Şemasını ve Kaynak Kodunu Görüntüle</b></summary>

```mermaid
graph TD
    %% Katman 1: Tarayıcı ve Giriş Noktaları
    subgraph ChromeRuntime ["🌐 Chrome Eklenti Katmanı"]
        Manifest["manifest.json"]
        Worker["service-worker.js"]
    end

    %% Katman 2: Kullanıcı Arayüzü (Presentation)
    subgraph UI ["🖥️ Arayüz & Görünüm Katmanı"]
        HTML["sidepanel.html"]
        CSS["sidepanel.css"]
    end

    %% Katman 3: Ana Orkestra Şefi (Application Controller)
    subgraph ControllerLayer ["🎮 Ana Yönetici Katmanı"]
        App["sidepanel.js - SteamSquadApp"]
    end

    %% Katman 4: Alt Motorlar & Yardımcılar (Engines & Utilities)
    subgraph EngineLayer ["⚙️ İş Mantığı & Hesaplama Motorları"]
        SquadMgr["squad-manager.js - Kadro ve Takım"]
        Overlap["overlap-engine.js - Kesişim Motoru"]
        Roulette["roulette.js - Çark ve Veto Arenası"]
        Poll["poll-generator.js - Anket Üreteci"]
    end

    %% Katman 5: Veri ve Servis Katmanı (Services & Data)
    subgraph ServiceLayer ["🔌 Dış Servisler & Veri Bankası"]
        SteamServ["steam-service.js - Steam API Servisi"]
        GameMeta["game-metadata.js - 400+ Oyun Veritabanı"]
    end

    %% Dış Kaynaklar
    subgraph External ["☁️ Dış Dünya & Depolama"]
        ChromeStorage[("chrome.storage.local")]
        SteamAPI[("Steam API / Store / XML")]
    end

    %% İlişkiler
    Manifest -.->|Background Servisi| Worker
    Manifest -.->|Yan Panel Yolu| HTML
    Worker -.->|Yan Paneli Açar| HTML

    HTML -->|Stiller| CSS
    HTML -->|Script type module| App

    %% sidepanel.js bağımlılıkları
    App -->|import| SquadMgr
    App -->|import| Overlap
    App -->|import| Roulette
    App -->|import| Poll
    App -->|import: Mağaza Fiyatı| SteamServ

    %% squad-manager.js bağımlılıkları
    SquadMgr -->|import: Kütüphane Çekme| SteamServ
    SquadMgr <-->|Kadro Kaydet ve Oku| ChromeStorage

    %% overlap-engine.js bağımlılıkları
    Overlap -->|import: SIZE_TIERS| GameMeta

    %% steam-service.js bağımlılıkları
    SteamServ -->|import: getGameMetadata| GameMeta
    SteamServ <-->|Fiyat Önbelleği| ChromeStorage
    SteamServ <-->|HTTP İstekleri| SteamAPI

    %% Stil Renklendirmeleri
    classDef ui fill:#1b2838,stroke:#66c0f4,color:#ffffff,stroke-width:2px;
    classDef controller fill:#0072ce,stroke:#3aa9ff,color:#ffffff,stroke-width:2px;
    classDef engine fill:#2a475e,stroke:#66c0f4,color:#ffffff;
    classDef service fill:#171a21,stroke:#2ecc71,color:#ffffff,stroke-width:2px;
    classDef ext fill:#0e141b,stroke:#8f98a0,color:#c7d5e0,stroke-dasharray: 5 5;

    class HTML,CSS,Worker,Manifest ui;
    class App controller;
    class SquadMgr,Overlap,Roulette,Poll engine;
    class SteamServ,GameMeta service;
    class ChromeStorage,SteamAPI ext;
```
</details>

---

## 📋 2. Modül İçe Aktarım Tablosu (Imports & Exports)

| Dosya | İçe Aktardığı Modüller (Imports) | Kimler Tarafından Kullanılıyor? | Görevi |
| :--- | :--- | :--- | :--- |
| **`sidepanel.js`** | `squad-manager.js`<br>`overlap-engine.js`<br>`poll-generator.js`<br>`roulette.js`<br>`steam-service.js` | `sidepanel.html` | Uygulamanın orkestra şefidir (Application Controller). Arayüz ve motorları koordine eder. |
| **`squad-manager.js`** | `steam-service.js` | `sidepanel.js` | Kadro ve takımları yönetir, `chrome.storage` kalıcı kaydını tutar. |
| **`overlap-engine.js`** | `game-metadata.js` (`SIZE_TIERS`) | `sidepanel.js` | Aktif üyelerin kütüphanelerini kesiştirir (Herkeste Var, 1 Eksik, 2 Eksik). |
| **`steam-service.js`** | `game-metadata.js` (`getGameMetadata`) | `sidepanel.js`<br>`squad-manager.js` | Steam API, Community XML ve canlı mağaza fiyatlarını çeker. |
| **`game-metadata.js`** | *(Hiçbiri - Bağımsız)* | `overlap-engine.js`<br>`steam-service.js` | 400+ popüler oyunun mod, kapasite ve boyut veritabanıdır. |
| **`poll-generator.js`** | *(Hiçbiri - Bağımsız)* | `sidepanel.js` | Discord ve WhatsApp için anket metni ve pano kopyalama yardımcısı. |
| **`roulette.js`** | *(Hiçbiri - Bağımsız)* | `sidepanel.js` | HTML Canvas çarkıfelek ve Veto eleme arenası motorudur. |

---

## 🎯 3. Mimari Özellikler ve Çıkarımlar

1. **Sıfır Döngüsel Bağımlılık (No Circular Dependencies):**
   * Bağımlılık akışı tamamen yukarıdan aşağıya tek yönlüdür.
   * Hiçbir dosya kendisini çağıran bir üst modülü tekrar import etmez. Bu sayede tarayıcıda bellek kilitlenmesi veya `undefined` değişken hataları oluşmaz.

2. **Bağımsız Uç Düğümler (Leaf Nodes):**
   * `game-metadata.js`, `poll-generator.js` ve `roulette.js` başka hiçbir iç modüle bağımlı değildir. 
   * Bu modüller istendiğinde projeden sökülüp başka bir projede tek başına çalıştırılabilir (Loose Coupling).

3. **Merkezi Veri Akışı (Single Controller):**
   * Motorlar (`squad-manager`, `overlap-engine`, `roulette`) birbirleriyle doğrudan konuşmaz. 
   * Tüm veri akışı ve senkronizasyon `sidepanel.js` üzerinden merkezi olarak yönetilir.
