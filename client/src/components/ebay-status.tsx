import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  Unlink
} from "lucide-react";

interface EbayStatus {
  connected: boolean;
  tokenValid?: boolean;
  connectionWorking?: boolean;
  expiringSoon?: boolean;
  expiresAt?: string;
  timeLeftMinutes?: number;
  hasRefreshToken?: boolean;
  tokenType?: string;
  status?: string;
  connectionTestError?: string;
  userProfile?: {
    username: string;
    userId: string;
    marketplace: string;
    email?: string;
    accountType?: string;
    inventoryItems?: number;
    hasActivePolicies?: boolean;
    readyToPublish?: boolean;
    note?: string;
  } | null;
  message?: string;
}

export default function EbayStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch eBay connection status
  const { data: status, isLoading, refetch } = useQuery<EbayStatus>({
    queryKey: ["/api/ebay/status"],
    queryFn: async () => {
      const response = await fetch("/api/ebay/status");
      if (!response.ok) {
        throw new Error("Failed to fetch eBay status");
      }
      return response.json();
    },
    refetchInterval: (query) => query.state.data?.connected ? 60000 : 10000, // Faster refetch when not connected
  });

  // Listen for popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'EBAY_OAUTH_SUCCESS') {
        setIsConnecting(false);
        refetch(); // Immediately refetch status
        toast({
          title: "¡eBay Connected! 🎉",
          description: "Your eBay account has been successfully connected.",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetch, toast]);

  // Mutation for initiating OAuth flow
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ebay/auth", { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to initiate eBay OAuth");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsConnecting(true);
      
      // Open OAuth popup window
      const popup = window.open(
        data.authUrl, 
        "ebay-oauth", 
        "width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
      );
      
      if (!popup) {
        setIsConnecting(false);
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setTimeout(() => {
            if (isConnecting) {
              setIsConnecting(false);
              // Don't show error if user just closed popup
              refetch(); // Check if connection was successful anyway
            }
          }, 1000);
        }
      }, 1000);
    },
    onError: (error: any) => {
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to start eBay OAuth flow",
        variant: "destructive",
      });
    },
  });

  // Mutation for refreshing token
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ebay/refresh", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to refresh eBay token");
      }
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Token Refreshed",
        description: "Your eBay access token has been renewed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh eBay token",
        variant: "destructive",
      });
    },
  });

  // Mutation for disconnecting
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ebay/disconnect", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to disconnect eBay account");
      }
      return response.json();
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "eBay Disconnected",
        description: "Your eBay account has been disconnected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect eBay account",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect your eBay account?")) {
      disconnectMutation.mutate();
    }
  };

  const formatTimeLeft = (minutes: number): string => {
    if (minutes < 0) return "Expired";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Helper functions for status display
  const getStatusIcon = () => {
    if (!status?.connected) return XCircle;
    if (status.tokenValid) {
      if (status.expiringSoon) return Clock;
      return CheckCircle;
    }
    return AlertTriangle;
  };

  const getStatusColor = () => {
    if (!status?.connected) return "bg-gray-100 text-gray-700";
    if (status.tokenValid) {
      if (status.expiringSoon) return "bg-yellow-100 text-yellow-700";
      return "bg-green-100 text-green-700";
    }
    return "bg-red-100 text-red-700";
  };

  const getStatusText = () => {
    if (!status?.connected) return "Not Connected";
    if (status.tokenValid) {
      if (status.expiringSoon) return "Expiring Soon";
      return "Connected";
    }
    return "Token Expired";
  };

  const StatusIcon = getStatusIcon();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Checking eBay status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <StatusIcon className="w-5 h-5" />
            <span>eBay Integration</span>
          </div>
          <Badge 
            variant="secondary" 
            className={getStatusColor()}
          >
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {!status?.connected ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Connect your eBay account to enable listing publishing and management.
            </p>
            <Button 
              onClick={handleConnect}
              disabled={connectMutation.isPending || isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect eBay Account
                </>
              )}
            </Button>
            {isConnecting && (
              <p className="text-xs text-gray-500 text-center">
                Please complete the authorization in the popup window
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Store Information */}
            {status.userProfile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-800">
                      ✅ {status.userProfile.username}
                    </div>
                    <div className="text-xs text-green-600">
                      {status.userProfile.marketplace} • {status.userProfile.accountType || 'Seller Account'}
                    </div>
                    {status.userProfile.inventoryItems !== undefined && (
                      <div className="text-xs text-green-600 mt-1">
                        📦 {status.userProfile.inventoryItems === 0 
                          ? "Ready to create your first listing" 
                          : `${status.userProfile.inventoryItems} items in inventory`}
                      </div>
                    )}
                    {status.userProfile.readyToPublish && (
                      <div className="text-xs text-green-600">
                        🚀 Ready to publish new listings
                      </div>
                    )}
                    {status.userProfile.note && (
                      <div className="text-xs text-green-600 italic">
                        💡 {status.userProfile.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Token Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Token Status:</span>
                <span className={
                  status.tokenValid ? 
                    "text-green-600 font-medium" : 
                    "text-red-600 font-medium"
                }>
                  {status.tokenValid ? "Valid" : "Expired"}
                </span>
              </div>
              
              {status.expiresAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span className={status.expiringSoon ? "text-yellow-600" : "text-gray-900"}>
                    {status.timeLeftMinutes !== undefined ? 
                      formatTimeLeft(status.timeLeftMinutes) : 
                      new Date(status.expiresAt).toLocaleString()
                    }
                  </span>
                </div>
              )}

              {status.hasRefreshToken && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Auto-Refresh:</span>
                  <span className="text-green-600">Available</span>
                </div>
              )}

              {/* Show connection test info only if there's an issue and token is valid */}
              {status.tokenValid && !status.connectionWorking && status.connectionTestError && (
                <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                  <div className="font-medium">Connection Test Warning:</div>
                  <div>API test failed, but token is valid. This may be temporary.</div>
                </div>
              )}
            </div>

            {/* Warning for expiring token */}
            {status.expiringSoon && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Token expires soon. 
                    {status.hasRefreshToken ? " It will be auto-renewed." : " Manual reconnection required."}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {status.hasRefreshToken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshMutation.isPending}
                  className="flex-1"
                >
                  {refreshMutation.isPending ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                className="flex-1"
              >
                {disconnectMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="w-3 h-3 mr-1" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>

            {/* Reconnect button if token is invalid */}
            {(!status.tokenValid || !status.connectionWorking) && !status.hasRefreshToken && (
              <Button 
                onClick={handleConnect}
                disabled={connectMutation.isPending || isConnecting}
                variant="default"
                size="sm"
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Reconnect eBay
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 