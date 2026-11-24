import React from 'react';

const INK = '#4A3525';

// =========================================================================
// 1. DANH SÁCH NGUYÊN LIỆU TƯƠI (CHỢ THỰC PHẨM -> TỦ LẠNH -> NẤU PATE)
// =========================================================================
export const INGREDIENTS_LIST = [
  { id: 'chicken', name: 'Ức Gà Tươi', price: 10, desc: 'Thịt gà mềm giàu đạm, nguyên liệu nấu Pate thơm ngọt' },
  { id: 'carrot', name: 'Cà Rốt Ngọt', price: 8, desc: 'Cà rốt tươi giòn ngọt giàu vitamin tốt cho mắt bé' },
  { id: 'pumpkin', name: 'Bí Đỏ Béo', price: 8, desc: 'Bí đỏ chín bùi bùi giúp tiêu hóa cực êm bụng' },
  { id: 'salmon', name: 'Cá Hồi Na Uy', price: 18, desc: 'Cá hồi tươi béo ngậy giúp bộ lông bé mượt mà óng ả' },
  { id: 'shrimp', name: 'Tôm Sú Tươi', price: 16, desc: 'Tôm sú ngọt thịt làm súp và Pate hải sản cực mê' },
  { id: 'catnip', name: 'Cỏ Mèo / Phô Mai', price: 15, desc: 'Gia vị thần thánh tăng độ ngon và làm bé thích mê' }
];

// =========================================================================
// 2. DANH SÁCH ĐỒ ĂN NHANH (ĐỔ RA BÁT ĂN LIỀN KHÔNG CẦN NẤU)
// =========================================================================
export const FAST_FOOD_LIST = [
  {
    id: 'kibble',
    name: 'Hạt Khô Cơ Bản',
    price: 12,
    hungerGain: 22,
    moodGain: 3,
    desc: 'Hạt khô giòn rụm tiện lợi, lúc bận rộn đổ ra bát ngay'
  },
  {
    id: 'churu',
    name: 'Súp Thưởng Churu',
    price: 20,
    hungerGain: 18,
    moodGain: 18,
    desc: 'Súp thưởng kem mịn tăng mạnh độ vui vẻ cho bé'
  },
  {
    id: 'canned_pate',
    name: 'Pate Lon Tiện Lợi',
    price: 28,
    hungerGain: 35,
    moodGain: 10,
    desc: 'Pate đóng hộp thơm ngon giúp bé no bụng nhanh chóng'
  }
];

// =========================================================================
// 3. 5 CÔNG THỨC NẤU PATE NHÀ LÀM
// =========================================================================
export const PATE_RECIPES = [
  {
    id: 'pate_chicken_carrot',
    name: 'Pate Gà Cà Rốt',
    ingredients: { chicken: 1, carrot: 1 },
    portions: 2,
    baseHunger: 42,
    baseMood: 18,
    color: '#FFB48A',
    desc: 'Món Pate quốc dân thanh ngọt dễ ăn, mềm mịn tan trong miệng'
  },
  {
    id: 'pate_salmon_pumpkin',
    name: 'Pate Cá Hồi Bí Đỏ',
    ingredients: { salmon: 1, pumpkin: 1 },
    portions: 2,
    baseHunger: 50,
    baseMood: 25,
    color: '#FF9B71',
    desc: 'Cá hồi béo ngậy hòa quyện bí đỏ thơm lừng cả căn bếp'
  },
  {
    id: 'soup_shrimp_pumpkin',
    name: 'Súp Tôm Bí Đỏ',
    ingredients: { shrimp: 1, pumpkin: 1 },
    portions: 2,
    baseHunger: 45,
    baseMood: 22,
    color: '#FFD17A',
    desc: 'Súp tôm nóng hổi sánh mịn, ăn một miếng là mê tít'
  },
  {
    id: 'pate_seafood_cheese',
    name: 'Pate Hải Sản Phô Mai',
    ingredients: { salmon: 1, shrimp: 1, catnip: 1 },
    portions: 3,
    baseHunger: 60,
    baseMood: 35,
    color: '#FFA8B8',
    desc: 'Đại tiệc hải sản béo ngậy 3 phần lớn, tăng chỉ số cực đỉnh'
  },
  {
    id: 'pate_chicken_catnip',
    name: 'Pate Gà Cỏ Mèo',
    ingredients: { chicken: 1, catnip: 1 },
    portions: 2,
    baseHunger: 40,
    baseMood: 32,
    color: '#9ED9B3',
    desc: 'Hương cỏ mèo thơm dịu gây nghiện khiến bé vui nhảy chân sáo'
  }
];

