// One item in a listing grid: photo, heart with like count, title and price.
import Link from "next/link";
import type { CardListing } from "@/lib/data";
import { formatPrice } from "@/lib/listings";
import FavoriteButton from "./FavoriteButton";

export default function ListingCard({ listing, liked }: { listing: CardListing; liked: boolean }) {
  return (
    <article className="listing-card compact-card">
      <div className="listing-image-wrap compact-image-wrap">
        <Link href={`/listings/${listing.id}`} className="listing-image-button" aria-label={`Xem ${listing.title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="listing-image" src={listing.cover} alt={listing.title} loading="lazy" />
        </Link>
        <FavoriteButton listingId={listing.id} title={listing.title} liked={liked} count={listing.like_count} />
      </div>
      <Link href={`/listings/${listing.id}`} className="listing-card-button listing-copy-button" style={{ textDecoration: "none" }}>
        <span className="listing-copy">
          <span className="listing-title">{listing.title}</span>
          <span className="listing-bottom-row">
            <strong className="listing-price">{formatPrice(listing.price)}</strong>
          </span>
        </span>
      </Link>
    </article>
  );
}
