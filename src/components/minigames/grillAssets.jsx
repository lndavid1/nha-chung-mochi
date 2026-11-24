import React from 'react';

export const SKEWER_TYPES = [
  { id: 'burger', name: 'Burger Mini', accent: '#FF9B71' },
  { id: 'veggie', name: 'Ớt Chuông Thịt', accent: '#88C9A1' },
  { id: 'pineapple', name: 'Dứa Nướng Mật', accent: '#FFE082' },
  { id: 'mochi', name: 'Mochi Hồng', accent: '#FFB7C5' },
  { id: 'carrot', name: 'Tôm Cà Rốt', accent: '#FFA366' },
  { id: 'pizza', name: 'Pizza Mini', accent: '#FFD166' },
  { id: 'squid', name: 'Mực Nướng Cay', accent: '#F27D72' },
  { id: 'donut', name: 'Donut Dâu', accent: '#F9A8D4' },
  { id: 'naruto', name: 'Chả Cá Naruto', accent: '#FDBA74' },
  { id: 'corn', name: 'Bắp Nướng Bơ', accent: '#FDE047' },
  { id: 'avocado', name: 'Bơ Trứng Ốp', accent: '#A3D9A5' },
  { id: 'corndog', name: 'Xúc Xích Phô Mai', accent: '#E69A5C' }
];

const INK = '#4A3525';

/**
 * 12 Loại Xiên Nướng SVG sắc nét (không dùng emoji thô)
 * Tỉ lệ đứng gọn gàng (viewBox 0 0 44 64) dễ nhận diện kể cả ở kích thước mini 16px trong Khay Xem Trước
 */
