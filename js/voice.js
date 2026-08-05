/* 文生语音（TTS）封装：中文语音朗读，支持暂停/恢复/停止 */
const Voice = (() => {
  const synth = window.speechSynthesis || null;
  let voice = null, queue = [], speaking = false, paused = false;
  let onStateChange = null;

  function pickVoice() {
    if (!synth) return null;
    const vs = synth.getVoices() || [];
    return vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || vs[0] || null;
  }
  if (synth) {
    voice = pickVoice();
    synth.onvoiceschanged = () => { voice = pickVoice(); };
  }

  function setState(s) { if (onStateChange) onStateChange(s); }

  function speak(text, opts = {}) {
    stop();
    if (!synth) { setState("unsupported"); return; }
    const rate = opts.rate || 1;
    queue = text.split(/(?<=[。！？；\n])/).map(s => s.trim()).filter(Boolean);
    speaking = true; paused = false; setState("playing");
    next(rate, opts);
  }
  function next(rate, opts) {
    if (!queue.length) { speaking = false; setState("idle"); if (opts.onend) opts.onend(); return; }
    const part = queue.shift();
    const u = new SpeechSynthesisUtterance(part);
    if (voice) u.voice = voice;
    u.lang = "zh-CN"; u.rate = rate; u.pitch = 1.02;
    u.onend = () => { if (speaking && !paused) next(rate, opts); };
    u.onerror = () => { if (speaking && !paused) next(rate, opts); };
    synth.speak(u);
  }
  function pause() { if (synth && speaking && !paused) { synth.pause(); paused = true; setState("paused"); } }
  function resume() { if (synth && speaking && paused) { synth.resume(); paused = false; setState("playing"); } }
  function stop() { if (synth) synth.cancel(); queue = []; speaking = false; paused = false; setState("idle"); }
  function getState() { return speaking ? (paused ? "paused" : "playing") : "idle"; }
  function setOnStateChange(fn) { onStateChange = fn; }
  function supported() { return !!synth; }
  return { speak, pause, resume, stop, getState, setOnStateChange, supported };
})();
