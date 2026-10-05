// A profile page: avatar, name, stats and a grid of items. Used for your own
// profile (/profile, with a "Đã thích" tab) and other people's (/profile/<id>).
import Link from "next/link";
import type { CardListing, Profile } from "@/lib/data";
import { initials } from "@/lib/format";
import Icon from "./Icon";
import ListingGrid from "./ListingGrid";
import EmptyState from "./EmptyState";
import ShareButton from "./ShareButton";

type Props = {
  profile: Profile;
  isMe: boolean;
  tab: "selling" | "saved";
  selling: CardListing[];
  saved: CardListing[] | null; // null on other people's profiles
  likedIds: Set<string>;
};

export default function ProfileView({ profile, isMe, tab, selling, saved, likedIds }: Props) {
  const shown = tab === "saved" && saved ? saved : selling;
  const totalLikes = selling.reduce((sum, l) => sum + l.like_count, 0);
  const base = isMe ? "/profile" : `/profile/${profile.id}`;

  return (
    <section className="screen active">
      <div className="profile-card">
        <div className="avatar profile-avatar">{initials(profile.display_name)}</div>
        <div className="profile-copy">
          <h1>{profile.display_name}</h1>
          {profile.username && <p>@{profile.username}</p>}
          {profile.location && (
            <div className="profile-location">
              <Icon name="location" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {profile.bio && <p className="profile-bio">{profile.bio}</p>}

      <div className="profile-stats" style={{ marginTop: profile.bio ? 0 : 16 }}>
        <div><strong>{selling.length}</strong><span>Đang bán</span></div>
        <div><strong>{totalLikes}</strong><span>Lượt thích</span></div>
        <div><strong>Mới</strong><span>Đánh giá</span></div>
      </div>

      <div className="profile-actions">
        {isMe ? (
          <Link href="/profile/edit" className="secondary-button">Chỉnh sửa hồ sơ</Link>
        ) : (
          <Link href="/" className="secondary-button">Khám phá thêm</Link>
        )}
        <ShareButton
          title="Tủ đồ newd"
          text={`Xem tủ đồ ${profile.username ? "@" + profile.username : profile.display_name} trên newd.`}
          className="icon-secondary-button"
        />
      </div>

      <div className="profile-tabs" role="tablist">
        <Link href={base} className={tab === "selling" ? "active" : ""}>
          Đang bán <span>{selling.length}</span>
        </Link>
        {saved && (
          <Link href={`${base}?tab=saved`} className={tab === "saved" ? "active" : ""}>
            Đã thích <span>{saved.length}</span>
          </Link>
        )}
      </div>

      {shown.length > 0 ? (
        <ListingGrid listings={shown} likedIds={likedIds} />
      ) : tab === "saved" ? (
        <EmptyState icon="heart" title="Chưa có món đồ nào" text="Nhấn biểu tượng trái tim để lưu món đồ bạn thích." href="/" action="Khám phá món đồ" />
      ) : isMe ? (
        <EmptyState icon="heart" title="Chưa có món đồ nào" text="Các món bạn đăng sẽ xuất hiện ở đây." href="/sell" action="Đăng món đầu tiên" />
      ) : (
        <EmptyState icon="heart" title="Chưa có món đồ nào" text="Người bán này chưa đăng món nào." />
      )}
    </section>
  );
}
