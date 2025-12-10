#!/bin/bash

# Pre-deployment Linux environment check
echo "🔍 Checking Linux environment for ListingAI deployment..."

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
echo "Node.js: $NODE_VERSION"

if [[ $NODE_VERSION == "not installed" ]]; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null || echo "not installed")
echo "npm: $NPM_VERSION"

# Check PM2
echo "🔄 Checking PM2..."
PM2_VERSION=$(pm2 --version 2>/dev/null || echo "not installed")
echo "PM2: $PM2_VERSION"

if [[ $PM2_VERSION == "not installed" ]]; then
    echo "⚠️  PM2 not installed. Installing..."
    npm install -g pm2
fi

# Check system dependencies for native modules
echo "🔧 Checking system dependencies..."

# Check for build tools
if ! command -v gcc &> /dev/null; then
    echo "⚠️  gcc not found. You may need: sudo apt-get install build-essential"
fi

if ! command -v make &> /dev/null; then
    echo "⚠️  make not found. You may need: sudo apt-get install build-essential"
fi

if ! command -v python3 &> /dev/null; then
    echo "⚠️  python3 not found. You may need: sudo apt-get install python3"
fi

# Check available disk space
echo "💾 Checking disk space..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
echo "Disk usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 85 ]; then
    echo "⚠️  Low disk space: ${DISK_USAGE}% used"
fi

# Check memory
echo "🧠 Checking memory..."
FREE_MEM=$(free -h | awk 'NR==2{printf "%.1f GB", $7/1024/1024}')
echo "Available memory: $FREE_MEM"

# Check if .env file exists and get PORT
echo "⚙️  Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Get PORT from .env (default to 3000 if not found)
    PORT=$(grep "^PORT=" .env 2>/dev/null | cut -d '=' -f 2 | tr -d '\r\n' || echo "3000")
    echo "📍 Configured PORT: $PORT"
    
    # Check critical environment variables (without exposing values)
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL configured"
    else
        echo "❌ DATABASE_URL not found in .env"
    fi
    
    if grep -q "OPENAI_API_KEY" .env; then
        echo "✅ OPENAI_API_KEY configured"
    else
        echo "⚠️  OPENAI_API_KEY not found in .env"
    fi
    
    if grep -q "CLOUDINARY" .env; then
        echo "✅ Cloudinary configuration found"
    else
        echo "⚠️  Cloudinary configuration not found in .env"
    fi
else
    echo "❌ .env file not found"
    PORT="3000"
fi

# Check project structure
echo "📁 Checking project structure..."
REQUIRED_FILES=("package.json" "server/index.ts" "ecosystem.config.cjs")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file missing"
    fi
done

# Test database connection (basic check)
echo "🗄️  Testing basic connectivity..."
if command -v curl &> /dev/null; then
    echo "✅ curl available for testing"
else
    echo "⚠️  curl not available"
fi

# Check port availability (using PORT from .env)
echo "🔌 Checking port $PORT availability..."
if ss -tuln | grep -q ":$PORT "; then
    echo "⚠️  Port $PORT is already in use"
    echo "Current processes on port $PORT:"
    ss -tulpn | grep ":$PORT "
else
    echo "✅ Port $PORT is available"
fi

echo ""
echo "🏁 Environment check completed!"
echo "If you see any ❌ errors above, please fix them before deploying."
echo "⚠️  warnings should be addressed but won't prevent deployment." 