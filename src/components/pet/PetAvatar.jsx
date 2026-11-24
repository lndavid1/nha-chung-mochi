import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import availableAssets from '../../data/availableAssets.json';
import SmartAsset from '../common/SmartAsset';

// Render 6 Phụ kiện đeo trực tiếp lên đầu hoặc cổ thú cưng
export function PetAccessorySvg({ accessoryId = 'acc_none' }) {
  if (!accessoryId || accessoryId === 'acc_none') return null;

  // 1. Lá mầm xanh trên đỉnh đầu
  if (accessoryId === 'acc_sprout') {
    return (
      <g transform="translate(110, 46)">
        <path d="M0 16 Q0 4 0 0" fill="none" stroke="#4A3525" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M0 3 C-14 -6 -20 4 -6 10 C-2 11 0 6 0 3 Z"
          fill="#88C9A1"
          stroke="#4A3525"
          strokeWidth="2.2"
        />
        <path
          d="M0 3 C14 -6 20 4 6 10 C2 11 0 6 0 3 Z"
          fill="#A6E0BC"
          stroke="#4A3525"
          strokeWidth="2.2"
        />
      </g>
    );
  }

  // 2. Nơ ruy-băng đỏ ở cổ
  if (accessoryId === 'acc_bow') {
    return (
      <g transform="translate(110, 148)">
        <path
          d="M-24 -2 C-8 4 8 4 24 -2"
          fill="none"
          stroke="#E85D75"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path d="M-4 0 L-20 -9 L-18 9 Z" fill="#FF7B8B" stroke="#4A3525" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M4 0 L20 -9 L18 9 Z" fill="#FF7B8B" stroke="#4A3525" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="0" cy="1" r="6" fill="#FFE082" stroke="#4A3525" strokeWidth="2.2" />
      </g>
    );
  }

  // 3. Mũ nồi họa sĩ màu be
  if (accessoryId === 'acc_beret') {
    return (
      <g transform="translate(110, 56) rotate(-6)">
        <ellipse cx="0" cy="4" rx="34" ry="13" fill="#E8CFAF" stroke="#4A3525" strokeWidth="2.4" />
        <ellipse cx="-4" cy="1" rx="26" ry="8" fill="#F5E4CC" />
        <rect x="-24" y="10" width="48" height="5" rx="2.5" fill="#C9925B" stroke="#4A3525" strokeWidth="2" />
        <path d="M0 -9 L3 -15" stroke="#4A3525" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  }

  // 4. Kính tròn học thức gọng vàng
  if (accessoryId === 'acc_glasses') {
    return (
      <g transform="translate(110, 108)">
        <circle cx="-23" cy="0" r="14" fill="#FFFFFF" fillOpacity="0.28" stroke="#D99B26" strokeWidth="3" />
        <circle cx="-23" cy="0" r="14" fill="none" stroke="#4A3525" strokeWidth="1.6" />
        <circle cx="23" cy="0" r="14" fill="#FFFFFF" fillOpacity="0.28" stroke="#D99B26" strokeWidth="3" />
        <circle cx="23" cy="0" r="14" fill="none" stroke="#4A3525" strokeWidth="1.6" />
        <path d="M-9 0 Q0 -4 9 0" fill="none" stroke="#4A3525" strokeWidth="2.2" />
        <line x1="-29" y1="-6" x2="-23" y2="-10" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="17" y1="-6" x2="23" y2="-10" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    );
  }

  // 5. Vương miện mini hoàng gia
  if (accessoryId === 'acc_crown') {
    return (
      <g transform="translate(110, 48)">
        <path
          d="M-20 14 L-24 -4 L-10 5 L0 -9 L10 5 L24 -4 L20 14 Z"
          fill="#FFE082"
          stroke="#4A3525"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="6" r="3.5" fill="#FF7B8B" stroke="#4A3525" strokeWidth="1.6" />
        <circle cx="-12" cy="8" r="2.5" fill="#88C9A1" />
        <circle cx="12" cy="8" r="2.5" fill="#88C9A1" />
      </g>
    );
  }

  return null;
}

// Thumbnail SVG phụ kiện dùng trong DecoratorDrawer
export function AccessoryThumbnail({ accessoryId }) {
  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12 overflow-visible">
      <circle cx="50" cy="54" r="28" fill="#FFF3E2" stroke="#4A3525" strokeWidth="2.2" strokeDasharray="4 4" />
      {accessoryId === 'acc_none' ? (
        <text x="50" y="59" textAnchor="middle" fill="#7D6352" fontSize="13" fontWeight="800">
          Mộc
        </text>
      ) : (
        <g transform="translate(-60, -40)">
          <PetAccessorySvg accessoryId={accessoryId} />
        </g>
      )}
    </svg>
  );
}

