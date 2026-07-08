export interface QuranRemedy {
  id: string;
  name: string; // Fatiha, İnşirah, Rahmân, vb.
  index: number;
  verses: string; // Ayet aralıkları, örn: "1-7" veya belirli ayetler
  indication: string; // Hangi şifaya denk geldiği (Kalp Ferahlığı, Fiziksel Ağrı, Kaygı)
  esma: string; // Eşleşen Esma-ül Hüsna (örn: Ya Şâfî, Ya Selâm)
  description: string;
  healingFrequencyHz: number; // Hz frekansı örn: 528 (Kalp), 417 (Blokaj)
}

export interface AuricScanResult {
  id: string;
  timestamp: string;
  energyScore: number; // 0 - 100
  stressLevel: number; // 0 - 100
  heartRate: number; // rPPG tahmin edilen nabız
  breathingRate: number; // Solunum hızı tahmin
  dominantColor: string; // Aura rengi (hex veya isim)
  dominantVibe: string; // Kaygı, Yorgunluk, Dinginlik vb.
  blockageLocation: string; // Karaciğer Meridyeni, Kalp Çakrası, Alın Meridyeni vb.
  healingProtocol: {
    musicHz: number;
    surahId: string;
    esma: string;
    binauralCarrier: number;
    binauralBeat: number;
  };
  aiReport?: string; // Gemini tarafından oluşturulan Kuantum Analiz Sentezi
}

export interface SoundPreset {
  id: string;
  name: string;
  description: string;
  frequencyHz: number;
  type: 'solfeggio' | 'nature' | 'cosmic';
  icon: string;
}
