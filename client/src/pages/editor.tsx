import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import WYSIWYGEditor, { 
  type DescriptionSection, 
  type RelatedProduct, 
  type BrandSettings 
} from "@/components/wysiwyg-editor";
import { 
  Save, 
  Eye, 
  Share, 
  ArrowLeft, 
  Wand2,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface Listing {
  id: number;
  productName: string;
  category: string;
  price: string;
  generatedTitle: string;
  generatedDescription: string;
  seoScore: number;
  status: string;
  structuredDescription?: {
    title: string;
    sections: DescriptionSection[];
    keywords: string[];
    brandTone: string;
  };
  relatedProducts?: RelatedProduct[];
}

export default function Editor() {
  const [, params] = useRoute("/editor/:listingId");
  const listingId = params?.listingId;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [sections, setSections] = useState<DescriptionSection[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    // Basic Brand Info
    brandName: '',
    tagline: '',
    
    // Visual Identity
    logo: '',
    colors: { 
      primary: '#3b82f6', 
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937'
    },
    
    // Typography
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    
    // Communication Style
    tone: 'professional',
    voice: 'informative',
    style: 'modern',
    
    // Content Templates
    templates: {
      productIntro: 'Introduce products with clear benefits and quality focus',
      keyFeatures: 'Highlight features that matter most to customers',
      qualityAssurance: 'We stand behind our products with quality guarantees',
      callToAction: 'Shop with confidence - your satisfaction is our priority'
    },
    
    // Marketing Focus
    targetAudience: 'general',
    sellingPoints: [],
    keywords: [],
    
    // Compliance & Trust
    returnPolicy: '',
    warranty: '',
    certifications: []
  });
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadListing();
      loadBrandSettings();
      loadAvailableProducts();
    }
  }, [listingId]);

  const loadListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) throw new Error('Failed to load listing');
      
      const data = await response.json();
      setListing(data);
      
      // Initialize sections from structured description or create default
      if (data.structuredDescription?.sections) {
        setSections(data.structuredDescription.sections);
      } else {
        // Create default sections from existing description
        const defaultSections: DescriptionSection[] = [
          {
            id: 'main-description',
            type: 'paragraph',
            title: 'Product Description',
            content: data.generatedDescription || '',
            order: 1
          }
        ];
        setSections(defaultSections);
      }
      
      // Load related products
      if (data.relatedProducts) {
        setRelatedProducts(data.relatedProducts);
      }
      
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const loadBrandSettings = async () => {
    try {
      const response = await fetch('/api/brand-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.brandSettings) {
          setBrandSettings(data.brandSettings);
        }
      }
    } catch (error) {
      console.error('Error loading brand settings:', error);
    }
  };

  const loadAvailableProducts = async () => {
    try {
      const response = await fetch('/api/listings');
      if (response.ok) {
        const data = await response.json();
        setAvailableProducts(data.filter((p: any) => p.id !== parseInt(listingId!)));
      }
    } catch (error) {
      console.error('Error loading available products:', error);
    }
  };

  const saveListing = async () => {
    if (!listing) return;
    
    setSaving(true);
    try {
      const updatedListing = {
        ...listing,
        structuredDescription: {
          title: listing.generatedTitle,
          sections,
          keywords: [],
          brandTone: brandSettings.tone
        },
        relatedProducts
      };

      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedListing)
      });

      if (!response.ok) throw new Error('Failed to save listing');
      
      toast.success('Listing saved successfully!');
      setListing(updatedListing);
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error('Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const saveBrandSettings = async () => {
    try {
      const response = await fetch('/api/brand-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandSettings)
      });

      if (!response.ok) throw new Error('Failed to save brand settings');
      toast.success('Brand settings saved!');
    } catch (error) {
      console.error('Error saving brand settings:', error);
      toast.error('Failed to save brand settings');
    }
  };

  const regenerateWithAI = async () => {
    if (!listing) return;
    
    setRegenerating(true);
    try {
      const response = await fetch('/api/generate-structured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: listing.productName,
          category: listing.category,
          price: listing.price,
          description: listing.generatedDescription,
          brandSettings
        })
      });

      if (!response.ok) throw new Error('Failed to regenerate content');
      
      const data = await response.json();
      
      if (data.description?.sections) {
        setSections(data.description.sections);
      }
      
      if (data.relatedProducts) {
        setRelatedProducts(data.relatedProducts);
      }
      
      toast.success('Content regenerated with AI!');
    } catch (error) {
      console.error('Error regenerating content:', error);
      toast.error('Failed to regenerate content');
    } finally {
      setRegenerating(false);
    }
  };

  const generateHTML = () => {
    let html = '';
    
    sections
      .sort((a, b) => a.order - b.order)
      .forEach(section => {
        html += `<div class="section" style="margin-bottom: 24px;">`;
        html += `<h3 style="color: ${brandSettings.colors.primary}; font-size: 20px; font-weight: bold; margin-bottom: 12px;">${section.title}</h3>`;
        
        if (section.type === 'list' && Array.isArray(section.content)) {
          html += '<ul style="list-style-type: disc; margin-left: 20px; line-height: 1.6;">';
          section.content.forEach(item => {
            html += `<li style="margin-bottom: 8px;">${item}</li>`;
          });
          html += '</ul>';
        } else {
          html += `<p style="line-height: 1.6; color: #374151;">${section.content}</p>`;
        }
        
        html += '</div>';
      });

    // Add related products
    if (relatedProducts.length > 0) {
      html += `<div class="related-products" style="margin-top: 32px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">`;
      html += `<h3 style="color: ${brandSettings.colors.primary}; font-size: 18px; font-weight: bold; margin-bottom: 16px;">You May Also Like</h3>`;
      html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">';
      
      relatedProducts.forEach(product => {
        html += `<div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">`;
        if (product.image) {
          html += `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">`;
        }
        html += `<h4 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${product.title}</h4>`;
        html += `<p style="color: #059669; font-weight: 600;">${product.price}</p>`;
        html += '</div>';
      });
      
      html += '</div></div>';
    }

    return html;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Listing not found</p>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
            <p className="text-gray-600">{listing.productName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={listing.status === 'published' ? 'default' : 'secondary'}>
            {listing.status}
          </Badge>
          <Button
            variant="outline"
            onClick={regenerateWithAI}
            disabled={regenerating}
          >
            {regenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Regenerate with AI
          </Button>
          <Button
            onClick={saveListing}
            disabled={saving}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <WYSIWYGEditor
                sections={sections}
                relatedProducts={relatedProducts}
                brandSettings={brandSettings}
                onSectionsChange={setSections}
                onRelatedProductsChange={setRelatedProducts}
                onBrandSettingsChange={(settings) => {
                  setBrandSettings(settings);
                  saveBrandSettings();
                }}
                availableProducts={availableProducts}
              />
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Listing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="text-sm text-gray-900 mt-1">{listing.generatedTitle}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900 mt-1">{listing.category}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <p className="text-sm text-gray-900 mt-1">${listing.price}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">SEO Score</label>
                <div className="flex items-center mt-1">
                  <Badge variant={listing.seoScore >= 80 ? 'default' : listing.seoScore >= 60 ? 'secondary' : 'destructive'}>
                    {listing.seoScore}/100
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export & Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="html">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="mt-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {generateHTML()}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(generateHTML());
                      toast.success('HTML copied to clipboard!');
                    }}
                  >
                    Copy HTML
                  </Button>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                  <div 
                    className="border rounded-md p-4 bg-white max-h-40 overflow-y-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: generateHTML() }}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`/listings/${listingId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 