export default function PetAvatar({
  type = 'cat',
  emotion = 'happy',
  isSleeping = false,
  accessoryId = 'acc_sprout',
  isPetted = false,
  facingLeft = false,
  isWalking = false
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);

  // Tự động chớp mắt ngẫu nhiên mỗi 3–5 giây và khẽ giật tai
  useEffect(() => {
    let blinkTimeout;
    const interval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => setIsBlinking(false), 160);
      if (Math.random() > 0.45) {
        setEarTwitch(true);
        setTimeout(() => setEarTwitch(false), 320);
      }
    }, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(blinkTimeout);
    };
  }, []);

  const isSulky = emotion === 'sulky' && !isPetted;
  const isSleepy = (isSleeping || emotion === 'sleepy') && !isPetted;
  const isExcited = emotion === 'excited' || isPetted;
  const isLove = emotion === 'love' || isPetted;
  const isHungry = emotion === 'hungry' && !isPetted;

  // Khớp mắt + miệng + má hồng tách riêng
  const renderFacialFeatures = () => {
    // 1. Khi đang được vuốt ve hoặc trạng thái Love/Excited
    if (isPetted || isLove || isExcited) {
      return (
        <g>
          {/* Má ửng hồng rực rỡ */}
          <ellipse cx="66" cy="118" rx="13" ry="7.5" fill="#FF94A8" opacity="0.85" />
          <ellipse cx="154" cy="118" rx="13" ry="7.5" fill="#FF94A8" opacity="0.85" />
          {/* Mắt vòng cung cười hạnh phúc ^ ^ */}
          <path d="M74 109 Q85 96 96 109" fill="none" stroke="#4A3525" strokeWidth="3.8" strokeLinecap="round" />
          <path d="M124 109 Q135 96 146 109" fill="none" stroke="#4A3525" strokeWidth="3.8" strokeLinecap="round" />
          {/* Miệng cười tươi */}
          <path
            d="M99 116 Q110 132 121 116 Z"
            fill="#FF8FA3"
            stroke="#4A3525"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
      );
    }

    // 2. Khi đang ngủ hoặc buồn ngủ
    if (isSleepy) {
      return (
        <g>
          <ellipse cx="68" cy="118" rx="11" ry="6.5" fill="#FFB7C5" opacity="0.7" />
          <ellipse cx="152" cy="118" rx="11" ry="6.5" fill="#FFB7C5" opacity="0.7" />
          <path d="M74 108 Q85 117 96 108" fill="none" stroke="#4A3525" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M124 108 Q135 117 146 108" fill="none" stroke="#4A3525" strokeWidth="3.4" strokeLinecap="round" />
          {/* Bong bóng mũi phập phồng */}
          <circle
            cx="132"
            cy="115"
            r="9"
            fill="#D6F5FF"
            fillOpacity="0.82"
            stroke="#4A3525"
            strokeWidth="2"
          >
            <animate attributeName="r" values="6;11;6" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <path d="M104 118 Q110 123 116 118" fill="none" stroke="#4A3525" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      );
    }

    // 3. Khi hờn dỗi (Sulky)
    if (isSulky) {
      return (
        <g transform="translate(8, 0)">
          <circle cx="72" cy="120" r="10" fill="#FF8FA3" opacity="0.8" />
          <circle cx="144" cy="120" r="10" fill="#FF8FA3" opacity="0.8" />
          {/* Mày chau & mắt hờn */}
          <path d="M76 98 L94 105" stroke="#4A3525" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M142 98 L124 105" stroke="#4A3525" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="86" cy="109" r="6.5" fill="#4A3525" />
          <circle cx="132" cy="109" r="6.5" fill="#4A3525" />
          {/* Miệng mếu dỗi */}
          <path d="M101 122 Q110 114 119 122" fill="none" stroke="#4A3525" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      );
    }

    // 4. Khi đói bụng (Hungry)
    if (isHungry) {
      return (
        <g>
          <ellipse cx="68" cy="119" rx="11" ry="6.5" fill="#FFB7C5" opacity="0.75" />
          <ellipse cx="152" cy="119" rx="11" ry="6.5" fill="#FFB7C5" opacity="0.75" />
          {/* Đôi mắt to tròn long lanh */}
          <circle cx="85" cy="108" r="9.5" fill="#4A3525" />
          <circle cx="81.5" cy="104.5" r="3.5" fill="#FFFDF9" />
          <circle cx="88" cy="111" r="1.8" fill="#FFFDF9" />
          <circle cx="135" cy="108" r="9.5" fill="#4A3525" />
          <circle cx="131.5" cy="104.5" r="3.5" fill="#FFFDF9" />
          <circle cx="138" cy="111" r="1.8" fill="#FFFDF9" />
          {/* Giọt mồ hôi nhỏ trên thái dương */}
          <path
            d="M156 88 C156 88 162 96 156 100 C150 96 156 88 156 88 Z"
            fill="#89CFF0"
            stroke="#4A3525"
            strokeWidth="1.8"
          />
          <path d="M101 119 Q105.5 125 110 119 Q114.5 125 119 119" fill="none" stroke="#4A3525" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      );
    }

    // 5. Mặc định: Happy (có chớp mắt tự nhiên)
    return (
      <g>
        <ellipse cx="68" cy="118" rx="11.5" ry="6.5" fill="#FFB7C5" opacity="0.78" />
        <ellipse cx="152" cy="118" rx="11.5" ry="6.5" fill="#FFB7C5" opacity="0.78" />
        {isBlinking ? (
          <>
            <line x1="75" y1="108" x2="95" y2="108" stroke="#4A3525" strokeWidth="3.6" strokeLinecap="round" />
            <line x1="125" y1="108" x2="145" y2="108" stroke="#4A3525" strokeWidth="3.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="85" cy="107" r="9" fill="#4A3525" />
            <circle cx="82" cy="104" r="3.2" fill="#FFFDF9" />
            <circle cx="88" cy="110" r="1.5" fill="#FFFDF9" />
            <circle cx="135" cy="107" r="9" fill="#4A3525" />
            <circle cx="132" cy="104" r="3.2" fill="#FFFDF9" />
            <circle cx="138" cy="110" r="1.5" fill="#FFFDF9" />
          </>
        )}
        {/* Miệng mèo/cún w đáng yêu */}
        <path
          d="M101 116 Q105.5 123 110 116 Q114.5 123 119 116"
          fill="none"
          stroke="#4A3525"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>
    );
  };

  // Loài 2: Cún Corgi lông vàng mật bụng trắng
  const renderCorgiRig = () => (
    <g>
      {/* Đuôi bông tròn lắc lia lịa */}
      <g transform="translate(166, 134)">
        <circle cx="0" cy="0" r="13" fill="#F4B36C" stroke="#4A3525" strokeWidth="2.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-8 0 0; 12 0 0; -8 0 0"
            dur={isExcited ? '0.35s' : '0.9s'}
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Tai trái & Tai phải to vểnh */}
      <g
        style={{
          transformOrigin: '68px 72px',
          transform: earTwitch ? 'rotate(-7deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s ease'
        }}
      >
        <path
          d="M54 90 L38 36 L92 66 Z"
          fill="#F4B36C"
          stroke="#4A3525"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M58 82 L47 47 L82 67 Z" fill="#FFE5C4" />
      </g>
      <g
        style={{
          transformOrigin: '152px 72px',
          transform: earTwitch ? 'rotate(6deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s ease'
        }}
      >
        <path
          d="M166 90 L182 36 L128 66 Z"
          fill="#F4B36C"
          stroke="#4A3525"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M162 82 L173 47 L138 67 Z" fill="#FFE5C4" />
      </g>

      {/* Thân & Đầu Chibi mũm mĩm 3 lớp */}
      <ellipse cx="110" cy="118" rx="63" ry="50" fill="#F4B36C" stroke="#4A3525" strokeWidth="2.5" />
      {/* Highlight trán */}
      <ellipse cx="105" cy="84" rx="34" ry="12" fill="#FAD09E" opacity="0.65" />
      {/* Mảng lông trắng kem ở bụng, ngực và dọc sống mũi */}
      <ellipse cx="110" cy="138" rx="43" ry="29" fill="#FFFDF9" />
      <path d="M98 70 Q110 112 122 70 Z" fill="#FFFDF9" />
      {/* Mũi cún nâu sô-cô-la */}
      <ellipse cx="110" cy="110" rx="5.5" ry="4" fill="#4A3525" />

      {/* Bàn chân ngắn mũm mĩm */}
      <ellipse cx="76" cy="164" rx="14" ry="8.5" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
      <ellipse cx="144" cy="164" rx="14" ry="8.5" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
    </g>
  );

  // Loài 3: Thỏ Bông trắng hồng pastel
  const renderBunnyRig = () => (
    <g>
      {/* Đuôi cục bông tròn phía sau */}
      <circle cx="168" cy="140" r="14" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
      {/* Đôi tai thỏ dài đung đưa mềm mại */}
      <g
        style={{
          transformOrigin: '84px 72px',
          transform: earTwitch ? 'rotate(-9deg)' : 'rotate(-4deg)',
          transition: 'transform 0.2s ease'
        }}
      >
        <ellipse cx="82" cy="48" rx="15" ry="38" fill="#FFF5F7" stroke="#4A3525" strokeWidth="2.5" />
        <ellipse cx="82" cy="50" rx="8" ry="25" fill="#FFB7C5" />
      </g>
      <g
        style={{
          transformOrigin: '136px 72px',
          transform: earTwitch ? 'rotate(9deg)' : 'rotate(4deg)',
          transition: 'transform 0.2s ease'
        }}
      >
        <ellipse cx="138" cy="48" rx="15" ry="38" fill="#FFF5F7" stroke="#4A3525" strokeWidth="2.5" />
        <ellipse cx="138" cy="50" rx="8" ry="25" fill="#FFB7C5" />
      </g>

      {/* Thân thỏ bông tròn trịa */}
      <ellipse cx="110" cy="122" rx="60" ry="48" fill="#FFF8FA" stroke="#4A3525" strokeWidth="2.5" />
      <ellipse cx="105" cy="92" rx="36" ry="15" fill="#FFFFFF" opacity="0.8" />
      {/* Mũi hồng nhỏ hình tam giác bo tròn */}
      <ellipse cx="110" cy="111" rx="4.5" ry="3.2" fill="#FF8FA3" />

      {/* Hai chân thỏ */}
      <ellipse cx="78" cy="166" rx="14" ry="8.5" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
      <ellipse cx="142" cy="166" rx="14" ry="8.5" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
    </g>
  );

  // Mặc định Loài 1: Mèo Mochi trắng kem có đốm tai cam/nâu
  const renderCatRig = () => (
    <g>
      {/* Đuôi cong mềm vẫy nhịp nhàng */}
      <g>
        <path
          d="M162 142 Q196 122 184 96"
          fill="none"
          stroke="#4A3525"
          strokeWidth="13"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values="M162 142 Q196 122 184 96; M162 142 Q200 132 190 104; M162 142 Q196 122 184 96"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M162 142 Q196 122 184 96"
          fill="none"
          stroke="#FFAD87"
          strokeWidth="8"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values="M162 142 Q196 122 184 96; M162 142 Q200 132 190 104; M162 142 Q196 122 184 96"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Tai trái & Tai phải */}
      <g
        style={{
          transformOrigin: '68px 76px',
          transform: earTwitch ? 'rotate(-6deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s ease'
        }}
      >
        <path
          d="M56 90 L44 44 L92 68 Z"
          fill="#FFFDF9"
          stroke="#4A3525"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M60 80 L52 54 L82 68 Z" fill="#FFB7C5" />
      </g>
      <g
        style={{
          transformOrigin: '152px 76px',
          transform: earTwitch ? 'rotate(6deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s ease'
        }}
      >
        <path
          d="M164 90 L176 44 L128 68 Z"
          fill="#FFAD87"
          stroke="#4A3525"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M160 80 L168 54 L138 68 Z" fill="#FFB7C5" />
      </g>

      {/* Thân bánh dày Mochi tròn ủm 3 lớp */}
      <ellipse cx="110" cy="118" rx="63" ry="48" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
      {/* Đốm lông cam mật trên đầu */}
      <path d="M114 70 C144 70 166 86 170 108 C142 112 124 98 114 70 Z" fill="#FFAD87" />
      {/* Đốm nâu sô-cô-la nhỏ bên thái dương trái */}
      <ellipse cx="66" cy="86" rx="14" ry="9" transform="rotate(-22 66 86)" fill="#C9925B" opacity="0.85" />
      {/* Bóng đổ bụng dưới tạo khối 3D mềm */}
      <path
        d="M54 136 C74 162 146 162 166 136 C152 158 68 158 54 136 Z"
        fill="#F0E2D2"
      />
      {/* Râu mèo ngắn xinh */}
      <path d="M46 110 L32 107 M46 118 L30 120" stroke="#4A3525" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M174 110 L188 107 M174 118 L190 120" stroke="#4A3525" strokeWidth="2.4" strokeLinecap="round" />

      {/* Hai bàn chân tròn */}
      <ellipse cx="78" cy="163" rx="13" ry="8" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
      <ellipse cx="142" cy="163" rx="13" ry="8" fill="#FFFDF9" stroke="#4A3525" strokeWidth="2.5" />
    </g>
  );

  // Kiểm tra nếu loài thú này có sprite vẽ tay .webp trong public/assets/pets/
  const emotionKey = isSleepy
    ? 'sleepy'
    : isSulky
    ? 'sulky'
    : isHungry
    ? 'hungry'
    : 'happy';
  const preferredPetAssetId = `${type}_${emotionKey}`;
  const fallbackHappyAssetId = `${type}_happy`;
  const petAssetsList = availableAssets?.pets || [];
  const resolvedPetAssetId = petAssetsList.includes(preferredPetAssetId)
    ? preferredPetAssetId
    : petAssetsList.includes(fallbackHappyAssetId)
    ? fallbackHappyAssetId
    : null;

  if (resolvedPetAssetId) {
    return (
      <div
        className="relative select-none w-32 h-32 sm:w-36 sm:h-36 flex items-end justify-center"
        style={{
          transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.25s ease'
        }}
      >
        <motion.div
          animate={
            isPetted
              ? {
                  scaleX: [1, 1.14, 0.94, 1.04, 1],
                  scaleY: [1, 0.86, 1.08, 0.97, 1],
                  y: [0, 4, -6, 0]
                }
              : isWalking
              ? {
                  y: [0, -8, 0],
                  scaleY: [1, 1.04, 0.96, 1]
                }
              : {
                  scaleY: [1, 1.03, 1],
                  scaleX: [1, 0.98, 1],
                  y: [0, 1.5, 0]
                }
          }
          transition={
            isPetted
              ? { duration: 0.55, ease: 'easeOut' }
              : isWalking
              ? { duration: 0.45, repeat: Infinity }
              : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ transformOrigin: 'bottom center' }}
          className="w-full h-full"
        >
          <SmartAsset
            category="pets"
            assetId={resolvedPetAssetId}
            alt={`Thú cưng ${type}`}
            showShadow={true}
            className="w-full h-full object-contain object-bottom drop-shadow-sm"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative select-none"
      style={{
        transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
        transition: 'transform 0.25s ease'
      }}
    >
      <svg viewBox="0 0 220 190" className="w-36 h-32 sm:w-40 sm:h-36 overflow-visible">
        {/* Bóng tiếp xúc dưới chân (Contact Shadow) */}
        <ellipse cx="110" cy="168" rx="56" ry="11" fill="#3D2616" fillOpacity="0.16" />

        {/* Toàn bộ cơ thể có hiệu ứng Squash & Stretch + Nhịp thở mềm mại */}
        <motion.g
          animate={
            isPetted
              ? {
                  scaleX: [1, 1.15, 0.94, 1.04, 1],
                  scaleY: [1, 0.85, 1.08, 0.97, 1],
                  y: [0, 4, -6, 0]
                }
              : isWalking
              ? {
                  y: [0, -8, 0],
                  scaleY: [1, 1.04, 0.96, 1]
                }
              : {
                  scaleY: [1, 1.025, 1],
                  scaleX: [1, 0.985, 1],
                  y: [0, 1.5, 0]
                }
          }
          transition={
            isPetted
              ? { duration: 0.55, ease: 'easeOut' }
              : isWalking
              ? { duration: 0.45, repeat: Infinity }
              : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ transformOrigin: '110px 164px' }}
        >
          {type === 'corgi'
            ? renderCorgiRig()
            : type === 'bunny'
            ? renderBunnyRig()
            : renderCatRig()}

          {renderFacialFeatures()}

          {/* Phụ kiện đeo trên đầu hoặc cổ */}
          <PetAccessorySvg accessoryId={accessoryId} />
        </motion.g>
      </svg>
    </div>
  );
}
