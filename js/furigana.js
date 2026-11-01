// ふりがな辞書: 読みが固定できる言葉だけを収録する（文脈で読みが変わる漢字は入れない）
const FURIGANA = {
  "四則計算":"しそくけいさん","最大公約数":"さいだいこうやくすう","最小公倍数":"さいしょうこうばいすう",
  "連続正解":"れんぞくせいかい","必殺技":"ひっさつわざ","入力欄":"にゅうりょくらん","小数第":"しょうすうだい",
  "一の位":"いちのくらい","十の位":"じゅうのくらい","仲間たち":"なかまたち","回復型":"かいふくがた",
  "くり上がり":"くりあがり","くり上がる":"くりあがる","くり下がり":"くりさがり","くり下がる":"くりさがる",
  "立ち向かえ":"たちむかえ","変わらない":"かわらない","練習待ち":"れんしゅうまち","練習中":"れんしゅうちゅう",
  "特訓":"とっくん","図鑑":"ずかん","登録":"とうろく","記録":"きろく","苦手":"にがて","克服":"こくふく",
  "練習":"れんしゅう","挑戦":"ちょうせん","再挑戦":"さいちょうせん","冒険":"ぼうけん","出発":"しゅっぱつ",
  "仲間":"なかま","成長":"せいちょう","勝利":"しょうり","難易度":"なんいど","設定":"せってい","保存":"ほぞん",
  "画面":"がめん","背景":"はいけい","効果音":"こうかおん","音源":"おんげん","準備中":"じゅんびちゅう",
  "対応":"たいおう","教科":"きょうか","学年":"がくねん","小数":"しょうすう","整数":"せいすう","割合":"わりあい",
  "平均":"へいきん","速さ":"はやさ","倍数":"ばいすう","約数":"やくすう","最大":"さいだい","最小":"さいしょう",
  "合計":"ごうけい","範囲":"はんい","条件":"じょうけん","入力":"にゅうりょく","途中":"とちゅう","透明":"とうめい",
  "手書き":"てがき","獲得":"かくとく","最初":"さいしょ","最後":"さいご","今回":"こんかい","選択":"せんたく",
  "開始":"かいし","時間":"じかん","何秒":"なんびょう","何度":"なんど","回数":"かいすう","回目":"かいめ",
  "回答":"かいとう","間隔":"かんかく","周期":"しゅうき","有無":"うむ","内容":"ないよう","基本":"きほん",
  "通常":"つうじょう","応用":"おうよう","九九":"くく","管理":"かんり","公開":"こうかい","生成":"せいせい",
  "独立":"どくりつ","進行":"しんこう","進化":"しんか","確認":"かくにん","追加":"ついか","道のり":"みちのり",
  "計算":"けいさん","たし算":"たしざん","ひき算":"ひきざん","かけ算":"かけざん","わり算":"わりざん",
  "逆算":"ぎゃくさん","筆算":"ひっさん","単元":"たんげん","問題":"もんだい","正解":"せいかい","正答率":"せいとうりつ",
  "正確":"せいかく","正しく":"ただしく","答え":"こたえ","攻撃":"こうげき","発動":"はつどう","回復":"かいふく",
  "特性":"とくせい","一度":"いちど","両方":"りょうほう","組んだ":"くんだ","考える":"かんがえる","考えよう":"かんがえよう",
  "考えて":"かんがえて","答える":"こたえる","答えよう":"こたえよう","続ける":"つづける","選ぶ":"えらぶ","選ぼう":"えらぼう",
  "進もう":"すすもう","学ぶ":"まなぶ","解く":"とく","起きる":"おきる","鳴らす":"ならす","消す":"けす",
  "変える":"かえる","変えない":"かえない","変わる":"かわる","調べ":"しらべ","合わせ":"あわせ","合う":"あう",
  "使う":"つかう","使って":"つかって","使わない":"つかわない","作れ":"つくれ","取り":"とり","付く":"つく",
  "切れる":"きれる","減らそう":"へらそう","少し":"すこし","大きな":"おおきな","大きさ":"おおきさ","遅く":"おそく",
  "速く":"はやく","強く":"つよく","強さ":"つよさ","軽く":"かるく","書ける":"かける","戦う":"たたかう",
  "受ける":"うける","打てる":"うてる","数字":"すうじ","敵":"てき","商":"しょう","欄":"らん","量":"りょう",
  "秒":"びょう","次":"つぎ","数":"かず","位":"くらい","体":"たい","回":"かい","問":"もん","勝":"しょう",
  "音":"おと","力":"ちから","手":"て","指":"ゆび","小":"しょう","十":"じゅう","一":"いち","算":"さん",
  "文字と式":"もじとしき","仮分数":"かぶんすう","分数":"ぶんすう","分母":"ぶんぼ","分子":"ぶんし",
  "約分":"やくぶん","通分":"つうぶん","比例":"ひれい","経験値":"けいけんち","種類":"しゅるい","入れ替え":"いれかえ","得意":"とくい","簡単":"かんたん","値":"あたい","比":"ひ","倍":"ばい"
};
const KEYS = Object.keys(FURIGANA).sort((a, b) => b.length - a.length);
const RE = new RegExp(KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
const SKIP = "ruby, rt, script, style, textarea, input";

function processText(node) {
  const text = node.nodeValue;
  if (!text || !/[一-龥]/.test(text)) return;
  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP)) return;
  RE.lastIndex = 0;
  let m, last = 0, found = false;
  const frag = document.createDocumentFragment();
  while ((m = RE.exec(text))) {
    found = true;
    if (m.index > last) frag.append(document.createTextNode(text.slice(last, m.index)));
    const ruby = document.createElement("ruby");
    ruby.append(document.createTextNode(m[0]));
    const rt = document.createElement("rt");
    rt.textContent = FURIGANA[m[0]];
    ruby.append(rt);
    frag.append(ruby);
    last = m.index + m[0].length;
  }
  if (!found) return;
  if (last < text.length) frag.append(document.createTextNode(text.slice(last)));
  node.replaceWith(frag);
}

export function applyFurigana(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(processText);
}

export function removeFurigana() {
  document.querySelectorAll("ruby").forEach(r => {
    r.replaceWith(document.createTextNode(r.firstChild ? r.firstChild.textContent : ""));
  });
}

let observer = null;
export function startFurigana() {
  applyFurigana(document.body);
  if (observer) return;
  observer = new MutationObserver(muts => {
    for (const mu of muts) {
      if (mu.type === "characterData") { processText(mu.target); continue; }
      mu.addedNodes.forEach(node => {
        if (node.nodeType === 3) processText(node);
        else if (node.nodeType === 1) applyFurigana(node);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

export function stopFurigana() {
  if (observer) { observer.disconnect(); observer = null; }
  removeFurigana();
}
