import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../services/soundEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, CloudRain, MessageSquareText } from 'lucide-react';
import {
  getTimeOfDay,
  resolvePetEmotion,
  normalizeEquippedRoom,
  normalizeKitchenSlots,
  normalizeBathroomSlots,
  ROOM_SLOTS_BY_ROOM,
  ROOM_LIST
} from '../utils/gameLogic';
import { WallBackdrop, FloorBackdrop } from './furniture/WallsAndFloors';
import { WindowSvg } from './furniture/Windows';
import { BedSvg } from './furniture/Beds';
import { RugSvg } from './furniture/Rugs';
import { PlantSvg } from './furniture/Plants';
import { DecorFurnitureSvg } from './furniture/DecorFurniture';
import { WallDecorSvg } from './furniture/WallDecor';
import {
  KitchenWallBackdrop,
  KitchenFloorBackdrop,
  FridgeSvg,
  StoveCounterSvg,
  KitchenDecorSvg,
  DiningTableSvg,
  PetBowlSvg
} from './furniture/KitchenFurniture';
import {
  BathWallBackdrop,
  BathFloorBackdrop,
  VanityMirrorSvg,
  BathDecorSvg,
  BathtubSvg,
  BathPropSvg,
  BathMatSvg
} from './furniture/BathroomFurniture';
import PetAvatar from './pet/PetAvatar';
import RoomLighting, { SunbeamOverlay } from './RoomLighting';
import SmartAsset from './common/SmartAsset';

/**
 * RoomStage — Hệ tọa độ khóa cứng 50% Tường / 50% Sàn (Chuẩn 390x844 iPhone)
 * Thứ tự Z-Index chuẩn:
 * - z-[0]:  Tường + Phào chỉ chân tường (tại mốc top: 50%) + Sàn
 * - z-[10]: Đồ trên tường (wallDecor, window, photoFrame, stickyNote)
 * - z-[15]: Chùm nắng xiên từ cửa sổ (SunbeamOverlay, pointer-events-none)
 * - z-[20]: Thảm trải sàn (rug)
 * - z-[25]: Đồ đứng sàn (plant, bed, decor) + Rác/Bụi + Hộp quà
 * - z-[30]: Thú cưng (PetAvatar)
 * - z-[40]: Lớp phủ ánh sáng ngày/hoàng hôn/đêm (RoomLighting, pointer-events-none)
 * - z-[50]: Lớp UI sắc nét tách khỏi ánh sáng (SpeechBubble, Floating Particles, Co-op Ball, Hotspots)
 */
