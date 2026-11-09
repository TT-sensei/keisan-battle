# 計算バトル × 算数の学びのマップ 対応表

更新日：2026-11-09  
対象：`TT-sensei/keisan-battle` の `main` にある68単元  
基準：`TT-sensei/jp-learning-taxonomy` の `data/math-learning-map.json` と `data/topics.json`  
方針：学びのマップ側は変更しない。計算バトル側の単元・学年・出題範囲だけを見直す。

## 判定の読み方

- 「対応」：マップ項目の計算技能を直接練習できる。
- 「関連対応」：関連する考え方・計算関係を使うが、マップ項目全体を練習するものではない。
- 「部分対応」：一部の技能に対応する。表現・活用・意味理解などは別途必要。
- 「技能対応・活用は一部」：計算手順は練習できるが、文脈に応じた判断や説明までは扱わない。
- 「拡張演習」：マップの代表的な桁数・範囲を超えて、発展・反復練習として実装している。

※ `grade` はアプリで表示・分類する学年情報。単元の問題生成範囲と学習指導要領上の初出学年を照らし、無理に複数学年へ広げない。継続学年での復習利用と、新しく学ぶ学年は区別する。

## 68単元の対応表

### たし算

| 単元ID | 計算バトルの単元 | 現在の学年 | 学びのマップ対応先 | 判定・補足 |
|---|---|---:|---|---|
| `add-within-20` | 20までのたし算 | 小1 | 1位数どうしを中心とした加法（jp.elem.math.addition-within-20） | 対応 |
| `add-missing-number` | □の数をもとめる | 小1・2 | 加法の意味（jp.elem.math.addition-meaning）<br>式の表現と等号（jp.elem.math.number-sentences）<br>□を使った式で数量の関係を表す（jp.elem.math.unknown-number-box-expression） | 関連対応。20までの加法場面での未知数。マップの□式・等号の項目と関連するが、マップの□式項目の初出学年（小2）と本単元の数の範囲（20まで）は完全一致ではない。 |
| `add-two-one-no-carry` | 2けた＋1けた（くり上がりなし） | 小2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-two-one-carry` | 2けた＋1けた（くり上がりあり） | 小2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-two-no-carry` | 2けたのたし算（くり上がりなし） | 小2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-two-carry` | 2けたのたし算（くり上がりあり） | 小2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-three-two-no-carry` | 3けた＋2けた（くり上がりなし） | 小2・3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-three-two-carry` | 3けた＋2けた（くり上がりあり） | 小2・3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-three-no-carry` | 3けたのたし算（くり上がりなし） | 小3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-three-carry` | 3けたのたし算（くり上がりあり） | 小3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-four-three-no-carry` | 4けた＋3けた（くり上がりなし） | 小3・4 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-four-three-carry` | 4けた＋3けた（くり上がりあり） | 小3・4 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `add-four` | 4けたのたし算 | 小4 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |

### ひき算

| 単元ID | 計算バトルの単元 | 現在の学年 | 学びのマップ対応先 | 判定・補足 |
|---|---|---:|---|---|
| `sub-within-20` | 20までのひき算 | 小1 | 1位数どうしを中心とした減法（jp.elem.math.subtraction-within-20） | 対応 |
| `sub-missing-number` | □の数をもとめる | 小1・2 | 減法の意味（jp.elem.math.subtraction-meaning）<br>式の表現と等号（jp.elem.math.number-sentences）<br>□を使った式で数量の関係を表す（jp.elem.math.unknown-number-box-expression） | 関連対応。20までの減法場面での未知数。加法・減法の意味や式の表現と関連する。 |
| `sub-two-one-no-borrow` | 2けた−1けた（くり下がりなし） | 小1・2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-two-one-borrow` | 2けた−1けた（くり下がりあり） | 小1・2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-two-no-borrow` | 2けたのひき算（くり下がりなし） | 小2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-two-borrow` | 2けたのひき算（くり下がりあり） | 小2 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-three-two-no-borrow` | 3けた−2けた（くり下がりなし） | 小2・3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-three-two-borrow` | 3けた−2けた（くり下がりあり） | 小2・3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-three-no-borrow` | 3けたのひき算（くり下がりなし） | 小3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-three-borrow` | 3けたのひき算（くり下がりあり） | 小3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-four-three-no-borrow` | 4けた−3けた（くり下がりなし） | 小3・4 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-four-three-borrow` | 4けた−3けた（くり下がりあり） | 小3・4 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |
| `sub-four` | 4けたのひき算 | 小4 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 対応 |

