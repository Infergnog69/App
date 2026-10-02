// Creates a Supabase connection for code that runs in the browser
// (used to upload photos straight from the seller's phone or laptop).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // These two values are safe in the browser: the publishable key only allows
  // what our security rules (Row Level Security) allow.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
