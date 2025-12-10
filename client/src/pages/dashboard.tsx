import { useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import EbayQuickConnect from "@/components/ebay-quick-connect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Package, 
  DollarSign, 
  BarChart3,
  Plus,
  Eye,
  Edit,
  ArrowUpRight,
  ShoppingCart
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoggedIn, isLoading } = useRequireAuth();

  const { data: listings = [] } = useQuery<any[]>({
    queryKey: ["/api/listings"],
    queryFn: async () => {
      const response = await fetch("/api/listings");
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
    enabled: isLoggedIn,
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not logged in (will redirect via useRequireAuth)
  if (!isLoggedIn) {
    return null;
  }

  // Calculate stats with improved SEO scoring
  const totalListings = listings.length;
  const liveListings = listings.filter(l => l.status === 'published').length;
  const draftListings = listings.filter(l => l.status === 'draft').length;
  
  // Calculate SEO score for each listing dynamically
  const calculateSEOScore = (listing: any) => {
    let score = 0;
    
    // Title optimization (30 points)
    if (listing.generatedTitle) {
      if (listing.generatedTitle.length >= 40 && listing.generatedTitle.length <= 80) {
        score += 30;
      } else if (listing.generatedTitle.length >= 20) {
        score += 20;
      } else {
        score += 10;
      }
    }
    
    // Description quality (25 points)
    if (listing.generatedDescription) {
      if (listing.generatedDescription.length >= 200) {
        score += 25;
      } else if (listing.generatedDescription.length >= 100) {
        score += 15;
      } else {
        score += 5;
      }
    }
    
    // Category (15 points)
    if (listing.categoryId || listing.category) score += 15;
    
    // Price (10 points)
    if (listing.price && listing.price > 0) score += 10;
    
    // Images (10 points)
    if (listing.imageUrls && listing.imageUrls.length > 0) {
      score += Math.min(listing.imageUrls.length * 2, 10);
    }
    
    // Features/Keywords (10 points)
    if (listing.features && listing.features.length > 50) score += 10;
    
    return Math.min(score, 100);
  };
  
  const averageSeoScore = listings.length > 0 
    ? Math.round(listings.reduce((acc, listing) => acc + calculateSEOScore(listing), 0) / listings.length)
    : 0;

  const statsCards = [
    {
      title: "Total Listings",
      value: totalListings,
      icon: Package,
      color: "blue",
      change: "+12%",
    },
    {
      title: "Live Listings", 
      value: liveListings,
      icon: CheckCircle,
      color: "green",
      change: "+5%",
    },
    {
      title: "Average SEO Score",
      value: `${averageSeoScore}/100`,
      icon: BarChart3,
      color: "purple",
      change: "+8%",
    },
    {
      title: "Pending Items",
      value: draftListings,
      icon: Clock,
      color: "orange",
      change: "-2%",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your listings today.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <EbayQuickConnect />
              <Link href="/create">
                <Button className="bg-primary hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <Card key={index} className="card-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-100' :
                      stat.color === 'green' ? 'bg-green-100' :
                      stat.color === 'purple' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      <stat.icon className={`w-6 h-6 ${
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'green' ? 'text-green-600' :
                        stat.color === 'purple' ? 'text-purple-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* SEO Score History Chart */}
            <div className="lg:col-span-2">
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    SEO Score History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {[65, 72, 68, 78, 85, 82, 88, 91, 87, 93, 89, 95].map((score, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm transition-all hover:from-blue-600 hover:to-blue-400 cursor-pointer"
                          style={{ height: `${(score / 100) * 200}px` }}
                          title={`Score: ${score}`}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">
                          {index < 6 ? `${index + 1}` : `${index - 5}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">Last 12 listings performance</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/create">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-3" />
                      Create New Listing
                    </Button>
                  </Link>
                  <Link href="/listings">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="w-4 h-4 mr-3" />
                      View All Listings
                    </Button>
                  </Link>
                  <Link href="/ebay-integration">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="w-4 h-4 mr-3" />
                      eBay Integration
                    </Button>
                  </Link>
                  <Link href="/create-ebay-listing">
                    <Button variant="outline" className="w-full justify-start bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                      <Plus className="w-4 h-4 mr-3" />
                      Create eBay Listing
                    </Button>
                  </Link>
                  <Link href="/seo">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-3" />
                      SEO Analysis
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-3" />
                      Pricing Tools
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Performing Listings */}
          <Card className="card-shadow mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Top 5 Performing Listings
              </CardTitle>
              <Link href="/listings">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-500 mb-6">Create your first listing to get started!</p>
                  <Link href="/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">SEO Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.slice(0, 5).map((listing: any) => (
                        <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{listing.productName}</p>
                                <p className="text-sm text-gray-500">${listing.price}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              listing.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : listing.status === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {listing.status === 'published' ? 'Live' : 
                               listing.status === 'error' ? 'Error' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-200 rounded-full mr-3">
                                <div 
                                  className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                                  style={{ width: `${calculateSEOScore(listing)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{calculateSEOScore(listing)}/100</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Link href={`/listing/${listing.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
