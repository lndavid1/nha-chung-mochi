import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Lock } from 'lucide-react';
import { getFurnitureById } from '../../utils/gameLogic';
import BottomSheet from '../BottomSheet';
import { RealItemSvgPreview } from '../DecoratorDrawer';

export default function GiftUnwrapModal({
  isOpen,
  onClose,
  mysteryGift,
  currentPlayerRole,
  onConfirmUnwrap
}) {
  const [unwrapped, setUnwrapped] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUnwrapped(false);
    }
  }, [isOpen]);

  if (!mysteryGift) return null;

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
      // ignore
    }
    onConfirmUnwrap(mysteryGift);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Hộp Quà Từ ${mysteryGift.senderName}`}
      subtitle="Món quà bất ngờ đặt giữa phòng chung"
      icon={Gift}
    >
      <div className="text-center space-y-3.5 py-1">
        <div className="mx-auto w-24 h-24 rounded-3xl bg-[#FFFDF9] border-[2.5px] border-[#4A3525] flex items-center justify-center shadow-sm overflow-hidden">
          {unwrapped || isSender ? (
            <RealItemSvgPreview item={itemInfo} />
          ) : (
            <div className="w-full h-full bg-[#FF9B71] flex items-center justify-center">
              <Gift className="w-11 h-11 text-[#FFFDF9]" />
            </div>
          )}
        </div>

        {isSender && !unwrapped ? (
          <div className="p-4 rounded-2xl bg-[#FFF0DE] border-2 border-[#4A3525] space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#4A3525]">
              <Lock className="w-3.5 h-3.5 text-[#E87A4D]" />
              <span>Dành riêng cho người kia bóc!</span>
            </div>
            <p className="text-xs font-bold text-[#7D6352] leading-relaxed">
              Bạn đã gói món đồ{' '}
              <strong className="text-[#4A3525]">
                {itemInfo?.name || mysteryGift.itemName}
              </strong>{' '}
              kèm lời nhắn:
              <br />
              <em className="text-[#4A3525]">"{mysteryGift.message}"</em>
            </p>
          </div>
        ) : !unwrapped ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#7D6352]">
              {mysteryGift.senderName} đã chuẩn bị một hộp quà bí mật giữa phòng cho riêng bạn!
            </p>
            <button
              type="button"
              onClick={handleUnwrapClick}
              className="tactile-btn w-full py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mở Hộp Quà Bất Ngờ Ngay!</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FFF3D6] border-2 border-[#4A3525] space-y-2">
            <div className="text-xs font-black text-[#E87A4D] uppercase">
              Món quà đã được mở
            </div>
            <div className="text-base font-black text-[#4A3525]">
              {itemInfo?.name || mysteryGift.itemName}
            </div>
            <p className="text-xs font-bold text-[#4A3525] italic bg-[#FFFDF9] p-3 rounded-xl border border-[#4A3525]">
              "{mysteryGift.message}"
            </p>
            <p className="text-[11px] font-black text-[#5EA87A]">
              Đã tự động lắp vào phòng và cất vào Kho đồ chung!
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
