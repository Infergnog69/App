// The layout wraps every page: the app "frame" (header, bottom tabs, colours)
// stays the same while each page swaps in its own content.
import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Onboarding from "@/components/Onboarding";
import Toaster from "@/components/Toast";
import { createClient } from "@/lib/supabase/server";
import { getUnreadCounts, getUserId } from "@/lib/data";

export const metadata: Metadata = {
  title: "newd · Mới với bạn.",
  description: "Nền tảng thời trang secondhand nơi mỗi món đồ tìm thấy một chủ nhân mới.",
};

export const viewport: Viewport = {
  themeColor: "#F47D6B",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  // The red number on the Tin nhắn tab.
  const unread = userId ? [...(await getUnreadCounts(supabase)).values()].reduce((a, b) => a + b, 0) : 0;

  return (
    // lang="vi" tells browsers and screen readers the page is in Vietnamese.
    <html lang="vi">
      <body>
        <div className="app-shell">
          <AppHeader />
          <main className="screen-container">{children}</main>
          <BottomNav unread={unread} />
        </div>
        <Onboarding />
        <Toaster />
      </body>
    </html>
  );
}
