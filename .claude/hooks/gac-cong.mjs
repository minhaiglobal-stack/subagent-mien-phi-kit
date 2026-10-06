#!/usr/bin/env node
// GÁC CỔNG (PreToolUse) — kiểm tra MỌI thao tác trước khi Agent được làm.
// Đây là "khóa cửa" kỹ thuật: Agent không thể bỏ qua bằng lời nói.
// Mã thoát 2 = chặn; lý do (stderr) được gửi lại cho Agent.
import fs from 'node:fs';
import {
  P, GOC, VUNG_BAO_VE, cauHinh, docJSON, tuongDoi, thuocVung, laBiMat,
  ghiNhatKy, demThaoTac,
} from '../../cong-cu/_chung.mjs';

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { /* không có đầu vào */ }

const tool = input.tool_name || '';
const ti = input.tool_input || {};
const cwd = input.cwd || GOC;
const agent = input.agent_type || input.agent_name || 'agent-tong';
const ch = cauHinh();
const quyen = docJSON(P.quyen, { agents: {} });
const quyenAgent = quyen.agents?.[agent];

const TU_KIEM = process.env.CONG_XUONG_TU_KIEM === '1';
function chan(lyDo, goiY = '') {
  if (!TU_KIEM) try { ghiNhatKy({ loai: 'chan', agent, tool, ly_do: lyDo, dau_vao: tomTat(ti) }); } catch {}
  process.stderr.write(`⛔ GÁC CỔNG CHẶN: ${lyDo}${goiY ? '\n→ ' + goiY : ''}\n`);
  process.exit(2);
}
function tomTat(o) {
  const s = typeof o === 'string' ? o : JSON.stringify(o);
  return s.length > 300 ? s.slice(0, 300) + '…' : s;
}
const DE_XUAT = 'Ghi đề xuất vào de-xuat/ (mẫu Phiếu đề xuất trong CLAUDE.md) để chủ duyệt.';

// 1) NÚT DỪNG KHẨN — có tệp DUNG_KHAN thì chỉ được đọc.
const CHI_DOC = new Set(['Read', 'Glob', 'Grep', 'LS', 'TodoWrite', 'TodoRead']);
if (fs.existsSync(P.dungKhan) && !CHI_DOC.has(tool)) {
  chan('Hệ thống đang DỪNG KHẨN. Mọi hành động bị khóa, chỉ được đọc.',
    'Báo cáo tình trạng cho chủ và chờ. Chỉ chủ mở lại được: node cong-cu/dung-khan.mjs tat');
}

// 2) NGÂN SÁCH THAO TÁC TRONG NGÀY
const hanMuc = ch.han_muc?.thao_tac_moi_ngay ?? 2000;
const daDung = TU_KIEM ? 0 : demThaoTac('thao_tac');
if (daDung > hanMuc) {
  chan(`Đã vượt hạn mức ${hanMuc} thao tác/ngày.`, 'Dừng lại, báo chủ. Chủ có thể nâng hạn mức trong he-thong/cau-hinh.json.');
}

// 3) KIỂM TRA THEO LOẠI CÔNG CỤ
const DOC_TEP = new Set(['Read', 'NotebookRead']);
const GHI_TEP = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const TIM = new Set(['Glob', 'Grep', 'LS']);

function kiemDoc(p) {
  if (!p) return;
  if (laBiMat(p)) chan(`Không được đọc vùng bí mật: ${p}`, 'Bí mật chỉ được dùng qua biến môi trường do chủ cài; Agent không đọc/in ra.');
  const rel = tuongDoi(p, cwd);
  if (rel === null) {
    const them = (ch.duong_dan_doc_them || []).some(d => String(p).startsWith(d));
    if (!them) chan(`Đường dẫn nằm ngoài công xưởng (cấm đọc chéo dự án): ${p}`,
      'Đưa tài nguyên vào hop-nhan-viec/, hoặc chủ thêm thư mục vào "duong_dan_doc_them" trong cau-hinh.json.');
  }
}

function kiemGhi(p) {
  if (!p) return;
  if (laBiMat(p)) chan(`Không được ghi vào vùng bí mật: ${p}`);
  const rel = tuongDoi(p, cwd);
  if (rel === null) chan(`Không được ghi ra ngoài công xưởng: ${p}`, 'Chỉ ghi trong thư mục dự án.');
  if (thuocVung(rel, VUNG_BAO_VE)) chan(`"${rel}" là tệp quản trị, chỉ chủ sở hữu được sửa.`, DE_XUAT);
  if (quyenAgent?.ghi_duoc && !quyenAgent.ghi_duoc.some(v => (rel + '/').startsWith(v))) {
    chan(`Agent "${agent}" chỉ được ghi vào: ${quyenAgent.ghi_duoc.join(', ')} (đang ghi ${rel}).`);
  }
}

