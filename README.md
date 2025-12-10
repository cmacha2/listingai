# ListingAI 🚀

A full-stack TypeScript SaaS platform for AI-powered eBay listing generation with real eBay integration.

## ✨ Features

### 🎯 AI-Powered Product Analysis
- **Multi-Image Analysis**: Upload up to 12 images per listing (eBay's maximum)
- **Advanced Computer Vision**: AI analyzes multiple angles, close-ups, and packaging shots
- **Comprehensive Data Extraction**: Automatic extraction of:
  - Product name and brand identification
  - Category classification
  - Detailed features and specifications
  - Condition assessment (NEW/USED/REFURBISHED)
  - Market-based price suggestions
  - Tone recommendations for target audience

### 🛒 Real eBay Integration
- **OAuth2 Authentication**: Secure eBay seller account connection
- **Token Management**: Automatic token refresh and session handling
- **Listing Compatibility**: Ready for direct eBay listing upload

### 🌍 Multi-Language Content Generation
- **8 Language Support**: English, Spanish, German, French, Italian, Portuguese, Dutch, Polish
- **SEO Optimization**: eBay search-optimized titles and descriptions
- **Cultural Adaptation**: Tone and style adapted for target markets

### 🎨 Modern User Experience
- **Drag & Drop Interface**: Intuitive multi-image upload
- **Real-time Previews**: Visual confirmation of uploaded images
- **Progress Indicators**: Clear feedback during AI processing
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Quick Start

1. **Clone and Install**
```bash
git clone <repository-url>
cd listingAI
npm install
```

2. **Environment Setup**
Create `.env` file with:
```env
# Database
DATABASE_URL="postgresql://..."

# OpenAI API
OPENAI_API_KEY="sk-..."

# eBay API (Optional)
EBAY_CLIENT_ID="your_ebay_app_id"
EBAY_CLIENT_SECRET="your_ebay_secret"
EBAY_REDIRECT_URI="http://localhost:3000/api/ebay/callback"

# Session Security
SESSION_SECRET="your_secure_session_secret"
```

3. **Database Setup**
```bash
npm run db:push
```

4. **Start Development**
```bash
npm run dev
```

## 🖼️ Multi-Image Analysis Workflow

1. **Upload Images**: Drag and drop up to 12 product images
2. **AI Processing**: Advanced computer vision analyzes all images collectively
3. **Auto-Fill**: Product details automatically populate form fields
4. **Content Generation**: Create eBay-optimized listings in multiple languages
5. **eBay Integration**: Connect your seller account for direct listing

### Best Practices for Image Analysis

- **Multiple Angles**: Front, back, sides, and detailed shots
- **Close-ups**: Important features, labels, and condition details
- **Packaging**: Include original boxes or accessories
- **Lighting**: Well-lit images improve analysis accuracy
- **Size References**: Include items for scale when relevant

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Neon PostgreSQL + Drizzle ORM
- **AI**: OpenAI GPT-4o with Vision API
- **Authentication**: Express Sessions + bcrypt
- **File Upload**: Multer with memory storage
- **API Integration**: eBay OAuth2 + RESTful APIs

## 📊 API Endpoints

### Image Analysis
- `POST /api/analyze-images` - Multi-image analysis (up to 12 images)
- `POST /api/analyze-image` - Single image analysis (backward compatibility)

### Content Generation
- `POST /api/generate` - AI content generation for listings

### eBay Integration
- `POST /api/ebay/connect` - Initiate eBay OAuth flow
- `GET /api/ebay/callback` - Handle OAuth callback
- `POST /api/ebay/disconnect` - Disconnect eBay account

## 💡 Pro Tips

- **Batch Upload**: Select multiple images at once for faster workflow
- **Image Quality**: Higher quality images = more accurate AI analysis
- **Multiple Products**: Each analysis considers all images as a single product
- **eBay Compliance**: Automatic adherence to eBay's image and content policies

## 🔧 Development

Built with modern TypeScript practices and comprehensive error handling. The platform scales from individual sellers to enterprise eBay operations.

For detailed development setup and contribution guidelines, see the development documentation.

## 🚀 Features

- **User Authentication**: Secure sign-up and login system
- **eBay Integration**: Connect your eBay seller account via OAuth2 (mocked in MVP)
- **AI Content Generation**: Generate SEO-optimized titles and descriptions using OpenAI
- **Multi-language Support**: Create listings in multiple languages
- **SEO Scoring**: Real-time SEO analysis for your listings
- **Dashboard**: Manage all your listings in one place
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and shadcn/ui

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (development server)
- Tailwind CSS + shadcn/ui components
- TanStack Query (data fetching)
- Wouter (routing)
- React Hook Form + Zod (forms & validation)

**Backend:**
- Node.js + Express + TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- OpenAI API integration
- Express sessions + bcrypt (authentication)
- WebSockets support

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- OpenAI API key
- Git

## 🚦 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd listingAI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# OpenAI API Configuration  
OPENAI_API_KEY=sk-your-openai-api-key-here

# Session Configuration
SESSION_SECRET=your-super-secret-session-string-change-this-in-production

# eBay API Configuration (Real Implementation)
EBAY_CLIENT_ID=your-ebay-client-id
EBAY_CLIENT_SECRET=your-ebay-client-secret
EBAY_REDIRECT_URI=http://localhost:3000/api/ebay/callback
EBAY_ENVIRONMENT=sandbox

# Environment
NODE_ENV=development
PORT=3000
```

### 4. Set up the database
```bash
npm run db:push
```

### 5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Setup

This project uses Neon PostgreSQL. To set up:

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string to your `.env` file
4. Run `npm run db:push` to create the tables

## 🔑 API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

### eBay API (Optional - Currently Mocked)
For production eBay integration:
1. Register at [eBay Developer Program](https://developer.ebay.com/)
2. Create an application
3. Get your Client ID and Client Secret
4. Add them to your `.env` file

## 🔗 eBay OAuth2 Integration Setup

### 1. Create eBay Developer Account
1. Go to [eBay Developer Program](https://developer.ebay.com/)
2. Sign up for a developer account
3. Create a new application

### 2. Configure Your eBay Application
1. **Application Type**: Choose "Web Application"
2. **Grant Type**: Select "Authorization Code Grant"
3. **Redirect URI**: Set to `http://localhost:3000/api/ebay/callback`
4. **Scopes**: Enable the following scopes:
   - `https://api.ebay.com/oauth/api_scope/sell.account.readonly`
   - `https://api.ebay.com/oauth/api_scope/sell.inventory`
   - `https://api.ebay.com/oauth/api_scope/sell.listing.readonly`

### 3. Get Your Credentials
1. Copy your **Client ID** (App ID)
2. Copy your **Client Secret** (Cert ID)
3. Add them to your `.env` file:

```env
EBAY_CLIENT_ID=your-actual-client-id-here
EBAY_CLIENT_SECRET=your-actual-client-secret-here
EBAY_REDIRECT_URI=http://localhost:3000/api/ebay/callback
EBAY_ENVIRONMENT=sandbox
```

### 4. Environment Settings
- **Sandbox**: Use `EBAY_ENVIRONMENT=sandbox` for testing
- **Production**: Use `EBAY_ENVIRONMENT=production` for live listings

### 5. OAuth Flow
1. User clicks "Connect eBay Account" in dashboard
2. User is redirected to eBay's authorization page
3. User grants permissions to your app
4. eBay redirects back to your callback URL with authorization code
5. Your app exchanges the code for access/refresh tokens
6. Tokens are securely stored and automatically refreshed

### 6. Features Enabled
- ✅ **Secure OAuth2 Flow**: CSRF protection with state parameter
- ✅ **Automatic Token Refresh**: Handles token expiration seamlessly
- ✅ **Real Listing Creation**: Creates actual eBay listings
- ✅ **Error Handling**: Graceful fallback to mock mode if not configured
- ✅ **Token Management**: Secure storage and validation

## 📁 Project Structure

```
listingAI/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Database operations
│   ├── openai.ts          # OpenAI integration
│   └── vite.ts            # Vite development setup
├── shared/                 # Shared types and schemas
└── node_modules/
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Type check with TypeScript

## 🔐 Authentication System

The application includes a complete authentication system:

- **Sign up**: Create new user accounts with email/password
- **Login**: Secure login with session management
- **Protected routes**: Dashboard and settings require authentication
- **Session management**: Secure HTTP-only cookies
- **Password hashing**: bcrypt for secure password storage

## 🎨 User Interface

Built with modern UI principles:

- **Responsive design**: Works on desktop and mobile
- **Dark/light mode**: Theme switching support
- **Accessibility**: ARIA compliant components
- **Modern components**: shadcn/ui component library
- **Smooth animations**: Framer Motion integration

## 🤖 AI Integration

**OpenAI Features:**
- Generate SEO-optimized titles (under 80 characters for eBay)
- Create compelling product descriptions
- Multi-language content generation
- Tone customization (professional, casual, etc.)

## 📊 Dashboard Features

- **Product form**: Easy listing creation
- **AI preview**: Real-time content generation
- **SEO scoring**: Optimize your listings
- **Listing management**: View, edit, and publish listings
- **eBay connection**: Manage your eBay integration
- **Activity tracking**: Monitor your listing performance

## 🚀 Deployment

### Environment Variables for Production
Make sure to set these in your production environment:
- `NODE_ENV=production`
- `DATABASE_URL` (your production database)
- `OPENAI_API_KEY`
- `SESSION_SECRET` (generate a strong secret)

### Build Commands
```bash
npm run build  # Build the application
npm run start  # Start production server
```

## 🔧 Troubleshooting

### Port 5000 conflicts (macOS)
If you see "EADDRINUSE" errors, macOS Control Center might be using port 5000:
```bash
sudo lsof -i :5000  # Check what's using the port
# The app is configured to use port 3000 by default now
```

### Database connection issues
- Verify your `DATABASE_URL` is correct
- Ensure your database is accessible
- Run `npm run db:push` to ensure tables exist

### OpenAI API errors
- Check your API key is valid
- Verify you have credits in your OpenAI account
- Ensure the API key has the correct permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console logs for error details
3. Ensure all environment variables are correctly set
4. Verify your database and API keys are working

## 🎉 Getting Started Guide

1. **Sign up** for an account at `http://localhost:3000/signup`
2. **Connect eBay** account from the dashboard (currently mocked)
3. **Create a listing** using the product form
4. **Generate content** with AI
5. **Review SEO score** and optimize
6. **Publish** to eBay (mocked in MVP)

Happy listing! 🚀 