/* 生成《梅州客家非遗》配套教学 PPT（16:9） */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const root = path.join(__dirname, "..");
const chapters = JSON.parse(fs.readFileSync(path.join(root, "data/chapters.json"), "utf8")).chapters;

/* ---------- 视觉令牌：靛蓝 / 夯土黄 / 焰红 ---------- */
const C = {
  ink: "0B0D12", ink2: "10131B", panel: "151A24",
  indigo: "24466B", indigo2: "3A6A9C", indigoSoft: "8FB8DE",
  earth: "C9973F", earthSoft: "E3C48A", gold: "F7E6B2",
  flame: "D45A3A", flameSoft: "F08A5F",
  paper: "F2E8D5", white: "FFFFFF", gray: "6B6559", dim: "8A8373"
};
const F_TITLE = "楷体", F_BODY = "微软雅黑";
const W = 13.333, H = 7.5;
const img = n => path.join(root, `assets/img/ppt/${n.replace(".png", ".jpg")}`);
const cover = i => path.join(root, `assets/img/ppt/c${i}.jpg`);

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "梅州客家非遗课程组";
pptx.title = "梅州客家非遗 · 高校通识课程";
pptx.subject = "客家山歌 / 广东汉剧与汉乐 / 埔寨火龙 / 围龙屋 / 侨批";

/* ---------- 通用件 ---------- */
function bg(slide, color) { slide.background = { color }; }
function pageHead(slide, kicker, title) {
  slide.addText(kicker, { x: 0.75, y: 0.55, w: 8, h: 0.4, fontFace: F_BODY, fontSize: 13, color: C.earth, charSpacing: 4, bold: true });
  slide.addText(title, { x: 0.75, y: 0.95, w: 11.8, h: 0.75, fontFace: F_TITLE, fontSize: 32, color: C.indigo, bold: true });
}
function chip(slide, text, x, y, w, h, fill, color) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.5, fill: { color: fill }, line: { color: fill }, shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 90, opacity: 0.25 } });
  slide.addText(text, { x, y: y - 0.02, w, h, align: "center", valign: "middle", fontFace: F_BODY, fontSize: 11.5, color, charSpacing: 1, bold: true });
}
function darkMask(slide) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.ink, transparency: 42 } });
}
function footNote(slide, text) {
  slide.addText(text, { x: 0.75, y: 7.02, w: 11.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim, align: "right" });
}

/* ============ 1 封面 ============ */
let s = pptx.addSlide();
bg(s, C.ink);
s.addImage({ path: img("home-cover.png"), x: 0, y: 0, w: W, h: H, transparency: 12 });
darkMask(s);
s.addText("高校通识课程 · 沉浸式数字课程门户", { x: 0.8, y: 2.05, w: 11.7, h: 0.5, align: "center", fontFace: F_BODY, fontSize: 15, color: C.earthSoft, charSpacing: 8 });
s.addText("梅州客家非遗", { x: 0.8, y: 2.55, w: 11.7, h: 1.3, align: "center", fontFace: F_TITLE, fontSize: 60, color: C.gold, bold: true, charSpacing: 6 });
s.addText("客从何处来 · 非遗如何活", { x: 0.8, y: 3.95, w: 11.7, h: 0.6, align: "center", fontFace: F_TITLE, fontSize: 24, color: C.paper, charSpacing: 6 });
s.addText("衣冠南渡的千年回响 · 世界客都的活态记忆", { x: 0.8, y: 4.75, w: 11.7, h: 0.5, align: "center", fontFace: F_BODY, fontSize: 14, color: "B9B2A2" });
s.addNotes("开场：本课程带你从客家迁徙史出发，认识梅州客家山歌、广东汉剧汉乐、埔寨火龙、围龙屋、客家菜、上灯习俗与侨批文化。");

