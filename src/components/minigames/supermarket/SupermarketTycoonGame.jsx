import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Lightbulb,
  Megaphone,
  Truck,
  Map,
  Coins,
  Sparkles,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Crown
} from 'lucide-react';
import {
  DEPARTMENTS,
  MISSIONS,
  BRANCHES,
  TYCOON_DAILY_XU_CAP,
  TYCOON_DAILY_FRIDGE_CAP,
  formatMoney,
  getTodayStr,
  createInitialTycoonState,
  normalizeTycoonState,
  getDeptMultiUpgrade,
  getDeptStaffCost,
  getDeptSalaryCost,
  getParkingSlotCost,
  getParkingBarrierCost,
  getCheckoutLaneCost,
  getCheckoutSpeedCost,
  getDeliveryUpgradeCost,
  getResearchCost,
  getMarketingCost,
  getReputationStars,
  estimateIncomePerMin,
  computeTycoonOfflineEarnings
} from './tycoonConfig';
import { createSimulationWorld, spawnBuildDust } from './tycoonEngine';
import IsometricCanvas from './IsometricCanvas';
import {
  DepartmentPanel,
  ParkingPanel,
  CheckoutPanel,
  BottomFeaturePanel,
  OfflineEarningsModal
} from './TycoonPanels';
import { normalizeFridge } from '../../../data/cookingData';
import { updateRoomFields, setupMartPresence } from '../../../services/firebase';
import { soundEngine } from '../../../services/soundEngine';

