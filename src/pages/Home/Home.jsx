// Home.jsx
// Trang chủ của AquaLife - điểm đầu tiên khách hàng thấy khi vào web.
//
// Sections:
//  1. Banner tự động chuyển với điều hướng
//  2. Sản phẩm nổi bật (8 sản phẩm đầu tiên)
//  3. Chính sách cam kết (giao hàng, chất lượng, hỗ trợ, đổi trả)
//  4. Newsletter đăng ký email
//
// Lưu ý: Header và Footer được render bởi Layout component ở App.jsx
// → Home.jsx KHÔNG cần import Header/Footer nữa (tránh duplicate)

import { useEffect, useState, useMemo } from 'react'
import {
  Box, Grid, Card, CardContent, Button, Typography,
  TextField, IconButton, Skeleton, Stack
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { getProductsAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import VerifiedIcon from '@mui/icons-material/Verified'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'
import banner1 from '~/assets/banner1.png'
import banner2 from '~/assets/banner2.png'
import banner3 from '~/assets/banner3.png'
import { toast } from 'react-toastify'

// Dữ liệu các chính sách - tách ra constant để dễ quản lý và dễ đọc
const POLICIES = [
  {
    icon: <LocalShippingIcon sx={{ fontSize: 48, color: '#0b8798' }} />,
    title: 'Miễn phí vận chuyển',
    desc: 'Đơn hàng từ 500k'
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 48, color: '#0b8798' }} />,
    title: 'Đảm bảo chất lượng',
    desc: 'Cửa hàng uy tín'
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 48, color: '#0b8798' }} />,
    title: 'Chuyên gia hỗ trợ',
    desc: '24/7 sẵn sàng giúp đỡ'
  },
  {
    icon: <AssignmentReturnIcon sx={{ fontSize: 48, color: '#0b8798' }} />,
    title: 'Dễ dàng trả hàng',
    desc: '30 ngày đổi trả'
  }
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true) // Loading state để hiển thị skeleton
  const banners = [banner1, banner2, banner3]
  const [bannerIndex, setBannerIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  // Điều hướng banner: quay vòng (modulo)
  const prev = (e) => { e?.stopPropagation(); setBannerIndex(i => (i - 1 + banners.length) % banners.length) }
  const next = (e) => { e?.stopPropagation(); setBannerIndex(i => (i + 1) % banners.length) }

  // Fetch sản phẩm khi component mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getProductsAPI()
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Không thể tải sản phẩm. Vui lòng thử lại sau.')
      } finally {
        setLoading(false) // Dù thành công hay thất bại, đều tắt loading
      }
    }
    load()
  }, [])

  // Auto-slide banner mỗi 3 giây (dừng khi user hover)
  useEffect(() => {
    if (paused) return undefined // Dừng interval khi hover
    const t = setInterval(() => {
      setBannerIndex(i => (i + 1) % banners.length)
    }, 3000)
    return () => clearInterval(t) // Cleanup khi unmount hoặc deps thay đổi
  }, [paused, banners.length])

  // Chỉ hiển thị 8 sản phẩm nổi bật (useMemo tránh tính lại mỗi render)
  const featuredProducts = useMemo(() => products.slice(0, 8), [products])

  return (
    <Box>
      {/* ─── Banner Section ────────────────────────────────────────────────── */}
      <Box sx={{ position: 'relative' }}>
        {/* Banner chính với auto-slide */}
        <Box
          role="img"
          aria-label={`Banner ${bannerIndex + 1}`}
          onMouseEnter={() => setPaused(true)}  // Dừng auto-slide khi user đang xem
          onMouseLeave={() => setPaused(false)} // Tiếp tục khi rời chuột
          sx={{
            width: '100%',
            backgroundImage: `url(${banners[bannerIndex] || banners[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: { xs: 280, sm: 400, md: 600, lg: 720 }, // Responsive height
            position: 'relative',
            // Transition mượt khi chuyển banner (chỉ overlay, không phải background-image)
          }}
        >
          {/* Overlay tối để text nổi bật trên ảnh sáng */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.5))'
          }} />

          {/* CTA Text - chỉ hiển thị ở banner đầu tiên */}
          {bannerIndex === 0 && (
            <Box sx={{
              position: 'absolute',
              left: { xs: 20, md: 60 },
              top: '28%',
              color: '#fff',
              maxWidth: { xs: '75%', md: '45%' }
            }}>
              <Typography sx={{
                fontWeight: 800,
                fontSize: { xs: '1.4rem', sm: '2rem', md: '3rem' },
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                // Fade-in animation khi banner xuất hiện
                animation: 'fadeInUp 600ms ease forwards',
                '@keyframes fadeInUp': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                Chạm vào từng khoảnh khắc
              </Typography>
              <Typography sx={{
                mt: 1, mb: 3, opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1.1rem' }
              }}>
                Sống động mỗi ngày với bể cá của bạn
              </Typography>
              {/* Fix bug: link /shop → /products (route đúng) */}
              <Button
                component={RouterLink}
                to="/products" // Fix: đổi /shop → /products
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#ff7043',
                  '&:hover': { bgcolor: '#e64a19' },
                  fontWeight: 700,
                  px: 4
                }}
              >
                🛍️ Mua ngay
              </Button>
            </Box>
          )}

          {/* Nút điều hướng banner trái */}
          <IconButton
            aria-label="Banner trước"
            onClick={prev}
            sx={{
              position: 'absolute', left: { xs: 8, md: 16 }, top: '50%',
              transform: 'translateY(-50%)',
              color: '#fff', bgcolor: 'rgba(0,0,0,0.35)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* Nút điều hướng banner phải */}
          <IconButton
            aria-label="Banner tiếp theo"
            onClick={next}
            sx={{
              position: 'absolute', right: { xs: 8, md: 16 }, top: '50%',
              transform: 'translateY(-50%)',
              color: '#fff', bgcolor: 'rgba(0,0,0,0.35)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Dot indicators: hiển thị banner đang ở vị trí nào */}
        <Box sx={{
          position: 'absolute', bottom: 14, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 1
        }}>
          {banners.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setBannerIndex(idx)} // Click dot để nhảy đến banner đó
              sx={{
                width: idx === bannerIndex ? 24 : 10, // Active dot rộng hơn
                height: 10, borderRadius: '5px',
                background: idx === bannerIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease' // Smooth khi active thay đổi
              }}
            />
          ))}
        </Box>
      </Box>

      {/* ─── Featured Products Section ─────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, mt: 8 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}
        >
          🐟 Sản phẩm nổi bật
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 5 }}
        >
          Những sản phẩm được yêu thích nhất từ cửa hàng AquaLife
        </Typography>

        <Grid container spacing={3}>
          {loading ? (
            // Skeleton loading: hiển thị placeholder trong khi đợi API
            // Cùng cấu trúc grid với data thật → không bị layout shift
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Card sx={{ borderRadius: 2 }}>
                  <Skeleton variant="rectangular" height={160} /> {/* Ảnh sản phẩm */}
                  <CardContent>
                    <Skeleton variant="text" sx={{ mb: 1 }} />        {/* Tên sản phẩm */}
                    <Skeleton variant="text" width="60%" />             {/* Giá */}
                    <Skeleton variant="rectangular" height={36} sx={{ mt: 1, borderRadius: 1 }} /> {/* Nút */}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : featuredProducts.length === 0 ? (
            // Empty state: không có sản phẩm
            <Grid item xs={12}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                  🐠 Chưa có sản phẩm nào. Hãy quay lại sau!
                </Typography>
              </Box>
            </Grid>
          ) : (
            // Render danh sách sản phẩm
            featuredProducts.map((p) => (
              <Grid item xs={6} sm={4} md={3} key={p._id || p.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Ảnh sản phẩm: click để vào trang chi tiết */}
                  <RouterLink to={`/products/${p._id || p.id}`} style={{ textDecoration: 'none' }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: 130, sm: 160 },
                        backgroundImage: `url(${p.imageUrl || ''})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '12px 12px 0 0',
                        // Zoom nhẹ khi hover để gợi ý có thể click
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.04)' }
                      }}
                    />
                  </RouterLink>

                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Fix bug: dùng p.name (API trả về 'name', không phải 'product_name') */}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,  // Giới hạn 2 dòng, thêm "..." nếu dài hơn
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {p.name} {/* Fix: p.name thay vì p.product_name */}
                    </Typography>

                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Giá tiền: định dạng theo locale Việt Nam */}
                      <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                        {(Number(p.price) || 0).toLocaleString('vi-VN')}đ
                      </Typography>

                      {/* Nút thêm vào giỏ hàng */}
                      <IconButton
                        size="small"
                        onClick={() => {
                          addToCart(p, 1)
                          toast.success(`Đã thêm "${p.name}" vào giỏ hàng!`, { autoClose: 1500 })
                          // Notify Header cập nhật badge số lượng
                          window.dispatchEvent(new CustomEvent('cartUpdated'))
                        }}
                        sx={{
                          color: '#0b8798',
                          '&:hover': { bgcolor: 'rgba(11,135,152,0.1)' }
                        }}
                        aria-label={`Thêm ${p.name} vào giỏ hàng`}
                      >
                        <AddShoppingCartIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Link xem tất cả sản phẩm */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button
            component={RouterLink}
            to="/products"
            variant="outlined"
            size="large"
            sx={{ borderColor: '#0b8798', color: '#0b8798', px: 5, '&:hover': { bgcolor: 'rgba(11,135,152,0.06)' } }}
          >
            Xem tất cả sản phẩm →
          </Button>
        </Box>
      </Box>

      {/* ─── Policies Section ──────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f0f8f9', mt: 10, py: 8 }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 6 }}>
            Chính Sách & Cam Kết
          </Typography>
          <Grid container spacing={4}>
            {POLICIES.map(({ icon, title, desc }) => (
              <Grid item xs={12} sm={6} md={3} key={title}>
                <Box sx={{
                  textAlign: 'center',
                  p: 3, borderRadius: 2,
                  bgcolor: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
                }}>
                  <Box sx={{ mb: 2 }}>{icon}</Box>
                  <Typography fontWeight={700} gutterBottom>{title}</Typography>
                  <Typography variant="body2" color="text.secondary">{desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ─── Newsletter Section ────────────────────────────────────────────── */}
      <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'linear-gradient(135deg, #e8f4f8, #fff)' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          📧 Đăng ký nhận tin
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Nhận mẹo chăm sóc bể cá, ưu đãi độc quyền và thông tin sản phẩm mới nhất.
        </Typography>

        {/* Form đăng ký email */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault()
            toast.info('Tính năng đang phát triển!') // Placeholder: chưa có API
          }}
          sx={{ display: 'flex', maxWidth: 480, mx: 'auto', gap: 1, px: 2 }}
        >
          <TextField
            placeholder="Nhập email của bạn..."
            fullWidth
            type="email"
            size="small"
            sx={{ bgcolor: '#fff', borderRadius: 1 }}
          />
          <Button variant="contained" type="submit" sx={{ whiteSpace: 'nowrap', bgcolor: '#0b8798' }}>
            Gửi đi
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
