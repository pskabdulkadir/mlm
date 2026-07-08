import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Users,
  TrendingUp,
  Network,
  Heart,
  Shield,
  Award,
  Star,
  Zap,
  CheckCircle,
  Play,
  MessageCircle,
  Phone,
  Mail,
  Share2,
  Copy,
  Twitter,
  Facebook,
  Instagram,
  ExternalLink,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { SystemPresentation } from "@/components/SystemPresentation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClonePageData {
  clonePage: {
    userId: string;
    slug: string;
    isActive: boolean;
    visitCount: number;
    conversionCount: number;
    customizations: {
      headerImage?: string;
      testimonials?: string[];
      customMessage?: string;
      customTitle?: string;
    };
  };
  user: {
    fullName: string;
    memberId: string;
    referralCode: string;
    careerLevel: {
      name: string;
      description: string;
      commissionRate: number;
    };
  };
}

const membershipPackages = [
  {
    name: "Nefis Mertebesi Katılım Paketi",
    price: "$100",
    description: "Sisteme giriş ve tek hat (monoline) pozisyonu",
    features: [
      "Ömür boyu sistem aktivasyonu",
      "Sınırsız Monoline derinlik kazancı",
      "Kişisel klon sayfa ve mağaza",
      "Manevi rehberlik panel erişimi",
      "Gerçek zamanlı kazanç takibi",
    ],
    buttonText: "Hemen Katıl",
    popular: true,
  },
  {
    name: "Aylık Aktivasyon",
    price: "$20",
    period: "/ay",
    description: "Sürekli kazanç için aktif kal",
    features: [
      "Komisyon hakları devamlılığı",
      "Tüm içerik erişimi",
      "Pasif gelir sistemi",
      "Manevi rehberlik",
    ],
    buttonText: "Aktif Ol",
    popular: false,
  },
  {
    name: "Yıllık Premium Aktivasyon",
    price: "$200",
    period: "/yıl",
    description: "En avantajlı paket",
    features: [
      "1 yıllık tam aktivasyon",
      "Aylık ücret avantajı",
      "Ek bonuslar",
      "VİP içerik erişimi",
    ],
    buttonText: "Yıllık Seç",
    popular: false,
  },
];

const careerLevels = [
  { name: "Mülhime", description: "İlham alan", commission: "%1", passive: "5 Derinlik" },
  { name: "Mutmainne", description: "Huzura eren", commission: "%2", passive: "10 Derinlik" },
  { name: "Radiye", description: "Razı olan", commission: "%3", passive: "20 Derinlik" },
  { name: "Mardiyye", description: "Razı olunan", commission: "%4", passive: "40 Derinlik" },
  { name: "Safiyye", description: "Saflaşmış", commission: "%5", passive: "60 Derinlik" },
  { name: "Mürşid", description: "Mürşid seviyesi", commission: "%6", passive: "100 Derinlik" },
  { name: "Pir", description: "Pir seviyesi", commission: "%7", passive: "150 Derinlik" },
  { name: "Kutub", description: "Kutub seviyesi", commission: "%8", passive: "200 Derinlik" },
  { name: "Gavs", description: "Gavs seviyesi", commission: "%9", passive: "300 Derinlik" },
  { name: "İnsan-ı Kamil", description: "Olgunluğa ermiş", commission: "%10", passive: "Sonsuz" },
];

const features = [
  {
    icon: Network,
    title: "🌐 Monoline Sistemi",
    description: "Sizden sonra giren tüm dünya üyelerinden pay alma imkanı",
  },
  {
    icon: Zap,
    title: "🚀 25-15-60 Kazancı",
    description: "Sponsor, Hattın Payı ve Sistem Havuzu dağıtımı",
  },
  {
    icon: TrendingUp,
    title: "🌳 Sonsuz Derinlik",
    description: "Küresel tek hat üzerinde sınırsız derinlik kazancı",
  },
  {
    icon: Heart,
    title: "Manevi Gelişim",
    description: "Ruhsal ve finansal büyüme bir arada",
  },
];

