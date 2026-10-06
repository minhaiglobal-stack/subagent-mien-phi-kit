#!/usr/bin/env node
// QUẢN LÝ NHÂN SỰ AGENT (phòng Nhân sự + Hội đồng). Bản dùng thử cấp 1.
// Agent được phép:   danh-sach, khoa
// Chỉ CHỦ được phép (chạy trong terminal riêng): them, duyet, trang-thai, mo, nghi-viec, nang-cap-cap, dau-van-tay
//
//   node cong-cu/quan-ly-agent.mjs danh-sach
//   node cong-cu/quan-ly-agent.mjs khoa <agent> --ly-do "vượt phạm vi"
//   node cong-cu/quan-ly-agent.mjs mo <agent>
//   node cong-cu/quan-ly-agent.mjs trang-thai <agent> sandbox|thu_viec|chinh_thuc
//   node cong-cu/quan-ly-agent.mjs them <agent-trong-danh-muc>        (thêm một vị trí có sẵn trong mau-agent/)
//   node cong-cu/quan-ly-agent.mjs duyet de-xuat/agent-moi/<ten>.md   (duyệt agent mới do Agent Tổng đề xuất)
//   node cong-cu/quan-ly-agent.mjs nghi-viec <agent>
//   node cong-cu/quan-ly-agent.mjs nang-cap-cap <2|3>                  (bản dùng thử: không có, chỉ báo hướng dẫn)
//   node cong-cu/quan-ly-agent.mjs dau-van-tay                         (chủ xác nhận các tệp quản trị hiện tại là đúng)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  P, GOC, docJSON, ghiJSON, ghiNhatKy, chiChuSoHuu, xacNhan, capNhatDauVanTay,
  docFrontmatter, inBang, cauHinh,
} from './_chung.mjs';

const args = process.argv.slice(2);
const [lenh, a1, a2] = args;
const tuyChon = (ten, md = null) => { const i = args.indexOf('--' + ten); return i >= 0 ? args[i + 1] : md; };
const HOAT_DONG = ['sandbox', 'thu_viec', 'chinh_thuc'];
const CONG_CU_HOP_LE = new Set(['Read', 'Write', 'Edit', 'MultiEdit', 'Glob', 'Grep', 'Bash', 'WebFetch', 'WebSearch', 'TodoWrite', 'NotebookEdit']);

const danhMuc = () => docJSON(path.join(P.mauAgent, 'danh-muc.json'), {});
const regDoc = () => docJSON(P.registry, { phien_ban: '2.0.0', agents: [] });
function regGhi(reg) { reg.cap_nhat = new Date().toISOString(); ghiJSON(P.registry, reg); capNhatDauVanTay(); }
const timAgent = (reg, id) => reg.agents.find(x => x.agent_id === id);

function hoSoTuDanhMuc(id, m) {
  return {
    agent_id: id,
    chuc_danh: m.chuc_danh,
    tuyen: m.tuyen,
    cap: m.cap,
    nang_luc_duy_nhat: m.nang_luc,
    tang_tu_chu: m.tang_tu_chu,
    trang_thai: m.trang_thai_ban_dau,
    quality_gate: m.quality_gate || null,
    kpi: m.kpi || {},
    nguoi_quan_ly: id === 'agent-tong' ? 'chu-so-huu' : (/Tuyến 3/.test(m.tuyen) ? 'chu-so-huu' : 'agent-tong'),
    tep: m.tep ? `.claude/agents/${path.basename(m.tep)}` : 'CLAUDE.md',
    ngay_vao: new Date().toISOString().slice(0, 10),
    lich_su: [{ ts: new Date().toISOString(), su_kien: 'tuyen_dung', trang_thai: m.trang_thai_ban_dau }],
  };
}

// Dùng chung cho cai-dat.mjs
export function themTuDanhMuc(reg, id) {
  const m = danhMuc()[id];
  if (!m) throw new Error(`"${id}" không có trong mau-agent/danh-muc.json`);
  if (timAgent(reg, id)) return false;
  if (m.tep) {
    fs.mkdirSync(P.agents, { recursive: true });
    fs.copyFileSync(path.join(P.mauAgent, m.tep), path.join(P.agents, path.basename(m.tep)));
  }
  reg.agents.push(hoSoTuDanhMuc(id, m));
  return true;
}

function moveFile(tu, den) { fs.mkdirSync(path.dirname(den), { recursive: true }); fs.renameSync(tu, den); }

