# -*- coding: utf-8 -*-
"""把 KeyShot 导出的原图批量处理成网页用的图片。

用法：
  1. 原图（.png）放在本文件的上一级目录，和 portfolio 文件夹并列；
     或者改下面的 SRC 指向你的原图目录。
  2. 在 SLUG 里给每张原图指定一个英文短名（决定输出文件名）。
  3. python build_assets.py

输出：assets/img/<slug>-1600.webp 和 <slug>-800.webp（4:3，已裁掉右上角角标）
"""
import json
import os
import glob
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)                       # portfolio 根目录
IMG = os.path.join(SITE, "assets", "img")
SRC = os.path.dirname(SITE)                        # 原图目录（默认与 portfolio 并列）

RIGHT_BLEED = 110  # 裁掉的右边距，用来去掉右上角的截图角标


SLUG = {
    "1.png": "tape",
    "SWITCH.png": "switch",
    "充电枪.png": "ev-charger",
    "卷笔刀.png": "sharpener",
    "吹风机.png": "hair-dryer",
    "咖啡机.png": "vacuum",
    "手部烘干机.png": "hand-dryer",
    "扫地机.png": "robot-vacuum",
    "播放器.png": "speaker",
    "正交.png": "headphones",
    "熨斗.png": "iron",
    "破壁机.png": "blender",
    "筋膜枪.png": "massage-gun",
    "美工刀.png": "knife",
    "路由器.png": "router",
    "路由器白模.png": "router-clay",
    "风扇.png": "fan",
    "鼠标.png": "mouse",
}


def crop_ratio(im, ratio=4 / 3):
    """居中裁到指定比例。"""
    w, h = im.size
    if w / h > ratio:
        target_w = int(round(h * ratio))
        x0 = (w - target_w) // 2
        return im.crop((x0, 0, x0 + target_w, h))
    target_h = int(round(w / ratio))
    y0 = (h - target_h) // 2
    return im.crop((0, y0, w, y0 + target_h))


def main():
    os.makedirs(IMG, exist_ok=True)
    meta = {}
    for path in sorted(glob.glob(os.path.join(SRC, "*.png"))):
        name = os.path.basename(path)
        if name not in SLUG:
            print(f"跳过（SLUG 里没有）：{name}")
            continue
        slug = SLUG[name]
        im = Image.open(path).convert("RGB")

        if slug == "router-clay":
            # 软件视口截图：先裁掉界面元素，再按 16:9
            im = im.crop((165, 45, 2075, 995))
            im = crop_ratio(im, 16 / 9)
        else:
            w, h = im.size
            im = im.crop((0, 0, w - RIGHT_BLEED, h))
            im = crop_ratio(im, 4 / 3)

        big = im.resize((1600, int(round(1600 * im.height / im.width))), Image.LANCZOS)
        small = big.resize((800, int(round(800 * big.height / big.width))), Image.LANCZOS)
        big.save(os.path.join(IMG, slug + "-1600.webp"), "WEBP", quality=84, method=6)
        small.save(os.path.join(IMG, slug + "-800.webp"), "WEBP", quality=82, method=6)

        meta[slug] = {"w": big.width, "h": big.height, "src": name}
        print(f"{name:16s} -> {slug:14s} {big.size}")

    with open(os.path.join(SITE, "assets", "img-meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
    print(f"\n处理完成：{len(meta)} 张")


if __name__ == "__main__":
    main()
