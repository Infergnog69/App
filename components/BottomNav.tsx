"use client";
// The five-tab bar at the bottom, with the round coral "Đăng bán" button.
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Trang chủ", icon: "home" },
  { href: "/search", label: "Tìm kiếm", icon: "search" },
  { href: "/sell", label: "Đăng bán", icon: "plus" },
  { href: "/messages", label: "Tin nhắn", icon: "chat" },
  { href: "/profile", label: "Cá nhân", icon: "user" },
];

export default function BottomNav({ unread }: { unread: number }) {
  const path = usePathname();
  if (path.startsWith("/listings/")) return null;

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href);
        const className = `nav-button${active ? " active" : ""}${tab.href === "/sell" ? " sell-nav-button" : ""}`;
        return (
          <Link key={tab.href} href={tab.href} className={className} style={{ textDecoration: "none" }}>
            {tab.href === "/sell" ? (
              <span className="sell-nav-circle">
                <Icon name="plus" />
              </span>
            ) : tab.href === "/messages" ? (
              <span className="nav-icon-wrap">
                <Icon name="chat" />
                {unread > 0 && <span className="nav-badge">{unread > 9 ? "9+" : unread}</span>}
              </span>
            ) : (
              <Icon name={tab.icon} />
            )}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
