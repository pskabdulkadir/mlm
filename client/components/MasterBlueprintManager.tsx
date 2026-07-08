/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Brain, Zap, Heart, ShieldAlert, ShieldCheck, RefreshCw, 
  UserPlus, Award, UserCheck, TrendingUp, Users, Info, DollarSign,
  TreePine, BookOpen, Clock, Activity, ArrowRight, HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MasterBlueprintManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<any>({
    burnoutUsers: [],
    heirUsers: [],
    recoveredUsers: [],
    insurancePoolBalance: 15420.50,
    brotherhoodPoolBalance: 8740.00,
    totalEcoCredits: 12400,
    totalTimeCredits: 3450,
    allRequests: [],
    allUsers: []
  });

  // Inputs for Legacy Mode
  const [heirUserId, setHeirUserId] = useState("");
  const [heirName, setHeirName] = useState("");
  const [heirEmail, setHeirEmail] = useState("");
  const [heirPhone, setHeirPhone] = useState("");

  // Inputs for Insurance / Brotherhood Grants
  const [grantUserId, setGrantUserId] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantType, setGrantType] = useState<"insurance" | "brotherhood">("insurance");

  // Input for Burnout mode
  const [burnoutUserId, setBurnoutUserId] = useState("");

  // Inputs for Sandbox
  const [sandboxUserId, setSandboxUserId] = useState("");
  const [sandboxTargetId, setSandboxTargetId] = useState("");
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Input for Time Travel Projections
  const [timeTravelUserId, setTimeTravelUserId] = useState("");
  const [timeTravelResult, setTimeTravelResult] = useState<any>(null);

  // Local state for inline user actions
  const [inlineScores, setInlineScores] = useState<{ [userId: string]: string }>({});
  const [inlineBurnouts, setInlineBurnouts] = useState<{ [userId: string]: string }>({});
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Fetch current state
  const fetchBlueprintState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/commissions/blueprint/state");
      const data = await res.json();
      if (data.success) {
        setState({
          burnoutUsers: data.burnoutUsers || [],
          heirUsers: data.heirUsers || [],
          recoveredUsers: data.recoveredUsers || [],
          insurancePoolBalance: data.insurancePoolBalance || 15420.50,
          brotherhoodPoolBalance: data.brotherhoodPoolBalance || 8740.00,
          totalEcoCredits: data.totalEcoCredits || 12400,
          totalTimeCredits: data.totalTimeCredits || 3450,
          allRequests: data.allRequests || [],
          allUsers: data.allUsers || []
        });
      }
    } catch (err: any) {
      console.error("Error fetching master blueprint state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprintState();
  }, []);

  const handleAction = async (payload: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/commissions/blueprint/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, initiatedByAdmin: true })
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "🚀 Otonom Eylem Başarılı",
          description: data.message || "İşlem otonom olarak gerçekleştirildi.",
          className: "bg-slate-900 text-white border-purple-500"
        });
        fetchBlueprintState();
        return data;
      } else {
        toast({
          title: "❌ Hata",
          description: data.message || "Eylem gerçekleştirilemedi.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "❌ Ağ Hatası",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRequest = async (requestId: string, status: "approved" | "rejected") => {
    try {
      setLoading(true);
      const res = await fetch("/api/commissions/blueprint/request/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status })
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "✓ Talep Sonuçlandırıldı",
          description: data.message,
          className: "bg-slate-900 text-white border-purple-500"
        });
        fetchBlueprintState();
      } else {
        toast({
          title: "❌ Hata",
          description: data.message || "İşlem gerçekleştirilemedi.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "❌ Ağ Hatası",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHeir = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction({
      action: "assign-heir",
      userId: heirUserId,
      heirName,
      heirEmail,
      heirPhone
    });
    setHeirUserId("");
    setHeirName("");
    setHeirEmail("");
    setHeirPhone("");
  };

  const handleTriggerInheritance = (userId: string) => {
    handleAction({
      action: "trigger-inheritance",
      userId
    });
  };

  const handleShadowRecoveryRun = () => {
    handleAction({ action: "shadow-recovery-run" });
  };

  const handleShadowRecoveryRestore = () => {
    handleAction({ action: "shadow-recovery-restore" });
  };

  const handleEnergyClean = () => {
    handleAction({ action: "energy-clean" });
  };

  const handleSendGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (grantType === "insurance") {
      handleAction({
        action: "insurance-grant",
        userId: grantUserId,
        amount: grantAmount
      });
    } else {
      handleAction({
        action: "kardeslik-aid",
        userId: grantUserId,
        amount: grantAmount
      });
    }
    setGrantUserId("");
    setGrantAmount("");
  };

  const handleToggleBurnout = (userIdToToggle?: string) => {
    const target = userIdToToggle || burnoutUserId;
    if (!target) return;
    handleAction({
      action: "toggle-burnout",
      userId: target
    });
    if (!userIdToToggle) setBurnoutUserId("");
  };

  const handleVerifyDeathCertificate = (userId: string) => {
    handleAction({
      action: "verify-death-certificate",
      userId
    });
  };

  const handleSimulateInactivity = (userId: string) => {
    handleAction({
      action: "simulate-six-months-inactivity",
      userId
    });
  };

  const handleUpdateActivityScore = (userId: string, score: string) => {
    if (score === "") return;
    handleAction({
      action: "update-activity-score",
      userId,
      amount: score
    });
  };

  const handleUpdateBurnoutIndex = (userId: string, index: string) => {
    if (index === "") return;
    handleAction({
      action: "update-burnout-index",
      userId,
      amount: index
    });
  };

  const handleRunSandbox = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await handleAction({
      action: "simulate-sandbox",
      userId: sandboxUserId,
      targetUserId: sandboxTargetId
    });
    if (data && data.simulation) {
      setSandboxResult(data.simulation);
    }
  };

  const handleRunTimeTravel = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await handleAction({
      action: "time-travel",
      userId: timeTravelUserId
    });
    if (data && data.projection) {
      setTimeTravelResult(data.projection);
    }
  };

  return (
    <div className="space-y-8 bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 text-slate-100">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> Sigorta Havuzu
            </CardDescription>
            <CardTitle className="text-3xl font-black text-indigo-400">
              ${state.insurancePoolBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 font-medium">%0.5 ciro kesintisinden otonom beslenir.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-emerald-400" /> Kardeşlik Havuzu
            </CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-400">
              ${state.brotherhoodPoolBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 font-medium">Gönüllü lider bağışlarıyla otonom büyür.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <TreePine className="w-3.5 h-3.5 text-amber-400" /> Doğa Kredisi (Eco-Sync)
            </CardDescription>
            <CardTitle className="text-3xl font-black text-amber-400">
              {state.totalEcoCredits.toLocaleString("en-US")} Kredi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 font-medium">Başarılarla eşleşen otonom fidan dikimleri.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Zaman Bankası
            </CardDescription>
            <CardTitle className="text-3xl font-black text-sky-400">
              {state.totalTimeCredits.toLocaleString("en-US")} Saat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 font-medium">Mentorluk ve eğitim saat kredisi birikimi.</p>
          </CardContent>
        </Card>
      </div>

      {/* Blueprint Requests Approval Center */}
      <Card className="bg-slate-900 border-indigo-500/20 text-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-slate-950 to-indigo-950/20 border-b border-slate-800/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <CardTitle className="text-lg font-black text-white">Otonom Akıllı Sistem Onay Havuzu</CardTitle>
                <CardDescription className="text-xs text-slate-400">Üyeler tarafından talep edilen sigorta yardımları, veraset protokolleri ve burnout mola talepleri</CardDescription>
              </div>
            </div>
            <Badge className="bg-purple-500 text-white font-mono text-xs px-2.5 py-1">
              {state.allRequests?.filter((r: any) => r.status === "pending").length || 0} Bekleyen Onay
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!state.allRequests || state.allRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Henüz herhangi bir otonom işlem talebi bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-b border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold text-xs py-3">Üye Bilgisi</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs py-3">Talep Türü</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs py-3">Miktar / Detay</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs py-3">Tarih</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs py-3">Durum</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs py-3 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.allRequests.map((req: any) => (
                    <TableRow key={req.id} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                      <TableCell className="py-4">
                        <div className="font-bold text-slate-200 text-sm">{req.userName}</div>
                        <div className="text-slate-400 text-xs font-mono">{req.userEmail}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className="bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {req.type === 'insurance-grant' && '🛡️ Sigorta Fonu Kriz Yardımı'}
                          {req.type === 'kardeslik-aid' && '❤️ Kardeşlik Havuzu Desteği'}
                          {req.type === 'assign-heir' && '👤 Varis Atama/Güncelleme'}
                          {req.type === 'trigger-inheritance' && '🔑 Veraset Protokolü Transferi'}
                          {req.type === 'toggle-burnout' && '🧘 Burnout Koruma Molası'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {req.amount > 0 ? (
                          <span className="font-mono text-emerald-400 font-bold">${req.amount.toFixed(2)} USD</span>
                        ) : req.details?.heirName ? (
                          <div className="text-xs text-slate-300">
                            Varis: {req.details.heirName} <br />
                            <span className="text-[10px] text-slate-500 font-mono">{req.details.heirEmail}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-xs text-slate-400 font-mono">
                        {new Date(req.createdAt).toLocaleString('tr-TR')}
                      </TableCell>
                      <TableCell className="py-4">
                        {req.status === "pending" && (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] animate-pulse">
                            Onay Bekliyor
                          </Badge>
                        )}
                        {req.status === "approved" && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            ✓ Onaylandı
                          </Badge>
                        )}
                        {req.status === "rejected" && (
                          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                            ✗ Reddedildi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        {req.status === "pending" ? (
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleResolveRequest(req.id, "approved")}
                              disabled={loading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 rounded-lg"
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleResolveRequest(req.id, "rejected")}
                              disabled={loading}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-7 rounded-lg"
                            >
                              Reddet
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">
                            {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString('tr-TR') : 'Tamamlandı'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800 h-auto gap-1">
          <TabsTrigger value="members" className="text-xs font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2">👥 Üye Metrik Kontrolü</TabsTrigger>
          <TabsTrigger value="legacy" className="text-xs font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2">🌸 Veraset & Legacy</TabsTrigger>
          <TabsTrigger value="shadow" className="text-xs font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2">🌳 Kayıp Dal & Temizlik</TabsTrigger>
          <TabsTrigger value="pools" className="text-xs font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2">🤝 Sigorta & Kardeşlik</TabsTrigger>
          <TabsTrigger value="burnout" className="text-xs font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2">🧠 Burnout & Bio-Sync</TabsTrigger>
          <TabsTrigger value="sandbox" className="text-xs font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2">🔮 Sandbox & Simülatör</TabsTrigger>
        </TabsList>

        {/* 0. Üye Metrik ve Otonom Kontrol Merkezi */}
        <TabsContent value="members" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
            <CardHeader className="border-b border-slate-800/60 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-black flex items-center gap-2 text-indigo-400">
                    <Users className="w-5 h-5 text-indigo-400" /> Üye Otonom Metrik Yönetim Paneli
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Sistemdeki üyelerin aktivite skoru, son giriş tarihi, vefat belgesi durumunu ve burnout seviyesini doğrudan yönetin.
                  </CardDescription>
                </div>
                <div className="w-full md:w-64">
                  <Input
                    placeholder="Üye adı veya e-posta ile ara..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs h-9 rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!state.allUsers || state.allUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-bold">
                  Sistemde kayıtlı üye bulunamadı veya veriler yüklenemedi.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-950/20">
                      <TableRow className="border-b border-slate-800">
                        <TableHead className="text-slate-400 text-xs font-bold py-3">Üye Bilgisi</TableHead>
                        <TableHead className="text-slate-400 text-xs font-bold py-3">Aktivite Skoru</TableHead>
                        <TableHead className="text-slate-400 text-xs font-bold py-3">Burnout Endeksi</TableHead>
                        <TableHead className="text-slate-400 text-xs font-bold py-3">Veraset & Vefat Durumu</TableHead>
                        <TableHead className="text-slate-400 text-xs font-bold py-3 text-right">Eylemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.allUsers
                        .filter((u: any) => 
                          u.fullName?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          u.id?.toLowerCase().includes(userSearchTerm.toLowerCase())
                        )
                        .map((u: any) => {
                          const userScoreInput = inlineScores[u.id] !== undefined ? inlineScores[u.id] : (u.activity_score !== undefined ? u.activity_score.toString() : "100");
                          const userBurnoutInput = inlineBurnouts[u.id] !== undefined ? inlineBurnouts[u.id] : (u.blueprintSettings?.burnout_index !== undefined ? u.blueprintSettings.burnout_index.toString() : "0");

                          return (
                            <TableRow key={u.id} className="border-b border-slate-800/40 hover:bg-slate-950/40">
                              <TableCell className="py-3">
                                <div className="font-bold text-slate-200 text-xs">{u.fullName}</div>
                                <div className="text-slate-400 text-[10px] font-mono">{u.email}</div>
                                <div className="text-slate-500 text-[9px] font-mono mt-0.5 flex items-center gap-1">
                                  <span>ID: {u.id}</span>
                                  {u.isDeadAccount && (
                                    <Badge className="bg-red-950 text-red-400 text-[8px] font-bold border border-red-900/30 py-0 px-1">
                                      DORMANT (ÖLÜ)
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              
                              <TableCell className="py-3">
                                <div className="flex items-center gap-1.5">
                                  <Badge className={`text-[10px] font-bold ${
                                    (u.activity_score || 100) > 70 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                    (u.activity_score || 100) > 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  }`}>
                                    Skor: {u.activity_score !== undefined ? u.activity_score : 100}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5 max-w-[110px]">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={userScoreInput}
                                    onChange={(e) => setInlineScores({ ...inlineScores, [u.id]: e.target.value })}
                                    className="bg-slate-950 border-slate-800 text-[10px] h-6 px-1.5 rounded-md"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateActivityScore(u.id, userScoreInput)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] h-6 px-1.5 rounded-md"
                                  >
                                    Set
                                  </Button>
                                </div>
                              </TableCell>

                              <TableCell className="py-3">
                                <div className="flex items-center gap-1.5">
                                  <Badge className={`text-[10px] font-bold ${
                                    (u.blueprintSettings?.burnout_index || 0) > 80 ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" :
                                    "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                  }`}>
                                    Endeks: %{u.blueprintSettings?.burnout_index || 0}
                                  </Badge>
                                  {u.isBurnoutActive && (
                                    <Badge className="bg-emerald-500 text-white text-[8px] font-mono py-0 px-1 animate-pulse">
                                      MOLADA
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-1.5 max-w-[110px]">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={userBurnoutInput}
                                    onChange={(e) => setInlineBurnouts({ ...inlineBurnouts, [u.id]: e.target.value })}
                                    className="bg-slate-950 border-slate-800 text-[10px] h-6 px-1.5 rounded-md"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateBurnoutIndex(u.id, userBurnoutInput)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] h-6 px-1.5 rounded-md"
                                  >
                                    Set
                                  </Button>
                                </div>
                              </TableCell>

                              <TableCell className="py-3">
                                <div className="text-[10px] text-slate-300 space-y-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-500 font-medium">Son Giriş:</span>
                                    <span className="font-mono text-[9px]">
                                      {u.lastLoginDate ? new Date(u.lastLoginDate).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-500 font-medium">Varis:</span>
                                    <span>{u.legacyHeir?.fullName ? `${u.legacyHeir.fullName} (${u.legacyHeir.status})` : "YOK"}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge className={`text-[8px] font-bold ${u.death_certificate_verified ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                                      {u.death_certificate_verified ? "Vefat Belgesi Onaylı" : "Vefat Belgesiz"}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="py-3 text-right">
                                <div className="flex flex-col gap-1 items-end">
                                  <Button
                                    size="sm"
                                    disabled={loading || u.death_certificate_verified}
                                    onClick={() => handleVerifyDeathCertificate(u.id)}
                                    className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-500/30 font-bold text-[9px] h-6 px-2 rounded-lg w-32 justify-center"
                                  >
                                    {u.death_certificate_verified ? "✓ Vefat Onaylandı" : "☠ Vefat Belgesi Onayla"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={loading}
                                    onClick={() => handleSimulateInactivity(u.id)}
                                    className="bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-500/30 font-bold text-[9px] h-6 px-2 rounded-lg w-32 justify-center"
                                  >
                                    ⏳ 6 Ay İnaktiflik Simüle Et
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 1. Veraset & Legacy */}
        <TabsContent value="legacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-400" /> Varis Atama (Legacy Mode)
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Bir lider hesabı için yasal dijital varis tanımlayın.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAssignHeir} className="space-y-4">
                    <div>
                      <Label htmlFor="heirUserId" className="text-xs text-slate-300">Asıl Üye ID (Kullanıcı ID)</Label>
                      <Input
                        id="heirUserId"
                        value={heirUserId}
                        onChange={(e) => setHeirUserId(e.target.value)}
                        placeholder="Örn: user_123"
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="heirName" className="text-xs text-slate-300">Varis Adı Soyadı</Label>
                      <Input
                        id="heirName"
                        value={heirName}
                        onChange={(e) => setHeirName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="heirEmail" className="text-xs text-slate-300">Varis E-Posta</Label>
                      <Input
                        id="heirEmail"
                        type="email"
                        value={heirEmail}
                        onChange={(e) => setHeirEmail(e.target.value)}
                        placeholder="Örn: varis@gmail.com"
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="heirPhone" className="text-xs text-slate-300">Varis Telefon</Label>
                      <Input
                        id="heirPhone"
                        value={heirPhone}
                        onChange={(e) => setHeirPhone(e.target.value)}
                        placeholder="Örn: 0555..."
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white rounded-xl">
                      {loading ? "Kaydediliyor..." : "Varis Bilgisini Ataması Yap"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" /> Atanmış Varis Listesi & Veraset Protokolü
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    6 ay inaktif kalan veya onaylı vefat durumunda olan lider hesaplarını tek tıkla varise devredin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[350px] overflow-y-auto">
                  {state.heirUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-bold">
                      Henüz atanmış varis bilgisi olan üye bulunamadı.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                          <TableHead className="text-slate-400 text-xs font-bold">Asıl Üye</TableHead>
                          <TableHead className="text-slate-400 text-xs font-bold">Atanan Varis</TableHead>
                          <TableHead className="text-slate-400 text-xs font-bold">Varis E-Posta</TableHead>
                          <TableHead className="text-slate-400 text-xs font-bold">Durum</TableHead>
                          <TableHead className="text-slate-400 text-xs font-bold text-right">Protokol</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.heirUsers.map((u: any) => (
                          <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800/40">
                            <TableCell className="text-xs font-semibold">
                              <div>{u.fullName}</div>
                              <div className="text-[10px] text-slate-500">ID: {u.id}</div>
                            </TableCell>
                            <TableCell className="text-xs font-medium text-purple-300">
                              {u.legacyHeir?.fullName}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-slate-400">
                              {u.legacyHeir?.email}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge className={u.legacyHeir?.status === "TRANSFERRED" ? "bg-emerald-500 text-white" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"}>
                                {u.legacyHeir?.status === "TRANSFERRED" ? "DEVREDİLDİ" : "BEKLEMEDE"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {u.legacyHeir?.status !== "TRANSFERRED" ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleTriggerInheritance(u.id)}
                                  disabled={loading}
                                  className="bg-red-950 text-red-400 border border-red-500/30 hover:bg-red-900 text-[10px] font-bold rounded-xl px-2.5 py-1"
                                >
                                  Devri Tetikle
                                </Button>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                                  <UserCheck className="w-3.5 h-3.5" /> Devir Tamam
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 2. Kayıp Dal & Temizlik */}
        <TabsContent value="shadow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Shadow-Branch Recovery (Kayıp Dal Kurtarma)
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Sponsorları 30 gündür aktif olmayan yetim kolları otonom olarak üst liderlere bağlayın, sponsor döndüğünde geri yükleyin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Button onClick={handleShadowRecoveryRun} disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white rounded-xl">
                    Kayıp Dalları Tara & Bağla
                  </Button>
                  <Button onClick={handleShadowRecoveryRestore} disabled={loading} className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 rounded-xl">
                    Dalları Eski Haline Al
                  </Button>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/50">
                  <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Geçici Re-route Edilen Üyeler
                  </h4>
                  {state.recoveredUsers.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-bold py-2">
                      Şu an otonom olarak re-route edilmiş yetim dal bulunmuyor.
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-[150px] overflow-y-auto text-xs">
                      {state.recoveredUsers.map((r: any) => (
                        <li key={r.id} className="flex justify-between items-center py-1.5 border-b border-slate-800">
                          <div>
                            <span className="font-semibold text-slate-200">{r.fullName}</span>
                            <span className="text-[9px] text-slate-500 ml-1.5">(ID: {r.id})</span>
                          </div>
                          <div className="text-[10px] text-amber-400 font-mono">
                            Eski Sps: {r.originalSponsorId} → Yeni Sps: {r.sponsorId}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Energy-Efficiency (Algoritmik Temizlik)
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  6 ay boyunca hiç satış yapmayan ölü hesapları otonom pasifleştirin, alt ağacı sıkıştırarak sistem yükünü azaltın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bu motor, atıl kalan hesapları ağaçtan çıkararak alt üyeleri doğrudan üst sponsoruna bağlar. Temizliği tetikleyen aktif liderlere sistem anayasası gereği <b>$50.00 USD</b> verimlilik primi otomatik olarak ödenir.
                </p>
                <Button onClick={handleEnergyClean} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl">
                  Algoritmik Temizlik ve Sıkıştırmayı Çalıştır
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. Sigorta & Kardeşlik */}
        <TabsContent value="pools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-400" /> Otonom Yardım Gönderimi
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Predictive Insurance veya Kardeşlik havuzundan liderlere hibe destek aktarın.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendGrant} className="space-y-4">
                    <div>
                      <Label className="text-xs text-slate-300">Havuz Seçimi</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Button
                          type="button"
                          onClick={() => setGrantType("insurance")}
                          className={`text-xs font-bold rounded-xl py-2 ${grantType === "insurance" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                        >
                          Sigorta Fonu
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setGrantType("brotherhood")}
                          className={`text-xs font-bold rounded-xl py-2 ${grantType === "brotherhood" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                        >
                          Kardeşlik Havuzu
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="grantUserId" className="text-xs text-slate-300">Yararlanacak Üye ID</Label>
                      <Input
                        id="grantUserId"
                        value={grantUserId}
                        onChange={(e) => setGrantUserId(e.target.value)}
                        placeholder="Örn: user_789"
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="grantAmount" className="text-xs text-slate-300">Yardım Tutarı (USD)</Label>
                      <Input
                        id="grantAmount"
                        type="number"
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(e.target.value)}
                        placeholder="Örn: 150"
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white rounded-xl">
                      Destek Yardımı Otonom Aktar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-400" /> Havuz Çalışma Prensipleri & Blockchain Anayasası
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Kazançların güvenceye alınması ve sosyal dayanışma kuralları.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-indigo-400 mb-1">🤖 Predictive Insurance (Sigorta Fonu)</h4>
                    <p>Sistemdeki tüm ürün alımlarının %0.5'i otomatik olarak bu fona akar. Ağrı çeken, o ayki hedeflerini elde edememiş kariyerli liderlerin ciro düşüşleri bu fondan otonom olarak karşılanarak gelir sürekliliği sağlanır.</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-emerald-400 mb-1">🤝 Collective Destiny (Kardeşlik Havuzu)</h4>
                    <p>Liderlerimizin profillerinden isteğe bağlı seçtikleri yüzdelik bağışlar (%0.1, %0.5, %1.0) bu havuzda toplanır. Bir lider kaza, ameliyat veya hastalık gibi bir mazeret bildirdiğinde sistem acil yardımı cüzdanına otonom transfer eder.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 4. Burnout & Bio-Sync */}
        <TabsContent value="burnout" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" /> Burnout & Psikolojik Koruma
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Liderler için zorunlu meditasyon molası durumunu yönetin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="burnoutUserId" className="text-xs text-slate-300">Üye ID (Mola Verdirilecek Üye)</Label>
                    <Input
                      id="burnoutUserId"
                      value={burnoutUserId}
                      onChange={(e) => setBurnoutUserId(e.target.value)}
                      placeholder="Örn: user_456"
                      className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                    />
                  </div>
                  <Button
                    onClick={() => handleToggleBurnout()}
                    disabled={loading || !burnoutUserId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl"
                  >
                    Mola Durumunu Değiştir (Aç/Kapat)
                  </Button>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-500/20 text-[10px] text-slate-300 space-y-1.5">
                    <p className="font-bold text-emerald-400">💡 Bio-Digital Synchronization Nedir?</p>
                    <p>AI, üyenin site kullanım sıklığını ve satış stresini analiz ederek tükenmişlik (burnout) hissettiğinde otomatik 1 hafta meditasyon molası verir. Bu sürede üyenin aktiflik ve ciro alma hakları korunur, ancak satış baskısı sıfırlanır.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Şu An Meditasyon Molasında Olan Üyeler
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Sistem tarafından korumaya alınmış, aktif satış baskısı kaldırılmış liderler.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  {state.burnoutUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-bold">
                      Molasını kullanan veya burnout modunda olan üye bulunmuyor.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                          <TableHead className="text-slate-400 text-xs font-bold">Üye Adı</TableHead>
                          <TableHead className="text-slate-400 text-xs font-bold">E-Posta</TableHead>
                          <TableHead className="text-slate-400 text-xs font-bold">Koruma</TableHead>
                          <TableHead className="text-slate-400 text-xs font-bold text-right">Mola Bitir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.burnoutUsers.map((bu: any) => (
                          <TableRow key={bu.id} className="border-slate-800 hover:bg-slate-800/40">
                            <TableCell className="text-xs font-semibold">
                              <div>{bu.fullName}</div>
                              <div className="text-[10px] text-slate-500">ID: {bu.id}</div>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-slate-400">
                              {bu.email}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                AKTİF KORUMA
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleToggleBurnout(bu.id)}
                                disabled={loading}
                                className="bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-[10px] font-bold rounded-xl px-2.5 py-1"
                              >
                                Molayı Bitir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 5. Sandbox & Simülatör */}
        <TabsContent value="sandbox" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-sky-400" /> Shadow-Branching (Ağaç Sandbox Simülatörü)
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Ağaç yapısını bozmadan önce, "Şu lideri şuraya bağlasam komisyonlarım ne olur?" dry-run simülasyonunu çalıştırın.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRunSandbox} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sandboxUserId" className="text-xs text-slate-300">Taşınacak Üye ID</Label>
                      <Input
                        id="sandboxUserId"
                        value={sandboxUserId}
                        onChange={(e) => setSandboxUserId(e.target.value)}
                        placeholder="Örn: user_1"
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sandboxTargetId" className="text-xs text-slate-300">Yeni Hedef Sponsor ID</Label>
                      <Input
                        id="sandboxTargetId"
                        value={sandboxTargetId}
                        onChange={(e) => setSandboxTargetId(e.target.value)}
                        placeholder="Örn: user_2"
                        className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-xs font-bold text-white rounded-xl">
                    Dry-Run Simülasyonunu Tetikle
                  </Button>
                </form>

                {sandboxResult && (
                  <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-sky-500/20 text-xs space-y-2">
                    <div className="font-bold text-sky-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Simülasyon Çıktısı (Sandbox)
                    </div>
                    <div><b>Üye:</b> {sandboxResult.userName}</div>
                    <div><b>Simüle Edilen Sponsor:</b> {sandboxResult.targetSponsorName}</div>
                    <div><b>Mevcut Sponsor ID:</b> {sandboxResult.originalSponsorId}</div>
                    <div><b>Komisyon Değişimi:</b> {sandboxResult.expectedCommissionChange}</div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 mt-2">
                      {sandboxResult.treePath}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Time-Travel Analytics (Kader Haritası)
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Üyenin çalışma hızı ve ciro katlama performansına göre 1, 3 ve 5 yıllık başarı projeksiyonunu otonom hesaplayın.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRunTimeTravel} className="space-y-4">
                  <div>
                    <Label htmlFor="timeTravelUserId" className="text-xs text-slate-300">Üye ID</Label>
                    <Input
                      id="timeTravelUserId"
                      value={timeTravelUserId}
                      onChange={(e) => setTimeTravelUserId(e.target.value)}
                      placeholder="Örn: user_123"
                      className="bg-slate-800 border-slate-700 text-white mt-1 text-xs"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl">
                    Kader Haritası Simülasyonu Çalıştır
                  </Button>
                </form>

                {timeTravelResult && (
                  <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-indigo-500/20 text-xs space-y-2.5">
                    <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> AI Gelecek Projeksiyonu
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">1. Yıl Projeksiyonu</div>
                        <div className="text-[10px] font-bold text-white mt-1">{timeTravelResult.year1}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">3. Yıl Projeksiyonu</div>
                        <div className="text-[10px] font-bold text-white mt-1">{timeTravelResult.year3}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">5. Yıl Projeksiyonu</div>
                        <div className="text-[10px] font-bold text-white mt-1">{timeTravelResult.year5}</div>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-[10px] text-slate-300 mt-2">
                      <b>Öneri:</b> {timeTravelResult.aiRecommendation}
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
