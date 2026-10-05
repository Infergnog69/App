import { describe, expect, it } from "vitest";
import { validateProfile } from "./profile";

const good = { displayName: "Minh Anh", username: "@MinhCloset", location: "Hà Nội", bio: "Dọn tủ chậm." };

describe("validateProfile", () => {
  it("cleans up a good profile", () => {
    const result = validateProfile(good);
    expect(result).toEqual({
      ok: true,
      profile: { display_name: "Minh Anh", username: "minhcloset", location: "Hà Nội", bio: "Dọn tủ chậm." },
    });
  });

  it("allows leaving optional fields empty", () => {
    const result = validateProfile({ displayName: "Lan", username: "", location: "", bio: "" });
    expect(result.ok && result.profile).toEqual({ display_name: "Lan", username: null, location: null, bio: null });
  });

  it("rejects bad usernames", () => {
    expect(validateProfile({ ...good, username: "ab" }).ok).toBe(false);
    expect(validateProfile({ ...good, username: "minh anh" }).ok).toBe(false);
    expect(validateProfile({ ...good, username: "lê" }).ok).toBe(false);
  });

  it("requires a display name and a known location", () => {
    expect(validateProfile({ ...good, displayName: "  " }).ok).toBe(false);
    expect(validateProfile({ ...good, location: "Paris" }).ok).toBe(false);
  });
});
