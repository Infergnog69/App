"use client";
// Shares a link with the phone's share menu, or copies it on a computer.
import Icon from "./Icon";
import { showToast } from "./Toast";

export default function ShareButton({ title, text, className = "round-icon-button" }: { title: string; text: string; className?: string }) {
  async function share() {
    const data = { title, text, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(`${text} ${data.url}`);
        showToast("Đã sao chép đường dẫn.");
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") showToast("Chưa thể chia sẻ lúc này.");
    }
  }
  return (
    <button type="button" className={className} aria-label="Chia sẻ" onClick={share}>
      <Icon name="share" />
    </button>
  );
}
