import { fileURLToPath } from "node:url"
import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

/** Resolves a path relative to this file. */
function local(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url))
}

const config: ViteUserConfig = defineConfig({
  resolve: {
    alias: [
      // Test against the source of @mmd-toolkit/tests, as the root tsconfig
      // `paths` do, so that the tests do not depend on a stale build.
      {
        find: /^@mmd-toolkit\/tests$/u,
        replacement: local("../tests/src/index.ts"),
      },
    ],
  },
  test: {
    name: "parser",
    include: ["tests/**/*.test.ts"],
    // A missing `ast.json` or `parse-error.json` fails the fixture test
    // instead of being written: the records are written only when asked for,
    // by `pnpm run test:record` or `pnpm run test:update`.
    update: "none",
  },
})

export default config
