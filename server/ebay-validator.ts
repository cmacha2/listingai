interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface EbayListingData {
  sku: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  aspects: Record<string, string[]>;
  imageUrls: string[];
  fulfillmentPolicyId?: string;
  paymentPolicyId?: string;
  returnPolicyId?: string;
  merchantLocationKey?: string;
}

interface CategoryAspect {
  localizedAspectName: string;
  aspectConstraint: {
    aspectDataType: string;
    aspectRequired: boolean;
    aspectValues?: Array<{ value: string; localizedValue: string }>;
  };
}

export class EbayListingValidator {
  
  /**
   * Comprehensive validation of eBay listing data
   */
  static validateListing(
    listingData: EbayListingData, 
    categoryAspects: CategoryAspect[] = []
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic field validation
    this.validateBasicFields(listingData, result);
    
    // Policy validation
    this.validatePolicies(listingData, result);
    
    // Category aspects validation
    this.validateAspects(listingData.aspects, categoryAspects, result);
    
    // Title and description validation
    this.validateContent(listingData, result);
    
    // Image validation
    this.validateImages(listingData.imageUrls, result);
    
    // Price validation
    this.validatePrice(listingData.price, result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate basic required fields
   */
  private static validateBasicFields(data: EbayListingData, result: ValidationResult): void {
    if (!data.sku || data.sku.trim() === '') {
      result.errors.push('SKU is required');
    }

    if (!data.categoryId || data.categoryId.trim() === '') {
      result.errors.push('Category ID is required');
    }

    if (!data.title || data.title.trim() === '') {
      result.errors.push('Title is required');
    } else if (data.title.length > 80) {
      result.errors.push('Title cannot exceed 80 characters');
    } else if (data.title.length < 10) {
      result.warnings.push('Title is very short, consider adding more descriptive keywords');
    }

    if (!data.description || data.description.trim() === '') {
      result.errors.push('Description is required');
    }

    if (!data.condition || data.condition.trim() === '') {
      result.errors.push('Condition is required');
    }

    if (!data.quantity || data.quantity < 1) {
      result.errors.push('Quantity must be at least 1');
    }
  }

  /**
   * Validate eBay policies
   */
  private static validatePolicies(data: EbayListingData, result: ValidationResult): void {
    if (!data.fulfillmentPolicyId) {
      result.errors.push('Fulfillment policy is required');
    }

    if (!data.paymentPolicyId) {
      result.errors.push('Payment policy is required');
    }

    if (!data.returnPolicyId) {
      result.errors.push('Return policy is required');
    }

    if (!data.merchantLocationKey) {
      result.errors.push('Merchant location is required');
    }
  }

  /**
   * Validate product aspects against category requirements
   */
  private static validateAspects(
    aspects: Record<string, string[]>, 
    categoryAspects: CategoryAspect[], 
    result: ValidationResult
  ): void {
    if (categoryAspects.length === 0) {
      result.warnings.push('No category aspects provided for validation');
      return;
    }

    // Check required aspects
    const requiredAspects = categoryAspects.filter(a => a.aspectConstraint.aspectRequired);
    const missingRequired: string[] = [];

    requiredAspects.forEach(aspect => {
      const aspectName = aspect.localizedAspectName;
      const values = aspects[aspectName];

      if (!values || values.length === 0) {
        missingRequired.push(aspectName);
      } else {
        // Validate cardinality
        if (aspect.aspectConstraint.aspectDataType !== 'STRING_ARRAY' && values.length > 1) {
          result.errors.push(`"${aspectName}" only allows one value, but ${values.length} were provided`);
        }

        // Validate against allowed values
        if (aspect.aspectConstraint.aspectValues && aspect.aspectConstraint.aspectValues.length > 0) {
          const allowedValues = aspect.aspectConstraint.aspectValues.map(av => av.localizedValue);
          const invalidValues = values.filter(value => 
            !allowedValues.some(allowed => allowed.toLowerCase() === value.toLowerCase())
          );

          if (invalidValues.length > 0) {
            result.errors.push(`"${aspectName}" has invalid values: ${invalidValues.join(', ')}. Allowed: ${allowedValues.slice(0, 5).join(', ')}`);
          }
        }

        // Check for empty values
        const emptyValues = values.filter(v => !v || v.trim() === '');
        if (emptyValues.length > 0) {
          result.warnings.push(`"${aspectName}" has empty values that will be ignored`);
        }
      }
    });

    if (missingRequired.length > 0) {
      result.errors.push(`Missing required aspects: ${missingRequired.join(', ')}`);
    }

    // Check for unknown aspects
    const knownAspectNames = categoryAspects.map(a => a.localizedAspectName);
    const unknownAspects = Object.keys(aspects).filter(name => 
      !knownAspectNames.includes(name)
    );

    if (unknownAspects.length > 0) {
      result.warnings.push(`Unknown aspects (will be ignored): ${unknownAspects.join(', ')}`);
    }
  }

  /**
   * Validate title and description content
   */
  private static validateContent(data: EbayListingData, result: ValidationResult): void {
    // Title validation
    if (data.title) {
      // Check for prohibited words/characters
      const prohibitedInTitle = ['email', '@', 'www.', 'http', 'paypal', 'venmo'];
      const foundProhibited = prohibitedInTitle.filter(word => 
        data.title.toLowerCase().includes(word)
      );

      if (foundProhibited.length > 0) {
        result.errors.push(`Title contains prohibited content: ${foundProhibited.join(', ')}`);
      }

      // Check for excessive capitalization
      const upperCaseRatio = (data.title.match(/[A-Z]/g) || []).length / data.title.length;
      if (upperCaseRatio > 0.5) {
        result.warnings.push('Title has excessive capitalization');
      }
    }

    // Description validation
    if (data.description) {
      if (data.description.length < 50) {
        result.warnings.push('Description is very short, consider adding more details');
      }

      // Check for HTML tags (basic check)
      if (data.description.includes('<script') || data.description.includes('javascript:')) {
        result.errors.push('Description contains prohibited scripts');
      }
    }
  }

  /**
   * Validate images
   */
  private static validateImages(imageUrls: string[], result: ValidationResult): void {
    if (!imageUrls || imageUrls.length === 0) {
      result.warnings.push('No images provided - listings with images perform better');
      return;
    }

    if (imageUrls.length > 12) {
      result.warnings.push('More than 12 images provided - only first 12 will be used');
    }

    // Basic URL validation
    imageUrls.forEach((url, index) => {
      if (!url || url.trim() === '') {
        result.warnings.push(`Image ${index + 1} has empty URL`);
      } else if (!url.startsWith('http')) {
        result.errors.push(`Image ${index + 1} has invalid URL format`);
      }
    });
  }

  /**
   * Validate price
   */
  private static validatePrice(price: number, result: ValidationResult): void {
    if (!price || price <= 0) {
      result.errors.push('Price must be greater than 0');
    } else if (price < 0.99) {
      result.warnings.push('Very low price may trigger additional eBay reviews');
    } else if (price > 99999) {
      result.warnings.push('Very high price may require additional verification');
    }
  }

  /**
   * Generate suggestions for improving the listing
   */
  static generateSuggestions(data: EbayListingData): string[] {
    const suggestions: string[] = [];

    // Title suggestions
    if (data.title && data.title.length < 60) {
      suggestions.push('Consider using more of the 80-character title limit for better visibility');
    }

    // Image suggestions
    if (data.imageUrls && data.imageUrls.length < 3) {
      suggestions.push('Add more images - listings with 3+ images get more views');
    }

    // Description suggestions
    if (data.description && !data.description.includes('condition')) {
      suggestions.push('Consider mentioning item condition in description');
    }

    // Aspect suggestions
    const aspectCount = Object.keys(data.aspects || {}).length;
    if (aspectCount < 3) {
      suggestions.push('Add more product details (aspects) to improve search visibility');
    }

    return suggestions;
  }

  /**
   * Clean and fix common issues automatically
   */
  static autoFix(data: EbayListingData): EbayListingData {
    const fixed = { ...data };

    // Clean title
    if (fixed.title) {
      fixed.title = fixed.title.trim().substring(0, 80);
    }

    // Clean description
    if (fixed.description) {
      fixed.description = fixed.description.trim();
    }

    // Clean aspects
    if (fixed.aspects) {
      const cleanedAspects: Record<string, string[]> = {};
      
      Object.entries(fixed.aspects).forEach(([key, values]) => {
        const cleanedValues = values
          .filter(v => v && v.trim() !== '')
          .map(v => v.trim());
        
        if (cleanedValues.length > 0) {
          cleanedAspects[key] = cleanedValues;
        }
      });
      
      fixed.aspects = cleanedAspects;
    }

    // Clean image URLs
    if (fixed.imageUrls) {
      fixed.imageUrls = fixed.imageUrls
        .filter(url => url && url.trim() !== '')
        .map(url => url.trim())
        .slice(0, 12); // eBay limit
    }

    return fixed;
  }
}

export default EbayListingValidator; 