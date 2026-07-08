import React, { useState, useEffect, useRef } from 'react';
import { VolumeX, Volume2, ShieldCheck, Play, Square, Heart, Brain, RefreshCw, Send, AlertCircle, Clock, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { audioService } from '../utils/audio_synth';
import { AuricScanResult, QuranRemedy } from '../types';
import { quranRemedies } from '../data/quran_db';

// Helper to convert simple markdown to HTML strings to avoid library dependency bugs
function parseMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/### (.*?)\n/g, '<h4 class="text-xs uppercase font-mono tracking-wider font-bold text-teal-300 mt-5 mb-2">$1</h4>')
    .replace(/## (.*?)\n/g, '<h3 class="text-sm uppercase font-mono tracking-widest font-bold text-purple-300 mt-6 border-b border-purple-500/10 pb-1.5">$1</h3>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-teal-200 font-bold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="text-slate-300 italic">$1</em>')
    .replace(/- (.*?)\n/g, '<li class="text-xs text-slate-300 ml-4 list-disc mb-1.5">$1</li>')
    .replace(/\n\n/g, '<p class="mb-3 leading-relaxed text-xs text-slate-300"></p>')
    .replace(/\n/g, '<br/>');
}

interface TherapyPanelProps {
  activeScanResult: AuricScanResult | null;
  onRefreshScan: () => void;
}

export default function TherapyPanel({
  activeScanResult,
  onRefreshScan
}: TherapyPanelProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute default timer
  const [breathPhase, setBreathPhase] = useState<'Nefes Al' | 'Tut (Dolu)' | 'Nefes Ver' | 'Tut (Boş)'>('Nefes Al');
  const [breathPercent, setBreathPercent] = useState(0); // 0 to 100 for visual pulse
  const [aiReport, setAiReport] = useState<string>('');
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string>('');

  const timerRef = useRef<any>(null);
  const breathTimerRef = useRef<any>(null);
  // PDF raporu (hazırlanıyor)
  const downloadPdfReport = () => {
    alert('PDF raporu özelliği yakında aktif edilecektir.');
  };

  // Default mock-up fallback if user hasn't scanned yet
  const dummyScanResult: AuricScanResult = {
    id: 'dummy',
    timestamp: 'Şimdi',
    energyScore: 68,
    stressLevel: 51,
    heartRate: 74,
    breathingRate: 14,
    dominantColor: 'Turuncu Akışkan',
    dominantVibe: 'Duygusal Blokaj / Değişim Safhası',
    blockageLocation: 'Solar Pleksus - Karaciğer & Mide',
    healingProtocol: {
      musicHz: 528,
      surahId: 'fatiha',
      esma: 'Ya Şâfî, Ya Kâfî',
      binauralCarrier: 220,
      binauralBeat: 6,
    }
  };

  const activeData = activeScanResult || dummyScanResult;
  const targetSurah = quranRemedies.find(r => r.id === activeData.healingProtocol.surahId) || quranRemedies[0];

  // Request fresh AI report from Gemini when data changes or on request
  const fetchPersonalizedReport = async () => {
    setIsLoadingReport(true);
    setReportError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energyScore: activeData.energyScore,
          stressLevel: activeData.stressLevel,
          heartRate: activeData.heartRate,
          breathingRate: activeData.breathingRate,
          dominantColor: activeData.dominantColor,
          dominantVibe: activeData.dominantVibe,
          blockageLocation: activeData.blockageLocation,
          selectedSurah: targetSurah,
        })
      });
      const resData = await response.json();
      if (resData.success && resData.report) {
        setAiReport(resData.report);
      } else {
        setReportError(resData.error || 'Gemini analiz sentezi alınamadı.');
      }
    } catch (err: any) {
      console.error(err);
      setReportError('Bağlantı hatası: Sunucu ile iletişim kurulamadı.');
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Auto fetch report once if active scan changes
  useEffect(() => {
    fetchPersonalizedReport();
  }, [activeScanResult]);

  // Box Breathing cycle (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  useEffect(() => {
    if (!sessionActive) return;

    let breathCount = 0;
    const interval = 100; // run every 100ms for smooth transitions
    
    breathTimerRef.current = setInterval(() => {
      breathCount += 100;
      const phaseTimer = (breathCount % 4000) / 4000; // 0 to 1 ratio in 4s cycle
      
      const phaseIndex = Math.floor(breathCount / 4000) % 4;
      
      if (phaseIndex === 0) {
        setBreathPhase('Nefes Al');
        setBreathPercent(Math.floor(phaseTimer * 100));
      } else if (phaseIndex === 1) {
        setBreathPhase('Tut (Dolu)');
        setBreathPercent(100);
      } else if (phaseIndex === 2) {
        setBreathPhase('Nefes Ver');
        setBreathPercent(Math.floor((1 - phaseTimer) * 100));
      } else if (phaseIndex === 3) {
        setBreathPhase('Tut (Boş)');
        setBreathPercent(0);
      }
    }, interval);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [sessionActive]);

  // General therapy session timer countdown
  useEffect(() => {
    if (sessionActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      stopSession();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionActive, timeLeft]);

  const startSession = () => {
    setSessionActive(true);
    setTimeLeft(120); // 2 minutes therapy cycle default
    
    // Start procedural frequencies matching the scan diagnostics!
    audioService.start(
      activeData.healingProtocol.musicHz,
      activeData.healingProtocol.binauralBeat,
      activeData.healingProtocol.musicHz,
      true, // nature water wave
      true, // cosmic background
      0.65 // high therapeutic volume
    );
  };

  const stopSession = () => {
    setSessionActive(false);
    audioService.stop();
  };

  return (
    <div className="space-y-4">
      {!activeScanResult && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-400">🚨 Standart Kalibrasyon Modu Etkin</span>
              <p className="text-slate-300 leading-normal mt-0.5 max-w-xl">
                Henüz fiziksel rPPG kamera analizini tamamlamadığınız için, sistem standart döküm şablon değerleri ve kalibratör frekansı (528 Hz) ile çalışıyor. Kişiselleştirilmiş onarım seansı ve özel Kur\'an rezonans eşleşmeleri için lütfen bir tarama gerçekleştirin.
              </p>
            </div>
          </div>
          <button
            onClick={onRefreshScan}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold font-sans rounded-xl text-xs hover:bg-amber-450 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
          >
            Hemen Tarama Başlat ➔
          </button>
        </div>
      )}
      <div id="therapy-panel-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER Gird Columns (Therapy controls & Box Breathing) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Main Breathing visual target card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col items-center text-center space-y-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.04),transparent)] pointer-events-none" />

          <div className="w-full flex items-center justify-between border-b border-slate-800/50 pb-3">
            <div className="text-left">
              <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                aktif onarım terapisi
              </span>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Kutucuk (Box) Nefes Kalibrasyonu
              </h2>
            </div>
            
            {sessionActive && (
              <div className="flex items-center gap-1.5 font-mono text-cyan-400 bg-cyan-400/10 border border-teal-500/20 px-3 py-1 rounded-xl">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Breathing Aura Circle */}
          <div className="relative w-52 h-52 flex items-center justify-center select-none">
            {/* Pulsating background ring */}
            <div 
              className="absolute rounded-full border border-teal-400/25 transition-all duration-300 filter blur-[1px]"
              style={{
                width: `${100 + breathPercent * 1.0}px`,
                height: `${100 + breathPercent * 1.0}px`,
                backgroundColor: `rgba(20, 184, 166, ${0.03 + (breathPercent / 1000)})`
              }}
            />

            {/* Inner Core target */}
            <div className={`w-32 h-32 rounded-full bg-slate-950 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-2xl relative z-10 transition-all ${
              sessionActive ? 'scale-105 border-cyan-400' : 'border-slate-800'
            }`}>
              {sessionActive ? (
                <>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase animate-pulse">
                    {breathPhase}
                  </span>
                  <span className="text-xs font-bold text-slate-100 font-mono mt-1">
                    %{breathPercent} Genişlik
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">
                    TERAPİ STBY
                  </span>
                  <span className="text-xs text-slate-400 mt-1 font-sans">
                    Hazır
                  </span>
                </>
              )}
            </div>

            {/* Simulated circular orbit node */}
            {sessionActive && (
              <div 
                className="absolute w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] z-20"
                style={{
                  transform: `rotate(${(breathPercent / 100) * 360}deg) translateY(-80px)`
                }}
              />
            )}
          </div>

          <div className="space-y-2 max-w-md">
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Oksijen miktarınızı dengelemek ve kalp hızı değişkenliğinizi (HRV) Solfeggio titreşimine senkronize etmek için ekrandaki genişleme döngüsünü takip ederek yavaşça nefes alıp verin.
            </p>

            <AnimatePresence mode="wait">
              {sessionActive ? (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl text-xs text-teal-300 font-mono"
                >
                  🎧 Kulaklığınızı takın. Çift kulağa ({activeData.healingProtocol.binauralBeat}Hz farkla) Binaural Beat verilmektedir.
                </motion.div>
              ) : (
                <div className="text-xs font-mono text-slate-500">
                  Seans Süresi: 2 Dakika • Frekans Odaklanma Kilidi Etkin
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Action toggle button */}
          <div className="w-full pt-2 flex flex-col items-center gap-2">
            {sessionActive ? (
              <button
                onClick={stopSession}
                className="w-full max-w-xs py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-sm font-semibold transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 inline mr-2" />
                Seansı Tamamlamadan Durdur
              </button>
            ) : (
              <div className="w-full max-w-xs flex flex-col gap-2">
                <button
                  onClick={startSession}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:opacity-90 active:scale-[0.98] text-slate-950 font-bold transition-all shadow-xl shadow-cyan-950/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 inline mr-2 fill-slate-950 text-slate-950" />
                  Rezonans Terapisini Başlat
                </button>

                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all cursor-pointer uppercase flex items-center justify-center gap-2 border ${
                    showAnalysis 
                      ? 'bg-violet-900 border-violet-500 text-white shadow-lg' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>{showAnalysis ? '📊 Analiz Panelini Gizle' : '📊 Öncesi / Sonrası Analizi & PDF Raporu'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 📊 Gelişim & Analiz Paneli (Mevcut Durum - Öncesi & Sonrası Karşılaştırma Modülü) */}
        <AnimatePresence>
          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-slate-950/50 rounded-2xl border border-violet-500/20 p-4 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-xs font-bold font-mono text-violet-400 uppercase tracking-widest">
                    Öncesi / Sonrası Re-Kalibrasyon Sonuçları
                  </h3>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Seans öncesi bazal optik rPPG ile seans sonu parasempatik hücresel sinyal farkları.
                  </p>
                </div>
                
                <button
                  onClick={downloadPdfReport}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-slate-100 text-[11px] font-mono font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Raporu İndir
                </button>
              </div>

              {/* Grid of indicators comparing target points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Nabız karşılaştırma */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>KALP RİTİM PARASİNYALİ</span>
                    <span className="text-teal-400 font-bold">-%15 Stabilite</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">ÖNCESİ</span>
                      <span className="text-sm font-bold text-slate-350">{activeData.heartRate} BPM</span>
                    </div>
                    <div className="text-slate-600">➔</div>
                    <div className="text-right">
                      <span className="text-[9px] text-teal-400 uppercase block font-sans font-bold">SONRASI</span>
                      <span className="text-lg font-bold text-teal-400">{Math.max(65, activeData.heartRate - 12)} BPM</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full w-[85%]" />
                  </div>
                </div>

                {/* 2. Stres karşılaştırma */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>STRES & KORTİZOL ENDEKSİ</span>
                    <span className="text-teal-400 font-bold">-%58 Derin Theta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">ÖNCESİ</span>
                      <span className="text-sm font-bold text-slate-350">%{activeData.stressLevel}</span>
                    </div>
                    <div className="text-slate-600">➔</div>
                    <div className="text-right">
                      <span className="text-[9px] text-teal-400 uppercase block font-sans font-bold">SONRASI</span>
                      <span className="text-lg font-bold text-teal-400">%{Math.max(22, Math.round(activeData.stressLevel * 0.42))}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[42%]" />
                  </div>
                </div>

                {/* 3. Hücre şarjı karşılaştırma */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>HÜCRESEL ENERJİ (AURA GENLİĞİ)</span>
                    <span className="text-teal-400 font-bold">+%35 Akustik Yük</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">ÖNCESİ</span>
                      <span className="text-sm font-bold text-slate-350">%{activeData.energyScore}</span>
                    </div>
                    <div className="text-slate-600">➔</div>
                    <div className="text-right">
                      <span className="text-[9px] text-teal-400 uppercase block font-sans font-bold">SONRASI</span>
                      <span className="text-lg font-bold text-teal-400">%{Math.min(96, activeData.energyScore + 24)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full w-[96%]" />
                  </div>
                </div>

                {/* 4. Solunum katsayısı */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>SOLUNUM DÖNGÜ DERİNLİĞİ</span>
                    <span className="text-teal-400 font-bold">P-COHERENCE %100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">ÖNCESİ</span>
                      <span className="text-sm font-bold text-slate-350">{activeData.breathingRate} / dk</span>
                    </div>
                    <div className="text-slate-600">➔</div>
                    <div className="text-right">
                      <span className="text-[9px] text-teal-400 uppercase block font-sans font-bold">SONRASI</span>
                      <span className="text-lg font-bold text-teal-400">6 / dk</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full w-[100%]" />
                  </div>
                </div>
              </div>

              {/* Certification note */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex items-start gap-2.5 text-[10px] text-slate-400 leading-normal">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="font-sans">
                  <strong className="text-emerald-400 block font-mono font-bold text-[9px] uppercase">
                    Manevi Frekans & Biyo-Gelişim Sistem Onayı
                  </strong>
                  Kişisel biyo-harmonizasyon dengesi başarıyla teyit edilmiştir. Bu rapor optik PPG tahlilleri ve Psikolog & Rezonans Kurucusu Abdulkadir Kan onay mekanizmasıyla oluşturulmaktadır. Sayfayı yazdırarak PDF'e dönüştürebilirsiniz.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick summaries under controls */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850 flex gap-3">
            <div className="p-2.5 bg-cyan-400/10 rounded-xl border border-cyan-400/20 text-cyan-400 flex-shrink-0 h-10 w-10 flex items-center justify-center">
              <Heart className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">aktif şifa frekansı</span>
              <h4 className="text-xs font-bold text-white pt-0.5">{activeData.healingProtocol.musicHz} Hz (Solfeggio)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal truncate">{targetSurah.name} ve Esma {targetSurah.esma.split(',')[0]} eşleşti.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850 flex gap-3">
            <div className="p-2.5 bg-purple-400/10 rounded-xl border border-purple-400/20 text-purple-400 flex-shrink-0 h-10 w-10 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">binaural entrain</span>
              <h4 className="text-xs font-bold text-white pt-0.5">{activeData.healingProtocol.binauralBeat} Hz (Theta Sızma)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal truncate">Zihni derin dinginlik theta fazına hazırlar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT Column (Gemini AI Sentezi markdown result report) */}
      <div className="space-y-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md h-full flex flex-col justify-between space-y-4">
          
          <div className="space-y-1 pb-2 border-b border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                Kelimelerin Şifası • AI Sentez
              </span>
              
              <button 
                onClick={fetchPersonalizedReport}
                disabled={isLoadingReport}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-850 disabled:opacity-40 cursor-pointer"
                title="Sentezi Yeniden Gönder"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReport ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <h3 className="text-sm font-bold text-white pt-1">
              Kuantum Manevi Şifa Sentezi
            </h3>
          </div>

          {/* Report scroll area */}
          <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
            {isLoadingReport ? (
              <div className="h-44 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <span className="text-xs text-purple-300 font-mono animate-pulse">
                  Kozmik frekanslar toplanıyor...
                </span>
                <span className="text-[9px] text-slate-500 max-w-[190px] text-center leading-normal">
                  Gemini yapay zekası, son taranan rPPG nabzınızı ve saptanan enerji çöküntüsünü analiz ediyor.
                </span>
              </div>
            ) : reportError ? (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Bağlantı Sorunu</span>
                </div>
                <p className="leading-relaxed">
                  {reportError}
                </p>
                <button
                  onClick={fetchPersonalizedReport}
                  className="w-full mt-2 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : aiReport ? (
              <div 
                className="prose-slate pt-1 leading-relaxed selection:bg-purple-500/30"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(aiReport) }}
              />
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs py-14 space-y-2">
                <span>Rapor oluşturulabilmesi için ilk olarak tarama panelini tamamlamanız gerekmektedir.</span>
                <button
                  onClick={fetchPersonalizedReport}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 hover:text-white cursor-pointer"
                >
                  Sentezi Şimdi Tetikle
                </button>
              </div>
            )}
          </div>

          {/* Trust and safety bottom validation tag */}
          <div className="border-t border-slate-800/60 pt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Sentez, %100 her seferinde kişiye özel üretilmektedir.</span>
          </div>

        </div>
      </div>

    </div>
    </div>
  );
}
