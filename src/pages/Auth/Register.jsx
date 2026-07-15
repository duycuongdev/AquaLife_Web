import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Link } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { registerAPI, googleLoginAPI, sendOtpAPI } from '~/apis/index'
import { validateRegister } from '~/utils/validattion'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '~/contexts/AuthContext'
import { getUserFromToken } from '~/utils/auth'

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
  { id: 'password', name: 'password', label: 'Mật khẩu', placeholder: '••••••••', type: 'password', required: true, toggle: true },
  { id: 'confirmPassword', name: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: '••••••••', type: 'password', required: true, toggle: true }
]

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState(1) // Bước 1: Điền info, Bước 2: Nhập OTP
  const [otp, setOtp] = useState('')

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
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

  // Handle Submit Bước 1: Gửi yêu cầu lấy OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    const errors = validateRegister(registerData)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    try {
      setLoading(true)
      await sendOtpAPI(registerData.email.trim())
      toast.success('Mã xác thực (OTP) đã được gửi đến email của bạn!')
      setStep(2)
    } catch (error) {
      const backendMsg = error.response?.data?.message_vi || error.response?.data?.message
      setErrorMsg(backendMsg || 'Gửi mã xác thực thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Submit Bước 2: Xác nhận OTP và Đăng ký
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!otp || otp.length !== 6) {
      setErrorMsg('Vui lòng nhập đúng 6 số mã xác thực.')
      return
    }

    const payload = {
      name: registerData.fullName.trim(),
      email: registerData.email.trim(),
      password: registerData.password,
      otp: otp.trim()
    }

    try {
      setLoading(true)
      await registerAPI(payload)
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      navigate('/login', { state: { email: payload.email } })
    } catch (error) {
      const backendMsg = error.response?.data?.message_vi || error.response?.data?.message
      setErrorMsg(backendMsg || 'Xác thực OTP thất bại. Vui lòng thử lại.')
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

      const origin = effectiveRole !== 'customer' ? '/admin' : '/'

      toast.success('Đăng nhập/Đăng ký Google thành công!')
      navigate(origin, { replace: true })
    } catch (err) {
      const backendMsg = err.response?.data?.message_vi || err.response?.data?.message
      setErrorMsg(backendMsg || 'Đăng ký Google thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: step === 1 ? 760 : 420, transition: 'max-width 0.3s' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
          {step === 1 ? 'Tạo tài khoản mới' : 'Xác thực Email'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {step === 1 ? 'Tham gia cùng với AquaLife' : `Nhập mã 6 số được gửi đến ${registerData.email}`}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 18px 30px rgba(20,60,80,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} noValidate>
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
                {loading ? 'Đang gửi mã...' : 'Tiếp tục'}
              </Button>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  HOẶC ĐĂNG KÝ VỚI
                </Typography>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg('Lỗi khi kết nối với Google.')}
                />
              </Box>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} noValidate>
              <Box sx={{ mb: 2 }}>
                <Box component="label" htmlFor="otp-input" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151', textAlign: 'center' }}>
                  Mã xác thực (OTP)
                </Box>
                <TextField
                  id="otp-input"
                  name="otp"
                  type="text"
                  placeholder="Nhập 6 số"
                  variant="outlined"
                  fullWidth
                  required
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  sx={{
                    ...INPUT_STYLE,
                    '& input': { textAlign: 'center', letterSpacing: 8, fontSize: '1.2rem', fontWeight: 'bold' }
                  }}
                  inputProps={{ maxLength: 6 }}
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
                {loading ? 'Đang xác thực...' : 'Hoàn tất Đăng ký'}
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={() => setStep(1)}
                sx={{ mt: 1, color: '#6b7280', '&:hover': { background: 'transparent', color: '#374151' } }}
              >
                Quay lại sửa thông tin
              </Button>
            </form>
          )}

          {step === 1 && (
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
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
