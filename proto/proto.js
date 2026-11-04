// ナビアン計算バトル試作（proto/）: 画面構成だけを作り直した検証用UI。
// 問題・ルール・保存形式は本編と共通（../js/ のモジュールをそのまま使う）。
import { OPERATIONS, UNIT_BY_ID } from "../js/data/units.js";
import { generateQuestion } from "../js/engine/question-generator.js";
import { Battle } from "../js/game/battle.js";
import { CHARACTERS, BACKGROUNDS, MONSTER_LIST, poseImg, GROUP_SCENES, HERO_IMAGE } from "../js/data/monsters.js";
import { startFurigana, stopFurigana } from "../js/furigana.js";
import { MISTAKE_TYPE_LABELS } from "../js/engine/mistake-types.js";

const $ = id => document.getElementById(id);
const DIFF_LABELS = { easy: "やさしい", normal: "ふつう", hard: "つよい" };
// カテゴリごとの記号と色（ステージ選択の色分け用）
const OPS_META = {
  addition: { symbol: "＋", color: "#e2604d" },
  subtraction: { symbol: "−", color: "#3f7fbf" },
  multiplication: { symbol: "×", color: "#e8930c" },
  division: { symbol: "÷", color: "#4da34a" },
  decimals: { symbol: "0.5", color: "#8e6fc8" },
  fractions: { symbol: "½", color: "#d6699e" },
  application: { symbol: "✎", color: "#2ea39b" }
};
const TRAITS = {
  riku: "バランス型・とくせいなし", sora: "まもり型・受けるダメージがへる",
  kai: "ひらめき型・必殺技がたまりやすい", saku: "回復型・正解するとHP回復",
  tsuki: "スピード型・敵の攻撃がおそくなる", nami: "パワー型・攻撃ダメージアップ"
};

// ===== 設定（本編と共通のキー・形式） =====
let settings = { count: 10, difficulty: "normal", sound: true, furigana: true };
try {
  const s = JSON.parse(localStorage.getItem("keisanBattleSettings") || "{}");
  if ([5, 10, 15, 20].includes(s.count)) settings.count = s.count;
  if (DIFF_LABELS[s.difficulty]) settings.difficulty = s.difficulty;
  if (typeof s.sound === "boolean") settings.sound = s.sound;
  if (typeof s.furigana === "boolean") settings.furigana = s.furigana;
} catch (e) {}
function saveSettings() { localStorage.setItem("keisanBattleSettings", JSON.stringify(settings)); }

// ===== 試作固有: 前回の単元・キャラ・カテゴリ =====
const state = { op: "addition", unit: "add-within-20", char: "riku", battle: null, answer: "", answer2: "", activeField: 1, currentEnemy: null, xpRate: 1 };
try {
  const p = JSON.parse(localStorage.getItem("keisanBattleProtoLast") || "{}");
  if (OPERATIONS[p.op]) state.op = p.op;
  if (UNIT_BY_ID[p.unit] && UNIT_BY_ID[p.unit].generator !== "future") state.unit = p.unit;
  if (CHARACTERS[p.char]) state.char = p.char;
} catch (e) {}
function saveProtoLast() {
  localStorage.setItem("keisanBattleProtoLast", JSON.stringify({ op: state.op, unit: state.unit, char: state.char }));
}

// ===== 保存データ（本編と共通のキー・形式） =====
let save;
try { save = JSON.parse(localStorage.getItem("keisanBattleSave") || "null"); } catch (e) { save = null; }
if (!save || typeof save !== "object" || Array.isArray(save)) save = { xp: 0, wins: 0, mistakes: [] };
if (typeof save.xp !== "number" || !(save.xp >= 0)) save.xp = 0;
if (typeof save.wins !== "number" || !(save.wins >= 0)) save.wins = 0;
if (!Array.isArray(save.mistakes)) save.mistakes = [];
save.sessions = Array.isArray(save.sessions) ? save.sessions : [];
save.mastery = save.mastery && typeof save.mastery === "object" ? save.mastery : {};
save.dex = save.dex && typeof save.dex === "object" ? save.dex : {};

