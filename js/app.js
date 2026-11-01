import{OPERATIONS,UNIT_BY_ID}from"./data/units.js";import{generateQuestion}from"./engine/question-generator.js";import{Battle}from"./game/battle.js";
const $=id=>document.getElementById(id),state={op:"addition",unit:"add-within-20",char:"riku",battle:null,answer:"",sound:true,mode:"battle",training:null};
const chars={riku:["リク","🥷"],sora:["ソラ","🛡️"],kai:["カイ","🪄"],saku:["サク","🌿"],tsuki:["ツキ","🏹"],nami:["ナミ","⚔️"]},enemies=[["ぷにスライム","🟢"],["もくもくゴブリン","👺"],["いわころモンスター","🪨"],["まよいキノコ","🍄"]];
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
}
function persist(){localStorage.setItem("keisanBattleSave",JSON.stringify(save));$("xp").textContent=save.xp;$("wins").textContent=save.wins;renderHomeStats();}
function renderUnits(){const group=OPERATIONS[state.op];$("unit-title").textContent=group.label+"の単元";$("unit-desc").textContent=group.description;$("unit-count").textContent=group.units.length+" UNITS";$("units").innerHTML="";group.units.forEach(u=>{const b=document.createElement("button");b.className="unit"+(u.id===state.unit?" selected":"");b.disabled=u.generator==="future";b.innerHTML="<b>"+u.title+"</b><small>"+u.detail+" · "+u.grade.map(g=>"小"+g).join("・")+"</small>";b.onclick=()=>{state.unit=u.id;renderUnits();};$("units").append(b);});$("summary").textContent=UNIT_BY_ID[state.unit].title;}
document.querySelectorAll(".op").forEach(b=>b.onclick=()=>{state.op=b.dataset.op;state.unit=OPERATIONS[state.op].units.find(u=>u.generator!=="future").id;document.querySelectorAll(".op").forEach(x=>x.classList.toggle("active",x===b));renderUnits();});
document.querySelectorAll(".char").forEach(b=>b.onclick=()=>{state.char=b.dataset.char;document.querySelectorAll(".char").forEach(x=>x.classList.toggle("selected",x===b));});
function screen(id){["home","battle","result"].forEach(x=>$(x).classList.toggle("hidden",x!==id));window.scrollTo({top:0,behavior:"smooth"});}
function feedback(text){$("feedback").textContent=text;}
function render(event){
const b=event.battle;
$("round").textContent="正解 "+b.correct+" / "+b.maxRounds;
$("php").style.width=b.playerHp+"%";
$("ehp").style.width=b.enemyHp+"%";
$("phptext").textContent="HP "+b.playerHp+" / 100";
$("ehptext").textContent="HP "+b.enemyHp+" / 100";
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
function finish(r){
save.xp+=r.xp;if(r.win)save.wins++;
r.mistakes.forEach(m=>{
const existing=save.mistakes.find(x=>x.unitId===m.unitId&&x.display===m.display);
if(existing){existing.count=(existing.count||1)+1;existing.at=Date.now();}
else save.mistakes.push({...m,at:Date.now(),count:1});
});
save.sessions.push({mode:"battle",unitId:r.unitId,correct:r.correct,answered:r.answered,accuracy:r.accuracy,duration:r.duration,at:Date.now()});
persist();state.mode="battle";document.body.classList.remove("training-mode");$("resulticon").textContent=r.win?"🏆":"💪";$("resulttitle").textContent=r.win?"クエストクリア！":"もう少し！";$("resultmessage").textContent=r.win?"ナビアンに勝利！計算の力がアップしたね。":"最後までよく挑戦したね。特訓して再挑戦しよう！";$("correct").textContent=r.correct+"/"+r.answered;$("accuracy").textContent=r.accuracy+"%";$("earned").textContent="+"+r.xp;$("bestcombo").textContent=r.bestCombo;$("mistakes").classList.toggle("hidden",!r.mistakes.length);$("mistakelist").innerHTML="";r.mistakes.forEach(m=>{const s=document.createElement("span");s.textContent=m.display+" = "+m.answer;$("mistakelist").append(s);});screen("result");}
function start(){state.mode="battle";state.training=null;document.body.classList.remove("training-mode");$("arena").classList.remove("hidden");$("enemy-clock").classList.remove("hidden");$("toolbar-note").textContent="CPU BATTLE";$("stage").textContent="STAGE 01";const unit=UNIT_BY_ID[state.unit],c=chars[state.char];enemy=enemies[Math.floor(Math.random()*enemies.length)];$("player-emoji").textContent=c[1];$("player-name").textContent=c[0];$("enemy-emoji").textContent=enemy[1];$("enemy-name").textContent=enemy[0];$("stage").textContent="STAGE "+String(unit.level).padStart(2,"0");feedback("バトルスタート！");state.answer="";state.battle=new Battle({unit,onUpdate:render,onFinish:finish,onFeedback:f=>feedback(f.text)});screen("battle");state.battle.start();}
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
function recordTrainingMistake(q){
const existing=save.mistakes.find(m=>m.unitId===q.unitId&&m.display===q.display);
if(existing){existing.count=(existing.count||1)+1;existing.at=Date.now();}
else save.mistakes.push({display:q.display,answer:q.answer,unitId:q.unitId,unitTitle:q.unitTitle,at:Date.now(),count:1});
}
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
 if(state.answer.length<8&&/^\\d$/.test(k)){state.answer+=k;$("answer").textContent=state.answer;}
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
save.sessions=Array.isArray(save.sessions)?save.sessions:[];save.mastery=save.mastery&&typeof save.mastery==="object"?save.mastery:{};save.mistakes=Array.isArray(save.mistakes)?save.mistakes:[];persist();renderUnits();