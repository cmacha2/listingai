# Article Management System

This directory contains the article management system for the ListingAI blog/knowledge hub.

## System Overview

The article system is designed to work in a **hybrid mode**:

### Manual Creation
- Create `.md` or `.mdx` files directly in this directory
- Use proper frontmatter structure (see examples below)
- Articles are automatically detected and displayed

### Automated Creation (n8n Integration)
- External systems like n8n can programmatically create articles
- Simply drop new `.md` files in this directory
- The system automatically refreshes and displays new content
- No code changes required

## Article Structure

Each article must have proper frontmatter at the top:

```markdown
---
title: "Your Article Title"
description: "Brief description for SEO and previews"
author: "Author Name"
date: "2024-01-15"
tags: ["Tag1", "Tag2", "Tag3"]
category: "Category Name"
featured: true/false
seo:
  title: "SEO optimized title (optional)"
  description: "SEO meta description"
  keywords: ["keyword1", "keyword2", "keyword3"]
slug: "url-friendly-slug"
---

# Your Article Content

Write your article content here using standard Markdown syntax.

## Subheadings

- Lists work
- **Bold text** works
- *Italic text* works
- [Links](http://example.com) work

### Code blocks work too:

```javascript
console.log("Hello World");
```

Images, tables, and other Markdown features are fully supported.
```

## Required Fields

- `title`: Article title (required)
- `description`: Brief description (required)
- `author`: Author name (required)
- `date`: Publication date in YYYY-MM-DD format (required)
- `tags`: Array of tags (required)
- `category`: Category name (required)
- `featured`: Boolean - whether to feature on homepage (required)
- `slug`: URL-friendly identifier (required, must be unique)

## Optional SEO Fields

- `seo.title`: Custom SEO title (falls back to main title)
- `seo.description`: Meta description for search engines
- `seo.keywords`: Array of keywords for SEO

## Categories and Tags

### Current Categories:
- "Selling Tips"
- "SEO Guide" 
- "Photography Guide"

### Popular Tags:
- "eBay", "AI", "Sales", "SEO", "E-commerce"
- "eBay SEO", "Search Optimization", "Visibility", "Keywords", "Ranking"
- "Photography", "Product Photos", "Visual Marketing", "DIY"

## n8n Integration Guide

To integrate with n8n or other automation tools:

1. **File Creation**: Create `.md` files in this directory
2. **Naming**: Use descriptive filenames (e.g., `seo-tips-2024.md`)
3. **Content**: Ensure proper frontmatter structure
4. **Validation**: The system validates articles automatically
5. **Cache Refresh**: Articles appear immediately (cache refreshes every 5 minutes)

### n8n Workflow Example:

```javascript
// n8n Node.js code example
const fs = require('fs');
const path = require('path');

const articleContent = `---
title: "${title}"
description: "${description}"
author: "AI Content Generator"
date: "${new Date().toISOString().split('T')[0]}"
tags: ${JSON.stringify(tags)}
category: "${category}"
featured: false
seo:
  title: "${seoTitle}"
  description: "${seoDescription}"
  keywords: ${JSON.stringify(keywords)}
slug: "${slug}"
---

${content}
`;

const filePath = path.join('/path/to/content/articles', `${slug}.md`);
fs.writeFileSync(filePath, articleContent);
```

## API Endpoints

The system provides RESTful API endpoints:

- `GET /api/articles` - List all articles with filtering
- `GET /api/articles/:slug` - Get single article
- `GET /api/articles/featured/list` - Get featured articles
- `GET /api/articles/category/:category` - Get articles by category
- `GET /api/articles/tag/:tag` - Get articles by tag
- `GET /api/articles/search?q=query` - Search articles
- `GET /api/articles/categories` - List all categories
- `GET /api/articles/tags` - List all tags
- `GET /api/articles/stats` - Get article statistics
- `POST /api/articles/refresh` - Force cache refresh

## SEO Features

The system automatically provides:

- **Meta tags**: Title, description, keywords
- **Structured data**: JSON-LD for articles
- **Sitemap integration**: Articles included in sitemap
- **URL optimization**: Clean, SEO-friendly URLs
- **Social sharing**: Open Graph and Twitter cards
- **Reading time**: Automatic calculation
- **Word count**: Automatic calculation

## File Monitoring

The system monitors this directory for changes and automatically:

- Detects new articles
- Updates existing articles
- Removes deleted articles
- Refreshes the cache
- Updates search indices

## Best Practices

1. **Unique slugs**: Ensure each article has a unique slug
2. **Quality content**: Write valuable, informative content
3. **SEO optimization**: Use relevant keywords naturally
4. **Consistent categories**: Stick to established categories
5. **Proper tagging**: Use 3-5 relevant tags per article
6. **Featured sparingly**: Only feature your best content
7. **Regular updates**: Keep content fresh and current

## Troubleshooting

- **Article not appearing**: Check frontmatter syntax
- **SEO issues**: Verify meta fields are properly set
- **Cache issues**: Use `/api/articles/refresh` endpoint
- **File permissions**: Ensure n8n can write to this directory

This system is designed to scale with your content needs while maintaining excellent SEO performance and user experience. 