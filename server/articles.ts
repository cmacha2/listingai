import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Types for article data
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

class ArticleService {
  private articlesPath: string;
  private articleCache: Map<string, Article> = new Map();
  private lastScanTime: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute in development, can be increased for production

  constructor() {
    this.articlesPath = path.join(process.cwd(), 'content', 'articles');
    
    // Configure marked with security options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  /**
   * Get all articles with optional filtering and sorting
   */
  async getAllArticles(options: {
    featured?: boolean;
    category?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'date' | 'title' | 'author';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    articles: ArticleListItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      await this.refreshCacheIfNeeded();
      
      let articles = Array.from(this.articleCache.values());
      
      // Apply filters
      if (options.featured !== undefined) {
        articles = articles.filter(article => article.metadata.featured === options.featured);
      }
      
      if (options.category) {
        articles = articles.filter(article => 
          article.metadata.category.toLowerCase() === options.category!.toLowerCase()
        );
      }
      
      if (options.tag) {
        articles = articles.filter(article =>
          article.metadata.tags.some(tag => 
            tag.toLowerCase() === options.tag!.toLowerCase()
          )
        );
      }
      
      // Sort articles
      const sortBy = options.sortBy || 'date';
      const sortOrder = options.sortOrder || 'desc';
      
      articles.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'date':
            comparison = new Date(a.metadata.date).getTime() - new Date(b.metadata.date).getTime();
            break;
          case 'title':
            comparison = a.metadata.title.localeCompare(b.metadata.title);
            break;
          case 'author':
            comparison = a.metadata.author.localeCompare(b.metadata.author);
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      const total = articles.length;
      const offset = options.offset || 0;
      const limit = options.limit || total;
      
      // Apply pagination
      const paginatedArticles = articles.slice(offset, offset + limit);
      const hasMore = offset + limit < total;
      
      // Convert to list items
      const articleListItems: ArticleListItem[] = paginatedArticles.map(article => ({
        slug: article.slug,
        title: article.metadata.title,
        description: article.metadata.description,
        author: article.metadata.author,
        date: article.metadata.date,
        tags: article.metadata.tags,
        category: article.metadata.category,
        featured: article.metadata.featured,
        readingTime: article.readingTime,
        excerpt: article.excerpt,
      }));
      
      return {
        articles: articleListItems,
        total,
        hasMore,
      };
    } catch (error) {
      console.error('Error getting all articles:', error);
      return { articles: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get a single article by slug
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      await this.refreshCacheIfNeeded();
      return this.articleCache.get(slug) || null;
    } catch (error) {
      console.error(`Error getting article ${slug}:`, error);
      return null;
    }
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit: number = 3): Promise<ArticleListItem[]> {
    const result = await this.getAllArticles({ 
      featured: true, 
      limit, 
      sortBy: 'date', 
      sortOrder: 'desc' 
    });
    return result.articles;
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category: string, limit?: number): Promise<ArticleListItem[]> {
    const result = await this.getAllArticles({ 
      category, 
      limit, 
      sortBy: 'date', 
      sortOrder: 'desc' 
    });
    return result.articles;
  }

  /**
   * Get articles by tag
   */
  async getArticlesByTag(tag: string, limit?: number): Promise<ArticleListItem[]> {
    const result = await this.getAllArticles({ 
      tag, 
      limit, 
      sortBy: 'date', 
      sortOrder: 'desc' 
    });
    return result.articles;
  }

  /**
   * Get all categories with article counts
   */
  async getCategories(): Promise<Array<{ name: string; count: number; slug: string }>> {
    try {
      await this.refreshCacheIfNeeded();
      
      const categoryMap = new Map<string, number>();
      
      const articles = Array.from(this.articleCache.values());
      for (const article of articles) {
        const category = article.metadata.category;
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
      
      return Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  /**
   * Get all tags with article counts
   */
  async getTags(): Promise<Array<{ name: string; count: number; slug: string }>> {
    try {
      await this.refreshCacheIfNeeded();
      
      const tagMap = new Map<string, number>();
      
      const articles = Array.from(this.articleCache.values());
      for (const article of articles) {
        for (const tag of article.metadata.tags) {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        }
      }
      
      return Array.from(tagMap.entries()).map(([name, count]) => ({
        name,
        count,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      }));
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  }

  /**
   * Search articles by content, title, or description
   */
  async searchArticles(query: string, limit: number = 10): Promise<ArticleListItem[]> {
    try {
      await this.refreshCacheIfNeeded();
      
      const searchTerms = query.toLowerCase().split(/\s+/);
      const articles = Array.from(this.articleCache.values());
      
      // Score articles based on search relevance
      const scoredArticles = articles.map(article => {
        let score = 0;
        const searchableContent = [
          article.metadata.title,
          article.metadata.description,
          article.content,
          ...article.metadata.tags,
          article.metadata.category,
        ].join(' ').toLowerCase();
        
        for (const term of searchTerms) {
          // Title matches get highest score
          if (article.metadata.title.toLowerCase().includes(term)) {
            score += 10;
          }
          // Description matches get medium score
          if (article.metadata.description.toLowerCase().includes(term)) {
            score += 5;
          }
          // Tag matches get medium score
          if (article.metadata.tags.some(tag => tag.toLowerCase().includes(term))) {
            score += 5;
          }
          // Content matches get low score
          if (article.content.toLowerCase().includes(term)) {
            score += 1;
          }
        }
        
        return { article, score };
      });
      
      // Filter out articles with no matches and sort by score
      const matchedArticles = scoredArticles
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ article }) => ({
          slug: article.slug,
          title: article.metadata.title,
          description: article.metadata.description,
          author: article.metadata.author,
          date: article.metadata.date,
          tags: article.metadata.tags,
          category: article.metadata.category,
          featured: article.metadata.featured,
          readingTime: article.readingTime,
          excerpt: article.excerpt,
        }));
      
      return matchedArticles;
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  }

  /**
   * Refresh cache if needed
   */
  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastScanTime > this.CACHE_DURATION || this.articleCache.size === 0) {
      await this.scanArticles();
      this.lastScanTime = now;
    }
  }

  /**
   * Scan articles directory and update cache
   */
  private async scanArticles(): Promise<void> {
    try {
      console.log('🔄 Scanning articles directory...');
      
      // Check if articles directory exists
      try {
        await fs.access(this.articlesPath);
      } catch {
        console.log('📁 Articles directory does not exist, creating...');
        await fs.mkdir(this.articlesPath, { recursive: true });
        return;
      }
      
      const files = await fs.readdir(this.articlesPath);
      const markdownFiles = files.filter(file => 
        file.endsWith('.md') || file.endsWith('.mdx')
      );
      
      console.log(`📄 Found ${markdownFiles.length} markdown files`);
      
      // Clear existing cache
      this.articleCache.clear();
      
      // Process each markdown file
      for (const file of markdownFiles) {
        try {
          const article = await this.parseArticleFile(file);
          if (article) {
            this.articleCache.set(article.slug, article);
          }
        } catch (error) {
          console.error(`Error parsing article ${file}:`, error);
        }
      }
      
      console.log(`✅ Loaded ${this.articleCache.size} articles into cache`);
    } catch (error) {
      console.error('Error scanning articles:', error);
    }
  }

  /**
   * Parse a single article file
   */
  private async parseArticleFile(filename: string): Promise<Article | null> {
    try {
      const filePath = path.join(this.articlesPath, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      // Parse frontmatter and content
      const { data: frontmatter, content } = matter(fileContent);
      
      // Validate required frontmatter fields
      if (!frontmatter.title || !frontmatter.slug) {
        console.warn(`Article ${filename} missing required fields (title, slug)`);
        return null;
      }
      
      // Generate HTML content
      const htmlContent = await marked(content);
      
      // Calculate reading time (average 200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      
      // Generate excerpt (first 160 characters or first paragraph)
      const excerpt = this.generateExcerpt(content);
      
      // Ensure all required metadata fields have defaults
      const metadata: ArticleMetadata = {
        title: frontmatter.title,
        description: frontmatter.description || excerpt,
        author: frontmatter.author || 'Anonymous',
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        category: frontmatter.category || 'General',
        featured: Boolean(frontmatter.featured),
        seo: {
          title: frontmatter.seo?.title || frontmatter.title,
          description: frontmatter.seo?.description || frontmatter.description || excerpt,
          keywords: Array.isArray(frontmatter.seo?.keywords) ? frontmatter.seo.keywords : [],
        },
        slug: frontmatter.slug,
      };
      
      const article: Article = {
        slug: metadata.slug,
        metadata,
        content,
        htmlContent,
        readingTime,
        wordCount,
        excerpt,
      };
      
      return article;
    } catch (error) {
      console.error(`Error parsing article file ${filename}:`, error);
      return null;
    }
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string): string {
    // Remove markdown syntax for a cleaner excerpt
    const cleanContent = content
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Take first 160 characters or first sentence
    if (cleanContent.length <= 160) {
      return cleanContent;
    }
    
    const firstSentence = cleanContent.match(/^[^.!?]*[.!?]/);
    if (firstSentence && firstSentence[0].length <= 160) {
      return firstSentence[0].trim();
    }
    
    return cleanContent.substring(0, 157) + '...';
  }

  /**
   * Force refresh cache
   */
  async refreshCache(): Promise<void> {
    this.lastScanTime = 0;
    await this.refreshCacheIfNeeded();
  }

  /**
   * Get article statistics
   */
  async getStats(): Promise<{
    totalArticles: number;
    totalCategories: number;
    totalTags: number;
    featuredArticles: number;
    lastUpdated: string;
  }> {
    await this.refreshCacheIfNeeded();
    
    const categories = await this.getCategories();
    const tags = await this.getTags();
    const featured = Array.from(this.articleCache.values()).filter(
      article => article.metadata.featured
    ).length;
    
    return {
      totalArticles: this.articleCache.size,
      totalCategories: categories.length,
      totalTags: tags.length,
      featuredArticles: featured,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Create singleton instance
export const articleService = new ArticleService();

// Export types
export { ArticleService }; 