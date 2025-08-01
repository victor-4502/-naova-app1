# 📋 Estados de Cotizaciones - Naova

## 🔄 Flujo de Estados

### 1. **Pendiente** (Estado inicial)
- **Cuándo**: Cotización creada
- **Pago**: Pendiente
- **Sub-estado**: No aplica
- **Acciones disponibles**: Confirmar pedido (solo si pago está realizado)

### 2. **Pedido** (Confirmado)
- **Cuándo**: Cliente confirma la cotización Y el pago está realizado
- **Pago**: Pagado
- **Sub-estado**: 
  - `procesando envío` (inicial)
  - `en camino` (en tránsito)
  - `entregado` (final)
- **Acciones disponibles**: Proveedores pueden cambiar sub-estado

### 3. **Finalizada** (Completado)
- **Cuándo**: Pedido entregado y completado
- **Pago**: Pagado
- **Sub-estado**: No aplica
- **Acciones disponibles**: Solo consulta

## ⚠️ Reglas de Validación

### ✅ Estados Válidos
- **Pendiente** + Pago pendiente ✅
- **Pedido** + Pago pagado ✅
- **Finalizada** + Pago pagado ✅

### ❌ Estados Inválidos
- **Pedido** + Pago pendiente ❌
- **Finalizada** + Pago pendiente ❌

## 🔧 Corrección Automática

El sistema automáticamente corrige estados inconsistentes:
- Si encuentra un **pedido** con pago pendiente → cambia a **pendiente**
- Si encuentra una **finalizada** con pago pendiente → cambia a **pendiente**

## 📊 Estados de Pago

- **pendiente**: Pago no realizado
- **pagado**: Pago confirmado

## 🚚 Sub-estados (Solo para Pedidos)

- **procesando envío**: Preparando productos para envío
- **en camino**: Productos en tránsito hacia el cliente
- **entregado**: Productos recibidos por el cliente

## 👥 Roles y Permisos

### Cliente
- Puede confirmar pedido (solo si pago está realizado)
- Puede ver estados y sub-estados

### Proveedor
- Puede cambiar sub-estado de pedidos asignados
- Solo ve pedidos donde tiene productos

### Admin
- Puede marcar pagos como realizados
- Puede finalizar pedidos
- Ve todas las cotizaciones

## 🎯 Flujo Típico

1. **Cliente crea cotización** → Estado: Pendiente
2. **Admin marca pago como realizado** → Pago: Pagado
3. **Cliente confirma pedido** → Estado: Pedido
4. **Proveedor procesa envío** → Sub-estado: procesando envío
5. **Proveedor envía productos** → Sub-estado: en camino
6. **Proveedor confirma entrega** → Sub-estado: entregado
7. **Admin finaliza pedido** → Estado: Finalizada 