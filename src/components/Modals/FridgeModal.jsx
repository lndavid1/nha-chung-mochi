import React from 'react';
import { Refrigerator, ShoppingBasket, StickyNote, ChefHat } from 'lucide-react';
import BottomSheet from '../BottomSheet';
import {
  INGREDIENTS_LIST,
  FAST_FOOD_LIST,
  normalizeFridge,
  CookingIconSvg,
  StarRatingSvg
} from '../../data/cookingData';

export default function FridgeModal({
  isOpen,
  onClose,
  roomData,
  onOpenMarket,
  onOpenStickyNote,
  onOpenCooking
}) {
  const fridge = normalizeFridge(roomData?.fridge);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Tủ Lạnh Chung"
      subtitle="Nơi trữ nguyên liệu tươi, đồ ăn nhanh & Pate nhà làm"
      icon={Refrigerator}
      maxHeight="86dvh"
    >
      <div className="space-y-3.5">
        {/* NGĂN 1: MÓN ĐÃ NẤU (PATE NHÀ LÀM) */}
        <div className="p-3 rounded-2xl bg-[#FFF5EB] border-2 border-[#4A3525] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#4A3525]">
              Ngăn 1 • Pate Nhà Làm ({fridge.cookedDishes.reduce((s, d) => s + (d.portions || 0), 0)} phần)
            </span>
            {onOpenCooking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCooking();
                }}
                className="px-2.5 py-0.5 rounded-full bg-[#FF9B71] border-[1.5px] border-[#4A3525] text-[10.5px] font-black text-[#4A3525] flex items-center gap-1 active:scale-95"
              >
                <ChefHat className="w-3 h-3" />
                <span>Nấu thêm</span>
              </button>
            )}
          </div>

          {fridge.cookedDishes.length === 0 ? (
            <p className="text-[11px] font-bold text-[#7D6352] py-2 text-center bg-[#FFFDF9] rounded-xl border border-dashed border-[#4A3525]/35">
              Chưa có hũ Pate nào. Hãy chạm vào Bếp Nấu để trổ tài nấu cho bé nha!
            </p>
          ) : (
            <div className="space-y-1.5">
              {fridge.cookedDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="p-2 rounded-xl bg-[#FFFDF9] border-[1.6px] border-[#4A3525] flex items-center gap-2.5"
                >
                  <CookingIconSvg id={dish.recipeId} className="w-9 h-9 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-[#4A3525] truncate">
                        {dish.name}
                      </span>
                      <StarRatingSvg quality={dish.quality} size={12} />
                    </div>
                    <div className="text-[10.5px] font-bold text-[#7D6352]">
                      {dish.cookedBy || 'Chủ nhỏ'} nấu • Còn{' '}
                      <strong className="text-[#E87A4D]">x{dish.portions} phần</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NGĂN 2: NGUYÊN LIỆU TƯƠI */}
        <div className="p-3 rounded-2xl bg-[#EEF9F2] border-2 border-[#4A3525] space-y-2">
          <span className="text-xs font-black text-[#4A3525] block">
            Ngăn 2 • Nguyên Liệu Tươi
          </span>
          <div className="grid grid-cols-3 gap-2">
            {INGREDIENTS_LIST.map((ing) => {
              const count = fridge.ingredients[ing.id] || 0;
              return (
                <div
                  key={ing.id}
                  className={`p-2 rounded-xl border-[1.6px] border-[#4A3525] flex flex-col items-center text-center ${
                    count > 0 ? 'bg-[#FFFDF9]' : 'bg-[#FFFDF9]/55 opacity-60'
                  }`}
                >
                  <CookingIconSvg id={ing.id} className="w-8 h-8" />
                  <span className="text-[10px] font-black text-[#4A3525] leading-tight mt-1 line-clamp-1">
                    {ing.name}
                  </span>
                  <span className="text-[10.5px] font-black text-[#5EA87A] tabular-nums">
                    x{count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* NGĂN 3: ĐỒ ĂN NHANH */}
        <div className="p-3 rounded-2xl bg-[#FFFDF2] border-2 border-[#4A3525] space-y-2">
          <span className="text-xs font-black text-[#4A3525] block">
            Ngăn 3 • Đồ Ăn Nhanh (Đổ ra bát ăn liền)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {FAST_FOOD_LIST.map((ff) => {
              const count = fridge.fastFood[ff.id] || 0;
              return (
                <div
                  key={ff.id}
                  className={`p-2 rounded-xl border-[1.6px] border-[#4A3525] flex flex-col items-center text-center ${
                    count > 0 ? 'bg-[#FFFDF9]' : 'bg-[#FFFDF9]/55 opacity-60'
                  }`}
                >
                  <CookingIconSvg id={ff.id} className="w-8 h-8" />
                  <span className="text-[10px] font-black text-[#4A3525] leading-tight mt-1 line-clamp-1">
                    {ff.name}
                  </span>
                  <span className="text-[10.5px] font-black text-[#E87A4D] tabular-nums">
                    x{count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2 NÚT HÀNH ĐỘNG NHANH DƯỚI ĐÁY */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenMarket) onOpenMarket();
            }}
            className="tactile-btn py-2.5 rounded-2xl bg-[#88C9A1] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
          >
            <ShoppingBasket className="w-4 h-4" />
            <span>Đi Chợ mua thêm</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenStickyNote) onOpenStickyNote();
            }}
            className="tactile-btn py-2.5 rounded-2xl bg-[#FFE082] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
          >
            <StickyNote className="w-4 h-4" />
            <span>Giấy Nhớ Tủ Lạnh</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
