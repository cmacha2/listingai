import { useEffect } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EbayPolicy {
  name: string;
  policyId: string;
}

interface EbayLocation {
  locationKey: string;
  name: string;
}

interface EbayBusinessPoliciesProps {
  control: Control<any>;
  watchPublishToEbay: boolean;
  currentStep: number;
  isEbaySettingsComplete: boolean;
  ebayFulfillmentPolicies: EbayPolicy[];
  ebayPaymentPolicies: EbayPolicy[];
  ebayReturnPolicies: EbayPolicy[];
  ebayInventoryLocations: EbayLocation[];
  isFulfillmentLoading: boolean;
  isPaymentLoading: boolean;
  isReturnLoading: boolean;
  isLocationLoading: boolean;
  fulfillmentLoaded: boolean;
  paymentLoaded: boolean;
  returnLoaded: boolean;
  locationLoaded: boolean;
  setEbayFulfillmentPolicies: React.Dispatch<React.SetStateAction<EbayPolicy[]>>;
  setEbayPaymentPolicies: React.Dispatch<React.SetStateAction<EbayPolicy[]>>;
  setEbayReturnPolicies: React.Dispatch<React.SetStateAction<EbayPolicy[]>>;
  setEbayInventoryLocations: React.Dispatch<React.SetStateAction<EbayLocation[]>>;
  setIsFulfillmentLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPaymentLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReturnLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLocationLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setFulfillmentLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setPaymentLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setReturnLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setLocationLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  form: any;
  user: any;
  toast: any;
}

