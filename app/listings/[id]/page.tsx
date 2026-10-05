// One listing's page, at /listings/<id>. Full-screen, like the prototype:
// photos on top, details below, and "Nhắn tin" / "Mua ngay" at the bottom.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLikedIds, getProfile, getUserId, photoUrl } from "@/lib/data";
import { categoryLabel, formatPrice } from "@/lib/listings";
import { initials } from "@/lib/format";
import { startConversation } from "@/app/actions/messages";
import Icon from "@/components/Icon";
import BackButton from "@/components/BackButton";
import ShareButton from "@/components/ShareButton";
import FavoriteButton from "@/components/FavoriteButton";
import BuyButton from "@/components/BuyButton";

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  // Only the fields we show. The seller's email is never read.
  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, title, brand, size, condition, category, price, description, photo_paths, location, like_count")
    .eq("id", id)
    .maybeSingle();

  // Unknown or badly typed id: show the standard "not found" page.
  if (!listing) notFound();

  const userId = await getUserId(supabase);
  const [seller, likedIds] = await Promise.all([getProfile(supabase, listing.seller_id), getLikedIds(supabase, userId)]);
  const isMine = userId === listing.seller_id;
  const photos = (listing.photo_paths as string[]).map((path) => photoUrl(supabase, path));
  const sellerName = seller?.display_name ?? "Người bán newd";

  return (
    <div className="full-screen-modal">
      <div className="modal-sheet listing-detail-sheet">
        <header className="detail-header">
          <BackButton />
          <div className="detail-header-actions">
            <ShareButton title={`${listing.title} trên newd`} text={`${listing.title} — ${formatPrice(listing.price)} trên newd.`} />
          </div>
        </header>

        <div className="detail-scroll">
          <div className="detail-image-wrap">
            {/* Photos scroll sideways when there's more than one. */}
            <div className="detail-gallery">
              {photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt={`${listing.title}, ảnh ${i + 1}/${photos.length}`} />
              ))}
            </div>
            <FavoriteButton listingId={listing.id} title={listing.title} liked={likedIds.has(listing.id)} count={listing.like_count} variant="detail" />
          </div>

          <div className="detail-content">
            <div className="detail-title-row">
              <div>
                <p className="detail-brand">{listing.brand || "Không rõ thương hiệu"}</p>
                <h1>{listing.title}</h1>
              </div>
              <strong className="detail-price">{formatPrice(listing.price)}</strong>
            </div>

            <div className="detail-meta-grid">
              <div><span>Kích thước</span><strong>{listing.size}</strong></div>
              <div><span>Tình trạng</span><strong>{listing.condition}</strong></div>
              <div><span>Danh mục</span><strong>{categoryLabel(listing.category)}</strong></div>
              <div><span>Khu vực</span><strong>{listing.location ?? "—"}</strong></div>
            </div>

            <section className="detail-section">
              <h2>Mô tả</h2>
              <p style={{ whiteSpace: "pre-line" }}>{listing.description || "Người bán chưa thêm mô tả."}</p>
            </section>

            <Link href={`/profile/${listing.seller_id}`} className="seller-card" style={{ color: "inherit", textDecoration: "none" }}>
              <span className="avatar">{initials(sellerName)}</span>
              <span className="seller-card-copy">
                <strong>{sellerName}</strong>
                <span>{seller?.location ?? "Tủ đồ cá nhân"}</span>
              </span>
              <span className="seller-rating">
                <Icon name="star" />
                <strong>Mới</strong>
              </span>
              <Icon name="chevron" className="seller-chevron" />
            </Link>

            <section className="buyer-protection-card">
              <div className="protection-icon">
                <Icon name="check" />
              </div>
              <div>
                <strong>Giao dịch thử nghiệm</strong>
                <p>Thanh toán và giao hàng chưa được kết nối trong phiên bản này.</p>
              </div>
            </section>
          </div>
        </div>

        <footer className="detail-actions">
          {isMine ? (
            <>
              <button className="secondary-button" type="button" disabled>Món đồ của bạn</button>
              <Link href="/profile" className="primary-button" style={{ textDecoration: "none" }}>Tủ đồ của tôi</Link>
            </>
          ) : (
            <>
              <form action={startConversation.bind(null, listing.id)} style={{ display: "grid" }}>
                <button className="secondary-button" type="submit">Nhắn tin</button>
              </form>
              <BuyButton listingId={listing.id} title={listing.title} price={listing.price} />
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