const LEVEL_CAP = 20;
const xpStart = L => 25 * L * (L - 1);
function levelOf(xp) { let L = 1; while (L < LEVEL_CAP && xp >= xpStart(L + 1)) L++; return L; }
function levelInfo(xp) { const level = levelOf(xp); return { level, start: xpStart(level), next: level >= LEVEL_CAP ? null : xpStart(level + 1), maxHp: 100 + (level - 1) * 10 }; }
function xpRateFor(unitLevel) { const tier = Math.ceil(levelOf(save.xp) / 4); const d = tier - unitLevel; return d <= 0 ? 1 : d === 1 ? 0.5 : 0; }
function xpRateNote(unitLevel) { const r = xpRateFor(unitLevel); return r === 1 ? "" : "<small class=\"unit-record unit-xp\">" + (r === 0 ? "経験値は入らないよ" : "経験値は半分だよ") + "</small>"; }
function persist() {
  localStorage.setItem("keisanBattleSave", JSON.stringify(save));
  $("level").textContent = levelOf(save.xp);
  $("xp").textContent = save.xp;
  $("wins").textContent = save.wins;
  const info = levelInfo(save.xp);
  $("hero-level").textContent = info.level;
  $("hero-xp").textContent = save.xp;
  $("hero-wins").textContent = save.wins;
  $("hero-xpbar").style.width = (info.next ? Math.min(100, Math.round((save.xp - info.start) / (info.next - info.start) * 100)) : 100) + "%";
}
function pickEnemy(level) {
  let pool, hp;
  if (level <= 2) { pool = MONSTER_LIST.filter(m => m.set === "zako"); hp = 100; }
  else if (level === 3) { pool = MONSTER_LIST.filter(m => m.set !== "boss"); hp = 120; }
  else if (level === 4) { pool = MONSTER_LIST.filter(m => m.set === "evo"); hp = 120; }
  else { pool = MONSTER_LIST.filter(m => m.set !== "zako"); hp = 150; }
  const m = pool[Math.floor(Math.random() * pool.length)];
  return Object.assign({}, m, { hp });
}
function unitCleared(id) { return (save.sessions || []).some(x => x.mode === "battle" && x.unitId === id && x.win); }
function recommendedUnitId(opKey) {
  const units = OPERATIONS[opKey].units.filter(u => u.generator !== "future");
  for (const u of units) { if (!unitCleared(u.id)) return u.id; }
  return null;
}
function storeMistake(m) {
  const existing = save.mistakes.find(x => x.unitId === m.unitId && x.display === m.display);
  if (existing) { existing.count = (existing.count || 1) + 1; existing.at = Date.now(); }
  else {
    save.mistakes.push({ ...m, at: Date.now(), count: 1 });
    if (m.type) { save.typeStats = save.typeStats || {}; save.typeStats[m.type] = (save.typeStats[m.type] || 0) + 1; }
  }
}

// ===== 音（sounds-recipe- のレシピを動的 import、本編の手作り音は使わない） =====
let soundList = [];
try {
  ({ soundList } = await import("https://tt-sensei.github.io/sounds-recipe-/sounds.js"));
} catch (e) { soundList = []; }
let audioCtx = null;
function playSound(id) {
  if (!settings.sound || !Array.isArray(soundList)) return;
  const recipe = soundList.find(item => item.id === id);
  if (!recipe) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    recipe.play(audioCtx, 0.72);
  } catch (e) {}
}
function updateSoundToggle() { $("sound-toggle").textContent = settings.sound ? "🔊 音 ON" : "🔇 音 OFF"; }
function updateFuriToggle() { $("furi-toggle").textContent = settings.furigana ? "あ ふりがな ON" : "あ ふりがな OFF"; }

