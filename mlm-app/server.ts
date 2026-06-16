import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createBackendServer } from "./server/index.ts";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "spa");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
