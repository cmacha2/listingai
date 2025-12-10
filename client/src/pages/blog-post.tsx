import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  BookOpen,
  ExternalLink,
  ChevronRight,
  Zap
} from "lucide-react";
import { blogApi } from "@/lib/api";

export default function BlogPostPage() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => blogApi.getPost(slug!),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', article?.metadata.category],
    queryFn: () => blogApi.getPostsByCategory(article!.metadata.category, 3),
    enabled: !!article,
    staleTime: 5 * 60 * 1000,
  });

  // Update page metadata for SEO
  useEffect(() => {
    if (article) {
      document.title = article.metadata.seo.title || article.metadata.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', article.metadata.seo.description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = article.metadata.seo.description;
        document.head.appendChild(meta);
      }

      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', article.metadata.seo.keywords.join(', '));
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = article.metadata.seo.keywords.join(', ');
        document.head.appendChild(meta);
      }

      // Add structured data for articles
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.metadata.title,
        "description": article.metadata.description,
        "author": {
          "@type": "Person",
          "name": article.metadata.author
        },
        "datePublished": article.metadata.date,
        "dateModified": article.metadata.date,
        "wordCount": article.wordCount,
        "timeRequired": `PT${article.readingTime}M`,
        "articleSection": article.metadata.category,
        "keywords": article.metadata.tags.join(', '),
        "publisher": {
          "@type": "Organization",
          "name": "ListingAI"
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [article]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareArticle = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.metadata.title,
          text: article.metadata.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!match) {
    return <div>Article not found</div>;
  }

  if (isLoading) {
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
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Blog</Button>
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
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
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Blog</Button>
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

        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">
              The blog post you're looking for doesn't exist or has been moved.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Blog</Button>
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

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium truncate">{article.metadata.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Article Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1">
                  {article.metadata.category}
                </Badge>
                {article.metadata.featured && (
                  <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-300">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {article.metadata.title}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {article.metadata.description}
              </p>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.metadata.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.metadata.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{article.wordCount} words</span>
                </div>
              </div>

              {/* Share Button */}
              <div className="flex items-center gap-4 mb-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareArticle}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Link href="/blog">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blog
                  </Button>
                </Link>
              </div>

              <Separator className="mb-8" />
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: article.htmlContent }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 mb-8">
                {article.metadata.tags.map((tag: string) => (
                  <Badge 
                    key={tag}
                    variant="outline" 
                    className="hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Author Section */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">About {article.metadata.author}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Expert in eBay selling strategies and e-commerce optimization. 
                      Passionate about helping sellers maximize their success on online marketplaces.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Call to Action */}
              <Card className="mb-8 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ready to optimize your eBay listings?
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Put these strategies into action with ListingAI.
                  </p>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary text-white w-full">
                      Start Free Trial
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedArticles && relatedArticles.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Posts</h3>
                    <div className="space-y-4">
                      {relatedArticles
                        .filter((relatedArticle: any) => relatedArticle.slug !== article.slug)
                        .slice(0, 3)
                        .map((relatedArticle: any) => (
                          <Link key={relatedArticle.slug} href={`/blog/${relatedArticle.slug}`}>
                            <div className="group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary text-xs">
                                {relatedArticle.category}
                              </Badge>
                              <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors mb-1 line-clamp-2 text-sm">
                                {relatedArticle.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{formatDate(relatedArticle.date)}</span>
                                <span>{relatedArticle.readingTime} min</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
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