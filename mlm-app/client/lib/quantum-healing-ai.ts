/**
 * Quantum Healing AI Engine
 * PPG (Remote Photoplethysmography) + Chakra Analysis + Frequency Recommendation
 */

export interface PPGData {
  heartRate: number;
  heartRateVariability: number;
  bloodOxygenLevel: number;
  stressLevel: number; // 0-100
  timestamp: number;
}

export interface AuricAnalysis {
  dominantColor: string;
  colorHex: string;
  energySignature: number[]; // RGB values
  auricIntensity: number; // 0-100
  chakraIndices: number[];
}

export interface ChakraAnalysis {
  name: string;
  level: number; // 0-100
  blockageLevel: number; // 0-100
  frequency: number; // Hz
  recommendedFrequency: number; // Hz
  recommendedSurah: string;
  healingPriority: number; // 0-100
}

export interface QuantumAnalysisResult {
  ppgData: PPGData;
  auricAnalysis: AuricAnalysis;
  chakras: ChakraAnalysis[];
  overallEnergyLevel: number;
  blockages: string[];
  recommendations: Array<{
    priority: "HIGH" | "MEDIUM" | "LOW";
    surah: string;
    frequency: number;
    chakra: string;
    reason: string;
  }>;
  analysisTimestamp: number;
}

/**
 * PPG Algorithm: Remote Photoplethysmography
 * Analyzes color changes in facial skin to detect heart rate and blood oxygen
 */
export class PPGAnalyzer {
  private redValues: number[] = [];
  private greenValues: number[] = [];
  private blueValues: number[] = [];
  private timestamps: number[] = [];
  private windowSize = 300; // Last 300 frames

  /**
   * Extract PPG signal from video frame
   */
  extractPPGSignal(imageData: Uint8ClampedArray, width: number, height: number): PPGData {
    // Focus on face region (center 60% of image)
    const startX = Math.floor(width * 0.2);
    const endX = Math.floor(width * 0.8);
    const startY = Math.floor(height * 0.2);
    const endY = Math.floor(height * 0.8);

    let sumRed = 0,
      sumGreen = 0,
      sumBlue = 0;
    let pixelCount = 0;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        sumRed += imageData[idx];
        sumGreen += imageData[idx + 1];
        sumBlue += imageData[idx + 2];
        pixelCount++;
      }
    }

    const avgRed = sumRed / pixelCount;
    const avgGreen = sumGreen / pixelCount;
    const avgBlue = sumBlue / pixelCount;

    // Store values for analysis
    this.redValues.push(avgRed);
    this.greenValues.push(avgGreen);
    this.blueValues.push(avgBlue);
    this.timestamps.push(Date.now());

    // Keep only last N values
    if (this.redValues.length > this.windowSize) {
      this.redValues.shift();
      this.greenValues.shift();
      this.blueValues.shift();
      this.timestamps.shift();
    }

    // Calculate PPG metrics
    const ppg = this.calculatePPGMetrics();

    return ppg;
  }

  private calculatePPGMetrics(): PPGData {
    if (this.redValues.length < 30) {
      return {
        heartRate: 0,
        heartRateVariability: 0,
        bloodOxygenLevel: 0,
        stressLevel: 0,
        timestamp: Date.now(),
      };
    }

    // Detrend signal using moving average
    const redDetrended = this.detrend(this.redValues);
    const greenDetrended = this.detrend(this.greenValues);
    const blueDetrended = this.detrend(this.blueValues);

    // Calculate normalized PPG signal (R-channel dominates for skin color)
    const ppgSignal = redDetrended.map((r, i) => r - 0.5 * greenDetrended[i]);

    // Find peaks (heart beats)
    const peaks = this.findPeaks(ppgSignal);
    const peakIntervals = this.calculatePeakIntervals();

    // Estimate heart rate (frames per second assumed ~30fps)
    const fps = 30;
    const heartRate = peaks.length > 0 ? Math.round((peaks.length / (this.redValues.length / fps)) * 60) : 0;

    // Heart rate variability (standard deviation of peak intervals)
    const heartRateVariability = peakIntervals.length > 1 ? this.calculateStdDev(peakIntervals) : 0;

    // Blood oxygen level estimation (SpO2) - simplified
    // In reality, requires dual wavelength (660nm + 940nm), we use RGB approximation
    const ratio = this.redValues.reduce((a, b) => a + b, 0) / this.redValues.length / 
                  (this.greenValues.reduce((a, b) => a + b, 0) / this.greenValues.length);
    const bloodOxygenLevel = Math.min(100, Math.max(90, ratio * 50 + 75));

    // Stress level based on heart rate variability and heart rate
    const normalHR = 70;
    const hrDeviation = Math.abs(heartRate - normalHR);
    const hrvFactor = heartRateVariability > 0 ? Math.min(50, heartRateVariability / 10) : 0;
    const stressLevel = Math.min(100, (hrDeviation / 60) * 100 + hrvFactor);

    return {
      heartRate: Math.max(0, Math.min(200, heartRate)),
      heartRateVariability,
      bloodOxygenLevel: Math.round(bloodOxygenLevel),
      stressLevel: Math.round(stressLevel),
      timestamp: Date.now(),
    };
  }

  private detrend(values: number[]): number[] {
    const windowSize = Math.max(5, Math.floor(values.length / 10));
    const trend = this.movingAverage(values, windowSize);
    return values.map((v, i) => v - (trend[i] || values[i]));
  }

  private movingAverage(values: number[], window: number): number[] {
    return values.map((_, i) => {
      const start = Math.max(0, i - window);
      const end = Math.min(values.length, i + window + 1);
      const avg = values.slice(start, end).reduce((a, b) => a + b, 0) / (end - start);
      return avg;
    });
  }

  private findPeaks(signal: number[], threshold = 0): number[] {
    const peaks: number[] = [];
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] > threshold) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  private calculatePeakIntervals(): number[] {
    const peaks = this.findPeaks(
      this.redValues.map((r, i) => r - 0.5 * this.greenValues[i])
    );
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    return intervals;
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  reset(): void {
    this.redValues = [];
    this.greenValues = [];
    this.blueValues = [];
    this.timestamps = [];
  }
}

