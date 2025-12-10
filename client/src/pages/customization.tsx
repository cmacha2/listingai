import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { generateEbayCompatibleHTML } from "@/lib/html-generator";
import { 
  Brush,
  Upload, 
  Save, 
  RefreshCw, 
  ImageIcon, 
  Eye,
  Code,
  Palette,
  Package,
  ShoppingCart,
  GripVertical,
  Plus,
  X,
  Bold,
  Italic,
  List,
  Link,
  Smile,
  Table,
  FileText,
  Truck,
  RotateCcw,
  Shield,
  Phone,
  Layout,
  Grid,
  AlignLeft,
  Settings as SettingsIcon
} from "lucide-react";

interface StoreAssets {
  logo: string;
  banner: string;
  logoPosition: 'left' | 'center' | 'right';
  bannerHeight: number;
}

interface StorePolicies {
  shipping: string;
  returns: string;
  warranty: string;
  contact: string;
  aboutUs: string;
}

interface RelatedProduct {
  id: string;
  title: string;
  price: string;
  image: string;
  category: string;
  order: number;
}

interface DescriptionSettings {
  layout: 'grid' | 'list' | 'compact';
  showRelatedProducts: boolean;
  maxRelatedProducts: number;
  enablePolicyTabs: boolean;
  enableBranding: boolean;
}

interface FooterSettings {
  enabled: boolean;
  logo: string;
  copyrightText: string;
  backgroundColor: string;
  textColor: string;
}

