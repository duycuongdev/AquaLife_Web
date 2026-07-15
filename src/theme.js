// theme.js
// Cấu hình MUI (Material UI) theme cho toàn bộ ứng dụng.
//
// Theme định nghĩa: màu sắc, typography, spacing, và style override cho các component.
// Bằng cách cấu hình theme tập trung:
//  → Thay đổi màu sắc/font chỉ cần sửa 1 chỗ → áp dụng toàn app
//  → Đảm bảo giao diện nhất quán

import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const theme = extendTheme({
  // ─── Color Palette ─────────────────────────────────────────────────────────
  // Palette định nghĩa màu sắc chủ đạo của app
  palette: {
    primary: {
      main: '#0b8798',      // Màu xanh ngọc - màu thương hiệu AquaLife
      light: '#3ba8b8',     // Phiên bản sáng hơn (hover states)
      dark: '#076070',      // Phiên bản tối hơn (active states)
      contrastText: '#fff'  // Màu text trên nền primary (phải contrast đủ cao)
    },
    secondary: {
      main: '#ff7043',      // Màu cam san hô - dùng cho CTA buttons
      light: '#ff9570',
      dark: '#c63f17',
      contrastText: '#fff'
    },
    // Màu error, warning, success, info: dùng defaults của MUI nhưng override nếu cần
    error: { main: '#d32f2f' },
    warning: { main: '#f57c00' },
    success: { main: '#2e7d32' }
  },

  // ─── Typography ────────────────────────────────────────────────────────────
  // Typography định nghĩa font family và kích thước chữ
  typography: {
    // Google Fonts Inter (được load trong index.html)
    // Inter: font sans-serif hiện đại, tối ưu cho màn hình, dễ đọc ở mọi kích thước
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',

    // Chuẩn hoá các heading sizes
    h1: { fontWeight: 700, fontSize: '2.5rem' },   // ~40px
    h2: { fontWeight: 700, fontSize: '2rem' },     // ~32px
    h3: { fontWeight: 600, fontSize: '1.75rem' },  // ~28px
    h4: { fontWeight: 600, fontSize: '1.5rem' },   // ~24px
    h5: { fontWeight: 600, fontSize: '1.25rem' },  // ~20px
    h6: { fontWeight: 600, fontSize: '1rem' },     // ~16px

    body1: { fontSize: '1rem', lineHeight: 1.7 },  // Text chính
    body2: { fontSize: '0.875rem', lineHeight: 1.6 } // Text phụ, caption
  },

  // ─── Shape ─────────────────────────────────────────────────────────────────
  shape: {
    borderRadius: 8 // Border radius mặc định: Bo tròn vừa phải (8px)
  },

  // ─── Component Overrides ───────────────────────────────────────────────────
  // Override style mặc định của các MUI component
  components: {
    // Button: bỏ UPPERCASE mặc định (MUI tự viết hoa tất cả text button)
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',  // Giữ nguyên case của text (không auto UPPERCASE)
          fontWeight: 600,        // Button text hơi đậm hơn body
          borderRadius: 8,        // Bo tròn nhất quán với theme
          // Transition mượt cho hover/focus states
          transition: 'all 0.2s ease-in-out'
        },
        // Variant 'contained': background color button
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)', // Shadow đậm hơn khi hover
            transform: 'translateY(-1px)'              // Micro-animation: nổi lên nhẹ
          }
        }
      }
    },

    // Tab: bỏ UPPERCASE, thêm màu khi selected
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: '#555',
          fontSize: '0.9rem',
          '&.Mui-selected': {
            color: '#0b8798', // Màu primary khi tab được chọn
            fontWeight: 600
          }
        }
      }
    },

    // Card: thêm shadow và hover effect
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bo tròn nhiều hơn cho card (premium feel)
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', // Shadow mạnh hơn khi hover
            transform: 'translateY(-2px)'              // Nổi lên nhẹ khi hover
          }
        }
      }
    },

    // TextField: style nhất quán cho inputs
    MuiTextField: {
      defaultProps: {
        size: 'small' // Mặc định dùng size small (gọn hơn)
      }
    },

    // Chip: bo tròn hơn mặc định
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  }
})

export default theme