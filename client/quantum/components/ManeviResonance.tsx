import React, { useState } from 'react';
import { BookOpen, Sparkles, Volume2, ShieldCheck, Play, Square, Award, RefreshCw, Key, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { quranRemedies } from '../data/quran_db';
import { audioService } from '../utils/audio_synth';
import { QuranRemedy } from '../types';
import { ESMA_VIBES, EsmaVibe } from '../data/esma_db';

interface ManeviResonanceProps {
  currentCarrierHz: number;
  onSelectCarrier: (hz: number) => void;
  selectedSurahId: string;
  onSelectSurahId: (id: string) => void;
}

export default function ManeviResonance({
  currentCarrierHz,
  onSelectCarrier,
  selectedSurahId,
  onSelectSurahId
}: ManeviResonanceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'quran' | 'esma'>('quran');
  const [isPlaying, setIsPlaying] = useState(false);

  // Esma Tab localized states & modern Search capability
  const [selectedEsmaId, setSelectedEsmaId] = useState<string>(ESMA_VIBES[0].id);
  const [esmaSearchQuery, setEsmaSearchQuery] = useState<string>('');
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [tasbihCycles, setTasbihCycles] = useState<number>(0);

  const activeRemedy = quranRemedies.find(r => r.id === selectedSurahId) || quranRemedies[1];
  const activeEsma = ESMA_VIBES.find(e => e.id === selectedEsmaId) || ESMA_VIBES[0];

  const filteredEsmaVibes = ESMA_VIBES.filter(esma => {
    const q = esmaSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      esma.transliteration.toLowerCase().includes(q) ||
      esma.name.toLowerCase().includes(q) ||
      esma.meaning.toLowerCase().includes(q) ||
      esma.targetAuraNode.toLowerCase().includes(q) ||
      esma.spiritualImpact.toLowerCase().includes(q)
    );
  });

  const handlePlayQuranSignal = () => {
    audioService.start(
      activeRemedy.healingFrequencyHz,
      6, // Sweet 6Hz Theta beat for deep meditation
      activeRemedy.healingFrequencyHz,
      true, // play nature sound (water wave)
      true, // play cosmic pad synth
      0.65 // high therapeutic volume scale
    );
    setIsPlaying(true);
    onSelectCarrier(activeRemedy.healingFrequencyHz);
  };

  const handlePlayEsmaSignal = () => {
    audioService.start(
      activeEsma.cosmicFrequencyHz,
      3, // Deep delta/theta transition
      activeEsma.cosmicFrequencyHz,
      true,
      true,
      0.65
    );
    setIsPlaying(true);
    onSelectCarrier(activeEsma.cosmicFrequencyHz);
  };

  const handleStopSignal = () => {
    audioService.stop();
    setIsPlaying(false);
  };

  // Click Tasbih interaction
  const handleTasbihClick = () => {
    // Generate subtle clicking feedback or chime pulse
    if (audioService.getStatus()) {
      audioService.triggerChime(activeEsma.cosmicFrequencyHz * 1.5);
    } else {
      // triggers short synth click using a temporary pitch if mixer is off
      audioService.init();
      audioService.triggerChime(activeEsma.cosmicFrequencyHz);
    }

    setTasbihCount(prev => {
      let next = prev + 1;
      if (next >= activeEsma.ebcedValue) {
        setTasbihCycles(c => c + 1);
        next = 0;
        // Full sacred bow chime trigger upon reaching complete Ebced rezonans!
        audioService.triggerChime(activeEsma.cosmicFrequencyHz);
      }
      return next;
    });
  };

  const resetTasbih = () => {
    setTasbihCount(0);
    setTasbihCycles(0);
  };

  return (
    <div id="manevi-resonance-root" className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md space-y-6">
      
      {/* 🎯 Niyet & Manevi Şifa Reçeteleri (Son Sistem Entegrasyon) */}
      <div className="bg-slate-950/40 p-4 border border-violet-900/30 rounded-2xl space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
          <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
            🎯 ŞİFA NİYETİNİZE GÖRE HIZLI REÇETE KİLİTLEME SİSTEMİ
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            {
              id: 'anx',
              title: 'Ruhsal Daralma & Kaygı',
              badge: 'Ya Bâsıt • İnşirah',
              surah: 'insirah',
              esma: 'esma-basit',
              hz: 396,
              desc: 'İçsel daralmaları, anksiyeteyi ve göğüs sıkışmasını ferahlatmak.'
            },
            {
              id: 'pain',
              title: 'Bedensel Şifa & Rejen',
              badge: 'Ya Şâfî • Secde',
              surah: 'secde',
              esma: 'esma-safi',
              hz: 174,
              desc: 'Eklemler, kemikler, fiziksel ağrılar ve hücresel dinlendirme.'
            },
            {
              id: 'lock',
              title: 'Manevi Kapalı Kapılar',
              badge: 'Ya Fettâh • Fetih',
              surah: 'fetih',
              esma: 'esma-fettah',
              hz: 432,
              desc: 'Kozmik tıkanıklıkların, engellerin açılması ve bereket akışı.'
            },
            {
              id: 'shield',
              title: 'Nazar, Radyasyon & Vesvese',
              badge: 'Ya Müheymin • Felak-Nas',
              surah: 'felak-nas',
              esma: 'esma-muheymin',
              hz: 174,
              desc: 'Dış elektromanyetik parazitlerden ve vesveselerden arınma kalkanı.'
            }
          ].map(niyet => (
            <button
              key={niyet.id}
              onClick={() => {
                onSelectSurahId(niyet.surah);
                setSelectedEsmaId(niyet.esma);
                onSelectCarrier(niyet.hz);
                
                // Switch sub-tab conditionally or maintain sync
                const targetRemedy = quranRemedies.find(r => r.id === niyet.surah);
                if (targetRemedy && isPlaying) {
                  audioService.start(targetRemedy.healingFrequencyHz, 6, targetRemedy.healingFrequencyHz, true, true, 0.65);
                }
                
                // Show a user-friendly log feedback in developer tab
                console.log(`Reçete Kilitlendi: ${niyet.title}`);
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-950/85 border border-slate-850 hover:border-violet-500/30 rounded-xl text-left cursor-pointer transition-all space-y-1.5 group hover:shadow-lg hover:shadow-purple-950/10"
            >
              <div className="text-[11px] font-bold text-white group-hover:text-violet-300 transition-colors uppercase font-sans">
                {niyet.title}
              </div>
              <span className="inline-block text-[9px] font-mono font-bold bg-violet-500/10 border border-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded">
                {niyet.badge}
              </span>
              <p className="text-[10px] text-slate-500 leading-tight group-hover:text-slate-400">
                {niyet.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Title & Interactive Sub-tab Switcher row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm md:text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <BookOpen className="text-purple-400 w-5 h-5" />
            Manevi Rezonans & Frekans Kütüphanesi
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Sure, ayet ve kasti Esmaların kozmik rezonans ve hücresel biyofiziksel frekans entegrasyonu.
          </p>
        </div>

        {/* Dynamic sub tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
          <button
            onClick={() => {
              handleStopSignal();
              setActiveSubTab('quran');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'quran'
                ? 'bg-purple-600 text-white'
                : 'text-slate-450 hover:text-slate-300'
            }`}
          >
            Kuran Sureleri
          </button>
          <button
            onClick={() => {
              handleStopSignal();
              setActiveSubTab('esma');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'esma'
                ? 'bg-purple-600 text-white'
                : 'text-slate-450 hover:text-slate-300'
            }`}
          >
            Esma Titreşimleri
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'quran' ? (
          <motion.div
            key="tab-quran"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {/* Left column indices */}
            <div className="md:col-span-2 space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {quranRemedies.map((remedy) => {
                const isSelected = remedy.id === selectedSurahId;
                return (
                  <button
                    key={remedy.id}
                    onClick={() => {
                      onSelectSurahId(remedy.id);
                      if (isPlaying) {
                        audioService.start(remedy.healingFrequencyHz, 6, remedy.healingFrequencyHz, true, true, 0.65);
                        onSelectCarrier(remedy.healingFrequencyHz);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-950/20 border-purple-500/60 text-white'
                        : 'bg-slate-950/20 border-slate-850 hover:bg-slate-950/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                          Sure #{remedy.index}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100">{remedy.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Fiziksel Karşılığı: <strong className="text-slate-300">{remedy.indication}</strong>
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-teal-400 font-semibold block">
                        {remedy.healingFrequencyHz} Hz
                      </span>
                      <span className="text-[9px] font-sans text-slate-500">
                        {remedy.esma.split(',')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right column active player */}
            <div className="bg-slate-950/50 rounded-2xl border border-slate-850 p-4 flex flex-col justify-between items-center text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06),transparent)] pointer-events-none" />

              <div className="space-y-1 z-10">
                <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 block font-bold leading-none">
                  MANEVİ REZONANS ÇALARI
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ayetler: {activeRemedy.verses}
                </span>
              </div>

              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg 
                  viewBox="0 0 100 100" 
                  className={`w-full h-full text-purple-500/30 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.25)] ${
                    isPlaying ? 'animate-[spin_25s_linear_infinite]' : ''
                  }`}
                >
                  <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <ellipse cx="50" cy="50" rx="15" ry="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <ellipse cx="50" cy="50" rx="30" ry="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <polygon points="50,5 35,40 50,20 65,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <polygon points="50,95 35,60 50,80 65,60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                </svg>
                
                <div className={`absolute w-12 h-12 rounded-full bg-slate-900 border border-purple-500/40 flex items-center justify-center font-mono text-[10px] font-bold text-purple-300 ${
                  isPlaying ? 'scale-110 animate-pulse duration-700' : ''
                }`}>
                  {activeRemedy.healingFrequencyHz}Hz
                </div>
              </div>

              <div className="space-y-1.5 z-10">
                <h3 className="text-sm font-bold text-white">{activeRemedy.name}</h3>
                <p className="text-[11px] text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 max-w-[160px] mx-auto truncate">
                  {activeRemedy.esma}
                </p>
                <p className="text-[10px] text-slate-400 block px-1 leading-normal max-h-16 overflow-y-auto">
                  {activeRemedy.description}
                </p>
              </div>

              <div className="w-full pt-1 z-10">
                {isPlaying ? (
                  <button
                    onClick={handleStopSignal}
                    className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Square className="w-3.5 h-3.5 inline mr-1.5" />
                    Durdur
                  </button>
                ) : (
                  <button
                    onClick={handlePlayQuranSignal}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-100 text-xs font-bold shadow-xl shadow-purple-950/30 cursor-pointer transition-all"
                  >
                    <Play className="w-3.5 h-3.5 inline mr-1.5 fill-white text-white" />
                    Şifayı Yükle (Çal)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tab-esma"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {/* Left column indices wrapper with search */}
            <div className="md:col-span-2 flex flex-col gap-3">
              {/* Esma Arama Kutusu */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Esma veya Anlam Ara... (Örn: Şafi, Selam, Kalp, Şefkat)"
                  value={esmaSearchQuery}
                  onChange={(e) => setEsmaSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/65 border border-slate-800/80 focus:border-purple-500/50 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all font-sans"
                />
                {esmaSearchQuery && (
                  <button
                    onClick={() => setEsmaSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    Temizle
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredEsmaVibes.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500 font-mono">
                    Arama kriterine uygun Esmaül Hüsna kalıbı bulunamadı.
                  </div>
                ) : (
                  filteredEsmaVibes.map((esma) => {
                    const isSelected = esma.id === selectedEsmaId;
                    return (
                      <button
                        key={esma.id}
                        onClick={() => {
                          setSelectedEsmaId(esma.id);
                          resetTasbih();
                          if (isPlaying) {
                            audioService.start(esma.cosmicFrequencyHz, 3, esma.cosmicFrequencyHz, true, true, 0.65);
                            onSelectCarrier(esma.cosmicFrequencyHz);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-950/25 border-purple-500/60 text-white'
                            : 'bg-slate-950/20 border-slate-850 hover:bg-slate-950/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[17px] font-semibold text-teal-300 font-sans tracking-wide">
                              {esma.name}
                            </span>
                            <h4 className="text-xs font-bold text-slate-100 font-mono">
                              ({esma.transliteration})
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans leading-normal">
                            Etki Alanı: <strong className="text-slate-300">{esma.targetAuraNode}</strong>
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-cyan-400 font-semibold block uppercase">
                            {esma.cosmicFrequencyHz} Hz
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Ebced: <strong className="text-slate-350 font-sans">{esma.ebcedValue}</strong>
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right column active digital tasbih & Counter */}
            <div className="bg-slate-950/50 rounded-2xl border border-slate-850 p-4 flex flex-col justify-between items-center text-center space-y-4 relative overflow-hidden select-none">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.06),transparent)] pointer-events-none" />

              <div className="space-y-0.5 z-10">
                <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-400 block font-bold leading-none">
                  EBCED REZONANS MATİK
                </span>
                <span className="text-[15px] font-bold text-teal-300 pt-1 block">
                  {activeEsma.name}
                </span>
              </div>

              {/* Spherical Interactive Clicker core */}
              <div className="space-y-2 flex flex-col items-center">
                <button
                  onClick={handleTasbihClick}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-teal-500/10 via-slate-900 to-cyan-500/5 hover:to-cyan-500/15 active:scale-95 border-2 border-teal-500/40 hover:border-teal-400 flex flex-col items-center justify-center shadow-lg cursor-pointer transition-all relative group"
                >
                  <span className="text-2xl font-bold font-mono text-white tracking-tighter">
                    {tasbihCount}
                  </span>
                  <span className="text-[9px] font-mono text-teal-400/80 uppercase group-hover:text-teal-300 transition-all">
                    TIKLA (OKU)
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono absolute bottom-2">
                    Hedef: {activeEsma.ebcedValue}
                  </span>
                </button>
                
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="text-slate-500 uppercase">Tam Döngü:</span>
                  <span className="text-teal-400 font-bold bg-teal-400/10 px-1.5 py-0.5 rounded border border-teal-500/10">
                    {tasbihCycles} Adet
                  </span>
                  <button
                    onClick={resetTasbih}
                    className="text-[9px] text-red-400 hover:text-red-300 underline bg-transparent border-none cursor-pointer"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 z-10">
                <p className="text-[10px] text-slate-400 leading-normal max-h-16 overflow-y-auto px-1">
                  {activeEsma.meaning} <strong className="text-slate-300">{activeEsma.spiritualImpact}</strong>
                </p>
              </div>

              {/* Action toggle hum background */}
              <div className="w-full pt-1 z-10">
                {isPlaying ? (
                  <button
                    onClick={handleStopSignal}
                    className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Square className="w-3.5 h-3.5 inline mr-1.5" />
                    Sürekli Rezonansı Kapat
                  </button>
                ) : (
                  <button
                    onClick={handlePlayEsmaSignal}
                    className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-xl shadow-teal-950/20 cursor-pointer transition-all"
                  >
                    <Play className="w-3.5 h-3.5 inline mr-1.5 fill-slate-950 text-slate-950" />
                    Sürekli {activeEsma.cosmicFrequencyHz}Hz Başlat
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/45 text-[11px] text-slate-500 font-mono">
        <ShieldCheck className="w-4 h-4 text-purple-400" />
        <span>Titreşim frekansları, kutsal kelimelerin kadim harf sayım (Ebced) değerleri ile harmonik eşleşme kurmaktadır.</span>
      </div>
    </div>
  );
}
