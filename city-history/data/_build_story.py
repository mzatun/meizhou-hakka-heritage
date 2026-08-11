# -*- coding: utf-8 -*-
"""梅州故事层数据构建脚本 v0.4
读取 data/*.json 源数据 + 本文件内的补充素材（新建筑POI/影像链接/城区范围），
输出 prototype/meizhou-story.js（window.MZ_STORY，供 index.html 内联加载）
补充素材来源：
  - 百科文库《梅州古城》（千佛塔/八角亭/状元桥/吕帝庙/安定书室/嘉应古桥/现存城墙30米）
  - 梅州日报《区划变迁》（元朝政区三变/郭沫若题词"文物由来第一流"）
  - 老照片图集（民国梅州/40张老照片/嘉应古城记忆）→ media 字段
"""
import json, os

base = os.path.join(os.path.dirname(__file__))
tl = json.load(open(os.path.join(base,"meizhou_timeline_v2.json"), encoding="utf-8"))
pp = json.load(open(os.path.join(base,"meizhou_people.json"), encoding="utf-8"))["people"]
ev = json.load(open(os.path.join(base,"meizhou_events.json"), encoding="utf-8"))["events"]
wd = json.load(open(os.path.join(base,"meizhou_wards.json"), encoding="utf-8"))

# ================= 补充素材 =================
MEDIA_PHOTO_MZ = [
    {"title":"民国梅州老照片（珍贵影像）","url":"https://www.toutiao.com/article/6754918794411393543/","type":"album"},
    {"title":"40张梅州老照片·古韵今风","url":"https://www.bkwk.cn/article/cysg4zmzlzpqjzxgyjf.html","type":"album"},
    {"title":"梅州珍贵老照片合集","url":"https://zhuanlan.zhihu.com/p/1997475081446782826","type":"album"},
    {"title":"《嘉应古城记忆》百余幅老照片","url":"https://y.meizhou.cn/p/222474.html","type":"album"},
]

