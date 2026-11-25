// Cấu hình kinh tế, công thức nâng cấp, đổi Xu & hàng tươi cho Idle Game "Siêu Thị Mochi"

export const MART_DAILY_XU_CAP = 60;
export const MART_DAILY_FRIDGE_CAP = 3;
export const MAX_STALL_LEVEL = 50;

export const STALLS = [
  {
    id: 'bakery',
    name: 'Quầy Sữa & Bánh Mì',
    desc: 'Sữa tươi & bánh mì nóng hổi, vòng quay siêu nhanh',
    unlockCost: 0,
    baseCost: 28,
    baseIncome: 3,
    color: '#FFE8B6',
    pos: { x: 18, y: 26 }
  },
  {
    id: 'veggie',
    name: 'Quầy Rau Củ Tươi',
    desc: 'Cà rốt, bí đỏ hữu cơ tươi rói từ nông trại',
    unlockCost: 150,
    baseCost: 150,
    baseIncome: 12,
    color: '#C7EBD6',
    pos: { x: 50, y: 26 }
  },
  {
    id: 'boba',
    name: 'Quầy Trà Sữa & Bánh Ngọt',
    desc: 'Trà sữa trân châu & bánh kem dâu khách xếp hàng dài',
    unlockCost: 800,
    baseCost: 800,
    baseIncome: 48,
    color: '#FFD6E3',
    pos: { x: 82, y: 26 }
  },
  {
    id: 'seafood',
    name: 'Quầy Hải Sản Tươi',
    desc: 'Cá hồi Na Uy & tôm sú tươi rói giá trị cao',
    unlockCost: 3500,
    baseCost: 3500,
    baseIncome: 185,
    color: '#CFEAF7',
    pos: { x: 18, y: 54 }
  },
  {
    id: 'petshop',
    name: 'Quầy Pate & Đồ Chơi Pet',
    desc: 'Thiên đường Pate nhà làm & cuộn len cho thú cưng',
    unlockCost: 15000,
    baseCost: 15000,
    baseIncome: 700,
    color: '#FFE0C2',
    pos: { x: 50, y: 54 }
  },
  {
    id: 'gift',
    name: 'Quầy Quà Tặng Cao Cấp',
    desc: 'Hộp quà lấp lánh, nến thơm & gấu bông hạng sang',
    unlockCost: 60000,
    baseCost: 60000,
    baseIncome: 2650,
    color: '#E5D4FA',
    pos: { x: 82, y: 54 }
  }
];

export const STAFF_LIST = [
  {
    id: 'cashier',
    name: 'Thu Ngân Mèo Cam',
    desc: 'Tăng tốc tính tiền • Lv 5 mở thêm làn thu ngân thứ 2!',
    maxLevel: 15,
    baseCost: 120,
    growth: 1.65
  },
  {
    id: 'stocker',
    name: 'Capybara Tiếp Hàng',
    desc: 'Tăng +15% doanh thu thụ động mỗi cấp cho cả 6 quầy',
    maxLevel: 15,
    baseCost: 220,
    growth: 1.72
  },
  {
    id: 'promoter',
    name: 'Cún Corgi Phát Tờ Rơi',
    desc: 'Tăng lượng khách vào cửa & tỉ lệ gặp Khách VIP',
    maxLevel: 10,
    baseCost: 300,
    growth: 1.8
  },
  {
    id: 'manager',
    name: 'Thỏ Quản Lý Offline',
    desc: 'Mở rộng trần tích lũy tiền ngoại tuyến (4h → 8h → 12h)',
    maxLevel: 2,
    fixedCosts: [500, 4500]
  }
];

export const XU_EXCHANGE_TIERS = [
  { id: 'xu_15', xu: 15, cost: 300, label: '+15 Xu' },
  { id: 'xu_25', xu: 25, cost: 1500, label: '+25 Xu' },
  { id: 'xu_35', xu: 35, cost: 6000, label: '+35 Xu' }
];

export const FRIDGE_PERK_ITEMS = [
  { id: 'carrot', name: 'Cà Rốt Ngọt', cost: 180 },
  { id: 'pumpkin', name: 'Bí Đỏ Béo', cost: 180 },
  { id: 'chicken', name: 'Ức Gà Tươi', cost: 260 },
  { id: 'catnip', name: 'Cỏ Mèo / Phô Mai', cost: 420 },
  { id: 'shrimp', name: 'Tôm Sú Tươi', cost: 520 },
  { id: 'salmon', name: 'Cá Hồi Na Uy', cost: 600 }
];

