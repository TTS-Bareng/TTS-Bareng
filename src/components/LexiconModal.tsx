import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  X,
  BookOpen,
  Search,
  Lock,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

// Authentic phonetic and linguistic metadata helper for prominent words
const WORD_PHONETICS: Record<string, { phonetic: string; pos: string }> = {
  KOMODO: { phonetic: '/ko·mo·do/', pos: 'nomina' },
  BADAK: { phonetic: '/ba·dak/', pos: 'nomina' },
  ANOA: { phonetic: '/a·no·a/', pos: 'nomina' },
  ANGGREK: { phonetic: '/ang·grek/', pos: 'nomina' },
  BAKAU: { phonetic: '/ba·kau/', pos: 'nomina' },
  KUSKUS: { phonetic: '/kus·kus/', pos: 'nomina' },
  PANTUN: { phonetic: '/pan·tun/', pos: 'nomina' },
  SYAIR: { phonetic: '/sya·ir/', pos: 'nomina' },
  GURINDAM: { phonetic: '/gu·rin·dam/', pos: 'nomina' },
  PUJANGGA: { phonetic: '/pu·jang·ga/', pos: 'nomina' },
  PINISI: { phonetic: '/pi·ni·si/', pos: 'nomina' },
  SAMUDRA: { phonetic: '/sa·mu·dra/', pos: 'nomina' },
  RENDANG: { phonetic: '/ren·dang/', pos: 'nomina' },
  SATE: { phonetic: '/sa·te/', pos: 'nomina' },
  GUDENG: { phonetic: '/gu·deg/', pos: 'nomina' },
  SOTO: { phonetic: '/so·to/', pos: 'nomina' },
  SURYA: { phonetic: '/sur·ya/', pos: 'nomina' },
  ANGIN: { phonetic: '/ang·in/', pos: 'nomina' },
  OMBAK: { phonetic: '/om·bak/', pos: 'nomina' },
  WARNET: { phonetic: '/war·net/', pos: 'nomina' },
  RUMAH: { phonetic: '/ru·mah/', pos: 'nomina' },
};

interface LexiconWordItem {
  id: string;
  word: string;
  meaning: string;
  category: string;
  chapterTitle: string;
  chapterIndex: number;
  isUnlocked: boolean;
  phonetic?: string;
  pos?: string;
}

