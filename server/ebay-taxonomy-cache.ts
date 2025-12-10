/**
 * eBay Taxonomy Cache Service
 *
 * Downloads and caches the complete eBay category taxonomy for each marketplace.
 * Updates automatically every 7 days to stay current with eBay's category changes.
 *
 * For personal/family use - uses simple JSON file cache.
 */

import fs from 'fs/promises';
import path from 'path';
import { ebayOAuth, getMarketplaceConfig } from './ebay';

const CACHE_DIR = path.join(process.cwd(), 'server', 'cache');
const CACHE_DURATION_DAYS = 7; // Refresh every 7 days

export interface EbayCategory {
  categoryId: string;
  categoryName: string;
  isLeaf: boolean;
  parentId?: string;
  level: number;
  fullPath: string;
  hasAspects?: boolean;
}

export interface TaxonomyCache {
  marketplaceId: string;
  lastUpdated: string;
  totalCategories: number;
  leafCategories: number;
  categories: EbayCategory[];
}

class EbayTaxonomyService {
  private cache: Map<string, TaxonomyCache> = new Map();
  private cacheLoaded: Map<string, boolean> = new Map();

  /**
   * Get all leaf categories for a marketplace
   * Automatically downloads and caches if not available
   */
  async getLeafCategories(
    accessToken: string,
    marketplaceId: string = 'EBAY_US'
  ): Promise<EbayCategory[]> {
    await this.ensureCacheLoaded(accessToken, marketplaceId);

    const cache = this.cache.get(marketplaceId);
    if (!cache) {
      throw new Error(`No taxonomy cache available for ${marketplaceId}`);
    }

    return cache.categories.filter(cat => cat.isLeaf);
  }

  /**
   * Get ALL categories (including parent categories) for a marketplace
   */
  async getAllCategories(
    accessToken: string,
    marketplaceId: string = 'EBAY_US'
  ): Promise<EbayCategory[]> {
    await this.ensureCacheLoaded(accessToken, marketplaceId);

    const cache = this.cache.get(marketplaceId);
    if (!cache) {
      throw new Error(`No taxonomy cache available for ${marketplaceId}`);
    }

    return cache.categories;
  }

  /**
   * Find category by ID
   */
  async findCategoryById(
    accessToken: string,
    categoryId: string,
    marketplaceId: string = 'EBAY_US'
  ): Promise<EbayCategory | null> {
    await this.ensureCacheLoaded(accessToken, marketplaceId);

    const cache = this.cache.get(marketplaceId);
    if (!cache) return null;

    return cache.categories.find(cat => cat.categoryId === categoryId) || null;
  }

  /**
   * Search categories by name
   */
  async searchCategories(
    accessToken: string,
    query: string,
    marketplaceId: string = 'EBAY_US',
    leafOnly: boolean = true
  ): Promise<EbayCategory[]> {
    await this.ensureCacheLoaded(accessToken, marketplaceId);

    const cache = this.cache.get(marketplaceId);
    if (!cache) return [];

    const queryLower = query.toLowerCase();
    let results = cache.categories.filter(cat =>
      cat.categoryName.toLowerCase().includes(queryLower) ||
      cat.fullPath.toLowerCase().includes(queryLower)
    );

    if (leafOnly) {
      results = results.filter(cat => cat.isLeaf);
    }

    return results;
  }

  /**
   * Ensure cache is loaded and up-to-date
   */
  private async ensureCacheLoaded(
    accessToken: string,
    marketplaceId: string
  ): Promise<void> {
    // Check if token is valid (not dummy token)
    const hasValidToken = accessToken && accessToken !== 'dummy_token' && !accessToken.includes('dummy');

    // Check if already loaded in memory
    if (this.cacheLoaded.get(marketplaceId)) {
      const cache = this.cache.get(marketplaceId);
      if (cache && this.isCacheValid(cache)) {
        return; // Cache is valid, no need to reload
      }
    }

    // Try to load from file
    const fileCache = await this.loadCacheFromFile(marketplaceId);

    if (fileCache && this.isCacheValid(fileCache)) {
      console.log(`✅ Loaded valid taxonomy cache from file for ${marketplaceId}`);
      this.cache.set(marketplaceId, fileCache);
      this.cacheLoaded.set(marketplaceId, true);
      return;
    }

    // If cache exists but is expired, and we don't have a valid token, use it anyway
    if (fileCache && !hasValidToken) {
      console.log(`⚠️ Using expired cache for ${marketplaceId} (no valid eBay token available)`);
      this.cache.set(marketplaceId, fileCache);
      this.cacheLoaded.set(marketplaceId, true);
      return;
    }

    // Only download if we have a valid token
    if (!hasValidToken) {
      console.log(`❌ Cannot download taxonomy for ${marketplaceId} - no valid eBay token`);
      throw new Error('Valid eBay access token required to download taxonomy');
    }

    // Cache is missing or expired - download fresh taxonomy
    console.log(`🔄 Downloading fresh taxonomy for ${marketplaceId}...`);
    await this.downloadAndCacheTaxonomy(accessToken, marketplaceId);
  }

