import React from 'react';

const INK = '#4A3525';

// Icon cửa hàng mini cho ArcadeModal & MarketModal
export function MartIconSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      {/* Mái hiên sọc cam-kem */}
      <path d="M8 24 L14 10 H50 L56 24 Z" fill="#FF9B71" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M20 10 L18 24 H28 L28 10 Z M40 10 L40 24 H50 L46 10 Z" fill="#FFFDF9" />
      <path d="M8 24 Q14 31 20 24 Q26 31 32 24 Q38 31 44 24 Q50 31 56 24" fill="#FF9B71" stroke={INK} strokeWidth="2.4" />
      {/* Thân siêu thị */}
      <rect x="11" y="26" width="42" height="30" rx="5" fill="#FFF8F0" stroke={INK} strokeWidth="2.6" />
      {/* Cửa kính */}
      <rect x="17" y="34" width="14" height="22" rx="3" fill="#CFEAF7" stroke={INK} strokeWidth="2.2" />
      <rect x="35" y="34" width="13" height="13" rx="3" fill="#FFE082" stroke={INK} strokeWidth="2.2" />
      <circle cx="28" cy="45" r="1.5" fill={INK} />
    </svg>
  );
}

// 6 Quầy hàng siêu thị vẽ tay Cozy Pastel (hoặc tấm phủ bạt khóa nếu level === 0)
export function StallSvg({ stallId, level = 0, className = 'w-full h-full' }) {
  if (level <= 0) {
    return (
      <svg viewBox="0 0 110 82" className={className}>
        <ellipse cx="55" cy="74" rx="44" ry="7" fill="#3D2616" opacity="0.14" />
        {/* Tấm phủ bạt kem mờ */}
        <path
          d="M14 32 Q55 18 96 32 L92 68 Q55 75 18 68 Z"
          fill="#EAE0D5"
          stroke={INK}
          strokeWidth="2.6"
          strokeDasharray="5 3"
        />
        {/* Ổ khóa */}
        <rect x="44" y="42" width="22" height="17" rx="4" fill="#FFE082" stroke={INK} strokeWidth="2.2" />
        <path d="M49 42 V36 A6 6 0 0 1 61 36 V42" fill="none" stroke={INK} strokeWidth="2.5" />
        <circle cx="55" cy="50" r="2.2" fill={INK} />
      </svg>
    );
  }

  const isUpgraded = level >= 10;
  const awningColor =
    stallId === 'bakery'
      ? '#FFAC6B'
      : stallId === 'veggie'
      ? '#88C9A1'
      : stallId === 'boba'
      ? '#FFB7C5'
      : stallId === 'seafood'
      ? '#89CFF0'
      : stallId === 'petshop'
      ? '#FF9B71'
      : '#C8A8F0';

  return (
    <svg viewBox="0 0 110 86" className={className}>
      <ellipse cx="55" cy="78" rx="46" ry="7" fill="#3D2616" opacity="0.16" />
      {/* Quầy kệ gỗ */}
      <rect x="14" y="34" width="82" height="40" rx="8" fill="#FFFDF9" stroke={INK} strokeWidth="2.8" />
      <rect x="14" y="54" width="82" height="20" rx="6" fill="#E6BD8E" stroke={INK} strokeWidth="2.6" />

      {/* Đồ trưng bày theo từng loại quầy */}
      {stallId === 'bakery' && (
        <g>
          <ellipse cx="33" cy="46" rx="10" ry="6" fill="#E6A15C" stroke={INK} strokeWidth="2" />
          <ellipse cx="56" cy="46" rx="10" ry="6" fill="#F2B872" stroke={INK} strokeWidth="2" />
          <rect x="72" y="37" width="12" height="15" rx="3" fill="#CFEAF7" stroke={INK} strokeWidth="2" />
        </g>
      )}
      {stallId === 'veggie' && (
        <g>
          <circle cx="32" cy="46" r="8" fill="#FF9B5E" stroke={INK} strokeWidth="2" />
          <circle cx="54" cy="46" r="8" fill="#88C9A1" stroke={INK} strokeWidth="2" />
          <circle cx="76" cy="46" r="8" fill="#FFE066" stroke={INK} strokeWidth="2" />
        </g>
      )}
      {stallId === 'boba' && (
        <g>
          <path d="M26 37 H40 L38 52 H28 Z" fill="#F2D2B6" stroke={INK} strokeWidth="2" />
          <path d="M48 37 H62 L60 52 H50 Z" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
          <path d="M70 37 H84 L82 52 H72 Z" fill="#C7EBD6" stroke={INK} strokeWidth="2" />
        </g>
      )}
      {stallId === 'seafood' && (
        <g>
          <rect x="20" y="39" width="70" height="13" rx="5" fill="#DFF4FC" stroke={INK} strokeWidth="1.8" />
          <ellipse cx="39" cy="45" rx="12" ry="5" fill="#FF8C73" stroke={INK} strokeWidth="1.8" />
          <ellipse cx="70" cy="45" rx="11" ry="5" fill="#FFA494" stroke={INK} strokeWidth="1.8" />
        </g>
      )}
      {stallId === 'petshop' && (
        <g>
          <rect x="24" y="39" width="16" height="13" rx="3" fill="#FF9B71" stroke={INK} strokeWidth="2" />
          <circle cx="56" cy="45" r="7.5" fill="#FFE082" stroke={INK} strokeWidth="2" />
          <rect x="70" y="39" width="16" height="13" rx="3" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
        </g>
      )}
      {stallId === 'gift' && (
        <g>
          <rect x="24" y="38" width="17" height="14" rx="3" fill="#FFB7C5" stroke={INK} strokeWidth="2" />
          <line x1="32.5" y1="38" x2="32.5" y2="52" stroke="#FFE066" strokeWidth="2.5" />
          <rect x="47" y="37" width="17" height="15" rx="3" fill="#C8A8F0" stroke={INK} strokeWidth="2" />
          <line x1="55.5" y1="37" x2="55.5" y2="52" stroke="#FFFDF9" strokeWidth="2.5" />
          <rect x="70" y="38" width="16" height="14" rx="3" fill="#FFE082" stroke={INK} strokeWidth="2" />
        </g>
      )}

      {/* Mái hiên trên đầu quầy */}
      <path
        d="M10 34 L16 16 H94 L100 34 Z"
        fill={awningColor}
        stroke={INK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M28 16 L25 34 H41 L42 16 Z M68 16 L69 34 H85 L82 16 Z" fill="#FFFDF9" opacity="0.85" />
      <path
        d="M10 34 Q21 41 32 34 Q43 41 55 34 Q67 41 78 34 Q89 41 100 34"
        fill={awningColor}
        stroke={INK}
        strokeWidth="2.2"
      />

      {/* Sao vàng nâng cấp mốc Level 10+ */}
      {isUpgraded && (
        <path
          d="M94 6 L96.2 11 L101.5 11.6 L97.5 15.2 L98.6 20.5 L94 17.8 L89.4 20.5 L90.5 15.2 L86.5 11.6 L91.8 11 Z"
          fill="#FFE066"
          stroke={INK}
          strokeWidth="1.6"
        />
      )}
    </svg>
  );
}

// Quầy Thu Ngân (góc dưới-trái sân khấu)
export function CashierDeskSvg({ hasSecondLane = false, className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 116 74" className={className}>
      <ellipse cx="58" cy="67" rx="50" ry="6" fill="#3D2616" opacity="0.16" />
      {/* Quầy gỗ chữ L */}
      <rect x="10" y="28" width="96" height="36" rx="8" fill="#DFB07D" stroke={INK} strokeWidth="2.8" />
      <rect x="6" y="23" width="104" height="10" rx="5" fill="#FFFDF9" stroke={INK} strokeWidth="2.5" />
      {/* Máy tính tiền 1 */}
      <rect x="20" y="9" width="24" height="16" rx="4" fill="#88C9A1" stroke={INK} strokeWidth="2.2" />
      <rect x="24" y="13" width="16" height="6" rx="2" fill="#FFFDF9" stroke={INK} strokeWidth="1.4" />
      {/* Máy tính tiền 2 (mở ở Cashier Lv 5) */}
      {hasSecondLane && (
        <g>
          <rect x="64" y="9" width="24" height="16" rx="4" fill="#FFE082" stroke={INK} strokeWidth="2.2" />
          <rect x="68" y="13" width="16" height="6" rx="2" fill="#FFFDF9" stroke={INK} strokeWidth="1.4" />
        </g>
      )}
      {/* Biển chữ PAY nhỏ */}
      <rect x="44" y="40" width="28" height="13" rx="4" fill="#FFE082" stroke={INK} strokeWidth="1.8" />
      <text x="58" y="50" textAnchor="middle" fontSize="8.5" fontWeight="900" fill={INK}>
        PAY
      </text>
    </svg>
  );
}

// Khách hàng thú SVG (tabby | shiba | duck | bunny | capybara) + hào quang VIP
export function CustomerPetSvg({ species = 'tabby', isVip = false, className = 'w-10 h-10' }) {
  const palette = {
    tabby: { fur: '#F5C48D', ear: '#E69C5C', cheek: '#FFB7C5' },
    shiba: { fur: '#F4BE6A', ear: '#D9933B', cheek: '#FF9B71' },
    duck: { fur: '#FFE27A', ear: '#FFE27A', cheek: '#FF9B71' },
    bunny: { fur: '#FFFDF9', ear: '#FFD6E3', cheek: '#FFB7C5' },
    capybara: { fur: '#C9986B', ear: '#9C6D43', cheek: '#FF9B71' }
  }[species] || { fur: '#F5C48D', ear: '#E69C5C', cheek: '#FFB7C5' };

  return (
    <svg viewBox="0 0 48 52" className={className}>
      {isVip && (
        <circle cx="24" cy="27" r="22" fill="#FFE066" opacity="0.45" />
      )}
      <ellipse cx="24" cy="47" rx="12" ry="3.5" fill="#3D2616" opacity="0.2" />

      {/* Tai theo loài */}
      {species === 'bunny' ? (
        <>
          <ellipse cx="17" cy="11" rx="4" ry="10" fill={palette.fur} stroke={INK} strokeWidth="2.2" />
          <ellipse cx="31" cy="11" rx="4" ry="10" fill={palette.fur} stroke={INK} strokeWidth="2.2" />
        </>
      ) : species === 'duck' ? null : (
        <>
          <circle cx="13" cy="17" r="5" fill={palette.ear} stroke={INK} strokeWidth="2.2" />
          <circle cx="35" cy="17" r="5" fill={palette.ear} stroke={INK} strokeWidth="2.2" />
        </>
      )}

      {/* Thân & đầu chibi tròn */}
      <rect x="11" y="16" width="26" height="29" rx="13" fill={palette.fur} stroke={INK} strokeWidth="2.4" />
      <ellipse cx="16" cy="30" rx="2.8" ry="1.8" fill={palette.cheek} opacity="0.8" />
      <ellipse cx="32" cy="30" rx="2.8" ry="1.8" fill={palette.cheek} opacity="0.8" />

      {/* Mắt / Kính râm VIP */}
      {isVip ? (
        <g>
          <rect x="14" y="23" width="8.5" height="6" rx="2" fill={INK} />
          <rect x="25.5" y="23" width="8.5" height="6" rx="2" fill={INK} />
          <line x1="22.5" y1="25.5" x2="25.5" y2="25.5" stroke={INK} strokeWidth="2" />
          {/* Vương miện nhỏ */}
          <path d="M16 15 L19 7 L24 12 L29 7 L32 15 Z" fill="#FFE066" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      ) : (
        <>
          <circle cx="18.5" cy="26" r="2" fill={INK} />
          <circle cx="29.5" cy="26" r="2" fill={INK} />
        </>
      )}

      {/* Mỏ vịt hoặc miệng xinh */}
      {species === 'duck' ? (
        <ellipse cx="24" cy="30" rx="5" ry="2.6" fill="#FF9B5E" stroke={INK} strokeWidth="1.6" />
      ) : (
        <path d="M21.5 30 Q24 32.5 26.5 30" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

// Chân dung nhân viên thú cho Tab Nhân Viên & trên sân khấu
export function StaffBadgeSvg({ staffId, className = 'w-10 h-10' }) {
  const map = {
    cashier: 'tabby',
    stocker: 'capybara',
    promoter: 'shiba',
    manager: 'bunny'
  };
  return <CustomerPetSvg species={map[staffId] || 'tabby'} isVip={staffId === 'manager'} className={className} />;
}
