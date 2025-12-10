import OpenAI from "openai";
import { generateContentSchema } from "@shared/schema";
import type { z } from "zod";

type GenerateContent = z.infer<typeof generateContentSchema>;

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Interface for comprehensive image analysis result
export interface ImageAnalysisResult {
  // Basic product information
  productName: string;
  categories: string[];
  features: string;
  suggestedPrice: string;
  condition: string;
  tone: string;
  
  // eBay-specific fields
  title: string;
  description: string;
  subtitle?: string;
  brand?: string;
  mpn?: string;
  upc?: string[];
  ean?: string[];
  isbn?: string[];
  epid?: string;
  
  // eBay category detection (auto-detected during AI analysis)
  categoryId?: string;
  categoryName?: string;
  categoryConfidence?: number;
  
  // Product aspects
  productAspects: Record<string, string[]>;
  
  // Package details
  packageWeight?: number;
  packageWeightUnit?: string;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  packageDimensionUnit?: string;
  packageType?: string;
  shippingIrregular?: boolean;
  
  // Inventory details
  quantity?: number;
  sku?: string;
  
  // Additional extracted data
  color?: string;
  material?: string;
  size?: string;
  model?: string;
  type?: string;
}

// Interface for customization settings
interface CustomizationSettings {
  storeAssets: {
    logo: string;
    banner: string;
    logoPosition: 'left' | 'center' | 'right';
    bannerHeight: number;
  };
  storePolicies: {
    shipping: string;
    returns: string;
    warranty: string;
    contact: string;
    aboutUs: string;
  };
  descriptionSettings: {
    layout: 'grid' | 'list' | 'compact';
    showRelatedProducts: boolean;
    maxRelatedProducts: number;
    enablePolicyTabs: boolean;
    enableBranding: boolean;
  };
  footerSettings: {
    enabled: boolean;
    logo: string;
    copyrightText: string;
    backgroundColor: string;
    textColor: string;
  };
}

