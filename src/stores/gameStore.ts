import { create } from 'zustand';
import type {
  MtgCard,
  HintResult,
  GuessRecord,
  GameStatus,
  GameStats,
  FormatOption,
  DifficultyOption,
  GameDifficulty,
  ScoreBreakdown,
  ScoreEvent,
} from '@/types/card';
import { HintEngine } from '@/engine/hint-engine';
import { GuessMatcher } from '@/engine/guess-matcher';
import { selectCard } from '@/engine/card-selector';

/** 可选赛制 */
export const FORMAT_OPTIONS: FormatOption[] = [
  { code: null, name: '全部赛制' },
  { code: 'standard', name: '标准 (Standard)' },
  { code: 'pioneer', name: '先驱 (Pioneer)' },
  { code: 'modern', name: '现代 (Modern)' },
  { code: 'legacy', name: '薪传 (Legacy)' },
  { code: 'vintage', name: '特选 (Vintage)' },
  { code: 'commander', name: '指挥官 (Commander)' },
  { code: 'pauper', name: '贫民 (Pauper)' },
  { code: 'duel', name: '法禁 (Duel Commander)' },
  { code: 'premodern', name: '前现代 (Premodern)' },
];

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { code: 'easy', name: '简单', description: '套牌使用热度 > 100' },
  { code: 'normal', name: '中等', description: '套牌使用热度 > 10' },
  { code: 'hard', name: '困难', description: '套牌使用热度 > 0' },
];

const GUESS_PENALTY_BY_LEVEL: Record<number, number> = {
  1: 20,
  2: 35,
  3: 55,
  4: 80,
  5: 110,
  6: 150,
};

const HINT_PENALTY_BY_LEVEL: Record<number, number> = {
  1: 20,
  2: 25,
  3: 35,
  4: 45,
  5: 55,
  6: 70,
};

function getBaseScore(deckCount: number): number {
  if (deckCount <= 10) return 1000;
  if (deckCount <= 25) return 940;
  if (deckCount <= 50) return 880;
  if (deckCount <= 100) return 820;
  if (deckCount <= 250) return 740;
  if (deckCount <= 500) return 660;
  if (deckCount <= 1000) return 580;
  return 500;
}

function calculateScore(
  deckCount: number,
  scoreEvents: ScoreEvent[],
  gaveUp = false
): ScoreBreakdown {
  const baseScore = getBaseScore(deckCount);
  const guessPenalty = scoreEvents
    .filter((event) => event.type === 'guess')
    .reduce((sum, event) => sum + event.penalty, 0);
  const hintPenalty = scoreEvents
    .filter((event) => event.type === 'hint')
    .reduce((sum, event) => sum + event.penalty, 0);
  const rawScore = baseScore - guessPenalty - hintPenalty;

  return {
    score: gaveUp ? 0 : Math.max(60, rawScore),
    maxScore: 1000,
    baseScore,
    guessPenalty,
    hintPenalty,
    deckCount,
  };
}

function getHintLevelForProgressCount(progressCount: number): number {
  return Math.min(Math.floor(progressCount / 5) + 1, 6);
}

/** 获取今日 UTC 日期字符串 */
function getTodayUTCDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 从 localStorage 读取统计 */
function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem('mtgturtle_stats');
    if (raw) return JSON.parse(raw) as GameStats;
  } catch { /* ignore */ }
  return {
    totalGames: 0,
    totalWins: 0,
    totalGuesses: 0,
    bestScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: '',
  };
}

/** 保存统计到 localStorage */
function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem('mtgturtle_stats', JSON.stringify(stats));
  } catch { /* ignore */ }
}

interface GameState {
  // 当前目标卡牌
  targetCard: MtgCard | null;
  targetDeckCount: number;

  // 提示引擎
  hintEngine: HintEngine | null;
  hintsRevealed: HintResult[];
  hintProgressCount: number;
  scoreEvents: ScoreEvent[];

  // 猜测
  guesses: GuessRecord[];
  matcher: GuessMatcher;

  // 游戏状态
  status: GameStatus;
  loadingMessage: string;

  // 设置
  formatFilter: string | null;
  difficulty: GameDifficulty;

  // 统计
  stats: GameStats;

  // Actions
  startGame: () => Promise<void>;
  submitGuess: (input: string) => Promise<boolean>;
  requestHint: () => void;
  giveUp: () => void;
  resetGame: () => void;
  setFormatFilter: (format: string | null) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  getScore: () => ScoreBreakdown;
}

