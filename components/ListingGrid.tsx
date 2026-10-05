// A two-column grid of listing cards.
import type { CardListing } from "@/lib/data";
import ListingCard from "./ListingCard";

export default function ListingGrid({ listings, likedIds }: { listings: CardListing[]; likedIds: Set<string> }) {
  return (
    <div className="listing-grid compact-listing-grid">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} liked={likedIds.has(listing.id)} />
      ))}
    </div>
  );
}
