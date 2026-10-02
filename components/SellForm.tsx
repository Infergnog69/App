"use client";
// The sell form. "use client" means this part runs in the browser, because it
// needs to react as the seller picks photos and types.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "@/app/sell/actions";
import {
  CATEGORIES,
  CONDITIONS,
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  SIZES,
  validateListing,
  type ListingInput,
} from "@/lib/listings";
import styles from "./SellForm.module.css";

const BUCKET = "listing-photos";

// Shrinks a photo to at most 1600px wide/tall and re-saves it as JPEG.
// Bonus for privacy: this drops hidden photo data (EXIF), which can include
// the GPS location where the photo was taken, e.g. the seller's home.
async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("resize failed"))), "image/jpeg", 0.85),
  );
}

export default function SellForm({ userId }: { userId: string }) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function pickPhotos(fileList: FileList | null) {
    const picked = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));
    const tooBig = picked.filter((file) => file.size > MAX_PHOTO_BYTES * 4); // generous: we shrink them anyway
    setErrors(tooBig.length ? ["Có ảnh quá lớn, vui lòng chọn ảnh khác."] : []);
    setPhotos([...photos, ...picked.filter((file) => !tooBig.includes(file))].slice(0, MAX_PHOTOS));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (name: string) => String(form.get(name) ?? "");

    // Fake photo paths just to check the other fields before uploading anything.
    const input: ListingInput = {
      title: read("title"),
      brand: read("brand"),
      size: read("size"),
      condition: read("condition"),
      category: read("category"),
      price: read("price"),
      description: read("description"),
      photoPaths: photos.map((_, i) => `${userId}/check-${i}.jpg`),
    };
    const check = validateListing(input);
    if (!check.ok) {
      setErrors(check.errors);
      return;
    }

    setSaving(true);
    setErrors([]);
    const supabase = createClient();
    const uploaded: string[] = [];

    try {
      // 1. Upload each photo into the seller's own folder.
      for (const photo of photos) {
        const path = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, await shrinkPhoto(photo), { contentType: "image/jpeg" });
        if (error) throw error;
        uploaded.push(path);
      }

      // 2. Save the listing on the server, then open its page.
      const result = await createListing({ ...input, photoPaths: uploaded });
      if (!result.id) throw new Error(result.errors.join(" "));
      router.push(`/listings/${result.id}`);
    } catch (error) {
      // Tidy up photos we uploaded, so they don't sit around unused.
      if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
      setErrors([error instanceof Error ? error.message : "Đã có lỗi, vui lòng thử lại."]);
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Đăng bán</h1>

      {errors.length > 0 && (
        <ul className={styles.errors}>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.photos}>
          {photos.map((photo, i) => (
            <button
              key={`${photo.name}-${i}`}
              type="button"
              className={styles.thumb}
              title="Bấm để bỏ ảnh"
              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
            >
              {/* A local preview of the chosen photo, before upload. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(photo)} alt={`Ảnh ${i + 1}`} />
            </button>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className={styles.addPhoto}>
              + Thêm ảnh
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(event) => pickPhotos(event.target.files)}
              />
            </label>
          )}
        </div>
        <p className={styles.hint}>
          Tối đa {MAX_PHOTOS} ảnh. Bấm vào ảnh để bỏ.
        </p>

        <label className={styles.label}>
          Tiêu đề
          <input name="title" required minLength={3} maxLength={80} className={styles.input} />
        </label>

        <label className={styles.label}>
          Thương hiệu (không bắt buộc)
          <input name="brand" maxLength={50} className={styles.input} />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            Danh mục
            <select name="category" required defaultValue="" className={styles.input}>
              <option value="" disabled>Chọn</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            Kích cỡ
            <select name="size" required defaultValue="" className={styles.input}>
              <option value="" disabled>Chọn</option>
              {SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.label}>
          Tình trạng
          <select name="condition" required defaultValue="" className={styles.input}>
            <option value="" disabled>Chọn</option>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Giá (đ)
          <input name="price" required inputMode="numeric" placeholder="220.000" className={styles.input} />
        </label>

        <label className={styles.label}>
          Mô tả (không bắt buộc)
          <textarea name="description" maxLength={1000} rows={4} className={styles.input} />
        </label>

        <button type="submit" disabled={saving} className={styles.button}>
          {saving ? "Đang đăng..." : "Đăng tin"}
        </button>
      </form>
    </main>
  );
}
