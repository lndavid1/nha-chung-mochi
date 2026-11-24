import React from 'react';

// 5 Mẫu Giường Thú Cưng 3 lớp tạo khối + Contact Shadow
export function BedSvg({ bedId = 'bed_cushion' }) {
  if (bedId === 'bed_wood') {
    return (
      <svg viewBox="0 0 150 110" className="w-full h-full overflow-visible">
        <ellipse cx="75" cy="96" rx="64" ry="11" fill="#3D2616" fillOpacity="0.16" />
        <rect x="16" y="34" width="18" height="58" rx="6" fill="#C9925B" stroke="#4A3525" strokeWidth="2.4" />
        <rect x="19" y="37" width="5" height="50" rx="2" fill="#E6B886" />
        <rect x="28" y="54" width="102" height="28" rx="10" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.4" />
        <path
          d="M52 54 L124 54 C128 54 132 58 132 64 L132 82 L52 82 Z"
          fill="#FF9B71"
          stroke="#4A3525"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <line x1="74" y1="54" x2="74" y2="82" stroke="#FFE082" strokeWidth="3" opacity="0.75" />
        <line x1="98" y1="54" x2="98" y2="82" stroke="#FFE082" strokeWidth="3" opacity="0.75" />
        <line x1="52" y1="68" x2="132" y2="68" stroke="#FFE082" strokeWidth="3" opacity="0.75" />
        <ellipse cx="42" cy="54" rx="14" ry="8" fill="#FFF8F0" stroke="#4A3525" strokeWidth="2.2" />
        <rect x="16" y="74" width="118" height="14" rx="4" fill="#D8A36E" stroke="#4A3525" strokeWidth="2.4" />
        <rect x="124" y="48" width="12" height="44" rx="5" fill="#C9925B" stroke="#4A3525" strokeWidth="2.4" />
      </svg>
    );
  }

  if (bedId === 'bed_strawberry') {
    return (
      <svg viewBox="0 0 150 110" className="w-full h-full overflow-visible">
        <ellipse cx="75" cy="95" rx="62" ry="12" fill="#3D2616" fillOpacity="0.16" />
        <ellipse cx="75" cy="64" rx="56" ry="22" fill="#C9935B" stroke="#4A3525" strokeWidth="2.4" />
        <ellipse cx="75" cy="66" rx="47" ry="17" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2.2" />
        <ellipse cx="72" cy="63" rx="34" ry="10" fill="#FFD1DC" />
        <path
          d="M19 64 C19 92 131 92 131 64 L123 88 C115 98 35 98 27 88 Z"
          fill="#DDA772"
          stroke="#4A3525"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M35 76 Q75 86 115 76" fill="none" stroke="#9E6B3B" strokeWidth="2" strokeLinecap="round" />
        <path d="M42 85 Q75 93 108 85" fill="none" stroke="#9E6B3B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (bedId === 'bed_kotatsu') {
    return (
      <svg viewBox="0 0 150 110" className="w-full h-full overflow-visible">
        <ellipse cx="75" cy="95" rx="64" ry="12" fill="#3D2616" fillOpacity="0.16" />
        <path
          d="M22 68 C16 54 28 42 44 46 C54 40 96 40 106 46 C122 42 134 54 128 68 L124 86 C120 94 30 94 26 86 Z"
          fill="#C68446"
          stroke="#4A3525"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M27 62 C22 52 32 44 46 48 C56 43 94 43 104 48 C118 44 128 52 123 62 L119 77 C115 84 35 84 31 77 Z"
          fill="#FFF3D6"
          stroke="#4A3525"
          strokeWidth="2.2"
        />
        <rect
          x="56"
          y="53"
          width="36"
          height="20"
          rx="5"
          transform="rotate(-4 74 63)"
          fill="#FFE082"
          stroke="#4A3525"
          strokeWidth="2.2"
        />
        <rect
          x="60"
          y="56"
          width="14"
          height="5"
          rx="2"
          transform="rotate(-4 67 58)"
          fill="#FFF9DB"
        />
      </svg>
    );
  }

  if (bedId === 'bed_royal') {
    return (
      <svg viewBox="0 0 150 125" className="w-full h-full overflow-visible">
        <ellipse cx="75" cy="110" rx="64" ry="12" fill="#3D2616" fillOpacity="0.16" />
        <line x1="65" y1="10" x2="128" y2="104" stroke="#B77F4A" strokeWidth="5" strokeLinecap="round" />
        <line x1="85" y1="10" x2="22" y2="104" stroke="#B77F4A" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="75" cy="102" rx="52" ry="14" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.4" />
        <path
          d="M75 18 L22 102 Q75 112 128 102 Z"
          fill="#FFF8EC"
          stroke="#4A3525"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M75 44 L48 104 Q75 110 102 104 Z"
          fill="#7D6352"
          stroke="#4A3525"
          strokeWidth="2.2"
        />
        <path d="M75 44 L42 102 L54 104 Z" fill="#F2E2CE" stroke="#4A3525" strokeWidth="2" />
        <path d="M75 44 L108 102 L96 104 Z" fill="#F2E2CE" stroke="#4A3525" strokeWidth="2" />
        <path d="M46 56 Q75 66 104 56" fill="none" stroke="#4A3525" strokeWidth="2" />
        <polygon points="52,58 60,60 55,69" fill="#FF9B71" stroke="#4A3525" strokeWidth="1.6" />
        <polygon points="71,61 79,61 75,71" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.6" />
        <polygon points="90,60 98,58 95,69" fill="#FFE082" stroke="#4A3525" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 150 110" className="w-full h-full overflow-visible">
      <ellipse cx="75" cy="94" rx="62" ry="12" fill="#3D2616" fillOpacity="0.16" />
      <ellipse cx="75" cy="72" rx="56" ry="22" fill="#FFAD87" stroke="#4A3525" strokeWidth="2.5" />
      <ellipse cx="75" cy="68" rx="51" ry="18" fill="#FFC4A8" />
      <ellipse cx="75" cy="70" rx="39" ry="13" fill="#FFF8F0" stroke="#4A3525" strokeWidth="2.2" />
      <path d="M44 70 Q52 75 60 71" fill="none" stroke="#D9BFA9" strokeWidth="2" strokeLinecap="round" />
      <ellipse
        cx="46"
        cy="65"
        rx="13"
        ry="7.5"
        transform="rotate(-12 46 65)"
        fill="#FFE082"
        stroke="#4A3525"
        strokeWidth="2.2"
      />
    </svg>
  );
}
