import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildForVercel() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client for Vercel deployment...");
  await viteBuild({
    build: {
      outDir: "dist",
    },
  });

  console.log("client build complete! Vercel will handle API functions automatically.");
}

buildForVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
