export interface Verse {
  arabic: string;
  turkish: string;
  source: string;
}

export interface Hadith {
  arabic?: string;
  turkish: string;
  source: string;
}

export interface TrainingPage {
  id: string;
  title: string;
  content: string;
  verses?: Verse[];
  hadiths?: Hadith[];
  keyPoints?: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  totalPages: number;
  estimatedTime: string;
  pages: TrainingPage[];
}

export const sadakaTrainingContent: TrainingModule = {
  id: "sadaka-training",
  title: "Sadaka ve Yardımlaşma Eğitimi",
  description: "İslam'da sadakanın önemi, türleri ve toplumsal faydaları.",
  totalPages: 3,
  estimatedTime: "15 Dakika",
  pages: [
    {
      id: "sadaka-1",
      title: "Sadaka Nedir ve Önemi",
      content: "Sadaka, bir Müslümanın Allah'ın rızasını kazanmak amacıyla gerçekleştirdiği her türlü maddi ve manevi iyiliktir. Sadece para vermekle sınırlı olmayıp, bir tebessüm, yol gösterme veya darda olana yardım eli uzatma gibi manevi amelleri de kapsar.",
      verses: [
        {
          arabic: "يَمْحَقُ اللَّهُ الرِّبَا وَيُرْبِي الصَّدَقَاتِ ۗ وَاللَّهُ لَا يُحِبُّ كُلَّ كَفَّارٍ أَثِيمٍ",
          turkish: "Allah faizi tüketir, sadakaları ise arttırır. Allah hiçbir günahkâr nankörü sevmez.",
          source: "Bakara Suresi, 276. Ayet"
        }
      ],
      hadiths: [
        {
          arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ",
          turkish: "Her iyilik bir sadakadır.",
          source: "Buhari, Edeb 33"
        }
      ],
      keyPoints: [
        "Sadaka maddi ve manevi her türlü iyiliği kapsar.",
        "Sadaka vermek malı eksiltmez, aksine bereketlendirir.",
        "İhlasla yapılan her hayır Allah katında değerlidir."
      ]
    },
    {
      id: "sadaka-2",
      title: "Sadaka Çeşitleri ve Sadaka-i Cariye",
      content: "Sadakalar genel olarak nafile sadakalar ve kalıcı hayırlar (Sadaka-i Cariye) olarak ikiye ayrılır. Sadaka-i cariye, kişi vefat ettikten sonra da sevabı devam eden kesintisiz hayırlardır. Okul, çeşme, cami yaptırmak veya insanlığa faydalı bir ilim/eser bırakmak bu kapsama girer.",
      verses: [
        {
          arabic: "إِنَّ الْمُصَّدِّقِينَ وَالْمُصَّدِّقَاتِ وَأَقْرَضُوا اللَّهَ قَرْضًا حَسَنًا يُضَاعَفُ لَهُمْ وَلَهُمْ أَجْرٌ كَرِيمٌ",
          turkish: "Şüphesiz sadaka veren erkeklerle sadaka veren kadınlara ve Allah'a güzel bir borç verenlere verdikleri kat kat arttırılır. Onlar için şerefli bir ödül de vardır.",
          source: "Hadid Suresi, 18. Ayet"
        }
      ],
      hadiths: [
        {
          turkish: "İnsanoğlu öldüğü zaman ameli kesilir. Ancak üç şey bundan müstesnadır: Sadaka-i cariye, kendisinden faydalanılan ilim ve kendisine dua eden hayırlı evlat.",
          source: "Müslim, Vasiyyet 14"
        }
      ],
      keyPoints: [
        "Sadaka-i cariye, kalıcı ve sürekli fayda sağlayan hayırlardır.",
        "İlim ve teknoloji alanında insanlığa fayda sunmak sadakadır.",
        "Vefat sonrasında da amel defterinin açık kalmasını sağlar."
      ]
    },
    {
      id: "sadaka-3",
      title: "Sosyal Yardımlaşma ve Dayanışma",
      content: "İslam toplumu, birbirine kenetlenmiş bir bina gibidir. Sadaka, zengin ile fakir arasındaki köprüyü kurarak sevgi, güven ve huzur ortamını tesis eder. Yardımlaşma ruhu, toplumsal barışın en güçlü garantisidir.",
      hadiths: [
        {
          turkish: "Yarım hurma vermek suretiyle de olsa kendinizi cehennem ateşinden koruyunuz. Onu da bulamazsanız, güzel ve tatlı bir sözle korununuz.",
          source: "Buhari, Zekat 10"
        }
      ],
      keyPoints: [
        "Paylaşmak toplumsal huzuru ve sevgi bağlarını güçlendirir.",
        "Manevi sadakalar da maddi sadakalar kadar değerlidir.",
        "Küçük de olsa sürekli yapılan yardımlar daha makbuldür."
      ]
    }
  ]
};