// ===== 入口 =====
function updateSummary() {
  $("summary").textContent = UNIT_BY_ID[state.unit].title + " ・ " + settings.count + "問 ・ " + DIFF_LABELS[settings.difficulty] + " ・ " + CHARACTERS[state.char].name;
  $("start-unit").textContent = UNIT_BY_ID[state.unit].title;
}
function renderOps() {
  const wrap = $("ops");
  wrap.innerHTML = "";
  Object.entries(OPERATIONS).forEach(([key, group]) => {
    const b = document.createElement("button");
    b.type = "button";
    const meta = OPS_META[key] || { symbol: "?", color: "#8a97a5" };
    b.className = "op" + (key === state.op ? " active" : "");
    b.style.setProperty("--opc", meta.color);
    b.innerHTML = "<span class=\"op-sym\"></span><span></span>";
    b.querySelector(".op-sym").textContent = meta.symbol;
    b.querySelector("span:last-child").textContent = group.label;
    b.onclick = () => {
      playSound("click");
      state.op = key;
      state.unit = OPERATIONS[key].units.find(u => u.generator !== "future").id;
      saveProtoLast(); renderOps(); renderUnits();
    };
    wrap.append(b);
  });
}
function renderUnits() {
  const group = OPERATIONS[state.op];
  $("unit-title").textContent = group.label + "の単元";
  $("unit-desc").textContent = group.description;
  $("unit-count").textContent = group.units.length + " UNITS";
  const wrap = $("units");
  wrap.innerHTML = "";
  const meta = OPS_META[state.op] || { symbol: "?", color: "#8a97a5" };
  wrap.style.setProperty("--opc", meta.color);
  document.querySelector(".unit-block").style.setProperty("--opc", meta.color);
  const recId = recommendedUnitId(state.op);
  group.units.forEach(u => {
    const b = document.createElement("button");
    b.type = "button";
    const records = save.sessions.filter(x => x.mode === "battle" && x.unitId === u.id);
    const answered = records.reduce((n, x) => n + (x.answered || 0), 0);
    const correct = records.reduce((n, x) => n + (x.correct || 0), 0);
    const rate = answered ? Math.round(correct / answered * 100) : 0;
    const cleared = records.some(x => x.win);
    b.className = "unit" + (u.id === state.unit ? " selected" : "");
    b.disabled = u.generator === "future";
    b.innerHTML = "<span class=\"unit-sym\"></span><span class=\"unit-texts\"><b>" + (u.id === recId ? "⭐ つぎはこれ！ " : "") + u.title + "</b><small>" + u.detail + " · " + u.grade.map(g => "小" + g).join("・") + "</small><small>" + (records.length ? ("挑戦 " + records.length + "回 · 正答率 " + rate + "%" + (cleared ? " · ✓ クリア" : "")) : "まだ挑戦していないよ") + "</small>" + xpRateNote(u.level) + "</span>" + (cleared ? "<span class=\"unit-stamp\">★ クリア！</span>" : "");
    const symEl = b.querySelector(".unit-sym");
    symEl.textContent = meta.symbol;
    if (meta.symbol.length > 1) symEl.style.fontSize = "30px";
    b.onclick = () => {
      state.unit = u.id; saveProtoLast(); playSound("click"); renderUnits();
      const sel = wrap.querySelector(".unit.selected");
      if (sel) { sel.classList.remove("pick"); void sel.offsetWidth; sel.classList.add("pick"); }
    };
    wrap.append(b);
  });
  updateSummary();
}
function renderChars() {
  const wrap = $("characters");
  wrap.innerHTML = "";
  Object.entries(CHARACTERS).forEach(([id, c]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "char" + (id === state.char ? " selected" : "");
    b.innerHTML = "<img alt=\"\"><b></b><small></small>";
    b.querySelector("img").src = c.img;
    b.querySelector("b").textContent = c.name;
    b.querySelector("small").textContent = TRAITS[id] || "";
    b.onclick = () => { state.char = id; saveProtoLast(); playSound("click"); renderChars(); updateSummary(); };
    wrap.append(b);
  });
}
function renderSegs() {
  document.querySelectorAll(".count-btn").forEach(b => {
    b.classList.toggle("selected", Number(b.dataset.count) === settings.count);
    b.onclick = () => { settings.count = Number(b.dataset.count); saveSettings(); renderSegs(); updateSummary(); };
  });
  document.querySelectorAll(".diff-btn").forEach(b => {
    b.classList.toggle("selected", b.dataset.diff === settings.difficulty);
    b.onclick = () => { settings.difficulty = b.dataset.diff; saveSettings(); renderSegs(); updateSummary(); };
  });
}

// ===== 画面切り替え =====
function screen(id) {
  ["home", "battle", "result"].forEach(x => $(x).classList.toggle("hidden", x !== id));
  $("app-header").classList.toggle("hidden", id === "battle");
  // 入口だけページ全体がスクロールする（バトル・結果は固定レイアウト）
  document.body.classList.toggle("on-home", id === "home");
  window.scrollTo(0, 0);
  if (id === "home") { renderUnits(); renderChars(); }
}

