"use client";
// "Mua ngay" and the order preview dialog. Test mode only: nothing is charged.
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { placeDemoOrder } from "@/app/actions/orders";
import { DEMO_SHIPPING, formatPrice } from "@/lib/listings";
import Icon from "./Icon";
import { showToast } from "./Toast";

export default function BuyButton({ listingId, title, price }: { listingId: string; title: string; price: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function confirm() {
    startTransition(async () => {
      const result = await placeDemoOrder(listingId);
      if ("needsLogin" in result) {
        router.push("/login?message=" + encodeURIComponent("Đăng nhập để mua."));
        return;
      }
      setOpen(false);
      showToast("error" in result ? result.error : "Đã tạo đơn thử nghiệm. Không có tiền thật được xử lý.");
    });
  }

  return (
    <>
      <button className="primary-button" type="button" onClick={() => setOpen(true)}>
        Mua ngay
      </button>
      {/* The footer's blur effect would trap a "fixed" dialog inside the footer,
          so the dialog is drawn straight into <body> with a portal. */}
      {open && createPortal(
        <div className="dialog-modal">
          <button className="modal-scrim" type="button" aria-label="Đóng" onClick={() => setOpen(false)} />
          <section className="dialog-card" aria-label="Xác nhận mua">
            <button className="dialog-close" type="button" aria-label="Đóng" onClick={() => setOpen(false)}>
              <Icon name="close" />
            </button>
            <div className="dialog-icon">
              <Icon name="bag" />
            </div>
            <h2>Xem trước đơn hàng</h2>
            <p>Đây là mô phỏng. Ứng dụng chưa xử lý thanh toán thật.</p>
            <div className="checkout-summary">
              <div className="checkout-line">
                <span>{title}</span>
                <strong>{formatPrice(price)}</strong>
              </div>
              <div className="checkout-line">
                <span>Phí giao hàng dự kiến</span>
                <strong>{formatPrice(DEMO_SHIPPING)}</strong>
              </div>
              <div className="checkout-line total">
                <span>Tổng cộng</span>
                <strong>{formatPrice(price + DEMO_SHIPPING)}</strong>
              </div>
            </div>
            <button className="primary-button" type="button" onClick={confirm} disabled={pending}>
              {pending ? "Đang tạo đơn..." : "Xác nhận đơn thử nghiệm"}
            </button>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
