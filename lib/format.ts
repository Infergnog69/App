// Small display helpers shared across pages.

// "Minh Anh" -> "MA", "Mây Archive" -> "MA", "lan" -> "L". Used in round avatars.
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "N";
  const letters = words.length === 1 ? [words[0][0]] : [words[0][0], words[words.length - 1][0]];
  return letters.join("").toLocaleUpperCase("vi-VN");
}

// "vừa xong", "5 phút", "3 giờ", "2 ngày", or a date for anything older than a week.
export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;
  return then.toLocaleDateString("vi-VN");
}

// "19:05", for chat bubbles. Shown in Vietnam time.
export function formatClock(date: Date | string): string {
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}