export default function CustomizationPage() {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [storeAssets, setStoreAssets] = useState<StoreAssets>({
    logo: '',
    banner: '',
    logoPosition: 'left',
    bannerHeight: 270
  });
  
  const [storePolicies, setStorePolicies] = useState<StorePolicies>({
    shipping: '',
    returns: '',
    warranty: '',
    contact: '',
    aboutUs: ''
  });
  
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [descriptionSettings, setDescriptionSettings] = useState<DescriptionSettings>({
    layout: 'grid',
    showRelatedProducts: true,
    maxRelatedProducts: 3,
    enablePolicyTabs: true,
    enableBranding: true
  });
  
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    enabled: true,
    logo: '',
    copyrightText: '© 2023 Your Store Name. All rights reserved.',
    backgroundColor: '#f8fafc',
    textColor: '#374151'
  });
  
  const [mockupData, setMockupData] = useState({
    productName: 'Premium Wireless Headphones',
    price: '$199.99',
    description: 'Experience crystal-clear audio quality with our premium wireless headphones featuring active noise cancellation...',
    category: 'Electronics',
    features: ['Active Noise Cancellation', '30-hour battery life', 'Quick charge technology', 'Premium materials']
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);

  if (!isLoggedIn) {
    window.location.href = "/login";
    return <div>Redirecting...</div>;
  }

  useEffect(() => {
    loadCustomizationSettings();
    loadSampleRelatedProducts();
  }, []);

  const loadCustomizationSettings = async () => {
    try {
      const response = await fetch('/api/customization-settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.storeAssets) setStoreAssets(data.storeAssets);
        if (data.storePolicies) setStorePolicies(data.storePolicies);
        if (data.descriptionSettings) setDescriptionSettings(data.descriptionSettings);
        if (data.footerSettings) setFooterSettings(data.footerSettings);
      }
    } catch (error) {
      console.error('Error loading customization settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleRelatedProducts = () => {
    const sampleProducts: RelatedProduct[] = [
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
      },
      {
        id: '4',
        title: 'Laptop Sleeve Case',
        price: '$34.99',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 4
      },
      {
        id: '5',
        title: 'Wireless Mouse',
        price: '$29.99',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 5
      },
      {
        id: '6',
        title: 'Portable Power Bank',
        price: '$39.99',
        image: 'https://images.unsplash.com/photo-1609592424893-bb674eeafc87?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 6
      },
      {
        id: '7',
        title: 'Bluetooth Earbuds',
        price: '$79.99',
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 7
      },
      {
        id: '8',
        title: 'Smartphone Ring Holder',
        price: '$12.99',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center',
        category: 'Electronics',
        order: 8
      }
    ];
    setRelatedProducts(sampleProducts);
  };

  const saveCustomizationSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/customization-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          storeAssets,
          storePolicies,
          descriptionSettings,
          footerSettings
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Customization settings saved successfully",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save customization settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAssetUpload = async (type: 'logo' | 'banner' | 'footerLogo', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Image must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Set uploading state
    if (type === 'logo') setUploadingLogo(true);
    else if (type === 'banner') setUploadingBanner(true);
    else if (type === 'footerLogo') setUploadingFooterLogo(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (type === 'footerLogo') {
        setFooterSettings(prev => ({
          ...prev,
          logo: result.url
        }));
      } else {
        setStoreAssets(prev => ({
          ...prev,
          [type]: result.url
        }));
      }

      toast({
        title: "Success!",
        description: `${type === 'logo' ? 'Logo' : type === 'banner' ? 'Banner' : 'Footer Logo'} uploaded successfully`,
      });

      // Clear the input value so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error.message || `Failed to upload ${type}`,
        variant: "destructive",
      });
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else if (type === 'banner') setUploadingBanner(false);
      else if (type === 'footerLogo') setUploadingFooterLogo(false);
    }
  };

  const triggerFileUpload = (type: 'logo' | 'banner' | 'footerLogo') => {
    if (type === 'logo' && logoInputRef.current) {
      logoInputRef.current.click();
    } else if (type === 'banner' && bannerInputRef.current) {
      bannerInputRef.current.click();
    } else if (type === 'footerLogo' && footerLogoInputRef.current) {
      footerLogoInputRef.current.click();
    }
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

  const generatePolicy = async (policyType: keyof StorePolicies) => {
    // AI policy generation is disabled for now
    toast({
      title: "Feature Coming Soon",
      description: "AI policy generation will be available in a future update. Please enter your policy manually.",
    });
  };

  const generatePreviewHTML = (): string => {
    const customizationSettings = {
      storeAssets,
      storePolicies,
      descriptionSettings,
      footerSettings
    };
    
    const productData = {
      title: mockupData.productName,
      price: mockupData.price,
      description: mockupData.description,
      features: mockupData.features
    };
    
    return generateEbayCompatibleHTML(customizationSettings, productData, relatedProducts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brush className="w-8 h-8 mr-3 text-blue-600" />
                Customization & Branding
              </h1>
              <p className="text-gray-600 mt-1">
                Design your store identity and create professional product descriptions
              </p>
            </div>
            
            <Button
              onClick={saveCustomizationSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-8">
            {/* Hidden file inputs - Global */}
            <input
              ref={footerLogoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleAssetUpload('footerLogo', e)}
              className="hidden"
              disabled={uploadingFooterLogo}
            />
            
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="branding" className="flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="policies" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Policies
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center">
                  <Layout className="w-4 h-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="footer" className="flex items-center">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Footer
                </TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Store Branding Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Hidden file inputs */}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAssetUpload('logo', e)}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAssetUpload('banner', e)}
                      className="hidden"
                      disabled={uploadingBanner}
                    />

                    {/* Logo Upload */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Store Logo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                        {storeAssets.logo ? (
                          <div className="space-y-4">
                            <img 
                              src={storeAssets.logo} 
                              alt="Store Logo" 
                              className="h-20 mx-auto object-contain"
                            />
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => triggerFileUpload('logo')}
                                disabled={uploadingLogo}
                              >
                                {uploadingLogo ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change Logo
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setStoreAssets(prev => ({ ...prev, logo: '' }))}
                                disabled={uploadingLogo}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-lg font-medium text-gray-900 mb-2">Upload your store logo</p>
                              <p className="text-sm text-gray-600 mb-4">PNG, JPG or SVG (max 5MB)</p>
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700" 
                                onClick={() => triggerFileUpload('logo')}
                                disabled={uploadingLogo}
                              >
                                {uploadingLogo ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Store Banner</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                        {storeAssets.banner ? (
                          <div className="space-y-4">
                            <img 
                              src={storeAssets.banner} 
                              alt="Store Banner" 
                              className="w-full max-h-32 mx-auto object-cover rounded"
                            />
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => triggerFileUpload('banner')}
                                disabled={uploadingBanner}
                              >
                                {uploadingBanner ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change Banner
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setStoreAssets(prev => ({ ...prev, banner: '' }))}
                                disabled={uploadingBanner}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-lg font-medium text-gray-900 mb-2">Upload store banner</p>
                              <p className="text-sm text-gray-600 mb-4">Wide format header image (standard: 1200×270px)</p>
                              <Button 
                                variant="outline" 
                                onClick={() => triggerFileUpload('banner')}
                                disabled={uploadingBanner}
                              >
                                {uploadingBanner ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo Position */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Logo Position</label>
                      <Select
                        value={storeAssets.logoPosition}
                        onValueChange={(value: 'left' | 'center' | 'right') => 
                          setStoreAssets(prev => ({ ...prev, logoPosition: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Banner Height */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Banner Height (pixels)</label>
                      <Input
                        type="number"
                        value={storeAssets.bannerHeight}
                        onChange={(e) => setStoreAssets(prev => ({ 
                          ...prev, 
                          bannerHeight: parseInt(e.target.value) || 270 
                        }))}
                        min="200"
                        max="400"
                        className="w-32"
                      />
                      <p className="text-xs text-gray-500 mt-1">Standard: 270px (for 1200×270 banner)</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Policies Tab */}
              <TabsContent value="policies" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Store Policies & Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(storePolicies).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium capitalize flex items-center">
                            {key === 'shipping' && <Truck className="w-4 h-4 mr-2 text-blue-600" />}
                            {key === 'returns' && <RotateCcw className="w-4 h-4 mr-2 text-blue-600" />}
                            {key === 'warranty' && <Shield className="w-4 h-4 mr-2 text-blue-600" />}
                            {key === 'contact' && <Phone className="w-4 h-4 mr-2 text-blue-600" />}
                            {key === 'aboutUs' && <FileText className="w-4 h-4 mr-2 text-blue-600" />}
                            {key === 'aboutUs' ? 'About Us' : key} Policy
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePolicy(key as keyof StorePolicies)}
                            disabled
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generate with AI (Coming Soon)
                          </Button>
                        </div>
                        <Textarea
                          value={value}
                          onChange={(e) => setStorePolicies(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }))}
                          placeholder={`Enter your ${key === 'aboutUs' ? 'about us information' : key + ' policy'}...`}
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Related Products Tab */}
              <TabsContent value="products" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Related Products Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Show Related Products</label>
                      <Switch
                        checked={descriptionSettings.showRelatedProducts}
                        onCheckedChange={(checked) => 
                          setDescriptionSettings(prev => ({ ...prev, showRelatedProducts: checked }))
                        }
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium">Maximum Products to Show</label>
                        <Badge variant="outline" className="text-xs">
                          {relatedProducts.length} total available
                        </Badge>
                      </div>
                      <Select
                        value={descriptionSettings.maxRelatedProducts.toString()}
                        onValueChange={(value) => 
                          setDescriptionSettings(prev => ({ ...prev, maxRelatedProducts: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Products</SelectItem>
                          <SelectItem value="3">3 Products</SelectItem>
                          <SelectItem value="4">4 Products</SelectItem>
                          <SelectItem value="6">6 Products</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Preview indicator */}
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center text-sm text-blue-700">
                          <Eye className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            Preview will show: {Math.min(descriptionSettings.maxRelatedProducts, relatedProducts.length)} of {relatedProducts.length} products
                          </span>
                        </div>
                        {descriptionSettings.maxRelatedProducts > relatedProducts.length && (
                          <p className="text-xs text-blue-600 mt-1">
                            Note: Only {relatedProducts.length} sample products are available for preview
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-3 block">Layout Style</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'grid', label: 'Grid', icon: Grid },
                          { key: 'list', label: 'List', icon: AlignLeft },
                          { key: 'compact', label: 'Compact', icon: Layout }
                        ].map(({ key, label, icon: Icon }) => (
                          <button
                            key={key}
                            onClick={() => setDescriptionSettings(prev => ({ ...prev, layout: key as any }))}
                            className={`p-4 border rounded-lg text-center transition-colors ${
                              descriptionSettings.layout === key
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sample Products Preview */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Sample Products Preview</label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {relatedProducts.slice(0, descriptionSettings.maxRelatedProducts).map((product, index) => (
                            <div 
                              key={product.id} 
                              className={`p-3 bg-white border rounded-lg text-center ${
                                index < descriptionSettings.maxRelatedProducts ? 'opacity-100' : 'opacity-40'
                              }`}
                            >
                              <img 
                                src={product.image} 
                                alt={product.title} 
                                className="w-full h-16 object-cover rounded mb-2"
                              />
                              <h4 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                                {product.title}
                              </h4>
                              <p className="text-xs text-green-600 font-semibold">{product.price}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-center">
                          <span className="text-xs text-gray-600">
                            Showing {Math.min(descriptionSettings.maxRelatedProducts, relatedProducts.length)} products in {descriptionSettings.layout} layout
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description Layout Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Enable Store Branding</label>
                      <Switch
                        checked={descriptionSettings.enableBranding}
                        onCheckedChange={(checked) => 
                          setDescriptionSettings(prev => ({ ...prev, enableBranding: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Enable Navigation Tabs</label>
                      <Switch
                        checked={descriptionSettings.enablePolicyTabs}
                        onCheckedChange={(checked) => 
                          setDescriptionSettings(prev => ({ ...prev, enablePolicyTabs: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Footer Tab */}
              <TabsContent value="footer" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Footer Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Enable Footer</label>
                      <Switch
                        checked={footerSettings.enabled}
                        onCheckedChange={(checked) => 
                          setFooterSettings(prev => ({ ...prev, enabled: checked }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-3 block">Footer Logo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                        {footerSettings.logo ? (
                          <div className="space-y-4">
                            <img 
                              src={footerSettings.logo} 
                              alt="Footer Logo" 
                              className="h-16 mx-auto object-contain"
                            />
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => triggerFileUpload('footerLogo')}
                                disabled={uploadingFooterLogo}
                              >
                                {uploadingFooterLogo ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change Logo
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setFooterSettings(prev => ({ ...prev, logo: '' }))}
                                disabled={uploadingFooterLogo}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-lg font-medium text-gray-900 mb-2">Upload footer logo</p>
                              <p className="text-sm text-gray-600 mb-4">PNG, JPG or SVG (max 5MB)</p>
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700" 
                                onClick={() => triggerFileUpload('footerLogo')}
                                disabled={uploadingFooterLogo}
                              >
                                {uploadingFooterLogo ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-3 block">Copyright Text</label>
                      <Input
                        value={footerSettings.copyrightText}
                        onChange={(e) => setFooterSettings(prev => ({ ...prev, copyrightText: e.target.value }))}
                        placeholder="© 2023 Your Store Name. All rights reserved."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-3 block">Background Color</label>
                        <div className="flex space-x-2">
                          <Input
                            type="color"
                            value={footerSettings.backgroundColor}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={footerSettings.backgroundColor}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            placeholder="#f8fafc"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-3 block">Text Color</label>
                        <div className="flex space-x-2">
                          <Input
                            type="color"
                            value={footerSettings.textColor}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, textColor: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={footerSettings.textColor}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, textColor: e.target.value }))}
                            placeholder="#374151"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Preview */}
                    {footerSettings.enabled && (
                      <div>
                        <label className="text-sm font-medium mb-3 block">Footer Preview</label>
                        <div 
                          className="border rounded-lg p-4 text-center"
                          style={{ backgroundColor: footerSettings.backgroundColor }}
                        >
                          {footerSettings.logo && (
                            <img 
                              src={footerSettings.logo} 
                              alt="Footer Logo" 
                              className="h-10 mx-auto mb-2 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                          <p style={{ color: footerSettings.textColor, margin: 0, fontSize: '14px' }}>
                            {footerSettings.copyrightText}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Live Preview Section - Now Below */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Live Preview
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatePreviewHTML());
                        toast({
                          title: "Copied!",
                          description: "HTML content copied to clipboard",
                        });
                      }}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Copy HTML
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg bg-white overflow-hidden">
                  <div 
                    className="prose prose-sm max-w-none w-full"
                    style={{ 
                      padding: '20px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      overflow: 'visible'
                    }}
                    dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
                    onClick={handleTabClick}
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
                  
                  {/* Additional info row */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          <span className="font-medium">Assets:</span> 
                          {storeAssets.logo && storeAssets.banner ? ' Logo + Banner' : 
                           storeAssets.logo ? ' Logo only' :
                           storeAssets.banner ? ' Banner only' : ' None'}
                        </span>
                        {descriptionSettings.showRelatedProducts && (
                          <span>
                            <span className="font-medium">Product Data:</span> {relatedProducts.length} static samples loaded
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span>Preview synchronized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 