import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

const client = axios.create({ 
  baseURL: API_ROOT,
  withCredentials: true // Tự động đính kèm HTTP-Only Cookie vào mọi request
})

// Gắn token từ localStorage cho các request cần xác thực
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (err) {
    // Bỏ qua lỗi localStorage
  }
  return config
})

// Bắt lỗi 401 để tự động gọi Refresh Token
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Nếu lỗi là 401 và request chưa được thử lại lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Gọi API refresh token. 
        // Không cần truyền tham số vì Http-Only cookie chứa refresh_token sẽ tự động gửi kèm
        const res = await axios.post(`${API_ROOT}/v1/auth/refresh-token`, {}, { withCredentials: true })
        
        const newAccessToken = res.data.accessToken
        // Lưu lại token mới
        localStorage.setItem('auth_token', newAccessToken)

        // Sửa lại header và thử lại request gốc
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return client(originalRequest)
      } catch (refreshErr) {
        // Đổi token thất bại (cookie hết hạn hoặc không hợp lệ) → bắt buộc logout
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user_image')
        localStorage.removeItem('auth_user_name')
        
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export const registerAPI = async (data) => {
  const response = await client.post('/v1/auth/register', data)
  return response.data
}

// API Gửi mã OTP xác thực email
export const sendOtpAPI = async (email) => {
  const response = await client.post('/v1/auth/send-otp', { email })
  return response.data
}

export const loginAPI = async (data) => {
  const response = await client.post('/v1/auth/login', data)
  return response.data
}

export const logoutAPI = async () => {
  const response = await client.delete('/v1/auth/logout')
  return response.data
}

export const getCustomerAPI = async (id) => {
  const response = await client.get(`/v1/users/${id}`)
  return response.data
}

export const updateCustomerAPI = async (id, data) => {
  const response = await client.put(`/v1/users/${id}`, data)
  return response.data
}

export const getCustomersAPI = async () => {
  const response = await client.get('/v1/users')
  return response.data
}

// API đăng nhập bằng Google
export const googleLoginAPI = async (idToken) => {
  const response = await client.post('/v1/auth/google-login', { idToken })
  return response.data
}

// Danh mục
export const getCategoriesAPI = async () => {
  const response = await client.get('/v1/categories')
  return response.data
}

export const createCategoryAPI = async (data) => {
  const response = await client.post('/v1/categories', data)
  return response.data
}

// Sản phẩm
export const createProductAPI = async (data) => {
  const response = await client.post('/v1/products', data)
  return response.data
}

export const getProductsAPI = async () => {
  const response = await client.get('/v1/products')
  return response.data
}

export const getProductAPI = async (id) => {
  const response = await client.get(`/v1/products/${id}`)
  return response.data
}

export const deleteProductAPI = async (id) => {
  const response = await client.delete(`/v1/products/${id}`)
  return response.data
}

export const updateProductAPI = async (id, data) => {
  const response = await client.put(`/v1/products/${id}`, data)
  return response.data
}


export const deleteAllProductsAPI = async () => {
  const response = await client.delete('/v1/products')
  return response.data
}

// Khuyến mãi
export const getPromosAPI = async () => {
  const response = await client.get('/v1/promos')
  return response.data
}

export const validatePromoAPI = async (code, total) => {
  const response = await client.post('/v1/promos/validate', { code, total })
  return response.data
}


// Đơn hàng
export const createOrderAPI = async (data) => {
  const response = await client.post('/v1/orders', data)
  return response.data
}

export const getCustomerOrdersAPI = async () => {
  const response = await client.get('/v1/orders')
  return response.data
}

export const getOrdersAPI = async () => {
  const response = await client.get('/v1/orders')
  return response.data
}

export const updateOrderAPI = async (id, data) => {
  const response = await client.put(`/v1/orders/${id}`, data)
  return response.data
}

export const getOrderAPI = async (id) => {
  const response = await client.get(`/v1/orders/${id}`)
  return response.data
}

export const createOrderDetailAPI = async (data) => {
  const response = await client.post('/v1/order-details', data)
  return response.data
}

export const getOrderDetailsAPI = async (orderId) => {
  const response = await client.get('/v1/order-details', { params: { orderId } })
  return response.data
}

// Thanh toán
export const createPaymentAPI = async (data) => {
  const response = await client.post('/v1/payments', data)
  return response.data
}

// Đánh giá
export const getReviewsAPI = async (productId) => {
  const response = await client.get('/v1/reviews', { params: { product_id: productId } })
  return response.data
}

export const createReviewAPI = async (data) => {
  const response = await client.post('/v1/reviews', data)
  return response.data
}

// Giỏ hàng
export const createCartAPI = async () => {
  const response = await client.post('/v1/carts')
  return response.data
}

export const getMyCartAPI = async () => {
  const response = await client.get('/v1/carts/my-cart')
  return response.data
}

export const clearCartAPI = async (cartId) => {
  const response = await client.delete(`/v1/carts/${cartId}/clear`)
  return response.data
}

// Chi tiết giỏ hàng
export const addItemToCartAPI = async (cartId, data) => {
  const response = await client.post(`/v1/cart-items/${cartId}`, data)
  return response.data
}

export const updateCartItemAPI = async (itemId, data) => {
  const response = await client.put(`/v1/cart-items/${itemId}`, data)
  return response.data
}

export const removeCartItemAPI = async (itemId) => {
  const response = await client.delete(`/v1/cart-items/${itemId}`)
  return response.data
}

