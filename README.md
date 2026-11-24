# 🐾 Nhà Chung Mochi — Web App Game Nuôi Thú & Xây Phòng Chung (Co-op 2 Người)

**Nhà Chung Mochi** là Progressive Web App (PWA) tối ưu riêng cho **iOS Safari (Add to Home Screen)**, thiết kế cho **đúng 2 người chơi online** (bạn thân hoặc cặp đôi) cùng nuôi thú cưng, trang trí căn phòng 2D 8 lớp nội thất, dán giấy nhớ tủ lạnh, treo ảnh kỷ niệm thật và trò chuyện với bộ não AI thông minh.

Toàn bộ hệ thống vận hành **100% miễn phí (0 đồng)** trên **GitHub Pages + Firebase Realtime Database (Spark Free Tier) + Gemini API Free Tier**.

---

## ✨ Tính năng nổi bật

- **Đồ họa 100% Inline SVG + CSS Animation (Zero External Asset):** 3 loại thú cưng (*Mèo Mochi, Cún Corgi, Thỏ Bông*), 6 trạng thái cảm xúc (`happy`, `hungry`, `sulky`, `sleepy`, `excited`, `love`), 8 slot nội thất và bầu trời ngoài cửa sổ tự đổi theo giờ thực (Sáng nắng / Hoàng hôn / Đêm đầy sao).
- **Co-op 2 Người Thời Gian Thực:**
  - **Live Presence:** Hiển thị chấm xanh khi người kia online. Khi cả hai cùng mở app, thú cưng phấn khích thả tim và mở khóa nút tương tác đôi **"Cùng chơi tung bóng (+20 Xu)"**.
  - **Co-op Combo & Streak:** Đổi phiên người chăm sóc (`lastCareBy !== currentPlayer`) kích hoạt **Co-op Combo x2 Xu** và tăng chuỗi ngày **Streak**.
  - **Giấy nhớ tủ lạnh (Sticky Note):** Viết chữ ngắn hoặc **vẽ tay Doodle** trên HTML5 Canvas.
  - **Hộp quà bất ngờ (Mystery Gift):** Mua đồ nội thất gói làm quà kèm lời nhắn bí mật đặt giữa phòng, chỉ người kia mới bóc được kèm pháo giấy confetti.
  - **Khung tranh ảnh thật:** Tự động nén ảnh trên trình duyệt xuống `400x400px` định dạng `image/webp` chất lượng `0.7` (`< 50KB`) lưu vào Realtime Database mà không cần Firebase Storage.
- **Bộ Não AI Tự Động Đổi Model Tức Thì (`src/services/petBrain.js`):**
  1. `gemini-3.5-flash-lite` (Mặc định)
  2. `gemini-4-hydrogen` (Dự phòng 1)
  3. `gemini-3.8-flash` (Dự phòng 2)
  4. `gemini-3.1-flash-lite` (Dự phòng 3)
  5. `gemini-3.6-flash` (Dự phòng 4)
  6. `gemma-4-31b-it` (Dự phòng Online cuối)
  7. `Local Offline Brain` (35+ câu thoại Tiếng Việt tự nhiên theo cảm xúc, đảm bảo không bao giờ crash).

---

## 🚀 Hướng dẫn cài đặt & Triển khai 0 đồng

### Bước 1: Tạo Firebase Realtime Database (Gói Spark Miễn Phí)
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và bấm **Add project** (Tạo dự án mới, không cần bật Google Analytics).
2. Ở menu bên trái, chọn **Build** -> **Realtime Database** -> **Create Database**.
3. Chọn cụm máy chủ gần Việt Nam (`Singapore - asia-southeast1`) -> chọn **Start in test mode** -> **Enable**.
4. Chuyển sang tab **Rules** của Realtime Database và dán Security Rules mẫu dưới đây rồi bấm **Publish**:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        "photoFrame": {
          "imageData": {
            ".validate": "newData.isString() && newData.val().length < 100000"
          }
        }
      }
    }
  }
}
```

5. Vào **Project Settings** (biểu tượng bánh răng) -> cuộn xuống mục **Your apps** -> chọn biểu tượng Web `</>` để lấy `apiKey`, `databaseURL` và `projectId`.
   - *Mẹo:* Bạn có thể dán trực tiếp các thông tin này vào tab **Cloud DB** ngay trên màn hình khởi đầu của game mà không cần sửa code!

---

### Bước 2: Lấy Gemini API Key Miễn Phí tại Google AI Studio
1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Đăng nhập tài khoản Google và bấm **Create API Key** (hoàn toàn miễn phí, không cần thẻ tín dụng).
3. Mở game **Nhà Chung Mochi** -> bấm nút **Cài đặt (⚙️)** ở góc phải trên cùng -> dán API Key vào ô **Gemini API Key**.
4. Tích chọn *"Đồng bộ mã hóa nhẹ vào phòng để người thứ 2 không cần nhập lại"* rồi bấm **Lưu API Key** và **Kiểm tra kết nối AI**.

---

### Bước 3: Đẩy Code lên GitHub & Bật GitHub Pages
Dự án đã có sẵn file `.github/workflows/deploy.yml` và cấu hình `base: './'` trong `vite.config.js`.

1. Tạo một repository mới trên GitHub và đẩy toàn bộ mã nguồn lên nhánh `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nha Chung Mochi Co-op PWA"
   git branch -M main
   git remote add origin https://github.com/<ten-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
2. (Tùy chọn) Nếu muốn nhúng sẵn cấu hình Firebase lúc build, vào **Settings** của repo -> **Secrets and variables** -> **Actions** -> thêm các Repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
3. Vào **Settings** -> **Pages** -> tại mục **Build and deployment (Source)**, chọn **GitHub Actions**.
4. Chờ khoảng 1 phút để workflow chạy xong, bạn sẽ nhận được đường link web game dạng `https://<ten-cua-ban>.github.io/<ten-repo>/`.

---

### Bước 4: Cài đặt lên màn hình chính iPhone (Chuẩn PWA Toàn Màn Hình)
1. Mở đường link game bằng trình duyệt **Safari** trên iPhone.
2. Bấm vào nút **Chia sẻ (Share)** ở thanh dưới cùng của Safari.
3. Cuộn xuống chọn **Thêm vào MH chính (Add to Home Screen)** -> bấm **Thêm (Add)**.
4. Mở biểu tượng **Nhà Mochi** ngoài màn hình chính để trải nghiệm toàn màn hình (`100dvh`), ẩn hoàn toàn thanh địa chỉ Safari và tràn viền chuẩn iOS!

---

## 💻 Chạy thử nghiệm tại máy cá nhân (Local Development)

```bash
npm install
npm run dev
```

Build kiểm tra bản Production:

```bash
npm run build
```
