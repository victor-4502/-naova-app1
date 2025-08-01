import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Clock, Zap } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import CategoryCard from '../components/CategoryCard'

const Home = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const categories = [
    {
      id: 'cemento',
      name: 'Cementos',
      description: 'Cemento gris, blanco, portland',
      icon: '🏗️',
      color: 'bg-naova-blue-100'
    },
    {
      id: 'ladrillos',
      name: 'Ladrillos',
      description: 'Ladrillos, bloques, tejas',
      icon: '🧱',
      color: 'bg-naova-yellow-100'
    },
    {
      id: 'herramientas',
      name: 'Herramientas',
      description: 'Martillos, taladros, sierras',
      icon: '🔧',
      color: 'bg-naova-gray-100'
    },
    {
      id: 'pinturas',
      name: 'Pinturas',
      description: 'Pinturas, barnices, impermeabilizantes',
      icon: '🎨',
      color: 'bg-naova-blue-100'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-naova-gray-900 mb-6">
          Encuentra los mejores precios de{' '}
          <span className="text-naova-blue-800">ferretería</span>
        </h1>
        <p className="text-xl text-naova-gray-600 mb-8 max-w-3xl mx-auto">
          Compara precios y tiempos de entrega entre proveedores en segundos. 
          Sin registro, sin complicaciones.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Ej: 10 bultos de cemento gris, 50 ladrillos..."
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-naova-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-naova-blue-800" />
          </div>
          <h3 className="text-lg font-semibold text-naova-gray-900 mb-2">
            Mejor Precio
          </h3>
          <p className="text-naova-gray-600">
            Encuentra la opción más económica entre todos los proveedores
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-naova-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-naova-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-naova-gray-900 mb-2">
            Entrega Rápida
          </h3>
          <p className="text-naova-gray-600">
            Descubre quién puede entregar tu pedido más rápido
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-naova-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-naova-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-naova-gray-900 mb-2">
            Comparación Instantánea
          </h3>
          <p className="text-naova-gray-600">
            Resultados en segundos, sin llamadas ni visitas
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-naova-gray-900 mb-8 text-center">
          Categorías Populares
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard 
              key={category.id}
              category={category}
              onClick={() => handleSearch(category.name)}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-naova-blue-800 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">
          ¿Necesitas una cotización personalizada?
        </h2>
        <p className="text-naova-blue-100 mb-6">
          Nuestro equipo está listo para ayudarte con proyectos grandes
        </p>
        <button className="btn-secondary">
          Contactar por WhatsApp
        </button>
      </div>
    </div>
  )
}

export default Home 