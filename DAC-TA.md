# ĐẶC TẢ — MIEN-PHI-KIT 1.1.0 (Bản dùng thử cấp 1)

*1.1.0 (06/10/2026): thêm cài bằng 1 câu với Claude (tệp mới `CAI-DAT-1-CAU.md`, mục mới đầu README), đổi khẩu hiệu, cố định quyền HyperFrames của `edit-video` thành `"npx hyperframes@0.8.137 "` trong `he-thong/ban-do-quyen.json` (chặt hơn; chủ áp phiếu `de-xuat/2026-10-06-co-dinh-phien-ban-hyperframes.md`). Không đổi mã (`.claude/`, `cong-cu/`, `mau-agent/` giữ nguyên). Xem mục "Cài bằng 1 câu" và "Thành phần bên thứ ba" cuối đặc tả.*

*1.0.1 (06/10/2026): bản vá tài liệu, không đổi mã/quyền; thêm mục Thành phần bên thứ ba (HyperFrames) ở README, `san-pham.json` và cuối đặc tả này. Danh sách "Tệp khác bản 2.0.1" bên dưới vẫn đúng cho phần mã.*

**Vấn đề.** Chủ doanh nghiệp nhỏ muốn thử nhân sự AI có kiểm soát trước khi trả tiền cài đặt, nhưng cần một bộ tự cài được, an toàn, không lộ dữ liệu.

**Khách.** Chủ shop/doanh nghiệp nhỏ dùng Windows, một người vận hành, không rành kỹ thuật; có hoặc sẵn sàng mua thuê bao Claude.

**Đầu ra.** Thư mục `mien-phi-kit/` (và tệp nén `dist/mien-phi-kit-<phiên bản>.zip`, bản 1.1.0 cần đóng gói lại; `dist/` hiện chỉ có bản 1.0.0) gồm Công xưởng SubAgent cấp 1: Agent Tổng, QA, Edit Video, CSKH soạn nháp; hook gác cổng, nhật ký chuỗi băm, dừng khẩn, hàng đợi job, quality gate video/CSKH; README cài 3 bước cho Windows; hồ sơ và bảng giá mẫu trống; giấy phép dùng thử.

**Nguồn.** `san-pham/cong-xuong-subagent` bản 2.0.1. Mã lớp an toàn giữ nguyên.

**Tệp khác bản 2.0.1** (danh sách đủ):
- Sửa: `CLAUDE.md` (còn 4 vị trí cấp 1, thêm luật 10 về giá, mục 7 thêm `bo-nho/bang-gia.md`); `cong-cu/cai-dat.mjs` (chỉ cấp 1, lời nhắn từng dòng, liên hệ Audit gọi video 15 phút); `cong-cu/quan-ly-agent.mjs` (`nang-cap-cap` chỉ in hướng dẫn, liên hệ Audit gọi video 15 phút); `he-thong/ban-do-quyen.json` (chỉ 3 agent con cấp 1; từ 1.1.0 quyền HyperFrames của `edit-video` cố định thành `"npx hyperframes@0.8.137 "`, bản bán 2.0.3 cũng đổi giống vậy); `mau-agent/danh-muc.json` (chỉ 4 mục cấp 1); `mau-agent/cap-1/cskh-soan-nhap.md` (chuyển chủ khi hỏi giá chưa có trong bảng); `.claude/commands/bao-cao.md` (bỏ giao việc cho agent cấp 2/3, thêm `job.mjs danh-sach --tat-ca`); `.claude/commands/khoi-dong.md` (đọc thêm `bo-nho/bang-gia.md`); `.gitignore` (bỏ qua dữ liệu vận hành, bí mật, `dist/`); `README.md`, `CHANGELOG.md`, `san-pham.json` (viết lại cho bản dùng thử).
- Mới: `LICENSE.md`, `bo-nho/bang-gia.md` (mẫu trống), `DAC-TA.md`.
- Bỏ: `mau-agent/cap-2/`, `mau-agent/cap-3/`; các tệp giữ chỗ `.giu` trong thư mục làm việc (trình cài tự tạo thư mục).
- Giữ nguyên từng dòng: `.claude/settings.json`, `.claude/hooks/*`, `.claude/commands/giao-viec.md`, `.claude/commands/kiem-tra.md`, `cong-cu/_chung.mjs`, `job.mjs`, `dung-khan.mjs`, `kiem-tra.mjs`, `bao-cao.mjs`, `kiem-dinh-cskh.mjs`, `kiem-dinh-video.mjs`, `he-thong/cau-hinh.mau.json`, `he-thong/quality-gate/*`, `mau-agent/_luat-chung.md`, `mau-agent/_mau-agent-moi.md`, `mau-agent/cap-1/edit-video.md`, `mau-agent/cap-1/kiem-dinh-chat-luong.md`, `bo-nho/ho-so-ca-nhan-hoa.md`, `bo-nho/mau-vang/README.md`.

