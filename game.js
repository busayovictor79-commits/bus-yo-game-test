const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levelLabel = document.getElementById('levelLabel');
const bestLabel = document.getElementById('bestLabel');
const playerNameBadge = document.getElementById('playerNameBadge');
const scoreboardList = document.getElementById('scoreboardList');
const playerNameInput = document.getElementById('playerNameInput');
const overlay = document.getElementById('messageOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

const STORAGE_KEY = 'stickman-one-chance-best-times';
const SCOREBOARD_KEY = 'stickman-one-chance-scoreboard';
const WORLD_WIDTH = canvas.width;
const WORLD_HEIGHT = canvas.height;
const GRAVITY = 1700;
const keys = {};

const levelNames = [
  'The Basics', 'Spike Trap', 'Moving Floor', 'The Fall', 'Laser Room', 'The Chase', 'Fake Floor', 'Blade Room', 'Heatwave',
  'Drop Zone', 'Electric Maze', 'The Bounce', 'Pressure', 'Glass Floor', 'The Sway', 'Trap House', 'Redline', 'Rapid Fire',
  'Night Shift', 'High Swing', 'Break Point', 'Riot', 'Brickwork', 'Cold Feet', 'Dark Signal', 'Pyre', 'Final Stretch', 'Sparks', 'The Last Laugh', 'The Gauntlet', 'One Chance'
];

function buildLevels() {
  const levels = [];

  for (let i = 0; i < 30; i += 1) {
    const stage = i + 1;
    const start = { x: 60, y: 392 };
    const goal = { x: 900, y: 36 + (stage % 5) * 16, w: 26, h: 170 };
    const platforms = [
      { x: 0, y: 470, w: 170, h: 70, type: 'ground' },
      { x: 220, y: 430, w: 105, h: 18, type: 'normal' },
      { x: 350, y: 390, w: 110, h: 18, type: 'normal' },
      { x: 490, y: 345, w: 108, h: 18, type: 'normal' },
      { x: 630, y: 295, w: 102, h: 18, type: 'normal' },
      { x: 760, y: 245, w: 102, h: 18, type: 'normal' },
      { x: 850, y: 190, w: 80, h: 18, type: 'normal' }
    ];

    if (stage >= 3) {
      platforms.push({ x: 295, y: 320, w: 90, h: 16, type: 'moving', moving: true, axis: 'x', range: 70, speed: 1.4 + stage * 0.04, baseX: 295, baseY: 320 });
    }
    if (stage >= 6) {
      platforms.push({ x: 575, y: 240, w: 90, h: 16, type: 'moving', moving: true, axis: 'y', range: 60, speed: 1.8 + stage * 0.05, baseX: 575, baseY: 240 });
    }
    if (stage >= 10) {
      platforms.push({ x: 680, y: 410, w: 72, h: 16, type: 'trap', trap: true });
    }
    if (stage >= 18) {
      platforms.push({ x: 515, y: 205, w: 82, h: 16, type: 'launch', launch: true });
    }
    if (stage >= 25) {
      platforms.push({ x: 408, y: 280, w: 90, h: 16, type: 'ice', slippery: true });
    }

    const hazards = [
      { x: 170, y: 470, w: 44, h: 18, kind: 'spike' },
      { x: 330, y: 470, w: 40, h: 18, kind: 'spike' },
      { x: 470, y: 470, w: 38, h: 18, kind: 'spike' },
      { x: 610, y: 470, w: 42, h: 18, kind: 'spike' },
      { x: 730, y: 470, w: 36, h: 18, kind: 'spike' },
      { x: 845, y: 470, w: 80, h: 18, kind: 'spike' }
    ];

    const movingHazards = [];

    if (stage >= 2) {
      movingHazards.push({ x: 250, y: 270, w: 28, h: 28, kind: 'blade', axis: 'y', range: 80, speed: 1.4 + stage * 0.03, phase: 0.5, baseX: 250, baseY: 270 });
    }
    if (stage >= 4) {
      movingHazards.push({ x: 550, y: 170, w: 22, h: 22, kind: 'laser', axis: 'x', range: 120, speed: 1.7 + stage * 0.04, phase: 1.1, baseX: 550, baseY: 170 });
    }
    if (stage >= 7) {
      movingHazards.push({ x: 690, y: 150, w: 26, h: 26, kind: 'axe', axis: 'y', range: 90, speed: 2.2 + stage * 0.04, phase: 2.0, baseX: 690, baseY: 150 });
    }
    if (stage >= 9) {
      movingHazards.push({ x: 430, y: 230, w: 26, h: 26, kind: 'fire', axis: 'x', range: 90, speed: 1.9 + stage * 0.04, phase: 0.9, baseX: 430, baseY: 230 });
    }
    if (stage >= 12) {
      hazards.push({ x: 360, y: 470, w: 50, h: 18, kind: 'electric' }, { x: 560, y: 470, w: 54, h: 18, kind: 'electric' });
    }
    if (stage >= 15) {
      movingHazards.push({ x: 810, y: 110, w: 28, h: 28, kind: 'blade', axis: 'x', range: 100, speed: 2.6 + stage * 0.05, phase: 1.6, baseX: 810, baseY: 110 });
    }
    if (stage >= 20) {
      movingHazards.push({ x: 620, y: 110, w: 30, h: 30, kind: 'rock', axis: 'y', range: 140, speed: 2.8 + stage * 0.07, phase: 0.7, baseX: 620, baseY: 110 });
    }
    if (stage >= 25) {
      movingHazards.push({ x: 345, y: 105, w: 24, h: 24, kind: 'fire', axis: 'x', range: 110, speed: 3.1 + stage * 0.08, phase: 1.4, baseX: 345, baseY: 105 });
      hazards.push({ x: 760, y: 470, w: 80, h: 18, kind: 'pit' });
    }

    levels.push({
      id: stage,
      name: levelNames[i],
      chapter: `LEVEL ${String(stage).padStart(2, '0')}`,
      objective: 'Reach the green finish zone.',
      start,
      goal,
      platforms,
      hazards,
      movingHazards,
      typeText: `LEVEL ${stage} — ${levelNames[i]}`
    });
  }

  return levels;
}

const levels = buildLevels();

const deathQuotes = [
  'A heroic faceplant. The crowd applauds your confidence.',
  'The stickman tripped over his own ambition. Classic.',
  'You were one step away from glory. Then gravity happened.',
  'The run ended in a dramatic wobble and a very personal betrayal.',
  'This was not a defeat. This was a legendary comedy sketch.',
  'One mistake. One splendidly embarrassing moment.',
  'The stickman fell. The lesson: physics is undefeated.',
  'You got clipped by destiny and immediately regretted everything.',
  'The floor was rude. The stickman was not.',
  'This was less a loss and more a dramatic exit.'
];

const state = {
  phase: 'menu',
  levelIndex: 0,
  lastTime: 0,
  shake: 0,
  particles: [],
  bestTimes: {},
  scoreboard: [],
  playerName: 'Guest',
  obstaclesAvoided: 0,
  levelStart: 0,
  achievedScore: 0,
  totalScore: 0
};

const player = {
  x: 60,
  y: 392,
  w: 22,
  h: 58,
  vx: 0,
  vy: 0,
  speed: 300,
  jumpPower: 790,
  grounded: false,
  facing: 1
};

let currentLevel = null;

function loadBestTimes() {
  try {
    state.bestTimes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    state.bestTimes = {};
  }
}

function loadScoreboard() {
  try {
    state.scoreboard = JSON.parse(localStorage.getItem(SCOREBOARD_KEY) || '[]');
  } catch {
    state.scoreboard = [];
  }

  state.scoreboard = state.scoreboard.filter((entry) => entry && entry.name);
}

function saveScoreboard() {
  localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(state.scoreboard.slice(0, 6)));
}

