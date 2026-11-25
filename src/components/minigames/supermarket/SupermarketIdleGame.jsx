import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Store,
  Users,
  Coins,
  Zap,
  Sparkles,
  Refrigerator,
  ArrowUpCircle,
  Clock,
  Check
} from 'lucide-react';
import {
  STALLS,
  STAFF_LIST,
  XU_EXCHANGE_TIERS,
  FRIDGE_PERK_ITEMS,
  MART_DAILY_XU_CAP,
  MART_DAILY_FRIDGE_CAP,
  MAX_STALL_LEVEL,
  formatCash,
  getTodayDateStr,
  normalizeSupermarket,
  getStallUpgradeCost,
  getStallIncomePerSec,
  getStaffUpgradeCost,
  getMaxOfflineHours,
  getMartTierInfo,
  computeIncomePerSec,
  computeOfflineEarnings
} from './supermarketData';
import {
  StallSvg,
  CashierDeskSvg,
  CustomerPetSvg,
  StaffBadgeSvg
} from './supermarketAssets';
import { CookingIconSvg, normalizeFridge } from '../../../data/cookingData';
import { updateRoomFields, setupMartPresence } from '../../../services/firebase';
import { soundEngine } from '../../../services/soundEngine';

const CUSTOMER_SPECIES = ['tabby', 'shiba', 'duck', 'bunny', 'capybara'];
const RUSH_DURATION_SEC = 20;
const RUSH_COOLDOWN_SEC = 90;