**Giới hạn.**
- Không có agent cấp 2/3; `nang-cap-cap` chỉ in hướng dẫn liên hệ.
- Không kèm dữ liệu của bên phát hành (hồ sơ công ty, bảng giá, nhật ký, job, bàn giao, bằng chứng, bí mật, đường dẫn máy).
- Không nêu giá gói trả phí, không hứa kết quả kinh doanh.
- Khách tự trả thuê bao Claude. Bộ không gửi dữ liệu về bên phát hành.
- Dùng cho 1 doanh nghiệp, không bán lại.

**Thành phần bên thứ ba.**
- `hyperframes` (gói npm, HeyGen, giấy phép Apache-2.0, mã nguồn https://github.com/heygen-com/hyperframes). Không kèm trong bộ; agent `edit-video` được phép gọi `npx hyperframes@0.8.137` (tải từ npm khi chạy, cần mạng) để dựng đồ họa HTML. Từ 1.1.0, phiên bản **đã cố định** bằng quyền `"npx hyperframes@0.8.137 "` (có dấu cách cuối) trong `he-thong/ban-do-quyen.json`. Lệnh không ghi phiên bản, hoặc ghi phiên bản khác, bị gác cổng chặn. Muốn lên bản mới: chủ sửa số phiên bản trong chuỗi (giữ dấu cách cuối), rồi chạy `node cong-cu/quan-ly-agent.mjs dau-van-tay`. Tắt được bằng cách xóa mục `"npx hyperframes@0.8.137 "` khỏi quyền; khi đó vẫn dựng bằng FFmpeg. Tra cứu ngày 06/10/2026.

**Cài bằng 1 câu (1.1.0).**
- *Vấn đề:* khách không rành kỹ thuật ngại mở PowerShell, giải nén, gõ lệnh.
- *Trải nghiệm mục tiêu:* khách đã cài ứng dụng Claude và đăng nhập gói trả phí → mở tab Code, chọn thư mục trống → dán câu chuẩn "Cài bản dùng thử Công xưởng SubAgent từ https://github.com/minhaiglobal-stack/subagent-mien-phi-kit vào thư mục này. Tên công ty tôi là ___, tên tôi là ___." → chỉ bấm Cho phép → thấy ✅ SẴN SÀNG và hướng dẫn mở phiên mới, gõ `/khoi-dong`.
- *Đầu ra:* `CAI-DAT-1-CAU.md` (hướng dẫn cho Claude, có điều kiện kiểm tra và xử lý lỗi từng bước) và mục đầu README.
- *Giới hạn:* hướng dẫn cài phần mềm viết cho Windows; khách phải tự đồng ý cài phần mềm và tự bấm hộp thoại quyền của Windows; Điều lệ và khóa an toàn của công xưởng chỉ có hiệu lực từ phiên mới mở trong thư mục (phiên cài đặt chạy với luật của Claude và quyền khách cho phép); nếu khách đã cài trước đó, Claude không cài lại (cài lại là lệnh của chủ trong PowerShell), chỉ chạy kiểm tra; thiếu FFmpeg thì kết quả kiểm tra còn 1 lỗi cho tới khi cài FFmpeg; tệp trong kho GitHub chỉ cập nhật khi chủ phát hành.
