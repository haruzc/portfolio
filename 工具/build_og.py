# -*- coding: utf-8 -*-
"""生成分享预览图 assets/og.jpg（1200x630）。

改完姓名/联系方式后跑一次即可：python build_og.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
IMG = os.path.join(SITE, "assets", "img")

W, H = 1200, 630
paper = (243, 241, 236)
ink = (25, 24, 20)
muted = (114, 110, 100)
line = (217, 212, 201)
accent = (184, 71, 44)
light = (154, 149, 138)

FONT_DIR = r"C:\Windows\Fonts"
bold = os.path.join(FONT_DIR, "msyhbd.ttc")
regular = os.path.join(FONT_DIR, "msyh.ttc")
mono = os.path.join(FONT_DIR, "consola.ttf")

canvas = Image.new("RGB", (W, H), paper)
d = ImageDraw.Draw(canvas)
pad = 72

f_name = ImageFont.truetype(bold, 156)
f_role = ImageFont.truetype(regular, 34)
f_small = ImageFont.truetype(regular, 21)
f_mono = ImageFont.truetype(mono, 16)

d.rectangle([(pad, 58), (pad + 42, 61)], fill=accent)
d.text((pad, 74), "PRACTICE  ARCHIVE  —  2026.06–07", font=f_mono, fill=muted)
d.text((pad - 6, 108), "雷啟春", font=f_name, fill=ink)
d.text((pad, 320), "工业设计 / 产品建模与渲染", font=f_role, fill=ink)
d.line([(pad, 392), (W - pad, 392)], fill=line, width=2)
d.text((pad, 418), "17 件产品练习  ·  Rhino 建模  ·  KeyShot 渲染", font=f_small, fill=muted)
d.text((pad, 452), "小家电  /  消费电子  /  设备与工具", font=f_small, fill=muted)
d.text((pad, 486), "正在找工业设计 / 产品设计实习", font=f_small, fill=accent)
d.text((pad, 520), "251009010226@st.sdju.edu.cn   ·   198 4148 3039", font=f_small, fill=muted)
d.text((pad, 560), "LEI QICHUN  ·  INDUSTRIAL DESIGN", font=f_mono, fill=light)

thumbs = ["robot-vacuum", "headphones", "speaker", "sharpener"]
tw, th, gap, top = 196, 147, 10, 96
right = W - pad
for i, slug in enumerate(thumbs):
    path = os.path.join(IMG, slug + "-800.webp")
    if not os.path.exists(path):
        continue
    im = Image.open(path).convert("RGB").resize((tw, th), Image.LANCZOS)
    r, c = divmod(i, 2)
    x = right - (2 - c) * tw - (1 - c) * gap
    y = top + r * (th + gap)
    canvas.paste(im, (x, y))

out = os.path.join(SITE, "assets", "og.jpg")
canvas.save(out, "JPEG", quality=88, optimize=True, progressive=True)
print("saved", out)
