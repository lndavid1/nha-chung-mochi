// Cấu hình đầy đủ cho "Siêu Thị Mochi Tycoon" (Chuẩn Idle Supermarket Tycoon - Codigames)

export const TYCOON_DAILY_XU_CAP = 60;
export const TYCOON_DAILY_FRIDGE_CAP = 3;
export const STAR_MILESTONES = [25, 50, 100, 150, 200];
export const MAX_DEPT_LEVEL = 250;

export const DEPARTMENTS = [
  {
    id: 'bakery',
    name: 'Tiệm Bánh',
    en: 'Bakery',
    desc: 'Bánh mì baguette, sừng bò & bánh kem thơm phức',
    unlockCost: 0,
    baseCost: 18,
    basePrice: 12,
    baseServiceSec: 2.8,
    color: '#FFB76B',
    accent: '#FFF0D4',
    gx: 1.5,
    gy: 1.4
  },
  {
    id: 'produce',
    name: 'Rau Củ & Trái Cây',
    en: 'Produce',
    desc: 'Táo đỏ, cà rốt, bí đỏ & rau xanh hữu cơ',
    unlockCost: 220,
    baseCost: 110,
    basePrice: 36,
    baseServiceSec: 3.1,
    color: '#7AC98E',
    accent: '#E2F7E7',
    gx: 4.5,
    gy: 1.4
  },
  {
    id: 'butcher',
    name: 'Quầy Thịt Tươi',
    en: 'Butcher',
    desc: 'Tủ kính thịt bò, ức gà & xúc xích hảo hạng',
    unlockCost: 1400,
    baseCost: 520,
    basePrice: 115,
    baseServiceSec: 3.4,
    color: '#F28482',
    accent: '#FFE5E5',
    gx: 7.5,
    gy: 1.4
  },
  {
    id: 'seafood',
    name: 'Hải Sản & Cá Tươi',
    en: 'Fish Market',
    desc: 'Quầy đá lạnh cá hồi Na Uy, tôm sú & mực tươi',
    unlockCost: 6500,
    baseCost: 2200,
    basePrice: 340,
    baseServiceSec: 3.7,
    color: '#67B7E8',
    accent: '#DFF2FD',
    gx: 1.5,
    gy: 4.5
  },
  {
    id: 'perfume',
    name: 'Nước Hoa & Mỹ Phẩm',
    en: 'Perfume',
    desc: 'Quầy kính sang trọng nước hoa pastel & dưỡng da',
    unlockCost: 28000,
    baseCost: 8800,
    basePrice: 980,
    baseServiceSec: 4.0,
    color: '#C792EA',
    accent: '#F3E5FD',
    gx: 4.5,
    gy: 4.5
  },
  {
    id: 'electronics',
    name: 'Đồ Điện Tử',
    en: 'Electronics',
    desc: 'Tivi, điện thoại thông minh & máy chơi game cao cấp',
    unlockCost: 120000,
    baseCost: 34000,
    basePrice: 2900,
    baseServiceSec: 4.3,
    color: '#6C8CEB',
    accent: '#E3EAFF',
    gx: 7.5,
    gy: 4.5
  }
];

export const RESEARCH_LIST = [
  {
    id: 'priceBoost',
    name: 'Chất Lượng Sản Phẩm',
    desc: 'Tăng +25% giá bán cho toàn bộ 6 gian hàng mỗi cấp',
    maxLevel: 12,
    baseCost: 350,
    growth: 2.35
  },
  {
    id: 'walkSpeed',
    name: 'Xe Đẩy Siêu Mượt',
    desc: 'Tăng +20% tốc độ di chuyển của khách trong siêu thị',
    maxLevel: 8,
    baseCost: 280,
    growth: 2.2
  },
  {
    id: 'cashierTip',
    name: 'Thẻ Thành Viên VIP',
    desc: 'Tăng +30% tiền tip & thưởng thêm tại quầy thu ngân',
    maxLevel: 10,
    baseCost: 420,
    growth: 2.4
  },
  {
    id: 'offlineCap',
    name: 'Quản Lý Ca Đêm Offline',
    desc: 'Tăng trần tích lũy doanh thu ngoại tuyến (2h → 4h → 8h → 12h)',
    maxLevel: 3,
    fixedCosts: [500, 3200, 18000]
  }
];

