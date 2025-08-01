# 🚀 Inicio Rápido - Naova

## Opción 1: Doble clic (Más fácil)
1. **Haz doble clic** en el archivo `iniciar-naova.bat`
2. **Espera** a que se inicie todo automáticamente
3. **Abre tu navegador** en http://localhost:3000

## Opción 2: Comando (Alternativa)
```bash
npm start
```

## Opción 3: Comando manual (Si las anteriores fallan)
```bash
npm run dev
```

---

## ✅ ¿Qué hace el script automático?

1. **Verifica Node.js** y npm
2. **Instala dependencias** si faltan
3. **Crea archivos de configuración** (.env)
4. **Inicializa la base de datos** con datos de ejemplo
5. **Ejecuta migraciones** para agregar columnas faltantes
6. **Vincula proveedores** con usuarios automáticamente
7. **Corrige estados inconsistentes** de cotizaciones
8. **Inicia backend y frontend** automáticamente
9. **Muestra las URLs** de acceso

---

## 🌐 URLs de acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 👤 Usuarios de prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| **Admin** | `admin` | `admin123` |
| **Cliente** | `cliente` | `cliente123` |
| **Proveedor** | `hardwarestorea` | `proveedor123` |

---

## 🛑 Para detener la aplicación

**Presiona `Ctrl + C`** en la terminal donde está corriendo.

---

## ❓ Problemas comunes

### Error: "Puerto en uso"
- Cierra otras aplicaciones que usen puertos 3000 o 5000
- O reinicia tu computadora

### Error: "Node.js no encontrado"
- Instala Node.js desde: https://nodejs.org/
- Reinicia tu computadora después de instalar

### Error: "Dependencias no encontradas"
- El script las instalará automáticamente
- Si falla, ejecuta: `npm run install:all`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa que Node.js esté instalado
2. Asegúrate de estar en la carpeta correcta
3. Ejecuta `npm run install:all` manualmente
4. Reinicia tu computadora

---

**¡Disfruta usando Naova! 🎉** 