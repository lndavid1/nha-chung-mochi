import { useSyncExternalStore } from 'react';

/**
 * SOUND ENGINE — Cozy Soft Acoustic (Web Audio API thuần, 0 file âm thanh)
 * - Chỉ dùng sine / triangle qua low-pass ấm + đường bao ADSR, thang ngũ cung C Major
 * - iOS Safari: auto-unlock ở lần chạm đầu, suspend khi ẩn app / khóa máy
 * - Mọi lời gọi play() đều an toàn (không bao giờ ném lỗi)
 */

const STORAGE_KEY = 'mochi_sound_settings_v1';
const DEFAULTS = {
  bgmEnabled: true,
  bgmVolume: 0.35,
  sfxEnabled: true,
  sfxVolume: 0.75,
  muted: false,
  bgmMode: 'auto' // 'auto' | 'day' | 'night' | 'off'
};

const VOICE_CAP = 56;
const CROSSFADE_SEC = 1.2;

// ---------- Trạng thái nội bộ ----------
let ctx = null;
let master = null;
let comp = null;
let bgmBus = null;
let sfxBus = null;
let noiseBuf = null;
let voices = 0;
let volMul = 1;
let timer = null;
let curTrackName = null;
let tracks = [];
let hiddenNow = false;
let unlockBound = false;
let gameState = { isNight: false, isArcade: false };
const lastPlayed = {};
const listeners = new Set();

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { ...DEFAULTS };
}

let settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

// ---------- Thang âm ngũ cung C Major ----------
const PENT = [0, 2, 4, 7, 9];
function pent(i, base = 261.63) {
  const oct = Math.floor(i / 5);
  const off = PENT[((i % 5) + 5) % 5] + 12 * oct;
  return base * Math.pow(2, off / 12);
}
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- AudioContext lười + Unlock iOS ----------
function ensureCtx() {
  if (ctx) return ctx;
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC({ latencyHint: 'interactive' });
  } catch {
    try {
      ctx = new AC();
    } catch {
      ctx = null;
      return null;
    }
  }

  master = ctx.createGain();
  comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 24;
  comp.ratio.value = 6;
  comp.attack.value = 0.004;
  comp.release.value = 0.22;
  bgmBus = ctx.createGain();
  sfxBus = ctx.createGain();
  bgmBus.connect(master);
  sfxBus.connect(master);
  master.connect(comp);
  comp.connect(ctx.destination);

  // Noise buffer dùng chung (1.5s)
  const len = Math.floor(ctx.sampleRate * 1.5);
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  ctx.onstatechange = () => {
    if (ctx && ctx.state === 'running') {
      removeUnlockListeners();
      syncBgm();
    }
  };

  applyVolumes(true);
  return ctx;
}

const UNLOCK_EVENTS = ['touchstart', 'pointerdown', 'keydown'];

function unlock() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state !== 'running' && !hiddenNow) {
    c.resume().catch(() => {});
  }
  try {
    const b = c.createBuffer(1, 1, 22050);
    const s = c.createBufferSource();
    s.buffer = b;
    s.connect(c.destination);
    s.start(0);
  } catch {
    // ignore
  }
  if (c.state === 'running') {
    removeUnlockListeners();
    syncBgm();
  }
}

function removeUnlockListeners() {
  if (!unlockBound) return;
  unlockBound = false;
  UNLOCK_EVENTS.forEach((ev) => window.removeEventListener(ev, unlock, true));
}

function bindUnlockListeners() {
  if (unlockBound || typeof window === 'undefined') return;
  unlockBound = true;
  UNLOCK_EVENTS.forEach((ev) =>
    window.addEventListener(ev, unlock, { capture: true, passive: true })
  );
}

// ---------- Âm lượng ----------
function applyVolumes(immediate = false) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const set = (param, v) => {
    param.cancelScheduledValues(now);
    if (immediate) param.setValueAtTime(v, now);
    else param.setTargetAtTime(v, now, 0.05);
  };
  set(master.gain, settings.muted ? 0 : 1);
  set(bgmBus.gain, settings.bgmEnabled ? settings.bgmVolume : 0);
  set(sfxBus.gain, settings.sfxEnabled ? settings.sfxVolume : 0);
}

