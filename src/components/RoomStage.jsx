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
  onPetTap,
  onCoopPlayBall,
  onCleanTrash,
  onOpenStickyNote,
  onOpenPhotoFrame,
  onOpenGift,
  onOpenChat,
  hasUnreadSticky = false
}) {
  // Trạng thái tương tác cục bộ ("Juice" micro-interactions)
  const [hearts, setHearts] = useState([]);
  const [floatingBursts, setFloatingBursts] = useState([]);
  const [windowToast, setWindowToast] = useState(null);
  const [ballBounce, setBallBounce] = useState(false);
  const [plantWiggle, setPlantWiggle] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [fairyLightsOn, setFairyLightsOn] = useState(true);
  const [isPetted, setIsPetted] = useState(false);
  const [nowDate, setNowDate] = useState(() => new Date());

  // Chu kỳ sống tự nhiên của thú cưng (Tự đi dạo trên sàn + về giường khi ngủ)
  const [petPos, setPetPos] = useState({ x: 52, y: 15, facingLeft: false, isWalking: false });
  // Hiệu ứng gõ chữ mượt (typewriter) cho bong bóng thoại AI
  const [typedDialogue, setTypedDialogue] = useState('');
  const [bubbleCollapsed, setBubbleCollapsed] = useState(false);

  const stageRef = useRef(null);

  // Đồng hồ thời gian thực cập nhật mỗi 30 giây
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

  // Typewriter effect khi có câu thoại AI mới
  useEffect(() => {
    const fullText = aiBubble?.dialogue || '';
    if (!fullText) {
      setTypedDialogue('');
      return;
    }
    setBubbleCollapsed(false);
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

  // Chu kỳ sống tự nhiên: Tự đi dạo mỗi 8-13 giây, hoặc tự đi về chiếc giường khi ngủ / mệt
  useEffect(() => {
    const shouldGoToBed = Boolean(pet.isSleeping || (pet.energy ?? 80) < 25);
    if (shouldGoToBed) {
      setPetPos((prev) => ({
        x: 23,
        y: 17,
        facingLeft: prev.x > 23,
        isWalking: false
      }));
      return;
    }

    const walkTimer = setInterval(() => {
      setPetPos((prev) => {
        // Chọn tọa độ X ngẫu nhiên trên vùng thảm/sàn hợp lệ (30% -> 72%)
        const nextX = 32 + Math.floor(Math.random() * 38);
        const nextY = 12 + Math.floor(Math.random() * 9);
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
      }, 1700);
    }, 9500);

    return () => clearInterval(walkTimer);
  }, [pet.isSleeping, pet.energy]);

  // Tạo hiệu ứng hạt nổi (tim, nốt nhạc, khói trà, +5 Xu)
  const spawnBurst = (xPercent, yPercent, label, icon = '✨') => {
    const id = Date.now() + Math.random();
    setFloatingBursts((prev) => [
      ...prev.slice(-8),
      { id, x: xPercent, y: yPercent, label, icon }
    ]);
    setTimeout(() => {
      setFloatingBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1250);
  };

  // Chạm/vuốt thú cưng -> Squash & Stretch + bắn chùm tim/sao
  const handleTouchPet = (e) => {
    e.stopPropagation();
    setIsPetted(true);
    setTimeout(() => setIsPetted(false), 650);

    const id = Date.now() + Math.random();
    const offsetX = Math.floor(Math.random() * 54) - 27;
    setHearts((prev) => [...prev.slice(-6), { id, offsetX }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1100);

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

  // Micro-interaction khi chạm Cây cảnh
  const handleTouchPlant = () => {
    setPlantWiggle(true);
    spawnBurst(18, 48, '', '🍃');
    setTimeout(() => setPlantWiggle(false), 650);
  };

  // Micro-interaction khi chạm Đồ nội thất lớn (Đèn cây, Máy đĩa than, Bàn trà)
  const handleTouchDecor = () => {
    if (equipped.decor === 'decor_lamp' || !equipped.decor) {
      setLampOn((prev) => !prev);
      spawnBurst(82, 46, lampOn ? 'Tắt đèn' : 'Bật đèn', '💡');
    } else if (equipped.decor === 'decor_vinyl') {
      spawnBurst(82, 46, 'Lo-Fi Chill~', '🎵');
    } else if (equipped.decor === 'decor_teatable') {
      spawnBurst(82, 50, 'Trà thơm ấm~', '🍵');
    } else {
      spawnBurst(82, 48, '', '✨');
    }
  };

  // Micro-interaction khi chạm Dây đèn / Đồng hồ treo tường
  const handleTouchWallDecor = () => {
    if (!equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy') {
      setFairyLightsOn((prev) => !prev);
      spawnBurst(52, 16, fairyLightsOn ? 'Tắt đèn dây' : 'Lung linh!', '✨');
    } else if (equipped.wallDecor === 'wdecor_clock') {
      handleTouchWindow();
    } else {
      spawnBurst(52, 16, '', '🌿');
    }
  };

  // Chạm dọn rác/bụi trên sàn -> nổ hạt lấp lánh + chữ nổi +5 Xu
  const handleTouchTrash = (trash) => {
    spawnBurst(trash.x, trash.y - 4, '+5 Xu', '✨');
    if (onCleanTrash) onCleanTrash(trash.id);
  };

  const handlePlayCoopBallClick = () => {
    setBallBounce(true);
    setTimeout(() => setBallBounce(false), 1400);
    if (onCoopPlayBall) onCoopPlayBall();
  };

  // Tính vị trí ngang an toàn cho bong bóng thoại AI (không bao giờ bị tràn mép iPhone)
  const clampedBubbleLeft = Math.max(22, Math.min(78, petPos.x));

  return (
    <div
      ref={stageRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#FFF8F0]"
    >
      {/* 1. LỚP TƯỜNG KIẾN TRÚC 2.5D (60% chiều cao trên) */}
      <div className="absolute inset-x-0 top-0 h-[60%]">
        <WallBackdrop wallId={equipped.wall} />
      </div>

      {/* 2. LỚP SÀN NHÀ 2.5D (40% chiều cao dưới) */}
      <div className="absolute inset-x-0 bottom-0 h-[40%]">
        <FloorBackdrop floorId={equipped.floor} />
      </div>

      {/* 3. ĐỒ TREO TƯỜNG (Slot 8: wallDecor - Dây đèn Fairy Lights / Đồng hồ thời gian thực / Kệ thường xuân / Lịch hôm nay) */}
      <button
        type="button"
        onClick={handleTouchWallDecor}
        className="absolute top-[11%] left-1/2 -translate-x-1/2 z-10 w-44 h-16 active:scale-95 transition-transform focus:outline-none"
        title="Chạm để tương tác đồ treo tường"
      >
        <WallDecorSvg
          wallDecorId={equipped.wallDecor}
          lightsOn={fairyLightsOn}
          nowDate={nowDate}
        />
      </button>

      {/* 4. CỬA SỔ ĐÓN NẮNG & TRỜI ĐỘNG (Slot 3: window - Bên trái tường) */}
      <button
        type="button"
        onClick={handleTouchWindow}
        title="Chạm để xem giờ & thời tiết ngoài cửa sổ"
        className="absolute top-[18%] left-[5%] z-10 w-32 h-36 active:scale-95 transition-transform focus:outline-none"
      >
        <WindowSvg
          windowId={equipped.window}
          period={timeInfo.period}
          isSleeping={pet.isSleeping}
        />
      </button>

      {/* Toast thời gian nhỏ khi chạm cửa sổ hoặc đồng hồ */}
      <AnimatePresence>
        {windowToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-[15%] left-4 z-40 cozy-glass-dark text-[#FFF8F0] text-xs font-extrabold px-3.5 py-1.5 rounded-full"
          >
            {windowToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. KHUNG ẢNH POLAROID DÁN BĂNG DÍNH WASHI TAPE (Slot 9: photoFrame) */}
      <button
        type="button"
        onClick={onOpenPhotoFrame}
        className="absolute top-[23%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center -rotate-2 hover:rotate-0 active:scale-95 transition-all focus:outline-none"
      >
        {/* 2 Mẩu băng dính Washi Tape pastel dán chéo góc trên */}
        <div className="relative">
          <span className="absolute -top-2 -left-2 z-20 w-7 h-2.5 bg-[#FFB7C5]/85 border border-[#4A3525]/40 rounded-sm -rotate-12 shadow-sm" />
          <span className="absolute -top-2 -right-2 z-20 w-7 h-2.5 bg-[#88C9A1]/85 border border-[#4A3525]/40 rounded-sm rotate-12 shadow-sm" />

          {/* Khung Polaroid gỗ kem */}
          <div className="w-24 bg-[#FFFDF9] p-1.5 pb-4 rounded-xl border-[2.4px] border-[#4A3525] shadow-[0_6px_14px_rgba(74,53,37,0.16)]">
            <div className="w-full h-18 aspect-square rounded-lg overflow-hidden border-[1.8px] border-[#4A3525] bg-[#FFF3E2]">
              {photoFrame?.imageData ? (
                <img
                  src={photoFrame.imageData}
                  alt={photoFrame.caption || 'Ảnh đôi'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <rect width="80" height="80" fill="#FFE8D6" />
                  <circle cx="28" cy="34" r="10" fill="#FF9B71" stroke="#4A3525" strokeWidth="2" />
                  <circle cx="52" cy="34" r="10" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2" />
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
                    Treo ảnh đôi
                  </text>
                </svg>
              )}
            </div>
            <p className="mt-1 text-[9.5px] font-extrabold text-[#4A3525] truncate text-center px-0.5">
              {photoFrame?.caption || 'Kỷ niệm'}
            </p>
          </div>
        </div>
      </button>

      {/* 6. BẢNG BẦN CORKBOARD & GIẤY NHỚ TỦ LẠNH (Slot 10: stickyNote - Bên phải tường) */}
      <button
        type="button"
        onClick={onOpenStickyNote}
        className="absolute top-[20%] right-[5%] z-10 w-26 h-28 rotate-1 hover:rotate-0 active:scale-95 transition-all focus:outline-none"
      >
        {/* Khung bảng bần Corkboard */}
        <div className="relative w-24 h-26 rounded-2xl bg-[#C9925B] p-1.5 border-[2.4px] border-[#4A3525] shadow-[0_6px_14px_rgba(74,53,37,0.16)]">
          <div className="w-full h-full rounded-xl bg-[#DDA772] p-1.5 border border-[#4A3525]/40 flex flex-col justify-between relative">
            {/* Mảnh giấy nhớ vàng bơ ghim trên bảng */}
            <div className="w-full h-full rounded-lg bg-[#FFF3B0] p-1.5 border-[1.8px] border-[#4A3525] flex flex-col justify-between text-left shadow-sm rotate-1">
              {/* Đinh ghim tròn màu đỏ */}
              <div className="mx-auto -mt-2.5 w-3.5 h-3.5 rounded-full bg-[#FF6B6B] border-[1.8px] border-[#4A3525] shadow-sm" />

              {stickyNote?.mode === 'drawing' && stickyNote?.drawingData ? (
                <img
                  src={stickyNote.drawingData}
                  alt="Nét vẽ tay"
                  className="w-full h-12 object-contain rounded bg-[#FFFDF9]/70"
                />
              ) : (
                <p className="text-[9.5px] font-extrabold text-[#4A3525] line-clamp-3 leading-tight mt-0.5">
                  {stickyNote?.text || 'Chạm để ghim lời nhắn...'}
                </p>
              )}

              <div className="text-[8.5px] font-black text-[#7D6352] truncate w-full text-right">
                {stickyNote?.author || 'Giấy nhớ'}
              </div>
            </div>

            {/* Chấm đỏ rung nhẹ khi có lời nhắn mới */}
            {hasUnreadSticky && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#FF5A5F] border-2 border-[#FFFDF9] animate-bounce shadow" />
            )}
          </div>
        </div>
      </button>

      {/* 7. CÂY CẢNH GÓC PHÒNG (Slot 6: plant - Góc trái giữa phòng, chạm vào nhún nhảy) */}
      <motion.button
        type="button"
        onClick={handleTouchPlant}
        animate={
          plantWiggle
            ? { rotate: [0, -7, 7, -4, 3, 0], scale: [1, 1.06, 0.96, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.55 }}
        className="absolute left-[4%] bottom-[29%] z-10 w-26 h-32 focus:outline-none cursor-pointer"
        title="Chạm để rung rinh lá cây"
      >
        <PlantSvg plantId={equipped.plant} />
      </motion.button>

      {/* 8. ĐỒ NỘI THẤT LỚN (Slot 7: decor - Góc phải giữa phòng, chạm để bật/tắt đèn hoặc phát nhạc/khói trà) */}
      <motion.button
        type="button"
        onClick={handleTouchDecor}
        whileTap={{ scale: 0.94 }}
        className="absolute right-[4%] bottom-[29%] z-10 w-28 h-36 focus:outline-none cursor-pointer"
        title="Chạm để bật/tắt đèn hoặc tương tác nội thất"
      >
        <DecorFurnitureSvg
          decorId={equipped.decor}
          lampOn={lampOn}
          isNight={timeInfo.isNight}
        />
      </motion.button>

      {/* 9. THẢM TRẢI SÀN (Slot 5: rug - Giữa sàn nhà) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[11%] z-10 w-68 h-26 pointer-events-none">
        <RugSvg rugId={equipped.rug} />
      </div>

      {/* 10. GIƯỜNG / Ổ THÚ CƯNG (Slot 4: bed - Góc dưới trái sàn) */}
      <div className="absolute left-[5%] bottom-[15%] z-15 w-34 h-26 pointer-events-none">
        <BedSvg bedId={equipped.bed} />
      </div>

      {/* HỘP QUÀ BẤT NGỜ GIỮA PHÒNG (Mystery Gift) */}
      <AnimatePresence>
        {mysteryGift && (
          <motion.button
            type="button"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: [0, -4, 4, 0] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onOpenGift}
            className="absolute right-[7%] bottom-[17%] z-30 flex flex-col items-center active:scale-90"
          >
            <div className="relative w-16 h-16 rounded-2xl bg-[#FF9B71] border-[2.5px] border-[#4A3525] shadow-lg flex items-center justify-center">
              <Gift className="w-8 h-8 text-[#FFFDF9]" />
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[#FFE082] border-[1.8px] border-[#4A3525] text-[#4A3525] text-[9px] font-black shadow">
                QUÀ!
              </span>
            </div>
            <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#4A3525] text-[#FFF8F0] text-[10px] font-extrabold shadow">
              Từ {mysteryGift.senderName}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CỤC RÁC / BỤI TRÊN SÀN (Vẽ bằng SVG thay vì emoji thô - chạm nổ sparkle +5 Xu) */}
      {trashList.map((trash) => (
        <motion.button
          key={trash.id}
          type="button"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 1.35 }}
          onClick={() => handleTouchTrash(trash)}
          style={{ left: `${trash.x}%`, top: `${trash.y}%` }}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          title="Chạm để dọn sạch (+5 Xu)"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-9 h-9 overflow-visible">
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
            <span className="absolute -top-2.5 px-1.5 py-0.2 rounded-full bg-[#88C9A1] border border-[#4A3525] text-[#4A3525] text-[8.5px] font-black shadow-sm">
              +5 xu
            </span>
          </div>
        </motion.button>
      ))}

      {/* HIỆU ỨNG HẠT NỔ & CHỮ NỔI (+5 Xu, Nốt nhạc, Lá bay) */}
      <AnimatePresence>
        {floatingBursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 1, y: 0, scale: 0.75 }}
            animate={{ opacity: 0, y: -42, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            className="pointer-events-none absolute z-40 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF9]/95 border-[1.8px] border-[#4A3525] shadow-md text-xs font-black text-[#4A3525]"
          >
            <span>{b.icon}</span>
            {b.label && <span>{b.label}</span>}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* BONG BÓNG THOẠI AI CỦA PET (Tự bám theo vị trí X của thú & căn biên an toàn) */}
      {aiBubble?.dialogue && !isDecoratorMode && !bubbleCollapsed && (
        <motion.div
          key={aiBubble.updatedAt || aiBubble.dialogue}
          initial={{ opacity: 0, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{
            left: `${clampedBubbleLeft}%`,
            bottom: `${petPos.y + 26}%`
          }}
          className="absolute -translate-x-1/2 z-30 w-[82%] max-w-[295px] bg-[#FFFDF9]/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 shadow-[0_8px_20px_rgba(74,53,37,0.14)] border-[2.2px] border-[#4A3525]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-extrabold text-[#4A3525] leading-snug">
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
          {/* Đuôi tam giác chỉ xuống thú cưng */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3.5 h-3.5 bg-[#FFFDF9] border-r-[2.2px] border-b-[2.2px] border-[#4A3525] rotate-45" />
        </motion.div>
      )}

      {/* THÚ CƯNG SỐNG ĐỘNG TỰ ĐI DẠO TRÊN SÀN / VỀ GIƯỜNG NGỦ */}
      <motion.div
        animate={{
          left: `${petPos.x}%`,
          bottom: `${petPos.y}%`
        }}
        transition={{
          duration: 1.7,
          ease: 'easeInOut'
        }}
        className="absolute -translate-x-1/2 z-20 flex flex-col items-center"
      >
        {/* Đám mây hờn dỗi khi chỉ số < 25 */}
        {activeEmotion === 'sulky' && (
          <div className="mb-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A3525] text-[#FFF8F0] text-[10px] font-extrabold animate-bounce shadow">
            <CloudRain className="w-3.5 h-3.5 text-[#89CFF0]" />
            <span>Đang dỗi rồi!</span>
          </div>
        )}

        {/* Bong bóng nghĩ đến đồ ăn khi Đói (hungry) */}
        {activeEmotion === 'hungry' && (
          <div className="mb-1 px-2.5 py-0.5 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] text-[#4A3525] text-[10px] font-black animate-bounce shadow-sm">
            Đói bụng quá~
          </div>
        )}

        {/* Bong bóng Zzz khi đang nằm ngủ trên giường */}
        {(pet.isSleeping || activeEmotion === 'sleepy') && (
          <div className="mb-1 px-2.5 py-0.5 rounded-full bg-[#FFFDF9]/90 border-[1.8px] border-[#4A3525] text-[#4A3525] text-[10px] font-black animate-pulse">
            Zzz...
          </div>
        )}

        {/* Chùm tim/sao bay lên khi vuốt ve */}
        <div className="pointer-events-none absolute -top-8 inset-x-0 flex justify-center">
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: 8, x: h.offsetX, scale: 0.7 }}
                animate={{ opacity: 0, y: -52, x: h.offsetX * 1.25, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.95 }}
                className="absolute"
              >
                <svg viewBox="0 0 28 28" className="w-6 h-6">
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

        {/* Cuộn len nảy khi 2 người chơi tung bóng Co-op */}
        <AnimatePresence>
          {ballBounce && (
            <motion.div
              initial={{ y: 0, x: -45, rotate: 0 }}
              animate={{
                y: [-8, -68, 0, -42, 0],
                x: [-42, 0, 42, 12, 0],
                rotate: 360
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3 }}
              className="absolute -top-8 z-30"
            >
              <svg viewBox="0 0 36 36" className="w-8 h-8">
                <circle cx="18" cy="18" r="14" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.3" />
                <path d="M8 14 Q18 22 28 14 M10 22 Q18 12 26 22" fill="none" stroke="#4A3525" strokeWidth="2" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nhân vật Thú cưng tách khớp + Phụ kiện */}
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

      {/* NÚT TƯƠNG TÁC ĐÔI CO-OP KHI CẢ 2 CÙNG ONLINE */}
      {bothOnline && !isDecoratorMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-[23%] z-30"
        >
          <button
            type="button"
            onClick={handlePlayCoopBallClick}
            className="tactile-btn flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cùng chơi tung bóng (+20 Xu)</span>
          </button>
        </motion.div>
      )}

      {/* LỚP ÁNH SÁNG ĐỘNG 2.5D (Tia nắng xiên, bụi nắng, hoàng hôn, đèn đêm) */}
      <RoomLighting
        period={timeInfo.period}
        isSleeping={pet.isSleeping}
        lampOn={lampOn}
        fairyLightsOn={fairyLightsOn}
        equipped={equipped}
      />

      {/* CHẤM NEO TRÒN PHÁT SÁNG DỊU (SLOT HOTSPOTS) KHI BẬT LIVE DECORATOR STUDIO */}
      <AnimatePresence>
        {isDecoratorMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-35 pointer-events-none"
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
                      : 'bg-[#FFFDF9]/90 text-[#4A3525] hover:scale-105'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full border border-[#4A3525] ${
                      isSelected ? 'bg-[#FFFDF9] animate-ping' : 'bg-[#88C9A1]'
                    }`}
                  />
                  <span className="text-[10px] font-black whitespace-nowrap">
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