/* ============ 2 课程导览 ============ */
s = pptx.addSlide();
bg(s, C.white);
pageHead(s, "课 程 导 览", "一门课，读懂世界客都的千年文脉");
s.addShape(pptx.ShapeType.roundRect, { x: 0.75, y: 1.95, w: 5.6, h: 4.6, rectRadius: 0.12, fill: { color: C.paper, transparency: 40 }, line: { color: "E0D5BC" } });
s.addText("从永嘉之乱的衣冠南渡，到当代的数字传承——本课程以八个章节为经，以迁徙路线、三十个节点城市、四十件非遗器物为纬，带你走进客家人的声音、戏台、节庆、居所与餐桌。", { x: 1.1, y: 2.3, w: 4.9, h: 2.2, fontFace: F_BODY, fontSize: 15, color: C.ink2, lineSpacing: 26, valign: "top" });
s.addText("学习方法", { x: 1.1, y: 4.55, w: 4, h: 0.4, fontFace: F_BODY, fontSize: 13, bold: true, color: C.indigo });
s.addText("章节时间轴 → 互动地图 → 数字长廊 → AI 讲解员自由问答", { x: 1.1, y: 5.0, w: 4.9, h: 1.2, fontFace: F_BODY, fontSize: 12.5, color: C.gray, lineSpacing: 24 });
const stats = [["8", "课程章节"], ["30", "地图节点"], ["40", "非遗器物"], ["4+", "国家级非遗"]];
stats.forEach((st, i) => {
  const x = 6.75 + (i % 2) * 3.0, y = 1.95 + Math.floor(i / 2) * 2.4;
  s.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.7, h: 2.1, rectRadius: 0.12, fill: { color: i === 3 ? C.ink : C.indigo }, shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 90, opacity: 0.2 } });
  s.addText(st[0], { x, y: y + 0.3, w: 2.7, h: 0.95, align: "center", fontFace: F_TITLE, fontSize: 40, bold: true, color: i === 3 ? C.gold : C.earthSoft });
  s.addText(st[1], { x, y: y + 1.35, w: 2.7, h: 0.45, align: "center", fontFace: F_BODY, fontSize: 12.5, color: "CFC8B8", charSpacing: 3 });
});
s.addText("第 2 / 15 页 · 课程导览", { x: 0.75, y: 7.02, w: 11.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim });
s.addNotes("介绍课程定位、学习路径与课程规模：8章、30节点、40器物、多项国家级非遗。");

/* ============ 3-10 八章（交替布局） ============ */
const CN = ["一", "二", "三", "四", "五", "六", "七", "八"];
chapters.forEach((ch, i) => {
  s = pptx.addSlide();
  bg(s, C.white);
  const leftImg = i % 2 === 0;
  const ix = leftImg ? 0.75 : 6.85, iw = 5.7, ih = 5.35, iy = 1.05;
  s.addImage({ path: cover(ch.no), x: ix, y: iy, w: iw, h: ih });
  s.addShape(pptx.ShapeType.roundRect, { x: ix - 0.14, y: iy - 0.14, w: iw + 0.28, h: ih + 0.28, rectRadius: 0.08, line: { color: C.earth, width: 1.5 }, fill: { color: "FFFFFF", transparency: 100 } });
  s.addText(`第${CN[i]}章`, { x: leftImg ? 6.85 : 0.75, y: 1.15, w: 4, h: 0.5, fontFace: F_BODY, fontSize: 14, bold: true, color: C.earth, charSpacing: 5 });
  s.addText(ch.title, { x: leftImg ? 6.85 : 0.75, y: 1.65, w: 5.7, h: 0.85, fontFace: F_TITLE, fontSize: 36, bold: true, color: C.indigo });
  s.addText(ch.subtitle, { x: leftImg ? 6.85 : 0.75, y: 2.55, w: 5.7, h: 0.5, fontFace: F_BODY, fontSize: 17, color: C.indigo2 });
  chip(s, ch.level, leftImg ? 6.85 : 0.75, 3.15, 4.3, 0.5, C.paper, "8A5A1C");
  s.addText(`${ch.period}`, { x: leftImg ? 11.35 : 5.25, y: 3.15, w: 1.3, h: 0.5, fontFace: F_BODY, fontSize: 11.5, color: C.gray, valign: "middle" });
  ch.points.slice(0, 4).forEach((p, k) => {
    s.addShape(pptx.ShapeType.roundRect, { x: leftImg ? 6.85 : 0.75, y: 3.95 + k * 0.82, w: 5.75, h: 0.72, rectRadius: 0.1, fill: { color: k % 2 === 0 ? "F6F1E4" : "ECF1F7", transparency: 30 } });
    s.addText(`${k + 1}. ${p}`, { x: leftImg ? 7.1 : 1.0, y: 3.95 + k * 0.82, w: 5.25, h: 0.72, fontFace: F_BODY, fontSize: 11.8, color: C.ink2, valign: "middle", lineSpacing: 18 });
  });
  s.addText(`→ 门户站点 chapter.html?id=${ch.id} · 含 AI 语音朗读讲解稿与高清细节放大`, { x: leftImg ? 6.85 : 0.75, y: 7.02, w: 5.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim });
  s.addText(`第 ${3 + i} / 15 页 · 第${CN[i]}章`, { x: 0.75, y: 7.02, w: 11.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim, align: "right" });
  s.addNotes(`【${ch.title}】${ch.summary}。可让学生到门户站点对应章节收听 AI 朗读全文。`);
});

