// src/tests/setup.js
// File setup cho Vitest - chạy trước tất cả test files.
//
// Tại sao cần setup file?
//  → Import @testing-library/jest-dom để có thêm matchers
//  → Matchers như toBeInTheDocument(), toHaveClass(), toHaveTextContent()
//     không có sẵn trong Vitest gốc, cần import từ thư viện này

import '@testing-library/jest-dom'
// Các setup toàn cục khác có thể thêm ở đây:
// - Mock global functions
// - Set timezone
// - Configure global error handlers
