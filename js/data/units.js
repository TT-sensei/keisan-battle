// 単元カタログ。学年・難易度・問題範囲を設定し、生成ロジックと分離する。
export const OPERATIONS = {
  addition: {
    label: "たし算",
    description: "数の大きさや、くり上がりの有無を選ぼう。",
    units: [
      { id: "add-within-20", title: "20までのたし算", detail: "1けた＋1けた", grade: [1], level: 1, generator: "addition", config: { minA: 1, maxA: 10, minB: 1, maxB: 10 } },
      { id: "add-two-no-carry", title: "2けたのたし算（くり上がりなし）", detail: "2けた＋2けた", grade: [2], level: 2, generator: "addition", config: { minA: 10, maxA: 89, minB: 10, maxB: 89, carry: false } },
      { id: "add-two-carry", title: "2けたのたし算（くり上がりあり）", detail: "一の位・十の位のくり上がり", grade: [2], level: 3, generator: "addition", config: { minA: 10, maxA: 99, minB: 10, maxB: 99, carry: true } },
      { id: "add-three-no-carry", title: "3けたのたし算（くり上がりなし）", detail: "3けた＋3けた", grade: [3], level: 4, generator: "addition", config: { minA: 100, maxA: 499, minB: 100, maxB: 499, carry: false } },
      { id: "add-three-carry", title: "3けたのたし算（くり上がりあり）", detail: "3けた＋3けた", grade: [3], level: 4, generator: "addition", config: { minA: 100, maxA: 999, minB: 100, maxB: 999, carry: true } },
      { id: "add-four", title: "4けたのたし算", detail: "大きな数のたし算", grade: [4], level: 5, generator: "addition", config: { minA: 1000, maxA: 9999, minB: 1000, maxB: 9999 } },
      { id: "add-decimal", title: "小数のたし算", detail: "今後追加予定", grade: [4, 5], level: 6, generator: "future", config: {} }
    ]
  },
  subtraction: {
    label: "ひき算",
    description: "数の大きさや、くり下がりの有無を選ぼう。",
    units: [
      { id: "sub-within-20", title: "20までのひき算", detail: "2けた−1けた", grade: [1], level: 1, generator: "subtraction", config: { minA: 10, maxA: 20, minB: 1, maxB: 9 } },
      { id: "sub-two-no-borrow", title: "2けたのひき算（くり下がりなし）", detail: "2けた−2けた", grade: [2], level: 2, generator: "subtraction", config: { minA: 10, maxA: 99, minB: 10, maxB: 99, borrow: false } },
      { id: "sub-two-borrow", title: "2けたのひき算（くり下がりあり）", detail: "一の位からくり下がる", grade: [2], level: 3, generator: "subtraction", config: { minA: 20, maxA: 99, minB: 1, maxB: 89, borrow: true } },
      { id: "sub-three-no-borrow", title: "3けたのひき算（くり下がりなし）", detail: "3けた−3けた", grade: [3], level: 4, generator: "subtraction", config: { minA: 100, maxA: 999, minB: 100, maxB: 999, borrow: false } },
      { id: "sub-three-borrow", title: "3けたのひき算（くり下がりあり）", detail: "3けた−3けた", grade: [3], level: 4, generator: "subtraction", config: { minA: 100, maxA: 999, minB: 1, maxB: 999, borrow: true } },
      { id: "sub-four", title: "4けたのひき算", detail: "大きな数のひき算", grade: [4], level: 5, generator: "subtraction", config: { minA: 1000, maxA: 9999, minB: 1, maxB: 9999 } },
      { id: "sub-decimal", title: "小数のひき算", detail: "今後追加予定", grade: [4, 5], level: 6, generator: "future", config: {} }
    ]
  },
  multiplication: {
    label: "かけ算",
    description: "九九から、位の多いかけ算へ進もう。",
    units: [
      { id: "mul-table", title: "九九", detail: "1けた×1けた", grade: [2], level: 1, generator: "multiplication", config: { minA: 1, maxA: 9, minB: 1, maxB: 9 } },
      { id: "mul-two-one", title: "2けた×1けた", detail: "くり上がりのある計算も", grade: [3], level: 2, generator: "multiplication", config: { minA: 10, maxA: 99, minB: 2, maxB: 9 } },
      { id: "mul-two-two", title: "2けた×2けた", detail: "2けたどうしの筆算", grade: [4], level: 3, generator: "multiplication", config: { minA: 10, maxA: 99, minB: 10, maxB: 99 } },
      { id: "mul-three-one", title: "3けた×1けた", detail: "3けたの数に1けたをかける", grade: [4], level: 4, generator: "multiplication", config: { minA: 100, maxA: 999, minB: 2, maxB: 9 } },
      { id: "mul-three-two", title: "3けた×2けた", detail: "大きな数の筆算", grade: [4, 5], level: 5, generator: "multiplication", config: { minA: 100, maxA: 999, minB: 10, maxB: 99 } },
      { id: "mul-four-one", title: "4けた×1けた", detail: "さらに大きな数に挑戦", grade: [4, 5], level: 5, generator: "multiplication", config: { minA: 1000, maxA: 9999, minB: 2, maxB: 9 } },
      { id: "mul-decimal", title: "小数のかけ算", detail: "今後追加予定", grade: [5, 6], level: 6, generator: "future", config: {} }
    ]
  },
  division: {
    label: "わり算",
    description: "わり切れる計算から、大きな数のわり算へ進もう。",
    units: [
      { id: "div-table", title: "九九を使うわり算", detail: "九九の逆算・わり切れる計算", grade: [3], level: 1, generator: "division", config: { minDividend: 2, maxDividend: 81, minDivisor: 2, maxDivisor: 9, minQuotient: 1, maxQuotient: 9 } },
      { id: "div-two-one", title: "2けた÷1けた", detail: "2けたの数を1けたでわる", grade: [4], level: 2, generator: "division", config: { minDividend: 10, maxDividend: 99, minDivisor: 2, maxDivisor: 9 } },
      { id: "div-three-one", title: "3けた÷1けた", detail: "3けたの数を1けたでわる", grade: [4], level: 3, generator: "division", config: { minDividend: 100, maxDividend: 999, minDivisor: 2, maxDivisor: 9 } },
      { id: "div-four-one", title: "4けた÷1けた", detail: "大きな数のわり算", grade: [4, 5], level: 5, generator: "division", config: { minDividend: 1000, maxDividend: 9999, minDivisor: 2, maxDivisor: 9 } },
      { id: "div-remainder", title: "あまりのあるわり算", detail: "商とあまりの入力に対応後に公開", grade: [3, 4], level: 4, generator: "future", config: {} },
      { id: "div-decimal", title: "小数のわり算", detail: "今後追加予定", grade: [5, 6], level: 6, generator: "future", config: {} }
    ]
  }
};

export const UNIT_BY_ID = Object.values(OPERATIONS)
  .flatMap(operation => operation.units)
  .reduce((map, unit) => {
    map[unit.id] = unit;
    return map;
  }, {});
