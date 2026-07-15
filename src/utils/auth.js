export function getUserFromToken() {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    // Giải mã payload JWT ở phần thứ hai (hỗ trợ Tiếng Việt UTF-8)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    )
    return payload
  } catch (err) {
    return null
  }
}

export function getUserRole() {
  const user = getUserFromToken()
  return user?.role || null
}
