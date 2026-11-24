import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, CloudRain, MessageSquareText } from 'lucide-react';
import {
  getTimeOfDay,
  resolvePetEmotion,
  normalizeEquippedRoom,
  ROOM_SLOTS
} from '../utils/gameLogic';
import { WallBackdrop, FloorBackdrop } from './furniture/WallsAndFloors';
import { WindowSvg } from './furniture/Windows';
import { BedSvg } from './furniture/Beds';
import { RugSvg } from './furniture/Rugs';
import { PlantSvg } from './furniture/Plants';
import { DecorFurnitureSvg } from './furniture/DecorFurniture';
import { WallDecorSvg } from './furniture/WallDecor';
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
  const [nowDate, setNowDate] = useState(() => new Date());

  // Tọa độ thú cưng theo hệ trục (x%, y% từ đỉnh top container)
  // Vùng đi dạo hợp lệ trên sàn: x từ 22% -> 78%, y từ 66% -> 76%
  // Khi lên giường ngủ: x = 45%, y = 57%
  const [petPos, setPetPos] = useState({
    x: 50,
    y: 71,
    facingLeft: false,
    isWalking: false
  });
  const [typedDialogue, setTypedDialogue] = useState('');

  const stageRef = useRef(null);

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
    setTypedDialogue(fullText.slice(0, 1));
    const interval = setInterval(() => {
      idx += 2;
      if (idx >= fullText.length) {
        setTypedDialogue(fullText);
        clearInterval(interval);
      } else {
        setTypedDialogue(fullText.slice(0, idx));
      }
    }, 24);

    return () => clearInterval(interval);
  }, [aiBubble?.dialogue, aiBubble?.updatedAt]);

  // Chu kỳ sống tự nhiên của Thú cưng:
  // - Khi ngủ / energy < 25 / người chơi bấm vào giường -> đi về tâm giường (x: 45%, y: 57%)
  // - Khi thức -> đi dạo tự do trên vùng sàn quanh thảm (x: 24% -> 76%, y: 66% -> 75%)
  useEffect(() => {
    const shouldGoToBed = Boolean(
      pet.isSleeping || (pet.energy ?? 80) < 25 || onBedByTap
    );
    if (shouldGoToBed) {
      setPetPos((prev) => ({
        x: 45,
        y: 57,
        facingLeft: prev.x > 45,
        isWalking: false
      }));
      return;
    }

    // Nếu vừa rời giường thì bước xuống thảm
    setPetPos((prev) =>
      prev.y < 63 ? { x: 50, y: 71, facingLeft: false, isWalking: false } : prev
    );

    const walkTimer = setInterval(() => {
      setPetPos((prev) => {
        const nextX = 24 + Math.floor(Math.random() * 52); // 24% -> 76%
        const nextY = 66 + Math.floor(Math.random() * 9);  // 66% -> 75%
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
  }, [pet.isSleeping, pet.energy, onBedByTap]);

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
    setPlantWiggle(true);
    spawnBurst(16, 44, '', '🍃');
    setTimeout(() => setPlantWiggle(false), 650);
  };

  const handleTouchDecor = () => {
    if (equipped.decor === 'decor_lamp' || !equipped.decor) {
      setLampOn((prev) => !prev);
      spawnBurst(82, 40, lampOn ? 'Tắt đèn' : 'Bật đèn', '💡');
    } else if (equipped.decor === 'decor_vinyl') {
      spawnBurst(82, 40, 'Lo-Fi Chill~', '🎵');
    } else if (equipped.decor === 'decor_teatable') {
      spawnBurst(82, 44, 'Trà thơm ấm~', '🍵');
    } else {
      spawnBurst(82, 42, '', '✨');
    }
  };

  const handleTouchWallDecor = () => {
    if (!equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy') {
      setFairyLightsOn((prev) => !prev);
      spawnBurst(50, 11, fairyLightsOn ? 'Tắt đèn dây' : 'Lung linh!', '✨');
    } else if (equipped.wallDecor === 'wdecor_clock') {
      handleTouchWindow();
    } else {
      spawnBurst(50, 12, '', '🌿');
    }
  };

  const handleTouchTrash = (trash) => {
    spawnBurst(trash.x, trash.y - 3, '+5 Xu', '✨');
    if (onCleanTrash) onCleanTrash(trash.id);
  };

  const handlePlayCoopBallClick = () => {
    setBallBounce(true);
    setTimeout(() => setBallBounce(false), 1400);
    if (onCoopPlayBall) onCoopPlayBall();
  };

  const isFairyWallDecor =
    !equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy';

  // Dynamic Horizontal Clamping cho bong bóng thoại AI (chống tràn mép trái/phải iPhone 390px)
  const bubbleCenterX = Math.min(Math.max(petPos.x, 30), 70);
  // Vị trí mũi tên tam giác tương đối trong hộp thoại để luôn chỉ thẳng về phía đầu thú
  const arrowOffsetPx = Math.max(-68, Math.min(68, (petPos.x - bubbleCenterX) * 3.4));
  // Vị trí dọc bám ngay phía trên đầu thú (đỉnh đầu thú cách tâm petPos.y khoảng ~9% chiều cao)
  const bubbleBottomPercent = Math.min(82, Math.max(22, 100 - (petPos.y - 10)));

  return (
    <div
      ref={stageRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#FFF8F0]"
    >
      {/* ===================================================================== */}
      {/* Z-[0]: TƯỜNG (top: 0% -> 50%) + PHÀO CHỈ (mốc 50%) + SÀN (50% -> 100%) */}
      {/* ===================================================================== */}
      <div className="absolute inset-x-0 top-0 h-[50%] z-[0]">
        <WallBackdrop wallId={equipped.wall} />
      </div>
      <div className="absolute inset-x-0 top-[50%] h-[50%] z-[0]">
        <FloorBackdrop floorId={equipped.floor} />
      </div>

      {/* ===================================================================== */}
      {/* Z-[10]: KHU VỰC ĐỒ TRÊN TƯỜNG (top: 0% -> 50%)                        */}
      {/* ===================================================================== */}

      {/* 1. wallDecor (Dây đèn Fairy Lights hoặc Đồng hồ / Kệ treo / Lịch xé) */}
      <button
        type="button"
        onClick={handleTouchWallDecor}
        style={
          isFairyWallDecor
            ? { top: '7%', left: '12%', width: '76%' }
            : { top: '11%', left: '44%', width: '22%' }
        }
        className="absolute z-[10] active:scale-95 transition-transform focus:outline-none"
        title="Chạm để tương tác đồ treo tường"
      >
        <div className={isFairyWallDecor ? 'w-full h-14' : 'w-full aspect-square'}>
          <WallDecorSvg
            wallDecorId={equipped.wallDecor}
            lightsOn={fairyLightsOn}
            nowDate={nowDate}
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
          left: '29%',
          top: '51%',
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
          right: '4%',
          top: '37%',
          width: '31%'
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
            emotion={activeEmotion}
            isSleeping={
              calibratorEmotionOverride
                ? calibratorEmotionOverride === 'sleepy'
                : pet.isSleeping
            }
            accessoryId={equipped.accessory}
            customAnchors={customAnchors}
            isPetted={isPetted}
            facingLeft={petPos.facingLeft}
            isWalking={petPos.isWalking}
          />
        </button>
      </motion.div>

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
            left: `${bubbleCenterX}%`,
            bottom: `${bubbleBottomPercent}%`
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute -translate-x-1/2 z-[50] max-w-[230px] w-max bg-[#FFFDF9]/95 text-[#4A3525] border-2 border-[#4A3525]/85 rounded-2xl px-3 py-2 shadow-lg"
        >
          <div className="flex items-start gap-2">
            <p className="text-[11.5px] font-extrabold text-[#4A3525] leading-snug whitespace-normal break-words">
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
          {/* Mũi tên tam giác luôn hướng thẳng xuống đầu thú cưng */}
          <div
            style={{
              left: `calc(50% + ${arrowOffsetPx}px)`
            }}
            className="absolute -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-[#FFFDF9] border-r-2 border-b-2 border-[#4A3525]/85 rotate-45"
          />
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
            {ROOM_SLOTS.map((slot) => {
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
