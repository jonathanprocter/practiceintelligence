import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

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
  const serverOptions = {
    middlewareMode: true,
    hmr: { 
      server,
      host: '0.0.0.0',
      port: 5174,
      clientPort: 5174
    },
    allowedHosts: ['localhost', '.replit.dev', '.replit.app'],
  };

  const vite = await createViteServer({
    ...viteConfig,
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
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
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

export const serveStatic = (app: Express) => {
  let distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.log(`Build directory not found at ${distPath}, trying alternative locations...`);

    // Try alternative build locations
    const alternativePaths = [
      path.resolve(process.cwd(), "dist"),
      path.resolve(process.cwd(), "server", "public"),
      path.resolve(import.meta.dirname, "..", "dist")
    ];

    let foundPath = null;
    for (const altPath of alternativePaths) {
      if (fs.existsSync(altPath) && fs.existsSync(path.join(altPath, "index.html"))) {
        foundPath = altPath;
        console.log(`Found build files at: ${foundPath}`);
        break;
      }
    }

    if (!foundPath) {
      console.error(`Could not find build directory at any of these locations:`);
      console.error(`  - ${distPath}`);
      alternativePaths.forEach(p => console.error(`  - ${p}`));
      console.error(`Make sure to build the client first with: npx vite build --outDir=server/public --emptyOutDir`);

      // Don't crash the server, just log the error
      app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api/')) {
          res.status(404).send(`
            <html>
              <body>
                <h1>Build Not Found</h1>
                <p>Client build files not found. Please run the deployment build:</p>
                <pre>npx vite build --outDir=server/public --emptyOutDir</pre>
              </body>
            </html>
          `);
        } else {
          next();
        }
      });
      return;
    }

    distPath = foundPath;
  }

  console.log(`✅ Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
};