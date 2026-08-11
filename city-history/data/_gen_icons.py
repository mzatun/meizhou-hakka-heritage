# -*- coding: utf-8 -*-
"""梅州故事地图 · 国风古城元素 PNG 图标集生成器
风格：宣纸色圆形底 + 朱砂/墨色线刻简化图形 + 金色描边（印章/线刻风）
输出：prototype/icons/*.png（128x128 透明背景 PNG）
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "..", "prototype", "icons")
os.makedirs(OUT, exist_ok=True)
S = 128

ZHU   = (156, 47, 27, 255)      # 朱砂
ZHU_D = (120, 32, 16, 255)      # 深朱砂
INK   = (63, 50, 32, 255)       # 墨色
INK_S = (107, 90, 62, 255)      # 淡墨
GOLD  = (189, 154, 85, 255)     # 金
PAPER = (246, 239, 224, 235)    # 宣纸（半透明）
WATER = (91, 138, 166, 255)     # 水色

def font(size):
    for p in (r"C:\Windows\Fonts\msyh.ttc", r"C:\Windows\Fonts\simhei.ttf",
              r"C:\Windows\Fonts\simsun.ttc"):
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except Exception: pass
    return ImageFont.load_default()

def new_canvas():
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    return img, d

def paper_circle(d, cx, cy, r, fill=PAPER, outline=GOLD, width=3):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill, outline=outline, width=width)

def save(img, name):
    img.save(os.path.join(OUT, name + ".png"))
    print("  ✓", name + ".png")

# ---------- 1. 城门（双檐城楼） ----------
img, d = new_canvas(); cx, cy = 64, 66; r = 52
paper_circle(d, cx, cy, r)
# 城墙基座
d.rectangle([cx-38, cy+18, cx+38, cy+34], fill=ZHU, outline=INK, width=2)
# 拱门
d.arc([cx-16, cy-6, cx+16, cy+34], 0, 180, fill=ZHU_D, width=4)
d.rectangle([cx-16, cy+20, cx+16, cy+34], fill=ZHU_D)
# 城楼主体
d.rectangle([cx-30, cy-14, cx+30, cy+6], fill=INK, outline=GOLD, width=2)
# 双檐顶
d.polygon([(cx-42, cy-8), (cx, cy-30), (cx+42, cy-8)], fill=ZHU, outline=INK, width=2)
d.polygon([(cx-32, cy-18), (cx, cy-38), (cx+32, cy-18)], fill=ZHU_D, outline=INK, width=2)
# 脊线
d.line([(cx, cy-38), (cx, cy-14)], fill=INK, width=2)
save(img, "icon-gate")

# ---------- 2. 塔（千佛塔·多层佛塔） ----------
img, d = new_canvas(); cx, cy = 64, 62; r = 52
paper_circle(d, cx, cy, r)
# 塔基
d.rectangle([cx-22, cy+24, cx+22, cy+32], fill=INK_S, outline=INK, width=2)
# 塔身三层（由下而上收窄）
for i, (w, h, yy) in enumerate([(20, 16, 14), (16, 14, 0), (12, 12, -14)]):
    d.rectangle([cx-w, cy+yy, cx+w, cy+yy+h], fill=ZHU if i % 2 == 0 else INK,
                outline=GOLD, width=2)
    d.line([(cx, cy+yy+2), (cx, cy+yy+h-2)], fill=GOLD, width=1)
# 塔刹
d.polygon([(cx, cy-32), (cx-6, cy-22), (cx+6, cy-22)], fill=ZHU_D, outline=INK, width=2)
d.line([(cx, cy-40), (cx, cy-32)], fill=INK, width=2)
d.ellipse([cx-3, cy-44, cx+3, cy-38], fill=GOLD)
save(img, "icon-pagoda")

# ---------- 3. 书院/学宫（书卷+屋宇） ----------
img, d = new_canvas(); cx, cy = 64, 66; r = 52
paper_circle(d, cx, cy, r)
# 屋宇
d.polygon([(cx-38, cy+16), (cx, cy-8), (cx+38, cy+16)], fill=ZHU, outline=INK, width=2)
d.rectangle([cx-26, cy+16, cx+26, cy+32], fill=PAPER, outline=INK, width=2)
d.line([(cx-26, cy+16), (cx-26, cy+32)], fill=INK, width=2)
d.line([(cx, cy+16), (cx, cy+32)], fill=INK, width=2)
# 书卷
d.rectangle([cx-20, cy-30, cx+20, cy-12], fill=PAPER, outline=INK, width=2)
d.arc([cx-20, cy-34, cx+20, cy-2], 200, 340, fill=INK_S, width=3)
d.line([(cx-8, cy-24), (cx-8, cy-12)], fill=GOLD, width=2)
d.line([(cx+2, cy-24), (cx+2, cy-12)], fill=GOLD, width=2)
d.line([(cx+12, cy-24), (cx+12, cy-12)], fill=GOLD, width=2)
save(img, "icon-academy")

# ---------- 4. 古井（井口+井架） ----------
img, d = new_canvas(); cx, cy = 64, 66; r = 52
paper_circle(d, cx, cy, r)
# 井台
d.ellipse([cx-26, cy-8, cx+26, cy+28], fill=INK_S, outline=INK, width=3)
d.ellipse([cx-18, cy, cx+18, cy+20], fill=WATER, outline=INK_S, width=2)
d.arc([cx-14, cy+2, cx+14, cy+18], 180, 360, fill=INK, width=3)
# 井架
d.line([(cx-22, cy-30), (cx-22, cy+2)], fill=INK, width=4)
d.line([(cx+22, cy-30), (cx+22, cy+2)], fill=INK, width=4)
d.line([(cx-22, cy-30), (cx+22, cy-30)], fill=INK, width=4)
d.line([(cx+22, cy-30), (cx+22, cy-44)], fill=INK, width=3)
d.line([(cx+22, cy-44), (cx-22, cy-44)], fill=INK, width=3)
d.line([(cx-22, cy-44), (cx-6, cy-34)], fill=GOLD, width=3)
save(img, "icon-well")

# ---------- 5. 牌坊/坊表 ----------
img, d = new_canvas(); cx, cy = 64, 64; r = 52
paper_circle(d, cx, cy, r)
# 立柱
d.rectangle([cx-38, cy-26, cx-30, cy+34], fill=ZHU, outline=INK, width=2)
d.rectangle([cx+30, cy-26, cx+38, cy+34], fill=ZHU, outline=INK, width=2)
d.rectangle([cx-8, cy-16, cx+8, cy+34], fill=ZHU, outline=INK, width=2)
# 横梁
d.rectangle([cx-40, cy-30, cx+40, cy-20], fill=ZHU_D, outline=INK, width=2)
d.rectangle([cx-44, cy-38, cx+44, cy-28], fill=INK, outline=GOLD, width=2)
# 坊名框
d.rectangle([cx-18, cy-26, cx+18, cy-6], fill=PAPER, outline=INK, width=2)
d.text((cx, cy-16), "坊", fill=ZHU, font=font(16), anchor="mm")
# 翼角
d.polygon([(cx-44, cy-38), (cx-52, cy-34), (cx-44, cy-32)], fill=ZHU_D)
d.polygon([(cx+44, cy-38), (cx+52, cy-34), (cx+44, cy-32)], fill=ZHU_D)
save(img, "icon-archway")

# ---------- 6. 桥（拱桥） ----------
img, d = new_canvas(); cx, cy = 64, 66; r = 52
paper_circle(d, cx, cy, r)
# 水面
d.arc([cx-46, cy-30, cx+46, cy+34], 200, 340, fill=WATER, width=2)
# 拱桥
d.arc([cx-40, cy-6, cx+40, cy+44], 180, 360, fill=ZHU, width=6)
d.arc([cx-24, cy+8, cx+24, cy+40], 180, 360, fill=INK_S, width=4)
# 桥栏
d.line([(cx-40, cy+6), (cx+40, cy+6)], fill=INK, width=3)
d.line([(cx-8, cy+16), (cx-8, cy+6)], fill=INK, width=2)
d.line([(cx+8, cy+16), (cx+8, cy+6)], fill=INK, width=2)
# 桥亭
d.polygon([(cx-10, cy-14), (cx, cy-26), (cx+10, cy-14)], fill=ZHU_D, outline=INK, width=2)
save(img, "icon-bridge")

# ---------- 7. 码头（舟楫+水波） ----------
img, d = new_canvas(); cx, cy = 64, 66; r = 52
paper_circle(d, cx, cy, r)
# 水波
for i, y in enumerate([30, 40, 48]):
    d.arc([cx-42+i*6, y, cx+42-i*6, y+14], 20, 160, fill=WATER, width=2)
# 船身
d.polygon([(cx-34, cy-2), (cx+34, cy-2), (cx+26, cy+18), (cx-26, cy+18)],
          fill=ZHU, outline=INK, width=2)
# 船舱
d.rectangle([cx-10, cy-16, cx+10, cy-2], fill=PAPER, outline=INK, width=2)
# 桅帆
d.line([(cx+2, cy-40), (cx+2, cy-16)], fill=INK, width=3)
d.polygon([(cx+2, cy-38), (cx+26, cy-22), (cx+2, cy-14)], fill=PAPER, outline=INK, width=2)
save(img, "icon-wharf")

# ---------- 8. 祠庙/寺庙（山墙+飞檐） ----------
img, d = new_canvas(); cx, cy = 64, 68; r = 52
paper_circle(d, cx, cy, r)
# 主体
d.rectangle([cx-32, cy-2, cx+32, cy+30], fill=ZHU, outline=INK, width=2)
# 山墙（人字顶）
d.polygon([(cx-42, cy-2), (cx, cy-34), (cx+42, cy-2)], fill=INK, outline=GOLD, width=2)
# 飞檐
d.polygon([(cx-42, cy-2), (cx-50, cy-8), (cx-42, cy-8)], fill=ZHU_D)
d.polygon([(cx+42, cy-2), (cx+50, cy-8), (cx+42, cy-8)], fill=ZHU_D)
# 门
d.arc([cx-10, cy+2, cx+10, cy+22], 0, 180, fill=ZHU_D, width=3)
d.rectangle([cx-10, cy+12, cx+10, cy+30], fill=ZHU_D)
# 窗
d.ellipse([cx-22, cy+8, cx-14, cy+16], fill=PAPER, outline=INK, width=1)
d.ellipse([cx+14, cy+8, cx+22, cy+16], fill=PAPER, outline=INK, width=1)
save(img, "icon-temple")

# ---------- 9. 城墙遗址（城垛） ----------
img, d = new_canvas(); cx, cy = 64, 70; r = 52
paper_circle(d, cx, cy, r)
# 墙体
d.rectangle([cx-40, cy, cx+40, cy+30], fill=INK_S, outline=INK, width=3)
d.rectangle([cx-40, cy+14, cx+40, cy+20], fill=ZHU)
# 城垛
for i, x in enumerate(range(cx-38, cx+40, 12)):
    if i % 2 == 0:
        d.rectangle([x, cy-12, x+7, cy], fill=INK_S, outline=INK, width=2)
# 坍塌缺口
d.rectangle([cx+14, cy, cx+26, cy+14], fill=(0,0,0,0))
d.line([(cx+14, cy), (cx+14, cy+14)], fill=INK_S, width=2)
d.line([(cx+26, cy), (cx+26, cy+14)], fill=INK_S, width=2)
d.line([(cx+14, cy+14), (cx+26, cy+14)], fill=INK_S, width=2)
# 垛顶连线
d.line([(cx-40, cy-12), (cx+40, cy-12)], fill=INK, width=2)
save(img, "icon-wall")

# ---------- 10. 古树 ----------
img, d = new_canvas(); cx, cy = 64, 70; r = 52
paper_circle(d, cx, cy, r)
# 树冠
for ox, oy, rr in [(-16, -10, 18), (14, -14, 16), (0, -26, 20), (22, 2, 12), (-22, 4, 12)]:
    d.ellipse([cx+ox-rr, cy+oy-rr, cx+ox+rr, cy+oy+rr], fill=(46, 84, 62, 235), outline=INK, width=2)
# 树干
d.rectangle([cx-5, cy-6, cx+5, cy+32], fill=INK_S, outline=INK, width=2)
d.polygon([(cx-5, cy-6), (cx-18, cy+22), (cx-5, cy+22)], fill=INK_S, outline=INK, width=2)
d.polygon([(cx+5, cy-6), (cx+18, cy+22), (cx+5, cy+22)], fill=INK_S, outline=INK, width=2)
save(img, "icon-tree")

# ---------- 11. 地标（印章“标”） ----------
img, d = new_canvas(); cx, cy = 64, 64; r = 52
paper_circle(d, cx, cy, r)
d.rectangle([cx-30, cy-30, cx+30, cy+30], fill=ZHU, outline=GOLD, width=3)
d.text((cx, cy), "标", fill=(250, 246, 231, 255), font=font(34), anchor="mm")
save(img, "icon-landmark")

# ---------- 12. 钟鼓楼/敌楼 ----------
img, d = new_canvas(); cx, cy = 64, 66; r = 52
paper_circle(d, cx, cy, r)
d.rectangle([cx-26, cy-4, cx+26, cy+28], fill=INK, outline=GOLD, width=2)
d.ellipse([cx-16, cy-14, cx+16, cy+18], fill=ZHU, outline=GOLD, width=2)
d.ellipse([cx-8, cy-8, cx+8, cy+8], fill=GOLD)
d.polygon([(cx-34, cy-6), (cx, cy-32), (cx+34, cy-6)], fill=ZHU, outline=INK, width=2)
d.line([(cx, cy-32), (cx, cy-6)], fill=INK, width=2)
save(img, "icon-belltower")

print("图标集生成完毕 →", OUT)
