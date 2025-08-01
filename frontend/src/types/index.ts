export interface Product {
  id: string
  name: string
  description: string
  category: string
  unit: string
  image?: string
  keywords: string[]
  specifications?: string
}

export interface Provider {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  rating: number
  deliveryTime?: number // en horas
}

export interface Price {
  id: string
  productId: string
  providerId: string
  price: number
  currency: string
  available: boolean
  minQuantity: number
  deliveryTime: number // en horas
  provider: Provider
}

export interface QuotationItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  deliveryTime: number
  provider: Provider
}

export interface Quotation {
  id: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  items: QuotationItem[]
  totalAmount: number
  bestPriceOption?: {
    provider: Provider
    totalPrice: number
    deliveryTime: number
  }
  fastestDeliveryOption?: {
    provider: Provider
    totalPrice: number
    deliveryTime: number
  }
  createdAt: string
  expiresAt: string
  status?: string
  paymentStatus?: string
  subStatus?: string
  notes?: string
}

export interface SearchResult {
  product: Product
  bestPrice: Price
  fastestDelivery: Price | null
  singleProvider?: boolean
}

export interface SearchQuery {
  query: string
  category?: string
  minPrice?: number
  maxPrice?: number
} 