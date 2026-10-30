import { fileURLToPath } from "node:url"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/mmd-toolkit/playground/",
  plugins: [vue()],
  resolve: {
    // Consume workspace sources directly so parser/plugin edits reach HMR
    // without a separate package build.
    alias: [
      {
        find: /^@mmd-toolkit\/parser$/u,
        replacement: fileURLToPath(
          new URL("../parser/src/index.ts", import.meta.url),
        ),
      },
      {
        find: /^prettier-plugin-mmd$/u,
        replacement: fileURLToPath(
          new URL("../prettier-plugin-mmd/src/index.ts", import.meta.url),
        ),
      },
    ],
  },
  // Keep these modules in Vite's source graph instead of a prebundled cache.
  optimizeDeps: { exclude: ["@mmd-toolkit/parser", "prettier-plugin-mmd"] },
  build: { outDir: "lib", emptyOutDir: true },
  worker: { format: "es" },
})
