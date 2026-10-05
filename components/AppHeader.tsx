"use client";
// The top bar. Like the prototype, it changes per page:
// home = logo + search box + heart; other pages = a centred title.
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

function titleFor(path: string): string | null {
  if (path === "/") return null; // home shows the logo instead
  if (path.startsWith("/search")) return "Tìm kiếm";
  if (path.startsWith("/sell")) return "Đăng bán";
  if (path.startsWith("/messages")) return "Tin nhắn";
  if (path === "/profile/edit") return "Chỉnh sửa hồ sơ";
  if (path.startsWith("/profile")) return "Cá nhân";
  if (path.startsWith("/login")) return "Đăng nhập";
  if (path.startsWith("/signup")) return "Đăng ký";
  return "newd";
}

export default function AppHeader() {
  const path = usePathname();
  // The listing page has its own floating header over the photo.
  if (path.startsWith("/listings/")) return null;

  const title = titleFor(path);
  const isSell = path.startsWith("/sell");
  const mode = title === null ? "mode-home" : isSell ? "mode-sell" : "mode-title";

  return (
    <header className={`app-header ${mode}`}>
      <Link href="/" className="brand-button" aria-label="Trang chủ newd" style={{ textDecoration: "none" }}>
        <span className="brand-name">newd</span>
        <span className="brand-slogan">MỚI VỚI BẠN.</span>
      </Link>
      <Link href="/search" className="header-search-inline" style={{ textDecoration: "none" }}>
        <Icon name="search" />
        <span>Tìm kiếm món đồ</span>
      </Link>
      <h1 className="header-title" hidden>
        {title}
      </h1>
      {!isSell && (
        <Link href="/profile?tab=saved" className="header-icon-button" aria-label="Mở mục yêu thích">
          <Icon name="heart" />
        </Link>
      )}
    </header>
  );
}
