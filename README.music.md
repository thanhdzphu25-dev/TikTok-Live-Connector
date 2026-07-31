# TikTok Live Music Request

Ứng dụng local dùng adapter `ExistingTikTokLiveProvider` để cô lập connector gốc trong `src/lib`; mặc định dùng mock provider và Simulator. Spotify tự chuyển sang Manual Playback Mode nếu chưa có OAuth credentials.

```bash
npm install
npm run setup
npm run dev
# production
npm run build && npm start
```

Điền các tên biến trong `.env.example` khi cần. Mật khẩu seed chỉ dành cho local; lớp đăng nhập có thể được bật trước khi cho máy khác truy cập. Âm thanh Spotify phát trực tiếp trên máy host, không được proxy hay tải xuống.

## Tài liệu vận hành

Xem [HUONG_DAN_CHI_TIET.md](./HUONG_DAN_CHI_TIET.md) để phân biệt demo và ứng dụng đầy đủ, cấu hình `.env`, chạy production, kết nối TikTok/Spotify và kiểm tra trước khi live.
