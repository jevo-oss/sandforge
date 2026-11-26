(function (root) {
  'use strict';

  const EL = {
    EMPTY: 0,
    SAND: 1,
    SALT: 2,
    GUNPOWDER: 3,
    SEED: 4,
    SNOW: 5,
    ASH: 6,
    WATER: 7,
    SALTWATER: 8,
    OIL: 9,
    LAVA: 10,
    ACID: 11,
    STONE: 12,
    WOOD: 13,
    METAL: 14,
    ICE: 15,
    GLASS: 16,
    PLANT: 17,
    TNT: 18,
    FIRE: 19,
    SMOKE: 20,
    STEAM: 21,
    SPARK: 22,
    EMBER: 23,
    ACID_GAS: 24,
  };

  const EL_META = {
    [EL.EMPTY]:     { name: 'Empty',     cat: 'hidden',  color: '#0d111a', density: 0,   state: 'empty' },
    [EL.SAND]:      { name: 'Sand',      cat: 'solids',  color: '#e6c278', density: 55,  state: 'powder', desc: 'Falls in piles, melts into Glass near lava' },
    [EL.SALT]:      { name: 'Salt',      cat: 'solids',  color: '#f3efe8', density: 54,  state: 'powder', desc: 'Dissolves in water into saltwater' },
    [EL.GUNPOWDER]: { name: 'Gunpowder', cat: 'solids',  color: '#4c515c', density: 52,  state: 'powder', desc: 'Chain-reacts & explodes from fire or sparks' },
    [EL.SEED]:      { name: 'Seed',      cat: 'solids',  color: '#9e844a', density: 50,  state: 'powder', desc: 'Sprouts into plants when watered' },
    [EL.SNOW]:      { name: 'Snow',      cat: 'solids',  color: '#eef6ff', density: 42,  state: 'powder', desc: 'Drifts gently, melts into water' },
    [EL.ASH]:       { name: 'Ash',       cat: 'hidden',  color: '#737882', density: 38,  state: 'powder', desc: 'Burnt residue; washes away in water' },
    [EL.WATER]:     { name: 'Water',     cat: 'liquids', color: '#2b8cff', density: 25,  state: 'liquid', desc: 'Extinguishes fire, cools lava, waters plants' },
    [EL.SALTWATER]: { name: 'Saltwater', cat: 'hidden',  color: '#34b5d9', density: 28,  state: 'liquid', desc: 'Conducts sparks, leaves salt when boiled' },
    [EL.OIL]:       { name: 'Oil',       cat: 'liquids', color: '#8f5922', density: 15,  state: 'liquid', desc: 'Floats on water and burns fiercely' },
    [EL.LAVA]:      { name: 'Lava',      cat: 'liquids', color: '#ff5114', density: 40,  state: 'liquid', desc: 'Melts sand & ice, turns to stone in water' },
    [EL.ACID]:      { name: 'Acid',      cat: 'liquids', color: '#6eff3b', density: 27,  state: 'liquid', desc: 'Dissolves most solids (not Glass!)' },
    [EL.STONE]:     { name: 'Stone',     cat: 'solids',  color: '#7e8490', density: 100, state: 'solid',  desc: 'Sturdy rock barrier' },
    [EL.WOOD]:      { name: 'Wood',      cat: 'solids',  color: '#8c5a32', density: 100, state: 'solid',  desc: 'Flammable timber that burns to embers & ash' },
    [EL.METAL]:     { name: 'Metal',     cat: 'solids',  color: '#9aa8b8', density: 100, state: 'solid',  desc: 'Blast-resistant & conducts electricity' },
    [EL.ICE]:       { name: 'Ice',       cat: 'solids',  color: '#96e4ff', density: 100, state: 'solid',  desc: 'Melts near heat, chills nearby water' },
    [EL.GLASS]:     { name: 'Glass',     cat: 'solids',  color: '#b8e2f8', density: 100, state: 'solid',  desc: 'Acid-proof, shatters in blasts & bullets' },
    [EL.PLANT]:     { name: 'Plant',     cat: 'solids',  color: '#38b856', density: 100, state: 'solid',  desc: 'Grows with water, burns easily' },
    [EL.TNT]:       { name: 'TNT',       cat: 'solids',  color: '#e6392f', density: 100, state: 'solid',  desc: 'Detonates with a shockwave that flings mobs' },
    [EL.FIRE]:      { name: 'Fire',      cat: 'energy',  color: '#ff961c', density: 1,   state: 'gas',    desc: 'Burns flammables & fades out' },
    [EL.SMOKE]:     { name: 'Smoke',     cat: 'energy',  color: '#6b707d', density: 1,   state: 'gas',    desc: 'Rises, swirls, and dissipates' },
    [EL.STEAM]:     { name: 'Steam',     cat: 'energy',  color: '#cfe8ff', density: 1,   state: 'gas',    desc: 'Condenses back to water or dissipates' },
    [EL.SPARK]:     { name: 'Spark',     cat: 'energy',  color: '#5ef2ff', density: 1,   state: 'gas',    desc: 'Travels through metal & ignites fuel' },
    [EL.EMBER]:     { name: 'Ember',     cat: 'hidden',  color: '#ff6d1f', density: 2,   state: 'gas',    desc: 'Hot drifting coal that fades away' },
    [EL.ACID_GAS]:  { name: 'Acid Vapor',cat: 'hidden',  color: '#88ff5e', density: 1,   state: 'gas',    desc: 'Fizzing acid fume that dissipates' },
  };

  function isSolid(t) { return t >= EL.STONE && t <= EL.TNT; }
  function isPowder(t) { return t >= EL.SAND && t <= EL.ASH; }
  function isLiquid(t) { return t >= EL.WATER && t <= EL.ACID; }
  function isTransient(t) { return t >= EL.FIRE && t <= EL.ACID_GAS; }
  function isBlocking(t) { return (t >= EL.SAND && t <= EL.ASH) || (t >= EL.STONE && t <= EL.TNT); }

  function packColor(r, g, b, a = 255) {
    return ((a & 255) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255);
  }

  const BG_R = 13, BG_G = 17, BG_B = 26;
  const BG_COLOR = packColor(BG_R, BG_G, BG_B, 255);

  class SandEngine {
    constructor(width = 360, height = 240) {
      this.width = width;
      this.height = height;
      this.size = width * height;
      this.type = new Uint8Array(this.size);
      this.life = new Uint16Array(this.size);
      this.variant = new Uint8Array(this.size);
      this.updated = new Uint8Array(this.size);
      this.pixels = new Uint32Array(this.size);
      this.pixels.fill(BG_COLOR);

      this.tick = 0;
      this.stamp = 1;
      this.rngState = 0x9e3779b9;

      this.particles = [];
      this.bombs = [];
      this.fireworks = [];
      this.bullets = [];
      this.rockets = [];
      this.tornadoes = [];
      this.tsunamis = [];
      this.mobs = [];
      this.flashes = [];
      this.meteors = [];
      this.lightnings = [];
      this.blackHoles = [];
      this.nukes = [];
      this.quakeLife = 0;
      this.shake = 0;
      this.shakeX = 0;
      this.shakeY = 0;
      this.glows = [];
      this.fluidDens = new Uint16Array(this.size);
      this.fluidKind = new Uint8Array(this.size);
      this.fluidTmp = new Uint16Array(this.size);
      this.fluidPixels = new Uint32Array(this.size);
      this.gasCount = 0;
      this.gasX = new Int16Array(900);
      this.gasY = new Int16Array(900);
      this.gasT = new Uint8Array(900);
      this.gasL = new Uint8Array(900);
      this.gfxQuality = 2;

      this.hiScale = 2;
      this.hiW = this.width * 2;
      this.hiH = this.height * 2;
      this.hiSize = this.hiW * this.hiH;
      this.hiSolid = new Uint32Array(this.hiSize);
      this.hiFluid = new Uint32Array(this.hiSize);
      this.occ = new Uint8Array(this.size);
      this.lightR = new Uint16Array(this.size);
      this.lightG = new Uint16Array(this.size);
      this.lightB = new Uint16Array(this.size);
      this.hiReady = false;

      this.nextMobId = 1;
      this.grabbed = null;
      this.maxParticles = 2400;
    }

    rand() {
      let x = this.rngState;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      this.rngState = x >>> 0;
      return (this.rngState & 0xfffffff) / 0x10000000;
    }

    randInt(n) { return (this.rand() * n) | 0; }

    clear() {
      this.type.fill(EL.EMPTY);
      this.life.fill(0);
      this.variant.fill(0);
      this.updated.fill(0);
      this.pixels.fill(BG_COLOR);
      this.particles.length = 0;
      this.bombs.length = 0;
      this.fireworks.length = 0;
      this.bullets.length = 0;
      this.rockets.length = 0;
      this.tornadoes.length = 0;
      this.tsunamis.length = 0;
      this.mobs.length = 0;
      this.flashes.length = 0;
      this.meteors.length = 0;
      this.lightnings.length = 0;
      this.blackHoles.length = 0;
      this.nukes.length = 0;
      this.quakeLife = 0;
      this.shake = 0;
      this.shakeX = 0;
      this.shakeY = 0;
      this.glows.length = 0;
      this.fluidDens.fill(0);
      this.fluidKind.fill(0);
      this.fluidPixels.fill(0);
      this.gasCount = 0;
      this.grabbed = null;
      this.hiReady = false;
      if (this.hiSolid) this.hiSolid.fill(0);
      if (this.hiFluid) this.hiFluid.fill(0);
    }

    inBounds(x, y) { return x >= 0 && x < this.width && y >= 0 && y < this.height; }

    defaultLife(t) {
      switch (t) {
        case EL.WOOD: return 180;
        case EL.PLANT: return 70;
        case EL.ACID: return 95;
        case EL.FIRE: return 18 + this.randInt(24);
        case EL.SMOKE: return 50 + this.randInt(45);
        case EL.STEAM: return 60 + this.randInt(50);
        case EL.SPARK: return 10 + this.randInt(12);
        case EL.EMBER: return 32 + this.randInt(34);
        case EL.ACID_GAS: return 20 + this.randInt(20);
        case EL.ASH: return 450 + this.randInt(250);
        default: return 0;
      }
    }

    setCell(x, y, t, customLife = -1) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
      const i = y * this.width + x;
      this.type[i] = t;
      this.life[i] = customLife >= 0 ? customLife : this.defaultLife(t);
      this.variant[i] = this.randInt(256);
      this.updated[i] = this.stamp;
    }

    swapCells(i1, i2) {
      const t = this.type[i1], l = this.life[i1], v = this.variant[i1];
      this.type[i1] = this.type[i2];
      this.life[i1] = this.life[i2];
      this.variant[i1] = this.variant[i2];
      this.type[i2] = t;
      this.life[i2] = l;
      this.variant[i2] = v;
      this.updated[i1] = this.stamp;
      this.updated[i2] = this.stamp;
    }

    paintBrush(cx, cy, radius, elementType, overwrite = false) {
      const r = Math.max(0, radius | 0);
      const r2 = r * r;
      const isLiquidOrPowder = isLiquid(elementType) || isPowder(elementType);

      for (let dy = -r; dy <= r; dy++) {
        const y = (cy + dy) | 0;
        if (y < 0 || y >= this.height) continue;
        for (let dx = -r; dx <= r; dx++) {
          const x = (cx + dx) | 0;
          if (x < 0 || x >= this.width) continue;
          if (dx * dx + dy * dy > r2) continue;
          if (r > 2 && isLiquidOrPowder && elementType !== EL.WATER && this.rand() < 0.25) continue;
          if (isTransient(elementType) && r > 1 && this.rand() < 0.35) continue;

          const i = y * this.width + x;
          const cur = this.type[i];

          if (elementType === EL.EMPTY) {
            this.type[i] = EL.EMPTY;
            this.life[i] = 0;
            continue;
          }

          if (overwrite || cur === EL.EMPTY || isTransient(cur) || (isSolid(elementType) && !isSolid(cur)) || (isLiquid(cur) && isPowder(elementType))) {
            this.setCell(x, y, elementType);
          }
        }
      }

      if (elementType === EL.EMPTY) {
        const er = Math.max(4, r + 2);
        const er2 = er * er;
        for (let m = this.mobs.length - 1; m >= 0; m--) {
          const mob = this.mobs[m];
          const dx = mob.x - cx, dy = (mob.y - 6) - cy;
          if (dx * dx + dy * dy <= er2) {
            this.spawnSplat(mob.x, mob.y - 6, '#9fb0c8', 8);
            mob.dead = true;
            this.mobs.splice(m, 1);
          }
        }
        for (let b = this.bombs.length - 1; b >= 0; b--) {
          const bomb = this.bombs[b];
          const dx = bomb.x - cx, dy = bomb.y - cy;
          if (dx * dx + dy * dy <= er2) this.bombs.splice(b, 1);
        }
      }
    }

    paintLine(x0, y0, x1, y1, radius, elementType, overwrite = false) {
      const dx = x1 - x0, dy = y1 - y0;
      const dist = Math.hypot(dx, dy);
      const step = Math.max(1, Math.min(radius * 0.45, 3));
      const steps = Math.max(1, Math.ceil(dist / step));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        this.paintBrush(Math.round(x0 + dx * t), Math.round(y0 + dy * t), radius, elementType, overwrite);
      }
    }

    spawnParticle(p) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      this.particles.push(p);
    }

    spawnSplat(x, y, color, count = 12, speed = 2.6) {
      for (let i = 0; i < count; i++) {
        const ang = this.rand() * Math.PI * 2;
        const spd = (0.3 + this.rand() * 0.9) * speed;
        this.spawnParticle({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.0,
          gravity: 0.12,
          life: 18 + this.randInt(20),
          maxLife: 38,
          color,
          size: 1 + (this.rand() < 0.35 ? 1 : 0),
          redeposit: false,
        });
      }
    }

    spawnBomb(x, y, vx = 0, vy = 0, scale = 1) {
      if (this.bombs.length > 40) this.bombs.shift();
      const sc = Math.max(0.35, scale);
      this.bombs.push({
        x, y, vx, vy,
        radius: 4 * sc,
        blastRadius: 17 * sc,
        blastPower: 13 * sc,
        scale: sc,
        fuse: 115, grabbed: false, angle: 0,
      });
    }

    spawnFirework(x, y, scale = 1) {
      if (this.fireworks.length > 30) this.fireworks.shift();
      const palettes = ['#ff4d6d', '#38bdf8', '#facc15', '#4ade80', '#c084fc', '#fb923c'];
      this.fireworks.push({
        x, y,
        vx: (this.rand() - 0.5) * 0.6,
        vy: -3.2 - this.rand() * 1.1,
        life: 36 + this.randInt(24),
        color: palettes[this.randInt(palettes.length)],
        scale: Math.max(0.35, scale),
      });
    }

    spawnMob(type, x, y, scale = 1) {
      const clampedX = Math.max(6, Math.min(this.width - 7, x));
      const clampedY = Math.max(14, Math.min(this.height - 4, y));
      const hpMap = { walker: 100, jumper: 95, zombie: 130, dummy: 160 };
      const mob = {
        id: this.nextMobId++,
        dead: false,
        huntTarget: null,
        scale: Math.max(0.55, Math.min(2.15, 0.55 + Math.max(0.35, scale) * 0.45)),
        type,
        x: clampedX,
        y: clampedY,
        vx: (this.rand() - 0.5) * 0.6,
        vy: 0,
        angle: 0,
        angVel: 0,
        facing: this.rand() < 0.5 ? 1 : -1,
        hp: hpMap[type] || 100,
        maxHp: hpMap[type] || 100,
        state: 'walk',
        ragdollTimer: 0,
        burnTimer: 0,
        drownTimer: 0,
        acidTimer: 0,
        shockTimer: 0,
        hurtFlash: 0,
        walkPhase: this.rand() * Math.PI * 2,
        aiTimer: 20 + this.randInt(40),
        jumpCooldown: 10 + this.randInt(30),
        attackCooldown: 8 + this.randInt(16),
        attackTimer: 0,
        attackStyle: '',
        combatTimer: 0,
        lastHitBy: '',
        onGround: false,
        inWater: false,
        dying: 0,
        biteChain: 0,
      };
      this.mobs.push(mob);
      return mob;
    }

    fireBullet(originX, originY, targetX, targetY, spreadAmp = 0.14) {
      if (this.bullets.length > 80) this.bullets.shift();
      const dx = targetX - originX, dy = targetY - originY;
      const spread = (this.rand() - 0.5) * Math.max(0.02, spreadAmp);
      const ang = Math.atan2(dy, dx) + spread;
      const speed = 7.5;
      this.bullets.push({
        x: originX, y: originY,
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
        life: 65,
      });
      this.spawnParticle({
        x: originX, y: originY,
        vx: -Math.cos(ang) * 0.7 + (this.rand() - 0.5) * 0.8,
        vy: -1.4 - this.rand() * 0.8,
        gravity: 0.14, life: 24, maxLife: 24, color: '#f5c542', size: 1.4, redeposit: false,
      });
      this.spawnParticle({
        x: originX + Math.cos(ang) * 2, y: originY + Math.sin(ang) * 2,
        vx: Math.cos(ang) * 1.2, vy: Math.sin(ang) * 1.2,
        gravity: 0, life: 5, maxLife: 5, color: '#fff3a8', size: 3, redeposit: false,
      });
    }

    fireRocket(originX, originY, targetX, targetY, scale = 1) {
      if (this.rockets.length > 16) this.rockets.shift();
      const sc = Math.max(0.35, scale);
      const ang = Math.atan2(targetY - originY, targetX - originX);
      const speed = 3.8;
      this.rockets.push({
        x: originX, y: originY,
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
        angle: ang, life: 160,
        blastRadius: 21 * sc,
        blastPower: 16 * sc,
        scale: sc,
      });
    }

    spawnTornado(x, y, life = 150, scale = 1) {
      if (this.tornadoes.length > 5) this.tornadoes.shift();
      const sc = Math.max(0.35, scale);
      const t = {
        x, y, vx: (this.rand() - 0.5) * 0.6, life, maxLife: life,
        phase: this.rand() * Math.PI * 2, controlled: false,
        scale: sc, halfW: 10 * sc, pullR: 62 * sc,
      };
      this.tornadoes.push(t);
      return t;
    }

    spawnTsunami(fromLeft = true, scale = 1) {
      if (this.tsunamis.length > 3) this.tsunamis.shift();
      const sc = Math.max(0.35, scale);
      const height = Math.max(16, Math.min(this.height - 6, Math.floor(this.height * 0.48 * sc)));
      this.tsunamis.push({
        x: fromLeft ? -10 : this.width + 10,
        dir: fromLeft ? 1 : -1,
        speed: 2.8,
        waveWidth: 26 * sc,
        waveHeight: height,
        scale: sc,
        life: Math.ceil((this.width + 40) / 2.8),
      });
    }

    addShake(amount) {
      this.shake = Math.min(28, this.shake + amount);
    }

    decayShake() {
      if (this.shake > 0.08) {
        this.shakeX = (this.rand() - 0.5) * this.shake;
        this.shakeY = (this.rand() - 0.5) * this.shake;
        this.shake *= 0.84;
      } else {
        this.shake = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }

    spawnMeteor(targetX, targetY, scale = 1) {
      if (this.meteors.length > 8) this.meteors.shift();
      const sc = Math.max(0.35, scale);
      const tx = Math.max(6, Math.min(this.width - 7, targetX));
      const ty = Math.max(8, Math.min(this.height - 4, targetY));
      const startX = tx + (this.rand() - 0.5) * 28;
      this.meteors.push({
        x: startX,
        y: -10,
        vx: (tx - startX) * 0.045,
        vy: 3.4 + this.rand() * 0.8,
        tx, ty,
        radius: 5 * sc,
        blastRadius: 16 * sc,
        blastPower: 13 * sc,
        scale: sc,
        life: 220,
      });
    }

    spawnLightning(targetX, targetY, scale = 1) {
      if (this.lightnings.length > 6) this.lightnings.shift();
      const tx = Math.max(2, Math.min(this.width - 3, targetX));
      const ty = Math.max(4, Math.min(this.height - 3, targetY));
      const sx = tx + (this.rand() - 0.5) * 18;
      const pts = this._jaggedBolt(sx, 0, tx, ty, 9);
      const forks = [];
      if (pts.length > 4 && this.rand() < 0.7) {
        const mid = pts[2 + this.randInt(Math.max(1, pts.length - 4))];
        forks.push(this._jaggedBolt(mid.x, mid.y, mid.x + (this.rand() - 0.5) * 40, Math.min(this.height - 2, mid.y + 18 + this.rand() * 28), 6));
      }
      const sc = Math.max(0.35, scale);
      this.lightnings.push({ pts, forks, life: 12, maxLife: 12, tx, ty, scale: sc, width: Math.max(1, Math.round(1.2 * sc)) });
      this._applyLightningEffects(pts, forks, tx, ty, sc);
      this.addShake(3.5);
      this.flashes.push({ x: tx, y: ty, radius: 2, maxRadius: 16, life: 7, maxLife: 7 });
    }

    _jaggedBolt(x0, y0, x1, y1, jag) {
      const pts = [{ x: x0, y: y0 }];
      const dist = Math.hypot(x1 - x0, y1 - y0) || 1;
      const n = Math.max(4, Math.min(18, (dist / 10) | 0));
      for (let i = 1; i < n; i++) {
        const t = i / n;
        pts.push({
          x: x0 + (x1 - x0) * t + (this.rand() - 0.5) * jag,
          y: y0 + (y1 - y0) * t + (this.rand() - 0.5) * jag * 0.35,
        });
      }
      pts.push({ x: x1, y: y1 });
      return pts;
    }

    _applyLightningEffects(pts, forks, tx, ty, scale = 1) {
      const W = this.width, H = this.height, type = this.type, life = this.life;
      const hit = new Set();
      const w = Math.max(1, Math.round(1.2 * Math.max(0.35, scale)));
      const stamp = (seg) => {
        for (let i = 1; i < seg.length; i++) {
          const ax = seg[i - 1].x, ay = seg[i - 1].y, bx = seg[i].x, by = seg[i].y;
          const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
          for (let s = 0; s <= steps; s++) {
            const x = (ax + (bx - ax) * (s / steps)) | 0;
            const y = (ay + (by - ay) * (s / steps)) | 0;
            for (let dy = -w; dy <= w; dy++) {
              for (let dx = -w; dx <= w; dx++) {
                const gx = x + dx, gy = y + dy;
                if (gx < 0 || gx >= W || gy < 0 || gy >= H) continue;
                const key = gy * W + gx;
                if (hit.has(key)) continue;
                hit.add(key);
                const nt = type[key];
                if (nt === EL.WOOD && life[key] >= 175) life[key] = 174;
                else if (nt === EL.PLANT && life[key] >= 68) life[key] = 67;
                else if (nt === EL.OIL || nt === EL.SEED) { type[key] = EL.FIRE; life[key] = 28 + this.randInt(16); }
                else if (nt === EL.GUNPOWDER) { type[key] = EL.EMPTY; this.explode(gx, gy, 5, 4); }
                else if (nt === EL.TNT) { type[key] = EL.EMPTY; this.explode(gx, gy, 18, 14); }
                else if (nt === EL.METAL) life[key] = 14;
                else if (nt === EL.WATER || nt === EL.SALTWATER) {
                  if (gy > 0 && type[(gy - 1) * W + gx] === EL.EMPTY && this.rand() < 0.45) {
                    this.setCell(gx, gy - 1, EL.SPARK, 10);
                  } else if (this.rand() < 0.2) {
                    this.setCell(gx, gy, EL.STEAM, 36);
                  }
                } else if (nt === EL.EMPTY && this.rand() < 0.08) {
                  this.setCell(gx, gy, EL.SPARK, 8);
                }
              }
            }
          }
        }
      };
      stamp(pts);
      for (const f of forks) stamp(f);

      for (const mob of this.mobs) {
        const zapR = 18 * Math.max(0.35, scale);
        let minD2 = zapR * zapR;
        const all = pts.concat(...forks);
        for (const p of all) {
          const d2 = (p.x - mob.x) ** 2 + (p.y - (mob.y - 6)) ** 2;
          if (d2 < minD2) minD2 = d2;
        }
        const bodyWet = this.inBounds(mob.x | 0, (mob.y - 6) | 0) && isLiquid(type[((mob.y - 6) | 0) * W + (mob.x | 0)]);
        if (minD2 < zapR * zapR || bodyWet && minD2 < (zapR * 2) * (zapR * 2)) {
          const dmg = bodyWet ? 55 : 38;
          mob.hp -= dmg;
          mob.shockTimer = 22;
          mob.hurtFlash = 8;
          mob.state = 'ragdoll';
          mob.ragdollTimer = Math.max(mob.ragdollTimer, 30);
          mob.vx += (this.rand() - 0.5) * 3.2;
          mob.vy -= 1.8;
          this.spawnSplat(mob.x, mob.y - 6, '#67e8f9', 6, 1.8);
        }
      }
    }

    spawnBlackHole(x, y, life = 95, scale = 1) {
      if (this.blackHoles.length > 2) this.blackHoles.shift();
      const sc = Math.max(0.35, scale);
      const bh = {
        x: Math.max(8, Math.min(this.width - 9, x)),
        y: Math.max(8, Math.min(this.height - 9, y)),
        life,
        maxLife: life,
        radius: 6 * sc,
        baseRadius: 6 * sc,
        maxRadius: 28 * sc,
        scale: sc,
        phase: this.rand() * Math.PI * 2,
        controlled: false,
      };
      this.blackHoles.push(bh);
      return bh;
    }

    spawnNuke(x, y, scale = 1) {
      if (this.nukes.length > 1) this.nukes.shift();
      const sc = Math.max(0.35, scale);
      const cx = Math.max(8, Math.min(this.width - 9, x));
      const cy = Math.max(8, Math.min(this.height - 9, y));
      this.nukeBlast(cx, cy, sc);
      this.nukes.push({
        x: cx, y: cy,
        life: 90,
        maxLife: 90,
        stemH: Math.min(cy - 8, 62 * sc),
        capR: 26 * sc,
        scale: sc,
      });
    }

    nukeBlast(cx, cy, scale = 1) {
      const W = this.width, H = this.height;
      const r = Math.max(8, Math.round(34 * Math.max(0.35, scale))), r2 = r * r, innerR2 = (r * 0.42) * (r * 0.42);
      this.addShake(18);
      this.flashes.push({ x: cx, y: cy, radius: 4, maxRadius: r * 2.1, life: 16, maxLife: 16 });
      this.flashes.push({ x: cx, y: cy, radius: 2, maxRadius: r * 3.2, life: 22, maxLife: 22 });

      let fireLeft = 90, smokeLeft = 260, debrisLeft = 36;
      for (let dy = -r; dy <= r; dy++) {
        const y = (cy + dy) | 0;
        if (y < 1 || y >= H - 1) continue;
        for (let dx = -r; dx <= r; dx++) {
          const x = (cx + dx) | 0;
          if (x < 1 || x >= W - 1) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;
          const i = y * W + x;
          const t = this.type[i];
          if (t === EL.METAL && d2 > innerR2 * 0.5) continue;
          if (t === EL.STONE && d2 > innerR2 && this.rand() < 0.55) continue;

          if (t !== EL.EMPTY && !isTransient(t)) {
            if (debrisLeft > 0 && (isPowder(t) || isLiquid(t) || t === EL.STONE || t === EL.WOOD) && this.rand() < 0.08) {
              const dist = Math.sqrt(d2) || 1;
              const spd = (1 - dist / (r + 1)) * 6 + this.rand() * 2;
              const flingType = t === EL.STONE ? EL.SAND : (t === EL.WOOD ? EL.EMBER : t);
              this.spawnParticle({
                x, y,
                vx: (dx / dist) * spd + (this.rand() - 0.5),
                vy: (dy / dist) * spd - 2.2,
                gravity: 0.14, life: 70, maxLife: 70, elType: flingType,
                color: EL_META[flingType].color, size: 1.5, redeposit: flingType !== EL.EMBER,
              });
              debrisLeft--;
            }
            this.type[i] = EL.EMPTY;
            this.life[i] = 0;
          }

          if (d2 < innerR2 && fireLeft > 0 && this.rand() < 0.28) {
            this.setCell(x, y, EL.FIRE, 14 + this.randInt(16));
            fireLeft--;
          } else if (d2 >= innerR2 && smokeLeft > 0 && this.rand() < 0.16) {
            this.setCell(x, y, EL.SMOKE, 50 + this.randInt(40));
            smokeLeft--;
          }
        }
      }

      // Mushroom stem + cap of dissipating smoke (capped count for iPhone fps)
      const stemH = Math.min(cy - 6, 62);
      let mush = 140;
      for (let k = 0; k < 90 && mush > 0; k++) {
        const yy = (cy - this.rand() * stemH) | 0;
        const xx = (cx + (this.rand() - 0.5) * 8) | 0;
        if (this.inBounds(xx, yy) && (this.type[yy * W + xx] === EL.EMPTY || isTransient(this.type[yy * W + xx]))) {
          this.setCell(xx, yy, EL.SMOKE, 55 + this.randInt(50));
          mush--;
        }
      }
      const capY = Math.max(4, cy - stemH);
      for (let k = 0; k < 120 && mush > 0; k++) {
        const ang = this.rand() * Math.PI * 2;
        const rad = this.rand() * Math.max(8, r * 0.76);
        const xx = (cx + Math.cos(ang) * rad) | 0;
        const yy = (capY + Math.sin(ang) * rad * 0.45) | 0;
        if (this.inBounds(xx, yy) && (this.type[yy * W + xx] === EL.EMPTY || isTransient(this.type[yy * W + xx]))) {
          this.setCell(xx, yy, this.rand() < 0.12 ? EL.FIRE : EL.SMOKE, 48 + this.randInt(50));
          mush--;
        }
      }

      const sparkCount = 28;
      for (let s = 0; s < sparkCount; s++) {
        const ang = this.rand() * Math.PI * 2, spd = 2 + this.rand() * 5;
        this.spawnParticle({
          x: cx, y: cy,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 2,
          gravity: 0.08, life: 22 + this.randInt(18), maxLife: 40,
          color: this.rand() < 0.5 ? '#ffe066' : '#ff7b2b', size: 1.8, redeposit: false,
        });
      }

      const pushR = Math.min(W, r * 3.4), pushR2 = pushR * pushR;
      for (const mob of this.mobs) {
        const dx = mob.x - cx, dy = (mob.y - 6) - cy, d2 = dx * dx + dy * dy;
        if (d2 < pushR2) {
          const dist = Math.sqrt(d2) || 1, falloff = 1 - dist / pushR;
          mob.vx += (dx / dist) * falloff * 14;
          mob.vy += (dy / dist) * falloff * 10 - falloff * 6;
          mob.state = 'ragdoll';
          mob.ragdollTimer = Math.max(mob.ragdollTimer, 80);
          mob.angVel += (dx >= 0 ? 1 : -1) * falloff * 0.6;
          mob.hurtFlash = 12;
          mob.hp -= falloff * 85;
          if (falloff > 0.35) mob.burnTimer = Math.max(mob.burnTimer, 90);
        }
      }
      for (const bomb of this.bombs) {
        if (bomb.grabbed) continue;
        const dx = bomb.x - cx, dy = bomb.y - cy, d2 = dx * dx + dy * dy;
        if (d2 < pushR2 && d2 > 1) {
          const dist = Math.sqrt(d2), falloff = 1 - dist / pushR;
          bomb.vx += (dx / dist) * falloff * 10;
          bomb.vy += (dy / dist) * falloff * 10 - 3;
          bomb.fuse = Math.min(bomb.fuse, 6);
        }
      }
    }

    spawnEarthquake(duration = 58, scale = 1) {
      const sc = Math.max(0.35, scale);
      this.quakeLife = Math.max(this.quakeLife, Math.round(duration * sc));
      this.addShake(14 * sc);
      for (let k = 0; k < 28; k++) {
        this.spawnParticle({
          x: this.rand() * this.width,
          y: this.height * (0.45 + this.rand() * 0.5),
          vx: (this.rand() - 0.5) * 2.2,
          vy: -0.6 - this.rand() * 1.4,
          gravity: 0.12, life: 22 + this.randInt(16), maxLife: 38,
          color: this.rand() < 0.5 ? '#cbd5e1' : '#94a3b8', size: 2.2, redeposit: false,
        });
      }
      for (const mob of this.mobs) {
        if (mob.state === 'grabbed') continue;
        mob.state = 'ragdoll';
        mob.ragdollTimer = Math.max(mob.ragdollTimer, 40);
        mob.vx += (this.rand() - 0.5) * 3.4;
        mob.vy -= 1.2 + this.rand() * 1.6;
        mob.angVel += (this.rand() - 0.5) * 0.5;
        mob.hurtFlash = 6;
      }
    }

    sprayFlamethrower(x, y, dirX, dirY, scale = 1) {
      let ang = Math.atan2(dirY, dirX);
      if (!isFinite(ang) || (dirX * dirX + dirY * dirY) < 0.16) ang = -Math.PI / 2;
      const W = this.width, H = this.height;
      const sc = Math.max(0.35, scale);
      const shots = Math.max(4, Math.round(9 * sc));
      const cone = 0.55 * Math.sqrt(sc);
      const reach = 12 * sc;
      for (let i = 0; i < shots; i++) {
        const a = ang + (this.rand() - 0.5) * cone;
        const d = 2 + this.rand() * reach;
        const px = (x + Math.cos(a) * d) | 0;
        const py = (y + Math.sin(a) * d) | 0;
        if (px < 0 || px >= W || py < 0 || py >= H) continue;
        const iCell = py * W + px;
        const cur = this.type[iCell];
        if (cur === EL.EMPTY || isTransient(cur) || cur === EL.OIL || cur === EL.PLANT || cur === EL.SEED) {
          this.setCell(px, py, this.rand() < 0.18 ? EL.EMBER : EL.FIRE, 12 + this.randInt(16));
        } else if (cur === EL.WOOD && this.life[iCell] >= 175 && this.rand() < 0.4) {
          this.life[iCell] = 174;
        } else if (cur === EL.GUNPOWDER) {
          this.type[iCell] = EL.EMPTY;
          this.explode(px, py, 5, 4);
        } else if (cur === EL.TNT && this.rand() < 0.25) {
          this.type[iCell] = EL.EMPTY;
          this.explode(px, py, 18, 14);
        } else if (cur === EL.WATER || cur === EL.SALTWATER) {
          if (this.rand() < 0.35) {
            this.type[iCell] = EL.STEAM;
            this.life[iCell] = 40;
          }
        }
        if (this.rand() < 0.4) {
          this.spawnParticle({
            x: px, y: py,
            vx: Math.cos(a) * (1.2 + this.rand() * 1.6),
            vy: Math.sin(a) * (1.2 + this.rand() * 1.6) - 0.3,
            gravity: -0.02, life: 12 + this.randInt(10), maxLife: 22,
            color: this.rand() < 0.5 ? '#ff961c' : '#ff6d1f', size: 1.6, redeposit: false,
          });
        }
      }
    }

    startGrab(gx, gy, radius = 16) {
      let bestMob = null, bestD2 = radius * radius;
      for (const mob of this.mobs) {
        const d2 = (mob.x - gx) ** 2 + ((mob.y - 6) - gy) ** 2;
        if (d2 < bestD2) { bestD2 = d2; bestMob = mob; }
      }
      if (bestMob) {
        bestMob.state = 'grabbed';
        bestMob.vx = 0; bestMob.vy = 0;
        this.grabbed = { kind: 'mob', ref: bestMob, ox: bestMob.x - gx, oy: bestMob.y - gy, lastX: gx, lastY: gy, tvx: 0, tvy: 0 };
        return true;
      }

      let bestBomb = null, bestB2 = radius * radius;
      for (const bomb of this.bombs) {
        const d2 = (bomb.x - gx) ** 2 + (bomb.y - gy) ** 2;
        if (d2 < bestB2) { bestB2 = d2; bestBomb = bomb; }
      }
      if (bestBomb) {
        bestBomb.grabbed = true;
        this.grabbed = { kind: 'bomb', ref: bestBomb, ox: bestBomb.x - gx, oy: bestBomb.y - gy, lastX: gx, lastY: gy, tvx: 0, tvy: 0 };
        return true;
      }
      return false;
    }

    moveGrab(gx, gy) {
      if (!this.grabbed) return;
      const g = this.grabbed;
      const dvx = gx - g.lastX, dvy = gy - g.lastY;
      g.tvx = g.tvx * 0.55 + dvx * 0.45;
      g.tvy = g.tvy * 0.55 + dvy * 0.45;
      g.lastX = gx; g.lastY = gy;

      if (g.kind === 'mob') {
        const m = g.ref;
        m.x = Math.max(4, Math.min(this.width - 5, gx + g.ox));
        m.y = Math.max(10, Math.min(this.height - 3, gy + g.oy));
        m.vx = g.tvx; m.vy = g.tvy;
        m.angVel = Math.max(-0.35, Math.min(0.35, -g.tvx * 0.04));
      } else if (g.kind === 'bomb') {
        const b = g.ref;
        b.x = Math.max(4, Math.min(this.width - 5, gx + g.ox));
        b.y = Math.max(4, Math.min(this.height - 5, gy + g.oy));
        b.vx = g.tvx; b.vy = g.tvy;
      }
    }

    scoopParticles(gx, gy, vx, vy, radius = 14) {
      const r2 = radius * radius, cx = gx | 0, cy = gy | 0;
      const speed = Math.hypot(vx, vy);
      const boostX = Math.max(-5, Math.min(5, vx * 0.75 + (this.rand() - 0.5) * 1.2));
      const boostY = Math.max(-6, Math.min(4, vy * 0.75 - 1.2));
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const y = cy + dy;
        if (y < 0 || y >= this.height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const x = cx + dx;
          if (x < 0 || x >= this.width || dx * dx + dy * dy > r2) continue;
          const i = y * this.width + x, t = this.type[i];
          if ((isPowder(t) || isLiquid(t)) && this.rand() < 0.25 && count < 45) {
            this.type[i] = EL.EMPTY; this.life[i] = 0;
            this.spawnParticle({
              x, y,
              vx: boostX + (this.rand() - 0.5) * (0.8 + speed * 0.2),
              vy: boostY + (this.rand() - 0.5) * 0.8,
              gravity: 0.14, life: 80, maxLife: 80, elType: t, color: EL_META[t].color, size: 1.5, redeposit: true,
            });
            count++;
          }
        }
      }
    }

    endGrab() {
      if (!this.grabbed) return;
      const g = this.grabbed;
      const throwVx = Math.max(-9, Math.min(9, g.tvx * 1.25));
      const throwVy = Math.max(-9, Math.min(9, g.tvy * 1.25));
      if (g.kind === 'mob') {
        const m = g.ref;
        m.vx = throwVx; m.vy = throwVy;
        if (Math.hypot(throwVx, throwVy) > 1.8) {
          m.state = 'ragdoll'; m.ragdollTimer = 45;
          m.angVel = Math.max(-0.4, Math.min(0.4, throwVx * 0.08));
        } else {
          m.state = 'walk';
        }
      } else if (g.kind === 'bomb') {
        const b = g.ref;
        b.grabbed = false; b.vx = throwVx; b.vy = throwVy;
      }
      this.grabbed = null;
    }

    explode(cx, cy, radius = 16, power = 12) {
      const r = radius | 0, r2 = r * r, innerR2 = (r * 0.55) * (r * 0.55);
      this.flashes.push({ x: cx, y: cy, radius: 2, maxRadius: radius * 1.35, life: 10, maxLife: 10 });

      for (let dy = -r; dy <= r; dy++) {
        const y = (cy + dy) | 0;
        if (y < 1 || y >= this.height - 1) continue;
        for (let dx = -r; dx <= r; dx++) {
          const x = (cx + dx) | 0;
          if (x < 1 || x >= this.width - 1) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;

          const i = y * this.width + x, t = this.type[i];
          const dist = Math.sqrt(d2) || 1, nx = dx / dist, ny = dy / dist;

          if (t === EL.TNT && (dx !== 0 || dy !== 0)) {
            this.type[i] = EL.EMPTY; this.life[i] = 0;
            if (this.rand() < 0.14) {
              this.spawnBomb(x, y, nx * 2.5, ny * 2.5 - 1.5);
              this.bombs[this.bombs.length - 1].fuse = 4 + this.randInt(8);
            } else {
              this.setCell(x, y, EL.FIRE, 24);
            }
            continue;
          }

          if (t === EL.METAL && d2 > innerR2 * 0.6) continue;
          if (t === EL.STONE && d2 > innerR2 && this.rand() < 0.72) continue;

          if (t !== EL.EMPTY && !isTransient(t)) {
            if ((isPowder(t) || isLiquid(t) || t === EL.WOOD || t === EL.STONE) && this.rand() < 0.22) {
              const flingType = t === EL.STONE ? EL.SAND : (t === EL.WOOD ? EL.EMBER : t);
              const spd = (1 - dist / (r + 1)) * (power * 0.42) + this.rand() * 2.2;
              this.spawnParticle({
                x, y,
                vx: nx * spd + (this.rand() - 0.5) * 1.4,
                vy: ny * spd - 1.8 - this.rand() * 1.5,
                gravity: 0.14, life: 75, maxLife: 75, elType: flingType,
                color: EL_META[flingType].color, size: 1.5, redeposit: flingType !== EL.EMBER,
              });
            }
            this.type[i] = EL.EMPTY; this.life[i] = 0;
          }

          if (d2 < innerR2) {
            if (this.rand() < 0.55) this.setCell(x, y, EL.FIRE, 12 + this.randInt(18));
            else if (this.rand() < 0.4) this.setCell(x, y, EL.SMOKE, 45 + this.randInt(40));
          } else if (this.rand() < 0.25) {
            this.setCell(x, y, EL.SMOKE, 40 + this.randInt(45));
          }
        }
      }

      const sparkCount = Math.min(36, r * 2);
      for (let s = 0; s < sparkCount; s++) {
        const ang = this.rand() * Math.PI * 2, spd = 1.6 + this.rand() * (power * 0.35);
        this.spawnParticle({
          x: cx, y: cy,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1.2,
          gravity: 0.1, life: 16 + this.randInt(18), maxLife: 34,
          color: this.rand() < 0.5 ? '#ffe066' : '#ff6b2b', size: 1.6, redeposit: false,
        });
      }

      const pushR = r * 2.2, pushR2 = pushR * pushR;
      for (const mob of this.mobs) {
        const dx = mob.x - cx, dy = (mob.y - 6) - cy, d2 = dx * dx + dy * dy;
        if (d2 < pushR2) {
          const dist = Math.sqrt(d2) || 1, falloff = 1 - dist / pushR, impulse = falloff * (power * 0.72);
          mob.vx += (dx / dist) * impulse;
          mob.vy += (dy / dist) * impulse - falloff * 3.5;
          mob.state = 'ragdoll'; mob.ragdollTimer = Math.max(mob.ragdollTimer, 55);
          mob.angVel += (dx >= 0 ? 1 : -1) * falloff * 0.45;
          mob.hurtFlash = 10; mob.hp -= falloff * (power * 6.5);
          if (falloff > 0.45 && this.rand() < 0.65) mob.burnTimer = Math.max(mob.burnTimer, 70);
        }
      }

      for (const bomb of this.bombs) {
        if (bomb.grabbed) continue;
        const dx = bomb.x - cx, dy = bomb.y - cy, d2 = dx * dx + dy * dy;
        if (d2 < pushR2 && d2 > 1) {
          const dist = Math.sqrt(d2), falloff = 1 - dist / pushR;
          bomb.vx += (dx / dist) * falloff * 6;
          bomb.vy += (dy / dist) * falloff * 6 - 2;
          if (d2 < r2) bomb.fuse = Math.min(bomb.fuse, 4);
        }
      }
    }

    step() {
      this.tick++;
      this.stamp = (this.stamp % 254) + 1;
      this.stepGrid();
      this.stepTornadoes();
      this.stepTsunamis();
      this.stepBombs();
      this.stepFireworks();
      this.stepBullets();
      this.stepRockets();
      this.stepMeteors();
      this.stepLightning();
      this.stepBlackHoles();
      this.stepNukes();
      this.stepEarthquake();
      this.stepParticles();
      this.stepMobs();
      this.stepFlashes();
      this.decayShake();
      this.renderPixels();
    }

    stepGrid() {
      const W = this.width, H = this.height;
      const type = this.type, life = this.life, variant = this.variant, updated = this.updated;
      const stamp = this.stamp, flip = (this.tick & 1) === 0;

      for (let y = H - 1; y >= 0; y--) {
        const rowBase = y * W;
        const rowFlip = flip ? (y & 1) === 0 : (y & 1) === 1;

        for (let xi = 0; xi < W; xi++) {
          const x = rowFlip ? xi : (W - 1 - xi);
          const i = rowBase + x;
          if (updated[i] === stamp) continue;

          const t = type[i];
          if (t === EL.EMPTY) continue;

          if (isTransient(t)) {
            if (life[i] <= 1) {
              if (t === EL.FIRE && this.rand() < 0.16) {
                type[i] = EL.SMOKE;
                life[i] = 40 + this.randInt(35);
                variant[i] = this.randInt(256);
                updated[i] = stamp;
              } else {
                type[i] = EL.EMPTY;
                life[i] = 0;
              }
              continue;
            }
            life[i]--;
            this.updateTransient(x, y, i, t);
            continue;
          }

          if (isPowder(t)) { this.updatePowder(x, y, i, t); continue; }
          if (isLiquid(t)) { this.updateLiquid(x, y, i, t); continue; }
          this.updateSolid(x, y, i, t);
        }
      }
    }

    updateTransient(x, y, i, t) {
      const W = this.width, H = this.height, type = this.type, life = this.life, updated = this.updated, stamp = this.stamp;

      if (t === EL.FIRE) {
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            if (nx < 0 || nx >= W) continue;
            const ni = ny * W + nx, nt = type[ni];
            if (nt === EL.WATER || nt === EL.SALTWATER) {
              const wasSalt = nt === EL.SALTWATER;
              type[ni] = (wasSalt && this.rand() < 0.3) ? EL.SALT : EL.STEAM;
              life[ni] = type[ni] === EL.STEAM ? (55 + this.randInt(40)) : 0;
              updated[ni] = stamp;
              type[i] = EL.STEAM; life[i] = 50 + this.randInt(35); updated[i] = stamp;
              return;
            } else if (nt === EL.ICE || nt === EL.SNOW) {
              type[ni] = EL.WATER; life[ni] = 0; updated[ni] = stamp;
              life[i] = Math.min(life[i], 4);
            } else if (nt === EL.TNT) {
              type[ni] = EL.EMPTY; this.explode(nx, ny, 18, 14); return;
            } else if (nt === EL.GUNPOWDER) {
              type[ni] = EL.EMPTY; this.explode(nx, ny, 5, 4); return;
            } else if (nt === EL.OIL && this.rand() < 0.45) {
              type[ni] = EL.FIRE; life[ni] = 30 + this.randInt(25); updated[ni] = stamp;
            } else if (nt === EL.WOOD && this.rand() < 0.12 && life[ni] >= 175) {
              life[ni] = 174;
            } else if (nt === EL.PLANT && this.rand() < 0.35 && life[ni] >= 68) {
              life[ni] = 67;
            } else if (nt === EL.SEED && this.rand() < 0.4) {
              type[ni] = EL.FIRE; life[ni] = 20; updated[ni] = stamp;
            } else if (nt === EL.SAND && this.rand() < 0.004) {
              type[ni] = EL.GLASS; life[ni] = 0; updated[ni] = stamp;
            }
          }
        }
        if (y > 0) {
          const dir = this.rand() < 0.5 ? -1 : 1;
          const up = (y - 1) * W + x;
          const upSide = (x + dir >= 0 && x + dir < W) ? (y - 1) * W + (x + dir) : -1;
          if (type[up] === EL.EMPTY && this.rand() < 0.72) this.swapCells(i, up);
          else if (upSide >= 0 && type[upSide] === EL.EMPTY && this.rand() < 0.65) this.swapCells(i, upSide);
        }
        return;
      }

      if (t === EL.SMOKE || t === EL.ACID_GAS) {
        if (y > 0) {
          const dir = this.rand() < 0.5 ? -1 : 1;
          const tx = x + (this.rand() < 0.45 ? dir : 0);
          if (tx >= 0 && tx < W) {
            const ni = (y - 1) * W + tx;
            if (type[ni] === EL.EMPTY || (type[ni] === EL.FIRE && this.rand() < 0.2)) {
              this.swapCells(i, ni); return;
            }
          }
          const sideX = x + dir;
          if (sideX >= 0 && sideX < W && type[y * W + sideX] === EL.EMPTY && this.rand() < 0.5) {
            this.swapCells(i, y * W + sideX);
          }
        } else {
          if (life[i] > 2) life[i]--;
          const sideX = x + (this.rand() < 0.5 ? -1 : 1);
          if (sideX >= 0 && sideX < W && type[y * W + sideX] === EL.EMPTY) this.swapCells(i, y * W + sideX);
        }
        return;
      }

      if (t === EL.STEAM) {
        let nearCold = y < H * 0.22;
        if (!nearCold && y > 0 && type[(y - 1) * W + x] === EL.ICE) nearCold = true;
        if (nearCold && life[i] < 45 && this.rand() < 0.012) {
          type[i] = EL.WATER; life[i] = 0; updated[i] = stamp; return;
        }
        if (y > 0) {
          const dir = this.rand() < 0.5 ? -1 : 1;
          const tx = x + (this.rand() < 0.4 ? dir : 0);
          if (tx >= 0 && tx < W) {
            const ni = (y - 1) * W + tx;
            if (type[ni] === EL.EMPTY || isLiquid(type[ni])) { this.swapCells(i, ni); return; }
          }
          const sideX = x + dir;
          if (sideX >= 0 && sideX < W && type[y * W + sideX] === EL.EMPTY && this.rand() < 0.5) {
            this.swapCells(i, y * W + sideX);
          }
        } else if (life[i] > 2) {
          life[i]--;
        }
        return;
      }

      if (t === EL.SPARK) {
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= W) continue;
            const ni = ny * W + nx, nt = type[ni];
            if (nt === EL.METAL && life[ni] === 0) life[ni] = 14;
            else if (nt === EL.TNT) { type[ni] = EL.EMPTY; this.explode(nx, ny, 18, 14); return; }
            else if (nt === EL.GUNPOWDER) { type[ni] = EL.EMPTY; this.explode(nx, ny, 5, 4); return; }
            else if (nt === EL.OIL && this.rand() < 0.55) { type[ni] = EL.FIRE; life[ni] = 35; updated[ni] = stamp; }
            else if (nt === EL.WOOD && this.rand() < 0.15 && life[ni] >= 175) life[ni] = 174;
            else if (nt === EL.ICE && this.rand() < 0.25) { type[ni] = EL.WATER; life[ni] = 0; }
          }
        }
        const nx = x + this.randInt(3) - 1, ny = y + this.randInt(3) - 1;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && type[ny * W + nx] === EL.EMPTY) this.swapCells(i, ny * W + nx);
        return;
      }

      if (t === EL.EMBER) {
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= W) continue;
            const ni = ny * W + nx, nt = type[ni];
            if (nt === EL.OIL && this.rand() < 0.4) { type[ni] = EL.FIRE; life[ni] = 32; }
            else if (nt === EL.GUNPOWDER) { type[ni] = EL.EMPTY; this.explode(nx, ny, 5, 4); return; }
            else if (nt === EL.TNT) { type[ni] = EL.EMPTY; this.explode(nx, ny, 18, 14); return; }
            else if (nt === EL.WOOD && this.rand() < 0.08 && life[ni] >= 175) life[ni] = 174;
            else if (nt === EL.WATER || nt === EL.SALTWATER) { type[i] = EL.STEAM; life[i] = 40; return; }
          }
        }
        const dy = this.rand() < 0.45 ? 1 : (this.rand() < 0.25 ? -1 : 0);
        const dx = this.rand() < 0.5 ? (this.rand() < 0.5 ? -1 : 1) : 0;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && type[ny * W + nx] === EL.EMPTY) this.swapCells(i, ny * W + nx);
      }
    }

    updatePowder(x, y, i, t) {
      const W = this.width, H = this.height, type = this.type, life = this.life, updated = this.updated, stamp = this.stamp;

      if (t === EL.SALT) {
        const dirs = [[0, 1], [-1, 0], [1, 0], [0, -1]];
        for (let k = 0; k < 4; k++) {
          const nx = x + dirs[k][0], ny = y + dirs[k][1];
          if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
            const ni = ny * W + nx;
            if (type[ni] === EL.WATER) {
              type[ni] = EL.SALTWATER; life[ni] = 0; updated[ni] = stamp;
              type[i] = EL.EMPTY; life[i] = 0; return;
            }
          }
        }
      } else if (t === EL.SEED) {
        const dirs = [[0, 1], [-1, 0], [1, 0], [0, -1]];
        for (let k = 0; k < 4; k++) {
          const nx = x + dirs[k][0], ny = y + dirs[k][1];
          if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
            const ni = ny * W + nx;
            if (type[ni] === EL.WATER || type[ni] === EL.SALTWATER) {
              type[ni] = EL.EMPTY; type[i] = EL.PLANT; life[i] = 70; updated[i] = stamp; return;
            }
          }
        }
      } else if (t === EL.SNOW) {
        if (this.rand() < 0.35) return;
      } else if (t === EL.ASH) {
        if (y + 1 < H && type[(y + 1) * W + x] === EL.EMPTY) {
          if (life[i] > 0) life[i]--;
          if (life[i] === 0) { type[i] = EL.EMPTY; return; }
          if (this.rand() < 0.45) return;
        }
      }

      if (y + 1 >= H) return;

      const below = (y + 1) * W + x, bt = type[below];
      const canSwap = (target) => target === EL.EMPTY || isTransient(target) || (isLiquid(target) && EL_META[t].density > EL_META[target].density);

      if (canSwap(bt)) {
        if (isLiquid(bt) && this.rand() < 0.35) return;
        this.swapCells(i, below);
        return;
      }

      const dir = (this.rand() < 0.5) ? -1 : 1;
      for (let attempt = 0; attempt < 2; attempt++) {
        const d = attempt === 0 ? dir : -dir;
        const nx = x + d;
        if (nx >= 0 && nx < W) {
          const diag = (y + 1) * W + nx, dt = type[diag];
          if (canSwap(dt) && (type[y * W + nx] === EL.EMPTY || isTransient(type[y * W + nx]) || isLiquid(type[y * W + nx]))) {
            this.swapCells(i, diag);
            return;
          }
        }
      }
    }

    updateLiquid(x, y, i, t) {
      const W = this.width, H = this.height, type = this.type, life = this.life, updated = this.updated, stamp = this.stamp;

      if (t === EL.LAVA) {
        const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
        for (let k = 0; k < 4; k++) {
          const nx = x + dirs[k][0], ny = y + dirs[k][1];
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
          const ni = ny * W + nx, nt = type[ni];
          if (nt === EL.WATER || nt === EL.SALTWATER) {
            type[ni] = EL.STEAM; life[ni] = 75; updated[ni] = stamp;
            type[i] = EL.STONE; life[i] = 0; updated[i] = stamp; return;
          } else if (nt === EL.ICE || nt === EL.SNOW) {
            type[ni] = EL.WATER; life[ni] = 0; updated[ni] = stamp;
            if (this.rand() < 0.2) { type[i] = EL.STONE; life[i] = 0; return; }
          } else if (nt === EL.SAND && this.rand() < 0.02) {
            type[ni] = EL.GLASS; life[ni] = 0; updated[ni] = stamp;
          } else if (nt === EL.TNT) {
            type[ni] = EL.EMPTY; this.explode(nx, ny, 18, 14); return;
          } else if (nt === EL.GUNPOWDER) {
            type[ni] = EL.EMPTY; this.explode(nx, ny, 5, 4); return;
          } else if (nt === EL.OIL && this.rand() < 0.4) {
            type[ni] = EL.FIRE; life[ni] = 35;
          } else if (nt === EL.WOOD && life[ni] >= 175 && this.rand() < 0.15) {
            life[ni] = 174;
          } else if (nt === EL.PLANT && life[ni] >= 68 && this.rand() < 0.4) {
            life[ni] = 67;
          }
        }
        if (y > 0 && type[(y - 1) * W + x] === EL.EMPTY && this.rand() < 0.008) {
          this.setCell(x, y - 1, this.rand() < 0.7 ? EL.FIRE : EL.EMBER);
        }
        if ((this.tick & 1) === 1 && this.rand() < 0.55) return;
      }

      if (t === EL.ACID) {
        const dirs = [[0, 1], [-1, 0], [1, 0], [0, -1]];
        for (let k = 0; k < 4; k++) {
          const nx = x + dirs[k][0], ny = y + dirs[k][1];
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
          const ni = ny * W + nx, nt = type[ni];
          if (nt === EL.EMPTY || nt === EL.ACID || nt === EL.GLASS || nt === EL.LAVA || isTransient(nt)) continue;

          let eatChance = 0.18;
          if (nt === EL.METAL) eatChance = 0.025;
          else if (nt === EL.STONE) eatChance = 0.05;
          else if (nt === EL.WATER || nt === EL.SALTWATER) eatChance = 0.04;

          if (this.rand() < eatChance) {
            type[ni] = EL.ACID_GAS; life[ni] = 22 + this.randInt(16); updated[ni] = stamp;
            const cost = (nt === EL.METAL || nt === EL.STONE) ? 28 : 16;
            if (life[i] <= cost) {
              type[i] = EL.ACID_GAS; life[i] = 20; updated[i] = stamp; return;
            }
            life[i] -= cost;
            break;
          }
        }
      }

      if (t === EL.WATER || t === EL.SALTWATER) {
        if (y + 1 < H && type[(y + 1) * W + x] === EL.ASH && this.rand() < 0.25) {
          type[(y + 1) * W + x] = EL.EMPTY;
        }
      }

      const myDensity = EL_META[t].density;
      const canDisplace = (target) => target === EL.EMPTY || isTransient(target) || (isLiquid(target) && myDensity > EL_META[target].density);

      if (y + 1 < H) {
        const below = (y + 1) * W + x;
        if (canDisplace(type[below])) { this.swapCells(i, below); return; }
        const dir = this.rand() < 0.5 ? -1 : 1;
        for (let a = 0; a < 2; a++) {
          const nx = x + (a === 0 ? dir : -dir);
          if (nx >= 0 && nx < W) {
            const diag = (y + 1) * W + nx;
            if (canDisplace(type[diag])) { this.swapCells(i, diag); return; }
          }
        }
      }

      const disp = t === EL.LAVA ? 2 : (t === EL.OIL ? 4 : 6);
      const dir = this.rand() < 0.5 ? -1 : 1;
      for (let s = 0; s < 2; s++) {
        const stepDir = s === 0 ? dir : -dir;
        for (let d = 1; d <= disp; d++) {
          const nx = x + stepDir * d;
          if (nx < 0 || nx >= W) break;
          const ni = y * W + nx;
          if (canDisplace(type[ni])) {
            if (d === disp || nx + stepDir < 0 || nx + stepDir >= W || !canDisplace(type[y * W + (nx + stepDir)])) {
              this.swapCells(i, ni);
              return;
            }
          } else {
            break;
          }
        }
      }
    }

    updateSolid(x, y, i, t) {
      const W = this.width, H = this.height, type = this.type, life = this.life, updated = this.updated, stamp = this.stamp;

      if (t === EL.WOOD) {
        if (life[i] < 180) {
          if (life[i] <= 1) {
            type[i] = this.rand() < 0.35 ? EL.ASH : EL.EMPTY;
            life[i] = type[i] === EL.ASH ? 450 : 0;
            return;
          }
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= H) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= W) continue;
              const ni = ny * W + nx, nt = type[ni];
              if (nt === EL.WATER || nt === EL.SALTWATER) {
                life[i] = 180; type[ni] = EL.STEAM; life[ni] = 60; return;
              }
            }
          }
          if (this.rand() < 0.45) life[i]--;
          const dir = this.randInt(4);
          const ox = dir === 2 ? -1 : dir === 3 ? 1 : 0;
          const oy = dir === 0 ? -1 : dir === 1 ? 1 : 0;
          const nx = x + ox, ny = y + oy;
          if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
            const ni = ny * W + nx;
            if (type[ni] === EL.EMPTY && this.rand() < 0.16) {
              const r = this.rand();
              this.setCell(nx, ny, r < 0.65 ? EL.FIRE : (r < 0.9 ? EL.SMOKE : EL.EMBER));
            } else if (type[ni] === EL.WOOD && life[ni] >= 180 && this.rand() < 0.045) {
              life[ni] = 179;
            } else if (type[ni] === EL.PLANT && life[ni] >= 70 && this.rand() < 0.18) {
              life[ni] = 69;
            }
          }
        }
        return;
      }

      if (t === EL.PLANT) {
        if (life[i] < 70) {
          if (life[i] <= 1) {
            type[i] = this.rand() < 0.15 ? EL.ASH : EL.EMPTY;
            life[i] = type[i] === EL.ASH ? 350 : 0;
            return;
          }
          life[i] -= 2;
          if (y > 0 && type[(y - 1) * W + x] === EL.EMPTY && this.rand() < 0.35) {
            this.setCell(x, y - 1, this.rand() < 0.7 ? EL.FIRE : EL.SMOKE);
          }
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= H) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= W) continue;
              const ni = ny * W + nx;
              if (type[ni] === EL.PLANT && life[ni] >= 70 && this.rand() < 0.25) life[ni] = 69;
              else if (type[ni] === EL.WOOD && life[ni] >= 180 && this.rand() < 0.06) life[ni] = 179;
            }
          }
          return;
        }
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= W) continue;
            const ni = ny * W + nx;
            if (type[ni] === EL.WATER && this.rand() < 0.16) {
              type[ni] = EL.EMPTY; life[ni] = 0;
              const gx = x + (this.randInt(3) - 1), gy = y - (this.rand() < 0.7 ? 1 : 0);
              if (gx >= 0 && gx < W && gy >= 0 && gy < H) {
                const gi = gy * W + gx;
                if (type[gi] === EL.EMPTY) this.setCell(gx, gy, EL.PLANT, 70);
              }
              return;
            }
          }
        }
        return;
      }

      if (t === EL.ICE && this.rand() < 0.008) {
        let iceNeighbors = 0, waterIdx = -1;
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= W) continue;
            const ni = ny * W + nx;
            if (type[ni] === EL.ICE) iceNeighbors++;
            else if (type[ni] === EL.WATER) waterIdx = ni;
          }
        }
        if (iceNeighbors >= 4 && waterIdx >= 0) {
          type[waterIdx] = EL.ICE; life[waterIdx] = 0; updated[waterIdx] = stamp;
        }
        return;
      }

      if (t === EL.METAL && life[i] > 0) {
        if (life[i] === 14) {
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= H) continue;
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= W) continue;
              const ni = ny * W + nx, nt = type[ni];
              if (nt === EL.METAL && life[ni] === 0) life[ni] = 14;
              else if (nt === EL.TNT) { type[ni] = EL.EMPTY; this.explode(nx, ny, 18, 14); return; }
              else if (nt === EL.GUNPOWDER) { type[ni] = EL.EMPTY; this.explode(nx, ny, 5, 4); return; }
              else if (nt === EL.SALTWATER && this.rand() < 0.2) { type[ni] = EL.STEAM; life[ni] = 45; }
              else if (nt === EL.EMPTY && this.rand() < 0.025) this.setCell(nx, ny, EL.SPARK, 8);
            }
          }
        }
        life[i]--;
      }
    }

    stepMeteors() {
      const W = this.width, H = this.height;
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.life--;
        m.x += m.vx;
        m.y += m.vy;
        m.vy += 0.08;

        const gx = m.x | 0, gy = m.y | 0;
        if (this.inBounds(gx, gy)) {
          if (this.type[gy * W + gx] === EL.EMPTY || isTransient(this.type[gy * W + gx])) {
            this.setCell(gx, gy, this.rand() < 0.55 ? EL.FIRE : EL.SMOKE, 22 + this.randInt(20));
          }
          if (this.rand() < 0.7) {
            this.spawnParticle({
              x: m.x, y: m.y,
              vx: -m.vx * 0.2 + (this.rand() - 0.5) * 0.8,
              vy: -m.vy * 0.2 + (this.rand() - 0.5) * 0.5,
              gravity: -0.01, life: 14 + this.randInt(10), maxLife: 24,
              color: this.rand() < 0.5 ? '#ff961c' : '#ff4d6d', size: 2, redeposit: false,
            });
          }
        }

        const hitGround = gy >= H - 3 || (this.inBounds(gx, gy) && isBlocking(this.type[gy * W + gx])) || gy >= m.ty;
        if (m.life <= 0 || hitGround || gx < 1 || gx >= W - 1) {
          const ix = Math.max(6, Math.min(W - 7, m.x));
          const iy = Math.max(6, Math.min(H - 7, Math.max(m.y, 8)));
          const blastR = m.blastRadius || 16, blastP = m.blastPower || 13, sc = m.scale || 1;
          this.meteors.splice(i, 1);
          this.explode(ix, iy, blastR, blastP);
          this.addShake(9 * sc);
          // Lava + ember splash around the crater (embers dissipate; lava pools)
          const splashN = Math.max(6, Math.round(16 * sc));
          for (let s = 0; s < splashN; s++) {
            const ang = (s / splashN) * Math.PI * 2 + this.rand() * 0.2;
            const rad = (4 + this.rand() * 8) * sc;
            const sx = (ix + Math.cos(ang) * rad) | 0;
            const sy = (iy + Math.sin(ang) * rad * 0.7) | 0;
            if (!this.inBounds(sx, sy)) continue;
            const cur = this.type[sy * W + sx];
            if (cur === EL.EMPTY || isTransient(cur) || isPowder(cur)) {
              if (this.rand() < 0.45) this.setCell(sx, sy, EL.LAVA);
              else this.setCell(sx, sy, EL.EMBER, 28 + this.randInt(24));
            }
          }
        }
      }
    }

    stepLightning() {
      for (let i = this.lightnings.length - 1; i >= 0; i--) {
        const bolt = this.lightnings[i];
        bolt.life--;
        if (bolt.life <= 0) this.lightnings.splice(i, 1);
      }
    }

    stepBlackHoles() {
      const W = this.width, H = this.height;
      for (let i = this.blackHoles.length - 1; i >= 0; i--) {
        const bh = this.blackHoles[i];
        if (bh.controlled) {
          if (bh.life < 28) bh.life = 28;
        } else {
          bh.life--;
        }
        bh.phase += 0.28;
        const t = 1 - bh.life / bh.maxLife;
        // Grow, then rapidly collapse and fade
        const baseR = bh.baseRadius || 6;
        if (t < 0.72) bh.radius = baseR + (bh.maxRadius - baseR) * (t / 0.72);
        else bh.radius = bh.maxRadius * Math.max(0.05, 1 - (t - 0.72) / 0.28);

        if (bh.life <= 0 || bh.radius < 0.8) {
          // Collapse pop of sparks that all dissipate
          for (let s = 0; s < 16; s++) {
            const ang = this.rand() * Math.PI * 2, spd = 1.2 + this.rand() * 2.4;
            this.spawnParticle({
              x: bh.x, y: bh.y,
              vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
              gravity: 0.04, life: 16 + this.randInt(10), maxLife: 26,
              color: '#c4b5fd', size: 1.5, redeposit: false,
            });
          }
          this.blackHoles.splice(i, 1);
          continue;
        }

        const rad = bh.radius, rad2 = rad * rad;
        // Sample cells instead of scanning the whole disc every frame
        const samples = 48;
        for (let k = 0; k < samples; k++) {
          const ang = this.rand() * Math.PI * 2;
          const rr = this.rand() * rad;
          const px = (bh.x + Math.cos(ang) * rr) | 0;
          const py = (bh.y + Math.sin(ang) * rr) | 0;
          if (px < 0 || px >= W || py < 0 || py >= H) continue;
          const idx = py * W + px;
          const et = this.type[idx];
          if (et === EL.EMPTY) continue;
          const dx = px - bh.x, dy = py - bh.y, d2 = dx * dx + dy * dy;
          if (d2 > rad2) continue;
          if (d2 < (rad * 0.45) * (rad * 0.45) || isTransient(et) || isPowder(et) || isLiquid(et)) {
            this.type[idx] = EL.EMPTY;
            this.life[idx] = 0;
            if (this.rand() < 0.35) {
              const dist = Math.sqrt(d2) || 1;
              this.spawnParticle({
                x: px, y: py,
                vx: -dx / dist * 1.6 + (this.rand() - 0.5),
                vy: -dy / dist * 1.6 + (this.rand() - 0.5),
                gravity: 0, life: 12 + this.randInt(8), maxLife: 20,
                color: EL_META[et] ? EL_META[et].color : '#c4b5fd', size: 1.4, redeposit: false,
              });
            }
          }
        }

        // Pull existing ballistic particles inward (they fade, never pile up)
        for (const p of this.particles) {
          const dx = bh.x - p.x, dy = bh.y - p.y, dist = Math.hypot(dx, dy);
          if (dist < rad * 1.6 && dist > 0.2) {
            p.vx += (dx / dist) * 0.7;
            p.vy += (dy / dist) * 0.7;
            if (dist < rad * 0.35) p.life = Math.min(p.life, 4);
          }
        }

        for (const mob of this.mobs) {
          if (mob.state === 'grabbed') continue;
          const dx = bh.x - mob.x, dy = bh.y - (mob.y - 6);
          const dist = Math.hypot(dx, dy);
          if (dist < rad * 2.1 && dist > 0.2) {
            const pull = (1 - dist / (rad * 2.1)) * 1.35;
            mob.vx += (dx / dist) * pull;
            mob.vy += (dy / dist) * pull;
            mob.state = 'ragdoll';
            mob.ragdollTimer = Math.max(mob.ragdollTimer, 25);
            mob.angVel += 0.12;
            if (dist < rad * 0.5) {
              mob.hp -= 6;
              mob.hurtFlash = 5;
            }
          }
        }
        for (const bomb of this.bombs) {
          if (bomb.grabbed) continue;
          const dx = bh.x - bomb.x, dy = bh.y - bomb.y, dist = Math.hypot(dx, dy);
          if (dist < rad * 1.8 && dist > 0.2) {
            bomb.vx += (dx / dist) * 0.9;
            bomb.vy += (dy / dist) * 0.9;
          }
        }
      }
    }

    stepNukes() {
      for (let i = this.nukes.length - 1; i >= 0; i--) {
        const n = this.nukes[i];
        n.life--;
        // Soft rising dissipation wisps (all fade, no redeposit)
        if (n.life > 20 && this.rand() < 0.65) {
          const capY = n.y - n.stemH * (0.7 + (1 - n.life / n.maxLife) * 0.3);
          this.spawnParticle({
            x: n.x + (this.rand() - 0.5) * n.capR * 1.6,
            y: capY + (this.rand() - 0.5) * 8,
            vx: (this.rand() - 0.5) * 0.7,
            vy: -0.7 - this.rand() * 0.5,
            gravity: -0.01, life: 20 + this.randInt(16), maxLife: 36,
            color: this.rand() < 0.2 ? '#fb923c' : '#94a3b8', size: 2.2, redeposit: false,
          });
        }
        if (n.life <= 0) this.nukes.splice(i, 1);
      }
    }

    stepEarthquake() {
      if (this.quakeLife <= 0) return;
      this.quakeLife--;
      this.shake = Math.max(this.shake, 5 + this.quakeLife * 0.16);
      const W = this.width, H = this.height, type = this.type;
      const samples = 130;
      for (let k = 0; k < samples; k++) {
        const x = 1 + this.randInt(W - 2);
        const y = 1 + this.randInt(H - 2);
        const i = y * W + x;
        const t = type[i];
        if (isPowder(t)) {
          const dir = this.rand() < 0.5 ? -1 : 1;
          const nx = x + dir, ny = y + (this.rand() < 0.45 ? 1 : 0);
          if (nx >= 0 && nx < W && ny < H) {
            const ni = ny * W + nx;
            if (type[ni] === EL.EMPTY || isTransient(type[ni])) this.swapCells(i, ni);
          }
        } else if (t === EL.STONE || t === EL.WOOD || t === EL.ICE || t === EL.GLASS || t === EL.PLANT) {
          const below = (y + 1) * W + x;
          const side = y * W + (x + (this.rand() < 0.5 ? -1 : 1));
          if (y + 1 < H && (type[below] === EL.EMPTY || isTransient(type[below])) && this.rand() < 0.08) {
            const drop = t === EL.STONE ? EL.SAND : (t === EL.WOOD ? EL.EMBER : (t === EL.ICE ? EL.WATER : (t === EL.GLASS ? EL.SAND : EL.SEED)));
            type[i] = EL.EMPTY;
            this.life[i] = 0;
            this.spawnParticle({
              x, y,
              vx: (this.rand() - 0.5) * 1.6, vy: 0.6 + this.rand(),
              gravity: 0.14, life: 70, maxLife: 70, elType: drop === EL.EMBER ? EL.ASH : drop,
              color: EL_META[drop].color, size: 1.5, redeposit: drop !== EL.EMBER && drop !== EL.WATER,
            });
          } else if (x > 0 && x < W - 1 && (type[side] === EL.EMPTY) && this.rand() < 0.04) {
            this.swapCells(i, side);
          }
        }
      }
      if ((this.quakeLife % 8) === 0) {
        for (const mob of this.mobs) {
          if (mob.state === 'grabbed') continue;
          mob.state = 'ragdoll';
          mob.ragdollTimer = Math.max(mob.ragdollTimer, 20);
          mob.vx += (this.rand() - 0.5) * 1.8;
          mob.vy -= 0.5;
          mob.angVel += (this.rand() - 0.5) * 0.3;
        }
      }
    }

    stepTornadoes() {
      const W = this.width, H = this.height;
      for (let t = this.tornadoes.length - 1; t >= 0; t--) {
        const tor = this.tornadoes[t];
        tor.phase += 0.25;
        if (!tor.controlled) {
          tor.x += tor.vx + Math.sin(tor.phase * 0.2) * 0.4;
          tor.life--;
          if (tor.life <= 0 || tor.x < -20 || tor.x > W + 20) {
            this.tornadoes.splice(t, 1);
            continue;
          }
        }

        const sc = tor.scale || 1;
        const funnelH = Math.min(H * 0.72, 140 * sc);
        const topY = Math.max(0, tor.y - funnelH);
        const botY = Math.min(H - 2, tor.y + 16 * sc);

        for (let k = 0; k < Math.max(12, Math.round(28 * sc)); k++) {
          const py = (topY + this.rand() * (botY - topY)) | 0;
          const heightFrac = 1 - (py - topY) / Math.max(1, botY - topY);
          const halfW = (10 + heightFrac * 24) * sc;
          const px = (tor.x + (this.rand() - 0.5) * 2 * halfW) | 0;
          if (px < 0 || px >= W || py < 0 || py >= H) continue;
          const i = py * W + px, et = this.type[i];
          if (isPowder(et) || isLiquid(et) || et === EL.FIRE) {
            this.type[i] = EL.EMPTY; this.life[i] = 0;
            const dx = px - tor.x;
            this.spawnParticle({
              x: px, y: py,
              vx: -dx * 0.14 + (this.rand() - 0.5) * 2.5,
              vy: -2.0 - this.rand() * 2.4,
              gravity: 0.11, life: 65, maxLife: 65, elType: et,
              color: EL_META[et].color, size: 1.5, redeposit: !isTransient(et),
            });
          } else if (et === EL.EMPTY && this.rand() < 0.35) {
            const dx = px - tor.x;
            this.spawnParticle({
              x: px, y: py,
              vx: -dx * 0.22 + Math.cos(tor.phase + py * 0.1) * 2.2,
              vy: -1.4 - this.rand() * 1.2,
              gravity: -0.02, life: 14 + this.randInt(10), maxLife: 24,
              color: '#cbd5e1', size: 1.2, redeposit: false,
            });
          }
        }

        for (const mob of this.mobs) {
          if (mob.state === 'grabbed') continue;
          const dx = tor.x - mob.x, dy = (tor.y - 25) - mob.y;
          const dist = Math.hypot(dx, dy);
          const pullR = tor.pullR || 62;
          if (dist < pullR) {
            const pull = (1 - dist / pullR);
            mob.vx += (dx / (dist || 1)) * pull * 1.1 + Math.sin(tor.phase + mob.id) * 0.65;
            mob.vy -= pull * 1.25;
            mob.state = 'ragdoll';
            mob.ragdollTimer = Math.max(mob.ragdollTimer, 35);
            mob.angVel += (this.rand() - 0.5) * 0.25;
            if (dist < 14 * sc && this.rand() < 0.12) {
              mob.vx = (this.rand() < 0.5 ? -1 : 1) * (4 + this.rand() * 3);
              mob.vy = -4.5 - this.rand() * 2.5;
            }
          }
        }

        for (const bomb of this.bombs) {
          if (bomb.grabbed) continue;
          const dx = tor.x - bomb.x, dy = (tor.y - 20) - bomb.y;
          const dist = Math.hypot(dx, dy);
          const bombR = (tor.pullR || 62) * 0.9;
          if (dist < bombR) {
            const pull = 1 - dist / bombR;
            bomb.vx += (dx / (dist || 1)) * pull * 0.9 + Math.cos(tor.phase) * 0.5;
            bomb.vy -= pull * 1.1;
          }
        }
      }
    }

    stepTsunamis() {
      const W = this.width, H = this.height;
      for (let t = this.tsunamis.length - 1; t >= 0; t--) {
        const w = this.tsunamis[t];
        w.x += w.dir * w.speed;
        w.life--;
        if (w.life <= 0) { this.tsunamis.splice(t, 1); continue; }

        const crestX = w.x | 0;
        const startY = Math.max(2, H - w.waveHeight);
        const halfW = Math.max(4, Math.round((w.waveWidth || 26) * 0.4));
        for (let dx = -halfW; dx <= halfW; dx++) {
          const gx = crestX + dx;
          if (gx < 1 || gx >= W - 1) continue;
          for (let gy = startY; gy < H - 1; gy += 2) {
            if (this.rand() < 0.45) {
              const i = gy * W + gx, cur = this.type[i];
              if (cur === EL.EMPTY || isTransient(cur)) this.setCell(gx, gy, EL.WATER);
            }
          }
        }

        for (let k = 0; k < 10; k++) {
          this.spawnParticle({
            x: crestX + w.dir * 4, y: startY + this.rand() * 24,
            vx: w.dir * (2.5 + this.rand() * 2.2), vy: -1.4 - this.rand() * 1.8,
            gravity: 0.14, life: 24, maxLife: 24, color: '#e0f2fe', size: 1.8, redeposit: false,
          });
        }

        for (const mob of this.mobs) {
          if (mob.state === 'grabbed') continue;
          if (Math.abs(mob.x - w.x) < (w.waveWidth || 26) && mob.y > startY - 12) {
            mob.vx += w.dir * 1.35; mob.vy -= 0.75;
            mob.state = 'ragdoll'; mob.ragdollTimer = Math.max(mob.ragdollTimer, 35);
            mob.burnTimer = 0; mob.angVel += w.dir * 0.18;
          }
        }
        for (const bomb of this.bombs) {
          if (bomb.grabbed) continue;
          if (Math.abs(bomb.x - w.x) < 26 && bomb.y > startY - 10) {
            bomb.vx += w.dir * 1.2; bomb.vy -= 0.5;
          }
        }
      }
    }

    stepBombs() {
      const W = this.width, H = this.height;
      for (let i = this.bombs.length - 1; i >= 0; i--) {
        const b = this.bombs[i];
        b.fuse--;
        if (this.rand() < 0.65) {
          this.spawnParticle({
            x: b.x + 2, y: b.y - 4,
            vx: (this.rand() - 0.5) * 1.6, vy: -1.2 - this.rand() * 1.2,
            gravity: 0.08, life: 8 + this.randInt(8), maxLife: 16,
            color: this.rand() < 0.5 ? '#ffe066' : '#ff6b2b', size: 1.4, redeposit: false,
          });
        }

        let hotTouch = false;
        const gx = b.x | 0, gy = b.y | 0;
        if (gx >= 1 && gx < W - 1 && gy >= 1 && gy < H - 1) {
          const ct = this.type[gy * W + gx];
          if (ct === EL.FIRE || ct === EL.LAVA || ct === EL.SPARK) hotTouch = true;
        }

        if (b.fuse <= 0 || hotTouch) {
          const bx = b.x, by = b.y;
          if (this.grabbed && this.grabbed.ref === b) this.grabbed = null;
          this.bombs.splice(i, 1);
          this.explode(bx, by, b.blastRadius || 17, b.blastPower || 13);
          continue;
        }
        if (b.grabbed) continue;

        b.vy += 0.16; b.vx *= 0.99;
        const nx = b.x + b.vx, ny = b.y + b.vy;
        const testX = Math.max(2, Math.min(W - 3, nx)) | 0;
        const testY = Math.max(2, Math.min(H - 3, ny)) | 0;

        if (isBlocking(this.type[testY * W + (b.x | 0)]) || ny >= H - 3) {
          b.vy = -b.vy * 0.42; b.vx *= 0.82;
          if (Math.abs(b.vy) < 0.4) b.vy = 0;
        } else {
          b.y = Math.max(2, Math.min(H - 3, ny));
        }

        if (isBlocking(this.type[(b.y | 0) * W + testX]) || nx < 2 || nx > W - 3) {
          b.vx = -b.vx * 0.55;
        } else {
          b.x = Math.max(2, Math.min(W - 3, nx));
        }
        b.angle += b.vx * 0.12;
      }
    }

    stepFireworks() {
      const W = this.width, H = this.height;
      for (let i = this.fireworks.length - 1; i >= 0; i--) {
        const fw = this.fireworks[i];
        fw.x += fw.vx + (this.rand() - 0.5) * 0.25;
        fw.y += fw.vy; fw.vy *= 0.992; fw.life--;

        this.spawnParticle({
          x: fw.x, y: fw.y + 2, vx: (this.rand() - 0.5) * 0.5, vy: 0.6 + this.rand() * 0.6,
          gravity: 0.05, life: 14, maxLife: 14, color: '#ffd166', size: 1.4, redeposit: false,
        });

        const gx = fw.x | 0, gy = fw.y | 0;
        const hitSolid = gx >= 0 && gx < W && gy >= 0 && gy < H && isBlocking(this.type[gy * W + gx]);

        if (fw.life <= 0 || fw.y < 10 || hitSolid) {
          const sc = fw.scale || 1;
          const count = Math.max(16, Math.round(42 * sc));
          for (let s = 0; s < count; s++) {
            const ang = (s / count) * Math.PI * 2 + (this.rand() - 0.5) * 0.2;
            const spd = (1.2 + this.rand() * 2.8) * Math.sqrt(sc);
            this.spawnParticle({
              x: fw.x, y: fw.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
              gravity: 0.055, life: 28 + this.randInt(22), maxLife: 50, color: fw.color, size: 1.8, redeposit: false,
            });
          }
          this.flashes.push({ x: fw.x, y: fw.y, radius: 1, maxRadius: 14 * sc, life: 7, maxLife: 7 });
          this.fireworks.splice(i, 1);
        }
      }
    }

    stepBullets() {
      const W = this.width, H = this.height;
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.life--;
        if (b.life <= 0) { this.bullets.splice(i, 1); continue; }

        const steps = 6, sx = b.vx / steps, sy = b.vy / steps;
        let hit = false;

        for (let s = 0; s < steps; s++) {
          b.x += sx; b.y += sy;
          const gx = b.x | 0, gy = b.y | 0;
          if (gx < 0 || gx >= W || gy < 0 || gy >= H) { hit = true; break; }

          for (const mob of this.mobs) {
            if (Math.abs(b.x - mob.x) < 5 && b.y >= mob.y - 14 && b.y <= mob.y + 1) {
              mob.hp -= 22; mob.hurtFlash = 7;
              mob.vx += b.vx * 0.45; mob.vy += b.vy * 0.35 - 1.2;
              mob.state = 'ragdoll'; mob.ragdollTimer = Math.max(mob.ragdollTimer, 28);
              mob.angVel += (b.vx >= 0 ? 1 : -1) * 0.25;
              this.spawnSplat(b.x, b.y, mob.type === 'zombie' ? '#52e063' : '#ff6b6b', 7, 2.0);
              hit = true; break;
            }
          }
          if (hit) break;

          const idx = gy * W + gx, ct = this.type[idx];
          if (ct === EL.TNT || ct === EL.GUNPOWDER) {
            this.type[idx] = EL.EMPTY;
            this.explode(gx, gy, ct === EL.TNT ? 18 : 6, ct === EL.TNT ? 14 : 5);
            hit = true; break;
          } else if (isBlocking(ct)) {
            if (ct === EL.METAL || ct === EL.STONE) {
              this.spawnSplat(b.x, b.y, '#ffe066', 5, 2.2);
              if (ct === EL.STONE && this.rand() < 0.45) this.type[idx] = EL.EMPTY;
              hit = true; break;
            } else {
              this.paintBrush(gx, gy, 1, EL.EMPTY, true);
              this.spawnSplat(b.x, b.y, EL_META[ct].color, 4, 1.5);
              if (this.rand() < 0.55) { hit = true; break; }
            }
          } else if (isLiquid(ct)) {
            this.spawnSplat(b.x, b.y, EL_META[ct].color, 3, 1.4);
            b.vx *= 0.85; b.vy *= 0.85;
          }
        }
        if (hit) this.bullets.splice(i, 1);
      }
    }

    stepRockets() {
      const W = this.width, H = this.height;
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i];
        r.life--; r.vx *= 1.03; r.vy *= 1.03; r.x += r.vx; r.y += r.vy;
        const gx = r.x | 0, gy = r.y | 0;
        if (this.inBounds(gx, gy) && this.type[gy * W + gx] === EL.EMPTY) {
          this.setCell(gx, gy, this.rand() < 0.45 ? EL.FIRE : EL.SMOKE, 38);
        }
        let boom = r.life <= 0 || gx < 1 || gx >= W - 1 || gy < 1 || gy >= H - 1;
        if (!boom && isBlocking(this.type[gy * W + gx])) boom = true;
        if (!boom) {
          for (const mob of this.mobs) {
            if (Math.abs(r.x - mob.x) < 6 && r.y >= mob.y - 14 && r.y <= mob.y + 2) { boom = true; break; }
          }
        }
        if (boom) {
          const ex = Math.max(4, Math.min(W - 5, r.x)), ey = Math.max(4, Math.min(H - 5, r.y));
          this.rockets.splice(i, 1);
          this.explode(ex, ey, r.blastRadius || 21, r.blastPower || 16);
        }
      }
    }

    stepParticles() {
      const W = this.width, H = this.height;
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life--; p.vy += p.gravity; p.vx *= 0.985; p.x += p.vx; p.y += p.vy;
        const gx = p.x | 0, gy = p.y | 0;
        if (p.life <= 0 || gx < 0 || gx >= W || gy < 0 || gy >= H) {
          this.particles.splice(i, 1);
          continue;
        }
        if (p.redeposit && p.elType) {
          const idx = gy * W + gx;
          if (isBlocking(this.type[idx]) || gy >= H - 2) {
            let placed = false;
            for (const ty of [gy - 1, gy, gy - 2]) {
              if (ty >= 0 && ty < H) {
                const ti = ty * W + gx;
                if (this.type[ti] === EL.EMPTY || isTransient(this.type[ti])) {
                  this.setCell(gx, ty, p.elType);
                  placed = true; break;
                }
              }
            }
            if (placed || p.life < 40) this.particles.splice(i, 1);
            else { p.vx *= -0.4; p.vy *= -0.3; }
          }
        }
      }
    }

    stepMobs() {
      const W = this.width, H = this.height, type = this.type;
      this.rebuildMobIndex();
      for (let i = this.mobs.length - 1; i >= 0; i--) {
        const m = this.mobs[i];
        if (m.hurtFlash > 0) m.hurtFlash--;
        if (m.shockTimer > 0) m.shockTimer--;

        const mx = Math.max(1, Math.min(W - 2, m.x | 0));
        const myFeet = Math.max(1, Math.min(H - 2, m.y | 0));
        const myBody = Math.max(1, Math.min(H - 2, (m.y - 6) | 0));
        const myHead = Math.max(1, Math.min(H - 2, (m.y - 11) | 0));

        const tFeet = type[myFeet * W + mx];
        const tBody = type[myBody * W + mx];
        const tHead = type[myHead * W + mx];

        const inWater = isLiquid(tBody) && (tBody === EL.WATER || tBody === EL.SALTWATER || tBody === EL.OIL);
        m.inWater = inWater;

        if (tFeet === EL.LAVA || tBody === EL.LAVA) {
          m.burnTimer = 110; m.hp -= 3.2; m.hurtFlash = 4;
          if (m.state !== 'grabbed') m.vy = Math.min(m.vy, -1.5);
        } else if (tFeet === EL.FIRE || tBody === EL.FIRE || tFeet === EL.EMBER) {
          m.burnTimer = Math.max(m.burnTimer, 80);
        }

        if (tFeet === EL.ACID || tBody === EL.ACID) {
          m.acidTimer = 15; m.hp -= 1.8; m.hurtFlash = 3;
          if (this.rand() < 0.35 && this.inBounds(mx, myBody - 3) && type[(myBody - 3) * W + mx] === EL.EMPTY) {
            this.setCell(mx, myBody - 3, EL.ACID_GAS, 20);
          }
        } else if (m.acidTimer > 0) m.acidTimer--;

        if (tBody === EL.SPARK || tFeet === EL.SPARK || (tFeet === EL.METAL && this.life[myFeet * W + mx] > 0)) {
          m.shockTimer = 18; m.hp -= 0.9;
          m.state = 'ragdoll'; m.ragdollTimer = Math.max(m.ragdollTimer, 20);
          m.vx += (this.rand() - 0.5) * 2.2; m.vy -= 0.8;
        }

        if (tBody === EL.WATER || tBody === EL.SALTWATER || tFeet === EL.WATER || tFeet === EL.SNOW) {
          if (m.burnTimer > 0) {
            m.burnTimer = 0;
            if (this.inBounds(mx, myHead) && type[myHead * W + mx] === EL.EMPTY) this.setCell(mx, myHead, EL.STEAM, 45);
          }
        }

        if (m.burnTimer > 0) {
          m.burnTimer--; m.hp -= 0.28;
          if (this.rand() < 0.35 && this.inBounds(mx, myHead) && type[myHead * W + mx] === EL.EMPTY) {
            this.setCell(mx, myHead, this.rand() < 0.7 ? EL.FIRE : EL.SMOKE, 22);
          }
        }

        if (isLiquid(tHead)) {
          m.drownTimer++;
          if (m.drownTimer % 18 === 0) {
            this.spawnParticle({
              x: m.x, y: m.y - 12, vx: (this.rand() - 0.5) * 0.4, vy: -0.9,
              gravity: -0.02, life: 16, maxLife: 16, color: '#a5f3fc', size: 1.5, redeposit: false,
            });
          }
          const drownThreshold = m.type === 'zombie' ? 220 : 120;
          if (m.drownTimer > drownThreshold) { m.hp -= 0.55; m.hurtFlash = 3; }
        } else {
          m.drownTimer = Math.max(0, m.drownTimer - 3);
        }

        if (m.hp <= 0) {
          if (this.isHuman(m) && m.lastHitBy === 'zombie') {
            this.infectMob(m);
            // Fall through so the new ghoul can hunt this frame
          } else {
            if (m.dying <= 0) m.dying = 18;
            else m.dying--;
            if (m.dying <= 0) {
              const splatColors = { walker: '#c45c3a', jumper: '#e23e6e', zombie: '#9f8ab8', dummy: '#eab308' };
              this.spawnSplat(m.x, m.y - 6, splatColors[m.type] || '#f87171', 18, 3.0);
              if (this.grabbed && this.grabbed.ref === m) this.grabbed = null;
              m.dead = true;
              this.mobs.splice(i, 1);
              continue;
            }
            m.state = 'ragdoll';
            m.ragdollTimer = Math.max(m.ragdollTimer, m.dying);
            m.attackTimer = 0;
          }
        }

        if (m.state === 'grabbed') {
          m.angle *= 0.85; m.walkPhase += 0.35;
          continue;
        }

        if (m.state === 'ragdoll') {
          m.ragdollTimer--; m.angle += m.angVel; m.angVel *= 0.96;
          if (m.ragdollTimer <= 0 && m.onGround && Math.abs(m.vx) < 0.5 && Math.abs(m.vy) < 0.5) {
            m.state = 'walk'; m.angle = 0; m.angVel = 0;
          }
        } else {
          m.angle *= 0.78;
          this.updateMobAI(m);
        }

        const gravity = inWater ? 0.03 : 0.16;
        m.vy += gravity;
        if (inWater) {
          m.vx *= 0.86; m.vy *= 0.86;
          if (m.state === 'walk' && isLiquid(tBody)) m.vy -= 0.14;
        }

        const nextX = m.x + m.vx;
        const ix = Math.max(2, Math.min(W - 3, nextX | 0));
        const iyFeet = Math.max(2, Math.min(H - 2, (m.y - 1) | 0));
        const iyMid = Math.max(2, Math.min(H - 2, (m.y - 6) | 0));

        if (nextX < 3 || nextX > W - 4) {
          if (Math.abs(m.vx) > 4.5) {
            m.hp -= Math.abs(m.vx) * 4; m.hurtFlash = 6;
            this.spawnSplat(m.x, m.y - 6, '#e2e8f0', 6, 1.5);
          }
          m.vx = -m.vx * 0.55; m.facing *= -1;
        } else if (isBlocking(type[iyMid * W + ix])) {
          if (Math.abs(m.vx) > 4.5) {
            m.hp -= Math.abs(m.vx) * 4; m.hurtFlash = 6;
            this.spawnSplat(m.x, m.y - 6, '#e2e8f0', 6, 1.5);
          }
          m.vx = -m.vx * 0.5; m.facing *= -1;
        } else if (isBlocking(type[iyFeet * W + ix])) {
          let stepped = false;
          for (let stepUp = 1; stepUp <= 3; stepUp++) {
            const sy = Math.max(1, iyFeet - stepUp);
            if (!isBlocking(type[sy * W + ix]) && !isBlocking(type[Math.max(0, sy - 5) * W + ix])) {
              m.x = nextX; m.y = sy + 1; stepped = true; break;
            }
          }
          if (!stepped) {
            if (m.state === 'walk' && m.onGround && m.jumpCooldown <= 0) {
              m.vy = -2.4; m.jumpCooldown = 18;
            } else {
              m.vx = -m.vx * 0.45; m.facing *= -1;
            }
          }
        } else {
          m.x = nextX;
        }

        const nextY = m.y + m.vy;
        const fx = Math.max(2, Math.min(W - 3, m.x | 0));
        const fy = Math.max(2, Math.min(H - 2, nextY | 0));
        m.onGround = false;

        if (m.vy >= 0) {
          if (nextY >= H - 2 || isBlocking(type[fy * W + fx])) {
            const impact = m.vy;
            if (impact > 4.8) {
              m.hp -= (impact - 4.0) * 11; m.hurtFlash = 7;
              m.state = 'ragdoll'; m.ragdollTimer = Math.max(m.ragdollTimer, 25);
              this.spawnSplat(m.x, m.y, '#cbd5e1', 7, 1.6);
            }
            if (m.state === 'ragdoll' && impact > 2.0) m.vy = -impact * (m.type === 'dummy' ? 0.45 : 0.3);
            else m.vy = 0;
            m.y = Math.min(H - 2, fy);
            m.onGround = true;
            m.vx *= m.state === 'ragdoll' ? 0.85 : 0.78;
          } else {
            m.y = nextY;
          }
        } else {
          const headY = Math.max(1, (nextY - 12) | 0);
          if (nextY <= 12 || isBlocking(type[headY * W + fx])) m.vy = -m.vy * 0.35;
          else m.y = nextY;
        }

        if (Math.abs(m.vx) > 0.15) m.walkPhase += Math.abs(m.vx) * 0.45;
      }

      this.rebuildMobIndex();
      this.stepCombat();
    }

    rebuildMobIndex() {
      const cell = 24;
      const cols = Math.ceil(this.width / cell) + 1;
      this.mobHashCell = cell;
      this.mobHashCols = cols;
      const map = this.mobHash || (this.mobHash = new Map());
      map.clear();
      const preyZ = [];
      const preyH = [];
      for (const m of this.mobs) {
        if (m.dead) continue;
        const cx = Math.max(0, (m.x / cell) | 0);
        const cy = Math.max(0, (m.y / cell) | 0);
        const key = cy * cols + cx;
        let bucket = map.get(key);
        if (!bucket) { bucket = []; map.set(key, bucket); }
        bucket.push(m);
        if (m.type === 'zombie') preyZ.push(m);
        else if (m.type === 'walker' || m.type === 'jumper' || m.type === 'dummy') preyH.push(m);
      }
      this.preyForHumans = preyZ;
      this.preyForZombies = preyH;
    }

    queryMobs(x, y, radius) {
      const map = this.mobHash;
      const cell = this.mobHashCell || 24;
      const cols = this.mobHashCols || 1;
      if (!map || map.size === 0) return this.mobs;
      const out = [];
      const minX = Math.max(0, ((x - radius) / cell) | 0);
      const maxX = ((x + radius) / cell) | 0;
      const minY = Math.max(0, ((y - radius) / cell) | 0);
      const maxY = ((y + radius) / cell) | 0;
      for (let cy = minY; cy <= maxY; cy++) {
        for (let cx = minX; cx <= maxX; cx++) {
          const bucket = map.get(cy * cols + cx);
          if (!bucket) continue;
          for (let i = 0; i < bucket.length; i++) out.push(bucket[i]);
        }
      }
      return out;
    }

    findPrey(m) {
      const n = this.mobs.length;
      const cached = m.huntTarget;
      const holdMask = n > 500 ? 15 : 7;
      if (cached && !cached.dead && this.isPrey(m, cached) && ((this.tick + m.id) & holdMask) !== 0) {
        return cached;
      }
      const aggro = Math.max(this.width, this.height) + 40;
      let target = null, bestD2 = aggro * aggro;
      const consider = (other) => {
        if (!this.isPrey(m, other)) return;
        const dx = other.x - m.x, dy = other.y - m.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) { bestD2 = d2; target = other; }
      };
      if (n > 250) {
        const nearby = this.queryMobs(m.x, m.y, 96);
        for (let i = 0; i < nearby.length; i++) consider(nearby[i]);
        if (target) { m.huntTarget = target; return target; }
        if (((this.tick + m.id) % 24) !== 0) return cached || null;
      }
      const list = m.type === 'zombie' ? (this.preyForZombies || this.mobs) : (this.preyForHumans || this.mobs);
      for (let i = 0; i < list.length; i++) consider(list[i]);
      m.huntTarget = target;
      return target;
    }

    isHuman(m) { return m.type === 'walker' || m.type === 'jumper'; }

    infectMob(m) {
      if (!this.isHuman(m)) return false;
      m.type = 'zombie';
      m.hp = 90;
      m.maxHp = 130;
      m.hurtFlash = 12;
      m.combatTimer = 90;
      m.attackCooldown = 8;
      m.attackTimer = 0;
      m.attackStyle = '';
      m.biteChain = 0;
      m.lastHitBy = '';
      m.dying = 0;
      m.state = 'walk';
      m.ragdollTimer = 0;
      m.angle = 0;
      m.angVel = 0;
      m.vy = Math.min(m.vy, -0.8);
      this.spawnSplat(m.x, m.y - 7, '#a78bfa', 10, 1.8);
      return true;
    }

    isPrey(hunter, other) {
      if (!hunter || !other || hunter === other) return false;
      if (other.state === 'grabbed') return false;
      if (other.hp <= 0 && other.type === 'zombie') return false;
      if (hunter.type === 'zombie') return this.isHuman(other) || other.type === 'dummy';
      if (this.isHuman(hunter)) return other.type === 'zombie';
      return false;
    }

    hitMob(attacker, victim, damage, style) {
      if (!victim || victim.state === 'grabbed') return;
      victim.hp -= damage;
      victim.hurtFlash = 8;
      victim.combatTimer = 90;
      attacker.combatTimer = 90;
      attacker.attackTimer = style === 'stomp' ? 14 : 10;
      attacker.attackStyle = style;
      const dir = victim.x >= attacker.x ? 1 : -1;
      const kb = style === 'shove' ? 2.4 : (style === 'stomp' ? 1.2 : 1.5);
      victim.vx += dir * kb;
      victim.vy -= style === 'stomp' ? 0.4 : 0.9;
      if (style === 'shove' || style === 'stomp') {
        victim.state = 'ragdoll';
        victim.ragdollTimer = Math.max(victim.ragdollTimer, style === 'stomp' ? 16 : 14);
        victim.angVel += dir * 0.18;
      }
      if (attacker.type === 'zombie') victim.lastHitBy = 'zombie';
      else if (this.isHuman(attacker)) victim.lastHitBy = 'human';
      else victim.lastHitBy = 'env';

      if (this.mobs.length < 280 || this.rand() < 0.22) {
        const col = attacker.type === 'zombie' ? '#86efac' : (style === 'stomp' ? '#fde68a' : '#fecaca');
        this.spawnSplat((attacker.x + victim.x) * 0.5, (attacker.y + victim.y) * 0.5 - 7, col, 5, 1.5);
      }
    }

    stepCombat() {
      const mobs = this.mobs;
      for (const m of mobs) {
        if (m.attackCooldown > 0) m.attackCooldown--;
        if (m.attackTimer > 0) m.attackTimer--;
        if (m.combatTimer > 0) m.combatTimer--;
      }
      for (let i = 0; i < mobs.length; i++) {
        const a = mobs[i];
        if (a.state === 'grabbed' || a.state === 'ragdoll') continue;
        if (a.burnTimer > 40 || a.shockTimer > 0) continue;
        if (a.attackCooldown > 0) continue;
        if (a.type === 'dummy') continue;

        let target = null, best = 16 * 16;
        const nearby = this.queryMobs(a.x, a.y, 22);
        for (let j = 0; j < nearby.length; j++) {
          const b = nearby[j];
          if (b === a || b.dead) continue;
          if (!this.isPrey(a, b)) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < best) { best = d2; target = b; }
        }
        if (!target) continue;

        const dist = Math.sqrt(best);
        a.facing = target.x >= a.x ? 1 : -1;

        // Jumper stomp: land on a zombie's head
        if (a.type === 'jumper' && a.vy > 0.6 && target.y - a.y > 2 && Math.abs(a.x - target.x) < 10) {
          this.hitMob(a, target, 34, 'stomp');
          a.vy = -2.2;
          a.attackCooldown = 20;
          continue;
        }

        if (dist > 13) continue;

        if (a.type === 'zombie') {
          this.hitMob(a, target, 16, 'bite');
          // Multi-hit bite chain: 3 nips, then a short rest. Infection still only after knockout
          // (or a rare last-gasp chance on a human already near death).
          if (a.biteChain <= 0) a.biteChain = 3;
          a.biteChain--;
          a.attackCooldown = a.biteChain > 0 ? 7 : 26;
          if (this.isHuman(target) && target.hp > 0 && target.hp / target.maxHp < 0.25 && this.rand() < 0.22) {
            this.infectMob(target);
          }
        } else if (a.type === 'jumper') {
          const stomp = a.vy > 0.4 || !a.onGround;
          this.hitMob(a, target, stomp ? 32 : 22, stomp ? 'stomp' : 'kick');
          a.attackCooldown = 22;
        } else {
          // Walker punch or shove
          const shove = this.rand() < 0.28;
          this.hitMob(a, target, shove ? 14 : 22, shove ? 'shove' : 'punch');
          a.attackCooldown = 20;
        }
      }
    }

    updateMobAI(m) {
      if (m.jumpCooldown > 0) m.jumpCooldown--;
      m.aiTimer--;

      if (m.burnTimer > 0) {
        m.vx += m.facing * 0.25;
        m.vx = Math.max(-1.9, Math.min(1.9, m.vx));
        if (m.onGround && m.jumpCooldown <= 0) { m.vy = -2.3; m.jumpCooldown = 16; }
        return;
      }

      // Hunt / fight-back: ghouls chase scouts, hoppers and dummies; humans fight ghouls
      if (m.type === 'zombie' || this.isHuman(m)) {
        const target = this.findPrey(m);
        if (target) {
          m.facing = target.x >= m.x ? 1 : -1;
          const dist = Math.hypot(target.x - m.x, target.y - m.y);
          const cap = m.type === 'jumper' ? 1.45 : (m.type === 'zombie' ? 1.15 : 1.15);
          const accel = dist > 13 ? (m.type === 'zombie' ? 0.2 : 0.18) : 0.07;
          m.vx += m.facing * accel;
          m.vx = Math.max(-cap, Math.min(cap, m.vx));
          m.walkPhase += 0.2;
          if (m.onGround && m.jumpCooldown <= 0) {
            if (target.y < m.y - 10) { m.vy = m.type === 'jumper' ? -3.2 : -2.4; m.jumpCooldown = 24; }
            else if (m.type === 'jumper' && dist < 28 && dist > 12) { m.vy = -3.4; m.jumpCooldown = 20; }
            else this.tryGapJump(m);
          }
          return;
        }
      }

      if (m.type === 'dummy') { m.vx *= 0.85; return; }

      if (m.aiTimer <= 0) {
        m.aiTimer = 35 + this.randInt(75);
        if (this.rand() < 0.45) m.facing *= -1;
      }

      const speedCap = m.type === 'jumper' ? 1.35 : (m.type === 'zombie' ? 1.05 : 0.9);
      m.vx += m.facing * (m.type === 'zombie' ? 0.16 : 0.13);
      m.vx = Math.max(-speedCap, Math.min(speedCap, m.vx));
      m.walkPhase += m.type === 'zombie' ? 0.16 : 0.08;

      if (m.onGround && m.jumpCooldown <= 0) {
        if (m.type === 'jumper') {
          m.vy = -3.1 - this.rand() * 0.8;
          m.jumpCooldown = 18 + this.randInt(20);
        } else {
          this.tryGapJump(m);
        }
      }
    }

    tryGapJump(m) {
      if (!m.onGround || m.jumpCooldown > 0) return false;
      const W = this.width, H = this.height, type = this.type;
      const mx = Math.max(2, Math.min(W - 3, m.x | 0));
      const fy = Math.max(2, Math.min(H - 3, m.y | 0));
      // Must actually be standing on a solid (don't leap from mid-air leftovers)
      if (!isBlocking(type[fy * W + mx]) && !isBlocking(type[Math.min(H - 1, fy + 1) * W + mx])) return false;
      const ax = Math.max(2, Math.min(W - 3, (m.x + m.facing * 5) | 0));
      const ahead = type[fy * W + ax];
      const down = type[Math.min(H - 1, fy + 1) * W + ax];
      const down2 = type[Math.min(H - 1, fy + 2) * W + ax];
      const down3 = type[Math.min(H - 1, fy + 3) * W + ax];
      const gap = !isBlocking(ahead) && !isBlocking(down);
      // Need a ledge to land on so we don't hop into the sky or a bottomless pit
      const landing = isBlocking(down2) || isBlocking(down3) || isBlocking(type[fy * W + Math.max(2, Math.min(W - 3, ax + m.facing * 3))]);
      if (gap && landing) {
        m.vy = m.type === 'jumper' ? -3.2 : -2.55;
        m.jumpCooldown = 20;
        return true;
      }
      return false;
    }

    stepFlashes() {
      for (let i = this.flashes.length - 1; i >= 0; i--) {
        const f = this.flashes[i];
        f.life--;
        f.radius = f.maxRadius * (1 - f.life / f.maxLife);
        if (f.life <= 0) this.flashes.splice(i, 1);
      }
    }

    renderPixels() {
      const size = this.size, W = this.width, H = this.height;
      const type = this.type, life = this.life, variant = this.variant, pixels = this.pixels, tick = this.tick;
      const fluidDens = this.fluidDens, fluidKind = this.fluidKind, fluidPixels = this.fluidPixels;
      const glows = this.glows;
      glows.length = 0;
      fluidDens.fill(0);
      fluidKind.fill(0);
      this.gasCount = 0;
      const quality = this.gfxQuality;
      const gasCap = quality >= 2 ? 800 : (quality >= 1 ? 450 : 220);

      const splat = (idx, kind, amt) => {
        if (idx < 0 || idx >= size) return;
        const nd = fluidDens[idx] + amt;
        fluidDens[idx] = nd > 1023 ? 1023 : nd;
        if (!fluidKind[idx] || amt >= 55) fluidKind[idx] = kind;
      };

      const isMatter = (t) => t !== EL.EMPTY && !isLiquid(t) && !isTransient(t);

      for (let i = 0; i < size; i++) {
        const t = type[i];
        if (t === EL.EMPTY) {
          pixels[i] = 0;
          continue;
        }

        // Liquids go into the metaball field, not the solid buffer
        if (isLiquid(t)) {
          pixels[i] = 0;
          const x = i % W;
          splat(i, t, 230);
          if (x > 0) splat(i - 1, t, 110);
          if (x < W - 1) splat(i + 1, t, 110);
          if (i >= W) splat(i - W, t, 110);
          if (i < size - W) splat(i + W, t, 110);
          if (quality >= 1) {
            if (x > 0 && i >= W) splat(i - W - 1, t, 58);
            if (x < W - 1 && i >= W) splat(i - W + 1, t, 58);
            if (x > 0 && i < size - W) splat(i + W - 1, t, 58);
            if (x < W - 1 && i < size - W) splat(i + W + 1, t, 58);
            if (x > 1) splat(i - 2, t, 28);
            if (x < W - 2) splat(i + 2, t, 28);
            if (i >= W * 2) splat(i - W * 2, t, 28);
            if (i < size - W * 2) splat(i + W * 2, t, 28);
          }
          if (t === EL.LAVA && glows.length < 220 && ((i + tick) & 3) === 0) glows.push(i);
          continue;
        }

        // Gases / energy: collected as soft sprites, transparent in the solid buffer
        if (isTransient(t)) {
          pixels[i] = 0;
          if (this.gasCount < gasCap && ((i + tick) & (quality >= 2 ? 1 : 3)) === 0) {
            const g = this.gasCount++;
            this.gasX[g] = i % W;
            this.gasY[g] = (i / W) | 0;
            this.gasT[g] = t;
            this.gasL[g] = life[i] > 255 ? 255 : life[i];
          }
          continue;
        }

        // Solids & powders: neighbor-shaded, fully opaque
        const v = variant[i], vOff = (v & 31) - 16;
        const x = i % W, y = (i / W) | 0;
        const up = y > 0 && isMatter(type[i - W]);
        const dn = y < H - 1 && isMatter(type[i + W]);
        const lf = x > 0 && isMatter(type[i - 1]);
        const rt = x < W - 1 && isMatter(type[i + 1]);
        let shade = 1;
        if (!up) shade += 0.16;
        else shade -= 0.05;
        if (!lf) shade += 0.07;
        if (!rt) shade -= 0.06;
        if (!dn) shade -= 0.08;
        else shade -= 0.03;
        // cheap AO from covered corners
        if (up && lf) shade -= 0.04;

        let r, g, b;
        switch (t) {
          case EL.SAND:
            r = 228 + vOff; g = 188 + vOff; b = 108 + (vOff >> 1);
            break;
          case EL.SALT: {
            const s = 232 + (v & 15);
            r = s; g = s - 3; b = s - 8;
            break;
          }
          case EL.GUNPOWDER: {
            const c = 70 + (v & 23);
            r = c; g = c + 3; b = c + 10;
            break;
          }
          case EL.SEED:
            r = 152 + (v & 15); g = 124 + (v & 15); b = 68;
            break;
          case EL.SNOW: {
            const c = 230 + (v & 23);
            r = c; g = c + 4; b = 255;
            if (!up) { r = 255; g = 255; b = 255; }
            break;
          }
          case EL.ASH: {
            const a = Math.min(1, life[i] / 120);
            r = (70 + 50 * a); g = (72 + 50 * a); b = (78 + 52 * a);
            // store as semi-transparent ash
            r = r | 0; g = g | 0; b = b | 0;
            pixels[i] = packColor(
              Math.max(0, Math.min(255, (r * shade) | 0)),
              Math.max(0, Math.min(255, (g * shade) | 0)),
              Math.max(0, Math.min(255, (b * shade) | 0)),
              (a * 230) | 0
            );
            continue;
          }
          case EL.STONE: {
            const c = 118 + (v & 31);
            r = c; g = c + 5; b = c + 14;
            break;
          }
          case EL.WOOD: {
            const gr = (y & 3), bb = life[i] < 180 ? 40 : 0;
            r = 136 + gr * 8 + (v & 7) + bb;
            g = 84 + gr * 5 - (bb >> 1);
            b = 46 + gr * 3 - (bb >> 1);
            break;
          }
          case EL.METAL: {
            const sh = (x + y) & 7, zap = life[i] > 0 ? 90 : 0;
            r = 150 + sh * 5 + zap;
            g = 166 + sh * 5 + zap;
            b = 186 + sh * 4 + (zap ? 75 : 0);
            if (!up) { r += 18; g += 18; b += 22; }
            break;
          }
          case EL.ICE: {
            const gl = (v & 15) > 11 ? 28 : 0;
            r = 150 + gl; g = 226 + (gl >> 1); b = 255;
            if (!up) { r = 230; g = 250; b = 255; }
            pixels[i] = packColor(
              Math.max(0, Math.min(255, (r * shade) | 0)),
              Math.max(0, Math.min(255, (g * shade) | 0)),
              Math.max(0, Math.min(255, (b * shade) | 0)),
              220
            );
            continue;
          }
          case EL.GLASS: {
            const ed = (v & 7) === 0 ? 24 : 0;
            r = 150 + ed; g = 210 + ed; b = 236 + ed;
            if (!up) { r += 20; g += 16; b += 10; }
            pixels[i] = packColor(
              Math.max(0, Math.min(255, (r * shade) | 0)),
              Math.max(0, Math.min(255, (g * shade) | 0)),
              Math.max(0, Math.min(255, (b * shade) | 0)),
              200
            );
            continue;
          }
          case EL.PLANT: {
            const lf = v & 31, brn = life[i] < 70 ? 60 : 0;
            r = 36 + lf + brn; g = Math.max(40, 168 + (lf >> 1) - brn); b = 68;
            break;
          }
          case EL.TNT: {
            const st = (y & 3) === 0 || ((x + y) & 7) === 0;
            if (st) { r = 245; g = 235; b = 225; }
            else { r = 225; g = 48; b = 42; }
            break;
          }
          default:
            r = 160; g = 160; b = 160;
        }

        pixels[i] = packColor(
          Math.max(0, Math.min(255, (r * shade) | 0)),
          Math.max(0, Math.min(255, (g * shade) | 0)),
          Math.max(0, Math.min(255, (b * shade) | 0)),
          255
        );
      }

      // Soften liquid density (metaball-style), optionally twice at high quality
      const blurFluid = () => {
        const tmp = this.fluidTmp;
        for (let y = 0; y < H; y++) {
          const row = y * W;
          for (let x = 0; x < W; x++) {
            const i = row + x;
            const l = x > 0 ? fluidDens[i - 1] : fluidDens[i];
            const r = x < W - 1 ? fluidDens[i + 1] : fluidDens[i];
            tmp[i] = (l + fluidDens[i] * 2 + r) >> 2;
          }
        }
        for (let x = 0; x < W; x++) {
          for (let y = 0; y < H; y++) {
            const i = y * W + x;
            const u = y > 0 ? tmp[i - W] : tmp[i];
            const d = y < H - 1 ? tmp[i + W] : tmp[i];
            fluidDens[i] = (u + tmp[i] * 2 + d) >> 2;
          }
        }
      };
      if (quality >= 1) blurFluid();
      if (quality >= 2) blurFluid();

      const LO = quality >= 1 ? 32 : 22;
      const HI = quality >= 1 ? 120 : 80;
      const SPAN = HI - LO;
      for (let i = 0; i < size; i++) {
        const d = fluidDens[i];
        if (d <= LO) {
          fluidPixels[i] = 0;
          continue;
        }
        const k = fluidKind[i];
        const y = (i / W) | 0;
        const up = y > 0 ? fluidDens[i - W] : 0;
        const t = d >= HI ? 1 : (d - LO) / SPAN;
        let a = Math.round(240 * (t * t * (3 - 2 * t))); // smoothstep
        if (a < 1) { fluidPixels[i] = 0; continue; }
        const rim = Math.max(0, Math.min(1, (d - up) / 160));
        const deep = Math.max(0, Math.min(1, (up - HI) / 200));
        let r, g, b;
        switch (k) {
          case EL.SALTWATER:
            r = 36 + rim * 70 - deep * 10; g = 170 + rim * 30 - deep * 20; b = 210 + rim * 20 - deep * 8;
            break;
          case EL.OIL:
            r = 88 + rim * 50; g = 52 + rim * 40; b = 20 + rim * 22;
            break;
          case EL.LAVA: {
            const pulse = ((i + tick * 3) & 63) > 40;
            r = (pulse ? 255 : 236);
            g = (pulse ? 170 : 78) + rim * 40;
            b = (pulse ? 60 : 16) + rim * 40;
            a = Math.max(a, 230);
            break;
          }
          case EL.ACID:
            r = 90 + ((tick + i) & 31) + rim * 50;
            g = 230 + rim * 15;
            b = 70 + rim * 50;
            break;
          default: // water
            r = 24 + rim * 70 - deep * 8;
            g = 118 + rim * 45 - deep * 22;
            b = 214 + rim * 16 - deep * 18;
            break;
        }
        fluidPixels[i] = packColor(
          Math.max(0, Math.min(255, r | 0)),
          Math.max(0, Math.min(255, g | 0)),
          Math.max(0, Math.min(255, b | 0)),
          a
        );
      }
      this.renderPretty();
    }

    renderPretty() {
      const quality = this.gfxQuality;
      if (quality < 1) {
        this.hiReady = false;
        return;
      }
      const W = this.width, H = this.height, size = this.size;
      const HS = 2, hW = W * HS, hH = H * HS, hSize = hW * hH;
      if (this.hiW !== hW) {
        this.hiW = hW; this.hiH = hH; this.hiSize = hSize;
        this.hiSolid = new Uint32Array(hSize);
        this.hiFluid = new Uint32Array(hSize);
      }
      const type = this.type, pixels = this.pixels, tick = this.tick;
      const fluidDens = this.fluidDens, fluidKind = this.fluidKind;
      const occ = this.occ, lightR = this.lightR, lightG = this.lightG, lightB = this.lightB;
      const hiSolid = this.hiSolid, hiFluid = this.hiFluid;
      hiSolid.fill(0);
      hiFluid.fill(0);

      for (let i = 0; i < size; i++) {
        const t = type[i];
        occ[i] = (t !== 0 && t < 19 && (t <= 6 || t >= 12)) ? 255 : 0;
      }

      lightR.fill(0); lightG.fill(0); lightB.fill(0);
      const addLight = (cx, cy, pr, pg, pb, rad) => {
        const R = rad | 0, R2 = R * R;
        for (let dy = -R; dy <= R; dy++) {
          const yy = cy + dy;
          if ((yy >>> 0) >= H) continue;
          const dy2 = dy * dy, row = yy * W;
          for (let dx = -R; dx <= R; dx++) {
            const d2 = dx * dx + dy2;
            if (d2 > R2) continue;
            const xx = cx + dx;
            if ((xx >>> 0) >= W) continue;
            const fall = 1 - d2 / R2;
            const w = (fall * fall * 256) | 0;
            const j = row + xx;
            const nr = lightR[j] + ((pr * w) >> 8);
            const ng = lightG[j] + ((pg * w) >> 8);
            const nb = lightB[j] + ((pb * w) >> 8);
            lightR[j] = nr > 4000 ? 4000 : nr;
            lightG[j] = ng > 4000 ? 4000 : ng;
            lightB[j] = nb > 4000 ? 4000 : nb;
          }
        }
      };
      const liteStep = quality >= 2 ? 1 : 2;
      for (let i = 0; i < size; i += liteStep) {
        const t = type[i];
        if (t === EL.LAVA) addLight(i % W, (i / W) | 0, 255, 110, 30, 7);
        else if (t === EL.FIRE) addLight(i % W, (i / W) | 0, 255, 150, 40, 6);
        else if (t === EL.EMBER) addLight(i % W, (i / W) | 0, 255, 120, 30, 4);
      }
      const flashes = this.flashes;
      for (let f = 0; f < flashes.length; f++) {
        const fl = flashes[f];
        addLight(fl.x | 0, fl.y | 0, 255, 210, 90, Math.max(6, (fl.radius * 0.35) | 0));
      }

      // Padded occupancy / density / color to skip per-sample bounds checks
      const pW = W + 2;
      if (!this._padOcc || this._padW !== pW) {
        this._padW = pW;
        this._padOcc = new Uint8Array((H + 2) * pW);
        this._padDens = new Uint16Array((H + 2) * pW);
        this._padKind = new Uint8Array((H + 2) * pW);
        this._padPix = new Uint32Array((H + 2) * pW);
        this._padLR = new Uint16Array((H + 2) * pW);
        this._padLG = new Uint16Array((H + 2) * pW);
        this._padLB = new Uint16Array((H + 2) * pW);
        this._active = new Uint8Array(size);
      }
      const pOcc = this._padOcc, pDens = this._padDens, pKind = this._padKind, pPix = this._padPix;
      const pLR = this._padLR, pLG = this._padLG, pLB = this._padLB, active = this._active;
      pOcc.fill(0); pDens.fill(0); pKind.fill(0); pPix.fill(0); pLR.fill(0); pLG.fill(0); pLB.fill(0);
      active.fill(0);
      for (let y = 0; y < H; y++) {
        const s = y * W, d = (y + 1) * pW + 1;
        for (let x = 0; x < W; x++) {
          const i = s + x, j = d + x;
          pOcc[j] = occ[i];
          pDens[j] = fluidDens[i];
          pKind[j] = fluidKind[i];
          pPix[j] = pixels[i];
          pLR[j] = lightR[i];
          pLG[j] = lightG[i];
          pLB[j] = lightB[i];
        }
      }
      for (let y = 0; y < H; y++) {
        const s = y * W;
        for (let x = 0; x < W; x++) {
          const i = s + x;
          if (occ[i] | fluidDens[i]) {
            active[i] = 1;
            if (x > 0) active[i - 1] = 1;
            if (x < W - 1) active[i + 1] = 1;
            if (y > 0) active[i - W] = 1;
            if (y < H - 1) active[i + W] = 1;
          }
        }
      }

      const doWaves = quality >= 2;
      const lerp = (a, b, t) => a + (b - a) * t;

      for (let y = 0; y < H; y++) {
        const s = y * W;
        for (let x = 0; x < W; x++) {
          if (!active[s + x]) continue;
          for (let oy = 0; oy < 2; oy++) {
            const sy = y * 2 + oy;
            const fy = (sy + 0.5) * 0.5;
            const iy = fy + 0.5; // +0.5 because pad has a 1-cell border; cell (0,0) lives at pad (1,1)
            // Wait: pad index for cell (x,y) is (y+1)*pW+(x+1).
            // We want bilinear of cell centers. Cell-center space: ix = fx - 0.5, then sample floor(ix).
            const iy0 = fy - 0.5;
            const y0 = iy0 | 0;
            const dty = iy0 - y0;
            const py0 = y0 + 1; // pad row
            const row = sy * hW;
            for (let ox = 0; ox < 2; ox++) {
              const sx = x * 2 + ox;
              const fx = (sx + 0.5) * 0.5;
              const ix0 = fx - 0.5;
              const x0 = ix0 | 0;
              const dtx = ix0 - x0;
              const px0 = x0 + 1;
              const i00 = py0 * pW + px0;
              const i10 = i00 + 1;
              const i01 = i00 + pW;
              const i11 = i01 + 1;

              const o00 = pOcc[i00], o10 = pOcc[i10], o01 = pOcc[i01], o11 = pOcc[i11];
              const j = row + sx;
              const i00u = i00 - pW, i10u = i10 - pW, i01u = i01 - pW, i11u = i11 - pW;

              // Interior solid: skip contour math, just light the already-shaded cell color
              if ((o00 & o10 & o01 & o11) === 255) {
                const px = pPix[i00];
                let r = px & 255, g = (px >> 8) & 255, b = (px >> 16) & 255, a = (px >>> 24) & 255;
                const lr = pLR[i00], lg = pLG[i00], lb = pLB[i00];
                r += lr * 0.22; g += lg * 0.22; b += lb * 0.22;
                hiSolid[j] = packColor(
                  r > 255 ? 255 : r | 0,
                  g > 255 ? 255 : g | 0,
                  b > 255 ? 255 : b | 0,
                  a || 255
                );
                continue;
              }

              const o = lerp(lerp(o00, o10, dtx), lerp(o01, o11, dtx), dty);
              const sh = lerp(lerp(pOcc[i00u], pOcc[i10u], dtx), lerp(pOcc[i01u], pOcc[i11u], dtx), dty);

              if (o >= 16) {
                let wr = 0, wg = 0, wb = 0, wa = 0, wt = 0;
                const acc = (px, w) => {
                  if (px && w > 0) {
                    wt += w;
                    wr += (px & 255) * w;
                    wg += ((px >> 8) & 255) * w;
                    wb += ((px >> 16) & 255) * w;
                    wa += ((px >>> 24) & 255) * w;
                  }
                };
                acc(pPix[i00], o00 * (1 - dtx) * (1 - dty));
                acc(pPix[i10], o10 * dtx * (1 - dty));
                acc(pPix[i01], o01 * (1 - dtx) * dty);
                acc(pPix[i11], o11 * dtx * dty);
                if (wt >= 1) {
                  let r = wr / wt, g = wg / wt, b = wb / wt, a = wa / wt;
                  const t = o / 255;
                  const cover = t < 0.28 ? 0 : (t > 0.78 ? 1 : (t - 0.28) / 0.5);
                  const sm = cover * cover * (3 - 2 * cover);
                  a *= sm;
                  if (a >= 2) {
                    const or = lerp(lerp(pOcc[i00 + 1], pOcc[i10 + 1], dtx), lerp(pOcc[i01 + 1], pOcc[i11 + 1], dtx), dty);
                    const od = lerp(lerp(pOcc[i00 + pW], pOcc[i10 + pW], dtx), lerp(pOcc[i01 + pW], pOcc[i11 + pW], dtx), dty);
                    const gx = or - o, gy = od - o;
                    const rim = Math.max(0, (-gx - gy * 1.2) / 220);
                    const ao = Math.max(0, gy / 260);
                    r += rim * 48 - ao * 28;
                    g += rim * 44 - ao * 28;
                    b += rim * 40 - ao * 24;
                    const lr = lerp(lerp(pLR[i00], pLR[i10], dtx), lerp(pLR[i01], pLR[i11], dtx), dty);
                    const lg = lerp(lerp(pLG[i00], pLG[i10], dtx), lerp(pLG[i01], pLG[i11], dtx), dty);
                    const lb = lerp(lerp(pLB[i00], pLB[i10], dtx), lerp(pLB[i01], pLB[i11], dtx), dty);
                    r += lr * 0.22; g += lg * 0.22; b += lb * 0.22;
                    hiSolid[j] = packColor(
                      r < 0 ? 0 : (r > 255 ? 255 : r | 0),
                      g < 0 ? 0 : (g > 255 ? 255 : g | 0),
                      b < 0 ? 0 : (b > 255 ? 255 : b | 0),
                      a > 255 ? 255 : a | 0
                    );
                  }
                }
              } else if (sh > 24) {
                const sa = (sh * 0.32) | 0;
                hiSolid[j] = packColor(4, 6, 10, sa > 110 ? 110 : sa);
              }

              let sfx = fx, sfy = fy;
              const dPeek = pDens[i00];
              if (dPeek > 0 || pDens[i10] | pDens[i01] | pDens[i11]) {
                if (doWaves) {
                  const kPeek = pKind[i00] || pKind[i10] || pKind[i01] || pKind[i11];
                  if (kPeek === EL.LAVA) {
                    sfx += Math.sin(fy * 1.6 + tick * 0.28) * 0.22;
                    sfy += Math.cos(fx * 1.3 + tick * 0.2) * 0.16;
                  } else if (kPeek === EL.WATER || kPeek === EL.SALTWATER || kPeek === EL.ACID || kPeek === EL.OIL) {
                    if (pDens[i00u] < 180) {
                      sfy += Math.sin(fx * 0.55 + tick * 0.12) * 0.32 + Math.sin(fx * 0.17 + tick * 0.07) * 0.18;
                    }
                  }
                }
                const dix = sfx - 0.5, diy = sfy - 0.5;
                const dx0 = dix | 0, dy0 = diy | 0;
                const ftx = dix - dx0, fty = diy - dy0;
                const fi00 = (dy0 + 1) * pW + (dx0 + 1);
                const fi10 = fi00 + 1, fi01 = fi00 + pW, fi11 = fi01 + 1;
                const d = lerp(lerp(pDens[fi00], pDens[fi10], ftx), lerp(pDens[fi01], pDens[fi11], ftx), fty);
                if (d > 28) {
                  const LO = 28, HI = 120, SPAN = HI - LO;
                  const tt = d >= HI ? 1 : (d - LO) / SPAN;
                  let a = (240 * (tt * tt * (3 - 2 * tt))) | 0;
                  let bestK = pKind[fi00], bestD = pDens[fi00];
                  if (pDens[fi10] > bestD) { bestD = pDens[fi10]; bestK = pKind[fi10]; }
                  if (pDens[fi01] > bestD) { bestD = pDens[fi01]; bestK = pKind[fi01]; }
                  if (pDens[fi11] > bestD) { bestD = pDens[fi11]; bestK = pKind[fi11]; }
                  const up = lerp(lerp(pDens[fi00 - pW], pDens[fi10 - pW], ftx), lerp(pDens[fi00], pDens[fi10], ftx), fty);
                  const dn = lerp(lerp(pDens[fi01], pDens[fi11], ftx), lerp(pDens[fi01 + pW], pDens[fi11 + pW], ftx), fty);
                  const lf = lerp(lerp(pDens[fi00 - 1], pDens[fi00], ftx), lerp(pDens[fi01 - 1], pDens[fi01], ftx), fty);
                  const rt = lerp(lerp(pDens[fi10], pDens[fi10 + 1], ftx), lerp(pDens[fi11], pDens[fi11 + 1], ftx), fty);
                  const ngx = rt - lf, ngy = dn - up;
                  const nlen = Math.sqrt(ngx * ngx + ngy * ngy) + 0.001;
                  let spec = Math.max(0, (-ngx / nlen) * 0.35 + (-ngy / nlen) * 0.9); spec = spec * spec; spec = spec * spec; spec = spec * spec * spec;
                  const rim = Math.max(0, Math.min(1, (d - up) / 160));
                  const deep = Math.max(0, Math.min(1, (up - HI) / 200));
                  let r, g, b;
                  switch (bestK) {
                    case EL.SALTWATER:
                      r = 36 + rim * 70 - deep * 10; g = 170 + rim * 30 - deep * 20; b = 210 + rim * 20 - deep * 8;
                      break;
                    case EL.OIL:
                      r = 88 + rim * 50; g = 52 + rim * 40; b = 20 + rim * 22;
                      break;
                    case EL.LAVA: {
                      const pulse = ((sx + sy + tick * 3) & 63) > 40;
                      r = pulse ? 255 : 236;
                      g = (pulse ? 170 : 78) + rim * 40;
                      b = (pulse ? 60 : 16) + rim * 40;
                      a = a < 230 ? 230 : a;
                      break;
                    }
                    case EL.ACID:
                      r = 90 + ((tick + sx) & 31) + rim * 50; g = 230 + rim * 15; b = 70 + rim * 50;
                      break;
                    default:
                      r = 24 + rim * 70 - deep * 8;
                      g = 118 + rim * 45 - deep * 22;
                      b = 214 + rim * 16 - deep * 18;
                  }
                  r += spec * 210; g += spec * 220; b += spec * 230;
                  const lr = lerp(lerp(pLR[fi00], pLR[fi10], ftx), lerp(pLR[fi01], pLR[fi11], ftx), fty);
                  r += lr * 0.12; g += lerp(lerp(pLG[fi00], pLG[fi10], ftx), lerp(pLG[fi01], pLG[fi11], ftx), fty) * 0.1;
                  hiFluid[j] = packColor(
                    r < 0 ? 0 : (r > 255 ? 255 : r | 0),
                    g < 0 ? 0 : (g > 255 ? 255 : g | 0),
                    b < 0 ? 0 : (b > 255 ? 255 : b | 0),
                    a > 255 ? 255 : a
                  );
                }
              }
            }
          }
        }
      }
      this.hiReady = true;
    }

    countByType() {
      const counts = new Uint32Array(25);
      for (let i = 0; i < this.size; i++) counts[this.type[i]]++;
      return counts;
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandEngine, EL, EL_META, isTransient, isSolid, isPowder, isLiquid };
  } else {
    root.SandForge = { SandEngine, EL, EL_META, isTransient, isSolid, isPowder, isLiquid };
  }
})(typeof window !== 'undefined' ? window : globalThis);
