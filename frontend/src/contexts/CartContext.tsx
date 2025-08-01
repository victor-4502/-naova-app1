import { createContext, useContext, useReducer, ReactNode } from 'react'
import { SearchResult } from '../types'

interface CartItem {
  product: SearchResult['product']
  quantity: number
  selectedProvider: 'bestPrice' | 'fastestDelivery'
  price: number
  deliveryTime: number
  provider: {
    id: string
    name: string
    rating: number
  }
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { result: SearchResult; quantity: number; provider: 'bestPrice' | 'fastestDelivery' } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  addToCart: (result: SearchResult, quantity: number, provider: 'bestPrice' | 'fastestDelivery') => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { result, quantity, provider } = action.payload
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === result.product.id && item.selectedProvider === provider
      )

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        }
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + quantity,
          totalAmount: state.totalAmount + (quantity * (provider === 'bestPrice' ? result.bestPrice.price : result.fastestDelivery.price))
        }
      } else {
        // Add new item
        const priceData = provider === 'bestPrice' ? result.bestPrice : result.fastestDelivery
        const newItem: CartItem = {
          product: result.product,
          quantity,
          selectedProvider: provider,
          price: priceData.price,
          deliveryTime: priceData.deliveryTime,
          provider: priceData.provider
        }
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + quantity,
          totalAmount: state.totalAmount + (quantity * priceData.price)
        }
      }
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload
      const itemIndex = state.items.findIndex(item => item.product.id === productId)
      
      if (itemIndex >= 0) {
        const item = state.items[itemIndex]
        const quantityDiff = quantity - item.quantity
        
        const updatedItems = [...state.items]
        updatedItems[itemIndex] = { ...item, quantity }
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + quantityDiff,
          totalAmount: state.totalAmount + (quantityDiff * item.price)
        }
      }
      return state
    }

    case 'REMOVE_ITEM': {
      const { productId } = action.payload
      const itemIndex = state.items.findIndex(item => item.product.id === productId)
      
      if (itemIndex >= 0) {
        const item = state.items[itemIndex]
        const updatedItems = state.items.filter((_, index) => index !== itemIndex)
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems - item.quantity,
          totalAmount: state.totalAmount - (item.quantity * item.price)
        }
      }
      return state
    }

    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0
      }

    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalAmount: 0
  })

  const addToCart = (result: SearchResult, quantity: number, provider: 'bestPrice' | 'fastestDelivery') => {
    dispatch({ type: 'ADD_ITEM', payload: { result, quantity, provider } })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
    }
  }

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 