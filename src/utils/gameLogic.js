// Catalog 10 Slot nội thất + 6 Phụ kiện thú cưng + Thức ăn + Tính suy giảm chỉ số + Nén ảnh WebP Base64
// Giữ nguyên 100% tương thích ngược với ID đồ cũ trên Firebase Realtime Database

export const PET_TYPES = [
  {
    id: 'cat',
    name: 'Mèo Mochi',
    defaultName: 'Mochi',
    desc: 'Trắng kem đốm tai cam mật, thích nằm ườn và hay mách lẻo chuyện hai chủ',
    badge: 'Hệ Quấn Chủ'
  },
  {
    id: 'corgi',
    name: 'Cún Corgi',
    defaultName: 'Bơ',
    desc: 'Lông vàng mật bụng trắng, tai vểnh mông tròn, siêu phấn khích khi 2 chủ online',
    badge: 'Hệ Năng Lượng'
  },
  {
    id: 'bunny',
    name: 'Thỏ Bông',
    defaultName: 'Bông',
    desc: 'Trắng hồng phấn tai dài mềm mại, thích phòng thơm tho và hay làm nũng',
    badge: 'Hệ Đáng Yêu'
  }
];

export const FOOD_CATALOG = [
  {
    id: 'kibble',
    name: 'Bát Hạt Sữa Ấm',
    price: 0,
    hunger: 18,
    mood: 6,
    energy: 5,
    desc: 'Luôn miễn phí để bé không bao giờ bị đói bụng',
    color: '#FFE082'
  },
  {
    id: 'salmon',
    name: 'Sashimi Cá Hồi',
    price: 15,
    hunger: 35,
    mood: 18,
    energy: 10,
    desc: 'Cá hồi tươi béo ngậy, tăng mạnh độ no và vui vẻ',
    color: '#FF9B71'
  },
  {
    id: 'cake',
    name: 'Bánh Kem Dâu Tây',
    price: 25,
    hunger: 25,
    mood: 32,
    energy: 15,
    desc: 'Bánh kem mềm phủ dâu đỏ mọng làm bé nhảy chân sáo',
    color: '#FFB7C5'
  },
  {
    id: 'boba',
    name: 'Sữa Tươi Đường Đen',
    price: 20,
    hunger: 20,
    mood: 26,
    energy: 22,
    desc: 'Trân châu đường đen dẻo thơm nạp đầy năng lượng',
    color: '#E6C29F'
  }
];

// Danh sách 3 phòng liên thông
export const ROOM_LIST = [
  { id: 'living', label: 'Phòng khách', shortLabel: 'Phòng khách' },
  { id: 'kitchen', label: 'Nhà bếp', shortLabel: 'Bếp' },
  { id: 'bathroom', label: 'Phòng tắm', shortLabel: 'Phòng tắm' }
];

// Danh sách các Slot hiển thị trong Live Decorator Studio (kèm tọa độ Hotspot khớp chính xác hệ tọa độ khóa cứng)
export const ROOM_SLOTS = [
  { id: 'wall', label: 'Tường nhà', hotspot: { x: 22, y: 18 } },
  { id: 'floor', label: 'Sàn nhà', hotspot: { x: 84, y: 78 } },
  { id: 'window', label: 'Cửa sổ', hotspot: { x: 22, y: 26 } },
  { id: 'bed', label: 'Giường thú', hotspot: { x: 36, y: 55 } },
  { id: 'rug', label: 'Thảm sàn', hotspot: { x: 50, y: 74 } },
  { id: 'plant', label: 'Cây cảnh', hotspot: { x: 16, y: 50 } },
  { id: 'decor', label: 'Nội thất', hotspot: { x: 81, y: 49 } },
  { id: 'wallDecor', label: 'Treo tường', hotspot: { x: 52, y: 17 } },
  { id: 'accessory', label: 'Phụ kiện thú', hotspot: { x: 50, y: 67 } }
];

