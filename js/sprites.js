/* sprites.js — pixel art 8-bit procedural, sem assets externos */
(function () {
  'use strict';

  function make(rows, palette) {
    var h = rows.length, w = rows[0].length;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var ch = rows[y][x];
        if (ch === '.' || ch === ' ') continue;
        g.fillStyle = palette[ch] || '#f0f';
        g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  // Nave do jogador 15x11
  var PLAYER_ROWS = [
    '.......W.......',
    '.......W.......',
    '......WWW......',
    '......WWW......',
    '.....WWWWW.....',
    '.....WWWWW.....',
    '....WWWCWWW....',
    '....WWCCCWW....',
    '...WWCCCCCWW...',
    '..WWWCCCCCCWWW.',
    '..RRR.....RRR..'
  ];
  var PLAYER_PAL = { W: '#ffffff', C: '#00ffff', R: '#ff4400' };

  // Hambúrguer 16x12
  var BURGER_ROWS = [
    '.....BBBBBB.....',
    '...BBBBBBBBBB...',
    '..BBWBBBBBBWBB..',
    '.BBBBBBBBBBBBBB.',
    '..BBBBBBBBBBBB..',
    '...GGGGGGGGGG...',
    '..RRRRRRRRRRRR..',
    '.YYYYYYYYYYYYYY.',
    '.MMMMMMMMMMMMMM.',
    '.MMMMMMMMMMMMMM.',
    '..BBBBBBBBBBBB..',
    '...BBBBBBBBBB...'
  ];
  var BURGER_PAL = {
    B: '#e09a2b', W: '#fff2b0', G: '#2bff2b',
    R: '#ff2222', Y: '#ffe600', M: '#7a3a12'
  };

  // Bolacha 14x12
  var COOKIE_ROWS = [
    '....TTTTTT....',
    '..TTTTTTTTTT..',
    '.TTTTTTTTTTTT.',
    '.TTTDTTTTDTTT.',
    'TTTTTTTTTTTTTT',
    'TTTTTTTDTTTTTT',
    'TTTTTTTTTTTTTT',
    'TTTTDTTTTTTTTT',
    'TTTTTTTTTTTDTT',
    '.TTTTTTTTTTTT.',
    '.TTTDTTTTDTTT.',
    '..TTTTTTTTTT..',
    '....TTTTTT....'
  ];
  var COOKIE_PAL = { T: '#d9a066', D: '#4a1e00' };

  // Ferro de passar 16x12
  var IRON_ROWS = [
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '...HH......HH...',
    '...H........H...',
    '..HH........HH..',
    '..HDDDDDDDDDDH..',
    '..HDDDDDDDDDDH..',
    '..HDDWDDDDDDDH..',
    '..HDDDDDDDDDDH..',
    '..HHHHHHHHHHHH..',
    '..SSSSSSSSSSSS..',
    '..SSSSSSSSSSSS..'
  ];
  var IRON_PAL = { H: '#8888ff', D: '#c0c0ff', W: '#ffffff', S: '#ff66ff' };

  // Gravata borboleta 16x10
  var BOW_ROWS = [
    'RRR..........RRR',
    'RRRRR......RRRRR',
    'RRRRRRR..RRRRRRR',
    'RRRRRRRRRRRRRRRR',
    'RRRRRRRYYRRRRRRR',
    'RRRRRRRYYRRRRRRR',
    'RRRRRRRRRRRRRRRR',
    'RRRRRRR..RRRRRRR',
    'RRRRR......RRRRR',
    'RRR..........RRR'
  ];
  var BOW_PAL = { R: '#ff2266', Y: '#ffff00' };

  // Diamante 14x12
  var DIAM_ROWS = [
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCWWCCCCCC...',
    '..CCWWCCCCCCCC..',
    '.CCCCCCCCCCCCCC.',
    'CCCCCCCCCCCCCCCC',
    '.CCCCCCCCCCCCCC.',
    '..CCCCCCCCCCCC..',
    '...CCCCCCCCCC...',
    '....CCCCCCCC....',
    '.....CCCCCC.....',
    '......CCCC......'
  ];
  var DIAM_PAL = { C: '#00e5ff', W: '#ffffff' };

  window.SPRITES = {
    player: make(PLAYER_ROWS, PLAYER_PAL),
    hamburger: make(BURGER_ROWS, BURGER_PAL),
    biscuit: make(COOKIE_ROWS, COOKIE_PAL),
    iron: make(IRON_ROWS, IRON_PAL),
    bowtie: make(BOW_ROWS, BOW_PAL),
    diamond: make(DIAM_ROWS, DIAM_PAL)
  };

  // Ordem das ondas por nível (índice = (level-1) % 5)
  window.WAVE_DEFS = [
    { key: 'hamburger', name: 'HAMBÚRGUERES', score: 25, color: '#e09a2b' },
    { key: 'biscuit',   name: 'BOLACHAS',     score: 50, color: '#d9a066' },
    { key: 'iron',      name: 'FERROS',       score: 75, color: '#8888ff' },
    { key: 'bowtie',    name: 'GRAVATAS',     score: 100, color: '#ff2266' },
    { key: 'diamond',   name: 'DIAMANTES',    score: 150, color: '#00e5ff' }
  ];
})();
