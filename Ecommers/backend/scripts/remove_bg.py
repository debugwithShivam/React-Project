import os
import io
from PIL import Image
from rembg import remove

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC_DIR = os.path.join(BASE_DIR, 'src', 'product')
OUT_DIR = os.path.join(BASE_DIR, 'src', 'product_no_bg')

ALLOWED_EXT = {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'}

if not os.path.exists(SRC_DIR):
    print(f"Source directory not found: {SRC_DIR}")
    raise SystemExit(1)

os.makedirs(OUT_DIR, exist_ok=True)

processed = 0
skipped = 0
errors = 0

for root, dirs, files in os.walk(SRC_DIR):
    rel_root = os.path.relpath(root, SRC_DIR)
    target_root = os.path.join(OUT_DIR, rel_root) if rel_root != '.' else OUT_DIR
    os.makedirs(target_root, exist_ok=True)

    for f in files:
        name, ext = os.path.splitext(f)
        if ext.lower() not in ALLOWED_EXT:
            skipped += 1
            continue

        src_path = os.path.join(root, f)
        out_name = name + '.png'
        out_path = os.path.join(target_root, out_name)

        try:
            with Image.open(src_path) as img:
                # Skip animated images
                if getattr(img, "is_animated", False):
                    print(f"Skipping animated image: {src_path}")
                    skipped += 1
                    continue

                img = img.convert('RGBA')
                buf = io.BytesIO()
                img.save(buf, format='PNG')
                in_bytes = buf.getvalue()

                out_bytes = remove(in_bytes)

                out_img = Image.open(io.BytesIO(out_bytes)).convert('RGBA')
                out_img.save(out_path, format='PNG')
                processed += 1
                print(f"Processed: {src_path} -> {out_path}")
        except Exception as e:
            print(f"Error processing {src_path}: {e}")
            errors += 1

print(f"Done. processed={processed} skipped={skipped} errors={errors}")
