import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Music, Waves, Compass, Sparkles, Sliders, BellRing, SlidersHorizontal, Info, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { audioService } from '../utils/audio_synth';
import { SoundPreset } from '../types';
import { solfeggioPresets } from '../data/solfeggio_db';

interface SolfeggioLibraryProps {
  currentCarrierHz: number;
  onSelectCarrier: (hz: number) => void;
}

export default function SolfeggioLibrary({
  currentCarrierHz,
  onSelectCarrier,
}: SolfeggioLibraryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedHz, setSelectedHz] = useState<number>(currentCarrierHz);
  const [selectedBeatHz, setSelectedBeatHz] = useState<number>(6); // 6 Hz Theta
  const [volume, setVolume] = useState<number>(65); // Master volume
  const [playNature, setPlayNature] = useState(true);
  const [playCosmic, setPlayCosmic] = useState(true);
  
  // Custom multi-category tabs and search bar
  const [activeTab, setActiveTab] = useState<'solfeggio' | 'cosmic' | 'nature'>('solfeggio');
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-track mixer fader values
  const [mixBinaural, setMixBinaural] = useState<number>(45);
  const [mixNature, setMixNature] = useState<number>(35);
  const [mixCosmic, setMixCosmic] = useState<number>(45);
  const [mixChime, setMixChime] = useState<number>(40);
  
  const visualCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state with prop if changing from outside (e.g. scanner or surah index click)
  useEffect(() => {
    setSelectedHz(currentCarrierHz);
  }, [currentCarrierHz]);

  // Handle active audio triggers on changes
  useEffect(() => {
    if (isPlaying) {
      triggerAudioStart();
    }
  }, [selectedHz, selectedBeatHz, playNature, playCosmic]);

  const updateTrack = (track: 'master' | 'binaural' | 'nature' | 'cosmic' | 'chime', val: number) => {
    if (track === 'master') {
      setVolume(val);
      audioService.setTrackVolume('master', val / 100);
    } else if (track === 'binaural') {
      setMixBinaural(val);
      audioService.setTrackVolume('binaural', val / 100);
    } else if (track === 'nature') {
      setMixNature(val);
      audioService.setTrackVolume('nature', val / 100);
    } else if (track === 'cosmic') {
      setMixCosmic(val);
      audioService.setTrackVolume('cosmic', val / 100);
    } else if (track === 'chime') {
      setMixChime(val);
      audioService.setTrackVolume('chime', val / 100);
    }
  };

  const triggerAudioStart = () => {
    audioService.start(
      selectedHz, 
      selectedBeatHz, 
      selectedHz, 
      playNature, 
      playCosmic, 
      volume / 100
    );
    // Sync all sub-tracks
    audioService.setTrackVolume('binaural', mixBinaural / 100);
    audioService.setTrackVolume('nature', mixNature / 100);
    audioService.setTrackVolume('cosmic', mixCosmic / 100);
    audioService.setTrackVolume('chime', mixChime / 100);
    setIsPlaying(true);
    onSelectCarrier(selectedHz);
  };

  const triggerAudioStop = () => {
    audioService.stop();
    setIsPlaying(false);
  };

  // Oscillating out of phase dual wave visualizer stimulation on canvas
  useEffect(() => {
    let animFrame: number;
    const canvas = visualCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, h/2);
      ctx.lineTo(w, h/2);
      ctx.stroke();

      if (isPlaying) {
        // Draw Left wave (cyan)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const radian = (x / w) * Math.PI * 4.5 + offset;
          const y = h/2 + Math.sin(radian) * (h/4.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Right wave (purple) - Offset by selectedBeatHz for binaural out-of-phase visualization
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const beatOffset = selectedBeatHz * 0.08;
          const radian = (x / w) * Math.PI * 4.5 + (offset * (1 + beatOffset));
          const y = h/2 + Math.cos(radian) * (h/4.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw overlay beats
        ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
        ctx.fillRect(0, 0, w, h);
        
        offset += 0.06;
      } else {
        // Default static state line
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();
      }

      animFrame = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isPlaying, selectedBeatHz]);

  return (
    <div id="solfeggio-library-container" className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md space-y-6">
      
      {/* HUD Oscillators view */}
      <div className="bg-slate-950/70 rounded-2xl border border-slate-800/50 overflow-hidden flex flex-col pt-3">
        <div className="px-4 flex items-center justify-between border-b border-slate-800/50 pb-2">
          <span className="text-[10px] font-mono text-teal-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            BİNAURAL BRAINWAVE ENTRAINMENT MONITOR
          </span>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${isPlaying ? 'bg-teal-500/10 text-teal-300 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
            {isPlaying ? 'REZONANS ETKİN' : 'STBY'}
          </span>
        </div>

        <div className="h-28 w-full p-2 relative flex items-center">
          <canvas ref={visualCanvasRef} width={400} height={100} className="w-full h-full" />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-[0.5px]">
              <span className="text-xs text-slate-500 font-mono tracking-wider">
                SES ENJEKSİYONUNU ÇALIŞTIRIN
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main audio dock controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Dock Controls Module 1 (Solfeggio list picker) */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">
              🌀 AKUSTİK ŞİFA KÜTÜPHANESİ ({solfeggioPresets.length} FREKANS KANALLI)
            </label>
          </div>

          {/* 3 Categories Tab Switcher */}
          <div className="grid grid-cols-3 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 gap-1 text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab('solfeggio');
                setSearchQuery('');
              }}
              className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'solfeggio'
                  ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              Akort Şifa ({solfeggioPresets.filter(p => p.type === 'solfeggio').length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('cosmic');
                setSearchQuery('');
              }}
              className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'cosmic'
                  ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              Kozmik & Gezegen ({solfeggioPresets.filter(p => p.type === 'cosmic').length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('nature');
                setSearchQuery('');
              }}
              className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'nature'
                  ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              Doğal OM ({solfeggioPresets.filter(p => p.type === 'nature').length})
            </button>
          </div>

          {/* Search bar inside frequency list */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`${
                activeTab === 'solfeggio' 
                  ? 'Solfeggio akort veya Hz ara...' 
                  : activeTab === 'cosmic' 
                  ? 'Gezegen, yıldız veya kozmik rezonans ara...' 
                  : 'Doğal OM, rüzgar, akustik tını ara...'
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/45 border border-slate-850 focus:border-teal-500/40 rounded-xl pl-9 pr-8 py-2 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800"
              >
                TEMİZLE
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1">
            {solfeggioPresets.filter((p) => {
              if (p.type !== activeTab) return false;
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase().trim();
              return (
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.frequencyHz.toString().includes(q)
              );
            }).length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500 font-mono text-[11px] border border-dashed border-slate-850 rounded-xl bg-slate-950/20">
                Arama kriterine uygun frekans rezonans bulunamadı.
              </div>
            ) : (
              solfeggioPresets.filter((p) => {
                if (p.type !== activeTab) return false;
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase().trim();
                return (
                  p.name.toLowerCase().includes(q) ||
                  p.description.toLowerCase().includes(q) ||
                  p.frequencyHz.toString().includes(q)
                );
              }).map((preset) => {
                const isTarget = preset.frequencyHz === selectedHz;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedHz(preset.frequencyHz);
                      onSelectCarrier(preset.frequencyHz);
                    }}
                    className={`text-left p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isTarget 
                        ? 'bg-slate-800/70 border-teal-500/60 shadow-lg shadow-teal-950/10' 
                        : 'bg-slate-950/30 border-slate-850 hover:bg-slate-950/70 hover:border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isTarget ? 'text-teal-300' : 'text-slate-200'}`}>
                        {preset.name}
                      </span>
                      {isTarget && <Sparkles className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal pt-1 break-words">
                      {preset.description}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick-synthesis presets for easy automatic tuning */}
          <div className="mt-4 p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                🔬 KOZMİK REZONANS HAZIR SEANS REÇETELERİ
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { 
                  name: 'Derin Aura Arınması', 
                  desc: 'Epifiz uyarımı ve koruma kalkanı.', 
                  hz: 741, beat: 4, nature: true, cosmic: true, 
                  masterV: 70, binV: 80, natV: 40, cosV: 70, chimeV: 60 
                },
                { 
                  name: 'Nirvana Odaklanma', 
                  desc: 'Yüksek bilinç ve öğrenme.', 
                  hz: 852, beat: 10, nature: false, cosmic: true, 
                  masterV: 60, binV: 40, natV: 0, cosV: 80, chimeV: 20 
                },
                { 
                  name: 'Hücresel DNA Onarımı', 
                  desc: 'Biotasarım sevgi dalgaları.', 
                  hz: 528, beat: 6, nature: true, cosmic: true, 
                  masterV: 75, binV: 60, natV: 55, cosV: 50, chimeV: 50 
                },
                { 
                  name: 'Korku & Endişe Sökücü', 
                  desc: 'Parasempatik deşarj ve kök.', 
                  hz: 396, beat: 2, nature: true, cosmic: false, 
                  masterV: 80, binV: 85, natV: 75, cosV: 10, chimeV: 70 
                },
              ].map((recipe, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedHz(recipe.hz);
                    setSelectedBeatHz(recipe.beat);
                    setPlayNature(recipe.nature);
                    setPlayCosmic(recipe.cosmic);
                    setVolume(recipe.masterV);
                    setMixBinaural(recipe.binV);
                    setMixNature(recipe.natV);
                    setMixCosmic(recipe.cosV);
                    setMixChime(recipe.chimeV);
                    onSelectCarrier(recipe.hz);
                    
                    // Trigger sound update if playing
                    if (isPlaying) {
                      audioService.start(recipe.hz, recipe.beat, recipe.hz, recipe.nature, recipe.cosmic, recipe.masterV / 100);
                      audioService.setTrackVolume('binaural', recipe.binV / 100);
                      audioService.setTrackVolume('nature', recipe.natV / 100);
                      audioService.setTrackVolume('cosmic', recipe.cosV / 100);
                      audioService.setTrackVolume('chime', recipe.chimeV / 100);
                    }
                  }}
                  className="p-2 bg-slate-950/70 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl text-left cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-purple-300 group-hover:text-purple-200">
                    <span>{recipe.name}</span>
                    <span className="text-[8px] font-mono text-cyan-400 bg-cyan-400/5 px-1 py-0.5 rounded border border-teal-500/10">{recipe.hz}Hz</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight">
                    {recipe.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dock Controls Module 2 (Fine Tuning & Advanced Multi-track Mixing Console) */}
        <div className="space-y-4 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                KUANTUM İNCE AYARLANMA
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-teal-500/20 uppercase tracking-widest">
              Stüdyo Mikser Etkin
            </span>
          </div>

          {/* Brainwave entrainment tuning scale */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              Beyin Dalgası Frekans Sapması (Binaural Beat)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Delta 2 Hz (Derin Uyku)', value: 2 },
                { label: 'Theta 4 Hz (Gevşeme)', value: 4 },
                { label: 'Theta 6 Hz (Meditasyon)', value: 6 },
                { label: 'Alpha 10 Hz (Farkındalık)', value: 10 }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedBeatHz(opt.value)}
                  className={`text-[10px] p-2 rounded-lg border font-mono cursor-pointer transition-all ${
                    selectedBeatHz === opt.value 
                      ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-sm' 
                      : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-3 space-y-4">
            
            {/* Real-time Sub-Track Toggles */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              <div className="flex items-center justify-between bg-slate-900/40 px-3 py-2 rounded-xl border border-slate-850/80">
                <span className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  Doğa Sesi
                </span>
                <input
                  type="checkbox"
                  checked={playNature}
                  onChange={() => setPlayNature(!playNature)}
                  className="accent-cyan-500 w-4 h-4 rounded"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-900/40 px-3 py-2 rounded-xl border border-slate-850/80">
                <span className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  Kozmik Pad
                </span>
                <input
                  type="checkbox"
                  checked={playCosmic}
                  onChange={() => setPlayCosmic(!playCosmic)}
                  className="accent-purple-500 w-4 h-4 rounded"
                />
              </div>
            </div>

            {/* Advanced Multi-Track Mixing Board (Audio Faders) */}
            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-900">
              <span className="text-[9px] font-mono text-purple-400 tracking-wider font-bold block uppercase pb-1 border-b border-slate-800/40">
                🎚️ 5-KANAL HASSAS FREKANS MİKSERİ (FADERS)
              </span>

              {/* Master volume slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 font-bold text-white">
                    <Volume2 className="w-3 h-3 text-teal-400" />
                    ANA FREKANS (MASTER)
                  </span>
                  <span>%{volume}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => updateTrack('master', Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-450"
                />
              </div>

              {/* Binaural Beat tracks slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-purple-400" />
                    BİNAURAL ETKİLEŞME
                  </span>
                  <span>%{mixBinaural}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixBinaural}
                  onChange={(e) => updateTrack('binaural', Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Nature sound tracks slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Waves className="w-3 h-3 text-cyan-400" />
                    DOĞAL SU DALGASI
                  </span>
                  <span>%{mixNature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixNature}
                  onChange={(e) => updateTrack('nature', Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  disabled={!playNature}
                />
              </div>

              {/* Cosmic pad tracks slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3 text-indigo-400" />
                    KOZMİK REZONÖR PAD
                  </span>
                  <span>%{mixCosmic}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixCosmic}
                  onChange={(e) => updateTrack('cosmic', Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  disabled={!playCosmic}
                />
              </div>

              {/* Chime bell tracks slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <BellRing className="w-3 h-3 text-amber-400" />
                    TİBET RUHSAL KASE ÇANI (CHIME)
                  </span>
                  <span>%{mixChime}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixChime}
                  onChange={(e) => updateTrack('chime', Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Manual striker chime bell trigger button */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  audioService.triggerChime(selectedHz);
                }}
                disabled={!isPlaying}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-300 hover:text-amber-200 border border-amber-500/15 hover:border-amber-500/30 text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
              >
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
                Tibetan Rezonans Kasesini Titret (Manual Strike)
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Play / Stop Action row */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {isPlaying ? (
          <button
            onClick={triggerAudioStop}
            className="flex-1 py-3 text-sm font-semibold rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4" />
            <span>Frekans Enjeksiyonunu Durdur</span>
          </button>
        ) : (
          <button
            onClick={triggerAudioStart}
            className="flex-1 py-3 text-sm font-bold rounded-2xl bg-gradient-to-r from-purple-600 shadow-xl shadow-purple-950/20 to-teal-600 text-white flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>Seçili {selectedHz}Hz Rezonansı Başlat</span>
          </button>
        )}
      </div>

    </div>
  );
}
