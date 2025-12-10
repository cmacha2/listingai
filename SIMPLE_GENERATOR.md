# Simple Listing Generator

## Descripción

Un generador simple de listings de eBay protegido por contraseña que permite subir hasta 5 fotos de productos y generar automáticamente títulos y descripciones optimizadas con AI.

## Características

- ✅ Protección con contraseña hardcodeada
- ✅ Subida de hasta 5 imágenes
- ✅ Generación automática de título y descripción con AI usando **EbayRank Pro**
- ✅ Optimización SEO profesional con 20 años de experiencia en e-commerce
- ✅ Análisis avanzado de keywords y categorías de eBay
- ✅ Template HTML personalizado de Smart Save Depot
- ✅ Preview del HTML generado
- ✅ Copia fácil del HTML para usar en eBay

## Cómo usar

### 1. Acceder a la página

Navega a: `http://localhost:3021/simple-generator` (o tu dominio en producción)

### 2. Ingresar contraseña

Password: `smartsavedepot`

### 3. Subir imágenes

- Click en el área de upload o arrastra las imágenes
- Máximo 5 imágenes
- Formatos aceptados: JPG, PNG, GIF, WEBP

### 4. Generar listing

- Click en "Generate Listing"
- La AI analizará las imágenes y generará:
  - Título optimizado para SEO
  - Descripción detallada del producto
  - Template HTML completo con tu branding

### 5. Copiar HTML

- Click en "Show Preview" para ver el resultado
- Click en "Copy HTML" para copiar el código
- Pega el HTML en tu listing de eBay

## Endpoint API

### POST `/api/simple-generator`

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `password`: string (hardcoded: "smartsavedepot")
  - `images`: File[] (max 5 images)

**Response:**
```json
{
  "success": true,
  "title": "Generated title",
  "description": "Generated description",
  "features": "Product features",
  "imageUrls": ["url1", "url2"],
  "htmlTemplate": "<style>...</style>...",
  "message": "Listing generated successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Template HTML

El template incluye:
- Banner de Smart Save Depot
- Navegación con tabs (Product Description, Shipping, Returns, Feedback, Contact Us, About Us)
- Sección de descripción del producto con título y descripción generados por AI
- Políticas de envío y devolución
- Footer con logo y copyright

## Tecnologías

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **AI**: 
  - OpenAI GPT-4 Vision para análisis de imágenes
  - **EbayRank Pro**: Prompt profesional de marketing con 20 años de experiencia en SEO
  - Optimización avanzada de keywords usando Terapeak analytics
- **Storage**: Cloudinary para almacenamiento de imágenes
- **Template**: HTML + CSS inline para eBay

## EbayRank Pro

El sistema utiliza un prompt profesional que simula un experto en marketing con 20 años de experiencia en SEO y e-commerce. El proceso incluye:

1. **Investigación de Categorías**: Análisis profundo de la categoría del producto en eBay
2. **Identificación de Keywords**: Uso de herramientas SEO avanzadas y Terapeak analytics
3. **Desarrollo de Título**: Título optimizado (máx 80 caracteres) con keywords primarias
4. **Descripción Profesional**: 
   - Introducción cautivadora
   - Especificaciones detalladas
   - Keywords naturalmente integradas
   - Instrucciones de cuidado
5. **Optimización SEO Final**: Revisión completa para eBay y motores de búsqueda externos

## Notas

- La contraseña está hardcodeada en el servidor (`smartsavedepot`)
- Las imágenes se suben a Cloudinary automáticamente
- El HTML generado es compatible con eBay
- No requiere autenticación de usuario, solo la contraseña simple

