// 単元カタログ。単元定義と問題生成処理を分離して、後から増やしやすくする。
export const OPERATIONS={
addition:{label:"たし算",description:"数の大きさやくり上がりの段階を選ぼう。",units:[
{id:"add-within-20",title:"20までのたし算",detail:"1けた＋1けた",grade:[1],level:1,generator:"addition",config:{minA:1,maxA:9,minB:1,maxB:9,carry:false}},
{id:"add-two-no-carry",title:"2けたのたし算（くり上がりなし）",detail:"2けた＋2けた",grade:[2],level:2,generator:"addition",config:{minA:10,maxA:45,minB:10,maxB:45,carry:false}},
{id:"add-two-carry",title:"2けたのたし算（くり上がりあり）",detail:"一の位からくり上がる",grade:[2],level:3,generator:"addition",config:{minA:10,maxA:89,minB:10,maxB:89,carry:true}},
{id:"add-three",title:"3けた・大きな数のたし算",detail:"位をそろえて計算",grade:[3,4],level:4,generator:"addition",config:{minA:100,maxA:999,minB:100,maxB:999}},
{id:"add-decimal",title:"小数のたし算",detail:"今後追加予定",grade:[4,5],level:5,generator:"future",config:{}}]},
subtraction:{label:"ひき算",description:"くり下がりや数の大きさを選ぼう。",units:[
{id:"sub-within-20",title:"20までのひき算",detail:"2けた−1けた",grade:[1],level:1,generator:"subtraction",config:{minA:10,maxA:20,maxB:9,borrow:false}},
{id:"sub-two-no-borrow",title:"2けたのひき算（くり下がりなし）",detail:"2けた−2けた",grade:[2],level:2,generator:"subtraction",config:{minA:10,maxA:99,maxB:99,borrow:false}},
{id:"sub-two-borrow",title:"2けたのひき算（くり下がりあり）",detail:"一の位からくり下がる",grade:[2],level:3,generator:"subtraction",config:{minA:20,maxA:99,maxB:89,borrow:true}},
{id:"sub-three",title:"3けた・大きな数のひき算",detail:"位をそろえて計算",grade:[3,4],level:4,generator:"subtraction",config:{minA:100,maxA:999,maxB:999}},
{id:"sub-decimal",title:"小数のひき算",detail:"今後追加予定",grade:[4,5],level:5,generator:"future",config:{}}]},
multiplication:{label:"かけ算",description:"九九から大きな数のかけ算へ進もう。",units:[
{id:"mul-table",title:"九九",detail:"1けた×1けた",grade:[2],level:1,generator:"multiplication",config:{minA:1,maxA:9,minB:1,maxB:9}},
{id:"mul-two-one",title:"2けた×1けた",detail:"くり上がりのある計算も",grade:[3],level:2,generator:"multiplication",config:{minA:10,maxA:99,minB:2,maxB:9}},
{id:"mul-two-two",title:"2けた×2けた",detail:"筆算で計算する大きさ",grade:[4],level:3,generator:"multiplication",config:{minA:10,maxA:99,minB:10,maxB:99}},
{id:"mul-three-one",title:"3けた×1けた",detail:"位ごとの計算",grade:[4],level:4,generator:"multiplication",config:{minA:100,maxA:999,minB:2,maxB:9}},
{id:"mul-decimal",title:"小数のかけ算",detail:"今後追加予定",grade:[5,6],level:5,generator:"future",config:{}}]},
division:{label:"わり算",description:"わり切れる計算やあまりのある計算に挑戦。",units:[
{id:"div-table",title:"九九を使うわり算",detail:"わり切れる・九九の逆算",grade:[3],level:1,generator:"division",config:{maxDivisor:9,maxQuotient:9,remainder:false}},
{id:"div-remainder",title:"あまりのあるわり算（準備中）",detail:"商とあまりの入力に対応後に公開",grade:[3],level:2,generator:"future",config:{}},
{id:"div-two-one",title:"2けた÷1けた",detail:"商を考えて計算",grade:[4],level:3,generator:"division",config:{maxDivisor:9,maxQuotient:99,remainder:false}},
{id:"div-three-one",title:"3けた÷1けた",detail:"大きな数のわり算",grade:[4],level:4,generator:"division",config:{maxDivisor:9,maxQuotient:999,remainder:false}},
{id:"div-decimal",title:"小数のわり算",detail:"今後追加予定",grade:[5,6],level:5,generator:"future",config:{}}]}};
export const UNIT_BY_ID=Object.values(OPERATIONS).flatMap(x=>x.units).reduce((m,u)=>(m[u.id]=u,m),{});