function updateScoreboard() {
  const entries = [...state.scoreboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  scoreboardList.innerHTML = '';

  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    item.innerHTML = `<span>${index + 1}. ${entry.name}</span><strong>${entry.score}</strong>`;
    scoreboardList.appendChild(item);
  });

  const displayName = state.playerName || 'Guest';
  playerNameBadge.textContent = displayName;
  if (playerNameInput) {
    playerNameInput.value = displayName === 'Guest' ? '' : displayName;
  }
}

function saveCurrentPlayerScore() {
  const name = (state.playerName || 'Guest').trim();
  if (!name) return;

  state.scoreboard.push({ name, score: state.totalScore });
  state.scoreboard = [...state.scoreboard]
    .filter((entry) => entry && entry.name)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  saveScoreboard();
  updateScoreboard();
}

function saveBestTimes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bestTimes));
}

function getBestTime(levelIndex) {
  return state.bestTimes[levelIndex] ?? null;
}

function setBestTime(levelIndex, value) {
  const current = getBestTime(levelIndex);
  if (current === null || value < current) {
    state.bestTimes[levelIndex] = value;
    saveBestTimes();
  }
}

function updateHud() {
  const best = getBestTime(state.levelIndex);
  levelLabel.textContent = String(state.levelIndex + 1);
  bestLabel.textContent = best === null ? '—' : `${best.toFixed(1)}s`;
}

