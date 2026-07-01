import { create } from 'zustand';
import type {
  MtgCard,
  HintResult,
  GuessRecord,
  GameStatus,
  GameMode,
  GameStats,
  FormatOption,
  ScoreCalculator,
} from '@/types/card';
import { HintEngine } from '@/engine/hint-engine';
import { GuessMatcher } from '@/engine/guess-matcher';
import { selectCard } from '@/engine/card-selector';
import { getTodayUTCDate } from '@/engine/daily-challenge';

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

/** 评分计算器（第一版仅猜测次数评分） */
const guessCountScorer: ScoreCalculator = {
  id: 'guess_count',
  name: '猜测次数',
  calculate: (guessCount: number) => {
    if (guessCount === 1) return 100;
    if (guessCount <= 3) return 80;
    if (guessCount <= 6) return 60;
    if (guessCount <= 10) return 40;
    return 20;
  },
  weight: 1,
};

const SCORERS: ScoreCalculator[] = [guessCountScorer];

/** 计算最终得分 */
function calculateScore(guessCount: number, _hintsRevealed: number): number {
  const totalWeight = SCORERS.reduce((s, sc) => s + sc.weight, 0);
  const weightedSum = SCORERS.reduce(
    (s, sc) => s + sc.calculate(guessCount, 0) * sc.weight,
    0
  );
  return Math.round(weightedSum / totalWeight);
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
  // 游戏模式
  mode: GameMode;

  // 当前目标卡牌
  targetCard: MtgCard | null;

  // 提示引擎
  hintEngine: HintEngine | null;
  hintsRevealed: HintResult[];

  // 猜测
  guesses: GuessRecord[];
  matcher: GuessMatcher;

  // 游戏状态
  status: GameStatus;
  loadingMessage: string;

  // 设置
  formatFilter: string | null;

  // 统计
  stats: GameStats;

  // 每日挑战
  dailyCompleted: boolean;
  dailyCardId: string | null;

  // Actions
  startGame: (mode: GameMode) => Promise<void>;
  submitGuess: (input: string) => Promise<boolean>;
  giveUp: () => void;
  resetGame: () => void;
  setFormatFilter: (format: string | null) => void;
  getScore: () => { score: number; maxScore: number };
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'free',
  targetCard: null,
  hintEngine: null,
  hintsRevealed: [],
  guesses: [],
  matcher: new GuessMatcher(),
  status: 'idle',
  loadingMessage: '',
  formatFilter: null,
  stats: loadStats(),
  dailyCompleted: false,
  dailyCardId: null,

  startGame: async (mode: GameMode) => {
    set({
      status: 'loading',
      loadingMessage: '正在随机抽取卡牌...',
      mode,
      guesses: [],
      hintsRevealed: [],
      targetCard: null,
      hintEngine: null,
    });

    const state = get();

    // 每日挑战检查是否已完成
    if (mode === 'daily') {
      const today = getTodayUTCDate();
      const completed = localStorage.getItem(`daily_${today}`);
      if (completed) {
        // 今天已完成，加载昨日数据
        const savedCardId = localStorage.getItem(`daily_card_${today}`);
        set({ dailyCompleted: true, dailyCardId: savedCardId });
        // 仍然让玩家玩（查看答案），但不计入统计
      }
    }

    try {
      set({ loadingMessage: '正在获取卡牌信息...' });
      const card = await selectCard(state.formatFilter, (attempt, name, reason) => {
        set({
          loadingMessage: `第 ${attempt} 次重抽：${name}（${reason}）`,
        });
      });

      const engine = HintEngine.fromCard(card);
      const initialHint = engine.getRandomInitial();

      set({
        targetCard: card,
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
    const { targetCard, matcher, hintEngine, hintsRevealed, guesses } = get();
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

      // 更新统计
      const stats = get().stats;
      const today = getTodayUTCDate();
      const newStats: GameStats = {
        totalGames: stats.totalGames + 1,
        totalWins: stats.totalWins + 1,
        totalGuesses: stats.totalGuesses + newGuesses.length,
        bestScore: Math.max(
          stats.bestScore,
          calculateScore(newGuesses.length, hintsRevealed.length)
        ),
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

      // 每日挑战标记完成
      if (get().mode === 'daily') {
        localStorage.setItem(`daily_${today}`, 'completed');
        localStorage.setItem(`daily_card_${today}`, targetCard.oracle_id);
      }

      return true;
    } else {
      // 揭示下一条提示
      const nextHint = hintEngine.revealNext();
      const newHints = nextHint
        ? [...hintsRevealed, nextHint]
        : hintsRevealed;

      set({
        guesses: [...guesses, guessRecord],
        hintsRevealed: newHints,
      });

      return false;
    }
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
      hintEngine: null,
      hintsRevealed: [],
      guesses: [],
      loadingMessage: '',
    });
  },

  setFormatFilter: (format: string | null) => {
    set({ formatFilter: format });
  },

  getScore: () => {
    const { guesses, hintsRevealed } = get();
    const score = calculateScore(guesses.length, hintsRevealed.length);
    return { score, maxScore: 100 };
  },
}));
