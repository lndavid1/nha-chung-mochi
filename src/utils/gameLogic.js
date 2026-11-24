// Catalog 8 Slot nội thất + Thức ăn + Tính toán suy giảm chỉ số + Nén ảnh WebP Base64

export const PET_TYPES = [
  {
    id: 'cat',
    name: 'Mèo Mochi',
    defaultName: 'Mochi',
    desc: 'Tròn ủm như bánh nếp, thích nằm ườn và hay mách lẻo',
    badge: '🐱 Hệ Quấn Chủ'
  },
  {
    id: 'corgi',
    name: 'Cún Corgi',
    defaultName: 'Bơ',
    desc: 'Chân ngắn mông trái tim, siêu tăng động khi 2 chủ cùng online',
    badge: '🐶 Hệ Năng Lượng'
  },
  {
    id: 'bunny',
    name: 'Thỏ Bông',
    defaultName: 'Bông',
    desc: 'Tai dài mềm mại, thích phòng sạch thơm và hay hờn dỗi nhẹ',
    badge: '🐰 Hệ Đáng Yêu'
  }
];

export const FOOD_CATALOG = [
  {
    id: 'kibble',
    name: 'Hạt Dinh Dưỡng',
    price: 0,
    hunger: 18,
    mood: 5,
    energy: 4,
    desc: 'Luôn miễn phí cho bé không bao giờ bị đói',
    icon: '🥣',
    color: '#FDE68A'
  },
  {
    id: 'salmon',
    name: 'Sashimi Cá Hồi',
    price: 15,
    hunger: 35,
    mood: 18,
    energy: 10,
    desc: 'Thịt cá tươi béo ngậy, tăng mạnh độ no & vui vẻ',
    icon: '🍣',
    color: '#FDA4AF'
  },
  {
    id: 'cake',
    name: 'Bánh Kem Dâu',
    price: 25,
    hunger: 25,
    mood: 32,
    energy: 15,
    desc: 'Món tráng miệng ngọt ngào làm bé nhảy chân sáo',
    icon: '🍰',
    color: '#F9A8D4'
  },
  {
    id: 'boba',
    name: 'Sữa Tươi Trân Châu',
    price: 20,
    hunger: 20,
    mood: 26,
    energy: 20,
    desc: 'Nạp năng lượng cấp tốc để thức chơi cùng hai chủ',
    icon: '🧋',
    color: '#FDBA74'
  }
];

export const ROOM_SLOTS = [
  { id: 'wall', label: 'Tường nhà', icon: '🎨' },
  { id: 'floor', label: 'Sàn nhà', icon: '🪵' },
  { id: 'window', label: 'Cửa sổ', icon: '🪟' },
  { id: 'bed', label: 'Giường thú', icon: '🛏️' },
  { id: 'rug', label: 'Thảm sàn', icon: '🧶' },
  { id: 'plant', label: 'Cây cảnh', icon: '🪴' },
  { id: 'decor', label: 'Nội thất', icon: '📚' }
];

