import React from 'react';

/**
 * 1. Chùm tia nắng xiên từ cửa sổ (z-[15]) — nằm trên tường/cửa sổ nhưng dưới đồ nội thất & thú cưng
 */
export function SunbeamOverlay({ period = 'day', isSleeping = false }) {
  if (isSleeping || period === 'night') return null;

  const isSunset = period === 'sunset';

  return (
    <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden select-none">
      <svg
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="sunbeamMainGrad" x1="0" y1="0" x2="0.7" y2="1">
            <stop
              offset="0%"
              stopColor={isSunset ? '#FFB085' : '#FFF6CC'}
              stopOpacity={isSunset ? '0.36' : '0.40'}
            />
            <stop
              offset="60%"
              stopColor={isSunset ? '#FFB7C5' : '#FFE89E'}
              stopOpacity="0.16"
            />
            <stop offset="100%" stopColor="#FFF8F0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Tia nắng đổ chéo từ cửa sổ (left 5% -> 39%, top 16% -> 38%) xuống vùng sàn trước-giữa */}
        <polygon
          points="24,140 150,140 315,610 95,610"
          fill="url(#sunbeamMainGrad)"
        />
        <polygon
          points="78,140 156,140 355,580 250,580"
          fill="url(#sunbeamMainGrad)"
          opacity="0.65"
        />
        {/* Vệt nắng ấm trên mặt sàn */}
        <ellipse
          cx="210"
          cy="560"
          rx="105"
          ry="28"
          fill={isSunset ? '#FFD1B8' : '#FFF4BD'}
          fillOpacity="0.24"
        />
      </svg>

      {/* Hạt bụi nắng lơ lửng bay chậm */}
      {!isSunset &&
        [
          { left: '22%', top: '34%', delay: '0s', size: 4.5 },
          { left: '36%', top: '44%', delay: '1.2s', size: 4 },
          { left: '28%', top: '55%', delay: '2.4s', size: 5 },
          { left: '44%', top: '50%', delay: '0.7s', size: 4 },
          { left: '39%', top: '64%', delay: '1.8s', size: 4.5 }
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
    </div>
  );
}

/**
 * 2. Lớp phủ ánh sáng Hoàng Hôn / Đêm / Đi Ngủ (z-[40])
 * Nằm trên toàn bộ căn phòng & thú cưng (z-[30]), nhưng DƯỚI toàn bộ lớp UI sắc nét (z-[50]+)
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

  const hasFairyWallDecor =
    !equipped.wallDecor || equipped.wallDecor === 'wdecor_fairy';
  const hasFloorLamp = !equipped.decor || equipped.decor === 'decor_lamp';

  if (period === 'day' && !isSleeping) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[40] overflow-hidden select-none">
      {/* HOÀNG HÔN: Lớp phủ nắng chiều ấm áp */}
      {isSunset && !isSleeping && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(160deg, rgba(255, 155, 113, 0.22) 0%, rgba(255, 183, 197, 0.16) 55%, rgba(186, 135, 175, 0.20) 100%)',
            mixBlendMode: 'soft-light'
          }}
        />
      )}

      {/* BAN ĐÊM HOẶC TẮT ĐÈN ĐI NGỦ: Bóng đêm dịu + Quầng sáng vàng ấm từ đèn */}
      {(isNight || isSleeping) && (
        <>
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              backgroundColor: isSleeping
                ? 'rgba(23, 28, 56, 0.54)'
                : 'rgba(30, 35, 68, 0.34)'
            }}
          />

          {/* Quầng sáng vàng ấm từ Đèn cây / Góc nội thất sau-phải */}
          {lampOn && !isSleeping && (
            <div
              className="absolute transition-opacity duration-500"
              style={{
                right: '-4%',
                top: '28%',
                width: '240px',
                height: '240px',
                background: hasFloorLamp
                  ? 'radial-gradient(circle, rgba(255, 224, 130, 0.45) 0%, rgba(255, 185, 110, 0.16) 48%, transparent 74%)'
                  : 'radial-gradient(circle, rgba(255, 224, 130, 0.24) 0%, transparent 70%)'
              }}
            />
          )}

          {/* Quầng sáng lung linh từ Dây đèn Fairy Lights trên tường */}
          {fairyLightsOn && hasFairyWallDecor && !isSleeping && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[5%] w-72 h-28 transition-opacity duration-500"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255, 230, 140, 0.38) 0%, rgba(255, 183, 197, 0.14) 52%, transparent 76%)'
              }}
            />
          )}

          {/* Ánh đèn ngủ dịu bên chiếc giường thú (tọa độ tâm giường x:45%, y:57%) */}
          <div
            className="absolute left-[22%] top-[44%] w-52 h-44 transition-opacity duration-700"
            style={{
              background: isSleeping
                ? 'radial-gradient(circle, rgba(255, 224, 130, 0.42) 0%, rgba(255, 155, 113, 0.15) 50%, transparent 75%)'
                : 'radial-gradient(circle, rgba(255, 224, 130, 0.20) 0%, transparent 70%)'
            }}
          />
        </>
      )}
    </div>
  );
}
