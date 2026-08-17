/* 梅州城垣精确化 GeoJSON v0.1（2026-08-17）
 * 依据：《光绪嘉应州志》卷九城池志 + 卷首城池圖 + 现代锚点推演
 * 精度：示意級推演（配準v0.1），待考古實測點替換
 * 坐标系：WGS84 (EPSG:4326)
 */
window.MZ_WALLS_GEO = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "year": 1052,
        "name": "北宋土城",
        "material": "土城",
        "layer": "wall",
        "perimeterM": 1499,
        "gates": 4,
        "source": "《光绪嘉应州志》卷九城池志+卷首城池圖（配準v0.1示意）"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              116.1065,
              24.3113
            ],
            [
              116.1095,
              24.3115
            ],
            [
              116.1095,
              24.3083
            ],
            [
              116.1065,
              24.3083
            ],
            [
              116.1065,
              24.3113
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "year": 1385,
        "name": "明磚城",
        "material": "磚城",
        "layer": "wall",
        "perimeterM": 3513,
        "gates": 5,
        "source": "《光绪嘉应州志》卷九城池志+卷首城池圖（配準v0.1示意）"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              116.1056,
              24.3113
            ],
            [
              116.11,
              24.3131
            ],
            [
              116.1135,
              24.3139
            ],
            [
              116.1159,
              24.3119
            ],
            [
              116.1164,
              24.3095
            ],
            [
              116.1159,
              24.3066
            ],
            [
              116.109,
              24.3061
            ],
            [
              116.1061,
              24.3064
            ],
            [
              116.1056,
              24.3086
            ],
            [
              116.1056,
              24.3113
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "year": 1385,
        "name": "東門",
        "layer": "gate",
        "material": "城門",
        "source": "卷九城池志（五門皆有樓）"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          116.1162,
          24.3096
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "year": 1385,
        "name": "西門",
        "layer": "gate",
        "material": "城門",
        "source": "卷九城池志（五門皆有樓）"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          116.1057,
          24.3086
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "year": 1385,
        "name": "老南門",
        "layer": "gate",
        "material": "城門",
        "source": "卷九城池志（五門皆有樓）"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          116.109,
          24.3062
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "year": 1385,
        "name": "下南門",
        "layer": "gate",
        "material": "城門",
        "source": "卷九城池志（五門皆有樓）"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          116.112,
          24.3062
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "year": 1385,
        "name": "北門",
        "layer": "gate",
        "material": "城門",
        "source": "卷九城池志（五門皆有樓）"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          116.111,
          24.3138
        ]
      }
    }
  ]
};
