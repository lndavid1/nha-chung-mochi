import React from 'react';
import { Utensils, ShoppingBasket, ChefHat, RotateCcw } from 'lucide-react';
import BottomSheet from '../BottomSheet';
import {
  FAST_FOOD_LIST,
  normalizeFridge,
  getRecipeById,
  computeDishStats,
  CookingIconSvg,
  StarRatingSvg
} from '../../data/cookingData';
import { soundEngine } from '../../services/soundEngine';

export default function ServeBowlModal({
  isOpen,
  onClose,
  roomData,
  onServeToBowl,
  onClearBowlToFridge,
  onOpenCooking,
  onOpenMarket
}) {
  const bowl = roomData?.bowl || null;
  const fridge = normalizeFridge(roomData?.fridge);
  const availableFastFoods = FAST_FOOD_LIST.filter(
    (ff) => (fridge.fastFood[ff.id] || 0) > 0
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={bowl ? 'Bát Ăn Đang Có Món' : 'Đổ Thức Ăn Ra Bát'}
      subtitle={
        bowl
          ? 'Bé sẽ tự chạy ra bếp ăn ngay khi thấy đói!'
          : 'Chọn Pate nhà làm hoặc Đồ ăn nhanh trong Tủ Lạnh'
      }
      icon={Utensils}
      maxHeight="80dvh"
    >
      {bowl ? (
        <div className="space-y-3 text-center py-2">
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFF3E2] border-[1.8px] border-[#4A3525] flex items-center justify-center">
              <CookingIconSvg id={bowl.itemId} className="w-11 h-11" />
            </div>
            <div className="text-sm font-black text-[#4A3525] flex items-center justify-center gap-1.5">
              <span>{bowl.name}</span>
              {bowl.foodType === 'cooked' && <StarRatingSvg quality={bowl.quality || 3} size={14} />}
            </div>
            <p className="text-xs font-bold text-[#7D6352]">
              Bát đang có sẵn <strong>{bowl.name}</strong> (+{bowl.hungerGain} Đói, +{bowl.moodGain} Vui).
              Đợi bé đói (&lt;75%) sẽ tự chạy ra ăn sạch nha!
            </p>
            {bowl.cookedBy && (
              <p className="text-[11px] font-extrabold text-[#5EA87A]">
                Đầu bếp: {bowl.cookedBy} • Người bày bát: {bowl.servedBy || 'Chủ nhỏ'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.play('tap');
              if (onClearBowlToFridge) onClearBowlToFridge();
              onClose();
            }}
            className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FFF0DE] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Dọn bát cất lại vào Tủ Lạnh để đổi món khác</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* 1. PATE NHÀ LÀM (NỔI BẬT TRÊN CÙNG) */}
          <div className="space-y-2">
            <span className="text-xs font-black text-[#4A3525] block">
              Pate Nhà Làm Trong Tủ Lạnh
            </span>
            {fridge.cookedDishes.length === 0 ? (
              <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-dashed border-[#4A3525]/40 text-center space-y-2">
                <p className="text-[11px] font-bold text-[#7D6352]">
                  Tủ lạnh chưa có Pate nhà làm. Vào bếp nấu để nhận Co-op Combo x2 Xu nhé!
                </p>
                {onOpenCooking && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCooking();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FF9B71] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black inline-flex items-center gap-1"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Vào bếp nấu Pate ngay</span>
                  </button>
                )}
              </div>
            ) : (
              fridge.cookedDishes.map((dish) => {
                const recipe = getRecipeById(dish.recipeId);
                const stats = computeDishStats(recipe, dish.quality);
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => {
                      soundEngine.play('skewerPick');
                      onServeToBowl({
                        foodType: 'cooked',
                        dishId: dish.id,
                        itemId: dish.recipeId,
                        name: dish.name,
                        quality: dish.quality,
                        hungerGain: stats.hungerGain,
                        moodGain: stats.moodGain,
                        cookedBy: dish.cookedBy
                      });
                      onClose();
                    }}
                    className="tactile-btn w-full p-2.5 rounded-2xl bg-[#FFF5EB] border-2 border-[#4A3525] flex items-center gap-2.5 text-left"
                  >
                    <CookingIconSvg id={dish.recipeId} className="w-10 h-10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-[#4A3525] truncate">
                          {dish.name}
                        </span>
                        <StarRatingSvg quality={dish.quality} size={12} />
                      </div>
                      <p className="text-[10.5px] font-bold text-[#7D6352]">
                        {dish.cookedBy} nấu • +{stats.hungerGain} Đói, +{stats.moodGain} Vui • Còn x{dish.portions}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-[#FF9B71] border-[1.6px] border-[#4A3525] text-[11px] font-black text-[#4A3525] shrink-0">
                      Đổ bát
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* 2. ĐỒ ĂN NHANH */}
          <div className="space-y-2">
            <span className="text-xs font-black text-[#4A3525] block">
              Đồ Ăn Nhanh Tiện Lợi
            </span>
            {availableFastFoods.length === 0 ? (
              <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-dashed border-[#4A3525]/40 text-center space-y-2">
                <p className="text-[11px] font-bold text-[#7D6352]">
                  Hết đồ ăn nhanh trong tủ rồi!
                </p>
                {onOpenMarket && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMarket();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#88C9A1] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black inline-flex items-center gap-1"
                  >
                    <ShoppingBasket className="w-3.5 h-3.5" />
                    <span>Đi Chợ mua thêm</span>
                  </button>
                )}
              </div>
            ) : (
              availableFastFoods.map((ff) => {
                const count = fridge.fastFood[ff.id] || 0;
                return (
                  <button
                    key={ff.id}
                    type="button"
                    onClick={() => {
                      soundEngine.play('skewerPick');
                      onServeToBowl({
                        foodType: 'fastFood',
                        itemId: ff.id,
                        name: ff.name,
                        quality: 2,
                        hungerGain: ff.hungerGain,
                        moodGain: ff.moodGain,
                        cookedBy: null
                      });
                      onClose();
                    }}
                    className="tactile-btn w-full p-2.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] flex items-center gap-2.5 text-left"
                  >
                    <CookingIconSvg id={ff.id} className="w-10 h-10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-black text-[#4A3525] block truncate">
                        {ff.name}
                      </span>
                      <p className="text-[10.5px] font-bold text-[#7D6352]">
                        +{ff.hungerGain} Đói, +{ff.moodGain} Vui • Còn x{count}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[11px] font-black text-[#4A3525] shrink-0">
                      Đổ bát
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
