import React from 'react';

// 4 Mẫu Cửa sổ + Bầu trời động Sáng / Hoàng hôn / Đêm
export function WindowSvg({ windowId = 'win_wood', period = 'day', isSleeping = false }) {
  const renderSky = () => {
    if (period === 'night' || isSleeping) {
      return (
        <g>
          <defs>
            <linearGradient id="cozyNightSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B2340" />
              <stop offset="100%" stopColor="#353E6B" />
            </linearGradient>
          </defs>
          <rect width="120" height="130" fill="url(#cozyNightSky)" />
          <circle cx="84" cy="36" r="15" fill="#FFE082" />
          <circle cx="91" cy="31" r="13" fill="#232C50" />
          <circle cx="28" cy="30" r="2.2" fill="#FFF8F0" className="animate-fairy" />
          <circle cx="52" cy="48" r="1.8" fill="#FFE082" className="animate-fairy" />
          <circle cx="34" cy="74" r="2" fill="#FFF8F0" />
          <circle cx="92" cy="76" r="2.2" fill="#FFE082" className="animate-fairy" />
          <path d="M0 105 Q40 90 80 104 T120 98 L120 130 L0 130 Z" fill="#151B33" />
        </g>
      );
    }

    if (period === 'sunset') {
      return (
        <g>
          <defs>
            <linearGradient id="cozySunsetSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C88EA7" />
              <stop offset="50%" stopColor="#FF9B71" />
              <stop offset="100%" stopColor="#FFE082" />
            </linearGradient>
          </defs>
          <rect width="120" height="130" fill="url(#cozySunsetSky)" />
          <circle cx="62" cy="82" r="22" fill="#FFF3B0" opacity="0.92" />
          <g className="animate-cloud" fill="#FFD1C1" opacity="0.88">
            <ellipse cx="42" cy="46" rx="18" ry="8" />
            <ellipse cx="54" cy="44" rx="14" ry="9" />
          </g>
          <path d="M0 104 Q45 88 85 102 T120 96 L120 130 L0 130 Z" fill="#8D5B6A" />
        </g>
      );
    }

    // Mặc định: Ban ngày nắng ấm
    return (
      <g>
        <defs>
          <linearGradient id="cozyDaySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#89CFF0" />
            <stop offset="100%" stopColor="#D6F0FE" />
          </linearGradient>
        </defs>
        <rect width="120" height="130" fill="url(#cozyDaySky)" />
        <circle cx="88" cy="30" r="15" fill="#FFE082" />
        <circle cx="88" cy="30" r="11" fill="#FFF3B0" />
        <g className="animate-cloud" fill="#FFFDF9">
          <circle cx="32" cy="54" r="10" />
          <circle cx="44" cy="51" r="13" />
          <circle cx="56" cy="55" r="9.5" />
        </g>
        <path d="M0 102 Q36 86 76 100 T120 94 L120 130 L0 130 Z" fill="#88C9A1" />
        <path d="M0 112 Q52 98 120 110 L120 130 L0 130 Z" fill="#6BB387" />
      </g>
    );
  };

  if (windowId === 'win_cabin') {
    return (
      <svg viewBox="0 0 130 140" className="w-full h-full overflow-visible">
        <defs>
          <clipPath id="cabinCircleClip">
            <circle cx="65" cy="66" r="48" />
          </clipPath>
        </defs>
        <circle cx="65" cy="70" r="54" fill="#3D2616" fillOpacity="0.14" />
        <circle cx="65" cy="66" r="54" fill="#C8925E" stroke="#4A3525" strokeWidth="2.5" />
        <circle cx="65" cy="66" r="50" fill="#E4B382" stroke="#4A3525" strokeWidth="2" />
        <g clipPath="url(#cabinCircleClip)" transform="translate(5, 2)">
          {renderSky()}
          <line x1="60" y1="0" x2="60" y2="130" stroke="#A87343" strokeWidth="7" />
          <line x1="60" y1="0" x2="60" y2="130" stroke="#4A3525" strokeWidth="2.4" />
          <line x1="0" y1="64" x2="120" y2="64" stroke="#A87343" strokeWidth="7" />
          <line x1="0" y1="64" x2="120" y2="64" stroke="#4A3525" strokeWidth="2.4" />
        </g>
        <circle cx="65" cy="66" r="48" fill="none" stroke="#4A3525" strokeWidth="2.5" />
      </svg>
    );
  }

  if (windowId === 'win_arch') {
    return (
      <svg viewBox="0 0 130 145" className="w-full h-full overflow-visible">
        <defs>
          <clipPath id="archClip">
            <path d="M15 56 A50 50 0 0 1 115 56 L115 124 L15 124 Z" />
          </clipPath>
        </defs>
        <rect x="10" y="127" width="110" height="8" rx="4" fill="#3D2616" fillOpacity="0.15" />
        <path
          d="M11 56 A54 54 0 0 1 119 56 L119 126 L11 126 Z"
          fill="#D7A16E"
          stroke="#4A3525"
          strokeWidth="2.5"
        />
        <g clipPath="url(#archClip)">
          <g transform="translate(5, 0)">{renderSky()}</g>
          <line x1="65" y1="6" x2="65" y2="124" stroke="#FFFDF9" strokeWidth="4" />
          <line x1="15" y1="74" x2="115" y2="74" stroke="#FFFDF9" strokeWidth="4" />

          <g className="animate-curtain">
            <path
              d="M14 10 Q46 14 42 74 Q34 102 15 118 Z"
              fill="#FFFDF9"
              fillOpacity="0.92"
              stroke="#4A3525"
              strokeWidth="2.2"
            />
            <path d="M24 30 Q32 62 20 96" fill="none" stroke="#D8C8B8" strokeWidth="1.6" />
            <circle cx="28" cy="90" r="3.5" fill="#FFB7C5" stroke="#4A3525" strokeWidth="1.8" />
          </g>
          <g className="animate-curtain">
            <path
              d="M116 10 Q84 14 88 74 Q96 102 115 118 Z"
              fill="#FFFDF9"
              fillOpacity="0.92"
              stroke="#4A3525"
              strokeWidth="2.2"
            />
            <path d="M106 30 Q98 62 110 96" fill="none" stroke="#D8C8B8" strokeWidth="1.6" />
            <circle cx="102" cy="90" r="3.5" fill="#FFB7C5" stroke="#4A3525" strokeWidth="1.8" />
          </g>
        </g>
        <path
          d="M15 56 A50 50 0 0 1 115 56 L115 124 L15 124 Z"
          fill="none"
          stroke="#4A3525"
          strokeWidth="2.5"
        />
        <rect x="6" y="122" width="118" height="10" rx="4" fill="#E6B88A" stroke="#4A3525" strokeWidth="2.4" />
        <rect x="9" y="124" width="112" height="2.5" fill="#FFF1DF" />
      </svg>
    );
  }

  if (windowId === 'win_bay') {
    return (
      <svg viewBox="0 0 140 145" className="w-full h-full overflow-visible">
        <defs>
          <clipPath id="bayClip">
            <rect x="14" y="14" width="112" height="108" rx="10" />
          </clipPath>
        </defs>
        <rect x="10" y="126" width="120" height="9" rx="4" fill="#3D2616" fillOpacity="0.15" />
        <rect x="10" y="10" width="120" height="116" rx="12" fill="#D59F6C" stroke="#4A3525" strokeWidth="2.5" />
        <g clipPath="url(#bayClip)">
          <g transform="translate(10, 0)">{renderSky()}</g>
          <line x1="48" y1="14" x2="48" y2="122" stroke="#F4DEC2" strokeWidth="4.5" />
          <line x1="48" y1="14" x2="48" y2="122" stroke="#4A3525" strokeWidth="2.2" />
          <line x1="92" y1="14" x2="92" y2="122" stroke="#F4DEC2" strokeWidth="4.5" />
          <line x1="92" y1="14" x2="92" y2="122" stroke="#4A3525" strokeWidth="2.2" />
          <path d="M22 30 L38 18 M24 44 L44 26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        </g>
        <rect x="14" y="14" width="112" height="108" rx="10" fill="none" stroke="#4A3525" strokeWidth="2.4" />
        <rect x="5" y="121" width="130" height="11" rx="4" fill="#E8BA8B" stroke="#4A3525" strokeWidth="2.4" />
        <g transform="translate(82, 92)">
          <path d="M6 18 L24 18 L21 31 L9 31 Z" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M15 18 L15 8" stroke="#5EA87A" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="11" cy="12" r="4" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.8" />
          <circle cx="19" cy="12" r="4" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.8" />
          <circle cx="15" cy="6" r="5.5" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2" />
          <circle cx="15" cy="6" r="2.2" fill="#FFE082" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 130 145" className="w-full h-full overflow-visible">
      <defs>
        <clipPath id="woodWinClip">
          <rect x="16" y="16" width="98" height="106" rx="12" />
        </clipPath>
      </defs>
      <rect x="10" y="126" width="110" height="8" rx="4" fill="#3D2616" fillOpacity="0.15" />
      <rect x="11" y="11" width="108" height="115" rx="15" fill="#C9935B" stroke="#4A3525" strokeWidth="2.5" />
      <rect x="14" y="14" width="102" height="109" rx="13" fill="#E4B37E" />
      <g clipPath="url(#woodWinClip)">
        <g transform="translate(5, 0)">{renderSky()}</g>
        <rect x="62" y="16" width="6" height="106" fill="#D59F68" stroke="#4A3525" strokeWidth="2.2" />
        <rect x="16" y="66" width="98" height="6" fill="#D59F68" stroke="#4A3525" strokeWidth="2.2" />
        <path d="M24 32 L38 20 M24 44 L44 26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </g>
      <rect x="16" y="16" width="98" height="106" rx="12" fill="none" stroke="#4A3525" strokeWidth="2.4" />
      <rect x="6" y="121" width="118" height="10" rx="4" fill="#E4B37E" stroke="#4A3525" strokeWidth="2.4" />
      <rect x="9" y="123" width="112" height="2.5" fill="#FAE3C6" />
    </svg>
  );
}
