import React, { useState } from 'react';
import { X, ShoppingBag, Gift, Check, Sparkles } from 'lucide-react';
import { ROOM_SLOTS, FURNITURE_CATALOG } from '../../utils/gameLogic';

export default function ShopModal({
  isOpen,
  onClose,
  roomData,
  onBuyAndEquip,
  onEquipItem,
  onSendMysteryGift
}) {
  const [activeSlot, setActiveSlot] = useState('wall');
  const [tabMode, setTabMode] = useState('shop'); // 'shop' | 'inventory'
  const [giftItem, setGiftItem] = useState(null);
  const [giftNote, setGiftNote] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const coins = roomData?.coins ?? 0;
  const inventory = roomData?.room?.inventory || [];
  const equipped = roomData?.room?.equipped || {};
  const hasPendingGift = Boolean(roomData?.mysteryGift);

  const itemsForSlot = FURNITURE_CATALOG[activeSlot] || [];
  const displayedItems =
    tabMode === 'inventory'
      ? itemsForSlot.filter((item) => inventory.includes(item.id))
      : itemsForSlot;

  const handleConfirmSendGift = (e) => {
    e.preventDefault();
    if (!giftItem) return;
    onSendMysteryGift(
      giftItem,
      giftNote.trim() || 'Tặng đằng ấy món đồ mới trang trí Nhà Chung nè! 💕'
    );
    setGiftItem(null);
    setGiftNote('');
    setFeedback('🎁 Đã đặt Hộp Quà Bất Ngờ giữa phòng cho người kia bóc!');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#FFF9F2] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-orange-200 shadow-2xl max-h-[86dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-between border-b border-orange-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-base font-black text-amber-950">
                Cửa Hàng Nội Thất & Quà Tặng
              </h2>
              <p className="text-[11px] font-bold text-amber-800">
                Ngân quỹ chung: <span className="text-orange-600 font-black">{coins} Xu</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/80 text-amber-900 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chuyển Tab Mua đồ / Kho đồ */}
        <div className="px-4 pt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => setTabMode('shop')}
            className={`flex-1 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              tabMode === 'shop'
                ? 'bg-orange-400 text-white shadow-sm'
                : 'bg-amber-100/70 text-amber-900'
            }`}
          >
            🛍️ Mua Đồ & Gói Quà
          </button>
          <button
            type="button"
            onClick={() => setTabMode('inventory')}
            className={`flex-1 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              tabMode === 'inventory'
                ? 'bg-orange-400 text-white shadow-sm'
                : 'bg-amber-100/70 text-amber-900'
            }`}
          >
            📦 Kho Đồ Đã Có ({inventory.length})
          </button>
        </div>

        {/* Thanh chọn 7 danh mục Slot nội thất */}
        <div className="px-4 py-2.5 flex gap-1.5 overflow-x-auto custom-scroll shrink-0">
          {ROOM_SLOTS.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setActiveSlot(slot.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1 transition-all ${
                activeSlot === slot.id
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'bg-white border border-amber-200 text-amber-900'
              }`}
            >
              <span>{slot.icon}</span>
              <span>{slot.label}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mx-4 mb-2 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
            {feedback}
          </div>
        )}

        {/* Modal con khi bấm Gói Làm Quà */}
        {giftItem && (
          <form
            onSubmit={handleConfirmSendGift}
            className="mx-4 mb-3 p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-800">
                🎁 Gói "{giftItem.name}" ({giftItem.price} Xu) làm quà bí mật
              </span>
              <button
                type="button"
                onClick={() => setGiftItem(null)}
                className="text-xs font-bold text-rose-600 underline"
              >
                Hủy
              </button>
            </div>
            <input
              type="text"
              maxLength={90}
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="Viết lời nhắn ngọt ngào kèm hộp quà..."
              className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs font-bold text-amber-950 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-rose-500 text-white text-xs font-black shadow active:scale-95"
            >
              Đặt Hộp Quà Giữa Phòng ({giftItem.price} Xu)
            </button>
          </form>
        )}

        {/* Danh sách món đồ */}
        <div className="p-4 pt-1 overflow-y-auto custom-scroll space-y-2.5 flex-1">
          {displayedItems.map((item) => {
            const isOwned = inventory.includes(item.id);
            const isEquipped = equipped[item.slot] === item.id;
            const canAfford = coins >= item.price;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border-2 bg-white flex items-center justify-between gap-3 transition-all ${
                  isEquipped ? 'border-orange-400 bg-orange-50/40' : 'border-amber-200/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl border-2 border-amber-900/20 shadow-inner shrink-0 flex items-center justify-center text-lg"
                    style={{ backgroundColor: item.previewColor }}
                  >
                    {isEquipped ? '✨' : '🏠'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-amber-950">{item.name}</h3>
                      {isEquipped && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-amber-800/80 leading-snug mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Các nút thao tác */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {isOwned ? (
                    <button
                      type="button"
                      disabled={isEquipped}
                      onClick={() => onEquipItem(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 active:scale-95 ${
                        isEquipped
                          ? 'bg-emerald-500 text-white opacity-90'
                          : 'bg-amber-900 text-white shadow-sm'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEquipped ? 'Đã lắp' : 'Trang bị'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyAndEquip(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 active:scale-95 ${
                          canAfford
                            ? 'bg-orange-400 text-white shadow-sm'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mua ({item.price} Xu)</span>
                      </button>

                      <button
                        type="button"
                        disabled={!canAfford || hasPendingGift}
                        onClick={() => setGiftItem(item)}
                        title={
                          hasPendingGift
                            ? 'Đang có 1 hộp quà giữa phòng chờ bóc'
                            : 'Gói làm hộp quà bất ngờ cho người kia'
                        }
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 active:scale-95 ${
                          canAfford && !hasPendingGift
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3 h-3" />
                        <span>Gói làm quà</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
