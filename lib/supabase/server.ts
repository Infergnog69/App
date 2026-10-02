// Creates a Supabase connection for code that runs on the server
// (pages, layouts and server actions). The logged-in user's session is kept
// in browser cookies, so we hand Supabase a way to read and write them.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Pages can't set cookies, only server actions and the proxy can.
          // That's fine: proxy.ts refreshes the session cookie on every request.
        }
      },
    },
  });
}
