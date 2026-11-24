import json
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

ROOT_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT_DIR / "raw_assets"
OUT_DIR = ROOT_DIR / "public" / "assets"
MANIFEST_PATH = ROOT_DIR / "src" / "data" / "availableAssets.json"

CATEGORIES = ["pets", "windows", "beds", "rugs", "plants", "decor"]
MAX_DIM = 512


def remove_bg_smart_bfs(img: Image.Image) -> Image.Image:
    """
    Tách nền thông minh từ 4 góc theo màu nền xám trung tính #D8D8D8 + khử viền răng cưa 1px.
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

    def is_bg_pixel(r, g, b):
        dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
        sat = max(r, g, b) - min(r, g, b)
        luma = 0.299 * r + 0.587 * g + 0.114 * b
        if luma < 110:
            return False
        return (dist < 76 and sat < 30) or (dist < 44)

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
                    if dist < 115 and sat < 35:
                        pixels[x, y] = (r, g, b, int(a * 0.25))

    # Feathering 0.6px cho kênh alpha
    r_ch, g_ch, b_ch, a_ch = rgba.split()
    a_smooth = a_ch.filter(ImageFilter.GaussianBlur(radius=0.6))
    a_orig_px = a_ch.load()
    a_sm_px = a_smooth.load()
    for y in range(h):
        for x in range(w):
            if a_orig_px[x, y] == 0:
                a_sm_px[x, y] = 0

    return Image.merge("RGBA", (r_ch, g_ch, b_ch, a_smooth))


def remove_small_specks(rgba: Image.Image, min_ratio: float = 0.012) -> Image.Image:
    """
    Xóa các chấm rác pixel rời rạc quá nhỏ ở sát mép cắt (Connected Component trên bản đồ thu nhỏ).
    """
    w, h = rgba.size
    if w < 10 or h < 10:
        return rgba

    # Downscale nhẹ xuống lưới ~200px để tìm Connected Components siêu nhanh
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


def find_connected_object_boxes(rgba: Image.Image, expected_count: int, rows: int, cols: int):
    """
    Tìm chính xác các cụm vật thể tách rời lớn nhất (Connected Component Bounding Box)
    sau khi tách nền toàn tấm. Nếu đúng bằng expected_count thì sắp xếp theo lưới (row, col).
    Nếu không (vd 2 vật thể chạm nhau), fallback chia đều theo lưới rows x cols.
    """
    w, h = rgba.size
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
                # Chỉ nhận các cụm có diện tích đủ lớn (> 1% tổng ảnh)
                if cnt > (sw * sh * 0.008):
                    pad = 6
                    boxes.append((
                        max(0, min_x * scale - pad),
                        max(0, min_y * scale - pad),
                        min(w, (max_x + 1) * scale + pad),
                        min(h, (max_y + 1) * scale + pad),
                        cnt
                    ))

    if len(boxes) >= expected_count:
        # Giữ đúng expected_count cụm lớn nhất
        boxes.sort(key=lambda b: b[4], reverse=True)
        top_boxes = boxes[:expected_count]

        # Sắp xếp theo từng hàng (chia theo tâm Y) rồi trong mỗi hàng sắp theo tâm X
        top_boxes.sort(key=lambda b: (b[1] + b[3]) / 2.0)
        ordered = []
        for r in range(rows):
            row_slice = top_boxes[r * cols : (r + 1) * cols]
            row_slice.sort(key=lambda b: (b[0] + b[2]) / 2.0)
            ordered.extend([(b[0], b[1], b[2], b[3]) for b in row_slice])
        return ordered, "connected-components"

    # Fallback: chia lưới đều rows x cols
    cell_w = w / cols
    cell_h = h / rows
    grid_boxes = []
    for r in range(rows):
        for c in range(cols):
            grid_boxes.append((
                int(c * cell_w),
                int(r * cell_h),
                int((c + 1) * cell_w),
                int((r + 1) * cell_h)
            ))
    return grid_boxes, "uniform-grid"


def save_clean_webp(cell_rgba: Image.Image, dst_path: Path):
    cleaned = remove_small_specks(cell_rgba)

    # Đảm bảo 4 góc alpha == 0
    w, h = cleaned.size
    px = cleaned.load()
    for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if px[cx, cy][3] != 0:
            px[cx, cy] = (0, 0, 0, 0)

    # Auto-Trim sát viền vật thể
    bbox = cleaned.getbbox()
    if bbox:
        cleaned = cleaned.crop(bbox)

    # Resize giữ tỉ lệ (cạnh dài nhất 512px)
    cw, ch = cleaned.size
    if max(cw, ch) > MAX_DIM:
        scale = MAX_DIM / float(max(cw, ch))
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


def process_sheet(sheet_path: Path, rows: int, cols: int, targets: list):
    if not sheet_path.exists():
        print(f"[SKIP] Missing sheet: {sheet_path}")
        return
    print(f"\nProcessing sheet: {sheet_path.name} ({rows}x{cols})")
    raw_img = Image.open(sheet_path)
    full_rgba = remove_bg_smart_bfs(raw_img)
    boxes, mode = find_connected_object_boxes(full_rgba, len(targets), rows, cols)
    print(f"  Slicing method: {mode} ({len(boxes)} cells)")

    for idx, (cat, asset_id) in enumerate(targets):
        if idx >= len(boxes):
            break
        crop = full_rgba.crop(boxes[idx])
        dst = OUT_DIR / cat / f"{asset_id}.webp"
        save_clean_webp(crop, dst)


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
    return RAW_DIR / f"{stem}.png"


def main():
    pet_sheet = find_sheet_file("sheet_pet_2x2")
    room_sheet = find_sheet_file("sheet_room_3x2")

    process_sheet(
        pet_sheet,
        rows=2,
        cols=2,
        targets=[
            ("pets", "cat_happy"),
            ("pets", "cat_sleepy"),
            ("pets", "cat_sulky"),
            ("pets", "cat_hungry"),
        ],
    )

    process_sheet(
        room_sheet,
        rows=2,
        cols=3,
        targets=[
            ("windows", "win_wood"),
            ("beds", "bed_cushion"),
            ("rugs", "rug_oval"),
            ("plants", "plant_monstera"),
            ("decor", "decor_bookshelf"),
            ("decor", "decor_lamp"),
        ],
    )

    rebuild_manifest()


if __name__ == "__main__":
    main()
