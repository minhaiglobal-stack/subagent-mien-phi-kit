#!/usr/bin/env node
// NÚT DỪNG KHẨN — có hiệu lực ngay với mọi Agent (gác cổng kiểm tra trước mỗi thao tác).
//   node cong-cu/dung-khan.mjs bat --ly-do "gửi nhầm tin"   (chủ hoặc Agent Tổng đều được bật)
//   node cong-cu/dung-khan.mjs tat                           (CHỈ chủ, trong terminal riêng)
//   node cong-cu/dung-khan.mjs trang-thai
import fs from 'node:fs';
import { P, ghiNhatKy, chiChuSoHuu, xacNhan } from './_chung.mjs';

const [lenh] = process.argv.slice(2);
const i = process.argv.indexOf('--ly-do');
const lyDo = i > 0 ? process.argv[i + 1] : '';

if (lenh === 'bat') {
  fs.writeFileSync(P.dungKhan, JSON.stringify({ luc: new Date().toISOString(), ly_do: lyDo }, null, 2));
  ghiNhatKy({ loai: 'dung_khan', hanh_dong: 'bat', ly_do: lyDo });
  console.log('🔴 ĐÃ BẬT DỪNG KHẨN. Mọi Agent chỉ còn quyền đọc.');
} else if (lenh === 'tat') {
  chiChuSoHuu('Tắt dừng khẩn');
  if (!fs.existsSync(P.dungKhan)) { console.log('Hệ thống không ở trạng thái dừng khẩn.'); process.exit(0); }
  if (!(await xacNhan('Đã xử lý xong nguyên nhân và muốn cho hệ thống chạy lại?'))) process.exit(1);
  fs.unlinkSync(P.dungKhan);
  ghiNhatKy({ loai: 'dung_khan', hanh_dong: 'tat' });
  console.log('🟢 Đã tắt dừng khẩn. Hệ thống hoạt động lại.');
} else {
  if (fs.existsSync(P.dungKhan)) console.log('🔴 ĐANG DỪNG KHẨN: ' + fs.readFileSync(P.dungKhan, 'utf8'));
  else console.log('🟢 Bình thường.');
}
