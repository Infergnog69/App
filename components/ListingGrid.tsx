// The grid of newest listings shown on the home page.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/listings";
import { photoUrl } from "@/lib/photos";
import styles from "./ListingGrid.module.css";

export default async function ListingGrid() {
  const supabase = await createClient();
  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, title, size, price, photo_paths")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    // Most likely the database file hasn't been run in Supabase yet.
    console.error("Loading listings failed:", error.message);
    return <p className={styles.empty}>Chưa tải được tin đăng.</p>;
  }
  if (!listings.length) {
    return <p className={styles.empty}>Chưa có tin đăng nào. Hãy là người đầu tiên!</p>;
  }

  const cards = await Promise.all(
    listings.map(async (listing) => ({ ...listing, cover: await photoUrl(listing.photo_paths[0]) })),
  );

  return (
    <ul className={styles.grid}>
      {cards.map((listing) => (
        <li key={listing.id}>
          <Link href={`/listings/${listing.id}`} className={styles.card}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.cover} alt={listing.title} className={styles.photo} />
            <span className={styles.price}>{formatPrice(listing.price)}</span>
            <span className={styles.meta}>{listing.title} · {listing.size}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