// Sample related products for template
const sampleRelatedProducts = [
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

// Function to generate HTML using customization template
export function generateCustomizedHTML(
  productData: {
    title: string;
    description: string;
    price: string;
    features: string[];
  },
  customizationSettings: CustomizationSettings,
  activeTab: string = 'description'
): string {
  const { storeAssets, storePolicies, descriptionSettings, footerSettings } = customizationSettings;
  
  let html = '';
  
  // Add responsive CSS styles at the beginning
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
      .tab-navigation > div {
        min-width: 0 !important;
        flex: 1 1 50% !important;
        font-size: 12px !important;
        padding: 10px 8px !important;
      }
    }
    
    .banner-image {
      width: 100%;
      height: auto;
      max-width: 1200px;
      aspect-ratio: 1200/270;
      object-fit: contain;
      display: block;
      margin: 0 auto;
      border-radius: 8px;
    }
    
    .banner-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto 15px auto;
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
    html += `<div class="store-branding" style="margin-bottom: 30px;">`;
    
    // Add banner if available
    if (storeAssets.banner) {
      html += `<div class="banner-container">`;
      html += `<img src="${storeAssets.banner}" alt="Store Banner" class="banner-image" />`;
      
      // Add logo overlay if available
      if (storeAssets.logo) {
        const logoPosition = storeAssets.logoPosition === 'center' ? 'left: 50%; transform: translateX(-50%);' : 
                             storeAssets.logoPosition === 'right' ? 'right: 15px;' : 'left: 15px;';
        html += `<div class="logo-overlay" style="${logoPosition}">`;
        html += `<img src="${storeAssets.logo}" alt="Store Logo" />`;
        html += '</div>';
      }
      html += '</div>';
    } else if (storeAssets.logo) {
      // Logo only
      html += `<div style="text-align: ${storeAssets.logoPosition}; margin-bottom: 20px;">`;
      html += `<img src="${storeAssets.logo}" alt="Store Logo" style="max-height: 80px; max-width: 200px; height: auto; width: auto;">`;
      html += '</div>';
    }
    
    html += '</div>';
  }

  // Add professional navigation tabs
  if (descriptionSettings.enablePolicyTabs) {
    html += '<div class="product-navigation" style="margin-bottom: 25px; border-bottom: 2px solid #e5e7eb;">';
    html += '<div class="tab-navigation" style="display: flex; background: #f9fafb; border-top-left-radius: 8px; border-top-right-radius: 8px; overflow: hidden;">';
    
    const navItems = [
      { key: 'description', label: 'Product Description' },
      { key: 'shipping', label: 'Shipping' },
      { key: 'returns', label: 'Returns' },
      { key: 'warranty', label: 'Warranty' },
      { key: 'contact', label: 'Contact Us' },
      { key: 'aboutUs', label: 'About Us' }
    ];
    
    navItems.forEach((item) => {
      const isActive = activeTab === item.key;
      html += `<div 
        data-tab="${item.key}" 
        style="flex: 1; padding: 12px 16px; text-align: center; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; border: none; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ${
          isActive 
            ? 'background: white; color: #3b82f6; border-bottom: 2px solid #3b82f6; transform: translateY(2px);' 
            : 'color: #6b7280; hover:color: #374151; hover:background: #f3f4f6;'
        }" 
      >${item.label}</div>`;
    });
    
    html += '</div></div>';
  }

  // Add product content container
  html += `<div class="product-content" style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); word-wrap: break-word; overflow-wrap: break-word;">`;
  
  // Product Description Tab Content (always show this for eBay)
  html += `<h1 style="color: #1f2937; font-size: clamp(20px, 5vw, 28px); font-weight: bold; margin-bottom: 15px; line-height: 1.3; word-wrap: break-word;">${productData.title}</h1>`;
  html += `<div style="display: flex; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">`;
  html += `<span style="font-size: clamp(18px, 4vw, 24px); color: #059669; font-weight: 700;">$${productData.price}</span>`;
  html += `<span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">In Stock</span>`;
  html += `</div>`;
  html += `<div style="margin-bottom: 25px;">`;
  html += `<p style="line-height: 1.7; color: #374151; font-size: clamp(14px, 3vw, 16px); margin-bottom: 20px; word-wrap: break-word;">${productData.description}</p>`;
  
  // Add features section if available
  if (productData.features.length > 0) {
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

  // Add related products if enabled
  if (descriptionSettings.showRelatedProducts && sampleRelatedProducts.length > 0) {
    html += '<div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">';
    html += '<h3 style="color: #1f2937; font-size: clamp(16px, 4vw, 20px); font-weight: 700; margin-bottom: 20px; text-align: center;">You May Also Like</h3>';
    
    if (descriptionSettings.layout === 'grid') {
      html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">';
    } else if (descriptionSettings.layout === 'list') {
      html += '<div style="display: flex; flex-direction: column; gap: 15px;">';
    } else {
      html += '<div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">';
    }
    
    sampleRelatedProducts.slice(0, descriptionSettings.maxRelatedProducts).forEach(product => {
      if (descriptionSettings.layout === 'list') {
        html += `<div style="display: flex; align-items: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 10px;">`;
        html += `<img src="${product.image}" alt="${product.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; flex-shrink: 0;">`;
        html += `<div style="flex: 1; min-width: 0;"><h4 style="font-size: clamp(13px, 3vw, 15px); font-weight: 600; margin-bottom: 6px; color: #1f2937; word-wrap: break-word;">${product.title}</h4><p style="color: #059669; font-weight: 700; font-size: clamp(14px, 3vw, 16px);">${product.price}</p></div>`;
        html += '<div style="flex-shrink: 0;"><button style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;">View</button></div>';
        html += '</div>';
      } else {
        html += `<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; background: white; ${descriptionSettings.layout === 'compact' ? 'min-width: 140px; max-width: 160px;' : 'min-width: 160px;'} box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s; cursor: pointer; flex-shrink: 0;">`;
        html += `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: ${descriptionSettings.layout === 'compact' ? '80px' : '100px'}; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">`;
        html += `<h4 style="font-size: ${descriptionSettings.layout === 'compact' ? '12px' : '13px'}; font-weight: 600; margin-bottom: 8px; line-height: 1.3; color: #1f2937; word-wrap: break-word; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${product.title}</h4>`;
        html += `<p style="color: #059669; font-weight: 700; font-size: ${descriptionSettings.layout === 'compact' ? '13px' : '14px'}; margin-bottom: 8px;">${product.price}</p>`;
        html += '<button style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; width: 100%; cursor: pointer;">Add to Cart</button>';
        html += '</div>';
      }
    });
    
    html += '</div></div>';
  }
  
  html += '</div>'; // Close product-content

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

// Analyze multiple product images using OpenAI Vision API
export async function analyzeProductImages(imageDataArray: string[]): Promise<ImageAnalysisResult> {
  try {
    if (!imageDataArray || imageDataArray.length === 0) {
      throw new Error("No images provided for analysis");
    }

    const prompt = `Act as an eBay product analyst specializing in visual content analysis for maximum search visibility. Analyze these ${imageDataArray.length} product images and identify ALL key physical features and attributes for SEO optimization:

VISUAL CONTENT ANALYSIS - IDENTIFY ALL VISIBLE FEATURES:
1. Physical Attributes (CRITICAL for SEO):
   - Brand name/logo (visible markings, labels, text)
   - Model number/part number (any visible identifiers)
   - Color (exact shade, primary/secondary colors)
   - Material (plastic, metal, fabric, leather, glass, etc.)
   - Size/dimensions (relative to common objects if visible)
   - Condition (NEW, USED, REFURBISHED - based on packaging/wear)
   - Shape/design (round, square, compact, slim, etc.)

2. Product Identification:
   - Specific product name (be exact, not generic)
   - Type/category (laptop, phone, watch, shirt, etc.)
   - Functionality visible (buttons, ports, features)
   - Compatibility indicators (connector types, compatibility labels)
   - Any distinctive design elements

3. eBay Search Optimization:
   - 2-3 highly specific eBay categories
   - SEO-optimized title focusing on buyer search terms
   - Key features buyers actually search for
   - Common search terms for this product type

4. Required eBay Data:
   - Brand, Model, Type, Color, Material, Size
   - UPC/EAN/ISBN codes if visible on packaging
   - MPN (Manufacturer Part Number) if visible
   - Any compatibility information

5. Package/Shipping Analysis:
   - Estimated weight and dimensions
   - Package type and condition
   - Suggested quantity visible

6. Market Intelligence:
   - Suggested price range based on product type
   - Professional tone recommendation
   - Marketing angle (features vs. benefits focus)

CATEGORY GUIDELINES - Be extremely specific:
- For Desktop Computers: Use "Desktop Computers", "All-in-One Computers"
- For Laptops: Use "Laptop Computers", "Notebook Computers"
- For Tablets: Use "Tablets & eBook Readers"
- For Phones: Use "Cell Phones & Smartphones", "Cell Phone Accessories"
- For Cameras: Use "Digital Cameras", "Film Cameras", "Camera Accessories"
- For Gaming: Use "Video Games & Consoles", "Gaming Accessories"
- For Monitors: Use "Monitors, Projectors & Accessories"
- For Printers: Use "Printers, Scanners & Supplies"
- For Audio: Use "Audio & Home Theater", "Portable Audio & Headphones"
- For Clothing: Use "Men's Clothing", "Women's Clothing", "Men's Shoes", "Women's Shoes"
- For Home: Use "Kitchen & Dining", "Home Décor", "Furniture", "Appliances"
- For Books: Use "Books & Magazines", "Textbooks", "Children's Books"
- For Tools: Use "Tools & Workshop Equipment", "Hand Tools", "Power Tools"

CRITICAL SEO ANALYSIS REQUIREMENTS:
Use ALL provided images to extract maximum SEO value. Focus on:
- Brand markings, model numbers, labels, barcodes (for exact identification)
- Physical attributes buyers search for (color, material, size, condition)
- Functionality and compatibility features
- Condition indicators (NEW/USED based on packaging/wear)
- Any text, specifications, or identifiers visible
- Size references and scale indicators

Generate buyer-focused, search-optimized content:
{
  "productName": "Exact brand model name from visual analysis",
  "categories": ["Specific eBay Category", "Targeted Subcategory", "Product Type"],
  "features": "Key features buyers search for (concise, max 60 chars each, factual)",
  "suggestedPrice": "20-30",
  "condition": "NEW",
  "tone": "professional",
  "title": "SEO title with search terms buyers actually use (under 80 chars)",
  "description": "Conversion-focused description with key attributes (under 300 chars)",
  "subtitle": "Optional subtitle if needed",
  "brand": "Brand name if visible",
  "mpn": "Model/Part number if visible",
  "upc": ["UPC codes if visible"],
  "ean": ["EAN codes if visible"],
  "isbn": ["ISBN codes if visible"],
  "epid": "eBay product ID if identifiable",
  "productAspects": {
    "Brand": ["Brand name"],
    "Model": ["Model name"],
    "Type": ["Product type"],
    "Color": ["Primary color"],
    "Material": ["Main material"],
    "Size": ["Size if applicable"]
  },
  "packageWeight": 1.5,
  "packageWeightUnit": "POUND",
  "packageLength": 12,
  "packageWidth": 8,
  "packageHeight": 4,
  "packageDimensionUnit": "INCH",
  "packageType": "MAILING_BOX",
  "quantity": 1,
  "sku": "AUTO-GENERATED-SKU",
  "color": "Primary color",
  "material": "Main material",
  "size": "Size description",
  "model": "Model name",
  "type": "Product type"
}

CRITICAL SEO RULES:
1. Categories must be HIGHLY SPECIFIC product types buyers search for:
- "Desktop Computers" NOT "Electronics" or "Computers"
- "Cell Phones & Smartphones" NOT "Electronics" or "Phone Accessories"
- "Digital Cameras" NOT "Electronics" or "Camera & Photo"
- "Men's Clothing" NOT "Clothing" or "Apparel"

2. Title must include buyer search terms (brand, model, key features, condition)
3. Description must focus on physical attributes and compatibility
4. Avoid generic terms - be specific about what you see
5. Use exact brand/model names visible in images
6. Include color, material, size if clearly visible

Generate content that matches exactly what buyers type in eBay search.`;

    // Create content array with text and all images
    const messageContent: any[] = [
      {
        type: "text",
        text: prompt
      }
    ];

    // Add all images to the message
    imageDataArray.forEach((imageData, index) => {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: imageData,
          detail: "high"
        }
      });
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert product analyst specializing in eBay listings. Analyze multiple product images thoroughly and provide detailed, accurate product information in JSON format. Use all images collectively to provide the most comprehensive analysis."
        },
        {
          role: "user",
          content: messageContent
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate required fields
    if (!result.productName || !result.categories || !result.features) {
      throw new Error("AI analysis incomplete - missing required fields");
    }

    // Ensure categories is an array
    if (!Array.isArray(result.categories)) {
      result.categories = [result.categories || "Electronics"];
    }

    // Set defaults for missing basic fields
    result.suggestedPrice = result.suggestedPrice || "10-50";
    result.condition = result.condition || "NEW";
    result.tone = result.tone || "professional";
    
    // Set defaults for eBay-specific fields
    result.title = result.title || result.productName;
    result.description = result.description || result.features;
    result.quantity = result.quantity || 1;
    
    // Generate SKU if not provided
    if (!result.sku) {
      const brand = result.brand || "ITEM";
      const model = result.model || "UNKNOWN";
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      result.sku = `${brand.toUpperCase()}-${model.toUpperCase()}-${date}`.replace(/[^A-Z0-9-]/g, "");
    }
    
    // Ensure productAspects is an object
    if (!result.productAspects || typeof result.productAspects !== 'object') {
      result.productAspects = {};
    }
    
    // Add basic aspects if available
    if (result.brand) result.productAspects.Brand = [result.brand];
    if (result.model) result.productAspects.Model = [result.model];
    if (result.type) result.productAspects.Type = [result.type];
    if (result.color) result.productAspects.Color = [result.color];
    if (result.material) result.productAspects.Material = [result.material];
    if (result.size) result.productAspects.Size = [result.size];
    
    // Set package defaults if not provided
    result.packageWeight = result.packageWeight || 1.0;
    result.packageWeightUnit = result.packageWeightUnit || "POUND";
    result.packageLength = result.packageLength || 10;
    result.packageWidth = result.packageWidth || 8;
    result.packageHeight = result.packageHeight || 6;
    result.packageDimensionUnit = result.packageDimensionUnit || "INCH";
    result.packageType = result.packageType || "MAILING_BOX";
    
    // ENHANCED: Auto-detect eBay leaf category during AI autofill using new category manager
    console.log('🤖 Detecting eBay leaf category during AI autofill...');
    try {
      const { detectCategoryFromImageAnalysis } = await import('./ebay-category-manager');
      
      const categoryResult = await detectCategoryFromImageAnalysis({
        title: result.productName,
        description: result.description,
        brand: result.brand,
        model: result.model,
        type: result.type,
        features: result.features ? [result.features] : [],
        price: result.suggestedPrice ? parseFloat(result.suggestedPrice.split('-')[0]) : undefined,
        condition: result.condition,
        imageUrls: []
      });
      
      if (categoryResult && categoryResult.categoryId) {
        result.categoryId = categoryResult.categoryId;
        result.categoryName = categoryResult.categoryName;
        result.categoryConfidence = categoryResult.confidence;
        
        console.log(`✅ AI detected leaf category: ${result.categoryId} - ${result.categoryName} (confidence: ${result.categoryConfidence}, strategy: ${categoryResult.strategy})`);
      }
    } catch (categoryError) {
      console.warn('⚠️ Could not detect eBay category during AI autofill:', categoryError);
      // Continue without category - user can select manually
    }
    
    // Ensure arrays for product identifiers
    if (result.upc && !Array.isArray(result.upc)) {
      result.upc = [result.upc];
    }
    if (result.ean && !Array.isArray(result.ean)) {
      result.ean = [result.ean];
    }
    if (result.isbn && !Array.isArray(result.isbn)) {
      result.isbn = [result.isbn];
    }

    return result as ImageAnalysisResult;

  } catch (error) {
    console.error("Multiple image analysis error:", error);
    throw new Error(`Failed to analyze images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Keep the single image function for backward compatibility
export async function analyzeProductImage(imageData: string): Promise<ImageAnalysisResult> {
  return analyzeProductImages([imageData]);
}

export async function generateListingContent(
  data: GenerateContent, 
  customizationSettings?: CustomizationSettings
): Promise<{
  title: string;
  description: string;
  productData: GenerateContent;
}> {
  try {
    const { productName, price, categories, features, tone, language = "en" } = data;
    
    const languageMap: { [key: string]: string } = {
      en: "English",
      es: "Spanish",
      de: "German", 
      fr: "French",
      it: "Italian",
      pt: "Portuguese",
      nl: "Dutch",
      pl: "Polish"
    };

    const targetLanguage = languageMap[language] || "English";
    
    // Handle categories array
    const categoryArray = Array.isArray(categories) ? categories : ["Electronics"];
    const primaryCategory = categoryArray[0] || "Electronics";
    const allCategories = categoryArray.join(", ");
    
    const prompt = `Act as an eBay SEO expert with advanced knowledge of search algorithms and buyer behavior. Analyze this product and create high-converting listing content:

PRODUCT ANALYSIS:
Product Name: ${productName}
Price: $${price}
Primary Category: ${primaryCategory}
All Categories: ${allCategories}
Key Features: ${features || 'Not specified'}
Tone: ${tone}
Language: ${targetLanguage}

SEO OPTIMIZATION REQUIREMENTS:

TITLE GENERATION (MAX 80 CHARACTERS):
- Use common search terms buyers actually type on eBay
- Include long-tail keywords for better visibility
- Lead with brand name if recognizable
- Include key physical attributes (color, size, material, condition)
- Use buyer-oriented language that creates urgency
- Integrate category-specific terms naturally
- Avoid filler words to maximize keyword density

DESCRIPTION GENERATION (MAX 600 CHARACTERS):
- Create detailed, professional descriptions that convert browsers to buyers
- Structure: Specifications → Key Features → Use Cases → Value Proposition
- Include specific technical details: processor model, RAM, storage, ports
- Mention all visible physical attributes: color, material, condition, dimensions
- Highlight compatibility and connectivity options
- Add professional use cases and target audience
- Include condition details and what's included in sale
- Use power words that drive action: "professional", "reliable", "efficient"
- Integrate strategic keywords naturally throughout
- End with confidence-building statement (warranty, tested, etc.)
- NO prohibited language or unverifiable claims
- Focus on factual benefits that justify the price point

DESCRIPTION STRUCTURE EXAMPLE:
"Professional [Brand Model] desktop computer featuring [specific processor], [RAM amount], [storage type]. Includes [specific ports/features]. Ideal for business, home office, or educational use. Compact [dimensions if known] design saves space. All ports tested and fully functional. [Condition statement]. Perfect for [specific use cases]. [What's included in sale]."

CRITICAL RULES:
1. Write EVERYTHING in ${targetLanguage} language
2. Use only factual, verifiable information
3. Focus on search visibility and conversion optimization
4. Integrate keywords from categories: ${allCategories}
5. Use professional tone: ${tone}
6. NO HTML tags - plain text only
7. Create 4-6 sentences with logical flow
8. Include technical specifications when possible
9. End with confidence-building statement

Please respond with JSON:
{
  "title": "SEO-optimized eBay title under 80 chars with search keywords",
  "description": "Professional, detailed description under 600 chars: specifications + features + use cases + value proposition with strategic keywords naturally integrated"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an eBay SEO specialist and professional copywriter with expertise in marketplace optimization. Always respond with valid JSON containing title and description fields. CRITICAL: Title must be EXACTLY under 80 characters, description under 600 characters. Create detailed, professional descriptions that include specifications, features, use cases, and value propositions. Use only plain text (no HTML). Focus on search terms buyers actually use, avoid keyword stuffing, and never use prohibited eBay language like 'like new' or unverifiable superlatives."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and ensure title length compliance
    if (!result.title || !result.description) {
      throw new Error("AI response missing required fields");
    }

    // Ensure title is under 80 characters
    if (result.title.length > 80) {
      result.title = result.title.substring(0, 77) + "...";
    }

    // Clean up description - ensure it's plain text
    result.description = result.description
      .replace(/<[^>]*>/g, '') // Remove any HTML tags
      .replace(/\n\n+/g, '\n') // Replace multiple newlines with single
      .trim();

    return {
      title: result.title,
      description: result.description, // Return plain text description only
      productData: data,
    };

  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback error handling
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    } else {
      throw new Error("Failed to generate content: Unknown error occurred");
    }
  }
}

export interface StructuredDescription {
  title: string;
  sections: {
    id: string;
    type: 'heading' | 'paragraph' | 'list' | 'highlight';
    title: string;
    content: string | string[];
    order: number;
  }[];
  keywords: string[];
  brandTone: 'professional' | 'casual' | 'luxury' | 'friendly' | 'technical' | 'creative';
}

export interface RelatedProduct {
  id: string;
  title: string;
  price: string;
  image?: string;
  category: string;
  relevanceScore: number;
}

export async function generateStructuredDescription(
  productData: any,
  brandSettings?: any
): Promise<StructuredDescription> {
  try {
    const tone = brandSettings?.tone || 'professional';
    const voice = brandSettings?.voice || 'informative';
    const style = brandSettings?.style || 'modern';
    const targetAudience = brandSettings?.targetAudience || 'general';
    const brandName = brandSettings?.brandName || '';
    const tagline = brandSettings?.tagline || '';
    
    // Build brand context
    let brandContext = `Brand Tone: ${tone}, Voice: ${voice}, Style: ${style}, Target Audience: ${targetAudience}`;
    
    if (brandName) brandContext += `\nBrand Name: ${brandName}`;
    if (tagline) brandContext += `\nBrand Tagline: ${tagline}`;
    
    // Add selling points if available
    if (brandSettings?.sellingPoints?.length > 0) {
      brandContext += `\nKey Selling Points: ${brandSettings.sellingPoints.join(', ')}`;
    }
    
    // Add keywords for SEO
    if (brandSettings?.keywords?.length > 0) {
      brandContext += `\nSEO Keywords to incorporate: ${brandSettings.keywords.join(', ')}`;
    }
    
    // Add templates if available
    let templateGuidance = '';
    if (brandSettings?.templates) {
      if (brandSettings.templates.productIntro) {
        templateGuidance += `\nProduct Introduction Style: "${brandSettings.templates.productIntro}"`;
      }
      if (brandSettings.templates.keyFeatures) {
        templateGuidance += `\nFeatures Format: "${brandSettings.templates.keyFeatures}"`;
      }
      if (brandSettings.templates.qualityAssurance) {
        templateGuidance += `\nQuality Messaging: "${brandSettings.templates.qualityAssurance}"`;
      }
      if (brandSettings.templates.callToAction) {
        templateGuidance += `\nCall to Action Style: "${brandSettings.templates.callToAction}"`;
      }
    }
    
    // Add trust elements
    let trustElements = '';
    if (brandSettings?.returnPolicy) {
      trustElements += `\nReturn Policy: ${brandSettings.returnPolicy}`;
    }
    if (brandSettings?.warranty) {
      trustElements += `\nWarranty: ${brandSettings.warranty}`;
    }
    if (brandSettings?.certifications?.length > 0) {
      trustElements += `\nCertifications: ${brandSettings.certifications.join(', ')}`;
    }

    const prompt = `
Generate a highly personalized, structured product description for an eBay listing with the following details:

PRODUCT INFORMATION:
Product: ${productData.productName}
Category: ${productData.category}
Price: $${productData.price}
${productData.description ? `Additional Info: ${productData.description}` : ''}

BRAND CONFIGURATION:
${brandContext}
${templateGuidance}
${trustElements}

INSTRUCTIONS:
Create a JSON response that follows the brand's voice and style. The content should be:
- Written in ${tone} tone with ${voice} voice
- Styled as ${style}
- Targeted at ${targetAudience} audience
${brandSettings?.templates?.productIntro ? `- Introduction should follow this style: "${brandSettings.templates.productIntro}"` : ''}
${brandSettings?.templates?.callToAction ? `- Include this type of call to action: "${brandSettings.templates.callToAction}"` : ''}

JSON Structure:
{
  "title": "SEO-optimized eBay title incorporating brand keywords (under 80 characters)",
  "sections": [
    {
      "id": "brand-intro",
      "type": "heading",
      "title": "${brandName ? brandName + ' ' : ''}Product Spotlight",
      "content": "Brand-aligned introduction paragraph that matches the configured style",
      "order": 1
    },
    {
      "id": "key-features",
      "type": "list",
      "title": "Key Features & Benefits",
      "content": ["Feature that appeals to ${targetAudience}", "Benefit aligned with brand values", "Quality aspect matching brand standards"],
      "order": 2
    },
    {
      "id": "quality-assurance",
      "type": "paragraph", 
      "title": "Quality You Can Trust",
      "content": "Paragraph about quality, materials, and craftsmanship matching brand tone",
      "order": 3
    },
    {
      "id": "usage-scenarios",
      "type": "paragraph",
      "title": "Perfect For Your Needs",
      "content": "Usage scenarios that resonate with ${targetAudience} audience",
      "order": 4
    },
    {
      "id": "brand-promise",
      "type": "highlight",
      "title": "Our Promise to You",
      "content": "Brand promise paragraph incorporating trust elements and call to action",
      "order": 5
    }
  ],
  "keywords": [${brandSettings?.keywords?.length > 0 ? `"${brandSettings.keywords.join('", "')}"` : '"relevant", "seo", "keywords"'}],
  "brandTone": "${tone}"
}

Make the content authentic to the brand, engaging for the target audience, and optimized for eBay search.
${brandSettings?.sellingPoints?.length > 0 ? `Emphasize these selling points: ${brandSettings.sellingPoints.join(', ')}` : ''}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a specialized eBay listing copywriter who creates brand-aligned, high-converting product descriptions. You understand different brand voices (${voice}), tones (${tone}), and styles (${style}). Always respond with valid JSON only.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    // Parse and validate the JSON response
    const parsedDescription = JSON.parse(content);
    
    // Ensure all required fields are present
    const structuredDescription: StructuredDescription = {
      title: parsedDescription.title || productData.productName,
      sections: parsedDescription.sections || [],
      keywords: parsedDescription.keywords || brandSettings?.keywords || [],
      brandTone: parsedDescription.brandTone || tone
    };

    return structuredDescription;
  } catch (error) {
    console.error("Error generating structured description:", error);
    
    // Fallback to simple structure with brand context
    const brandName = brandSettings?.brandName || '';
    const tone = brandSettings?.tone || 'professional';
    
    return {
      title: `${brandName ? brandName + ' ' : ''}${productData.productName}`,
      sections: [
        {
          id: "main-description",
          type: "paragraph",
          title: "Product Description",
          content: `${brandName ? `From ${brandName}: ` : ''}High-quality ${productData.productName} perfect for your needs. ${brandSettings?.templates?.qualityAssurance || 'Excellent condition and great value.'}`,
          order: 1
        }
      ],
      keywords: brandSettings?.keywords || [productData.category],
      brandTone: tone as any
    };
  }
}

// New improved function that uses real eBay API for category selection with guaranteed leaf categories
export async function generateEbayCategoryWithRealAPI(
  productData: {
    productName: string;
    categories: string[];
    features: string;
    brand: string;
    description: string;
  },
  accessToken: string,
  marketplaceId: string = 'EBAY_US'
): Promise<{ categoryId: string; categoryName: string; confidence: number }> {
  try {
    console.log(`🎯 Finding best leaf category for: "${productData.productName}"`);
    
    // Import eBay client instance
    const { ebayOAuth } = await import('./ebay');
    
    // Use our new comprehensive category detection system
    const { detectOptimalEbayCategory } = await import('./ebay');
    
    const result = await detectOptimalEbayCategory(accessToken, {
      title: productData.productName,
      description: productData.description,
      brand: productData.brand,
      features: productData.features ? [productData.features] : [],
      marketplaceId: marketplaceId
    });
    
    if (result.success && result.category) {
      console.log(`✅ Selected leaf category: ${result.category.categoryId} - ${result.category.categoryName} (confidence: ${result.category.confidence})`);
    
      return {
        categoryId: result.category.categoryId,
        categoryName: result.category.categoryName,
        confidence: result.category.confidence
      };
    }
    
    // Fallback to AI detection if API fails
    const fallbackResult = await ebayOAuth.getAILeafCategoryFallback(productData.productName);
    
    console.log(`🤖 Using AI fallback: ${fallbackResult.categoryId} - ${fallbackResult.categoryName} (confidence: ${fallbackResult.confidence})`);
    
    return fallbackResult;
    
  } catch (error) {
    console.error("eBay leaf category selection error:", error);
      // Ultimate fallback to a verified leaf category
    return {
        categoryId: '171957', // Desktop Computers - verified leaf category
        categoryName: 'Desktop Computers',
        confidence: 0.3
      };
    }
}



/**
 * Generate eBay LEAF category using direct AI prompt with complete product data
 */
export async function generateEbayLeafCategoryWithAI(productData: {
  productName: string;
  categories: string[];
  features: string;
  brand?: string;
  description?: string;
  condition?: string;
  color?: string;
  material?: string;
  size?: string;
  model?: string;
  type?: string;
  mpn?: string;
  upc?: string[];
  ean?: string[];
}): Promise<{ categoryId: string; categoryName: string; confidence: number }> {
  try {
    console.log(`🎯 Using direct AI to determine eBay leaf category for: "${productData.productName}"`);
    
    // Create comprehensive product description for AI
    const productInfo = [
      `Product Name: ${productData.productName}`,
      productData.brand ? `Brand: ${productData.brand}` : '',
      productData.model ? `Model: ${productData.model}` : '',
      productData.type ? `Type: ${productData.type}` : '',
      productData.condition ? `Condition: ${productData.condition}` : '',
      productData.color ? `Color: ${productData.color}` : '',
      productData.material ? `Material: ${productData.material}` : '',
      productData.size ? `Size: ${productData.size}` : '',
      productData.mpn ? `MPN: ${productData.mpn}` : '',
      productData.categories?.length ? `Categories: ${productData.categories.join(', ')}` : '',
      productData.features ? `Features: ${productData.features}` : '',
      productData.description ? `Description: ${productData.description}` : ''
    ].filter(item => item.trim() !== '').join('\n');

    const prompt = `You are an eBay category expert. Based on the following product information, you need to determine the EXACT eBay leaf category ID number.

PRODUCT INFORMATION:
${productInfo}

VERIFIED EBAY LEAF CATEGORY IDS (use ONLY these IDs):
- 9355: Cell Phones & Smartphones (phones, iphone, android, samsung, mobile)
- 177: Laptops & Netbooks (laptop, notebook, macbook, computer, thinkpad, desktop, pc)
- 171485: Tablets & eBook Readers (tablet, ipad, kindle, ebook, reader)
- 15052: Headphones (headphones, earphones, earbuds, airpods, beats, audio)
- 30090: Digital Cameras (camera, canon, nikon, sony, photography, digital)
- 80053: Computer Monitors (monitor, display, screen, lcd, led, gaming)
- 164: CPUs/Processors (processor, cpu, intel, amd, core, ryzen)
- 170083: Computer Memory (RAM) (memory, ram, ddr4, ddr5, corsair)
- 175669: Hard Drives (HDD, SSD & NAS) (hard drive, ssd, hdd, storage, nvme)
- 1244: Computer Motherboards (motherboard, mobo, mainboard, asus, msi)
- 27386: Graphics/Video Cards (graphics, gpu, video card, nvidia, amd, rtx)
- 93427: Men's Shoes (men, mens, shoe, sneaker, boot, loafer, nike, adidas)
- 3034: Women's Shoes (women, womens, shoe, heel, boot, sandal, pump)
- 1059: Men's Clothing (men, mens, shirt, pant, jacket, suit, clothing)
- 20081: Home Décor (decor, decoration, vase, candle, frame, home)
- 20673: Kitchen Tools & Gadgets (kitchen, cooking, utensil, gadget, tools)
- 15273: Fitness, Running & Yoga (fitness, exercise, yoga, running, gym, workout)
- 16034: Outdoor Sports (outdoor, camping, hiking, fishing, sports)
- 267: Books (book, novel, textbook, manual, reading)
- 11233: Music (music, cd, vinyl, album, record)
- 246: Action Figures (action figure, figurine, collectible, toy)
- 233: Board & Traditional Games (board game, game, puzzle, chess)
- 31786: Skin Care (skincare, cream, lotion, serum, beauty)
- 11855: Makeup (makeup, cosmetic, lipstick, foundation, beauty)
- 6028: Parts & Accessories (auto, car, part, accessory, vehicle, automotive)
- 281: Fashion Jewelry (jewelry, necklace, ring, bracelet, earring)
- 15032: Office Supplies (office, supplies, pen, paper, stapler)

INSTRUCTIONS:
1. Analyze the product information carefully
2. Match it to the MOST APPROPRIATE category from the list above
3. Consider the primary function and market of the product
4. For computers/desktops, use category 177 (Laptops & Netbooks) as it covers desktops too
5. Return ONLY the category ID number and name

RESPONSE FORMAT (return ONLY this JSON):
{
  "categoryId": "CATEGORY_ID_NUMBER",
  "categoryName": "EXACT_CATEGORY_NAME",
  "confidence": 0.95
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No category response from AI');
    }

    // Parse the JSON response
    let categoryData;
    try {
      categoryData = JSON.parse(content);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse AI category response, using fallback');
      // Fallback based on product type
      return getFallbackCategory(productData.productName);
    }

    if (!categoryData.categoryId || !categoryData.categoryName) {
      throw new Error('Invalid category response format');
    }

    console.log(`✅ AI generated leaf category: ${categoryData.categoryId} - ${categoryData.categoryName} (confidence: ${categoryData.confidence})`);
    
    return {
      categoryId: categoryData.categoryId,
      categoryName: categoryData.categoryName,
      confidence: categoryData.confidence || 0.9
    };
    
  } catch (error: any) {
    console.error("AI category generation error:", error);
    
    // Fallback to smart category detection
    return getFallbackCategory(productData.productName);
  }
}

/**
 * Smart fallback category detection
 */
function getFallbackCategory(productName: string): { categoryId: string; categoryName: string; confidence: number } {
  const productLower = productName.toLowerCase();
  
  // Smart keyword matching for common products
  if (productLower.includes('desktop') || productLower.includes('computer') || productLower.includes('pc') || productLower.includes('thinkcentre')) {
    return { categoryId: '177', categoryName: 'Laptops & Netbooks', confidence: 0.8 };
  }
  if (productLower.includes('laptop') || productLower.includes('notebook') || productLower.includes('macbook')) {
    return { categoryId: '177', categoryName: 'Laptops & Netbooks', confidence: 0.9 };
  }
  if (productLower.includes('phone') || productLower.includes('iphone') || productLower.includes('android') || productLower.includes('smartphone')) {
    return { categoryId: '9355', categoryName: 'Cell Phones & Smartphones', confidence: 0.9 };
  }
  if (productLower.includes('tablet') || productLower.includes('ipad')) {
    return { categoryId: '171485', categoryName: 'Tablets & eBook Readers', confidence: 0.9 };
  }
  if (productLower.includes('headphone') || productLower.includes('earphone') || productLower.includes('airpod')) {
    return { categoryId: '15052', categoryName: 'Headphones', confidence: 0.9 };
  }
  if (productLower.includes('camera') && productLower.includes('digital')) {
    return { categoryId: '30090', categoryName: 'Digital Cameras', confidence: 0.9 };
  }
  if (productLower.includes('monitor') || productLower.includes('display')) {
    return { categoryId: '80053', categoryName: 'Computer Monitors', confidence: 0.9 };
  }
  
  // Default fallback for general items
  return { categoryId: '267', categoryName: 'Books', confidence: 0.3 };
}

export async function generateEbayCategoryWithAI(productData: {
  productName: string;
  categories: string[];
  features: string;
  brand: string;
  description: string;
}): Promise<{ categoryId: string; categoryName: string; confidence: number }> {
  try {
    console.log(`🤖 Using AI for category selection: "${productData.productName}"`);
    
    // Import eBay client to use the comprehensive category detection
    const { detectOptimalEbayCategory } = await import('./ebay');
    
    // Create a dummy access token - for AI fallback we don't need real API calls
    const dummyAccessToken = 'dummy_token_for_ai_fallback';
    
    // Use the comprehensive category detection system
    const result = await detectOptimalEbayCategory(dummyAccessToken, {
      title: productData.productName,
      description: productData.description,
      brand: productData.brand,
      features: productData.features ? [productData.features] : [],
    });
    
    if (result.success && result.category) {
      console.log(`✅ AI category detection successful: ${result.category.categoryId} - ${result.category.categoryName} (confidence: ${result.category.confidence})`);
      
      return {
        categoryId: result.category.categoryId,
        categoryName: result.category.categoryName,
        confidence: result.category.confidence
      };
    }
    
    // If comprehensive detection fails, use simple AI fallback
    const { ebayOAuth } = await import('./ebay');
    const fallbackResult = await ebayOAuth.getAILeafCategoryFallback(productData.productName);
    
    console.log(`🤖 AI fallback category: ${fallbackResult.categoryId} - ${fallbackResult.categoryName} (confidence: ${fallbackResult.confidence})`);
    
    return fallbackResult;
  } catch (error) {
    console.error("eBay AI category selection error:", error);
    
    // Ultimate fallback to a verified leaf category
    return {
      categoryId: '171957', // Desktop Computers - verified leaf category
      categoryName: 'Desktop Computers',
      confidence: 0.3
    };
  }
}

export async function generateRelatedProducts(
  productData: any,
  userListings: any[] = []
): Promise<RelatedProduct[]> {
  try {
    // Filter listings from the same category or related categories
    const relatedListings = userListings.filter(listing => 
      listing.id !== productData.id &&
      (listing.category === productData.category || 
       listing.productName.toLowerCase().includes(productData.category?.toLowerCase()) ||
       Math.abs(parseFloat(listing.price) - parseFloat(productData.price)) < parseFloat(productData.price) * 0.5)
    );

    // If we have user listings, use them
    if (relatedListings.length >= 2) {
      return relatedListings
        .slice(0, 3)
        .map((listing, index) => ({
          id: listing.id,
          title: listing.productName || listing.generatedTitle,
          price: `$${listing.price}`,
          category: listing.category,
          relevanceScore: 1 - (index * 0.1)
        }));
    }

    // Otherwise, generate mock related products using AI
    const prompt = `
Generate 3 related products for cross-selling with this product:
Product: ${productData.productName}
Category: ${productData.category}
Price: $${productData.price}

Return JSON array with this structure:
[
  {
    "id": "related-1",
    "title": "Related product name (eBay style title)",
    "price": "$XX.XX",
    "category": "${productData.category}",
    "relevanceScore": 0.9
  }
]

Make products complementary or similar in category, with varied but reasonable prices.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at product recommendations for e-commerce cross-selling. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const relatedProducts = JSON.parse(content);
    return Array.isArray(relatedProducts) ? relatedProducts : [];

  } catch (error) {
    console.error("Error generating related products:", error);
    
    // Fallback related products
    return [
      {
        id: "related-1",
        title: `Premium ${productData.category} Accessory`,
        price: `$${Math.round(parseFloat(productData.price) * 0.6)}`,
        category: productData.category,
        relevanceScore: 0.8
      },
      {
        id: "related-2", 
        title: `Professional ${productData.category} Set`,
        price: `$${Math.round(parseFloat(productData.price) * 1.3)}`,
        category: productData.category,
        relevanceScore: 0.7
      }
    ];
  }
}

// Function to calculate SEO score for a listing
// Helper function to get smart defaults based on product type and aspect name
function getSmartDefault(aspectName: string, allowedValues: any[], productData: any): string {
  const aspectLower = aspectName.toLowerCase();
  const productName = productData.productName?.toLowerCase() || '';
  const description = productData.description?.toLowerCase() || '';
  const brand = productData.brand?.toLowerCase() || '';
  
  // Try to find the best match from allowed values
  for (const allowedValue of allowedValues) {
    const valueLower = allowedValue.localizedValue.toLowerCase();
    
    // Brand matching
    if (aspectLower.includes('brand') && (productName.includes(valueLower) || brand.includes(valueLower))) {
      return allowedValue.localizedValue;
    }
    
    // Color matching
    if (aspectLower.includes('color') && (productName.includes(valueLower) || description.includes(valueLower))) {
      return allowedValue.localizedValue;
    }
    
    // Storage matching
    if (aspectLower.includes('storage') && productName.includes(valueLower.replace(' ', ''))) {
      return allowedValue.localizedValue;
    }
    
    // Condition - prefer "New" if available
    if (aspectLower.includes('condition') && valueLower.includes('new')) {
      return allowedValue.localizedValue;
    }
    
    // Network - prefer "Unlocked" for phones
    if (aspectLower.includes('network') || aspectLower.includes('lock')) {
      if (valueLower.includes('unlocked') || valueLower.includes('gsm')) {
        return allowedValue.localizedValue;
      }
    }
    
    // Cellular Band - prefer common values
    if (aspectLower.includes('cellular') || aspectLower.includes('band')) {
      if (valueLower.includes('5g') || valueLower.includes('lte') || valueLower.includes('4g')) {
        return allowedValue.localizedValue;
      }
    }
  }
  
  // If no smart match found, return the first allowed value
  return allowedValues[0]?.localizedValue || 'Not Specified';
}

// Helper function to generate fallback defaults when no allowed values exist
function getFallbackDefault(aspectName: string, productData: any): string {
  const aspectLower = aspectName.toLowerCase();
  const productName = productData.productName?.toLowerCase() || '';
  const description = productData.description?.toLowerCase() || '';
  const combinedText = `${productName} ${description}`;

  if (aspectLower.includes('brand')) {
    return productData.brand || 'Generic';
  }

  if (aspectLower.includes('condition')) {
    return 'New';
  }

  if (aspectLower.includes('color')) {
    // Try to extract color from product name and description
    const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'gray', 'grey', 'silver', 'gold', 'brown', 'beige', 'tan'];
    for (const color of colors) {
      if (combinedText.includes(color)) {
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    return 'Black';
  }
  
  if (aspectLower.includes('storage')) {
    // Try to extract storage from product name
    if (productName.includes('128')) return '128 GB';
    if (productName.includes('256')) return '256 GB';
    if (productName.includes('512')) return '512 GB';
    if (productName.includes('64')) return '64 GB';
    return '128 GB';
  }
  
  if (aspectLower.includes('ram')) {
    if (productName.includes('16')) return '16 GB';
    if (productName.includes('8')) return '8 GB';
    if (productName.includes('4')) return '4 GB';
    return '8 GB';
  }
  
  if (aspectLower.includes('charging range')) {
    return '1-10';
  }
  
  if (aspectLower.includes('network') || aspectLower.includes('lock')) {
    return 'Unlocked';
  }
  
  if (aspectLower.includes('cellular') || aspectLower.includes('band')) {
    return '5G';
  }

  // Model handling - critical for many categories
  if (aspectLower.includes('model')) {
    // Try to extract model from product name
    const brand = productData.brand || '';

    // Remove brand from product name to get potential model
    let potentialModel = productName;
    if (brand && productName.includes(brand.toLowerCase())) {
      potentialModel = productName.replace(brand.toLowerCase(), '').trim();
    }

    // Extract the first few meaningful words as model
    const words = potentialModel.split(/\s+/).filter(w =>
      w.length > 1 &&
      !['the', 'and', 'for', 'with', 'size', 'color'].includes(w.toLowerCase())
    );

    if (words.length > 0) {
      // Take first 2-3 words as model, limit to 65 characters
      const modelName = words.slice(0, 3).join(' ');
      return modelName.length > 65 ? modelName.substring(0, 65) : modelName;
    }

    // If still no model found, use brand + generic identifier
    if (brand) {
      return `${brand} Standard`;
    }

    // Last resort - use a generic but valid model
    return 'Standard Model';
  }

  // For any other aspect, try to extract from product name or use a meaningful default
  if (aspectLower.includes('type')) {
    // Extract type from product name and description
    const types = ['sandals', 'shoes', 'boots', 'sneakers', 'slippers', 'loafers', 'heels', 'flats', 'oxfords', 'moccasins'];
    for (const type of types) {
      if (combinedText.includes(type)) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
  }

  if (aspectLower.includes('style')) {
    // Common style options
    const styles = ['casual', 'formal', 'athletic', 'classic', 'modern', 'vintage', 'sporty', 'elegant', 'minimalist'];
    for (const style of styles) {
      if (combinedText.includes(style)) {
        return style.charAt(0).toUpperCase() + style.slice(1);
      }
    }
    return 'Casual';
  }

  if (aspectLower.includes('material') || aspectLower.includes('shell')) {
    // Material options
    const materials = ['leather', 'suede', 'canvas', 'synthetic', 'rubber', 'textile', 'fabric', 'mesh', 'nylon', 'polyester', 'cotton'];
    for (const material of materials) {
      if (combinedText.includes(material)) {
        return material.charAt(0).toUpperCase() + material.slice(1);
      }
    }
    return 'Synthetic';
  }

  if (aspectLower.includes('department')) {
    // Try to determine department from product name and description
    if (combinedText.includes('men') || combinedText.includes('man')) return 'Men';
    if (combinedText.includes('women') || combinedText.includes('woman')) return 'Women';
    if (combinedText.includes('kid') || combinedText.includes('child')) return 'Kids';
    if (combinedText.includes('unisex')) return 'Unisex';
    return 'Men'; // Default
  }

  if (aspectLower.includes('size type')) {
    return 'Regular';
  }

  // If we still don't have a good default, use a generic but non-empty value
  // NEVER return "Not Specified" for required fields
  return 'Standard';
}

export async function generateProductAspects(
  productData: {
    productName: string;
    description: string;
    features: string;
    brand?: string;
    categories: string[];
  },
  requiredAspects: Array<{
    localizedAspectName: string;
    aspectConstraint: {
      aspectDataType: string;
      aspectRequired: boolean;
      aspectValues?: Array<{ value: string; localizedValue: string }>;
    };
  }>
): Promise<Record<string, string[]>> {
  try {
    console.log('🤖 Generating product aspects with AI for:', productData.productName);
    console.log('📋 Required aspects:', requiredAspects.map(a => a.localizedAspectName));

    const aspectsPrompt = `
You are an expert eBay listing specialist. Based on the product information provided, generate appropriate values for the required eBay product aspects.

Product Information:
- Name: ${productData.productName}
- Description: ${productData.description}
- Features: ${productData.features}
- Brand: ${productData.brand || 'Unknown'}
- Categories: ${productData.categories.join(', ')}

Required Aspects to Fill:
${requiredAspects.map(aspect => {
  const constraint = aspect.aspectConstraint;
  let aspectInfo = `- ${aspect.localizedAspectName} (${constraint.aspectDataType})`;
  
  if (constraint.aspectRequired) {
    aspectInfo += ' [REQUIRED]';
  }
  
  // Add cardinality information
  if (constraint.aspectDataType === 'STRING_ARRAY') {
    aspectInfo += ' [MULTIPLE VALUES ALLOWED]';
  } else {
    aspectInfo += ' [SINGLE VALUE ONLY]';
  }
  
  if (constraint.aspectValues && constraint.aspectValues.length > 0) {
    aspectInfo += `\n  Allowed values: ${constraint.aspectValues.slice(0, 10).map(v => v.localizedValue).join(', ')}${constraint.aspectValues.length > 10 ? '...' : ''}`;
  }
  
  return aspectInfo;
}).join('\n')}

CRITICAL RULES:
1. **SINGLE VALUE ONLY**: If aspect says [SINGLE VALUE ONLY], provide exactly ONE value in the array
2. **MULTIPLE VALUES ALLOWED**: If aspect says [MULTIPLE VALUES ALLOWED], you can provide multiple values
3. **Allowed values**: If "Allowed values" are listed, ONLY use those exact values
4. **Product-specific logic**:
   - Electronics: Focus on technical specs (storage, RAM, connectivity)
   - Clothing/Footwear: Focus on size, color, material, brand, style, department
   - Books: Focus on format, language, publication details
   - Automotive: Focus on make, model, year, compatibility
   - Home & Garden: Focus on dimensions, material, color, brand

5. **CRITICAL - Model field**:
   - Model is REQUIRED for most categories and CANNOT be empty
   - Extract model from product name (e.g., "Nike Air Max 270" → "Air Max 270")
   - For shoes: Extract style name (e.g., "Kino Leather Sandals" → "Leather Sandals")
   - For generic products: Use descriptive model like "Classic Leather", "Premium Edition"
   - NEVER use "Not Specified" or leave Model empty - always provide a meaningful value

6. **Smart defaults based on product type**:
   - Phones: Brand from name, Model from specs, storage from specs, "Unlocked" for network
   - Laptops: Brand, Model, RAM, storage, processor from specs
   - Footwear: Brand, Model (style name), Size, Color, Material, Type, Department
   - Clothing: Size "Medium", Color from description, Material "Cotton" if unknown
   - Books: Format "Paperback", Language "English", Condition "New"

7. **Value formatting**:
   - Storage: "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"
   - RAM: "4 GB", "8 GB", "16 GB", "32 GB"
   - Screen Size: "6.1 in", "13.3 in", "15.6 in"
   - Charging Range: "1-10", "5-15", "10-25"

8. **Extract from product name/description**:
   - Look for numbers + units (GB, TB, MP, in, etc.)
   - Look for colors (Black, White, Blue, Red, etc.)
   - Look for brands (Apple, Samsung, Nike, Kino, etc.)
   - Look for models (iPhone 12, Galaxy S21, Air Max, Leather Sandals, etc.)

9. **CRITICAL - Avoid generic values**:
   - NEVER use "Not Specified" for REQUIRED fields
   - Always provide meaningful, product-specific values
   - Use reasonable defaults that make sense for the product type

10. **CRITICAL LENGTH LIMIT**: Each aspect value must be 65 characters or less
   - "Intel Core i5 Processor" → "Intel Core i5"
   - "Intel Core i5 Processor, DVD-RW Drive, USB Ports" → "Intel Core i5"
   - Keep values concise and specific

IMPORTANT: Return ONLY a valid JSON object. No markdown, no explanations.

Example format:
{
  "Brand": ["Apple"],
  "Storage Capacity": ["128 GB"],
  "Color": ["Black"],
  "Cellular Band": ["5G"]
}

Your response must start with { and end with } - nothing else.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert eBay listing specialist. Generate accurate product aspects based on product information. Return ONLY a valid JSON object without any markdown formatting, code blocks, or additional text."
        },
        {
          role: "user",
          content: aspectsPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response (handle markdown formatting)
    let generatedAspects: Record<string, string[]>;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      generatedAspects = JSON.parse(cleanResponse);
      console.log('✅ Successfully parsed AI response');
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      console.error('Parse error:', parseError);
      // Fallback: create basic aspects
      generatedAspects = {};
      requiredAspects.forEach(aspect => {
        if (aspect.aspectConstraint.aspectRequired) {
          generatedAspects[aspect.localizedAspectName] = ["Not Specified"];
        }
      });
    }

        // Validate and clean up the generated aspects
    const validatedAspects: Record<string, string[]> = {};
    
    requiredAspects.forEach(aspect => {
      const aspectName = aspect.localizedAspectName;
      const constraint = aspect.aspectConstraint;
      
      if (generatedAspects[aspectName]) {
        let values = generatedAspects[aspectName];
        
        // Ensure values is an array
        if (!Array.isArray(values)) {
          values = [String(values)];
        }
        
        // CRITICAL: Limit each aspect value to 65 characters (eBay requirement)
        values = values.map(value => {
          const stringValue = String(value);
          if (stringValue.length > 65) {
            console.log(`⚠️ Aspect "${aspectName}" value too long (${stringValue.length} chars), truncating: "${stringValue}" → "${stringValue.substring(0, 65)}"`);
            return stringValue.substring(0, 65);
          }
          return stringValue;
        });
        
        // Handle cardinality constraints
        if (constraint.aspectDataType !== 'STRING_ARRAY' && values.length > 1) {
          // For single-value aspects, take only the first value
          values = [values[0]];
          console.log(`⚠️ Aspect "${aspectName}" only allows single value, using: ${values[0]}`);
        }
        
        // If there are allowed values, validate against them
        if (constraint.aspectValues && constraint.aspectValues.length > 0) {
          const allowedValues = constraint.aspectValues.map(v => v.localizedValue);
          const originalValues = [...values];
          
          values = values.filter(value => 
            allowedValues.some(allowed => 
              allowed.toLowerCase() === value.toLowerCase()
            )
          );
          
          // If no valid values found, try to find the best match or use default
          if (values.length === 0) {
            if (constraint.aspectRequired) {
              // Try to find a smart default based on product type and aspect name
              const smartDefault = getSmartDefault(aspectName, constraint.aspectValues, productData);
              values = [smartDefault];
              console.log(`🤖 Using smart default for "${aspectName}": ${smartDefault}`);
            }
          } else if (originalValues.length !== values.length) {
            console.log(`✅ Filtered "${aspectName}" values: ${originalValues.join(', ')} → ${values.join(', ')}`);
          }
        } else {
          // Special handling for specific aspect types without predefined values
          values = values.map(value => {
            if (aspectName.toLowerCase().includes('charging range') || aspectName.toLowerCase().includes('device charging range')) {
              // Ensure charging range is in correct format (min-max)
              if (!value.includes('-') || value === 'Not Specified') {
                return '1-10'; // Default charging range
              }
              return value;
            }
            
            // Handle other special cases
            if (aspectName.toLowerCase().includes('storage') && !value.includes('GB') && !value.includes('TB')) {
              return value.includes('128') ? '128 GB' : value.includes('256') ? '256 GB' : '64 GB';
            }
            
            if (aspectName.toLowerCase().includes('ram') && !value.includes('GB')) {
              return value.includes('8') ? '8 GB' : value.includes('16') ? '16 GB' : '4 GB';
            }
            
            return value;
          });
        }
        
        if (values.length > 0) {
          validatedAspects[aspectName] = values;
        }
      } else if (constraint.aspectRequired) {
        // For required aspects without generated values, provide a smart default
        if (constraint.aspectValues && constraint.aspectValues.length > 0) {
          const smartDefault = getSmartDefault(aspectName, constraint.aspectValues, productData);
          validatedAspects[aspectName] = [smartDefault];
        } else {
          // Generate a reasonable default based on aspect name and product type
          const fallbackDefault = getFallbackDefault(aspectName, productData);
          validatedAspects[aspectName] = [fallbackDefault];
        }
      }
    });

    // CRITICAL FINAL VALIDATION: Ensure no required field has empty or "Not Specified" values
    requiredAspects.forEach(aspect => {
      if (aspect.aspectConstraint.aspectRequired) {
        const aspectName = aspect.localizedAspectName;
        const values = validatedAspects[aspectName];

        // Check if value is missing, empty, or "Not Specified"
        if (!values || values.length === 0 ||
            values[0] === '' || values[0] === 'Not Specified' ||
            values[0] === null || values[0] === undefined) {

          console.warn(`⚠️ CRITICAL: Required aspect "${aspectName}" has invalid value, generating fallback`);

          // Generate a better fallback
          if (aspect.aspectConstraint.aspectValues && aspect.aspectConstraint.aspectValues.length > 0) {
            validatedAspects[aspectName] = [aspect.aspectConstraint.aspectValues[0].localizedValue];
            console.log(`✅ Using first allowed value: ${validatedAspects[aspectName][0]}`);
          } else {
            const fallback = getFallbackDefault(aspectName, productData);
            validatedAspects[aspectName] = [fallback];
            console.log(`✅ Using intelligent fallback: ${fallback}`);
          }
        }
      }
    });

    console.log('✅ Generated aspects:', validatedAspects);
    return validatedAspects;

  } catch (error) {
    console.error('❌ Error generating product aspects:', error);
    
    // Fallback: create basic required aspects
    const fallbackAspects: Record<string, string[]> = {};
    requiredAspects.forEach(aspect => {
      if (aspect.aspectConstraint.aspectRequired) {
        if (aspect.aspectConstraint.aspectValues && aspect.aspectConstraint.aspectValues.length > 0) {
          fallbackAspects[aspect.localizedAspectName] = [aspect.aspectConstraint.aspectValues[0].localizedValue];
        } else {
          fallbackAspects[aspect.localizedAspectName] = ["Not Specified"];
        }
      }
    });
    
    return fallbackAspects;
  }
}

