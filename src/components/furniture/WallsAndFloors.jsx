import React from 'react';

// 5 Mẫu Tường + Phào chỉ chân tường (Baseboard) + 5 Mẫu Sàn 2.5D có chiều sâu kiến trúc
export function WallBackdrop({ wallId = 'wall_cream' }) {
  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <svg
        viewBox="0 0 400 360"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <defs>
          {/* 1. Kem sữa phào chỉ gỗ */}
          <linearGradient id="wallCreamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF8EE" />
            <stop offset="100%" stopColor="#F8E8D4" />
          </linearGradient>

          {/* 2. Hồng phấn chấm bi */}
          <linearGradient id="wallPinkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF0F3" />
            <stop offset="100%" stopColor="#FADCE4" />
          </linearGradient>
          <pattern id="pinkDots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2.6" fill="#FFFDF9" opacity="0.85" />
            <circle cx="26" cy="26" r="2.2" fill="#FFB7C5" opacity="0.65" />
          </pattern>

          {/* 3. Xanh sage kẻ sọc dọc */}
          <pattern id="sageStripes" width="28" height="28" patternUnits="userSpaceOnUse">
            <rect width="28" height="28" fill="#EBF5EE" />
            <rect x="0" y="0" width="12" height="28" fill="#D7EBDC" />
            <line x1="12" y1="0" x2="12" y2="28" stroke="#B8DBC3" strokeWidth="1" />
          </pattern>

          {/* 4. Gạch thẻ trắng vintage */}
          <pattern id="vintageBrick" width="48" height="24" patternUnits="userSpaceOnUse">
            <rect width="48" height="24" fill="#EAE0D5" />
            <rect x="1.5" y="1.5" width="45" height="9.5" rx="2" fill="#FFFDF9" />
            <rect x="-22" y="13.5" width="45" height="9.5" rx="2" fill="#FAF3EB" />
            <rect x="25.5" y="13.5" width="45" height="9.5" rx="2" fill="#FFFDF9" />
          </pattern>

          {/* 5. Tường ốp lam gỗ Nhật */}
          <linearGradient id="wainscotTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF9F1" />
            <stop offset="100%" stopColor="#F3E5D3" />
          </linearGradient>
          <pattern id="woodSlat" width="20" height="140" patternUnits="userSpaceOnUse">
            <rect width="20" height="140" fill="#E5C19A" />
            <rect x="0" y="0" width="3" height="140" fill="#F0D2B2" />
            <line x1="19" y1="0" x2="19" y2="140" stroke="#8C6239" strokeWidth="1.6" />
          </pattern>

          {/* Vignette góc tường tạo chiều sâu diorama 2.5D */}
          <radialGradient id="wallVignette" cx="50%" cy="45%" r="65%">
            <stop offset="65%" stopColor="#4A3525" stopOpacity="0" />
            <stop offset="100%" stopColor="#4A3525" stopOpacity="0.11" />
          </radialGradient>
        </defs>

        {wallId === 'wall_pink' && (
          <>
            <rect width="400" height="360" fill="url(#wallPinkGrad)" />
            <rect width="400" height="360" fill="url(#pinkDots)" />
          </>
        )}

        {wallId === 'wall_mint' && (
          <rect width="400" height="360" fill="url(#sageStripes)" />
        )}

        {wallId === 'wall_brick' && (
          <rect width="400" height="360" fill="url(#vintageBrick)" />
        )}

        {wallId === 'wall_wainscot' && (
          <>
            <rect width="400" height="225" fill="url(#wainscotTop)" />
            <rect x="0" y="220" width="400" height="9" fill="#C99A6B" stroke="#4A3525" strokeWidth="2.2" />
            <rect x="0" y="229" width="400" height="131" fill="url(#woodSlat)" />
          </>
        )}

        {(!wallId || wallId === 'wall_cream') && (
          <>
            <rect width="400" height="360" fill="url(#wallCreamGrad)" />
            <rect
              x="22"
              y="22"
              width="166"
              height="292"
              rx="6"
              fill="none"
              stroke="#E6D2B8"
              strokeWidth="2.5"
            />
            <rect
              x="212"
              y="22"
              width="166"
              height="292"
              rx="6"
              fill="none"
              stroke="#E6D2B8"
              strokeWidth="2.5"
            />
          </>
        )}

        {/* Độ sâu góc tường trái/phải */}
        <rect width="400" height="360" fill="url(#wallVignette)" />
        <line x1="14" y1="0" x2="14" y2="344" stroke="#4A3525" strokeOpacity="0.08" strokeWidth="2" />
        <line x1="386" y1="0" x2="386" y2="344" stroke="#4A3525" strokeOpacity="0.08" strokeWidth="2" />

        {/* Phào chỉ chân tường (Baseboard 3 lớp tạo khối) */}
        <g>
          <rect x="0" y="340" width="400" height="20" fill="#D8B388" stroke="#4A3525" strokeWidth="2.4" />
          <rect x="0" y="342" width="400" height="3.5" fill="#F4DEC2" />
          <rect x="0" y="354" width="400" height="5" fill="#B5895A" />
        </g>
      </svg>
    </div>
  );
}

