// Your own profile (/profile). "?tab=saved" shows the items you liked.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLikedIds, getProfile, getSavedListings, getSellerListings, getUserId } from "@/lib/data";
import { logOut } from "@/app/auth/actions";
import Icon from "@/components/Icon";
import ProfileView from "@/components/ProfileView";

export default async function MyProfilePage({ searchParams }: PageProps<"/profile">) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect("/login?message=" + encodeURIComponent("Đăng nhập để xem trang cá nhân."));

  const [profile, selling, saved, likedIds] = await Promise.all([
    getProfile(supabase, userId),
    getSellerListings(supabase, userId),
    getSavedListings(supabase, userId),
    getLikedIds(supabase, userId),
  ]);

  return (
    <>
      <ProfileView
        profile={profile ?? { id: userId, display_name: "Thành viên newd", username: null, location: null, bio: null }}
        isMe
        tab={tab === "saved" ? "saved" : "selling"}
        selling={selling}
        saved={saved}
        likedIds={likedIds}
      />
      <form action={logOut} style={{ padding: "0 14px 24px" }}>
        <button className="reset-demo-button" type="submit">
          <Icon name="logout" />
          Đăng xuất
        </button>
      </form>
    </>
  );
}
