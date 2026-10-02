// One listing's page, at /listings/<id>. The [id] folder name means "any id".
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatPrice } from "@/lib/listings";
import { photoUrl } from "@/lib/photos";
import styles from "./page.module.css";

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  // Only the fields we show. Note: no seller email, to protect privacy.
  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, title, brand, size, condition, category, price, description, photo_paths, created_at")
    .eq("id", id)
    .maybeSingle();

  // Unknown or badly typed id: show the standard "not found" page.
  if (!listing) notFound();

  const { data: auth } = await supabase.auth.getClaims();
  const isMine = auth?.claims?.sub === listing.seller_id;
  const photos = await Promise.all((listing.photo_paths as string[]).map(photoUrl));

  return (
    <main className={styles.page}>
      <div className={styles.photos}>
        {photos.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} src={url} alt={`${listing.title}, ảnh ${i + 1}`} className={styles.photo} />
        ))}
      </div>

      <h1 className={styles.title}>{listing.title}</h1>
      <p className={styles.price}>{formatPrice(listing.price)}</p>

      <dl className={styles.details}>
        {listing.brand && (<><dt>Thương hiệu</dt><dd>{listing.brand}</dd></>)}
        <dt>Kích cỡ</dt><dd>{listing.size}</dd>
        <dt>Tình trạng</dt><dd>{listing.condition}</dd>
        <dt>Danh mục</dt><dd>{categoryLabel(listing.category)}</dd>
        <dt>Đăng lúc</dt><dd>{new Date(listing.created_at).toLocaleDateString("vi-VN")}</dd>
      </dl>

      {listing.description && <p className={styles.description}>{listing.description}</p>}

      {isMine && <p className={styles.mine}>Đây là tin đăng của bạn.</p>}
    </main>
  );
}