// ---------- Voice primitives (tự stop + disconnect) ----------
function tone(t, o) {
  if (!ctx) return;
  const isSfx = !o.dest;
  if (isSfx) {
    if (voices >= VOICE_CAP) return;
    voices++;
  }
  const dur = o.dur || 0.2;
  const a = Math.min(o.a ?? 0.006, dur * 0.6);
  const vol = Math.max(0.0002, (o.vol ?? 0.25) * (isSfx ? volMul : 1));

  const osc = ctx.createOscillator();
  osc.type = o.type || 'sine';
  const filt = ctx.createBiquadFilter();
  filt.type = o.ft || 'lowpass';
  filt.frequency.value = o.lp || 2600;
  filt.Q.value = o.q || 0.7;
  const g = ctx.createGain();

  if (o.glide && o.glide.length) {
    osc.frequency.setValueAtTime(o.glide[0][1], t);
    for (let i = 1; i < o.glide.length; i++) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, o.glide[i][1]),
        t + o.glide[i][0] * dur
      );
    }
  } else {
    osc.frequency.setValueAtTime(Math.max(20, o.f || 440), t);
  }

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  if (o.hold) g.gain.setValueAtTime(vol, t + a + o.hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(filt);
  filt.connect(g);
  g.connect(o.dest || sfxBus);
  osc.start(t);
  osc.stop(t + dur + 0.03);
  osc.onended = () => {
    try {
      osc.disconnect();
      filt.disconnect();
      g.disconnect();
    } catch {
      // ignore
    }
    if (isSfx) voices--;
  };
}

function noise(t, o) {
  if (!ctx || !noiseBuf) return;
  const isSfx = !o.dest;
  if (isSfx) {
    if (voices >= VOICE_CAP) return;
    voices++;
  }
  const dur = o.dur || 0.1;
  const a = Math.min(o.a ?? 0.004, dur * 0.6);
  const vol = Math.max(0.0002, (o.vol ?? 0.1) * (isSfx ? volMul : 1));

  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const filt = ctx.createBiquadFilter();
  filt.type = o.ft || 'bandpass';
  filt.frequency.setValueAtTime(o.fc || 2000, t);
  if (o.fc2) filt.frequency.exponentialRampToValueAtTime(o.fc2, t + dur);
  filt.Q.value = o.q || 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(filt);
  filt.connect(g);
  g.connect(o.dest || sfxBus);
  src.start(t, Math.random() * 0.8, dur + 0.05);
  src.onended = () => {
    try {
      src.disconnect();
      filt.disconnect();
      g.disconnect();
    } catch {
      // ignore
    }
    if (isSfx) voices--;
  };
}

// ---------- Thư viện SFX ----------
const chime = (t, f, vol = 0.18, dur = 0.5) => {
  tone(t, { f, dur, vol, a: 0.004, lp: 4200 });
  tone(t, { f: f * 2.01, dur: dur * 0.45, vol: vol * 0.28, a: 0.003, lp: 5000 });
};
const arp = (t, freqs, gap, o = {}) =>
  freqs.forEach((f, i) =>
    tone(t + i * gap, {
      f,
      dur: o.dur || 0.45,
      vol: o.vol || 0.15,
      type: o.type || 'triangle',
      lp: o.lp || 3200,
      a: 0.006
    })
  );

