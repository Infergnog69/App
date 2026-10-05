"use client";
// The little dark message that pops up at the bottom ("Đã sao chép..."),
// like the prototype's toast. Call showToast("...") from any browser component.
import { useEffect, useState } from "react";

const EVENT = "newd-toast";

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export default function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onToast(event: Event) {
      setMessage((event as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2600);
    }
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!message) return null;
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}
