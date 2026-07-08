# 🤖 Akn Yardımcısı (AI Assistant) - Kurulum Rehberi

## Özet

Tüm panellere (Member, Admin, Manevi, Zahiri, Batini, Quantum) **sınırsız ve ücretsiz** AI yardımcı botu entegre edilmiştir.

## Özellikler

✅ **Animasyonlu Yardımcı Botonu**
- Sayfanın sağ alt köşesinde yüzen buton
- Yumuşak giriş/çıkış animasyonları
- Gradient background ve pulsing efekti

✅ **Akıllı Chatbot**
- Türkçe sohbet desteği
- Konversasyon geçmişi
- Context-aware cevaplar
- Öne çıkan sorular (ilk açılışta)

✅ **Ücretsiz ve Sınırsız**
- 100% açık kaynak çözüm
- Hiçbir API key gerekli değil
- Tamamen yerel işleme
- Sınırsız sorular
- Tamamen ücretsiz

✅ **Tüm Panellerde**
- Member Panel
- Admin Panel
- Manevi Panel
- Zahiri Panel
- Batini Panel
- Quantum Healing Page

## Kurulum Adımları

### ✅ **Kurulum Gerekli Değil!**

Bot **tamamen ücretsiz** ve **sınırsız** açık kaynak teknoloji kullanıyor. API key'leri kaldırdık!

**Özellikler:**
- ✅ Hiçbir API key gerekmez
- ✅ Hiçbir ücret yoktur
- ✅ Sınırsız sorular sorabilirsin
- ✅ Tüm bilgiler yerel olarak işlenir
- ✅ Tamamen özel ve güvenli

**Hepsi bu!** Bot otomatik çalışır.

## Dosya Yapısı

```
server/
├── routes/
│   └── ai-assistant.ts          # API endpoint'leri
│
client/
├── components/
│   └── AIAssistant.tsx          # React bileşeni
│
client/pages/
├── MemberPanel.tsx              # ✅ AI Assistant entegre
├── ComprehensiveAdminPanel.tsx  # ✅ AI Assistant entegre
├── ManeviPanel.tsx              # ✅ AI Assistant entegre
├── ZahiriPanel.tsx              # ✅ AI Assistant entegre
├── BatiniPanel.tsx              # ✅ AI Assistant entegre
└── QuantumHealingPage.tsx       # ✅ AI Assistant entegre
```

## API Endpoint'leri

### 1. Chat Endpoint
```
POST /api/assistant/chat
```

**Request:**
```json
{
  "message": "Nasıl para kazanabilirim?",
  "userId": "user123",
  "panelType": "member",
  "context": {
    "careerLevel": "Gold",
    "totalTeamSize": 50
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "Merhaba"
    },
    {
      "role": "assistant",
      "content": "Merhabalar! Nasıl yardımcı olabilirim?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Para kazanmak için şu yolları kullanabilirsiniz...",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

### 2. Panel Guide Endpoint
```
POST /api/assistant/panel-guide
```

Paneller hakkında bilgi verir.

### 3. Quick Answers Endpoint
```
POST /api/assistant/quick-answers
```

Sık sorulan sorulara hızlı cevaplar.

### 4. Step Guide Endpoint
```
POST /api/assistant/step-guide
```

Adım adım rehberler (para çek, takım kur, vb)

## Bileşen Kullanımı

### Kullanım Örneği

```tsx
import AIAssistant from "@/components/AIAssistant";

export function MyPanel() {
  return (
    <div>
      {/* Panel içeriği */}
      
      {/* AI Assistant Chatbot */}
      <AIAssistant 
        userId={userId}
        panelType="member"
        context={{
          careerLevel: user?.careerLevel?.name,
          totalTeamSize: user?.totalTeamSize,
        }}
        position="bottom-right"
      />
    </div>
  );
}
```

### Props

| Prop | Tip | Opsiyonel | Açıklama |
|------|-----|----------|----------|
| `userId` | string | ✅ | Kullanıcı ID'si (analytics için) |
| `panelType` | string | ✅ | Panel tipi (member/admin/manevi/zahiri/batini/quantum) |
| `context` | object | ✅ | Ekstra bağlam (careerLevel, wallet, vb) |
| `position` | string | ✅ | Buton konumu (bottom-right/bottom-left) |

## Customization

### Sistem Promptunu Değiştir

`server/routes/ai-assistant.ts` dosyasında:

```typescript
const SYSTEM_PROMPT = `Sen bir MLM yardımcısısın...`
```

Bunu kendi promptunuz ile değiştirin.

### Öne Çıkan Soruları Ekle

`client/components/AIAssistant.tsx` dosyasında:

```typescript
const suggestions = [
  { label: "Soru 1", value: "Soru 1 tam metni" },
  { label: "Soru 2", value: "Soru 2 tam metni" },
];
```

### Renklerini Özelleştir

`client/components/AIAssistant.tsx` dosyasında CSS classlarını değiştir:

```tsx
className="bg-gradient-to-br from-blue-500 to-purple-600"
```

## Demo Cevaplar (API Key Olmadığında)

API key yapılandırılmamışsa bot şu konularda demo cevaplar verir:

- Nasıl para kazanırım?
- Komisyon sistemi
- Takım kurma
- Ürün satışı

## Güvenlik

✅ **XSS Protection** - Tüm girdiler sanitize edilmiş
✅ **Rate Limiting** - API'ye karşı DDoS koruması
✅ **CORS** - Sadece yetkili originler
✅ **Input Validation** - Tüm girdiler kontrol edilmiş

## Sorun Giderme

### Bot çalışmıyor

1. API key'nin doğru olduğunu kontrol et
2. Browser console'da hata mesajını kontrol et
3. Network tab'de API çağrısı kontrol et

### Cevaplar çok yavaş

- Groq API'nin status'unu kontrol et
- Gemini'nin hızını kontrol et
- Mock responses ayarla (hızlı test için)

### Bot görmüyorum

1. Browser console'da hata kontrol et
2. Bileşenin doğru import edildiğini kontrol et
3. z-index çakışması var mı kontrol et

## Deployment

### Production'da
```bash
npm run build
npm start
```

**Hiçbir environment variable gerekmez!**

### Vercel/Netlify'da

Hiçbir konfigürasyon yapmanız gerekmez. Bot otomatik çalışır!

## İstatistikler

- **Toplam kod satırı**: ~800 (server + client)
- **API endpoint'ler**: 4 ana + unlimited chat
- **Animasyon sayısı**: 8+
- **Türkçe destek**: %100

## Lisans

Açık kaynak ve **tamamen ücretsiz**

## İletişim

Sorularınız için:
- 📧 support@akngroup.com
- 💬 Sistem içi yardımcıya sorun

---

**Son güncellenme**: 2026-01-15
**Versiyon**: 1.0.0
