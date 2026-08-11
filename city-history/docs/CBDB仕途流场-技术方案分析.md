# CBDB 仕途流场 · 技术方案深度分析

> 分析对象：https://dynasty-migration-vis.buyixiao.xyz/（"CBDB 仕途流场｜中国历代入仕、任官与亲属关系可视化"）
> 分析日期：2026-08-11
> 用途：作为【故事地图】系列的基础实现方案参考

---

## 1. 项目概况

这是一个基于 **CBDB（中国历代人物传记数据库）** 的历史 GIS 可视化平台，核心叙事是"**从入仕来源到首任任职地**"的官员群体流动。页面结构为典型的数据产品三栏布局：

| 区域 | 内容 |
|---|---|
| 左栏 | 群体筛选（朝代下拉 83 项）、地区筛选（省份 + 人数列表）、样本统计（群体人数 9.8 万 / 有入仕 4.4 万 / 有任官 7.3 万 / 可绘制流向 5387） |
| 中栏 | **动态流场主图**（2D/3D 切换、时间轴播放、缩放）、入仕方式图例、Top5 流入/流出地 |
| 右栏 | 官宦亲属背景（桑基图）、官宦世家演进（家族列表）、大事件仕途扰动（第二张地图） |

**产品亮点**：时间维动画（10 年一个窗口自动播放）、2D/3D 双叙事模式、动态后端计算（筛选变化后服务端重新聚合）。

---

## 2. 整体技术架构

```
┌─────────────────────────────────────────────────────────┐
│  前端：React 19 SPA（Vite 构建，单页应用，SPA）            │
│                                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────────────────┐  │
│  │ 2D 流场    │ │ 3D 流场    │ │ 桑基图 / 事件地图 /     │  │
│  │ Canvas 2D │ │ Three.js   │ │ 柱状图等辅助图表        │  │
│  │ + d3-geo  │ │ r184(懒加载)│ │ (SVG / d3-sankey)     │  │
│  └───────────┘ └───────────┘ └───────────────────────┘  │
│  lucide-react 图标 / 百度统计 / 埋点                        │
└──────────────────────────┬──────────────────────────────┘
                           │ REST JSON
┌──────────────────────────▼──────────────────────────────┐
│  后端 API（Caddy 托管，带 ETag + 分层缓存头）                │
│  /api/dynasties /api/provinces /api/flow                 │
│  /api/summary /api/sankey /api/lineage/overview          │
│  /api/settings/access-policy /api/logs/track             │
│  ◆ 按朝代/省份/时间间隔动态聚合计算（登录用户可触发）          │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  数据源：CBDB（中国历代人物传记数据库，哈佛/北大/台湾中研院）  │
│  地图边界：阿里 DataV 省界 GeoJSON(100000_full.json)       │
└─────────────────────────────────────────────────────────┘
```

### 关键设计决策

1. **前后端分离**：前端纯静态资源（index.html + 4 个 JS/CSS 包），所有数据经 REST API 获取，服务端承担聚合计算。
2. **按需分包**：3D 引擎（559KB）作为独立 chunk 用 `React.lazy + Suspense` 懒加载，首屏只下载 350KB 主包。
3. **服务端动态计算**：修改朝代/省份/年段间隔会触发后端重新计算流向（FAQ 明示"触发后端计算，仅对登录用户开放"），前端只做渲染。
4. **分层缓存**：响应头 `Cache-Control: public, max-age=900, s-maxage=86400` + `ETag` + 自定义 `X-CBDB-Cache-Scope: public-stable`，稳定数据（朝代、省份边界）走 CDN 长缓存。

---

## 3. 技术栈清单

