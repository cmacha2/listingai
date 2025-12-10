#!/bin/bash

# Deploy script for ListingAI
set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the project root?"
    exit 1
fi

# Stop any existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop listingai || true
pm2 delete listingai || true

# Clean old builds
echo "🧹 Cleaning old builds..."
rm -rf dist/ node_modules/

# Install dependencies with specific flags for Linux
echo "📦 Installing dependencies..."
npm ci --production=false --no-optional

# Force rebuild native dependencies for Linux
echo "🔧 Rebuilding native dependencies..."
npm rebuild bcrypt ws

# Build the application
echo "🔨 Building application..."
NODE_ENV=production npm run build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

# Install production dependencies only
echo "📦 Installing production dependencies..."
rm -rf node_modules/
npm ci --production --no-optional

# Force rebuild native dependencies again for production
echo "🔧 Rebuilding production dependencies..."
npm rebuild bcrypt ws

# Verify critical files exist
echo "✅ Verifying build..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js not found"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ dist/public directory not found"
    exit 1
fi

# Set proper permissions
echo "🔐 Setting file permissions..."
chmod +x dist/index.js
chmod -R 755 dist/

# Verify environment file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
fi

# Start with PM2
echo "🚀 Starting application with PM2..."
NODE_ENV=production pm2 start ecosystem.config.cjs --env production

# Check if application started successfully
sleep 5
if pm2 list | grep -q "listingai.*online"; then
    echo "✅ Application deployed successfully!"
    pm2 status
    pm2 logs listingai --lines 20
else
    echo "❌ Application failed to start"
    pm2 logs listingai --lines 50
    exit 1
fi

echo "🎉 Deployment completed!" 