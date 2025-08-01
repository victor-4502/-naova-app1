import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import { SearchResult } from '../types'

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const query = searchParams.get('q') || ''

  useEffect(() => {
    console.log('Query changed to:', query)
    setSearchQuery(query)
    
    if (query && query.trim()) {
      performSearch(query)
    } else {
      setResults([])
      setLoading(false)
      setError(null)
    }
  }, [query])

  const performSearch = async (searchTerm: string) => {
    setLoading(true)
    setError(null)
    setResults([]) // Limpiar resultados anteriores
    console.log('Searching for:', searchTerm)
    
    try {
      const url = `http://localhost:5000/api/search?q=${encodeURIComponent(searchTerm)}`
      console.log('Fetching from:', url)
      
      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Search results:', data)
      setResults(data)
    } catch (error) {
      console.error('Error searching products:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      
      // Mock data for development
      setResults([
        {
          product: {
            id: '1',
            name: 'Tornillos Phillips #8 x 1"',
            description: 'Tornillos de cabeza Phillips, acero inoxidable',
            category: 'Fasteners',
            unit: 'unidad',
            keywords: ['tornillos', 'phillips', 'acero']
          },
          bestPrice: {
            id: '1',
            productId: '1',
            providerId: '3',
            price: 0.10,
            currency: 'COP',
            available: true,
            minQuantity: 1,
            deliveryTime: 24,
            provider: {
              id: '3',
              name: 'Hardware Store C',
              address: '789 Pine Rd, City C',
              phone: '+1-555-0103',
              email: 'carlos@hardwarec.com',
              rating: 4.2,
              deliveryTime: 24
            }
          },
          fastestDelivery: {
            id: '2',
            productId: '1',
            providerId: '1',
            price: 0.15,
            currency: 'COP',
            available: true,
            minQuantity: 1,
            deliveryTime: 4,
            provider: {
              id: '1',
              name: 'Hardware Store A',
              address: '123 Main St, City A',
              phone: '+1-555-0101',
              email: 'juan@hardwarea.com',
              rating: 4.8,
              deliveryTime: 4
            }
          },
          singleProvider: false
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newQuery: string) => {
    console.log('handleSearch called with:', newQuery)
    
    if (newQuery.trim()) {
      // Actualizar la URL y los parámetros de búsqueda
      setSearchParams({ q: newQuery })
      setSearchQuery(newQuery)
    } else {
      // Si la búsqueda está vacía, limpiar URL y resultados
      setSearchParams({})
      setSearchQuery('')
      setResults([])
      setLoading(false)
      setError(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 text-naova-blue-800 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Buscar productos..."
          />
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-naova-gray-900 mb-4">
            Error al buscar productos
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-naova-gray-600">
            Mostrando datos de ejemplo mientras se resuelve el problema
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Buscar productos..."
        />
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-naova-gray-900 mb-4">
            No se encontraron resultados
          </h2>
          <p className="text-naova-gray-600">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-naova-gray-900 mb-2">
              Resultados para "{query}"
            </h1>
            <p className="text-naova-gray-600">
              {results.length} producto{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid gap-6">
            {results.map((result) => (
              <ProductCard key={result.product.id} result={result} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default SearchResults 