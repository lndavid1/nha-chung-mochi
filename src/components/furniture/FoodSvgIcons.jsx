import React from 'react';

// Vẽ SVG thủ công cho 4 món ăn (Thay thế hoàn toàn emoji trong khay Cho Ăn)
export function FoodSvgIcon({ foodId = 'kibble', className = 'w-11 h-11' }) {
  if (foodId === 'salmon') {
    return (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="48" rx="22" ry="7" fill="#3D2616" fillOpacity="0.14" />
        {/* Đĩa sứ trắng */}
        <ellipse cx="32" cy="44" rx="24" ry="10" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.3" />
        {/* Miếng cá hồi vân trắng */}
        <path
          d="M16 36 C16 24 48 24 48 36 C48 43 16 43 16 36 Z"
          fill="#FF9B71"
          stroke="#4A3525"
          strokeWidth="2.3"
        />
        <path d="M24 29 Q28 35 24 40 M34 28 Q38 35 34 40 M42 30 Q45 35 42 39" fill="none" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (foodId === 'cake') {
    return (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="50" rx="22" ry="6" fill="#3D2616" fillOpacity="0.14" />
        <path d="M16 30 L48 30 L48 46 C48 49 16 49 16 46 Z" fill="#FFF3D6" stroke="#4A3525" strokeWidth="2.3" />
        {/* Lớp kem dâu chảy */}
        <path
          d="M15 30 C15 22 49 22 49 30 Q44 36 39 31 Q32 37 25 31 Q19 36 15 30 Z"
          fill="#FFB7C5"
          stroke="#4A3525"
          strokeWidth="2.3"
        />
        {/* Quả dâu đỏ trên đỉnh */}
        <circle cx="32" cy="20" r="6" fill="#FF6B6B" stroke="#4A3525" strokeWidth="2.2" />
      </svg>
    );
  }

  if (foodId === 'boba') {
    return (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="54" rx="16" ry="5" fill="#3D2616" fillOpacity="0.14" />
        {/* Ống hút */}
        <line x1="36" y1="10" x2="32" y2="26" stroke="#FF9B71" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="36" y1="10" x2="32" y2="26" stroke="#4A3525" strokeWidth="2.2" strokeLinecap="round" />
        {/* Ly trà sữa */}
        <path d="M20 24 L44 24 L40 50 L24 50 Z" fill="#F2D2B6" stroke="#4A3525" strokeWidth="2.3" strokeLinejoin="round" />
        <ellipse cx="32" cy="24" rx="13" ry="4" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.2" />
        {/* Hạt trân châu */}
        <circle cx="27" cy="45" r="2.5" fill="#4A3525" />
        <circle cx="33" cy="46" r="2.5" fill="#4A3525" />
        <circle cx="37" cy="44" r="2.5" fill="#4A3525" />
      </svg>
    );
  }

  // Mặc định: Bát hạt dinh dưỡng (kibble)
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <ellipse cx="32" cy="50" rx="22" ry="6" fill="#3D2616" fillOpacity="0.14" />
      {/* Bát ăn thú cưng */}
      <path d="M16 34 L48 34 L52 46 C52 50 12 50 12 46 Z" fill="#FFE082" stroke="#4A3525" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Hạt thức ăn đầy bát */}
      <ellipse cx="32" cy="33" rx="15" ry="5" fill="#C68446" stroke="#4A3525" strokeWidth="2.2" />
    </svg>
  );
}