// ===== 答え入力（本編と同じ2欄仕様） =====
function isPair(q) { return !!(q && (q.answerFormat === "remainder" || q.answerFormat === "pair")); }
function pairLabels(q) { if (q && q.answerFormat === "pair" && q.pairLabels) return q.pairLabels; return ["しょう", "あまり"]; }
function pairPrompt(q) { return q && q.answerFormat === "pair" ? (q.pairLabels ? q.pairLabels[1] : "ふたつめ") + "も入力してね" : "あまりも入力してね"; }
function setActiveField(n) {
  state.activeField = n;
  $("answer").classList.toggle("active", n === 1);
  $("answer2").classList.toggle("active", n === 2);
}
function setupAnswerFields(q) {
  state.answer = ""; state.answer2 = "";
  $("answer").textContent = "?"; $("answer2").textContent = "?";
  const rem = isPair(q);
  $("remainder-part").classList.toggle("hidden", !rem);
  $("quotient-label").classList.toggle("hidden", !rem);
  if (rem) { const labels = pairLabels(q); $("quotient-label").textContent = labels[0]; $("remainder-label").textContent = labels[1]; }
  setActiveField(1);
}
function fieldValue() { return state.activeField === 2 ? state.answer2 : state.answer; }
function setFieldValue(v) {
  if (state.activeField === 2) { state.answer2 = v; $("answer2").textContent = v || "?"; }
  else { state.answer = v; $("answer").textContent = v || "?"; }
}

// ===== 演出 =====
let poseTimer = null;
function showPose(kind, ms) {
  const img = $("player-img");
  const src = poseImg(state.char, kind);
  if (!src) return;
  img.src = src;
  if (poseTimer) clearTimeout(poseTimer);
  poseTimer = setTimeout(() => { img.src = CHARACTERS[state.char].img; }, ms || 700);
}
function spawnDamage(target, amount) {
  const layer = $("fx-layer");
  const fig = $(target === "enemy" ? "enemy-img" : "player-img");
  if (!layer || !fig) return;
  const lr = layer.getBoundingClientRect(), r = fig.getBoundingClientRect();
  if (!r.width) return;
  const el = document.createElement("span");
  el.className = "dmg-pop " + (target === "enemy" ? "dmg-enemy" : "dmg-player");
  el.textContent = "-" + amount;
  el.style.left = (r.left - lr.left + r.width * (0.35 + Math.random() * 0.3)) + "px";
  el.style.top = (r.top - lr.top + r.height * 0.16) + "px";
  layer.append(el);
  setTimeout(() => el.remove(), 950);
}
function feedback(text) { $("feedback").textContent = text; }
function bump(el) { el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); setTimeout(() => el.classList.remove("hit"), 350); }
function animImg(img, cls, ms) { img.classList.remove(cls); void img.offsetWidth; img.classList.add(cls); setTimeout(() => img.classList.remove(cls), ms || 420); }

// ===== バトル進行（Battle クラスは本編と共通） =====
function render(event) {
  const b = event.battle;
  $("round").textContent = "正解 " + b.correct + " / " + b.maxRounds;
  $("php").style.width = (b.playerHp / b.playerMaxHp * 100) + "%";
  $("ehp").style.width = (b.enemyHp / b.enemyMaxHp * 100) + "%";
  $("phptext").textContent = "HP " + b.playerHp + " / " + b.playerMaxHp;
  $("ehptext").textContent = "HP " + b.enemyHp + " / " + b.enemyMaxHp;
  $("combo").textContent = "🔥 COMBO " + b.combo;
  $("progressbar").style.width = (b.correct / b.maxRounds * 100) + "%";
  $("attack-bar").style.width = b.attackProgress + "%";
  $("attack-time").textContent = "あと " + b.attackRemaining + " 秒";
  $("attack-clock").classList.toggle("urgent", b.attackRemaining <= 4);
  $("specialbar").style.width = b.special + "%";
  const specialGain = state.char === "kai" ? 34 : 25;
  $("specialtext").textContent = b.special >= 100 ? "必殺技ゲージ MAX！" : "あと" + Math.ceil((100 - b.special) / specialGain) + "回正解で必殺技！";
  $("special-use").disabled = b.special < 100 || state.battle.finished;
  if (event.type === "question-needed") {
    state.battle.setQuestion(generateQuestion(UNIT_BY_ID[state.unit]));
    return;
  }
  if (event.type === "question") {
    $("question").textContent = b.question.display + " = ?";
    setupAnswerFields(b.question);
    clearCanvas();
    return;
  }
  if (event.type === "correct" || event.type === "special") {
    playSound(event.type === "special" ? "sparkle" : "correct");
    showPose(event.type === "special" ? "special" : "attack", event.type === "special" ? 900 : 650);
    if (event.damage) spawnDamage("enemy", event.damage);
    animImg($("player-img"), "attacking-r");
    animImg($("enemy-img"), "damaged");
    bump($("enemy-col"));
  }
  if (event.type === "cpu") {
    playSound("drop");
    showPose("damage", 650);
    if (event.damage) spawnDamage("player", event.damage);
    animImg($("enemy-img"), "attacking-l");
    animImg($("player-img"), "damaged");
    bump($("player-col"));
  }
  if (event.type === "wrong") {
    playSound("wrong");
    const latest = b.mistakes[b.mistakes.length - 1];
    if (latest) { storeMistake(latest); persist(); }
    const card = document.querySelector(".col-center");
    card.classList.remove("question-card-shake"); void card.offsetWidth; card.classList.add("question-card-shake");
    setTimeout(() => card.classList.remove("question-card-shake"), 260);
  }
}

