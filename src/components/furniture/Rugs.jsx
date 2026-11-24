import React from 'react';

// 5 Mẫu Thảm Trải Sàn 3 lớp tạo khối + Contact Shadow
export function RugSvg({ rugId = 'rug_oval' }) {
  // Mẫu 2: Thảm hình trứng ốp la (rug_daisy)
  if (rugId === 'rug_daisy') {
    return (
      <svg viewBox="0 0 260 110" className="w-full h-full overflow-visible">
        <ellipse cx="130" cy="60" rx="112" ry="38" fill="#3D2616" fillOpacity="0.12" />
        {/* Lòng trắng trứng gợn sóng hữu cơ */}
        <path
          d="M24 58 C18 36 52 24 88 26 C122 18 172 20 202 28 C236 34 246 56 232 72 C216 88 176 92 136 90 C92 94 30 82 24 58 Z"
          fill="#FFFDF9"
          stroke="#4A3525"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M36 56 C32 42 60 32 92 33 C124 26 168 28 194 34"
          fill="none"
          stroke="#F3E5D8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Lòng đỏ trứng tròn phồng ở giữa */}
        <ellipse cx="134" cy="56" rx="42" ry="20" fill="#FFB347" stroke="#4A3525" strokeWidth="2.4" />
        <ellipse cx="132" cy="53" rx="33" ry="14" fill="#FFD166" />
        {/* Highlight bóng trắng trên lòng đỏ */}
        <ellipse cx="118" cy="48" rx="9" ry="4" fill="#FFFDF9" opacity="0.85" />
      </svg>
    );
  }

  // Mẫu 3: Thảm hình đầu gấu Teddy (rug_heart)
  if (rugId === 'rug_heart') {
    return (
      <svg viewBox="0 0 260 115" className="w-full h-full overflow-visible">
        <ellipse cx="130" cy="66" rx="108" ry="38" fill="#3D2616" fillOpacity="0.14" />
        {/* Hai tai gấu tròn */}
        <ellipse cx="56" cy="34" rx="26" ry="16" fill="#C68E5E" stroke="#4A3525" strokeWidth="2.4" />
        <ellipse cx="56" cy="35" rx="14" ry="8" fill="#E8C39E" />
        <ellipse cx="204" cy="34" rx="26" ry="16" fill="#C68E5E" stroke="#4A3525" strokeWidth="2.4" />
        <ellipse cx="204" cy="35" rx="14" ry="8" fill="#E8C39E" />
        {/* Mặt gấu Teddy */}
        <ellipse cx="130" cy="62" rx="96" ry="36" fill="#C68E5E" stroke="#4A3525" strokeWidth="2.5" />
        <ellipse cx="130" cy="58" rx="86" ry="30" fill="#D59F71" />
        {/* Mõm kem ở giữa */}
        <ellipse cx="130" cy="68" rx="34" ry="14" fill="#FFF3E2" stroke="#4A3525" strokeWidth="2.2" />
        <ellipse cx="130" cy="63" rx="9" ry="4.5" fill="#4A3525" />
        <path d="M130 67 L130 74 M122 74 Q130 78 138 74" fill="none" stroke="#4A3525" strokeWidth="2.2" strokeLinecap="round" />
        {/* Mắt & má hồng thảm gấu */}
        <circle cx="88" cy="54" r="4.5" fill="#4A3525" />
        <circle cx="172" cy="54" r="4.5" fill="#4A3525" />
        <ellipse cx="74" cy="62" rx="10" ry="5" fill="#FFB7C5" opacity="0.75" />
        <ellipse cx="186" cy="62" rx="10" ry="5" fill="#FFB7C5" opacity="0.75" />
      </svg>
    );
  }

  // Mẫu 4: Thảm đám mây pastel (rug_cloud)
  if (rugId === 'rug_cloud') {
    return (
      <svg viewBox="0 0 260 110" className="w-full h-full overflow-visible">
        <ellipse cx="130" cy="64" rx="112" ry="36" fill="#3D2616" fillOpacity="0.12" />
        <path
          d="M42 78 C20 78 14 56 32 46 C34 28 64 20 88 28 C108 14 152 14 172 28 C196 20 226 28 228 46 C246 56 240 78 218 78 Z"
          fill="#FFFDF9"
          stroke="#4A3525"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Cầu vồng pastel thêu giữa thảm mây */}
        <path d="M82 68 A48 28 0 0 1 178 68" fill="none" stroke="#FFB7C5" strokeWidth="6" strokeLinecap="round" />
        <path d="M92 68 A38 21 0 0 1 168 68" fill="none" stroke="#FFE082" strokeWidth="6" strokeLinecap="round" />
        <path d="M102 68 A28 14 0 0 1 158 68" fill="none" stroke="#88C9A1" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  // Mẫu 5: Thảm chữ nhật họa tiết thổ cẩm nhẹ (rug_boho)
  if (rugId === 'rug_boho') {
    return (
      <svg viewBox="0 0 260 110" className="w-full h-full overflow-visible">
        {/* Tua rua hai đầu thảm */}
        <g stroke="#FFF8F0" strokeWidth="3.5" strokeLinecap="round">
          <line x1="12" y1="36" x2="26" y2="36" />
          <line x1="10" y1="48" x2="26" y2="48" />
          <line x1="10" y1="60" x2="26" y2="60" />
          <line x1="12" y1="72" x2="26" y2="72" />
          <line x1="234" y1="36" x2="248" y2="36" />
          <line x1="234" y1="48" x2="250" y2="48" />
          <line x1="234" y1="60" x2="250" y2="60" />
          <line x1="234" y1="72" x2="248" y2="72" />
        </g>
        <rect x="24" y="28" width="212" height="60" rx="10" fill="#3D2616" fillOpacity="0.14" />
        <rect x="24" y="24" width="212" height="60" rx="10" fill="#F5E4D0" stroke="#4A3525" strokeWidth="2.5" />
        <rect x="34" y="31" width="192" height="46" rx="6" fill="#FF9B71" stroke="#4A3525" strokeWidth="2" />
        {/* Họa tiết hình thoi Boho ở giữa */}
        <polygon points="85,54 105,39 125,54 105,69" fill="#FFF8F0" stroke="#4A3525" strokeWidth="2" />
        <polygon points="135,54 155,39 175,54 155,69" fill="#FFE082" stroke="#4A3525" strokeWidth="2" />
      </svg>
    );
  }

  // Mặc định Mẫu 1: Thảm tròn dệt len có tua rua 2 bên (rug_oval)
  return (
    <svg viewBox="0 0 260 110" className="w-full h-full overflow-visible">
      <ellipse cx="130" cy="60" rx="112" ry="38" fill="#3D2616" fillOpacity="0.13" />
      {/* Tua rua len hai bên */}
      <g stroke="#4A3525" strokeWidth="2.2" strokeLinecap="round">
        <line x1="12" y1="48" x2="24" y2="50" />
        <line x1="10" y1="56" x2="22" y2="56" />
        <line x1="12" y1="64" x2="24" y2="62" />
        <line x1="236" y1="50" x2="248" y2="48" />
        <line x1="238" y1="56" x2="250" y2="56" />
        <line x1="236" y1="62" x2="248" y2="64" />
      </g>
      <ellipse cx="130" cy="56" rx="106" ry="34" fill="#FFE082" stroke="#4A3525" strokeWidth="2.5" />
      <ellipse cx="130" cy="55" rx="90" ry="26" fill="#FFF2B8" stroke="#D9A74A" strokeWidth="2" strokeDasharray="7 5" />
      <ellipse cx="130" cy="55" rx="64" ry="17" fill="#FFF9E2" />
    </svg>
  );
}