/**
 * Auric Color Analyzer
 * Determines aura color from facial skin tone and PPG data
 */
export class AuricColorAnalyzer {
  analyzeAuricColor(imageData: Uint8ClampedArray, width: number, height: number): AuricAnalysis {
    // Extract dominant color from face region
    const startX = Math.floor(width * 0.2);
    const endX = Math.floor(width * 0.8);
    const startY = Math.floor(height * 0.15);
    const endY = Math.floor(height * 0.85);

    let sumR = 0,
      sumG = 0,
      sumB = 0;
    let pixelCount = 0;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        sumR += imageData[idx];
        sumG += imageData[idx + 1];
        sumB += imageData[idx + 2];
        pixelCount++;
      }
    }

    const avgR = sumR / pixelCount;
    const avgG = sumG / pixelCount;
    const avgB = sumB / pixelCount;

    // Normalize to 0-1
    const r = avgR / 255;
    const g = avgG / 255;
    const b = avgB / 255;

    // Determine aura color based on RGB values
    const color = this.classifyColor(r, g, b);
    const intensity = Math.max(r, g, b) * 100;

    // Map color to chakra indices
    const chakraIndices = this.getChakraIndices(color);

    return {
      dominantColor: color,
      colorHex: `#${Math.round(avgR).toString(16).padStart(2, "0")}${Math.round(avgG).toString(16).padStart(2, "0")}${Math.round(avgB).toString(16).padStart(2, "0")}`,
      energySignature: [Math.round(avgR), Math.round(avgG), Math.round(avgB)],
      auricIntensity: Math.min(100, intensity),
      chakraIndices,
    };
  }

  private classifyColor(r: number, g: number, b: number): string {
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const hsl = this.rgbToHSL(r, g, b);
    const hue = hsl[0];

    // Determine color based on hue
    if (maxVal < 0.3) return "Siyah (Blokaj)";
    if (minVal > 0.9) return "Beyaz (Temizlik)";

    if (hue >= 330 || hue < 15) return "Kırmızı (Enerji)";
    if (hue >= 15 && hue < 45) return "Turuncu (Yaratıcılık)";
    if (hue >= 45 && hue < 65) return "Sarı (Özgüven)";
    if (hue >= 65 && hue < 150) return "Yeşil (Şifa)";
    if (hue >= 150 && hue < 200) return "Mavi (Sakinlik)";
    if (hue >= 200 && hue < 260) return "İnigo (Sezgi)";
    if (hue >= 260 && hue < 330) return "Mor (Ruhsal)";

    return "Gümüş (Denge)";
  }

  private rgbToHSL(r: number, g: number, b: number): [number, number, number] {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [h * 360, s, l];
  }

  private getChakraIndices(color: string): number[] {
    const chakraMap: { [key: string]: number[] } = {
      "Kırmızı (Enerji)": [0],
      "Turuncu (Yaratıcılık)": [1],
      "Sarı (Özgüven)": [2],
      "Yeşil (Şifa)": [3],
      "Mavi (Sakinlik)": [4],
      "İnigo (Sezgi)": [5],
      "Mor (Ruhsal)": [6],
      "Gümüş (Denge)": [3, 4],
      "Siyah (Blokaj)": [0, 1, 2, 3, 4, 5, 6],
      "Beyaz (Temizlik)": [6],
    };
    return chakraMap[color] || [3];
  }
}

