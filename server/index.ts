import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { createServer } from "http";
import { ebayOAuth } from "./ebay";

// Validate critical environment variables early
function validateEnvironment() {
  const requiredVars = ['DATABASE_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('Environment validation passed');
}

const app = express();
const server = createServer(app);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for session cookies in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  console.log('Production mode: trust proxy enabled');
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Setup token refresh interval (every hour)
function setupTokenRefreshInterval() {
  const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
  
  console.log('🔄 Setting up automatic eBay token refresh (every hour)...');
  
  // Run immediately on startup
  setTimeout(async () => {
    console.log('🚀 Running initial token refresh check...');
    await ebayOAuth.refreshAllExpiringTokens();
  }, 5000); // Wait 5 seconds after startup
  
  // Then run every hour
  setInterval(async () => {
    console.log('⏰ Running scheduled token refresh...');
    await ebayOAuth.refreshAllExpiringTokens();
  }, REFRESH_INTERVAL);
}

async function startServer() {
  try {
    // Validate environment before starting
    validateEnvironment();
    
    console.log('Starting server initialization...');
    
    // Setup automatic token refresh
    setupTokenRefreshInterval();
    
    // Register routes
    await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error('Application error:', {
        status,
        message,
        stack: err.stack,
        url: _req.url,
        method: _req.method
      });

      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      console.log('Setting up Vite for development...');
      await setupVite(app, server);
    } else {
      console.log('Setting up static serving for production...');
      serveStatic(app);
    }

    // ALWAYS serve the app on port 3000 (changed from 5000 to avoid macOS conflicts)
    // this serves both the API and the client.
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    
    // Only start the server if it's not already listening
    if (!server.listening) {
      server.listen(port, "0.0.0.0", () => {
        console.log(`✅ Server running successfully on port ${port}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📂 Working directory: ${process.cwd()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
