/**
 * Test category detection for sandals
 */

import { catalogService } from './server/ebay-category-catalog';

async function testSandalsCategory() {
  console.log('🧪 Testing category detection for sandals\n');

  try {
    // Load catalog
    await catalogService.loadCategories();
    const stats = await catalogService.getStats();
    console.log(`✅ Loaded ${stats.totalCategories} categories\n`);

    // Test with the exact product from the user
    const productText = 'Kino Men\'s Brown Leather Sandals Size 10';
    console.log(`🎯 Product: ${productText}\n`);

    // Find relevant categories
    const relevantCats = await catalogService.findRelevantCategories(productText, 20);

    console.log(`📦 Found ${relevantCats.length} relevant categories:\n`);
    relevantCats.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.categoryId}: ${cat.categoryName}`);
    });

    // Check if sandals category is in the list
    const sandalsCategory = relevantCats.find(cat =>
      cat.categoryName.toLowerCase().includes('sandal')
    );

    if (sandalsCategory) {
      console.log(`\n✅ Sandals category found: ${sandalsCategory.categoryId} - ${sandalsCategory.categoryName}`);
    } else {
      console.log(`\n❌ Sandals category NOT in top 20 relevant categories!`);
    }

    // Check for category 57988
    const category57988 = relevantCats.find(cat => cat.categoryId === '57988');
    if (category57988) {
      console.log(`\n⚠️ WARNING: Category 57988 found: ${category57988.categoryName}`);
    }

    // Look up specific category IDs
    console.log('\n🔍 Looking up specific categories:');
    const cat11504 = await catalogService.findById('11504');
    const cat62107 = await catalogService.findById('62107');
    const cat57988 = await catalogService.findById('57988');

    if (cat11504) console.log(`  11504: ${cat11504.categoryName}`);
    if (cat62107) console.log(`  62107: ${cat62107.categoryName}`);
    if (cat57988) console.log(`  57988: ${cat57988.categoryName}`);

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSandalsCategory().catch(console.error);
