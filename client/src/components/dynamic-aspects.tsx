import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/api";

interface AspectConstraint {
  aspectDataType: string;
  aspectRequired: boolean;
  aspectValues?: Array<{ value: string; localizedValue: string }>;
}

interface CategoryAspect {
  localizedAspectName: string;
  aspectConstraint: AspectConstraint;
}

interface CategoryAspectsResponse {
  aspects: CategoryAspect[];
}

interface DynamicAspectsProps {
  categoryId: string;
  marketplaceId?: string;
  productAspects: Record<string, string[]>;
  onAspectsChange: (aspects: Record<string, string[]>) => void;
  productData?: {
    productName: string;
    description: string;
    features: string;
    brand?: string;
    categories: string[];
  };
}

export default function DynamicAspects({
  categoryId,
  marketplaceId = 'EBAY_US',
  productAspects,
  onAspectsChange,
  productData
}: DynamicAspectsProps) {
  const { toast } = useToast();
  const [aspects, setAspects] = useState<CategoryAspect[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);

  const fetchCategoryAspects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("GET", `/api/ebay/category-aspects/${categoryId}?marketplaceId=${marketplaceId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch category aspects');
      }
      
      const data: CategoryAspectsResponse = await response.json();
      setAspects(data.aspects || []);
      
      console.log('📋 Fetched category aspects:', data.aspects?.length || 0);
    } catch (error: any) {
      console.error('Failed to fetch category aspects:', error);
      setError(error.message);
      toast({
        title: "Failed to Load Category Requirements",
        description: error.message || "Could not fetch required fields for this category.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [categoryId, marketplaceId, toast]);

  // Fetch category aspects when categoryId changes
  useEffect(() => {
    if (categoryId && categoryId !== '') {
      setHasGeneratedAI(false); // Reset AI generation state for new category
      fetchCategoryAspects();
    }
  }, [categoryId, marketplaceId, fetchCategoryAspects]);

  const generateAspectsWithAI = async () => {
    if (!productData) {
      toast({
        title: "Product Data Required",
        description: "Please fill in product information before generating aspects.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAI(true);
    
    try {
      const response = await apiRequest("POST", "/api/ebay/generate-aspects", {
        productData,
        requiredAspects: aspects
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate aspects');
      }
      
      const generatedAspects = await response.json();
      
      // ONLY replace empty aspects, don't overwrite existing ones
      const updatedAspects = { ...productAspects };
      
      Object.entries(generatedAspects).forEach(([key, values]) => {
        // Only set if the aspect doesn't exist or is empty
        if (!updatedAspects[key] || updatedAspects[key].length === 0) {
          updatedAspects[key] = values as string[];
        }
      });
      
      onAspectsChange(updatedAspects);
      setHasGeneratedAI(true);
      
      toast({
        title: "Aspects Generated!",
        description: `Generated ${Object.keys(generatedAspects).length} product aspects using AI. Existing values were preserved.`,
      });
    } catch (error: any) {
      console.error('Failed to generate aspects:', error);
      toast({
        title: "AI Generation Failed",
        description: error.message || "Could not generate aspects automatically.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const updateAspectValue = useCallback((aspectName: string, values: string[]) => {
    const updatedAspects = {
      ...productAspects,
      [aspectName]: values.filter(v => v.trim() !== '') // Remove empty values
    };
    onAspectsChange(updatedAspects);
  }, [productAspects, onAspectsChange]);

  const addAspectValue = useCallback((aspectName: string, value: string) => {
    if (!value.trim()) return;
    
    const currentValues = productAspects[aspectName] || [];
    if (!currentValues.includes(value.trim())) {
      updateAspectValue(aspectName, [...currentValues, value.trim()]);
    }
  }, [productAspects, updateAspectValue]);

  const removeAspectValue = useCallback((aspectName: string, valueToRemove: string) => {
    const currentValues = productAspects[aspectName] || [];
    updateAspectValue(aspectName, currentValues.filter(v => v !== valueToRemove));
  }, [productAspects, updateAspectValue]);

  // Calculate aspects before any early returns
  const { requiredAspects, optionalAspects } = useMemo(() => {
    return {
      requiredAspects: aspects.filter(a => a.aspectConstraint.aspectRequired),
      optionalAspects: aspects.filter(a => !a.aspectConstraint.aspectRequired)
    };
  }, [aspects]);
  
  // Limit the number of aspects shown to prevent UI overload
  const maxRequiredToShow = 10;
  const maxOptionalToShow = 5;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Category Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Fetching required fields for this category...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            Failed to Load Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCategoryAspects} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (aspects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Requirements</CardTitle>
          <CardDescription>
            No specific requirements found for this category.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Category Requirements</CardTitle>
            <CardDescription>
              eBay requires specific information for this category. 
              {requiredAspects.length > 0 && (
                <span className="text-red-600 font-medium">
                  {" "}{requiredAspects.length} required fields
                </span>
              )}
            </CardDescription>
          </div>
          {productData && (
            <Button 
              onClick={generateAspectsWithAI} 
              disabled={generatingAI}
              size="sm"
              variant="outline"
            >
              {generatingAI ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Generate with AI
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Aspects */}
        {requiredAspects.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Required Fields
            </h4>
                         <div className="space-y-4">
               {requiredAspects.slice(0, maxRequiredToShow).map((aspect) => (
                 <AspectField
                   key={aspect.localizedAspectName}
                   aspect={aspect}
                   values={productAspects[aspect.localizedAspectName] || []}
                   onValuesChange={(values) => updateAspectValue(aspect.localizedAspectName, values)}
                   onAddValue={(value) => addAspectValue(aspect.localizedAspectName, value)}
                   onRemoveValue={(value) => removeAspectValue(aspect.localizedAspectName, value)}
                 />
               ))}
               {requiredAspects.length > maxRequiredToShow && (
                 <p className="text-sm text-gray-500">
                   And {requiredAspects.length - maxRequiredToShow} more required fields...
                 </p>
               )}
             </div>
          </div>
        )}

        {/* Optional Aspects */}
        {optionalAspects.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-600 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Optional Fields ({optionalAspects.length})
            </h4>
                         <div className="space-y-4">
               {optionalAspects.slice(0, maxOptionalToShow).map((aspect) => (
                 <AspectField
                   key={aspect.localizedAspectName}
                   aspect={aspect}
                   values={productAspects[aspect.localizedAspectName] || []}
                   onValuesChange={(values) => updateAspectValue(aspect.localizedAspectName, values)}
                   onAddValue={(value) => addAspectValue(aspect.localizedAspectName, value)}
                   onRemoveValue={(value) => removeAspectValue(aspect.localizedAspectName, value)}
                 />
               ))}
               {optionalAspects.length > maxOptionalToShow && (
                 <p className="text-sm text-gray-500">
                   And {optionalAspects.length - maxOptionalToShow} more optional fields...
                 </p>
               )}
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AspectFieldProps {
  aspect: CategoryAspect;
  values: string[];
  onValuesChange: (values: string[]) => void;
  onAddValue: (value: string) => void;
  onRemoveValue: (value: string) => void;
}

function AspectField({ aspect, values, onValuesChange, onAddValue, onRemoveValue }: AspectFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const constraint = aspect.aspectConstraint;
  const hasAllowedValues = constraint.aspectValues && constraint.aspectValues.length > 0;

  const handleAddValue = () => {
    if (inputValue.trim()) {
      // For single-value aspects, replace the existing value
      if (constraint.aspectDataType !== 'STRING_ARRAY') {
        onValuesChange([inputValue.trim()]);
      } else {
        onAddValue(inputValue.trim());
      }
      setInputValue('');
    }
  };

  const handleSelectValue = (value: string) => {
    if (!values.includes(value)) {
      // For single-value aspects, replace the existing value
      if (constraint.aspectDataType !== 'STRING_ARRAY') {
        onValuesChange([value]);
      } else {
        onValuesChange([...values, value]);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="font-medium">
          {aspect.localizedAspectName}
        </Label>
        {constraint.aspectRequired && (
          <Badge variant="destructive" className="text-xs">Required</Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {constraint.aspectDataType === 'STRING_ARRAY' ? 'Multiple values' : 'Single value'}
        </Badge>
      </div>

      {/* Current Values */}
      {values.length > 0 && (
        <div className="space-y-2">
          {constraint.aspectDataType !== 'STRING_ARRAY' && values.length > 1 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                This field only allows one value. Only the first value will be used.
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <Badge 
                key={index} 
                variant={constraint.aspectDataType !== 'STRING_ARRAY' && index > 0 ? "outline" : "secondary"}
                className={`cursor-pointer hover:bg-red-100 ${
                  constraint.aspectDataType !== 'STRING_ARRAY' && index > 0 ? 'opacity-50' : ''
                }`}
                onClick={() => onRemoveValue(value)}
              >
                {value} ×
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input Field */}
      {hasAllowedValues ? (
        <Select onValueChange={handleSelectValue}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${aspect.localizedAspectName.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent>
            {constraint.aspectValues!
              .filter(av => !values.includes(av.localizedValue))
              .map((aspectValue) => (
                <SelectItem key={aspectValue.value} value={aspectValue.localizedValue}>
                  {aspectValue.localizedValue}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter ${aspect.localizedAspectName.toLowerCase()}...`}
            onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
          />
          <Button onClick={handleAddValue} size="sm" variant="outline">
            Add
          </Button>
        </div>
      )}

      {hasAllowedValues && (
        <p className="text-xs text-gray-500">
          Choose from: {constraint.aspectValues!.slice(0, 3).map(av => av.localizedValue).join(', ')}
          {constraint.aspectValues!.length > 3 && ` and ${constraint.aspectValues!.length - 3} more...`}
        </p>
      )}
    </div>
  );
} 