export default function EbayBusinessPolicies({
  control,
  watchPublishToEbay,
  currentStep,
  isEbaySettingsComplete,
  ebayFulfillmentPolicies,
  ebayPaymentPolicies,
  ebayReturnPolicies,
  ebayInventoryLocations,
  isFulfillmentLoading,
  isPaymentLoading,
  isReturnLoading,
  isLocationLoading,
  fulfillmentLoaded,
  paymentLoaded,
  returnLoaded,
  locationLoaded,
  setEbayFulfillmentPolicies,
  setEbayPaymentPolicies,
  setEbayReturnPolicies,
  setEbayInventoryLocations,
  setIsFulfillmentLoading,
  setIsPaymentLoading,
  setIsReturnLoading,
  setIsLocationLoading,
  setFulfillmentLoaded,
  setPaymentLoaded,
  setReturnLoaded,
  setLocationLoaded,
  form,
  user,
  toast,
}: EbayBusinessPoliciesProps) {
  
  // Implement the loading functions directly in this component
  const loadFulfillmentPolicies = async () => {
    if (fulfillmentLoaded || isFulfillmentLoading || !user?.selectedMarketplace) return;
    
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
      console.error("Error loading fulfillment policies:", error);
      
      // Parse response if it's a fetch error
      if (error.response) {
        try {
          const errorData = await error.response.json();
          if (errorData.requiresReconnection) {
            toast({
              title: "eBay Connection Required",
              description: errorData.message || "Please reconnect your eBay account to load policies.",
              variant: "destructive",
            });
            // Optionally trigger a page refresh to update auth state
            setTimeout(() => window.location.reload(), 2000);
            return;
          }
        } catch (parseError) {
          // Continue with generic error handling
        }
      }
      
      // Handle token expiration specifically
      if (error.message?.includes("token") || error.message?.includes("401") || error.message?.includes("expired") || error.message?.includes("EBAY_TOKEN_EXPIRED")) {
        toast({
          title: "eBay Session Expired",
          description: "Please reconnect your eBay account to load policies.",
          variant: "destructive",
        });
        // Trigger auth state refresh
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast({
          title: "Could not load fulfillment policies",
          description: error.message || "Please try again or check your eBay connection.",
          variant: "destructive",
        });
      }
    } finally {
      setIsFulfillmentLoading(false);
    }
  };

  const loadPaymentPolicies = async () => {
    if (paymentLoaded || isPaymentLoading || !user?.selectedMarketplace) return;
    
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
      console.error("Error loading payment policies:", error);
      
      // Parse response if it's a fetch error
      if (error.response) {
        try {
          const errorData = await error.response.json();
          if (errorData.requiresReconnection) {
            toast({
              title: "eBay Connection Required",
              description: errorData.message || "Please reconnect your eBay account to load policies.",
              variant: "destructive",
            });
            setTimeout(() => window.location.reload(), 2000);
            return;
          }
        } catch (parseError) {
          // Continue with generic error handling
        }
      }
      
      // Handle token expiration specifically
      if (error.message?.includes("token") || error.message?.includes("401") || error.message?.includes("expired") || error.message?.includes("EBAY_TOKEN_EXPIRED")) {
        toast({
          title: "eBay Session Expired",
          description: "Please reconnect your eBay account to load policies.",
          variant: "destructive",
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast({
          title: "Could not load payment policies",
          description: error.message || "Please try again or check your eBay connection.",
          variant: "destructive",
        });
      }
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const loadReturnPolicies = async () => {
    if (returnLoaded || isReturnLoading || !user?.selectedMarketplace) return;
    
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
      console.error("Error loading return policies:", error);
      
      // Parse response if it's a fetch error
      if (error.response) {
        try {
          const errorData = await error.response.json();
          if (errorData.requiresReconnection) {
            toast({
              title: "eBay Connection Required",
              description: errorData.message || "Please reconnect your eBay account to load policies.",
              variant: "destructive",
            });
            setTimeout(() => window.location.reload(), 2000);
            return;
          }
        } catch (parseError) {
          // Continue with generic error handling
        }
      }
      
      // Handle token expiration specifically
      if (error.message?.includes("token") || error.message?.includes("401") || error.message?.includes("expired") || error.message?.includes("EBAY_TOKEN_EXPIRED")) {
        toast({
          title: "eBay Session Expired",
          description: "Please reconnect your eBay account to load policies.",
          variant: "destructive",
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast({
          title: "Could not load return policies",
          description: error.message || "Please try again or check your eBay connection.",
          variant: "destructive",
        });
      }
    } finally {
      setIsReturnLoading(false);
    }
  };

  const loadInventoryLocations = async () => {
    if (locationLoaded || isLocationLoading) return;
    
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
      console.error("Error loading inventory locations:", error);
      
      // Parse response if it's a fetch error
      if (error.response) {
        try {
          const errorData = await error.response.json();
          if (errorData.requiresReconnection) {
            toast({
              title: "eBay Connection Required",
              description: errorData.message || "Please reconnect your eBay account to load locations.",
              variant: "destructive",
            });
            setTimeout(() => window.location.reload(), 2000);
            return;
          }
        } catch (parseError) {
          // Continue with generic error handling
        }
      }
      
      // Handle token expiration specifically
      if (error.message?.includes("token") || error.message?.includes("401") || error.message?.includes("expired") || error.message?.includes("EBAY_TOKEN_EXPIRED")) {
        toast({
          title: "eBay Session Expired",
          description: "Please reconnect your eBay account to load locations.",
          variant: "destructive",
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast({
          title: "Could not load inventory locations",
          description: error.message || "Please try again or check your eBay connection.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLocationLoading(false);
    }
  };

  if (!watchPublishToEbay) return null;

  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
        🧾 eBay Business Policies
        {isEbaySettingsComplete && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
      </h3>
      <p className="text-sm text-gray-600">Select your eBay business policies and inventory location</p>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="fulfillmentPolicyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Fulfillment Policy
                {isFulfillmentLoading && (
                  <span className="ml-2 text-sm text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  </span>
                )}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                disabled={isFulfillmentLoading}
                onOpenChange={(open) => {
                  if (open && !fulfillmentLoaded && !isFulfillmentLoading) {
                    loadFulfillmentPolicies();
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        isFulfillmentLoading 
                          ? "Loading policies..." 
                          : ebayFulfillmentPolicies.length === 0 && fulfillmentLoaded
                            ? "No policies available - check eBay setup"
                            : "Click to load fulfillment policies"
                      } 
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isFulfillmentLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                        Loading policies...
                      </div>
                    </SelectItem>
                  ) : ebayFulfillmentPolicies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {fulfillmentLoaded ? "No fulfillment policies found" : "Click to load policies"}
                    </SelectItem>
                  ) : (
                    ebayFulfillmentPolicies.map((policy) => (
                      <SelectItem key={policy.policyId} value={policy.policyId}>
                        {policy.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="paymentPolicyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Payment Policy
                {isPaymentLoading && (
                  <span className="ml-2 text-sm text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  </span>
                )}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                disabled={isPaymentLoading}
                onOpenChange={(open) => {
                  if (open && !paymentLoaded && !isPaymentLoading) {
                    loadPaymentPolicies();
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        isPaymentLoading 
                          ? "Loading policies..." 
                          : ebayPaymentPolicies.length === 0 && paymentLoaded
                            ? "No policies available - check eBay setup"
                            : "Click to load payment policies"
                      } 
                    />
                  </SelectTrigger>
                </FormControl>
                
                <SelectContent>
                  {isPaymentLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                        Loading policies...
                      </div>
                    </SelectItem>
                  ) : ebayPaymentPolicies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {paymentLoaded ? "No payment policies found" : "Click to load policies"}
                    </SelectItem>
                  ) : (
                    ebayPaymentPolicies.map((policy) => (
                      <SelectItem key={policy.policyId} value={policy.policyId}>
                        {policy.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="returnPolicyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Return Policy
                {isReturnLoading && (
                  <span className="ml-2 text-sm text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  </span>
                )}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                disabled={isReturnLoading}
                onOpenChange={(open) => {
                  if (open && !returnLoaded && !isReturnLoading) {
                    loadReturnPolicies();
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        isReturnLoading 
                          ? "Loading policies..." 
                          : ebayReturnPolicies.length === 0 && returnLoaded
                            ? "No policies available - check eBay setup"
                            : "Click to load return policies"
                      } 
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isReturnLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                        Loading policies...
                      </div>
                    </SelectItem>
                  ) : ebayReturnPolicies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {returnLoaded ? "No return policies found" : "Click to load policies"}
                    </SelectItem>
                  ) : (
                    ebayReturnPolicies.map((policy) => (
                      <SelectItem key={policy.policyId} value={policy.policyId}>
                        {policy.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="merchantLocationKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Inventory Location
                {isLocationLoading && (
                  <span className="ml-2 text-sm text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  </span>
                )}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                disabled={isLocationLoading}
                onOpenChange={(open) => {
                  if (open && !locationLoaded && !isLocationLoading) {
                    loadInventoryLocations();
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        isLocationLoading 
                          ? "Loading locations..." 
                          : ebayInventoryLocations.length === 0 && locationLoaded
                            ? "No locations available - check eBay setup"
                            : "Click to load inventory locations"
                      } 
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLocationLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                        Loading locations...
                      </div>
                    </SelectItem>
                  ) : ebayInventoryLocations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {locationLoaded ? "No inventory locations found" : "Click to load locations"}
                    </SelectItem>
                  ) : (
                    ebayInventoryLocations.map((location) => (
                      <SelectItem key={location.locationKey} value={location.locationKey}>
                        {location.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 