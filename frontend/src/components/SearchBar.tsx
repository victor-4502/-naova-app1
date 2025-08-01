import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
}

const SearchBar = ({ value, onChange, onSearch, placeholder }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-naova-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Buscar productos..."}
          className="search-input pl-12 pr-4"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-naova-blue-800 text-white p-2 rounded-lg hover:bg-naova-blue-900 transition-colors duration-200"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default SearchBar 