function setOverlay(title, text, buttonText) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startButton.textContent = buttonText;
  overlay.classList.add('visible');
}

function hideOverlay() {
  overlay.classList.remove('visible');
}

function spawnBurst(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 420,
      vy: (Math.random() - 0.5) * 420,
      size: 2 + Math.random() * 4,
      life: 0.65 + Math.random() * 0.7,
      maxLife: 0.65 + Math.random() * 0.7,
      color
    });
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 180 * dt;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function resetPlayerToStart() {
  player.x = currentLevel.start.x;
  player.y = currentLevel.start.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.facing = 1;
  state.obstaclesAvoided = 0;
}

function loadLevel(index) {
  currentLevel = JSON.parse(JSON.stringify(levels[index]));

  for (const platform of currentLevel.platforms) {
    platform.baseX = platform.x;
    platform.baseY = platform.y;
    platform.visible = true;
    platform.triggered = false;
    platform.phase = platform.phase || 0;
  }

  for (const hazard of currentLevel.hazards) {
    hazard.baseX = hazard.x;
    hazard.baseY = hazard.y;
    hazard.phase = hazard.phase || 0;
    hazard.counted = false;
  }

  for (const hazard of currentLevel.movingHazards) {
    hazard.baseX = hazard.x;
    hazard.baseY = hazard.y;
    hazard.phase = hazard.phase || 0;
    hazard.counted = false;
  }

  state.levelIndex = index;
  state.levelStart = performance.now();
  resetPlayerToStart();
  updateHud();
}

function startRun() {
  const inputValue = (playerNameInput?.value || '').trim();
  const chosenName = inputValue || state.playerName || 'Guest';

  state.playerName = chosenName.slice(0, 16);
  state.totalScore = 0;
  state.phase = 'playing';
  loadLevel(0);
  hideOverlay();
  updateScoreboard();
}

function restartCurrentLevel() {
  state.phase = 'playing';
  loadLevel(state.levelIndex);
  hideOverlay();
}

function nextLevel() {
  const nextIndex = state.levelIndex + 1;
  if (nextIndex >= levels.length) {
    state.phase = 'won';
    setOverlay('YOU WON', 'You cleared the full challenge. One life. Infinite bragging rights.', 'Play Again');
    return;
  }

  state.phase = 'playing';
  loadLevel(nextIndex);
  hideOverlay();
}

