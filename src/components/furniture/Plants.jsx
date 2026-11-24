import React from 'react';

// 5 Mẫu Cây Cảnh Góc Phòng 3 lớp tạo khối + Contact Shadow
export function PlantSvg({ plantId = 'plant_monstera' }) {
  // Mẫu 2: Xương rồng tai thỏ nở bông hoa nhỏ (plant_cactus)
  if (plantId === 'plant_cactus') {
    return (
      <svg viewBox="0 0 110 135" className="w-full h-full overflow-visible">
        <ellipse cx="55" cy="122" rx="34" ry="8" fill="#3D2616" fillOpacity="0.16" />
        {/* Chậu gốm đất nung */}
        <path d="M27 84 L83 84 L75 120 L35 120 Z" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="23" y="77" width="64" height="10" rx="4" fill="#FFB391" stroke="#4A3525" strokeWidth="2.4" />
        {/* Thân chính xương rồng */}
        <ellipse cx="55" cy="52" rx="18" ry="27" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.4" />
        <ellipse cx="51" cy="50" rx="11" ry="21" fill="#A4DFBA" />
        {/* Hai nhánh tai thỏ */}
        <ellipse cx="31" cy="40" rx="10" ry="15" transform="rotate(-24 31 40)" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.3" />
        <ellipse cx="79" cy="38" rx="10" ry="15" transform="rotate(24 79 38)" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.3" />
        {/* Gai trắng nhỏ */}
        <g stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round">
          <line x1="48" y1="42" x2="50" y2="44" />
          <line x1="60" y1="54" x2="62" y2="52" />
          <line x1="50" y1="62" x2="52" y2="64" />
          <line x1="30" y1="36" x2="32" y2="38" />
          <line x1="78" y1="36" x2="80" y2="34" />
        </g>
        {/* Bông hoa hồng nở trên đỉnh */}
        <circle cx="55" cy="22" r="7.5" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2.2" />
        <circle cx="55" cy="22" r="3" fill="#FFE082" />
      </svg>
    );
  }

  // Mẫu 3: Cây cam mini trĩu quả vàng (plant_Vàng)
  if (plantId === 'plant_Vàng') {
    return (
      <svg viewBox="0 0 110 135" className="w-full h-full overflow-visible">
        <ellipse cx="55" cy="122" rx="36" ry="8" fill="#3D2616" fillOpacity="0.16" />
        {/* Chậu gốm kem thắt nơ đỏ */}
        <path d="M28 84 L82 84 L74 120 L36 120 Z" fill="#FFF3D6" stroke="#4A3525" strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="24" y="78" width="62" height="9" rx="4" fill="#FFE082" stroke="#4A3525" strokeWidth="2.4" />
        <line x1="31" y1="98" x2="79" y2="98" stroke="#FF7B7B" strokeWidth="4" />
        {/* Thân gỗ */}
        <path d="M55 78 L55 52 M55 64 L42 50 M55 62 L68 48" stroke="#8C5832" strokeWidth="5" strokeLinecap="round" />
        {/* Tán lá xanh sum suê */}
        <circle cx="38" cy="44" r="18" fill="#6BB387" stroke="#4A3525" strokeWidth="2.4" />
        <circle cx="72" cy="44" r="18" fill="#6BB387" stroke="#4A3525" strokeWidth="2.4" />
        <circle cx="55" cy="32" r="21" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.4" />
        <circle cx="52" cy="29" r="14" fill="#A6E0BC" />
        {/* Quả cam vàng ươm */}
        <circle cx="42" cy="45" r="6" fill="#FF9B71" stroke="#4A3525" strokeWidth="2" />
        <circle cx="67" cy="46" r="6" fill="#FF9B71" stroke="#4A3525" strokeWidth="2" />
        <circle cx="55" cy="28" r="6.5" fill="#FFB347" stroke="#4A3525" strokeWidth="2" />
        <circle cx="53" cy="26" r="2" fill="#FFFDF9" />
      </svg>
    );
  }

  // Mẫu 4: Bình gốm cắm hoa Tulip (plant_sakura)
  if (plantId === 'plant_sakura') {
    return (
      <svg viewBox="0 0 110 135" className="w-full h-full overflow-visible">
        <ellipse cx="55" cy="122" rx="32" ry="8" fill="#3D2616" fillOpacity="0.16" />
        {/* Bình gốm bầu tròn có quai */}
        <path
          d="M42 70 L68 70 L76 96 C78 112 68 120 55 120 C42 120 32 112 34 96 Z"
          fill="#FFF8F0"
          stroke="#4A3525"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <ellipse cx="50" cy="96" rx="12" ry="16" fill="#FFFFFF" opacity="0.65" />
        {/* Cuống & lá Tulip */}
        <path d="M55 70 L55 34 M48 70 Q38 52 34 38 M62 70 Q72 52 76 40" fill="none" stroke="#5EA87A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M45 70 Q32 58 38 46 Q48 56 50 70 Z" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.2" />
        <path d="M65 70 Q78 58 72 46 Q62 56 60 70 Z" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.2" />
        {/* 3 Bông hoa Tulip */}
        <path d="M26 36 C26 24 42 24 42 36 C42 42 26 42 26 36 Z" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2.2" />
        <path d="M47 28 C47 15 63 15 63 28 C63 36 47 36 47 28 Z" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.2" />
        <path d="M68 38 C68 26 84 26 84 38 C84 44 68 44 68 38 Z" fill="#FFE082" stroke="#4A3525" strokeWidth="2.2" />
      </svg>
    );
  }

  // Mẫu 5: Bể cá thủy sinh mini có chú cá cam nhỏ bơi qua lại (plant_aquarium)
  if (plantId === 'plant_aquarium') {
    return (
      <svg viewBox="0 0 110 135" className="w-full h-full overflow-visible">
        <ellipse cx="55" cy="122" rx="38" ry="8" fill="#3D2616" fillOpacity="0.16" />
        {/* Đế gỗ kê bể cá */}
        <rect x="20" y="96" width="70" height="24" rx="6" fill="#C9925B" stroke="#4A3525" strokeWidth="2.4" />
        {/* Bầu thủy tinh tròn */}
        <circle cx="55" cy="64" r="34" fill="#D6F5FF" fillOpacity="0.88" stroke="#4A3525" strokeWidth="2.5" />
        {/* Cát vàng & rong thủy sinh dưới đáy bể */}
        <path d="M26 80 Q55 74 84 80 C76 92 34 92 26 80 Z" fill="#FFE082" stroke="#4A3525" strokeWidth="2" />
        <path d="M40 82 Q36 68 42 56 M45 82 Q48 70 44 62" fill="none" stroke="#5EA87A" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M70 82 Q74 68 68 58" fill="none" stroke="#88C9A1" strokeWidth="3.2" strokeLinecap="round" />
        {/* Chú cá cam nhỏ bơi qua lại */}
        <g className="animate-fish" style={{ transformOrigin: '55px 62px' }}>
          <ellipse cx="56" cy="62" rx="9" ry="5.5" fill="#FF9B71" stroke="#4A3525" strokeWidth="2" />
          <polygon points="46,62 39,57 39,67" fill="#FF9B71" stroke="#4A3525" strokeWidth="1.8" />
          <circle cx="60" cy="61" r="1.5" fill="#4A3525" />
        </g>
        {/* Vành miệng bể cá & bóng sáng thủy tinh */}
        <ellipse cx="55" cy="31" rx="20" ry="4.5" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.3" />
        <path d="M30 52 A26 26 0 0 1 40 38" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Mặc định Mẫu 1: Chậu Trầu bà lá xẻ Monstera trong chậu gốm chấm bi (plant_monstera)
  return (
    <svg viewBox="0 0 110 135" className="w-full h-full overflow-visible">
      <ellipse cx="55" cy="122" rx="34" ry="8" fill="#3D2616" fillOpacity="0.16" />
      {/* Chậu gốm kem chấm bi */}
      <path d="M28 84 L82 84 L74 120 L36 120 Z" fill="#FFF3E2" stroke="#4A3525" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="24" y="77" width="62" height="9" rx="4" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.4" />
      <circle cx="44" cy="98" r="3.5" fill="#FF9B71" />
      <circle cx="64" cy="96" r="3.5" fill="#88C9A1" />
      <circle cx="55" cy="109" r="3.5" fill="#FFE082" />
      {/* Cuống lá */}
      <path d="M55 77 Q40 58 28 46 M55 77 Q70 58 82 46 M55 77 L55 32" fill="none" stroke="#4A3525" strokeWidth="2.5" strokeLinecap="round" />
      {/* Lá Monstera trái */}
      <g transform="rotate(-24 30 48)">
        <ellipse cx="30" cy="48" rx="16" ry="20" fill="#6BB387" stroke="#4A3525" strokeWidth="2.3" />
        <path d="M16 44 L24 46 M16 52 L25 52" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Lá Monstera phải */}
      <g transform="rotate(24 80 48)">
        <ellipse cx="80" cy="48" rx="16" ry="20" fill="#6BB387" stroke="#4A3525" strokeWidth="2.3" />
        <path d="M94 44 L86 46 M94 52 L85 52" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Lá Monstera chính giữa */}
      <ellipse cx="55" cy="34" rx="17" ry="22" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.4" />
      <ellipse cx="52" cy="32" rx="10" ry="15" fill="#A6E0BC" />
      <line x1="55" y1="18" x2="55" y2="52" stroke="#4A3525" strokeWidth="2" strokeLinecap="round" />
      <path d="M39 30 L47 32 M71 30 L63 32 M39 40 L47 40" stroke="#4A3525" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