const SFX = {
  // ---- UI ----
  tap: (t) => {
    tone(t, { glide: [[0, 330], [1, 190]], dur: 0.05, type: 'triangle', vol: 0.26, lp: 1500 });
    noise(t, { dur: 0.02, fc: 1500, q: 1, vol: 0.07 });
  },
  sheetOpen: (t) => {
    tone(t, { glide: [[0, 330], [1, 640]], dur: 0.22, type: 'triangle', vol: 0.14, lp: 1700, a: 0.03 });
    noise(t, { dur: 0.2, fc: 600, fc2: 2200, q: 0.6, vol: 0.04, a: 0.05 });
  },
  sheetClose: (t) => {
    tone(t, { glide: [[0, 600], [1, 300]], dur: 0.2, type: 'triangle', vol: 0.12, lp: 1600, a: 0.02 });
    noise(t, { dur: 0.18, fc: 2000, fc2: 600, q: 0.6, vol: 0.035, a: 0.03 });
  },
  coin: (t) => {
    chime(t, 1318.5, 0.17, 0.16);
    chime(t + 0.07, 1760, 0.17, 0.4);
  },
  buy: (t) => {
    chime(t, 880, 0.17, 0.8);
    chime(t + 0.05, 1318.5, 0.1, 0.7);
    chime(t + 0.2, 1568, 0.14, 0.2);
    chime(t + 0.29, 1760, 0.14, 0.3);
  },
  error: (t) => {
    tone(t, { glide: [[0, 200], [1, 110]], dur: 0.22, vol: 0.3, lp: 500, a: 0.01 });
  },
  nudge: (t) => {
    [1046.5, 1318.5, 1568, 1760, 2093].forEach((f, i) =>
      chime(t + i * 0.1 + rnd(0, 0.02), f, 0.11, 1.0)
    );
  },

  // ---- Căn phòng ----
  lightSwitch: (t) => {
    noise(t, { dur: 0.02, fc: 3000, q: 3, vol: 0.22 });
    tone(t, { glide: [[0, 1300], [1, 700]], dur: 0.035, type: 'triangle', vol: 0.12, lp: 3000 });
    noise(t + 0.06, { dur: 0.015, fc: 2200, q: 3, vol: 0.14 });
  },
  plantWiggle: (t) => {
    for (let i = 0; i < 3; i++) {
      noise(t + i * 0.07, {
        dur: 0.1,
        fc: rnd(3000, 4500),
        fc2: rnd(4500, 6000),
        q: 0.7,
        vol: 0.07,
        a: 0.02
      });
    }
    tone(t, { glide: [[0, 420], [1, 520]], dur: 0.2, vol: 0.05, lp: 900, a: 0.03 });
  },
  vinyl: (t) => {
    for (let i = 0; i < 7; i++) {
      noise(t + rnd(0, 0.5), { dur: 0.012, fc: rnd(4500, 7000), q: 2, vol: 0.05 });
    }
    [293.7, 349.2, 523.3].forEach((f, i) =>
      tone(t + 0.18 + i * 0.02, { f, dur: 1.3, vol: 0.09, type: 'triangle', lp: 1500, a: 0.04 })
    );
  },
  teaSteam: (t) => {
    noise(t, { dur: 0.9, fc: 4500, fc2: 2500, q: 0.8, vol: 0.06, a: 0.25 });
  },
  sparkle: (t) => {
    for (let i = 0; i < 4; i++) {
      chime(t + i * 0.055, pent(10 + Math.floor(rnd(0, 5)), 261.63), 0.09, 0.35);
    }
  },
  paper: (t) => {
    for (let i = 0; i < 3; i++) {
      noise(t + i * rnd(0.05, 0.09), {
        dur: rnd(0.04, 0.08),
        fc: rnd(2200, 3200),
        q: 0.5,
        vol: 0.09
      });
    }
  },
  shutter: (t) => {
    noise(t, { dur: 0.03, fc: 2200, q: 2, vol: 0.2 });
    tone(t, { glide: [[0, 900], [1, 400]], dur: 0.05, type: 'triangle', vol: 0.1, lp: 2000 });
    noise(t + 0.07, { dur: 0.03, fc: 1700, q: 2, vol: 0.16 });
  },
  giftOpen: (t) => {
    noise(t, { dur: 0.12, fc: 1500, fc2: 4000, q: 0.6, vol: 0.2 });
    arp(t + 0.04, [523.25, 659.25, 783.99, 1046.5], 0.07, { vol: 0.16, dur: 0.4 });
    [523.25, 659.25, 783.99].forEach((f) =>
      tone(t + 0.32, { f, dur: 1.2, vol: 0.08, lp: 2200, a: 0.02 })
    );
    for (let i = 0; i < 4; i++) chime(t + 0.35 + i * 0.07, pent(11 + (i % 5)), 0.07, 0.4);
  },

  // ---- Thú cưng ----
  petPat: (t, o) => {
    const ci = Math.min(o.comboIndex || 0, 9);
    const f = pent(3 + ci);
    tone(t, { glide: [[0, f * 1.25], [1, f]], dur: 0.13, vol: 0.26, lp: 1500, a: 0.01 });
    tone(t + 0.06, { f: f * 2, dur: 0.2, vol: 0.07, lp: 3000 });
  },
  petVoice: (t, o) => {
    const sp = o.species || 'cat';
    if (sp === 'corgi' || sp === 'dog') {
      tone(t, { glide: [[0, 430], [0.25, 310], [1, 200]], dur: 0.15, type: 'triangle', vol: 0.4, lp: 1100, a: 0.008 });
      noise(t, { dur: 0.05, fc: 900, q: 0.9, vol: 0.09 });
    } else if (sp === 'rabbit') {
      tone(t, { glide: [[0, 1800], [0.5, 2400], [1, 2000]], dur: 0.09, vol: 0.13, lp: 4000 });
      tone(t + 0.12, { glide: [[0, 2000], [0.5, 2600], [1, 2200]], dur: 0.09, vol: 0.12, lp: 4000 });
    } else {
      tone(t, {
        glide: [[0, 560], [0.35, 900], [1, 620]],
        dur: 0.3,
        type: 'triangle',
        vol: 0.42,
        ft: 'bandpass',
        lp: 1500,
        q: 1.1,
        a: 0.03
      });
    }
  },
  eat: (t) => {
    [0, 0.14, 0.28].forEach((d) => {
      noise(t + d, { dur: 0.07, fc: 900, q: 1.2, vol: 0.2 });
      tone(t + d, { glide: [[0, 210], [1, 140]], dur: 0.06, type: 'triangle', vol: 0.14, lp: 800 });
    });
    tone(t + 0.46, { glide: [[0, 784], [1, 1046]], dur: 0.3, vol: 0.13, lp: 2500, a: 0.02 });
  },
  bath: (t) => {
    for (let i = 0; i < 5; i++) {
      const f = rnd(400, 900);
      tone(t + i * 0.09 + rnd(0, 0.03), {
        glide: [[0, f], [1, f * 1.6]],
        dur: 0.09,
        vol: 0.15,
        lp: 2500
      });
    }
  },
  sleep: (t) => {
    tone(t, { glide: [[0, 330], [0.4, 420], [1, 200]], dur: 1.0, vol: 0.12, lp: 900, a: 0.25 });
    noise(t, { dur: 1.2, fc: 900, q: 0.5, vol: 0.045, a: 0.4 });
  },
  typeBlip: (t) => {
    tone(t, { f: rnd(620, 880), dur: 0.045, vol: 0.15, lp: 2200, a: 0.004 });
  },

  // ---- Mini-game chung ----
  win: (t) => {
    arp(t, [523.25, 659.25, 783.99, 1046.5, 1318.5], 0.1, { vol: 0.16, dur: 0.5 });
    [523.25, 659.25, 783.99, 1046.5].forEach((f) =>
      tone(t + 0.5, { f, dur: 1.2, vol: 0.07, lp: 2400, a: 0.02 })
    );
  },
  lose: (t) => {
    [392, 330, 262].forEach((f, i) =>
      tone(t + i * 0.18, { f, dur: 0.5, vol: 0.2, lp: 900, a: 0.01 })
    );
  },

  // ---- Hứng Bánh ----
  catchGood: (t, o) => {
    const f = pent(3 + Math.min(o.comboIndex || 0, 9));
    chime(t, f, 0.2, 0.2);
  },
  catchSpecial: (t) => {
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => chime(t + i * 0.04, f, 0.12, 0.6));
  },
  catchBad: (t) => {
    tone(t, { glide: [[0, 200], [0.3, 130], [0.6, 190], [1, 100]], dur: 0.4, vol: 0.3, lp: 700 });
  },
  fever: (t) => {
    arp(t, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => pent(5 + i)), 0.06, { vol: 0.15, dur: 0.3 });
  },

  // ---- Caro ----
  caroP1: (t) => {
    tone(t, { glide: [[0, 430], [1, 300]], dur: 0.1, type: 'triangle', vol: 0.3, lp: 1400 });
    noise(t, { dur: 0.02, fc: 1800, q: 1, vol: 0.08 });
  },
  caroP2: (t) => {
    tone(t, { glide: [[0, 330], [1, 235]], dur: 0.1, type: 'triangle', vol: 0.3, lp: 1100 });
    noise(t, { dur: 0.02, fc: 1300, q: 1, vol: 0.08 });
  },
  caroFade: (t) => {
    tone(t, { glide: [[0, 800], [1, 300]], dur: 0.5, vol: 0.1, lp: 1800, a: 0.05 });
    noise(t, { dur: 0.3, fc: 3000, fc2: 1500, q: 0.6, vol: 0.03, a: 0.05 });
  },

  // ---- Bắt sóng ----
  dialTick: (t) => {
    tone(t, { glide: [[0, 2200], [1, 1600]], dur: 0.02, type: 'triangle', vol: 0.1, lp: 4000, a: 0.002 });
  },
  waveSend: (t) => {
    tone(t, { f: 440, dur: 1.2, vol: 0.12, lp: 1500, a: 0.05 });
    tone(t + 0.2, { f: 659.25, dur: 1.0, vol: 0.08, lp: 1800, a: 0.05 });
  },
  bullseye: (t) => {
    SFX.win(t);
    for (let i = 0; i < 5; i++) chime(t + 0.2 + i * 0.07, pent(11 + i), 0.08, 0.4);
  },
  nearMiss: (t) => {
    chime(t, 523.25, 0.15, 0.4);
    chime(t + 0.11, 659.25, 0.15, 0.5);
  },
  miss: (t) => {
    [330, 247].forEach((f, i) =>
      tone(t + i * 0.15, { f, dur: 0.35, vol: 0.16, lp: 800, a: 0.01 })
    );
  },

  // ---- Lật thẻ ----
  cardFlip: (t) => {
    noise(t, { dur: 0.07, fc: 2000, fc2: 3500, q: 0.7, vol: 0.11 });
    tone(t, { glide: [[0, 700], [1, 500]], dur: 0.04, vol: 0.07, lp: 2000 });
  },
  cardMatch: (t, o) => {
    const b = 4 + Math.min(o.comboIndex || 0, 5);
    chime(t, pent(b), 0.18, 0.35);
    chime(t + 0.1, pent(b + 2), 0.18, 0.5);
  },
  cardMismatch: (t) => {
    tone(t, { f: 262, dur: 0.25, vol: 0.14, lp: 600 });
    tone(t + 0.1, { f: 247, dur: 0.28, vol: 0.14, lp: 600 });
  },

  // ---- Mochi Chạy Phố ----
  laneSwipe: (t) => {
    noise(t, { dur: 0.12, fc: 1200, fc2: 3000, q: 0.6, vol: 0.08, a: 0.03 });
  },
  jump: (t) => {
    tone(t, { glide: [[0, 300], [1, 700]], dur: 0.2, type: 'triangle', vol: 0.22, lp: 2000, a: 0.01 });
  },
  slide: (t) => {
    tone(t, { glide: [[0, 600], [1, 250]], dur: 0.18, type: 'triangle', vol: 0.18, lp: 1800, a: 0.01 });
    noise(t, { dur: 0.16, fc: 2500, fc2: 900, q: 0.6, vol: 0.05 });
  },
  runCoin: (t, o) => {
    const f = pent(5 + Math.min(o.comboIndex || 0, 9));
    tone(t, { f, dur: 0.15, vol: 0.2, lp: 3500, a: 0.004 });
    tone(t, { f: f * 2, dur: 0.1, vol: 0.06, lp: 5000, a: 0.003 });
  },
  powerUp: (t) => {
    arp(t, [523.25, 659.25, 783.99, 987.77, 1318.5], 0.06, { vol: 0.15, dur: 0.5 });
    noise(t, { dur: 0.35, fc: 1000, fc2: 6000, q: 0.6, vol: 0.04, a: 0.05 });
  },
  shieldBreak: (t) => {
    noise(t, { dur: 0.1, fc: 2500, q: 0.7, vol: 0.24 });
    tone(t, { glide: [[0, 900], [1, 300]], dur: 0.15, vol: 0.12, lp: 2000 });
    tone(t, { glide: [[0, 180], [1, 60]], dur: 0.3, vol: 0.32, lp: 400 });
  },
  passPartner: (t) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const at = [0, 0.12, 0.24, 0.4];
    const dur = [0.14, 0.14, 0.18, 0.8];
    notes.forEach((f, i) => {
      tone(t + at[i], { f, dur: dur[i], vol: 0.2, type: 'triangle', lp: 2000, a: 0.015 });
      tone(t + at[i], { f: f * 2, dur: dur[i], vol: 0.05, lp: 3000, a: 0.015 });
    });
  },
  crash: (t) => {
    noise(t, { dur: 0.22, fc: 700, q: 0.5, vol: 0.3, ft: 'lowpass' });
    tone(t, { glide: [[0, 220], [1, 70]], dur: 0.4, vol: 0.3, lp: 500 });
    tone(t + 0.1, { glide: [[0, 392], [1, 196]], dur: 0.35, vol: 0.12, lp: 1000 });
  },

  // ---- Bếp Nướng Mochi ----
  skewerPick: (t) => {
    noise(t, { dur: 0.18, fc: 5000, q: 0.6, vol: 0.07, a: 0.02 });
    tone(t, { glide: [[0, 400], [1, 800]], dur: 0.06, vol: 0.22, lp: 2500, a: 0.004 });
  },
  trayComplete: (t) => {
    noise(t, { dur: 0.4, fc: 4500, q: 0.6, vol: 0.08, a: 0.05 });
    chime(t + 0.1, 1568, 0.2, 0.9);
    chime(t + 0.22, 2093, 0.14, 0.8);
  },
  iceCrack: (t) => {
    for (let i = 0; i < 4; i++) {
      noise(t + i * rnd(0.03, 0.07), { dur: 0.02, fc: 5000, q: 3, vol: 0.18 });
    }
    [2349, 3136, 2637].forEach((f) => chime(t + rnd(0, 0.12), f, 0.06, 0.28));
  },
  chainBreak: (t) => {
    for (let i = 0; i < 3; i++) {
      noise(t + i * 0.05, { dur: 0.12, fc: 3500, q: 4, vol: 0.1 });
    }
    tone(t, { f: 1200, dur: 0.15, type: 'triangle', vol: 0.06, lp: 3500 });
    tone(t + 0.04, { f: 1800, dur: 0.15, type: 'triangle', vol: 0.05, lp: 4000 });
    tone(t, { f: 150, dur: 0.18, vol: 0.2, lp: 500 });
  },
  foilUnwrap: (t) => {
    for (let i = 0; i < 6; i++) {
      noise(t + i * rnd(0.04, 0.07), { dur: 0.03, fc: rnd(5500, 7500), q: 0.5, vol: 0.09 });
    }
  },
  lidOpen: (t) => {
    tone(t, { glide: [[0, 200], [1, 420]], dur: 0.1, type: 'triangle', vol: 0.25, lp: 1500 });
    noise(t, { dur: 0.05, fc: 1500, q: 0.8, vol: 0.1 });
    tone(t + 0.08, { f: 900, dur: 0.03, vol: 0.1, lp: 2500 });
  },
  booster: (t) => {
    arp(t, [0, 1, 2, 3, 4, 5].map((i) => pent(5 + i)), 0.05, { vol: 0.13, dur: 0.45, type: 'sine' });
    noise(t, { dur: 0.3, fc: 1200, fc2: 6500, q: 0.6, vol: 0.04, a: 0.05 });
  }
};

