# AquaLife - Hệ thống cửa hàng sinh vật cảnh (Aquarium Store)

AquaLife là một ứng dụng web (E-commerce) chuyên cung cấp các sản phẩm sinh vật cảnh, cá cảnh, và phụ kiện thủy sinh. Dự án được xây dựng dựa trên MERN Stack (MongoDB, Express, React, Node.js) với kiến trúc tách biệt hoàn toàn giữa Frontend và Backend.

## 🏗 Kiến trúc dự án

Dự án bao gồm 2 thành phần chính:
- **Aqualife_Web**: Giao diện người dùng (Frontend)
- **Aqualife_Api**: Máy chủ xử lý dữ liệu (Backend)

### Công nghệ sử dụng
**Frontend (Aqualife_Web)**
- **Core**: React 18, Vite
- **UI/UX**: Material UI (MUI), Emotion, Recharts
- **Routing & HTTP**: React Router DOM, Axios
- **Auth**: React OAuth Google (Đăng nhập Google)
- **Testing**: Vitest, React Testing Library

**Backend (Aqualife_Api)**
- **Core**: Node.js, Express.js, Babel (Hỗ trợ ES Modules)
- **Database**: MongoDB (sử dụng Native MongoDB Driver)
- **Security & Auth**: JWT (JSON Web Tokens), bcrypt, Helmet, Express Rate Limit, Google Auth Library
- **Validation**: Joi
- **Khác**: Nodemailer (Gửi OTP qua email)

## 🌟 Chức năng nổi bật

### Dành cho Khách hàng (Customer)
- Đăng ký / Đăng nhập (hỗ trợ đăng nhập trực tiếp qua Google).
- Xác thực email an toàn bằng mã OTP.
- Xem danh sách sản phẩm, lọc và xem chi tiết sản phẩm.
- Thêm sản phẩm vào giỏ hàng, tùy chỉnh số lượng.
- Tiến hành thanh toán và đặt hàng.
- Xem lịch sử đơn hàng, trạng thái đơn và cập nhật hồ sơ cá nhân.

### Dành cho Quản trị viên (Admin)
- Bảng điều khiển (Dashboard) thống kê tổng quan doanh thu trực quan.
- Quản lý Sản phẩm (Thêm, sửa, xóa, xem danh sách).
- Quản lý Đơn hàng (Xem chi tiết, xác nhận đơn hàng đang đợi, hủy đơn hàng).
- Quản lý Khách hàng.

## 🚀 Hướng dẫn cài đặt và chạy dự án (Local Development)

### Yêu cầu môi trường
- Node.js (phiên bản 18.x trở lên)
- Yarn hoặc npm
- Tài khoản MongoDB Atlas (hoặc MongoDB Local)

### 1. Cài đặt Backend (Aqualife_Api)

```bash
cd Aqualife_Api
# Cài đặt dependencies
yarn install
```

Tạo file `.env` trong thư mục `Aqualife_Api` dựa trên file `.env.example` (nếu có) và điền các thông tin:
```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=aqualife
JWT_KEY=your_jwt_secret_key
REFRESH_TOKEN_KEY=your_refresh_token_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
# Các cấu hình gửi mail OTP
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Chạy Backend server:
```bash
yarn dev
```
Backend sẽ khởi chạy tại `http://localhost:1704`.

### 2. Cài đặt Frontend (Aqualife_Web)

```bash
cd Aqualife_Web
# Cài đặt dependencies
yarn install
```

Chạy Frontend server:
```bash
yarn dev
```
Giao diện web sẽ khởi chạy tại `http://localhost:5173`. Bạn có thể truy cập trên trình duyệt để sử dụng.

## 📄 Cấu trúc thư mục tham khảo

```text
d:\project\aquaLife\
 ├── Aqualife_Api/       # Mã nguồn Backend
 │   ├── src/
 │   │   ├── controllers/ # Xử lý logic Request/Response
 │   │   ├── middlewares/ # Middleware (Auth, Error handling...)
 │   │   ├── models/      # MongoDB Schema & DB queries
 │   │   ├── routes/      # Định nghĩa API endpoints
 │   │   ├── services/    # Business logic
 │   │   └── utils/       # Tiện ích dùng chung
 │   └── package.json
 └── Aqualife_Web/       # Mã nguồn Frontend
     ├── src/
     │   ├── apis/        # Cấu hình gọi API bằng Axios
     │   ├── components/  # Layout, Header, Footer...
     │   ├── contexts/    # Context (AuthContext...)
     │   ├── pages/       # Các trang (Home, Admin, Checkout,...)
     │   └── utils/       # Helper functions
     └── package.json
```