export const tradeTrainingContent: TrainingModule = {
  id: "trade-training",
  title: "Helal E-Ticaret ve Ticaret Ahlakı",
  description: "İslam hukukuna göre helal ticaret, dürüstlük ve e-ticaret esasları.",
  totalPages: 3,
  estimatedTime: "20 Dakika",
  pages: [
    {
      id: "trade-1",
      title: "İslam'da Ticaretin Esasları",
      content: "Ticaret, İslamiyet'te övülen ve teşvik edilen bir geçim kaynağıdır. Ancak dürüstlük, aldatmamak, ölçü ve tartıya dikkat etmek ticaretin geçerlilik şartlarındandır. Kul hakkına girmemek ve helal kazanç sınırı gözetmek esastır.",
      verses: [
        {
          arabic: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا",
          turkish: "...Oysa Allah, alış-verişi helal, faizi ise haram kılmıştır...",
          source: "Bakara Suresi, 275. Ayet"
        }
      ],
      hadiths: [
        {
          arabic: "التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ",
          turkish: "Doğru ve güvenilir tüccar, peygamberler, sıddıklar ve şehidlerle beraberdir.",
          source: "Tirmizi, Buyu' 4"
        }
      ],
      keyPoints: [
        "Alışveriş rıza ve dürüstlük zemininde helaldir.",
        "Fahiş fiyatlama, karaborsacılık ve hile haram kılınmıştır.",
        "Güvenilirlik ve doğruluk en büyük tüccar sermayesidir."
      ]
    },
    {
      id: "trade-2",
      title: "Dijital Çağda Helal Ticaret ve E-Ticaret",
      content: "E-ticaret yaparken fiziki dükkanlarda olan tüm ahlaki kurallar geçerlidir. Ürünün kusurlarını gizlememek, doğru bilgi vermek, teslimat sürelerine uymak ve iade kolaylığı sağlamak modern helal e-ticaretin vazgeçilmezleridir. Dropshipping ve stoksuz satış işlemlerinde mülkiyet ve kabz (teslim alma/teslim etme yetkisi) kurallarına dikkat edilmelidir.",
      keyPoints: [
        "Dijital satış platformlarında dürüstlük ve şeffaflık zorunludur.",
        "Görseller ürünün gerçek halini ve kalitesini tam yansıtmalıdır.",
        "Müşteri hakları ve tüketiciyi koruma İslam ahlakının gereğidir."
      ]
    },
    {
      id: "trade-3",
      title: "Bereket ve Sadakat",
      content: "Dürüst bir ticaret rızka bereket katar. Müşteriye karşı yumuşak huylu olmak, sözünde durmak ve hak yememek sadık bir müşteri kitlesi kazandırdığı gibi ilahi rızayı ve bereketi de beraberinde getirir.",
      hadiths: [
        {
          turkish: "Satarken, satın alırken ve hakkını talep ederken kolaylık gösteren kimseye Allah rahmet etsin.",
          source: "Buhari, Buyu' 16"
        }
      ],
      keyPoints: [
        "Kolaylık göstermek ve güler yüz ticaret ahlakındandır.",
        "Yalan yeminlerle mal satmak bereketi yok eder.",
        "Helal rızık arayışı ibadet hükmündedir."
      ]
    }
  ]
};

