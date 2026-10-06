#!/usr/bin/env node
// GHI NHẬT KÝ (PostToolUse, SubagentStop) — mọi thao tác đều được ghi lại,
// tự che bí mật, nối chuỗi băm để phát hiện sửa/xóa lén.
import fs from 'node:fs';
import { ghiNhatKy } from '../../cong-cu/_chung.mjs';

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch {}

const rut = (o, n = 300) => {
  if (o == null) return '';
  const s = typeof o === 'string' ? o : JSON.stringify(o);
  return s.length > n ? s.slice(0, n) + '…' : s;
};

try {
  if (input.hook_event_name === 'SubagentStop') {
    ghiNhatKy({ loai: 'agent_xong', agent: input.agent_type || input.agent_name || 'khong-ro', phien: input.session_id });
  } else {
    const r = input.tool_response;
    const loi = !!(r && (r.is_error || r.error || (typeof r.exit_code === 'number' && r.exit_code !== 0) || r.interrupted));
    ghiNhatKy({
      loai: 'thao_tac',
      agent: input.agent_type || input.agent_name || 'agent-tong',
      tool: input.tool_name,
      dau_vao: rut(input.tool_input),
      ket_qua: loi ? 'loi' : 'ok',
      phien: input.session_id,
    });
  }
} catch (e) {
  process.stderr.write('Không ghi được nhật ký: ' + e.message + '\n');
}
process.exit(0);
