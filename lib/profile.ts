// Rules for the "Chỉnh sửa hồ sơ" form. The database checks the same limits.
import { LOCATIONS } from "./listings";

export type ProfileInput = { displayName: string; username: string; location: string; bio: string };

export type ValidProfile = {
  display_name: string;
  username: string | null;
  location: string | null;
  bio: string | null;
};

export function validateProfile(input: ProfileInput): { ok: true; profile: ValidProfile } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const displayName = input.displayName.trim();
  // Usernames are stored lower-case, without a leading "@".
  const username = input.username.trim().replace(/^@/, "").toLowerCase();
  const location = input.location.trim();
  const bio = input.bio.trim();

  if (displayName.length < 1 || displayName.length > 50) errors.push("Tên hiển thị cần từ 1 đến 50 ký tự.");
  if (username && !/^[a-z0-9_.]{3,30}$/.test(username)) {
    errors.push("Tên người dùng gồm 3–30 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.");
  }
  if (location && !(LOCATIONS as readonly string[]).includes(location)) errors.push("Vui lòng chọn khu vực.");
  if (bio.length > 300) errors.push("Giới thiệu tối đa 300 ký tự.");

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    profile: { display_name: displayName, username: username || null, location: location || null, bio: bio || null },
  };
}
