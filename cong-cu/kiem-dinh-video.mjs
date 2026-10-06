#!/usr/bin/env node
// KIỂM ĐỊNH VIDEO bằng ffprobe/ffmpeg theo he-thong/quality-gate/video-9x16.json
//   node cong-cu/kiem-dinh-video.mjs ban-giao/J20261005-001.mp4 --job J20261005-001 [--gate video-9x16.json] [--bo-qua-lufs]
// Thoát 0 = ĐẠT, 1 = KHÔNG ĐẠT, 2 = lỗi công cụ.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { P, docJSON, ghiJSON, ghiNhatKy } from './_chung.mjs';

const args = process.argv.slice(2);
const tep = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const job = opt('job', path.parse(tep || 'khong-ro').name);
const qg = docJSON(path.join(P.qualityGate, opt('gate', 'video-9x16.json')));
if (!qg) { console.error('Không đọc được quality gate.'); process.exit(2); }
if (!tep || !fs.existsSync(tep)) { console.error('Không thấy tệp video.'); process.exit(2); }

const pr = spawnSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', tep], { encoding: 'utf8' });
if (pr.error || pr.status !== 0) { console.error('Không chạy được ffprobe (cài FFmpeg): ' + (pr.error?.message || pr.stderr)); process.exit(2); }
const info = JSON.parse(pr.stdout);
const v = info.streams.find(s => s.codec_type === 'video');
const a = info.streams.find(s => s.codec_type === 'audio');
const k = qg.ky_thuat;
const thoiLuong = Number(info.format.duration);
const fps = v ? (([n, d]) => n / (d || 1))(String(v.avg_frame_rate || v.r_frame_rate).split('/').map(Number)) : 0;
const kbps = Number(info.format.bit_rate) / 1000;
const mb = Number(info.format.size) / 1048576;

const muc = [];
const kt = (ten, dat, thucTe, yeuCau) => muc.push({ ten, dat, thuc_te: thucTe, yeu_cau: yeuCau });
kt('Có luồng hình', !!v, v ? v.codec_name : 'không có', 'có');
if (v) {
  kt('Kích thước', v.width === k.rong && v.height === k.cao, `${v.width}x${v.height}`, `${k.rong}x${k.cao}`);
  kt('Codec hình', k.codec_hinh.includes(v.codec_name), v.codec_name, k.codec_hinh.join('/'));
  kt('FPS', fps >= k.fps.min && fps <= k.fps.max, fps.toFixed(2), `${k.fps.min}-${k.fps.max}`);
}
kt('Có tiếng', !k.bat_buoc_co_tieng || !!a, a ? a.codec_name : 'không có', k.bat_buoc_co_tieng ? 'bắt buộc' : 'không bắt buộc');
if (a) kt('Codec tiếng', k.codec_tieng.includes(a.codec_name), a.codec_name, k.codec_tieng.join('/'));
kt('Thời lượng (giây)', thoiLuong >= k.thoi_luong_giay.min && thoiLuong <= k.thoi_luong_giay.max, thoiLuong.toFixed(1), `${k.thoi_luong_giay.min}-${k.thoi_luong_giay.max}`);
kt('Bitrate (kbps)', kbps >= k.bitrate_kbps.min && kbps <= k.bitrate_kbps.max, kbps.toFixed(0), `${k.bitrate_kbps.min}-${k.bitrate_kbps.max}`);
kt('Dung lượng (MB)', mb <= k.dung_luong_mb_toi_da, mb.toFixed(1), `<= ${k.dung_luong_mb_toi_da}`);

if (a && !args.includes('--bo-qua-lufs')) {
  const lu = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', tep, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const m = [...(lu.stderr || '').matchAll(/I:\s+(-?[\d.]+)\s+LUFS/g)].pop();
  if (m) { const I = Number(m[1]); kt('Độ ồn (LUFS)', I >= k.do_on_lufs.min && I <= k.do_on_lufs.max, I.toFixed(1), `${k.do_on_lufs.min} đến ${k.do_on_lufs.max}`); }
  else kt('Độ ồn (LUFS)', false, 'không đo được', `${k.do_on_lufs.min} đến ${k.do_on_lufs.max}`);
}

// Ảnh xem trước ở giữa video làm bằng chứng
const anh = path.join(P.banGiao, 'bang-chung', `${job}-xem-truoc.jpg`);
fs.mkdirSync(path.dirname(anh), { recursive: true });
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(Math.max(0, thoiLuong / 2)), '-i', tep, '-frames:v', '1', '-q:v', '3', anh]);

const dat = muc.every(m => m.dat);
const bb = { job, tep, quality_gate: `${qg.ma}@${qg.phien_ban}`, luc: new Date().toISOString(), ket_luan_tu_dong: dat ? 'DAT' : 'KHONG_DAT', muc, anh_xem_truoc: fs.existsSync(anh) ? anh : null, muc_thu_cong_can_cham: qg.thu_cong };
ghiJSON(path.join(P.banGiao, 'bang-chung', `${job}-kiem-dinh-video.json`), bb);
ghiNhatKy({ loai: 'kiem_dinh', job_id: job, gate: qg.ma, ket_qua: bb.ket_luan_tu_dong });
for (const m of muc) console.log(`${m.dat ? '✅' : '❌'} ${m.ten}: ${m.thuc_te} (yêu cầu ${m.yeu_cau})`);
console.log(`\nKẾT LUẬN TỰ ĐỘNG: ${dat ? 'ĐẠT' : 'KHÔNG ĐẠT'} — còn chấm thủ công: ${qg.thu_cong.join('; ')}`);
process.exit(dat ? 0 : 1);
