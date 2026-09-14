import { useEffect, useState } from 'react'
import { Box, AppBar, Toolbar, Typography, Button, Tabs, Tab } from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useLocation } from 'react-router-dom'
import logo from '~/assets/logo.png'
import Products from '~/pages/Admin/Products/Products'
import Customers from '~/pages/Admin/Customers/Customers'
import AdminOrders from '~/pages/Admin/AdminOrders/AdminOrders.jsx'
import checkout from '~/assets/checkout.png'
import Dashboard from '~/pages/Admin/Dashboard/Dashboard'
import { useNavigate } from 'react-router-dom'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useAuth } from '~/contexts/AuthContext'

export default function Admin() {
  const [section, setSection] = useState('dashboard')
  const [tabIndex, setTabIndex] = useState(0)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const location = useLocation()

  // initialize section / tab based on current URL so deep links work
  useEffect(() => {
    const path = (location.pathname || '').toLowerCase()
    if (path.includes('/admin/products')) {
      setSection('products')
      setTabIndex(1)
    } else if (path.includes('/admin/orders')) {
      setSection('orders')
      setTabIndex(2)
    } else if (path.includes('/admin/customers')) {
      setSection('customers')
      setTabIndex(3)
    } else {
      setSection('dashboard')
      setTabIndex(0)
    }
  }, [location.pathname])

  const tabStyles = {
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontSize: 16,
    textTransform: 'none',
    minHeight: 56,
    px: 3,
    color: '#555',
    '&.Mui-selected': {
      color: '#0b8798',
      background: '#d8ebeb',
      fontWeight: 'bold'
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'linear-gradient(180deg, #dbe8e8, #ffffff)',
          zIndex: 1300,       // z-index cao để hiển thị trên tất cả content
          backdropFilter: 'blur(8px)' // Hiệu ứng mờ phía sau khi cuộn qua content
        }}>
        <Toolbar>
          <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 44, height: 44 }} />
          <Typography sx={{ fontWeight: 700, color: '#0b8798', fontSize: '1.1rem' }}>AquaLife</Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            startIcon={<img src={checkout} alt="Checkout" style={{ width: 24, height: 24 }} />}
            sx={{ color: '#0b8798', textTransform: 'none', fontWeight: 'bold' }}
            onClick={async () => {
              try {
                logout()
                navigate('/login', { replace: true })
              } catch (e) {
                toast.error('Có lỗi xảy ra khi đăng xuất')
              }
            }}
          >
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, mt: '64px', minHeight: 'calc(100vh - 64px)' }}>
        <Box
          sx={{
            width: 240,
            borderRight: 1,
            borderColor: 'divider',
            background: '#ffffff',
            position: 'sticky',
            top: 64,
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Tabs
            orientation="vertical"
            value={tabIndex}
            onChange={(e, v) => {
              setTabIndex(v)
              const mapping = ['dashboard', 'products', 'orders', 'customers']
              const paths = ['/admin', '/admin/products', '/admin/orders', '/admin/customers']
              const next = mapping[v] || 'dashboard'
              setSection(next)
              try {
                navigate(paths[v] || '/admin', { replace: true })
              } catch (err) {
                /* ignore navigation errors */
              }
            }}
            aria-label="Admin sections"
            sx={{
              pt: 2,
              '& .MuiTabs-indicator': {
                right: 0,
                left: 'auto',
                width: 4,
                backgroundColor: '#0b8798',
              }
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Tổng quan" sx={tabStyles} />
            <Tab icon={<InventoryIcon />} iconPosition="start" label="Sản phẩm" sx={tabStyles} />
            <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Đơn hàng" sx={tabStyles} />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Khách hàng" sx={tabStyles} />
          </Tabs>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ p: 2, m: 2, background: '#d8ebeb', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 54, height: 54 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 'bold', color: '#0b8798', fontSize: 13 }}>AquaLife Admin</Typography>
              <Typography sx={{ fontSize: 12, color: '#555' }}>Hệ thống quản lý</Typography>
            </Box>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, p: 4, background: '#f5f7f9' }}>
          {section === 'dashboard' && (
            <Box>
              <Dashboard />
            </Box>
          )}

          {section === 'products' && (
            <Box>
              <Products />
            </Box>
          )}

          {section === 'orders' && (
            <Box>
              <AdminOrders />
            </Box>
          )}

          {section === 'customers' && (
            <Box>
              <Box>
                <Customers />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
