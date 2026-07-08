/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Brain, Zap, Heart, ShieldAlert, ShieldCheck, RefreshCw, 
  UserPlus, Award, UserCheck, TrendingUp, Users, Info, DollarSign,
  TreePine, BookOpen, Clock, Activity, ArrowRight, HelpCircle,
  Eye, Calendar, Sparkles, Smile, Shield, Compass, Landmark, TreeDeciduous
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MemberBlueprintManagerProps {
  user: any;
  onRefreshUser?: () => void;
}

export default function MemberBlueprintManager({ user, onRefreshUser }: MemberBlueprintManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("operational");
  
  // Local state mirrored from backend state + user blueprint state
  const [globalState, setGlobalState] = useState({
    insurancePoolBalance: 15420.50,
    brotherhoodPoolBalance: 8740.00,
    totalEcoCredits: 12400,
    totalTimeCredits: 3450
  });

  const [userState, setUserState] = useState({
    legacyHeir: null as any,
    isBurnoutActive: false,
    donationRate: 0,
    refusalsCount: 0,
    refusalTitle: "Acemi Satıcı",
    timeCredits: 3,
    natureCredits: 0
  });

  // Legacy Mode Inputs
  const [heirName, setHeirName] = useState("");
  const [heirEmail, setHeirEmail] = useState("");
  const [heirPhone, setHeirPhone] = useState("");

  // Sandbox / Shadow-Branching Simulator Inputs
  const [sandboxTargetId, setSandboxTargetId] = useState("");
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Time-Travel Projections State
  const [timeTravelResult, setTimeTravelResult] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);

  // Load state from backend
  const loadBlueprintState = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/commissions/blueprint/state?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setGlobalState({
            insurancePoolBalance: data.insurancePoolBalance,
            brotherhoodPoolBalance: data.brotherhoodPoolBalance,
            totalEcoCredits: data.totalEcoCredits,
            totalTimeCredits: data.totalTimeCredits
          });
          setRequests(data.userRequests || []);
          if (data.userSpecific) {
            setUserState(data.userSpecific);
            if (data.userSpecific.legacyHeir) {
              setHeirName(data.userSpecific.legacyHeir.fullName || "");
              setHeirEmail(data.userSpecific.legacyHeir.email || "");
              setHeirPhone(data.userSpecific.legacyHeir.phone || "");
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to load blueprint state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlueprintState();
  }, [user?.id]);

  // Handle generic blueprint post actions
  const triggerAction = async (actionType: string, payload: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/commissions/blueprint/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          userId: user?.id,
          ...payload
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "🔮 Otonom İşlem Başarılı",
          description: data.message,
        });
        loadBlueprintState();
        if (onRefreshUser) onRefreshUser();
      } else {
        toast({
          title: "Hata",
          description: data.message || "İşlem gerçekleştirilemedi.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Sistem Hatası",
        description: err.message || "Bağlantı hatası oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 1. Assign Heir
  const handleAssignHeir = () => {
    if (!heirName || !heirEmail) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen varis adı ve e-posta adresini doldurun.",
        variant: "destructive"
      });
      return;
    }
    triggerAction("assign-heir", { heirName, heirEmail, heirPhone });
  };

  // 1b. Trigger Heir Transfer Simulation
  const handleTriggerHeirTransfer = () => {
    triggerAction("trigger-inheritance", {});
  };

  // 3. Energy Efficiency Clean
  const handleEnergyClean = () => {
    triggerAction("energy-clean", {});
  };

  // 4. Insurance pool grant simulation
  const handleRequestInsuranceHelp = () => {
    triggerAction("insurance-grant", { amount: 150 }); // requesting $150 emergency support
  };

  // 5. Toggle Burnout / Bio-Digital Synchronization
  const handleToggleBurnout = () => {
    triggerAction("toggle-burnout", {});
  };

  // 6. Log Refusal (Gamification)
  const handleLogRefusal = () => {
    triggerAction("log-refusal", {});
  };

  // 7. Update brotherhood donation percentage
  const handleUpdateDonationRate = (rate: number) => {
    triggerAction("update-donation-rate", { amount: rate });
  };

  // 7b. Request brotherhood aid simulation
  const handleRequestBrotherhoodHelp = () => {
    triggerAction("kardeslik-aid", { amount: 200 }); // $200 aid
  };

  // 9. Buy mentor session
  const handleBuyMentorSession = (mentorName: string, cost: number) => {
    triggerAction("buy-mentor-session", { amount: cost });
  };

  // 9b. Earn time credit
  const handleEarnTimeCredit = () => {
    triggerAction("earn-time-credit", {});
  };

  // 11. Run Sandbox Simulation
  const handleRunSandbox = async () => {
    if (!sandboxTargetId) {
      toast({
        title: "Eksik Seçim",
        description: "Lütfen simüle edilecek hedef sponsor ID'sini girin.",
        variant: "destructive"
      });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/commissions/blueprint/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate-sandbox",
          userId: user?.id,
          targetUserId: sandboxTargetId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSandboxResult(data.simulation);
        toast({
          title: "💻 Sandbox Simülasyonu Tamamlandı",
          description: "Kazanç değişimi hesaplandı.",
        });
      } else {
        toast({
          title: "Simülasyon Hatası",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 12. Run Time-Travel Projection
  const handleRunTimeTravel = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/commissions/blueprint/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "time-travel",
          userId: user?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setTimeTravelResult(data.projection);
        toast({
          title: "🌌 Projeksiyon Hazır",
          description: "Gelecek vizyonu kader haritanız çıkarıldı.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-600/20 rounded-2xl border border-purple-500/30">
              <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500 text-white font-mono text-[10px]">MASTER BLUEPRINT</Badge>
                <Badge className="bg-emerald-500/10 text-emerald-300 font-mono text-[10px] border border-emerald-500/20">OTONOM SİSTEM</Badge>
              </div>
              <h1 className="text-2xl font-black mt-1">Otonom Akıllı Yönetim Katmanı</h1>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Şirket operasyonlarını, sosyal sorumlulukları, psikolojik korumayı ve stratejik simülasyonları otonom yapay zeka ile yöneten devrimsel altyapı.
              </p>
            </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Kişisel Zaman Krediniz</div>
              <div className="text-xl font-black text-amber-400 font-mono">{userState.timeCredits} Kredi</div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Bu Ay Diktiğiniz Ağaç</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{userState.natureCredits} Adet</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending / Recent Blueprint Requests Tracker */}
      {requests.length > 0 && (
        <Card className="bg-slate-900 border-indigo-500/20 text-slate-200 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border-b border-slate-800/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                <CardTitle className="text-sm font-bold text-white">Otonom İşlem Talepleri & Onay Durumları</CardTitle>
              </div>
              <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                {requests.filter(r => r.status === 'pending').length} Bekleyen Talep
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
              {requests.map((req: any) => (
                <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-950/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 font-sans">
                        {req.type === 'insurance-grant' && '🛡️ Sigorta Fonu Kriz Yardımı'}
                        {req.type === 'kardeslik-aid' && '❤️ Kardeşlik Havuzu Desteği'}
                        {req.type === 'assign-heir' && '👤 Varis Atama/Güncelleme'}
                        {req.type === 'trigger-inheritance' && '🔑 Veraset Protokolü Transferi'}
                        {req.type === 'toggle-burnout' && '🧘 Burnout Koruma Molası'}
                      </span>
                      {req.amount > 0 && (
                        <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] font-mono">
                          ${req.amount.toFixed(2)} USD
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Talep Tarihi: {new Date(req.createdAt).toLocaleString('tr-TR')}
                      {req.details?.heirName && ` — Varis: ${req.details.heirName}`}
                    </p>
                  </div>
                  <div>
                    {req.status === 'pending' && (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] animate-pulse">
                        Yönetici Onayı Bekliyor
                      </Badge>
                    )}
                    {req.status === 'approved' && (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        ✓ Onaylandı ve Uygulandı
                      </Badge>
                    )}
                    {req.status === 'rejected' && (
                      <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px]">
                        ✗ Reddedildi
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs list with beautiful styling */}
      <Tabs defaultValue="operational" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-950/50 p-2 rounded-2xl border border-slate-900 h-auto">
          <TabsTrigger value="operational" className="rounded-xl py-2.5 font-bold text-xs gap-1.5 transition-all text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Zap className="w-3.5 h-3.5" /> Operasyon & Otomasyon
          </TabsTrigger>
          <TabsTrigger value="psychology" className="rounded-xl py-2.5 font-bold text-xs gap-1.5 transition-all text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Heart className="w-3.5 h-3.5" /> Psikolojik Destek
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl py-2.5 font-bold text-xs gap-1.5 transition-all text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Users className="w-3.5 h-3.5" /> Sosyal Bağlılık
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="rounded-xl py-2.5 font-bold text-xs gap-1.5 transition-all text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <BookOpen className="w-3.5 h-3.5" /> Bilgi Ekonomisi
          </TabsTrigger>
          <TabsTrigger value="simulation" className="rounded-xl py-2.5 font-bold text-xs gap-1.5 transition-all text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white col-span-2 md:col-span-1">
            <Compass className="w-3.5 h-3.5" /> Simülasyon & Gelecek
          </TabsTrigger>
        </TabsList>

        {/* 1. OPERATIONAL & AUTOMATION TAB */}
        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Legacy Mode (Dijital Veraset) */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 lg:col-span-2 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    <CardTitle className="text-base font-bold text-white">Legacy Mode (Dijital Veraset)</CardTitle>
                  </div>
                  <Badge className={`${userState.legacyHeir ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400'} border font-mono`}>
                    {userState.legacyHeir ? 'VARİS ATANDI' : 'VARİS TANIMSIZ'}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  İnaktiflik veya onaylı vefat durumunda, hesabınızın tüm haklarıyla birlikte otomatik olarak devredileceği varisinizi belirleyin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Varis Adı Soyadı</Label>
                    <Input 
                      placeholder="Örn: Ahmet Yılmaz" 
                      value={heirName} 
                      onChange={(e) => setHeirName(e.target.value)} 
                      className="bg-slate-950 border-slate-800 text-xs focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Varis E-Posta</Label>
                    <Input 
                      type="email" 
                      placeholder="örn: ahmet@mail.com" 
                      value={heirEmail} 
                      onChange={(e) => setHeirEmail(e.target.value)} 
                      className="bg-slate-950 border-slate-800 text-xs focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Varis Telefon No (Opsiyonel)</Label>
                    <Input 
                      placeholder="+90 555..." 
                      value={heirPhone} 
                      onChange={(e) => setHeirPhone(e.target.value)} 
                      className="bg-slate-950 border-slate-800 text-xs focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={handleAssignHeir} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl px-5 py-2">
                    {userState.legacyHeir ? "Varis Bilgilerini Güncelle" : "Varisi Otonom Ata"}
                  </Button>
                  
                  {userState.legacyHeir && (
                    <Button onClick={handleTriggerHeirTransfer} variant="outline" disabled={loading} className="border-rose-900/50 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl px-5">
                      ⚠️ Veraset Protokolünü Test Et (Simüle Et)
                    </Button>
                  )}
                </div>

                {userState.legacyHeir && (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="font-extrabold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Aktif Veraset Protokolü Detayları
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-400 mt-2">
                      <div><span className="text-slate-500">Varis:</span> <strong className="text-slate-300">{userState.legacyHeir.fullName}</strong></div>
                      <div><span className="text-slate-500">E-Posta:</span> <strong className="text-slate-300">{userState.legacyHeir.email}</strong></div>
                      <div><span className="text-slate-500">Tel:</span> <strong className="text-slate-300">{userState.legacyHeir.phone || '-'}</strong></div>
                      <div><span className="text-slate-500">Durum:</span> <Badge className="bg-indigo-950 text-indigo-400 border border-indigo-900/50 font-mono text-[9px]">{userState.legacyHeir.status}</Badge></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kayıp Dal Kurtarma */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <CardTitle className="text-base font-bold text-white">Shadow-Branch Recovery</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Kayıp Dal Kurtarma Motoru. Sponsorunuz 30 gün boyunca inaktif kalırsa, ağaç bağınız otonom korunur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Sponsor Durumu:</span>
                    <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">AKTİF (Koruma Hazır)</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400">En Aktif Üst Lider Bağlantısı:</span>
                    <span className="text-slate-300 font-mono font-bold">Sistem (Otonom)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sponsorunuz aktifliğe geri döndüğünde, otonom motor sizi hiçbir hak kaybı yaşatmadan orijinal yerinize geri taşır. Bu süreç tamamen şeffaftır.
                  </p>
                </div>

                <div className="pt-2">
                  <Button onClick={() => triggerAction("shadow-recovery-run", {})} variant="outline" disabled={loading} className="w-full border-indigo-800/30 hover:bg-indigo-950/20 text-indigo-400 hover:text-indigo-300 text-xs font-bold rounded-xl py-2">
                    🔍 Kayıp Dalları Tara & Otonom Bağla
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Energy Efficiency Module */}
          <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <CardTitle className="text-base font-bold text-white">Algoritmik Temizlik & Enerji Verimliliği</CardTitle>
                </div>
                <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[10px]">VERİMLİLİK PRİMİ AKTİF</Badge>
              </div>
              <CardDescription className="text-slate-400 text-xs mt-1">
                6 aydır hiç satış yapmamış "ölü hesaplar" pasif moda alınır, üst kollar sıkıştırılarak ağaç performansı hafifletilir. Bu işlemi tetikleyen liderlere $50.00 USD "Sistem Verimlilik Primi" ödenir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="font-extrabold text-slate-200">Sistem Sıkıştırma Motoru Durumu</div>
                  <div className="text-slate-400 text-[11px]">En son temizlik: Bugün | Toplam temizlenen pasif hesap: 5</div>
                </div>
                <Button onClick={handleEnergyClean} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl px-5">
                  ⚡ Otonom Temizliği Çalıştır ($50 Kazan)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. PSYCHOLOGICAL SUPPORT TAB */}
        <TabsContent value="psychology" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Bio-Digital Synchronization */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400 animate-pulse" />
                    <CardTitle className="text-base font-bold text-white">Bio-Digital Sync (Psikolojik Koruma)</CardTitle>
                  </div>
                  <Badge className={`${userState.isBurnoutActive ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'} border font-mono`}>
                    {userState.isBurnoutActive ? 'ZORUNLU DİNLENME MODU' : 'NORMAN PERFORMANS'}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Yapay zeka, satış baskınızı ve kullanım frekansınızı analiz eder. Tükenmişlik belirtisi tespitinde zorunlu meditasyon molası tanımlayarak haklarınızı korur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Mevcut Stres Endeksiniz:</span>
                    <strong className={userState.isBurnoutActive ? "text-rose-400" : "text-emerald-400"}>{userState.isBurnoutActive ? "%92 (Yüksek)" : "%28 (Düşük)"}</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${userState.isBurnoutActive ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: userState.isBurnoutActive ? '92%' : '28%' }}></div>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    {userState.isBurnoutActive 
                      ? "Zorunlu dinlenme ve meditasyon molanız aktif. Bu süre zarfında aylık aktiflik ciro hedefleri dondurulmuş olup, tüm prim ve kazanç haklarınız otonom güvence altındadır."
                      : "Sistem stres seviyenizi dengeli olarak analiz etti. Çalışmaya devam edebilirsiniz. Aşırı yorgun hissettiğinizde otonom dinlenme modunu manuel de başlatabilirsiniz."}
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleToggleBurnout} disabled={loading} className={`w-full font-bold text-xs rounded-xl py-2.5 ${userState.isBurnoutActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}>
                    {userState.isBurnoutActive ? "Dinlenme Modunu Kapat (Performansa Dön)" : "Zorunlu Dinlenme & Meditasyon Molası Başlat"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Neuro-Feedback Gamification */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <CardTitle className="text-base font-bold text-white">Neuro-Feedback (Satış Reddi Eğitimi)</CardTitle>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[10px]">
                    {userState.refusalTitle}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Satış reddedilmelerini başarısızlık değil, bir veri toplama başarısı olarak görüyoruz. Aldığınız her 'HAYIR' cevabını kaydedin, ödül kazanın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Kaydedilen Red Sayınız</div>
                    <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{userState.refusalsCount} Adet</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Gamification Seviyesi</div>
                    <div className="text-sm font-black text-slate-200 mt-2">{userState.refusalTitle}</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Toplam red sayısı arttıkça kariyer puanı, özel ünvanlar ve ekstra hediye cüzdan bakiyeleri otonom olarak hesabınıza aktarılır.
                </p>

                <div className="pt-2">
                  <Button onClick={handleLogRefusal} disabled={loading} className="w-full bg-slate-950 hover:bg-slate-900 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl py-2.5">
                    ❌ Yeni Bir Reddedilme (HAYIR) Kaydet (+10 Puan)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. SOCIAL ENGAGEMENT TAB */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Collective Destiny Pool (Kardeşlik Havuzu) */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <CardTitle className="text-base font-bold text-white">Collective Destiny Pool (Kardeşlik Havuzu)</CardTitle>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[10px]">
                    Fon: ${globalState.brotherhoodPoolBalance.toFixed(2)} USD
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Zor durumdaki (sağlık, kaza, doğal afet vb.) üyelere anında otonom destek aktarmak üzere tüm üyelerin gönüllü yüzdelik katkısıyla oluşturulan kardeşlik fonu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Aylık Priminizden Gönüllü Bağış Oranınız</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 0.1, 0.5, 1.0].map((rate) => (
                      <Button 
                        key={rate} 
                        onClick={() => handleUpdateDonationRate(rate)}
                        variant={userState.donationRate === rate ? "default" : "outline"}
                        className={`text-xs font-bold rounded-xl py-1.5 ${userState.donationRate === rate ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                      >
                        {rate === 0 ? "Bağış Yok" : `%${rate}`}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
                  <div className="font-extrabold text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Kardeşlik Havuzu Dayanışma Şartları
                  </div>
                  <div>Gönüllü bağış oranı belirlediğinizde, hak ettiğiniz aylık primlerinizden bu oran otonom olarak kesilerek havuza aktarılır. Zor durumlarda havuzdan doğrudan otonom destek alabilirsiniz.</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleRequestBrotherhoodHelp} disabled={loading} className="flex-1 bg-slate-950 hover:bg-slate-900 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl py-2">
                    ❤️ Kardeşlik Desteği Talep Et (Simüle Et)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Eco-Sync & Planetary Performance */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-emerald-400" />
                    <CardTitle className="text-base font-bold text-white">Eco-Sync (Gezegen Dostu Performans)</CardTitle>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[10px]">
                    Global: {globalState.totalEcoCredits} Fidan
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Her 100$ ciro karşılığında fidan dikiyoruz. Başarılarınızı doğa korumasıyla eşleştirerek gezegen dostu bir ekosistem inşa ediyoruz.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-950/15 border border-emerald-900/30 p-5 rounded-3xl flex flex-col md:flex-row items-center gap-5">
                  <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                    <TreeDeciduous className="w-10 h-10 text-emerald-400 animate-bounce" />
                  </div>
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-sm font-extrabold text-emerald-300">Harika İş Çıkardınız!</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sistemimiz üzerinden yaptığınız ciroyla bu ay <strong className="text-emerald-400 font-mono text-sm">{userState.natureCredits} adet fidanın</strong> doğayla buluşmasını sağladınız. Adınıza düzenlenen doğa sertifikası dökümanlar panelinde mevcuttur.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-400">Kişisel Doğa Krediniz</div>
                    <div className="text-lg font-black text-emerald-400 mt-1">{userState.natureCredits * 10} Doğa Puanı</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-400">Toplam Karbon Dengesi</div>
                    <div className="text-lg font-black text-emerald-400 mt-1">-{userState.natureCredits * 22} kg CO₂</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predictive Insurance System */}
          <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-400" />
                  <CardTitle className="text-base font-bold text-white">Predictive Insurance (Sistem İçi Sigorta Fonu)</CardTitle>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[10px]">
                  Sigorta Havuz Rezervi: ${globalState.insurancePoolBalance.toFixed(2)} USD
                </Badge>
              </div>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Toplam cirodan kesilen %0.5 ile kurulan otonom sigorta havuzu. Lojistik aksamaları, kriz dönemleri veya hedef tutturamayan aktif liderlerin minimum prim güvencesi bu havuzdan karşılanır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-slate-200">Sigorta Güvenceniz Hazır</div>
                  <div className="text-slate-400 text-[11px]">Sponsorluk ve liderlik haklarınız $1,500.00 USD limitine kadar otonom güvence kapsamındadır.</div>
                </div>
                <Button onClick={handleRequestInsuranceHelp} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl px-5 py-2.5">
                  🛡️ Sigorta Fonundan Kriz Yardımı Al ($150)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. KNOWLEDGE & REPUTATION MARKETPLACE TAB */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cross-Pollination & Time-Bank (Mentorluk Pazarı & Zaman Bankası) */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 lg:col-span-2 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <CardTitle className="text-base font-bold text-white">Cross-Pollination & Zaman Bankası</CardTitle>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[10px]">
                    Zaman Krediniz: {userState.timeCredits} Kredi
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Uzmanlığı ortak değer birimi yapıyoruz! 1 saatlik eğitim sunarak 1 Zaman Kredisi kazanın. Kazandığınız kredileri diğer liderlerden eğitim almakta kullanın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Book training marketplace */}
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-300">Aktif Alabileceğiniz Mentorluk Eğitimleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {[
                      { name: "Ahmet Yıldırım (Monoline Lideri)", subject: "Manevi Satış Stratejileri", cost: 1, rating: "4.9/5" },
                      { name: "Esra Demir (Kamil Seviye Lider)", subject: "Alt Ağaç Organizasyon Yönetimi", cost: 2, rating: "5.0/5" },
                      { name: "Selin Kaya (Mürşid Seviye Lider)", subject: "Siyer-i Nebi ile Ticari Ahlak", cost: 1, rating: "4.8/5" }
                    ].map((mentor, idx) => (
                      <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-extrabold text-xs text-slate-200">{mentor.name}</h4>
                            <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px] font-mono">{mentor.rating}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{mentor.subject}</p>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/50">
                          <span className="text-[11px] font-mono text-amber-400 font-bold">{mentor.cost} Zaman Kredisi</span>
                          <Button 
                            onClick={() => handleBuyMentorSession(mentor.name, mentor.cost)} 
                            disabled={loading || userState.timeCredits < mentor.cost}
                            className="bg-purple-600 hover:bg-purple-700 font-bold text-[10px] h-7 px-3 rounded-lg"
                          >
                            Seansı Rezerve Et
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleEarnTimeCredit} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl py-2 flex-1">
                    🎤 Sisteme 1 Saatlik Eğitim Sun (+1 Zaman Kredisi Kazan)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Digital Reputation Marketplace */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <CardTitle className="text-base font-bold text-white">Digital Reputation Marketplace</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Başarılı liderlerin liderlik ve danışmanlık itibarı dijital varlığa dönüşür. Başarı endeksinizi takip edin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Sizin İtibar Skorunuz:</span>
                    <strong className="text-indigo-400 font-mono font-bold">885 / 1000</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '88.5%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Haftalık Değişim: <strong className="text-emerald-400">+4.5%</strong></span>
                    <span>İtibar Grubu: <strong className="text-indigo-300">A+ Elit Danışman</strong></span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-[11px] text-slate-300 font-bold mb-1">Popüler İtibar Borsası Değerlemeleri</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded-lg border border-slate-800">
                      <span className="text-slate-300 text-[11px]">Hakan Çelik (Kamil Lider)</span>
                      <span className="text-amber-400 font-mono font-bold text-[11px]">1.5 Zaman Kredisi / Saat</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded-lg border border-slate-800">
                      <span className="text-slate-300 text-[11px]">Zeynep Demir (Kutub Lider)</span>
                      <span className="text-amber-400 font-mono font-bold text-[11px]">3.0 Zaman Kredisi / Saat</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 5. SIMULATION & FUTURE TAB */}
        <TabsContent value="simulation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Shadow-Branching (Sandbox Alanı) */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                  <CardTitle className="text-base font-bold text-white">Shadow-Branching (Sandbox Simülatörü)</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Ağaç yapısını bozmadan, bir üyeyi başka bir sponsora taşımanız durumunda aylık priminizin ve derinlik unilevel kazançlarınızın nasıl değişeceğini anlık simüle edin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Simüle Edilecek Hedef Sponsor Kullanıcı ID (örn: ak000001)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Hedef Sponsor ID girin" 
                      value={sandboxTargetId} 
                      onChange={(e) => setSandboxTargetId(e.target.value)} 
                      className="bg-slate-950 border-slate-800 text-xs"
                    />
                    <Button onClick={handleRunSandbox} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-xs font-bold rounded-xl px-4">
                      Simüle Et
                    </Button>
                  </div>
                </div>

                {sandboxResult && (
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-purple-900/40 text-xs space-y-3">
                    <div className="font-extrabold text-purple-300 flex items-center gap-1.5 border-b border-purple-900/30 pb-2">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      Sandbox Simülasyon Analiz Raporu
                    </div>
                    <div className="space-y-2 text-slate-300">
                      <div><span className="text-slate-500">Taşınan Üye:</span> <strong>{sandboxResult.userName}</strong></div>
                      <div><span className="text-slate-500">Simüle Edilen Sponsor:</span> <strong>{sandboxResult.targetSponsorName}</strong></div>
                      <div><span className="text-slate-500">Kazanç Etkisi:</span> <span className="text-emerald-400 font-mono font-bold">{sandboxResult.expectedCommissionChange}</span></div>
                      <div><span className="text-slate-500">Yeni Ekip Cirosu:</span> <span className="text-indigo-400 font-mono font-bold">${sandboxResult.expectedTeamCiroTL} USD</span></div>
                      <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800">{sandboxResult.treePath}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time-Travel Analytics (Kader Haritası) */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <CardTitle className="text-base font-bold text-white">Time-Travel Analytics (Kader Haritası)</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Mevcut ciro, satış hızınız ve aktiflik istikrarınıza göre otonom katlama analiz motoru ile 1, 3 ve 5 yıllık başarı projeksiyonlarınızı anlık hesaplayın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button onClick={handleRunTimeTravel} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs font-bold rounded-xl py-2.5">
                    🔮 Gelecek Vizyonu Kader Haritamı Hesapla
                  </Button>
                </div>

                {timeTravelResult && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 text-xs space-y-3">
                    <div className="font-extrabold text-indigo-300 flex items-center gap-1.5 border-b border-indigo-900/30 pb-2">
                      <Compass className="w-4 h-4 text-indigo-400" />
                      Yapay Zeka Gelecek Başarı Projeksiyonu
                    </div>
                    <div className="space-y-2.5 text-slate-300">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-indigo-950 text-indigo-400 border border-indigo-900/30 text-[9px] mt-0.5">1. Yıl</Badge>
                        <p className="text-slate-300 leading-relaxed">{timeTravelResult.year1}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-indigo-950 text-indigo-400 border border-indigo-900/30 text-[9px] mt-0.5">3. Yıl</Badge>
                        <p className="text-slate-300 leading-relaxed">{timeTravelResult.year3}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-indigo-950 text-indigo-400 border border-indigo-900/30 text-[9px] mt-0.5">5. Yıl</Badge>
                        <p className="text-slate-300 leading-relaxed">{timeTravelResult.year5}</p>
                      </div>
                      <div className="bg-indigo-950/35 border border-indigo-900/40 p-3 rounded-lg text-[10px] text-emerald-300 mt-2">
                        💡 <strong>Öneri:</strong> {timeTravelResult.aiRecommendation}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
