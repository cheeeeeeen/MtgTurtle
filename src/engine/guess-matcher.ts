import Fuse from 'fuse.js';
import type { MtgCard, AutoCompleteItem } from '@/types/card';
import { fetchAutocomplete } from '@/api/mtgch';

export interface SuggestionItem {
  name: string;
  displayName: string;
  rarity: string;
  type: string;
  set: string;
}

/** 猜测匹配引擎 */
export class GuessMatcher {
  private suggestions: SuggestionItem[] = [];
  private fuse: Fuse<SuggestionItem> | null = null;

  /** 精确匹配：检查输入是否与答案一致 */
  isExactMatch(input: string, targetCard: MtgCard): boolean {
    const normalized = normalizeInput(input);
    const targets = this.getTargetNames(targetCard);
    return targets.some((t) => normalizeInput(t) === normalized);
  }

  /** 获取目标卡牌的所有名称变体 */
  private getTargetNames(card: MtgCard): string[] {
    const names: string[] = [];
    // 英文名
    names.push(card.name);
    // 如果是双面牌，正面的 face_name
    if (card.face_name) {
      names.push(card.face_name);
    }
    // "A // B" 格式的双面牌，取前半部分
    if (card.name.includes(' // ')) {
      names.push(card.name.split(' // ')[0]);
    }
    // 中文官方名
    if (card.atomic_official_name) {
      names.push(card.atomic_official_name);
    }
    // 中文译名
    if (card.atomic_translated_name) {
      names.push(card.atomic_translated_name);
    }
    // full_translated_name 如果是 "A // B" 格式，取前半
    if (card.full_translated_name) {
      names.push(card.full_translated_name);
      if (card.full_translated_name.includes(' // ')) {
        names.push(card.full_translated_name.split(' // ')[0]);
      }
    }
    return [...new Set(names)];
  }

  /** 从 API 加载自动补全建议 */
  async loadSuggestions(query: string): Promise<SuggestionItem[]> {
    if (query.length < 2) return [];
    try {
      const data = await fetchAutocomplete(query);
      const items: SuggestionItem[] = (data.items || []).map((item: AutoCompleteItem) => ({
        name: item.name,
        displayName: item.display_name || item.name,
        rarity: item.rarity,
        type: item.atomic_translated_type || '',
        set: item.set,
      }));
      this.suggestions = items;
      this.fuse = new Fuse(items, {
        keys: ['name', 'displayName'],
        threshold: 0.4,
        includeScore: true,
      });
      return items;
    } catch {
      return [];
    }
  }

  /** 模糊搜索建议 */
  fuzzySearch(query: string): SuggestionItem[] {
    if (!this.fuse || query.length < 2) return [];
    const normalized = normalizeInput(query);
    const results = this.fuse.search(normalized);
    return results.slice(0, 10).map((r) => r.item);
  }

  /** 获取当前缓存的建议列表 */
  getSuggestions(): SuggestionItem[] {
    return this.suggestions;
  }
}

/** 输入标准化 */
function normalizeInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')      // 合并多空格
    .replace(/[，]/g, ',')     // 全角逗号 → 半角
    .replace(/[：]/g, ':')     // 全角冒号 → 半角
    .replace(/[（）]/g, (m) => m === '（' ? '(' : ')'); // 全角括号
}
