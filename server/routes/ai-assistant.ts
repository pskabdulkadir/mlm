import express, { Request, Response } from "express";
import { GenerativeModel } from "@google/genai";

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

async function getChatResponse(
  message: string,
  conversationHistory: ChatMessage[] = [],
  context: Record<string, any> = {}
): Promise<string> {
  try {
    // Try Groq API first (free, unlimited)
    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT,
              },
              ...conversationHistory.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              {
                role: "user",
                content: message,
              },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          return data.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
        }
      } catch (groqError) {
        console.warn("Groq API error, falling back to Gemini:", groqError);
      }
    }

    // Fallback to Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return "API anahtarı yapılandırılmamış. Lütfen yöneticiyle iletişime geçin.";
    }

    const client = new GenerativeModel({
      apiKey: geminiApiKey,
      model: "gemini-3.5-flash",
    });

    const response = await client.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nKullanıcı sorusu: ${message}`,
            },
          ],
        },
      ],
    });

    const result = response.response.text();
    return result || "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
  } catch (error) {
    console.error("AI Assistant error:", error);

    // Mock response as fallback (for demo without API key)
    const mockResponses: Record<string, string> = {
      "nasıl para": "Merhaba! Para kazanmak için şu yolları kullanabilirsiniz:\n\n1. **Doğrudan Satış**: Ürün satarak para kazanırsınız\n2. **Referral Komisyonu**: Insanları davet ederek monoline bonus alırsınız\n3. **Ekip Bonusu**: Ekibinizin satışlarından % komsiyon kazanırsınız\n4. **Pasif Gelir**: Sistem otomatik olarak aylık dağıtım yapar",
      "komisyon": "Komisyon sistemi üç kısımdan oluşur:\n\n1. **Monoline**: Doğrudan davet ettiğiniz kişiden gelir\n2. **Pool Bonus**: Ekip toplamının % 'si\n3. **Pasif Gelir**: Aylık otomatik dağıtım\n\nSisteminiz sizin seviyenize göre uyarlanır.",
      "takım": "Takım kurma adımları:\n\n1. Paylaş butonuna tıklayın\n2. Referral linkini kopyalayın\n3. Sosyal medyada paylaşın\n4. İnsanlar tıklayıp kayıt yaptıkça takımınız büyür",
      "ürün": "Ürün satışından para kazanmak:\n\n1. Clone page'de ürün ekleyin\n2. Fiyat belirleyin\n3. Paylaş linkini ver\n4. Satış yapıldığında doğrudan para kazanın",
      "default": "Size nasıl yardımcı olabilirim? Sorularınız hakkında konuşabilirim:\n\n• Nasıl para kazanırım?\n• Komisyon sistemi\n• Takım kurma\n• Ürün satışı\n• Cüzdan işlemleri\n\nLütfen sorunuzu yazın.",
    };

    // Find matching response
    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(mockResponses)) {
      if (key !== "default" && lowerMessage.includes(key)) {
        return response;
      }
    }

    return mockResponses.default;
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
