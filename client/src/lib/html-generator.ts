interface StoreAssets {
  logo: string;
  banner: string;
  logoPosition: 'left' | 'center' | 'right';
  bannerHeight: number;
}

interface StorePolicies {
  shipping: string;
  returns: string;
  warranty: string;
  contact: string;
  aboutUs: string;
}

interface RelatedProduct {
  id: string;
  title: string;
  price: string;
  image: string;
  category: string;
  order: number;
}

interface DescriptionSettings {
  layout: 'grid' | 'list' | 'compact';
  showRelatedProducts: boolean;
  maxRelatedProducts: number;
  enablePolicyTabs: boolean;
  enableBranding: boolean;
}

interface FooterSettings {
  enabled: boolean;
  logo: string;
  copyrightText: string;
  backgroundColor: string;
  textColor: string;
}

interface CustomizationSettings {
  storeAssets: StoreAssets;
  storePolicies: StorePolicies;
  descriptionSettings: DescriptionSettings;
  footerSettings: FooterSettings;
}

interface ProductData {
  title: string;
  price: string;
  description: string;
  features: string[];
}

// Función para generar HTML compatible con eBay (sin JavaScript, solo CSS inline)
export function generateEbayCompatibleHTML(
  customizationSettings: CustomizationSettings,
  productData: ProductData,
  relatedProducts: RelatedProduct[] = [],
  showOnlyDescription: boolean = false
): string {
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
    html += '<div class="store-branding" style="margin-bottom: 0px;">';
    
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

// Function to generate only the product description content (for use inside tabs)
export function generateProductDescriptionOnly(
  productData: ProductData
): string {
  let html = '';
  
  // Product title
  html += `<h1 style="color: #1f2937; font-size: clamp(20px, 5vw, 28px); font-weight: bold; margin-bottom: 15px; line-height: 1.3; word-wrap: break-word;">${productData.title}</h1>`;
  
  // Price and stock status
  html += `<div style="display: flex; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">`;
  html += `<span style="font-size: clamp(18px, 4vw, 24px); color: #059669; font-weight: 700;">$${productData.price}</span>`;
  html += `<span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">In Stock</span>`;
  html += `</div>`;
  
  // Product description
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
  html += '</div>';
  
  return html;
} 