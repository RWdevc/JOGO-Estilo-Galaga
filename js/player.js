/* player.js — nave inferior, só eixo X */
(function () {
  'use strict';

  function Player(vw) {
    this.vw = vw;
    this.w = 15; this.h = 11;
    this.x = vw / 2 - this.w / 2;
    this.y = 296;
    this.speed = 150;          // px/s (virtual)
    this.cool = 0;
    this.coolMax = 0.18;
    this.inv = 0;              // invencibilidade pós-respawn
    this.alive = true;
    this.thr = 0;
  }
  Player.prototype.reset = function () {
    this.x = this.vw / 2 - this.w / 2;
    this.cool = 0; this.inv = 1.5; this.alive = true;
  };
  // hitbox arcade reduzida (~70%)
  Player.prototype.hitbox = function () {
    return {
      x: this.x + this.w * 0.18, y: this.y + 1,
      w: this.w * 0.64, h: this.h * 0.72
    };
  };
  Player.prototype.update = function (dt, input, bullets) {
    if (!this.alive) return;
    this.thr += dt;
    if (this.inv > 0) this.inv -= dt;
    if (this.cool > 0) this.cool -= dt;

    // drag touch tem prioridade (fluido + preciso)
    if (input.dragX !== null && input.dragX !== undefined) {
      var tx = input.dragX * this.vw - this.w / 2;
      var dx = tx - this.x;
      var maxStep = this.speed * 1.6 * dt;
      this.x += Math.max(-maxStep, Math.min(maxStep, dx));
    } else {
      if (input.left) this.x -= this.speed * dt;
      if (input.right) this.x += this.speed * dt;
    }
    if (this.x < 2) this.x = 2;
    if (this.x > this.vw - this.w - 2) this.x = this.vw - this.w - 2;

    var wantFire = input.fire || input.firePressed ||
      (input.touchMode && input.dragX !== null && input.dragX !== undefined);
    if (wantFire && this.cool <= 0) {
      var bx = this.x + this.w / 2 - 1;
      if (bullets.player.fire(bx, this.y - 7, -430)) { // projétil rápido
        this.cool = this.coolMax;
        if (window.AudioSys) window.AudioSys.laser();
      }
    }
  };
  Player.prototype.draw = function (g) {
    if (!this.alive) return;
    if (this.inv > 0 && (this.thr * 12 | 0) % 2 === 0) return; // pisca invencível
    g.drawImage(window.SPRITES.player, this.x | 0, this.y | 0);
    // chama do motor
    var f = (this.thr * 20 | 0) % 2;
    g.fillStyle = f ? '#ffff00' : '#ff8800';
    var cx = (this.x + this.w / 2) | 0;
    g.fillRect(cx - 1, this.y + 11, 2, 2 + f * 2);
  };

  window.Player = Player;
})();