function showSuccessScreen() {
  const elapsed = (performance.now() - state.levelStart) / 1000;
  const best = getBestTime(state.levelIndex);
  const bestText = best === null ? '—' : `${best.toFixed(1)}s`;

  state.achievedScore = Math.max(150, Math.round(2200 - elapsed * 18 + state.obstaclesAvoided * 90));
  state.totalScore += state.achievedScore;
  setBestTime(state.levelIndex, elapsed);
  saveCurrentPlayerScore();

  state.phase = 'success';
  setOverlay(
    'LEVEL PASSED! ✓',
    `Level ${state.levelIndex + 1} complete\nTime taken: ${elapsed.toFixed(1)}s\nObstacles avoided: ${state.obstaclesAvoided}\nScore: ${state.achievedScore}\nTotal score: ${state.totalScore}\nBest time: ${bestText}`,
    'NEXT LEVEL →'
  );
  spawnBurst(player.x + player.w / 2, player.y + 8, '#1f7a4d', 30);
}

function showFailureScreen() {
  state.phase = 'failed';
  const reachedLevel = state.levelIndex + 1;
  setOverlay('LEVEL FAILED 🔴', `You reached Level ${reachedLevel}\nTry Again`, 'Try Again');
  spawnBurst(player.x + player.w / 2, player.y + 12, '#d63b35', 30);
}

function killRun() {
  if (state.phase !== 'playing') return;
  state.shake = 14;
  showFailureScreen();
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function getAllHazards() {
  return [...(currentLevel?.hazards || []), ...(currentLevel?.movingHazards || [])];
}

function updateMovingPlatforms(dt) {
  if (!currentLevel) return;
  for (const platform of currentLevel.platforms) {
    if (!platform.moving) continue;
    platform.phase += dt * platform.speed;
    if (platform.axis === 'x') {
      platform.x = platform.baseX + Math.sin(platform.phase) * platform.range;
    } else if (platform.axis === 'y') {
      platform.y = platform.baseY + Math.sin(platform.phase) * platform.range;
    }
  }
}

function updateMovingHazards(dt) {
  if (!currentLevel) return;
  for (const hazard of currentLevel.movingHazards) {
    hazard.phase += dt * (hazard.speed || 1.5);
    if (hazard.axis === 'x') {
      hazard.x = hazard.baseX + Math.sin(hazard.phase) * (hazard.range || 50);
    } else if (hazard.axis === 'y') {
      hazard.y = hazard.baseY + Math.sin(hazard.phase) * (hazard.range || 50);
    }
  }
}

function handleInput(dt) {
  if (state.phase !== 'playing') return;

  const left = !!keys.ArrowLeft || !!keys.a;
  const right = !!keys.ArrowRight || !!keys.d;

  if (left && !right) {
    player.vx = -player.speed;
    player.facing = -1;
  } else if (right && !left) {
    player.vx = player.speed;
    player.facing = 1;
  } else {
    player.vx *= 0.7;
    if (Math.abs(player.vx) < 2) player.vx = 0;
  }

  if ((keys.ArrowUp || keys.w || keys[' ']) && player.grounded) {
    player.vy = -player.jumpPower;
    player.grounded = false;
    spawnBurst(player.x + player.w / 2, player.y + player.h, '#111', 8);
  }

  if ((keys.ArrowDown || keys.s) && !player.grounded) {
    player.vy += 420 * dt;
  }
}

function updatePlayer(dt) {
  if (state.phase !== 'playing' || !currentLevel) return;

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.grounded = false;

  for (const platform of currentLevel.platforms) {
    if (platform.visible === false && platform.disappear) continue;
    if (!intersects(player, platform)) continue;

    const prevBottom = player.y + player.h - player.vy * dt;
    const prevTop = player.y - player.vy * dt;
    const prevRight = player.x + player.w - player.vx * dt;
    const prevLeft = player.x - player.vx * dt;

    if (player.vy >= 0 && prevBottom <= platform.y + 12) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
      if (platform.type === 'launch') {
        player.vy = -1100;
        player.grounded = false;
      }
    } else if (player.vy < 0 && prevTop >= platform.y + platform.h - 12) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    } else if (player.vx > 0 && prevRight <= platform.x + 8) {
      player.x = platform.x - player.w;
      player.vx = 0;
    } else if (player.vx < 0 && prevLeft >= platform.x + platform.w - 8) {
      player.x = platform.x + platform.w;
      player.vx = 0;
    }

    if (platform.type === 'trap' && !platform.triggered) {
      platform.triggered = true;
      platform.visible = false;
      platform.disappear = true;
      spawnBurst(platform.x + platform.w / 2, platform.y + platform.h / 2, '#d63b35', 16);
    }
  }

  for (const hazard of getAllHazards()) {
    if (intersects(player, hazard)) {
      killRun();
      return;
    }

    if (hazard.kind === 'laser' || hazard.kind === 'fire' || hazard.kind === 'electric') {
      if (player.x > hazard.x + hazard.w && player.x < hazard.x + hazard.w + 60 && !hazard.counted) {
        hazard.counted = true;
        state.obstaclesAvoided += 1;
      }
    }
  }

  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }
  if (player.x + player.w > WORLD_WIDTH) {
    player.x = WORLD_WIDTH - player.w;
    player.vx = 0;
  }
  if (player.y > WORLD_HEIGHT + 100) {
    killRun();
    return;
  }

  const goal = currentLevel.goal;
  const reachedGoal = player.x + player.w > goal.x && player.y + player.h > goal.y && player.y < goal.y + goal.h;
  if (reachedGoal) {
    showSuccessScreen();
  }
}

