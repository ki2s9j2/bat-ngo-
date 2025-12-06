# 📧 Hướng Dẫn Setup Hệ Thống Thông Báo

## 🎯 Tính năng

Hệ thống sẽ gửi thông báo cho bạn khi:
- ✅ Người dùng bấm nút **"Đồng ý"** (Có)
- ⚠️ Người dùng **chuẩn bị bấm** nút "Không" (trên mobile: touchstart, trên desktop: hover)
- ⚠️ Người dùng **bấm** nút "Không"
- 📱 Người dùng **bắt đầu** (bấm nút Start)

## 🚀 Cách Setup trên Vercel

### Bước 1: Deploy lên Vercel

1. Đẩy code lên GitHub
2. Kết nối với Vercel
3. Deploy project

### Bước 2: Xem Logs (Cách đơn giản nhất)

**Không cần setup gì thêm!** Bạn có thể xem thông báo trực tiếp trong Vercel Dashboard:

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào tab **"Functions"** hoặc **"Logs"**
4. Xem real-time logs khi có người tương tác

Logs sẽ hiển thị:
```
📧 Notification received: {
  "action": "yes",
  "eventType": "click",
  "timestamp": "25/12/2024, 10:30:45",
  "userAgent": "Mozilla/5.0...",
  "ip": "123.456.789.0",
  "isMobile": "Mobile"
}
```

### Bước 3: Setup Email Notification (Tùy chọn)

Nếu muốn nhận email khi có thông báo:

#### Option A: Dùng Resend (Khuyến nghị - miễn phí 3000 email/tháng)

1. Đăng ký tại [resend.com](https://resend.com)
2. Tạo API Key
3. Trong Vercel Dashboard > Settings > Environment Variables, thêm:
   ```
   EMAIL_SERVICE=resend
   EMAIL_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_TO=your-email@gmail.com
   ```
4. Cài package (tạo file `package.json` nếu chưa có):
   ```json
   {
     "dependencies": {
       "@resend/node": "^2.0.0"
     }
   }
   ```

#### Option B: Dùng SendGrid, Nodemailer, hoặc service khác

Sửa file `api/notify.js` để tích hợp service bạn muốn.

### Bước 4: Setup Webhook (Tùy chọn)

Nếu muốn gửi thông báo đến Discord, Slack, Telegram, hoặc service khác:

1. Tạo webhook URL (ví dụ: Discord webhook)
2. Trong Vercel Dashboard > Settings > Environment Variables, thêm:
   ```
   WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx/xxxxx
   ```

### Bước 5: Setup Database (Tùy chọn - Nâng cao)

Nếu muốn lưu lịch sử vào database:

1. Tạo database (MongoDB, Supabase, PlanetScale, etc.)
2. Thêm connection string vào Environment Variables
3. Sửa file `api/notify.js` để lưu data

## 📱 Test trên Mobile

1. Mở trang web trên điện thoại
2. Khi người dùng **chạm** vào nút "Không" (chưa cần bấm), bạn sẽ nhận thông báo ngay lập tức
3. Khi người dùng **bấm** nút "Đồng ý", bạn sẽ nhận thông báo

## 🔍 Kiểm tra hoạt động

1. Mở trang web
2. Bấm các nút
3. Vào Vercel Dashboard > Functions > Logs để xem thông báo

## ⚙️ Environment Variables cần thiết

**Tối thiểu:** Không cần gì, chỉ cần xem logs trong Vercel Dashboard

**Nếu muốn email:**
- `EMAIL_SERVICE=resend`
- `EMAIL_API_KEY=your-api-key`
- `EMAIL_FROM=your-email@domain.com`
- `EMAIL_TO=your-email@gmail.com`

**Nếu muốn webhook:**
- `WEBHOOK_URL=https://your-webhook-url.com`

## 🎉 Xong!

Bây giờ bạn sẽ biết ngay khi có người tương tác với trang web của mình!




