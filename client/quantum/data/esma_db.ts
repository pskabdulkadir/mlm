export interface EsmaVibe {
  id: string;
  name: string;
  transliteration: string;
  meaning: string;
  ebcedValue: number;
  cosmicFrequencyHz: number;
  targetAuraNode: string;
  spiritualImpact: string;
}

export const ESMA_VIBES: EsmaVibe[] = [
  {
    id: 'esma-allah',
    name: 'الله',
    transliteration: 'Ya Allah',
    meaning: 'Eşi benzeri olmayan, her şeyin mutlak yaratıcısı ve sığınağı.',
    ebcedValue: 66,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Bütün Aura Canlılığı (Genel)',
    spiritualImpact: 'Tüm niyetlerin kabulü, mutlak teslimiyet, hücrelerin birincil frekansı ile rezonans.'
  },
  {
    id: 'esma-rahman',
    name: 'الرَّحْمَنُ',
    transliteration: 'Ya Rahmân',
    meaning: 'Dünyadaki tüm yaratılanlara şefkat, merhamet ve ihsan gösteren.',
    ebcedValue: 298,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Kalp Çakrası (Şefkat)',
    spiritualImpact: 'Depresyon hissinin dindirilmesi, çevreye kucaklayıcı sevgi frekansı yayılımı.'
  },
  {
    id: 'esma-rahim',
    name: 'الرَّحِيمُ',
    transliteration: 'Ya Rahîm',
    meaning: 'Ahirette yalnız müminlere hususi rahmet ve ikramda bulunan.',
    ebcedValue: 258,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Timüs Bezi (Huzur)',
    spiritualImpact: 'Yoğun içsel huzur, korkulardan ve geleceğe dair kaygılardan arınma.'
  },
  {
    id: 'esma-melik',
    name: 'الْمَلِكُ',
    transliteration: 'Ya Melik',
    meaning: 'Kainatın mutlak hakimi ve tek yöneticisi, mülkün gerçek sahibi.',
    ebcedValue: 90,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Kök Çakra (Otorite)',
    spiritualImpact: 'İrade gücünün yükselmesi, hayatta sarsılmaz bir duruş ve vakar kazanma.'
  },
  {
    id: 'esma-kuddus',
    name: 'الْقُدُّوسُ',
    transliteration: 'Ya Kuddûs',
    meaning: 'Hatalardan, noksanlıklardan arınmış, her türlü parazit kirlerinden berî.',
    ebcedValue: 170,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Kök Çakra & Alın',
    spiritualImpact: 'Elektrosmog, radyasyon ve kötü enerjilerden auratik düzeyde tam temizlik.'
  },
  {
    id: 'esma-selam',
    name: 'السَّلَامُ',
    transliteration: 'Ya Selâm',
    meaning: 'Tehlikelerden selamete çıkaran, esenlik ve selamet veren.',
    ebcedValue: 131,
    cosmicFrequencyHz: 131,
    targetAuraNode: 'Boğaz & Tiroid Bezi',
    spiritualImpact: 'Kaygıları dindirme, asabiyet çözümü ve derin parasempatik gevşeme.'
  },
  {
    id: 'esma-mumin',
    name: 'الْمُؤْمِنُ',
    transliteration: 'Ya Mü\'min',
    meaning: 'Gönüllere iman ışığı veren, sığınanları koruyup emniyete kavuşturan.',
    ebcedValue: 137,
    cosmicFrequencyHz: 285,
    targetAuraNode: 'Kalp Meridyeni (Güven)',
    spiritualImpact: 'Panik atak niyetlerini yatıştırma, kendinden eminlik, şüphelerden kurtulma.'
  },
  {
    id: 'esma-muheymin',
    name: 'الْمُهَيْمِنُ',
    transliteration: 'Ya Müheymin',
    meaning: 'Gözetip koruyan, her şeyin gizli yönünü bilen, emniyet sunan.',
    ebcedValue: 145,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Alın Meridyeni (3. Göz)',
    spiritualImpact: 'Dış negatif tesirlerden ve elektrosunu parazitlerden tam korunma.'
  },
  {
    id: 'esma-aziz',
    name: 'الْعَزِيزُ',
    transliteration: 'Ya Azîz',
    meaning: 'Mağlup edilmesi imkansız olan, şerefi ve izzeti en yüce kılınan.',
    ebcedValue: 94,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Solar Pleksus (Özgüven)',
    spiritualImpact: 'Sosyal fobi engellerini eritme, asalet ve saygınlığın yükseltilmesi.'
  },
  {
    id: 'esma-cebbar',
    name: 'الْجَبَّارُ',
    transliteration: 'Ya Cebbâr',
    meaning: 'Kırılanları onaran, eksikleri tamamlayan, dilediğini zorla yaptıran.',
    ebcedValue: 206,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Sakral Çakra',
    spiritualImpact: 'Duygusal yaraları hızla kapatma, ruh parçalarını birleştirip dengelenme.'
  },
  {
    id: 'esma-mutekebbir',
    name: 'الْمُتَكَبِّرُ',
    transliteration: 'Ya Mütekebbir',
    meaning: 'Büyüklükte ve azamette her şeyden üstün, benzersiz ulu olan.',
    ebcedValue: 662,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Taç Çakra (Yüksek İdrak)',
    spiritualImpact: 'Küçük takıntıları aşma, hayata yüksek perdeden geniş açılı bakış imkanı.'
  },
  {
    id: 'esma-halik',
    name: 'الْخَالِقُ',
    transliteration: 'Ya Hâlık',
    meaning: 'Yaratan, yoktan var eden, karmaşık kaosları kozmosa düzenleyen.',
    ebcedValue: 731,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Sakral Çakra (Yaratım)',
    spiritualImpact: 'Yaratıcı zeka aktivasyonu, biyolojik saat senkronizasyonu.'
  },
  {
    id: 'esma-bari',
    name: 'الْبَارِئُ',
    transliteration: 'Ya Bâri\'',
    meaning: 'Her şeyi kusursuz, azasız ve birbirine uymlu şekilde meydana getiren.',
    ebcedValue: 213,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'DNA Yapısı (Hücre Çekirdeği)',
    spiritualImpact: 'Organlardaki asimetri dengesizliklerini ve dokusal yaraları onarma hızı.'
  },
  {
    id: 'esma-musavvir',
    name: 'الْمُصَوِّرُ',
    transliteration: 'Ya Musavvir',
    meaning: 'Tasarlayan, şekillendiren, her varlığa en güzel sureti bağışlayan.',
    ebcedValue: 336,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Gözler & Sanatsal Merkez Ara yüzü',
    spiritualImpact: 'Görsel estetik vizyonun gelişmesi, aura renklerinin parlaklaşması.'
  },
  {
    id: 'esma-gaffar',
    name: 'الْغَفَّارُ',
    transliteration: 'Ya Gaffâr',
    meaning: 'Mağfireti pek bol, günahları tekrar tekrar örten ve affeden.',
    ebcedValue: 1281,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Solar Pleksus (Suçluluk)',
    spiritualImpact: 'Bilinçaltındaki suçluluk, utanç ve geçmiş yas duygularının temizlenmesi.'
  },
  {
    id: 'esma-kahhar',
    name: 'الْقَهَّارُ',
    transliteration: 'Ya Kahhâr',
    meaning: 'Mutlak galip, düşmanları kahreden, kibirlileri dize getiren.',
    ebcedValue: 306,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Karın Zarı & Çakra Altı kalkanı',
    spiritualImpact: 'Ruhsal sömürücüleri, nazar ve negatif kanca enerjileri bertaraf etme.'
  },
  {
    id: 'esma-vehhab',
    name: 'الْوَهَّابُ',
    transliteration: 'Ya Vehhâb',
    meaning: 'Karşılıksız veren, bağış ve ihsanları sonsuz olan lütufkar.',
    ebcedValue: 14,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Kök Çakra (Bereket)',
    spiritualImpact: 'İçsel darlık ve kıtlık bilincinin yerini bolluk ve şükranla yer değiştirmesi.'
  },
  {
    id: 'esma-rezzak',
    name: 'الرَّزَّاقُ',
    transliteration: 'Ya Rezzâk',
    meaning: 'Her canlının rızkını veren, maddi-manevi besleyen ve doyuran.',
    ebcedValue: 308,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Mide Meridyeni',
    spiritualImpact: 'Maddi endişelerin çözülmesi, yeni rızık kapılarının açılması niyetleri.'
  },
  {
    id: 'esma-fettah',
    name: 'الْفَتَّاحُ',
    transliteration: 'Ya Fettâh',
    meaning: 'Her türlü tıkanıklığı açan, zafer ve çıkış kapıları var eden.',
    ebcedValue: 489,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Solar Pleksus (İrade)',
    spiritualImpact: 'Eski kader döngütakıntılarının erimesi, yeni ihtimallerin uyanması.'
  },
  {
    id: 'esma-alim',
    name: 'الْعَلِيمُ',
    transliteration: 'Ya Alîm',
    meaning: 'Görünmeyen ve görünen her şeyi, gizli sırlar dahil tam bilen.',
    ebcedValue: 150,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Alın (3. Göz)',
    spiritualImpact: 'Zeka berraklığı, hafızada güçlü idrak ve sezgisel yetenek akışı.'
  },
  {
    id: 'esma-kabid',
    name: 'الْقَابِضُ',
    transliteration: 'Ya Kâbıd',
    meaning: 'İstediğindeki rızkı ve canı sıkan, daraltan, imtihan eden.',
    ebcedValue: 903,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Karaciğer (Arınma)',
    spiritualImpact: 'Kontrol manyaklığını aşma, zor süreçlerde sabır gücünün yükselmesi.'
  },
  {
    id: 'esma-basit',
    name: 'الْبَاسِطُ',
    transliteration: 'Ya Bâsıt',
    meaning: 'Ruhu genişleten, ferahlık veren, bereketi yayan.',
    ebcedValue: 72,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Kalp Çakrası (Ferahlık)',
    spiritualImpact: 'Daralma, göğüs darlığı ve anksiyete hissiyatının hızlı onarılması.'
  },
  {
    id: 'esma-hafid',
    name: 'الْخَافِضُ',
    transliteration: 'Ya Hâfıd',
    meaning: 'Dereceleri alçaltan, zorbaları ve kibirlileri değersiz kılan.',
    ebcedValue: 1481,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Böbreküstü Bezleri',
    spiritualImpact: 'Kibir yükünden hafifleme, adil bir hayat algısına teslimiyet.'
  },
  {
    id: 'esma-rafi',
    name: 'الرَّافِعُ',
    transliteration: 'Ya Râfi\'',
    meaning: 'Dereceleri yükselten, şereflendiren ve göklere çıkaran.',
    ebcedValue: 351,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Timüs Bezi (Saygınlık)',
    spiritualImpact: 'Toplum içindeki saygınlığın ve manevi mertebenin yükselmesi.'
  },
  {
    id: 'esma-muizz',
    name: 'الْمُعِزُّ',
    transliteration: 'Ya Muizz',
    meaning: 'Dilediğine izzet, vakar ve üstün mertebe kazandıran.',
    ebcedValue: 117,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Boğaz & Tiroid',
    spiritualImpact: 'Kendini ifade yeteneği, kelimelerde ikna gücü ve vakar duruş.'
  },
  {
    id: 'esma-muzill',
    name: 'الْمُذِلُّ',
    transliteration: 'Ya Müzill',
    meaning: 'Dilediğini zelil eden, haksızları kibirlerinden vuran.',
    ebcedValue: 770,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Lenf Sistemi Detoksu',
    spiritualImpact: 'Kendisine haksızlık yapanların negatif yüklerinden kurtulma.'
  },
  {
    id: 'esma-semi',
    name: 'السَّمِيعُ',
    transliteration: 'Ya Semî\'',
    meaning: 'Her seslenişi en ince gizli fısıltısına kadar her an işiten.',
    ebcedValue: 180,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Kulaklar & Duyusal Sinirler',
    spiritualImpact: 'Akustik duyarlılık, duaların kabulü ve içsel derin sesleri duyma.'
  },
  {
    id: 'esma-basir',
    name: 'الْبَصِيرُ',
    transliteration: 'Ya Basîr',
    meaning: 'Her şeyi tüm detaylarıyla, karanlıktaki hiçbir şey saklı kalmamacasına gören.',
    ebcedValue: 302,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Alın Çakrası (Epifiz Gözü)',
    spiritualImpact: 'Doğruyu yanlıştan ayırt etme, rüyaların berraklaşması.'
  },
  {
    id: 'esma-hakem',
    name: 'الْحَكَمُ',
    transliteration: 'Ya Hakem',
    meaning: 'Mutlak hüküm sahibi, hak ve adaleti en adil biçimde tesis eden.',
    ebcedValue: 68,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Omurga Hattı (Hizalanma)',
    spiritualImpact: 'Kararsızlıklardan kurtulma, yaşamda netlik ve omurgalı duruş.'
  },
  {
    id: 'esma-adl',
    name: 'الْعَدْلُ',
    transliteration: 'Ya Adl',
    meaning: 'Hiç haksızlık yapmayan, her şeyi yerli yerine koyan derin adalet.',
    ebcedValue: 104,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Kalp & Akciğer Dengesi',
    spiritualImpact: 'Kaotik haksızlık şikayetini durdurma, hayat ritmini ilahi adalete teslim etme.'
  },
  {
    id: 'esma-latif',
    name: 'اللاَّطِيفُ',
    transliteration: 'Ya Latîf',
    meaning: 'Sonsuz lütufkar, en gizli inceliklere sızarak şifalandıran.',
    ebcedValue: 129,
    cosmicFrequencyHz: 129,
    targetAuraNode: 'Mide & İnce Bağırsak',
    spiritualImpact: 'Beklenmedik mucizelerin belirmesi, kronik kaygı ve hazımsızlığın giderilmesi.'
  },
  {
    id: 'esma-habir',
    name: 'الْخَبِيرُ',
    transliteration: 'Ya Habîr',
    meaning: 'Her şeyin iç yüzünden, perde arkasından anında haberdar olan.',
    ebcedValue: 812,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Merkezi Sinir Sistemi',
    spiritualImpact: 'Sezgilerin zirve uyarımı, rüyada haber alma niyetleri.'
  },
  {
    id: 'esma-halim',
    name: 'الْحَلِيمُ',
    transliteration: 'Ya Halîm',
    meaning: 'Hiddeti olmayan, cezalandırmada acele etmeyen sonsuz yumuşaklık.',
    ebcedValue: 88,
    cosmicFrequencyHz: 285,
    targetAuraNode: 'Amigdala (Korku Merkezi)',
    spiritualImpact: 'Hiddet, öfke patlamaları ve hormonal asabiyetin sıfırlanması.'
  },
  {
    id: 'esma-azim',
    name: 'الْعَظِيمُ',
    transliteration: 'Ya Azîm',
    meaning: 'Azameti, büyüklüğü karşısında akılların hayran kaldığı yücelik.',
    ebcedValue: 1020,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Kemik Dokusu (Omurga)',
    spiritualImpact: 'Gevşek özgüvensizlik hislerinin güçlü bir duruşa bürünmesi.'
  },
  {
    id: 'esma-gafur',
    name: 'الْغَفُورُ',
    transliteration: 'Ya Gafûr',
    meaning: 'Kusurları örten, bağışlaması sınır tanımayan sevecen.',
    ebcedValue: 1286,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Solar Pleksus (Pankreas)',
    spiritualImpact: 'Vicdan azabı, kendini hırpalama duygularının hücresel düzeyde silinmesi.'
  },
  {
    id: 'esma-sekur',
    name: 'الشَّكُورُ',
    transliteration: 'Ya Şekûr',
    meaning: 'Azıcık iyiliğe bile kat kat fazlasıyla ödül veren yüce cömert.',
    ebcedValue: 526,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Dalak (Kan ve Enerji Üretimi)',
    spiritualImpact: 'Şükran bilincinin yükselmesi, hayattaki bereketin logaritmik artması.'
  },
  {
    id: 'esma-aliyy',
    name: 'الْعَلِيُّ',
    transliteration: 'Ya Aliyy',
    meaning: 'Yüceler yücesi, kendisinden daha üstün hiçbir mertebe olmayan.',
    ebcedValue: 110,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Tepe Çakrası (Epifiz)',
    spiritualImpact: 'Manevi rütbe, anlayış ve kalitede mükemmelleşme.'
  },
  {
    id: 'esma-kebir',
    name: 'الْكَبِيرُ',
    transliteration: 'Ya Kebîr',
    meaning: 'Kibriya sahibi, büyüklüğü tarif edilemeyen ulu mutlaklık.',
    ebcedValue: 232,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Beyin Lobları',
    spiritualImpact: 'Kompleks yetersizlik travmalarını etkisiz hale getirme.'
  },
  {
    id: 'esma-hafiz',
    name: 'الْحَفِيظُ',
    transliteration: 'Ya Hafîz',
    meaning: 'Kainattaki her şeyi dengede tutarak felaketlerden koruyan.',
    ebcedValue: 998,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Aura Kalkanı Sınırları',
    spiritualImpact: 'Görünmez koruyucu kalkan, kaza ve belalardan eminlik niyeti.'
  },
  {
    id: 'esma-mukit',
    name: 'الْمُقِيتُ',
    transliteration: 'Ya Mukît',
    meaning: 'Her türlü canlının beden ve ruh gıdasını taksim eden.',
    ebcedValue: 550,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Sindirim Mekanizması',
    spiritualImpact: 'Hücrelerin biyofoton gıda emilimini ve vitamin dengesini düzenleme.'
  },
  {
    id: 'esma-hasib',
    name: 'الْحَسِيبُ',
    transliteration: 'Ya Hasîb',
    meaning: 'Hesap soran, her kulunun hayatındaki detayları adilce ölçen.',
    ebcedValue: 80,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Aritmetik Beyin Lobu',
    spiritualImpact: 'Karmaşanın toparlanması, zihinsel düzensizliğin sistematize edilmesi.'
  },
  {
    id: 'esma-celil',
    name: 'الْجَلِيلُ',
    transliteration: 'Ya Celîl',
    meaning: 'Celalet, azamet ve heybet sahibi, en yüce mertebeli.',
    ebcedValue: 73,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Kas Sistemi (Duruş)',
    spiritualImpact: 'İçsel zayıflığın giderilmesi, sarsılmaz bir ruhsal duruş.'
  },
  {
    id: 'esma-kerim',
    name: 'الْكَرِيمُ',
    transliteration: 'Ya Kerîm',
    meaning: 'Sonsuz cömertlik sahibi, hesapsızca lütuf bağışlayan.',
    ebcedValue: 270,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Kalp & Hücre Yenilenmesi',
    spiritualImpact: 'Sıkışmış cimrilik ve korkulardan arınıp bolluk deryasına açılma.'
  },
  {
    id: 'esma-rakib',
    name: 'الرَّقِيبُ',
    transliteration: 'Ya Rakîb',
    meaning: 'Her an gözetleyen, her varlığın her hareketini takip eden.',
    ebcedValue: 312,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Göz Kasları & Odak',
    spiritualImpact: 'Dikkat dağınıklığının önüne geçme, yüksek niyet odaklanması.'
  },
  {
    id: 'esma-mucib',
    name: 'الْمُجِيبُ',
    transliteration: 'Ya Mucîb',
    meaning: 'Kendine dua edenlerin samimi çağrılarına anında cevap veren.',
    ebcedValue: 55,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Boğaz (Ses Telleri)',
    spiritualImpact: 'İlahi kabul sınırının uyarılması, taleplerin tezahür hızı.'
  },
  {
    id: 'esma-vasic',
    name: 'الْوَاسِعُ',
    transliteration: 'Ya Vâsi\'',
    meaning: 'İlmi, merhameti ve zenginliği her şeyi kuşatacak kadar geniş.',
    ebcedValue: 137,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Akciğer Nefes Alanı',
    spiritualImpact: 'Darlık, sıkıntı ve klostrofobik krizlerin kalp genişliğiyle erimesi.'
  },
  {
    id: 'esma-hakim',
    name: 'الْحَكِيمُ',
    transliteration: 'Ya Hakîm',
    meaning: 'Her işi hikmetli, faydalı ve tam isabetli yapan mutlak akıl.',
    ebcedValue: 78,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Alın (3. Göz/Sezgi)',
    spiritualImpact: 'Hata yapma korkusunun aşılması, hikmetli kararlar alabilme kabiliyeti.'
  },
  {
    id: 'esma-vedud',
    name: 'الْوَدُودُ',
    transliteration: 'Ya Vedûd',
    meaning: 'Sevilmeye en layık olan, kullarını sonsuz sevgiyle sarmalayan.',
    ebcedValue: 20,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Kalp Çakrası (Sevgi)',
    spiritualImpact: 'İlişkilerde sevgi rezonansı, yalnızlık acısının ve nefret yükünün erimesi.'
  },
  {
    id: 'esma-mecid',
    name: 'الْمَجِيدُ',
    transliteration: 'Ya Mecîd',
    meaning: 'Şerefi çok yüce, asil, ikramı bol olan görkemli yaratan.',
    ebcedValue: 57,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Timüs Bezi',
    spiritualImpact: 'Toplumda asalet ve şerefle anılma, hücresel aura şanını parlatma.'
  },
  {
    id: 'esma-bais',
    name: 'الْبَاعِثُ',
    transliteration: 'Ya Bâis',
    meaning: 'Ölüleri dirilten, peygamberler gönderen, niyetleri uyandıran.',
    ebcedValue: 573,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Yenilenme Sistemi',
    spiritualImpact: 'Tükenmişlik, kronik depresyon ve uyuşukluğun hayati dinamizme dönmesi.'
  },
  {
    id: 'esma-sehid',
    name: 'الشَّهِيدُ',
    transliteration: 'Ya Şehîd',
    meaning: 'Her şeye şahit olan, hiçbir şeyi gözden kaçırmayan hakikat.',
    ebcedValue: 319,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Boğaz Meridyeni',
    spiritualImpact: 'Her an ilahi huzurda olduğunu bilmenin huzuru ve yalanlardan sıyrılma.'
  },
  {
    id: 'esma-hakk',
    name: 'الْحَقُّ',
    transliteration: 'Ya Hakk',
    meaning: 'Varlığı hiç değişmeyen, hakikatin ta kendisi olan sarsılmaz güç.',
    ebcedValue: 108,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Tüm Hücreler (Stabilite)',
    spiritualImpact: 'Zulüm, hayal kırıklığı ve yanılsama döngülerinden gerçeğe uyanış.'
  },
  {
    id: 'esma-vekil',
    name: 'الْوَكِيلُ',
    transliteration: 'Ya Vekîl',
    meaning: 'Kendisine tevekkül edenlerin işlerini en mükemmel şekilde çözen.',
    ebcedValue: 66,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Parasempatik Sistem',
    spiritualImpact: 'Aşırı kaygı verici yükleri ilahi sisteme devrederek hafifleme zirvesi.'
  },
  {
    id: 'esma-kaviyy',
    name: 'الْقَوِيُّ',
    transliteration: 'Ya Kaviyy',
    meaning: 'Kudreti sonsuz olan, asla yorulmayan mutlak güç kaynağı.',
    ebcedValue: 116,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Kas & İskelet Dayanıklılığı',
    spiritualImpact: 'Genel fiziksel halsizlik, tükeniş ve yılgınlığın sökülüp atılması.'
  },
  {
    id: 'esma-metin',
    name: 'الْمَتِينُ',
    transliteration: 'Ya Metîn',
    meaning: 'Çok sarsılmaz, hiçbir kuvvet tarafından sarsılamayan sapasağlam.',
    ebcedValue: 500,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Eklemler & Bağ Dokusu',
    spiritualImpact: 'Zorluklara karşı dayanıklılık, ruhsal omurganın dikey eğrisi.'
  },
  {
    id: 'esma-veliyy',
    name: 'الْوَلِيُّ',
    transliteration: 'Ya Veliyy',
    meaning: 'Sevdiklerinin dostu ve yardımcısı olan sığınılacak melce.',
    ebcedValue: 46,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Kalp Çakrası (Dostluk)',
    spiritualImpact: 'Yalnızlık hissinin kaybolması, sadık dost ve yardımcıların belirmesi.'
  },
  {
    id: 'esma-hamid',
    name: 'الْحَمِيدُ',
    transliteration: 'Ya Hamîd',
    meaning: 'Her türlü övgüye layık, şükran borçlu olunan biricik yaratan.',
    ebcedValue: 62,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Bilişsel Memnuniyet',
    spiritualImpact: 'Sürekli eleştiri ve şikayet asitliğini durdurup nötr homeostasis sağlama.'
  },
  {
    id: 'esma-muhsi',
    name: 'الْمُحْصِي',
    transliteration: 'Ya Muhsî',
    meaning: 'Yarattığı her şeyin sayısını teker teker bilen mutlak ölçücü.',
    ebcedValue: 148,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Analitik Beyin Merkezleri',
    spiritualImpact: 'Hafıza dağınıklığının elenmesi, sayısal zeka ve düzenleme.'
  },
  {
    id: 'esma-mubdi',
    name: 'الْمُبْدِئُ',
    transliteration: 'Ya Mübdî',
    meaning: 'Her şeyi maddesiz ve örneksiz olarak baştan yaratan.',
    ebcedValue: 56,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Girişimcilik & İrade',
    spiritualImpact: 'Yaratıcı tıkanıklıkları aşarak yeni projelere cesaretle başlama.'
  },
  {
    id: 'esma-muid',
    name: 'الْمُعِيدُ',
    transliteration: 'Ya Muîd',
    meaning: 'Hayatı bitenleri öldükten sonra tekrar diriltip iade eden.',
    ebcedValue: 124,
    cosmicFrequencyHz: 396,
    targetAuraNode: 'Hücresel Rejenerasyon',
    spiritualImpact: 'Eski güzel hallere rücu etme, kaybolan enerjinin geri celbi.'
  },
  {
    id: 'esma-muhyi',
    name: 'الْمُحْيِي',
    transliteration: 'Ya Muhyî',
    meaning: 'Can veren, hayat bağışlayan, ölü ruhları canlandıran.',
    ebcedValue: 46,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Mitokondri (Hücre Enerjisi)',
    spiritualImpact: 'Kronik yorgunluğun eritilmesi, her hücreye kozmik yaşama sevinci pompalanması.'
  },
  {
    id: 'esma-mumit',
    name: 'الْمُمِيتُ',
    transliteration: 'Ya Mümît',
    meaning: 'Can alan, ölümü yaratan, faniliği idrak ettiren.',
    ebcedValue: 490,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Detoks (Ölü Hücre Atımı)',
    spiritualImpact: 'Kanserli veya atık dokuların temizlenmesi, kötü huylardan feragat.'
  },
  {
    id: 'esma-hayy',
    name: 'الْحَيُّ',
    transliteration: 'Ya Hayy',
    meaning: 'Sonsuz ve sınırsız hayat sahibi, her an diri olan can.',
    ebcedValue: 18,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Timüs & Hayat Kaynağı',
    spiritualImpact: 'Yaşlanma karşıtı auratik titreşim, canlılık deryasında yüzme hissi.'
  },
  {
    id: 'esma-kayyum',
    name: 'الْقَيُّومُ',
    transliteration: 'Ya Kayyûm',
    meaning: 'Gökleri, yeri ve her şeyi ayakta tutan tek dayanak.',
    ebcedValue: 156,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Bacaklar & Kök İnançlar',
    spiritualImpact: 'Uykusuzluğun (insomnia) aşılması, hayatta dik ve dengede kalma yetisi.'
  },
  {
    id: 'esma-vacid',
    name: 'الْوَاجِدُ',
    transliteration: 'Ya Vâcid',
    meaning: 'Kendini arayan her şeyi anında bulan, hiçbir şeye muhtaç olmayan.',
    ebcedValue: 14,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Hissiyat Mekanı (Kalp)',
    spiritualImpact: 'Kayıp hissinin dindirilmesi, aranan manevi cevherlerin bulunması.'
  },
  {
    id: 'esma-macid',
    name: 'الْمَاجِدُ',
    transliteration: 'Ya Mâcid',
    meaning: 'Şanı, keremi, cömertliği sonsuz olan asil yaratan.',
    ebcedValue: 48,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Tiroid (İletişim)',
    spiritualImpact: 'Ruhsal asalet, yüzdeki nurun parlaması, aura genişliği.'
  },
  {
    id: 'esma-vahid',
    name: 'الْوَاحِدُ',
    transliteration: 'Ya Vâhid',
    meaning: 'Zatında, sıfatlarında, işlerinde tek olan benzersiz yaratıcı.',
    ebcedValue: 19,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Tepe Çakrası (Birleme)',
    spiritualImpact: 'Kafa karışıklığından ve vesveselerden arınıp tek bir hedefe kilitlenme.'
  },
  {
    id: 'esma-samed',
    name: 'الصَّمَدُ',
    transliteration: 'Ya Samed',
    meaning: 'Herkesin kendisine muhtaç olduğu, kendisinin kimseye muhtaç olmadığı sığınak.',
    ebcedValue: 134,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Kök Çakra (Bağımsızlık)',
    spiritualImpact: 'Bağımlılıklardan (sigara, internet, insan) özgürleşme gücü.'
  },
  {
    id: 'esma-kadir',
    name: 'الْقَادِرُ',
    transliteration: 'Ya Kâdir',
    meaning: 'Dilediğini dilediği gibi yapmaya gücü yeten mutlak muktedir.',
    ebcedValue: 305,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Böbrekler & İrade',
    spiritualImpact: 'Korkaklık hissiyatını ezme, üstün başarı potansiyelini tetikleme.'
  },
  {
    id: 'esma-muktedir',
    name: 'الْمُقْتَدِرُ',
    transliteration: 'Ya Muktedir',
    meaning: 'Güç sahipleri üzerinde dilediği gibi sarsılmaz tasarruf eden yönetici.',
    ebcedValue: 744,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Solar Pleksus (Güç)',
    spiritualImpact: 'Kader yollarını aşmadaki cesaret ve sarsılmaz mukavemet.'
  },
  {
    id: 'esma-mukaddim',
    name: 'الْمُقَدِّمُ',
    transliteration: 'Ya Mukaddim',
    meaning: 'Dilediğini öne alan, yükselten, öne geçiren öncü kuvvet.',
    ebcedValue: 184,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Ön Beyin Lobu (Vizyon)',
    spiritualImpact: 'Hayatta adımları hızlandırma, rakiplerinden öne geçme vesilesi.'
  },
  {
    id: 'esma-muahhir',
    name: 'الْمُؤَخِّرُ',
    transliteration: 'Ya Muahhir',
    meaning: 'Dilediğini geriye bırakan, erteleyen, yavaşlatan.',
    ebcedValue: 846,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Büyük Bağırsak (Bırakma)',
    spiritualImpact: 'Acelecilik hastalığını tedavi, sükuneti yakalayabilme.'
  },
  {
    id: 'esma-evvel',
    name: 'الأَوَّلُ',
    transliteration: 'Ya Evvel',
    meaning: 'İptidası olmayan, zamandan ve mekandan önce de var olan ilk.',
    ebcedValue: 37,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Zaman Algısı (Zihin)',
    spiritualImpact: 'Erteleme huylarını yenme, hayırlı işlere ilk adımı atabilme gücü.'
  },
  {
    id: 'esma-ahir',
    name: 'الآخِرُ',
    transliteration: 'Ya Âhir',
    meaning: 'İntihası olmayan, her şey yok olduktan sonra da baki kalan son.',
    ebcedValue: 801,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Hafıza Arşivi',
    spiritualImpact: 'Ölüm korkusunu yenme, bitirilmesi gereken işleri başarıyla nihayete erdirme.'
  },
  {
    id: 'esma-zahir',
    name: 'الظَّاهِرُ',
    transliteration: 'Ya Zâhir',
    meaning: 'Kainattaki sayısız delillerle varlığı apaçık ortada olan dış yüzey.',
    ebcedValue: 1106,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Cilt & Dış Aura Katmanı',
    spiritualImpact: 'Gizli düşmanların bertaraf olması, hakikatin gün yüzüne çıkması.'
  },
  {
    id: 'esma-batin',
    name: 'الْبَاطِنُ',
    transliteration: 'Ya Bâtın',
    meaning: 'Duyulardan, akıllardan gizli olan, her şeyin iç yüzünü kuşatan.',
    ebcedValue: 62,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Sezgisel Derinlik',
    spiritualImpact: 'Nefsin gizli oyunlarını fark etme, gizemli ilimlere yatkınlık.'
  },
  {
    id: 'esma-vali',
    name: 'الْوَالِي',
    transliteration: 'Ya Vâlî',
    meaning: 'Mülkü ve kainatı tek başına yönetip çekip çeviren idareci.',
    ebcedValue: 47,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Koordinasyon Merkezi',
    spiritualImpact: 'Ev veya iş idaresinde otoritenin ve uyumun artması.'
  },
  {
    id: 'esma-muteali',
    name: 'الْمُتَعَالِي',
    transliteration: 'Ya Müteâlî',
    meaning: 'Eksikliklerden ve mahlukat tasavvurundan çok çok yüce ulu.',
    ebcedValue: 541,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Taç Çakra',
    spiritualImpact: 'Maddi dertlerin üzerine çıkarak kuşbakışı manevi ferahlık kazanma.'
  },
  {
    id: 'esma-berr',
    name: 'الْبَرُّ',
    transliteration: 'Ya Berr',
    meaning: 'İyiliği ve ihsanı bol olan, yarattıklarına kolaylık dileyen.',
    ebcedValue: 202,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Göğüs & Esenlik',
    spiritualImpact: 'Talihsizlik blokajlarının kırılarak işlerin rast gitmesi.'
  },
  {
    id: 'esma-tevvab',
    name: 'التَّوَّابُ',
    transliteration: 'Ya Tevvâb',
    meaning: 'Tövbeleri çokça kabul eden, günah kirlerini pişmanlıkla silen.',
    ebcedValue: 409,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Solar Pleksus (Arınma)',
    spiritualImpact: 'Sürekli kendini hırpalayan pişmanlık hissiyatının hayırlı değişime dönmesi.'
  },
  {
    id: 'esma-muntekim',
    name: 'الْمُنْتَقِمُ',
    transliteration: 'Ya Müntekım',
    meaning: 'Haksızlığa uğrayanların intikamını adilce alan adaletin kendisi.',
    ebcedValue: 630,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Adrenalin Bezleri',
    spiritualImpact: 'Kendisine haksızlık yapanların şerrinden tamamen eminlik.'
  },
  {
    id: 'esma-afuvv',
    name: 'العَفُوُّ',
    transliteration: 'Ya Afüvv',
    meaning: ' canı gönülden affeden, günah izlerini defterden tamamen silen.',
    ebcedValue: 156,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Kalp Çakrası (Affediş)',
    spiritualImpact: 'Geçmiş insanlara karşı duyulan kin, nefret yüklerinden sıyrılıp özgürleşme.'
  },
  {
    id: 'esma-rauf',
    name: 'الرَّؤُوفُ',
    transliteration: 'Ya Raûf',
    meaning: 'Çok şefkatli, merhametiyle kullarının dertlerini anında yatıştıran.',
    ebcedValue: 286,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Timüs Salyası (Şefkat)',
    spiritualImpact: 'İçsel katılık ve öfkenin eriyerek yerine yumuşak başlılık gelmesi.'
  },
  {
    id: 'esma-malikul-mulk',
    name: 'مَالِكُ الْمُلْكِ',
    transliteration: 'Ya Mâlikü\'l-Mülk',
    meaning: 'Maddi-manevi tüm mülkün ebedi tek sahibi ve mutlak yöneticisi.',
    ebcedValue: 212,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Kök Çakra (Varlık)',
    spiritualImpact: 'Zenginlik, mal-mülk edinme niyetleri, iflas korkusunu yenme.'
  },
  {
    id: 'esma-zulcelali',
    name: 'ذُو الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: 'Ya Zü\'l-Celâli ve\'l-İkrâm',
    meaning: 'Hem heybet, azamet hem de cömertlik, ikram sahibi ulu ilah.',
    ebcedValue: 1100,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Kalp & Alın (Bütünlük)',
    spiritualImpact: 'Tüm duaları kilitleyen şahane rezonans, her kapının kolayca açılması.'
  },
  {
    id: 'esma-muksit',
    name: 'الْمُقْسِطُ',
    transliteration: 'Ya Muksit',
    meaning: 'Mazlumun hakkını zalimden alan, işleri tam dengede ve adaletle kuran.',
    ebcedValue: 209,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Denge / Beyincik',
    spiritualImpact: 'İçsel vesveselerin dinmesi, aile ve iş yaşantısında tam adil denge.'
  },
  {
    id: 'esma-cami',
    name: 'الْجَامِعُ',
    transliteration: 'Ya Câmi\'',
    meaning: 'Birbirine zıt şeyleri bir araya getiren, dilediğini dilediği an toplayan.',
    ebcedValue: 114,
    cosmicFrequencyHz: 639,
    targetAuraNode: 'Toplumsal Rezonans (Kalp)',
    spiritualImpact: 'Ayrılanların kavuşması, sevilen dostların ve kısmetlerin bir araya gelmesi.'
  },
  {
    id: 'esma-gani',
    name: 'الْغَنِيُّ',
    transliteration: 'Ya Ganî',
    meaning: 'Hiçbir şeye muhtaç olmayan sonsuz mutlak zenginlik kaynağı.',
    ebcedValue: 1060,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Bolluk Bilinci (Kök)',
    spiritualImpact: 'İçsel ve dışsal hiçbir şeye eyvallahı olmama, büyük maddi özgürlük.'
  },
  {
    id: 'esma-mugni',
    name: 'الْمُغْنِي',
    transliteration: 'Ya Muğnî',
    meaning: 'Dilediğini zengin kılan, kalplere içsel zenginlik ve doyum veren.',
    ebcedValue: 1100,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Kök & Sakral Çakra',
    spiritualImpact: 'Yoksulluk endişesini silme, bereket enerjisinin auraya akışı.'
  },
  {
    id: 'esma-mani',
    name: 'الْمَانِعُ',
    transliteration: 'Ya Mâni\'',
    meaning: 'Zararlı şeylerin gerçekleşmesine izin vermeyen, engelleyen koruyucu.',
    ebcedValue: 161,
    cosmicFrequencyHz: 417,
    targetAuraNode: 'Savunma Sistemi (Aura Kalkanı)',
    spiritualImpact: 'Dıştan gelecek kazalara ve kötü niyetli enerjilere ilahi barikat çekme.'
  },
  {
    id: 'esma-darr',
    name: 'الضَّارُّ',
    transliteration: 'Ya Dârr',
    meaning: 'Eziyet veren, zarar verici şeyleri de imtihan için yaratan hakim.',
    ebcedValue: 1001,
    cosmicFrequencyHz: 174,
    targetAuraNode: 'Böbreküstü Bezleri',
    spiritualImpact: 'Sıkıntılı süreçlerden alınacak dersleri idrak edip hızla çıkma.'
  },
  {
    id: 'esma-nafi',
    name: 'النَّافِعُ',
    transliteration: 'Ya Nâfi\'',
    meaning: 'Faydalı şeyleri yaratan, kullarına her an hayırlar dokunduran.',
    ebcedValue: 201,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Sinir Ağları (Genel)',
    spiritualImpact: 'Hastalıkların şifaya dönmesi, her işin hayırla neticelenmesi.'
  },
  {
    id: 'esma-nur',
    name: 'النُّورُ',
    transliteration: 'Ya Nûr',
    meaning: 'Alemleri nurlandıran, gönüllere berraklık ve hidayet bağışlayan.',
    ebcedValue: 256,
    cosmicFrequencyHz: 528,
    targetAuraNode: 'Tepe Noktası (Epifiz)',
    spiritualImpact: 'Derin karanlıktan çıkış, aurada göz kamaştırıcı parlaklık uyarımı.'
  },
  {
    id: 'esma-hadi',
    name: 'الهَادِي',
    transliteration: 'Ya Hâdî',
    meaning: 'Hidayete erdiren, kullarına doğru yolu en latif şekilde gösteren.',
    ebcedValue: 20,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Sezgi Lobu (Üçüncü Göz)',
    spiritualImpact: 'Yanlış yollardan, kötü alışkanlıklardan sıyrılıp hakikati bulma.'
  },
  {
    id: 'esma-bedic',
    name: 'الْبَدِيعُ',
    transliteration: 'Ya Bedî\'',
    meaning: 'Benzersiz, örneksiz ve hayranlık uyandırıcı sanatsal güzellikler var eden.',
    ebcedValue: 86,
    cosmicFrequencyHz: 741,
    targetAuraNode: 'Yaratıcı Zeka Küresi',
    spiritualImpact: 'Sanatsal ilham tıkanıklıklarını söküp atma, deha seviyesi fikir üretimi.'
  },
  {
    id: 'esma-baki',
    name: 'الْبَاقِي',
    transliteration: 'Ya Bâkî',
    meaning: 'Varlığının sonu olmayan, ebediyen kalıcı olan yegane güç.',
    ebcedValue: 113,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Hücre Ömrü Uzatımı',
    spiritualImpact: 'Geçici dünya streslerini küçümseyip ebedi huzuru yakalama hali.'
  },
  {
    id: 'esma-varis',
    name: 'الْوَارِثُ',
    transliteration: 'Ya Vâris',
    meaning: 'Mülkün hakiki sahibi, her şey fani olduğunda mülkü geri alan.',
    ebcedValue: 707,
    cosmicFrequencyHz: 432,
    targetAuraNode: 'Sakral & Kök Çakra',
    spiritualImpact: 'Gelecek nesillere hayırlı miraslar bırakma, rızkı garantiye alma.'
  },
  {
    id: 'esma-resid',
    name: 'الرَّشِيدُ',
    transliteration: 'Ya Reşîd',
    meaning: 'Doğru yolu en iyi gösteren, her işi mükemmel bir nizam içinde yürüten.',
    ebcedValue: 514,
    cosmicFrequencyHz: 852,
    targetAuraNode: 'Alın Çakrası',
    spiritualImpact: 'Hata yapmadan, pushesiz ve en mantıklı kararları sırayla uygulama.'
  },
  {
    id: 'esma-sabur',
    name: 'الصَّبُورُ',
    transliteration: 'Ya Sabûr',
    meaning: 'Çok sabırlı, cezalandırmada acele etmeyip kullarına zaman tanıyan.',
    ebcedValue: 298,
    cosmicFrequencyHz: 285,
    targetAuraNode: 'Sinir Hücreleri Yatıştırma',
    spiritualImpact: 'Sabırsızlık asabiyetini nötralize etme, zor imtihanları sükunetle kazanma.'
  }
];
