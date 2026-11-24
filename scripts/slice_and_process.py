import json
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

ROOT_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT_DIR / "raw_assets"
OUT_DIR = ROOT_DIR / "public" / "assets"
MANIFEST_PATH = ROOT_DIR / "src" / "data" / "availableAssets.json"

CATEGORIES = [
    "pets",
    "windows",
    "beds",
    "rugs",
    "plants",
    "decor",
    "wallDecor",
    "accessories",
    "skewers",
]
MAX_DIM = 512
ACCESSORY_MAX_DIM = 256
SKEWER_MAX_DIM = 256


def remove_bg_smart_bfs(img: Image.Image) -> Image.Image:
    """
    Tách nền thông minh từ 4 góc theo màu nền xám trung tính #D8D8D8 + xóa watermark góc dưới phải + khử viền răng cưa 1px.
    """
    rgba = img.convert("RGBA")
    w, h = rgba.size
    pixels = rgba.load()

    corners = [
        pixels[0, 0][:3],
        pixels[w - 1, 0][:3],
        pixels[0, h - 1][:3],
        pixels[w - 1, h - 1][:3],
    ]
    bg_r = sum(c[0] for c in corners) / 4.0
    bg_g = sum(c[1] for c in corners) / 4.0
    bg_b = sum(c[2] for c in corners) / 4.0

    # Che sạch dấu sao watermark nhỏ ở góc dưới cùng bên phải (5% góc) bằng màu nền trước khi tách nền
    wm_w = int(w * 0.065)
    wm_h = int(h * 0.065)
    for y in range(h - wm_h, h):
        for x in range(w - wm_w, w):
            r, g, b, a = pixels[x, y]
            sat = max(r, g, b) - min(r, g, b)
            luma = 0.299 * r + 0.587 * g + 0.114 * b
            if sat < 22 and luma > 175:
                pixels[x, y] = (int(bg_r), int(bg_g), int(bg_b), 255)

    def is_bg_pixel(r, g, b):
        dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
        sat = max(r, g, b) - min(r, g, b)
        luma = 0.299 * r + 0.587 * g + 0.114 * b
        if luma < 108:
            return False
        return (dist < 76 and sat < 28) or (dist < 44)

    visited = [[False] * w for _ in range(h)]
    queue = deque()

    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
        visited[0][x] = True
        visited[h - 1][x] = True
    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))
        visited[y][0] = True
        visited[y][w - 1] = True

    bg_mask = [[False] * w for _ in range(h)]

    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        if a == 0 or is_bg_pixel(r, g, b):
            bg_mask[y][x] = True
            pixels[x, y] = (0, 0, 0, 0)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                    visited[ny][nx] = True
                    queue.append((nx, ny))

    # Khử viền xám 1px sát rìa vật thể
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if not bg_mask[y][x]:
                r, g, b, a = pixels[x, y]
                touches_bg = (
                    bg_mask[y - 1][x]
                    or bg_mask[y + 1][x]
                    or bg_mask[y][x - 1]
                    or bg_mask[y][x + 1]
                )
                if touches_bg:
                    sat = max(r, g, b) - min(r, g, b)
                    dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
                    if dist < 115 and sat < 34:
                        pixels[x, y] = (r, g, b, int(a * 0.25))

    r_ch, g_ch, b_ch, a_ch = rgba.split()
    a_smooth = a_ch.filter(ImageFilter.GaussianBlur(radius=0.55))
    a_orig_px = a_ch.load()
    a_sm_px = a_smooth.load()
    for y in range(h):
        for x in range(w):
            if a_orig_px[x, y] == 0:
                a_sm_px[x, y] = 0

    return Image.merge("RGBA", (r_ch, g_ch, b_ch, a_smooth))


