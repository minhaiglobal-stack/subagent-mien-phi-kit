#!/usr/bin/env node
// HÀNG ĐỢI CÔNG VIỆC — tạo job_id, khóa nguồn đầu vào, chống làm trùng, giới hạn thử lại.
// Dùng:
//   node cong-cu/job.mjs tao --loai video --nguon hop-nhan-viec/video/abc --mo-ta "Video giới thiệu SP A"
//   node cong-cu/job.mjs cap-nhat <job_id> --trang-thai dang_lam|cho_kiem_dinh|dat|khong_dat|can_chu_xem|ban_giao|huy [--agent x] [--ghi-chu "..."]
//   (chủ có thể bàn giao dù QA chưa đạt bằng cờ --chu-chap-nhan, chỉ trong terminal riêng)
//   node cong-cu/job.mjs danh-sach [--tat-ca]
//   node cong-cu/job.mjs xem <job_id>
import fs from 'node:fs';
import path from 'node:path';
import { P, GOC, cauHinh, docJSON, ghiJSON, bamSHA, bamTep, ghiNhatKy, inBang, ngayHomNay, dangChayTrongAgent } from './_chung.mjs';

const args = process.argv.slice(2);
const lenh = args[0];
const tuyChon = (ten, md = null) => { const i = args.indexOf('--' + ten); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : md; };
const ch = cauHinh();

const TRANG_THAI = ['moi', 'dang_lam', 'cho_kiem_dinh', 'dat', 'khong_dat', 'can_chu_xem', 'ban_giao', 'huy'];
const CHUYEN_HOP_LE = {
  moi: ['dang_lam', 'huy'],
  dang_lam: ['cho_kiem_dinh', 'khong_dat', 'can_chu_xem', 'huy'],
  cho_kiem_dinh: ['dat', 'khong_dat', 'can_chu_xem'],
  khong_dat: ['dang_lam', 'can_chu_xem', 'huy'],
  dat: ['ban_giao', 'can_chu_xem'],
  can_chu_xem: ['dang_lam', 'huy', 'ban_giao'],
  ban_giao: [],
  huy: [],
};

function vanTayNguon(nguon) {
  const tuyetDoi = path.resolve(GOC, nguon);
  if (!fs.existsSync(tuyetDoi)) return bamSHA('khong-ton-tai:' + nguon);
  const st = fs.statSync(tuyetDoi);
  if (st.isFile()) return bamTep(tuyetDoi);
  const ds = [];
  const duyet = (d) => { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); const s = fs.statSync(p); if (s.isDirectory()) duyet(p); else ds.push(path.relative(tuyetDoi, p) + ':' + s.size + ':' + bamTep(p)); } };
  duyet(tuyetDoi);
  return bamSHA(ds.join('\n'));
}

function tatCaJob() {
  if (!fs.existsSync(P.hangDoi)) return [];
  return fs.readdirSync(P.hangDoi).filter(f => f.endsWith('.json')).map(f => docJSON(path.join(P.hangDoi, f))).filter(Boolean);
}

if (lenh === 'tao') {
  const loai = tuyChon('loai', 'khac');
  const nguon = tuyChon('nguon');
  const moTa = tuyChon('mo-ta', '');
  if (!nguon) { console.error('Thiếu --nguon <đường dẫn đầu vào>'); process.exit(1); }
  const vt = vanTayNguon(nguon);
  const trung = tatCaJob().find(j => j.van_tay_nguon === vt && j.loai === loai && j.trang_thai !== 'huy');
  if (trung && !args.includes('--cho-phep-trung')) {
    console.error(`⛔ TRÙNG VIỆC: nguồn này đã có job ${trung.job_id} (trạng thái ${trung.trang_thai}). Không tạo job mới.`);
    console.error('   Nếu chủ muốn làm lại, chủ thêm --cho-phep-trung.');
    process.exit(4);
  }
  const ngay = ngayHomNay(ch.mui_gio).replace(/-/g, '');
  const soThuTu = tatCaJob().filter(j => j.job_id.startsWith(`J${ngay}`)).length + 1;
  const job = {
    job_id: `J${ngay}-${String(soThuTu).padStart(3, '0')}`,
    loai, mo_ta: moTa, nguon, van_tay_nguon: vt,
    agent: null, trang_thai: 'moi', so_lan_thu: 0,
    gioi_han_thu: ch.han_muc?.thu_lai_toi_da ?? 2,
    tao_luc: new Date().toISOString(),
    lich_su: [{ ts: new Date().toISOString(), trang_thai: 'moi', ghi_chu: 'Tạo job, khóa vân tay nguồn' }],
  };
  ghiJSON(path.join(P.hangDoi, job.job_id + '.json'), job);
  ghiNhatKy({ loai: 'job', job_id: job.job_id, hanh_dong: 'tao', nguon });
  console.log(`✅ Đã tạo ${job.job_id} (${loai}) — nguồn ${nguon}`);
  process.exit(0);
}

