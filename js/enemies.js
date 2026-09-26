/* enemies.js — fileiras que descem devagar + zigue-zague no topo */
(function () {
  'use strict';

  function Manager(vw) {
    this.vw = vw;
    this.list = [];       // {col,row,alive,score,ox,oy,w,h}
    this.time = 0;
    this.level = 1;
    this.def = window.WAVE_DEFS[0];
    this.ox = 0; this.oy = 0;
    this.dir = 1;
    this.enterT = 0;      // animação de entrada
    this.fireT = 1.5;
  }

  Manager.prototype.waveDef = function (level) {
    return window.WAVE_DEFS[(level - 1) % window.WAVE_DEFS.length];
  };

  Manager.prototype.startLevel = function (level) {
    this.level = level;
    this.def = this.waveDef(level);
    this.time = 0; this.enterT = 0; this.fireT = 1.2;
    this.list.length = 0;
    var cols = level < 3 ? 6 : 7;
    var rows = level < 2 ? 3 : 4;
    var sx = 30, sy = 24, x0 = (this.vw - (cols - 1) * sx) / 2, y0 = 44;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        this.list.push({
          col: c, row: r, alive: true,
          bx: x0 + c * sx, by: y0 + r * sy,
          w: 16, h: 12, score: this.def.score,
          ph: (r * 0.9 + c * 0.25) // fase p/ zig individual
        });
      }
    }
    // velocidade escala com nível
    this.zigAmp = Math.min(34, 20 + level * 2);
    this.zigFreq = 0.7 + level * 0.12;
    this.descend = 3.2 + level * 1.1;      // px/s descida lenta
    this.maxDescend = 96 + level * 8;
  };

  Manager.prototype.aliveCount = function () {
    var n = 0;
    for (var i = 0; i < this.list.length; i++) if (this.list[i].alive) n++;
    return n;
  };

  Manager.prototype.pos = function (e) {
    // zigue-zague: grupo oscila + cada inimigo tem micro seno
    var gx = Math.sin(this.time * this.zigFreq) * this.zigAmp;
    var ix = Math.sin(this.time * (this.zigFreq * 1.7) + e.ph) * 4;
    var enter = this.enterT < 1 ? (1 - this.enterT) * -120 : 0;
    return { x: e.bx + gx + ix, y: e.by + this.oy + enter };
  };

  Manager.prototype.update = function (dt, bullets) {
    this.time += dt;
    if (this.enterT < 1) this.enterT = Math.min(1, this.enterT + dt * 0.5);
    if (this.oy < this.maxDescend) this.oy += this.descend * dt;

    // tiro inimigo: poucos, um de cada vez (1 ativo no início, 2 depois)
    this.fireT -= dt;
    var maxActive = this.level < 3 ? 1 : 2;
    if (this.fireT <= 0) {
      this.fireT = Math.max(0.7, 1.9 - this.level * 0.12);
      if (bullets.enemy.count < maxActive) {
        // escolhe aleatório entre os mais baixos vivos
        var cands = [];
        for (var i = 0; i < this.list.length; i++) {
          if (this.list[i].alive) cands.push(this.list[i]);
        }
        if (cands.length) {
          cands.sort(function (a, b) { return b.by - a.by; });
          var pick = cands[(Math.random() * Math.min(6, cands.length)) | 0];
          var p = this.pos(pick);
          bullets.enemy.fire(p.x + 7, p.y + 12, 110 + this.level * 10);
          if (window.AudioSys) window.AudioSys.enemyLaser();
        }
      }
    }
  };

  Manager.prototype.draw = function (g) {
    var spr = window.SPRITES[this.def.key];
    for (var i = 0; i < this.list.length; i++) {
      var e = this.list[i];
      if (!e.alive) continue;
      var p = this.pos(e);
      // centraliza sprite 16px na célula
      g.drawImage(spr, (p.x - 1) | 0, p.y | 0);
    }
  };

  // hitbox precisa estilo arcade (encolhida)
  Manager.prototype.hitbox = function (e) {
    var p = this.pos(e);
    return { x: p.x + 2, y: p.y + 2, w: 12, h: 8, px: p.x, py: p.y };
  };

  window.EnemyManager = Manager;
})();
