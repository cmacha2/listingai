import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatCurrency } from "@/lib/utils";
import { 
  ArrowLeft,
  Edit3,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  BarChart3,
  Package,
  DollarSign,
  Tag,
  Calendar,
  Eye,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

interface ListingData {
  id: number;
  productName: string;
  generatedTitle: string;
  generatedDescription: string;
  features: string;
  price: number;
  category: string;
  categoryId: string;
  condition: string;
  quantity: number;
  sku: string;
  status: string;
  seoScore: number;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  ebayItemId?: string;
  fulfillmentPolicyId?: string;
  paymentPolicyId?: string;
  returnPolicyId?: string;
  merchantLocationKey?: string;
  marketplaceId?: string;
  brand?: string;
  model?: string;
  packageWeight?: number;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  publishToEbay?: boolean;
}

export default function ListingDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ListingData>>({});

  if (!isLoggedIn) {
    window.location.href = "/login";
    return null;
  }

  const { data: listing, isLoading, error } = useQuery<ListingData>({
    queryKey: [`/api/listings/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<ListingData>) => {
      const response = await apiRequest("PUT", `/api/listings/${id}`, updatedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      setIsEditing(false);
      setEditedData({});
      toast({
        title: "Success!",
        description: "Listing updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/listings/${id}/publish`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Published!",
        description: `Listing published to eBay with ID: ${data.ebayItemId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish listing",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (listing && isEditing) {
      setEditedData(listing);
    }
  }, [listing, isEditing]);

  const handleSave = () => {
    updateMutation.mutate(editedData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const calculateSEOScore = (data: ListingData) => {
    let score = 0;
    let maxScore = 100;
    
    // Title optimization (30 points)
    if (data.generatedTitle) {
      if (data.generatedTitle.length >= 40 && data.generatedTitle.length <= 80) {
        score += 30;
      } else if (data.generatedTitle.length >= 20) {
        score += 20;
      } else {
        score += 10;
      }
    }
    
    // Description quality (25 points)
    if (data.generatedDescription) {
      if (data.generatedDescription.length >= 200) {
        score += 25;
      } else if (data.generatedDescription.length >= 100) {
        score += 15;
      } else {
        score += 5;
      }
    }
    
    // Category (15 points)
    if (data.categoryId) score += 15;
    
    // Price (10 points)
    if (data.price && data.price > 0) score += 10;
    
    // Images (10 points)
    if (data.imageUrls && data.imageUrls.length > 0) {
      score += Math.min(data.imageUrls.length * 2, 10);
    }
    
    // Features/Keywords (10 points)
    if (data.features && data.features.length > 50) score += 10;
    
    return Math.min(score, maxScore);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Published
        </Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Draft
        </Badge>;
      case "error":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSEOGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { grade: "D", color: "text-red-600", bg: "bg-red-100" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading listing details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-16">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
              <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been deleted.</p>
              <Button onClick={() => navigate("/listings")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentData = isEditing ? editedData : listing;
  const seoScore = calculateSEOScore(currentData as ListingData);
  const seoGrade = getSEOGrade(seoScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/listings")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{listing.productName}</h1>
                <p className="text-gray-600 mt-1">Listing #{listing.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusBadge(listing.status)}
              
              {!isEditing ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  {listing.status === "draft" && (
                    <Button 
                      onClick={() => publishMutation.mutate()}
                      disabled={publishMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {publishMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      Publish to eBay
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-primary text-white"
                  >
                    {updateMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="ebay">eBay Settings</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="productName">Product Name</Label>
                          {isEditing ? (
                            <Input
                              id="productName"
                              value={editedData.productName || ""}
                              onChange={(e) => setEditedData({...editedData, productName: e.target.value})}
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{listing.productName}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="price">Price</Label>
                          {isEditing ? (
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={editedData.price || ""}
                              onChange={(e) => setEditedData({...editedData, price: parseFloat(e.target.value)})}
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{formatCurrency(listing.price)}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="category">Category</Label>
                          {isEditing ? (
                            <Input
                              id="category"
                              value={editedData.category || ""}
                              onChange={(e) => setEditedData({...editedData, category: e.target.value})}
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{listing.category}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="condition">Condition</Label>
                          {isEditing ? (
                            <Input
                              id="condition"
                              value={editedData.condition || ""}
                              onChange={(e) => setEditedData({...editedData, condition: e.target.value})}
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{listing.condition}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          {isEditing ? (
                            <Input
                              id="quantity"
                              type="number"
                              value={editedData.quantity || ""}
                              onChange={(e) => setEditedData({...editedData, quantity: parseInt(e.target.value)})}
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{listing.quantity}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="sku">SKU</Label>
                          {isEditing ? (
                            <Input
                              id="sku"
                              value={editedData.sku || ""}
                              onChange={(e) => setEditedData({...editedData, sku: e.target.value})}
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{listing.sku}</p>
                          )}
                        </div>
                      </div>
                      
                      {(listing.brand || listing.model) && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="brand">Brand</Label>
                            {isEditing ? (
                              <Input
                                id="brand"
                                value={editedData.brand || ""}
                                onChange={(e) => setEditedData({...editedData, brand: e.target.value})}
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{listing.brand || "Not specified"}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="model">Model</Label>
                            {isEditing ? (
                              <Input
                                id="model"
                                value={editedData.model || ""}
                                onChange={(e) => setEditedData({...editedData, model: e.target.value})}
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{listing.model || "Not specified"}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="content" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="generatedTitle">eBay Title</Label>
                        {isEditing ? (
                          <Input
                            id="generatedTitle"
                            value={editedData.generatedTitle || ""}
                            onChange={(e) => setEditedData({...editedData, generatedTitle: e.target.value})}
                            maxLength={80}
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">{listing.generatedTitle}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {(currentData?.generatedTitle || "").length}/80 characters
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="generatedDescription">Description</Label>
                        {isEditing ? (
                          <Textarea
                            id="generatedDescription"
                            value={editedData.generatedDescription || ""}
                            onChange={(e) => setEditedData({...editedData, generatedDescription: e.target.value})}
                            rows={8}
                          />
                        ) : (
                          <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-md">
                            {listing.generatedDescription}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="features">Features</Label>
                        {isEditing ? (
                          <Textarea
                            id="features"
                            value={editedData.features || ""}
                            onChange={(e) => setEditedData({...editedData, features: e.target.value})}
                            rows={4}
                          />
                        ) : (
                          <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-md">
                            {listing.features}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="ebay" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>eBay Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category ID</Label>
                          <p className="mt-1 text-sm text-gray-900">{listing.categoryId || "Not set"}</p>
                        </div>
                        
                        <div>
                          <Label>Marketplace</Label>
                          <p className="mt-1 text-sm text-gray-900">{listing.marketplaceId || "EBAY_US"}</p>
                        </div>
                        
                        <div>
                          <Label>Fulfillment Policy</Label>
                          <p className="mt-1 text-sm text-gray-900">{listing.fulfillmentPolicyId || "Not set"}</p>
                        </div>
                        
                        <div>
                          <Label>Payment Policy</Label>
                          <p className="mt-1 text-sm text-gray-900">{listing.paymentPolicyId || "Not set"}</p>
                        </div>
                        
                        <div>
                          <Label>Return Policy</Label>
                          <p className="mt-1 text-sm text-gray-900">{listing.returnPolicyId || "Not set"}</p>
                        </div>
                        
                        <div>
                          <Label>Merchant Location</Label>
                          <p className="mt-1 text-sm text-gray-900">{listing.merchantLocationKey || "Not set"}</p>
                        </div>
                      </div>
                      
                      {listing.ebayItemId && (
                        <div>
                          <Label>eBay Item ID</Label>
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-gray-900 mr-2">{listing.ebayItemId}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://www.ebay.com/itm/${listing.ebayItemId}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="images" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {listing.imageUrls && listing.imageUrls.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {listing.imageUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Badge className="absolute top-2 left-2 bg-black/50 text-white">
                                {index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No images uploaded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* SEO Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    SEO Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${seoGrade.color} mb-2`}>
                      {seoScore}/100
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${seoGrade.bg} ${seoGrade.color}`}>
                      Grade: {seoGrade.grade}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div 
                        className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${seoScore}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium">{formatDate(listing.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">{formatDate(listing.updatedAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Images</span>
                    <span className="text-sm font-medium">{listing.imageUrls?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Title Length</span>
                    <span className="text-sm font-medium">{listing.generatedTitle?.length || 0}/80</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/create?duplicate=${listing.id}`)}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Duplicate Listing
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`/api/listings/${listing.id}/export`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  
                  {listing.ebayItemId && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open(`https://www.ebay.com/itm/${listing.ebayItemId}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View on eBay
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 