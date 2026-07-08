/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserNode, PointsLogEntry, PayoutHistoryEntry } from "../../src/core/engine/types";
import { Table, Layers, ArrowRightLeft, DollarSign, RotateCcw, Search, ChevronRight } from "lucide-react";

interface DatabaseLedgerProps {
  users: UserNode[];
  pointsLog: PointsLogEntry[];
  payouts: PayoutHistoryEntry[];
  onReset: () => void;
}

type ActiveTable = "users" | "points" | "payouts";

export default function DatabaseLedger({
  users,
  pointsLog,
  payouts,
  onReset,
}: DatabaseLedgerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTable>("payouts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm("Veritabanını sıfırlamak istediğinize emin misiniz? Bu işlem varsayılan ağaç hiyerarşisini geri yükleyecektir.")) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        onReset();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.includes(searchQuery) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPoints = pointsLog.filter(
    (p) =>
      p.sale_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_id.includes(searchQuery) ||
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayouts = payouts.filter(
    (p) =>
      p.user_id.includes(searchQuery) ||
      p.sale_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rule_details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full" id="database-ledger-panel">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 font-display flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            Çekirdek İlişkisel Veritabanı Defteri
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            PostgreSQL ilişkisel hiyerarşi şemasını temsil eden sunucu tablolarının gerçek zamanlı görünümü.
          </p>
        </div>
        
        {/* Reset Database and Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Veritabanını filtrele..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Veritabanını başlangıç değerlerine sıfırla"
            id="btn-reset-db"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            {isResetting ? "Sıfırlanıyor..." : "VT Sıfırla"}
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-100 bg-slate-50/20">
        <button
          onClick={() => { setActiveTab("payouts"); setSearchQuery(""); }}
          className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === "payouts"
              ? "border-indigo-600 text-indigo-600 bg-white font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
          id="tab-payouts"
        >
          <DollarSign className="w-4 h-4" />
          Hak Ediş Geçmişi ({payouts.length})
        </button>

        <button
          onClick={() => { setActiveTab("points"); setSearchQuery(""); }}
          className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === "points"
              ? "border-indigo-600 text-indigo-600 bg-white font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
          id="tab-points"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Puan Günlüğü ({pointsLog.length})
        </button>

        <button
          onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
          className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === "users"
              ? "border-indigo-600 text-indigo-600 bg-white font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
          id="tab-users"
        >
          <Layers className="w-4 h-4" />
          Kullanıcı Ağacı Kaydı ({users.length})
        </button>
      </div>

      {/* Database Tables Content */}
      <div className="flex-1 overflow-auto min-h-[300px]">
        {activeTab === "users" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Üye Düğümü</th>
                <th className="p-3.5">Hiyerarşik Yerleşim</th>
                <th className="p-3.5">İkili Ağaç Bağlantıları</th>
                <th className="p-3.5">Sol Kol (PV)</th>
                <th className="p-3.5">Sağ Kol (PV)</th>
                <th className="p-3.5 pr-5">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Filtreleme kriterine uygun üye bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 text-slate-700 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {u.id} · @{u.username}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[11px]">Sponsor:</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                          {u.parent_id ? `ID ${u.parent_id}` : "KÖK"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Doğrudan Üst Hat: @{users.find(x => x.id === u.upline_id)?.username || "yok"}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5 font-mono text-[11px] text-slate-600">
                        <div>Sol: <span className="text-slate-400">{u.left_child_id ? `ID ${u.left_child_id}` : "boş"}</span></div>
                        <div>Sağ: <span className="text-slate-400">{u.right_child_id ? `ID ${u.right_child_id}` : "boş"}</span></div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 font-bold">{u.group_pv_left}</td>
                    <td className="p-3.5 font-mono text-slate-600 font-bold">{u.group_pv_right}</td>
                    <td className="p-3.5 pr-5 text-slate-400 font-mono text-[11px]">
                      {new Date(u.joined_at).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === "points" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Satış ID</th>
                <th className="p-3.5">Üye Düğümü</th>
                <th className="p-3.5">Satın Alınan Ürün</th>
                <th className="p-3.5">Satış Tutarı</th>
                <th className="p-3.5">Komisyon Hacmi</th>
                <th className="p-3.5 pr-5">Zaman Damgası</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPoints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Puan Günlüğü veritabanında işlem bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredPoints.map((p) => {
                  const user = users.find((u) => u.id === p.user_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 text-slate-700 transition-colors">
                      <td className="p-3.5 pl-5 font-mono text-indigo-600 font-semibold">{p.sale_id}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{user?.name || "Bilinmeyen"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Kullanıcı ID: {p.user_id}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{p.product_name}</td>
                      <td className="p-3.5 font-mono text-slate-800 font-bold">${p.amount.toFixed(2)}</td>
                      <td className="p-3.5 font-mono text-indigo-600 font-bold">{p.pv_amount} PV</td>
                      <td className="p-3.5 pr-5 text-slate-400 font-mono text-[11px]">
                        {new Date(p.timestamp).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === "payouts" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Hak Ediş Alıcısı</th>
                <th className="p-3.5">Satış Sahibi</th>
                <th className="p-3.5">Bonus Türü</th>
                <th className="p-3.5">Hesaplama Formülü Detayları</th>
                <th className="p-3.5">Ödenen Tutar</th>
                <th className="p-3.5 pr-5">İşlem Zamanı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Henüz ödenen komisyon bulunmuyor. Ödeme oluşturmak için API işlemlerini gerçekleştirin!
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => {
                  const recipient = users.find((u) => u.id === p.user_id);
                  const relatedPoint = pointsLog.find((pl) => pl.sale_id === p.sale_id);
                  const seller = users.find((u) => u.id === relatedPoint?.user_id);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 text-slate-700 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-semibold text-slate-900">{recipient?.name || `ID ${p.user_id}`}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Alıcı ID: {p.user_id}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-700">{seller?.name || "Sistem"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Satış ID: {p.sale_id}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {p.model_type === "BINARY" ? "İKİLİ (BINARY)" : p.model_type === "UNILEVEL" ? "TEK SEVİYELİ (UNILEVEL)" : p.model_type === "MATRIX" ? "MATRİS (MATRIX)" : "MONOLINE"}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-sm leading-relaxed">
                        {p.rule_details}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-sm">
                          +${p.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-slate-400 font-mono text-[11px]">
                        {new Date(p.timestamp).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
