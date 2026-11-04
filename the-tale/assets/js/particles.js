/* TALE · particles.js — drifting gold dust on a fixed Canvas2D layer.
   Cheap enough for low-end Androids; disabled under reduced motion. */
(function () {
  "use strict";
  window.TALE = window.TALE || {};

  var canvas, ctx, parts = [], raf = 0, dpr = 1, w = 0, h = 0, running = false;

  function make() {
    var count = Math.min(44, Math.max(20, Math.round((w * h) / 26000)));
    parts = [];
    for (var i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 1.6,
        a: 0.10 + Math.random() * 0.30,
        vy: -(0.04 + Math.random() * 0.16),
        vx: (Math.random() - 0.5) * 0.1,
        ph: Math.random() * Math.PI * 2,
        sw: 0.4 + Math.random() * 0.9
      });
    }
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(t * 0.0006 * p.sw + p.ph) * 0.18;
      if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
      if (p.x < -6) p.x = w + 6;
      if (p.x > w + 6) p.x = -6;
      var tw = 0.6 + 0.4 * Math.sin(t * 0.001 * p.sw + p.ph);
      ctx.globalAlpha = p.a * tw;
      ctx.fillStyle = "#c9a45c";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    make();
  }

  TALE.particles = {
    start: function () {
      if (running) return;
      canvas = document.getElementById("dust");
      if (!canvas || !canvas.getContext) return;
      ctx = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) { cancelAnimationFrame(raf); }
        else if (running) { raf = requestAnimationFrame(frame); }
      });
      running = true;
      raf = requestAnimationFrame(frame);
    }
  };
})();
