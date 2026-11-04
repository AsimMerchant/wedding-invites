/* LAB · disc quality test — can we reach the A24 physicality?
   Two painted-poster discs (Mehendi, Sangeet): real annulus geometry with a
   center hole, printed poster texture with rim typography arc, clearcoat gloss,
   clear plastic hub, soft contact shadow, pointer-driven key light, floaty tilt.
   Pure rAF, no gsap — this page is only about the object quality. */
(function () {
  "use strict";
  if (!window.THREE) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("stage");
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setClearColor(0xf0efe9, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.set(0, 0, 4.75);

  /* studio lighting */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var key = new THREE.DirectionalLight(0xfff3e0, 1.15);          // follows the pointer
  key.position.set(2.2, 2.6, 4);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xd9e4ef, 0.5);           // cool edge light
  rim.position.set(-3, -1.5, -3);
  scene.add(rim);

  /* ───────── poster painters ───────── */
  function grain(x, size, n) {
    for (var i = 0; i < n; i++) {
      x.fillStyle = "rgba(" + (Math.random() > 0.5 ? "255,255,255" : "0,0,0") + "," + (Math.random() * 0.05) + ")";
      x.fillRect(Math.random() * size, Math.random() * size, 1.6, 1.6);
    }
  }
  function glowDot(x, px, py, r, color, alpha) {
    x.save();
    x.globalAlpha = alpha;
    x.shadowColor = color;
    x.shadowBlur = r * 0.9;
    x.fillStyle = color;
    x.beginPath(); x.arc(px, py, r * 0.45, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  function ringText(x, text, cx, cy, radius, size, color, startAngle) {
    x.save();
    x.translate(cx, cy);
    x.rotate(startAngle || -Math.PI / 2);
    x.fillStyle = color;
    x.font = size + "px 'Marcellus', serif";
    x.textAlign = "center"; x.textBaseline = "middle";
    var arc = (size * 0.9) / radius;                  // per-char angle
    for (var i = 0; i < text.length; i++) {
      x.save();
      x.rotate(i * arc);
      x.translate(0, -radius);
      x.fillText(text[i], 0, 0);
      x.restore();
    }
    x.restore();
  }

  function paintMehendi() {
    var S = 1024, c = document.createElement("canvas");
    c.width = c.height = S;
    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, "#2e5440"); g.addColorStop(1, "#16281e");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    // deep vignette
    var v = x.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.62);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(8,16,12,.55)");
    x.fillStyle = v; x.fillRect(0, 0, S, S);
    // marigold bokeh field
    for (var i = 0; i < 26; i++) {
      var a = Math.random() * Math.PI * 2, d = 130 + Math.random() * 330;
      glowDot(x, S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, 14 + Math.random() * 30, "#e8a13c", 0.14 + Math.random() * 0.2);
    }
    // henna arch silhouette
    x.strokeStyle = "#d9b36a"; x.lineWidth = 10;
    x.beginPath(); x.moveTo(212, 700);
    x.bezierCurveTo(212, 360, 812, 360, 812, 700); x.stroke();
    x.lineWidth = 4; x.strokeStyle = "#a3803c";
    x.beginPath(); x.moveTo(258, 700);
    x.bezierCurveTo(258, 420, 766, 420, 766, 700); x.stroke();
    // hanging marigold garlands (dense petals)
    var strands = [[330, "#e8a13c", "#c47a1e"], [512, "#f0dca4", "#d98e2b"], [694, "#e8a13c", "#c47a1e"]];
    strands.forEach(function (s) {
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
    // title
    x.textAlign = "center";
    x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 24;
    x.fillStyle = "#f0dca4";
    x.font = "150px 'Pinyon Script', cursive";
    x.fillText("Mehendi", S / 2, 268);
    x.shadowBlur = 0;
    x.fillStyle = "#e8a13c";
    x.font = "34px 'Marcellus', serif";
    var sub = "CHAPTER I · 4 DECEMBER · SURAT";
    var lx = S / 2 - (sub.length * 19) / 2;
    for (var si = 0; si < sub.length; si++) { x.fillText(sub[si], lx + si * 19, 330); }
    // rim band + arc text
    x.strokeStyle = "#d9b36a"; x.lineWidth = 30;
    x.beginPath(); x.arc(S / 2, S / 2, 472, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "rgba(217,179,106,.35)"; x.lineWidth = 2;
    x.beginPath(); x.arc(S / 2, S / 2, 440, 0, Math.PI * 2); x.stroke();
    ringText(x, "ASIM WEDS FEMINA · THE TALE OF F & A · 4 — 7 DECEMBER 2026 · ", S / 2, S / 2, 428, 30, "#f0dca4", 0);
    grain(x, S, 2600);
    return c;
  }

  function paintSangeet() {
    var S = 1024, c = document.createElement("canvas");
    c.width = c.height = S;
    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, "#1c2848"); g.addColorStop(1, "#0b1024");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    var v = x.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.62);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(4,6,16,.6)");
    x.fillStyle = v; x.fillRect(0, 0, S, S);
    // stars
    for (var i = 0; i < 60; i++) {
      x.fillStyle = "rgba(240,220,164," + (Math.random() * 0.7) + ")";
      x.fillRect(Math.random() * S, Math.random() * S * 0.6, 2.2, 2.2);
    }
    // crescent
    x.fillStyle = "#f0dca4";
    x.beginPath(); x.arc(738, 258, 50, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#141c36";
    x.beginPath(); x.arc(756, 244, 45, 0, Math.PI * 2); x.fill();
    // twin garlands + glowing lanterns
    x.strokeStyle = "#d9b36a"; x.lineWidth = 7;
    [[70, 210], [40, 330]].forEach(function (cfg) {
      x.beginPath(); x.moveTo(-20, cfg[0]);
      x.quadraticCurveTo(S / 2, cfg[0] + cfg[1] * 1.5, S + 20, cfg[0]);
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
    // title
    x.textAlign = "center";
    x.shadowColor = "rgba(0,0,0,.65)"; x.shadowBlur = 26;
    x.fillStyle = "#f0dca4";
    x.font = "150px 'Pinyon Script', cursive";
    x.fillText("Sangeet", S / 2, 800);
    x.shadowBlur = 0;
    x.fillStyle = "#e9c46a";
    x.font = "34px 'Marcellus', serif";
    var sub = "CHAPTER III · 5 DECEMBER · BOTAD";
    var lx = S / 2 - (sub.length * 19) / 2;
    for (var si = 0; si < sub.length; si++) { x.fillText(sub[si], lx + si * 19, 864); }
    // rim band + arc text
    x.strokeStyle = "#d9b36a"; x.lineWidth = 30;
    x.beginPath(); x.arc(S / 2, S / 2, 472, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "rgba(217,179,106,.35)"; x.lineWidth = 2;
    x.beginPath(); x.arc(S / 2, S / 2, 440, 0, Math.PI * 2); x.stroke();
    ringText(x, "THE TALE OF F & A · #THETALEOFFANDA · ASIM & FEMINA · 4 — 7 DECEMBER 2026 · ", S / 2, S / 2, 428, 30, "#f0dca4", 0);
    grain(x, S, 2600);
    return c;
  }

  /* ───────── disc factory ───────── */
  function softShadowTexture() {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(128, 128, 20, 128, 128, 128);
    g.addColorStop(0, "rgba(30,40,60,.4)");
    g.addColorStop(1, "rgba(30,40,60,0)");
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  function buildDisc(painter, px) {
    var group = new THREE.Group();
    var posterCanvas = painter();

    // annulus with real center hole, extruded for thickness
    var shape = new THREE.Shape();
    shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
    var hole = new THREE.Path();
    hole.absarc(0, 0, 0.155, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    var geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012,
      bevelSegments: 3, curveSegments: 96
    });
    // planar UVs from bounding box → poster maps flat onto the face
    geo.computeBoundingBox();
    var bb = geo.boundingBox, sz = new THREE.Vector3();
    bb.getSize(sz);
    var uv = geo.attributes.uv;
    for (var i = 0; i < uv.count; i++) {
      uv.setXY(i, (uv.getX(i) - bb.min.x) / sz.x, (uv.getY(i) - bb.min.y) / sz.y);
    }
    var tex = new THREE.CanvasTexture(posterCanvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var faceMat = new THREE.MeshPhysicalMaterial({
      map: tex, roughness: 0.34, metalness: 0.08,
      clearcoat: 1, clearcoatRoughness: 0.22
    });
    var edgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xcfd6de, roughness: 0.25, metalness: 0.35,
      clearcoat: 0.8, clearcoatRoughness: 0.2
    });
    var disc = new THREE.Mesh(geo, [faceMat, edgeMat, faceMat]);
    group.add(disc);

    // clear plastic hub ring around the hole
    var hub = new THREE.Mesh(
      new THREE.TorusGeometry(0.185, 0.028, 14, 48),
      new THREE.MeshPhysicalMaterial({
        color: 0xe8edf3, roughness: 0.12, metalness: 0.1,
        transparent: true, opacity: 0.55, clearcoat: 1
      })
    );
    hub.position.z = 0.03;
    group.add(hub);

    // soft contact shadow (fake, floats under the disc)
    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({ map: softShadowTexture(), transparent: true, depthWrite: false, opacity: 0.55 })
    );
    shadow.position.set(px * 0.06, -1.55, -0.4);
    shadow.rotation.x = -0.35;
    scene.add(shadow);
    group.userData.shadow = shadow;

    group.position.set(px, 0, 0);
    scene.add(group);
    group.userData.tex = tex;
    group.userData.painter = painter;   // repaint after webfonts load
    return group;
  }

  /* ───────── stage ───────── */
  var discL = buildDisc(paintMehendi, -1.35);
  var discR = buildDisc(paintSangeet, 1.35);
  discR.rotation.y = -0.14;
  discL.rotation.y = 0.1;

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  /* repaint once real webfonts exist (Pinyon titles, Marcellus arcs) */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      [discL, discR].forEach(function (d) {
        d.userData.tex.image = d.userData.painter();
        d.userData.tex.needsUpdate = true;
      });
    });
  }

  /* pointer → tilt + key-light sweep */
  var mx = 0, my = 0;
  window.addEventListener("pointermove", function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ───────── loop ───────── */
  var t0 = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    var t = (now - t0) / 1000;

    key.position.set(mx * 3.4, 2.4 - my * 1.6, 4);

    [discL, discR].forEach(function (d, i) {
      var ph = i * 2.1;
      d.position.y = Math.sin(t * 0.7 + ph) * 0.07;
      d.rotation.x = my * 0.22 + Math.sin(t * 0.5 + ph) * 0.04;
      d.rotation.y = (i === 0 ? 0.1 : -0.14) + mx * 0.28 + Math.sin(t * 0.4 + ph) * 0.03;
      d.userData.shadow.position.x = d.position.x * 0.98 + 0.25;
      d.userData.shadow.material.opacity = 0.4 - d.position.y * 0.8;
    });
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
})();
