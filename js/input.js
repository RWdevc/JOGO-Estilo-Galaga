/* input.js — abstração em ações: left/right/fire + touch drag */
(function () {
  'use strict';
  var Input = {
    left: false, right: false, fire: false,
    firePressed: false,        // borda de subida (teclado/botão)
    dragX: null,               // 0..1 posição do dedo no canvas (null = sem drag)
    touchMode: false,
    _kL: false, _kR: false, _kF: false,
    _bL: false, _bR: false, _bF: false
  };

  function recompute() {
    Input.left = Input._kL || Input._bL;
    Input.right = Input._kR || Input._bR;
    Input.fire = Input._kF || Input._bF;
  }

  window.addEventListener('keydown', function (e) {
    if (e.repeat) { if (e.code === 'Space') e.preventDefault(); return; }
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': Input._kL = true; recompute(); e.preventDefault(); break;
      case 'ArrowRight': case 'KeyD': Input._kR = true; recompute(); e.preventDefault(); break;
      case 'Space': case 'KeyZ': case 'KeyJ':
        if (!Input._kF) Input.firePressed = true;
        Input._kF = true; recompute(); e.preventDefault(); break;
      case 'Enter': if (window.Game) window.Game.tryStart(); break;
      case 'KeyP': if (window.Game) window.Game.togglePause(); break;
      case 'KeyM':
        if (window.AudioSys) {
          var m = window.AudioSys.toggleMute();
          if (window.UI) window.UI.flash(m ? 'SOM: OFF' : 'SOM: ON');
        }
        break;
    }
  });
  window.addEventListener('keyup', function (e) {
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': Input._kL = false; recompute(); break;
      case 'ArrowRight': case 'KeyD': Input._kR = false; recompute(); break;
      case 'Space': case 'KeyZ': case 'KeyJ': Input._kF = false; recompute(); break;
    }
  });

  function bindHold(el, set) {
    var on = function (e) {
      e.preventDefault();
      Input.touchMode = true;
      if (window.AudioSys) window.AudioSys.unlock();
      set(true);
      if (el.id === 'btn-fire' && !Input.firePressed) Input.firePressed = true;
      el.classList.add('held');
    };
    var off = function (e) { if (e) e.preventDefault(); set(false); el.classList.remove('held'); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  function bindCanvasDrag(canvas) {
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      return Math.min(1, Math.max(0, (cx - r.left) / r.width));
    }
    canvas.addEventListener('touchstart', function (e) {
      Input.touchMode = true;
      if (window.AudioSys) window.AudioSys.unlock();
      Input.dragX = pos(e);
      Input.firePressed = true;
    }, { passive: true });
    canvas.addEventListener('touchmove', function (e) {
      Input.dragX = pos(e);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', function () {
      Input.dragX = null;
      recompute();
    });
    // mouse drag (desktop teste)
    var down = false;
    canvas.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') { down = true; Input.dragX = pos(e); }
    });
    window.addEventListener('pointermove', function (e) {
      if (down && e.pointerType === 'mouse') Input.dragX = pos(e);
    });
    window.addEventListener('pointerup', function () { down = false; if (!Input.touchMode) Input.dragX = null; });
  }

  Input.init = function (canvas) {
    bindHold(document.getElementById('btn-left'), function (v) { Input._bL = v; recompute(); });
    bindHold(document.getElementById('btn-right'), function (v) { Input._bR = v; recompute(); });
    bindHold(document.getElementById('btn-fire'), function (v) { Input._bF = v; recompute(); });
    bindCanvasDrag(canvas);
  };
  Input.endFrame = function () { Input.firePressed = false; };

  window.Input = Input;
})();
