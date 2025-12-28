/**
 * Simple Generator HTML Template
 * 
 * Este archivo contiene el template HTML para las listings de eBay.
 * Cada sección (tab) está separada para facilitar la edición.
 * 
 * Para editar el contenido de cualquier tab, simplemente modifica el texto correspondiente.
 */

// ============================================
// CONFIGURACIÓN DE LA TIENDA
// ============================================
export const STORE_CONFIG = {
  name: "Smart Save Depot",
  bannerUrl: "https://res.cloudinary.com/cmacha2/image/upload/v1686886884/Technologi_Ebay_Billboard_5_hhhcdk.png",
  logoUrl: "https://i.ebayimg.com/images/g/SD8AAOSwG-tkiRJp/s-l140.webp",
  year: "2023"
};

// ============================================
// CONTENIDO DE LAS TABS (FÁCIL DE EDITAR)
// ============================================

export const TAB_CONTENT = {
  // Tab 2: Shipping Policy
  shipping: `At Smart Save Depot, we pledge to offer you an unrivaled order processing experience marked by efficiency and security. Our commitment is such that upon receipt of your payment confirmation, your order is prioritized and prepared for dispatch within a single business day (Monday - Friday). This ensures that your purchases transition swiftly from our storage to your doorstep.

We have chosen to collaborate exclusively with USPS, a renowned delivery service recognized for its steadfast reliability. This partnership is key to our confidence in guaranteeing you a seamless delivery experience. When you shop with us, rest assured that your orders are not just processed swiftly, but are also handled and shipped with utmost care and precision. This is part of our commitment to continually enhance your shopping experience at Smart Save Depot, because for us, your satisfaction remains paramount.`,

  // Tab 3: Return Policy
  returns: `At Smart Save Depot, Your absolute satisfaction is the core of our mission. As part of our dedication to providing an unparalleled shopping experience, we offer a hassle-free returns policy to ensure your peace of mind with every purchase. For all items that qualify, we provide you with the opportunity to return them within 30 days from the date of delivery. We kindly ask that all qualifying items be returned in their original, unused condition and securely packaged in their original box.

Please note that some items may not be eligible for returns, and eligibility will vary depending on the product category and condition. Items that do not qualify for return will be clearly indicated at the time of purchase.

This policy reflects our unwavering commitment to your satisfaction and confidence in our products. At Smart Save Depot, we believe in the quality of what we offer and want you to feel the same. We strive to create a shopping experience that's as seamless and satisfying as possible — from selection, to purchase, and beyond.`,

  // Tab 4: Feedback
  feedback: `⭐ Your Feedback Matters to Us

At Smart Save Depot, your satisfaction is our top priority. We work hard to provide quality products, fast shipping, and exceptional customer service. If our service met your expectations, we kindly invite you to leave positive feedback — it truly helps our small business grow.

If for any reason your experience is less than perfect, please contact us before leaving negative feedback. We're committed to resolving any issue quickly and making sure you're fully satisfied with your purchase.

Thank you for choosing Smart Save Depot — we appreciate your trust and the opportunity to serve you!`,

  // Tab 5: Contact Us
  contact: `📩 Contact Us

At Smart Save Depot, we are always here to help. For any questions, concerns, or assistance regarding your order, please contact us exclusively through eBay's messaging system.
This ensures fast, secure, and reliable communication for both parties.

We respond promptly and are committed to providing you with the best possible support.
Thank you for choosing Smart Save Depot!`,

  // Tab 6: About Us
  about: `Welcome to Smart Save Depot, your trusted source for quality products at unbeatable value. We are a small, dedicated business committed to offering great deals, reliable service, and a smooth shopping experience from start to finish.

Every item we offer is carefully selected to meet our standards of quality, functionality, and affordability. Whether you're shopping for everyday essentials or specialty items, our mission is to help you save smart without sacrificing quality.

At Smart Save Depot, we stand behind every product we sell and treat every customer with honesty, respect, and care. Your satisfaction drives everything we do, and we work tirelessly to ensure that your experience with us exceeds expectations.

Thank you for choosing Smart Save Depot — where value and service come together.`
};