export default function RoomStage({
  roomData,
  currentRoom = 'living',
  onChangeRoom,
  activeActionEvent = null,
  previewEquipped = null,
  isDecoratorMode = false,
  activeDecoratorSlot = 'wall',
  onSelectDecoratorSlot,
  timeOverride = 'auto',
  bothOnline = false,
  isTrayOpen = false,
  isPhotoMode = false,
  calibratorEmotionOverride = null,
  customAnchors = null,
  onPetTap,
  onCoopPlayBall,
  onCleanTrash,
  onOpenStickyNote,
  onOpenPhotoFrame,
  onOpenGift,
  onOpenChat,
  hasUnreadSticky = false
}) {
  const [hearts, setHearts] = useState([]);
  const [floatingBursts, setFloatingBursts] = useState([]);
  const [windowToast, setWindowToast] = useState(null);
  const [ballBounce, setBallBounce] = useState(false);
  const [plantWiggle, setPlantWiggle] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [fairyLightsOn, setFairyLightsOn] = useState(true);
  const [isPetted, setIsPetted] = useState(false);
  const [onBedByTap, setOnBedByTap] = useState(false);
  const [stoveSteaming, setStoveSteaming] = useState(false);
  const [mirrorWiped, setMirrorWiped] = useState(false);
  const [bathBubbles, setBathBubbles] = useState([]);
  const [isEatingAnim, setIsEatingAnim] = useState(false);
  const [isBathingAnim, setIsBathingAnim] = useState(false);
  const [nowDate, setNowDate] = useState(() => new Date());

  // Tọa độ thú cưng theo hệ trục (x%, y% từ đỉnh top container)
  const [petPos, setPetPos] = useState({
    x: 50,
    y: 71,
    facingLeft: false,
    isWalking: false
  });
  const [typedDialogue, setTypedDialogue] = useState('');

  const stageRef = useRef(null);
  const petComboRef = useRef({ count: 0, last: 0 });
  const swipeStartRef = useRef(null);
  const didSwipeAtRef = useRef(0);
  const lastRoomIdxRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const baseEquipped = normalizeEquippedRoom(roomData?.room?.equipped);
  const equipped = previewEquipped
    ? { ...baseEquipped, ...previewEquipped }
    : baseEquipped;

  const baseKitchen = normalizeKitchenSlots(roomData?.kitchenSlots);
  const kitchenEquipped = previewEquipped
    ? { ...baseKitchen, ...previewEquipped }
    : baseKitchen;

  const baseBathroom = normalizeBathroomSlots(roomData?.bathroomSlots);
  const bathroomEquipped = previewEquipped
    ? { ...baseBathroom, ...previewEquipped }
    : baseBathroom;

  const currentRoomIndex = Math.max(
    0,
    ROOM_LIST.findIndex((r) => r.id === currentRoom)
  );
  const slideDir = currentRoomIndex >= lastRoomIdxRef.current ? 1 : -1;
  useEffect(() => {
    lastRoomIdxRef.current = currentRoomIndex;
  }, [currentRoomIndex]);

  const spawnBathBubbles = (count = 8) => {
    const batch = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + Math.random() + i,
      x: 48 + Math.random() * 40,
      y: 46 + Math.random() * 14,
      size: 10 + Math.random() * 14,
      delay: i * 0.08
    }));
    setBathBubbles((prev) => [...prev.slice(-14), ...batch]);
    setTimeout(() => {
      setBathBubbles((prev) => prev.filter((b) => !batch.some((x) => x.id === b.id)));
    }, 1800);
  };

  // Xử lý hiệu ứng hành động theo phòng (Cho ăn ở Bếp / Tắm bồn ở Phòng Tắm)
  useEffect(() => {
    if (!activeActionEvent?.id) return;
    if (activeActionEvent.type === 'feed') {
      setIsEatingAnim(true);
      const t = setTimeout(() => setIsEatingAnim(false), 3200);
      return () => clearTimeout(t);
    }
    if (activeActionEvent.type === 'bath') {
      setIsBathingAnim(true);
      spawnBathBubbles(10);
      const bInterval = setInterval(() => spawnBathBubbles(6), 1100);
      const t = setTimeout(() => {
        setIsBathingAnim(false);
        clearInterval(bInterval);
      }, 4000);
      return () => {
        clearTimeout(t);
        clearInterval(bInterval);
      };
    }
  }, [activeActionEvent?.id, activeActionEvent?.type]);

  const pet = roomData?.pet || {};
  const stickyNote = roomData?.stickyNote || {};
  const photoFrame = roomData?.photoFrame || {};
  const mysteryGift = roomData?.mysteryGift || null;
  const trashList = Array.isArray(pet.trashList) ? pet.trashList : [];

  const timeInfo = getTimeOfDay(nowDate, timeOverride);
  const activeEmotion = calibratorEmotionOverride || resolvePetEmotion(pet, bothOnline);
  const aiBubble = pet.aiBubble || null;

  // Hiệu ứng gõ chữ mượt (Typewriter) cho bong bóng thoại AI
  useEffect(() => {
    const fullText = aiBubble?.dialogue || '';
    if (!fullText) {
      setTypedDialogue('');
      return;
    }
    let idx = 0;
    let tickN = 0;
    const isFresh = Date.now() - (aiBubble?.updatedAt || 0) < 6000;
    if (isFresh) soundEngine.play('petVoice', { species: pet.type || 'cat', vol: 0.7 });
    setTypedDialogue(fullText.slice(0, 1));
    const interval = setInterval(() => {
      idx += 2;
      tickN += 1;
      if (isFresh && tickN % 2 === 0) soundEngine.play('typeBlip');
      if (idx >= fullText.length) {
        setTypedDialogue(fullText);
        clearInterval(interval);
      } else {
        setTypedDialogue(fullText.slice(0, idx));
      }
    }, 24);

    return () => clearInterval(interval);
  }, [aiBubble?.dialogue, aiBubble?.updatedAt]);

  // Chu kỳ sống tự nhiên của Thú cưng theo từng phòng:
  // - living: ngủ/giường (36%, 54%), đi dạo trên sàn (24..76%, 66..75%)
  // - kitchen: bình thường (52%, 69%), đang ăn (68%, 69%) sát bát ăn
  // - bathroom: bình thường trên thảm (42%, 70%), đang tắm nhảy vào bồn (66%, 50%)
  useEffect(() => {
    if (currentRoom === 'kitchen') {
      if (isEatingAnim) {
        setPetPos({ x: 68, y: 69, facingLeft: false, isWalking: false });
      } else {
        setPetPos({ x: 52, y: 69, facingLeft: false, isWalking: false });
      }
      return;
    }

    if (currentRoom === 'bathroom') {
      if (isBathingAnim) {
        setPetPos({ x: 66, y: 50, facingLeft: false, isWalking: false });
      } else {
        setPetPos({ x: 42, y: 70, facingLeft: false, isWalking: false });
      }
      return;
    }

    const shouldGoToBed = Boolean(
      pet.isSleeping || (pet.energy ?? 80) < 25 || onBedByTap
    );
    if (shouldGoToBed) {
      setPetPos((prev) => ({
        x: 36,
        y: 54,
        facingLeft: prev.x > 36,
        isWalking: false
      }));
      return;
    }

    // Nếu vừa rời giường hoặc mới từ phòng khác qua thì bước xuống thảm giữa
    setPetPos((prev) =>
      prev.y < 63 || prev.x > 76 || prev.x < 24
        ? { x: 50, y: 71, facingLeft: false, isWalking: false }
        : prev
    );

    const walkTimer = setInterval(() => {
      setPetPos((prev) => {
        const nextX = 24 + Math.floor(Math.random() * 52); // 24% -> 76%
        const nextY = 66 + Math.floor(Math.random() * 9); // 66% -> 75%
        const goingLeft = nextX < prev.x;
        return {
          x: nextX,
          y: nextY,
          facingLeft: goingLeft,
          isWalking: Math.abs(nextX - prev.x) > 6
        };
      });

      setTimeout(() => {
        setPetPos((prev) => ({ ...prev, isWalking: false }));
      }, 1500);
    }, 9000);

    return () => clearInterval(walkTimer);
  }, [currentRoom, isEatingAnim, isBathingAnim, pet.isSleeping, pet.energy, onBedByTap]);

  const spawnBurst = (xPercent, yPercent, label, icon = '✨') => {
    const id = Date.now() + Math.random();
    setFloatingBursts((prev) => [
      ...prev.slice(-8),
      { id, x: xPercent, y: yPercent, label, icon }
    ]);
    setTimeout(() => {
      setFloatingBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1200);
  };

  const handleTouchPet = (e) => {
    e.stopPropagation();
    if (onBedByTap && !pet.isSleeping) {
      setOnBedByTap(false);
    }
    const nowTs = Date.now();
    const pc = petComboRef.current;
    pc.count = nowTs - pc.last < 1200 ? pc.count + 1 : 0;
    pc.last = nowTs;
    soundEngine.play('petPat', { comboIndex: pc.count });
    if (pc.count > 0 && pc.count % 4 === 0) {
      soundEngine.play('petVoice', { species: pet.type || 'cat' });
    }
    setIsPetted(true);
    setTimeout(() => setIsPetted(false), 650);

    const id = Date.now() + Math.random();
    const offsetX = Math.floor(Math.random() * 48) - 24;
    setHearts((prev) => [...prev.slice(-6), { id, offsetX }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1050);

    if (onPetTap) onPetTap();
  };

  const handleTouchBed = () => {
    soundEngine.play('tap');
    setOnBedByTap((prev) => !prev);
    spawnBurst(45, 52, onBedByTap ? 'Xuống thảm chơi!' : 'Lên giường nằm êm~', '🛏️');
  };

  const handleTouchWindow = () => {
    const nowTime = nowDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setWindowToast(`${nowTime} • ${timeInfo.label}`);
    setTimeout(() => setWindowToast(null), 3000);
  };

  const handleTouchPlant = () => {
    soundEngine.play('plantWiggle');
    setPlantWiggle(true);
    spawnBurst(16, 44, '', '🍃');
    setTimeout(() => setPlantWiggle(false), 650);
  };

  const handleTouchDecor = () => {
    if (equipped.decor === 'decor_lamp' || !equipped.decor) {
      soundEngine.play('lightSwitch');
      setLampOn((prev) => !prev);
      spawnBurst(82, 40, lampOn ? 'Tắt đèn' : 'Bật đèn', '💡');
    } else if (equipped.decor === 'decor_vinyl') {
      soundEngine.play('vinyl');
      spawnBurst(82, 40, 'Lo-Fi Chill~', '🎵');
    } else if (equipped.decor === 'decor_teatable') {
      soundEngine.play('teaSteam');
      spawnBurst(82, 44, 'Trà thơm ấm~', '🍵');
    } else {
      spawnBurst(82, 42, '', '✨');
    }
  };

  const handleTouchWallDecor = () => {
    if (!equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy') {
      soundEngine.play('lightSwitch');
      setFairyLightsOn((prev) => !prev);
      spawnBurst(50, 11, fairyLightsOn ? 'Tắt đèn dây' : 'Lung linh!', '✨');
    } else if (equipped.wallDecor === 'wdecor_clock') {
      handleTouchWindow();
    } else {
      spawnBurst(50, 12, '', '🌿');
    }
  };

  const handleTouchTrash = (trash) => {
    soundEngine.play('sparkle');
    spawnBurst(trash.x, trash.y - 3, '+5 Xu', '✨');
    if (onCleanTrash) onCleanTrash(trash.id);
  };

  const handlePlayCoopBallClick = () => {
    soundEngine.play('coin');
    setBallBounce(true);
    setTimeout(() => setBallBounce(false), 1400);
    if (onCoopPlayBall) onCoopPlayBall();
  };

  // Tương tác nội thất Nhà Bếp
  const handleTouchFridge = () => {
    soundEngine.play('paper');
    spawnBurst(17, 36, 'Giấy nhớ tủ lạnh!', '📝');
    if (onOpenStickyNote) onOpenStickyNote();
  };

  const handleTouchStove = () => {
    soundEngine.play('teaSteam');
    setStoveSteaming(true);
    spawnBurst(64, 34, 'Thơm lừng~', '🍲');
    setTimeout(() => setStoveSteaming(false), 1800);
  };

  const handleTouchDiningTable = () => {
    soundEngine.play('tap');
    spawnBurst(22, 56, 'Bánh ngọt ấm~', '🍰');
  };

  const handleTouchPetBowl = () => {
    soundEngine.play('eat');
    spawnBurst(81, 64, 'Măm măm~', '🥣');
  };

  // Tương tác nội thất Phòng Tắm
  const handleTouchVanity = () => {
    soundEngine.play('sparkle');
    setMirrorWiped(true);
    spawnBurst(22, 28, 'Sáng bóng!', '✨');
    setTimeout(() => setMirrorWiped(false), 1400);
  };

  const handleTouchBathDecor = () => {
    soundEngine.play('tap');
    spawnBurst(76, 22, 'Thơm oải hương~', '🫧');
  };

  const handleTouchBathtub = () => {
    soundEngine.play('bath');
    spawnBathBubbles(9);
    spawnBurst(68, 44, 'Bong bóng!', '🫧');
  };

  const handleTouchBathProp = () => {
    soundEngine.play('tap');
    spawnBurst(16, 52, 'Khăn bông êm~', '🦆');
  };

  // Vuốt ngang Trái/Phải trên màn hình (cả cảm ứng iPhone lẫn kéo chuột PC) để chuyển qua lại 3 phòng mượt
  const beginSwipe = (clientX, clientY) => {
    if (isDecoratorMode || isTrayOpen || !onChangeRoom) return;
    swipeStartRef.current = { x: clientX, y: clientY, t: Date.now() };
  };

  const endSwipe = (clientX, clientY) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || isDecoratorMode || isTrayOpen || !onChangeRoom) return;
    const dx = clientX - start.x;
    const dy = clientY - start.y;
    const dt = Date.now() - start.t;
    if (dt < 750 && Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      didSwipeAtRef.current = Date.now();
      // Vuốt sang trái (dx < 0) -> phòng kế tiếp; Vuốt sang phải (dx > 0) -> phòng trước (có vòng lặp 3 phòng mượt)
      const len = ROOM_LIST.length;
      const nextIdx = dx < 0 ? (currentRoomIndex + 1) % len : (currentRoomIndex - 1 + len) % len;
      soundEngine.play('sheetOpen');
      onChangeRoom(ROOM_LIST[nextIdx].id);
    }
  };

  const handleStageTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    beginSwipe(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleStageTouchEnd = (e) => {
    const touch = e.changedTouches?.[0];
    if (!touch) return;
    endSwipe(touch.clientX, touch.clientY);
  };

  const handleStagePointerDown = (e) => {
    if (e.pointerType === 'touch') return; // đã xử lý bằng touch events
    beginSwipe(e.clientX, e.clientY);
  };

  const handleStagePointerUp = (e) => {
    if (e.pointerType === 'touch') return;
    endSwipe(e.clientX, e.clientY);
  };

  const handleStageClickCapture = (e) => {
    // Chặn click nhầm vào đồ nội thất ngay sau khi vừa vuốt chuyển phòng
    if (Date.now() - didSwipeAtRef.current < 220) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const activeSlotsForRoom = ROOM_SLOTS_BY_ROOM[currentRoom] || ROOM_SLOTS_BY_ROOM.living;

  const isFairyWallDecor =
    !equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy';

  // Dynamic Horizontal Clamping cho bong bóng thoại AI (chống tràn mép trái/phải iPhone 390px)
  // Bong bóng luôn căn giữa màn hình (lề tối thiểu 14px), chỉ mũi tên dịch theo vị trí thú
  // Vị trí mũi tên tam giác tương đối trong hộp thoại để luôn chỉ thẳng về phía đầu thú
  const arrowOffsetPx = (petPos.x - 50) * 3.9;
  // Vị trí dọc bám ngay phía trên đầu thú (đỉnh đầu thú cách tâm petPos.y khoảng ~9% chiều cao)
  const bubbleBottomPercent = Math.min(82, Math.max(22, 100 - (petPos.y - 10)));

  return (
    <div
      ref={stageRef}
      onTouchStart={handleStageTouchStart}
      onTouchEnd={handleStageTouchEnd}
      onPointerDown={handleStagePointerDown}
      onPointerUp={handleStagePointerUp}
      onClickCapture={handleStageClickCapture}
      className="relative w-full h-full overflow-hidden select-none bg-[#C7A688] touch-pan-y"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentRoom}
          initial={{ opacity: 0.4, x: slideDir * 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0.4, x: -slideDir * 36 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {/* ===================================================================== */}
          {/* PHÒNG 1: PHÒNG KHÁCH (LIVING) — GIỮ NGUYÊN 100% TỌA ĐỘ CŨ             */}
          {/* ===================================================================== */}
          {currentRoom === 'living' && (
            <>
              {/* Z-[0]: TƯỜNG (top: 0% -> 50%) + PHÀO CHỈ + SÀN (50% -> 100%) */}
              <div className="absolute inset-x-0 top-0 h-[50%] z-[0]">
                <WallBackdrop wallId={equipped.wall} />
              </div>
              <div className="absolute inset-x-0 top-[50%] h-[50%] z-[0]">
                <FloorBackdrop floorId={equipped.floor} />
              </div>

      {/* ===================================================================== */}
      {/* Z-[10]: KHU VỰC ĐỒ TRÊN TƯỜNG (top: 0% -> 50%)                        */}
      {/* ===================================================================== */}

      {/* 1. wallDecor (Dây đèn Fairy Lights hoặc Đồng hồ / Kệ treo / Bảng ghi chú) */}
      <button
        type="button"
        onClick={handleTouchWallDecor}
        style={
          isFairyWallDecor
            ? { top: '13%', left: '12%', width: '76%' }
            : { top: '13%', left: '44%', width: '22%' }
        }
        className="absolute z-[10] active:scale-95 transition-transform focus:outline-none"
        title="Chạm để tương tác đồ treo tường"
      >
        <div className={isFairyWallDecor ? 'w-full h-14' : 'w-full aspect-square'}>
          <SmartAsset
            category="wallDecor"
            assetId={equipped.wallDecor}
            alt="Đồ treo tường"
            showShadow={false}
            className="w-full h-full object-contain"
            fallbackSvg={
              <WallDecorSvg
                wallDecorId={equipped.wallDecor}
                lightsOn={fairyLightsOn}
                nowDate={nowDate}
              />
            }
          />
        </div>
      </button>

      {/* 2. window (Cửa sổ - Cột Trái: top 16%, left 5%, width 34%, aspect 1/1.15) */}
      <button
        type="button"
        onClick={handleTouchWindow}
        style={{
          top: '16%',
          left: '5%',
          width: '34%',
          aspectRatio: '1 / 1.15'
        }}
        title="Chạm để xem giờ & thời tiết ngoài cửa sổ"
        className="absolute z-[10] active:scale-95 transition-transform focus:outline-none"
      >
        <SmartAsset
          category="windows"
          assetId={equipped.window}
          alt="Cửa sổ"
          showShadow={false}
          className="w-full h-full object-contain"
          fallbackSvg={
            <WindowSvg
              windowId={equipped.window}
              period={timeInfo.period}
              isSleeping={pet.isSleeping}
            />
          }
        />
      </button>

      {/* 3. photoFrame (Khung ảnh Polaroid - Cột Giữa: top 23%, left 43%, width 23%, aspect 3/3.6) */}
      <button
        type="button"
        onClick={onOpenPhotoFrame}
        style={{
          top: '23%',
          left: '43%',
          width: '23%',
          aspectRatio: '3 / 3.6'
        }}
        className="absolute z-[10] -rotate-2 hover:rotate-0 active:scale-95 transition-all focus:outline-none"
      >
        <div className="relative w-full h-full bg-[#FFFDF9] p-1.5 pb-2 rounded-xl border-[2.2px] border-[#4A3525] shadow-[0_5px_12px_rgba(74,53,37,0.14)] flex flex-col justify-between">
          {/* 2 mẩu băng dính Washi Tape pastel */}
          <span className="absolute -top-1.5 -left-1.5 z-20 w-5 h-2 bg-[#FFB7C5]/90 border border-[#4A3525]/40 rounded-sm -rotate-12" />
          <span className="absolute -top-1.5 -right-1.5 z-20 w-5 h-2 bg-[#88C9A1]/90 border border-[#4A3525]/40 rounded-sm rotate-12" />

          <div className="w-full flex-1 min-h-0 rounded-lg overflow-hidden border-[1.6px] border-[#4A3525] bg-[#FFF3E2]">
            {photoFrame?.imageData ? (
              <img
                src={photoFrame.imageData}
                alt={photoFrame.caption || 'Ảnh đôi'}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg viewBox="0 0 80 80" className="w-full h-full">
                <rect width="80" height="80" fill="#FFE8D6" />
                <circle cx="28" cy="36" r="9" fill="#FF9B71" stroke="#4A3525" strokeWidth="2" />
                <circle cx="52" cy="36" r="9" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2" />
                <path
                  d="M40 26 C40 26 33 19 33 15 C33 12 37 10 40 14 C43 10 47 12 47 15 C47 19 40 26 40 26 Z"
                  fill="#FF6B8B"
                />
              </svg>
            )}
          </div>
          <p className="mt-1 text-[10px] leading-tight font-extrabold text-[#4A3525] text-center truncate w-full">
            {photoFrame?.imageData ? photoFrame.caption || 'Kỷ niệm' : 'Treo ảnh'}
          </p>
        </div>
      </button>

      {/* 4. stickyNote (Bảng bần & Giấy nhớ - Cột Phải: KHÓA CỨNG top 17%, right 5%, width 25%, max-width 105px, aspect 1/1.05) */}
      <button
        type="button"
        onClick={onOpenStickyNote}
        style={{
          top: '17%',
          right: '5%',
          width: '25%',
          maxWidth: '105px',
          aspectRatio: '1 / 1.05'
        }}
        className="absolute z-[10] rotate-1 hover:rotate-0 active:scale-95 transition-all focus:outline-none"
      >
        <div className="relative w-full h-full rounded-2xl bg-[#C9925B] p-1 border-[2.2px] border-[#4A3525] shadow-[0_5px_12px_rgba(74,53,37,0.15)]">
          <div className="w-full h-full rounded-xl bg-[#DDA772] p-1 border border-[#4A3525]/35 relative overflow-hidden">
            <div className="w-full h-full rounded-lg bg-[#FFF3B0] p-1.5 border-[1.6px] border-[#4A3525] flex flex-col justify-between text-left overflow-hidden">
              {/* Đinh ghim đỏ */}
              <div className="mx-auto -mt-0.5 mb-0.5 w-2.5 h-2.5 rounded-full bg-[#FF6B6B] border-[1.4px] border-[#4A3525] shrink-0" />
              {stickyNote?.mode === 'drawing' && stickyNote?.drawingData ? (
                <img
                  src={stickyNote.drawingData}
                  alt="Nét vẽ tay"
                  className="w-full flex-1 min-h-0 object-contain rounded bg-[#FFFDF9]/75"
                />
              ) : (
                <p className="text-[9px] leading-tight font-extrabold text-[#4A3525] line-clamp-4 break-words overflow-hidden">
                  {stickyNote?.text || 'Chạm để ghi chú...'}
                </p>
              )}
              <span className="text-[7.5px] font-black text-[#7D6352] truncate w-full text-right shrink-0">
                {stickyNote?.author || 'Giấy nhớ'}
              </span>
            </div>

            {hasUnreadSticky && (
              <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#FF5A5F] border-[1.5px] border-[#FFFDF9] animate-bounce shadow" />
            )}
          </div>
        </div>
      </button>

      {/* ===================================================================== */}
      {/* Z-[15]: CHÙM TIA NẮNG XIÊN TỪ CỬA SỔ                                 */}
      {/* ===================================================================== */}
      <SunbeamOverlay period={timeInfo.period} isSleeping={pet.isSleeping} />

      {/* ===================================================================== */}
      {/* Z-[20]: THẢM TRẢI SÀN (Trung tâm sàn trước: left 50%, top 68%, w 66%) */}
      {/* ===================================================================== */}
      <div
        style={{
          left: '50%',
          top: '68%',
          width: '66%'
        }}
        className="absolute -translate-x-1/2 z-[20] pointer-events-none"
      >
        <SmartAsset
          category="rugs"
          assetId={equipped.rug}
          alt="Thảm trải sàn"
          showShadow={false}
          className="w-full h-full object-contain"
          fallbackSvg={<RugSvg rugId={equipped.rug} />}
        />
      </div>

      {/* ===================================================================== */}
      {/* Z-[25]: ĐỒ ĐỨNG SÀN (plant, bed, decor) + RÁC + HỘP QUÀ               */}
      {/* ===================================================================== */}

      {/* 5. plant (Cây cảnh - Góc Sau-Trái: left 4%, top 41%, width 24%) */}
      <motion.button
        type="button"
        onClick={handleTouchPlant}
        animate={
          plantWiggle
            ? { rotate: [0, -7, 7, -4, 3, 0], scale: [1, 1.06, 0.96, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.55 }}
        style={{
          left: '4%',
          top: '41%',
          width: '24%'
        }}
        className="absolute z-[25] focus:outline-none cursor-pointer"
        title="Chạm để rung rinh lá cây"
      >
        <SmartAsset
          category="plants"
          assetId={equipped.plant}
          alt="Cây cảnh"
          showShadow={true}
          fallbackSvg={<PlantSvg plantId={equipped.plant} />}
        />
      </motion.button>

      {/* 6. bed (Giường thú - Góc Giữa-Trái trên sàn: left 29%, top 51%, width 32% — tách biệt hoàn toàn với thảm!) */}
      <button
        type="button"
        onClick={handleTouchBed}
        style={{
          left: '20%',
          top: '48%',
          width: '32%'
        }}
        className="absolute z-[25] active:scale-95 transition-transform focus:outline-none cursor-pointer"
        title="Chạm để gọi bé lên giường nghỉ ngơi"
      >
        <SmartAsset
          category="beds"
          assetId={equipped.bed}
          alt="Giường thú cưng"
          showShadow={true}
          fallbackSvg={<BedSvg bedId={equipped.bed} />}
        />
      </button>

      {/* 7. decor (Nội thất lớn - Góc Sau-Phải: right 4%, top 37%, width 31%) */}
      <motion.button
        type="button"
        onClick={handleTouchDecor}
        whileTap={{ scale: 0.95 }}
        style={{
          right: '5%',
          top: '38%',
          width: '28%',
          maxWidth: '94%'
        }}
        className="absolute z-[25] focus:outline-none cursor-pointer"
        title="Chạm để bật/tắt đèn hoặc tương tác nội thất"
      >
        <SmartAsset
          category="decor"
          assetId={equipped.decor}
          alt="Đồ nội thất"
          showShadow={true}
          fallbackSvg={
            <DecorFurnitureSvg
              decorId={equipped.decor}
              lampOn={lampOn}
              isNight={timeInfo.isNight}
            />
          }
        />
      </motion.button>

      {/* Hộp quà bất ngờ (Mystery Gift) đặt gọn bên phải sàn trước */}
      <AnimatePresence>
        {mysteryGift && (
          <motion.button
            type="button"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: [0, -4, 4, 0] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onOpenGift}
            style={{ right: '5%', top: '67%' }}
            className="absolute z-[25] flex flex-col items-center active:scale-90"
          >
            <div className="relative w-13 h-13 rounded-2xl bg-[#FF9B71] border-[2.4px] border-[#4A3525] shadow-md flex items-center justify-center p-2.5">
              <Gift className="w-7 h-7 text-[#FFFDF9]" />
              <span className="absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[8.5px] font-black shadow">
                QUÀ!
              </span>
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-[#4A3525] text-[#FFF8F0] text-[9px] font-extrabold shadow">
              Từ {mysteryGift.senderName}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cục rác / bụi trên sàn (giới hạn trong vùng sàn trống top: 68% -> 78%) */}
      {trashList.map((trash) => {
        const safeTop = Math.max(68, Math.min(78, trash.y));
        const safeLeft = Math.max(20, Math.min(80, trash.x));
        return (
          <motion.button
            key={trash.id}
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 1.35 }}
            onClick={() => handleTouchTrash({ ...trash, x: safeLeft, y: safeTop })}
            style={{ left: `${safeLeft}%`, top: `${safeTop}%` }}
            className="absolute z-[25] -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            title="Chạm để dọn sạch (+5 Xu)"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 overflow-visible">
                <ellipse cx="20" cy="31" rx="13" ry="4" fill="#3D2616" fillOpacity="0.16" />
                {trash.type === 'dust' ? (
                  <path
                    d="M10 26 C7 22 10 16 15 17 C18 13 25 13 27 17 C32 17 34 22 30 26 Z"
                    fill="#D6C7B8"
                    stroke="#4A3525"
                    strokeWidth="2.2"
                  />
                ) : (
                  <>
                    <circle cx="16" cy="24" r="4.5" fill="#DDA772" stroke="#4A3525" strokeWidth="2" />
                    <circle cx="25" cy="26" r="3.5" fill="#C9925B" stroke="#4A3525" strokeWidth="2" />
                    <circle cx="21" cy="20" r="2.5" fill="#FFE082" stroke="#4A3525" strokeWidth="1.8" />
                  </>
                )}
              </svg>
              <span className="absolute -top-2 px-1 rounded-full bg-[#88C9A1] border border-[#4A3525] text-[#4A3525] text-[8px] font-black shadow-sm">
                +5 xu
              </span>
            </div>
          </motion.button>
        );
      })}
            </>
          )}

          {/* ===================================================================== */}
          {/* PHÒNG 2: NHÀ BẾP (KITCHEN) — 6 SLOT KHÓA CỨNG CHUẨN 390x844           */}
          {/* ===================================================================== */}
          {currentRoom === 'kitchen' && (
            <>
              <div className="absolute inset-x-0 top-0 h-[50%] z-[0]">
                <SmartAsset
                  category="kitchen"
                  assetId={kitchenEquipped.kitchenWall}
                  showShadow={false}
                  className="w-full h-full object-cover"
                  fallbackSvg={<KitchenWallBackdrop wallId={kitchenEquipped.kitchenWall} />}
                />
              </div>
              <div className="absolute inset-x-0 top-[50%] h-[50%] z-[0]">
                <SmartAsset
                  category="kitchen"
                  assetId={kitchenEquipped.kitchenFloor}
                  showShadow={false}
                  className="w-full h-full object-cover"
                  fallbackSvg={<KitchenFloorBackdrop floorId={kitchenEquipped.kitchenFloor} />}
                />
              </div>

              {/* Kệ gia vị / Dụng cụ treo tường phía trên bếp: left 40%, top 16%, width 48% */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.play('tap');
                  spawnBurst(64, 18, 'Gia vị thơm~', '🌿');
                }}
                style={{ left: '40%', top: '16%', width: '48%' }}
                className="absolute z-[10] active:scale-95 transition-transform focus:outline-none"
                title="Kệ gia vị bếp"
              >
                <SmartAsset
                  category="kitchen"
                  assetId={kitchenEquipped.kitchenDecor}
                  alt="Kệ bếp"
                  showShadow={false}
                  className="w-full h-auto object-contain"
                  fallbackSvg={<KitchenDecorSvg decorId={kitchenEquipped.kitchenDecor} />}
                />
              </button>

              {/* Tủ lạnh vintage - Góc Sau-Trái: left 4%, top 25%, width 27% */}
              <motion.button
                type="button"
                onClick={handleTouchFridge}
                whileTap={{ scale: 0.96 }}
                style={{ left: '4%', top: '25%', width: '27%' }}
                className="absolute z-[20] focus:outline-none cursor-pointer"
                title="Chạm tủ lạnh để xem Giấy nhớ"
              >
                <SmartAsset
                  category="kitchen"
                  assetId={kitchenEquipped.fridge}
                  alt="Tủ lạnh"
                  showShadow={true}
                  fallbackSvg={<FridgeSvg fridgeId={kitchenEquipped.fridge} />}
                />
              </motion.button>

              {/* Hệ tủ bếp & Bếp nấu - Góc Sau-Phải: left 34%, top 34%, width 62% */}
              <motion.button
                type="button"
                onClick={handleTouchStove}
                whileTap={{ scale: 0.98 }}
                style={{ left: '34%', top: '34%', width: '62%' }}
                className="absolute z-[20] focus:outline-none cursor-pointer"
                title="Chạm bếp để nấu sôi súp ấm"
              >
                <SmartAsset
                  category="kitchen"
                  assetId={kitchenEquipped.stoveCounter}
                  alt="Tủ bếp & bếp nấu"
                  showShadow={true}
                  fallbackSvg={
                    <StoveCounterSvg
                      stoveId={kitchenEquipped.stoveCounter}
                      steaming={stoveSteaming}
                    />
                  }
                />
              </motion.button>

              {/* Bàn ăn mini - Góc Trái-Trước trên sàn: left 4%, top 57%, width 36% */}
              <motion.button
                type="button"
                onClick={handleTouchDiningTable}
                whileTap={{ scale: 0.96 }}
                style={{ left: '4%', top: '57%', width: '36%' }}
                className="absolute z-[25] focus:outline-none cursor-pointer"
                title="Bàn ăn mini"
              >
                <SmartAsset
                  category="kitchen"
                  assetId={kitchenEquipped.diningTable}
                  alt="Bàn ăn mini"
                  showShadow={true}
                  fallbackSvg={<DiningTableSvg tableId={kitchenEquipped.diningTable} />}
                />
              </motion.button>

              {/* Góc ăn của Bé (Bát ăn đôi) - Góc Phải-Trước trên sàn: right 6%, top 66%, width 26% */}
              <motion.button
                type="button"
                onClick={handleTouchPetBowl}
                whileTap={{ scale: 0.95 }}
                style={{ right: '6%', top: '66%', width: '26%' }}
                className="absolute z-[25] focus:outline-none cursor-pointer"
                title="Bát ăn của bé"
              >
                <SmartAsset
                  category="kitchen"
                  assetId={kitchenEquipped.petBowl}
                  alt="Bát ăn thú cưng"
                  showShadow={false}
                  fallbackSvg={<PetBowlSvg bowlId={kitchenEquipped.petBowl} />}
                />
              </motion.button>
            </>
          )}

          {/* ===================================================================== */}
          {/* PHÒNG 3: PHÒNG TẮM (BATHROOM) — 6 SLOT KHÓA CỨNG CHUẨN 390x844        */}
          {/* ===================================================================== */}
          {currentRoom === 'bathroom' && (
            <>
              <div className="absolute inset-x-0 top-0 h-[50%] z-[0]">
                <SmartAsset
                  category="bathroom"
                  assetId={bathroomEquipped.bathWall}
                  showShadow={false}
                  className="w-full h-full object-cover"
                  fallbackSvg={<BathWallBackdrop wallId={bathroomEquipped.bathWall} />}
                />
              </div>
              <div className="absolute inset-x-0 top-[50%] h-[50%] z-[0]">
                <SmartAsset
                  category="bathroom"
                  assetId={bathroomEquipped.bathFloor}
                  showShadow={false}
                  className="w-full h-full object-cover"
                  fallbackSvg={<BathFloorBackdrop floorId={bathroomEquipped.bathFloor} />}
                />
              </div>

              {/* Bồn rửa mặt & Gương treo - Góc Sau-Trái: left 5%, top 23%, width 34% */}
              <motion.button
                type="button"
                onClick={handleTouchVanity}
                whileTap={{ scale: 0.96 }}
                style={{ left: '5%', top: '23%', width: '34%' }}
                className="absolute z-[20] focus:outline-none cursor-pointer"
                title="Chạm gương để lau sáng bóng"
              >
                <SmartAsset
                  category="bathroom"
                  assetId={bathroomEquipped.vanityMirror}
                  alt="Gương & chậu rửa"
                  showShadow={true}
                  fallbackSvg={
                    <VanityMirrorSvg
                      vanityId={bathroomEquipped.vanityMirror}
                      wiped={mirrorWiped}
                    />
                  }
                />
              </motion.button>

              {/* Kệ khăn / Cửa sổ kính mờ - Góc Tường Phải: right 5%, top 17%, width 38% */}
              <button
                type="button"
                onClick={handleTouchBathDecor}
                style={{ right: '5%', top: '17%', width: '38%' }}
                className="absolute z-[10] active:scale-95 transition-transform focus:outline-none"
                title="Kệ khăn phòng tắm"
              >
                <SmartAsset
                  category="bathroom"
                  assetId={bathroomEquipped.bathDecor}
                  alt="Kệ khăn phòng tắm"
                  showShadow={false}
                  className="w-full h-auto object-contain"
                  fallbackSvg={<BathDecorSvg decorId={bathroomEquipped.bathDecor} />}
                />
              </button>

              {/* Thảm chân bông - Giữa-Trái sàn trước: left 16%, top 68%, width 50% */}
              <div
                style={{ left: '16%', top: '68%', width: '50%' }}
                className="absolute z-[20] pointer-events-none"
              >
                <SmartAsset
                  category="bathroom"
                  assetId={bathroomEquipped.bathMat}
                  alt="Thảm chân bông"
                  showShadow={false}
                  className="w-full h-auto object-contain"
                  fallbackSvg={<BathMatSvg matId={bathroomEquipped.bathMat} />}
                />
              </div>

              {/* Đồ góc phòng tắm - Góc Trái-Giữa sàn: left 5%, top 54%, width 22% */}
              <motion.button
                type="button"
                onClick={handleTouchBathProp}
                whileTap={{ scale: 0.95 }}
                style={{ left: '5%', top: '54%', width: '22%' }}
                className="absolute z-[25] focus:outline-none cursor-pointer"
                title="Đồ góc phòng tắm"
              >
                <SmartAsset
                  category="bathroom"
                  assetId={bathroomEquipped.bathProp}
                  alt="Đồ góc phòng tắm"
                  showShadow={true}
                  fallbackSvg={<BathPropSvg propId={bathroomEquipped.bathProp} />}
                />
              </motion.button>

              {/* Bồn tắm - Góc Phải-Giữa sàn: right 5%, top 46%, width 55% */}
              <motion.button
                type="button"
                onClick={handleTouchBathtub}
                whileTap={{ scale: 0.98 }}
                style={{ right: '5%', top: '46%', width: '55%' }}
                className="absolute z-[25] focus:outline-none cursor-pointer"
                title="Chạm bồn tắm để thổi bong bóng xà phòng"
              >
                <SmartAsset
                  category="bathroom"
                  assetId={bathroomEquipped.bathtub}
                  alt="Bồn tắm"
                  showShadow={true}
                  fallbackSvg={
                    <BathtubSvg
                      tubId={bathroomEquipped.bathtub}
                      showFrontFoam={isBathingAnim}
                    />
                  }
                />
              </motion.button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* Z-[30]: THÚ CƯNG SỐNG ĐỘNG (PetAvatar)                                */}
      {/* ===================================================================== */}
      <motion.div
        animate={{
          left: `${petPos.x}%`,
          top: `${petPos.y}%`
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut'
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-[30] flex flex-col items-center"
      >
        {/* Nhãn cảm xúc nhỏ gọn (Zzz / Đói / Dỗi) */}
        {activeEmotion === 'sulky' ? (
          <div className="mb-0.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4A3525] text-[#FFF8F0] text-[9.5px] font-extrabold animate-bounce shadow">
            <CloudRain className="w-3 h-3 text-[#89CFF0]" />
            <span>Đang dỗi!</span>
          </div>
        ) : activeEmotion === 'hungry' ? (
          <div className="mb-0.5 px-2 py-0.5 rounded-full bg-[#FFFDF9] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[9.5px] font-black animate-bounce shadow-sm">
            Đói bụng quá~
          </div>
        ) : pet.isSleeping || activeEmotion === 'sleepy' ? (
          <div className="mb-0.5 px-2 py-0.5 rounded-full bg-[#FFFDF9]/95 border-[1.6px] border-[#4A3525] text-[#4A3525] text-[9.5px] font-black animate-pulse shadow-sm">
            Zzz...
          </div>
        ) : null}

        {/* Chùm tim bay lên khi vuốt ve */}
        <div className="pointer-events-none absolute -top-6 inset-x-0 flex justify-center">
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: 6, x: h.offsetX, scale: 0.7 }}
                animate={{ opacity: 0, y: -48, x: h.offsetX * 1.2, scale: 1.15 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute"
              >
                <svg viewBox="0 0 28 28" className="w-5 h-5">
                  <path
                    d="M14 24 C14 24 4 17 4 10 C4 6 8 4 11 7 L14 10 L17 7 C20 4 24 6 24 10 C24 17 14 24 14 24 Z"
                    fill="#FF7B8B"
                    stroke="#4A3525"
                    strokeWidth="2"
                  />
                </svg>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cuộn len nảy khi chơi tung bóng Co-op */}
        <AnimatePresence>
          {ballBounce && (
            <motion.div
              initial={{ y: 0, x: -40, rotate: 0 }}
              animate={{
                y: [-8, -60, 0, -36, 0],
                x: [-36, 0, 36, 10, 0],
                rotate: 360
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3 }}
              className="absolute -top-6 z-[35]"
            >
              <svg viewBox="0 0 36 36" className="w-7 h-7">
                <circle cx="18" cy="18" r="14" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.3" />
                <path d="M8 14 Q18 22 28 14 M10 22 Q18 12 26 22" fill="none" stroke="#4A3525" strokeWidth="2" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nhân vật Thú cưng */}
        <button
          type="button"
          onClick={handleTouchPet}
          className="focus:outline-none cursor-pointer"
          title={`Chạm để xoa đầu ${pet.name || 'Mochi'}`}
        >
          <PetAvatar
            type={pet.type || 'cat'}
            emotion={isBathingAnim || isEatingAnim ? 'happy' : activeEmotion}
            isSleeping={
              calibratorEmotionOverride
                ? calibratorEmotionOverride === 'sleepy'
                : currentRoom === 'living' && pet.isSleeping
            }
            accessoryId={equipped.accessory}
            customAnchors={customAnchors}
            isPetted={isPetted || isEatingAnim || isBathingAnim}
            facingLeft={petPos.facingLeft}
            isWalking={petPos.isWalking}
          />
        </button>

        {/* Lớp bọt xà phòng trắng mịn + vịt cao su che ngang bụng khi bé đang tắm trong bồn */}
        {currentRoom === 'bathroom' && isBathingAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: [0.96, 1.04, 0.96] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="pointer-events-none absolute -bottom-2 inset-x-0 flex justify-center z-[34]"
          >
            <svg viewBox="0 0 130 46" className="w-28 h-10 overflow-visible">
              <g fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.2">
                <circle cx="24" cy="28" r="13" />
                <circle cx="46" cy="24" r="16" />
                <circle cx="70" cy="25" r="15" />
                <circle cx="92" cy="24" r="15" />
                <circle cx="110" cy="29" r="11" />
              </g>
              {/* Chú vịt cao su vàng ngồi trên bọt */}
              <g transform="translate(82, 4)">
                <ellipse cx="14" cy="18" rx="10" ry="7" fill="#FFE066" stroke="#4A3525" strokeWidth="2" />
                <circle cx="9" cy="10" r="6.5" fill="#FFE066" stroke="#4A3525" strokeWidth="2" />
                <path d="M1 10 L5 8 L5 12 Z" fill="#FF9B71" stroke="#4A3525" strokeWidth="1.5" />
                <circle cx="8" cy="9" r="1.2" fill="#4A3525" />
              </g>
            </svg>
          </motion.div>
        )}

        {/* Hiệu ứng nhai đồ ăn khi đang ở Bếp */}
        {currentRoom === 'kitchen' && isEatingAnim && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0.8, 1, 0.8], y: [-2, -8, -2] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="pointer-events-none absolute -top-5 px-2.5 py-0.5 rounded-full bg-[#FFE082] border-[1.8px] border-[#4A3525] text-[10px] font-black text-[#4A3525] shadow"
          >
            Ngon quá~ 🍽️
          </motion.div>
        )}
      </motion.div>

      {/* Bong bóng xà phòng trong suốt bay lên trong Phòng Tắm */}
      {currentRoom === 'bathroom' && (
        <div className="pointer-events-none absolute inset-0 z-[36] overflow-hidden">
          <AnimatePresence>
            {bathBubbles.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0.85, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, y: -120, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, delay: b.delay, ease: 'easeOut' }}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: b.size,
                  height: b.size
                }}
                className="absolute rounded-full border-[1.6px] border-[#78C2E6] bg-white/60 shadow-inner"
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ===================================================================== */}
      {/* Z-[40]: LỚP PHỦ ÁNH SÁNG NGÀY / HOÀNG HÔN / ĐÊM (RoomLighting)        */}
      {/* ===================================================================== */}
      <RoomLighting
        period={timeInfo.period}
        isSleeping={pet.isSleeping}
        lampOn={lampOn}
        fairyLightsOn={fairyLightsOn}
        equipped={equipped}
      />

      {/* ===================================================================== */}
      {/* Z-[50]: LỚP UI SẮC NÉT TÁCH KHỎI LỚP LỌC ÁNH SÁNG (Lighting Isolation)*/}
      {/* ===================================================================== */}

      {/* Toast thời gian khi chạm cửa sổ */}
      <AnimatePresence>
        {windowToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-[13%] left-4 z-[50] cozy-glass-dark text-[#FFF8F0] text-xs font-extrabold px-3.5 py-1.5 rounded-full"
          >
            {windowToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BONG BÓNG THOẠI AI — Bám sát ngay trên đầu thú, tự clamping ngang không tràn mép, sáng rõ 100% */}
      {aiBubble?.dialogue && !isDecoratorMode && !isTrayOpen && !isPhotoMode && (
        <motion.div
          key={aiBubble.updatedAt || aiBubble.dialogue}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: 1,
            scale: 1,
            bottom: `${bubbleBottomPercent}%`
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ left: 14, right: 14 }}
          className="absolute z-[50] flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto relative w-fit max-w-[min(280px,calc(100vw-28px))] bg-[#FFFDF9]/95 text-[#4A3525] border-2 border-[#4A3525]/85 rounded-2xl px-3 py-2 shadow-lg">
            <div className="flex items-start gap-2">
              <p className="text-[11.5px] font-extrabold text-[#4A3525] leading-snug whitespace-normal break-words min-w-0">
                {typedDialogue}
              </p>
              <button
                type="button"
                onClick={onOpenChat}
                className="p-1 rounded-lg bg-[#FFF3E2] border border-[#4A3525]/35 text-[#4A3525] shrink-0 active:scale-90 mt-0.5"
                title="Mở khung trò chuyện với bé"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Mũi tên tam giác dịch theo vị trí thú, luôn nằm trong thân bong bóng */}
            <div
              style={{
                left: `clamp(18px, calc(50% + ${arrowOffsetPx}px), calc(100% - 18px))`
              }}
              className="absolute -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-[#FFFDF9] border-r-2 border-b-2 border-[#4A3525]/85 rotate-45"
            />
          </div>
        </motion.div>
      )}
      {/* Nút Co-op "Cùng chơi tung bóng (+20 Xu)" đặt gọn ngay trên cụm Bottom Dock */}
      {bothOnline && !isDecoratorMode && !isTrayOpen && !isPhotoMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            bottom: 'calc(max(env(safe-area-inset-bottom, 10px), 10px) + 140px)'
          }}
          className="absolute left-1/2 -translate-x-1/2 z-[50]"
        >
          <button
            type="button"
            onClick={handlePlayCoopBallClick}
            className="tactile-btn flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-[11.5px] font-black shadow-lg whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cùng chơi tung bóng (+20 Xu)</span>
          </button>
        </motion.div>
      )}

      {/* Hiệu ứng hạt nổi & chữ nổi (+5 Xu, Lá bay, Nốt nhạc) */}
      <AnimatePresence>
        {floatingBursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 1, y: 0, scale: 0.75 }}
            animate={{ opacity: 0, y: -38, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: 'easeOut' }}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            className="pointer-events-none absolute z-[50] -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF9]/95 border-[1.8px] border-[#4A3525] shadow-md text-xs font-black text-[#4A3525]"
          >
            <span>{b.icon}</span>
            {b.label && <span>{b.label}</span>}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Chấm neo Slot Hotspots khi bật Live Decorator Studio */}
      <AnimatePresence>
        {isDecoratorMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[50] pointer-events-none"
          >
            {activeSlotsForRoom.map((slot) => {
              const isSelected = activeDecoratorSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() =>
                    onSelectDecoratorSlot && onSelectDecoratorSlot(slot.id)
                  }
                  style={{
                    left: `${slot.hotspot.x}%`,
                    top: `${slot.hotspot.y}%`
                  }}
                  className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-[#4A3525] transition-all shadow-md ${
                    isSelected
                      ? 'bg-[#FF9B71] text-[#4A3525] scale-110 ring-4 ring-[#FFE082]/70'
                      : 'bg-[#FFFDF9]/95 text-[#4A3525] hover:scale-105'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full border border-[#4A3525] ${
                      isSelected ? 'bg-[#FFFDF9] animate-ping' : 'bg-[#88C9A1]'
                    }`}
                  />
                  <span className="text-[9.5px] font-black whitespace-nowrap">
                    {slot.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