export const MARKETING_LIST = [
  {
    id: 'flyers',
    name: 'Phát Tờ Rơi Khu Phố',
    desc: 'Tăng +25% lượng xe hơi rẽ vào bãi đỗ xe',
    maxLevel: 8,
    baseCost: 180,
    growth: 2.0
  },
  {
    id: 'radio',
    name: 'Quảng Cáo Radio Giờ Cao Điểm',
    desc: 'Tăng +40% lưu lượng xe & giảm thời gian chờ khách mới',
    maxLevel: 8,
    baseCost: 950,
    growth: 2.25
  },
  {
    id: 'billboard',
    name: 'Biển Billboard Đại Lộ',
    desc: 'Tăng +65% lượng khách & tăng tần suất xe Limousine VIP',
    maxLevel: 6,
    baseCost: 4500,
    growth: 2.5
  },
  {
    id: 'tvSocial',
    name: 'Quảng Cáo TV & Mạng Xã Hội',
    desc: 'Bùng nổ +100% khách hàng & tăng giá trị giỏ hàng',
    maxLevel: 5,
    baseCost: 22000,
    growth: 2.8
  }
];

export const BRANCHES = [
  {
    index: 0,
    name: 'Cửa Hàng Khu Phố',
    multiplier: 1,
    reqStars: 0,
    reqCash: 0,
    roofColor: '#4DA8DA',
    desc: 'Siêu thị khởi nghiệp ấm cúng đầu tiên của hai bạn'
  },
  {
    index: 1,
    name: 'Siêu Thị Quận',
    multiplier: 3,
    reqStars: 6,
    reqCash: 18000,
    roofColor: '#FF9B71',
    desc: 'Mặt bằng lớn hơn — Toàn bộ giá bán nhân x3 vĩnh viễn!'
  },
  {
    index: 2,
    name: 'Đại Siêu Thị Thành Phố',
    multiplier: 10,
    reqStars: 14,
    reqCash: 180000,
    roofColor: '#5EA87A',
    desc: 'Siêu thị trung tâm sầm uất — Toàn bộ giá bán nhân x10!'
  },
  {
    index: 3,
    name: 'Tổ Hợp Trung Tâm Thương Mại',
    multiplier: 30,
    reqStars: 22,
    reqCash: 1500000,
    roofColor: '#9B72CF',
    desc: 'Đế chế bán lẻ đỉnh cao — Toàn bộ giá bán nhân x30!'
  }
];

export const XU_EXCHANGE_TIERS = [
  { id: 'xu_15', xu: 15, cost: 400, label: '+15 Xu' },
  { id: 'xu_25', xu: 25, cost: 2200, label: '+25 Xu' },
  { id: 'xu_35', xu: 35, cost: 9000, label: '+35 Xu' }
];

export const FRIDGE_PERK_ITEMS = [
  { id: 'carrot', name: 'Cà Rốt Ngọt', cost: 220 },
  { id: 'pumpkin', name: 'Bí Đỏ Béo', cost: 220 },
  { id: 'chicken', name: 'Ức Gà Tươi', cost: 340 },
  { id: 'catnip', name: 'Cỏ Mèo / Phô Mai', cost: 550 },
  { id: 'shrimp', name: 'Tôm Sú Tươi', cost: 680 },
  { id: 'salmon', name: 'Cá Hồi Na Uy', cost: 800 }
];

