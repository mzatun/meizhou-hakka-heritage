/* 首页：视差滚动 + 全屏画布（火粒子上浮 + 南迁光点轨迹） */
(function () {
  const bg = document.querySelector(".hero-bg");
  const inner = document.querySelector(".hero-inner");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (bg) bg.style.transform = `translateY(${y * 0.32}px) scale(1.04)`;
      if (inner) {
        inner.style.transform = `translateY(${y * 0.16}px)`;
        inner.style.opacity = Math.max(0, 1 - y / 620);
      }
      ticking = false;
    });
  }, { passive: true });

  const cv = qs("heroCanvas");
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function fit() {
    const r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
  }
  fit(); window.addEventListener("resize", fit);
  const c = cv.getContext("2d");
  let t = 0;
  const sparks = [];
  const R = (a, b) => a + Math.random() * (b - a);
  const W = () => cv.width / dpr, H = () => cv.height / dpr;
  for (let i = 0; i < 70; i++) sparks.push({ x: Math.random(), y: Math.random(), vy: R(.0006, .0022), vx: R(-.0004, .0004), r: R(.8, 2.6), a: R(.2, .8), warm: Math.random() < .55 });

  /* 南迁轨迹（自中原而梅州，示意曲线） */
  const path = [[.06, .8], [.2, .62], [.34, .7], [.5, .5], [.64, .58], [.8, .42], [.94, .3]];
  function pAt(u) {
    const seg = u * (path.length - 1), i = Math.min(Math.floor(seg), path.length - 2), f = seg - i;
    const p0 = path[i], p1 = path[i + 1];
    return [(p0[0] + (p1[0] - p0[0]) * f) * W(), (p0[1] + (p1[1] - p0[1]) * f) * H()];
  }

  function loop() {
    t++;
    const w = W(), h = H();
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);

    /* 轨迹 */
    c.beginPath();
    for (let u = 0; u <= 1.001; u += .02) { const [x, y] = pAt(u); u === 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.strokeStyle = "rgba(201,151,63,.16)"; c.lineWidth = 1.1; c.setLineDash([4, 8]); c.stroke(); c.setLineDash([]);
    path.forEach((p, i) => {
      const pu = (Math.sin(t / 46 + i * 1.4) + 1) / 2;
      c.beginPath(); c.arc(p[0] * w, p[1] * h, 2.4 + pu * 1.8, 0, 7);
      c.fillStyle = `rgba(227,196,138,${.3 + pu * .4})`; c.fill();
    });
    /* 光点拖尾 */
    const u0 = (t / 560) % 1;
    for (let k = 0; k < 14; k++) {
      const u = u0 - k * .008; if (u < 0) break;
      const [x, y] = pAt(u);
      c.beginPath(); c.arc(x, y, k === 0 ? 4.6 : 3.2 * (1 - k / 14), 0, 7);
      c.fillStyle = `rgba(247,230,178,${(1 - k / 14) * .8})`; c.fill();
    }
    const [hx, hy] = pAt(u0);
    const g = c.createRadialGradient(hx, hy, 0, hx, hy, 30);
    g.addColorStop(0, "rgba(247,230,178,.7)"); g.addColorStop(1, "rgba(247,230,178,0)");
    c.fillStyle = g; c.beginPath(); c.arc(hx, hy, 30, 0, 7); c.fill();

    /* 火粒子 */
    sparks.forEach(s => {
      s.y -= s.vy; s.x += s.vx + Math.sin((t + s.a * 900) / 70) * .0004;
      if (s.y < -.03) { s.y = 1.02; s.x = Math.random(); }
      c.beginPath(); c.arc(s.x * w, s.y * h, s.r, 0, 7);
      c.fillStyle = (s.warm ? "rgba(240,138,95," : "rgba(227,196,138,") + s.a * .8 + ")";
      c.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();
