# 练习作品集 · 雷啟春

一个纯静态的单页作品集。没有构建步骤、没有依赖、没有外部字体和 CDN，
把所有文件丢到 GitHub Pages 上就能用。

```
portfolio/
├─ index.html              # 页面结构（首屏文案、导航、过程、关于都在这里）
├─ assets/
│  ├─ css/style.css        # 全部样式
│  ├─ js/works.js          # ★ 作品数据：名字、分类、说明、标签
│  ├─ js/app.js            # 交互：筛选择、大图查看、滚动出现
│  ├─ img/                 # 18 组图，每组 800px（列表）+ 1600px（大图）
│  ├─ og.jpg               # 微信/领英等分享时显示的预览图
│  └─ favicon.svg
├─ .nojekyll               # 告诉 GitHub Pages 不要走 Jekyll
└─ README.md
```

---

## 1. 本地预览

直接双击 `index.html` 一般也能看，但为了和线上一致，建议起一个本地服务
（任选一种，在本目录下执行）：

```powershell
# 本机已有的静态服务
three-serve --port 8899

# 或者用 Python
python -m http.server 8899
```

然后打开 <http://127.0.0.1:8899/>。

---

## 2. 上线到 GitHub Pages

### 方式 A：网页上传（不用命令行，最稳）

1. 打开 <https://github.com/new>，仓库名建议 `portfolio`，选 **Public**，不要勾任何模板。
2. 进仓库 → **Add file → Upload files**，把本目录**里面**的所有文件拖进去
   （`index.html`、`assets/`、`.nojekyll`、`README.md`；不要把 `portfolio` 这一层文件夹本身拖进去）。
   `.nojekyll` 是隐藏文件，如果上传时看不到，可以先传其余文件再单独创建。
3. **Commit changes**。
4. 仓库 **Settings → Pages**：
   - Source 选 **Deploy from a branch**
   - Branch 选 **main**，目录选 **/ (root)** → **Save**
5. 等 1–2 分钟，地址是：

   ```
   https://<你的用户名>.github.io/portfolio/
   ```

   把这个链接放进简历里即可。

### 方式 B：命令行

```powershell
cd portfolio
git init -b main
git add -A
git commit -m "portfolio: practice archive"
git remote add origin https://github.com/<用户名>/portfolio.git
git push -u origin main
```

推送后在 Settings → Pages 里按上面第 4 步开启即可。

### 方式 C：装了 GitHub CLI 的话

```powershell
cd portfolio
gh repo create portfolio --public --source=. --push
gh api -X POST repos/<用户名>/portfolio/pages -f "source[branch]=main" -f "source[path]=/"
```

> 注意：仓库名如果不是 `portfolio`，页面地址会变成 `https://<用户名>.github.io/<仓库名>/`，
> 站内链接都是相对路径，改仓库名不需要改代码。

---

## 3. 以后怎么改内容

### 改作品名字 / 说明 / 分类 / 标签

只改 `assets/js/works.js`：

```js
{
  slug: "robot-vacuum",        // 对应 assets/img/robot-vacuum-800.webp / -1600.webp
  name: "扫地机器人",           // 列表和大图上显示的名字
  en: "Robot Vacuum",          // 英文副标题
  cat: "home",                 // home 小家电与个护 / electronics 消费电子 / tools 设备与工具
  date: "2026-06-12",          // 用来排序（新的在前）
  short: "06.12",              // 卡片上显示
  tags: ["曲面衔接", "分件"],   // 大图右下角的标签
  desc: "一句话说明这件练了什么。",
  featured: true,              // true = 出现在首屏「精选」
}
```

分类的显示名在同一个文件的 `CATS` 里改；姓名、电话、邮箱在 `SITE` 里改
（`index.html` 里也有几处写死的联系方式，一起改一下）。

### 加一件新作品

1. 导出两张图：1600×1200 和 800×600 的 WebP（4:3；KeyShot 直接出 4:3 也行，
   脚本会自动裁）。命名 `<slug>-1600.webp`、`<slug>-800.webp`，丢进 `assets/img/`。
2. 在 `works.js` 的 `WORKS` 里加一条（照抄上面格式）。
3. 想让它进精选就 `featured: true`（建议保持 6 件）。

### 自动处理原图（可选）

`工具/` 下留了生成图片的 Python 脚本（需要 Pillow）。批量新增作品时，
把原图放进源目录、改一下 `SLUG` 映射，跑一遍就统一裁好、压好：

```powershell
python build_assets.py
python build_og.py    # 重新生成分享预览图
```

---

## 4. 几个小提示

- **分享卡片**：`index.html` 里的 `og:image` 现在是相对路径。想让微信/领英抓到预览图，
  上线后把它改成完整地址：
  `<meta property="og:image" content="https://<用户名>.github.io/portfolio/assets/og.jpg">`
- **不要提交原图**：`assets/img/` 里已经是压缩过的图，整站不到 1 MB。高清原图自己留好。
- **自定义域名**：Settings → Pages → Custom domain 填域名，再在仓库根目录加一个
  `CNAME` 文件，内容就是你域名（例如 `lei.example.com`）。
- **加访问统计**：想统计访问量可以接 Cloudflare Web Analytics 或 Umami，
  在 `index.html` 的 `</body>` 前加一段脚本即可，不影响页面本身。