export const LexiconModal: React.FC = () => {
  const {
    isLexiconOpen,
    closeLexicon,
    levels,
    levelRecords,
  } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(60);

  useEffect(() => {
    setVisibleCount(60);
  }, [searchQuery, selectedCategory, isLexiconOpen]);
  const dragControls = useDragControls();

  // Compute all lexicon words across levels dynamically (Zero Dummy Data)
  const allLexiconWords = useMemo<LexiconWordItem[]>(() => {
    if (!isLexiconOpen) return [];
    const list: LexiconWordItem[] = [];
    const seenWords = new Set<string>();

    levels.forEach((lvl, lvlIdx) => {
      const record = levelRecords[lvl.id];
      const isLevelFinished = !!record?.completed;
      const solvedIds = record?.solved || [];

      const allClues = [...lvl.clues.across, ...lvl.clues.down];
      for (const clue of allClues) {
        if (seenWords.has(clue.answer)) continue;
        seenWords.add(clue.answer);

        const isUnlocked = isLevelFinished || solvedIds.includes(clue.id);
        const meta = WORD_PHONETICS[clue.answer];

        list.push({
          id: `${lvl.id}_${clue.id}`,
          word: clue.answer,
          meaning: clue.text,
          category: (lvl.category || 'Eksplorasi').toUpperCase(),
          chapterTitle: lvl.title,
          chapterIndex: lvlIdx + 1,
          isUnlocked,
          phonetic: meta?.phonetic || `/${clue.answer.toLowerCase()}/`,
          pos: meta?.pos || 'nomina',
        });
      }
    });

    return list;
  }, [isLexiconOpen, levels, levelRecords]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('SEMUA');
    for (const item of allLexiconWords) {
      cats.add(item.category);
    }
    return Array.from(cats);
  }, [allLexiconWords]);

  // Filtered words
  const filteredWords = useMemo(() => {
    return allLexiconWords.filter((item) => {
      const matchesCat = selectedCategory === 'SEMUA' || item.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.chapterTitle.toLowerCase().includes(q)
      );
    });
  }, [allLexiconWords, selectedCategory, searchQuery]);

  const totalWords = allLexiconWords.length;
  const unlockedCount = allLexiconWords.filter((w) => w.isUnlocked).length;
  const progressPercent = totalWords > 0 ? Math.round((unlockedCount / totalWords) * 100) : 0;

  if (!isLexiconOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeLexicon}
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
              closeLexicon();
            }
          }}
          className="relative w-full max-w-[430px] mx-auto max-h-[85vh] rounded-t-[32px] p-4.5 flex flex-col gap-3 shadow-2xl border-t border-black/5 dark:border-white/15 z-10 overflow-hidden liquid-glass-card"
        >
          {/* Specular Top Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Top Handle Pill - Draggable on mobile */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="w-full flex flex-col items-center pt-0 pb-1 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
          >
            <div
              onClick={closeLexicon}
              className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/25 mx-auto hover:bg-black/30 dark:hover:bg-white/40 transition-colors"
            />
          </div>

          {/* Header - Also draggable */}
          <div
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              dragControls.start(e);
            }}
            className="flex items-center justify-between pb-1 shrink-0 cursor-grab active:cursor-grabbing select-none"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-black tracking-tight leading-tight">
                  Buku Kosakata KBBI
                </h3>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                  {unlockedCount}/{totalWords} Kata
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                Koleksi kosakata nusantara yang telah berhasil Anda pecahkan
              </p>
            </div>

            <button
              type="button"
              onClick={closeLexicon}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] cursor-pointer tactile-active border border-black/5 dark:border-white/10"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Mastery Progress Bar with Subtle Theme Gradient */}
          <div
            className="p-3 rounded-2xl border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden flex flex-col gap-2 shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
            <div className="flex items-center justify-between text-[11px] font-bold relative z-10">
              <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
                <span>Penguasaan Leksikon</span>
              </span>
              <span className="font-bold text-[var(--accent-main)]">
                {progressPercent}% Lengkap
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden relative z-10">
              <div
                className="h-full rounded-full bg-[var(--accent-main)] transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 6)}%` }}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata atau arti..."
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl text-[11.5px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-hidden focus:border-[var(--accent-main)]/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[9px] font-black transition-all uppercase whitespace-nowrap cursor-pointer tactile-active ${
                  selectedCategory === cat
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Word List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {filteredWords.length === 0 ? (
              <div className="py-8 text-center text-[var(--text-secondary)]">
                <p className="text-[12px] font-medium">Tidak ada kata yang sesuai pencarian.</p>
              </div>
            ) : (
              filteredWords.slice(0, visibleCount).map((item) => {
                const isExpanded = expandedWordId === item.id;

                if (!item.isUnlocked) {
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] opacity-60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                          <Lock className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold tracking-widest text-[var(--text-secondary)]">
                              {'•'.repeat(item.word.length)}
                            </span>
                            <span className="text-[7.5px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-[var(--text-secondary)] mt-0.5 truncate">
                            Selesaikan Bab {item.chapterIndex} ({item.chapterTitle})
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-[var(--text-secondary)] shrink-0">
                        {item.word.length} Huruf
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => setExpandedWordId(isExpanded ? null : item.id)}
                    style={{
                      background: isExpanded
                        ? 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)'
                        : undefined,
                    }}
                    className="p-3 rounded-2xl border border-[var(--accent-main)]/20 bg-black/5 dark:bg-white/5 hover:border-[var(--accent-main)]/40 transition-all cursor-pointer tactile-active flex flex-col gap-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-[13px] font-black tracking-tight text-[var(--text-primary)]">
                              {item.word}
                            </span>
                            <span className="text-[9px] text-[var(--text-secondary)] italic">
                              {item.phonetic} • {item.pos}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                          Bab {item.chapterIndex}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-[var(--text-primary)] leading-snug pl-9">
                      "{item.meaning}"
                    </p>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-9 pt-1.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[9px] text-[var(--text-secondary)]"
                      >
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[var(--accent-main)]" />
                          <span>Kamus Besar Bahasa Indonesia (KBBI)</span>
                        </span>
                        <span className="font-bold">
                          {item.chapterTitle}
                        </span>
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
            {filteredWords.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 80)}
                className="w-full py-2.5 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 text-[11px] font-black cursor-pointer tactile-active mt-2"
              >
                Tampilkan Lebih Banyak ({filteredWords.length - visibleCount} kata lagi)
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
