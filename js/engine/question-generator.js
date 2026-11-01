// 四則計算の問題生成エンジン。単元カタログの設定から条件に合う問題を生成する。
const rand = (min, max) => {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError("問題の数の範囲が正しくありません。");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const formatNumber = value => new Intl.NumberFormat("ja-JP").format(value);

// すべての位を調べ、計算の途中で一度でもくり上がりが起きるか確認する。
function hasCarry(a, b) {
  let carry = 0;
  while (a > 0 || b > 0) {
    const sum = (a % 10) + (b % 10) + carry;
    if (sum >= 10) return true;
    carry = Math.floor(sum / 10);
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

// すべての位を調べ、計算の途中で一度でもくり下がりが起きるか確認する。
function hasBorrow(a, b) {
  let borrow = 0;
  let found = false;
  while (a > 0 || b > 0) {
    const digitA = a % 10;
    const digitB = b % 10;
    if (digitA - borrow < digitB) {
      borrow = 1;
      found = true;
    } else {
      borrow = 0;
    }
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return found;
}

function addition(config) {
  const c = config || {};
  const minA = c.minA ?? 1;
  const maxA = c.maxA ?? 9999;
  const minB = c.minB ?? 1;
  const maxB = c.maxB ?? 9999;

  for (let attempt = 0; attempt < 5000; attempt++) {
    const a = rand(minA, maxA);
    const b = rand(minB, maxB);
    const carries = hasCarry(a, b);
    if (c.carry === true && !carries) continue;
    if (c.carry === false && carries) continue;
    const answer = a + b;
    return {
      a, b, operator: "+", answer,
      display: formatNumber(a) + " + " + formatNumber(b),
      explanation: formatNumber(a) + " と " + formatNumber(b) + " を合わせると " + formatNumber(answer) + " です。"
    };
  }
  throw new Error("この条件に合うたし算を作れませんでした。単元の数の範囲を確認してください。");
}

function subtraction(config) {
  const c = config || {};
  const minA = c.minA ?? 10;
  const maxA = c.maxA ?? 9999;
  const minB = c.minB ?? 1;
  const maxB = c.maxB ?? 9999;

  for (let attempt = 0; attempt < 5000; attempt++) {
    const a = rand(minA, maxA);
    const upperB = Math.min(maxB, a);
    if (minB > upperB) continue;
    const b = rand(minB, upperB);
    const borrows = hasBorrow(a, b);
    if (c.borrow === true && !borrows) continue;
    if (c.borrow === false && borrows) continue;
    const answer = a - b;
    return {
      a, b, operator: "−", answer,
      display: formatNumber(a) + " − " + formatNumber(b),
      explanation: formatNumber(a) + " から " + formatNumber(b) + " をひくと " + formatNumber(answer) + " です。"
    };
  }
  throw new Error("この条件に合うひき算を作れませんでした。単元の数の範囲を確認してください。");
}

function multiplication(config) {
  const c = config || {};
  const a = rand(c.minA ?? 1, c.maxA ?? 9999);
  const b = rand(c.minB ?? 1, c.maxB ?? 9);
  const answer = a * b;
  return {
    a, b, operator: "×", answer,
    display: formatNumber(a) + " × " + formatNumber(b),
    explanation: formatNumber(a) + " を " + b + " こ分にすると " + formatNumber(answer) + " です。"
  };
}

function division(config) {
  const c = config || {};
  if (c.remainder) {
    throw new Error("あまりのあるわり算は、商とあまりの入力に対応後に公開します。");
  }

  const minDividend = c.minDividend ?? 2;
  const maxDividend = c.maxDividend ?? 9999;
  const minDivisor = c.minDivisor ?? 2;
  const maxDivisor = c.maxDivisor ?? 9;
  const minQuotient = c.minQuotient ?? 1;
  const maxQuotient = c.maxQuotient ?? 9999;

  for (let attempt = 0; attempt < 5000; attempt++) {
    const divisor = rand(minDivisor, maxDivisor);
    const lowestQuotient = Math.max(minQuotient, Math.ceil(minDividend / divisor));
    const highestQuotient = Math.min(maxQuotient, Math.floor(maxDividend / divisor));
    if (lowestQuotient > highestQuotient) continue;

    const quotient = rand(lowestQuotient, highestQuotient);
    const dividend = divisor * quotient;
    return {
      a: dividend,
      b: divisor,
      operator: "÷",
      answer: quotient,
      remainder: 0,
      display: formatNumber(dividend) + " ÷ " + divisor,
      explanation: formatNumber(dividend) + " ÷ " + divisor + " = " + quotient + " です。"
    };
  }
  throw new Error("この条件に合うわり算を作れませんでした。単元の数の範囲を確認してください。");
}

const generators = { addition, subtraction, multiplication, division };

export function generateQuestion(unit) {
  if (!unit || !generators[unit.generator]) {
    throw new Error("この単元の問題はまだ準備中です。");
  }
  return Object.assign(
    generators[unit.generator](unit.config),
    {
      unitId: unit.id,
      unitTitle: unit.title,
      createdAt: Date.now()
    }
  );
}
