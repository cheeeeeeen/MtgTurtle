import type { MtgCard, HintResult, HintRule } from '@/types/card';

type HintTextEvaluator = (card: MtgCard) => string | null;

const COLOR_NAMES: Record<string, string> = {
  W: '白',
  U: '蓝',
  B: '黑',
  R: '红',
  G: '绿',
};

const RARITY_NAMES: Record<string, string> = {
  common: '普通',
  uncommon: '非普通',
  rare: '稀有',
  mythic: '秘稀',
  special: '特殊',
  bonus: '奖励',
};

function createRule(
  id: string,
  name: string,
  family: string,
  level: number,
  evaluateText: HintTextEvaluator,
  isSpoiler = false
): HintRule {
  return {
    id,
    name,
    family,
    level,
    enabled: true,
    evaluate: (card: MtgCard): HintResult | null => {
      const text = evaluateText(card);
      if (!text) return null;
      return {
        ruleId: id,
        ruleName: name,
        family,
        level,
        text,
        isSpoiler,
      };
    },
  };
}

function hasType(card: MtgCard, typeName: string): boolean {
  return card.type_line.toLowerCase().includes(typeName.toLowerCase());
}

function isPermanent(card: MtgCard): boolean {
  return !hasType(card, 'Instant') && !hasType(card, 'Sorcery');
}

function colorNames(colors: string[]): string {
  if (colors.length === 0) return '无色';
  return colors.map((color) => COLOR_NAMES[color] || color).join('/');
}