// Dữ liệu Tủ Lạnh mặc định (tương thích ngược cho mọi phòng cũ — tặng sẵn đồ để test ngay!)
export const DEFAULT_FRIDGE = {
  ingredients: {
    salmon: 1,
    chicken: 0,
    pumpkin: 1,
    shrimp: 0,
    carrot: 0,
    catnip: 0
  },
  fastFood: {
    kibble: 2,
    churu: 0,
    canned_pate: 0
  },
  cookedDishes: []
};

export function normalizeFridge(rawFridge) {
  if (!rawFridge) {
    return {
      ingredients: { ...DEFAULT_FRIDGE.ingredients },
      fastFood: { ...DEFAULT_FRIDGE.fastFood },
      cookedDishes: []
    };
  }
  return {
    ingredients: {
      ...DEFAULT_FRIDGE.ingredients,
      ...(rawFridge.ingredients || {})
    },
    fastFood: {
      ...DEFAULT_FRIDGE.fastFood,
      ...(rawFridge.fastFood || {})
    },
    cookedDishes: Array.isArray(rawFridge.cookedDishes)
      ? rawFridge.cookedDishes.filter((d) => d && (d.portions ?? 0) > 0)
      : []
  };
}

export function getRecipeById(recipeId) {
  return PATE_RECIPES.find((r) => r.id === recipeId) || PATE_RECIPES[0];
}

export function getIngredientById(id) {
  return INGREDIENTS_LIST.find((i) => i.id === id) || null;
}

export function getFastFoodById(id) {
  return FAST_FOOD_LIST.find((f) => f.id === id) || null;
}

export function computeDishStats(recipe, quality = 3) {
  const mult = quality >= 3 ? 1.0 : quality === 2 ? 0.85 : 0.65;
  return {
    hungerGain: Math.round((recipe?.baseHunger || 40) * mult),
    moodGain: Math.round((recipe?.baseMood || 18) * mult)
  };
}