const testimonials = [
  {
    name: "Ayşe K.",
    location: "İstanbul",
    text: "AKN Group ile hem manevi hem finansal gelişimimi sağladım. 6 ayda 50 kişilik ekip oluşturdum.",
    rating: 5,
  },
  {
    name: "Mehmet S.",
    location: "Ankara",
    text: "Nefis mertebelerini öğrenmek ve aynı zamanda gelir elde etmek harika. Herkese tavsiye ederim.",
    rating: 5,
  },
  {
    name: "Fatma Y.",
    location: "İzmir",
    text: "Ruhsal Gelişim sistemi sayesinde pasif gelir elde ediyorum. Manevi gelişim içerikleri çok faydalı.",
    rating: 5,
  },
];

export default function ClonePage() {
  const { slug } = useParams();

  // High-Legibility Elegant Light Spiritual Theme
  const vividTheme = {
    gradientBg: "bg-slate-50",
    cardBg: "bg-white border-slate-100 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden",
    buttonPrimary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/10",
  };
  
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<ClonePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchClonePageData(slug);
      trackVisit(slug);
    }
  }, [slug]);

  const fetchClonePageData = async (pageSlug: string) => {
    try {
      const response = await fetch(`/api/clone/${pageSlug}`);
      if (response.ok) {
        const data = await response.json();
        setPageData(data);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching clone page:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async (pageSlug: string) => {
    try {
      await fetch(`/api/clone/${pageSlug}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error tracking visit:", error);
    }
  };

  const handleJoinClick = () => {
    if (pageData?.user) {
      navigate(`/register?sponsor=${pageData.user.referralCode}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${vividTheme.gradientBg}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-100">
            <Crown className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${vividTheme.gradientBg}`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-800">Sayfa Bulunamadı</h1>
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${vividTheme.gradientBg}`}>
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 backdrop-blur-md bg-white/90 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-100">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900">
                  AKN Group
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold text-slate-700 hover:text-purple-600">
                  Giriş Yap
                </Button>
              </Link>
              <Button size="sm" onClick={handleJoinClick} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 rounded-xl">
                Katıl
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white border-b border-slate-100 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-indigo-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-100">
                <Award className="w-10 h-10 text-white" />
              </div>
              <Badge className="mb-4 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors px-3 py-1 font-semibold">
                {pageData?.user?.careerLevel?.name || "Member"} - Sponsor:{" "}
                {pageData?.user?.fullName}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-950">
              Manevi Rehberim
            </h1>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              {pageData?.clonePage?.customizations?.customTitle || ""}
            </h2>
            <p className="text-lg md:text-xl text-slate-800 mb-6 max-w-3xl mx-auto leading-relaxed font-semibold">
              {pageData?.clonePage?.customizations?.customMessage ||
                `${pageData?.user?.fullName} size özel davet ile katılın. Manevi gelişim ve finansal özgürlük yolculuğuna birlikte başlayalım.`}
            </p>
            <p className="text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed font-semibold">
              7 seviyeli nefis mertebeleri sistemi ile hem ruhsal hem de
              finansal gelişim. Ruhsal Gelişim sistemi ile pasif gelir fırsatları.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setIsPresentationOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                <Eye className="w-5 h-5 mr-2" />
                Sistem Sunumunu İzle
              </Button>
              <Button
                size="lg"
                onClick={handleJoinClick}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-xl relative"
              >
                <Zap className="w-5 h-5 mr-2" />
                {pageData?.user?.referralCode} Sponsoruyla Katıl
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                  Sponsor Kayıtlı
                </div>
              </Button>
              <Link to="/kazanc">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-50 font-bold rounded-xl">
                  <Play className="w-5 h-5 mr-2 text-purple-600" />
                  Kazançları Görüntüle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Information */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-800 tracking-tight">
              Sponsorunuz: {pageData.user.fullName}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium text-sm md:text-base">
              {pageData.user.careerLevel?.description || "Aktif Üye"} seviyesindeki rehberiniz
              ile manevi ve finansal yolculuğunuza başlayın.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className={vividTheme.cardBg}>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-purple-100">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-center text-slate-800 text-lg">Kariyer Seviyesi</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-extrabold text-purple-700 mb-2">
                  {pageData.user.careerLevel?.name || "Member"}
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  %{pageData.user.careerLevel?.commissionRate || 0} doğrudan komisyon oranı
                </p>
              </CardContent>
            </Card>

            <Card className={vividTheme.cardBg}>
              <CardHeader>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-amber-100">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="text-center text-slate-800 text-lg">Deneyim</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-extrabold text-amber-600 mb-2">
                  Uzman Rehber
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Manevi konularda rehberlik ve destek
                </p>
              </CardContent>
            </Card>

            <Card className={vividTheme.cardBg}>
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-center text-slate-800 text-lg">Destek</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-extrabold text-emerald-600 mb-2">
                  7/24 Kesintisiz
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Kişiselleştirilmiş destek kanalları
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Member Info & Sharing Section */}
      <section className="py-12 bg-slate-100/50 border-b border-slate-200/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Member Info */}
            <Card className={vividTheme.cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  Sponsor Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">İsim:</span>
                  <span className="font-bold text-slate-800">{pageData.user.fullName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Üye ID:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {pageData.user.memberId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Sponsor Kodu:</span>
                  <span className="font-bold text-purple-700 font-mono">
                    {pageData.user.referralCode}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Kariyer Seviyesi:</span>
                  <Badge className="bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200">
                    {pageData.user.careerLevel.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Sharing Card */}
            <Card className={vividTheme.cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <Share2 className="w-5 h-5 mr-2 text-purple-600" />
                  Bu Sayfayı Paylaş
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                  Çevrenizi davet ederek ekosistemi büyütün ve kazanç elde edin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Copy Link */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">
                    {window.location.href}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 hover:bg-slate-50"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Sayfa linki kopyalandı!");
                    }}
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>

                {/* Social Media Sharing */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 text-slate-700"
                    onClick={() => {
                      const text = `${pageData.user.fullName} üzerinden AKN Group'a katılın! Manevi gelişim ve finansal özgürlük için: ${window.location.href}`;
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                        "_blank",
                      );
                    }}
                  >
                    <Twitter className="w-4 h-4 mr-1.5 text-sky-500" />
                    Twitter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 text-slate-700"
                    onClick={() => {
                      const text = `${pageData.user.fullName} üzerinden AKN Group'a katılın! ${window.location.href}`;
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
                        "_blank",
                      );
                    }}
                  >
                    <Facebook className="w-4 h-4 mr-1.5 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 text-slate-700"
                    onClick={() => {
                      const text = `AKN Group manevi gelişim platformuna katılın: ${window.location.href}`;
                      window.open(
                        `whatsapp://send?text=${encodeURIComponent(text)}`,
                        "_blank",
                      );
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 text-slate-700"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "AKN Group - Manevi Rehberim",
                          text: `${pageData.user.fullName} üzerinden katılın!`,
                          url: window.location.href,
                        });
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5 text-purple-600" />
                    Paylaş
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products CTA Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">
            🛍️ Premium Ürünlerden Alışveriş Yapın
          </h2>
          <p className="text-slate-800 mb-6 font-semibold text-sm md:text-base">
            <strong>{pageData.user.fullName}</strong> sponsorluğunda alışveriş yapın ve otomatik komisyon kazandırın!
          </p>

          <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="font-extrabold text-slate-900 mb-4 text-lg">Bu Sayfadan Alışveriş Avantajları:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-xs md:text-sm font-bold text-slate-750">
              <div className="flex items-center gap-2 justify-center">
                <Crown className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Otomatik sponsor komisyonu</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Zap className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span>Anında işlem ve dağıtım</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Share2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Sistem havuzunda %40 dağıtım</span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-6 text-lg font-bold shadow-lg transition-all rounded-xl cursor-pointer"
            onClick={() => {
              window.location.href = `/products?ref=${pageData.user.memberId}`;
            }}
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            Ürün Kataloğunu Keşfet
          </Button>
        </div>
      </section>

      {/* SystemPresentation & Features Section */}
      <SystemPresentation 
        open={isPresentationOpen} 
        onOpenChange={setIsPresentationOpen} 
        referralCode={pageData?.user.referralCode}
      />
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">
              Sistem Özellikleri
            </h2>
            <p className="text-slate-800 max-w-2xl mx-auto font-semibold">
              Modern teknoloji ile manevi değerleri birleştiren güçlü platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={vividTheme.cardBg}
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-purple-100">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 text-center text-sm font-semibold leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Packages */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">
              Üyelik Paketleri
            </h2>
            <p className="text-slate-800 max-w-2xl mx-auto font-semibold text-sm md:text-base">
              Size uygun paketi seçin ve manevi yolculuğunuza{" "}
              {pageData.user.fullName} ile başlayın
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {membershipPackages.map((pkg, index) => (
              <Card
                key={index}
                className={`relative ${vividTheme.cardBg} ${pkg.popular ? "ring-2 ring-purple-500 border-purple-200" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-sm uppercase tracking-wider">
                      Popüler
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-slate-800">{pkg.name}</CardTitle>
                  <div className="text-3xl font-extrabold text-purple-700 mt-2">
                    {pkg.price}
                    {pkg.period && (
                      <span className="text-slate-400 text-lg font-semibold">
                        {pkg.period}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-slate-500 font-medium">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 border-t border-slate-100 pt-4">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-slate-600 font-medium">
                        <CheckCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 rounded-xl font-bold cursor-pointer ${pkg.popular ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={handleJoinClick}
                  >
                    {pkg.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Career System */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">
              7 Manevi Mertebe
            </h2>
            <p className="text-slate-800 max-w-2xl mx-auto font-semibold">
              Ruhsal gelişim ile finansal başarıyı birleştiren kariyer sistemi
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {careerLevels.map((level, index) => (
              <Card
                key={index}
                className={`${vividTheme.cardBg} ${level.name === pageData.user.careerLevel.name
                  ? "ring-2 ring-purple-600 bg-purple-50/10 border-purple-200"
                  : ""
                  }`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-purple-100">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">{level.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-center">
                  <p className="text-slate-700 font-bold text-xs leading-relaxed min-h-[32px]">{level.description}</p>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold">
                    <span className="text-amber-700">
                      Prim: {level.commission}
                    </span>
                    <span className="text-emerald-700">
                      Pasif: {level.passive}
                    </span>
                  </div>
                  {level.name === pageData.user.careerLevel.name && (
                    <Badge className="w-full justify-center bg-purple-600 text-white mt-2 font-bold text-[10px] uppercase py-1">
                      Sponsorunuzun Seviyesi
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">
              Üye Deneyimleri
            </h2>
            <p className="text-slate-800 max-w-2xl mx-auto font-semibold">
              Sisteme katılan üyelerimizin başarı hikayeleri
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={vividTheme.cardBg}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800">
                        {testimonial.name}
                      </CardTitle>
                      <p className="text-xs text-slate-400 font-medium">
                        {testimonial.location}
                      </p>
                    </div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 italic text-sm font-medium leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Guarantee Section */}
      <section className="py-12 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-amber-500/5 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className={vividTheme.cardBg}>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-purple-100">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-slate-800 tracking-tight">
                  ✅ Sponsorluk Garantisi
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6 max-w-md mx-auto">
                  <p className="text-sm font-bold mb-2 text-slate-500 uppercase tracking-wider">
                    Bu sayfadan kayıt olduğunuzda otomatik olarak:
                  </p>
                  <div className="text-xl font-extrabold text-purple-700">
                    <span className="text-slate-500 font-medium text-base">Sponsor: </span>
                    {pageData.user.fullName}
                  </div>
                  <div className="text-lg font-bold text-indigo-700 mt-1">
                    <span className="text-slate-500 font-medium text-base">Referans Kodu: </span>
                    {pageData.user.referralCode}
                  </div>
                </div>
                <p className="text-slate-600 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
                  Bu sayfadaki herhangi bir "Katıl" butonuna tıkladığınızda,
                  sponsorluğunuz otomatik olarak{" "}
                  <strong>{pageData.user.fullName}</strong>{" "}
                  üzerinden kaydedilecektir. Böylece doğru rehberinizle
                  yolculuğunuza başlayacaksınız.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action & Fast Embedded Registration */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-purple-100 bg-white shadow-xl overflow-hidden rounded-3xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8 text-white text-center">
              <Users className="w-12 h-12 mx-auto mb-3" />
              <h2 className="text-3xl font-black mb-2">Hemen Kaydolun ve Katılın!</h2>
              <p className="text-purple-100 max-w-2xl mx-auto text-sm font-medium leading-relaxed">
                {pageData.user.fullName} sponsorluğunda manevi ve finansal gelişim yolculuğunuza doğrudan başlayın.
              </p>
            </div>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-amber-500 animate-pulse" />
                    Doğru Sponsorla Başlayın
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    Sponsorunuz <strong>{pageData.user.fullName}</strong> size manevi mertebeler ve finansal hedeflerinizde rehberlik edecektir.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-500 font-bold">
                    <li className="flex items-center gap-1.5">• 7 kademeli Ruhsal Gelişim Rehberliği</li>
                    <li className="flex items-center gap-1.5">• %25 Doğrudan Sponsor komisyonu kazanma hakkı</li>
                    <li className="flex items-center gap-1.5">• Ortak monoline havuzunda pasif gelir fırsatı</li>
                    <li className="flex items-center gap-1.5">• Kendi panelinizden yeni üyeler kaydetme yetkisi</li>
                  </ul>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs mt-4">
                    <strong className="text-slate-500 block mb-1">Referans Sponsor Kodu:</strong>
                    <span className="font-extrabold text-base text-purple-700">{pageData.user.referralCode}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Hızlı Kayıt Formu</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as any;
                    const fullName = target.fullName.value;
                    const email = target.email.value;
                    const phone = target.phone.value;
                    const password = target.password.value;
                    
                    try {
                      const response = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fullName,
                          email,
                          phone,
                          password,
                          sponsorCode: pageData?.user.referralCode,
                        }),
                      });

                      const resData = await response.json();

                      if (response.ok && resData.success) {
                        alert(`Üyeliğiniz başarıyla oluşturuldu! Üye ID: ${resData.user?.memberId}. Şimdi sisteme giriş yapabilirsiniz.`);
                        target.reset();
                        navigate("/login");
                      } else {
                        alert(resData.error || "Kayıt sırasında bir hata oluştu.");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Bağlantı hatası oluştu.");
                    }
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="quick-fullName" className="text-slate-700 font-bold">Adınız Soyadınız</Label>
                      <Input id="quick-fullName" name="fullName" placeholder="Örn: Ahmet Yılmaz" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="quick-email" className="text-slate-700 font-bold">E-posta Adresiniz</Label>
                      <Input id="quick-email" name="email" type="email" placeholder="Örn: ahmet@example.com" required className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="quick-phone" className="text-slate-700 font-bold">Telefon No</Label>
                        <Input id="quick-phone" name="phone" placeholder="5551234567" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="quick-password" className="text-slate-700 font-bold">Parola</Label>
                        <Input id="quick-password" name="password" type="password" placeholder="******" required className="mt-1" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 font-bold text-white shadow-lg py-3 rounded-xl cursor-pointer">
                      Kaydol ve Ekibe Katıl
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">
                AKN Group
              </span>
            </div>
            <p className="text-slate-400 mb-6 font-semibold text-sm">
              Manevi değerlerle sürdürülebilir büyüme
            </p>
            <div className="text-slate-400 space-y-2 text-xs md:text-sm">
              <p>
                Bu sayfa <strong>{pageData.user.fullName}</strong> tarafından paylaşılmaktadır.
              </p>
              <p>
                Ziyaret sayısı: {pageData.clonePage.visitCount} | Referans kodu:{" "}
                <span className="font-bold text-purple-300">{pageData.user.referralCode}</span>
              </p>
              <div className="bg-slate-850 rounded-2xl p-4 mt-6 max-w-md mx-auto border border-slate-800">
                <p className="text-purple-300 font-bold text-xs leading-relaxed">
                  🎯 Bu sayfadan kayıt olan herkes otomatik olarak{" "}
                  <span className="font-extrabold text-amber-400">
                    {pageData.user.referralCode}
                  </span>{" "}
                  sponsoru ile sisteme dahil olur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