// Chuỗi 20 Nhiệm vụ dẫn đường chuẩn Codigames
export const MISSIONS = [
  { id: 'm1', title: 'Nâng Tiệm Bánh lên Lv.5', reward: 120, check: (s) => (s.departments.bakery?.level || 0) >= 5 },
  { id: 'm2', title: 'Mở rộng Bãi Đỗ Xe lên 6 ô', reward: 180, check: (s) => (s.parking.slots || 4) >= 6 },
  { id: 'm3', title: 'Mở Quầy Rau Củ & Trái Cây', reward: 320, check: (s) => (s.departments.produce?.level || 0) >= 1 },
  { id: 'm4', title: 'Tuyển Thu Ngân thứ 2', reward: 450, check: (s) => (s.checkout.lanes || 1) >= 2 },
  { id: 'm5', title: 'Chạy Marketing Phát Tờ Rơi Lv.1', reward: 400, check: (s) => (s.marketing.flyers || 0) >= 1 },
  { id: 'm6', title: 'Nâng Tiệm Bánh đạt 1 Sao (Lv.25)', reward: 850, check: (s) => (s.departments.bakery?.level || 0) >= 25 },
  { id: 'm7', title: 'Tuyển thêm nhân viên Tiệm Bánh (2/4)', reward: 700, check: (s) => (s.departments.bakery?.staff || 1) >= 2 },
  { id: 'm8', title: 'Mở Quầy Thịt Tươi', reward: 1200, check: (s) => (s.departments.butcher?.level || 0) >= 1 },
  { id: 'm9', title: 'Mở rộng Bãi Đỗ Xe lên 10 ô', reward: 1500, check: (s) => (s.parking.slots || 4) >= 10 },
  { id: 'm10', title: 'Nghiên cứu Chất Lượng Sản Phẩm Lv.1', reward: 1600, check: (s) => (s.research.priceBoost || 0) >= 1 },
  { id: 'm11', title: 'Tuyển Thu Ngân thứ 3', reward: 2400, check: (s) => (s.checkout.lanes || 1) >= 3 },
  { id: 'm12', title: 'Nâng Quầy Rau Củ đạt 1 Sao (Lv.25)', reward: 3000, check: (s) => (s.departments.produce?.level || 0) >= 25 },
  { id: 'm13', title: 'Mở Quầy Hải Sản & Cá Tươi', reward: 5500, check: (s) => (s.departments.seafood?.level || 0) >= 1 },
  { id: 'm14', title: 'Nâng Xe Tải Giao Hàng sức chứa Lv.3', reward: 6500, check: (s) => (s.delivery.capacityLv || 1) >= 3 },
  { id: 'm15', title: 'Nâng Tiệm Bánh đạt 2 Sao (Lv.50)', reward: 9500, check: (s) => (s.departments.bakery?.level || 0) >= 50 },
  { id: 'm16', title: 'Mở Quầy Nước Hoa & Mỹ Phẩm', reward: 18000, check: (s) => (s.departments.perfume?.level || 0) >= 1 },
  { id: 'm17', title: 'Mở rộng Bãi Đỗ Xe lên 16 ô', reward: 24000, check: (s) => (s.parking.slots || 4) >= 16 },
  { id: 'm18', title: 'Tuyển Thu Ngân thứ 5', reward: 35000, check: (s) => (s.checkout.lanes || 1) >= 5 },
  { id: 'm19', title: 'Mở Quầy Đồ Điện Tử', reward: 75000, check: (s) => (s.departments.electronics?.level || 0) >= 1 },
  { id: 'm20', title: 'Mở Chi Nhánh Siêu Thị Quận (x3 Giá)', reward: 50000, check: (s) => (s.branchIndex || 0) >= 1 }
];

