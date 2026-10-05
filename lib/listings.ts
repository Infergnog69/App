// The rules for a listing, kept in one place so the sell form, the server and
// the tests all agree. The database (supabase/migrations/0001_listings.sql)
// enforces the same limits as a final safety net.

export const CATEGORIES = [
  { id: "women", label: "Nữ" },
  { id: "men", label: "Nam" },
  { id: "accessories", label: "Phụ kiện" },
  { id: "shoes", label: "Giày dép" },
  { id: "designer", label: "Designer" },
  { id: "vintage", label: "Vintage" },
  { id: "kids", label: "Trẻ con" },
] as const;

export const CONDITIONS = ["Mới còn tag", "Like new", "Rất tốt", "Tốt", "Đã qua sử dụng"] as const;

export const LOCATIONS = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"] as const;

// Shipping shown on the demo checkout (the database uses the same number).
export const DEMO_SHIPPING = 30_000;

export const SIZES = ["XS", "S", "M", "L", "XL", "Freesize", "36", "37", "38", "39", "40", "41"] as const;

export const MIN_PRICE = 1_000; // 1.000 đ
export const MAX_PRICE = 100_000_000; // 100.000.000 đ
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export type ListingInput = {
  title: string;
  brand: string;
  size: string;
  condition: string;
  category: string;
  price: string; // as typed by the seller, e.g. "220.000"
  description: string;
  location: string;
  photoPaths: string[];
};

export type ValidListing = {
  title: string;
  brand: string | null;
  size: string;
  condition: string;
  category: string;
  price: number;
  description: string | null;
  location: string;
  photo_paths: string[];
};

// Turns what the seller typed ("220.000", "220,000", "220 000") into a whole
// number of dong. Returns null if it isn't a valid price.
export function parsePrice(text: string): number | null {
  const digitsOnly = text.trim().replace(/[.,\s]/g, "");
  if (!/^\d+$/.test(digitsOnly)) return null;
  const price = Number(digitsOnly);
  if (price < MIN_PRICE || price > MAX_PRICE) return null;
  return price;
}

// Shows a price the Vietnamese way: 220000 -> "220.000 đ".
export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(price)} đ`;
}

export function categoryLabel(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

// Checks every field. Returns either the cleaned listing, or a list of
// problems written for the seller to read.
export function validateListing(
  input: ListingInput,
): { ok: true; listing: ValidListing } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const title = input.title.trim();
  const brand = input.brand.trim();
  const description = input.description.trim();
  const price = parsePrice(input.price);

  if (title.length < 3 || title.length > 80) errors.push("Tiêu đề cần từ 3 đến 80 ký tự.");
  if (brand.length > 50) errors.push("Thương hiệu tối đa 50 ký tự.");
  if (!(SIZES as readonly string[]).includes(input.size)) errors.push("Vui lòng chọn kích cỡ.");
  if (!(CONDITIONS as readonly string[]).includes(input.condition)) errors.push("Vui lòng chọn tình trạng.");
  if (!CATEGORIES.some((category) => category.id === input.category)) errors.push("Vui lòng chọn danh mục.");
  if (price === null) errors.push("Giá phải là số từ 1.000 đ đến 100.000.000 đ.");
  if (description.length > 1000) errors.push("Mô tả tối đa 1000 ký tự.");
  if (!(LOCATIONS as readonly string[]).includes(input.location)) errors.push("Vui lòng chọn khu vực.");
  if (input.photoPaths.length < 1 || input.photoPaths.length > MAX_PHOTOS) {
    errors.push(`Cần từ 1 đến ${MAX_PHOTOS} ảnh.`);
  }

  if (errors.length > 0 || price === null) return { ok: false, errors };

  return {
    ok: true,
    listing: {
      title,
      brand: brand || null,
      size: input.size,
      condition: input.condition,
      category: input.category,
      price,
      description: description || null,
      location: input.location,
      photo_paths: input.photoPaths,
    },
  };
}
