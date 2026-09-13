import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

function inlineCss() {
  return {
    name: "inline-css",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const dist = join(process.cwd(), "dist");
      const htmlPath = join(dist, "index.html");
      let html = readFileSync(htmlPath, "utf8");
      html = html.replace(
        /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/,
        (_match, href) => {
          const css = readFileSync(join(dist, href.replace(/^\//, "")), "utf8");
          return `<style>${css}</style>`;
        }
      );
      writeFileSync(htmlPath, html);
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
