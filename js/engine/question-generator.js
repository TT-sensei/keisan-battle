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

function missingAddend(config) {
  const c = config || {};
  const missing = rand(c.min ?? 1, c.max ?? 10);
  const known = rand(c.min ?? 1, c.max ?? 10);
  const total = missing + known;
  if (total > (c.maxTotal ?? 20)) return missingAddend(config);
  return {
    a: missing, b: known, operator: "+", answer: missing,
    display: "□ + " + known + " = " + total,
    explanation: total + " − " + known + " = " + missing + " です。"
  };
}

function missingSubtrahend(config) {
  const c = config || {};
  const result = rand(1, 9);
  const missing = rand(1, 9);
  const total = result + missing;
  return {
    a: total, b: missing, operator: "−", answer: missing,
    display: total + " − □ = " + result,
    explanation: total + " − " + result + " = " + missing + " です。"
  };
}

function missingFactor(config) {
  const c = config || {};
  const factor = rand(c.min ?? 2, c.max ?? 9);
  const known = rand(c.min ?? 2, c.max ?? 9);
  return {
    a: factor, b: known, operator: "×", answer: factor,
    display: "□ × " + known + " = " + (factor * known),
    explanation: (factor * known) + " ÷ " + known + " = " + factor + " です。"
  };
}

function missingDivisor(config) {
  const c = config || {};
  const divisor = rand(c.min ?? 2, c.max ?? 9);
  const quotient = rand(1, 9);
  const dividend = divisor * quotient;
  return {
    a: dividend, b: divisor, operator: "÷", answer: divisor,
    display: dividend + " ÷ □ = " + quotient,
    explanation: dividend + " ÷ " + quotient + " = " + divisor + " です。"
  };
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


function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function average(config) {
  const c = config || {};
  for (let attempt = 0; attempt < 5000; attempt++) {
    const averageValue = rand(c.minAverage ?? 10, c.maxAverage ?? 100);
    const spread = c.spread ?? 12;
    const a = averageValue + rand(-spread, spread);
    const b = averageValue + rand(-spread, spread);
    const remaining = averageValue * 3 - a - b;
    const minValue = c.minAverage ?? 10, maxValue = c.maxAverage ?? 100;
    if ([a, b, remaining].some(value => value < minValue || value > maxValue)) continue;
    const values = [a, b, remaining];
    return {
      a, b, operator: "平均", answer: averageValue,
      display: values.join("・") + " の平均",
      explanation: values.join(" + ") + " = " + (averageValue * 3) + "。3つの数の平均は " + averageValue + " です。"
    };
  }
  throw new Error("平均の問題を作れませんでした。");
}

function commonMultiple(config) {
  const c = config || {};
  const a = rand(c.min ?? 2, c.max ?? 30);
  let b = rand(c.min ?? 2, c.max ?? 30);
  if (a === b) b = b === (c.max ?? 30) ? b - 1 : b + 1;
  const answer = (a * b) / gcd(a, b);
  return {
    a, b, operator: "最小公倍数", answer,
    display: a + " と " + b + " の最小公倍数",
    explanation: a + " と " + b + " の最小公倍数は " + answer + " です。"
  };
}

function commonDivisor(config) {
  const c = config || {};
  const a = rand(c.min ?? 2, c.max ?? 60);
  let b = rand(c.min ?? 2, c.max ?? 60);
  if (a === b) b = b === (c.max ?? 60) ? b - 1 : b + 1;
  const answer = gcd(a, b);
  return {
    a, b, operator: "最大公約数", answer,
    display: a + " と " + b + " の最大公約数",
    explanation: a + " と " + b + " の最大公約数は " + answer + " です。"
  };
}

function sum(config) {
  const c = config || {};
  const values = [rand(c.min ?? 10, c.max ?? 100), rand(c.min ?? 10, c.max ?? 100), rand(c.min ?? 10, c.max ?? 100)];
  const answer = values.reduce((total, value) => total + value, 0);
  return {
    a: values[0], b: values[1], operator: "合計", answer,
    display: values.join("・") + " の合計",
    explanation: values.join(" + ") + " = " + answer + " です。"
  };
}

function percentage(config) {
  const c = config || {};
  const base = rand(Math.ceil((c.minBase ?? 100) / 20), Math.floor((c.maxBase ?? 1000) / 20)) * 20;
  const percent = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80][rand(0, 9)];
  const answer = base * percent / 100;
  return {
    a: base, b: percent, operator: "%", answer,
    display: base + " の " + percent + "%",
    explanation: base + " × " + percent + " ÷ 100 = " + answer + " です。"
  };
}

function percentageRate(config) {
  const c = config || {};
  const base = rand(Math.ceil((c.minBase ?? 100) / 20), Math.floor((c.maxBase ?? 1000) / 20)) * 20;
  const percent = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80][rand(0, 9)];
  const part = base * percent / 100;
  return {
    a: part, b: base, operator: "割合", answer: percent,
    display: part + " は " + base + " の何%",
    explanation: part + " ÷ " + base + " × 100 = " + percent + "% です。"
  };
}

function percentageBase(config) {
  const c = config || {};
  const base = rand(Math.ceil((c.minBase ?? 100) / 20), Math.floor((c.maxBase ?? 1000) / 20)) * 20;
  const percent = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80][rand(0, 9)];
  const part = base * percent / 100;
  return {
    a: part, b: percent, operator: "もとにする量", answer: base,
    display: part + " が " + percent + "% にあたる数",
    explanation: part + " ÷ " + (percent / 100) + " = " + base + " です。"
  };
}

function speed(config) {
  const c = config || {};
  const speedValue = rand(c.minSpeed ?? 20, c.maxSpeed ?? 120);
  const time = rand(c.minTime ?? 2, c.maxTime ?? 10);
  const distance = speedValue * time;
  return {
    a: distance, b: time, operator: "速さ", answer: speedValue,
    display: "道のり " + distance + " m・時間 " + time + " 分。速さ（m/分）",
    explanation: distance + " ÷ " + time + " = " + speedValue + " m/分 です。"
  };
}

const generators = { addition, subtraction, multiplication, division, missingAddend, missingSubtrahend, missingFactor, missingDivisor, decimalAddition, decimalSubtraction, decimalMultiplication, decimalDivision, average, commonMultiple, commonDivisor, sum, percentage, percentageRate, percentageBase, speed };

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
