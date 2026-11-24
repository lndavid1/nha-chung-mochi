import React from 'react';

// 4 Mẫu Đồ Treo Tường Mới (Dây đèn đom đóm, Đồng hồ gỗ chạy đúng giờ thực, Kệ treo thường xuân, Lịch xé hôm nay)
export function WallDecorSvg({
  wallDecorId = 'wdecor_fairy',
  lightsOn = true,
  nowDate = new Date()
}) {
  // Mẫu 2: Đồng hồ treo tường gỗ (kim giờ & kim phút chạy đúng theo giờ thực tế của máy)
  if (wallDecorId === 'wdecor_clock') {
    const hours = nowDate.getHours() % 12;
    const minutes = nowDate.getMinutes();
    const hourAngle = hours * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;

    return (
      <svg viewBox="0 0 180 70" className="w-full h-full overflow-visible">
        <circle cx="90" cy="37" r="27" fill="#3D2616" fillOpacity="0.14" />
        {/* Vành gỗ sồi */}
        <circle cx="90" cy="34" r="26" fill="#C9925B" stroke="#4A3525" strokeWidth="2.5" />
        <circle cx="90" cy="34" r="21" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2" />
        {/* Vạch 12h, 3h, 6h, 9h */}
        <circle cx="90" cy="17" r="1.8" fill="#4A3525" />
        <circle cx="107" cy="34" r="1.8" fill="#4A3525" />
        <circle cx="90" cy="51" r="1.8" fill="#4A3525" />
        <circle cx="73" cy="34" r="1.8" fill="#4A3525" />
        {/* Kim giờ */}
        <line
          x1="90"
          y1="34"
          x2="90"
          y2="23"
          stroke="#4A3525"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 90 34)`}
        />
        {/* Kim phút */}
        <line
          x1="90"
          y1="34"
          x2="90"
          y2="19"
          stroke="#FF9B71"
          strokeWidth="2.2"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 90 34)`}
        />
        <circle cx="90" cy="34" r="2.5" fill="#4A3525" />
      </svg>
    );
  }

  // Mẫu 3: Kệ gỗ treo tường có cây thường xuân rủ lá (wdecor_shelf)
  if (wallDecorId === 'wdecor_shelf') {
    return (
      <svg viewBox="0 0 180 70" className="w-full h-full overflow-visible">
        <rect x="28" y="42" width="124" height="8" rx="3" fill="#3D2616" fillOpacity="0.14" />
        {/* Tấm ván kệ gỗ treo */}
        <rect x="26" y="36" width="128" height="9" rx="4" fill="#D59F6C" stroke="#4A3525" strokeWidth="2.4" />
        {/* Lọ gốm nhỏ và chậu cây trên kệ */}
        <rect x="44" y="18" width="18" height="18" rx="4" fill="#FFB7C5" stroke="#4A3525" strokeWidth="2.2" />
        <circle cx="84" cy="26" r="10" fill="#FFE082" stroke="#4A3525" strokeWidth="2.2" />
        <rect x="112" y="16" width="22" height="20" rx="4" fill="#88C9A1" stroke="#4A3525" strokeWidth="2.2" />
        {/* Dây thường xuân rủ xuống từ kệ */}
        <path d="M124 36 Q134 48 128 62 M116 36 Q108 48 114 58" fill="none" stroke="#5EA87A" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="130" cy="46" r="4" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.6" />
        <circle cx="127" cy="57" r="3.8" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.6" />
        <circle cx="111" cy="48" r="3.8" fill="#88C9A1" stroke="#4A3525" strokeWidth="1.6" />
      </svg>
    );
  }

  // Mẫu 4: Tờ lịch xé treo tường hiển thị đúng ngày/tháng hôm nay (wdecor_calendar)
  if (wallDecorId === 'wdecor_calendar') {
    const dayNum = String(nowDate.getDate()).padStart(2, '0');
    const monthNum = nowDate.getMonth() + 1;

    return (
      <svg viewBox="0 0 180 75" className="w-full h-full overflow-visible">
        <rect x="61" y="14" width="60" height="56" rx="8" fill="#3D2616" fillOpacity="0.14" />
        {/* Tấm bìa lịch */}
        <rect x="60" y="10" width="60" height="56" rx="8" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.4" />
        {/* Gáy lịch màu cam đào */}
        <path d="M60 18 C60 13 64 10 68 10 L112 10 C116 10 120 13 120 18 L120 26 L60 26 Z" fill="#FF9B71" stroke="#4A3525" strokeWidth="2.4" />
        <text
          x="90"
          y="22"
          textAnchor="middle"
          fill="#FFFDF9"
          fontSize="9"
          fontWeight="800"
        >
          THÁNG {monthNum}
        </text>
        <text
          x="90"
          y="53"
          textAnchor="middle"
          fill="#4A3525"
          fontSize="23"
          fontWeight="900"
        >
          {dayNum}
        </text>
      </svg>
    );
  }

  // Mặc định Mẫu 1: Dây đèn đom đóm Fairy Lights treo vòng cung (wdecor_fairy)
  const bulbs = [
    { cx: 28, cy: 23, color: '#FFE082' },
    { cx: 58, cy: 33, color: '#FFB7C5' },
    { cx: 90, cy: 37, color: '#FFE082' },
    { cx: 122, cy: 33, color: '#88C9A1' },
    { cx: 152, cy: 23, color: '#FFE082' }
  ];

  return (
    <svg viewBox="0 0 180 65" className="w-full h-full overflow-visible">
      {/* Dây treo vòng cung */}
      <path
        d="M10 12 Q90 54 170 12"
        fill="none"
        stroke="#4A3525"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {bulbs.map((b, i) => (
        <g key={i} className={lightsOn ? 'animate-fairy' : ''}>
          {lightsOn && (
            <circle cx={b.cx} cy={b.cy + 5} r="12" fill="#FFE082" fillOpacity="0.4" />
          )}
          <line x1={b.cx} y1={b.cy - 2} x2={b.cx} y2={b.cy + 2} stroke="#4A3525" strokeWidth="2" />
          <circle
            cx={b.cx}
            cy={b.cy + 5}
            r="5.5"
            fill={lightsOn ? b.color : '#E6DCCF'}
            stroke="#4A3525"
            strokeWidth="2"
          />
        </g>
      ))}
    </svg>
  );
}