export const KITCHEN_SLOTS_META = [
  { id: 'kitchenWall', label: 'Tường bếp', hotspot: { x: 24, y: 18 } },
  { id: 'kitchenFloor', label: 'Sàn bếp', hotspot: { x: 52, y: 78 } },
  { id: 'fridge', label: 'Tủ lạnh', hotspot: { x: 17, y: 40 } },
  { id: 'stoveCounter', label: 'Tủ bếp', hotspot: { x: 64, y: 46 } },
  { id: 'kitchenDecor', label: 'Kệ bếp', hotspot: { x: 64, y: 21 } },
  { id: 'diningTable', label: 'Bàn ăn', hotspot: { x: 22, y: 66 } },
  { id: 'petBowl', label: 'Bát ăn', hotspot: { x: 81, y: 72 } },
  { id: 'accessory', label: 'Phụ kiện thú', hotspot: { x: 52, y: 68 } }
];

export const BATHROOM_SLOTS_META = [
  { id: 'bathWall', label: 'Tường tắm', hotspot: { x: 24, y: 18 } },
  { id: 'bathFloor', label: 'Sàn tắm', hotspot: { x: 50, y: 79 } },
  { id: 'vanityMirror', label: 'Gương & chậu', hotspot: { x: 22, y: 36 } },
  { id: 'bathDecor', label: 'Kệ khăn', hotspot: { x: 76, y: 24 } },
  { id: 'bathtub', label: 'Bồn tắm', hotspot: { x: 68, y: 55 } },
  { id: 'bathProp', label: 'Góc tắm', hotspot: { x: 16, y: 60 } },
  { id: 'bathMat', label: 'Thảm bông', hotspot: { x: 41, y: 74 } },
  { id: 'accessory', label: 'Phụ kiện thú', hotspot: { x: 42, y: 68 } }
];

export const ROOM_SLOTS_BY_ROOM = {
  living: ROOM_SLOTS,
  kitchen: KITCHEN_SLOTS_META,
  bathroom: BATHROOM_SLOTS_META
};

export const KITCHEN_SLOT_IDS = [
  'kitchenWall',
  'kitchenFloor',
  'fridge',
  'stoveCounter',
  'kitchenDecor',
  'diningTable',
  'petBowl'
];

export const BATHROOM_SLOT_IDS = [
  'bathWall',
  'bathFloor',
  'vanityMirror',
  'bathDecor',
  'bathtub',
  'bathProp',
  'bathMat'
];

export function getSlotRoom(slotId) {
  if (KITCHEN_SLOT_IDS.includes(slotId)) return 'kitchen';
  if (BATHROOM_SLOT_IDS.includes(slotId)) return 'bathroom';
  return 'living';
}