| 层 | 技术 | 用途 |
|---|---|---|
| 框架 | React 19 + Vite | SPA 应用与构建 |
| 2D 地图投影 | **d3-geo（内嵌）** | `geoMercator` 投影、`geoPath` 路径生成 |
| 2D 地图绘制 | **原生 Canvas 2D** | 省份多边形、流线、粒子动画（离屏缓存 + rAF） |
| 3D 引擎 | **Three.js r184**（内嵌单文件分包） | WebGL 场景、墨峰、立体流线 |
| 3D 交互 | OrbitControls（内嵌） | 旋转/缩放/阻尼 |
| 桑基图 | **d3-sankey（内嵌）** | 官宦亲属背景布局 |
| 事件地图 | React SVG + CSS 动画 | 大事件扰动飞线 |
| 图标 | lucide-react | UI 图标 |
| 统计 | 百度统计 hm.js | 站点访问统计 |
| 服务器 | Caddy（Go） | 静态托管 + API 反代 + HTTP/3 |
| 数据源 | CBDB 数据库 | 人物/任官/亲属关系 |
| 边界数据 | 阿里 DataV GeoJSON | 中国省界（100000_full.json） |

**无重型可视化库**：没有使用 ECharts/Mapbox/Leaflet/deck.gl——地图全部是"GeoJSON + 自研投影绘制管线"，这正是该方案轻量可控的核心，也是我们最值得借鉴的部分。

---

## 4. 2D 流场地图实现详解（Canvas 2D + d3-geo）

### 4.1 投影

```js
// d3.geoMercator，center 固定中国中心 [105.5, 36]
const projection = d3.geoMercator()
  .center([105.5, 36])
  .scale(Math.min(w * 1.02, h * 1.62) * zoom)   // 缩放=重算 scale
  .translate([w * 0.52, h * 0.56]);

// 投影返回 null（越界）时回退到包围盒线性映射兜底
// 经纬度范围：lon [73,135], lat [18,54]
```

要点：缩放交互通过**改 scale 不改 translate** 实现"以投影中心为锚点"的缩放，天然稳定。

### 4.2 绘制管线（双层 Canvas）

```
┌─ 背景层（离屏 canvas，数据变更时重绘一次）────┐
│ 1. 米白渐变底色                               │
│ 2. 经纬网（75°–130°E 每10°、20°–50°N 每5°）   │
│ 3. d3.geoPath 画省份面（半透明白填充 #fff 58%）│
│ 4. 省界描边（细灰线 0.8px）                   │
│ 5. 国界描边（深色粗线 1.8px）                 │
│ 6. 城市节点圆点（半径∝√count）+ 名称文字        │
└──────────────────────────────────────────────┘
┌─ 动画层（每帧 rAF，clearRect + drawImage 背景）┐
│ 1. 720 条流线 × 3 层描边（见 4.3）             │
│ 2. 前 360 条流线上的移动粒子（见 4.4）          │
│ 3. 悬停高亮                                   │
└──────────────────────────────────────────────┘
```

**双缓冲是性能关键**：背景层只在数据/缩放变化时重绘，动画帧只叠加动态元素，避免每帧重画几百个多边形。

### 4.3 流线生成（三次贝塞尔）

```js
// 起终点投影后，加"垂直法向偏移"制造弧线弯曲
const normal = { x: -dy/dist, y: dx/dist };        // 垂直单位法向量
const side = hash(`${originId}:${destId}`) % 2 ? 1 : -1;  // 哈希决定弯向（双向流分离）
const bend = clamp(22, 118, dist * 0.2) * side;    // 弯曲幅度 ∝ 距离，钳制 22~118px

// 三次贝塞尔：控制点位于 34% / 66% 处 + 法向偏移
c1x = sx + dx*0.34 + nx*bend;   c1y = sy + dy*0.34 + ny*bend;
c2x = sx + dx*0.66 + nx*bend;   c2y = sy + dy*0.66 + ny*bend;

// 视觉编码
width  = 0.55 + log(count+1)/log(max+1) * 4.6;     // 线宽 ∝ 人数（对数压缩）
alpha  = 0.14 + log(count+1)/log(max+1) * 0.34;
color  = palette8[entryType];                      // 颜色编码入仕方式（8 色调色板）
```

**双向流分离技巧**：用起终点 ID 哈希取模决定弧线向哪边弯，避免"你来我往"的流线完全重叠。

### 4.4 流线动画（粒子沿贝塞尔运动，非虚线）

