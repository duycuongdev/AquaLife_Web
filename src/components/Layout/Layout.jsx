// Layout.jsx
// Layout chung cho các trang khách hàng (customer pages).
// Bọc Header + main content + Footer để tránh duplicate code.
//
// Trước đây mỗi page phải import và render Header + Footer riêng:
//  Home.jsx: <Header /> ... <Footer />
//  Shop.jsx: <Header /> ... <Footer />
//  Cart.jsx: <Header /> ... <Footer />
//
// Bây giờ chỉ cần dùng Layout:
//  App.jsx: <Route element={<Layout><Home /></Layout>} />
//
// Lợi ích:
//  → DRY (Don't Repeat Yourself): Header/Footer chỉ import 1 lần
//  → Dễ thay đổi: sửa layout ở 1 nơi → áp dụng tất cả pages

import { Box } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'

/**
 * Layout cho customer pages: Header + content + Footer.
 *
 * @param {React.ReactNode} children - Nội dung trang (được đặt giữa Header và Footer)
 */
export default function Layout({ children }) {
  return (
    // Flex column: Header trên, content giữa (flex:1 để fill space), Footer dưới
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* main: HTML5 semantic element - giúp SEO và accessibility */}
      <Box
        component="main"
        sx={{
          flex: 1,                                      // Chiếm toàn bộ không gian còn lại
          background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' // Gradient nhẹ cho background
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  )
}
