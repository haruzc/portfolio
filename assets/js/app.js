/* =====================================================================
   交互：渲染列表 / 分类筛选 / 大图查看 / 滚动出现
   数据来自 works.js（SITE、WORKS、CATS、PROCESS）
   ===================================================================== */
(function () {
  "use strict";

  const img = (slug, size = 800) => `assets/img/${slug}-${size}.webp`;
  const catLabel = (id) => (CATS.find((c) => c.id === id) || {}).label || "";

  /* 图片淡入 */
  function markLoaded(el) {
    if (el.complete && el.naturalWidth) el.classList.add("is-loaded");
    else el.addEventListener("load", () => el.classList.add("is-loaded"), { once: true });
  }

  /* ---------- 卡片 ---------- */
  function cardHTML(w, index, variant) {
    return `
      <button class="card" type="button" data-index="${index}"
              aria-label="查看作品：${w.name}">
        <span class="card-media">
          <img alt="${w.name}（${w.en}）产品渲染图" loading="lazy" decoding="async"
               src="${img(w.slug)}" width="800" height="600">
          <span class="card-hint" aria-hidden="true">↗</span>
        </span>
        <span class="card-meta">
          <span class="card-name">${w.name}</span>
          ${variant === "work" ? `<span class="card-cat">${catLabel(w.cat)}</span>` : ""}
          <span class="card-sub">${w.en}</span>
        </span>
      </button>`;
  }

  /* ---------- 横向图带 ---------- */
  function renderMarquee() {
    const track = document.getElementById("marqueeTrack");
    if (!track) return;
    const picks = ["robot-vacuum", "headphones", "speaker", "sharpener", "fan",
                   "massage-gun", "hair-dryer", "switch", "blender", "mouse"];
    const one = picks
      .map((slug) => WORKS.find((w) => w.slug === slug))
      .filter(Boolean)
      .map((w) => `<figure><img src="${img(w.slug)}" alt="" loading="eager" decoding="async"></figure>`)
      .join("");
    track.innerHTML = one + one; // 两份，配合 -50% 的无缝滚动
    track.querySelectorAll("img").forEach(markLoaded);
  }

  /* ---------- 精选 ---------- */
  function renderFeatured() {
    const grid = document.getElementById("featuredGrid");
    if (!grid) return;
    const featured = WORKS.filter((w) => w.featured);
    grid.innerHTML = featured
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

    grid.innerHTML = visibleWorks
      .map(({ w, i }) => `<article class="work" data-reveal>${cardHTML(w, i, "work")}</article>`)
      .join("");
    grid.querySelectorAll("img").forEach(markLoaded);
    if (empty) empty.hidden = visibleWorks.length > 0;
    revealIn(grid);
  }

  /* ---------- 大图 ---------- */
  const lb = {
    root: document.getElementById("lightbox"),
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

  function showWork(list, pos) {
    const w = list[pos];
    if (!w) return;
    lb.list = list;
    lb.pos = pos;
    lb.image.src = img(w.slug, 1600);
    lb.image.alt = `${w.name}（${w.en}）产品渲染图`;
    lb.title.textContent = w.name;
    lb.en.textContent = w.en;
    lb.desc.textContent = w.desc || "";
    lb.tags.innerHTML = (w.tags || []).map((t) => `<li>${t}</li>`).join("");
    lb.count.textContent = `${String(pos + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    lb.prev.disabled = pos === 0;
    lb.next.disabled = pos === list.length - 1;
  }

  function openLightbox(list, pos) {
    lb.lastFocus = document.activeElement;
    showWork(list, pos);
    lb.root.hidden = false;
    document.body.classList.add("lb-open");
    lb.close.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lb.root.hidden = true;
    document.body.classList.remove("lb-open");
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
      if (e.target === lb.root || e.target.classList.contains("lb-body")) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (lb.root.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });
  }

  /* 卡片点击（事件委托） */
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const index = Number(card.dataset.index);
    const work = WORKS[index];
    if (!work) return;

    // 只在「全部练习」里做前后翻页，精选区单张查看
    const inGrid = card.closest(".work-grid");
    if (inGrid) {
      const list = visibleWorks.map((v) => v.w);
      openLightbox(list, list.indexOf(work));
    } else {
      openLightbox([work], 0);
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
    renderMarquee();
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
