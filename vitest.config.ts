import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  test: {
    // A run from the root checks: vitest writes no missing snapshot or
    // fixture record here. The eslint-plugin's `.eslintsnap` files are not
    // vitest snapshots; its `tests/setup.ts` keeps them from being written.
    // Each package writes its own with its `test:update` (the parser also
    // with `test:record`), run inside the package.
    update: "none",
    projects: [
      "packages/*",
      {
        test: {
          name: "scripts",
          include: ["scripts/**/*.test.mjs", ".claude/hooks/**/*.test.mjs"],
        },
      },
    ],
  },
})

export default config
