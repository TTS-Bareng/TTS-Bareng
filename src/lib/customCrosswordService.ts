import { supabase } from './supabase';

export const isPublishedCrosswordId = (id: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const BLOCKS_KEY = 'moderation_blocked_creators_v1';

function blockedCreators(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(BLOCKS_KEY) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch { return []; }
}

export async function publishCrossword(item: {title: string; category?: string; wordsList: {word: string; clue: string}[]}): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new Error('Masuk ke akun untuk membagikan kreasi.');
  const { data, error } = await supabase.rpc('publish_crossword', {
    p_title: item.title,
    p_category: item.category || 'Kreasi',
    p_words: item.wordsList.map(w => ({word: w.word.trim().toUpperCase(), clue: w.clue.trim()})),
  });
  if (error || typeof data !== 'string') throw new Error('Kreasi belum terkirim. Periksa koneksi, batas publikasi, atau hubungi dukungan.');
  return data;
}

export async function readPublishedCrossword(id: string): Promise<{
  id: string; authorId: string; title: string; category: string; wordsList: {word: string; clue: string}[];
} | null> {
  if (!isPublishedCrosswordId(id)) return null;
  const {data, error} = await supabase.rpc('read_published_crossword', {p_id: id});
  if (error || !data || blockedCreators().includes(data.authorId)) return null;
  return data;
}

export async function reportAndBlockCrossword(id: string): Promise<string> {
  const content = await readPublishedCrossword(id);
  if (!content) throw new Error('Konten tidak tersedia.');
  const {error} = await supabase.rpc('report_crossword', {p_id: id, p_reason: 'offensive'});
  if (error) throw new Error('Laporan belum terkirim. Periksa koneksi dan coba lagi.');
  // Guests have device-local blocks; signed-in users also have server-side blocks.
  localStorage.setItem(BLOCKS_KEY, JSON.stringify([...new Set([...blockedCreators(), content.authorId])]));
  return content.authorId;
}
