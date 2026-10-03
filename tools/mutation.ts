/**
 * Mutation differential test runner.
 *
 *   node tools/mutation.ts --candidate <module> [--diagram <diagram>]
 *     [--fixture <name>]... [--count <n>] [--seed <n>] [--limit <n>]
 *     [--require diagramType] [--require db]
 *
 * `<module>` default-exports a `Candidate` (see
 * packages/tests/src/mutation.ts): a function from `(text, config, embedded)`
 * to `{ accepted, diagramType?, db?, knownDivergence? }`. Every fixture of the
 * diagram type (or the named ones) is mutated and each mutant compared between
 * mermaid.js and the candidate. Exits with 1 when any mutant disagrees, or
 * when mermaid could not decide a mutant in Node (reported as skipped).
 * Each fixture gets one mutant for each edit operator that applies to it, in
 * an order chosen at random for the fixture; `--count` gives that many mutants
 * instead (more than one round uses an operator again). Differences the candidate declares as known divergences are
 * listed by identifier and do not fail.
 */
/* eslint-disable no-console -- a command-line tool reports on the console */
import path from "node:path"
import { pathToFileURL } from "node:url"
import { parseArgs } from "node:util"
import type { DiagramType } from "../packages/tests/src/index.ts"
import { runMutationDiff } from "../packages/tests/src/mutation.ts"
import type {
  Candidate,
  ComparedPart,
  MutationReport,
} from "../packages/tests/src/mutation.ts"
import { isDiagramType } from "./src/diagrams.ts"
import { readFixtures } from "./src/fixture-store.ts"

const { values } = parseArgs({
  options: {
    candidate: { type: "string" },
    diagram: { type: "string", default: "flowchart" },
    fixture: { type: "string", multiple: true },
    count: { type: "string" },
    seed: { type: "string", default: "1" },
    limit: { type: "string", default: "20" },
    require: { type: "string", multiple: true },
  },
})

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}

/**
 * Runs the comparison and prints the report.
 */
async function main(): Promise<void> {
  if (!values.candidate) {
    throw new Error(
      "usage: node tools/mutation.ts --candidate <module> [--diagram <diagram>] [--fixture <name>]... [--count <n>] [--seed <n>] [--limit <n>] [--require diagramType|db]...",
    )
  }
  if (!isDiagramType(values.diagram)) {
    throw new Error(`unknown diagram type: ${values.diagram}`)
  }
  const diagram: DiagramType = values.diagram
  const moduleUrl = pathToFileURL(path.resolve(values.candidate)).href
  const candidate = ((await import(moduleUrl)) as { default?: unknown }).default
  if (typeof candidate !== "function") {
    throw new Error(
      `${values.candidate} must default-export a candidate function`,
    )
  }
  const wanted = values.fixture ? new Set(values.fixture) : undefined
  const fixtures = readFixtures(diagram).filter(
    (fixture) => !wanted || wanted.has(fixture.name),
  )
  if (wanted && fixtures.length !== wanted.size) {
    const found = new Set(fixtures.map((fixture) => fixture.name))
    throw new Error(
      `unknown fixture: ${[...wanted].filter((name) => !found.has(name)).join(", ")}`,
    )
  }
  const report = await runMutationDiff(
    fixtures.map((fixture) => ({
      name: fixture.name,
      text: fixture.input,
      ...(fixture.file.config ? { config: fixture.file.config } : {}),
    })),
    candidate as Candidate,
    {
      ...(values.count === undefined ? {} : { count: Number(values.count) }),
      seed: Number(values.seed),
      require: requiredParts(values.require ?? []),
    },
  )
  console.log(
    `${fixtures.length} fixtures, ${report.compared} mutants compared, ` +
      `${report.mismatches.length} mismatches, ${report.skipped.length} skipped (seed ${values.seed}); ` +
      `diagram id compared on ${report.comparedParts.diagramType}, Db on ${report.comparedParts.db}`,
  )
  printDivergences(report)
  const limit = Number(values.limit)
  for (const mismatch of report.mismatches.slice(0, limit)) {
    console.log(
      `\n[${mismatch.kind}] ${mismatch.from}: ${mismatch.description}`,
    )
    console.log(indent(mismatch.text))
    console.log(`  mermaid:   ${summarize(mismatch.mermaid)}`)
    console.log(`  candidate: ${summarize(mismatch.candidate)}`)
  }
  if (report.mismatches.length > limit) {
    console.log(`\n... and ${report.mismatches.length - limit} more (--limit)`)
  }
  for (const skip of report.skipped.slice(0, limit)) {
    console.log(
      `\n[skipped] ${skip.from}: ${skip.description}\n  ${skip.reason}`,
    )
  }
  // A skipped text means mermaid failed in Node: the comparison is incomplete.
  if (report.mismatches.length || report.skipped.length) process.exitCode = 1
}

/**
 * Prints the known divergences the candidate declared, by identifier. They
 * do not make the run fail.
 */
function printDivergences(report: MutationReport): void {
  const counts = new Map<string, number>()
  for (const divergence of report.divergences) {
    counts.set(divergence.id, (counts.get(divergence.id) ?? 0) + 1)
  }
  const ids = new Set([
    ...counts.keys(),
    ...Object.keys(report.declaredWithoutDifference),
  ])
  if (!ids.size) return
  console.log("known divergences declared by the candidate:")
  for (const id of [...ids].sort()) {
    console.log(
      `  ${id}: ${counts.get(id) ?? 0} differ from mermaid, ` +
        `${report.declaredWithoutDifference[id] ?? 0} agree with it`,
    )
  }
}

/**
 * Validates `--require` values.
 */
function requiredParts(parts: string[]): ComparedPart[] {
  return parts.map((part) => {
    if (part !== "diagramType" && part !== "db") {
      throw new Error(`--require takes diagramType or db, not ${part}`)
    }
    return part
  })
}

/**
 * Indents text for display under a heading.
 */
function indent(text: string): string {
  return text
    .split("\n")
    .map((line) => `  | ${line}`)
    .join("\n")
}

/**
 * Describes an outcome in one line.
 */
function summarize(outcome: {
  accepted: boolean
  diagramType?: string
}): string {
  if (!outcome.accepted) {
    const error = (outcome as { error?: { name: string; message: string } })
      .error
    return error
      ? `rejected (${error.name}: ${error.message.split("\n")[0]})`
      : "rejected"
  }
  return `accepted${outcome.diagramType ? ` as ${outcome.diagramType}` : ""}`
}

/* eslint-enable no-console -- end of the command-line tool */
