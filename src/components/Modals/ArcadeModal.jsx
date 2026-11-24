import React from 'react';
import { Gamepad2, Trophy, Flame, Play, Coins, Sparkles, UtensilsCrossed } from 'lucide-react';
import BottomSheet from '../BottomSheet';
import { SkewerSvg } from '../minigames/grillAssets';

export const ARCADE_DAILY_CAP = 150;

export default function ArcadeModal({
  isOpen,
  onClose,
  roomData,
  dailyEarnedCoins = 0,
  onStartSubwayRun,
  onStartGrillSort
}) {
  const petName = roomData?.pet?.name || 'Mochi';
  const p1Name = roomData?.players?.player1?.name || 'Chủ 1';
  const p2Name = roomData?.players?.player2?.name || 'Chủ 2';

  const subwayScores = roomData?.minigames?.subwayRun?.highScores || {};
  const p1Best = subwayScores.player1 || { score: 0, distance: 0, coins: 0 };
  const p2Best = subwayScores.player2 || { score: 0, distance: 0, coins: 0 };

  const grillData = roomData?.minigames?.grillSort || {};
  const gP1 = grillData.player1 || { maxLevel: 0, bestScore: 0 };
  const gP2 = grillData.player2 || { maxLevel: 0, bestScore: 0 };
  const sharedOrdersCleared = Number(grillData.sharedOrdersCleared || 0);

  const remainingCap = Math.max(0, ARCADE_DAILY_CAP - dailyEarnedCoins);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Góc Vui Chơi Co-op"
      subtitle={`Kiếm thêm Xu chung & đua kỷ lục cùng ${petName}`}
      icon={Gamepad2}
      maxHeight="86dvh"
    >
      <div className="space-y-3.5">
        {/* Thanh theo dõi Hạn mức Xu thưởng hàng ngày (Daily Bonus Cap) */}
        <div className="p-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#E87A4D]" />
            <div>
              <div className="text-xs font-black text-[#4A3525]">
                Hạn mức Xu thưởng hôm nay
              </div>
              <div className="text-[10.5px] font-bold text-[#7D6352]">
                Còn nhận được tối đa {remainingCap} Xu nữa hôm nay
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#FFE082] border-[1.6px] border-[#4A3525] text-xs font-black text-[#4A3525] tabular-nums">
            {dailyEarnedCoins}/{ARCADE_DAILY_CAP}
          </span>
        </div>

        {/* THẺ MINI-GAME 1: BẾP NƯỚNG MOCHI (MỚI • GIẢI ĐỐ BBQ TRIPLE-MATCH) */}
        <div className="relative p-4 rounded-[26px] bg-gradient-to-br from-[#FFF6E5] via-[#FFE9D6] to-[#FFF0DE] border-[2.5px] border-[#4A3525] shadow-md space-y-3 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#88C9A1] border-[1.6px] border-[#4A3525] text-[10px] font-black text-[#4A3525] mb-1.5">
                <UtensilsCrossed className="w-3 h-3" />
                <span>Mới • Giải Đố</span>
              </div>
              <h3 className="text-lg font-black text-[#4A3525] leading-tight">
                Bếp Nướng {petName}
              </h3>
              <p className="text-[11px] font-bold text-[#7D6352] mt-0.5 leading-snug">
                Xếp 3 xiên nướng giống nhau giao đơn, phá băng, mở xích & cùng nhau tích lũy đơn bếp chung!
              </p>
            </div>

            {/* Hình minh họa 3 xiên nướng SVG mini */}
            <div className="w-16 h-16 rounded-2xl bg-[#6B4E3D] border-2 border-[#4A3525] shrink-0 p-1.5 flex items-center justify-around shadow-sm">
              <div className="w-4 h-12"><SkewerSvg type="burger" /></div>
              <div className="w-4 h-12"><SkewerSvg type="mochi" /></div>
              <div className="w-4 h-12"><SkewerSvg type="pizza" /></div>
            </div>
          </div>

          {/* Thanh đối đầu Màn & Tiến Độ Bếp Chung */}
          <div className="p-2.5 rounded-2xl bg-[#FFFDF9] border-[1.8px] border-[#4A3525] flex items-center justify-between text-[11px] font-black text-[#4A3525]">
            <span className="truncate">
              {p1Name}: <strong className="text-[#E87A4D]">Màn {gP1.maxLevel || 0}</strong>
            </span>
            <span className="text-[#4A3525]/30">|</span>
            <span className="truncate">
              {p2Name}: <strong className="text-[#5EA87A]">Màn {gP2.maxLevel || 0}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between text-[10.5px] font-extrabold text-[#4A3525]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E87A4D]" />
              +25 Xu/màn (+5 nếu không Booster)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] text-[10px] font-black tabular-nums">
              Bếp chung: {sharedOrdersCleared} đơn
            </span>
          </div>

          <button
            type="button"
            onClick={onStartGrillSort}
            className="tactile-btn w-full py-3 rounded-2xl bg-[#88C9A1] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-[#4A3525]" />
            <span>Nướng Xiên Ngay!</span>
          </button>
        </div>

        {/* THẺ MINI-GAME 2: MOCHI CHẠY PHỐ (SUBWAY SURFERS 3 LÀN) */}
        <div className="relative p-4 rounded-[26px] bg-gradient-to-br from-[#FFF3D6] via-[#FFE8D6] to-[#FFDCE5] border-[2.5px] border-[#4A3525] shadow-md space-y-3 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF9B71] border-[1.6px] border-[#4A3525] text-[10px] font-black text-[#4A3525] mb-1.5">
                <Flame className="w-3 h-3 fill-[#FFE082]" />
                <span>Hot • Đua Kỷ Lục</span>
              </div>
              <h3 className="text-lg font-black text-[#4A3525] leading-tight">
                {petName} Chạy Phố
              </h3>
              <p className="text-[11px] font-bold text-[#7D6352] mt-0.5 leading-snug">
                Chạy vô tận 3 làn giả 3D! Vuốt né tàu gỗ, nhảy rào, trượt gầm và vượt qua vạch đích kỷ lục của người kia!
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] shrink-0 overflow-hidden shadow-sm">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <rect width="64" height="24" fill="#AEE2FF" />
                <circle cx="50" cy="12" r="6" fill="#FFE082" />
                <rect y="24" width="64" height="40" fill="#88C9A1" />
                <polygon points="24,24 40,24 58,64 6,64" fill="#8C7565" stroke="#4A3525" strokeWidth="2" />
                <line x1="29" y1="24" x2="23" y2="64" stroke="#FFFDF9" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="35" y1="24" x2="41" y2="64" stroke="#FFFDF9" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="32" cy="49" r="7" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-2.5 rounded-2xl border-[1.8px] border-[#4A3525] ${
                p1Best.score >= p2Best.score && p1Best.score > 0
                  ? 'bg-[#FFE082]'
                  : 'bg-[#FFFDF9]'
              }`}
            >
              <div className="flex items-center justify-between text-[10.5px] font-black text-[#4A3525]">
                <span className="truncate">{p1Name}</span>
                {p1Best.score >= p2Best.score && p1Best.score > 0 && (
                  <Trophy className="w-3.5 h-3.5 text-[#E87A4D] shrink-0" />
                )}
              </div>
              <div className="text-base font-black text-[#4A3525] tabular-nums mt-0.5">
                {p1Best.score} đ
              </div>
              <div className="text-[9.5px] font-bold text-[#7D6352] tabular-nums">
                {p1Best.distance}m • {p1Best.coins} xu
              </div>
            </div>

            <div
              className={`p-2.5 rounded-2xl border-[1.8px] border-[#4A3525] ${
                p2Best.score > p1Best.score
                  ? 'bg-[#FFE082]'
                  : 'bg-[#FFFDF9]'
              }`}
            >
              <div className="flex items-center justify-between text-[10.5px] font-black text-[#4A3525]">
                <span className="truncate">{p2Name}</span>
                {p2Best.score > p1Best.score && (
                  <Trophy className="w-3.5 h-3.5 text-[#E87A4D] shrink-0" />
                )}
              </div>
              <div className="text-base font-black text-[#4A3525] tabular-nums mt-0.5">
                {p2Best.score} đ
              </div>
              <div className="text-[9.5px] font-bold text-[#7D6352] tabular-nums">
                {p2Best.distance}m • {p2Best.coins} xu
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10.5px] font-extrabold text-[#4A3525]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E87A4D]" />
              Thưởng tối đa +35 Xu/ván • +12 Vui • -6 Ngủ
            </span>
          </div>

          <button
            type="button"
            onClick={onStartSubwayRun}
            className="tactile-btn w-full py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-[#4A3525]" />
            <span>Chạy Phố Ngay!</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
