import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Target,
  TrendingUp,
  Users,
  Wallet,
  ShieldCheck,
  Star,
  Heart,
  Zap,
  Award,
  Globe,
  Flame,
  Brain,
  ArrowRight,
  Eye,
  Moon,
  Sparkles,
  Copy,
  Activity,
  ShieldAlert,
  CreditCard,
  X,
  Infinity as InfinityIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  color: string;
}

const enterFullscreen = () => {
  try {
    const el = document.documentElement as any;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    fn?.call(el);
  } catch (_) {
    console.debug?.("Fullscreen failed", _);
  }
};

const exitFullscreen = () => {
  try {
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
      const fn = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      fn?.call(doc);
    }
  } catch (_) {
    console.debug?.("Exit fullscreen failed", _);
  }
};

export function SystemPresentation({ open, onOpenChange, referralCode }: { open: boolean; onOpenChange: (open: boolean) => void; referralCode?: string }) {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track fullscreen state
  useEffect(() => {
    const onFsChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") { exitFullscreen(); onOpenChange(false); }
      if (e.key === "f" || e.key === "F") {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          enterFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, isFullscreen]);

  // Enter fullscreen & reset slide on open
  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [open]);

  const slides: Slide[] = [
    /* ── 1. AKN GROUP Giriş ── */
    {
      title: "AKN Group — Hibrit Tekamül",
      description: "Manevi, Zahiri ve Batıni Üçlü Sistem Mimarisi.",
      icon: <InfinityIcon className="w-10 h-10 text-white" />,
      color: "bg-emerald-900",
      content: (
        <div className="space-y-5">
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            AKN Group sistemi, insanın üç ana boyutunu (Madde, Mana ve Enerji) birleştiren dünyadaki ilk <b>"Hibrit Tekamül"</b> modelidir.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <Heart className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-emerald-800 text-xs uppercase">Manevi</h4>
              <p className="text-[10px] text-emerald-600 mt-1">Ruhun Gıdası</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-bold text-blue-800 text-xs uppercase">Zahiri</h4>
              <p className="text-[10px] text-blue-600 mt-1">Maddi Güç</p>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
              <Eye className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <h4 className="font-bold text-indigo-800 text-xs uppercase">Batıni</h4>
              <p className="text-[10px] text-indigo-600 mt-1">Enerji Boyutu</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-3 bg-gray-50 rounded-xl border text-center">
              <p className="text-2xl font-black text-emerald-700">$100</p>
              <p className="text-xs text-gray-500 mt-1">Giriş Paketi (≈ 3.450 TL)</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border text-center">
              <p className="text-2xl font-black text-blue-700">%60</p>
              <p className="text-xs text-gray-500 mt-1">Toplam Üye Komisyonu</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic text-center">
            "Sağlam bir ruh, güçlü bir enerji alanı ve bereketli bir ticari akış..."
          </p>
        </div>
      )
    },

    /* ── 2. Manevi Panel ── */
    {
      title: "Manevi Panel: Ruhsal Check-Up",
      description: "Kalbinizi her gün arındırın ve parlatın.",
      icon: <Sparkles className="w-10 h-10 text-white" />,
      color: "bg-emerald-700",
      content: (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm leading-relaxed">
            Manevi paneliniz, size özel <b>Esma-ül Hüsna</b> algoritmaları ve ruhsal takip çizelgeleriyle çalışır:
          </p>
          <div className="space-y-2">
            {[
              { icon: <BookOpen className="w-4 h-4 text-emerald-600" />, t: "İlim ve Adab Kütüphanesi", d: "Yüzlerce yıllık manevi birikime ve adab kitaplarına tek tıkla ulaşın." },
              { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, t: "Vird-i Zeban Takibi", d: "Size özel atanan virdleri günlük takip edin ve ruhsal notlar alın." },
              { icon: <Activity className="w-4 h-4 text-emerald-600" />, t: "Ruhsal Check-Up", d: "Haftalık manevi durumunuzu analiz eden akıllı sistem." },
              { icon: <Heart className="w-4 h-4 text-emerald-600" />, t: "Ortak Hatim Platformu", d: "Dünyanın her yerindeki üyelerle eş zamanlı hatimlere katılın." }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                <div>
                  <h5 className="text-xs font-black text-emerald-900 uppercase">{item.t}</h5>
                  <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },

    /* ── 3. Batıni Panel ── */
    {
      title: "Batıni Panel: Sırlar ve Enerjiler",
      description: "Görünmeyenin ardındaki hikmeti keşfedin.",
      icon: <Moon className="w-10 h-10 text-white" />,
      color: "bg-indigo-900",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            Hücrelerinizi ve enerji alanınızı koruyan <b>Kozmik Frekans ve Ebced</b> altyapısı:
          </p>
          <div className="space-y-2">
            <div className="p-4 bg-indigo-800/40 border border-indigo-500/30 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Ebced ve Numeroloji</span>
                <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs text-indigo-100 px-2 py-1.5 bg-indigo-500/20 rounded">İsim Analizi: Kaderin Şifresi</div>
                <div className="text-xs text-indigo-100 px-2 py-1.5 bg-indigo-500/20 rounded">Esma Hesaplama: Özel Frekans</div>
                <div className="text-xs text-indigo-100 px-2 py-1.5 bg-indigo-500/20 rounded">Zaman Analizi: Eşref Saatleri</div>
                <div className="text-xs text-indigo-100 px-2 py-1.5 bg-indigo-500/20 rounded">Rüya Tabiri: Sembollerin Dili</div>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-indigo-950/50 rounded-2xl border border-indigo-500/20">
              <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-200">Negatif enerjilere ve metafizik saldırılara karşı <b>"Manevi Zırh"</b> frekanslarını kullanarak alanınızı koruyun.</p>
            </div>
          </div>
        </div>
      )
    },

    /* ── 4. Zahiri Panel ── */
    {
      title: "Zahiri Panel: Finansal Özgürlük",
      description: "Dünyevi rızkınızı akıllı sistemlerle yönetin.",
      icon: <Zap className="w-10 h-10 text-white" />,
      color: "bg-orange-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Sisteme dahil olduğunuz an, teknoloji destekli bir <b>Global Ticaret Mağazası</b> sahibi olursunuz:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl">
              <Target className="w-5 h-5 text-orange-600 mb-2" />
              <h6 className="text-xs font-black text-orange-800 uppercase">Akıllı CRM Paneli</h6>
              <p className="text-[11px] text-orange-700 leading-tight mt-1">Yol arkadaşlarınızın gelişimini ve satışlarınızı anlık takip edin.</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl">
              <TrendingUp className="w-5 h-5 text-orange-600 mb-2" />
              <h6 className="text-xs font-black text-orange-800 uppercase">Bonus Simülatörü</h6>
              <p className="text-[11px] text-orange-700 leading-tight mt-1">Gelecek kazançlarınızı planlayın ve kariyer hedeflerinize ulaşın.</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl">
              <Wallet className="w-5 h-5 text-orange-600 mb-2" />
              <h6 className="text-xs font-black text-orange-800 uppercase">E-Cüzdan</h6>
              <p className="text-[11px] text-orange-700 leading-tight mt-1">Komisyonlarınızı anında görün, Stripe üzerinden çekin.</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl">
              <CreditCard className="w-5 h-5 text-orange-600 mb-2" />
              <h6 className="text-xs font-black text-orange-800 uppercase">Güvenli Ödeme</h6>
              <p className="text-[11px] text-orange-700 leading-tight mt-1">Stripe ile kredi kartı — PCI DSS uyumlu, 256-bit SSL.</p>
            </div>
          </div>
          <div className="p-3 bg-orange-100/50 rounded-xl border border-orange-200 flex items-center gap-3">
            <Globe className="w-5 h-5 text-orange-600 shrink-0" />
            <p className="text-xs text-orange-800"><b>Lojistik ve Tahsilat Yok:</b> Her şey sisteminiz tarafından otomatik yönetilir.</p>
          </div>
        </div>
      )
    },

    /* ── 5. Monoline Yapısı ── */
    {
      title: "Monoline: Global Büyüme Hattı",
      description: "Neden başkalarının başarısı sizin de başarınızdır?",
      icon: <Target className="w-10 h-10 text-white" />,
      color: "bg-blue-800",
      content: (
        <div className="space-y-5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Geleneksel ikili denge yapılarının aksine bizde <b>tek bir dünya hattı</b> vardır. Kaydınızı aldığınız an, saniyeler sonra kayıt olan herhangi bir üye alt hattınıza düşer.
          </p>
          <div className="flex flex-col items-center py-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="relative flex items-center gap-2 md:gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg">SİZ</div>
              <ArrowRight className="w-5 h-5 text-blue-400" />
              <div className="w-11 h-11 rounded-2xl bg-blue-300 flex items-center justify-center text-white font-bold text-xs shadow">Üye</div>
              <ArrowRight className="w-5 h-5 text-blue-300" />
              <div className="w-11 h-11 rounded-2xl bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shadow">Üye</div>
              <ArrowRight className="w-5 h-5 text-blue-200" />
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs shadow">Üye</div>
            </div>
            <p className="text-xs font-black text-blue-700 mt-3">DÜNYA SİZİN İÇİN ÇALIŞIYOR</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <p className="text-lg font-black text-blue-700">7 Seviye</p>
              <p className="text-xs text-blue-600">Derinlik Kazancı</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <p className="text-lg font-black text-blue-700">Sonsuz</p>
              <p className="text-xs text-blue-600">Üst Mertebede Derinlik</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic text-center">
            "Birlikte girdiğimiz bu yolda, global büyümeden herkes adil payını alır."
          </p>
        </div>
      )
    },

    /* ── 6. %25 Direkt Sponsor Primi ── */
    {
      title: "Anlık %25 Direkt Sponsor Primi",
      description: "Hızlı nakit akışının en kolay yolu.",
      icon: <Users className="w-10 h-10 text-white" />,
      color: "bg-blue-600",
      content: (
        <div className="space-y-5 text-center">
          <div className="relative inline-block">
            <div className="p-8 bg-white rounded-[2rem] border-4 border-blue-100 shadow-xl">
              <h3 className="text-6xl font-black text-blue-600 tracking-tighter">%25</h3>
              <p className="text-sm font-bold text-blue-400 mt-1 uppercase tracking-widest">Direkt Sponsor Primi</p>
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-md animate-bounce">
              <Zap className="w-5 h-5 fill-white" />
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed max-w-sm mx-auto">
            Referans kodunuzla kayıt olan her yeni iş ortağının yaptığı her paket veya ürün alımının <b>tam %25'i anında</b> e-cüzdanınıza yansır.
          </p>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-sm font-bold text-blue-800">Örnek: $100 paket satışı → <span className="text-blue-600">$25 anında kazanç</span></p>
          </div>
          <div className="flex justify-center gap-3">
            <div className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600">✅ ANLINDA ÖDEME</div>
            <div className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600">✅ SINIRS IZ REFERANS</div>
          </div>
        </div>
      )
    },

    /* ── 7. 7 Katmanlı Derinlik ── */
    {
      title: "7 Katmanlı Derinlik Kazancı",
      description: "Ekibiniz sizden bağımsız büyürken kazanın.",
      icon: <TrendingUp className="w-10 h-10 text-white" />,
      color: "bg-emerald-600",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Direkt sponsorluğun ötesinde, 7 seviye aşağıya kadar <b>Unilevel komisyon</b> kazanırsınız. Toplam: <b>%15</b>
          </p>
          <div className="space-y-1.5">
            {[
              { l: "1. Nesil (Doğrudan Referanslar)", p: "5%", w: "w-full" },
              { l: "2. Nesil", p: "3%", w: "w-11/12" },
              { l: "3. Nesil", p: "2%", w: "w-10/12" },
              { l: "4. Nesil", p: "2%", w: "w-9/12" },
              { l: "5. Nesil", p: "1%", w: "w-7/12" },
              { l: "6. Nesil", p: "1%", w: "w-5/12" },
              { l: "7. Nesil", p: "1%", w: "w-4/12" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <span className="text-xs font-black text-slate-800">{item.l}</span>
                </div>
                <div className="text-sm font-black text-emerald-600 w-12 text-right">{item.p}</div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
            <p className="text-xs text-emerald-800 font-bold">Toplam 7 seviye: <span className="text-emerald-600">%15</span> + Direkt sponsor: <span className="text-emerald-600">%25</span> = <span className="text-emerald-700">%40 üye kazancı</span></p>
          </div>
        </div>
      )
    },

    /* ── 8. %10 Pasif Gelir Havuzu ── */
    {
      title: "%10 Monoline Pasif Gelir Havuzu",
      description: "Sistem ciro yaptıkça havuz büyür, aktif üyeler paylaşır.",
      icon: <Globe className="w-10 h-10 text-white" />,
      color: "bg-purple-700",
      content: (
        <div className="space-y-4">
          <div className="p-5 bg-purple-50 border border-purple-100 rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-purple-700 tracking-tighter">MONOLINE HAVUZU</h3>
              <p className="text-sm text-purple-600 mt-2 leading-relaxed">
                Her ürün ve paket satışından <b>%10</b> otomatik olarak havuza aktarılır. Her ay başı aktif üyelere kariyer seviyesine göre dağıtılır.
              </p>
            </div>
            <Wallet className="absolute -right-8 -bottom-8 w-24 h-24 text-purple-200 opacity-40 rotate-[30deg]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { career: "Mülhime", rate: "0.5%" },
              { career: "Mutmainne", rate: "1%" },
              { career: "Radiye", rate: "1.5%" },
              { career: "Mardiyye", rate: "2%" },
              { career: "Safiyye", rate: "2.5%" },
              { career: "Mürşid", rate: "3%" },
              { career: "Pir", rate: "4%" },
              { career: "Kutub →", rate: "5–10%" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 bg-white rounded-xl border border-purple-100">
                <span className="text-xs text-gray-600">{item.career}</span>
                <span className="text-xs font-black text-purple-700">{item.rate}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1 p-2 bg-white border border-purple-100 rounded-xl text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">Dağıtım</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Her Ay Başı</p>
            </div>
            <div className="flex-1 p-2 bg-white border border-purple-100 rounded-xl text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">Aktiflik</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Son 30 Gün</p>
            </div>
          </div>
        </div>
      )
    },

    /* ── 9. 10 Kariyer Mertebesi ── */
    {
      title: "10 Kariyer Mertebesi",
      description: "Karakteriniz geliştikçe kazancınız artar.",
      icon: <Award className="w-10 h-10 text-white" />,
      color: "bg-amber-600",
      content: (
        <div className="space-y-3">
          <div className="overflow-y-auto max-h-72 pr-1 space-y-1.5">
            {[
              { n: "Nefs-i Mülhime",   bonus: "3%",  req: "$500 ekip cirosu / 2 ref",  depth: "10 sıra" },
              { n: "Nefs-i Mutmainne", bonus: "4%",  req: "$1.500 / 3 ref",            depth: "20 sıra" },
              { n: "Nefs-i Radiye",    bonus: "5%",  req: "$3.500 / 4 ref",            depth: "40 sıra" },
              { n: "Nefs-i Mardiyye",  bonus: "6%",  req: "$7.500 / 5 ref",            depth: "60 sıra" },
              { n: "Nefs-i Safiyye",   bonus: "7%",  req: "$15.000 / 6 ref",           depth: "80 sıra" },
              { n: "Mürşid",           bonus: "8%",  req: "$30.000 / 8 ref",           depth: "100 sıra" },
              { n: "Pir",              bonus: "10%", req: "$60.000 / 10 ref",          depth: "150 sıra" },
              { n: "Kutub",            bonus: "12%", req: "$120.000 / 12 ref",         depth: "200 sıra" },
              { n: "Gavs",             bonus: "15%", req: "$250.000 / 15 ref",         depth: "300 sıra" },
              { n: "İnsan-ı Kamil",    bonus: "20%", req: "$500.000 / 20 ref",         depth: "SONSUZ" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-amber-900 block truncate">{item.n}</span>
                  <span className="text-[10px] text-amber-600">{item.req} · {item.depth}</span>
                </div>
                <span className="text-sm font-black text-emerald-600 ml-2">{item.bonus}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white text-center shadow">
            <p className="text-xs font-black">İnsan-ı Kamil → %20 Kariyer Bonusu + Sonsuz Derinlik</p>
          </div>
        </div>
      )
    },

    /* ── 10. Zirve: İnsan-ı Kamil ── */
    {
      title: "Zirve: İNSAN-I KAMİL",
      description: "Şirketin küresel ortağı olma vakti.",
      icon: <Star className="w-10 h-10 text-white" />,
      color: "bg-slate-900",
      content: (
        <div className="relative p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-[2.5rem] overflow-hidden text-center space-y-5 border border-slate-700">
          <div className="relative z-10">
            <div className="inline-block px-4 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-black tracking-widest uppercase mb-2">
              VİZYON ORTAĞI
            </div>
            <h3 className="text-3xl font-black text-white mb-1">$500.000</h3>
            <p className="text-amber-400 text-sm font-semibold mb-4">20 Aktif Referans · Sonsuz Monoline Derinliği</p>
            <div className="grid grid-cols-1 gap-2.5 px-4 text-left">
              {[
                "%20 Kariyer Bonusu — tüm satışlarda",
                "Monoline pasif gelirde sonsuz derinlik",
                "%10 Global Havuzdan maksimum pay",
                "Uluslararası tatiller ve eğitim kampları",
                "Şirket yönetiminde danışma hakkı",
                "Süresiz ve limitsiz gelir potansiyeli"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3 text-black" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -top-10 -right-10 opacity-10">
            <Star className="w-48 h-48 text-amber-500 rotate-12" />
          </div>
        </div>
      )
    },

    /* ── 11. Helal Ürün ── */
    {
      title: "Helal Ürün ve Pazar Gücü",
      description: "Kaliteli ürün, dürüst ticaret.",
      icon: <ShieldCheck className="w-10 h-10 text-white" />,
      color: "bg-rose-700",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Marketimizdeki her ürün <b>helal sertifikalı</b> ve insan sağlığına/ruhuna faydalı olarak seçilmiştir:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
              <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <h6 className="text-xs font-black text-rose-800 uppercase">Doğal Takviyeler</h6>
              <p className="text-[10px] text-rose-600 mt-1">Vücut frekansını yükselten bitkisel çözümler.</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
              <BookOpen className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <h6 className="text-xs font-black text-rose-800 uppercase">Eğitim Paketleri</h6>
              <p className="text-[10px] text-rose-600 mt-1">Kişisel gelişim ve finansal okuryazarlık.</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
              <Brain className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <h6 className="text-xs font-black text-rose-800 uppercase">Dijital İçerik</h6>
              <p className="text-[10px] text-rose-600 mt-1">Video dersler ve manevi rehber kitapları.</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
              <Award className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <h6 className="text-xs font-black text-rose-800 uppercase">Üyelik Paketleri</h6>
              <p className="text-[10px] text-rose-600 mt-1">Giriş paketi $100'dan başlar, aylık aktiflik 1.000 TL.</p>
            </div>
          </div>
          <div className="p-3 bg-rose-100/50 rounded-xl text-xs text-rose-900 font-bold border border-rose-200">
            💰 Mağazanızdan yapılan her alışverişte hem perakende karı hem de ekip komisyonu kazanırsınız.
          </div>
        </div>
      )
    },

    /* ── 12. Özet — Neden Kazanıyorsunuz ── */
    {
      title: "Komisyon Dağılımı: Tam Şeffaflık",
      description: "Her satıştan kimin ne kadar aldığını biliyorsunuz.",
      icon: <Zap className="w-10 h-10 text-white" />,
      color: "bg-amber-700",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Her $100 satıştan komisyon dağılımı:</p>
          <div className="space-y-2">
            {[
              { label: "Direkt Sponsor Primi", val: "$25", pct: "25%", color: "bg-blue-500", w: "w-1/4" },
              { label: "7 Seviye Unilevel Toplamı", val: "$15", pct: "15%", color: "bg-emerald-500", w: "w-[15%]" },
              { label: "Pasif Gelir Grubu", val: "$10",  pct: "10%",  color: "bg-purple-500", w: "w-[10%]" },
              { label: "Şirket Sistemi Fonu", val: "$50", pct: "50%", color: "bg-gray-400",  w: "w-1/2" },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-gray-700">{item.label}</span>
                  <span className="font-black text-gray-800">{item.val} <span className="text-gray-400">({item.pct})</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={cn("h-2.5 rounded-full", item.color, item.w)}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="p-2 bg-green-50 rounded-xl border border-green-100 text-center">
              <p className="text-lg font-black text-green-700">%50</p>
              <p className="text-[10px] text-green-600">Toplam Üye Payı</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <p className="text-lg font-black text-blue-700">7</p>
              <p className="text-[10px] text-blue-600">Seviye Derinlik</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-lg font-black text-amber-700">10</p>
              <p className="text-[10px] text-amber-600">Kariyer Mertebesi</p>
            </div>
          </div>
        </div>
      )
    },

    /* ── 13. Master Blueprint ── */
    {
      title: "Master Blueprint — Otonom Zeka Katmanı",
      description: "100 Milyon kullanıcı ölçeğinde, otonom ve insan odaklı sistem devrimi.",
      icon: <Brain className="w-10 h-10 text-white" />,
      color: "bg-indigo-950",
      content: (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-xs text-slate-400">
            Sistemimiz, insan psikolojisini gözeten ve 100M kullanıcıya kadar otonom çalışan üstün bir teknoloji katmanına sahiptir:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-500/20">
              <h4 className="font-bold text-indigo-400 text-xs flex items-center gap-1">
                🤖 Otonom Otomasyon (Operasyonel)
              </h4>
              <ul className="text-[10px] text-slate-300 space-y-1.5 mt-2">
                <li>• <b>Legacy Mode (Veraset):</b> Varis atama. 6 ay inaktiflikte ağaç ve primler otomatik varise devredilir.</li>
                <li>• <b>Shadow-Branch Recovery:</b> 30 gün inaktif sponsorun ekibi aktif üst liderlere bağlanır, sponsor dönünce eski haline alınır.</li>
                <li>• <b>Algoritmik Sıkıştırma:</b> 6 ay inaktif ölü hesaplar pasifleştirilir, ağaç sıkıştırılır ve temizleyen lidere verimlilik primi ödenir.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-500/20">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                🌸 İnsan Odaklı & Psikolojik Destek
              </h4>
              <ul className="text-[10px] text-slate-300 space-y-1.5 mt-2">
                <li>• <b>Predictive Insurance (Sigorta):</b> %0.5 fon kesintisiyle kriz/hedef kaçırma anında liderlerin sabit primleri garanti edilir.</li>
                <li>• <b>Bio-Digital Sync:</b> Burnout (tükenmişlik) durumunda AI tarafından otomatik zorunlu meditasyon molası ve baskıyı kaldırma.</li>
                <li>• <b>Neuro-Feedback:</b> Satış reddedilmelerini veri toplama sayıp "Deneyimli Satıcı" ünvanı ve ödül puanı veren oyunlaştırma.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-amber-500/20">
              <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1">
                🤝 Sosyal Bağlılık & Toplumsal Etki
              </h4>
              <ul className="text-[10px] text-slate-300 space-y-1.5 mt-2">
                <li>• <b>Kardeşlik Havuzu:</b> Üyelerin isteğe bağlı (%0.1, %0.5) bağışlarıyla zor durumdaki liderlere otonom acil yardım fonu.</li>
                <li>• <b>Eco-Sync:</b> Her 100$ aktiflik için Doğa Kredisi üretimi ve "Bu ay 3 ağaç diktin" şeklinde yeşil performans paneli.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-sky-500/20">
              <h4 className="font-bold text-sky-400 text-xs flex items-center gap-1">
                💎 Bilgi Ekonomisi & Strateji
              </h4>
              <ul className="text-[10px] text-slate-300 space-y-1.5 mt-2">
                <li>• <b>Mentorluk Pazarı & Zaman Bankası:</b> Saatlik eğitimler Zaman Kredisi (Time-Credit) veya nakit Teşekkür Bonusu kazandırır.</li>
                <li>• <b>Shadow-Branching (Sandbox):</b> "Şu lideri şuraya taşısam primim ne olur?" simülasyonu yapabileceğiniz risksiz Sandbox alanı.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    /* ── 14. Karar ── */
    {
      title: "Karar Vermek Kaderdir!",
      description: "Değişimin bir tık uzağındasınız.",
      icon: <Flame className="w-10 h-10 text-white" />,
      color: "bg-red-600",
      content: (
        <div className="space-y-5 text-center py-2">
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-900">Hazır mısınız?</h4>
            <p className="text-slate-600 text-sm max-w-xs mx-auto">
              Ruhunuzu ilimle, cüzdanınızı teknolojiyle dolduracağınız bu benzersiz yolculuğa şimdi davetlisiniz.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-lg font-black text-blue-700">$100</p>
              <p className="text-xs text-blue-600">Giriş Paketi</p>
            </div>
            <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-lg font-black text-green-700">%25</p>
              <p className="text-xs text-green-600">İlk Komisyon</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
              <p className="text-lg font-black text-purple-700">7 Sev.</p>
              <p className="text-xs text-purple-600">Derinlik Kazancı</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-lg font-black text-amber-700">10 Mer.</p>
              <p className="text-xs text-amber-600">Kariyer Basamağı</p>
            </div>
          </div>

          <div
            onClick={() => {
              if (referralCode) {
                window.open(`${window.location.origin}/register?sponsor=${referralCode}`, "_blank");
              }
            }}
            className="group p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between hover:bg-red-100 transition-colors cursor-pointer"
          >
            <div className="text-left">
              <h4 className="text-sm font-black text-red-700 uppercase tracking-tighter">Hemen Kaydol</h4>
              <p className="text-xs text-red-600">Sıranızı en önden alın.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
          </div>

          <Button
            onClick={() => {
              if (referralCode) {
                window.open(`${window.location.origin}/register?sponsor=${referralCode}`, "_blank");
              } else {
                onOpenChange(false);
              }
            }}
            className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black text-lg shadow-xl"
          >
            BİSMİLLAH DE VE BAŞLA
          </Button>
        </div>
      )
    }
  ];

  const next = () => setCurrentSlide((s) => (s + 1) % slides.length);
  const prev = () => setCurrentSlide((s) => (s - 1 + slides.length) % slides.length);

  const copyPresentationLink = () => {
    const text = `
🚀 AKN GROUP — SİSTEM TANITIM VE KAZANÇ SUNUMU 🚀

Manevi Tekamül ile Zahiri Kazancı birleştiren vizyonumuzla tanışın!

💎 KAZANÇ PLANI:
• %25 Anlık Direkt Sponsor Primi
• 7 Seviye Unilevel Derinlik Komisyonu (%15 toplam)
• %10 Aylık Pasif Gelir Havuzu
• 10 Kariyer Mertebesi (%3'ten %20'ye kariyer bonusu)

🚀 Giriş Paketi: $100 (≈ 3.450 TL)

🔗 KAYIT LİNKİ:
${window.location.origin}/register?sponsor=${referralCode || "Merkez"}

Sponsor Kodu: ${referralCode || "Merkez"}
    `;
    navigator.clipboard.writeText(text.trim());
    toast({ title: "✅ Kopyalandı", description: "Tanıtım metni ve referans linkiniz kopyalandı!" });
  };

  const downloadPresentation = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/member/documents/doc-001-pdf/download', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('PDF indirilemedi');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AKN-Group-Sunum.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "ℹ️ Bilgi", description: "PDF hazırlanıyor. Lütfen tekrar deneyin.", variant: "default" });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Header — Colored Slide Title */}
      <div className={cn("relative flex-shrink-0 p-6 md:p-10 text-white transition-colors duration-700", slides[currentSlide].color)}>
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => { exitFullscreen(); onOpenChange(false); }}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors text-white"
          title="Kapat (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="inline-flex px-3 py-1 bg-white/20 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">
              ADIM {currentSlide + 1} / {slides.length}
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">{slides[currentSlide].title}</h2>
            <p className="text-white/80 text-sm font-semibold">{slides[currentSlide].description}</p>
          </div>
          <motion.div
            key={currentSlide}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="p-4 md:p-6 bg-white/20 rounded-[1.5rem] backdrop-blur-3xl border border-white/30 shadow-2xl flex-shrink-0"
          >
            {slides[currentSlide].icon}
          </motion.div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-6 md:p-10 max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        {/* Prev/Next */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="w-11 h-11 rounded-xl border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="w-11 h-11 rounded-xl border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Dots */}
        <div className="hidden sm:flex items-center gap-1 flex-wrap justify-center flex-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === currentSlide ? "w-8 bg-slate-900" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>

        {/* Share / PDF / Fullscreen */}
        <div className="flex items-center gap-1">
          <Button onClick={copyPresentationLink} variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-blue-600 font-bold">
            <Copy className="w-4 h-4" />
            <span className="hidden md:inline text-[10px] uppercase tracking-wider">Paylaş</span>
          </Button>
          <Button onClick={downloadPresentation} variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-red-600 font-bold">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline text-[10px] uppercase tracking-wider">PDF</span>
          </Button>
          <Button
            onClick={() => isFullscreen ? exitFullscreen() : enterFullscreen()}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-400 hover:text-emerald-600 font-bold"
            title={isFullscreen ? "Tam Ekrandan Çık (F)" : "Tam Ekran (F)"}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/></svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
            )}
            <span className="hidden md:inline text-[10px] uppercase tracking-wider">{isFullscreen ? "Küçült" : "Tam Ekran"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
