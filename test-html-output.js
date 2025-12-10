// Test script para verificar generateEbayCompatibleHTML
const fs = require('fs');

// Simular las configuraciones de customización
const customizationSettings = {
  storeAssets: {
    logo: 'https://res.cloudinary.com/dtjpw9isq/image/upload/v1749166920/listingai/store-assets/user_3_logo_1749166920461.jpg',
    banner: 'https://res.cloudinary.com/dtjpw9isq/image/upload/v1749166929/listingai/store-assets/user_3_banner_1749166929261.jpg',
    logoPosition: 'left',
    bannerHeight: 270
  },
  storePolicies: {
    shipping: '',
    returns: '',
    warranty: '',
    contact: '',
    aboutUs: ''
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
    logo: 'https://res.cloudinary.com/dtjpw9isq/image/upload/v1749166948/listingai/store-assets/user_3_footerLogo_1749166948516.jpg',
    copyrightText: '© 2023 Your Store Name. All rights reserved.',
    backgroundColor: '#f8fafc',
    textColor: '#374151'
  }
};

// Datos del producto de prueba
const productData = {
  title: 'Lenovo ThinkCentre M Series Desktop PC Intel i5, Win 7, $100 Deal',
  price: '$500',
  description: `<h2>Lenovo ThinkCentre M Series Desktop PC - Affordable $300 Deal</h2>
<p>Experience reliable performance with the Lenovo ThinkCentre M Series Desktop, perfect for both home and office use. This desktop is an ideal choice for users seeking a powerful yet cost-effective solution.</p>
<h3>Key Features:</h3>
<ul>
<li>Powered by an Intel Core i5 processor for efficient multitasking.</li>
<li>Equipped with a DVD-RW drive for versatile media use.</li>
<li>Multiple USB ports to connect your essential peripherals effortlessly.</li>
<li>Audio input/output jacks for seamless sound experience.</li>
<li>Pre-installed with Windows 7 operating system for user-friendly navigation.</li>
<li>Features Lenovo Enhanced Experience 3 for improved productivity.</li>
<li>Energy Star certified for energy efficiency and cost savings.</li>
</ul>
<p>This Lenovo Desktop offers exceptional value at just $300, making it a smart investment for those in need of a dependable PC Desktop from the ThinkCentre line.</p>
<p>Shipping &amp; Returns: We offer fast shipping and a 30-day return policy for your peace of mind.</p>
<p>Discover more in Computers/Tablets &amp; Networking, Desktops &amp; All-In-Ones, and Lenovo Desktops categories for similar options.</p>`,
  features: ['TIENE 10 GB']
};

// Productos relacionados de prueba
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

