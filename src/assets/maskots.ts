/**
 * Mascot Assets Mapping (WebP with Transparent Background)
 * Optimized for dynamic theme cards across Home, Social, Profile, and Quests.
 */

export const MASCOTS = {
  // 1. Streak State Reactions (Duolingo-style dynamic emotion)
  lostStreakBoy: '/maskot/Plush Boy Crying Over Lost Streak.webp',
  cheerfulBookBoy: '/maskot/Cheerful Puzzle Book Boy.webp',

  // 2. Solo Quest & Puzzle Solving
  boySolvingPuzzle: '/maskot/Plush Boy Solving a Puzzle.webp',
  puzzleMoment: '/maskot/Plush Crossword Puzzle Moment.webp',
  puzzleGamer: '/maskot/Plush Puzzle Gamer with Cozy Accessories.webp',
  crosswordThinker: '/maskot/Plush Crossword Thinker.webp',
  crosswordGirl: '/maskot/Plush Crossword Puzzle Girl.webp',
  puzzleScholar: '/maskot/Fuzzy Crossword Puzzle Mascot.webp',

  // 3. Cultural & Indonesian Identity
  batikWordsmith: '/maskot/Plush Indonesian Batik Wordsmith Mascot.webp',
  indonesianPuzzleKid: '/maskot/Plush Indonesian Puzzle Kid.webp',

  // 4. Social & Multiplayer (Mabar & Arena)
  friendsPlaying: '/maskot/Fuzzy Crossword Friends Playing Together.webp',
  indonesianPuzzlePals: '/maskot/Plush Indonesian Puzzle Pals.webp',
  crosswordDuel: '/maskot/Plush Crossword Duel at 00_45.webp',
  techSavvyWalker: '/maskot/Plush Tech-Savvy Walker.webp',
  crosswordChampion: '/maskot/Fierce Plush Crossword Champion.webp',
  crosswordBoard: '/maskot/Playful Plush Crossword Board.webp',
  puzzleExplorer: '/maskot/Cheerful Plush Puzzle Explorer.webp',
  crosswordGirlSticker: '/maskot/Cute Plush Crossword Girl Sticker.webp',
  tournamentChampions: '/maskot/TTS Crossword Champions Tournament.webp',
} as const;

export type MascotKey = keyof typeof MASCOTS;
