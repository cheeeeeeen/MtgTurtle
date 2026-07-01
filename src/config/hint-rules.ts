import type { MtgCard, HintResult, HintRule } from '@/types/card';

/**
 * 提示规则配置
 * 优先级越小 → 越优先揭示
 * enabled: false 的规则不会被使用
 */

export const hintRules: HintRule[] = [
  {
    id: 'colors',
    name: '颜色',
    priority: 1,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      if (!card.colors || card.colors.length === 0) {
        return { ruleId: 'colors', ruleName: '颜色', text: '这张牌是无色牌' };
      }
      const colorMap: Record<string, string> = {
        W: '白', U: '蓝', B: '黑', R: '红', G: '绿',
      };
      const names = card.colors.map((c) => colorMap[c] || c).join('/');
      return { ruleId: 'colors', ruleName: '颜色', text: `颜色：${names}` };
    },
  },
  {
    id: 'mana_cost',
    name: '法术力费用',
    priority: 1,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      if (!card.mana_cost) return null;
      return {
        ruleId: 'mana_cost',
        ruleName: '法术力费用',
        text: `法术力费用：${card.mana_cost}`,
      };
    },
  },
  {
    id: 'cmc',
    name: '总法术力费用',
    priority: 2,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      return {
        ruleId: 'cmc',
        ruleName: '总法术力费用',
        text: `总法术力费用（CMC）：${card.cmc}`,
      };
    },
  },
  {
    id: 'type_line',
    name: '牌张类别',
    priority: 2,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const type =
        card.atomic_translated_type || card.type_line;
      return {
        ruleId: 'type_line',
        ruleName: '牌张类别',
        text: `类别：${type}`,
      };
    },
  },
  {
    id: 'rarity',
    name: '稀有度',
    priority: 3,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const rarityMap: Record<string, string> = {
        common: '普通', uncommon: '非普通', rare: '稀有',
        mythic: '秘稀', special: '特殊', bonus: '奖励',
      };
      const cn = rarityMap[card.rarity] || card.rarity;
      return {
        ruleId: 'rarity',
        ruleName: '稀有度',
        text: `稀有度：${cn}`,
      };
    },
  },
  {
    id: 'set_name',
    name: '所在系列',
    priority: 4,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const setName = card.set_translated_name || card.set_name;
      return {
        ruleId: 'set_name',
        ruleName: '所在系列',
        text: `出自「${setName}」系列`,
      };
    },
  },
  {
    id: 'released_at',
    name: '发行年份',
    priority: 4,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const year = card.released_at?.slice(0, 4);
      return {
        ruleId: 'released_at',
        ruleName: '发行年份',
        text: `发行年份：${year} 年`,
      };
    },
  },
  {
    id: 'power_toughness',
    name: '攻击力/防御力',
    priority: 5,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      if (!card.power && !card.toughness) return null;
      return {
        ruleId: 'power_toughness',
        ruleName: '攻击力/防御力',
        text: `攻击力/防御力：${card.power || '?'}/${card.toughness || '?'}`,
      };
    },
  },
  {
    id: 'loyalty',
    name: '忠诚指示物',
    priority: 5,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      if (!card.loyalty) return null;
      return {
        ruleId: 'loyalty',
        ruleName: '忠诚指示物',
        text: `起始忠诚：${card.loyalty}`,
      };
    },
  },
  {
    id: 'chinese_name_length',
    name: '中文牌名字数',
    priority: 6,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const cnName = card.atomic_official_name || card.atomic_translated_name;
      if (!cnName) return null;
      return {
        ruleId: 'chinese_name_length',
        ruleName: '中文牌名字数',
        text: `中文牌名共 ${cnName.length} 个字`,
      };
    },
  },
  {
    id: 'pinyin_first_letter',
    name: '拼音首字母',
    priority: 6,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      if (!card.pinyin_first_letter) return null;
      return {
        ruleId: 'pinyin_first_letter',
        ruleName: '拼音首字母',
        text: `中文牌名拼音首字母：${card.pinyin_first_letter}`,
      };
    },
  },
  {
    id: 'oracle_text',
    name: '规则文本',
    priority: 7,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const text = card.atomic_translated_text || card.oracle_text;
      if (!text) return null;
      return {
        ruleId: 'oracle_text',
        ruleName: '规则文本',
        text: `规则文本：${text}`,
        isSpoiler: true,
      };
    },
  },
  {
    id: 'flavor_text',
    name: '风味文字',
    priority: 8,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const text = card.atomic_translated_flavor_text || card.flavor_text;
      if (!text) return null;
      return {
        ruleId: 'flavor_text',
        ruleName: '风味文字',
        text: `风味文字：${text}`,
        isSpoiler: true,
      };
    },
  },
  {
    id: 'artist',
    name: '画家',
    priority: 9,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      return {
        ruleId: 'artist',
        ruleName: '画家',
        text: `画家：${card.artist}`,
      };
    },
  },
  {
    id: 'deck_popularity',
    name: '套牌使用热度',
    priority: 10,
    enabled: true,
    evaluate: (_card: MtgCard): HintResult | null => {
      // 这个规则需要在外部注入 deck count 和 top format 数据
      // evaluate 函数本身是纯函数，热数据通过闭包传入
      return null; // 由游戏逻辑动态生成此提示
    },
  },
];

/** 获取所有启用的规则 */
export function getEnabledRules(): HintRule[] {
  return hintRules
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/** 评估所有规则，返回可用的提示列表 */
export function evaluateAllRules(card: MtgCard): HintResult[] {
  const results: HintResult[] = [];
  for (const rule of getEnabledRules()) {
    if (rule.id === 'deck_popularity') continue; // 动态规则，跳过
    const result = rule.evaluate(card);
    if (result) {
      results.push(result);
    }
  }
  return results;
}
