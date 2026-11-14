/**
 * The check of the recorded trees that a change adds or rewrites.
 *
 *   node tools/recorded-trees.ts --base <ref> [--places]
 *
 * See packages/tests/docs/recorded-trees.md.
 */
/* eslint-disable no-console -- a command-line tool reports on the console */
import { execFileSync } from "node:child_process"
import { parseArgs } from "node:util"
import {
  RecordedTreesUsageError,
  changeSince,
  checkRecordedTrees,
} from "./src/recorded-trees.ts"
import { failsOf, formatReport } from "./src/recorded-trees-report.ts"

/** Runs the command and returns its exit code. */
function main(): number {
  let parsed: ReturnType<typeof parseOptions>
  try {
    parsed = parseOptions()
  } catch (error) {
    console.error((error as Error).message)
    return 2
  }
  const { values, tokens } = parsed
  const bases = tokens.filter(
    (token) => token.kind === "option" && token.name === "base",
  )
  if (values.base === undefined || bases.length !== 1) {
    console.error(
      "usage: node tools/recorded-trees.ts --base <ref> [--places], with --base once",
    )
    return 2
  }
  try {
    let root: string
    try {
      root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim()
    } catch {
      throw new RecordedTreesUsageError("not in a git repository")
    }
    const { base, changed } = changeSince(root, values.base)
    const report = checkRecordedTrees(root, base, changed, {
      places: values.places,
    })
    process.stdout.write(formatReport(report, values.places))
    return failsOf(report) ? 1 : 0
  } catch (error) {
    if (error instanceof RecordedTreesUsageError) {
      console.error(error.message)
      return 2
    }
    throw error
  }
}

/** The options of the command, with the tokens that say how often each is given. */
function parseOptions() {
  return parseArgs({
    options: {
      base: { type: "string" },
      places: { type: "boolean", default: false },
    },
    strict: true,
    tokens: true,
  })
}

process.exitCode = main()

/* eslint-enable no-console -- end of the command-line tool */
