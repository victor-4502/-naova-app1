import { useState, useEffect } from 'react'
import { Plus, Upload, Download, Search, Edit, Trash2, Save, X, Eye } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  category: string
  unit: string
  keywords: string
  specifications: string
  price?: number
  provider_id?: number
  stock_quantity?: number
  delivery_time_hours?: number
  provider_name?: string
}

interface ProductPriceEntry {
  id: number
  product_id: number
  provider_id: number
  price: number
  stock_quantity: number
  delivery_time_hours: number
  product_name: string
  product_description: string
  product_category: string
  provider_name: string
}

interface Provider {
  id: number
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
  delivery_time_hours: number
  rating: number
}

interface ProductPrice {
  id: number
  product_id: number
  provider_id: number
  price: number
  stock_quantity: number
  delivery_time_hours: number
  product_name: string
  provider_name: string
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [productPrices, setProductPrices] = useState<ProductPriceEntry[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [prices, setPrices] = useState<ProductPrice[]>([])
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false)
  const [showProviderForm, setShowProviderForm] = useState(false)
  // NUEVO: Eliminar estados de precios que ya no se usan
  // const [showPriceForm, setShowPriceForm] = useState(false)
  // const [priceForm, setPriceForm] = useState({ ... })
  
  // Form data
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    unit: 'unidad',
    keywords: '',
    specifications: '',
    price: '',
    provider_id: '',
    stock_quantity: '',
    delivery_time_hours: ''
  })
  
  const [providerForm, setProviderForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    delivery_time_hours: 24,
    rating: 5.0
  })
  
  // NUEVO: Eliminar completamente el formulario de precios
  // const [priceForm, setPriceForm] = useState({
  //   product_id: '',
  //   provider_id: '',
  //   price: '',
  //   stock_quantity: '',
  //   delivery_time_hours: ''
  // })

  // NUEVO: Estado para categorías y edición
  const [categories, setCategories] = useState<string[]>([])
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [editProductId, setEditProductId] = useState<number | null>(null)

  // NUEVO: Estado para la vista de productos por proveedor
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [productsByProvider, setProductsByProvider] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [bulkEditForm, setBulkEditForm] = useState({
    price: '',
    stock_quantity: '',
    delivery_time_hours: ''
  })

  // NUEVO: Estado para filtros avanzados
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    productName: '',
    category: '',
    provider: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    deliveryTime: '',
    showWithoutProviders: 'no'
  })

  // NUEVO: Estado para filtros de productos por proveedor
  const [productsByProviderFilters, setProductsByProviderFilters] = useState({
    productName: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    deliveryTime: '',
    showWithoutProviders: 'no'
  })

  // NUEVO: Estado para filtros de proveedores
  const [providerFilters, setProviderFilters] = useState({
    rating: '',
    minDeliveryTime: '',
    maxDeliveryTime: ''
  })

  // NUEVO: Estado para modal de detalles de precios
  const [showPriceDetails, setShowPriceDetails] = useState(false)
  const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null)

  // NUEVO: Estado para edición inline tipo Excel
  const [inlineEditMode, setInlineEditMode] = useState(false)
  const [editingCell, setEditingCell] = useState<{rowId: number, field: string} | null>(null)
  const [inlineEditData, setInlineEditData] = useState<{[key: string]: any}>({})

  // NUEVO: Estado para selección múltiple en productos
  const [selectedUniqueProducts, setSelectedUniqueProducts] = useState<number[]>([])

  // NUEVO: Estado para importación
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, message: '' })
  const [importResults, setImportResults] = useState<{success: number, errors: string[]} | null>(null)

  // NUEVO: Estado para unir productos
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [mergeProducts, setMergeProducts] = useState<{source: any, target: any} | null>(null)
  const [mergeComparison, setMergeComparison] = useState<any>(null)
  const [mergeLoading, setMergeLoading] = useState(false)

  // NUEVO: Estado para órdenes de pedido
  const [ordersQuotationId, setOrdersQuotationId] = useState('')
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  // NUEVO: Estado para cotizaciones
  const [quotations, setQuotations] = useState<any[]>([])
  const [quotationsLoading, setQuotationsLoading] = useState(false)
  const [quotationsError, setQuotationsError] = useState('')

  const [providersLoading, setProvidersLoading] = useState(false)

  // 1. Agrega un estado editProviderId:
  const [editProviderId, setEditProviderId] = useState<number | null>(null)

  // Filtro de estatus
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pedido', label: 'Pedido' },
    { value: 'finalizada', label: 'Finalizada' },
  ];

  const statusOrder = ['pendiente', 'pedido', 'finalizada'];

  const tabs = [
    { id: 'products', name: 'Productos', icon: '📦' },
    { id: 'providers', name: 'Proveedores', icon: '🏢' },
    { id: 'products-by-provider', name: 'Productos por Proveedor', icon: '📊' },
    { id: 'import', name: 'Importar', icon: '📥' },
    { id: 'orders', name: 'Órdenes de Pedido', icon: '📑' },
    { id: 'quotations', name: 'Cotizaciones', icon: '📝' }
  ]

  // Estado para alternar vista de cotizaciones
  const [quotationsView, setQuotationsView] = useState<'table' | 'cards'>('table');

  // Load data functions
  const loadProducts = async () => {
    setLoading(true)
    try {
      console.log('🔄 Cargando productos...')
      
      // Cargar productos básicos
      const productsResponse = await fetch('http://localhost:5000/api/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        console.log('📦 Productos cargados:', productsData.length)
        setProducts(productsData)
      } else {
        console.error('❌ Error cargando productos:', productsResponse.status)
      }
      
      // Cargar todos los productos con sus precios de una vez
      const pricesResponse = await fetch('http://localhost:5000/api/products/prices')
      if (pricesResponse.ok) {
        const pricesData = await pricesResponse.json()
        console.log('💰 Precios cargados:', pricesData.length)
        setProductPrices(pricesData)
      } else {
        console.error('❌ Error cargando precios:', pricesResponse.status)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProviders = async () => {
    setProvidersLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/providers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      }
    } catch (error) {
      console.error('Error loading providers:', error)
    } finally {
      setProvidersLoading(false)
    }
  }

  // NUEVO: Cargar categorías desde el backend
  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/search/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories.map((c: any) => c.category))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // NUEVO: Cargar productos por proveedor
  const loadProductsByProvider = async (providerId?: string) => {
    setLoading(true)
    try {
      if (providerId) {
        // Cargar productos de un proveedor específico
        const response = await fetch(`http://localhost:5000/api/providers/${providerId}/products`)
        if (response.ok) {
          const data = await response.json()
          setProductsByProvider(data.products || [])
        }
      } else {
        // Cargar todos los productos con información de precios
        const response = await fetch('http://localhost:5000/api/products/prices')
        if (response.ok) {
          const data = await response.json()
          setProductsByProvider(data)
        }
      }
    } catch (error) {
      console.error('Error loading products by provider:', error)
    } finally {
      setLoading(false)
    }
  }

  // NUEVO: Seleccionar/deseleccionar producto
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // NUEVO: Función para seleccionar productos únicos
  const toggleUniqueProductSelection = (productId: number) => {
    setSelectedUniqueProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleAllProducts = () => {
    const filteredProducts = getFilteredProductsByProvider()
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p: any) => p.id))
    }
  }

  // NUEVO: Función para seleccionar todos los productos únicos
  const toggleAllUniqueProducts = () => {
    const filteredUniqueProducts = getFilteredUniqueProducts()
    if (selectedUniqueProducts.length === filteredUniqueProducts.length) {
      setSelectedUniqueProducts([])
    } else {
      setSelectedUniqueProducts(filteredUniqueProducts.map((p: any) => p.id))
    }
  }

  // NUEVO: Función para eliminar productos únicos en lote
  const deleteSelectedUniqueProducts = async () => {
    if (selectedUniqueProducts.length === 0) return
    
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedUniqueProducts.length} productos?`)) {
      return
    }
    
    setLoading(true)
    let successCount = 0
    
    for (const productId of selectedUniqueProducts) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          successCount++
        }
      } catch (error) {
        console.error(`Error eliminando producto ${productId}:`, error)
      }
    }
    
    setSelectedUniqueProducts([])
    await loadProducts()
    setLoading(false)
    
    alert(`${successCount} productos eliminados exitosamente`)
  }

  // NUEVO: Aplicar edición en lote
  const applyBulkEdit = async () => {
    if (selectedProducts.length === 0) return
    
    try {
      const updates = selectedProducts.map(async (productId) => {
        const product = productsByProvider.find(p => (p.id || p.product_id) === productId)
        if (!product) return
        
        const updateData: any = {}
        if (bulkEditForm.price) updateData.price = parseFloat(bulkEditForm.price)
        if (bulkEditForm.stock_quantity) updateData.stock_quantity = parseInt(bulkEditForm.stock_quantity)
        if (bulkEditForm.delivery_time_hours) updateData.delivery_time_hours = parseInt(bulkEditForm.delivery_time_hours)
        
        if (Object.keys(updateData).length > 0) {
          // Actualizar precio del producto usando el ID del precio
          const priceId = product.id || product.price_id
          await fetch(`http://localhost:5000/api/products/prices/${priceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          })
        }
      })
      
      await Promise.all(updates)
      setBulkEditMode(false)
      setSelectedProducts([])
      setBulkEditForm({ price: '', stock_quantity: '', delivery_time_hours: '' })
      loadProductsByProvider(selectedProvider)
    } catch (error) {
      console.error('Error applying bulk edit:', error)
    }
  }

  // NUEVO: Eliminar productos seleccionados
  const deleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) return
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedProducts.length} productos?`)) return
    
    try {
      const deletes = selectedProducts.map(async (productId) => {
        await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE'
        })
      })
      
      await Promise.all(deletes)
      setSelectedProducts([])
      loadProductsByProvider(selectedProvider)
    } catch (error) {
      console.error('Error deleting products:', error)
    }
  }

  // NUEVO: Abrir formulario de edición
  const openEditProduct = async (product: Product) => {
    setEditProductId(product.id)
    
    // Cargar precios del producto
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product.id}/prices`)
      if (response.ok) {
        const productData = await response.json()
        const firstPrice = productData.prices?.[0]
        
        setProductForm({
          name: product.name,
          description: product.description,
          category: product.category,
          unit: product.unit || 'unidad',
          keywords: product.keywords || '',
          specifications: product.specifications || '',
          price: firstPrice ? firstPrice.price.toString() : '',
          provider_id: firstPrice ? firstPrice.provider.id.toString() : '',
          stock_quantity: firstPrice ? firstPrice.stockQuantity.toString() : '',
          delivery_time_hours: firstPrice ? firstPrice.deliveryTime.toString() : ''
        })
      } else {
        setProductForm({
          name: product.name,
          description: product.description,
          category: product.category,
          unit: product.unit || 'unidad',
          keywords: product.keywords || '',
          specifications: product.specifications || '',
          price: '',
          provider_id: '',
          stock_quantity: '',
          delivery_time_hours: ''
        })
      }
    } catch (error) {
      console.error('Error loading product prices:', error)
      setProductForm({
        name: product.name,
        description: product.description,
        category: product.category,
        unit: product.unit || 'unidad',
        keywords: product.keywords || '',
        specifications: product.specifications || '',
        price: '',
        provider_id: '',
        stock_quantity: '',
        delivery_time_hours: ''
      })
    }
    
    setShowProductForm(true)
    setShowNewCategoryInput(false)
  }

  // NUEVO: Guardar edición con precio
  const saveEditProduct = async () => {
    if (!editProductId) return
    try {
      // Actualizar el producto
      const productResponse = await fetch(`http://localhost:5000/api/products/${editProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          specifications: productForm.specifications
        })
      })
      
      if (productResponse.ok) {
        // Si hay precio y proveedor, actualizar o crear el precio
        if (productForm.price && productForm.provider_id) {
          // Primero verificar si ya existe un precio para este producto y proveedor
          const existingPrice = await fetch(`http://localhost:5000/api/products/${editProductId}/prices`)
          const prices = await existingPrice.json()
          
          const priceExists = prices.prices?.some((p: any) => p.provider.id === parseInt(productForm.provider_id))
          
          if (priceExists) {
            // Actualizar precio existente (necesitaríamos el ID del precio)
            // Por simplicidad, eliminamos y recreamos
            // TODO: Implementar actualización directa
          } else {
            // Crear nuevo precio
            await fetch('http://localhost:5000/api/products/prices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_id: editProductId,
                provider_id: parseInt(productForm.provider_id),
                price: parseFloat(productForm.price),
                stock_quantity: parseInt(productForm.stock_quantity) || 0,
                delivery_time_hours: parseInt(productForm.delivery_time_hours) || 24
              })
            })
          }
        }
        
        setShowProductForm(false)
        setEditProductId(null)
        setProductForm({ 
          name: '', 
          description: '', 
          category: '', 
          unit: 'unidad', 
          keywords: '', 
          specifications: '',
          price: '',
          provider_id: '',
          stock_quantity: '',
          delivery_time_hours: ''
        })
        loadProducts()
      }
    } catch (error) {
      console.error('Error editing product:', error)
    }
  }

  // Provider functions
  const createProvider = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerForm)
      })
      if (response.ok) {
        setShowProviderForm(false)
        setProviderForm({ name: '', contact_person: '', phone: '', email: '', address: '', delivery_time_hours: 24, rating: 5.0 })
        loadProviders()
      }
    } catch (error) {
      console.error('Error creating provider:', error)
    }
  }

  const deleteProvider = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor?')) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/providers/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        loadProviders()
      }
    } catch (error) {
      console.error('Error deleting provider:', error)
    }
  }

  // NUEVO: Función para filtrar productos
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Filtro para mostrar solo productos sin proveedores
      if (filters.showWithoutProviders === 'yes') {
        const hasProvider = productPrices.some(pp => pp.product_id === product.id)
        if (hasProvider) return false
      }
      // Filtro por búsqueda de texto
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.provider_name && product.provider_name.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      // Filtro por categoría
      if (filters.category && product.category !== filters.category) return false

      // Filtro por proveedor
      if (filters.provider && product.provider_name !== filters.provider) return false

      // Filtro por precio mínimo
      if (filters.minPrice && product.price && product.price < parseFloat(filters.minPrice)) return false

      // Filtro por precio máximo
      if (filters.maxPrice && product.price && product.price > parseFloat(filters.maxPrice)) return false

      // Filtro por stock mínimo
      if (filters.minStock && product.stock_quantity && product.stock_quantity < parseInt(filters.minStock)) return false

      // Filtro por stock máximo
      if (filters.maxStock && product.stock_quantity && product.stock_quantity > parseInt(filters.maxStock)) return false

      // Filtro por tiempo de entrega (si alguno de los proveedores coincide)
      if (filters.deliveryTime) {
        // Buscar en productPrices si hay algún proveedor para este producto con el tiempo de entrega solicitado
        const matchingPrice = productPrices.find(
          (p) => p.product_id === product.id && p.delivery_time_hours === parseInt(filters.deliveryTime)
        )
        if (!matchingPrice) return false
      }

      return true
    })
  }

  // NUEVO: Función para filtrar proveedores
  const getFilteredProviders = () => {
    return providers.filter(provider => {
      // Filtro por búsqueda de texto
      const matchesSearch = 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.contact_person.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // Filtro por rating
      if (providerFilters.rating && provider.rating !== parseFloat(providerFilters.rating)) return false

      // Filtro por tiempo de entrega mínimo
      if (providerFilters.minDeliveryTime && provider.delivery_time_hours < parseInt(providerFilters.minDeliveryTime)) return false

      // Filtro por tiempo de entrega máximo
      if (providerFilters.maxDeliveryTime && provider.delivery_time_hours > parseInt(providerFilters.maxDeliveryTime)) return false

      return true
    })
  }

  // NUEVO: Obtener categorías únicas para el filtro
  const getUniqueCategories = () => {
    return [...new Set(products.map(p => p.category))].sort()
  }

  // NUEVO: Obtener proveedores únicos para el filtro
  const getUniqueProviders = () => {
    return [...new Set(products.map(p => p.provider_name).filter(Boolean))].sort()
  }

  // NUEVO: Limpiar filtros
  const clearFilters = () => {
    setFilters({
      productName: '',
      category: '',
      provider: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      deliveryTime: '',
      showWithoutProviders: 'no'
    })
  }

  // NUEVO: Limpiar filtros de proveedores
  const clearProviderFilters = () => {
    setProviderFilters({
      rating: '',
      minDeliveryTime: '',
      maxDeliveryTime: ''
    })
  }

  // NUEVO: Función para filtrar productos por proveedor
  const getFilteredProductsByProvider = () => {
    return productsByProvider.filter(product => {
      const productName = product.name || product.product_name || ''
      const category = product.category || product.product_category || ''
      const price = product.price || 0
      const stock = product.stock_quantity || product.stockQuantity || 0
      const delivery = product.delivery_time_hours || product.deliveryTime || 24

      // Filtro por nombre del producto
      if (productsByProviderFilters.productName && !productName.toLowerCase().includes(productsByProviderFilters.productName.toLowerCase())) return false

      // Filtro por búsqueda de texto
      const matchesSearch = 
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.provider_name || '').toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // Filtro por categoría
      if (productsByProviderFilters.category && category !== productsByProviderFilters.category) return false

      // Filtro por precio mínimo
      if (productsByProviderFilters.minPrice && price < parseFloat(productsByProviderFilters.minPrice)) return false

      // Filtro por precio máximo
      if (productsByProviderFilters.maxPrice && price > parseFloat(productsByProviderFilters.maxPrice)) return false

      // Filtro por stock mínimo
      if (productsByProviderFilters.minStock && stock < parseInt(productsByProviderFilters.minStock)) return false

      // Filtro por stock máximo
      if (productsByProviderFilters.maxStock && stock > parseInt(productsByProviderFilters.maxStock)) return false

      // Filtro por tiempo de entrega
      if (productsByProviderFilters.deliveryTime && delivery !== parseInt(productsByProviderFilters.deliveryTime)) return false

      return true
    })
  }

  // NUEVO: Función para limpiar filtros de productos por proveedor
  const clearProductsByProviderFilters = () => {
    setProductsByProviderFilters({
      productName: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      deliveryTime: '',
      showWithoutProviders: 'no'
    })
  }

  // NUEVO: Funciones para edición inline tipo Excel
  const startInlineEdit = (rowId: number, field: string, currentValue: any) => {
    if (!inlineEditMode) return
    setEditingCell({ rowId, field })
    setInlineEditData({ ...inlineEditData, [`${rowId}-${field}`]: currentValue })
  }

  const saveInlineEdit = async (rowId: number, field: string) => {
    if (!editingCell || editingCell.rowId !== rowId || editingCell.field !== field) return
    
    const newValue = inlineEditData[`${rowId}-${field}`]
    const product = productsByProvider.find(p => (p.id || p.product_id) === rowId)
    
    if (!product) return

    try {
      const updateData: any = {}
      
      switch (field) {
        case 'price':
          updateData.price = parseFloat(newValue)
          break
        case 'stock':
          updateData.stock_quantity = parseInt(newValue)
          break
        case 'delivery':
          updateData.delivery_time_hours = parseInt(newValue)
          break
      }

      if (Object.keys(updateData).length > 0) {
        const priceId = product.id || product.price_id
        await fetch(`http://localhost:5000/api/products/prices/${priceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        // Recargar datos
        loadProductsByProvider(selectedProvider)
      }
    } catch (error) {
      console.error('Error saving inline edit:', error)
    }
    
    setEditingCell(null)
  }

  const cancelInlineEdit = () => {
    setEditingCell(null)
  }

  const handleInlineEditChange = (rowId: number, field: string, value: any) => {
    setInlineEditData({ ...inlineEditData, [`${rowId}-${field}`]: value })
  }

  // NUEVO: Cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === 'products') loadProducts()
    if (activeTab === 'providers') loadProviders()
    if (activeTab === 'products-by-provider') {
      loadProviders() // Para el selector de proveedores
      loadProductsByProvider()
    }
  }, [activeTab])

  // NUEVO: Cargar categorías y proveedores al abrir formulario
  useEffect(() => {
    if (showProductForm || editProductId !== null) {
      loadCategories()
      loadProviders()
    }
  }, [showProductForm, editProductId])

  // Product functions
  const createProduct = async () => {
    try {
      // Primero crear el producto
      const productResponse = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          specifications: productForm.specifications
        })
      })
      
      if (productResponse.ok) {
        const newProduct = await productResponse.json()
        
        // Si hay precio y proveedor, crear el precio
        if (productForm.price && productForm.provider_id) {
          await fetch('http://localhost:5000/api/products/prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: newProduct.id,
              provider_id: parseInt(productForm.provider_id),
              price: parseFloat(productForm.price),
              stock_quantity: parseInt(productForm.stock_quantity) || 0,
              delivery_time_hours: parseInt(productForm.delivery_time_hours) || 24
            })
          })
        }
        
        setShowProductForm(false)
        setProductForm({ 
          name: '', 
          description: '', 
          category: '', 
          unit: 'unidad', 
          keywords: '', 
          specifications: '',
          price: '',
          provider_id: '',
          stock_quantity: '',
          delivery_time_hours: ''
        })
        loadProducts()
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        loadProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  // NUEVO: Función para agrupar productos únicos
  const getUniqueProducts = () => {
    const productMap = new Map()
    
    console.log('🔍 Procesando productos únicos...')
    console.log('📊 Total de productos en BD:', products.length)
    console.log('📊 Total de precios a procesar:', productPrices.length)
    
    // Primero agregar todos los productos (tengan o no precios)
    products.forEach(product => {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        unit: product.unit || 'unidad',
        keywords: product.keywords || '',
        specifications: product.specifications || '',
        providers: [],
        priceRange: { min: Infinity, max: 0 }
      })
    })
    
    // Luego agregar información de precios
    productPrices.forEach(priceEntry => {
      if (productMap.has(priceEntry.product_id)) {
        const existing = productMap.get(priceEntry.product_id)
        if (priceEntry.provider_name && priceEntry.price) {
          existing.providers.push({
            id: priceEntry.provider_id,
            name: priceEntry.provider_name,
            price: priceEntry.price,
            stock: priceEntry.stock_quantity || 0,
            delivery: priceEntry.delivery_time_hours || 24
          })
          
          // Actualizar rango de precios
          existing.priceRange.min = Math.min(existing.priceRange.min, priceEntry.price)
          existing.priceRange.max = Math.max(existing.priceRange.max, priceEntry.price)
        }
      }
    })
    
    const result = Array.from(productMap.values()).map(product => ({
      ...product,
      providerCount: product.providers.length,
      priceDisplay: product.providers.length > 0 
        ? `Desde $${product.priceRange.min.toLocaleString()}`
        : 'Sin precio'
    }))
    
    console.log('🎯 Productos únicos encontrados:', result.length)
    console.log('📋 Últimos 5 productos:', result.slice(-5).map(p => p.name))
    
    return result
  }

  // NUEVO: Función para filtrar productos únicos
  const getFilteredUniqueProducts = () => {
    const uniqueProducts = getUniqueProducts()
    
    return uniqueProducts.filter(product => {
      // Filtro por nombre del producto
      if (filters.productName && !product.name.toLowerCase().includes(filters.productName.toLowerCase())) return false

      // Filtro por búsqueda de texto
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.providers.some((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      // Filtro por categoría
      if (filters.category && product.category !== filters.category) return false

      // Filtro por proveedor (si alguno de los proveedores del producto coincide)
      if (filters.provider && !product.providers.some((p: any) => p.name === filters.provider)) return false

      // Filtro por precio mínimo
      if (filters.minPrice && product.priceRange.min < parseFloat(filters.minPrice)) return false

      // Filtro por precio máximo
      if (filters.maxPrice && product.priceRange.max > parseFloat(filters.maxPrice)) return false

      // Filtro por stock mínimo (si alguno de los proveedores tiene suficiente stock)
      if (filters.minStock && !product.providers.some((p: any) => p.stock >= parseInt(filters.minStock))) return false

      // Filtro por stock máximo (si alguno de los proveedores tiene menos stock)
      if (filters.maxStock && !product.providers.some((p: any) => p.stock <= parseInt(filters.maxStock))) return false

      // Filtro por tiempo de entrega (si alguno de los proveedores coincide)
      if (filters.deliveryTime && !product.providers.some((p: any) => p.delivery === parseInt(filters.deliveryTime))) return false

      // Filtro para mostrar solo productos sin proveedores
      if (filters.showWithoutProviders === 'yes' && product.providers.length > 0) return false

      return true
    })
  }

  // NUEVO: Función para mostrar detalles de precios
  const showProductPriceDetails = async (product: any) => {
    setSelectedProductDetails(product)
    setShowPriceDetails(true)
  }

  // NUEVO: Funciones de importación
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n')
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    console.log('📋 Headers encontrados:', headers)
    
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          let value = values[index] || ''
          
          // Limpiar espacios y comillas extra
          value = value.trim().replace(/^["']|["']$/g, '')
          
          // Convertir números si es necesario
          if (header === 'price' || header === 'precio') {
            value = value.replace(',', '.') // Cambiar comas por puntos
          }
          
          row[header] = value
        })
        
        console.log(`📊 Fila ${i + 1} parseada:`, {
          name: row.name,
          price: row.price,
          provider_id: row.provider_id,
          priceType: typeof row.price,
          providerType: typeof row.provider_id
        })
        
        data.push(row)
      }
    }
    
    console.log('📦 Total de filas parseadas:', data.length)
    return data
  }

  const importProducts = async (file: File) => {
    setImporting(true)
    setImportProgress({ current: 0, total: 0, message: 'Subiendo archivo...' })
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/import/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      if (response.ok) {
        const data = await response.json()
        setImportResults({
          success: data.imported,
          errors: (data.errors || []).map((err: any) => typeof err === 'string' ? err : (err.error || JSON.stringify(err)))
        })
        // Recargar productos si hubo importados
        if (data.imported > 0) {
          await loadProducts()
          await loadCategories()
          await loadProductsByProvider()
        }
      } else {
        const errorData = await response.json()
        setImportResults({ success: 0, errors: [errorData.error || 'Error desconocido'] })
      }
    } catch (error) {
      setImportResults({ success: 0, errors: ['Error de conexión o de archivo'] })
    } finally {
      setImporting(false)
      setImportProgress({ current: 0, total: 0, message: '' })
    }
  }

  const importPrices = async (file: File) => {
    // Esta función ya no se usa, pero la mantengo por compatibilidad
    setImporting(true)
    setImportProgress({ current: 0, total: 0, message: 'Leyendo archivo...' })
    setImportResults(null)
    
    try {
      const text = await file.text()
      const prices = parseCSV(text)
      
      if (prices.length === 0) {
        setImportResults({ success: 0, errors: ['El archivo CSV está vacío o no tiene el formato correcto'] })
        return
      }
      
      setImportProgress({ current: 0, total: prices.length, message: 'Importando precios...' })
      
      let successCount = 0
      const errors: string[] = []
      
      for (let i = 0; i < prices.length; i++) {
        const price = prices[i]
        setImportProgress({ current: i + 1, total: prices.length, message: `Importando precio para: ${price.product_name || price.nombre_producto || 'Producto sin nombre'}` })
        
        try {
          const response = await fetch('http://localhost:5000/api/products/prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: parseInt(price.product_id || price.id_producto || '0'),
              provider_id: parseInt(price.provider_id || price.id_proveedor || '0'),
              price: parseFloat(price.price || price.precio || '0'),
              stock_quantity: parseInt(price.stock_quantity || price.stock || price.cantidad_stock || '0'),
              delivery_time_hours: parseInt(price.delivery_time_hours || price.tiempo_entrega || '24')
            })
          })
          
          if (response.ok) {
            successCount++
          } else {
            const errorData = await response.json()
            errors.push(`Fila ${i + 2}: ${errorData.error || 'Error desconocido'}`)
          }
        } catch (error) {
          errors.push(`Fila ${i + 2}: Error de conexión`)
        }
      }
      
      setImportResults({ success: successCount, errors })
      
      if (successCount > 0) {
        loadProducts()
        loadProductsByProvider()
      }
      
    } catch (error) {
      setImportResults({ success: 0, errors: ['Error al leer el archivo CSV'] })
    } finally {
      setImporting(false)
      setImportProgress({ current: 0, total: 0, message: '' })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'prices') => {
    const file = event.target.files?.[0]
    if (file) {
      if (type === 'products') {
        importProducts(file)
      } else {
        importPrices(file)
      }
    }
    event.target.value = ''
  }

  // NUEVO: Funciones para unir productos
  const findSimilarProducts = (productName: string, productId: number) => {
    const similarProducts = products.filter(p => 
      p.id !== productId && (
        p.name.toLowerCase().includes(productName.toLowerCase()) ||
        productName.toLowerCase().includes(p.name.toLowerCase())
      )
    )
    return similarProducts
  }

  const compareProducts = (product1: any, product2: any) => {
    const comparison = {
      name: {
        product1: product1.name,
        product2: product2.name,
        similarity: calculateSimilarity(product1.name, product2.name)
      },
      description: {
        product1: product1.description,
        product2: product2.description,
        similarity: calculateSimilarity(product1.description, product2.description)
      },
      category: {
        product1: product1.category,
        product2: product2.category,
        match: product1.category === product2.category
      },
      unit: {
        product1: product1.unit,
        product2: product2.unit,
        match: product1.unit === product2.unit
      },
      providers: {
        product1: productPrices.filter(p => p.product_id === product1.id).length,
        product2: productPrices.filter(p => p.product_id === product2.id).length,
        total: productPrices.filter(p => p.product_id === product1.id).length + 
               productPrices.filter(p => p.product_id === product2.id).length
      }
    }
    return comparison
  }

  const calculateSimilarity = (str1: string, str2: string) => {
    const words1 = str1.toLowerCase().split(/\s+/)
    const words2 = str2.toLowerCase().split(/\s+/)
    const commonWords = words1.filter(word => words2.includes(word))
    const totalWords = new Set([...words1, ...words2]).size
    return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0
  }

  const openMergeModal = (sourceProduct: any) => {
    const similarProducts = findSimilarProducts(sourceProduct.name, sourceProduct.id)
    if (similarProducts.length === 0) {
      alert('No se encontraron productos similares para unir')
      return
    }
    
    // Mostrar modal de selección
    setMergeProducts({ source: sourceProduct, target: null })
    setShowMergeModal(true)
  }

  const selectTargetProduct = (targetProduct: any) => {
    if (!mergeProducts) return
    
    const comparison = compareProducts(mergeProducts.source, targetProduct)
    setMergeComparison(comparison)
    setMergeProducts({ ...mergeProducts, target: targetProduct })
  }

  const mergeProductsAction = async () => {
    if (!mergeProducts?.source || !mergeProducts?.target) return
    
    setMergeLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/admin/merge-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceProductId: mergeProducts.source.id,
          targetProductId: mergeProducts.target.id
        })
      })

      if (response.ok) {
        alert('Productos unidos exitosamente')
        setShowMergeModal(false)
        setMergeProducts(null)
        setMergeComparison(null)
        loadProducts() // Recargar datos
      } else {
        const error = await response.json()
        alert(`Error al unir productos: ${error.message}`)
      }
    } catch (error) {
      console.error('Error merging products:', error)
      alert('Error al unir productos')
    } finally {
      setMergeLoading(false)
    }
  }

  // NUEVO: Buscar órdenes por cotización
  const fetchOrdersByQuotation = async (quotationId: string) => {
    setOrdersLoading(true)
    setOrdersError('')
    setOrdersList([])
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/by-quotation/${quotationId}`)
      if (!res.ok) {
        const err = await res.json()
        setOrdersError(err.error || 'Error al buscar órdenes')
        setOrdersLoading(false)
        return
      }
      const data = await res.json()
      setOrdersList(data.orders || [])
    } catch (e) {
      setOrdersError('Error de red o servidor')
    } finally {
      setOrdersLoading(false)
    }
  }

  // NUEVO: Cargar cotizaciones (con token)
  const loadQuotations = async () => {
    setQuotationsLoading(true);
    setQuotationsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/quotations?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setQuotations(data);
      } else {
        setQuotationsError('Error al cargar cotizaciones');
      }
    } catch (error) {
      setQuotationsError('Error al cargar cotizaciones');
    } finally {
      setQuotationsLoading(false);
    }
  };

  // Eliminar proveedor
  const handleDeleteProvider = async (providerId: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este proveedor?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/providers/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setProviders(providers.filter(p => p.id !== providerId));
      } else {
        alert('Error al eliminar proveedor');
      }
    } catch (error) {
      alert('Error al eliminar proveedor');
    }
  };

  // Contar productos por proveedor usando productPrices
  const getProductCountForProvider = (providerId: number) => {
    // Usar productPrices para contar productos únicos asociados a este proveedor
    const uniqueProductIds = new Set(productPrices.filter(pp => pp.provider_id === providerId).map(pp => pp.product_id));
    return uniqueProductIds.size;
  };

  // NUEVO: Cambiar status de cotización
  const updateQuotationStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/quotations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        loadQuotations()
      }
    } catch (e) {
      alert('Error actualizando status')
    }
  }

  // Cargar cotizaciones al entrar a la pestaña
  useEffect(() => {
    if (activeTab === 'quotations') {
      loadQuotations()
    }
  }, [activeTab])

  // Filtrar cotizaciones por status
  const pendingQuotations = quotations.filter(q => q.status === 'pendiente');

  // Agrega la función updateProvider para editar proveedores
  const updateProvider = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/providers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(providerForm)
      });
      if (response.ok) {
        await loadProviders();
        setShowProviderForm(false);
        setEditProviderId(null);
      } else {
        alert('Error al actualizar el proveedor');
      }
    } catch (error) {
      alert('Error al actualizar el proveedor');
    }
  };

  // 1. Agregar función para marcar como pagado
  const markAsPaid = async (quotationId: number) => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ payment_status: 'pagado' }),
      });
      if (!response.ok) throw new Error('Error al marcar como pagado');
      // Refrescar la lista de cotizaciones
      await loadQuotations();
      alert('Cotización marcada como pagada y movida a Pedido.');
    } catch (err) {
      alert('No se pudo marcar como pagado.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel Administrativo
        </h1>
        <p className="text-gray-600">
          Gestiona productos, proveedores y precios
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          {activeTab === 'products' && (
            <button 
              onClick={() => setShowProductForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </button>
          )}
          {activeTab === 'providers' && (
            <button 
              onClick={() => setShowProviderForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Proveedor
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow w-full mx-0">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && activeTab === 'products' && (
          <div className="p-6 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Productos ({getFilteredUniqueProducts().length} de {getUniqueProducts().length})
              </h2>
              <div className="flex gap-2">
                {selectedUniqueProducts.length > 0 && (
                  <>
                    <button
                      onClick={deleteSelectedUniqueProducts}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Eliminar {selectedUniqueProducts.length} productos
                    </button>
                  </>
                )}
                <button
                  onClick={loadProducts}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  🔄 Recargar
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                </button>
                <button
                  onClick={() => setSelectedUniqueProducts([])}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Quitar selección
                </button>
              </div>
            </div>

            {/* Filtros avanzados */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.productName}
                      onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
                      placeholder="Buscar por nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      <option value="">Todas las categorías</option>
                      {getUniqueCategories().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.provider}
                      onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                    >
                      <option value="">Todos los proveedores</option>
                      {getUniqueProviders().map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio mínimo</label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="999999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.minStock}
                      onChange={(e) => setFilters({ ...filters, minStock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock máximo</label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.maxStock}
                      onChange={(e) => setFilters({ ...filters, maxStock: e.target.value })}
                      placeholder="999999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de entrega (h)</label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.deliveryTime}
                      onChange={(e) => setFilters({ ...filters, deliveryTime: e.target.value })}
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mostrar productos sin proveedores</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={filters.showWithoutProviders}
                      onChange={(e) => setFilters({ ...filters, showWithoutProviders: e.target.value })}
                    >
                      <option value="no">Todos los productos</option>
                      <option value="yes">Solo sin proveedores</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de productos agrupados */}
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-sm">
                      <input
                        type="checkbox"
                        checked={selectedUniqueProducts.length === getFilteredUniqueProducts().length && getFilteredUniqueProducts().length > 0}
                        onChange={toggleAllUniqueProducts}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-sm">Producto</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-sm">Categoría</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-sm">Proveedores</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-sm">Precio</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredUniqueProducts().map((product) => (
                    <tr key={product.id}>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked={selectedUniqueProducts.includes(product.id)}
                          onChange={() => toggleUniqueProductSelection(product.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <div className="text-sm text-gray-900">
                          {product.providerCount} proveedor{product.providerCount !== 1 ? 'es' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.providers.slice(0, 2).map((p: any) => p.name).join(', ')}
                          {product.providers.length > 2 && ` +${product.providers.length - 2} más`}
                        </div>
                        <div className="text-[11px] text-blue-700 font-mono mt-1">
                          {product.providers.map((p: any) => `ID: ${p.id}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <div className="text-sm font-medium text-green-600">
                          {product.priceDisplay}
                        </div>
                        {product.providers.length > 1 && (
                          <div className="text-xs text-gray-500">
                            Hasta ${product.priceRange.max.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openMergeModal(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Unir con producto similar"
                          >
                            🔗
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'providers' && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">Proveedores</h2>
            {providersLoading ? (
              <p>Cargando proveedores...</p>
            ) : providers.length === 0 ? (
              <p>No hay proveedores registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">ID</th>
                      <th className="border px-2 py-1">Nombre</th>
                      <th className="border px-2 py-1">Contacto</th>
                      <th className="border px-2 py-1">Teléfono</th>
                      <th className="border px-2 py-1">Email</th>
                      <th className="border px-2 py-1">Dirección</th>
                      <th className="border px-2 py-1">Productos</th>
                      <th className="border px-2 py-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map(provider => (
                      <tr key={provider.id}>
                        <td className="border px-2 py-1 font-bold text-blue-700">{provider.id}</td>
                        <td className="border px-2 py-1">{provider.name}</td>
                        <td className="border px-2 py-1">{provider.contact_person}</td>
                        <td className="border px-2 py-1">{provider.phone}</td>
                        <td className="border px-2 py-1">{provider.email}</td>
                        <td className="border px-2 py-1">{provider.address}</td>
                        <td className="border px-2 py-1">{getProductCountForProvider(provider.id)}</td>
                        <td className="border px-2 py-1">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setProviderForm({
                                  name: provider.name,
                                  contact_person: provider.contact_person,
                                  phone: provider.phone,
                                  email: provider.email,
                                  address: provider.address,
                                  delivery_time_hours: provider.delivery_time_hours,
                                  rating: provider.rating
                                });
                                setEditProviderId(provider.id);
                                setShowProviderForm(true);
                              }}
                              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {!loading && activeTab === 'products-by-provider' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Productos por Proveedor ({getFilteredProductsByProvider().length} de {productsByProvider.length})
              </h2>
              <div className="flex gap-2">
                {selectedProducts.length > 0 && (
                  <>
                    <button
                      onClick={() => setBulkEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Editar {selectedProducts.length} productos
                    </button>
                    <button
                      onClick={deleteSelectedProducts}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Eliminar {selectedProducts.length} productos
                    </button>
                  </>
                )}
                <button
                  onClick={() => setInlineEditMode(!inlineEditMode)}
                  className={`px-4 py-2 rounded-md ${
                    inlineEditMode 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {inlineEditMode ? 'Salir Edición' : 'Edición Inline'}
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Quitar selección
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por proveedor</label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={selectedProvider}
                      onChange={(e) => {
                        setSelectedProvider(e.target.value)
                        loadProductsByProvider(e.target.value)
                      }}
                    >
                      <option value="">Todos los proveedores</option>
                      {providers.map(provider => (
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buscar productos</label>
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                </button>
              </div>

              {/* Filtros avanzados */}
              {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.productName}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, productName: e.target.value })}
                        placeholder="Buscar por nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.category}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, category: e.target.value })}
                      >
                        <option value="">Todas las categorías</option>
                        {getUniqueCategories().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio mínimo</label>
                      <input
                        type="number"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.minPrice}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, minPrice: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
                      <input
                        type="number"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.maxPrice}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, maxPrice: e.target.value })}
                        placeholder="999999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                      <input
                        type="number"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.minStock}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, minStock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock máximo</label>
                      <input
                        type="number"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.maxStock}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, maxStock: e.target.value })}
                        placeholder="999999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de entrega (h)</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.deliveryTime}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, deliveryTime: e.target.value })}
                      >
                        <option value="">Cualquier tiempo</option>
                        <option value="24">24 horas</option>
                        <option value="48">48 horas</option>
                        <option value="72">72 horas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mostrar productos sin proveedores</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={productsByProviderFilters.showWithoutProviders || 'no'}
                        onChange={(e) => setProductsByProviderFilters({ ...productsByProviderFilters, showWithoutProviders: e.target.value })}
                      >
                        <option value="no">Todos los productos</option>
                        <option value="yes">Solo sin proveedores</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={clearProductsByProviderFilters}
                        className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabla tipo Excel */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === productsByProvider.length && productsByProvider.length > 0}
                        onChange={toggleAllProducts}
                        className="rounded"
                      />
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoría
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">
                      Proveedor
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">
                      Entrega (h)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredProductsByProvider().map((product) => {
                    const productId = product.id || product.product_id
                    const isSelected = selectedProducts.includes(productId)
                    
                    return (
                      <tr key={productId} className={isSelected ? 'bg-blue-50' : ''}>
                        <td className="px-3 py-2 border border-gray-300">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProductSelection(productId)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name || product.product_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.description || product.product_description}
                          </div>
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {product.category || product.product_category}
                          </span>
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-sm text-gray-900">
                          {product.provider_name}
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          {inlineEditMode && editingCell?.rowId === productId && editingCell?.field === 'price' ? (
                            <input
                              type="number"
                              step="0.01"
                              className="w-full text-sm border rounded px-2 py-1"
                              value={inlineEditData[`${productId}-price`] || product.price || 0}
                              onChange={(e) => handleInlineEditChange(productId, 'price', e.target.value)}
                              onBlur={() => saveInlineEdit(productId, 'price')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit(productId, 'price')
                                if (e.key === 'Escape') cancelInlineEdit()
                              }}
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={`text-sm font-medium text-green-600 ${inlineEditMode ? 'cursor-pointer hover:bg-yellow-100 px-2 py-1 rounded' : ''}`}
                              onClick={() => startInlineEdit(productId, 'price', product.price || 0)}
                            >
                              ${product.price?.toLocaleString() || '0'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          {inlineEditMode && editingCell?.rowId === productId && editingCell?.field === 'stock' ? (
                            <input
                              type="number"
                              className="w-full text-sm border rounded px-2 py-1"
                              value={inlineEditData[`${productId}-stock`] || product.stock_quantity || product.stockQuantity || 0}
                              onChange={(e) => handleInlineEditChange(productId, 'stock', e.target.value)}
                              onBlur={() => saveInlineEdit(productId, 'stock')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit(productId, 'stock')
                                if (e.key === 'Escape') cancelInlineEdit()
                              }}
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={`text-sm text-gray-900 ${inlineEditMode ? 'cursor-pointer hover:bg-yellow-100 px-2 py-1 rounded' : ''}`}
                              onClick={() => startInlineEdit(productId, 'stock', product.stock_quantity || product.stockQuantity || 0)}
                            >
                              {product.stock_quantity || product.stockQuantity || '0'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          {inlineEditMode && editingCell?.rowId === productId && editingCell?.field === 'delivery' ? (
                            <input
                              type="number"
                              className="w-full text-sm border rounded px-2 py-1"
                              value={inlineEditData[`${productId}-delivery`] || product.delivery_time_hours || product.deliveryTime || 24}
                              onChange={(e) => handleInlineEditChange(productId, 'delivery', e.target.value)}
                              onBlur={() => saveInlineEdit(productId, 'delivery')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit(productId, 'delivery')
                                if (e.key === 'Escape') cancelInlineEdit()
                              }}
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={`text-sm text-gray-900 ${inlineEditMode ? 'cursor-pointer hover:bg-yellow-100 px-2 py-1 rounded' : ''}`}
                              onClick={() => startInlineEdit(productId, 'delivery', product.delivery_time_hours || product.deliveryTime || 24)}
                            >
                              {product.delivery_time_hours || product.deliveryTime || '24'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'import' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Importar Datos
            </h2>
            
            {/* Progress Indicator */}
            {importing && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {importProgress.message}
                  </span>
                  <span className="text-sm text-blue-700">
                    {importProgress.current} / {importProgress.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResults && (
              <div className={`mb-6 p-4 rounded-lg ${importResults.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className={`font-medium mb-2 ${importResults.success > 0 ? 'text-green-900' : 'text-red-900'}`}>
                  Resultado de la importación
                </h3>
                <p className={`text-sm mb-3 ${importResults.success > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {importResults.success > 0 
                    ? `✅ ${importResults.success} elementos importados exitosamente`
                    : '❌ No se pudo importar ningún elemento'
                  }
                </p>
                {importResults.errors.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Errores encontrados:</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-700 mb-1">• {error}</p>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setImportResults(null)}
                  className="mt-3 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cerrar
                </button>
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Importar Productos con Precios</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Sube un archivo CSV con productos y sus precios para importarlos masivamente. 
                  Cada fila debe contener los datos del producto y su precio con proveedor.
                </p>
                <div className="mb-3">
                  <details className="text-xs text-blue-600">
                    <summary className="cursor-pointer hover:text-blue-800">Ver ejemplo de formato CSV</summary>
                    <div className="mt-2 p-2 bg-blue-100 rounded text-blue-800 font-mono">
                      name,description,category,unit,keywords,specifications,price,provider_id,stock_quantity,delivery_time_hours<br/>
                      "Laptop Dell","Laptop de 15 pulgadas","Electrónicos","unidad","laptop,dell",,850.00,1,50,24<br/>
                      "Mouse Logitech","Mouse inalámbrico","Electrónicos","unidad","mouse,logitech",,25.50,1,200,12<br/>
                      "Destornillador","Destornillador Phillips","Herramientas","pieza","herramienta",,15.75,2,100,6
                    </div>
                  </details>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  disabled={importing}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  onChange={(e) => handleFileUpload(e, 'products')}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">📋 Instrucciones de Importación</h3>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p><strong>Formato del CSV:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>El archivo debe estar en formato CSV con encabezados</li>
                    <li><strong>Columnas requeridas:</strong> name, category</li>
                    <li><strong>Columnas opcionales:</strong> description, unit, keywords, specifications</li>
                    <li><strong>Para asociar precios y proveedor (opcional):</strong> price, provider_id, stock_quantity, delivery_time_hours</li>
                  </ul>
                  <p className="mt-3"><strong>Notas importantes:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Si incluyes datos de precio, el proveedor (<code>provider_id</code>) debe existir en la base de datos</li>
                    <li>Los productos se crean primero, luego se asignan los precios y proveedores si los campos están presentes</li>
                    <li>Si no hay datos de precio, solo se crea el producto</li>
                    <li>Los nombres de columnas deben estar en inglés como en el ejemplo</li>
                  </ul>
                  <div className="mt-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/productos-ejemplo.csv';
                        link.download = 'productos-ejemplo.csv';
                        link.click();
                      }}
                    >
                      Descargar plantilla CSV de ejemplo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'orders' && (
          <div className="p-6 w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Órdenes de Pedido por Cotización</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="ID de cotización..."
                value={ordersQuotationId}
                onChange={e => setOrdersQuotationId(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-64"
              />
              <button
                onClick={() => fetchOrdersByQuotation(ordersQuotationId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!ordersQuotationId || ordersLoading}
              >
                Buscar órdenes
              </button>
            </div>
            {ordersLoading && <div className="text-gray-600">Cargando órdenes...</div>}
            {ordersError && <div className="text-red-600 mb-2">{ordersError}</div>}
            {/* Eliminado: bloque de pedidos conformados (ordersList) */}
          </div>
        )}

        {!loading && activeTab === 'quotations' && (
          <div className="p-6 w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cotizaciones</h2>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={loadQuotations}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                🔄 Recargar
              </button>
              <button
                onClick={() => setQuotationsView(quotationsView === 'table' ? 'cards' : 'table')}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
              >
                {quotationsView === 'table' ? 'Vista tarjetas' : 'Vista tabla'}
              </button>
            </div>
            {quotationsLoading && <div className="text-gray-600">Cargando cotizaciones...</div>}
            {quotationsError && <div className="text-red-600 mb-2">{quotationsError}</div>}
            {!quotationsLoading && !quotationsError && (
              <>
                {/* Filtro visual por estatus */}
                <div className="mb-4 flex gap-2 flex-wrap">
                  {statusOptions.map(opt => (
                    <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-3 py-1 rounded ${statusFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{opt.label}</button>
                  ))}
                </div>
                {/* Vista tipo tabla compacta */}
                {quotationsView === 'table' && (
                  <div className="overflow-x-auto border rounded-lg bg-white">
                    <table className="min-w-full text-xs border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1 border">ID</th>
                          <th className="px-2 py-1 border">Cliente</th>
                          <th className="px-2 py-1 border">Email</th>
                          <th className="px-2 py-1 border">Proveedores</th>
                          <th className="px-2 py-1 border">Total</th>
                          <th className="px-2 py-1 border">Estado</th>
                          <th className="px-2 py-1 border">Sub-estado</th>
                          <th className="px-2 py-1 border">Fecha</th>
                          <th className="px-2 py-1 border">Pago</th>
                          <th className="px-2 py-1 border">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotations
                          .filter((q: any) => {
                            if (statusFilter === 'todos') return true;
                            if (statusFilter === 'pendiente') return q.status === 'pendiente' || q.status === 'rechazado';
                            if (statusFilter === 'pedido') return q.status === 'pedido';
                            if (statusFilter === 'finalizada') return q.status === 'finalizada';
                            return false;
                          })
                          .sort((a: any, b: any) => {
                            const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                            if (statusDiff !== 0) return statusDiff;
                            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                          })
                          .map((q: any) => (
                            <tr key={q.id} className="hover:bg-blue-50">
                              <td className="px-2 py-1 border font-semibold text-blue-800">#{q.id}</td>
                              <td className="px-2 py-1 border">{q.customer_name}</td>
                              <td className="px-2 py-1 border text-xs">{q.customer_email}</td>
                              <td className="px-2 py-1 border text-xs">{Array.isArray(q.providers) ? q.providers.map((p: any) => p.name).join(', ') : (q.provider_name || '')}</td>
                              <td className="px-2 py-1 border">${q.total?.toLocaleString() || '-'}</td>
                              <td className="px-2 py-1 border">
                                <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${q.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : q.status === 'pedido' ? 'bg-blue-100 text-blue-800 border border-blue-300' : q.status === 'finalizada' ? 'bg-green-100 text-green-800 border border-green-300' : q.status === 'rechazado' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>{q.status}</span>
                              </td>
                              <td className="px-2 py-1 border">
                                {q.status === 'pedido' && q.sub_status ? (
                                  <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${q.sub_status === 'procesando envío' ? 'bg-blue-100 text-blue-800 border border-blue-300' : q.sub_status === 'en camino' ? 'bg-orange-100 text-orange-800 border border-orange-300' : q.sub_status === 'entregado' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>{q.sub_status}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-2 py-1 border text-xs">{q.created_at?.slice(0, 16).replace('T', ' ')}</td>
                              <td className="px-2 py-1 border">
                                <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${q.payment_status === 'pagado' ? 'bg-green-100 text-green-800 border border-green-300' : q.payment_status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>{q.payment_status || 'pendiente'}</span>
                              </td>
                              <td className="px-2 py-1 border space-x-1">
                                {q.status === 'pendiente' && (
                                  <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs" onClick={() => markAsPaid(q.id)}>Marcar pagado</button>
                                )}
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs" onClick={() => updateQuotationStatus(q.id, 'finalizada')}>Finalizar</button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Vista tipo tarjetas (original) */}
                {quotationsView === 'cards' && (
                  <div className="grid md:grid-cols-2 gap-8">
                    {quotations
                      .filter((q: any) => {
                        if (statusFilter === 'todos') return true;
                        if (statusFilter === 'pendiente') return q.status === 'pendiente' || q.status === 'rechazado';
                        if (statusFilter === 'pedido') return q.status === 'pedido';
                        if (statusFilter === 'finalizada') return q.status === 'finalizada';
                        return false;
                      })
                      .sort((a: any, b: any) => {
                        const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                        if (statusDiff !== 0) return statusDiff;
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      })
                      .map((q: any) => (
                        <div key={q.id} className="border rounded-lg p-3 bg-yellow-50 flex justify-between items-center mb-2">
                          <div>
                            <div className="font-semibold">#{q.id} - {q.customer_name}</div>
                            <div className="text-xs text-gray-600">{q.customer_email}</div>
                            <div className="text-xs text-gray-600">{q.created_at?.slice(0, 16).replace('T', ' ')}</div>
                            {/* Mostrar estado de pago */}
                            <div className="text-xs mt-1">
                              <span className={`font-semibold ${q.payment_status === 'pagado' ? 'text-green-600' : q.payment_status === 'rechazado' ? 'text-red-600' : 'text-yellow-600'}`}>Pago: {q.payment_status || 'pendiente'}</span>
                            </div>
                            {/* Mostrar estatus de cotización y badge de sub-estado */}
                            <div className="text-xs mt-1 flex items-center gap-2">
                              <span className={`font-semibold ${q.status === 'rechazado' ? 'text-red-600' : 'text-blue-700'}`}>Estatus: {q.status}</span>
                              {q.status === 'pedido' && q.sub_status && (
                                <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${q.sub_status === 'procesando envío' ? 'bg-blue-100 text-blue-800 border border-blue-300' : q.sub_status === 'en camino' ? 'bg-orange-100 text-orange-800 border border-orange-300' : q.sub_status === 'entregado' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>{q.sub_status}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {q.status === 'pendiente' && <span className="text-yellow-700 font-bold">Pendiente</span>}
                            {q.status === 'pedido' && <span className="text-blue-700 font-bold">Pedido</span>}
                            {q.status === 'finalizada' && <span className="text-green-700 font-bold">Finalizada</span>}
                            <button onClick={() => updateQuotationStatus(q.id, 'finalizada')} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Marcar como Finalizada</button>
                            {q.status === 'pendiente' && (
                              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm ml-2" onClick={() => markAsPaid(q.id)}>Marcar como pagado</button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button onClick={() => { setShowProductForm(false); setEditProductId(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{editProductId ? 'Editar Producto' : 'Agregar Producto'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" className="mt-1 block w-full border rounded-md px-3 py-2" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input type="text" className="mt-1 block w-full border rounded-md px-3 py-2" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={showNewCategoryInput ? 'new' : productForm.category}
                  onChange={e => {
                    if (e.target.value === 'new') {
                      setShowNewCategoryInput(true)
                      setProductForm({ ...productForm, category: '' })
                    } else {
                      setShowNewCategoryInput(false)
                      setProductForm({ ...productForm, category: e.target.value })
                    }
                  }}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="new">Agregar nueva categoría...</option>
                </select>
                {showNewCategoryInput && (
                  <input
                    type="text"
                    className="mt-2 block w-full border rounded-md px-3 py-2"
                    placeholder="Nueva categoría"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                <select
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={productForm.provider_id}
                  onChange={e => setProductForm({ ...productForm, provider_id: e.target.value })}
                >
                  <option value="">Selecciona un proveedor</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  value={productForm.price} 
                  onChange={e => setProductForm({ ...productForm, price: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock disponible</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  value={productForm.stock_quantity} 
                  onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiempo de entrega (horas)</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  value={productForm.delivery_time_hours} 
                  onChange={e => setProductForm({ ...productForm, delivery_time_hours: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unidad</label>
                <input type="text" className="mt-1 block w-full border rounded-md px-3 py-2" value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Palabras clave</label>
                <input type="text" className="mt-1 block w-full border rounded-md px-3 py-2" value={productForm.keywords} onChange={e => setProductForm({ ...productForm, keywords: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Especificaciones</label>
                <input type="text" className="mt-1 block w-full border rounded-md px-3 py-2" value={productForm.specifications} onChange={e => setProductForm({ ...productForm, specifications: e.target.value })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setShowProductForm(false); setEditProductId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
              {editProductId ? (
                <button onClick={saveEditProduct} className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Cambios</button>
              ) : (
                <button onClick={createProduct} className="px-4 py-2 bg-blue-600 text-white rounded-md">Agregar Producto</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Provider Form Modal */}
      {showProviderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editProviderId ? 'Editar Proveedor' : 'Agregar Proveedor'}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del proveedor"
                value={providerForm.name}
                onChange={(e) => setProviderForm({...providerForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Persona de contacto"
                value={providerForm.contact_person}
                onChange={(e) => setProviderForm({...providerForm, contact_person: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={providerForm.phone}
                onChange={(e) => setProviderForm({...providerForm, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                value={providerForm.email}
                onChange={(e) => setProviderForm({...providerForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Dirección"
                value={providerForm.address}
                onChange={(e) => setProviderForm({...providerForm, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Tiempo de entrega (horas)"
                  value={providerForm.delivery_time_hours}
                  onChange={(e) => setProviderForm({...providerForm, delivery_time_hours: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Rating (1-5)"
                  value={providerForm.rating}
                  onChange={(e) => setProviderForm({...providerForm, rating: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProviderForm(false);
                  setEditProviderId(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={editProviderId ? () => updateProvider(editProviderId) : createProvider}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editProviderId ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Form Modal - ELIMINADO */}

      {/* Modal de edición en lote */}
      {bulkEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Editar {selectedProducts.length} productos
            </h2>
            <p className="text-gray-600 mb-4">
              Los campos vacíos no se modificarán. Solo se actualizarán los campos que completes.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nuevo precio</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={bulkEditForm.price}
                  onChange={e => setBulkEditForm({ ...bulkEditForm, price: e.target.value })}
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nuevo stock</label>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={bulkEditForm.stock_quantity}
                  onChange={e => setBulkEditForm({ ...bulkEditForm, stock_quantity: e.target.value })}
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nuevo tiempo de entrega (horas)</label>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={bulkEditForm.delivery_time_hours}
                  onChange={e => setBulkEditForm({ ...bulkEditForm, delivery_time_hours: e.target.value })}
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => {
                  setBulkEditMode(false)
                  setBulkEditForm({ price: '', stock_quantity: '', delivery_time_hours: '' })
                }} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={applyBulkEdit} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Aplicar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de precios */}
      {showPriceDetails && selectedProductDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedProductDetails.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedProductDetails.description}
                </p>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-2">
                  {selectedProductDetails.category}
                </span>
              </div>
              <button 
                onClick={() => setShowPriceDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Proveedor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Entrega
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedProductDetails.prices.map((price: any) => (
                    <tr key={price.id}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {price.provider.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {price.provider.address}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-green-600">
                          ${price.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {price.stockQuantity || 0} unidades
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {price.deliveryTime}h
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {price.provider.rating}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= price.provider.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPriceDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de unión de productos */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Unir Productos
              </h2>
              <button 
                onClick={() => {
                  setShowMergeModal(false)
                  setMergeProducts(null)
                  setMergeComparison(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {mergeProducts && (
              <div>
                {/* Producto origen */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Producto Origen</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">{mergeProducts.source.name}</div>
                    <div className="text-sm text-gray-600">{mergeProducts.source.description}</div>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {mergeProducts.source.category}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {productPrices.filter(p => p.product_id === mergeProducts.source.id).length} proveedores
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selección de producto destino */}
                {!mergeProducts.target && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Seleccionar Producto a Unir</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {findSimilarProducts(mergeProducts.source.name, mergeProducts.source.id).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => selectTargetProduct(product)}
                          className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.description}</div>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {product.category}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {productPrices.filter(p => p.product_id === product.id).length} proveedores
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comparativa de productos */}
                {mergeProducts.target && mergeComparison && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Comparativa</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Producto origen */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Producto Origen</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Nombre:</span> {mergeComparison.name.product1}
                              <div className="text-xs text-gray-500">
                                Similitud: {mergeComparison.name.similarity.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Descripción:</span> {mergeComparison.description.product1}
                              <div className="text-xs text-gray-500">
                                Similitud: {mergeComparison.description.similarity.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Categoría:</span> {mergeComparison.category.product1}
                            </div>
                            <div>
                              <span className="font-medium">Unidad:</span> {mergeComparison.unit.product1}
                            </div>
                            <div>
                              <span className="font-medium">Proveedores:</span> {mergeComparison.providers.product1}
                            </div>
                          </div>
                        </div>

                        {/* Producto destino */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Producto Destino</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Nombre:</span> {mergeComparison.name.product2}
                            </div>
                            <div>
                              <span className="font-medium">Descripción:</span> {mergeComparison.description.product2}
                            </div>
                            <div>
                              <span className="font-medium">Categoría:</span> {mergeComparison.category.product2}
                              {mergeComparison.category.match && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Unidad:</span> {mergeComparison.unit.product2}
                              {mergeComparison.unit.match && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Proveedores:</span> {mergeComparison.providers.product2}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Resumen */}
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <div className="text-sm font-medium text-blue-900">
                          Resultado: {mergeComparison.providers.total} proveedores totales
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          El producto origen se eliminará y todos sus proveedores se moverán al producto destino.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowMergeModal(false)
                      setMergeProducts(null)
                      setMergeComparison(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  {mergeProducts.target && (
                    <button
                      onClick={mergeProductsAction}
                      disabled={mergeLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {mergeLoading ? 'Uniendo...' : 'Unir Productos'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {activeTab === 'quotations' && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-2">Desglose por proveedor de cotización</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              className="border rounded px-3 py-2 text-sm"
              placeholder="ID de cotización"
              value={ordersQuotationId}
              onChange={e => setOrdersQuotationId(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={async () => {
                setOrdersLoading(true)
                setOrdersError('')
                setOrdersList([])
                try {
                  const token = localStorage.getItem('token')
                  const res = await fetch(`http://localhost:5000/api/quotations/${ordersQuotationId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                  })
                  if (!res.ok) throw new Error('No se encontró la cotización')
                  const data = await res.json()
                  // Agrupar por proveedor
                  const grouped = {}
                  data.items.forEach(item => {
                    const pid = item.provider.id
                    if (!grouped[pid]) grouped[pid] = { provider: item.provider, products: [] }
                    grouped[pid].products.push(item)
                  })
                  setOrdersList(Object.values(grouped))
                } catch (err) {
                  setOrdersError('No se encontró la cotización o hubo un error')
                } finally {
                  setOrdersLoading(false)
                }
              }}
            >
              Consultar
            </button>
          </div>
          {ordersLoading && <p>Cargando...</p>}
          {ordersError && <p className="text-red-600">{ordersError}</p>}
          {ordersList.length > 0 && (
            <div className="space-y-6">
              {ordersList.map((group: any) => (
                <div key={group.provider.id} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-bold text-blue-700 mb-2">Proveedor: {group.provider.name} (ID: {group.provider.id})</h3>
                  <table className="min-w-full text-xs mb-2">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Producto</th>
                        <th className="border px-2 py-1">Cantidad</th>
                        <th className="border px-2 py-1">Precio unitario</th>
                        <th className="border px-2 py-1">Total</th>
                        <th className="border px-2 py-1">Entrega (h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.products.map((item: any) => (
                        <tr key={item.id}>
                          <td className="border px-2 py-1">{item.product.name}</td>
                          <td className="border px-2 py-1">{item.quantity}</td>
                          <td className="border px-2 py-1">${item.unitPrice.toLocaleString()}</td>
                          <td className="border px-2 py-1">${item.totalPrice.toLocaleString()}</td>
                          <td className="border px-2 py-1">{item.deliveryTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Admin 