export const useGameStore = create<GameState>((set, get) => ({
  targetCard: null,
  targetDeckCount: 0,
  hintEngine: null,
  hintsRevealed: [],
  hintProgressCount: 0,
  scoreEvents: [],
  guesses: [],
  matcher: new GuessMatcher(),
  status: 'idle',
  loadingMessage: '',
  formatFilter: null,
  difficulty: 'normal',
  stats: loadStats(),

  startGame: async () => {
    set({
      status: 'loading',
      loadingMessage: '正在随机抽取卡牌...',
      guesses: [],
      hintsRevealed: [],
      hintProgressCount: 0,
      scoreEvents: [],
      targetCard: null,
      targetDeckCount: 0,
      hintEngine: null,
    });

    const state = get();

    try {
      set({ loadingMessage: '正在获取卡牌信息...' });
      const { card, deckCount } = await selectCard(
        state.formatFilter,
        state.difficulty,
        (attempt, name, reason) => {
          set({
            loadingMessage: `第 ${attempt} 次重抽：${name}（${reason}）`,
          });
        }
      );

      const engine = HintEngine.fromCard(card);
      const initialHint = engine.getRandomInitial();

      set({
        targetCard: card,
        targetDeckCount: deckCount,
        hintEngine: engine,
        hintsRevealed: initialHint ? [initialHint] : [],
        status: 'playing',
        loadingMessage: '',
      });
    } catch (err) {
      console.error('Failed to start game:', err);
      set({ status: 'idle', loadingMessage: '' });
    }
  },

  submitGuess: async (input: string) => {
    const {
      targetCard,
      targetDeckCount,
      matcher,
      hintEngine,
      hintsRevealed,
      guesses,
      scoreEvents,
    } = get();
    if (!targetCard || !hintEngine) return false;

    const isCorrect = matcher.isExactMatch(input, targetCard);

    const guessRecord: GuessRecord = {
      input,
      timestamp: Date.now(),
      isCorrect,
    };

    if (isCorrect) {
      const newGuesses = [...guesses, guessRecord];
      set({ guesses: newGuesses, status: 'won' });
      const score = calculateScore(targetDeckCount, scoreEvents).score;

      // 更新统计
      const stats = get().stats;
      const today = getTodayUTCDate();
      const newStats: GameStats = {
        totalGames: stats.totalGames + 1,
        totalWins: stats.totalWins + 1,
        totalGuesses: stats.totalGuesses + newGuesses.length,
        bestScore: Math.max(stats.bestScore, score),
        currentStreak:
          stats.lastPlayedDate === today ? stats.currentStreak + 1 : 1,
        maxStreak: Math.max(
          stats.maxStreak,
          stats.lastPlayedDate === today ? stats.currentStreak + 1 : 1
        ),
        lastPlayedDate: today,
      };
      saveStats(newStats);
      set({ stats: newStats });

      return true;
    } else {
      // 揭示下一条提示
      const newGuesses = [...guesses, guessRecord];
      const nextProgressCount = get().hintProgressCount + 1;
      const level = getHintLevelForProgressCount(nextProgressCount);
      const nextHint = hintEngine.revealNext(
        level
      );
      const newHints = nextHint
        ? [...hintsRevealed, nextHint]
        : hintsRevealed;

      set({
        guesses: newGuesses,
        hintsRevealed: newHints,
        hintProgressCount: nextProgressCount,
        scoreEvents: [
          ...scoreEvents,
          {
            type: 'guess',
            level,
            penalty: GUESS_PENALTY_BY_LEVEL[level],
          },
        ],
      });

      return false;
    }
  },

  requestHint: () => {
    const { hintEngine, hintsRevealed, status, hintProgressCount, scoreEvents } = get();
    if (!hintEngine || status !== 'playing' || hintEngine.isExhausted()) return;

    const nextProgressCount = hintProgressCount + 1;
    const level = getHintLevelForProgressCount(nextProgressCount);
    const nextHint = hintEngine.revealNext(level);

    set({
      hintsRevealed: nextHint ? [...hintsRevealed, nextHint] : hintsRevealed,
      hintProgressCount: nextProgressCount,
      scoreEvents: [
        ...scoreEvents,
        {
          type: 'hint',
          level,
          penalty: HINT_PENALTY_BY_LEVEL[level],
        },
      ],
    });
  },

  giveUp: () => {
    const stats = get().stats;
    const today = getTodayUTCDate();
    const newStats: GameStats = {
      ...stats,
      totalGames: stats.totalGames + 1,
      currentStreak: 0,
      lastPlayedDate: today,
    };
    saveStats(newStats);
    set({ status: 'gaveUp', stats: newStats });
  },

  resetGame: () => {
    set({
      status: 'idle',
      targetCard: null,
      targetDeckCount: 0,
      hintEngine: null,
      hintsRevealed: [],
      hintProgressCount: 0,
      scoreEvents: [],
      guesses: [],
      loadingMessage: '',
    });
  },

  setFormatFilter: (format: string | null) => {
    set({ formatFilter: format });
  },

  setDifficulty: (difficulty: GameDifficulty) => {
    set({ difficulty });
  },

  getScore: () => {
    const { targetDeckCount, scoreEvents, status } = get();
    return calculateScore(targetDeckCount, scoreEvents, status === 'gaveUp');
  },
}));
