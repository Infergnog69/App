"use client";
// The heart. "card" = small pill with the like count on listing cards;
// "detail" = the big round heart on the listing page.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/actions/favorites";
import Icon from "./Icon";
import { showToast } from "./Toast";

type Props = {
  listingId: string;
  title: string;
  liked: boolean;
  count: number;
  variant?: "card" | "detail";
};

export default function FavoriteButton({ listingId, title, liked: initialLiked, count: initialCount, variant = "card" }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick(event: React.MouseEvent) {
    event.preventDefault(); // don't also open the listing underneath
    // Update the screen straight away ("optimistic"), then save.
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));
    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if ("needsLogin" in result) {
        setLiked(liked);
        setCount(count);
        router.push("/login?message=" + encodeURIComponent("Đăng nhập để lưu món đồ yêu thích."));
      } else if ("error" in result) {
        setLiked(liked);
        setCount(count);
        showToast(result.error);
      } else {
        setLiked(result.liked);
        setCount(result.count);
      }
    });
  }

  const label = `${liked ? "Bỏ yêu thích" : "Yêu thích"} ${title}`;
  if (variant === "detail") {
    return (
      <button type="button" className={`detail-favorite${liked ? " active" : ""}`} onClick={onClick} disabled={pending} aria-label={label}>
        <Icon name="heart" />
      </button>
    );
  }
  return (
    <button type="button" className={`image-favorite-button${liked ? " active" : ""}`} onClick={onClick} disabled={pending} aria-label={label}>
      <Icon name="heart" />
      <span>{count}</span>
    </button>
  );
}