function parseStat(value?: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

function isPerfectSquare(value: number): boolean {
  return value >= 0 && Number.isInteger(Math.sqrt(value));
}

function cardText(card: MtgCard): string {
  return card.atomic_translated_text || card.oracle_text || '';
}

function hasKeyword(card: MtgCard, en: string, zh: string): boolean {
  const keywords = card.keywords.map((keyword) => keyword.toLowerCase());
  const text = cardText(card).toLowerCase();
  return keywords.includes(en.toLowerCase()) || text.includes(zh.toLowerCase());
}

function nameWords(name: string): string[] {
  return name.match(/[A-Za-z0-9]+/g) ?? [];
}

export const hintRules: HintRule[] = [
  // 类别
  createRule('type_not_land', '牌张类别', 'type', 1, (card) =>
    !hasType(card, 'Land') ? '这张牌不是地。' : null
  ),
  createRule('type_not_instant', '牌张类别', 'type', 1, (card) =>
    !hasType(card, 'Instant') ? '这张牌不是瞬间。' : null
  ),
  createRule('type_not_sorcery', '牌张类别', 'type', 1, (card) =>
    !hasType(card, 'Sorcery') ? '这张牌不是法术。' : null
  ),
  createRule('type_not_creature', '牌张类别', 'type', 1, (card) =>
    !hasType(card, 'Creature') ? '这张牌不是生物。' : null
  ),
  createRule('type_is_permanent', '牌张类别', 'type', 2, (card) =>
    isPermanent(card) ? '这张牌是永久物牌。' : '这张牌不是永久物牌。'
  ),
  createRule('type_nonland_permanent', '牌张类别', 'type', 2, (card) =>
    isPermanent(card) && !hasType(card, 'Land')
      ? '这张牌是非地永久物牌。'
      : null
  ),
  createRule('type_exact_creature', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Creature') ? '这张牌是生物。' : null
  ),
  createRule('type_exact_artifact', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Artifact') ? '这张牌是神器。' : null
  ),
  createRule('type_exact_enchantment', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Enchantment') ? '这张牌是结界。' : null
  ),
  createRule('type_exact_planeswalker', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Planeswalker') ? '这张牌是鹏洛客。' : null
  ),
  createRule('type_exact_battle', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Battle') ? '这张牌是战役。' : null
  ),
  createRule('type_exact_instant', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Instant') ? '这张牌是瞬间。' : null
  ),
  createRule('type_exact_sorcery', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Sorcery') ? '这张牌是法术。' : null
  ),
  createRule('type_exact_land', '牌张类别', 'type', 3, (card) =>
    hasType(card, 'Land') ? '这张牌是地。' : null
  ),

  // 颜色
  createRule('color_not_colorless', '颜色', 'color', 1, (card) =>
    card.colors.length > 0 ? '这张牌不是无色牌。' : null
  ),
  createRule('color_not_multicolor', '颜色', 'color', 1, (card) =>
    card.colors.length <= 1 ? '这张牌不是多色牌。' : null
  ),
  ...(['W', 'U', 'B', 'R', 'G'] as const).map((color) =>
    createRule(`color_not_${color}`, '颜色', 'color', 1, (card) =>
      !card.colors.includes(color)
        ? `这张牌不包含${COLOR_NAMES[color]}色。`
        : null
    )
  ),
  createRule('color_colorless', '颜色', 'color', 2, (card) =>
    card.colors.length === 0 ? '这张牌是无色牌。' : null
  ),
  createRule('color_mono', '颜色', 'color', 2, (card) =>
    card.colors.length === 1 ? '这张牌是单色牌。' : null
  ),
  createRule('color_two', '颜色', 'color', 2, (card) =>
    card.colors.length === 2 ? '这张牌是双色牌。' : null
  ),
  createRule('color_three_plus', '颜色', 'color', 2, (card) =>
    card.colors.length >= 3 ? '这张牌是三色或更多颜色的牌。' : null
  ),
  ...(['W', 'U', 'B', 'R', 'G'] as const).map((color) =>
    createRule(`color_has_${color}`, '颜色', 'color', 2, (card) =>
      card.colors.includes(color)
        ? `这张牌包含${COLOR_NAMES[color]}色。`
        : null
    )
  ),
  createRule('color_exact', '颜色', 'color', 3, (card) =>
    `这张牌的颜色是：${colorNames(card.colors)}。`
  ),

  // 法术力费用
  createRule('mana_cmc_le_2', '法术力费用', 'mana', 1, (card) =>
    card.cmc <= 2 ? '这张牌的总法术力值小于等于 2。' : null
  ),
  createRule('mana_cmc_ge_5', '法术力费用', 'mana', 1, (card) =>
    card.cmc >= 5 ? '这张牌的总法术力值大于等于 5。' : null
  ),
  createRule('mana_cmc_even', '法术力费用', 'mana', 1, (card) =>
    card.cmc % 2 === 0 ? '这张牌的总法术力值是偶数。' : null
  ),
  createRule('mana_cmc_odd', '法术力费用', 'mana', 1, (card) =>
    card.cmc % 2 === 1 ? '这张牌的总法术力值是奇数。' : null
  ),
  createRule('mana_has_generic', '法术力费用', 'mana', 1, (card) =>
    /\{\d+\}/.test(card.mana_cost)
      ? '这张牌的法术力费用中包含无色数字费用。'
      : null
  ),
  createRule('mana_range_0_2', '法术力费用', 'mana', 2, (card) =>
    card.cmc <= 2 ? '这张牌的总法术力值在 0 到 2 之间。' : null
  ),
  createRule('mana_range_3_4', '法术力费用', 'mana', 2, (card) =>
    card.cmc >= 3 && card.cmc <= 4
      ? '这张牌的总法术力值在 3 到 4 之间。'
      : null
  ),
  createRule('mana_range_5_6', '法术力费用', 'mana', 2, (card) =>
    card.cmc >= 5 && card.cmc <= 6
      ? '这张牌的总法术力值在 5 到 6 之间。'
      : null
  ),
  createRule('mana_range_7_plus', '法术力费用', 'mana', 2, (card) =>
    card.cmc >= 7 ? '这张牌的总法术力值大于等于 7。' : null
  ),
  createRule('mana_has_x', '法术力费用', 'mana', 2, (card) =>
    card.mana_cost.includes('{X}')
      ? '这张牌的法术力费用中包含 X。'
      : null
  ),
  createRule('mana_has_hybrid', '法术力费用', 'mana', 2, (card) =>
    /\{[^}]+\/[^}]+\}/.test(card.mana_cost)
      ? '这张牌的法术力费用中包含混血法术力符号。'
      : null
  ),
  createRule('mana_has_phyrexian', '法术力费用', 'mana', 2, (card) =>
    /\{[WUBRG]\/P\}/.test(card.mana_cost)
      ? '这张牌的法术力费用中包含非瑞克西亚法术力符号。'
      : null
  ),
  createRule('mana_cmc_exact', '法术力费用', 'mana', 3, (card) =>
    `这张牌的总法术力值是 ${card.cmc}。`
  ),
  createRule('mana_cost_exact', '法术力费用', 'mana', 4, (card) =>
    card.mana_cost ? `这张牌的法术力费用是：${card.mana_cost}。` : null
  ),

  // 稀有度：当前选牌逻辑已经将系列与稀有度替换为最早版本。
  createRule('rarity_not_common', '稀有度', 'rarity', 1, (card) =>
    card.rarity !== 'common'
      ? '这张牌最早版本的稀有度不是普通。'
      : null
  ),
  createRule('rarity_not_uncommon', '稀有度', 'rarity', 1, (card) =>
    card.rarity !== 'uncommon'
      ? '这张牌最早版本的稀有度不是非普通。'
      : null
  ),
  createRule('rarity_not_rare', '稀有度', 'rarity', 1, (card) =>
    card.rarity !== 'rare'
      ? '这张牌最早版本的稀有度不是稀有。'
      : null
  ),
  createRule('rarity_not_mythic', '稀有度', 'rarity', 1, (card) =>
    card.rarity !== 'mythic'
      ? '这张牌最早版本的稀有度不是秘稀。'
      : null
  ),
  createRule('rarity_low', '稀有度', 'rarity', 2, (card) =>
    card.rarity === 'common' || card.rarity === 'uncommon'
      ? '这张牌最早版本的稀有度属于普通或非普通。'
      : null
  ),
  createRule('rarity_high', '稀有度', 'rarity', 2, (card) =>
    card.rarity === 'rare' || card.rarity === 'mythic'
      ? '这张牌最早版本的稀有度属于稀有或秘稀。'
      : null
  ),
  createRule('rarity_exact', '稀有度', 'rarity', 3, (card) =>
    `这张牌最早版本的稀有度是：${
      RARITY_NAMES[card.rarity] || card.rarity
    }。`
  ),

  // 系列与发行时间
  createRule('release_before_2000', '发行时间', 'release', 1, (card) =>
    Number(card.released_at.slice(0, 4)) < 2000
      ? '这张牌首次发行年份早于 2000 年。'
      : null
  ),
  createRule('release_not_before_2000', '发行时间', 'release', 1, (card) =>
    Number(card.released_at.slice(0, 4)) >= 2000
      ? '这张牌首次发行年份不早于 2000 年。'
      : null
  ),
  createRule('release_before_2010', '发行时间', 'release', 1, (card) =>
    Number(card.released_at.slice(0, 4)) < 2010
      ? '这张牌首次发行年份早于 2010 年。'
      : null
  ),
  createRule('release_not_before_2010', '发行时间', 'release', 1, (card) =>
    Number(card.released_at.slice(0, 4)) >= 2010
      ? '这张牌首次发行年份不早于 2010 年。'
      : null
  ),
  createRule('release_decade_1990', '发行时间', 'release', 2, (card) => {
    const year = Number(card.released_at.slice(0, 4));
    return year >= 1990 && year <= 1999
      ? '这张牌首次发行于 1990 年代。'
      : null;
  }),
  createRule('release_decade_2000', '发行时间', 'release', 2, (card) => {
    const year = Number(card.released_at.slice(0, 4));
    return year >= 2000 && year <= 2009
      ? '这张牌首次发行于 2000 年代。'
      : null;
  }),
  createRule('release_decade_2010', '发行时间', 'release', 2, (card) => {
    const year = Number(card.released_at.slice(0, 4));
    return year >= 2010 && year <= 2019
      ? '这张牌首次发行于 2010 年代。'
      : null;
  }),
  createRule('release_decade_2020', '发行时间', 'release', 2, (card) => {
    const year = Number(card.released_at.slice(0, 4));
    return year >= 2020 && year <= 2029
      ? '这张牌首次发行于 2020 年代。'
      : null;
  }),
  createRule('release_year_exact', '发行时间', 'release', 3, (card) =>
    `这张牌首次发行年份是 ${card.released_at.slice(0, 4)} 年。`
  ),
  createRule('release_set_exact', '所在系列', 'release', 4, (card) => {
    const setName = card.set_translated_name || card.set_name;
    return `这张牌最早出自「${setName}」系列。`;
  }),

  // 力量/防御力/忠诚
  createRule('stats_has_pt', '身材/忠诚', 'stats', 1, (card) =>
    card.power && card.toughness
      ? '这张牌有力量和防御力。'
      : '这张牌没有力量和防御力。'
  ),
  createRule('stats_has_loyalty', '身材/忠诚', 'stats', 1, (card) =>
    card.loyalty ? '这张牌有忠诚值。' : '这张牌没有忠诚值。'
  ),
  createRule('stats_power_gt_toughness', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null && power > toughness
      ? '这张牌的力量大于防御力。'
      : null;
  }),
  createRule('stats_power_eq_toughness', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null && power === toughness
      ? '这张牌的力量等于防御力。'
      : null;
  }),
  createRule('stats_power_lt_toughness', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null && power < toughness
      ? '这张牌的力量小于防御力。'
      : null;
  }),
  createRule('stats_coprime', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null && gcd(power, toughness) === 1
      ? '这张牌的力量和防御力互质。'
      : null;
  }),
  createRule('stats_power_square', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    return power !== null && isPerfectSquare(power)
      ? '这张牌的力量是完全平方数。'
      : null;
  }),
  createRule('stats_toughness_square', '身材/忠诚', 'stats', 2, (card) => {
    const toughness = parseStat(card.toughness);
    return toughness !== null && isPerfectSquare(toughness)
      ? '这张牌的防御力是完全平方数。'
      : null;
  }),
  createRule('stats_sum_small', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null && power + toughness <= 4
      ? '这张牌的力量与防御力之和小于等于 4。'
      : null;
  }),
  createRule('stats_sum_mid', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null &&
      toughness !== null &&
      power + toughness >= 5 &&
      power + toughness <= 8
      ? '这张牌的力量与防御力之和在 5 到 8 之间。'
      : null;
  }),
  createRule('stats_sum_large', '身材/忠诚', 'stats', 2, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null && power + toughness >= 9
      ? '这张牌的力量与防御力之和大于等于 9。'
      : null;
  }),
  createRule('stats_sum_exact', '身材/忠诚', 'stats', 3, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null
      ? `这张牌的力量与防御力之和是 ${power + toughness}。`
      : null;
  }),
  createRule('stats_diff_exact', '身材/忠诚', 'stats', 3, (card) => {
    const power = parseStat(card.power);
    const toughness = parseStat(card.toughness);
    return power !== null && toughness !== null
      ? `这张牌的力量与防御力之差的绝对值是 ${Math.abs(
          power - toughness
        )}。`
      : null;
  }),
  createRule('stats_loyalty_exact', '身材/忠诚', 'stats', 3, (card) =>
    card.loyalty ? `这张牌的起始忠诚是 ${card.loyalty}。` : null
  ),
  createRule('stats_pt_exact', '身材/忠诚', 'stats', 4, (card) =>
    card.power && card.toughness
      ? `这张牌的力量/防御力是：${card.power}/${card.toughness}。`
      : null
  ),

  // 中文牌名
  createRule('zh_name_len_le_3', '中文牌名', 'zh_name', 1, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name && name.length <= 3
      ? '这张牌的中文名长度小于等于 3 个字。'
      : null;
  }),
  createRule('zh_name_len_ge_6', '中文牌名', 'zh_name', 1, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name && name.length >= 6
      ? '这张牌的中文名长度大于等于 6 个字。'
      : null;
  }),
  createRule('zh_name_has_punctuation', '中文牌名', 'zh_name', 1, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name && /[，。、《》：；“”]/.test(name)
      ? '这张牌的中文名包含标点符号。'
      : null;
  }),
  createRule('zh_name_range_1_3', '中文牌名', 'zh_name', 2, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name && name.length >= 1 && name.length <= 3
      ? '这张牌的中文名长度在 1 到 3 个字之间。'
      : null;
  }),
  createRule('zh_name_range_4_5', '中文牌名', 'zh_name', 2, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name && name.length >= 4 && name.length <= 5
      ? '这张牌的中文名长度在 4 到 5 个字之间。'
      : null;
  }),
  createRule('zh_name_range_6_8', '中文牌名', 'zh_name', 2, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name && name.length >= 6 && name.length <= 8
      ? '这张牌的中文名长度在 6 到 8 个字之间。'
      : null;
  }),
  createRule('zh_name_range_9_plus', '中文牌名', 'zh_name', 2, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name && name.length >= 9
      ? '这张牌的中文名长度大于等于 9 个字。'
      : null;
  }),
  createRule('zh_name_len_exact', '中文牌名', 'zh_name', 3, (card) => {
    const name = card.atomic_official_name || card.atomic_translated_name;
    return name ? `这张牌的中文牌名共 ${name.length} 个字。` : null;
  }),
  createRule('zh_name_pinyin_initials', '中文牌名', 'zh_name', 3, (card) =>
    card.pinyin_first_letter
      ? `这张牌中文名的拼音首字母是：${card.pinyin_first_letter}。`
      : null
  ),

  // 英文牌名
  createRule('en_name_one_word', '英文牌名', 'en_name', 1, (card) =>
    nameWords(card.name).length === 1
      ? '这张牌的英文名只有 1 个单词。'
      : null
  ),
  createRule('en_name_multi_word', '英文牌名', 'en_name', 1, (card) =>
    nameWords(card.name).length > 1
      ? '这张牌的英文名包含多个单词。'
      : null
  ),
  createRule('en_name_has_punctuation', '英文牌名', 'en_name', 1, (card) =>
    /[,:;]/.test(card.name) ? '这张牌的英文名包含标点符号。' : null
  ),
  createRule('en_name_has_hyphen', '英文牌名', 'en_name', 1, (card) =>
    card.name.includes('-') ? '这张牌的英文名包含连字符。' : null
  ),
  createRule('en_name_has_apostrophe', '英文牌名', 'en_name', 1, (card) =>
    card.name.includes("'") ? '这张牌的英文名包含撇号。' : null
  ),
  createRule('en_name_word_count_1', '英文牌名', 'en_name', 2, (card) =>
    nameWords(card.name).length === 1
      ? '这张牌的英文名包含 1 个单词。'
      : null
  ),
  createRule('en_name_word_count_2', '英文牌名', 'en_name', 2, (card) =>
    nameWords(card.name).length === 2
      ? '这张牌的英文名包含 2 个单词。'
      : null
  ),
  createRule('en_name_word_count_3', '英文牌名', 'en_name', 2, (card) =>
    nameWords(card.name).length === 3
      ? '这张牌的英文名包含 3 个单词。'
      : null
  ),
  createRule('en_name_word_count_4_plus', '英文牌名', 'en_name', 2, (card) =>
    nameWords(card.name).length >= 4
      ? '这张牌的英文名包含 4 个或更多单词。'
      : null
  ),
  createRule('en_name_len_le_8', '英文牌名', 'en_name', 2, (card) => {
    const len = nameWords(card.name).join('').length;
    return len <= 8 ? '这张牌的英文名长度小于等于 8 个字母。' : null;
  }),
  createRule('en_name_len_9_14', '英文牌名', 'en_name', 2, (card) => {
    const len = nameWords(card.name).join('').length;
    return len >= 9 && len <= 14
      ? '这张牌的英文名长度在 9 到 14 个字母之间。'
      : null;
  }),
  createRule('en_name_len_ge_15', '英文牌名', 'en_name', 2, (card) => {
    const len = nameWords(card.name).join('').length;
    return len >= 15 ? '这张牌的英文名长度大于等于 15 个字母。' : null;
  }),
  createRule('en_name_first_letter', '英文牌名', 'en_name', 3, (card) => {
    const match = card.name.match(/[A-Za-z]/);
    return match ? `这张牌英文名的首字母是：${match[0].toUpperCase()}。` : null;
  }),
  createRule('en_name_last_letter', '英文牌名', 'en_name', 3, (card) => {
    const match = card.name.match(/[A-Za-z](?=[^A-Za-z]*$)/);
    return match ? `这张牌英文名的最后一个字母是：${match[0].toUpperCase()}。` : null;
  }),
  createRule('en_name_word_count_exact', '英文牌名', 'en_name', 3, (card) =>
    `这张牌英文名包含 ${nameWords(card.name).length} 个单词。`
  ),

  // 规则文本
  createRule('rules_text_len_gt_20', '规则文本', 'rules_text', 1, (card) => {
    const text = cardText(card).replace(/\s/g, '');
    return text.length > 20 ? '这张牌的中文规则文本长度大于 20 个字。' : null;
  }),
  createRule('rules_text_len_gt_50', '规则文本', 'rules_text', 1, (card) => {
    const text = cardText(card).replace(/\s/g, '');
    return text.length > 50 ? '这张牌的中文规则文本长度大于 50 个字。' : null;
  }),
  createRule('rules_text_has_number', '规则文本', 'rules_text', 1, (card) =>
    /\d+/.test(cardText(card)) ? '这张牌的规则文本中包含数字。' : null
  ),
  createRule('rules_text_no_number', '规则文本', 'rules_text', 1, (card) =>
    !/\d+/.test(cardText(card)) ? '这张牌的规则文本中不包含数字。' : null
  ),
  createRule('rules_text_has_colon', '规则文本', 'rules_text', 1, (card) =>
    /[:：]/.test(cardText(card)) ? '这张牌的规则文本中包含冒号。' : null
  ),
  createRule('rules_text_has_parentheses', '规则文本', 'rules_text', 1, (card) =>
    /[()（）]/.test(cardText(card)) ? '这张牌的规则文本中包含括号。' : null
  ),
  createRule('rules_text_numbers', '规则文本', 'rules_text', 2, (card) => {
    const numbers = [...new Set(cardText(card).match(/\d+/g) ?? [])];
    return numbers.length > 0
      ? `这张牌的规则文本中包含数字：${numbers.join('、')}。`
      : null;
  }),
  ...[
    '目标',
    '目标牌手',
    '抓一张牌',
    '弃一张牌',
    '牺牲',
    '放逐',
    '坟墓场',
    '派出',
    '犯罪',
  ].map((phrase) =>
    createRule(
      `rules_text_has_phrase_${phrase}`,
      '规则文本',
      'rules_text',
      2,
      (card) =>
        cardText(card).includes(phrase)
          ? `这张牌的规则文本中包含“${phrase}”。`
          : null
    )
  ),
  createRule('rules_text_no_target_player', '规则文本', 'rules_text', 2, (card) =>
    !cardText(card).includes('目标牌手')
      ? '这张牌的规则文本中不包含“目标牌手”。'
      : null
  ),
  ...[
    ['flying', 'Flying', '飞行'],
    ['first_strike', 'First strike', '先攻'],
    ['double_strike', 'Double strike', '连击'],
    ['vigilance', 'Vigilance', '警戒'],
    ['trample', 'Trample', '践踏'],
    ['haste', 'Haste', '敏捷'],
    ['deathtouch', 'Deathtouch', '死触'],
    ['lifelink', 'Lifelink', '系命'],
    ['menace', 'Menace', '威慑'],
    ['reach', 'Reach', '延势'],
    ['ward', 'Ward', '守护'],
    ['flash', 'Flash', '闪现'],
    ['defender', 'Defender', '守军'],
    ['hexproof', 'Hexproof', '辟邪'],
    ['indestructible', 'Indestructible', '不灭'],
    ['protection', 'Protection', '保护'],
  ].map(([id, en, zh]) =>
    createRule(`rules_keyword_${id}`, '规则文本', 'rules_text', 3, (card) =>
      hasKeyword(card, en, zh) ? `这张牌具有${zh}关键词。` : null
    )
  ),
  createRule('rules_text_full', '规则文本', 'rules_text', 6, (card) => {
    const text = cardText(card);
    return text ? `规则文本：${text}` : null;
  }, true),

  // 风味文字
  createRule('flavor_has_text', '风味文字', 'flavor', 1, (card) =>
    card.atomic_translated_flavor_text || card.flavor_text
      ? '这张牌有风味文字。'
      : '这张牌没有风味文字。'
  ),
  createRule('flavor_text_full', '风味文字', 'flavor', 2, (card) => {
    const text = card.atomic_translated_flavor_text || card.flavor_text;
    return text ? `风味文字：${text}` : null;
  }, true),

  // 画家
  createRule('artist_exact', '画家', 'artist', 3, (card) =>
    card.artist ? `这张牌的画家是：${card.artist}。` : null
  ),
];

/** 获取所有启用的规则 */
export function getEnabledRules(): HintRule[] {
  return hintRules
    .filter((rule) => rule.enabled)
    .sort((a, b) => a.level - b.level);
}

/** 评估所有规则，返回可用的提示列表 */
export function evaluateAllRules(card: MtgCard): HintResult[] {
  const results: HintResult[] = [];
  for (const rule of getEnabledRules()) {
    const result = rule.evaluate(card);
    if (result) {
      results.push(result);
    }
  }
  return results;
}
