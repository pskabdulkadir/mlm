/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Code, BookOpen, Copy, Check, Terminal, Database, FileCode, CheckCircle, ShieldAlert } from "lucide-react";

type LanguageTab = "node" | "python" | "curl" | "go" | "php";
type SdkTab = "sdk" | "ddl";

export default function SdkDocumentation() {
  const [activeTab, setActiveTab] = useState<LanguageTab>("node");
  const [activeSdkTab, setActiveSdkTab] = useState<SdkTab>("sdk");
  const [copied, setCopied] = useState(false);
  const [sqlSchema, setSqlSchema] = useState("");
  const [copiedSql, setCopiedSql] = useState(false);
  const [sqlLoading, setSqlLoading] = useState(false);

  useEffect(() => {
    fetchSqlSchema();
  }, []);

  const fetchSqlSchema = async () => {
    setSqlLoading(true);
    try {
      const res = await fetch("/api/sql-schema");
      if (res.ok) {
        const data = await res.json();
        setSqlSchema(data.sql);
      }
    } catch (err) {
      console.error("Failed to load SQL Schema:", err);
    } finally {
      setSqlLoading(false);
    }
  };

  const sdkSnippets: Record<LanguageTab, string> = {
    node: `/**
 * Modüler MLM Hak Ediş Motoru Node.js SDK
 * Bu kod bloğunu, ödeme/sipariş webhook veya olay dinleyiciniz içinde kullanın.
 */
import axios from 'axios';

const MLM_ENGINE_URL = "https://your-mlm-engine.io/api/payouts/calculate";
const API_KEY = "mlm_secret_key_2026"; // process.env içinde güvenli şekilde saklayın

async function creditCommissionsForSale(checkoutData) {
  try {
    const response = await axios.post(MLM_ENGINE_URL, {
      sale_id: checkoutData.id,        // benzersiz satış kimliği (sale ID)
      user_id: checkoutData.affiliate_id, // satışı yönlendiren üye kimliği (user ID)
      amount: checkoutData.amount_usd,  // gerçek USD tutarı
      pv_amount: checkoutData.pv,       // MLM hesaplamalarında kullanılacak Puan Değeri (PV)
      model_type: "binary",             // 'binary' | 'unilevel' | 'matrix' | 'monoline'
      product_name: checkoutData.product_title
    }, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      }
    });

    if (response.data.status === "success") {
      console.log(\`[MLM Motoru] Hesaplanan hak edişler:\`, response.data.payouts);
      console.log(\`[MLM Motoru] ACID Kilitleme kayıtları:\`, response.data.transaction_logs);
      
      // Yerel veritabanınızda cüzdan bakiye artışlarını gerçekleştirin:
      for (const payout of response.data.payouts) {
        await myDatabase.users.incrementWalletBalance({
          userId: payout.user_id,
          amount: payout.amount,
          reason: payout.rule_details
        });
      }
    }
  } catch (error) {
    console.error("[MLM Motoru] Bağlantı Hatası:", error.response?.data || error.message);
    throw error;
  }
}`,

    python: `'''
Modüler MLM Hak Ediş Motoru Python SDK
Entegre etmek için kopyala-yapıştır yapabilirsiniz.
'''
import requests
import json

MLM_ENGINE_URL = "https://your-mlm-engine.io/api/payouts/calculate"
API_KEY = "mlm_secret_key_2026"

def distribute_commissions(sale_data):
    payload = {
        "sale_id": sale_data["id"],
        "user_id": sale_data["affiliate_id"],
        "amount": float(sale_data["amount"]),
        "pv_amount": int(sale_data["pv"]),
        "model_type": "binary",  # "binary", "unilevel", "matrix" veya "monoline" seçin
        "product_name": sale_data["product_title"]
    }
    
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(MLM_ENGINE_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        
        if result.get("status") == "success":
            print(f"Payout calculated for {result['sale_id']}")
            for payout in result.get("payouts", []):
                # Django/Flask/FastAPI tarafında üye cüzdanlarını güncelleyin:
                credit_user_balance(payout["user_id"], payout["amount"], payout["rule_details"])
            return True
    except requests.exceptions.RequestException as e:
        print(f"Komisyon hatası: {e}")
        return False
`,

    curl: `# cURL komut satırı kullanımı
# Motoru doğrudan terminal veya kabuk (shell) betiğinden test edin
curl -X POST "http://localhost:3000/api/payouts/calculate" \\
     -H "x-api-key: mlm_secret_key_2026" \\
     -H "Content-Type: application/json" \\
     -d '{
       "sale_id": "S-5509",
       "user_id": "104",
       "amount": 250.00,
       "pv_amount": 200,
       "model_type": "unilevel",
       "product_name": "Premium E-Ticaret Masterclass Paketi"
     }'`,

    go: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

const MlmEngineUrl = "https://your-mlm-engine.io/api/payouts/calculate"
const ApiKey = "mlm_secret_key_2026"

type PayoutPayload struct {
	SaleId      string  \`json:"sale_id"\`
	UserId      string  \`json:"user_id"\`
	Amount      float64 \`json:"amount"\`
	PvAmount    int     \`json:"pv_amount"\`
	ModelType   string  \`json:"model_type"\`
	ProductName string  \`json:"product_name"\`
}

func CreditMlmPayouts(saleId string, memberId string, amt float64, pv int, productName string) error {
	payload := PayoutPayload{
		SaleId:      saleId,
		UserId:      memberId,
		Amount:      amt,
		PvAmount:    pv,
		ModelType:   "binary",
		ProductName: productName,
	}

	jsonBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", MlmEngineUrl, bytes.NewBuffer(jsonBytes))
	req.Header.Set("x-api-key", ApiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("MLM motoru hata kodu döndürdü: %d", resp.StatusCode)
	}

	return nil
}`,

    php: `<?php
/**
 * PHP MLM Ödeme İstemcisi (PHP Client)
 * WordPress, WooCommerce veya özel Laravel projeleri için ideal entegrasyon
 */

function process_mlm_payout($checkout_data) {
    $url = "https://your-mlm-engine.io/api/payouts/calculate";
    $api_key = "mlm_secret_key_2026";

    $payload = [
        "sale_id" => $checkout_data['sale_id'],
        "user_id" => $checkout_data['affiliate_id'],
        "amount" => $checkout_data['amount'],
        "pv_amount" => $checkout_data['pv'],
        "model_type" => "unilevel",
        "product_name" => $checkout_data['product_name']
    ];

    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\\r\\n" .
                         "x-api-key: " . $api_key . "\\r\\n",
             'method'  => 'POST',
             'content' => json_encode($payload),
             'ignore_errors' => true
         ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        throw new Exception("Hak Ediş Motoruna bağlanırken hata oluştu.");
    }

    $response_data = json_decode($result, true);
    if ($response_data['status'] === 'success') {
        foreach ($response_data['payouts'] as $payout) {
            // WordPress/WooCommerce cüzdan bakiye güncellemesi:
            my_custom_credit_user_wallet($payout['user_id'], $payout['amount'], $payout['rule_details']);
        }
        return true;
    }
    return false;
}`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sdkSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full" id="sdk-docs-panel">
      {/* Panel Top Navigation */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-md font-bold text-slate-800 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            SaaS Altyapı Referansı ve SDK
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Üretime hazır entegrasyon uç noktaları, veritabanı yerleşim şemaları ve çok dilli webhook şablonları.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-200/60 p-1 rounded-lg self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSdkTab("sdk")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSdkTab === "sdk" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            Webhook Entegrasyonu
          </button>
          <button
            onClick={() => setActiveSdkTab("ddl")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSdkTab === "ddl" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            PostgreSQL SQL Şeması
          </button>
        </div>
      </div>

      {activeSdkTab === "sdk" ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-[480px]">
          {/* Left explanation index */}
          <div className="w-full lg:w-72 bg-slate-50/40 p-5 border-b lg:border-b-0 lg:border-r border-slate-100 space-y-4 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Entegrasyon Genel Bakış</h4>
              <p className="leading-relaxed">
                Bu motor, tamamen **durumsuz (stateless) bir kara kutu API mikroservisi** olarak çalışır. Müşteriye yönelik ana mağazanız, karmaşık MLM mantıksal ağaçlarından bağımsız kalır.
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50 border border-indigo-100/50 rounded-xl space-y-1.5 leading-relaxed text-[11px]">
              <strong className="text-indigo-800 block text-xs font-semibold">Güvenlik ve Uyumluluk</strong>
              Tüm gelen işlemler, hesaplamayı yetkilendirmek için <code className="font-mono bg-indigo-100 px-1 py-0.2 rounded text-indigo-700 text-[10px]">x-api-key</code> istek başlığını (header) gerektirir. Anahtarın gizli kalması için dış ağ girişlerini sınırlayın.
            </div>

            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Desteklenen Stratejiler</h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li><strong className="text-slate-800 font-semibold">İkili (Binary) Stratejisi</strong>: Kollardaki birikimlere göre eşleşme bonusları oluşturur.</li>
                <li><strong className="text-slate-800 font-semibold">Tek Seviyeli (Unilevel) Stratejisi</strong>: Çok seviyeli doğrudan referans komisyonları sağlar.</li>
                <li><strong className="text-slate-800 font-semibold">Matris (Matrix) Stratejisi</strong>: Otomatik dağılımlı sabit ızgara yapıları oluşturur.</li>
                <li><strong className="text-slate-800 font-semibold">Tek Hat (Monoline) Stratejisi</strong>: Küresel kronolojik yerleşim kuyruğu sağlar.</li>
              </ul>
            </div>
          </div>

          {/* Right Code Block Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden text-slate-200 min-h-[400px]">
            {/* Tab selectors */}
            <div className="flex bg-slate-950 border-b border-slate-850 overflow-x-auto">
              {(["node", "python", "curl", "go", "php"] as LanguageTab[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setActiveTab(lang); setCopied(false); }}
                  className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer uppercase text-nowrap ${
                    activeTab === lang
                      ? "border-emerald-400 text-emerald-400 bg-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                  id={`sdk-tab-${lang}`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  {lang === "node" ? "Node.js (Axios)" : lang === "python" ? "Python" : lang === "curl" ? "cURL" : lang}
                </button>
              ))}
            </div>

            {/* Code display */}
            <div className="flex-1 p-5 relative overflow-auto font-mono text-xs max-h-[500px] custom-scrollbar">
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                id="btn-copy-sdk"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Kopyalandı" : "SDK Kodunu Kopyala"}
              </button>
              <pre className="text-slate-300 leading-relaxed font-mono whitespace-pre">{sdkSnippets[activeTab]}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row min-h-[480px]">
          {/* Left relational DB details */}
          <div className="w-full lg:w-72 bg-slate-50/40 p-5 border-b lg:border-b-0 lg:border-r border-slate-100 space-y-4 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">İlişkisel Veri Stratejisi</h4>
              <p className="leading-relaxed">
                Yavaş çalışan özyinelemeli bitişiklik listesi (adjacency list) sorguları yerine bu motor, **Closure Table Modeli** ile üretime hazır bir PostgreSQL düzeni sunar.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl space-y-1 text-[11px] text-amber-800 leading-relaxed">
              <strong className="text-amber-900 block text-xs font-bold">Kilitler (SELECT FOR UPDATE)</strong>
              Eşzamanlılık bütünlüğü, veritabanı düzeyindeki yazma işlemleri sırasında kötümser kilitlerle (pessimistic locks) bakiye artırımı yürütülerek korunur. Yarış durumları (race conditions) matematiksel olarak önlenir.
            </div>

            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Tablo Kataloğu</h4>
              <ul className="space-y-1.5 font-medium text-slate-700">
                <li className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-slate-400" /> <span className="font-mono">users</span>: PV kollarına sahip üyeler</li>
                <li className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-slate-400" /> <span className="font-mono">closure_table</span>: Doğrudan üst hat haritaları</li>
                <li className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-slate-400" /> <span className="font-mono">points_log</span>: İşlem endeksi</li>
                <li className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-slate-400" /> <span className="font-mono">payout_history</span>: Denetlenmiş hak ediş defteri</li>
                <li className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-slate-400" /> <span className="font-mono">formula_config</span>: Çalışma zamanı katsayıları</li>
              </ul>
            </div>
          </div>

          {/* Right SQL code block */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden text-slate-200 min-h-[400px]">
            <div className="flex justify-between items-center bg-slate-950 px-5 py-3 border-b border-slate-850">
              <span className="text-xs font-mono text-indigo-400">schema.sql (PostgreSQL Şeması)</span>
              <button
                onClick={copySqlToClipboard}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-750 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? "Kopyalandı" : "SQL Şemasını Kopyala"}
              </button>
            </div>

            <div className="flex-1 p-5 relative overflow-auto font-mono text-xs max-h-[500px] custom-scrollbar">
              {sqlLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12 animate-pulse">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2"></div>
                  <span>PostgreSQL DDL şeması yükleniyor...</span>
                </div>
              ) : (
                <pre className="text-slate-300 leading-relaxed font-mono whitespace-pre">{sqlSchema}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
