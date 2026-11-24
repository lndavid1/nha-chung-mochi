// Kiến trúc Điểm Neo Phụ Kiện tập trung cho từng loài thú & 4 trạng thái cảm xúc
// Tọa độ tâm neo (% theo khung ảnh Pet đã Auto-Trim) + Hỗ trợ lưu tạm Dev Calibrator trong localStorage

const CALIBRATOR_STORAGE_KEY = 'mochi_pet_anchors_override_v1';

// Định nghĩa slot đeo cho từng ID phụ kiện trong catalog
export const ACCESSORY_SLOTS = {
  acc_sprout: { slot: 'head', zIndex: 25, baseScale: 0.24 },
  acc_beret: { slot: 'head', zIndex: 26, baseScale: 0.48 },
  acc_crown: { slot: 'head', zIndex: 26, baseScale: 0.30 },
  acc_glasses: { slot: 'eyes', zIndex: 24, baseScale: 0.56, hideWhenSleeping: true },
  acc_bow: { slot: 'neck', zIndex: 22, baseScale: 0.32 },
  acc_scarf: { slot: 'neck', zIndex: 23, baseScale: 0.58 }
};

// Tọa độ tâm neo mặc định (% theo khung ảnh Pet đã auto-trim)
export const PET_ANCHORS = {
  cat: {
    happy: {
      head: { x: 47, y: 15, r: 0, s: 1 },
      eyes: { x: 46, y: 44, r: 0, s: 1 },
      neck: { x: 46, y: 69, r: 0, s: 1 }
    },
    hungry: {
      head: { x: 48, y: 15, r: 0, s: 1 },
      eyes: { x: 48, y: 44, r: 0, s: 1 },
      neck: { x: 48, y: 71, r: 0, s: 1 }
    },
    sulky: {
      head: { x: 45, y: 16, r: -4, s: 1 },
      eyes: { x: 44, y: 44, r: -2, s: 1 },
      neck: { x: 45, y: 70, r: 0, s: 1 }
    },
    sleepy: {
      head: { x: 38, y: 24, r: -16, s: 0.92 },
      eyes: { x: 36, y: 52, r: -14, s: 0.9 },
      neck: { x: 42, y: 72, r: -10, s: 0.85 }
    }
  },
  corgi: {
    happy: {
      head: { x: 50, y: 14, r: 0, s: 1 },
      eyes: { x: 50, y: 46, r: 0, s: 1 },
      neck: { x: 50, y: 74, r: 0, s: 1 }
    },
    hungry: {
      head: { x: 50, y: 14, r: 0, s: 1 },
      eyes: { x: 50, y: 45, r: 0, s: 1 },
      neck: { x: 50, y: 75, r: 0, s: 1 }
    },
    sulky: {
      head: { x: 50, y: 15, r: -4, s: 1 },
      eyes: { x: 50, y: 46, r: -2, s: 1 },
      neck: { x: 50, y: 74, r: 0, s: 1 }
    },
    sleepy: {
      head: { x: 38, y: 26, r: -15, s: 0.92 },
      eyes: { x: 36, y: 52, r: -12, s: 0.9 },
      neck: { x: 42, y: 72, r: -10, s: 0.85 }
    }
  },
  bunny: {
    happy: {
      head: { x: 50, y: 24, r: 0, s: 0.95 },
      eyes: { x: 50, y: 50, r: 0, s: 1 },
      neck: { x: 50, y: 76, r: 0, s: 1 }
    },
    hungry: {
      head: { x: 50, y: 24, r: 0, s: 0.95 },
      eyes: { x: 50, y: 49, r: 0, s: 1 },
      neck: { x: 50, y: 76, r: 0, s: 1 }
    },
    sulky: {
      head: { x: 50, y: 25, r: -4, s: 0.95 },
      eyes: { x: 50, y: 50, r: -2, s: 1 },
      neck: { x: 50, y: 76, r: 0, s: 1 }
    },
    sleepy: {
      head: { x: 38, y: 30, r: -14, s: 0.9 },
      eyes: { x: 36, y: 54, r: -12, s: 0.88 },
      neck: { x: 42, y: 74, r: -8, s: 0.85 }
    }
  }
};

export function loadMergedPetAnchors() {
  try {
    const raw = localStorage.getItem(CALIBRATOR_STORAGE_KEY);
    if (!raw) return PET_ANCHORS;
    const saved = JSON.parse(raw);
    const merged = JSON.parse(JSON.stringify(PET_ANCHORS));
    Object.keys(saved || {}).forEach((petType) => {
      if (!merged[petType]) merged[petType] = {};
      Object.keys(saved[petType] || {}).forEach((emotion) => {
        if (!merged[petType][emotion]) merged[petType][emotion] = {};
        Object.keys(saved[petType][emotion] || {}).forEach((slot) => {
          merged[petType][emotion][slot] = {
            ...(merged[petType][emotion][slot] || {}),
            ...saved[petType][emotion][slot]
          };
        });
      });
    });
    return merged;
  } catch {
    return PET_ANCHORS;
  }
}

export function savePetAnchorsOverride(anchorsObj) {
  try {
    localStorage.setItem(CALIBRATOR_STORAGE_KEY, JSON.stringify(anchorsObj));
  } catch {
    // ignore storage quota errors
  }
}

export function resetPetAnchorsOverride() {
  localStorage.removeItem(CALIBRATOR_STORAGE_KEY);
}
