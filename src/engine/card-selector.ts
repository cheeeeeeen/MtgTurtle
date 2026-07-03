import type { GameDifficulty, MtgCard } from '@/types/card';
import { fetchRandomCard, fetchCardDetail, fetchDeckCount, fetchVersions } from '@/api/mtgch';

/** 基本地牌名，需要排除 */
const BASIC_LANDS = new Set([
  'Plains', 'Island', 'Swamp', 'Mountain', 'Forest',
]);

/** Token 类型关键词 */
const TOKEN_TYPES = ['Token', 'Vanguard', 'Card'];

const DIFFICULTY_MIN_DECK_COUNT: Record<GameDifficulty, number> = {
  easy: 100,
  normal: 10,
  hard: 0,
};

function isToken(card: MtgCard): boolean {
  return TOKEN_TYPES.some((t) => card.type_line.startsWith(t));
}

function isBasicLand(card: MtgCard): boolean {
  return BASIC_LANDS.has(card.name);
}

export interface SelectedCardResult {
  card: MtgCard;
  deckCount: number;
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
 * 获取卡牌的最早印刷版本详情
 * 通过 /versions API 获取所有版本，并行查询每个版本的完整数据，
 * 返回 released_at 最早的那个版本
 */
async function fetchOldestVersion(card: MtgCard): Promise<MtgCard | null> {
  try {
    const versions = await fetchVersions(card.id);

    if (versions.length <= 1) return null;

    const details = await Promise.all(
      versions.map((v) =>
        fetchCardDetail(v.set, v.collector_number).catch(() => null)
      )
    );

    const valid = details.filter((d): d is MtgCard => d !== null);
    if (valid.length === 0) return null;

    return valid.reduce((a, b) =>
      a.released_at < b.released_at ? a : b
    );
  } catch {
    return null;
  }
}

/**
 * 用最老版本的印刷信息覆盖卡牌的相关字段
 * 游戏规则字段（oracle_text, type_line 等）保留不变
 * 如果最老版本缺少图片/画家则回退到原卡牌
 */
function applyOldestVersion(card: MtgCard, oldest: MtgCard): MtgCard {
  return {
    ...card,
    // 系列信息
    set: oldest.set,
    set_name: oldest.set_name,
    set_translated_name: oldest.set_translated_name,
    set_type: oldest.set_type,
    released_at: oldest.released_at,
    rarity: oldest.rarity,
    collector_number: oldest.collector_number,
    int_collector_number: oldest.int_collector_number,
    name: oldest.name,
    face_name: oldest.face_name,
    printed_name: oldest.printed_name,
    atomic_official_name: oldest.atomic_official_name,
    full_official_name: oldest.full_official_name,
    atomic_translated_name: oldest.atomic_translated_name,
    full_translated_name: oldest.full_translated_name,
    atomic_name_translated_from: oldest.atomic_name_translated_from,
    zhs_name: oldest.zhs_name,
    zhs_face_name: oldest.zhs_face_name,
    pinyin: oldest.pinyin,
    pinyin_first_letter: oldest.pinyin_first_letter,
    // 视觉信息（图片和画家要匹配最老版本，否则和系列信息矛盾）
    image_uris: oldest.image_uris ?? card.image_uris,
    zhs_image_uris: oldest.zhs_image_uris ?? card.zhs_image_uris,
    artist: oldest.artist,
    artist_ids: oldest.artist_ids,
    flavor_name: oldest.flavor_name ?? null,
    flavor_text: oldest.flavor_text ?? null,
    atomic_translated_flavor_name: oldest.atomic_translated_flavor_name ?? null,
    atomic_translated_flavor_text: oldest.atomic_translated_flavor_text ?? null,
    atomic_flavor_translated_from: oldest.atomic_flavor_translated_from ?? null,
    zhs_flavor_name: oldest.zhs_flavor_name ?? null,
    zhs_flavor_text: oldest.zhs_flavor_text ?? null,
  };
}

/**
 * 核心：选取一张适合游戏的卡牌
 * @param formatCode 赛制过滤（null = 全部）
 * @param onRetry 每次重试的回调，用于更新 UI 状态
 */
export async function selectCard(
  formatCode?: string | null,
  difficulty: GameDifficulty = 'normal',
  onRetry?: (attempt: number, cardName: string, reason: string) => void
): Promise<SelectedCardResult> {
  let attempt = 0;
  const minDeckCount = DIFFICULTY_MIN_DECK_COUNT[difficulty];

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

    if (count <= minDeckCount) {
      onRetry?.(
        attempt,
        card.name,
        `套牌数 ${count}，未超过难度门槛 ${minDeckCount}`
      );
      continue;
    }

    // 通过！替换为最早版本的系列信息
    const oldest = await fetchOldestVersion(card);
    const finalCard = oldest ? applyOldestVersion(card, oldest) : card;
    return { card: normalizeCard(finalCard), deckCount: count };
  }
}
