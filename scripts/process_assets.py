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
    "kitchen",
    "bathroom",
    "supermarket",
]

MAX_DIM_DEFAULT = 512
MAX_DIM_BY_CATEGORY = {
    "supermarket": 420,
    "accessories": 256,
    "skewers": 256,
}
TRIM_ALPHA_THRESHOLD = 8
SAFE_PADDING_PX = 4


def is_blender_transparent_rgba(img: Image.Image) -> bool:
    """
    Nhận diện ảnh render RGBA nền trong suốt xuất trực tiếp từ Blender:
    Nếu ảnh có kênh alpha và cả 4 góc đều có alpha == 0 -> bỏ qua bước tách nền AI/BFS
    để giữ nguyên 100% khử răng cưa mượt mà và bóng đổ Shadow Catcher.
    """
    if img.mode not in ("RGBA", "LA") and "transparency" not in img.info:
        return False
    rgba = img.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    corners = ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))
    return all(px[cx, cy][3] == 0 for cx, cy in corners)


def remove_bg_smart_bfs(img: Image.Image) -> Image.Image:
    """
    Tách nền thông minh từ 4 góc cho ảnh nền đặc (AI / Google Flow).
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
        if luma < 115:
            return False
        return (dist < 72 and sat < 28) or (dist < 42)

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
                    if dist < 110 and sat < 34:
                        pixels[x, y] = (r, g, b, int(a * 0.28))

    r_ch, g_ch, b_ch, a_ch = rgba.split()
    a_smooth = a_ch.filter(ImageFilter.GaussianBlur(radius=0.6))
    a_orig_px = a_ch.load()
    a_sm_px = a_smooth.load()
    for y in range(h):
        for x in range(w):
            if a_orig_px[x, y] == 0:
                a_sm_px[x, y] = 0

    return Image.merge("RGBA", (r_ch, g_ch, b_ch, a_smooth))


def remove_bg(img: Image.Image) -> Image.Image:
    try:
        from rembg import remove as rembg_remove
        out = rembg_remove(img.convert("RGBA"))
        w, h = out.size
        p = out.load()
        if all(p[cx, cy][3] == 0 for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))):
            return out
    except Exception:
        pass
    return remove_bg_smart_bfs(img)


def auto_trim_with_padding(rgba: Image.Image, alpha_threshold: int = TRIM_ALPHA_THRESHOLD, pad: int = SAFE_PADDING_PX) -> Image.Image:
    """
    Auto-Trim theo ngưỡng alpha > 8 (giữ bóng Shadow Catcher mềm nhưng bỏ nhiễu vô hình),
    chừa thêm 4px đệm trong suốt xung quanh để không cắt mất nét chống răng cưa.
    """
    alpha = rgba.getchannel("A")
    mask = alpha.point(lambda a: 255 if a > alpha_threshold else 0)
    bbox = mask.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    cw, ch = rgba.size
    padded = Image.new("RGBA", (cw + pad * 2, ch + pad * 2), (0, 0, 0, 0))
    padded.paste(rgba, (pad, pad))
    return padded


def process_single_image(src_path: Path, dst_path: Path, category: str):
    img = Image.open(src_path)
    blender_mode = is_blender_transparent_rgba(img)

    if blender_mode:
        # Giữ nguyên kênh alpha gốc + bóng Shadow Catcher từ Blender
        rgba = img.convert("RGBA")
    else:
        rgba = remove_bg(img)

    rgba = auto_trim_with_padding(rgba, TRIM_ALPHA_THRESHOLD, SAFE_PADDING_PX)

    max_dim = MAX_DIM_BY_CATEGORY.get(category, MAX_DIM_DEFAULT)
    cw, ch = rgba.size
    if max(cw, ch) > max_dim:
        scale = max_dim / float(max(cw, ch))
        new_size = (max(1, int(round(cw * scale))), max(1, int(round(ch * scale))))
        rgba = rgba.resize(new_size, Image.Resampling.LANCZOS)

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(dst_path, format="WEBP", quality=86, method=6)

    size_kb = dst_path.stat().st_size / 1024.0
    tag = "BLENDER RGBA" if blender_mode else "AUTO BG-REMOVE"
    print(
        f"[{tag}] {src_path.relative_to(ROOT_DIR)} -> {dst_path.relative_to(ROOT_DIR)} "
        f"({size_kb:.1f} KB, {rgba.size[0]}x{rgba.size[1]})"
    )


def rebuild_manifest():
    available = {}
    for cat in CATEGORIES:
        cat_out = OUT_DIR / cat
        if cat_out.exists():
            items = sorted(p.stem for p in cat_out.glob("*.webp"))
        else:
            items = []
        available[cat] = items

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(available, f, indent=2, ensure_ascii=False)
    print(f"\nUpdated manifest: {MANIFEST_PATH.relative_to(ROOT_DIR)}")
    return available


def main():
    for cat in CATEGORIES:
        cat_raw = RAW_DIR / cat
        if not cat_raw.exists():
            continue
        for file in sorted(cat_raw.iterdir()):
            if file.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
                continue
            asset_id = file.stem
            dst_path = OUT_DIR / cat / f"{asset_id}.webp"
            process_single_image(file, dst_path, cat)

    available = rebuild_manifest()
    print(json.dumps(available, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
