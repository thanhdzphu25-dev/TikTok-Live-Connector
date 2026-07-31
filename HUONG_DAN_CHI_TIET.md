# Hướng dẫn chi tiết — TikTok Live Music Request

> Tài liệu này phân biệt rõ **bản demo giao diện** và **ứng dụng đầy đủ**. Không dùng `npm run demo` để live thật: demo chỉ nhằm xem nhanh giao diện khi chưa cài được dependency.

## 1. Trạng thái hiện tại

### Có thể chạy ngay

- `npm run demo` chạy một web server thuần Node.js, không cần cài thêm package.
- Có Admin demo, Simulator demo, Overlay Preview, overlay nền trong suốt và Health Check.
- Có thể bấm Gift Phát, Gift Ưu tiên, GG và Đổi skin để xem số xu/vote thay đổi trong bộ nhớ.

### Chưa phải bản production hoàn chỉnh để live thật

- `ExistingTikTokLiveProvider` mới là ranh giới adapter; chưa chuyển các event từ connector gốc trong `src/lib` thành event chuẩn của ứng dụng.
- Trạng thái queue/coin của `AppService` hiện chủ yếu nằm trong bộ nhớ, chưa ghi đầy đủ mọi thay đổi vào Prisma.
- Spotify mới có tạo OAuth URL và refresh token phía server; chưa có đầy đủ callback, search, device và playback routes.
- Chưa có đăng nhập/session bảo vệ toàn bộ Admin Panel và chưa cưỡng chế quyền read-only của overlay token.
- Các trang admin chuyên biệt hiện mới dùng chung scaffold, chưa có đầy đủ CRUD/drag-and-drop như đặc tả.

Vì vậy, đây là **bản scaffold + demo có thể chạy**, chưa nên gọi là “bản chuẩn production để live thật”.

## 2. Yêu cầu máy

- Node.js 20 trở lên (`node -v`).
- npm đi kèm Node.js (`npm -v`).
- Không cần Docker, PostgreSQL hoặc Redis.
- Cổng TCP `3000` và `5173` chưa bị ứng dụng khác sử dụng.

## 3. File môi trường

Repository có `.env.example` để làm mẫu. File `.env` thật đã được tạo trong thư mục gốc và bị Git bỏ qua, nên bạn có thể sửa mà không làm lộ secret.

Nếu `.env` chưa tồn tại:

```bash
npm run env:create
```

Lệnh này **không ghi đè** `.env` đã tồn tại.

Các biến quan trọng:

| Biến | Ý nghĩa | Khi nào cần điền |
| --- | --- | --- |
| `NODE_ENV` | `development` hoặc `production` | Luôn có |
| `HOST` | Host local, khuyến nghị `127.0.0.1` | Luôn có |
| `PORT` | Cổng backend, mặc định `3000` | Luôn có |
| `DATABASE_URL` | SQLite URL | Luôn có |
| `TIKTOK_PROVIDER` | `mock` hoặc `existing` | Luôn có |
| `TIKTOK_USERNAME` | Username phòng TikTok | Khi dùng provider thật |
| `TIKTOK_ROOM_ID` | Room ID nếu connector dùng room ID | Tùy connector |
| `SPOTIFY_CLIENT_ID` | Spotify OAuth client ID | Khi kết nối Spotify |
| `SPOTIFY_CLIENT_SECRET` | Spotify OAuth client secret | Khi kết nối Spotify |
| `SPOTIFY_REDIRECT_URI` | OAuth callback | Khi kết nối Spotify |
| `SESSION_SECRET` | Ký session cookie | Phải đổi trước khi dùng thật |
| `APP_ENCRYPTION_KEY` | Mã hóa token lưu local | Phải đổi trước khi dùng thật |
| `PUBLIC_OVERLAY_TOKEN` | Token chỉ đọc cho overlay | Phải đổi trước khi dùng thật |

Không gửi nội dung `.env` cho người khác và không commit file này.

## 4. Chạy demo giao diện ngay

Demo không dùng Prisma, React build hoặc Socket.IO thật. Mục đích là xem giao diện trong trường hợp registry npm đang lỗi.

```bash
npm run demo
```

Mở các URL:

- Admin: <http://127.0.0.1:3000/admin>
- Simulator: <http://127.0.0.1:3000/admin/simulator>
- Overlay Preview: <http://127.0.0.1:3000/overlay/preview>
- Overlay trong suốt: <http://127.0.0.1:3000/overlay/live?transparent=1>
- Health Check: <http://127.0.0.1:3000/api/health>

Dừng server bằng `Ctrl+C`.

## 5. Cài và chạy ứng dụng đầy đủ

Khi máy truy cập được npm registry:

```bash
npm install
npm run env:create
npm run setup
npm run dev
```

- Backend chạy tại `127.0.0.1:3000`.
- Vite development server chạy tại cổng `5173` và proxy API/Socket.IO về backend.
- `npm run setup` tạo Prisma Client, áp dụng SQLite migration và seed dữ liệu mặc định.

