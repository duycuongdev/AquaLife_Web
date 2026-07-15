// NotFound.jsx
// Trang 404 - hiển thị khi người dùng vào URL không tồn tại.
// Thiết kế thân thiện với người dùng: không chỉ thông báo lỗi mà còn giúp họ thoát ra.

import { Box, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
export default function NotFound() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Nội dung chính: căn giữa màn hình */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          px: 3,
          background: 'linear-gradient(135deg, #f0f8f9 0%, #e8f4f8 100%)'
        }}
      >
        {/* Số 404 lớn - visual cue trực quan */}
        <Typography
          sx={{
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #0b8798, #3ba8b8)',
            WebkitBackgroundClip: 'text',      // Gradient text effect
            WebkitTextFillColor: 'transparent',
            mb: 2,
            // Animation: nhẹ nhàng nổi lên xuống
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' }
            }
          }}
        >
          404
        </Typography>

        {/* Icon cá (emoji) thay vì ảnh - nhẹ hơn và thân thiện */}
        <Typography sx={{ fontSize: '3rem', mb: 2 }}>🐠</Typography>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#0b2f3a' }}>
          Trang không tìm thấy
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          Có vẻ như con cá đã lạc đường mất rồi! Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>

        {/* Các lựa chọn để user thoát khỏi 404 */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            size="large"
            sx={{
              bgcolor: '#0b8798',
              '&:hover': { bgcolor: '#076070' }
            }}
          >
            🏠 Về Trang Chủ
          </Button>

          <Button
            variant="outlined"
            component={RouterLink}
            to="/products"
            size="large"
            sx={{ borderColor: '#0b8798', color: '#0b8798' }}
          >
            🛍️ Xem Sản Phẩm
          </Button>
        </Box>
      </Box>

    </Box>
  )
}
