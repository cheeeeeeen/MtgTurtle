import type {
  MtgCard,
  RandomCardResponse,
  AutoCompleteItem,
  DeckListResponse,
} from '@/types/card';

const BASE = 'https://mtgch.com/api/v1';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json() as Promise<T>;
}

/** 随机获取一张卡牌 */
export function fetchRandomCard(): Promise<RandomCardResponse> {
  return fetchJSON<RandomCardResponse>(`${BASE}/random`);
}

/** 通过系列和编号获取完整卡牌详情 */
export function fetchCardDetail(
  set: string,
  collectorNumber: string
): Promise<MtgCard> {
  return fetchJSON<MtgCard>(`${BASE}/card/${set}/${collectorNumber}/`);
}

/** 查询使用某卡牌的套牌数量 */
export async function fetchDeckCount(
  oracleId: string,
  formatCode?: string | null
): Promise<{ count: number; topFormats: Record<string, number> }> {
  const params = new URLSearchParams({
    oracle_ids: oracleId,
    page: '1',
    page_size: '50',
  });
  const url = `${BASE}/deck/decks/?${params.toString()}`;
  const data = await fetchJSON<DeckListResponse>(url);

  // 统计赛制分布
  const topFormats: Record<string, number> = {};
  for (const deck of data.items) {
    const fmt = deck.format_code;
    topFormats[fmt] = (topFormats[fmt] || 0) + 1;
  }

  // 如果指定了赛制过滤，重新查询
  if (formatCode) {
    const filteredParams = new URLSearchParams({
      oracle_ids: oracleId,
      page: '1',
      page_size: '1',
      format_code: formatCode,
    });
    const filteredUrl = `${BASE}/deck/decks/?${filteredParams.toString()}`;
    const filteredData = await fetchJSON<DeckListResponse>(filteredUrl);
    return { count: filteredData.count, topFormats };
  }

  return { count: data.count, topFormats };
}

/** 自动补全搜索 */
export function fetchAutocomplete(
  q: string
): Promise<{ items: AutoCompleteItem[]; total_count: number; has_more: boolean }> {
  const params = new URLSearchParams({ q });
  return fetchJSON(`${BASE}/autocomplete/?${params.toString()}`);
}

/** 获取所有赛制列表 */
export function fetchFormats(): Promise<{
  items: { code: string; name: string }[];
}> {
  return fetchJSON(`${BASE}/deck/formats/`);
}
