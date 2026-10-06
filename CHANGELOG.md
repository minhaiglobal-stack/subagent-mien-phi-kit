# CHANGELOG — Công xưởng SubAgent, bản dùng thử cấp 1 (MIEN-PHI-KIT)

## 1.1.0 — 2026-10-06

Thêm cách **cài bằng 1 câu với Claude** (chủ duyệt 06/10/2026) và **cố định phiên bản HyperFrames** trong quyền của `edit-video`. Không đổi mã (`.claude/`, `cong-cu/`, `mau-agent/` giữ nguyên).

- **Quyền (chặt hơn):** chủ áp phiếu `de-xuat/2026-10-06-co-dinh-phien-ban-hyperframes.md`. Trong `he-thong/ban-do-quyen.json`, mục `edit-video`, `bash_duoc_phep` đổi `"npx hyperframes"` thành `"npx hyperframes@0.8.137 "` (có dấu cách cuối). Đây là thay đổi duy nhất trong `he-thong/`. Gác cổng so khớp theo phần đầu lệnh, nên agent `edit-video` chỉ chạy được `npx hyperframes@0.8.137 ...`. **Hệ quả:** lệnh `npx hyperframes ...` không ghi phiên bản, hoặc ghi phiên bản khác, sẽ bị chặn; brief video phải ghi đúng phiên bản. **Muốn lên bản mới:** chủ sửa số phiên bản trong chuỗi đó (giữ dấu cách cuối), rồi chạy `node cong-cu/quan-ly-agent.mjs dau-van-tay`.

- **Mới:** `CAI-DAT-1-CAU.md`, hướng dẫn cho Claude (tab Code của ứng dụng Claude, hoặc Claude Code) khi khách dán câu chuẩn: lấy và làm sạch tên công ty/tên khách; kiểm tra Windows, `node --version` (≥ 18), `git --version`, `ffmpeg -version`; đề xuất lệnh winget chính thức (`OpenJS.NodeJS.LTS`, `Git.Git`, `Gyan.FFmpeg`) và chờ khách đồng ý mới cài, xử lý PATH chưa nạp; tải bộ bằng `git clone` vào thư mục trống (hoặc `git init`/`fetch` khi thư mục chỉ có `.claude/settings.local.json`), không có Git thì tải bản nén `main.zip` về thư mục tạm và giải nén bằng `tar --strip-components=1` (bỏ thư mục con `subagent-mien-phi-kit-main`); thư mục không trống thì dừng hỏi; chạy `node cong-cu/cai-dat.mjs --chu "<tên>" --thuong-hieu "<công ty>"`; không chạy lại trình cài khi đã có `he-thong/registry.json`; đọc kết quả kiểm tra (✅ SẴN SÀNG → mở phiên mới, `/khoi-dong`, điền `bo-nho/ho-so-ca-nhan-hoa.md` và `bo-nho/bang-gia.md`; ❌ → giải thích tiếng Việt và cách sửa); luật an toàn khi cài (không nhập mật khẩu/token, không đọc `bi-mat/`, không cài khi chưa đồng ý, không đăng/gửi/xóa).
- `README.md`: thêm mục đầu tiên **Cài nhanh bằng 1 câu với Claude** (3 bước + câu chuẩn) và một dòng dẫn cho Claude tới `CAI-DAT-1-CAU.md`; cách cài thủ công cũ giữ nguyên, đổi tên thành **Cách 2: Cài thủ công 3 bước**; cấu trúc thư mục thêm `CAI-DAT-1-CAU.md`; khẩu hiệu đổi thành "Kỷ Nguyên Vươn Mình. Liên Tục Tiến Lên!"; số phiên bản 1.1.0; mục **Thành phần bên thứ ba** và dòng "Mã bên thứ ba" ở mục An toàn ghi "đã cố định 0.8.137", hướng dẫn lên phiên bản và cách tắt dùng đúng chuỗi `"npx hyperframes@0.8.137 "`.
- `san-pham.json`: `phien_ban` 1.1.0; `khau_hieu` mới; trong `thanh_phan_ben_thu_ba`, trường `phien_ban_khuyen_nghi` đổi thành `phien_ban_co_dinh` và thêm `co_dinh_tai`; `mo_ta_ngan` nêu cách cài 1 câu; yêu cầu máy ghi ứng dụng Claude (tab Code) hoặc Claude Code; thêm `CAI-DAT-1-CAU.md` vào `tep_cot_loi`.
- `DAC-TA.md`: thêm phần cài bằng 1 câu; ghi thay đổi quyền HyperFrames.
- `CAI-DAT-1-CAU.md`: Git ghi là cần có, giống README; thiếu Git thì vẫn tải được bằng bản nén.

## 1.0.1 — 2026-10-06

Bản vá tài liệu (không đổi mã, không đổi quyền). Ghi rõ nguồn và giấy phép của thành phần bên thứ ba mà agent `edit-video` được phép gọi (`npx hyperframes`), đồng bộ với Công xưởng SubAgent 2.0.2.

- `README.md`: thêm mục **Thành phần bên thứ ba** (HyperFrames: là gì, bên phát hành HeyGen, giấy phép Apache-2.0, mã nguồn https://github.com/heygen-com/hyperframes, agent `edit-video` dùng để làm gì, `npx` tải gói từ npm khi chạy, khuyến nghị cố định `npx hyperframes@0.8.137`, cách tắt mà vẫn dựng bằng FFmpeg); thêm một dòng ở mục An toàn và một dòng "Mạng internet khi chạy HyperFrames (tùy chọn)" ở bảng yêu cầu máy; số phiên bản 1.0.1; tên tệp nén ghi chung `mien-phi-kit-<phiên bản>.zip`.
- `san-pham.json`: `phien_ban` 1.0.1; thêm yêu cầu máy tùy chọn về mạng khi dùng HyperFrames; thêm trường `thanh_phan_ben_thu_ba`. Trường `nguon` giữ 2.0.1 (mã lấy từ 2.0.1; 2.0.2 chỉ vá tài liệu).
- `DAC-TA.md`: ghi phiên bản 1.0.1 và thêm mục Thành phần bên thứ ba.

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