### かけ算

| 単元ID | 計算バトルの単元 | 現在の学年 | 学びのマップ対応先 | 判定・補足 |
|---|---|---:|---|---|
| `mul-table` | 九九 | 小2 | 乗法九九（jp.elem.math.multiplication-tables）<br>乗法の意味（jp.elem.math.multiplication-meaning） | 対応 |
| `mul-missing-factor` | □の数をもとめる | 小2・3 | 乗法九九（jp.elem.math.multiplication-tables）<br>□を使った式から未知数を求める（jp.elem.math.unknown-number-solve） | 関連対応。九九の逆算として対応。未知数を求める練習であり、単純な九九の再生とは区別。 |
| `mul-two-one` | 2けた×1けた | 小3 | 2・3位数×1位数（jp.elem.math.multidigit-multiply-one-digit） | 対応 |
| `mul-three-one` | 3けた×1けた | 小3・4 | 2・3位数×1位数（jp.elem.math.multidigit-multiply-one-digit） | 対応 |
| `mul-two-two` | 2けた×2けた | 小4 | 2・3位数×2位数（jp.elem.math.multidigit-multiply-two-digit） | 対応 |
| `mul-three-two` | 3けた×2けた | 小4・5 | 2・3位数×2位数（jp.elem.math.multidigit-multiply-two-digit） | 対応 |
| `mul-four-one` | 4けた×1けた | 小4・5 | 2・3位数×1位数（jp.elem.math.multidigit-multiply-one-digit） | 技能対応・活用は一部。4けた×1けたは、マップの2・3位数×1位数を超える拡張演習。 |
| `mul-four-two` | 4けた×2けた | 小5・6 | 2・3位数×2位数（jp.elem.math.multidigit-multiply-two-digit） | 技能対応・活用は一部。4けた×2けたは、マップの2・3位数×2位数を超える拡張演習。 |
| `mul-decimal-integer` | 小数×整数 | 小4・5 | 小数の位取りと大小（jp.elem.math.decimal-place-value） | 部分対応。小数×整数は小4段階。マップの小5『小数の乗法・除法』（乗数が小数）とは別段階の内容で、直接対応する項目はマップに独立していない。 |
| `mul-decimal-decimal` | 小数×小数 | 小5 | 小数の乗法・除法（jp.elem.math.decimal-multiply-divide） | 対応 |

### わり算

| 単元ID | 計算バトルの単元 | 現在の学年 | 学びのマップ対応先 | 判定・補足 |
|---|---|---:|---|---|
| `div-table` | 九九を使うわり算 | 小3 | 除法の意味（jp.elem.math.division-meaning）<br>乗法九九（jp.elem.math.multiplication-tables） | 対応 |
| `div-missing-divisor` | □の数をもとめる | 小3 | 除法の意味（jp.elem.math.division-meaning）<br>□を使った式から未知数を求める（jp.elem.math.unknown-number-solve） | 関連対応。九九を用いた逆算として対応。除法の意味・乗法との関係を使う。 |
| `div-two-one` | 2けた÷1けた | 小4 | わり算の筆算（jp.elem.math.division-algorithm） | 対応 |
| `div-three-one` | 3けた÷1けた | 小4 | わり算の筆算（jp.elem.math.division-algorithm） | 対応 |
| `div-remainder` | あまりのあるわり算 | 小3・4 | あまりのある除法（jp.elem.math.division-remainders） | 技能対応・活用は一部。商・あまりを数値で答える練習には対応。場面に応じてあまりをどう扱うか判断する学習までは含まない。 |
| `div-four-one` | 4けた÷1けた | 小4・5 | わり算の筆算（jp.elem.math.division-algorithm） | 技能対応・活用は一部。4けた÷1けたは、マップのわり算筆算の代表範囲（2・3位数）を超える拡張演習。 |
| `div-four-two` | 4けた÷2けた | 小5・6 | わり算の筆算（jp.elem.math.division-algorithm） | 技能対応・活用は一部。4けた÷2けたは、マップのわり算筆算の代表範囲を超える拡張演習。 |
| `div-decimal-integer` | 小数÷整数 | 小5 | 小数の位取りと大小（jp.elem.math.decimal-place-value） | 部分対応。小数÷整数は小4段階。マップの小5『小数の乗法・除法』（除数が小数）とは別段階の内容で、直接対応する項目はマップに独立していない。 |
| `div-decimal-decimal` | 小数÷小数 | 小5 | 小数の乗法・除法（jp.elem.math.decimal-multiply-divide） | 対応 |