```js
// 每帧（仅播放中）：
const phase = hash(id) % 1000 / 1000;              // 每条流的相位偏移（错开）
const count = clamp(1, round(人数/总数*5), 4);     // 粒子数 ∝ 人数（1~4个）
const speedFactor = 1400 / max(400, motionSpeed);  // 速度因子（快700/标准1400/慢2600）

// 曲线进度 = 时间驱动，%1 循环
const t = (now * 75e-6 * speedFactor + phase + idx/count) % 1;
const pos = bezierPoint(flow, t);                  // 三次贝塞尔参数方程取点
ctx.arc(pos.x, pos.y, 1.8, 0, 2π); ctx.fill();     // 画移动粒子
```

**结论：流线本体是静态三层描边常驻（发光底 + 渐变主体 + 白芯高光），动画靠小球粒子沿曲线匀速移动实现。** 这是该方案最优雅的设计——静态底 + 少量动态点，成本低、视觉"流动感"强。

### 4.5 悬停交互

鼠标移动 → rAF 节流 → 对前 260 条流线用贝塞尔 23 点采样求最近距离 → 命中 18px 内的流线放大高亮（粒子半径 1.8→3）。

---

## 5. 3D 流场地图实现详解（Three.js r184）

3D 是独立分包（559KB，含完整 Three.js r184 + OrbitControls），`React.lazy` 懒加载，切到 3D 标签才下载执行。业务代码仅约 15KB，全部是"用 Three.js 图元拼装"。

### 5.1 场景构成

```
Scene（背景米白 + Fog 雾化）
├─ 底座：Plane(96×72) 米白噪点纹理 + GridHelper 网格圈
├─ 省界：GeoJSON 环 → THREE.Line 2D 折线（y=0.08，首省深色/其余浅色）
├─ 墨峰：每省 1~2 个自定义锥形 BufferGeometry（y=0 起，高∝样本量）
├─ 山脊：螺旋 CatmullRomCurve3 脊线（红=流入/青=流出/金=均衡）
├─ 流线：CubicBezierCurve3 + TubeGeometry（520 条上限）
├─ 粒子：220 个小球沿流线移动
└─ 标签：CanvasTexture + Sprite（省名，挂在柱顶）
```

### 5.2 墨峰（3D 柱体，高度∝样本量）

**不用内置 CylinderGeometry，而是手写锥形 BufferGeometry**（这是视觉效果的核心）：

```js
function makePeak(baseRadius, height, seed) {
  // 5 层 × 每层 11 个顶点
  // 层高从底到顶 0.88t；半径按 pow(1-level, 1.45) 收尖
  // 每层乘以伪随机扰动 (0.72~1.18) 与正弦起伏 → 有机、手绘感的"墨峰"
  // 顶部封顶点，底部收圆，computeVertexNormals() 平滑法线
}

const norm = log(count+1) / log(max+1);     // 样本量归一化
const radius = 0.42 + norm * 1.02;          // 底半径
const height = 0.86 + norm * 6.8;           // ★高度：样本越多越高
// 大省(>0.34)再加一个次峰，形成双峰造型
```

### 5.3 立体流线（CubicBezierCurve3 + TubeGeometry）

```js
const p1 = project(originLon, originLat, 0.45);   // 投影到3D平面，y=0.45
const p2 = project(destLon, destLat, 0.45);
const dist = p1.distanceTo(p2);
const arc = clamp(3.2, 16, dist * 0.28);          // ★弧高 = 水平距离×0.28
const c1 = p1.clone().lerp(p2, 0.34);  c1.y += arc;  // 控制点抬升
const c2 = p1.clone().lerp(p2, 0.66);  c2.y += arc;
const curve = new THREE.CubicBezierCurve3(p1, c1, c2, p2);
const radius = 0.025 + log(count+1)/log(max+1) * 0.115;  // 粗细∝人数
new THREE.Mesh(
  new THREE.TubeGeometry(curve, 30, radius, 6, false),
  material // MeshStandardMaterial 半透明 0.68，按颜色缓存复用
);
```

### 5.4 3D 流动动画（小球沿曲线移动，无 shader）

