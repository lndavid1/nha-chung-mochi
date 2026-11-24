# Hướng Dẫn Asset 2D `.webp` — Nhà Chung Mochi (3 Phòng)

Hệ thống `SmartAsset` ([SmartAsset.jsx](file:///e:/game/src/components/common/SmartAsset.jsx)) tự động ưu tiên ảnh `.webp` có trong `public/assets/<category>/<id>.webp` (được liệt kê trong `src/data/availableAssets.json`). Nếu chưa có ảnh `.webp`, game tự động hiển thị bản vẽ tay SVG tương ứng mà không bao giờ lỗi 404.

## Cấu trúc thư mục `public/assets/`
- `pets/` — `cat_happy.webp`, `cat_sleepy.webp`, `cat_sulky.webp`, `cat_hungry.webp`
- `accessories/` — `acc_sprout.webp`, `acc_bow.webp`, `acc_beret.webp`, `acc_glasses.webp`, `acc_crown.webp`, `acc_scarf.webp`
- `windows/`, `beds/`, `rugs/`, `plants/`, `decor/`, `wallDecor/` — Đồ Phòng Khách (`living`)
- `skewers/` — 12 xiên nướng của mini-game *Bếp Nướng Mochi*
- `kitchen/` — Đồ & nền **Nhà Bếp (`kitchen`)**:
  - Tường & Sàn: `kwall_tile_cream`, `kwall_mint_tile`, `kwall_butter`, `kfloor_checker`, `kfloor_oak`, `kfloor_terrazzo`
  - Tủ lạnh: `fridge_cream`, `fridge_mint`, `fridge_berry`
  - Tủ bếp & bếp nấu: `stove_oak`, `stove_french`, `stove_sage`
  - Kệ gia vị / treo tường: `kdecor_spice`, `kdecor_copper`, `kdecor_herbwin`
  - Bàn ăn mini: `table_round`, `table_gingham`, `table_island`
  - Bát ăn đôi: `bowl_cat`, `bowl_wood`, `bowl_fish`
- `bathroom/` — Đồ & nền **Phòng Tắm (`bathroom`)**:
  - Tường & Sàn: `bwall_blue_tile`, `bwall_pink_tile`, `bwall_spa_wood`, `bfloor_pebble`, `bfloor_hex`, `bfloor_onsen`
  - Gương & chậu rửa: `vanity_arch`, `vanity_led`, `vanity_mint`
  - Kệ khăn / cửa sổ mờ: `bdecor_towel`, `bdecor_window`, `bdecor_fern`
  - Bồn tắm: `tub_vintage`, `tub_hinoki`, `tub_pink_duck`
  - Đồ góc phòng tắm: `bprop_basket`, `bprop_stool`, `bprop_plant`
  - Thảm chân bông: `bmat_paw`, `bmat_cloud`, `bmat_duck`

Sau khi thêm ảnh `.webp` vào `public/assets/kitchen/` hoặc `public/assets/bathroom/`, chạy lại `python scripts/slice_and_process.py` để tự động cập nhật `src/data/availableAssets.json`.
