/* TALE · reel.js — the A24-style chapter reel, poster-disc grade.
   Fixed stage; five painted-poster discs (one per chapter) scrubbed by
   wheel/touch/arrows; the editorial overlay syncs to the focused disc.
   Facts mirror the live invitation. Falls back to the main invite
   without WebGL or under reduced motion. */
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  /* ───────── chapter facts (mirror the invitation) ───────── */
  var GOLD = "#d9b36a", INK = "#24406b";
  var BACK_RIM = "THE TALE OF F & A · #THETALEOFFANDA · ASIM & FEMINA · ";
  var CHAPTERS = [
    {
      key: "mehendi", num: "CHAPTER I", name: "Mehendi",
      date: "Friday, 4 December 2026", time: "From 11 AM onwards",
      venue: "53, Saffron, 5th Floor · Karimabad Society · Surat",
      tag: "Let every hand be hennaed, and every heart be glad.",
      rim: "ASIM WEDS FEMINA · THE TALE OF F & A · 4 — 7 DECEMBER 2026 · ",
      paint: "mehendi",
      frontDate: "FRIDAY · 4 DECEMBER 2026", dateColor: "#e8a13c",
      backPal: { bg1: "#24402f", bg2: "#101d16", ink: "#e9e2c8", sub: "rgba(233,226,200,.66)" }
    },
    {
      key: "haldi", num: "CHAPTER II", name: "Haldi",
      date: "Saturday, 5 December 2026", time: "11:30 AM",
      venue: "Mahadev Hotel Restaurant & Banquets · Botad",
      tag: "A shower of turmeric, a morning of laughter.",
      rim: "THE TALE OF F & A · HALDI · 5 DECEMBER 2026 · BOTAD · ASIM & FEMINA · ",
      paint: "haldi",
      frontDate: "SATURDAY · 5 DECEMBER 2026", dateColor: "#8a6a2a",
      backPal: { bg1: "#5f4a1c", bg2: "#33260b", ink: "#f2e4c2", sub: "rgba(242,228,194,.66)" }
    },
    {
      key: "sangeet", num: "CHAPTER III", name: "Sangeet",
      date: "Saturday, 5 December 2026", time: "8:00 PM",
      venue: "Mahadev Hotel Restaurant & Banquets · Botad",
      tag: "Where every step keeps beat, and the night learns to dance.",
      rim: "#THETALEOFFANDA · ASIM & FEMINA · 4 — 7 DECEMBER 2026 · ",
      paint: "sangeet",
      frontDate: "SATURDAY · 5 DECEMBER 2026", dateColor: "#e9c46a",
      backPal: { bg1: "#1c2848", bg2: "#0b1024", ink: "#ece2c8", sub: "rgba(236,226,200,.64)" }
    },
    {
      key: "nikaah", num: "CHAPTER IV", name: "Baraat & Nikaah",
      date: "Sunday, 6 December 2026", time: "Baraat 10 AM · Nikaah 11 AM SHARP",
      venue: "Mahadev Hotel Restaurant & Banquets · Botad",
      tag: "The procession arrives; two lives are joined by a single word — Qubool hai.",
      rim: "NIKAAH · 6 DECEMBER 2026 · BOTAD · QUBOOL HAI · THE TALE OF F & A · ",
      paint: "nikaah",
      frontDate: "SUNDAY · 6 DECEMBER 2026", dateColor: "#a3803c",
      backPal: { bg1: "#2c3450", bg2: "#171d30", ink: "#e8e4d4", sub: "rgba(232,228,212,.66)" }
    },
    {
      key: "reception", num: "CHAPTER V", name: "Reception",
      date: "Monday, 7 December 2026", time: "8 PM · Surat",
      venue: "Farohar Farms · Pal-Adajan · Surat",
      tag: "Please join us as we celebrate the newlyweds.",
      rim: "RECEPTION · 7 DECEMBER 2026 · SURAT · THE TALE OF F & A · ASIM & FEMINA · ",
      paint: "reception",
      frontDate: "MONDAY · 7 DECEMBER 2026", dateColor: "#e9d5b8",
      backPal: { bg1: "#40222e", bg2: "#200f16", ink: "#f0e2cf", sub: "rgba(240,226,207,.66)" }
    }
  ];
  var N = CHAPTERS.length, SPACING = 2.62;

  /* ───────── three basics ───────── */
  var scene = new THREE.Scene();
  var FOV = 38, CAMZ = 5.0;
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 40);
  camera.position.z = CAMZ;
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var key = new THREE.DirectionalLight(0xfff3e0, 1.15);
  key.position.set(2.2, 2.6, 4);
  scene.add(key);
  var rimLight = new THREE.DirectionalLight(0xd9e4ef, 0.45);
  rimLight.position.set(-3, -1.5, -3);
  scene.add(rimLight);
  var carousel = new THREE.Group();
  scene.add(carousel);

  /* ───────── poster painting helpers ───────── */
  function grain(x, S, n) {
    for (var i = 0; i < n; i++) {
      x.fillStyle = "rgba(" + (Math.random() > 0.5 ? "255,255,255" : "0,0,0") + "," + (Math.random() * 0.05) + ")";
      x.fillRect(Math.random() * S, Math.random() * S, 1.6, 1.6);
    }
  }
  function glowDot(x, px, py, r, color, alpha) {
    x.save();
    x.globalAlpha = alpha;
    x.shadowColor = color; x.shadowBlur = r * 0.9;
    x.fillStyle = color;
    x.beginPath(); x.arc(px, py, r * 0.45, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  function ringText(x, text, cx, cy, radius, size, color, startAngle) {
    x.save();
    x.translate(cx, cy); x.rotate(startAngle || -Math.PI / 2);
    x.fillStyle = color;
    x.font = size + "px 'Marcellus', serif";
    x.textAlign = "center"; x.textBaseline = "middle";
    var arc = (size * 0.9) / radius;
    for (var i = 0; i < text.length; i++) {
      x.save(); x.rotate(i * arc); x.translate(0, -radius);
      x.fillText(text[i], 0, 0); x.restore();
    }
    x.restore();
  }
  function capsLine(x, text, cx, cy, step, color, size) {
    x.fillStyle = color; x.font = size + "px 'Marcellus', serif"; x.textAlign = "center";
    var lx = cx - (text.length * step) / 2;
    for (var i = 0; i < text.length; i++) x.fillText(text[i], lx + i * step, cy);
  }

  /* curved text that follows the disc — top arc reads upright along the top,
     bottom arc reads upright along the bottom (badge/record-label style) */
  function arcLayout(text, R, size, ls, maxSpan) {
    var step = (size * ls) / R;
    var span = step * Math.max(1, text.length - 1);
    if (span > maxSpan) { span = maxSpan; step = span / Math.max(1, text.length - 1); }
    return { step: step, span: span };
  }
  function topArc(x, text, cx, cy, R, size, color, ls, font) {
    var L = arcLayout(text, R, size, ls, 2.9);
    x.save();
    x.fillStyle = color;
    x.font = size + "px " + (font || "'Marcellus', serif");
    x.textAlign = "center"; x.textBaseline = "middle";
    for (var i = 0; i < text.length; i++) {
      var a = -Math.PI / 2 - L.span / 2 + i * L.step;
      x.save();
      x.translate(cx + R * Math.cos(a), cy + R * Math.sin(a));
      x.rotate(a + Math.PI / 2);
      x.fillText(text[i], 0, 0);
      x.restore();
    }
    x.restore();
  }
  function bottomArc(x, text, cx, cy, R, size, color, ls, font) {
    var L = arcLayout(text, R, size, ls, 2.9);
    x.save();
    x.fillStyle = color;
    x.font = size + "px " + (font || "'Marcellus', serif");
    x.textAlign = "center"; x.textBaseline = "middle";
    for (var i = 0; i < text.length; i++) {
      var a = Math.PI / 2 + L.span / 2 - i * L.step;
      x.save();
      x.translate(cx + R * Math.cos(a), cy + R * Math.sin(a));
      x.rotate(a - Math.PI / 2);
      x.fillText(text[i], 0, 0);
      x.restore();
    }
    x.restore();
  }

  /* ───────── poster painters (1024×1024) ───────── */
  var PAINT = {
    mehendi: function (x, S) {
      var g = x.createLinearGradient(0, 0, 0, S);
      g.addColorStop(0, "#2e5440"); g.addColorStop(1, "#16281e");
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      var v = x.createRadialGradient(S/2, S/2, S*0.25, S/2, S/2, S*0.62);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(8,16,12,.55)");
      x.fillStyle = v; x.fillRect(0, 0, S, S);
      for (var i = 0; i < 26; i++) {
        var a = Math.random() * Math.PI * 2, d = 130 + Math.random() * 330;
        glowDot(x, S/2 + Math.cos(a) * d, S/2 + Math.sin(a) * d, 14 + Math.random() * 30, "#e8a13c", 0.14 + Math.random() * 0.2);
      }
      x.strokeStyle = "#d9b36a"; x.lineWidth = 10;
      x.beginPath(); x.moveTo(212, 700);
      x.bezierCurveTo(212, 360, 812, 360, 812, 700); x.stroke();
      x.lineWidth = 4; x.strokeStyle = "#a3803c";
      x.beginPath(); x.moveTo(258, 700);
      x.bezierCurveTo(258, 420, 766, 420, 766, 700); x.stroke();
      [[330, "#e8a13c", "#c47a1e"], [512, "#f0dca4", "#d98e2b"], [694, "#e8a13c", "#c47a1e"]].forEach(function (s) {
        var len = s[0] === 512 ? 300 : 210;
        for (var d = 0; d < len; d += 44) {
          var py = 560 + d, sway = Math.sin(d * 0.02) * 14;
          var px = s[0] + sway * (d / len);
          glowDot(x, px, py, 26, s[2], 0.75);
          x.fillStyle = s[1];
          x.beginPath(); x.arc(px, py, 17, 0, Math.PI * 2); x.fill();
          x.fillStyle = "rgba(0,0,0,.22)";
          x.beginPath(); x.arc(px + 4, py + 5, 9, 0, Math.PI * 2); x.fill();
          x.fillStyle = s[1];
          x.beginPath(); x.arc(px - 3, py - 4, 8, 0, Math.PI * 2); x.fill();
        }
      });
      x.textAlign = "center";
      x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 24;
      x.fillStyle = "#f0dca4"; x.font = "150px 'Pinyon Script', cursive";
      x.fillText("Mehendi", S/2, 268);
      x.shadowBlur = 0;
    },
    haldi: function (x, S) {
      var g = x.createLinearGradient(0, 0, 0, S);
      g.addColorStop(0, "#f6e7c8"); g.addColorStop(1, "#e7c78e");
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      var v = x.createRadialGradient(S/2, S/2, S*0.28, S/2, S/2, S*0.64);
      v.addColorStop(0, "rgba(255,244,214,.5)"); v.addColorStop(1, "rgba(122,84,24,.28)");
      x.fillStyle = v; x.fillRect(0, 0, S, S);
      x.strokeStyle = "#a3803c"; x.lineWidth = 10;
      x.beginPath(); x.arc(S/2, S/2 - 30, 150, 0, Math.PI * 2); x.stroke();
      x.lineWidth = 4; x.setLineDash([4, 16]);
      x.beginPath(); x.arc(S/2, S/2 - 30, 196, 0, Math.PI * 2); x.stroke();
      x.setLineDash([]);
      for (var i = 0; i < 12; i++) {
        var a = Math.PI * 2 * i / 12;
        x.beginPath();
        x.moveTo(S/2 + Math.cos(a) * 214, S/2 - 30 + Math.sin(a) * 214);
        x.lineTo(S/2 + Math.cos(a) * 246, S/2 - 30 + Math.sin(a) * 246);
        x.stroke();
      }
      x.fillStyle = "#d98e2b";
      x.beginPath(); x.arc(S/2, S/2 - 30, 92, Math.PI, 0); x.fill();
      glowDot(x, S/2, S/2 - 42, 60, "#fff3d0", 0.9);
      for (var p = 0; p < 18; p++) {
        var pa = Math.random() * Math.PI * 2, pd = 120 + Math.random() * 300;
        x.fillStyle = "rgba(217,142,43," + (0.2 + Math.random() * 0.35) + ")";
        x.beginPath();
        x.ellipse(S/2 + Math.cos(pa) * pd, S/2 + Math.sin(pa) * pd * 0.8, 9, 5, pa, 0, Math.PI * 2);
        x.fill();
      }
      x.textAlign = "center";
      x.shadowColor = "rgba(122,84,24,.5)"; x.shadowBlur = 20;
      x.fillStyle = "#6b4a12"; x.font = "150px 'Pinyon Script', cursive";
      x.fillText("Haldi", S/2, 258);
      x.shadowBlur = 0;
    },
    sangeet: function (x, S) {
      var g = x.createLinearGradient(0, 0, 0, S);
      g.addColorStop(0, "#1c2848"); g.addColorStop(1, "#0b1024");
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      var v = x.createRadialGradient(S/2, S/2, S*0.25, S/2, S/2, S*0.62);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(4,6,16,.6)");
      x.fillStyle = v; x.fillRect(0, 0, S, S);
      for (var i = 0; i < 60; i++) {
        x.fillStyle = "rgba(240,220,164," + (Math.random() * 0.7) + ")";
        x.fillRect(Math.random() * S, Math.random() * S * 0.6, 2.2, 2.2);
      }
      x.fillStyle = "#f0dca4";
      x.beginPath(); x.arc(738, 258, 50, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#141c36";
      x.beginPath(); x.arc(756, 244, 45, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#d9b36a"; x.lineWidth = 7;
      [[70, 210], [40, 330]].forEach(function (cfg) {
        x.beginPath(); x.moveTo(-20, cfg[0]);
        x.quadraticCurveTo(S/2, cfg[0] + cfg[1] * 1.5, S + 20, cfg[0]);
        x.stroke();
      });
      [[150, 355, 92], [400, 470, 112], [640, 470, 96], [880, 355, 88]].forEach(function (L) {
        glowDot(x, L[0], L[1], L[2], "#ffd98a", 0.85);
        x.fillStyle = "#f2cf8e";
        x.beginPath(); x.ellipse(L[0], L[1], 52, 62, 0, 0, Math.PI * 2); x.fill();
        x.strokeStyle = "#a3803c"; x.lineWidth = 6;
        x.beginPath(); x.moveTo(L[0] - 20, L[1] - 64); x.lineTo(L[0] + 20, L[1] - 64);
        x.quadraticCurveTo(L[0], L[1] - 44, L[0] - 20, L[1] - 64); x.stroke();
        x.fillStyle = "#fff3d0";
        x.beginPath(); x.arc(L[0], L[1] + 58, 12, 0, Math.PI * 2); x.fill();
      });
      x.textAlign = "center";
      x.shadowColor = "rgba(0,0,0,.65)"; x.shadowBlur = 26;
      x.fillStyle = "#f0dca4"; x.font = "150px 'Pinyon Script', cursive";
      x.fillText("Sangeet", S/2, 800);
      x.shadowBlur = 0;
    },
    nikaah: function (x, S) {
      var g = x.createLinearGradient(0, 0, 0, S);
      g.addColorStop(0, "#f5efe2"); g.addColorStop(1, "#e6dcc2");
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      var v = x.createRadialGradient(S/2, S/2, S*0.28, S/2, S/2, S*0.64);
      v.addColorStop(0, "rgba(255,252,242,.55)"); v.addColorStop(1, "rgba(90,84,50,.22)");
      x.fillStyle = v; x.fillRect(0, 0, S, S);
      x.fillStyle = "#f7e9c4";
      x.beginPath(); x.arc(756, 250, 46, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#efe6cf";
      x.beginPath(); x.arc(774, 238, 40, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#b78e4e"; x.lineWidth = 10;
      x.beginPath(); x.moveTo(312, 780); x.lineTo(312, 500);
      x.bezierCurveTo(312, 400, 400, 360, 512, 320);
      x.bezierCurveTo(624, 360, 712, 400, 712, 500);
      x.lineTo(712, 780); x.stroke();
      x.lineWidth = 6;
      x.beginPath(); x.moveTo(512, 320); x.lineTo(512, 268); x.stroke();
      x.beginPath(); x.arc(504, 246, 16, 0.6, Math.PI * 1.7); x.stroke();
      x.lineWidth = 7;
      x.beginPath(); x.moveTo(232, 780); x.lineTo(232, 460);
      x.moveTo(792, 780); x.lineTo(792, 460); x.stroke();
      x.beginPath(); x.moveTo(204, 460); x.lineTo(260, 460);
      x.moveTo(764, 460); x.lineTo(820, 460); x.stroke();
      x.lineWidth = 4; x.setLineDash([3, 12]);
      x.beginPath(); x.moveTo(380, 700); x.lineTo(380, 540);
      x.moveTo(644, 700); x.lineTo(644, 540); x.stroke();
      x.setLineDash([]);
      x.textAlign = "center";
      x.shadowColor = "rgba(90,84,50,.45)"; x.shadowBlur = 18;
      x.fillStyle = "#3a4a6b"; x.font = "132px 'Pinyon Script', cursive";
      x.fillText("Baraat & Nikaah", S/2, 252);
      x.shadowBlur = 0;
    },
    reception: function (x, S) {
      var g = x.createLinearGradient(0, 0, 0, S);
      g.addColorStop(0, "#4a2434"); g.addColorStop(1, "#26121c");
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      var v = x.createRadialGradient(S/2, S/2, S*0.25, S/2, S/2, S*0.62);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(12,4,8,.6)");
      x.fillStyle = v; x.fillRect(0, 0, S, S);
      x.strokeStyle = "#d9b36a"; x.lineWidth = 9;
      x.beginPath(); x.moveTo(-10, 240);
      x.quadraticCurveTo(S/4, 420, S/2, 408);
      x.quadraticCurveTo(S*3/4, 420, S + 10, 240); x.stroke();
      for (var i = 0; i < 22; i++) {
        var fx = 60 + Math.random() * (S - 120);
        var fy = 430 + Math.sin(fx / 90) * 60 + Math.random() * 130;
        glowDot(x, fx, fy, 12 + Math.random() * 16, "#ffdf9e", 0.5 + Math.random() * 0.4);
      }
      x.fillStyle = "#e9d5b8";
      x.beginPath(); x.ellipse(S/2, 750, 240, 36, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = "rgba(0,0,0,.3)";
      x.beginPath(); x.ellipse(S/2, 756, 240, 32, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#f3e6d6";
      x.fillRect(S/2 - 150, 640, 300, 100);
      x.strokeStyle = "#d9b36a"; x.lineWidth = 4;
      x.strokeRect(S/2 - 150, 640, 300, 100);
      x.fillStyle = "#fff3d0";
      [[S/2 - 90, 640], [S/2, 630], [S/2 + 90, 640]].forEach(function (c) {
        glowDot(x, c[0], c[1] - 10, 34, "#ffd98a", 0.8);
        x.beginPath(); x.arc(c[0], c[1], 14, 0, Math.PI * 2); x.fill();
      });
      x.textAlign = "center";
      x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 24;
      x.fillStyle = "#f0dca4"; x.font = "150px 'Pinyon Script', cursive";
      x.fillText("Reception", S/2, 262);
      x.shadowBlur = 0;
    }
  };

  function paintPoster(ch) {
    var S = 1024, c = document.createElement("canvas");
    c.width = c.height = S;
    var x = c.getContext("2d");
    PAINT[ch.paint](x, S);
    // per-chapter date, arced along the bottom of the disc
    x.save();
    x.shadowColor = "rgba(0,0,0,.4)"; x.shadowBlur = 12;
    bottomArc(x, ch.frontDate, S/2, S/2, 396, 26, ch.dateColor, 0.72);
    x.restore();
    // rim band + arc text + grain
    x.strokeStyle = GOLD; x.lineWidth = 30;
    x.beginPath(); x.arc(S/2, S/2, 472, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "rgba(217,179,106,.35)"; x.lineWidth = 2;
    x.beginPath(); x.arc(S/2, S/2, 440, 0, Math.PI * 2); x.stroke();
    ringText(x, ch.rim, S/2, S/2, 428, 30, "#f0dca4", 0);
    grain(x, S, 2600);
    return c;
  }

  /* B-side label — muted, themed, everything curved like a real record label */
  function paintBack(ch) {
    var S = 1024, cx = S/2, cy = S/2, c = document.createElement("canvas");
    c.width = c.height = S;
    var x = c.getContext("2d");
    var P = ch.backPal;
    var g = x.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, P.bg1); g.addColorStop(1, P.bg2);
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    var v = x.createRadialGradient(cx, cy, S*0.18, cx, cy, S*0.62);
    v.addColorStop(0, "rgba(255,255,255,.05)"); v.addColorStop(1, "rgba(0,0,0,.38)");
    x.fillStyle = v; x.fillRect(0, 0, S, S);

    // rim band + outer arc
    x.strokeStyle = GOLD; x.lineWidth = 30;
    x.beginPath(); x.arc(cx, cy, 472, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "rgba(217,179,106,.3)"; x.lineWidth = 2;
    x.beginPath(); x.arc(cx, cy, 440, 0, Math.PI * 2); x.stroke();
    ringText(x, BACK_RIM, cx, cy, 428, 30, "rgba(240,220,164,.85)", 0);

    // name + chapter, arced along the top
    var nameSize = ch.name.length > 10 ? 84 : 100;
    topArc(x, ch.name, cx, cy, 322, nameSize, P.ink, 0.6, "'Pinyon Script', cursive");
    topArc(x, ch.num, cx, cy, 252, 24, P.sub, 0.9);

    // date & time, arced around the spindle
    topArc(x, ch.frontDate, cx, cy, 196, 29, P.ink, 0.68);
    bottomArc(x, ch.time.toUpperCase(), cx, cy, 196, 29, P.ink, 0.68);

    // venue label + venue, arced along the bottom
    bottomArc(x, "V E N U E", cx, cy, 300, 20, P.sub, 0.8);
    bottomArc(x, ch.venue.toUpperCase(), cx, cy, 356, 26, P.ink, 0.68);

    // label perforation ring + printed spindle
    x.strokeStyle = "rgba(217,179,106,.45)"; x.lineWidth = 2;
    x.setLineDash([3, 9]);
    x.beginPath(); x.arc(cx, cy, 150, 0, Math.PI * 2); x.stroke();
    x.setLineDash([]);
    x.strokeStyle = GOLD; x.lineWidth = 6;
    x.beginPath(); x.arc(cx, cy, 46, 0, Math.PI * 2); x.stroke();
    x.fillStyle = "rgba(0,0,0,.2)";
    x.beginPath(); x.arc(cx, cy, 36, 0, Math.PI * 2); x.fill();
    x.save(); x.translate(cx, cy); x.rotate(Math.PI / 4);
    x.fillStyle = GOLD; x.fillRect(-5, -5, 10, 10);
    x.restore();

    grain(x, S, 2200);
    return c;
  }

  /* ───────── disc factory (annulus, hub, shadow) ───────── */
  var shadowTex = (function () {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(128, 128, 20, 128, 128, 128);
    g.addColorStop(0, "rgba(30,40,60,.4)");
    g.addColorStop(1, "rgba(30,40,60,0)");
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();

  function buildDisc(ch) {
    var g = new THREE.Group();
    var idx = CHAPTERS.indexOf(ch);

    var frontTex = new THREE.CanvasTexture(paintPoster(ch));
    frontTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var backTex = new THREE.CanvasTexture(paintBack(ch));
    backTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    var faceMat = new THREE.MeshPhysicalMaterial({
      map: frontTex, roughness: 0.34, metalness: 0.08,
      clearcoat: 1, clearcoatRoughness: 0.22
    });
    var backMat = new THREE.MeshPhysicalMaterial({
      map: backTex, roughness: 0.4, metalness: 0.05,
      clearcoat: 1, clearcoatRoughness: 0.25
    });
    var edgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xcfd6de, roughness: 0.25, metalness: 0.35,
      clearcoat: 0.8, clearcoatRoughness: 0.2
    });

    /* flip group — rotates π on tap: poster front ↔ label back */
    var flip = new THREE.Group();

    // front face: annulus with planar-mapped poster
    var ringGeo = new THREE.RingGeometry(0.156, 1, 96, 1);
    var pos = ringGeo.attributes.position;
    var ruv = ringGeo.attributes.uv;
    for (var i = 0; i < ruv.count; i++) {
      ruv.setXY(i, (pos.getX(i) + 1) / 2, (pos.getY(i) + 1) / 2);
    }
    var front = new THREE.Mesh(ringGeo, faceMat);
    front.position.z = 0.0235;
    front.userData.plateIdx = idx;
    flip.add(front);

    // back face: full printed label (pre-rotated; reads correct after flip)
    var back = new THREE.Mesh(new THREE.CircleGeometry(1, 96), backMat);
    back.rotation.y = Math.PI;
    back.position.z = -0.0235;
    back.userData.plateIdx = idx;
    flip.add(back);

    // clear plastic hubs on both faces
    var hubGeo = new THREE.TorusGeometry(0.185, 0.026, 14, 48);
    var hubMat = new THREE.MeshPhysicalMaterial({
      color: 0xe8edf3, roughness: 0.12, metalness: 0.1,
      transparent: true, opacity: 0.55, clearcoat: 1
    });
    var hubF = new THREE.Mesh(hubGeo, hubMat);
    hubF.position.z = 0.03;
    hubF.userData.plateIdx = idx;
    flip.add(hubF);
    var hubB = new THREE.Mesh(hubGeo, hubMat);
    hubB.position.z = -0.03;
    hubB.rotation.x = Math.PI;
    hubB.userData.plateIdx = idx;
    flip.add(hubB);

    // rim wall (does not flip — symmetric)
    var rimMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.045, 96, 1, true),
      edgeMat
    );
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.userData.plateIdx = idx;

    var tilt = new THREE.Group();
    tilt.add(flip);
    tilt.add(rimMesh);
    g.add(tilt);

    g.userData.tilt = tilt;
    g.userData.flip = flip;
    g.userData.flipped = false;
    g.userData.frontTex = frontTex;
    g.userData.backTex = backTex;
    g.userData.pick = [front, back, rimMesh, hubF, hubB];

    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 2.5),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 })
    );
    shadow.position.set(0.22, -1.5, -0.45);
    shadow.rotation.x = -0.35;
    g.add(shadow);
    g.userData.shadow = shadow;

    g.position.x = idx * SPACING;
    carousel.add(g);
    return g;
  }

  var plates = CHAPTERS.map(buildDisc);

  // the golden thread running through every disc + the glint
  var lp = [];
  for (var j = -1; j <= N; j++) lp.push(new THREE.Vector3(j * SPACING, -0.05, -0.08));
  var thread = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(lp),
    new THREE.LineBasicMaterial({ color: 0xd9b36a, transparent: true, opacity: 0.5 })
  );
  carousel.add(thread);
  var glint = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xffe9b0 })
  );
  carousel.add(glint);

  /* ───────── overlay sync ───────── */
  var el = {
    tag: document.getElementById("rTag"),
    maps: document.getElementById("rMaps"), cal: document.getElementById("rCal"),
    copy: document.getElementById("rCopy"), live: document.getElementById("rLive"),
    flipBtn: document.getElementById("rFlip"),
    dots: document.querySelectorAll(".prog-dot")
  };
  var focused = -1;

  /* flip: poster front ↔ label back — animated in the render loop itself
     (no tween-lib dependency: flips must work even when timers throttle) */
  function setFlip(g, want, fast) {
    if (!g || g.userData.flipped === want) return;
    g.userData.flipped = want;
    document.body.classList.toggle("disc-flipped", want);   // hide the overlay tagline (the back has its own)
    var cur = g.userData.flip.rotation.y;
    var target = want ? Math.PI : 0;
    // shortest path around the circle
    var diff = ((target - cur) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    g.userData.flipAnim = { from: cur, delta: diff, t0: performance.now(), dur: fast ? 550 : 1150 };
    var ch = CHAPTERS[plates.indexOf(g)];
    el.live.textContent = want
      ? "Back of the " + ch.name + " disc: " + ch.date + ", " + ch.time + ", " + ch.venue
      : "Front of the " + ch.name + " disc";
  }

  var raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  var wpV = new THREE.Vector3(), ptV = new THREE.Vector3();
  function tapDisc(clientX, clientY) {
    ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    var g = plates[focused];
    var hits = raycaster.intersectObjects(g.userData.pick, false);
    var flip = hits.length > 0;
    if (!flip) {
      // tapped the spindle hole (or a hair off the rim) — still flip if the
      // point lands within the disc: intersect the disc's plane, measure radius
      g.getWorldPosition(wpV);
      var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -wpV.z);
      if (raycaster.ray.intersectPlane(plane, ptV)) {
        var dx = ptV.x - wpV.x, dy = ptV.y - wpV.y;
        flip = (dx * dx + dy * dy) <= 1.0;
      }
    }
    if (flip) setFlip(g, !g.userData.flipped, false);
  }

  function sync(idx, instant) {
    if (idx === focused) return;
    var prev = focused;
    focused = idx;
    if (prev >= 0 && plates[prev].userData.flipped) setFlip(plates[prev], false, true);
    var ch = CHAPTERS[idx];
    var apply = function () {
      el.tag.textContent = ch.tag;
      if (TALE.VENUES && TALE.VENUES[ch.key]) el.maps.href = TALE.VENUES[ch.key];
      el.cal.setAttribute("data-ics", ch.key);
      el.copy.setAttribute("data-copy", TALE.EVENTS[ch.key].location);
      for (var d = 0; d < el.dots.length; d++) el.dots[d].classList.toggle("on", d === idx);
    };
    if (instant) { apply(); }
    else {
      el.tag.classList.add("out");
      setTimeout(function () {
        apply();
        el.tag.classList.remove("out");
      }, 230);
    }
    el.live.textContent = ch.num + ": " + ch.name + ", " + ch.date + ", " + ch.time;
  }

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

  el.cal.addEventListener("click", function () { say("Added to your calendar file"); });
  el.copy.addEventListener("click", function () {
    var t = el.copy.getAttribute("data-copy") || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { say("Address copied"); }, function () { say("Copy unavailable"); });
    } else { say("Copy unavailable"); }
  });

  /* ───────── input: wheel / touch / keys ───────── */
  var cur = 0, tgt = 0, idleT = 0;
  function clamp04(v) { return Math.min(N - 1, Math.max(0, v)); }
  function poke() {
    clearTimeout(idleT);
    idleT = setTimeout(function () { tgt = Math.round(clamp04(tgt)); }, 650);
  }
  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    var d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    tgt = clamp04(tgt + d * 0.0016);
    poke();
  }, { passive: false });

  var dragX = null, dragY = null, dragT = 0, moved = 0;
  window.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".rbtn, .ed-back")) return;
    dragX = e.clientX; dragY = e.clientY; dragT = performance.now(); moved = 0;
  });
  window.addEventListener("pointermove", function (e) {
    if (dragX === null) return;
    var dx = e.clientX - dragX;
    moved += Math.abs(dx) + Math.abs(e.clientY - dragY);
    dragY = e.clientY;
    dragX = e.clientX;
    tgt = clamp04(tgt - dx * 0.0042);
    poke();
  });
  window.addEventListener("pointerup", function (e) {
    if (dragX !== null && moved < 10 && performance.now() - dragT < 450) {
      tapDisc(e.clientX, e.clientY);   // a clean tap on the disc = flip it
    }
    dragX = null; poke();
  });

  el.flipBtn.addEventListener("click", function () {
    setFlip(plates[focused], !plates[focused].userData.flipped, false);
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { tgt = clamp04(Math.round(tgt) + 1); poke(); }
    if (e.key === "ArrowLeft") { tgt = clamp04(Math.round(tgt) - 1); poke(); }
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
  var frames = 0, fpsT = t0, mx = 0, my = 0;
  var lowFpsWindows = 0, lastResize = t0;
  window.addEventListener("resize", function () { lastResize = performance.now(); lowFpsWindows = 0; });
  window.addEventListener("pointermove", function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
    key.position.set(mx * 3.4, 2.4 - my * 1.6, 4);
  });
  TALE.gl = { _fps: 0, fps: function () { return TALE.gl._fps; } };
  /* debug hook (harmless in prod) */
  TALE.reelDebug = {
    plates: plates,
    setFlip: setFlip,
    tap: tapDisc,
    focused: function () { return focused; },
    cam: camera,
    state: function () {
      return plates.map(function (p, i) {
        return { i: i, flipped: p.userData.flipped, flipY: +p.userData.flip.rotation.y.toFixed(3) };
      });
    }
  };

  gsap.ticker.add(function (time) {
    try {
    cur += (tgt - cur) * 0.085;
    carousel.position.x = -cur * SPACING;
    camera.position.x += ((mx * 0.16) - camera.position.x) * 0.04;
    camera.position.y += ((-my * 0.1) - camera.position.y) * 0.04;

    for (var i = 0; i < N; i++) {
      var g = plates[i];
      var off = i - cur;
      g.userData.tilt.rotation.y = THREE.MathUtils.clamp(off, -1.6, 1.6) * -0.34;
      var f = 1 - Math.min(1, Math.abs(off)) * 0.2;
      g.scale.setScalar(0.9 + 0.26 * f);
      g.position.y = Math.sin(time * 0.7 + i * 1.35) * 0.05;
      g.position.z = -Math.min(1, Math.abs(off)) * 0.55;

      // flip animation (cubic in-out) + mid-flip lift toward the camera
      var fa = g.userData.flipAnim;
      if (fa) {
        var ms = performance.now() - fa.t0;
        var k = Math.min(1, ms / fa.dur);
        var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        g.userData.flip.rotation.y = fa.from + fa.delta * e;
        g.userData.flip.position.z = Math.sin(k * Math.PI) * 0.22;
        if (k >= 1) {
          g.userData.flipAnim = null;
          g.userData.flip.position.z = 0;
        }
      }
    }
    var fi = THREE.MathUtils.clamp(Math.round(cur), 0, N - 1);
    glint.position.set(fi * SPACING, -0.05, 0.04);
    glint.scale.setScalar(1 + Math.sin(time * 3.2) * 0.16);

    sync(fi, false);
    renderer.render(scene, camera);

    frames++;
    var now = performance.now();
    if (now - fpsT > 1000) {
      TALE.gl._fps = Math.round(frames * 1000 / (now - fpsT));
      if (TALE.gl._fps > 0 && TALE.gl._fps < 24 && document.visibilityState === "visible" &&
          now - t0 > 9000 && now - lastResize > 3000) {
        lowFpsWindows++;
        if (lowFpsWindows >= 3) location.replace("./");
      } else { lowFpsWindows = 0; }
      frames = 0; fpsT = now;
    }
    } catch (err) {
      if (!window.__reelErrs) window.__reelErrs = [];
      if (window.__reelErrs.length < 5) window.__reelErrs.push(err.message);
    }
  });

  /* ───────── boot ───────── */
  function boot() {
    sync(0, true);
    resize();
    // reveal the overlay via CSS (robust under throttled timers)
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      document.body.classList.add("booted");
    }); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      // posters use Pinyon/Marcellus — repaint both faces once real fonts exist
      plates.forEach(function (g, i) {
        g.userData.frontTex.image = paintPoster(CHAPTERS[i]);
        g.userData.frontTex.needsUpdate = true;
        g.userData.backTex.image = paintBack(CHAPTERS[i]);
        g.userData.backTex.needsUpdate = true;
      });
      boot();
    });
  } else { boot(); }
})();