// ============================================
// ESTILOS CSS
// ============================================
const CSS_STYLES = `<style>
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
    }

    .banner {
        width: 100%;
        display: block;
    }

    .widget-tab-radio {
        display: none;
    }

    .navbar ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #333;
        display: flex;
        justify-content: space-around;
    }

    .navbar li {
        flex-grow: 1;
    }

    .navbar li label {
        display: block;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
        cursor: pointer;
        background-color: #666;
    }

    .tab-content > div {
        display: none;
        padding: 20px;
        background-color: #f1f1f1;
    }

    .tab-content > div > p {
        font-size: 1.2em;
        line-height: 1.5;
        margin-bottom: 20px;
    }

    #widget-tab-19-radio-1:checked ~ .navbar li:nth-child(1) label,
    #widget-tab-19-radio-2:checked ~ .navbar li:nth-child(2) label,
    #widget-tab-19-radio-3:checked ~ .navbar li:nth-child(3) label,
    #widget-tab-19-radio-4:checked ~ .navbar li:nth-child(4) label,
    #widget-tab-19-radio-5:checked ~ .navbar li:nth-child(5) label,
    #widget-tab-19-radio-6:checked ~ .navbar li:nth-child(6) label {
        background-color: #f90;
    }

    #widget-tab-19-radio-1:checked ~ .tab-content > div:nth-child(1),
    #widget-tab-19-radio-2:checked ~ .tab-content > div:nth-child(2),
    #widget-tab-19-radio-3:checked ~ .tab-content > div:nth-child(3),
    #widget-tab-19-radio-4:checked ~ .tab-content > div:nth-child(4),
    #widget-tab-19-radio-5:checked ~ .tab-content > div:nth-child(5),
    #widget-tab-19-radio-6:checked ~ .tab-content > div:nth-child(6) {
        display: block;
    }

    .footer {
        background-color: #f8f9fa;
        text-align: center;
        padding: 10px;
        left: 0;
        bottom: 0;
        width: 100%;
    }

    .logo {
        height: 50px;
        width: 50px;
        border-radius: 50%;
    }
</style>`;

// ============================================
// FUNCIÓN PARA FORMATEAR LA DESCRIPCIÓN
// ============================================
function formatDescription(description: string): string {
  return description.split('\n\n').map((para: string) => {
    // Check if paragraph contains Key Features section with HTML list items
    if (para.includes('Key Features:')) {
      const parts = para.split('Key Features:');
      const before = parts[0]?.trim() || '';
      const featuresSection = parts[1]?.trim() || '';
      
      let result = '';
      if (before) {
        result += '<p>' + before + '</p>\n\n';
      }
      
      result += '<p><strong>Key Features:</strong></p>\n';
      
      if (featuresSection.includes('<li>')) {
        result += '<ul>\n' + featuresSection + '\n</ul>';
      } else {
        result += '<ul>\n';
        featuresSection.split('\n').filter((line: string) => line.trim()).forEach((feature: string) => {
          result += '    ' + feature.trim() + '\n';
        });
        result += '</ul>';
      }
      
      return result;
    }
    
    if (para.includes('<li>')) {
      if (!para.includes('<ul>')) {
        return '<ul>\n' + para + '\n</ul>';
      }
      return para;
    }
    
    if (!para.startsWith('<p>')) {
      return '<p>' + para + '</p>';
    }
    return para;
  }).join('\n\n');
}

// ============================================
// FUNCIÓN PRINCIPAL: GENERAR HTML TEMPLATE
// ============================================
export function generateListingHTML(title: string, description: string): string {
  const formattedDescription = formatDescription(description);
  
  return `${CSS_STYLES}

<img class="banner" src="${STORE_CONFIG.bannerUrl}" alt="Banner">

<div id="widget-tab-19">
    <input class="widget-tab-radio" type="radio" name="widget-tab-19-radio" id="widget-tab-19-radio-1" checked="">
    <input class="widget-tab-radio" type="radio" name="widget-tab-19-radio" id="widget-tab-19-radio-2">
    <input class="widget-tab-radio" type="radio" name="widget-tab-19-radio" id="widget-tab-19-radio-3">
    <input class="widget-tab-radio" type="radio" name="widget-tab-19-radio" id="widget-tab-19-radio-4">
    <input class="widget-tab-radio" type="radio" name="widget-tab-19-radio" id="widget-tab-19-radio-5">
    <input class="widget-tab-radio" type="radio" name="widget-tab-19-radio" id="widget-tab-19-radio-6">

    <div class="navbar">
        <ul>
            <li><label for="widget-tab-19-radio-1">Product Description</label></li>
            <li><label for="widget-tab-19-radio-2">Shipping</label></li>
            <li><label for="widget-tab-19-radio-3">Returns</label></li>
            <li><label for="widget-tab-19-radio-4">Feedback</label></li>
            <li><label for="widget-tab-19-radio-5">Contact Us</label></li>
            <li><label for="widget-tab-19-radio-6">About Us</label></li>
        </ul>
    </div>

    <div class="tab-content">
        <div>
            <h2>Product Description</h2>
            <h3>${title}</h3>
${formattedDescription}
        </div>

        <div>
            <h2>Shipping Policy</h2>
            <p>${TAB_CONTENT.shipping}</p>
        </div>

        <div>
            <h2>Return Policy</h2>
            <p>${TAB_CONTENT.returns}</p>
        </div>

        <div>
            <h2>Feedback</h2>
            <p>${TAB_CONTENT.feedback}</p>
        </div>

        <div>
            <h2>Contact Us</h2>
            <p>${TAB_CONTENT.contact}</p>
        </div>

        <div>
            <h2>About Us</h2>
            <p>${TAB_CONTENT.about}</p>
        </div>
    </div>
</div>

<div class="footer">
    <img src="${STORE_CONFIG.logoUrl}" class="logo" alt="Store Logo">
    <p>© ${STORE_CONFIG.year} ${STORE_CONFIG.name}. All rights reserved.</p>
</div>`;
}

