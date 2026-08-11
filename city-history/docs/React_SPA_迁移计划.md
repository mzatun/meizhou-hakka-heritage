# React SPA 迁移计划（仕途流场完整架构）

> 目标：把当前 `prototype/index.html` 单文件原型升级为 React 18 SPA，复用 CBDB 仕途流场的工程化思路，为后续 REST API、Three.js 3D、用户认证和叙事埋点做准备。

---

## 一、当前状态

| 能力 | 当前原型 | React SPA 后 |
|---|---|---|
| 地图引擎 | MapLibre GL JS（单文件） | MapLibre GL JS + `react-map-gl` 或原生 ref |
| 2D/3D 切换 | 函数 `setMode()` | React state + `useEffect` 驱动地图 |
| 时间轴 | DOM slider + 全局 `idx` | React state `yearIdx` |
| 右侧面板 | DOM 操作 | JSX 组件 + props |
| 桑基图 | 纯 SVG 函数 | React 组件 `<SankeyDiagram data={...}/>` |
| 数据 | 内联 `window.MZ_*` | ES modules + 可切换 fetch/API |
| 构建 | 无（双击打开） | Vite + 可部署到静态托管 |

---

## 二、目录结构（建议）

```
prototype-react/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── vendor/maplibre-gl.js
│   ├── vendor/maplibre-gl.css
│   └── fonts/              # 楷体字体（如需离线）
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css           # 国风 CSS 变量与布局
│   ├── components/
│   │   ├── MapPanel.jsx    # MapLibre 容器 + 图层控制
│   │   ├── Timeline.jsx    # 滑块 + 播放
│   │   ├── CityPanel.jsx   # 城市变迁六维卡片
│   │   ├── SankeyPanel.jsx # CBDB 桑基图
│   │   └── ModeBar.jsx     # 2D/3D/聚焦/全景按钮
│   ├── hooks/
│   │   ├── useMap.js       # 地图实例 + 模式切换
│   │   └── useTimeline.js  # 自动播放逻辑
│   └── data/
│       ├── meizhouData.js  # MZ_TIMELINE + MZ_LANDMARKS
│       ├── meizhouGeo.js   # 8 县边界 GeoJSON
│       ├── meizhouRivers.js# OSM 河流 GeoJSON
│       └── meizhouWalls.js # 精确城垣 GeoJSON（配准后）
```

---

## 三、关键技术决策

### 3.1 MapLibre 与 React 结合

推荐**原生 ref 封装**（而非 `react-map-gl`），理由：
- 国风样式自定义深，需要直接操作 layer/filter/extrusion
- 需要频繁 `setData`、`setTerrain`、`setLayoutProperty`
- 当前原型逻辑可直接迁移

`src/hooks/useMap.js` 草案：

```js
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

export function useMap(containerRef, styleCfg) {
  const mapRef = useRef(null);
  useEffect(() => {
    const map = new maplibregl.Map({ container: containerRef.current, ...styleCfg });
    mapRef.current = map;
    return () => map.remove();
  }, []);
  return mapRef;
}
```

### 3.2 时间轴状态提升

`App.jsx` 中：

```js
const [yearIdx, setYearIdx] = useState(3);   // 1052
const [mode, setMode] = useState('2D');
const [tab, setTab] = useState('city');      // city | sankey
```

`useEffect(() => { renderWallLayer(yearIdx); }, [yearIdx, mapRef.current]);`

### 3.3 桑基图组件化

`SankeyPanel.jsx` 接收：

```js
const SANKEY = {
  total: 67,
  nodes: [...],
  links: [...]
};
```

渲染与当前 `renderSankey()` 一致，只是把 DOM 操作改成 JSX/SVG。

### 3.4 后端接口预留（仕途流场模式）

未来可扩展为：

```
GET /api/timeline        -> 时间轴 JSON
GET /api/walls           -> 精确城垣 GeoJSON
GET /api/cbdb-sankey     -> CBDB 科举流动数据
POST /api/feedback       -> 用户埋点
```

本次迁移先**静态 JSON 内联**，接口留好 axios/fetch 调用点即可。

---

## 四、迁移步骤（ checklist ）

- [ ] 1. `npm create vite@latest prototype-react -- --template react`
- [ ] 2. 安装依赖：`maplibre-gl`、`d3-geo`（如后续做 Three.js 弧线）、`vite-plugin-static-copy`（拷贝 vendor）
- [ ] 3. 将 `prototype/` 的 HTML/CSS 迁移到 `src/index.css`
- [ ] 4. 拆分组件：`MapPanel`、`Timeline`、`CityPanel`、`SankeyPanel`、`ModeBar`
- [ ] 5. 迁移 `meizhou-data.js` / `meizhou-geo.js` / `meizhou-rivers.js` / `meizhou-walls-geo.js` 到 `src/data/`
- [ ] 6. 迁移 MapLibre 初始化、图层、2D/3D 切换、DEM 加载逻辑
- [ ] 7. 迁移桑基图 SVG 渲染为 React 组件
- [ ] 8. 加入播放按钮与自动循环
- [ ] 9. 构建并验证 `npm run build` + 本地预览
- [ ] 10. 可选：接入 Node.js REST（Express/Fastify）读取 CBDB SQLite

---

## 五、风险与建议

| 风险 | 说明 | 建议 |
|---|---|---|
| MapLibre 与 React 生命周期冲突 | 多次渲染导致地图重建 | 用 `useRef` 保存实例，仅在卸载时 `remove()` |
| 大体积 GeoJSON 阻塞首屏 | 河流 GeoJSON 731 KB | 按区县拆分或改用 MapLibre `vector` source |
| DEM 瓦片离线不可用 | file:// 打开时 DEM 加载失败 | 3D 模式下检测网络，失败时提示“3D 需联网” |
| 浏览器 WebGL 限制 | headless 截图报错 | 真实浏览器无此问题；测试用 `--use-gl=swiftshader` |

---

## 六、下一步

当前 `prototype/index.html` 已稳定可用。当你确认当前交互/视觉OK后，按上述 checklist 启动 React 迁移。迁移时可复用 90% 以上的现有逻辑，主要是**把 DOM 操作改为 React state + JSX**。
