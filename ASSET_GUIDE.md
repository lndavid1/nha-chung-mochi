# Hướng Dẫn Pipeline Asset 2.5D (Blender RGBA PNG & AI) — Nhà Chung Mochi

Hệ thống đồ họa Hybrid ([SmartAsset.jsx](file:///e:/game/src/components/common/SmartAsset.jsx) & [IsometricCanvas.jsx](file:///e:/game/src/components/minigames/supermarket/IsometricCanvas.jsx)) tự động ưu tiên ảnh `.webp` trong `public/assets/<category>/<id>.webp` (được quản lý qua [availableAssets.json](file:///e:/game/src/data/availableAssets.json)). Bất kỳ món nào chưa có `.webp` sẽ tự động fallback mượt về SVG / Canvas mặc định mà không bao giờ gây lỗi 404.

---

## 1. Quy trình xuất ảnh từ Blender (Giữ nguyên Shadow Catcher & Anti-Aliasing)
1. Trong Blender: bật **Render Properties → Film → Transparent** và xuất định dạng **PNG (RGBA, 8-bit/16-bit)**.
2. Thả file `.png` vào đúng thư mục con tương ứng trong `raw_assets/<category>/<ten_file>.png`.
3. Chạy lệnh xử lý tự động:
   ```powershell
   python scripts/process_assets.py
   ```
4. Script [process_assets.py](file:///e:/game/scripts/process_assets.py) sẽ tự động:
   - Nhận diện 4 góc ảnh có `alpha == 0` → **chế độ Blender RGBA** (bỏ qua bước tách nền, giữ 100% độ khử răng cưa mượt mà và bóng đổ mềm từ Shadow Catcher).
   - Auto-trim theo ngưỡng `alpha > 8` và chừa đệm an toàn `4px` trong suốt xung quanh.
   - Resize giữ tỉ lệ (tối đa `512px` cho phòng/nội thất, `420px` cho `supermarket/`, `256px` cho phụ kiện & xiên nướng), xuất `.webp` (`quality=86, method=6`).
   - Tự động quét lại toàn bộ `public/assets/` và cập nhật [availableAssets.json](file:///e:/game/src/data/availableAssets.json) mà không làm mất các ảnh cũ.

---

## 2. Danh sách tên file chuẩn theo từng khu vực

### A. Thú Cưng & Phụ Kiện (`public/assets/pets/`, `accessories/`)
| Thư mục | Tên file (`.webp`) | Mô tả |
| :--- | :--- | :--- |
| `pets/` | `cat_happy`, `cat_sleepy`, `cat_sulky`, `cat_hungry` | 4 biểu cảm Mèo Mochi (đầu trần để gắn phụ kiện) |
| `accessories/` | `acc_sprout`, `acc_bow`, `acc_beret`, `acc_glasses`, `acc_crown`, `acc_scarf` | 6 phụ kiện gắn theo điểm neo `petAnchors.js` |

### B. Phòng Khách (`living`)
| Thư mục | Tên file (`.webp`) |
| :--- | :--- |
| `windows/` | `win_wood`, `win_arch`, `win_bay`, `win_cabin` |
| `beds/` | `bed_cushion`, `bed_wood`, `bed_wicker`, `bed_strawberry`, `bed_kotatsu`, `bed_royal` |
| `rugs/` | `rug_oval`, `rug_daisy`, `rug_heart`, `rug_cloud`, `rug_boho`, `rug_flower` |
| `plants/` | `plant_monstera`, `plant_cactus`, `plant_Vàng`, `plant_sakura`, `plant_aquarium`, `plant_fiddle` |
| `decor/` | `decor_lamp`, `decor_bookshelf`, `decor_teatable`, `decor_vinyl`, `decor_beanbag`, `decor_nightstand` |
| `wallDecor/` | `wdecor_fairy`, `wdecor_clock`, `wdecor_shelf`, `wdecor_calendar` |

### C. Nhà Bếp (`public/assets/kitchen/`)
| Slot | Tên file (`.webp`) |
| :--- | :--- |
| Tường & Sàn | `kwall_tile_cream`, `kwall_mint_tile`, `kwall_butter`, `kfloor_checker`, `kfloor_oak`, `kfloor_terrazzo` |
| Tủ lạnh (`fridge`) | `fridge_cream`, `fridge_mint`, `fridge_berry` |
| Tủ bếp (`stoveCounter`) | `stove_oak`, `stove_french`, `stove_sage` |
| Kệ bếp (`kitchenDecor`) | `kdecor_spice`, `kdecor_copper`, `kdecor_herbwin` |
| Bàn ăn (`diningTable`) | `table_round`, `table_gingham`, `table_island` |
| Bát ăn (`petBowl`) | `bowl_cat`, `bowl_wood`, `bowl_fish` |

### D. Phòng Tắm (`public/assets/bathroom/`)
| Slot | Tên file (`.webp`) |
| :--- | :--- |
| Tường & Sàn | `bwall_blue_tile`, `bwall_pink_tile`, `bwall_spa_wood`, `bfloor_pebble`, `bfloor_hex`, `bfloor_onsen` |
| Gương & Chậu (`vanityMirror`) | `vanity_arch`, `vanity_led`, `vanity_mint` |
| Kệ khăn (`bathDecor`) | `bdecor_towel`, `bdecor_window`, `bdecor_fern` |
| Bồn tắm (`bathtub`) | `tub_vintage`, `tub_hinoki`, `tub_pink_duck` |
| Góc tắm (`bathProp`) | `bprop_basket`, `bprop_stool`, `bprop_plant` |
| Thảm bông (`bathMat`) | `bmat_paw`, `bmat_cloud`, `bmat_duck` |

### E. Siêu Thị Mochi Tycoon — Isometric 2.5D (`public/assets/supermarket/`)
*(Render góc camera Orthographic Isometric chuẩn 2:1, chiều ngang tối đa 420px, căn neo bottom-center tự động trong `IsometricCanvas.jsx`)*

| Tên file (`.webp`) | Công trình trên bản đồ Isometric |
| :--- | :--- |
| `stall_bakery` | Gian hàng Tiệm Bánh (Bakery) |
| `stall_produce` | Gian hàng Rau Củ & Trái Cây (Produce) |
| `stall_meat` | Gian hàng Quầy Thịt Tươi (Butcher) |
| `stall_fish` | Gian hàng Hải Sản & Cá Tươi (Fish Market) |
| `stall_perfume` | Gian hàng Nước Hoa & Mỹ Phẩm (Perfume) |
| `stall_electronics` | Gian hàng Đồ Điện Tử (Electronics) |
| `checkout_counter` | Quầy Thu Ngân (Checkout Lane) |
| `delivery_van` | Xe Tải Giao Hàng (Delivery Van) |

### F. Mini-game Bếp Nướng (`public/assets/skewers/`)
`avocado`, `burger`, `carrot`, `corn`, `corndog`, `donut`, `mochi`, `naruto`, `pineapple`, `pizza`, `squid`, `veggie`.