```js
// 220 个小球（SphereGeometry 0.18），每帧：
const t = (now * 0.08 * speedFactor + seed) % 1;  // 每粒子 seed 错开相位
ball.position.copy(curve.getPoint(t));            // ★逐帧更新位置
ball.scale.setScalar(0.82 + sin((now + seed*10)*4) * 0.18);  // 脉动呼吸
```

### 5.5 相机与场景

```js
new PerspectiveCamera(42, w/h, 0.1, 240);
orbit.target = (0,0,1);            // 锁定中国中心
orbit.enableDamping = true;        // 阻尼惯性
orbit.enablePan = false;           // 禁平移
orbit.minDistance=42, maxDistance=118;  // 缩放范围
orbit.minPolarAngle=0.55, maxPolarAngle=1.25;  // 俯仰限制
// 场景微倾 rotation.x = -0.06，环境光 + 两盏平行光，雾化米白
```

### 5.6 标签

Canvas 画布（衬线字体 "Noto Serif SC/Songti SC"，米白椭圆底 + 彩色地基色条）→ CanvasTexture → SpriteMaterial（`depthTest:false`，永远朝前）→ Sprite 挂柱顶上方。省名去掉"布政司/行省"后缀，控制文字长度。

---

## 6. 数据层设计

### 6.1 API 端点一览

| 端点 | 参数 | 返回 | 用途 |
|---|---|---|---|
| `/api/dynasties` | — | 朝代数组（id/name/nameChn/startYear/endYear，83 个） | 朝代下拉 |
| `/api/provinces?dynasty=X` | dynasty id | `{dynasty, provinces:[{id,name,lon,lat,count}]}` | 左侧省份列表 + 地图节点 |
| `/api/flow?dynasty=X&provinces=a,b&gap=N` | 朝代/省份/年段间隔 | `{dynasty, provinceFilter, gap, edges:[...]}`（1400 条） | **流场主图数据** |
| `/api/summary?dynasty=X` | 朝代 | `{totals:{cohortCount,withEntry,withPosting,withFlow}, entries:[{label,count}], offices:[...]}` | 样本统计 + 柱状图 |
| `/api/sankey?dynasty=X` | 朝代 | `{nodes:[{id,label,column}], links:[{source,target,value}]}` | 亲属背景桑基图 |
| `/api/lineage/overview` | 朝代/省份 | 家族列表（名称/年代/官职类型/指数） | 官宦世家演进 |
| `/api/settings/access-policy` | — | 访问控制策略 | 登录鉴权 |
| `/api/logs/track` | POST | 204 | 埋点 |

### 6.2 flow 核心数据结构（故事地图可直接复用）

```json
{
  "dynasty": 19,
  "provinceFilter": [],
  "gap": 10,
  "edges": [
    {
      "entryType": "進士類",                    // 类别（前端映射颜色）
      "originProvinceId": 5428,
      "originName": "江西布政司",
      "originLon": 115.898, "originLat": 28.675,  // 起点经纬度
      "destinationProvinceId": 4342,
      "destinationName": "京師",
      "destinationLon": 116.37, "destinationLat": 39.93,
      "decade": 1380,                             // ★时间窗（null=全时段）
      "count": 70,                                // 人数（驱动线宽/柱高）
      "firstYear": null, "lastYear": null
    }
  ]
}
```

**关键设计**：`decade` 字段实现时间维动画——后端按 10 年（可配 gap）聚合，前端切换时间窗即过滤，播放时逐窗推进。`count` 同时驱动线宽、透明度、粒子数、3D 弧线半径。`entryType` 驱动颜色。**这就是"一条边数据管尽 2D/3D 双端渲染"的核心数据契约。**

### 6.3 历史地理数据来源

- 省份节点：CBDB 历史行政区（明代布政司，带实测经纬度，如 浙江布政司 [120.169, 30.294]）
- 地图边界：阿里 DataV 省界 GeoJSON `100000_full.json`（本地 `/geo/china-100000-full.json` 优先，DataV 兜底）——与我们现有方案同源。

---

