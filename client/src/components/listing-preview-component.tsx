import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  RefreshCw, 
  Eye, 
  Code, 
  Edit3, 
  Copy, 
  CheckCircle, 
  Sparkles 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ListingPreviewProps {
  generatedContent: any;
  currentProductData: any;
  isRegenerating: boolean;
  editableContent: {
    title: string;
    price: string;
    description: string;
    features: string[];
  };
  setEditableContent: React.Dispatch<React.SetStateAction<{
    title: string;
    price: string;
    description: string;
    features: string[];
  }>>;
  generateListingPreviewHTML: () => string;
  handleRegenerate: () => void;
  handlePreviewTabClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  descriptionSettings: any;
  relatedProducts: any[];
  footerSettings: any;
}

export default function ListingPreviewComponent({
  generatedContent,
  currentProductData,
  isRegenerating,
  editableContent,
  setEditableContent,
  generateListingPreviewHTML,
  handleRegenerate,
  handlePreviewTabClick,
  descriptionSettings,
  relatedProducts,
  footerSettings,
}: ListingPreviewProps) {
  const { toast } = useToast();

  if (!generatedContent || !currentProductData) {
    return (
      <Card className="card-shadow">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">Ready to Generate Your eBay Listing</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Fill out the product information above and upload images to see your AI-generated listing preview here.
          </p>
          <div className="text-sm text-gray-400 bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
            💡 <strong>Pro Tip:</strong> Upload multiple high-quality product images for more accurate AI analysis and better descriptions.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          AI Generated eBay Listing
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Live Preview
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Content
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center">
              <Code className="w-4 h-4 mr-2" />
              HTML Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Final eBay Listing Preview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generateListingPreviewHTML());
                    toast({
                      title: "Copied!",
                      description: "HTML content copied to clipboard",
                    });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy HTML
                </Button>
              </div>
              
              <div className="border rounded-lg bg-white overflow-hidden">
                <div 
                  className="prose prose-sm max-w-none w-full"
                  style={{ 
                    padding: '20px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'visible'
                  }}
                  dangerouslySetInnerHTML={{ __html: generateListingPreviewHTML() }}
                  onClick={handlePreviewTabClick}
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <span className="font-medium">Branding:</span>{' '}
                    <span className={descriptionSettings.enableBranding ? 'text-green-600' : 'text-gray-500'}>
                      {descriptionSettings.enableBranding ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Navigation:</span>{' '}
                    <span className={descriptionSettings.enablePolicyTabs ? 'text-green-600' : 'text-gray-500'}>
                      {descriptionSettings.enablePolicyTabs ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Related Products:</span>{' '}
                    <span className={descriptionSettings.showRelatedProducts ? 'text-green-600' : 'text-gray-500'}>
                      {descriptionSettings.showRelatedProducts 
                        ? `${Math.min(descriptionSettings.maxRelatedProducts, relatedProducts.length)}/${relatedProducts.length} shown` 
                        : 'Hidden'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Layout:</span>{' '}
                    <span className="text-blue-600 capitalize">{descriptionSettings.layout}</span>
                  </div>
                  <div>
                    <span className="font-medium">Footer:</span>{' '}
                    <span className={footerSettings.enabled ? 'text-green-600' : 'text-gray-500'}>
                      {footerSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    eBay Title ({editableContent.title.length}/80)
                  </label>
                  <Input
                    value={editableContent.title}
                    onChange={(e) => setEditableContent(prev => ({ ...prev, title: e.target.value }))}
                    maxLength={80}
                    placeholder="Enter product title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price
                  </label>
                  <Input
                    value={editableContent.price}
                    onChange={(e) => setEditableContent(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="$0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Key Features (one per line)
                  </label>
                  <Textarea
                    value={editableContent.features.join('\n')}
                    onChange={(e) => setEditableContent(prev => ({ 
                      ...prev, 
                      features: e.target.value.split('\n').filter(f => f.trim() !== '') 
                    }))}
                    rows={6}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                <Textarea
                  value={editableContent.description}
                  onChange={(e) => setEditableContent(prev => ({ ...prev, description: e.target.value }))}
                  rows={12}
                  placeholder="Enter product description..."
                  className="h-full min-h-[300px]"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="html" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Complete HTML Description - Ready for eBay
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generateListingPreviewHTML());
                    toast({
                      title: "Copied!",
                      description: "HTML content copied to clipboard",
                    });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy HTML
                </Button>
              </div>
              <textarea
                className="w-full h-80 p-4 border rounded-md font-mono text-sm bg-gray-50"
                value={generateListingPreviewHTML()}
                readOnly
              />
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium">Ready to use:</span>
                </div>
                <p className="mt-1">This HTML is ready to paste directly into your eBay listing description field.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 