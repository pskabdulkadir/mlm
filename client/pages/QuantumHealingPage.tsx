import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Compass,
  BookOpen,
  Heart,
  History,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowLeft,
} from 'lucide-react';

import Disclaimer from '@/quantum/components/Disclaimer';
import DigitalTwin, { MERIDIANS, MeridianNode } from '@/quantum/components/DigitalTwin';
import BiometricScanner from '@/quantum/components/BiometricScanner';
import SolfeggioLibrary from '@/quantum/components/SolfeggioLibrary';
import ManeviResonance from '@/quantum/components/ManeviResonance';
import TherapyPanel from '@/quantum/components/TherapyPanel';
import HistoryDashboard from '@/quantum/components/HistoryDashboard';
import { AuricScanResult } from '@/quantum/types';

export default function QuantumHealingPage() {
  const navigate = useNavigate();
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'library' | 'resonance' | 'therapy' | 'history'>('scan');

  const [selectedNode, setSelectedNode] = useState<MeridianNode>(MERIDIANS[3]);
  const [selectedSurahId, setSelectedSurahId] = useState<string>('fatiha');

  const [activeScanResult, setActiveScanResult] = useState<AuricScanResult | null>(null);
  const [scansHistory, setScansHistory] = useState<AuricScanResult[]>([]);

  const [currentTimeStr, setCurrentTimeStr] = useState<string>('00:00:00');

  useEffect(() => {
    const accepted = localStorage.getItem('quantum_disclaimer_accepted');
    if (accepted === 'true') {
      setHasAcceptedDisclaimer(true);
    }

    const savedHistory = localStorage.getItem('quantum_scans_history');
    if (savedHistory) {
      try {
        setScansHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.debug("Failed to parse scans history", e);
      }
    }

    const savedLastScan = localStorage.getItem('quantum_last_scan_result');
    if (savedLastScan) {
      try {
        setActiveScanResult(JSON.parse(savedLastScan));
      } catch (e) {
        console.debug("Failed to parse last scan result", e);
      }
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedNode) {
      setSelectedSurahId(selectedNode.associatedSurahId);
    }
  }, [selectedNode]);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('quantum_disclaimer_accepted', 'true');
    setHasAcceptedDisclaimer(true);
  };

  const handleScanCompleted = (result: AuricScanResult) => {
    setActiveScanResult(result);

    const matchedNode = MERIDIANS.find(node => node.name === result.blockageLocation);
    if (matchedNode) {
      setSelectedNode(matchedNode);
    }

    const updatedHistory = [result, ...scansHistory];
    setScansHistory(updatedHistory);

    localStorage.setItem('quantum_last_scan_result', JSON.stringify(result));
    localStorage.setItem('quantum_scans_history', JSON.stringify(updatedHistory));

    setActiveTab('therapy');
  };

  const handleClearHistory = () => {
    if (window.confirm('Bütün taranmış enerji kanalı geçmişinizi silmek istediğinize emin misiniz?')) {
      setScansHistory([]);
      localStorage.removeItem('quantum_scans_history');
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'scan':
        return (
          <div className="space-y-6">
            <BiometricScanner
              onScanComplete={handleScanCompleted}
              selectedNode={selectedNode}
              onSetSelectedNode={setSelectedNode}
            />
            <DigitalTwin
              selectedNodeId={selectedNode.id}
              onSelectNode={setSelectedNode}
              scannerAnomalyId={
                activeScanResult?.blockageLocation
                  ? MERIDIANS.find(n => n.name === activeScanResult.blockageLocation)?.id
                  : undefined
              }
            />
          </div>
        );
      case 'library':
        return (
          <SolfeggioLibrary
            currentCarrierHz={selectedNode.associatedHz}
            onSelectCarrier={(hz) => {
              const matched = MERIDIANS.find(n => n.associatedHz === hz);
              if (matched) setSelectedNode(matched);
            }}
          />
        );
      case 'resonance':
        return (
          <ManeviResonance
            currentCarrierHz={selectedNode.associatedHz}
            onSelectCarrier={(hz) => {
              const matched = MERIDIANS.find(n => n.associatedHz === hz);
              if (matched) setSelectedNode(matched);
            }}
            selectedSurahId={selectedSurahId}
            onSelectSurahId={setSelectedSurahId}
          />
        );
      case 'therapy':
        return (
          <TherapyPanel
            activeScanResult={activeScanResult}
            onRefreshScan={() => setActiveTab('scan')}
          />
        );
      case 'history':
        return (
          <HistoryDashboard
            scans={scansHistory}
            onClearHistory={handleClearHistory}
          />
        );
      default:
        return null;
    }
  };

  if (!hasAcceptedDisclaimer) {
    return <Disclaimer onAccept={handleAcceptDisclaimer} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-900/10 rounded-full filter blur-[140px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-950/10 rounded-full filter blur-[140px] animate-pulse" />
      </div>

      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/batini-panel')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Üye Paneline Dön
          </button>
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-slate-950">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Quantum-Healing AI
              <span className="text-[9px] font-mono font-normal bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
                Bio-Rezonans V2.5
              </span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Kozmik Hücresel Frekans Düzenleyici
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span>Lokasyon: <strong className="text-slate-200">{selectedNode.physicalRegion}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>SAAT: <strong className="text-white">{currentTimeStr}</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-500">
            <span>Yazar:</span>
            <span className="text-slate-400 font-sans">Abdulkadir Kan</span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 p-4 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">

        <AnimatePresence>
          {!activeScanResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-3 flex gap-3 text-xs text-indigo-300"
            >
              <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                Ruhsal durumunuzun otomatik algılanması ve kişiye özel Kuran-ı Kerim şifa suresi - esma sentezinin tetiklenmesi için öncelikle{' '}
                <strong>'Quantum Biyo-Optik Tarama'</strong> panelinden tarama başlatmanız önerilir.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-2">
          {[
            { id: 'scan', label: 'Biyometrik Tarama', icon: Activity, desc: 'Aura/rPPG' },
            { id: 'library', label: 'Şifa Ses Kütüphanesi', icon: Compass, desc: 'Solfeggio' },
            { id: 'resonance', label: 'Manevi Rezonans', icon: BookOpen, desc: 'Süre/Ayet' },
            { id: 'therapy', label: 'Onarım & Yükleme', icon: Heart, desc: 'Senkronizasyon' },
            { id: 'history', label: 'Gelişim Geçmişi', icon: History, desc: 'Grafikler' },
          ].map(tab => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[140px] px-4 py-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 text-white shadow-lg shadow-indigo-950/25'
                    : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComp className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold font-sans">{tab.label}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 pl-6 uppercase">{tab.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-950 bg-slate-950/90 text-slate-500 text-[10px] font-mono p-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>SİSTEM DURUMU: NOMİNAL RE-HİZALANDIRMA AKTİF • COGNITIVE SYNTHESIS: ONLINE</span>
        </div>
        <div>
          <span>MEDİKAL DESTEK TAVSİYESİ DEĞİLDİR • KADİM FREKANS GÜVENCESİ • TS-2026</span>
        </div>
      </footer>
    </div>
  );
}
