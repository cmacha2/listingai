import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { blogApi, ArticleListItem } from "@/lib/api";
import { useState } from "react";

export function BlogSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: featuredPosts, isLoading } = useQuery({
    queryKey: ['featured-blog-posts'],
    queryFn: () => blogApi.getFeaturedPosts(6), // Get 6 posts for the carousel
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading || !featuredPosts || featuredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {isLoading ? "Loading latest blog posts..." : "No blog posts available yet."}
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const postsPerSlide = 3;
  const totalSlides = Math.ceil(featuredPosts.length / postsPerSlide);
  const visiblePosts = featuredPosts.slice(
    currentSlide * postsPerSlide,
    (currentSlide + 1) * postsPerSlide
  );

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div>
      {/* Controls Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {totalSlides > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                disabled={totalSlides <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                disabled={totalSlides <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              View all posts
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Blog Posts Carousel */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {visiblePosts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 h-full border border-gray-100">
                {/* Post metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>

                {/* Category badge */}
                <div className="mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>

                {/* Post title */}
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-3">
                  {post.title}
                </h3>

                {/* Post excerpt */}
                <p className="text-gray-600 line-clamp-3 leading-relaxed mb-4 flex-grow">
                  {post.excerpt}
                </p>

                {/* Author and read more */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-gray-700 font-medium text-sm">{post.author}</span>
                  <span className="text-primary font-medium group-hover:underline text-sm">
                    Read more →
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Mobile navigation and View All CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {totalSlides > 1 && (
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-500 px-3">
              {currentSlide + 1} of {totalSlides}
            </span>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <Link href="/blog">
          <Button className="bg-primary text-white gap-2 md:hidden">
            View all posts
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
} 