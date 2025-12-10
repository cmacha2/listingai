// Test script para verificar generateEbayCompatibleHTML
const fs = require('fs');

// Simular las configuraciones de customización
const customizationSettings = {
  storeAssets: {
    logo: 'https://example.com/logo.png',
    banner: 'https://example.com/banner.png',
    logoPosition: 'center',
    bannerHeight: 270
  },
  storePolicies: {
    shipping: 'Free shipping on orders over $50. Standard shipping takes 3-5 business days.',
    returns: '30-day return policy. Items must be in original condition.',
    warranty: '1-year manufacturer warranty included.',
    contact: 'Email: support@example.com | Phone: (555) 123-4567',
    aboutUs: 'We are a trusted electronics retailer with over 10 years of experience.'
  },
  descriptionSettings: {
    layout: 'grid',
    showRelatedProducts: true,
    maxRelatedProducts: 3,
    enablePolicyTabs: true,
    enableBranding: true
  },
  footerSettings: {
    enabled: true,
    logo: 'https://example.com/footer-logo.png',
    copyrightText: '© 2023 Your Store Name. All rights reserved.',
    backgroundColor: '#f8fafc',
    textColor: '#374151'
  }
};

const productData = {
  title: 'Lenovo ThinkCentre M Series Desktop Intel i5 Windows 7 PC',
  price: '$100',
  description: 'Unlock the potential of your workspace with the Lenovo ThinkCentre M Series Desktop, a perfect blend of performance and value for any professional environment.',
  features: [
    'Intel Core i5 processor',
    'DVD drive, multiple USB ports, audio jacks',
    'Windows 7 with Lenovo Enhanced Experience 3',
    'Energy Star certified for reduced energy consumption'
  ]
};

const relatedProducts = [
  {
    id: '1',
    title: 'Wireless Bluetooth Speaker',
    price: '$89.99',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop&crop=center',
    category: 'Electronics',
    order: 1
  },
  {
    id: '2', 
    title: 'USB-C Charging Cable',
    price: '$19.99',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop&crop=center',
    category: 'Electronics',
    order: 2
  },
  {
    id: '3',
    title: 'Phone Stand Holder',
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1544980919-e17526d4ed0a?w=200&h=200&fit=crop&crop=center',
    category: 'Electronics',
    order: 3
  }
];

