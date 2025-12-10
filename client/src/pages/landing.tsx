import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Eye, 
  Camera, 
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Upload,
  Wand2,
  BarChart3,
  Shield,
  Clock,
  DollarSign
} from "lucide-react";
import { BlogSection } from "@/components/blog-section";

export default function Landing() {
  const { isLoggedIn } = useAuth();

  // If user is logged in, redirect to dashboard
  if (isLoggedIn) {
    window.location.href = "/dashboard";
    return <div>Redirecting...</div>;
  }

  const features = [
    {
      icon: Camera,
      title: "Multi-Image AI Analysis",
      description: "Upload up to 12 images per listing. Our AI analyzes each image to create comprehensive, accurate descriptions."
    },
    {
      icon: Wand2,
      title: "AI-Powered Content Generation",
      description: "Generate compelling titles and descriptions that follow eBay best practices and SEO optimization."
    },
    {
      icon: BarChart3,
      title: "Real-time SEO Scoring",
      description: "Get instant feedback on your listing's SEO performance with actionable recommendations."
    },
    {
      icon: TrendingUp,
      title: "eBay Integration",
      description: "Direct publishing to eBay with OAuth2 authentication. Seamless listing management."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted data storage and secure API connections."
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce listing creation time by 90%. Focus on growing your business, not writing descriptions."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "eBay PowerSeller",
      content: "ListingAI has transformed my eBay business. I can now list 10x more products in the same time!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Reseller",
      content: "The multi-image analysis is incredible. It picks up details I would have missed.",
      rating: 5
    },
    {
      name: "Jennifer Walsh",
      role: "Vintage Seller",
      content: "My SEO scores have improved dramatically since using ListingAI. More views, more sales!",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out ListingAI",
      features: [
        "5 listings per month",
        "Single image analysis",
        "Basic SEO scoring",
        "Community support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$19/mo",
      description: "Best for active sellers",
      features: [
        "Unlimited listings",
        "Up to 12 images per listing",
        "Advanced SEO analysis",
        "Priority support",
        "eBay integration",
        "Bulk operations"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$49/mo", 
      description: "For power sellers",
      features: [
        "Everything in Professional",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Advanced analytics",
        "White-label options"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ListingAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
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

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              ✨ Now with Multi-Image AI Analysis
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Perfect eBay Listings with
              <span className="text-primary"> AI Power</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload up to 12 product images and let our advanced AI generate compelling titles, 
              descriptions, and SEO-optimized content that drives sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-primary text-white px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8">
                <Eye className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed on eBay
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful AI tools designed specifically for eBay sellers to create better listings faster.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How ListingAI Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to create professional eBay listings
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload Images</h3>
              <p className="text-gray-600">
                Upload up to 12 high-quality images of your product. Our AI analyzes each image for details.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. AI Generation</h3>
              <p className="text-gray-600">
                Our AI creates compelling titles, detailed descriptions, and optimizes for eBay SEO.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Publish & Sell</h3>
              <p className="text-gray-600">
                Review, edit if needed, and publish directly to eBay. Track performance with our analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by thousands of sellers
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-shadow">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest Insights & Tips
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert strategies, market insights, and selling tips to help you succeed on eBay
            </p>
          </div>
          <BlogSection />
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your selling volume
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`card-shadow relative ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mt-2">
                    {plan.price}
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className={`w-full mt-6 ${plan.popular ? 'bg-blue-600 text-white' : ''}`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform your eBay business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of sellers already using ListingAI to create better listings faster.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
