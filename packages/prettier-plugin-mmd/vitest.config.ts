import { fileURLToPath } from "node:url"
import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

/** Resolves a path relative to this file. */
function local(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url))
}

const config: ViteUserConfig = defineConfig({
  resolve: {
    // Test against the sources of the workspace packages, as the root
    // tsconfig `paths` do, so that the tests do not depend on stale builds.
    // The first entry that matches wins, so each subpath comes before the
    // package itself.
    alias: [
      {
        find: "@mmd-toolkit/parser",
        replacement: local("../parser/src/index.ts"),
      },
      {
        find: "@mmd-toolkit/tests/mermaid",
        replacement: local("../tests/src/mermaid.ts"),
      },
      {
        find: "@mmd-toolkit/tests",
        replacement: local("../tests/src/index.ts"),
      },
    ],
  },
  test: {
    name: "prettier-plugin-mmd",
    include: ["tests/**/*.test.ts"],
  },
})

export default config
