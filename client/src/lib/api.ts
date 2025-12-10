export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session management
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options);
}

// Article types (matching server types)
export interface ArticleMetadata {
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  category: string;
  featured: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  slug: string;
}

export interface Article {
  slug: string;
  metadata: ArticleMetadata;
  content: string;
  htmlContent: string;
  readingTime: number;
  wordCount: number;
  excerpt: string;
}

export interface ArticleListItem {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  category: string;
  featured: boolean;
  readingTime: number;
  excerpt: string;
}

export interface ArticlesResponse {
  articles: ArticleListItem[];
  total: number;
  hasMore: boolean;
}

export interface CategoryTag {
  name: string;
  count: number;
  slug: string;
}

export interface ArticleStats {
  totalArticles: number;
  totalCategories: number;
  totalTags: number;
  featuredArticles: number;
  lastUpdated: string;
}

// Blog API functions
export const blogApi = {
  // Get all blog posts with optional filtering
  getPosts: async (options: {
    featured?: boolean;
    category?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'date' | 'title' | 'author';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ArticlesResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/blog?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    return response.json();
  },

  // Get single blog post by slug
  getPost: async (slug: string): Promise<Article> => {
    const response = await fetch(`/api/blog/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Blog post not found');
      }
      throw new Error('Failed to fetch blog post');
    }
    return response.json();
  },

  // Get featured blog posts
  getFeaturedPosts: async (limit: number = 3): Promise<ArticleListItem[]> => {
    const response = await fetch(`/api/blog/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured blog posts');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.articles || [];
  },

  // Get blog posts by category
  getPostsByCategory: async (category: string, limit?: number): Promise<ArticleListItem[]> => {
    const url = `/api/blog/category/${encodeURIComponent(category)}${limit ? `?limit=${limit}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts by category');
    }
    const data = await response.json();
    return data.articles;
  },

  // Get blog posts by tag
  getPostsByTag: async (tag: string, limit?: number): Promise<ArticleListItem[]> => {
    const url = `/api/blog/tag/${encodeURIComponent(tag)}${limit ? `?limit=${limit}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts by tag');
    }
    const data = await response.json();
    return data.articles;
  },

  // Search blog posts
  searchPosts: async (query: string, limit: number = 10): Promise<{
    articles: ArticleListItem[];
    query: string;
  }> => {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    
    const response = await fetch(`/api/blog/search?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search blog posts');
    }
    return response.json();
  },

  // Get categories
  getCategories: async (): Promise<CategoryTag[]> => {
    const response = await fetch('/api/blog/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data.categories;
  },

  // Get tags
  getTags: async (): Promise<CategoryTag[]> => {
    const response = await fetch('/api/blog/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    const data = await response.json();
    return data.tags;
  },

  // Get blog statistics
  getStats: async (): Promise<ArticleStats> => {
    const response = await fetch('/api/blog/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch blog statistics');
    }
    return response.json();
  },

  // Refresh blog cache
  refreshCache: async (): Promise<ArticleStats> => {
    const response = await fetch('/api/blog/refresh', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to refresh blog cache');
    }
    return response.json();
  },
};

// Keep articlesApi for backward compatibility
export const articlesApi = blogApi; 