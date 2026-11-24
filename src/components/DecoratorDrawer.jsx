import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Gift, Eye, Coins } from 'lucide-react';
import {
  ROOM_SLOTS,
  FURNITURE_CATALOG,
  normalizeEquippedRoom,
  normalizeInventoryList
} from '../utils/gameLogic';
import { WallFloorThumbnail } from './furniture/WallsAndFloors';
import { WindowSvg } from './furniture/Windows';
import { BedSvg } from './furniture/Beds';
import { RugSvg } from './furniture/Rugs';
import { PlantSvg } from './furniture/Plants';
import { DecorFurnitureSvg } from './furniture/DecorFurniture';
import { WallDecorSvg } from './furniture/WallDecor';
import { AccessoryThumbnail } from './pet/PetAvatar';

// Render hình thu nhỏ bằng chính SVG thật của món đồ đó (Không dùng emoji!)
export function RealItemSvgPreview({ item }) {
  if (!item) return null;

  if (item.slot === 'wall' || item.slot === 'floor') {
    return <WallFloorThumbnail itemId={item.id} />;
  }
  if (item.slot === 'window') {
    return (
      <div className="w-14 h-14 flex items-center justify-center p-1">
        <WindowSvg windowId={item.id} period="day" />
      </div>
    );
  }
  if (item.slot === 'bed') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <BedSvg bedId={item.id} />
      </div>
    );
  }
  if (item.slot === 'rug') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <RugSvg rugId={item.id} />
      </div>
    );
  }
  if (item.slot === 'plant') {
    return (
      <div className="w-14 h-14 flex items-center justify-center">
        <PlantSvg plantId={item.id} />
      </div>
    );
  }
  if (item.slot === 'decor') {
    return (
      <div className="w-14 h-14 flex items-center justify-center">
        <DecorFurnitureSvg decorId={item.id} lampOn={true} />
      </div>
    );
  }
  if (item.slot === 'wallDecor') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <WallDecorSvg wallDecorId={item.id} lightsOn={true} />
      </div>
    );
  }
  if (item.slot === 'accessory') {
    return <AccessoryThumbnail accessoryId={item.id} />;
  }
  return null;
}