/**
 * Chakra Analysis Engine
 */
export class ChakraAnalysisEngine {
  analyzeChakras(ppgData: PPGData, auricAnalysis: AuricAnalysis): ChakraAnalysis[] {
    const chakraDefinitions = [
      { name: "Kök Çakrası", baseFreq: 256, surah: "Fatiha" },
      { name: "Sakral Çakrası", baseFreq: 288, surah: "Yunus" },
      { name: "Güneş Pleksusu", baseFreq: 320, surah: "Duha" },
      { name: "Kalp Çakrası", baseFreq: 341, surah: "İnşirah" },
      { name: "Boğaz Çakrası", baseFreq: 384, surah: "Meryem" },
      { name: "Üçüncü Göz", baseFreq: 426, surah: "Ya-Sin" },
      { name: "Taç Çakrası", baseFreq: 480, surah: "Qadr" },
    ];

    return chakraDefinitions.map((chakra, index) => {
      // Calculate base level from heart rate
      const stressInfluence = Math.max(0, ppgData.stressLevel - 30) / 7;
      const baseLevel = 80 - stressInfluence;

      // Affected chakras get lower levels
      const isAffected = auricAnalysis.chakraIndices.includes(index);
      const level = isAffected ? Math.max(30, baseLevel - 20) : baseLevel;

      // Blockage level
      const blockageLevel = 100 - level;

      // Recommended frequency based on blockage
      const frequencyShift = blockageLevel > 50 ? blockageLevel / 10 : 0;
      const recommendedFrequency = Math.round(chakra.baseFreq + frequencyShift);

      return {
        name: chakra.name,
        level: Math.round(level),
        blockageLevel: Math.round(blockageLevel),
        frequency: chakra.baseFreq,
        recommendedFrequency,
        recommendedSurah: chakra.surah,
        healingPriority: Math.round(blockageLevel),
      };
    });
  }
}

/**
 * Main Quantum Healing AI Engine
 */
export class QuantumHealingAI {
  private ppgAnalyzer = new PPGAnalyzer();
  private auricAnalyzer = new AuricColorAnalyzer();
  private chakraEngine = new ChakraAnalysisEngine();

  analyzeFrame(imageData: Uint8ClampedArray, width: number, height: number): QuantumAnalysisResult {
    // Extract PPG signal
    const ppgData = this.ppgAnalyzer.extractPPGSignal(imageData, width, height);

    // Analyze auric color
    const auricAnalysis = this.auricAnalyzer.analyzeAuricColor(imageData, width, height);

    // Analyze chakras
    const chakras = this.chakraEngine.analyzeChakras(ppgData, auricAnalysis);

    // Calculate overall energy level
    const overallEnergyLevel = Math.round(chakras.reduce((sum, c) => sum + c.level, 0) / chakras.length);

    // Identify blockages
    const blockages = chakras
      .filter((c) => c.blockageLevel > 50)
      .map((c) => c.name)
      .slice(0, 3);

    // Generate recommendations
    const recommendations = chakras
      .filter((c) => c.healingPriority > 40)
      .sort((a, b) => b.healingPriority - a.healingPriority)
      .slice(0, 3)
      .map((chakra) => ({
        priority: chakra.healingPriority > 70 ? ("HIGH" as const) : chakra.healingPriority > 50 ? ("MEDIUM" as const) : ("LOW" as const),
        surah: chakra.recommendedSurah,
        frequency: chakra.recommendedFrequency,
        chakra: chakra.name,
        reason: `${chakra.name} enerji seviyesi düşük. ${chakra.recommendedFrequency}Hz frekans ve ${chakra.recommendedSurah} suresi önerilir.`,
      }));

    return {
      ppgData,
      auricAnalysis,
      chakras,
      overallEnergyLevel,
      blockages,
      recommendations,
      analysisTimestamp: Date.now(),
    };
  }

  reset(): void {
    this.ppgAnalyzer.reset();
  }
}
