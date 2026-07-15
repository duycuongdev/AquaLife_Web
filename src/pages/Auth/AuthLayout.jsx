import { Box, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import logo from '~/assets/logo.png'

export default function AuthLayout() {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(90deg,#e9fbff 0%, #f1f7fb 100%)',
      px: 2,
      py: 5,
      overflow: 'hidden'
    }}>
      <Box sx={{ textAlign: 'center', mb: 3, zIndex: 10 }}>
        <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 70, height: 70 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0693a6', ml: 1 }}>AquaLife</Typography>
        </Box>
      </Box>

      {/* Nơi render Login.jsx hoặc Register.jsx */}
      <Outlet />
      
    </Box>
  )
}