function drawBackground() {
  ctx.fillStyle = '#f9f7f4';
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.strokeStyle = 'rgba(20,20,20,0.06)';
  for (let x = 0; x < WORLD_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_HEIGHT);
    ctx.stroke();
  }
}

function drawPlatform(platform) {
  if (!platform.visible && platform.disappear) return;
  const fill = platform.type === 'ice' ? '#dfeaf2' : platform.type === 'trap' ? '#3b2929' : platform.type === 'launch' ? '#f1c40f' : '#1d1d1d';
  const stroke = platform.type === 'launch' ? '#c79a00' : '#0a0a0a';

  ctx.fillStyle = fill;
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  ctx.strokeStyle = stroke;
  ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);

  if (platform.type === 'launch') {
    ctx.fillStyle = '#111';
    ctx.fillRect(platform.x + 10, platform.y + 4, platform.w - 20, 5);
  }
}

function drawGoal(goal) {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);

  ctx.fillStyle = '#1f7a4d';
  ctx.beginPath();
  ctx.moveTo(goal.x + goal.w, goal.y + 14);
  ctx.lineTo(goal.x + goal.w + 38, goal.y + 30);
  ctx.lineTo(goal.x + goal.w, goal.y + 46);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f9f3ee';
  ctx.fillRect(goal.x + goal.w + 8, goal.y + 10, 2, goal.h - 20);

  ctx.fillStyle = '#111';
  ctx.font = 'bold 12px Segoe UI';
  ctx.fillText('FINISH', goal.x - 8, goal.y - 12);
}