export function FloorBackdrop({ floorId = 'floor_oak' }) {
  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <defs>
          {/* 1. Sàn gỗ sồi ghép xương cá */}
          <linearGradient id="oakBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9C69A" />
            <stop offset="100%" stopColor="#D7AD7B" />
          </linearGradient>
          <pattern id="herringboneOak" width="48" height="32" patternUnits="userSpaceOnUse">
            <path d="M0 16 L24 0 L48 16 M0 32 L24 16 L48 32" fill="none" stroke="#B78A56" strokeWidth="1.6" opacity="0.65" />
            <line x1="24" y1="0" x2="24" y2="32" stroke="#B78A56" strokeWidth="1.3" opacity="0.5" />
          </pattern>

          {/* 2. Sàn gỗ óc chó trầm có vân mắt gỗ */}
          <linearGradient id="walnutBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9E714E" />
            <stop offset="100%" stopColor="#7E5536" />
          </linearGradient>
          <pattern id="walnutPlanks" width="90" height="28" patternUnits="userSpaceOnUse">
            <rect width="90" height="28" fill="none" stroke="#53351F" strokeWidth="1.8" opacity="0.7" />
            <ellipse cx="38" cy="14" rx="14" ry="4" fill="none" stroke="#634026" strokeWidth="1.2" opacity="0.55" />
            <path d="M4 7 Q45 12 86 7" fill="none" stroke="#B68965" strokeWidth="1" opacity="0.35" />
          </pattern>

          {/* 3. Gạch caro kem-nâu cổ điển */}
          <pattern id="checkerTile" width="48" height="32" patternUnits="userSpaceOnUse">
            <rect width="48" height="32" fill="#F8EBDD" />
            <rect x="0" y="0" width="24" height="16" fill="#C9A27E" />
            <rect x="24" y="16" width="24" height="16" fill="#C9A27E" />
            <rect width="48" height="32" fill="none" stroke="#8C6747" strokeWidth="1" opacity="0.4" />
          </pattern>

          {/* 4. Đá Terrazzo hạt pastel */}
          <pattern id="terrazzoPattern" width="54" height="54" patternUnits="userSpaceOnUse">
            <rect width="54" height="54" fill="#F6EFEA" />
            <polygon points="10,8 17,6 15,14" fill="#FF9B71" opacity="0.85" />
            <polygon points="34,12 42,16 36,22" fill="#88C9A1" opacity="0.85" />
            <circle cx="24" cy="30" r="4" fill="#FFB7C5" opacity="0.85" />
            <polygon points="44,38 50,42 43,47" fill="#FFE082" opacity="0.95" />
            <circle cx="12" cy="42" r="2.8" fill="#B5927B" opacity="0.65" />
          </pattern>

          {/* 5. Hiên gỗ ban công viền cỏ */}
          <pattern id="deckPlanks" width="400" height="26" patternUnits="userSpaceOnUse">
            <rect width="400" height="24" fill="#DEB687" />
            <rect y="0" width="400" height="3" fill="#F1D3AC" />
            <rect y="23" width="400" height="3" fill="#7D5632" />
          </pattern>
        </defs>

        {floorId === 'floor_walnut' && (
          <>
            <rect width="400" height="240" fill="url(#walnutBase)" />
            <rect width="400" height="240" fill="url(#walnutPlanks)" />
          </>
        )}

        {floorId === 'floor_checker' && (
          <rect width="400" height="240" fill="url(#checkerTile)" />
        )}

        {floorId === 'floor_terrazzo' && (
          <rect width="400" height="240" fill="url(#terrazzoPattern)" />
        )}

        {floorId === 'floor_meadow' && (
          <>
            <rect width="400" height="240" fill="url(#deckPlanks)" />
            <path
              d="M0 0 L400 0 L400 22 Q360 34 320 20 Q280 34 240 22 Q200 36 160 20 Q120 34 80 22 Q40 34 0 22 Z"
              fill="#88C9A1"
              stroke="#4A3525"
              strokeWidth="2.2"
            />
            <path
              d="M0 0 L400 0 L400 12 Q340 22 280 12 Q210 22 140 12 Q70 22 0 12 Z"
              fill="#A8DFBC"
            />
          </>
        )}

        {(!floorId || floorId === 'floor_oak') && (
          <>
            <rect width="400" height="240" fill="url(#oakBase)" />
            <rect width="400" height="240" fill="url(#herringboneOak)" />
          </>
        )}

        {/* Bóng hắt từ phào chỉ chân tường xuống sàn */}
        <rect x="0" y="0" width="400" height="14" fill="#3D2616" fillOpacity="0.16" />
      </svg>
    </div>
  );
}

export function WallFloorThumbnail({ itemId }) {
  const isWall = itemId.startsWith('wall_');
  return (
    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#4A3525] shadow-sm relative">
      {isWall ? <WallBackdrop wallId={itemId} /> : <FloorBackdrop floorId={itemId} />}
    </div>
  );
}
