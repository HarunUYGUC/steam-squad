# 🛍️ Chrome Web Store Yayınlama Rehberi — SteamSquad

Bu kılavuz, **SteamSquad** eklentisini **Google Chrome Web Store Geliştirici Paneli (Developer Dashboard)** üzerinden yayınlamak için gereken tüm hazır mağaza metinlerini, izin gerekçelerini, gizlilik beyanlarını ve adım adım yükleme talimatlarını içerir.

---

## 📦 Hazır Yükleme Paketi
Eklentinin tüm üretim kodları ve ikonları mağaza standartlarına uygun olarak sıkıştırıldı:
📁 **`steamsquad-chrome-store.zip`** (Proje ana dizininde hazır).

---

## 📋 1. Mağaza Listeleme Bilgileri (Store Listing)

### 🏷️ Temel Bilgiler
- **Eklenti Adı (Extension Name):**  
  `SteamSquad — Steam Kütüphane Eşleştirici` *(veya `SteamSquad — Steam Library Matcher`)*
- **Kısa Açıklama (Summary / Short Description - Max 132 Karakter):**  
  `Arkadaş ekibinizin Steam ortak oyunlarını bulun; indirimler, çarkıfelek, veto modu ve tek tıkla Discord/WhatsApp anketleri.`
  *(İngilizce alternatif: `Find shared Steam games with squad filters, live discounts, roulette wheel, veto arena, and 1-click Discord polls.`)*
- **Kategori (Category):**  
  `Sosyal ve İletişim` (Social & Communication) veya `Eğlence` (Entertainment)
- **Birincil Dil (Default Language):**  
  `Türkçe` veya `İngilizce (English)`

---

### 📄 Detaylı Açıklama (Detailed Description)

```markdown
🎮 "Bu akşam hep birlikte ne oynuyoruz?" kararsızlığına son!

SteamSquad; 2 ila 10 kişilik arkadaş gruplarınızın Steam kütüphanelerini saniyeler içinde karşılaştıran, indirimleri yakalayan, anket ve çarkıfelek ile hızlıca oyun seçmenizi sağlayan modern bir Chrome Yan Panel (Side Panel) eklentisidir.

🌟 ÖNE ÇIKAN ÖZELLİKLER:

👥 Dinamik Ekip & Alt Ekip Yönetimi:
- Tüm Ekip veya özel alt gruplar (Örn: "Hafta Sonu 4'lüsü", "Duo Takımı", "5v5 CS Ekibi") oluşturun.
- Kadro havuzundaki oyuncuları tek tıkla dahil edip çıkarın.

🎯 Akıllı Kesişim & Eksik Oyuncu Filtreleri:
- %100 Herkeste Var: Kadrodaki herkesin kütüphanesinde olan ortak oyunları anında görün.
- 1 Kişide & 2 Kişide Yok Modu: Eksik olan arkadaşınızı ve oyunun güncel Steam indirimli fiyatını anında tespit edin.
- 💬 Tek Tıkla Arkadaşa Davet Mesajı: Eksik oyunu olan arkadaşınız için kopyalanabilir kişiselleştirilmiş davet mesajı üretin.

☑️ "Oynandı" Takibi:
- Daha önce bitirdiğiniz veya oynadığınız oyunları tek tıkla işaretleyin.
- Oynanan oyunlar Anket, Çarkıfelek ve Veto Arenası'ndan otomatik olarak hariç tutulur.

📋 Tek Tıkla Discord & WhatsApp Anket Oluşturucu:
- Arkadaşlarınızın eklenti kurmasına gerek kalmadan grup içi oylama yapmak için emojili, hazır formatlı anket metnini panoya kopyalayın.

🎡 Çarkıfelek & Veto Eleme Arenası:
- Discord ekran paylaşımında dönebilen ses efektli çarkıfelek.
- Sıra tabanlı Veto Eleme Arenası ile istemediğiniz oyunları eleyin, sona kalan şampiyonu oynayın!

🔒 ŞİFRESİZ & %100 GÜVENLİ MİMARİ:
- Şifre, API anahtarı zorunluluğu veya hesap girişi gerekmez.
- Yalnızca açık Steam Profil Linki veya SteamID64 ile tamamen yerel tarayıcınız üzerinde çalışır.

💡 DESTEK & AÇIK KAYNAK:
Sorularınız ve geri bildirimleriniz için GitHub: https://github.com/HarunUYGUC/steam-squad
```

---

## 🛡️ 2. İzin Gerekçeleri (Permission Justifications)

Google Chrome Web Store inceleme ekibi için kopyalayıp yapıştırabileceğiniz resmi izin açıklamaları:

