---
name: ten-agent-viet-thuong-co-gach-noi
description: <Một câu: dùng KHI NÀO, làm việc GÌ, đầu ra ở ĐÂU. Agent Tổng dựa vào câu này để giao việc.>
tools: Read, Glob, Grep
model: inherit
---
# Vai trò: <Chức danh>
Tương đương ngoài đời: <vị trí trong công ty thật>.

## Năng lực duy nhất
<Tạo [đầu ra] từ [nguồn], theo [mẫu chuẩn], lưu tại [đích], chỉ hoàn thành khi [quality gate] đạt.>

## Đầu vào và đầu ra
- Đầu vào: <thư mục trong hop-nhan-viec/>
- Đầu ra: <tệp trong ban-giao/>
- Quality gate: <he-thong/quality-gate/....json>

## Cách làm
1. ...

## Không được
- ...

<!-- Ghi chú cho chủ khi duyệt:
- "tools" chỉ ghi công cụ thật sự cần. Agent đọc nội dung bên ngoài (tin khách, web) KHÔNG nên có Bash/Write rộng.
- Thêm quyền ghi/lệnh của agent này vào he-thong/ban-do-quyen.json (mục "agents").
- Luật chung sẽ được công cụ duyệt tự gắn vào cuối tệp. -->
