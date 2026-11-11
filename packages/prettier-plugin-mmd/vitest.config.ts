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
    // The limit of a test, in milliseconds, is a limit on a hang. The fixtures
    // of `default-size-branches` and the corpus inputs of the same size hold
    // 50,000 characters, and a test of them takes one to three seconds here
    // and up to 4.6 times that on a slow runner of the CI (5.1 seconds on
    // Windows with Node.js 24, against the five seconds of vitest's default),
    // so the default fails a slow runner and not the printer.
    testTimeout: 30_000,
  },
})

export default config