export default function SupermarketIdleGame({
  roomId,
  roomData,
  playerRole = 'player1',
  playerName = 'Bạn',
  partnerName = 'Người kia',
  onExit
}) {
  const initialMart = normalizeSupermarket(roomData?.minigames?.supermarket);

  const [mart, setMart] = useState(initialMart);
  const [activeTab, setActiveTab] = useState('stalls'); // 'stalls' | 'staff' | 'bridge'
  const [customers, setCustomers] = useState([]);
  const [floaters, setFloaters] = useState([]);
  const [toast, setToast] = useState(null);
  const [offlineModal, setOfflineModal] = useState(null);
  const [rushLeft, setRushLeft] = useState(0);
  const [rushCooldown, setRushCooldown] = useState(0);
  const [cashierBounce, setCashierBounce] = useState(false);

  const martRef = useRef(mart);
  martRef.current = mart;
  const dirtyCashRef = useRef(0);
  const offlineCheckedRef = useRef(false);
  const nextVipAtRef = useRef(Date.now() + 28000);

  const partnerRole = playerRole === 'player1' ? 'player2' : 'player1';
  const remoteMart = roomData?.minigames?.supermarket;
  const isCoopShift = Boolean(remoteMart?.activeInMart?.[partnerRole]);
  const isRushHour = rushLeft > 0;

  const incomePerSec = computeIncomePerSec(mart, { isCoopShift, isRushHour });
  const tierInfo = getMartTierInfo(mart.stalls);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2600);
  }, []);

  const spawnFloater = useCallback((x, y, text, color = '#4A3525') => {
    const id = Date.now() + Math.random();
    setFloaters((prev) => [...prev.slice(-10), { id, x, y, text, color }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 950);
  }, []);

  // 1. Ghi nhận Presence trực Siêu Thị (cho hiệu ứng Ca Trực Đôi x2)
  useEffect(() => {
    if (!roomId || !playerRole) return;
    const cleanup = setupMartPresence(roomId, playerRole);
    return () => cleanup();
  }, [roomId, playerRole]);

  // 2. Tính thu nhập ngoại tuyến 1 lần lúc vừa mở siêu thị
  useEffect(() => {
    if (offlineCheckedRef.current) return;
    offlineCheckedRef.current = true;
    const off = computeOfflineEarnings(initialMart, Date.now());
    if (off.elapsedSec >= 120 && off.earned > 0) {
      setOfflineModal(off);
    }
  }, []);

  // 3. Đồng bộ thay đổi từ người chơi thứ 2 (nếu họ nâng cấp quầy / nhân viên)
  useEffect(() => {
    if (!remoteMart) return;
    const norm = normalizeSupermarket(remoteMart);
    setMart((prev) => ({
      ...norm,
      // Giữ phần tiền cục bộ chưa kịp flush để số không bị giật lùi
      martCash: Math.max(norm.martCash, prev.martCash),
      totalEarned: Math.max(norm.totalEarned, prev.totalEarned)
    }));
  }, [
    remoteMart?.lastTickAt,
    remoteMart?.contributions?.player1,
    remoteMart?.contributions?.player2
  ]);

  // Hàm flush trạng thái lên Firebase (gọi mỗi 5s hoặc ngay khi mua nâng cấp / thoát)
  const flushToFirebase = useCallback(
    async (overrideMart = null, extraRootUpdates = {}) => {
      if (!roomId) return;
      const snap = overrideMart || martRef.current;
      dirtyCashRef.current = 0;
      const now = Date.now();
      const payload = {
        ...extraRootUpdates,
        'minigames/supermarket/martCash': Math.floor(snap.martCash),
        'minigames/supermarket/totalEarned': Math.floor(snap.totalEarned),
        'minigames/supermarket/stalls': snap.stalls,
        'minigames/supermarket/staff': snap.staff,
        'minigames/supermarket/contributions': snap.contributions,
        'minigames/supermarket/dailyExchange': snap.dailyExchange,
        'minigames/supermarket/lastTickAt': now
      };
      await updateRoomFields(roomId, payload).catch(() => {});
    },
    [roomId]
  );

  // Flush định kỳ 5 giây & khi thoát màn hình
  useEffect(() => {
    const syncTimer = setInterval(() => {
      if (dirtyCashRef.current > 0) {
        flushToFirebase();
      }
    }, 5000);
    return () => {
      clearInterval(syncTimer);
      flushToFirebase();
    };
  }, [flushToFirebase]);

  // 4. Vòng lặp thu nhập thụ động (mỗi 1 giây) + đếm ngược Rush Hour
  useEffect(() => {
    const tick = setInterval(() => {
      setMart((prev) => {
        const gain = computeIncomePerSec(prev, {
          isCoopShift,
          isRushHour: rushLeft > 0
        });
        dirtyCashRef.current += gain;
        return {
          ...prev,
          martCash: prev.martCash + gain,
          totalEarned: prev.totalEarned + gain
        };
      });
      setRushLeft((r) => (r > 0 ? r - 1 : 0));
      setRushCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, [isCoopShift, rushLeft > 0]);

  // 5. Mô phỏng khách hàng thú tự động trên sân khấu 2D (tối đa 7 khách, nhẹ pin 100%)
  useEffect(() => {
    const stepMs = 350;
    const timer = setInterval(() => {
      const curMart = martRef.current;
      const unlockedStalls = STALLS.filter((s) => (curMart.stalls[s.id] || 0) > 0);
      if (unlockedStalls.length === 0) return;

      const maxCustomers = Math.min(7, 3 + Math.floor((curMart.staff.promoter || 0) / 2) + (isRushHour ? 2 : 0));
      const now = Date.now();
      const shouldSpawnVip = now >= nextVipAtRef.current;

      setCustomers((prev) => {
        const nextList = [];
        let hasVip = prev.some((c) => c.isVip);

        for (const c of prev) {
          const nextStep = { ...c, age: c.age + stepMs };
          if (c.state === 'entering') {
            if (nextStep.age >= (isRushHour ? 550 : 900)) {
              nextStep.state = 'shopping';
              nextStep.age = 0;
              nextStep.x = c.stallPos.x;
              nextStep.y = c.stallPos.y + 12;
            }
          } else if (c.state === 'shopping') {
            if (nextStep.age >= (isRushHour ? 950 : 1450)) {
              nextStep.state = 'checkout';
              nextStep.age = 0;
              nextStep.x = 24 + (Math.random() * 10 - 5);
              nextStep.y = 77 + (Math.random() * 6 - 3);
            }
          } else if (c.state === 'checkout') {
            const cashierSpeed = Math.max(550, 1450 - (curMart.staff.cashier || 1) * 70);
            if (nextStep.age >= (isRushHour ? cashierSpeed * 0.65 : cashierSpeed)) {
              // Thanh toán thành công
              const payAmt = Math.max(
                4,
                Math.round(
                  computeIncomePerSec(curMart, { isCoopShift, isRushHour }) * 1.35
                )
              );
              spawnFloater(22, 68, `+$${formatCash(payAmt)}`, '#4F9A6D');
              soundEngine.play('cashRegister');
              nextStep.state = 'leaving';
              nextStep.age = 0;
              nextStep.x = 64;
              nextStep.y = 95;
            }
          } else if (c.state === 'leaving') {
            if (nextStep.age >= 900) {
              continue; // rời cửa
            }
          }
          nextList.push(nextStep);
        }

        // Sinh thêm khách mới nếu chưa đầy
        if (nextList.length < maxCustomers && (Math.random() < (isRushHour ? 0.65 : 0.34) || nextList.length < 2)) {
          const targetStall = unlockedStalls[Math.floor(Math.random() * unlockedStalls.length)];
          const isVip = shouldSpawnVip && !hasVip;
          if (isVip) {
            hasVip = true;
            const promoterReduction = (curMart.staff.promoter || 0) * 2500;
            nextVipAtRef.current = now + Math.max(32000, 52000 - promoterReduction + Math.random() * 18000);
            soundEngine.play('vipBell');
          }
          nextList.push({
            id: `cust_${now}_${Math.random().toString(36).slice(2, 6)}`,
            species: isVip
              ? Math.random() < 0.5
                ? 'capybara'
                : 'tabby'
              : CUSTOMER_SPECIES[Math.floor(Math.random() * CUSTOMER_SPECIES.length)],
            isVip,
            stallId: targetStall.id,
            stallPos: targetStall.pos,
            x: 62 + (Math.random() * 10 - 5),
            y: 92,
            state: 'entering',
            age: 0
          });
        }

        return nextList;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isCoopShift, isRushHour, spawnFloater]);

  // Chạm Quầy Thu Ngân: Tính tiền siêu tốc +20% tip!
  const handleTapCashier = () => {
    setCashierBounce(true);
    setTimeout(() => setCashierBounce(false), 180);

    const tipGain = Math.max(5, Math.round(incomePerSec * 1.2));
    dirtyCashRef.current += tipGain;
    setMart((prev) => ({
      ...prev,
      martCash: prev.martCash + tipGain,
      totalEarned: prev.totalEarned + tipGain
    }));
    soundEngine.play('cashRegister');
    spawnFloater(24, 64, `+$${formatCash(tipGain)} Tip!`, '#E87A4D');

    // Đẩy nhanh khách đang đứng ở quầy thu ngân ra cửa ngay
    setCustomers((prev) =>
      prev.map((c) =>
        c.state === 'checkout' ? { ...c, state: 'leaving', age: 0, x: 64, y: 95 } : c
      )
    );
  };

  // Chạm Khách VIP: Túi tiền x15/s HOẶC tặng thẳng 1 nguyên liệu tươi vào Tủ Lạnh!
  const handleTapVip = async (vipCustomer) => {
    setCustomers((prev) => prev.filter((c) => c.id !== vipCustomer.id));
    soundEngine.play('win');

    if (Math.random() < 0.55) {
      const bonus = Math.max(60, incomePerSec * 15);
      const nextMart = {
        ...martRef.current,
        martCash: martRef.current.martCash + bonus,
        totalEarned: martRef.current.totalEarned + bonus
      };
      setMart(nextMart);
      spawnFloater(vipCustomer.x, vipCustomer.y - 8, `VIP +$${formatCash(bonus)}!`, '#D97706');
      showToast(`Khách VIP tặng túi tiền lớn +$${formatCash(bonus)}!`);
      flushToFirebase(nextMart);
    } else {
      const randomIng = FRIDGE_PERK_ITEMS[Math.floor(Math.random() * FRIDGE_PERK_ITEMS.length)];
      const curFridge = normalizeFridge(roomData?.fridge);
      const nextFridge = {
        ...curFridge,
        ingredients: {
          ...curFridge.ingredients,
          [randomIng.id]: (curFridge.ingredients[randomIng.id] || 0) + 1
        }
      };
      spawnFloater(vipCustomer.x, vipCustomer.y - 8, `+1 ${randomIng.name}!`, '#4F9A6D');
      showToast(`Khách VIP tặng +1 ${randomIng.name} thẳng vào Tủ Lạnh nhà bếp!`);
      await updateRoomFields(roomId, { fridge: nextFridge }).catch(() => {});
    }
  };

  // Kích hoạt Giờ Vàng Giảm Giá (Rush Hour x2 trong 20s)
  const handleStartRushHour = () => {
    if (rushCooldown > 0 || rushLeft > 0) return;
    soundEngine.play('fever');
    setRushLeft(RUSH_DURATION_SEC);
    setRushCooldown(RUSH_COOLDOWN_SEC);
    showToast('GIỜ VÀNG GIẢM GIÁ! Khách đông & Doanh thu x2 trong 20 giây!');
  };

  // Thu tiền ngoại tuyến
  const handleClaimOffline = () => {
    if (!offlineModal) return;
    const bonus = offlineModal.earned;
    soundEngine.play('cashRegister');
    const nextMart = {
      ...martRef.current,
      martCash: martRef.current.martCash + bonus,
      totalEarned: martRef.current.totalEarned + bonus,
      lastTickAt: Date.now()
    };
    setMart(nextMart);
    setOfflineModal(null);
    flushToFirebase(nextMart);
    showToast(`Đã thu +$${formatCash(bonus)} doanh thu ngoại tuyến!`);
  };

  // Nâng cấp / Mở khóa Quầy hàng
  const handleUpgradeStall = async (stall) => {
    const curLv = mart.stalls[stall.id] || 0;
    if (curLv >= MAX_STALL_LEVEL) return;
    const cost = getStallUpgradeCost(stall, curLv);
    if (mart.martCash < cost) {
      soundEngine.play('error');
      return;
    }

    soundEngine.play('upgrade');
    const nextLv = curLv + 1;
    const prevTier = getMartTierInfo(mart.stalls).tier;
    const nextStalls = { ...mart.stalls, [stall.id]: nextLv };
    const nextTier = getMartTierInfo(nextStalls);

    const nextMart = {
      ...mart,
      martCash: mart.martCash - cost,
      stalls: nextStalls,
      contributions: {
        ...mart.contributions,
        [playerRole]: (mart.contributions[playerRole] || 0) + 1
      }
    };
    setMart(nextMart);

    const extraUpdates = {};
    if (curLv === 0) {
      const now = Date.now();
      const logEntry = {
        id: `log_mart_${now}`,
        actor: playerName,
        action:
          nextTier.tier > prevTier
            ? `vừa mở khóa ${stall.name}, nâng cấp Siêu Thị lên "${nextTier.title}"!`
            : `vừa mở khóa ${stall.name} tại Siêu Thị Mochi!`,
        petComment: `Oa siêu thị nhà mình giàu to rồi! Nhớ gửi thêm cá hồi về tủ lạnh nha!`,
        timestamp: now
      };
      extraUpdates.logs = [logEntry, ...(roomData?.logs || [])].slice(0, 20);
      showToast(`Đã mở khóa ${stall.name}!`);
    } else if (nextLv === 10 || nextLv === 25 || nextLv === 50) {
      showToast(`MỐC LEVEL ${nextLv}! ${stall.name} nhân đôi doanh thu (x2)!`);
    }

    await flushToFirebase(nextMart, extraUpdates);
  };

  // Thuê / Nâng cấp Nhân viên
  const handleUpgradeStaff = async (staffDef) => {
    const curLv = mart.staff[staffDef.id] || 0;
    if (curLv >= staffDef.maxLevel) return;
    const cost = getStaffUpgradeCost(staffDef, curLv);
    if (mart.martCash < cost) {
      soundEngine.play('error');
      return;
    }

    soundEngine.play('upgrade');
    const nextMart = {
      ...mart,
      martCash: mart.martCash - cost,
      staff: { ...mart.staff, [staffDef.id]: curLv + 1 },
      contributions: {
        ...mart.contributions,
        [playerRole]: (mart.contributions[playerRole] || 0) + 1
      }
    };
    setMart(nextMart);
    showToast(`Đã nâng cấp ${staffDef.name} lên Lv.${curLv + 1}!`);
    await flushToFirebase(nextMart);
  };

  // Đổi martCash -> Xu Nhà Chung (Trần 60 Xu / ngày)
  const handleExchangeXu = async (tier) => {
    const today = getTodayDateStr();
    const curDaily =
      mart.dailyExchange.date === today
        ? mart.dailyExchange
        : { date: today, xuClaimed: 0, fridgeClaims: 0 };

    const remainingXu = Math.max(0, MART_DAILY_XU_CAP - curDaily.xuClaimed);
    if (remainingXu <= 0) {
      soundEngine.play('error');
      showToast('Đã đạt trần rút 60 Xu hôm nay rồi, hẹn ngày mai nha!');
      return;
    }
    if (mart.martCash < tier.cost) {
      soundEngine.play('error');
      return;
    }

    const actualXu = Math.min(tier.xu, remainingXu);
    soundEngine.play('coin');
    const nextMart = {
      ...mart,
      martCash: mart.martCash - tier.cost,
      dailyExchange: { ...curDaily, xuClaimed: curDaily.xuClaimed + actualXu }
    };
    setMart(nextMart);
    await flushToFirebase(nextMart, {
      coins: (roomData?.coins ?? 0) + actualXu
    });
    showToast(`Đã rút +${actualXu} Xu về ngân quỹ Nhà Chung!`);
  };

  // Trích hàng tươi từ Siêu Thị gửi thẳng về Tủ Lạnh Nhà Bếp (3 lần / ngày)
  const handleSendToFridge = async (ing) => {
    const today = getTodayDateStr();
    const curDaily =
      mart.dailyExchange.date === today
        ? mart.dailyExchange
        : { date: today, xuClaimed: 0, fridgeClaims: 0 };

    if (curDaily.fridgeClaims >= MART_DAILY_FRIDGE_CAP) {
      soundEngine.play('error');
      showToast('Hôm nay đã nhập đủ 3 lượt hàng tươi về Tủ Lạnh rồi!');
      return;
    }
    if (mart.martCash < ing.cost) {
      soundEngine.play('error');
      return;
    }

    soundEngine.play('buy');
    const nextMart = {
      ...mart,
      martCash: mart.martCash - ing.cost,
      dailyExchange: { ...curDaily, fridgeClaims: curDaily.fridgeClaims + 1 }
    };
    const curFridge = normalizeFridge(roomData?.fridge);
    const nextFridge = {
      ...curFridge,
      ingredients: {
        ...curFridge.ingredients,
        [ing.id]: (curFridge.ingredients[ing.id] || 0) + 1
      }
    };

    setMart(nextMart);
    await flushToFirebase(nextMart, { fridge: nextFridge });
    showToast(`Đã gửi +1 ${ing.name} thẳng vào Tủ Lạnh Nhà Bếp!`);
  };

  const today = getTodayDateStr();
  const dailyEx =
    mart.dailyExchange.date === today
      ? mart.dailyExchange
      : { date: today, xuClaimed: 0, fridgeClaims: 0 };

  const p1Name = roomData?.players?.player1?.name || (playerRole === 'player1' ? playerName : partnerName);
  const p2Name = roomData?.players?.player2?.name || (playerRole === 'player2' ? playerName : partnerName);

  return (
    <div
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 8px), 8px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)'
      }}
      className="fixed inset-0 z-[80] max-w-[430px] mx-auto h-[100dvh] bg-[#FFF8F0] flex flex-col overflow-hidden select-none"
    >
      {/* ================================================================= */}
      {/* HEADER GỌN TRÊN CÙNG                                              */}
      {/* ================================================================= */}
      <div className="px-3 pb-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              flushToFirebase();
              onExit();
            }}
            className="w-8 h-8 rounded-full bg-[#FFFDF9] border-2 border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs font-black text-[#4A3525] truncate leading-tight">
              Siêu Thị Mochi
            </h1>
            <p className="text-[10px] font-extrabold text-[#7D6352] truncate">
              {tierInfo.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="px-2.5 py-1 rounded-full bg-[#FFE082] border-2 border-[#4A3525] flex items-center gap-1 text-xs font-black text-[#4A3525] tabular-nums shadow-sm">
            <span>${formatCash(mart.martCash)}</span>
          </div>
          <div className="px-2 py-1 rounded-full bg-[#E6F7EC] border-[1.6px] border-[#4A3525] text-[10.5px] font-black text-[#4F9A6D] tabular-nums">
            +{formatCash(incomePerSec)}/s
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* NỬA TRÊN (~42%): SÂN KHẤU SIÊU THỊ 2D SỐNG ĐỘNG                   */}
      {/* ================================================================= */}
      <div
        className={`relative mx-3 h-[40%] min-h-[215px] rounded-[24px] border-[2.5px] border-[#4A3525] overflow-hidden shadow-inner shrink-0 transition-colors ${
          isRushHour ? 'bg-[#FFF3CC]' : 'bg-[#FBF3E6]'
        }`}
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(74,53,37,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(74,53,37,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Huy hiệu Ca Trực Đôi x2 hoặc Đèn Hội Rush Hour */}
        <div className="absolute top-2 inset-x-2 z-[30] flex items-center justify-between pointer-events-none">
          {isCoopShift ? (
            <div className="px-2.5 py-0.5 rounded-full bg-[#FFB7C5] border-[1.6px] border-[#4A3525] text-[10px] font-black text-[#4A3525] flex items-center gap-1 shadow animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>Ca Trực Đôi: Doanh thu x2!</span>
            </div>
          ) : (
            <div />
          )}

          {/* Nút Giờ Vàng Giảm Giá (Rush Hour) */}
          <button
            type="button"
            disabled={rushCooldown > 0 || rushLeft > 0}
            onClick={handleStartRushHour}
            className={`pointer-events-auto px-2.5 py-1 rounded-full border-[1.8px] border-[#4A3525] text-[10px] font-black flex items-center gap-1 shadow active:scale-95 transition-all ${
              isRushHour
                ? 'bg-[#FF9B71] text-[#4A3525] animate-bounce'
                : rushCooldown > 0
                ? 'bg-[#EAE0D5] text-[#7D6352]'
                : 'bg-[#FFE082] text-[#4A3525]'
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span className="tabular-nums">
              {isRushHour
                ? `Giờ Vàng x2 (${rushLeft}s)`
                : rushCooldown > 0
                ? `Hồi ${rushCooldown}s`
                : 'Giờ Vàng x2'}
            </span>
          </button>
        </div>

        {/* 6 QUẦY HÀNG XẾP 2 HÀNG */}
        {STALLS.map((stall) => {
          const lv = mart.stalls[stall.id] || 0;
          return (
            <button
              key={stall.id}
              type="button"
              onClick={() => setActiveTab('stalls')}
              style={{ left: `${stall.pos.x}%`, top: `${stall.pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[27%] z-[10] flex flex-col items-center focus:outline-none active:scale-95 transition-transform"
            >
              <div className="w-full">
                <StallSvg stallId={stall.id} level={lv} />
              </div>
              <span
                className={`-mt-1.5 px-1.5 py-0.2 rounded-full border border-[#4A3525] text-[8.5px] font-black whitespace-nowrap shadow-sm ${
                  lv > 0 ? 'bg-[#FFFDF9] text-[#4A3525]' : 'bg-[#FFE082] text-[#4A3525]'
                }`}
              >
                {lv > 0 ? `Lv.${lv}` : `$${formatCash(stall.unlockCost)}`}
              </span>
            </button>
          );
        })}

        {/* Nhân viên Capybara Tiếp Hàng (hiện khi stocker >= 1) */}
        {(mart.staff.stocker || 0) > 0 && (
          <div
            style={{ left: '50%', top: '39%' }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-[14] w-8 h-8 animate-bounce"
            title="Capybara Tiếp Hàng"
          >
            <StaffBadgeSvg staffId="stocker" className="w-full h-full" />
          </div>
        )}

        {/* Nhân viên Cún Corgi Phát Tờ Rơi gần cửa (hiện khi promoter >= 1) */}
        {(mart.staff.promoter || 0) > 0 && (
          <div
            style={{ left: '84%', top: '82%' }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-[14] w-9 h-9"
            title="Corgi Phát Tờ Rơi"
          >
            <StaffBadgeSvg staffId="promoter" className="w-full h-full" />
          </div>
        )}

        {/* QUẦY THU NGÂN (Chạm để tính tiền siêu tốc +20% tip!) */}
        <motion.button
          type="button"
          onClick={handleTapCashier}
          animate={cashierBounce ? { scale: 0.92 } : { scale: 1 }}
          style={{ left: '20%', top: '81%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[31%] z-[18] focus:outline-none cursor-pointer"
          title="Chạm để tính tiền nhanh +20% tip!"
        >
          {/* Thu ngân Mèo Cam đứng sau quầy */}
          <div className="mx-auto -mb-3 w-8 h-8">
            <StaffBadgeSvg staffId="cashier" className="w-full h-full" />
          </div>
          <CashierDeskSvg hasSecondLane={(mart.staff.cashier || 1) >= 5} />
        </motion.button>

        {/* Cửa kính tự động & thảm chào mừng phía dưới */}
        <div
          style={{ left: '63%', bottom: '0%' }}
          className="pointer-events-none absolute -translate-x-1/2 w-20 h-5 rounded-t-xl bg-[#CFEAF7] border-t-2 border-x-2 border-[#4A3525] flex items-center justify-center z-[8]"
        >
          <span className="text-[7.5px] font-black text-[#4A3525] tracking-wider">WELCOME</span>
        </div>

        {/* KHÁCH HÀNG THÚ TỰ ĐỘNG DI CHUYỂN */}
        {customers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              if (c.isVip) handleTapVip(c);
              else if (c.state === 'checkout') handleTapCashier();
            }}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transition: 'left 0.75s linear, top 0.75s linear'
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-[22] focus:outline-none ${
              c.isVip ? 'cursor-pointer scale-110' : 'cursor-default'
            }`}
          >
            {c.isVip && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#FFE066] border border-[#4A3525] text-[8px] font-black text-[#4A3525] whitespace-nowrap animate-bounce">
                VIP! Chạm
              </span>
            )}
            <CustomerPetSvg species={c.species} isVip={c.isVip} className="w-9 h-9" />
          </button>
        ))}

        {/* Chữ nổi +$XX bay lên */}
        <AnimatePresence>
          {floaters.map((fl) => (
            <motion.div
              key={fl.id}
              initial={{ opacity: 1, y: 0, scale: 0.85 }}
              animate={{ opacity: 0, y: -28, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85 }}
              style={{ left: `${fl.x}%`, top: `${fl.y}%`, color: fl.color }}
              className="pointer-events-none absolute -translate-x-1/2 z-[35] text-[11px] font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)] whitespace-nowrap"
            >
              {fl.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Toast thông báo gọn */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 inset-x-3 z-[40] bg-[#4A3525]/92 text-[#FFF8F0] text-[10.5px] font-extrabold px-3 py-1.5 rounded-xl text-center shadow"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================================================= */}
      {/* NỬA DƯỚI (~58%): KHAY QUẢN LÝ 3 TAB                               */}
      {/* ================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col px-3 pt-2">
        {/* 3 Tab */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#FFF0DE] border-2 border-[#4A3525] shrink-0">
          {[
            { id: 'stalls', label: 'Quầy Hàng', icon: Store },
            { id: 'staff', label: 'Nhân Viên', icon: Users },
            { id: 'bridge', label: 'Rút Lãi & Kho', icon: Coins }
          ].map((t) => {
            const IconComp = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  soundEngine.play('tap');
                  setActiveTab(t.id);
                }}
                className={`py-1.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#FF9B71] text-[#4A3525] border-[1.6px] border-[#4A3525] shadow-sm'
                    : 'text-[#7D6352]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Nội dung cuộn mượt */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll py-2.5 space-y-2">
          {/* TAB 1: 6 QUẦY HÀNG */}
          {activeTab === 'stalls' &&
            STALLS.map((stall) => {
              const lv = mart.stalls[stall.id] || 0;
              const isMax = lv >= MAX_STALL_LEVEL;
              const cost = getStallUpgradeCost(stall, lv);
              const canAfford = mart.martCash >= cost && !isMax;
              const curInc = getStallIncomePerSec(stall, lv);
              const nextMilestone = lv < 10 ? 10 : lv < 25 ? 25 : 50;

              return (
                <div
                  key={stall.id}
                  className="p-2.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] flex items-center gap-2.5"
                >
                  <div className="w-14 h-12 rounded-xl bg-[#FFF8F0] border-[1.5px] border-[#4A3525]/60 p-1 flex items-center justify-center shrink-0">
                    <StallSvg stallId={stall.id} level={lv} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#4A3525] truncate">
                        {stall.name}
                      </span>
                      {lv > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#FFE082] border border-[#4A3525] text-[9.5px] font-black text-[#4A3525] shrink-0">
                          Lv.{lv}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-[#7D6352] truncate mt-0.5">
                      {lv > 0
                        ? `Thu +$${formatCash(curInc)}/s • Mốc x2: Lv.${nextMilestone}`
                        : stall.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleUpgradeStall(stall)}
                    className={`tactile-btn px-3 py-2 rounded-xl border-[1.8px] border-[#4A3525] text-[11px] font-black shrink-0 flex flex-col items-center leading-tight min-w-[76px] ${
                      isMax
                        ? 'bg-[#88C9A1] text-[#4A3525]'
                        : canAfford
                        ? lv === 0
                          ? 'bg-[#88C9A1] text-[#4A3525]'
                          : 'bg-[#FFE082] text-[#4A3525]'
                        : 'bg-[#E8DFD5] text-[#7D6352] opacity-65'
                    }`}
                  >
                    <span>{isMax ? 'MAX' : lv === 0 ? 'Mở khóa' : 'Nâng cấp'}</span>
                    {!isMax && <span className="tabular-nums">${formatCash(cost)}</span>}
                  </button>
                </div>
              );
            })}

          {/* TAB 2: NHÂN VIÊN THÚ */}
          {activeTab === 'staff' &&
            STAFF_LIST.map((st) => {
              const lv = mart.staff[st.id] || 0;
              const isMax = lv >= st.maxLevel;
              const cost = getStaffUpgradeCost(st, lv);
              const canAfford = mart.martCash >= cost && !isMax;
              return (
                <div
                  key={st.id}
                  className="p-2.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] flex items-center gap-2.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] border-[1.5px] border-[#4A3525]/60 flex items-center justify-center shrink-0">
                    <StaffBadgeSvg staffId={st.id} className="w-10 h-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#4A3525] truncate">
                        {st.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#E6F7EC] border border-[#4A3525] text-[9.5px] font-black text-[#4A3525] shrink-0">
                        Lv.{lv}/{st.maxLevel}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-[#7D6352] leading-snug mt-0.5">
                      {st.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleUpgradeStaff(st)}
                    className={`tactile-btn px-3 py-2 rounded-xl border-[1.8px] border-[#4A3525] text-[11px] font-black shrink-0 flex flex-col items-center leading-tight min-w-[74px] ${
                      isMax
                        ? 'bg-[#88C9A1] text-[#4A3525]'
                        : canAfford
                        ? 'bg-[#FF9B71] text-[#4A3525]'
                        : 'bg-[#E8DFD5] text-[#7D6352] opacity-65'
                    }`}
                  >
                    <span>{isMax ? 'MAX' : lv === 0 ? 'Thuê' : 'Nâng'}</span>
                    {!isMax && <span className="tabular-nums">${formatCash(cost)}</span>}
                  </button>
                </div>
              );
            })}

          {/* TAB 3: RÚT LÃI XU & GỬI HÀNG TƯƠI VỀ TỦ LẠNH */}
          {activeTab === 'bridge' && (
            <div className="space-y-3">
              {/* 1. Rút lãi thành Xu Nhà Chung */}
              <div className="p-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-[#4A3525]">
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-[#E87A4D]" />
                    Rút Lãi Về Ngân Quỹ Nhà Chung
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] text-[10px] tabular-nums">
                    {dailyEx.xuClaimed}/{MART_DAILY_XU_CAP} Xu
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#4A3525]/15 overflow-hidden">
                  <div
                    className="h-full bg-[#88C9A1] transition-all"
                    style={{
                      width: `${Math.min(100, (dailyEx.xuClaimed / MART_DAILY_XU_CAP) * 100)}%`
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {XU_EXCHANGE_TIERS.map((t) => {
                    const disabled =
                      dailyEx.xuClaimed >= MART_DAILY_XU_CAP || mart.martCash < t.cost;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleExchangeXu(t)}
                        className={`tactile-btn py-2 px-1.5 rounded-xl border-[1.8px] border-[#4A3525] flex flex-col items-center ${
                          disabled
                            ? 'bg-[#E8DFD5] text-[#7D6352] opacity-60'
                            : 'bg-[#FFE082] text-[#4A3525]'
                        }`}
                      >
                        <span className="text-xs font-black">{t.label}</span>
                        <span className="text-[10px] font-extrabold tabular-nums">
                          ${formatCash(t.cost)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Trích nguyên liệu tươi gửi thẳng vào Tủ Lạnh Nhà Bếp */}
              <div className="p-3 rounded-2xl bg-[#EEF9F2] border-2 border-[#4A3525] space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-[#4A3525]">
                  <span className="flex items-center gap-1">
                    <Refrigerator className="w-4 h-4 text-[#5EA87A]" />
                    Gửi Hàng Tươi Về Tủ Lạnh Bếp
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFFDF9] border border-[#4A3525] text-[10px] tabular-nums">
                    {dailyEx.fridgeClaims}/{MART_DAILY_FRIDGE_CAP} lượt
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {FRIDGE_PERK_ITEMS.map((ing) => {
                    const disabled =
                      dailyEx.fridgeClaims >= MART_DAILY_FRIDGE_CAP ||
                      mart.martCash < ing.cost;
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSendToFridge(ing)}
                        className={`tactile-btn p-2 rounded-xl border-[1.6px] border-[#4A3525] flex flex-col items-center text-center ${
                          disabled
                            ? 'bg-[#FFFDF9]/50 opacity-55'
                            : 'bg-[#FFFDF9]'
                        }`}
                      >
                        <CookingIconSvg id={ing.id} className="w-8 h-8" />
                        <span className="text-[9.5px] font-black text-[#4A3525] line-clamp-1 mt-0.5">
                          {ing.name}
                        </span>
                        <span className="text-[10px] font-black text-[#E87A4D] tabular-nums">
                          ${formatCash(ing.cost)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Bảng đóng góp Co-op */}
              <div className="p-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-1.5">
                <div className="text-xs font-black text-[#4A3525] flex items-center gap-1.5">
                  <ArrowUpCircle className="w-4 h-4 text-[#FF9B71]" />
                  <span>Bảng Đóng Góp Đồng Quản Lý</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-black text-[#4A3525]">
                  <div className="p-2 rounded-xl bg-[#FFF3D6] border border-[#4A3525]/40 text-center">
                    <div className="truncate">{p1Name}</div>
                    <div className="text-xs text-[#E87A4D] tabular-nums">
                      {mart.contributions.player1 || 0} lần nâng cấp
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#E6F7EC] border border-[#4A3525]/40 text-center">
                    <div className="truncate">{p2Name}</div>
                    <div className="text-xs text-[#5EA87A] tabular-nums">
                      {mart.contributions.player2 || 0} lần nâng cấp
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* POPUP CHÀO MỪNG QUẢN LÝ TRỞ LẠI (THU NHẬP NGOẠI TUYẾN)            */}
      {/* ================================================================= */}
      <AnimatePresence>
        {offlineModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#4A3525]/55 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-[330px] p-5 rounded-[28px] bg-[#FFF8F0] border-[2.6px] border-[#4A3525] shadow-2xl text-center space-y-3"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFE082] border-2 border-[#4A3525] flex items-center justify-center">
                <Clock className="w-7 h-7 text-[#4A3525]" />
              </div>
              <h3 className="text-base font-black text-[#4A3525]">
                Chào mừng Quản lý trở lại!
              </h3>
              <p className="text-xs font-bold text-[#7D6352]">
                Trong{' '}
                <strong>
                  {Math.max(1, Math.floor(offlineModal.elapsedSec / 60))} phút
                </strong>{' '}
                vắng mặt (tối đa {offlineModal.maxHours}h), nhân viên Siêu Thị Mochi đã
                chăm chỉ bán hàng kiếm về:
              </p>
              <div className="py-2.5 px-4 rounded-2xl bg-[#E6F7EC] border-2 border-[#4A3525] text-2xl font-black text-[#4F9A6D] tabular-nums">
                +${formatCash(offlineModal.earned)}
              </div>
              <button
                type="button"
                onClick={handleClaimOffline}
                className="tactile-btn w-full py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-sm font-black flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Thu tiền ngay!</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
