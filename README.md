# 作品集 · 雷啟春

一个纯静态的单页作品集。没有构建步骤、没有依赖、没有外部字体和 CDN，
把所有文件丢到 GitHub Pages 上就能用。

```
portfolio/
├─ index.html              # 页面结构（首屏文案、导航、过程、关于）
├─ assets/
│  ├─ css/style.css        # 全部样式
│  ├─ js/works.js          # ★ 作品数据：名字、分类、说明、标签、是否精选
│  ├─ js/app.js            # 交互：筛选、大图查看（键盘/滑动）、滚动出现
│  ├─ img/                 # 18 组图，每组 800px（列表）+ 1600px（大图/首屏）
│  ├─ og.jpg               # 微信/领英等分享时显示的预览图
│  └─ favicon.svg
├─ 工具/                   # 换图、重做分享图的小脚本（可选，Python + Pillow）
├─ .nojekyll               # 告诉 GitHub Pages 不要走 Jekyll
└─ README.md
```

---

## 1. 本地预览

直接双击 `index.html` 也能看（已验证），但为了和线上一致，建议起一个本地服务：

```powershell
three-serve --port 8899        # 本机已有的静态服务
# 或
python -m http.server 8899
```

打开 <http://127.0.0.1:8899/>。

---

## 2. 上线到 GitHub Pages

### 方式 A：网页上传（不用命令行，最稳）

1. 打开 <https://github.com/new>，仓库名建议 `portfolio`，选 **Public**，不要勾模板。
2. 进仓库 → **Add file → Upload files**，把本目录**里面**的文件拖进去
   （`index.html`、`assets/`、`工具/`、`.nojekyll`、`README.md`；不要把 `portfolio` 这一层文件夹本身拖进去）。
   `.nojekyll` 是隐藏文件，看不到就先传其余文件再单独创建。
3. **Commit changes**。
4. 仓库 **Settings → Pages**：Source 选 **Deploy from a branch**，
   Branch 选 **main**、目录 **/ (root)** → **Save**。

等 1–2 分钟，地址是 `https://<你的用户名>.github.io/portfolio/`，放进简历即可。

### 方式 B：命令行（本目录已经是 git 仓库，有提交历史）

```powershell
cd "C:\Users\haru\Desktop\练习文件\portfolio"
git remote add origin https://github.com/<用户名>/portfolio.git
git push -u origin main
```

然后按上面第 4 步开 Pages。

### 方式 C：GitHub CLI

```powershell
gh auth login          # 你机器上装了 gh，但还没登录
cd portfolio
gh repo create portfolio --public --source=. --push
gh api -X POST repos/<用户名>/portfolio/pages -f "source[branch]=main" -f "source[path]=/"
```

> 仓库名不是 `portfolio` 也可以，站内链接都是相对路径；只是地址会变成
> `https://<用户名>.github.io/<仓库名>/`。

---

## 3. 改内容

### 作品信息（名字 / 说明 / 分类 / 标签 / 精选）

只改 `assets/js/works.js`：

```js
{
  slug: "robot-vacuum",        // 对应 assets/img/robot-vacuum-800.webp / -1600.webp
  name: "扫地机器人",
  en: "Robot Vacuum",
  cat: "home",                 // home 小家电与个护 / electronics 消费电子 / tools 设备与工具
  date: "2026-06-12",          // 排序用，新的在前
  short: "06.12",              // 卡片上显示
  tags: ["曲面衔接", "分件"],   // 大图里的标签；复刻件写「现有产品复刻」
  desc: "一句话说明这件练了什么。",
  featured: true,              // true = 进首屏「精选」（建议保持 6 件）
}
```

- 分类显示名在同一文件的 `CATS` 里。
- 姓名、电话、邮箱：改 `index.html`（首屏、关于、页脚）和 `works.js` 里的 `SITE`。
- 首页大图固定用耳机那张，想换成别的：改 `index.html` 里 `.hero-figure` 的 `src/srcset`。

### 加一件新作品

1. 准备两张 4:3 图：1600×1200 和 800×600 的 WebP，命名 `<slug>-1600.webp`、`<slug>-800.webp`，
   丢进 `assets/img/`。
2. 在 `works.js` 的 `WORKS` 里照抄一条。
3. 想让首页大图/精选用新图，改对应位置即可。

### 批量处理原图（可选）

把原图（KeyShot 导出）放进 `portfolio` 上一级目录，在 `工具/SLUG` 里加一条映射，然后：

```powershell
cd 工具
python build_assets.py     # 统一裁 4:3、去掉右上角截图角标、压成 WebP
python build_og.py         # 重新生成分享预览图
```

需要 Python + Pillow。

---

## 4. 上线后建议改的一处

`index.html` 里的 `og:image` 现在是相对路径 `assets/og.jpg`。微信、领英等抓取预览图时
通常需要完整地址，上线后改成：

```html
<meta property="og:image" content="https://<用户名>.github.io/portfolio/assets/og.jpg">
```

顺手可以加一行 `<meta property="og:url" content="https://<用户名>.github.io/portfolio/">`。

其他可选：

- **自定义域名**：Settings → Pages → Custom domain，再在仓库根目录放一个 `CNAME` 文件。
- **访问统计**：Cloudflare Web Analytics 或 Umami，在 `</body>` 前加一段脚本即可。
- **不要提交原图**：`assets/img/` 里已是压缩图，整站不到 1 MB。
