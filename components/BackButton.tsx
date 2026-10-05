"use client";
// Goes back to the previous page, or home if there isn't one (e.g. a shared link).
import { useRouter } from "next/navigation";
import Icon from "./Icon";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="round-icon-button"
      aria-label="Quay lại"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
    >
      <Icon name="back" />
    </button>
  );
}