function finish(r) {
  const beforeLevel = levelOf(save.xp);
  if (r.win && state.currentEnemy) { const id = state.currentEnemy.id; save.dex[id] = (save.dex[id] || 0) + 1; }
  save.xp += r.xp;
  if (r.win) save.wins++;
  save.sessions.push({ mode: "battle", unitId: r.unitId, win: r.win, correct: r.correct, answered: r.answered, accuracy: r.accuracy, duration: r.duration, at: Date.now() });
  persist();
  $("resulticon").textContent = r.win ? "🏆" : "💪";
  $("resulttitle").textContent = r.win ? "クエストクリア！" : "もう少し！";
  $("resultmessage").textContent = r.win
    ? (state.currentEnemy ? ("「" + state.currentEnemy.name + "」に勝利！ 図鑑に登録したよ（" + (save.dex[state.currentEnemy.id] || 1) + "回目）。") : "ナビアンに勝利！計算の力がアップしたね。")
    : "最後までよく挑戦したね。特訓して再挑戦しよう！";
  if (state.xpRate === 0) $("resultmessage").textContent += " この単元はもう身についているので、経験値は入らないよ。もっと上の単元に挑戦しよう！";
  else if (state.xpRate === 0.5) $("resultmessage").textContent += " この単元はレベルより易しいので、経験値は半分だよ。";
  const info = levelInfo(save.xp);
  const leveled = info.level > beforeLevel;
  if (leveled) {
    $("levelinfo").textContent = "🎉 レベルアップ！ レベル" + info.level + " になったよ。つぎのバトルから HP が " + info.maxHp + " になるよ！";
    $("levelinfo").classList.remove("hidden");
  } else $("levelinfo").classList.add("hidden");
  $("correct").textContent = r.correct + "/" + r.answered;
  $("accuracy").textContent = r.accuracy + "%";
  $("earned").textContent = "+" + r.xp;
  $("bestcombo").textContent = r.bestCombo;
  $("mistakes").classList.toggle("hidden", !r.mistakes.length);
  $("mistakelist").innerHTML = "";
  r.mistakes.forEach(m => {
    const d = document.createElement("div");
    d.className = "mistake-item";
    const s = document.createElement("span");
    s.textContent = m.display + " = " + (m.answerText || m.answer);
    d.append(s);
    if (m.explanation) { const ex = document.createElement("small"); ex.textContent = m.explanation; d.append(ex); }
    if (m.type && MISTAKE_TYPE_LABELS[m.type]) { const tp = document.createElement("small"); tp.className = "mistake-type"; tp.textContent = "ミスの型：" + MISTAKE_TYPE_LABELS[m.type]; d.append(tp); }
    $("mistakelist").append(d);
  });
  const nextBtn = $("next-unit");
  if (r.win) {
    const opKey = Object.keys(OPERATIONS).find(k => OPERATIONS[k].units.some(u => u.id === r.unitId));
    const units = opKey ? OPERATIONS[opKey].units.filter(u => u.generator !== "future") : [];
    const idx = units.findIndex(u => u.id === r.unitId);
    const next = idx >= 0 ? units[idx + 1] : null;
    if (next) {
      nextBtn.textContent = "つぎの単元「" + next.title + "」へ →";
      nextBtn.classList.remove("hidden");
      nextBtn.onclick = () => { state.op = opKey; state.unit = next.id; saveProtoLast(); renderOps(); screen("home"); };
    } else nextBtn.classList.add("hidden");
  } else nextBtn.classList.add("hidden");
  playSound(r.win ? "clear" : "gameover");
  if (leveled) setTimeout(() => playSound("levelup"), 500);
  const show = () => {
    screen("result");
    if (r.win && window.EduEffects) {
      try { window.EduEffects.confetti($("result-card"), 26); } catch (e) {}
    }
  };
  if (r.win) { $("enemy-img").classList.add("defeated"); setTimeout(show, 950); }
  else show();
}

