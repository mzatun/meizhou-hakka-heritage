/* 生成《梅州客家非遗精讲》Word 讲义 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageNumber, Footer, PageBreak
} = require("docx");

const root = path.join(__dirname, "..");
const chapters = JSON.parse(fs.readFileSync(path.join(root, "data/chapters.json"), "utf8")).chapters;

/* ---------- 字体助手 ---------- */
const SONG = { ascii: "Times New Roman", eastAsia: "宋体", hAnsi: "Times New Roman" };
const HEI = { ascii: "Times New Roman", eastAsia: "黑体", hAnsi: "Times New Roman" };
const KAI = { ascii: "Times New Roman", eastAsia: "楷体", hAnsi: "Times New Roman" };

function P(text, opts = {}) {
  return new Paragraph({
    spacing: { line: 360, before: 60, after: 60 },
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    alignment: opts.align,
    children: [new TextRun({ text, font: SONG, size: 24, ...opts.run })],
    ...opts.para
  });
}
function H1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, font: HEI, size: 32, color: "8A5A1C", bold: true })] }); }
function H2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, font: HEI, size: 28, color: "24466B", bold: true })] }); }
function H3(text) { return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, font: HEI, size: 26, bold: true })] }); }
function Li(text) { return new Paragraph({ spacing: { line: 340, before: 40, after: 40 }, indent: { left: 480 }, children: [new TextRun({ text: "◆ ", font: SONG, size: 24, color: "C9973F" }), new TextRun({ text, font: SONG, size: 24 })] }); }
function Disc(text) { return new Paragraph({ spacing: { line: 340, before: 60, after: 60 }, indent: { left: 480 }, children: [new TextRun({ text: "讨论：", font: HEI, size: 24, bold: true }), new TextRun({ text, font: SONG, size: 24 })] }); }
function Empty() { return new Paragraph({ children: [] }); }

/* ---------- 讨论题（每章三条） ---------- */
const DISCUSSION = {
  c1: ["罗香林「五次大迁徙」说的依据是什么？结合客家谱牒，谈谈家谱对迁徙史研究的价值。", "为什么梅州被称为「世界客都」？从地理与历史角度分析其条件。", "如果你要为某个客家家族编修家谱，你会记录哪些信息？为什么？"],
  c2: ["以一首你听过的客家山歌为例，分析其比兴与双关的运用。", "山歌对唱中的「斗歌」体现了客家社会怎样的交际智慧？", "客家山歌如何实现年轻化传播？试为山歌设计一个短视频传播方案。"],
  c3: ["广东汉剧为何被称为「南国牡丹」？其声腔与京剧有何异同？", "汉乐筝曲《出水莲》营造了怎样的意境？音乐如何表达「出淤泥而不染」？", "传统戏曲观众老龄化问题突出，广东汉剧如何吸引年轻观众？"],
  c4: ["埔寨火龙的制作包含哪些工艺环节？火龙舞动时为何要「烧」而不「护」？", "从节庆演艺看，客家节日的公共性体现在哪些方面？", "若要在城市举办火龙展演，需要考虑哪些安全与文化因素？"],
  c5: ["围龙屋「前塘后围」的布局蕴含了哪些营造智慧？", "对比围龙屋与福建土楼，分析客家民居的地域变体。", "五华石雕、大埔青花瓷等工艺面临怎样的传承困境？非遗工坊能发挥什么作用？"],
  c6: ["「酿豆腐」传说的背后，反映了客家人怎样的饮食记忆与身份认同？", "粄文化与中原饮食有何关联？选择一种粄食考证其源流。", "客家菜如何走向全国？如何在标准化与地道风味之间取得平衡？"],
  c7: ["上灯习俗中「灯」与「丁」的谐音体现了怎样的观念？今天如何理解其文化意义？", "祠堂祭祖对客家宗族社会的凝聚有何作用？", "比较客家婚俗与现代婚礼，谈谈传统礼仪的当代价值。"],
  c8: ["侨批为何能入选联合国教科文组织「世界记忆名录」？其史料价值体现在哪些方面？", "「过番」如何塑造了梅州的侨乡社会结构？", "数字化技术能为客家非遗保护做什么？试列举三项可行方案并说明理由。"]
};

/* ---------- 文档内容 ---------- */
const children = [];

