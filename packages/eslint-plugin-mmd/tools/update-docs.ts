/**
 * Writes the parts of the rule documents that come from the rules of the
 * plugin (see `rule-docs.ts`). Run it after adding a rule or changing its
 * `meta.docs`: `pnpm --filter eslint-plugin-mmd run update:docs`.
 *
 * With `--check`, it writes nothing. It lists what does not match between the
 * rules and their documents, and the documents whose generated parts are out
 * of date, and fails when there is one:
 * `pnpm --filter eslint-plugin-mmd run check:docs`.
 */
/* eslint-disable no-console -- a command-line tool reports on the console */
import { readFileSync, writeFileSync } from "node:fs"
import { mismatches, renderDocuments } from "./rule-docs.ts"

const check = process.argv.includes("--check")
const problems = mismatches()
for (const problem of problems) console.error(problem)
if (problems.length > 0) process.exitCode = 1
const outdated: string[] = []
for (const [path, content] of await renderDocuments()) {
  if (readFileSync(path, "utf8") === content) continue
  if (check) {
    outdated.push(path)
  } else {
    writeFileSync(path, content)
  }
}
if (outdated.length > 0) {
  console.error(
    "The generated parts of these rule documents are out of date; run `pnpm --filter eslint-plugin-mmd run update:docs`:",
  )
  for (const path of outdated) console.error(`  ${path}`)
  process.exitCode = 1
}
/* eslint-enable no-console -- end of the command-line tool */
