import json, math

fc = json.load(open("meizhou_rivers.json", encoding="utf-8"))
feats = fc["features"]

MAJOR = {"梅江","程江","韩江","汀江","琴江","宁江","石窟河","梅潭河","五华河","丰良河","松源河","柚树河","漳溪河","黄潭河","周江","蕉州河","隆文河","南琴江","北琴江","潭下河","鹤市河","梅溪河","榕江","枫江"}

def length(f):
    g = f["geometry"]
    if g["type"]=="LineString":
        cs=g["coordinates"]
    elif g["type"]=="Polygon":
        cs=g["coordinates"][0]
    else: return 0
    s=0.0
    for i in range(1,len(cs)):
        dx=cs[i][0]-cs[i-1][0]; dy=cs[i][1]-cs[i-1][1]
        s+=math.hypot(dx,dy)
    return s

out=[]
for f in feats:
    name=f["properties"].get("name","")
    is_major = name in MAJOR
    ln = length(f)
    # 保留：有名字的，或长度>0.02度(约2km)的无名河
    if not name and ln < 0.02:
        continue
    # 降精度到5位小数
    g=f["geometry"]
    if g["type"]=="LineString":
        g["coordinates"]=[[round(c[0],5),round(c[1],5)] for c in g["coordinates"]]
    elif g["type"]=="Polygon":
        g["coordinates"]=[[[round(c[0],5),round(c[1],5)] for c in ring] for ring in g["coordinates"]]
    f["properties"]["major"]=1 if is_major else 0
    out.append(f)

fc2={"type":"FeatureCollection","features":out}
json.dump(fc2, open("meizhou_rivers.json","w",encoding="utf-8"), ensure_ascii=False)
print("筛选后 features:", len(out), "| 文件大小:", __import__("os").path.getsize("meizhou_rivers.json"), "bytes")
maj=[f["properties"]["name"] for f in out if f["properties"]["major"]]
print("主干河流:", sorted(set(maj)))
