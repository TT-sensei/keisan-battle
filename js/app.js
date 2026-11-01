import{OPERATIONS,UNIT_BY_ID}from"./data/units.js";import{generateQuestion}from"./engine/question-generator.js";import{Battle}from"./game/battle.js";
import{CHARACTERS,HERO_IMAGE,BACKGROUNDS,MONSTER_LIST}from"./data/monsters.js";
const $=id=>document.getElementById(id),state={op:"addition",unit:"add-within-20",char:"riku",battle:null,answer:"",sound:true,mode:"battle",training:null,currentEnemy:null};
const DIFF_LABELS={easy:"やさしい",normal:"ふつう",hard:"つよい"};
let settings={count:10,difficulty:"normal"};
try{const s=JSON.parse(localStorage.getItem("keisanBattleSettings")||"{}");if([5,10,15,20].includes(s.count))settings.count=s.count;if(DIFF_LABELS[s.difficulty])settings.difficulty=s.difficulty;}catch(e){}
function saveSettings(){localStorage.setItem("keisanBattleSettings",JSON.stringify(settings));}
// 敵ナビアンは単元レベルでプールを変え、その中からランダムに選ぶ
function pickEnemy(level){
let pool,hp;
if(level<=2){pool=MONSTER_LIST.filter(m=>m.set==="zako");hp=100;}
else if(level===3){pool=MONSTER_LIST.filter(m=>m.set!=="boss");hp=120;}
else if(level===4){pool=MONSTER_LIST.filter(m=>m.set==="evo");hp=120;}
else{pool=MONSTER_LIST.filter(m=>m.set!=="zako");hp=150;}
const m=pool[Math.floor(Math.random()*pool.length)];
return Object.assign({},m,{hp});
}
function updateSummary(){$("summary").textContent=UNIT_BY_ID[state.unit].title+" ・ "+settings.count+"問 ・ "+DIFF_LABELS[settings.difficulty];}
let save=JSON.parse(localStorage.getItem("keisanBattleSave")||'{"xp":0,"wins":0,"mistakes":[]}' ),enemy;
function renderHomeStats(){
const pending=[...new Set(save.mistakes.map(m=>m.unitId))].filter(id=>UNIT_BY_ID[id]);
$("training-count").textContent=pending.length?pending.length+"単元・"+save.mistakes.length+"問が練習待ち":"まちがえた問題はまだないよ";
$("training-open").disabled=!pending.length;
const sessions=save.sessions||[];
const totalCorrect=sessions.reduce((n,s)=>n+(s.correct||0),0);
const totalAnswered=sessions.reduce((n,s)=>n+(s.answered||0),0);
const accuracy=totalAnswered?Math.round(totalCorrect/totalAnswered*100):0;
$("record-summary").textContent=sessions.length
? "記録 "+sessions.length+"回　／　正解 "+totalCorrect+"問　／　正答率 "+accuracy+"%"
:"まだ記録はありません。まずはバトルに挑戦しよう！";
const dex=save.dex||{};const registered=Object.keys(dex).length;
$("dex-count").textContent=registered?("登録 "+registered+" / "+MONSTER_LIST.length+" 体"):"たおしたナビアンが登録されるよ";
}
function persist(){localStorage.setItem("keisanBattleSave",JSON.stringify(save));$("xp").textContent=save.xp;$("wins").textContent=save.wins;renderHomeStats();}
function renderUnits(){const group=OPERATIONS[state.op];$("unit-title").textContent=group.label+"の単元";$("unit-desc").textContent=group.description;$("unit-count").textContent=group.units.length+" UNITS";$("units").innerHTML="";group.units.forEach(u=>{const b=document.createElement("button");const records=save.sessions.filter(x=>x.mode==="battle"&&x.unitId===u.id);const answered=records.reduce((n,x)=>n+(x.answered||0),0);const correct=records.reduce((n,x)=>n+(x.correct||0),0);const rate=answered?Math.round(correct/answered*100):0;const cleared=records.some(x=>x.win);b.className="unit"+(u.id===state.unit?" selected":"");b.disabled=u.generator==="future";b.innerHTML="<b>"+u.title+"</b><small>"+u.detail+" · "+u.grade.map(g=>"小"+g).join("・")+"</small><small class=\"unit-record\">"+(records.length?("挑戦 "+records.length+"回 · 正答率 "+rate+"%"+(cleared?" · ✓ クリア":"")):"まだ挑戦していないよ")+"</small>";b.onclick=()=>{state.unit=u.id;renderUnits();};$("units").append(b);});updateSummary();}
document.querySelectorAll(".op").forEach(b=>b.onclick=()=>{state.op=b.dataset.op;state.unit=OPERATIONS[state.op].units.find(u=>u.generator!=="future").id;document.querySelectorAll(".op").forEach(x=>x.classList.toggle("active",x===b));renderUnits();});
document.querySelectorAll(".char").forEach(b=>b.onclick=()=>{state.char=b.dataset.char;document.querySelectorAll(".char").forEach(x=>x.classList.toggle("selected",x===b));});
document.querySelectorAll(".count-btn").forEach(b=>{b.classList.toggle("selected",Number(b.dataset.count)===settings.count);b.onclick=()=>{settings.count=Number(b.dataset.count);saveSettings();document.querySelectorAll(".count-btn").forEach(x=>x.classList.toggle("selected",x===b));updateSummary();};});
document.querySelectorAll(".diff-btn").forEach(b=>{b.classList.toggle("selected",b.dataset.diff===settings.difficulty);b.onclick=()=>{settings.difficulty=b.dataset.diff;saveSettings();document.querySelectorAll(".diff-btn").forEach(x=>x.classList.toggle("selected",x===b));updateSummary();};});
function screen(id){["home","battle","result","dex"].forEach(x=>$(x).classList.toggle("hidden",x!==id));window.scrollTo({top:0,behavior:"smooth"});}
function feedback(text){$("feedback").textContent=text;}
function render(event){
const b=event.battle;
$("round").textContent="正解 "+b.correct+" / "+b.maxRounds;
$("php").style.width=(b.playerHp/b.playerMaxHp*100)+"%";
$("ehp").style.width=(b.enemyHp/b.enemyMaxHp*100)+"%";
$("phptext").textContent="HP "+b.playerHp+" / "+b.playerMaxHp;
$("ehptext").textContent="HP "+b.enemyHp+" / "+b.enemyMaxHp;
$("combo").textContent="🔥 COMBO "+b.combo;
$("progressbar").style.width=(b.correct/b.maxRounds*100)+"%";
$("enemy-attack-bar").style.width=b.attackProgress+"%";
$("enemy-attack-time").textContent="あと "+b.attackRemaining+" 秒";
$("enemy-clock").classList.toggle("urgent",b.attackRemaining<=4);
$("specialbar").style.width=b.special+"%";
$("specialtext").textContent=b.special>=100?"必殺技ゲージ MAX！":"あと"+Math.ceil((100-b.special)/25)+"回正解で必殺技！";
$("special-use").disabled=b.special<100||state.battle.finished;
if(event.type==="question-needed"){
  const q=generateQuestion(UNIT_BY_ID[state.unit]);
  state.battle.setQuestion(q);
  return;
}
if(event.type==="question"){
  $("qnum").textContent="QUESTION "+String(b.correct+1).padStart(2,"0");
  $("question").textContent=b.question.display+" = ?";
  state.answer="";
  $("answer").textContent="?";
  return;
}
if(event.type==="correct"||event.type==="special"){
  $("enemy").classList.remove("hit");void $("enemy").offsetWidth;$("enemy").classList.add("hit");
  setTimeout(()=>$("enemy").classList.remove("hit"),350);
}
if(event.type==="cpu"){
  $("player").classList.remove("hit");void $("player").offsetWidth;$("player").classList.add("hit");
  setTimeout(()=>$("player").classList.remove("hit"),350);
}
if(event.type==="wrong"){
  const latest=b.mistakes[b.mistakes.length-1];if(latest){storeMistake(latest);persist();}
  $("question-card").classList.remove("retry-shake");void $("question-card").offsetWidth;$("question-card").classList.add("retry-shake");
  setTimeout(()=>$("question-card").classList.remove("retry-shake"),250);
}
}
const canvas=$("work-canvas"),ctx=canvas.getContext("2d");
let drawing=false,drawEnabled=false,lastPoint=null;
function resizeCanvas(){
  const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,window.devicePixelRatio||1);
  if(!rect.width||!rect.height)return;
  const old=document.createElement("canvas");
  old.width=canvas.width;old.height=canvas.height;
  if(old.width&&old.height)old.getContext("2d").drawImage(canvas,0,0);
  canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#315f8d";ctx.lineWidth=3.2;
  if(old.width&&old.height)ctx.drawImage(old,0,0,old.width,old.height,0,0,rect.width,rect.height);
}
function clearCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height);}
function setDrawEnabled(enabled){
  drawEnabled=enabled;
  canvas.classList.toggle("drawing",enabled);
  $("draw-toggle").classList.toggle("active",enabled);
  $("draw-toggle").setAttribute("aria-pressed",String(enabled));
  $("draw-toggle").textContent=enabled?"✍ 手書き ON":"✍ 手書き OFF";
}
function pointFromEvent(e){
  const r=canvas.getBoundingClientRect();
  return {x:e.clientX-r.left,y:e.clientY-r.top};
}
canvas.addEventListener("pointerdown",e=>{
  if(!drawEnabled||!state.battle||state.battle.finished)return;
  e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;lastPoint=pointFromEvent(e);
  ctx.beginPath();ctx.arc(lastPoint.x,lastPoint.y,1.5,0,Math.PI*2);ctx.fillStyle="#315f8d";ctx.fill();
});
canvas.addEventListener("pointermove",e=>{
  if(!drawing||!drawEnabled)return;
  e.preventDefault();const p=pointFromEvent(e);
  ctx.beginPath();ctx.moveTo(lastPoint.x,lastPoint.y);ctx.lineTo(p.x,p.y);ctx.stroke();lastPoint=p;
});
function stopDrawing(){drawing=false;lastPoint=null;}
canvas.addEventListener("pointerup",stopDrawing);
canvas.addEventListener("pointercancel",stopDrawing);
canvas.addEventListener("lostpointercapture",stopDrawing);
$("draw-toggle").onclick=()=>setDrawEnabled(!drawEnabled);
$("draw-clear").onclick=clearCanvas;
window.addEventListener("resize",resizeCanvas);
if("ResizeObserver"in window)new ResizeObserver(resizeCanvas).observe(canvas);
requestAnimationFrame(resizeCanvas);
function storeMistake(m){
save.mastery[m.unitId]=0;
const existing=save.mistakes.find(x=>x.unitId===m.unitId&&x.display===m.display);
if(existing){existing.count=(existing.count||1)+1;existing.at=Date.now();}
else save.mistakes.push({...m,at:Date.now(),count:1});
}
function finish(r){
if(r.win&&state.currentEnemy){const id=state.currentEnemy.id;save.dex[id]=(save.dex[id]||0)+1;}
save.xp+=r.xp;if(r.win)save.wins++;
save.sessions.push({mode:"battle",unitId:r.unitId,win:r.win,correct:r.correct,answered:r.answered,accuracy:r.accuracy,duration:r.duration,at:Date.now()});
persist();state.mode="battle";document.body.classList.remove("training-mode");$("resulticon").textContent=r.win?"🏆":"💪";$("resulttitle").textContent=r.win?"クエストクリア！":"もう少し！";$("resultmessage").textContent=r.win?(state.currentEnemy?("「"+state.currentEnemy.name+"」に勝利！ 図鑑に登録したよ（"+(save.dex[state.currentEnemy.id]||1)+"回目）。"):"ナビアンに勝利！計算の力がアップしたね。"):"最後までよく挑戦したね。特訓して再挑戦しよう！";$("correct").textContent=r.correct+"/"+r.answered;$("accuracy").textContent=r.accuracy+"%";$("earned").textContent="+"+r.xp;$("bestcombo").textContent=r.bestCombo;$("mistakes").classList.toggle("hidden",!r.mistakes.length);$("mistakelist").innerHTML="";r.mistakes.forEach(m=>{const s=document.createElement("span");s.textContent=m.display+" = "+m.answer;$("mistakelist").append(s);});screen("result");}
function start(){state.mode="battle";state.training=null;$("retry").textContent="もう一度挑戦 ↻";document.body.classList.remove("training-mode");$("arena").classList.remove("hidden");$("enemy-clock").classList.remove("hidden");$("toolbar-note").textContent="CPU BATTLE";$("stage").textContent="STAGE 01";const unit=UNIT_BY_ID[state.unit];enemy=pickEnemy(unit.level);state.currentEnemy=enemy;$("player-img").src=CHARACTERS[state.char].img;$("player-name").textContent=CHARACTERS[state.char].name;$("enemy-img").src=enemy.img;$("enemy-name").textContent=enemy.name;$("enemy-kind").textContent=enemy.set==="boss"?"ボスナビアン":enemy.set==="evo"?"進化ナビアン":"ナビアン";const bg=BACKGROUNDS[Math.floor(Math.random()*BACKGROUNDS.length)];$("arena").style.backgroundImage="url("+bg.img+")";$("stage").textContent="STAGE "+String(unit.level).padStart(2,"0");feedback("バトルスタート！");state.answer="";state.battle=new Battle({unit,onUpdate:render,onFinish:finish,onFeedback:f=>feedback(f.text),options:{maxRounds:settings.count,difficulty:settings.difficulty,trait:state.char,enemyMaxHp:enemy.hp}});screen("battle");state.battle.start();}
function startTraining(targetIds){
const ids=(targetIds||[...new Set(save.mistakes.map(m=>m.unitId))]).filter(id=>UNIT_BY_ID[id]&&UNIT_BY_ID[id].generator!=="future");
if(!ids.length)return;
state.mode="training";state.battle=null;state.training={targetUnitIds:ids,solved:0,answered:0,maxQuestions:10,current:null,currentUnitId:null,startedAt:Date.now()};
document.body.classList.add("training-mode");
$("stage").textContent="特訓モード";$("toolbar-note").textContent="TIME FREE";
$("back").textContent="← クエスト選択";
$("enemy-clock").classList.add("hidden");
$("arena").classList.add("hidden");
$("round").textContent="正解 0 / 10";$("combo").textContent="✦ 特訓中";$("progressbar").style.width="0%";
setDrawEnabled(false);clearCanvas();feedback("特訓スタート！ あせらず考えよう。");
screen("battle");nextTrainingQuestion();
}
function nextTrainingQuestion(){
const t=state.training;if(!t)return;
const unitId=t.targetUnitIds[Math.floor(Math.random()*t.targetUnitIds.length)];
const q=generateQuestion(UNIT_BY_ID[unitId]);
t.current=q;t.currentUnitId=unitId;state.answer="";
$("qnum").textContent="TRAINING "+String(t.solved+1).padStart(2,"0");
$("question").textContent=q.display+" = ?";
$("answer").textContent="?";$("round").textContent="正解 "+t.solved+" / "+t.maxQuestions;
$("progressbar").style.width=(t.solved/t.maxQuestions*100)+"%";
clearCanvas();
}
function recordTrainingMistake(q){storeMistake(q);}
function submitTraining(){
const t=state.training;if(!t||!t.current||!state.answer)return;
t.answered++;
if(Number(state.answer)===t.current.answer){
t.solved++;const id=t.currentUnitId;
save.mastery[id]=(save.mastery[id]||0)+1;
if(save.mastery[id]>=3){save.mistakes=save.mistakes.filter(m=>m.unitId!==id);delete save.mastery[id];feedback("すばらしい！ "+UNIT_BY_ID[id].title+" を克服したよ！");}
else feedback("正解！ あと"+(3-save.mastery[id])+"回正解でこの単元を克服！");
state.answer="";$("answer").textContent="✓";persist();
if(t.solved>=t.maxQuestions){finishTraining();return;}
setTimeout(()=>{if(state.mode==="training")nextTrainingQuestion();},350);
}else{
save.mastery[t.currentUnitId]=0;recordTrainingMistake(t.current);feedback("もう一度！ 問題はそのまま。ゆっくり考えよう。");
$("answer").textContent="もう一度";state.answer="";persist();
$("question-card").classList.remove("retry-shake");void $("question-card").offsetWidth;$("question-card").classList.add("retry-shake");
}
}
function finishTraining(){
const t=state.training;if(!t)return;
const accuracy=t.answered?Math.round(t.solved/t.answered*100):0;
const xp=t.solved*2;save.xp+=xp;
save.sessions.push({mode:"training",unitId:"mixed-training",correct:t.solved,answered:t.answered,accuracy,duration:Math.round((Date.now()-t.startedAt)/1000),at:Date.now()});
persist();$("resulticon").textContent="✦";$("resulttitle").textContent="特訓終了！";
$("resultmessage").textContent="最後までよく取り組んだね。正解を重ねて、苦手を少しずつ減らそう。";
$("correct").textContent=t.solved+"/"+t.maxQuestions;$("accuracy").textContent=accuracy+"%";$("earned").textContent="+"+xp;$("bestcombo").textContent="—";
$("mistakes").classList.toggle("hidden",!save.mistakes.length);$("mistakelist").innerHTML="";
save.mistakes.slice(0,12).forEach(m=>{const s=document.createElement("span");s.textContent=m.unitTitle+" · "+m.display;$("mistakelist").append(s);});
$("mistakes").querySelector("b").textContent="練習中の単元";
$("retry").textContent="もう一度特訓 ↻";state.mode="training";document.body.classList.remove("training-mode");screen("result");
}
function key(k){
if(state.mode==="training"){
 if(k==="clear"){state.answer="";$("answer").textContent="?";return;}
 if(k==="."){if(state.answer.includes("."))return;if(state.answer==="")state.answer="0";state.answer+=".";$("answer").textContent=state.answer;return;}
 if(k==="enter"){submitTraining();return;}
 if(state.answer.length<8&&/^\d$/.test(k)){state.answer+=k;$("answer").textContent=state.answer;}
 return;
}
if(!state.battle||state.battle.finished)return;
if(k==="clear"){state.answer="";$("answer").textContent="?";return;}
if(k==="."){
  if(state.answer.includes("."))return;
  if(state.answer==="")state.answer="0";
  state.answer+=".";
  $("answer").textContent=state.answer;
  return;
}
if(k==="enter"){
  if(state.answer==="")return;
  const submitted=state.answer;
  const result=state.battle.submit(submitted);
  if(result.accepted){
    if(result.correct){$("answer").textContent=submitted+" ✓";}
    else{state.answer="";$("answer").textContent="もう一度";}
  }
  return;
}
if(state.answer.length<8 && /^\d$/.test(k)){state.answer+=k;$("answer").textContent=state.answer;}
}
$("keypad").onclick=e=>{const b=e.target.closest("button[data-key]");if(b)key(b.dataset.key);};window.addEventListener("keydown",e=>{if($("battle").classList.contains("hidden"))return;if(/^\d$/.test(e.key))key(e.key);else if(e.key==="Backspace")key("clear");else if(e.key===".")key(".");else if(e.key==="Enter")key("enter");});
$("start").onclick=start;$("training-open").onclick=()=>startTraining();$("retry").onclick=()=>state.mode==="training"?startTraining(state.training?.targetUnitIds):start();$("back").onclick=()=>{if(state.battle)state.battle.stop();state.mode="battle";state.training=null;document.body.classList.remove("training-mode");$("arena").classList.remove("hidden");$("enemy-clock").classList.remove("hidden");screen("home");};$("result-home").onclick=()=>{state.mode="battle";state.training=null;document.body.classList.remove("training-mode");$("arena").classList.remove("hidden");$("enemy-clock").classList.remove("hidden");$("retry").textContent="もう一度挑戦 ↻";$("mistakes").querySelector("b").textContent="もう一度練習したい問題";screen("home");};$("special-use").onclick=()=>{if(state.battle)state.battle.activateSpecial();};
let dexFilter="all";
function renderDex(){
const dex=save.dex||{};const registered=Object.keys(dex).length;const totalKills=Object.values(dex).reduce((a,b)=>a+b,0);
$("dex-progress").textContent="登録 "+registered+" / "+MONSTER_LIST.length+" 体 ・ たおした回数 合計 "+totalKills+" 回";
const grid=$("dex-grid");grid.innerHTML="";
MONSTER_LIST.filter(m=>dexFilter==="all"||m.set===dexFilter).forEach(m=>{
const n=dex[m.id]||0;const d=document.createElement("div");d.className="dex-cell"+(n?"":" unknown");
d.innerHTML="<img loading=\"lazy\" src=\""+m.img+"\" alt=\"\"><b>"+(n?m.name:"？？？")+"</b><small>"+(m.set==="boss"?"ボス":m.set==="evo"?"進化":"通常")+"・グループ"+m.group+(n?(" ・ "+n+"回たおした"):"")+"</small>";
grid.append(d);});
}
$("dex-open").onclick=()=>{renderDex();screen("dex");};
$("dex-back").onclick=()=>screen("home");
document.querySelectorAll("#dex-tabs button").forEach(b=>b.onclick=()=>{dexFilter=b.dataset.dex;document.querySelectorAll("#dex-tabs button").forEach(x=>x.classList.toggle("selected",x===b));renderDex();});
$("hero-img").src=HERO_IMAGE;
document.querySelectorAll(".char").forEach(b=>{const img=b.querySelector(".char-img");if(img)img.src=CHARACTERS[b.dataset.char].img;});
save.sessions=Array.isArray(save.sessions)?save.sessions:[];save.mastery=save.mastery&&typeof save.mastery==="object"?save.mastery:{};save.mistakes=Array.isArray(save.mistakes)?save.mistakes:[];save.dex=save.dex&&typeof save.dex==="object"?save.dex:{};persist();renderUnits();