export function formatCash(val) {
  const n = Math.floor(Number(val) || 0);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2).replace(/\.00$/, '')}K`;
  return String(n);
}

export function getTodayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeSupermarket(raw) {
  const today = getTodayDateStr();
  const base = {
    martCash: 60,
    totalEarned: 60,
    stalls: { bakery: 1, veggie: 0, boba: 0, seafood: 0, petshop: 0, gift: 0 },
    staff: { cashier: 1, stocker: 0, promoter: 0, manager: 0 },
    lastTickAt: Date.now(),
    contributions: { player1: 0, player2: 0 },
    dailyExchange: { date: today, xuClaimed: 0, fridgeClaims: 0 },
    activeInMart: { player1: false, player2: false }
  };

  if (!raw || typeof raw !== 'object') return base;

  const daily =
    raw.dailyExchange?.date === today
      ? {
          date: today,
          xuClaimed: Number(raw.dailyExchange.xuClaimed || 0),
          fridgeClaims: Number(raw.dailyExchange.fridgeClaims || 0)
        }
      : { date: today, xuClaimed: 0, fridgeClaims: 0 };

  return {
    martCash: Number(raw.martCash ?? base.martCash),
    totalEarned: Number(raw.totalEarned ?? base.totalEarned),
    stalls: { ...base.stalls, ...(raw.stalls || {}) },
    staff: { ...base.staff, ...(raw.staff || {}) },
    lastTickAt: Number(raw.lastTickAt || Date.now()),
    contributions: { ...base.contributions, ...(raw.contributions || {}) },
    dailyExchange: daily,
    activeInMart: { ...base.activeInMart, ...(raw.activeInMart || {}) }
  };
}

// Hệ số x2 ở các mốc Level 10, 25, 50
export function getStallMilestoneMultiplier(level) {
  let mult = 1;
  if (level >= 10) mult *= 2;
  if (level >= 25) mult *= 2;
  if (level >= 50) mult *= 2;
  return mult;
}

export function getStallUpgradeCost(stall, currentLevel) {
  if (currentLevel <= 0) return stall.unlockCost;
  return Math.round(stall.baseCost * Math.pow(1.22, currentLevel));
}

export function getStallIncomePerSec(stall, level) {
  if (level <= 0) return 0;
  return stall.baseIncome * level * getStallMilestoneMultiplier(level);
}

export function getStaffUpgradeCost(staffDef, currentLevel) {
  if (staffDef.fixedCosts) {
    return staffDef.fixedCosts[currentLevel] ?? 999999;
  }
  return Math.round(staffDef.baseCost * Math.pow(staffDef.growth || 1.7, currentLevel));
}

export function getMaxOfflineHours(managerLevel = 0) {
  if (managerLevel >= 2) return 12;
  if (managerLevel >= 1) return 8;
  return 4;
}

export function getMartTierInfo(stallsMap = {}) {
  const unlockedCount = Object.values(stallsMap).filter((lv) => lv > 0).length;
  if (unlockedCount >= 6) return { tier: 4, title: 'Trung Tâm Thương Mại', unlockedCount };
  if (unlockedCount >= 4) return { tier: 3, title: 'Siêu Thị Mini', unlockedCount };
  if (unlockedCount >= 2) return { tier: 2, title: 'Cửa Hàng Tiện Lợi', unlockedCount };
  return { tier: 1, title: 'Tạp Hóa Nhỏ', unlockedCount };
}

export function computeIncomePerSec(mart, { isCoopShift = false, isRushHour = false } = {}) {
  const baseSum = STALLS.reduce(
    (sum, s) => sum + getStallIncomePerSec(s, mart?.stalls?.[s.id] || 0),
    0
  );
  const stockerMult = 1 + (mart?.staff?.stocker || 0) * 0.15;
  const cashierMult = 1 + Math.max(0, (mart?.staff?.cashier || 1) - 1) * 0.06;
  const promoterMult = 1 + (mart?.staff?.promoter || 0) * 0.08;
  const coopMult = isCoopShift ? 2 : 1;
  const rushMult = isRushHour ? 2 : 1;
  return Math.max(1, Math.round(baseSum * stockerMult * cashierMult * promoterMult * coopMult * rushMult));
}

export function computeOfflineEarnings(mart, now = Date.now()) {
  const maxHours = getMaxOfflineHours(mart?.staff?.manager || 0);
  const maxSec = maxHours * 3600;
  const rawElapsedSec = Math.max(0, (now - (mart?.lastTickAt || now)) / 1000);
  const cappedSec = Math.min(rawElapsedSec, maxSec);
  const basePerSec = computeIncomePerSec(mart, { isCoopShift: false, isRushHour: false });
  // Ngoại tuyến giữ 75% tốc độ thực tế để cân bằng
  const earned = Math.floor(cappedSec * basePerSec * 0.75);
  return {
    elapsedSec: Math.floor(cappedSec),
    earned,
    maxHours,
    isFull: rawElapsedSec >= maxSec * 0.95
  };
}
