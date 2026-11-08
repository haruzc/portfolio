# -*- coding: utf-8 -*-
"""把原图批量处理成网页用的图片（作品集 v2）。

目录约定（本文件在 portfolio/工具/ 下）：
  ../..                       ← 素材根目录（含下面三个文件夹和 PDF）
    模型练习/*.png            白模视口截图
    初步渲染/*.png            棚拍渲染 + 场景合成（Snipaste 截图）
    初步渲染/场景图.png        眼镜场景大图
    ai辅助渲染/*.png           AI 辅助场景
    作品集的尝试与制作.pdf     眼镜项目图（脚本会从 PDF 里抽图）
  ..                         ← portfolio 根目录

输出：portfolio/assets/img/<slug>-1600.webp + -800.webp

用法：python build_assets.py
"""
import glob
import io
import json
import os
import re

from PIL import Image, ImageCms

Image.MAX_IMAGE_PIXELS = None  # 展板原图是 9933x12862


def load_cmyk_as_srgb(path, target_w=1800):
    """展板是 CMYK + Japan Color 2001 Coated，必须按 ICC 转 sRGB，否则会发绿。"""
    im = Image.open(path)
    icc = im.info.get("icc_profile")
    if im.width > target_w:
        im = im.resize((target_w, int(round(target_w * im.height / im.width))), Image.LANCZOS)
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        dst = ImageCms.createProfile("sRGB")
        return ImageCms.profileToProfile(im, src, dst, outputMode="RGB", renderingIntent=0)
    return im.convert("RGB")

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
IMG = os.path.join(SITE, "assets", "img")
ROOT = os.path.dirname(SITE)
PDF_PATH = os.path.join(ROOT, "作品集的尝试与制作.pdf")
PDF_IMG = os.path.join(SITE, "工具", "_pdf-img")

RIGHT_BLEED = 110   # 去掉右上角截图角标
LEFT_TRIM = 46      # 去掉左侧界面边缘
EDGE_TRIM = 4       # 去掉上下 1px 暗框

RENDER_MAP = {
    "充电枪.png": "rc-ev-charger",
    "卷笔刀.png": "rc-sharpener",
    "吹风机.png": "rc-hair-dryer",
    "咖啡机.png": "rc-vacuum",
    "手部烘干机.png": "rc-hand-dryer",
    "扫地机.png": "rc-robot-vacuum",
    "正交.png": "rc-headphones",
    "熨斗.png": "rc-iron",
    "破壁机.png": "rc-blender",
    "筋膜枪.png": "rc-massage-gun",
    "美工刀.png": "rc-knife",
    "路由器.png": "rc-router",
}

SCENE_MAP = {
    "Snipaste_2026-11-08_18-42-42.png": "sc-mouse",
    "Snipaste_2026-11-08_18-44-57.png": "sc-speaker",
    "Snipaste_2026-11-08_18-45-39.png": "sc-tape",
}

AI_MAP = {
    "Snipaste_2026-11-08_18-43-10.png": "ai-robot-vacuum",
    "Snipaste_2026-11-08_18-43-34.png": "ai-blender",
    "Snipaste_2026-11-08_18-44-07.png": "ai-sharpener",
    "Snipaste_2026-11-08_18-44-34.png": "ai-ev-charger",
    "Snipaste_2026-11-08_18-45-19.png": "ai-switch",
}

CLAY_MAP = {
    "SWITCH白模.png": "clay-switch",
    "充电枪白模.png": "clay-ev-charger",
    "吹风机白模.png": "clay-hair-dryer",
    "咖啡机白模.png": "clay-vacuum",
    "头戴式耳机白膜.png": "clay-headphones",
    "奶瓶.png": "clay-bottle",
    "扫地机白模.png": "clay-robot-vacuum",
    "播放器白模e.png": "clay-speaker",
    "榨汁机白模.png": "clay-juicer",
    "涂改带白模.png": "clay-tape",
    "筋膜枪白模.png": "clay-massage-gun",
    "路由器白模.png": "clay-router",
    "风扇白模.png": "clay-fan",
    "鼠标白模.png": "clay-mouse",
}

# PDF 里抽出的图按尺寸对应项目图
PROJECT_MAP = {
    "1810x1224": "proj-sketch-1",
    "1431x1216": "proj-sketch-2",
    "1459x1196": "proj-sketch-3",
    "894x247": "proj-wire-1",
    "796x718": "proj-wire-2",
    "2234x1540": "proj-clay",
    "2735x1204": "proj-render-1",
    "2218x1048": "proj-render-2",
    "2400x1678": "proj-render-3",
    "2400x1350": "proj-detail",
    "819x1045": "proj-wear",
    "1099x600": "proj-run",
    "1094x819": "proj-table",
    "2800x1730": "proj-scene",
}


