# Công xưởng SubAgent — Bản dùng thử cấp 1 (miễn phí)

Sản phẩm của **Giải pháp SubAgent Business** — *Liên tục Tiến Lên*. Phiên bản 1.0.0. Giấy phép: dùng thử miễn phí cho 1 doanh nghiệp, không bán lại (xem mục Giấy phép).

## Giới thiệu

Công xưởng SubAgent là bộ nhân sự AI chạy trên máy tính của bạn bằng **Claude Code**. Agent Tổng nhận việc và giao cho từng Agent con, mỗi agent chỉ làm một việc. Một **khóa kỹ thuật** (hook gác cổng) chặn các thao tác vượt quyền, kể cả khi AI "quên" luật. Mọi thứ gửi ra ngoài (tin nhắn, bài đăng, video) đều dừng ở bản nháp để **bạn duyệt**.

Bản dùng thử gồm **cấp 1 (tối giản), 4 vị trí**:

| Vị trí | Làm gì |
|---|---|
| Agent Tổng | Nhận việc, tạo job, giao đúng agent, theo dõi, báo cáo bạn |
| QA (`kiem-dinh-chat-luong`) | Chấm đầu ra theo tiêu chuẩn đo được, lập biên bản |
| Edit Video (`edit-video`) | Dựng video dọc 9:16 từ footage và brief của bạn |
| CSKH soạn nháp (`cskh-soan-nhap`) | Soạn nháp trả lời tin nhắn khách, đánh dấu ca phải chuyển bạn |

Bộ hợp với người mới bắt đầu, một người vận hành. Bản dùng thử có **đủ toàn bộ lớp an toàn** như bản thương mại.

## Cài đặt

### Yêu cầu máy

| Cần có | Bắt buộc | Cách cài trên Windows |
|---|---|---|
| Windows 10 hoặc 11 | Có | |
| Node.js 18 trở lên (khuyên 22 LTS) | Có | Tải tại https://nodejs.org, bấm Next đến hết. Hoặc trong PowerShell: `winget install OpenJS.NodeJS.LTS` |
| Git for Windows | Có (Claude Code trên Windows cần Git Bash) | Tải tại https://git-scm.com, bấm Next đến hết. Hoặc: `winget install Git.Git` |
| Claude Code | Có | Làm theo hướng dẫn chính thức tại https://claude.com/claude-code (hoặc sau khi có Node.js: `npm install -g @anthropic-ai/claude-code`) |
| Tài khoản Claude | Có | Gói trả phí của Claude hoặc tài khoản API. **Bạn tự đăng ký và tự trả thuê bao trực tiếp cho Anthropic.** Bộ dùng thử miễn phí nhưng không bao gồm phí này. |
| FFmpeg (có ffprobe) | Khi dựng video | `winget install --id Gyan.FFmpeg -e` |

Cài xong phần mềm, **đóng và mở lại** cửa sổ PowerShell để máy nhận lệnh mới. Công cụ trong bộ chỉ dùng thư viện có sẵn của Node.js, không cần `npm install`.

### Cài 3 bước

