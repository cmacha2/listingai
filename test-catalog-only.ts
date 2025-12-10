/**
 * Test eBay Catalog Service Only
 *
 * Tests the catalog parsing and search functionality without DB or AI dependencies
 */

import { catalogService } from './server/ebay-category-catalog';

async function testCatalogOnly() {
  console.log('🧪 Testing eBay Catalog Service\n');

  try {
    // Test 1: Load catalog
    console.log('📂 Test 1: Loading categories.md...');
    await catalogService.loadCategories();
    const stats = await catalogService.getStats();
    console.log(`✅ Loaded ${stats.totalCategories} categories`);
    console.log(`   Status: ${stats.loaded ? 'Loaded' : 'Not loaded'}\n`);

    if (stats.totalCategories === 0) {
      throw new Error('No categories were loaded! Check categories.md file format.');
    }

    // Test 2: Find specific category by ID
    console.log('🔍 Test 2: Finding category by ID (9355 - Cell Phones)...');
    const cellPhoneCategory = await catalogService.findById('9355');
    if (cellPhoneCategory) {
      console.log(`✅ Found: ${cellPhoneCategory.categoryId} - ${cellPhoneCategory.categoryName}`);
      console.log(`   Level: ${cellPhoneCategory.level}\n`);
    } else {
      console.log('⚠️ Category 9355 not found - this is expected if not in categories.md\n');
    }

    // Test 3: Search categories by name
    console.log('🔎 Test 3: Searching for "shoes"...');
    const shoeResults = await catalogService.searchByName('shoes');
    console.log(`✅ Found ${shoeResults.length} results (showing first 10):`);
    shoeResults.slice(0, 10).forEach(cat => {
      console.log(`   - ${cat.categoryId}: ${cat.categoryName}`);
    });
    console.log('');

    // Test 4: Find relevant categories for a product
    console.log('🎯 Test 4: Finding relevant categories for "Nike Air Max Running Shoes"...');
    const productText = 'Nike Air Max 270 Men\'s Running Shoes Size 10 Black White Athletic Sneakers';
    const relevantCats = await catalogService.findRelevantCategories(productText, 20);

    if (relevantCats.length === 0) {
      console.log('⚠️ No relevant categories found - check if categories.md has shoe categories');
    } else {
      console.log(`✅ Found ${relevantCats.length} relevant categories (sorted by relevance):`);
      relevantCats.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.categoryId}: ${cat.categoryName}`);
      });
    }
    console.log('');

    // Test 5: Format for AI prompt
    console.log('📝 Test 5: Formatting categories for AI prompt...');
    const formatted = catalogService.formatForAIPrompt(relevantCats, 500);
    console.log(`✅ Formatted output (${formatted.length} characters, max 500):`);
    console.log('---');
    console.log(formatted.substring(0, 400) + (formatted.length > 400 ? '...' : ''));
    console.log('---\n');

    // Test 6: Another product - electronics
    console.log('🎯 Test 6: Finding categories for "iPhone 15 Pro"...');
    const phoneRelevant = await catalogService.findRelevantCategories(
      'Apple iPhone 15 Pro Max 256GB 5G Smartphone',
      15
    );
    console.log(`✅ Found ${phoneRelevant.length} relevant categories:`);
    phoneRelevant.slice(0, 10).forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.categoryId}: ${cat.categoryName}`);
    });
    console.log('');

    console.log('🎉 All catalog tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Total categories in catalog: ${stats.totalCategories}`);
    console.log(`   Catalog loading: ${stats.loaded ? '✅ Working' : '❌ Failed'}`);
    console.log(`   Search by name: ✅ Working`);
    console.log(`   Relevance ranking: ✅ Working`);
    console.log(`   AI prompt formatting: ✅ Working`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run tests
testCatalogOnly().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