/* ============ 11 互动地图 ============ */
s = pptx.addSlide();
bg(s, C.white);
pageHead(s, "互 动 地 图", "客家迁徙路线 · 非遗分布地图");
const stops = [
  ["洛阳 · 永嘉之乱", "迁徙起点", "011"],
  ["石壁 · 客家祖地", "中转祖地", "006"],
  ["长汀 · 汀州府", "客家首府", "007"],
  ["梅州 · 世界客都", "落脚大本营", "009"],
  ["南洋 · 世界客属", "海外播迁", "023"]
];
let lx = 1.0;
stops.forEach((st, i) => {
  const y = 4.3;
  s.addShape(pptx.ShapeType.ellipse, { x: lx + 0.18, y, w: 0.5, h: 0.5, fill: { color: i === 3 ? C.flame : C.earth }, line: { color: C.white, width: 2 }, shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 90, opacity: 0.3 } });
  s.addText(st[0], { x: lx - 0.4, y: y + 0.62, w: 1.75, h: 0.75, align: "center", fontFace: F_BODY, fontSize: 12, bold: true, color: C.ink2, lineSpacing: 17 });
  s.addText(st[1], { x: lx - 0.4, y: y + 1.38, w: 1.75, h: 0.4, align: "center", fontFace: F_BODY, fontSize: 10.5, color: C.gray });
  if (i < stops.length - 1) {
    s.addShape(pptx.ShapeType.line, { x: lx + 0.72, y: y + 0.25, w: 1.55, h: 0, line: { color: C.earth, width: 2, dashType: "dash" } });
    s.addText(st[2].replace("0", "").replace("1", "1"), { x: 0, y: 0, w: 0, h: 0 });
  }
  lx += 2.35;
});
s.addShape(pptx.ShapeType.roundRect, { x: 0.95, y: 2.35, w: 5.1, h: 1.55, rectRadius: 0.1, fill: { color: C.paper, transparency: 30 } });
s.addText("三十个节点城市", { x: 1.25, y: 2.55, w: 4, h: 0.5, fontFace: F_TITLE, fontSize: 24, bold: true, color: C.indigo });
s.addText("迁徙路线节点 · 梅州八县市区 · 国内播迁地 · 海外迁播地。点击城市卡片，查看历史概况、代表非遗并跳转相关章节。", { x: 1.25, y: 3.15, w: 4.6, h: 0.75, fontFace: F_BODY, fontSize: 12.5, color: C.ink2, lineSpacing: 21 });
s.addShape(pptx.ShapeType.roundRect, { x: 6.6, y: 2.35, w: 5.9, h: 1.55, rectRadius: 0.1, fill: { color: C.indigo } });
s.addText("金色虚线 = 南迁示意路线（光点流动）", { x: 6.9, y: 2.62, w: 5.3, h: 0.4, fontFace: F_BODY, fontSize: 12.5, color: C.earthSoft, bold: true });
s.addText("洛阳 → 荥阳 → 襄阳 → 九江 → 吉安 → 石壁 → 长汀 → 梅关 → 梅州 → 赣州/龙岩/惠州/河源/韶关 → 新加坡/吉隆坡/坤甸/曼谷/路易港/温哥华……", { x: 6.9, y: 3.1, w: 5.3, h: 0.8, fontFace: F_BODY, fontSize: 11.5, color: "CFC8B8", lineSpacing: 20 });
s.addText("第 11 / 15 页 · 互动地图", { x: 0.75, y: 7.02, w: 11.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim, align: "right" });
s.addNotes("展示门户站点互动地图：30个节点串起客家先民南迁与世界播迁的路线。");

