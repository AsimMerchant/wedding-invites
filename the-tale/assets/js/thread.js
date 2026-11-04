/* TALE · thread.js — the golden thread.
   Builds one continuous bezier path through every knot on the page and
   exposes scrub(progress) so the thread draws itself as the guest scrolls. */
(function () {
  "use strict";
  window.TALE = window.TALE || {};

  var main, svg, glow, core, len = 0, progress = 0;

  function centerInMain(el) {
    var r = el.getBoundingClientRect();
    var m = main.getBoundingClientRect();
    return { x: r.left - m.left + r.width / 2, y: r.top - m.top + r.height / 2 };
  }

  function build() {
    var H = main.scrollHeight;
    var W = main.clientWidth;
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);

    var startEl = document.querySelector(".scroll-cue");
    var endEl = document.querySelector(".close-line");
    var knots = Array.prototype.slice.call(document.querySelectorAll(".knot"));

    var pts = [];
    if (startEl) pts.push(centerInMain(startEl));
    knots.forEach(function (k) { pts.push(centerInMain(k)); });
    if (endEl) pts.push(centerInMain(endEl));
    if (pts.length < 2) return;

    var bow = Math.min(130, Math.max(44, W * 0.13));
    var d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 1], p1 = pts[i];
      var dy = p1.y - p0.y;
      var dir = i % 2 === 1 ? 1 : -1;
      var c1 = { x: p0.x + bow * dir, y: p0.y + dy * 0.42 };
      var c2 = { x: p1.x + bow * dir, y: p1.y - dy * 0.42 };
      d += " C " + c1.x.toFixed(1) + " " + c1.y.toFixed(1) +
           ", "   + c2.x.toFixed(1) + " " + c2.y.toFixed(1) +
           ", "   + p1.x.toFixed(1) + " " + p1.y.toFixed(1);
    }
    glow.setAttribute("d", d);
    core.setAttribute("d", d);
    len = core.getTotalLength();
    core.style.strokeDasharray = String(len);
    core.style.strokeDashoffset = String(len * (1 - progress));
  }

  TALE.thread = {
    init: function () {
      main = document.getElementById("tale");
      svg = document.getElementById("thread");
      glow = document.getElementById("threadGlow");
      core = document.getElementById("threadCore");
      if (!main || !svg || !core) return;
      build();
      var t;
      window.addEventListener("resize", function () {
        clearTimeout(t);
        t = setTimeout(function () { build(); }, 220);
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { build(); });
      }
    },
    scrub: function (p) {
      if (!core || !len) return;
      progress = Math.min(1, Math.max(0, p));
      core.style.strokeDashoffset = String(len * (1 - progress));
    },
    pointAt: function (p) {
      if (!core || !len) return null;
      return core.getPointAtLength(len * Math.min(1, Math.max(0, p)));
    }
  };
})();
