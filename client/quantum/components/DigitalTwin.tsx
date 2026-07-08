import React from 'react';
import { ShieldCheck, ZapOff, Activity, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MeridianNode {
  id: string;
  name: string;
  indicativeChakra: string;
  description: string;
  associatedHz: number;
  associatedSurahId: string;
  coords: { x: number; y: number }; // Percentage in SVG
  color: string;
  physicalRegion: string;
}

export const MERIDIANS: MeridianNode[] = [
  {
    id: 'brain-crown',
    name: 'Tepe Noktası - Epifiz Bezi',
    indicativeChakra: 'Taç Çakra (Sahasrara)',
    description: 'Bütünsel kozmik akış, uyku dengesi ve epifiz kanalı rezonansı.',
    associatedHz: 963,
    associatedSurahId: 'ihlas',
    coords: { x: 50, y: 7 },
    color: '#a855f7', // Purple
    physicalRegion: 'Baş / Alın Üstü'
  },
  {
    id: 'mind-eye',
    name: 'Alın Meridyeni - Sezgisel Odak',
    indicativeChakra: 'Üçüncü Göz (Ajna)',
    description: 'Zihinsel berraklık, epifiz aktivasyonu ve ruhsal idrak kalkanı.',
    associatedHz: 852,
    associatedSurahId: 'mulk',
    coords: { x: 50, y: 14 },
    color: '#6366f1', // Indigo
    physicalRegion: 'Alın / Göz Çevresi'
  },
  {
    id: 'throat-communication',
    name: 'Boğaz Meridyeni - Ses & İfade',
    indicativeChakra: 'Boğaz Çakrası (Vishuddha)',
    description: 'Elektromanyetik temizlik, tiroid rezonansı ve koruma frekansı.',
    associatedHz: 741,
    associatedSurahId: 'sifanin',
    coords: { x: 50, y: 22 },
    color: '#06b6d4', // Cyan
    physicalRegion: 'Boyun / Boğaz / Tiroid'
  },
  {
    id: 'heart-center',
    name: 'Kalp Çakrası - Hücresel Re-Kalibrasyon',
    indicativeChakra: 'Kalp Çakrası (Anahata)',
    description: 'Sevgi titreşimi, anksiyete onarımı ve dokusal yenilenme frekansı.',
    associatedHz: 528,
    associatedSurahId: 'fatiha',
    coords: { x: 50, y: 34 },
    color: '#10b981', // Emerald
    physicalRegion: 'Göğüs Kafesi / Soluk Yolu'
  },
  {
    id: 'solar-plexus-stomach',
    name: 'Solar Pleksus - Karaciğer & Mide',
    indicativeChakra: 'Solar Pleksus (Manipura)',
    description: 'Stres yönetimi, parasempatik aktivasyon ve karaciğer meridyeni.',
    associatedHz: 432,
    associatedSurahId: 'rahman',
    coords: { x: 50, y: 46 },
    color: '#eab308', // Yellow
    physicalRegion: 'Karın Üst Bölgesi / Mide'
  },
  {
    id: 'sacral-remedy',
    name: 'Vaziyet Meridyeni - Pelvis & Değişim',
    indicativeChakra: 'Sakral Çakra (Svadhisthana)',
    description: 'Hücresel travmaların çözünümü ve geçmiş blokajların erimesi.',
    associatedHz: 417,
    associatedSurahId: 'yasın',
    coords: { x: 50, y: 58 },
    color: '#f97316', // Orange
    physicalRegion: 'Alt Karın / Pelvik Bölge'
  },
  {
    id: 'root-shield',
    name: 'Kök Bölge - Hücre Detoksu',
    indicativeChakra: 'Kök Çakra (Muladhara)',
    description: 'Radyasyon arınması, elektromanyetik denge ve canlandırma.',
    associatedHz: 174,
    associatedSurahId: 'felak-nas',
    coords: { x: 50, y: 72 },
    color: '#ef4444', // Red
    physicalRegion: 'Omurga Tabanı / Bacaklar'
  }
];

interface DigitalTwinProps {
  selectedNodeId: string;
  onSelectNode: (node: MeridianNode) => void;
  scannerAnomalyId?: string; // Anomaly detected by automated scan
  isScanning?: boolean;
}

export default function DigitalTwin({
  selectedNodeId,
  onSelectNode,
  scannerAnomalyId,
  isScanning = false
}: DigitalTwinProps) {
  const activeNode = MERIDIANS.find(n => n.id === selectedNodeId) || MERIDIANS[3];

  return (
    <div id="digital-twin-container" className="flex flex-col md:flex-row gap-6 items-center bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md">
      
      {/* Visual Hologram Display */}
      <div className="relative w-full max-w-[280px] h-[380px] bg-slate-950/40 rounded-2xl border border-slate-800/60 flex items-center justify-center p-3 overflow-hidden select-none">
        
        {/* Futuristic grids and HUD elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,20,35,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,35,0.4)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />
        <div className="absolute top-2 left-3 font-mono text-[9px] text-teal-400 opacity-60 flex items-center gap-1.5">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>REAL-TIME DIGITAL TWIN SPECTRUM</span>
        </div>
        <div className="absolute bottom-2 right-3 font-mono text-[9px] text-purple-400 opacity-60">
          <span>COSMIC SHIELD: ACTV</span>
        </div>

        {/* Outer Auric heat map overlay (SVG glows) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-48 h-72 rounded-full filter blur-[40px] animate-pulse transition-colors duration-1000"
               style={{ backgroundColor: activeNode.color + '40' }} />
        </div>

        {/* Human Silhouette SVG vector */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full relative z-10 filter drop-shadow-[0_0_12px_rgba(20,184,166,0.2)]"
        >
          {/* Subtle Outer Auric Boundary */}
          <ellipse 
            cx="50" cy="50" rx="35" ry="46" 
            fill="none" 
            stroke={activeNode.color} 
            strokeWidth="0.4" 
            strokeDasharray="2 3" 
            className="animate-[spin_40s_linear_infinite]"
          />

          {/* SVG Human Hologram Lines */}
          <path 
            d="M50,4 C52,4 54,6 54,9 C54,12 51,14 50,15 C49,14 46,12 46,9 C46,6 48,4 50,4 Z
               M46,15 C47,15.5 48,16 50,16 C52,16 53,15.5 54,15 C58,16.5 61,19 63,22 C64.5,24.5 66,28 65,30 C64,32 61,28 60,31 C59,34 59,39 58,45 C57.5,49 57,56 57,63 L59,94 L54,94 L52,65 L50,65 L48,65 L46,94 L41,94 L43,63 C43,56 42.5,49 42,45 C41,39 41,34 40,31 C39,28 36,32 35,30 C34,28 35.5,24.5 37,22 C39,19 42,16.5 46,15 Z" 
            fill="none" 
            stroke="url(#hologram-grad)" 
            strokeWidth="0.85" 
          />
          
          <defs>
            <linearGradient id="hologram-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Glowing radar rings on scan target node, or current selected node */}
          <g>
            <circle 
              cx={activeNode.coords.x} 
              cy={activeNode.coords.y} 
              r="6" 
              fill="none" 
              stroke={activeNode.color} 
              strokeWidth="0.4"
              className="animate-ping"
              style={{ transformOrigin: `${activeNode.coords.x}px ${activeNode.coords.y}px` }}
            />
            <circle 
              cx={activeNode.coords.x} 
              cy={activeNode.coords.y} 
              r="10" 
              fill="none" 
              stroke={activeNode.color} 
              strokeWidth="0.2"
              className="animate-pulse"
              style={{ transformOrigin: `${activeNode.coords.x}px ${activeNode.coords.y}px` }}
            />
          </g>

          {/* Interactive Aura Nodes */}
          {MERIDIANS.map((node) => {
            const isTarget = node.id === selectedNodeId;
            return (
              <g 
                key={node.id} 
                onClick={() => onSelectNode(node)}
                className="cursor-pointer group"
              >
                {/* Node touch boundary expansion */}
                <circle 
                  cx={node.coords.x} 
                  cy={node.coords.y} 
                  r="7" 
                  fill="transparent" 
                />
                
                {/* Visual node */}
                <circle 
                  cx={node.coords.x} 
                  cy={node.coords.y} 
                  r={isTarget ? 2.5 : 1.8} 
                  fill={isTarget ? node.color : '#475569'} 
                  stroke={isTarget ? '#ffffff' : node.color} 
                  strokeWidth={isTarget ? 0.8 : 0.4} 
                  className="transition-all duration-300 group-hover:r-[2.8px]"
                />
              </g>
            );
          })}
        </svg>

        {/* Scan line effect during scan simulation */}
        {isScanning && (
          <motion.div 
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
          />
        )}
      </div>

      {/* Info Card Panel */}
      <div className="flex-1 space-y-4 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
            Kuantum Lokasyon Kilidi
          </span>
          {activeNode.id === scannerAnomalyId && (
            <span className="text-[11px] font-mono text-red-400 flex items-center gap-1 font-semibold animate-pulse">
              <ZapOff className="w-3.5 h-3.5" />
              SAPTANAN ANOMALİ
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: activeNode.color }} />
            {activeNode.name}
          </h2>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
            <span className="text-slate-500">Çakra:</span> 
            <span style={{ color: activeNode.color }}>{activeNode.indicativeChakra}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">Bölge:</span> 
            <span className="text-slate-300">{activeNode.physicalRegion}</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/35 p-3 rounded-xl border border-slate-800/40">
          {activeNode.description}
        </p>

        {/* Meridian Selector Buttons for easy click */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-medium">
            Enerji Merkezini Elle Seç
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MERIDIANS.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <button
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border font-sans cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-slate-800 border-slate-700 text-white font-medium shadow-md' 
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                  style={isSelected ? { borderLeftColor: node.color, borderLeftWidth: '3px' } : {}}
                >
                  {node.physicalRegion}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-3 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Kozmik Onarım dalgası bu bölgeye odaklanacaktır.</span>
        </div>
      </div>
    </div>
  );
}
