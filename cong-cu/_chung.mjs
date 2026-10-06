// Thư viện dùng chung cho công cụ và hook của Công xưởng SubAgent.
// Chỉ dùng thư viện có sẵn của Node.js (không cần cài thêm gói).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Thư mục gốc của công xưởng = thư mục cha của cong-cu/
export const GOC = process.env.CONG_XUONG_GOC
  ? path.resolve(process.env.CONG_XUONG_GOC)
  : path.resolve(__dirname, '..');

export const P = {
  cauHinh: path.join(GOC, 'he-thong', 'cau-hinh.json'),
  registry: path.join(GOC, 'he-thong', 'registry.json'),
  quyen: path.join(GOC, 'he-thong', 'ban-do-quyen.json'),
  dauVanTay: path.join(GOC, 'he-thong', '.dau-van-tay.json'),
  qualityGate: path.join(GOC, 'he-thong', 'quality-gate'),
  agents: path.join(GOC, '.claude', 'agents'),
  agentsKhoa: path.join(GOC, '.claude', 'agents-khoa'),
  luuTru: path.join(GOC, 'luu-tru'),
  mauAgent: path.join(GOC, 'mau-agent'),
  nhatKy: path.join(GOC, 'nhat-ky'),
  hangDoi: path.join(GOC, 'hang-doi'),
  banGiao: path.join(GOC, 'ban-giao'),
  baoCao: path.join(GOC, 'bao-cao'),
  deXuat: path.join(GOC, 'de-xuat'),
  dungKhan: path.join(GOC, 'DUNG_KHAN'),
};

// Các tệp/thư mục "Hội đồng" — chỉ chủ sở hữu được sửa (qua công cụ, trong terminal riêng).
export const VUNG_BAO_VE = [
  'he-thong/',
  '.claude/settings.json',
  '.claude/settings.local.json',
  '.claude/hooks/',
  '.claude/agents/',
  '.claude/agents-khoa/',
  'cong-cu/',
  'mau-agent/',
  'nhat-ky/',
  'CLAUDE.md',
  'DUNG_KHAN',
];

// Vùng bí mật — không ai trong công xưởng được đọc.
export const VUNG_BI_MAT = ['bi-mat/', '.env', '.ssh/', 'id_rsa', 'id_ed25519', 'Login Data', 'Cookies', '.aws/', '.npmrc', '.netrc'];

export function docJSON(p, macDinh = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return macDinh; }
}

export function ghiJSON(p, v) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tam = p + '.tam-' + process.pid;
  fs.writeFileSync(tam, JSON.stringify(v, null, 2) + '\n');
  fs.renameSync(tam, p);
}

export function cauHinh() {
  return docJSON(P.cauHinh, {});
}

export function ngayHomNay(tz) {
  const d = new Date();
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch { return d.toISOString().slice(0, 10); }
}

