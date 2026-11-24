import React from 'react';

const INK = '#4A3525';

// =========================================================================
// 1. TƯỜNG & SÀN NHÀ BẾP (3 mẫu mỗi loại)
// =========================================================================
export function KitchenWallBackdrop({ wallId = 'kwall_tile_cream' }) {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="w-full h-full block">
      <defs>
        <pattern id="kSubwayCream" width="44" height="22" patternUnits="userSpaceOnUse">
          <rect width="44" height="22" fill="#FFF7EC" />
          <path d="M0 0 H44 M0 11 H44 M22 0 V11 M0 11 V22 M44 11 V22" stroke="#E8D8C6" strokeWidth="1.4" />
        </pattern>
        <pattern id="kMintTile" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="#E3F4EB" />
          <rect x="1" y="1" width="34" height="34" fill="none" stroke="#C5E3D3" strokeWidth="1.3" />
          <circle cx="18" cy="18" r="3.5" fill="#FFFDF9" opacity="0.85" />
          <circle cx="18" cy="18" r="1.4" fill="#88C9A1" opacity="0.7" />
        </pattern>
        <linearGradient id="kWallShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.2" />
          <stop offset="82%" stopColor="#8C5B38" stopOpacity="0" />
          <stop offset="100%" stopColor="#8C5B38" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {wallId === 'kwall_mint_tile' ? (
        <rect width="400" height="400" fill="url(#kMintTile)" />
      ) : wallId === 'kwall_butter' ? (
        <>
          <rect width="400" height="400" fill="#FFF2CE" />
          <rect x="0" y="295" width="400" height="105" fill="#F9E3AE" />
          <line x1="0" y1="295" x2="400" y2="295" stroke="#D8B376" strokeWidth="2.5" />
        </>
      ) : (
        <rect width="400" height="400" fill="url(#kSubwayCream)" />
      )}

      <rect width="400" height="400" fill="url(#kWallShade)" />
      {/* Phào chân tường gỗ ấm ngăn tường & sàn */}
      <rect x="0" y="382" width="400" height="18" fill="#E6C39A" />
      <line x1="0" y1="382" x2="400" y2="382" stroke={INK} strokeWidth="2.2" />
      <line x1="0" y1="399" x2="400" y2="399" stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}

export function KitchenFloorBackdrop({ floorId = 'kfloor_checker' }) {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="w-full h-full block">
      <defs>
        <pattern id="kFloorChecker" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="#F6E6D2" />
          <rect width="24" height="24" fill="#D9B28B" />
          <rect x="24" y="24" width="24" height="24" fill="#D9B28B" />
          <path d="M0 0 H48 M0 24 H48 M0 0 V48 M24 0 V48" stroke="#C0966D" strokeWidth="1" opacity="0.45" />
        </pattern>
        <pattern id="kFloorOak" width="80" height="36" patternUnits="userSpaceOnUse">
          <rect width="80" height="36" fill="#E3C199" />
          <path d="M0 18 H80 M0 36 H80 M40 0 V18 M16 18 V36" stroke="#C19A70" strokeWidth="1.5" />
        </pattern>
        <pattern id="kFloorTerrazzo" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#F1E1CE" />
          <polygon points="10,12 18,9 16,18" fill="#E29578" opacity="0.7" />
          <polygon points="40,18 47,14 49,24 41,25" fill="#C49A6C" opacity="0.65" />
          <polygon points="22,42 30,38 29,48" fill="#88C9A1" opacity="0.6" />
          <circle cx="48" cy="46" r="3" fill="#FFFDF9" opacity="0.8" />
          <circle cx="14" cy="34" r="2.2" fill="#9E7452" opacity="0.55" />
        </pattern>
        <linearGradient id="kFloorDepth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3525" stopOpacity="0.16" />
          <stop offset="18%" stopColor="#4A3525" stopOpacity="0" />
          <stop offset="100%" stopColor="#4A3525" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {floorId === 'kfloor_oak' ? (
        <rect width="400" height="400" fill="url(#kFloorOak)" />
      ) : floorId === 'kfloor_terrazzo' ? (
        <rect width="400" height="400" fill="url(#kFloorTerrazzo)" />
      ) : (
        <rect width="400" height="400" fill="url(#kFloorChecker)" />
      )}
      <rect width="400" height="400" fill="url(#kFloorDepth)" />
    </svg>
  );
}

