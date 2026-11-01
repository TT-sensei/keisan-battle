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


function formatDecimal(scaledValue, places) {
  return (scaledValue / (10 ** places)).toFixed(places);
}

function decimalAddition(config) {
  const c = config || {}, places = c.places ?? 1;
  const a = rand(c.minA ?? 1, c.maxA ?? 99);
  const b = rand(c.minB ?? 1, c.maxB ?? 99);
  const total = a + b, answer = total / (10 ** places);
  return {
    a, b, operator: "+", answer,
    display: formatDecimal(a, places) + " + " + formatDecimal(b, places),
    explanation: formatDecimal(a, places) + " と " + formatDecimal(b, places) + " を合わせると " + formatDecimal(total, places) + " です。"
  };
}

function decimalSubtraction(config) {
  const c = config || {}, places = c.places ?? 1;
  for (let attempt = 0; attempt < 5000; attempt++) {
    const a = rand(c.minA ?? 10, c.maxA ?? 999);
    const b = rand(c.minB ?? 1, Math.min(c.maxB ?? 99, a));
    if (a < b) continue;
    const difference = a - b, answer = difference / (10 ** places);
    return {
      a, b, operator: "−", answer,
      display: formatDecimal(a, places) + " − " + formatDecimal(b, places),
      explanation: formatDecimal(a, places) + " から " + formatDecimal(b, places) + " をひくと " + formatDecimal(difference, places) + " です。"
    };
  }
  throw new Error("この条件に合う小数のひき算を作れませんでした。");
}

function decimalMultiplication(config) {
  const c = config || {}, placesA = c.placesA ?? 1, placesB = c.placesB ?? 0;
  const a = rand(c.minA ?? 1, c.maxA ?? 999);
  const b = rand(c.minB ?? 1, c.maxB ?? 9);
  const product = a * b, places = placesA + placesB;
  const answer = product / (10 ** places);
  return {
    a, b, operator: "×", answer,
    display: formatDecimal(a, placesA) + " × " + formatDecimal(b, placesB),
    explanation: formatDecimal(a, placesA) + " に " + formatDecimal(b, placesB) + " をかけると " + formatDecimal(product, places) + " です。"
  };
}

function decimalDivision(config) {
  const c = config || {}, quotientPlaces = c.quotientPlaces ?? 1;
  const divisor = rand(c.divisorMin ?? 2, c.divisorMax ?? 9);
  const quotient = rand(c.minQuotient ?? 1, c.maxQuotient ?? 99);
  if (c.mode === "decimal") {
    const dividendScaled = divisor * quotient;
    const dividend = dividendScaled / 100;
    const divisorValue = divisor / 10;
    const answer = quotient / (10 ** quotientPlaces);
    return {
      a: dividendScaled, b: divisor, operator: "÷", answer,
      display: formatDecimal(dividendScaled, 2) + " ÷ " + formatDecimal(divisor, 1),
      explanation: formatDecimal(dividendScaled, 2) + " ÷ " + formatDecimal(divisor, 1) + " = " + answer + " です。"
    };
  }
  const dividendScaled = divisor * quotient;
  const answer = quotient / (10 ** quotientPlaces);
  return {
    a: dividendScaled, b: divisor, operator: "÷", answer,
    display: formatDecimal(dividendScaled, quotientPlaces) + " ÷ " + divisor,
    explanation: formatDecimal(dividendScaled, quotientPlaces) + " ÷ " + divisor + " = " + answer + " です。"
  };
}

const generators = { addition, subtraction, multiplication, division, decimalAddition, decimalSubtraction, decimalMultiplication, decimalDivision };

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
