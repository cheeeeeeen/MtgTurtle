/**
 * 每日挑战模块
 * 使用 UTC 日期作为随机种子，确保全球所有玩家当天猜同一张牌
 */

/** 获取今日 UTC 日期字符串 "YYYY-MM-DD" */
export function getTodayUTCDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

/** 用字符串种子生成伪随机数 (0-1) */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // 32-bit integer
  }
  // Normalize to 0-1
  return Math.abs(hash) / 2147483648;
}

/** 用日期种子从候选列表中选取一张卡牌
 *  此函数用于在本地缓存数据不足时，仍然保证每日同卡
 */
export function pickDailyFromSeeds(
  dateStr: string,
  candidates: Array<{ oracle_id: string }>
): number {
  const seed = dateStr;
  const index = Math.floor(seededRandom(seed) * candidates.length);
  return index;
}

/**
 * 获取"每日挑战纪念日"——如果今天完成了每日挑战，
 * 这个日期作为唯一标识存储
 */
export function getDailyStorageKey(): string {
  return `daily_challenge_${getTodayUTCDate()}`;
}