// Función simulada generateEbayCompatibleHTML (copiada del archivo real)
function generateEbayCompatibleHTML(customizationSettings, productData, relatedProducts = []) {
  const { storeAssets, storePolicies, descriptionSettings, footerSettings } = customizationSettings;
  
  let html = '';
  
  // CSS styles for eBay compatibility - Pure CSS tabs system
  html += `<style>
    @media (max-width: 768px) {
      .store-branding .banner-container {
        margin: 0 -20px !important;
      }
      .product-content {
        margin: 0 !important;
        border-radius: 0 !important;
      }
      .product-navigation {
        margin: 0 -20px 25px -20px !important;
      }
      .tab-navigation {
        flex-wrap: wrap !important;
      }
      .tab-navigation > label {
        min-width: 0 !important;
        flex: 1 1 50% !important;
        font-size: 12px !important;
        padding: 10px 8px !important;
      }
    }
    
    .banner-image {
      width: 100%;
      height: auto;
      aspect-ratio: 1200/270;
      object-fit: cover;
      display: block;
      border-radius: 8px;
    }
    
    .banner-container {
      width: 100%;
      margin: 0 0 15px 0;
      overflow: visible;
      position: relative;
    }
    
    .logo-overlay {
      position: absolute;
      bottom: 15px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px);
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    
    .logo-overlay img {
      max-height: 50px;
      max-width: 120px;
      height: auto;
      width: auto;
    }
    
    /* Tab System - Pure CSS */
    .tab-inputs {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    
    .tab-navigation {
      display: flex;
      background: #f9fafb;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      overflow: hidden;
    }
    
    .tab-navigation label {
      flex: 1;
      padding: 12px 16px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #6b7280;
      background: #f9fafb;
      user-select: none;
    }
    
    .tab-navigation label:hover {
      color: #374151;
      background: #f3f4f6;
    }
    
    /* Active tab styling */
    #tab-description:checked ~ .product-navigation .tab-navigation label[for="tab-description"],
    #tab-shipping:checked ~ .product-navigation .tab-navigation label[for="tab-shipping"],
    #tab-returns:checked ~ .product-navigation .tab-navigation label[for="tab-returns"],
    #tab-warranty:checked ~ .product-navigation .tab-navigation label[for="tab-warranty"],
    #tab-contact:checked ~ .product-navigation .tab-navigation label[for="tab-contact"],
    #tab-aboutUs:checked ~ .product-navigation .tab-navigation label[for="tab-aboutUs"] {
      background: white;
      color: #3b82f6;
      border-bottom: 2px solid #3b82f6;
      transform: translateY(2px);
    }
    
    /* Tab content hiding/showing */
    .tab-content {
      display: none;
    }
    
    #tab-description:checked ~ .product-content .tab-content.description-content,
    #tab-shipping:checked ~ .product-content .tab-content.shipping-content,
    #tab-returns:checked ~ .product-content .tab-content.returns-content,
    #tab-warranty:checked ~ .product-content .tab-content.warranty-content,
    #tab-contact:checked ~ .product-content .tab-content.contact-content,
    #tab-aboutUs:checked ~ .product-content .tab-content.aboutUs-content {
      display: block;
    }
    
    /* Related products hover effect - CSS only */
    .related-product {
      transition: transform 0.2s;
    }
    
    .related-product:hover {
      transform: translateY(-2px);
    }
    
    @media (max-width: 640px) {
      .logo-overlay {
        position: static;
        background: white;
        margin-top: 10px;
        text-align: center;
        backdrop-filter: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .logo-overlay img {
        max-height: 40px;
        max-width: 100px;
      }
    }
  </style>`;

  // Add branding if enabled
  if (descriptionSettings.enableBranding && (storeAssets.logo || storeAssets.banner)) {
    html += '<div class="store-branding" style="margin-bottom: 30px;">';
    
    if (storeAssets.banner) {
      html += '<div class="banner-container">';
      html += `<img src="${storeAssets.banner}" alt="Store Banner" class="banner-image">`;
      
      // Add logo overlay if available
      if (storeAssets.logo) {
        const logoPosition = storeAssets.logoPosition === 'center' ? 'left: 50%; transform: translateX(-50%);' : 
                           storeAssets.logoPosition === 'right' ? 'right: 15px;' : 'left: 15px;';
        html += `<div class="logo-overlay" style="${logoPosition}">`;
        html += `<img src="${storeAssets.logo}" alt="Store Logo">`;
        html += '</div>';
      }
      
      html += '</div>';
    } else if (storeAssets.logo) {
      // Logo only (no banner)
      const logoAlign = storeAssets.logoPosition === 'center' ? 'center' : 
                       storeAssets.logoPosition === 'right' ? 'right' : 'left';
      html += `<div style="text-align: ${logoAlign}; margin-bottom: 20px;">`;
      html += `<img src="${storeAssets.logo}" alt="Store Logo" style="max-height: 80px; max-width: 200px; height: auto; width: auto;">`;
      html += '</div>';
    }
    
    html += '</div>';
  }

  // Tab system with pure CSS
  if (descriptionSettings.enablePolicyTabs) {
    // Hidden radio inputs for tab functionality
    html += '<input type="radio" id="tab-description" name="product-tabs" class="tab-inputs" checked>';
    html += '<input type="radio" id="tab-shipping" name="product-tabs" class="tab-inputs">';
    html += '<input type="radio" id="tab-returns" name="product-tabs" class="tab-inputs">';
    html += '<input type="radio" id="tab-warranty" name="product-tabs" class="tab-inputs">';
    html += '<input type="radio" id="tab-contact" name="product-tabs" class="tab-inputs">';
    html += '<input type="radio" id="tab-aboutUs" name="product-tabs" class="tab-inputs">';

    // Tab navigation
    html += '<div class="product-navigation" style="margin-bottom: 25px; border-bottom: 2px solid #e5e7eb;">';
    html += '<div class="tab-navigation">';
    html += '<label for="tab-description">Product Description</label>';
    html += '<label for="tab-shipping">Shipping</label>';
    html += '<label for="tab-returns">Returns</label>';
    html += '<label for="tab-warranty">Warranty</label>';
    html += '<label for="tab-contact">Contact Us</label>';
    html += '<label for="tab-aboutUs">About Us</label>';
    html += '</div></div>';
  }

  // Product content container
  html += '<div class="product-content" style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); word-wrap: break-word; overflow-wrap: break-word;">';

  // Product Description Tab Content
  html += '<div class="tab-content description-content">';
  html += `<h1 style="color: #1f2937; font-size: clamp(20px, 5vw, 28px); font-weight: bold; margin-bottom: 15px; line-height: 1.3; word-wrap: break-word;">${productData.title}</h1>`;
  html += `<div style="display: flex; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">`;
  html += `<span style="font-size: clamp(18px, 4vw, 24px); color: #059669; font-weight: 700;">${productData.price}</span>`;
  html += `<span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">In Stock</span>`;
  html += `</div>`;
  html += `<div style="margin-bottom: 25px;">`;
  html += `<p style="line-height: 1.7; color: #374151; font-size: clamp(14px, 3vw, 16px); margin-bottom: 20px; word-wrap: break-word;">${productData.description}</p>`;
  
  // Add features section if available
  if (productData.features && productData.features.length > 0) {
    html += '<div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">';
    html += '<h3 style="color: #1f2937; font-size: clamp(16px, 3.5vw, 18px); font-weight: 600; margin-bottom: 15px; display: flex; align-items: center;">✨ Key Features</h3>';
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">';
    productData.features.forEach(feature => {
      html += `<div style="display: flex; align-items: flex-start; color: #374151; font-size: clamp(12px, 2.5vw, 14px); line-height: 1.4;">`;
      html += `<span style="color: #10b981; margin-right: 8px; font-weight: bold; flex-shrink: 0;">✓</span><span style="word-wrap: break-word;">${feature}</span>`;
      html += `</div>`;
    });
    html += '</div></div>';
  }
  html += '</div></div>';

  // Other tab contents (only if policies are enabled)
  if (descriptionSettings.enablePolicyTabs) {
    // Shipping Tab Content
    html += '<div class="tab-content shipping-content">';
    html += '<h2 style="color: #1f2937; font-size: clamp(18px, 4vw, 24px); font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap;">🚚 Shipping Information</h2>';
    if (storePolicies.shipping) {
      html += `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #374151; font-size: clamp(14px, 3vw, 16px); white-space: pre-wrap; word-wrap: break-word;">${storePolicies.shipping}</p>`;
      html += '</div>';
    } else {
      html += `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #92400e; font-size: clamp(14px, 3vw, 16px);">No shipping policy configured yet. Please add your shipping information in the Customization settings.</p>`;
      html += '</div>';
    }
    html += '</div>';

    // Returns Tab Content
    html += '<div class="tab-content returns-content">';
    html += '<h2 style="color: #1f2937; font-size: clamp(18px, 4vw, 24px); font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap;">↩️ Returns Policy</h2>';
    if (storePolicies.returns) {
      html += `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #374151; font-size: clamp(14px, 3vw, 16px); white-space: pre-wrap; word-wrap: break-word;">${storePolicies.returns}</p>`;
      html += '</div>';
    } else {
      html += `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #92400e; font-size: clamp(14px, 3vw, 16px);">No returns policy configured yet. Please add your returns information in the Customization settings.</p>`;
      html += '</div>';
    }
    html += '</div>';

    // Warranty Tab Content
    html += '<div class="tab-content warranty-content">';
    html += '<h2 style="color: #1f2937; font-size: clamp(18px, 4vw, 24px); font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap;">🛡️ Warranty Information</h2>';
    if (storePolicies.warranty) {
      html += `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #374151; font-size: clamp(14px, 3vw, 16px); white-space: pre-wrap; word-wrap: break-word;">${storePolicies.warranty}</p>`;
      html += '</div>';
    } else {
      html += `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #92400e; font-size: clamp(14px, 3vw, 16px);">No warranty information configured yet. Please add your warranty details in the Customization settings.</p>`;
      html += '</div>';
    }
    html += '</div>';

    // Contact Tab Content
    html += '<div class="tab-content contact-content">';
    html += '<h2 style="color: #1f2937; font-size: clamp(18px, 4vw, 24px); font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap;">📞 Contact Us</h2>';
    if (storePolicies.contact) {
      html += `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #374151; font-size: clamp(14px, 3vw, 16px); white-space: pre-wrap; word-wrap: break-word;">${storePolicies.contact}</p>`;
      html += '</div>';
    } else {
      html += `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #92400e; font-size: clamp(14px, 3vw, 16px);">No contact information configured yet. Please add your contact details in the Customization settings.</p>`;
      html += '</div>';
    }
    html += '</div>';

    // About Us Tab Content
    html += '<div class="tab-content aboutUs-content">';
    html += '<h2 style="color: #1f2937; font-size: clamp(18px, 4vw, 24px); font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap;">ℹ️ About Us</h2>';
    if (storePolicies.aboutUs) {
      html += `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #374151; font-size: clamp(14px, 3vw, 16px); white-space: pre-wrap; word-wrap: break-word;">${storePolicies.aboutUs}</p>`;
      html += '</div>';
    } else {
      html += `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin-bottom: 20px;">`;
      html += `<p style="line-height: 1.6; color: #92400e; font-size: clamp(14px, 3vw, 16px);">No about us information configured yet. Please add your company information in the Customization settings.</p>`;
      html += '</div>';
    }
    html += '</div>';
  }

  // Close product content container
  html += '</div>';

  // Add related products if enabled
  if (descriptionSettings.showRelatedProducts && relatedProducts.length > 0) {
    html += '<div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">';
    html += '<h3 style="color: #1f2937; font-size: clamp(16px, 4vw, 20px); font-weight: 700; margin-bottom: 20px; text-align: center;">You May Also Like</h3>';
    
    if (descriptionSettings.layout === 'grid') {
      html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">';
    } else if (descriptionSettings.layout === 'list') {
      html += '<div style="display: flex; flex-direction: column; gap: 15px;">';
    } else {
      html += '<div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">';
    }
    
    relatedProducts.slice(0, descriptionSettings.maxRelatedProducts).forEach(product => {
      if (descriptionSettings.layout === 'list') {
        html += `<div class="related-product" style="display: flex; align-items: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 10px;">`;
        html += `<img src="${product.image}" alt="${product.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; flex-shrink: 0;">`;
        html += `<div style="flex: 1; min-width: 0;"><h4 style="font-size: clamp(13px, 3vw, 15px); font-weight: 600; margin-bottom: 6px; color: #1f2937; word-wrap: break-word;">${product.title}</h4><p style="color: #059669; font-weight: 700; font-size: clamp(14px, 3vw, 16px);">${product.price}</p></div>`;
        html += '</div>';
      } else {
        html += `<div class="related-product" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; background: white; ${descriptionSettings.layout === 'compact' ? 'min-width: 140px; max-width: 160px;' : 'min-width: 160px;'} box-shadow: 0 1px 3px rgba(0,0,0,0.05); flex-shrink: 0;">`;
        html += `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: ${descriptionSettings.layout === 'compact' ? '80px' : '100px'}; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">`;
        html += `<h4 style="font-size: ${descriptionSettings.layout === 'compact' ? '12px' : '13px'}; font-weight: 600; margin-bottom: 8px; line-height: 1.3; color: #1f2937; word-wrap: break-word; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${product.title}</h4>`;
        html += `<p style="color: #059669; font-weight: 700; font-size: ${descriptionSettings.layout === 'compact' ? '13px' : '14px'}; margin-bottom: 8px;">${product.price}</p>`;
        html += '</div>';
      }
    });
    
    html += '</div></div>';
  }

  // Add footer if enabled
  if (footerSettings.enabled) {
    html += `<div class="footer" style="
      margin-top: 30px;
      padding: 20px;
      background-color: ${footerSettings.backgroundColor};
      border-top: 1px solid #e5e7eb;
      border-radius: 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    ">`;
    
    if (footerSettings.logo) {
      html += `<img src="${footerSettings.logo}" alt="Store Logo" style="
        height: 50px;
        width: 50px;
        margin-bottom: 5px;
        object-fit: cover;
        border-radius: 50%;
        border: 2px solid #e5e7eb;
        display: block;
      ">`;
    }
    
    html += `<p style="
      margin: 0;
      color: ${footerSettings.textColor};
      font-size: 14px;
      line-height: 1.5;
    ">${footerSettings.copyrightText}</p>`;
    
    html += '</div>';
  }

  return html;
}

