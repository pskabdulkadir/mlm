import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, X, ChevronDown, ChevronUp } from "lucide-react";

const sections = [
  {
    id: "giris",
    title: "1. Sisteme Giriş & Kayıt",
    icon: "🚀",
    content: `
AKN Group MLM sistemine kayıt olmak için aşağıdaki adımları izleyin:

📌 KAYIT ADIMLARI:
• Sponsorunuzun klon sayfasına gidin: yourdomain.com/clone/SPONSOR_ID
• "Üye Ol" butonuna tıklayın
• Ad-soyad, e-posta, telefon ve şifrenizi girin
• Kayıt tamamlandığında sisteme "Nefs-i Emmare" kariyer seviyesiyle giriş yapmış olursunuz
• Otomatik olarak bir klon sayfa oluşturulur: yourdomain.com/clone/SİZİN_ÜYE_ID

📋 ÜYE PANELİ'ne erişim:
• Sağ üst köşeden "Giriş Yap" → E-posta ve şifrenizi girin
• Otomatik olarak Üye Paneline yönlendirilirsiniz

💡 ÖNEMLİ: Klon sayfanız kayıt olur olmaz anında kurulur ve ücretsiz olarak paylaşmaya hazır hale gelir!
    `,
  },
  {
    id: "aktivasyon",
    title: "2. Üyelik Aktivasyonu & Cüzdan Sistemi",
    icon: "✅",
    content: `
Komisyon kazanmak ve sistemden ödeme alabilmek için üyeliğinizi aktif etmeniz gerekir.

💳 AKTİVASYON SEÇENEKLERİ:
• Giriş Paketi: $100 (Tek seferlik — Monoline pozisyonu + klon sayfa + tüm komisyon hakları)
• Aylık Aktivasyon: $20/ay
• Yıllık Premium: $200/yıl (Ekstra havuz avantajı)

⚡ INSTANT WALLET (Anlık Cüzdan):
• Yaptığınız satışların komisyonları cüzdanınıza anında (real-time) eklenir. Bekleme süresi yoktur.
• Cüzdan bakiyenizi anlık olarak Üye Paneli üzerinden takip edebilirsiniz.

📄 DEKONT YÜKLEMELİ AKTİVASYON:
1. Üye Paneli → "📄 Dekont" sekmesine gidin
2. Banka hesabına ödeme yapın (TRY/USD/EUR/BTC)
3. Dekontu yükleyin → Admin onayladığında aktivasyon gerçekleşir

🏦 BANKA HESAPLARI:
• TRY: QNB Finans Bank — IBAN: TR86 0011 1000 0000 0091 7751 22
• USD: Silicon Valley Bank — IBAN: US64 SVBK US6S 3300 9673 8637
• EUR: Commerzbank AG — IBAN: DE89 3704 0044 0532 0130 00

✅ Aktif üyeler tüm komisyon, bonus ve pasif gelir haklarına sahip olur.
    `,
  },
  {
    id: "kariyer",
    title: "3. Kariyer Seviyeleri (10 Nefis Mertebesi)",
    icon: "🏆",
    content: `
AKN Group, tasavvuf geleneğine dayalı 10 kariyer seviyesine sahiptir. Yükselme otomatik olarak hesaplanır.

🌟 KARİYER SEVİYELERİ VE GEREKSİNİMLER:

1️⃣  Nefs-i Emmare (Sıfır Noktası)
    • Gerekli Ciro: $0
    • Direkt Referans: 0 kişi
    • Monoline Derinlik Sınırı: 1 Sıra

2️⃣  Nefs-i Mülhime (Yolculuk Başlangıcı)
    • Gerekli Ciro: $500
    • Direkt Referans: 2 aktif üye
    • Monoline Derinlik Sınırı: 10 Sıra
    • Liderlik Derinlik Bonusu: %0.5, Kariyer Bonusu: %3

3️⃣  Nefs-i Mutmainne
    • Gerekli Ciro: $1.500
    • Direkt Referans: 3 aktif üye
    • Monoline Derinlik Sınırı: 20 Sıra
    • Liderlik Derinlik Bonusu: %1.0, Kariyer Bonusu: %4

4️⃣  Nefs-i Radiye
    • Gerekli Ciro: $3.500
    • Direkt Referans: 4 aktif üye
    • Monoline Derinlik Sınırı: 40 Sıra
    • Liderlik Derinlik Bonusu: %1.5, Kariyer Bonusu: %5

5️⃣  Nefs-i Mardiyye
    • Gerekli Ciro: $7.500
    • Direkt Referans: 5 aktif üye
    • Monoline Derinlik Sınırı: 60 Sıra
    • Liderlik Derinlik Bonusu: %2.0, Kariyer Bonusu: %6

6️⃣  Nefs-i Safiyye
    • Gerekli Ciro: $15.000
    • Direkt Referans: 6 aktif üye
    • Monoline Derinlik Sınırı: 80 Sıra
    • Liderlik Derinlik Bonusu: %2.5, Kariyer Bonusu: %7

7️⃣  Nefs-i Mürşid
    • Gerekli Ciro: $30.000
    • Direkt Referans: 8 aktif üye
    • Monoline Derinlik Sınırı: 100 Sıra
    • Liderlik Derinlik Bonusu: %3.0, Kariyer Bonusu: %8

8️⃣  Nefs-i Pir
    • Gerekli Ciro: $60.000
    • Direkt Referans: 10 aktif üye
    • Monoline Derinlik Sınırı: 150 Sıra
    • Liderlik Derinlik Bonusu: %4.0, Kariyer Bonusu: %10

9️⃣  Nefs-i Kutub
    • Gerekli Ciro: $120.000
    • Direkt Referans: 12 aktif üye
    • Monoline Derinlik Sınırı: 200 Sıra
    • Liderlik Derinlik Bonusu: %5.0, Kariyer Bonusu: %12

🔟  Nefs-i İnsan-ı Kamil (Zirve)
    • Gerekli Ciro: $500.000
    • Direkt Referans: 20 aktif üye
    • Monoline Derinlik Sınırı: Sınırsız
    • Liderlik Derinlik Bonusu: %10.0, Kariyer Bonusu: %20

📊 KARİYER YÜKSELTME KURALLARI:
• Ekip cirosu: Ağınızdaki tüm satın almaların USD toplamı
• Her satın alma işlemi sonrası otomatik kariyer kontrolü yapılır
• Direkt üye sayısı, yalnızca sizin direkt sponsorladığınız aktif üyeleri sayar
• Kariyer seviyeniz Üye Paneli → Dashboard'da anlık görüntülenir
    `,
  },
  {
    id: "komisyon",
    title: "4. Komisyon & Adil Gelir Dağılımı",
    icon: "💰",
    content: `
Her ürün satışından ve paket alımından elde edilen ciro aşağıdaki adil oranlara göre bölünür:

💵 DETAYLI GELİR DAĞILIM ORANLARI:
• %50 → Şirket/Sistem Fonu (Sunucu, teknik altyapı ve operasyonel giderler)
• %25 → Direkt Sponsor Bonusu (Sizi sisteme dahil eden kişiye anlık ödenir)
• %10 → Unilevel Komisyonu (7 Seviye derinliğe kadar sponsor hattına dağıtılır)
• %10 → Haftalık Performans Havuzu (Başarı Primi - Satış yapan aktif üyeler paylaşır)
• %5  → Kariyer & Liderlik Derinlik Bonusları (Nefis seviyelerine göre derinlik primi)

🔗 UNİLEVEL KOMİSYON ORANLARI (7 Seviye):
• Seviye 1 (Sponsor): %4
• Seviye 2: %2
• Seviye 3: %1
• Seviye 4: %1
• Seviye 5: %1
• Seviye 6: %0.5
• Seviye 7: %0.5

📌 KOMİSYON KURALlARI:
• Aktif üye olmanız gerekir (pasif üyeler komisyon alamaz)
• Komisyonlar anında cüzdanınıza eklenir
• Kazançlarınızı Üye Paneli → Kazançlar sekmesinden görebilirsiniz
    `,
  },
  {
    id: "monoline",
    title: "5. Haftalık Performans Havuzu (Kardeş Payı)",
    icon: "🌳",
    content: `
Sistemdeki havuz mekanizması tamamen performans odaklı ve adil bir yapıya bürünmüştür.

🔗 HAFTALIK PERFORMANS HAVUZU NASIL ÇALIŞIR?
• Tüm satış cirolarının %10'u bu havuzda birikir.
• Dağıtım her hafta Pazar geceleri otomatik olarak performans bazlı gerçekleştirilir.

🎯 KATILIM VE HAK KAZANMA ŞARTLARI:
• Üyenin sistemde aktiflik durumunun "Aktif" olması gerekir.
• Üyenin o hafta EN AZ 1 KİŞİSEL SATIŞ yapmış / sisteme yeni aktif üye kazandırmış olması şarttır (minSales: 1).
• Satış yapmayan veya o hafta pasif kalan üyeler havuzdan pay alamaz.

🧮 PROPORTIONAL (ORANSAL) DAĞITIM FORMÜLÜ:
• Havuzdaki biriken toplam tutar, hak sahibi olan (en az 1 satış yapan) üyelerin kişisel satış cirolarına oranla paylaştırılır.
• Formül: (Sizin Haftalık Satışınız / Havuz Hak Sahiplerinin Toplam Satışı) × Havuzdaki Toplam Para
• Bu sayede çok satış getiren üye havuzdan getirdiği ciroyla orantılı olarak çok yüksek pay alır. Satış yapmayanların payları havuzda sonraki haftaya devreder (roll-over).
    `,
  },
  {
    id: "uye-paneli",
    title: "6. Üye Paneli — Tüm Sekmeler",
    icon: "📱",
    content: `
Üye Panelindeki tüm sekme ve butonların açıklaması:

🏠 DASHBOARD:
• Kazanç özeti (Sponsor, Kariyer, Pasif, Liderlik bonusları)
• Hızlı paylaşım linki (WhatsApp, E-posta, Kopyala, QR Kod)
• Son eklenen ekip üyeleri
• Haftalık Performans Havuzu Canlı Takip Paneli (Tahmini kazanç ve satış sayacı)

📄 DEKONT:
• Ödeme dekontu yükleme ve üyelik aktivasyon talebi gönderme

👥 EKİBİM:
• Direkt referanslarınızın listesi, durumları ve kariyerleri

🌳 MONOLİNE HATTIM:
• Ağ ağacı görsel haritası ve altınızdaki üyelerin takibi

🛍️ ÜRÜN MAĞAZAM:
• Kişisel klon mağaza linki, ziyaretçi sayaçları ve satış istatistikleri

💰 KAZANÇLAR & İŞLEMLER:
• Tüm finansal hareket geçmişi, anlık cüzdan bakiyesi detayı
• Para Çekme (Withdraw) talebi oluşturma

📁 DÖKÜMANLAR:
• Paylaşılan sistem dosyaları ve eğitim materyalleri

🕌 MANEVİ & ZAHİRİ & BATINİ PANELLER:
• Hatim takibi, nefis analizi, manevi korumalar ve İlm-i Ledün dersleri

🎥 EĞİTİMLER:
• Canlı Zoom eğitim oturumları ve geçmiş ders kayıtları
    `,
  },
  {
    id: "kazanc",
    title: "7. Kazanç Hesaplama Örnekleri",
    icon: "📊",
    content: `
Gerçek senaryolarla kazanç hesaplama örnekleri:

📌 ÖRNEK 1 — Direkt Satış ($100 ürün satışı):
• Siz (sponsor): $25.00 direkt sponsor komisyonu (real-time cüzdana yansır)
• Üst sponsorunuz (L1): $4.00 unilevel kazancı
• Üst üst sponsorunuz (L2): $2.00 unilevel kazancı
• Sistem Havuzu: %10 ($10.00) haftalık performans havuzuna gider

📌 ÖRNEK 2 — Haftalık Performans Havuzu Örneği:
• Havuzda bu hafta $1,000 biriktiğini varsayalım.
• Hak kazanan sadece 3 üye var:
  - Üye A: 1 Satış yaptı ($100)
  - Üye B: 3 Satış yaptı ($300)
  - Üye C: 6 Satış yaptı ($600)
• Toplam hak sahipleri satışı: $1,000
• Dağıtım Tutarları:
  - Üye A: (100 / 1000) × 1000 = $100 havuz payı alır
  - Üye B: (300 / 1000) × 1000 = $300 havuz payı alır
  - Üye C: (600 / 1000) × 1000 = $600 havuz payı alır

💡 GÖRÜLDÜĞÜ GİBİ: Ne kadar çok çalışır ve satış yaparsanız, global havuzdan o kadar devasa "Kardeş Payı" kazanırsınız!
    `,
  },
  {
    id: "clone",
    title: "8. Klon Sayfa & Klon Mağaza Yönetimi",
    icon: "🔗",
    content: `
Her üyenin kendine özel bir pazarlama sayfası (klon sayfa) bulunur.

🌐 KLON SAYFANIZ:
• URL: yourdomain.com/clone/ÜYE_ID (örn: /clone/ak000001)
• Kayıt olur olmaz anında aktifleşir. Reklam ve tanıtımlarınız için bu linki kullanın.
• Ziyaretçiler direkt sizin sponsorluğunuzla kayıt olur ve ekibinize dahil olur.

🛍️ KLON MAĞAZA:
• Ürün Mağazam sekmesinden klon mağaza linkini alın.
• Ziyaretçiler bu mağazadan alışveriş yaptığında sistem otomatik satışı sizin hanenize yazar, komisyonları anında cüzdanınıza ekler.
• Mağaza linki: yourdomain.com/clone-products/ÜYE_ID

📲 PAYLAŞIM SEÇENEKLERİ:
• Tek tıkla WhatsApp, Telegram, E-posta hazır davet şablonları
• Mobil cihazlar için özel QR Kod oluşturucu
    `,
  },
  {
    id: "cuzdanim",
    title: "9. Çekim & Otomatik Aylık Onaylar",
    icon: "💳",
    content: `
Sistem finansal yönetimde tam hız ve güvenlik sunar.

⚡ ANINDA CÜZDAN GÜNCELLEMESİ (Real-Time):
• Yapılan her başarılı satış ve onaylanan her dekont sonrası komisyonlar anında cüzdan bakiyenize yansır.

📥 PARA ÇEKME (Withdraw):
• Cüzdanınızdaki bakiyeyi çekmek için her an çekim talebi oluşturabilirsiniz.
• Ödemeler banka hesaplarınıza veya kripto cüzdanınıza (BTC/USDT) gönderilir.

🔄 OTOMATİK AYLIK SÜREÇLER VE ONAYLAR:
• Sistem, aylık ödeme planlarını ve çekim talebi onaylarını otonom admin algoritmalarıyla her ay düzenli ve otomatik olarak gerçekleştirir.
• Üye bazında gecikme olmadan ödeme döngüleri otonom olarak kontrol edilir.
    `,
  },
  {
    id: "iletisim",
    title: "10. Destek & İletişim",
    icon: "📞",
    content: `
Herhangi bir konuda destek almak için aşağıdaki kanalları kullanabilirsiniz:

👤 ADMİN İLETİŞİM:
• Admin: Abdulkadir Kan
• E-posta: psikologabdulkadirkan@gmail.com
• Üye ID: ak000001

📱 DESTEK KANALLARI:
• WhatsApp: Klon sayfasındaki iletişim butonu
• E-posta: Sistem üzerinden mesaj
• Üye Paneli → Profil sekmesinden mesaj

✅ HATIRLATMA: Herhangi bir sorunuzda önce kılavuza ve sistem sunumuna bakın, ardından admin ile iletişime geçin.
    `,
  },
  {
    id: "master-blueprint",
    title: "11. Master Blueprint — Otonom & Gelişmiş Zeka Katmanı Modülleri",
    icon: "🧠",
    content: `
Sistemimizi 100 Milyon kullanıcı ölçeğine hazırlarken tasarlanan ve devreye giren en son otonom ve insan odaklı teknolojik modüllerin detayları:

🤖 1. OPERASYONEL VERİMLİLİK VE OTOMASYON MODÜLLERİ:
• Legacy Mode (Dijital Veraset): Her üye profilinden "Varis" atayabilir. Üye 6 ay boyunca inaktif kalırsa veya onaylı vefat durumunda sistem otomatik "Veraset Protokolü" başlatarak hesabı tüm alt ağacı ve primleriyle varise devreder.
• Shadow-Branch Recovery (Kayıp Dal Kurtarma): 30 gün boyunca inaktif olan sponsorların altındaki üyeler otonom tespit edilerek geçici olarak en aktif üst liderlere bağlanır. Eski sponsor geri döndüğünde ağaç yapısı otomatik olarak eski haline geri yüklenir.
• Energy-Efficiency (Algoritmik Temizlik): 6 ay boyunca hiç satış yapmayan ölü hesaplar pasif moda alınarak ağaç yapısı sıkıştırılır. Bu temizliği tetikleyen aktif liderlere "Sistem Verimlilik Primi" ödenir.

🌸 2. İNSAN ODAKLI VE PSİKOLOJİK DESTEK MODÜLLERİ:
• Predictive Insurance (Sistem İçi Sigorta Fonu): Toplam cirodan otomatik %0.5 kesintiyle "Sigorta Havuzu" oluşturulur. Kriz durumlarında veya hedef tutturamayan liderlerin o ayki sabit primleri bu havuzdan otonom desteklenir.
• Bio-Digital Synchronization (Psikolojik Koruma): Panel kullanım alışkanlıklarını ve satış hızını inceleyen AI, "tükenmişlik (burnout)" tespit ettiğinde üyeye "Zorunlu Dinlenme/Meditasyon Molası" tanımlar ve satış baskısını geçici kaldırır.
• Neuro-Feedback Gamification (Satış Reddi Eğitimi): Satış reddedilmelerini bir kayıp değil "veri toplama" olarak konumlandırıp, reddedilme sayılarına göre üyeye "Deneyimli Satıcı" ünvanı ve ödül puanı veren oyunlaştırma modeli.

🌍 3. SOSYAL BAĞLILIK VE TOPLUMSAL ETKİ:
• Collective Destiny Pool (Kardeşlik Havuzu): Üyelerin gönüllü yüzdelik kesinti katılımıyla (%0.1, %0.5 vb.) oluşturulan Kardeşlik Fonu, sağlık veya kaza gibi zor durumlardaki üyeleri otonom tespit edip yardımı otomatik aktarır.
• Eco-Sync (Gezegen Dostu Performans): Her 100$ aktiflik hacmi için bir "Doğa Kredisi" üretilir ve üyenin başarısı şirketin bağış bütçesiyle eşleştirilerek "Bu ay 3 ağaç diktin" gibi görsel panellerde sunulur.

💎 4. BİLGİ VE STRATEJİ EKONOMİSİ MODÜLLERİ:
• Cross-Pollination (Mentorluk Pazarı): Ekipler arası ücretli veya puanlı eğitim alışverişi sunan Mentorluk Pazarı. Eğitim veren kişiye "Teşekkür Bonusu" (Time-Credit) ödenir.
• Time-Bank (Zaman Bankası): 1 saatlik eğitim = 1 "Zaman Kredisi" olarak sistemde birikerek prim veya indirim olarak nakde çevrilebilir.
• Digital Reputation Marketplace: Başarılı liderlerin itibarını NFT benzeri dijital varlıklara dönüştürerek diğer ekiplerin koçluk/bilgi borsasında bu liderlere erişmesini sağlayan altyapı.
• Shadow-Branching (Gölge Modu): Liderlere, ağaç yapısını değiştirmeden önce "Şu kişiyi şuraya taşısam primim ne olur?" sorusunu simüle edebilecekleri güvenli bir "Sandbox" alanı sunar.

🔮 5. GELECEK VİZYONU MODÜLLERİ:
• Time-Travel Analytics (Kader Haritası): Üyenin çalışma hızına göre 1, 3 ve 5 yıllık başarı ve kazanç projeksiyonunu anlık hesaplayan AI simülasyonu. "Çalışma hızımı %20 artırırsam ne olur?" sorusunu yanıtlar.
    `,
  },
];

