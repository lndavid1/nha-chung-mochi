import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Users,
  TrendingUp,
  Car,
  CreditCard,
  Truck,
  Lightbulb,
  Megaphone,
  Map,
  Coins,
  Refrigerator,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import {
  DEPARTMENTS,
  RESEARCH_LIST,
  MARKETING_LIST,
  BRANCHES,
  XU_EXCHANGE_TIERS,
  FRIDGE_PERK_ITEMS,
  TYCOON_DAILY_XU_CAP,
  TYCOON_DAILY_FRIDGE_CAP,
  formatMoney,
  getDeptStarInfo,
  getDeptPrice,
  getDeptServiceSec,
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
  getTodayStr
} from './tycoonConfig';
import { CookingIconSvg, StarRatingSvg } from '../../../data/cookingData';

// Wrapper thẻ nổi Codigames ở nửa dưới màn hình (không chiếm toàn bộ bản đồ)
function FloatingCard({ title, subtitle, accent = '#4DA8DA', onClose, children }) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      style={{
        bottom: 'calc(max(env(safe-area-inset-bottom, 10px), 10px) + 74px)'
      }}
      className="fixed inset-x-3 z-[65] max-w-[406px] mx-auto max-h-[56dvh] bg-[#FFFDF9] rounded-[26px] border-[2.5px] border-[#4A3525] shadow-2xl flex flex-col overflow-hidden"
    >
      <div
        style={{ backgroundColor: accent }}
        className="px-4 py-2.5 border-b-2 border-[#4A3525] flex items-center justify-between shrink-0"
      >
        <div className="min-w-0">
          <h3 className="text-sm font-black text-[#4A3525] truncate leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-[10.5px] font-extrabold text-[#4A3525]/80 truncate">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3.5 overflow-y-auto custom-scroll flex-1">{children}</div>
    </motion.div>
  );
}

