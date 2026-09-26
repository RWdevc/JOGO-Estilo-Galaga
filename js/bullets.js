/* bullets.js — object pooling, sem alocação no hot loop */
(function () {
  'use strict';

  function Pool(n, w, h) {
    this.n = n; this.w = w; this.h = h;
    this.x = new Float32Array(n);
    this.y = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.active = new Uint8Array(n);
    this.count = 0;
  }
  Pool.prototype.fire = function (x, y, vy) {
    for (var i = 0; i < this.n; i++) {
      if (!this.active[i]) {
        this.active[i] = 1; this.x[i] = x; this.y[i] = y; this.vy[i] = vy;
        this.count++; return true;
      }
    }
    return false;
  };
  Pool.prototype.kill = function (i) {
    if (this.active[i]) { this.active[i] = 0; this.count--; }
  };
  Pool.prototype.clear = function () {
    this.active.fill(0); this.count = 0;
  };
  Pool.prototype.update = function (dt, top, bottom) {
    for (var i = 0; i < this.n; i++) {
      if (!this.active[i]) continue;
      this.y[i] += this.vy[i] * dt;
      if (this.y[i] < top || this.y[i] > bottom) this.kill(i);
    }
  };

  // vw = largura virtual, para centralizar spawn
  window.BulletPools = {
    create: function () {
      return {
        player: new Pool(8, 2, 7),   // poucos, rápidos
        enemy: new Pool(4, 2, 7)     // escassos: máx 4, na prática 1-2 ativos
      };
    }
  };
})();
