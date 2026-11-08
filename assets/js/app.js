/* =====================================================================
   交互：作品网格 / 筛选 / 白模对照 / 大图查看
   数据来自 works.js（SITE、WORKS、CATS、PAIRS、CLAY）
   ===================================================================== */
(function () {
  "use strict";

  const src = (slug, size = 800) => `assets/img/${slug}-${size}.webp`;
  const srcset = (slug) => `${src(slug, 800)} 800w, ${src(slug, 1600)} 1600w`;
  const catLabel = (id) => (CATS.find((c) => c.id === id) || {}).label || "";

  function markLoaded(el) {
    if (el.complete && el.naturalWidth) el.classList.add("is-loaded");
    else el.addEventListener("load", () => el.classList.add("is-loaded"), { once: true });
  }

  /* ---------- 作品卡 ---------- */
  function cardHTML(w, index) {
    return `
      <button class="card" type="button" data-index="${index}" aria-label="查看作品：${w.name}">
        <span class="card-media">
          <img alt="${w.name}（${w.en}）" loading="lazy" decoding="async"
               src="${src(w.slug)}" srcset="${srcset(w.slug)}"
               sizes="(max-width: 680px) 46vw, (max-width: 1100px) 30vw, 23vw"
               width="800" height="600">
          <span class="card-hint" aria-hidden="true">↗</span>
        </span>
        <span class="card-meta">
          <span class="card-name">${w.name}</span>
        </span>
      </button>`;
  }

  /* ---------- 筛选 + 网格 ---------- */
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

    visibleWorks = WORKS.filter((w) => activeCat === "all" || w.cat === activeCat);

    grid.innerHTML = visibleWorks
      .map((w) => `<article class="work" data-reveal>${cardHTML(w, WORKS.indexOf(w))}</article>`)
      .join("");
    grid.querySelectorAll("img").forEach(markLoaded);
    if (empty) empty.hidden = visibleWorks.length > 0;
    revealIn(grid);
  }

  /* ---------- 白模 → 渲染 ---------- */
  function renderPairs() {
    const box = document.getElementById("pairs");
    if (!box) return;
    box.innerHTML = PAIRS.map(
      (p) => `
      <article class="pair" data-reveal>
        <div class="pair-media">
          <figure class="pair-item">
            <img src="${src(p.clay)}" srcset="${srcset(p.clay)}" sizes="(max-width: 860px) 46vw, 24vw"
                 alt="${p.name}白模" loading="lazy" decoding="async">
            <figcaption>白模</figcaption>
          </figure>
          <figure class="pair-item">
            <img src="${src(p.render)}" srcset="${srcset(p.render)}" sizes="(max-width: 860px) 46vw, 24vw"
                 alt="${p.name}渲染图" loading="lazy" decoding="async">
            <figcaption>渲染</figcaption>
          </figure>
        </div>
        <h4>${p.name}</h4>
        <p>${p.note}</p>
      </article>`
    ).join("");
    box.querySelectorAll("img").forEach(markLoaded);
  }

  /* ---------- 14 件白模 ---------- */
  function renderClay() {
    const grid = document.getElementById("clayGrid");
    if (!grid) return;
    grid.innerHTML = CLAY.map(
      (c) => `
      <figure class="clay" data-reveal>
        <img src="${src(c.slug)}" srcset="${srcset(c.slug)}" sizes="(max-width: 680px) 30vw, 13vw"
             alt="${c.name}白模" loading="lazy" decoding="async">
        <figcaption>${c.name}</figcaption>
      </figure>`
    ).join("");
    grid.querySelectorAll("img").forEach(markLoaded);
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

  function show(item, pos, total) {
    lb.pos = pos;
    lb.image.src = item.src;
    lb.image.srcset = item.srcFull && item.srcFull !== item.src ? `${item.src} 800w, ${item.srcFull} 1600w` : "";
    lb.image.alt = item.alt || item.name || "";
    lb.title.textContent = item.name || "";
    lb.en.textContent = item.en || "";
    lb.desc.textContent = item.desc || "";
    lb.tags.innerHTML = (item.tags || []).map((t) => `<li>${t}</li>`).join("");
    lb.count.textContent = total > 1
      ? `${String(pos + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
      : "";
    lb.prev.disabled = pos === 0;
    lb.next.disabled = pos === total - 1;
    const single = total < 2;
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
    lb.list = list;
    show(list[pos], pos, list.length);
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
    show(lb.list[next], next, lb.list.length);
  }

  function workToItem(w) {
    return {
      src: src(w.slug, 800),
      srcFull: src(w.slug, 1600),
      name: w.name,
      en: w.en,
      desc: w.desc,
      tags: w.tags,
      alt: `${w.name}（${w.en}）`,
    };
  }

  function wireLightbox() {
    if (!lb.root) return;
    lb.close.addEventListener("click", closeLightbox);
    lb.prev.addEventListener("click", () => step(-1));
    lb.next.addEventListener("click", () => step(1));
    lb.root.addEventListener("click", (e) => {
      if (e.target === lb.root || e.target === lb.body) closeLightbox();
    });

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
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    let startX = null;
    let startY = null;
    lb.body.addEventListener("pointerdown", (e) => { startX = e.clientX; startY = e.clientY; });
    lb.body.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
    });
  }

  /* 作品卡点击 */
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) {
      const w = WORKS[Number(card.dataset.index)];
      if (!w) return;
      const list = visibleWorks.map(workToItem);
      openLightbox(list, Math.max(0, visibleWorks.indexOf(w)));
      return;
    }
    // 项目区图片：单张查看
    const fig = e.target.closest(".fg");
    if (fig) {
      const img = fig.querySelector("img");
      if (!img) return;
      const full = img.currentSrc.replace("-800.webp", "-1600.webp");
      openLightbox([{ src: full, name: img.alt, alt: img.alt }], 0);
    }
  });

  /* ---------- 筛选事件 ---------- */
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

  function init() {
    renderFilters();
    renderGrid();
    renderPairs();
    renderClay();
    wireFilters();
    wireLightbox();
    wireHeader();
    revealIn(document);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
