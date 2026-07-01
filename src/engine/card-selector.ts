import type { MtgCard } from '@/types/card';
import { fetchRandomCard, fetchCardDetail, fetchDeckCount } from '@/api/mtgch';

/** 基本地牌名，需要排除 */
const BASIC_LANDS = new Set([
  'Plains', 'Island', 'Swamp', 'Mountain', 'Forest',
]);

/** Token 类型关键词 */
const TOKEN_TYPES = ['Token', 'Vanguard', 'Card'];

/** 热度过滤阈值 */
const POPULARITY_THRESHOLDS = [
  { min: 0, max: 0, acceptRate: 0 },
  { min: 1, max: 9, acceptRate: 0.2 },
  { min: 10, max: 99, acceptRate: 0.6 },
  { min: 100, max: 499, acceptRate: 1.0 },
  { min: 500, max: Infinity, acceptRate: 1.0 },
];

function isToken(card: MtgCard): boolean {
  return TOKEN_TYPES.some((t) => card.type_line.startsWith(t));
}

function isBasicLand(card: MtgCard): boolean {
  return BASIC_LANDS.has(card.name);
}

function getAcceptRate(deckCount: number): number {
  for (const t of POPULARITY_THRESHOLDS) {
    if (deckCount >= t.min && deckCount <= t.max) {
      return t.acceptRate;
    }
  }
  return 1.0;
}

/** 处理双面牌：返回正面作为答案 */
function normalizeCard(card: MtgCard): MtgCard {
  // 双面牌：如果 layout 是 transform/modal_double_faced/split 等
  // is_default=true 或 face_index=0/-1 的是正面
  if (card.other_faces && card.other_faces.length > 0) {
    // 返回主面（正面）即可，答案就是主面的 name
    // 如果是双面牌，name 通常是 "Front // Back" 格式
    // 我们用 face_name（如果存在）或者 name 的 "//" 前半部分作为答案
    return card;
  }
  return card;
}

/**
 * 核心：选取一张适合游戏的卡牌
 * @param formatCode 赛制过滤（null = 全部）
 * @param onRetry 每次重试的回调，用于更新 UI 状态
 */
export async function selectCard(
  formatCode?: string | null,
  onRetry?: (attempt: number, cardName: string, reason: string) => void
): Promise<MtgCard> {
  let attempt = 0;

  while (true) {
    attempt++;

    // Step 1: 随机获取
    const random = await fetchRandomCard();

    // Step 2: 获取详情
    const card = await fetchCardDetail(random.set, random.collector_number);

    // Step 3: 过滤
    if (isBasicLand(card)) {
      onRetry?.(attempt, card.name, '基本地');
      continue;
    }

    if (isToken(card)) {
      onRetry?.(attempt, card.name, 'Token/特殊牌');
      continue;
    }

    // Step 4: 查询热度
    const { count } = await fetchDeckCount(card.oracle_id, formatCode);

    if (count === 0) {
      onRetry?.(attempt, card.name, '套牌数为 0');
      continue;
    }

    const acceptRate = getAcceptRate(count);
    if (Math.random() >= acceptRate) {
      onRetry?.(
        attempt,
        card.name,
        `套牌数 ${count}，接受率 ${(acceptRate * 100).toFixed(0)}%`
      );
      continue;
    }

    // 通过！返回
    return normalizeCard(card);
  }
}
