// src/tests/utils/auth.test.js
// Unit tests cho auth utility functions
//
// Dùng Vitest (thay thế Jest cho Vite projects)
// API giống hệt Jest: describe, it, expect, vi (thay jest)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserFromToken, getUserRole, isAuthenticated } from '~/utils/auth'

// ─── Mock localStorage ────────────────────────────────────────────────────────
// localStorage không có trong jsdom environment → phải mock
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = String(val) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// ─── Test Data ────────────────────────────────────────────────────────────────

// JWT token mẫu (đã decode: { id: '123', email: 'test@mail.com', role: 'customer', name: 'Test User' })
// exp: xa trong tương lai để không hết hạn
const MOCK_CUSTOMER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEBtYWlsLmNvbSIsInJvbGUiOiJjdXN0b21lciIsIm5hbWUiOiJUZXN0IFVzZXIiLCJleHAiOjk5OTk5OTk5OTl9.FAKE_SIGNATURE'
const MOCK_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ1NiIsImVtYWlsIjoiYWRtaW5AbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJuYW1lIjoiQWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.FAKE_SIGNATURE'

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getUserFromToken()', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('trả về null khi không có token', () => {
    localStorageMock.getItem.mockReturnValue(null)
    expect(getUserFromToken()).toBeNull()
  })

  it('trả về null với token sai format', () => {
    localStorageMock.getItem.mockReturnValue('không-phải-jwt')
    expect(getUserFromToken()).toBeNull()
  })

  it('trả về payload đúng cho customer token', () => {
    localStorageMock.getItem.mockReturnValue(MOCK_CUSTOMER_TOKEN)
    const user = getUserFromToken()
    expect(user).not.toBeNull()
    expect(user?.role).toBe('customer')
    expect(user?.email).toBe('test@mail.com')
  })

  it('trả về payload đúng cho admin token', () => {
    localStorageMock.getItem.mockReturnValue(MOCK_ADMIN_TOKEN)
    const user = getUserFromToken()
    expect(user?.role).toBe('admin')
  })
})

describe('getUserRole()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('trả về null khi chưa đăng nhập', () => {
    localStorageMock.getItem.mockReturnValue(null)
    expect(getUserRole()).toBeNull()
  })

  it('trả về "customer" cho customer token', () => {
    localStorageMock.getItem.mockReturnValue(MOCK_CUSTOMER_TOKEN)
    expect(getUserRole()).toBe('customer')
  })

  it('trả về "admin" cho admin token', () => {
    localStorageMock.getItem.mockReturnValue(MOCK_ADMIN_TOKEN)
    expect(getUserRole()).toBe('admin')
  })
})

describe('isAuthenticated()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('trả về false khi không có token', () => {
    localStorageMock.getItem.mockReturnValue(null)
    expect(isAuthenticated()).toBe(false)
  })

  it('trả về true khi có token hợp lệ chưa hết hạn', () => {
    localStorageMock.getItem.mockReturnValue(MOCK_CUSTOMER_TOKEN)
    expect(isAuthenticated()).toBe(true)
  })
})
