import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  type DroppableProvided,
  type DraggableProvided,
  type DropResult
} from "@hello-pangea/dnd";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Palette,
  Save,
  Search,
  X,
  Upload,
  Image as ImageIcon,
  Type,
  Sparkles
} from "lucide-react";

export interface DescriptionSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'highlight' | 'related-products';
  title: string;
  content: string | string[];
  order: number;
}

export interface RelatedProduct {
  id: string;
  title: string;
  price: string;
  image?: string;
  category: string;
  relevanceScore: number;
}

export interface BrandSettings {
  // Basic Brand Info
  brandName?: string;
  tagline?: string;
  
  // Visual Identity
  logo?: string; // Base64 or URL
  colors: { 
    primary: string; 
    secondary: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  
  // Typography
  fonts: {
    heading: 'Inter' | 'Roboto' | 'Playfair Display' | 'Montserrat' | 'Open Sans';
    body: 'Inter' | 'Roboto' | 'Source Sans Pro' | 'Lato' | 'Open Sans';
  };
  
  // Communication Style
  tone: 'professional' | 'casual' | 'luxury' | 'friendly' | 'technical' | 'creative';
  voice: 'authoritative' | 'conversational' | 'enthusiastic' | 'informative' | 'persuasive';
  style: 'modern' | 'classic' | 'minimalist' | 'bold' | 'elegant';
  
  // Content Templates
  templates: {
    productIntro: string;
    keyFeatures: string;
    qualityAssurance: string;
    callToAction: string;
  };
  
  // Marketing Focus
  targetAudience: 'general' | 'professionals' | 'enthusiasts' | 'budget-conscious' | 'premium';
  sellingPoints: string[];
  keywords: string[];
  
  // Compliance & Trust
  returnPolicy?: string;
  warranty?: string;
  certifications?: string[];
}

interface WYSIWYGEditorProps {
  sections: DescriptionSection[];
  relatedProducts: RelatedProduct[];
  brandSettings: BrandSettings;
  onSectionsChange: (sections: DescriptionSection[]) => void;
  onRelatedProductsChange: (products: RelatedProduct[]) => void;
  onBrandSettingsChange: (settings: BrandSettings) => void;
  availableProducts?: any[];
}

export default function WYSIWYGEditor({
  sections,
  relatedProducts,
  brandSettings,
  onSectionsChange,
  onRelatedProductsChange,
  onBrandSettingsChange,
  availableProducts = []
}: WYSIWYGEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [relatedProductLayout, setRelatedProductLayout] = useState<'grid' | 'list' | 'compact'>('grid');
  const [showBrandSettings, setShowBrandSettings] = useState(false);
  const [brandSettingsTab, setBrandSettingsTab] = useState<'identity' | 'style' | 'content' | 'marketing'>('identity');

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    onSectionsChange(updatedItems);
  }, [sections, onSectionsChange]);

  const updateSection = (id: string, updates: Partial<DescriptionSection>) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    );
    onSectionsChange(updatedSections);
  };

  const deleteSection = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id);
    onSectionsChange(updatedSections);
  };

  const addSection = (type: DescriptionSection['type']) => {
    const newSection: DescriptionSection = {
      id: `section-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      content: type === 'list' ? [''] : '',
      order: sections.length + 1
    };
    onSectionsChange([...sections, newSection]);
  };

  const getDefaultTitle = (type: DescriptionSection['type']) => {
    switch (type) {
      case 'heading': return 'New Heading';
      case 'paragraph': return 'Key Features';
      case 'list': return 'Benefits';
      case 'highlight': return 'Special Offer';
      case 'related-products': return 'You May Also Like';
      default: return 'New Section';
    }
  };

  const addRelatedProduct = (product: any) => {
    const newProduct: RelatedProduct = {
      id: product.id || `related-${Date.now()}`,
      title: product.productName || product.title,
      price: `$${product.price}`,
      category: product.category,
      relevanceScore: 0.8
    };
    onRelatedProductsChange([...relatedProducts, newProduct]);
    setShowProductPicker(false);
  };

  const removeRelatedProduct = (id: string) => {
    onRelatedProductsChange(relatedProducts.filter(p => p.id !== id));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        onBrandSettingsChange({
          ...brandSettings,
          logo: logoData
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBrandSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...brandSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onBrandSettingsChange(newSettings);
  };

  const addToArray = (path: string, value: string) => {
    const keys = path.split('.');
    const newSettings = { ...brandSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    const arrayKey = keys[keys.length - 1];
    if (!current[arrayKey]) current[arrayKey] = [];
    current[arrayKey] = [...current[arrayKey], value];
    onBrandSettingsChange(newSettings);
  };

  const removeFromArray = (path: string, index: number) => {
    const keys = path.split('.');
    const newSettings = { ...brandSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    const arrayKey = keys[keys.length - 1];
    current[arrayKey] = current[arrayKey].filter((_: any, i: number) => i !== index);
    onBrandSettingsChange(newSettings);
  };

  const saveBrandSettings = async () => {
    try {
      const response = await fetch('/api/brand-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(brandSettings),
      });

      if (response.ok) {
        // You can add a toast notification here if needed
        setShowBrandSettings(false);
      } else {
        throw new Error('Failed to save brand settings');
      }
    } catch (error) {
      console.error('Error saving brand settings:', error);
      // You can add error handling here
    }
  };

  const renderSectionEditor = (section: DescriptionSection) => {
    if (editingSection !== section.id) {
  return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{section.title}</h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {section.type}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(section.id)}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSection(section.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {section.type === 'list' && Array.isArray(section.content) ? (
              <ul className="list-disc list-inside space-y-1">
                {section.content.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>{String(section.content).substring(0, 150)}...</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="font-medium"
                placeholder="Section title"
              />
              <div className="flex items-center space-x-2">
                <Select
                  value={section.type}
                  onValueChange={(type: any) => updateSection(section.id, { type })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heading">Heading</SelectItem>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="highlight">Highlight</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSection(null)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>

            {section.type === 'list' ? (
              <div className="space-y-2">
                {Array.isArray(section.content) && section.content.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newContent = [...(section.content as string[])];
                        newContent[index] = e.target.value;
                        updateSection(section.id, { content: newContent });
                      }}
                      placeholder={`Item ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newContent = (section.content as string[]).filter((_, i) => i !== index);
                        updateSection(section.id, { content: newContent });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newContent = [...(section.content as string[]), ''];
                    updateSection(section.id, { content: newContent });
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
              </div>
            ) : (
              <Textarea
                value={String(section.content)}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                rows={4}
                placeholder="Enter content..."
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRelatedProducts = () => (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Related Products</CardTitle>
        <div className="flex items-center space-x-2">
          <Select
            value={relatedProductLayout}
            onValueChange={(layout: any) => setRelatedProductLayout(layout)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProductPicker(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`gap-4 ${
          relatedProductLayout === 'grid' ? 'grid grid-cols-3' :
          relatedProductLayout === 'list' ? 'space-y-4' :
          'flex flex-wrap'
        }`}>
          {relatedProducts.map((product) => (
            <div key={product.id} className={`relative border rounded-lg p-3 ${
              relatedProductLayout === 'compact' ? 'w-32' : ''
            }`}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 w-6 h-6 p-0"
                onClick={() => removeRelatedProduct(product.id)}
              >
                <X className="w-3 h-3" />
              </Button>
              
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-20 object-cover rounded mb-2"
                />
              )}
              
              <h4 className={`font-medium text-gray-900 ${
                relatedProductLayout === 'compact' ? 'text-xs' : 'text-sm'
              }`}>
                {product.title}
              </h4>
              <p className="text-green-600 font-semibold">{product.price}</p>
              {relatedProductLayout !== 'compact' && (
                <Badge variant="outline" className="text-xs mt-1">
                  {product.category}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const filteredProducts = availableProducts.filter(product =>
    product.productName?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const renderBrandSettings = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Advanced Brand Configuration
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBrandSettings(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <div className="space-y-2">
              {[
                { id: 'identity', label: 'Brand Identity', icon: ImageIcon },
                { id: 'style', label: 'Visual Style', icon: Palette },
                { id: 'content', label: 'Content Templates', icon: Type },
                { id: 'marketing', label: 'Marketing Focus', icon: Sparkles }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={brandSettingsTab === tab.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setBrandSettingsTab(tab.id as any)}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {brandSettingsTab === 'identity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Brand Identity</h3>
                  
                  {/* Logo Upload */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Brand Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {brandSettings.logo ? (
                        <div className="space-y-4">
                          <img 
                            src={brandSettings.logo} 
                            alt="Brand Logo" 
                            className="h-20 mx-auto object-contain"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateBrandSetting('logo', '')}
                          >
                            Remove Logo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Upload your brand logo</p>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                              <Button variant="outline" className="inline-flex">
                                Choose File
                              </Button>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand Name & Tagline */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Brand Name</label>
                      <Input
                        value={brandSettings.brandName || ''}
                        onChange={(e) => updateBrandSetting('brandName', e.target.value)}
                        placeholder="Your Brand Name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tagline</label>
                      <Input
                        value={brandSettings.tagline || ''}
                        onChange={(e) => updateBrandSetting('tagline', e.target.value)}
                        placeholder="Your Brand Tagline"
                      />
                    </div>
                  </div>

                  {/* Brand Colors */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Brand Colors</label>
                    <div className="grid grid-cols-5 gap-4">
                      {[
                        { key: 'primary', label: 'Primary' },
                        { key: 'secondary', label: 'Secondary' },
                        { key: 'accent', label: 'Accent' },
                        { key: 'background', label: 'Background' },
                        { key: 'text', label: 'Text' }
                      ].map((color) => (
                        <div key={color.key}>
                          <label className="text-xs text-gray-600 mb-1 block">{color.label}</label>
                          <div className="relative">
                            <Input
                              type="color"
                              value={brandSettings.colors[color.key as keyof typeof brandSettings.colors] || '#3b82f6'}
                              onChange={(e) => updateBrandSetting(`colors.${color.key}`, e.target.value)}
                              className="h-10 w-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {brandSettingsTab === 'style' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Visual Style</h3>
                
                {/* Typography */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">Typography</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Heading Font</label>
                      <Select
                        value={brandSettings.fonts?.heading || 'Inter'}
                        onValueChange={(value) => updateBrandSetting('fonts.heading', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Body Font</label>
                      <Select
                        value={brandSettings.fonts?.body || 'Inter'}
                        onValueChange={(value) => updateBrandSetting('fonts.body', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Communication Style */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <Select
                      value={brandSettings.tone}
                      onValueChange={(value) => updateBrandSetting('tone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Voice</label>
                    <Select
                      value={brandSettings.voice || 'informative'}
                      onValueChange={(value) => updateBrandSetting('voice', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Style</label>
                    <Select
                      value={brandSettings.style}
                      onValueChange={(value) => updateBrandSetting('style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {brandSettingsTab === 'content' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Content Templates</h3>
                
                {[
                  { key: 'productIntro', label: 'Product Introduction', placeholder: 'How you typically introduce products...' },
                  { key: 'keyFeatures', label: 'Key Features Format', placeholder: 'How you highlight features...' },
                  { key: 'qualityAssurance', label: 'Quality Assurance', placeholder: 'Your quality message...' },
                  { key: 'callToAction', label: 'Call to Action', placeholder: 'Your typical CTA...' }
                ].map((template) => (
                  <div key={template.key}>
                    <label className="text-sm font-medium mb-2 block">{template.label}</label>
          <Textarea
                      value={brandSettings.templates?.[template.key as keyof typeof brandSettings.templates] || ''}
                      onChange={(e) => updateBrandSetting(`templates.${template.key}`, e.target.value)}
                      placeholder={template.placeholder}
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            )}

            {brandSettingsTab === 'marketing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Marketing Focus</h3>
                
                {/* Target Audience */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Target Audience</label>
                  <Select
                    value={brandSettings.targetAudience || 'general'}
                    onValueChange={(value) => updateBrandSetting('targetAudience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Public</SelectItem>
                      <SelectItem value="professionals">Professionals</SelectItem>
                      <SelectItem value="enthusiasts">Enthusiasts</SelectItem>
                      <SelectItem value="budget-conscious">Budget-Conscious</SelectItem>
                      <SelectItem value="premium">Premium Buyers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selling Points */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Key Selling Points</label>
                  <div className="space-y-2">
                    {(brandSettings.sellingPoints || []).map((point, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...(brandSettings.sellingPoints || [])];
                            newPoints[index] = e.target.value;
                            updateBrandSetting('sellingPoints', newPoints);
                          }}
                          placeholder="Selling point..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray('sellingPoints', index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray('sellingPoints', '')}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Selling Point
                    </Button>
                  </div>
                </div>

                {/* SEO Keywords */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">SEO Keywords</label>
                  <div className="space-y-2">
                    {(brandSettings.keywords || []).map((keyword, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={keyword}
                          onChange={(e) => {
                            const newKeywords = [...(brandSettings.keywords || [])];
                            newKeywords[index] = e.target.value;
                            updateBrandSetting('keywords', newKeywords);
                          }}
                          placeholder="Keyword..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray('keywords', index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray('keywords', '')}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Keyword
                    </Button>
                  </div>
                </div>

                {/* Trust Elements */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Return Policy</label>
                    <Textarea
                      value={brandSettings.returnPolicy || ''}
                      onChange={(e) => updateBrandSetting('returnPolicy', e.target.value)}
                      placeholder="Your return policy..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Warranty Information</label>
          <Textarea
                      value={brandSettings.warranty || ''}
                      onChange={(e) => updateBrandSetting('warranty', e.target.value)}
                      placeholder="Your warranty terms..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowBrandSettings(false)}>
            Cancel
          </Button>
          <Button onClick={saveBrandSettings}>
            Save Brand Settings
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Brand Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              Brand Configuration
            </div>
            <Button
              variant="default"
              onClick={() => setShowBrandSettings(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Palette className="w-4 h-4 mr-2" />
              Configure Brand
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">Logo & Identity</p>
              <p className="text-xs text-gray-600">{brandSettings.logo ? 'Configured' : 'Not set'}</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <Palette className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">Visual Style</p>
              <p className="text-xs text-gray-600">{brandSettings.tone} / {brandSettings.style}</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <Type className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">Content Templates</p>
              <p className="text-xs text-gray-600">{brandSettings.templates ? 'Configured' : 'Default'}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Configure your complete brand identity to generate more personalized and consistent product descriptions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Editor Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={previewMode ? "outline" : "default"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => addSection('paragraph')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      {previewMode ? (
        // Preview Mode
        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className="mb-6">
                    <h3 className="text-xl font-bold mb-3" style={{ color: brandSettings.colors.primary }}>
                      {section.title}
                    </h3>
                    {section.type === 'list' && Array.isArray(section.content) ? (
                      <ul className="list-disc list-inside space-y-2">
                        {section.content.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{String(section.content)}</p>
                    )}
                  </div>
                ))}
            </div>
            {renderRelatedProducts()}
          </CardContent>
        </Card>
      ) : (
        // Edit Mode
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided: DroppableProvided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative"
                        >
                          <div className="flex items-center space-x-2">
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              {renderSectionEditor(section)}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {renderRelatedProducts()}

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Related Product</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductPicker(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => addRelatedProduct(product)}
                  >
                    <div>
                      <h4 className="font-medium">{product.productName}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <p className="text-green-600 font-semibold">${product.price}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {renderBrandSettings()}
    </div>
  );
}