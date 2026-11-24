import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Flame, ShoppingBasket, X, Sparkles, Check } from 'lucide-react';
import {
  PATE_RECIPES,
  getIngredientById,
  normalizeFridge,
  computeDishStats,
  CookingIconSvg,
  StarRatingSvg
} from '../../data/cookingData';
import { soundEngine } from '../../services/soundEngine';

const INK = '#4A3525';
const CHOP_TARGET = 12;
const SIMMER_DURATION_SEC = 8.0;

export default function CookingGameModal({
  isOpen,
  onClose,
  roomData,
  playerName = 'Bạn',
  onFinishCooking,
  onOpenMarket
}) {
  // 'select' | 'chop' | 'simmer' | 'result'
  const [phase, setPhase] = useState('select');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Phase 1: Băm nhỏ nguyên liệu
  const [chopCount, setChopCount] = useState(0);
  const [chopTimeLeft, setChopTimeLeft] = useState(6.0);
  const [knifeBump, setKnifeBump] = useState(false);
  const chopScoreRef = useRef(0);

  // Phase 2: Đun sôi & Canh lửa (Heat Gauge)
  const [heat, setHeat] = useState(48); // 0..100, vùng xanh lá: 38..68
  const [simmerTimeLeft, setSimmerTimeLeft] = useState(SIMMER_DURATION_SEC);
  const [flavorMeter, setFlavorMeter] = useState(0); // 0..100
  const holdingHeatRef = useRef(false);
  const heatValRef = useRef(48);
  const flavorRef = useRef(0);
  const simmerStartRef = useRef(0);

  // Phase 3: Kết quả
  const [resultData, setResultData] = useState(null);

  const fridge = normalizeFridge(roomData?.fridge);

  useEffect(() => {
    if (isOpen) {
      setPhase('select');
      setSelectedRecipe(null);
      setChopCount(0);
      setChopTimeLeft(6.0);
      setHeat(48);
      setFlavorMeter(0);
      setResultData(null);
      holdingHeatRef.current = false;
    }
  }, [isOpen]);

  const hasEnoughIngredients = (recipe) =>
    Object.entries(recipe.ingredients).every(
      ([ingId, req]) => (fridge.ingredients[ingId] || 0) >= req
    );

  const startRecipe = (recipe) => {
    if (!hasEnoughIngredients(recipe)) {
      soundEngine.play('error');
      return;
    }
    soundEngine.play('tap');
    setSelectedRecipe(recipe);
    setChopCount(0);
    setChopTimeLeft(6.0);
    chopScoreRef.current = 0;
    setPhase('chop');
  };

  // Timer cho Pha 1 (Băm nguyên liệu - 6 giây)
  useEffect(() => {
    if (!isOpen || phase !== 'chop') return;
    const start = performance.now();
    const timer = setInterval(() => {
      const left = Math.max(0, 6.0 - (performance.now() - start) / 1000);
      setChopTimeLeft(left);
      if (left <= 0) {
        clearInterval(timer);
        // Chuyển sang Pha 2
        beginSimmerPhase();
      }
    }, 80);
    return () => clearInterval(timer);
  }, [isOpen, phase]);

  const beginSimmerPhase = () => {
    heatValRef.current = 46;
    flavorRef.current = 0;
    holdingHeatRef.current = false;
    simmerStartRef.current = performance.now();
    setHeat(46);
    setFlavorMeter(0);
    setSimmerTimeLeft(SIMMER_DURATION_SEC);
    setPhase('simmer');
  };

  const handleChopTap = () => {
    if (phase !== 'chop') return;
    soundEngine.play('caroP1');
    setKnifeBump(true);
    setTimeout(() => setKnifeBump(false), 90);
    setChopCount((prev) => {
      const next = prev + 1;
      chopScoreRef.current = Math.min(100, Math.round((next / CHOP_TARGET) * 100));
      if (next >= CHOP_TARGET) {
        setTimeout(() => beginSimmerPhase(), 180);
      }
      return next;
    });
  };

  // Vòng lặp 60fps cho Pha 2 (Đun sôi & Canh lửa)
  useEffect(() => {
    if (!isOpen || phase !== 'simmer') return;
    let rafId = 0;
    let lastTs = performance.now();
    let soundCooldown = 0;

    const loop = (now) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;

      const elapsed = (now - simmerStartRef.current) / 1000;
      const left = Math.max(0, SIMMER_DURATION_SEC - elapsed);

      // Giữ lửa thì nhiệt tăng, thả thì nhiệt giảm nhẹ + có dao động sôi tự nhiên
      const drift = Math.sin(now / 360) * 10;
      const rate = holdingHeatRef.current ? 46 : -34;
      heatValRef.current = Math.max(5, Math.min(98, heatValRef.current + (rate + drift) * dt));

      const inSweetSpot = heatValRef.current >= 38 && heatValRef.current <= 68;
      if (inSweetSpot) {
        flavorRef.current = Math.min(100, flavorRef.current + 21 * dt);
        soundCooldown -= dt;
        if (soundCooldown <= 0) {
          soundEngine.play('skewerPick', { vol: 0.4 });
          soundCooldown = 0.7;
        }
      } else {
        flavorRef.current = Math.max(0, flavorRef.current - 5 * dt);
      }

      setHeat(Math.round(heatValRef.current));
      setFlavorMeter(Math.round(flavorRef.current));
      setSimmerTimeLeft(left);

      if (left <= 0 || flavorRef.current >= 100) {
        finishCookingFlow(selectedRecipe, chopScoreRef.current, flavorRef.current);
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, phase, selectedRecipe]);

  const handleStirPot = () => {
    if (phase !== 'simmer') return;
    // Khuấy nồi giúp hạ nhiệt nhanh khi quá nóng
    heatValRef.current = Math.max(25, heatValRef.current - 12);
    setHeat(Math.round(heatValRef.current));
    soundEngine.play('teaSteam');
  };

  const finishCookingFlow = (recipe, chopPct, flavorPct) => {
    if (!recipe) return;
    const totalScore = Math.round(chopPct * 0.4 + flavorPct * 0.6);
    const quality = totalScore >= 78 ? 3 : totalScore >= 48 ? 2 : 1;
    const bonusCoins = quality === 3 ? 10 : quality === 2 ? 5 : 0;
    const stats = computeDishStats(recipe, quality);

    if (quality >= 2) soundEngine.play('trayComplete');
    else soundEngine.play('catchBad');

    const res = {
      recipe,
      quality,
      bonusCoins,
      stats,
      label:
        quality === 3
          ? 'Pate Thượng Hạng!'
          : quality === 2
          ? 'Pate Thơm Ngon!'
          : 'Hơi Khét Tí Xíu!'
    };
    setResultData(res);
    setPhase('result');

    if (onFinishCooking) {
      onFinishCooking({
        recipe,
        quality,
        bonusCoins,
        cookedBy: playerName
      });
    }
  };

  if (!isOpen) return null;

  const ingIds = selectedRecipe ? Object.keys(selectedRecipe.ingredients) : [];
  const inSweetSpot = heat >= 38 && heat <= 68;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#4A3525]/55 backdrop-blur-sm p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-[400px] max-h-[88dvh] bg-[#FFF8F0] rounded-[28px] border-[2.6px] border-[#4A3525] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[#FFE082]/70 border-b-2 border-[#4A3525] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF9B71] border-[1.8px] border-[#4A3525] flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-[#4A3525]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#4A3525] leading-tight">
                Góc Nấu Pate Cho Bé
              </h2>
              <p className="text-[10.5px] font-bold text-[#7D6352]">
                {phase === 'select'
                  ? 'Chọn 1 công thức từ Tủ Lạnh'
                  : phase === 'chop'
                  ? 'Pha 1/2 • Băm nhỏ nguyên liệu'
                  : phase === 'simmer'
                  ? 'Pha 2/2 • Canh lửa vùng xanh lá'
                  : 'Hoàn tất đóng hũ cất Tủ Lạnh!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung theo từng pha */}
        <div className="p-4 overflow-y-auto custom-scroll flex-1">
          {/* PHA 0: CHỌN CÔNG THỨC */}
          {phase === 'select' && (
            <div className="space-y-2.5">
              {PATE_RECIPES.map((recipe) => {
                const ready = hasEnoughIngredients(recipe);
                return (
                  <div
                    key={recipe.id}
                    className={`p-3 rounded-2xl border-2 border-[#4A3525] space-y-2 ${
                      ready ? 'bg-[#FFFDF9]' : 'bg-[#FFFDF9]/65'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-[#FFF3E2] border-[1.6px] border-[#4A3525] flex items-center justify-center shrink-0">
                        <CookingIconSvg id={recipe.id} className="w-9 h-9" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-[#4A3525] truncate">
                            {recipe.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] text-[9.5px] font-black text-[#4A3525] shrink-0">
                            Ra {recipe.portions} phần
                          </span>
                        </div>
                        <p className="text-[10.5px] font-bold text-[#7D6352] mt-0.5">
                          3 sao: +{recipe.baseHunger} Đói • +{recipe.baseMood} Vui / phần
                        </p>
                      </div>
                    </div>

                    {/* Nguyên liệu yêu cầu */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#4A3525]/10">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(recipe.ingredients).map(([ingId, req]) => {
                          const ing = getIngredientById(ingId);
                          const have = fridge.ingredients[ingId] || 0;
                          const ok = have >= req;
                          return (
                            <span
                              key={ingId}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                ok
                                  ? 'bg-[#E6F7EC] border-[#5EA87A] text-[#4A3525]'
                                  : 'bg-[#FFE8EC] border-[#E85D75] text-[#C93B54]'
                              }`}
                            >
                              <CookingIconSvg id={ingId} className="w-4 h-4" />
                              <span>
                                {ing?.name.split(' ')[0]} {have}/{req}
                              </span>
                            </span>
                          );
                        })}
                      </div>

                      {ready ? (
                        <button
                          type="button"
                          onClick={() => startRecipe(recipe)}
                          className="tactile-btn px-3 py-1.5 rounded-xl bg-[#FF9B71] border-[1.8px] border-[#4A3525] text-[#4A3525] text-[11px] font-black shrink-0"
                        >
                          Bắt đầu nấu!
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenMarket) onOpenMarket();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-[#88C9A1] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[10.5px] font-black flex items-center gap-1 shrink-0 active:scale-95"
                        >
                          <ShoppingBasket className="w-3 h-3" />
                          <span>Đi Chợ</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PHA 1: BĂM NHỎ NGUYÊN LIỆU */}
          {phase === 'chop' && selectedRecipe && (
            <div className="space-y-4 text-center py-2">
              <div className="flex items-center justify-between text-xs font-black text-[#4A3525]">
                <span>Tiến độ thái: {Math.min(100, Math.round((chopCount / CHOP_TARGET) * 100))}%</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] tabular-nums">
                  {chopTimeLeft.toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#4A3525]/15 border-[1.6px] border-[#4A3525] overflow-hidden">
                <div
                  className="h-full bg-[#88C9A1] transition-all duration-100"
                  style={{ width: `${Math.min(100, (chopCount / CHOP_TARGET) * 100)}%` }}
                />
              </div>

              {/* Thớt gỗ tương tác chạm nhanh */}
              <button
                type="button"
                onPointerDown={handleChopTap}
                className="relative w-full py-8 rounded-3xl bg-[#E6BD8E] border-[3px] border-[#4A3525] shadow-inner flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer select-none"
              >
                <div className="flex items-center justify-center gap-3">
                  {ingIds.map((id) => (
                    <motion.div
                      key={id}
                      animate={knifeBump ? { scale: [1, 0.86, 1.08, 1], y: [0, 3, -4, 0] } : {}}
                      transition={{ duration: 0.1 }}
                    >
                      <CookingIconSvg id={id} className="w-16 h-16" />
                    </motion.div>
                  ))}
                </div>

                {/* Con dao bếp mini nhấp nháy theo nhịp chạm */}
                <motion.div
                  animate={knifeBump ? { rotate: -26, y: 12 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.08 }}
                  className="absolute top-3 right-5 pointer-events-none"
                >
                  <svg viewBox="0 0 64 32" className="w-16 h-8">
                    <path d="M8 22 H40 L46 10 H14 Q6 10 8 22 Z" fill="#E6ECF0" stroke={INK} strokeWidth="2.5" />
                    <rect x="42" y="10" width="18" height="8" rx="4" fill="#C98A54" stroke={INK} strokeWidth="2.4" />
                  </svg>
                </motion.div>

                <span className="mt-2 px-3 py-1 rounded-full bg-[#FFFDF9]/90 border border-[#4A3525] text-xs font-black text-[#4A3525]">
                  CHẠM LIÊN TỤC LÊN THỚT ĐỂ THÁI NHỎ! ({chopCount}/{CHOP_TARGET})
                </span>
              </button>
            </div>
          )}

          {/* PHA 2: ĐUN SÔI & CANH LỬA */}
          {phase === 'simmer' && selectedRecipe && (
            <div className="space-y-3.5 text-center py-1">
              <div className="flex items-center justify-between text-xs font-black text-[#4A3525]">
                <span>Độ Ngon: {flavorMeter}%</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] tabular-nums">
                  {simmerTimeLeft.toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#4A3525]/15 border-[1.6px] border-[#4A3525] overflow-hidden">
                <div
                  className="h-full bg-[#FF9B71] transition-all duration-75"
                  style={{ width: `${flavorMeter}%` }}
                />
              </div>

              {/* Chiếc nồi nhìn từ trên xuống (chạm để khuấy giảm nhiệt) */}
              <button
                type="button"
                onClick={handleStirPot}
                className="relative mx-auto w-40 h-40 rounded-full bg-[#FFFDF9] border-[4px] border-[#4A3525] shadow-md flex items-center justify-center active:scale-95 transition-transform"
                title="Chạm nồi để đảo đều hạ nhiệt"
              >
                <div
                  className="w-32 h-32 rounded-full border-2 border-[#4A3525] flex flex-col items-center justify-center transition-colors"
                  style={{
                    backgroundColor: heat > 75 ? '#FF9B71' : selectedRecipe.color
                  }}
                >
                  <Sparkles
                    className={`w-6 h-6 text-[#FFFDF9] ${inSweetSpot ? 'animate-spin' : ''}`}
                  />
                  <span className="text-[11px] font-black text-[#4A3525] mt-1 bg-[#FFFDF9]/80 px-2 py-0.5 rounded-full">
                    {heat > 72 ? 'Quá nóng! Khuấy!' : heat < 36 ? 'Lửa yếu!' : 'Vừa lửa ngon!'}
                  </span>
                </div>
              </button>

              {/* Thanh nhiệt độ (Heat Gauge) với vùng xanh lá 38..68% */}
              <div className="space-y-1">
                <div className="relative w-full h-6 rounded-full bg-[#FFF0DE] border-2 border-[#4A3525] overflow-hidden">
                  {/* Vùng xanh lá Vừa Lửa */}
                  <div
                    style={{ left: '38%', width: '30%' }}
                    className="absolute inset-y-0 bg-[#88C9A1]/80 border-x-2 border-[#4A3525]/50"
                  />
                  {/* Kim nhiệt độ */}
                  <div
                    style={{ left: `calc(${heat}% - 6px)` }}
                    className="absolute top-0.5 bottom-0.5 w-3 rounded-full bg-[#4A3525] transition-all duration-75"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-extrabold text-[#7D6352] px-1">
                  <span>Nguội</span>
                  <span className="text-[#4F9A6D]">Vùng Vừa Lửa</span>
                  <span className="text-[#E85D75]">Khét!</span>
                </div>
              </div>

              {/* Nút Giữ Bật Lửa / Thả Giảm Lửa */}
              <button
                type="button"
                onPointerDown={() => {
                  holdingHeatRef.current = true;
                }}
                onPointerUp={() => {
                  holdingHeatRef.current = false;
                }}
                onPointerLeave={() => {
                  holdingHeatRef.current = false;
                }}
                onPointerCancel={() => {
                  holdingHeatRef.current = false;
                }}
                className="tactile-btn w-full py-3.5 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-sm font-black flex items-center justify-center gap-2 select-none touch-none"
              >
                <Flame className="w-5 h-5 fill-[#FFE082]" />
                <span>GIỮ ĐỂ TĂNG LỬA • THẢ ĐỂ HẠ LỬA</span>
              </button>
            </div>
          )}

          {/* PHA 3: KẾT QUẢ ĐÓNG HŨ & CHẤM SAO */}
          {phase === 'result' && resultData && (
            <div className="py-3 text-center space-y-3.5">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-[#FFF3D6] border-2 border-[#4A3525] flex items-center justify-center shadow-md">
                <CookingIconSvg id={resultData.recipe.id} className="w-16 h-16" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-center">
                  <StarRatingSvg quality={resultData.quality} size={24} />
                </div>
                <h3 className="text-base font-black text-[#4A3525]">{resultData.label}</h3>
                <p className="text-xs font-extrabold text-[#7D6352]">
                  Đã đóng gói <strong>{resultData.recipe.portions} phần</strong>{' '}
                  {resultData.recipe.name} cất vào Tủ Lạnh!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] text-xs font-extrabold text-[#4A3525] space-y-1">
                <div>
                  Mỗi phần hồi: <strong className="text-[#E87A4D]">+{resultData.stats.hungerGain} Đói</strong> •{' '}
                  <strong className="text-[#E85D75]">+{resultData.stats.moodGain} Vui</strong>
                </div>
                {resultData.bonusCoins > 0 && (
                  <div className="text-[#5EA87A]">
                    Thưởng tay nghề đầu bếp: +{resultData.bonusCoins} Xu chung!
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="tactile-btn w-full py-2.5 rounded-2xl bg-[#88C9A1] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Tuyệt vời! Ra chạm Bát đổ cho bé ăn</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