const MIN_GAP_MS = {
  dialTick: 40,
  typeBlip: 30,
  runCoin: 45,
  laneSwipe: 60,
  tap: 40,
  petPat: 60
};

// ---------- BGM Sequencer ----------
const CHORDS_DAY = [
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
  [110.0, 130.81, 164.81, 196.0], //  Am7
  [87.31, 110.0, 130.81, 164.81], //  Fmaj7
  [98.0, 123.47, 146.83, 164.81] //   G6
];

function walk(tr, lo, hi, maxStep = 2) {
  let m = tr.mel ?? Math.floor((lo + hi) / 2);
  m += Math.round(rnd(-maxStep, maxStep));
  m = Math.max(lo, Math.min(hi, m));
  tr.mel = m;
  return m;
}

function kalimba(t, f, vol, out) {
  tone(t, { f, dur: 1.1, vol, a: 0.004, lp: 3500, dest: out });
  tone(t, { f: f * 4, dur: 0.22, vol: vol * 0.22, a: 0.003, lp: 5000, dest: out });
}

const TRACKS = {
  // Lo-fi Kalimba 78 BPM
  room_day: {
    stepDur: 30 / 78,
    level: 1,
    step(t, s, tr) {
      const bar = (s >> 3) & 3;
      const p = s & 7;
      const out = tr.gain;
      if (p === 0) {
        const barLen = this.stepDur * 8;
        CHORDS_DAY[bar].forEach((f, i) => {
          tone(t, {
            f,
            dur: barLen + 0.7,
            vol: 0.055,
            a: 0.6,
            hold: barLen - 1.0,
            type: i % 2 ? 'sine' : 'triangle',
            lp: 900,
            dest: out
          });
        });
      }
      if (p === 0 || p === 4 || Math.random() < 0.45) {
        const idx = walk(tr, 2, 11);
        kalimba(t, pent(idx), 0.1, out);
      }
    }
  },
  // Music box 62 BPM
  room_night: {
    stepDur: 30 / 62,
    level: 0.8,
    step(t, s, tr) {
      const bar = (s >> 3) & 3;
      const p = s & 7;
      const out = tr.gain;
      if (p === 0) {
        const barLen = this.stepDur * 8;
        CHORDS_DAY[bar].slice(0, 3).forEach((f) => {
          tone(t, {
            f,
            dur: barLen + 0.8,
            vol: 0.04,
            a: 0.9,
            hold: barLen - 1.2,
            lp: 700,
            dest: out
          });
        });
      }
      const box = (f, vol) => {
        tone(t, { f, dur: 1.6, vol, a: 0.004, lp: 5200, dest: out });
        tone(t, { f: f * 2.01, dur: 0.5, vol: vol * 0.3, a: 0.003, lp: 6000, dest: out });
      };
      if (p % 2 === 0) {
        const chord = CHORDS_DAY[bar];
        box(chord[(p / 2) % 4] * 4, 0.085);
      } else if (Math.random() < 0.28) {
        box(pent(walk(tr, 7, 13, 2)), 0.06);
      }
    }
  },
  // Playful Marimba 116 BPM
  arcade: {
    stepDur: 30 / 116,
    level: 0.95,
    step(t, s, tr) {
      const bar = (s >> 3) & 3;
      const p = s & 7;
      const out = tr.gain;
      const root = [130.81, 110.0, 87.31 * 1.0, 98.0][bar];
      if (p === 0 || p === 4) {
        tone(t, { f: root, dur: 0.34, vol: 0.2, type: 'triangle', lp: 420, a: 0.01, dest: out });
      } else if (p === 6) {
        tone(t, { f: root * 1.5, dur: 0.26, vol: 0.14, type: 'triangle', lp: 420, a: 0.01, dest: out });
      }
      if (p % 2 === 1) {
        noise(t, { dur: 0.03, fc: 7000, q: 0.8, vol: 0.012, ft: 'highpass', dest: out });
      }
      if (p === 0 || Math.random() < 0.65) {
        const f = pent(walk(tr, 5, 14, 2));
        tone(t, { f, dur: 0.24, vol: 0.1, a: 0.003, lp: 3500, dest: out });
        tone(t, { f: f * 4, dur: 0.07, vol: 0.03, a: 0.002, lp: 6000, dest: out });
      }
    }
  }
};

