import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Globe, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </Link>
            <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center flex items-center justify-center space-x-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <span>🔒 Gizlilik Politikası</span>
                </CardTitle>
                <p className="text-center text-gray-700 text-lg">
                  AKN Group — Kişisel Verilerin Korunması ve Gizlilik Beyanı
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
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>1. Veri Sorumlusu</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>
                  İşbu Gizlilik Politikası, AKN Group tarafından yönetilen ruhsal gelişim ve çok katmanlı
                  pazarlama platformuna ilişkin kişisel veri işleme faaliyetlerini kapsamaktadır.
                </p>
                <div className="bg-blue-50 rounded-xl p-4 space-y-1 text-sm">
                  <p><strong>Şirket Adı:</strong> AKN Group</p>
                  <p><strong>Adres:</strong> London, United Kingdom</p>
                  <p><strong>E-posta:</strong> info@akngroup.com</p>
                  <p><strong>Veri Koruma İrtibat:</strong> privacy@akngroup.com</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <span>2. Toplanan Kişisel Veriler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>Platformumuza üye olduğunuzda veya hizmetlerimizi kullandığınızda aşağıdaki veriler toplanır:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="font-semibold text-gray-800">📋 Kimlik & İletişim</p>
                    <ul className="text-sm space-y-0.5 list-disc list-inside">
                      <li>Ad ve soyad</li>
                      <li>E-posta adresi</li>
                      <li>Telefon numarası</li>
                      <li>Üye kimlik numarası (ID)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="font-semibold text-gray-800">💳 Finansal Veriler</p>
                    <ul className="text-sm space-y-0.5 list-disc list-inside">
                      <li>Ödeme dekontları</li>
                      <li>Banka/cüzdan bilgileri</li>
                      <li>İşlem geçmişi</li>
                      <li>Komisyon kayıtları</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="font-semibold text-gray-800">🌐 Platform Verileri</p>
                    <ul className="text-sm space-y-0.5 list-disc list-inside">
                      <li>Giriş/çıkış kayıtları</li>
                      <li>Ekip yapısı bilgileri</li>
                      <li>Sponsor ilişkisi</li>
                      <li>Kariyer seviyesi</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="font-semibold text-gray-800">📊 Teknik Veriler</p>
                    <ul className="text-sm space-y-0.5 list-disc listinside">
                      <li>IP adresi</li>
                      <li>Tarayıcı türü</li>
                      <li>Erişim saati/tarihi</li>
                      <li>Cihaz bilgisi</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span>3. Verilerin İşlenme Amaçları</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Kişisel verileriniz aşağıdaki meşru amaçlarla işlenmektedir:</p>
                <ul className="space-y-2">
                  {[
                    "Üyelik kaydı ve hesap yönetimi",
                    "Komisyon ve bonus hesaplamaları ile ödemeleri",
                    "Kariyer seviyesi takibi ve güncellenmesi",
                    "Ekip (ağ) yapısının yönetimi ve raporlanması",
                    "Ödeme onayı ve dekont doğrulama işlemleri",
                    "Müşteri destek hizmetleri",
                    "Yasal yükümlülüklerin yerine getirilmesi (vergi, denetim)",
                    "Sistem güvenliği ve sahteciliğin önlenmesi",
                    "Platform iyileştirme ve hizmet kalitesi analizi",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  <span>4. Veri Güvenliği</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Verilerinizin korunması için endüstri standardı güvenlik önlemleri uygulanmaktadır:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>256-bit SSL/TLS şifreleme ile güvenli veri iletimi</li>
                  <li>Şifrelenmiş veritabanı depolama (bcrypt parola hashing)</li>
                  <li>Rol tabanlı erişim kontrolü — yalnızca yetkili personel erişimi</li>
                  <li>Oturum yönetimi ve otomatik güvenlik çıkışı</li>
                  <li>Düzenli güvenlik denetimleri ve penetrasyon testleri</li>
                  <li>UK GDPR ve KVKK uyumlu veri işleme süreçleri</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <span>5. Veri Paylaşımı</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Kişisel verileriniz üçüncü şahıslarla paylaşılmaz. Aşağıdaki istisnalar mevcuttur:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Yasal zorunluluk:</strong> Mahkeme kararı veya yetkili makam talebi</li>
                  <li><strong>Sponsor bilgisi:</strong> Yalnızca adınız ve üye ID'niz sponsorunuzla görünürdür</li>
                  <li><strong>Ödeme altyapısı:</strong> Ödeme doğrulama için ilgili banka/fintech hizmetiyle</li>
                </ul>
                <p className="text-sm text-gray-500 bg-yellow-50 rounded-xl p-3">
                  ⚠️ AKN Group, kişisel verilerinizi hiçbir koşulda reklam amaçlı üçüncü taraflara satmaz veya kiralamaz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>6. Haklarınız (GDPR / KVKK)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>UK GDPR ve ilgili veri koruma mevzuatı kapsamında aşağıdaki haklara sahipsiniz:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { right: "Erişim hakkı", desc: "Hangi verilerinizin işlendiğini öğrenme" },
                    { right: "Düzeltme hakkı", desc: "Hatalı verilerinizi güncelleme" },
                    { right: "Silme hakkı", desc: "Verilerinizin silinmesini talep etme" },
                    { right: "İşlemi kısıtlama", desc: "Belirli işlemlere itiraz etme" },
                    { right: "Taşınabilirlik", desc: "Verilerinizi başka platforma aktarma" },
                    { right: "İtiraz hakkı", desc: "Meşru menfaate dayalı işleme itiraz" },
                  ].map((item, i) => (
                    <div key={i} className="bg-blue-50 rounded-xl p-3">
                      <p className="font-semibold text-blue-800 text-sm">{item.right}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Haklarınızı kullanmak için <strong>privacy@akngroup.com</strong> adresine e-posta gönderin.
                  Talepler 30 gün içinde yanıtlanır.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span>7. Veri Saklama Süreleri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-700 text-sm">
                <div className="space-y-2">
                  {[
                    { type: "Üye hesap bilgileri", period: "Üyelik süresince + 3 yıl" },
                    { type: "Finansal işlem kayıtları", period: "7 yıl (yasal yükümlülük)" },
                    { type: "Oturum ve erişim logları", period: "1 yıl" },
                    { type: "Destek yazışmaları", period: "2 yıl" },
                    { type: "Ödeme dekontları", period: "5 yıl" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="font-medium">{item.type}</span>
                      <span className="text-blue-600 font-semibold">{item.period}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 text-blue-800">📞 İletişim & Şikayet</h3>
                <p className="text-gray-700 mb-4">
                  Gizlilik politikamıza ilişkin soru, talep veya şikayetleriniz için:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>E-posta:</strong> privacy@akngroup.com</p>
                  <p><strong>Genel İletişim:</strong> info@akngroup.com</p>
                  <p><strong>Adres:</strong> AKN Group, London, United Kingdom</p>
                  <p><strong>Denetim Makamı:</strong> UK — Information Commissioner's Office (ICO): <a href="https://ico.org.uk" className="text-blue-600 underline" target="_blank" rel="noreferrer">ico.org.uk</a></p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 text-center">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')} &nbsp;•&nbsp;
                  Bu politika UK GDPR ve Türkiye KVKK uyumludur &nbsp;•&nbsp;
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