export const FURNITURE_CATALOG = {
  wall: [
    { id: 'wall_cream', slot: 'wall', name: 'Kem Ấm Vanilla', price: 0, desc: 'Màu kem dịu mắt ấm cúng mặc định', previewColor: '#FFF3E0' },
    { id: 'wall_pink', slot: 'wall', name: 'Hồng Đào Pastel', price: 40, desc: 'Tường hồng sọc caro ngọt ngào lãng mạn', previewColor: '#FCE7F3' },
    { id: 'wall_mint', slot: 'wall', name: 'Xanh Bạc Hà', price: 45, desc: 'Mát mẻ trong lành như quán cafe mùa hạ', previewColor: '#DCFCE7' },
    { id: 'wall_brick', slot: 'wall', name: 'Gạch Cổ Điển Loft', price: 65, desc: 'Tường gạch ấm áp phong cách studio châu Âu', previewColor: '#FED7AA' }
  ],
  floor: [
    { id: 'floor_oak', slot: 'floor', name: 'Gỗ Sồi Sáng', price: 0, desc: 'Sàn gỗ sồi tự nhiên ấm chân', previewColor: '#E6C29F' },
    { id: 'floor_walnut', slot: 'floor', name: 'Gỗ Trầm Cổ Điển', price: 45, desc: 'Gỗ óc chó nâu trầm sang trọng', previewColor: '#A47551' },
    { id: 'floor_terrazzo', slot: 'floor', name: 'Đá Terrazzo', price: 55, desc: 'Đá mài hạt màu trẻ trung nghệ thuật', previewColor: '#F3E8EE' },
    { id: 'floor_meadow', slot: 'floor', name: 'Thảm Cỏ Picnic', price: 70, desc: 'Biến sàn phòng thành đồng cỏ xanh mướt', previewColor: '#BBF7D0' }
  ],
  window: [
    { id: 'win_wood', slot: 'window', name: 'Cửa Gỗ Vuông', price: 0, desc: 'Khung cửa gỗ có rèm kem nhìn ra bầu trời', previewColor: '#D97706' },
    { id: 'win_arch', slot: 'window', name: 'Cửa Vòm Pháp', price: 60, desc: 'Cửa sổ vòm lãng mạn kèm dây đèn lấp lánh', previewColor: '#F472B6' },
    { id: 'win_bay', slot: 'window', name: 'Cửa Kính Panorama', price: 85, desc: 'Khung kính rộng ngắm trọn hoàng hôn và sao đêm', previewColor: '#38BDF8' }
  ],
  bed: [
    { id: 'bed_cushion', slot: 'bed', name: 'Đệm Tròn Mây', price: 0, desc: 'Đệm bông tròn êm ái cho giấc ngủ trưa', previewColor: '#FDBA74' },
    { id: 'bed_strawberry', slot: 'bed', name: 'Ổ Dâu Tây Ngọt', price: 55, desc: 'Nhà vòm hình quả dâu đỏ mọng siêu cưng', previewColor: '#FB7185' },
    { id: 'bed_royal', slot: 'bed', name: 'Sofa Hoàng Gia', price: 80, desc: 'Giường nhung vương miện cho boss quý tộc', previewColor: '#C084FC' },
    { id: 'bed_kotatsu', slot: 'bed', name: 'Chăn Ấm Nhật Bản', price: 95, desc: 'Đệm chăn họa tiết Shiba cực ấm mùa đông', previewColor: '#FBBF24' }
  ],
  rug: [
    { id: 'rug_oval', slot: 'rug', name: 'Thảm Dệt Kem', price: 0, desc: 'Thảm oval dệt sợi mềm mại giữa phòng', previewColor: '#FDE68A' },
    { id: 'rug_heart', slot: 'rug', name: 'Thảm Trái Tim Đôi', price: 50, desc: 'Thảm trái tim hồng pastel minh chứng tình bạn/tình yêu', previewColor: '#F472B6' },
    { id: 'rug_daisy', slot: 'rug', name: 'Thảm Hoa Cúc Họa Mi', price: 65, desc: 'Bông hoa cúc trắng nhụy vàng rực rỡ giữa sàn', previewColor: '#FEF08A' },
    { id: 'rug_cloud', slot: 'rug', name: 'Thảm Bồng Bềnh Mây', price: 75, desc: 'Thảm mây trắng cầu vồng êm như bước trên trời', previewColor: '#BAE6FD' }
  ],
  plant: [
    { id: 'plant_monstera', slot: 'plant', name: 'Chậu Lá Xẻ Monstera', price: 0, desc: 'Cây trầu bà lá xẻ xanh mát góc phòng', previewColor: '#4ADE80' },
    { id: 'plant_sakura', slot: 'plant', name: 'Bonsai Đào Sakura', price: 65, desc: 'Tán hoa anh đào hồng rụng cánh thơ mộng', previewColor: '#F9A8D4' },
    { id: 'plant_cactus', slot: 'plant', name: 'Bộ Ba Xương Rồng', price: 50, desc: 'Chậu xương rồng tai thỏ nở hoa nhỏ xinh', previewColor: '#86EFAC' },
    { id: 'plant_Vàng', slot: 'plant', name: 'Cây Kim Tiền Phát Tài', price: 80, desc: 'Cây phong thủy đính nơ đỏ may mắn cho cả hai', previewColor: '#FACC15' }
  ],
  decor: [
    { id: 'decor_bookshelf', slot: 'decor', name: 'Kệ Sách Gỗ Nhỏ', price: 0, desc: 'Kệ gỗ đựng truyện tranh và chậu cây mini', previewColor: '#D97706' },
    { id: 'decor_lamp', slot: 'decor', name: 'Đèn Cây Ánh Trăng', price: 55, desc: 'Đèn lồng cầu tỏa ánh vàng ấm áp mỗi tối', previewColor: '#FDE047' },
    { id: 'decor_teatable', slot: 'decor', name: 'Bàn Trà Bánh Ngọt', price: 70, desc: 'Bàn gỗ tròn bày sẵn 2 tách trà nóng và macaron', previewColor: '#FDBA74' },
    { id: 'decor_vinyl', slot: 'decor', name: 'Máy Đĩa Than Lo-Fi', price: 95, desc: 'Góc nhạc đĩa than retro phát nốt nhạc bay bổng', previewColor: '#A78BFA' }
  ]
};

export const ALL_FURNITURE_LIST = Object.values(FURNITURE_CATALOG).flat();

