# 🔔 Mochi Push Worker (Cloudflare Worker 0 Đồng cho iOS PWA Web Push)

Worker siêu nhẹ chạy 100% trên **Cloudflare Workers Free Tier** (miễn phí 100.000 request/ngày), sử dụng `@block65/webcrypto-web-push` thuần Web Crypto API để gửi thông báo ra màn hình khóa **iOS 16.4+ (Add to Home Screen)**, Android và PC.

---

## 🚀 Hướng dẫn triển khai chỉ với 4 bước

### Bước 1: Cài thư viện & Sinh cặp khóa VAPID miễn phí
Mở terminal tại thư mục `push-worker/`:

```bash
npm install
npx web-push generate-vapid-keys
```
*(Lưu lại `Public Key` để dán vào Cài đặt trong game, và `Private Key` chỉ dùng ở Bước 3 — **TUYỆT ĐỐI KHÔNG** commit lên GitHub).*

### Bước 2: Đăng nhập Cloudflare (tài khoản miễn phí)
```bash
npx wrangler login
```

### Bước 3: Nạp các khóa bí mật vào Cloudflare Worker Secrets
Chạy lần lượt 4 lệnh sau (dán giá trị tương ứng khi terminal hỏi):

```bash
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_SUBJECT
npx wrangler secret put PUSH_SHARED_SECRET
```
- `VAPID_SUBJECT`: nhập dạng `mailto:email-cua-ban@gmail.com` (bắt buộc có `mailto:` để Apple Push Service chấp nhận).
- `PUSH_SHARED_SECRET`: tự đặt một chuỗi mật khẩu ngắn bất kỳ (vd: `mochi-secret-2026`) để chống người lạ gọi trộm Worker.

*(Tùy chọn Cron tự báo khi thú đói: bỏ dấu `#` ở `[triggers]` trong `wrangler.toml` và chạy thêm `npx wrangler secret put FIREBASE_DB_URL` + `npx wrangler secret put DEFAULT_ROOM_ID`).*

### Bước 4: Deploy Worker lên Cloudflare
```bash
npx wrangler deploy
```
Sau khi deploy xong, Cloudflare sẽ trả về đường dẫn Worker dạng:
`https://mochi-push-worker.<ten-ban>.workers.dev`

Mở game **Nhà Chung Mochi** -> **Cài đặt (⚙️)** -> **Thông Báo Màn Hình Khóa** -> dán `Worker URL`, `VAPID Public Key`, `Push Secret` -> bấm **Kiểm tra Worker** -> bấm **Bật thông báo màn hình khóa** là hoàn tất!
