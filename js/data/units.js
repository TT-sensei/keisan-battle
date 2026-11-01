// 単元カタログ。学年・難易度・問題範囲を設定し、生成ロジックと分離する。
export const OPERATIONS = {
  addition: {
    label: "たし算",
    description: "数の大きさや、くり上がりの有無を選ぼう。",
    units: [
      { id: "add-within-20", title: "20までのたし算", detail: "1けた＋1けた", grade: [1], level: 1, generator: "addition", config: { minA: 1, maxA: 10, minB: 1, maxB: 10 } },
      { id: "add-two-one-no-carry", title: "2けた＋1けた（くり上がりなし）", detail: "2けたの数に1けたをたす", grade: [2], level: 2, generator: "addition", config: { minA: 10, maxA: 98, minB: 1, maxB: 9, carry: false } },
      { id: "add-two-one-carry", title: "2けた＋1けた（くり上がりあり）", detail: "一の位からくり上がる", grade: [2], level: 2, generator: "addition", config: { minA: 10, maxA: 99, minB: 1, maxB: 9, carry: true } },
      { id: "add-three-two-no-carry", title: "3けた＋2けた（くり上がりなし）", detail: "3けたの数に2けたをたす", grade: [2, 3], level: 3, generator: "addition", config: { minA: 100, maxA: 999, minB: 10, maxB: 99, carry: false } },
      { id: "add-three-two-carry", title: "3けた＋2けた（くり上がりあり）", detail: "くり上がりのある筆算", grade: [2, 3], level: 3, generator: "addition", config: { minA: 100, maxA: 999, minB: 10, maxB: 99, carry: true } },
      { id: "add-four-three-no-carry", title: "4けた＋3けた（くり上がりなし）", detail: "大きな数の筆算", grade: [3, 4], level: 4, generator: "addition", config: { minA: 1000, maxA: 9999, minB: 100, maxB: 999, carry: false } },
      { id: "add-four-three-carry", title: "4けた＋3けた（くり上がりあり）", detail: "何度もくり上がる計算", grade: [3, 4], level: 4, generator: "addition", config: { minA: 1000, maxA: 9999, minB: 100, maxB: 999, carry: true } },
      { id: "add-two-no-carry", title: "2けたのたし算（くり上がりなし）", detail: "2けた＋2けた", grade: [2], level: 2, generator: "addition", config: { minA: 10, maxA: 89, minB: 10, maxB: 89, carry: false } },
      { id: "add-two-carry", title: "2けたのたし算（くり上がりあり）", detail: "一の位・十の位のくり上がり", grade: [2], level: 3, generator: "addition", config: { minA: 10, maxA: 99, minB: 10, maxB: 99, carry: true } },
      { id: "add-three-no-carry", title: "3けたのたし算（くり上がりなし）", detail: "3けた＋3けた", grade: [3], level: 4, generator: "addition", config: { minA: 100, maxA: 499, minB: 100, maxB: 499, carry: false } },
      { id: "add-three-carry", title: "3けたのたし算（くり上がりあり）", detail: "3けた＋3けた", grade: [3], level: 4, generator: "addition", config: { minA: 100, maxA: 999, minB: 100, maxB: 999, carry: true } },
      { id: "add-four", title: "4けたのたし算", detail: "大きな数のたし算", grade: [4], level: 5, generator: "addition", config: { minA: 1000, maxA: 9999, minB: 1000, maxB: 9999 } },
      { id: "add-decimal-tenths", title: "小数のたし算（小数第1位）", detail: "0.1の位までのたし算", grade: [3, 4], level: 3, generator: "decimalAddition", config: { places: 1, minA: 1, maxA: 99, minB: 1, maxB: 99 } },
      { id: "add-decimal-hundredths", title: "小数のたし算（小数第2位）", detail: "0.01の位までのたし算", grade: [4, 5], level: 4, generator: "decimalAddition", config: { places: 2, minA: 1, maxA: 999, minB: 1, maxB: 999 } }
    ]
  },
  subtraction: {
    label: "ひき算",
    description: "数の大きさや、くり下がりの有無を選ぼう。",
    units: [
      { id: "sub-within-20", title: "20までのひき算", detail: "2けた−1けた", grade: [1], level: 1, generator: "subtraction", config: { minA: 10, maxA: 20, minB: 1, maxB: 9 } },
      { id: "sub-two-one-no-borrow", title: "2けた−1けた（くり下がりなし）", detail: "2けたの数から1けたをひく", grade: [1, 2], level: 2, generator: "subtraction", config: { minA: 10, maxA: 99, minB: 1, maxB: 9, borrow: false } },
      { id: "sub-two-one-borrow", title: "2けた−1けた（くり下がりあり）", detail: "一の位からくり下がる", grade: [1, 2], level: 2, generator: "subtraction", config: { minA: 10, maxA: 99, minB: 1, maxB: 9, borrow: true } },
      { id: "sub-three-two-no-borrow", title: "3けた−2けた（くり下がりなし）", detail: "3けたの数から2けたをひく", grade: [2, 3], level: 3, generator: "subtraction", config: { minA: 100, maxA: 999, minB: 10, maxB: 99, borrow: false } },
      { id: "sub-three-two-borrow", title: "3けた−2けた（くり下がりあり）", detail: "くり下がりのある筆算", grade: [2, 3], level: 3, generator: "subtraction", config: { minA: 100, maxA: 999, minB: 10, maxB: 99, borrow: true } },
      { id: "sub-four-three-no-borrow", title: "4けた−3けた（くり下がりなし）", detail: "大きな数の筆算", grade: [3, 4], level: 4, generator: "subtraction", config: { minA: 1000, maxA: 9999, minB: 100, maxB: 999, borrow: false } },
      { id: "sub-four-three-borrow", title: "4けた−3けた（くり下がりあり）", detail: "何度もくり下がる計算", grade: [3, 4], level: 4, generator: "subtraction", config: { minA: 1000, maxA: 9999, minB: 100, maxB: 999, borrow: true } },
      { id: "sub-two-no-borrow", title: "2けたのひき算（くり下がりなし）", detail: "2けた−2けた", grade: [2], level: 2, generator: "subtraction", config: { minA: 10, maxA: 99, minB: 10, maxB: 99, borrow: false } },
      { id: "sub-two-borrow", title: "2けたのひき算（くり下がりあり）", detail: "一の位からくり下がる", grade: [2], level: 3, generator: "subtraction", config: { minA: 20, maxA: 99, minB: 10, maxB: 89, borrow: true } },
      { id: "sub-three-no-borrow", title: "3けたのひき算（くり下がりなし）", detail: "3けた−3けた", grade: [3], level: 4, generator: "subtraction", config: { minA: 100, maxA: 999, minB: 100, maxB: 999, borrow: false } },
      { id: "sub-three-borrow", title: "3けたのひき算（くり下がりあり）", detail: "3けた−3けた", grade: [3], level: 4, generator: "subtraction", config: { minA: 100, maxA: 999, minB: 100, maxB: 999, borrow: true } },
      { id: "sub-four", title: "4けたのひき算", detail: "大きな数のひき算", grade: [4], level: 5, generator: "subtraction", config: { minA: 1000, maxA: 9999, minB: 1000, maxB: 9999 } },
      { id: "sub-decimal-tenths", title: "小数のひき算（小数第1位）", detail: "0.1の位までのひき算", grade: [3, 4], level: 3, generator: "decimalSubtraction", config: { places: 1, minA: 10, maxA: 999, minB: 1, maxB: 99 } },
      { id: "sub-decimal-hundredths", title: "小数のひき算（小数第2位）", detail: "0.01の位までのひき算", grade: [4, 5], level: 4, generator: "decimalSubtraction", config: { places: 2, minA: 100, maxA: 9999, minB: 1, maxB: 999 } }
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
      { id: "mul-four-two", title: "4けた×2けた", detail: "6けたの答えになる筆算", grade: [5, 6], level: 5, generator: "multiplication", config: { minA: 1000, maxA: 9999, minB: 10, maxB: 99 } },
      { id: "mul-decimal-integer", title: "小数×整数", detail: "小数第1位×1けた", grade: [4, 5], level: 4, generator: "decimalMultiplication", config: { placesA: 1, placesB: 0, minA: 1, maxA: 999, minB: 2, maxB: 9 } },
      { id: "mul-decimal-decimal", title: "小数×小数", detail: "小数第1位どうし", grade: [5], level: 5, generator: "decimalMultiplication", config: { placesA: 1, placesB: 1, minA: 1, maxA: 99, minB: 1, maxB: 99 } }
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
      { id: "div-four-two", title: "4けた÷2けた", detail: "2けたでわる筆算・わり切れる計算", grade: [5, 6], level: 5, generator: "division", config: { minDividend: 1000, maxDividend: 9999, minDivisor: 10, maxDivisor: 99 } },
      { id: "div-remainder", title: "あまりのあるわり算", detail: "商とあまりの入力に対応後に公開", grade: [3, 4], level: 4, generator: "future", config: {} },
      { id: "div-decimal-integer", title: "小数÷整数", detail: "わり切れる小数のわり算", grade: [5], level: 4, generator: "decimalDivision", config: { mode: "integer", divisorMin: 2, divisorMax: 9, quotientPlaces: 1, minQuotient: 1, maxQuotient: 99 } },
      { id: "div-decimal-decimal", title: "小数÷小数", detail: "小数第1位どうし・わり切れる計算", grade: [6], level: 5, generator: "decimalDivision", config: { mode: "decimal", divisorMin: 1, divisorMax: 99, quotientPlaces: 1, minQuotient: 1, maxQuotient: 99 } }
    ]
  },
  application: {
    label: "そのほか",
    description: "平均・倍数と約数・割合・速さに挑戦しよう。",
    units: [
      { id: "average-three", title: "3つの数の平均", detail: "3つの数の合計を3でわる", grade: [5], level: 3, generator: "average", config: { minAverage: 10, maxAverage: 100, spread: 12 } },
      { id: "common-multiple", title: "最小公倍数", detail: "2つの数の最小公倍数", grade: [5], level: 4, generator: "commonMultiple", config: { min: 2, max: 30 } },
      { id: "common-divisor", title: "最大公約数", detail: "2つの数の最大公約数", grade: [5], level: 4, generator: "commonDivisor", config: { min: 2, max: 60 } },
            { id: "sum-three", title: "3つの数の合計", detail: "3つの数を合わせた合計", grade: [3], level: 2, generator: "sum", config: { min: 10, max: 100 } },
      { id: "percentage-part", title: "くらべる数をもとめる", detail: "もとにする量×割合", grade: [5], level: 4, generator: "percentage", config: { minBase: 100, maxBase: 1000 } },
      { id: "percentage-rate", title: "割合をもとめる", detail: "くらべる数÷もとにする量", grade: [5], level: 4, generator: "percentageRate", config: { minBase: 100, maxBase: 1000 } },
      { id: "percentage-base", title: "もとにする量をもとめる", detail: "くらべる数÷割合", grade: [5], level: 5, generator: "percentageBase", config: { minBase: 100, maxBase: 1000 } },
      { id: "speed-basic", title: "速さの基本", detail: "道のり÷時間で速さをもとめる", grade: [5], level: 4, generator: "speed", config: { minSpeed: 20, maxSpeed: 120, minTime: 2, maxTime: 10 } }
    ]
  }
};

export const UNIT_BY_ID = Object.values(OPERATIONS)
  .flatMap(operation => operation.units)
  .reduce((map, unit) => {
    map[unit.id] = unit;
    return map;
  }, {});