function drawSpike(hazard) {
  ctx.fillStyle = '#d63b35';
  ctx.beginPath();
  ctx.moveTo(hazard.x, hazard.y + hazard.h);
  for (let i = 0; i <= 10; i += 1) {
    const px = hazard.x + (hazard.w / 10) * i;
    const py = i % 2 === 0 ? hazard.y : hazard.y + hazard.h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.lineTo(hazard.x + hazard.w, hazard.y + hazard.h);
  ctx.closePath();
  ctx.fill();
}

function drawBlade(hazard) {
  ctx.save();
  ctx.translate(hazard.x + hazard.w / 2, hazard.y + hazard.h / 2);
  ctx.rotate((performance.now() / 260) + (hazard.phase || 0));
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -hazard.h * 0.9);
  ctx.lineTo(hazard.w * 0.6, 0);
  ctx.lineTo(0, hazard.h * 0.9);
  ctx.lineTo(-hazard.w * 0.6, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawFire(hazard) {
  ctx.fillStyle = '#d63b35';
  ctx.beginPath();
  ctx.moveTo(hazard.x + hazard.w / 2, hazard.y);
  ctx.lineTo(hazard.x + hazard.w, hazard.y + hazard.h * 0.8);
  ctx.lineTo(hazard.x + hazard.w * 0.7, hazard.y + hazard.h);
  ctx.lineTo(hazard.x + hazard.w * 0.3, hazard.y + hazard.h);
  ctx.lineTo(hazard.x, hazard.y + hazard.h * 0.75);
  ctx.closePath();
  ctx.fill();
}

function drawLaser(hazard) {
  ctx.strokeStyle = '#ff4d4d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(hazard.x, hazard.y + hazard.h / 2);
  ctx.lineTo(hazard.x + hazard.w, hazard.y + hazard.h / 2);
  ctx.stroke();
}

function drawElectric(hazard) {
  ctx.strokeStyle = '#89f0ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hazard.x, hazard.y + 8);
  ctx.lineTo(hazard.x + hazard.w * 0.35, hazard.y + hazard.h * 0.2);
  ctx.lineTo(hazard.x + hazard.w * 0.8, hazard.y + hazard.h * 0.45);
  ctx.lineTo(hazard.x + hazard.w * 0.45, hazard.y + hazard.h);
  ctx.lineTo(hazard.x + hazard.w, hazard.y + hazard.h * 0.3);
  ctx.stroke();
}

function drawRock(hazard) {
  ctx.fillStyle = '#5d5d5d';
  ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
  ctx.fillStyle = '#8f8f8f';
  ctx.fillRect(hazard.x + 3, hazard.y + 3, hazard.w - 6, hazard.h - 6);
}

function drawAxe(hazard) {
  ctx.save();
  ctx.translate(hazard.x + hazard.w / 2, hazard.y + hazard.h / 2);
  ctx.rotate(Math.sin(hazard.phase || 0) * 1.2);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.stroke();
  ctx.fillStyle = '#d63b35';
  ctx.fillRect(-6, -28, 12, 10);
  ctx.fillRect(-6, 18, 12, 10);
  ctx.restore();
}

function drawHazard(hazard) {
  const kind = hazard.kind || 'spike';
  if (kind === 'spike') drawSpike(hazard);
  else if (kind === 'blade') drawBlade(hazard);
  else if (kind === 'fire') drawFire(hazard);
  else if (kind === 'laser') drawLaser(hazard);
  else if (kind === 'electric') drawElectric(hazard);
  else if (kind === 'rock') drawRock(hazard);
  else if (kind === 'axe') drawAxe(hazard);
  else if (kind === 'pit') {
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
  } else {
    drawSpike(hazard);
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
  ctx.scale(player.facing, 1);

  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(0, -24, 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 16);
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, 12);
  ctx.lineTo(-10, 30);
  ctx.moveTo(0, 0);
  ctx.lineTo(14, 12);
  ctx.lineTo(10, 30);
  ctx.moveTo(0, 16);
  ctx.lineTo(-12, 36);
  ctx.moveTo(0, 16);
  ctx.lineTo(12, 36);
  ctx.stroke();

  ctx.restore();
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 4 : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 4 : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawBackground();
  if (currentLevel) {
    for (const platform of currentLevel.platforms) drawPlatform(platform);
    for (const hazard of getAllHazards()) drawHazard(hazard);
    drawGoal(currentLevel.goal);
  }
  drawPlayer();
  drawParticles();
  ctx.restore();
}

function tick(timestamp) {
  const dt = Math.min((timestamp - (state.lastTime || timestamp)) / 1000, 0.033);
  state.lastTime = timestamp;

  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - 12 * dt);
  }

  updateMovingPlatforms(dt);
  updateMovingHazards(dt);
  handleInput(dt);
  updatePlayer(dt);
  updateParticles(dt);
  draw();

  requestAnimationFrame(tick);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys[key] = true;
  if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys[key] = false;
});