def crop_ratio(im, ratio):
    w, h = im.size
    if w / h > ratio:
        tw = int(round(h * ratio))
        x = (w - tw) // 2
        return im.crop((x, 0, x + tw, h))
    th = int(round(w / ratio))
    y = (h - th) // 2
    return im.crop((0, y, w, y + th))


def save_pair(im, slug, max_w=1600):
    if im.width > max_w:
        im = im.resize((max_w, int(round(max_w * im.height / im.width))), Image.LANCZOS)
    small = im.resize((800, int(round(800 * im.height / im.width))), Image.LANCZOS)
    im.save(os.path.join(IMG, slug + "-1600.webp"), "WEBP", quality=85, method=6)
    small.save(os.path.join(IMG, slug + "-800.webp"), "WEBP", quality=82, method=6)
    print(f"  {slug:20s} {im.width}x{im.height}")


def extract_pdf_images():
    """把 PDF 里的 JPEG 图抽到 _pdf-img。"""
    os.makedirs(PDF_IMG, exist_ok=True)
    if not os.path.exists(PDF_PATH):
        print("没找到 PDF，跳过项目图")
        return
    data = open(PDF_PATH, "rb").read()
    n = 0
    for m in re.finditer(rb"stream\r?\n", data):
        start = m.end()
        end = data.find(b"endstream", start)
        if end == -1:
            continue
        header = data[max(0, m.start() - 1200):m.start()]
        if b"/DCTDecode" not in header:
            continue
        body = data[start:end]
        j = body.find(b"\xff\xd8\xff")
        k = body.rfind(b"\xff\xd9")
        if j == -1 or k == -1 or k - j < 20000:
            continue
        wm = re.search(rb"/Width\s+(\d+)", header)
        hm = re.search(rb"/Height\s+(\d+)", header)
        if not wm or not hm:
            continue
        n += 1
        key = f"{int(wm.group(1))}x{int(hm.group(1))}"
        fn = os.path.join(PDF_IMG, f"img{n:02d}_{key}.jpg")
        open(fn, "wb").write(body[j:k + 2])
    print(f"PDF 抽图 {n} 张")


def main():
    os.makedirs(IMG, exist_ok=True)
    meta = {}

    print("棚拍渲染：")
    for name, slug in RENDER_MAP.items():
        path = os.path.join(ROOT, "初步渲染", name)
        if not os.path.exists(path):
            continue
        im = Image.open(path).convert("RGB")
        w, h = im.size
        im = im.crop((LEFT_TRIM, EDGE_TRIM, w - RIGHT_BLEED, h - EDGE_TRIM))
        im = crop_ratio(im, 4 / 3)
        save_pair(im, slug)
        meta[slug] = "render"

    print("场景合成：")
    for name, slug in SCENE_MAP.items():
        path = os.path.join(ROOT, "初步渲染", name)
        if os.path.exists(path):
            save_pair(crop_ratio(Image.open(path).convert("RGB"), 4 / 3), slug)
            meta[slug] = "scene"

    print("AI 辅助：")
    for name, slug in AI_MAP.items():
        path = os.path.join(ROOT, "ai辅助渲染", name)
        if os.path.exists(path):
            save_pair(crop_ratio(Image.open(path).convert("RGB"), 4 / 3), slug)
            meta[slug] = "ai"

    print("白模：")
    for name, slug in CLAY_MAP.items():
        path = os.path.join(ROOT, "模型练习", name)
        if not os.path.exists(path):
            continue
        im = Image.open(path).convert("RGB")
        im = im.crop((165, 45, min(im.width, 2075), min(im.height, 995)))
        save_pair(crop_ratio(im, 16 / 9), slug)
        meta[slug] = "clay"

    print("项目图：")
    extract_pdf_images()
    for f in sorted(glob.glob(os.path.join(PDF_IMG, "*.jpg"))):
        key = os.path.basename(f).split("_", 1)[1].replace(".jpg", "")
        slug = PROJECT_MAP.get(key)
        if slug:
            save_pair(Image.open(f).convert("RGB"), slug, max_w=1800)

    scene_path = os.path.join(ROOT, "初步渲染", "场景图.png")
    if os.path.exists(scene_path):
        im = Image.open(scene_path).convert("RGB")
        save_pair(crop_ratio(im, 16 / 9), "proj-scene", max_w=2000)
        # 首屏大图：同一张场景，3:2
        save_pair(crop_ratio(im, 3 / 2), "hero-scene", max_w=2400)

    board_path = os.path.join(ROOT, "产品展板.jpg")
    if os.path.exists(board_path):
        print("产品展板：")
        save_pair(load_cmyk_as_srgb(board_path), "proj-board")

    with open(os.path.join(SITE, "assets", "img-meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)

    total = sum(os.path.getsize(os.path.join(IMG, f)) for f in os.listdir(IMG))
    print(f"\n完成：{len(meta)} 组图，共 {total / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
