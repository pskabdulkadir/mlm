import express, { Request, Response } from "express";

const router = express.Router();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantRequest {
  message: string;
  userId?: string;
  panelType?: string;
  context?: Record<string, any>;
  conversationHistory?: ChatMessage[];
}

// System prompt - Türkçe yardımcı
const SYSTEM_PROMPT = `Sen bir MLM (Çok Seviyeli Pazarlama) platformu yardımcısısın. 
Adın: "Akn Yardımcısı" (Akn Assistant).

Görevlerin:
1. Üyelerin tüm sorularına Türkçe cevap vermek
2. Platform özellikleri hakkında bilgi vermek
3. Kazanç ve komisyon sistemi açıklamak
4. Takım kurma ve referral hakkında tarif etmek
5. Manevi, Zahiri, Batıni panelleri açıklamak
6. Ürün satışı ve cüzdan işlemleri hakkında yön göstermek
7. Eğitim ve training programları konusunda rehberlik etmek

Tüm cevapları:
- Profesyonel ama samimi ton kullan
- Kısa ve anlaşılır cevap ver
- Gerekirse adım adım tarif et
- Hep Türkçe cevap ver
- Emojiler kullanabilirsin ama abartma`;

// Normalize Türkçe karakterler
function normalizeTurkish(text: string): string {
  return text
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .trim();
}

// Fuzzy matching - benzer kelimeler bulma
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Kelime benzerliği yüzdesi
function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

