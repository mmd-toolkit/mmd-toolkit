/**
 * Writes `src/rules/index.ts` from the rule files under `src/rules/` (see
 * `rules-index.ts`). Run it after adding, renaming, or removing a rule file:
 * `pnpm --filter eslint-plugin-mmd run update`.
 *
 * With `--check`, it writes nothing, and fails when the file is out of date.
 */
/* eslint-disable no-console -- a command-line tool reports on the console */
import { readFileSync, writeFileSync } from "node:fs"
import { renderRulesIndex, RULES_INDEX_PATH } from "./rules-index.ts"

const content = await renderRulesIndex()
if (readFileSync(RULES_INDEX_PATH, "utf8") !== content) {
  if (process.argv.includes("--check")) {
    console.error(
      `${RULES_INDEX_PATH} is out of date; run \`pnpm --filter eslint-plugin-mmd run update\`.`,
    )
    process.exitCode = 1
  } else {
    writeFileSync(RULES_INDEX_PATH, content)
  }
}
/* eslint-enable no-console -- end of the command-line tool */
