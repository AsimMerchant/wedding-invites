/* TALE · audio.js — generative ambience: soft drone + sparse pentatonic plucks.
   No audio files, nothing copyrighted; created live via WebAudio. Off by default. */
(function () {
  "use strict";
  window.TALE = window.TALE || {};

  var state = { ctx: null, master: null, on: false, timer: null, nodes: [] };

  var SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C pentatonic

  function buildDrone(ctx, out) {
    var filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 340;
    filter.Q.value = 0.6;

    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 110;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    state.nodes.push(lfo);

    [[130.81, -4], [196.0, 3]].forEach(function (cfg) { // C3 + G3, gently detuned
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = cfg[0];
      osc.detune.value = cfg[1];
      g.gain.value = 0.045;
      osc.connect(g).connect(filter);
      osc.start();
      state.nodes.push(osc);
    });
    filter.connect(out);
  }

  function pluck(ctx, out) {
    var f = SCALE[Math.floor(Math.random() * SCALE.length)];
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    osc.type = "triangle";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    if (pan) { pan.pan.value = (Math.random() * 1.2 - 0.6); osc.connect(g).connect(pan).connect(out); }
    else { osc.connect(g).connect(out); }
    osc.start(t);
    osc.stop(t + 2.5);
    osc.onended = function () {
      g.disconnect();
      if (pan) pan.disconnect();
    };
  }

  function schedule() {
    clearTimeout(state.timer);
    state.timer = setTimeout(function () {
      if (state.on && state.ctx) pluck(state.ctx, state.master);
      schedule();
    }, 2600 + Math.random() * 3600);
  }

  function fade(to, secs) {
    var g = state.master.gain;
    var t = state.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(g.value, 0.0001), t);
    g.exponentialRampToValueAtTime(Math.max(to, 0.0001), t + secs);
  }

  TALE.audio = {};
  TALE.audio.toggle = function () {
    var btn = document.getElementById("soundToggle");
      function setPressed(on) {
        state.on = on;
        if (btn) {
          btn.setAttribute("aria-pressed", String(on));
          btn.setAttribute("aria-label", on ? "Pause ambient music" : "Play ambient music");
        }
      }
      if (!state.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { TALE.toast("Audio is not supported here"); return; }
        state.ctx = new AC();
        state.master = state.ctx.createGain();
        state.master.gain.value = 0.0001;
        state.master.connect(state.ctx.destination);
        buildDrone(state.ctx, state.master);
      }
      if (state.ctx.state === "suspended") state.ctx.resume();
      if (state.on) {
        fade(0.0001, 0.8);
        clearTimeout(state.timer);
        setPressed(false);
        TALE.toast("Ambience paused");
      } else {
        fade(0.55, 1.4);
        schedule();
        setPressed(true);
        TALE.toast("Ambience playing");
      }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("soundToggle");
    if (btn) {
      btn.addEventListener("click", TALE.audio.toggle);
      // stop audio when tab hidden (battery + etiquette)
      document.addEventListener("visibilitychange", function () {
        if (!state.ctx) return;
        if (document.hidden) state.ctx.suspend();
        else if (state.on) state.ctx.resume();
      });
    }
  });
})();
