// The "Đăng bán" (sell) page, at /sell. Only logged-in users can see it.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SellForm from "@/components/SellForm";

export default async function SellPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    redirect("/login?message=" + encodeURIComponent("Đăng nhập để đăng bán."));
  }

  return <SellForm userId={userId} />;
}