export function SkewerSvg({ type, className = 'w-full h-full' }) {
  // Que tre chung phía sau
  const stick = (
    <line
      x1="22"
      y1="4"
      x2="22"
      y2="61"
      stroke="#C9925B"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  );
  const stickOutline = (
    <line
      x1="22"
      y1="4"
      x2="22"
      y2="61"
      stroke={INK}
      strokeWidth="4.6"
      strokeLinecap="round"
    />
  );

  switch (type) {
    // 1. Xiên 2 chiếc Burger mini
    case 'burger':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          {[18, 40].map((cy) => (
            <g key={cy}>
              <path
                d={`M10 ${cy} C10 ${cy - 9} 34 ${cy - 9} 34 ${cy} Z`}
                fill="#F4B36C"
                stroke={INK}
                strokeWidth="2.2"
              />
              <rect x="9" y={cy} width="26" height="4.5" rx="2" fill="#88C9A1" stroke={INK} strokeWidth="1.8" />
              <rect x="10" y={cy + 4} width="24" height="4.5" rx="2" fill="#9E5B3B" stroke={INK} strokeWidth="1.8" />
              <rect x="11" y={cy + 8} width="22" height="4" rx="2" fill="#F4B36C" stroke={INK} strokeWidth="1.8" />
            </g>
          ))}
        </svg>
      );

    // 2. Xiên ớt chuông xanh & thịt vuông
    case 'veggie':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          <rect x="12" y="10" width="20" height="11" rx="4" fill="#88C9A1" stroke={INK} strokeWidth="2.2" />
          <rect x="11" y="23" width="22" height="12" rx="3" fill="#B56542" stroke={INK} strokeWidth="2.2" />
          <line x1="15" y1="27" x2="29" y2="27" stroke="#6E361E" strokeWidth="2" strokeLinecap="round" />
          <rect x="12" y="37" width="20" height="11" rx="4" fill="#6BB387" stroke={INK} strokeWidth="2.2" />
        </svg>
      );

    // 3. Xiên khoanh dứa vàng
    case 'pineapple':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          {[19, 39].map((cy) => (
            <g key={cy}>
              <circle cx="22" cy={cy} r="11" fill="#FFE082" stroke={INK} strokeWidth="2.2" />
              <circle cx="22" cy={cy} r="4" fill="#FFF8F0" stroke={INK} strokeWidth="1.8" />
              <line x1="22" y1={cy - 10} x2="22" y2={cy - 5} stroke="#E8A735" strokeWidth="1.8" />
              <line x1="22" y1={cy + 5} x2="22" y2={cy + 10} stroke="#E8A735" strokeWidth="1.8" />
              <line x1="12" y1={cy} x2="17" y2={cy} stroke="#E8A735" strokeWidth="1.8" />
              <line x1="27" y1={cy} x2="32" y2={cy} stroke="#E8A735" strokeWidth="1.8" />
            </g>
          ))}
        </svg>
      );

    // 4. Xiên bánh Mochi hồng (Dango 3 viên)
    case 'mochi':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          <circle cx="22" cy="15" r="8.5" fill="#FFB7C5" stroke={INK} strokeWidth="2.2" />
          <circle cx="22" cy="30" r="8.5" fill="#FFFDF9" stroke={INK} strokeWidth="2.2" />
          <circle cx="22" cy="45" r="8.5" fill="#A6E0BC" stroke={INK} strokeWidth="2.2" />
          <circle cx="19" cy="13" r="2" fill="#FFFDF9" opacity="0.8" />
          <circle cx="19" cy="43" r="2" fill="#FFFDF9" opacity="0.8" />
        </svg>
      );

    // 5. Xiên cà rốt / tôm cam
    case 'carrot':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          {[19, 39].map((cy) => (
            <g key={cy}>
              <path
                d={`M12 ${cy + 5} C9 ${cy - 7} 26 ${cy - 11} 33 ${cy - 2} C36 ${cy + 4} 28 ${cy + 9} 22 ${cy + 5}`}
                fill="#FF9B71"
                stroke={INK}
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d={`M17 ${cy - 2} L21 ${cy + 1} M24 ${cy - 4} L27 ${cy}`} stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      );

    // 6. Xiên 2 miếng Pizza tam giác
    case 'pizza':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          {[10, 32].map((ty) => (
            <g key={ty}>
              <polygon
                points={`10,${ty} 34,${ty} 22,${ty + 20}`}
                fill="#FFE082"
                stroke={INK}
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <rect x="9" y={ty - 2} width="26" height="5" rx="2.5" fill="#E69A5C" stroke={INK} strokeWidth="2" />
              <circle cx="19" cy={ty + 7} r="2.5" fill="#E85D75" />
              <circle cx="25" cy={ty + 10} r="2.2" fill="#E85D75" />
            </g>
          ))}
        </svg>
      );

    // 7. Mực nướng nguyên con đỏ cam
    case 'squid':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          {/* Đầu mực hình chóp */}
          <path
            d="M22 8 L33 24 L29 44 L15 44 L11 24 Z"
            fill="#F27D72"
            stroke={INK}
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          {/* Khía nướng ngang */}
          <line x1="15" y1="26" x2="29" y2="26" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="33" x2="28" y2="33" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          {/* Râu mực */}
          <path d="M16 44 L13 53 M22 44 L22 54 M28 44 L31 53" stroke="#F27D72" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M16 44 L13 53 M22 44 L22 54 M28 44 L31 53" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // 8. Xiên bánh Donut phủ kem hồng
    case 'donut':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          {[19, 40].map((cy) => (
            <g key={cy}>
              <circle cx="22" cy={cy} r="10.5" fill="#E8B886" stroke={INK} strokeWidth="2.2" />
              <path
                d={`M12 ${cy} A10 10 0 0 1 32 ${cy} Q28 ${cy + 4} 22 ${cy + 2} Q16 ${cy + 4} 12 ${cy} Z`}
                fill="#FFB7C5"
                stroke={INK}
                strokeWidth="1.8"
              />
              <circle cx="22" cy={cy} r="3.4" fill="#FFF8F0" stroke={INK} strokeWidth="1.8" />
              <circle cx="17" cy={cy - 4} r="1.2" fill="#FFE082" />
              <circle cx="27" cy={cy - 4} r="1.2" fill="#88C9A1" />
            </g>
          ))}
        </svg>
      );

    // 9. Xiên chả cá Naruto xoắn cam
    case 'naruto':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          {[19, 40].map((cy) => (
            <g key={cy}>
              <circle cx="22" cy={cy} r="10.5" fill="#FFFDF9" stroke={INK} strokeWidth="2.2" strokeDasharray="4 2" />
              <circle cx="22" cy={cy} r="9" fill="#FFFDF9" stroke={INK} strokeWidth="1.8" />
              <path
                d={`M22 ${cy} m-5 0 a5 5 0 1 0 10 0 a3.5 3.5 0 1 0 -7 0 a1.8 1.8 0 1 0 3.6 0`}
                fill="none"
                stroke="#FF8A65"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
          ))}
        </svg>
      );

    // 10. Xiên bắp nướng sốt bơ
    case 'corn':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          <rect x="13" y="10" width="18" height="38" rx="9" fill="#FFE082" stroke={INK} strokeWidth="2.3" />
          <line x1="13" y1="20" x2="31" y2="20" stroke="#D9A026" strokeWidth="1.8" />
          <line x1="13" y1="29" x2="31" y2="29" stroke="#D9A026" strokeWidth="1.8" />
          <line x1="13" y1="38" x2="31" y2="38" stroke="#D9A026" strokeWidth="1.8" />
          <line x1="22" y1="11" x2="22" y2="47" stroke="#D9A026" strokeWidth="1.8" />
        </svg>
      );

    // 11. Xiên bơ trứng ốp la
    case 'avocado':
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          <ellipse cx="22" cy="29" rx="12" ry="18" fill="#88C9A1" stroke={INK} strokeWidth="2.3" />
          <ellipse cx="22" cy="29" rx="9" ry="14" fill="#D5F2B8" />
          <circle cx="22" cy="34" r="5.5" fill="#A66B43" stroke={INK} strokeWidth="2" />
          <circle cx="20.5" cy="32.5" r="1.5" fill="#FFFDF9" opacity="0.7" />
        </svg>
      );

    // 12. Xúc xích phô mai xịt sốt (Corndog)
    case 'corndog':
    default:
      return (
        <svg viewBox="0 0 44 64" className={className}>
          {stickOutline}
          {stick}
          <rect x="13" y="9" width="18" height="39" rx="9" fill="#E69A5C" stroke={INK} strokeWidth="2.3" />
          {/* Đường sốt cà chua & mù tạt zic-zac */}
          <path
            d="M15 16 L29 21 L15 27 L29 33 L15 39"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 15 L15 21 L29 27 L15 33 L29 39"
            fill="none"
            stroke="#FFE082"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

// Xiên Giấy Bạc Bí Ẩn (?)
export function MysteryFoilSvg({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 44 64" className={className}>
      <line x1="22" y1="4" x2="22" y2="61" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <rect x="10" y="10" width="24" height="38" rx="8" fill="#D9D6D0" stroke={INK} strokeWidth="2.3" />
      <path d="M12 18 L32 14 M12 36 L32 40" stroke="#FFFDF9" strokeWidth="2" opacity="0.7" />
      <text x="22" y="36" textAnchor="middle" fill={INK} fontSize="18" fontWeight="900">
        ?
      </text>
    </svg>
  );
}

// 4 Icon Booster sắc nét (Xẻng Xúc, Đảo Xiên, Hộp Đóng Gói, Hoàn Tác)
export function BoosterIconSvg({ kind, className = 'w-6 h-6' }) {
  if (kind === 'spatula') {
    return (
      <svg viewBox="0 0 36 36" className={className}>
        <rect x="15" y="17" width="6" height="15" rx="3" fill="#C9925B" stroke={INK} strokeWidth="2.2" />
        <rect x="9" y="4" width="18" height="14" rx="4" fill="#E6E1DA" stroke={INK} strokeWidth="2.2" />
        <line x1="14" y1="8" x2="14" y2="14" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="8" x2="22" y2="14" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'shuffle') {
    return (
      <svg viewBox="0 0 36 36" className={className}>
        <path d="M6 12 H14 L22 24 H29" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 24 H14 L22 12 H29" fill="none" stroke="#E87A4D" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="26,8 32,12 26,16" fill={INK} />
        <polygon points="26,20 32,24 26,28" fill={INK} />
      </svg>
    );
  }
  if (kind === 'pack') {
    return (
      <svg viewBox="0 0 36 36" className={className}>
        <rect x="6" y="12" width="24" height="18" rx="4" fill="#FFE082" stroke={INK} strokeWidth="2.2" />
        <path d="M4 12 L10 6 H26 L32 12 Z" fill="#FF9B71" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <line x1="18" y1="12" x2="18" y2="30" stroke={INK} strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <path d="M12 14 H22 C26 14 29 17 29 21 C29 25 26 28 22 28 H14" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <polygon points="14,8 6,14 14,20" fill="#88C9A1" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