### 小数

| 単元ID | 計算バトルの単元 | 現在の学年 | 学びのマップ対応先 | 判定・補足 |
|---|---|---:|---|---|
| `add-decimal-tenths` | 小数のたし算（小数第1位） | 小3・4 | 小数の意味（十分の一の位）（jp.elem.math.decimals-tenths）<br>小数の加法・減法（jp.elem.math.decimal-add-subtract） | 対応 |
| `sub-decimal-tenths` | 小数のひき算（小数第1位） | 小3・4 | 小数の意味（十分の一の位）（jp.elem.math.decimals-tenths）<br>小数の加法・減法（jp.elem.math.decimal-add-subtract） | 対応 |
| `add-decimal-hundredths` | 小数のたし算（小数第2位） | 小4・5 | 小数の位取りと大小（jp.elem.math.decimal-place-value）<br>小数の加法・減法（jp.elem.math.decimal-add-subtract） | 対応 |
| `sub-decimal-hundredths` | 小数のひき算（小数第2位） | 小4・5 | 小数の位取りと大小（jp.elem.math.decimal-place-value）<br>小数の加法・減法（jp.elem.math.decimal-add-subtract） | 対応 |
| `mul-decimal-integer` | 小数×整数 | 小4・5 | 小数の位取りと大小（jp.elem.math.decimal-place-value） | 部分対応。小数×整数は小4段階。マップの小5『小数の乗法・除法』（乗数が小数）とは別段階の内容で、直接対応する項目はマップに独立していない。 |
| `div-decimal-integer` | 小数÷整数 | 小5 | 小数の位取りと大小（jp.elem.math.decimal-place-value） | 部分対応。小数÷整数は小4段階。マップの小5『小数の乗法・除法』（除数が小数）とは別段階の内容で、直接対応する項目はマップに独立していない。 |
| `mul-decimal-decimal` | 小数×小数 | 小5 | 小数の乗法・除法（jp.elem.math.decimal-multiply-divide） | 対応 |
| `div-decimal-decimal` | 小数÷小数 | 小5 | 小数の乗法・除法（jp.elem.math.decimal-multiply-divide） | 対応 |

### 分数

| 単元ID | 計算バトルの単元 | 現在の学年 | 学びのマップ対応先 | 判定・補足 |
|---|---|---:|---|---|
| `frac-same-add` | 分数のたし算（同じ分母） | 小4・5 | 同分母分数の加法・減法（jp.elem.math.fractions-same-denominator） | 対応 |
| `frac-same-sub` | 分数のひき算（同じ分母） | 小5 | 同分母分数の加法・減法（jp.elem.math.fractions-same-denominator） | 対応 |
| `frac-diff-add` | 分数のたし算（通分） | 小5 | 異分母分数の加法・減法（jp.elem.math.fractions-unlike-denominators） | 対応 |
| `frac-diff-sub` | 分数のひき算（通分） | 小5 | 異分母分数の加法・減法（jp.elem.math.fractions-unlike-denominators） | 対応 |
| `frac-mul-int` | 分数×整数 | 小5 | 分数の乗法・除法（jp.elem.math.fraction-multiply-divide） | 対応。小6の分数の乗法・除法の一部。マップの該当項目に対応。 |
| `frac-div-int` | 分数÷整数 | 小5 | 分数の乗法・除法（jp.elem.math.fraction-multiply-divide） | 対応。小6の分数の乗法・除法の一部。マップの該当項目に対応。 |
| `frac-mul` | 分数×分数 | 小6 | 分数の乗法・除法（jp.elem.math.fraction-multiply-divide） | 対応 |
| `frac-div` | 分数÷分数 | 小6 | 分数の乗法・除法（jp.elem.math.fraction-multiply-divide） | 対応 |

