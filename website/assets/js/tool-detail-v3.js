/* Shared tool-detail V3: TOC scroll spy and explain-fold open/close.
   Loaded only by pages that opt in with body.nel-tool-v3.
   Does not calculate, does not rewrite copy, does not touch OPB app-v3.js. */
(function () {
  "use strict";

  function openExplainTarget(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const details = el.matches("details.fb-fold") ? el : (el.closest && el.closest("details.fb-fold"));
    if (details) {
      details.open = true;
      details.dataset.userToggled = "1";
    }
    const target = details || el;
    requestAnimationFrame(function () {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (_) {
        target.scrollIntoView(true);
      }
    });
  }

  function bindTocScrollSpy() {
    const toc = document.querySelector("body.nel-tool-v3 nav.toc");
    if (!toc) return;
    const links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;
    const items = links.map(function (a) {
      const href = a.getAttribute("href") || "";
      if (!/^#[A-Za-z][\w:-]*$/.test(href)) return null;
      const id = href.slice(1);
      const el = document.getElementById(id);
      return el ? { id: id, el: el, a: a } : null;
    }).filter(Boolean);
    if (!items.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        const on = (a.getAttribute("href") || "") === "#" + id;
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    }

    function currentId() {
      const marker = 120;
      let active = items[0].id;
      for (let i = 0; i < items.length; i++) {
        if (items[i].el.getBoundingClientRect().top <= marker) active = items[i].id;
      }
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 8) {
        active = items[items.length - 1].id;
      }
      return active;
    }

    let ticking = false;
    function update() {
      ticking = false;
      setActive(currentId());
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        const href = a.getAttribute("href") || "";
        if (href.charAt(0) === "#") setActive(href.slice(1));
      });
    });
    update();
    setTimeout(update, 100);
    setTimeout(update, 400);
  }

  function bindExplainAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      if (a.dataset.explainBound) return;
      const href = a.getAttribute("href") || "";
      if (!/^#[A-Za-z][\w:-]*$/.test(href)) return;
      a.dataset.explainBound = "1";
      a.addEventListener("click", function () {
        setTimeout(function () { openExplainTarget(href.slice(1)); }, 0);
      });
    });
    if (location.hash && /^#[A-Za-z][\w:-]*$/.test(location.hash)) {
      setTimeout(function () { openExplainTarget(location.hash.slice(1)); }, 50);
    }
    window.addEventListener("hashchange", function () {
      if (location.hash) openExplainTarget(location.hash.slice(1));
    });
  }

  function syncExplainFolds() {
    const desktop = window.matchMedia ? window.matchMedia("(min-width: 769px)").matches : true;
    document.querySelectorAll("body.nel-tool-v3 details.fb-fold").forEach(function (el) {
      el.classList.toggle("fb-desktop-open", desktop);
      if (desktop) {
        el.open = true;
      } else if (el.dataset.userToggled !== "1") {
        el.open = false;
      }
      if (el.dataset.foldBound) return;
      el.dataset.foldBound = "1";
      el.addEventListener("toggle", function () {
        const isDesktop = window.matchMedia ? window.matchMedia("(min-width: 769px)").matches : true;
        if (!isDesktop) el.dataset.userToggled = "1";
      });
    });
  }

  function bind() {
    if (!document.body || !document.body.classList.contains("nel-tool-v3")) return;
    syncExplainFolds();
    bindExplainAnchors();
    bindTocScrollSpy();
    if (window.matchMedia) {
      const mq = window.matchMedia("(min-width: 769px)");
      const onChange = function () { syncExplainFolds(); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
