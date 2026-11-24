import React from 'react';

/**
 * Hệ thống Ánh Sáng Động 2.5D cho Căn Phòng (4 chế độ: Sáng, Hoàng Hôn, Đêm, Đi Ngủ)
 * - Ban ngày: Chùm tia nắng xiên (volumetric sunbeam polygon) từ cửa sổ xuống sàn + hạt bụi sáng lơ lửng
 * - Hoàng hôn: Ánh sáng cam mật - lavender ấm áp
 * - Ban đêm: Bóng đêm dịu + quầng sáng vàng ấm tỏa ra từ đèn cây, dây đèn fairy lights và giường thú
 */
export default function RoomLighting({
  period = 'day',
  isSleeping = false,
  lampOn = true,
  fairyLightsOn = true,
  equipped = {}
}) {
  const isNight = period === 'night';
  const isSunset = period === 'sunset';
  const isDay = period === 'day' && !isSleeping;

  const hasFairyWallDecor =
    !equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy';
  const hasFloorLamp = !equipped.decor || equipped.decor === 'decor_lamp';

  return (
    <div className="pointer-events-none absolute inset-0 z-25 overflow-hidden select-none">
      {/* 1. BAN NGÀY: Chùm tia nắng xiên Volumetric Sunbeam từ cửa sổ trái xuống sàn */}
      {isDay && (
        <>
          <svg
            viewBox="0 0 400 600"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <linearGradient id="sunbeamGrad" x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0%" stopColor="#FFF6CC" stopOpacity="0.42" />
                <stop offset="55%" stopColor="#FFE89E" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FFF8F0" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Tia nắng chính */}
            <polygon
              points="26,110 128,110 315,520 85,520"
              fill="url(#sunbeamGrad)"
            />
            {/* Tia nắng phụ mảnh hơn */}
            <polygon
              points="75,110 136,110 355,495 255,495"
              fill="url(#sunbeamGrad)"
              opacity="0.7"
            />
            {/* Vệt nắng ấm in trên sàn nhà */}
            <ellipse
              cx="205"
              cy="475"
              rx="98"
              ry="26"
              fill="#FFF4BD"
              fillOpacity="0.26"
            />
          </svg>

          {/* Các hạt bụi nắng lơ lửng bay chậm trong chùm tia sáng */}
          {[
            { left: '24%', top: '34%', delay: '0s', size: 5 },
            { left: '36%', top: '46%', delay: '1.2s', size: 4 },
            { left: '29%', top: '58%', delay: '2.4s', size: 6 },
            { left: '45%', top: '52%', delay: '0.7s', size: 4.5 },
            { left: '38%', top: '68%', delay: '1.8s', size: 5 },
            { left: '52%', top: '63%', delay: '3.1s', size: 3.5 }
          ].map((p, idx) => (
            <span
              key={idx}
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: p.delay
              }}
              className="absolute rounded-full bg-[#FFF7C2] shadow-[0_0_8px_#FFE082] animate-dust"
            />
          ))}
        </>
      )}

      {/* 2. HOÀNG HÔN: Lớp phủ nắng chiều cam mật - tím hồng dịu */}
      {isSunset && !isSleeping && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background:
                'linear-gradient(160deg, rgba(255, 155, 113, 0.22) 0%, rgba(255, 183, 197, 0.16) 55%, rgba(186, 135, 175, 0.20) 100%)',
              mixBlendMode: 'soft-light'
            }}
          />
          <svg
            viewBox="0 0 400 600"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <linearGradient id="sunsetBeam" x1="0" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="#FFB085" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FFB7C5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="26,115 132,115 330,520 95,520" fill="url(#sunsetBeam)" />
          </svg>
        </>
      )}

      {/* 3. BAN ĐÊM HOẶC TẮT ĐÈN ĐI NGỦ: Bóng đêm + Quầng sáng vàng ấm cục bộ */}
      {(isNight || isSleeping) && (
        <>
          {/* Lớp phủ đêm xanh tím ấm */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              backgroundColor: isSleeping
                ? 'rgba(23, 28, 56, 0.56)'
                : 'rgba(30, 35, 68, 0.36)'
            }}
          />

          {/* Quầng sáng vàng ấm từ Đèn cây hoặc Góc nội thất phải */}
          {lampOn && !isSleeping && (
            <div
              className="absolute transition-opacity duration-500"
              style={{
                right: '-6%',
                bottom: '24%',
                width: '270px',
                height: '270px',
                background: hasFloorLamp
                  ? 'radial-gradient(circle, rgba(255, 224, 130, 0.46) 0%, rgba(255, 185, 110, 0.18) 48%, transparent 74%)'
                  : 'radial-gradient(circle, rgba(255, 224, 130, 0.28) 0%, transparent 70%)'
              }}
            />
          )}

          {/* Quầng sáng lung linh từ Dây đèn Fairy Lights trên tường */}
          {fairyLightsOn && hasFairyWallDecor && !isSleeping && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[6%] w-72 h-36 transition-opacity duration-500"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255, 230, 140, 0.38) 0%, rgba(255, 183, 197, 0.14) 52%, transparent 76%)'
              }}
            />
          )}

          {/* Ánh đèn ngủ dịu nhẹ bên chiếc giường thú cưng khi đang ngủ */}
          <div
            className="absolute left-[4%] bottom-[12%] w-56 h-44 transition-opacity duration-700"
            style={{
              background: isSleeping
                ? 'radial-gradient(circle, rgba(255, 224, 130, 0.42) 0%, rgba(255, 155, 113, 0.15) 50%, transparent 75%)'
                : 'radial-gradient(circle, rgba(255, 224, 130, 0.22) 0%, transparent 70%)'
            }}
          />
        </>
      )}
    </div>
  );
}
