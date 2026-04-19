import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getMetaForUrl, injectMeta } from "./metaInjection";

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
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (filePath.endsWith(".xml")) {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=3600");
      } else if (filePath.match(/\.(js|css)$/)) {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      } else if (filePath.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      }
    },
  }));

  const indexPath = path.resolve(distPath, "index.html");

  app.use(async (req, res, _next) => {
    try {
      let template = await fs.promises.readFile(indexPath, "utf-8");
      const meta = await getMetaForUrl(req.originalUrl);
      template = injectMeta(template, meta);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.status(200).end(template);
    } catch {
      res.sendFile(indexPath);
    }
  });
}