if (DOC_TEP.has(tool)) kiemDoc(ti.file_path || ti.notebook_path);
if (TIM.has(tool)) { if (ti.path) kiemDoc(ti.path); if (laBiMat(ti.pattern) || laBiMat(ti.glob)) chan('Không được tìm kiếm trong vùng bí mật.'); }
if (GHI_TEP.has(tool)) kiemGhi(ti.file_path || ti.notebook_path);

// 4) BASH — kiểm tra lệnh
if (tool === 'Bash') {
  const lenh = String(ti.command || '');
  const L = lenh.toLowerCase();
  // Tách lệnh theo ; && || | nhưng bỏ qua các ký tự này khi nằm trong ngoặc kép/đơn
  const tachLenh = (s) => {
    const ra = []; let cur = '', q = null;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (q) { cur += ch; if (ch === q && s[i - 1] !== '\\') q = null; continue; }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === ';' || ch === '|' || (ch === '&' && s[i + 1] === '&')) { ra.push(cur); cur = ''; if (s[i + 1] === ch) i++; continue; }
      cur += ch;
    }
    ra.push(cur);
    return ra.map(x => x.trim()).filter(Boolean);
  };
  const tachTu = (s) => (s.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(t => t.replace(/^["']|["']$/g, ''));

  if (quyenAgent && quyenAgent.bash === false) chan(`Agent "${agent}" không có quyền chạy lệnh.`);
  if (quyenAgent?.bash_duoc_phep?.length) {
    const cacLenh = tachLenh(lenh);
    for (const c of cacLenh) {
      if (!quyenAgent.bash_duoc_phep.some(pf => c.startsWith(pf))) {
        chan(`Agent "${agent}" chỉ được chạy lệnh bắt đầu bằng: ${quyenAgent.bash_duoc_phep.join(' | ')}. Lệnh bị chặn: ${c.slice(0, 80)}`);
      }
    }
  }

  const QUY_TAC = [
    [laBiMat(lenh), 'Lệnh chạm vào vùng bí mật (mật khẩu, khóa, cookie, .env).'],
    [/(^|[;&|\s])(printenv|env)(\s*$|\s*[|;&>])/.test(lenh) || /\$\{?[A-Z0-9_]*(KEY|TOKEN|SECRET|PASS|PASSWORD|COOKIE)\b/.test(lenh) || /\bset\s*$/.test(L),
      'Không được in biến môi trường/bí mật.'],
    [/(^|[;&|\s])(rm|rmdir|unlink|shred|del|rd|erase)\s/.test(L) || /remove-item/.test(L) || /\bfind\b[^\n]*\s-delete\b/.test(L),
      'Xóa dữ liệu phải do chủ duyệt.'],
    [/git\s+(clean|reset\s+--hard|push\s+(-f|--force))/.test(L) || /git\s+push\b/.test(L), 'Git xóa lịch sử / đẩy mã ra ngoài cần chủ duyệt.'],
    [/(^|[;&|\s])(sudo|su|doas|runas)\s/.test(L) || /chmod\s+(-r\s+)?777/.test(L) || /chown\s+-r/.test(L), 'Không được nâng quyền hệ thống.'],
    [/\b(mkfs|fdisk|diskpart|format\s+[a-z]:|shutdown|reboot|halt|poweroff)\b/.test(L) || /\bdd\s+if=/.test(L) || /:\(\)\s*\{/.test(L), 'Lệnh nguy hiểm cho máy.'],
    [/(curl|wget|iwr|invoke-webrequest)[^\n|]*\|\s*(sh|bash|zsh|node|python3?|iex|powershell)/.test(L) || /invoke-expression|\biex\b/.test(L), 'Không chạy mã tải từ internet.'],
    [/\bcurl\b[^\n]*(\s-d\b|\s--data|\s-f\b|\s--form|\s-t\b|\s--upload-file|\s-x\s*(post|put|patch|delete))/.test(L) || /\bwget\b[^\n]*--post/.test(L) ||
      /(^|[;&|\s])(scp|sftp|ftp|nc|ncat|netcat|telnet)\s/.test(L) || /\brsync\b[^\n]*\S+:\S*/.test(L) ||
      /\bgh\s+(pr|issue|release|gist|repo)\s+(create|edit|delete|comment|upload)/.test(L) || /invoke-restmethod/.test(L),
      'Gửi/đẩy dữ liệu ra ngoài cần chủ duyệt.'],
    [/(^|[;&|\s])(npm|pnpm|yarn|bun)\s+(i|install|add)\b[^\n]*(-g|--global)/.test(L) || /\bpip3?\s+install\b/.test(L) ||
      /\b(brew|apt|apt-get|yum|dnf|winget|choco|scoop)\s+(install|upgrade|remove)/.test(L),
      'Cài/gỡ phần mềm trên máy cần chủ duyệt.'],
    [/quan-ly-agent\.mjs\s+(them|duyet|trang-thai|mo|nghi-viec|nang-cap-cap|dau-van-tay)/.test(L) || /dung-khan\.mjs\s+tat/.test(L) || /xuat-ban\.mjs\s+(dang\b[^\n]*--that|github)/.test(L) ||
      (/cai-dat\.mjs/.test(L) && fs.existsSync(P.registry)),
      'Thay đổi nhân sự/quyền/dừng khẩn là việc của chủ sở hữu.'],
  ];
  for (const [vipham, lyDo] of QUY_TAC) if (vipham) chan(lyDo, DE_XUAT);

  // Ghi vào vùng bảo vệ qua lệnh (chuyển hướng >, tee, mv, cp, sed -i…)
  const dich = [];
  for (const m of lenh.matchAll(/(?:^|[^0-9&])>>?\s*["']?([^\s"';&|]+)/g)) dich.push(m[1]);
  for (const m of lenh.matchAll(/\btee\s+(?:-a\s+)?["']?([^\s"';&|]+)/g)) dich.push(m[1]);
  for (const doan of tachLenh(lenh)) {
    const tk = tachTu(doan).filter(t => t && !t.startsWith('-'));
    const c = (tk[0] || '').toLowerCase();
    if (['cp', 'ln', 'install', 'copy-item'].includes(c)) dich.push(tk[tk.length - 1]);        // chỉ đích bị ghi
    else if (['mv', 'move-item', 'touch', 'truncate', 'chmod', 'set-content', 'out-file', 'add-content'].includes(c)) dich.push(...tk.slice(1));
    else if ((c === 'sed' || c === 'perl') && /\s-[a-z]*i/.test(doan)) dich.push(...tk.slice(1));
  }
  for (const d of dich) {
    if (!d || d === '/dev/null') continue;
    const rel = tuongDoi(d, cwd);
    if (rel !== null && thuocVung(rel, VUNG_BAO_VE)) chan(`Lệnh ghi/đổi tệp quản trị "${rel}" — chỉ chủ sở hữu được làm.`, DE_XUAT);
  }
}

// 5) GIAO VIỆC CHO AGENT CON — chỉ agent có trong registry và đang hoạt động
if (tool === 'Task' || tool === 'Agent') {
  const loai = ti.subagent_type || ti.agent_type || '';
  const reg = docJSON(P.registry, { agents: [] });
  const a = reg.agents.find(x => x.agent_id === loai);
  const heThongChoPhep = ch.agent_he_thong_cho_phep || ['Explore', 'Plan'];
  if (!a && !heThongChoPhep.includes(loai)) {
    chan(`Agent "${loai || '(không tên)'}" không có trong registry — không được giao việc.`,
      'Chỉ giao cho agent đã đăng ký (xem he-thong/registry.json). Muốn thêm agent: ghi hồ sơ vào de-xuat/agent-moi/.');
  }
  if (a && !['sandbox', 'thu_viec', 'chinh_thuc'].includes(a.trang_thai)) {
    chan(`Agent "${loai}" đang ở trạng thái "${a.trang_thai}" — không được giao việc.`);
  }
  const soLan = TU_KIEM ? 0 : demThaoTac('giao_viec');
  const hm = ch.han_muc?.giao_viec_moi_ngay ?? 200;
  if (soLan > hm) chan(`Đã vượt hạn mức ${hm} lần giao việc cho Agent con trong ngày.`);
}

// 6) INTERNET
if ((tool === 'WebFetch' || tool === 'WebSearch') && ch.cho_phep_web === false) {
  chan('Truy cập web đang tắt trong cau-hinh.json.');
}

// 7) CÔNG CỤ KẾT NỐI NGOÀI (MCP): hành động thay mặt chủ phải được duyệt trước
if (tool.startsWith('mcp__')) {
  const choPhep = ch.mcp_duoc_phep || [];
  const duocPhep = choPhep.some(m => m.endsWith('*') ? tool.startsWith(m.slice(0, -1)) : tool === m);
  const RUI_RO = /(send|post|publish|create|delete|remove|trash|share|comment|reply|react|pay|purchase|checkout|order|transfer|update|write|upload|submit|invite|merge|push|edit|computer|form_input|click|type|key|navigate|javascript|execute|fill)/i;
  const tenHanhDong = tool.split('__').slice(2).join('__') || tool;
  if (RUI_RO.test(tenHanhDong) && !duocPhep) {
    chan(`Công cụ "${tool}" có thể hành động thay mặt chủ (gửi/đăng/xóa/thao tác trình duyệt).`,
      'Cần chủ duyệt: chủ thêm tên công cụ vào "mcp_duoc_phep" trong he-thong/cau-hinh.json, hoặc chủ tự thao tác.');
  }
}

process.exit(0);
