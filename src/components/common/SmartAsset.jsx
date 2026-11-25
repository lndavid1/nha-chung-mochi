import React, { useState } from 'react';
import availableAssets from '../../data/availableAssets.json';

/**
 * SmartAsset — Thành phần đồ họa Hybrid (Ảnh 2D vẽ tay .webp nền trong suốt <-> Fallback SVG)
 * - Tự động kiểm tra availableAssets.json để tránh lỗi 404
 * - Giữ nguyên Contact Shadow mềm (trừ tường, thảm, cửa sổ)
 * - Nếu chưa có ảnh hoặc ảnh lỗi -> fallback mượt về SVG gốc
 */
export default function SmartAsset({
  category,
  assetId,
  alt = '',
  fallbackSvg,
  showShadow = true,
  disableFakeShadow = false,
  className = 'w-full h-full object-contain object-bottom',
  imgStyle = {}
}) {
  const [imgError, setImgError] = useState(false);

  const list = availableAssets?.[category] || [];
  const hasWebp = !imgError && Boolean(assetId && list.includes(assetId));

  if (!hasWebp) {
    return fallbackSvg || null;
  }

  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const src = `${normalizedBase}assets/${category}/${assetId}.webp`;

  return (
    <div className="relative w-full h-full flex items-end justify-center select-none">
      {/* Contact Shadow elip dịu nhẹ (tắt hẳn khi disableFakeShadow=true cho render Blender có sẵn Shadow Catcher) */}
      {showShadow && !disableFakeShadow && (
        <div
          className="pointer-events-none absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[74%] h-[14%] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(61,38,22,0.14) 0%, rgba(61,38,22,0.05) 55%, transparent 75%)'
          }}
        />
      )}

      <img
        src={src}
        alt={alt || assetId}
        draggable={false}
        onError={() => setImgError(true)}
        style={imgStyle}
        className={`relative z-10 ${className}`}
      />
    </div>
  );
}
