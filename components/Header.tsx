// The bar at the top of every page: shows who's logged in, or log in / sign up links.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logOut } from "@/app/auth/actions";
import styles from "./Header.module.css";

export default async function Header() {
  const supabase = await createClient();
  // getClaims() checks the login cookie is genuine before we trust it.
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        newd
      </Link>
      {email ? (
        <form action={logOut} className={styles.right}>
          <Link href="/sell" className={styles.pill}>
            Đăng bán
          </Link>
          <span className={styles.email}>{email}</span>
          <button type="submit" className={styles.linkButton}>
            Đăng xuất
          </button>
        </form>
      ) : (
        <nav className={styles.right}>
          <Link href="/login">Đăng nhập</Link>
          <Link href="/signup" className={styles.pill}>
            Đăng ký
          </Link>
        </nav>
      )}
    </header>
  );
}
