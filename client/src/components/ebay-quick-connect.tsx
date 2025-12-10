import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  RefreshCw,
  Unlink,
  AlertTriangle,
  Clock
} from "lucide-react";
import { EBAY_MARKETPLACES, type EbayMarketplace, getMarketplaceById } from "./marketplace-selector";

interface TokenStatus {
  connected: boolean;
  isValid?: boolean;
  isExpiringSoon?: boolean;
  timeLeftMinutes?: number;
  expiresAt?: string;
  hasRefreshToken?: boolean;
  message?: string;
}

export default function EbayQuickConnect() {
  const { user, refetchAuth } = useAuth();
  const { toast } = useToast();
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);

  // Initialize with user's current marketplace if connected
  useEffect(() => {
    if (user?.selectedMarketplace) {
      setSelectedMarketplace(user.selectedMarketplace);
    } else {
      setSelectedMarketplace("EBAY_US"); // Default to US
    }
  }, [user]);

  // Check token status when user is connected
  useEffect(() => {
    if (user?.isEbayConnected) {
      checkTokenStatus();
      // Check every 5 minutes
      const interval = setInterval(checkTokenStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setTokenStatus(null);
    }
  }, [user?.isEbayConnected]);

  const checkTokenStatus = async () => {
    try {
      const response = await fetch('/api/ebay/token-status');
      if (response.ok) {
        const status = await response.json();
        setTokenStatus(status);
      }
    } catch (error) {
      console.error('Failed to check token status:', error);
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/ebay/refresh-token', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Token Refreshed",
          description: `eBay token refreshed successfully. Valid for ${data.timeLeftMinutes} minutes.`,
        });
        await checkTokenStatus();
        await refetchAuth();
      } else {
        if (data.requiresReconnection) {
          toast({
            title: "Reconnection Required",
            description: data.message,
            variant: "destructive",
          });
          await refetchAuth();
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error: any) {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh eBay token",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const supportedMarketplaces = EBAY_MARKETPLACES.filter(m => m.isSupported);
  const currentMarketplace = getMarketplaceById(selectedMarketplace);

  const getTokenStatusBadge = () => {
    if (!tokenStatus || !tokenStatus.connected) return null;

    if (!tokenStatus.isValid) {
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    }

    if (tokenStatus.isExpiringSoon) {
      return (
        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expires in {tokenStatus.timeLeftMinutes}m
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="text-xs bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        Valid ({tokenStatus.timeLeftMinutes}m)
      </Badge>
    );
  };

  const handleMarketplaceChange = async (marketplaceId: string) => {
    setSelectedMarketplace(marketplaceId);
    const marketplace = getMarketplaceById(marketplaceId);
    
    if (marketplace && !user?.isEbayConnected) {
      // Save marketplace selection if not connected yet
      try {
        const response = await fetch('/api/user/marketplace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedMarketplace: marketplace.id,
            ebayMarketplaceCountry: marketplace.country,
            ebayMarketplaceName: marketplace.name,
          }),
        });

        if (response.ok) {
          await refetchAuth();
        }
      } catch (error) {
        console.error('Failed to save marketplace:', error);
      }
    }
  };

  const handleConnect = async () => {
    if (!currentMarketplace) {
      toast({
        title: "Error",
        description: "Please select a marketplace first",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Save marketplace selection first
      const marketplaceResponse = await fetch('/api/user/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedMarketplace: currentMarketplace.id,
          ebayMarketplaceCountry: currentMarketplace.country,
          ebayMarketplaceName: currentMarketplace.name,
        }),
      });

      if (!marketplaceResponse.ok) {
        throw new Error('Failed to save marketplace selection');
      }

      // Start OAuth flow
      const response = await fetch('/api/ebay/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketplace: currentMarketplace.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate eBay connection');
      }

      const data = await response.json();
      
      // Open popup window for OAuth
      const popup = window.open(
        data.authUrl,
        'ebayAuth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'EBAY_OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          refetchAuth();
          toast({
            title: "¡Connected!",
            description: `eBay account connected to ${currentMarketplace.name}`,
          });
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error: any) {
      console.error('eBay connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your eBay account?')) {
      return;
    }

    setIsDisconnecting(true);

    try {
      const response = await fetch('/api/ebay/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect eBay account');
      }

      await refetchAuth();
      toast({
        title: "Disconnected",
        description: "eBay account disconnected successfully",
      });
    } catch (error) {
      console.error('eBay disconnection error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to disconnect eBay account',
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Marketplace Selector */}
      <div className="flex items-center space-x-2">
        <Select 
          value={selectedMarketplace} 
          onValueChange={handleMarketplaceChange}
          disabled={isConnecting || isDisconnecting}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue>
              {currentMarketplace && (
                <div className="flex items-center gap-2">
                  <span>{currentMarketplace.flag}</span>
                  <span className="text-sm">{currentMarketplace.country}</span>
                  <Badge variant="outline" className="text-xs">{currentMarketplace.currency}</Badge>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedMarketplaces.map((marketplace) => (
              <SelectItem key={marketplace.id} value={marketplace.id}>
                <div className="flex items-center gap-2">
                  <span>{marketplace.flag}</span>
                  <span>{marketplace.name}</span>
                  <Badge variant="outline" className="text-xs">{marketplace.currency}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Connection Button */}
      {!user?.isEbayConnected ? (
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isConnecting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect eBay'}
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          {/* Connected Status with Token Info */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {currentMarketplace?.flag} Connected
            </span>
            {getTokenStatusBadge()}
          </div>
          
          {/* Refresh Token Button (if token is expiring or expired) */}
          {tokenStatus && (tokenStatus.isExpiringSoon || !tokenStatus.isValid) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshToken}
              disabled={isRefreshing}
              className="text-blue-600 hover:text-blue-700"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
          
          {/* Disconnect Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="text-gray-500 hover:text-red-600"
          >
            {isDisconnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Unlink className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 