/* 封面 */
children.push(new Paragraph({ spacing: { before: 1800, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "梅州客家非遗精讲", font: HEI, size: 56, bold: true, color: "8A5A1C" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "高校通识课程讲义 · 沉浸式数字课程门户配套教材", font: KAI, size: 26, color: "555555" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "—— 客从何处来 · 非遗如何活 ——", font: KAI, size: 24, color: "24466B" })] }));
children.push(Empty());
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "衣冠南渡的千年回响 · 世界客都的活态记忆", font: SONG, size: 22 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "2026 年 · 本讲义由 AI 辅助生成，仅供教学演示使用", font: SONG, size: 20, color: "999999" })] }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* 课程说明 */
children.push(H1("课程说明"));
children.push(P("《梅州客家非遗》是面向高校开设的通识教育课程。课程以客家迁徙史为纵轴、以梅州客家非物质文化遗产为横轴，带领学生认识客家民系的形成、了解梅州客家非遗的代表性项目，并思考非遗在当代的活态传承路径。"));
children.push(H2("课程定位与目标"));
children.push(Li("了解客家民系形成与梅州「世界客都」的历史地理背景；"));
children.push(Li("熟悉客家山歌、广东汉剧与汉乐、埔寨火龙、兴宁上灯习俗等代表性非遗项目；"));
children.push(Li("认识围龙屋、石雕、青花瓷、蓝衫、粄文化、侨批等物质载体背后的文化内涵；"));
children.push(Li("初步掌握非遗保护的政策框架与数字化传承的基本方法。"));
children.push(H2("课程结构"));
children.push(P("课程共八章：一、衣冠南渡（客家迁徙与世界客都）；二、山歌俚音（客家山歌）；三、南国牡丹（广东汉剧与汉乐）；四、火龙狮舞（节庆演艺）；五、围屋百工（围龙屋与客家工艺）；六、粄香酒醇（客家饮食与粄文化）；七、礼俗客风（客家礼俗与上灯）；八、侨批过番（过番与当代传承）。"));
children.push(H2("配套数字资源"));
children.push(P("本讲义配套一门沉浸式数字课程门户，含八章详情页（AI 语音朗读讲解稿、高清细节放大）、客家迁徙互动地图（三十个节点城市）、数字非遗长廊（四十件器物 360° 翻转展陈）与 AI 讲解员自由问答。建议结合门户资源开展线上线下混合式教学。"));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* 目录（静态） */
children.push(H1("目 录"));
const tocTitles = ["第一章　衣冠南渡 —— 客家迁徙与世界客都", "第二章　山歌俚音 —— 客家山歌", "第三章　南国牡丹 —— 广东汉剧与汉乐", "第四章　火龙狮舞 —— 节庆演艺", "第五章　围屋百工 —— 围龙屋与客家工艺", "第六章　粄香酒醇 —— 客家饮食与粄文化", "第七章　礼俗客风 —— 客家礼俗与上灯", "第八章　侨批过番 —— 过番与当代传承", "附录一　梅州客家非遗主要代表性项目一览", "附录二　课程数字资源使用指南", "附录三　使用与版权说明"];
tocTitles.forEach(t => children.push(new Paragraph({ spacing: { line: 340, before: 40, after: 40 }, children: [new TextRun({ text: t, font: SONG, size: 24 })] })));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* 八章正文 */
chapters.forEach(ch => {
  const no = ["一", "二", "三", "四", "五", "六", "七", "八"][ch.no - 1];
  children.push(new Paragraph({ spacing: { before: 240, after: 60 }, children: [new TextRun({ text: `第${no}章　${ch.title}　${ch.subtitle}`, font: HEI, size: 34, bold: true, color: "8A5A1C" })] }));
  children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: `【${ch.level}】·【${ch.period}】· 关键词：${ch.keywords.join("、")}`, font: KAI, size: 21, color: "666666" })] }));
  children.push(H2("本章导览"));
  children.push(P(ch.summary));
  children.push(H2("知识讲解"));
  ch.script.split(/(?<=。)/).filter(s => s.trim()).forEach(s => children.push(P(s.trim())));
  children.push(H2("本章要点"));
  ch.points.forEach((p, i) => children.push(Li(`${i + 1}. ${p}`)));
  children.push(H2("课堂讨论"));
  (DISCUSSION[ch.id] || []).forEach((d, i) => children.push(Disc(`${i + 1}. ${d}`)));
  children.push(Empty());
  children.push(new Paragraph({ border: { bottom: { style: BorderStyle.DASHED, size: 6, color: "C9973F" } }, children: [] }));
  children.push(Empty());
});

