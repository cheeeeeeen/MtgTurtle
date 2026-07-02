/** mtgch.com API 返回的完整卡牌数据结构 */

export interface ImageUris {
  small: string;
  normal: string;
  large: string;
  art_crop: string;
}

export interface Legalities {
  standard: string;
  future: string;
  historic: string;
  timeless: string;
  gladiator: string;
  pioneer: string;
  modern: string;
  legacy: string;
  pauper: string;
  vintage: string;
  penny: string;
  commander: string;
  oathbreaker: string;
  standardbrawl: string;
  brawl: string;
  alchemy: string;
  paupercommander: string;
  duel: string;
  oldschool: string;
  premodern: string;
  predh: string;
}

export interface Prices {
  usd?: string;
  usd_foil?: string;
  tix?: string;
}

export interface OtherFace {
  id: string;
  face_index: number;
  name: string;
  face_name: string;
  oracle_text?: string;
  type_line?: string;
  mana_cost?: string;
  colors?: string[];
  power?: string;
  toughness?: string;
  image_uris?: ImageUris;
}

export interface AllPart {
  id: string;
  component: string;
  name: string;
  type_line: string;
}

export interface Ruling {
  source: string;
  published_at: string;
  comment: string;
}

export interface MtgCard {
  id: string;
  mtgjson_id?: string;
  face_index: number;
  lang: string;
  oracle_id: string;
  layout: string;
  arena_id?: number;
  mtgo_id?: number;
  mtgo_foil_id?: number;
  multiverse_id?: number;
  tcgplayer_id?: number;
  tcgplayer_etched_id?: number;
  cardmarket_id?: number;

  // 核心游戏数据
  cmc: number;
  color_identity: string[];
  color_indicator?: string[] | null;
  colors: string[];
  defense?: string | null;
  game_changer: boolean;
  hand_modifier?: string | null;
  keywords: string[];
  life_modifier?: string | null;
  loyalty?: string | null;
  mana_cost: string;
  name: string;
  face_name?: string | null;
  oracle_text?: string | null;
  power?: string | null;
  produced_mana?: string | null;
  reserved: boolean;
  toughness?: string | null;
  type_line: string;

  // 艺术与印刷
  artist: string;
  artist_ids: string[];
  attraction_lights?: unknown;
  booster: boolean;
  border_color: string;
  card_back_id: string;
  collector_number: string;
  content_warning?: unknown;
  digital: boolean;
  finishes: string[];
  flavor_name?: string | null;
  flavor_text?: string | null;
  frame_effects?: string[] | null;
  frame: string;
  full_art: boolean;
  games: string[];
  highres_image: boolean;
  illustration_id: string;
  image_status: string;
  oversized: boolean;
  printed_name?: string | null;
  printed_text?: string | null;
  printed_type_line?: string | null;
  promo: boolean;
  promo_types?: string[] | null;
  rarity: string;
  released_at: string;
  reprint: boolean;
  set_name: string;
  set_type: string;
  set: string;
  set_id: string;
  story_spotlight: boolean;
  textless: boolean;
  variation: boolean;
  variation_of?: string | null;
  security_stamp?: string | null;
  watermark?: string | null;

  // 图片
  image_uris?: ImageUris;
  zhs_image_uris?: ImageUris;

  // 中文翻译
  atomic_official_name?: string | null;
  full_official_name?: string | null;
  atomic_translated_name?: string | null;
  full_translated_name?: string | null;
  atomic_name_translated_from?: string | null;
  atomic_translated_type?: string | null;
  atomic_translated_text?: string | null;
  atomic_text_translated_from?: string | null;
  atomic_translated_flavor_name?: string | null;
  atomic_translated_flavor_text?: string | null;
  atomic_flavor_translated_from?: string | null;
  set_translated_name?: string | null;
  keyrune_code?: string;
  zhs_name?: string | null;
  zhs_face_name?: string | null;
  zhs_flavor_name?: string | null;
  zhs_type_line?: string | null;
  zhs_text?: string | null;
  zhs_flavor_text?: string | null;
  zhs_language?: string | null;
  zhs_image?: string | null;
  zhs_extra?: unknown;

