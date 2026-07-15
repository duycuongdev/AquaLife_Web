// App.jsx
// Component gốc của ứng dụng - định nghĩa routing và cấu trúc app.
//
// Kiến trúc mới:
//  BrowserRouter → AuthProvider → Routes
//   ↳ Public routes (ai cũng vào được): Home, Shop, ProductDetail, Introduce, Contact, Login
//   ↳ Protected routes (cần đăng nhập): Cart, Checkout, Profile, Orders, OrderDetail
//   ↳ Admin routes (cần đăng nhập + role admin): /admin/*
//   ↳ Catch-all: * → NotFound (404)
//
// Layout component bọc Header + Footer để tránh duplicate ở từng page.

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GlobalStyles from '@mui/material/GlobalStyles'

// Auth Context: cung cấp auth state cho toàn app
import { AuthProvider } from '~/contexts/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from '~/utils/constants'

// Layout và Guard components
import Layout from '~/components/Layout/Layout'
import ProtectedRoute from '~/components/ProtectedRoute/ProtectedRoute'

// Customer Pages (public)
import Home from '~/pages/Home/Home'
// Auth Pages
import AuthLayout from '~/pages/Auth/AuthLayout'
import Login from '~/pages/Auth/Login'
import Register from '~/pages/Auth/Register'
import Shop from '~/pages/Shop/Shop'
import ProductDetail from '~/pages/ProductDetail/ProductDetail'
import Introduce from '~/pages/Introduce/Introduce'
import Contact from '~/pages/Contact/Contact'

// Customer Pages (protected - cần đăng nhập)
import Cart from '~/pages/Cart/Cart'
import Checkout from '~/pages/Checkout/Checkout'
import Profile from '~/pages/Profile/Profile'
import Orders from '~/pages/Orders/Orders'
import OrderDetail from '~/pages/OrderDetail/OrderDetail'

// Admin Pages (protected - cần role admin)
import Admin from '~/pages/Admin/Admin'

// 404 Page
import NotFound from '~/pages/NotFound/NotFound'

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        {/* AuthProvider: bọc toàn app để useAuth() hoạt động ở mọi component */}
        <AuthProvider>
        {/* GlobalStyles: reset CSS cơ bản áp dụng cho tất cả elements */}
        <GlobalStyles
          styles={{
            '*': {
              margin: 0,
              padding: 0,
              boxSizing: 'border-box'
            },
            // Custom scrollbar (chỉ Webkit: Chrome, Safari, Edge)
            '::-webkit-scrollbar': { width: '6px' },
            '::-webkit-scrollbar-track': { background: '#f1f1f1' },
            '::-webkit-scrollbar-thumb': {
              background: '#0b8798',
              borderRadius: '3px'
            },
            '::-webkit-scrollbar-thumb:hover': { background: '#076070' }
          }}
        />

        <Routes>
          {/* ─── Public Routes (không cần đăng nhập) ───────────────────────── */}
          {/* Layout bọc Header + Footer cho tất cả public customer pages */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Shop /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/introduce" element={<Layout><Introduce /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />

          {/* Trang đăng nhập/đăng ký với layout riêng */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* ─── Protected Customer Routes (cần đăng nhập) ─────────────────── */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Layout><Cart /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Layout><Checkout /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute>
                <Layout><Orders /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <Layout><OrderDetail /></Layout>
              </ProtectedRoute>
            }
          />

          {/* ─── Admin Routes (cần đăng nhập + role admin) ──────────────────── */}
          {/* Admin có layout riêng (sidebar) nên không dùng Layout customer */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* ─── 404 Catch-all Route ─────────────────────────────────────────── */}
          {/* Phải đặt CUỐI CÙNG - khớp với mọi URL không match routes nào ở trên */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
  )
}