export default function DecoratorDrawer({
  isOpen,
  onClose,
  roomData,
  activeSlot,
  onSelectSlot,
  previewEquipped,
  onPreviewItem,
  onBuyAndEquip,
  onEquipItem,
  onSendMysteryGift
}) {
  const [filterOwnedOnly, setFilterOwnedOnly] = useState(false);
  const [giftItem, setGiftItem] = useState(null);
  const [giftNote, setGiftNote] = useState('');

  if (!isOpen) return null;

  const coins = roomData?.coins ?? 0;
  const inventory = normalizeInventoryList(roomData?.room?.inventory);
  const equipped = normalizeEquippedRoom(roomData?.room?.equipped);
  const hasPendingGift = Boolean(roomData?.mysteryGift);

  const itemsForSlot = FURNITURE_CATALOG[activeSlot] || [];
  const displayedItems = filterOwnedOnly
    ? itemsForSlot.filter((it) => inventory.includes(it.id))
    : itemsForSlot;

  const handleConfirmGift = (e) => {
    e.preventDefault();
    if (!giftItem) return;
    onSendMysteryGift(
      giftItem,
      giftNote.trim() || 'Tặng đằng ấy món đồ mới trang trí Nhà Chung nè!'
    );
    setGiftItem(null);
    setGiftNote('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 10px), 10px)'
          }}
          className="fixed inset-x-0 bottom-0 z-40 max-w-md mx-auto bg-[#FFF8F0]/96 backdrop-blur-lg rounded-t-[30px] border-t-[2.5px] border-[#4A3525] shadow-[0_-10px_30px_rgba(74,53,37,0.18)] flex flex-col"
        >
          {/* Thanh tiêu đề Studio + Ngân quỹ Xu + Chuyển Kho đồ */}
          <div className="px-4 pt-2.5 pb-1.5 flex items-center justify-between border-b border-[#4A3525]/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#4A3525]">
                Xưởng Trang Trí Trực Quan
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[11px] font-black text-[#4A3525] tabular-nums">
                <Coins className="w-3 h-3" />
                {coins} Xu
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterOwnedOnly((prev) => !prev)}
                className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border-[1.6px] border-[#4A3525] transition-colors ${
                  filterOwnedOnly
                    ? 'bg-[#88C9A1] text-[#4A3525]'
                    : 'bg-[#FFFDF9] text-[#7D6352]'
                }`}
              >
                {filterOwnedOnly ? 'Kho đã có' : 'Tất cả đồ'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] text-[#4A3525] flex items-center justify-center active:scale-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Thanh trượt ngang 9 Danh mục Slot */}
          <div className="px-3.5 py-2 flex gap-1.5 overflow-x-auto custom-scroll">
            {ROOM_SLOTS.map((slot) => {
              const selected = activeSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black whitespace-nowrap border-[1.8px] border-[#4A3525] transition-all ${
                    selected
                      ? 'bg-[#FF9B71] text-[#4A3525] shadow-sm -translate-y-0.5'
                      : 'bg-[#FFFDF9] text-[#7D6352]'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          {/* Hộp nhập lời nhắn khi chọn Gói làm quà */}
          {giftItem && (
            <form
              onSubmit={handleConfirmGift}
              className="mx-3.5 mb-2 p-2.5 rounded-2xl bg-[#FFF0F3] border-2 border-[#4A3525] flex items-center gap-2"
            >
              <input
                type="text"
                maxLength={85}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder={`Lời nhắn gói quà "${giftItem.name}"...`}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#4A3525] text-xs font-bold text-[#4A3525] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#FF9B71] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black shrink-0"
              >
                Gửi ({giftItem.price} Xu)
              </button>
              <button
                type="button"
                onClick={() => setGiftItem(null)}
                className="text-xs font-bold text-[#7D6352] px-1"
              >
                Hủy
              </button>
            </form>
          )}

          {/* Khay trượt ngang các thẻ đồ nội thất bằng SVG thật + Live Preview */}
          <div className="px-3.5 pb-1.5 flex gap-2.5 overflow-x-auto custom-scroll">
            {displayedItems.map((item) => {
              const isOwned = inventory.includes(item.id);
              const isEquipped = equipped[item.slot] === item.id;
              const isPreviewing = previewEquipped?.[item.slot] === item.id;
              const canAfford = coins >= item.price;

              return (
                <div
                  key={item.id}
                  onClick={() => onPreviewItem(item)}
                  className={`w-38 shrink-0 p-2.5 rounded-2xl border-2 border-[#4A3525] flex flex-col justify-between cursor-pointer transition-all ${
                    isEquipped
                      ? 'bg-[#FFF3D6] shadow-sm'
                      : isPreviewing
                      ? 'bg-[#FFE8D6] ring-2 ring-[#FF9B71]'
                      : 'bg-[#FFFDF9]'
                  }`}
                >
                  {/* Khu vực hiển thị SVG thật của món đồ */}
                  <div>
                    <div className="relative w-full h-16 rounded-xl bg-[#FFF8F0] border border-[#4A3525]/20 flex items-center justify-center overflow-hidden mb-1.5">
                      <RealItemSvgPreview item={item} />
                      {isEquipped && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-[#88C9A1] border border-[#4A3525] text-[#4A3525] text-[8.5px] font-black">
                          Đang lắp
                        </span>
                      )}
                      {!isEquipped && isPreviewing && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-[#FFE082] border border-[#4A3525] text-[#4A3525] text-[8.5px] font-black flex items-center gap-0.5">
                          <Eye className="w-2.5 h-2.5" />
                          Thử
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-black text-[#4A3525] truncate">
                      {item.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-[#7D6352] line-clamp-1 leading-tight mt-0.5">
                      {item.desc}
                    </p>
                  </div>

                  {/* Cụm nút hành động dưới thẻ */}
                  <div
                    className="mt-2 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOwned ? (
                      <button
                        type="button"
                        disabled={isEquipped}
                        onClick={() => onEquipItem(item)}
                        className={`tactile-btn w-full py-1.5 rounded-xl border-[1.8px] border-[#4A3525] text-[11px] font-black flex items-center justify-center gap-1 ${
                          isEquipped
                            ? 'bg-[#88C9A1] text-[#4A3525]'
                            : 'bg-[#FFE082] text-[#4A3525]'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isEquipped ? 'Đang dùng' : 'Lắp ngay'}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuyAndEquip(item)}
                          className={`tactile-btn flex-1 py-1.5 rounded-xl border-[1.8px] border-[#4A3525] text-[10.5px] font-black flex items-center justify-center gap-0.5 tabular-nums ${
                            canAfford
                              ? 'bg-[#FF9B71] text-[#4A3525]'
                              : 'bg-[#E6DCCF] text-[#7D6352] opacity-70 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{item.price} Xu</span>
                        </button>

                        <button
                          type="button"
                          disabled={!canAfford || hasPendingGift}
                          onClick={() => setGiftItem(item)}
                          title="Gói làm hộp quà bất ngờ cho người kia"
                          className={`tactile-btn p-1.5 rounded-xl border-[1.8px] border-[#4A3525] ${
                            canAfford && !hasPendingGift
                              ? 'bg-[#FFB7C5] text-[#4A3525]'
                              : 'bg-[#E6DCCF] text-[#7D6352] opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <Gift className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
