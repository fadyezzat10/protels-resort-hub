import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    maxAge: "7d",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (filePath.match(/\.(js|css)$/)) {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      } else if (filePath.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      }
    },
  }));

  app.use((_req, res, _next) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
