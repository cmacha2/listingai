import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Wand2, Upload, Sparkles, X, CheckCircle, Edit3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";

// Import new components
import ImageUploadSection from "./image-upload-section";
import BasicProductInfo from "./basic-product-info";
import EbayBusinessPolicies from "./ebay-business-policies";
import GuidedFlowProgress from "./guided-flow-progress";
import EbayInventoryDetails from "./ebay-inventory-details";
import PackageDetails from "./package-details";
import FormActions from "./form-actions";

// Define interfaces for the fetched eBay data
interface EbayPolicy {
  name: string;
  policyId: string;
}

interface EbayLocation {
  locationKey: string;
  name: string;
}

const formSchema = z.object({
  // Basic product information
  productName: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required"),
  categories: z.array(z.string()).min(1, "At least one category is required").max(5, "Maximum 5 categories allowed"),
  features: z.string().optional(),
  tone: z.string().min(1, "Tone is required"),
  language: z.string().default("en"),
  imageUrls: z.array(z.string()).optional(),

  // eBay inventory item fields - matching PUT /inventory_item/{sku} requirements
  publishToEbay: z.boolean().default(false),
  sku: z.string().optional(),
  
  // Product container fields
  title: z.string().optional(),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  brand: z.string().optional(),
  mpn: z.string().optional(),
  upc: z.array(z.string()).optional(),
  ean: z.array(z.string()).optional(),
  isbn: z.array(z.string()).optional(),
  epid: z.string().optional(),
  productAspects: z.record(z.array(z.string())).optional(),
  videoIds: z.array(z.string()).optional(),
  
  // Condition fields
  condition: z.enum(["NEW", "LIKE_NEW", "NEW_OTHER", "NEW_WITH_DEFECTS", "MANUFACTURER_REFURBISHED", 
    "SELLER_REFURBISHED", "USED_EXCELLENT", "USED_VERY_GOOD", "USED_GOOD", "USED_ACCEPTABLE", 
    "FOR_PARTS_OR_NOT_WORKING"]).default("NEW"),
  conditionDescription: z.string().optional(),
  
  // Availability container fields
  quantity: z.number().int().positive().default(1),
  merchantLocationKey: z.string().optional(),
  
  // Package weight and size fields
  packageWeight: z.number().optional(),
  packageWeightUnit: z.enum(["POUND", "KILOGRAM", "OUNCE", "GRAM"]).optional(),
  packageLength: z.number().optional(),
  packageWidth: z.number().optional(),
  packageHeight: z.number().optional(),
  packageDimensionUnit: z.enum(["INCH", "FEET", "CENTIMETER", "METER"]).optional(),
  packageType: z.enum(["LETTER", "BULKY_GOODS", "CARAVAN", "CARS", "EUROPALLET", "EXPANDABLE_TOUGH_BAGS", 
    "EXTRA_LARGE_PACK", "FURNITURE", "INDUSTRY_VEHICLES", "LARGE_CANADA_POSTBOX", "LARGE_CANADA_POST_BUBBLE_MAILER", 
    "LARGE_ENVELOPE", "MAILING_BOX", "MEDIUM_CANADA_POSTBOX", "MEDIUM_CANADA_POST_BUBBLE_MAILER", "MOTORBIKES", 
    "ONE_WAY_PALLET", "PACKAGE_THICK_ENVELOPE", "PADDED_BAGS", "PARCEL_OR_PADDED_ENVELOPE", "ROLL", 
    "SMALL_CANADA_POSTBOX", "TOUGH_BAGS", "UPS_LETTER", "USPS_FLAT_RATE_ENVELOPE", "USPS_LARGE_PACK", 
    "VERY_LARGE_PACK", "WINE_PAK"]).optional(),
  shippingIrregular: z.boolean().optional(),

  // Legacy eBay fields for backward compatibility
  format: z.string().default("FIXED_PRICE"),
  fulfillmentPolicyId: z.string().optional(),
  paymentPolicyId: z.string().optional(),
  returnPolicyId: z.string().optional(),
  quantityLimitPerBuyer: z.number().int().positive().default(1),
  categoryId: z.string().optional(),
  applyTax: z.boolean().default(false),
  vatPercentage: z.number().min(0).max(100).optional(),
  thirdPartyTaxCategory: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
  onDataChange: (data: FormData) => void;
  initialData?: Partial<FormData>;
  onPublishSuccess?: () => void;
  onAIAutofillComplete?: () => void;
  editableContent?: {
    title: string;
    description: string;
    price: string;
    features: string[];
  };
  setEditableContent?: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    price: string;
    features: string[];
  }>>;
  generateListingPreviewHTML?: () => string;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
  cloudinaryUrl?: string;
  isUploading?: boolean;
}