### 応用

| 単元ID | 計算バトルの単元 | 現在の学年 | 学びのマップ対応先 | 判定・補足 |
|---|---|---:|---|---|
| `sum-three` | 3つの数の合計 | 小3 | 2～4桁の加法・減法（jp.elem.math.multidigit-add-subtract） | 部分対応。3数の合計を計算する演習。文脈に応じて複数の計算を選ぶ問題解決までは扱わない。 |
| `average-three` | 3つの数の平均 | 小5 | 平均（jp.elem.math.average） | 技能対応・活用は一部。3数の平均を計算する技能に対応。データを集めて代表値を比較・解釈する活動までは扱わない。 |
| `common-multiple` | 最小公倍数 | 小5 | 倍数・約数（jp.elem.math.factors-multiples） | 対応 |
| `common-divisor` | 最大公約数 | 小5 | 倍数・約数（jp.elem.math.factors-multiples） | 対応 |
| `percentage-part` | くらべる数をもとめる | 小5 | 割合と百分率（jp.elem.math.percentage） | 技能対応・活用は一部。もとにする量と割合から比べる量を求める数値演習。百分率・小数・歩合の相互変換や文脈判断は限定的。 |
| `percentage-rate` | 割合をもとめる | 小5 | 割合と百分率（jp.elem.math.percentage） | 技能対応・活用は一部。比べる量ともとにする量から割合を求める数値演習。百分率・小数の相互変換や文脈判断は限定的。 |
| `speed-basic` | 速さ・道のり・時間 | 小5 | 速さ・道のり・時間（jp.elem.math.speed）<br>単位量当たりの大きさ（jp.elem.math.unit-quantity） | 技能対応・活用は一部。速さ・道のり・時間の計算は対応。単位量当たりの大きさを使った比較、単位の変換、生活場面の判断は含まない。 |
| `proportion-table` | 比例の表 | 小6 | 簡単な場合の比例の関係（jp.elem.math.meaning-of-proportion） | 部分対応。小5の簡単な比例に対応する出題。ただし現在の問題文は表を実際に表示せず、x=1のときの値から比例計算をする形式。単元名『比例の表』と実際の表示が一致していない。 |
| `algebra-x` | 文字と式（xをもとめる） | 小6 | 文字を用いた式（jp.elem.math.letter-expressions）<br>□を使った式から未知数を求める（jp.elem.math.unknown-number-solve） | 部分対応。文字式と未知数を求める内容にまたがる。現在の出題はxを含む等式から逆算する形式で、文字に数を代入して式の値を求める学習とは異なる。 |
| `percentage-base` | もとにする量をもとめる | 小5 | 割合と百分率（jp.elem.math.percentage） | 技能対応・活用は一部。比べる量と割合からもとにする量を求める数値演習。割合の意味を図や場面で捉える問題は別途必要。 |
| `ratio-simple` | 比を簡単にする | 小6 | 比の表し方・比の値・等しい比（jp.elem.math.ratio） | 技能対応・活用は一部。比を簡単にする技能に対応。比の値、等しい比、比を使った分配・問題解決までは網羅しない。 |

## マップとのずれ・不足

### 1. 既存単元の範囲がマップの内容より狭いもの

- あまりのあるわり算：商とあまりの数値回答はできるが、場面に合わせてあまりを切り上げる・切り捨てるなどの判断はしない。
- 平均：3数の平均計算に限られ、測定値やデータの平均を比較・解釈する活動はない。
- 割合：比べる量・割合・もとにする量の計算はあるが、百分率と小数の変換、場面・図を使った意味理解、判断は限定的。
- 速さ：速さ・道のり・時間の公式計算はあるが、単位量当たりの比較、単位換算、複数条件の問題解決はない。
- 比：比を簡単にする問題だけで、比の値、等しい比、比を使った分配・活用はない。
- 比例：現状の出題は簡単な比例計算。マップの「表や式で変化・対応を考察する」学び全体は扱わない。

### 2. マップにあるが、計算バトルでは扱っていない主な内容

計算バトルは計算技能の演習教材なので、次の項目は「未実装＝不備」とは扱わない。ただし、マップ全体との対応を示すときは未対応として区別する。

