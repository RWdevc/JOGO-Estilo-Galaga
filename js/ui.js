/* ui.js — score topo, energia inferior, overlays */
(function () {
  'use strict';
  var el = {};
  var flashTimer = null;

  function pad(n) {
    n = String(Math.max(0, n | 0));
    while (n.length < 6) n = '0' + n;
    return n;
  }

  function init() {
    el.score = document.getElementById('score');
    el.hi = document.getElementById('hi');
    el.level = document.getElementById('level');
    el.lives = document.getElementById('lives');
    el.fill = document.getElementById('energy-fill');
    el.wrap = document.getElementById('energy-wrap');
    el.num = document.getElementById('energy-num');
    el.overlay = document.getElementById('overlay');
    el.ovTitle = document.getElementById('ov-title');
    el.ovSub = document.getElementById('ov-sub');
    el.ovWave = document.getElementById('ov-wave');
    el.flash = document.getElementById('flash-msg');
  }

  function update(s) {
    el.score.textContent = pad(s.score);
    el.hi.textContent = pad(s.hi);
    el.level.textContent = s.level;
    var hearts = '';
    for (var i = 0; i < Math.max(0, s.lives); i++) hearts += '✖';
    el.lives.textContent = hearts || '—';
    var e = Math.max(0, Math.min(100, s.energy));
    el.fill.style.width = e + '%';
    el.num.textContent = Math.ceil(e);
    el.wrap.classList.toggle('low', e < 25);
  }

  function showTitle(waveName) {
    el.overlay.classList.remove('hidden');
    el.ovTitle.innerHTML = 'SNACK<br>INVADERS';
    el.ovSub.textContent = 'Hambúrgueres do espaço estão atacando!';
    el.ovWave.textContent = waveName;
    document.getElementById('btn-start').textContent = '▶ INSERIR FICHA / START';
  }
  function showGameOver(score, hi) {
    el.overlay.classList.remove('hidden');
    el.ovTitle.innerHTML = 'GAME<br>OVER';
    el.ovSub.textContent = 'Score ' + pad(score) + ' · Hi ' + pad(hi);
    el.ovWave.textContent = 'Toque START para tentar de novo';
    document.getElementById('btn-start').textContent = '↻ JOGAR NOVAMENTE';
  }
  function hide() { el.overlay.classList.add('hidden'); }
  function isVisible() { return !el.overlay.classList.contains('hidden'); }

  function flash(msg, ms) {
    el.flash.textContent = msg;
    el.flash.classList.add('show');
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { el.flash.classList.remove('show'); }, ms || 1400);
  }

  window.UI = {
    init: init, update: update,
    showTitle: showTitle, showGameOver: showGameOver,
    hide: hide, isVisible: isVisible, flash: flash
  };
})();
