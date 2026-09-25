# START HERE

Mở file `OPEN_NEWD_V0.2.1.html` để xem ngay bản mới.

File cũ `newd_instant_demo.html` đã bị xoá hoàn toàn để không thể mở nhầm bản v0.1.

# newd MVP v0.2.1 — corrected

Phiên bản browser prototype đã cập nhật theo yêu cầu mới:

## Thay đổi chính
- Đổi nút thông báo thành nút **Yêu thích** dẫn thẳng tới tab **Đã thích** trong trang cá nhân.
- Trang chủ gọn hơn:
  - thanh tìm kiếm nằm giữa logo và nút yêu thích
  - rail danh mục dạng bubble text-only: **Tất cả, Nữ, Nam, Phụ kiện, Giày dép**
  - lưới sản phẩm nhỏ hơn để nhìn được nhiều sản phẩm hơn trên màn hình điện thoại.
- Trang tìm kiếm đơn giản hóa:
  - mặc định hiển thị các ô danh mục: **Nữ, Nam, Giày dép, Phụ kiện, Designer, Vintage, Trẻ con**
  - khi gõ chữ sẽ hiện gợi ý dựa trên từ khóa đang có trong hệ thống.
- Trang đăng bán:
  - chỉ giữ tiêu đề **Đăng bán**
  - không hiển thị logo/slogan và nút yêu thích ở header
  - bổ sung tình trạng: **Mới còn tag, Like new, Rất tốt, Tốt, Đã qua sử dụng**.
- Trang tin nhắn:
  - bỏ chữ **Kết nối**
  - tiêu đề **Tin nhắn** nằm cố định ở header khi cuộn.

## Chạy app
### Windows
- Mở `start-windows.bat`

### Mac/Linux
```bash
python3 serve.py
```
Sau đó mở link local hiện trong terminal.