// Completely free AI responses - no API keys needed!
// Uses intelligent pattern matching with built-in knowledge base
async function getChatResponse(
  message: string,
  _conversationHistory: ChatMessage[] = [],
  _context: Record<string, any> = {}
): Promise<string> {
  try {
    const normalizedMessage = normalizeTurkish(message);
    const messageWords = normalizedMessage.split(/\s+/).filter(w => w.length > 2);

    // Knowledge base - Türkçe MLM bilgileri (geniş anahtar kelime seti)
    const responses: Record<string, string> = {
      "para|kazanc|para cek|cekim|gelir|earnings|dolar|tl|tl|usd|eur": `💰 **Para Kazanma Yolları**

Akn Group'ta para kazanmanın 4 ana yolu var:

1. **Doğrudan Satış** 🛍️
   • Ürün satarak direkt gelir
   • Clone page'de kendi mağazanız
   • Her satıştan tam komisyon

2. **Referral Komisyonu** 👥
   • Insanları davet ettiğinizde
   • Onların satışlarından % bonus
   • Sınırsız referral kazancı

3. **Monoline Sistemi** 📈
   • Doğrudan referrallardan
   • Sabit bonus tutarı
   • Her ayda otomatik ödemeler

4. **Pasif Gelir** ♾️
   • Aylık distribüsyon
   • Takım büyüklüğüne bağlı
   • İdeal: 100+ kişi takımda

💡 **İpucu**: Tüm 4 sistemi birleştirerek maksimum kazanın!`,

      "komisyon|komision|system|sistem|odul|bonus|odeme|payment": `📊 **Komisyon Sistemi Detaylı**

**Monoline Bonusu:**
• Doğrudan davetinizden aldığınız
• Kişi başına sabit tutar
• Sınırsız sayıda kişi

**Pool Bonusu:**
• Ekip toplamının belirli yüzdesi
• Career level'e göre değişir
• 10-50 kişiye kadar artar

**Pasif Dağıtım:**
• Aylık otomatik ödeme
• Sistem tarafından yönetilir
• İşlem yapmanız gerekmez

**Career Level Sistemi:**
• Her satış → puan
• Puan → level yükseliş
• Seviye → daha fazla komsiyon

**Ödeme Süreci:**
1. Satış yapılır
2. Sistem hesapla
3. Cüzdana otomatik aktar
4. İstedikten sonra çek`,

      "takim|referral|davet|network|invite|insanlar|kisi|uye|member": `👥 **Takım Kurma Rehberi**

**Başlangıç (Adım Adım):**

1. **Paylaş Butonu Kullan**
   • Member Panel'de "Paylaş" sekmesi
   • Referral link'i kopyala
   • Sosyal medyada paylaş

2. **Link Gönder**
   • WhatsApp, Telegram, Email
   • Instagram DM'i
   • Facebook gruplara

3. **İnsanlar Kayıt Olur**
   • Linkine tıklar
   • Hesap oluşturur
   • Otomatik senin takımına eklenir

4. **Takımını Büyüt**
   • Günde 5-10 kişi davet et
   • 1 ay → 30 kişi
   • 3 ay → 100+ kişi

**En İyi Stratejiler:**
✓ Ürün satanları davet et
✓ Somali örnekler ver
✓ Başarı hikayeleri paylaş
✓ Düzenli güncellemeler gönder`,

      "urun|clone|satis|product|magaza|shop|muz|mal|hizmet": `🛒 **Ürün Satışı & Clone Page**

**Clone Page Nedir?**
• Kendi kişisel mağazanız
• Kendi ürünlerini ekleyebilirsiniz
• Satış yüzdesini siz belirlersiniz

**Ürün Ekleme:**
1. Member Panel → Clone Products
2. "Ürün Ekle" butonuna tıkla
3. İsim, açıklama, fiyat yaz
4. Resim yükle
5. Kaydet

**Satış Linkini Paylaş:**
• QR code oluştur
• Sosyal medyada paylaş
• Whatsapp'ta gönder
• Email kampanyası yap

**Satış Takibi:**
• Dashboard'da canlı satışları gör
• Her işlemi kontrol et
• Müşteri listesini tut

**Fiyatlandırma İpuçları:**
• Market araştırması yap
• Rekabet fiyatını kontrol et
• İlk müşteriye indirim yap
• Kalite-fiyat dengesi`,

      "cuzdan|wallet|para cek|cekme|withdraw|bakiye|balance|hesap": `💳 **E-Cüzdan ve Para Çekme**

**Cüzdan Bakiyesi Görme:**
1. Member Panel açı
2. E-Wallet sekmesine tıkla
3. Toplam bakiyeni gör
4. İşlemleri kontrol et

**Para Çekme Adımları:**
1. E-Wallet → Para Çek
2. Çekilecek tutarı gir
3. Banka hesabını seç
4. Onayla
5. 1-3 iş günü içinde paranı al

**Para Transfer:**
• Diğer üyelere gönder
• Cüzdanında saklı tut
• İşlem geçmişini gör

**Güvenlik:**
✓ 2FA (iki adımlı doğrulama)
✓ Şifreni güçlü tutL
✓ Oturumlarını kontrol et
✓ şüpheli işlemi bildir`,

      "training|egitim|ogret|course|kurs|video|ders|seminer|webinar": `🎓 **Training ve Eğitim Programları**

**Training Sayfası:**
1. Member Panel → Training
2. Yaklaşan eğitimleri gör
3. İlgilenen eğitimi seç
4. Katıl butonuna tıkla

**Eğitim Türleri:**
• **Live Broadcast**: Canlı sunumlar
• **Video Courses**: Kaydedilmiş dersler
• **Dokümantasyon**: Yazılı rehberler
• **Workshop**: Interaktif oturumlar

**Sertifikasyon:**
✓ Eğitimi bitir
✓ Quiz'i geç
✓ Sertifika al
✓ CV'ne ekle

**Önerilen Sıra:**
1. Sistem Tanıtımı (başta)
2. Para Kazanma (temel)
3. Takım Kurma (orta)
4. Liderlik (ileri)

**Canlı Eğitim Saatleri:**
• Pazartesi-Cuma: 19:00
• Cumartesi: 14:00
• Pazar: Arzu halinde`,

      "profil|hesap|bilgi|setting": `⚙️ **Hesap Ayarları ve Profil**

**Profil Bilgileri:**
1. Profil sekmesine git
2. Adını kontrol et
3. Email güncelle
4. Telefon numarası ekle

**Gizlilik Ayarları:**
• Clone page görünürlüğü
• Referral paylaşımı
• Bildirim tercihleri
• Veri gizliliği

**Şifre Değiştir:**
1. Ayarlar → Güvenlik
2. Eski şifreyi gir
3. Yeni şifre belirle
4. Onayla

**İki Adımlı Doğrulama:**
✓ SMS kodunu aç
✓ Email doğrulaması
✓ Authenticator uygulaması
✓ Yedek kodları kaydet

**Hesap Silme:**
⚠️ Geri alınamaz!
• Tüm veriler silinir
• Kazançlar korunur
• Cüzdanı boşalt`,

      "manevi|spiritual|ruh|dua": `🕌 **Manevi Panel Rehberi**

**Manevi Panel Sekmeler:**
• 📖 **Kur'an**: Suralı okuma
• ✨ **Esma-ül Hüsna**: 99 Güzel İsim
• 🔄 **Hatim**: Kur'an bitirme takibi
• 📚 **Hadis**: Peygamber hadisleri
• 🤲 **Zikir**: Dua ve zikir
• 💭 **Rüya**: Rüya yorumları

**Günlük Pratik:**
1. Sabah dua yap
2. Bir sure oku
3. Esma-ül Hüsna (100 kez)
4. Öğlen zikri
5. Akşam duası

**Hatim Sistemi:**
• Kur'an'ı 30 günde bitir
• Her gün 1 cuz oku
• İlerlemeyi takip et
• Tamamladığında sertifika al

**Rüya Yorumu:**
• Rüyanı yaz
• AI yardımcısına sor
• İslami perspektif al
• Şeyhden danış`,

      "zahiri|motivasyon|psikoloji|başarı": `💪 **Zahiri Panel - Motivasyon**

**Zahiri Panel Sections:**
• 🧠 **Psikoloji**: Kişisel gelişim
• 🎵 **Meditasyon**: Müzik ve meditasyon
• 📚 **Başarı**: Başarı hikayeleri
• 💬 **Sözler**: Evliya sözleri
• ⚡ **Motivasyon**: Günlük mesajlar

**Psikoloji Teknikleri:**
✓ Pozitif düşünme
✓ Hedef belirleme
✓ Vizualizasyon
✓ Affirmation (olumlu ifadeler)

**Meditasyon:**
• Her gün 10-20 dakika
• Rahat bir yer seç
• Müzik dinle
• Sakin kal

**Başarı Önerileri:**
1. Açık hedefler belirle
2. Günlük işlem yap
3. İlerlemeyi takip et
4. Başarı kutla
5. Bir sonraki seviyeye git

**Motivasyon İpuçları:**
💡 Her sabah pozitif affirmation
💡 Başarı hikayeleri oku
💡 Kendine inan
💡 Başarısız olma korkusundan sakın`,

      "batini|ezoterik|kuantum|frequency": `✨ **Batini Panel - Gizli Bilgiler**

**Batini Panel Alanları:**
• 🔮 **Sırlar**: İçsel bilgi
• 💫 **Kozmik**: Evrensel enerji
• 🌊 **Teknikler**: İleri pratikler
• ⚛️ **Kuantum**: Frekans ve enerji
• 🔥 **Gizli Bilgi**: Öğretilmiş teknikleri

**Batini Pratikleri:**
1. Sessizlik ve meditasyon
2. Frekans dinleme
3. Enerji çalışmaları
4. Zihinsel disiplin
5. Bilinç genişlemesi

**Frekans Sistemi:**
• 432 Hz: İyileştirme
• 528 Hz: Transformasyon
• 963 Hz: Bilinç genişlemesi
• Solfejio dizileri

**Kuantum Healing:**
• Biometric tarama
• Enerji analizi
• Rezonans terapisi
• Seans kayıtları

**Gizli Bilgiler:**
⚠️ Responsibly kullanılmalı
✓ Kişisel gelişim için
✓ İyileştirme için
✓ Ruhsal büyüme için`,

      "quantum|healing|terapi|health": `🌀 **Quantum Healing Sayfası**

**Quantum Healing Nedir?**
Enerji, biometrik ve ruhani iyileştirme sistemi

**Sekmeler:**
1. **Scan**: Vücut taraması
2. **Library**: Frekans kütüphanesi
3. **Resonance**: Rezonans terapisi
4. **Therapy**: Seans yönetimi
5. **History**: Kayıt incelemesi

**Tarama Yapma:**
1. Scan sekmesine git
2. Başla butonuna tıkla
3. 5 dakika bekle
4. Sonucu gör
5. Raporu indir

**Frekans Seçme:**
• Temas seçin (başağrısı, stres, vb)
• İlgili frekansları lis
• Dinleme süresi belirle
• Her gün yapın

**Terapı Seanları:**
• Özel terapist seçin
• Saat belirle
• Video veya ses oturumu
• Notlar al

**Başarı Önerikleri:**
✓ Düzenli tarama yap
✓ Frekansları günlük dinle
✓ Ateya bakını tutar
✓ Terapiste düzenli git`,

      "support|help|destek|sorun": `🆘 **Yardım ve Destek**

**Hızlı Çözümler:**
1. FAQ sayfasını kontrol et
2. Video tutorial'ı izle
3. Canlı sohbet'e sor
4. Email gönder

**İletişim Kanalları:**
📧 Email: support@akngroup.com
💬 Canlı Chat: Member Panel'de
📞 Telefon: +90 XXX XXX XX XX
👥 WhatsApp Grubu: Toplu destek

**Yaygın Sorunlar:**
❓ Giriş yapamıyorum?
→ Şifremi unuttum butonuna tıkla

❓ Para çekme işlemi?
→ 3-5 iş günü sürer

❓ Referral linkini paylaş?
→ Member Panel > Paylaş sekmesi

❓ Eğitim video'su bulamıyorum?
→ Training sekmesine git

**Cevap Süresi:**
⏱️ Canlı chat: 5 dakika
📧 Email: 24 saat
📞 Telefon: İş saatleri`,

      "default": `👋 **Akn Yardımcısı'na Hoş Geldin!**

Sorularınız hakkında yardımcı olmak için buradayım. Aşağıdaki konulardan birini seçebilirsin:

📊 **Para & Gelir**
• Nasıl para kazanırım?
• Komisyon sistemi
• Ödeme ve çekme

👥 **Takım & Ağ**
• Takım kurma
• Referral sistemi
• Network büyütme

🛒 **Ürün & Satış**
• Ürün nasıl satılır?
• Clone page
• Müşteri bulma

📚 **Eğitim**
• Training programları
• Sertifikalar
• Liderlik kursu

🕌 **Ruhani**
• Manevi panel
• Meditasyon
• İslami içerik

💪 **Motivasyon**
• Psikoloji teknikleri
• Başarı hikayeleri
• Günlük ilham

✨ **Ileri Konular**
• Quantum healing
• Ezoterik bilgi
• Bilinç genişlemesi

📞 **Yardım İhtiyacın Mı?**
support@akngroup.com'a yaz!`,
    };

    // Advanced matching: çok yönlü anahtar kelime ve benzerlik araması
    const matches: Array<{ keywords: string; response: string; score: number }> = [];

    for (const [keywords, response] of Object.entries(responses)) {
      if (keywords === "default") continue;

      const keywordList = keywords.split("|").map(k => k.trim());
      let bestScore = 0;

      // 1. Tam eşleşme kontrol et
      for (const keyword of keywordList) {
        if (normalizedMessage.includes(keyword)) {
          bestScore = Math.max(bestScore, 1.0);
        }
      }

      // 2. Fuzzy matching - kelime benzerliği
      if (bestScore < 1.0) {
        for (const keyword of keywordList) {
          for (const word of messageWords) {
            const similarity = stringSimilarity(keyword, word);
            if (similarity > 0.6) {
              bestScore = Math.max(bestScore, similarity * 0.8);
            }
          }
        }
      }

      // 3. Partial matching - anahtar kelime kombinasyonu
      if (bestScore < 0.8) {
        const keywordCount = keywordList.filter(kw =>
          messageWords.some(w => stringSimilarity(kw, w) > 0.7)
        ).length;
        if (keywordCount > 0) {
          bestScore = Math.max(bestScore, (keywordCount / keywordList.length) * 0.7);
        }
      }

      if (bestScore > 0.4) {
        matches.push({ keywords, response, score: bestScore });
      }
    }

    // En yüksek puan alan cevabı döndür
    if (matches.length > 0) {
      matches.sort((a, b) => b.score - a.score);
      return matches[0].response;
    }

    // Hiçbir eşleşme yoksa, kelimeleri analiz et ve benzer cevap ara
    for (const [keywords, response] of Object.entries(responses)) {
      if (keywords === "default") continue;

      const keywordList = keywords.split("|");
      let hasMatch = false;

      for (const keyword of keywordList) {
        for (const word of messageWords) {
          if (word.length > 2 && stringSimilarity(keyword, word) > 0.5) {
            hasMatch = true;
            break;
          }
        }
        if (hasMatch) break;
      }

      if (hasMatch) {
        return response;
      }
    }

    // Default fallback
    return responses.default;
  } catch (error) {
    console.error("AI Assistant error:", error);
    return "Üzgünüm, bir problem oldu. Lütfen tekrar deneyin veya support@akngroup.com'a yazın.";
  }
}

