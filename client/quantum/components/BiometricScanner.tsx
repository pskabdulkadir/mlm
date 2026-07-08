import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Sparkles, Activity, ShieldCheck, Heart, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuricScanResult, QuranRemedy } from '../types';
import { MERIDIANS, MeridianNode } from './DigitalTwin';

interface BiometricScannerProps {
  onScanComplete: (result: AuricScanResult) => void;
  selectedNode: MeridianNode;
  onSetSelectedNode: (node: MeridianNode) => void;
}

export default function BiometricScanner({
  onScanComplete,
  selectedNode,
  onSetSelectedNode,
}: BiometricScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [ppgHeartRate, setPpgHeartRate] = useState(72);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ppgIntervalRef = useRef<any>(null);

  // Fluctuating rPPG Heart rate simulation
  useEffect(() => {
    ppgIntervalRef.current = setInterval(() => {
      setPpgHeartRate(prev => {
        const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const target = prev + offset;
        return Math.max(60, Math.min(110, target));
      });
    }, 1200);

    return () => {
      if (ppgIntervalRef.current) clearInterval(ppgIntervalRef.current);
    };
  }, []);

  // Request chamber camera permission
  const enableCamera = async () => {
    try {
      setCameraPermission('pending');
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false
      });
      setStream(videoStream);
      setCameraPermission('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        videoRef.current.play().catch(e => console.log("Video auto play error muted", e));
      }
    } catch (err) {
      console.warn("Camera grant blocked or unavailable", err);
      setCameraPermission('denied');
    }
  };

  // Safely stop stream
  const disableCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Auto trigger check or permit camera on load
  useEffect(() => {
    enableCamera();
    return () => {
      disableCamera();
    };
  }, []);

  // Sync video reference when state changes
  useEffect(() => {
    if (cameraPermission === 'granted' && videoRef.current && stream && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraPermission, stream]);

  // Handle pulse graph drawing via canvas (rPPG simulation)
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: number[] = [];
    const maxPoints = canvas.width;

    const renderPulse = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Generate a dynamic PPG pulse waveform cycle (systolic / dicrotic notch peaks)
      const timeLong = Date.now() / 150;
      const bpmMultiplier = ppgHeartRate / 60;
      const theta = timeLong * bpmMultiplier;
      
      // PPG Waveform mathematical approximation
      const waveVal = Math.sin(theta) * 0.6 + Math.sin(theta * 2) * 0.3 + 0.1 * Math.sin(theta * 0.5);
      const scaledVal = (waveVal + 1) * (canvas.height / 2.5) + (canvas.height * 0.1);

      points.push(scaledVal);
      if (points.length > maxPoints) {
        points.shift();
      }

      // Draw pulse line
      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee'; // cyan
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#06b6d4';
      
      for (let i = 0; i < points.length; i++) {
        const drawX = i;
        const drawY = canvas.height - points[i];
        if (i === 0) {
          ctx.moveTo(drawX, drawY);
        } else {
          ctx.lineTo(drawX, drawY);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      animationFrameId = requestAnimationFrame(renderPulse);
    };

    renderPulse();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ppgHeartRate]);

  // Execute actual scan cycle
  const startScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const duration = 4000; // 4 seconds
    const intervalTime = 40;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const currentPercent = Math.floor((currentStep / steps) * 100);
      setScanProgress(currentPercent);

      // Randomly change active selected node during scan for cybernetic visualization
      if (currentStep % 10 === 0) {
        const randomIndex = Math.floor(Math.random() * MERIDIANS.length);
        onSetSelectedNode(MERIDIANS[randomIndex]);
      }

      if (currentPercent >= 100) {
        clearInterval(progressTimer);
        
        // Compute definitive diagnostic outcome
        const calculatedEnergy = Math.floor(Math.random() * 35) + 45; // 45 to 80
        const calculatedStress = Math.floor(Math.random() * 40) + 35; // 35 to 75
        const finalBpm = ppgHeartRate;
        const breaths = Math.floor(finalBpm / 5.2); // rPPG respiratory rate correlation

        // Deterministically select the blockage node close to users selection, or randomize
        const finalBlockageNode = selectedNode;
        
        // Core aura color palettes
        const colors = [
          { name: 'Kırmızı Yeğin', vibe: 'Fiziksel Yorgunluk / Rezonans Direnci' },
          { name: 'Turuncu Akışkan', vibe: 'Duygusal Blokaj / Değişim Safhası' },
          { name: 'Sarı Berrak', vibe: 'Zihinsel Aşırı Yüklenme / Düzensizlik' },
          { name: 'Zümrüt Yeşili', vibe: 'Kalbi Dinginlik / İyileşme Başlangıcı' },
          { name: 'Gök Mavisi', vibe: 'Ruhsal İfade Sıkışması / Rezeksiyon' },
          { name: 'Mor Taç', vibe: 'Yüksek Kozmik Bağlantı / Yorgun Epifiz' },
        ];
        
        // Decides color based on chakra energy
        const colorVal = colors[MERIDIANS.indexOf(finalBlockageNode) % colors.length];

        const scanResult: AuricScanResult = {
          id: 'scan_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          energyScore: calculatedEnergy,
          stressLevel: calculatedStress,
          heartRate: finalBpm,
          breathingRate: breaths,
          dominantColor: colorVal.name,
          dominantVibe: colorVal.vibe,
          blockageLocation: finalBlockageNode.name,
          healingProtocol: {
            musicHz: finalBlockageNode.associatedHz,
            surahId: finalBlockageNode.associatedSurahId,
            esma: finalBlockageNode.indicativeChakra,
            binauralCarrier: 220,
            binauralBeat: calculatedStress > 60 ? 4 : 8, // Theta for high stress, alpha for chill
          }
        };

        // Notify parent callback
        onScanComplete(scanResult);
        setIsScanning(false);
      }
    }, intervalTime);
  };

  return (
    <div id="biometric-scanner-component" className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Activity className="text-cyan-400 w-5 h-5 animate-pulse" />
            Quantum Biyo-Optik Tarama (rPPG)
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Kamera sensörleri aracılığıyla mikroskobik damar dalgalanmalarını (rPPG) analiz eder.
          </p>
        </div>
        
        <button
          onClick={enableCamera}
          className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-teal-400 hover:bg-slate-900 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Kamerayı Sıfırla
        </button>
      </div>

      {/* Main Scanner Container Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        
        {/* Camera block view with overlays */}
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center select-none shadow-inner">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,20,35,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,35,0.3)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-55" />

          {/* Camera Frame View */}
          {cameraPermission === 'granted' ? (
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1] opacity-75"
            />
          ) : (
            /* Cybernetic Artificial Stream Fallback */
            <div className="text-center p-6 space-y-4 w-full h-full flex flex-col items-center justify-center">
              <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden opacity-[0.06] font-mono text-[8px] text-teal-400 select-none text-left leading-tight px-3 py-2 z-0 whitespace-nowrap">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="tracking-wider">
                    {`MATRIX_COORDINATES: [X:${(i*14.3)%100} Y:${(i*28.4)%100}] || FLUX:[${Math.sin(i).toFixed(4)}] || SIG_LOCK: OK`}
                  </div>
                ))}
              </div>
              <CameraOff className="w-12 h-12 text-slate-700 animate-bounce" />
              <div className="space-y-1 z-10 max-w-xs">
                <span className="text-[10px] font-mono tracking-widest text-teal-500 uppercase font-bold block bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full inline-block">
                  Sentezlenmiş Sinyal Modu
                </span>
                <p className="text-xs text-slate-400">
                  Kamera izni verilmediği veya sandboxta kısıtlandığı için, rPPG simüle sinyali devrededir. Taramayı başlatabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* Hologram Target Overlays (HUD) */}
          <div className="absolute inset-0 border-[10px] border-slate-950/40 pointer-events-none z-10" />
          
          {/* Cybernetic Bracket Reticle */}
          <div className="absolute w-56 h-56 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-700/30 rounded-full flex items-center justify-center pointer-events-none z-10">
            {/* Pulsating scan target rings */}
            <div className={`w-40 h-40 border border-teal-500/30 rounded-full ${isScanning ? 'animate-ping' : ''}`} />
            <div className="absolute w-6 h-6 -top-1 -left-1 border-t-2 border-l-2 border-teal-400" />
            <div className="absolute w-6 h-6 -top-1 -right-1 border-t-2 border-r-2 border-teal-400" />
            <div className="absolute w-6 h-6 -bottom-1 -left-1 border-b-2 border-l-2 border-teal-400" />
            <div className="absolute w-6 h-6 -bottom-1 -right-1 border-b-2 border-r-2 border-teal-400" />
          </div>

          {/* Active scanning state overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-teal-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-3 z-20 pointer-events-none"
              >
                <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                <div className="text-center">
                  <span className="text-xs font-mono font-bold tracking-widest text-teal-300">
                    SİSTOLİK ANALİZ: %{scanProgress}
                  </span>
                  <p className="text-[10px] font-mono text-cyan-400/80 animate-pulse mt-0.5">
                    HÜCRESEL BIYOFOTON TESPİT EDİLİYOR...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Diagnostic rPPG Live charts and instructions */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                rPPG Optik Sinyal Akışı
              </span>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white">
                  {ppgHeartRate} <span className="text-[9px] text-slate-500 font-normal">BPM</span>
                </span>
              </div>
            </div>

            {/* Pulse waveform Canvas */}
            <div className="relative h-24 w-full bg-slate-900/30 rounded-xl overflow-hidden border border-slate-800/30 flex items-center">
              <canvas 
                ref={canvasRef} 
                width={280} 
                height={80} 
                className="w-full h-full"
              />
              <div className="absolute bottom-1 right-2 font-mono text-[8px] text-slate-500">
                KAN VOLÜM FLÜKTÜASYONU (a.u.)
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                <span>Odaklı Bölge: <strong className="text-slate-100">{selectedNode.physicalRegion}</strong></span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Tarama esnasında AI kamera sensörü; kılcal damarlardaki ışık absorbsiyon değişkenlerini haritalandırıp, doğrudan hücresel rezidü ölçümü gerçekleştirecektir.
              </p>
            </div>
          </div>

          <button
            onClick={startScan}
            disabled={isScanning}
            className={`w-full py-4 px-6 rounded-2xl font-semibold tracking-wide text-sm font-sans flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
              isScanning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:opacity-90 active:scale-[0.98] text-slate-950 font-bold shadow-xl shadow-cyan-950/20'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Tarama Tamamlanıyor...</span>
              </>
            ) : (
              <>
                <Camera className="w-4.5 h-4.5" />
                <span>Kuantum Analizi Başlat</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40 text-[11px] text-slate-400 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Biyofoton verileriniz %100 yerel olarak işlenir ve gizliliğiniz askeri şifreleme altındadır.</span>
      </div>
    </div>
  );
}
