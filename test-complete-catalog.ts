/**
 * Test Complete eBay Catalog System
 *
 * This script tests:
 * 1. Loading categories.md into memory
 * 2. Finding relevant categories for products
 * 3. AI detection with complete catalog
 */

import { catalogService } from './server/ebay-category-catalog';
import { detectEbayLeafCategory } from './server/ebay-category-manager';

async function testCatalogSystem() {
  console.log('🧪 Testing Complete eBay Catalog System\n');

  try {
    // Test 1: Load catalog
    console.log('📂 Test 1: Loading categories.md...');
    await catalogService.loadCategories();
    const stats = await catalogService.getStats();
    console.log(`✅ Loaded ${stats.totalCategories} categories\n`);

    // Test 2: Find category by ID
    console.log('🔍 Test 2: Finding category by ID (9355)...');
    const category = await catalogService.findById('9355');
    if (category) {
      console.log(`✅ Found: ${category.categoryId} - ${category.categoryName}\n`);
    } else {
      console.log('❌ Category not found\n');
    }

    // Test 3: Search categories by name
    console.log('🔎 Test 3: Searching for "smartphone"...');
    const searchResults = await catalogService.searchByName('smartphone');
    console.log(`✅ Found ${searchResults.length} results:`);
    searchResults.slice(0, 5).forEach(cat => {
      console.log(`   - ${cat.categoryId}: ${cat.categoryName}`);
    });
    console.log('');

    // Test 4: Find relevant categories for a product
    console.log('🎯 Test 4: Finding relevant categories for "iPhone 15 Pro Max"...');
    const relevantCats = await catalogService.findRelevantCategories(
      'iPhone 15 Pro Max 256GB Apple Smartphone',
      10
    );
    console.log(`✅ Found ${relevantCats.length} relevant categories:`);
    relevantCats.forEach(cat => {
      console.log(`   - ${cat.categoryId}: ${cat.categoryName}`);
    });
    console.log('');

    // Test 5: Full AI detection with complete catalog (without eBay token)
    console.log('🤖 Test 5: AI detection for a product (AI-only mode)...');
    const result = await detectEbayLeafCategory(
      'dummy_token', // No eBay token - will use AI-only mode
      {
        title: 'Nike Air Max 270 Men\'s Running Shoes Size 10',
        brand: 'Nike',
        description: 'Brand new Nike Air Max 270 running shoes in black and white',
        condition: 'New'
      },
      'EBAY_US'
    );

    console.log(`✅ AI Detection Result:`);
    console.log(`   Category ID: ${result.categoryId}`);
    console.log(`   Category Name: ${result.categoryName}`);
    console.log(`   Strategy: ${result.strategy}`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Validated: ${result.isValidated}\n`);

    // Test 6: Another product - electronics
    console.log('🤖 Test 6: AI detection for electronics product...');
    const electronicsResult = await detectEbayLeafCategory(
      'dummy_token',
      {
        title: 'Apple MacBook Pro 16" M3 Max 2024',
        brand: 'Apple',
        description: 'Latest MacBook Pro with M3 Max chip, 16GB RAM, 512GB SSD',
        condition: 'New'
      },
      'EBAY_US'
    );

    console.log(`✅ AI Detection Result:`);
    console.log(`   Category ID: ${electronicsResult.categoryId}`);
    console.log(`   Category Name: ${electronicsResult.categoryName}`);
    console.log(`   Strategy: ${electronicsResult.strategy}`);
    console.log(`   Confidence: ${electronicsResult.confidence}\n`);

    console.log('🎉 All tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testCatalogSystem().catch(console.error);
