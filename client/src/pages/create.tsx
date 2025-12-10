import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import ProductForm from "@/components/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateEbayCompatibleHTML, generateProductDescriptionOnly } from "@/lib/html-generator";
import { 
  Wand2, 
  Eye, 
  Upload,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Edit3,
  Copy,
  Code
} from "lucide-react";

export default function CreateListing() {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [currentProductData, setCurrentProductData] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isAIAutofilled, setIsAIAutofilled] = useState(false);
  const [isContentGenerated, setIsContentGenerated] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // Editable content state
  const [editableContent, setEditableContent] = useState({
    title: '',
    description: '',
    price: '',
    features: [] as string[]
  });

  // Customization settings state
  const [customizationSettings, setCustomizationSettings] = useState({
    storeAssets: { logo: '', banner: '', logoPosition: 'left' as 'left' | 'center' | 'right', bannerHeight: 270 },
    storePolicies: { shipping: '', returns: '', warranty: '', contact: '', aboutUs: '' },
    descriptionSettings: { 
      layout: 'grid' as 'grid' | 'list' | 'compact', 
    showRelatedProducts: true,
    maxRelatedProducts: 3,
    enablePolicyTabs: true,
    enableBranding: true
    },
    footerSettings: {
    enabled: true,
    logo: '',
    copyrightText: '© 2023 Your Store Name. All rights reserved.',
    backgroundColor: '#f8fafc',
    textColor: '#374151'
    }
  });

  // Sample related products
  const [relatedProducts] = useState([
      {
        id: '1',
        title: 'Wireless Bluetooth Speaker',
        price: '$89.99',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 1
      },
      {
        id: '2', 
        title: 'USB-C Charging Cable',
        price: '$19.99',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 2
      },
      {
        id: '3',
        title: 'Phone Stand Holder',
        price: '$24.99',
        image: 'https://images.unsplash.com/photo-1544980919-e17526d4ed0a?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 3
    }
  ]);

  if (!isLoggedIn) {
    window.location.href = "/login";
    return <div>Redirecting...</div>;
  }

  // Load customization settings on mount
  useEffect(() => {
    loadCustomizationSettings();
  }, []);

  // Update editable content when generated content changes
  useEffect(() => {
    if (generatedContent && currentProductData) {
      setEditableContent({
        title: generatedContent.title || '',
        description: generatedContent.description || '',
        price: currentProductData.price || '',
        features: currentProductData.features ? currentProductData.features.split('\n').filter((f: string) => f.trim() !== '') : []
      });
    }
  }, [generatedContent, currentProductData]);

  const loadCustomizationSettings = async () => {
    try {
      const response = await fetch('/api/customization-settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomizationSettings(data);
      }
    } catch (error) {
      console.error('Error loading customization settings:', error);
    }
  };

  const handleGenerate = (data: any) => {
    setGeneratedContent(data);
    setIsContentGenerated(true);
    
    toast({
      title: "Content Generated!",
      description: "SEO-optimized title and description are ready for preview.",
    });
  };

  const handleDataChange = (data: any) => {
    setCurrentProductData(data);
  };

  const handlePublishSuccess = () => {
    setIsPublished(true);
    toast({
      title: "Published to eBay!",
      description: "Your listing has been successfully published to eBay.",
    });
  };

  const handleAIAutofillComplete = () => {
    setIsAIAutofilled(true);
  };

  const handleTabClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const tabElement = target.closest('[data-tab]');
    if (tabElement) {
      const tabKey = tabElement.getAttribute('data-tab');
      if (tabKey) {
        setActiveTab(tabKey);
      }
    }
  };

  const generateListingPreviewHTML = (): string => {
    if (!isContentGenerated || !editableContent.title) return "";
    
    const productData = {
      title: editableContent.title,
      price: editableContent.price,
      description: editableContent.description,
      features: editableContent.features
    };
    
      return generateEbayCompatibleHTML(customizationSettings, productData, relatedProducts, true);
    };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create eBay Listing</h1>
              <p className="text-gray-600 mt-1">Upload images, autofill with AI, generate content, and publish to eBay</p>
            </div>
          </div>

          {/* Workflow Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Listing Creation Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {/* Step 1: Upload & Autofill */}
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isAIAutofilled ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {isAIAutofilled ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">1. Upload & Autofill</p>
                    <p className="text-sm text-gray-500">Upload images and extract details with AI</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400" />

                {/* Step 2: Generate Content */}
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isContentGenerated ? 'bg-green-500 text-white' : 
                    isAIAutofilled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {isContentGenerated ? <CheckCircle className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">2. Generate Content</p>
                    <p className="text-sm text-gray-500">Create SEO-optimized title & description</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400" />

                {/* Step 3: Publish */}
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isPublished ? 'bg-green-500 text-white' : 
                    isContentGenerated ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {isPublished ? <CheckCircle className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">3. Publish</p>
                    <p className="text-sm text-gray-500">Create live eBay listing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Product Form */}
            <div>
                <ProductForm 
                  onGenerate={handleGenerate} 
                  isGenerating={false}
                onDataChange={handleDataChange}
                onPublishSuccess={handlePublishSuccess}
                onAIAutofillComplete={handleAIAutofillComplete}
                editableContent={editableContent}
                setEditableContent={setEditableContent}
                generateListingPreviewHTML={generateListingPreviewHTML}
                />
              </div>

            {/* Right Column: Preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Listing Preview
                    {isContentGenerated && (
                      <Badge className="bg-green-100 text-green-800">Generated</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isContentGenerated ? (
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
                        <div className="space-y-4">
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
                              onClick={handleTabClick}
                          />
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
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Preview will appear here</p>
                      <p className="text-sm">Generate content to see your listing preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Success Message */}
              {isPublished && (
                <Card className="mt-4 border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">Successfully Published!</h3>
                        <p className="text-green-700">Your listing is now live on eBay</p>
                  </div>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 