/* 附录一：遗产项目表 */
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(H1("附录一　梅州客家非遗主要代表性项目一览"));
const rows = [
  ["代表性项目", "级别（批次以官方公布为准）", "主要流传区域", "相关章节"],
  ["广东汉剧", "国家级（2006 年首批）", "梅州市（广东汉剧院）", "第三章"],
  ["客家山歌", "国家级", "梅州市各区县", "第二章"],
  ["广东汉乐", "国家级", "大埔县", "第三章"],
  ["丰顺埔寨火龙", "国家级（2008 年）", "丰顺县埔寨镇", "第四章"],
  ["兴宁上灯习俗", "国家级（2021 年）", "兴宁市", "第七章"],
  ["五华石雕", "国家级", "五华县", "第五章"],
  ["客家菜烹饪技艺", "省级", "梅州市", "第六章"],
  ["广东福建侨批档案", "世界记忆名录（2013 年）", "梅州等侨乡", "第八章"]
];
const tblRows = rows.map((r, ri) => new TableRow({
  children: r.map(cell => new TableCell({
    columnSpan: undefined,
    shading: ri === 0 ? { type: ShadingType.CLEAR, fill: "F2E8D5" } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ alignment: ri === 0 ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: cell, font: SONG, size: 20, bold: ri === 0 })] })]
  }))
}));
children.push(new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: [2400, 2626, 2000, 2000], rows: tblRows }));
children.push(Empty());
children.push(P("注：非遗代表性项目的申报与批次信息以国家、广东省及梅州市各级文化和旅游主管部门的官方公布为准，本表仅作教学参考。"));

/* 附录二：数字资源指南 */
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(H1("附录二　课程数字资源使用指南"));
children.push(Li("首页：全屏视差开场，客家围龙屋 AI 封面、南迁光点轨迹动效与火粒粒子动画；右上角可开启/静音客家山歌风味背景乐。"));
children.push(Li("课程章节：八章时间轴立体卡片，点击进入详情页，可播放 AI 语音朗读、查看本章要点、拖拽放大高清细节、观看程序化动态画卷。"));
children.push(Li("互动地图：客家迁徙与非遗分布地图，三十个节点（迁徙路线、梅州县市区、国内播迁地、海外迁播地），点击弹出城市卡片并跳转相关章节。"));
children.push(Li("数字非遗长廊：四十件器物瀑布流展陈，点击卡片 360° 翻转，查看断代、材质工艺、流传区域、传承谱系与故事。"));
children.push(Li("AI 讲解员「阿蛮」：右下角常驻客家妹子立绘讲解员，可就课程知识自由问答，回答流式打字呈现并支持语音播报。"));
children.push(Li("课程档案馆：讲义与教学 PPT 下载、种子数据（章节/节点/器物/问答 JSON）与系统架构、视觉规范文档。"));

/* 附录三：版权说明 */
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(H1("附录三　使用与版权说明"));
children.push(P("本讲义及其配套网站的封面图、章节插画、器物插画与讲解员立绘均由 AI 文生图生成，背景乐为程序化实时合成的客家山歌风味音乐，动态画卷为 Canvas 程序化动效。全部素材仅用于本课程教学演示，不构成对真实文物或真实非遗传承场景的实录。"));
children.push(P("课程知识内容参考公开资料整理。非遗代表性项目的级别、批次与保护单位等信息，请以国家及广东省、梅州市各级文化和旅游主管部门官方公布为准。欢迎师生就内容准确性问题提出指正。"));

/* ---------- 文档装配 ---------- */
const doc = new Document({
  styles: {
    default: { document: { run: { font: SONG, size: 24 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: ["梅州客家非遗精讲 · 第 ", PageNumber.CURRENT, " 页"], font: SONG, size: 18, color: "999999" })]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(root, "downloads/meizhou-hakka-heritage-notes.docx");
  fs.writeFileSync(out, buf);
  const out2 = path.join(root, "output/讲义/梅州客家非遗精讲.docx");
  fs.mkdirSync(path.dirname(out2), { recursive: true });
  fs.writeFileSync(out2, buf);
  console.log("OK:", out, buf.length, "bytes");
  console.log("OK:", out2);
});
