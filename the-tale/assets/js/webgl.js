/* TALE · webgl.js — WebGL atmosphere (Three.js r149, hand-authored, no external assets).
   One fixed canvas; the camera travels down the page as the guest scrolls.

     · depth gold-dust field, velocity-reactive, chapter-tinted
     · soft near-camera bokeh
     · Sangeet chapter only: hanging paper lanterns on twin garlands
       (the SVG lantern set stays as the no-WebGL fallback)

   DPR-capped, paused when hidden, off under reduced motion / no WebGL. */
(function () {
  "use strict";
  if (!window.THREE) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var TALE = window.TALE = window.TALE || {};
  var canvas = document.getElementById("gl");
  if (!canvas) return;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch (e) { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  var scene = new THREE.Scene();
  var FOV = 35, CAMZ = 10;
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.z = CAMZ;

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  var sun = new THREE.DirectionalLight(0xfff2d8, 0.55);
  sun.position.set(3, 4, 6);
  scene.add(sun);

  var vw, vh, S, halfW;

  function visibleH() { return 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAMZ; }
  /* sangeet-local coordinates are centered offsets from the viewport midline */
  function wc(pxX) { return pxX * S; }
  function wy(pxY) { return -pxY * S; }

  function radialTexture(inner, outer) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function bandY(el, frac) {
    return el.offsetTop + el.offsetHeight * (frac === undefined ? 0.72 : frac);
  }
  function contentW() { return Math.min(vw, 860); }

  /* ───────── sangeet: lanterns on twin garlands ───────── */
  var lanternPieces = [], statics = [];
  function disposeGroup(g) {
    g.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    scene.remove(g);
  }
  function buildSangeet() {
    var el = document.getElementById("sangeet");
    if (!el) return;
    var band = bandY(el, 0.8);
    var W = contentW();
    var bodyGeo = new THREE.SphereGeometry(0.3, 20, 16);
    var bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf2cf8e, emissive: 0xffb053, emissiveIntensity: 0.85, roughness: 0.7, metalness: 0
    });
    var capMat = new THREE.MeshStandardMaterial({ color: 0x8a6b2f, roughness: 0.5, metalness: 0.55 });

    // twin tubes (centered offsets in px)
    var tubeMat = new THREE.MeshBasicMaterial({ color: 0xd9b36a });
    function tube(sagPx, liftPx) {
      var pts = [new THREE.Vector3(wc(-W / 2 - 30), wy(band + liftPx), 0),
                 new THREE.Vector3(wc(0), wy(band + sagPx), 0),
                 new THREE.Vector3(wc(W / 2 + 30), wy(band + liftPx), 0)];
      var curve = new THREE.QuadraticBezierCurve3(pts[0], pts[1], pts[2]);
      var mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, Math.max(0.012, S * 2.4), 6, false), tubeMat);
      scene.add(mesh);
      statics.push(mesh);
      return curve;
    }
    var upper = tube(64, -14);
    tube(236, -14);

    // five lanterns hang on the upper curve
    var xs = [-0.55, -0.27, 0, 0.27, 0.55];
    var scales = [0.72, 0.62, 0.68, 0.62, 0.72];
    xs.forEach(function (fx, i) {
      var pxX = fx * (W / 2 + 30);
      var t = (pxX / (W / 2 + 30) + 1) / 2;
      var p = upper.getPoint(Math.min(0.98, Math.max(0.02, t)));
      var g = new THREE.Group();
      var body = new THREE.Mesh(bodyGeo, bodyMat);
      body.scale.y = 1.18;
      g.add(body);
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.1, 12), capMat);
      cap.position.y = 0.34;
      g.add(cap);
      g.position.set(p.x, p.y - 0.22 * scales[i], 0);
      g.scale.setScalar(scales[i]);
      g.userData.phase = i * 1.4;
      scene.add(g);
      lanternPieces.push(g);
      if (i === 0 || i === 2) {
        var pl = new THREE.PointLight(0xffc46a, 1.0, 7, 2);
        pl.position.set(0, 0, 0.6);
        g.add(pl);
      }
    });
  }

  /* ───────── dust + near bokeh (wrap around the camera) ───────── */
  var dustMat, dustGeo, dustVel = [], dustPhase = [];
  function buildDust() {
    var N = Math.min(460, Math.max(220, Math.round(vw * vh / 3800)));
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * halfW * 2.4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = -6 + Math.random() * 9;
      dustVel[i] = 0.004 + Math.random() * 0.014;
      dustPhase[i] = Math.random() * Math.PI * 2;
    }
    dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var sprite = radialTexture("rgba(255,236,190,1)", "rgba(201,164,92,0)");
    dustMat = new THREE.PointsMaterial({
      size: 0.085, map: sprite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: new THREE.Color(0xc9a45c), opacity: 0.85, sizeAttenuation: true
    });
    scene.add(new THREE.Points(dustGeo, dustMat));
  }

  var bokehGeo, bokehMat;
  function buildBokeh() {
    var N = 44;
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * halfW * 2.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = 2.5 + Math.random() * 3;     // near camera → soft drifting orbs
    }
    bokehGeo = new THREE.BufferGeometry();
    bokehGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var sprite = radialTexture("rgba(255,226,160,.9)", "rgba(217,179,106,0)");
    bokehMat = new THREE.PointsMaterial({
      size: 0.42, map: sprite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0xd9b36a, opacity: 0.09, sizeAttenuation: true
    });
    scene.add(new THREE.Points(bokehGeo, bokehMat));
  }

  /* ───────── theme tint ───────── */
  var dustTarget = new THREE.Color(0xc9a45c), dustCurrent = new THREE.Color(0xc9a45c);
  function tintFromTheme(name) {
    var hex = TALE.THEME_COLORS && TALE.THEME_COLORS[name];
    if (!hex) { dustTarget.set(0xc9a45c); return; }
    dustTarget.set(hex).lerp(new THREE.Color(0xd9b36a), 0.45);
  }
  window.addEventListener("tale:theme", function (e) { tintFromTheme(e.detail && e.detail.name); });

  /* ───────── layout / rebuild ───────── */
  function rebuild() {
    lanternPieces.forEach(function (g) { disposeGroup(g); });
    statics.forEach(function (m) { disposeGroup(m); });
    lanternPieces.length = 0; statics.length = 0;

    vw = window.innerWidth; vh = window.innerHeight;
    S = visibleH() / vh;
    halfW = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAMZ * camera.aspect;

    if (!dustGeo) { buildDust(); buildBokeh(); }
    buildSangeet();
  }

  function resize() {
    vw = window.innerWidth; vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    rebuild();
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 200); });
  window.addEventListener("load", function () { resize(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { resize(); });
  resize();

  /* ───────── render loop ───────── */
  var raf = 0, running = false, t0 = performance.now();
  var frames = 0, fpsT = t0, lastY = window.scrollY, scrollVel = 0;
  TALE.gl = { _fps: 0, fps: function () { return TALE.gl._fps; } };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var t = (now - t0) / 1000;
    var y = window.scrollY;
    scrollVel = scrollVel * 0.9 + (y - lastY) * 0.1;
    lastY = y;

    // camera travels down the document with the scroll
    var camY = -(y + vh / 2) * S;
    camera.position.y = camY;
    camera.position.x = Math.sin(t * 0.11) * 0.12;   // faint breathing drift

    // lanterns bob on their strings
    for (var L = 0; L < lanternPieces.length; L++) {
      var lp = lanternPieces[L];
      lp.rotation.z = Math.sin(t * 0.7 + lp.userData.phase) * 0.05;
    }

    // dust drift + velocity blow + wrap around the camera
    var blow = Math.min(0.05, Math.abs(scrollVel) * 0.0016);
    var dir = scrollVel < -1 ? -0.6 : 1;
    var p = dustGeo.attributes.position.array;
    var wrapT = camY + 6.2, wrapB = camY - 6.2;
    for (var i = 0; i < dustVel.length; i++) {
      var j = i * 3;
      p[j + 1] += (dustVel[i] + blow) * dir;
      p[j] += Math.sin(t * 0.5 + dustPhase[i]) * 0.0018;
      if (p[j + 1] > wrapT) p[j + 1] = wrapB;
      else if (p[j + 1] < wrapB) p[j + 1] = wrapT;
    }
    dustGeo.attributes.position.needsUpdate = true;

    var pb = bokehGeo.attributes.position.array;
    for (var b = 0; b < 44; b++) {
      var k = b * 3;
      pb[k + 1] -= 0.003;
      if (pb[k + 1] < wrapB) pb[k + 1] = wrapT;
      if (pb[k + 1] > wrapT) pb[k + 1] = wrapB;
    }
    bokehGeo.attributes.position.needsUpdate = true;

    dustCurrent.lerp(dustTarget, 0.02);
    dustMat.color.copy(dustCurrent);

    renderer.render(scene, camera);

    frames++;
    if (now - fpsT > 1000) { TALE.gl._fps = Math.round(frames * 1000 / (now - fpsT)); frames = 0; fpsT = now; }
  }

  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); running = false; }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });
  start();

  var dust2d = document.getElementById("dust");
  if (dust2d) dust2d.style.display = "none";
  document.body.classList.add("gl-on");
})();