export function bamSHA(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export function bamTep(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

// Đường dẫn tương đối (dạng /) so với gốc; null nếu nằm ngoài công xưởng.
export function tuongDoi(p, cwd = GOC) {
  if (!p) return null;
  const tuyetDoi = path.resolve(cwd, String(p));
  const rel = path.relative(GOC, tuyetDoi);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join('/');
}

export function thuocVung(rel, vung) {
  if (rel == null) return false;
  return vung.some(v => v.endsWith('/') ? (rel + '/').startsWith(v) || rel.startsWith(v) : rel === v || rel.endsWith('/' + v) || rel.split('/').includes(v));
}

// ---------- Che bí mật ----------
const MAU_BI_MAT = [
  [/sk-ant-[A-Za-z0-9_\-]{10,}/g, '[KHÓA-ANTHROPIC]'],
  [/sk-[A-Za-z0-9_\-]{20,}/g, '[KHÓA-API]'],
  [/gh[pousr]_[A-Za-z0-9]{20,}/g, '[TOKEN-GITHUB]'],
  [/AKIA[0-9A-Z]{16}/g, '[KHÓA-AWS]'],
  [/AIza[0-9A-Za-z_\-]{30,}/g, '[KHÓA-GOOGLE]'],
  [/xox[abpr]-[A-Za-z0-9\-]{10,}/g, '[TOKEN-SLACK]'],
  [/eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g, '[JWT]'],
  [/(bearer\s+)[A-Za-z0-9._\-]{16,}/gi, '$1[TOKEN]'],
  [/((?:password|passwd|pwd|mat_?khau|mật khẩu|secret|token|api[_-]?key|cookie|otp)\s*[:=]\s*)("[^"]*"|'[^']*'|(?!\[)\S+)/gi, '$1[ĐÃ CHE]'],
  [/(\b(?:otp|mã xác (?:minh|thực)|ma xac (?:minh|thuc))\D{0,12})\d{4,8}\b/gi, '$1[ĐÃ CHE]'],
];

export function cheBiMat(s) {
  let r = String(s ?? '');
  for (const [re, thay] of MAU_BI_MAT) r = r.replace(re, thay);
  return r;
}

export function coBiMat(s) {
  return cheBiMat(s) !== String(s ?? '');
}

// ---------- Nhật ký chỉ-ghi-thêm có chuỗi băm ----------
function khoa(p, fn) {
  const lock = p + '.khoa';
  const batDau = Date.now();
  for (;;) {
    try { fs.writeFileSync(lock, String(process.pid), { flag: 'wx' }); break; }
    catch {
      if (Date.now() - batDau > 3000) { try { fs.unlinkSync(lock); } catch {} continue; }
      const t = Date.now(); while (Date.now() - t < 15) { /* chờ */ }
    }
  }
  try { return fn(); } finally { try { fs.unlinkSync(lock); } catch {} }
}

export function ghiNhatKy(suKien) {
  const ch = cauHinh();
  const ngay = ngayHomNay(ch.mui_gio);
  fs.mkdirSync(P.nhatKy, { recursive: true });
  const tep = path.join(P.nhatKy, `${ngay}.jsonl`);
  return khoa(tep, () => {
    let truoc = 'GOC';
    if (fs.existsSync(tep)) {
      const dong = fs.readFileSync(tep, 'utf8').trimEnd().split('\n').filter(Boolean);
      if (dong.length) truoc = bamSHA(dong[dong.length - 1]);
    }
    const ban = { ts: new Date().toISOString(), ...suKien, truoc };
    const dongMoi = cheBiMat(JSON.stringify(ban));
    fs.appendFileSync(tep, dongMoi + '\n');
    return ban;
  });
}

export function kiemChuoiNhatKy(tep) {
  const dong = fs.readFileSync(tep, 'utf8').trimEnd().split('\n').filter(Boolean);
  let truoc = 'GOC';
  for (let i = 0; i < dong.length; i++) {
    let o; try { o = JSON.parse(dong[i]); } catch { return { ok: false, dong: i + 1, ly_do: 'dòng không phải JSON' }; }
    if (o.truoc !== truoc) return { ok: false, dong: i + 1, ly_do: 'chuỗi băm bị đứt (có thể bị sửa/xóa)' };
    truoc = bamSHA(dong[i]);
  }
  return { ok: true, so_dong: dong.length };
}

// ---------- Đếm thao tác trong ngày (ngân sách) ----------
export function demThaoTac(loai = 'thao_tac') {
  const ch = cauHinh();
  const tep = path.join(P.nhatKy, `dem-${ngayHomNay(ch.mui_gio)}.json`);
  fs.mkdirSync(P.nhatKy, { recursive: true });
  return khoa(tep, () => {
    const d = docJSON(tep, {});
    d[loai] = (d[loai] || 0) + 1;
    fs.writeFileSync(tep, JSON.stringify(d));
    return d[loai];
  });
}

// ---------- Chủ sở hữu hay Agent? ----------
// Claude Code đặt biến CLAUDECODE=1 cho lệnh Bash nó chạy.
export function dangChayTrongAgent() {
  return process.env.CLAUDECODE === '1' || !!process.env.CLAUDE_CODE_ENTRYPOINT;
}

export function chiChuSoHuu(hanhDong) {
  if (dangChayTrongAgent()) {
    console.error(`⛔ "${hanhDong}" chỉ chủ sở hữu được làm, trong cửa sổ terminal riêng (không qua Agent).`);
    console.error('   Agent hãy ghi đề xuất vào thư mục de-xuat/ để chủ duyệt.');
    process.exit(3);
  }
}

export async function xacNhan(cauHoi) {
  if (process.argv.includes('--dong-y')) return true;
  if (!process.stdin.isTTY) {
    console.error('Cần xác nhận của chủ. Chạy lại trong terminal hoặc thêm --dong-y.');
    return false;
  }
  const rl = (await import('node:readline/promises')).createInterface({ input: process.stdin, output: process.stdout });
  const tl = (await rl.question(`${cauHoi}\nGõ DONG Y để xác nhận: `)).trim().toUpperCase();
  rl.close();
  return tl === 'DONG Y' || tl === 'ĐỒNG Ý';
}

// ---------- Dấu vân tay các tệp quản trị (phát hiện bị sửa lén) ----------
export function cacTepQuanTri() {
  const ds = [];
  const them = (p) => { if (fs.existsSync(p)) ds.push(p); };
  them(P.registry); them(P.quyen); them(P.cauHinh);
  them(path.join(GOC, '.claude', 'settings.json'));
  them(path.join(GOC, 'CLAUDE.md'));
  for (const thuMuc of [P.qualityGate, path.join(GOC, '.claude', 'hooks'), P.agents, path.join(GOC, 'cong-cu')]) {
    if (!fs.existsSync(thuMuc)) continue;
    for (const f of fs.readdirSync(thuMuc)) {
      const p = path.join(thuMuc, f);
      if (fs.statSync(p).isFile()) ds.push(p);
    }
  }
  return ds;
}

export function capNhatDauVanTay() {
  const v = {};
  for (const p of cacTepQuanTri()) v[tuongDoi(p)] = bamTep(p);
  ghiJSON(P.dauVanTay, { cap_nhat: new Date().toISOString(), tep: v });
  return v;
}

export function soDauVanTay() {
  const luu = docJSON(P.dauVanTay, null);
  if (!luu) return { co: false, khac: [] };
  const khac = [];
  const hienTai = {};
  for (const p of cacTepQuanTri()) hienTai[tuongDoi(p)] = bamTep(p);
  for (const [k, h] of Object.entries(luu.tep)) {
    if (!(k in hienTai)) khac.push(`${k} (bị xóa)`);
    else if (hienTai[k] !== h) khac.push(`${k} (bị sửa)`);
  }
  for (const k of Object.keys(hienTai)) if (!(k in luu.tep)) khac.push(`${k} (tệp mới chưa duyệt)`);
  return { co: true, khac };
}

// ---------- Frontmatter của tệp agent ----------
export function docFrontmatter(noiDung) {
  const m = noiDung.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const o = {};
  for (const dong of m[1].split(/\r?\n/)) {
    const k = dong.match(/^([A-Za-z_\-]+):\s*(.*)$/);
    if (k) o[k[1]] = k[2].trim();
  }
  return o;
}

export function inBang(hang, cot) {
  const rong = cot.map(c => Math.max(c.length, ...hang.map(h => String(h[c] ?? '').length)));
  const dong = (vals) => vals.map((v, i) => String(v ?? '').padEnd(rong[i])).join('  ');
  console.log(dong(cot));
  console.log(rong.map(r => '-'.repeat(r)).join('  '));
  for (const h of hang) console.log(dong(cot.map(c => h[c])));
}

// Nhận diện đường dẫn/chuỗi chạm vào vùng bí mật (dùng được cả cho đường dẫn ngoài công xưởng).
const RE_BI_MAT = /(^|[\/\\\s"'=])(bi-mat([\/\\]|$)|\.env(\.[\w-]+)?(\s|$|["'])|\.ssh[\/\\]|id_rsa|id_ed25519|Login Data|[\/\\]Cookies(\s|$)|\.aws[\/\\]|\.npmrc|\.netrc|\.git-credentials)/i;
export function laBiMat(s) {
  return RE_BI_MAT.test(String(s ?? '') + ' ');
}
