import type { LevelData } from './crossword';

export interface RealmDefinition {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  categories: string[];
}

export const REALMS: RealmDefinition[] = [
  {
    id: 'theme_1_rumah',
    name: 'Keseharian & Rumah',
    tag: 'Rumah & Rutinitas',
    subtitle: 'Benda ruang tamu, dapur, kamar tidur, pakaian, dan rutinitas keluarga',
    categories: ['Rumah'],
  },
  {
    id: 'theme_2_kuliner',
    name: 'Kuliner & Cita Rasa',
    tag: 'Makanan & Masakan',
    subtitle: 'Kudapan pasar, sarapan khas, sayur mayur, minuman rempah, dan buah tropis',
    categories: ['Kuliner'],
  },
  {
    id: 'theme_3_kota',
    name: 'Kota & Jelajah Daerah',
    tag: 'Kota Nusantara',
    subtitle: 'Jakarta, Bandung, Jogja, Solo, Surabaya, Medan, Padang, hingga Manado',
    categories: ['Kota'],
  },
  {
    id: 'theme_4_bangunan',
    name: 'Bangunan & Ruang Publik',
    tag: 'Tempat & Arsitektur',
    subtitle: 'Pasar rakyat, sekolah, rumah ibadah, perpustakaan, museum, dan stasiun',
    categories: ['Bangunan'],
  },
  {
    id: 'theme_5_sifat',
    name: 'Sifat, Watak & Karakter',
    tag: 'Karakter & Emosi',
    subtitle: 'Kebaikan budi pekerti, semangat juang, kejujuran, kebijaksanaan, dan empati',
    categories: ['Sifat'],
  },
  {
    id: 'theme_6_satwa',
    name: 'Satwa & Fauna Indonesia',
    tag: 'Dunia Fauna',
    subtitle: 'Fauna darat, burung berkicau, ikan air tawar, biota terumbu karang, dan serangga',
    categories: ['Satwa'],
  },
  {
    id: 'theme_7_profesi',
    name: 'Profesi & Karya Manusia',
    tag: 'Karya & Pekerjaan',
    subtitle: 'Guru pendidik, dokter kesehatan, petani pangan, koki lezat, dan seniman cipta',
    categories: ['Profesi'],
  },
  {
    id: 'theme_8_dolanan',
    name: 'Dolanan & Olahraga',
    tag: 'Permainan & Olahraga',
    subtitle: 'Congklak, layang-layang, kelereng, bulu tangkis, sepak bola, dan senam bugar',
    categories: ['Dolanan'],
  },
  {
    id: 'theme_9_transportasi',
    name: 'Transportasi & Mobilitas',
    tag: 'Kendaraan & Jalan',
    subtitle: 'Sepeda ontel, delman, kereta api, kapal laut feri, pesawat terbang, dan rambu',
    categories: ['Transportasi'],
  },
  {
    id: 'theme_10_alam',
    name: 'Bentang Alam & Semesta',
    tag: 'Bentang Bumi & Langit',
    subtitle: 'Puncak gunung, pantai ombak, sungai mengalir, hutan lindung, dan bintang gemintang',
    categories: ['Alam'],
  },
  {
    id: 'theme_11_teknologi',
    name: 'Teknologi & Gadget',
    tag: 'Gawai & Digital',
    subtitle: 'Ponsel pintar, laptop kerja, internet nirkabel, baterai daya, dan aplikasi',
    categories: ['Teknologi'],
  },
  {
    id: 'theme_12_hobi',
    name: 'Hobi & Kreativitas',
    tag: 'Seni & Kegemaran',
    subtitle: 'Membaca buku, berkebun bunga, melukis kanvas, fotografi, dan mendaki',
    categories: ['Hobi'],
  },
  {
    id: 'theme_13_musik',
    name: 'Musik, Nada & Irama',
    tag: 'Melodi & Irama',
    subtitle: 'Gitar berdawai, piano klasik, drum perkusi, seruling bambu, dan tangga nada',
    categories: ['Musik'],
  },
  {
    id: 'theme_14_belanja',
    name: 'Belanja & Pasar Modern',
    tag: 'Perniagaan & Niaga',
    subtitle: 'Swalayan, kasir pembayaran, diskon hemat, toko buku, dan warung tetangga',
    categories: ['Belanja'],
  },
  {
    id: 'theme_15_kesehatan',
    name: 'Kesehatan & Kebugaran',
    tag: 'Raga & Kebugaran',
    subtitle: 'Air putih segar, tidur cukup, sayur vitamin, senam pagi, dan pikiran positif',
    categories: ['Kesehatan'],
  },
  {
    id: 'theme_16_ipa',
    name: 'Ilmu Pengetahuan Alam',
    tag: 'Sains & Semesta',
    subtitle: 'Fotosintesis daun, gaya gravitasi bumi, magnet, siklus air, dan tata surya',
    categories: ['IPA'],
  },
  {
    id: 'theme_17_ips',
    name: 'Ilmu Pengetahuan Sosial',
    tag: 'Masyarakat & Budaya',
    subtitle: 'Rukun tetangga, gotong royong warga, silsilah keluarga, dan peta bumi',
    categories: ['IPS'],
  },
  {
    id: 'theme_18_pkn',
    name: 'Pendidikan Kewarganegaraan',
    tag: 'Nilai & Bangsa',
    subtitle: 'Garuda Pancasila, Bhinneka Tunggal Ika, bendera merah putih, dan demokrasi',
    categories: ['PKN'],
  },
  {
    id: 'theme_19_katakerja',
    name: 'Kosakata: Kata Kerja',
    tag: 'Aksi & Aktivitas',
    subtitle: 'Melangkah, belajar membaca, menanam benih, berolahraga, dan berkarya nyata',
    categories: ['KataKerja'],
  },
  {
    id: 'theme_20_katasifat',
    name: 'Kosakata: Kata Sifat',
    tag: 'Karakter & Rasa',
    subtitle: 'Budi pekerti luhur, perasaan gembira, cita rasa manis gurih, dan ketangguhan',
    categories: ['KataSifat'],
  },
  {
    id: 'theme_21_ekonomi',
    name: 'Ekonomi Dasar & Finansial',
    tag: 'Finansial & Usaha',
    subtitle: 'Pasar, perbankan, wirausaha, investasi masa depan, dan perdagangan antarbangsa',
    categories: ['Ekonomi'],
  },
  {
    id: 'theme_22_hukum',
    name: 'Hukum, Aturan & Keadilan',
    tag: 'Keadilan & Aturan',
    subtitle: 'Konstitusi negara, persidangan adil, pembelaan hak asasi, dan kepatuhan norma',
    categories: ['Hukum'],
  },
  {
    id: 'theme_23_politik',
    name: 'Politik & Tata Negara',
    tag: 'Negara & Kebijakan',
    subtitle: 'Sistem demokrasi, pemilihan umum, dewan rakyat, kebijakan publik, dan diplomasi',
    categories: ['Politik'],
  },
  {
    id: 'theme_24_antropologi',
    name: 'Antropologi & Peradaban',
    tag: 'Budaya & Manusia',
    subtitle: 'Jejak sejarah prasejarah, aksara bahasa, silsilah kekerabatan, dan kearifan lokal',
    categories: ['Antropologi'],
  },
  {
    id: 'theme_25_psikologi',
    name: 'Psikologi & Perilaku',
    tag: 'Jiwa & Pikiran',
    subtitle: 'Ragam emosi, daya ingat memori, empati sosial, dan potensi kepribadian manusia',
    categories: ['Psikologi'],
  },
  {
    id: 'theme_26_astronomi',
    name: 'Astronomi & Tata Surya',
    tag: 'Bintang & Semesta',
    subtitle: 'Matahari, bulan purnama, planet tetangga, rasi bintang, teleskop, dan galaksi bima sakti',
    categories: ['Astronomi'],
  },
  {
    id: 'theme_27_geografi',
    name: 'Geografi & Bumi Pertiwi',
    tag: 'Bumi & Samudra',
    subtitle: 'Khatulistiwa tropis, benua dunia, samudra dalam, kutub es, gunung api, dan peta arah',
    categories: ['Geografi'],
  },
  {
    id: 'theme_28_sejarah',
    name: 'Sejarah & Jejak Peradaban',
    tag: 'Peradaban & Masa',
    subtitle: 'Penemuan roda dan api, prasasti kuno, kerajaan maritim, revolusi listrik, dan proklamasi',
    categories: ['Sejarah'],
  },
  {
    id: 'theme_29_ekologi',
    name: 'Ekologi & Kelestarian Bumi',
    tag: 'Kelestarian & Hijau',
    subtitle: 'Pilah sampah, daur ulang berkah, pupuk kompos, energi surya bersih, dan reboisasi pohon',
    categories: ['Ekologi'],
  },
  {
    id: 'theme_30_media',
    name: 'Komunikasi & Media Informasi',
    tag: 'Kabar & Teknologi',
    subtitle: 'Kantor pos, telepon rumah, radio siaran, televisi keluarga, jurnalisme, dan internet global',
    categories: ['Media'],
  },
  {
    id: 'theme_31_filosofi',
    name: 'Filsafat & Logika',
    tag: 'Filsafat & Berpikir',
    subtitle: 'Epistemologi hakikat ilmu, etika moral, logika silogisme, dialektika, dan filsuf agung',
    categories: ['Filosofi'],
  },
  {
    id: 'theme_32_fisika',
    name: 'Fisika Semesta & Energi',
    tag: 'Fisika & Semesta',
    subtitle: 'Gravitasi semesta, termodinamika kalor, relativitas waktu, mekanika kuantum, dan foton',
    categories: ['Fisika'],
  },
  {
    id: 'theme_33_kimia',
    name: 'Kimia & Materi Alam',
    tag: 'Kimia & Molekul',
    subtitle: 'Tabel periodik unsur, ikatan kovalen, reaksi redoks, polimer organik, larutan, dan katalis',
    categories: ['Kimia'],
  },
  {
    id: 'theme_34_sejarahdunia',
    name: 'Sejarah Peradaban Dunia',
    tag: 'Sejarah & Bangsa',
    subtitle: 'Lembah Mesopotamia, piramida Mesir kuno, polis Yunani, jalur sutra, dan revolusi industri',
    categories: ['Sejarah Dunia'],
  },
  {
    id: 'theme_35_biologimolekuler',
    name: 'Biologi Molekuler & Sel',
    tag: 'Genetika & Kehidupan',
    subtitle: 'Heliks ganda DNA, sintesis protein ribosom, mitosis sel, kode kodon, dan metabolisme enzim',
    categories: ['Biologi Molekuler'],
  },
  {
    id: 'theme_36_matematika',
    name: 'Matematika & Geometri',
    tag: 'Matematika & Angka',
    subtitle: 'Teorema Pythagoras, aljabar persamaan, kalkulus limit, fraktal, topologi, dan bilangan prima',
    categories: ['Matematika'],
  },
  {
    id: 'theme_37_nostalgia',
    name: 'Nostalgia Generasi 90 & 2000an',
    tag: 'Nostalgia & Jadul',
    subtitle: 'Kartun minggu pagi, era warnet biling, rental PS, jingle iklan TV, dan lagu hits',
    categories: ['Nostalgia'],
  },
  {
    id: 'theme_38_popculture',
    name: 'Pop Culture & Hiburan Dunia',
    tag: 'Pop Culture & Tren',
    subtitle: 'Film box office, komik manga, panggung konser musik akbar, dan tren gaya hidup',
    categories: ['Pop Culture'],
  },
  {
    id: 'theme_39_ensiklopedia',
    name: 'Fakta Unik & Ensiklopedia Dunia',
    tag: 'Dunia & Rekor',
    subtitle: 'Ibukota negara dunia, rekor alam terdalam, penemuan tak sengaja, dan 7 keajaiban dunia',
    categories: ['Ensiklopedia Dunia'],
  },
  {
    id: 'theme_40_faktanusantara',
    name: 'Fakta Unik Nusantara & Tokoh',
    tag: 'Nusantara & Tokoh',
    subtitle: 'Rekor kepulauan khatulistiwa, bapak bangsa pahlawan, satwa endemik, candi, dan rempah langka',
    categories: ['Fakta Nusantara'],
  },
  {
    id: 'theme_41_sastrabahasa',
    name: 'Sastra, Bahasa & Khazanah Kata',
    tag: 'Sastra & Kata',
    subtitle: 'Dongeng rakyat, hikmah fabel, peribahasa sehari-hari, sastrawan legendaris, dan kata serapan',
    categories: ['Sastra & Bahasa'],
  },
  {
    id: 'theme_42_karirfinansial',
    name: 'Karir, Dunia Kerja & Finansial Modern',
    tag: 'Karir & Finansial',
    subtitle: 'Profesi DKV kreatif, budaya kantor, pasar modal saham investor, wirausaha startup, dan etos kerja',
    categories: ['Karir & Finansial'],
  },
  {
    id: 'theme_43_agrariapangan',
    name: 'Agraria, Hayati & Pangan Nusantara',
    tag: 'Agraria & Hayati',
    subtitle: 'Lumbung padi sawah, peternakan rakyat, rimba hutan hujan, maritim nelayan, dan kebun kopi',
    categories: ['Agraria & Pangan'],
  },
  {
    id: 'theme_44_kriminologi',
    name: 'Kriminologi & Penegakan Keadilan',
    tag: 'Misteri & Hukum',
    subtitle: 'Kaca pembesar detektif, penyelidikan bukti sidik jari, ruang sidang hakim, dan ketertiban hukum',
    categories: ['Kriminologi'],
  },
  {
    id: 'theme_45_internasional',
    name: 'Hubungan Internasional & Diplomasi Bangsa',
    tag: 'Diplomasi & Global',
    subtitle: 'Kemitraan antarbangsa, konferensi organisasi dunia, paspor lintas batas, dan misi perdamaian',
    categories: ['Hubungan Internasional'],
  },
  {
    id: 'theme_46_senirupa',
    name: 'Seni Rupa, Desain & Arsitektur Nusantara',
    tag: 'Seni & Arsitektur',
    subtitle: 'Arsitektur rumah adat, ukiran kriya kayu, galeri lukisan maestro, dan estetika visual modern',
    categories: ['Seni & Arsitektur'],
  },
  {
    id: 'theme_47_olahraga',
    name: 'Olahraga Dunia & Pesta Prestasi',
    tag: 'Olahraga Dunia',
    subtitle: 'Bulutangkis All England, panggung Piala Dunia bola, pesta Olimpiade, arena stadion, dan sportivitas',
    categories: ['Olahraga Dunia'],
  },
  {
    id: 'theme_48_wisatanusantara',
    name: 'Wisata, Pelancongan & Pesona Nusantara',
    tag: 'Wisata Nusantara',
    subtitle: 'Raja Ampat, Danau Toba, kaldera Bromo, desa adat asri, geopark UNESCO, dan pantai tropis nusantara',
    categories: ['Wisata Nusantara'],
  },
  {
    id: 'theme_49_anatomi',
    name: 'Anatomi Manusia & Rahasia Tubuh',
    tag: 'Anatomi Tubuh',
    subtitle: 'Detak jantung, peredaran darah, paru-paru, panca indra, otak, jaringan saraf, dan rangka tulang',
    categories: ['Anatomi Manusia'],
  },
  {
    id: 'theme_50_kesehatangizi',
    name: 'Kesehatan, Gizi & Pola Hidup Sehat',
    tag: 'Kesehatan & Gizi',
    subtitle: 'Khazanah vitamin, piring gizi seimbang, hidrasi air mineral, senam kebugaran, dan tidur berkualitas',
    categories: ['Kesehatan & Gizi'],
  },
  {
    id: 'theme_51_duniadigital',
    name: 'Dunia Digital, Internet & Media Sosial',
    tag: 'Dunia Digital',
    subtitle: 'Jagat media sosial viral, belanja online dompet digital, keamanan siber, kreator konten, dan cloud',
    categories: ['Dunia Digital'],
  },
  {
    id: 'theme_52_bahasainggris',
    name: 'Kosakata Bahasa Inggris Menengah',
    tag: 'Bahasa Inggris',
    subtitle: 'Kosakata tindakan, karakter emosi, dunia pemikiran logika, kerja cerdas, dan interaksi sosial',
    categories: ['Bahasa Inggris Menengah'],
  },
  {
    id: 'theme_53_mitologi',
    name: 'Mitologi, Kisah Klasik & Legenda Dunia',
    tag: 'Mitologi & Kisah',
    subtitle: 'Dewa Olympus Yunani, dewa Viking Nordik, mitos Mesir Kuno, satwa berkah, ksatria pedang, dan legenda',
    categories: ['Mitologi Dunia'],
  },
  {
    id: 'theme_54_antariksa',
    name: 'Penjelajahan Antariksa & Misi Luar Angkasa',
    tag: 'Misi Antariksa',
    subtitle: 'Pendaratan Apollo di bulan, stasiun orbit ISS, robot penjelajah Mars, roket satelit, dan teleskop angkasa',
    categories: ['Penjelajahan Antariksa'],
  },
  {
    id: 'theme_55_kelautan',
    name: 'Kelautan, Oseanografi & Misteri Samudra',
    tag: 'Kelautan & Samudra',
    subtitle: 'Palung terdalam Mariana, pasang surut arus laut, raksasa samudra paus, segitiga terumbu karang, dan mangrove',
    categories: ['Kelautan & Samudra'],
  },
  {
    id: 'theme_56_cuacaiklim',
    name: 'Cuaca, Iklim & Dinamika Semesta',
    tag: 'Cuaca & Iklim',
    subtitle: 'Pusaran badai tropis tornado, erupsi magma vulkanik, gempa tektonik richter, dinamika El Nino, dan pelangi',
    categories: ['Cuaca & Iklim'],
  },
  {
    id: 'theme_57_kerajaannusantara',
    name: 'Kerajaan Kuno & Hikayat Nusantara',
    tag: 'Kerajaan Nusantara',
    subtitle: 'Kejayaan Majapahit Sumpah Palapa, armada Sriwijaya, Singasari Ken Arok, Mataram Kuno, dan prasasti lontar',
    categories: ['Kerajaan Nusantara'],
  },
  {
    id: 'theme_58_transportasikereta',
    name: 'Transportasi Kereta & Jalur Rel Relasi',
    tag: 'Jalur Rel Kereta',
    subtitle: 'Kereta cepat Whoosh Shinkansen, MRT LRT metropolitan, lokomotif uap antik, stasiun megah, dan perlintasan rel',
    categories: ['Transportasi Kereta'],
  },
  {
    id: 'theme_59_misterienigma',
    name: 'Misteri Populer & Enigma Legendaris Dunia',
    tag: 'Misteri & Enigma',
    subtitle: 'Misteri Segitiga Bermuda, piring terbang Area 51, benua hilang Atlantis, monster Nessie, dan garis Nazca',
    categories: ['Misteri Populer'],
  },
  {
    id: 'theme_60_farmakologi',
    name: 'Ilmu Farmasi, Obat & Terapi Medis',
    tag: 'Farmasi & Farmakologi',
    subtitle: 'Resep apoteker racikan puyer, antibiotik pereda nyeri, jamu herbal farmakope, dan vaksin antibodi perlindungan',
    categories: ['Farmasi & Farmakologi'],
  },
  {
    id: 'theme_61_ilmukomputer',
    name: 'Ilmu Komputer & Rekayasa Komputasi',
    tag: 'Ilmu Komputer',
    subtitle: 'Logika pemrograman algoritma, arsitektur jaringan protokol server, dan puncak mahakarya kecerdasan buatan',
    categories: ['Ilmu Komputer'],
  },
];

export function getRealmForCategory(category?: string): RealmDefinition {
  if (!category) return REALMS[0];
  const found = REALMS.find((r) => r.categories.includes(category));
  return found || REALMS[0];
}

export function getRealmForLevel(level: LevelData): RealmDefinition {
  return getRealmForCategory(level.category);
}

export function getLevelsByRealm(realmId: string, allLevels: LevelData[]): { level: LevelData; index: number }[] {
  const realm = REALMS.find((r) => r.id === realmId);
  if (!realm) return [];

  const results: { level: LevelData; index: number }[] = [];
  allLevels.forEach((level, index) => {
    if (level.category && realm.categories.includes(level.category)) {
      results.push({ level, index });
    }
  });

  return results;
}
