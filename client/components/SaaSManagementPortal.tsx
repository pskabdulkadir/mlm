/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Key, 
  Shield, 
  FileText, 
  Sliders, 
  Check, 
  Copy, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Lock,
  Terminal,
  RefreshCw,
  Search,
  Activity,
  Users,
  Layers
} from "lucide-react";
import { UserNode } from "../../src/core/engine/types";
import { CAREER_LEVELS } from "../../src/core/engine/config/career-config";

interface ApiKeyItem {
  key: string;
  name: string;
  created: string;
  status: "active" | "revoked";
}

interface SaaSManagementPortalProps {
  users?: UserNode[];
}

export default function SaaSManagementPortal({ users = [] }: SaaSManagementPortalProps) {
  // States for API keys
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { key: "mlm_secret_key_2026", name: "Üretim Ortamı Anahtarı", created: "2026-01-10", status: "active" },
    { key: "mlm_sandbox_key_9918", name: "Geliştirici Test Anahtarı", created: "2026-06-15", status: "active" }
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // States for IP Whitelisting
  const [ipList, setIpList] = useState<string[]>([
    "185.85.105.11",
    "34.120.45.210"
  ]);
  const [newIp, setNewIp] = useState("");

  // States for Rate Limiting
  const [rateLimit, setRateLimit] = useState(120); // requests per min
  const [isRateLimitingActive, setIsRateLimitingActive] = useState(true);

  // States for Live Transaction Feed & Polling
  const [logs, setLogs] = useState<any[]>([]);
  const [logsFilter, setLogsFilter] = useState("");
  const [isLogsPollingActive, setIsLogsPollingActive] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/transaction-logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch transaction logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!isLogsPollingActive) return;
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [isLogsPollingActive, users]);

  // Depth Health dynamic metrics analyzer
  const getMaxDownlineDepth = (userId: string): number => {
    let maxD = 0;
    const traverse = (id: string, currentDepth: number) => {
      maxD = Math.max(maxD, currentDepth);
      const children = users.filter((u) => u.parent_id === id);
      children.forEach((c) => traverse(c.id, currentDepth + 1));
    };
    traverse(userId, 0);
    return maxD;
  };

  const totalSubscribers = users.length;
  let restrictedCount = 0;
  const levelBlockages: Record<number, number> = {};
  const levelTotals: Record<number, number> = {};

  // Initialize
  CAREER_LEVELS.forEach(lvl => {
    levelBlockages[lvl.level] = 0;
    levelTotals[lvl.level] = 0;
  });

  users.forEach((u) => {
    const level = u.career_level || 1;
    levelTotals[level] = (levelTotals[level] || 0) + 1;

    const maxD = getMaxDownlineDepth(u.id);
    const limit = CAREER_LEVELS[level - 1]?.monolineDepthLimit || 10;
    
    if (maxD > limit) {
      restrictedCount++;
      levelBlockages[level] = (levelBlockages[level] || 0) + 1;
    }
  });

  const efficiencyPercent = totalSubscribers > 0 
    ? Math.round(((totalSubscribers - restrictedCount) / totalSubscribers) * 100) 
    : 100;

  // States for Freemium / Commission Pricing calculator
  const [monthlySales, setMonthlySales] = useState(150000); // USD
  const [commissionRate, setCommissionRate] = useState(0.2); // 0.2% commission
  const [freeCreditsUsed, setFreeCreditsUsed] = useState(342); // out of 1000

  // Copy API key utility
  const copyKeyToClipboard = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate new simulated API Key
  const generateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const randomHex = Math.floor(Math.random() * 90000 + 10000);
    const newKey: ApiKeyItem = {
      key: `mlm_live_key_${randomHex}`,
      name: newKeyName,
      created: new Date().toISOString().split("T")[0],
      status: "active"
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
  };

  // Revoke API Key
  const revokeKey = (keyStr: string) => {
    setApiKeys(apiKeys.map(k => k.key === keyStr ? { ...k, status: "revoked" as const } : k));
  };

  // Add IP to list
  const addIpAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = newIp.trim();
    // basic validation
    if (!cleanIp) return;
    if (ipList.includes(cleanIp)) {
      setNewIp("");
      return;
    }
    setIpList([...ipList, cleanIp]);
    setNewIp("");
  };

  // Delete IP from list
  const removeIpAddress = (ipToRemove: string) => {
    setIpList(ipList.filter(ip => ip !== ipToRemove));
  };

  // Calculate pricing estimates
  const calculatedFee = (monthlySales * (commissionRate / 100));

  return (
    <div className="space-y-6" id="saas-portal">
      {/* Upper overview section: B2B SaaS Licensing Model */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Freemium Credits Meter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wide text-indigo-700 bg-indigo-50 rounded-md border border-indigo-100">
                GELİŞTİRİCİ DOSTU MODEL
              </span>
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 animate-pulse" /> Freemium Sandbox
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm mt-2">İlk 1.000 İşlem %100 Ücretsiz</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Yazılımcıların entegrasyonu tamamen sürtünmesiz tamamlayabilmesi için ilk 1.000 API çağrısı ücretlendirilmez.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-[11px] font-medium text-slate-500">
              <span>Tüketilen Ücretsiz Limit</span>
              <span className="font-mono font-bold text-slate-700">{freeCreditsUsed} / 1.000</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(freeCreditsUsed / 1000) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              ✓ Limit dolana kadar hiçbir fatura veya kredi kartı talep edilmez.
            </p>
          </div>
        </div>

        {/* Dynamic SaaS Licensing Tier Calculator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 col-span-1 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wide text-amber-700 bg-amber-50 rounded-md border border-amber-100">
                LİSANSLAMA MODELİ: İŞLEM HACMİ % FEE
              </span>
              <h3 className="font-bold text-slate-800 text-sm mt-1.5">B2B SaaS Değer Odaklı Fiyatlandırma</h3>
              <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                Yatırım maliyetini sıfırlayan hacim bazlı ücretlendirme: Sisteminizden geçen prim komisyon hacminden küçük bir pay alınır. Siz büyüdükçe SaaS ölçeklenir.
              </p>
            </div>
            
            {/* Live calculation banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center sm:text-right min-w-[140px] flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tahmini Aylık Ücret</span>
              <span className="text-xl font-black text-indigo-600 font-mono mt-0.5 block">${calculatedFee.toFixed(2)}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">({commissionRate}% komisyon payı)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Monthly commission volume slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium font-mono">
                <span className="text-slate-500">Sistemden Geçen Aylık Ciro</span>
                <span className="text-indigo-600 font-bold">${monthlySales.toLocaleString()} USD</span>
              </div>
              <input 
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={monthlySales}
                onChange={(e) => setMonthlySales(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Commission share selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium font-mono">
                <span className="text-slate-500">İşlem Hacmi Komisyon Oranı</span>
                <span className="text-indigo-600 font-bold">{commissionRate.toFixed(2)}%</span>
              </div>
              <input 
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main SaaS Portal Workspace Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8-cols): API Key Management & IP Protection & Bot Blocker */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* API Key Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Geliştirici API Yetki Anahtarları</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dış mağaza webhook'larınızın motor API'sine bağlanırken kullanacağı x-api-key anahtarları.</p>
                </div>
              </div>
            </div>

            {/* Generator Form */}
            <form onSubmit={generateApiKey} className="flex gap-2">
              <input 
                type="text"
                placeholder="Örn: WooCommerce Webhook Canlı Ortam"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 text-slate-700 font-medium"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-indigo-700 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Anahtar Üret
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="p-3">Anahtar Başlığı / Tanım</th>
                    <th className="p-3 font-mono">Secret Key (Token)</th>
                    <th className="p-3">Oluşturulma</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {apiKeys.map((k) => (
                    <tr key={k.key} className={k.status === "revoked" ? "opacity-50 bg-slate-50/40" : ""}>
                      <td className="p-3 text-slate-700 font-semibold">{k.name}</td>
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-[10px]">
                            {k.key}
                          </code>
                          {k.status === "active" && (
                            <button
                              onClick={() => copyKeyToClipboard(k.key)}
                              className="text-slate-400 hover:text-indigo-600 cursor-pointer p-0.5 rounded"
                              title="Kopyala"
                            >
                              {copiedKey === k.key ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] font-mono">{k.created}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          k.status === "active" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {k.status === "active" ? "AKTİF" : "İPTAL EDİLDİ"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {k.status === "active" ? (
                          <button
                            onClick={() => revokeKey(k.key)}
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-md text-[10px] font-bold border border-transparent hover:border-rose-100 cursor-pointer transition-colors"
                          >
                            İptal Et
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Devre Dışı</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bot Prevention & IP Whitelisting Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* IP Whitelisting panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">IP Beyaz Liste (IP Whitelist)</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sadece izin verilen ağlardan API erişimi.</p>
                  </div>
                </div>
              </div>

              {/* Add IP Address Form */}
              <form onSubmit={addIpAddress} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Örn: 185.85.105.11"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 text-slate-700 font-mono font-medium"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-700 cursor-pointer transition-colors"
                >
                  Ekle
                </button>
              </form>

              {/* IP list render */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {ipList.length === 0 ? (
                  <p className="text-[10px] text-amber-600 font-medium">Tüm IP adreslerinden gelen API çağrılarına açık (Düşük Güvenlik).</p>
                ) : (
                  ipList.map((ip) => (
                    <div key={ip} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-700">
                      <span>{ip}</span>
                      <button 
                        onClick={() => removeIpAddress(ip)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 rounded transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bot Blocker & Rate Limiter configs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Hız Sınırlayıcı (Rate Limiter)</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Siber saldırı ve DDoS bot engelleme eşikleri.</p>
                  </div>
                </div>
              </div>

              {/* Config fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Rate Limiting Koruması</span>
                  <button 
                    onClick={() => setIsRateLimitingActive(!isRateLimitingActive)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                      isRateLimitingActive ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                      isRateLimitingActive ? "translate-x-5.5" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                <div className={`space-y-1.5 transition-opacity duration-200 ${isRateLimitingActive ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  <div className="flex justify-between text-[11px] font-medium font-mono text-slate-500">
                    <span>Maksimum İstek Eşiği</span>
                    <span className="text-indigo-600 font-bold">{rateLimit} İstek/Dakika</span>
                  </div>
                  <input 
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] p-2 rounded-lg leading-relaxed flex items-start gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>IP tabanlı kural seti aktif. Aşırı yük altında istemci otomatik olarak HTTP 429 Too Many Requests döndürecektir.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Right Column (4-cols): Official SLA Contract Document */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-sm text-slate-200 flex flex-col justify-between space-y-4 h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm font-display">SLA Hizmet Sözleşmesi</h3>
                  <p className="text-[9px] text-slate-400 font-mono">SERVICE LEVEL AGREEMENT (SLA) VER. 2026.1</p>
                </div>
              </div>

              {/* Scrollable contract text block */}
              <div className="text-[11px] text-slate-400 leading-relaxed font-sans space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                <p>
                  <strong className="text-slate-300 block">1. ÇALIŞMA SÜRESİ (UPTIME) GARANTİSİ</strong>
                  Modüler MLM Hak Ediş Motoru, bulut dağıtım mimarisi (Cloud Run/SQL) üzerinde yedekli kümeler halinde çalışır. SaaS müşterilerimize aylık bazda <strong>%99.99 Uptime</strong> (Çalışma Süresi) garantisi sunulur.
                </p>
                <p>
                  <strong className="text-slate-300 block">2. ACID HESAPLAMA Sorumluluğu</strong>
                  Sistemimiz, durumsuz matematik hesaplamalarında ve veri aktarımlarında row-locking (satır kilitleme) yaparak yarış koşullarını (race conditions) önler. Motorumuzdan kaynaklanan yazılımsal hesaplama hatalarında tüm sorumluluk firmamıza ait olup, hata tespitinde anında geriye dönük telafi güncellemeleri yapılır.
                </p>
                <p>
                  <strong className="text-slate-300 block">3. MÜŞTERİ ENTEGRASYON SINIRLARI</strong>
                  Müşterinin (işletme sahibi geliştirici) kendi WooCommerce, WordPress, Shopify veya Laravel platformundaki veri transferi, yanlış API kullanımı veya geçersiz payload formatları nedeniyle oluşacak kesinti ve hatalardan firmamız sorumlu tutulamaz.
                </p>
                <p>
                  <strong className="text-slate-300 block">4. GÜVENLİK VE GİZLİLİK</strong>
                  Tüm HTTP paketleri TLS 1.3 ile şifrelenir. API keylerin güvenliği müşterinin sorumluluğundadır. İptal edilen (revoked) API anahtarlarından doğan veri kayıplarında firmamız mesuliyet kabul etmez.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex items-start gap-3 mt-4">
              <Lock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">Hukuki Güvence Altında</span>
                <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                  Bu sözleşme, kurumsal üyelik paketleri için geçerli standart B2B SaaS iş ortaklığı şartnamesidir.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. ADIM: GÖRSEL İZLEME (DASHBOARD) EKLEMELERI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-time Ledger Feed Terminal (8-cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 text-slate-100" id="live-ledger-feed">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100 font-mono">Real-time Ledger Feed & Lock Terminal</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">ACID işlem motorunun anlık SELECT FOR UPDATE ve kilit serbest bırakma (Commit/Rollback) trace dökümü.</p>
                </div>
              </div>

              {/* Polling / Refresh controls */}
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsLogsPollingActive(!isLogsPollingActive)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                    isLogsPollingActive 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isLogsPollingActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`}></span>
                  {isLogsPollingActive ? "Canlı Akış Açık" : "Canlı Akış Duraklatıldı"}
                </button>
                <button 
                  type="button"
                  onClick={fetchLogs}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Manuel Yenile"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="text"
                placeholder="Loglarda ara (örn. LOCK, UPDATE, COMMIT)..."
                value={logsFilter}
                onChange={(e) => setLogsFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-300 font-mono placeholder:text-slate-600 bg-black/40"
              />
            </div>
          </div>

          {/* Terminal Console Log Output */}
          <div className="bg-black/80 border border-slate-800/80 rounded-xl p-4 font-mono text-xs overflow-y-auto h-[260px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {logs.filter(log => 
              log.message?.toLowerCase().includes(logsFilter.toLowerCase()) || 
              log.type?.toLowerCase().includes(logsFilter.toLowerCase())
            ).length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-750" />
                Henüz eşleşen işlem kütüğü veya kilit logu bulunmuyor.
                <p className="text-[10px] mt-1 text-slate-700">Hak Ediş Oluşturucu modülünde yeni bir işlem tetikleyerek akışı başlatabilirsiniz.</p>
              </div>
            ) : (
              logs.filter(log => 
                log.message?.toLowerCase().includes(logsFilter.toLowerCase()) || 
                log.type?.toLowerCase().includes(logsFilter.toLowerCase())
              ).map((log, index) => {
                let textClass = "text-slate-300";
                if (log.type === "LEDGER_UPDATE" || log.message?.includes("LEDGER")) {
                  textClass = "text-cyan-400";
                } else if (log.type === "COMMIT" || log.message?.includes("COMMIT")) {
                  textClass = "text-emerald-400 font-bold";
                } else if (log.type === "ROLLBACK" || log.message?.includes("ROLLBACK")) {
                  textClass = "text-rose-400 font-bold";
                } else if (log.type === "CAREER_UPGRADE" || log.message?.includes("CAREER-UPGRADE")) {
                  textClass = "text-fuchsia-400 font-bold";
                } else if (log.type === "INFO" || log.message?.includes("LOCK") || log.message?.includes("SELECT FOR UPDATE")) {
                  if (log.message?.includes("LOCK") || log.message?.includes("locked")) {
                    textClass = "text-amber-400";
                  } else {
                    textClass = "text-slate-400";
                  }
                }
                
                return (
                  <div key={index} className="flex items-start gap-2 hover:bg-slate-900/50 py-0.5 px-1 rounded transition-colors leading-relaxed">
                    <span className="text-slate-600 text-[10px] flex-shrink-0 select-none mt-0.5">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString("tr-TR") : ""}
                    </span>
                    <span className={textClass}>{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Toplam Günlük Log Kapasitesi: 500 satır</span>
            <span>WebSocket Emülasyonu: Aktif (3000ms polling)</span>
          </div>
        </div>

        {/* Depth Health Analytics (4-cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 text-slate-800" id="depth-health-analytics">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Activity className="w-5 h-5 text-indigo-600" />
              Depth Health Analytics
            </h3>
            <p className="text-[11px] text-slate-400">Kariyer seviyelerine göre derinlik kısıtlamaları ve ödeme verimliliği analizi.</p>
          </div>

          {/* Efficiency Metric Gauge Row */}
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {/* Visual Circle Meter representation */}
                <div className="w-14 h-14 rounded-full border-4 border-slate-200 flex items-center justify-center font-mono font-black text-sm text-indigo-600 bg-white">
                  {efficiencyPercent}%
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ödeme Verimliliği</span>
                <strong className="text-slate-800 text-xs block">Sistem Kayıp Engelleme Oranı</strong>
                <p className="text-[10px] text-slate-500 leading-normal">Kariyer seviyesi sebebiyle komisyon alamayan üyelerin oranını gösterir.</p>
              </div>
            </div>

            {/* restricted count banner */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
                <span className="block text-[9px] text-amber-700 font-bold uppercase">Limiti Aşan Üyeler</span>
                <strong className="text-amber-800 font-mono text-lg block mt-0.5">{restrictedCount}</strong>
                <span className="text-[8px] text-amber-600 block">Alt kolu limiti geçen</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl">
                <span className="block text-[9px] text-indigo-700 font-bold uppercase">Toplam Kayıtlı</span>
                <strong className="text-indigo-800 font-mono text-lg block mt-0.5">{totalSubscribers}</strong>
                <span className="text-[8px] text-indigo-600 block">Sistem ağındaki üye</span>
              </div>
            </div>
          </div>

          {/* Career Bottlenecks List / Table */}
          <div className="space-y-2 flex-1 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nefis Mertebeleri Tıkanma Haritası</span>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {CAREER_LEVELS.map((lvl) => {
                const totalAtLvl = levelTotals[lvl.level] || 0;
                const blockedAtLvl = levelBlockages[lvl.level] || 0;
                const isBottleneck = blockedAtLvl > 0;
                
                return (
                  <div 
                    key={lvl.level} 
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      isBottleneck 
                        ? "bg-rose-50/50 border-rose-100 text-rose-900 font-semibold" 
                        : "bg-slate-50/40 border-slate-100 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isBottleneck ? "bg-rose-500 animate-pulse" : "bg-slate-300"}`}></span>
                      <span className="font-mono text-[10px] text-slate-400">Lvl {lvl.level}</span>
                      <strong className="text-slate-700">{lvl.name}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Limit: {lvl.monolineDepthLimit}</span>
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                        isBottleneck ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {blockedAtLvl} / {totalAtLvl} Capped
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Real-time Telemetry Shield Status Line */}
      <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-indigo-200">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
          <span className="font-semibold text-indigo-100">Aktif Güvenlik Kalkanı (SaaS Firewall API)</span>
          <span className="text-[10px] text-indigo-300 font-mono">· IP Koruma Aktif · 4096-bit TLS Entegrasyonu</span>
        </div>
        <div className="text-[10px] font-mono text-indigo-300 font-medium">
          DDoS Filtresi: Sıfır Sürtünmeli Sandbox Modunda Çalışıyor
        </div>
      </div>
    </div>
  );
}