- 数のしくみ：数の合成・分解、位取り、数の大小・順序、数直線、小数・分数の意味と相互関係。
- 計算の意味・性質：たし算・ひき算・かけ算・わり算の意味、交換法則・結合法則・分配法則、計算方法の工夫。
- 見積もり：概数、四捨五入、計算前の見積もりと答えの妥当性確認。
- 分数の基礎：分数の意味、単位分数、大小比較、等しい分数、数直線での表現。
- 数量関係：単位量当たりの大きさの比較、割合の意味と表現、比の値・等しい比、比例・反比例の表やグラフ。
- 問題解決：複数の計算を組み合わせる文章題、目的に応じた計算方法の選択、図・表・式による説明。
- データ活用・図形・測定：平均の解釈、表やグラフ、場合の数、図形、面積・体積、単位換算など。

### 3. 問題表示と単元名のずれ

- `proportion-table` は単元名に「表」とあるが、現行の問題文は表を表示せず「x=1のときy=…」から値を求める形式。名称か出題形式のどちらかを改める必要がある。
- `algebra-x` は「文字と式」としているが、現行の問題は文字式に値を代入するのではなく、等式からxを逆算する形式。マップの「文字を用いた式」と「□を使った式から未知数を求める」の境界を明確にする必要がある。

## 学年設定の修正方針

次の変更は、問題の数の範囲とマップの学年整理が明確に合うものとして、確認用ブランチで反映する。

| 単元ID | 変更前 | 変更後 | 理由 |
|---|---:|---:|---|
| `sub-two-one-no-borrow` | 小1・2 | 小2 | 10〜99の2けた−1けた。小1の「20まで」の範囲を超える。 |
| `sub-two-one-borrow` | 小1・2 | 小2 | 同上。 |
| `add-four` | 小4 | 小3 | 4けたの加法。マップの2〜4桁の加法・減法は小3で4桁へ広がる。 |
| `sub-four` | 小4 | 小3 | 4けたの減法。上と同じ。 |
| `mul-three-two` | 小4・5 | 小4 | 3けた×2けたはマップの2・3位数×2位数に対応。 |
| `mul-decimal-integer` | 小4・5 | 小4 | 小数×整数は小4段階。小5の小数×小数とは区別。 |
| `div-decimal-integer` | 小5 | 小4 | 小数÷整数は小4段階。小5の小数÷小数とは区別。 |
| `frac-same-add` | 小4・5 | 小4 | 同分母分数の加法はマップで小4。 |
| `frac-same-sub` | 小5 | 小4 | 同分母分数の減法はマップで小4。 |
| `frac-mul-int` | 小5 | 小6 | 分数×整数は小6の分数の乗法・除法に位置づく。 |
| `frac-div-int` | 小5 | 小6 | 分数÷整数は小6の分数の乗法・除法に位置づく。 |
| `div-remainder` | 小3・4 | 小3 | 現行の小さな数の商・あまりの計算は小3の「あまりのある除法」に対応。 |

※ 4けた÷1けた、4けた÷2けた、4けた×1けた、4けた×2けたなど、マップの代表的な範囲を超える単元は、発展演習として残す。学年情報は別途再確認する。

## 次の改善候補

1. 比例の出題を実際の表を使う形式にするか、単元名を「簡単な比例の関係」に合わせる。
2. 比の値・等しい比・比を使った分配の演習を追加する。
3. 割合の小数・百分率の変換と、場面から3量のどれを求めるか判断する問題を追加する。
4. 速さで単位量当たりの比較と単位換算を扱う。
5. 計算の見積もり・計算のきまり・計算方法の選択を、演習モードとして追加するか検討する。

## 参照先

- [算数の学びの見取り図](https://github.com/TT-sensei/jp-learning-taxonomy/blob/main/data/math-learning-map.json)
- [学習項目データ](https://github.com/TT-sensei/jp-learning-taxonomy/blob/main/data/topics.json)
- [文部科学省「小学校学習指導要領（平成29年告示）解説 算数編」](https://www.mext.go.jp/content/20211102-mxt_kyoiku02-100002607_04.pdf)

学びのマップのリポジトリ・データ・画面は、この対応確認では変更しない。
