interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

interface CategoryCardProps {
  category: Category
  onClick: () => void
}

const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className="card hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer text-left"
    >
      <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 text-2xl`}>
        {category.icon}
      </div>
      <h3 className="text-lg font-semibold text-naova-gray-900 mb-2">
        {category.name}
      </h3>
      <p className="text-naova-gray-600 text-sm">
        {category.description}
      </p>
    </button>
  )
}

export default CategoryCard 