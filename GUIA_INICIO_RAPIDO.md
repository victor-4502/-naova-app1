# 🚀 Guía de Inicio Rápido - Naova

## ¿Qué es Naova?

Naova es una aplicación web moderna que permite a los clientes cotizar productos de ferretería rápidamente, comparando precios y tiempos de entrega entre diferentes proveedores.

## 🎯 Características Principales

- **Búsqueda inteligente**: Entrada por texto libre o selección guiada
- **Comparación automática**: Mejor precio vs entrega más rápida
- **Sin registro requerido**: Acceso directo para cotizaciones
- **Panel administrativo**: Gestión de productos y precios
- **Diseño moderno**: UI con colores azul industrial + amarillo construcción

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Lucide React** para iconos

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos
- **Joi** para validación
- **Multer** para uploads de archivos

## 📋 Prerrequisitos

- Node.js v18 o superior
- PostgreSQL 12 o superior
- npm o yarn

## ⚡ Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd naova_app
```

### 2. Ejecutar el script de configuración
```bash
node setup.js
```

### 3. Configurar la base de datos
```bash
# Crear base de datos
createdb naova_db

# Ejecutar migraciones
cd backend && npm run migrate

# (Opcional) Cargar datos de ejemplo
npm run seed
```

### 4. Iniciar el desarrollo
```bash
# Opción 1: Ejecutar ambos simultáneamente
npm run dev

# Opción 2: Ejecutar por separado
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Estructura del Proyecto

```
naova_app/
├── frontend/                 # React + TypeScript
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── types/          # Definiciones TypeScript
│   │   └── ...
│   └── ...
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── routes/         # Endpoints de la API
│   │   ├── database/       # Configuración de BD
│   │   └── ...
│   └── ...
└── ...
```

## 🔧 Configuración de Variables de Entorno

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=naova_db
DB_USER=postgres
DB_PASSWORD=tu_password
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Naova
VITE_WHATSAPP_NUMBER=3001234567
```

## 📊 API Endpoints Principales

### Búsqueda
- `GET /api/search?q=cemento` - Buscar productos
- `GET /api/search/categories` - Obtener categorías

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Cotizaciones
- `POST /api/quotations` - Generar cotización
- `GET /api/quotations/:id` - Obtener cotización
- `GET /api/quotations/:id/pdf` - Descargar PDF

### Administración
- `GET /api/admin/stats` - Estadísticas del dashboard
- `POST /api/admin/import/products` - Importar productos
- `GET /api/admin/export/products` - Exportar productos

## 🎨 Paleta de Colores

- **Azul Industrial**: `#1e3a8a` (Primary)
- **Amarillo Construcción**: `#f59e0b` (Secondary)
- **Gris Claro**: `#f3f4f6` (Background)
- **Blanco**: `#ffffff` (Cards)

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run dev              # Ejecutar frontend y backend
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend
```

### Base de Datos
```bash
cd backend
npm run migrate          # Ejecutar migraciones
npm run seed             # Cargar datos de ejemplo
```

### Construcción
```bash
npm run build            # Construir ambos
npm run build:frontend   # Construir frontend
npm run build:backend    # Construir backend
```

## 🔍 Funcionalidades Principales

### 1. Búsqueda de Productos
- Búsqueda por texto libre
- Filtros por categoría
- Resultados con mejor precio y entrega más rápida

### 2. Comparación de Precios
- 🟩 Mejor precio disponible
- 🟨 Entrega más rápida
- Información detallada del proveedor

### 3. Generación de Cotizaciones
- Cotizaciones automáticas
- Exportación a PDF
- Compartir por WhatsApp

### 4. Panel Administrativo
- Gestión de productos
- Gestión de proveedores
- Importación/exportación de datos
- Estadísticas del sistema

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Crear la base de datos si no existe
createdb naova_db
```

### Error de dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de puertos ocupados
```bash
# Verificar puertos en uso
lsof -i :3000
lsof -i :5000

# Matar procesos si es necesario
kill -9 <PID>
```

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa los logs en la consola
2. Verifica la configuración de variables de entorno
3. Asegúrate de que PostgreSQL esté ejecutándose
4. Consulta la documentación de la API

## 🎉 ¡Listo para Usar!

Una vez que hayas completado la instalación, podrás:

1. **Buscar productos** en la página principal
2. **Comparar precios** entre proveedores
3. **Generar cotizaciones** automáticamente
4. **Gestionar el catálogo** desde el panel administrativo

¡Disfruta usando Naova! 🧠 