def remove_small_specks(rgba: Image.Image, min_ratio: float = 0.008) -> Image.Image:
    w, h = rgba.size
    if w < 10 or h < 10:
        return rgba

    scale = max(1, max(w, h) // 200)
    sw, sh = max(1, w // scale), max(1, h // scale)
    small = rgba.resize((sw, sh), Image.Resampling.NEAREST)
    sp = small.load()

    comp_id = [[-1] * sw for _ in range(sh)]
    comp_sizes = []
    cid = 0

    for y in range(sh):
        for x in range(sw):
            if sp[x, y][3] > 20 and comp_id[y][x] == -1:
                q = deque([(x, y)])
                comp_id[y][x] = cid
                cnt = 0
                while q:
                    cx, cy = q.popleft()
                    cnt += 1
                    for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                        if 0 <= nx < sw and 0 <= ny < sh and comp_id[ny][nx] == -1 and sp[nx, ny][3] > 20:
                            comp_id[ny][nx] = cid
                            q.append((nx, ny))
                comp_sizes.append(cnt)
                cid += 1

    if not comp_sizes:
        return rgba

    max_size = max(comp_sizes)
    keep = {i for i, sz in enumerate(comp_sizes) if sz >= max_size * min_ratio}

    out = rgba.copy()
    op = out.load()
    for y in range(h):
        sy = min(sh - 1, y // scale)
        for x in range(w):
            sx = min(sw - 1, x // scale)
            c = comp_id[sy][sx]
            if c != -1 and c not in keep:
                op[x, y] = (0, 0, 0, 0)
    return out


def make_glasses_lenses_translucent(rgba: Image.Image) -> Image.Image:
    out = rgba.copy()
    w, h = out.size
    px = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 30:
                sat = max(r, g, b) - min(r, g, b)
                luma = 0.299 * r + 0.587 * g + 0.114 * b
                if sat < 26 and luma > 165:
                    px[x, y] = (245, 250, 255, 36)
    return out


def find_connected_object_boxes(rgba: Image.Image, expected_count: int, rows: int, cols: int, force_grid: bool = False):
    w, h = rgba.size

    if not force_grid:
        scale = max(1, max(w, h) // 260)
        sw, sh = max(1, w // scale), max(1, h // scale)
        small = rgba.resize((sw, sh), Image.Resampling.NEAREST)
        sp = small.load()

        visited = [[False] * sw for _ in range(sh)]
        boxes = []

        for y in range(sh):
            for x in range(sw):
                if sp[x, y][3] > 25 and not visited[y][x]:
                    q = deque([(x, y)])
                    visited[y][x] = True
                    min_x = max_x = x
                    min_y = max_y = y
                    cnt = 0
                    while q:
                        cx, cy = q.popleft()
                        cnt += 1
                        if cx < min_x: min_x = cx
                        if cx > max_x: max_x = cx
                        if cy < min_y: min_y = cy
                        if cy > max_y: max_y = cy
                        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                            if 0 <= nx < sw and 0 <= ny < sh and not visited[ny][nx] and sp[nx, ny][3] > 25:
                                visited[ny][nx] = True
                                q.append((nx, ny))
                    if cnt > (sw * sh * 0.005):
                        pad = 6
                        boxes.append((
                            max(0, min_x * scale - pad),
                            max(0, min_y * scale - pad),
                            min(w, (max_x + 1) * scale + pad),
                            min(h, (max_y + 1) * scale + pad),
                            cnt,
                        ))

        if len(boxes) >= expected_count:
            boxes.sort(key=lambda b: b[4], reverse=True)
            top_boxes = boxes[:expected_count]
            top_boxes.sort(key=lambda b: (b[1] + b[3]) / 2.0)
            ordered = []
            for r in range(rows):
                row_slice = top_boxes[r * cols : (r + 1) * cols]
                row_slice.sort(key=lambda b: (b[0] + b[2]) / 2.0)
                ordered.extend([(b[0], b[1], b[2], b[3]) for b in row_slice])
            return ordered, "connected-components"

    cell_w = w / cols
    cell_h = h / rows
    grid_boxes = []
    for r in range(rows):
        for c in range(cols):
            grid_boxes.append((
                int(c * cell_w),
                int(r * cell_h),
                int((c + 1) * cell_w),
                int((r + 1) * cell_h),
            ))
    return grid_boxes, "uniform-grid"


def save_clean_webp(cell_rgba: Image.Image, dst_path: Path, max_dim: int = MAX_DIM, is_glasses: bool = False, keep_multi_parts: bool = False):
    cleaned = cell_rgba if keep_multi_parts else remove_small_specks(cell_rgba)
    if is_glasses:
        cleaned = make_glasses_lenses_translucent(cleaned)

    w, h = cleaned.size
    px = cleaned.load()
    for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if px[cx, cy][3] != 0:
            px[cx, cy] = (0, 0, 0, 0)

    bbox = cleaned.getbbox()
    if bbox:
        cleaned = cleaned.crop(bbox)

    cw, ch = cleaned.size
    if max(cw, ch) > max_dim:
        scale = max_dim / float(max(cw, ch))
        cleaned = cleaned.resize(
            (max(1, int(cw * scale)), max(1, int(ch * scale))),
            Image.Resampling.LANCZOS,
        )

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(dst_path, format="WEBP", quality=85, method=6)
    if dst_path.stat().st_size > 45 * 1024:
        cleaned.save(dst_path, format="WEBP", quality=76, method=6)
    if dst_path.stat().st_size > 45 * 1024:
        cw, ch = cleaned.size
        cleaned = cleaned.resize((int(cw * 0.85), int(ch * 0.85)), Image.Resampling.LANCZOS)
        cleaned.save(dst_path, format="WEBP", quality=74, method=6)

    size_kb = dst_path.stat().st_size / 1024.0
    print(f"[OK] {dst_path.relative_to(ROOT_DIR)} ({size_kb:.1f} KB, {cleaned.size[0]}x{cleaned.size[1]})")


def process_sheet(sheet_path: Path, rows: int, cols: int, targets: list, max_dim: int = MAX_DIM, force_grid: bool = False, keep_multi_parts: bool = False):
    if not sheet_path.exists():
        print(f"[SKIP] Missing sheet: {sheet_path.name}")
        return
    print(f"\nProcessing sheet: {sheet_path.name} ({rows}x{cols})")
    raw_img = Image.open(sheet_path)
    full_rgba = remove_bg_smart_bfs(raw_img)
    boxes, mode = find_connected_object_boxes(full_rgba, len(targets), rows, cols, force_grid=force_grid)
    print(f"  Slicing method: {mode} ({len(boxes)} cells)")

    for idx, (cat, asset_id) in enumerate(targets):
        if idx >= len(boxes) or not asset_id:
            continue
        crop = full_rgba.crop(boxes[idx])
        dst = OUT_DIR / cat / f"{asset_id}.webp"
        save_clean_webp(
            crop,
            dst,
            max_dim=max_dim,
            is_glasses=(asset_id == "acc_glasses"),
            keep_multi_parts=keep_multi_parts,
        )


def rebuild_manifest():
    available = {cat: [] for cat in CATEGORIES}
    for cat in CATEGORIES:
        cat_dir = OUT_DIR / cat
        if not cat_dir.exists():
            continue
        for f in sorted(cat_dir.glob("*.webp")):
            available[cat].append(f.stem)

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(available, f, indent=2, ensure_ascii=False)
    print("\nUpdated manifest src/data/availableAssets.json:")
    print(json.dumps(available, indent=2))


def find_sheet_file(stem: str) -> Path:
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        p = RAW_DIR / f"{stem}{ext}"
        if p.exists():
            return p
    return RAW_DIR / f"{stem}.jpg"


def main():
    # 1. Pet đầu trần (2x2)
    process_sheet(
        find_sheet_file("sheet_pet_2x2"),
        rows=2,
        cols=2,
        targets=[
            ("pets", "cat_happy"),
            ("pets", "cat_sleepy"),
            ("pets", "cat_sulky"),
            ("pets", "cat_hungry"),
        ],
    )

    # 2. 6 Phụ kiện thú (2x3)
    process_sheet(
        find_sheet_file("sheet_accessories_3x2"),
        rows=2,
        cols=3,
        targets=[
            ("accessories", "acc_sprout"),
            ("accessories", "acc_bow"),
            ("accessories", "acc_beret"),
            ("accessories", "acc_glasses"),
            ("accessories", "acc_crown"),
            ("accessories", "acc_scarf"),
        ],
        max_dim=ACCESSORY_MAX_DIM,
    )

    # 3. 4 Cửa sổ (2x2)
    process_sheet(
        find_sheet_file("sheet_windows_2x2"),
        rows=2,
        cols=2,
        targets=[
            ("windows", "win_wood"),
            ("windows", "win_arch"),
            ("windows", "win_bay"),
            ("windows", "win_cabin"),
        ],
    )

    # 4. 6 Giường thú (2x3)
    process_sheet(
        find_sheet_file("sheet_beds_3x2"),
        rows=2,
        cols=3,
        targets=[
            ("beds", "bed_cushion"),
            ("beds", "bed_wood"),
            ("beds", "bed_wicker"),
            ("beds", "bed_kotatsu"),
            ("beds", "bed_royal"),
            ("beds", "bed_strawberry"),
        ],
    )

    # 5. 6 Cây cảnh (2x3)
    process_sheet(
        find_sheet_file("sheet_plants_3x2"),
        rows=2,
        cols=3,
        targets=[
            ("plants", "plant_monstera"),
            ("plants", "plant_cactus"),
            ("plants", "plant_Vàng"),
            ("plants", "plant_sakura"),
            ("plants", "plant_aquarium"),
            ("plants", "plant_fiddle"),
        ],
    )

    # 6. 6 Nội thất lớn (2x3 - dùng force_grid + keep_multi_parts để giữ nguyên 2 gối cạnh bàn trà)
    process_sheet(
        find_sheet_file("sheet_decor_3x2"),
        rows=2,
        cols=3,
        targets=[
            ("decor", "decor_lamp"),
            ("decor", "decor_bookshelf"),
            ("decor", "decor_teatable"),
            ("decor", "decor_vinyl"),
            ("decor", "decor_beanbag"),
            ("decor", "decor_nightstand"),
        ],
        force_grid=True,
        keep_multi_parts=True,
    )

    # 7. 6 Thảm trải sàn (2x3)
    process_sheet(
        find_sheet_file("sheet_rugs_3x2"),
        rows=2,
        cols=3,
        targets=[
            ("rugs", "rug_oval"),
            ("rugs", "rug_daisy"),
            ("rugs", "rug_heart"),
            ("rugs", "rug_cloud"),
            ("rugs", "rug_boho"),
            ("rugs", "rug_flower"),
        ],
    )

    # 8. 4 Đồ treo tường (2x2 - dùng force_grid để giữ nguyên các chi tiết trên kệ gỗ)
    process_sheet(
        find_sheet_file("sheet_walldecor_2x2"),
        rows=2,
        cols=2,
        targets=[
            ("wallDecor", "wdecor_fairy"),
            ("wallDecor", "wdecor_clock"),
            ("wallDecor", "wdecor_shelf"),
            ("wallDecor", "wdecor_calendar"),
        ],
        force_grid=True,
        keep_multi_parts=True,
    )

    # 9. 12 Xiên nướng Bếp Nướng Mochi (3x4)
    process_sheet(
        find_sheet_file("sheet_skewers_4x3"),
        rows=3,
        cols=4,
        targets=[
            ("skewers", "burger"),
            ("skewers", "veggie"),
            ("skewers", "pineapple"),
            ("skewers", "mochi"),
            ("skewers", "carrot"),
            ("skewers", "pizza"),
            ("skewers", "squid"),
            ("skewers", "donut"),
            ("skewers", "naruto"),
            ("skewers", "corn"),
            ("skewers", "avocado"),
            ("skewers", "corndog"),
        ],
        max_dim=SKEWER_MAX_DIM,
    )

    rebuild_manifest()


if __name__ == "__main__":
    main()