export function getFurnitureById(itemId) {
  return ALL_FURNITURE_LIST.find((item) => item.id === itemId) || null;
}

export const DEFAULT_EQUIPPED = {
  wall: 'wall_cream',
  floor: 'floor_oak',
  window: 'win_wood',
  bed: 'bed_cushion',
  rug: 'rug_oval',
  plant: 'plant_monstera',
  decor: 'decor_bookshelf'
};

export const DEFAULT_INVENTORY = Object.values(DEFAULT_EQUIPPED);

// Sinh mã phòng dễ đọc, chuẩn MOCHI-88 hoặc 6 ký tự đẹp
export function generateRoomCode() {
  const prefixes = ['MOCHI', 'CORGI', 'HAPPY', 'SWEET', 'COZY'];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix =
    chars[Math.floor(Math.random() * chars.length)] +
    chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${suffix}`;
}

// Tính thời điểm trong ngày theo đồng hồ thiết bị
export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 16) {
    return {
      period: 'day',
      label: 'Nắng sớm trong lành',
      hour,
      isNight: false
    };
  }
  if (hour >= 16 && hour < 19) {
    return {
      period: 'sunset',
      label: 'Hoàng hôn cam ấm',
      hour,
      isNight: false
    };
  }
  return {
    period: 'night',
    label: 'Đêm đầy sao ấm áp',
    hour,
    isNight: true
  };
}

// Clamp giá trị 0 - 100
export function clampStat(val) {
  return Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
}

/**
 * Tính toán suy giảm chỉ số theo thời gian thực kể từ lastUpdated (Client-side timestamp decay)
 * - Đói giảm ~4 điểm/giờ
 * - Vệ sinh giảm ~3 điểm/giờ
 * - Vui giảm ~3.5 điểm/giờ
 * - Năng lượng giảm ~2.5 điểm/giờ khi thức, hoặc tăng +15 điểm/giờ khi bật chế độ ngủ (và các chỉ số khác giảm chậm đi một nửa)
 * - Tự động sinh cục rác/bụi nhỏ (tối đa 3 cục) sau mỗi ~1.5 giờ
 */
export function computeDecayedState(petState, now = Date.now()) {
  if (!petState) return null;
  const lastUpdated = petState.lastUpdated || now;
  const elapsedMs = Math.max(0, now - lastUpdated);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // Nếu dưới 2 phút thì không cần trừ
  if (elapsedHours < 0.03) {
    return {
      ...petState,
      emotion: resolvePetEmotion(petState)
    };
  }

  const isSleeping = Boolean(petState.isSleeping);
  const decayMultiplier = isSleeping ? 0.5 : 1.0;

  const hungerLoss = elapsedHours * 4.0 * decayMultiplier;
  const hygieneLoss = elapsedHours * 3.0 * decayMultiplier;
  const moodLoss = elapsedHours * 3.5 * decayMultiplier;
  const energyDelta = isSleeping ? elapsedHours * 15.0 : -elapsedHours * 2.5;

  const hunger = clampStat((petState.hunger ?? 80) - hungerLoss);
  const hygiene = clampStat((petState.hygiene ?? 85) - hygieneLoss);
  const mood = clampStat((petState.mood ?? 80) - moodLoss);
  const energy = clampStat((petState.energy ?? 85) + energyDelta);

  // Kiểm tra sinh bụi/rác trên sàn
  const currentTrash = Array.isArray(petState.trashList) ? [...petState.trashList] : [];
  const trashToSpawn = Math.min(3 - currentTrash.length, Math.floor(elapsedHours / 1.5));
  if (trashToSpawn > 0) {
    for (let i = 0; i < trashToSpawn; i++) {
      currentTrash.push({
        id: `trash_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        x: 18 + Math.floor(Math.random() * 64),
        y: 68 + Math.floor(Math.random() * 16),
        type: i % 2 === 0 ? 'dust' : 'crumb'
      });
    }
  }

  const updated = {
    ...petState,
    hunger,
    hygiene,
    mood,
    energy,
    trashList: currentTrash,
    lastUpdated: now
  };

  updated.emotion = resolvePetEmotion(updated);
  return updated;
}

// Xác định biểu cảm chủ đạo dựa trên chỉ số & trạng thái
export function resolvePetEmotion(pet, bothOnline = false) {
  if (!pet) return 'happy';
  if (pet.isSleeping) return 'sleepy';
  if (
    (pet.hunger ?? 80) < 25 ||
    (pet.mood ?? 80) < 25 ||
    (pet.hygiene ?? 80) < 25 ||
    (pet.energy ?? 80) < 20
  ) {
    return 'sulky';
  }
  if ((pet.hunger ?? 80) < 42) return 'hungry';
  if ((pet.energy ?? 80) < 35) return 'sleepy';
  if (bothOnline) return 'excited';
  return pet.emotion || 'happy';
}