// Ana endpoint: AI yardımcısı chat
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, userId, panelType, context, conversationHistory } =
      req.body as AssistantRequest;

    if (!message) {
      return res.status(400).json({ error: "Mesaj gerekli" });
    }

    const response = await getChatResponse(message, conversationHistory, {
      userId,
      panelType,
      ...context,
    });

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Sohbet işlemi başarısız",
      success: false,
    });
  }
});

// Yardımcı: Panel hakkında bilgi
router.post("/panel-guide", async (req: Request, res: Response) => {
  try {
    const { panelType } = req.body;

    const guides: Record<string, string> = {
      member: `
        📊 MEMBER PANEL REHBERI
        
        Sekmeler:
        • Dashboard: Genel özeti ve istatistikleri görmek
        • Team: Takım ve referral ağını görmek
        • Earnings: Kazançlar ve komisyonları takip etmek
        • Transactions: Cüzdan işlemlerini görmek
        • Manevi Panel: Ruhani içeriğe erişmek
        • Zahiri Panel: Motivasyon ve psikoloji içeriği
        • Batini Panel: Gizli ve ezoterik bilgiler
        • Training: Eğitim programlarını görmek
      `,
      admin: `
        👨‍💼 ADMIN PANEL REHBERI
        
        Ana Görevler:
        • Kullanıcı yönetimi ve aktivasyonu
        • Ürün ve komisyon ayarları
        • Eğitim ve broadcast yönetimi
        • Sistem ayarları ve raporlar
        • Master Blueprint yönetimi
        • API ve SDK yönetimi
      `,
      manevi: `
        🕌 MANEVI PANEL REHBERI
        
        Özellikler:
        • Kur'an cüzleri
        • Esma-ül Hüsna (99 Güzel İsim)
        • Hatim takibi
        • Hadis ve Sünnet
        • Zikir ve dua
      `,
      zahiri: `
        💪 ZAHIRI PANEL REHBERI
        
        İçerik:
        • Motivasyon teknikleri
        • Psikoloji ve kişisel gelişim
        • Meditasyon müzikleri
        • Başarı hikayeleri
        • Evliya sözleri
      `,
      batini: `
        ✨ BATINI PANEL REHBERI
        
        Alanlar:
        • Kozmik frekanslar
        • Quantum healing
        • Enerji teknikleri
        • Sır bilgiler
      `,
    };

    const guide = guides[panelType] || guides["member"];

    res.json({
      success: true,
      guide,
    });
  } catch (error) {
    console.error("Panel guide error:", error);
    res.status(500).json({ error: "Rehber alınamadı", success: false });
  }
});

