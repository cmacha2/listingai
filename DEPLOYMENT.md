# 🚀 Deployment Guide

## Prerequisites

1. **Node.js** (v18 or later)
2. **PM2** globally installed: `npm install -g pm2`
3. **Git** for cloning the repository

## Quick Deployment

### 1. Clone and Setup
```bash
cd /root
git clone <your-repo-url> listingai
cd listingai
```

### 2. Create Environment File
```bash
# Copy your .env file with production values
nano .env
```

### 3. Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment Steps

If the script doesn't work, follow these manual steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application
```bash
npm run build
```

### 3. Start with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### 4. Setup PM2 Startup (Optional)
```bash
pm2 startup
# Follow the instructions PM2 shows
```

## Monitoring

### Check Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs listingai
pm2 logs listingai --lines 50
```

### Restart Application
```bash
pm2 restart listingai
```

### Stop Application
```bash
pm2 stop listingai
```

## Troubleshooting

### Common Issues

1. **"vite: not found"** - Run `npm install` first
2. **"ecosystem.config.js malformed"** - Use `.cjs` extension instead of `.js`
3. **Environment variables not loading** - Ensure `.env` file exists in project root
4. **Path resolution errors** - Check that `dist/index.js` exists after build

### Checking Logs
```bash
# Error logs
pm2 logs listingai --err

# Output logs  
pm2 logs listingai --out

# Both
pm2 logs listingai
```

## Environment Variables Required

Make sure your `.env` file contains:
- `SESSION_SECRET`
- `OPENAI_API_KEY`
- `DATABASE_URL`
- `CLOUDINARY_*` settings
- `EBAY_*` settings
- `PORT=3020` 