// =========================================================================
// 4. BỘ ICON SVG COZY PASTEL VIỀN NÂU #4A3525 (KHÔNG DÙNG EMOJI THÔ)
// =========================================================================
export function StarRatingSvg({ quality = 3, size = 13 }) {
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {[1, 2, 3].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2.5 L14.9 8.6 L21.5 9.5 L16.7 14.1 L17.9 20.7 L12 17.5 L6.1 20.7 L7.3 14.1 L2.5 9.5 L9.1 8.6 Z"
            fill={n <= quality ? '#FFE066' : '#E8DDD0'}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

export function CookingIconSvg({ id, className = 'w-9 h-9' }) {
  switch (id) {
    case 'chicken':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <path
            d="M14 28 C10 18 20 10 31 13 C39 15 41 26 33 32 C28 36 18 37 14 28 Z"
            fill="#FFE2CC"
            stroke={INK}
            strokeWidth="2.6"
          />
          <path d="M21 19 Q27 16 32 20" fill="none" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 27 Q25 25 30 28" fill="none" stroke="#E5B293" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'carrot':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <path d="M31 15 Q35 6 40 9 M33 17 Q41 12 42 18 M29 14 Q29 7 34 7" fill="none" stroke="#76BC8E" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M31 15 C36 20 26 36 13 40 C10 41 8 39 9 36 C13 23 26 10 31 15 Z"
            fill="#FF9B5E"
            stroke={INK}
            strokeWidth="2.6"
          />
          <path d="M22 21 L26 25 M17 28 L21 31" stroke="#D96B2B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'pumpkin':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <path d="M24 14 Q25 7 29 8" fill="none" stroke="#6E9E5D" strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="16" cy="27" rx="9" ry="12" fill="#FFAC5C" stroke={INK} strokeWidth="2.5" />
          <ellipse cx="32" cy="27" rx="9" ry="12" fill="#FFAC5C" stroke={INK} strokeWidth="2.5" />
          <ellipse cx="24" cy="27" rx="9" ry="13" fill="#FFB970" stroke={INK} strokeWidth="2.5" />
          <path d="M21 20 Q20 27 21 34" fill="none" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        </svg>
      );
    case 'salmon':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <path
            d="M8 29 C10 17 24 12 38 15 L40 27 C34 36 16 38 8 29 Z"
            fill="#FF8C73"
            stroke={INK}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path d="M16 19 Q19 27 16 33 M24 16 Q27 26 24 34 M32 16 Q34 24 32 31" fill="none" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'shrimp':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <path
            d="M34 14 C20 10 10 18 12 29 C13 36 21 38 26 34 C29 31 28 26 23 26 C19 26 19 21 24 20 C30 19 35 23 38 18 Z"
            fill="#FF9E8A"
            stroke={INK}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path d="M35 16 L41 11 M37 19 L42 18" stroke="#FF6B5B" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="17" cy="23" r="1.8" fill={INK} />
        </svg>
      );
    case 'catnip':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          {/* Miếng phô mai vàng + lá cỏ mèo xanh */}
          <path d="M10 34 L24 15 L40 26 L38 37 L10 37 Z" fill="#FFE074" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="22" cy="29" r="3" fill="#F2BA49" />
          <circle cx="31" cy="31" r="2.2" fill="#F2BA49" />
          <path d="M16 20 Q10 11 19 10 Q22 15 16 20 Z" fill="#88C9A1" stroke={INK} strokeWidth="2" />
        </svg>
      );
    case 'kibble':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect x="12" y="10" width="24" height="30" rx="5" fill="#FFE8B6" stroke={INK} strokeWidth="2.5" />
          <path d="M12 16 H36" stroke={INK} strokeWidth="2" />
          <circle cx="24" cy="27" r="6" fill="#C98A54" stroke={INK} strokeWidth="1.8" />
          <circle cx="22" cy="25" r="1.4" fill="#FFFDF9" />
        </svg>
      );
    case 'churu':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect x="16" y="8" width="16" height="32" rx="4" fill="#FFB7C5" stroke={INK} strokeWidth="2.5" transform="rotate(-14 24 24)" />
          <rect x="19" y="16" width="10" height="12" rx="2" fill="#FFFDF9" stroke={INK} strokeWidth="1.6" transform="rotate(-14 24 24)" />
          <circle cx="24" cy="22" r="2.5" fill="#FF6B8B" />
        </svg>
      );
    case 'canned_pate':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect x="10" y="18" width="28" height="20" rx="5" fill="#BFE8D4" stroke={INK} strokeWidth="2.6" />
          <ellipse cx="24" cy="18" rx="14" ry="5" fill="#E6ECF0" stroke={INK} strokeWidth="2.4" />
          <circle cx="24" cy="18" r="2.5" fill="#FFFDF9" stroke={INK} strokeWidth="1.4" />
          <path d="M18 29 Q24 25 30 29" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      // Hũ Pate nhà làm (pate_*)
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect x="12" y="16" width="24" height="24" rx="7" fill="#FF9B71" stroke={INK} strokeWidth="2.5" />
          <rect x="14" y="11" width="20" height="7" rx="3" fill="#FFFDF9" stroke={INK} strokeWidth="2.4" />
          <rect x="16" y="22" width="16" height="11" rx="3" fill="#FFF8F0" stroke={INK} strokeWidth="1.8" />
          <path d="M21 28 C21 26 24 25 24 27 C24 25 27 26 27 28 C27 30 24 31 24 31 C24 31 21 30 21 28 Z" fill="#FF6B8B" />
        </svg>
      );
  }
}

// Overlay đồ ăn đầy ụ vẽ ngay trên bát ăn trong Nhà Bếp
export function BowlFoodOverlaySvg({ isCooked = true, className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 120 72" className={className}>
      {/* Đống Pate / Hạt đầy ụ bên bát trái */}
      <path
        d="M20 38 Q26 20 38 22 Q50 20 56 38 Q38 44 20 38 Z"
        fill={isCooked ? '#FF9B71' : '#C98A54'}
        stroke={INK}
        strokeWidth="2.4"
      />
      <circle cx="33" cy="30" r="2.6" fill={isCooked ? '#FFE082' : '#8C5832'} />
      <circle cx="43" cy="31" r="2.4" fill={isCooked ? '#88C9A1' : '#8C5832'} />
      <circle cx="38" cy="26" r="2.2" fill={isCooked ? '#FFFDF9' : '#A66C3E'} />
      {/* Khói thơm ấm bay lên nếu là Pate nhà làm */}
      {isCooked && (
        <g stroke="#FFFDF9" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M31 16 Q28 9 33 4" />
          <path d="M41 14 Q45 7 40 2" />
        </g>
      )}
    </svg>
  );
}
