# ĐẶC TẢ — MIEN-PHI-KIT 1.0.0 (Bản dùng thử cấp 1)

**Vấn đề.** Chủ doanh nghiệp nhỏ muốn thử nhân sự AI có kiểm soát trước khi trả tiền cài đặt, nhưng cần một bộ tự cài được, an toàn, không lộ dữ liệu.

**Khách.** Chủ shop/doanh nghiệp nhỏ dùng Windows, một người vận hành, không rành kỹ thuật; có hoặc sẵn sàng mua thuê bao Claude.

**Đầu ra.** Thư mục `mien-phi-kit/` (và tệp nén `dist/mien-phi-kit-1.0.0.zip`) gồm Công xưởng SubAgent cấp 1: Agent Tổng, QA, Edit Video, CSKH soạn nháp; hook gác cổng, nhật ký chuỗi băm, dừng khẩn, hàng đợi job, quality gate video/CSKH; README cài 3 bước cho Windows; hồ sơ và bảng giá mẫu trống; giấy phép dùng thử.

**Nguồn.** `san-pham/cong-xuong-subagent` bản 2.0.1. Mã lớp an toàn giữ nguyên.

**Tệp khác bản 2.0.1** (danh sách đủ):
- Sửa: `CLAUDE.md` (còn 4 vị trí cấp 1, thêm luật 10 về giá, mục 7 thêm `bo-nho/bang-gia.md`); `cong-cu/cai-dat.mjs` (chỉ cấp 1, lời nhắn từng dòng, liên hệ Audit gọi video 15 phút); `cong-cu/quan-ly-agent.mjs` (`nang-cap-cap` chỉ in hướng dẫn, liên hệ Audit gọi video 15 phút); `he-thong/ban-do-quyen.json` (chỉ 3 agent con cấp 1); `mau-agent/danh-muc.json` (chỉ 4 mục cấp 1); `mau-agent/cap-1/cskh-soan-nhap.md` (chuyển chủ khi hỏi giá chưa có trong bảng); `.claude/commands/bao-cao.md` (bỏ giao việc cho agent cấp 2/3, thêm `job.mjs danh-sach --tat-ca`); `.claude/commands/khoi-dong.md` (đọc thêm `bo-nho/bang-gia.md`); `.gitignore` (bỏ qua dữ liệu vận hành, bí mật, `dist/`); `README.md`, `CHANGELOG.md`, `san-pham.json` (viết lại cho bản dùng thử).
- Mới: `LICENSE.md`, `bo-nho/bang-gia.md` (mẫu trống), `DAC-TA.md`.
- Bỏ: `mau-agent/cap-2/`, `mau-agent/cap-3/`; các tệp giữ chỗ `.giu` trong thư mục làm việc (trình cài tự tạo thư mục).
- Giữ nguyên từng dòng: `.claude/settings.json`, `.claude/hooks/*`, `.claude/commands/giao-viec.md`, `.claude/commands/kiem-tra.md`, `cong-cu/_chung.mjs`, `job.mjs`, `dung-khan.mjs`, `kiem-tra.mjs`, `bao-cao.mjs`, `kiem-dinh-cskh.mjs`, `kiem-dinh-video.mjs`, `he-thong/cau-hinh.mau.json`, `he-thong/quality-gate/*`, `mau-agent/_luat-chung.md`, `mau-agent/_mau-agent-moi.md`, `mau-agent/cap-1/edit-video.md`, `mau-agent/cap-1/kiem-dinh-chat-luong.md`, `bo-nho/ho-so-ca-nhan-hoa.md`, `bo-nho/mau-vang/README.md`.

**Giới hạn.**
- Không có agent cấp 2/3; `nang-cap-cap` chỉ in hướng dẫn liên hệ.
- Không kèm dữ liệu của bên phát hành (hồ sơ công ty, bảng giá, nhật ký, job, bàn giao, bằng chứng, bí mật, đường dẫn máy).
- Không nêu giá gói trả phí, không hứa kết quả kinh doanh.
- Khách tự trả thuê bao Claude. Bộ không gửi dữ liệu về bên phát hành.
- Dùng cho 1 doanh nghiệp, không bán lại.