// Función generateEbayCompatibleHTML simplificada para testing
function generateEbayCompatibleHTML(customizationSettings, productData, relatedProducts = []) {
  const { storeAssets, storePolicies, descriptionSettings, footerSettings } = customizationSettings;
  
  let html = '';
  
  const styles = {
    container: 'font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;',
    banner: 'width: 100%; max-width: 1200px; height: auto; display: block; margin: 0 auto 20px auto; border-radius: 8px;',
    logo: 'max-height: 80px; max-width: 200px; height: auto; width: auto; display: block; margin: 0 auto 20px auto;',
    title: 'color: #1f2937; font-size: 28px; font-weight: bold; margin-bottom: 15px; line-height: 1.3;',
    price: 'font-size: 24px; color: #059669; font-weight: bold; margin-bottom: 20px;',
    description: 'line-height: 1.7; color: #374151; font-size: 16px; margin-bottom: 20px;',
    featuresContainer: 'background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;',
    featuresTitle: 'color: #1f2937; font-size: 18px; font-weight: 600; margin-bottom: 15px;',
    feature: 'display: block; color: #374151; font-size: 14px; line-height: 1.4; margin-bottom: 8px;',
    sectionTitle: 'color: #1f2937; font-size: 20px; font-weight: bold; margin: 30px 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;',
    sectionContent: 'background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; line-height: 1.6; color: #374151;',
    footer: `margin-top: 30px; padding: 20px; background-color: ${footerSettings.backgroundColor}; border-top: 1px solid #e5e7eb; border-radius: 8px; text-align: center;`,
    footerText: `margin: 0; color: ${footerSettings.textColor}; font-size: 14px; line-height: 1.5;`
  };
  
  html += `<div style="${styles.container}">`;
  
  // Add branding if enabled
  if (descriptionSettings.enableBranding && (storeAssets.logo || storeAssets.banner)) {
    if (storeAssets.banner) {
      html += `<img src="${storeAssets.banner}" alt="Store Banner" style="${styles.banner}" />`;
    }
    
    if (storeAssets.logo) {
      const logoAlign = storeAssets.logoPosition === 'center' ? 'center' : 
                       storeAssets.logoPosition === 'right' ? 'right' : 'left';
      html += `<div style="text-align: ${logoAlign}; margin-bottom: 20px;">`;
      html += `<img src="${storeAssets.logo}" alt="Store Logo" style="${styles.logo}" />`;
      html += '</div>';
    }
  }

  // Product Title and Price
  html += `<h1 style="${styles.title}">${productData.title}</h1>`;
  html += `<div style="${styles.price}">${productData.price}</div>`;
  
  // Product Description
  html += `<div style="${styles.description}">${productData.description}</div>`;
  
  // Add features section if available
  if (productData.features && productData.features.length > 0) {
    html += `<div style="${styles.featuresContainer}">`;
    html += `<h3 style="${styles.featuresTitle}">✨ Key Features</h3>`;
    productData.features.forEach(feature => {
      html += `<div style="${styles.feature}">✓ ${feature}</div>`;
    });
    html += '</div>';
  }

  // Add policy sections if enabled
  if (descriptionSettings.enablePolicyTabs) {
    if (storePolicies.shipping) {
      html += `<h2 style="${styles.sectionTitle}">🚚 Shipping Information</h2>`;
      html += `<div style="${styles.sectionContent}">${storePolicies.shipping}</div>`;
    }
    
    if (storePolicies.returns) {
      html += `<h2 style="${styles.sectionTitle}">↩️ Returns Policy</h2>`;
      html += `<div style="${styles.sectionContent}">${storePolicies.returns}</div>`;
    }
    
    if (storePolicies.warranty) {
      html += `<h2 style="${styles.sectionTitle}">🛡️ Warranty Information</h2>`;
      html += `<div style="${styles.sectionContent}">${storePolicies.warranty}</div>`;
    }
    
    if (storePolicies.contact) {
      html += `<h2 style="${styles.sectionTitle}">📞 Contact Us</h2>`;
      html += `<div style="${styles.sectionContent}">${storePolicies.contact}</div>`;
    }
    
    if (storePolicies.aboutUs) {
      html += `<h2 style="${styles.sectionTitle}">ℹ️ About Us</h2>`;
      html += `<div style="${styles.sectionContent}">${storePolicies.aboutUs}</div>`;
    }
  }

  // Add related products if enabled
  if (descriptionSettings.showRelatedProducts && relatedProducts.length > 0) {
    html += '<div style="margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">';
    html += '<h3 style="color: #1f2937; font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center;">You May Also Like</h3>';
    
    if (descriptionSettings.layout === 'grid') {
      html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">';
    } else if (descriptionSettings.layout === 'list') {
      html += '<div style="display: flex; flex-direction: column; gap: 15px;">';
    } else {
      html += '<div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">';
    }
    
    relatedProducts.slice(0, descriptionSettings.maxRelatedProducts).forEach(product => {
      if (descriptionSettings.layout === 'list') {
        html += `<div style="display: flex; align-items: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">`;
        html += `<img src="${product.image}" alt="${product.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; margin-right: 15px;">`;
        html += `<div style="flex: 1;"><h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px; color: #1f2937;">${product.title}</h4><p style="color: #059669; font-weight: 700; font-size: 16px;">${product.price}</p></div>`;
        html += '</div>';
      } else {
        html += `<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; background: white; ${descriptionSettings.layout === 'compact' ? 'min-width: 140px; max-width: 160px;' : 'min-width: 160px;'} box-shadow: 0 1px 3px rgba(0,0,0,0.05);">`;
        html += `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: ${descriptionSettings.layout === 'compact' ? '80px' : '100px'}; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">`;
        html += `<h4 style="font-size: ${descriptionSettings.layout === 'compact' ? '12px' : '13px'}; font-weight: 600; margin-bottom: 8px; line-height: 1.3; color: #1f2937;">${product.title}</h4>`;
        html += `<p style="color: #059669; font-weight: 700; font-size: ${descriptionSettings.layout === 'compact' ? '13px' : '14px'}; margin-bottom: 8px;">${product.price}</p>`;
        html += '</div>';
      }
    });
    
    html += '</div></div>';
  }

  // Add footer if enabled
  if (footerSettings.enabled) {
    html += `<div style="${styles.footer}">`;
    
    if (footerSettings.logo) {
      html += `<img src="${footerSettings.logo}" alt="Store Logo" style="height: 50px; width: 50px; margin-bottom: 10px; object-fit: cover; border-radius: 50%; border: 2px solid #e5e7eb; display: block; margin-left: auto; margin-right: auto;" />`;
    }
    
    html += `<p style="${styles.footerText}">${footerSettings.copyrightText}</p>`;
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// Generar el HTML
const generatedHTML = generateEbayCompatibleHTML(customizationSettings, productData, relatedProducts);

// Guardar en archivo para inspección
fs.writeFileSync('test-output.html', generatedHTML);

console.log('✅ HTML generado correctamente!');
console.log('📄 Archivo guardado como: test-output.html');
console.log('🔍 Verificaciones:');
console.log(`   - Branding habilitado: ${customizationSettings.descriptionSettings.enableBranding ? '✅' : '❌'}`);
console.log(`   - Logo incluido: ${customizationSettings.storeAssets.logo ? '✅' : '❌'}`);
console.log(`   - Banner incluido: ${customizationSettings.storeAssets.banner ? '✅' : '❌'}`);
console.log(`   - Políticas habilitadas: ${customizationSettings.descriptionSettings.enablePolicyTabs ? '✅' : '❌'}`);
console.log(`   - Productos relacionados: ${customizationSettings.descriptionSettings.showRelatedProducts ? '✅' : '❌'}`);
console.log(`   - Footer habilitado: ${customizationSettings.footerSettings.enabled ? '✅' : '❌'}`);
console.log(`   - Longitud del HTML: ${generatedHTML.length} caracteres`);

// Verificar que contiene elementos clave
const checks = [
  { name: 'Título del producto', check: generatedHTML.includes(productData.title) },
  { name: 'Precio del producto', check: generatedHTML.includes(productData.price) },
  { name: 'Descripción del producto', check: generatedHTML.includes(productData.description) },
  { name: 'Features del producto', check: generatedHTML.includes('Key Features') },
  { name: 'Política de envío', check: generatedHTML.includes('Shipping Information') },
  { name: 'Política de devoluciones', check: generatedHTML.includes('Returns Policy') },
  { name: 'Información de garantía', check: generatedHTML.includes('Warranty Information') },
  { name: 'Información de contacto', check: generatedHTML.includes('Contact Us') },
  { name: 'Acerca de nosotros', check: generatedHTML.includes('About Us') },
  { name: 'Productos relacionados', check: generatedHTML.includes('You May Also Like') },
  { name: 'Footer', check: generatedHTML.includes(customizationSettings.footerSettings.copyrightText) }
];

console.log('\n🧪 Verificaciones de contenido:');
checks.forEach(check => {
  console.log(`   ${check.name}: ${check.check ? '✅' : '❌'}`);
});

const allPassed = checks.every(check => check.check);
console.log(`\n${allPassed ? '🎉 ¡Todas las verificaciones pasaron!' : '⚠️ Algunas verificaciones fallaron'}`); 