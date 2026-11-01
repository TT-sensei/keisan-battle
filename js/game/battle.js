// CPUバトル進行。問題への回答とナビアンの攻撃周期を独立して管理する。
const ATTACK_INTERVALS = { 1: 18000, 2: 21000, 3: 24000, 4: 27000, 5: 30000 };

export class Battle {
  constructor({ unit, onUpdate, onFinish, onFeedback }) {
    this.unit = unit;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onFeedback = onFeedback;
    this.maxRounds = 10;
    this.round = 1;
    this.playerHp = 100;
    this.enemyHp = 100;
    this.combo = 0;
    this.bestCombo = 0;
    this.correct = 0;
    this.answered = 0;
    this.mistakes = [];
    this.xp = 0;
    this.special = 0;
    this.question = null;
    this.finished = false;
    this.acceptingAnswer = false;
    this.started = false;
    this.startedAt = Date.now();
    const level = Math.max(1, Math.min(5, Number(unit.level) || 1));
    this.enemyAttackInterval = ATTACK_INTERVALS[level];
    this.nextEnemyAttackAt = null;
    this.clockTimer = null;
    this.nextQuestionTimer = null;
    this.enemyAttackCount = 0;
  }

  snapshot() {
    const remainingMs = this.nextEnemyAttackAt === null
      ? this.enemyAttackInterval
      : Math.max(0, this.nextEnemyAttackAt - Date.now());
    return {
      round: this.round,
      maxRounds: this.maxRounds,
      playerHp: this.playerHp,
      enemyHp: this.enemyHp,
      combo: this.combo,
      bestCombo: this.bestCombo,
      correct: this.correct,
      answered: this.answered,
      mistakes: this.mistakes,
      xp: this.xp,
      special: this.special,
      question: this.question,
      acceptingAnswer: this.acceptingAnswer,
      enemyAttackInterval: this.enemyAttackInterval,
      attackRemaining: Math.ceil(remainingMs / 1000),
      attackProgress: Math.max(0, Math.min(100,
        ((this.enemyAttackInterval - remainingMs) / this.enemyAttackInterval) * 100
      )),
      enemyAttackCount: this.enemyAttackCount
    };
  }

  start() {
    if (this.started || this.finished) return;
    this.started = true;
    this.startedAt = Date.now();
    this.resetEnemyAttackTimer();
    this.clockTimer = setInterval(() => this.tick(), 100);
    this.onUpdate({ type: "question-needed", battle: this.snapshot() });
  }

  setQuestion(question) {
    if (this.finished) return;
    this.question = question;
    this.acceptingAnswer = true;
    this.onUpdate({ type: "question", battle: this.snapshot() });
  }

  tick() {
    if (this.finished || this.nextEnemyAttackAt === null) return;
    if (Date.now() >= this.nextEnemyAttackAt) {
      this.cpuAttack();
      return;
    }
    this.onUpdate({ type: "clock", battle: this.snapshot() });
  }

  resetEnemyAttackTimer() {
    this.nextEnemyAttackAt = Date.now() + this.enemyAttackInterval;
  }

  submit(raw) {
    if (this.finished || !this.acceptingAnswer || !this.question || raw === "") {
      return { accepted: false };
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) return { accepted: false };

    this.answered++;
    if (value === this.question.answer) {
      this.acceptingAnswer = false;
      this.correct++;
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      const damage = 12 + Math.min(12, this.combo * 2);
      this.enemyHp = Math.max(0, this.enemyHp - damage);
      this.xp += 8 + Math.min(4, this.combo);
      this.special = Math.min(100, this.special + 25);
      this.question = null;
      this.resetEnemyAttackTimer();
      this.onFeedback({
        kind: "success",
        text: this.special === 100 ? "正解！ 必殺技ゲージ MAX！" : "正解！ " + damage + " ダメージ！"
      });
      this.onUpdate({ type: "correct", battle: this.snapshot() });

      if (this.enemyHp <= 0) {
        this.finish(true);
      } else if (this.correct >= this.maxRounds) {
        this.finish(this.playerHp > this.enemyHp);
      } else {
        this.nextQuestionTimer = setTimeout(() => {
          if (this.finished) return;
          this.round = this.correct + 1;
          this.onUpdate({ type: "question-needed", battle: this.snapshot() });
        }, 420);
      }
      return { accepted: true, correct: true };
    }

    this.combo = 0;
    const alreadyRecorded = this.mistakes.some(m =>
      m.unitId === this.question.unitId && m.display === this.question.display
    );
    if (!alreadyRecorded) {
      this.mistakes.push({
        display: this.question.display,
        answer: this.question.answer,
        unitId: this.question.unitId,
        unitTitle: this.question.unitTitle
      });
    }
    this.onFeedback({ kind: "miss", text: "ちがうよ。もう一度考えてみよう！" });
    this.onUpdate({ type: "wrong", battle: this.snapshot() });
    return { accepted: true, correct: false };
  }

  cpuAttack() {
    if (this.finished) return;
    this.enemyAttackCount++;
    this.combo = 0;
    this.special = Math.max(0, this.special - 10);
    this.playerHp = Math.max(0, this.playerHp - 10);
    this.resetEnemyAttackTimer();
    this.onFeedback({ kind: "enemy", text: "ナビアンの攻撃！ 10 ダメージ" });
    this.onUpdate({ type: "cpu", battle: this.snapshot() });
    if (this.playerHp <= 0) this.finish(false);
  }

  activateSpecial() {
    if (this.finished || this.special < 100) return false;
    this.special = 0;
    this.enemyHp = Math.max(0, this.enemyHp - 30);
    this.onFeedback({ kind: "special", text: "必殺技発動！ 30 ダメージ！" });
    this.onUpdate({ type: "special", battle: this.snapshot() });
    if (this.enemyHp <= 0) this.finish(true);
    return true;
  }

  clearTimers() {
    if (this.clockTimer !== null) clearInterval(this.clockTimer);
    if (this.nextQuestionTimer !== null) clearTimeout(this.nextQuestionTimer);
    this.clockTimer = null;
    this.nextQuestionTimer = null;
  }

  stop() {
    this.finished = true;
    this.clearTimers();
  }

  finish(win = this.enemyHp <= 0 || (this.correct >= this.maxRounds && this.playerHp > this.enemyHp)) {
    if (this.finished) return;
    this.finished = true;
    this.acceptingAnswer = false;
    this.clearTimers();
    const accuracy = this.answered ? Math.round(this.correct / this.answered * 100) : 0;
    this.onFinish({
      win,
      correct: this.correct,
      answered: this.answered,
      accuracy,
      bestCombo: this.bestCombo,
      xp: this.xp + (win ? 20 : 5),
      mistakes: this.mistakes,
      unitId: this.unit.id,
      duration: Math.round((Date.now() - this.startedAt) / 1000)
    });
  }
}
