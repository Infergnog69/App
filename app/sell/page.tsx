// The "Đăng bán" (sell) page, at /sell. Only logged-in users can see it.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUserId } from "@/lib/data";
import { LOCATIONS } from "@/lib/listings";
import SellForm from "@/components/SellForm";

export default async function SellPage() {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) {
    redirect("/login?message=" + encodeURIComponent("Đăng nhập để đăng bán."));
  }

  // Start the "Khu vực" menu on the seller's own city, if their profile has one.
  const profile = await getProfile(supabase, userId);
  const defaultLocation = LOCATIONS.find((l) => l === profile?.location) ?? LOCATIONS[0];

  return (
    <section className="screen active" id="screen-sell">
      <SellForm userId={userId} defaultLocation={defaultLocation} />
    </section>
  );
}
