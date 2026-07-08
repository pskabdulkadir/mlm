import React from 'react';
import { AlertTriangle, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface DisclaimerProps {
  onAccept: () => void;
}

export default function Disclaimer({ onAccept }: DisclaimerProps) {
  return (
    <div id="disclaimer-root" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Background soft auric halos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-900/10 rounded-full filter blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-xl w-full bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-sans tracking-tight font-bold bg-gradient-to-r from-purple-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Quantum-Healing AI
          </h1>
          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            BİYO-REZONANS & MANEVİ ŞİFA REHBERİ
          </p>
        </div>

        <div className="border-t border-slate-800/80 my-4" />

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
          <p>
            Kozmik enerji alanı tarayıcımıza hoş geldiniz. Devam etmeden önce bu sistemin çalışma felsefesini ve sınırlarını okumanız önemlidir:
          </p>

          <div className="flex gap-3 bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 text-amber-300/90 text-xs md:text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-medium mb-1 text-amber-200">Kritik Tıbbi Sorumluluk Reddi (Disclaimer)</strong>
              Bu uygulama <span className="text-amber-100 underline decoration-amber-500/50">kesinlikle tıbbi bir tanı, tedavi veya teşhis aracı değildir</span>. Kamera tabanlı rPPG ve aura simülasyonları bilimsel yaklaşımlarla (kan akışı renk analizleri) desteklenen deneysel birer biyo-rezonans göstergesidir. Tıbbi şikayetleriniz için mutlaka tıp hekimlerine danışmalısınız.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400 pt-2">
            <div className="flex items-start gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
              <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>Kişiliğiniz ve verileriniz cihazınızda analiz edilir ve asla uzak sunuculara kayıt edilmez.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
              <Heart className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span>Geleneksel Kuran şifa öğretileri ile modern ses bilimini (Binaural Beats) birleştiren bir meditasyon rehberidir.</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 my-4" />

        <div className="flex flex-col space-y-3">
          <button
            id="accept-disclaimer-btn"
            onClick={onAccept}
            className="w-full py-4 text-center text-sm font-semibold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-slate-100 shadow-xl shadow-indigo-950/40 border border-indigo-500/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Anladım, Rezonansı Keşfet
          </button>
          
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              SÜRÜM V2.5.0 • CO-KORELASYON MOTORU ETKİN
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
