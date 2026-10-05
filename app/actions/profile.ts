"use server";
// Saves the "Chỉnh sửa hồ sơ" form.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/data";
import { validateProfile } from "@/lib/profile";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect("/login");

  const read = (name: string) => String(formData.get(name) ?? "");
  const result = validateProfile({
    displayName: read("displayName"),
    username: read("username"),
    location: read("location"),
    bio: read("bio"),
  });
  if (!result.ok) redirect("/profile/edit?error=" + encodeURIComponent(result.errors.join(" ")));

  const { error } = await supabase.from("profiles").update(result.profile).eq("id", userId);
  if (error) {
    // 23505 = "already taken" (the username must be unique).
    const message = error.code === "23505" ? "Tên người dùng này đã có người dùng." : "Chưa lưu được hồ sơ.";
    redirect("/profile/edit?error=" + encodeURIComponent(message));
  }
  redirect("/profile");
}
