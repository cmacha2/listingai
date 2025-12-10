import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Calendar, 
  Clock, 
  User,
  ArrowRight,
  BookOpen,
  Filter,
  Zap
} from "lucide-react";
import { blogApi, ArticleListItem } from "@/lib/api";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Get all blog posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['blog-posts', selectedCategory],
    queryFn: () => blogApi.getPosts({ 
      category: selectedCategory || undefined,
      limit: 50,
      sortBy: 'date',
      sortOrder: 'desc'
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get categories for filter
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogApi.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Search posts
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['blog-search', searchQuery],
    queryFn: () => blogApi.searchPosts(searchQuery, 20),
    enabled: searchQuery.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Determine which posts to show
  const displayPosts = searchQuery.length > 2 
    ? searchResults?.articles || []
    : postsData?.articles || [];

  const isLoading = searchQuery.length > 2 ? searchLoading : postsLoading;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Same as Landing Page */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <Link href="/">
                <span className="text-xl font-bold text-gray-900 cursor-pointer">ListingAI</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/blog">
                <Button variant="ghost" className="text-primary font-medium">Blog</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert insights, tips, and strategies to help you succeed on eBay and grow your online business.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                >
                  All
                </Button>
                {categories?.slice(0, 4).map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results Header */}
        {searchQuery.length > 2 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Search Results
            </h2>
            <p className="text-gray-600">
              {searchResults?.articles.length || 0} posts found for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && displayPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery.length > 2 ? "No posts found" : "No blog posts yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery.length > 2 
                ? "Try adjusting your search terms or browse all posts."
                : "Check back soon for expert insights and tips."
              }
            </p>
            {searchQuery.length > 2 && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && displayPosts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      {/* Post metadata */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>

                      {/* Category badge */}
                      <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary">
                        {post.category}
                      </Badge>

                      {/* Post title */}
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-2 leading-tight">
                        {post.title}
                      </h3>

                      {/* Post excerpt */}
                      <p className="text-gray-600 line-clamp-3 leading-relaxed mb-4">
                        {post.excerpt}
                      </p>

                      {/* Author and read more */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{post.author}</span>
                        </div>
                        <span className="text-primary font-medium group-hover:underline text-sm">
                          Read more →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        {!isLoading && displayPosts.length > 0 && (
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Stay updated with the latest tips
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Get expert eBay selling strategies and insights delivered straight to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1"
                  />
                  <Button className="bg-primary text-white">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer - Same as Landing Page */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ListingAI</span>
              </div>
              <p className="text-gray-400">
                AI-powered eBay listing generation for modern sellers.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ListingAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 