export default function SupermarketTycoonGame({
  roomId,
  roomData,
  playerRole = 'player1',
  playerName = 'Bạn',
  onExit
}) {
  const initialState = normalizeTycoonState(roomData?.minigames?.supermarketTycoon);
  const [state, setState] = useState(initialState);
  const [zoom, setZoom] = useState(0.92);
  const [selectedTarget, setSelectedTarget] = useState(null); // { type: 'department'|'parking'|'checkout'|'delivery', id? }
  const [bottomPanel, setBottomPanel] = useState(null); // 'research'|'marketing'|'delivery'|'branches'|'vault'
  const [offlineReport, setOfflineReport] = useState(null);
  const [vipAvailable, setVipAvailable] = useState(false);
  const [vipBoostLeft, setVipBoostLeft] = useState(0);
  const [deliveryReady, setDeliveryReady] = useState(false);
  const [toast, setToast] = useState(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const worldRef = useRef(null);
  if (!worldRef.current) worldRef.current = createSimulationWorld();

  const dirtyCashRef = useRef(0);
  const offlineCheckedRef = useRef(false);

  const partnerRole = playerRole === 'player1' ? 'player2' : 'player1';
  const remoteTycoon = roomData?.minigames?.supermarketTycoon;
  const isCoopShift = Boolean(remoteTycoon?.activeInMart?.[partnerRole]);
  const isVipBoost = vipBoostLeft > 0;
  const petName = roomData?.pet?.name || 'Mochi';

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2800);
  }, []);

  // 1. Presence Ca Trực Đôi x2
  useEffect(() => {
    if (!roomId || !playerRole) return;
    return setupMartPresence(roomId, playerRole);
  }, [roomId, playerRole]);

  // 2. Kiểm tra doanh thu ngoại tuyến 1 lần khi mở siêu thị
  useEffect(() => {
    if (offlineCheckedRef.current) return;
    offlineCheckedRef.current = true;
    const off = computeTycoonOfflineEarnings(initialState, Date.now());
    if (off.elapsedSec >= 120 && off.earned > 0) {
      setOfflineReport(off);
    }
  }, []);

  // 3. Đồng bộ nâng cấp realtime từ người chơi thứ 2
  useEffect(() => {
    if (!remoteTycoon) return;
    const norm = normalizeTycoonState(remoteTycoon);
    setState((prev) => ({
      ...norm,
      cash: Math.max(norm.cash, prev.cash),
      totalEarned: Math.max(norm.totalEarned, prev.totalEarned)
    }));
  }, [
    remoteTycoon?.lastTickAt,
    remoteTycoon?.branchIndex,
    remoteTycoon?.contributions?.player1,
    remoteTycoon?.contributions?.player2
  ]);

  // Flush gọn lên Firebase (5s/lần và ngay khi nâng cấp / thoát)
  const flushToFirebase = useCallback(
    async (overrideState = null, extraRootUpdates = {}) => {
      if (!roomId) return;
      const snap = overrideState || stateRef.current;
      dirtyCashRef.current = 0;
      const now = Date.now();
      const payload = {
        ...extraRootUpdates,
        'minigames/supermarketTycoon/cash': Math.floor(snap.cash),
        'minigames/supermarketTycoon/totalEarned': Math.floor(snap.totalEarned),
        'minigames/supermarketTycoon/branchIndex': snap.branchIndex,
        'minigames/supermarketTycoon/departments': snap.departments,
        'minigames/supermarketTycoon/parking': snap.parking,
        'minigames/supermarketTycoon/checkout': snap.checkout,
        'minigames/supermarketTycoon/delivery': snap.delivery,
        'minigames/supermarketTycoon/research': snap.research,
        'minigames/supermarketTycoon/marketing': snap.marketing,
        'minigames/supermarketTycoon/missionIndex': snap.missionIndex,
        'minigames/supermarketTycoon/petPromoUsedAt': snap.petPromoUsedAt,
        'minigames/supermarketTycoon/contributions': snap.contributions,
        'minigames/supermarketTycoon/dailyExchange': snap.dailyExchange,
        'minigames/supermarketTycoon/lastTickAt': now
      };
      await updateRoomFields(roomId, payload).catch(() => {});
    },
    [roomId]
  );

  useEffect(() => {
    const syncInt = setInterval(() => {
      if (dirtyCashRef.current > 0) flushToFirebase();
    }, 5000);
    return () => {
      clearInterval(syncInt);
      flushToFirebase();
    };
  }, [flushToFirebase]);

  // Đếm ngược VIP x2 & kiểm tra trạng thái xe giao hàng đầy
  useEffect(() => {
    const t = setInterval(() => {
      setVipBoostLeft((v) => (v > 0 ? v - 1 : 0));
      const ready = Boolean(worldRef.current && worldRef.current.deliveryProgress >= 1 && !worldRef.current.deliveryDispatching);
      setDeliveryReady(ready);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Callback nhận tiền mỗi khi khách thanh toán xong tại quầy thu ngân trên Canvas
  const handleCashEarned = useCallback((amount) => {
    soundEngine.play('cashRegister');
    dirtyCashRef.current += amount;
    setState((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      totalEarned: prev.totalEarned + amount
    }));
  }, []);

  const handleVipArrive = useCallback(() => {
    soundEngine.play('vipBell');
    setVipAvailable(true);
  }, []);

  // Chạm vào Xe Limousine VIP (Thưởng tiền lớn hoặc x2 doanh thu 2 phút!)
  const handleClaimVip = () => {
    if (!worldRef.current.vipActive && !vipAvailable) return;
    worldRef.current.vipActive = false;
    setVipAvailable(false);
    soundEngine.play('win');

    if (vipBoostLeft <= 0) {
      setVipBoostLeft(120);
      showToast('Nhà đầu tư VIP kích hoạt x2 DOANH THU trong 2 phút!');
    } else {
      const bonus = Math.max(150, Math.round(estimateIncomePerMin(stateRef.current) * 1.5));
      const next = {
        ...stateRef.current,
        cash: stateRef.current.cash + bonus,
        totalEarned: stateRef.current.totalEarned + bonus
      };
      setState(next);
      flushToFirebase(next);
      showToast(`Nhà đầu tư VIP tặng ngay +$${formatMoney(bonus)}!`);
    }
  };

  // Chạm Xe Tải Giao Hàng khi đầy hàng
  const handleDispatchDelivery = () => {
    const world = worldRef.current;
    if (world.deliveryProgress < 1 || world.deliveryDispatching) return;
    world.deliveryDispatching = true;
    setDeliveryReady(false);
    soundEngine.play('cashRegister');
    const perMin = estimateIncomePerMin(stateRef.current, { isCoopShift, isVipBoost });
    const capMult = 1 + ((stateRef.current.delivery.capacityLv || 1) - 1) * 0.35;
    const payout = Math.max(80, Math.round(perMin * 0.85 * capMult));
    const next = {
      ...stateRef.current,
      cash: stateRef.current.cash + payout,
      totalEarned: stateRef.current.totalEarned + payout
    };
    setState(next);
    flushToFirebase(next);
    showToast(`Xuất chuyến xe giao hàng thành công! +$${formatMoney(payout)}`);
  };

  // Thu tiền ngoại tuyến (thường hoặc Nhờ Pet quảng bá x2 mỗi 4 tiếng)
  const handleClaimOffline = (usePetX2 = false) => {
    if (!offlineReport) return;
    const earned = offlineReport.earned * (usePetX2 ? 2 : 1);
    soundEngine.play(usePetX2 ? 'win' : 'cashRegister');
    const next = {
      ...stateRef.current,
      cash: stateRef.current.cash + earned,
      totalEarned: stateRef.current.totalEarned + earned,
      petPromoUsedAt: usePetX2 ? Date.now() : stateRef.current.petPromoUsedAt,
      lastTickAt: Date.now()
    };
    setState(next);
    setOfflineReport(null);
    flushToFirebase(next);
    showToast(`Đã nhận +$${formatMoney(earned)} doanh thu vắng mặt!`);
  };

  // Helper tăng đếm đóng góp Co-op
  const bumpContrib = (s) => ({
    ...s.contributions,
    [playerRole]: (s.contributions?.[playerRole] || 0) + 1
  });

  // Nâng cấp Gian hàng (hỗ trợ nhấn giữ)
  const handleUpgradeDept = (dept, buyMode = 'x1') => {
    const cur = stateRef.current;
    const upg = getDeptMultiUpgrade(dept, cur, buyMode);
    if (upg.isMax || cur.cash < upg.cost) {
      soundEngine.play('error');
      return;
    }

    const ds = cur.departments[dept.id] || { level: 0, staff: 1, salaryLv: 1 };
    const nextLv = ds.level + upg.count;
    const next = {
      ...cur,
      cash: cur.cash - upg.cost,
      departments: {
        ...cur.departments,
        [dept.id]: { ...ds, level: nextLv }
      },
      contributions: bumpContrib(cur)
    };
    setState(next);

    const extra = {};
    if (upg.isUnlock) {
      soundEngine.play('buildComplete');
      spawnBuildDust(worldRef.current, dept.gx, dept.gy);
      const now = Date.now();
      extra.logs = [
        {
          id: `log_tycoon_${now}`,
          actor: playerName,
          action: `vừa mở xây gian hàng ${dept.name} tại Siêu Thị Mochi Tycoon!`,
          petComment: `Quầy ${dept.name} mở rồi! Siêu thị tụi mình sắp thành đại gia luôn đó!`,
          timestamp: now
        },
        ...(roomData?.logs || [])
      ].slice(0, 20);
      showToast(`Đã mở xây ${dept.name}!`);
    } else {
      soundEngine.play('upgrade');
    }
    flushToFirebase(next, extra);
  };

  const handleHireDeptStaff = (dept) => {
    const cur = stateRef.current;
    const ds = cur.departments[dept.id];
    if (!ds || ds.level <= 0 || ds.staff >= 4) return;
    const cost = getDeptStaffCost(dept, ds.staff, cur.branchIndex || 0);
    if (cur.cash < cost) return;
    soundEngine.play('upgrade');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      departments: { ...cur.departments, [dept.id]: { ...ds, staff: ds.staff + 1 } },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleUpgradeDeptSalary = (dept) => {
    const cur = stateRef.current;
    const ds = cur.departments[dept.id];
    if (!ds || ds.level <= 0 || ds.salaryLv >= 20) return;
    const cost = getDeptSalaryCost(dept, ds.salaryLv, cur.branchIndex || 0);
    if (cur.cash < cost) return;
    soundEngine.play('upgrade');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      departments: { ...cur.departments, [dept.id]: { ...ds, salaryLv: ds.salaryLv + 1 } },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleUpgradeParkingSlots = () => {
    const cur = stateRef.current;
    if (cur.parking.slots >= 24) return;
    const cost = getParkingSlotCost(cur.parking.slots, cur.branchIndex || 0);
    if (cur.cash < cost) return;
    soundEngine.play('buildComplete');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      parking: { ...cur.parking, slots: cur.parking.slots + 2 },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleUpgradeParkingBarrier = () => {
    const cur = stateRef.current;
    if (cur.parking.barrierLv >= 15) return;
    const cost = getParkingBarrierCost(cur.parking.barrierLv, cur.branchIndex || 0);
    if (cur.cash < cost) return;
    soundEngine.play('upgrade');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      parking: { ...cur.parking, barrierLv: cur.parking.barrierLv + 1 },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleAddCheckoutLane = () => {
    const cur = stateRef.current;
    if (cur.checkout.lanes >= 6) return;
    const cost = getCheckoutLaneCost(cur.checkout.lanes, cur.branchIndex || 0);
    if (cur.cash < cost) return;
    soundEngine.play('buildComplete');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      checkout: { ...cur.checkout, lanes: cur.checkout.lanes + 1 },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleUpgradeCheckoutSpeed = () => {
    const cur = stateRef.current;
    if (cur.checkout.speedLv >= 20) return;
    const cost = getCheckoutSpeedCost(cur.checkout.speedLv, cur.branchIndex || 0);
    if (cur.cash < cost) return;
    soundEngine.play('upgrade');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      checkout: { ...cur.checkout, speedLv: cur.checkout.speedLv + 1 },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleUpgradeResearch = (item) => {
    const cur = stateRef.current;
    const lv = cur.research[item.id] || 0;
    if (lv >= item.maxLevel) return;
    const cost = getResearchCost(item, lv);
    if (cur.cash < cost) return;
    soundEngine.play('upgrade');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      research: { ...cur.research, [item.id]: lv + 1 },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleUpgradeMarketing = (item) => {
    const cur = stateRef.current;
    const lv = cur.marketing[item.id] || 0;
    if (lv >= item.maxLevel) return;
    const cost = getMarketingCost(item, lv);
    if (cur.cash < cost) return;
    soundEngine.play('upgrade');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      marketing: { ...cur.marketing, [item.id]: lv + 1 },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleUpgradeDelivery = (field) => {
    const cur = stateRef.current;
    const lv = cur.delivery[field] || 1;
    if (lv >= 15) return;
    const cost = getDeliveryUpgradeCost(lv, field === 'capacityLv', cur.branchIndex || 0);
    if (cur.cash < cost) return;
    soundEngine.play('upgrade');
    const next = {
      ...cur,
      cash: cur.cash - cost,
      delivery: { ...cur.delivery, [field]: lv + 1 },
      contributions: bumpContrib(cur)
    };
    setState(next);
    flushToFirebase(next);
  };

  const handleMoveBranch = (branch) => {
    const cur = stateRef.current;
    const fresh = createInitialTycoonState(branch.index);
    const next = {
      ...fresh,
      research: cur.research,
      contributions: bumpContrib(cur),
      dailyExchange: cur.dailyExchange,
      missionIndex: cur.missionIndex
    };
    soundEngine.play('buildComplete');
    worldRef.current = createSimulationWorld();
    setState(next);
    setBottomPanel(null);
    const now = Date.now();
    flushToFirebase(next, {
      logs: [
        {
          id: `log_branch_${now}`,
          actor: playerName,
          action: `vừa mở rộng sang chi nhánh "${branch.name}" (x${branch.multiplier} Giá bán)!`,
          petComment: `Chúc mừng khai trương ${branch.name}!! Chủ của con giỏi kinh doanh quá trời!`,
          timestamp: now
        },
        ...(roomData?.logs || [])
      ].slice(0, 20)
    });
    showToast(`Chào mừng đến ${branch.name} (Toàn bộ giá x${branch.multiplier})!`);
  };

  const handleExchangeXu = (tier) => {
    const cur = stateRef.current;
    const today = getTodayStr();
    const daily =
      cur.dailyExchange?.date === today
        ? cur.dailyExchange
        : { date: today, xuClaimed: 0, fridgeClaims: 0 };
    const rem = Math.max(0, TYCOON_DAILY_XU_CAP - daily.xuClaimed);
    if (rem <= 0 || cur.cash < tier.cost) return;
    const actualXu = Math.min(tier.xu, rem);
    soundEngine.play('coin');
    const next = {
      ...cur,
      cash: cur.cash - tier.cost,
      dailyExchange: { ...daily, xuClaimed: daily.xuClaimed + actualXu }
    };
    setState(next);
    flushToFirebase(next, { coins: (roomData?.coins ?? 0) + actualXu });
    showToast(`Đã rút +${actualXu} Xu về ngân quỹ Nhà Chung!`);
  };

  const handleSendToFridge = (ing) => {
    const cur = stateRef.current;
    const today = getTodayStr();
    const daily =
      cur.dailyExchange?.date === today
        ? cur.dailyExchange
        : { date: today, xuClaimed: 0, fridgeClaims: 0 };
    if (daily.fridgeClaims >= TYCOON_DAILY_FRIDGE_CAP || cur.cash < ing.cost) return;
    soundEngine.play('buy');
    const next = {
      ...cur,
      cash: cur.cash - ing.cost,
      dailyExchange: { ...daily, fridgeClaims: daily.fridgeClaims + 1 }
    };
    const curFridge = normalizeFridge(roomData?.fridge);
    const nextFridge = {
      ...curFridge,
      ingredients: {
        ...curFridge.ingredients,
        [ing.id]: (curFridge.ingredients[ing.id] || 0) + 1
      }
    };
    setState(next);
    flushToFirebase(next, { fridge: nextFridge });
    showToast(`Đã gửi +1 ${ing.name} thẳng vào Tủ Lạnh Nhà Bếp!`);
  };

  // Nhiệm vụ dẫn đường hiện tại
  const currentMission = MISSIONS[state.missionIndex] || null;
  const isMissionDone = currentMission ? currentMission.check(state) : false;

  const handleClaimMission = () => {
    if (!currentMission || !isMissionDone) return;
    soundEngine.play('win');
    const next = {
      ...stateRef.current,
      cash: stateRef.current.cash + currentMission.reward,
      totalEarned: stateRef.current.totalEarned + currentMission.reward,
      missionIndex: stateRef.current.missionIndex + 1
    };
    setState(next);
    flushToFirebase(next);
    showToast(`Hoàn thành nhiệm vụ! +$${formatMoney(currentMission.reward)}`);
  };

  const incomePerMin = estimateIncomePerMin(state, { isCoopShift, isVipBoost });
  const repStars = getReputationStars(state);
  const canUsePetPromo = Date.now() - (state.petPromoUsedAt || 0) >= 4 * 60 * 60 * 1000;

  return (
    <div className="fixed inset-0 z-[80] max-w-[430px] mx-auto h-[100dvh] overflow-hidden select-none bg-[#AEE0A0]">
      {/* 1. BẢN ĐỒ ISOMETRIC 2.5D TOÀN MÀN HÌNH 100% */}
      <IsometricCanvas
        worldRef={worldRef}
        stateRef={stateRef}
        isCoopShift={isCoopShift}
        isVipBoost={isVipBoost}
        zoom={zoom}
        selectedTarget={selectedTarget}
        onSelectTarget={(target) => {
          setBottomPanel(null);
          if (target?.type === 'delivery') {
            setSelectedTarget(null);
            setBottomPanel('delivery');
          } else {
            setSelectedTarget(target);
          }
        }}
        onCashEarned={handleCashEarned}
        onVipArrive={handleVipArrive}
        onTapDeliveryVan={handleDispatchDelivery}
        onTapVipCar={handleClaimVip}
      />

      {/* 2. TOP BAR NỔI CHUẨN CODIGAMES */}
      <div
        style={{ top: 'max(env(safe-area-inset-top, 10px), 10px)' }}
        className="fixed inset-x-0 max-w-[430px] mx-auto z-[60] px-3 pointer-events-none flex items-start justify-between gap-2"
      >
        {/* Góc trái: Nút về nhà + Khối Tiền Mặt Xanh */}
        <div className="pointer-events-auto flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              flushToFirebase();
              onExit();
            }}
            className="w-9 h-9 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] shadow-md flex items-center justify-center text-[#4A3525] active:scale-90 shrink-0"
            title="Quay lại Nhà Chung"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-2.5 py-1 rounded-2xl bg-[#FFFDF9]/95 border-2 border-[#4A3525] shadow-md flex items-center gap-1.5">
            {/* Icon tờ tiền xanh đặc trưng Codigames */}
            <div className="w-6 h-5 rounded bg-[#63C784] border-[1.5px] border-[#4A3525] flex items-center justify-center text-[10px] font-black text-[#FFFDF9] shrink-0">
              $
            </div>
            <div className="leading-tight">
              <div className="text-xs font-black text-[#4A3525] tabular-nums">
                {formatMoney(state.cash)}
              </div>
              <div className="text-[9px] font-black text-[#4F9A6D] tabular-nums whitespace-nowrap">
                +{formatMoney(incomePerMin)}/phút
              </div>
            </div>
          </div>
        </div>

        {/* Góc phải: Sao danh tiếng + Xu Nhà Chung + Zoom */}
        <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedTarget(null);
              setBottomPanel('branches');
            }}
            className="px-2 py-1 rounded-2xl bg-[#FFE082] border-2 border-[#4A3525] shadow-md text-[11px] font-black text-[#4A3525] tabular-nums active:scale-95"
            title="Sao danh tiếng mở Chi Nhánh"
          >
            ★ {repStars}
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTarget(null);
              setBottomPanel('vault');
            }}
            className="px-2 py-1 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] shadow-md flex items-center gap-1 text-[11px] font-black text-[#4A3525] tabular-nums active:scale-95"
            title="Quỹ Xu Nhà Chung"
          >
            <Coins className="w-3.5 h-3.5 text-[#E87A4D]" />
            <span>{roomData?.coins ?? 0}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => (z > 0.85 ? 0.72 : 0.96))}
            className="w-8 h-8 rounded-xl bg-[#FFFDF9]/95 border-2 border-[#4A3525] shadow-md flex items-center justify-center text-[#4A3525] active:scale-90"
            title="Thu phóng bản đồ"
          >
            {zoom > 0.85 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. CỤM NÚT NHANH 2 CẠNH (Nhiệm vụ dẫn đường bên trái | Ca trực đôi & VIP bên phải) */}
      <div
        style={{ top: 'calc(max(env(safe-area-inset-top, 10px), 10px) + 48px)' }}
        className="fixed inset-x-0 max-w-[430px] mx-auto z-[58] px-3 pointer-events-none flex items-start justify-between gap-2"
      >
        {/* Cạnh trái: Thẻ Nhiệm Vụ Dẫn Đường */}
        {currentMission ? (
          <button
            type="button"
            onClick={handleClaimMission}
            className={`pointer-events-auto max-w-[205px] px-2.5 py-1.5 rounded-2xl border-2 border-[#4A3525] shadow-md text-left transition-all active:scale-95 ${
              isMissionDone
                ? 'bg-[#63C784] text-[#FFFDF9] animate-pulse'
                : 'bg-[#FFFDF9]/92 text-[#4A3525]'
            }`}
          >
            <div className="text-[9.5px] font-black flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{currentMission.title}</span>
            </div>
            <div
              className={`text-[9px] font-extrabold ${
                isMissionDone ? 'text-[#FFE066]' : 'text-[#5EA87A]'
              }`}
            >
              {isMissionDone
                ? `BẤM NHẬN +$${formatMoney(currentMission.reward)}!`
                : `Thưởng +$${formatMoney(currentMission.reward)}`}
            </div>
          </button>
        ) : (
          <div />
        )}

        {/* Cạnh phải: Huy hiệu Ca Trực Đôi x2 + Nút Khách VIP */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 shrink-0">
          {isCoopShift && (
            <div className="px-2.5 py-1 rounded-full bg-[#FFB7C5] border-2 border-[#4A3525] text-[10px] font-black text-[#4A3525] flex items-center gap-1 shadow animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>Ca Trực Đôi x2</span>
            </div>
          )}

          {isVipBoost && (
            <div className="px-2.5 py-1 rounded-full bg-[#FFE066] border-2 border-[#4A3525] text-[10px] font-black text-[#4A3525] tabular-nums shadow">
              VIP x2 • {vipBoostLeft}s
            </div>
          )}

          {vipAvailable && (
            <button
              type="button"
              onClick={handleClaimVip}
              className="px-2.5 py-1.5 rounded-2xl bg-[#FFE066] border-2 border-[#4A3525] text-[10.5px] font-black text-[#4A3525] flex items-center gap-1 shadow-lg animate-bounce"
            >
              <Crown className="w-3.5 h-3.5 text-[#D97706]" />
              <span>VIP x2!</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast thông báo gọn */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-[75] max-w-[340px] w-[86%] bg-[#4A3525]/92 text-[#FFF8F0] text-xs font-extrabold px-3.5 py-2 rounded-2xl text-center shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. THẺ NÂNG CẤP NGỮ CẢNH KHI CHẠM CÔNG TRÌNH HOẶC NÚT CHỨC NĂNG ĐÁY */}
      <AnimatePresence>
        {selectedTarget?.type === 'department' && (
          <DepartmentPanel
            deptId={selectedTarget.id}
            state={state}
            onClose={() => setSelectedTarget(null)}
            onUpgradeDept={handleUpgradeDept}
            onHireDeptStaff={handleHireDeptStaff}
            onUpgradeDeptSalary={handleUpgradeDeptSalary}
          />
        )}
        {selectedTarget?.type === 'parking' && (
          <ParkingPanel
            state={state}
            onClose={() => setSelectedTarget(null)}
            onUpgradeSlots={handleUpgradeParkingSlots}
            onUpgradeBarrier={handleUpgradeParkingBarrier}
          />
        )}
        {selectedTarget?.type === 'checkout' && (
          <CheckoutPanel
            state={state}
            onClose={() => setSelectedTarget(null)}
            onAddLane={handleAddCheckoutLane}
            onUpgradeSpeed={handleUpgradeCheckoutSpeed}
          />
        )}
        {bottomPanel && (
          <BottomFeaturePanel
            panelType={bottomPanel}
            state={state}
            roomData={roomData}
            onClose={() => setBottomPanel(null)}
            onUpgradeResearch={handleUpgradeResearch}
            onUpgradeMarketing={handleUpgradeMarketing}
            onUpgradeDelivery={handleUpgradeDelivery}
            onDispatchDelivery={handleDispatchDelivery}
            deliveryReady={deliveryReady}
            onMoveBranch={handleMoveBranch}
            onExchangeXu={handleExchangeXu}
            onSendToFridge={handleSendToFridge}
          />
        )}
      </AnimatePresence>

      {/* 5. THANH 5 NÚT CHỨC NĂNG NỔI DƯỚI ĐÁY (BOTTOM ACTION BAR CHUẨN CODIGAMES) */}
      <div
        style={{ bottom: 'max(env(safe-area-inset-bottom, 10px), 10px)' }}
        className="fixed inset-x-0 max-w-[430px] mx-auto z-[62] px-3 pointer-events-none"
      >
        <div className="pointer-events-auto grid grid-cols-5 gap-1.5">
          {[
            { id: 'research', label: 'Nghiên Cứu', icon: Lightbulb, bg: 'bg-[#FFE082]' },
            { id: 'marketing', label: 'Marketing', icon: Megaphone, bg: 'bg-[#FFB7C5]' },
            { id: 'delivery', label: 'Giao Hàng', icon: Truck, bg: 'bg-[#FF9B71]', dot: deliveryReady },
            { id: 'branches', label: 'Chi Nhánh', icon: Map, bg: 'bg-[#C792EA]' },
            { id: 'vault', label: 'Quỹ Nhà', icon: Coins, bg: 'bg-[#88C9A1]' }
          ].map((btn) => {
            const IconComp = btn.icon;
            const active = bottomPanel === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  soundEngine.play('tap');
                  setSelectedTarget(null);
                  setBottomPanel((prev) => (prev === btn.id ? null : btn.id));
                }}
                className={`relative py-2 px-1 rounded-2xl border-2 border-b-4 border-[#4A3525] flex flex-col items-center justify-center gap-0.5 shadow-md active:translate-y-0.5 transition-all ${
                  active ? 'ring-2 ring-[#FFFDF9] -translate-y-1' : ''
                } ${btn.bg}`}
              >
                {btn.dot && (
                  <span className="absolute -top-1.5 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF5A5F] border-2 border-[#FFFDF9] animate-bounce" />
                )}
                <IconComp className="w-4.5 h-4.5 text-[#4A3525]" />
                <span className="text-[9.5px] font-black text-[#4A3525] leading-tight whitespace-nowrap">
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. POPUP DOANH THU NGOẠI TUYẾN */}
      <OfflineEarningsModal
        offlineReport={offlineReport}
        petName={petName}
        canUsePetPromo={canUsePetPromo}
        onClaimNormal={() => handleClaimOffline(false)}
        onClaimWithPetX2={() => handleClaimOffline(true)}
      />
    </div>
  );
}