export const zakahTrainingContent: TrainingModule = {
  id: "zakat-training",
  title: "Zekat ve Mali İbadetler",
  description: "Zekat verme yükümlülüğü, hesaplanması ve adabı.",
  totalPages: 3,
  estimatedTime: "15 Dakika",
  pages: [
    {
      id: "zakat-1",
      title: "Zekat Nedir ve Farz Olma Şartları",
      content: "Zekat, belirli bir mal varlığına (nisap miktarı) sahip olan Müslümanların, yılda bir kez mallarının belli bir kısmını ihtiyaç sahiplerine vermeleridir. İslam'ın beş temel şartından biridir ve mali bir ibadettir.",
      verses: [
        {
          arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ۚ وَمَا تُقَدِّمُوا لِأَنْفُسِكُمْ مِنْ خَيْرٍ تَجِدُوهُ عِنْدَ اللَّهِ",
          turkish: "Namazı kılın, zekatı verin. Kendiniz için önden gönderdiğiniz her iyiliği Allah katında bulursunuz.",
          source: "Bakara Suresi, 110. Ayet"
        }
      ],
      hadiths: [
        {
          turkish: "İslam beş esas üzerine kurulmuştur: Allah'tan başka ilah olmadığına ve Muhammed'in O'nun elçisi olduğuna şehadet etmek, namaz kılmak, zekat vermek, haccetmek ve ramazan orucunu tutmak.",
          source: "Buhari, İman 1"
        }
      ],
      keyPoints: [
        "Zekat İslam'ın köprüsüdür ve farz bir ibadettir.",
        "Asli ihtiyaçlar dışında nisap miktarı mala sahip olanlar yükümlüdür.",
        "Zekat malın kirini temizler ve onu koruma altına alır."
      ]
    },
    {
      id: "zakat-2",
      title: "Zekat Nasıl Hesaplanır?",
      content: "Nisap miktarı, 80.18 gram altın veya buna eşdeğer nakit dâhil ticari maldır. Bu miktarın üzerinden bir kameri yıl (354 gün) geçmesiyle borçlar düşüldükten sonra kalan kısmın yüzde 2.5'u (%2.5 veya kırkta biri) zekat olarak verilir.",
      keyPoints: [
        "Altın, nakit para, hisse senedi ve ticaret malları zekata tabidir.",
        "Borçlar ve temel ihtiyaçlar zekat matrahından düşülür.",
        "Doğru hesaplama için tüm varlıkların değer tespiti hassas yapılmalıdır."
      ]
    },
    {
      id: "zakat-3",
      title: "Zekat Kimlere Verilir ve Adabı",
      content: "Zekat Tevbe Suresi 60. ayetinde belirtilen sekiz sınıfa verilir. Başta fakirler, miskinler, borçlular ve yolda kalmışlar gelir. Zekat verirken muhatabın onurunu incitmemek, başa kakmamak ve gizliliğe riayet etmek ibadetin kabulü için en önemli adaptır.",
      verses: [
        {
          arabic: "إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ ۖ فَرِيضَةً مِنَ اللَّهِ",
          turkish: "Sadakalar (zekatlar), Allah'tan bir farz olarak ancak fakirler, düşkünler, zekat toplama memurları, kalpleri İslam'a ısındırılacak olanlar, özgürlüğünü yitirmiş köleler, borçlular, Allah yolundakiler ve yolda kalmış yolcular içindir. Allah hakkıyla bilendir, hüküm ve hikmet sahibidir.",
          source: "Tevbe Suresi, 60. Ayet"
        }
      ],
      keyPoints: [
        "Zekat verilirken en yakın muhtaç akrabadan başlanmalıdır (anne, baba, eş ve çocuklar hariç).",
        "İyilikleri başa kakarak iptal etmemek esastır.",
        "Mümkün mertebe gizli verilmesi riya tehlikesini önler."
      ]
    }
  ]
};

export const defaultTrainingModules: TrainingModule[] = [
  sadakaTrainingContent,
  tradeTrainingContent,
  zakahTrainingContent
];
