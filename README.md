# 作品集 · 雷啟春

纯静态单页作品集：一个智能眼镜设计项目 + 30 多件产品建模与渲染练习。
没有构建步骤、没有依赖、没有外部字体和 CDN，推到 GitHub Pages 就能用。

```
portfolio/
├─ index.html              # 页面结构：首屏 / 项目 / 渲染 / 建模 / 关于
├─ assets/
│  ├─ css/style.css        # 全部样式
│  ├─ js/works.js          # ★ 作品数据：名字、分类、说明、白模对照
│  ├─ js/app.js            # 交互：筛选、大图查看、滚动出现
│  ├─ img/                 # 48 组图，每组 800px + 1600px 两档 WebP
│  ├─ og.jpg               # 微信/领英等分享预览图
│  └─ favicon.svg
├─ 工具/                   # 换图、重做分享图的小脚本（Python + Pillow）
├─ .nojekyll
└─ README.md
```

---

## 1. 本地预览

双击 `index.html` 也能看，但和线上一致建议起服务：

```powershell
three-serve --port 8899     # 或 python -m http.server 8899
```

打开 <http://127.0.0.1:8899/>。

---

## 2. 上线到 GitHub Pages

### 网页上传（不用命令行）

1. <https://github.com/new> 建仓库，名字建议 `portfolio`，选 **Public**。
2. 进仓库 → **Add file → Upload files**，把本目录**里面**的文件拖进去
   （`index.html`、`assets/`、`工具/`、`.nojekyll`、`README.md`），不要带 `portfolio` 这层文件夹。
3. **Commit changes**。
4. **Settings → Pages**：Source 选 **Deploy from a branch**，Branch **main**，目录 **/ (root)** → Save。

1–2 分钟后地址是 `https://<用户名>.github.io/portfolio/`。

### 命令行（本目录已是 git 仓库，有提交历史）

```powershell
cd "C:\Users\haru\Desktop\练习文件\portfolio"
git remote add origin https://github.com/<用户名>/portfolio.git
git push -u origin main
```

> 仓库名不是 `portfolio` 也行，站内都是相对路径，只是地址会变成
> `https://<用户名>.github.io/<仓库名>/`。

---

## 3. 内容在哪改

### 产品练习（渲染 / 场景 / AI 辅助）

`assets/js/works.js` 的 `WORKS`：

```js
{
  slug: "rc-hair-dryer",       // 对应 assets/img/rc-hair-dryer-800.webp / -1600.webp
  name: "吹风机",
  en: "Hair Dryer",
  cat: "render",               // render 棚拍渲染 | scene 场景合成 | ai AI 辅助
  tags: ["长筒曲面", "格栅"],   // 大图里的标签
  desc: "一句话说明这件练了什么。",
}
```

分类显示名在 `CATS`；白模→渲染对照在 `PAIRS`；14 件白模列表在 `CLAY`。

### 项目案例（首屏以下的整段「01 项目」）

直接在 `index.html` 里改，每个阶段是一块 `<div class="stage">`：

- 阶段标题：`.stage-head` 里的 `<h4>` 和 `<p>`
- 图片：`.stage-grid` 里的 `<figure>`，用 `sp-4 / sp-5 / sp-7 / sp-8 / sp-12` 控制占几列，
  用 `r-4x3 / r-16x9 / r-3x2 / r-4x5 / r-1x1 / r-wide` 控制裁切比例，加 `is-contain` 则完整显示不裁切。

### 首屏

姓名、电话、邮箱、GPA 等在 `index.html`，统计数字在 `<dl class="hero-stats">` 里。
首屏大图在 `.hero-figure` 的 `src/srcset`，现在用的是 `hero-scene`（由 `场景图.png` 裁成 3:2 生成）。

### 产品展板

项目最后一节「05 展板」用的是 `assets/img/proj-board-1600.webp`，
原图是根目录的 `产品展板.jpg`（9933×12862，CMYK + Japan Color 2001 Coated 配置文件），脚本会按内嵌 ICC 转成 sRGB 再缩放；直接 `convert("RGB")` 会发绿。
换新版面时替换这张 jpg 再跑一次 `build_assets.py` 即可。

### 加图 / 换图

把原图按原目录结构放好，然后在 `工具/` 下：

```powershell
cd 工具
python build_assets.py     # 统一裁切、去角标、压成 WebP（含场景图 / 产品展板）
python build_og.py         # 重新生成分享预览图
```

脚本里的映射表（`RENDER_MAP / CLAY_MAP / PROJECT_MAP` 等）决定文件名对应哪个 slug，
新增作品时加一行即可。需要 Python + Pillow。

---

## 4. 上线后建议改

把 `index.html` 里的 `og:image` 换成完整地址（微信/领英抓预览图需要绝对 URL）：

```html
<meta property="og:image" content="https://<用户名>.github.io/portfolio/assets/og.jpg">
```

其他可选：自定义域名（Settings → Pages → Custom domain + 仓库根目录放 `CNAME` 文件）；
访问统计（Cloudflare Web Analytics / Umami 的脚本放 `</body>` 前）。
