import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  Save, 
  RefreshCw, 
  Package, 
  RotateCcw, 
  MessageSquare, 
  Shield, 
  Info,
  Sparkles,
  Copy,
  Eye,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BrandSettings } from './wysiwyg-editor';

interface DescriptionSection {
  id: string;
  title: string;
  content: string;
  icon: React.ElementType;
  aiPrompt: string;
  placeholder: string;
}

interface DescriptionGeneratorProps {
  productName?: string;
  category?: string;
  price?: string;
  description?: string;
  onSave?: (sections: Record<string, string>) => void;
  brandSettings?: BrandSettings;
}

export default function DescriptionGenerator({
  productName = '',
  category = '',
  price = '',
  description = '',
  onSave,
  brandSettings
}: DescriptionGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [sections, setSections] = useState<Record<string, string>>({
    description: '',
    features: '',
    shipping: '',
    returns: '',
    warranty: '',
    feedback: '',
    specifications: '',
    care: ''
  });

  const sectionConfigs: DescriptionSection[] = [
    {
      id: 'description',
      title: 'Product Description',
      content: '',
      icon: Info,
      aiPrompt: 'Create a compelling product description that highlights benefits and quality',
      placeholder: 'Enter your main product description here...'
    },
    {
      id: 'features',
      title: 'Key Features',
      content: '',
      icon: Sparkles,
      aiPrompt: 'List the most important features and benefits in bullet points',
      placeholder: 'List the key features and benefits...'
    },
    {
      id: 'specifications',
      title: 'Specifications',
      content: '',
      icon: Package,
      aiPrompt: 'Create technical specifications based on product category',
      placeholder: 'Add technical specifications...'
    },
    {
      id: 'shipping',
      title: 'Shipping & Handling',
      content: '',
      icon: Package,
      aiPrompt: 'Generate shipping information including timeframes and handling',
      placeholder: 'Describe shipping options and timeframes...'
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      content: '',
      icon: RotateCcw,
      aiPrompt: 'Create a customer-friendly return policy',
      placeholder: 'Explain your return and refund policy...'
    },
    {
      id: 'warranty',
      title: 'Warranty & Support',
      content: '',
      icon: Shield,
      aiPrompt: 'Generate warranty information and customer support details',
      placeholder: 'Describe warranty coverage and support...'
    },
    {
      id: 'care',
      title: 'Care Instructions',
      content: '',
      icon: Info,
      aiPrompt: 'Provide care and maintenance instructions for the product',
      placeholder: 'Add care and maintenance instructions...'
    },
    {
      id: 'feedback',
      title: 'Feedback & Contact',
      content: '',
      icon: MessageSquare,
      aiPrompt: 'Create a friendly message encouraging customer feedback and contact',
      placeholder: 'Add your contact information and feedback request...'
    }
  ];

  useEffect(() => {
    // Initialize with existing description if provided
    if (description && !sections.description) {
      setSections(prev => ({
        ...prev,
        description: description
      }));
    }
  }, [description]);

  const generateSection = async (sectionId: string) => {
    setIsGenerating(true);
    const section = sectionConfigs.find(s => s.id === sectionId);
    
    if (!section) return;

    try {
      const response = await fetch('/api/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productName,
          category,
          price,
          description,
          sectionType: sectionId,
          prompt: section.aiPrompt,
          brandSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      
      setSections(prev => ({
        ...prev,
        [sectionId]: data.content
      }));

      toast({
        title: "Success!",
        description: `${section.title} generated successfully`,
      });

    } catch (error) {
      console.error('Error generating section:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${section.title}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllSections = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-all-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productName,
          category,
          price,
          description,
          brandSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setSections(data.sections);

      toast({
        title: "Success!",
        description: "All sections generated successfully",
      });

    } catch (error) {
      console.error('Error generating all sections:', error);
      toast({
        title: "Error",
        description: "Failed to generate sections",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSections = async () => {
    setIsSaving(true);
    
    try {
      if (onSave) {
        onSave(sections);
      }

      // Also save to the backend
      const response = await fetch('/api/save-description-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productName,
          sections
        })
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Sections saved successfully",
        });
      }

    } catch (error) {
      console.error('Error saving sections:', error);
      toast({
        title: "Error",
        description: "Failed to save sections",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (sectionId: string, content: string) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: content
    }));
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const exportHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName || 'product'}-description.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateHTML = () => {
    const brandColors = brandSettings?.colors || {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937'
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productName || 'Product'} Description</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: ${brandColors.text};
            background-color: ${brandColors.background};
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, ${brandColors.primary}20 0%, ${brandColors.accent}20 100%);
            border-radius: 10px;
        }
        .section {
            margin-bottom: 25px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid ${brandColors.primary};
        }
        .section-title {
            color: ${brandColors.primary};
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .section-content {
            white-space: pre-wrap;
        }
        .highlight {
            background-color: ${brandColors.accent}20;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .price {
            font-size: 1.5em;
            color: ${brandColors.primary};
            font-weight: bold;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${productName || 'Product Name'}</h1>
        ${price ? `<div class="price">$${price}</div>` : ''}
        ${brandSettings?.tagline ? `<p style="font-style: italic; margin-top: 10px;">${brandSettings.tagline}</p>` : ''}
    </div>
    
    ${sectionConfigs.map(section => {
      if (!sections[section.id]) return '';
      return `
    <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <div class="section-content">${sections[section.id].replace(/\n/g, '<br>')}</div>
    </div>`;
    }).join('')}
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: ${brandColors.primary}10; border-radius: 8px;">
        <p style="margin: 0; color: ${brandColors.text};">Thank you for choosing ${brandSettings?.brandName || 'our products'}!</p>
    </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
              AI Description Generator
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={exportHTML}
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
              <Button
                onClick={generateAllSections}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate All
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Create professional product descriptions with AI-powered content generation
          </p>
        </CardHeader>
      </Card>

      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Product Name</Label>
              <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                {productName || 'Not specified'}
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                {category || 'Not specified'}
              </div>
            </div>
            <div>
              <Label>Price</Label>
              <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                {price ? `$${price}` : 'Not specified'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                {sectionConfigs.map((section) => (
                  <TabsTrigger 
                    key={section.id} 
                    value={section.id}
                    className="flex items-center text-xs lg:text-sm"
                  >
                    <section.icon className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                    <span className="hidden lg:inline">{section.title.split(' ')[0]}</span>
                    <span className="lg:hidden">{section.title.split(' ')[0].slice(0, 3)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {sectionConfigs.map((section) => (
                <TabsContent key={section.id} value={section.id} className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <section.icon className="w-5 h-5 mr-2 text-blue-600" />
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        {sections[section.id] && (
                          <Badge variant="secondary" className="ml-2">
                            {sections[section.id].length} chars
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {sections[section.id] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(sections[section.id])}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateSection(section.id)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={sections[section.id] || ''}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      rows={8}
                      className="resize-none"
                    />

                    <p className="text-xs text-gray-500">
                      AI Prompt: {section.aiPrompt}
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSections}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Sections
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 