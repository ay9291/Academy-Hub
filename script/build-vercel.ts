import { build as viteBuild } from "vite";
import { rm } from "fs/promises";
import path from "path";
import react from "@vitejs/plugin-react";

const projectRoot = path.resolve(import.meta.dirname, "..");

async function buildForVercel() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client for Vercel deployment...");
  await viteBuild({
    root: path.resolve(projectRoot, "client"),
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "client", "src"),
        "@shared": path.resolve(projectRoot, "shared"),
        "@assets": path.resolve(projectRoot, "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(projectRoot, "dist"),
      emptyOutDir: true,
    },
  });

  console.log("client build complete! Vercel will handle API functions automatically.");
}

buildForVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
