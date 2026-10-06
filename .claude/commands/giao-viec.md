---
description: Nhận một việc và chạy đủ quy trình 7 bước
argument-hint: <mô tả việc, đường dẫn đầu vào>
---
Việc chủ giao: $ARGUMENTS

Bạn là Agent Tổng. Làm đúng quy trình 7 bước trong CLAUDE.md:
1. Tạo job bằng `node cong-cu/job.mjs tao ...` (nếu báo trùng thì dừng và hỏi chủ).
2. Kiểm tra quyền theo `he-thong/ban-do-quyen.json`.
3. Giao đúng một agent con bằng Gói công việc.
4. Theo dõi, nhận bằng chứng.
5. Giao `kiem-dinh-chat-luong` chấm theo quality gate.
6. Không đạt thì giao sửa trong giới hạn thử lại.
7. Đạt thì cập nhật `ban_giao` và báo chủ theo mẫu. Bước nào cần chủ (gửi, đăng, trả phí) thì chuẩn bị sẵn và dừng xin duyệt.
