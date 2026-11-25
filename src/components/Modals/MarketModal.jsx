import React, { useState } from 'react';
import { ShoppingBasket, Coins, Refrigerator, Store } from 'lucide-react';
import BottomSheet from '../BottomSheet';
import {
  INGREDIENTS_LIST,
  FAST_FOOD_LIST,
  normalizeFridge,
  CookingIconSvg
} from '../../data/cookingData';
import { MartIconSvg } from '../minigames/supermarket/supermarketAssets';
import { soundEngine } from '../../services/soundEngine';

export default function MarketModal({
  isOpen,
  onClose,
  roomData,
  onBuyMarketItem,
  onOpenFridge,
  onOpenSupermarket
}) {
  const [tab, setTab] = useState('ingredients'); // 'ingredients' | 'fastFood'
  const [flashId, setFlashId] = useState(null);

  const coins = roomData?.coins ?? 0;
  const fridge = normalizeFridge(roomData?.fridge);

  const handleBuy = (category, item, qty) => {
    const cost = item.price * qty;
    if (coins < cost) {
      soundEngine.play('error');
      return;
    }
    soundEngine.play('buy');
    setFlashId(item.id);
    setTimeout(() => setFlashId(null), 500);
    onBuyMarketItem(category, item, qty);
  };

  const list = tab === 'ingredients' ? INGREDIENTS_LIST : FAST_FOOD_LIST;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Chợ Thực Phẩm Mochi"
      subtitle={`Ngân quỹ chung: ${coins} Xu • Mua về tự cất vào Tủ Lạnh`}
      icon={ShoppingBasket}
      maxHeight="86dvh"
    >
      <div className="space-y-3">
        {/* Lối tắt nhanh sang Siêu Thị Mochi (Co-op Idle) */}
        {onOpenSupermarket && (
          <button
            type="button"
            onClick={() => {
              soundEngine.play('tap');
              onClose();
              onOpenSupermarket();
            }}
            className="tactile-btn w-full px-3 py-2 rounded-2xl bg-gradient-to-r from-[#FFF3D6] to-[#E6F7EC] border-2 border-[#4A3525] flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MartIconSvg className="w-8 h-8 shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-black text-[#4A3525] truncate">
                  Siêu thị của tụi mình
                </div>
                <div className="text-[10px] font-bold text-[#7D6352] truncate">
                  Quản lý quầy hàng, rút lãi Xu &amp; lấy nguyên liệu tươi!
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[10.5px] font-black text-[#4A3525] flex items-center gap-1 shrink-0">
              <Store className="w-3 h-3" />
              <span>Vào ngay</span>
            </span>
          </button>
        )}

        {/* Thanh chuyển 2 Tab + nút mở nhanh Tủ Lạnh */}
        <div className="flex items-center gap-2">
          <div className="flex-1 grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#FFF0DE] border-[1.8px] border-[#4A3525]">
            <button
              type="button"
              onClick={() => {
                soundEngine.play('tap');
                setTab('ingredients');
              }}
              className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                tab === 'ingredients'
                  ? 'bg-[#88C9A1] text-[#4A3525] border border-[#4A3525] shadow-sm'
                  : 'text-[#7D6352]'
              }`}
            >
              Nguyên Liệu Tươi
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.play('tap');
                setTab('fastFood');
              }}
              className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                tab === 'fastFood'
                  ? 'bg-[#FFE082] text-[#4A3525] border border-[#4A3525] shadow-sm'
                  : 'text-[#7D6352]'
              }`}
            >
              Đồ Ăn Nhanh
            </button>
          </div>

          {onOpenFridge && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFridge();
              }}
              className="p-2.5 rounded-2xl bg-[#FFFDF9] border-[1.8px] border-[#4A3525] text-[#4A3525] active:scale-95"
              title="Xem Tủ Lạnh chung"
            >
              <Refrigerator className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-[11px] font-bold text-[#7D6352] px-1">
          {tab === 'ingredients'
            ? 'Mua nguyên liệu tươi vào Nhà Bếp chạm bếp nấu Pate 3 sao siêu bổ dưỡng & tiết kiệm!'
            : 'Đồ ăn nhanh có thể đổ thẳng ra bát ăn liền khi bận rộn không kịp nấu.'}
        </p>

        {/* Danh sách món */}
        <div className="space-y-2">
          {list.map((item) => {
            const ownedCount =
              tab === 'ingredients'
                ? fridge.ingredients[item.id] || 0
                : fridge.fastFood[item.id] || 0;
            const canBuy1 = coins >= item.price;
            const canBuy3 = coins >= item.price * 3;
            const isFlashing = flashId === item.id;

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-2xl border-2 border-[#4A3525] flex items-center gap-2.5 transition-all ${
                  isFlashing ? 'bg-[#E6F7EC] scale-[1.01]' : 'bg-[#FFFDF9]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] border-[1.6px] border-[#4A3525]/70 flex items-center justify-center shrink-0">
                  <CookingIconSvg id={item.id} className="w-10 h-10" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#4A3525] truncate">
                      {item.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FFF0DE] border border-[#4A3525]/50 text-[9.5px] font-black text-[#4A3525] tabular-nums shrink-0">
                      Tủ: {ownedCount}
                    </span>
                  </div>
                  <p className="text-[10.5px] font-bold text-[#7D6352] line-clamp-1 mt-0.5">
                    {tab === 'fastFood'
                      ? `+${item.hungerGain} Đói • +${item.moodGain} Vui`
                      : item.desc}
                  </p>
                  <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#E87A4D] mt-0.5 tabular-nums">
                    <Coins className="w-3 h-3" />
                    <span>{item.price} Xu / phần</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={!canBuy1}
                    onClick={() => handleBuy(tab, item, 1)}
                    className={`tactile-btn px-2.5 py-1 rounded-xl border-[1.6px] border-[#4A3525] text-[11px] font-black ${
                      canBuy1
                        ? 'bg-[#FF9B71] text-[#4A3525]'
                        : 'bg-[#E8DFD5] text-[#7D6352] opacity-60'
                    }`}
                  >
                    +1 ({item.price})
                  </button>
                  <button
                    type="button"
                    disabled={!canBuy3}
                    onClick={() => handleBuy(tab, item, 3)}
                    className={`tactile-btn px-2.5 py-1 rounded-xl border-[1.6px] border-[#4A3525] text-[10.5px] font-black ${
                      canBuy3
                        ? 'bg-[#FFE082] text-[#4A3525]'
                        : 'bg-[#E8DFD5] text-[#7D6352] opacity-60'
                    }`}
                  >
                    +3 ({item.price * 3})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
