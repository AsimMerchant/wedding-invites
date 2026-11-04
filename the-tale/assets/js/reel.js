/* TALE · reel.js — the A24-style chapter reel.
   Fixed stage, five 3D plates (one per chapter), wheel/touch/arrows scrub the
   carousel; the editorial overlay syncs to the focused plate. Facts mirror the
   live invitation exactly. Falls back to the main invite without WebGL or
   under reduced motion. */
(function () {
  "use strict";

  /* ───────── guards ───────── */
  function bail() { location.replace("./"); }
  if (!window.THREE) return bail();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return bail();

  var TALE = window.TALE = window.TALE || {};
  var canvas = document.getElementById("stage");
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
  } catch (e) { return bail(); }
  renderer.setClearColor(0xeef1ea, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  /* ───────── chapter facts (mirror the invitation) ───────── */
  var GOLD = "#b78e4e", INK = "#24406b", PAPER = "#f4f2ea";
  var CHAPTERS = [
    {
      key: "mehendi", num: "Chapter I", name: "Mehendi",
      date: "Friday, 4 December 2026", time: "From 11 AM onwards",
      venue: "53, Saffron, 5th Floor · Karimabad Society · Surat",
      tag: "Let every hand be hennaed, and every heart be glad.",
      accent: "#e8a13c", art: "mehendi"
    },
    {
      key: "haldi", num: "Chapter II", name: "Haldi",
      date: "Saturday, 5 December 2026", time: "11:30 AM",
      venue: "Mahadev Hotel Restaurant & Banquets · Botad",
      tag: "A shower of turmeric, a morning of laughter.",
      accent: "#d98e2b", art: "haldi"
    },
    {
      key: "sangeet", num: "Chapter III", name: "Sangeet",
      date: "Saturday, 5 December 2026", time: "8:00 PM",
      venue: "Mahadev Hotel Restaurant & Banquets · Botad",
      tag: "Where every step keeps beat, and the night learns to dance.",
      accent: "#e9c46a", art: "sangeet"
    },
    {
      key: "nikaah", num: "Chapter IV", name: "Baraat & Nikaah",
      date: "Sunday, 6 December 2026", time: "Baraat 10 AM · Nikaah 11 AM SHARP",
      venue: "Mahadev Hotel Restaurant & Banquets · Botad",
      tag: "The procession arrives; two lives are joined by a single word — Qubool hai.",
      accent: "#c9a45c", art: "nikaah"
    },
    {
      key: "reception", num: "Chapter V", name: "Reception",
      date: "Monday, 7 December 2026", time: "8 PM · Surat",
      venue: "Farohar Farms · Pal-Adajan · Surat",
      tag: "Please join us as we celebrate the newlyweds.",
      accent: "#e9d5b8", art: "reception"
    }
  ];
  var N = CHAPTERS.length, SPACING = 2.45;

  /* ───────── three basics ───────── */
  var scene = new THREE.Scene();
  var FOV = 42, CAMZ = 7.4;
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.z = CAMZ;
  scene.add(new THREE.AmbientLight(0xffffff, 0.92));
  var dir = new THREE.DirectionalLight(0xfff4dd, 0.62);
  dir.position.set(2.5, 3.5, 5);
  scene.add(dir);

  var carousel = new THREE.Group();
  scene.add(carousel);

  /* ───────── plate-face artwork (baked to canvas textures) ───────── */
  function plateFace(ch) {
    var c = document.createElement("canvas");
    c.width = c.height = 640;
    var x = c.getContext("2d");
    // face
    x.fillStyle = PAPER;
    x.fillRect(0, 0, 640, 640);
    var shade = x.createRadialGradient(320, 300, 120, 320, 320, 330);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(36,64,107,.10)");
    x.fillStyle = shade;
    x.fillRect(0, 0, 640, 640);
    // rings
    x.strokeStyle = GOLD; x.lineWidth = 9;
    x.beginPath(); x.arc(320, 320, 296, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 1.4; x.setLineDash([2, 7]);
    x.beginPath(); x.arc(320, 320, 276, 0, Math.PI * 2); x.stroke();
    x.setLineDash([]);
    // chapter name + numeral
    x.fillStyle = INK; x.textAlign = "center";
    x.font = "84px 'Pinyon Script', cursive";
    x.fillText(ch.name, 320, 190);
    x.fillStyle = GOLD; x.font = "22px 'Marcellus', serif";
    try { x.letterSpacing = "8px"; } catch (e) {}
    x.fillText(ch.num.toUpperCase(), 320, 468);
    try { x.letterSpacing = "0px"; } catch (e) {}
    // ornament diamond
    x.save(); x.translate(320, 505); x.rotate(Math.PI / 4);
    x.fillStyle = GOLD; x.fillRect(-7, -7, 14, 14);
    x.restore();
    // chapter art (centered)
    x.save(); x.translate(320, 330);
    x.strokeStyle = GOLD; x.lineWidth = 5; x.lineCap = "round"; x.lineJoin = "round";
    DRAW[ch.art](x, ch.accent);
    x.restore();
    return c;
  }

  var DRAW = {
    mehendi: function (x, acc) {
      x.beginPath(); x.moveTo(-120, 90);
      x.bezierCurveTo(-120, -60, 120, -60, 120, 90); x.stroke();
      x.beginPath(); x.moveTo(-96, 90);
      x.bezierCurveTo(-96, -30, 96, -30, 96, 90); x.stroke();
      var dots = [-100, -58, -16, 26, 68, 104];
      x.fillStyle = acc;
      for (var i = 0; i < dots.length; i++) {
        x.beginPath(); x.arc(dots[i], 104 - (i % 2) * 12, 10, 0, Math.PI * 2); x.fill();
      }
      x.beginPath(); x.moveTo(-150, 90); x.lineTo(150, 90); x.stroke();
    },
    haldi: function (x, acc) {
      x.beginPath(); x.arc(0, -20, 74, 0, Math.PI * 2); x.stroke();
      x.setLineDash([3, 10]); x.lineWidth = 3;
      x.beginPath(); x.arc(0, -20, 96, 0, Math.PI * 2); x.stroke();
      x.setLineDash([]);
      for (var i = 0; i < 8; i++) {
        var a = Math.PI * 2 * i / 8;
        x.beginPath();
        x.moveTo(Math.cos(a) * 108, -20 + Math.sin(a) * 108);
        x.lineTo(Math.cos(a) * 126, -20 + Math.sin(a) * 126);
        x.stroke();
      }
      x.fillStyle = acc;
      x.beginPath(); x.arc(0, 82, 42, 0, Math.PI, true); x.fill();
      x.beginPath(); x.ellipse(0, 82, 58, 10, 0, 0, Math.PI * 2); x.stroke();
    },
    sangeet: function (x, acc) {
      x.beginPath(); x.moveTo(-130, -60);
      x.quadraticCurveTo(0, 20, 130, -60); x.stroke();
      var lx = [-92, 0, 92];
      x.fillStyle = acc;
      for (var i = 0; i < 3; i++) {
        var ly = -60 + (i === 1 ? 40 : 20);
        x.beginPath(); x.moveTo(lx[i], ly); x.lineTo(lx[i], ly + 18); x.stroke();
        x.beginPath(); x.arc(lx[i], ly + 40, 20, 0, Math.PI * 2); x.fill();
        x.stroke();
        x.fillStyle = "#f2cf8e";
        x.beginPath(); x.arc(lx[i], ly + 62, 5, 0, Math.PI * 2); x.fill();
        x.fillStyle = acc;
      }
    },
    nikaah: function (x, acc) {
      x.beginPath(); x.moveTo(-64, 96); x.lineTo(-64, 10);
      x.bezierCurveTo(-64, -46, -28, -62, 0, -84);
      x.bezierCurveTo(28, -62, 64, -46, 64, 10);
      x.lineTo(64, 96); x.stroke();
      x.beginPath(); x.moveTo(0, -84); x.lineTo(0, -104); x.stroke();
      x.lineWidth = 4;
      x.beginPath(); x.arc(-6, -116, 10, 0.6, Math.PI * 1.7); x.stroke();
      x.beginPath(); x.moveTo(-108, 96); x.lineTo(-108, -30);
      x.moveTo(108, 96); x.lineTo(108, -30); x.stroke();
      x.beginPath(); x.moveTo(-118, -30); x.lineTo(-98, -30);
      x.moveTo(98, -30); x.lineTo(118, -30); x.stroke();
      x.fillStyle = acc;
      x.beginPath(); x.arc(0, -118, 4, 0, Math.PI * 2); x.fill();
    },
    reception: function (x, acc) {
      x.beginPath(); x.moveTo(-130, -66);
      x.quadraticCurveTo(-65, -6, 0, -14);
      x.quadraticCurveTo(65, -6, 130, -66); x.stroke();
      x.fillStyle = acc;
      var fx = [-104, -60, -16, 28, 72, 112];
      for (var i = 0; i < fx.length; i++) {
        var fy = -30 + Math.abs(fx[i]) * 0.24;
        x.beginPath(); x.arc(fx[i], fy, 5.5, 0, Math.PI * 2); x.fill();
      }
      x.strokeRect(-56, 26, 112, 44);
      x.beginPath(); x.moveTo(-40, 26); x.lineTo(-40, 6);
      x.quadraticCurveTo(0, -8, 40, 6); x.lineTo(40, 26); x.stroke();
      x.fillStyle = acc;
      x.beginPath(); x.arc(-22, 0, 5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(0, -6, 5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(22, 0, 5, 0, Math.PI * 2); x.fill();
    }
  };

  /* ───────── build plates ───────── */
  var plates = [];
  function build() {
    var edgeMat = new THREE.MeshStandardMaterial({ color: 0xb78e4e, roughness: 0.35, metalness: 0.6 });
    for (var i = 0; i < N; i++) {
      var tex = new THREE.CanvasTexture(plateFace(CHAPTERS[i]));
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.center.set(0.5, 0.5);
      tex.rotation = Math.PI / 2;   // cap UVs read sideways after the disc tilt
      var topMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, metalness: 0.04 });
      var disc = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.05, 0.035, 72),
        [edgeMat, topMat, topMat]
      );
      disc.rotation.x = Math.PI / 2;   // face the camera
      var g = new THREE.Group();
      g.add(disc);
      g.position.x = i * SPACING;
      g.userData.idx = i;
      carousel.add(g);
      plates.push(g);
    }
    // the golden thread running through every plate + the glint
    var lp = [];
    for (var j = -1; j <= N; j++) lp.push(new THREE.Vector3(j * SPACING, -0.06, -0.06));
    var thread = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(lp),
      new THREE.LineBasicMaterial({ color: 0xd9b36a, transparent: true, opacity: 0.55 })
    );
    carousel.add(thread);
    var glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe9b0 })
    );
    carousel.add(glint);
    plates.glint = glint;
  }
  build();

  /* ───────── overlay sync ───────── */
  var el = {
    num: document.getElementById("rNum"), name: document.getElementById("rName"),
    date: document.getElementById("rDate"), time: document.getElementById("rTime"),
    venue: document.getElementById("rVenue"), tag: document.getElementById("rTag"),
    maps: document.getElementById("rMaps"), cal: document.getElementById("rCal"),
    copy: document.getElementById("rCopy"), live: document.getElementById("rLive"),
    dots: document.querySelectorAll(".prog-dot")
  };
  var focused = -1;
  function sync(idx, instant) {
    if (idx === focused) return;
    focused = idx;
    var ch = CHAPTERS[idx];
    var apply = function () {
      el.num.textContent = ch.num;
      el.name.textContent = ch.name;
      el.date.textContent = ch.date;
      el.time.textContent = ch.time;
      el.venue.textContent = ch.venue;
      el.tag.textContent = ch.tag;
      if (TALE.VENUES && TALE.VENUES[ch.key]) el.maps.href = TALE.VENUES[ch.key];
      el.cal.setAttribute("data-ics", ch.key);
      el.copy.setAttribute("data-copy", TALE.EVENTS[ch.key].location);
      el.name.style.color = ch.accent === "#e9d5b8" ? INK : INK; // ink stays readable on paper
      for (var d = 0; d < el.dots.length; d++) el.dots[d].classList.toggle("on", d === idx);
    };
    if (instant || !window.gsap) { apply(); }
    else {
      gsap.to(".ed--top .ed-swap, .ed--bottom .ed-swap", {
        opacity: 0, y: 8, duration: 0.22, ease: "power2.in",
        onComplete: function () {
          apply();
          gsap.to(".ed--top .ed-swap, .ed--bottom .ed-swap", {
            opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.04
          });
        }
      });
    }
    el.live.textContent = ch.num + ": " + ch.name + ", " + ch.date + ", " + ch.time;
  }

  /* toast for copy feedback */
  var toast = document.createElement("div");
  toast.setAttribute("role", "status");
  toast.style.cssText = "position:fixed;z-index:30;bottom:7.5rem;left:50%;transform:translate(-50%,10px);" +
    "padding:.5rem 1.2rem;border-radius:999px;background:#24406b;color:#eef1ea;" +
    "font-family:'Marcellus',serif;font-size:.7rem;letter-spacing:.18em;opacity:0;transition:.35s;";
  document.body.appendChild(toast);
  function say(msg) {
    toast.textContent = msg;
    toast.style.opacity = "1";
    toast.style.transform = "translate(-50%,0)";
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translate(-50%,10px)";
    }, 2200);
  }

  el.maps.addEventListener("click", function () { /* href set by sync */ });
  el.cal.addEventListener("click", function () { say("Added to your calendar file"); });
  el.copy.addEventListener("click", function () {
    var t = el.copy.getAttribute("data-copy") || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { say("Address copied"); }, function () { say("Copy unavailable"); });
    } else { say("Copy unavailable"); }
  });

  /* ───────── input: wheel / touch / keys ───────── */
  var cur = 0, tgt = 0, idleT = 0;
  function clamp03(v) { return Math.min(N - 1, Math.max(0, v)); }
  function poke() {
    clearTimeout(idleT);
    idleT = setTimeout(function () { tgt = Math.round(clamp03(tgt)); }, 650);
  }
  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    var d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    tgt = clamp03(tgt + d * 0.0016);
    poke();
  }, { passive: false });

  var dragX = null;
  window.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".rbtn, .ed-back")) return;
    dragX = e.clientX;
  });
  window.addEventListener("pointermove", function (e) {
    if (dragX === null) return;
    var dx = e.clientX - dragX;
    dragX = e.clientX;
    tgt = clamp03(tgt - dx * 0.0042);
    poke();
  });
  window.addEventListener("pointerup", function () { dragX = null; poke(); });

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { tgt = clamp03(Math.round(tgt) + 1); poke(); }
    if (e.key === "ArrowLeft") { tgt = clamp03(Math.round(tgt) - 1); poke(); }
  });

  /* ───────── resize ───────── */
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  /* ───────── render loop ───────── */
  var t0 = performance.now();
  var frames = 0, fpsT = t0;
  var lowFpsWindows = 0, lastResize = t0;
  window.addEventListener("resize", function () { lastResize = performance.now(); lowFpsWindows = 0; });
  TALE.gl = { _fps: 0, fps: function () { return TALE.gl._fps; } };

  gsap.ticker.add(function (time) {
    try {
    cur += (tgt - cur) * 0.085;
    carousel.position.x = -cur * SPACING;
    carousel.position.y = -0.12;   // sit slightly below the metadata column

    for (var i = 0; i < N; i++) {
      var g = plates[i];
      var off = i - cur;
      g.rotation.y = THREE.MathUtils.clamp(off, -1.6, 1.6) * -0.38;
      var f = 1 - Math.min(1, Math.abs(off)) * 0.22;
      g.scale.setScalar(0.88 + 0.3 * f);
      g.position.y = Math.sin(time * 0.8 + i * 1.35) * 0.045;
      g.position.z = -Math.min(1, Math.abs(off)) * 0.5;
    }
    var fi = THREE.MathUtils.clamp(Math.round(cur), 0, N - 1);
    plates.glint.position.set(fi * SPACING, -0.06, 0.05);
    plates.glint.scale.setScalar(1 + Math.sin(time * 3.2) * 0.18);

    sync(fi, false);
    renderer.render(scene, camera);

    frames++;
    var now = performance.now();
    if (now - fpsT > 1000) {
      TALE.gl._fps = Math.round(frames * 1000 / (now - fpsT));
      // graceful bail only on *sustained* struggle while actually visible —
      // backgrounded tabs / resize spikes never count
      if (TALE.gl._fps > 0 && TALE.gl._fps < 24 && document.visibilityState === "visible" &&
          now - t0 > 9000 && now - lastResize > 3000) {
        lowFpsWindows++;
        if (lowFpsWindows >= 3) location.replace("./");
      } else { lowFpsWindows = 0; }
      frames = 0; fpsT = now;
    }
    } catch (err) {
      if (!window.__reelErrs) window.__reelErrs = [];
      if (window.__reelErrs.length < 5) window.__reelErrs.push(err.message + " @ " + (err.stack || "").split("\n")[1]);
    }
  });

  /* ───────── boot ───────── */
  function boot() {
    sync(0, true);
    resize();
    gsap.from(".ed--top, .ed--bottom", { autoAlpha: 0, y: 18, duration: 0.9, ease: "expo.out", stagger: 0.12, delay: 0.2 });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      // textures use Pinyon/Marcellus — re-bake once real fonts exist
      plates.forEach(function (g, i) {
        var tex = new THREE.CanvasTexture(plateFace(CHAPTERS[i]));
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.center.set(0.5, 0.5);
        tex.rotation = Math.PI / 2;
        g.children[0].material[1].map = tex;
        g.children[0].material[1].needsUpdate = true;
      });
      boot();
    });
  } else { boot(); }

  window.addEventListener("resize", function () { /* keep loop-driven camera aspect fresh */ });
})();