startButton.addEventListener('click', () => {
  if (state.phase === 'success') {
    nextLevel();
    return;
  }
  if (state.phase === 'failed') {
    restartCurrentLevel();
    return;
  }
  if (state.phase === 'won') {
    startRun();
    return;
  }

  const chosenName = (playerNameInput?.value || '').trim();
  if (!chosenName) {
    playerNameInput.focus();
    playerNameInput.placeholder = 'Enter your name first';
    return;
  }

  state.playerName = chosenName.slice(0, 16);
  startRun();
});

restartButton.addEventListener('click', () => {
  startRun();
});

loadBestTimes();
loadScoreboard();
loadLevel(0);
updateScoreboard();
setOverlay('Ready?', 'Level 01\nEnter your name, then reach the green finish zone.\nOne hit ends the run.', 'Start Run');
updateHud();
requestAnimationFrame(tick);
window.__gameReady = true;

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 120 * dt;
    p.life -= dt;

    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

function updateMovingHazards(dt) {
  if (!currentLevel || !currentLevel.movingHazards) return;

  for (const hazard of currentLevel.movingHazards) {
    hazard.phase = (hazard.phase || 0) + dt * (hazard.speed || 1);
    if (hazard.axis === 'x') {
      hazard.x = hazard.baseX + Math.sin(hazard.phase) * (hazard.range || 30);
    } else {
      hazard.y = hazard.baseY + Math.sin(hazard.phase) * (hazard.range || 30);
    }
  }
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function handleInput(dt) {
  if (state.phase !== 'playing') return;

  const left = !!keys['ArrowLeft'] || !!keys['a'];
  const right = !!keys['ArrowRight'] || !!keys['d'];

  if (left && !right) {
    player.vx = -player.speed;
    player.facing = -1;
  } else if (right && !left) {
    player.vx = player.speed;
    player.facing = 1;
  } else {
    player.vx *= 0.72;
    if (Math.abs(player.vx) < 2) player.vx = 0;
  }

  if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.grounded) {
    player.vy = -player.jumpPower;
    player.grounded = false;
    spawnBurst(player.x + player.w / 2, player.y + player.h, '#131313', 10);
  }

  if ((keys['ArrowDown'] || keys['s']) && !player.grounded) {
    player.vy += 280 * dt;
  }
}

function updatePlayer(dt) {
  if (state.phase !== 'playing') return;

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.grounded = false;

  for (const platform of currentLevel.platforms) {
    if (intersects(player, platform)) {
      const prevBottom = player.y + player.h - player.vy * dt;
      const prevTop = player.y - player.vy * dt;
      const prevRight = player.x + player.w - player.vx * dt;
      const prevLeft = player.x - player.vx * dt;

      if (player.vy >= 0 && prevBottom <= platform.y + 12) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.grounded = true;
      } else if (player.vy < 0 && prevTop >= platform.y + platform.h - 12) {
        player.y = platform.y + platform.h;
        player.vy = 0;
      } else if (player.vx > 0 && prevRight <= platform.x + 8) {
        player.x = platform.x - player.w;
        player.vx = 0;
      } else if (player.vx < 0 && prevLeft >= platform.x + platform.w - 8) {
        player.x = platform.x + platform.w;
        player.vx = 0;
      }
    }
  }

  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }

  if (player.x + player.w > WORLD_WIDTH) {
    player.x = WORLD_WIDTH - player.w;
    player.vx = 0;
  }

  if (player.y > WORLD_HEIGHT + 100) {
    killRun();
  }

  const allHazards = [...(currentLevel.hazards || []), ...(currentLevel.movingHazards || [])];

  for (const hazard of allHazards) {
    if (intersects(player, hazard)) {
      killRun();
      break;
    }
  }

  const goal = currentLevel.goal;
  if (player.x + player.w > goal.x && player.y + player.h > goal.y && player.y < goal.y + goal.h) {
    state.phase = 'level-clear';
    spawnBurst(player.x + player.w / 2, goal.y + 20, '#1f7a4d', 24);
    nextLevel();
  }
}