function desiredTrack() {
  if (!settings.bgmEnabled || settings.muted || settings.bgmMode === 'off') return null;
  if (gameState.isArcade) return 'arcade';
  if (settings.bgmMode === 'day') return 'room_day';
  if (settings.bgmMode === 'night') return 'room_night';
  return gameState.isNight ? 'room_night' : 'room_day';
}

function setTrack(name) {
  if (!ctx || name === curTrackName) return;
  curTrackName = name;
  const now = ctx.currentTime;
  tracks.forEach((tr) => {
    if (tr.stopAt) return;
    tr.gain.gain.cancelScheduledValues(now);
    tr.gain.gain.setValueAtTime(tr.gain.gain.value, now);
    tr.gain.gain.linearRampToValueAtTime(0.0001, now + CROSSFADE_SEC);
    tr.stopAt = now + CROSSFADE_SEC + 0.1;
  });
  if (name && TRACKS[name]) {
    const def = TRACKS[name];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(def.level, now + CROSSFADE_SEC);
    g.connect(bgmBus);
    tracks.push({ name, def, gain: g, next: now + 0.08, step: 0, stopAt: 0, mel: null });
  }
  startTimer();
}

function startTimer() {
  if (timer) return;
  timer = setInterval(tick, 40);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function tick() {
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  for (const tr of tracks.slice()) {
    if (tr.stopAt) {
      if (now > tr.stopAt) {
        try {
          tr.gain.disconnect();
        } catch {
          // ignore
        }
        tracks = tracks.filter((x) => x !== tr);
      }
      continue;
    }
    if (tr.next < now - 0.4) tr.next = now + 0.05;
    while (tr.next < now + 0.3) {
      try {
        tr.def.step(tr.next, tr.step, tr);
      } catch {
        // ignore
      }
      tr.next += tr.def.stepDur;
      tr.step++;
    }
  }
  if (!tracks.length) stopTimer();
}

function syncBgm() {
  if (!ctx || hiddenNow) return;
  try {
    setTrack(desiredTrack());
  } catch {
    // ignore
  }
}

// ---------- Vòng đời trang (khóa máy / chuyển app) ----------
function onHidden() {
  hiddenNow = true;
  if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {});
}

