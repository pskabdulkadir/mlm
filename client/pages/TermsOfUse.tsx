import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Users, DollarSign, Scale, ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </Link>
            <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center flex items-center justify-center space-x-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <span>📜 Kullanım Koşulları & Üyelik Sözleşmesi</span>
                </CardTitle>
                <p className="text-center text-gray-700 text-lg">
                  AKN Group — Ruhsal Gelişim Ağı Üyelik Şartları
                </p>
                <p className="text-center text-gray-500 text-sm">
                  Yürürlük Tarihi: 1 Ocak 2025 &nbsp;|&nbsp; Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>1. Taraflar ve Kapsam</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>
                  Bu Kullanım Koşulları ve Üyelik Sözleşmesi ("Sözleşme"), <strong>AKN Group</strong> (London, United Kingdom)
                  ile platforma üye olan kişi ("Üye") arasında akdedilmiştir. Sisteme kayıt olarak veya
                  platformu kullanarak bu Sözleşmenin tüm hükümlerini okuduğunuzu, anladığınızı ve
                  kabul ettiğinizi beyan etmiş olursunuz.
                </p>
                <div className="bg-green-50 rounded-xl p-4 text-sm space-y-1">
                  <p><strong>Şirket:</strong> AKN Group</p>
                  <p><strong>Merkez:</strong> London, United Kingdom</p>
                  <p><strong>İletişim:</strong> info@akngroup.com</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>2. Üyelik Koşulları ve Aktivasyon</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Platforma üye olmak ve komisyon haklarından yararlanmak için:</p>
                <ul className="space-y-2">
                  {[
                    "18 yaşından büyük olmak zorunludur",
                    "Gerçek ve doğru kimlik/iletişim bilgileri sağlanmalıdır",
                    "Mevcut bir sponsorun referans linki üzerinden kayıt yapılmalıdır",
                    "Giriş Paketi ($100) veya Aylık Aktivasyon ($20/ay) ödenmelidir",
                    "Her üyeye otomatik bir klon sayfa ve üye ID atanır",
                    "Aynı kişi birden fazla hesap açamaz",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>3. Kariyer Sistemi ve Gereksinimler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>AKN Group'ta 10 kariyer seviyesi mevcuttur. Yükselme otomatik olarak hesaplanır:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="text-left p-2 border border-purple-200">Seviye</th>
                        <th className="text-left p-2 border border-purple-200">Min. Ekip Cirosu</th>
                        <th className="text-left p-2 border border-purple-200">Direkt Üye</th>
                        <th className="text-left p-2 border border-purple-200">Liderlik Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { level: "1 — Mülhime", turnover: "$500", directs: "2", bonus: "%3" },
                        { level: "2 — Mutmainne", turnover: "$1.500", directs: "3", bonus: "%4" },
                        { level: "3 — Radiye", turnover: "$3.500", directs: "4", bonus: "%5" },
                        { level: "4 — Mardiyye", turnover: "$7.500", directs: "5", bonus: "%6" },
                        { level: "5 — Safiyye", turnover: "$15.000", directs: "6", bonus: "%7" },
                        { level: "6 — Mürşid", turnover: "$30.000", directs: "8", bonus: "%8" },
                        { level: "7 — Pir", turnover: "$60.000", directs: "10", bonus: "%10" },
                        { level: "8 — Kutub", turnover: "$120.000", directs: "12", bonus: "%12" },
                        { level: "9 — Gavs", turnover: "$250.000", directs: "15", bonus: "%15" },
                        { level: "10 — İnsan-ı Kamil", turnover: "$500.000", directs: "20", bonus: "%20" },
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-2 border border-gray-200 font-medium text-purple-700">{row.level}</td>
                          <td className="p-2 border border-gray-200">{row.turnover}</td>
                          <td className="p-2 border border-gray-200">{row.directs}</td>
                          <td className="p-2 border border-gray-200 text-green-700 font-semibold">{row.bonus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500">* Ekip cirosu, tüm ağın toplam satın alma değeri üzerinden hesaplanır.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>4. Komisyon ve Ödeme Koşulları</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Her $100 ürün/paket satışından aşağıdaki dağılım yapılır:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { pct: "%25", label: "Direkt Sponsor Bonusu", color: "bg-green-100 text-green-800" },
                    { pct: "%10", label: "Unilevel (7 Seviye)", color: "bg-blue-100 text-blue-800" },
                    { pct: "%5", label: "Monoline Pasif Havuz", color: "bg-purple-100 text-purple-800" },
                    { pct: "%60", label: "Şirket Operasyon Fonu", color: "bg-gray-100 text-gray-800" },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-xl p-3 text-center ${item.color}`}>
                      <p className="text-2xl font-black">{item.pct}</p>
                      <p className="text-xs font-medium mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-sm mt-3">
                  <li>Komisyonlar, ödeme onayı sonrası anında dijital cüzdana yansır</li>
                  <li>Minimum çekim tutarı: $50</li>
                  <li>Çekim talepleri 3-7 iş günü içinde işleme alınır</li>
                  <li>Pasif (aktif olmayan) üyeler komisyon alamaz</li>
                  <li>Vergi yükümlülüğü üyenin kendi ülke mevzuatına tabidir</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldOff className="w-5 h-5 text-red-600" />
                  <span>5. Yasaklanan Faaliyetler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p className="font-semibold text-red-600">Aşağıdaki faaliyetler kesinlikle yasaktır ve üyelik iptali ile hukuki işlem sonucunu doğurur:</p>
                <ul className="space-y-2">
                  {[
                    "Sahte veya başkasına ait kimlik/belgelerle üyelik",
                    "Birden fazla hesap açma veya manipülasyon",
                    "Sisteme saldırı, hacking veya güvenlik ihlali",
                    "Diğer üyelerin bilgilerini rızasız kullanma",
                    "Yanıltıcı kazanç garantisi reklamı veya vaatten",
                    "Spam, phishing veya izinsiz toplu mesaj gönderme",
                    "Kara para aklama veya finansal dolandırıcılık",
                    "Şirketi karalayıcı veya iftira niteliğinde yayın yapma",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span>6. İade, İptal ve Hesap Kapatma</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside space-y-2">
                  <li>Giriş paketi ödemeleri, hizmet sunulduktan sonra iade edilmez</li>
                  <li>Aylık aktivasyon, iptal tarihine kadar geçerli kalır; iade yapılmaz</li>
                  <li>Üye, hesabını kapatma talebini info@akngroup.com adresine iletebilir</li>
                  <li>Hesap kapatma sonrası birikmiş komisyonlar mevcut ödeme koşullarında ödenir</li>
                  <li>Şirket, kural ihlali durumunda herhangi bir bildirim yapmaksızın hesabı askıya alabilir</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-gray-600" />
                  <span>7. Uygulanacak Hukuk ve Yetkili Mahkeme</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>
                  Bu Sözleşme, <strong>İngiltere ve Galler hukukuna</strong> tabidir. Herhangi bir uyuşmazlık
                  öncelikle dostane yollarla çözülmeye çalışılır. Anlaşmazlığın giderilemediği hallerde
                  <strong> Londra mahkemeleri</strong> yetkili kılınmıştır.
                </p>
                <p className="text-sm text-gray-600">
                  Türkiye'deki üyeler için tüketici hukuku kapsamındaki uyuşmazlıklarda Türk tüketici mahkemeleri
                  de yetkili olabilir.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-yellow-800">⚠️ Önemli Uyarı</h3>
                <p className="text-gray-700 mb-2">
                  AKN Group yasal bir çok katmanlı pazarlama (MLM) modelidir; piramit şeması değildir.
                  Kazançlar kişisel performans, ekip aktivitesi ve ürün/hizmet satışına bağlıdır.
                  <strong> Garantili veya sabit gelir vaat edilmez.</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Platforma katılmadan önce tüm koşulları dikkatlice okuyun. Finansal kararlarınızda
                  bağımsız bir mali danışmana başvurmanız tavsiye edilir.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 text-green-800">📞 Destek ve İletişim</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Genel İletişim:</strong> info@akngroup.com</p>
                  <p><strong>Teknik Destek:</strong> destek@akngroup.com</p>
                  <p><strong>Adres:</strong> AKN Group, London, United Kingdom</p>
                  <p><strong>Çalışma Saatleri:</strong> 09:00 – 18:00 (GMT, Hafta içi)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 text-center">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')} &nbsp;•&nbsp;
                  İngiltere ve Galler Hukukuna Tabidir &nbsp;•&nbsp;
                  AKN Group © {new Date().getFullYear()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
