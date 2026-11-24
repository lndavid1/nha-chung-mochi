import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  HelpCircle,
  Trophy,
  Flame,
  RotateCcw,
  Home,
  ArrowRight,
  Snowflake,
  Lock,
  Clock,
  X
} from 'lucide-react';
import { SkewerSvg, MysteryFoilSvg, BoosterIconSvg } from './grillAssets';
import {
  generateGrillLevel,
  pickNextOrderType,
  countRemainingByType
} from './grillLevelGen';

function cloneState(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default function GrillSortGame({
  initialLevel = 1,
  petName = 'Mochi',
  playerName = 'Bạn',
  partnerName = 'Người kia',
  partnerMaxLevel = 0,
  dailyRemainingCap = 150,
  onLevelComplete,
  onExit
}) {
  const [state, setState] = useState(() => {
    const lvl = generateGrillLevel(initialLevel);
    return {
      ...lvl,
      score: 0,
      combo: 0,
      usedAnyBooster: false,
      status: 'playing', // 'playing' | 'won' | 'lost'
      history: [], // cho Booster Hoàn tác (Undo)
      toast: null,
      burnWarning: false,
      earnedCoins: 0,
      passedPartnerLevel: false
    };
  });

  const [showHelp, setShowHelp] = useState(false);

  const startLevel = useCallback((lvlNum) => {
    const lvl = generateGrillLevel(lvlNum);
    setState({
      ...lvl,
      score: 0,
      combo: 0,
      usedAnyBooster: false,
      status: 'playing',
      history: [],
      toast: null,
      burnWarning: false,
      earnedCoins: 0,
      passedPartnerLevel: false
    });
  }, []);

  // Tự ẩn toast ngắn sau 2.2s
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => {
      setState((prev) => ({ ...prev, toast: null }));
    }, 2200);
    return () => clearTimeout(t);
  }, [state.toast]);

  // Gom các xiên giống nhau đứng cạnh nhau trên 7 Đĩa Chờ
  const groupHoldingPlates = (plates) => {
    const orderOfTypes = [];
    plates.forEach((p) => {
      if (!orderOfTypes.includes(p.type)) orderOfTypes.push(p.type);
    });
    const grouped = [];
    orderOfTypes.forEach((t) => {
      plates.forEach((p) => {
        if (p.type === t) grouped.push(p);
      });
    });
    return grouped;
  };

  /**
   * Chuỗi xử lý tự động sau mọi thay đổi trạng thái (Resolution Loop):
   * 1. Xử lý các Khay Đơn Hàng đã đủ 3/3 -> trừ xích, nứt băng, mở nắp lidTarget, sinh đơn mới
   * 2. Auto-Fulfill: Hút các xiên trên 7 Đĩa Chờ khớp với Khay Đơn Hàng đang mở
   * 3. Auto-Match 3 trên 7 Đĩa Chờ (+15đ, giải phóng 3 đĩa)
   * 4. Tự nâng lớp Khay Xem Trước lên bếp trống & tự mở xiên ? nếu bếp chỉ còn toàn xiên ?
   * 5. Kiểm tra Thắng (hết sạch xiên) hoặc Thua (7 Đĩa Chờ đầy kín không giải phóng được)
   */
  const resolveBoardLoop = (draft) => {
    let changed = true;
    let safety = 0;

    while (changed && safety < 25) {
      changed = false;
      safety += 1;

      // A. Nâng lớp từ Khay Xem Trước lên bếp nếu bếp trống hoàn toàn & không bị khóa
      draft.grills.forEach((g) => {
        if (!g.active) return;
        const hasAnyTop = g.top.some((s) => s !== null);
        if (!hasAnyTop && g.queue.length > 0) {
          const nextLayer = g.queue.shift();
          g.top = [
            nextLayer[0] || null,
            nextLayer[1] || null,
            nextLayer[2] || null
          ];
          changed = true;
        }
        // Chống kẹt Giấy bạc ?: Nếu trên bếp đang mở chỉ còn toàn xiên ?, tự mở 1 xiên đầu tiên
        const isLocked = g.ice > 0 || g.chain > 0 || Boolean(g.lidTarget);
        if (!isLocked) {
          const present = g.top.filter((s) => s !== null);
          if (present.length > 0 && present.every((s) => s.mystery)) {
            present[0].mystery = false;
            changed = true;
          }
        }
      });

      // B. Xử lý Khay Đơn Hàng đủ 3/3
      for (let i = 0; i < draft.orders.length; i++) {
        const ord = draft.orders[i];
        if (ord && ord.filled >= 3) {
          const clearedType = ord.type;
          draft.completedOrders += 1;
          draft.combo += 1;
          draft.score += 30 + draft.combo * 5;

          // Giảm xích, làm nứt băng & mở nắp bếp có lidTarget khớp món vừa giao
          draft.grills.forEach((g) => {
            if (!g.active) return;
            if (g.chain > 0) g.chain = Math.max(0, g.chain - 1);
            if (g.ice > 0) g.ice = Math.max(0, g.ice - 1);
            if (g.lidTarget && g.lidTarget === clearedType) {
              g.lidTarget = null;
              draft.toast = 'Đã bật mở nắp bếp bí mật!';
            }
          });

          // Xóa khay cũ & sinh Khay Đơn Hàng mới nếu màn vẫn còn món
          draft.orders[i] = null;
          const nextType = pickNextOrderType(
            draft.grills,
            draft.holdingPlates,
            draft.orders
          );
          if (nextType) {
            draft.orders[i] = {
              id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              type: nextType,
              filled: 0
            };
          }
          changed = true;
        }
      }

      // C. Điền khay trống (nếu trước đó chưa đủ món lộ diện nhưng giờ đã mở thêm)
      for (let i = 0; i < draft.orders.length; i++) {
        if (!draft.orders[i]) {
          const nextType = pickNextOrderType(
            draft.grills,
            draft.holdingPlates,
            draft.orders
          );
          if (nextType) {
            draft.orders[i] = {
              id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              type: nextType,
              filled: 0
            };
            changed = true;
          }
        }
      }

      // D. Auto-Fulfill: Hút các xiên trên 7 Đĩa Chờ bay lên Khay Đơn Hàng khớp loại
      for (let pIdx = draft.holdingPlates.length - 1; pIdx >= 0; pIdx--) {
        const plateItem = draft.holdingPlates[pIdx];
        const matchingOrder = draft.orders.find(
          (o) => o && o.type === plateItem.type && o.filled < 3
        );
        if (matchingOrder) {
          matchingOrder.filled += 1;
          draft.holdingPlates.splice(pIdx, 1);
          draft.score += 10;
          changed = true;
        }
      }

      // E. Tự ghép 3 xiên giống hệt nhau trên 7 Đĩa Chờ (+15 điểm, giải phóng 3 đĩa)
      const plateCounts = {};
      draft.holdingPlates.forEach((p) => {
        plateCounts[p.type] = (plateCounts[p.type] || 0) + 1;
      });
      const tripleType = Object.keys(plateCounts).find((t) => plateCounts[t] >= 3);
      if (tripleType) {
        let removed = 0;
        draft.holdingPlates = draft.holdingPlates.filter((p) => {
          if (p.type === tripleType && removed < 3) {
            removed += 1;
            return false;
          }
          return true;
        });
        draft.score += 15;
        draft.toast = 'Nướng chín 3 xiên trên đĩa chờ! (+15đ)';
        changed = true;
      }

      draft.holdingPlates = groupHoldingPlates(draft.holdingPlates);
    }

    // Kiểm tra điều kiện THẮNG (không còn xiên nào trên bếp, hàng chờ, hay đĩa chờ)
    const remainingMap = countRemainingByType(draft.grills, draft.holdingPlates);
    const totalLeft = Object.values(remainingMap).reduce((a, b) => a + b, 0);

    if (totalLeft === 0 && draft.status === 'playing') {
      draft.status = 'won';
      const baseReward = 25 + (draft.usedAnyBooster ? 0 : 5);
      const cappedReward = Math.max(0, Math.min(baseReward, dailyRemainingCap));
      draft.earnedCoins = cappedReward;
      draft.passedPartnerLevel = Boolean(
        partnerMaxLevel > 0 && draft.level > partnerMaxLevel
      );

      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.55 }
        });
      } catch {
        // ignore
      }

      if (onLevelComplete) {
        onLevelComplete({
          level: draft.level,
          score: draft.score,
          ordersCleared: draft.completedOrders,
          rewardCoins: cappedReward,
          noBoosterBonus: !draft.usedAnyBooster,
          passedPartnerLevel: draft.passedPartnerLevel
        });
      }
    } else if (draft.holdingPlates.length >= 7 && draft.status === 'playing') {
      draft.status = 'lost';
    }

    return draft;
  };

  // Xử lý khi người chơi chạm vào 1 xiên trên bếp nướng
  const handleTapSkewer = (grillIdx, slotIdx) => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev;
      const grill = prev.grills[grillIdx];
      if (!grill || !grill.active) return prev;
      if (grill.ice > 0 || grill.chain > 0 || grill.lidTarget) return prev;

      const skewer = grill.top[slotIdx];
      if (!skewer || skewer.mystery) return prev;

      const draft = cloneState(prev);
      // Lưu snapshot để Hoàn tác (Undo)
      draft.history = [
        ...prev.history.slice(-4),
        {
          grills: cloneState(prev.grills),
          orders: cloneState(prev.orders),
          holdingPlates: cloneState(prev.holdingPlates),
          score: prev.score,
          completedOrders: prev.completedOrders
        }
      ];

      const targetGrill = draft.grills[grillIdx];
      const picked = targetGrill.top[slotIdx];
      targetGrill.top[slotIdx] = null;

      // Xé giấy bạc bí ẩn (?) trên cùng bếp khi nhặt 1 xiên khác
      targetGrill.top.forEach((other) => {
        if (other && other.mystery) {
          other.mystery = false;
        }
      });

      // Nếu nhặt xiên hẹn giờ trước khi về 0 -> hóa giải an toàn (+20 điểm)
      if (picked.timer !== null && picked.timer > 0) {
        draft.score += 20;
        draft.toast = 'Hóa giải xiên hẹn giờ kịp lúc! (+20đ)';
      }

      // Đếm ngược -1 cho mọi xiên hẹn giờ khác đang lộ diện trên mặt bếp
      let burnedAny = false;
      draft.grills.forEach((g) => {
        if (!g.active || g.ice > 0 || g.chain > 0 || g.lidTarget) return;
        g.top.forEach((s) => {
          if (s && s.timer !== null) {
            s.timer -= 1;
            if (s.timer <= 0) {
              s.timer = null;
              burnedAny = true;
            }
          }
        });
      });

      if (burnedAny) {
        draft.score = Math.max(0, draft.score - 15);
        draft.burnWarning = true;
        draft.toast = 'Ôi cháy mất xiên hẹn giờ! (-15 điểm)';
      } else {
        draft.burnWarning = false;
      }

      // Ưu tiên 1: Khớp Khay Đơn Hàng đang mở -> bay thẳng lên Khay Đơn Hàng
      const matchingOrder = draft.orders.find(
        (o) => o && o.type === picked.type && o.filled < 3
      );
      if (matchingOrder) {
        matchingOrder.filled += 1;
        draft.score += 10;
      } else {
        // Ưu tiên 2: Bay vào 7 Đĩa Chờ
        draft.holdingPlates.push({
          id: picked.id,
          type: picked.type
        });
      }

      // Nếu vừa làm trống hoàn toàn bếp -> làm nứt nhẹ băng ở bếp kế bên (cơ chế tan băng)
      const isNowEmpty = targetGrill.top.every((s) => s === null);
      if (isNowEmpty) {
        const neighbors = [grillIdx - 1, grillIdx + 1, grillIdx - 3, grillIdx + 3];
        neighbors.forEach((nIdx) => {
          if (draft.grills[nIdx]?.ice > 0) {
            draft.grills[nIdx].ice = Math.max(0, draft.grills[nIdx].ice - 1);
          }
        });
      }

      return resolveBoardLoop(draft);
    });
  };

  // =========================================================
  // 4 NÚT TRỢ GIÚP (BOOSTERS)
  // =========================================================

  // 1. Xẻng Xúc (spatula): Hoàn thành ngay Khay Đơn Hàng đầu tiên bằng cách hút đủ xiên từ Đĩa Chờ/Bếp
  const useSpatulaBooster = () => {
    setState((prev) => {
      if (prev.status !== 'playing' || prev.boosters.spatula <= 0) return prev;
      const targetOrderIdx = prev.orders.findIndex((o) => o && o.filled < 3);
      if (targetOrderIdx === -1) return prev;

      const draft = cloneState(prev);
      draft.boosters.spatula -= 1;
      draft.usedAnyBooster = true;

      const ord = draft.orders[targetOrderIdx];
      let needed = 3 - ord.filled;

      // Hút từ 7 Đĩa Chờ trước
      for (let i = draft.holdingPlates.length - 1; i >= 0 && needed > 0; i--) {
        if (draft.holdingPlates[i].type === ord.type) {
          draft.holdingPlates.splice(i, 1);
          ord.filled += 1;
          needed -= 1;
        }
      }

      // Hút từ mặt bếp
      for (let gIdx = 0; gIdx < draft.grills.length && needed > 0; gIdx++) {
        const g = draft.grills[gIdx];
        if (!g.active) continue;
        for (let s = 0; s < 3 && needed > 0; s++) {
          if (g.top[s] && g.top[s].type === ord.type) {
            g.top[s] = null;
            ord.filled += 1;
            needed -= 1;
          }
        }
      }

      // Hút từ lớp chờ trong Khay Xem Trước nếu vẫn còn thiếu
      for (let gIdx = 0; gIdx < draft.grills.length && needed > 0; gIdx++) {
        const g = draft.grills[gIdx];
        if (!g.active) continue;
        for (let q = 0; q < g.queue.length && needed > 0; q++) {
          for (let k = g.queue[q].length - 1; k >= 0 && needed > 0; k--) {
            if (g.queue[q][k].type === ord.type) {
              g.queue[q].splice(k, 1);
              ord.filled += 1;
              needed -= 1;
            }
          }
        }
        g.queue = g.queue.filter((layer) => layer.length > 0);
      }

      draft.toast = 'Xẻng Xúc giao trọn 1 đơn hàng tức thì!';
      return resolveBoardLoop(draft);
    });
  };

  // 2. Đảo Xiên (shuffle): Xáo trộn các xiên trên mặt bếp mở & ưu tiên đẩy 2-3 xiên khớp Khay Đơn Hàng lên mặt trên
  const useShuffleBooster = () => {
    setState((prev) => {
      if (prev.status !== 'playing' || prev.boosters.shuffle <= 0) return prev;
      const draft = cloneState(prev);
      draft.boosters.shuffle -= 1;
      draft.usedAnyBooster = true;

      const wantedTypes = draft.orders.filter(Boolean).map((o) => o.type);
      const openSlots = [];
      const allOpenSkewers = [];

      draft.grills.forEach((g, gIdx) => {
        if (!g.active || g.ice > 0 || g.chain > 0 || g.lidTarget) return;
        g.top.forEach((s, sIdx) => {
          if (s) {
            openSlots.push({ gIdx, sIdx });
            allOpenSkewers.push(s);
          }
        });
      });

      // Lấy thêm tối đa 3 xiên khớp đơn hàng từ các lớp chờ đưa lên mặt trên
      let swappedFromQueue = 0;
      draft.grills.forEach((g) => {
        if (!g.active || swappedFromQueue >= 3) return;
        g.queue.forEach((layer) => {
          for (let k = 0; k < layer.length && swappedFromQueue < 3; k++) {
            if (wantedTypes.includes(layer[k].type)) {
              const nonWantedIdx = allOpenSkewers.findIndex(
                (sk) => !wantedTypes.includes(sk.type)
              );
              if (nonWantedIdx !== -1) {
                const temp = allOpenSkewers[nonWantedIdx];
                allOpenSkewers[nonWantedIdx] = layer[k];
                layer[k] = temp;
                swappedFromQueue += 1;
              }
            }
          }
        });
      });

      // Xáo trộn & gắn lại vào các ô mở
      for (let i = allOpenSkewers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOpenSkewers[i], allOpenSkewers[j]] = [allOpenSkewers[j], allOpenSkewers[i]];
      }

      openSlots.forEach((pos, idx) => {
        const sk = allOpenSkewers[idx];
        if (sk) {
          sk.mystery = false;
          draft.grills[pos.gIdx].top[pos.sIdx] = sk;
        }
      });

      draft.toast = 'Đã đảo xiên và đẩy món cần lên mặt bếp!';
      return resolveBoardLoop(draft);
    });
  };

  // 3. Hộp Đóng Gói (pack): Dọn sạch tối đa 3 xiên trên 7 Đĩa Chờ trả lại vào hàng chờ của bếp
  const usePackBooster = () => {
    setState((prev) => {
      if (
        prev.status !== 'playing' ||
        prev.boosters.pack <= 0 ||
        prev.holdingPlates.length === 0
      ) {
        return prev;
      }
      const draft = cloneState(prev);
      draft.boosters.pack -= 1;
      draft.usedAnyBooster = true;

      const toPack = draft.holdingPlates.splice(0, 3);
      const activeGrills = draft.grills.filter((g) => g.active);
      if (activeGrills.length > 0) {
        const target = activeGrills[Math.floor(Math.random() * activeGrills.length)];
        target.queue.push(
          toPack.map((p) => ({
            id: p.id,
            type: p.type,
            mystery: false,
            timer: null
          }))
        );
      }

      draft.toast = `Đã gói ${toPack.length} xiên giải phóng Đĩa Chờ!`;
      return resolveBoardLoop(draft);
    });
  };

  // 4. Hoàn Tác (undo): Đưa xiên vừa bấm quay lại đúng ô bếp trước đó
  const useUndoBooster = () => {
    setState((prev) => {
      if (
        prev.status !== 'playing' ||
        prev.boosters.undo <= 0 ||
        prev.history.length === 0
      ) {
        return prev;
      }
      const lastSnap = prev.history[prev.history.length - 1];
      return {
        ...prev,
        grills: lastSnap.grills,
        orders: lastSnap.orders,
        holdingPlates: lastSnap.holdingPlates,
        score: lastSnap.score,
        completedOrders: lastSnap.completedOrders,
        history: prev.history.slice(0, -1),
        boosters: {
          ...prev.boosters,
          undo: prev.boosters.undo - 1
        },
        usedAnyBooster: true,
        toast: 'Đã hoàn tác lượt vừa bấm!'
      };
    });
  };

  const ordersRemaining = Math.max(0, state.totalOrders - state.completedOrders);

  return (
    <div
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 6px), 6px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 6px), 6px)'
      }}
      className="fixed inset-0 z-[80] max-w-[430px] mx-auto h-[100dvh] bg-[#FFF8F0] flex flex-col justify-between px-2.5 overflow-hidden select-none"
    >
      {/* ================================================================= */}
      {/* HEADER GỌN TRÊN CÙNG                                              */}
      {/* ================================================================= */}
      <header className="flex items-center justify-between gap-1.5 py-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExit}
            className="w-8 h-8 rounded-full bg-[#FFFDF9] border-[2px] border-[#4A3525] text-[#4A3525] flex items-center justify-center active:scale-90"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="px-2.5 py-1 rounded-full bg-[#FFE082] border-[2px] border-[#4A3525] text-xs font-black text-[#4A3525] tabular-nums">
            Màn {state.level}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] text-[11px] font-black text-[#4A3525] tabular-nums flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#E87A4D]" />
            <span>Còn {ordersRemaining} đơn</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] text-[11px] font-black text-[#4A3525] tabular-nums flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-[#E87A4D]" />
            <span>{state.score}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-full bg-[#FFFDF9] border-[2px] border-[#4A3525] text-[#4A3525] flex items-center justify-center active:scale-90"
            title="Hướng dẫn nhanh"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Thông báo nổi ngắn */}
      <AnimatePresence>
        {state.toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`absolute top-12 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1 rounded-full border-2 border-[#4A3525] text-[11px] font-black shadow-md whitespace-nowrap ${
              state.burnWarning
                ? 'bg-[#FFB7C5] text-[#4A3525]'
                : 'bg-[#4A3525] text-[#FFF8F0]'
            }`}
          >
            {state.toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* TẦNG 1: 4 KHAY ĐƠN HÀNG (ORDER TRAYS)                             */}
      {/* ================================================================= */}
      <section className="grid grid-cols-4 gap-1.5 my-1 shrink-0">
        {state.orders.map((ord, idx) => (
          <div
            key={ord ? ord.id : `empty_ord_${idx}`}
            className="h-14 rounded-2xl bg-[#FFFDF9] border-[2px] border-[#4A3525] shadow-sm px-1 py-1 flex flex-col items-center justify-center"
          >
            {ord ? (
              <div className="grid grid-cols-3 gap-0.5 w-full h-full items-center">
                {[0, 1, 2].map((slot) => {
                  const isFilled = slot < ord.filled;
                  return (
                    <div
                      key={slot}
                      className={`w-full h-10 flex items-center justify-center transition-all ${
                        isFilled ? 'opacity-100 scale-105' : 'opacity-25 scale-90'
                      }`}
                    >
                      <SkewerSvg type={ord.type} className="w-full h-full" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-[10px] font-black text-[#7D6352]/60">Xong!</span>
            )}
          </div>
        ))}
      </section>

      {/* ================================================================= */}
      {/* TẦNG 2: QUẦY GỖ CHỨA 7 ĐĨA CHỜ (HOLDING PLATES)                  */}
      {/* ================================================================= */}
      <section
        className={`rounded-2xl bg-[#D8A878] border-[2.2px] border-[#4A3525] px-1.5 py-1.5 shadow-inner mb-1 shrink-0 ${
          state.holdingPlates.length >= 6 ? 'ring-2 ring-[#E85D75]' : ''
        }`}
      >
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const item = state.holdingPlates[i];
            return (
              <div
                key={i}
                className="aspect-square rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] shadow-inner flex items-center justify-center p-0.5 overflow-hidden"
              >
                {item ? (
                  <motion.div
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full"
                  >
                    <SkewerSvg type={item.type} className="w-full h-full" />
                  </motion.div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-[#F2E2CE]/70" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* TẦNG 3: LƯỚI 12 BẾP NƯỚNG (3 CỘT x 4 HÀNG) + KHAY XEM TRƯỚC      */}
      {/* ================================================================= */}
      <main className="flex-1 min-h-0 grid grid-cols-3 grid-rows-4 gap-1.5 py-0.5">
        {state.grills.map((grill, gIdx) => {
          if (!grill.active) {
            return (
              <div
                key={grill.id}
                className="rounded-2xl bg-[#F2E5D5]/55 border-[1.6px] border-dashed border-[#4A3525]/25 flex items-center justify-center"
              >
                <span className="text-[9.5px] font-extrabold text-[#7D6352]/50">
                  Nghỉ bếp
                </span>
              </div>
            );
          }

          const isIce = grill.ice > 0;
          const isChain = grill.chain > 0;
          const isLid = Boolean(grill.lidTarget);
          const isLocked = isIce || isChain || isLid;
          const nextQueueLayer = grill.queue[0] || [];

          return (
            <div
              key={grill.id}
              className="flex flex-col justify-between gap-0.5 min-h-0"
            >
              {/* Vỉ nướng than hồng (3 vị trí đặt xiên) */}
              <div className="relative flex-1 min-h-0 rounded-2xl bg-[#6B4E3D] border-[2px] border-[#4A3525] p-1 flex items-center justify-around overflow-hidden shadow-sm">
                {/* Thanh vỉ sắt ngang & ánh than hồng */}
                <div className="pointer-events-none absolute inset-x-1 top-1/3 h-[1.5px] bg-[#4A3525]/60" />
                <div className="pointer-events-none absolute inset-x-1 bottom-1/3 h-[1.5px] bg-[#4A3525]/60" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-35"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 60%, #FF7A45 0%, transparent 70%)'
                  }}
                />

                {/* 3 Slot xiên trên vỉ */}
                {[0, 1, 2].map((slotIdx) => {
                  const sk = grill.top[slotIdx];
                  return (
                    <button
                      key={slotIdx}
                      type="button"
                      disabled={!sk || sk.mystery || isLocked}
                      onClick={() => handleTapSkewer(gIdx, slotIdx)}
                      className={`relative z-10 w-1/3 h-full flex items-center justify-center transition-transform ${
                        sk && !sk.mystery && !isLocked
                          ? 'active:scale-90 cursor-pointer'
                          : 'cursor-default'
                      }`}
                    >
                      {sk && (
                        <motion.div
                          key={sk.id}
                          initial={{ scale: 0.65, y: 6 }}
                          animate={{ scale: 1, y: 0 }}
                          className="relative w-full h-full max-h-[58px] flex items-center justify-center"
                        >
                          {sk.mystery ? (
                            <MysteryFoilSvg className="w-full h-full" />
                          ) : (
                            <SkewerSvg type={sk.type} className="w-full h-full" />
                          )}

                          {/* Huy hiệu đồng hồ bom hẹn giờ */}
                          {sk.timer !== null && !sk.mystery && (
                            <span
                              className={`absolute -top-0.5 -right-0.5 px-1 rounded-full border border-[#4A3525] text-[8.5px] font-black tabular-nums flex items-center gap-0.5 ${
                                sk.timer <= 3
                                  ? 'bg-[#FF5A5F] text-white animate-pulse'
                                  : 'bg-[#FFE082] text-[#4A3525]'
                              }`}
                            >
                              <Clock className="w-2 h-2" />
                              {sk.timer}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </button>
                  );
                })}

                {/* CHƯỚNG NGẠI VẬT 1: Bếp Đóng Băng (ice) */}
                {isIce && (
                  <div className="absolute inset-0 z-20 bg-[#AEE2FF]/75 backdrop-blur-[1px] flex flex-col items-center justify-center border-2 border-[#FFFDF9]/80 rounded-xl">
                    <Snowflake className="w-5 h-5 text-[#2E6F95]" />
                    <span className="px-1.5 rounded-full bg-[#FFFDF9] border border-[#4A3525] text-[9px] font-black text-[#4A3525] tabular-nums">
                      Băng x{grill.ice}
                    </span>
                  </div>
                )}

                {/* CHƯỚNG NGẠI VẬT 2: Bếp Xích Khóa Số (chain) */}
                {!isIce && isChain && (
                  <div className="absolute inset-0 z-20 bg-[#4A3525]/45 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-dashed border-[#D9D6D0]/70 rounded-xl pointer-events-none" />
                    <div className="px-2 py-0.5 rounded-full bg-[#FFE082] border-2 border-[#4A3525] text-[10px] font-black text-[#4A3525] flex items-center gap-1 shadow tabular-nums">
                      <Lock className="w-3 h-3" />
                      <span>{grill.chain}</span>
                    </div>
                  </div>
                )}

                {/* CHƯỚNG NGẠI VẬT 3: Bếp Đậy Nắp Kín (lidTarget) */}
                {!isIce && !isChain && isLid && (
                  <div className="absolute inset-0 z-20 bg-[#C8C2B8] flex items-center justify-center gap-1 px-1.5 border-2 border-[#4A3525]/40 rounded-xl">
                    <div className="w-8 h-9 rounded-lg bg-[#FFFDF9] border-[1.6px] border-[#4A3525] p-0.5 shadow-sm">
                      <SkewerSvg type={grill.lidTarget} className="w-full h-full" />
                    </div>
                    <span className="text-[8.5px] font-black text-[#4A3525] leading-tight">
                      Giao món này để mở
                    </span>
                  </div>
                )}
              </div>

              {/* KHAY XEM TRƯỚC (Preview Tray - 1-3 icon thu nhỏ lượt xiên tiếp theo) */}
              <div className="h-5 rounded-lg bg-[#FFF0DE] border-[1.5px] border-[#4A3525]/70 px-1 flex items-center justify-center gap-1 shrink-0">
                {nextQueueLayer.length > 0 ? (
                  <>
                    {nextQueueLayer.map((qItem) => (
                      <div key={qItem.id} className="w-3.5 h-4">
                        <SkewerSvg type={qItem.type} className="w-full h-full" />
                      </div>
                    ))}
                    {grill.queue.length > 1 && (
                      <span className="text-[8px] font-black text-[#7D6352] tabular-nums">
                        +{grill.queue.length - 1}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[8px] font-bold text-[#7D6352]/50">Hết lượt</span>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* ================================================================= */}
      {/* TẦNG 4: 4 NÚT TRỢ GIÚP (BOOSTERS) Ở ĐÁY MÀN HÌNH                  */}
      {/* ================================================================= */}
      <footer className="grid grid-cols-4 gap-1.5 pt-1 shrink-0">
        {[
          {
            id: 'spatula',
            label: 'Xẻng Xúc',
            count: state.boosters.spatula,
            bg: 'bg-[#FFE082]',
            onClick: useSpatulaBooster
          },
          {
            id: 'shuffle',
            label: 'Đảo Xiên',
            count: state.boosters.shuffle,
            bg: 'bg-[#FF9B71]',
            onClick: useShuffleBooster
          },
          {
            id: 'pack',
            label: 'Đóng Gói',
            count: state.boosters.pack,
            bg: 'bg-[#FFB7C5]',
            onClick: usePackBooster
          },
          {
            id: 'undo',
            label: 'Hoàn Tác',
            count: state.boosters.undo,
            bg: 'bg-[#88C9A1]',
            onClick: useUndoBooster
          }
        ].map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={b.count <= 0 || state.status !== 'playing'}
            onClick={b.onClick}
            className={`tactile-btn relative py-1.5 px-1 rounded-2xl border-[2px] border-[#4A3525] flex flex-col items-center justify-center gap-0.5 ${
              b.count > 0 ? b.bg : 'bg-[#E6DCCF] opacity-60 cursor-not-allowed'
            }`}
          >
            <BoosterIconSvg kind={b.id} className="w-5 h-5" />
            <span className="text-[9.5px] font-black text-[#4A3525] leading-none">
              {b.label}
            </span>
            <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-[#4A3525] text-[#FFF8F0] text-[9px] font-black tabular-nums">
              {b.count}
            </span>
          </button>
        ))}
      </footer>

      {/* MODAL HƯỚNG DẪN NHANH (?) */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-[#4A3525]/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#FFF8F0] rounded-[28px] border-[2.5px] border-[#4A3525] p-4 space-y-2.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#4A3525]">
                Cách Chơi Bếp Nướng {petName}
              </h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-7 h-7 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="text-xs font-bold text-[#4A3525] space-y-1.5 list-disc pl-4 leading-snug">
              <li>Chạm xiên trên bếp để giao lên <strong>4 Khay Đơn Hàng</strong> (đủ 3 xiên cùng loại là xong 1 đơn!).</li>
              <li>Xiên chưa khớp đơn sẽ nằm tạm trên <strong>7 Đĩa Chờ</strong>; gom đủ 3 xiên giống nhau trên đĩa cũng tự nướng chín (+15đ)!</li>
              <li>Hoàn thành đơn hàng sẽ tự phá <strong>Băng</strong>, giảm số <strong>Xích Khóa</strong> và bật <strong>Nắp Kín</strong>.</li>
              <li>Nhặt 1 xiên bất kỳ trên bếp sẽ xé <strong>Giấy Bạc ?</strong> trên cùng bếp đó.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] font-black text-xs"
            >
              Đã Hiểu, Nướng Thôi!
            </button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH THẮNG / THUA */}
      {(state.status === 'won' || state.status === 'lost') && (
        <div className="absolute inset-0 z-50 bg-[#4A3525]/50 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="w-full max-w-xs bg-[#FFF8F0] rounded-[30px] border-[2.5px] border-[#4A3525] p-5 text-center space-y-3 shadow-2xl">
            <span
              className={`inline-block px-3 py-1 rounded-full border-[1.6px] border-[#4A3525] text-[11px] font-black text-[#4A3525] ${
                state.status === 'won' ? 'bg-[#88C9A1]' : 'bg-[#FFB7C5]'
              }`}
            >
              {state.status === 'won'
                ? state.passedPartnerLevel
                  ? `Vượt mặt ${partnerName}!`
                  : `Hoàn thành Màn ${state.level}!`
                : 'Đầy 7 Đĩa Chờ Rồi!'}
            </span>

            <h3 className="text-xl font-black text-[#4A3525]">
              {state.status === 'won'
                ? `Đầu bếp ${playerName} đỉnh quá!`
                : 'Suýt nữa thì xong đơn!'}
            </h3>

            <div className="grid grid-cols-3 gap-2 bg-[#FFFDF9] p-3 rounded-2xl border-2 border-[#4A3525]">
              <div>
                <div className="text-[10px] font-bold text-[#7D6352]">Điểm số</div>
                <div className="text-base font-black text-[#4A3525] tabular-nums">
                  {state.score}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#7D6352]">Đơn xong</div>
                <div className="text-base font-black text-[#4A3525] tabular-nums">
                  {state.completedOrders}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#7D6352]">Xu thưởng</div>
                <div className="text-base font-black text-[#E87A4D] tabular-nums">
                  +{state.status === 'won' ? state.earnedCoins : 0}
                </div>
              </div>
            </div>

            {state.status === 'won' && (
              <p className="text-[11px] font-bold text-[#7D6352]">
                +12 Vui vẻ • -6 Năng lượng
                {!state.usedAnyBooster ? ' • +5 Xu thưởng không dùng Booster!' : ''}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              {state.status === 'won' ? (
                <button
                  type="button"
                  onClick={() => startLevel(state.level + 1)}
                  className="tactile-btn flex-1 py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] font-black text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Chơi Màn {state.level + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startLevel(state.level)}
                  className="tactile-btn flex-1 py-3 rounded-2xl bg-[#FFE082] border-2 border-[#4A3525] text-[#4A3525] font-black text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Thử Lại Màn {state.level}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExit}
                className="tactile-btn px-4 py-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] text-[#4A3525] font-black text-xs flex items-center justify-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span>Về Nhà</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