  /**
   * Check if cache is still valid (not expired)
   */
  private isCacheValid(cache: TaxonomyCache): boolean {
    const lastUpdated = new Date(cache.lastUpdated);
    const expiryDate = new Date(lastUpdated);
    expiryDate.setDate(expiryDate.getDate() + CACHE_DURATION_DAYS);

    const isValid = new Date() < expiryDate;

    if (!isValid) {
      console.log(`⚠️ Cache expired for ${cache.marketplaceId} (last updated: ${cache.lastUpdated})`);
    }

    return isValid;
  }

  /**
   * Download complete taxonomy from eBay and cache it
   */
  private async downloadAndCacheTaxonomy(
    accessToken: string,
    marketplaceId: string
  ): Promise<void> {
    try {
      const config = getMarketplaceConfig(marketplaceId);
      console.log(`📥 Downloading taxonomy for ${marketplaceId} (site ${config.site})...`);

      // Get the root category tree
      const rootTree = await ebayOAuth.getCategoryDetails(
        accessToken,
        '0', // Root category
        marketplaceId
      );

      const categories: EbayCategory[] = [];

      // Recursively traverse and collect all categories
      await this.traverseCategoryTree(
        accessToken,
        rootTree.categorySubtree,
        marketplaceId,
        categories,
        '',
        0
      );

      const leafCategories = categories.filter(cat => cat.isLeaf);

      const cache: TaxonomyCache = {
        marketplaceId,
        lastUpdated: new Date().toISOString(),
        totalCategories: categories.length,
        leafCategories: leafCategories.length,
        categories
      };

      // Save to memory
      this.cache.set(marketplaceId, cache);
      this.cacheLoaded.set(marketplaceId, true);

      // Save to file
      await this.saveCacheToFile(cache);

      console.log(`✅ Taxonomy cached successfully for ${marketplaceId}:`, {
        total: categories.length,
        leafCategories: leafCategories.length
      });

    } catch (error) {
      console.error(`❌ Failed to download taxonomy for ${marketplaceId}:`, error);
      throw error;
    }
  }

  /**
   * Recursively traverse category tree and collect all categories
   */
  private async traverseCategoryTree(
    accessToken: string,
    node: any,
    marketplaceId: string,
    categories: EbayCategory[],
    parentPath: string,
    level: number
  ): Promise<void> {
    if (!node || !node.category) return;

    const category = node.category;
    const categoryId = category.categoryId;
    const categoryName = category.categoryName;
    const fullPath = parentPath ? `${parentPath} > ${categoryName}` : categoryName;

    const hasChildren = node.childCategoryTreeNodes && node.childCategoryTreeNodes.length > 0;

    categories.push({
      categoryId,
      categoryName,
      isLeaf: !hasChildren,
      parentId: node.parentCategoryId,
      level,
      fullPath
    });

    // Traverse children
    if (hasChildren) {
      for (const child of node.childCategoryTreeNodes) {
        await this.traverseCategoryTree(
          accessToken,
          child,
          marketplaceId,
          categories,
          fullPath,
          level + 1
        );
      }
    }
  }

  /**
   * Load cache from JSON file
   */
  private async loadCacheFromFile(marketplaceId: string): Promise<TaxonomyCache | null> {
    try {
      const filePath = path.join(CACHE_DIR, `taxonomy-${marketplaceId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or can't be read
      return null;
    }
  }

  /**
   * Save cache to JSON file
   */
  private async saveCacheToFile(cache: TaxonomyCache): Promise<void> {
    try {
      // Ensure cache directory exists
      await fs.mkdir(CACHE_DIR, { recursive: true });

      const filePath = path.join(CACHE_DIR, `taxonomy-${cache.marketplaceId}.json`);
      await fs.writeFile(filePath, JSON.stringify(cache, null, 2), 'utf-8');

      console.log(`💾 Taxonomy cache saved to file: ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to save taxonomy cache to file:', error);
    }
  }

  /**
   * Force refresh taxonomy cache
   */
  async refreshCache(accessToken: string, marketplaceId: string): Promise<void> {
    console.log(`🔄 Force refreshing taxonomy cache for ${marketplaceId}...`);
    this.cacheLoaded.set(marketplaceId, false);
    await this.downloadAndCacheTaxonomy(accessToken, marketplaceId);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(
    accessToken: string,
    marketplaceId: string
  ): Promise<{
    lastUpdated: string;
    totalCategories: number;
    leafCategories: number;
    isValid: boolean;
    expiresIn: string;
  } | null> {
    try {
      await this.ensureCacheLoaded(accessToken, marketplaceId);
      const cache = this.cache.get(marketplaceId);

      if (!cache) return null;

      const lastUpdated = new Date(cache.lastUpdated);
      const expiryDate = new Date(lastUpdated);
      expiryDate.setDate(expiryDate.getDate() + CACHE_DURATION_DAYS);
      const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      return {
        lastUpdated: cache.lastUpdated,
        totalCategories: cache.totalCategories,
        leafCategories: cache.leafCategories,
        isValid: this.isCacheValid(cache),
        expiresIn: `${daysLeft} days`
      };
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const taxonomyService = new EbayTaxonomyService();
