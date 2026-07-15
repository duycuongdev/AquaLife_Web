// src/tests/utils/cart.test.js
// Unit tests cho cart utility functions
//
// Test: addToCart, removeFromCart, updateQuantity, cartCount, clearCart

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addToCart, removeFromCart, updateQuantity, cartCount, clearCart } from '~/utils/cart'

// ─── Mock localStorage ────────────────────────────────────────────────────────
let store = {}
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = String(val) }),
  removeItem: vi.fn((key) => { delete store[key] }),
  clear: vi.fn(() => { store = {} })
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// Mock window.dispatchEvent (cartUpdated event)
Object.defineProperty(globalThis, 'window', {
  value: { dispatchEvent: vi.fn() },
  writable: true
})

// ─── Test Data ────────────────────────────────────────────────────────────────
const PRODUCT_A = { _id: 'prod-001', name: 'Cá Koi', price: 150000, imageUrl: '/koi.jpg' }
const PRODUCT_B = { _id: 'prod-002', name: 'Tép cảnh', price: 30000, imageUrl: '/shrimp.jpg' }

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('addToCart()', () => {
  beforeEach(() => {
    store = {}
    vi.clearAllMocks()
  })

  it('thêm sản phẩm mới vào giỏ rỗng', () => {
    localStorageMock.getItem.mockReturnValue(null)
    addToCart(PRODUCT_A, 1)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('tăng quantity nếu sản phẩm đã trong giỏ', () => {
    const initialCart = [{ ...PRODUCT_A, quantity: 2 }]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialCart))

    addToCart(PRODUCT_A, 3) // Thêm 3 nữa

    const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    const item = saved.find(i => i._id === PRODUCT_A._id)
    expect(item?.quantity).toBe(5) // 2 + 3 = 5
  })

  it('thêm sản phẩm khác vào giỏ đã có sản phẩm', () => {
    const initialCart = [{ ...PRODUCT_A, quantity: 1 }]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialCart))

    addToCart(PRODUCT_B, 2)

    const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(saved).toHaveLength(2) // Giỏ có 2 sản phẩm
  })
})

describe('removeFromCart()', () => {
  beforeEach(() => {
    store = {}
    vi.clearAllMocks()
  })

  it('xoá sản phẩm khỏi giỏ', () => {
    const initialCart = [{ ...PRODUCT_A, quantity: 1 }, { ...PRODUCT_B, quantity: 2 }]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialCart))

    removeFromCart(PRODUCT_A._id)

    const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(saved).toHaveLength(1)
    expect(saved[0]._id).toBe(PRODUCT_B._id)
  })

  it('không lỗi khi xoá sản phẩm không tồn tại trong giỏ', () => {
    localStorageMock.getItem.mockReturnValue(null)
    expect(() => removeFromCart('invalid-id')).not.toThrow()
  })
})

describe('cartCount()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('trả về 0 khi giỏ rỗng', () => {
    localStorageMock.getItem.mockReturnValue(null)
    expect(cartCount()).toBe(0)
  })

  it('trả về tổng số lượng tất cả items trong giỏ', () => {
    const cart = [
      { ...PRODUCT_A, quantity: 3 },
      { ...PRODUCT_B, quantity: 7 }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(cart))
    expect(cartCount()).toBe(10) // 3 + 7 = 10
  })
})

describe('clearCart()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('xoá toàn bộ giỏ hàng', () => {
    const cart = [{ ...PRODUCT_A, quantity: 2 }]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(cart))

    clearCart()

    // localStorage.removeItem phải được gọi
    expect(localStorageMock.removeItem).toHaveBeenCalled()
  })
})
