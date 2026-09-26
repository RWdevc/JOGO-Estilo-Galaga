/* audio.js — SFX procedural via Web Audio (laser agudo + explosão crushing) */
(function () {
  'use strict';
  var ctx = null, muted = false, noiseBuf = null;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // buffer de ruído reutilizável
    var len = ctx.sampleRate * 0.5;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function laser() {
    if (muted) return; var c = ensure(); if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.13);
  }

  function enemyLaser() {
    if (muted) return; var c = ensure(); if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.2);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.21);
  }

  // Explosão "crushing": ruído + lowpass descendo + sub sine
  function explosion(big) {
    if (muted) return; var c = ensure(); if (!c) return;
    var t = c.currentTime, dur = big ? 0.55 : 0.32;
    var src = c.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = big ? 0.6 : 1.0;
    var f = c.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(big ? 2500 : 3500, t);
    f.frequency.exponentialRampToValueAtTime(80, t + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(big ? 0.35 : 0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    // bit-crush fake: waveshaper
    var ws = c.createWaveShaper();
    var curve = new Float32Array(256);
    for (var i = 0; i < 256; i++) {
      var x = i / 128 - 1;
      curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.4); // achata = crush
    }
    ws.curve = curve;
    src.connect(f); f.connect(ws); ws.connect(g); g.connect(c.destination);
    src.start(t); src.stop(t + dur);
    // sub thump
    var o = c.createOscillator(), og = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(30, t + dur);
    og.gain.setValueAtTime(0.25, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(og); og.connect(c.destination);
    o.start(t); o.stop(t + dur);
  }

  function levelClear() {
    if (muted) return; var c = ensure(); if (!c) return;
    var notes = [523, 659, 784, 1046];
    notes.forEach(function (fq, i) {
      var t = c.currentTime + i * 0.09;
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'square'; o.frequency.value = fq;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.13);
    });
  }

  window.AudioSys = {
    unlock: ensure,
    laser: laser,
    enemyLaser: enemyLaser,
    explosion: explosion,
    levelClear: levelClear,
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; }
  };
})();