// Yardımcı: Hızlı cevaplar (FAQ)
router.post("/quick-answers", async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;

    const faqs: Record<string, string[]> = {
      commission: [
        "Komisyon sistemi tanımı: Ekibinize pazarlama yaptığınızda % komsiyon kazanırsınız",
        "Monoline bonus: Doğrudan referral'larınızdan gelir",
        "Pool bonus: Ekip toplamından belirli kısmı",
        "Pasif gelir: Sistem otomatik dağıtır",
      ],
      earnings: [
        "Kazanç = Kişisel satış + Monoline + Pool + Pasif",
        "Aylık özetinizi Dashboard'dan görebilirsiniz",
        "Cekim: Cüzdan > Para çek > Bankaya aktar",
        "Minimum çekim tutarı admin panelinde tanımlı",
      ],
      team: [
        "Takım = Doğrudan + Dolaylı referral'lar",
        "Monoline = Tek satır, sırasız referral'lar",
        "Tree view'da hiyerarşi görülebilir",
        "Yeni referral: Paylaş linki ile davet et",
      ],
      products: [
        "Ürün satarak direkt gelir kazanırsınız",
        "Clone page: Kendi mağazanız, kendi ürünleriniz",
        "Checkout: Güvenli ödeme, tek tıklama",
        "Raporlar: Tüm satışlar Dashboard'da görülür",
      ],
      manevi: [
        "Manevi panel ruhani gelişim için",
        "Kur'an, hadis, esma, zikir içeriği",
        "Her gün yapılabilecek pratikler var",
        "Hatim: Kur'an bitirme takibi",
      ],
      training: [
        "Training: Sistem hakkında eğitim videoları",
        "Live broadcast: Canlı eğitim oturumları",
        "Sertifikalar: Başarı belgeleriniz",
        "Önerilen sıra: Temel > Orta > İleri",
      ],
    };

    const answers = faqs[topic] || faqs["commission"];

    res.json({
      success: true,
      topic,
      answers,
    });
  } catch (error) {
    console.error("Quick answers error:", error);
    res.status(500).json({ error: "Cevaplar alınamadı", success: false });
  }
});

