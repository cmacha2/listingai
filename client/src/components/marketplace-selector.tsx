import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, AlertCircle } from "lucide-react";

export interface EbayMarketplace {
  id: string;           // EBAY_US, EBAY_GB, etc.
  country: string;      // US, GB, DE, FR, etc.
  name: string;         // "United States", "United Kingdom", etc.
  currency: string;     // USD, GBP, EUR, etc.
  language: string;     // en-US, en-GB, de-DE, fr-FR, etc.
  flag: string;         // Country flag emoji
  domain: string;       // ebay.com, ebay.co.uk, etc.
  isSupported: boolean; // Whether we support this marketplace
}

export const EBAY_MARKETPLACES: EbayMarketplace[] = [
  {
    id: "EBAY_US",
    country: "US",
    name: "United States",
    currency: "USD",
    language: "en-US",
    flag: "🇺🇸",
    domain: "ebay.com",
    isSupported: true,
  },
  {
    id: "EBAY_GB",
    country: "GB", 
    name: "United Kingdom",
    currency: "GBP",
    language: "en-GB",
    flag: "🇬🇧",
    domain: "ebay.co.uk",
    isSupported: true,
  },
  {
    id: "EBAY_DE",
    country: "DE",
    name: "Germany",
    currency: "EUR",
    language: "de-DE",
    flag: "🇩🇪",
    domain: "ebay.de",
    isSupported: true,
  },
  {
    id: "EBAY_FR",
    country: "FR",
    name: "France",
    currency: "EUR",
    language: "fr-FR",
    flag: "🇫🇷",
    domain: "ebay.fr",
    isSupported: true,
  },
  {
    id: "EBAY_CA",
    country: "CA",
    name: "Canada",
    currency: "CAD",
    language: "en-CA",
    flag: "🇨🇦",
    domain: "ebay.ca",
    isSupported: true,
  },
  {
    id: "EBAY_AU",
    country: "AU",
    name: "Australia",
    currency: "AUD",
    language: "en-AU",
    flag: "🇦🇺",
    domain: "ebay.com.au",
    isSupported: true,
  },
  {
    id: "EBAY_IT",
    country: "IT",
    name: "Italy",
    currency: "EUR",
    language: "it-IT",
    flag: "🇮🇹",
    domain: "ebay.it",
    isSupported: false,
  },
  {
    id: "EBAY_ES",
    country: "ES",
    name: "Spain",
    currency: "EUR",
    language: "es-ES",
    flag: "🇪🇸",
    domain: "ebay.es",
    isSupported: false,
  },
];

interface MarketplaceSelectorProps {
  selectedMarketplace?: string;
  onMarketplaceChange: (marketplace: EbayMarketplace) => void;
  disabled?: boolean;
  showDescription?: boolean;
}

export default function MarketplaceSelector({ 
  selectedMarketplace, 
  onMarketplaceChange, 
  disabled = false,
  showDescription = true 
}: MarketplaceSelectorProps) {
  const [selectedValue, setSelectedValue] = useState<string>(selectedMarketplace || "");

  const handleMarketplaceChange = (marketplaceId: string) => {
    const marketplace = EBAY_MARKETPLACES.find(m => m.id === marketplaceId);
    if (marketplace) {
      setSelectedValue(marketplaceId);
      onMarketplaceChange(marketplace);
    }
  };

  const selectedMarketplaceData = EBAY_MARKETPLACES.find(m => m.id === selectedValue);
  const supportedMarketplaces = EBAY_MARKETPLACES.filter(m => m.isSupported);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          eBay Marketplace Selection
        </CardTitle>
        {showDescription && (
          <p className="text-sm text-gray-600">
            Select the country where your eBay account is registered. This determines which eBay marketplace you'll connect to and sell on.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Your eBay Marketplace
          </label>
          <Select 
            value={selectedValue} 
            onValueChange={handleMarketplaceChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your eBay marketplace..." />
            </SelectTrigger>
            <SelectContent>
              {supportedMarketplaces.map((marketplace) => (
                <SelectItem key={marketplace.id} value={marketplace.id}>
                  <div className="flex items-center gap-2">
                    <span>{marketplace.flag}</span>
                    <span>{marketplace.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {marketplace.currency}
                    </Badge>
                    <span className="text-gray-500 text-sm">({marketplace.domain})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Marketplace Preview */}
        {selectedMarketplaceData && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{selectedMarketplaceData.flag}</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedMarketplaceData.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedMarketplaceData.domain}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="secondary" className="text-sm">
                  {selectedMarketplaceData.currency}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Marketplace ID:</span>
                <span className="ml-2 font-mono text-blue-600">
                  {selectedMarketplaceData.id}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Language:</span>
                <span className="ml-2">{selectedMarketplaceData.language}</span>
              </div>
            </div>
          </div>
        )}

        {/* Unsupported Marketplaces Notice */}
        {EBAY_MARKETPLACES.some(m => !m.isSupported) && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium">More marketplaces coming soon!</p>
                <p className="text-amber-700 mt-1">
                  We currently support the most popular eBay marketplaces. 
                  Additional regions will be added based on demand.
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {EBAY_MARKETPLACES.filter(m => !m.isSupported).map(marketplace => (
                    <Badge key={marketplace.id} variant="outline" className="text-xs">
                      {marketplace.flag} {marketplace.name}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">+ more</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get marketplace by ID
export function getMarketplaceById(id: string): EbayMarketplace | undefined {
  return EBAY_MARKETPLACES.find(m => m.id === id);
}

// Helper function to get marketplace by country
export function getMarketplaceByCountry(country: string): EbayMarketplace | undefined {
  return EBAY_MARKETPLACES.find(m => m.country === country);
}

// Helper function to check if marketplace is supported
export function isMarketplaceSupported(id: string): boolean {
  const marketplace = getMarketplaceById(id);
  return marketplace?.isSupported || false;
} 