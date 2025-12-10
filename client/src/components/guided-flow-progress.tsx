import { Badge } from "@/components/ui/badge";

interface GuidedFlowProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  isAIAutofilled: boolean;
  isEbaySettingsComplete: boolean;
  isSEOContentGenerated: boolean;
  watchPublishToEbay: boolean;
}

export default function GuidedFlowProgress({
  currentStep,
  isAIAutofilled,
  isEbaySettingsComplete,
  isSEOContentGenerated,
  watchPublishToEbay,
}: GuidedFlowProgressProps) {
  if (!watchPublishToEbay) return null;

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Guided eBay Publishing Flow</h3>
      <div className="flex items-center justify-between mb-4">
        {/* Step 1: AI Autofill */}
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
          } ${isAIAutofilled ? 'bg-green-600' : ''}`}>
            {isAIAutofilled ? '✓' : '1'}
          </div>
          <span className="text-sm font-medium">🧠 AI Autofill</span>
        </div>
        
        <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        
        {/* Step 2: eBay Settings */}
        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
          } ${isEbaySettingsComplete ? 'bg-green-600' : ''}`}>
            {isEbaySettingsComplete ? '✓' : '2'}
          </div>
          <span className="text-sm font-medium">🧾 eBay Settings</span>
        </div>
        
        <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        
        {/* Step 3: Generate SEO */}
        <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
          } ${isSEOContentGenerated ? 'bg-green-600' : ''}`}>
            {isSEOContentGenerated ? '✓' : '3'}
          </div>
          <span className="text-sm font-medium">🧩 Generate SEO</span>
        </div>
        
        <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        
        {/* Step 4: Publish */}
        <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            4
          </div>
          <span className="text-sm font-medium">🚀 Publish</span>
        </div>
      </div>
      
      {/* Step descriptions */}
      <div className="text-sm text-gray-600">
        {currentStep === 1 && (
          <p>📤 Upload product images and click "AI Auto-Fill" to automatically populate product details</p>
        )}
        {currentStep === 2 && (
          <p>⚙️ Select your eBay business policies and inventory location</p>
        )}
        {currentStep === 3 && (
          <p>✨ Generate SEO-optimized title and HTML description for your listing</p>
        )}
        {currentStep === 4 && (
          <p>🎯 Review your generated content and publish directly to eBay!</p>
        )}
      </div>
    </div>
  );
} 