// Yardımcı: Adım adım rehber
router.post("/step-guide", async (req: Request, res: Response) => {
  try {
    const { action } = req.body;

    const guides: Record<string, string[]> = {
      "earn-money": [
        "1️⃣ Hesap oluştur ve doğrula",
        "2️⃣ Profil bilgilerini tamamla",
        "3️⃣ Üyelik paketi satın al",
        "4️⃣ Dashboard'da özeti görmek başlıyacaksın",
        "5️⃣ Insanları davet et (Paylaş > Referral link)",
        "6️⃣ Ürün sat (Clone page'de)",
        "7️⃣ Aylık kazancları takip et",
        "8️⃣ Cüzdandan para çek",
      ],
      "setup-clone": [
        "1️⃣ Member Panel > Clone Products",
        "2️⃣ Kendi ürünlerini ekle",
        "3️⃣ Fiyatı ve açıklamayı yaz",
        "4️⃣ Resmi yükle",
        "5️⃣ Paylaş linkini al",
        "6️⃣ Sosyal medyada duyur",
        "7️⃣ Satışları takip et",
      ],
      "join-training": [
        "1️⃣ Member Panel > Training sekmesine git",
        "2️⃣ Yaklaşan eğitimleri gör",
        "3️⃣ İlgilendiren eğitimi seç",
        "4️⃣ Katıl butonuna tıkla",
        "5️⃣ Link ya da video başlayacak",
        "6️⃣ Notu tamamla ve sertifika al",
      ],
      "withdraw": [
        "1️⃣ Member Panel > E-Wallet sekmesine git",
        "2️⃣ Bakiyeni kontrol et",
        "3️⃣ Para Çek butonuna tıkla",
        "4️⃣ Çekilecek tutarı gir",
        "5️⃣ Banka hesabını seç",
        "6️⃣ Onayla",
        "7️⃣ 1-3 iş günü içinde paranı alırsın",
      ],
    };

    const steps = guides[action] || guides["earn-money"];

    res.json({
      success: true,
      action,
      steps,
    });
  } catch (error) {
    console.error("Step guide error:", error);
    res.status(500).json({ error: "Rehber alınamadı", success: false });
  }
});

export default router;
