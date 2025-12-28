# 🚀 Guía Rápida - Simple Listing Generator

## 📋 Resumen

Has implementado exitosamente un generador de listings de eBay simple y profesional con **EbayRank Pro AI**.

## 🔐 Acceso

**URL**: `http://localhost:3021/simple-generator` (desarrollo) o `https://tu-dominio.com/simple-generator` (producción)

**Password**: `smartsavedepot` (hardcodeado en el servidor)

## 🎯 Cómo Usar

### Paso 1: Acceder a la Página
```
http://localhost:3021/simple-generator
```

### Paso 2: Ingresar Credenciales
- Password: `smartsavedepot`

### Paso 3: Subir Imágenes
- Click en el área de upload
- Selecciona hasta **5 imágenes** de tu producto
- Formatos: JPG, PNG, GIF, WEBP
- Tamaño máximo: 5MB por imagen

### Paso 4: Generar
- Click en **"Generate Listing"**
- Espera mientras la AI analiza las imágenes (15-30 segundos)

### Paso 5: Resultado
Obtendrás:
- ✅ Título SEO-optimizado (máx 80 caracteres)
- ✅ Descripción profesional con keywords
- ✅ HTML completo con tu template de Smart Save Depot
- ✅ URLs de las imágenes subidas a Cloudinary

### Paso 6: Usar el HTML
- Click en **"Show Preview"** para ver el resultado
- Click en **"Copy HTML"** para copiar el código
- Pega el HTML en tu listing de eBay

## 🤖 Tecnología EbayRank Pro

El sistema usa un prompt AI profesional que simula:
- 20 años de experiencia en marketing
- Experto en SEO y e-commerce
- Conocimiento de Terapeak Analytics
- Optimización de keywords avanzada

### Lo que hace:

1. **Analiza tus imágenes** con GPT-4 Vision
2. **Identifica el producto**, marca, modelo, características
3. **Investiga keywords** relevantes para eBay
4. **Genera título optimizado** con palabras clave primarias
5. **Crea descripción profesional** con keywords naturalmente integradas
6. **Optimiza para SEO** de eBay y motores de búsqueda externos

## 📝 Ejemplo de Salida

### Título Generado:
```
Defiant FREEDOM Matte Black Keyed Entry Door Lock Home Security 1007789955
```
(Optimizado con keywords: Defiant, FREEDOM, Black, Keyed Entry, Door Lock, Home Security, Model Number)

### Descripción Generada:
```
Ensure the safety of your home with the Defiant FREEDOM Matte Black Keyed Entry Door. 
Engineered for top-tier home security, this Defiant lockset provides robust protection 
against unauthorized entry, giving you peace of mind whether you're at home or away.

Key Features:
- Superior Security: Robust protection for your home
- Stylish Design: Matte black finish blends with various architectural styles
- Quality: Premium performance and durability from trusted Defiant brand
...
```

## 🎨 Template HTML

El HTML generado incluye:
- Banner de Smart Save Depot
- Navegación con 6 tabs (Product Description, Shipping, Returns, Feedback, Contact, About)
- Descripción del producto con título y detalles AI-generados
- Políticas de envío y devolución
- Footer con logo y copyright

## 🔧 API Endpoint

```bash
POST /api/simple-generator
Content-Type: multipart/form-data

Fields:
- password: "smartsavedepot"
- images: File[] (max 5)

Response:
{
  "success": true,
  "title": "Generated title",
  "description": "Generated description",
  "features": "Product features",
  "imageUrls": ["url1", "url2", ...],
  "htmlTemplate": "<style>...</style>...",
  "message": "Listing generated successfully"
}
```

## ⚡ Características

- ✅ No requiere registro de usuario
- ✅ Password simple hardcodeado
- ✅ Subida automática a Cloudinary
- ✅ AI profesional con EbayRank Pro
- ✅ SEO optimizado para eBay
- ✅ HTML compatible con eBay
- ✅ Preview en tiempo real
- ✅ Copia con un click

## 🚀 Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:3021`

## 📧 Soporte

Para problemas o preguntas:
- Verifica que el password sea exactamente: `smartsavedepot`
- Asegúrate de subir al menos 1 imagen
- Máximo 5 imágenes permitidas
- Cada imagen debe ser menor a 5MB

## 🎉 ¡Listo!

Tu generador simple de listings está completamente funcional con AI profesional de EbayRank Pro.

**URL de acceso**: `http://localhost:3021/simple-generator`
**Password**: `smartsavedepot`




