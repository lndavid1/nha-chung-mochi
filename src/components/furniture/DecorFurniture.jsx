import React from 'react';

// 5 Mẫu Nội Thất Lớn (Đèn cây bật/tắt sáng, Kệ sách cây rủ, Bàn trà bốc khói, Tủ đĩa than xoay, Ghế lười)
export function DecorFurnitureSvg({
  decorId = 'decor_lamp',
  lampOn = true,
  isNight = false
}) {
  // Mẫu 2: Kệ sách gỗ nhiều tầng đầy sách màu + chậu cây rủ (decor_bookshelf)
  if (decorId === 'decor_bookshelf') {
    return (
      <svg viewBox="0 0 115 145" className="w-full h-full overflow-visible">
        <ellipse cx="58" cy="134" rx="46" ry="9" fill="#3D2616" fillOpacity="0.16" />
        {/* Thân tủ kệ gỗ sồi 3 lớp */}
        <rect x="16" y="24" width="84" height="108" rx="8" fill="#C9925B" stroke="#4A3525" strokeWidth="2.5" />
        <rect x="20" y="28" width="76" height="100" rx="5" fill="#E4B37E" />
        {/* 3 Hộc kệ bên trong */}
        <rect x="23" y="32" width="70" height="28" rx="3" fill="#FFF5E6" stroke="#4A3525" strokeWidth="2" />
        <rect x="23" y="65" width="70" height="28" rx="3" fill="#FFF5E6" stroke="#4A3525" strokeWidth="2" />
        <rect x="23" y="98" width="70" height="26" rx="3" fill="#FFF5E6" stroke="#4A3525" strokeWidth="2" />
        {/* Sách nhiều màu tầng 1 & 2 */}
        <rect x="27" y="37" width="10" height="23" rx="2" fill="#FF9B71" stroke="#4A3525" strokeWidth="1.8" />
        <rect x="38" y="40" width="9" height="20" rx="2" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.8" />
        <rect x="48" y="35" width="11" height="25" rx="2" fill="#FFE082" stroke="#4A3525" strokeWidth="1.8" />
        <rect x="27" y="70" width="12" height="23" rx="2" fill="#FFB7C5" stroke="#4A3525" strokeWidth="1.8" />
        <rect x="40" y="73" width="10" height="20" rx="2" fill="#89CFF0" stroke="#4A3525" strokeWidth="1.8" />
        {/* Hộp mây tầng 3 */}
        <rect x="30" y="103" width="24" height="21" rx="3" fill="#DDA772" stroke="#4A3525" strokeWidth="1.8" />
        <rect x="60" y="103" width="24" height="21" rx="3" fill="#DDA772" stroke="#4A3525" strokeWidth="1.8" />
        {/* Chậu cây dây rủ đặt trên nóc kệ */}
        <rect x="64" y="12" width="22" height="12" rx="3" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.2" />
        <path
          d="M78 24 Q88 38 82 54 Q78 68 86 80"
          fill="none"
          stroke="#5EA87A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="84" cy="36" r="4.5" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.6" />
        <circle cx="80" cy="50" r="4.5" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.6" />
        <circle cx="84" cy="66" r="4" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.6" />
      </svg>
    );
  }

  // Mẫu 3: Bàn trà thấp kiểu Nhật có tách trà bốc khói mờ bay lên (decor_teatable)
  if (decorId === 'decor_teatable') {
    return (
      <svg viewBox="0 0 120 135" className="w-full h-full overflow-visible">
        <ellipse cx="60" cy="122" rx="48" ry="10" fill="#3D2616" fillOpacity="0.16" />
        {/* Chân bàn gỗ cong */}
        <path d="M28 86 L22 118" stroke="#A87343" strokeWidth="7" strokeLinecap="round" />
        <path d="M28 86 L22 118" stroke="#4A3525" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M92 86 L98 118" stroke="#A87343" strokeWidth="7" strokeLinecap="round" />
        <path d="M92 86 L98 118" stroke="#4A3525" strokeWidth="2.4" strokeLinecap="round" />
        {/* Mặt bàn gỗ tròn dày */}
        <ellipse cx="60" cy="82" rx="48" ry="16" fill="#C9925B" stroke="#4A3525" strokeWidth="2.5" />
        <ellipse cx="60" cy="79" rx="44" ry="13" fill="#E6B886" />
        {/* Khay trà nhỏ & Ấm trà + Tách trà */}
        <ellipse cx="60" cy="79" rx="28" ry="8" fill="#FFF8F0" stroke="#4A3525" strokeWidth="2" />
        {/* Ấm trà gốm matcha */}
        <circle cx="48" cy="73" r="9" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.2" />
        <circle cx="48" cy="63" r="3" fill="#FFE082" stroke="#4A3525" strokeWidth="1.8" />
        {/* Tách trà hồng */}
        <rect x="65" y="69" width="12" height="9" rx="3" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2" />
        {/* Làn khói trà mờ bay lên liên tục */}
        <path
          d="M48 56 Q44 48 50 42 Q54 36 48 30"
          fill="none"
          stroke="#FFFDF9"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-steam"
        />
        <path
          d="M71 64 Q75 56 70 50"
          fill="none"
          stroke="#FFFDF9"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="animate-steam"
        />
      </svg>
    );
  }

  // Mẫu 4: Tủ máy đĩa than vintage có đĩa xoay chậm (decor_vinyl)
  if (decorId === 'decor_vinyl') {
    return (
      <svg viewBox="0 0 115 140" className="w-full h-full overflow-visible">
        <ellipse cx="58" cy="128" rx="44" ry="9" fill="#3D2616" fillOpacity="0.16" />
        {/* Chân tủ gỗ */}
        <line x1="28" y1="108" x2="24" y2="124" stroke="#4A3525" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="88" y1="108" x2="92" y2="124" stroke="#4A3525" strokeWidth="4.5" strokeLinecap="round" />
        {/* Hộc tủ gỗ đựng đĩa nhạc */}
        <rect x="20" y="68" width="76" height="44" rx="7" fill="#D59F6C" stroke="#4A3525" strokeWidth="2.5" />
        <rect x="26" y="74" width="30" height="32" rx="3" fill="#FFF3E2" stroke="#4A3525" strokeWidth="2" />
        <rect x="60" y="74" width="30" height="32" rx="3" fill="#FFF3E2" stroke="#4A3525" strokeWidth="2" />
        {/* Lưới loa vintage */}
        <circle cx="41" cy="90" r="9" fill="#E4B37E" stroke="#4A3525" strokeWidth="1.8" />
        {/* Thân máy đĩa than đặt trên tủ */}
        <rect x="24" y="52" width="68" height="16" rx="5" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.4" />
        {/* Đĩa than Vinyl xoay chậm */}
        <g className="animate-spin-slow" style={{ transformOrigin: '56px 50px' }}>
          <ellipse cx="56" cy="50" rx="22" ry="8" fill="#3A2D28" stroke="#4A3525" strokeWidth="2.2" />
          <ellipse cx="56" cy="50" rx="8" ry="3" fill="#FFE082" />
        </g>
        {/* Cần kim đọc đĩa */}
        <path d="M80 48 L66 52" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Mẫu 5: Ghế lười hạt xốp kèm gối ôm ngôi sao (decor_beanbag)
  if (decorId === 'decor_beanbag') {
    return (
      <svg viewBox="0 0 120 135" className="w-full h-full overflow-visible">
        <ellipse cx="60" cy="120" rx="48" ry="11" fill="#3D2616" fillOpacity="0.16" />
        {/* Thân ghế lười hạt xốp phồng */}
        <path
          d="M22 92 C16 64 36 38 62 38 C86 38 104 64 98 92 C94 112 26 112 22 92 Z"
          fill="#FFB7C5"
          stroke="#4A3525"
          strokeWidth="2.5"
        />
        <path
          d="M30 88 C26 68 42 46 62 46 C80 46 92 66 88 86"
          fill="#FFD1DC"
        />
        {/* Đường chỉ khâu múi ghế */}
        <path d="M62 38 Q56 72 60 106" fill="none" stroke="#4A3525" strokeWidth="2" strokeDasharray="5 4" />
        {/* Gối ôm màu vàng bơ đặt trên ghế */}
        <ellipse cx="54" cy="82" rx="18" ry="11" transform="rotate(-10 54 82)" fill="#FFE082" stroke="#4A3525" strokeWidth="2.2" />
      </svg>
    );
  }

  // Mặc định Mẫu 1: Đèn cây đứng chao vải xếp ly (decor_lamp)
  const isGlowing = lampOn || isNight;
  return (
    <svg viewBox="0 0 115 145" className="w-full h-full overflow-visible">
      <ellipse cx="58" cy="132" rx="30" ry="8" fill="#3D2616" fillOpacity="0.16" />
      {/* Quầng sáng vàng ấm tỏa ra từ chao đèn khi bật */}
      {isGlowing && (
        <circle
          cx="58"
          cy="44"
          r="46"
          fill="#FFE082"
          fillOpacity={isNight ? '0.42' : '0.26'}
          className="pointer-events-none"
        />
      )}
      {/* Đế gỗ & Thân đèn */}
      <ellipse cx="58" cy="128" rx="22" ry="6.5" fill="#C9925B" stroke="#4A3525" strokeWidth="2.4" />
      <line x1="58" y1="54" x2="58" y2="126" stroke="#C9925B" strokeWidth="6" strokeLinecap="round" />
      <line x1="58" y1="54" x2="58" y2="126" stroke="#4A3525" strokeWidth="2.4" strokeLinecap="round" />
      {/* Dây giật công tắc đèn nhỏ */}
      <line x1="68" y1="56" x2="68" y2="70" stroke="#4A3525" strokeWidth="2" />
      <circle cx="68" cy="72" r="3" fill="#FF9B71" stroke="#4A3525" strokeWidth="1.8" />
      {/* Chao đèn vải xếp ly */}
      <path
        d="M34 22 L82 22 L92 56 L24 56 Z"
        fill={isGlowing ? '#FFF2B2' : '#FFF8F0'}
        stroke="#4A3525"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Đường gân xếp ly trên chao đèn */}
      <line x1="46" y1="22" x2="41" y2="56" stroke="#D9B36C" strokeWidth="2" />
      <line x1="58" y1="22" x2="58" y2="56" stroke="#D9B36C" strokeWidth="2" />
      <line x1="70" y1="22" x2="75" y2="56" stroke="#D9B36C" strokeWidth="2" />
    </svg>
  );
}
