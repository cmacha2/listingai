import 'dotenv/config';
import axios from 'axios';

// Simple eBay configuration test without database dependencies
async function testEbayIntegration() {
  console.log('🧪 Testing eBay Integration Setup...\n');

  // 1. Test configuration
  console.log('📋 1. Configuration Check:');
  console.log('   Client ID:', process.env.EBAY_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('   Client Secret:', process.env.EBAY_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('   Redirect URI:', process.env.REDIRECT_URI || '❌ Not set');
  console.log('   Environment:', process.env.EBAY_ENVIRONMENT || 'sandbox');

  const hasConfig = !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET && process.env.REDIRECT_URI);
  console.log('   Overall Status:', hasConfig ? '✅ Configured' : '❌ Not Configured');

  if (!hasConfig) {
    console.log('\n❌ eBay is not properly configured. Please check your .env file.');
    return;
  }

  // 2. Test auth URL generation
  console.log('\n🔗 2. Auth URL Generation:');
  try {
    const scopes = [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.inventory'
    ];

    const params = new URLSearchParams({
      client_id: process.env.EBAY_CLIENT_ID!,
      response_type: 'code',
      redirect_uri: process.env.REDIRECT_URI!,
      scope: scopes.join(' '),
      state: `test_${Date.now()}`,
    });

    const authUrl = `https://auth.ebay.com/oauth2/authorize?${params.toString()}`;
    console.log('   Auth URL:', authUrl.substring(0, 100) + '...');
    console.log('   Status: ✅ Auth URL generated successfully');
  } catch (error) {
    console.log('   Status: ❌ Failed to generate auth URL:', error);
  }

  // 3. Test eBay API endpoints (without authentication)
  console.log('\n🌐 3. eBay API Connectivity:');
  try {
    // Test if we can reach eBay API (this should work without auth)
    const response = await axios.get('https://api.ebay.com', { timeout: 5000 });
    console.log('   eBay API Reachable: ✅ Yes');
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('   eBay API Reachable: ✅ Yes (404 expected for base URL)');
    } else {
      console.log('   eBay API Reachable: ❌ Network error:', error.message);
    }
  }

  console.log('\n🎯 Integration Test Complete!');
  console.log('\n📝 Next Steps for Client Integration:');
  console.log('   1. ✅ Update .env with correct REDIRECT_URI');
  console.log('   2. 🔧 Update eBay Developer Console:');
  console.log('      - Add OAuth redirect URL:', process.env.REDIRECT_URI);
  console.log('      - Switch from Auth\'n\'Auth to OAuth');
  console.log('   3. 🧪 Test with a real eBay seller account');
  console.log('   4. 🌐 Ensure ngrok tunnel is active for callback');
  
  console.log('\n📋 Current Configuration:');
  console.log('   Client ID:', process.env.EBAY_CLIENT_ID);
  console.log('   Redirect URI:', process.env.REDIRECT_URI);
  console.log('   Minimal Scopes:', 'inventory.readonly + inventory');
}

// Run the test
testEbayIntegration().catch(console.error);

export { testEbayIntegration }; 