Kiểm tra:

```bash
curl http://127.0.0.1:3000/api/health
```

Kết quả phải có `"status":"ok"`.

## 6. Chạy production local

Chỉ thực hiện sau khi `setup`, `lint`, `typecheck`, `test` và `build` đều thành công:

```bash
npm run setup
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

Production server phục vụ frontend đã build từ `dist/client`.

## 7. Dùng Mock TikTok và Simulator

Trong `.env`:

```dotenv
TIKTOK_PROVIDER=mock
```

Sau khi chạy development app, mở:

<http://127.0.0.1:3000/admin/simulator>

Luồng thử cơ bản:

1. Gửi comment `!song I Love You - Avril Lavigne` bằng user `Tomorrow`.
2. Gửi gift `Phát` bằng đúng user đó.
3. Gửi comment `!song yes, and? - Ariana Grande` bằng user `Huy Tô`.
4. Gửi gift `Ưu tiên` bằng đúng user đó.
5. Gửi GG bằng ba user khác nhau.
6. Quan sát queue, tổng xu, leaderboard và overlay.

## 8. Kết nối connector TikTok thật

Trong `.env`:

```dotenv
TIKTOK_PROVIDER=existing
TIKTOK_USERNAME=your_username
```

Điểm cần hoàn thiện nằm tại:

```text
src/server/providers/tiktok/ExistingTikTokLiveProvider.ts
```

Adapter phải:

1. Khởi tạo connector gốc từ `src/lib`.
2. Đăng ký comment, gift, follow, share, like, join và disconnect.
3. Chuyển payload gốc thành `NormalizedEvent`.
4. Không chuyển raw TikTok payload, cookie hoặc token xuống client.
5. Gọi handler đã đăng ký qua `onEvent`.
6. Dedupe bằng event ID ổn định do connector cung cấp.

Không tự tạo endpoint TikTok, không log cookie/session và không sửa CAPTCHA/chữ ký bảo vệ.

## 9. Spotify

Không có credentials: ứng dụng phải dùng Manual Playback Mode.

Khi có Spotify app:

1. Tạo app trong Spotify Developer Dashboard.
2. Thêm redirect URI chính xác: `http://127.0.0.1:3000/api/spotify/callback`.
3. Điền các biến Spotify vào `.env`.
4. Không đưa `SPOTIFY_CLIENT_SECRET` hoặc refresh token xuống frontend.

Âm thanh không đi qua server. Spotify phát trên máy host; TikTok LIVE Studio thu âm thanh qua Desktop/System Audio.

## 10. Thêm overlay vào TikTok LIVE Studio

1. Chạy ứng dụng và giữ terminal mở.
2. Mở TikTok LIVE Studio.
3. Thêm Browser Source/nguồn trang web.
4. Dán `http://127.0.0.1:3000/overlay/live?transparent=1`.
5. Đặt kích thước `1080 × 1920`.
6. Chọn 30 hoặc 60 FPS.
7. Bật transparent background nếu LIVE Studio có tùy chọn này.
8. Đặt overlay phía trên nguồn video.
9. Thêm Desktop/System Audio để đưa nhạc Spotify vào live.
10. Không đưa Admin Panel lên Browser Source công khai.

## 11. Xử lý lỗi thường gặp

### `EADDRINUSE: port 3000 already in use`

Dừng tiến trình đang chiếm cổng hoặc đổi `PORT` trong `.env`.

### npm trả `403 Forbidden`

Đây là lỗi quyền truy cập registry/proxy, không phải lỗi TikTok. Có thể dùng `npm run demo` để xem UI, nhưng cần sửa registry/network trước khi chạy app đầy đủ.

### Prisma không tìm thấy database

Kiểm tra `DATABASE_URL`, bảo đảm thư mục `data/` tồn tại, rồi chạy lại:

```bash
npm run setup
```

### Overlay không cập nhật

- Kiểm tra Health Check.
- Mở DevTools và kiểm tra kết nối `/socket.io`.
- Đảm bảo Vite proxy hoặc production server đang chạy.
- Refresh Browser Source sau khi backend restart.

## 12. Checklist trước khi live thật

- [ ] `npm install` thành công.
- [ ] `npm run setup` thành công.
- [ ] `npm run lint` thành công.
- [ ] `npm run typecheck` thành công.
- [ ] `npm test` thành công.
- [ ] `npm run build` thành công.
- [ ] `npm start` và Health Check hoạt động.
- [ ] Adapter TikTok thật nhận được comment và gift thật.
- [ ] Combo gift không bị cộng lặp.
- [ ] Spotify OAuth/playback hoặc Manual Mode đã được thử.
- [ ] Admin authentication và overlay token được bật.
- [ ] Queue và coin vẫn đúng sau khi restart.
- [ ] Overlay được kiểm tra ở 1080 × 1920 trong LIVE Studio.

Chỉ khi toàn bộ checklist trên đạt thì mới nên coi là bản chuẩn để chạy live thật.
