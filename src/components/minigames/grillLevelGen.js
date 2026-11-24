import { SKEWER_TYPES } from './grillAssets';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let uidCounter = 1;
function nextSkewerId(prefix = 'sk') {
  uidCounter += 1;
  return `${prefix}_${Date.now()}_${uidCounter}`;
}

/**
 * Đếm toàn bộ số lượng xiên còn lại trên các bếp (mặt trên + các lớp chờ) và trên 7 đĩa chờ
 */
export function countRemainingByType(grills, holdingPlates) {
  const counts = {};
  (holdingPlates || []).forEach((item) => {
    if (item && item.type) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
  });
  (grills || []).forEach((g) => {
    (g.top || []).forEach((s) => {
      if (s && s.type) counts[s.type] = (counts[s.type] || 0) + 1;
    });
    (g.queue || []).forEach((layer) => {
      (layer || []).forEach((s) => {
        if (s && s.type) counts[s.type] = (counts[s.type] || 0) + 1;
      });
    });
  });
  return counts;
}

/**
 * Chọn loại món cho Khay Đơn Hàng mới — chống Deadlock tuyệt đối:
 * 1. Chỉ chọn món còn tổng số >= 3 (cả trên bếp + đĩa chờ) và chưa bị trùng quá số bộ 3 khả dụng với các khay đơn đang mở
 * 2. Ưu tiên tuyệt đối các món đã có sẵn trên 7 Đĩa Chờ hoặc đang lộ diện trên mặt các bếp KHÔNG bị khóa
 */
export function pickNextOrderType(grills, holdingPlates, activeOrders) {
  const remaining = countRemainingByType(grills, holdingPlates);

  // Trừ đi số xiên đang cần cho các khay đơn hiện tại
  const committedSets = {};
  (activeOrders || []).forEach((ord) => {
    if (ord) {
      committedSets[ord.type] = (committedSets[ord.type] || 0) + (3 - ord.filled);
    }
  });

  // Lọc ra các loại món còn đủ ít nhất 3 xiên chưa cam kết
  const eligibleTypes = Object.keys(remaining).filter((type) => {
    const freeCount = remaining[type] - (committedSets[type] || 0);
    return freeCount >= 3;
  });

  if (eligibleTypes.length === 0) return null;

  // Điểm ưu tiên cho từng loại món: có sẵn trên đĩa chờ (+5) hoặc lộ diện trên bếp đang mở (+3)
  const visibleScore = {};
  eligibleTypes.forEach((t) => {
    visibleScore[t] = 0;
  });

  (holdingPlates || []).forEach((p) => {
    if (p && visibleScore[p.type] !== undefined) {
      visibleScore[p.type] += 5;
    }
  });

  (grills || []).forEach((g) => {
    const isLocked = g.ice > 0 || g.chain > 0 || Boolean(g.lidTarget);
    if (isLocked) return;
    (g.top || []).forEach((s) => {
      if (s && !s.mystery && visibleScore[s.type] !== undefined) {
        visibleScore[s.type] += 3;
      }
    });
  });

  // Sắp xếp giảm dần theo độ ưu tiên hiển thị, thêm chút ngẫu nhiên nhẹ giữa các món ngang nhau
  const sorted = [...eligibleTypes].sort(
    (a, b) => (visibleScore[b] + Math.random() * 1.5) - (visibleScore[a] + Math.random() * 1.5)
  );
  return sorted[0] || null;
}

/**
 * Bộ sinh màn chơi Bếp Nướng Mochi (Level 1 -> Vô tận)
 * - Đảm bảo 100% luật bội số của 3 cho mọi món ăn
 * - Đảm bảo không bao giờ tạo khóa chết (Anti-Deadlock)
 */