export default function ProductForm({ onGenerate, isGenerating, onDataChange, initialData, onPublishSuccess, onAIAutofillComplete, editableContent, setEditableContent, generateListingPreviewHTML }: ProductFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  
  // Guided flow states
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAIAutofilled, setIsAIAutofilled] = useState(false);
  const [isEbaySettingsComplete, setIsEbaySettingsComplete] = useState(false);
  const [isSEOContentGenerated, setIsSEOContentGenerated] = useState(false);
  const [generatedSEOContent, setGeneratedSEOContent] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // State for eBay policy data
  const [ebayFulfillmentPolicies, setEbayFulfillmentPolicies] = useState<EbayPolicy[]>([]);
  const [ebayPaymentPolicies, setEbayPaymentPolicies] = useState<EbayPolicy[]>([]);
  const [ebayReturnPolicies, setEbayReturnPolicies] = useState<EbayPolicy[]>([]);
  const [ebayInventoryLocations, setEbayInventoryLocations] = useState<EbayLocation[]>([]);
  
  // State for SKU management
  const [isSkuManual, setIsSkuManual] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  
  // Individual loading states for lazy loading
  const [isFulfillmentLoading, setIsFulfillmentLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isReturnLoading, setIsReturnLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // Track if policies have been loaded to avoid duplicate requests
  const [fulfillmentLoaded, setFulfillmentLoaded] = useState(false);
  const [paymentLoaded, setPaymentLoaded] = useState(false);
  const [returnLoaded, setReturnLoaded] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Add this state for tracking the selected category
  const [selectedCategory, setSelectedCategory] = useState<{
    categoryId: string;
    categoryName: string;
    confidence: number;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Basic fields
      productName: "",
      price: "",
      categories: [],
      features: "",
      tone: "professional",
      language: "en",
      imageUrls: [],
      
      // eBay inventory item fields
      publishToEbay: false,
      sku: "",
      title: "",
      description: "",
      subtitle: "",
      brand: "",
      mpn: "",
      upc: [],
      ean: [],
      isbn: [],
      epid: "",
      productAspects: {},
      videoIds: [],
      condition: "NEW",
      conditionDescription: "",
      quantity: 1,
      merchantLocationKey: "",
      
      // Package fields
      packageWeight: undefined,
      packageWeightUnit: "POUND",
      packageLength: undefined,
      packageWidth: undefined,
      packageHeight: undefined,
      packageDimensionUnit: "INCH",
      packageType: undefined,
      shippingIrregular: false,
      
      // Legacy fields
      format: "FIXED_PRICE",
      fulfillmentPolicyId: "",
      paymentPolicyId: "",
      returnPolicyId: "",
      quantityLimitPerBuyer: 1,
      categoryId: "",
      applyTax: false,
      vatPercentage: 0,
      thirdPartyTaxCategory: "",
      ...initialData,
    },
  });

  const watchPublishToEbay = form.watch("publishToEbay");

  // Watch form changes and call onDataChange
  useEffect(() => {
    const subscription = form.watch((value) => {
      onDataChange(value as FormData);
    });
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);

  // Reset eBay-specific data when publishToEbay is toggled off or when user changes
  useEffect(() => {
    if (!watchPublishToEbay || !user?.selectedMarketplace) {
      // Reset all policy states when eBay publishing is disabled or user has no marketplace
      setEbayFulfillmentPolicies([]);
      setEbayPaymentPolicies([]);
      setEbayReturnPolicies([]);
      setEbayInventoryLocations([]);
      
      // Reset loading states
      setIsFulfillmentLoading(false);
      setIsPaymentLoading(false);
      setIsReturnLoading(false);
      setIsLocationLoading(false);
      
      // Reset loaded states
      setFulfillmentLoaded(false);
      setPaymentLoaded(false);
      setReturnLoaded(false);
      setLocationLoaded(false);
    }
  }, [watchPublishToEbay, user?.selectedMarketplace, toast]);

  const generateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store generated SEO content
      setGeneratedSEOContent({
        title: data.title,
        description: data.description
      });
      setIsSEOContentGenerated(true);
      setCurrentStep(4);
      
      // Category is now detected during AI autofill, not during content generation
      
      // Also call the original onGenerate for backward compatibility
      onGenerate(data);
      
      toast({
        title: "SEO Content Generated!",
        description: "Your SEO-optimized title and description are ready for review and publishing.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate SEO content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const fetchSuggestedCategory = async (productData: any) => {
    try {
      const response = await fetch("/api/ebay/suggest-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: productData.productName,
          categories: productData.categories || [],
          features: productData.features || "",
          brand: productData.brand || "",
          description: productData.description || ""
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggested category");
      }

      const data = await response.json();
      setSelectedCategory(data);
      return data;
    } catch (error) {
      console.error("Error fetching suggested category:", error);
      throw error;
    }
  };

  const analyzeImagesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze images');
      }
      
      return response.json();
    },
    onSuccess: async (response) => {
      const data = response.data;
      
      // Update basic product information
      if (data.productName) form.setValue("productName", data.productName);
      if (data.suggestedPrice) form.setValue("price", data.suggestedPrice);
      if (data.categories) form.setValue("categories", data.categories);
      if (data.features) form.setValue("features", data.features);
      if (data.tone) form.setValue("tone", data.tone);
      
      // eBay-specific fields (only if publishing to eBay)
      if (watchPublishToEbay) {
        // Use auto-detected category if available
        if (data.categoryId && data.categoryName) {
          console.log(`✅ Using auto-detected category: ${data.categoryId} - ${data.categoryName}`);
          
          // Set the auto-detected category
          form.setValue("categoryId", data.categoryId);
          setSelectedCategory({
            categoryId: data.categoryId,
            categoryName: data.categoryName,
            confidence: data.categoryConfidence || 0.8
          });
          
          // Show toast with category information
          toast({
            title: "Category Auto-Detected ✨",
            description: `Selected: ${data.categoryName} (${Math.round((data.categoryConfidence || 0.8) * 100)}% confidence)`,
          });
        } else {
          console.log('⚠️ No category auto-detected during AI autofill');
        }

        // Set all eBay-specific fields
        form.setValue("title", data.title || "");
        form.setValue("description", data.description || "");
        form.setValue("subtitle", data.subtitle || "");
        form.setValue("brand", data.brand || "");
        form.setValue("mpn", data.mpn || "");
        form.setValue("upc", data.upc || []);
        form.setValue("ean", data.ean || []);
        form.setValue("isbn", data.isbn || []);
        form.setValue("epid", data.epid || "");
        form.setValue("productAspects", data.productAspects || {});
        
        // Set condition with proper formatting
        if (data.condition) {
          const condition = data.condition.toUpperCase().replace(/ /g, "_");
          const validConditions = ["NEW", "LIKE_NEW", "NEW_OTHER", "NEW_WITH_DEFECTS", "MANUFACTURER_REFURBISHED", 
            "SELLER_REFURBISHED", "USED_EXCELLENT", "USED_VERY_GOOD", "USED_GOOD", "USED_ACCEPTABLE", 
            "FOR_PARTS_OR_NOT_WORKING"];
          if (validConditions.includes(condition)) {
            form.setValue("condition", condition as any);
          }
        }
        
        // Set package details
        form.setValue("packageWeight", data.packageWeight || 1.0);
        form.setValue("packageWeightUnit", data.packageWeightUnit || "POUND");
        form.setValue("packageLength", data.packageLength || 10);
        form.setValue("packageWidth", data.packageWidth || 8);
        form.setValue("packageHeight", data.packageHeight || 6);
        form.setValue("packageDimensionUnit", data.packageDimensionUnit || "INCH");
        form.setValue("packageType", data.packageType || "MAILING_BOX");
        
        // Set quantity
        form.setValue("quantity", data.quantity || 1);
        
        // Set SKU if not manually set
        if (!isSkuManual) {
          form.setValue("sku", data.sku || "");
        }
      }
      
      // Mark as AI autofilled and advance to next step
      setIsAIAutofilled(true);
      setCurrentStep(2);
      
      // Notify parent component about AI autofill completion
      onAIAutofillComplete?.();
      
      // Always update imageUrls with Cloudinary URLs (fallback to preview for local display)
      const imageUrls = imageFiles.map(img => img.cloudinaryUrl || img.preview);
      form.setValue("imageUrls", imageUrls);
      
      toast({
        title: `${data.imageCount} Images Analyzed!`,
        description: "All product details auto-filled from AI analysis. Your existing data was preserved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze images. Please fill fields manually.",
        variant: "destructive",
      });
    },
  });

  const publishToEbayMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/ebay/publish-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish to eBay');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Published to eBay!",
        description: `Your listing "${data.title}" has been successfully published to eBay with listing ID: ${data.listingId}`,
      });
      
      // Reset the entire form to start fresh
      form.reset();
      
      // Reset all states to initial values
      setImageFiles([]);
      setCurrentStep(1);
      setIsAIAutofilled(false);
      setIsEbaySettingsComplete(false);
      setIsSEOContentGenerated(false);
      setGeneratedSEOContent(null);
      setSelectedCategory(null);
      setIsSkuManual(false);
      setUpdateExisting(false);
      
      // Reset policy loading states
      setFulfillmentLoaded(false);
      setPaymentLoaded(false);
      setReturnLoaded(false);
      setLocationLoaded(false);
      
      // Clear policy data
      setEbayFulfillmentPolicies([]);
      setEbayPaymentPolicies([]);
      setEbayReturnPolicies([]);
      setEbayInventoryLocations([]);
      
      // Reset editable content if available
      if (setEditableContent) {
        setEditableContent({
          title: "",
          description: "",
          price: "",
          features: []
        });
      }
      
      // Call the success callback
      onPublishSuccess?.();
      
      console.log("🔄 Form reset after successful eBay publication");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Publication Failed",
        description: error.message || "Failed to publish to eBay. Please check your data and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // This now handles SEO content generation
    const processedData = {
      ...data,
      quantity: Number(data.quantity),
      quantityLimitPerBuyer: Number(data.quantityLimitPerBuyer),
      vatPercentage: data.vatPercentage ? Number(data.vatPercentage) : undefined,
      marketplaceId: user?.selectedMarketplace || "EBAY_US",
    };
    generateMutation.mutate(processedData);
  };

  const handlePublishToEbay = () => {
    const formData = form.getValues();
    
    // Validate that SEO content has been generated
    if (!isSEOContentGenerated || !generatedSEOContent) {
      toast({
        title: "Generate SEO Content First",
        description: "Please generate SEO-optimized content before publishing to eBay.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate required fields (SKU will be auto-generated, so we don't check it)
    if (!formData.productName || !formData.price) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Product Name and Price before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fulfillmentPolicyId || !formData.paymentPolicyId || !formData.returnPolicyId || !formData.merchantLocationKey) {
      toast({
        title: "Missing eBay Policies",
        description: "Please select fulfillment, payment, return policies and inventory location.",
        variant: "destructive",
      });
      return;
    }

    // Use editable content if available, otherwise fall back to generated content
    const finalTitle = editableContent?.title || generatedSEOContent.title;
    const finalDescription = editableContent?.description || generatedSEOContent.description;
    
    // Get Cloudinary URLs for eBay publishing
    const cloudinaryUrls = imageFiles
      .filter(img => img.cloudinaryUrl) // Only include successfully uploaded images
      .map(img => img.cloudinaryUrl!);

    if (cloudinaryUrls.length === 0 && imageFiles.length > 0) {
      toast({
        title: "Images Still Uploading",
        description: "Please wait for all images to finish uploading to cloud storage before publishing.",
        variant: "destructive",
      });
      return;
    }

    // Generate a completely unique SKU for this publication attempt
    const uniqueSku = `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 12)}-${user?.id || 'user'}`;
    
    // Update the form with the new SKU so user can see it
    form.setValue("sku", uniqueSku);
    
    console.log(`🔧 Generated unique SKU for publication: ${uniqueSku}`);

    const processedData = {
      ...formData,
      // Use the newly generated unique SKU
      sku: uniqueSku,
      // Use editable content for publishing
      title: finalTitle,
      listingDescription: finalDescription,
      quantity: Number(formData.quantity),
      quantityLimitPerBuyer: Number(formData.quantityLimitPerBuyer),
      vatPercentage: formData.vatPercentage ? Number(formData.vatPercentage) : undefined,
      marketplaceId: user?.selectedMarketplace || "EBAY_US",
      imageUrls: cloudinaryUrls, // Use Cloudinary URLs for eBay
      // Send the complete HTML preview for eBay description
      htmlDescription: generateListingPreviewHTML ? generateListingPreviewHTML() : finalDescription,
      // SKU management options
      updateExisting: isSkuManual && updateExisting,
      isSkuManual: isSkuManual,
    };

    publishToEbayMutation.mutate(processedData);
  };

  // Check if eBay settings are complete
  const checkEbaySettingsComplete = () => {
    const formData = form.getValues();
    const isComplete = !!(
      formData.fulfillmentPolicyId &&
      formData.paymentPolicyId &&
      formData.returnPolicyId &&
      formData.merchantLocationKey
    );
    
    if (isComplete && !isEbaySettingsComplete) {
      setIsEbaySettingsComplete(true);
      setCurrentStep(3);
    } else if (!isComplete && isEbaySettingsComplete) {
      setIsEbaySettingsComplete(false);
      if (currentStep > 2) setCurrentStep(2);
    }
    
    return isComplete;
  };

  // Watch eBay settings changes
  useEffect(() => {
    if (watchPublishToEbay) {
      checkEbaySettingsComplete();
    }
  }, [form.watch("fulfillmentPolicyId"), form.watch("paymentPolicyId"), form.watch("returnPolicyId"), form.watch("merchantLocationKey")]);

  // Auto-load eBay policies when eBay publishing is enabled
  useEffect(() => {
    if (watchPublishToEbay && user?.selectedMarketplace) {
      // Auto-load policies after a short delay to ensure the component is ready
      const timer = setTimeout(() => {
        // Load fulfillment policies if not already loaded
        if (!fulfillmentLoaded && !isFulfillmentLoading) {
          const loadFulfillmentPolicies = async () => {
            setIsFulfillmentLoading(true);
            try {
              const response = await apiRequest("GET", `/api/ebay/policies/fulfillment?marketplaceId=${user.selectedMarketplace}`);
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.message || "Failed to load fulfillment policies");
              }
              
              setEbayFulfillmentPolicies(data.map((policy: any) => ({
                policyId: policy.id,
                name: policy.name
              })));
              
              if (!form.getValues("fulfillmentPolicyId") && data[0]) {
                form.setValue("fulfillmentPolicyId", data[0].id);
              }
              
              setFulfillmentLoaded(true);
            } catch (error: any) {
              console.error("Auto-load fulfillment policies failed:", error);
            } finally {
              setIsFulfillmentLoading(false);
            }
          };
          loadFulfillmentPolicies();
        }

        // Load payment policies if not already loaded
        if (!paymentLoaded && !isPaymentLoading) {
          const loadPaymentPolicies = async () => {
            setIsPaymentLoading(true);
            try {
              const response = await apiRequest("GET", `/api/ebay/policies/payment?marketplaceId=${user.selectedMarketplace}`);
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.message || "Failed to load payment policies");
              }
              
              setEbayPaymentPolicies(data.map((policy: any) => ({
                policyId: policy.id,
                name: policy.name
              })));
              
              if (!form.getValues("paymentPolicyId") && data[0]) {
                form.setValue("paymentPolicyId", data[0].id);
              }
              
              setPaymentLoaded(true);
            } catch (error: any) {
              console.error("Auto-load payment policies failed:", error);
            } finally {
              setIsPaymentLoading(false);
            }
          };
          loadPaymentPolicies();
        }

        // Load return policies if not already loaded
        if (!returnLoaded && !isReturnLoading) {
          const loadReturnPolicies = async () => {
            setIsReturnLoading(true);
            try {
              const response = await apiRequest("GET", `/api/ebay/policies/return?marketplaceId=${user.selectedMarketplace}`);
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.message || "Failed to load return policies");
              }
              
              setEbayReturnPolicies(data.map((policy: any) => ({
                policyId: policy.id,
                name: policy.name
              })));
              
              if (!form.getValues("returnPolicyId") && data[0]) {
                form.setValue("returnPolicyId", data[0].id);
              }
              
              setReturnLoaded(true);
            } catch (error: any) {
              console.error("Auto-load return policies failed:", error);
            } finally {
              setIsReturnLoading(false);
            }
          };
          loadReturnPolicies();
        }

        // Load inventory locations if not already loaded
        if (!locationLoaded && !isLocationLoading) {
          const loadInventoryLocations = async () => {
            setIsLocationLoading(true);
            try {
              const response = await apiRequest("GET", `/api/ebay/locations`);
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.message || "Failed to load inventory locations");
              }
              
              setEbayInventoryLocations(data.map((location: any) => ({
                locationKey: location.id,
                name: location.name
              })));
              
              if (!form.getValues("merchantLocationKey") && data[0]) {
                form.setValue("merchantLocationKey", data[0].id);
              }
              
              setLocationLoaded(true);
            } catch (error: any) {
              console.error("Auto-load inventory locations failed:", error);
            } finally {
              setIsLocationLoading(false);
            }
          };
          loadInventoryLocations();
        }
      }, 500); // Small delay to ensure component is ready

      return () => clearTimeout(timer);
    }
  }, [watchPublishToEbay, user?.selectedMarketplace]);

  // Add this JSX where you want to display the category
  const renderCategoryDisplay = () => {
    if (!watchPublishToEbay || !selectedCategory) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700">Selected eBay Category</h3>
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {selectedCategory.categoryName}
            <span className="ml-2 text-xs text-gray-500">
              (ID: {selectedCategory.categoryId})
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {(selectedCategory.confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Add a Product</CardTitle>
        <p className="text-sm text-gray-600">Upload up to 12 images to auto-fill product details with AI</p>
        <div className="text-xs text-gray-500 mt-1 p-2 bg-blue-50 rounded">
          💡 <strong>Pro tip:</strong> Upload multiple angles, close-ups, and packaging shots for more accurate AI analysis. eBay allows up to 12 images per listing.
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* eBay Publishing Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Publish to eBay</div>
                <div className="text-xs text-gray-500">
                  Enable eBay-specific fields and direct publishing to your eBay store
                </div>
                {user?.selectedMarketplace && (
                  <div className="text-xs text-blue-600 font-medium">
                    Marketplace: {user.ebayMarketplaceName || user.selectedMarketplace}
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="publishToEbay"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            // Fetch category when eBay publishing is enabled
                            const currentData = form.getValues();
                            fetchSuggestedCategory(currentData).catch(console.error);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {renderCategoryDisplay()}
            
            {/* Guided Flow Steps */}
            <GuidedFlowProgress
              currentStep={currentStep}
              isAIAutofilled={isAIAutofilled}
              isEbaySettingsComplete={isEbaySettingsComplete}
              isSEOContentGenerated={isSEOContentGenerated}
              watchPublishToEbay={watchPublishToEbay}
            />
            
            {/* Image Upload Section */}
            <ImageUploadSection
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              onAnalyzeImages={(files) => analyzeImagesMutation.mutate(files)}
              analyzeImagesMutation={analyzeImagesMutation}
              isAIAutofilled={isAIAutofilled}
            />

            {/* Basic Product Information */}
            <BasicProductInfo
                control={form.control}
              form={form}
              isAIAutofilled={isAIAutofilled}
            />
            

            {/* eBay Inventory Details */}
            <EbayInventoryDetails
                      control={form.control}
              form={form}
              watchPublishToEbay={watchPublishToEbay}
            />

                {/* Condition Section */}
            {watchPublishToEbay && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Item Condition</h4>
                  
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="LIKE_NEW">Like New</SelectItem>
                            <SelectItem value="NEW_OTHER">New Other</SelectItem>
                            <SelectItem value="NEW_WITH_DEFECTS">New with Defects</SelectItem>
                            <SelectItem value="MANUFACTURER_REFURBISHED">Manufacturer Refurbished</SelectItem>
                            <SelectItem value="SELLER_REFURBISHED">Seller Refurbished</SelectItem>
                            <SelectItem value="USED_EXCELLENT">Used - Excellent</SelectItem>
                            <SelectItem value="USED_VERY_GOOD">Used - Very Good</SelectItem>
                            <SelectItem value="USED_GOOD">Used - Good</SelectItem>
                            <SelectItem value="USED_ACCEPTABLE">Used - Acceptable</SelectItem>
                            <SelectItem value="FOR_PARTS_OR_NOT_WORKING">For Parts or Not Working</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional details about the item's condition..." 
                            className="h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            )}

                {/* Availability Section */}
            {watchPublishToEbay && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Availability</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="e.g. 10" 
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                    name="quantityLimitPerBuyer"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel>Quantity Limit Per Buyer</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                            min="1" 
                            max="100" 
                            placeholder="e.g. 5" 
                                {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                    </div>
            )}

            {/* Package Details */}
            <PackageDetails
                    control={form.control}
              watchPublishToEbay={watchPublishToEbay}
            />

            {/* eBay Business Policies */}
            <EbayBusinessPolicies
              control={form.control}
              watchPublishToEbay={watchPublishToEbay}
              currentStep={currentStep}
              isEbaySettingsComplete={isEbaySettingsComplete}
              ebayFulfillmentPolicies={ebayFulfillmentPolicies}
              ebayPaymentPolicies={ebayPaymentPolicies}
              ebayReturnPolicies={ebayReturnPolicies}
              ebayInventoryLocations={ebayInventoryLocations}
              isFulfillmentLoading={isFulfillmentLoading}
              isPaymentLoading={isPaymentLoading}
              isReturnLoading={isReturnLoading}
              isLocationLoading={isLocationLoading}
              fulfillmentLoaded={fulfillmentLoaded}
              paymentLoaded={paymentLoaded}
              returnLoaded={returnLoaded}
              locationLoaded={locationLoaded}
              setEbayFulfillmentPolicies={setEbayFulfillmentPolicies}
              setEbayPaymentPolicies={setEbayPaymentPolicies}
              setEbayReturnPolicies={setEbayReturnPolicies}
              setEbayInventoryLocations={setEbayInventoryLocations}
              setIsFulfillmentLoading={setIsFulfillmentLoading}
              setIsPaymentLoading={setIsPaymentLoading}
              setIsReturnLoading={setIsReturnLoading}
              setIsLocationLoading={setIsLocationLoading}
              setFulfillmentLoaded={setFulfillmentLoaded}
              setPaymentLoaded={setPaymentLoaded}
              setReturnLoaded={setReturnLoaded}
              setLocationLoaded={setLocationLoaded}
              form={form}
              user={user}
              toast={toast}
            />

            {/* Tax Settings */}
            {watchPublishToEbay && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Tax Settings</h4>
                
                  <FormField
                    control={form.control}
                  name="applyTax"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Apply Tax</FormLabel>
                        <div className="text-sm text-gray-500">
                          Enable tax calculation for this item
                          </div>
                          </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT/Sales Tax Rate (%)</FormLabel>
                  <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="e.g. 20" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value))} 
                        />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thirdPartyTaxCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Third-Party Tax Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Electronics" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              </div>
            )}

            {/* Editable Content Section */}
            {isSEOContentGenerated && editableContent && setEditableContent && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Edit Generated Content
                  </CardTitle>
                  <CardDescription>
                    Review and edit the AI-generated title and description before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                      <div>
                    <Label htmlFor="editable-title">
                      eBay Title ({editableContent.title.length}/80)
                    </Label>
                    <Input
                      id="editable-title"
                      value={editableContent.title}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, title: e.target.value }))}
                      maxLength={80}
                      placeholder="Enter product title..."
                    />
                      </div>

                      <div>
                    <Label htmlFor="editable-price">Price</Label>
                    <Input
                      id="editable-price"
                      value={editableContent.price}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="$0.00"
                    />
                      </div>

                  <div>
                    <Label htmlFor="editable-description">Description</Label>
                    <Textarea
                      id="editable-description"
                      value={editableContent.description}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      placeholder="Enter product description..."
                    />
                </div>

                  <div>
                    <Label htmlFor="editable-features">
                      Key Features (one per line)
                    </Label>
                    <Textarea
                      id="editable-features"
                      value={editableContent.features.join('\n')}
                      onChange={(e) => setEditableContent(prev => ({ 
                        ...prev, 
                        features: e.target.value.split('\n').filter(f => f.trim() !== '') 
                      }))}
                      rows={4}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    />
                </div>
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <FormActions
              watchPublishToEbay={watchPublishToEbay}
              currentStep={currentStep}
              isGenerating={isGenerating}
              generateMutation={generateMutation}
              isSEOContentGenerated={isSEOContentGenerated}
              generatedSEOContent={generatedSEOContent}
              publishToEbayMutation={publishToEbayMutation}
              handlePublishToEbay={handlePublishToEbay}
              imageFiles={imageFiles}
              analyzeImagesMutation={analyzeImagesMutation}
              isAIAutofilled={isAIAutofilled}
              form={form}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
