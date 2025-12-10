import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Configure WebSocket for serverless environments
async function configureWebSocket() {
  if (typeof window === 'undefined') {
    // Only import ws in server environment
    try {
      // Dynamic import to avoid bundling issues
      const ws = await import('ws');
      neonConfig.webSocketConstructor = ws.default || ws;
      console.log('WebSocket configured successfully');
    } catch (error) {
      console.warn('WebSocket import failed, using fetch fallback:', error);
      // Fallback to fetch for environments where WebSocket isn't available
      neonConfig.useSecureWebSocket = false;
      neonConfig.pipelineTLS = false;
      neonConfig.webSocketConstructor = undefined;
    }
  }
}

// Initialize WebSocket configuration
configureWebSocket().catch(error => {
  console.warn('WebSocket configuration failed:', error);
  // Continue with fetch fallback
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.webSocketConstructor = undefined;
});

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('Database configuration:', {
  hasUrl: !!process.env.DATABASE_URL,
  environment: process.env.NODE_ENV || 'development'
});

// Create connection pool with error handling
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
  
  db = drizzle({ client: pool, schema });
  
  console.log('Database pool created successfully');
} catch (error) {
  console.error('Failed to create database pool:', error);
  throw error;
}

export { pool, db };