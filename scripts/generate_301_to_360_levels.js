import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const new60Levels = [
  // =========================================================================
  // --- TEMA 31: FILOSOFI (Bab 301–310) ---
  // =========================================================================
  {
    id: 'level_301_epistemologi_dan_kebenaran',
    title: 'Epistemologi & Hakikat Kebenaran',
    category: 'Filosofi',
    words: [
      { answer: 'BENAR', clue: 'Kesesuaian antara pikiran dengan kenyataan objektif' },
      { answer: 'ILMU', clue: 'Pengetahuan sistematis yang teruji kebenarannya' },
      { answer: 'FAKTA', clue: 'Hal atau keadaan nyata yang benar-benar ada' },
      { answer: 'LOGIKA', clue: 'Ilmu kecakapan berpikir lurus dan teratur' },
      { answer: 'KRITIS', clue: 'Sifat menimbang secara mendalam sebelum percaya' },
      { answer: 'AKAL', clue: 'Daya pikir manusia untuk memahami hakikat kenyataan' },
      { answer: 'BUKTI', clue: 'Sesuatu yang menyatakan kebenaran suatu peristiwa' },
      { answer: 'TAHU', clue: 'Kondisi kesadaran memahami suatu informasi' },
    ],
  },
  {
    id: 'level_302_etika_moral_dan_kebajikan',
    title: 'Etika & Kebajikan Moral',
    category: 'Filosofi',
    words: [
      { answer: 'MORAL', clue: 'Ajaran tentang baik buruk yang diterima masyarakat' },
      { answer: 'ETIKA', clue: 'Ilmu tentang apa yang baik dan kewajiban akhlak' },
      { answer: 'BAIK', clue: 'Sifat terpuji yang membawa manfaat dan kedamaian' },
      { answer: 'NURANI', clue: 'Suara batin yang membimbing tindakan manusia' },
      { answer: 'ADIL', clue: 'Tidak berat sebelah dan meletakkan sesuatu pada tempatnya' },
      { answer: 'JUJUR', clue: 'Lurus hati tidak berbohong dan tidak curang' },
      { answer: 'NILAI', clue: 'Tolok ukur kebaikan yang dijunjung tinggi budi pekerti' },
    ],
  },
  {
    id: 'level_303_dialektika_sokrates',
    title: 'Dialektika & Tanya Jawab Sokrates',
    category: 'Filosofi',
    words: [
      { answer: 'TANYA', clue: 'Ungkapan rasa ingin tahu untuk menggali pemahaman' },
      { answer: 'JAWAB', clue: 'Tanggapan atas pertanyaan yang diajukan dalam dialog' },
      { answer: 'DIALOG', clue: 'Percakapan bertukar pikiran mencari kebenaran' },
      { answer: 'KATA', clue: 'Unsur bahasa pengungkap isi gagasan pikiran' },
      { answer: 'MAKNA', clue: 'Arti terdalam yang tersirat di balik setiap ungkapan' },
      { answer: 'RAGU', clue: 'Sikap awal bertanya sebelum menemukan kepastian' },
      { answer: 'PAHAM', clue: 'Kondisi mengerti secara tuntas duduk perkara' },
    ],
  },
  {
    id: 'level_304_rasionalisme_descartes',
    title: 'Rasionalisme & Daya Pikiran',
    category: 'Filosofi',
    words: [
      { answer: 'PIKIR', clue: 'Aktivitas budi mengolah ide dan menarik simpulan' },
      { answer: 'KERAGUAN', clue: 'Metode mempertanyakan segala hal demi kepastian' },
      { answer: 'PASTI', clue: 'Kondisi yakin tanpa keraguan sedikit pun' },
      { answer: 'NYATA', clue: 'Bukan sekadar khayalan atau ilusi semata' },
      { answer: 'SADAR', clue: 'Kondisi ingat dan mengetahui keberadaan diri' },
      { answer: 'IDE', clue: 'Rancangan murni yang tersusun dalam pikiran' },
      { answer: 'RASA', clue: 'Tanggapan indrawi yang perlu diuji oleh akal sehat' },
    ],
  },
  {
    id: 'level_305_empirisme_pengalaman_nyata',
    title: 'Empirisme & Jejak Pengalaman',
    category: 'Filosofi',
    words: [
      { answer: 'INDRA', clue: 'Alat tubuh penerima rangsang seperti mata dan telinga' },
      { answer: 'ALAMI', clue: 'Berasal langsung dari kejadian alam nyata di sekitar' },
      { answer: 'LIHAT', clue: 'Mengamati dengan indra penglihatan mata' },
      { answer: 'DENGAR', clue: 'Menangkap getaran suara dengan telinga' },
      { answer: 'SENTUH', clue: 'Merasakan permukaan benda dengan indra peraba' },
      { answer: 'CERMIN', clue: 'Kiasan pikiran yang merefleksikan pengalaman hidup' },
      { answer: 'DATA', clue: 'Catatan fakta hasil pengamatan empiris di lapangan' },
    ],
  },
  {
    id: 'level_306_eksistensialisme_kebebasan',
    title: 'Eksistensialisme & Kebebasan Diri',
    category: 'Filosofi',
    words: [
      { answer: 'BEBAS', clue: 'Kondisi leluasa menentukan pilihan tanpa paksaan' },
      { answer: 'PILIH', clue: 'Menentukan satu keputusan dari berbagai alternatif' },
      { answer: 'TANGGUNG', clue: 'Sikap memikul konsekuensi atas pilihan hidup' },
      { answer: 'MAKNA', clue: 'Tujuan hidup yang diciptakan oleh tindakan sendiri' },
      { answer: 'JIWA', clue: 'Hakikat batin manusia yang merasakan kehendak' },
      { answer: 'JALAN', clue: 'Arah pilihan langkah hidup yang ditempuh seseorang' },
      { answer: 'BERANI', clue: 'Sifat tabah menghadapi ketidakpastian masa depan' },
    ],
  },
  {
    id: 'level_307_stoikisme_ketenangan_batin',
    title: 'Stoikisme & Ketenangan Batin',
    category: 'Filosofi',
    words: [
      { answer: 'TENANG', clue: 'Kondisi batin damai tidak mudah goyah oleh badai' },
      { answer: 'KENDALI', clue: 'Kemampuan menguasai emosi dan respons diri' },
      { answer: 'SABAR', clue: 'Tahan menghadapi cobaan tanpa mengeluh' },
      { answer: 'TERIMA', clue: 'Menerima kenyataan hidup yang tak bisa diubah' },
      { answer: 'IKHLAS', clue: 'Hati bersih melepaskan beban yang di luar kendali' },
      { answer: 'DAMAI', clue: 'Suasana tenteram tanpa kegelisahan yang mengusik' },
      { answer: 'BIJAK', clue: 'Pandai menempatkan diri dalam setiap situasi' },
    ],
  },
  {
    id: 'level_308_pragmatisme_buah_manfaat',
    title: 'Pragmatisme & Buah Manfaat',
    category: 'Filosofi',
    words: [
      { answer: 'MANFAAT', clue: 'Guna nyata yang dirasakan dari sebuah gagasan' },
      { answer: 'HASIL', clue: 'Buah akhir dari tindakan dan eksperimen nyata' },
      { answer: 'PRAKTIS', clue: 'Mudah diterapkan dalam kehidupan sehari-hari' },
      { answer: 'KERJA', clue: 'Usaha nyata untuk mewujudkan cita-cita' },
      { answer: 'EFEKTIF', clue: 'Mencapai tujuan secara tepat sasaran' },
      { answer: 'SOLUSI', clue: 'Jalan keluar yang berhasil mengatasi masalah' },
      { answer: 'UJI', clue: 'Mencoba gagasan dalam praktik di lapangan' },
    ],
  },
  {
    id: 'level_309_estetika_filsafat_keindahan',
    title: 'Estetika & Filosofi Keindahan',
    category: 'Filosofi',
    words: [
      { answer: 'INDAH', clue: 'Elok dipandang dan menyentuh kehalusan jiwa' },
      { answer: 'SENI', clue: 'Karya manusia yang memancarkan rasa keindahan' },
      { answer: 'SELERA', clue: 'Cita rasa batin dalam menilai keelokan rupa' },
      { answer: 'HARMONI', clue: 'Keselarasan nada dan bentuk yang menyejukkan hati' },
      { answer: 'KARYA', clue: 'Ciptaan orisinal buah perenungan yang mendalam' },
      { answer: 'CIPTA', clue: 'Kemampuan melahirkan karya baru penuh imajinasi' },
      { answer: 'RASA', clue: 'Kepekaan batin menangkap getaran pesona alam' },
    ],
  },
  {
    id: 'level_310_hikmah_kebijaksanaan_timur',
    title: 'Hikmah & Kebijaksanaan Timur',
    category: 'Filosofi',
    words: [
      { answer: 'HIKMAH', clue: 'Pelajaran berharga di balik setiap peristiwa kehidupan' },
      { answer: 'SELARAS', clue: 'Hidup menyatu dan rukun dengan alam semesta' },
      { answer: 'SEDERHANA', clue: 'Gaya hidup bersahaja yang membawa ketenteraman' },
      { answer: 'HENING', clue: 'Suasana sunyi tempat batin merenungi hakikat diri' },
      { answer: 'BUDI', clue: 'Kebaikan akhlak dan kepekaan nurani luhur' },
      { answer: 'ELING', clue: 'Kesadaran ingat akan kebajikan dan sang pencipta' },
      { answer: 'RUKUN', clue: 'Hubungan persaudaraan erat saling menghormati' },
    ],
  },

  // =========================================================================
  // --- TEMA 32: FISIKA (Bab 311–320) ---
  // =========================================================================
  {
    id: 'level_311_gravitasi_newton_semesta',
    title: 'Gravitasi Semesta Newton',
    category: 'Fisika',
    words: [
      { answer: 'TARIK', clue: 'Gaya gravitasi saling mendekatkan dua massa materi' },
      { answer: 'MASSA', clue: 'Jumlah materi yang terkandung dalam suatu benda' },
      { answer: 'GERAK', clue: 'Perubahan posisi benda terhadap titik acuan' },
      { answer: 'JATUH', clue: 'Gerak benda menuju pusat bumi karena gravitasi' },
      { answer: 'ORBIT', clue: 'Lintasan elips planet mengitari bintang induk' },
      { answer: 'GAYA', clue: 'Tarikan atau dorongan pengubah keadaan gerak' },
      { answer: 'BERAT', clue: 'Gaya gravitasi bumi yang bekerja pada massa benda' },
    ],
  },
  {
    id: 'level_312_termodinamika_dan_kalor',
    title: 'Termodinamika & Aliran Kalor',
    category: 'Fisika',
    words: [
      { answer: 'KALOR', clue: 'Energi panas yang berpindah karena perbedaan suhu' },
      { answer: 'SUHU', clue: 'Derajat panas atau dinginnya suatu zat atau ruangan' },
      { answer: 'KERJA', clue: 'Energi yang dihasilkan mesin saat memindahkan beban' },
      { answer: 'PANAS', clue: 'Kondisi energi kinetik partikel yang sangat tinggi' },
      { answer: 'DINGIN', clue: 'Kondisi energi kalor yang rendah pada suatu benda' },
      { answer: 'LEBUR', clue: 'Perubahan wujud zat dari padat menjadi cair' },
      { answer: 'UAP', clue: 'Bentuk gas dari air yang mendidih karena dipanaskan' },
    ],
  },
  {
    id: 'level_313_relativitas_ruang_dan_waktu',
    title: 'Relativitas Ruang & Waktu',
    category: 'Fisika',
    words: [
      { answer: 'WAKTU', clue: 'Dimensi temporal yang relatif terhadap kecepatan gerak' },
      { answer: 'RUANG', clue: 'Dimensi tempat benda-benda berada dan bergerak' },
      { answer: 'CEPAT', clue: 'Kelajuan tinggi yang mendekati kecepatan cahaya' },
      { answer: 'MASSA', clue: 'Ukuran materi yang setara dengan sejumlah energi' },
      { answer: 'ENERGI', clue: 'Kapasitas daya yang kekal abadi di alam semesta' },
      { answer: 'CAHAYA', clue: 'Kecepatan tertinggi di alam yang selalu konstan' },
      { answer: 'RELATIF', clue: 'Bergantung pada kerangka acuan sang pengamat' },
    ],
  },
  {
    id: 'level_314_mekanika_kuantum_mikro',
    title: 'Mekanika Kuantum Alam Mikro',
    category: 'Fisika',
    words: [
      { answer: 'ATOM', clue: 'Partikel dasar penyusun seluruh materi di dunia' },
      { answer: 'ELEKTRON', clue: 'Partikel bermuatan negatif yang mengelilingi inti atom' },
      { answer: 'FOTON', clue: 'Paket partikel kuantum pembawa energi cahaya' },
      { answer: 'INTI', clue: 'Pusat atom padat yang berisi proton dan neutron' },
      { answer: 'GELOMBANG', clue: 'Sifat perambatan energi yang dimiliki elektron' },
      { answer: 'PROBABLE', clue: 'Peluang kemungkinan letak partikel dalam awan atom' },
      { answer: 'SPIN', clue: 'Momentum sudut intrinsik dari partikel subatom' },
    ],
  },
  {
    id: 'level_315_elektromagnetik_dan_arus',
    title: 'Elektromagnetik & Arus Daya',
    category: 'Fisika',
    words: [
      { answer: 'LISTRIK', clue: 'Aliran muatan elektron penghantar energi daya' },
      { answer: 'MAGNET', clue: 'Benda yang mampu menarik logam besi di sekitarnya' },
      { answer: 'KUTUB', clue: 'Ujung magnet yang terbagi atas utara dan selatan' },
      { answer: 'ARUS', clue: 'Laju aliran muatan listrik dalam kawat penghantar' },
      { answer: 'TEGANGAN', clue: 'Beda potensial pendorong arus dalam rangkaian' },
      { answer: 'KABEL', clue: 'Kawat berisolator penyalur aliran energi listrik' },
      { answer: 'INDUKSI', clue: 'Pembangkitan arus listrik akibat medan magnet' },
    ],
  },
  {
    id: 'level_316_optika_dan_spektrum_cahaya',
    title: 'Optika & Spektrum Cahaya',
    category: 'Fisika',
    words: [
      { answer: 'LENSA', clue: 'Kaca bening melengkung pembias berkas cahaya' },
      { answer: 'BIAS', clue: 'Pembelokan arah cahaya saat melewati dua medium' },
      { answer: 'PANTUL', clue: 'Pembalikan arah cahaya saat mengenai cermin datar' },
      { answer: 'PRISMA', clue: 'Kaca segitiga pengurai cahaya putih jadi pelangi' },
      { answer: 'WARNA', clue: 'Kesan pada mata akibat frekuensi cahaya berbeda' },
      { answer: 'BAYANGAN', clue: 'Daerah gelap di balik benda yang terhalang sinar' },
      { answer: 'FOKUS', clue: 'Titik temu berkas cahaya setelah melalui lensa' },
    ],
  },
  {
    id: 'level_317_mekanika_fluida_dan_tekanan',
    title: 'Mekanika Fluida & Tekanan',
    category: 'Fisika',
    words: [
      { answer: 'TEKANAN', clue: 'Besarnya gaya yang bekerja pada satuan luas bidang' },
      { answer: 'ALIR', clue: 'Gerak zat cair atau gas menuruni pipa saluran' },
      { answer: 'APUNG', clue: 'Posisi benda terangkat di permukaan fluida air' },
      { answer: 'TENGGELAM', clue: 'Posisi benda turun ke dasar wadah air karena massa' },
      { answer: 'KAPILER', clue: 'Naiknya zat cair dalam pipa sempit kapiler' },
      { answer: 'MASSA', clue: 'Ukuran kerapatan materi per satuan volume fluida' },
      { answer: 'KENTAL', clue: 'Derajat kekentalan atau viskositas cairan madu' },
    ],
  },
  {
    id: 'level_318_akustik_dan_gelombang_bunyi',
    title: 'Akustik & Gelombang Bunyi',
    category: 'Fisika',
    words: [
      { answer: 'BUNYI', clue: 'Getaran gelombang longitudinal yang terdengar telinga' },
      { answer: 'GETAR', clue: 'Gerak bolak-balik partikel di sekitar titik seimbang' },
      { answer: 'NADA', clue: 'Tinggi rendah bunyi dengan frekuensi teratur' },
      { answer: 'GEMA', clue: 'Bunyi pantul yang terdengar jelas setelah bunyi asli' },
      { answer: 'AMPLITUDO', clue: 'Simpangan terjauh gelombang penentu kenyaringan' },
      { answer: 'DESIBEL', clue: 'Satuan ukuran tingkat kenyaringan intensitas suara' },
      { answer: 'RAPAT', clue: 'Daerah pemadatan partikel medium saat gelombang lewat' },
    ],
  },
  {
    id: 'level_319_astrofisika_dan_lubang_hitam',
    title: 'Astrofisika & Lubang Hitam',
    category: 'Fisika',
    words: [
      { answer: 'BINTANG', clue: 'Benda langit raksasa pembakar fusi nuklir hidrogen' },
      { answer: 'LUBANG', clue: 'Kawasan ruang dengan gravitasi ekstrem tak berujung' },
      { answer: 'FUSI', clue: 'Penggabungan inti atom ringan menjadi lebih berat' },
      { answer: 'GELAP', clue: 'Kondisi lubang hitam tempat cahaya pun tak bisa lolos' },
      { answer: 'DEBU', clue: 'Partikel kosmik pembentuk nebula calon bintang baru' },
      { answer: 'KOSMIK', clue: 'Segala hal yang berkaitan dengan keluasan jagat raya' },
      { answer: 'MASSA', clue: 'Kerapatan materi raksasa terkonsentrasi di satu titik' },
    ],
  },
  {
    id: 'level_320_hukum_kekekalan_energi',
    title: 'Hukum Kekekalan Energi',
    category: 'Fisika',
    words: [
      { answer: 'KEKAL', clue: 'Sifat energi yang tidak dapat dimusnahkan atau diciptakan' },
      { answer: 'UBAH', clue: 'Perubahan bentuk energi dari satu jenis ke jenis lain' },
      { answer: 'KINETIK', clue: 'Energi gerak yang dimiliki oleh benda yang meluncur' },
      { answer: 'POTENSIAL', clue: 'Energi simpanan benda karena ketinggian kedudukannya' },
      { answer: 'DAYA', clue: 'Laju usaha yang dilakukan dalam setiap satuan waktu' },
      { answer: 'MEKANIK', clue: 'Jumlah total antara energi kinetik dan potensial' },
      { answer: 'EFISIEN', clue: 'Tingkat kehematan mesin dalam memanfaatkan energi' },
    ],
  },

  // =========================================================================
  // --- TEMA 33: KIMIA (Bab 321–330) ---
  // =========================================================================
  {
    id: 'level_321_tabel_periodik_dan_unsur',
    title: 'Tabel Periodik & Unsur Alam',
    category: 'Kimia',
    words: [
      { answer: 'UNSUR', clue: 'Zat tunggal murni yang tak dapat diurai lebih sederhana' },
      { answer: 'ATOM', clue: 'Unit terkecil unsur yang mempertahankan sifat kimianya' },
      { answer: 'LOGAM', clue: 'Unsur berkilau penghantar panas dan listrik yang baik' },
      { answer: 'GAS', clue: 'Wujud materi renggang tanpa bentuk dan volume tetap' },
      { answer: 'GOLONGAN', clue: 'Kolom vertikal tabel periodik dengan kemiripan sifat' },
      { answer: 'PERIODE', clue: 'Baris horizontal tabel periodik penyusun jumlah kulit' },
      { answer: 'MASSA', clue: 'Nomor penunjuk berat atom relatif suatu unsur kimia' },
    ],
  },
  {
    id: 'level_322_ikatan_kimia_dan_senyawa',
    title: 'Ikatan Kimia & Senyawa Molekul',
    category: 'Kimia',
    words: [
      { answer: 'IKATAN', clue: 'Gaya tarik elektrostatik antar atom membentuk senyawa' },
      { answer: 'KOVALEN', clue: 'Ikatan hasil pemakaian bersama pasangan elektron atom' },
      { answer: 'IONIK', clue: 'Ikatan hasil serah terima elektron antara ion logam' },
      { answer: 'STABIL', clue: 'Kondisi atom mencapai susunan delapan elektron oktet' },
      { answer: 'SENYAWA', clue: 'Zat baru hasil gabungan dua atau lebih unsur kimia' },
      { answer: 'RUMUS', clue: 'Lambang susunan atom pembentuk molekul kimiawi' },
      { answer: 'POLAR', clue: 'Sifat molekul dengan distribusi muatan tak simetris' },
    ],
  },
  {
    id: 'level_323_reaksi_redoks_dan_elektron',
    title: 'Reaksi Redoks & Aliran Elektron',
    category: 'Kimia',
    words: [
      { answer: 'REDOKS', clue: 'Reaksi serentak antara reduksi dan oksidasi kimia' },
      { answer: 'OKSIDASI', clue: 'Proses pelepasan elektron atau pengikatan oksigen' },
      { answer: 'REDUKSI', clue: 'Proses penangkapan elektron oleh zat dalam reaksi' },
      { answer: 'KARAT', clue: 'Oksidasi besi akibat paparan udara basah dan oksigen' },
      { answer: 'ELEKTRON', clue: 'Partikel subatom negatif yang berpindah dalam redoks' },
      { answer: 'ANODA', clue: 'Kutub elektroda tempat berlangsungnya proses oksidasi' },
      { answer: 'KATODA', clue: 'Kutub elektroda tempat berlangsungnya proses reduksi' },
    ],
  },
  {
    id: 'level_324_asam_basa_dan_skala_ph',
    title: 'Asam, Basa & Derajat pH',
    category: 'Kimia',
    words: [
      { answer: 'ASAM', clue: 'Zat penghasil ion hidrogen dengan rasa masam tajam' },
      { answer: 'BASA', clue: 'Zat penghasil ion hidroksida yang licin dan pahit' },
      { answer: 'NETRAL', clue: 'Kondisi air murni dengan nilai pH tepat angka tujuh' },
      { answer: 'GARAM', clue: 'Senyawa hasil reaksi penetralan asam dengan basa' },
      { answer: 'LITMUS', clue: 'Kertas indikator penunjuk sifat asam atau basa' },
      { answer: 'LARUTAN', clue: 'Campuran homogen antara zat terlarut dan pelarut' },
      { answer: 'KOROSIF', clue: 'Sifat merusak jaringan dan logam pada asam pekat' },
    ],
  },
  {
    id: 'level_325_polimer_dan_kimia_organik',
    title: 'Polimer & Karbon Organik',
    category: 'Kimia',
    words: [
      { answer: 'KARBON', clue: 'Unsur istimewa bertangan empat tulang punggung hidup' },
      { answer: 'POLIMER', clue: 'Molekul raksasa rantai panjang gabungan monomer' },
      { answer: 'PLASTIK', clue: 'Polimer sintetis serbaguna yang mudah dibentuk' },
      { answer: 'RANTAI', clue: 'Untaian ikatan atom karbon membentuk kerangka molekul' },
      { answer: 'ORGANIK', clue: 'Cabang ilmu kimia yang mempelajari senyawa karbon' },
      { answer: 'KARET', clue: 'Polimer alam lentur dari getah pohon getah perca' },
      { answer: 'SERAT', clue: 'Bahan polimer benang seperti kapas dan nilon' },
    ],
  },
  {
    id: 'level_326_katalisis_dan_laju_reaksi',
    title: 'Katalisis & Kecepatan Reaksi',
    category: 'Kimia',
    words: [
      { answer: 'KATALIS', clue: 'Zat pemercepat laju reaksi tanpa ikut habis terkonsumsi' },
      { answer: 'CEPAT', clue: 'Laju reaksi yang berlangsung dalam hitungan detik' },
      { answer: 'LAMBAT', clue: 'Laju reaksi pengaratan yang memakan waktu berbulan' },
      { answer: 'ENZIM', clue: 'Biokatalis protein alami pengatur metabolisme tubuh' },
      { answer: 'SUHU', clue: 'Faktor pemanas peningkat energi tumbukan partikel' },
      { answer: 'TUMBUKAN', clue: 'Tabrakan efektif antar partikel penghasil reaksi' },
      { answer: 'LUAS', clue: 'Besarnya area permukaan serbuk pereaksi kimia' },
    ],
  },
  {
    id: 'level_327_larutan_dan_kelarutan',
    title: 'Larutan & Daya Larut',
    category: 'Kimia',
    words: [
      { answer: 'PELARUT', clue: 'Zat cair pembawa pelarut utama seperti air murni' },
      { answer: 'TERLARUT', clue: 'Zat padat yang terdispersi merata dalam pelarut' },
      { answer: 'JENUH', clue: 'Kondisi larutan yang tak mampu lagi melarutkan zat' },
      { answer: 'HOMOGEN', clue: 'Campuran serba sama tanpa bidang batas terpisah' },
      { answer: 'KONSENTRASI', clue: 'Kepekatan jumlah zat terlarut dalam cairan' },
      { answer: 'ENDAPAN', clue: 'Zat padat yang mengendap di dasar tabung reaksi' },
      { answer: 'ADUK', clue: 'Tindakan memutar cairan untuk mempercepat larut' },
    ],
  },
  {
    id: 'level_328_elektrokimia_dan_baterai',
    title: 'Elektrokimia & Sel Baterai',
    category: 'Kimia',
    words: [
      { answer: 'BATERAI', clue: 'Alat penyimpan energi kimia pengubah jadi listrik' },
      { answer: 'ELEKTROLIT', clue: 'Zat penghantar ion listrik dalam cairan baterai' },
      { answer: 'KUTUB', clue: 'Ujung positif dan negatif tempat aliran daya listrik' },
      { answer: 'ION', clue: 'Atom atau molekul yang bermuatan listrik positif negatif' },
      { answer: 'REAKSI', clue: 'Perubahan kimiawi spontan penyedia arus listrik' },
      { answer: 'CAS', clue: 'Mengisi ulang energi baterai dengan arus luar' },
      { answer: 'LITHIUM', clue: 'Logam alkali ringan bahan baku baterai gawai modern' },
    ],
  },
  {
    id: 'level_329_stoikiometri_dan_mol',
    title: 'Stoikiometri & Hitungan Mol',
    category: 'Kimia',
    words: [
      { answer: 'MOL', clue: 'Satuan hitung jumlah partikel zat kimia sebesar tetapan' },
      { answer: 'HITUNG', clue: 'Kalkulasi matematis perbandingan massa dalam reaksi' },
      { answer: 'SETARA', clue: 'Kondisi jumlah atom kiri sama dengan jumlah kanan' },
      { answer: 'KOEFISIEN', clue: 'Angka pengali di depan rumus kimia dalam persamaan' },
      { answer: 'VOLUME', clue: 'Ruang yang ditempati oleh satu mol gas ideal' },
      { answer: 'MASSA', clue: 'Besaran gram zat kimia yang dihitung dalam timbangan' },
      { answer: 'RUMUS', clue: 'Formula perbandingan mol unsur pembentuk senyawa' },
    ],
  },
  {
    id: 'level_330_kimia_hijau_dan_bumi',
    title: 'Kimia Hijau & Bumi Lestari',
    category: 'Kimia',
    words: [
      { answer: 'HIJAU', clue: 'Prinsip kimia ramah lingkungan demi kelestarian alam' },
      { answer: 'BERSIH', clue: 'Kondisi proses kimiawi tanpa limbah berbahaya' },
      { answer: 'AMAN', clue: 'Produk kimia yang tidak meracuni tubuh dan tanah' },
      { answer: 'DAUR', clue: 'Memproses ulang limbah polimer jadi bahan baru' },
      { answer: 'HEMAT', clue: 'Penggunaan energi minimal dalam sintesis senyawa' },
      { answer: 'BIODEGRADABEL', clue: 'Sifat bahan yang mudah diurai oleh mikroba tanah' },
      { answer: 'ALAMI', clue: 'Bahan baku nabati terbarukan pengganti minyak bumi' },
    ],
  },

  // =========================================================================
  // --- TEMA 34: SEJARAH DUNIA (Bab 331–340) ---
  // =========================================================================
  {
    id: 'level_331_lembah_mesopotamia_kuno',
    title: 'Lembah Sungai Mesopotamia',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'LEMBAH', clue: 'Dataran subur di antara sungai Tigris dan Efrat' },
      { answer: 'TULIS', clue: 'Penemuan huruf paku kuneiform pencatat sejarah' },
      { answer: 'RODA', clue: 'Penemuan bundar pengangkut barang perintis peradaban' },
      { answer: 'KOTA', clue: 'Pusat peradaban kuno seperti Ur dan Babilonia' },
      { answer: 'HUKUM', clue: 'Kitab undang-undang Hamurabi pemelihara ketertiban' },
      { answer: 'SUNGAI', clue: 'Sumber air irigasi pertanian penopang kehidupan' },
      { answer: 'TANAH', clue: 'Lempung liat tempat menorehkan aksara kuno' },
    ],
  },
  {
    id: 'level_332_peradaban_mesir_dan_piramida',
    title: 'Peradaban Mesir & Piramida Kuno',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'PIRAMIDA', clue: 'Bangunan batu segitiga raksasa makam firaun kuno' },
      { answer: 'FIRAUN', clue: 'Gelar raja penguasa tertinggi di tanah Mesir kuno' },
      { answer: 'NIL', clue: 'Sungai panjang penyuplai lumpur subur peradaban' },
      { answer: 'MAKAM', clue: 'Tempat peristirahatan abadi raja berhias relief emas' },
      { answer: 'BATU', clue: 'Balok granit kokoh penyusun monumen megah Mesir' },
      { answer: 'HIEROGLIF', clue: 'Aksara gambar piktograf warisan peradaban Nil' },
      { answer: 'MUMIA', clue: 'Jasad diawetkan dengan balsem rempah leluhur' },
    ],
  },
  {
    id: 'level_333_yunani_kuno_dan_demokrasi',
    title: 'Yunani Kuno & Lahirnya Demokrasi',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'DEMOKRASI', clue: 'Sistem pemerintahan rakyat yang lahir di Athena kuno' },
      { answer: 'POLIS', clue: 'Negara kota merdeka di jazirah Yunani kuno' },
      { answer: 'FILSUF', clue: 'Cendekiawan pencari hikmah seperti Plato dan Sokrates' },
      { answer: 'SUARA', clue: 'Hak pilih warga kota dalam majelis umum rakyat' },
      { answer: 'OLIMPIADE', clue: 'Pesta olahraga empat tahunan penghormatan dewa' },
      { answer: 'KUIL', clue: 'Bangunan pilar marmer megah pemujaan para dewa' },
      { answer: 'AKROPOLIS', clue: 'Bukit benteng batu bersejarah di jantung Athena' },
    ],
  },
  {
    id: 'level_334_imperium_romawi_megah',
    title: 'Imperium Romawi & Jalur Hukum',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'ROMA', clue: 'Ibu kota imperium kuno yang membentang tiga benua' },
      { answer: 'SENAT', clue: 'Lembaga perwakilan tetua penentu kebijakan hukum' },
      { answer: 'JALAN', clue: 'Rute batu lurus penghubung seluruh wilayah imperium' },
      { answer: 'KOLOSEUM', clue: 'Stadion gelanggang batu raksasa adu ketangkasan' },
      { answer: 'HUKUM', clue: 'Kaidah perdata Romawi landasan hukum modern dunia' },
      { answer: 'KOTA', clue: 'Pusat kemakmuran air mancur dan saluran air bersih' },
      { answer: 'KAISAR', clue: 'Gelar pemimpin monarki tertinggi kekaisaran Romawi' },
    ],
  },
  {
    id: 'level_335_jalur_sutra_perniagaan',
    title: 'Jalur Sutra & Niaga Lintas Benua',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'SUTRA', clue: 'Kain halus bernilai tinggi dari kepompong ulat' },
      { answer: 'JALUR', clue: 'Rute kafilah darat dari Asia Timur ke Mediterania' },
      { answer: 'PASAR', clue: 'Tempat bertukar rempah, kertas, dan gagasan budaya' },
      { answer: 'UNTA', clue: 'Hewan tangguh penyeberang padang pasir gurun luas' },
      { answer: 'REMPAH', clue: 'Komoditas berharga Nusantara yang dicari pedagang' },
      { answer: 'EMAS', clue: 'Logam mulia alat transaksi berharga lintas negara' },
      { answer: 'KAFILAH', clue: 'Rombongan musafir pedagang bersama unta pembawa muatan' },
    ],
  },
  {
    id: 'level_336_zaman_renaisans_kebangkitan',
    title: 'Renaisans & Kelahiran Kembali Ilmu',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'BANGKIT', clue: 'Lahirnya kembali kecintaan pada seni dan ilmu pengetahuan' },
      { answer: 'LUKIS', clue: 'Karya visual realis legendaris Leonardo da Vinci' },
      { answer: 'CETAK', clue: 'Penemuan mesin cetak Gutenberg penyebar buku massal' },
      { answer: 'KARYA', clue: 'Hasil ciptaan arsitektur patung dan sastra agung' },
      { answer: 'KOTA', clue: 'Firenze di Italia pusat kemakmuran seni renaisans' },
      { answer: 'ILMU', clue: 'Pengetahuan alam yang berkembang pesat bebas dogma' },
      { answer: 'MANUSIA', clue: 'Fokus gerakan humanisme yang menghargai akal budi' },
    ],
  },
  {
    id: 'level_337_revolusi_industri_mesin',
    title: 'Revolusi Industri & Era Mesin',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'MESIN', clue: 'Alat mekanis bertenaga uap pengganti tenaga otot' },
      { answer: 'UAP', clue: 'Energi panas air pendorong torak lokomotif pabrik' },
      { answer: 'BATUBARA', clue: 'Bahan bakar fosil hitam pembakar ketel uap industri' },
      { answer: 'PABRIK', clue: 'Gedung tempat ribuan barang diproduksi massal' },
      { answer: 'KERETA', clue: 'Kendaraan rel bertenaga uap pengangkut barang cepat' },
      { answer: 'KOTA', clue: 'Pusat urbanisasi tempat jutaan pekerja bermukim' },
      { answer: 'BURUH', clue: 'Kaum pekerja yang mengoperasikan mesin-mesin industri' },
    ],
  },
  {
    id: 'level_338_penjelajahan_samudra_dunia',
    title: 'Era Navigasi & Pelayaran Samudra',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'KOMPAS', clue: 'Alat jarum magnet penunjuk arah mata angin di laut' },
      { answer: 'KAPAL', clue: 'Perahu layar besar penjelajah samudra tak dikenal' },
      { answer: 'PETA', clue: 'Gambaran garis pantai benua pemandu pelayaran jauh' },
      { answer: 'LAYAR', clue: 'Kain penangkap hembusan angin penggerak armada' },
      { answer: 'SAMUDRA', clue: 'Lautan luas tak bertepi yang diarungi para pelaut' },
      { answer: 'BENUA', clue: 'Daratan baru yang ditemukan di seberang samudra' },
      { answer: 'BINTANG', clue: 'Rasi langit malam pedoman navigasi nakhoda kapal' },
    ],
  },
  {
    id: 'level_339_abad_pencerahan_akal',
    title: 'Abad Pencerahan & Hak Asasi',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'TERANG', clue: 'Kiasan pencerahan pikiran keluar dari kegelapan akal' },
      { answer: 'HAK', clue: 'Kewenangan asasi setiap individu sejak lahir ke dunia' },
      { answer: 'ADIL', clue: 'Prinsip kesetaraan martabat seluruh warga negara' },
      { answer: 'BUKU', clue: 'Ensiklopedia ilmu penyebar gagasan berpikir merdeka' },
      { answer: 'KRITIS', clue: 'Sikap menguji segala tradisi dengan timbangan nalar' },
      { answer: 'BEBAS', clue: 'Kemerdekaan berpendapat dan memeluk keyakinan batin' },
      { answer: 'HUKUM', clue: 'Undang-undang pembatas kekuasaan sewenang-wenang' },
    ],
  },
  {
    id: 'level_340_perdamaian_bangsa_dunia',
    title: 'Piagam Perdamaian Bangsa-Bangsa',
    category: 'Sejarah Dunia',
    words: [
      { answer: 'DAMAI', clue: 'Kondisi dunia rukun terbebas dari ancaman sengketa' },
      { answer: 'BANGSA', clue: 'Kumpulan masyarakat negara yang hidup berdampingan' },
      { answer: 'SEPAKAT', clue: 'Persetujuan bersama dalam perjanjian internasional' },
      { answer: 'RUKUN', clue: 'Hidup berdampingan secara damai saling tolong' },
      { answer: 'PIAGAM', clue: 'Surat resmi naskah kesepakatan perserikatan bangsa' },
      { answer: 'BANTU', clue: 'Tindakan gotong royong meringankan bencana dunia' },
      { answer: 'ADIL', clue: 'Penyelesaian sengketa lewat mahkamah hukum global' },
    ],
  },

  // =========================================================================
  // --- TEMA 35: BIOLOGI MOLEKULER (Bab 341–350) ---
  // =========================================================================
  {
    id: 'level_341_heliks_ganda_dna_kehidupan',
    title: 'Heliks Ganda DNA Kehidupan',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'DNA', clue: 'Asam deoksiribonukleat pembawa cetak biru genetik' },
      { answer: 'BASA', clue: 'Adenin timin guanin sitosin penyusun anak tangga DNA' },
      { answer: 'GANDA', clue: 'Bentuk dua untai heliks yang saling berpilin serasi' },
      { answer: 'GEN', clue: 'Unit pewarisan sifat dari orang tua kepada keturunan' },
      { answer: 'INTI', clue: 'Ruang nukleus dalam sel tempat tersimpannya untai DNA' },
      { answer: 'IKATAN', clue: 'Jembatan hidrogen penghubung pasangan basa nitrogen' },
      { answer: 'SIFAT', clue: 'Ciri fisik bawaan yang diturunkan lewat kode gen' },
    ],
  },
  {
    id: 'level_342_transkripsi_dan_sintesis_rna',
    title: 'Transkripsi Kode Menjadi RNA',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'SALIN', clue: 'Proses mencetak untai mRNA dari cetakan pita DNA' },
      { answer: 'PESAN', clue: 'Molekul mRNA pembawa berita instruksi protein' },
      { answer: 'KODON', clue: 'Tiga deret basa nitrogen penentu jenis asam amino' },
      { answer: 'ENZIM', clue: 'RNA polimerase pelaksana proses penyalinan kode' },
      { answer: 'INTI', clue: 'Tempat berlangsungnya proses transkripsi dalam sel' },
      { answer: 'URASIL', clue: 'Basa nitrogen unik pengganti timin dalam untai RNA' },
      { answer: 'KODE', clue: 'Urutan sandi genetik pembaca rahasia biologis' },
    ],
  },
  {
    id: 'level_343_ribosom_pabrik_protein',
    title: 'Ribosom Pabrik Sintesis Protein',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'RIBOSOM', clue: 'Organel sel penerjemah mRNA menjadi rantai peptida' },
      { answer: 'PROTEIN', clue: 'Biomolekul fungsional pembangun jaringan tubuh' },
      { answer: 'ASAM', clue: 'Monomer asam amino bahan baku penyusun protein' },
      { answer: 'IKATAN', clue: 'Gugus peptida yang merangkai asam amino berurutan' },
      { answer: 'SEL', clue: 'Unit terkecil kehidupan tempat protein disintesis' },
      { answer: 'RANTAI', clue: 'Deretan panjang asam amino yang kemudian melipat' },
      { answer: 'LIPAT', clue: 'Proses melipatnya protein jadi struktur tiga dimensi' },
    ],
  },
  {
    id: 'level_344_mitosis_dan_pembelahan_sel',
    title: 'Mitosis & Pembelahan Sel',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'BELAH', clue: 'Proses sel membagi diri menghasilkan dua sel anakan' },
      { answer: 'TUMBUH', clue: 'Pertambahan ukuran tubuh berkat bertambahnya sel' },
      { answer: 'DUPLIKASI', clue: 'Penggandaan materi genetik sebelum sel membelah' },
      { answer: 'KUTUB', clue: 'Dua ujung tempat benang spindel menarik kromatid' },
      { answer: 'INTI', clue: 'Membran nukleus yang melebur lalu terbentuk kembali' },
      { answer: 'SERUPA', clue: 'Dua sel anakan memiliki sifat genetik identik' },
      { answer: 'FASE', clue: 'Tahapan pembelahan mulai profase hingga telofase' },
    ],
  },
  {
    id: 'level_345_membran_sel_dan_transport',
    title: 'Membran Sel & Pintu Transport',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'MEMBRAN', clue: 'Lapisan ganda fosfolipid pembungkus isi sel hidup' },
      { answer: 'PINTU', clue: 'Kanal protein penyeleksi zat yang keluar masuk sel' },
      { answer: 'DIFUSI', clue: 'Perpindahan zat dari konsentrasi tinggi ke rendah' },
      { answer: 'OSMOSIS', clue: 'Perpindahan molekul air menembus membran selektif' },
      { answer: 'LEMAK', clue: 'Lapisan lipid penolak air pembentuk dinding membran' },
      { answer: 'ENERGI', clue: 'Daya ATP yang dibutuhkan dalam transpor aktif sel' },
      { answer: 'SELEKTIF', clue: 'Sifat membran yang hanya meloloskan zat tertentu' },
    ],
  },
  {
    id: 'level_346_metabolisme_dan_energi_atp',
    title: 'Metabolisme & Baterai ATP',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'ENERGI', clue: 'Daya kimiawi penggerak seluruh aktivitas metabolisme' },
      { answer: 'GULA', clue: 'Glukosa bahan bakar utama dipecah menghasilkan energi' },
      { answer: 'REAKSI', clue: 'Proses katabolisme dan anabolisme di dalam sitosol' },
      { answer: 'OKSIGEN', clue: 'Gas yang dihirup untuk respirasi seluler mitokondria' },
      { answer: 'KARBON', clue: 'Gas buang sisa pembakaran glukosa dalam respirasi' },
      { answer: 'DAYA', clue: 'Kekuatan molekul ATP menyimpan dan melepas energi' },
      { answer: 'AIR', clue: 'Produk sampingan reaksi pembakaran glukosa seluler' },
    ],
  },
  {
    id: 'level_347_enzim_kunci_gembok_biologis',
    title: 'Enzim & Mekanisme Kunci Gembok',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'ENZIM', clue: 'Katalis biologis penurun energi aktivasi reaksi' },
      { answer: 'KUNCI', clue: 'Model kesesuaian tepat antara substrat dengan enzim' },
      { answer: 'AKTIF', clue: 'Sisi spesifik pada enzim tempat substrat menempel' },
      { answer: 'SPESIFIK', clue: 'Satu enzim hanya bekerja pada satu jenis substrat' },
      { answer: 'SUHU', clue: 'Faktor kehangatan tubuh yang mengoptimalkan enzim' },
      { answer: 'RUSAK', clue: 'Denaturasi struktur protein enzim bila terlalu panas' },
      { answer: 'CEPAT', clue: 'Reaksi biologis berlangsung jutaan kali lebih singkat' },
    ],
  },
  {
    id: 'level_348_mutasi_genetik_dan_variasi',
    title: 'Mutasi Genetik & Variasi Alami',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'MUTASI', clue: 'Perubahan urutan basa DNA penyebab variasi sifat' },
      { answer: 'UBAH', clue: 'Pergantian satu huruf basa memicu sifat baru' },
      { answer: 'ALAMI', clue: 'Proses variasi spontan penopang keanekaragaman hayati' },
      { answer: 'ADAPTASI', clue: 'Kemampuan makhluk hidup menyesuaikan diri ke alam' },
      { answer: 'SELEKSI', clue: 'Penyaringan individu tangguh oleh tantangan alam' },
      { answer: 'ACAK', clue: 'Sifat mutasi spontan yang terjadi secara kebetulan' },
      { answer: 'KODON', clue: 'Perubahan sandi tiga basa yang mengubah asam amino' },
    ],
  },
  {
    id: 'level_349_rekayasa_genetika_modern',
    title: 'Bioteknologi & Rekayasa Gen',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'REKAYASA', clue: 'Modifikasi susunan DNA demi menghasilkan bibit unggul' },
      { answer: 'POTONG', clue: 'Memotong untai DNA dengan enzim restriksi khusus' },
      { answer: 'SAMBUNG', clue: 'Menyatukan fragmen gen baru dengan enzim ligase' },
      { answer: 'BAKTERI', clue: 'Organisme mikro tempat menggandakan plasmid gen' },
      { answer: 'VAKSIN', clue: 'Produk biologi pencegah penyakit hasil rekayasa gen' },
      { answer: 'OBAT', clue: 'Insulin murni yang diproduksi lewat teknologi DNA' },
      { answer: 'UNGGUL', clue: 'Sifat tanaman tahan hama berkat penyisipan gen baik' },
    ],
  },
  {
    id: 'level_350_kesinambungan_kode_hidup',
    title: 'Kesinambungan Pohon Kehidupan',
    category: 'Biologi Molekuler',
    words: [
      { answer: 'HIDUP', clue: 'Rantai napas panjang yang bersambung dari masa purba' },
      { answer: 'LESTARI', clue: 'Warisan kode genetik yang terus terjaga abadi' },
      { answer: 'POHON', clue: 'Bagan silsilah evolusi penghubung semua makhluk' },
      { answer: 'KERABAT', clue: 'Kemiripan untai DNA penunjuk hubungan kekeluargaan' },
      { answer: 'KAYA', clue: 'Keanekaragaman jutaan spesies di muka bumi kita' },
      { answer: 'ALAM', clue: 'Rumah ekosistem bersama tempat makhluk bertumbuh' },
      { answer: 'ABADI', clue: 'Sifat informasi kehidupan yang diwariskan turun temurun' },
    ],
  },

  // =========================================================================
  // --- TEMA 36: MATEMATIKA (Bab 351–360) ---
  // =========================================================================
  {
    id: 'level_351_teorema_pythagoras_segitiga',
    title: 'Teorema Pythagoras & Sudut Siku',
    category: 'Matematika',
    words: [
      { answer: 'SEGITIGA', clue: 'Bangun datar bersisi tiga dengan sudut siku-siku' },
      { answer: 'SIKU', clue: 'Sudut tegak lurus berukuran tepat sembilan puluh derajat' },
      { answer: 'KUADRAT', clue: 'Hasil perkalian suatu bilangan dengan dirinya sendiri' },
      { answer: 'MIRING', clue: 'Sisi hipotenusa terpanjang di depan sudut siku-siku' },
      { answer: 'ALAS', clue: 'Sisi mendatar bagian bawah dari bangun segitiga' },
      { answer: 'TINGGI', clue: 'Garis tegak lurus dari puncak segitiga ke sisi alas' },
      { answer: 'RUMUS', clue: 'Persamaan a kuadrat tambah b kuadrat sama dengan c kuadrat' },
    ],
  },
  {
    id: 'level_352_aljabar_dan_persamaan',
    title: 'Aljabar & Misteri Variabel',
    category: 'Matematika',
    words: [
      { answer: 'VARIABEL', clue: 'Huruf pengganti nilai yang belum diketahui dalam aljabar' },
      { answer: 'SAMA', clue: 'Tanda sama dengan penunjuk keseimbangan dua ruas' },
      { answer: 'RUAS', clue: 'Bagian kiri dan kanan yang dipisahkan tanda sama dengan' },
      { answer: 'HITUNG', clue: 'Aktivitas mencari nilai angka pemecah persamaan' },
      { answer: 'KOEFISIEN', clue: 'Angka pengali di depan peubah variabel aljabar' },
      { answer: 'NILAI', clue: 'Angka pasti pengganti variabel yang memenuhi persamaan' },
      { answer: 'LINIER', clue: 'Persamaan berderajat satu bergrafik garis lurus' },
    ],
  },
  {
    id: 'level_353_bilangan_prima_dan_kriptografi',
    title: 'Bilangan Prima & Sandi Kriptografi',
    category: 'Matematika',
    words: [
      { answer: 'PRIMA', clue: 'Bilangan yang hanya habis dibagi angka satu dan dirinya' },
      { answer: 'BAGI', clue: 'Operasi matematika penguji faktor dari sebuah bilangan' },
      { answer: 'FAKTOR', clue: 'Bilangan bulat pembagi habis dari suatu angka' },
      { answer: 'SANDI', clue: 'Kunci rahasia pengaman data digital perbankan' },
      { answer: 'GANJIL', clue: 'Mayoritas bilangan prima kecuali angka genap dua' },
      { answer: 'DUA', clue: 'Satu-satunya bilangan prima yang berstatus bilangan genap' },
      { answer: 'KUNCI', clue: 'Hasil kali dua bilangan prima raksasa pembentuk enkripsi' },
    ],
  },
  {
    id: 'level_354_lingkaran_dan_konstanta_pi',
    title: 'Lingkaran & Bilangan Ajaib Pi',
    category: 'Matematika',
    words: [
      { answer: 'LINGKARAN', clue: 'Bangun bulat lengkung berjarak sama ke titik pusat' },
      { answer: 'PUSAT', clue: 'Titik tengah tepat acuan jarak keliling lingkaran' },
      { answer: 'JARI', clue: 'Jarak dari titik pusat ke tepi lengkung lingkaran' },
      { answer: 'DIAMETER', clue: 'Garis tengah lurus pelintas pusat penghubung dua tepi' },
      { answer: 'LUAS', clue: 'Besarnya area di dalam batas keliling lingkaran' },
      { answer: 'BUSUR', clue: 'Garis lengkung bagian tepi batas luar lingkaran' },
      { answer: 'KELILING', clue: 'Panjang seluruh garis tepi mengelilingi bangun bulat' },
    ],
  },
  {
    id: 'level_355_deret_fibonacci_dan_golden_ratio',
    title: 'Deret Fibonacci & Rasio Emas',
    category: 'Matematika',
    words: [
      { answer: 'DERET', clue: 'Barisan angka beraturan dari penjumlahan dua suku lalu' },
      { answer: 'POLA', clue: 'Keteraturan angka yang berulang membentuk keindahan' },
      { answer: 'SPIRAL', clue: 'Bentuk lengkung cangkang kerang pengikut rasio emas' },
      { answer: 'TAMBAH', clue: 'Operasi penjumlahan dua bilangan penghasil angka berikutnya' },
      { answer: 'BUNGA', clue: 'Kelopak matahari yang tersusun mengikuti barisan angka' },
      { answer: 'RASIO', clue: 'Perbandingan indah bernilai satu koma enam satu delapan' },
      { answer: 'ALAM', clue: 'Karya cipta semesta yang memuat keajaiban matematika' },
    ],
  },
  {
    id: 'level_356_kalkulus_limit_dan_turunan',
    title: 'Kalkulus Limit & Laju Perubahan',
    category: 'Matematika',
    words: [
      { answer: 'LIMIT', clue: 'Nilai pendekatan suatu fungsi saat variabel mendekati titik' },
      { answer: 'TURUNAN', clue: 'Laju perubahan sesaat dari suatu kurva fungsi' },
      { answer: 'KURVA', clue: 'Garis lengkung grafik persamaan di bidang koordinat' },
      { answer: 'DEKAT', clue: 'Konsep menghampiri batas nilai tanpa menyentuhnya' },
      { answer: 'INTEGRAL', clue: 'Operasi pembalikan turunan pencari luas di bawah kurva' },
      { answer: 'KONTINU', clue: 'Kurva mulus tersambung tanpa ada celah terputus' },
      { answer: 'GRADASI', clue: 'Kemiringan atau gradien garis singgung di suatu titik' },
    ],
  },
  {
    id: 'level_357_geometri_ruang_tiga_dimensi',
    title: 'Geometri Ruang Tiga Dimensi',
    category: 'Matematika',
    words: [
      { answer: 'KUBUS', clue: 'Bangun ruang bersisi enam bujur sangkar kongruen' },
      { answer: 'BALOK', clue: 'Bangun ruang kotak berpasangan sisi persegi panjang' },
      { answer: 'VOLUME', clue: 'Kapasitas isi ruang di dalam bangun tiga dimensi' },
      { answer: 'RUSUK', clue: 'Garis pertemuan dua bidang sisi pada bangun ruang' },
      { answer: 'SUDUT', clue: 'Titik temu tiga rusuk pojok pada bangun kotak' },
      { answer: 'BOLA', clue: 'Bangun ruang bulat sempurna tanpa rusuk dan sudut' },
      { answer: 'PRISMA', clue: 'Bangun ruang berpenampang alas dan tutup sejajar sama' },
    ],
  },
  {
    id: 'level_358_statistika_dan_probabilitas',
    title: 'Statistika & Peluang Kepastian',
    category: 'Matematika',
    words: [
      { answer: 'PELUANG', clue: 'Besarnya kemungkinan terjadinya suatu peristiwa' },
      { answer: 'RATA', clue: 'Nilai mean hasil jumlah data dibagi banyaknya data' },
      { answer: 'DATA', clue: 'Kumpulan angka fakta hasil pengukuran statistik' },
      { answer: 'TABEL', clue: 'Susunan baris dan kolom penyaji informasi data' },
      { answer: 'DIAGRAM', clue: 'Gambar grafik batang atau lingkaran pembaca tren' },
      { answer: 'MODUS', clue: 'Nilai data yang paling sering muncul frekuensinya' },
      { answer: 'ACAK', clue: 'Pengambilan sampel data tanpa pilih kasih bias' },
    ],
  },
  {
    id: 'level_359_fraktal_dan_geometri_alam',
    title: 'Fraktal & Kemiripan Diri Semesta',
    category: 'Matematika',
    words: [
      { answer: 'FRAKTAL', clue: 'Pola geometris yang memuat kemiripan diri di tiap skala' },
      { answer: 'POLA', clue: 'Bentuk teratur yang berulang dalam ukuran lebih kecil' },
      { answer: 'PETIR', clue: 'Sambaran kilat bercabang yang berstruktur fraktal' },
      { answer: 'DAUN', clue: 'Helai pakis yang bentuk cabangnya mirip daun utuh' },
      { answer: 'PANTAI', clue: 'Garis pesisir berliku yang tak terhingga panjangnya' },
      { answer: 'SKALA', clue: 'Tingkat perbesaran lensa saat mengamati detail pola' },
      { answer: 'ULANG', clue: 'Perulangan rumus matematika sederhana penghasil keindahan' },
    ],
  },
  {
    id: 'level_360_puncak_tiga_ratus_enam_puluh_bab',
    title: 'Puncak Cendekiawan Tiga Ratus Enam Puluh Bab',
    category: 'Matematika',
    words: [
      { answer: 'CENDEKIA', clue: 'Pribadi berwawasan luas dan tajam daya nalarnya' },
      { answer: 'SEMPURNA', clue: 'Pencapaian tertinggi tuntas tiga ratus enam puluh bab' },
      { answer: 'AGUNG', clue: 'Kemuliaan khazanah ilmu pengetahuan bahasa Indonesia' },
      { answer: 'PUNCAK', clue: 'Titik pencapaian tertinggi master teka-teki Nusantara' },
      { answer: 'JUARA', clue: 'Gelar kehormatan sejati penakluk seluruh bab teka-teki' },
      { answer: 'ABADI', clue: 'Ilmu dan kosakata yang menetap selamanya di sanubari' },
      { answer: 'BANGGA', clue: 'Kebahagiaan tulus atas dedikasi belajar tanpa henti' },
    ],
  },
];

console.log('Compiling 60 New High-Intellect Levels (Bab 301 to 360)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledNewLevels = [];

for (let i = 0; i < new60Levels.length; i++) {
  const def = new60Levels[i];
  const globalLevelIndex = 300 + i + 1; // Bab 301 to 360
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/360] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledNewLevels.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all360Levels = [...existingLevels.slice(0, 300), ...compiledNewLevels];

fs.writeFileSync(levelsFilePath, JSON.stringify(all360Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 360 levels into ${levelsFilePath}!`);