/* ============ 12 数字非遗长廊 ============ */
s = pptx.addSlide();
bg(s, C.white);
pageHead(s, "数 字 非 遗 长 廊", "四十件器物 · 一部客家生活史");
s.addImage({ path: img("relics/r01.png"), x: 0.75, y: 2.0, w: 2.6, h: 3.3 });
s.addImage({ path: img("relics/r27.png"), x: 3.5, y: 2.0, w: 2.6, h: 3.3 });
s.addImage({ path: img("relics/r10.png"), x: 6.25, y: 2.0, w: 2.6, h: 3.3 });
s.addImage({ path: img("relics/r20.png"), x: 9.0, y: 2.0, w: 2.6, h: 3.3 });
const rNames = ["汉剧凤冠", "侨批文书", "火龙龙头", "围龙屋模型"];
rNames.forEach((n, i) => s.addText(n, { x: 0.75 + i * 2.75, y: 5.42, w: 2.6, h: 0.4, align: "center", fontFace: F_BODY, fontSize: 12.5, bold: true, color: C.indigo }));
s.addText("瀑布流展陈 · 点击卡片 360° 翻转：正面器物图，背面断代 / 材质工艺 / 流传区域 / 传承谱系 / 故事讲解。", { x: 0.75, y: 5.95, w: 11.8, h: 0.7, fontFace: F_BODY, fontSize: 14, color: C.ink2, align: "center", lineSpacing: 24 });
s.addText("第 12 / 15 页 · 数字非遗长廊", { x: 0.75, y: 7.02, w: 11.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim, align: "right" });
s.addNotes("引导学生在门户站点数字非遗长廊中浏览40件器物并完成翻转阅读。");

/* ============ 13 AI 讲解员 ============ */
s = pptx.addSlide();
bg(s, C.white);
pageHead(s, "AI 讲 解 员", "右下角常驻 · 随问随答");
s.addImage({ path: img("guide.png"), x: 0.75, y: 1.95, w: 3.6, h: 4.9 });
s.addText("阿蛮", { x: 1.55, y: 6.35, w: 2, h: 0.5, align: "center", fontFace: F_TITLE, fontSize: 22, bold: true, color: C.indigo });
const gFeatures = [
  ["自由问答", "山歌、汉剧、火龙、围龙屋、酿豆腐、侨批……课程知识随问随答"],
  ["流式打字", "回答逐字呈现，还原对话节奏"],
  ["语音播报", "支持文生语音朗读，可开关"],
  ["知识导览", "答案关联章节，一键跳转深度学习"]
];
gFeatures.forEach((f, i) => {
  const y = 2.1 + i * 1.3;
  s.addShape(pptx.ShapeType.roundRect, { x: 4.85, y, w: 7.7, h: 1.05, rectRadius: 0.1, fill: { color: i % 2 === 0 ? "F6F1E4" : "ECF1F7", transparency: 25 } });
  s.addText(f[0], { x: 5.15, y: y + 0.12, w: 2.2, h: 0.4, fontFace: F_BODY, fontSize: 14, bold: true, color: C.earth, charSpacing: 1 });
  s.addText(f[1], { x: 5.15, y: y + 0.52, w: 7.1, h: 0.45, fontFace: F_BODY, fontSize: 12, color: C.ink2 });
});
s.addText("第 13 / 15 页 · AI 讲解员", { x: 0.75, y: 7.02, w: 11.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim, align: "right" });
s.addNotes("演示门户站点右下角 AI 讲解员阿蛮的使用方法。");