EXTRA_POIS = [
    {"id":"bld:qianfota","name":"千佛塔","lon":116.145,"lat":24.305,"year":960,"type":"pagoda","ward":"",
     "desc":"北宋建，梅州现存最古老佛塔","story":"千佛塔始建于北宋初年，为梅州现存最古老的佛教建筑。塔身刻有千尊佛像，故名。历经千年风雨与多次修缮，至今仍矗立于梅州城东，是梅州佛教文化的见证。",
     "source":{"name":"百科文库《梅州古城》","url":"https://www.bkwk.cn/article/txmzqnygyzgcdgjbq-a18626009.html","quote":"北宋：始建千佛塔"}},
    {"id":"bld:bajiaoting","name":"八角亭","lon":116.110,"lat":24.307,"year":1746,"type":"landmark","ward":"",
     "desc":"清乾隆十一年始建，古城地标；梅县第一个中共党支部旧址","story":"八角亭始建于清乾隆十一年（1746），为梅州古城著名地标建筑。八角攒尖、飞檐翘角。近代更成为革命纪念地——1927年梅县第一个中共党支部在此成立，是梅州红色历史的起点之一。",
     "source":{"name":"百科文库《梅州古城》/梅州党史","url":"https://www.bkwk.cn/article/txmzqnygyzgcdgjbq-a18626009.html","quote":"清乾隆十一年（1746年）：始建八角亭"}},
    {"id":"bld:zhuangyuanqiao","name":"状元桥","lon":116.112,"lat":24.306,"year":1700,"type":"bridge","ward":"",
     "desc":"古城文脉之桥","story":"状元桥为梅州古城内古桥，寄托客家崇文重教、望子成龙的期盼。桥名'状元'，与梅州'人文秀区'的文风相呼应。",
     "source":{"name":"百科文库《梅州古城》","url":"https://www.bkwk.cn/article/txmzqnygyzgcdgjbq-a18626009.html","quote":"状元桥"}},
    {"id":"bld:lvdimiao","name":"吕帝庙","lon":116.109,"lat":24.309,"year":1800,"type":"temple","ward":"",
     "desc":"古城道教庙宇","story":"吕帝庙为梅州古城内道教庙宇，供奉吕洞宾。古城庙宇是民间信仰的载体，与客家民俗生活紧密相连。",
     "source":{"name":"百科文库《梅州古城》","url":"https://www.bkwk.cn/article/txmzqnygyzgcdgjbq-a18626009.html","quote":"吕帝庙"}},
    {"id":"bld:andingshushi","name":"安定书室","lon":116.108,"lat":24.310,"year":1800,"type":"academy","ward":"",
     "desc":"古城私塾书室","story":"安定书室是梅州古城内的私塾书室。客家人'再穷不能穷教育'，古城内遍布书室私塾，是'人文秀区'的微观细胞。",
     "source":{"name":"百科文库《梅州古城》","url":"https://www.bkwk.cn/article/txmzqnygyzgcdgjbq-a18626009.html","quote":"安定书室"}},
    {"id":"bld:jiayingguqiao","name":"嘉应古桥","lon":116.113,"lat":24.305,"year":1700,"type":"bridge","ward":"",
     "desc":"古城跨江古桥","story":"嘉应古桥为梅州古城桥梁，见证嘉应州时代城市交通与商贸往来。",
     "source":{"name":"百科文库《梅州古城》","url":"https://www.bkwk.cn/article/txmzqnygyzgcdgjbq-a18626009.html","quote":"嘉应古桥"}},
    {"id":"bld:beimenjie","name":"北门街（老字号街）","lon":116.112,"lat":24.311,"year":1733,"type":"landmark","ward":"",
     "desc":"北门老街·老字号店铺","story":"北门街是嘉应古城北门一带的老街，《嘉应古城记忆》记载街上有众多老字号店铺。北门建有铁汉楼，为纪念刘元城（人称'铁汉'）而名。",
     "source":{"name":"《嘉应古城记忆》书评（掌上梅州）","url":"https://y.meizhou.cn/p/222474.html","quote":"北门街的老字号店铺"}},
    {"id":"bld:meijiangmatou","name":"梅江码头","lon":116.111,"lat":24.303,"year":1733,"type":"wharf","ward":"",
     "desc":"舟楫往来的古城码头","story":"梅江码头是嘉应古城的水上门户，《嘉应古城记忆》描绘其'舟楫往来'的繁华。水运时代，梅江把山城与潮汕、南洋连接起来。",
     "source":{"name":"《嘉应古城记忆》书评（掌上梅州）","url":"https://y.meizhou.cn/p/222474.html","quote":"梅江码头的舟楫往来"}},
    {"id":"bld:meizhouxuegong","name":"梅州学宫（孔庙）","lon":116.111,"lat":24.308,"year":1074,"type":"academy","ward":"laocheng",
     "desc":"北宋建文庙明伦堂；文天祥题'忠孝廉節'","story":"梅州学宫始建于北宋，是梅州古代最高学府。南宋末年文天祥入梅州，亲题'忠孝廉節'四字于学宫。学宫也是明清嘉应州士子科举应试的起点，'人文秀区'的文脉所系。",
     "source":{"name":"梅州市人民政府网·走进梅州","url":"https://www.meizhou.gov.cn/zjmz/index.html","quote":"梅州学宫（孔庙）"}},
    {"id":"bld:jinshanding","name":"金山顶（老城制高点）","lon":116.113,"lat":24.313,"year":1052,"type":"landmark","ward":"laocheng",
     "desc":"宋城墙依山而筑；1929年红四军攻打梅城战斗旧址","story":"金山顶是老城制高点，北宋土城即依山而筑，故有'金山顶'之名。1929年红四军攻打梅城，金山顶为重要战斗旧址。今存'老梅城记忆展'，是回望古城的重要窗口。",
     "source":{"name":"梅州红色地图（图虫）","url":"http://photo.tuchong.com/15898979/f/681646224.jpg","quote":"金山顶：红四军攻打梅城战斗旧址"}},
    {"id":"bld:lingfenglou","name":"凌风路骑楼街","lon":116.111,"lat":24.3075,"year":1930,"type":"landmark","ward":"",
     "desc":"民国骑楼商业街，老城风情街区","story":"凌风路骑楼街形成于民国年间，骑楼建筑兼具南洋风格与客家元素，是老城商业繁荣的见证，亦是华侨回乡投资的产物。今为梅州历史文化街区核心。",
     "source":{"name":"梅州市人民政府网·走进梅州","url":"https://www.meizhou.gov.cn/zjmz/index.html","quote":"凌风路骑楼街"}},
    {"id":"bld:songkou","name":"松口古镇（火船码头）","lon":116.370,"lat":24.440,"year":1890,"type":"wharf","ward":"",
     "desc":"'下南洋'第一港，联合国首个移民纪念项目","story":"松口是客家人'下南洋'的第一站，火船码头见证了数代客家人从这里登船远渡重洋。松口火船码头是联合国教科文组织中国首个移民纪念项目，'千年古镇，百年侨乡'。",
     "source":{"name":"松口火船码头（南方+图）","url":"https://baike.baidu.com/item/%E6%9D%BE%E5%8F%A3%E7%81%AB%E8%88%B9%E7%A0%81%E5%A4%B4/56616862","quote":"客家人'下南洋'第一港"}},
    {"id":"bld:baihuazhou","name":"百花洲（程江梅江间）","lon":116.1065,"lat":24.3045,"year":700,"type":"landmark","ward":"",
     "desc":"'百花洲尾齐洲前，诸生出状元'谶语出处","story":"百花洲在城南六十步，平夷如掌，周回四百步，介梅溪（梅江）程江二水之间。民间谶语'百花洲尾齐洲前，诸生出状元'流传甚广，吸引读书人聚居红杏坊一带。元元统年间水溢洲溃，古洲今已不存，惟名留传。",
     "source":{"name":"梅州日报《嘉应古城舆地考》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"百花洲：城南六十步，平夷如掌，周回四百步，介梅溪程江二水之间。元元统间水溢洲溃"}},
    {"id":"bld:meijiangqiao","name":"梅江桥（1934）","lon":116.112,"lat":24.299,"year":1934,"type":"bridge","ward":"",
     "desc":"跨江发展分界点，华侨捐资建桥","story":"1934年梅江桥建成，跨越南北两岸——这是嘉应古城'跨江发展'的分界点。此前城市在江北老城形成发展，此后江南新城渐次兴起，'一江两岸'由此开端。梅江桥由华侨与乡民捐资建成，是侨乡梅州的城市脊梁。",
     "source":{"name":"梅州日报《嘉应古城舆地考》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"以'1932年启动拆除嘉应古城至1934年建成跨越南北两岸的梅江桥'为分界点"}},
    {"id":"bld:guixing","name":"金龟形制（龟头龟尾双眼）","lon":116.111,"lat":24.3085,"year":1052,"type":"landmark","ward":"laocheng",
     "desc":"古城'如奔江之龟'：龟头南门八角亭，龟尾金山顶，两眼为双井","story":"《刘志》形容梅州城'形如奔江之龟'：龟之头在南门程江出口入梅江交界处（今南门八角亭附近），龟之尾在金山顶梅县图书馆（原观音宫旧址），两眼为两口古井——一在东仓巷与仲元东路交叉路口右侧，一在道前街与仲元西路交叉路口右侧。金龟形制是客家风水观念在古城营建中的绝佳体现。",
     "source":{"name":"梅州日报《嘉应古城舆地考》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"县治辛酉入首，坐坎向离，形如奔江之龟"}},
    {"id":"bld:gengxialou","name":"更楼下（旧县衙遗址）","lon":116.1095,"lat":24.3085,"year":483,"type":"landmark","ward":"",
     "desc":"明洪武二年前县衙所在，曾井之东","story":"更楼下在曾井之东，为明洪武二年之前的程乡县旧县衙所在（土名'更楼下'）。洪武二年知县樊思明迁县治入州治后，旧衙渐废，旧墙厚二尺余，为古城最早的行政中心遗址。",
     "source":{"name":"梅州日报《嘉应古城舆地考》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"明洪武二年知县樊思明'自旧县治迁于州治'。旧县衙在'西城外曾井之东'，土名'更楼下'"}},
    {"id":"bld:yuankuitata","name":"松口元魁塔","lon":116.390,"lat":24.438,"year":1600,"type":"pagoda","ward":"",
     "desc":"'狮象把水口'，下南洋者回望故土之塔","story":"松口元魁塔矗立梅江畔，堪舆家谓其山为'狮象把水口'。下南洋的客家人登船离乡时，元魁塔是最后回望的地标——'船过元魁塔，始觉离家乡'，塔身铭刻着侨乡的离愁与乡愁。",
     "source":{"name":"梅州日报《嘉应古城舆地考》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"松口元魁塔处'堪舆家谓其山为狮象把水口'"}},
]

# POI id → 本地历史图片（images/*.jpg，已下载压缩）
IMG_MAP = {
    "bld:qianfota":     ("images/qianfota.jpg",  "千佛塔（今貌）"),
    "bld:bajiaoting":   ("images/bajiaoting.jpg","八角亭（梅县第一个中共党支部旧址）"),
    "bld:renjinglu":    ("images/renjinglu.jpg", "黄遵宪人境庐"),
    "bld:songkou":      ("images/songkou.jpg",   "松口火船码头"),
    "bld:meizhouxuegong":("images/xuegong.jpg",  "梅州学宫（孔庙）"),
    "bld:jinshanding":  ("images/jinshanding.jpg","金山顶·老梅城记忆展"),
    "bld:lingfenglou":  ("images/qilou.jpg",     "凌风路骑楼老街"),
}

# 城区范围（urbanGrowth 扩展：10 个时间切片，含轮廓坐标）
URBAN_GROWTH = [
    {"year":1052,"areaKm2":0.14,"label":"北宋土城 0.14km²",
     "geom":[[116.1092,24.3073],[116.1128,24.3073],[116.1128,24.3107],[116.1092,24.3107],[116.1092,24.3073]]},
    {"year":1385,"areaKm2":0.67,"label":"明扩城 0.67km²",
     "geom":[[116.1070,24.3053],[116.1150,24.3053],[116.1150,24.3127],[116.1070,24.3127],[116.1070,24.3053]]},
    {"year":1733,"areaKm2":0.9,"label":"嘉应州城 0.9km²",
     "geom":[[116.1065,24.3048],[116.1155,24.3048],[116.1155,24.3132],[116.1065,24.3132],[116.1065,24.3048]]},
    {"year":1818,"areaKm2":0.9,"label":"嘉应州城（人口高峰）",
     "geom":[[116.1065,24.3048],[116.1155,24.3048],[116.1155,24.3132],[116.1065,24.3132],[116.1065,24.3048]]},
    {"year":1911,"areaKm2":1.2,"label":"清末梅州 1.2km²",
     "geom":[[116.1055,24.3040],[116.1170,24.3040],[116.1170,24.3138],[116.1055,24.3138],[116.1055,24.3040]]},
    {"year":1937,"areaKm2":2.64,"label":"梅城镇 2.64km²",
     "geom":[[116.1045,24.3035],[116.1195,24.3035],[116.1195,24.3140],[116.1045,24.3140],[116.1045,24.3035]]},
    {"year":1958,"areaKm2":3.5,"label":"梅城公社 3.5km²",
     "geom":[[116.1020,24.3010],[116.1220,24.3010],[116.1220,24.3160],[116.1020,24.3160],[116.1020,24.3010]]},
    {"year":1978,"areaKm2":6,"label":"县级市 6km²",
     "geom":[[116.0980,24.2970],[116.1280,24.2970],[116.1280,24.3200],[116.0980,24.3200],[116.0980,24.2970]]},
    {"year":1988,"areaKm2":15,"label":"地级市初设 15km²",
     "geom":[[116.0950,24.2950],[116.1350,24.2950],[116.1350,24.3250],[116.0950,24.3250],[116.0950,24.2950]]},
    {"year":2013,"areaKm2":35,"label":"一江两岸 35km²",
     "geom":[[116.0800,24.2800],[116.1480,24.2800],[116.1480,24.3360],[116.0800,24.3360],[116.0800,24.2800]]},
    {"year":2026,"areaKm2":60,"label":"世界客都 60km²",
     "geom":[[116.0700,24.2700],[116.1600,24.2700],[116.1600,24.3450],[116.0700,24.3450],[116.0700,24.2700]]},
]

# 古地名铭牌映射（时间轴 year → 政区名+隶属）
PLACE_NAMES = {
    479:"程乡县",945:"敬州",971:"梅州",1052:"梅州",1276:"梅州",1326:"梅州",1385:"程乡县",
    1673:"程乡县",1678:"程乡县",1733:"嘉應直隸州",1735:"嘉應直隸州",1746:"嘉應直隸州",
    1807:"嘉應府",1818:"嘉應州",1849:"嘉應州",1859:"嘉應州",1912:"梅縣",1930:"梅縣",
    1932:"梅縣",1937:"梅城鎮",1958:"梅城人民公社",1965:"梅縣專區",1978:"梅州市(縣級)",
    1988:"梅州市(地級)",2013:"梅州市",2026:"梅州市",
}

# ================= 组装 =================
pois = []
def push(p):
    if p.get("lon") is not None and p.get("lat") is not None:
        pois.append(p)

# 五门
for g in wd["city_walls"]["gates"]:
    push({"id":"gate:"+g["name"],"name":g["name"]+"（城门）","lon":g["lon"],"lat":g["lat"],
          "year":1385,"type":"gate","ward":"laocheng","icon":"icon-gate",
          "desc":"五门之一：梅州古城墙"+g["name"]+"，位于"+g["location"]+"。",
          "story":"明洪武十八年扩城后五门格局定型。民国21-24年拆城，城门相继拆除。",
          "source":wd["city_walls"]["source"]})
# 坊内建筑
for w in wd["wards"]:
    for b in w["buildings"]:
        push({"id":"bld:"+b["id"],"name":b["name"],"lon":b["lon"],"lat":b["lat"],
              "year":b.get("year",1733),"type":"building","ward":w["id"],
              "icon":"icon-"+("temple" if "寺" in b["name"] else "academy" if "书" in b["name"] or "院" in b["name"] else "landmark"),
              "desc":b.get("note",""),"story":b.get("note",""),"source":w["source"]})
# 人物故里
for p in pp:
    if "home" in p and p["home"].get("lon"):
        push({"id":"person:"+p["id"],"name":p["name"],"lon":p["home"]["lon"],"lat":p["home"]["lat"],
              "year":p.get("birth") or 0,"type":"person","ward":"","icon":"icon-landmark",
              "desc":p["headline"],"story":p["story"],"source":p["source"],"personId":p["id"],
              "media":[{"title":"相关史料","url":p["source"].get("url",""),"type":"photo"}] if p["source"].get("url") else []})
# 事件点
for e in ev:
    g = e.get("geo",{})
    if g.get("type")=="poi" and g.get("lon"):
        push({"id":"event:"+e["id"],"name":e["name"],"lon":g["lon"],"lat":g["lat"],
              "year":e["year"],"type":"event","ward":"","icon":"icon-belltower",
              "desc":"大事记·"+str(e["year"]),"story":e["story"],"source":e["source"]})
# 补充 POI（新建筑）
for p in EXTRA_POIS:
    push(p)

# 城内建筑 POI（依清咸丰《嘉应州城池图》+《嘉应古城舆地考》推定坐标）
IN_CITY_POIS = [
    {"id":"bld:zhoushu","name":"州署（嘉应州衙）","lon":116.111,"lat":24.3087,"year":1733,"type":"building","ward":"laocheng",
     "desc":"州城中枢，'县府居城内中央略偏东北'","story":"嘉应州署为清代州城行政中枢。舆地考载县府居城内中央略偏东北，内有梅山。咸丰城池图中州署位于城中心，是'一州之政'的所在。",
     "source":{"name":"梅州日报《嘉应古城舆地考》/咸丰《嘉应州城池图》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"县府居城内中央略偏东北，内有梅山"}},
    {"id":"bld:chongshishuyuan","name":"崇实书院","lon":116.109,"lat":24.3109,"year":1840,"type":"academy","ward":"laocheng",
     "desc":"城内西北书院（咸丰城池图）","story":"崇实书院见于咸丰《嘉应州城池图》，位于城内西北。与城外东山书院、攀桂书院共同构成嘉应州'崇文重教'的书院网络。",
     "source":{"name":"清咸丰《嘉应州城池图》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"城内西北崇实书院"}},
    {"id":"bld:sandimiao","name":"三帝庙","lon":116.1112,"lat":24.3069,"year":1700,"type":"temple","ward":"laocheng",
     "desc":"城南庙宇（咸丰城池图）","story":"三帝庙见于咸丰《嘉应州城池图》，位于城内南部。古城的民间信仰空间，与吕帝庙等共同构成市民精神生活的场所。",
     "source":{"name":"清咸丰《嘉应州城池图》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"城南三帝庙"}},
    {"id":"bld:chengshoushu","name":"城守署","lon":116.114,"lat":24.3075,"year":1700,"type":"building","ward":"laocheng",
     "desc":"城内东南军事机构（咸丰城池图）","story":"城守署为清代州城驻军机构，见于咸丰《嘉应州城池图》城东南。与北门外守备署共同构成嘉应州的军事防御体系。",
     "source":{"name":"清咸丰《嘉应州城池图》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"城东南城守署"}},
    {"id":"bld:guanglange","name":"观澜阁","lon":116.1146,"lat":24.3061,"year":1700,"type":"building","ward":"laocheng",
     "desc":"城东南角望江楼阁（咸丰城池图）","story":"观澜阁位于城东南角，临梅江而建，'观澜'即观江之波澜。与下南门凌风楼隔墙相望，是古城临江的风景建筑。",
     "source":{"name":"清咸丰《嘉应州城池图》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"东南角观澜阁"}},
    {"id":"bld:jiaochang","name":"教场（演武场）","lon":116.1097,"lat":24.3061,"year":1700,"type":"building","ward":"laocheng",
     "desc":"城西南演武场（咸丰城池图）","story":"教场为清代州城演武操练之地，见于咸丰《嘉应州城池图》城西南。科举与武功并重，教场与学宫一武一文，构成古城的两极。",
     "source":{"name":"清咸丰《嘉应州城池图》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"西南教场"}},
    {"id":"bld:wanshougong","name":"万寿宫","lon":116.1118,"lat":24.3089,"year":1700,"type":"temple","ward":"laocheng",
     "desc":"祝圣朝贺之所（咸丰城池图）","story":"万寿宫为清代朝贺皇帝寿诞之所，见于咸丰《嘉应州城池图》。各州县皆设万寿宫，是清帝国礼制在基层的象征。",
     "source":{"name":"清咸丰《嘉应州城池图》","url":"https://mzrb.meizhou.cn/html/2024-11/14/content_370172.htm","quote":"城内万寿宫"}},
]
for p in IN_CITY_POIS:
    push(p)

# 图标映射补全
ICON_MAP = {"pagoda":"icon-pagoda","tower":"icon-pagoda","academy":"icon-academy","well":"icon-well",
            "archway":"icon-archway","bridge":"icon-bridge","wharf":"icon-wharf","temple":"icon-temple",
            "wall":"icon-wall","tree":"icon-tree","belltower":"icon-belltower"}
for p in pois:
    if not p.get("icon"):
        p["icon"] = ICON_MAP.get(p.get("type"), "icon-landmark")
    # 默认影像链接（老照片图集）
    if not p.get("media"):
        p["media"] = MEDIA_PHOTO_MZ[:2]
    # 本地历史图片（IMG_MAP：内嵌预览）
    if p["id"] in IMG_MAP:
        src, cap = IMG_MAP[p["id"]]
        p["media"] = [{"title": cap, "src": src, "type": "img"}] + p["media"]

# 通用防重叠散开：同格内的 POI 环形分布（radius 0.0028°≈280m，zoom14下约40px可见）
import math
from collections import defaultdict
def scatter(pois, cell=0.0012, radius=0.0028):
    groups = defaultdict(list)
    for p in pois:
        key = (round(p["lon"]/cell), round(p["lat"]/cell))
        groups[key].append(p)
    shifted = 0
    for key, grp in groups.items():
        n = len(grp)
        if n <= 1: continue
        base = grp[0]
        for i, p in enumerate(grp[1:], start=1):
            ang = 2*math.pi*i/n + 0.6
            p["lon"] = round(base["lon"] + radius*math.cos(ang), 5)
            p["lat"] = round(base["lat"] + radius*math.sin(ang), 5)
            shifted += 1
    return pois, shifted
pois, n_shift = scatter(pois)
print("防重叠散开 POI 数:", n_shift)

# AOI（坊巷 + 事件面）
aoi_features = []
for w in wd["wards"]:
    aoi_features.append({"type":"Feature","properties":{
        "id":w["id"],"name":w["name"],"year":w["established"],"type":"ward",
        "stats":json.dumps(w.get("stats",{}),ensure_ascii=False),
        "source":json.dumps(w["source"],ensure_ascii=False),
        "story":w["story"],"oldName":w.get("oldName","")},"geometry":{"type":"Polygon","coordinates":[w["aoi"]["geom"]]}})
for e in ev:
    g = e.get("geo",{})
    if g.get("type")=="aoi" and g.get("geom"):
        aoi_features.append({"type":"Feature","properties":{
            "id":"eventaoi:"+e["id"],"name":e["name"],"year":e["year"],"type":"event",
            "story":e["story"],"source":json.dumps(e["source"],ensure_ascii=False)},"geometry":{"type":"Polygon","coordinates":[g["geom"]]}})

# 城区范围 FeatureCollection（urbanGrowth 面）
urban_features = [{"type":"Feature","properties":{"year":u["year"],"label":u["label"],"areaKm2":u["areaKm2"]},
                   "geometry":{"type":"Polygon","coordinates":[u["geom"]]}} for u in URBAN_GROWTH]

# 人物
people_out = []
for p in pp:
    careers = [{"post":c["post"],"place":c["place"],"lon":c["lon"],"lat":c["lat"]} for c in p.get("career",[])]
    people_out.append({
        "id":p["id"],"name":p["name"],"era":p["era"],"headline":p["headline"],
        "story":p["story"],"source":p["source"],"media":MEDIA_PHOTO_MZ,
        "home":p.get("home",{}),"careers":careers,"kin":p.get("kin",[]),
        "events":p.get("events",[]),"cbdbId":p.get("cbdbId"),
        "birth":p.get("birth"),"death":p.get("death")})

# 县区扩展数据（建置沿革+POI+人文）
counties = json.load(open(os.path.join(base,"meizhou_counties.json"), encoding="utf-8"))["counties"]

story = {
  "version":"0.5","generated":"2026-08-11",
  "aoi":{"type":"FeatureCollection","features":aoi_features},
  "urban":{"type":"FeatureCollection","features":urban_features},
  "urbanGrowth":URBAN_GROWTH,
  "placeNames":PLACE_NAMES,
  "pois":pois,
  "people":people_out,
  "wards":wd["wards"],
  "cityWalls":wd["city_walls"],
  "counties":counties,
  "timelineV2":tl["timeline"]
}

js = ("/* ============================================================\n"
      " * 梅州故事层数据 v0.4（自动生成自 data/_build_story.py，勿手改）\n"
      " * 空间形态：AOI 坊巷面 + POI 点（图标 icon 字段）+ PATH 任官弧线 + urban 城区面\n"
      " * 每条记录含 source{name,url,quote} 可追溯来源 + media 影像链接\n"
      " * ============================================================ */\n"
      "window.MZ_STORY = " + json.dumps(story, ensure_ascii=False, indent=1) + ";\n")
open(os.path.join(base,"..","prototype","meizhou-story.js"),"w",encoding="utf-8").write(js)
print("meizhou-story.js 生成完成")
print("POI 总数:", len(pois), "| AOI:", len(aoi_features), "| urban 面:", len(urban_features), "| 人物:", len(people_out))
print("有 media 的 POI:", sum(1 for p in pois if p.get("media")))
