import { create } from 'zustand';
import type { ChatMessage, MtgCard } from '@/types/card';
import { askLlm, detectGuess } from '@/api/llm';

const MAX_QUESTIONS = 100;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function buildCardInfo(card: MtgCard) {
  return {
    name: card.name,
    chineseName: card.atomic_official_name || card.atomic_translated_name || card.name,
    manaCost: card.mana_cost,
    cmc: card.cmc,
    colors: card.colors,
    typeLine: card.type_line,
    oracleText: card.atomic_translated_text || card.oracle_text || '',
    flavorText: card.atomic_translated_flavor_text || card.flavor_text || '',
    power: card.power ?? null,
    toughness: card.toughness ?? null,
    loyalty: card.loyalty ?? null,
    setName: card.set_translated_name || card.set_name,
    setType: card.set_type,
    rarity: card.rarity,
    artist: card.artist,
    releasedAt: card.released_at,
    keywords: card.keywords || [],
  };
}

function getTargetNames(card: MtgCard): string[] {
  const names: string[] = [card.name];
  if (card.face_name) names.push(card.face_name);
  if (card.name.includes(' // ')) names.push(card.name.split(' // ')[0]);
  if (card.atomic_official_name) names.push(card.atomic_official_name);
  if (card.atomic_translated_name) names.push(card.atomic_translated_name);
  if (card.full_translated_name) {
    names.push(card.full_translated_name);
    if (card.full_translated_name.includes(' // ')) {
      names.push(card.full_translated_name.split(' // ')[0]);
    }
  }
  return [...new Set(names.filter(Boolean))];
}

interface TurtleSoupState {
  messages: ChatMessage[];
  questionCount: number;
  targetCard: MtgCard | null;
  status: 'idle' | 'loading' | 'playing' | 'won' | 'gaveUp';
  loadingMessage: string;

  setTargetCard: (card: MtgCard) => void;
  sendMessage: (content: string) => Promise<{
    isCorrectGuess: boolean;
    matchedName?: string;
    answer?: string;
  }>;
  giveUp: () => void;
  reset: () => void;
}

export const useTurtleSoupStore = create<TurtleSoupState>((set, get) => ({
  messages: [],
  questionCount: 0,
  targetCard: null,
  status: 'idle',
  loadingMessage: '',

  setTargetCard: (card: MtgCard) => {
    set({ targetCard: card, status: 'playing', messages: [], questionCount: 0 });
  },

  sendMessage: async (content: string) => {
    const { targetCard, messages, questionCount } = get();
    if (!targetCard) {
      return { isCorrectGuess: false };
    }

    const targets = getTargetNames(targetCard);

    // 1. 检查是否是对牌名的猜测
    const { isGuess, matchedName } = detectGuess(content, targets);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    if (isGuess && matchedName) {
      // 玩家猜对了！
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `🎉 恭喜！你猜对了！这张牌就是「${matchedName}」！`,
        timestamp: Date.now(),
        isCorrectGuess: true,
      };

      set({
        messages: [...messages, userMsg, assistantMsg],
        status: 'won',
      });

      return { isCorrectGuess: true, matchedName };
    }

    if (isGuess) {
      // 玩家输入了牌名但没匹配到 → 当作猜测，告诉玩家不对
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `「${content.trim()}」不是正确答案，请继续思考。`,
        timestamp: Date.now(),
      };

      set({
        messages: [...messages, userMsg, assistantMsg],
      });

      return { isCorrectGuess: false };
    }

    // 2. 不是猜测 → 发提问给 LLM
    if (questionCount >= MAX_QUESTIONS) {
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '已达到本局提问次数上限（100次），请直接猜牌名吧。',
        timestamp: Date.now(),
      };

      set({
        messages: [...messages, userMsg, assistantMsg],
      });

      return { isCorrectGuess: false, answer: '已达上限' };
    }

    // 发送到 LLM
    set({ loadingMessage: '正在思考...' });

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await askLlm({
      question: content,
      cardInfo: buildCardInfo(targetCard),
      history,
    });

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: result.answer,
      timestamp: Date.now(),
    };

    set({
      messages: [...messages, userMsg, assistantMsg],
      questionCount: questionCount + 1,
      loadingMessage: '',
    });

    return { isCorrectGuess: false, answer: result.answer };
  },

  giveUp: () => {
    set({ status: 'gaveUp' });
  },

  reset: () => {
    set({
      messages: [],
      questionCount: 0,
      targetCard: null,
      status: 'idle',
      loadingMessage: '',
    });
  },
}));
