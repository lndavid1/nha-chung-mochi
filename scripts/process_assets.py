import os
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
    Thuật toán tách nền thông minh bằng Pillow:
    1. Lấy mẫu màu nền từ 4 góc ảnh (trung bình màu xám nền #D8D8D8).
    2. BFS flood-fill từ toàn bộ viền ngoài vào trong với ngưỡng sai số màu + độ bão hòa thấp
       (vì nền là xám trung tính, còn vật thể có nét viền nâu #4A3525 chặn kín).
    3. Khử viền răng cưa (feathering 1px alpha) và đảm bảo 4 góc có alpha == 0.
    """
    rgba = img.convert("RGBA")
    w, h = rgba.size
    pixels = rgba.load()

    # Lấy mẫu màu nền từ 4 góc
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
        # Khoảng cách màu tới màu nền xám trung bình
        dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
        # Độ chênh giữa các kênh màu (xám có saturation rất thấp)
        sat = max(r, g, b) - min(r, g, b)
        # Nét viền nâu #4A3525 có độ sáng rất thấp -> không bao giờ xóa
        luma = 0.299 * r + 0.587 * g + 0.114 * b
        if luma < 115:
            return False
        return (dist < 72 and sat < 28) or (dist < 42)

    visited = [[False] * w for _ in range(h)]
    queue = deque()

    # Đưa toàn bộ viền 4 cạnh vào hàng đợi BFS
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

    # Khử viền xám mỏng (1px de-fringe) quanh rìa vật thể tiếp giáp nền
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if not bg_mask[y][x]:
                r, g, b, a = pixels[x, y]
                # Nếu pixel nằm ngay sát nền và có màu xám sáng -> làm mềm alpha
                touches_bg = (
                    bg_mask[y - 1][x]
                    or bg_mask[y + 1][x]
                    or bg_mask[y][x - 1]
                    or bg_mask[y][x + 1]
                )
                if touches_bg:
                    sat = max(r, g, b) - min(r, g, b)
                    dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
                    if dist < 110 and sat < 34:
                        pixels[x, y] = (r, g, b, int(a * 0.28))

    # Làm mịn nhẹ kênh alpha (feathering) để loại bỏ răng cưa
    r_ch, g_ch, b_ch, a_ch = rgba.split()
    a_smooth = a_ch.filter(ImageFilter.GaussianBlur(radius=0.6))
    # Giữ vùng nền tuyệt đối alpha = 0
    a_orig_px = a_ch.load()
    a_sm_px = a_smooth.load()
    for y in range(h):
        for x in range(w):
            if a_orig_px[x, y] == 0:
                a_sm_px[x, y] = 0

    return Image.merge("RGBA", (r_ch, g_ch, b_ch, a_smooth))


def remove_bg(img: Image.Image) -> Image.Image:
    # Ưu tiên thử rembg nếu đã cài sẵn & hoạt động tốt, fallback ngay về smart BFS
    try:
        from rembg import remove as rembg_remove
        out = rembg_remove(img.convert("RGBA"))
        # Kiểm tra 4 góc alpha == 0
        w, h = out.size
        p = out.load()
        if all(p[cx, cy][3] == 0 for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))):
            return out
    except Exception:
        pass
    return remove_bg_smart_bfs(img)


def process_single_image(src_path: Path, dst_path: Path):
    img = Image.open(src_path)
    rgba = remove_bg(img)

    # Đảm bảo 4 góc có alpha == 0 trước khi trim
    w, h = rgba.size
    px = rgba.load()
    for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if px[cx, cy][3] != 0:
            px[cx, cy] = (0, 0, 0, 0)

    # Auto-Trim sát viền vật thể bằng getbbox()
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    # Resize giữ tỉ lệ (cạnh dài nhất 512px)
    cw, ch = rgba.size
    if max(cw, ch) > MAX_DIM:
        scale = MAX_DIM / float(max(cw, ch))
        new_size = (max(1, int(cw * scale)), max(1, int(ch * scale)))
        rgba = rgba.resize(new_size, Image.Resampling.LANCZOS)

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    quality = 85
    rgba.save(dst_path, format="WEBP", quality=quality, method=6)

    # Nếu dung lượng > 45KB, nén nhẹ thêm một nấc để luôn < 45KB
    if dst_path.stat().st_size > 45 * 1024:
        rgba.save(dst_path, format="WEBP", quality=76, method=6)
    if dst_path.stat().st_size > 45 * 1024:
        cw, ch = rgba.size
        rgba_small = rgba.resize((int(cw * 0.85), int(ch * 0.85)), Image.Resampling.LANCZOS)
        rgba_small.save(dst_path, format="WEBP", quality=74, method=6)

    size_kb = dst_path.stat().st_size / 1024.0
    print(f"[OK] {src_path.relative_to(ROOT_DIR)} -> {dst_path.relative_to(ROOT_DIR)} ({size_kb:.1f} KB, {rgba.size[0]}x{rgba.size[1]})")


def main():
    available = {cat: [] for cat in CATEGORIES}

    for cat in CATEGORIES:
        cat_raw = RAW_DIR / cat
        if not cat_raw.exists():
            continue
        for file in sorted(cat_raw.iterdir()):
            if file.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
                continue
            asset_id = file.stem
            dst_path = OUT_DIR / cat / f"{asset_id}.webp"
            process_single_image(file, dst_path)
            available[cat].append(asset_id)

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(available, f, indent=2, ensure_ascii=False)
    print(f"\nUpdated manifest: {MANIFEST_PATH.relative_to(ROOT_DIR)}")
    print(json.dumps(available, indent=2))


if __name__ == "__main__":
    main()
