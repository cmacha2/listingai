import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle,
  DollarSign,
  RefreshCw
} from "lucide-react";

interface EbayFees {
  insertionFee?: number;
  finalValueFee?: number;
  listingUpgradeFee?: number;
  totalFees?: number;
}

interface EbayInfoCardProps {
  isPublishedOnEbay: boolean;
  ebayStatus?: string;
  ebayUrl?: string;
  ebayItemId?: string;
  ebayOfferId?: string;
  ebayWarnings?: string[];
  ebayFees?: EbayFees;
  totalViews?: number;
  totalWatchers?: number;
  totalQuestions?: number;
  publishedAt?: string;
  lastSyncedAt?: string;
  canViewOnEbay?: boolean;
  onSync?: () => void;
  onViewOnEbay?: () => void;
  className?: string;
}

export function EbayInfoCard({
  isPublishedOnEbay,
  ebayStatus,
  ebayUrl,
  ebayItemId,
  ebayOfferId,
  ebayWarnings = [],
  ebayFees = {},
  totalViews = 0,
  totalWatchers = 0,
  totalQuestions = 0,
  publishedAt,
  lastSyncedAt,
  canViewOnEbay = false,
  onSync,
  onViewOnEbay,
  className = ""
}: EbayInfoCardProps) {
  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return <Badge variant="default" className="bg-green-500">Published</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      case 'sold':
        return <Badge variant="default" className="bg-blue-500">Sold</Badge>;
      case 'unpublished':
        return <Badge variant="outline">Unpublished</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0.00';
    return `$${amount.toFixed(2)}`;
  };

  if (!isPublishedOnEbay) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            eBay Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">This listing has not been published to eBay yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            eBay Listing
          </CardTitle>
          {getStatusBadge(ebayStatus)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* eBay IDs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {ebayItemId && (
            <div>
              <span className="font-medium text-gray-600">Item ID:</span>
              <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                {ebayItemId}
              </p>
            </div>
          )}
          {ebayOfferId && (
            <div>
              <span className="font-medium text-gray-600">Offer ID:</span>
              <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                {ebayOfferId}
              </p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Eye className="h-4 w-4" />
              <span className="font-semibold">{totalViews}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Views</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <Heart className="h-4 w-4" />
              <span className="font-semibold">{totalWatchers}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Watchers</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold">{totalQuestions}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Questions</p>
          </div>
        </div>

        {/* eBay Fees */}
        {ebayFees.totalFees && ebayFees.totalFees > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              eBay Fees
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              {ebayFees.insertionFee && (
                <div className="flex justify-between">
                  <span>Insertion Fee:</span>
                  <span>{formatCurrency(ebayFees.insertionFee)}</span>
                </div>
              )}
              {ebayFees.finalValueFee && (
                <div className="flex justify-between">
                  <span>Final Value Fee:</span>
                  <span>{formatCurrency(ebayFees.finalValueFee)}</span>
                </div>
              )}
              {ebayFees.listingUpgradeFee && (
                <div className="flex justify-between">
                  <span>Upgrade Fee:</span>
                  <span>{formatCurrency(ebayFees.listingUpgradeFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Total Fees:</span>
                <span>{formatCurrency(ebayFees.totalFees)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {ebayWarnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              eBay Warnings
            </h4>
            <div className="space-y-1">
              {ebayWarnings.map((warning, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 p-2 rounded text-sm">
                  {warning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-2 text-sm text-gray-600">
          {publishedAt && (
            <div className="flex justify-between">
              <span>Published:</span>
              <span>{formatDate(publishedAt)}</span>
            </div>
          )}
          {lastSyncedAt && (
            <div className="flex justify-between">
              <span>Last Synced:</span>
              <span>{formatDate(lastSyncedAt)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {canViewOnEbay && ebayUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onViewOnEbay) {
                  onViewOnEbay();
                } else {
                  window.open(ebayUrl, '_blank');
                }
              }}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on eBay
            </Button>
          )}
          
          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 