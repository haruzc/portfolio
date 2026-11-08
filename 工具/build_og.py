# -*- coding: utf-8 -*-
"""生成分享预览图 assets/og.jpg（1200x630）。

改完姓名/项目后跑一次即可：python build_og.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
IMG = os.path.join(SITE, "assets", "img")

W, H = 1200, 630
paper = (243, 241, 236)
ink = (25, 24, 20)
muted = (96, 92, 83)
line = (217, 212, 201)
accent = (184, 71, 44)
light = (145, 140, 130)

FONT = r"C:\Windows\Fonts"
bold = os.path.join(FONT, "msyhbd.ttc")
regular = os.path.join(FONT, "msyh.ttc")
mono_path = os.path.join(FONT, "consola.ttf")

canvas = Image.new("RGB", (W, H), paper)
d = ImageDraw.Draw(canvas)
pad = 72

f_name = ImageFont.truetype(bold, 132)
f_role = ImageFont.truetype(regular, 29)
f_text = ImageFont.truetype(regular, 19)
f_mono = ImageFont.truetype(mono_path, 15)

# 左侧文字
d.rectangle([(pad, 56), (pad + 42, 59)], fill=accent)
d.text((pad, 70), "PORTFOLIO  —  2026", font=f_mono, fill=muted)
d.text((pad - 5, 108), "雷啟春", font=f_name, fill=ink)
d.text((pad, 280), "工业设计 / 产品建模与渲染", font=f_role, fill=ink)

d.line([(pad, 342), (W - pad, 342)], fill=line, width=2)

d.text((pad, 362), "智能眼镜设计项目：草图 · 结构 · 渲染 · 场景", font=f_text, fill=muted)
d.text((pad, 392), "30+ 件产品建模与渲染练习", font=f_text, fill=muted)
d.text((pad, 428), "正在找工业设计 / 产品设计实习", font=f_text, fill=accent)
d.text((pad, 474), "251009010226@st.sdju.edu.cn   ·   198 4148 3039", font=f_text, fill=muted)
d.text((pad, 518), "LEI QICHUN  ·  INDUSTRIAL DESIGN  ·  SHANGHAI", font=f_mono, fill=light)

# 右侧 2x2 项目图
thumbs = ["proj-sketch-1", "proj-render-2", "proj-wear", "proj-scene"]
tw, th, gap = 222, 148, 8
block_w = tw * 2 + gap
left = W - pad - block_w
top = 96
for i, slug in enumerate(thumbs):
    path = os.path.join(IMG, slug + "-800.webp")
    if not os.path.exists(path):
        continue
    im = Image.open(path).convert("RGB")
    # 居中裁成 3:2
    ratio = tw / th
    w, h = im.size
    if w / h > ratio:
        nw = int(h * ratio)
        im = im.crop(((w - nw) // 2, 0, (w + nw) // 2, h))
    else:
        nh = int(w / ratio)
        im = im.crop((0, (h - nh) // 2, w, (h + nh) // 2))
    im = im.resize((tw, th), Image.LANCZOS)
    r, c = divmod(i, 2)
    x = left + c * (tw + gap)
    y = top + r * (th + gap)
    canvas.paste(im, (x, y))

out = os.path.join(SITE, "assets", "og.jpg")
canvas.save(out, "JPEG", quality=88, optimize=True, progressive=True)
print("saved", out)
