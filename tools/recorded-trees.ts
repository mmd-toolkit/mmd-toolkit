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
import { formatReport } from "./src/recorded-trees-report.ts"

/** Runs the command and returns its exit code. */
async function main(): Promise<number> {
  let values: { base?: string; places?: boolean }
  try {
    ;({ values } = parseArgs({
      options: {
        base: { type: "string" },
        places: { type: "boolean", default: false },
      },
      strict: true,
    }))
  } catch (error) {
    console.error((error as Error).message)
    return 2
  }
  if (values.base === undefined) {
    console.error("usage: node tools/recorded-trees.ts --base <ref> [--places]")
    return 2
  }
  try {
    let root: string
    try {
      root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
        encoding: "utf8",
      }).trim()
    } catch {
      throw new RecordedTreesUsageError("not in a git repository")
    }
    const { base, changed } = changeSince(root, values.base)
    const report = await checkRecordedTrees(root, base, changed, {
      places: values.places === true,
    })
    const { text, fails } = formatReport(report, values.places === true)
    process.stdout.write(text)
    return fails ? 1 : 0
  } catch (error) {
    if (error instanceof RecordedTreesUsageError) {
      console.error(error.message)
      return 2
    }
    throw error
  }
}

process.exitCode = await main()

/* eslint-enable no-console -- end of the command-line tool */
