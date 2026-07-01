import { useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { GameMode } from '@/types/card';

/** 核心游戏逻辑 hook */
export function useGame() {
  const store = useGameStore();

  const startGame = useCallback(
    (mode: GameMode) => store.startGame(mode),
    [store.startGame]
  );

  const submitGuess = useCallback(
    (input: string) => store.submitGuess(input),
    [store.submitGuess]
  );

  return {
    // State
    mode: store.mode,
    targetCard: store.targetCard,
    hintsRevealed: store.hintsRevealed,
    guesses: store.guesses,
    status: store.status,
    loadingMessage: store.loadingMessage,
    formatFilter: store.formatFilter,
    stats: store.stats,

    // Actions
    startGame,
    submitGuess,
    giveUp: store.giveUp,
    resetGame: store.resetGame,
    setFormatFilter: store.setFormatFilter,
    getScore: store.getScore,
  };
}