// =========================================================================
// 2. TỦ LẠNH VINTAGE (fridge: fridge_cream | fridge_mint | fridge_berry)
// =========================================================================
export function FridgeSvg({ fridgeId = 'fridge_cream' }) {
  const body =
    fridgeId === 'fridge_mint'
      ? '#BFE8D4'
      : fridgeId === 'fridge_berry'
      ? '#FFD1DC'
      : '#FFF6E5';
  const shade =
    fridgeId === 'fridge_mint'
      ? '#9CD6BA'
      : fridgeId === 'fridge_berry'
      ? '#F4AEBE'
      : '#EFE0C6';

  return (
    <svg viewBox="0 0 110 180" className="w-full h-auto overflow-visible">
      <ellipse cx="55" cy="171" rx="44" ry="8" fill="#3D2616" opacity="0.18" />
      {/* Chân tủ */}
      <rect x="20" y="160" width="12" height="10" rx="4" fill={INK} />
      <rect x="78" y="160" width="12" height="10" rx="4" fill={INK} />
      {/* Thân tủ bo tròn retro */}
      <rect x="14" y="12" width="82" height="152" rx="18" fill={body} stroke={INK} strokeWidth="3.2" />
      <path d="M84 14 Q95 14 95 28 V146 Q95 162 82 162 H76 V14 Z" fill={shade} opacity="0.55" />
      {/* Khe ngăn đá & ngăn mát */}
      <line x1="15" y1="68" x2="95" y2="68" stroke={INK} strokeWidth="2.8" />
      {/* Tay nắm bạc bo tròn */}
      <rect x="76" y="34" width="7" height="22" rx="3.5" fill="#E6E1DA" stroke={INK} strokeWidth="2" />
      <rect x="76" y="82" width="7" height="30" rx="3.5" fill="#E6E1DA" stroke={INK} strokeWidth="2" />
      {/* Logo Smeg cute */}
      <rect x="38" y="25" width="28" height="7" rx="3.5" fill="#E6E1DA" stroke={INK} strokeWidth="1.6" />
      {/* Giấy nhớ & nam châm trên cánh tủ */}
      <rect x="26" y="84" width="24" height="22" rx="3" fill="#FFF3B0" stroke={INK} strokeWidth="1.8" transform="rotate(-4 38 95)" />
      <circle cx="38" cy="85" r="3.2" fill="#FF6B6B" stroke={INK} strokeWidth="1.3" />
      <line x1="30" y1="93" x2="45" y2="93" stroke={INK} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="30" y1="99" x2="42" y2="99" stroke={INK} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Sticker dâu / tim */}
      <circle cx="58" cy="122" r="5" fill="#FF9B71" stroke={INK} strokeWidth="1.5" />
      <circle cx="34" cy="128" r="4" fill="#88C9A1" stroke={INK} strokeWidth="1.5" />
    </svg>
  );
}

