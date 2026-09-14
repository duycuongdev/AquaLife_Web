// ProtectedRoute.jsx
// Component bảo vệ các route cần đăng nhập hoặc role cụ thể.
//
// Cách hoạt động:
//  → Nếu chưa đăng nhập → redirect về trang đăng nhập
//  → Nếu đã đăng nhập nhưng không đúng role → redirect về trang 403
//  → Nếu đủ điều kiện → render children bình thường
//
// Cách dùng:
//  <ProtectedRoute>              → Chỉ cần đăng nhập
//    <ProfilePage />
//  </ProtectedRoute>
//
//  <ProtectedRoute requiredRole="admin">  → Cần đăng nhập + phải là admin
//    <AdminPage />
//  </ProtectedRoute>

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '~/contexts/AuthContext'

/**
 * ProtectedRoute - Bảo vệ route dựa trên auth state.
 *
 * @param {React.ReactNode} children - Component cần bảo vệ
 * @param {string} [requiredRole] - Role cần có để vào (undefined = chỉ cần đăng nhập)
 * @param {string} [redirectTo] - URL redirect nếu không đủ quyền
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login'
}) {
  const { isLoggedIn, user, isInitializing } = useAuth()
  const location = useLocation() // Lưu URL hiện tại để redirect về sau khi login

  // Nếu đang khôi phục trạng thái auth từ localStorage, không render gì hoặc render loading
  if (isInitializing) {
    return null
  }

  // Chưa đăng nhập → redirect về trang login
  // state.from: lưu URL hiện tại, trang login sẽ redirect về đây sau khi login thành công
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Đã đăng nhập nhưng sai role → redirect về trang chủ
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  // Đủ điều kiện → render component được bảo vệ
  return children
}
