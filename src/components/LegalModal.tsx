import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, ShieldCheck, Scale, BookOpen, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const LegalModal: React.FC = () => {
  const { isLegalModalOpen, closeLegalModal, legalModalTab, setLegalModalTab } = useGameStore();
  const dragControls = useDragControls();

  if (!isLegalModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeLegalModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Slide-up Glass Sheet with Native Drag-to-Dismiss */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80 || info.velocity.y > 350) {
              closeLegalModal();
            }
          }}
          className="relative w-full max-w-[430px] mx-auto max-h-[85vh] rounded-t-[32px] px-4.5 pt-4.5 pb-[max(1.25rem,calc(0.75rem+env(safe-area-inset-bottom)))] flex flex-col gap-3 shadow-2xl border-t border-black/5 dark:border-white/15 z-10 overflow-hidden liquid-glass-card"
        >
          {/* Specular Top Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Top Handle Pill - Draggable */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="w-full flex flex-col items-center pt-0 pb-1 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
          >
            <div
              onClick={closeLegalModal}
              className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/25 mx-auto hover:bg-black/30 dark:hover:bg-white/40 transition-colors"
            />
          </div>

          {/* Header Row */}
          <div
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              dragControls.start(e);
            }}
            className="flex items-center justify-between pb-0.5 shrink-0 cursor-grab active:cursor-grabbing select-none"
          >
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
                KEPATUHAN & TRANSPARANSI
              </span>
              <h2 className="text-[17px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                Pusat Legal & Etika
              </h2>
            </div>

            <button
              type="button"
              onClick={closeLegalModal}
              title="Tutup"
              aria-label="Tutup Jendela Legal"
              className="w-8 h-8 rounded-full liquid-glass-tile border border-black/5 dark:border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer tactile-active shadow-2xs"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* 3-Segment Filter Bar */}
          <div className="w-full h-10 p-1 rounded-full liquid-glass-card flex items-center shrink-0 border border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setLegalModalTab('privacy')}
              className={`flex-1 h-full rounded-full text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-active ${
                legalModalTab === 'privacy'
                  ? 'liquid-glass-tile-active shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Privasi</span>
            </button>

            <button
              type="button"
              onClick={() => setLegalModalTab('terms')}
              className={`flex-1 h-full rounded-full text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-active ${
                legalModalTab === 'terms'
                  ? 'liquid-glass-tile-active shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Scale className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Ketentuan</span>
            </button>

            <button
              type="button"
              onClick={() => setLegalModalTab('kbbi')}
              className={`flex-1 h-full rounded-full text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-active ${
                legalModalTab === 'kbbi'
                  ? 'liquid-glass-tile-active shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Atribusi KBBI</span>
            </button>
          </div>

          {/* Content Area with smooth scroll */}
          <div className="flex-1 overflow-y-auto px-0.5 py-1 text-[11px] leading-relaxed text-[var(--text-secondary)] flex flex-col gap-3 select-text">
            {legalModalTab === 'privacy' && (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-2xl liquid-glass-card border border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Lock className="w-4 h-4 text-[var(--accent-main)]" />
                    <h3 className="text-[13px] font-black text-[var(--text-primary)]">
                      Kebijakan Privasi Pengguna
                    </h3>
                  </div>
                  <p className="text-[10.5px]">
                    Kami menghormati privasi Anda secara penuh. TTS Bareng dirancang dengan arsitektur <strong>Privacy-First & Local-First</strong> yang tidak menjual, melacak, atau menyalahgunakan data pribadi pemain.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      1. Penyimpanan Data Lokal
                    </h4>
                    <p className="text-[10px]">
                      Identitas pemain, perolehan bintang, kemajuan bab, dan riwayat level disimpan secara eksklusif di memori lokal peramban Anda (<code>localStorage</code>). Kami tidak menyimpan kata sandi dan tidak mengumpulkan informasi sensitif.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      2. Sesi Bermain Bersama (Mabar)
                    </h4>
                    <p className="text-[10px]">
                      Sinkronisasi papan real-time saat bermain bersama teman berlangsung melalui saluran sesi WebSockets/WebRTC sementara. Ruang bermain bersifat anonim dan tidak ada riwayat permainan yang disimpan di server permanen setelah sesi selesai.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      3. Bebas Pelacak & Iklan Pihak Ketiga
                    </h4>
                    <p className="text-[10px]">
                      Aplikasi ini 100% bebas dari pelacak iklan pihak ketiga (no advertising SDKs, no behavioral tracking). Semua pengalaman bermain teka-teki silang dapat dinikmati secara murni dan aman.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      4. Hak Penghapusan Akun & Data (Apple 5.1.1v)
                    </h4>
                    <p className="text-[10px]">
                      Anda memiliki hak penuh untuk menghapus seluruh data dan profil Anda kapan pun melalui tombol <strong>Hapus Akun & Data</strong> di menu Pengaturan. Tindakan ini akan seketika membersihkan seluruh penyimpanan lokal perangkat Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {legalModalTab === 'terms' && (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-2xl liquid-glass-card border border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Scale className="w-4 h-4 text-[var(--accent-main)]" />
                    <h3 className="text-[13px] font-black text-[var(--text-primary)]">
                      Ketentuan Layanan Aplikasi
                    </h3>
                  </div>
                  <p className="text-[10.5px]">
                    Dengan menggunakan aplikasi TTS Bareng, Anda menyetujui ketentuan penggunaan wajar berikut ini demi menjaga ekosistem bermain yang edukatif dan sportif.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      1. Integritas & Sportivitas
                    </h4>
                    <p className="text-[10px]">
                      Aplikasi ditujukan sebagai media asah otak, pelestarian bahasa Indonesia, dan hiburan edukatif. Dilarang menggunakan skrip otomatis (bot) atau eksploitasi kode yang merusak pengalaman bermain dalam mode Mabar dan Turnamen Kilat.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      2. Etika Ruang Multiplayer
                    </h4>
                    <p className="text-[10px]">
                      Pengguna bertanggung jawab atas nama panggilan (nickname) yang digunakan dalam sesi mabar. Dilarang menggunakan kata-kata bernada kebencian, diskriminasi, pencemaran nama baik, atau konten ilegal.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      3. Ketersediaan Layanan
                    </h4>
                    <p className="text-[10px]">
                      Fitur solo dan glosarium kosakata dapat dimainkan secara penuh tanpa koneksi internet (100% offline). Layanan multiplayer online disediakan atas dasar ketersediaan jaringan peramban.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {legalModalTab === 'kbbi' && (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-2xl liquid-glass-card border border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <BookOpen className="w-4 h-4 text-[var(--accent-main)]" />
                    <h3 className="text-[13px] font-black text-[var(--text-primary)]">
                      Atribusi Resmi Bahasa & Kosakata
                    </h3>
                  </div>
                  <p className="text-[10.5px]">
                    Seluruh perbendaharaan kata, definisi, dan petunjuk silang dalam TTS Bareng disusun berpedoman pada kaidah linguistik baku dan rujukan leksikal resmi Republik Indonesia.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-[11.5px] text-[var(--text-primary)]">
                        Kamus Besar Bahasa Indonesia (KBBI)
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                    </div>
                    <p className="text-[10px]">
                      Disusun merujuk pada leksikografi <strong>Badan Pengembangan dan Pembinaan Bahasa</strong>, Kementerian Pendidikan Dasar dan Menengah Republik Indonesia, sebagai standar baku kosakata nasional.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                       Pelestarian Kosakata & Budaya Nusantara
                    </h4>
                    <p className="text-[10px]">
                      Kategori tematik mencakup kekayaan alam, arsitektur nusantara, fauna endemik, flora khatulistiwa, seni kuliner daerah, hingga istilah serapan modern guna memajukan literasi bahasa dan kebanggaan berbangsa.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <h4 className="font-black text-[11.5px] text-[var(--text-primary)] mb-1">
                      Aset Visual & Desain
                    </h4>
                    <p className="text-[10px]">
                      Karakter maskot 3D Plush, sistem tata suara tactile, dan antarmuka Apple Liquid Glass dibuat orisinal untuk TTS Bareng. Seluruh hak cipta visual dilindungi undang-undang.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Button */}
          <div className="pt-1 shrink-0">
            <button
              type="button"
              onClick={closeLegalModal}
              className="w-full py-2.5 rounded-full text-[11.5px] font-black cursor-pointer tactile-active shadow-xs text-center"
              style={{
                background: 'var(--accent-main)',
                color: 'var(--accent-contrast)',
              }}
            >
              Saya Mengerti & Setuju
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LegalModal;
