// Someone else's public profile (/profile/<id>): their items for sale.
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLikedIds, getProfile, getSellerListings, getUserId } from "@/lib/data";
import ProfileView from "@/components/ProfileView";

export default async function PublicProfilePage({ params }: PageProps<"/profile/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (id === userId) redirect("/profile");

  const profile = await getProfile(supabase, id);
  if (!profile) notFound();
  const [selling, likedIds] = await Promise.all([getSellerListings(supabase, id), getLikedIds(supabase, userId)]);

  return <ProfileView profile={profile} isMe={false} tab="selling" selling={selling} saved={null} likedIds={likedIds} />;
}
