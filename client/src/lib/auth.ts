import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  isEbayConnected: boolean;
  ebayAccessToken?: string | null;
  ebayRefreshToken?: string | null;
  ebayTokenExpiry?: Date | null;
  ebayUserId?: string | null;
  ebayUserName?: string | null;
  
  // Marketplace selection and configuration
  selectedMarketplace?: string | null;     // EBAY_US, EBAY_GB, EBAY_DE, etc.
  ebayMarketplaceCountry?: string | null;  // US, GB, DE, FR, etc.
  ebayMarketplaceName?: string | null;     // "United States", "United Kingdom", etc.
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const hasInitializedRef = useRef(false);

  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (!response.ok) {
          return null;
        }
        const data = await response.json();
        return data.user;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: true, // Allow initial mount refetch
    refetchOnReconnect: false,
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
  });

  // Initialize auth check only once on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Only refetch if we don't have any cached data and haven't checked yet
      const cachedData = queryClient.getQueryData(["/api/auth/me"]);
      if (cachedData === undefined) {
        refetch();
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      setLocation("/dashboard");
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; name: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", userData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      setLocation("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      hasInitializedRef.current = false; // Reset for potential re-login
      setLocation("/");
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggedIn: !!user,
    refetchAuth: refetch,
  };
}

// Hook to require authentication and handle redirects properly
export function useRequireAuth() {
  const { user, isLoading, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setLocation("/login");
    }
  }, [isLoading, isLoggedIn, setLocation]);

  return {
    user,
    isLoading,
    isLoggedIn,
  };
}

// Hook to redirect if already logged in (for login/signup pages)
export function useRedirectIfLoggedIn() {
  const { isLoading, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      setLocation("/dashboard");
    }
  }, [isLoading, isLoggedIn, setLocation]);

  return {
    isLoading,
    isLoggedIn,
  };
}
