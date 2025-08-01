# 🚀 Naova App - Sistema de Cotizaciones

Aplicación web completa para gestión de cotizaciones, productos y proveedores.

## 📋 Características

- ✅ **Autenticación de usuarios** (admin, cliente, proveedor)
- ✅ **Gestión de productos** con precios y proveedores
- ✅ **Búsqueda inteligente** de productos
- ✅ **Cotizaciones masivas** con importación CSV
- ✅ **Panel de administración** completo
- ✅ **Seguimiento de pedidos** para proveedores
- ✅ **Base de datos Supabase** (PostgreSQL)

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Base de datos**: Supabase
- **Autenticación**: JWT

## 🚀 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Cuenta en Supabase

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/victor-4502/-naova-app.git
   cd -naova-app
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   Edita `.env` con tu configuración de Supabase:
   ```
   DATABASE_URL=postgresql://postgres.cwjspepvbxgqwggxcqrv:[TU-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres
   JWT_SECRET=tu-jwt-secret-aqui
   PORT=5000
   ```

4. **Instalar dependencias del frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Iniciar el backend**
   ```bash
   cd ../backend
   npm start
   ```

6. **Iniciar el frontend**
   ```bash
   cd ../frontend
   npm run dev
   ```

## 📁 Estructura del proyecto

```
naova-app/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   └── database/       # Configuración de base de datos
│   └── package.json
├── frontend/               # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   └── config/        # Configuración de API
│   └── package.json
└── README.md
```

## 🔧 Scripts útiles

### Backend
```bash
npm start          # Iniciar servidor
npm run dev        # Iniciar en modo desarrollo
```

### Frontend
```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm run preview    # Vista previa de producción
```

## 👥 Roles de usuario

- **Admin**: Gestión completa del sistema
- **Cliente**: Crear cotizaciones y ver productos
- **Proveedor**: Ver pedidos asignados

## 📊 Base de datos

El proyecto utiliza Supabase (PostgreSQL) con las siguientes tablas principales:
- `users` - Usuarios del sistema
- `products` - Productos disponibles
- `providers` - Proveedores
- `quotations` - Cotizaciones
- `quotation_items` - Items de cotizaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

Victor - [@victor-4502](https://github.com/victor-4502)

Link del proyecto: [https://github.com/victor-4502/-naova-app](https://github.com/victor-4502/-naova-app) 