import type { HintResult } from '@/types/card';
import { evaluateAllRules } from '@/config/hint-rules';

/** 提示规则引擎
 *  管理规则的评估、揭示顺序、随机初始提示
 */
export class HintEngine {
  private allHints: HintResult[];
  private revealed: Set<string>;
  private shuffledQueue: HintResult[];

  constructor(allHints: HintResult[]) {
    this.allHints = allHints;
    this.revealed = new Set();

    // 随机打乱提示顺序（用于每次展示）
    this.shuffledQueue = [...this.allHints];
    this.shuffleQueue();
  }

  /** 用所有规则评估一张卡牌 */
  static fromCard(card: import('@/types/card').MtgCard): HintEngine {
    const hints = evaluateAllRules(card);
    return new HintEngine(hints);
  }

  private shuffleQueue(): void {
    for (let i = this.shuffledQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledQueue[i], this.shuffledQueue[j]] = [
        this.shuffledQueue[j],
        this.shuffledQueue[i],
      ];
    }
  }

  /** 获取一条随机初始提示 */
  getRandomInitial(): HintResult | null {
    if (this.shuffledQueue.length === 0) return null;
    const hint = this.shuffledQueue[0];
    this.revealed.add(hint.ruleId);
    return hint;
  }

  /** 揭示下一条未展示的提示 */
  revealNext(): HintResult | null {
    for (const hint of this.shuffledQueue) {
      if (!this.revealed.has(hint.ruleId)) {
        this.revealed.add(hint.ruleId);
        return hint;
      }
    }
    return null; // 所有提示已展示
  }

  /** 获取已揭示的提示列表 */
  getRevealed(): HintResult[] {
    return this.shuffledQueue.filter((h) => this.revealed.has(h.ruleId));
  }

  /** 剩余未揭示的提示数 */
  remainingCount(): number {
    return this.shuffledQueue.filter(
      (h) => !this.revealed.has(h.ruleId)
    ).length;
  }

  /** 总共可用的提示数 */
  totalCount(): number {
    return this.allHints.length;
  }

  /** 添加一条动态提示（不在初始规则集中的） */
  addDynamicHint(hint: HintResult): void {
    this.allHints.push(hint);
    this.shuffledQueue.push(hint);
  }
}
