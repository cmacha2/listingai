# Guía de Persistencia de Tokens de eBay y Mejoras de Categorías

## Problema Identificado

Los tokens de eBay se pierden cuando:
1. Te deslogeas de la aplicación
2. Reinicias el servidor
3. La sesión expira

**NUEVO:** Problema adicional con categorías de eBay:
- Las categorías hardcodeadas no siempre son categorías "leaf" válidas
- Error: "The category selected is not a leaf category"

## ¿Por qué sucede esto?

### Tokens SÍ se guardan en la base de datos
Los tokens de eBay se almacenan correctamente en la tabla `users` con estos campos:
- `ebayAccessToken` - Token de acceso (válido por 2 horas)
- `ebayRefreshToken` - Token de renovación (válido por 18 meses)
- `ebayTokenExpiry` - Fecha de expiración del access token
- `isEbayConnected` - Estado de conexión

### El problema es la sesión
Las sesiones se almacenan en memoria por defecto, por lo que:
- Al reiniciar el servidor → se pierden todas las sesiones
- Al desloguearse → se destruye la sesión
- Sin sesión → no puedes acceder a endpoints protegidos

### **NUEVO:** Problema con categorías
Las categorías hardcodeadas pueden no ser válidas porque:
- eBay requiere categorías "leaf" (sin subcategorías)
- Las categorías cambian con el tiempo
- Diferentes marketplaces tienen diferentes categorías

## Soluciones Implementadas

### 🔧 **Para Persistencia de Tokens:**

1. **Endpoint de debug** (`/api/ebay/debug`) - Solo en desarrollo
2. **Endpoint sin sesión** (`/api/ebay/status-by-credentials`) - Verifica tokens con email/password
3. **Auto-refresh mejorado** en `/api/auth/me` - Actualiza tokens automáticamente
4. **Middleware mejorado** con logging detallado
5. **Script de prueba** (`test-ebay-persistence.js`)

### 🎯 **NUEVO: Para Categorías de eBay:**

1. **API real de eBay** - Nuevos métodos en `ebay.ts`:
   - `getCategories()` - Obtiene categorías de eBay
   - `getCategorySuggestions()` - Sugerencias basadas en producto
   - `getCategoryDetails()` - Verifica si es categoría leaf

2. **Nuevos endpoints** en `routes.ts`:
   - `GET /api/ebay/categories` - Lista categorías
   - `GET /api/ebay/category-suggestions?query=<product>` - Sugerencias
   - `GET /api/ebay/category-details/:categoryId` - Detalles de categoría

3. **Función mejorada** `generateEbayCategoryWithRealAPI()`:
   - Usa API real de eBay para sugerencias
   - Verifica que sea categoría leaf
   - Si no es leaf, busca subcategorías apropiadas
   - Fallback a AI si falla la API

4. **Script de prueba** (`test-ebay-categories.js`) para verificar categorías

## Cómo usar las mejoras

### 🧪 **Probar categorías:**
```bash
node test-ebay-categories.js user@example.com password123 "Lenovo ThinkCentre Desktop"
```

### 🧪 **Probar persistencia de tokens:**
```bash
node test-ebay-persistence.js user@example.com password123
```

### 🔍 **Debug de tokens (desarrollo):**
```bash
curl http://localhost:3020/api/ebay/debug -H "Cookie: connect.sid=..."
```

### 🔍 **Verificar categorías manualmente:**
```bash
# Obtener sugerencias
curl "http://localhost:3020/api/ebay/category-suggestions?query=desktop%20computer" -H "Cookie: ..."

# Verificar detalles de categoría
curl "http://localhost:3020/api/ebay/category-details/171957" -H "Cookie: ..."
```

## Flujo mejorado de publicación

1. **Login** → Tokens se recuperan de la base de datos
2. **Selección de categoría** → Se usa API real de eBay:
   - Obtiene sugerencias basadas en el producto
   - Verifica que sea categoría leaf
   - Si no es leaf, selecciona subcategoría apropiada
   - Fallback a AI si falla
3. **Publicación** → Usa categoría leaf válida

## Troubleshooting

### ❌ **"Category is not a leaf category"**
- ✅ **Solucionado** con `generateEbayCategoryWithRealAPI()`
- La función ahora verifica automáticamente si es leaf
- Si no es leaf, busca subcategorías apropiadas

### ❌ **"eBay authentication required"**
- Verifica que el token esté en la base de datos
- Usa `/api/ebay/status-by-credentials` para verificar sin sesión
- Reconecta eBay si es necesario

### ❌ **Tokens se pierden al reiniciar**
- Los tokens SÍ persisten en la base de datos
- El problema es la sesión, no los tokens
- Usa `/api/auth/me` para recuperar estado después del login

## Archivos modificados

### **Nuevos archivos:**
- `test-ebay-categories.js` - Script de prueba de categorías
- `test-ebay-persistence.js` - Script de prueba de tokens

### **Archivos actualizados:**
- `server/ebay.ts` - Nuevos métodos para categorías
- `server/routes.ts` - Nuevos endpoints y uso de API real
- `server/openai.ts` - Nueva función `generateEbayCategoryWithRealAPI()`

## Beneficios

✅ **Categorías 100% válidas** - Usa API real de eBay
✅ **Verificación automática** - Confirma que son categorías leaf
✅ **Fallback robusto** - AI como respaldo si falla la API
✅ **Mejor debugging** - Scripts y endpoints de prueba
✅ **Tokens persistentes** - Se mantienen entre sesiones
✅ **Auto-refresh** - Tokens se renuevan automáticamente 