export function generateGrillLevel(level = 1) {
  const safeLevel = Math.max(1, Number(level) || 1);

  // Số loại món tăng dần từ 6 -> 12
  const typeCount = Math.min(12, 5 + safeLevel);
  const chosenTypes = shuffleArray(SKEWER_TYPES)
    .slice(0, typeCount)
    .map((t) => t.id);

  // Tổng số bộ 3 (tức tổng số đơn hàng cần hoàn thành) tăng dần theo màn
  // Màn 1: 12 bộ (36 xiên = 9 bếp mở * 1.33 lớp)
  // Màn 2: 15 bộ (45 xiên)
  // Màn 3+: tăng dần tới tối đa 28 bộ (84 xiên)
  const totalTriplets = Math.min(28, 9 + safeLevel * 3);

  // Tạo pool xiên đảm bảo mỗi món là bội số của 3 (ít nhất 1 bộ 3 cho mỗi món đã chọn)
  const pool = [];
  chosenTypes.forEach((t) => {
    pool.push(t, t, t);
  });
  let remainingTriplets = totalTriplets - chosenTypes.length;
  while (remainingTriplets > 0) {
    const pick = chosenTypes[Math.floor(Math.random() * chosenTypes.length)];
    pool.push(pick, pick, pick);
    remainingTriplets -= 1;
  }

  const shuffledPool = shuffleArray(pool);

  // 12 Bếp nướng (3 cột x 4 hàng)
  const activeGrillCount = safeLevel === 1 ? 9 : 12;
  const grills = Array.from({ length: 12 }, (_, idx) => ({
    id: idx,
    active: idx < activeGrillCount,
    top: [null, null, null],
    queue: [],
    ice: 0,
    chain: 0,
    lidTarget: null
  }));

  // Chia pool xiên vào các lớp 3 xiên cho các bếp đang hoạt động
  // Bắt đầu bằng việc điền đầy mặt trên (top) của tất cả bếp hoạt động trước
  let cursor = 0;
  for (let i = 0; i < activeGrillCount && cursor < shuffledPool.length; i++) {
    for (let slot = 0; slot < 3 && cursor < shuffledPool.length; slot++) {
      grills[i].top[slot] = {
        id: nextSkewerId('top'),
        type: shuffledPool[cursor++],
        mystery: false,
        timer: null
      };
    }
  }

  // Phần xiên còn lại chia đều vào Khay Xem Trước (queue) của các bếp hoạt động (mỗi lớp tối đa 3 xiên)
  let grillCursor = 0;
  while (cursor < shuffledPool.length) {
    const layer = [];
    for (let s = 0; s < 3 && cursor < shuffledPool.length; s++) {
      layer.push({
        id: nextSkewerId('q'),
        type: shuffledPool[cursor++],
        mystery: false,
        timer: null
      });
    }
    grills[grillCursor].queue.push(layer);
    grillCursor = (grillCursor + 1) % activeGrillCount;
  }

  // Gắn 5 cơ chế chướng ngại vật mở khóa dần theo màn
  if (safeLevel === 1) {
    // Màn 1: Chỉ có 1 bếp Giấy Bạc ? để làm quen (gắn trên 1 xiên giữa của bếp số 4)
    if (grills[4].top[1]) {
      grills[4].top[1].mystery = true;
    }
  } else {
    // Từ Màn 2 trở đi: kết hợp đầy đủ 5 cơ chế chướng ngại vật
    const unlockedIndices = [0, 1, 2, 3, 4, 5]; // Giữ tối thiểu 6 bếp đầu mở hoàn toàn để không deadlock

    // 1. Bếp Đóng Băng (ice: 2)
    const iceCount = Math.min(2, Math.floor(safeLevel / 2));
    for (let k = 0; k < iceCount; k++) {
      const idx = 6 + k;
      if (grills[idx]?.active) grills[idx].ice = 2;
    }

    // 2. Bếp Xích Khóa Số (chain: 3 hoặc 4)
    if (safeLevel >= 2 && grills[8]?.active) {
      grills[8].chain = safeLevel >= 4 ? 4 : 3;
    }

    // 3. Bếp Đậy Nắp Kín (lidTarget) — CHỐNG DEADLOCK: chỉ chọn món có đủ >= 3 xiên đang nằm ở các bếp mở!
    if (safeLevel >= 2 && grills[9]?.active) {
      const openTypeCounts = {};
      grills.forEach((g) => {
        if (!g.active || g.id === 9 || g.ice > 0 || g.chain > 0) return;
        g.top.forEach((s) => {
          if (s) openTypeCounts[s.type] = (openTypeCounts[s.type] || 0) + 1;
        });
        g.queue.forEach((layer) =>
          layer.forEach((s) => {
            if (s) openTypeCounts[s.type] = (openTypeCounts[s.type] || 0) + 1;
          })
        );
      });
      const safeLidCandidates = Object.keys(openTypeCounts).filter(
        (t) => openTypeCounts[t] >= 3
      );
      if (safeLidCandidates.length > 0) {
        grills[9].lidTarget =
          safeLidCandidates[Math.floor(Math.random() * safeLidCandidates.length)];
      }
    }

    // 4. Xiên Giấy Bạc Bí Ẩn (?) trên 2-3 bếp đang mở (tối đa 1 xiên/? mỗi bếp để người chơi luôn nhặt được xiên khác mở ra)
    const mysteryCount = Math.min(4, 1 + Math.floor(safeLevel / 2));
    for (let m = 0; m < mysteryCount; m++) {
      const targetGrill = grills[unlockedIndices[m % unlockedIndices.length]];
      if (targetGrill?.top[1]) {
        targetGrill.top[1].mystery = true;
      }
    }

    // 5. Xiên Hẹn Giờ (timer: 10) trên 1-2 xiên ở bếp đang mở (không đặt lên xiên mystery)
    const timerCount = Math.min(2, Math.floor(safeLevel / 2));
    for (let t = 0; t < timerCount; t++) {
      const targetGrill = grills[unlockedIndices[(t + 2) % unlockedIndices.length]];
      if (targetGrill?.top[0] && !targetGrill.top[0].mystery) {
        targetGrill.top[0].timer = 10;
      }
    }
  }

  // Khởi tạo 4 Khay Đơn Hàng đầu tiên từ các món đang mở sẵn
  const orders = [];
  for (let i = 0; i < 4; i++) {
    const nextType = pickNextOrderType(grills, [], orders);
    if (nextType) {
      orders.push({
        id: nextSkewerId('ord'),
        type: nextType,
        filled: 0
      });
    } else {
      orders.push(null);
    }
  }

  return {
    level: safeLevel,
    totalOrders: totalTriplets,
    completedOrders: 0,
    grills,
    orders,
    holdingPlates: [],
    boosters: {
      spatula: 1,
      shuffle: 2,
      pack: 2,
      undo: 2
    }
  };
}