export function calculateSEOScore(data: {
  title: string;
  description: string;
  price: string;
  category: string;
  features?: string;
  keywords?: string[];
}): {
  score: number;
  analysis: {
    titleScore: number;
    descriptionScore: number;
    keywordDensity: number;
    readabilityScore: number;
    suggestions: string[];
  };
} {
  const suggestions: string[] = [];
  let titleScore = 0;
  let descriptionScore = 0;
  let keywordDensity = 0;
  let readabilityScore = 0;

  // Title analysis (30% of total score)
  const title = data.title.toLowerCase();
  const titleWords = title.split(/\s+/).length;
  
  // Title length (optimal: 50-80 characters)
  if (data.title.length >= 50 && data.title.length <= 80) {
    titleScore += 25;
  } else if (data.title.length >= 40 && data.title.length < 50) {
    titleScore += 20;
    suggestions.push("Consider making your title slightly longer (50-80 characters is optimal)");
  } else if (data.title.length > 80) {
    titleScore += 15;
    suggestions.push("Your title is too long. Keep it under 80 characters for better visibility");
  } else {
    titleScore += 10;
    suggestions.push("Your title is too short. Aim for 50-80 characters");
  }

  // Title contains price or price-related keywords
  if (title.includes('$') || title.includes('price') || title.includes('deal') || title.includes('sale')) {
    titleScore += 5;
  } else {
    suggestions.push("Consider including price-related keywords in your title");
  }

  // Title contains brand or model
  if (data.features && (title.includes(data.features.toLowerCase().split(' ')[0]) || 
      title.includes('brand') || title.includes('model'))) {
    titleScore += 10;
  }

  // Title contains category keywords
  if (title.includes(data.category.toLowerCase())) {
    titleScore += 10;
  }

  // Description analysis (40% of total score)
  const description = data.description.toLowerCase();
  const descriptionWords = description.split(/\s+/).length;

  // Description length (optimal: 150-300 words)
  if (descriptionWords >= 150 && descriptionWords <= 300) {
    descriptionScore += 30;
  } else if (descriptionWords >= 100 && descriptionWords < 150) {
    descriptionScore += 25;
    suggestions.push("Consider expanding your description (150-300 words is optimal)");
  } else if (descriptionWords > 300) {
    descriptionScore += 20;
    suggestions.push("Your description might be too long. Keep it concise and focused");
  } else {
    descriptionScore += 15;
    suggestions.push("Your description is too short. Add more details about the product");
  }

  // Description contains key product information
  const hasFeatures = data.features && description.includes(data.features.toLowerCase());
  const hasCategory = description.includes(data.category.toLowerCase());
  const hasCondition = description.includes('new') || description.includes('used') || description.includes('condition');
  
  if (hasFeatures) descriptionScore += 5;
  if (hasCategory) descriptionScore += 5;
  if (hasCondition) descriptionScore += 5;
  else suggestions.push("Mention the item's condition in your description");

  // Keyword density analysis (15% of total score)
  const targetKeywords = [
    data.category.toLowerCase(),
    ...(data.features ? data.features.toLowerCase().split(/[,\s]+/) : []),
    ...(data.keywords || [])
  ].filter(k => k.length > 2);

  if (targetKeywords.length > 0) {
    const totalWords = titleWords + descriptionWords;
    const keywordCount = targetKeywords.reduce((count, keyword) => {
      const titleMatches = (title.match(new RegExp(keyword, 'g')) || []).length;
      const descMatches = (description.match(new RegExp(keyword, 'g')) || []).length;
      return count + titleMatches + descMatches;
    }, 0);

    keywordDensity = (keywordCount / totalWords) * 100;
    
    if (keywordDensity >= 2 && keywordDensity <= 5) {
      keywordDensity = 15;
    } else if (keywordDensity >= 1 && keywordDensity < 2) {
      keywordDensity = 12;
      suggestions.push("Consider using more relevant keywords in your title and description");
    } else if (keywordDensity > 5) {
      keywordDensity = 8;
      suggestions.push("Avoid keyword stuffing. Use keywords naturally");
    } else {
      keywordDensity = 5;
      suggestions.push("Include more relevant keywords in your listing");
    }
  }

  // Readability analysis (15% of total score)
  const sentences = data.description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? descriptionWords / sentences.length : 0;
  
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
    readabilityScore = 15;
  } else if (avgWordsPerSentence >= 8 && avgWordsPerSentence < 10) {
    readabilityScore = 12;
  } else if (avgWordsPerSentence > 20) {
    readabilityScore = 8;
    suggestions.push("Break up long sentences for better readability");
  } else {
    readabilityScore = 10;
    suggestions.push("Consider writing more detailed sentences");
  }

  // Calculate total score
  const totalScore = Math.min(100, Math.round(titleScore + descriptionScore + keywordDensity + readabilityScore));

  // Add overall suggestions based on score
  if (totalScore >= 90) {
    suggestions.unshift("Excellent! Your listing is well-optimized for search");
  } else if (totalScore >= 75) {
    suggestions.unshift("Good optimization! A few tweaks could make it even better");
  } else if (totalScore >= 60) {
    suggestions.unshift("Your listing needs some optimization improvements");
  } else {
    suggestions.unshift("Your listing needs significant optimization to improve visibility");
  }

  return {
    score: totalScore,
    analysis: {
      titleScore: Math.round((titleScore / 50) * 100), // Convert to percentage
      descriptionScore: Math.round((descriptionScore / 40) * 100),
      keywordDensity: Math.round(keywordDensity),
      readabilityScore: Math.round((readabilityScore / 15) * 100),
      suggestions: suggestions.slice(0, 5) // Limit to top 5 suggestions
    }
  };
}