async function main() {
  if (!lenh || lenh === 'danh-sach') {
    const reg = regDoc();
    console.log(`Cấp quy mô: ${cauHinh().cap ?? '?'} — ${reg.agents.length} vị trí`);
    inBang(reg.agents.map(x => ({ agent: x.agent_id, chuc_danh: x.chuc_danh, tuyen: x.tuyen, trang_thai: x.trang_thai, tu_chu: x.tang_tu_chu })),
      ['agent', 'chuc_danh', 'tuyen', 'trang_thai', 'tu_chu']);
    return;
  }

  if (lenh === 'khoa') {
    const reg = regDoc(); const x = timAgent(reg, a1);
    if (!x || x.agent_id === 'agent-tong') { console.error('Không khóa được agent này.'); process.exit(1); }
    const tep = path.join(P.agents, `${a1}.md`);
    if (fs.existsSync(tep)) moveFile(tep, path.join(P.agentsKhoa, `${a1}.md`));
    x.trang_thai = 'tam_khoa';
    x.lich_su.push({ ts: new Date().toISOString(), su_kien: 'khoa', ly_do: tuyChon('ly-do', '') });
    regGhi(reg);
    ghiNhatKy({ loai: 'nhan_su', hanh_dong: 'khoa', agent_id: a1, ly_do: tuyChon('ly-do', '') });
    console.log(`🔒 Đã tạm khóa ${a1}. Chỉ chủ mở lại được: node cong-cu/quan-ly-agent.mjs mo ${a1}`);
    return;
  }

  // ----- Từ đây trở xuống: chỉ chủ sở hữu -----
  chiChuSoHuu(lenh);

  if (lenh === 'mo') {
    const reg = regDoc(); const x = timAgent(reg, a1);
    if (!x || x.trang_thai !== 'tam_khoa') { console.error('Agent không ở trạng thái tạm khóa.'); process.exit(1); }
    if (!(await xacNhan(`Mở khóa ${a1}?`))) process.exit(1);
    const tepKhoa = path.join(P.agentsKhoa, `${a1}.md`);
    if (fs.existsSync(tepKhoa)) moveFile(tepKhoa, path.join(P.agents, `${a1}.md`));
    const truoc = [...x.lich_su].reverse().find(l => HOAT_DONG.includes(l.trang_thai));
    x.trang_thai = truoc?.trang_thai || 'thu_viec';
    x.lich_su.push({ ts: new Date().toISOString(), su_kien: 'mo_khoa', trang_thai: x.trang_thai });
    regGhi(reg); ghiNhatKy({ loai: 'nhan_su', hanh_dong: 'mo', agent_id: a1 });
    console.log(`🔓 Đã mở ${a1} (${x.trang_thai}).`);
    return;
  }

  if (lenh === 'trang-thai') {
    if (!HOAT_DONG.includes(a2)) { console.error('Trạng thái: ' + HOAT_DONG.join(' | ')); process.exit(1); }
    const reg = regDoc(); const x = timAgent(reg, a1);
    if (!x) { console.error('Không thấy agent'); process.exit(1); }
    if (!(await xacNhan(`Đổi ${a1}: ${x.trang_thai} → ${a2}?`))) process.exit(1);
    x.lich_su.push({ ts: new Date().toISOString(), su_kien: 'doi_trang_thai', tu: x.trang_thai, trang_thai: a2 });
    x.trang_thai = a2;
    regGhi(reg); ghiNhatKy({ loai: 'nhan_su', hanh_dong: 'trang_thai', agent_id: a1, trang_thai: a2 });
    console.log(`✅ ${a1}: ${a2}`);
    return;
  }

  if (lenh === 'them') {
    const reg = regDoc();
    if (!(await xacNhan(`Thêm vị trí "${a1}" từ danh mục?`))) process.exit(1);
    if (!themTuDanhMuc(reg, a1)) { console.log('Agent đã có trong registry.'); return; }
    regGhi(reg); ghiNhatKy({ loai: 'nhan_su', hanh_dong: 'them', agent_id: a1 });
    console.log(`✅ Đã thêm ${a1}.`);
    return;
  }

  if (lenh === 'duyet') {
    const tep = path.resolve(GOC, a1 || '');
    if (!a1 || !fs.existsSync(tep)) { console.error('Cần đường dẫn tệp đề xuất, ví dụ de-xuat/agent-moi/ten.md'); process.exit(1); }
    let noiDung = fs.readFileSync(tep, 'utf8');
    const fm = docFrontmatter(noiDung);
    if (!fm?.name || !/^[a-z0-9-]{3,40}$/.test(fm.name)) { console.error('Frontmatter thiếu "name" hợp lệ (chữ thường, số, gạch nối).'); process.exit(1); }
    if (!fm.description || fm.description.length < 20) { console.error('Thiếu "description" rõ ràng.'); process.exit(1); }
    const congCu = (fm.tools || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!congCu.length) { console.error('Phải khai báo "tools" (tối thiểu cần thiết).'); process.exit(1); }
    const la = congCu.filter(c => !CONG_CU_HOP_LE.has(c));
    console.log(`Agent: ${fm.name}\nMô tả: ${fm.description}\nCông cụ: ${congCu.join(', ')}`);
    if (la.length) console.log(`⚠️ Công cụ ngoài danh sách chuẩn: ${la.join(', ')} — xem kỹ trước khi duyệt.`);
    if (congCu.includes('Bash') && congCu.includes('WebFetch')) console.log('⚠️ Vừa đọc web vừa chạy lệnh: rủi ro prompt injection cao.');
    const reg = regDoc();
    if (timAgent(reg, fm.name)) { console.error('Tên đã tồn tại trong registry.'); process.exit(1); }
    if (!(await xacNhan('Duyệt agent này vào trạng thái SANDBOX?'))) process.exit(1);
    if (!noiDung.includes('## Luật chung')) noiDung += '\n\n' + fs.readFileSync(path.join(P.mauAgent, '_luat-chung.md'), 'utf8');
    fs.mkdirSync(P.agents, { recursive: true });
    fs.writeFileSync(path.join(P.agents, `${fm.name}.md`), noiDung);
    reg.agents.push({
      agent_id: fm.name, chuc_danh: tuyChon('chuc-danh', fm.name), tuyen: tuyChon('tuyen', 'Tuyến 1 - Sản xuất'), cap: cauHinh().cap,
      nang_luc_duy_nhat: fm.description, tang_tu_chu: 'co_giam_sat', trang_thai: 'sandbox', quality_gate: null, kpi: {},
      nguoi_quan_ly: 'agent-tong', tep: `.claude/agents/${fm.name}.md`, ngay_vao: new Date().toISOString().slice(0, 10),
      lich_su: [{ ts: new Date().toISOString(), su_kien: 'tuyen_dung', trang_thai: 'sandbox', nguon: a1 }],
    });
    regGhi(reg); ghiNhatKy({ loai: 'nhan_su', hanh_dong: 'duyet_moi', agent_id: fm.name });
    console.log(`✅ Đã duyệt ${fm.name} (sandbox). Nhớ thêm quyền ghi/lệnh cho agent này trong he-thong/ban-do-quyen.json rồi chạy: node cong-cu/quan-ly-agent.mjs dau-van-tay`);
    return;
  }

  if (lenh === 'nghi-viec') {
    const reg = regDoc(); const x = timAgent(reg, a1);
    if (!x || a1 === 'agent-tong') { console.error('Không áp dụng.'); process.exit(1); }
    if (!(await xacNhan(`Cho ${a1} nghỉ việc (thu hồi, lưu trữ hồ sơ)?`))) process.exit(1);
    for (const d of [P.agents, P.agentsKhoa]) {
      const t = path.join(d, `${a1}.md`);
      if (fs.existsSync(t)) moveFile(t, path.join(P.luuTru, 'agents', `${a1}-${Date.now()}.md`));
    }
    x.trang_thai = 'nghi_viec';
    x.lich_su.push({ ts: new Date().toISOString(), su_kien: 'nghi_viec' });
    regGhi(reg); ghiNhatKy({ loai: 'nhan_su', hanh_dong: 'nghi_viec', agent_id: a1 });
    console.log(`📦 ${a1} đã nghỉ việc; hồ sơ lưu trong luu-tru/agents/.`);
    return;
  }

  if (lenh === 'nang-cap-cap') {
    // Bản dùng thử chỉ có cấp 1: không đổi cấu hình, không thêm vị trí.
    console.log('Bản dùng thử miễn phí chỉ gồm cấp 1 (Agent Tổng, QA, Edit Video, CSKH soạn nháp).');
    console.log('Cấp 2/3 không có trong bộ này. Muốn dùng cấp 2/3: đặt lịch Audit quy trình miễn phí (gọi video 15 phút qua Zalo/Telegram 0963124791, 9:00–10:00, thứ Hai–thứ Bảy).');
    process.exit(1);
  }

  if (lenh === 'dau-van-tay') {
    if (!(await xacNhan('Xác nhận toàn bộ tệp quản trị hiện tại là đúng ý chủ?'))) process.exit(1);
    const v = capNhatDauVanTay();
    ghiNhatKy({ loai: 'quan_tri', hanh_dong: 'cap_nhat_dau_van_tay', so_tep: Object.keys(v).length });
    console.log(`✅ Đã ghi dấu vân tay ${Object.keys(v).length} tệp quản trị.`);
    return;
  }

  console.log('Lệnh: danh-sach | khoa | mo | trang-thai | them | duyet | nghi-viec | dau-van-tay');
  process.exit(1);
}

// Chỉ chạy main khi gọi trực tiếp (không chạy khi được import)
if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