function drawBackground() {
  ctx.fillStyle = '#f9f7f4';
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.strokeStyle = 'rgba(20, 20, 20, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < WORLD_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_HEIGHT);
    ctx.stroke();
  }
}

function drawGoal(goal) {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);

  ctx.fillStyle = '#d63b35';
  ctx.beginPath();
  ctx.moveTo(goal.x + goal.w, goal.y + 12);
  ctx.lineTo(goal.x + goal.w + 48, goal.y + 28);
  ctx.lineTo(goal.x + goal.w, goal.y + 42);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f9f3ee';
  ctx.fillRect(goal.x + goal.w + 10, goal.y + 10, 2, goal.h - 20);

  ctx.fillStyle = '#111';
  ctx.font = 'bold 12px Segoe UI';
  ctx.fillText('FINISH', goal.x - 8, goal.y - 10);
}

function drawHazard(hazard) {
  const x = hazard.x;
  const y = hazard.y;
  const w = hazard.w;
  const h = hazard.h;

  ctx.fillStyle = '#d63b35';
  ctx.beginPath();
  for (let i = 0; i <= 10; i += 1) {
    const px = x + (w / 10) * i;
    const py = i % 2 === 0 ? y : y + h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawPlatform(platform) {
  const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.h);
  gradient.addColorStop(0, '#232323');
  gradient.addColorStop(1, '#141414');
  ctx.fillStyle = gradient;
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);
}

function drawPlayer() {
  const x = player.x + player.w / 2;
  const y = player.y + player.h / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(player.facing, 1);

  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(0, -24, 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 16);
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, 12);
  ctx.lineTo(-10, 30);
  ctx.moveTo(0, 0);
  ctx.lineTo(14, 12);
  ctx.lineTo(10, 30);
  ctx.moveTo(0, 16);
  ctx.lineTo(-12, 36);
  ctx.moveTo(0, 16);
  ctx.lineTo(12, 36);
  ctx.stroke();

  ctx.restore();
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 4 : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 4 : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawBackground();

  if (currentLevel) {
    for (const platform of currentLevel.platforms) drawPlatform(platform);
    for (const hazard of currentLevel.hazards || []) drawHazard(hazard);
    for (const hazard of currentLevel.movingHazards || []) drawHazard(hazard);
    drawGoal(currentLevel.goal);
  }

  drawPlayer();
  drawParticles();

  ctx.restore();
}

function tick(timestamp) {
  const dt = Math.min((timestamp - (state.lastTime || timestamp)) / 1000, 0.033);
  state.lastTime = timestamp;

  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - 12 * dt);
  }

  handleInput(dt);
  updateMovingHazards(dt);
  updatePlayer(dt);
  updateParticles(dt);
  draw();

  requestAnimationFrame(tick);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys[key] = true;

  if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys[key] = false;
});

startButton.addEventListener('click', () => {
  startRun();
});

restartButton.addEventListener('click', () => {
  startRun();
});

bestLabel.textContent = state.best ? `Lv ${state.best + 1}` : '—';
loadLevel(0);
setOverlay('Ready?', 'Use A/D or arrow keys to move, and Space to jump. Reach the red finish flag on the right. One hit ends the run.', 'Start Run');
requestAnimationFrame(tick);

window.__gameReady = true;
