# Hướng dẫn cho Gemini (GEMINI.md)

## 🎯 Tổng quan dự án

- **Tên:** Portfolio cá nhân + trang web các nhân có các chức năng riêng biệt hỗ trợ người sử dụng
- **Mục tiêu:** :
    1. Trang chủ / sẽ là Portfolio cá nhân
    2. Có /login
    3. Có phân quyền người dùng
    4. Các trang chức năng riêng biệt /admin (tổng hợp chức năng của admin), /dashboard (tổng hợp chức năng của user)
    5. Các tính năng chính /notes: Lưu trữ, tạo các ghi chú của người dùng, /upload: Nơi upload ảnh video của người dùng, /2fa: Nơi hiển thị các mã xác thực 2 yếu tố dựa trên các mã người dùng đưa cho và lưu giữ, /admin/users: Nơi quản lý người dùng của Admin
- **Công cụ:**
    1. Next.js, Tailwind CSS, TypeScript,
    2. Cloudfare R2 để lưu trữ ảnh, video
    3. Edge Config store để lưu trữ các thông tin trên trang chính / như là các project, works, social, vv
    4. Neon database để lưu thông tin người dùng, notes, 2fa,...

## 💻 Quy ước viết mã

- Sử dụng **TypeScript** nghiêm ngặt.
- Viết dễ hiểu rõ ràng
- Code bằng các phương pháp đơn giản, không phức tạp hoá vấn đề
- Đặt tên biến và hàm bằng tiếng Anh, nhưng giải thích (comments) bằng **tiếng Việt**.
- Sử dụng **Tailwind CSS** để định dạng giao diện.
- Giao diện cần nhất quán với nhau, có thể lấy mẫu là trang / giao diện theo phong cách tối dark grey đơn giản, hiện đại có sử dụng các bo góc cho các ô vv, giống với giao diện của IOS(từ 18.7 đổ xuống)
- Các phần của backend cần tối giản chính xác, đặt tên phải phù hợp
- Các component cần có sự thống nhất, các css của tailwinds cần áp dụng 1 bảng màu chung thống nhất ở 1 file sau đó dùng lại ở các file khác
- Sau khi làm xong tạo 1 file README.MD để giúp người dùng hiểu rõ dự án, và cần triển khai những gì, chức năng dự án vv

## 📁 Cấu trúc quan trọng

- `/components`: Chứa các thành phần UI dùng lại.
- Website sẽ có các link như sau
    - /
    - /login
    - /admin
    - /admin/notes
    - /admin/uploads
    - /admin/2fa
    - /admin/users
    - /dashboard
    - /dashboard/notes
    - /dashboard/uploads
    - /dashboard/2fa

## ⚠️ Lưu ý quan trọng

- Luôn kiểm tra lỗi (error handling) trong các hàm gọi API.
- Đảm bảo mã nguồn tối ưu cho hiệu năng và dễ đọc.
- Đảm bảo việc bị lộ các thông tin quan trọng thông qua API vv
