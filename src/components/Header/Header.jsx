// Header.jsx
// Component thanh điều hướng cố định (sticky) ở đầu trang.
//
// Cải thiện so với phiên bản cũ:
//  → Dùng AuthContext thay vì đọc localStorage trực tiếp (reactive, tự re-render)
//  → Thêm responsive: mobile menu ẩn, hamburger icon hiện
//  → Không cần lắng nghe CustomEvent 'storage' nữa
//  → Mobile drawer menu cho trải nghiệm tốt hơn trên điện thoại

import { useState } from 'react'
import {
  Menu, MenuItem, Button, Badge, IconButton, Avatar,
  Divider, ListItemIcon, Box, Drawer, List, ListItemButton,
  ListItemText, useMediaQuery, useTheme, Typography
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import LogoutIcon from '@mui/icons-material/Logout'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '~/contexts/AuthContext'     // Dùng AuthContext thay vì đọc localStorage
import { cartCount } from '~/utils/cart'
import { useEffect } from 'react'
import logo from '~/assets/logo.png'

// Danh sách nav links - tách ra constant để dễ thêm/sửa
const NAV_LINKS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Sản phẩm', to: '/products' },
  { label: 'Giới thiệu', to: '/introduce' },
  { label: 'Liên hệ', to: '/contact' }
]

export default function Header() {
  const { user, isLoggedIn, isCustomer, logout } = useAuth() // Lấy auth state từ Context
  const navigate = useNavigate()
  const theme = useTheme()

  // Breakpoint: dưới 'md' (960px) → giao diện mobile
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State cho dropdown menu tài khoản (desktop)
  const [userAnchor, setUserAnchor] = useState(null)

  // State cho mobile drawer menu
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Số lượng item trong giỏ hàng
  const [count, setCount] = useState(0)

  // Cập nhật số lượng giỏ hàng khi có sự kiện cartUpdated
  useEffect(() => {
    const updateCount = () => {
      // Chỉ hiện badge giỏ hàng khi là customer đã đăng nhập
      if (!isLoggedIn || !isCustomer) {
        setCount(0)
        return
      }
      try { setCount(cartCount()) } catch { setCount(0) }
    }

    updateCount()

    // Lắng nghe custom event khi giỏ hàng thay đổi
    window.addEventListener('cartUpdated', updateCount)
    return () => window.removeEventListener('cartUpdated', updateCount)
  }, [isLoggedIn, isCustomer])

  // Đăng xuất: gọi logout từ AuthContext → tự động clear state + localStorage
  const handleLogout = () => {
    setUserAnchor(null)
    setDrawerOpen(false)
    logout()
    navigate('/', { replace: true })
  }

  // ─── Desktop Navigation ────────────────────────────────────────────────────
  const desktopNav = (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
      {NAV_LINKS.map(({ label, to }) => (
        <Button
          key={to}
          component={RouterLink}
          to={to}
          sx={{
            color: '#333',
            fontWeight: 500,
            '&:hover': { color: '#0b8798', background: 'rgba(11,135,152,0.06)' }
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  )

  // ─── Mobile Drawer Navigation ──────────────────────────────────────────────
  const mobileDrawer = (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{ sx: { width: 260, pt: 2 } }}
    >
      {/* Header drawer: logo + nút đóng */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 1 }}>
        <Typography sx={{ fontWeight: 700, color: '#0b8798' }}>Menu</Typography>
        <IconButton onClick={() => setDrawerOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Nav links trong drawer */}
      <List>
        {NAV_LINKS.map(({ label, to }) => (
          <ListItemButton
            key={to}
            component={RouterLink}
            to={to}
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* Auth actions trong drawer */}
      <List>
        {isLoggedIn ? (
          <>
            {isCustomer && (
              <ListItemButton component={RouterLink} to="/cart" onClick={() => setDrawerOpen(false)}>
                <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                <ListItemText primary={`Giỏ hàng (${count})`} />
              </ListItemButton>
            )}
            <ListItemButton component={RouterLink} to="/customer/profile" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Hồ sơ" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/customer/orders" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
              <ListItemText primary="Đơn hàng" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton component={RouterLink} to="/login" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Đăng nhập / Đăng ký" primaryTypographyProps={{ color: '#0b8798', fontWeight: 600 }} />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  )

  return (
    <Box
      component="header" // HTML5 semantic: dùng <header> thay vì <div> → tốt hơn cho SEO
      sx={{
        padding: '10px 0',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(180deg, #dbe8e8, #ffffff)',
        zIndex: 1300,       // z-index cao để hiển thị trên tất cả content
        backdropFilter: 'blur(8px)' // Hiệu ứng mờ phía sau khi cuộn qua content
      }}
    >
      <Box sx={{ maxWidth: 1100, margin: '0 auto', px: 2, display: 'flex', alignItems: 'center' }}>
        {/* ─── Logo ─── */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', mr: 2 }}
        >
          <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 40, height: 40 }} />
          <Typography sx={{ color: '#0b8798', fontWeight: 700, fontSize: '1.1rem' }}>
            AquaLife
          </Typography>
        </Box>

        {/* ─── Desktop Navigation (ẩn trên mobile) ─── */}
        {!isMobile && desktopNav}

        {/* ─── Right Actions ─── */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Giỏ hàng: chỉ hiện khi là customer đã đăng nhập */}
          {isLoggedIn && isCustomer && !isMobile && (
            <IconButton component={RouterLink} to="/cart" aria-label="Giỏ hàng" size="small">
              <Badge badgeContent={count} color="warning">
                <ShoppingCartIcon sx={{ color: count > 0 ? '#f1c40f' : '#e67e22' }} />
              </Badge>
            </IconButton>
          )}

          {/* Desktop: dropdown menu tài khoản */}
          {isLoggedIn && !isMobile ? (
            <>
              <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} size="small" aria-label="Tài khoản">
                {/* Avatar: hiện chữ cái đầu tên nếu không có ảnh */}
                <Avatar
                  src={user?.imageUrl || localStorage.getItem('auth_user_image') || ''}
                  alt={user?.name}
                  sx={{ width: 36, height: 36, fontSize: '0.9rem', bgcolor: '#0b8798' }}
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </Avatar>
              </IconButton>

              {/* Dropdown Menu tài khoản */}
              <Menu
                anchorEl={userAnchor}
                open={Boolean(userAnchor)}
                onClose={() => setUserAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { mt: 0.5, minWidth: 180 } }}
              >
                {/* Tên user ở đầu menu */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
                <Divider />

                <MenuItem onClick={() => { setUserAnchor(null); navigate('/customer/profile') }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  Hồ sơ cá nhân
                </MenuItem>
                <MenuItem onClick={() => { setUserAnchor(null); navigate('/customer/orders') }}>
                  <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                  Đơn hàng của tôi
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : !isLoggedIn && !isMobile ? (
            // Chưa đăng nhập → hiện nút đăng ký
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="small"
              sx={{ bgcolor: '#0b8798', '&:hover': { bgcolor: '#076070' } }}
            >
              Đăng nhập ❤️
            </Button>
          ) : null}

          {/* Mobile: hamburger button */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Mở menu"
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      {mobileDrawer}
    </Box>
  )
}
