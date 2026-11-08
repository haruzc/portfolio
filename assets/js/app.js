/* =====================================================================
   交互：渲染列表 / 分类筛选 / 大图查看 / 滚动出现
   数据来自 works.js（SITE、WORKS、CATS）
   ===================================================================== */
(function () {
  "use strict";

  const src = (slug, size = 800) => `assets/img/${slug}-${size}.webp`;
  const srcset = (slug) => `${src(slug, 800)} 800w, ${src(slug, 1600)} 1600w`;
  const catLabel = (id) => (CATS.find((c) => c.id === id) || {}).label || "";

  const FEATURED = WORKS.filter((w) => w.featured);

  /* 图片淡入 */
  function markLoaded(el) {
    if (el.complete && el.naturalWidth) el.classList.add("is-loaded");
    else el.addEventListener("load", () => el.classList.add("is-loaded"), { once: true });
  }

  /* ---------- 卡片 ---------- */
  function cardHTML(w, index, variant) {
    const sizes =
      variant === "feat"
        ? "(max-width: 680px) 92vw, (max-width: 1100px) 46vw, 31vw"
        : "(max-width: 680px) 46vw, (max-width: 1100px) 30vw, 23vw";
    return `
      <button class="card" type="button" data-index="${index}"
              aria-label="查看作品：${w.name}">
        <span class="card-media">
          <img alt="${w.name}（${w.en}）产品渲染图" loading="lazy" decoding="async"
               src="${src(w.slug)}" srcset="${srcset(w.slug)}" sizes="${sizes}"
               width="800" height="600">
          <span class="card-hint" aria-hidden="true">↗</span>
        </span>
        <span class="card-meta">
          <span class="card-name">${w.name}</span>
          ${variant === "work" ? `<span class="card-cat">${catLabel(w.cat)}</span>` : ""}
          <span class="card-sub">${w.en}</span>
        </span>
      </button>`;
  }

  /* ---------- 精选 ---------- */
  function renderFeatured() {
    const grid = document.getElementById("featuredGrid");
    if (!grid) return;
    grid.innerHTML = FEATURED
      .map((w) => `<article class="feat" data-reveal>${cardHTML(w, WORKS.indexOf(w), "feat")}</article>`)
      .join("");
    grid.querySelectorAll("img").forEach(markLoaded);
  }

  /* ---------- 全部练习 ---------- */
  let activeCat = "all";
  let visibleWorks = [];

  function renderFilters() {
    const box = document.getElementById("filters");
    if (!box) return;
    box.innerHTML = CATS.map((c) => {
      const n = c.id === "all" ? WORKS.length : WORKS.filter((w) => w.cat === c.id).length;
      return `<button class="chip" type="button" data-cat="${c.id}"
                aria-pressed="${c.id === activeCat}">${c.label}<span>${n}</span></button>`;
    }).join("");
  }

  function renderGrid() {
    const grid = document.getElementById("workGrid");
    const empty = document.getElementById("gridEmpty");
    if (!grid) return;

    visibleWorks = WORKS
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => activeCat === "all" || w.cat === activeCat)
      .sort((a, b) => (a.w.date < b.w.date ? 1 : -1));

    const cards = visibleWorks
      .map(({ w, i }) => `<article class="work" data-reveal>${cardHTML(w, i, "work")}</article>`)
      .join("");

    // 「全部」时补一张尾卡，避免最后一行只剩一张图
    const endCard =
      activeCat === "all"
        ? `<div class="work-end">
             <span class="end-label">17 / 17 · Archive end</span>
             <h3>练习还在继续，正式项目也在攒。想看看源文件或建模过程，可以直接找我。</h3>
             <a href="mailto:251009010226@st.sdju.edu.cn">251009010226@st.sdju.edu.cn</a>
           </div>`
        : "";

    grid.innerHTML = cards + endCard;
    grid.querySelectorAll("img").forEach(markLoaded);
    if (empty) empty.hidden = visibleWorks.length > 0;
    revealIn(grid);
  }

  /* ---------- 大图 ---------- */
  const lb = {
    root: document.getElementById("lightbox"),
    body: document.getElementById("lbBody"),
    image: document.getElementById("lbImg"),
    title: document.getElementById("lbTitle"),
    en: document.getElementById("lbEn"),
    desc: document.getElementById("lbDesc"),
    tags: document.getElementById("lbTags"),
    count: document.getElementById("lbCount"),
    prev: document.getElementById("lbPrev"),
    next: document.getElementById("lbNext"),
    close: document.getElementById("lbClose"),
    list: [],
    pos: 0,
    lastFocus: null,
  };

  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function showWork(list, pos) {
    const w = list[pos];
    if (!w) return;
    lb.list = list;
    lb.pos = pos;
    lb.image.src = src(w.slug, 1600);
    lb.image.srcset = srcset(w.slug);
    lb.image.alt = `${w.name}（${w.en}）产品渲染图`;
    lb.title.textContent = w.name;
    lb.en.textContent = w.en;
    lb.desc.textContent = w.desc || "";
    lb.tags.innerHTML = (w.tags || []).map((t) => `<li>${t}</li>`).join("");
    lb.count.textContent = `${String(pos + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    lb.prev.disabled = pos === 0;
    lb.next.disabled = pos === list.length - 1;
    // 单件时隐藏翻页按钮，避免点了没反应
    const single = list.length < 2;
    lb.prev.hidden = single;
    lb.next.hidden = single;
    lb.body.scrollTop = 0;
  }

  function setBackgroundInert(on) {
    ["header.site-head", "main", "footer.site-foot", ".skip"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  }

  function openLightbox(list, pos) {
    lb.lastFocus = document.activeElement;
    showWork(list, pos);
    lb.root.hidden = false;
    document.body.classList.add("lb-open");
    setBackgroundInert(true);
    lb.close.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lb.root.hidden = true;
    document.body.classList.remove("lb-open");
    setBackgroundInert(false);
    if (lb.lastFocus) lb.lastFocus.focus({ preventScroll: true });
  }

  function step(dir) {
    const next = lb.pos + dir;
    if (next < 0 || next >= lb.list.length) return;
    showWork(lb.list, next);
  }

  function wireLightbox() {
    if (!lb.root) return;
    lb.close.addEventListener("click", closeLightbox);
    lb.prev.addEventListener("click", () => step(-1));
    lb.next.addEventListener("click", () => step(1));
    lb.root.addEventListener("click", (e) => {
      if (e.target === lb.root || e.target === lb.body) closeLightbox();
    });

    // 焦点陷阱
    document.addEventListener("keydown", (e) => {
      if (lb.root.hidden) return;
      if (e.key === "Escape") { closeLightbox(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
      if (e.key !== "Tab") return;
      const items = [...lb.root.querySelectorAll(FOCUSABLE)].filter(
        (el) => !el.hidden && !el.disabled && el.offsetParent !== null
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // 手机左右滑动翻页
    let startX = null;
    let startY = null;
    lb.body.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });
    lb.body.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
    });
  }

  /* 卡片点击（事件委托） */
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const index = Number(card.dataset.index);
    const work = WORKS[index];
    if (!work) return;

    if (card.closest(".work-grid")) {
      const list = visibleWorks.map((v) => v.w);
      openLightbox(list, list.indexOf(work));
    } else {
      openLightbox(FEATURED, FEATURED.indexOf(work));
    }
  });

  /* ---------- 筛选 ---------- */
  function wireFilters() {
    const box = document.getElementById("filters");
    if (!box) return;
    box.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      activeCat = chip.dataset.cat;
      box.querySelectorAll(".chip").forEach((c) =>
        c.setAttribute("aria-pressed", String(c.dataset.cat === activeCat))
      );
      renderGrid();
    });
  }

  /* ---------- 滚动出现 ---------- */
  let io = null;
  function revealIn(root) {
    if (!("IntersectionObserver" in window)) {
      root.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
      return;
    }
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
    }
    root.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
  }

  /* ---------- 顶栏 ---------- */
  function wireHeader() {
    const head = document.getElementById("siteHead");
    if (!head) return;
    const onScroll = () => head.classList.toggle("is-stuck", window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 启动 ---------- */
  function init() {
    renderFeatured();
    renderFilters();
    renderGrid();
    wireFilters();
    wireLightbox();
    wireHeader();
    revealIn(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
