/* TALE · main.js — orchestration: veil, smooth scroll, themes, reveals,
   thread scrub, knots, countdown, cursor, share. */
(function () {
  "use strict";

  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;
  var veil = document.getElementById("veil");
  var main = document.getElementById("tale");

  var THEME_COLORS = {
    paper: "#eef1ea", mehendi: "#22392e", haldi: "#f3e7cd",
    sangeet: "#131a30", nikaah: "#f5efe2", reception: "#3a1f2b"
  };

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- theme + phone chrome color ---------- */
  TALE.THEME_COLORS = THEME_COLORS;
  function setTheme(name) {
    body.setAttribute("data-theme", name);
    var meta = document.getElementById("metaTheme");
    if (meta && THEME_COLORS[name]) meta.setAttribute("content", THEME_COLORS[name]);
    window.dispatchEvent(new CustomEvent("tale:theme", { detail: { name: name } }));
  }

  /* ---------- the veil (preloader) ---------- */
  var pct = document.getElementById("veilPercent");
  var veilStart = performance.now();
  var veilTick = setInterval(function () {
    if (!pct) return clearInterval(veilTick);
    var t = Math.min(1, (performance.now() - veilStart) / 1500);
    pct.textContent = Math.round(t * 100);
    if (t >= 1) clearInterval(veilTick);
  }, 50);

  function openVeil() {
    clearInterval(veilTick);
    var done = function () {
      veil.remove();
      body.classList.remove("lock");
      if (TALE.lenis) TALE.lenis.start();
      ScrollTrigger.refresh();
    };
    if (!motionOK || !window.gsap) {
      if (veil) veil.style.display = "none";
      done();
      return;
    }
    gsap.to(veil, { autoAlpha: 0, duration: 0.9, ease: "power2.inOut", onComplete: done });
    gsap.to(".chapter--overture .will-reveal", {
      y: 0, autoAlpha: 1, duration: 1.2, ease: "expo.out",
      stagger: 0.1, delay: 0.25, clearProps: "transform"
    });
  }

  if (veil) {
    body.classList.add("lock");
    var loaded = new Promise(function (res) {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", res, { once: true });
    });
    var minTime = new Promise(function (res) { setTimeout(res, 1750); });
    var safety = new Promise(function (res) { setTimeout(res, 4200); });
    Promise.race([Promise.all([loaded, minTime]), safety]).then(openVeil);
  } else {
    openVeil();
  }

  /* ---------- smooth scroll (Lenis + GSAP ticker) ---------- */
  if (motionOK && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    TALE.lenis = lenis;
    lenis.stop(); // resume after the veil lifts
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- the golden thread ---------- */
  TALE.thread.init();
  var spark = document.createElement("div");
  spark.className = "thread-spark";
  spark.setAttribute("aria-hidden", "true");
  main.appendChild(spark);
  if (motionOK) {
    ScrollTrigger.create({
      trigger: main, start: "top top", end: "bottom bottom",
      onUpdate: function (self) {
        TALE.thread.scrub(self.progress);
        var pt = TALE.thread.pointAt(self.progress);
        if (pt) spark.style.transform = "translate(" + pt.x.toFixed(1) + "px," + pt.y.toFixed(1) + "px)";
      }
    });
  } else {
    TALE.thread.scrub(1);
    spark.style.display = "none";
  }

  /* ---------- chapter themes ---------- */
  document.querySelectorAll(".chapter[data-theme]").forEach(function (ch) {
    ScrollTrigger.create({
      trigger: ch, start: "top 55%", end: "bottom 55%",
      onEnter: function () { setTheme(ch.getAttribute("data-theme")); },
      onEnterBack: function () { setTheme(ch.getAttribute("data-theme")); }
    });
  });

  /* ---------- reveals + knots + parallax + hero drift ---------- */
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return words.map(function (w) {
      var mask = document.createElement("span");
      mask.className = "w-mask";
      var inner = document.createElement("span");
      inner.className = "w-word";
      inner.textContent = w;
      mask.appendChild(inner);
      el.appendChild(mask);
      el.appendChild(document.createTextNode(" "));
      return inner;
    });
  }

  if (motionOK) {
    document.querySelectorAll(".chapter").forEach(function (ch) {
      if (ch.classList.contains("chapter--overture")) return; // handled by the veil timeline
      var title = ch.querySelector(".chapter-title");
      if (title) {
        var words = splitWords(title);
        gsap.set(words, { yPercent: 118 });
      }
      var els = ch.querySelectorAll(".will-reveal");
      if (!els.length) return;
      gsap.set(els, { y: 34, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: ch, start: "top 72%", once: true,
        onEnter: function () {
          if (title) {
            gsap.to(title.querySelectorAll(".w-word"), {
              yPercent: 0, duration: 0.95, ease: "expo.out", stagger: 0.07
            });
          }
          gsap.to(els, { y: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.085 });
        }
      });
    });

    // hero drift: the names part company as the tale begins
    gsap.to(".name-a", {
      yPercent: -26, ease: "none",
      scrollTrigger: { trigger: "#overture", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".name-b", {
      yPercent: 26, ease: "none",
      scrollTrigger: { trigger: "#overture", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".overture-when", {
      autoAlpha: 0.25, ease: "none",
      scrollTrigger: { trigger: "#overture", start: "center top", end: "bottom top", scrub: true }
    });

    document.querySelectorAll(".knot").forEach(function (k) {
      ScrollTrigger.create({
        trigger: k, start: "top 64%",
        onEnter: function () { k.classList.add("lit"); },
        onLeaveBack: function () { k.classList.remove("lit"); }
      });
    });

    document.querySelectorAll(".scene").forEach(function (s) {
      gsap.fromTo(s, { yPercent: 5 }, {
        yPercent: -5, ease: "none",
        scrollTrigger: {
          trigger: s.closest(".chapter"),
          start: "top bottom", end: "bottom top", scrub: true
        }
      });
    });
  } else {
    document.querySelectorAll(".knot").forEach(function (k) { k.classList.add("lit"); });
  }

  /* ---------- countdown to the Mehendi ---------- */
  var TARGET = new Date("2026-12-04T11:00:00+05:30").getTime();
  var cd = {
    d: document.getElementById("cdDays"), h: document.getElementById("cdHours"),
    m: document.getElementById("cdMins"), s: document.getElementById("cdSecs"),
    note: document.getElementById("cdNote")
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function tickCountdown() {
    var diff = TARGET - Date.now();
    if (diff <= 0) {
      if (cd.d) cd.d.textContent = "0"; if (cd.h) cd.h.textContent = "00";
      if (cd.m) cd.m.textContent = "00"; if (cd.s) cd.s.textContent = "00";
      if (cd.note) cd.note.textContent = "the tale has begun — see you there";
      clearInterval(cd.timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    if (cd.d) cd.d.textContent = String(Math.floor(s / 86400));
    if (cd.h) cd.h.textContent = pad(Math.floor(s / 3600) % 24);
    if (cd.m) cd.m.textContent = pad(Math.floor(s / 60) % 60);
    if (cd.s) cd.s.textContent = pad(s % 60);
  }
  tickCountdown();
  cd.timer = setInterval(tickCountdown, 1000);

  /* ---------- custom cursor (desktop, fine pointers) ---------- */
  if (motionOK && window.matchMedia("(pointer: fine)").matches) {
    body.classList.add("has-cursor");
    var cur = document.getElementById("cursor");
    var pos = { x: innerWidth / 2, y: innerHeight / 2 };
    var tgt = { x: pos.x, y: pos.y };
    window.addEventListener("mousemove", function (e) {
      tgt.x = e.clientX; tgt.y = e.clientY;
      cur.style.opacity = "1";
    });
    gsap.ticker.add(function () {
      pos.x += (tgt.x - pos.x) * 0.18;
      pos.y += (tgt.y - pos.y) * 0.18;
      cur.style.transform = "translate(" + pos.x + "px," + pos.y + "px)";
    });
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button")) cur.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button")) cur.classList.remove("is-hover");
    });
  }

  /* ---------- share the tale ---------- */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = {
        title: "Asim weds Femina — The Tale of F & A",
        text: "Two souls with but a single thought, two hearts that beat as one. 4–7 December 2026 · Surat & Botad · #TheTaleofFandA",
        url: location.href
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          TALE.toast("Invitation link copied");
        });
      }
    });
  }

  /* ---------- gold dust ---------- */
  if (motionOK && TALE.particles) TALE.particles.start();

  /* ---------- final layout settle ---------- */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
