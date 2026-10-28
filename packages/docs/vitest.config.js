import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

/** Resolves a path relative to this file. */
function local(path) {
  return fileURLToPath(new URL(path, import.meta.url))
}

export default defineConfig({
  resolve: {
    // Test against the sources of the workspace packages, as the tests of the
    // other packages do, so that the tests do not depend on stale builds. The
    // site itself is built from the built packages.
    alias: [
      {
        find: "@mmd-toolkit/eslint-plugin",
        replacement: local("../eslint-plugin/src/index.ts"),
      },
      {
        find: "@mmd-toolkit/parser",
        replacement: local("../parser/src/index.ts"),
      },
    ],
  },
  test: { name: "docs", include: ["tests/**/*.test.js"] },
})