// Generar el HTML
const generatedHTML = generateEbayCompatibleHTML(customizationSettings, productData, relatedProducts);

// Guardar el HTML generado
fs.writeFileSync('generated-output.html', generatedHTML);

console.log('✅ HTML generado y guardado en generated-output.html');
console.log('📊 Verificaciones:');
console.log('  - Incluye <style> con CSS puro para tabs:', generatedHTML.includes('<style>') ? '✅' : '❌');
console.log('  - Incluye radio inputs para tabs:', generatedHTML.includes('input type="radio"') ? '✅' : '❌');
console.log('  - Incluye navegación de tabs:', generatedHTML.includes('tab-navigation') ? '✅' : '❌');
console.log('  - Incluye contenido de tabs:', generatedHTML.includes('tab-content') ? '✅' : '❌');
console.log('  - Incluye branding (banner + logo):', generatedHTML.includes('store-branding') ? '✅' : '❌');
console.log('  - Incluye productos relacionados:', generatedHTML.includes('You May Also Like') ? '✅' : '❌');
console.log('  - Incluye footer:', generatedHTML.includes('footer') ? '✅' : '❌');
console.log('  - Sin JavaScript:', !generatedHTML.includes('<script>') ? '✅' : '❌');
console.log('  - Tamaño del HTML:', (generatedHTML.length / 1024).toFixed(1) + ' KB'); 