**Bước 1. Giải nén và mở PowerShell tại thư mục**
Giải nén tệp `mien-phi-kit-1.0.0.zip` (chuột phải, chọn *Extract All*) vào nơi dễ tìm, ví dụ `D:\SubAgent\`. Mở thư mục `mien-phi-kit`, bấm vào thanh địa chỉ phía trên, gõ `powershell` rồi nhấn Enter.

**Bước 2. Chạy trình cài**
Dán lệnh sau vào PowerShell, sửa tên của bạn và tên doanh nghiệp, nhấn Enter:

```powershell
node cong-cu/cai-dat.mjs --chu "Tên của bạn" --thuong-hieu "Tên doanh nghiệp"
```

Trình cài tạo thư mục làm việc, đăng ký 4 vị trí, rồi tự chạy **kiểm tra hệ thống** và **bài tự kiểm thử gác cổng**. Thấy `✅ SẴN SÀNG` là xong.

**Bước 3. Mở Claude Code và khởi động**

```powershell
claude
```

Lần đầu, Claude Code hỏi đăng nhập: **bạn tự đăng nhập** tài khoản Claude của mình. Sau đó gõ `/khoi-dong`. Agent Tổng kiểm kê và đưa bạn danh sách việc cần làm tiếp (điền hồ sơ, bảng giá, mẫu vàng).

### Lệnh tự kiểm tra

Chạy bất cứ lúc nào trong PowerShell, tại thư mục `mien-phi-kit`:

```powershell
node cong-cu/kiem-tra.mjs
```

Lệnh kiểm tra máy (Node.js, Claude Code, FFmpeg), cấu trúc công xưởng, nhân sự, toàn vẹn tệp quản trị và nhật ký, quét rò rỉ bí mật, và tự kiểm thử gác cổng. Kết quả `✅ SẴN SÀNG` là dùng được; có `❌` thì làm theo hướng dẫn in kèm.

Nếu báo **thiếu FFmpeg**, cách nên làm là cài FFmpeg. Trong PowerShell, chạy:

```powershell
winget install --id Gyan.FFmpeg -e
```

Cài xong, **đóng và mở lại** cửa sổ PowerShell rồi chạy lại `node cong-cu/kiem-tra.mjs`.

Nếu bạn chắc chắn không dựng video, bạn có thể cho agent video nghỉ: `node cong-cu/quan-ly-agent.mjs nghi-viec edit-video`. **Lưu ý: đây là thao tác một chiều.** Bộ chưa có lệnh bật lại agent đã nghỉ, và chạy lại `cai-dat.mjs` trong cùng thư mục cũng **không** thêm lại agent này. Muốn dùng lại agent video, bạn phải cài lại bằng `cai-dat.mjs` trên một bản giải nén mới (giải nén `mien-phi-kit-1.0.0.zip` vào thư mục khác). Bản cài mới không có job, nhật ký và bàn giao của bản cũ.

## Cách dùng

### Hằng ngày (gõ trong Claude Code)

| Lệnh | Việc |
|---|---|
| `/khoi-dong` | Kiểm kê, trình Phiếu đề xuất |
| `/giao-viec <mô tả>` | Chạy một việc qua quy trình 7 bước |
| `/bao-cao` | Báo cáo tuần |
| `/kiem-tra` | Kiểm tra toàn hệ thống |

- **Video:** bỏ footage và brief vào `hop-nhan-viec/video/<tên>/`, rồi gõ `/giao-viec Dựng video từ hop-nhan-viec/video/<tên>`.
- **CSKH:** dán tin nhắn khách vào `hop-nhan-viec/cskh/<tên>.json` theo dạng `[{ "ma_hoi_thoai": "...", "ten_khach": "...", "tin_khach": "..." }]`, rồi gõ `/giao-viec Soạn nháp trả lời hop-nhan-viec/cskh/<tên>.json`.
- Nhận kết quả ở `ban-giao/` (bản nháp ở `ban-giao/nhap/`, biên bản QA ở `ban-giao/bang-chung/`). **Bạn tự gửi/đăng** sau khi duyệt.

### Điền thông tin của bạn

- `bo-nho/ho-so-ca-nhan-hoa.md`: tên thương hiệu, sản phẩm, khách hàng, giọng viết, màu, logo.
- `bo-nho/bang-gia.md`: giá và chính sách. Agent CSKH chỉ nói đúng những gì ghi ở đây; ô trống thì chuyển bạn.
- `bo-nho/mau-vang/`: video, tin nhắn mẫu bạn đã duyệt để agent học phong cách.

### Lệnh của CHỦ (chạy trong PowerShell riêng, Agent không chạy được)

```powershell
node cong-cu/dung-khan.mjs bat|tat|trang-thai          # nút dừng khẩn
node cong-cu/quan-ly-agent.mjs danh-sach                # xem nhân sự
node cong-cu/quan-ly-agent.mjs trang-thai edit-video chinh_thuc   # thăng trạng thái
node cong-cu/quan-ly-agent.mjs duyet de-xuat/agent-moi/<ten>.md   # duyệt agent mới do Agent Tổng đề xuất
node cong-cu/quan-ly-agent.mjs mo|nghi-viec <agent>     # mở khóa / cho nghỉ
node cong-cu/quan-ly-agent.mjs dau-van-tay              # xác nhận sau khi chủ tự sửa tệp quản trị
node cong-cu/job.mjs danh-sach --tat-ca                 # xem hàng đợi
node cong-cu/bao-cao.mjs --ngay 7                       # báo cáo
node cong-cu/kiem-tra.mjs                               # kiểm tra toàn hệ thống
```

Chủ sửa `he-thong/*.json` bằng trình soạn thảo (ví dụ Notepad), rồi chạy `node cong-cu/quan-ly-agent.mjs dau-van-tay` để xác nhận. Nếu không, hệ thống cảnh báo "tệp quản trị bị thay đổi ngoài quy trình".

### Cấu trúc thư mục

```
CLAUDE.md                 Điều lệ + vai trò Agent Tổng
LICENSE.md                Giấy phép dùng thử
.claude/settings.json     Luật quyền + gắn hook
.claude/hooks/            gac-cong (chặn), ghi-nhat-ky, khoi-phien
.claude/commands/         /khoi-dong /giao-viec /bao-cao /kiem-tra
.claude/agents/           Agent con đang hoạt động (trình cài tạo)
he-thong/                 cấu hình mẫu, bản đồ quyền, quality gate (chỉ chủ sửa)
mau-agent/                Mẫu 3 agent cấp 1 + mẫu agent mới
cong-cu/                  Công cụ Node.js (không cần cài thêm gói)
bo-nho/                   Hồ sơ, bảng giá (mẫu trống), mẫu vàng
--- trình cài tự tạo khi chạy bước 2 ---
hop-nhan-viec/  hang-doi/  ban-giao/  de-xuat/  nhat-ky/  bao-cao/  luu-tru/
bi-mat/                   Chỉ chủ dùng; Agent bị chặn đọc
```

## An toàn

- **Hook gác cổng** (`.claude/hooks/gac-cong.mjs`) kiểm tra mọi thao tác trước khi Agent làm. Nó chặn: đọc/tìm trong vùng bí mật (`bi-mat/`, `.env`, khóa SSH…); ghi vào tệp quản trị (`he-thong/`, `.claude/`, `cong-cu/`, `mau-agent/`, `nhat-ky/`, `CLAUDE.md`); lệnh xóa; `git push`; nâng quyền hệ thống; chạy mã tải từ internet; gửi dữ liệu ra ngoài; cài/gỡ phần mềm; thay đổi nhân sự/quyền/dừng khẩn; giao việc cho agent ngoài danh sách; công cụ kết nối ngoài (MCP) có thể gửi/đăng/thao tác thay bạn khi bạn chưa cho phép.
- **Duyệt trước khi gửi/đăng:** không agent nào gửi tin, đăng bài, chi tiền hay cam kết. Agent CSKH chỉ soạn nháp và đánh dấu ca phải chuyển bạn (khiếu nại, hoàn tiền, giảm giá, hỏi giá chưa có trong bảng, dấu hiệu lừa AI…). Agent video không đăng video.
- **Nút dừng khẩn:** `node cong-cu/dung-khan.mjs bat`. Khi bật, mọi Agent chỉ còn quyền đọc. Chỉ bạn tắt được, trong PowerShell riêng.
- **Nhật ký chuỗi băm** trong `nhat-ky/`: mỗi thao tác được ghi lại, chuỗi giống bí mật được che, dòng sau móc vào dòng trước nên sửa/xóa lén sẽ bị `kiem-tra.mjs` phát hiện.
- **Dấu vân tay tệp quản trị:** tệp quản trị bị sửa ngoài quy trình sẽ bị cảnh báo đầu phiên và khi kiểm tra.
- **Quyền theo từng agent** trong `he-thong/ban-do-quyen.json`: nơi được ghi, lệnh được chạy. Phần quyền riêng chỉ áp dụng khi Claude Code báo tên agent cho hook; luật chung luôn áp dụng.
- **Hàng đợi và quality gate:** job chống làm trùng, giới hạn số lần thử lại, chỉ chuyển "đạt/bàn giao" khi có biên bản QA.
- **Dữ liệu:** công cụ và dữ liệu nằm trên máy của bạn; bộ không nhúng khóa API và không gửi dữ liệu về bên phát hành. Nội dung Agent đọc được xử lý bởi mô hình AI qua Claude Code theo tài khoản Claude của bạn.
- **Bí mật:** chỉ bạn đặt khóa/mật khẩu vào `bi-mat/`. Không dán mật khẩu, mã xác minh vào cửa sổ Claude Code.

Hook gác cổng là lớp chặn theo luật nhận mẫu; nó không thay được việc bạn duyệt đầu ra trước khi dùng.

## Giấy phép

Dùng thử miễn phí cho **1 doanh nghiệp**, dùng nội bộ. **Không bán lại**, không cho thuê, không đóng gói lại để phân phối. Thuê bao Claude do bạn tự trả cho Anthropic. Chi tiết trong `LICENSE.md`.

## Hỗ trợ

- Zalo / điện thoại / Telegram: 0963124791
- Email: minhaiglobal@gmail.com
- Fanpage Facebook: https://www.facebook.com/profile.php?id=61595252995765
- YouTube: https://www.youtube.com/@subagentbusiness
- TikTok: https://www.tiktok.com/@camsellerai
- GitHub: https://github.com/minhaiglobal-stack

Khi nhờ hỗ trợ, gửi kèm kết quả lệnh `node cong-cu/kiem-tra.mjs`. Không gửi mật khẩu, khóa API hay nội dung thư mục `bi-mat/`.

---

**Muốn cài đặt có hướng dẫn hoặc dùng cấp 2/3? Đặt lịch Audit quy trình 15 phút miễn phí.**
Audit là **gọi video 15 phút** qua Zalo hoặc Telegram **0963124791**, khung giờ **9:00–10:00, thứ Hai đến thứ Bảy**. Nhắn số trên để hẹn giờ gọi.
