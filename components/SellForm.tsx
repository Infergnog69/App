"use client";
// The sell form, laid out in the prototype's three numbered sections.
// "use client" means it runs in the browser, so it can react as the seller
// picks photos and types.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "@/app/sell/actions";
import { PHOTO_BUCKET } from "@/lib/photos";
import {
  CATEGORIES,
  CONDITIONS,
  LOCATIONS,
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  SIZES,
  validateListing,
  type ListingInput,
} from "@/lib/listings";
import Icon from "./Icon";

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

type Photo = { file: File; preview: string };

export default function SellForm({ userId, defaultLocation }: { userId: string; defaultLocation: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const router = useRouter();

  function pickPhotos(fileList: FileList | null) {
    const picked = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));
    const tooBig = picked.filter((file) => file.size > MAX_PHOTO_BYTES * 4); // generous: we shrink them anyway
    setErrors(tooBig.length ? ["Có ảnh quá lớn, vui lòng chọn ảnh khác."] : []);
    const added = picked.filter((file) => !tooBig.includes(file)).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos([...photos, ...added].slice(0, MAX_PHOTOS));
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photos[index].preview);
    setPhotos(photos.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (name: string) => String(form.get(name) ?? "");

    const input: ListingInput = {
      title: read("title"),
      brand: read("brand"),
      size: read("size"),
      condition: read("condition"),
      category: read("category"),
      price: read("price"),
      description: read("description"),
      location: read("location"),
      // Placeholder paths just to check the other fields before uploading anything.
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
          .from(PHOTO_BUCKET)
          .upload(path, await shrinkPhoto(photo.file), { contentType: "image/jpeg" });
        if (error) throw error;
        uploaded.push(path);
      }

      // 2. Save the listing on the server, then open its page.
      const result = await createListing({ ...input, photoPaths: uploaded });
      if (!result.id) throw new Error(result.errors.join(" "));
      router.push(`/listings/${result.id}`);
    } catch (error) {
      // Tidy up photos we uploaded, so they don't sit around unused.
      if (uploaded.length) await supabase.storage.from(PHOTO_BUCKET).remove(uploaded);
      setErrors([error instanceof Error ? error.message : "Đã có lỗi, vui lòng thử lại."]);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sell-form" noValidate>
      <section className="form-section photo-section">
        <div className="form-section-title">
          <span className="form-step">1</span>
          <div>
            <h2>Thêm ảnh</h2>
            <p>Tối đa {MAX_PHOTOS} ảnh. Ảnh đầu tiên sẽ là ảnh bìa.</p>
          </div>
        </div>
        {photos.length < MAX_PHOTOS && (
          <label className="photo-upload-main">
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => pickPhotos(event.target.files)} />
            <span className="photo-upload-icon">
              <Icon name="plus" />
            </span>
            <strong>Thêm ảnh</strong>
            <small>JPG, PNG hoặc WEBP</small>
          </label>
        )}
        {photos.length > 0 && (
          <div className="photo-preview-grid">
            {photos.map((photo, i) => (
              <div key={photo.preview} className="photo-preview-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt={`Ảnh món đồ ${i + 1}`} />
                <button type="button" aria-label={`Xoá ảnh ${i + 1}`} onClick={() => removePhoto(i)}>
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="form-section">
        <div className="form-section-title">
          <span className="form-step">2</span>
          <div>
            <h2>Thông tin món đồ</h2>
            <p>Thông tin càng rõ, người mua càng dễ quyết định.</p>
          </div>
        </div>

        <label className="form-field">
          <span>Tiêu đề *</span>
          <input name="title" maxLength={80} placeholder="Ví dụ: Áo cardigan len hồng" onChange={(e) => setTitleLength(e.target.value.length)} />
          <small>{titleLength}/80</small>
        </label>

        <div className="form-field-grid">
          <label className="form-field">
            <span>Danh mục *</span>
            <select name="category" defaultValue="">
              <option value="">Chọn danh mục</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Kích thước *</span>
            <select name="size" defaultValue="">
              <option value="">Chọn kích thước</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>Thương hiệu</span>
          <input name="brand" maxLength={50} placeholder="Ví dụ: Uniqlo" />
        </label>

        <div className="form-field-grid">
          <label className="form-field">
            <span>Tình trạng *</span>
            <select name="condition" defaultValue="">
              <option value="">Chọn tình trạng</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Khu vực *</span>
            <select name="location" defaultValue={defaultLocation}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>Mô tả</span>
          <textarea
            name="description"
            maxLength={1000}
            rows={4}
            placeholder="Mô tả chất liệu, số đo, lỗi nếu có..."
            onChange={(e) => setDescriptionLength(e.target.value.length)}
          />
          <small>{descriptionLength}/1000</small>
        </label>
      </section>

      <section className="form-section">
        <div className="form-section-title">
          <span className="form-step">3</span>
          <div>
            <h2>Giá bán</h2>
            <p>Nhập giá bạn muốn nhận cho món đồ.</p>
          </div>
        </div>
        <label className="price-field">
          <span>Giá bán *</span>
          <div>
            <input name="price" inputMode="numeric" placeholder="220.000" />
            <strong>đ</strong>
          </div>
        </label>
      </section>

      {errors.length > 0 && (
        <div className="form-error" role="alert">
          {errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>
      )}

      <button className="primary-button sell-submit" type="submit" disabled={saving}>
        {saving ? "Đang đăng..." : "Đăng bán"}
      </button>
    </form>
  );
}