interface UserGuideModalProps {
  trigger?: React.ReactNode;
}

export function UserGuideModal({ trigger }: UserGuideModalProps) {
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    giris: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    sections.forEach((s) => (all[s.id] = true));
    setOpenSections(all);
  };

  const handlePrint = () => {
    expandAll();
    setTimeout(() => window.print(), 300);
  };

  const handleDownload = () => {
    expandAll();
    setTimeout(() => {
      const content = document.getElementById("guide-content");
      if (!content) return;

      const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<title>AKN Group — Kullanma Kılavuzu</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1a1a1a; margin: 20px; }
  h1 { color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 8px; }
  h2 { color: #5b21b6; margin-top: 24px; font-size: 16px; border-left: 4px solid #7c3aed; padding-left: 10px; }
  pre, p { white-space: pre-wrap; word-break: break-word; }
  .section { page-break-inside: avoid; margin-bottom: 20px; }
  @media print { body { margin: 10px; } h1 { font-size: 18px; } }
</style>
</head>
<body>
<h1>🌟 AKN Group MLM Sistemi — Kullanma Kılavuzu</h1>
<p><strong>Tarih:</strong> ${new Date().toLocaleDateString("tr-TR")}</p>
${sections
  .map(
    (s) => `
<div class="section">
  <h2>${s.icon} ${s.title}</h2>
  <pre>${s.content.trim()}</pre>
</div>`
  )
  .join("\n")}
</body>
</html>`;

      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AKN_Group_Kullanma_Kilavuzu.html";
      a.click();
      URL.revokeObjectURL(url);
    }, 350);
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #guide-print-area, #guide-print-area * { visibility: visible !important; }
          #guide-print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 20px; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-800 font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              Kullanma Kılavuzu
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white no-print rounded-t-lg">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <BookOpen className="w-7 h-7" />
              AKN Group — Kullanma Kılavuzu
            </DialogTitle>
            <p className="text-purple-200 text-sm mt-1">
              Kayıttan İnsan-ı Kamil'e — Tam sistem rehberi
            </p>
            <div className="flex gap-3 mt-4 no-print">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="w-4 h-4" />
                HTML Olarak İndir
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                📄 PDF Olarak Kaydet
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={expandAll}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Tümünü Aç
              </Button>
            </div>
          </DialogHeader>

          <div id="guide-print-area" className="p-6 space-y-4">
            <div id="guide-content">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 hover:from-purple-50 hover:to-indigo-50 transition-all text-left no-print"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <h3 className="font-bold text-gray-900 text-base">
                        {section.title}
                      </h3>
                    </div>
                    {openSections[section.id] ? (
                      <ChevronUp className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {openSections[section.id] && (
                    <div className="p-5 bg-white border-t border-gray-100">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                        {section.content.trim()}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-gray-400 pt-4 border-t no-print">
              AKN Group MLM Sistemi — Tüm hakları saklıdır •{" "}
              {new Date().getFullYear()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
