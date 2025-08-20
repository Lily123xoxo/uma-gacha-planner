// public/js/timeline.bundle.js
(function () {
  // --- utils ---
  function debounce(fn, delay) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  function formatLocalDate(s) {
    if (!s) return "Unknown";
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  function toYMDUTC(v) {
    if (v == null) return null;
    if (typeof v === "string") {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v.trim());
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    }
    if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
    if (typeof v === "number" && isFinite(v)) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    }
    return null;
  }
  function pickEndDateLike(b) {
    if (!b) return null;
    return (
      b.global_actual_end_date ??
      b.global_est_end_date ??
      b.actual_end_date ??
      b.est_end_date ??
      b.end_date ??
      null
    );
  }
  function safeImageSrc(url) {
    try {
      const u = new URL(url, location.origin);
      if (u.origin === location.origin) return u.toString();
    } catch {}
    return "/images/default.png";
  }
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    if (!Array.isArray(children)) children = [children];
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }
  function enableDragScroll(container) {
    let isDragging = false, startX = 0, scrollLeft = 0;
    function onMouseMove(e) {
      if (!isDragging) return;
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 0.8;
      container.scrollLeft = scrollLeft - walk;
    }
    function onMouseUp() {
      isDragging = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.style.cursor = "grab";
    }
    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = "grabbing";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    });
  }

  // --- adapters (grouped -> planner rows) ---
  function toCharacterRow(b) {
    if (!b) return null;
    return {
      id: b.id,
      uma_name: b.name ?? "",
      jp_release_date: b.jp_release_date ?? null,
      global_actual_date: b.start_kind === "actual" ? b.start_date : null,
      global_actual_end_date: b.end_date ?? null,
      global_est_date: b.start_kind === "est" ? b.start_date : null,
      global_est_end_date: b.est_end_date ?? null,
      jp_days_until_next: b.jp_days_until_next ?? null,
      global_days_until_next: b.global_days_until_next ?? null,
      image_path: b.image_path ?? null,
    };
  }
  function toSupportRow(b) {
    if (!b) return null;
    return {
      id: b.id,
      support_name: b.name ?? "",
      jp_release_date: b.jp_release_date ?? null,
      global_actual_date: b.start_kind === "actual" ? b.start_date : null,
      global_actual_end_date: b.end_date ?? null,
      global_est_date: b.start_kind === "est" ? b.start_date : null,
      global_est_end_date: b.est_end_date ?? null,
      jp_days_until_next: b.jp_days_until_next ?? null,
      global_days_until_next: b.global_days_until_next ?? null,
      image_path: b.image_path ?? null,
    };
  }

  // --- UI pieces for grouped cards ---
  function buildBannerThumb(b, placeholder, kind) {
    const imgAlt = b?.name || kind;
    const imgSrc = safeImageSrc(b?.image_path || "");
    const titleText = b?.name || "";
    const img = el("img", {
      class: "banner-img",
      alt: imgAlt,
      loading: "lazy",
      decoding: "async",
      fetchpriority: "low",
      src: placeholder,
      "data-src": imgSrc,
    });
    const title = el("h3", { class: "mb-2", text: titleText });
    title.classList.add(kind === "support" ? "support-name" : "uma-name");
    const section = el("div", { class: "banner-section" }, [img, title]);
    img.addEventListener("error", function () {
      if (!this.src.endsWith(placeholder)) this.src = placeholder;
    });
    return section;
  }
  function buildGroupCard(index, dayGroup, placeholder) {
    const wrapper = el("div", { class: "timeline-card" });
    const startDate = formatLocalDate(dayGroup.date);
    let groupEnd = null;
    const all = [...(dayGroup.characters || []), ...(dayGroup.supports || [])];
    for (const b of all) {
      const ymd = toYMDUTC(b.end_date) || toYMDUTC(b.est_end_date);
      if (!ymd) continue;
      if (!groupEnd || ymd > groupEnd) groupEnd = ymd;
    }
    const endDate = groupEnd ? formatLocalDate(groupEnd) : "Unknown";

    const header = el("p", { class: "mb-2 date-span", text: `${startDate} → ${endDate}` });
    const hr = el("hr", { class: "my-2 full-bleed" });

    const charsWrap = el("div", { class: "banner-group characters" });
    for (const cb of (dayGroup.characters || [])) charsWrap.appendChild(buildBannerThumb(cb, placeholder, "character"));

    const suppsWrap = el("div", { class: "banner-group supports" });
    for (const sb of (dayGroup.supports || [])) suppsWrap.appendChild(buildBannerThumb(sb, placeholder, "support"));

    const body = el("div", { class: "card-body" }, [header, hr, charsWrap, suppsWrap]);
    const card = el("div", { class: "card select-banner-card", "data-index": String(index) }, body);
    wrapper.appendChild(card);
    return wrapper;
  }

  // --- planner trigger using first char/support of the day ---
  function triggerCalculateFromDay(dayGroup) {
    const firstChar = (dayGroup.characters && dayGroup.characters[0]) || null;
    const firstSupp = (dayGroup.supports && dayGroup.supports[0]) || null;

    const characterBanner = toCharacterRow(firstChar);
    const supportBanner = toSupportRow(firstSupp);

    const rawEnd = pickEndDateLike(characterBanner) ?? pickEndDateLike(supportBanner);
    const bannerEndDate = toYMDUTC(rawEnd);

    const payload = {
      carats: parseInt(document.querySelector("#carats")?.value) || 0,
      clubRank: document.querySelector("#clubRank")?.value || "C",
      teamTrialsRank: document.querySelector("#teamTrialsRank")?.value || "Class3",
      champMeeting: parseInt(document.querySelector("#champMeeting")?.value) || 1000,
      characterTickets: parseInt(document.querySelector("#characterTickets")?.value) || 0,
      supportTickets: parseInt(document.querySelector("#supportTickets")?.value) || 0,
      monthlyPass: document.querySelector("#monthlyPass")?.checked || false,
      dailyLogin: document.querySelector("#dailyLogin")?.checked || false,
      legendRace: document.querySelector("#legendRace")?.checked || false,
      dailyMission: document.querySelector("#dailyMission")?.checked || false,
      rainbowCleat: document.querySelector("#rainbowCleat")?.checked || false,
      goldCleat: document.querySelector("#goldCleat")?.checked || false,
      silverCleat: document.querySelector("#silverCleat")?.checked || false,
      bannerEndDate,
      characterBanner,
      supportBanner,
    };

    fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        const resultsDiv = document.querySelector("#results");
        if (!resultsDiv) return;
        resultsDiv.textContent = "";
        if (data.errors) {
          resultsDiv.appendChild(
            el("div", { class: "result-column", text: `Error: ${data.errors.map((e) => e.msg).join(", ")}` })
          );
          return;
        }
        resultsDiv.appendChild(el("div", { class: "result-column", text: `Rolls: ${data.rolls}` }));
        resultsDiv.appendChild(el("div", { class: "result-column", text: `Support Tickets: ${data.supportTickets}` }));
        resultsDiv.appendChild(el("div", { class: "result-column", text: `Character Tickets: ${data.characterTickets}` }));
      })
      .catch((err) => {
        const resultsDiv = document.querySelector("#results");
        if (resultsDiv) resultsDiv.textContent = `Calculation failed: ${err.message}`;
      });
  }
  const debouncedCalculate = debounce((dayGroup) => {
    triggerCalculateFromDay(dayGroup);
  }, 600);

  // --- search ---
  let searchMatches = [];
  let currentMatchIndex = -1;
  function performSearch(query) {
    document.querySelectorAll(".timeline-card .card.highlight").forEach((el) => el.classList.remove("highlight"));
    if (!query) {
      searchMatches = [];
      currentMatchIndex = -1;
      return;
    }
    const cards = [...document.querySelectorAll(".timeline-card")];
    searchMatches = cards.filter((c) => c.textContent.toLowerCase().includes(query.toLowerCase()));
    searchMatches.forEach((card) => card.querySelector(".card").classList.add("highlight"));
    currentMatchIndex = searchMatches.length > 0 ? 0 : -1;
    scrollToCurrentMatch();
  }
  function scrollToCurrentMatch() {
    if (currentMatchIndex === -1) return;
    const card = searchMatches[currentMatchIndex];
    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  // --- autoscroll helpers (every hard reload; not on soft nav/HMR) ---
  const DEV_FORCE_AUTOSCROLL =
    new URLSearchParams(location.search).has("autoscroll") || (location.hash || "").includes("autoscroll");

  function isHardReload() {
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      if (nav && typeof nav.type === "string") return nav.type === "reload";
      // legacy fallback
      return performance.navigation && performance.navigation.type === 1; // TYPE_RELOAD
    } catch {
      return true; // if undetectable, allow
    }
  }
  function shouldRunInitialAutoScroll() {
    if (DEV_FORCE_AUTOSCROLL) return true;
    return isHardReload();
  }

  function ymdLocalToday() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function bannerEndYMD(b) {
    return toYMDUTC(b?.end_date) || toYMDUTC(b?.est_end_date) || null;
  }
  function groupEndYMD(dayGroup) {
    let end = null;
    const all = [...(dayGroup.characters || []), ...(dayGroup.supports || [])];
    for (const b of all) {
      const y = bannerEndYMD(b);
      if (!y) continue;
      if (!end || y > end) end = y;
    }
    return end;
  }
  function findFirstActiveIndex(days) {
    const today = ymdLocalToday();
    for (let i = 0; i < days.length; i++) {
      const g = days[i];
      const start = toYMDUTC(g.date);
      const end = groupEndYMD(g) || start;
      if (start && end && start <= today && today <= end) return i;
    }
    // fallback: first future start
    for (let i = 0; i < days.length; i++) {
      const start = toYMDUTC(days[i].date);
      if (start && start >= today) return i;
    }
    return days.length ? 0 : -1;
  }

  // --- loader for grouped endpoint ---
  async function loadTimelineGrouped(options = {}) {
    const {
      containerSelector = ".timeline-scroll",
      endpoint = "/api/banners/grouped",
      placeholder = "/images/placeholder.png",
    } = options;
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const res = await fetch(endpoint, { credentials: "same-origin" });
      const json = await res.json();
      const days = Array.isArray(json) ? json : (json.data ?? []);
      if (!Array.isArray(days)) throw new Error("Invalid grouped payload");

      container.textContent = "";

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const imgs = e.target.querySelectorAll("img[data-src]");
            imgs.forEach((img) => {
              img.src = img.getAttribute("data-src");
              img.removeAttribute("data-src");
            });
            e.target.classList.add("is-hydrated");
            io.unobserve(e.target);
          }
        },
        { root: container, rootMargin: "300px 0px", threshold: 0.01 }
      );

      for (let i = 0; i < days.length; i++) {
        const dayGroup = days[i];
        const cardWrapper = buildGroupCard(i, dayGroup, placeholder);
        container.appendChild(cardWrapper);
        io.observe(cardWrapper);
      }

      // scroll to first active (hard reloads only), no focus/selection/compute
      if (shouldRunInitialAutoScroll()) {
        const activeIdx = findFirstActiveIndex(days);
        if (activeIdx !== -1) {
          // ensure layout is flushed so offsets are correct
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const card = container.querySelector(`.select-banner-card[data-index="${activeIdx}"]`);
              const wrapper = card ? card.closest(".timeline-card") : null;
              if (wrapper) {
                const targetLeft = wrapper.offsetLeft - (container.clientWidth - wrapper.clientWidth) / 2;
                if (typeof container.scrollTo === "function") {
                  container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
                } else {
                  container.scrollLeft = Math.max(0, targetLeft);
                }
              }
            });
          });
        }
      }

      // drag vs click detection
      let dragStartX = 0, isDragging = false;
      const dragThreshold = 15;
      container.addEventListener("mousedown", (e) => {
        dragStartX = e.clientX;
        isDragging = false;
      });
      container.addEventListener("mousemove", (e) => {
        if (Math.abs(e.clientX - dragStartX) > dragThreshold) isDragging = true;
      });

      // select + calculate
      container.addEventListener("click", (e) => {
        const card = e.target.closest(".select-banner-card");
        if (!card || isDragging) return;
        const index = parseInt(card.dataset.index, 10);
        const dayGroup = days[index];

        container.querySelectorAll(".timeline-card .card").forEach((el) =>
          el.classList.remove("selected", "calculating")
        );
        card.classList.add("selected", "calculating");

        const saved = JSON.parse(localStorage.getItem("plannerSelections") || "{}");
        const firstChar = (dayGroup.characters && dayGroup.characters[0]) || null;
        const firstSupp = (dayGroup.supports && dayGroup.supports[0]) || null;
        saved.characterBanner = toCharacterRow(firstChar);
        saved.supportBanner = toSupportRow(firstSupp);
        localStorage.setItem("plannerSelections", JSON.stringify(saved));

        debouncedCalculate(dayGroup);
      });

      window.dispatchEvent(new Event("timelineLoaded"));
    } catch (err) {
      console.error("Failed to load grouped banners:", err);
    }
  }

  // --- init (boot + wiring) ---
  async function initTimeline() {
    await loadTimelineGrouped({ endpoint: "/api/banners" });

    const input = document.querySelector("#timeline-search");
    const prev = document.querySelector("#search-prev");
    const next = document.querySelector("#search-next");
    if (input) input.addEventListener("input", (e) => performSearch(e.target.value));
    if (next)
      next.addEventListener("click", () => {
        if (!searchMatches.length) return;
        currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
        scrollToCurrentMatch();
      });
    if (prev)
      prev.addEventListener("click", () => {
        if (!searchMatches.length) return;
        currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
        scrollToCurrentMatch();
      });

    const container = document.querySelector(".timeline-scroll");
    if (container) enableDragScroll(container);
  }

  // expose and auto-run
  window.Timeline = { loadTimelineGrouped, initTimeline, enableDragScroll, debounce, performSearch };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTimeline, { once: true });
  } else {
    initTimeline();
  }
})();