## 7. 桑基图与事件地图（辅助叙事模块）

### 7.1 亲属背景桑基图（d3-sankey）

内嵌 d3-sankey 布局库，配置 `nodeWidth=20, nodePadding=18×缩放, nodeAlign=自定义(column优先)`，节点分 4 列（祖辈资料→父辈→入仕方式→首任官职）。连线为 SVG path 三次贝塞尔 + `<defs>` 每条 link 一个 linearGradient 渐变（源色→目标色），`mixBlendMode: multiply`。这就是"官宦世家演进"叙事的可视化承载。

### 7.2 大事件仕途扰动地图（纯 SVG）

- 省份：自定义路径串生成器把 GeoJSON 环转成 `"M x y L ... Z"`，React JSX 渲染 `<path class="event-map-region">`，`fillRule=evenodd` 处理嵌套多边形
- 飞线：二次贝塞尔 `M 起点 Q 中点+法向偏移 终点`，双 path（可见芯 + 隐形热区）
- **动画 = CSS stroke-dashoffset 关键帧**（`dynasty_main.css` 中定义，JS 只设置 animationDelay/Duration），前 48 条启用
- 交互：SVG `<g transform="translate+scale">` 锚点缩放 + 拖拽平移

---

## 8. 方案亮点总结（可迁移到【故事地图】系列）

### 8.1 六条可复用的核心设计

1. **静态底 + 动态点双层渲染**：背景（省界/节点/流线本体）离屏缓存，动画层只画移动粒子。性能与视觉兼得，2D/3D 通用。
2. **粒子沿曲线运动 = 流动感**：三次贝塞尔/CubicBezierCurve3 定轨迹，小球逐帧 `getPoint(t)` 取点移动，相位 seed 错开。比"虚线偏移"更有颗粒感，比"逐段生长"更省。
3. **一条 edge 数据契约驱动双端渲染**：`{origin, dest, category, decade, count}` 同时喂 2D canvas、3D Three.js、SVG 事件地图，前端零转换。
4. **时间窗（decade）+ 播放控制**：数据带时间维，10 年一窗自动播放，地图 + 统计 + 桑基图同步联动。
5. **编码语言统一**：线宽/柱高/粒子数 = 人数（对数压缩）；颜色 = 类别（入仕方式）；弧高/弧度 = 距离与哈希。图例文案直接解释编码（"线越粗，人数越多"）。
6. **3D 懒加载分包**：Three.js 559KB 独立 chunk，2D 默认打开，3D 点击才加载——首屏轻、进阶叙事完整。

### 8.2 视觉编码对照表（直接可查）

| 数据维度 | 2D 编码 | 3D 编码 |
|---|---|---|
| 数量（人数） | 线宽 0.55~5.15px（对数）、粒子数 1~4 | Tube 半径 0.025~0.14、粒子数 |
| 类别（入仕方式） | 8 色线色 | 同色系材质 |
| 地区样本量 | 节点圆点半径 ∝ √count | 墨峰高度 ∝ log(count) |
| 流向（入/出/均衡） | 弯向（哈希正负） | 山脊颜色：红入/青出/金均衡 |
| 时间 | decade 窗口推进 | 同左，同步 |

---

## 9. 【故事地图】落地建议

### 9.1 该方案 vs 我们现有 MapLibre 方案

| 维度 | CBDB 仕途流场方案 | 我们现有（MapLibre 长卷方案） |
|---|---|---|
| 渲染引擎 | 自研 canvas/Three.js 投影管线 | MapLibre（瓦片 + 矢量图层） |
| 地图底图 | 纯矢量省界线稿（DataV GeoJSON） | 真地形（DEM relief / 卫星 / 国风画卷） |
| 数据流动画 | 粒子沿贝塞尔曲线（轻量高效） | Marker/图层动画 |
| 2D/3D | 2D canvas + 3D WebGL 双模式 | 2D/Globe 投影切换 |
| 沉浸感 | 商务数据产品风 | 国风沉浸式长卷 |
| 依赖 | 全内嵌，无外部瓦片 | MapLibre v4 IIFE 内联，无瓦片/有瓦片可选 |
| 时间叙事 | decade 播放控件完整 | 手动切换 |

