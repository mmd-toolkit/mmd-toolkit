/**
 * Checks that `src/rules/index.ts` lists the rule files under `src/rules/` as
 * `tools/update-rules.ts` writes it, and that the plugin gives ESLint those
 * rules.
 */
import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import plugin from "../src/index.ts"
import { rules } from "../src/rules/index.ts"
import { renderRulesIndex, RULES_INDEX_PATH } from "../tools/rules-index.ts"

describe("the list of the rules", () => {
  it("is up to date; run `pnpm --filter @mmd-toolkit/eslint-plugin run update` when it is not", async () => {
    expect(await readFile(RULES_INDEX_PATH, "utf8")).toBe(
      await renderRulesIndex(),
    )
  })

  it("is the rules of the plugin", () => {
    expect(plugin.rules).toBe(rules)
  })
})
