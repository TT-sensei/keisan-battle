// 間違えた答えのパターンから「間違いの型」を推定する。
// 決めつけではなく目安：既知の間違いパターンに一致したときだけ型を付け、それ以外は other にする。
export const MISTAKE_TYPE_LABELS = {
  carry: "くり上がり・くり下がりのミス",
  place: "けたのずれ",
  operation: "ちがう計算をした",
  swap: "数字のならびの入れかえ",
  reduce: "約分していない",
  fracrule: "分数の計算のしかたのミス",
  remainder: "商とあまりのミス",
  other: "そのほかの計算ミス"
};

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const near = (x, y) => Math.abs(x - y) < 1e-9;
const digitsOf = (n) => String(Math.abs(Math.trunc(n))).split("").map(Number);

// くり上がりをしないたし算（位ごとに10で割った余りだけを並べる）
function noCarrySum(a, b) {
  const A = digitsOf(a).reverse(), B = digitsOf(b).reverse();
  let r = 0, p = 1;
  for (let i = 0; i < Math.max(A.length, B.length); i++) { r += (((A[i] || 0) + (B[i] || 0)) % 10) * p; p *= 10; }
  return r;
}
// くり下がりをしないひき算（位ごとに小さい方から引く、よくある間違い）
function noBorrowSub(a, b) {
  const A = digitsOf(a).reverse(), B = digitsOf(b).reverse();
  let r = 0, p = 1;
  for (let i = 0; i < Math.max(A.length, B.length); i++) { r += Math.abs((A[i] || 0) - (B[i] || 0)) * p; p *= 10; }
  return r;
}
function isPermutation(x, y) {
  const sx = String(Math.abs(Math.trunc(x))), sy = String(Math.abs(Math.trunc(y)));
  return sx.length === sy.length && sx !== sy && sx.split("").sort().join("") === sy.split("").sort().join("");
}
function parseExpr(display) {
  const m = String(display).replace(/,/g, "").match(/^(-?[\d.]+) ([+−×÷]) (-?[\d.]+)$/);
  return m ? { a: Number(m[1]), op: m[2], b: Number(m[3]) } : null;
}
function parseFracExpr(display) {
  let m = String(display).match(/^(\d+)\/(\d+) ([+−×÷]) (\d+)\/(\d+)$/);
  if (m) return { n1: +m[1], d1: +m[2], op: m[3], n2: +m[4], d2: +m[5] };
  m = String(display).match(/^(\d+)\/(\d+) ([×÷]) (\d+)$/);
  if (m) return { n1: +m[1], d1: +m[2], op: m[3], k: +m[4] };
  return null;
}

export function classifyMistake(question, value, second) {
  if (!question || !Number.isFinite(value)) return "other";
  const q = question, correct = q.answer;

  // あまりのあるわり算は、商・あまりの型にまとめる
  if (q.answerFormat === "remainder") return "remainder";

  // 2欄入力（分数・比）
  if (q.answerFormat === "pair") {
    if (!Number.isFinite(second)) return "other";
    const isRatio = q.pairLabels && q.pairLabels[0] === "ひだり";
    const sameValue = value * q.pairAnswer === second * correct;
    if (isRatio) {
      if (value === q.pairAnswer && second === correct) return "swap";
      if (sameValue && gcd(value, second) > 1) return "reduce"; // もっと簡単にできる
      return "other";
    }
    if (value === q.pairAnswer && second === correct) return "fracrule"; // 分子と分母が逆になっている
    const f = parseFracExpr(q.display);
    if (f) {
      const eq = (n, d) => value === n && second === d;
      if (f.k !== undefined) {
        if (f.op === "×" && eq(f.n1 * f.k, f.d1 * f.k)) return "fracrule"; // 分母にもかけてしまった
      } else {
        if (f.op === "+" && (eq(f.n1 + f.n2, f.d1 + f.d2) || eq(f.n1 + f.n2, f.d1) || eq(f.n1 + f.n2, f.d2))) return "fracrule"; // 通分していない
        if (f.op === "−" && (eq(Math.abs(f.n1 - f.n2), f.d1 + f.d2) || eq(Math.abs(f.n1 - f.n2), f.d1))) return "fracrule";
        if (f.op === "×" && eq(f.n1 * f.n2, f.d1 + f.d2)) return "fracrule";
        if (f.op === "÷" && eq(f.n1 * f.n2, f.d1 * f.d2)) return "fracrule"; // ひっくり返し忘れ
      }
    }
    if (sameValue && gcd(value, second) > 1) return "reduce"; // 値は合っているが約分していない
    return "other";
  }

  // □問題は、けたのずれと数字の入れかえだけを見る
  const isMissing = String(q.display).includes("□");
  if (!isMissing) {
    const e = parseExpr(q.display);
    if (e) {
      if (e.op === "+" && Number.isInteger(e.a) && Number.isInteger(e.b) && value === noCarrySum(e.a, e.b) && value !== correct) return "carry";
      if (e.op === "−" && Number.isInteger(e.a) && Number.isInteger(e.b) && value === noBorrowSub(e.a, e.b) && value !== correct) return "carry";
    }
    // けたのずれ（10倍・10分の1）
    if (correct !== 0 && value !== correct && (near(value, correct * 10) || near(value, correct / 10))) return "place";
    if (e) {
      const alts = e.op === "+" ? [e.a - e.b, e.a * e.b]
        : e.op === "−" ? [e.a + e.b]
        : e.op === "×" ? [e.a + e.b, e.a - e.b]
        : e.op === "÷" ? [e.a - e.b, e.a + e.b] : [];
      if (alts.some((x) => near(x, value) && !near(x, correct))) return "operation";
    }
  } else {
    if (correct !== 0 && value !== correct && (near(value, correct * 10) || near(value, correct / 10))) return "place";
  }
  if (Number.isInteger(correct) && Number.isInteger(value) && isPermutation(value, correct)) return "swap";
  return "other";
}
