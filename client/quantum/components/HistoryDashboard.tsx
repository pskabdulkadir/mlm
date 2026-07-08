import React from 'react';
import { TrendingUp, Award, Clock, Heart, Calendar, Zap, AlertCircle, Activity } from 'lucide-react';
import { AuricScanResult } from '../types';

interface HistoryDashboardProps {
  scans: AuricScanResult[];
  onClearHistory: () => void;
}

export default function HistoryDashboard({ scans, onClearHistory }: HistoryDashboardProps) {
  if (scans.length === 0) {
    return (
      <div id="history-dashboard-empty" className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md text-center max-w-2xl mx-auto space-y-6 my-10">
        <div className="mx-auto w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full flex items-center justify-center animate-pulse">
          <Activity className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white font-sans">Henüz Kaydedilmiş Seans Taramanız Bulunmuyor</h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-md mx-auto">
            Quantum Biyo-Optik tarama geçmişiniz şu an temizdir. Gelişmiş şifa protokollerinin, çakra dengelenme oranlarının ve stres gelişim eğrilerinizin otomatik takibi için ilk biyometrik taramanızı gerçekleştirebilirsiniz.
          </p>
        </div>

        <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 max-w-sm mx-auto text-left space-y-2">
          <span className="text-[9px] font-mono font-bold tracking-widest text-teal-500 uppercase block">CANLI SİSTEM DURUMU: AKTİF</span>
          <p className="text-[11px] text-slate-400 leading-normal">
            Biyo-optik foton verileriniz, kalp ritminiz (rPPG), aurik enerji katsayılarınız ve manevi şifa reçeteleriniz tamamen yerel tarayıcınızda şifrelenmiş olarak güvenle saklanacaktır.
          </p>
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-slate-500 font-mono">
            * İlk biyometrik izinler için ekranın üst kısmındaki <span className="text-teal-400">Biyo-Optik Tarama</span> sekmesine giderek "Kuantum Taramayı Başlat" ikonuna dokunabilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  const activeScans = scans;

  // Calculate general stats
  const totalSessions = activeScans.length;
  const avgEnergy = Math.round(activeScans.reduce((acc, curr) => acc + curr.energyScore, 0) / activeScans.length);
  const avgStress = Math.round(activeScans.reduce((acc, curr) => acc + curr.stressLevel, 0) / activeScans.length);
  const stressReductionPercent = activeScans.length > 1 
    ? activeScans[0].stressLevel - activeScans[activeScans.length - 1].stressLevel
    : 0;

  // Generate SVG path coordinates for line graphs
  // Svg width=400, height=120
  const width = 500;
  const height = 140;
  const padding = 20;

  const pointsCount = activeScans.length;
  const getCoordinates = (field: 'energyScore' | 'stressLevel') => {
    return activeScans.map((scan, index) => {
      const x = padding + (index / (pointsCount - 1 || 1)) * (width - padding * 2);
      const val = scan[field];
      // map 0-100 values to height (represented as height-padding -> padding)
      const y = height - padding - (val / 100) * (height - padding * 2);
      return { x, y };
    });
  };

  const energyCoords = getCoordinates('energyScore');
  const stressCoords = getCoordinates('stressLevel');

  const makePath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, curr, index) => {
      return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  };

  const energyPath = makePath(energyCoords);
  const stressPath = makePath(stressCoords);

  return (
    <div id="history-dashboard-component" className="space-y-6">
      
      {/* Overview Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Toplam Tarama</span>
            <h3 className="text-xl font-bold font-sans text-white">{totalSessions}</h3>
          </div>
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Ölçülen Ortalama Enerji</span>
            <h3 className="text-xl font-bold font-sans text-teal-400">%{avgEnergy}</h3>
          </div>
          <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Stres Azalış Eğilimi</span>
            <h3 className="text-xl font-bold font-sans text-amber-400">
              {stressReductionPercent > 0 ? `-${stressReductionPercent}%` : `${stressReductionPercent}%`}
            </h3>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Aktif Kalibrasyon</span>
            <h3 className="text-xl font-bold font-sans text-indigo-400">Uyumlu</h3>
          </div>
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Interactive SVG Trend Chart */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/60 pb-3 mb-2">
          <div>
            <h3 className="text-sm font-bold font-sans tracking-tight text-white flex items-center gap-2">
              Kozmik Enerji & Stres Eğrisi Takibi
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Seanslar sonrasındaki hücresel stres gerilemesi ve aurik şarj katsayılarının değişim grafiği.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono uppercase">
            <div className="flex items-center gap-1.5 text-teal-400">
              <span className="w-2.5 h-1.5 bg-teal-400 rounded-full inline-block" />
              <span>Enerji Seviyesi (%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-1.5 bg-amber-400 rounded-full inline-block" />
              <span>Stres Seviyesi (%)</span>
            </div>
          </div>
        </div>

        {/* Chart SVG wrapper wrapper */}
        <div className="w-full bg-slate-950/40 rounded-2xl border border-slate-850 p-3 h-44 flex items-center justify-center relative overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full text-slate-800"
          >
            {/* Horizontal axis guidelines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(51,65,85,0.12)" strokeWidth="0.8" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(51,65,85,0.12)" strokeWidth="0.8" strokeDasharray="3 3"/>
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(51,65,85,0.12)" strokeWidth="0.8" />

            {/* Render lines */}
            {pointsCount > 0 && (
              <>
                {/* Energy curve path */}
                <path
                  d={energyPath}
                  fill="none"
                  stroke="#22d3ee" // cyan
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]"
                />
                
                {/* Stress curve path */}
                <path
                  d={stressPath}
                  fill="none"
                  stroke="#f59e0b" // amber
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]"
                />

                {/* Individual grid data dots */}
                {energyCoords.map((pt, i) => (
                  <circle
                    key={`energy-dot-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#14b8a6"
                    stroke="#ffffff"
                    strokeWidth="1"
                    title={`Enerji: ${activeScans[i].energyScore}`}
                  />
                ))}

                {/* Stress dots */}
                {stressCoords.map((pt, i) => (
                  <circle
                    key={`stress-dot-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#b45309"
                    stroke="#ffffff"
                    strokeWidth="1"
                    title={`Stres: ${activeScans[i].stressLevel}`}
                  />
                ))}
              </>
            )}
          </svg>

          {/* Fallback overlay label */}
          <div className="absolute inset-x-0 bottom-2 flex justify-between px-6 font-mono text-[8px] text-slate-500">
            {activeScans.map((scan, i) => (
              <span key={i}>{scan.timestamp}</span>
            ))}
          </div>
        </div>

      </div>

      {/* Grid listing historical records */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
            Tarihsel Seans Kayıtları
          </h4>
          
          {scans.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[10px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer bg-transparent border-none"
            >
              Geçmişi Sıfırla
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {activeScans.map((scan, i) => (
            <div
              key={scan.id || i}
              className="bg-slate-950/20 border border-slate-850 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full`} style={{ backgroundColor: scan.dominantColor?.includes('Kırmızı') ? '#ef4444' : scan.dominantColor?.includes('Turuncu') ? '#f97316' : scan.dominantColor?.includes('Yeşil') ? '#10b981' : '#8b5cf6' }} />
                <div>
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    {scan.blockageLocation ? `${scan.blockageLocation} Dengelenmesi` : 'Kuantum Frekans Hizalaması'}
                    <span className="text-[10px] font-mono font-normal text-slate-500">
                      • {scan.timestamp}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-normal">
                    Dominant Aura: <strong className="text-slate-300">{scan.dominantColor || 'Spektral Halka'}</strong> ({scan.dominantVibe || 'Uyum'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 max-sm:justify-between text-right font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">🔋 Enerji</span>
                  <span className="text-teal-400 font-bold font-sans">%{scan.energyScore}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">🧠 Stres</span>
                  <span className="text-amber-400 font-bold font-sans">%{scan.stressLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">❤️ rPPG Nabız</span>
                  <span className="text-white font-sans">{scan.heartRate} BPM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
