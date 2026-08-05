/* 生成式背景乐：Web Audio 实时合成的客家山歌风味五声音阶音乐
   （竹笛音色模拟 + 低音持续音 + 混响），可静音/播放切换 */
const BGM = (() => {
  let ctx = null, master = null, wet = null, playing = false, timer = null, nextT = 0, walk = 4;
  /* A 羽调五声：A C D E G（宫商角徵羽的色彩化排布） */
  const SCALE = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.26];

  function ensureCtx() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    /* 简易混响：噪声衰减脉冲响应 */
    const len = ctx.sampleRate * 2.4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = ctx.createConvolver(); conv.buffer = buf;
    wet = ctx.createGain(); wet.gain.value = 0.42;
    wet.connect(conv); conv.connect(master);
    startDrone();
  }

  function startDrone() {
    /* 低音持续音：A2 + E3，极轻 */
    [[110, .045], [164.81, .03]].forEach(([f, g]) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = "sine"; o.frequency.value = f; gn.gain.value = g;
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.07 + Math.random() * 0.05; lg.gain.value = g * 0.4;
      lfo.connect(lg); lg.connect(gn.gain);
      o.connect(gn); gn.connect(master); o.start(); lfo.start();
    });
  }

  function flute(t, freq, dur, vol) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator();
    o.type = "sine"; o2.type = "triangle";
    o.frequency.value = freq; o2.frequency.value = freq * 2.001;
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    vib.frequency.value = 5.2; vg.gain.value = freq * 0.006;
    vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 2300; f.Q.value = 0.6;
    const g = ctx.createGain(), g2 = ctx.createGain();
    g2.gain.value = 0.12;
    const a = Math.min(0.45, dur * 0.25);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.setValueAtTime(vol, t + dur - Math.min(1.1, dur * 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g);
    g.connect(master); g.connect(wet);
    o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
    vib.start(t); vib.stop(t + dur + 0.1);
  }

  function pluck(t, freq) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq / 2;
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g); g.connect(master); g.connect(wet);
    o.start(t); o.stop(t + 1);
  }

  function schedule() {
    const ahead = ctx.currentTime + 2.2;
    while (nextT < ahead) {
      const r = Math.random();
      if (r < 0.22) { nextT += 0.9 + Math.random() * 1.2; continue; } /* 留白 */
      const step = [-2, -1, -1, 0, 1, 1, 2, 3][Math.floor(Math.random() * 8)];
      walk = Math.max(0, Math.min(SCALE.length - 1, walk + step));
      const dur = 1.6 + Math.random() * 2.2;
      flute(nextT, SCALE[walk], dur, 0.16 + Math.random() * 0.08);
      if (Math.random() < 0.28) pluck(nextT + 0.4 + Math.random() * 0.5, SCALE[(walk + 4) % SCALE.length]);
      nextT += dur * (0.55 + Math.random() * 0.5);
    }
  }

  function toggle() {
    ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    playing = !playing;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(playing ? 0.9 : 0, now + 0.8);
    if (playing) { nextT = ctx.currentTime + 0.2; timer = setInterval(schedule, 420); schedule(); }
    else if (timer) { clearInterval(timer); timer = null; }
    updateBtn();
    return playing;
  }
  function updateBtn() {
    const btn = document.getElementById("bgmBtn");
    if (!btn) return;
    btn.classList.toggle("on", playing);
    btn.textContent = playing ? "♫" : "♪";
    btn.title = playing ? "背景音乐：播放中（点击静音）" : "背景音乐：已静音（点击播放）";
  }
  function init() { const btn = document.getElementById("bgmBtn"); if (btn) btn.addEventListener("click", toggle); updateBtn(); }
  document.addEventListener("DOMContentLoaded", init);
  return { toggle };
})();
