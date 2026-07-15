import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Link } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { registerAPI } from '~/apis/index'
import { validateRegister } from '~/utils/validattion'
import { toast } from 'react-toastify'

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

const REGISTER_FORM_FIELDS = [
  { id: 'fullName', name: 'fullName', label: 'Họ tên', placeholder: 'Họ tên của bạn', type: 'text', required: true },
  { id: 'email', name: 'email', label: 'Địa chỉ email', placeholder: 'emailcuaban@gmail.com', type: 'email', required: true },
  { id: 'phone', name: 'phone', label: 'Số điện thoại', placeholder: 'Số điện thoại của bạn', type: 'tel', required: true },
  { id: 'address', name: 'address', label: 'Địa chỉ', placeholder: 'Địa chỉ của bạn', type: 'text', required: true },
  { id: 'password', name: 'password', label: 'Mật khẩu', placeholder: '••••••••', type: 'password', required: true, toggle: true },
  { id: 'confirmPassword', name: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: '••••••••', type: 'password', required: true, toggle: true }
]

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (errorMsg) setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    const errors = validateRegister(registerData)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    const payload = {
      name: registerData.fullName.trim(),
      email: registerData.email.trim(),
      phone: registerData.phone.trim(),
      address: registerData.address.trim(),
      password: registerData.password
    }

    try {
      setLoading(true)
      await registerAPI(payload)
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      
      // Chuyển hướng sang trang đăng nhập và truyền email
      navigate('/login', { state: { email: payload.email } })
    } catch (error) {
      const backendMsg = error.response?.data?.message_vi || error.response?.data?.message
      setErrorMsg(backendMsg || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 760 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
          Tạo tài khoản mới
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tham gia cùng với AquaLife
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 18px 30px rgba(20,60,80,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(260px, 1fr))' },
              gap: '12px 16px'
            }}>
              {REGISTER_FORM_FIELDS.map((f) => {
                const isPasswordField = f.name === 'password'
                const isConfirmField = f.name === 'confirmPassword'
                const isToggleField = !!f.toggle
                const inputType = isToggleField
                  ? (isPasswordField
                    ? (showPassword ? 'text' : 'password')
                    : isConfirmField
                      ? (showConfirmPassword ? 'text' : 'password')
                      : f.type)
                  : f.type

                return (
                  <Box key={f.name} sx={{ mb: 2 }}>
                    <Box component="label" htmlFor={f.id} sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                      {f.label}
                    </Box>
                    <TextField
                      id={f.id}
                      name={f.name}
                      type={inputType}
                      placeholder={f.placeholder}
                      variant="outlined"
                      fullWidth
                      required={f.required}
                      value={registerData[f.name]}
                      onChange={handleChange}
                      sx={INPUT_STYLE}
                      error={Boolean(fieldErrors[f.name])}
                      helperText={fieldErrors[f.name] || ''}
                      FormHelperTextProps={{ sx: { mt: 0.5, ml: 0, color: '#d32f2f', fontSize: '0.85rem' } }}
                      InputProps={isToggleField ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => {
                                if (isPasswordField) setShowPassword(prev => !prev)
                                else if (isConfirmField) setShowConfirmPassword(prev => !prev)
                              }}
                              edge="end"
                            >
                              {(isPasswordField ? showPassword : showConfirmPassword) ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      } : undefined}
                    />
                  </Box>
                )
              })}
            </Box>

            {errorMsg && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{errorMsg}</Typography>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, ...BUTTON_STYLE }}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2">
              Bạn đã có tài khoản?{' '}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{ color: '#0b8798', fontWeight: 600, ml: 0.5 }}
              >
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
