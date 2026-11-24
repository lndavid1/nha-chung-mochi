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
import RoomLighting from './RoomLighting';

export default function RoomStage({
  roomData,
  previewEquipped = null,
  isDecoratorMode = false,
  activeDecoratorSlot = 'wall',
  onSelectDecoratorSlot,
  timeOverride = 'auto',
  bothOnline = false,
  isTrayOpen = false,
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
  const [nowDate, setNowDate] = useState(() => new Date());

  // Tọa độ của thú cưng trong vùng sàn an toàn (không đè lên đồ vật khác)
  const [petPos, setPetPos] = useState({
    x: 54,
    y: 13,
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
  const activeEmotion = resolvePetEmotion(pet, bothOnline);
  const aiBubble = pet.aiBubble || null;

  // Hiệu ứng gõ chữ (Typewriter)
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

  // Chu kỳ sống tự nhiên:
  // - Khi ngủ hoặc mệt (<25 energy): Đi về nằm gọn trong lòng chiếc giường (Góc dưới trái: x=18%, bottom=13%)
  // - Khi thức: Tự đi dạo trên vùng thảm giữa phòng (x: 42% -> 68%, bottom: 11% -> 18%)
  useEffect(() => {
    const shouldGoToBed = Boolean(pet.isSleeping || (pet.energy ?? 80) < 25);
    if (shouldGoToBed) {
      setPetPos((prev) => ({
        x: 18,
        y: 13,
        facingLeft: prev.x > 18,
        isWalking: false
      }));
      return;
    }

    // Nếu vừa thức dậy từ giường thì bước ra giữa thảm
    setPetPos((prev) =>
      prev.x < 30
        ? { x: 54, y: 13, facingLeft: false, isWalking: false }
        : prev
    );

    const walkTimer = setInterval(() => {
      setPetPos((prev) => {
        const nextX = 42 + Math.floor(Math.random() * 26);
        const nextY = 11 + Math.floor(Math.random() * 7);
        const goingLeft = nextX < prev.x;
        return {
          x: nextX,
          y: nextY,
          facingLeft: goingLeft,
          isWalking: Math.abs(nextX - prev.x) > 5
        };
      });

      setTimeout(() => {
        setPetPos((prev) => ({ ...prev, isWalking: false }));
      }, 1600);
    }, 9000);

    return () => clearInterval(walkTimer);
  }, [pet.isSleeping, pet.energy]);

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
    setIsPetted(true);
    setTimeout(() => setIsPetted(false), 650);

    const id = Date.now() + Math.random();
    const offsetX = Math.floor(Math.random() * 50) - 25;
    setHearts((prev) => [...prev.slice(-6), { id, offsetX }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1050);

    if (onPetTap) onPetTap();
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
    spawnBurst(15, 45, '', '🍃');
    setTimeout(() => setPlantWiggle(false), 650);
  };

  const handleTouchDecor = () => {
    if (equipped.decor === 'decor_lamp' || !equipped.decor) {
      setLampOn((prev) => !prev);
      spawnBurst(84, 42, lampOn ? 'Tắt đèn' : 'Bật đèn', '💡');
    } else if (equipped.decor === 'decor_vinyl') {
      spawnBurst(84, 42, 'Lo-Fi Chill~', '🎵');
    } else if (equipped.decor === 'decor_teatable') {
      spawnBurst(84, 45, 'Trà thơm ấm~', '🍵');
    } else {
      spawnBurst(84, 44, '', '✨');
    }
  };

  const handleTouchWallDecor = () => {
    if (!equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy') {
      setFairyLightsOn((prev) => !prev);
      spawnBurst(50, 14, fairyLightsOn ? 'Tắt đèn dây' : 'Lung linh!', '✨');
    } else if (equipped.wallDecor === 'wdecor_clock') {
      handleTouchWindow();
    } else {
      spawnBurst(50, 14, '', '🌿');
    }
  };

  const handleTouchTrash = (trash) => {
    spawnBurst(trash.x, trash.y - 4, '+5 Xu', '✨');
    if (onCleanTrash) onCleanTrash(trash.id);
  };

  const handlePlayCoopBallClick = () => {
    setBallBounce(true);
    setTimeout(() => setBallBounce(false), 1400);
    if (onCoopPlayBall) onCoopPlayBall();
  };

  const clampedBubbleLeft = Math.max(26, Math.min(74, petPos.x));

  return (
    <div
      ref={stageRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#FFF8F0]"
    >
      {/* LỚP 1 (z-[1]): TƯỜNG NHÀ (Chiếm 56% phía trên) */}
      <div className="absolute inset-x-0 top-0 h-[56%] z-[1]">
        <WallBackdrop wallId={equipped.wall} />
      </div>

      {/* LỚP 2 (z-[1]): SÀN NHÀ (Chiếm 44% phía dưới) */}
      <div className="absolute inset-x-0 bottom-0 h-[44%] z-[1]">
        <FloorBackdrop floorId={equipped.floor} />
      </div>

      {/* LỚP 3 (z-[6]): ĐỒ TREO TƯỜNG (Dây đèn / Đồng hồ / Kệ treo / Lịch - Ở chính giữa trên tường) */}
      <button
        type="button"
        onClick={handleTouchWallDecor}
        className="absolute top-[10%] left-1/2 -translate-x-1/2 z-[6] w-40 h-14 active:scale-95 transition-transform focus:outline-none"
        title="Chạm để tương tác đồ treo tường"
      >
        <WallDecorSvg
          wallDecorId={equipped.wallDecor}
          lightsOn={fairyLightsOn}
          nowDate={nowDate}
        />
      </button>

      {/* LỚP 4 (z-[6]): CỬA SỔ (Bên trái tường) */}
      <button
        type="button"
        onClick={handleTouchWindow}
        title="Chạm để xem giờ & bầu trời"
        className="absolute top-[16%] left-[4%] z-[6] w-28 h-32 active:scale-95 transition-transform focus:outline-none"
      >
        <WindowSvg
          windowId={equipped.window}
          period={timeInfo.period}
          isSleeping={pet.isSleeping}
        />
      </button>

      {/* Toast thời gian nhỏ khi chạm cửa sổ */}
      <AnimatePresence>
        {windowToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-[13%] left-4 z-[35] cozy-glass-dark text-[#FFF8F0] text-xs font-extrabold px-3.5 py-1.5 rounded-full"
          >
            {windowToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LỚP 5 (z-[6]): KHUNG ẢNH POLAROID (Giữa tường, dưới dây đèn) */}
      <button
        type="button"
        onClick={onOpenPhotoFrame}
        className="absolute top-[22%] left-1/2 -translate-x-1/2 z-[6] flex flex-col items-center -rotate-2 hover:rotate-0 active:scale-95 transition-all focus:outline-none"
      >
        <div className="relative">
          <span className="absolute -top-1.5 -left-1.5 z-20 w-6 h-2 bg-[#FFB7C5]/90 border border-[#4A3525]/40 rounded-sm -rotate-12" />
          <span className="absolute -top-1.5 -right-1.5 z-20 w-6 h-2 bg-[#88C9A1]/90 border border-[#4A3525]/40 rounded-sm rotate-12" />

          <div className="w-20 bg-[#FFFDF9] p-1.5 pb-3 rounded-xl border-[2.2px] border-[#4A3525] shadow-[0_5px_12px_rgba(74,53,37,0.15)]">
            <div className="w-full aspect-square rounded-lg overflow-hidden border-[1.6px] border-[#4A3525] bg-[#FFF3E2]">
              {photoFrame?.imageData ? (
                <img
                  src={photoFrame.imageData}
                  alt={photoFrame.caption || 'Ảnh đôi'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <rect width="80" height="80" fill="#FFE8D6" />
                  <circle cx="28" cy="34" r="9" fill="#FF9B71" stroke="#4A3525" strokeWidth="2" />
                  <circle cx="52" cy="34" r="9" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2" />
                  <path
                    d="M40 24 C40 24 33 17 33 13 C33 10 37 8 40 12 C43 8 47 10 47 13 C47 17 40 24 40 24 Z"
                    fill="#FF6B8B"
                  />
                  <text
                    x="40"
                    y="64"
                    textAnchor="middle"
                    fill="#4A3525"
                    fontSize="9.5"
                    fontWeight="800"
                  >
                    Ảnh đôi
                  </text>
                </svg>
              )}
            </div>
            <p className="mt-1 text-[8.5px] font-extrabold text-[#4A3525] truncate text-center">
              {photoFrame?.caption || 'Kỷ niệm'}
            </p>
          </div>
        </div>
      </button>

      {/* LỚP 6 (z-[6]): BẢNG BẦN CORKBOARD & GIẤY NHỚ (Bên phải tường) */}
      <button
        type="button"
        onClick={onOpenStickyNote}
        className="absolute top-[18%] right-[4%] z-[6] w-22 h-24 rotate-1 hover:rotate-0 active:scale-95 transition-all focus:outline-none"
      >
        <div className="relative w-22 h-24 rounded-2xl bg-[#C9925B] p-1.5 border-[2.2px] border-[#4A3525] shadow-[0_5px_12px_rgba(74,53,37,0.15)]">
          <div className="w-full h-full rounded-xl bg-[#DDA772] p-1 border border-[#4A3525]/40 flex flex-col justify-between relative">
            <div className="w-full h-full rounded-lg bg-[#FFF3B0] p-1.5 border-[1.6px] border-[#4A3525] flex flex-col justify-between text-left shadow-sm">
              <div className="mx-auto -mt-2 w-3 h-3 rounded-full bg-[#FF6B6B] border-[1.6px] border-[#4A3525]" />
              {stickyNote?.mode === 'drawing' && stickyNote?.drawingData ? (
                <img
                  src={stickyNote.drawingData}
                  alt="Nét vẽ tay"
                  className="w-full h-10 object-contain rounded bg-[#FFFDF9]/70"
                />
              ) : (
                <p className="text-[8.5px] font-extrabold text-[#4A3525] line-clamp-3 leading-tight mt-0.5">
                  {stickyNote?.text || 'Chạm viết lời nhắn...'}
                </p>
              )}
              <div className="text-[7.5px] font-black text-[#7D6352] truncate w-full text-right">
                {stickyNote?.author || 'Giấy nhớ'}
              </div>
            </div>

            {hasUnreadSticky && (
              <span className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-[#FF5A5F] border-2 border-[#FFFDF9] animate-bounce shadow" />
            )}
          </div>
        </div>
      </button>

      {/* LỚP 7 (z-[8]): THẢM TRẢI SÀN (Nằm sát mặt sàn ở vùng trung tâm-phải, dưới thú cưng và đồ vật) */}
      <div className="absolute left-[56%] -translate-x-1/2 bottom-[9%] z-[8] w-56 h-22 pointer-events-none">
        <RugSvg rugId={equipped.rug} />
      </div>

      {/* LỚP 8 (z-[11]): CÂY CẢNH GÓC PHÒNG (Đặt sát chân tường bên trái: bottom-[38%]) */}
      <motion.button
        type="button"
        onClick={handleTouchPlant}
        animate={
          plantWiggle
            ? { rotate: [0, -7, 7, -4, 3, 0], scale: [1, 1.06, 0.96, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.55 }}
        className="absolute left-[4%] bottom-[38%] z-[11] w-22 h-28 focus:outline-none cursor-pointer"
        title="Chạm để rung rinh lá cây"
      >
        <PlantSvg plantId={equipped.plant} />
      </motion.button>

      {/* LỚP 9 (z-[11]): NỘI THẤT LỚN (Đặt sát chân tường bên phải: bottom-[38%]) */}
      <motion.button
        type="button"
        onClick={handleTouchDecor}
        whileTap={{ scale: 0.94 }}
        className="absolute right-[4%] bottom-[38%] z-[11] w-24 h-30 focus:outline-none cursor-pointer"
        title="Chạm để bật/tắt đèn hoặc tương tác nội thất"
      >
        <DecorFurnitureSvg
          decorId={equipped.decor}
          lampOn={lampOn}
          isNight={timeInfo.isNight}
        />
      </motion.button>

      {/* LỚP 10 (z-[12]): GIƯỜNG / Ổ THÚ CƯNG (Đặt ở góc dưới trái sàn: bottom-[9%], tách biệt hoàn toàn với Chậu cây ở bottom-[38%]) */}
      <div className="absolute left-[4%] bottom-[9%] z-[12] w-30 h-22 pointer-events-none">
        <BedSvg bedId={equipped.bed} />
      </div>

      {/* LỚP 11 (z-[16]): HỘP QUÀ BẤT NGỜ (Góc dưới phải sàn) */}
      <AnimatePresence>
        {mysteryGift && (
          <motion.button
            type="button"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: [0, -4, 4, 0] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onOpenGift}
            className="absolute right-[5%] bottom-[10%] z-[16] flex flex-col items-center active:scale-90"
          >
            <div className="relative w-14 h-14 rounded-2xl bg-[#FF9B71] border-[2.4px] border-[#4A3525] shadow-md flex items-center justify-center">
              <Gift className="w-7 h-7 text-[#FFFDF9]" />
              <span className="absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[8.5px] font-black shadow">
                QUÀ!
              </span>
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-[#4A3525] text-[#FFF8F0] text-[9.5px] font-extrabold shadow">
              Từ {mysteryGift.senderName}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* LỚP 12 (z-[15]): CỤC RÁC / BỤI TRÊN SÀN (Gói gọn trong vùng sàn hợp lệ 64% -> 82% top) */}
      {trashList.map((trash) => {
        const safeTop = Math.max(64, Math.min(82, trash.y));
        const safeLeft = Math.max(36, Math.min(76, trash.x));
        return (
          <motion.button
            key={trash.id}
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 1.35 }}
            onClick={() => handleTouchTrash({ ...trash, x: safeLeft, y: safeTop })}
            style={{ left: `${safeLeft}%`, top: `${safeTop}%` }}
            className="absolute z-[15] -translate-x-1/2 -translate-y-1/2 focus:outline-none"
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
              <span className="absolute -top-2 px-1 py-0.1 rounded-full bg-[#88C9A1] border border-[#4A3525] text-[#4A3525] text-[8px] font-black shadow-sm">
                +5 xu
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* LỚP 13 (z-[20]): THÚ CƯNG SỐNG ĐỘNG (Luôn đứng trên thảm z-[8] và giường z-[12]) */}
      <motion.div
        animate={{
          left: `${petPos.x}%`,
          bottom: `${petPos.y}%`
        }}
        transition={{
          duration: 1.6,
          ease: 'easeInOut'
        }}
        className="absolute -translate-x-1/2 z-[20] flex flex-col items-center"
      >
        {/* Nhãn trạng thái nhỏ gọn ngay trên đỉnh đầu thú (chỉ hiện 1 nhãn ưu tiên cao nhất để không bao giờ chồng nhau) */}
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
              className="absolute -top-6 z-[25]"
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
            isSleeping={pet.isSleeping}
            accessoryId={equipped.accessory}
            isPetted={isPetted}
            facingLeft={petPos.facingLeft}
            isWalking={petPos.isWalking}
          />
        </button>
      </motion.div>

      {/* LỚP 14 (z-[24]): HỆ THỐNG ÁNH SÁNG ĐỘNG 2.5D */}
      <RoomLighting
        period={timeInfo.period}
        isSleeping={pet.isSleeping}
        lampOn={lampOn}
        fairyLightsOn={fairyLightsOn}
        equipped={equipped}
      />

      {/* LỚP 15 (z-[26]): BONG BÓNG THOẠI AI CỦA PET (Tự ẩn khi đang mở khay thức ăn/chăm sóc hoặc chế độ trang trí để không đè giao diện) */}
      {aiBubble?.dialogue && !isDecoratorMode && !isTrayOpen && (
        <motion.div
          key={aiBubble.updatedAt || aiBubble.dialogue}
          initial={{ opacity: 0, y: 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{
            left: `${clampedBubbleLeft}%`,
            bottom: `${Math.min(46, petPos.y + 27)}%`
          }}
          className="absolute -translate-x-1/2 z-[26] w-[80%] max-w-[275px] bg-[#FFFDF9]/96 backdrop-blur-md rounded-2xl px-3 py-2 shadow-[0_6px_18px_rgba(74,53,37,0.14)] border-[2px] border-[#4A3525]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11.5px] font-extrabold text-[#4A3525] leading-snug line-clamp-2">
              {typedDialogue}
            </p>
            <button
              type="button"
              onClick={onOpenChat}
              className="p-1 rounded-lg bg-[#FFF3E2] border border-[#4A3525]/30 text-[#4A3525] shrink-0 active:scale-90"
              title="Mở khung trò chuyện với bé"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-[#FFFDF9] border-r-[2px] border-b-[2px] border-[#4A3525] rotate-45" />
        </motion.div>
      )}

      {/* LỚP 16 (z-[28]): NÚT TƯƠNG TÁC ĐÔI CO-OP KHI CẢ 2 CÙNG ONLINE (Tự ẩn khi đang mở khay thức ăn/chăm sóc) */}
      {bothOnline && !isDecoratorMode && !isTrayOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-2 z-[28]"
        >
          <button
            type="button"
            onClick={handlePlayCoopBallClick}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-[11px] font-black shadow-md whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cùng chơi tung bóng (+20 Xu)</span>
          </button>
        </motion.div>
      )}

      {/* LỚP 17 (z-[30]): HIỆU ỨNG HẠT NỔ & CHỮ NỔI (+5 Xu, Nốt nhạc, Lá bay) */}
      <AnimatePresence>
        {floatingBursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 1, y: 0, scale: 0.75 }}
            animate={{ opacity: 0, y: -38, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: 'easeOut' }}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            className="pointer-events-none absolute z-[30] -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF9]/95 border-[1.8px] border-[#4A3525] shadow-md text-xs font-black text-[#4A3525]"
          >
            <span>{b.icon}</span>
            {b.label && <span>{b.label}</span>}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* LỚP 18 (z-[32]): CHẤM NEO SLOT HOTSPOTS KHI BẬT LIVE DECORATOR STUDIO */}
      <AnimatePresence>
        {isDecoratorMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[32] pointer-events-none"
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
                      : 'bg-[#FFFDF9]/92 text-[#4A3525] hover:scale-105'
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
