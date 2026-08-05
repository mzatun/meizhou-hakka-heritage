/* Canvas 动态画卷：八个章节的场景动效 */
const Scenes = (() => {
  function fit(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, w: r.width, h: r.height };
  }

  function start(cv, type) {
    let { c, w, h } = fit(cv);
    let raf = 0, t = 0;
    const parts = [];
    const onResize = () => { const f = fit(cv); c = f.c; w = f.w; h = f.h; };
    window.addEventListener("resize", onResize);

    const R = (a, b) => a + Math.random() * (b - a);
    const GOLD = "rgba(227,196,138,", FLAME = "rgba(240,138,95,";

    function spark(spawn) {
      return { x: R(0, w), y: spawn ? R(h * .5, h) : h + 10, vy: -R(.25, .9), vx: R(-.18, .18), r: R(.8, 2.4), life: R(120, 320), age: 0, warm: Math.random() < .5 };
    }
    for (let i = 0; i < 40; i++) parts.push(spark(true));

    const draw = {
      /* 迁徙光路 */
      route() {
        c.clearRect(0, 0, w, h);
        const pts = [[.04, .78], [.22, .6], [.38, .68], [.55, .46], [.72, .54], [.92, .3]].map(p => [p[0] * w, p[1] * h]);
        c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) c.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
        c.strokeStyle = "rgba(201,151,63,.25)"; c.lineWidth = 1.2; c.setLineDash([5, 7]); c.stroke(); c.setLineDash([]);
        pts.forEach((p, i) => {
          const pu = (Math.sin(t / 40 + i * 1.3) + 1) / 2;
          c.beginPath(); c.arc(p[0], p[1], 3 + pu * 2, 0, 7);
          c.fillStyle = GOLD + (.4 + pu * .4) + ")"; c.fill();
        });
        const u = (t / 420) % 1, seg = u * (pts.length - 1), i0 = Math.floor(seg), f = seg - i0;
        const p0 = pts[Math.min(i0, pts.length - 1)], p1 = pts[Math.min(i0 + 1, pts.length - 1)];
        const x = p0[0] + (p1[0] - p0[0]) * f, y = p0[1] + (p1[1] - p0[1]) * f;
        const g = c.createRadialGradient(x, y, 0, x, y, 26);
        g.addColorStop(0, "rgba(247,230,178,.95)"); g.addColorStop(.4, GOLD + ".35)"); g.addColorStop(1, GOLD + "0)");
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 26, 0, 7); c.fill();
      },
      /* 山歌回声 */
      echo() {
        c.clearRect(0, 0, w, h);
        c.fillStyle = "#0a0c11"; c.fillRect(0, 0, w, h);
        for (let l = 0; l < 3; l++) {
          c.beginPath(); c.moveTo(0, h);
          for (let x = 0; x <= w; x += 8) {
            const y = h * (.62 + l * .12) + Math.sin(x / (130 - l * 30) + l * 2) * 26;
            c.lineTo(x, y);
          }
          c.lineTo(w, h); c.closePath();
          c.fillStyle = `rgba(29,58,95,${.16 + l * .12})`; c.fill();
        }
        const cx = w * .3, cy = h * .42;
        for (let i = 0; i < 4; i++) {
          const rr = ((t * 1.1 + i * 60) % 240);
          c.beginPath(); c.arc(cx, cy, rr, -.9, .9);
          c.strokeStyle = GOLD + (Math.max(0, .55 - rr / 260)) + ")";
          c.lineWidth = 1.4; c.stroke();
        }
        c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fillStyle = "rgba(247,230,178,.9)"; c.fill();
      },
      /* 戏台灯影 */
      stage() {
        c.clearRect(0, 0, w, h);
        c.fillStyle = "#0c0a10"; c.fillRect(0, 0, w, h);
        const g = c.createRadialGradient(w / 2, h * .85, 10, w / 2, h * .85, h * .9);
        g.addColorStop(0, "rgba(212,90,58,.28)"); g.addColorStop(1, "rgba(212,90,58,0)");
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 5; i++) {
          const lx = w * (.15 + i * .18), ly = h * .2 + Math.sin(t / 50 + i) * 6;
          const lg = c.createRadialGradient(lx, ly, 0, lx, ly, 34);
          lg.addColorStop(0, "rgba(240,138,95,.85)"); lg.addColorStop(1, "rgba(240,138,95,0)");
          c.fillStyle = lg; c.beginPath(); c.arc(lx, ly, 34, 0, 7); c.fill();
          c.fillStyle = "#d45a3a"; c.fillRect(lx - 6, ly - 12, 12, 20);
        }
        for (let i = 0; i < 3; i++) {
          c.beginPath();
          const y0 = h * (.45 + i * .12);
          c.moveTo(-20, y0);
          for (let x = 0; x <= w + 20; x += 10) c.lineTo(x, y0 + Math.sin(x / 90 + t / 30 + i * 2) * 14);
          c.strokeStyle = `rgba(201,151,63,${.12 + i * .05})`; c.lineWidth = 2; c.stroke();
        }
      },
      /* 火龙焰火 */
      sparks() {
        c.fillStyle = "rgba(8,9,13,.32)"; c.fillRect(0, 0, w, h);
        parts.forEach(p => {
          p.age++; p.x += p.vx + Math.sin((p.age + p.y) / 30) * .3; p.y += p.vy;
          const a = Math.max(0, 1 - p.age / p.life);
          c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7);
          c.fillStyle = (p.warm ? FLAME : GOLD) + (a * .85) + ")"; c.fill();
        });
        for (let i = parts.length - 1; i >= 0; i--) if (parts[i].age > parts[i].life || parts[i].y < -12) { parts.splice(i, 1); parts.push(spark(false)); }
        c.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const y = h * .68 + Math.sin(x / 70 + t / 24) * 18 + Math.sin(x / 23 + t / 12) * 5;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.strokeStyle = GOLD + ".5)"; c.lineWidth = 3; c.stroke();
      },
      /* 围龙屋 */
      house() {
        c.clearRect(0, 0, w, h);
        c.fillStyle = "#0a0c11"; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 40; i++) {
          const sx = (i * 97) % w, sy = (i * 57) % (h * .4);
          c.fillStyle = GOLD + (.2 + .3 * Math.abs(Math.sin(t / 60 + i))) + ")";
          c.fillRect(sx, sy, 1.6, 1.6);
        }
        const cx = w / 2, by = h * .62;
        for (let k = 3; k >= 1; k--) {
          c.beginPath(); c.arc(cx, by, 60 + k * 46, Math.PI, 0);
          c.fillStyle = `rgba(${90 + k * 30},${58 + k * 18},${24 + k * 8},.9)`; c.fill();
          c.beginPath(); c.arc(cx, by, 60 + k * 46, Math.PI, 0);
          c.strokeStyle = "rgba(227,196,138,.28)"; c.lineWidth = 2; c.stroke();
        }
        c.fillStyle = "rgba(18,24,36,.9)"; c.fillRect(cx - 190, by, 380, 16);
        for (let i = 0; i < 7; i++) {
          const lx = cx - 150 + i * 50, gl = (Math.sin(t / 30 + i) + 1) / 2;
          c.fillStyle = `rgba(240,170,90,${.4 + gl * .4})`; c.fillRect(lx, by - 26, 7, 12);
        }
        c.beginPath(); c.ellipse(cx, by + 46, 220, 20, 0, 0, 7);
        c.fillStyle = "rgba(36,70,107,.5)"; c.fill();
      },
      /* 粄香蒸汽 */
      steam() {
        c.fillStyle = "rgba(8,9,13,.3)"; c.fillRect(0, 0, w, h);
        parts.forEach(p => {
          p.age++; p.x += Math.sin(p.age / 26) * .5; p.y += p.vy * .55;
          const a = Math.max(0, 1 - p.age / p.life) * .22;
          c.beginPath(); c.arc(p.x, p.y, p.r * 6, 0, 7);
          c.fillStyle = "rgba(242,232,213," + a + ")"; c.fill();
        });
        for (let i = parts.length - 1; i >= 0; i--) if (parts[i].age > parts[i].life) { parts.splice(i, 1); parts.push(spark(false)); }
        for (let i = 0; i < 3; i++) {
          const bx = w * (.3 + i * .2);
          c.beginPath(); c.arc(bx, h * .82, 46, Math.PI, 0);
          c.fillStyle = "rgba(140,90,40,.85)"; c.fill();
          c.fillStyle = "rgba(227,196,138,.25)"; c.fillRect(bx - 50, h * .82, 100, 6);
        }
      },
      /* 上灯花灯 */
      lantern() {
        c.clearRect(0, 0, w, h);
        c.fillStyle = "#0b0a10"; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 6; i++) {
          const lx = w * (.1 + i * .16), ly = h * .3 + Math.sin(t / 40 + i * 1.7) * 8;
          const br = (Math.sin(t / 26 + i) + 1) / 2;
          c.strokeStyle = "rgba(227,196,138,.3)"; c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, ly - 30); c.stroke();
          const g = c.createRadialGradient(lx, ly, 2, lx, ly, 60 + br * 16);
          g.addColorStop(0, "rgba(255,190,110,.95)"); g.addColorStop(.35, "rgba(240,138,95,.4)"); g.addColorStop(1, "rgba(240,138,95,0)");
          c.fillStyle = g; c.beginPath(); c.arc(lx, ly, 60 + br * 16, 0, 7); c.fill();
          c.fillStyle = "#c8502e";
          c.beginPath(); c.moveTo(lx, ly - 30); c.lineTo(lx + 17, ly); c.lineTo(lx, ly + 30); c.lineTo(lx - 17, ly); c.closePath(); c.fill();
          c.strokeStyle = "rgba(247,230,178,.65)"; c.stroke();
        }
        for (let i = 0; i < 14; i++) {
          const sy = h - ((t * .6 + i * 47) % h);
          c.fillStyle = "rgba(227,196,138,.16)";
          c.fillRect(w * ((i * 73) % 100) / 100, sy, 1.4, 8);
        }
      },
      /* 过番远洋 */
      sea() {
        c.clearRect(0, 0, w, h);
        c.fillStyle = "#0a0d14"; c.fillRect(0, 0, w, h);
        const mx = w * .78, my = h * .22;
        const mg = c.createRadialGradient(mx, my, 4, mx, my, 70);
        mg.addColorStop(0, "rgba(242,232,213,.9)"); mg.addColorStop(1, "rgba(242,232,213,0)");
        c.fillStyle = mg; c.beginPath(); c.arc(mx, my, 70, 0, 7); c.fill();
        c.fillStyle = "#efe8d8"; c.beginPath(); c.arc(mx, my, 17, 0, 7); c.fill();
        for (let l = 0; l < 4; l++) {
          c.beginPath();
          const y0 = h * (.55 + l * .11);
          c.moveTo(0, y0);
          for (let x = 0; x <= w; x += 8) c.lineTo(x, y0 + Math.sin(x / (60 + l * 18) + t / (22 + l * 6)) * (6 + l * 2));
          c.strokeStyle = `rgba(58,106,156,${.4 - l * .07})`; c.lineWidth = 1.6; c.stroke();
        }
        const bx = ((t * .8) % (w + 200)) - 100, by = h * .56;
        c.fillStyle = "#20170c";
        c.beginPath(); c.moveTo(bx - 34, by); c.lineTo(bx + 34, by); c.lineTo(bx + 22, by + 14); c.lineTo(bx - 24, by + 14); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by - 40); c.lineTo(bx + 26, by - 8); c.closePath();
        c.fillStyle = "rgba(227,196,138,.85)"; c.fill();
      }
    };

    function loop() {
      t++;
      (draw[type] || draw.sparks)();
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }
  return { start };
})();
