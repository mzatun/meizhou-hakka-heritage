/* ============================================================
 * 梅州城垣精确化 GeoJSON 占位文件
 * 说明：待拿到《嘉应州志》城池图 / 民国老地图并完成地理配准后，
 *       将配准导出的 GeoJSON FeatureCollection 替换下面的内容。
 * 格式约定：
 *   - 每个 Feature 代表一个时间切片或一个要素（城墙/城门/街坊）
 *   - properties.year: 该要素对应的年份（用于时间轴高亮）
 *   - properties.material: 土城 / 砖城 / 旧城墙拆除 / 现代城区
 *   - properties.layer: wall / gate / ward / water / city_modern
 *   - 坐标系：WGS84 (EPSG:4326)，与现有 GeoJSON 一致
 * ============================================================ */
window.MZ_WALLS_GEO = {
  type: "FeatureCollection",
  features: [
    // 示例：北宋土城（精确配准后替换坐标）
    // {
    //   type: "Feature",
    //   properties: {
    //     year: 1052,
    //     name: "北宋土城",
    //     material: "土城",
    //     layer: "wall",
    //     perimeterM: 1499,
    //     gates: 4,
    //     source: "乾隆嘉应州志·城池图（待配准）"
    //   },
    //   geometry: {
    //     type: "Polygon",
    //     coordinates: [ [ [116.1092,24.3073], [116.1128,24.3073], [116.1128,24.3107], [116.1092,24.3107], [116.1092,24.3073] ] ]
    //   }
    // }
  ]
};
