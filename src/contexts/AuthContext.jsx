// AuthContext.jsx
// React Context quản lý trạng thái authentication (đăng nhập) toàn cục.
//
// Tại sao cần Context thay vì đọc localStorage trực tiếp?
//  → Tập trung: 1 nguồn sự thật duy nhất (single source of truth)
//  → Re-render tự động: khi login/logout, tất cả components dùng useAuth() sẽ tự cập nhật
//  → Không cần CustomEvent: trước đây phải dùng window.dispatchEvent để notify Header re-render
//  → Dễ test: có thể mock AuthContext trong tests
//
// Sử dụng:
//  const { user, token, login, logout, isLoggedIn, isAdmin } = useAuth()

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Tạo context với giá trị mặc định (null = chưa đăng nhập)
const AuthContext = createContext(null)

/**
 * AuthProvider: bọc toàn bộ app, cung cấp auth state cho các component con.
 * Đặt ở App.jsx hoặc main.jsx để toàn app đều có thể dùng.
 */
export function AuthProvider({ children }) {
  // user: thông tin user đang đăng nhập (null nếu chưa đăng nhập)
  // Được decode từ JWT payload: { id, email, role, name }
  const [user, setUser] = useState(null)

  // token: JWT string, dùng để gửi kèm API requests
  const [token, setToken] = useState(null)

  /**
   * Đọc auth state từ localStorage khi app khởi động.
   * Dùng useEffect để chỉ chạy 1 lần khi component mount.
   * useCallback để tái sử dụng function (dùng cả trong dependency array).
   */
  const restoreAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('auth_token')
      if (!storedToken) return // Không có token → chưa đăng nhập

      // Decode JWT payload (phần thứ 2, base64 encoded)
      // Format JWT: header.payload.signature
      const parts = storedToken.split('.')
      if (parts.length < 2) return

      // Sửa lỗi font chữ tiếng Việt (UTF-8) khi decode JWT
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      )

      // Kiểm tra token chưa hết hạn
      // exp: timestamp (giây), Date.now(): milliseconds → chia 1000 để compare
      if (payload.exp && payload.exp < Date.now() / 1000) {
        // Token đã hết hạn → xoá khỏi localStorage nhưng trình duyệt vẫn còn cookie refresh_token
        localStorage.removeItem('auth_token')
        // Không return luôn ở đây, vì nếu còn cookie refresh_token thì interceptor sẽ xin lại token.
        // Tuy nhiên ở AuthContext, ta sẽ tạm thời không set token.
        setUser(payload) // Tạm giữ user info
        return
      }

      setToken(storedToken)
      setUser(payload)
    } catch (err) {
      // Token bị corrupt → xoá đi
      localStorage.removeItem('auth_token')
    }
  }, [])

  // Chạy khi app lần đầu load: khôi phục auth state từ localStorage
  useEffect(() => {
    restoreAuth()
  }, [restoreAuth])

  /**
   * Đăng nhập: lưu token + user vào state và localStorage.
   * Được gọi sau khi API login trả về kết quả thành công.
   *
   * @param {string} newToken - JWT token từ API
   * @param {Object} userData - Thông tin user từ API response
   */
  const login = useCallback((accessToken, userData) => {
    // Lưu vào state (để UI re-render ngay lập tức)
    setToken(accessToken)
    setUser(userData)

    // Lưu vào localStorage (để khôi phục khi refresh trang)
    localStorage.setItem('auth_token', accessToken)
    // KHÔNG LƯU REFRESH TOKEN VÀO LOCAL STORAGE NỮA (Backend đã tự set vào Cookie)
    if (userData?.imageUrl) localStorage.setItem('auth_user_image', userData.imageUrl)
    if (userData?.name) localStorage.setItem('auth_user_name', userData.name)
  }, [])

  /**
   * Đăng xuất: xoá token + user khỏi state và localStorage.
   * Sau khi gọi, tất cả component dùng useAuth() sẽ tự re-render.
   */
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)

    // Gọi API logout để revoke refresh token (bất đồng bộ, không cần chờ)
    import('~/apis').then(({ logoutAPI }) => logoutAPI().catch(() => {}))

    // Xoá tất cả dữ liệu auth khỏi localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user_image')
    localStorage.removeItem('auth_user_name')
  }, [])

  // Computed values: tính từ state hiện tại
  const isLoggedIn = Boolean(user && token) // true nếu đã đăng nhập
  const isAdmin = user?.role === 'admin'    // true nếu là admin
  const isCustomer = user?.role === 'customer' // true nếu là customer

  // Context value: mọi thứ cần exposed ra ngoài
  const contextValue = {
    user,        // { id, email, role, name }
    token,       // JWT string
    isLoggedIn,  // boolean: đã đăng nhập chưa
    isAdmin,     // boolean: là admin không
    isCustomer,  // boolean: là customer không
    login,       // function: gọi khi login thành công
    logout       // function: gọi khi đăng xuất
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook để dễ dàng dùng auth state trong bất kỳ component nào.
 *
 * Cách dùng:
 *  const { user, isLoggedIn, login, logout } = useAuth()
 *
 * @throws {Error} Nếu dùng ngoài AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth() phải được dùng bên trong <AuthProvider>. Hãy wrap app trong <AuthProvider>.')
  }
  return context
}

export default AuthContext
