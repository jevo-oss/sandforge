(function () {
  'use strict';

  const { SandEngine, EL, EL_META } = window.SandForge;
  window.SANDFORGE_BUILD = 'SANDFORGE_V3_REVAMP';

  const TOOLS = {
    tools: [
      { id: 'grab',     name: 'Grab / Throw', emoji: '🖐️', kind: 'tool', hint: 'Grab a mob or bomb to fling it, or scoop sand & water!' },
      { id: 'minigun',  name: 'Minigun',      emoji: '🔫', kind: 'tool', hint: 'Hold to spray high-velocity bullets at the target' },
      { id: 'rpg',      name: 'RPG',          emoji: '🚀', kind: 'tool', hint: 'Tap or drag-to-aim a rocket with smoke trail & blast' },
      { id: 'bomb',     name: 'Bomb',         emoji: '💣', kind: 'tool', hint: 'Tap to drop or drag to throw a lit fuse bomb' },
      { id: 'firework', name: 'Firework',     emoji: '🎆', kind: 'tool', hint: 'Tap to launch a colorful firework rocket' },
      { id: 'tornado',  name: 'Tornado',      emoji: '🌪️', kind: 'tool', hint: 'Hold & drag to steer a tornado that flings everything' },
      { id: 'tsunami',      name: 'Tsunami',       emoji: '🌊', kind: 'tool', hint: 'Tap left or right side to unleash a giant tidal wave' },
      { id: 'meteor',       name: 'Meteor',        emoji: '☄️', kind: 'tool', hint: 'Tap a target — a meteor falls from the sky, craters terrain, and splashes lava' },
      { id: 'lightning',    name: 'Lightning',     emoji: '⚡', kind: 'tool', hint: 'Tap to drop a bolt that ignites fuel, electrifies water & metal, and zaps mobs' },
      { id: 'blackhole',    name: 'Black Hole',    emoji: '🕳️', kind: 'tool', hint: 'Tap (or hold & drag) a vortex that sucks in matter and mobs, then collapses' },
      { id: 'nuke',         name: 'Nuke',          emoji: '☢️', kind: 'tool', hint: 'Tap for a huge blast, mushroom cloud, and shockwave — smoke still fades away' },
      { id: 'earthquake',   name: 'Earthquake',    emoji: '🌍', kind: 'tool', hint: 'Shake the world, loosen solids, and knock every mob off its feet' },
      { id: 'flamethrower', name: 'Flamethrower',  emoji: '🔥', kind: 'tool', hint: 'Drag to spray a cone of fire and embers' },
      { id: 'eraser',       name: 'Eraser',        emoji: '🧹', kind: 'element', el: EL.EMPTY, hint: 'Erase cells, mobs, and bombs' },
    ],
    mobs: [
      { id: 'mob_walker', name: 'Walker',      emoji: '🏃', kind: 'mob', mobType: 'walker', hint: 'Tap to spawn stick dudes that walk, climb & swim' },
      { id: 'mob_jumper', name: 'Jumper',      emoji: '🦘', kind: 'mob', mobType: 'jumper', hint: 'Bouncy stick jumpers that leap over terrain' },
      { id: 'mob_zombie', name: 'Zombie',      emoji: '🧟', kind: 'mob', mobType: 'zombie', hint: 'Hunts humans — they fight back! Bites hurt; infection only after a knockout' },
      { id: 'mob_dummy',  name: 'Crash Dummy', emoji: '🎯', kind: 'mob', mobType: 'dummy',  hint: 'Extra-bouncy ragdoll target dummy' },
    ],
    solids: [
      EL.SAND, EL.STONE, EL.WOOD, EL.METAL, EL.ICE, EL.GLASS,
      EL.PLANT, EL.SEED, EL.SALT, EL.GUNPOWDER, EL.TNT, EL.SNOW,
    ].map((el) => ({
      id: 'el_' + el,
      name: EL_META[el].name,
      color: EL_META[el].color,
      kind: 'element',
      el,
      hint: EL_META[el].desc,
    })),
    liquids: [
      EL.WATER, EL.OIL, EL.LAVA, EL.ACID,
    ].map((el) => ({
      id: 'el_' + el,
      name: EL_META[el].name,
      color: EL_META[el].color,
      kind: 'element',
      el,
      hint: EL_META[el].desc,
    })),
    energy: [
      EL.FIRE, EL.SMOKE, EL.STEAM, EL.SPARK,
    ].map((el) => ({
      id: 'el_' + el,
      name: EL_META[el].name,
      color: EL_META[el].color,
      kind: 'element',
      el,
      hint: EL_META[el].desc,
    })),
  };

  // DOM
  const stageEl = document.getElementById('stage');
  const canvas = document.getElementById('view');
  const ctx = canvas.getContext('2d', { alpha: false });
  const paletteEl = document.getElementById('palette');
  const catTabsEl = document.getElementById('cat-tabs');
  const brushWrapEl = document.getElementById('brush-wrap');
  const statsPill = document.getElementById('stats-pill');
  const toastEl = document.getElementById('toast');
  const activeChip = document.getElementById('active-chip');
  const activeIcon = document.getElementById('active-icon');
  const activeName = document.getElementById('active-name');
  const paletteWrap = document.getElementById('palette-wrap');
  const btnPause = document.getElementById('btn-pause');
  const btnSpeed = document.getElementById('btn-speed');
  const btnZoomReset = document.getElementById('btn-zoom-reset');
  const btnClear = document.getElementById('btn-clear');
  const btnScenes = document.getElementById('btn-scenes');
  const scenesModal = document.getElementById('scenes-modal');
  const sceneListEl = document.getElementById('scene-list');
  const btnCloseScenes = document.getElementById('btn-close-scenes');

  // Compute spacious grid size matching initial viewport aspect (~120,000 cells)
  function computeGridDims() {
    const rect = stageEl.getBoundingClientRect();
    const w = Math.max(300, rect.width || window.innerWidth);
    const h = Math.max(300, rect.height || (window.innerHeight - 130));
    const aspect = w / h;
    const targetCells = 120000;
    let gw = Math.round(Math.sqrt(targetCells * aspect));
    let gh = Math.round(gw / aspect);
    gw = Math.max(240, Math.min(540, gw));
    gh = Math.max(220, Math.min(480, gh));
    return { gw, gh };
  }

  const { gw, gh } = computeGridDims();
  const engine = new SandEngine(gw, gh);

  // Offscreen buffer for pixel grid
  const offCanvas = document.createElement('canvas');
  offCanvas.width = engine.width;
  offCanvas.height = engine.height;
  const offCtx = offCanvas.getContext('2d');
  const imgData = offCtx.createImageData(engine.width, engine.height);
  const imgU32 = new Uint32Array(imgData.data.buffer);

  // Camera (zoom + pan in CSS/stage space)
  let cam = { zoom: 1, panX: 0, panY: 0 };
  let viewW = 1, viewH = 1, dpr = 1;

  function resizeDisplay() {
    const rect = stageEl.getBoundingClientRect();
    viewW = Math.max(1, rect.width);
    viewH = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    clampCamera();
  }

  function getBaseTransform() {
    const scale = Math.min(viewW / engine.width, viewH / engine.height);
    const drawW = engine.width * scale;
    const drawH = engine.height * scale;
    const offX = (viewW - drawW) * 0.5;
    const offY = (viewH - drawH) * 0.5;
    return { scale, offX, offY };
  }

  function clampCamera() {
    cam.zoom = Math.max(1, Math.min(6, cam.zoom));
    if (cam.zoom <= 1.01) {
      cam.zoom = 1;
      cam.panX = 0;
      cam.panY = 0;
      btnZoomReset.classList.add('hidden');
    } else {
      const maxPanX = viewW * (cam.zoom - 1) * 0.55;
      const maxPanY = viewH * (cam.zoom - 1) * 0.55;
      cam.panX = Math.max(-maxPanX, Math.min(maxPanX, cam.panX));
      cam.panY = Math.max(-maxPanY, Math.min(maxPanY, cam.panY));
      btnZoomReset.classList.remove('hidden');
      btnZoomReset.textContent = cam.zoom.toFixed(1) + '×';
    }
  }

  function screenToGrid(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const cx = (sx - viewW * 0.5 - cam.panX) / cam.zoom + viewW * 0.5;
    const cy = (sy - viewH * 0.5 - cam.panY) / cam.zoom + viewH * 0.5;
    const { scale, offX, offY } = getBaseTransform();
    return {
      gx: (cx - offX) / scale,
      gy: (cy - offY) / scale,
    };
  }

  // State
  let currentCat = 'tools';
  let currentTool = TOOLS.tools[0];
  let brushSize = 5;
  let paused = false;
  let speedMul = 1;
  let toastTimer = null;

  function showToast(msg) {
    if (!msg) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 2600);
  }

  function pulseChip() {
    if (!activeChip) return;
    activeChip.classList.remove('pulse');
    void activeChip.offsetWidth;
    activeChip.classList.add('pulse');
  }

  function updateActiveChip() {
    if (!activeName) return;
    activeName.textContent = currentTool.name;
    activeIcon.replaceChildren();
    if (currentTool.color) {
      const sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = currentTool.color;
      activeIcon.appendChild(sw);
    } else {
      activeIcon.textContent = currentTool.emoji || '•';
    }
  }

  function updatePaletteFades() {
    if (!paletteWrap) return;
    const el = paletteEl;
    paletteWrap.classList.toggle('can-left', el.scrollLeft > 4);
    paletteWrap.classList.toggle('can-right', el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function renderPalette() {
    paletteEl.innerHTML = '';
    const items = TOOLS[currentCat] || [];
    let activeBtn = null;
    for (const item of items) {
      const btn = document.createElement('button');
      const on = currentTool.id === item.id;
      btn.className = 'tool-btn' + (on ? ' active' : '');
      btn.dataset.id = item.id;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (item.color) {
        const sw = document.createElement('span');
        sw.className = 'swatch';
        sw.style.background = item.color;
        btn.appendChild(sw);
      } else {
        const em = document.createElement('span');
        em.className = 'tool-emoji';
        em.textContent = item.emoji;
        btn.appendChild(em);
      }
      const lbl = document.createElement('span');
      lbl.textContent = item.name;
      btn.appendChild(lbl);
      btn.addEventListener('click', () => {
        currentTool = item;
        renderPalette();
        showToast(item.hint);
        pulseChip();
      });
      paletteEl.appendChild(btn);
      if (on) activeBtn = btn;
    }
    updateActiveChip();
    requestAnimationFrame(() => {
      if (activeBtn) activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      updatePaletteFades();
    });
  }

  catTabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.cat-tab');
    if (!tab) return;
    currentCat = tab.dataset.cat;
    catTabsEl.querySelectorAll('.cat-tab').forEach((b) => b.classList.toggle('active', b === tab));
    const list = TOOLS[currentCat];
    if (list && list.length && !list.some((x) => x.id === currentTool.id)) {
      currentTool = list[0];
      showToast(currentTool.hint);
    }
    renderPalette();
  });

  brushWrapEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.size-btn');
    if (!btn) return;
    brushSize = parseInt(btn.dataset.size, 10) || 5;
    brushWrapEl.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('active', b === btn));
  });

  paletteEl.addEventListener('scroll', updatePaletteFades, { passive: true });

  btnPause.addEventListener('click', () => {
    paused = !paused;
    btnPause.textContent = paused ? '▶' : '⏸';
    btnPause.classList.toggle('active', paused);
    showToast(paused ? 'Paused' : 'Playing');
  });

  const speeds = [1, 2, 0.5];
  let speedIdx = 0;
  btnSpeed.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    speedMul = speeds[speedIdx];
    btnSpeed.textContent = speedMul + '×';
  });

  btnZoomReset.addEventListener('click', () => {
    cam.zoom = 1; cam.panX = 0; cam.panY = 0;
    clampCamera();
  });

  btnClear.addEventListener('click', () => {
    engine.clear();
    showToast('World cleared');
  });

  // Starter Scenes
  const SCENES = [
    {
      name: 'TNT Village & Mobs',
      desc: 'Wood bridge, TNT bunker, pond, plants & lively stick dudes',
      build() {
        engine.clear();
        const W = engine.width, H = engine.height;
        const floorY = Math.floor(H * 0.78);

        // Rolling stone/sand terrain with natural pond bowl on left
        const pondMid = Math.floor(W * 0.17);
        const pondHalf = Math.max(22, Math.floor(W * 0.1));
        for (let x = 0; x < W; x++) {
          const dxPond = Math.abs(x - pondMid) / pondHalf;
          const bowl = dxPond < 1 ? Math.round((1 - dxPond * dxPond) * 16) : 0;
          const hill = Math.round(Math.sin(x * 0.035) * 9 + Math.cos(x * 0.015) * 5) + bowl;
          const topY = floorY + hill;
          for (let y = topY; y < H; y++) {
            engine.setCell(x, y, y < topY + 7 ? EL.SAND : EL.STONE);
          }
          if (bowl > 2) {
            for (let y = floorY + 4; y < topY; y++) {
              engine.setCell(x, y, EL.WATER);
            }
          }
        }

        // Wooden tower + TNT stash on right-center
        const bx = Math.floor(W * 0.62);
        for (let y = floorY - 34; y < floorY; y++) {
          engine.setCell(bx, y, EL.WOOD); engine.setCell(bx + 1, y, EL.WOOD);
          engine.setCell(bx + 26, y, EL.WOOD); engine.setCell(bx + 27, y, EL.WOOD);
        }
        for (let x = bx - 2; x <= bx + 29; x++) {
          engine.setCell(x, floorY - 35, EL.WOOD);
          engine.setCell(x, floorY - 36, EL.WOOD);
        }
        // TNT crates inside
        for (let x = bx + 6; x <= bx + 21; x++) {
          for (let y = floorY - 14; y < floorY - 3; y++) {
            engine.setCell(x, y, EL.TNT);
          }
        }

        // Lush trees
        for (const tx of [Math.floor(W * 0.36), Math.floor(W * 0.85)]) {
          for (let y = floorY - 22; y < floorY; y++) {
            engine.setCell(tx, y, EL.WOOD); engine.setCell(tx + 1, y, EL.WOOD);
          }
          engine.paintBrush(tx, floorY - 25, 9, EL.PLANT, true);
        }

        // Mobs!
        engine.spawnMob('walker', W * 0.42, floorY - 20);
        engine.spawnMob('walker', W * 0.48, floorY - 20);
        engine.spawnMob('jumper', W * 0.54, floorY - 20);
        engine.spawnMob('jumper', W * 0.78, floorY - 20);
        engine.spawnMob('dummy', bx + 14, floorY - 40);
        engine.spawnMob('walker', W * 0.18, floorY - 16);
      },
    },
    {
      name: 'Volcano & Icebergs',
      desc: 'Erupting lava cone over a frozen ocean & salt beds',
      build() {
        engine.clear();
        const W = engine.width, H = engine.height;
        const cx = Math.floor(W * 0.5);
        const floorY = Math.floor(H * 0.8);

        // Seafloor & water
        for (let x = 0; x < W; x++) {
          for (let y = floorY; y < H; y++) engine.setCell(x, y, EL.STONE);
          if (Math.abs(x - cx) > 36) {
            for (let y = floorY - 26; y < floorY; y++) engine.setCell(x, y, EL.WATER);
          }
        }

        // Stone volcano cone
        for (let dy = 0; dy < 55; dy++) {
          const y = floorY - dy;
          const half = 42 - dy * 0.55;
          for (let x = Math.floor(cx - half); x <= Math.ceil(cx + half); x++) {
            if (Math.abs(x - cx) < 8) {
              engine.setCell(x, y, dy > 18 ? EL.LAVA : EL.STONE);
            } else {
              engine.setCell(x, y, EL.STONE);
            }
          }
        }

        // Icebergs & salt piles
        engine.paintBrush(Math.floor(W * 0.16), floorY - 28, 12, EL.ICE, true);
        engine.paintBrush(Math.floor(W * 0.84), floorY - 28, 12, EL.ICE, true);
        engine.paintBrush(Math.floor(W * 0.25), floorY - 40, 6, EL.SALT, false);
        engine.spawnMob('walker', W * 0.16, floorY - 45);
        engine.spawnMob('jumper', W * 0.84, floorY - 45);
      },
    },
    {
      name: 'Zombie Outbreak',
      desc: 'Fortified metal platforms, oil traps & zombies chasing walkers',
      build() {
        engine.clear();
        const W = engine.width, H = engine.height;
        const floorY = Math.floor(H * 0.84);
        for (let x = 0; x < W; x++) {
          for (let y = floorY; y < H; y++) engine.setCell(x, y, EL.METAL);
        }
        // Platforms
        for (let x = Math.floor(W * 0.15); x < Math.floor(W * 0.45); x++) {
          engine.setCell(x, floorY - 35, EL.METAL); engine.setCell(x, floorY - 34, EL.METAL);
        }
        for (let x = Math.floor(W * 0.55); x < Math.floor(W * 0.85); x++) {
          engine.setCell(x, floorY - 35, EL.WOOD); engine.setCell(x, floorY - 34, EL.WOOD);
        }
        // Oil & TNT trap in middle
        for (let x = Math.floor(W * 0.46); x < Math.floor(W * 0.54); x++) {
          for (let y = floorY - 6; y < floorY; y++) engine.setCell(x, y, EL.OIL);
        }
        engine.setCell(Math.floor(W * 0.5), floorY - 12, EL.TNT);
        engine.setCell(Math.floor(W * 0.5) + 1, floorY - 12, EL.TNT);

        for (let i = 0; i < 6; i++) engine.spawnMob('walker', W * (0.2 + i * 0.11), floorY - 50);
        engine.spawnMob('jumper', W * 0.72, floorY - 50);
        engine.spawnMob('zombie', W * 0.12, floorY - 10);
        engine.spawnMob('zombie', W * 0.88, floorY - 10);
      },
    },
    {
      name: 'Acid & Electricity Lab',
      desc: 'Acid-proof Glass tanks, Metal wires & Gunpowder fuses',
      build() {
        engine.clear();
        const W = engine.width, H = engine.height;
        const floorY = Math.floor(H * 0.82);
        for (let x = 0; x < W; x++) {
          for (let y = floorY; y < H; y++) engine.setCell(x, y, EL.STONE);
        }

        // Glass beaker with acid
        const gx = Math.floor(W * 0.25);
        for (let y = floorY - 40; y < floorY; y++) {
          engine.setCell(gx - 18, y, EL.GLASS); engine.setCell(gx - 17, y, EL.GLASS);
          engine.setCell(gx + 18, y, EL.GLASS); engine.setCell(gx + 17, y, EL.GLASS);
        }
        for (let x = gx - 18; x <= gx + 18; x++) engine.setCell(x, floorY - 1, EL.GLASS);
        for (let x = gx - 15; x <= gx + 15; x++) {
          for (let y = floorY - 24; y < floorY - 2; y++) engine.setCell(x, y, EL.ACID);
        }

        // Metal wire leading to TNT
        const wx = Math.floor(W * 0.5);
        for (let x = wx; x < Math.floor(W * 0.76); x++) {
          engine.setCell(x, floorY - 25, EL.METAL);
          engine.setCell(x, floorY - 24, EL.METAL);
        }
        engine.paintBrush(Math.floor(W * 0.78), floorY - 24, 5, EL.TNT, true);
        engine.paintBrush(Math.floor(W * 0.65), floorY - 4, 6, EL.GUNPOWDER, true);
        engine.spawnMob('dummy', Math.floor(W * 0.65), floorY - 20);
      },
    },
    {
      name: 'Blank Arena',
      desc: 'Fresh empty canvas ready for your own build',
      build() {
        engine.clear();
      },
    },
  ];

  function populateScenes() {
    sceneListEl.innerHTML = '';
    SCENES.forEach((sc) => {
      const btn = document.createElement('button');
      btn.className = 'scene-item';
      btn.innerHTML = `<strong>${sc.name}</strong><span>${sc.desc}</span>`;
      btn.addEventListener('click', () => {
        sc.build();
        scenesModal.classList.add('hidden');
        showToast('Loaded: ' + sc.name);
      });
      sceneListEl.appendChild(btn);
    });
  }
  btnScenes.addEventListener('click', () => scenesModal.classList.remove('hidden'));
  btnCloseScenes.addEventListener('click', () => scenesModal.classList.add('hidden'));
  scenesModal.addEventListener('click', (e) => {
    if (e.target === scenesModal) scenesModal.classList.add('hidden');
  });

  // Pointer & Multi-Touch Handling
  const activePointers = new Map();
  let gestureMode = null; // 'draw' | 'panzoom' | 'pan' | 'aim' | 'tornado' | 'minigun'
  let lastGridPt = null;
  let lastMobSpawnPt = null;
  let lastMobSpawnTime = 0;
  let aimStart = null;
  let aimCurrent = null;
  let activeTornado = null;
  let activeBlackHole = null;
  let flameDir = { x: 0, y: -1 };
  let panLast = null;
  let pinchLast = null;
  let minigunTick = 0;
  let hoverGrid = null;

  function getTwoPointers() {
    const pts = Array.from(activePointers.values());
    return pts.length >= 2 ? [pts[0], pts[1]] : null;
  }

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button });

    // Right or middle mouse drag pans
    if (e.button === 1 || e.button === 2) {
      gestureMode = 'pan';
      panLast = { x: e.clientX, y: e.clientY };
      return;
    }

    // Two fingers -> pinch zoom + pan
    if (activePointers.size === 2) {
      if (gestureMode === 'grab') engine.endGrab();
      if (activeTornado) { activeTornado.controlled = false; activeTornado = null; }
      if (activeBlackHole) { activeBlackHole.controlled = false; activeBlackHole = null; }
      gestureMode = 'panzoom';
      const [p1, p2] = getTwoPointers();
      pinchLast = {
        cx: (p1.x + p2.x) * 0.5,
        cy: (p1.y + p2.y) * 0.5,
        dist: Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1,
      };
      return;
    }

    if (activePointers.size > 1) return;

    const pt = screenToGrid(e.clientX, e.clientY);
    hoverGrid = pt;
    const isTouch = e.pointerType === 'touch';

    if (currentTool.kind === 'element') {
      gestureMode = 'draw';
      lastGridPt = pt;
      engine.paintBrush(Math.round(pt.gx), Math.round(pt.gy), brushSize, currentTool.el, false);
    } else if (currentTool.kind === 'mob') {
      gestureMode = 'mob';
      engine.spawnMob(currentTool.mobType, pt.gx, pt.gy);
      lastMobSpawnPt = pt;
      lastMobSpawnTime = performance.now();
    } else if (currentTool.id === 'grab') {
      gestureMode = 'grab';
      const grabbed = engine.startGrab(pt.gx, pt.gy, isTouch ? 20 : 14);
      lastGridPt = pt;
      if (!grabbed) {
        gestureMode = 'scoop';
      }
    } else if (currentTool.id === 'bomb') {
      gestureMode = 'aim_bomb';
      aimStart = pt;
      aimCurrent = pt;
    } else if (currentTool.id === 'rpg') {
      gestureMode = 'aim_rpg';
      aimStart = pt;
      aimCurrent = pt;
    } else if (currentTool.id === 'minigun') {
      gestureMode = 'minigun';
      aimCurrent = pt;
      aimStart = pt;
      minigunTick = 0;
    } else if (currentTool.id === 'firework') {
      gestureMode = 'firework';
      engine.spawnFirework(pt.gx, pt.gy);
    } else if (currentTool.id === 'tornado') {
      gestureMode = 'tornado';
      activeTornado = engine.spawnTornado(pt.gx, pt.gy, 150);
      activeTornado.controlled = true;
    } else if (currentTool.id === 'tsunami') {
      gestureMode = 'tsunami';
      engine.spawnTsunami(pt.gx < engine.width * 0.5);
    } else if (currentTool.id === 'meteor') {
      gestureMode = 'meteor';
      engine.spawnMeteor(pt.gx, pt.gy);
    } else if (currentTool.id === 'lightning') {
      gestureMode = 'lightning';
      engine.spawnLightning(pt.gx, pt.gy);
    } else if (currentTool.id === 'blackhole') {
      gestureMode = 'blackhole';
      activeBlackHole = engine.spawnBlackHole(pt.gx, pt.gy, 95);
      activeBlackHole.controlled = true;
    } else if (currentTool.id === 'nuke') {
      gestureMode = 'nuke';
      engine.spawnNuke(pt.gx, pt.gy);
    } else if (currentTool.id === 'earthquake') {
      gestureMode = 'earthquake';
      engine.spawnEarthquake();
    } else if (currentTool.id === 'flamethrower') {
      gestureMode = 'flamethrower';
      lastGridPt = pt;
      flameDir = { x: 0, y: -1 };
      engine.sprayFlamethrower(pt.gx, pt.gy, 0, -1);
    }

    if (currentTool.kind !== 'element' || currentTool.id === 'eraser') {
      pulseChip();
      const useHints = {
        grab: 'Grab & throw — drag a mob or scoop sand!',
        minigun: 'Minigun — hold to fire!',
        rpg: 'RPG — drag to aim, release to launch',
        bomb: 'Bomb — drag to throw, release to light it',
        firework: 'Firework launched!',
        tornado: 'Tornado — drag to steer the funnel',
        tsunami: 'Tsunami incoming!',
        meteor: 'Meteor incoming!',
        lightning: 'Lightning strike!',
        blackhole: 'Black hole — hold to steer, then it collapses',
        nuke: 'Nuke launched!',
        earthquake: 'Earthquake!',
        flamethrower: 'Flamethrower — drag to spray fire',
        eraser: 'Erasing',
        mob_walker: 'Walker spawned',
        mob_jumper: 'Jumper spawned',
        mob_zombie: 'Zombie spawned — humans will fight back',
        mob_dummy: 'Crash dummy spawned',
      };
      if (useHints[currentTool.id]) showToast(useHints[currentTool.id]);
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (activePointers.has(e.pointerId)) {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button });
    }
    const pt = screenToGrid(e.clientX, e.clientY);
    hoverGrid = pt;

    if (gestureMode === 'pan' && panLast) {
      cam.panX += e.clientX - panLast.x;
      cam.panY += e.clientY - panLast.y;
      panLast = { x: e.clientX, y: e.clientY };
      clampCamera();
      return;
    }

    if (gestureMode === 'panzoom' && activePointers.size >= 2 && pinchLast) {
      const [p1, p2] = getTwoPointers();
      const cx = (p1.x + p2.x) * 0.5;
      const cy = (p1.y + p2.y) * 0.5;
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const factor = dist / pinchLast.dist;
      const oldZoom = cam.zoom;
      cam.zoom = Math.max(1, Math.min(6, oldZoom * factor));
      cam.panX += cx - pinchLast.cx;
      cam.panY += cy - pinchLast.cy;
      pinchLast = { cx, cy, dist };
      clampCamera();
      return;
    }

    if (activePointers.size !== 1 || !activePointers.has(e.pointerId)) return;

    if (gestureMode === 'draw' && lastGridPt) {
      engine.paintLine(lastGridPt.gx, lastGridPt.gy, pt.gx, pt.gy, brushSize, currentTool.el, false);
      lastGridPt = pt;
    } else if (gestureMode === 'mob') {
      const now = performance.now();
      const moved = lastMobSpawnPt ? Math.hypot(pt.gx - lastMobSpawnPt.gx, pt.gy - lastMobSpawnPt.gy) : 999;
      if (now - lastMobSpawnTime > 170 && moved > 14) {
        engine.spawnMob(currentTool.mobType, pt.gx, pt.gy);
        lastMobSpawnPt = pt;
        lastMobSpawnTime = now;
      }
    } else if (gestureMode === 'grab') {
      engine.moveGrab(pt.gx, pt.gy);
    } else if (gestureMode === 'scoop' && lastGridPt) {
      const vx = pt.gx - lastGridPt.gx;
      const vy = pt.gy - lastGridPt.gy;
      engine.scoopParticles(pt.gx, pt.gy, vx, vy, Math.max(10, brushSize + 6));
      lastGridPt = pt;
    } else if (gestureMode === 'aim_bomb' || gestureMode === 'aim_rpg' || gestureMode === 'minigun') {
      aimCurrent = pt;
    } else if (gestureMode === 'tornado' && activeTornado) {
      activeTornado.x = pt.gx;
      activeTornado.y = pt.gy;
    } else if (gestureMode === 'blackhole' && activeBlackHole) {
      activeBlackHole.x = pt.gx;
      activeBlackHole.y = pt.gy;
    } else if (gestureMode === 'flamethrower' && lastGridPt) {
      const dx = pt.gx - lastGridPt.gx, dy = pt.gy - lastGridPt.gy;
      if (dx * dx + dy * dy > 0.16) flameDir = { x: dx, y: dy };
      engine.sprayFlamethrower(pt.gx, pt.gy, flameDir.x, flameDir.y);
      lastGridPt = pt;
    }
  });

  function handlePointerUp(e) {
    activePointers.delete(e.pointerId);

    if (gestureMode === 'grab') engine.endGrab();
    if (gestureMode === 'aim_bomb' && aimStart && aimCurrent) {
      const dx = (aimCurrent.gx - aimStart.gx) * 0.28;
      const dy = (aimCurrent.gy - aimStart.gy) * 0.28;
      engine.spawnBomb(aimStart.gx, aimStart.gy, Math.max(-8, Math.min(8, dx)), Math.max(-8, Math.min(8, dy)));
    }
    if (gestureMode === 'aim_rpg' && aimStart && aimCurrent) {
      const dist = Math.hypot(aimCurrent.gx - aimStart.gx, aimCurrent.gy - aimStart.gy);
      if (dist > 8) {
        engine.fireRocket(aimStart.gx, aimStart.gy, aimCurrent.gx, aimCurrent.gy);
      } else {
        const ox = aimCurrent.gx < engine.width * 0.5 ? engine.width * 0.85 : engine.width * 0.15;
        engine.fireRocket(ox, 10, aimCurrent.gx, aimCurrent.gy);
      }
    }
    if (gestureMode === 'tornado' && activeTornado) {
      activeTornado.controlled = false;
      activeTornado.life = 135;
      activeTornado = null;
    }
    if (gestureMode === 'blackhole' && activeBlackHole) {
      activeBlackHole.controlled = false;
      activeBlackHole.life = Math.min(activeBlackHole.life, 70);
      activeBlackHole = null;
    }

    if (activePointers.size === 0) {
      gestureMode = null;
      aimStart = null;
      aimCurrent = null;
      lastGridPt = null;
      panLast = null;
      pinchLast = null;
    }
  }

  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.14 : 0.88;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left - viewW * 0.5;
    const sy = e.clientY - rect.top - viewH * 0.5;
    const oldZoom = cam.zoom;
    const newZoom = Math.max(1, Math.min(6, oldZoom * factor));
    const ratio = newZoom / oldZoom;
    cam.panX = sx - (sx - cam.panX) * ratio;
    cam.panY = sy - (sy - cam.panY) * ratio;
    cam.zoom = newZoom;
    clampCamera();
  }, { passive: false });

  // Vector Overlay Drawing (Mobs, Bombs, Weapons, Disasters, Reticle)
  function limb(ctx, x1, y1, x2, y2, width, color, outline) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = outline;
    ctx.lineWidth = width + 1.15;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const MOB_PAL = {
    walker: { skin: '#f0c7a0', shirt: '#3b82f6', shirtD: '#1d4ed8', pants: '#1e3a5f', shoe: '#0f172a', hair: '#1e293b', accent: '#93c5fd', outline: '#0b1220' },
    jumper: { skin: '#ffd7b3', shirt: '#a3e635', shirtD: '#4d7c0f', pants: '#365314', shoe: '#f8fafc', hair: '#3f6212', accent: '#ecfccb', outline: '#14200a' },
    zombie: { skin: '#c6e89a', shirt: '#8a5a3c', shirtD: '#5a3a24', pants: '#4a4638', shoe: '#1c1917', hair: '#4a5c38', accent: '#14532d', outline: '#1a2410' },
    dummy:  { skin: '#fb923c', shirt: '#f97316', shirtD: '#c2410c', pants: '#ea580c', shoe: '#7c2d12', hair: '#7c2d12', accent: '#0f172a', outline: '#1c0a00' },
  };

  function drawStickMob(ctx, m) {
    const pal = MOB_PAL[m.type] || MOB_PAL.walker;
    const flail = (m.state === 'ragdoll' || m.state === 'grabbed' || m.burnTimer > 0);
    const attacking = m.attackTimer > 0;
    const phase = m.walkPhase;
    const moving = Math.abs(m.vx) > 0.12;
    const airborne = !m.onGround && m.state !== 'grabbed';
    const face = m.facing >= 0 ? 1 : -1;

    let walk = flail ? 1 : (moving ? 1 : 0.18);
    let legL = Math.sin(phase) * 2.6 * walk;
    let legR = -Math.sin(phase) * 2.6 * walk;
    let armL = Math.cos(phase) * 2.2 * walk;
    let armR = -Math.cos(phase) * 2.2 * walk;
    let bodyY = 0;
    let headX = 0, headY = 0;

    if (airborne && !flail && !attacking) {
      // Jump tuck
      legL = -2.2; legR = 2.2;
      armL = -2.8; armR = 2.8;
      bodyY = -0.8;
    }

    if (flail) {
      legL = Math.sin(phase * 1.9) * 3.6;
      legR = Math.cos(phase * 1.7) * 3.6;
      armL = Math.cos(phase * 2.1) * 4.4;
      armR = Math.sin(phase * 1.8) * 4.4;
    }

    // Attack poses
    if (attacking && !flail) {
      const t = m.attackTimer / 14;
      const reach = 2.5 + (1 - t) * 3.5;
      if (m.attackStyle === 'punch' || m.attackStyle === 'shove') {
        armR = face * reach; if (m.attackStyle === 'shove') armL = face * (reach - 1);
      } else if (m.attackStyle === 'kick') {
        legR = face * reach * 0.9;
      } else if (m.attackStyle === 'stomp') {
        bodyY = 1.6; legL = -1.4; legR = 1.4;
      } else if (m.attackStyle === 'bite') {
        headX = face * 2.2; headY = 0.6;
        armL = face * 3.4; armR = face * 3.8;
      }
    }

    ctx.save();
    ctx.translate(m.x, m.y - 6 + bodyY);
    ctx.rotate(m.angle);
    ctx.scale(face * 1.12, 1.12);

    const outline = pal.outline;
    let shirt = pal.shirt, skin = pal.skin, pants = pal.pants;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 6.4, 4.2, 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const footY = 6.2;
    limb(ctx, -1.3, 1.6, -1.5 + legL * 0.15, footY + (airborne ? -0.6 : 0), 2.15, pants, outline);
    limb(ctx,  1.3, 1.6,  1.5 + legR * 0.15, footY + (airborne ? -0.6 : 0), 2.15, pants, outline);
    // Shoes
    ctx.fillStyle = pal.shoe;
    ctx.beginPath(); ctx.ellipse(-1.5 + legL * 0.15 + 0.6, footY + 0.15, 1.7, 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 1.5 + legR * 0.15 + 0.6, footY + 0.15, 1.7, 0.7, 0, 0, Math.PI * 2); ctx.fill();

    // Torso
    ctx.lineJoin = 'round';
    ctx.fillStyle = shirt;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.roundRect(-2.5, -4.6, 5, 6.4, 1.5);
    ctx.fill();
    ctx.stroke();
    // Belly shade
    ctx.fillStyle = pal.shirtD;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.roundRect(-2.0, -0.4, 4, 2.0, 1);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (m.type === 'dummy') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-1.5, -3.4); ctx.lineTo(1.5, 0.6);
      ctx.moveTo(1.5, -3.4); ctx.lineTo(-1.5, 0.6);
      ctx.stroke();
    } else if (m.type === 'zombie') {
      // Torn hem
      ctx.fillStyle = pal.shirtD;
      ctx.beginPath();
      ctx.moveTo(-2.4, 1.4); ctx.lineTo(-1.2, 2.4); ctx.lineTo(0, 1.4); ctx.lineTo(1.1, 2.3); ctx.lineTo(2.4, 1.4);
      ctx.fill();
    } else if (m.type === 'walker') {
      // Hoodie pocket
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-1.5, -0.6, 3, 1.6);
    } else if (m.type === 'jumper') {
      // Chest stripe
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-2.4, -2.2, 4.8, 0.7);
    }

    // Arms
    const shoulderY = -3.3;
    if (m.type === 'zombie' && !attacking && !flail) {
      limb(ctx, -2.0, shoulderY, 4.6, -3.2 + Math.sin(phase) * 0.7, 1.9, pal.shirtD, outline);
      limb(ctx,  2.0, shoulderY, 5.0, -1.6 - Math.sin(phase) * 0.6, 1.9, pal.shirtD, outline);
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(4.6, -3.2 + Math.sin(phase) * 0.7, 1.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(5.0, -1.6 - Math.sin(phase) * 0.6, 1.05, 0, Math.PI * 2); ctx.fill();
    } else {
      limb(ctx, -2.1, shoulderY, -3.2 - armL * 0.15, 0.6 + armL * 0.05, 1.9, shirt, outline);
      limb(ctx,  2.1, shoulderY,  3.2 + armR * 0.15, 0.6 + armR * 0.05, 1.9, shirt, outline);
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(-3.2 - armL * 0.15, 0.6 + armL * 0.05, 1.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( 3.2 + armR * 0.15, 0.6 + armR * 0.05, 1.05, 0, Math.PI * 2); ctx.fill();
    }

    // Head
    ctx.save();
    ctx.translate(headX, -7.1 + headY);
    ctx.fillStyle = skin;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, 3.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (m.type === 'walker') {
      // Cap
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.ellipse(0, -1.7, 3.15, 1.7, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(1.4, -1.6, 2.6, 0.7);
    } else if (m.type === 'jumper') {
      // Spiky hair
      ctx.fillStyle = pal.hair;
      ctx.beginPath();
      ctx.moveTo(-2.6, -1.4); ctx.lineTo(-2.0, -4.0); ctx.lineTo(-0.6, -2.0);
      ctx.lineTo(0.4, -4.2); ctx.lineTo(1.4, -2.0); ctx.lineTo(2.6, -3.6); ctx.lineTo(2.6, -1.2);
      ctx.fill();
    } else if (m.type === 'zombie') {
      // Patchy hair + torn ear
      ctx.fillStyle = pal.hair;
      ctx.beginPath();
      ctx.arc(-1.4, -2.2, 1.3, 0, Math.PI * 2);
      ctx.arc(0.6, -2.5, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.ellipse(-3.3, 0.2, 0.7, 1.1, -0.4, 0, Math.PI * 2); ctx.fill();
    } else if (m.type === 'dummy') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(-1.3, -1.2); ctx.lineTo(1.3, 1.2);
      ctx.moveTo(1.3, -1.2); ctx.lineTo(-1.3, 1.2);
      ctx.stroke();
    }

    // Faces (drawn in unflipped x because we already scaled by facing)
    if (m.type !== 'dummy') {
      if (m.type === 'zombie') {
        // Uneven glowing eyes
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath(); ctx.ellipse(1.05, -0.45, 1.15, 1.35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(1.1, -0.45, 0.48, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#450a0a';
        ctx.beginPath(); ctx.ellipse(-0.85, -0.1, 0.65, 0.4, 0, 0, Math.PI * 2); ctx.fill();
        // Gaping jaw + teeth
        ctx.fillStyle = '#1a0a0a';
        ctx.beginPath(); ctx.ellipse(0.25, 1.7, 1.55, (attacking ? 1.35 : 0.95), 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-0.7, 1.1, 0.5, 0.65);
        ctx.fillRect(0.15, 1.15, 0.4, 0.55);
        ctx.fillRect(0.9, 1.1, 0.4, 0.6);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(0.7, -0.25, 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-0.55, -0.25, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0.85, -0.4, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-0.4, -0.4, 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.arc(0.2, 1.15, 1.1, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(-0.8, -0.2, 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0.9, -0.2, 0.7, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore(); // head

    // Status
    if (m.burnTimer > 0) {
      ctx.fillStyle = 'rgba(255, 130, 20, 0.8)';
      ctx.beginPath();
      ctx.arc((Math.random() - 0.5) * 3, -10.2 - Math.random() * 2, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (m.shockTimer > 0) {
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(-4, -10); ctx.lineTo(2, -5); ctx.lineTo(-2, -1); ctx.lineTo(4, 4);
      ctx.stroke();
    }
    if (m.acidTimer > 0) {
      ctx.strokeStyle = 'rgba(110, 255, 59, 0.85)';
      ctx.lineWidth = 1.0;
      ctx.beginPath(); ctx.arc(0, -2, 6.5, 0, Math.PI * 2); ctx.stroke();
    }

    if (m.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 70, 70, 0.38)';
      ctx.beginPath();
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Health bar: show when hurt or in combat
    if (m.hp < m.maxHp || m.combatTimer > 0) {
      const pct = Math.max(0, m.hp / m.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(m.x - 6.5, m.y - 20, 13, 2.3);
      ctx.fillStyle = pct > 0.5 ? '#4ade80' : (pct > 0.25 ? '#facc15' : '#f43f5e');
      ctx.fillRect(m.x - 6.5, m.y - 20, 13 * pct, 2.3);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.35;
      ctx.strokeRect(m.x - 6.5, m.y - 20, 13, 2.3);
    }

    if (m.state === 'grabbed') {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(m.x, m.y - 6, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function renderFrame() {
    // Upload cellular pixels to offscreen canvas
    imgU32.set(engine.pixels);
    offCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, viewH);
    sky.addColorStop(0, '#1a2438');
    sky.addColorStop(0.45, '#101826');
    sky.addColorStop(1, '#070a10');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, viewW, viewH);

    // Apply camera zoom & pan
    ctx.translate(viewW * 0.5 + cam.panX, viewH * 0.5 + cam.panY);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-viewW * 0.5, -viewH * 0.5);

    const { scale, offX, offY } = getBaseTransform();
    ctx.translate(offX, offY);
    ctx.scale(scale, scale);
    ctx.translate(engine.shakeX || 0, engine.shakeY || 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0);

    // Soft bloom for fire, lava, sparks and embers
    const glows = engine.glows;
    if (glows && glows.length) {
      const W = engine.width;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let g = 0; g < glows.length; g++) {
        const idx = glows[g];
        const t = engine.type[idx];
        const gx = (idx % W) + 0.5;
        const gy = ((idx / W) | 0) + 0.5;
        if (t === EL.SPARK) ctx.fillStyle = 'rgba(140, 240, 255, 0.42)';
        else if (t === EL.LAVA) ctx.fillStyle = 'rgba(255, 90, 20, 0.36)';
        else if (t === EL.EMBER) ctx.fillStyle = 'rgba(255, 110, 30, 0.32)';
        else ctx.fillStyle = 'rgba(255, 150, 40, 0.30)';
        const rad = t === EL.LAVA ? 3.8 : (t === EL.SPARK ? 3.4 : 3.0);
        ctx.beginPath();
        ctx.arc(gx, gy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Tsunami water crest glow
    for (const w of engine.tsunamis) {
      const grad = ctx.createLinearGradient(w.x - 16, 0, w.x + 16, 0);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.38)');
      grad.addColorStop(1, 'rgba(224, 242, 254, 0.65)');
      ctx.fillStyle = grad;
      ctx.fillRect(w.x - 14, engine.height - w.waveHeight - 6, 28, w.waveHeight + 6);
    }

    // Draw Tornado funnel rings
    for (const tor of engine.tornadoes) {
      const fade = tor.controlled ? 1 : Math.min(1, tor.life / 40);
      const funnelH = Math.min(engine.height * 0.7, 130);
      ctx.strokeStyle = `rgba(203, 213, 225, ${0.4 * fade})`;
      ctx.lineWidth = 1.2;
      for (let h = 0; h < funnelH; h += 10) {
        const frac = h / funnelH;
        const rx = 5 + frac * 18;
        const wobble = Math.sin(tor.phase + h * 0.14) * 3;
        ctx.beginPath();
        ctx.ellipse(tor.x + wobble, tor.y - h, rx, 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw Meteors
    for (const m of engine.meteors) {
      ctx.save();
      ctx.translate(m.x, m.y);
      const trail = ctx.createRadialGradient(0, 0, 1, 0, 0, 9);
      trail.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
      trail.addColorStop(0.4, 'rgba(255, 110, 30, 0.7)');
      trail.addColorStop(1, 'rgba(255, 80, 20, 0)');
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7c4a1a';
      ctx.beginPath();
      ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Lightning bolts
    for (const bolt of engine.lightnings) {
      const a = Math.max(0, bolt.life / bolt.maxLife);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const stroke = (pts, width, color) => {
        if (!pts || pts.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      };
      ctx.globalCompositeOperation = 'lighter';
      stroke(bolt.pts, 8.5, `rgba(125, 211, 252, ${0.35 * a})`);
      stroke(bolt.pts, 3.2, `rgba(255, 255, 255, ${0.95 * a})`);
      for (const fork of bolt.forks) {
        stroke(fork, 6, `rgba(125, 211, 252, ${0.28 * a})`);
        stroke(fork, 2.0, `rgba(255, 255, 255, ${0.9 * a})`);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    // Draw Black Holes
    for (const bh of engine.blackHoles) {
      const fade = Math.min(1, bh.life / 18);
      const r = Math.max(1, bh.radius);
      ctx.save();
      ctx.translate(bh.x, bh.y);
      const halo = ctx.createRadialGradient(0, 0, r * 0.25, 0, 0, r * 1.25);
      halo.addColorStop(0, 'rgba(10, 6, 18, 0.95)');
      halo.addColorStop(0.55, `rgba(76, 29, 149, ${0.45 * fade})`);
      halo.addColorStop(1, 'rgba(15, 10, 25, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#05030a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(196, 181, 253, ${0.7 * fade})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.28, bh.phase * 0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Nuke mushroom overlay (smoke cells underneath already dissipate)
    for (const n of engine.nukes) {
      const a = Math.max(0, n.life / n.maxLife);
      const capY = n.y - n.stemH * (0.75 + (1 - a) * 0.2);
      ctx.save();
      ctx.fillStyle = `rgba(148, 163, 184, ${0.22 * a})`;
      ctx.beginPath();
      ctx.ellipse(n.x, capY, n.capR * (1.1 + (1 - a) * 0.4), n.capR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(71, 85, 105, ${0.2 * a})`;
      ctx.fillRect(n.x - 5, capY, 10, n.y - capY);
      ctx.restore();
    }

    // Draw Ballistic Particles (soft circles that fade out)
    for (const p of engine.particles) {
      const alpha = p.redeposit ? 1 : Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.7, p.size * 0.75), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw Bombs
    for (const b of engine.bombs) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      const blink = b.fuse < 35 && ((b.fuse >> 2) & 1) === 0;
      ctx.fillStyle = blink ? '#ef4444' : '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // Fuse
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(1, -3);
      ctx.lineTo(3, -5.2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Fireworks
    for (const fw of engine.fireworks) {
      ctx.fillStyle = fw.color;
      ctx.fillRect(fw.x - 1.2, fw.y - 2.5, 2.4, 5);
    }

    // Draw Bullets
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.4;
    for (const b of engine.bullets) {
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.7, b.y - b.vy * 0.7);
      ctx.stroke();
    }

    // Draw RPG Rockets
    for (const r of engine.rockets) {
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.angle);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-4, -1.3, 6, 2.6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(2, -1.3, 2.2, 2.6);
      ctx.restore();
    }

    // Draw Mobs
    for (const m of engine.mobs) {
      drawStickMob(ctx, m);
    }

    // Draw Explosion shockwave rings
    for (const f of engine.flashes) {
      const a = Math.max(0, f.life / f.maxLife);
      ctx.strokeStyle = `rgba(255, 220, 120, ${a * 0.75})`;
      ctx.lineWidth = 2.0 * a;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Aim / brush / tool preview — always obvious for the selected option
    const preview = hoverGrid || lastGridPt || aimCurrent;
    if ((gestureMode === 'aim_bomb' || gestureMode === 'aim_rpg') && aimStart && aimCurrent) {
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.95)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(aimStart.gx, aimStart.gy);
      ctx.lineTo(aimCurrent.gx, aimCurrent.gy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(aimCurrent.gx, aimCurrent.gy, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (preview) {
      drawToolPreview(ctx, preview.gx, preview.gy);
    }

    ctx.restore();

    // Vignette in screen space
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const vg = ctx.createRadialGradient(viewW * 0.5, viewH * 0.45, viewH * 0.2, viewW * 0.5, viewH * 0.5, Math.max(viewW, viewH) * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.restore();
  }

  function drawToolPreview(ctx, x, y) {
    const tool = currentTool;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (tool.kind === 'element') {
      ctx.strokeStyle = tool.el === EL.EMPTY ? 'rgba(248, 113, 113, 0.9)' : (tool.color || 'rgba(255,255,255,0.85)');
      ctx.fillStyle = tool.el === EL.EMPTY ? 'rgba(248, 113, 113, 0.08)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (tool.el === EL.EMPTY) {
        ctx.beginPath();
        const r = Math.max(3, brushSize * 0.45);
        ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
        ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
        ctx.stroke();
      }
    } else if (tool.kind === 'mob') {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.arc(x, y - 6, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(tool.emoji || '+', x, y - 4);
    } else if (tool.id === 'grab') {
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.95)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🖐️', x, y + 4);
    } else if (tool.id === 'minigun') {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y);
      ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
    } else if (tool.id === 'rpg' || tool.id === 'bomb') {
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.95)';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tool.emoji, x, y + 4);
    } else if (tool.id === 'meteor') {
      ctx.strokeStyle = '#fb923c';
      ctx.fillStyle = 'rgba(251, 146, 60, 0.12)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x, y - 10); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☄️', x, y + 4);
    } else if (tool.id === 'lightning') {
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', x, y + 4);
    } else if (tool.id === 'blackhole') {
      ctx.fillStyle = 'rgba(15, 6, 28, 0.55)';
      ctx.strokeStyle = 'rgba(196, 181, 253, 0.95)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (tool.id === 'nuke') {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.95)';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☢️', x, y + 5);
    } else if (tool.id === 'earthquake') {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - 14, y); ctx.lineTo(x - 7, y - 4); ctx.lineTo(x, y + 3); ctx.lineTo(x + 7, y - 5); ctx.lineTo(x + 14, y);
      ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌍', x, y - 8);
    } else if (tool.id === 'flamethrower') {
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.95)';
      ctx.fillStyle = 'rgba(251, 146, 60, 0.12)';
      ctx.lineWidth = 1.3;
      const ang = Math.atan2(flameDir.y, flameDir.x) || -Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, 16, ang - 0.45, ang + 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (tool.id === 'tornado') {
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.9)';
      ctx.lineWidth = 1.2;
      for (let h = 0; h < 40; h += 10) {
        ctx.beginPath();
        ctx.ellipse(x, y - h, 4 + h * 0.18, 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (tool.id === 'tsunami') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      const dir = x < engine.width * 0.5 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x - dir * 16, y);
      ctx.lineTo(x + dir * 10, y);
      ctx.lineTo(x + dir * 4, y - 6);
      ctx.moveTo(x + dir * 10, y);
      ctx.lineTo(x + dir * 4, y + 6);
      ctx.stroke();
    } else if (tool.id === 'firework') {
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎆', x, y + 4);
    }
    ctx.restore();
  }

  // Main Simulation Loop
  let acc = 0;
  let lastTime = performance.now();
  let fpsCounter = 0;
  let fpsLast = lastTime;
  let fpsDisplay = 60;

  function loop(now) {
    const dt = Math.min(50, now - lastTime);
    lastTime = now;

    if (!paused) {
      acc += (dt / 16.6667) * speedMul;
      const maxSteps = speedMul > 1 ? 4 : 2;
      let steps = 0;
      while (acc >= 1 && steps < maxSteps) {
        if (gestureMode === 'minigun' && aimCurrent) {
          minigunTick++;
          if (minigunTick % 2 === 0) {
            const ang = (engine.tick * 0.08) % (Math.PI * 2);
            const ox = aimCurrent.gx + Math.cos(ang) * 42;
            const oy = Math.max(4, aimCurrent.gy - 35 + Math.sin(ang) * 14);
            engine.fireBullet(ox, oy, aimCurrent.gx, aimCurrent.gy);
          }
        }
        if (gestureMode === 'flamethrower' && lastGridPt) {
          engine.sprayFlamethrower(lastGridPt.gx, lastGridPt.gy, flameDir.x, flameDir.y);
        }
        engine.step();
        acc -= 1;
        steps++;
      }
      if (acc > 2) acc = 0;
    } else {
      engine.renderPixels();
    }

    renderFrame();

    fpsCounter++;
    if (now - fpsLast >= 500) {
      fpsDisplay = Math.round((fpsCounter * 1000) / (now - fpsLast));
      fpsCounter = 0;
      fpsLast = now;
      statsPill.textContent = `${engine.mobs.length} mobs · ${fpsDisplay} fps`;
    }

    requestAnimationFrame(loop);
  }

  // Boot
  window.addEventListener('resize', resizeDisplay);
  resizeDisplay();
  populateScenes();
  renderPalette();
  SCENES[0].build();
  showToast('SandForge V3 — New fighters, visible tools, and a graphics glow-up!');
  window.SandForgeApp = {
    get engine() { return engine; },
    get currentTool() { return currentTool; },
    get currentCat() { return currentCat; },
  };
  requestAnimationFrame(loop);
})();
