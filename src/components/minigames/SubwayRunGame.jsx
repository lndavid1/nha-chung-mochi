import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Home,
  Trophy,
  Coins,
  Magnet,
  Shield,
  Sparkles,
  Gauge,
  ChevronLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

const INK = '#4A3525';
const HORIZON_RATIO = 0.32;

// Đường cong tốc độ chuẩn (Chậm dễ làm quen -> Tăng tiến mượt theo quãng đường)
const BASE_SPEED = 0.42;
const MAX_SPEED = 1.35;
const WARMUP_SECONDS = 3.0;

// Vật lý nhảy, trượt & Power-ups
const GRAVITY = 42;
const JUMP_VELOCITY = 15.2;
const FAST_DROP_VELOCITY = -26;
const ROLL_DURATION = 0.65;
const MAGNET_DURATION = 7.0;
const X2_DURATION = 8.0;
const INVINCIBLE_DURATION = 1.6;
const JUMP_BUFFER_MS = 150;

export default function SubwayRunGame({
  petType = 'cat',
  petName = 'Mochi',
  playerName = 'Bạn',
  partnerName = '',
  partnerBestScore = 0,
  myBestScore = 0,
  dailyRemainingCap = 150,
  onGameComplete,
  onExit
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const hasSubmittedRewardRef = useRef(false);
  const canvasDimsRef = useRef({ width: 390, height: 844, dpr: 1 });

  const [uiState, setUiState] = useState({
    phase: 'ready', // 'ready' | 'playing' | 'paused' | 'gameover'
    score: 0,
    distance: 0,
    coins: 0,
    speedMultiplier: 1.0,
    speedUpToast: false,
    magnetLeft: 0,
    x2Left: 0,
    hasShield: false,
    passedPartner: false,
    showPartnerToast: false,
    earnedRewardCoins: 0,
    isNewRecord: false
  });

  // Toàn bộ trạng thái chạy game 60fps lưu trong ref (không stale closure, không re-render mỗi frame)
  const gRef = useRef({
    phase: 'ready',
    elapsedPlayTime: 0,
    speed: BASE_SPEED,
    speedMilestoneIndex: 0, // theo dõi các mốc 1.5x, 2.0x, 2.5x
    speedUpToastTimer: 0,
    distance: 0,
    score: 0,
    coins: 0,
    lane: 0, // -1, 0, +1
    targetLane: 0,
    laneTilt: 0,
    y: 0, // độ cao nhảy (>= 0)
    vy: 0,
    rollTimer: 0,
    bufferedJumpUntil: 0, // Input Buffering 150ms
    runCycle: 0,
    roadOffset: 0,
    shakeTime: 0,
    shakeIntensity: 0,
    invincibleTimer: 0,
    magnetTimer: 0,
    x2Timer: 0,
    hasShield: false,
    obstacles: [],
    collectibles: [],
    particles: [],
    scenery: [],
    windLines: [],
    distanceSinceLastWave: 0,
    lastSafeLane: 0,
    warmupCoinSpawned: false,
    partnerBannerSpawned: false,
    partnerBannerZ: null,
    passedPartner: false,
    partnerToastTimer: 0,
    lastTime: null,
    hudSyncAcc: 0
  });

  const initScenery = () => {
    const items = [];
    for (let i = 0; i < 14; i++) {
      items.push({
        z: i / 14,
        side: i % 2 === 0 ? -1 : 1,
        kind: i % 3 === 0 ? 'house' : 'tree',
        color: ['#FFB7C5', '#FFE082', '#A8DFBC', '#FFD1B3'][i % 4]
      });
    }
    return items;
  };

  const initWindLines = () =>
    Array.from({ length: 8 }, (_, idx) => ({
      side: idx % 2 === 0 ? -1 : 1,
      y: 0.25 + (idx / 8) * 0.65,
      len: 28 + (idx % 3) * 18,
      offset: Math.random()
    }));

  // Reset sạch 100% trạng thái khi bắt đầu hoặc bấm Chơi lại
  const resetGame = useCallback((startImmediately = true) => {
    hasSubmittedRewardRef.current = false;
    const g = gRef.current;
    g.phase = startImmediately ? 'playing' : 'ready';
    g.elapsedPlayTime = 0;
    g.speed = BASE_SPEED;
    g.speedMilestoneIndex = 0;
    g.speedUpToastTimer = 0;
    g.distance = 0;
    g.score = 0;
    g.coins = 0;
    g.lane = 0;
    g.targetLane = 0;
    g.laneTilt = 0;
    g.y = 0;
    g.vy = 0;
    g.rollTimer = 0;
    g.bufferedJumpUntil = 0;
    g.runCycle = 0;
    g.roadOffset = 0;
    g.shakeTime = 0;
    g.shakeIntensity = 0;
    g.invincibleTimer = 0;
    g.magnetTimer = 0;
    g.x2Timer = 0;
    g.hasShield = false;
    g.obstacles = [];
    g.collectibles = [];
    g.particles = [];
    g.scenery = initScenery();
    g.windLines = initWindLines();
    g.distanceSinceLastWave = 0;
    g.lastSafeLane = 0;
    g.warmupCoinSpawned = false;
    g.partnerBannerSpawned = false;
    g.partnerBannerZ = null;
    g.passedPartner = false;
    g.partnerToastTimer = 0;
    g.lastTime = null;
    g.hudSyncAcc = 0;

    setUiState({
      phase: g.phase,
      score: 0,
      distance: 0,
      coins: 0,
      speedMultiplier: 1.0,
      speedUpToast: false,
      magnetLeft: 0,
      x2Left: 0,
      hasShield: false,
      passedPartner: false,
      showPartnerToast: false,
      earnedRewardCoins: 0,
      isNewRecord: false
    });
  }, []);

  const executeJump = useCallback((g) => {
    g.vy = JUMP_VELOCITY;
    soundEngine.play('jump');
    g.rollTimer = 0;
    g.bufferedJumpUntil = 0;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      g.particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * 65,
        vy: Math.sin(angle) * 28 - 10,
        life: 0.42,
        maxLife: 0.42,
        size: 5 + Math.random() * 4,
        color: '#FFFDF9',
        anchorPlayer: true
      });
    }
  }, []);

  // Điều khiển nhân vật (có Input Buffering 150ms + Fast-Drop + Đổi làn khi đang nhảy/trượt)
  const triggerAction = useCallback(
    (action) => {
      const g = gRef.current;
      if (g.phase === 'ready') {
        g.phase = 'playing';
        g.lastTime = null;
        setUiState((prev) => ({ ...prev, phase: 'playing' }));
      }
      if (g.phase !== 'playing') return;

      if (action === 'left') {
        if (g.targetLane > -1) {
          g.targetLane -= 1;
          soundEngine.play('laneSwipe');
          g.laneTilt = -0.34;
        }
      } else if (action === 'right') {
        if (g.targetLane < 1) {
          g.targetLane += 1;
          soundEngine.play('laneSwipe');
          g.laneTilt = 0.34;
        }
      } else if (action === 'up') {
        if (g.y <= 0.05) {
          executeJump(g);
        } else if (g.y < 0.25 && g.vy < 0) {
          // Input Buffering 150ms khi vuốt lên sát lúc chân sắp chạm đất
          g.bufferedJumpUntil = performance.now() + JUMP_BUFFER_MS;
        }
      } else if (action === 'down') {
        if (g.y > 0.04) {
          // Fast-Drop tức thì xuống mặt đường và chuyển sang trượt ngay
          g.vy = FAST_DROP_VELOCITY;
        }
        if (g.rollTimer <= 0) soundEngine.play('slide');
        g.rollTimer = ROLL_DURATION;
      }
    },
    [executeJump]
  );

  // Tự động Tạm dừng khi khóa màn hình iPhone / chuyển ứng dụng (visibilitychange & blur)
  useEffect(() => {
    const pauseIfPlaying = () => {
      const g = gRef.current;
      if (g.phase === 'playing') {
        g.phase = 'paused';
        g.lastTime = null;
        setUiState((prev) => ({ ...prev, phase: 'paused' }));
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) pauseIfPlaying();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', pauseIfPlaying);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', pauseIfPlaying);
    };
  }, []);

  // Cảm ứng vuốt chuẩn iOS Safari (chỉ chặn mặc định khi đang chơi, không ảnh hưởng app khi Pause/Exit)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let gestureHandled = false;

    const onTouchStart = (e) => {
      if (e.touches.length === 0) return;
      if (e.target.closest('button')) return;
      if (gRef.current.phase !== 'playing' && gRef.current.phase !== 'ready') return;
      e.preventDefault();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      gestureHandled = false;
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 0 || gestureHandled) return;
      if (e.target.closest('button')) return;
      if (gRef.current.phase !== 'playing' && gRef.current.phase !== 'ready') return;
      e.preventDefault();
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      const threshold = 24;

      if (Math.abs(dx) >= threshold || Math.abs(dy) >= threshold) {
        gestureHandled = true;
        if (Math.abs(dx) > Math.abs(dy)) {
          triggerAction(dx > 0 ? 'right' : 'left');
        } else {
          triggerAction(dy < 0 ? 'up' : 'down');
        }
      }
    };

    const onTouchEnd = () => {
      gestureHandled = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [triggerAction]);

  // Hỗ trợ bàn phím Arrow / WASD / Space / Esc
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        triggerAction('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        triggerAction('right');
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'W' ||
        e.key === ' '
      ) {
        e.preventDefault();
        triggerAction('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        triggerAction('down');
      } else if (e.key === 'Escape') {
        const g = gRef.current;
        if (g.phase === 'playing') {
          g.phase = 'paused';
          g.lastTime = null;
          setUiState((prev) => ({ ...prev, phase: 'paused' }));
        } else if (g.phase === 'paused') {
          g.phase = 'playing';
          g.lastTime = null;
          setUiState((prev) => ({ ...prev, phase: 'playing' }));
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerAction]);

  // ResizeObserver giữ Canvas luôn sắc nét Retina (giới hạn dpr <= 2 để mát máy iPhone 60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvasDimsRef.current = { width: rect.width, height: rect.height, dpr };
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Sinh Wave vật cản theo khoảng cách z (phân tầng độ khó: 0-120m -> 120-350m -> >350m)
  const spawnDistanceWave = (g) => {
    const allLanes = [-1, 0, 1];
    // Không bao giờ bắt người chơi đổi từ làn -1 sang tận +1 quá sát nhau
    const reachableSafeLanes = allLanes.filter(
      (ln) => Math.abs(ln - g.lastSafeLane) <= 1
    );
    const safeLane =
      reachableSafeLanes[Math.floor(Math.random() * reachableSafeLanes.length)];
    g.lastSafeLane = safeLane;

    const otherLanes = allLanes.filter((ln) => ln !== safeLane);
    const dist = g.distance;
    const trainColors = ['#FF9B71', '#88C9A1', '#FFB7C5', '#89CFF0'];

    const spawnCoinsLine = (ln, startZ = 0.96, count = 5, arcOverLow = false) => {
      for (let i = 0; i < count; i++) {
        const zPos = startZ + i * 0.05;
        const yPos = arcOverLow
          ? Math.sin((i / (count - 1)) * Math.PI) * 1.45 + 0.35
          : 0.35;
        g.collectibles.push({
          id: Math.random(),
          lane: ln,
          z: zPos,
          y: yPos,
          kind: 'coin'
        });
      }
    };

    const maybeSpawnPowerupOrCoins = (ln) => {
      if (Math.random() < 0.16) {
        const kinds = ['magnet', 'shield', 'x2'];
        const pKind = kinds[Math.floor(Math.random() * kinds.length)];
        g.collectibles.push({
          id: Math.random(),
          lane: ln,
          z: 1.04,
          y: 0.6,
          kind: pKind
        });
      } else {
        spawnCoinsLine(ln, 0.96, 5, false);
      }
    };

    if (dist < 120) {
      // GIAI ĐOẠN 1 (0m – 120m): Chủ yếu 1 vật cản/hàng + chuỗi xu dẫn đường
      const obLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
      const obType = ['low', 'high', 'train'][Math.floor(Math.random() * 3)];
      g.obstacles.push({
        id: Math.random(),
        lane: obLane,
        z: 1.05,
        type: obType,
        color: trainColors[Math.floor(Math.random() * trainColors.length)]
      });
      // Xu đặt ở làn an toàn hoàn toàn trống (không bao giờ đè vào train)
      maybeSpawnPowerupOrCoins(safeLane);
    } else if (dist < 350) {
      // GIAI ĐOẠN 2 (120m – 350m): 2 vật cản/hàng, luôn chừa ít nhất 1 làn trống hoàn toàn (safeLane)
      otherLanes.forEach((ln) => {
        const obType = ['low', 'high', 'train'][Math.floor(Math.random() * 3)];
        g.obstacles.push({
          id: Math.random(),
          lane: ln,
          z: 1.05,
          type: obType,
          color: trainColors[Math.floor(Math.random() * trainColors.length)]
        });
      });
      maybeSpawnPowerupOrCoins(safeLane);
    } else {
      // GIAI ĐOẠN 3 (> 350m): Tối đa 2 train + 1 làn rào thấp/cao (hoặc trống), KHÔNG BAO GIỜ 3 train chắn kín!
      otherLanes.forEach((ln) => {
        const obType = Math.random() < 0.65 ? 'train' : Math.random() < 0.5 ? 'low' : 'high';
        g.obstacles.push({
          id: Math.random(),
          lane: ln,
          z: 1.05,
          type: obType,
          color: trainColors[Math.floor(Math.random() * trainColors.length)]
        });
      });

      const safeRoll = Math.random();
      if (safeRoll < 0.45) {
        // Làn an toàn trống hoàn toàn
        maybeSpawnPowerupOrCoins(safeLane);
      } else if (safeRoll < 0.75) {
        // Rào thấp + xu vòng cung trên cao gợi ý nhảy
        g.obstacles.push({
          id: Math.random(),
          lane: safeLane,
          z: 1.05,
          type: 'low'
        });
        spawnCoinsLine(safeLane, 0.95, 5, true);
      } else {
        // Cổng cao + xu thấp dưới gầm gợi ý trượt
        g.obstacles.push({
          id: Math.random(),
          lane: safeLane,
          z: 1.05,
          type: 'high'
        });
        spawnCoinsLine(safeLane, 0.96, 4, false);
      }
    }
  };

  // Kết thúc ván chơi — khóa cứng chỉ gửi kỷ lục & cộng Xu ĐÚNG 1 LẦN DUY NHẤT
  const finishRun = useCallback(
    (g) => {
      if (hasSubmittedRewardRef.current) return;
      hasSubmittedRewardRef.current = true;

      g.phase = 'gameover';
      soundEngine.play('crash');
      g.shakeTime = 0.35;
      g.shakeIntensity = 9;

      const finalScore = Math.floor(g.score);
      const finalDist = Math.floor(g.distance);
      const rawReward = Math.min(
        35,
        Math.max(4, Math.floor(g.coins * 0.45 + finalScore / 90))
      );
      const cappedReward = Math.max(0, Math.min(rawReward, dailyRemainingCap));
      const isNewRecord = finalScore > myBestScore;

      setUiState({
        phase: 'gameover',
        score: finalScore,
        distance: finalDist,
        coins: g.coins,
        speedMultiplier: Number((g.speed / BASE_SPEED).toFixed(1)),
        speedUpToast: false,
        magnetLeft: 0,
        x2Left: 0,
        hasShield: false,
        passedPartner: g.passedPartner,
        showPartnerToast: false,
        earnedRewardCoins: cappedReward,
        isNewRecord
      });

      if (onGameComplete) {
        onGameComplete({
          score: finalScore,
          distance: finalDist,
          collectedCoins: g.coins,
          rewardCoins: cappedReward,
          passedPartner: g.passedPartner
        });
      }
    },
    [dailyRemainingCap, myBestScore, onGameComplete]
  );

  // Vòng lặp Game 60fps duy nhất (cancelAnimationFrame chống Ghost RAF tuyệt đối)
  useEffect(() => {
    resetGame(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const project = (lanePos, z, yHeight, W, H) => {
      const horizonY = H * HORIZON_RATIO;
      const groundH = H - horizonY;
      const clampedZ = Math.max(-0.15, Math.min(1.15, z));
      const p = Math.pow(Math.max(0, 1 - clampedZ), 2.2);
      const scale = 0.14 + p * 0.86;
      const roadHalfW = W * (0.09 + p * 0.44);
      const laneSpacing = (roadHalfW * 2) / 3;
      const screenX = W * 0.5 + lanePos * laneSpacing;
      const screenY = horizonY + p * groundH * 0.88 - yHeight * scale * 58;
      const groundY = horizonY + p * groundH * 0.88;
      return { x: screenX, y: screenY, groundY, scale, p, laneSpacing, roadHalfW };
    };

    const spawnBurstParticles = (x, y, colors, count = 14) => {
      const g = gRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 45 + Math.random() * 140;
        g.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 45,
          life: 0.6 + Math.random() * 0.35,
          maxLife: 0.95,
          size: 4 + Math.random() * 5,
          color: colors[i % colors.length],
          anchorPlayer: false
        });
      }
    };

    const drawRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
      ctx.stroke();
    };

    const drawBackViewPet = (W, H, g) => {
      const proj = project(g.lane, 0.05, g.y, W, H);
      const px = proj.x;
      const py = proj.y;
      const gy = proj.groundY;
      const isRolling = g.rollTimer > 0;

      // Bóng elip bám sát mặt đường, thu nhỏ tự nhiên khi nhảy
      const shadowScale = Math.max(0.45, 1 - g.y * 0.2);
      ctx.save();
      ctx.fillStyle = 'rgba(61, 38, 22, 0.24)';
      ctx.beginPath();
      ctx.ellipse(px, gy + 4, 30 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (g.invincibleTimer > 0 && Math.floor(g.invincibleTimer * 14) % 2 === 0) {
        return;
      }

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(g.laneTilt);

      const stride = Math.sin(g.runCycle * 16);
      const bob = g.y <= 0.05 ? Math.abs(Math.cos(g.runCycle * 16)) * 5 : 0;
      ctx.translate(0, -bob);

      if (isRolling) {
        ctx.scale(1.16, 0.62);
        ctx.translate(0, 14);
      }

      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const bodyColor =
        petType === 'corgi'
          ? '#F4B36C'
          : petType === 'bunny'
          ? '#FFF5F7'
          : '#FFFDF9';
      const earAccent =
        petType === 'corgi'
          ? '#E69A4B'
          : petType === 'bunny'
          ? '#FFB7C5'
          : '#FFAD87';

      const leftLegY = 12 + stride * 7;
      const rightLegY = 12 - stride * 7;
      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      ctx.ellipse(-12, leftLegY, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(12, rightLegY, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, -8, 25, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (petType === 'cat') {
        ctx.fillStyle = '#FFAD87';
        ctx.beginPath();
        ctx.ellipse(9, -15, 11, 8, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (petType === 'corgi') {
        ctx.fillStyle = '#FFFDF9';
        ctx.beginPath();
        ctx.ellipse(0, 4, 15, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, -28, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (petType === 'bunny') {
        ctx.fillStyle = '#FFF5F7';
        ctx.save();
        ctx.translate(-10, -44);
        ctx.rotate(-0.2 + stride * 0.08);
        ctx.beginPath();
        ctx.ellipse(0, -10, 6.5, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(10, -44);
        ctx.rotate(0.2 - stride * 0.08);
        ctx.beginPath();
        ctx.ellipse(0, -10, 6.5, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(-17, -38);
        ctx.lineTo(-22, -57);
        ctx.lineTo(-6, -45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = earAccent;
        ctx.beginPath();
        ctx.moveTo(17, -38);
        ctx.lineTo(22, -57);
        ctx.lineTo(6, -45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      const tailWag = Math.sin(g.runCycle * 18) * 9;
      if (petType === 'cat') {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.quadraticCurveTo(tailWag * 1.4, -10, tailWag * 1.6, -24);
        ctx.stroke();
        ctx.strokeStyle = '#FFAD87';
        ctx.lineWidth = 3.6;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FFFDF9';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(tailWag * 0.4, 2, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (g.hasShield) {
        ctx.strokeStyle = '#89CFF0';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(137, 207, 240, 0.25)';
        ctx.beginPath();
        ctx.arc(0, -18, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, -18, 35, -2.3, -1.5);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawObstacle = (ob, W, H) => {
      const proj = project(ob.lane, ob.z, 0, W, H);
      const s = proj.scale;
      const laneW = proj.laneSpacing * 0.78;
      const x = proj.x;
      const y = proj.groundY;

      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1.2, 2.4 * s);
      ctx.lineJoin = 'round';

      ctx.fillStyle = 'rgba(61, 38, 22, 0.18)';
      ctx.beginPath();
      ctx.ellipse(x, y + 2 * s, laneW * 0.52, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      if (ob.type === 'low') {
        const h = 36 * s;
        ctx.fillStyle = '#D59F6C';
        drawRoundedRect(x - laneW / 2, y - h, laneW, h * 0.55, 5 * s);
        ctx.fillStyle = '#B77F4A';
        drawRoundedRect(x - laneW * 0.42, y - h * 1.05, 9 * s, h * 1.05, 3 * s);
        drawRoundedRect(x + laneW * 0.42 - 9 * s, y - h * 1.05, 9 * s, h * 1.05, 3 * s);
        ctx.fillStyle = '#FFFDF9';
        ctx.fillRect(x - laneW * 0.25, y - h * 0.82, laneW * 0.5, 5 * s);
      } else if (ob.type === 'high') {
        const totalH = 92 * s;
        const barH = 34 * s;
        ctx.fillStyle = '#C9925B';
        drawRoundedRect(x - laneW * 0.48, y - totalH, 8 * s, totalH, 3 * s);
        drawRoundedRect(x + laneW * 0.48 - 8 * s, y - totalH, 8 * s, totalH, 3 * s);
        ctx.fillStyle = '#FFE082';
        drawRoundedRect(x - laneW * 0.52, y - totalH, laneW * 1.04, barH, 7 * s);
        if (s > 0.35) {
          ctx.fillStyle = INK;
          ctx.beginPath();
          ctx.moveTo(x - 8 * s, y - totalH + barH * 0.35);
          ctx.lineTo(x + 8 * s, y - totalH + barH * 0.35);
          ctx.lineTo(x, y - totalH + barH * 0.72);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        const h = 98 * s;
        const w = laneW * 0.96;
        ctx.fillStyle = '#FFFDF9';
        drawRoundedRect(x - w * 0.46, y - h - 10 * s, w * 0.92, 14 * s, 6 * s);
        ctx.fillStyle = ob.color || '#FF9B71';
        drawRoundedRect(x - w / 2, y - h, w, h, 10 * s);
        ctx.fillStyle = '#D6F5FF';
        drawRoundedRect(x - w * 0.4, y - h * 0.84, w * 0.8, h * 0.34, 6 * s);
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.arc(x - w * 0.28, y - h * 0.26, 7 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + w * 0.28, y - h * 0.26, 7 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFF8F0';
        drawRoundedRect(x - w * 0.44, y - 14 * s, w * 0.88, 10 * s, 4 * s);
      }

      ctx.restore();
    };

    const drawCollectible = (c, W, H, timeSec) => {
      const proj = project(c.lane, c.z, c.y, W, H);
      const s = proj.scale;
      const x = proj.x;
      const hover = Math.sin(timeSec * 6 + c.id * 10) * 4 * s;
      const y = proj.y + hover;

      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1.1, 2.1 * s);

      if (c.kind === 'coin') {
        const r = 13 * s;
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.ellipse(
          x,
          y,
          r * (0.75 + Math.abs(Math.sin(timeSec * 5 + c.id)) * 0.25),
          r,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FF9B71';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const r = 18 * s;
        const bg =
          c.kind === 'magnet'
            ? '#FFB7C5'
            : c.kind === 'shield'
            ? '#89CFF0'
            : '#88C9A1';
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.font = `900 ${Math.max(8, Math.round(13 * s))}px Nunito, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          c.kind === 'magnet' ? 'U' : c.kind === 'shield' ? 'S' : 'x2',
          x,
          y + 1
        );
      }

      ctx.restore();
    };

    const drawPartnerBanner = (z, W, H) => {
      const leftP = project(-1.45, z, 0, W, H);
      const rightP = project(1.45, z, 0, W, H);
      const s = leftP.scale;
      const postH = 105 * s;

      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1.4, 2.5 * s);
      ctx.fillStyle = '#C9925B';
      drawRoundedRect(leftP.x - 5 * s, leftP.groundY - postH, 10 * s, postH, 3 * s);
      drawRoundedRect(rightP.x - 5 * s, rightP.groundY - postH, 10 * s, postH, 3 * s);

      const bw = rightP.x - leftP.x;
      const bh = 30 * s;
      ctx.fillStyle = '#FF9B71';
      drawRoundedRect(leftP.x, leftP.groundY - postH, bw, bh, 8 * s);

      if (s > 0.25) {
        ctx.fillStyle = '#FFFDF9';
        ctx.font = `900 ${Math.max(9, Math.round(14 * s))}px Nunito, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `Mốc của ${partnerName || 'người kia'}! (${partnerBestScore})`,
          W * 0.5,
          leftP.groundY - postH + bh * 0.52
        );
      }
      ctx.restore();
    };

    // Hủy mọi vòng lặp cũ trước khi khởi chạy vòng lặp mới (Chống Ghost RAF)
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);

      const g = gRef.current;
      // Delta-Time an toàn tuyệt đối (chặn trần <= 0.05s, không nhảy cóc sau Pause hoặc giật khung hình)
      const dt =
        g.lastTime === null
          ? 0.016
          : Math.min(0.05, Math.max(0.001, (now - g.lastTime) / 1000));
      g.lastTime = now;
      const timeSec = now / 1000;

      const { width: W, height: H, dpr } = canvasDimsRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // UPDATE LOGIC KHI ĐANG CHƠI
      if (g.phase === 'playing') {
        g.elapsedPlayTime += dt;

        // Đường cong tốc độ Asymptotic mượt: 0.42 -> 1.35 theo quãng đường
        g.speed =
          BASE_SPEED +
          (MAX_SPEED - BASE_SPEED) * (1 - Math.exp(-g.distance / 900));
        const speedMult = g.speed / BASE_SPEED;

        // Kiểm tra chạm các mốc tốc độ 1.5x, 2.0x, 2.5x -> hiện thông báo "Tăng tốc!"
        const milestones = [1.5, 2.0, 2.5];
        if (
          g.speedMilestoneIndex < milestones.length &&
          speedMult >= milestones[g.speedMilestoneIndex]
        ) {
          g.speedMilestoneIndex += 1;
          g.speedUpToastTimer = 2.0;
        }

        const zDelta = dt * g.speed;
        g.distance += dt * (g.speed * 38);
        const scoreMult = g.x2Timer > 0 ? 2 : 1;
        g.score += dt * (g.speed * 42) * scoreMult;
        g.runCycle += dt * (g.speed / BASE_SPEED);
        g.roadOffset = (g.roadOffset + zDelta * 5.2) % 1;

        // Di chuyển làn mượt
        const laneDiff = g.targetLane - g.lane;
        g.lane += laneDiff * Math.min(1, dt * 18);
        g.laneTilt *= Math.max(0, 1 - dt * 10);

        // Vật lý nhảy, Fast-Drop (chặn cứng y >= 0) & Input Buffering 150ms
        if (g.y > 0 || g.vy !== 0) {
          g.y += g.vy * dt;
          g.vy -= GRAVITY * dt;
          if (g.y <= 0) {
            g.y = 0;
            g.vy = 0;
            if (g.bufferedJumpUntil > now) {
              executeJump(g);
            }
          }
        }

        if (g.rollTimer > 0) g.rollTimer = Math.max(0, g.rollTimer - dt);
        if (g.invincibleTimer > 0) g.invincibleTimer = Math.max(0, g.invincibleTimer - dt);
        if (g.magnetTimer > 0) g.magnetTimer = Math.max(0, g.magnetTimer - dt);
        if (g.x2Timer > 0) g.x2Timer = Math.max(0, g.x2Timer - dt);
        if (g.shakeTime > 0) g.shakeTime = Math.max(0, g.shakeTime - dt);
        if (g.partnerToastTimer > 0) g.partnerToastTimer = Math.max(0, g.partnerToastTimer - dt);
        if (g.speedUpToastTimer > 0) g.speedUpToastTimer = Math.max(0, g.speedUpToastTimer - dt);

        // Cảnh quan 2 bên lề trượt theo tốc độ
        g.scenery.forEach((sc) => {
          sc.z -= zDelta * 0.92;
          if (sc.z < -0.05) sc.z += 1.05;
        });

        // 0–3 giây đầu (Warm-up): chỉ thả 1 hàng xu thẳng giữa đường cho quen tay
        if (g.elapsedPlayTime < WARMUP_SECONDS) {
          if (!g.warmupCoinSpawned && g.elapsedPlayTime > 0.5) {
            g.warmupCoinSpawned = true;
            for (let i = 0; i < 6; i++) {
              g.collectibles.push({
                id: Math.random(),
                lane: 0,
                z: 0.72 + i * 0.055,
                y: 0.35,
                kind: 'coin'
              });
            }
          }
        } else {
          // Sinh vật cản theo khoảng cách z (`distanceSinceLastWave` vs `minGap`)
          g.distanceSinceLastWave += zDelta;
          const minGap = 0.44 + (g.speed - BASE_SPEED) * 0.24;
          if (g.distanceSinceLastWave >= minGap) {
            g.distanceSinceLastWave = 0;
            spawnDistanceWave(g);
          }
        }

        // Băng rôn Vạch Đích Vượt Mặt Đối Phương (Partner Ghost Banner)
        if (
          partnerBestScore > 0 &&
          !g.partnerBannerSpawned &&
          g.score >= Math.max(10, partnerBestScore - 100)
        ) {
          g.partnerBannerSpawned = true;
          g.partnerBannerZ = 1.05;
        }

        if (g.partnerBannerZ !== null) {
          g.partnerBannerZ -= zDelta;
          if (g.partnerBannerZ <= 0.05 && !g.passedPartner) {
            g.passedPartner = true;
            soundEngine.play('passPartner');
            g.partnerToastTimer = 3.0;
            spawnBurstParticles(
              W * 0.5,
              H * 0.6,
              ['#FF9B71', '#FFE082', '#88C9A1', '#FFB7C5'],
              28
            );
          }
          if (g.partnerBannerZ < -0.2) {
            g.partnerBannerZ = null;
          }
        }

        // Cập nhật Xu & Power-ups (Nam châm hút cả 3 làn)
        const playerProj = project(g.lane, 0.05, g.y, W, H);
        g.collectibles = g.collectibles.filter((c) => {
          c.z -= zDelta;
          if (c.z < -0.15) return false;

          if (g.magnetTimer > 0 && c.kind === 'coin' && c.z < 0.44 && c.z > -0.05) {
            c.lane += (g.lane - c.lane) * Math.min(1, dt * 15);
            c.y += (g.y + 0.35 - c.y) * Math.min(1, dt * 15);
          }

          const hitZ = Math.abs(c.z - 0.05) < 0.065;
          const hitLane = Math.abs(c.lane - g.lane) < 0.46;
          const hitY = Math.abs(c.y - (g.y + 0.35)) < 0.92;

          if (hitZ && hitLane && hitY) {
            const p = project(c.lane, c.z, c.y, W, H);
            if (c.kind === 'coin') {
              g.coins += g.x2Timer > 0 ? 2 : 1;
              g.score += g.x2Timer > 0 ? 10 : 5;
              {
                const nowMs = performance.now();
                g.coinChain = nowMs - (g.coinChainLast || 0) < 1500 ? (g.coinChain || 0) + 1 : 0;
                g.coinChainLast = nowMs;
                soundEngine.play('runCoin', { comboIndex: g.coinChain });
              }
              spawnBurstParticles(p.x, p.y, ['#FFE082', '#FFFDF9'], 6);
            } else if (c.kind === 'magnet') {
              g.magnetTimer = MAGNET_DURATION;
              soundEngine.play('powerUp');
              spawnBurstParticles(p.x, p.y, ['#FFB7C5', '#FFFDF9'], 12);
            } else if (c.kind === 'shield') {
              g.hasShield = true;
              soundEngine.play('powerUp');
              spawnBurstParticles(p.x, p.y, ['#89CFF0', '#FFFDF9'], 12);
            } else if (c.kind === 'x2') {
              g.x2Timer = X2_DURATION;
              soundEngine.play('powerUp');
              spawnBurstParticles(p.x, p.y, ['#88C9A1', '#FFE082'], 12);
            }
            return false;
          }
          return true;
        });

        // Kiểm tra va chạm (Hitbox dễ chịu ~18%: z trong [-0.02, 0.08], lane < 0.42)
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const ob = g.obstacles[i];
          ob.z -= zDelta;
          if (ob.z < -0.15) {
            g.obstacles.splice(i, 1);
            continue;
          }

          const inZ = ob.z >= -0.02 && ob.z <= 0.08;
          const inLane = Math.abs(ob.lane - g.lane) < 0.42;

          if (inZ && inLane && g.invincibleTimer <= 0) {
            let crashed = false;
            if (ob.type === 'low') {
              // Đang nhảy (jumpY > 0.35) -> qua hoàn toàn rào thấp
              if (g.y <= 0.35) crashed = true;
            } else if (ob.type === 'high') {
              // Đang trượt (rollTimer > 0) -> qua hoàn toàn cổng cao
              if (g.rollTimer <= 0) crashed = true;
            } else {
              crashed = true;
            }

            if (crashed) {
              if (g.hasShield) {
                // Khiên bong bóng vỡ -> bất tử 1.6s + xóa toàn bộ vật cản vùng nguy hiểm (z < 0.4)
                g.hasShield = false;
                soundEngine.play('shieldBreak');
                g.invincibleTimer = INVINCIBLE_DURATION;
                g.shakeTime = 0.28;
                g.shakeIntensity = 7;
                g.obstacles = g.obstacles.filter((other) => other.z >= 0.4);
                spawnBurstParticles(
                  playerProj.x,
                  playerProj.y - 20,
                  ['#89CFF0', '#FFFDF9', '#FFE082'],
                  22
                );
                break;
              } else {
                spawnBurstParticles(
                  playerProj.x,
                  playerProj.y - 16,
                  ['#FF9B71', '#FFB7C5', '#FFE082'],
                  22
                );
                finishRun(g);
                break;
              }
            }
          }
        }

        // Cập nhật hạt hiệu ứng
        g.particles = g.particles.filter((pt) => {
          pt.life -= dt;
          if (pt.life <= 0) return false;
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 190 * dt;
          return true;
        });

        // Đồng bộ HUD React nhẹ ~10 lần/giây
        g.hudSyncAcc += dt;
        if (g.hudSyncAcc >= 0.1) {
          g.hudSyncAcc = 0;
          setUiState((prev) => ({
            ...prev,
            score: Math.floor(g.score),
            distance: Math.floor(g.distance),
            coins: g.coins,
            speedMultiplier: Number((g.speed / BASE_SPEED).toFixed(1)),
            speedUpToast: g.speedUpToastTimer > 0,
            magnetLeft: Math.ceil(g.magnetTimer),
            x2Left: Math.ceil(g.x2Timer),
            hasShield: g.hasShield,
            passedPartner: g.passedPartner,
            showPartnerToast: g.partnerToastTimer > 0
          }));
        }
      }

      // =====================================================
      // RENDER PSEUDO-3D SCENE
      // =====================================================
      ctx.save();
      if (g.shakeTime > 0) {
        const sx = (Math.random() - 0.5) * g.shakeIntensity * 2;
        const sy = (Math.random() - 0.5) * g.shakeIntensity * 2;
        ctx.translate(sx, sy);
      }

      const horizonY = H * HORIZON_RATIO;

      // 1. Bầu trời Pastel nắng ấm
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#9AD7F5');
      skyGrad.addColorStop(0.65, '#DFF4FF');
      skyGrad.addColorStop(1, '#FFF6E8');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY + 4);

      ctx.fillStyle = '#FFE082';
      ctx.beginPath();
      ctx.arc(W * 0.78, horizonY * 0.34, 24, 0, Math.PI * 2);
      ctx.fill();

      const cloudShift = (timeSec * 12) % (W + 120);
      ctx.fillStyle = 'rgba(255, 253, 249, 0.92)';
      [0, 180].forEach((offset, idx) => {
        const cx = ((cloudShift + offset) % (W + 120)) - 60;
        const cy = horizonY * (idx === 0 ? 0.42 : 0.62);
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.arc(cx + 14, cy - 4, 18, 0, Math.PI * 2);
        ctx.arc(cx + 30, cy, 13, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Thảm cỏ công viên
      const grassGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      grassGrad.addColorStop(0, '#AEE2C0');
      grassGrad.addColorStop(1, '#7EC298');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // 3. Con đường 3 làn
      const topHalf = W * 0.09;
      const botHalf = W * 0.52;

      ctx.fillStyle = '#FFF3DF';
      ctx.beginPath();
      ctx.moveTo(W * 0.5 - topHalf * 1.18, horizonY);
      ctx.lineTo(W * 0.5 + topHalf * 1.18, horizonY);
      ctx.lineTo(W * 0.5 + botHalf * 1.14, H);
      ctx.lineTo(W * 0.5 - botHalf * 1.14, H);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#8C7565';
      ctx.beginPath();
      ctx.moveTo(W * 0.5 - topHalf, horizonY);
      ctx.lineTo(W * 0.5 + topHalf, horizonY);
      ctx.lineTo(W * 0.5 + botHalf, H);
      ctx.lineTo(W * 0.5 - botHalf, H);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(W * 0.5 - topHalf, horizonY);
      ctx.lineTo(W * 0.5 - botHalf, H);
      ctx.moveTo(W * 0.5 + topHalf, horizonY);
      ctx.lineTo(W * 0.5 + botHalf, H);
      ctx.stroke();

      for (let i = 0; i < 10; i++) {
        const z1 = (i / 10 + (1 - g.roadOffset) * 0.1) % 1;
        const z2 = Math.max(0, z1 - 0.045);
        [-0.5, 0.5].forEach((laneDivider) => {
          const p1 = project(laneDivider, z1, 0, W, H);
          const p2 = project(laneDivider, z2, 0, W, H);
          ctx.strokeStyle = '#FFFDF9';
          ctx.lineWidth = Math.max(1.2, 4.2 * p2.scale);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.groundY);
          ctx.lineTo(p2.x, p2.groundY);
          ctx.stroke();
        });
      }

      // 4. Cảnh quan 2 bên lề đường
      const sortedScenery = [...g.scenery].sort((a, b) => b.z - a.z);
      sortedScenery.forEach((sc) => {
        if (sc.z < 0 || sc.z > 1) return;
        const p = project(sc.side * 2.15, sc.z, 0, W, H);
        const s = p.scale;
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1, 2.2 * s);
        if (sc.kind === 'house') {
          const hw = 44 * s;
          const hh = 40 * s;
          ctx.fillStyle = sc.color;
          drawRoundedRect(p.x - hw / 2, p.groundY - hh, hw, hh, 4 * s);
          ctx.fillStyle = '#FF9B71';
          ctx.beginPath();
          ctx.moveTo(p.x - hw * 0.62, p.groundY - hh);
          ctx.lineTo(p.x, p.groundY - hh - 22 * s);
          ctx.lineTo(p.x + hw * 0.62, p.groundY - hh);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = '#A87343';
          drawRoundedRect(p.x - 4 * s, p.groundY - 22 * s, 8 * s, 22 * s, 2 * s);
          ctx.fillStyle = '#88C9A1';
          ctx.beginPath();
          ctx.arc(p.x, p.groundY - 32 * s, 18 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });

      // 5. Painter's Algorithm cho Obstacles + Collectibles + Partner Banner + Player
      const renderQueue = [];
      g.obstacles.forEach((ob) => renderQueue.push({ z: ob.z, kind: 'ob', data: ob }));
      g.collectibles.forEach((c) => renderQueue.push({ z: c.z, kind: 'col', data: c }));
      if (g.partnerBannerZ !== null) {
        renderQueue.push({ z: g.partnerBannerZ, kind: 'banner' });
      }
      renderQueue.push({ z: 0.05, kind: 'player' });

      renderQueue.sort((a, b) => b.z - a.z);

      renderQueue.forEach((entry) => {
        if (entry.kind === 'ob') drawObstacle(entry.data, W, H);
        else if (entry.kind === 'col') drawCollectible(entry.data, W, H, timeSec);
        else if (entry.kind === 'banner') drawPartnerBanner(entry.z, W, H);
        else if (entry.kind === 'player') drawBackViewPet(W, H, g);
      });

      // 6. Vệt gió trắng mờ ở 2 mép màn hình khi tốc độ >= 1.5x
      const speedMultNow = g.speed / BASE_SPEED;
      if (g.phase === 'playing' && speedMultNow >= 1.5) {
        const windAlpha = Math.min(0.45, (speedMultNow - 1.4) * 0.35);
        ctx.save();
        ctx.strokeStyle = `rgba(255, 253, 249, ${windAlpha})`;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        g.windLines.forEach((wl) => {
          const progress = (timeSec * speedMultNow * 1.4 + wl.offset) % 1;
          const x = wl.side < 0 ? 12 + (wl.offset * 18) : W - 12 - (wl.offset * 18);
          const yStart = H * 0.2 + progress * H * 0.72;
          ctx.beginPath();
          ctx.moveTo(x, yStart);
          ctx.lineTo(x, yStart + wl.len * speedMultNow * 0.6);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 7. Hạt hiệu ứng
      const playerNow = project(g.lane, 0.05, 0, W, H);
      g.particles.forEach((pt) => {
        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.2;
        const rx = pt.anchorPlayer ? playerNow.x + pt.x : pt.x;
        const ry = pt.anchorPlayer ? playerNow.groundY + pt.y : pt.y;
        ctx.beginPath();
        ctx.arc(rx, ry, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      ctx.restore();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [petType, partnerBestScore, partnerName, finishRun, resetGame, executeJump]);

  const togglePause = () => {
    const g = gRef.current;
    if (g.phase === 'playing') {
      g.phase = 'paused';
      g.lastTime = null;
      setUiState((prev) => ({ ...prev, phase: 'paused' }));
    } else if (g.phase === 'paused') {
      g.phase = 'playing';
      g.lastTime = null;
      setUiState((prev) => ({ ...prev, phase: 'playing' }));
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ touchAction: uiState.phase === 'playing' ? 'none' : 'manipulation' }}
      className="fixed inset-0 z-[80] max-w-[430px] mx-auto h-[100dvh] bg-[#FFF8F0] overflow-hidden select-none flex flex-col"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* HUD TỐI GIẢN KHI CHẠY (Điểm, Xu, Tốc độ 1.0x -> 3.2x, Power-ups) */}
      <div
        style={{ top: 'max(env(safe-area-inset-top, 10px), 10px)' }}
        className="absolute inset-x-3 z-20 flex items-start justify-between gap-2 pointer-events-none"
      >
        <div className="flex flex-col gap-1.5">
          <div className="cozy-glass rounded-full px-3 py-1.5 border-[2px] border-[#4A3525] flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-black text-[#4A3525] tabular-nums">
              <Trophy className="w-3.5 h-3.5 text-[#E87A4D]" />
              <span>{uiState.score}</span>
            </div>
            <div className="h-3.5 w-[1.5px] bg-[#4A3525]/20" />
            <div className="flex items-center gap-1 text-xs font-black text-[#4A3525] tabular-nums">
              <Coins className="w-3.5 h-3.5 text-[#E87A4D]" />
              <span>{uiState.coins}</span>
            </div>
            <div className="h-3.5 w-[1.5px] bg-[#4A3525]/20" />
            <div className="flex items-center gap-0.5 text-[11px] font-black text-[#5EA87A] tabular-nums">
              <Gauge className="w-3.5 h-3.5" />
              <span>{uiState.speedMultiplier.toFixed(1)}x</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {uiState.hasShield && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#89CFF0] border-[1.6px] border-[#4A3525] text-[10.5px] font-black text-[#4A3525]">
                <Shield className="w-3 h-3" /> Khiên
              </span>
            )}
            {uiState.magnetLeft > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFB7C5] border-[1.6px] border-[#4A3525] text-[10.5px] font-black text-[#4A3525] tabular-nums">
                <Magnet className="w-3 h-3" /> {uiState.magnetLeft}s
              </span>
            )}
            {uiState.x2Left > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#88C9A1] border-[1.6px] border-[#4A3525] text-[10.5px] font-black text-[#4A3525] tabular-nums">
                <Sparkles className="w-3 h-3" /> x2 ({uiState.x2Left}s)
              </span>
            )}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          {uiState.phase === 'playing' || uiState.phase === 'paused' ? (
            <button
              type="button"
              onClick={togglePause}
              className="cozy-glass w-9 h-9 rounded-full border-[2px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90"
            >
              {uiState.phase === 'paused' ? (
                <Play className="w-4 h-4 fill-[#4A3525]" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onExit}
            className="cozy-glass w-9 h-9 rounded-full border-[2px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90"
            title="Về nhà chung"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BANNER TĂNG TỐC! */}
      {uiState.speedUpToast && !uiState.showPartnerToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-[#FFE082] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black shadow-md animate-bounce whitespace-nowrap">
          Tăng tốc! ({uiState.speedMultiplier.toFixed(1)}x)
        </div>
      )}

      {/* BANNER VƯỢT MẶT NGƯỜI KIA */}
      {uiState.showPartnerToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black shadow-lg animate-bounce whitespace-nowrap">
          Vượt mặt {partnerName || 'người kia'} rồi!
        </div>
      )}

      {/* MÀN HÌNH SẴN SÀNG BẮT ĐẦU */}
      {uiState.phase === 'ready' && (
        <div className="absolute inset-0 z-30 bg-[#4A3525]/30 backdrop-blur-[2px] flex items-center justify-center p-5">
          <div className="w-full max-w-xs bg-[#FFF8F0] rounded-[30px] border-[2.5px] border-[#4A3525] p-5 text-center shadow-2xl space-y-3.5">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[11px] font-black text-[#4A3525]">
              <span>Đua Kỷ Lục 3 Làn</span>
            </div>
            <h2 className="text-xl font-black text-[#4A3525]">
              {petName} Chạy Phố
            </h2>

            <div className="grid grid-cols-2 gap-2 text-left bg-[#FFFDF9] p-3 rounded-2xl border-[1.8px] border-[#4A3525] text-[11px] font-bold text-[#4A3525]">
              <div className="flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4 text-[#E87A4D]" />
                <span>Vuốt Trái/Phải: Né làn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronUp className="w-4 h-4 text-[#5EA87A]" />
                <span>Vuốt Lên: Nhảy rào</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <ChevronDown className="w-4 h-4 text-[#E85D75]" />
                <span>Vuốt Xuống: Trượt chui cổng / Rơi nhanh</span>
              </div>
            </div>

            {partnerBestScore > 0 && (
              <p className="text-xs font-extrabold text-[#7D6352]">
                Mục tiêu vượt mặt <strong className="text-[#E87A4D]">{partnerName}</strong>:{' '}
                <strong className="text-[#4A3525] tabular-nums">{partnerBestScore} điểm</strong>
              </p>
            )}

            <button
              type="button"
              onClick={() => resetGame(true)}
              className="tactile-btn w-full py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-[#4A3525]" />
              <span>Bắt Đầu Chạy Ngay!</span>
            </button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH TẠM DỪNG */}
      {uiState.phase === 'paused' && (
        <div className="absolute inset-0 z-30 bg-[#4A3525]/40 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="w-full max-w-xs bg-[#FFF8F0] rounded-[28px] border-[2.5px] border-[#4A3525] p-5 text-center space-y-3 shadow-2xl">
            <h3 className="text-lg font-black text-[#4A3525]">Đang Tạm Nghỉ</h3>
            <button
              type="button"
              onClick={togglePause}
              className="tactile-btn w-full py-2.5 rounded-2xl bg-[#88C9A1] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm"
            >
              Chạy Tiếp
            </button>
            <button
              type="button"
              onClick={() => resetGame(true)}
              className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FFE082] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm"
            >
              Chạy Lại Từ Đầu
            </button>
            <button
              type="button"
              onClick={onExit}
              className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm"
            >
              Về Nhà Chung
            </button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH TỔNG KẾT */}
      {uiState.phase === 'gameover' && (
        <div className="absolute inset-0 z-30 bg-[#4A3525]/45 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="w-full max-w-xs bg-[#FFF8F0] rounded-[30px] border-[2.5px] border-[#4A3525] p-5 text-center space-y-3 shadow-2xl">
            {uiState.isNewRecord ? (
              <span className="inline-block px-3 py-1 rounded-full bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[11px] font-black text-[#4A3525]">
                Kỷ Lục Cá Nhân Mới!
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full bg-[#FFB7C5] border-[1.6px] border-[#4A3525] text-[11px] font-black text-[#4A3525]">
                Hết Sức Rồi!
              </span>
            )}

            <h3 className="text-xl font-black text-[#4A3525]">
              {uiState.passedPartner
                ? `Đã vượt mặt ${partnerName}!`
                : `Chuyến chạy của ${playerName}`}
            </h3>

            <div className="grid grid-cols-3 gap-2 bg-[#FFFDF9] p-3 rounded-2xl border-2 border-[#4A3525]">
              <div>
                <div className="text-[10px] font-bold text-[#7D6352]">Điểm số</div>
                <div className="text-base font-black text-[#4A3525] tabular-nums">
                  {uiState.score}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#7D6352]">Quãng đường</div>
                <div className="text-base font-black text-[#4A3525] tabular-nums">
                  {uiState.distance}m
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#7D6352]">Xu thưởng</div>
                <div className="text-base font-black text-[#E87A4D] tabular-nums">
                  +{uiState.earnedRewardCoins}
                </div>
              </div>
            </div>

            <p className="text-[11px] font-bold text-[#7D6352]">
              +12 Vui vẻ • -6 Năng lượng • Tự động lưu kỷ lục phòng
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => resetGame(true)}
                className="tactile-btn flex-1 py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] font-black text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chạy lại ngay</span>
              </button>
              <button
                type="button"
                onClick={onExit}
                className="tactile-btn px-4 py-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] text-[#4A3525] font-black text-xs flex items-center justify-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span>Về nhà</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
