/* main.js — loop fixo, colisão arcade, energia, vidas, fases, shake, estrelas */
(function () {
  'use strict';

  var VW = 240, VH = 320;
  var canvas, g;
  var player, enemies, bullets;
  var stars = [];

  var S = {
    state: 'title', // title | playing | dying | clear | over | paused
    score: 0, hi: 0, lives: 3, level: 1, energy: 100,
    drain: 2.4,          // energia/s (100/2.4 ≈ 42s por fase)
    shake: 0, dieT: 0, clearT: 0,
    particles: []
  };

  try { S.hi = parseInt(localStorage.getItem('snack_hi') || '0', 10) || 0; } catch (e) {}

  function saveHi() {
    if (S.score > S.hi) {
      S.hi = S.score;
      try { localStorage.setItem('snack_hi', String(S.hi)); } catch (e) {}
    }
  }

  function waveLabel(level) {
    var d = window.WAVE_DEFS[(level - 1) % window.WAVE_DEFS.length];
    var emoji = { hamburger: '🍔', biscuit: '🍪', iron: '🔥', bowtie: '🎀', diamond: '💎' }[d.key] || '👾';
    return 'NÍVEL ' + level + ': ' + emoji + ' ' + d.name;
  }

  function newGame() {
    S.score = 0; S.lives = 3; S.level = 1; S.energy = 100;
    S.particles.length = 0;
    bullets.player.clear(); bullets.enemy.clear();
    enemies.startLevel(1);
    player.reset();
    S.state = 'playing';
    window.UI.hide();
    window.UI.flash(waveLabel(1), 1600);
  }

  function loseLife(reason) {
    if (S.state !== 'playing') return;
    saveHi();
    S.lives--;
    window.AudioSys.explosion(true);
    explode(player.x + player.w / 2, player.y + 5, '#ffffff', 26, true);
    player.alive = false;
    S.state = 'dying'; S.dieT = 1.6;
    S.shake = 0.35;
    window.UI.flash(reason === 'energy' ? 'SEM COMBUSTÍVEL!' : 'NAVE DESTRUÍDA!', 1400);
  }

  function nextLevel() {
    S.state = 'clear'; S.clearT = 2.0;
    S.score += 500;
    S.energy = 100; // onda completa recupera a barra na hora
    saveHi();
    window.AudioSys.levelClear();
    window.UI.flash('ONDA LIMPA! +500 · ENERGIA RECARREGADA', 1800);
  }

  function explode(x, y, color, n, big) {
    for (var i = 0; i < (n || 14); i++) {
      S.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * (big ? 160 : 120),
        vy: (Math.random() - 0.6) * (big ? 160 : 120),
        life: 0.4 + Math.random() * 0.35,
        t: 0, color: Math.random() < 0.3 ? '#ffffff' : (Math.random() < 0.5 ? color : '#ff8800'),
        s: Math.random() < 0.5 ? 1 : 2
      });
    }
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ---- UPDATE (passo fixo 1/60) ----
  function update(dt) {
    // estrelas sempre
    for (var i = 0; i < stars.length; i++) {
      stars[i].y += stars[i].v * dt;
      if (stars[i].y > VH) { stars[i].y = -2; stars[i].x = Math.random() * VW; }
    }
    if (S.shake > 0) S.shake -= dt;

    // partículas sempre
    for (var k = S.particles.length - 1; k >= 0; k--) {
      var p = S.particles[k];
      p.t += dt;
      if (p.t >= p.life) { S.particles.splice(k, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 60 * dt;
    }

    if (S.state === 'playing') {
      // energia drena sempre; zerar = perde vida
      S.energy -= S.drain * dt;
      if (S.energy <= 0) {
        S.energy = 0;
        loseLife('energy');
        return;
      }

      player.update(dt, window.Input, bullets);
      enemies.update(dt, bullets);
      bullets.player.update(dt, -20, VH + 20);
      bullets.enemy.update(dt, -20, VH + 20);

      collisions();

      if (enemies.aliveCount() === 0) nextLevel();
    } else if (S.state === 'dying') {
      bullets.player.update(dt, -20, VH + 20);
      bullets.enemy.update(dt, -20, VH + 20);
      S.dieT -= dt;
      if (S.dieT <= 0) {
        if (S.lives <= 0) {
          S.state = 'over'; saveHi();
          window.UI.showGameOver(S.score, S.hi);
        } else {
          // renova barra ao perder vida (evita morte em loop)
          S.energy = 100;
          bullets.enemy.clear(); bullets.player.clear();
          player.reset();
          S.state = 'playing';
        }
      }
    } else if (S.state === 'clear') {
      bullets.player.update(dt, -20, VH + 20);
      bullets.enemy.update(dt, -20, VH + 20);
      S.clearT -= dt;
      if (S.clearT <= 0) {
        S.level++;
        S.energy = 100; // barra renovada na troca de fase
        bullets.enemy.clear(); bullets.player.clear();
        enemies.startLevel(S.level);
        player.reset();
        S.state = 'playing';
        window.UI.flash(waveLabel(S.level), 1600);
      }
    }
  }

  function collisions() {
    var i, j, e, hb, hit;
    var pb = bullets.player, eb = bullets.enemy;

    // tiro do jogador x inimigos (colisão precisa arcade)
    for (i = 0; i < pb.n; i++) {
      if (!pb.active[i]) continue;
      var bx = pb.x[i], by = pb.y[i];
      var bb = { x: bx - 1, y: by - 3, w: 2, h: 7 };
      hit = false;
      for (j = 0; j < enemies.list.length; j++) {
        e = enemies.list[j];
        if (!e.alive) continue;
        hb = enemies.hitbox(e);
        if (aabb(bb, hb)) {
          e.alive = false;
          pb.kill(i);
          S.score += e.score;
          // onda completa recuperou? bônus parcial imediato + refill no clear
          S.energy = Math.min(100, S.energy + 1.5);
          window.AudioSys.explosion(false);
          explode(hb.px + 8, hb.py + 6, enemies.def.color, 12, false);
          hit = true;
          break;
        }
      }
      if (hit) continue;
    }

    if (S.state !== 'playing' || !player.alive) return;
    var ph = player.hitbox();

    // tiro inimigo x jogador
    for (i = 0; i < eb.n; i++) {
      if (!eb.active[i]) continue;
      var ebb = { x: eb.x[i] - 1, y: eb.y[i] - 3, w: 2, h: 7 };
      if (aabb(ebb, ph)) { eb.kill(i); loseLife('shot'); return; }
    }

    // corpo-a-corpo x jogador
    for (j = 0; j < enemies.list.length; j++) {
      e = enemies.list[j];
      if (!e.alive) continue;
      hb = enemies.hitbox(e);
      if (aabb(ph, hb)) { loseLife('crash'); return; }
      // inimigo passou da linha da nave = pressão (dano de energia)
      if (hb.py + hb.h > player.y + 2) {
        e.alive = false;
        window.AudioSys.explosion(false);
        explode(hb.px + 8, hb.py + 6, enemies.def.color, 10, false);
        S.energy = Math.max(1, S.energy - 12);
        window.UI.flash('INVASOR PASSOU! -ENERGIA', 900);
      }
    }
  }

  // ---- RENDER ----
  function render() {
    g.save();
    g.fillStyle = '#000';
    g.fillRect(0, 0, VW, VH);
    if (S.shake > 0) {
      var m = S.shake * 14;
      g.translate(((Math.random() - 0.5) * m) | 0, ((Math.random() - 0.5) * m) | 0);
    }

    // estrelas
    for (var i = 0; i < stars.length; i++) {
      g.fillStyle = stars[i].c;
      g.fillRect(stars[i].x | 0, stars[i].y | 0, stars[i].s, stars[i].s);
    }

    // linha da base (chão neon)
    g.fillStyle = '#0ff';
    g.fillRect(0, 310, VW, 1);

    enemies.draw(g);

    // balas jogador: amarelo vibrante
    g.fillStyle = '#ffff00';
    var pb = bullets.player;
    for (var a = 0; a < pb.n; a++) {
      if (!pb.active[a]) continue;
      g.fillRect(pb.x[a] | 0, pb.y[a] | 0, 2, 7);
      g.fillStyle = '#fff';
      g.fillRect(pb.x[a] | 0, pb.y[a] | 0, 1, 2);
      g.fillStyle = '#ffff00';
    }
    // balas inimigas: magenta
    g.fillStyle = '#ff00ff';
    var eb = bullets.enemy;
    for (var b = 0; b < eb.n; b++) {
      if (!eb.active[b]) continue;
      g.fillRect(eb.x[b] | 0, eb.y[b] | 0, 2, 7);
    }

    player.draw(g);

    // partículas quadradas
    for (var k = 0; k < S.particles.length; k++) {
      var p = S.particles[k];
      g.globalAlpha = 1 - p.t / p.life;
      g.fillStyle = p.color;
      g.fillRect(p.x | 0, p.y | 0, p.s, p.s);
    }
    g.globalAlpha = 1;
    g.restore();

    window.UI.update(S);
  }

  // ---- BOOT ----
  function init() {
    canvas = document.getElementById('game');
    g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;

    for (var i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * VW, y: Math.random() * VH,
        v: 12 + Math.random() * 40,
        s: Math.random() < 0.8 ? 1 : 2,
        c: Math.random() < 0.2 ? '#0ff' : (Math.random() < 0.3 ? '#888' : '#fff')
      });
    }

    player = new window.Player(VW);
    enemies = new window.EnemyManager(VW);
    enemies.startLevel(1);
    bullets = window.BulletPools.create();

    window.UI.init();
    window.Input.init(canvas);
    window.UI.showTitle(waveLabel(1));

    document.getElementById('btn-start').addEventListener('click', function () {
      window.AudioSys.unlock();
      newGame();
    });
    // primeiro toque em qualquer lugar destrava áudio
    window.addEventListener('pointerdown', function () { window.AudioSys.unlock(); }, { once: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && S.state === 'playing') {
        S.state = 'paused';
        window.UI.flash('PAUSADO — pressione P para continuar', 2000);
      }
    });

    // loop fixo 60Hz + render
    var acc = 0, last = performance.now(), STEP = 1 / 60;
    function frame(now) {
      requestAnimationFrame(frame);
      var dt = (now - last) / 1000;
      last = now;
      if (dt > 0.25) dt = 0.25;
      if (S.state !== 'paused') {
        acc += dt;
        while (acc >= STEP) { update(STEP); acc -= STEP; }
      }
      render();
      window.Input.endFrame();
    }
    requestAnimationFrame(frame);
  }

  window.Game = {
    init: init,
    tryStart: function () {
      if (S.state === 'paused') { S.state = 'playing'; return; }
      if (window.UI.isVisible()) newGame();
    },
    togglePause: function () {
      if (S.state === 'playing') { S.state = 'paused'; window.UI.flash('PAUSADO (P)', 1200); }
      else if (S.state === 'paused') S.state = 'playing';
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
