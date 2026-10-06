# CHANGELOG — Công xưởng SubAgent, bản dùng thử cấp 1 (MIEN-PHI-KIT)

## 1.0.0 — 2026-10-06

Bản dùng thử miễn phí đầu tiên, đóng gói từ Công xưởng SubAgent 2.0.1.

- **Chỉ cấp 1, 4 vị trí:** Agent Tổng, QA (`kiem-dinh-chat-luong`), Edit Video (`edit-video`), CSKH soạn nháp (`cskh-soan-nhap`). Không kèm mẫu agent cấp 2/3.
- **Giữ nguyên lớp an toàn của bản thương mại:** hook gác cổng `gac-cong.mjs`, nhật ký chuỗi băm `ghi-nhat-ky.mjs`, hook đầu phiên `khoi-phien.mjs`, dấu vân tay tệp quản trị, nút dừng khẩn `dung-khan.mjs`, hàng đợi job chống trùng và giới hạn thử lại, bắt buộc có biên bản QA trước khi "đạt/bàn giao", quality gate video và CSKH. Mã các phần này không đổi so với 2.0.1.
- `cong-cu/cai-dat.mjs`: chỉ nhận cấp 1 (bỏ `--cap` cũng được); lời nhắn bước tiếp theo tách lệnh từng dòng cho PowerShell; ghi rõ Audit là gọi video 15 phút qua Zalo/Telegram, 9:00–10:00, thứ Hai–thứ Bảy.
- `cong-cu/quan-ly-agent.mjs`: lệnh `nang-cap-cap` chỉ báo hướng dẫn, không đổi cấu hình (bản dùng thử không có cấp 2/3), kèm thông tin Audit gọi video 15 phút. Các lệnh khác giữ nguyên.
- `mau-agent/danh-muc.json` và `he-thong/ban-do-quyen.json`: chỉ còn 4 vị trí cấp 1. Bỏ `mau-agent/cap-2/` và `mau-agent/cap-3/`.
- `CLAUDE.md`: bảng tổ chức còn 4 vị trí cấp 1, cấm tự tạo agent thay vị trí cấp 2/3; thêm luật 10 (giá chỉ lấy từ `bo-nho/bang-gia.md`, ô trống thì chuyển chủ); mục Bộ nhớ thêm `bo-nho/bang-gia.md`.
- `mau-agent/cap-1/cskh-soan-nhap.md`: khách hỏi giá chưa có trong bảng giá thì chuyển chủ; giá chỉ nêu đúng như chủ điền.
- `.claude/commands/bao-cao.md`: không còn giao việc cho agent cấp 2/3; thêm `node cong-cu/job.mjs danh-sach --tat-ca`.
- `.claude/commands/khoi-dong.md`: đọc thêm `bo-nho/bang-gia.md` khi kiểm kê.
- **Mới:** `bo-nho/bang-gia.md` (mẫu trống), `LICENSE.md` (giấy phép dùng thử), `DAC-TA.md`.
- `.gitignore`: viết lại, bỏ qua bí mật, dữ liệu vận hành và `dist/`.
- README viết lại cho người dùng Windows: yêu cầu máy, cài 3 bước, lệnh tự kiểm tra, mục An toàn, giấy phép dùng thử. Hướng dẫn thiếu FFmpeg ưu tiên `winget install --id Gyan.FFmpeg -e`; ghi rõ `nghi-viec edit-video` là thao tác một chiều. Audit ghi rõ là gọi video 15 phút.
- Giữ nguyên từng dòng so với 2.0.1: `.claude/settings.json`, `.claude/hooks/*`, `.claude/commands/giao-viec.md`, `.claude/commands/kiem-tra.md`, `cong-cu/_chung.mjs`, `job.mjs`, `dung-khan.mjs`, `kiem-tra.mjs`, `bao-cao.mjs`, `kiem-dinh-cskh.mjs`, `kiem-dinh-video.mjs`, `he-thong/cau-hinh.mau.json`, `he-thong/quality-gate/*`, `mau-agent/_luat-chung.md`, `mau-agent/_mau-agent-moi.md`, `mau-agent/cap-1/edit-video.md`, `mau-agent/cap-1/kiem-dinh-chat-luong.md`, `bo-nho/ho-so-ca-nhan-hoa.md`, `bo-nho/mau-vang/README.md`.
- Gói sạch dữ liệu: không có hồ sơ, bảng giá, nhật ký, job, bàn giao, bằng chứng, bí mật hay đường dẫn máy của bên phát hành.