function start() {
  const unit = UNIT_BY_ID[state.unit];
  state.xpRate = xpRateFor(unit.level);
  const enemy = pickEnemy(unit.level);
  state.currentEnemy = enemy;
  $("enemy-img").classList.remove("defeated");
  $("player-img").src = CHARACTERS[state.char].img;
  ["attack", "damage", "special"].forEach(k => { const pre = new Image(); pre.src = poseImg(state.char, k); });
  $("player-name").textContent = CHARACTERS[state.char].name;
  $("player-level").textContent = "レベル " + levelOf(save.xp);
  $("enemy-img").src = enemy.img;
  $("enemy-name").textContent = enemy.name;
  $("enemy-kind").textContent = enemy.set === "boss" ? "ボスナビアン" : enemy.set === "evo" ? "進化ナビアン" : "ナビアン";
  const bg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  $("b-main").style.backgroundImage = "url(" + bg.img + ")";
  $("stage").textContent = "STAGE " + String(unit.level).padStart(2, "0");
  $("battle-unit").textContent = unit.title;
  feedback("バトルスタート！");
  state.answer = ""; state.answer2 = "";
  setDrawEnabled(false);
  state.battle = new Battle({
    unit,
    onUpdate: render,
    onFinish: finish,
    onFeedback: f => feedback(f.hint ? f.text + " ヒント：" + f.hint : f.text),
    options: { maxRounds: settings.count, difficulty: settings.difficulty, trait: state.char, enemyMaxHp: enemy.hp, playerMaxHp: levelInfo(save.xp).maxHp, xpRate: xpRateFor(unit.level) }
  });
  screen("battle");
  playSound("start");
  state.battle.start();
}

