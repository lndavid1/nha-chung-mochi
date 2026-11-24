import React from 'react';

const INK = '#4A3525';

// =========================================================================
// 1. TƯỜNG & SÀN PHÒNG TẮM (3 mẫu mỗi loại)
// =========================================================================
export function BathWallBackdrop({ wallId = 'bwall_blue_tile' }) {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="w-full h-full block">
      <defs>
        <pattern id="bBlueTile" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="#DFF3FA" />
          <path d="M0 0 H32 M0 0 V32" stroke="#BEE3F0" strokeWidth="1.4" />
        </pattern>
        <pattern id="bPinkTile" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="#FFE7EE" />
          <path d="M0 0 H32 M0 0 V32" stroke="#F4CAD6" strokeWidth="1.4" />
        </pattern>
        <pattern id="bSpaTile" width="40" height="24" patternUnits="userSpaceOnUse">
          <rect width="40" height="24" fill="#FAF7F2" />
          <path d="M0 0 H40 M0 0 V24" stroke="#E6DFD3" strokeWidth="1.3" />
        </pattern>
        <linearGradient id="bWallGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="85%" stopColor="#4A3525" stopOpacity="0" />
          <stop offset="100%" stopColor="#4A3525" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      {wallId === 'bwall_pink_tile' ? (
        <rect width="400" height="400" fill="url(#bPinkTile)" />
      ) : wallId === 'bwall_spa_wood' ? (
        <>
          <rect width="400" height="400" fill="url(#bSpaTile)" />
          <rect x="0" y="280" width="400" height="120" fill="#E3C199" />
          <line x1="0" y1="280" x2="400" y2="280" stroke={INK} strokeWidth="2.2" />
        </>
      ) : (
        <rect width="400" height="400" fill="url(#bBlueTile)" />
      )}

      <rect width="400" height="400" fill="url(#bWallGlow)" />
      {/* Phào chống thấm */}
      <rect x="0" y="384" width="400" height="16" fill="#FFFDF9" />
      <line x1="0" y1="384" x2="400" y2="384" stroke={INK} strokeWidth="2.2" />
      <line x1="0" y1="399" x2="400" y2="399" stroke={INK} strokeWidth="2.4" />
    </svg>
  );
}

export function BathFloorBackdrop({ floorId = 'bfloor_pebble' }) {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="w-full h-full block">
      <defs>
        <pattern id="bFloorPebble" width="52" height="52" patternUnits="userSpaceOnUse">
          <rect width="52" height="52" fill="#E9ECEE" />
          <ellipse cx="14" cy="14" rx="9" ry="7" fill="#D5DDE0" />
          <ellipse cx="38" cy="16" rx="10" ry="7" fill="#CFD9DC" />
          <ellipse cx="26" cy="36" rx="11" ry="8" fill="#DCE3E6" />
          <ellipse cx="46" cy="40" rx="6" ry="5" fill="#C9D4D8" />
          <ellipse cx="8" cy="40" rx="7" ry="6" fill="#D8E0E3" />
        </pattern>
        <pattern id="bFloorHex" width="48" height="42" patternUnits="userSpaceOnUse">
          <rect width="48" height="42" fill="#F4F9FC" />
          <polygon points="12,2 24,2 30,12 24,22 12,22 6,12" fill="#CFEAF7" stroke="#A6D1E6" strokeWidth="1.2" />
          <polygon points="36,22 48,22 54,32 48,42 36,42 30,32" fill="#CFEAF7" stroke="#A6D1E6" strokeWidth="1.2" />
        </pattern>
        <pattern id="bFloorOnsen" width="80" height="28" patternUnits="userSpaceOnUse">
          <rect width="80" height="28" fill="#D8B388" />
          <path d="M0 14 H80 M0 28 H80" stroke="#B48A5E" strokeWidth="1.6" />
        </pattern>
        <linearGradient id="bFloorShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3525" stopOpacity="0.14" />
          <stop offset="18%" stopColor="#4A3525" stopOpacity="0" />
          <stop offset="100%" stopColor="#4A3525" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {floorId === 'bfloor_hex' ? (
        <rect width="400" height="400" fill="url(#bFloorHex)" />
      ) : floorId === 'bfloor_onsen' ? (
        <rect width="400" height="400" fill="url(#bFloorOnsen)" />
      ) : (
        <rect width="400" height="400" fill="url(#bFloorPebble)" />
      )}
      <rect width="400" height="400" fill="url(#bFloorShade)" />
    </svg>
  );
}

