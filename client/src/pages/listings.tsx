import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, formatCurrency, truncateText } from "@/lib/utils";
import { 
  Trash2, 
  ExternalLink, 
  Edit, 
  Search, 
  Plus, 
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Eye,
  RefreshCw,
  ShoppingCart
} from "lucide-react";

export default function Listings() {
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  if (!isLoggedIn) {
    window.location.href = "/login";
    return null;
  }

  const { data: listings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/listings"],
    queryFn: async () => {
      const response = await fetch("/api/listings");
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Success!",
        description: "Listing deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => apiRequest("DELETE", `/api/listings/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      setSelectedItems([]);
      toast({
        title: "Success!",
        description: `${selectedItems.length} listings deleted successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listings",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/listings/${id}/publish`);
      return response.json();
    },
    onSuccess: (data) => {
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

  // Filter listings based on search and filters
  const filteredListings = listings.filter((listing: any) => {
    const matchesSearch = listing.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.generatedTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || listing.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: listings.length,
    published: listings.filter((l: any) => l.status === "published").length,
    draft: listings.filter((l: any) => l.status === "draft").length,
    errors: listings.filter((l: any) => l.status === "error").length,
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

  const getSEOScore = (listing: any) => {
    // Mock SEO score calculation
    let score = 50;
    if (listing.generatedTitle?.length >= 40) score += 15;
    if (listing.generatedDescription?.length >= 200) score += 15;
    if (listing.category) score += 10;
    if (listing.price) score += 10;
    
    const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";
    const grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";
    
    return { score, color, grade };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Listings</h1>
              <p className="text-gray-600 mt-1">Manage and track your eBay listings</p>
            </div>
            
            <Button onClick={() => window.location.href = "/create"} className="bg-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Listing
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Errors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="card-shadow mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search listings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="collectibles">Collectibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} selected
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => bulkDeleteMutation.mutate(selectedItems)}
                      disabled={bulkDeleteMutation.isPending}
                    >
                      {bulkDeleteMutation.isPending ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Trash2 className="w-3 h-3 mr-2" />
                      )}
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listings Table */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Listings ({filteredListings.length})</span>
                <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/listings"] })}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "Create your first listing to get started"}
                  </p>
                  <Button onClick={() => window.location.href = "/create"}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedItems.length === filteredListings.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems(filteredListings.map((l: any) => l.id));
                              } else {
                                setSelectedItems([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>SEO Score</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>eBay ID</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredListings.map((listing: any) => {
                        const seoScore = getSEOScore(listing);
                        return (
                          <TableRow key={listing.id} className={selectedItems.includes(listing.id) ? "bg-blue-50" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.includes(listing.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedItems([...selectedItems, listing.id]);
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== listing.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {truncateText(listing.productName, 30)}
                                </p>
                                {listing.generatedTitle && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {truncateText(listing.generatedTitle, 40)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {listing.category || "Uncategorized"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(listing.price)}
                            </TableCell>
                            <TableCell>{getStatusBadge(listing.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className={`font-medium ${seoScore.color}`}>
                                  {seoScore.score}%
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`ml-2 ${seoScore.color} border-current`}
                                >
                                  Grade {seoScore.grade}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(listing.createdAt)}
                            </TableCell>
                            <TableCell>
                              {listing.ebayItemId ? (
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-600 mr-2">
                                    {listing.ebayItemId}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`https://www.ebay.com/itm/${listing.ebayItemId}`, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    window.location.href = `/listing/${listing.id}`;
                                  }}
                                  title="View Details"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                
                                {listing.status === "draft" && (
                                  <Button
                                    size="sm"
                                    onClick={() => publishMutation.mutate(listing.id)}
                                    disabled={publishMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {publishMutation.isPending ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    ) : (
                                      <>
                                        <ShoppingCart className="h-3 w-3 mr-1" />
                                        Publish to eBay
                                      </>
                                    )}
                                  </Button>
                                )}
                                
                                {listing.status === "published" && !listing.ebayItemId && (
                                  <Button
                                    size="sm"
                                    onClick={() => publishMutation.mutate(listing.id)}
                                    disabled={publishMutation.isPending}
                                    variant="outline"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                  >
                                    {publishMutation.isPending ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                    ) : (
                                      <>
                                        <ShoppingCart className="h-3 w-3 mr-1" />
                                        Publish to eBay
                                      </>
                                    )}
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    window.location.href = `/editor/${listing.id}`;
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate(listing.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