### 9.2 推荐融合路线（故事地图 2.0）

**主视觉**：保留 MapLibre 的地形/国风底图（我们已有的差异化优势），但**把流动动画层换成该方案的"贝塞尔曲线 + 粒子"管线**——用 DOM overlay 或 canvas overlay 叠加在 MapLibre 上，投影坐标经 `map.project()` 转换。这样既保沉浸感，又获得流畅的粒子流动效果。

**双模式**：参照其 2D/3D 切换——2D 用 MapLibre（地形底图 + 流线 overlay），3D 用 Three.js 分包（墨峰 + TubeGeometry 弧线），共享同一份 `edges` JSON 数据契约。

**数据契约**：直接采用 `{origin, dest, category, decade, count}` 结构，客家迁徙的 23 节点/14 路线数据（现有 seed 数据）可无痛映射。

**时间轴**：客家五次大迁徙天然带时间维（中原→闽粤赣），把 decade 播放器移植过来，实现"五迁徙逐次推进"的叙事。

### 9.3 技术取舍建议

- **投影**：如果保持 MapLibre，投影交给引擎；如果做纯内联轻量版，直接用 d3-geo Mercator（参考其 `center [105.5,36] + scale 随 zoom + translate 固定` 的配方）。
- **省界数据**：继续用 DataV GeoJSON + DP 抽稀（我们已有 25240→678 点/22KB 的实践），该站直接用 DataV 全量数据，未做抽稀（其 88 个 path 数据量尚可）。
- **性能**：流线上限 720（2D）/ 520（3D）、粒子 360 / 220——**先合并路径再渲染**（"8 条合并路径"即前端合并同类流向），这个上限经验值可直接采用。
- **后端**：我们做单文件离线交付（双击即开），所以聚合计算应前置到构建期（Python 脚本生成 `edges` JSON），运行时只做前端过滤——比它的"登录后服务端计算"更适合教学演示场景。

---

## 10. 附：逆向分析过程记录（可复现）

1. **抓 HTML**：`curl -s https://dynasty-migration-vis.buyixiao.xyz/` → 识别 Vite 入口 `index-CmVN2lfJ.js`，meta 与 JSON-LD 提供大量语义线索（FAQ 里直接写了 2D/3D 差异、登录策略）。
2. **拆主包**：下载 350KB 主 JS，grep 库名（echarts/mapbox 等均无）→ 发现 `d3`、`geoMercator`、`CanvasRenderingContext2D`、`api/flow` 等特征串 → 定位 API 契约与 2D 绘制函数。
3. **追分包**：主包中 `React.lazy(() => import("./FlowField3D-Dvf8KlOn.js"))` → 下载 559KB → 定位业务代码（文件尾部 15KB）→ 用 Three.js 类名表反向解码别名（`cc`=CubicBezierCurve3、`ar`=TubeGeometry、`Ll`=墨峰生成器）。
4. **实测 API**：curl `/api/dynasties` 拿朝代 id → 依次探 `/api/flow?dynasty=19&gap=10`、`/api/provinces`、`/api/sankey`、`/api/summary`，确认数据结构。
5. **浏览器验证**：builtin_browser 打开站点 → JS 探测 DOM（canvas/SVG 数量、`data-engine="three.js r184"`）→ 截图对比 2D/3D 视觉 → 确认交互细节。
6. **识别后端**：响应头 `Via: 1.1 Caddy` + `X-CBDB-Cache-Scope` 自定义缓存头 → 确认 Caddy 托管与分层缓存策略。

> 提示：该站点 3D 模式在高负载下偶发崩溃（root 清空），分析时建议先暂停动画再截图；其对默认未登录用户只开放"全国 + 明朝"视图，完整参数修改需登录（后端重新聚合），理解数据结构可绕过登录限制直接 curl 公共端点。

---

*文档结束。如需将某部分（如 2D 流线管线、3D 墨峰生成器）抽取为可直接用于【故事地图】的参考代码，请告知。*
