import json
fc = json.load(open("meizhou_rivers.json", encoding="utf-8"))
# 保留：有名字 或 标记为major
out=[f for f in fc["features"] if f["properties"].get("name") or f["properties"].get("major")]
fc2={"type":"FeatureCollection","features":out}
json.dump(fc2, open("meizhou_rivers_curated.json","w",encoding="utf-8"), ensure_ascii=False)
import os
print("精选 features:", len(out), "| 大小:", os.path.getsize("meizhou_rivers_curated.json"), "bytes")
# 转为内联 JS
with open("meizhou_rivers_curated.json",encoding="utf-8") as f:
    txt=f.read()
with open("meizhou-rivers.js","w",encoding="utf-8") as f:
    f.write("window.MEIZHOU_RIVERS = "+txt+";")
print("meizhou-rivers.js 大小:", os.path.getsize("meizhou-rivers.js"), "bytes")
