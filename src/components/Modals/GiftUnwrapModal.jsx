import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Sparkles, Lock } from 'lucide-react';
import { getFurnitureById } from '../../utils/gameLogic';

export default function GiftUnwrapModal({
  isOpen,
  onClose,
  mysteryGift,
  currentPlayerRole,
  onConfirmUnwrap
}) {
  const [unwrapped, setUnwrapped] = useState(false);

  if (!isOpen || !mysteryGift) return null;

  const isSender = mysteryGift.senderRole === currentPlayerRole;
  const itemInfo = getFurnitureById(mysteryGift.itemId);

  const handleUnwrapClick = () => {
    setUnwrapped(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore if canvas-confetti fails
    }
    onConfirmUnwrap(mysteryGift);
  };

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#FFF9F2] rounded-3xl border-4 border-rose-300 shadow-2xl p-5 text-center space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setUnwrapped(false);
              onClose();
            }}
            className="p-1.5 rounded-full bg-rose-100 text-rose-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center shadow-lg">
          <Gift className="w-10 h-10" />
        </div>

        <h2 className="text-lg font-black text-amber-950">
          Hộp Quà Bất Ngờ từ {mysteryGift.senderName}!
        </h2>

        {isSender && !unwrapped ? (
          <div className="p-3.5 rounded-2xl bg-amber-100/80 border border-amber-300 space-y-2">
            <div className="inline-flex items-center gap-1 text-xs font-black text-amber-900">
              <Lock className="w-3.5 h-3.5 text-orange-600" />
              <span>Hộp quà dành riêng cho người kia!</span>
            </div>
            <p className="text-xs font-semibold text-amber-800 leading-relaxed">
              Bạn đã gói món đồ <strong>{itemInfo?.name || mysteryGift.itemName}</strong> kèm lời nhắn:
              <br />
              <em>"{mysteryGift.message}"</em>
            </p>
            <p className="text-[11px] font-bold text-orange-600">
              Hãy nhắc người kia vào phòng bấm mở hộp quà nha!
            </p>
          </div>
        ) : !unwrapped ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-amber-800">
              {mysteryGift.senderName} đã để lại một hộp quà bí mật giữa phòng cho riêng bạn!
            </p>
            <button
              type="button"
              onClick={handleUnwrapClick}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 text-white font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Bóc Hộp Quà Ngay! 🎉</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
            <div className="text-xs font-black text-rose-700 uppercase">
              🎊 Chúc mừng bạn nhận được 🎊
            </div>
            <div className="text-base font-black text-amber-950">
              {itemInfo?.name || mysteryGift.itemName}
            </div>
            <p className="text-xs font-bold text-amber-900 italic bg-white/80 p-2.5 rounded-xl border border-rose-200">
              "💌 {mysteryGift.message}"
            </p>
            <p className="text-[11px] font-extrabold text-emerald-700">
              ✅ Đã tự động trang bị vào phòng và cất vào Kho đồ chung!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
