import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

// Simular __dirname en ESM con fallback para producción
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener el directorio raíz del proyecto de manera más robusta
function getProjectRoot() {
  console.log('=== DEBUG getProjectRoot ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('process.cwd():', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('__filename:', __filename);
  
  let projectRoot;
  
  // Verificar múltiples métodos para obtener el root
  const methods = [
    () => process.cwd(),
    () => path.resolve(__dirname, ".."),
    () => path.resolve(process.cwd()),
    () => path.dirname(process.cwd())
  ];
  
  for (const method of methods) {
    try {
      const candidate = method();
      console.log(`Trying method: ${method.toString().slice(6)}, result: ${candidate}`);
      
      if (candidate && typeof candidate === 'string' && fs.existsSync(candidate)) {
        // Verificar que sea realmente el directorio del proyecto
        const packageJsonPath = path.join(candidate, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          projectRoot = candidate;
          console.log(`✅ Valid project root found: ${projectRoot}`);
          break;
        } else {
          console.log(`❌ No package.json found in: ${candidate}`);
        }
      } else {
        console.log(`❌ Invalid or non-existent path: ${candidate}`);
      }
    } catch (error) {
      console.log(`❌ Method failed:`, error);
    }
  }
  
  if (!projectRoot) {
    console.error('❌ Failed to determine project root, using fallback');
    projectRoot = process.cwd();
  }
  
  console.log('Final projectRoot:', projectRoot);
  console.log('typeof projectRoot:', typeof projectRoot);
  console.log('=== END DEBUG ===');
  return projectRoot;
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Import Vite only when needed (development)
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfig = await import("../vite.config");
  
  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteConfig.default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const projectRoot = getProjectRoot();
      const clientTemplate = path.resolve(
        projectRoot,
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  console.log('=== DEBUG serveStatic ===');
  
  try {
    const projectRoot = getProjectRoot();
    console.log('projectRoot from getProjectRoot():', projectRoot);
    console.log('typeof projectRoot:', typeof projectRoot);
    
    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error(`Invalid project root: ${projectRoot}`);
    }
    
    console.log('About to call path.resolve with:', projectRoot, 'dist/public');
    const distPath = path.resolve(projectRoot, "dist/public");
    console.log('distPath result:', distPath);

    if (!fs.existsSync(distPath)) {
      console.error('ERROR: Build directory does not exist:', distPath);
      
      // Try alternative paths
      const alternatives = [
        path.resolve(projectRoot, "dist"),
        path.resolve(projectRoot, "build"),
        path.resolve(process.cwd(), "dist/public"),
        path.resolve(process.cwd(), "dist")
      ];
      
      console.log('Trying alternative paths...');
      let foundPath = null;
      for (const altPath of alternatives) {
        console.log(`Checking: ${altPath}`);
        if (fs.existsSync(altPath)) {
          foundPath = altPath;
          console.log(`✅ Found alternative: ${altPath}`);
          break;
        }
      }
      
      if (foundPath) {
        console.log(`Using alternative path: ${foundPath}`);
        const indexExists = fs.existsSync(path.join(foundPath, 'index.html'));
        console.log(`index.html exists in alternative: ${indexExists}`);
        
        if (indexExists) {
          app.use(express.static(foundPath));
          app.use("*", (_req, res) => {
            res.sendFile(path.resolve(foundPath!, "index.html"));
          });
          console.log('=== END DEBUG serveStatic (using alternative) ===');
          return;
        }
      }
      
      throw new Error(
        `Could not find the build directory. Tried: ${distPath}, ${alternatives.join(', ')}. Make sure to run "npm run build" first.`,
      );
    }

    console.log('✅ distPath exists, setting up static serving...');
    app.use(express.static(distPath));

    // fallback to index.html for SPA routing
    app.use("*", (_req, res) => {
      console.log('=== DEBUG fallback route ===');
      console.log('distPath:', distPath);
      console.log('About to call path.resolve with:', distPath, 'index.html');
      
      const indexPath = path.resolve(distPath, "index.html");
      console.log('indexPath result:', indexPath);
      
      if (!fs.existsSync(indexPath)) {
        console.error('ERROR: index.html not found at:', indexPath);
        return res.status(500).send('Application build incomplete - index.html not found');
      }
      
      res.sendFile(indexPath);
    });
    
  } catch (error) {
    console.error('❌ serveStatic failed:', error);
    
    // Fallback: serve a basic error page
    app.use("*", (_req, res) => {
      res.status(500).send(`
        <html>
          <body>
            <h1>Application Error</h1>
            <p>Failed to serve static files. Please check the build.</p>
            <p>Error: ${error}</p>
          </body>
        </html>
      `);
    });
  }
  
  console.log('=== END DEBUG serveStatic ===');
}