// =========================================================================
// 1. THẺ GIAN HÀNG (Department Panel — hỗ trợ NHẤN GIỮ nâng cấp + x1/x10/Max)
// =========================================================================
export function DepartmentPanel({
  deptId,
  state,
  onClose,
  onUpgradeDept,
  onHireDeptStaff,
  onUpgradeDeptSalary
}) {
  const [buyMode, setBuyMode] = useState('x1'); // 'x1' | 'x10' | 'max'
  const holdTimerRef = useRef(null);
  const holdIntervalRef = useRef(null);

  const dept = DEPARTMENTS.find((d) => d.id === deptId);
  if (!dept) return null;

  const ds = state.departments[deptId] || { level: 0, staff: 1, salaryLv: 1 };
  const starInfo = getDeptStarInfo(ds.level);
  const upg = getDeptMultiUpgrade(dept, state, buyMode);
  const canAffordUpg = !upg.isMax && state.cash >= upg.cost;

  const staffCost = getDeptStaffCost(dept, ds.staff, state.branchIndex || 0);
  const canHireStaff = ds.level > 0 && ds.staff < 4 && state.cash >= staffCost;

  const salaryCost = getDeptSalaryCost(dept, ds.salaryLv, state.branchIndex || 0);
  const canTrainSalary = ds.level > 0 && ds.salaryLv < 20 && state.cash >= salaryCost;

  const stopHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdTimerRef.current = null;
    holdIntervalRef.current = null;
  };

  useEffect(() => () => stopHold(), []);

  const startHoldUpgrade = () => {
    onUpgradeDept(dept, buyMode);
    stopHold();
    holdTimerRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        onUpgradeDept(dept, buyMode);
      }, 115);
    }, 340);
  };

  return (
    <FloatingCard
      title={`${dept.name}${ds.level > 0 ? ` • Lv.${ds.level}` : ' (Chưa mở)'}`}
      subtitle={dept.desc}
      accent={dept.color}
      onClose={onClose}
    >
      <div className="space-y-3">
        {ds.level > 0 && (
          <>
            {/* Thanh tiến độ Sao (x2 Doanh thu ở mốc Lv 25, 50, 100, 150, 200) */}
            <div className="p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-black text-[#4A3525]">
                <span className="flex items-center gap-1">
                  <StarRatingSvg quality={Math.min(3, starInfo.stars)} size={13} />
                  <span>{starInfo.stars} Sao (x{starInfo.starMult})</span>
                </span>
                <span className="text-[#5EA87A] tabular-nums">
                  {ds.level}/{starInfo.nextMilestone} → x2 Doanh thu!
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#4A3525]/15 border border-[#4A3525]/40 overflow-hidden">
                <div
                  className="h-full bg-[#FFE066] transition-all duration-150"
                  style={{ width: `${starInfo.progressPct}%` }}
                />
              </div>
            </div>

            {/* 3 Chỉ số rõ ràng */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-[#FFF8F0] border-[1.5px] border-[#4A3525]">
                <div className="text-[9.5px] font-bold text-[#7D6352]">Giá bán/món</div>
                <div className="text-xs font-black text-[#4F9A6D] tabular-nums">
                  ${formatMoney(getDeptPrice(dept, state))}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#FFF8F0] border-[1.5px] border-[#4A3525]">
                <div className="text-[9.5px] font-bold text-[#7D6352]">Phục vụ</div>
                <div className="text-xs font-black text-[#4A3525] tabular-nums">
                  {getDeptServiceSec(dept, ds)}s
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#FFF8F0] border-[1.5px] border-[#4A3525]">
                <div className="text-[9.5px] font-bold text-[#7D6352]">Nhân viên</div>
                <div className="text-xs font-black text-[#E87A4D] tabular-nums">
                  {ds.staff}/4 người
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bộ chọn bước nâng x1 / x10 / Max + Nút NÂNG CẤP màu xanh lá lớn hỗ trợ nhấn giữ */}
        <div className="space-y-1.5">
          {ds.level > 0 && (
            <div className="flex justify-end gap-1">
              {['x1', 'x10', 'max'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setBuyMode(m)}
                  className={`px-2.5 py-0.5 rounded-lg border-[1.5px] border-[#4A3525] text-[10px] font-black uppercase ${
                    buyMode === m ? 'bg-[#FFE082] text-[#4A3525]' : 'bg-[#FFFDF9] text-[#7D6352]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={!canAffordUpg}
            onPointerDown={startHoldUpgrade}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            className={`tactile-btn w-full py-3 rounded-2xl border-2 border-[#4A3525] text-sm font-black flex items-center justify-between px-4 select-none touch-none ${
              upg.isMax
                ? 'bg-[#88C9A1] text-[#4A3525]'
                : canAffordUpg
                ? 'bg-[#63C784] text-[#FFFDF9] shadow-md'
                : 'bg-[#E5DDD4] text-[#7D6352] opacity-70'
            }`}
          >
            <span>
              {upg.isMax
                ? 'ĐÃ ĐẠT CẤP TỐI ĐA!'
                : upg.isUnlock
                ? `MỞ XÂY ${dept.name.toUpperCase()}`
                : `NÂNG CẤP +${upg.count} (Giữ để tăng nhanh)`}
            </span>
            {!upg.isMax && <span className="tabular-nums">${formatMoney(upg.cost)}</span>}
          </button>
        </div>

        {/* Khu quản lý nhân sự gian hàng */}
        {ds.level > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#4A3525]/12">
            <button
              type="button"
              disabled={!canHireStaff}
              onClick={() => onHireDeptStaff(dept)}
              className={`tactile-btn p-2.5 rounded-2xl border-[1.8px] border-[#4A3525] text-left space-y-0.5 ${
                ds.staff >= 4
                  ? 'bg-[#E6F7EC]'
                  : canHireStaff
                  ? 'bg-[#FFE082]'
                  : 'bg-[#F2ECE4] opacity-65'
              }`}
            >
              <div className="text-[11px] font-black text-[#4A3525] flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Tuyển NV ({ds.staff}/4)</span>
              </div>
              <div className="text-[10.5px] font-black text-[#E87A4D] tabular-nums">
                {ds.staff >= 4 ? 'Đã đủ 4/4' : `$${formatMoney(staffCost)}`}
              </div>
            </button>

            <button
              type="button"
              disabled={!canTrainSalary}
              onClick={() => onUpgradeDeptSalary(dept)}
              className={`tactile-btn p-2.5 rounded-2xl border-[1.8px] border-[#4A3525] text-left space-y-0.5 ${
                ds.salaryLv >= 20
                  ? 'bg-[#E6F7EC]'
                  : canTrainSalary
                  ? 'bg-[#CFEAF7]'
                  : 'bg-[#F2ECE4] opacity-65'
              }`}
            >
              <div className="text-[11px] font-black text-[#4A3525] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Đào Tạo Lv.{ds.salaryLv}</span>
              </div>
              <div className="text-[10.5px] font-black text-[#3B82A6] tabular-nums">
                {ds.salaryLv >= 20 ? 'MAX' : `$${formatMoney(salaryCost)}`}
              </div>
            </button>
          </div>
        )}
      </div>
    </FloatingCard>
  );
}

// =========================================================================
// 2. THẺ BÃI ĐỖ XE (Parking Panel)
// =========================================================================
export function ParkingPanel({ state, onClose, onUpgradeSlots, onUpgradeBarrier }) {
  const slots = state.parking.slots || 4;
  const barrierLv = state.parking.barrierLv || 1;
  const slotCost = getParkingSlotCost(slots, state.branchIndex || 0);
  const barrierCost = getParkingBarrierCost(barrierLv, state.branchIndex || 0);

  return (
    <FloatingCard
      title="Bãi Đỗ Xe Siêu Thị"
      subtitle={`Đang mở ${slots}/24 ô đỗ xe • Mở thêm để không mất khách!`}
      accent="#CFEAF7"
      onClose={onClose}
    >
      <div className="space-y-2.5">
        <div className="p-3 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-black text-[#4A3525] flex items-center gap-1.5">
              <Car className="w-4 h-4 text-[#4DA8DA]" />
              <span>Mở rộng thêm +2 ô đỗ ({slots}/24)</span>
            </div>
            <p className="text-[10.5px] font-bold text-[#7D6352]">
              Đón được nhiều xe hơn cùng lúc, tránh báo "Hết chỗ!"
            </p>
          </div>
          <button
            type="button"
            disabled={slots >= 24 || state.cash < slotCost}
            onClick={onUpgradeSlots}
            className={`tactile-btn px-3 py-2 rounded-xl border-[1.8px] border-[#4A3525] text-xs font-black shrink-0 tabular-nums ${
              slots >= 24
                ? 'bg-[#88C9A1]'
                : state.cash >= slotCost
                ? 'bg-[#63C784] text-[#FFFDF9]'
                : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
            }`}
          >
            {slots >= 24 ? 'MAX' : `$${formatMoney(slotCost)}`}
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-black text-[#4A3525]">
              Rào chắn tự động (Lv.{barrierLv}/15)
            </div>
            <p className="text-[10.5px] font-bold text-[#7D6352]">
              Xe hơi rẽ vào &amp; ra bãi nhanh hơn +12%/cấp
            </p>
          </div>
          <button
            type="button"
            disabled={barrierLv >= 15 || state.cash < barrierCost}
            onClick={onUpgradeBarrier}
            className={`tactile-btn px-3 py-2 rounded-xl border-[1.8px] border-[#4A3525] text-xs font-black shrink-0 tabular-nums ${
              barrierLv >= 15
                ? 'bg-[#88C9A1]'
                : state.cash >= barrierCost
                ? 'bg-[#FFE082] text-[#4A3525]'
                : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
            }`}
          >
            {barrierLv >= 15 ? 'MAX' : `$${formatMoney(barrierCost)}`}
          </button>
        </div>
      </div>
    </FloatingCard>
  );
}

// =========================================================================
// 3. THẺ KHU THU NGÂN (Checkout Panel)
// =========================================================================
export function CheckoutPanel({ state, onClose, onAddLane, onUpgradeSpeed }) {
  const lanes = state.checkout.lanes || 1;
  const speedLv = state.checkout.speedLv || 1;
  const laneCost = getCheckoutLaneCost(lanes, state.branchIndex || 0);
  const speedCost = getCheckoutSpeedCost(speedLv, state.branchIndex || 0);
  const scanSec = Math.max(0.55, Number((2.6 / (1 + (speedLv - 1) * 0.16)).toFixed(2)));

  return (
    <FloatingCard
      title="Khu Quầy Thu Ngân"
      subtitle={`${lanes}/6 làn thu ngân đang hoạt động • Tốc độ quét ${scanSec}s/khách`}
      accent="#88C9A1"
      onClose={onClose}
    >
      <div className="space-y-2.5">
        <div className="p-3 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-black text-[#4A3525] flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#5EA87A]" />
              <span>Mở thêm Làn Thu Ngân ({lanes}/6)</span>
            </div>
            <p className="text-[10.5px] font-bold text-[#7D6352]">
              Giải tỏa ùn tắc hàng xếp dài khi siêu thị đông khách
            </p>
          </div>
          <button
            type="button"
            disabled={lanes >= 6 || state.cash < laneCost}
            onClick={onAddLane}
            className={`tactile-btn px-3 py-2 rounded-xl border-[1.8px] border-[#4A3525] text-xs font-black shrink-0 tabular-nums ${
              lanes >= 6
                ? 'bg-[#88C9A1]'
                : state.cash >= laneCost
                ? 'bg-[#63C784] text-[#FFFDF9]'
                : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
            }`}
          >
            {lanes >= 6 ? 'MAX' : `$${formatMoney(laneCost)}`}
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-black text-[#4A3525]">
              Máy Quét Mã Siêu Tốc (Lv.{speedLv}/20)
            </div>
            <p className="text-[10.5px] font-bold text-[#7D6352]">
              Giảm thời gian tính tiền cho toàn bộ các làn thu ngân
            </p>
          </div>
          <button
            type="button"
            disabled={speedLv >= 20 || state.cash < speedCost}
            onClick={onUpgradeSpeed}
            className={`tactile-btn px-3 py-2 rounded-xl border-[1.8px] border-[#4A3525] text-xs font-black shrink-0 tabular-nums ${
              speedLv >= 20
                ? 'bg-[#88C9A1]'
                : state.cash >= speedCost
                ? 'bg-[#FFE082] text-[#4A3525]'
                : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
            }`}
          >
            {speedLv >= 20 ? 'MAX' : `$${formatMoney(speedCost)}`}
          </button>
        </div>
      </div>
    </FloatingCard>
  );
}

// =========================================================================
// 4. 5 BẢNG CHỨC NĂNG ĐÁY (Research | Marketing | Delivery | Branches | Vault)
// =========================================================================
export function BottomFeaturePanel({
  panelType,
  state,
  roomData,
  onClose,
  onUpgradeResearch,
  onUpgradeMarketing,
  onUpgradeDelivery,
  onDispatchDelivery,
  deliveryReady,
  onMoveBranch,
  onExchangeXu,
  onSendToFridge
}) {
  if (panelType === 'research') {
    return (
      <FloatingCard
        title="Nghiên Cứu & Cải Tiến"
        subtitle="Nâng cấp toàn cục áp dụng cho cả siêu thị"
        accent="#FFE082"
        onClose={onClose}
      >
        <div className="space-y-2">
          {RESEARCH_LIST.map((item) => {
            const lv = state.research[item.id] || 0;
            const isMax = lv >= item.maxLevel;
            const cost = getResearchCost(item, lv);
            const can = !isMax && state.cash >= cost;
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-[#4A3525] flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-[#E87A4D] shrink-0" />
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-[#5EA87A] shrink-0">
                      Lv.{lv}/{item.maxLevel}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-[#7D6352] mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  disabled={!can}
                  onClick={() => onUpgradeResearch(item)}
                  className={`tactile-btn px-3 py-2 rounded-xl border-[1.6px] border-[#4A3525] text-[11px] font-black shrink-0 tabular-nums ${
                    isMax
                      ? 'bg-[#88C9A1]'
                      : can
                      ? 'bg-[#63C784] text-[#FFFDF9]'
                      : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
                  }`}
                >
                  {isMax ? 'MAX' : `$${formatMoney(cost)}`}
                </button>
              </div>
            );
          })}
        </div>
      </FloatingCard>
    );
  }

  if (panelType === 'marketing') {
    return (
      <FloatingCard
        title="Chiến Dịch Marketing"
        subtitle="Kéo thêm thật nhiều xe hơi rẽ vào bãi đỗ siêu thị!"
        accent="#FFB7C5"
        onClose={onClose}
      >
        <div className="space-y-2">
          {MARKETING_LIST.map((item) => {
            const lv = state.marketing[item.id] || 0;
            const isMax = lv >= item.maxLevel;
            const cost = getMarketingCost(item, lv);
            const can = !isMax && state.cash >= cost;
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-[#4A3525] flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5 text-[#E85D75] shrink-0" />
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-[#E87A4D] shrink-0">
                      Lv.{lv}/{item.maxLevel}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-[#7D6352] mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  disabled={!can}
                  onClick={() => onUpgradeMarketing(item)}
                  className={`tactile-btn px-3 py-2 rounded-xl border-[1.6px] border-[#4A3525] text-[11px] font-black shrink-0 tabular-nums ${
                    isMax
                      ? 'bg-[#88C9A1]'
                      : can
                      ? 'bg-[#FF9B71] text-[#4A3525]'
                      : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
                  }`}
                >
                  {isMax ? 'MAX' : `$${formatMoney(cost)}`}
                </button>
              </div>
            );
          })}
        </div>
      </FloatingCard>
    );
  }

  if (panelType === 'delivery') {
    const capLv = state.delivery.capacityLv || 1;
    const spdLv = state.delivery.speedLv || 1;
    const capCost = getDeliveryUpgradeCost(capLv, true, state.branchIndex || 0);
    const spdCost = getDeliveryUpgradeCost(spdLv, false, state.branchIndex || 0);
    return (
      <FloatingCard
        title="Đội Xe Tải Giao Hàng"
        subtitle="Chạm xe tải khi đầy hàng để xuất chuyến nhận khoản tiền lớn!"
        accent="#FF9B71"
        onClose={onClose}
      >
        <div className="space-y-2.5">
          {deliveryReady && (
            <button
              type="button"
              onClick={onDispatchDelivery}
              className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FFE066] border-2 border-[#4A3525] text-xs font-black text-[#4A3525] flex items-center justify-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Xe đã đầy hàng! Xuất chuyến nhận tiền ngay!</span>
            </button>
          )}
          <div className="p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-black text-[#4A3525]">
                Thùng Xe Lớn Hơn (Lv.{capLv}/15)
              </div>
              <p className="text-[10px] font-bold text-[#7D6352]">
                Tăng giá trị mỗi chuyến giao hàng thêm +35%
              </p>
            </div>
            <button
              type="button"
              disabled={capLv >= 15 || state.cash < capCost}
              onClick={() => onUpgradeDelivery('capacityLv')}
              className={`tactile-btn px-3 py-2 rounded-xl border-[1.6px] border-[#4A3525] text-xs font-black shrink-0 tabular-nums ${
                capLv >= 15
                  ? 'bg-[#88C9A1]'
                  : state.cash >= capCost
                  ? 'bg-[#63C784] text-[#FFFDF9]'
                  : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
              }`}
            >
              {capLv >= 15 ? 'MAX' : `$${formatMoney(capCost)}`}
            </button>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-black text-[#4A3525]">
                Tốc Độ Đóng Hàng (Lv.{spdLv}/15)
              </div>
              <p className="text-[10px] font-bold text-[#7D6352]">
                Rút ngắn thời gian làm đầy chuyến xe giao hàng
              </p>
            </div>
            <button
              type="button"
              disabled={spdLv >= 15 || state.cash < spdCost}
              onClick={() => onUpgradeDelivery('speedLv')}
              className={`tactile-btn px-3 py-2 rounded-xl border-[1.6px] border-[#4A3525] text-xs font-black shrink-0 tabular-nums ${
                spdLv >= 15
                  ? 'bg-[#88C9A1]'
                  : state.cash >= spdCost
                  ? 'bg-[#FFE082] text-[#4A3525]'
                  : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
              }`}
            >
              {spdLv >= 15 ? 'MAX' : `$${formatMoney(spdCost)}`}
            </button>
          </div>
        </div>
      </FloatingCard>
    );
  }

  if (panelType === 'branches') {
    const stars = getReputationStars(state);
    return (
      <FloatingCard
        title="Bản Đồ Chi Nhánh (Prestige)"
        subtitle={`Hiện tại: ${stars} Sao danh tiếng • Mở chi nhánh lớn để nhân hệ số giá!`}
        accent="#C792EA"
        onClose={onClose}
      >
        <div className="space-y-2">
          {BRANCHES.map((br) => {
            const isCurrent = (state.branchIndex || 0) === br.index;
            const isPast = (state.branchIndex || 0) > br.index;
            const isNext = (state.branchIndex || 0) + 1 === br.index;
            const canUnlock = isNext && stars >= br.reqStars && state.cash >= br.reqCash;

            return (
              <div
                key={br.index}
                className={`p-3 rounded-2xl border-2 border-[#4A3525] space-y-1.5 ${
                  isCurrent ? 'bg-[#FFF3D6]' : 'bg-[#FFF8F0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#4A3525] flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" style={{ color: br.roofColor }} />
                    <span>{br.name}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] text-[10px] font-black text-[#4A3525]">
                    Giá x{br.multiplier}
                  </span>
                </div>
                <p className="text-[10.5px] font-bold text-[#7D6352]">{br.desc}</p>
                {isCurrent ? (
                  <div className="text-[10.5px] font-black text-[#5EA87A]">
                    • Chi nhánh đang quản lý
                  </div>
                ) : isPast ? (
                  <div className="text-[10.5px] font-bold text-[#7D6352]">• Đã vượt qua</div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-extrabold text-[#4A3525]">
                      Yêu cầu: {br.reqStars} Sao • ${formatMoney(br.reqCash)}
                    </span>
                    <button
                      type="button"
                      disabled={!canUnlock}
                      onClick={() => onMoveBranch(br)}
                      className={`tactile-btn px-3 py-1 rounded-xl border-[1.6px] border-[#4A3525] text-[10.5px] font-black ${
                        canUnlock
                          ? 'bg-[#63C784] text-[#FFFDF9]'
                          : 'bg-[#E5DDD4] text-[#7D6352] opacity-65'
                      }`}
                    >
                      Chuyển sang
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FloatingCard>
    );
  }

  // panelType === 'vault' (Quỹ Nhà Chung: Đổi Xu + Trích Hàng Tươi Về Tủ Lạnh)
  const today = getTodayStr();
  const dailyEx =
    state.dailyExchange?.date === today
      ? state.dailyExchange
      : { date: today, xuClaimed: 0, fridgeClaims: 0 };

  return (
    <FloatingCard
      title="Quỹ Nhà Chung & Kho Bếp"
      subtitle={`Ngân quỹ phòng: ${roomData?.coins ?? 0} Xu • Cầu nối siêu thị về nhà`}
      accent="#88C9A1"
      onClose={onClose}
    >
      <div className="space-y-3">
        {/* Rút lãi thành Xu Nhà Chung */}
        <div className="p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-[#4A3525]">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-[#E87A4D]" />
              Rút Lãi Về Xu Phòng
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] text-[10px] tabular-nums">
              {dailyEx.xuClaimed}/{TYCOON_DAILY_XU_CAP} Xu/ngày
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {XU_EXCHANGE_TIERS.map((t) => {
              const disabled = dailyEx.xuClaimed >= TYCOON_DAILY_XU_CAP || state.cash < t.cost;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onExchangeXu(t)}
                  className={`tactile-btn py-2 rounded-xl border-[1.6px] border-[#4A3525] flex flex-col items-center ${
                    disabled ? 'bg-[#E5DDD4] opacity-60' : 'bg-[#FFE082]'
                  }`}
                >
                  <span className="text-xs font-black text-[#4A3525]">{t.label}</span>
                  <span className="text-[10px] font-extrabold text-[#7D6352] tabular-nums">
                    ${formatMoney(t.cost)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trích hàng tươi gửi thẳng vào Tủ Lạnh Nhà Bếp */}
        <div className="p-2.5 rounded-2xl bg-[#EEF9F2] border-[1.8px] border-[#4A3525] space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-[#4A3525]">
            <span className="flex items-center gap-1">
              <Refrigerator className="w-3.5 h-3.5 text-[#5EA87A]" />
              Gửi Nguyên Liệu Về Tủ Lạnh Bếp
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFFDF9] border border-[#4A3525] text-[10px] tabular-nums">
              {dailyEx.fridgeClaims}/{TYCOON_DAILY_FRIDGE_CAP} lượt
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {FRIDGE_PERK_ITEMS.map((ing) => {
              const disabled =
                dailyEx.fridgeClaims >= TYCOON_DAILY_FRIDGE_CAP || state.cash < ing.cost;
              return (
                <button
                  key={ing.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSendToFridge(ing)}
                  className={`tactile-btn p-1.5 rounded-xl border-[1.5px] border-[#4A3525] flex flex-col items-center text-center ${
                    disabled ? 'bg-[#FFFDF9]/50 opacity-55' : 'bg-[#FFFDF9]'
                  }`}
                >
                  <CookingIconSvg id={ing.id} className="w-7 h-7" />
                  <span className="text-[9.5px] font-black text-[#4A3525] line-clamp-1">
                    {ing.name}
                  </span>
                  <span className="text-[9.5px] font-black text-[#E87A4D] tabular-nums">
                    ${formatMoney(ing.cost)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </FloatingCard>
  );
}

// =========================================================================
// 5. POPUP BÁO CÁO DOANH THU NGOẠI TUYẾN (Có nút Nhờ Pet quảng bá x2 mỗi 4h!)
// =========================================================================
export function OfflineEarningsModal({
  offlineReport,
  petName = 'Mochi',
  canUsePetPromo,
  onClaimNormal,
  onClaimWithPetX2
}) {
  if (!offlineReport) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#4A3525]/55 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[340px] p-5 rounded-[28px] bg-[#FFF8F0] border-[2.6px] border-[#4A3525] shadow-2xl text-center space-y-3"
      >
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFE082] border-2 border-[#4A3525] flex items-center justify-center">
          <Clock className="w-7 h-7 text-[#4A3525]" />
        </div>
        <h3 className="text-base font-black text-[#4A3525]">
          Báo Cáo Doanh Thu Vắng Mặt
        </h3>
        <p className="text-xs font-bold text-[#7D6352]">
          Trong <strong>{Math.max(1, Math.floor(offlineReport.elapsedSec / 60))} phút</strong> vắng
          mặt (tối đa {offlineReport.maxHours}h), siêu thị đã bán hàng thu về:
        </p>
        <div className="py-2.5 px-4 rounded-2xl bg-[#E6F7EC] border-2 border-[#4A3525] text-2xl font-black text-[#2E9E5B] tabular-nums">
          +${formatMoney(offlineReport.earned)}
        </div>

        <div className="space-y-2 pt-1">
          {canUsePetPromo && (
            <button
              type="button"
              onClick={onClaimWithPetX2}
              className="tactile-btn w-full py-3 rounded-2xl bg-[#FFE066] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5 shadow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nhờ {petName} quảng bá x2 (+${formatMoney(offlineReport.earned * 2)})</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClaimNormal}
            className="tactile-btn w-full py-2.5 rounded-2xl bg-[#63C784] border-2 border-[#4A3525] text-[#FFFDF9] text-sm font-black flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Nhận tiền ngay</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
