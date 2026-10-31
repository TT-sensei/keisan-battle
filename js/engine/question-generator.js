// 四則計算の問題生成エンジン。単元カタログの設定を受け取り共通形式で返す。
const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const carry=(a,b)=>(a%10)+(b%10)>=10;
const borrow=(a,b)=>(a%10)<(b%10);
function addition(c){let a=0,b=0;for(let i=0;i<100;i++){a=rand(c.minA??1,c.maxA??99);b=rand(c.minB??1,c.maxB??99);if(c.carry===true&&!carry(a,b))continue;if(c.carry===false&&carry(a,b))continue;break;}return{a,b,operator:"+",answer:a+b,display:a+" + "+b,explanation:a+" と "+b+" を合わせると "+(a+b)+" です。"};}
function subtraction(c){let a=0,b=0;for(let i=0;i<100;i++){a=rand(c.minA??10,c.maxA??99);b=rand(1,Math.min(c.maxB??a,a));if(c.borrow===true&&!borrow(a,b))continue;if(c.borrow===false&&borrow(a,b))continue;break;}if(a<b)[a,b]=[b,a];return{a,b,operator:"−",answer:a-b,display:a+" − "+b,explanation:a+" から "+b+" をひくと "+(a-b)+" です。"};}
function multiplication(c){const a=rand(c.minA??1,c.maxA??99),b=rand(c.minB??1,c.maxB??9);return{a,b,operator:"×",answer:a*b,display:a+" × "+b,explanation:a+" を "+b+" こ分にすると "+(a*b)+" です。"};}
function division(c){const b=rand(2,c.maxDivisor??9),q=rand(1,c.maxQuotient??9),r=c.remainder?rand(0,b-1):0,a=b*q+r;return{a,b,operator:"÷",answer:q,remainder:r,display:a+" ÷ "+b,explanation:r?a+" ÷ "+b+" は "+q+" あまり "+r+" です。":a+" ÷ "+b+" = "+q+" です。"};}
const generators={addition,subtraction,multiplication,division};
export function generateQuestion(unit){if(!unit||!generators[unit.generator])throw new Error("この単元の問題はまだ準備中です。");return Object.assign(generators[unit.generator](unit.config),{unitId:unit.id,unitTitle:unit.title,createdAt:Date.now()});}