if (lenh === 'cap-nhat') {
  const id = args[1];
  const tep = path.join(P.hangDoi, `${id}.json`);
  const job = docJSON(tep);
  if (!job) { console.error(`Không thấy job ${id}`); process.exit(1); }
  const moi = tuyChon('trang-thai');
  if (!TRANG_THAI.includes(moi)) { console.error('Trạng thái hợp lệ: ' + TRANG_THAI.join(', ')); process.exit(1); }
  if (!CHUYEN_HOP_LE[job.trang_thai].includes(moi)) {
    console.error(`⛔ Không được chuyển ${job.trang_thai} → ${moi}. Hợp lệ: ${CHUYEN_HOP_LE[job.trang_thai].join(', ') || '(đã đóng)'}`);
    process.exit(4);
  }
  const chuChapNhan = args.includes('--chu-chap-nhan') && !dangChayTrongAgent();
  if ((moi === 'dat' || moi === 'ban_giao') && !chuChapNhan) {
    const bb = path.join(P.banGiao, 'bang-chung');
    const bienBan = fs.existsSync(bb) ? fs.readdirSync(bb).filter(f => f.startsWith(id) && /qa|kiem-dinh/.test(f)) : [];
    if (!bienBan.length) { console.error(`⛔ Chưa có biên bản QA trong ban-giao/bang-chung/ cho ${id}. Không được chuyển "${moi}".`); process.exit(4); }
    const moiNhat = bienBan.filter(f => f.endsWith('.json')).map(f => docJSON(path.join(bb, f))).filter(Boolean)
      .sort((x, y) => String(x.luc).localeCompare(String(y.luc))).pop();
    if (moiNhat?.ket_luan_tu_dong === 'KHONG_DAT') {
      console.error(`⛔ Biên bản kiểm định tự động mới nhất của ${id} là KHÔNG ĐẠT. Không được chuyển "${moi}".`); process.exit(4);
    }
  }
  if (moi === 'dang_lam' && job.trang_thai === 'khong_dat') {
    if (job.so_lan_thu >= job.gioi_han_thu) {
      job.trang_thai = 'can_chu_xem';
      job.lich_su.push({ ts: new Date().toISOString(), trang_thai: 'can_chu_xem', ghi_chu: `Hết ${job.gioi_han_thu} lượt thử lại` });
      ghiJSON(tep, job);
      ghiNhatKy({ loai: 'job', job_id: id, hanh_dong: 'het_luot_thu' });
      console.error(`⛔ ${id} đã hết ${job.gioi_han_thu} lượt thử lại → chuyển "can_chu_xem". Báo chủ phần chưa đạt.`);
      process.exit(4);
    }
    job.so_lan_thu += 1;
  }
  if (tuyChon('agent')) job.agent = tuyChon('agent');
  job.trang_thai = moi;
  job.lich_su.push({ ts: new Date().toISOString(), trang_thai: moi, agent: job.agent, ghi_chu: tuyChon('ghi-chu', '') });
  ghiJSON(tep, job);
  ghiNhatKy({ loai: 'job', job_id: id, hanh_dong: 'cap_nhat', trang_thai: moi, agent: job.agent });
  console.log(`✅ ${id}: ${moi}${job.so_lan_thu ? ` (lần thử lại ${job.so_lan_thu}/${job.gioi_han_thu})` : ''}`);
  process.exit(0);
}

if (lenh === 'xem') {
  const job = docJSON(path.join(P.hangDoi, `${args[1]}.json`));
  if (!job) { console.error('Không thấy job'); process.exit(1); }
  console.log(JSON.stringify(job, null, 2));
  process.exit(0);
}

if (lenh === 'danh-sach' || !lenh) {
  let ds = tatCaJob();
  if (!args.includes('--tat-ca')) ds = ds.filter(j => !['ban_giao', 'huy'].includes(j.trang_thai));
  if (!ds.length) { console.log('Hàng đợi trống.'); process.exit(0); }
  inBang(ds.map(j => ({ job: j.job_id, loai: j.loai, agent: j.agent || '-', trang_thai: j.trang_thai, thu_lai: `${j.so_lan_thu}/${j.gioi_han_thu}`, mo_ta: (j.mo_ta || '').slice(0, 40) })),
    ['job', 'loai', 'agent', 'trang_thai', 'thu_lai', 'mo_ta']);
  process.exit(0);
}

console.log('Lệnh: tao | cap-nhat | danh-sach | xem');
process.exit(1);
