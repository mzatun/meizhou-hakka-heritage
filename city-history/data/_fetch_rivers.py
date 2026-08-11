import urllib.request, json, time

# Meizhou prefecture bbox: west, south, east, north
# 梅州市: 经度约115.3-117.0, 纬度约23.4-25.3
bbox = "23.4,115.3,25.3,117.0"
q = f"""
[out:json][timeout:120];
(
  way["waterway"="river"]({bbox});
  way["waterway"="riverbank"]({bbox});
  relation["waterway"="riverbank"]({bbox});
);
out geom;
"""
url = "https://overpass-api.de/api/interpreter"
data = ("data=" + urllib.parse.quote(q)).encode()
print("Querying Overpass for Meizhou rivers...")
req = urllib.request.Request(url, data=data, headers={"User-Agent":"mazatun-river-fetch/1.0"})
try:
    with urllib.request.urlopen(req, timeout=120) as r:
        raw = json.load(r)
except Exception as e:
    print("Overpass failed:", e)
    raise

print("elements:", len(raw.get("elements", [])))
features = []
for el in raw.get("elements", []):
    if el["type"] != "way" or "geometry" not in el:
        continue
    coords = [[g["lon"], g["lat"]] for g in el["geometry"]]
    if len(coords) < 2:
        continue
    tags = el.get("tags", {})
    name = tags.get("name") or tags.get("name:zh") or ""
    geom_type = "Polygon" if tags.get("waterway")=="riverbank" else "LineString"
    if geom_type == "Polygon":
        # close ring
        if coords[0] != coords[-1]:
            coords = coords + [coords[0]]
        geometry = {"type":"Polygon","coordinates":[coords]}
    else:
        geometry = {"type":"LineString","coordinates":coords}
    features.append({
        "type":"Feature",
        "properties":{"name":name, "waterway":tags.get("waterway",""),"id":el["id"]},
        "geometry":geometry
    })

fc = {"type":"FeatureCollection","features":features}
with open("meizhou_rivers.json","w",encoding="utf-8") as f:
    json.dump(fc, f, ensure_ascii=False)
print("Saved meizhou_rivers.json, features:", len(features))
# 统计有名字的
named = [f["properties"]["name"] for f in features if f["properties"]["name"]]
print("Named rivers:", sorted(set(named)))
