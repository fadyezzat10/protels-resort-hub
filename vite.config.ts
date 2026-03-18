import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/framer-motion")) return "framer-motion";
          if (id.includes("node_modules/@radix-ui")) return "radix-ui";
          if (id.includes("node_modules/react-dom")) return "react-dom";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-is") || id.includes("node_modules/scheduler")) return "react";
          if (id.includes("node_modules/@tanstack/react-query")) return "react-query";
          if (id.includes("node_modules/openai") || id.includes("node_modules/@emailjs")) return "vendor-services";
          if (id.includes("node_modules/lucide-react")) return "icons";
          if (id.includes("node_modules/zod")) return "vendor-zod";
          if (id.includes("node_modules/date-fns")) return "vendor-dates";
          if (id.includes("node_modules/wouter")) return "vendor-router";
          if (id.includes("node_modules/drizzle") || id.includes("node_modules/drizzle-zod")) return "vendor-db";
          if (id.includes("/pages/cms/") || id.includes("/components/CMS") || id.includes("/pages/admin/")) return "cms-admin";
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