function onVisible() {
  hiddenNow = false;
  if (!ctx) return;
  ctx
    .resume()
    .catch(() => {})
    .then(() => {
      if (!ctx) return;
      const now = ctx.currentTime;
      const target = settings.bgmEnabled ? settings.bgmVolume : 0;
      bgmBus.gain.cancelScheduledValues(now);
      bgmBus.gain.setValueAtTime(0.0001, now);
      bgmBus.gain.linearRampToValueAtTime(Math.max(0.0001, target), now + 0.8);
      syncBgm();
    });
}

if (typeof window !== 'undefined') {
  bindUnlockListeners();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) onHidden();
    else onVisible();
  });
  window.addEventListener('pagehide', onHidden);
  window.addEventListener('pageshow', () => {
    if (!document.hidden) onVisible();
  });
  hiddenNow = Boolean(document.hidden);
}

// ---------- Public API ----------
let snapshot = { ...settings };

export const soundEngine = {
  play(name, opts = {}) {
    try {
      const fn = SFX[name];
      if (!fn) return;
      if (!settings.sfxEnabled || settings.muted || hiddenNow) return;
      if (!ctx) return;
      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {});
        return;
      }
      const nowMs = performance.now();
      const gap = MIN_GAP_MS[name] ?? 25;
      if (lastPlayed[name] && nowMs - lastPlayed[name] < gap) return;
      lastPlayed[name] = nowMs;
      volMul = typeof opts.vol === 'number' ? opts.vol : 1;
      fn(ctx.currentTime + 0.005, opts);
      volMul = 1;
    } catch {
      volMul = 1;
    }
  },

  setGameContext(next) {
    gameState = { ...gameState, ...next };
    syncBgm();
  },

  getSettings() {
    return snapshot;
  },

  setSettings(partial) {
    settings = { ...settings, ...partial };
    snapshot = { ...settings };
    saveSettings();
    applyVolumes(false);
    syncBgm();
    notify();
  },

  toggleMuted() {
    soundEngine.setSettings({ muted: !settings.muted });
    return settings.muted;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};

export function useSoundSettings() {
  return useSyncExternalStore(soundEngine.subscribe, soundEngine.getSettings, soundEngine.getSettings);
}

export default soundEngine;