// =========================================================================
// 3. HỆ TỦ BẾP & BẾP NẤU (stove_oak | stove_french | stove_sage)
// =========================================================================
export function StoveCounterSvg({ stoveId = 'stove_oak', steaming = false }) {
  const cab =
    stoveId === 'stove_french'
      ? '#FFFDF9'
      : stoveId === 'stove_sage'
      ? '#B7D8C4'
      : '#E6BD8E';
  const counter =
    stoveId === 'stove_french'
      ? '#E9D6C0'
      : stoveId === 'stove_sage'
      ? '#F4E6D3'
      : '#FFF5E6';
  const potColor =
    stoveId === 'stove_french'
      ? '#FFB7C5'
      : stoveId === 'stove_sage'
      ? '#FFE082'
      : '#FF9B71';

  return (
    <svg viewBox="0 0 240 135" className="w-full h-auto overflow-visible">
      <ellipse cx="120" cy="127" rx="108" ry="8" fill="#3D2616" opacity="0.16" />
      {/* Thân tủ dưới */}
      <rect x="12" y="42" width="216" height="82" rx="10" fill={cab} stroke={INK} strokeWidth="3.2" />
      {/* Mặt bàn bếp */}
      <rect x="6" y="34" width="228" height="14" rx="6" fill={counter} stroke={INK} strokeWidth="3" />

      {/* Cánh tủ trái */}
      <rect x="20" y="54" width="54" height="62" rx="6" fill="none" stroke={INK} strokeWidth="2.2" />
      <circle cx="64" cy="84" r="3" fill={INK} />

      {/* Lò nướng ở giữa */}
      <rect x="84" y="54" width="72" height="62" rx="7" fill="#FFFDF9" stroke={INK} strokeWidth="2.4" />
      <rect x="94" y="68" width="52" height="36" rx="5" fill="#5D493C" stroke={INK} strokeWidth="2" />
      <rect x="98" y="72" width="44" height="10" rx="3" fill="#FFFDF9" opacity="0.18" />
      {/* 4 núm vặn bếp */}
      {[96, 112, 128, 144].map((cx) => (
        <circle key={cx} cx={cx} cy="60" r="3.2" fill="#FF9B71" stroke={INK} strokeWidth="1.5" />
      ))}

      {/* Ngăn kéo bên phải */}
      <rect x="166" y="54" width="54" height="28" rx="5" fill="none" stroke={INK} strokeWidth="2.2" />
      <line x1="186" y1="68" x2="200" y2="68" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="166" y="88" width="54" height="28" rx="5" fill="none" stroke={INK} strokeWidth="2.2" />
      <line x1="186" y1="102" x2="200" y2="102" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />

      {/* Nồi súp / Ấm trà đặt trên bếp */}
      {stoveId === 'stove_sage' ? (
        <g>
          {/* Ấm trà men sứ */}
          <ellipse cx="120" cy="24" rx="20" ry="13" fill={potColor} stroke={INK} strokeWidth="2.6" />
          <path d="M102 18 Q120 2 138 18" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M138 22 L150 14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="120" cy="13" rx="10" ry="4" fill="#FFFDF9" stroke={INK} strokeWidth="2" />
        </g>
      ) : (
        <g>
          {/* Nồi súp ấm áp */}
          <rect x="96" y="13" width="48" height="22" rx="7" fill={potColor} stroke={INK} strokeWidth="2.6" />
          <path d="M90 19 H96 M144 19 H150" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M94 14 Q120 4 146 14 Z" fill="#FFFDF9" stroke={INK} strokeWidth="2.4" />
          <circle cx="120" cy="7" r="3.5" fill={INK} />
        </g>
      )}

      {/* Thớt gỗ & bát nhỏ bên trái */}
      <rect x="24" y="25" width="38" height="9" rx="4" fill="#D59F6A" stroke={INK} strokeWidth="2" />
      <circle cx="192" cy="24" r="10" fill="#88C9A1" stroke={INK} strokeWidth="2.2" />
      <rect x="184" y="11" width="16" height="5" rx="2" fill="#FFFDF9" stroke={INK} strokeWidth="1.8" />

      {/* Làn khói trắng ấm bay lên */}
      <g opacity={steaming ? 1 : 0.65}>
        <path
          d="M110 4 Q105 -5 112 -12"
          fill="none"
          stroke="#FFFDF9"
          strokeWidth={steaming ? '4' : '2.8'}
          strokeLinecap="round"
        />
        <path
          d="M122 2 Q128 -7 120 -16"
          fill="none"
          stroke="#FFFDF9"
          strokeWidth={steaming ? '4.5' : '3'}
          strokeLinecap="round"
        />
        <path
          d="M134 5 Q139 -3 132 -11"
          fill="none"
          stroke="#FFFDF9"
          strokeWidth={steaming ? '3.5' : '2.5'}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// =========================================================================
// 4. KỆ GIA VỊ / DỤNG CỤ TREO TƯỜNG (kdecor_spice | kdecor_copper | kdecor_herbwin)
// =========================================================================
export function KitchenDecorSvg({ decorId = 'kdecor_spice' }) {
  if (decorId === 'kdecor_copper') {
    return (
      <svg viewBox="0 0 180 72" className="w-full h-auto overflow-visible">
        <line x1="12" y1="14" x2="168" y2="14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <circle cx="14" cy="14" r="4.5" fill="#E89D6B" stroke={INK} strokeWidth="2" />
        <circle cx="166" cy="14" r="4.5" fill="#E89D6B" stroke={INK} strokeWidth="2" />
        {/* Chảo đồng nhỏ */}
        <line x1="46" y1="14" x2="46" y2="30" stroke={INK} strokeWidth="2.5" />
        <circle cx="46" cy="46" r="16" fill="#E89D6B" stroke={INK} strokeWidth="2.6" />
        <circle cx="46" cy="46" r="10" fill="#F5BA8E" />
        {/* Muôi gỗ */}
        <line x1="92" y1="14" x2="92" y2="48" stroke="#C9925B" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="92" y1="14" x2="92" y2="48" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="92" cy="54" rx="9" ry="7" fill="#D9A36A" stroke={INK} strokeWidth="2.2" />
        {/* Xẻng & Chảo 2 */}
        <line x1="136" y1="14" x2="136" y2="34" stroke={INK} strokeWidth="2.5" />
        <circle cx="136" cy="48" r="13" fill="#FF9B71" stroke={INK} strokeWidth="2.4" />
      </svg>
    );
  }

  if (decorId === 'kdecor_herbwin') {
    return (
      <svg viewBox="0 0 180 86" className="w-full h-auto overflow-visible">
        <rect x="22" y="6" width="136" height="68" rx="12" fill="#D4F0FF" stroke={INK} strokeWidth="3.2" />
        <line x1="90" y1="6" x2="90" y2="74" stroke={INK} strokeWidth="2.6" />
        <line x1="22" y1="40" x2="158" y2="40" stroke={INK} strokeWidth="2.6" />
        {/* Bệ cửa gỗ */}
        <rect x="14" y="70" width="152" height="10" rx="5" fill="#DFB07D" stroke={INK} strokeWidth="2.6" />
        {/* 2 chậu húng quế nhỏ */}
        <path d="M44 58 H64 L61 70 H47 Z" fill="#FF9B71" stroke={INK} strokeWidth="2" />
        <circle cx="50" cy="52" r="6" fill="#88C9A1" stroke={INK} strokeWidth="1.8" />
        <circle cx="58" cy="51" r="6" fill="#6BB385" stroke={INK} strokeWidth="1.8" />
        <path d="M116 58 H136 L133 70 H119 Z" fill="#FFE082" stroke={INK} strokeWidth="2" />
        <circle cx="122" cy="52" r="5.5" fill="#88C9A1" stroke={INK} strokeWidth="1.8" />
        <circle cx="130" cy="52" r="5.5" fill="#6BB385" stroke={INK} strokeWidth="1.8" />
      </svg>
    );
  }

  // Mặc định: kdecor_spice
  return (
    <svg viewBox="0 0 180 68" className="w-full h-auto overflow-visible">
      {/* Đĩa gốm & hũ gia vị trên kệ */}
      <circle cx="38" cy="34" r="14" fill="#FFFDF9" stroke={INK} strokeWidth="2.4" />
      <circle cx="38" cy="34" r="8" fill="none" stroke="#FFB7C5" strokeWidth="2" />
      <rect x="64" y="24" width="18" height="24" rx="5" fill="#FFE082" stroke={INK} strokeWidth="2.2" />
      <rect x="66" y="19" width="14" height="5" rx="2" fill="#D59F6A" stroke={INK} strokeWidth="1.8" />
      <rect x="90" y="26" width="18" height="22" rx="5" fill="#FFB7C5" stroke={INK} strokeWidth="2.2" />
      <rect x="92" y="21" width="14" height="5" rx="2" fill="#D59F6A" stroke={INK} strokeWidth="1.8" />
      <rect x="116" y="22" width="18" height="26" rx="5" fill="#88C9A1" stroke={INK} strokeWidth="2.2" />
      <rect x="118" y="17" width="14" height="5" rx="2" fill="#D59F6A" stroke={INK} strokeWidth="1.8" />
      {/* Cốc gốm */}
      <rect x="142" y="30" width="16" height="18" rx="4" fill="#FFFDF9" stroke={INK} strokeWidth="2.2" />
      <path d="M158 34 Q165 39 158 44" fill="none" stroke={INK} strokeWidth="2.2" />
      {/* Thanh kệ gỗ */}
      <rect x="10" y="48" width="160" height="10" rx="5" fill="#DFB07D" stroke={INK} strokeWidth="2.8" />
    </svg>
  );
}

// =========================================================================
// 5. BÀN ĂN MINI (table_round | table_gingham | table_island)
// =========================================================================
export function DiningTableSvg({ tableId = 'table_round' }) {
  if (tableId === 'table_island') {
    return (
      <svg viewBox="0 0 150 115" className="w-full h-auto overflow-visible">
        <ellipse cx="75" cy="107" rx="64" ry="8" fill="#3D2616" opacity="0.16" />
        <rect x="18" y="42" width="114" height="62" rx="10" fill="#B7D8C4" stroke={INK} strokeWidth="3" />
        <rect x="10" y="34" width="130" height="14" rx="6" fill="#FFFDF9" stroke={INK} strokeWidth="2.8" />
        {/* 2 ly trà sữa trân châu đôi */}
        <path d="M44 12 H62 L59 34 H47 Z" fill="#F2D2B6" stroke={INK} strokeWidth="2.2" />
        <line x1="53" y1="3" x2="53" y2="14" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="51" cy="29" r="2" fill={INK} />
        <circle cx="56" cy="29" r="2" fill={INK} />

        <path d="M84 12 H102 L99 34 H87 Z" fill="#FFD1DC" stroke={INK} strokeWidth="2.2" />
        <line x1="93" y1="3" x2="93" y2="14" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="91" cy="29" r="2" fill={INK} />
        <circle cx="96" cy="29" r="2" fill={INK} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 150 115" className="w-full h-auto overflow-visible">
      <ellipse cx="75" cy="106" rx="60" ry="8" fill="#3D2616" opacity="0.16" />
      {/* Chân bàn gỗ */}
      <rect x="34" y="54" width="10" height="50" rx="4" fill="#C9925B" stroke={INK} strokeWidth="2.6" />
      <rect x="106" y="54" width="10" height="50" rx="4" fill="#C9925B" stroke={INK} strokeWidth="2.6" />
      {/* Mặt bàn */}
      <ellipse
        cx="75"
        cy="48"
        rx="62"
        ry="22"
        fill={tableId === 'table_gingham' ? '#FFFDF9' : '#E6BD8E'}
        stroke={INK}
        strokeWidth="3"
      />
      {tableId === 'table_gingham' && (
        <path
          d="M16 50 Q45 72 75 66 Q105 72 134 50 L128 38 Q75 56 22 38 Z"
          fill="#FF8A8A"
          opacity="0.72"
          stroke={INK}
          strokeWidth="2.2"
        />
      )}
      {/* Đĩa bánh kem dâu trên bàn */}
      <ellipse cx="75" cy="44" rx="22" ry="8" fill="#FFFDF9" stroke={INK} strokeWidth="2.2" />
      <path d="M62 42 Q62 24 75 24 Q88 24 88 42 Z" fill="#FFE8B6" stroke={INK} strokeWidth="2.2" />
      <path d="M62 32 Q69 38 75 32 Q81 38 88 32 Q88 24 75 24 Q62 24 62 32 Z" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
      <circle cx="75" cy="21" r="4.5" fill="#FF5A5F" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
}

// =========================================================================
// 6. BÁT ĂN ĐÔI CỦA THÚ (bowl_cat | bowl_wood | bowl_fish)
// =========================================================================
export function PetBowlSvg({ bowlId = 'bowl_cat' }) {
  const matColor =
    bowlId === 'bowl_wood'
      ? '#E6BD8E'
      : bowlId === 'bowl_fish'
      ? '#C7E8F3'
      : '#FFE4EC';
  const bowlColor =
    bowlId === 'bowl_wood'
      ? '#FFFDF9'
      : bowlId === 'bowl_fish'
      ? '#FFB7C5'
      : '#FFE082';

  return (
    <svg viewBox="0 0 120 72" className="w-full h-auto overflow-visible">
      <ellipse cx="60" cy="60" rx="54" ry="11" fill="#3D2616" opacity="0.14" />
      {/* Thảm lót */}
      <rect x="6" y="34" width="108" height="30" rx="14" fill={matColor} stroke={INK} strokeWidth="2.6" />
      {/* Bát hạt bên trái */}
      <path d="M18 46 Q18 28 38 28 Q58 28 58 46 Q58 55 38 55 Q18 55 18 46 Z" fill={bowlColor} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="38" cy="36" rx="15" ry="6" fill="#C98A54" stroke={INK} strokeWidth="1.8" />
      <circle cx="33" cy="35" r="2.2" fill="#8C5832" />
      <circle cx="39" cy="34" r="2.2" fill="#8C5832" />
      <circle cx="43" cy="36" r="2.2" fill="#8C5832" />
      {/* Bát nước bên phải */}
      <path d="M62 46 Q62 28 82 28 Q102 28 102 46 Q102 55 82 55 Q62 55 62 46 Z" fill={bowlColor} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="82" cy="36" rx="15" ry="6" fill="#A2E1F6" stroke={INK} strokeWidth="1.8" />
      <path d="M75 35 Q82 33 88 36" fill="none" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// =========================================================================
// THUMBNAIL CHO DECORATOR DRAWER
// =========================================================================
export function KitchenItemThumbnail({ item }) {
  if (!item) return null;
  if (item.slot === 'kitchenWall') {
    return (
      <div className="w-14 h-12 rounded-xl overflow-hidden border-[1.8px] border-[#4A3525]">
        <KitchenWallBackdrop wallId={item.id} />
      </div>
    );
  }
  if (item.slot === 'kitchenFloor') {
    return (
      <div className="w-14 h-12 rounded-xl overflow-hidden border-[1.8px] border-[#4A3525]">
        <KitchenFloorBackdrop floorId={item.id} />
      </div>
    );
  }
  if (item.slot === 'fridge') {
    return (
      <div className="w-12 h-14 flex items-center justify-center">
        <FridgeSvg fridgeId={item.id} />
      </div>
    );
  }
  if (item.slot === 'stoveCounter') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <StoveCounterSvg stoveId={item.id} />
      </div>
    );
  }
  if (item.slot === 'kitchenDecor') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <KitchenDecorSvg decorId={item.id} />
      </div>
    );
  }
  if (item.slot === 'diningTable') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <DiningTableSvg tableId={item.id} />
      </div>
    );
  }
  if (item.slot === 'petBowl') {
    return (
      <div className="w-16 h-12 flex items-center justify-center">
        <PetBowlSvg bowlId={item.id} />
      </div>
    );
  }
  return null;
}
