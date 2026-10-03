import { fileURLToPath } from "node:url"
import type { ViteUserConfig } from "vitest/config"
import { configDefaults, defineConfig } from "vitest/config"

/** Resolves a path relative to this file. */
function local(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url))
}

/**
 * The generated tests (`tests/generated-*.test.ts`) are not run by default:
 * they are to be redesigned to cover kinds of boundaries instead of
 * positions. `MMD_RUN_GENERATED_TESTS=1` includes them.
 */
// eslint-disable-next-line no-process-env -- which tests run comes from outside, so that including the generated tests does not edit the config
const runsGeneratedTests = process.env.MMD_RUN_GENERATED_TESTS === "1"

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
        find: "@mmd-toolkit/tests/mutation",
        replacement: local("../tests/src/mutation.ts"),
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
    exclude: runsGeneratedTests
      ? configDefaults.exclude
      : [...configDefaults.exclude, "tests/generated-*.test.ts"],
  },
})

export default config
