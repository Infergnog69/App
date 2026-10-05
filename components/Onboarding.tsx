"use client";
// The coral welcome screen from the prototype, shown once per browser.
import { useEffect, useState } from "react";

const SEEN_KEY = "newd-onboarding-seen";

export default function Onboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // localStorage remembers small things in this browser only.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage must happen after the page loads
      if (!localStorage.getItem(SEEN_KEY)) setOpen(true);
    } catch {
      // Private browsing can block storage: just skip the welcome screen.
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <span>newd</span>
          <small>MỚI VỚI BẠN.</small>
        </div>
        <div className="onboarding-wave" />
        <div className="onboarding-wave wave-two" />
        <div className="onboarding-copy">
          <p>Thời trang secondhand cho một vòng đời mới.</p>
          <h1>Đồ cũ, cảm hứng mới.</h1>
          <span>Khám phá, đăng bán và kết nối với cộng đồng yêu thời trang.</span>
        </div>
        <button className="onboarding-button" type="button" onClick={close}>
          Bắt đầu ngay
        </button>
      </div>
    </div>
  );
}
