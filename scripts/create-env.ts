import { copyFile, access } from 'node:fs/promises';

try {
  await access('.env');
  console.log('Đã giữ nguyên file .env hiện có.');
} catch {
  await copyFile('.env.example', '.env');
  console.log('Đã tạo file .env từ .env.example. Bạn có thể chỉnh sửa file này.');
}
