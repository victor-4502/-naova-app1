// Configuración de la API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-app.vercel.app/api'  // URL de producción
  : 'http://localhost:5000/api'       // URL de desarrollo

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_PRICES: `${API_BASE_URL}/products/prices`,
  SEARCH: `${API_BASE_URL}/search`,
  CATEGORIES: `${API_BASE_URL}/search/categories`,
  
  // Providers
  PROVIDERS: `${API_BASE_URL}/providers`,
  
  // Quotations
  QUOTATIONS: `${API_BASE_URL}/quotations`,
  USER_QUOTATIONS: `${API_BASE_URL}/quotations/user`,
  PROVIDER_QUOTATIONS: `${API_BASE_URL}/quotations/provider`,
  
  // Admin
  ADMIN_IMPORT_PRODUCTS: `${API_BASE_URL}/admin/import/products`,
  ADMIN_MERGE_PRODUCTS: `${API_BASE_URL}/admin/merge-products`,
  ADMIN_ORDERS_BY_QUOTATION: `${API_BASE_URL}/admin/orders/by-quotation`,
}

export default API_BASE_URL 