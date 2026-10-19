import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const new50Levels = [
  // ==========================================
  // KATEGORI 21: Ekonomi Dasar & Finansial (Bab 201 - 210)
  // ==========================================
  {
    id: 'level_201_pasar_jual_beli',
    title: 'Pasar, Penjual & Pembeli',
    category: 'Ekonomi',
    words: [
      { answer: 'PASAR', clue: 'Tempat bertemunya penjual dan pembeli melakukan transaksi' },
      { answer: 'BARANG', clue: 'Benda komoditas bernilai jual yang dijajakan di pasar' },
      { answer: 'HARGA', clue: 'Nilai tukar barang yang diukur dengan satuan mata uang' },
      { answer: 'TAWAR', clue: 'Proses kesepakatan harga antara penjual dan pembeli' },
      { answer: 'BELI', clue: 'Aktivitas mendapatkan barang dengan menyerahkan uang sah' },
      { answer: 'JUAL', clue: 'Menyerahkan kepemilikan barang dagangan demi uang laba' },
      { answer: 'LABA', clue: 'Keuntungan bersih yang diperoleh dari selisih harga jual' },
      { answer: 'RUGI', clue: 'Kondisi saat modal usaha lebih besar daripada pendapatan' },
    ],
  },
  {
    id: 'level_202_uang_sejarah_barter',
    title: 'Uang & Sejarah Barter',
    category: 'Ekonomi',
    words: [
      { answer: 'BARTER', clue: 'Sistem kuno tukar menukar barang sebelum adanya mata uang' },
      { answer: 'UANG', clue: 'Alat tukar resmi penyederhana transaksi perdagangan dunia' },
      { answer: 'TUKAR', clue: 'Menukar barang kebutuhan dengan kesepakatan kedua belah pihak' },
      { answer: 'LOGAM', clue: 'Mata uang koin kuno emas perak penanda awal peradaban' },
      { answer: 'KERTAS', clue: 'Bahan lembaran uang kertas rupiah yang ringkas dibawa' },
      { answer: 'NILAI', clue: 'Besaran nominal yang tertera pada pecahan mata uang' },
      { answer: 'ALAT', clue: 'Fungsi uang sebagai alat pembayaran sah dalam transaksi' },
      { answer: 'BIAYA', clue: 'Pengeluaran uang yang diperlukan untuk memperoleh barang' },
    ],
  },
  {
    id: 'level_203_kebutuhan_keinginan',
    title: 'Kebutuhan vs Keinginan',
    category: 'Ekonomi',
    words: [
      { answer: 'BUTUH', clue: 'Keharusan primer yang mutlak dipenuhi demi bertahan hidup' },
      { answer: 'INGIN', clue: 'Hasrat sekunder tambahan pelengkap kenyamanan hidup' },
      { answer: 'POKOK', clue: 'Kebutuhan pangan sandang dan papan yang paling mendasar' },
      { answer: 'HEMAT', clue: 'Sikap cermat membelanjakan uang tanpa boros berlebih' },
      { answer: 'PILIH', clue: 'Memilih barang yang paling bermanfaat sesuai skala prioritas' },
      { answer: 'BIJAK', clue: 'Sikap matang menimbang urgensi sebelum mengeluarkan uang' },
      { answer: 'SKALA', clue: 'Urutan prioritas kebutuhan dari yang paling penting dipenuhi' },
      { answer: 'CUKUP', clue: 'Merasa puas dan bersyukur atas rezeki yang diperoleh' },
    ],
  },
  {
    id: 'level_204_gemar_menabung_bank',
    title: 'Gemar Menabung & Bank',
    category: 'Ekonomi',
    words: [
      { answer: 'TABUNG', clue: 'Menyisihkan sebagian pendapatan untuk keperluan masa depan' },
      { answer: 'BANK', clue: 'Lembaga keuangan resmi tempat menyimpan dana aman' },
      { answer: 'CELENGAN', clue: 'Wadah kecil tanah liat atau plastik tempat menabung koin' },
      { answer: 'SIMPAN', clue: 'Menyimpan uang simpanan di rekening agar tidak mudah terpakai' },
      { answer: 'BUNGA', clue: 'Bagi hasil imbalan jasa simpanan perbankan yang diperoleh' },
      { answer: 'SALDO', clue: 'Sisa jumlah dana yang tersimpan di dalam buku tabungan' },
      { answer: 'AMAN', clue: 'Kondisi simpanan yang terjamin oleh lembaga penjamin simpanan' },
      { answer: 'MASA', clue: 'Masa depan cerah berkat kedisiplinan menabung sejak dini' },
    ],
  },
  {
    id: 'level_205_permintaan_penawaran',
    title: 'Permintaan & Penawaran',
    category: 'Ekonomi',
    words: [
      { answer: 'MINTA', clue: 'Jumlah barang yang ingin dibeli konsumen pada tingkat harga tertentu' },
      { answer: 'TAWAR', clue: 'Kesediaan produsen menyediakan barang di pasar niaga' },
      { answer: 'LANGKA', clue: 'Kondisi barang sedikit di pasar sehingga memicu kenaikan harga' },
      { answer: 'BANYAK', clue: 'Kondisi pasokan melimpah pemicu penurunan harga barang' },
      { answer: 'NAIK', clue: 'Kenaikan grafik harga saat permintaan pembeli melonjak tinggi' },
      { answer: 'TURUN', clue: 'Penurunan harga barang saat masa panen raya melimpah' },
      { answer: 'STOK', clue: 'Ketersediaan pasokan barang di gudang penyimpanan' },
      { answer: 'SEIMBANG', clue: 'Titik temu seimbang harga antara pembeli dan penjual' },
    ],
  },
  {
    id: 'level_206_inflasi_daya_beli',
    title: 'Inflasi & Daya Beli',
    category: 'Ekonomi',
    words: [
      { answer: 'INFLASI', clue: 'Kenaikan harga barang secara umum dan terus menerus' },
      { answer: 'HARGA', clue: 'Patokan nominal biaya hidup yang dipantau kestabilannya' },
      { answer: 'NILAI', clue: 'Kekuatan daya beli uang dalam mendapatkan barang kebutuhan' },
      { answer: 'BELI', clue: 'Kemampuan masyarakat membelanjakan penghasilannya' },
      { answer: 'PASAR', clue: 'Kancah peredaran sembako yang dijaga dari lonjakan harga' },
      { answer: 'POKOK', clue: 'Bahan pangan beras minyak dan gula penopang hajat hidup' },
      { answer: 'STABIL', clue: 'Kondisi perekonomian yang tenang tanpa gejolak moneter' },
      { answer: 'UANG', clue: 'Peredaran jumlah rupiah yang dijaga oleh bank sentral' },
    ],
  },
  {
    id: 'level_207_modal_wirausaha',
    title: 'Modal, Usaha & Wirausaha',
    category: 'Ekonomi',
    words: [
      { answer: 'MODAL', clue: 'Dana uang dan aset awal penggerak pembukaan usaha baru' },
      { answer: 'USAHA', clue: 'Kegiatan niaga produktif penghasil barang atau jasa bernilai' },
      { answer: 'BISNIS', clue: 'Dunia perniagaan yang ditekuni para pelaku wirausaha mandiri' },
      { answer: 'KREATIF', clue: 'Daya cipta inovatif pembeda produk dari para pesaing pasar' },
      { answer: 'KERJA', clue: 'Ketekunan membanting tulang demi membesarkan roda usaha' },
      { answer: 'PRODUK', clue: 'Barang olahan berkualitas siap jual ke tangan konsumen' },
      { answer: 'UNTUNG', clue: 'Hasil manis jerih payah perniagaan yang dikelola cermat' },
      { answer: 'MAJU', clue: 'Perkembangan skala bisnis dari toko kecil menjadi besar' },
    ],
  },
  {
    id: 'level_208_investasi_masa_depan',
    title: 'Investasi untuk Masa Depan',
    category: 'Ekonomi',
    words: [
      { answer: 'INVESTASI', clue: 'Penanaman modal jangka panjang demi keuntungan di masa depan' },
      { answer: 'SAHAM', clue: 'Bukti kepemilikan modal pada sebuah perusahaan terbuka' },
      { answer: 'EMAS', clue: 'Logam mulia kuning penyimpan nilai lindung dari inflasi' },
      { answer: 'TANAH', clue: 'Aset properti bumi yang harganya cenderung naik tiap tahun' },
      { answer: 'ASET', clue: 'Kekayaan bernilai ekonomis yang memberikan arus kas positif' },
      { answer: 'TUMBUH', clue: 'Pertumbuhan nilai modal investasi seiring berjalannya waktu' },
      { answer: 'RISIKO', clue: 'Peluang ketidakpastian yang wajib dihitung secara matang' },
      { answer: 'HASIL', clue: 'Imbal hasil dividen atau keuntungan modal yang dipetik' },
    ],
  },
  {
    id: 'level_209_pajak_pembangunan',
    title: 'Pajak & Pembangunan Negara',
    category: 'Ekonomi',
    words: [
      { answer: 'PAJAK', clue: 'Iuran wajib warga negara untuk membiayai belanja negara' },
      { answer: 'NEGARA', clue: 'Penyelenggara pemerintahan pengelola dana APBN bagi rakyat' },
      { answer: 'JALAN', clue: 'Infrastruktur jalan raya aspal mulus hasil dana pajak warga' },
      { answer: 'JEMBATAN', clue: 'Penghubung antardaerah yang dibangun demi kelancaran niaga' },
      { answer: 'SUBSIDI', clue: 'Bantuan pemerintah untuk meringankan harga pupuk dan energi' },
      { answer: 'WARGA', clue: 'Masyarakat pembayar pajak yang taat demi kemajuan bangsa' },
      { answer: 'BANGUN', clue: 'Pembangunan sekolah puskesmas dan fasilitas umum merata' },
      { answer: 'TAAT', clue: 'Kepatuhan melaporkan dan membayar pajak tepat pada waktunya' },
    ],
  },
  {
    id: 'level_210_perdagangan_internasional',
    title: 'Perdagangan Ekspor & Impor',
    category: 'Ekonomi',
    words: [
      { answer: 'EKSPOR', clue: 'Pengiriman barang komoditas dalam negeri ke pasar luar negeri' },
      { answer: 'IMPOR', clue: 'Pembelian barang mesin atau bahan baku dari negara lain' },
      { answer: 'KAPAL', clue: 'Kapal kontainer raksasa pengangkut kargo melintasi samudra' },
      { answer: 'PELABUHAN', clue: 'Pintu gerbang laut tempat bongkar muat peti kemas ekspor' },
      { answer: 'BARANG', clue: 'Produk olahan unggulan yang dipasarkan ke mancanegara' },
      { answer: 'DEVISA', clue: 'Cadangan valuta asing pendapatan negara dari hasil ekspor' },
      { answer: 'DUNIA', clue: 'Pasar global tempat bertemunya perdagangan antarbangsa' },
      { answer: 'NIAGA', clue: 'Aktivitas perniagaan perdagangan antardaerah dan negara' },
    ],
  },

  // ==========================================
  // KATEGORI 22: Hukum, Aturan & Keadilan (Bab 211 - 220)
  // ==========================================
  {
    id: 'level_211_makna_keadilan',
    title: 'Makna Keadilan Hakiki',
    category: 'Hukum',
    words: [
      { answer: 'ADIL', clue: 'Sikap tidak berat sebelah menempatkan sesuatu pada tempatnya' },
      { answer: 'BENAR', clue: 'Sesuai dengan fakta kebenaran dan kaidah moral luhur' },
      { answer: 'TIMBANG', clue: 'Menimbang bukti perkara dengan teliti tanpa prasangka' },
      { answer: 'NERACA', clue: 'Timbangan dua cawan lambang keadilan sejati yang setara' },
      { answer: 'SETARA', clue: 'Kedudukan yang sama di hadapan hukum bagi seluruh warga' },
      { answer: 'HAK', clue: 'Kewenangan asasi yang wajib dihormati dan dilindungi hukum' },
      { answer: 'HUKUM', clue: 'Peraturan resmi tertulis pengatur ketertiban masyarakat' },
      { answer: 'JUJUR', clue: 'Ketulusan hati berpijak pada fakta yang sesungguhnya' },
    ],
  },
  {
    id: 'level_212_norma_tata_tertib',
    title: 'Norma & Tata Tertib Hidup',
    category: 'Hukum',
    words: [
      { answer: 'NORMA', clue: 'Kaidah patokan perilaku yang disepakati dalam masyarakat' },
      { answer: 'ATURAN', clue: 'Petunjuk ketentuan yang wajib ditaati dalam keseharian' },
      { answer: 'TERTIB', clue: 'Suasana hidup aman teratur tanpa kekacauan dan keributan' },
      { answer: 'SANKSI', clue: 'Hukuman atau konsekuensi tegas bagi pelanggar peraturan' },
      { answer: 'DISIPLIN', clue: 'Ketaatan menghargai aturan secara sadar dan sukarela' },
      { answer: 'PATUH', clue: 'Sikap tunduk pada rambu lalu lintas demi keselamatan diri' },
      { answer: 'DAMAI', clue: 'Ketenteraman sosial buah dari kesadaran hukum masyarakat' },
      { answer: 'SOPAN', clue: 'Adab kesantunan budi pekerti dalam pergaulan sehari-hari' },
    ],
  },
  {
    id: 'level_213_undang_konstitusi',
    title: 'Undang-Undang & Konstitusi',
    category: 'Hukum',
    words: [
      { answer: 'PASAL', clue: 'Bagian bab dari undang-undang yang memuat ketentuan hukum' },
      { answer: 'UNDANG', clue: 'Produk hukum tertulis yang disahkan bersama presiden dan DPR' },
      { answer: 'DASAR', clue: 'Undang-Undang Dasar 1945 hukum tertinggi negara Indonesia' },
      { answer: 'HUKUM', clue: 'Sistem pranata pengatur ketenteraman dan kepastian hak' },
      { answer: 'NEGARA', clue: 'Organisasi kedaulatan yang menjamin kepastian perlindungan hukum' },
      { answer: 'RESMI', clue: 'Diumumkan secara sah di lembaran lembaran negara' },
      { answer: 'KODE', clue: 'Kumpulan kitab undang-undang hukum pidana dan perdata' },
      { answer: 'IKAT', clue: 'Kekuatan hukum yang mengikat seluruh warga tanpa kecuali' },
    ],
  },
  {
    id: 'level_214_sidang_pengadilan',
    title: 'Sidang di Meja Pengadilan',
    category: 'Hukum',
    words: [
      { answer: 'PENGADILAN', clue: 'Lembaga yudikatif tempat memeriksa dan mengadili perkara' },
      { answer: 'SIDANG', clue: 'Pertemuan resmi pemeriksaan perkara di hadapan majelis hakim' },
      { answer: 'MEJA', clue: 'Meja hijau tempat digelarnya proses persidangan perkara' },
      { answer: 'KETUK', clue: 'Ketukan palu hakim penanda dimulainya atau ditutupnya sidang' },
      { answer: 'PALU', clue: 'Palu kayu hakim lambang kepastian penetapan putusan hukum' },
      { answer: 'RUANG', clue: 'Ruang sidang pengadilan yang hening khidmat penuh wibawa' },
      { answer: 'PERKARA', clue: 'Sengketa atau tindak pidana yang diselesaikan di pengadilan' },
      { answer: 'VONIS', clue: 'Keputusan akhir hakim penentu bersalah atau bebasnya terdakwa' },
    ],
  },
  {
    id: 'level_215_hakim_pengambil_putusan',
    title: 'Hakim & Pengambil Keputusan',
    category: 'Hukum',
    words: [
      { answer: 'HAKIM', clue: 'Pejabat peradilan bertoga pemutus perkara dengan adil' },
      { answer: 'BIJAK', clue: 'Sikap mendalam hakim menimbang seluruh keterangan persidangan' },
      { answer: 'VONIS', clue: 'Putusan resmi hakim yang dibacakan di akhir masa sidang' },
      { answer: 'PUTUS', clue: 'Menjatuhkan ketetapan hukum berdasarkan keadilan Ketuhanan' },
      { answer: 'NETRAL', clue: 'Tidak memihak salah satu pihak yang sedang bersengketa' },
      { answer: 'BEBAS', clue: 'Kemerdekaan kekuasaan kehakiman dari campur tangan pihak lain' },
      { answer: 'JUJUR', clue: 'Menjunjung integritas moral memutus perkara tanpa suap' },
      { answer: 'WIBAWA', clue: 'Kehormatan profesi peradilan yang disegani seluruh masyarakat' },
    ],
  },
  {
    id: 'level_216_jaksa_pengacara',
    title: 'Jaksa & Pengacara Pembela',
    category: 'Hukum',
    words: [
      { answer: 'JAKSA', clue: 'Penuntut umum negara pembawa dakwaan pidana di pengadilan' },
      { answer: 'PENGACARA', clue: 'Advokat pemberi bantuan hukum pembela hak-hak terdakwa' },
      { answer: 'BELA', clue: 'Membela hak keadilan klien agar terhindar dari kesewenang-wenangan' },
      { answer: 'TUNTUT', clue: 'Mengajukan tuntutan hukuman setimpal sesuai tindak kejahatan' },
      { answer: 'KASUS', clue: 'Dugaan tindak pelanggaran hukum yang sedang ditangani' },
      { answer: 'HUKUM', clue: 'Kaidah perundang-undangan yang menjadi pijakan argumen' },
      { answer: 'DEBAT', clue: 'Adu argumen ilmiah di persidangan berlandaskan pasal undang-undang' },
      { answer: 'BUKTI', clue: 'Bahan pembuktian otentik penguat pembelaan atau dakwaan' },
    ],
  },
  {
    id: 'level_217_saksi_bukti_fakta',
    title: 'Saksi, Bukti & Fakta Persidangan',
    category: 'Hukum',
    words: [
      { answer: 'SAKSI', clue: 'Orang yang melihat mendengar atau mengalami sendiri suatu peristiwa' },
      { answer: 'BUKTI', clue: 'Alat bukti surat saksi petunjuk dan keterangan terdakwa' },
      { answer: 'FAKTA', clue: 'Kejadian nyata yang terbukti kebenarannya di ruang sidang' },
      { answer: 'SUMPAH', clue: 'Janji suci di hadapan kitab suci untuk berkata jujur' },
      { answer: 'SIDIK', clue: 'Penyelidikan sidik jari dan forensik mengungkap jejak perkara' },
      { answer: 'JELAS', clue: 'Keterangan saksi yang gamblang tanpa ada keraguan sedikit pun' },
      { answer: 'NYATA', clue: 'Bukti fisik yang sah meyakinkan majelis hakim di pengadilan' },
      { answer: 'TERANG', clue: 'Terangnya suatu perkara hukum benderang menemukan titik temu' },
    ],
  },
  {
    id: 'level_218_hak_asasi_manusia',
    title: 'Hak Asasi Manusia (HAM)',
    category: 'Hukum',
    words: [
      { answer: 'HAK', clue: 'Anugerah kodrati Tuhan yang melekat sejak manusia dilahirkan' },
      { answer: 'ASASI', clue: 'Sifat mendasar hak manusia yang tidak boleh dirampas orang lain' },
      { answer: 'HIDUP', clue: 'Hak paling utama setiap insan untuk hidup aman dan tenteram' },
      { answer: 'BEBAS', clue: 'Kebebasan memeluk agama dan menyampaikan pendapat santun' },
      { answer: 'LINDUNG', clue: 'Kewajiban negara melindungi segenap tumpah darah warga' },
      { answer: 'MANUSIA', clue: 'Insan berakal budi penyandang hak asasi universal sedunia' },
      { answer: 'HARKAT', clue: 'Derajat kemanusiaan yang luhur wajib dijaga kehormatannya' },
      { answer: 'MARTABAT', clue: 'Harga diri mulia setiap insan di hadapan hukum dan sesama' },
    ],
  },
  {
    id: 'level_219_perjanjian_kontrak',
    title: 'Perjanjian & Kontrak Sah',
    category: 'Hukum',
    words: [
      { answer: 'JANJI', clue: 'Kesepakatan moral dua pihak pengikat hak dan kewajiban' },
      { answer: 'KONTRAK', clue: 'Surat perjanjian tertulis yang memiliki kekuatan hukum mengikat' },
      { answer: 'SEPAKAT', clue: 'Kesesuaian kehendak kedua belah pihak tanpa ada paksaan' },
      { answer: 'TANDA', clue: 'Tanda tangan bukti persetujuan atas seluruh isi perjanjian' },
      { answer: 'TANGAN', clue: 'Goresan tanda tangan para pihak di atas meterai tempel' },
      { answer: 'MATERAI', clue: 'Bea meterai pajak dokumen pengesah surat perjanjian di mata hukum' },
      { answer: 'SYARAT', clue: 'Ketentuan sahnya perjanjian kesepakatan cakap dan objek halal' },
      { answer: 'SAH', clue: 'Kondisi kontrak yang diakui berlaku berkekuatan hukum' },
    ],
  },
  {
    id: 'level_220_penegakan_hukum',
    title: 'Penegakan Hukum yang Bersih',
    category: 'Hukum',
    words: [
      { answer: 'TEGAK', clue: 'Menegakkan keadilan hukum tanpa pandang bulu dan suap' },
      { answer: 'BERSIH', clue: 'Aparat penegak hukum yang jujur bebas dari korupsi kolusi' },
      { answer: 'WIBAWA', clue: 'Kewibawaan lembaga hukum yang dipercaya penuh oleh rakyat' },
      { answer: 'AMANAH', clue: 'Tanggung jawab moral mengemban tugas keadilan bagi bangsa' },
      { answer: 'TEGAS', clue: 'Tindakan tegas menindak pelanggaran demi kepastian hukum' },
      { answer: 'TERTIB', clue: 'Keteraturan tata kehidupan bermasyarakat yang damai aman' },
      { answer: 'HUKUM', clue: 'Panglima tertinggi pelindung seluruh rakyat Indonesia' },
      { answer: 'DAMAI', clue: 'Negara hukum yang makmur sentosa penuh rasa keadilan' },
    ],
  },

  // ==========================================
  // KATEGORI 23: Politik & Tata Negara (Bab 221 - 230)
  // ==========================================
  {
    id: 'level_221_konsep_negara_wilayah',
    title: 'Konsep Negara & Wilayah',
    category: 'Politik',
    words: [
      { answer: 'NEGARA', clue: 'Organisasi kekuasaan berdaulat yang menaungi rakyat dan wilayah' },
      { answer: 'RAKYAT', clue: 'Seluruh warga penghuni sah wilayah suatu negara berdaulat' },
      { answer: 'WILAYAH', clue: 'Daerah teritorial darat laut dan udara kedaulatan negara' },
      { answer: 'DAULAT', clue: 'Kekuasaan tertinggi negara untuk mengatur urusan dalam negerinya' },
      { answer: 'PEMERINTAH', clue: 'Lembaga resmi pelaksana amanah kekuasaan tata negara' },
      { answer: 'HUKUM', clue: 'Konstitusi dasar pemandu penyelenggaraan pemerintahan negara' },
      { answer: 'BATAS', clue: 'Garis perbatasan resmi antardaerah dan antarsesama negara tetangga' },
      { answer: 'NEGERI', clue: 'Tanah air tumpah darah tempat rakyat bernaung sentosa' },
    ],
  },
  {
    id: 'level_222_demokrasi_rakyat',
    title: 'Demokrasi dari & untuk Rakyat',
    category: 'Politik',
    words: [
      { answer: 'DEMOKRASI', clue: 'Sistem pemerintahan dari rakyat oleh rakyat dan untuk rakyat' },
      { answer: 'RAKYAT', clue: 'Pemegang kedaulatan tertinggi dalam tatanan negara demokrasi' },
      { answer: 'SUARA', clue: 'Hak bersuara dan berpendapat dalam menentukan arah bangsa' },
      { answer: 'BEBAS', clue: 'Kemerdekaan berpendapat secara santun bertanggung jawab' },
      { answer: 'PILIH', clue: 'Hak memilih pemimpin terbaik sesuai hati nurani pribadi' },
      { answer: 'SETARA', clue: 'Kesetaraan hak politik setiap warga negara tanpa kasta' },
      { answer: 'ADIL', clue: 'Penyelenggaraan tatanan masyarakat yang adil dan terbuka' },
      { answer: 'WARGA', clue: 'Warga negara aktif pembangun demokrasi yang bermartabat' },
    ],
  },
  {
    id: 'level_223_pemilihan_umum',
    title: 'Pemilihan Umum & Hak Suara',
    category: 'Politik',
    words: [
      { answer: 'PEMILU', clue: 'Pesta demokrasi lima tahunan pemilihan presiden dan dewan' },
      { answer: 'COBLOS', clue: 'Mencoblos nomor atau gambar kandidat di surat suara resmi' },
      { answer: 'KOTAK', clue: 'Kotak suara bersegel tempat menaruh surat suara pemilih' },
      { answer: 'BILIK', clue: 'Bilik suara penjaga kerahasiaan pilihan politik warga' },
      { answer: 'SUARA', clue: 'Satu suara berharga penentu masa depan kepemimpinan negeri' },
      { answer: 'KANDIDAT', clue: 'Calon pemimpin yang mengajukan visi misi pengabdian bangsa' },
      { answer: 'PARTAI', clue: 'Organisasi politik wadah aspirasi dan kaderisasi pemimpin' },
      { answer: 'DAMAI', clue: 'Suasana pemilu yang sejuk jujur adil dan penuh persaudaraan' },
    ],
  },
  {
    id: 'level_224_parlemen_dewan',
    title: 'Parlemen & Wakil Rakyat',
    category: 'Politik',
    words: [
      { answer: 'DEWAN', clue: 'Lembaga perwakilan rakyat tempat menggodok undang-undang' },
      { answer: 'WAKIL', clue: 'Anggota legislatif pembawa amanah dan suara rakyat pemilih' },
      { answer: 'RAKYAT', clue: 'Masyarakat pemberi mandat kedaulatan kepada para wakil' },
      { answer: 'GEDUNG', clue: 'Gedung kura-kura DPR MPR tempat wakil rakyat bersidang' },
      { answer: 'RAPAT', clue: 'Rapat paripurna pembahasan anggaran dan rancangan undang-undang' },
      { answer: 'SUARA', clue: 'Menyuarakan keluhan dan harapan masyarakat di parlemen' },
      { answer: 'ASPIRASI', clue: 'Keinginan dan harapan warga yang diperjuangkan di dewan' },
      { answer: 'SIDANG', clue: 'Persidangan resmi pengesahan kebijakan dan pengawasan APBN' },
    ],
  },
  {
    id: 'level_225_presiden_menteri',
    title: 'Presiden, Menteri & Kabinet',
    category: 'Politik',
    words: [
      { answer: 'PRESIDEN', clue: 'Kepala negara dan kepala pemerintahan eksekutif republik' },
      { answer: 'MENTERI', clue: 'Pembantu presiden pemimpin kementerian bidang teknis' },
      { answer: 'KABINET', clue: 'Jajaran menteri kabinet pelaksana roda pemerintahan kerja' },
      { answer: 'PIMPIN', clue: 'Memimpin jalannya pembangunan nasional demi kemakmuran rakyat' },
      { answer: 'TUGAS', clue: 'Kewajiban konstitusional melayani seluruh lapisan masyarakat' },
      { answer: 'KERJA', clue: 'Bekerja nyata menuntaskan target pembangunan daerah dan pusat' },
      { answer: 'NEGARA', clue: 'Aparatur negara yang berbakti pada nusa dan bangsa' },
      { answer: 'SUMPAH', clue: 'Sumpah jabatan setia memegang teguh amanah konstitusi' },
    ],
  },
  {
    id: 'level_226_kebijakan_publik',
    title: 'Kebijakan Publik & Anggaran',
    category: 'Politik',
    words: [
      { answer: 'KEBIJAKAN', clue: 'Rangkaian tindakan pemerintah pemecah masalah sosial warga' },
      { answer: 'ANGGARAN', clue: 'Rencana alokasi dana keuangan negara untuk program rakyat' },
      { answer: 'PUBLIK', clue: 'Kepentingan masyarakat luas yang wajib diprioritaskan utama' },
      { answer: 'PROGRAM', clue: 'Rencana kerja nyata pengentasan kemiskinan dan beasiswa' },
      { answer: 'BANTUAN', clue: 'Bantuan sosial penyangga daya beli masyarakat kurang mampu' },
      { answer: 'SEJAHTERA', clue: 'Tujuan utama kebijakan publik mewujudkan rakyat makmur' },
      { answer: 'SASARAN', clue: 'Kelompok target penerima manfaat program tepat sasaran' },
      { answer: 'HASIL', clue: 'Dampak positif kebijakan peningkatan kualitas hidup bangsa' },
    ],
  },
  {
    id: 'level_227_diplomasi_antarbangsa',
    title: 'Diplomasi & Hubungan Antarbangsa',
    category: 'Politik',
    words: [
      { answer: 'DIPLOMASI', clue: 'Seni perundingan hubungan damai antarpemerintah negara dunia' },
      { answer: 'DUTA', clue: 'Duta besar perwakilan diplomatik resmi negara di luar negeri' },
      { answer: 'BESAR', clue: 'Kedutaan besar pos diplomatik penghubung antardua bangsa' },
      { answer: 'KEDUTAAN', clue: 'Kantor resmi perwakilan negara yang melindungi warga di luar' },
      { answer: 'DAMAI', clue: 'Tujuan politik luar negeri bebas aktif memperjuangkan damai' },
      { answer: 'MITRA', clue: 'Negara rekan kerjasama strategis perdagangan dan pendidikan' },
      { answer: 'DUNIA', clue: 'Komunitas internasional tempat berkiprahnya diplomasi bangsa' },
      { answer: 'RUNDING', clue: 'Musyawarah meja perundingan menyelesaikan sengketa perbatasan' },
    ],
  },
  {
    id: 'level_228_perjanjian_damai',
    title: 'Perjanjian Damai Antarnegara',
    category: 'Politik',
    words: [
      { answer: 'DAMAI', clue: 'Kondisi ketenteraman dunia tanpa kobaran sengketa senjata' },
      { answer: 'SEPAKAT', clue: 'Kesepahaman bersama menghentikan konflik dan pertikaian' },
      { answer: 'TRAKTAT', clue: 'Perjanjian resmi internasional antardua atau banyak negara' },
      { answer: 'HENTI', clue: 'Gencatan senjata menghentikan permusuhan di zona perang' },
      { answer: 'PERANG', clue: 'Bencana pertikaian senjata yang harus dihindari para pemimpin' },
      { answer: 'AKUR', clue: 'Kerukunan persahabatan antarbangsa hidup berdampingan' },
      { answer: 'HARMONI', clue: 'Keselarasan tata kelola hubungan internasional yang sejuk' },
      { answer: 'DUNIA', clue: 'Jagat raya hunian bersama miliaran umat manusia yang aman' },
    ],
  },
  {
    id: 'level_229_otonomi_daerah',
    title: 'Otonomi & Pelayanan Daerah',
    category: 'Politik',
    words: [
      { answer: 'DAERAH', clue: 'Wilayah provinsi kabupaten dan kota yang memiliki otonomi' },
      { answer: 'OTONOMI', clue: 'Hak kewenangan daerah mengatur urusan rumah tangganya' },
      { answer: 'BUPATI', clue: 'Kepala daerah tingkat kabupaten yang dipilih oleh rakyatnya' },
      { answer: 'WALIKOTA', clue: 'Pemimpin pemerintahan kota pelayan kebutuhan warga kota' },
      { answer: 'LAYAN', clue: 'Memberikan pelayanan administrasi kependudukan cepat ramah' },
      { answer: 'WARGA', clue: 'Masyarakat daerah pemegang hak atas pembangunan daerah' },
      { answer: 'MAJU', clue: 'Kemajuan daerah pelosok berkat pemerataan dana pembangunan' },
      { answer: 'PEMDA', clue: 'Pemerintah daerah pelaksana pelayanan publik di pelosok negeri' },
    ],
  },
  {
    id: 'level_230_partisipasi_warga',
    title: 'Partisipasi Warga Negara Cerdas',
    category: 'Politik',
    words: [
      { answer: 'KRITIS', clue: 'Kemampuan berpikir cerdas menyaring kabar hoax dan fakta' },
      { answer: 'PEDULI', clue: 'Kepedulian terhadap isu lingkungan dan nasib sesama warga' },
      { answer: 'ASPIRASI', clue: 'Menyampaikan saran konstruktif demi perbaikan pelayanan umum' },
      { answer: 'IKUT', clue: 'Berpartisipasi aktif dalam kegiatan musyawarah warga RT' },
      { answer: 'KAWAL', clue: 'Mengawal transparansi penggunaan dana desa dan anggaran negara' },
      { answer: 'SOLUSI', clue: 'Menawarkan ide jalan keluar atas permasalahan kampung' },
      { answer: 'SUARA', clue: 'Menyuarakan aspirasi kebaikan lewat saluran resmi yang sah' },
      { answer: 'BANGSA', clue: 'Generasi cerdas pembangun peradaban politik bermartabat' },
    ],
  },

  // ==========================================
  // KATEGORI 24: Antropologi & Peradaban Manusia (Bab 231 - 240)
  // ==========================================
  {
    id: 'level_231_jejak_manusia_purba',
    title: 'Jejak Manusia Purba',
    category: 'Antropologi',
    words: [
      { answer: 'FOSIL', clue: 'Sisa-sisa tulang belulang manusia atau satwa purba yang membatu' },
      { answer: 'TULANG', clue: 'Rangka fosil tengkorak manusia purba Sangiran yang ternama' },
      { answer: 'PURBA', clue: 'Zaman prasejarah masa lampau ratusan ribu tahun silam' },
      { answer: 'SITUS', clue: 'Lokasi penggalian arkeologi penemuan fosil berharga dunia' },
      { answer: 'GUA', clue: 'Ceruk batu tempat berlindung manusia purba dari cuaca ganas' },
      { answer: 'BATU', clue: 'Zaman kebudayaan batu tua tempat manusia mulai mengenal alat' },
      { answer: 'KUNO', clue: 'Zaman peradaban masa silam yang meninggalkan jejak sejarah' },
      { answer: 'TANAH', clue: 'Lapisan bumi sedimen tempat terkuburnya fosil purba jutaan tahun' },
    ],
  },
  {
    id: 'level_232_alat_batu_prasejarah',
    title: 'Alat Batu Zaman Prasejarah',
    category: 'Antropologi',
    words: [
      { answer: 'KAPAK', clue: 'Kapak genggam batu alat serbaguna pemotong daging buruan' },
      { answer: 'BATU', clue: 'Batu andesit atau kalsedon bahan baku perbengkelan alat kuno' },
      { answer: 'PAHAT', clue: 'Batu tajam penatah kayu dan tanduk binatang hasil buruan' },
      { answer: 'SERPIH', clue: 'Serpihan batu bilah tajam pengikis kulit umbi makanan' },
      { answer: 'ZAMAN', clue: 'Kurun masa prasejarah paleolitikum mesolitikum neolitikum' },
      { answer: 'KUNO', clue: 'Teknologi alat batu sederhana awal mula peradaban manusia' },
      { answer: 'ALAT', clue: 'Peralatan berburu dan meramu penunjang ketahanan raga purba' },
      { answer: 'BURU', clue: 'Aktivitas berburu satwa hutan dan mengumpulkan buah liar' },
    ],
  },
  {
    id: 'level_233_bahasa_aksara',
    title: 'Bahasa & Awal Mula Aksara',
    category: 'Antropologi',
    words: [
      { answer: 'BAHASA', clue: 'Sistem komunikasi bunyi ujaran penghubung antarsesama insan' },
      { answer: 'KATA', clue: 'Satuan bunyi bermakna perangkai tuturan pesan antarmasyarakat' },
      { answer: 'AKSARA', clue: 'Sistem lambang tulisan huruf kuno seperti Pallawa dan Kawi' },
      { answer: 'SIMBOL', clue: 'Tanda visual lukisan cap tangan pada dinding gua purba' },
      { answer: 'TULIS', clue: 'Kemampuan mengabadikan pengetahuan lewat goresan tulisan' },
      { answer: 'BATU', clue: 'Batu prasasti media pemahat sabda raja masa keemasan masa lalu' },
      { answer: 'PRASASTI', clue: 'Piagam batu bertuliskan maklumat penting peninggalan leluhur' },
      { answer: 'LULUH', clue: 'Perpaduan dialek bahasa antarsuku yang melebur harmonis' },
    ],
  },
  {
    id: 'level_234_kekerabatan_silsilah',
    title: 'Kekerabatan & Silsilah Suku',
    category: 'Antropologi',
    words: [
      { answer: 'MARGA', clue: 'Nama keluarga suku pertanda garis keturunan dari leluhur' },
      { answer: 'SUKU', clue: 'Kelompok etnis masyarakat berkesamaan adat asal dan bahasa' },
      { answer: 'DARAH', clue: 'Pertalian ikatan persaudaraan sedarah sekandung dari kakek nenek' },
      { answer: 'GARIS', clue: 'Sistem penarikan garis keturunan ayah patrilineal atau ibu' },
      { answer: 'KERABAT', clue: 'Seluruh sanak saudara dalam lingkaran rumpun keluarga besar' },
      { answer: 'IKATAN', clue: 'Tali persaudaraan kekeluargaan yang saling tolong menolong' },
      { answer: 'SILSILAH', clue: 'Bagan pohon silsilah keluarga asal usul nenek moyang' },
      { answer: 'ASAL', clue: 'Tanah leluhur tempat permulaan berdirinya kampung keluarga' },
    ],
  },
  {
    id: 'level_235_tradisi_lisan',
    title: 'Tradisi Lisan & Cerita Mitos',
    category: 'Antropologi',
    words: [
      { answer: 'MITOS', clue: 'Cerita rakyat zaman dahulu tentang asal mula alam dan dewa' },
      { answer: 'DONGENG', clue: 'Kisah fabel satwa penuh ajaran moral pengantar tidur anak' },
      { answer: 'KISAH', clue: 'Tuturan riwayat kepahlawanan leluhur penjaga tanah adat' },
      { answer: 'TUTUR', clue: 'Penyampaian lisan dari mulut ke mulut antargenerasi turun temurun' },
      { answer: 'LEGENDA', clue: 'Cerita asal usul terjadinya danau gunung atau nama kota' },
      { answer: 'PESAN', clue: 'Amanat nasihat kebajikan yang terkandung dalam kisah dongeng' },
      { answer: 'WARIS', clue: 'Warisan luhur kearifan budi pekerti yang tidak boleh punah' },
      { answer: 'CERITA', clue: 'Rangkaian dongeng rakyat yang memikat imajinasi anak bangsa' },
    ],
  },
  {
    id: 'level_236_seni_rias_busana_etnik',
    title: 'Seni Rias & Busana Etnik',
    category: 'Antropologi',
    words: [
      { answer: 'BUSANA', clue: 'Pakaian adat khas daerah berbahan tenun serat alami' },
      { answer: 'TENUN', clue: 'Kain tenun ikat bernilai seni tinggi hasil ketekunan tangan' },
      { answer: 'CORAK', clue: 'Motif ornamen geometris dan fauna lambang status adat' },
      { answer: 'MANIK', clue: 'Butiran manik-manik warna-warni penghias mahkota kalung adat' },
      { answer: 'RIAS', clue: 'Seni rias wajah dan tata busana pengantin tradisional daerah' },
      { answer: 'ALAM', clue: 'Pewarna alami dari kulit kayu daun mengkudu dan kunyit' },
      { answer: 'MAKNA', clue: 'Filosofi luhur di balik setiap lipatan dan warna kain adat' },
      { answer: 'INDAH', clue: 'Keelokan karya seni etnik nusantara yang memukau dunia' },
    ],
  },
  {
    id: 'level_237_upacara_daur_hidup',
    title: 'Upacara Daur Hidup Tradisi',
    category: 'Antropologi',
    words: [
      { answer: 'LAHIR', clue: 'Ritual adat penyambutan kelahiran bayi mungil ke dunia' },
      { answer: 'DEWASA', clue: 'Upacara inisiasi peralihan anak menuju kedewasaan mandiri' },
      { answer: 'NIKAH', clue: 'Ikrar suci pernikahan berbalut upacara adat penuh doa restu' },
      { answer: 'WAFAT', clue: 'Upacara pemakaman adat mengantar arwah leluhur beristirahat' },
      { answer: 'ADAT', clue: 'Kaidah ritual sakral yang dijalankan khidmat oleh tetua suku' },
      { answer: 'RITUAL', clue: 'Rangkaian tata cara permohonan keselamatan dan berkah hidup' },
      { answer: 'DOA', clue: 'Pemberian doa keselamatan dari seluruh keluarga dan tetua' },
      { answer: 'SYUKUR', clue: 'Rasa syukur mendalam atas setiap tahapan kehidupan manusia' },
    ],
  },
  {
    id: 'level_238_pola_pemukiman_adat',
    title: 'Pola Pemukiman & Rumah Adat',
    category: 'Antropologi',
    words: [
      { answer: 'DESA', clue: 'Pemukiman tradisional tertata melingkari halaman tanah lapang' },
      { answer: 'PANGGUNG', clue: 'Arsitektur rumah panggung kayu adaptasi bebas banjir dan satwa' },
      { answer: 'KAYU', clue: 'Bahan alami tiang ulin dan jati fondasi rumah tahan gempa' },
      { answer: 'ATAP', clue: 'Atap jerami rumbia atau ijuk penyejuk ruangan dari terik matahari' },
      { answer: 'IKLIM', clue: 'Rancangan arsitektur tropis ramah sirkulasi angin semilir' },
      { answer: 'ADAPTASI', clue: 'Kemampuan manusia purba menyesuaikan diri dengan alam sekitar' },
      { answer: 'ALAM', clue: 'Hidup menyatu selaras dengan ritme alam tanpa merusaknya' },
      { answer: 'RUKUN', clue: 'Tata ruang desa yang mempererat keakraban antarwarga kampung' },
    ],
  },
  {
    id: 'level_239_kearifan_lokal',
    title: 'Kearifan Lokal Menjaga Alam',
    category: 'Antropologi',
    words: [
      { answer: 'HUTAN', clue: 'Hutan lindung adat terlarang ditebang demi menjaga sumber air' },
      { answer: 'ADAT', clue: 'Hukum adat sakral sanksi bagi perusak kelestarian lingkungan' },
      { answer: 'LARANGAN', clue: 'Pantangan adat memancing di musim ikan bertelur demi regenerasi' },
      { answer: 'LESTARI', clue: 'Keseimbangan ekosistem alam yang terjaga utuh hingga kini' },
      { answer: 'MATA', clue: 'Mata air jernih pegunungan yang dijaga dari pencemaran sampah' },
      { answer: 'AIR', clue: 'Sumber kehidupan yang dihormati lewat upacara petik tirta' },
      { answer: 'JAGA', clue: 'Kewajiban generasi muda merawat warisan kearifan leluhur' },
      { answer: 'KRAMAT', clue: 'Kawasan suci berpagar alam tempat konservasi plasma nutfah' },
    ],
  },
  {
    id: 'level_240_keberagaman_budaya',
    title: 'Keberagaman Budaya Nusantara',
    category: 'Antropologi',
    words: [
      { answer: 'RAGAM', clue: 'Ratusan suku bangsa beraneka warna adat istiadat dan bahasa' },
      { answer: 'BUDAYA', clue: 'Hasil cipta rasa dan karsa luhur warisan peradaban bangsa' },
      { answer: 'BHINNEKA', clue: 'Meskipun beraneka rupa tetap satu jua dalam ikatan cinta negeri' },
      { answer: 'WARISAN', clue: 'Kekayaan pusaka takbenda dunia yang diakui oleh UNESCO' },
      { answer: 'ETNIS', clue: 'Kelompok masyarakat dengan kearifan tradisi yang unik memikat' },
      { answer: 'KAYA', clue: 'Kekayaan khazanah budaya Indonesia tiada tandingannya di dunia' },
      { answer: 'LESTARI', clue: 'Menjaga keberlangsungan seni dan budaya agar tidak punah' },
      { answer: 'BANGGA', clue: 'Kebanggaan mendalam menjadi bagian dari bangsa majemuk elok' },
    ],
  },

  // ==========================================
  // KATEGORI 25: Psikologi & Perilaku Manusia (Bab 241 - 250)
  // ==========================================
  {
    id: 'level_241_ragam_emosi_diri',
    title: 'Mengenal Ragam Emosi Diri',
    category: 'Psikologi',
    words: [
      { answer: 'SENANG', clue: 'Emosi positif rasa gembira saat impian berhasil tercapai' },
      { answer: 'SEDIH', clue: 'Rasa haru pilu saat menghadapi perpisahan atau kehilangan' },
      { answer: 'MARAH', clue: 'Gejolak emosi panas yang harus ditenangkan dengan nafas panjang' },
      { answer: 'TAKUT', clue: 'Respon alami tubuh saat merasakan ancaman atau bahaya sekitar' },
      { answer: 'KAGET', clue: 'Reaksi spontan terkejut saat mengalami peristiwa mendadak' },
      { answer: 'JENGKEL', clue: 'Rasa kesal sesaat yang bisa diatasi dengan bersikap lapang' },
      { answer: 'RASA', clue: 'Dinamika getaran hati nurani yang manusiawi dirasakan setiap orang' },
      { answer: 'HATI', clue: 'Muara kendali emosi yang dijaga tetap bersih dan tenang' },
    ],
  },
  {
    id: 'level_242_daya_ingat_memori',
    title: 'Daya Ingat & Memori Pikiran',
    category: 'Psikologi',
    words: [
      { answer: 'INGAT', clue: 'Kemampuan memanggil kembali memori pengalaman masa lalu' },
      { answer: 'MEMORI', clue: 'Penyimpanan informasi jangka panjang di jaringan otak manusia' },
      { answer: 'LUPA', clue: 'Keterbatasan ingatan manusiawi yang bisa diatasi dengan mencatat' },
      { answer: 'CATAT', clue: 'Menuliskan poin penting di buku sebagai alat bantu daya ingat' },
      { answer: 'ASAH', clue: 'Melatih ketajaman otak lewat permainan teka-teki silang harian' },
      { answer: 'OTAK', clue: 'Organ cerdas pusat memori pikiran nalar dan kreativitas' },
      { answer: 'JEJAK', clue: 'Rekaman pengalaman emosional yang berbekas di sanubari' },
      { answer: 'SIMPAN', clue: 'Menyimpan ilmu pengetahuan bermanfaat di dalam memori kepala' },
    ],
  },
  {
    id: 'level_243_motivasi_pendorong',
    title: 'Motivasi & Pendorong Impian',
    category: 'Psikologi',
    words: [
      { answer: 'MOTIVASI', clue: 'Daya dorong internal dari dalam hati pemicu semangat bertindak' },
      { answer: 'SEMANGAT', clue: 'Kobaran api antusiasme melangkah maju menaklukkan rintangan' },
      { answer: 'DORONG', clue: 'Dorongan positif dari orang tua dan sahabat pengobar cita-cita' },
      { answer: 'CITA', clue: 'Impian mulia masa depan yang ingin diraih dengan kerja keras' },
      { answer: 'TEKAD', clue: 'Kemauan kuat pantang mundur sebelum berhasil mencapai tujuan' },
      { answer: 'GIGIH', clue: 'Sifat tekun tidak mudah menyerah saat menghadapi kegagalan' },
      { answer: 'MAJU', clue: 'Langkah kaki terus melangkah ke depan menjadi pribadi lebih baik' },
      { answer: 'YAKIN', clue: 'Keyakinan penuh atas potensi diri yang mampu berkembang unggul' },
    ],
  },
  {
    id: 'level_244_empati_kepedulian',
    title: 'Empati & Kepedulian Sosial',
    category: 'Psikologi',
    words: [
      { answer: 'EMPATI', clue: 'Kemampuan merasakan dan memahami apa yang dialami orang lain' },
      { answer: 'PEDULI', clue: 'Perhatian hangat tergerak membantu meringankan beban sesama' },
      { answer: 'PEKA', clue: 'Kepekaan perasaan menangkap kesedihan kawan tanpa perlu diminta' },
      { answer: 'RASA', clue: 'Menempatkan rasa diri di posisi sepatu orang lain dengan adil' },
      { answer: 'PAHAM', clue: 'Mengerti sudut pandang dan latar belakang kesulitan sahabat' },
      { answer: 'BANTU', clue: 'Mengulurkan tangan memberikan pertolongan nyata penuh kasih' },
      { answer: 'DENGAR', clue: 'Menjadi pendengar yang baik saat teman sedang mencurahkan isi hati' },
      { answer: 'TULUS', clue: 'Memberikan pelukan simpati tanpa pamrih imbalan apa pun' },
    ],
  },
  {
    id: 'level_245_kebiasaan_positif',
    title: 'Membentuk Kebiasaan Positif',
    category: 'Psikologi',
    words: [
      { answer: 'KEBIASAAN', clue: 'Pola perilaku otomatis yang terbentuk dari pengulangan harian' },
      { answer: 'RUTIN', clue: 'Aktivitas baik yang dijalankan teratur setiap pagi dan sore' },
      { answer: 'DISIPLIN', clue: 'Kekuatan tekad mengalahkan rasa malas demi kebaikan diri' },
      { answer: 'ULANG', clue: 'Mengulang tindakan positif setiap hari hingga menjadi reflek' },
      { answer: 'KONSISTEN', clue: 'Keteguhan memelihara kebiasaan baik tanpa putus di tengah jalan' },
      { answer: 'HASIL', clue: 'Buah manis perubahan karakter positif yang dirasakan bertahap' },
      { answer: 'BAIK', clue: 'Menanam kebiasaan membaca bangun pagi dan bertutur santun' },
      { answer: 'HARI', clue: 'Komitmen membenahi diri menjadi satu persen lebih baik tiap hari' },
    ],
  },
  {
    id: 'level_246_persepsi_sudut_pandang',
    title: 'Persepsi & Sudut Pandang',
    category: 'Psikologi',
    words: [
      { answer: 'PANDANG', clue: 'Cara pandang kacamata pikiran memaknai setiap peristiwa hidup' },
      { answer: 'SUDUT', clue: 'Melihat masalah dari sudut pandang luas dan positif optimis' },
      { answer: 'LIHAT', clue: 'Tidak sekadar melihat tetapi memahami hikmah di balik musibah' },
      { answer: 'PIKIR', clue: 'Pikiran positif pembawa ketenangan dan jalan keluar masalah' },
      { answer: 'MAKNA', clue: 'Memberi makna berharga atas setiap pembelajaran hidup' },
      { answer: 'SIKAP', clue: 'Respon bijak dalam menghadapi kritik dan perbedaan pendapat' },
      { answer: 'FOKUS', clue: 'Memusatkan energi pada hal-hal yang bisa dikendalikan diri' },
      { answer: 'BIJAK', clue: 'Kematangan nalar tidak terburu-buru menghakimi orang lain' },
    ],
  },
  {
    id: 'level_247_konsentrasi_kejernihan',
    title: 'Konsentrasi & Kejernihan Fokus',
    category: 'Psikologi',
    words: [
      { answer: 'FOKUS', clue: 'Pemusatan perhatian penuh pada satu tugas hingga tuntas' },
      { answer: 'TENANG', clue: 'Kondisi batin hening bebas dari gangguan bising pikiran' },
      { answer: 'HENING', clue: 'Suasana sunyi yang sangat mendukung produktivitas belajar' },
      { answer: 'ASAH', clue: 'Melatih konsentrasi lewat membaca buku dan bermain TTS' },
      { answer: 'CERMAT', clue: 'Ketelitian mengamati detail huruf teka-teki tanpa ceroboh' },
      { answer: 'TELITI', clue: 'Sikap hati-hati memeriksa kembali jawaban sebelum selesai' },
      { answer: 'BERSIH', clue: 'Pikiran bersih dari beban distraksi media sosial saat bekerja' },
      { answer: 'PIKIR', clue: 'Kejernihan daya nalar menghasilkan keputusan yang tepat' },
    ],
  },
  {
    id: 'level_248_kepribadian_potensi',
    title: 'Kepribadian & Potensi Diri',
    category: 'Psikologi',
    words: [
      { answer: 'BAKAT', clue: 'Potensi istimewa bawaan lahir yang siap diasah hingga bersinar' },
      { answer: 'WATAK', clue: 'Ciri kepribadian unik pembeda karakter antarsesama manusia' },
      { answer: 'SIFAT', clue: 'Tabiat bawaan diri yang bisa dibentuk menuju kebaikan budi' },
      { answer: 'UNIK', clue: 'Setiap manusia diciptakan berbeda dengan kelebihan tersendiri' },
      { answer: 'KENAL', clue: 'Mengenal kelemahan dan kekuatan diri sebagai awal kemajuan' },
      { answer: 'DIRI', clue: 'Menerima dan mencintai diri sendiri apa adanya dengan syukur' },
      { answer: 'ASAH', clue: 'Mengembangkan bakat minat lewat latihan tekun tiada henti' },
      { answer: 'TUMBUH', clue: 'Pertumbuhan kepribadian yang kian matang bijak dan dewasa' },
    ],
  },
  {
    id: 'level_249_percaya_diri',
    title: 'Rasa Percaya Diri & Keberanian',
    category: 'Psikologi',
    words: [
      { answer: 'PERCAYA', clue: 'Rasa percaya diri meyakini kemampuan diri menyelesaikan tugas' },
      { answer: 'YAKIN', clue: 'Keyakinan mantap melangkah tanpa dihantui rasa ragu cemas' },
      { answer: 'MAMPU', clue: 'Kesadaran bahwa diri sanggup belajar menguasai hal-hal baru' },
      { answer: 'BERANI', clue: 'Keberanian keluar dari zona nyaman mencoba tantangan baru' },
      { answer: 'TAMPIL', clue: 'Percaya diri berbicara dan menunjukkan karya di depan umum' },
      { answer: 'TEGAP', clue: 'Postur tubuh tegak kepala terangkat lambang keberanian' },
      { answer: 'MAJU', clue: 'Menolak takut gagal dan terus bangkit melangkah ke depan' },
      { answer: 'OPTIMIS', clue: 'Pandangan penuh harapan bahwa hari esok akan lebih baik' },
    ],
  },
  {
    id: 'level_250_puncak_jiwa_tenang',
    title: 'Puncak Kesadaran Dua Ratus Lima Puluh Bab',
    category: 'Psikologi',
    words: [
      { answer: 'DAMAI', clue: 'Kedamaian batin sejati buah dari perjalanan panjang mengasah nalar' },
      { answer: 'IKHLAS', clue: 'Kelapangan dada menerima seluruh takdir dengan senyum syukur' },
      { answer: 'SYUKUR', clue: 'Rasa syukur tak terhingga menuntaskan 250 bab teka-teki kata' },
      { answer: 'BAHAGIA', clue: 'Kebahagiaan mendalam menikmati indahnya kekayaan bahasa bangsa' },
      { answer: 'BIJAK', clue: 'Kematangan akal budi ksatria kata yang berilmu dan rendah hati' },
      { answer: 'TENANG', clue: 'Ketenangan jiwa yang abadi menyatu dalam keharmonisan semesta' },
      { answer: 'HARMONIS', clue: 'Keselarasan antara pikiran perkataan dan tindakan terpuji' },
      { answer: 'SEMPURNA', clue: 'Puncak ketuntasan mahakarya dua ratus lima puluh bab gemilang' },
    ],
  },
];

console.log('Compiling Bab 201 to 250...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledNewLevels = [];

for (let i = 0; i < new50Levels.length; i++) {
  const def = new50Levels[i];
  const globalLevelIndex = 200 + i + 1; // Bab 201 to 250
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/250] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledNewLevels.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all250Levels = [...existingLevels.slice(0, 200), ...compiledNewLevels];

fs.writeFileSync(levelsFilePath, JSON.stringify(all250Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 250 levels into ${levelsFilePath}!`);
