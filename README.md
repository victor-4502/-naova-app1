# 🚀 Naova App - Sistema de Cotizaciones

Aplicación web para gestión de cotizaciones, productos y proveedores.

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
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 🚀 Despliegue en Vercel

### Opción 1: Solo Frontend (Recomendado)

1. **Desplegar Backend en Railway:**
   ```bash
   # Crear cuenta en Railway.app
   # Conectar tu repositorio de GitHub
   # Configurar variables de entorno:
   DATABASE_URL=tu_url_de_supabase
   JWT_SECRET=tu_secret_key
   ```

2. **Desplegar Frontend en Vercel:**
   ```bash
   # Instalar Vercel CLI
   npm i -g vercel
   
   # Login en Vercel
   vercel login
   
   # Desplegar
   vercel
   ```

3. **Configurar variables de entorno en Vercel:**
   - `REACT_APP_API_URL=https://tu-backend.railway.app`

### Opción 2: Todo en Vercel

1. **Configurar Vercel:**
   ```bash
   # Crear vercel.json (ya incluido)
   # Configurar variables de entorno en Vercel Dashboard
   ```

2. **Desplegar:**
   ```bash
   vercel --prod
   ```

## 🔧 Variables de Entorno

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://tu-backend.railway.app
```

## 📁 Estructura del Proyecto

```
naova_app/
├── frontend/          # React + TypeScript
├── backend/           # Node.js + Express
├── vercel.json        # Configuración Vercel
└── README.md
```

## 🎯 URLs de Despliegue

- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-backend.railway.app
- **Base de datos**: Supabase Dashboard

## 🔄 Flujo de Despliegue

1. **Desarrollo local** → `npm run dev`
2. **Commit cambios** → `git add . && git commit -m "update"`
3. **Push a GitHub** → `git push origin main`
4. **Despliegue automático** → Vercel detecta cambios y actualiza

## 📞 Soporte

Para problemas de despliegue:
1. Verificar variables de entorno
2. Revisar logs en Vercel Dashboard
3. Confirmar conexión a Supabase

---

**¡Tu aplicación estará disponible en https://tu-app.vercel.app!** 🎉 