// Bộ mô phỏng tác nhân thời gian thực cho "Siêu Thị Mochi Tycoon"
// Xe hơi chạy đường nhựa -> Đỗ xe (báo "Hết chỗ!" nếu đầy) -> Khách đẩy xe -> Gian hàng -> Thu ngân -> Thanh toán

import {
  DEPARTMENTS,
  getDeptPrice,
  getDeptServiceSec,
  formatMoney
} from './tycoonConfig';

const CAR_COLORS = ['#E85D75', '#4DA8DA', '#FFD166', '#FFFDF9', '#7AC98E', '#C792EA'];
const SHOPPER_COLORS = ['#FF9B71', '#67B7E8', '#FFB7C5', '#88C9A1', '#FFE082', '#C792EA'];

// 24 tọa độ ô đỗ xe (3 hàng x 8 cột) gọn gàng trong sân bãi đỗ
export function getParkingSlotCoord(slotIndex) {
  const row = Math.floor(slotIndex / 8); // 0, 1, 2
  const col = slotIndex % 8; // 0..7
  return {
    gx: 2.9 + col * 0.88,
    gy: 9.2 + row * 1.15
  };
}

export function getCheckoutLaneCoord(laneIdx) {
  return {
    gx: 1.7 + laneIdx * 1.25,
    gy: 6.75
  };
}

export function createSimulationWorld() {
  return {
    cars: [], // { id, gx, gy, targetGx, targetGy, color, state, slotIdx, bubble, bubbleTimer, dir }
    shoppers: [], // { id, gx, gy, color, state, deptId, laneIdx, carId, progress, maxProgress, basketValue, hasCart }
    floaters: [], // { id, gx, gy, text, color, life, maxLife }
    dustPuffs: [], // { id, gx, gy, life, maxLife }
    spawnTimer: 0.6,
    deliveryProgress: 0.35, // 0..1
    deliveryVanX: 0.9,
    deliveryDispatching: false,
    doorOpenAmount: 0, // 0..1
    parkingFullTimer: 0,
    checkoutCongested: false,
    vipActive: false,
    vipTimer: 40, // giây tới lượt xe Limousine VIP tiếp theo
    nextId: 1
  };
}

function moveToward(entity, tx, ty, speed, dt) {
  const dx = tx - entity.gx;
  const dy = ty - entity.gy;
  const dist = Math.hypot(dx, dy);
  if (dist <= speed * dt || dist < 0.05) {
    entity.gx = tx;
    entity.gy = ty;
    return true;
  }
  entity.gx += (dx / dist) * speed * dt;
  entity.gy += (dy / dist) * speed * dt;
  return false;
}

export function spawnBuildDust(world, gx, gy) {
  for (let i = 0; i < 10; i++) {
    world.dustPuffs.push({
      id: world.nextId++,
      gx: gx + (Math.random() - 0.5) * 1.6,
      gy: gy + (Math.random() - 0.5) * 1.2,
      life: 0.85,
      maxLife: 0.85
    });
  }
}

