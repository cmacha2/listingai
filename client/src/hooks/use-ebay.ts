import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface EbayStatus {
  connected: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  tokenExpiry?: string;
  timeLeftMinutes: number;
}

export interface EbayProduct {
  itemId: string;
  title: string;
  price?: {
    value: string;
    currency: string;
  };
  condition?: string;
  image?: {
    imageUrl: string;
  };
  itemWebUrl?: string;
  shippingOptions?: Array<{
    shippingCost?: {
      value: string;
      currency: string;
    };
  }>;
  additionalImages?: Array<{
    imageUrl: string;
  }>;
}

export interface EbaySearchResult {
  itemSummaries?: EbayProduct[];
  total?: number;
  limit?: number;
  offset?: number;
}

export function useEbay() {
  const queryClient = useQueryClient();

  // Query for eBay connection status
  const {
    data: status,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<EbayStatus>({
    queryKey: ["/api/ebay/status"],
    queryFn: async () => {
      const response = await fetch("/api/ebay/status");
      if (!response.ok) {
        throw new Error("Failed to fetch eBay status");
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute to check token status
  });

  // Connect to eBay mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ebay/connect");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initiate eBay connection");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to eBay OAuth
      window.location.href = data.redirectUrl;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Refresh token mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ebay/refresh", {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to refresh eBay token");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("eBay token refreshed successfully!");
      refetchStatus();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ebay/disconnect", {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to disconnect eBay account");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("eBay account disconnected");
      refetchStatus();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Search products mutation
  const searchMutation = useMutation({
    mutationFn: async ({ query, limit = 20 }: { query: string; limit?: number }) => {
      const response = await fetch(
        `/api/ebay/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to search eBay products");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.data.total || 0} products`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Get product details mutation
  const getProductMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/ebay/item/${encodeURIComponent(itemId)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch product details");
      }
      return response.json();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handle OAuth callback
  const handleOauthCallback = useCallback(async (code: string) => {
    try {
      const response = await fetch(`/api/ebay/callback?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (response.ok) {
        toast.success("eBay account connected successfully!");
        refetchStatus();
        return true;
      } else {
        toast.error(data.message || "Failed to connect eBay account");
        return false;
      }
    } catch (error) {
      toast.error("Error connecting eBay account");
      console.error("eBay callback error:", error);
      return false;
    }
  }, [refetchStatus]);

  return {
    // Status
    status,
    isLoading: statusLoading,
    isConnected: status?.connected || false,
    
    // Actions
    connect: connectMutation.mutate,
    refresh: refreshMutation.mutate,
    disconnect: disconnectMutation.mutate,
    search: searchMutation.mutate,
    getProduct: getProductMutation.mutate,
    handleOauthCallback,
    
    // Loading states
    isConnecting: connectMutation.isPending,
    isRefreshing: refreshMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isSearching: searchMutation.isPending,
    isLoadingProduct: getProductMutation.isPending,
    
    // Data
    searchResults: searchMutation.data?.data,
    selectedProduct: getProductMutation.data?.data,
    
    // Utilities
    refetchStatus,
  };
} 