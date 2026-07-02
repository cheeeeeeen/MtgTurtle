import type { HintResult } from '@/types/card';
import { evaluateAllRules } from '@/config/hint-rules';

/** 提示规则引擎
 *  管理规则的评估、揭示顺序、随机初始提示
 */
export class HintEngine {
  private allHints: HintResult[];
  private revealed: Set<string>;
  private currentLevel: number;
  private readonly maxLevel = 6;

  constructor(allHints: HintResult[]) {
    this.allHints = allHints;
    this.revealed = new Set();
    this.currentLevel = 1;
  }

  /** 用所有规则评估一张卡牌 */
  static fromCard(card: import('@/types/card').MtgCard): HintEngine {
    const hints = evaluateAllRules(card);
    return new HintEngine(hints);
  }

  private randomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private getAllFamilies(): Set<string> {
    return new Set(this.allHints.map((hint) => hint.family));
  }

  private getFamilyRevealedLevel(family: string): number {
    let level = 0;
    for (const hint of this.allHints) {
      if (hint.family === family && this.revealed.has(hint.ruleId)) {
        level = Math.max(level, hint.level);
      }
    }
    return level;
  }

  private getEligibleFamiliesAtLevel(level: number): string[] {
    return [...this.getAllFamilies()].filter((family) => {
      if (this.getFamilyRevealedLevel(family) >= level) return false;
      return this.allHints.some(
        (hint) =>
          hint.family === family &&
          hint.level === level &&
          !this.revealed.has(hint.ruleId)
      );
    });
  }

  private advanceToNextAvailableLevel(): boolean {
    while (
      this.currentLevel <= this.maxLevel &&
      this.getEligibleFamiliesAtLevel(this.currentLevel).length === 0
    ) {
      this.currentLevel++;
    }
    return this.currentLevel <= this.maxLevel;
  }

  private setRequestedLevel(level: number): void {
    this.currentLevel = Math.max(
      this.currentLevel,
      Math.min(Math.max(level, 1), this.maxLevel)
    );
  }

  /** 获取一条随机初始提示 */
  getRandomInitial(): HintResult | null {
    return this.revealNext(1);
  }

  /** 揭示下一条未展示的提示 */
  revealNext(requestedLevel: number): HintResult | null {
    this.setRequestedLevel(requestedLevel);
    if (!this.advanceToNextAvailableLevel()) return null;

    const family = this.randomItem(
      this.getEligibleFamiliesAtLevel(this.currentLevel)
    );
    const candidates = this.allHints.filter(
      (hint) =>
        hint.level === this.currentLevel &&
        hint.family === family &&
        !this.revealed.has(hint.ruleId)
    );
    const hint = this.randomItem(candidates);
    this.revealed.add(hint.ruleId);
    this.advanceToNextAvailableLevel();
    return hint;
  }

  /** 获取已揭示的提示列表 */
  getRevealed(): HintResult[] {
    return this.allHints.filter((h) => this.revealed.has(h.ruleId));
  }

  /** 当前提示等级 */
  getCurrentLevel(): number {
    return this.currentLevel;
  }

  /** 最高提示等级 */
  getMaxHintLevel(): number {
    return this.maxLevel;
  }

  /** 是否还有可揭示的提示机会 */
  isExhausted(): boolean {
    const originalLevel = this.currentLevel;
    const hasNext = this.advanceToNextAvailableLevel();
    this.currentLevel = originalLevel;
    return !hasNext;
  }

  /** 添加一条动态提示（不在初始规则集中的） */
  addDynamicHint(hint: HintResult): void {
    this.allHints.push(hint);
  }
}
