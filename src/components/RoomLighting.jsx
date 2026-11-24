import React from 'react';

/**
 * Hệ thống Ánh Sáng Động 2.5D cho Căn Phòng (4 chế độ: Sáng, Hoàng Hôn, Đêm, Đi Ngủ)
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
    <div className="pointer-events-none absolute inset-0 z-[24] overflow-hidden select-none">
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
                <stop offset="0%" stopColor="#FFF6CC" stopOpacity="0.38" />
                <stop offset="55%" stopColor="#FFE89E" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#FFF8F0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points="26,110 128,110 305,500 85,500"
              fill="url(#sunbeamGrad)"
            />
            <polygon
              points="75,110 136,110 345,475 245,475"
              fill="url(#sunbeamGrad)"
              opacity="0.65"
            />
            <ellipse
              cx="205"
              cy="460"
              rx="92"
              ry="22"
              fill="#FFF4BD"
              fillOpacity="0.22"
            />
          </svg>

          {/* Hạt bụi nắng lơ lửng */}
          {[
            { left: '24%', top: '30%', delay: '0s', size: 5 },
            { left: '36%', top: '42%', delay: '1.2s', size: 4 },
            { left: '29%', top: '54%', delay: '2.4s', size: 5.5 },
            { left: '45%', top: '48%', delay: '0.7s', size: 4.5 },
            { left: '38%', top: '64%', delay: '1.8s', size: 5 }
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

      {/* 2. HOÀNG HÔN */}
      {isSunset && !isSleeping && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background:
                'linear-gradient(160deg, rgba(255, 155, 113, 0.20) 0%, rgba(255, 183, 197, 0.15) 55%, rgba(186, 135, 175, 0.18) 100%)',
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
                <stop offset="0%" stopColor="#FFB085" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#FFB7C5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="26,115 132,115 320,500 95,500" fill="url(#sunsetBeam)" />
          </svg>
        </>
      )}

      {/* 3. BAN ĐÊM HOẶC TẮT ĐÈN ĐI NGỦ */}
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

          {lampOn && !isSleeping && (
            <div
              className="absolute transition-opacity duration-500"
              style={{
                right: '-6%',
                bottom: '34%',
                width: '250px',
                height: '250px',
                background: hasFloorLamp
                  ? 'radial-gradient(circle, rgba(255, 224, 130, 0.44) 0%, rgba(255, 185, 110, 0.16) 48%, transparent 74%)'
                  : 'radial-gradient(circle, rgba(255, 224, 130, 0.25) 0%, transparent 70%)'
              }}
            />
          )}

          {fairyLightsOn && hasFairyWallDecor && !isSleeping && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[6%] w-72 h-32 transition-opacity duration-500"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255, 230, 140, 0.36) 0%, rgba(255, 183, 197, 0.14) 52%, transparent 76%)'
              }}
            />
          )}

          <div
            className="absolute left-[2%] bottom-[8%] w-52 h-40 transition-opacity duration-700"
            style={{
              background: isSleeping
                ? 'radial-gradient(circle, rgba(255, 224, 130, 0.40) 0%, rgba(255, 155, 113, 0.14) 50%, transparent 75%)'
                : 'radial-gradient(circle, rgba(255, 224, 130, 0.20) 0%, transparent 70%)'
            }}
          />
        </>
      )}
    </div>
  );
}
