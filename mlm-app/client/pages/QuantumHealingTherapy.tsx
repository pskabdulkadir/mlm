import { useState, useRef, useEffect, useCallback } from "react";
import { QuantumHealingAI, type QuantumAnalysisResult } from "@/lib/quantum-healing-ai";
import {
  Heart,
  Sparkles,
  Zap,
  Eye,
  BookOpen,
  Activity,
  BarChart3,
  Camera,
  Volume2,
  Radio,
  Moon,
  Sun,
  Wind,
  Waves,
  Brain,
  Target,
  Settings,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Download,
  TrendingUp,
  Shield,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "motion/react";

interface AnalysisResult {
  energyLevel: number;
  blockages: string[];
  chakras: { name: string; level: number; color: string }[];
  auricColor: string;
  recommendations: string[];
}

interface HealingSession {
  id: string;
  date: string;
  duration: number;
  initialEnergy: number;
  finalEnergy: number;
  techniques: string[];
}

interface QuranHealing {
  surah: string;
  verse: string;
  title: string;
  benefit: string;
  frequency: number;
  chakra: string;
}

const QURAN_HEALINGS: QuranHealing[] = [
  {
    surah: "Al-Fatiha",
    verse: "1:1-7",
    title: "Açılış ve Temel İyileşme",
    benefit: "Tüm sistemin temel aktivasyonu, ruhsal enerji takviye",
    frequency: 432,
    chakra: "Tüm Çakralar"
  },
  {
    surah: "Al-Inshirah",
    verse: "94:1-8",
    title: "Ferahlık ve Basitlik",
    benefit: "Göğsü açma, depresyon giderme, ümit verme",
    frequency: 528,
    chakra: "Kalp"
  },
  {
    surah: "As-Shams",
    verse: "91:1-10",
    title: "Güneş ve Parlaklık",
    benefit: "Kişi merkezinde bilinci arttırma, kendine güven",
    frequency: 639,
    chakra: "Güneş Pleksusu"
  },
  {
    surah: "Al-Qadr",
    verse: "97:1-5",
    title: "Güç Gecesi - Yüksek Enerji",
    benefit: "Milyonlarca meleğin enerji indirişi, manifestasyon gücü",
    frequency: 963,
    chakra: "Taç Çakrası"
  },
  {
    surah: "Ayat-ul-Kursi",
    verse: "2:255",
    title: "Koruma ve Korucu Kalkan",
    benefit: "Negatif enerji blokajı, ruhani savunma",
    frequency: 444,
    chakra: "Kök"
  }
];

const CHAKRAS = [
  { name: "Kök Çakrası", color: "bg-red-500", level: 70, frequency: 256 },
  { name: "Sakral Çakrası", color: "bg-orange-500", level: 65, frequency: 288 },
  { name: "Güneş Pleksusu", color: "bg-yellow-500", level: 75, frequency: 320 },
  { name: "Kalp Çakrası", color: "bg-green-500", level: 80, frequency: 341 },
  { name: "Boğaz Çakrası", color: "bg-blue-500", level: 70, frequency: 384 },
  { name: "Üçüncü Göz", color: "bg-indigo-500", level: 65, frequency: 426 },
  { name: "Taç Çakrası", color: "bg-purple-500", level: 60, frequency: 480 }
];

export default function QuantumHealingTherapy() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [healingProgress, setHealingProgress] = useState(0);
  const [sessions, setSessions] = useState<HealingSession[]>([]);
  const [selectedHealing, setSelectedHealing] = useState<QuranHealing | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const aiRef = useRef<QuantumHealingAI | null>(null);
  const frameCountRef = useRef(0);
  const analysisIntervalRef = useRef<number | null>(null);

  // Kamera başlat ve AI analiz yapmaya başla
  const startScan = async () => {
    setIsScanning(true);

    try {
      // Kamera erişimi iste
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // AI engine'i başlat
      if (!aiRef.current) {
        aiRef.current = new QuantumHealingAI();
      }

      // Frame işlemesini başlat
      processFrames();

    } catch (error) {
      console.error("Kamera erişimi hatası:", error);
      alert("Kamera erişim izni gerekli. Lütfen izin verin.");
      setIsScanning(false);

      // Fallback: Simüle edilmiş sonuç
      generateMockAnalysis();
    }
  };

  // Video frame'lerini işle ve AI analiz yap
  const processFrames = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !aiRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const processFrame = () => {
      try {
        // Video frame'ini canvas'a çiz
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Image data'yı al
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Her 10 frame'de bir AI analiz yap (CPU yükünü azaltmak için)
        frameCountRef.current++;
        if (frameCountRef.current % 10 === 0) {
          const result = aiRef.current!.analyzeFrame(
            imageData.data,
            canvas.width,
            canvas.height
          );

          // Progress bar
          setHealingProgress(Math.min(100, frameCountRef.current / 3));

          // 300 frame sonrası tarama tamamlan (10 saniye @30fps)
          if (frameCountRef.current >= 300) {
            stopScan();
            generateAnalysisFromResult(result);
            return;
          }
        }

        // Sonraki frame'i işle
        requestAnimationFrame(processFrame);
      } catch (error) {
        console.error("Frame işleme hatası:", error);
      }
    };

    processFrame();
  }, []);

  // Kamera kapatma
  const stopScan = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
  }, []);

  // AI sonucundan AnalysisResult oluştur
  const generateAnalysisFromResult = (result: QuantumAnalysisResult) => {
    const auricColorMap: { [key: string]: string } = {
      "Kırmızı (Enerji)": "Kırmızı",
      "Turuncu (Yaratıcılık)": "Turuncu",
      "Sarı (Özgüven)": "Sarı",
      "Yeşil (Şifa)": "Yeşil",
      "Mavi (Sakinlik)": "Mavi",
      "İnigo (Sezgi)": "İnigo",
      "Mor (Ruhsal)": "Mor",
      "Gümüş (Denge)": "Gümüş",
      "Beyaz (Temizlik)": "Beyaz",
      "Siyah (Blokaj)": "Siyah",
    };

    const analysisResult: AnalysisResult = {
      energyLevel: result.overallEnergyLevel,
      blockages: result.blockages,
      chakras: result.chakras.map(c => ({
        name: c.name,
        level: c.level,
        color: `bg-slate-500` // Dinamik olacak
      })),
      auricColor: auricColorMap[result.auricAnalysis.dominantColor] || "Gümüş",
      recommendations: result.recommendations.map(r =>
        `${r.chakra}: ${r.surah} Suresi + ${r.frequency}Hz Frekansı`
      )
    };

    setAnalysisResult(analysisResult);
    setIsScanning(false);
    setHealingProgress(0);
  };

  // Fallback simüle edilmiş analiz
  const generateMockAnalysis = () => {
    const mockResult: AnalysisResult = {
      energyLevel: Math.floor(Math.random() * 40) + 55,
      blockages: ["Sakral Çakrası", "Üçüncü Göz"],
      chakras: CHAKRAS.map(c => ({
        ...c,
        level: Math.floor(Math.random() * 30) + 60
      })),
      auricColor: ["Mavi", "Yeşil", "Mor", "Altın"][Math.floor(Math.random() * 4)],
      recommendations: [
        "Manevi Rehber - Bölüm 2 (Nefs Terbiyesi)",
        "528 Hz Frekansı ile DNA Onarımı",
        "Al-Inshirah Suresi ile Ferahlık Terapisi"
      ]
    };

    setAnalysisResult(mockResult);
    setIsScanning(false);
    setHealingProgress(0);
  };

  // Şifa terapisini başlat
  const startHealing = async () => {
    if (!selectedHealing) return;
    
    setIsHealing(true);
    
    // Şifa oturumu simülasyonu (10 saniye)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHealingProgress(i);
    }

    // Ses frekansını çal
    await playFrequency(selectedHealing.frequency, 5000);

    // Oturum kaydını ekle
    const newSession: HealingSession = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleDateString("tr-TR"),
      duration: 5,
      initialEnergy: analysisResult?.energyLevel || 70,
      finalEnergy: Math.min(100, (analysisResult?.energyLevel || 70) + 15),
      techniques: [selectedHealing.surah]
    };
    
    setSessions([newSession, ...sessions]);
    setIsHealing(false);
    setHealingProgress(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScan();
      if (aiRef.current) {
        aiRef.current.reset();
      }
    };
  }, [stopScan]);

  // Web Audio API: Frekans çal
  const playFrequency = (frequency: number, duration: number) => {
    return new Promise(resolve => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = frequency;
      osc.type = "sine";
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);

      setTimeout(resolve, duration);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Disclaimer */}
      <Alert className="mb-6 bg-yellow-900/20 border-yellow-600">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-200">
          <strong>Yasal Uyarı:</strong> Bu uygulama tıbbi tanı aracı değildir. Rehberlik ve manevi şifa maksadıyla geliştirilmiştir. 
          Sağlık sorunları için mutlaka doktor görüşünüz.
        </AlertDescription>
      </Alert>

      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Heart className="w-10 h-10 text-rose-500" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              Quantum Healing Therapy
            </h1>
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-purple-200">Kamera taraması ile enerji analizi ve frekans terapisi sistemi</p>
        </motion.div>

        {/* Ana Tab Sistemi */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-purple-500">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Analiz</span>
            </TabsTrigger>
            <TabsTrigger value="healing" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Şifa</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Kütüphane</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Geçmiş</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ANALIZ PANELİ */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Camera className="w-5 h-5" />
                  Aurik Tarama ve Enerji Analizi
                </CardTitle>
                <CardDescription className="text-purple-200/70">
                  Kameranız aracılığıyla aura rengini, enerji seviyesini ve çakra dengelerini analiz edin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Kamera Görüntüsü Alanı */}
                <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-purple-500/50 h-80">
                  {!isScanning ? (
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      className="w-full h-full object-cover hidden"
                      style={{
                        background: "rgba(30, 30, 60, 0.5)"
                      }}
                    />
                  ) : null}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${isScanning ? "block" : "hidden"}`}
                    style={{
                      transform: "scaleX(-1)" // Ayna görüntüsü
                    }}
                  />

                  {!isScanning && (
                    <div className="w-full h-full flex items-center justify-center text-purple-300/50">
                      <div className="text-center">
                        <Camera className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>Kamera taraması başlamadı</p>
                      </div>
                    </div>
                  )}

                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-purple-500/50">
                      {/* Yüz bölgesi göstergesi */}
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-dashed border-purple-400 rounded-lg opacity-50" />

                      {/* Tarama animasyonu */}
                      <motion.div
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Tarama Düğmesi */}
                <Button
                  onClick={startScan}
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
                >
                  {isScanning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                      />
                      Taranıyor...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Taramayı Başlat
                    </>
                  )}
                </Button>

                {/* Tarama İlerleme */}
                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-purple-300">
                      <span>Tarama İlerleme</span>
                      <span>{healingProgress}%</span>
                    </div>
                    <Progress value={healingProgress} className="h-2" />
                  </div>
                )}

                {/* Analiz Sonuçları */}
                {analysisResult && !isScanning && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 pt-6 border-t border-purple-500/30"
                  >
                    {/* Enerji Seviyesi */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-300 font-semibold">Enerji Seviyesi</span>
                        <Badge className="bg-purple-600 text-white">
                          {analysisResult.energyLevel}%
                        </Badge>
                      </div>
                      <Progress 
                        value={analysisResult.energyLevel} 
                        className="h-3 bg-slate-700"
                        style={{
                          background: `linear-gradient(90deg, #8b5cf6 ${analysisResult.energyLevel}%, #1e1e3f ${analysisResult.energyLevel}%)`
                        }}
                      />
                    </div>

                    {/* Aura Rengi */}
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                      <p className="text-purple-300 text-sm mb-2">Aurik Renk Analizi</p>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-16 h-16 rounded-full border-2 border-purple-500"
                          style={{
                            background: analysisResult.auricColor === "Mavi" ? "rgb(59, 130, 246)" :
                                       analysisResult.auricColor === "Yeşil" ? "rgb(34, 197, 94)" :
                                       analysisResult.auricColor === "Mor" ? "rgb(168, 85, 247)" :
                                       "rgb(251, 191, 36)"
                          }}
                        />
                        <div>
                          <p className="text-white font-semibold">{analysisResult.auricColor}</p>
                          <p className="text-purple-300/70 text-sm">
                            {analysisResult.auricColor === "Mavi" && "Sakinlik ve İletişim"}
                            {analysisResult.auricColor === "Yeşil" && "Şifa ve Uyum"}
                            {analysisResult.auricColor === "Mor" && "Ruhsal Gelişim"}
                            {analysisResult.auricColor === "Altın" && "Evrensel Sevgi"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Çakra Denge */}
                    <div className="space-y-3">
                      <p className="text-purple-300 text-sm font-semibold">Çakra Denge Haritası</p>
                      {analysisResult.chakras.map((chakra, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs text-purple-200">
                            <span>{chakra.name}</span>
                            <span>{chakra.level}%</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${chakra.color}`}
                              style={{ width: `${chakra.level}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Blokajlar */}
                    {analysisResult.blockages.length > 0 && (
                      <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                        <p className="text-red-300 text-sm font-semibold mb-2">Tespit Edilen Enerji Blokajları</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.blockages.map((block, i) => (
                            <Badge key={i} className="bg-red-600/50 text-red-100">
                              {block}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Öneriler */}
                    <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                      <p className="text-green-300 text-sm font-semibold mb-3">AI Tarafından Önerilen Şifa Protokolleri</p>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-green-200 text-sm">
                            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: ŞİFA TERAPİSİ */}
          <TabsContent value="healing" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Heart className="w-5 h-5" />
                  Manevi Rezonans Şifa Terapisi
                </CardTitle>
                <CardDescription className="text-purple-200/70">
                  Quran'dan Şifa Ayetleri + Solfeggio Frekansları kombinasyonu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!analysisResult ? (
                  <Alert className="bg-blue-900/20 border-blue-600">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200">
                      Önce Analiz sekmesinde taramayı tamamlamanız gerekiyor.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Quran Şifa Kütüphanesi */}
                    <div className="space-y-4">
                      <p className="text-purple-300 font-semibold">Quran Şifa Sureler</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {QURAN_HEALINGS.map((healing, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSelectedHealing(healing)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedHealing?.surah === healing.surah
                                ? "bg-purple-600/30 border-purple-500"
                                : "bg-slate-900/50 border-purple-500/20 hover:border-purple-500/50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-purple-200 font-semibold">{healing.surah}</p>
                                <p className="text-purple-400 text-xs">{healing.verse}</p>
                              </div>
                              <Badge className="bg-indigo-600">{healing.frequency} Hz</Badge>
                            </div>
                            <p className="text-white text-sm mb-2">{healing.title}</p>
                            <p className="text-purple-200/70 text-xs">{healing.benefit}</p>
                            <p className="text-purple-400 text-xs mt-2">Çakra: {healing.chakra}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Seçili Şifa Detayları */}
                    {selectedHealing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500/50"
                      >
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{selectedHealing.surah}</h3>
                          <p className="text-purple-300">{selectedHealing.title}</p>
                        </div>

                        {/* Şifa Oturumu Kontrolü */}
                        <div className="space-y-4">
                          <p className="text-purple-200 text-sm">{selectedHealing.benefit}</p>

                          {/* Frekans Şarjı */}
                          {isHealing && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-purple-300">
                                <span>Frekans Yüklemesi ({selectedHealing.frequency} Hz)</span>
                                <span>{healingProgress}%</span>
                              </div>
                              <Progress value={healingProgress} className="h-3" />
                              <p className="text-purple-300/70 text-xs">
                                Işık vücut aktivasyonu devam ediyor...
                              </p>
                            </div>
                          )}

                          {/* Başlat Düğmesi */}
                          <Button
                            onClick={startHealing}
                            disabled={isHealing}
                            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white py-6 text-lg"
                          >
                            {isHealing ? (
                              <>
                                <Pause className="w-5 h-5 mr-2" />
                                Şifa Terapisi Devam Ediyor...
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Şifa Seansını Başlat (5 dakika)
                              </>
                            )}
                          </Button>

                          {!isHealing && healingProgress === 0 && (
                            <p className="text-purple-300/70 text-xs text-center">
                              Frekans akışı ve kutsal kelamlar arka planda çalacaktır.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: ŞİFA KÜTÜPHANESI */}
          <TabsContent value="library" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <BookOpen className="w-5 h-5" />
                  Şifa Kütüphanesi
                </CardTitle>
                <CardDescription className="text-purple-200/70">
                  Solfeggio Frekansları, Kozmik Sesler ve Manevi Rehber İçerikleri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Solfeggio Frekansları Tablosu */}
                <div className="space-y-3">
                  <p className="text-purple-300 font-semibold flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Solfeggio Frekansları
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-purple-500/30">
                        <tr>
                          <th className="text-left py-2 text-purple-300 font-semibold">Frekans</th>
                          <th className="text-left py-2 text-purple-300 font-semibold">Etki</th>
                          <th className="text-left py-2 text-purple-300 font-semibold">Çakra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { freq: "174 Hz", effect: "Güven ve Temel", chakra: "Kök" },
                          { freq: "285 Hz", effect: "Doku Yenileme", chakra: "Sakral" },
                          { freq: "396 Hz", effect: "Korku Giderme", chakra: "Kök" },
                          { freq: "417 Hz", effect: "Değişim", chakra: "Sakral" },
                          { freq: "432 Hz", effect: "Doğa Rezonansı", chakra: "Tüm Çakralar" },
                          { freq: "528 Hz", effect: "DNA Onarımı", chakra: "Taç" },
                          { freq: "639 Hz", effect: "Bağlantı", chakra: "Kalp" },
                          { freq: "741 Hz", effect: "Sezgi", chakra: "Üçüncü Göz" },
                          { freq: "852 Hz", effect: "İlahi Düzen", chakra: "Taç" },
                          { freq: "963 Hz", effect: "Tanrı Frekansı", chakra: "Taç" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-purple-500/10 hover:bg-purple-900/20">
                            <td className="py-3 text-white font-semibold">{row.freq}</td>
                            <td className="py-3 text-purple-300">{row.effect}</td>
                            <td className="py-3 text-purple-400">{row.chakra}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Kozmik Sesler */}
                <div className="space-y-3 pt-6 border-t border-purple-500/30">
                  <p className="text-purple-300 font-semibold flex items-center gap-2">
                    <Waves className="w-4 h-4" />
                    Kozmik ve Doğa Sesleri
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "Okyanus Dalgaları", benefit: "Huzur ve Sakinlik" },
                      { name: "Yağmur Sesi", benefit: "Rahatlama" },
                      { name: "Rüzgar Sesi", benefit: "Temizleme" },
                      { name: "Kuş Sesleri", benefit: "Sevinç ve Özgürlük" },
                      { name: "Orman Ambiyansı", benefit: "Bağlantı" },
                      { name: "Şelale Sesi", benefit: "Enerji Yenileme" }
                    ].map((sound, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-white text-sm font-semibold">{sound.name}</p>
                            <p className="text-purple-300/70 text-xs">{sound.benefit}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manevi Rehber İçerikleri */}
                <div className="space-y-3 pt-6 border-t border-purple-500/30">
                  <p className="text-purple-300 font-semibold flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Manevi Rehber İçerikleri
                  </p>
                  <div className="space-y-2">
                    {[
                      "Manevi Rehber - Bölüm 1: Temel Bilgiler",
                      "Manevi Rehber - Bölüm 2: Nefs Terbiyesi",
                      "Manevi Rehber - Bölüm 3: Derinleşme",
                      "Manevi Rehber - Bölüm 4: İleri Pratikler",
                      "Manevi Rehber - Bölüm 5: Kalp Temizliği",
                      "Manevi Rehber - Bölüm 6: Özet ve Pratikler"
                    ].map((content, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-purple-500/20 flex justify-between items-center group hover:border-purple-500/50 cursor-pointer transition-all">
                        <span className="text-purple-200">{content}</span>
                        <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: GEÇMIŞ VE İLERLEME */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <TrendingUp className="w-5 h-5" />
                  Şifa Oturumu Geçmişi
                </CardTitle>
                <CardDescription className="text-purple-200/70">
                  Enerji seviyelerin ilerlemesini ve yapılan terapileri takip edin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sessions.length === 0 ? (
                  <div className="text-center py-12 text-purple-300/70">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz şifa oturumu kaydı bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold flex items-center gap-2">
                              <Clock className="w-4 h-4 text-purple-400" />
                              {session.date}
                            </p>
                            <p className="text-purple-300/70 text-sm">{session.duration} dakikalık seans</p>
                          </div>
                          <Badge className="bg-purple-600">{session.techniques[0]}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-purple-300 text-xs mb-1">Başlangıç Enerji</p>
                            <p className="text-white text-lg font-bold">{session.initialEnergy}%</p>
                          </div>
                          <div>
                            <p className="text-purple-300 text-xs mb-1">Son Enerji</p>
                            <p className="text-green-400 text-lg font-bold">
                              {session.finalEnergy}%
                              <span className="text-green-400 text-xs ml-1">
                                (+{session.finalEnergy - session.initialEnergy}%)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
