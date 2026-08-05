/* AI 讲解员「阿蛮」：常驻右下角，本地知识库问答 + 流式打字 + 语音播报 */
const Guide = (() => {
  let qa = null, panelOpen = false, typing = false, ttsOn = true;

  async function init() {
    qa = await loadData("qa").catch(() => null);
    mount();
  }

  function mount() {
    const btn = document.createElement("button");
    btn.className = "guide-btn"; btn.id = "guideBtn"; btn.setAttribute("aria-label", "AI讲解员");
    btn.innerHTML = '<span class="halo"></span><img src="assets/img/guide.jpg" alt="AI讲解员阿蛮">';
    btn.addEventListener("click", () => setOpen(!panelOpen));
    document.body.appendChild(btn);

    const panel = document.createElement("div");
    panel.className = "guide-panel"; panel.id = "guidePanel";
    panel.innerHTML = `
      <div class="guide-head">
        <img src="assets/img/guide.jpg" alt="">
        <div><div class="nm">阿蛮</div><div class="rl">课程AI讲解员 · 客家妹子</div></div>
        <div class="ops">
          <button id="gTts" class="on" title="语音播报">音</button>
          <button id="gClose" title="收起">✕</button>
        </div>
      </div>
      <div class="guide-msgs" id="gMsgs"></div>
      <div class="guide-sugs" id="gSugs"></div>
      <div class="guide-input">
        <input id="gInput" type="text" placeholder="想问点什么？比如：埔寨火龙是什么？" maxlength="120">
        <button id="gSend">发送</button>
      </div>`;
    document.body.appendChild(panel);

    qs("gClose").addEventListener("click", () => setOpen(false));
    qs("gTts").addEventListener("click", () => {
      ttsOn = !ttsOn; qs("gTts").classList.toggle("on", ttsOn);
      if (!ttsOn) Voice.stop();
    });
    qs("gSend").addEventListener("click", send);
    qs("gInput").addEventListener("keydown", e => { if (e.key === "Enter") send(); });

    if (qa && qa.guide && qa.guide.suggestions) {
      qa.guide.suggestions.forEach(s => {
        const b = document.createElement("button");
        b.textContent = s;
        b.addEventListener("click", () => { qs("gInput").value = s; ask(s); });
        qs("gSugs").appendChild(b);
      });
    }
    pushBot(qa ? qa.guide.greeting : "你好，我是课程AI讲解员。", true);
  }

  function setOpen(open) {
    panelOpen = open;
    qs("guidePanel").classList.toggle("open", open);
    if (open) setTimeout(() => qs("gInput").focus(), 300);
  }

  function pushUser(text) {
    const d = document.createElement("div");
    d.className = "g-msg user"; d.textContent = text;
    qs("gMsgs").appendChild(d); scrollBottom();
  }

  function pushBot(text, instant) {
    const d = document.createElement("div");
    d.className = "g-msg bot";
    qs("gMsgs").appendChild(d); scrollBottom();
    if (instant) { d.innerHTML = fmt(text); if (ttsOn) Voice.speak(text); return Promise.resolve(); }
    return typeInto(d, text);
  }

  function fmt(text) { return esc(text).replace(/\n/g, "<br>"); }

  function typeInto(el, text) {
    typing = true; qs("gSend").disabled = true;
    el.classList.add("typing-cursor");
    let i = 0;
    return new Promise(resolve => {
      const t = setInterval(() => {
        i += 1 + Math.floor(Math.random() * 2);
        el.innerHTML = fmt(text.slice(0, i));
        scrollBottom();
        if (i >= text.length) {
          clearInterval(t); el.classList.remove("typing-cursor");
          typing = false; qs("gSend").disabled = false;
          if (ttsOn) Voice.speak(text);
          resolve();
        }
      }, 22);
    });
  }

  function scrollBottom() { const m = qs("gMsgs"); m.scrollTop = m.scrollHeight; }

  function match(q) {
    if (!qa) return null;
    const s = q.toLowerCase();
    let best = null, bestScore = 0;
    qa.qa.forEach(item => {
      let score = 0;
      item.keys.forEach(k => { if (s.includes(k.toLowerCase())) score += k.length; });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return bestScore >= 2 ? best : null;
  }

  async function ask(q) {
    if (!q || typing) return;
    pushUser(q);
    const hit = match(q);
    const box = qs("gMsgs");
    const d = document.createElement("div");
    d.className = "g-msg bot"; box.appendChild(d); scrollBottom();
    d.classList.add("typing-cursor");
    typing = true; qs("gSend").disabled = true;
    const text = hit ? hit.a : (qa ? qa.guide.fallback : "知识库加载失败，请刷新页面。");
    let i = 0;
    await new Promise(resolve => {
      const t = setInterval(() => {
        i += 1 + Math.floor(Math.random() * 2);
        d.innerHTML = fmt(text.slice(0, i));
        scrollBottom();
        if (i >= text.length) { clearInterval(t); resolve(); }
      }, 22);
    });
    d.classList.remove("typing-cursor");
    if (hit && hit.ch) {
      const a = document.createElement("a");
      a.className = "chlink"; a.href = `chapter.html?id=${hit.ch}`;
      a.textContent = "→ 前往相关章节学习";
      d.appendChild(a);
    }
    if (ttsOn) Voice.speak(text);
    typing = false; qs("gSend").disabled = false;
    scrollBottom();
  }

  function send() {
    const inp = qs("gInput");
    const v = inp.value.trim();
    if (!v) return;
    inp.value = "";
    ask(v);
  }

  document.addEventListener("DOMContentLoaded", init);
  return { ask };
})();