| İzin (Permission) | İnceleme Ekibi İçin Açıklama (Single Purpose & Justification) |
|---|---|
| **`sidePanel`** | `Required to display the SteamSquad library matcher UI in the native Chrome Side Panel alongside web pages.` |
| **`storage`** | `Required to store squad members, custom team presets, and played game statuses locally in the browser.` |
| **`clipboardWrite`** | `Required only when the user clicks the copy button to copy formatted Discord/WhatsApp voting polls or invitation messages to the clipboard.` |
| **`https://steamcommunity.com/*`** | `Required to fetch public Steam profile game libraries in XML format without requiring account login or credentials.` |
| **`https://store.steampowered.com/*`** | `Required to fetch public game prices, discounts, and store banners from the Steam Store API for missing game suggestions.` |
| **`https://api.steampowered.com/*`** | `Required to fetch game lists via Steam Web API if the user optionally enters a free Steam API key for large 100+ game libraries.` |

---

## 🔒 3. Gizlilik Politikası & Veri Kullanımı (Privacy & Data Usage)

- **Gizlilik Politikası URL'si (Privacy Policy URL):**  
  `https://github.com/HarunUYGUC/steam-squad/blob/main/PRIVACY.md`
- **Veri Toplama (Data Collection):**  
  - **"Does your extension collect user data?"** ➔ **NO** (Hayır).
  - *(SteamSquad hiçbir kullanıcı verisi toplamaz, sunuculara göndermez veya 3. taraflarla paylaşmaz).*
- **Tek Amaç Beyanı (Single Purpose):**  
  `Matches public Steam libraries among squad friends to find shared multiplayer games and generate group voting polls.`

---

## 🖼️ 4. Mağaza Görselleri (Store Visuals)

| Görsel Türü | Boyutlar | Durum |
|---|---|---|
| **Store Icon** | 128×128 PNG | ✅ `icons/icon-128.png` hazır |
| **Ekran Görüntüsü 1 (Kadro)** | 1280×800 PNG | Yan panel kadro sekmesinin ekran görüntüsü |
| **Ekran Görüntüsü 2 (Oyunlar & İndirimler)** | 1280×800 PNG | Ortak oyunlar ve indirimlerin ekran görüntüsü |
| **Ekran Görüntüsü 3 (Anket & Çark)** | 1280×800 PNG | Çarkıfelek ve anket sekmesinin ekran görüntüsü |
| **Küçük Tanıtım Kartı (Promo Tile)** | 440×280 PNG | İsteğe bağlı mağaza vitrin görseli |

---

## 🚀 5. Adım Adım Chrome Web Store Yükleme Kılavuzu

### Adım 1: Chrome Geliştirici Hesabına Giriş
1. [chrome.google.com/webstore/devcenter](https://chrome.google.com/webstore/devcenter) adresine gidin.
2. Google hesabınızla giriş yapın. *(İlk defa geliştirici oluyorsanız Google $5 tek seferlik bir kayıt ücreti talep eder).*

### Adım 2: Paketi Yükleme
1. Sağ üstteki **"Yeni Öğe Ekle" (Add new item)** butonuna tıklayın.
2. Proje klasöründeki **`steamsquad-chrome-store.zip`** dosyasını seçip yükleyin.

### Adım 3: Mağaza Bilgilerini Doldurma
1. **Mağaza Girişi (Store Listing):**
   - Başlık, Kısa Açıklama ve Detaylı Açıklama alanlarına yukarıdaki metinleri yapıştırın.
   - 128x128 ikonu ve en az 1 adet 1280x800 ekran görüntüsü yükleyin.
   - Kategori olarak **"Sosyal ve İletişim"** seçin.
2. **Gizlilik (Privacy):**
   - Tek Amaç (Single Purpose) alanına yukarıdaki açıklamayı yapıştırın.
   - İzin gerekçeleri (Permissions justification) alanlarına yukarıdaki tablodaki İngilizce cümleleri yapıştırın.
   - Gizlilik Politikası URL'sine `https://github.com/HarunUYGUC/steam-squad/blob/main/PRIVACY.md` linkini girin.
   - "Veri topluyor musunuz?" sorusuna **HAYIR** seçeneğini işaretleyin.
3. **Dağıtım (Distribution):**
   - Görünürlüğü **Herkese Açık (Public)**, fiyatı **Ücretsiz (Free)** ve bölgeleri **Tüm Bölgeler (All regions)** olarak ayarlayın.

### Adım 4: İncelemeye Gönderme (Submit for Review)
1. Sağ üstteki mavi **"İncelemeye Gönder" (Submit for Review)** butonuna tıklayın.
2. Google ekibi eklentiyi inceler (genellikle 24-48 saat içinde tamamlanır).
3. Onaylandığında eklentiniz Chrome Web Store'da canlıya alınır ve doğrudan mağaza linkiniz oluşturulur! 🎉
