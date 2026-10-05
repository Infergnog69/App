"use server";
// Server actions: functions that run on the server when a form is submitted.
// The password travels from the form straight to Supabase and is never stored by us.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Turns form fields into clean text (and trims stray spaces from the email).
function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

// Sends the user back to a page with a message shown on screen.
function backWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signUp(formData: FormData) {
  const { email, password } = readCredentials(formData);
  if (!email || password.length < 8) {
    backWithError("/signup", "Vui lòng nhập email và mật khẩu từ 8 ký tự.");
  }

  const supabase = await createClient();
  // The display name is saved with the account; the database copies it into
  // the public profile (see supabase/migrations/0002_...sql).
  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 50);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) backWithError("/signup", error.message);

  // If "Confirm email" is switched on in Supabase, there's no session yet:
  // the user has to click the link in their inbox first.
  if (!data.session) {
    redirect("/login?message=" + encodeURIComponent("Kiểm tra email để xác nhận tài khoản."));
  }
  redirect("/");
}

export async function logIn(formData: FormData) {
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Same message whether the email or the password is wrong, so strangers
  // can't use this form to find out who has an account.
  if (error) backWithError("/login", "Email hoặc mật khẩu không đúng.");
  redirect("/");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
