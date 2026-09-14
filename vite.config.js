// vite.config.js
// Cấu hình Vite build tool cho frontend React app + Vitest testing framework.
//
// Vite là build tool hiện đại thay thế CRA (Create React App):
//  - HMR (Hot Module Replacement): cập nhật UI ngay lập tức khi sửa code
//  - Nhanh hơn webpack nhiều lần nhờ native ES modules
//  - Build production tối ưu với Rollup
//
// Vitest: test runner chạy native trong Vite → dùng chung config, nhanh hơn Jest

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Plugin React với SWC (nhanh hơn Babel)
import svgr from 'vite-plugin-svgr'           // Import SVG như React component
import path from 'path'

export default defineConfig({
  // Expose biến môi trường process.env cho code frontend
  // Cho phép dùng process.env.BUILD_MODE trong constants.js
  define: {
    'process.env.BUILD_MODE': JSON.stringify(process.env.BUILD_MODE)
  },

  plugins: [
    react(),  // Xử lý JSX, React Fast Refresh
    svgr()    // Cho phép: import { ReactComponent as Logo } from './logo.svg'
  ],

  resolve: {
    // Alias '~' → thư mục src
    // Thay vì: import '../../../utils/auth' → có thể viết: import '~/utils/auth'
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },

  // ─── Vitest Configuration ─────────────────────────────────────────────────
  // Chỉ áp dụng khi chạy 'npm test' / 'vitest'
  test: {
    // jsdom: giả lập browser environment (window, document, localStorage)
    // Cần thiết để test React components và browser APIs
    environment: 'jsdom',

    // Tự động import các matchers của @testing-library/jest-dom
    // Cho phép dùng: expect(el).toBeInTheDocument(), toHaveClass(), v.v.
    setupFiles: ['./src/tests/setup.js'],

    // Cho phép dùng describe/it/expect mà không cần import (giống Jest behavior)
    globals: true,

    // Alias để resolve '~/...' trong test files (khớp với resolve.alias trên)
    alias: {
      '~': path.resolve(__dirname, 'src')
    },

    // Coverage configuration (dùng khi chạy 'npm run test:coverage')
    coverage: {
      reporter: ['text', 'html'], // Text: in ra terminal, HTML: mở trong browser
      exclude: [
        'node_modules/',
        'src/tests/',
        'src/main.jsx',
        'src/App.jsx' // Routing - khó test, skip
      ]
    }
  }

  // Lưu ý: base được xoá (trước đây là './AquaLife_Web' - sai, gây lỗi routing)
  // Khi deploy lên Vercel/Netlify, base mặc định là '/' - đúng với SPA routing
})

