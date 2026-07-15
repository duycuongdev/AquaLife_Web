import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts'
import { Box, Typography, Grid, Card, CardContent, ToggleButtonGroup, ToggleButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, FormControl, Select, MenuItem } from '@mui/material'
import { Inventory as InventoryIcon, Person as PersonIcon, TrendingUp } from '@mui/icons-material'
import { getOrdersAPI, getProductsAPI, getCustomersAPI } from '~/apis/index'
import { useEffect, useState, useMemo } from 'react'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

export default function Dashboard() {
  const [ordersData, setOrdersData] = useState([])
  const [customersData, setCustomersData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totals, setTotals] = useState({ products: 0, customers: 0 })
  const [timeRange, setTimeRange] = useState('ngày')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [orders, products, customers] = await Promise.all([
          getOrdersAPI(),
          getProductsAPI(),
          getCustomersAPI()
        ])

        setOrdersData(Array.isArray(orders) ? orders : [])
        setCustomersData(Array.isArray(customers) ? customers : [])

        const totalProducts = Array.isArray(products) ? products.length : 0
        const totalCustomers = Array.isArray(customers)
          ? customers.filter((c) => c.role === 'customer').length
          : 0
        setTotals({ products: totalProducts, customers: totalCustomers })
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(ordersData.map(o => {
      const d = new Date(o.createdAt || o.orderDate)
      return isNaN(d.getTime()) ? null : d.getFullYear()
    }).filter(Boolean))).sort((a, b) => b - a)
    if (!years.includes(new Date().getFullYear())) {
      years.push(new Date().getFullYear())
      years.sort((a, b) => b - a)
    }
    return years
  }, [ordersData])

  // Process data for charts based on timeRange
  const getChartData = () => {
    const now = new Date()
    let filteredOrders = []
    let data = []

    if (timeRange === 'ngày') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      filteredOrders = ordersData.filter(o => new Date(o.createdAt || o.orderDate).getTime() >= startOfDay)

      const hours = Array.from({ length: 24 }, (_, i) => ({ month: `${i}h`, revenue: 0, orders: 0 }))
      filteredOrders.forEach(o => {
        const d = new Date(o.createdAt || o.orderDate)
        const hour = d.getHours()
        hours[hour].revenue += Number(o.totalPrice) || 0
        hours[hour].orders += 1
      })
      data = hours
    } else if (timeRange === 'tuần') {
      const startOf = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime()
      filteredOrders = ordersData.filter(o => new Date(o.createdAt || o.orderDate).getTime() >= startOf)

      const daysMap = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const label = `${d.getDate()}/${d.getMonth() + 1}`
        daysMap[label] = { month: label, revenue: 0, orders: 0 }
      }
      filteredOrders.forEach(o => {
        const d = new Date(o.createdAt || o.orderDate)
        const label = `${d.getDate()}/${d.getMonth() + 1}`
        if (daysMap[label]) {
          daysMap[label].revenue += Number(o.totalPrice) || 0
          daysMap[label].orders += 1
        }
      })
      data = Object.values(daysMap)
    } else if (timeRange === 'tháng') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      filteredOrders = ordersData.filter(o => new Date(o.createdAt || o.orderDate).getTime() >= startOfMonth)

      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const days = Array.from({ length: daysInMonth }, (_, i) => ({ month: `${i + 1}`, revenue: 0, orders: 0 }))
      filteredOrders.forEach(o => {
        const d = new Date(o.createdAt || o.orderDate)
        const day = d.getDate()
        days[day - 1].revenue += Number(o.totalPrice) || 0
        days[day - 1].orders += 1
      })
      data = days
    } else if (timeRange === 'năm') {
      const startOfYear = new Date(selectedYear, 0, 1).getTime()
      const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59).getTime()
      filteredOrders = ordersData.filter(o => {
        const t = new Date(o.createdAt || o.orderDate).getTime()
        return t >= startOfYear && t <= endOfYear
      })

      const months = Array.from({ length: 12 }, (_, i) => ({ month: `T.${i + 1}`, revenue: 0, orders: 0 }))
      filteredOrders.forEach(o => {
        const d = new Date(o.createdAt || o.orderDate)
        const month = d.getMonth()
        months[month].revenue += Number(o.totalPrice) || 0
        months[month].orders += 1
      })
      data = months
    }
    
    return { data, filteredOrders }
  }

  const { data: chartData, filteredOrders } = getChartData()

  // Calculate dynamic totals based on the filtered data
  const currentOrdersCount = filteredOrders.length
  const currentRevenue = filteredOrders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0)

  // Map users for recent activities
  const userMap = customersData.reduce((acc, u) => {
    const id = u?._id || u?.id
    if (id) acc[id] = u
    return acc
  }, {})

  const recentActivities = [...ordersData]
    .sort((a, b) => {
      const d1 = new Date(b.createdAt || b.orderDate).getTime()
      const d2 = new Date(a.createdAt || a.orderDate).getTime()
      return d1 - d2
    })
    .slice(0, 5)
    .map((o) => {
      const rawUserId = o.userId || o.customerId || o.customersId
      const userId = rawUserId?._id || rawUserId
      const user = userMap[userId] || {}
      const customerName = user.name || user.email || user.phone || user.fullName || 'Khách hàng ẩn danh'

      const nameParts = customerName.split(' ').filter(Boolean)
      const initials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : customerName.slice(0, 2).toUpperCase()

      const statusStr = (o.status || 'ĐANG XỬ LÝ').toUpperCase()
      let statusColor = 'warning'
      if (statusStr.includes('THÀNH CÔNG') || statusStr.includes('XÁC NHẬN') || statusStr.includes('HOÀN THÀNH')) {
        statusColor = 'success'
      } else if (statusStr.includes('HỦY') || statusStr.includes('THẤT BẠI')) {
        statusColor = 'error'
      }

      const colors = ['#cce5ff', '#b3e5fc', '#c8e6c9', '#ffccbc', '#d1c4e9', '#f8bbd0']
      const colorIndex = customerName.length % colors.length
      const color = colors[colorIndex]

      return {
        id: `#AL-${(o._id || o.id || '').toString().slice(-4).toUpperCase()}`,
        customerName,
        initials,
        date: new Date(o.createdAt || o.orderDate).toLocaleDateString('vi-VN'),
        status: statusStr,
        total: `${(Number(o.totalPrice) || 0).toLocaleString('vi-VN')}đ`,
        color,
        statusColor
      }
    })

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 4, mt: 1, gap: 2 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, val) => { if (val) setTimeRange(val) }}
          sx={{
            background: '#ffffff',
            borderRadius: 8,
            padding: 0.5,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 8,
              px: 3,
              py: 0.5,
              textTransform: 'none',
              fontWeight: 500,
              color: '#555',
              '&.Mui-selected, &.Mui-selected:hover': {
                backgroundColor: '#ffffff',
                color: '#0b8798',
                fontWeight: 600,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
              }
            }
          }}
        >
          <ToggleButton value="ngày" >Ngày</ToggleButton>
          <ToggleButton value="tuần">Tuần</ToggleButton>
          <ToggleButton value="tháng">Tháng</ToggleButton>
          <ToggleButton value="năm">Năm</ToggleButton>
        </ToggleButtonGroup>

        {timeRange === 'năm' && (
          <FormControl size="small" sx={{ minWidth: 100, background: '#fff', borderRadius: 8, boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }}>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              sx={{
                borderRadius: 8,
                height: 36,
                fontWeight: 'bold',
                color: '#0b8798',
                '& fieldset': { border: 'none' },
                '& .MuiSelect-select': { py: 0.5, px: 2 }
              }}
            >
              {availableYears.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Box sx={{ background: '#e0f2f1', borderRadius: 2, p: 2, display: 'flex' }}>
                  <InventoryIcon sx={{ color: '#0b8798', fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" fontWeight={600} fontSize={14}>Sản phẩm</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{totals.products || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Box sx={{ background: '#e8f5e9', borderRadius: 2, p: 2, display: 'flex' }}>
                  <MonetizationOnIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" fontWeight={600} fontSize={14}>Doanh thu</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{currentRevenue.toLocaleString('vi-VN')}đ</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Box sx={{ background: '#f3e5f5', borderRadius: 2, p: 2, display: 'flex' }}>
                  <ReceiptLongIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" fontWeight={600} fontSize={14}>Đơn hàng</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{currentOrdersCount}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Box sx={{ background: '#e3f2fd', borderRadius: 2, p: 2, display: 'flex' }}>
                  <PersonIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" fontWeight={600} fontSize={14}>Khách hàng</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{totals.customers || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography fontWeight={700} fontSize={15} color="#333">DOANH THU</Typography>
                <Typography fontSize={12} color="text.secondary">Đơn vị: VNĐ</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => val === 0 ? '0' : val / 1000 + 'k'} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="revenue" fill="#0b8798" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography fontWeight={700} fontSize={15} color="#333">SỐ ĐƠN</Typography>
                <Typography fontSize={12} color="text.secondary">Đơn vị: Đơn</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b8798" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0b8798" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="orders" stroke="#0b8798" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" activeDot={{ r: 6, fill: '#0b8798', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: 'none', mb: 5 }}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <Typography variant="h6" fontWeight={800} color="#333">Hoạt động gần đây</Typography>
            <Typography fontSize={14} fontWeight="bold" color="#0b8798" sx={{ cursor: 'pointer' }}>Xem tất cả</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee' }}>ĐƠN HÀNG</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee' }}>KHÁCH HÀNG</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee' }}>NGÀY ĐẶT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee' }}>TRẠNG THÁI</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee' }}>TỔNG TIỀN</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivities.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>{row.id}</TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: row.color, color: '#333', fontSize: 13, fontWeight: 'bold' }}>{row.initials}</Avatar>
                        <Typography variant="body2">{row.customerName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#555', borderBottom: 'none' }}>{row.date}</TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: 11,
                          bgcolor: row.statusColor === 'success' ? '#e8f5e9' : row.statusColor === 'error' ? '#ffebee' : '#fff3e0',
                          color: row.statusColor === 'success' ? '#2e7d32' : row.statusColor === 'error' ? '#c62828' : '#ed6c02',
                          borderRadius: 4
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0b8798', borderBottom: 'none' }}>{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}