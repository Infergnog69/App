import { describe, expect, it } from "vitest";
import { formatClock, formatRelativeTime, initials } from "./format";

describe("initials", () => {
  it("takes the first and last word", () => {
    expect(initials("Minh Anh")).toBe("MA");
    expect(initials("Nguyễn Thị Lan")).toBe("NL");
  });
  it("handles one word and empty names", () => {
    expect(initials("lan")).toBe("L");
    expect(initials("   ")).toBe("N");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-10-05T12:00:00Z");
  it("counts minutes, hours and days", () => {
    expect(formatRelativeTime(new Date("2026-10-05T11:59:40Z"), now)).toBe("vừa xong");
    expect(formatRelativeTime(new Date("2026-10-05T11:20:00Z"), now)).toBe("40 phút");
    expect(formatRelativeTime(new Date("2026-10-05T08:00:00Z"), now)).toBe("4 giờ");
    expect(formatRelativeTime(new Date("2026-10-03T12:00:00Z"), now)).toBe("2 ngày");
  });
  it("shows a date after a week", () => {
    expect(formatRelativeTime("2026-09-01T12:00:00Z", now)).toBe("1/9/2026");
  });
});

describe("formatClock", () => {
  it("uses Vietnam time", () => {
    expect(formatClock("2026-10-05T12:05:00Z")).toBe("19:05");
  });
});