/* ============ 14 课程档案馆 ============ */
s = pptx.addSlide();
bg(s, C.white);
pageHead(s, "课 程 档 案 馆", "讲义 · 课件 · 课程资产一站下载");
const dl = [
  ["《梅州客家非遗精讲》讲义", "Word 文档 · 八章完整讲解 + 课堂讨论 + 附录", "downloads/meizhou-hakka-heritage-notes.docx"],
  ["《梅州客家非遗》教学 PPT", "本套演示文稿 · 与站点同一视觉体系", "downloads/meizhou-hakka-heritage-slides.pptx"],
  ["种子数据", "章节 / 节点 / 器物 / 问答库 JSON", "data/*.json"],
  ["架构与视觉规范", "系统架构说明 · 三色视觉规范", "docs/*.html"]
];
dl.forEach((d, i) => {
  const x = 0.75 + (i % 2) * 6.05, y = 2.0 + Math.floor(i / 2) * 2.45;
  s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.75, h: 2.15, rectRadius: 0.1, fill: { color: C.paper, transparency: 35 }, line: { color: "E0D5BC" } });
  s.addText(d[0], { x: x + 0.35, y: y + 0.3, w: 5, h: 0.5, fontFace: F_TITLE, fontSize: 17, bold: true, color: C.indigo });
  s.addText(d[1], { x: x + 0.35, y: y + 0.95, w: 5.05, h: 0.8, fontFace: F_BODY, fontSize: 12, color: C.gray, lineSpacing: 21 });
  s.addText(d[2], { x: x + 0.35, y: y + 1.7, w: 5.05, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.earth });
});
s.addText("第 14 / 15 页 · 课程档案馆", { x: 0.75, y: 7.02, w: 11.8, h: 0.35, fontFace: F_BODY, fontSize: 10, color: C.dim, align: "right" });
s.addNotes("所有课程资产均在门户站点课程档案馆页面提供下载。");

/* ============ 15 结语 ============ */
s = pptx.addSlide();
bg(s, C.ink);
s.addImage({ path: cover(7), x: 0, y: 0, w: W, h: H, transparency: 15 });
darkMask(s);
s.addText("山歌不唱心不开 · 非遗不传根不在", { x: 0.8, y: 2.6, w: 11.7, h: 1.0, align: "center", fontFace: F_TITLE, fontSize: 38, bold: true, color: C.gold, charSpacing: 4 });
s.addText("愿这门课成为你与客家文化的一次相遇", { x: 0.8, y: 3.85, w: 11.7, h: 0.6, align: "center", fontFace: F_BODY, fontSize: 16, color: C.paper, charSpacing: 2 });
s.addText("梅州客家非遗课程组 · 2026", { x: 0.8, y: 5.6, w: 11.7, h: 0.5, align: "center", fontFace: F_BODY, fontSize: 12, color: "B9B2A2" });
s.addNotes("课程结语，鼓励学生课后使用门户站点继续探索客家非遗。");

pptx.writeFile({ fileName: path.join(root, "downloads/meizhou-hakka-heritage-slides.pptx") }).then(f => {
  console.log("OK:", f);
});
