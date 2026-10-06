#!/usr/bin/env node
// BÁO CÁO TỔNG HỢP từ nhật ký và hàng đợi.
//   node cong-cu/bao-cao.mjs [--ngay 7]   → in ra màn hình và lưu bao-cao/tong-hop-<ngày>.md
import fs from 'node:fs';
import path from 'node:path';
import { P, cauHinh, docJSON, ngayHomNay } from './_chung.mjs';

const i = process.argv.indexOf('--ngay');
const soNgay = i > 0 ? Number(process.argv[i + 1]) : 7;
const ch = cauHinh();
const tu = new Date(Date.now() - soNgay * 86400000).toISOString().slice(0, 10);

const suKien = [];
if (fs.existsSync(P.nhatKy)) {
  for (const f of fs.readdirSync(P.nhatKy).filter(f => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f) && f.slice(0, 10) >= tu)) {
    for (const d of fs.readFileSync(path.join(P.nhatKy, f), 'utf8').split('\n').filter(Boolean)) { try { suKien.push(JSON.parse(d)); } catch {} }
  }
}
const dem = (arr, k) => arr.reduce((m, x) => (m[x[k] ?? '?'] = (m[x[k] ?? '?'] || 0) + 1, m), {});
const thaoTac = suKien.filter(e => e.loai === 'thao_tac');
const chan = suKien.filter(e => e.loai === 'chan');
const kiemDinh = suKien.filter(e => e.loai === 'kiem_dinh');
const jobs = fs.existsSync(P.hangDoi) ? fs.readdirSync(P.hangDoi).filter(f => f.endsWith('.json')).map(f => docJSON(path.join(P.hangDoi, f))).filter(j => j && j.tao_luc.slice(0, 10) >= tu) : [];
const banGiao = jobs.filter(j => j.trang_thai === 'ban_giao');
const datLanDau = banGiao.filter(j => j.so_lan_thu === 0).length;

const bang = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n') || '| (không có) | 0 |';
const md = `# Báo cáo tổng hợp ${soNgay} ngày (từ ${tu} đến ${ngayHomNay(ch.mui_gio)})

## Tóm tắt
- Job mới: **${jobs.length}** · đã bàn giao: **${banGiao.length}** · đang chờ chủ xem: **${jobs.filter(j => j.trang_thai === 'can_chu_xem').length}**
- Đạt quality gate ngay lần đầu: **${banGiao.length ? Math.round(100 * datLanDau / banGiao.length) + '%' : 'chưa có dữ liệu'}**
- Thao tác: **${thaoTac.length}** (lỗi ${thaoTac.filter(e => e.ket_qua === 'loi').length}) · bị gác cổng chặn: **${chan.length}**
- Lượt kiểm định: ${kiemDinh.length} (đạt ${kiemDinh.filter(e => e.ket_qua === 'DAT').length})
- Hạn mức: ${ch.han_muc?.thao_tac_moi_ngay ?? '?'} thao tác/ngày. Chi phí tiền thật xem trong trang quản lý tài khoản AI (lệnh /cost hoặc trang Usage).

## Thao tác theo agent
| Agent | Số thao tác |
|---|---|
${bang(dem(thaoTac, 'agent'))}

## Thao tác theo công cụ
| Công cụ | Số lần |
|---|---|
${bang(dem(thaoTac, 'tool'))}

## Lượt bị chặn (dấu hiệu cố vượt quyền nếu lặp lại)
| Lý do | Số lần |
|---|---|
${bang(dem(chan, 'ly_do'))}

## Job theo trạng thái
| Trạng thái | Số job |
|---|---|
${bang(dem(jobs, 'trang_thai'))}

## Sự kiện nhân sự và dừng khẩn
${suKien.filter(e => ['nhan_su', 'dung_khan', 'quan_tri'].includes(e.loai)).map(e => `- ${e.ts.slice(0, 16)} · ${e.loai} · ${e.hanh_dong} ${e.agent_id || ''} ${e.ly_do || ''}`).join('\n') || '- Không có'}
`;
fs.mkdirSync(P.baoCao, { recursive: true });
const out = path.join(P.baoCao, `tong-hop-${ngayHomNay(ch.mui_gio)}.md`);
fs.writeFileSync(out, md);
console.log(md);
console.log(`(Đã lưu ${path.relative(process.cwd(), out)})`);
