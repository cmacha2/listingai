import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  AlertTriangle, 
  Unlink,
  RefreshCw,
  Settings,
  Globe
} from "lucide-react";
import MarketplaceSelector, { 
  type EbayMarketplace, 
  getMarketplaceById,
  EBAY_MARKETPLACES 
} from "./marketplace-selector";

interface EbayIntegrationStatus {
  isConnected: boolean;
  marketplace?: string;
  marketplaceCountry?: string;
  marketplaceName?: string;
  lastSync?: string;
  userName?: string;
  userId?: string;
}

export default function EbayIntegrationDashboard() {
  const { user, refetchAuth } = useAuth();
  const [selectedMarketplace, setSelectedMarketplace] = useState<EbayMarketplace | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showMarketplaceSelector, setShowMarketplaceSelector] = useState(false);

  // Initialize with user's current marketplace if connected
  useEffect(() => {
    if (user?.selectedMarketplace) {
      const marketplace = getMarketplaceById(user.selectedMarketplace);
      if (marketplace) {
        setSelectedMarketplace(marketplace);
      }
    }
  }, [user]);

  const integrationStatus: EbayIntegrationStatus = {
    isConnected: user?.isEbayConnected || false,
    marketplace: user?.selectedMarketplace ?? undefined,
    marketplaceCountry: user?.ebayMarketplaceCountry ?? undefined,
    marketplaceName: user?.ebayMarketplaceName ?? undefined,
    userName: user?.ebayUserName ?? undefined,
    userId: user?.ebayUserId ?? undefined,
  };

  const handleMarketplaceChange = async (marketplace: EbayMarketplace) => {
    setSelectedMarketplace(marketplace);
    setConnectionError(null);

    // Save marketplace selection to backend
    try {
      const response = await fetch('/api/user/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedMarketplace: marketplace.id,
          ebayMarketplaceCountry: marketplace.country,
          ebayMarketplaceName: marketplace.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save marketplace selection');
      }

      // Refresh user data
      await refetchAuth();
    } catch (error) {
      console.error('Failed to save marketplace:', error);
      setConnectionError('Failed to save marketplace selection. Please try again.');
    }
  };

  const handleConnect = async () => {
    if (!selectedMarketplace) {
      alert('Please select a marketplace first');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Use the new marketplace-aware POST endpoint
      const response = await fetch('/api/ebay/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketplace: selectedMarketplace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate eBay connection');
      }

      const data = await response.json();
      
      console.log('🚀 Opening eBay OAuth window for marketplace:', selectedMarketplace);
      
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
          console.log('✅ eBay OAuth completed successfully');
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          
          // Refresh user data to get updated eBay connection status
          refetchAuth();
          
          setConnectionError('eBay account connected successfully!');
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
      console.error('❌ eBay connection error:', error);
      setConnectionError(error.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your eBay account? This will stop all eBay integrations.')) {
      return;
    }

    setIsDisconnecting(true);
    setConnectionError(null);

    try {
      const response = await fetch('/api/ebay/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect eBay account');
      }

      // Refresh user data
      await refetchAuth();
      setShowMarketplaceSelector(false);
    } catch (error) {
      console.error('eBay disconnection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to disconnect eBay account');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleChangeMarketplace = () => {
    setShowMarketplaceSelector(true);
  };

  const getCurrentMarketplace = () => {
    if (integrationStatus.marketplace) {
      return getMarketplaceById(integrationStatus.marketplace);
    }
    return null;
  };

  const currentMarketplace = getCurrentMarketplace();

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            eBay Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {integrationStatus.isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">
                  {integrationStatus.isConnected ? 'Connected' : 'Not Connected'}
                </p>
                {integrationStatus.isConnected && integrationStatus.userName && (
                  <p className="text-sm text-gray-600">
                    Connected as: {integrationStatus.userName}
                  </p>
                )}
              </div>
            </div>
            
            {integrationStatus.isConnected && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          {/* Current Marketplace Info */}
          {integrationStatus.isConnected && currentMarketplace && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentMarketplace.flag}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">
                    {currentMarketplace.name}
                  </h3>
                  <p className="text-sm text-green-700">
                    {currentMarketplace.domain} • {currentMarketplace.currency}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {currentMarketplace.id}
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!integrationStatus.isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting || !selectedMarketplace}
                className="flex items-center gap-2"
              >
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect to eBay'}
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={handleChangeMarketplace}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Change Marketplace
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-2"
                >
                  {isDisconnecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </>
            )}
          </div>

          {/* Connection Error */}
          {connectionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Marketplace Selector - Show when not connected or changing marketplace */}
      {(!integrationStatus.isConnected || showMarketplaceSelector) && (
        <div className="space-y-4">
          <MarketplaceSelector 
            selectedMarketplace={selectedMarketplace?.id}
            onMarketplaceChange={handleMarketplaceChange}
            disabled={isConnecting}
            showDescription={!integrationStatus.isConnected}
          />
          
          {showMarketplaceSelector && integrationStatus.isConnected && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Changing Marketplace</AlertTitle>
              <AlertDescription>
                To change your marketplace, you'll need to disconnect your current eBay account 
                and reconnect with the new marketplace selection. This will not affect your existing listings.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Requirements Notice */}
      {!integrationStatus.isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Before You Connect</AlertTitle>
          <AlertDescription>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>Make sure you have an active eBay seller account</li>
              <li>Select the marketplace where your eBay account is registered</li>
              <li>You'll be redirected to eBay to authorize the connection</li>
              <li>Once connected, you can start publishing listings to eBay</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Integration Benefits */}
      {integrationStatus.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Create listings with eBay-specific features
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Auto-publish to your eBay marketplace
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Manage inventory and pricing across platforms
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Use AI-powered listing optimization
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 