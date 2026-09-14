import { useState } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Link } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { loginAPI, googleLoginAPI } from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import { validateLogin } from '~/utils/validattion'
import { useAuth } from '~/contexts/AuthContext'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'

// Cấu hình styling
const INPUT_STYLE = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0097A7' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0097A7', borderWidth: '1px' },
  '& input': { padding: '12px 14px' }
}

const BUTTON_STYLE = {
  py: 1.5,
  backgroundColor: '#008C9E',
  '&:hover': { backgroundColor: '#00798a' },
  fontSize: '1rem',
  fontWeight: 600
}

const ROLE_CUSTOMER = 'customer'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  // Kiểm tra xem có email từ form đăng ký chuyển sang không
  const emailFromRegister = location.state?.email || ''

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loginData, setLoginData] = useState({ email: emailFromRegister, password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (errorMsg) setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    const errors = validateLogin(loginData)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    try {
      setLoading(true)
      const res = await loginAPI(loginData)
      
      const user = res?.customer || {}
      
      // Gọi hàm login từ AuthContext để update state toàn cục
      if (res?.accessToken) {
        login(res.accessToken, user)
      }

      // Xử lý redirect
      const tokenPayload = getUserFromToken()
      const roleFromToken = tokenPayload?.role
      const effectiveRole = roleFromToken || user.role

      // Nếu có location.state.from (từ ProtectedRoute) thì quay lại trang đó
      // Nhưng nếu là admin thì luôn ưu tiên về trang admin
      const origin = effectiveRole !== ROLE_CUSTOMER 
        ? '/admin' 
        : (location.state?.from?.pathname || '/')
      
      toast.success('Đăng nhập thành công!')
      navigate(origin, { replace: true })
    } catch (err) {
      const backendMsg = err.response?.data?.message_vi || err.response?.data?.message
      setErrorMsg(backendMsg || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const res = await googleLoginAPI(credentialResponse.credential)
      
      const user = res?.customer || {}
      if (res?.accessToken) {
        login(res.accessToken, user)
      }

      const tokenPayload = getUserFromToken()
      const roleFromToken = tokenPayload?.role
      const effectiveRole = roleFromToken || user.role

      const origin = effectiveRole !== ROLE_CUSTOMER 
        ? '/admin' 
        : (location.state?.from?.pathname || '/')
      
      toast.success('Đăng nhập Google thành công!')
      navigate(origin, { replace: true })
    } catch (err) {
      const backendMsg = err.response?.data?.message_vi || err.response?.data?.message
      setErrorMsg(backendMsg || 'Đăng nhập Google thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
          Chào mừng trở lại
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đăng nhập vào tài khoản của bạn
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 18px 30px rgba(20,60,80,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 2 }}>
              <Box component="label" htmlFor="login-email" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                Địa chỉ email
              </Box>
              <TextField
                id="login-email"
                name="email"
                placeholder="emailcuaban@gmail.com"
                type="email"
                variant="outlined"
                fullWidth
                required
                value={loginData.email}
                onChange={handleChange}
                sx={INPUT_STYLE}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email || ''}
                FormHelperTextProps={{ sx: { mt: 0.5, ml: 0, color: '#d32f2f', fontSize: '0.85rem' } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box component="label" htmlFor="login-password" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                Mật khẩu
              </Box>
              <TextField
                id="login-password"
                name="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                required
                value={loginData.password}
                onChange={handleChange}
                sx={INPUT_STYLE}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password || ''}
                FormHelperTextProps={{ sx: { mt: 0.5, ml: 0, color: '#d32f2f', fontSize: '0.85rem' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {errorMsg && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{errorMsg}</Typography>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, ...BUTTON_STYLE }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                HOẶC TIẾP TỤC VỚI
              </Typography>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Lỗi khi kết nối với Google.')}
              />
            </Box>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2">
              Bạn chưa có tài khoản?{' '}
              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                sx={{ color: '#0b8798', fontWeight: 600, ml: 0.5 }}
              >
                Đăng ký
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
