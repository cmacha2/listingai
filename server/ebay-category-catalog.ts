/**
 * eBay Complete Category Catalog Service
 *
 * Loads and provides access to the complete eBay category hierarchy
 * from the categories.md file containing thousands of categories.
 */

import fs from 'fs/promises';
import path from 'path';

export interface CategoryInfo {
  categoryId: string;
  categoryName: string;
  level: number; // Inferred from indentation or hierarchy
}

class EbayCategoryCatalogService {
  private categories: Map<string, CategoryInfo> = new Map();
  private categoriesByName: Map<string, CategoryInfo[]> = new Map();
  private isLoaded: boolean = false;

  /**
   * Load categories from the categories.md file
   */
  async loadCategories(): Promise<void> {
    if (this.isLoaded) {
      return; // Already loaded
    }

    try {
      const catalogPath = path.join(process.cwd(), 'categories.md');
      const content = await fs.readFile(catalogPath, 'utf-8');

      // Parse CSV-like format
      const lines = content.split('\n');
      let lineNumber = 0;

      for (const line of lines) {
        lineNumber++;

        // Skip empty lines and header
        if (!line.trim() || lineNumber <= 5) continue;

        // Try to parse format like: "   123→Category Name,12345"
        // or "Category Name,Category ID"
        const match = line.match(/^(?:\s*\d+→)?(.+),(\d+)$/);

        if (match) {
          const categoryName = match[1].trim();
          const categoryId = match[2].trim();

          // Infer level from indentation (rough estimate)
          const indentation = line.match(/^(\s*)/)?.[1].length || 0;
          const level = Math.floor(indentation / 2);

          const category: CategoryInfo = {
            categoryId,
            categoryName,
            level
          };

          // Store by ID
          this.categories.set(categoryId, category);

          // Store by name (for search)
          const nameLower = categoryName.toLowerCase();
          if (!this.categoriesByName.has(nameLower)) {
            this.categoriesByName.set(nameLower, []);
          }
          this.categoriesByName.get(nameLower)!.push(category);
        }
      }

      this.isLoaded = true;
      console.log(`✅ Loaded ${this.categories.size} eBay categories from catalog`);

    } catch (error) {
      console.error('❌ Failed to load category catalog:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<CategoryInfo[]> {
    await this.loadCategories();
    return Array.from(this.categories.values());
  }

  /**
   * Find category by ID
   */
  async findById(categoryId: string): Promise<CategoryInfo | null> {
    await this.loadCategories();
    return this.categories.get(categoryId) || null;
  }

  /**
   * Search categories by name (fuzzy search)
   */
  async searchByName(query: string): Promise<CategoryInfo[]> {
    await this.loadCategories();

    const queryLower = query.toLowerCase();
    const results: CategoryInfo[] = [];

    // Exact match first
    if (this.categoriesByName.has(queryLower)) {
      results.push(...this.categoriesByName.get(queryLower)!);
    }

    // Partial matches
    for (const [name, categories] of this.categoriesByName.entries()) {
      if (name.includes(queryLower) && !this.categoriesByName.has(queryLower)) {
        results.push(...categories);
      }
    }

    return results.slice(0, 50); // Limit to 50 results
  }

  /**
   * Get categories that might be relevant for a product
   * Based on keywords from product title/description
   */
  async findRelevantCategories(productText: string, limit: number = 100): Promise<CategoryInfo[]> {
    await this.loadCategories();

    const words = productText
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3); // Only words with 4+ chars

    const scoreMap = new Map<string, number>();

    // Score each category based on keyword matches
    for (const category of this.categories.values()) {
      const categoryText = category.categoryName.toLowerCase();
      let score = 0;

      for (const word of words) {
        if (categoryText.includes(word)) {
          score += 1;
        }
      }

      if (score > 0) {
        scoreMap.set(category.categoryId, score);
      }
    }

    // Sort by score and return top results
    const sortedCategories = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => this.categories.get(id)!);

    return sortedCategories;
  }

  /**
   * Format categories for AI prompt (compact format)
   */
  formatForAIPrompt(categories: CategoryInfo[], maxLength: number = 15000): string {
    let result = '';
    let currentLength = 0;

    for (const cat of categories) {
      const line = `${cat.categoryId}: ${cat.categoryName}\n`;
      if (currentLength + line.length > maxLength) {
        break;
      }
      result += line;
      currentLength += line.length;
    }

    return result;
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    totalCategories: number;
    loaded: boolean;
  }> {
    return {
      totalCategories: this.categories.size,
      loaded: this.isLoaded
    };
  }
}

// Export singleton
export const catalogService = new EbayCategoryCatalogService();
