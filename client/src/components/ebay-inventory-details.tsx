



import { useState, useEffect } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import DynamicAspects from "./dynamic-aspects";

interface EbayInventoryDetailsProps {
  control: Control<any>;
  form: any;
  watchPublishToEbay: boolean;
}

export default function EbayInventoryDetails({ control, form, watchPublishToEbay }: EbayInventoryDetailsProps) {
  const [aspectKey, setAspectKey] = useState("");
  const [aspectValue, setAspectValue] = useState("");
  const [upcInput, setUpcInput] = useState("");
  const [eanInput, setEanInput] = useState("");
  const [isbnInput, setIsbnInput] = useState("");

  // Auto-generate SKU function with enhanced uniqueness
  const generateSKU = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 12);
    const sessionId = Math.random().toString(36).substring(2, 6);
    return `SKU-${timestamp}-${random}-${sessionId}`;
  };

  // Auto-generate SKU when publishToEbay becomes true and no SKU exists
  useEffect(() => {
    if (watchPublishToEbay) {
      const currentSku = form.getValues("sku");
      if (!currentSku || currentSku.trim() === "") {
        const newSku = generateSKU();
        form.setValue("sku", newSku);
        console.log(`🔧 Auto-generated SKU: ${newSku}`);
      }
    }
  }, [watchPublishToEbay, form]);

  // Product identifier management
  const addUPC = () => {
    if (upcInput.trim()) {
      const currentUPCs = form.getValues("upc") || [];
      if (!currentUPCs.includes(upcInput.trim())) {
        form.setValue("upc", [...currentUPCs, upcInput.trim()]);
        setUpcInput("");
      }
    }
  };

  const removeUPC = (index: number) => {
    const currentUPCs = form.getValues("upc") || [];
    form.setValue("upc", currentUPCs.filter((_: any, i: number) => i !== index));
  };

  const addEAN = () => {
    if (eanInput.trim()) {
      const currentEANs = form.getValues("ean") || [];
      if (!currentEANs.includes(eanInput.trim())) {
        form.setValue("ean", [...currentEANs, eanInput.trim()]);
        setEanInput("");
      }
    }
  };

  const removeEAN = (index: number) => {
    const currentEANs = form.getValues("ean") || [];
    form.setValue("ean", currentEANs.filter((_: any, i: number) => i !== index));
  };

  const addISBN = () => {
    if (isbnInput.trim()) {
      const currentISBNs = form.getValues("isbn") || [];
      if (!currentISBNs.includes(isbnInput.trim())) {
        form.setValue("isbn", [...currentISBNs, isbnInput.trim()]);
        setIsbnInput("");
      }
    }
  };

  const removeISBN = (index: number) => {
    const currentISBNs = form.getValues("isbn") || [];
    form.setValue("isbn", currentISBNs.filter((_: any, i: number) => i !== index));
  };

  // Add product aspect
  const addProductAspect = () => {
    if (aspectKey.trim() && aspectValue.trim()) {
      const currentAspects = form.getValues("productAspects") || {};
      const newAspects = {
        ...currentAspects,
        [aspectKey.trim()]: [aspectValue.trim()]
      };
      form.setValue("productAspects", newAspects);
      setAspectKey("");
      setAspectValue("");
    }
  };

  // Remove product aspect
  const removeProductAspect = (key: string) => {
    const currentAspects = form.getValues("productAspects") || {};
    const newAspects = { ...currentAspects };
    delete newAspects[key];
    form.setValue("productAspects", newAspects);
  };

  if (!watchPublishToEbay) return null;

  return (
    <div className="space-y-6">
      <Separator />
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">eBay Inventory Item Details</h3>
        
        {/* SKU Field */}
        <FormField
          control={control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="Auto-generated SKU" 
                    {...field} 
                    readOnly
                    className="bg-gray-50"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.setValue("sku", generateSKU())}
                  title="Generate new SKU"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                SKU is automatically generated and will be refreshed with each publication attempt to ensure uniqueness
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Title */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Apple iPhone 13 Pro Max 256GB Blue - Factory Unlocked" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Description */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed product description..." 
                  className="h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subtitle */}
        <FormField
          control={control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Fast shipping, excellent condition" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Product Identifiers Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Product Identifiers</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand and MPN */}
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Apple" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="mpn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MPN (Manufacturer Part Number)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. A2484" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* eBay Product ID */}
          <FormField
            control={control}
            name="epid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>eBay Product ID (ePID)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* UPC Section */}
        <div className="mt-4">
          <FormLabel>UPC Codes</FormLabel>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Enter UPC code"
              value={upcInput}
              onChange={(e) => setUpcInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUPC();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addUPC}>
              Add UPC
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.watch("upc")?.map((upc: string, index: number) => (
              <Badge key={index} variant="secondary">
                {upc}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => removeUPC(index)}
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* EAN Section */}
        <div className="mt-4">
          <FormLabel>EAN Codes</FormLabel>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Enter EAN code"
              value={eanInput}
              onChange={(e) => setEanInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEAN();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addEAN}>
              Add EAN
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.watch("ean")?.map((ean: string, index: number) => (
              <Badge key={index} variant="secondary">
                {ean}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => removeEAN(index)}
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* ISBN Section */}
        <div className="mt-4">
          <FormLabel>ISBN Codes (for books)</FormLabel>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Enter ISBN code"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addISBN();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addISBN}>
              Add ISBN
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.watch("isbn")?.map((isbn: string, index: number) => (
              <Badge key={index} variant="secondary">
                {isbn}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => removeISBN(index)}
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Category Aspects */}
      {form.watch("categoryId") && (
        <DynamicAspects
          categoryId={form.watch("categoryId")}
          marketplaceId="EBAY_US"
          productAspects={form.watch("productAspects") || {}}
          onAspectsChange={(aspects) => {
            console.log('🔧 Updating aspects:', aspects);
            form.setValue("productAspects", aspects);
          }}
          productData={{
            productName: form.watch("productName") || "",
            description: form.watch("description") || "",
            features: form.watch("features") || "",
            brand: form.watch("brand"),
            categories: form.watch("categories") || []
          }}
        />
      )}

      {/* Manual Product Aspects Section (fallback) */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Additional Product Aspects</h4>
        <p className="text-sm text-gray-600 mb-3">Add any additional product specifications not covered above.</p>
        
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Aspect name (e.g., Color)"
            value={aspectKey}
            onChange={(e) => setAspectKey(e.target.value)}
          />
          <Input
            placeholder="Aspect value (e.g., Blue)"
            value={aspectValue}
            onChange={(e) => setAspectValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addProductAspect();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addProductAspect}>
            Add Aspect
          </Button>
        </div>

        <div className="space-y-2">
          {Object.entries(form.getValues("productAspects") || {}).map(([key, values]) => (
            <div key={key} className="flex items-center justify-between p-2 bg-white rounded border">
              <div>
                <span className="font-medium">{key}:</span>{" "}
                <span className="text-gray-600">{Array.isArray(values) ? values.join(", ") : String(values)}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeProductAspect(key)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 