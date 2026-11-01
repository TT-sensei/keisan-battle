// CPUバトル進行。問題への回答とナビアンの攻撃周期を独立して管理する。
// 敵の攻撃間隔は単元レベルで大きく開く（大きい数の計算ほど考える・書く時間がかかるため）
const ATTACK_INTERVALS = { 1: 20000, 2: 26000, 3: 32000, 4: 39000, 5: 46000 };
// 難易度は敵の攻撃間隔とダメージだけを変える。問題の数や内容は変えない。
const DIFFICULTY = {
  easy: { intervalFactor: 1.3, enemyDamage: 8 },
  normal: { intervalFactor: 1.0, enemyDamage: 10 },
  hard: { intervalFactor: 0.75, enemyDamage: 14 }
};
// 速く解くほどスピードボーナスが大きくなる（遅くてもペナルティはない）。
// 最速の目安は単元レベルで変わる（大きい数の計算ほど時間がかかるため）。
function speedBonusDamage(elapsedMs, level) {
  const fast = (3 + level) * 1000;
  if (elapsedMs <= fast) return 10;
  if (elapsedMs <= fast * 2) return 6;
  if (elapsedMs <= fast * 3.5) return 3;
  return 0;
}

export class Battle {
  constructor({ unit, onUpdate, onFinish, onFeedback, options = {} }) {
    this.unit = unit;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onFeedback = onFeedback;
    this.maxRounds = options.maxRounds || 10;
    this.round = 1;
    this.playerMaxHp = Number.isFinite(options.playerMaxHp) ? options.playerMaxHp : 100;
    this.xpRate = Number.isFinite(options.xpRate) ? options.xpRate : 1; // 経験値の入り具合（自分のレベルより易しい単元の周回防止）
    this.playerHp = this.playerMaxHp;
    this.enemyMaxHp = options.enemyMaxHp || 100;
    this.enemyHp = this.enemyMaxHp;
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
    this.questionStartedAt = null;
    // ナビキャラ特性（trait）: riku=バランス / sora=まもり / kai=ひらめき / saku=回復 / tsuki=スピード / nami=パワー
    this.trait = options.trait || "riku";
    const difficulty = DIFFICULTY[options.difficulty] || DIFFICULTY.normal;
    this.enemyDamage = difficulty.enemyDamage;
    const level = Math.max(1, Math.min(5, Number(unit.level) || 1));
    this.level = level;
    this.wrongCount = 0;
    let interval = ATTACK_INTERVALS[level] * difficulty.intervalFactor;
    if (this.trait === "tsuki") interval *= 1.15; // ツキ特性: 敵の攻撃が少しおそくなる
    this.enemyAttackInterval = Math.round(interval);
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
      playerMaxHp: this.playerMaxHp,
      enemyHp: this.enemyHp,
      enemyMaxHp: this.enemyMaxHp,
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
    this.wrongCount = 0;
    this.questionStartedAt = Date.now();
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

  submit(raw, remainderRaw) {
    if (this.finished || !this.acceptingAnswer || !this.question || raw === "") {
      return { accepted: false };
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) return { accepted: false };
    const twoField = this.question.answerFormat === "remainder" || this.question.answerFormat === "pair";
    if (twoField && (remainderRaw === "" || remainderRaw === undefined || !Number.isFinite(Number(remainderRaw)))) {
      return { accepted: false };
    }
    const expectedSecond = this.question.answerFormat === "pair" ? this.question.pairAnswer : this.question.remainder;
    const isCorrect = twoField
      ? (value === this.question.answer && Number(remainderRaw) === expectedSecond)
      : (value === this.question.answer);

    this.answered++;
    if (isCorrect) {
      this.acceptingAnswer = false;
      this.correct++;
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      // スピードボーナス: 速く正確に解くほど強く打てる（遅くてもペナルティはない）
      const elapsed = this.questionStartedAt === null ? Infinity : Date.now() - this.questionStartedAt;
      const speedBonus = speedBonusDamage(elapsed, this.level);
      let damage = 12 + Math.min(12, this.combo * 2);
      if (this.trait === "nami") damage = Math.round(damage * 1.25); // ナミ特性: パワー
      damage += speedBonus;
      this.enemyHp = Math.max(0, this.enemyHp - damage);
      this.xp += 8 + Math.min(4, this.combo);
      const specialGain = this.trait === "kai" ? 34 : 25; // カイ特性: 必殺技がたまりやすい
      this.special = Math.min(100, this.special + specialGain);
      let healed = 0;
      if (this.trait === "saku" && this.playerHp < this.playerMaxHp) { // サク特性: 正解で少し回復
        healed = Math.min(3, this.playerMaxHp - this.playerHp);
        this.playerHp += healed;
      }
      this.question = null;
      this.questionStartedAt = null;
      this.resetEnemyAttackTimer();
      let text = "正解！ " + damage + " ダメージ！";
      if (speedBonus >= 10) text = "⚡⚡ とてもすばやい正解！ " + damage + " ダメージ！";
      else if (speedBonus >= 6) text = "⚡ すばやい正解！ " + damage + " ダメージ！";
      else if (speedBonus >= 3) text = "はやい正解！ " + damage + " ダメージ！";
      if (healed) text += " HPが " + healed + " 回復！";
      if (this.special === 100) text = "正解！ 必殺技ゲージ MAX！";
      this.onFeedback({ kind: "success", text });
      this.onUpdate({ type: "correct", battle: this.snapshot(), damage });

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
    this.wrongCount++;
    const alreadyRecorded = this.mistakes.some(m =>
      m.unitId === this.question.unitId && m.display === this.question.display
    );
    if (!alreadyRecorded) {
      this.mistakes.push({
        display: this.question.display,
        answer: this.question.answer,
        answerText: this.question.answerText
          || (this.question.answerFormat === "remainder"
            ? this.question.answer + " あまり " + this.question.remainder
            : null),
        answerFormat: this.question.answerFormat || null,
        remainder: this.question.remainder ?? null,
        pairAnswer: this.question.pairAnswer ?? null,
        pairLabels: this.question.pairLabels || null,
        explanation: this.question.explanation || null,
        unitId: this.question.unitId,
        unitTitle: this.question.unitTitle
      });
    }
    // 2回間違えたら、解説をヒントとして出す（進行は止めない）
    this.onFeedback({
      kind: "miss",
      text: "ちがうよ。もう一度考えてみよう！",
      hint: this.wrongCount >= 2 ? (this.question.explanation || null) : null
    });
    this.onUpdate({ type: "wrong", battle: this.snapshot() });
    return { accepted: true, correct: false };
  }

  cpuAttack() {
    if (this.finished) return;
    this.enemyAttackCount++;
    this.combo = 0;
    this.special = Math.max(0, this.special - 10);
    let damage = this.enemyDamage;
    if (this.trait === "sora") damage = Math.max(1, Math.round(damage * 0.7)); // ソラ特性: まもり
    this.playerHp = Math.max(0, this.playerHp - damage);
    this.resetEnemyAttackTimer();
    this.onFeedback({ kind: "enemy", text: "ナビアンの攻撃！ " + damage + " ダメージ" });
    this.onUpdate({ type: "cpu", battle: this.snapshot(), damage });
    if (this.playerHp <= 0) this.finish(false);
  }

  activateSpecial() {
    if (this.finished || this.special < 100) return false;
    this.special = 0;
    this.enemyHp = Math.max(0, this.enemyHp - 30);
    this.onFeedback({ kind: "special", text: "必殺技発動！ 30 ダメージ！" });
    this.onUpdate({ type: "special", battle: this.snapshot(), damage: 30 });
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
      xp: Math.round((this.xp + (win ? 20 : 5)) * this.xpRate),
      mistakes: this.mistakes,
      unitId: this.unit.id,
      duration: Math.round((Date.now() - this.startedAt) / 1000)
    });
  }
}