  // 其他
  int_collector_number: number;
  is_extras?: unknown;
  is_default?: boolean;
  pinyin?: string | null;
  pinyin_first_letter?: string | null;
  other_faces: OtherFace[];
  is_preview: boolean;
  legalities?: Legalities;
  prices?: Prices;
  all_parts?: AllPart[] | null;
  extra_fields?: unknown;
  rulings?: Ruling[] | null;
  object: string;
  prints_search_uri?: string | null;
  rulings_uri?: string | null;
  scryfall_uri?: string | null;
  uri?: string | null;
  scryfall_set_uri?: string | null;
  set_search_uri?: string | null;
  set_uri?: string | null;
  preview_previewed_at?: string | null;
  preview_source_uri?: string | null;
  preview_source?: string | null;
}

/** /api/v1/random 返回 */
export interface RandomCardResponse {
  set: string;
  collector_number: string;
}

/** /api/v1/autocomplete 返回的单条 */
export interface AutoCompleteItem {
  name: string;
  display_name: string;
  mana_cost: string;
  atomic_translated_type: string;
  set: string;
  collector_number: string;
  keyrune_code: string;
  rarity: string;
}

/** /api/v1/deck/decks 返回 */
export interface DeckListResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: DeckSummary[];
}

export interface DeckSummary {
  id: number;
  name: string;
  name_cn: string;
  type: string;
  format: string;
  format_code: string;
  author_name: string;
  place: string;
  created_at: string;
  updated_at: string;
  colors: string[];
  tags: string[];
  count_total: number;
  cover_card_image_url: string;
  is_public: boolean;
  is_favorited: boolean;
  favorite_count: number;
}

/** 提示结果 */
export interface HintResult {
  ruleId: string;
  ruleName: string;
  family: string;
  level: number;
  text: string;
  isSpoiler?: boolean; // 是否为剧透级提示（如规则文本）
}

/** 猜测记录 */
export interface GuessRecord {
  input: string;
  timestamp: number;
  isCorrect: boolean;
}

/** 游戏状态 */
export type GameStatus = 'idle' | 'loading' | 'playing' | 'won' | 'gaveUp';

/** 游戏模式 */
export type GameMode = 'free' | 'daily';

/** 游戏统计（持久化） */
export interface GameStats {
  totalGames: number;
  totalWins: number;
  totalGuesses: number;
  bestScore: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
}

/** 评分计算器接口 */
export interface ScoreCalculator {
  id: string;
  name: string;
  calculate: (guessCount: number, hintsRevealed: number) => number;
  weight: number;
}

/** 赛制选项 */
export interface FormatOption {
  code: string | null;
  name: string;
}

/** 提示规则接口 */
export interface HintRule {
  id: string;
  name: string;
  family: string;
  level: number;
  enabled: boolean;
  evaluate: (card: MtgCard) => HintResult | null;
}

/** /api/v1/versions 返回的单条版本摘要 */
export interface VersionSummary {
  id: string;
  set: string;
  set_name: string;
  collector_number: string;
  name: string;
  display_name: string;
}

// ========== 海龟汤模式 ==========

/** LLM 回答 */
export type LlmAnswer = '是' | '否' | '无法确定';

/** 聊天消息 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isCorrectGuess?: boolean; // 玩家猜对了
}

/** LLM API 请求 */
export interface LlmAskRequest {
  question: string;
  cardInfo: {
    name: string;
    chineseName: string;
    manaCost: string;
    cmc: number;
    colors: string[];
    typeLine: string;
    oracleText: string;
    flavorText: string;
    power: string | null;
    toughness: string | null;
    loyalty: string | null;
    setName: string;
    setType: string;
    rarity: string;
    artist: string;
    releasedAt: string;
    keywords: string[];
  };
  history: { role: string; content: string }[];
}

/** LLM API 响应 */
export interface LlmAskResponse {
  answer: LlmAnswer;
  reason?: string;
}