export function stepSimulation(world, state, dt, { isCoopShift, isVipBoost, onCashEarned, onVipArrive }) {
  const safeDt = Math.min(dt, 0.05);
  const unlockedDepts = DEPARTMENTS.filter((d) => (state.departments[d.id]?.level || 0) > 0);
  if (unlockedDepts.length === 0) return;

  // 1. Tính tần suất sinh xe hơi theo Marketing & tốc độ rào chắn
  const mktBoost =
    1 +
    (state.marketing.flyers || 0) * 0.25 +
    (state.marketing.radio || 0) * 0.4 +
    (state.marketing.billboard || 0) * 0.65 +
    (state.marketing.tvSocial || 0) * 1.0;
  const spawnInterval = Math.max(0.85, 3.3 / (mktBoost * (1 + ((state.parking.barrierLv || 1) - 1) * 0.1)));

  world.spawnTimer -= safeDt;
  if (world.spawnTimer <= 0 && world.cars.length < 28) {
    world.spawnTimer = spawnInterval * (0.75 + Math.random() * 0.5);
    const occupied = new Set(world.cars.filter((c) => c.slotIdx >= 0).map((c) => c.slotIdx));
    let freeSlot = -1;
    for (let i = 0; i < (state.parking.slots || 4); i++) {
      if (!occupied.has(i)) {
        freeSlot = i;
        break;
      }
    }

    const fromLeft = Math.random() < 0.55;
    const carId = world.nextId++;
    const color = CAR_COLORS[carId % CAR_COLORS.length];

    if (freeSlot === -1) {
      // Hết chỗ đỗ xe -> hiện bong bóng đỏ "Hết chỗ!" và chạy thẳng qua mất khách!
      world.parkingFullTimer = 3.0;
      world.cars.push({
        id: carId,
        gx: fromLeft ? -1.5 : 11.5,
        gy: fromLeft ? 13.1 : 13.7,
        targetGx: fromLeft ? 12.2 : -2.2,
        targetGy: fromLeft ? 13.1 : 13.7,
        color,
        state: 'passby',
        slotIdx: -1,
        bubble: 'Hết chỗ!',
        bubbleTimer: 2.6,
        dir: fromLeft ? 1 : -1
      });
    } else {
      const slotPos = getParkingSlotCoord(freeSlot);
      world.cars.push({
        id: carId,
        gx: fromLeft ? -1.5 : 11.5,
        gy: fromLeft ? 13.1 : 13.7,
        targetGx: slotPos.gx,
        targetGy: slotPos.gy,
        color,
        state: 'entering',
        slotIdx: freeSlot,
        bubble: null,
        bubbleTimer: 0,
        dir: fromLeft ? 1 : -1
      });
    }
  }

  if (world.parkingFullTimer > 0) world.parkingFullTimer = Math.max(0, world.parkingFullTimer - safeDt);

  // 2. Cập nhật xe hơi
  const carSpeed = 3.8 * (1 + ((state.parking.barrierLv || 1) - 1) * 0.08);
  for (let i = world.cars.length - 1; i >= 0; i--) {
    const car = world.cars[i];
    if (car.bubbleTimer > 0) car.bubbleTimer -= safeDt;

    if (car.state === 'passby') {
      if (moveToward(car, car.targetGx, car.targetGy, 4.4, safeDt)) {
        world.cars.splice(i, 1);
      }
    } else if (car.state === 'entering') {
      // Lái dọc đường tới ngang cột ô đỗ rồi rẽ lên
      if (Math.abs(car.gx - car.targetGx) > 0.25 && car.gy > 12.6) {
        moveToward(car, car.targetGx, car.gy, carSpeed, safeDt);
      } else if (moveToward(car, car.targetGx, car.targetGy, carSpeed * 0.85, safeDt)) {
        car.state = 'parked';
        // Khách bước xuống xe đi vào siêu thị!
        const chosenDept = unlockedDepts[Math.floor(Math.random() * unlockedDepts.length)];
        const sId = world.nextId++;
        world.shoppers.push({
          id: sId,
          gx: car.gx,
          gy: car.gy - 0.3,
          color: SHOPPER_COLORS[sId % SHOPPER_COLORS.length],
          state: 'to_door',
          deptId: chosenDept.id,
          laneIdx: 0,
          carId: car.id,
          progress: 0,
          maxProgress: 1,
          basketValue: 0,
          hasCart: false
        });
      }
    } else if (car.state === 'leaving') {
      if (car.gy < 13.3) {
        moveToward(car, car.gx, 13.5, carSpeed * 0.9, safeDt);
      } else if (moveToward(car, 12.4, 13.5, carSpeed * 1.15, safeDt)) {
        world.cars.splice(i, 1);
      }
    }
  }

  // 3. Cập nhật khách hàng bên trong siêu thị
  const walkSpeed = 2.0 * (1 + (state.research.walkSpeed || 0) * 0.2);
  const lanesCount = Math.max(1, state.checkout.lanes || 1);
  const scanSec = Math.max(0.55, 2.6 / (1 + ((state.checkout.speedLv || 1) - 1) * 0.16));
  let nearDoor = false;

  // Đếm hàng chờ từng làn thu ngân & từng gian hàng
  const laneQueues = Array.from({ length: lanesCount }, () => []);
  const deptServing = {};
  world.shoppers.forEach((s) => {
    if (s.state === 'checkout') {
      const idx = Math.min(lanesCount - 1, s.laneIdx || 0);
      laneQueues[idx].push(s);
    } else if (s.state === 'shopping') {
      deptServing[s.deptId] = (deptServing[s.deptId] || 0) + 1;
    }
  });

  world.checkoutCongested = laneQueues.some((q) => q.length > 3);

  for (let i = world.shoppers.length - 1; i >= 0; i--) {
    const s = world.shoppers[i];
    if (Math.hypot(s.gx - 4.8, s.gy - 7.8) < 1.2) nearDoor = true;

    if (s.state === 'to_door') {
      if (moveToward(s, 4.8, 7.6, walkSpeed, safeDt)) {
        s.hasCart = true;
        s.state = 'to_dept';
      }
    } else if (s.state === 'to_dept') {
      const dept = DEPARTMENTS.find((d) => d.id === s.deptId) || unlockedDepts[0];
      const tx = dept.gx + ((s.id % 3) - 1) * 0.45;
      const ty = dept.gy + 1.05;
      if (moveToward(s, tx, ty, walkSpeed, safeDt)) {
        s.state = 'shopping';
        s.progress = 0;
        const ds = state.departments[dept.id];
        s.maxProgress = getDeptServiceSec(dept, ds);
      }
    } else if (s.state === 'shopping') {
      const dept = DEPARTMENTS.find((d) => d.id === s.deptId) || unlockedDepts[0];
      const staffCount = state.departments[dept.id]?.staff || 1;
      // Nếu đông khách hơn số nhân viên thì phục vụ chậm hơn theo tỉ lệ
      const crowding = Math.max(1, (deptServing[dept.id] || 1) / staffCount);
      s.progress += safeDt / crowding;
      if (s.progress >= s.maxProgress) {
        const mult = (isCoopShift ? 2 : 1) * (isVipBoost ? 2 : 1);
        s.basketValue = Math.round(getDeptPrice(dept, state) * mult);
        // Chọn làn thu ngân ngắn nhất
        let bestLane = 0;
        for (let l = 1; l < lanesCount; l++) {
          if (laneQueues[l].length < laneQueues[bestLane].length) bestLane = l;
        }
        s.laneIdx = bestLane;
        s.state = 'to_checkout';
        s.progress = 0;
        s.maxProgress = scanSec;
      }
    } else if (s.state === 'to_checkout') {
      const lanePos = getCheckoutLaneCoord(Math.min(lanesCount - 1, s.laneIdx));
      const qLen = laneQueues[Math.min(lanesCount - 1, s.laneIdx)]?.length || 0;
      if (moveToward(s, lanePos.gx, lanePos.gy - 0.4 - Math.min(3, qLen) * 0.42, walkSpeed, safeDt)) {
        s.state = 'checkout';
        s.progress = 0;
        s.maxProgress = scanSec;
      }
    } else if (s.state === 'checkout') {
      const laneIdx = Math.min(lanesCount - 1, s.laneIdx);
      const q = laneQueues[laneIdx];
      const myPosInQueue = q.indexOf(s);
      const lanePos = getCheckoutLaneCoord(laneIdx);
      moveToward(s, lanePos.gx, lanePos.gy - 0.35 - Math.max(0, myPosInQueue) * 0.42, walkSpeed * 1.2, safeDt);

      // Chỉ khách đứng đầu hàng mới được tính tiền!
      if (myPosInQueue <= 0) {
        s.progress += safeDt;
        if (s.progress >= s.maxProgress) {
          const earned = Math.max(1, s.basketValue);
          if (onCashEarned) onCashEarned(earned);
          world.floaters.push({
            id: world.nextId++,
            gx: lanePos.gx,
            gy: lanePos.gy - 0.7,
            text: `+$${formatMoney(earned)}`,
            color: '#2E9E5B',
            life: 1.0,
            maxLife: 1.0
          });
          s.hasCart = false;
          s.state = 'to_car';
        }
      }
    } else if (s.state === 'to_car') {
      const myCar = world.cars.find((c) => c.id === s.carId);
      if (!myCar) {
        world.shoppers.splice(i, 1);
        continue;
      }
      if (moveToward(s, myCar.gx, myCar.gy, walkSpeed * 1.15, safeDt)) {
        myCar.state = 'leaving';
        myCar.slotIdx = -1;
        world.shoppers.splice(i, 1);
      }
    }
  }

  // Hoạt ảnh cửa kính trượt tự động
  const targetDoor = nearDoor ? 1 : 0;
  world.doorOpenAmount += (targetDoor - world.doorOpenAmount) * Math.min(1, safeDt * 9);

  // 4. Xe tải giao hàng (Delivery Van)
  const delSpeed = 0.045 * (1 + ((state.delivery.speedLv || 1) - 1) * 0.22);
  if (world.deliveryDispatching) {
    world.deliveryVanX -= 4.5 * safeDt;
    if (world.deliveryVanX < -2.2) {
      world.deliveryDispatching = false;
      world.deliveryVanX = 0.9;
      world.deliveryProgress = 0;
    }
  } else {
    world.deliveryProgress = Math.min(1, world.deliveryProgress + delSpeed * safeDt);
  }

  // 5. Hẹn giờ Xe Limousine VIP (mỗi ~60s, nhanh hơn khi nâng Billboard)
  if (!world.vipActive) {
    world.vipTimer -= safeDt;
    if (world.vipTimer <= 0) {
      world.vipActive = true;
      const billboardBonus = (state.marketing.billboard || 0) * 4;
      world.vipTimer = Math.max(35, 62 - billboardBonus);
      if (onVipArrive) onVipArrive();
    }
  }

  // 6. Floaters & Dust puffs
  for (let i = world.floaters.length - 1; i >= 0; i--) {
    const f = world.floaters[i];
    f.life -= safeDt;
    f.gy -= 0.7 * safeDt;
    if (f.life <= 0) world.floaters.splice(i, 1);
  }
  for (let i = world.dustPuffs.length - 1; i >= 0; i--) {
    const d = world.dustPuffs[i];
    d.life -= safeDt;
    if (d.life <= 0) world.dustPuffs.splice(i, 1);
  }
}