export function formatMoney(val) {
  const n = Math.floor(Number(val) || 0);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2).replace(/\.00$/, '')}K`;
  return String(n);
}

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialTycoonState(branchIndex = 0) {
  const today = getTodayStr();
  const mult = BRANCHES[branchIndex]?.multiplier || 1;
  return {
    cash: 85 * mult,
    totalEarned: 85 * mult,
    branchIndex,
    departments: {
      bakery: { level: 1, staff: 1, salaryLv: 1 },
      produce: { level: 0, staff: 1, salaryLv: 1 },
      butcher: { level: 0, staff: 1, salaryLv: 1 },
      seafood: { level: 0, staff: 1, salaryLv: 1 },
      perfume: { level: 0, staff: 1, salaryLv: 1 },
      electronics: { level: 0, staff: 1, salaryLv: 1 }
    },
    parking: { slots: 4, barrierLv: 1 },
    checkout: { lanes: 1, speedLv: 1 },
    delivery: { capacityLv: 1, speedLv: 1, progress: 0 },
    research: { priceBoost: 0, walkSpeed: 0, cashierTip: 0, offlineCap: 0 },
    marketing: { flyers: 0, radio: 0, billboard: 0, tvSocial: 0 },
    missionIndex: 0,
    petPromoUsedAt: 0,
    lastTickAt: Date.now(),
    contributions: { player1: 0, player2: 0 },
    dailyExchange: { date: today, xuClaimed: 0, fridgeClaims: 0 },
    activeInMart: { player1: false, player2: false }
  };
}

export function normalizeTycoonState(raw) {
  const base = createInitialTycoonState(raw?.branchIndex || 0);
  if (!raw || typeof raw !== 'object') return base;
  const today = getTodayStr();
  const daily =
    raw.dailyExchange?.date === today
      ? {
          date: today,
          xuClaimed: Number(raw.dailyExchange.xuClaimed || 0),
          fridgeClaims: Number(raw.dailyExchange.fridgeClaims || 0)
        }
      : { date: today, xuClaimed: 0, fridgeClaims: 0 };

  const depts = {};
  DEPARTMENTS.forEach((d) => {
    depts[d.id] = {
      ...base.departments[d.id],
      ...(raw.departments?.[d.id] || {})
    };
  });

  return {
    ...base,
    ...raw,
    cash: Number(raw.cash ?? base.cash),
    totalEarned: Number(raw.totalEarned ?? base.totalEarned),
    branchIndex: Number(raw.branchIndex || 0),
    departments: depts,
    parking: { ...base.parking, ...(raw.parking || {}) },
    checkout: { ...base.checkout, ...(raw.checkout || {}) },
    delivery: { ...base.delivery, ...(raw.delivery || {}) },
    research: { ...base.research, ...(raw.research || {}) },
    marketing: { ...base.marketing, ...(raw.marketing || {}) },
    missionIndex: Number(raw.missionIndex || 0),
    petPromoUsedAt: Number(raw.petPromoUsedAt || 0),
    lastTickAt: Number(raw.lastTickAt || Date.now()),
    contributions: { ...base.contributions, ...(raw.contributions || {}) },
    dailyExchange: daily,
    activeInMart: { ...base.activeInMart, ...(raw.activeInMart || {}) }
  };
}

// ---------- Công thức cân bằng ----------
export function getDeptStarInfo(level) {
  let stars = 0;
  let prevMilestone = 0;
  let nextMilestone = STAR_MILESTONES[0];
  for (let i = 0; i < STAR_MILESTONES.length; i++) {
    if (level >= STAR_MILESTONES[i]) {
      stars = i + 1;
      prevMilestone = STAR_MILESTONES[i];
      nextMilestone = STAR_MILESTONES[i + 1] || MAX_DEPT_LEVEL;
    } else {
      nextMilestone = STAR_MILESTONES[i];
      break;
    }
  }
  const starMult = Math.pow(2, stars);
  const progressPct =
    nextMilestone > prevMilestone
      ? Math.min(100, Math.round(((level - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
      : 100;
  return { stars, starMult, prevMilestone, nextMilestone, progressPct };
}

export function getDeptPrice(deptDef, state) {
  const ds = state.departments[deptDef.id] || { level: 0, staff: 1, salaryLv: 1 };
  if (ds.level <= 0) return 0;
  const branchMult = BRANCHES[state.branchIndex || 0]?.multiplier || 1;
  const { starMult } = getDeptStarInfo(ds.level);
  const researchMult = 1 + (state.research.priceBoost || 0) * 0.25;
  const tipMult = 1 + (state.research.cashierTip || 0) * 0.15;
  const tvMult = 1 + (state.marketing.tvSocial || 0) * 0.12;
  return Math.max(
    1,
    Math.round(deptDef.basePrice * (1 + (ds.level - 1) * 0.38) * starMult * branchMult * researchMult * tipMult * tvMult)
  );
}

export function getDeptServiceSec(deptDef, deptState) {
  const salaryLv = deptState?.salaryLv || 1;
  return Math.max(0.7, Number((deptDef.baseServiceSec / (1 + (salaryLv - 1) * 0.14)).toFixed(2)));
}

export function getDeptSingleLevelCost(deptDef, level, branchIndex = 0) {
  const branchScale = Math.pow(2.4, branchIndex);
  if (level <= 0) return Math.round(deptDef.unlockCost * branchScale);
  return Math.round(deptDef.baseCost * branchScale * Math.pow(1.135, level));
}

export function getDeptMultiUpgrade(deptDef, state, mode = 'x1') {
  const curLv = state.departments[deptDef.id]?.level || 0;
  const branchIndex = state.branchIndex || 0;
  if (curLv <= 0) {
    const cost = getDeptSingleLevelCost(deptDef, 0, branchIndex);
    return { count: 1, cost, isUnlock: true };
  }
  if (curLv >= MAX_DEPT_LEVEL) return { count: 0, cost: 0, isMax: true };

  const targetCount = mode === 'x10' ? 10 : mode === 'max' ? MAX_DEPT_LEVEL - curLv : 1;
  let totalCost = 0;
  let bought = 0;
  for (let i = 0; i < targetCount && curLv + i < MAX_DEPT_LEVEL; i++) {
    const c = getDeptSingleLevelCost(deptDef, curLv + i, branchIndex);
    if (mode === 'max' && bought > 0 && totalCost + c > state.cash) break;
    totalCost += c;
    bought += 1;
    if (mode === 'max' && totalCost > state.cash) break;
  }
  return { count: Math.max(1, bought), cost: totalCost, isUnlock: false, isMax: false };
}

export function getDeptStaffCost(deptDef, curStaff, branchIndex = 0) {
  const branchScale = Math.pow(2.2, branchIndex);
  return Math.round(Math.max(90, deptDef.baseCost * 4.5) * branchScale * Math.pow(2.8, curStaff - 1));
}

export function getDeptSalaryCost(deptDef, salaryLv, branchIndex = 0) {
  const branchScale = Math.pow(2.2, branchIndex);
  return Math.round(Math.max(60, deptDef.baseCost * 2.5) * branchScale * Math.pow(1.65, salaryLv - 1));
}

export function getParkingSlotCost(curSlots, branchIndex = 0) {
  const step = Math.floor((curSlots - 4) / 2);
  return Math.round(110 * Math.pow(2.2, branchIndex) * Math.pow(1.85, step));
}

export function getParkingBarrierCost(barrierLv, branchIndex = 0) {
  return Math.round(90 * Math.pow(2.1, branchIndex) * Math.pow(1.65, barrierLv - 1));
}

export function getCheckoutLaneCost(curLanes, branchIndex = 0) {
  return Math.round(280 * Math.pow(2.3, branchIndex) * Math.pow(3.2, curLanes - 1));
}

export function getCheckoutSpeedCost(speedLv, branchIndex = 0) {
  return Math.round(100 * Math.pow(2.1, branchIndex) * Math.pow(1.6, speedLv - 1));
}

export function getDeliveryUpgradeCost(level, isCapacity, branchIndex = 0) {
  const base = isCapacity ? 260 : 220;
  return Math.round(base * Math.pow(2.2, branchIndex) * Math.pow(1.75, level - 1));
}

export function getResearchCost(item, curLv) {
  if (item.fixedCosts) return item.fixedCosts[curLv] ?? 9999999;
  return Math.round(item.baseCost * Math.pow(item.growth || 2.2, curLv));
}

export function getMarketingCost(item, curLv) {
  return Math.round(item.baseCost * Math.pow(item.growth || 2.1, curLv));
}

export function getOfflineMaxHours(offlineCapLv = 0) {
  return [2, 4, 8, 12][Math.min(3, offlineCapLv)] || 2;
}

export function getReputationStars(state) {
  let total = 0;
  DEPARTMENTS.forEach((d) => {
    const lv = state.departments[d.id]?.level || 0;
    if (lv > 0) total += 1 + getDeptStarInfo(lv).stars;
  });
  total += Math.floor((state.parking.slots - 4) / 6);
  total += Math.max(0, (state.checkout.lanes || 1) - 1);
  return total;
}

// Ước tính thu nhập mỗi phút dựa trên điểm nghẽn thực tế (Bãi đỗ xe, Gian hàng, Thu ngân)
export function estimateIncomePerMin(state, { isCoopShift = false, isVipBoost = false } = {}) {
  const unlocked = DEPARTMENTS.filter((d) => (state.departments[d.id]?.level || 0) > 0);
  if (unlocked.length === 0) return 0;

  const avgBasket =
    unlocked.reduce((sum, d) => sum + getDeptPrice(d, state), 0) / unlocked.length;

  // 1. Lưu lượng xe vào bãi đỗ (xe/phút)
  const mktBoost =
    1 +
    (state.marketing.flyers || 0) * 0.25 +
    (state.marketing.radio || 0) * 0.4 +
    (state.marketing.billboard || 0) * 0.65 +
    (state.marketing.tvSocial || 0) * 1.0;
  const parkingCapPerMin = Math.min(state.parking.slots * 2.4, 8 * mktBoost * (1 + (state.parking.barrierLv - 1) * 0.12));

  // 2. Công suất gian hàng (khách/phút)
  const deptCapPerMin = unlocked.reduce((sum, d) => {
    const ds = state.departments[d.id];
    return sum + (60 / getDeptServiceSec(d, ds)) * (ds.staff || 1);
  }, 0);

  // 3. Công suất thu ngân (khách/phút)
  const scanSec = Math.max(0.55, 2.6 / (1 + ((state.checkout.speedLv || 1) - 1) * 0.16));
  const checkoutCapPerMin = (60 / scanSec) * (state.checkout.lanes || 1);

  const effectiveCustomersPerMin = Math.min(parkingCapPerMin, deptCapPerMin, checkoutCapPerMin);
  const mult = (isCoopShift ? 2 : 1) * (isVipBoost ? 2 : 1);
  return Math.max(10, Math.round(effectiveCustomersPerMin * avgBasket * mult));
}

export function computeTycoonOfflineEarnings(state, now = Date.now()) {
  const maxHours = getOfflineMaxHours(state.research.offlineCap || 0);
  const rawElapsedSec = Math.max(0, (now - (state.lastTickAt || now)) / 1000);
  const cappedSec = Math.min(rawElapsedSec, maxHours * 3600);
  const perMin = estimateIncomePerMin(state, { isCoopShift: false, isVipBoost: false });
  const earned = Math.floor((cappedSec / 60) * perMin * 0.72);
  return {
    elapsedSec: Math.floor(cappedSec),
    earned,
    maxHours,
    isFull: rawElapsedSec >= maxHours * 3600 * 0.95
  };
}
