/**
 * Compares `parse()` with the pinned mermaid.js on the inputs of a JSON
 * file, an array of strings: `pnpm run compare-with-mermaid <file>`. For
 * each input it prints the input and one verdict:
 *
 * - `same: accepted, same Db` or `same: rejected`;
 * - `DIFF: ...`, a different acceptance, or the two Db summaries;
 * - `BUG or broken tree: ...`, when `parse()` throws something other than
 *   `ParseError` or the tree fails the check of the tree.
 *
 * The Db summary of the tree is built by the test helpers, as the fixture
 * tests build it. An input of a known divergence prints `DIFF`.
 */
import { readFileSync } from "node:fs"
import { isDeepStrictEqual } from "node:util"
import { runMermaidWithEmbeddedData } from "@mmd-toolkit/tests/mermaid"
import { ParseError, parse } from "../src/index.ts"
import { problemsOfTree } from "../tests/helpers/tree-problems.ts"
import { dbOfTree } from "../tests/helpers/db-of-tree.ts"

/** How `parse()` and the check of the tree agree with mermaid.js on `input`. */
async function verdictOf(input: string): Promise<string> {
  const run = await runMermaidWithEmbeddedData(input)
  try {
    const root = parse(input)
    const [problem] = problemsOfTree(input, root)
    if (problem !== undefined) {
      return `BUG or broken tree: ${problem.where}: ${problem.message}`
    }
    if (!run.outcome.accepted || run.embedded === undefined) {
      return "DIFF: mermaid.js rejects, parse() accepts"
    }
    const db = dbOfTree(input, root, run.embedded)
    if (isDeepStrictEqual(db, run.outcome.db)) return "same: accepted, same Db"
    return `DIFF: Db\n  mermaid.js ${JSON.stringify(run.outcome.db)}\n  parse()    ${JSON.stringify(db)}`
  } catch (error) {
    if (!(error instanceof ParseError)) {
      return `BUG or broken tree: ${String(error)}`
    }
    return run.outcome.accepted
      ? `DIFF: mermaid.js accepts, parse() rejects: ${error.message}`
      : "same: rejected"
  }
}

const [file] = process.argv.slice(2)
if (file === undefined) {
  throw new Error("usage: compare-with-mermaid <JSON file of input strings>")
}
const inputs: unknown = JSON.parse(readFileSync(file, "utf8"))
if (
  !Array.isArray(inputs) ||
  !inputs.every((input) => typeof input === "string")
) {
  throw new Error(`${file} must hold a JSON array of strings`)
}
for (const input of inputs) {
  // Not console.log: its first argument is a format, so an input with `%`
  // would be printed wrong.
  process.stdout.write(`${JSON.stringify(input)} ${await verdictOf(input)}\n`)
}
