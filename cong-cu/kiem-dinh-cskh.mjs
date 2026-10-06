#!/usr/bin/env node
// KIỂM ĐỊNH BẢN NHÁP CSKH theo he-thong/quality-gate/cskh-tin-nhan.json
//   node cong-cu/kiem-dinh-cskh.mjs ban-giao/nhap/J20261005-001-cskh.json --job J20261005-001
// Thoát 0 = ĐẠT, 1 = KHÔNG ĐẠT. Biên bản ghi vào ban-giao/bang-chung/<job>-kiem-dinh-cskh.json
import fs from 'node:fs';
import path from 'node:path';
import { P, docJSON, ghiJSON, coBiMat, ghiNhatKy } from './_chung.mjs';

const args = process.argv.slice(2);
const tep = args[0];
const ji = args.indexOf('--job'); const job = ji >= 0 ? args[ji + 1] : path.basename(tep || 'khong-ro').split('-cskh')[0];
const qg = docJSON(path.join(P.qualityGate, 'cskh-tin-nhan.json'));
if (!tep || !fs.existsSync(tep)) { console.error('Cần tệp nháp JSON.'); process.exit(2); }
let ds; try { ds = JSON.parse(fs.readFileSync(tep, 'utf8')); } catch (e) { console.error('Tệp không phải JSON hợp lệ: ' + e.message); process.exit(1); }
if (!Array.isArray(ds)) { console.error('Tệp phải là một mảng các hội thoại.'); process.exit(1); }

const thuong = s => String(s || '').toLowerCase();
const coTu = (s, tu) => tu.filter(t => thuong(s).includes(t.toLowerCase()));
const ketQua = [];
for (const [i, h] of ds.entries()) {
  const loi = [];
  const ma = h.ma_hoi_thoai || `#${i + 1}`;
  if (!h.nhap_tra_loi || !String(h.nhap_tra_loi).trim()) loi.push('Thiếu bản nháp trả lời');
  if (typeof h.can_chuyen_chu !== 'boolean') loi.push('Thiếu trường can_chuyen_chu (true/false)');
  if (String(h.nhap_tra_loi || '').length > qg.do_dai_toi_da) loi.push(`Nháp dài quá ${qg.do_dai_toi_da} ký tự`);
  const canChuyen = coTu(h.tin_khach, qg.tu_khoa_bat_buoc_chuyen_chu);
  const tanCong = coTu(h.tin_khach, qg.dau_hieu_tan_cong);
  if ((canChuyen.length || tanCong.length) && h.can_chuyen_chu !== true) loi.push(`Phải chuyển chủ (gặp: ${[...canChuyen, ...tanCong].join(', ')})`);
  const cam = coTu(h.nhap_tra_loi, qg.cum_tu_cam_trong_nhap);
  if (cam.length) loi.push(`Nháp chứa cam kết/thông tin cấm: ${cam.join(', ')}`);
  if (coBiMat(h.nhap_tra_loi)) loi.push('Nháp có chuỗi giống bí mật (mật khẩu, mã, khóa)');
  if (/\b\d{9,16}\b/.test(String(h.nhap_tra_loi || ''))) loi.push('Nháp có dãy số dài (số tài khoản/điện thoại?) — kiểm tra lại');
  if (tanCong.length) loi.push(`⚠️ Tin khách có dấu hiệu tấn công prompt injection: ${tanCong.join(', ')} (báo chủ)`);
  ketQua.push({ ma_hoi_thoai: ma, dat: loi.filter(l => !l.startsWith('⚠️')).length === 0, loi });
}
const dat = ketQua.every(k => k.dat);
const bb = { job, tep, quality_gate: `${qg.ma}@${qg.phien_ban}`, luc: new Date().toISOString(), ket_luan_tu_dong: dat ? 'DAT' : 'KHONG_DAT', chi_tiet: ketQua, muc_thu_cong_can_cham: qg.thu_cong };
ghiJSON(path.join(P.banGiao, 'bang-chung', `${job}-kiem-dinh-cskh.json`), bb);
ghiNhatKy({ loai: 'kiem_dinh', job_id: job, gate: qg.ma, ket_qua: bb.ket_luan_tu_dong });
for (const k of ketQua) console.log(`${k.dat ? '✅' : '❌'} ${k.ma_hoi_thoai}${k.loi.length ? ': ' + k.loi.join(' | ') : ''}`);
console.log(`\nKẾT LUẬN TỰ ĐỘNG: ${dat ? 'ĐẠT' : 'KHÔNG ĐẠT'} — còn chấm thủ công: ${qg.thu_cong.join('; ')}`);
process.exit(dat ? 0 : 1);