export const FURNITURE_CATALOG = {
  wall: [
    { id: 'wall_cream', slot: 'wall', name: 'Kem Sữa Phào Gỗ', price: 0, desc: 'Tường kem sữa ấm áp kèm phào chỉ gỗ sồi thanh lịch' },
    { id: 'wall_pink', slot: 'wall', name: 'Hồng Phấn Chấm Bi', price: 40, desc: 'Tường hồng pastel điểm chấm bi kem ngọt ngào' },
    { id: 'wall_mint', slot: 'wall', name: 'Xanh Sage Kẻ Sọc', price: 45, desc: 'Sọc dọc xanh lá matcha dịu mắt phong cách Bắc Âu' },
    { id: 'wall_brick', slot: 'wall', name: 'Gạch Thẻ Trắng Vintage', price: 65, desc: 'Tường gạch thẻ kem trắng có mạch vữa ấm cúng' },
    { id: 'wall_wainscot', slot: 'wall', name: 'Lam Gỗ Nhật Bản', price: 85, desc: 'Tường ốp lam gỗ nửa thân phong cách Muji tối giản' }
  ],
  floor: [
    { id: 'floor_oak', slot: 'floor', name: 'Sồi Ghép Xương Cá', price: 0, desc: 'Sàn gỗ sồi sáng lát họa tiết xương cá tinh tế' },
    { id: 'floor_walnut', slot: 'floor', name: 'Óc Chó Vân Trầm', price: 45, desc: 'Gỗ óc chó nâu trầm ấm áp có vân mắt gỗ tự nhiên' },
    { id: 'floor_checker', slot: 'floor', name: 'Gạch Caro Kem Nâu', price: 55, desc: 'Sàn gạch caro cổ điển như tiệm bánh châu Âu' },
    { id: 'floor_terrazzo', slot: 'floor', name: 'Đá Terrazzo Pastel', price: 60, desc: 'Đá mài nghệ thuật điểm hạt thạch anh hồng và xanh' },
    { id: 'floor_meadow', slot: 'floor', name: 'Hiên Gỗ Viền Cỏ', price: 75, desc: 'Sàn ván gỗ ban công điểm thảm cỏ non xanh mát' }
  ],
  window: [
    { id: 'win_wood', slot: 'window', name: 'Cửa Vòm Gỗ Pháp', price: 0, desc: 'Khung cửa gỗ vòm cổ điển đón nắng sớm vào phòng' },
    { id: 'win_arch', slot: 'window', name: 'Cửa Rèm Ren Đung Đưa', price: 60, desc: 'Đôi rèm vải voan ren trắng đung đưa nhẹ theo gió' },
    { id: 'win_bay', slot: 'window', name: 'Cửa Kính Bệ Hoa', price: 85, desc: 'Khung kính panorama kèm chậu hoa cúc nhỏ trên bệ' },
    { id: 'win_cabin', slot: 'window', name: 'Cửa Tròn Cabin Gỗ', price: 90, desc: 'Ô cửa sổ tròn ấm cúng như căn gác mái mùa đông' }
  ],
  bed: [
    { id: 'bed_cushion', slot: 'bed', name: 'Ổ Mây Bông Xù', price: 0, desc: 'Ổ đệm mây bồng bềnh kèm chiếc gối nhỏ êm ái' },
    { id: 'bed_wood', slot: 'bed', name: 'Giường Gỗ Chăn Caro', price: 55, desc: 'Giường gỗ sồi mini phủ chăn kẻ caro cam đào xếp nếp' },
    { id: 'bed_wicker', slot: 'bed', name: 'Giỏ Mây Nệm Matcha', price: 60, desc: 'Giỏ mây đan tay tỉ mỉ lót nệm bông xanh matcha dịu mát' },
    { id: 'bed_strawberry', slot: 'bed', name: 'Nhà Vòm Dâu Tây', price: 75, desc: 'Ổ nhà vòm hình quả dâu tây hồng phấn siêu ngọt ngào' },
    { id: 'bed_kotatsu', slot: 'bed', name: 'Đệm Bánh Mì Nướng', price: 85, desc: 'Đệm lát bánh mì Toast giòn rụm có miếng bơ vàng làm gối' },
    { id: 'bed_royal', slot: 'bed', name: 'Lều Teepee Cờ Dây', price: 95, desc: 'Lều vải bố ấm cúng trang trí dây cờ tam giác pastel' }
  ],
  rug: [
    { id: 'rug_oval', slot: 'rug', name: 'Thảm Len Tua Rua', price: 0, desc: 'Thảm tròn dệt sợi len kem bơ có tua rua hai đầu' },
    { id: 'rug_daisy', slot: 'rug', name: 'Thảm Trứng Ốp La', price: 50, desc: 'Thảm bông hình quả trứng ốp la lòng đào siêu cưng' },
    { id: 'rug_heart', slot: 'rug', name: 'Thảm Gấu Teddy', price: 65, desc: 'Thảm lông mềm hình khuôn mặt gấu Teddy nâu sữa' },
    { id: 'rug_cloud', slot: 'rug', name: 'Thảm Mây Pastel', price: 75, desc: 'Thảm đám mây trắng viền xanh bầu trời bồng bềnh' },
    { id: 'rug_boho', slot: 'rug', name: 'Thảm Dệt Thổ Cẩm', price: 80, desc: 'Thảm chữ nhật dệt họa tiết hình học Boho ấm cúng' },
    { id: 'rug_flower', slot: 'rug', name: 'Thảm Hoa Cúc Họa Mi', price: 70, desc: 'Thảm bông hình hoa cúc trắng nhụy vàng rực rỡ giữa sàn' }
  ],
  plant: [
    { id: 'plant_monstera', slot: 'plant', name: 'Trầu Bà Chậu Chấm Bi', price: 0, desc: 'Cây Monstera lá xẻ xanh mướt trong chậu gốm chấm bi' },
    { id: 'plant_cactus', slot: 'plant', name: 'Xương Rồng Tai Thỏ', price: 50, desc: 'Xương rồng tai thỏ mũm mĩm nở bông hoa hồng trên đỉnh' },
    { id: 'plant_Vàng', slot: 'plant', name: 'Cây Cam Mini Trĩu Quả', price: 65, desc: 'Chậu cam Kumquat sai trĩu quả vàng ươm may mắn' },
    { id: 'plant_sakura', slot: 'plant', name: 'Bình Gốm Hoa Tulip', price: 70, desc: 'Bình gốm thủ công cắm những bông Tulip hồng vàng' },
    { id: 'plant_aquarium', slot: 'plant', name: 'Bể Cá Thủy Sinh Mini', price: 95, desc: 'Bể kính tròn có rong xanh và chú cá vàng bơi qua lại' },
    { id: 'plant_fiddle', slot: 'plant', name: 'Cây Bàng Singapore', price: 75, desc: 'Chậu cây Bàng Singapore lá xanh mướt chuẩn phong cách Bắc Âu' }
  ],
  decor: [
    { id: 'decor_lamp', slot: 'decor', name: 'Đèn Cây Chao Xếp Ly', price: 0, desc: 'Đèn đứng chao vải xếp ly, chạm vào để bật/tắt ánh vàng ấm' },
    { id: 'decor_bookshelf', slot: 'decor', name: 'Kệ Sách Gỗ & Cây Rủ', price: 55, desc: 'Kệ gỗ 2 tầng bày sách màu, cốc gốm và dây thường xuân rủ' },
    { id: 'decor_teatable', slot: 'decor', name: 'Bàn Trà Tách Khói Ấm', price: 70, desc: 'Bàn trà gỗ thấp kèm gối ngồi và ấm trà nóng thư giãn' },
    { id: 'decor_vinyl', slot: 'decor', name: 'Tủ Đĩa Than Lo-Fi', price: 95, desc: 'Máy đĩa than cổ điển, chạm vào phát nốt nhạc Lo-Fi chill' },
    { id: 'decor_beanbag', slot: 'decor', name: 'Ghế Lười Hạt Xốp', price: 80, desc: 'Ghế lười vải nhung kem kèm gối tựa cam đào siêu êm' },
    { id: 'decor_nightstand', slot: 'decor', name: 'Tủ Gỗ Đèn Nấm Đỏ', price: 85, desc: 'Tủ đầu giường gỗ đặt đèn ngủ hình cây nấm đỏ và đồng hồ báo thức' }
  ],
  wallDecor: [
    { id: 'wdecor_fairy', slot: 'wallDecor', name: 'Dây Đèn Đom Đóm', price: 0, desc: 'Dây đèn Fairy Lights treo vòng cung tỏa sáng lung linh mỗi tối' },
    { id: 'wdecor_clock', slot: 'wallDecor', name: 'Đồng Hồ Gỗ Thời Gian Thực', price: 50, desc: 'Đồng hồ gỗ tròn có kim giờ và kim phút chạy đúng giờ máy' },
    { id: 'wdecor_shelf', slot: 'wallDecor', name: 'Kệ Treo Thường Xuân', price: 60, desc: 'Kệ gỗ treo tường đặt lọ gốm và nhánh dây thường xuân rủ lá' },
    { id: 'wdecor_calendar', slot: 'wallDecor', name: 'Lịch Xé Hôm Nay', price: 45, desc: 'Tờ lịch treo tường tự động in đúng ngày và tháng hôm nay' }
  ],
  accessory: [
    { id: 'acc_none', slot: 'accessory', name: 'Không Đeo Phụ Kiện', price: 0, desc: 'Vẻ đẹp mộc mạc tự nhiên của bé thú cưng' },
    { id: 'acc_sprout', slot: 'accessory', name: 'Lá Mầm Xanh Non', price: 30, desc: 'Chồi lá mầm nhỏ xinh đung đưa trên đỉnh đầu' },
    { id: 'acc_bow', slot: 'accessory', name: 'Nơ Ruy-Băng Đỏ', price: 35, desc: 'Chiếc nơ cổ ruy-băng đỏ thắm kèm chuông vàng nhỏ' },
    { id: 'acc_beret', slot: 'accessory', name: 'Mũ Nồi Họa Sĩ Be', price: 50, desc: 'Mũ nồi beret màu kem bơ phong cách họa sĩ Paris' },
    { id: 'acc_glasses', slot: 'accessory', name: 'Kính Tròn Học Thức', price: 55, desc: 'Cặp kính gọng vàng tròn xoe trông cực kỳ uyên bác' },
    { id: 'acc_crown', slot: 'accessory', name: 'Vương Miện Hoàng Gia', price: 85, desc: 'Vương miện vàng đính ngọc hồng cho Boss quyền lực nhất nhà' },
    { id: 'acc_scarf', slot: 'accessory', name: 'Khăn Len Mùa Đông', price: 60, desc: 'Khăn quàng cổ đan len sọc kem-san hô ấm áp siêu cưng' }
  ],

  // ===== NHÀ BẾP (KITCHEN) =====
  kitchenWall: [
    { id: 'kwall_tile_cream', slot: 'kitchenWall', room: 'kitchen', name: 'Gạch Thẻ Kem Ấm', price: 0, desc: 'Gạch thẻ chữ nhật trắng kem ấm cúng chuẩn bếp châu Âu' },
    { id: 'kwall_mint_tile', slot: 'kitchenWall', room: 'kitchen', name: 'Gạch Bông Xanh Mint', price: 45, desc: 'Gạch bông pastel xanh mint dịu mát điểm hoa văn nhỏ' },
    { id: 'kwall_butter', slot: 'kitchenWall', room: 'kitchen', name: 'Tường Vàng Bơ Ấm', price: 40, desc: 'Tường sơn màu vàng bơ ấm áp mang hương thơm tiệm bánh' }
  ],
  kitchenFloor: [
    { id: 'kfloor_checker', slot: 'kitchenFloor', room: 'kitchen', name: 'Gạch Caro Kem Nâu', price: 0, desc: 'Sàn gạch caro kem nâu cổ điển sạch sẽ dễ thương' },
    { id: 'kfloor_oak', slot: 'kitchenFloor', room: 'kitchen', name: 'Sàn Gỗ Sồi Sáng', price: 45, desc: 'Ván gỗ sồi sáng ấm áp hài hòa với tủ bếp gỗ' },
    { id: 'kfloor_terrazzo', slot: 'kitchenFloor', room: 'kitchen', name: 'Đá Terrazzo Ấm', price: 55, desc: 'Đá mài Terrazzo lấm tấm hạt cam đất và kem bơ' }
  ],
  fridge: [
    { id: 'fridge_cream', slot: 'fridge', room: 'kitchen', name: 'Tủ Retro Kem Bo Tròn', price: 0, desc: 'Tủ lạnh Smeg màu kem cổ điển có tay nắm bạc và nam châm xinh' },
    { id: 'fridge_mint', slot: 'fridge', room: 'kitchen', name: 'Tủ Lạnh Xanh Mint', price: 65, desc: 'Tủ lạnh pastel xanh bạc hà mát mắt đầy ắp đồ ăn vặt' },
    { id: 'fridge_berry', slot: 'fridge', room: 'kitchen', name: 'Tủ Lạnh Hồng Dâu', price: 75, desc: 'Tủ lạnh hồng dâu ngọt ngào dán đầy sticker trái tim' }
  ],
  stoveCounter: [
    { id: 'stove_oak', slot: 'stoveCounter', room: 'kitchen', name: 'Bếp Gỗ Sồi Nồi Súp', price: 0, desc: 'Hệ tủ bếp gỗ sồi ấm có nồi súp đang ninh thơm lừng' },
    { id: 'stove_french', slot: 'stoveCounter', room: 'kitchen', name: 'Bếp Trắng Kiểu Pháp', price: 80, desc: 'Tủ bếp trắng kem phào chỉ tinh tế kèm chảo bánh kếp' },
    { id: 'stove_sage', slot: 'stoveCounter', room: 'kitchen', name: 'Bếp Xanh Sage Ấm Trà', price: 85, desc: 'Tủ bếp xanh sage trầm dịu kèm ấm trà men sứ đun sôi' }
  ],
  kitchenDecor: [
    { id: 'kdecor_spice', slot: 'kitchenDecor', room: 'kitchen', name: 'Kệ Gia Vị & Đĩa Gốm', price: 0, desc: 'Kệ gỗ bày lọ gia vị thủy tinh, đĩa gốm và cốc sứ pastel' },
    { id: 'kdecor_copper', slot: 'kitchenDecor', room: 'kitchen', name: 'Thanh Treo Chảo Đồng', price: 55, desc: 'Thanh treo chảo đồng bóng loáng kèm muôi gỗ thủ công' },
    { id: 'kdecor_herbwin', slot: 'kitchenDecor', room: 'kitchen', name: 'Cửa Sổ Húng Quế', price: 70, desc: 'Ô cửa sổ bếp đón nắng với chậu húng quế xanh rờn trên bệ' }
  ],
  diningTable: [
    { id: 'table_round', slot: 'diningTable', room: 'kitchen', name: 'Bàn Tròn Bánh Ngọt', price: 0, desc: 'Bàn gỗ tròn nhỏ đặt đĩa bánh dâu tây thơm phức' },
    { id: 'table_gingham', slot: 'diningTable', room: 'kitchen', name: 'Bàn Khăn Caro Đỏ', price: 60, desc: 'Bàn phủ khăn caro đỏ trắng chuẩn tiệm bánh ngọt Paris' },
    { id: 'table_island', slot: 'diningTable', room: 'kitchen', name: 'Đảo Bếp Trà Sữa', price: 85, desc: 'Đảo bếp mini hiện đại đặt hai ly trà sữa trân châu đôi' }
  ],
  petBowl: [
    { id: 'bowl_cat', slot: 'petBowl', room: 'kitchen', name: 'Bát Gốm Tai Mèo', price: 0, desc: 'Bát đôi gốm sứ hình tai mèo trên thảm lót chống tràn' },
    { id: 'bowl_wood', slot: 'petBowl', room: 'kitchen', name: 'Bát Gỗ Nâng Cao', price: 45, desc: 'Khay gỗ sồi nâng chiều cao bảo vệ cổ cho bé ăn ngon miệng' },
    { id: 'bowl_fish', slot: 'petBowl', room: 'kitchen', name: 'Bát Sứ Hình Cá Pastel', price: 55, desc: 'Bát sứ pastel xanh-hồng hình chú cá siêu đáng yêu' }
  ],

  // ===== PHÒNG TẮM (BATHROOM) =====
  bathWall: [
    { id: 'bwall_blue_tile', slot: 'bathWall', room: 'bathroom', name: 'Gạch Xanh Biển Pastel', price: 0, desc: 'Gạch ô vuông xanh biển nhạt mát lành như làn nước sáng' },
    { id: 'bwall_pink_tile', slot: 'bathWall', room: 'bathroom', name: 'Gạch Hồng Phấn Bóng', price: 45, desc: 'Gạch men hồng phấn bóng nhẹ dịu dàng siêu ngọt ngào' },
    { id: 'bwall_spa_wood', slot: 'bathWall', room: 'bathroom', name: 'Gạch Trắng Spa Nhật', price: 65, desc: 'Tường gạch trắng kết hợp ốp gỗ Hinoki chuẩn spa Onsen' }
  ],
  bathFloor: [
    { id: 'bfloor_pebble', slot: 'bathFloor', room: 'bathroom', name: 'Đá Sỏi Sáng Tự Nhiên', price: 0, desc: 'Gạch lát họa tiết đá sỏi tròn sáng màu chống trơn' },
    { id: 'bfloor_hex', slot: 'bathFloor', room: 'bathroom', name: 'Gạch Lục Giác Xanh Trắng', price: 50, desc: 'Gạch tổ ong lục giác phối trắng và xanh dương pastel' },
    { id: 'bfloor_onsen', slot: 'bathFloor', room: 'bathroom', name: 'Sàn Gỗ Onsen Chống Nước', price: 65, desc: 'Sàn thanh gỗ tuyết tùng ấm chân chuẩn suối nước nóng Nhật' }
  ],
  vanityMirror: [
    { id: 'vanity_arch', slot: 'vanityMirror', room: 'bathroom', name: 'Gương Vòm Gỗ & Chậu Sứ', price: 0, desc: 'Gương vòm viền gỗ ấm kèm bồn rửa mặt sứ trắng thanh lịch' },
    { id: 'vanity_led', slot: 'vanityMirror', room: 'bathroom', name: 'Gương Tròn Đèn LED Ấm', price: 70, desc: 'Gương tròn hắt sáng LED vàng ấm lung linh chụp ảnh cực xinh' },
    { id: 'vanity_mint', slot: 'vanityMirror', room: 'bathroom', name: 'Tủ Lavabo Xanh Mint', price: 75, desc: 'Tủ rửa mặt pastel xanh mint có ngăn kéo đựng khăn bông' }
  ],
  bathDecor: [
    { id: 'bdecor_towel', slot: 'bathDecor', room: 'bathroom', name: 'Giá Khăn & Sữa Tắm', price: 0, desc: 'Giá treo khăn bông mềm mại kèm kệ chai sữa tắm hoa cúc' },
    { id: 'bdecor_window', slot: 'bathDecor', room: 'bathroom', name: 'Cửa Sổ Tròn Kính Mờ', price: 60, desc: 'Ô cửa sổ tròn kính mờ rèm sáo đón ánh sáng dịu nhẹ' },
    { id: 'bdecor_fern', slot: 'bathDecor', room: 'bathroom', name: 'Kệ Dương Xỉ & Nến Thơm', price: 65, desc: 'Kệ gỗ treo tường có cây dương xỉ rủ và hũ nến oải hương' }
  ],
  bathtub: [
    { id: 'tub_vintage', slot: 'bathtub', room: 'bathroom', name: 'Bồn Tắm Chân Sư Tử', price: 0, desc: 'Bồn tắm vintage sứ trắng đầy bọt xà phòng bông xốp' },
    { id: 'tub_hinoki', slot: 'bathtub', room: 'bathroom', name: 'Bồn Gỗ Hinoki Onsen', price: 90, desc: 'Bồn tắm gỗ Hinoki Nhật Bản thoang thoảng mùi gỗ thơm' },
    { id: 'tub_pink_duck', slot: 'bathtub', room: 'bathroom', name: 'Bồn Hồng Pastel Vịt Vàng', price: 85, desc: 'Bồn sứ hồng phấn siêu cưng kèm chú vịt cao su vàng bơi lội' }
  ],
  bathProp: [
    { id: 'bprop_basket', slot: 'bathProp', room: 'bathroom', name: 'Giỏ Mây Khăn Cuộn', price: 0, desc: 'Giỏ mây đan tay đựng đầy khăn tắm cuộn tròn thơm tho' },
    { id: 'bprop_stool', slot: 'bathProp', room: 'bathroom', name: 'Ghế Đẩu Vịt & Tinh Dầu', price: 50, desc: 'Ghế đẩu gỗ nhỏ đặt chú vịt cao su và lọ tinh dầu thư giãn' },
    { id: 'bprop_plant', slot: 'bathProp', room: 'bathroom', name: 'Chậu Lưỡi Hổ Mini', price: 55, desc: 'Chậu cây lưỡi hổ ưa ẩm giúp phòng tắm luôn xanh mát' }
  ],
  bathMat: [
    { id: 'bmat_paw', slot: 'bathMat', room: 'bathroom', name: 'Thảm Bông Bàn Chân Mèo', price: 0, desc: 'Thảm thấm nước lông xù hình bàn chân mèo hồng kem siêu êm' },
    { id: 'bmat_cloud', slot: 'bathMat', room: 'bathroom', name: 'Thảm Mây Xanh Biển', price: 45, desc: 'Thảm bông mềm hình đám mây xanh biển êm ái dưới chân' },
    { id: 'bmat_duck', slot: 'bathMat', room: 'bathroom', name: 'Thảm Vịt Vàng Mini', price: 55, desc: 'Thảm tròn hình chú vịt con màu vàng bơ vui nhộn' }
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
  decor: 'decor_bookshelf',
  wallDecor: 'wdecor_fairy',
  accessory: 'acc_sprout'
};

export const DEFAULT_KITCHEN_SLOTS = {
  kitchenWall: 'kwall_tile_cream',
  kitchenFloor: 'kfloor_checker',
  fridge: 'fridge_cream',
  stoveCounter: 'stove_oak',
  kitchenDecor: 'kdecor_spice',
  diningTable: 'table_round',
  petBowl: 'bowl_cat'
};

export const DEFAULT_BATHROOM_SLOTS = {
  bathWall: 'bwall_blue_tile',
  bathFloor: 'bfloor_pebble',
  vanityMirror: 'vanity_arch',
  bathDecor: 'bdecor_towel',
  bathtub: 'tub_vintage',
  bathProp: 'bprop_basket',
  bathMat: 'bmat_paw'
};

export const DEFAULT_INVENTORY = [
  'wall_cream',
  'floor_oak',
  'win_wood',
  'bed_cushion',
  'rug_oval',
  'plant_monstera',
  'decor_lamp',
  'decor_bookshelf',
  'wdecor_fairy',
  'acc_none',
  'acc_sprout',
  // Starter Nhà Bếp
  'kwall_tile_cream',
  'kfloor_checker',
  'fridge_cream',
  'stove_oak',
  'kdecor_spice',
  'table_round',
  'bowl_cat',
  // Starter Phòng Tắm
  'bwall_blue_tile',
  'bfloor_pebble',
  'vanity_arch',
  'bdecor_towel',
  'tub_vintage',
  'bprop_basket',
  'bmat_paw'
];

// Đảm bảo dữ liệu phòng cũ trên Firebase luôn có đủ các slot mới (tương thích ngược 100%)
export function normalizeEquippedRoom(rawEquipped = {}) {
  return {
    ...DEFAULT_EQUIPPED,
    ...(rawEquipped || {})
  };
}

export function normalizeKitchenSlots(rawKitchen = {}) {
  return {
    ...DEFAULT_KITCHEN_SLOTS,
    ...(rawKitchen || {})
  };
}

export function normalizeBathroomSlots(rawBathroom = {}) {
  return {
    ...DEFAULT_BATHROOM_SLOTS,
    ...(rawBathroom || {})
  };
}

export function normalizeInventoryList(rawInventory = []) {
  return Array.from(new Set([...DEFAULT_INVENTORY, ...(Array.isArray(rawInventory) ? rawInventory : [])]));
}

// Sinh mã phòng dễ đọc, chuẩn MOCHI-88
export function generateRoomCode() {
  const prefixes = ['MOCHI', 'CORGI', 'HAPPY', 'SWEET', 'COZY'];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix =
    chars[Math.floor(Math.random() * chars.length)] +
    chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${suffix}`;
}

// Tính thời điểm trong ngày theo đồng hồ thiết bị (hoặc chế độ xem thử overridePeriod)
export function getTimeOfDay(date = new Date(), overridePeriod = 'auto') {
  const hour = date.getHours();
  const period =
    overridePeriod && overridePeriod !== 'auto'
      ? overridePeriod
      : hour >= 6 && hour < 16
      ? 'day'
      : hour >= 16 && hour < 19
      ? 'sunset'
      : 'night';

  if (period === 'day') {
    return {
      period: 'day',
      label: 'Nắng sớm ấm áp',
      hour,
      isNight: false
    };
  }
  if (period === 'sunset') {
    return {
      period: 'sunset',
      label: 'Hoàng hôn mật đào',
      hour,
      isNight: false
    };
  }
  return {
    period: 'night',
    label: 'Đêm trăng sao dịu',
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
 */
export function computeDecayedState(petState, now = Date.now()) {
  if (!petState) return null;
  const lastUpdated = petState.lastUpdated || now;
  const elapsedMs = Math.max(0, now - lastUpdated);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

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

  const currentTrash = Array.isArray(petState.trashList) ? [...petState.trashList] : [];
  const trashToSpawn = Math.min(3 - currentTrash.length, Math.floor(elapsedHours / 1.5));
  if (trashToSpawn > 0) {
    for (let i = 0; i < trashToSpawn; i++) {
      currentTrash.push({
        id: `trash_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        x: 24 + Math.floor(Math.random() * 52),
        y: 72 + Math.floor(Math.random() * 14),
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
        ctx.fillStyle = '#FFF8F0';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

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
    coins: 150,
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
      hunger: 84,
      mood: 88,
      hygiene: 92,
      energy: 88,
      isSleeping: false,
      emotion: 'happy',
      lastCareBy: 'player1',
      lastUpdated: now,
      trashList: [
        { id: 'trash_init_1', x: 32, y: 76, type: 'crumb' },
        { id: 'trash_init_2', x: 68, y: 81, type: 'dust' }
      ],
      aiBubble: {
        dialogue: `Meow~ Chào mừng ${player1Name} về nhà mới! Mau rủ người kia vào trang trí phòng cùng ${petName || 'Mochi'} nha!`,
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
      text: 'Chào mừng về Nhà Chung của tụi mình! Nhớ cho bé ăn đúng giờ nha!',
      drawingData: '',
      author: player1Name || 'Chủ nhỏ 1',
      updatedAt: now
    },
    photoFrame: {
      imageData: '',
      caption: 'Kỷ niệm tụi mình',
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
