import{OPERATIONS,UNIT_BY_ID}from"./data/units.js";import{generateQuestion}from"./engine/question-generator.js";import{Battle}from"./game/battle.js";
import{CHARACTERS,HERO_IMAGE,BACKGROUNDS,MONSTER_LIST,poseImg,GROUP_SCENES}from"./data/monsters.js";
const $=id=>document.getElementById(id),state={op:"addition",unit:"add-within-20",char:"riku",battle:null,answer:"",answer2:"",activeField:1,mode:"battle",training:null,currentEnemy:null};
const DIFF_LABELS={easy:"やさしい",normal:"ふつう",hard:"つよい"};
let settings={count:10,difficulty:"normal",sound:true};
try{const s=JSON.parse(localStorage.getItem("keisanBattleSettings")||"{}");if([5,10,15,20].includes(s.count))settings.count=s.count;if(DIFF_LABELS[s.difficulty])settings.difficulty=s.difficulty;if(typeof s.sound==="boolean")settings.sound=s.sound;}catch(e){}
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
function unitCleared(id){return (save.sessions||[]).some(x=>x.mode==="battle"&&x.unitId===id&&x.win);}
// その教科のはしごで、まだクリアしていない最初の単元をおすすめにする
function recommendedUnitId(opKey){
const units=OPERATIONS[opKey].units.filter(u=>u.generator!=="future");
for(const u of units){if(!unitCleared(u.id))return u.id;}
return null;
}
// 効果音（Web Audioでその場で鳴らす。自前の音源ファイルは使わない）
let audioCtx=null;
function tone(freq,dur,delay,type,vol){
const t0=audioCtx.currentTime+(delay||0);
const o=audioCtx.createOscillator(),g=audioCtx.createGain();
o.type=type||"sine";o.frequency.value=freq;
g.gain.setValueAtTime(vol||0.12,t0);
g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
o.connect(g);g.connect(audioCtx.destination);
o.start(t0);o.stop(t0+dur+0.02);
}
function playSound(kind){
if(!settings.sound)return;
try{
if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
if(audioCtx.state==="suspended")audioCtx.resume();
if(kind==="correct"){tone(660,0.09,0);tone(880,0.13,0.07);}
else if(kind==="wrong"){tone(170,0.16,0,"sawtooth",0.06);}
else if(kind==="hit"){tone(120,0.14,0,"square",0.1);}
else if(kind==="special"){tone(523,0.08,0);tone(659,0.08,0.06);tone(784,0.08,0.12);tone(1047,0.16,0.18);}
else if(kind==="win"){tone(523,0.1,0);tone(659,0.1,0.09);tone(784,0.1,0.18);tone(1047,0.22,0.27);}
else if(kind==="lose"){tone(392,0.12,0);tone(330,0.12,0.11);tone(262,0.2,0.22);}
}catch(e){}
}
function updateSoundToggle(){$("sound-toggle").textContent=settings.sound?"🔊 音 ON":"🔇 音 OFF";}
function spawnDamage(target,amount){
const layer=$("fx-layer");if(!layer)return;
const el=document.createElement("span");
el.className="dmg-pop "+(target==="enemy"?"dmg-enemy":"dmg-player");
el.textContent="-"+amount;
el.style.left=(target==="enemy"?60+Math.random()*16:10+Math.random()*12)+"%";
el.style.top=(26+Math.random()*14)+"%";
layer.append(el);setTimeout(()=>el.remove(),950);
}
// 答え入力欄（あまりのあるわり算では商とあまりの2欄になる）
function isRemainder(q){return !!(q&&q.answerFormat==="remainder");}
function setActiveField(n){state.activeField=n;$("answer").classList.toggle("active",n===1);$("answer2").classList.toggle("active",n===2);}
function setupAnswerFields(q){
state.answer="";state.answer2="";
$("answer").textContent="?";$("answer2").textContent="?";
const rem=isRemainder(q);
$("remainder-part").classList.toggle("hidden",!rem);
$("quotient-label").classList.toggle("hidden",!rem);
setActiveField(1);
}
function fieldValue(){return state.activeField===2?state.answer2:state.answer;}
function setFieldValue(v){if(state.activeField===2){state.answer2=v;$("answer2").textContent=v||"?";}else{state.answer=v;$("answer").textContent=v||"?";}}
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
function renderUnits(){const group=OPERATIONS[state.op];$("unit-title").textContent=group.label+"の単元";$("unit-desc").textContent=group.description;$("unit-count").textContent=group.units.length+" UNITS";$("units").innerHTML="";const recId=recommendedUnitId(state.op);group.units.forEach(u=>{const b=document.createElement("button");const records=save.sessions.filter(x=>x.mode==="battle"&&x.unitId===u.id);const answered=records.reduce((n,x)=>n+(x.answered||0),0);const correct=records.reduce((n,x)=>n+(x.correct||0),0);const rate=answered?Math.round(correct/answered*100):0;const cleared=records.some(x=>x.win);b.className="unit"+(u.id===state.unit?" selected":"")+(u.id===recId?" recommended":"");b.disabled=u.generator==="future";b.innerHTML="<b>"+(u.id===recId?"⭐ つぎはこれ！ ":"")+u.title+"</b><small>"+u.detail+" · "+u.grade.map(g=>"小"+g).join("・")+"</small><small class=\"unit-record\">"+(records.length?("挑戦 "+records.length+"回 · 正答率 "+rate+"%"+(cleared?" · ✓ クリア":"")):"まだ挑戦していないよ")+"</small>";b.onclick=()=>{state.unit=u.id;renderUnits();};$("units").append(b);});updateSummary();}
document.querySelectorAll(".op").forEach(b=>b.onclick=()=>{state.op=b.dataset.op;state.unit=OPERATIONS[state.op].units.find(u=>u.generator!=="future").id;document.querySelectorAll(".op").forEach(x=>x.classList.toggle("active",x===b));renderUnits();});
document.querySelectorAll(".char").forEach(b=>b.onclick=()=>{state.char=b.dataset.char;document.querySelectorAll(".char").forEach(x=>x.classList.toggle("selected",x===b));});
document.querySelectorAll(".count-btn").forEach(b=>{b.classList.toggle("selected",Number(b.dataset.count)===settings.count);b.onclick=()=>{settings.count=Number(b.dataset.count);saveSettings();document.querySelectorAll(".count-btn").forEach(x=>x.classList.toggle("selected",x===b));updateSummary();};});
document.querySelectorAll(".diff-btn").forEach(b=>{b.classList.toggle("selected",b.dataset.diff===settings.difficulty);b.onclick=()=>{settings.difficulty=b.dataset.diff;saveSettings();document.querySelectorAll(".diff-btn").forEach(x=>x.classList.toggle("selected",x===b));updateSummary();};});
function screen(id){["home","battle","result","dex"].forEach(x=>$(x).classList.toggle("hidden",x!==id));if(id!=="battle")$("vs-splash").classList.add("hidden");window.scrollTo({top:0,behavior:"smooth"});}
let poseTimer=null;
function showPose(kind,ms){
const c=CHARACTERS[state.char];if(!c)return;
const img=$("player-img");
const src=poseImg(state.char,kind);if(!src)return;
img.src=src;
if(poseTimer)clearTimeout(poseTimer);
poseTimer=setTimeout(()=>{img.src=CHARACTERS[state.char].img;},ms||700);
}
function showVsSplash(){
$("vs-player").src=CHARACTERS[state.char].img;
$("vs-enemy").src=state.currentEnemy?state.currentEnemy.img:"";
$("vs-enemy-name").textContent=state.currentEnemy?state.currentEnemy.name:"";
const vsBg=GROUP_SCENES.action[Math.floor(Math.random()*GROUP_SCENES.action.length)];
$("vs-splash").style.backgroundImage="linear-gradient(rgba(24,38,54,.42),rgba(24,38,54,.62)),url("+vsBg+")";
$("vs-splash").classList.remove("hidden");
playSound("special");
const b=state.battle;
setTimeout(()=>{$("vs-splash").classList.add("hidden");if(b)b.start();},1250);
}
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
  setupAnswerFields(b.question);
  return;
}
if(event.type==="correct"||event.type==="special"){
  playSound(event.type==="special"?"special":"correct");
  showPose(event.type==="special"?"special":"attack",event.type==="special"?900:650);
  if(event.damage)spawnDamage("enemy",event.damage);
  const pi=$("player-img"),ei=$("enemy-img");
  pi.classList.remove("attacking-r");void pi.offsetWidth;pi.classList.add("attacking-r");
  ei.classList.remove("damaged");void ei.offsetWidth;ei.classList.add("damaged");
  setTimeout(()=>{pi.classList.remove("attacking-r");ei.classList.remove("damaged");},420);
  $("enemy").classList.remove("hit");void $("enemy").offsetWidth;$("enemy").classList.add("hit");
  setTimeout(()=>$("enemy").classList.remove("hit"),350);
}
if(event.type==="cpu"){
  playSound("hit");
  showPose("damage",650);
  if(event.damage)spawnDamage("player",event.damage);
  const pi2=$("player-img"),ei2=$("enemy-img");
  ei2.classList.remove("attacking-l");void ei2.offsetWidth;ei2.classList.add("attacking-l");
  pi2.classList.remove("damaged");void pi2.offsetWidth;pi2.classList.add("damaged");
  setTimeout(()=>{ei2.classList.remove("attacking-l");pi2.classList.remove("damaged");},420);
  $("player").classList.remove("hit");void $("player").offsetWidth;$("player").classList.add("hit");
  setTimeout(()=>$("player").classList.remove("hit"),350);
}
if(event.type==="wrong"){
  playSound("wrong");
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
persist();state.mode="battle";document.body.classList.remove("training-mode");$("resulticon").textContent=r.win?"🏆":"💪";$("resulttitle").textContent=r.win?"クエストクリア！":"もう少し！";$("resultmessage").textContent=r.win?(state.currentEnemy?("「"+state.currentEnemy.name+"」に勝利！ 図鑑に登録したよ（"+(save.dex[state.currentEnemy.id]||1)+"回目）。"):"ナビアンに勝利！計算の力がアップしたね。"):"最後までよく挑戦したね。特訓して再挑戦しよう！";$("correct").textContent=r.correct+"/"+r.answered;$("accuracy").textContent=r.accuracy+"%";$("earned").textContent="+"+r.xp;$("bestcombo").textContent=r.bestCombo;$("mistakes").classList.toggle("hidden",!r.mistakes.length);$("mistakelist").innerHTML="";r.mistakes.forEach(m=>{const s=document.createElement("span");s.textContent=m.display+" = "+(m.answerText||m.answer);$("mistakelist").append(s);});
const nextBtn=$("next-unit");
if(r.win){
const opKey=Object.keys(OPERATIONS).find(k=>OPERATIONS[k].units.some(u=>u.id===r.unitId));
const units=opKey?OPERATIONS[opKey].units.filter(u=>u.generator!=="future"):[];
const idx=units.findIndex(u=>u.id===r.unitId);
const next=idx>=0?units[idx+1]:null;
if(next){nextBtn.textContent="つぎの単元「"+next.title+"」へ →";nextBtn.classList.remove("hidden");nextBtn.onclick=()=>{state.op=opKey;state.unit=next.id;document.querySelectorAll(".op").forEach(x=>x.classList.toggle("active",x.dataset.op===opKey));renderUnits();screen("home");};}
else nextBtn.classList.add("hidden");
}else nextBtn.classList.add("hidden");
const rb=$("result-banner");rb.src=r.win?GROUP_SCENES.win[Math.floor(Math.random()*GROUP_SCENES.win.length)]:GROUP_SCENES.rest;rb.classList.remove("hidden");
if(state.currentEnemy){
$("result-visual").classList.remove("hidden");
$("result-player").src=r.win?poseImg(state.char,"special"):CHARACTERS[state.char].img;
const reImg=$("result-enemy");reImg.src=state.currentEnemy.img;reImg.classList.toggle("result-defeated",r.win);
}else $("result-visual").classList.add("hidden");
playSound(r.win?"win":"lose");
if(r.win){$("enemy-img").classList.add("defeated");setTimeout(()=>screen("result"),950);}
else screen("result");}
function start(){state.mode="battle";state.training=null;$("retry").textContent="もう一度挑戦 ↻";document.body.classList.remove("training-mode");$("arena").classList.remove("hidden");$("enemy-clock").classList.remove("hidden");$("toolbar-note").textContent="CPU BATTLE";$("stage").textContent="STAGE 01";const unit=UNIT_BY_ID[state.unit];enemy=pickEnemy(unit.level);state.currentEnemy=enemy;$("enemy-img").classList.remove("defeated");$("player-img").src=CHARACTERS[state.char].img;["attack","damage","special"].forEach(k=>{const pre=new Image();pre.src=poseImg(state.char,k);});$("player-name").textContent=CHARACTERS[state.char].name;$("enemy-img").src=enemy.img;$("enemy-name").textContent=enemy.name;$("enemy-kind").textContent=enemy.set==="boss"?"ボスナビアン":enemy.set==="evo"?"進化ナビアン":"ナビアン";const bg=BACKGROUNDS[Math.floor(Math.random()*BACKGROUNDS.length)];$("arena").style.backgroundImage="url("+bg.img+")";$("stage").textContent="STAGE "+String(unit.level).padStart(2,"0");feedback("バトルスタート！");state.answer="";state.battle=new Battle({unit,onUpdate:render,onFinish:finish,onFeedback:f=>feedback(f.text),options:{maxRounds:settings.count,difficulty:settings.difficulty,trait:state.char,enemyMaxHp:enemy.hp}});screen("battle");showVsSplash();}
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
t.current=q;t.currentUnitId=unitId;setupAnswerFields(q);
$("qnum").textContent="TRAINING "+String(t.solved+1).padStart(2,"0");
$("question").textContent=q.display+" = ?";
$("round").textContent="正解 "+t.solved+" / "+t.maxQuestions;
$("progressbar").style.width=(t.solved/t.maxQuestions*100)+"%";
clearCanvas();
}
function recordTrainingMistake(q){storeMistake(q);}
function submitTraining(){
const t=state.training;if(!t||!t.current||!state.answer)return;
if(isRemainder(t.current)&&state.answer2===""){setActiveField(2);feedback("あまりも入力してね");return;}
t.answered++;
const ok=isRemainder(t.current)
?(Number(state.answer)===t.current.answer&&Number(state.answer2)===t.current.remainder)
:(Number(state.answer)===t.current.answer);
if(ok){
playSound("correct");
t.solved++;const id=t.currentUnitId;
save.mastery[id]=(save.mastery[id]||0)+1;
if(save.mastery[id]>=3){save.mistakes=save.mistakes.filter(m=>m.unitId!==id);delete save.mastery[id];feedback("すばらしい！ "+UNIT_BY_ID[id].title+" を克服したよ！");}
else feedback("正解！ あと"+(3-save.mastery[id])+"回正解でこの単元を克服！");
state.answer="";state.answer2="";$("answer").textContent="✓";$("answer2").textContent="✓";persist();
if(t.solved>=t.maxQuestions){finishTraining();return;}
setTimeout(()=>{if(state.mode==="training")nextTrainingQuestion();},350);
}else{
playSound("wrong");
save.mastery[t.currentUnitId]=0;recordTrainingMistake(t.current);feedback("もう一度！ 問題はそのまま。ゆっくり考えよう。");
$("answer").textContent="もう一度";$("answer2").textContent="?";state.answer="";state.answer2="";setActiveField(1);persist();
$("question-card").classList.remove("retry-shake");void $("question-card").offsetWidth;$("question-card").classList.add("retry-shake");
}
}
function finishTraining(){
const t=state.training;if(!t)return;
const accuracy=t.answered?Math.round(t.solved/t.answered*100):0;
const xp=t.solved*2;save.xp+=xp;
save.sessions.push({mode:"training",unitId:"mixed-training",correct:t.solved,answered:t.answered,accuracy,duration:Math.round((Date.now()-t.startedAt)/1000),at:Date.now()});
persist();$("resulticon").textContent="✦";$("result-visual").classList.add("hidden");const rb2=$("result-banner");rb2.src=GROUP_SCENES.rest;rb2.classList.remove("hidden");$("resulttitle").textContent="特訓終了！";
$("resultmessage").textContent="最後までよく取り組んだね。正解を重ねて、苦手を少しずつ減らそう。";
$("correct").textContent=t.solved+"/"+t.maxQuestions;$("accuracy").textContent=accuracy+"%";$("earned").textContent="+"+xp;$("bestcombo").textContent="—";
$("mistakes").classList.toggle("hidden",!save.mistakes.length);$("mistakelist").innerHTML="";
save.mistakes.slice(0,12).forEach(m=>{const s=document.createElement("span");s.textContent=m.unitTitle+" · "+m.display;$("mistakelist").append(s);});
$("mistakes").querySelector("b").textContent="練習中の単元";
$("retry").textContent="もう一度特訓 ↻";state.mode="training";document.body.classList.remove("training-mode");screen("result");
}
function key(k){
const active = state.mode==="training" ? !!(state.training&&state.training.current) : !!(state.battle&&!state.battle.finished);
if(!active)return;
if(k==="clear"){setFieldValue("");return;}
if(k==="."){
  if(state.activeField===2)return;
  const v=fieldValue();if(v.includes("."))return;
  setFieldValue(v===""?"0.":v+".");return;
}
if(k==="enter"){
  if(state.mode==="training"){submitTraining();return;}
  if(state.answer==="")return;
  const q=state.battle.question;
  if(isRemainder(q)&&state.answer2===""){setActiveField(2);feedback("あまりも入力してね");return;}
  const submitted=state.answer,submitted2=state.answer2;
  const result=state.battle.submit(submitted,submitted2);
  if(result.accepted){
    if(result.correct){$("answer").textContent=submitted+" ✓";if(isRemainder(q))$("answer2").textContent=submitted2+" ✓";}
    else{state.answer="";state.answer2="";$("answer").textContent="もう一度";$("answer2").textContent="?";setActiveField(1);}
  }
  return;
}
if(/^\d$/.test(k)){const v=fieldValue();if(v.length<8)setFieldValue(v+k);}
}
$("answer").onclick=()=>setActiveField(1);
$("answer2").onclick=()=>setActiveField(2);
$("sound-toggle").onclick=()=>{settings.sound=!settings.sound;saveSettings();updateSoundToggle();if(settings.sound)playSound("correct");};
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
updateSoundToggle();
// トップ画面の飾り: ヒーローにファンタジー背景、モンスターの帯、図鑑ボタンのサムネイル
const heroBg=BACKGROUNDS[Math.floor(Math.random()*BACKGROUNDS.length)];
$("hero").style.backgroundImage="linear-gradient(rgba(255,255,255,.52),rgba(255,255,255,.78)),url("+heroBg.img+")";
const strip=$("monster-strip");
[...MONSTER_LIST].sort(()=>Math.random()-0.5).slice(0,10).forEach(m=>{const i=document.createElement("img");i.src=m.img;i.alt=m.name;i.title=m.name;i.loading="lazy";strip.append(i);});
$("dex-thumb").src=MONSTER_LIST[Math.floor(Math.random()*MONSTER_LIST.length)].img;
$("dex-banner").src=GROUP_SCENES.standby;
$("home-banner-img").src=GROUP_SCENES.ending;
document.querySelectorAll(".char").forEach(b=>{const img=b.querySelector(".char-img");if(img)img.src=CHARACTERS[b.dataset.char].img;});
save.sessions=Array.isArray(save.sessions)?save.sessions:[];save.mastery=save.mastery&&typeof save.mastery==="object"?save.mastery:{};save.mistakes=Array.isArray(save.mistakes)?save.mistakes:[];save.dex=save.dex&&typeof save.dex==="object"?save.dex:{};persist();renderUnits();