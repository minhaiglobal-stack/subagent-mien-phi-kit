#!/usr/bin/env node
// TRÌNH CÀI ĐẶT CÔNG XƯỞNG SUBAGENT — BẢN DÙNG THỬ CẤP 1 (Miễn phí Kit)
//   node cong-cu/cai-dat.mjs --chu "Tên chủ sở hữu" [--thuong-hieu "Tên doanh nghiệp"] [--dong-y]
// Bản dùng thử chỉ có cấp 1: Agent Tổng + QA + Edit Video + CSKH soạn nháp.
import fs from 'node:fs';
import path from 'node:path';
import { P, GOC, docJSON, ghiJSON, ghiNhatKy, capNhatDauVanTay, chiChuSoHuu, xacNhan } from './_chung.mjs';
import { themTuDanhMuc } from './quan-ly-agent.mjs';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const cap = Number(opt('cap', 1));
if (cap !== 1) {
  console.error('Bản dùng thử miễn phí chỉ có cấp 1 (4 vị trí). Bỏ tham số --cap hoặc dùng --cap 1.');
  console.error('Muốn dùng cấp 2/3: đặt lịch Audit quy trình miễn phí (gọi video 15 phút qua Zalo/Telegram 0963124791, 9:00–10:00, thứ Hai–thứ Bảy).');
  process.exit(1);
}

console.log('══════════════════════════════════════════════');
console.log('  CÀI ĐẶT CÔNG XƯỞNG SUBAGENT — BẢN DÙNG THỬ CẤP 1');
console.log('══════════════════════════════════════════════');

const daCai = fs.existsSync(P.registry);
if (daCai) {
  chiChuSoHuu('Cài đặt lại công xưởng');
  if (!(await xacNhan('Công xưởng đã được cài. Cài lại sẽ GIỮ nhân sự hiện có và chỉ bổ sung phần thiếu. Tiếp tục?'))) process.exit(1);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 18) { console.error(`Node.js ${process.versions.node} quá cũ. Cài Node.js 22 LTS từ https://nodejs.org rồi chạy lại.`); process.exit(1); }

for (const d of ['hop-nhan-viec/video', 'hop-nhan-viec/cskh', 'hop-nhan-viec/_sandbox', 'ban-giao/nhap', 'ban-giao/bang-chung', 'hang-doi', 'bo-nho/mau-vang',
  'de-xuat/agent-moi', 'nhat-ky', 'bao-cao', 'bi-mat', 'luu-tru', '.claude/agents']) fs.mkdirSync(path.join(GOC, d), { recursive: true });
console.log('✓ Đã tạo các thư mục làm việc');

const ch = docJSON(P.cauHinh, null) || docJSON(path.join(GOC, 'he-thong', 'cau-hinh.mau.json'), {});
ch.cap = 1;
if (opt('chu')) ch.chu_so_huu = opt('chu');
if (opt('thuong-hieu')) ch.thuong_hieu = { ...(ch.thuong_hieu || {}), ten: opt('thuong-hieu') };
ch.cai_dat_luc = ch.cai_dat_luc || new Date().toISOString();
ghiJSON(P.cauHinh, ch);
console.log('✓ Cấu hình: he-thong/cau-hinh.json');

const reg = docJSON(P.registry, null) || { phien_ban: '2.0.0', agents: [] };
const dm = docJSON(path.join(P.mauAgent, 'danh-muc.json'), {});
const them = [];
for (const [id, m] of Object.entries(dm)) {
  if (id.startsWith('_') || m.cap > 1) continue;
  if (themTuDanhMuc(reg, id)) them.push(id);
}
reg.cap_nhat = new Date().toISOString();
ghiJSON(P.registry, reg);
console.log(`✓ Registry: ${reg.agents.length} vị trí${them.length ? ' (mới: ' + them.join(', ') + ')' : ''}`);

capNhatDauVanTay();
console.log('✓ Đã ghi dấu vân tay tệp quản trị');
ghiNhatKy({ loai: 'quan_tri', hanh_dong: daCai ? 'cai_lai' : 'cai_dat', cap: 1, them });

console.log('\n── Chạy kiểm tra hệ thống ──');
const kt = spawnSync(process.execPath, [path.join(GOC, 'cong-cu', 'kiem-tra.mjs')], { stdio: 'inherit' });

console.log(`
══════════════════════════════════════════════
  BƯỚC TIẾP THEO
══════════════════════════════════════════════
1. Mở Claude Code trong thư mục này (gõ lần lượt từng dòng):
     cd "${GOC}"
     claude
2. Gõ:  /khoi-dong      → Agent Tổng kiểm kê và trình Phiếu đề xuất
3. Điền hồ sơ: bo-nho/ho-so-ca-nhan-hoa.md và bảng giá: bo-nho/bang-gia.md
4. Giao việc: /giao-viec Dựng video từ hop-nhan-viec/video/<thư mục>
Nút dừng khẩn:  node cong-cu/dung-khan.mjs bat
Cần cấp 2/3 hoặc cài có hướng dẫn: Audit quy trình miễn phí, gọi video 15 phút qua Zalo/Telegram 0963124791 (9:00–10:00, thứ Hai–thứ Bảy)
`);
process.exit(kt.status ?? 0);
