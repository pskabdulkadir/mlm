import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createBackendServer } from "./server/index.ts";

async function startServer() {
  const app = express();
  // Extract port from command line args or env
  const portArg = process.argv.find(arg => arg.startsWith("--port"));
  const defaultPort = process.env.NODE_ENV === "production" ? "3000" : "4000";
  const PORT = portArg
    ? parseInt(portArg.split("=")[1], 10)
    : parseInt(process.env.PORT || defaultPort, 10);

  // Set default env vars if missing for the backend to function
  process.env.JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret_123";
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  process.env.RUN_SEED = process.env.RUN_SEED || "true";

  try {
    const fs = await import("fs");
    const mongoSafe = process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ":xxxxxx@") : "not set";
    const dbSafe = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^@]+)@/, ":xxxxxx@") : "not set";
    fs.writeFileSync("db_status.log", `NODE_ENV: ${process.env.NODE_ENV}\nMONGODB_URI: ${mongoSafe}\nDATABASE_URL: ${dbSafe}\nStarting backend server...\n`, { flag: 'w' });
  } catch (e: any) {
    console.error("Failed to write status log:", e);
  }

  // Setup Vite dev server ONLY in development
  let viteMiddleware: any = null;
  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

  if (isDev) {
    try {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 3000,
          }
        },
        appType: "spa",
      });
      viteMiddleware = vite.middlewares;
      app.use(viteMiddleware);
      console.log("✅ Vite dev server middleware initialized with HMR enabled");
    } catch (viteErr) {
      console.warn("⚠️ Vite dev server initialization skipped:", viteErr);
    }
  }

  // API routes from the backend
  const backendApp = await createBackendServer();
  try {
    const fs = await import("fs");
    const mongoose = await import("mongoose");
    fs.appendFileSync("db_status.log", `Backend server created successfully. Mongoose connection readyState: ${mongoose.default.connection.readyState}\n`);
  } catch (e) {
    console.warn("Mongoose logging error:", e);
  }
  app.use(backendApp);

  // Static files and SPA fallback
  const distPath = path.join(__dirname, isDev ? "." : "spa");
  const indexPath = path.join(distPath, "index.html");

  // Serve static files with caching for production
  if (!isDev) {
    app.use(express.static(distPath, {
      maxAge: "1h",
      etag: false,
    }));
  } else {
    app.use(express.static(distPath));
  }

  // SPA fallback - serve index.html for all routes
  app.get("*", (req, res) => {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Failed to send index.html:", err);
        res.status(404).send("Not found");
      }
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
