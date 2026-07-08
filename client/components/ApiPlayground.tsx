/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserNode, PayoutEngineResponse, FormulaConfig, ClosureEntry } from "../../src/core/engine/types";
import { 
  Play, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Key, 
  Copy, 
  HelpCircle, 
  Settings, 
  Lock, 
  Database, 
  ListCollapse, 
  Flame, 
  Workflow, 
  RefreshCw 
} from "lucide-react";

interface ApiPlaygroundProps {
  selectedUser: UserNode | null;
  users: UserNode[];
  onCalculationSuccess: () => void;
}

export default function ApiPlayground({
  selectedUser,
  users,
  onCalculationSuccess,
}: ApiPlaygroundProps) {
  const [saleId, setSaleId] = useState("S-1003");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState(150);
  const [pvAmount, setPvAmount] = useState(120);
  const [modelType, setModelType] = useState<"binary" | "unilevel" | "matrix" | "monoline">("unilevel");
  const [productName, setProductName] = useState("Süper Gıda ve Vitamin Paketi");
  const [apiKey, setApiKey] = useState("mlm_secret_key_2026");
  const [simulateError, setSimulateError] = useState(false);
  
  // Products automation states
  interface Product {
    id: string;
    name: string;
    price: number;
    pv_amount: number;
  }
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("PRD-01"); // Default to first product
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"console" | "transactions" | "closures">("console");

  // Dynamic formula configuration state
  const [formulaConfig, setFormulaConfig] = useState<FormulaConfig>({
    BINARY_MATCHING_RATE: 0.10,
    UNILEVEL_LV1_RATE: 0.10,
    UNILEVEL_LV2_RATE: 0.05,
    UNILEVEL_LV3_RATE: 0.03,
    UNILEVEL_LV4_RATE: 0.02,
    UNILEVEL_LV5_RATE: 0.01,
    MATRIX_FLAT_RATE: 0.04,
    MONOLINE_LEVEL_RATE: 0.02,
  });

  const [closures, setClosures] = useState<ClosureEntry[]>([]);
  const [closuresLoading, setClosuresLoading] = useState(false);

  const [apiResponse, setApiResponse] = useState<PayoutEngineResponse | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [copied, setCopied] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState("");

  // Keep userId up to date if selected user changes
  useEffect(() => {
    if (selectedUser) {
      setUserId(selectedUser.id);
    } else if (users.length > 0 && !userId) {
      setUserId(users[0].id);
    }
  }, [selectedUser, users, userId]);

  // Load configuration, products and closure table on boot
  useEffect(() => {
    fetchFormulaConfig();
    fetchProducts();
    fetchClosureTable();
  }, [users]); // refetch closures if users structure changes

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products list:", err);
      setProducts([]);
    }
  };

  const handleUpdateProductPrice = async (productId: string, newPrice: number) => {
    try {
      const res = await fetch("/api/products/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, price: newPrice })
      });
      if (res.ok) {
        fetchProducts(); // Refresh products database representation
        setConfigSuccessMsg(`Product ${productId} price updated successfully to $${newPrice}!`);
        setTimeout(() => setConfigSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update product price:", err);
    }
  };

  const fetchFormulaConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setFormulaConfig(data);
      }
    } catch (err) {
      console.error("Failed to fetch formulas:", err);
    }
  };

  const fetchClosureTable = async () => {
    setClosuresLoading(true);
    try {
      const res = await fetch("/api/closures");
      if (res.ok) {
        const data = await res.json();
        setClosures(data);
      }
    } catch (err) {
      console.error("Failed to fetch closures:", err);
    } finally {
      setClosuresLoading(false);
    }
  };

  const updateFormulaOnBackend = async (key: keyof FormulaConfig, rawValue: string) => {
    const value = parseFloat(rawValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        const data = await res.json();
        setFormulaConfig(data.config);
        setConfigSuccessMsg(`Successfully updated formula: ${key} to ${(value * 100).toFixed(1)}%!`);
        setTimeout(() => setConfigSuccessMsg(""), 3000);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error}`);
      }
    } catch (err) {
      console.error("Failed to update configuration:", err);
    }
  };

  // Generate a random sale ID
  const generateNewSaleId = () => {
    setSaleId(`S-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleExecuteApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText("");
    setApiResponse(null);
    setApiStatus(null);

    try {
      const response = await fetch("/api/payouts/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          sale_id: saleId,
          user_id: userId,
          product_id: selectedProductId || undefined,
          amount: selectedProductId ? undefined : Number(amount),
          pv_amount: selectedProductId ? undefined : Number(pvAmount),
          model_type: modelType,
          product_name: selectedProductId ? undefined : productName,
          apiKey: apiKey,
          simulateError: simulateError
        }),
      });

      setApiStatus(response.status);
      const data = await response.json();
      setApiResponse(data);

      if (!response.ok) {
        setErrorText(data.error || "API transaction rolled back and threw an error.");
      } else {
        // Trigger refetch of points log, payout histories, and users in parent!
        onCalculationSuccess();
        fetchClosureTable(); // Refresh closure representations too
        // Generate a new sale id for next test
        setSaleId(`S-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } catch (err: any) {
      setErrorText(err.message || "Network request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPayloadToClipboard = () => {
    const payload = JSON.stringify({
      sale_id: saleId,
      user_id: userId,
      product_id: selectedProductId || undefined,
      amount: selectedProductId ? undefined : Number(amount),
      pv_amount: selectedProductId ? undefined : Number(pvAmount),
      model_type: modelType,
      product_name: selectedProductId ? undefined : productName,
      simulateError: simulateError
    }, null, 2);
    
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedUserInfo = users.find(u => u.id === userId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full text-slate-100" id="api-playground-panel">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950">
        <div>
          <h2 className="text-lg font-semibold text-white font-display flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-400" />
            SaaS Hak Ediş Hesaplama Kara Kutu Motoru
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strateji Deseni eşleştirme algoritmasını; simüle edilmiş satır kilitleme, Closure Table ağaçları ve gerçek zamanlı formül yapılandırmaları ile test edin.
          </p>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          POST /api/payouts/calculate
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-800">
        {/* Left Column: Request Form & Dynamic Formula Engine */}
        <div className="w-full xl:w-[48%] p-5 space-y-5 overflow-y-auto max-h-[850px] custom-scrollbar">
          
          <form onSubmit={handleExecuteApi} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Veri Paketi Oluşturucu ve Eşzamanlılık Yapılandırması
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">API Özel Anahtarı</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full px-2.5 py-1.5 pr-8 text-xs rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-emerald-300"
                    placeholder="API Anahtarı"
                  />
                  <Key className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">İşlem / Satış ID</label>
                <div className="flex gap-1 mt-1">
                  <input
                    type="text"
                    value={saleId}
                    onChange={(e) => setSaleId(e.target.value)}
                    className="block flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateNewSaleId}
                    className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg border border-slate-750 font-medium cursor-pointer"
                  >
                    Yeniden Üret
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wide flex justify-between">
                <span>📦 Tam Otomasyon: Ürün Kataloğu</span>
                <span className="text-emerald-400 font-normal">Sistem Fiyatı Alır</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProductId(val);
                  if (val) {
                    const prod = products.find(p => p.id === val);
                    if (prod) {
                      setProductName(prod.name);
                    }
                  }
                }}
                className="block w-full px-2 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 focus:outline-none text-slate-300 font-medium cursor-pointer"
              >
                <option value="">-- Manuel Tutar Girişi (Custom Input) --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (${p.price} USD / {p.pv_amount} PV)</option>
                ))}
              </select>
              {selectedProductId && (() => {
                const prod = products.find(p => p.id === selectedProductId);
                return prod ? (
                  <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-900/50 p-1.5 rounded font-mono">
                    <span>Tutar: ${prod.price}</span>
                    <span>PV: {prod.pv_amount} PV</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Salt-Okunur Güvence
                    </span>
                  </div>
                ) : null;
              })()}
            </div>

            {modelType === "binary" && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
                  SİSTEM ANAYASASI ENGELLİ: İKİLİ (BINARY) ENGELLENDİ!
                </span>
                <p className="text-[10px] leading-relaxed text-slate-300">
                  Anayasa gereğince binary, matching bonus, sol/sağ kol ve denge primleri sistem genelinde tamamen yasaklanmıştır. Bu modelin tetiklenmesi durumunda işlem otomatik olarak geri alınacak (ROLLBACK) ve hata döndürülecektir.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Satış Sahibi (Satıcı ID)</label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="mt-1 block w-full px-2 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-300 cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      ID {u.id} - {u.name}
                    </option>
                  ))}
                </select>
                {selectedUserInfo && (
                  <div className="text-[10px] text-indigo-300 mt-1">
                    Üst Sponsor: {selectedUserInfo.parent_id ? `ID ${selectedUserInfo.parent_id}` : "Kök (Yok)"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">MLM Strateji Modeli</label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value as any)}
                  className="mt-1 block w-full px-2 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-300 cursor-pointer"
                >
                  <option value="unilevel">Tek Seviyeli - Unilevel (Referans / Kariyer Seviyesi)</option>
                  <option value="monoline">Tek Hat - Monoline (Ortak Havuz)</option>
                  <option value="matrix">Matris - Matrix (Sabit Derinlik)</option>
                  <option value="binary">⚠️ İkili - Binary (ANAYASAL YASAKLI - DEPRECATED)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                  <span>Satış Tutarı (USD)</span>
                  {selectedProductId && <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Kilitli</span>}
                </label>
                <input
                  type="number"
                  value={selectedProductId ? (products.find(p => p.id === selectedProductId)?.price || 0) : amount}
                  disabled={!!selectedProductId}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`mt-1 block w-full px-2.5 py-1.5 text-xs rounded-lg border ${selectedProductId ? 'border-emerald-900/30 bg-emerald-950/10 text-emerald-300/60' : 'border-slate-700 bg-slate-950 text-slate-300'} focus:outline-none font-mono`}
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                  <span>Komisyon Hacmi (PV)</span>
                  {selectedProductId && <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Kilitli</span>}
                </label>
                <input
                  type="number"
                  value={selectedProductId ? (products.find(p => p.id === selectedProductId)?.pv_amount || 0) : pvAmount}
                  disabled={!!selectedProductId}
                  onChange={(e) => setPvAmount(Number(e.target.value))}
                  className={`mt-1 block w-full px-2.5 py-1.5 text-xs rounded-lg border ${selectedProductId ? 'border-emerald-900/30 bg-emerald-950/10 text-emerald-300/60' : 'border-slate-700 bg-slate-950 text-slate-300'} focus:outline-none font-mono`}
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ürün Detayları</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 block w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-300"
                placeholder="Ürün Adı"
                required
              />
            </div>

            {/* Pessimistic Concurrency simulation panel */}
            <div className="p-3 bg-red-950/25 border border-red-900/40 rounded-xl flex items-center justify-between">
              <div className="flex gap-2 items-start">
                <Flame className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="block text-[11px] font-bold text-rose-300">İşlem Eşzamanlılık Çakışması</span>
                  <span className="block text-[10px] text-slate-400">Simüle edilmiş kötümser kilitlenmeyi (deadlock) ve veritabanı geri alımını zorla.</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={simulateError} 
                  onChange={(e) => setSimulateError(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {isLoading ? "SQL KİLİTLEME İŞLEMİ ÇALIŞTIRILIYOR..." : "GÜVENLİ İŞLEMİ ÇALIŞTIR"}
            </button>
          </form>

          {/* Tam Otomasyon: Ürün Veritabanı Fiyat Güncelleyici */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Database className="w-4 h-4 text-emerald-400" />
                Dinamik Ürün Fiyatı Güncelleyici (Tam Otomasyon)
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Veritabanı</span>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-normal">
              Ürünlerin veritabanındaki fiyatlarını anlık değiştirin. Sonraki satışlarda motor, güncel fiyatı <b>ProductService</b> üzerinden otomatik ve salt-okunur olarak çeker.
            </p>

            <div className="space-y-3 pt-1">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-bold text-slate-300 truncate">{p.name}</span>
                    <span className="block text-[9px] text-slate-500 font-mono">{p.id} • {p.pv_amount} PV</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">$</span>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => handleUpdateProductPrice(p.id, Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-xs text-right bg-slate-950 text-emerald-400 border border-slate-800 rounded font-mono focus:outline-none focus:border-emerald-500"
                      min="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Formula Resolver Slider Widget */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Settings className="w-4 h-4 text-indigo-400" />
                Dinamik Formül Çözümleyici Yapılandırması
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Çalışma Zamanı</span>
            </div>

            {configSuccessMsg && (
              <div className="p-1.5 bg-emerald-950 border border-emerald-900 rounded text-[10px] text-emerald-400 font-medium">
                {configSuccessMsg}
              </div>
            )}

            <p className="text-[10px] text-slate-400 leading-normal">
              Bu kaydırıcıları güncellemek, çalışma zamanında bellekteki katsayıları değiştirir. Sonraki hesaplamalar anında bu formüllere uyum sağlayacaktır.
            </p>

            <div className="space-y-3 pt-1">
              {/* Binary bonus Matching */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium font-mono text-slate-300">
                  <span>İkili Eşleşme Yüzdesi (Zayıf Kol)</span>
                  <span className="text-emerald-400">{(formulaConfig.BINARY_MATCHING_RATE * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.40" 
                  step="0.01" 
                  value={formulaConfig.BINARY_MATCHING_RATE}
                  onChange={(e) => updateFormulaOnBackend("BINARY_MATCHING_RATE", e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Unilevel Level 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium font-mono text-slate-300">
                  <span>Tek Seviyeli 1. Seviye Oranı (Sponsor)</span>
                  <span className="text-emerald-400">{(formulaConfig.UNILEVEL_LV1_RATE * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.30" 
                  step="0.01" 
                  value={formulaConfig.UNILEVEL_LV1_RATE}
                  onChange={(e) => updateFormulaOnBackend("UNILEVEL_LV1_RATE", e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Unilevel Level 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium font-mono text-slate-300">
                  <span>Tek Seviyeli 2. Seviye Oranı</span>
                  <span className="text-emerald-400">{(formulaConfig.UNILEVEL_LV2_RATE * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.20" 
                  step="0.01" 
                  value={formulaConfig.UNILEVEL_LV2_RATE}
                  onChange={(e) => updateFormulaOnBackend("UNILEVEL_LV2_RATE", e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Matrix Flat */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium font-mono text-slate-300">
                  <span>Matris Sabit Oranı</span>
                  <span className="text-emerald-400">{(formulaConfig.MATRIX_FLAT_RATE * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.15" 
                  step="0.01" 
                  value={formulaConfig.MATRIX_FLAT_RATE}
                  onChange={(e) => updateFormulaOnBackend("MATRIX_FLAT_RATE", e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Monoline Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium font-mono text-slate-300">
                  <span>Tek Hat (Monoline) Seviye Oranı</span>
                  <span className="text-emerald-400">{(formulaConfig.MONOLINE_LEVEL_RATE * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.15" 
                  step="0.01" 
                  value={formulaConfig.MONOLINE_LEVEL_RATE}
                  onChange={(e) => updateFormulaOnBackend("MONOLINE_LEVEL_RATE", e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Console / ACID Transaction Log / Closure Table Tabs */}
        <div className="flex-1 bg-slate-950 p-5 flex flex-col min-h-[500px] overflow-hidden justify-between">
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Terminal Tab switcher */}
            <div className="flex border-b border-slate-800 gap-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("console")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "console"
                    ? "text-emerald-400 border-emerald-400 bg-slate-900"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                API Yanıtı (JSON)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "transactions"
                    ? "text-indigo-400 border-indigo-400 bg-slate-900"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                ACID Kilitleme Günlüğü
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("closures")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "closures"
                    ? "text-amber-400 border-amber-400 bg-slate-900"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Canlı Closure Table Görünümü
              </button>
            </div>

            {/* TAB 1: CONSOLE RESPONSE */}
            {activeTab === "console" && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>HAM YANIT DEFTERİ</span>
                  <div className="flex items-center gap-2">
                    {apiStatus && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          apiStatus === 200 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        HTTP: {apiStatus}
                      </span>
                    )}
                    <button
                      onClick={copyPayloadToClipboard}
                      className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white cursor-pointer"
                      title="Veriyi Kopyala"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-auto max-h-[380px] relative">
                  {copied && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Kopyalandı!
                    </div>
                  )}
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 animate-pulse">
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                      <span>Kötümser SELECT FOR UPDATE kilitleri simüle ediliyor...</span>
                    </div>
                  ) : apiResponse ? (
                    <pre className="text-emerald-300">{JSON.stringify(apiResponse, null, 2)}</pre>
                  ) : errorText ? (
                    <div className="text-rose-400 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
                        KÖTÜMSER GERİ ALMA İZİ (ROLLBACK TRACE):
                      </div>
                      <p className="bg-rose-950/40 border border-rose-900/60 rounded p-2.5 text-rose-300 text-xs font-mono leading-relaxed">
                        {errorText}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 text-center py-12">
                      <Code className="w-8 h-8 text-slate-850 mb-2" />
                      <p className="text-xs">JSON Konsolu Hazır</p>
                      <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                        Bir işlem seçin, parametreleri ayarlayın ve çalıştır'a tıklayın. Yanıt JSON çıktısı burada görüntülenecektir.
                      </p>
                    </div>
                  )}
                </div>

                {/* Human Explanatory Payout Breakdown */}
                {apiResponse && apiResponse.status === "success" && (
                  <div className="p-3.5 bg-indigo-950/30 border border-indigo-900/40 rounded-xl">
                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Hak Edişler Başarıyla Hesaplandı
                    </h4>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                      {apiResponse.payouts.length === 0 ? (
                        <div className="text-xs text-slate-400 italic">Henüz hak ediş oluşturulmadı. Kollar üzerinde hacim kaydedildi ancak eşleşme koşulları henüz karşılanmadı.</div>
                      ) : (
                        apiResponse.payouts.map((p, idx) => (
                          <div key={idx} className="text-xs flex flex-col border-b border-slate-900 pb-1.5 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-white">Hak Sahibi: Üye {p.user_id}</span>
                              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900/40 text-[11px]">
                                +${p.amount.toFixed(2)} USD
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 font-sans leading-tight">
                              {p.rule_details}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ACID LOCKING LOG */}
            {activeTab === "transactions" && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>ACID VERİTABANI İŞLEM ADIMLARI</span>
                  <span className="text-[10px] text-indigo-400 font-mono">KÖTÜMSER YALITIM</span>
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[460px] custom-scrollbar space-y-2">
                  {apiResponse && apiResponse.transaction_logs ? (
                    apiResponse.transaction_logs.map((log, i) => {
                      let badgeColor = "text-slate-400 bg-slate-800";
                      if (log.type === "LOCK_ACQUIRED") badgeColor = "text-amber-400 bg-amber-950/60 border border-amber-900/30";
                      if (log.type === "COMMIT") badgeColor = "text-emerald-400 bg-emerald-950/60 border border-emerald-900/30";
                      if (log.type === "ROLLBACK") badgeColor = "text-rose-400 bg-rose-950/60 border border-rose-900/30";
                      if (log.type === "LEDGER_UPDATE") badgeColor = "text-blue-400 bg-blue-950/60 border border-blue-900/30";

                      return (
                        <div key={i} className="pb-2 border-b border-slate-800 last:border-b-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString("tr-TR")}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${badgeColor}`}>
                              {log.type}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs mt-1 font-sans leading-relaxed">
                            {log.message}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 text-center py-12">
                      <Lock className="w-8 h-8 text-slate-800 mb-2" />
                      <p className="text-xs">İşlem Günlüğü Boş</p>
                      <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                        Adım adım satır düzeyi yalıtım kilidini, hesaplama öncesi anlık görüntü yakalamayı ve kayıtları (commit) incelemek için bir işlem gönderin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CLOSURE TABLE LIVE VIEW */}
            {activeTab === "closures" && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>POSTGRESQL closure_table VERİ HARİTASI</span>
                  <button 
                    onClick={fetchClosureTable} 
                    className="p-1 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer text-[10px]"
                    disabled={closuresLoading}
                  >
                    <RefreshCw className={`w-3 h-3 ${closuresLoading ? "animate-spin" : ""}`} />
                    Yenile
                  </button>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-lg text-[11px] text-slate-300 leading-normal">
                  <span className="text-indigo-400 font-bold block mb-1">Neden Closure Table Kullanılmalı?</span>
                  Bitişiklik listeleri (adjacency lists), derin alt hatları keşfetmek için iç içe yinelenen sorgular gerektirir. Closure Table ile, 20 derinliğindeki tüm sponsor hiyerarşisini sorgulamak <strong>tek bir yüksek hızlı join SELECT</strong> işlemi gerektirir.
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-[380px]">
                  <div className="grid grid-cols-3 bg-slate-950 p-2 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 text-center">
                    <div>Sponsor ID (Üst Hat)</div>
                    <div>Alt Hat ID</div>
                    <div>Derinlik (Seviye)</div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-1 divide-y divide-slate-800/60 font-mono text-xs">
                    {closures.length === 0 ? (
                      <div className="text-slate-600 text-center py-12">Hesaplanmış ilişki bulunmuyor.</div>
                    ) : (
                      closures
                        .sort((a, b) => a.ancestor_id.localeCompare(b.ancestor_id) || a.depth - b.depth)
                        .map((entry, idx) => (
                          <div key={idx} className="grid grid-cols-3 p-1.5 text-center hover:bg-slate-800/40 rounded transition-colors">
                            <div className="text-indigo-300 font-bold">{entry.ancestor_id}</div>
                            <div className="text-slate-300">{entry.descendant_id}</div>
                            <div>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                entry.depth === 0 ? "bg-slate-800 text-slate-400" : "bg-amber-500/10 text-amber-400"
                              }`}>
                                {entry.depth === 0 ? "Kendisi (0)" : `Seviye ${entry.depth}`}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Quick Sandbox Tip */}
          <div className="mt-4 text-[11px] text-slate-500 leading-normal flex gap-1.5 border-t border-slate-800/60 pt-3">
            <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>
              <strong>İlişkisel Yalıtım Demosu:</strong> Bir güncelleme başarısız olduğunda durum değişikliklerinin nasıl anında ve güvenle geri alındığına (rollback) tanık olmak için <strong>İşlem Eşzamanlılık Çakışması</strong> onay kutusunu işaretleyin.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
