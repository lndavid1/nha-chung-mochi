import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, CloudRain, Heart, Volume2 } from 'lucide-react';
import { getTimeOfDay, resolvePetEmotion } from '../utils/gameLogic';

// Vẽ SVG 3 loại thú cưng theo 6 trạng thái biểu cảm: happy, hungry, sulky, sleepy, excited, love
function PetSvgCharacter({ type = 'cat', emotion = 'happy', isSleeping = false }) {
  const isSulky = emotion === 'sulky';
  const isSleepy = isSleeping || emotion === 'sleepy';
  const isExcited = emotion === 'excited';
  const isLove = emotion === 'love';
  const isHungry = emotion === 'hungry';

  // Khuôn mặt biểu cảm dùng chung cho cả 3 bé
  const renderFace = (cyOffset = 0) => {
    if (isSulky) {
      // Quay mặt hờn dỗi
      return (
        <g transform={`translate(12, ${cyOffset})`}>
          {/* Mắt nhắm chữ > < dỗi */}
          <path d="M82 110 L94 115 L82 120" fill="none" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M138 110 L126 115 L138 120" fill="none" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Má phồng giận */}
          <circle cx="76" cy="126" r="9" fill="#FB7185" opacity="0.75" />
          <circle cx="142" cy="126" r="9" fill="#FB7185" opacity="0.75" />
          {/* Miệng mếu ngược */}
          <path d="M100 128 Q110 120 120 128" fill="none" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
          {/* Ký hiệu tức giận trên trán */}
          <path d="M138 82 L144 88 M146 82 L140 88" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    }

    if (isSleepy) {
      return (
        <g transform={`translate(0, ${cyOffset})`}>
          {/* Mắt nhắm ngủ cong xuống */}
          <path d="M74 114 Q84 122 94 114" fill="none" stroke="#451A03" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M126 114 Q136 122 146 114" fill="none" stroke="#451A03" strokeWidth="4.2" strokeLinecap="round" />
          <ellipse cx="68" cy="124" rx="10" ry="6" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="152" cy="124" rx="10" ry="6" fill="#FDA4AF" opacity="0.65" />
          {/* Bong bóng mũi ngủ */}
          <circle cx="128" cy="122" r="10" fill="#BAE6FD" fillOpacity="0.75" stroke="#38BDF8" strokeWidth="2.5">
            <animate attributeName="r" values="6;12;6" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <path d="M104 124 Q110 129 116 124" fill="none" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    }

    if (isLove || isExcited) {
      return (
        <g transform={`translate(0, ${cyOffset})`}>
          {/* Mắt cười tít hạnh phúc ^ ^ */}
          <path d="M74 116 Q84 104 94 116" fill="none" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M126 116 Q136 104 146 116" fill="none" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="66" cy="124" rx="12" ry="7" fill="#FB7185" opacity="0.8" />
          <ellipse cx="154" cy="124" rx="12" ry="7" fill="#FB7185" opacity="0.8" />
          {/* Miệng cười há vui vẻ */}
          <path d="M98 122 Q110 138 122 122 Z" fill="#FB7185" stroke="#451A03" strokeWidth="3.5" strokeLinejoin="round" />
        </g>
      );
    }

    if (isHungry) {
      return (
        <g transform={`translate(0, ${cyOffset})`}>
          {/* Mắt long lanh cầu xin */}
          <circle cx="84" cy="113" r="9.5" fill="#451A03" />
          <circle cx="81" cy="110" r="3.5" fill="#FFFFFF" />
          <circle cx="87" cy="116" r="1.8" fill="#FFFFFF" />
          <circle cx="136" cy="113" r="9.5" fill="#451A03" />
          <circle cx="133" cy="110" r="3.5" fill="#FFFFFF" />
          <circle cx="139" cy="116" r="1.8" fill="#FFFFFF" />
          <ellipse cx="68" cy="125" rx="10" ry="6" fill="#FDA4AF" opacity="0.7" />
          <ellipse cx="152" cy="125" rx="10" ry="6" fill="#FDA4AF" opacity="0.7" />
          {/* Miệng chảy nước miếng nhẹ */}
          <path d="M100 125 Q105 131 110 125 Q115 131 120 125" fill="none" stroke="#451A03" strokeWidth="3.8" strokeLinecap="round" />
          <path d="M117 128 Q119 136 117 138" fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }

    // Mặc định: Happy
    return (
      <g transform={`translate(0, ${cyOffset})`}>
        <circle cx="84" cy="113" r="8.5" fill="#451A03" />
        <circle cx="81" cy="110" r="3" fill="#FFFFFF" />
        <circle cx="136" cy="113" r="8.5" fill="#451A03" />
        <circle cx="133" cy="110" r="3" fill="#FFFFFF" />
        <ellipse cx="68" cy="124" rx="11" ry="6.5" fill="#FDA4AF" opacity="0.7" />
        <ellipse cx="152" cy="124" rx="11" ry="6.5" fill="#FDA4AF" opacity="0.7" />
        <path d="M100 122 Q105 130 110 122 Q115 130 120 122" fill="none" stroke="#451A03" strokeWidth="3.8" strokeLinecap="round" />
      </g>
    );
  };

  if (type === 'corgi') {
    return (
      <svg viewBox="0 0 220 200" className="w-40 h-36 overflow-visible drop-shadow-md">
        {/* Bóng dưới chân */}
        <ellipse cx="110" cy="176" rx="58" ry="12" fill="#78350F" opacity="0.16" />
        {/* Đuôi ngắn ngoắc liên tục */}
        <path
          d="M162 135 Q186 122 178 146"
          fill="#F59E0B"
          stroke="#78350F"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Tai Corgi to dựng */}
        <path d="M58 95 L42 42 L92 72 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="5.5" strokeLinejoin="round" />
        <path d="M62 86 L51 52 L84 72 Z" fill="#FDE68A" />
        <path d="M162 95 L178 42 L128 72 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="5.5" strokeLinejoin="round" />
        <path d="M158 86 L169 52 L136 72 Z" fill="#FDE68A" />
        {/* Thân Corgi tròn mũm mĩm */}
        <ellipse cx="110" cy="125" rx="64" ry="52" fill="#FBBF24" stroke="#78350F" strokeWidth="5.5" />
        {/* Mảng lông trắng ngực & giữa mặt */}
        <ellipse cx="110" cy="142" rx="42" ry="32" fill="#FFFFFF" />
        <path d="M98 76 Q110 115 122 76 Z" fill="#FFFFFF" />
        {/* Chân ngắn đáng yêu */}
        <ellipse cx="76" cy="172" rx="14" ry="9" fill="#FFFFFF" stroke="#78350F" strokeWidth="5" />
        <ellipse cx="144" cy="172" rx="14" ry="9" fill="#FFFFFF" stroke="#78350F" strokeWidth="5" />
        {/* Mũi cún */}
        <ellipse cx="110" cy="117" rx="6" ry="4.5" fill="#451A03" />
        {renderFace(0)}
      </svg>
    );
  }

  if (type === 'bunny') {
    return (
      <svg viewBox="0 0 220 210" className="w-40 h-40 overflow-visible drop-shadow-md">
        <ellipse cx="110" cy="182" rx="54" ry="11" fill="#78350F" opacity="0.15" />
        {/* Đuôi bông tròn */}
        <circle cx="166" cy="148" r="14" fill="#FFFFFF" stroke="#78350F" strokeWidth="5" />
        {/* Hai tai thỏ dài */}
        <ellipse
          cx="82"
          cy="56"
          rx="16"
          ry="42"
          transform="rotate(-10 82 56)"
          fill="#FFF1F2"
          stroke="#78350F"
          strokeWidth="5.5"
        />
        <ellipse
          cx="82"
          cy="58"
          rx="8"
          ry="28"
          transform="rotate(-10 82 58)"
          fill="#FDA4AF"
        />
        <ellipse
          cx="138"
          cy="56"
          rx="16"
          ry="42"
          transform="rotate(10 138 56)"
          fill="#FFF1F2"
          stroke="#78350F"
          strokeWidth="5.5"
        />
        <ellipse
          cx="138"
          cy="58"
          rx="8"
          ry="28"
          transform="rotate(10 138 58)"
          fill="#FDA4AF"
        />
        {/* Thân thỏ bông */}
        <ellipse cx="110" cy="132" rx="60" ry="50" fill="#FFF1F2" stroke="#78350F" strokeWidth="5.5" />
        {/* Chân thỏ */}
        <ellipse cx="78" cy="176" rx="15" ry="9" fill="#FFFFFF" stroke="#78350F" strokeWidth="5" />
        <ellipse cx="142" cy="176" rx="15" ry="9" fill="#FFFFFF" stroke="#78350F" strokeWidth="5" />
        {/* Nơ cổ xinh xắn */}
        <path d="M98 156 L110 162 L98 168 Z" fill="#FB7185" stroke="#78350F" strokeWidth="3" />
        <path d="M122 156 L110 162 L122 168 Z" fill="#FB7185" stroke="#78350F" strokeWidth="3" />
        <circle cx="110" cy="162" r="4" fill="#FFE4E6" stroke="#78350F" strokeWidth="3" />
        {renderFace(6)}
      </svg>
    );
  }

  // Mặc định: Mèo Mochi ('cat')
  return (
    <svg viewBox="0 0 220 200" className="w-40 h-36 overflow-visible drop-shadow-md">
      <ellipse cx="110" cy="176" rx="58" ry="12" fill="#78350F" opacity="0.16" />
      {/* Đuôi mèo uốn lượn */}
      <path
        d="M162 146 Q196 125 184 102"
        fill="none"
        stroke="#78350F"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M162 146 Q196 125 184 102"
        fill="none"
        stroke="#FDBA74"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Tai mèo */}
      <path d="M58 96 L46 50 L92 74 Z" fill="#FFFFFF" stroke="#78350F" strokeWidth="5.5" strokeLinejoin="round" />
      <path d="M62 86 L54 60 L82 74 Z" fill="#FDA4AF" />
      <path d="M162 96 L174 50 L128 74 Z" fill="#FFFFFF" stroke="#78350F" strokeWidth="5.5" strokeLinejoin="round" />
      <path d="M158 86 L166 60 L138 74 Z" fill="#FDA4AF" />
      {/* Thân Mochi bánh dày tròn xoe */}
      <ellipse cx="110" cy="126" rx="64" ry="50" fill="#FFFFFF" stroke="#78350F" strokeWidth="5.5" />
      {/* Vá cam tam thể trên đầu */}
      <path d="M112 76 C142 76 164 92 168 114 C140 118 122 104 112 76 Z" fill="#FDBA74" />
      {/* Râu mèo */}
      <path d="M48 116 L32 113 M48 124 L30 126" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M172 116 L188 113 M172 124 L190 126" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      {/* Chân mèo */}
      <ellipse cx="78" cy="171" rx="13" ry="8.5" fill="#FFFFFF" stroke="#78350F" strokeWidth="5" />
      <ellipse cx="142" cy="171" rx="13" ry="8.5" fill="#FFFFFF" stroke="#78350F" strokeWidth="5" />
      {/* Chuông vàng trước ngực */}
      <path d="M84 156 Q110 166 136 156" fill="none" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
      <circle cx="110" cy="162" r="7" fill="#FACC15" stroke="#78350F" strokeWidth="3.5" />
      {renderFace(0)}
    </svg>
  );
}

export default function RoomStage({
  roomData,
  bothOnline,
  onPetTap,
  onCoopPlayBall,
  onCleanTrash,
  onOpenStickyNote,
  onOpenPhotoFrame,
  onOpenGift,
  currentPlayerRole
}) {
  const [hearts, setHearts] = useState([]);
  const [windowToast, setWindowToast] = useState(null);
  const [ballBounce, setBallBounce] = useState(false);
  const [timeInfo, setTimeInfo] = useState(() => getTimeOfDay());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getTimeOfDay());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const equipped = roomData?.room?.equipped || {};
  const pet = roomData?.pet || {};
  const stickyNote = roomData?.stickyNote || {};
  const photoFrame = roomData?.photoFrame || {};
  const mysteryGift = roomData?.mysteryGift || null;
  const trashList = Array.isArray(pet.trashList) ? pet.trashList : [];

  const activeEmotion = resolvePetEmotion(pet, bothOnline);
  const aiBubble = pet.aiBubble || null;

  // Hiệu ứng bắn tim khi chạm vào thú cưng
  const handleTouchPet = (e) => {
    e.stopPropagation();
    const id = Date.now() + Math.random();
    const offsetX = Math.floor(Math.random() * 60) - 30;
    setHearts((prev) => [...prev.slice(-6), { id, offsetX }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1100);
    if (onPetTap) onPetTap();
  };

  const handleTouchWindow = () => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setWindowToast(`🕐 ${nowTime} • ${timeInfo.label}`);
    setTimeout(() => setWindowToast(null), 3200);
  };

  const handlePlayCoopBallClick = () => {
    setBallBounce(true);
    setTimeout(() => setBallBounce(false), 1400);
    if (onCoopPlayBall) onCoopPlayBall();
  };

  // Màu nền tường theo slot 1: wall
  const getWallStyle = () => {
    switch (equipped.wall) {
      case 'wall_pink':
        return {
          backgroundColor: '#FCE7F3',
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(244, 114, 182, 0.14) 28px, rgba(244, 114, 182, 0.14) 40px)'
        };
      case 'wall_mint':
        return {
          backgroundColor: '#DCFCE7',
          backgroundImage:
            'radial-gradient(rgba(34, 197, 94, 0.16) 2px, transparent 2px)',
          backgroundSize: '22px 22px'
        };
      case 'wall_brick':
        return {
          backgroundColor: '#FFEDD5',
          backgroundImage:
            'linear-gradient(335deg, rgba(234,88,12,0.12) 23px, transparent 23px), linear-gradient(155deg, rgba(234,88,12,0.12) 23px, transparent 23px)',
          backgroundSize: '58px 58px'
        };
      case 'wall_cream':
      default:
        return {
          backgroundColor: '#FFF3E0',
          backgroundImage:
            'radial-gradient(rgba(251, 146, 60, 0.13) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        };
    }
  };

  // Màu sàn nhà theo slot 2: floor
  const getFloorStyle = () => {
    switch (equipped.floor) {
      case 'floor_walnut':
        return {
          backgroundColor: '#A47551',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(69,26,3,0.18) 0px, rgba(69,26,3,0.18) 2px, transparent 2px, transparent 18px)'
        };
      case 'floor_terrazzo':
        return {
          backgroundColor: '#F5ECE6',
          backgroundImage:
            'radial-gradient(#FB7185 2px, transparent 2px), radial-gradient(#38BDF8 2px, transparent 2px), radial-gradient(#FBBF24 2.5px, transparent 2.5px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 12px 16px, 22px 8px'
        };
      case 'floor_meadow':
        return {
          backgroundColor: '#BBF7D0',
          backgroundImage:
            'radial-gradient(rgba(22, 163, 74, 0.2) 3px, transparent 3px)',
          backgroundSize: '26px 26px'
        };
      case 'floor_oak':
      default:
        return {
          backgroundColor: '#EBC89D',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(120,53,15,0.14) 0px, rgba(120,53,15,0.14) 2px, transparent 2px, transparent 18px)'
        };
    }
  };

  // Nền bầu trời ngoài cửa sổ theo giờ thực
  const renderSkyBackdrop = () => {
    if (timeInfo.period === 'night') {
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <defs>
            <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>
          </defs>
          <rect width="120" height="120" fill="url(#nightSky)" />
          {/* Mặt trăng lưỡi liềm */}
          <circle cx="84" cy="34" r="14" fill="#FEF08A" />
          <circle cx="90" cy="30" r="12" fill="#1E1B4B" />
          {/* Sao lấp lánh */}
          <circle cx="26" cy="28" r="2" fill="#FFFFFF" className="animate-twinkle" />
          <circle cx="48" cy="46" r="1.5" fill="#FDE047" className="animate-twinkle" />
          <circle cx="32" cy="70" r="2" fill="#FFFFFF" />
          <circle cx="92" cy="72" r="1.8" fill="#FDE047" className="animate-twinkle" />
        </svg>
      );
    }

    if (timeInfo.period === 'sunset') {
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <defs>
            <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="55%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
          <rect width="120" height="120" fill="url(#sunsetSky)" />
          <circle cx="60" cy="78" r="22" fill="#FEF08A" opacity="0.9" />
          <path d="M10 92 Q45 80 75 94 T120 90 L120 120 L0 120 Z" fill="#9A3412" opacity="0.45" />
        </svg>
      );
    }

    // Ban ngày
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#daySky)" />
        <circle cx="86" cy="30" r="15" fill="#FDE047" />
        {/* Mây trắng trôi */}
        <g fill="#FFFFFF" opacity="0.92">
          <circle cx="32" cy="56" r="10" />
          <circle cx="44" cy="54" r="13" />
          <circle cx="56" cy="57" r="9" />
        </g>
        <path d="M0 98 Q38 82 78 96 T120 92 L120 120 L0 120 Z" fill="#86EFAC" />
      </svg>
    );
  };

  return (
    <div className="relative w-full h-full rounded-[30px] overflow-hidden border-4 border-amber-900/15 shadow-inner select-none bg-[#FFF3E0]">
      {/* LỚP 1: TƯỜNG NHÀ (z-0) */}
      <div
        className="absolute inset-x-0 top-0 h-[62%] transition-colors duration-500"
        style={getWallStyle()}
      >
        {/* Phào chỉ chân tường */}
        <div className="absolute inset-x-0 bottom-0 h-3 bg-amber-900/20 border-t-2 border-amber-950/20" />
      </div>

      {/* LỚP 2: SÀN NHÀ (z-0) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38%] transition-colors duration-500"
        style={getFloorStyle()}
      />

      {/* Ánh sáng đêm hoặc khi tắt đèn đi ngủ */}
      {(timeInfo.isNight || pet.isSleeping) && (
        <div
          className={`pointer-events-none absolute inset-0 z-30 transition-opacity duration-700 ${
            pet.isSleeping
              ? 'bg-indigo-950/45'
              : 'bg-gradient-to-b from-indigo-950/20 via-amber-500/10 to-amber-500/15'
          }`}
        />
      )}

      {/* Quầng sáng đèn vàng ấm khi trời tối */}
      {timeInfo.isNight && !pet.isSleeping && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(circle at 80% 45%, rgba(253, 224, 71, 0.25), transparent 65%)'
          }}
        />
      )}

      {/* LỚP 3: CỬA SỔ TƯƠNG TÁC (Slot 3 - Góc trên trái) */}
      <button
        type="button"
        onClick={handleTouchWindow}
        title="Chạm để xem giờ & bầu trời"
        className="absolute top-4 left-4 z-10 w-28 h-28 active:scale-95 transition-transform focus:outline-none group"
      >
        <div
          className={`relative w-full h-full overflow-hidden shadow-md border-4 border-amber-900 bg-sky-200 ${
            equipped.window === 'win_arch'
              ? 'rounded-t-full rounded-b-2xl'
              : equipped.window === 'win_bay'
              ? 'rounded-2xl w-32'
              : 'rounded-2xl'
          }`}
        >
          {renderSkyBackdrop()}
          {/* Khung song cửa sổ */}
          <div className="absolute inset-0 border-4 border-amber-100/70 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 bg-amber-900/80" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-amber-900/80" />
          {/* Rèm cửa trang trí */}
          {equipped.window === 'win_arch' && (
            <>
              <div className="absolute top-0 left-0 w-6 h-16 bg-pink-300/85 rounded-br-2xl border-r border-pink-400" />
              <div className="absolute top-0 right-0 w-6 h-16 bg-pink-300/85 rounded-bl-2xl border-l border-pink-400" />
            </>
          )}
        </div>
        {/* Bệ cửa sổ */}
        <div className=" -mt-1 mx-auto w-[112%] -ml-[6%] h-2.5 bg-amber-800 rounded-full shadow" />
      </button>

      {/* Thông báo nhỏ khi chạm cửa sổ */}
      <AnimatePresence>
        {windowToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-3 left-4 z-40 bg-amber-950/90 text-amber-50 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
          >
            {windowToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LỚP 8: KHUNG TRANH TREO TƯỜNG (Slot 8 - Giữa tường) */}
      <button
        type="button"
        onClick={onOpenPhotoFrame}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center active:scale-95 transition-transform focus:outline-none"
      >
        {/* Dây treo tranh */}
        <div className="w-6 h-3 border-t-2 border-l-2 border-r-2 border-amber-900/60 rotate-45 -mb-1.5" />
        <div className="relative w-20 h-20 rounded-2xl bg-amber-100 p-1.5 border-4 border-amber-800 shadow-md overflow-hidden">
          {photoFrame?.imageData ? (
            <img
              src={photoFrame.imageData}
              alt={photoFrame.caption || 'Ảnh chung'}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex flex-col items-center justify-center text-center p-1">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-300 mb-0.5" />
              <span className="text-[9px] font-extrabold text-amber-900 leading-tight">
                Treo ảnh đôi
              </span>
            </div>
          )}
        </div>
        <span className="mt-1 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-[10px] font-bold text-amber-900 shadow-sm truncate max-w-[105px]">
          {photoFrame?.caption || 'Khung ảnh'}
        </span>
      </button>

      {/* GIẤY NHỚ TỦ LẠNH / TƯỜNG (Sticky Note - Góc trên phải) */}
      <button
        type="button"
        onClick={onOpenStickyNote}
        className="absolute top-4 right-4 z-10 w-24 h-24 bg-[#FEF08A] hover:bg-[#FDE047] rounded-xl p-2 shadow-md border-2 border-amber-700/30 rotate-2 active:scale-95 transition-all flex flex-col justify-between text-left"
      >
        {/* Đinh ghim đỏ */}
        <div className="mx-auto -mt-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm" />
        {stickyNote?.mode === 'drawing' && stickyNote?.drawingData ? (
          <img
            src={stickyNote.drawingData}
            alt="Tranh vẽ giấy nhớ"
            className="w-full h-14 object-contain rounded bg-white/50"
          />
        ) : (
          <p className="text-[10px] font-bold text-amber-950 line-clamp-3 leading-snug">
            {stickyNote?.text || 'Chạm để viết lời nhắn...'}
          </p>
        )}
        <div className="text-[9px] font-extrabold text-amber-800/80 truncate w-full text-right">
          ✍️ {stickyNote?.author || 'Giấy nhớ'}
        </div>
      </button>

      {/* LỚP 6: CÂY CẢNH GÓC PHÒNG (Slot 6 - Trái giữa phòng) */}
      <div className="absolute left-3 bottom-[31%] z-10 w-24 h-28 pointer-events-none">
        {equipped.plant === 'plant_sakura' && (
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
            <rect x="28" y="84" width="44" height="28" rx="8" fill="#F43F5E" stroke="#881337" strokeWidth="4" />
            <path d="M50 84 Q42 58 54 40" fill="none" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
            <circle cx="36" cy="42" r="18" fill="#F9A8D4" stroke="#831843" strokeWidth="3.5" />
            <circle cx="64" cy="38" r="20" fill="#F472B6" stroke="#831843" strokeWidth="3.5" />
            <circle cx="50" cy="24" r="16" fill="#FBCFE8" stroke="#831843" strokeWidth="3.5" />
          </svg>
        )}
        {equipped.plant === 'plant_cactus' && (
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
            <rect x="24" y="82" width="52" height="30" rx="8" fill="#FB923C" stroke="#7C2D12" strokeWidth="4" />
            <rect x="40" y="34" width="20" height="50" rx="10" fill="#4ADE80" stroke="#14532D" strokeWidth="4" />
            <rect x="22" y="48" width="14" height="24" rx="7" fill="#4ADE80" stroke="#14532D" strokeWidth="4" />
            <rect x="64" y="44" width="14" height="26" rx="7" fill="#4ADE80" stroke="#14532D" strokeWidth="4" />
            <circle cx="50" cy="30" r="6" fill="#FB7185" />
          </svg>
        )}
        {equipped.plant === 'plant_Vàng' && (
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
            <rect x="26" y="80" width="48" height="32" rx="10" fill="#FACC15" stroke="#713F12" strokeWidth="4" />
            <path d="M36 92 L64 92" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="38" cy="52" rx="12" ry="22" transform="rotate(-18 38 52)" fill="#22C55E" stroke="#14532D" strokeWidth="4" />
            <ellipse cx="62" cy="52" rx="12" ry="22" transform="rotate(18 62 52)" fill="#4ADE80" stroke="#14532D" strokeWidth="4" />
            <ellipse cx="50" cy="42" rx="12" ry="24" fill="#86EFAC" stroke="#14532D" strokeWidth="4" />
          </svg>
        )}
        {(!equipped.plant || equipped.plant === 'plant_monstera') && (
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
            <path d="M28 82 L72 82 L64 112 L36 112 Z" fill="#D97706" stroke="#78350F" strokeWidth="4" strokeLinejoin="round" />
            <ellipse cx="34" cy="56" rx="16" ry="20" transform="rotate(-25 34 56)" fill="#22C55E" stroke="#14532D" strokeWidth="4" />
            <ellipse cx="66" cy="54" rx="16" ry="20" transform="rotate(25 66 54)" fill="#4ADE80" stroke="#14532D" strokeWidth="4" />
            <ellipse cx="50" cy="40" rx="15" ry="22" fill="#16A34A" stroke="#14532D" strokeWidth="4" />
          </svg>
        )}
      </div>

      {/* LỚP 7: ĐỒ TRANG TRÍ / KỆ SÁCH / ĐÈN CÂY (Slot 7 - Phải giữa phòng) */}
      <div className="absolute right-3 bottom-[31%] z-10 w-24 h-32 pointer-events-none">
        {equipped.decor === 'decor_lamp' && (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-sm">
            <ellipse cx="50" cy="118" rx="22" ry="7" fill="#78350F" />
            <line x1="50" y1="45" x2="50" y2="118" stroke="#78350F" strokeWidth="6" />
            <circle cx="50" cy="36" r="24" fill="#FEF08A" stroke="#CA8A04" strokeWidth="4" />
            <circle cx="50" cy="36" r="16" fill="#FFFFFF" opacity="0.6" />
          </svg>
        )}
        {equipped.decor === 'decor_teatable' && (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-sm">
            <line x1="32" y1="82" x2="24" y2="120" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            <line x1="68" y1="82" x2="76" y2="120" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="50" cy="80" rx="38" ry="12" fill="#FDBA74" stroke="#78350F" strokeWidth="4" />
            {/* 2 tách trà */}
            <rect x="28" y="66" width="12" height="10" rx="3" fill="#FB7185" stroke="#881337" strokeWidth="2.5" />
            <rect x="58" y="66" width="12" height="10" rx="3" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="2.5" />
          </svg>
        )}
        {equipped.decor === 'decor_vinyl' && (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-sm">
            <rect x="18" y="72" width="64" height="46" rx="8" fill="#A78BFA" stroke="#4C1D95" strokeWidth="4" />
            <circle cx="50" cy="72" r="22" fill="#1E1B4B" stroke="#4C1D95" strokeWidth="3" />
            <circle cx="50" cy="72" r="7" fill="#FB7185" />
            <text x="65" y="40" fontSize="18">🎵</text>
          </svg>
        )}
        {(!equipped.decor || equipped.decor === 'decor_bookshelf') && (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-sm">
            <rect x="16" y="36" width="68" height="84" rx="8" fill="#D97706" stroke="#78350F" strokeWidth="4" />
            <rect x="22" y="44" width="56" height="32" rx="4" fill="#FEF3C7" />
            <rect x="22" y="82" width="56" height="32" rx="4" fill="#FEF3C7" />
            {/* Sách màu sắc */}
            <rect x="26" y="50" width="10" height="24" rx="2" fill="#FB7185" />
            <rect x="38" y="53" width="10" height="21" rx="2" fill="#38BDF8" />
            <rect x="50" y="48" width="12" height="26" rx="2" fill="#4ADE80" />
            <rect x="28" y="88" width="14" height="24" rx="2" fill="#FBBF24" />
            <rect x="45" y="92" width="18" height="20" rx="2" fill="#A78BFA" />
          </svg>
        )}
      </div>

      {/* LỚP 5: THẢM TRẢI SÀN (Slot 5 - Giữa sàn) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[8%] z-10 w-64 h-24 pointer-events-none flex items-center justify-center">
        {equipped.rug === 'rug_heart' && (
          <svg viewBox="0 0 240 100" className="w-full h-full">
            <path
              d="M120 88 C120 88 28 62 28 32 C28 14 58 6 88 18 L120 34 L152 18 C182 6 212 14 212 32 C212 62 120 88 120 88 Z"
              fill="#FBCFE8"
              stroke="#EC4899"
              strokeWidth="5"
            />
          </svg>
        )}
        {equipped.rug === 'rug_daisy' && (
          <svg viewBox="0 0 240 100" className="w-full h-full">
            <ellipse cx="120" cy="52" rx="96" ry="36" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="5" />
            <ellipse cx="120" cy="52" rx="46" ry="18" fill="#FACC15" />
          </svg>
        )}
        {equipped.rug === 'rug_cloud' && (
          <svg viewBox="0 0 240 100" className="w-full h-full">
            <ellipse cx="120" cy="54" rx="100" ry="34" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="5" strokeDasharray="10 6" />
          </svg>
        )}
        {(!equipped.rug || equipped.rug === 'rug_oval') && (
          <svg viewBox="0 0 240 100" className="w-full h-full">
            <ellipse cx="120" cy="54" rx="102" ry="34" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="5" />
            <ellipse cx="120" cy="54" rx="82" ry="24" fill="#FDE68A" />
          </svg>
        )}
      </div>

      {/* LỚP 4: GIƯỜNG / Ổ THÚ CƯNG (Slot 4 - Góc dưới trái sàn) */}
      <div className="absolute left-5 bottom-[14%] z-10 w-28 h-20 pointer-events-none">
        {equipped.bed === 'bed_strawberry' && (
          <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow">
            <ellipse cx="60" cy="54" rx="50" ry="30" fill="#FB7185" stroke="#881337" strokeWidth="4" />
            <ellipse cx="60" cy="60" rx="32" ry="16" fill="#FFE4E6" />
            <path d="M40 28 L60 36 L80 28 L60 18 Z" fill="#4ADE80" stroke="#14532D" strokeWidth="3" />
          </svg>
        )}
        {equipped.bed === 'bed_royal' && (
          <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow">
            <rect x="12" y="34" width="96" height="44" rx="18" fill="#C084FC" stroke="#581C87" strokeWidth="4" />
            <ellipse cx="60" cy="62" rx="40" ry="14" fill="#F3E8FF" />
            <path d="M48 28 L54 18 L60 26 L66 18 L72 28 Z" fill="#FACC15" stroke="#713F12" strokeWidth="2.5" />
          </svg>
        )}
        {equipped.bed === 'bed_kotatsu' && (
          <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow">
            <ellipse cx="60" cy="60" rx="52" ry="24" fill="#F59E0B" stroke="#78350F" strokeWidth="4" />
            <rect x="26" y="42" width="68" height="24" rx="8" fill="#FEF3C7" stroke="#78350F" strokeWidth="3.5" />
          </svg>
        )}
        {(!equipped.bed || equipped.bed === 'bed_cushion') && (
          <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow">
            <ellipse cx="60" cy="60" rx="48" ry="22" fill="#FDBA74" stroke="#7C2D12" strokeWidth="4" />
            <ellipse cx="60" cy="58" rx="34" ry="14" fill="#FFF7ED" />
          </svg>
        )}
      </div>

      {/* HỘP QUÀ BẤT NGỜ GIỮA PHÒNG (Mystery Gift) */}
      <AnimatePresence>
        {mysteryGift && (
          <motion.button
            type="button"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onOpenGift}
            className="absolute right-6 bottom-[14%] z-30 flex flex-col items-center active:scale-90"
          >
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 border-4 border-white shadow-lg flex items-center justify-center animate-bounce-soft">
              <Gift className="w-8 h-8 text-white" />
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-300 text-amber-950 text-[9px] font-black shadow">
                QUÀ!
              </span>
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow">
              Từ {mysteryGift.senderName}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CỤC RÁC / BỤI TRÊN SÀN (Tối đa 3 cục - chạm để dọn +5 Xu) */}
      {trashList.map((trash) => (
        <motion.button
          key={trash.id}
          type="button"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 1.3 }}
          onClick={() => onCleanTrash && onCleanTrash(trash.id)}
          style={{ left: `${trash.x}%`, top: `${trash.y}%` }}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
          title="Chạm để dọn sạch (+5 Xu)"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-amber-900/15 hover:bg-amber-900/25 backdrop-blur-[1px] border border-amber-900/30 shadow-sm">
            <span className="text-base">{trash.type === 'dust' ? '💨' : '🍪'}</span>
            <span className="absolute -top-3 px-1 rounded bg-emerald-500 text-white text-[8px] font-black opacity-90">
              +5 xu
            </span>
          </div>
        </motion.button>
      ))}

      {/* BONG BÓNG THOẠI AI CỦA PET (Hiển thị phía trên đầu thú cưng) */}
      {aiBubble?.dialogue && (
        <motion.div
          key={aiBubble.updatedAt || aiBubble.dialogue}
          initial={{ opacity: 0, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute left-1/2 -translate-x-1/2 top-[29%] z-30 w-[86%] max-w-[310px] bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 shadow-lg border-2 border-orange-200"
        >
          <div className="flex items-start gap-2">
            <Volume2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-950 leading-snug">
              {aiBubble.dialogue}
            </p>
          </div>
          {/* Đuôi bong bóng thoại chỉ xuống thú cưng */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-orange-200 rotate-45" />
        </motion.div>
      )}

      {/* SÂN KHẤU THÚ CƯNG ĐỨNG GIỮA PHÒNG */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[13%] z-20 flex flex-col items-center">
        {/* Icon đám mây đen khi thú Dỗi (sulky) */}
        {activeEmotion === 'sulky' && (
          <div className="mb-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-bold animate-bounce">
            <CloudRain className="w-3.5 h-3.5 text-sky-300" />
            <span>Đang dỗi rồi!</span>
          </div>
        )}

        {/* Hiệu ứng tim bay lên khi vuốt ve */}
        <div className="pointer-events-none absolute -top-10 inset-x-0 flex justify-center">
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: 10, x: h.offsetX, scale: 0.7 }}
                animate={{ opacity: 0, y: -55, x: h.offsetX * 1.3, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute text-rose-500 text-xl font-bold"
              >
                ❤️
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quả bóng nảy khi 2 người chơi tung bóng Co-op */}
        <AnimatePresence>
          {ballBounce && (
            <motion.div
              initial={{ y: 0, x: -50, rotate: 0 }}
              animate={{ y: [-10, -70, 0, -45, 0], x: [-45, 0, 45, 10, 0], rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3 }}
              className="absolute -top-8 z-30 text-3xl"
            >
              🧶
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nhân vật Thú cưng SVG có hoạt ảnh thở & lắc lư */}
        <motion.button
          type="button"
          onClick={handleTouchPet}
          whileTap={{ scale: 0.92 }}
          className={`focus:outline-none cursor-pointer ${
            activeEmotion === 'excited'
              ? 'animate-bounce-soft'
              : activeEmotion === 'sulky'
              ? ''
              : 'animate-breathe'
          }`}
          title={`Chạm để xoa đầu ${pet.name || 'Mochi'}`}
        >
          <PetSvgCharacter
            type={pet.type || 'cat'}
            emotion={activeEmotion}
            isSleeping={pet.isSleeping}
          />
        </motion.button>
      </div>

      {/* NÚT TƯƠNG TÁC ĐÔI CO-OP KHI CẢ 2 CÙNG ONLINE */}
      {bothOnline && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-2.5 z-30"
        >
          <button
            type="button"
            onClick={handlePlayCoopBallClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-extrabold shadow-md active:scale-95 transition-transform border-2 border-white"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cùng chơi tung bóng (+20 Xu)</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
