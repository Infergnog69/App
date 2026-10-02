// The layout wraps every page in the app: it's the "frame" that stays the same
// (html, body, fonts, colours) while each page swaps in its own content.
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "newd · Mới với bạn",
  description:
    "Nền tảng thời trang secondhand nơi mỗi món đồ tìm thấy một chủ nhân mới.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // lang="vi" tells browsers and screen readers the page is in Vietnamese.
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
