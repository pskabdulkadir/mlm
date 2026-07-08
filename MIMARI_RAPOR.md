# AKN Group MLM Sistemi - 100 Milyon Kullanıcı Ölçeklendirme & "Zeka Katmanı" Mimari Raporu

Bu rapor, sistemin **100 Milyon kullanıcı kapasitesine** taşınması, finansal motorun (MLM Engine) izole edilmesi ve kullanıcı panellerinin **Redis & Micro-Endpoints (Zeka Katmanı)** ile hızlandırılmasına yönelik uygulanan mimariyi detaylandırmaktadır.

---

## 1. Veri İzolasyonu & Core-Logic Koruma (Read-Only Projection)

Sistem güvenliğini ve performansını korumak amacıyla, işlemsel (transactional) finansal motor ile okuma ağırlıklı Dashboard sorguları tamamen ayrılmıştır.

```
[ Finansal İşlemler (Satış/Prim) ]
               │
               ▼ (Atomic Update / Worker)
   ┌───────────────────────┐
   │    MonthlySummary     │ ◄─── Read-Only Projection
   └───────────────────────┘
               │
               ▼ (Önbellekleme)
   ┌───────────────────────┐
   │      Redis Cache      │
   └───────────────────────┘
               │
               ▼
 [ Üye ve Admin Panelleri ]
```

### MonthlySummary (Read-Only Projection) Koleksiyon Şeması
`MonthlySummary` koleksiyonu, her üyenin aylık performans verilerini atomic update operasyonları ile saklar. Bu sayede paneller ana işlemsel tabloları taramak yerine bu projeksiyon tablosundan tekil sorgu atar.

*   **userId (Ref -> User):** Üye ID'si (Parçalama Anahtarı)
*   **yearMonth (String):** `YYYY-MM` formatında döngü periyodu
*   **personalSalesVolume (Number):** Kişisel aylık satış cirosu (USD)
*   **isEligibleForPoolsAndBonuses (Boolean):** $100 aktiflik ve hak ediş durumu
*   **careerEarnings (Number):** Cari aydaki kariyer kazançları
*   **poolEarnings (Number):** Aylık performans havuzu kazançları
*   **status (String):** `ACTIVE` | `HELD` (Hak ediş askıda) | `INACTIVE`

---

## 2. 100 Milyon Kullanıcı Ölçeklendirme (Sharding & Unilevel)

Sistem 100M kullanıcıya ulaştığında veritabanı kilitlenmelerini engellemek için iki temel tasarım uygulanmıştır:

### A. MongoDB Sharding (Veritabanı Parçalama)
`users`, `orders` ve `wallets` koleksiyonları **`memberId`** bazlı shard anahtarı ile yatayda bölünmüştür.
*   Bütün işlemler tek bir makineye yük bindirmek yerine, `memberId` hash dağılımı sayesinde cluster genelinde dengeli bir şekilde işlenir.

### B. Unilevel Optimizasyonu (Path Enumeration)
7 derinlikli ağaç sorgularını anlık recursive yapmak yerine, her üye kaydında **`ancestors` (Atalar dizisi)** güncellenir.
*   Örnek: `ancestors: ["M1", "M2", "M3", "M4", "M5", "M6", "M7"]`
*   Bir üye satış yaptığında, sponsor zincirindeki 7 derinliğe prim dağıtımı **$O(1)$** sürede tek bir indeksli sorgu ile tamamlanır:
    ```typescript
    const unilevelSponsors = user.ancestors.slice(-7);
    ```

---

## 3. Performans Katmanı (Redis & Micro-Endpoints)

Panellerin anlık hızı, karmaşık join sorguları yerine **Micro-Endpoints** ve **Redis** önbellek katmanı ile maksimize edilmiştir.

### Redis Cache Yönetimi (CacheManager)
*   **Bellek-İçi Fallback:** Redis bağlantısı kopsa veya devre dışı olsa dahi, sistem otomatik olarak bellek içi `fallbackMemory` Map yapısına geçerek kesintisiz çalışmayı garanti eder.
*   **Hızlı Key-Value Çiftleri:** Aktiflik barajı, kariyer durumu gibi statikleşebilen veriler TTL (Time-To-Live) süresi ile Redis'te tutulur.

---

## 4. Widget Tabanlı Micro-Endpoints API Dokümantasyonu

Panellerin veri ihtiyacını minimum veri yüküyle çözmek için tasarlanan mikro uç noktalar şunlardır:

### 1. Üye Aktiflik ve Hak Ediş Durumu
*   **Endpoint:** `/api/commissions/eligibility/:userId`
*   **Metot:** `GET`
*   **Veri Kaynağı:** `MonthlySummary` (Sorgu) / Redis (Cache)
*   **Örnek Çıktı:**
    ```json
    {
      "success": true,
      "isEligible": false,
      "personalVolume": 75.00,
      "remainingVolume": 25.00,
      "totalHeld": 120.00,
      "alertMessage": "Aylık kariyer ve havuz komisyonlarınızı aktif etmek için $25.00 USD daha ciro yapmalısınız.",
      "actionTip": "Hemen ürün mağazasından aktiflik paketi alarak $120.00 USD tutarındaki bekleyen komisyonlarınızı serbest bırakın."
    }
    ```

### 2. Otonom Zeka Mücadeleleri (AI Challenges)
*   **Endpoint:** `/api/commissions/challenges/:userId`
*   **Metot:** `GET`
*   **Örnek Çıktı:**
    ```json
    {
      "success": true,
      "challenges": [
        {
          "id": "ch_pv_1",
          "title": "Aylık Aktiflik Barajı",
          "description": "Kişisel satış hacmini 100$'a tamamla, biriken tüm primlerini serbest bırak.",
          "target": 100,
          "current": 75,
          "unit": "USD",
          "progress": 75,
          "reward": "Hak Ediş Aktivasyonu"
        }
      ]
    }
    ```

### 3. Admin Genel Uyumluluk İstatistikleri
*   **Endpoint:** `/api/commissions/summary-stats`
*   **Metot:** `GET` (Yalnızca Admin)
*   **Veri Kaynağı:** `MonthlySummary` (Aggregated)
*   **Açıklama:** Toplam askıya alınan, dağıtılan primleri ve aktif/pasif üye oranlarını anlık getirir.

### 4. Hak Edişi Askıda Olan Üyeler Listesi (Compliance)
*   **Endpoint:** `/api/commissions/compliance-members`
*   **Metot:** `GET` (Yalnızca Admin)
*   **Açıklama:** $100 barajını geçemediği için primleri geçici olarak HELD (Beklemede) statüsünde olan üyeleri listeler.

---

## 5. Finansal Komisyon Dağılım Oranları (Global Aylık Döngü)

Aylık döngüye sabitlenen yeni finansal komisyon yapısı şeması panellerde ve finansal motorda şu oranlarla çalışmaktadır:

*   **Şirket Fonu (Company Fund):** %50
*   **Direkt Sponsor Primi (Direct Sponsor):** %25
*   **7 Derinlik Unilevel Primi (7-Depth Unilevel):** %15 (Toplam)
*   **Aylık Performans Havuzu (Monthly Pool):** %10

Bu oranlar her ay sonu otonom sistem beyni tarafından hesaplanarak dağıtılır. $100 aktiflik şartını sağlayamayan üyelerin hak ettiği paylar, sistem koruması amacıyla askıya alınır ve üye aktif olduğunda serbest bırakılır.