// =========================================================================
// 2. BỒN RỬA MẶT & GƯƠNG TREO (vanity_arch | vanity_led | vanity_mint)
// =========================================================================
export function VanityMirrorSvg({ vanityId = 'vanity_arch', wiped = false }) {
  const cab =
    vanityId === 'vanity_mint'
      ? '#BFE8D4'
      : vanityId === 'vanity_led'
      ? '#FFF6E8'
      : '#E5BC8E';

  return (
    <svg viewBox="0 0 130 175" className="w-full h-auto overflow-visible">
      <ellipse cx="65" cy="166" rx="48" ry="7" fill="#3D2616" opacity="0.16" />
      {/* Gương treo phía trên */}
      {vanityId === 'vanity_led' ? (
        <g>
          <circle cx="65" cy="44" r="35" fill="#FFE699" opacity="0.55" />
          <circle cx="65" cy="44" r="30" fill="#E3F6FC" stroke={INK} strokeWidth="3" />
        </g>
      ) : (
        <path
          d="M34 74 V38 A31 31 0 0 1 96 38 V74 Z"
          fill="#E3F6FC"
          stroke={vanityId === 'vanity_mint' ? '#6CA88B' : '#C9925B'}
          strokeWidth="6"
        />
      )}
      {vanityId !== 'vanity_led' && (
        <path
          d="M34 74 V38 A31 31 0 0 1 96 38 V74 Z"
          fill="none"
          stroke={INK}
          strokeWidth="2.6"
        />
      )}
      {/* Vệt sáng gương */}
      <line x1="48" y1="30" x2="58" y2="20" stroke="#FFFDF9" strokeWidth="3.5" strokeLinecap="round" opacity={wiped ? 1 : 0.75} />
      <line x1="48" y1="42" x2="68" y2="22" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" opacity={wiped ? 0.95 : 0.6} />

      {/* Vòi nước & Chậu rửa mặt */}
      <path d="M65 92 V82 Q65 76 72 78" fill="none" stroke="#BFC7CC" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M65 92 V82 Q65 76 72 78" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="20" y="92" width="90" height="14" rx="6" fill="#FFFDF9" stroke={INK} strokeWidth="2.8" />
      {/* Tủ lavabo dưới */}
      <rect x="24" y="106" width="82" height="56" rx="8" fill={cab} stroke={INK} strokeWidth="3" />
      <line x1="65" y1="106" x2="65" y2="162" stroke={INK} strokeWidth="2.2" />
      <circle cx="56" cy="132" r="3" fill={INK} />
      <circle cx="74" cy="132" r="3" fill={INK} />
      {/* Chai sữa rửa mặt nhỏ */}
      <rect x="86" y="78" width="12" height="14" rx="3" fill="#FFB7C5" stroke={INK} strokeWidth="1.8" />
      <rect x="30" y="81" width="10" height="11" rx="3" fill="#88C9A1" stroke={INK} strokeWidth="1.8" />
    </svg>
  );
}