/**
 * Tính thưởng Co-op Combo & Streak khi một người thực hiện hành động chăm sóc
 */
export function evaluateCoopCareBonus(roomData, currentPlayerRole, baseCoins = 10) {
  const now = Date.now();
  const todayStr = new Date(now).toISOString().slice(0, 10);
  const lastCareBy = roomData?.pet?.lastCareBy || null;
  const lastStreakDate = roomData?.streakDate || '';
  let currentStreak = Number(roomData?.streak || 1);

  const isCoopCombo = Boolean(lastCareBy && lastCareBy !== currentPlayerRole);
  const earnedCoins = isCoopCombo ? baseCoins * 2 : baseCoins;

  if (lastStreakDate !== todayStr) {
    const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);
    if (lastStreakDate === yesterday || isCoopCombo) {
      currentStreak += 1;
    } else if (!lastStreakDate) {
      currentStreak = 1;
    }
  } else if (isCoopCombo && !roomData?.todayComboCounted) {
    currentStreak += 1;
  }

  return {
    isCoopCombo,
    earnedCoins,
    nextStreak: currentStreak,
    streakDate: todayStr,
    todayComboCounted: isCoopCombo ? true : Boolean(roomData?.todayComboCounted)
  };
}

/**
 * Nén ảnh ngay trên trình duyệt bằng <canvas> xuống tối đa 400x400px,
 * định dạng image/webp (fallback image/jpeg) chất lượng 0.7 (< 50KB)
 */
export function compressImageToBase64(file, maxSize = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Không tìm thấy file ảnh'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFF9F2';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Thử xuất image/webp trước
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Nếu vẫn lớn hơn ~50KB (khoảng 68,000 ký tự base64), giảm nhẹ kích thước/chất lượng thêm 1 nấc
        if (dataUrl.length > 68000) {
          dataUrl = canvas.toDataURL('image/webp', 0.52);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.52);
          }
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Không thể đọc định dạng ảnh này'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file từ thiết bị'));
    reader.readAsDataURL(file);
  });
}

// Tạo dữ liệu phòng mặc định ban đầu
export function createInitialRoomState({
  roomId,
  player1Name,
  petName,
  petType
}) {
  const now = Date.now();
  const todayStr = new Date(now).toISOString().slice(0, 10);

  return {
    roomId,
    createdAt: now,
    coins: 120,
    streak: 1,
    streakDate: todayStr,
    todayComboCounted: false,
    players: {
      player1: {
        name: player1Name || 'Chủ nhỏ 1',
        joinedAt: now,
        online: true,
        lastSeen: now
      },
      player2: null
    },
    pet: {
      name: petName || 'Mochi',
      type: petType || 'cat',
      hunger: 82,
      mood: 86,
      hygiene: 90,
      energy: 88,
      isSleeping: false,
      emotion: 'happy',
      lastCareBy: 'player1',
      lastUpdated: now,
      trashList: [
        { id: 'trash_init_1', x: 26, y: 74, type: 'crumb' },
        { id: 'trash_init_2', x: 72, y: 78, type: 'dust' }
      ],
      aiBubble: {
        dialogue: `Meow~ Chào mừng ${player1Name} về nhà chung! Mau rủ người kia vào nuôi ${petName || 'Mochi'} cùng nha! 💕`,
        emotion: 'happy',
        modelUsed: 'khởi-tạo',
        updatedAt: now
      }
    },
    room: {
      equipped: { ...DEFAULT_EQUIPPED },
      inventory: [...DEFAULT_INVENTORY]
    },
    stickyNote: {
      mode: 'text',
      text: 'Chào mừng về Nhà Chung của tụi mình! Nhớ cho bé ăn đúng giờ nha 🐾💌',
      drawingData: '',
      author: player1Name || 'Chủ nhỏ 1',
      updatedAt: now
    },
    photoFrame: {
      imageData: '',
      caption: 'Kỷ niệm tụi mình 💕',
      updatedBy: player1Name || 'Chủ nhỏ 1',
      updatedAt: now
    },
    mysteryGift: null,
    memorySummary: `${player1Name} vừa lập ngôi nhà chung ấm cúng cho ${petName || 'Mochi'}.`,
    lastMemoryUpdatedAt: now,
    logs: [
      {
        id: `log_${now}`,
        actor: player1Name || 'Chủ nhỏ 1',
        action: `đã khai trương Nhà Chung và đón bé ${petName || 'Mochi'} về dinh!`,
        petComment: 'Nhà mới thơm mùi gỗ quá đi, hóng chủ thứ 2 ghê!',
        timestamp: now
      }
    ]
  };
}
