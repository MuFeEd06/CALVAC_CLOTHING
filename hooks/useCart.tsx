'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { CartItem, Product, ProductColor } from '@/types'

type CartState = { items: CartItem[] }

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; productId: string; size: string; colorName: string }
  | { type: 'UPDATE_QTY'; productId: string; size: string; colorName: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'INIT'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'INIT':
      return { items: action.items }

    case 'ADD': {
      const existing = state.items.findIndex(
        i =>
          i.product.id === action.item.product.id &&
          i.size === action.item.size &&
          i.color.name === action.item.color.name
      )
      if (existing >= 0) {
        const items = [...state.items]
        items[existing] = { ...items[existing], quantity: items[existing].quantity + action.item.quantity }
        return { items }
      }
      return { items: [...state.items, action.item] }
    }

    case 'REMOVE':
      return {
        items: state.items.filter(
          i => !(i.product.id === action.productId && i.size === action.size && i.color.name === action.colorName)
        ),
      }

    case 'UPDATE_QTY':
      return {
        items: state.items.map(i =>
          i.product.id === action.productId && i.size === action.size && i.color.name === action.colorName
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }

    case 'CLEAR':
      return { items: [] }

    default:
      return state
  }
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, size: string, color: ProductColor, quantity?: number) => void
  removeItem: (productId: string, size: string, colorName: string) => void
  updateQuantity: (productId: string, size: string, colorName: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Persist cart to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calvac-cart')
    if (saved) {
      try {
        const items = JSON.parse(saved)
        dispatch({ type: 'INIT', items })
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('calvac-cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: Product, size: string, color: ProductColor, quantity = 1) => {
    dispatch({ type: 'ADD', item: { product, size, color, quantity } })
  }

  const removeItem = (productId: string, size: string, colorName: string) => {
    dispatch({ type: 'REMOVE', productId, size, colorName })
  }

  const updateQuantity = (productId: string, size: string, colorName: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE', productId, size, colorName })
    } else {
      dispatch({ type: 'UPDATE_QTY', productId, size, colorName, quantity })
    }
  }

  const clearCart = () => dispatch({ type: 'CLEAR' })

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => {
    const price = i.color.price ?? i.product.price
    return sum + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