// =========================================================================
// 3. KỆ KHĂN / CỬA SỔ KÍNH MỜ (bdecor_towel | bdecor_window | bdecor_fern)
// =========================================================================
export function BathDecorSvg({ decorId = 'bdecor_towel' }) {
  if (decorId === 'bdecor_window') {
    return (
      <svg viewBox="0 0 140 96" className="w-full h-auto overflow-visible">
        <circle cx="70" cy="48" r="38" fill="#E8F8FF" stroke={INK} strokeWidth="3.2" />
        {/* Rèm sáo ngang */}
        {[24, 34, 44, 54, 64].map((y) => (
          <line key={y} x1="36" y1={y} x2="104" y2={y} stroke="#C7DCE6" strokeWidth="3.5" strokeLinecap="round" />
        ))}
        <circle cx="70" cy="48" r="38" fill="none" stroke="#FFFDF9" strokeWidth="4" />
        <circle cx="70" cy="48" r="40" fill="none" stroke={INK} strokeWidth="2.8" />
      </svg>
    );
  }

  if (decorId === 'bdecor_fern') {
    return (
      <svg viewBox="0 0 140 86" className="w-full h-auto overflow-visible">
        {/* Kệ gỗ */}
        <rect x="14" y="42" width="112" height="10" rx="5" fill="#DFB07D" stroke={INK} strokeWidth="2.6" />
        {/* Chậu dương xỉ rủ */}
        <path d="M26 24 H48 L45 42 H29 Z" fill="#FFFDF9" stroke={INK} strokeWidth="2.2" />
        <path d="M32 24 Q20 14 18 38 M38 24 Q34 8 44 20 M44 24 Q58 18 54 48" fill="none" stroke="#6BB385" strokeWidth="4" strokeLinecap="round" />
        {/* Nến thơm oải hương */}
        <rect x="86" y="22" width="22" height="20" rx="5" fill="#DFC5FE" stroke={INK} strokeWidth="2.2" />
        <path d="M97 20 Q93 12 97 8 Q101 12 97 20 Z" fill="#FFE082" stroke={INK} strokeWidth="1.4" />
      </svg>
    );
  }

  // Mặc định: bdecor_towel
  return (
    <svg viewBox="0 0 140 94" className="w-full h-auto overflow-visible">
      {/* Kệ sữa tắm phía trên */}
      <rect x="18" y="28" width="104" height="8" rx="4" fill="#FFFDF9" stroke={INK} strokeWidth="2.4" />
      <rect x="30" y="10" width="16" height="18" rx="4" fill="#FFE082" stroke={INK} strokeWidth="2" />
      <rect x="54" y="12" width="16" height="16" rx="4" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
      <rect x="78" y="8" width="16" height="20" rx="4" fill="#88C9A1" stroke={INK} strokeWidth="2" />
      {/* Thanh treo khăn bông */}
      <line x1="22" y1="50" x2="118" y2="50" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <rect x="32" y="50" width="32" height="36" rx="6" fill="#FFB7C5" stroke={INK} strokeWidth="2.4" />
      <line x1="36" y1="78" x2="60" y2="78" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="74" y="50" width="32" height="32" rx="6" fill="#BFE8D4" stroke={INK} strokeWidth="2.4" />
      <line x1="78" y1="74" x2="102" y2="74" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// =========================================================================
// 4. BỒN TẮM (tub_vintage | tub_hinoki | tub_pink_duck)
// =========================================================================
export function BathtubSvg({ tubId = 'tub_vintage', showFrontFoam = false }) {
  const isWood = tubId === 'tub_hinoki';
  const body = isWood ? '#DFB07D' : tubId === 'tub_pink_duck' ? '#FFD6E3' : '#FFFDF9';
  const rim = isWood ? '#C9925B' : tubId === 'tub_pink_duck' ? '#FFB7C5' : '#F3EDE4';

  return (
    <svg viewBox="0 0 210 135" className="w-full h-auto overflow-visible">
      <ellipse cx="105" cy="126" rx="92" ry="9" fill="#3D2616" opacity="0.16" />
      {/* Vòi sen cổ điển bên phải */}
      <path d="M188 54 V24 Q188 12 174 16" fill="none" stroke="#C5CDD1" strokeWidth="6" strokeLinecap="round" />
      <path d="M188 54 V24 Q188 12 174 16" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="171" cy="18" rx="8" ry="4.5" fill="#E6ECF0" stroke={INK} strokeWidth="2" transform="rotate(-25 171 18)" />

      {/* Mặt nước xanh pastel & lớp bọt xà phòng */}
      <ellipse cx="105" cy="54" rx="84" ry="18" fill="#BBE9F7" stroke={INK} strokeWidth="2.4" />
      <g fill="#FFFDF9" stroke="#D2E8F0" strokeWidth="1.5">
        <circle cx="46" cy="48" r="14" />
        <circle cx="68" cy="44" r="16" />
        <circle cx="94" cy="46" r="15" />
        <circle cx="122" cy="45" r="17" />
        <circle cx="150" cy="48" r="15" />
        <circle cx="170" cy="52" r="12" />
      </g>

      {/* Vịt cao su vàng nổi trên mặt bọt */}
      <g transform="translate(132, 24)">
        <ellipse cx="16" cy="20" rx="12" ry="8" fill="#FFE066" stroke={INK} strokeWidth="2.2" />
        <circle cx="11" cy="11" r="7.5" fill="#FFE066" stroke={INK} strokeWidth="2.2" />
        <path d="M2 11 L7 9 L7 14 Z" fill="#FF9B71" stroke={INK} strokeWidth="1.6" />
        <circle cx="9.5" cy="10" r="1.4" fill={INK} />
      </g>

      {/* Chân sư tử (cho bồn vintage & hồng) */}
      {!isWood && (
        <>
          <path d="M44 114 Q36 124 44 126 H54 Q56 118 52 114 Z" fill="#E0B26B" stroke={INK} strokeWidth="2.4" />
          <path d="M166 114 Q174 124 166 126 H156 Q154 118 158 114 Z" fill="#E0B26B" stroke={INK} strokeWidth="2.4" />
        </>
      )}

      {/* Thân bồn tắm */}
      <path
        d="M16 54 H194 L184 98 Q180 118 154 118 H56 Q30 118 26 98 Z"
        fill={body}
        stroke={INK}
        strokeWidth="3.2"
      />
      {isWood && (
        <>
          <line x1="20" y1="74" x2="190" y2="74" stroke="#A67449" strokeWidth="2.4" />
          <line x1="24" y1="98" x2="186" y2="98" stroke="#A67449" strokeWidth="2.4" />
        </>
      )}
      {/* Miệng bồn */}
      <rect x="10" y="48" width="190" height="12" rx="6" fill={rim} stroke={INK} strokeWidth="3" />

      {/* Bọt tràn viền khi bé đang tắm */}
      {showFrontFoam && (
        <g fill="#FFFDF9" stroke={INK} strokeWidth="2">
          <circle cx="58" cy="54" r="11" />
          <circle cx="84" cy="52" r="13" />
          <circle cx="112" cy="53" r="14" />
          <circle cx="138" cy="54" r="11" />
        </g>
      )}
    </svg>
  );
}

// =========================================================================
// 5. ĐỒ GÓC PHÒNG TẮM (bprop_basket | bprop_stool | bprop_plant)
// =========================================================================
export function BathPropSvg({ propId = 'bprop_basket' }) {
  if (propId === 'bprop_stool') {
    return (
      <svg viewBox="0 0 90 100" className="w-full h-auto overflow-visible">
        <ellipse cx="45" cy="92" rx="32" ry="6" fill="#3D2616" opacity="0.16" />
        <line x1="24" y1="54" x2="18" y2="90" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <line x1="66" y1="54" x2="72" y2="90" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <rect x="14" y="46" width="62" height="12" rx="6" fill="#E6BD8E" stroke={INK} strokeWidth="2.6" />
        {/* Vịt con & lọ tinh dầu */}
        <circle cx="34" cy="36" r="10" fill="#FFE066" stroke={INK} strokeWidth="2.2" />
        <path d="M22 36 L27 34 L27 39 Z" fill="#FF9B71" stroke={INK} strokeWidth="1.5" />
        <rect x="54" y="28" width="14" height="18" rx="4" fill="#88C9A1" stroke={INK} strokeWidth="2" />
      </svg>
    );
  }

  if (propId === 'bprop_plant') {
    return (
      <svg viewBox="0 0 90 110" className="w-full h-auto overflow-visible">
        <ellipse cx="45" cy="102" rx="30" ry="6" fill="#3D2616" opacity="0.16" />
        {/* Lá lưỡi hổ vươn thẳng */}
        <path d="M34 62 Q26 24 34 10 Q42 26 42 62 Z" fill="#77BE92" stroke={INK} strokeWidth="2.4" />
        <path d="M44 62 Q45 14 52 6 Q59 24 54 62 Z" fill="#88C9A1" stroke={INK} strokeWidth="2.4" />
        <path d="M54 62 Q64 28 62 18 Q52 30 48 62 Z" fill="#63A87E" stroke={INK} strokeWidth="2.4" />
        {/* Chậu sứ trắng */}
        <path d="M24 62 H66 L60 98 H30 Z" fill="#FFFDF9" stroke={INK} strokeWidth="2.8" />
        <rect x="20" y="56" width="50" height="9" rx="4" fill="#FFE082" stroke={INK} strokeWidth="2.4" />
      </svg>
    );
  }

  // Mặc định: bprop_basket
  return (
    <svg viewBox="0 0 90 100" className="w-full h-auto overflow-visible">
      <ellipse cx="45" cy="92" rx="34" ry="6" fill="#3D2616" opacity="0.16" />
      {/* Khăn cuộn thò lên */}
      <ellipse cx="32" cy="34" rx="12" ry="18" fill="#FFB7C5" stroke={INK} strokeWidth="2.4" transform="rotate(-12 32 34)" />
      <ellipse cx="56" cy="34" rx="12" ry="18" fill="#BFE8D4" stroke={INK} strokeWidth="2.4" transform="rotate(10 56 34)" />
      {/* Giỏ mây */}
      <path d="M16 40 H74 L68 88 Q66 94 56 94 H34 Q24 94 22 88 Z" fill="#DFB07D" stroke={INK} strokeWidth="3" />
      <line x1="19" y1="56" x2="71" y2="56" stroke="#B4824E" strokeWidth="2.2" />
      <line x1="21" y1="72" x2="69" y2="72" stroke="#B4824E" strokeWidth="2.2" />
    </svg>
  );
}

// =========================================================================
// 6. THẢM CHÂN BÔNG (bmat_paw | bmat_cloud | bmat_duck)
// =========================================================================
export function BathMatSvg({ matId = 'bmat_paw' }) {
  if (matId === 'bmat_cloud') {
    return (
      <svg viewBox="0 0 180 76" className="w-full h-auto overflow-visible">
        <path
          d="M36 58 Q16 58 18 42 Q20 26 42 26 Q54 12 78 16 Q102 8 126 18 Q154 16 162 34 Q170 54 146 58 Z"
          fill="#CFEAF7"
          stroke={INK}
          strokeWidth="3"
        />
        <path
          d="M42 50 Q28 50 30 40 Q34 30 50 30 Q62 20 82 22 Q104 16 122 26 Q142 24 148 36 Q152 48 136 50 Z"
          fill="#FFFDF9"
          opacity="0.6"
        />
      </svg>
    );
  }

  if (matId === 'bmat_duck') {
    return (
      <svg viewBox="0 0 180 76" className="w-full h-auto overflow-visible">
        <ellipse cx="90" cy="40" rx="74" ry="26" fill="#FFE082" stroke={INK} strokeWidth="3" />
        <circle cx="72" cy="36" r="4" fill={INK} />
        <circle cx="108" cy="36" r="4" fill={INK} />
        <ellipse cx="90" cy="44" rx="14" ry="6" fill="#FF9B71" stroke={INK} strokeWidth="2" />
      </svg>
    );
  }

  // Mặc định: bmat_paw (Thảm bàn chân mèo)
  return (
    <svg viewBox="0 0 180 76" className="w-full h-auto overflow-visible">
      <ellipse cx="90" cy="46" rx="68" ry="24" fill="#FFFDF9" stroke={INK} strokeWidth="3" />
      {/* 4 ngón đệm hồng */}
      <ellipse cx="54" cy="30" rx="11" ry="8" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
      <ellipse cx="78" cy="24" rx="11" ry="8" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
      <ellipse cx="102" cy="24" rx="11" ry="8" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
      <ellipse cx="126" cy="30" rx="11" ry="8" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
      {/* Đệm lòng bàn chân */}
      <ellipse cx="90" cy="48" rx="28" ry="14" fill="#FFB7C5" stroke={INK} strokeWidth="2.2" />
    </svg>
  );
}

// =========================================================================
// THUMBNAIL CHO DECORATOR DRAWER
// =========================================================================
export function BathroomItemThumbnail({ item }) {
  if (!item) return null;
  if (item.slot === 'bathWall') {
    return (
      <div className="w-14 h-12 rounded-xl overflow-hidden border-[1.8px] border-[#4A3525]">
        <BathWallBackdrop wallId={item.id} />
      </div>
    );
  }
  if (item.slot === 'bathFloor') {
    return (
      <div className="w-14 h-12 rounded-xl overflow-hidden border-[1.8px] border-[#4A3525]">
        <BathFloorBackdrop floorId={item.id} />
      </div>
    );
  }
  if (item.slot === 'vanityMirror') {
    return (
      <div className="w-12 h-14 flex items-center justify-center">
        <VanityMirrorSvg vanityId={item.id} />
      </div>
    );
  }
  if (item.slot === 'bathDecor') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <BathDecorSvg decorId={item.id} />
      </div>
    );
  }
  if (item.slot === 'bathtub') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <BathtubSvg tubId={item.id} />
      </div>
    );
  }
  if (item.slot === 'bathProp') {
    return (
      <div className="w-12 h-14 flex items-center justify-center">
        <BathPropSvg propId={item.id} />
      </div>
    );
  }
  if (item.slot === 'bathMat') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <BathMatSvg matId={item.id} />
      </div>
    );
  }
  return null;
}