// ===== 手書きキャンバス（本編と同じ方式） =====
const canvas = $("work-canvas"), ctx = canvas.getContext("2d");
let drawing = false, drawEnabled = false, lastPoint = null;
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1);
  if (!rect.width || !rect.height) return;
  const old = document.createElement("canvas");
  old.width = canvas.width; old.height = canvas.height;
  if (old.width && old.height) old.getContext("2d").drawImage(canvas, 0, 0);
  canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#315f8d"; ctx.lineWidth = 3.2;
  if (old.width && old.height) ctx.drawImage(old, 0, 0, old.width, old.height, 0, 0, rect.width, rect.height);
}
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
function setDrawEnabled(enabled) {
  drawEnabled = enabled;
  canvas.classList.toggle("drawing", enabled);
  $("draw-toggle").classList.toggle("active", enabled);
  $("draw-toggle").setAttribute("aria-pressed", String(enabled));
  $("draw-toggle").textContent = enabled ? "✍ 手書き ON" : "✍ 手書き OFF";
}
function pointFromEvent(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
canvas.addEventListener("pointerdown", e => {
  if (!drawEnabled || !state.battle || state.battle.finished) return;
  e.preventDefault(); canvas.setPointerCapture(e.pointerId); drawing = true; lastPoint = pointFromEvent(e);
  ctx.beginPath(); ctx.arc(lastPoint.x, lastPoint.y, 1.5, 0, Math.PI * 2); ctx.fillStyle = "#315f8d"; ctx.fill();
});
canvas.addEventListener("pointermove", e => {
  if (!drawing || !drawEnabled) return;
  e.preventDefault(); const p = pointFromEvent(e);
  ctx.beginPath(); ctx.moveTo(lastPoint.x, lastPoint.y); ctx.lineTo(p.x, p.y); ctx.stroke(); lastPoint = p;
});
function stopDrawing() { drawing = false; lastPoint = null; }
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvas.addEventListener("lostpointercapture", stopDrawing);
$("draw-toggle").onclick = () => setDrawEnabled(!drawEnabled);
$("draw-clear").onclick = clearCanvas;
window.addEventListener("resize", resizeCanvas);
if ("ResizeObserver" in window) new ResizeObserver(resizeCanvas).observe(canvas);
requestAnimationFrame(resizeCanvas);

// ===== 入力 =====
function key(k) {
  if (!state.battle || state.battle.finished) return;
  if (k === "clear") { setFieldValue(""); return; }
  if (k === ".") {
    if (state.activeField === 2) return;
    const v = fieldValue();
    if (v.includes(".")) return;
    setFieldValue(v === "" ? "0." : v + ".");
    return;
  }
  if (k === "enter") {
    if (state.answer === "") return;
    const q = state.battle.question;
    if (isPair(q) && state.answer2 === "") { setActiveField(2); feedback(pairPrompt(q)); return; }
    const submitted = state.answer, submitted2 = state.answer2;
    const result = state.battle.submit(submitted, submitted2);
    if (result.accepted) {
      if (result.correct) {
        $("answer").textContent = submitted + " ✓";
        if (isPair(q)) $("answer2").textContent = submitted2 + " ✓";
      } else {
        state.answer = ""; state.answer2 = "";
        $("answer").textContent = "もう一度"; $("answer2").textContent = "?";
        setActiveField(1);
      }
    }
    return;
  }
  if (/^\d$/.test(k)) { const v = fieldValue(); if (v.length < 8) setFieldValue(v + k); }
}
$("answer").onclick = () => setActiveField(1);
$("answer2").onclick = () => setActiveField(2);
$("keypad").addEventListener("click", e => {
  const b = e.target.closest("button[data-key]");
  if (b) { playSound("click"); key(b.dataset.key); }
});
window.addEventListener("keydown", e => {
  if ($("battle").classList.contains("hidden")) return;
  if (/^\d$/.test(e.key)) key(e.key);
  else if (e.key === "Backspace") key("clear");
  else if (e.key === ".") key(".");
  else if (e.key === "Enter") key("enter");
});
$("start").onclick = start;
$("retry").onclick = start;
$("back").onclick = () => { if (state.battle) state.battle.stop(); state.battle = null; screen("home"); };
$("result-home").onclick = () => screen("home");
$("special-use").onclick = () => { if (state.battle) state.battle.activateSpecial(); };
$("sound-toggle").onclick = () => { settings.sound = !settings.sound; saveSettings(); updateSoundToggle(); if (settings.sound) playSound("correct"); };
$("furi-toggle").onclick = () => {
  settings.furigana = !settings.furigana; saveSettings(); updateFuriToggle();
  if (settings.furigana) startFurigana(); else stopFurigana();
};

// ===== 画像の読み込み失敗時の逃げ道（本編と同じ） =====
function guardImg(img, fallback) {
  if (!img) return;
  img.addEventListener("error", () => { img.classList.add("hidden"); if (fallback) fallback.classList.remove("hidden"); });
  img.addEventListener("load", () => { img.classList.remove("hidden"); if (fallback) fallback.classList.add("hidden"); });
}
guardImg($("player-img"), $("player-fallback"));
guardImg($("enemy-img"), $("enemy-fallback"));
guardImg($("hero-img"), null);

// ===== 入口のヒーロー（ファンタジーのアクション集合絵をランダム表示） =====
// 絵は切り取らず、1枚のイラストとして全体を見せる（パネル右下に contain で全体表示）。
const HERO_ARTS = (GROUP_SCENES.action && GROUP_SCENES.action.length) ? GROUP_SCENES.action : [HERO_IMAGE];
$("hero-img").src = HERO_ARTS[Math.floor(Math.random() * HERO_ARTS.length)];
$("hero-img").addEventListener("error", () => {
  if (!$("hero-img").src.includes("group-fantasy-departure")) $("hero-img").src = HERO_IMAGE;
});

// ===== 初期化 =====
updateSoundToggle();
updateFuriToggle();
if (settings.furigana) startFurigana();
persist();
renderOps();
renderChars();
renderSegs();
renderUnits();
