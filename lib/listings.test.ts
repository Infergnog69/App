// Automated tests: each "it" checks one rule. Run them with `npm test`.
import { describe, expect, it } from "vitest";
import { formatPrice, parsePrice, validateListing, type ListingInput } from "./listings";

describe("parsePrice", () => {
  it("reads plain numbers", () => {
    expect(parsePrice("220000")).toBe(220000);
  });

  it("accepts Vietnamese-style dots, commas and spaces", () => {
    expect(parsePrice("220.000")).toBe(220000);
    expect(parsePrice("1,500,000")).toBe(1500000);
    expect(parsePrice(" 350 000 ")).toBe(350000);
  });

  it("rejects zero, negative and non-numbers", () => {
    expect(parsePrice("0")).toBeNull();
    expect(parsePrice("-50000")).toBeNull();
    expect(parsePrice("abc")).toBeNull();
    expect(parsePrice("")).toBeNull();
  });

  it("rejects shorthand like 'k' (sellers must type the full amount)", () => {
    expect(parsePrice("220k")).toBeNull();
  });

  it("enforces the minimum and maximum", () => {
    expect(parsePrice("999")).toBeNull();
    expect(parsePrice("1000")).toBe(1000);
    expect(parsePrice("100.000.000")).toBe(100000000);
    expect(parsePrice("100.000.001")).toBeNull();
  });
});

describe("formatPrice", () => {
  it("uses dots for thousands and adds đ", () => {
    expect(formatPrice(220000)).toBe("220.000 đ");
  });
});

describe("validateListing", () => {
  const good: ListingInput = {
    title: "Cardigan len hồng",
    brand: "Local brand",
    size: "S",
    condition: "Rất tốt",
    category: "women",
    price: "220.000",
    description: "Mặc hai lần.",
    location: "Hà Nội",
    photoPaths: ["user-id/photo.jpg"],
  };

  it("accepts a complete listing and cleans it up", () => {
    const result = validateListing({ ...good, title: "  Cardigan len hồng  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.listing.title).toBe("Cardigan len hồng");
      expect(result.listing.price).toBe(220000);
    }
  });

  it("turns empty optional fields into null", () => {
    const result = validateListing({ ...good, brand: " ", description: "" });
    expect(result.ok && result.listing.brand).toBeNull();
    expect(result.ok && result.listing.description).toBeNull();
  });

  it("rejects a bad price", () => {
    const result = validateListing({ ...good, price: "0" });
    expect(result.ok).toBe(false);
  });

  it("rejects missing photos and too many photos", () => {
    expect(validateListing({ ...good, photoPaths: [] }).ok).toBe(false);
    expect(validateListing({ ...good, photoPaths: Array(6).fill("a.jpg") }).ok).toBe(false);
  });

  it("rejects options that aren't on the list", () => {
    expect(validateListing({ ...good, category: "cars" }).ok).toBe(false);
    expect(validateListing({ ...good, condition: "Hỏng" }).ok).toBe(false);
    expect(validateListing({ ...good, size: "XXXL" }).ok).toBe(false);
    expect(validateListing({ ...good, location: "Paris" }).ok).toBe(false);
  });
});
