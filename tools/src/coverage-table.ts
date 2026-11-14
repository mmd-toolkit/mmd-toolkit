/**
 * The coverage table: which conditions of the documents of the tree
 * `checkTree` is shown to check. It is data that the check of the recorded
 * trees reads from two versions, the working tree and the base, so it is kept
 * as JSON files, one for each document of the tree, in
 * `packages/tests/recorded-trees/coverage-table/`, beside the answers.
 * `packages/tests/docs/recorded-trees.md` defines the rows.
 */
import type {
  DocumentBlock,
  DocumentReader,
} from "./recorded-tree-documents.ts"

/** The files of the table, relative to the root of the repository. */
export const COVERAGE_TABLE = "packages/tests/recorded-trees/coverage-table"

/** A test case in which `checkTree` reports a tree that breaks the condition. */
export interface CoverageTest {
  /** The test file, relative to `packages/tests/tests/`. */
  readonly file: string
  /** A string that the test file holds and that names the case, such as its title. */
  readonly text: string
}

/** One case that the block distinguishes, with the tests that show it is checked. */
export interface CoverageCase {
  /** The condition of this case, in the words of the block. */
  readonly case: string
  readonly tests: readonly CoverageTest[]
}

/** Why `checkTree` is not shown to check a condition. */
export type NotShownReason =
  /** No rule of `checkTree` is about the condition. */
  | "no-rule"
  /** A rule is about the condition, but a case that breaks a part of it is not reported. */
  | "rule-misses-condition"

/** Why a block states no condition of the tree for the named diagram types. */
export type NoConditionKind =
  /** It introduces the document or a part of it. */
  | "introduction"
  /** It points to another document or section, where the conditions are. */
  | "pointer"
  /** It gives the reason of other sentences. */
  | "reason"
  /** The named documents define nothing that gives the block, in its words, a case in these trees. */
  | "not-in-diagram"

/** The judgment of a block for some diagram types. */
export type CoverageJudgment =
  | {
      readonly status: "shown"
      /** Every case that the block distinguishes, each with tests that break its condition. */
      readonly cases: readonly CoverageCase[]
    }
  | {
      readonly status: "not-shown"
      readonly reason: NotShownReason
      /** What is not checked, in words. */
      readonly note: string
    }
  | {
      readonly status: "no-condition"
      readonly kind: Exclude<NoConditionKind, "not-in-diagram">
      /** Why the block has no tree condition for these diagrams. */
      readonly note: string
    }
  | {
      readonly status: "no-condition"
      readonly kind: "not-in-diagram"
      /** The syntax and tree documents of the diagrams, and any other documents the judgment relies on, relative to the repository root. */
      readonly documents: readonly string[]
      /** What none of the named documents defines, in the words of the block. */
      readonly note: string
    }

/** A row of the table: one judgment of one block for the diagram types named. */
export interface CoverageRow {
  /** The key of the block: `<document>:<hash>`. */
  readonly block: string
  /** The diagram types that the judgment holds for, each named, `error` for the trees of an `ErrorDiagram`. */
  readonly diagrams: readonly string[]
  /** The opening words of the block, for a person who reads the table; not compared. */
  readonly about: string
  readonly judgment: CoverageJudgment
}

/** The rows of the table of a version, and the files of it that cannot be read. */
export interface CoverageTable {
  readonly rows: readonly CoverageRow[]
  readonly unreadable: readonly {
    readonly file: string
    readonly reason: string
  }[]
}

/** Whether `value` is a JSON object. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Whether `value` is a list of strings. */
function isStrings(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  )
}

/** Why `judgment` is not a judgment of the table, or undefined when it is one. */
function judgmentProblem(judgment: unknown): string | undefined {
  if (!isRecord(judgment)) return "has no judgment object"
  if (
    "documents" in judgment &&
    !(judgment.status === "no-condition" && judgment.kind === "not-in-diagram")
  ) {
    return "has documents without kind not-in-diagram of no-condition"
  }
  switch (judgment.status) {
    case "shown":
      return Array.isArray(judgment.cases) &&
        judgment.cases.length > 0 &&
        judgment.cases.every(
          (entry) =>
            isRecord(entry) &&
            typeof entry.case === "string" &&
            entry.case !== "" &&
            Array.isArray(entry.tests) &&
            entry.tests.length > 0 &&
            entry.tests.every(
              (test) =>
                isRecord(test) &&
                typeof test.file === "string" &&
                typeof test.text === "string" &&
                test.text !== "",
            ),
        )
        ? undefined
        : "is shown without cases of { case, tests: [{ file, text }] }, with a nonempty case and tests"
    case "not-shown":
      return (judgment.reason === "no-rule" ||
        judgment.reason === "rule-misses-condition") &&
        typeof judgment.note === "string"
        ? undefined
        : "is not shown without a reason (no-rule or rule-misses-condition) and a note"
    case "no-condition":
      if (
        judgment.kind === "not-in-diagram" &&
        (!isStrings(judgment.documents) ||
          judgment.documents.length === 0 ||
          judgment.documents.some((document) => document === ""))
      ) {
        return "states not-in-diagram without nonempty documents of nonempty strings"
      }
      return (judgment.kind === "introduction" ||
        judgment.kind === "pointer" ||
        judgment.kind === "reason" ||
        judgment.kind === "not-in-diagram") &&
        typeof judgment.note === "string"
        ? undefined
        : "states no condition without a kind (introduction, pointer, reason or not-in-diagram) and a note"
    default:
      return "has a status other than shown, not-shown and no-condition"
  }
}

/** Why `value` is not a file of the table, or undefined when it is one. */
function tableFileProblem(
  value: unknown,
  diagrams: ReadonlySet<string>,
): string | undefined {
  if (!isRecord(value) || !Array.isArray(value.rows)) {
    return "it is not a JSON object with a list `rows`"
  }
  for (const [index, row] of value.rows.entries()) {
    const where = `rows[${index}]`
    if (!isRecord(row)) return `${where} is not an object`
    if (typeof row.block !== "string") return `${where} has no block key`
    if (typeof row.about !== "string") return `${where} has no about`
    if (!isStrings(row.diagrams) || row.diagrams.length === 0) {
      return `${where} names no diagram types`
    }
    const unknown = row.diagrams.find((diagram) => !diagrams.has(diagram))
    if (unknown !== undefined) {
      return `${where} names ${JSON.stringify(unknown)}, which is no diagram type`
    }
    const problem = judgmentProblem(row.judgment)
    if (problem !== undefined) return `${where} ${problem}`
  }
  return undefined
}

/**
 * Reads the table through `reader`: the JSON files of `COVERAGE_TABLE`, in
 * the order of their names. A file that is not JSON, or whose rows are not of
 * the form of the table or name a diagram type that `diagrams` does not hold,
 * gives no rows and is listed as unreadable.
 */
export function readCoverageTable(
  reader: DocumentReader,
  diagrams: ReadonlySet<string>,
): CoverageTable {
  const rows: CoverageRow[] = []
  const unreadable: { file: string; reason: string }[] = []
  for (const name of reader
    .list(COVERAGE_TABLE)
    .filter((entry) => entry.endsWith(".json"))
    .sort()) {
    const file = `${COVERAGE_TABLE}/${name}`
    const text = reader.read(file)
    let value: unknown
    try {
      value = text === undefined ? undefined : JSON.parse(text)
    } catch {
      unreadable.push({ file, reason: "it is not JSON" })
      continue
    }
    const problem = tableFileProblem(value, diagrams)
    if (problem !== undefined) {
      unreadable.push({ file, reason: problem })
      continue
    }
    for (const row of (value as { rows: readonly CoverageRow[] }).rows) {
      rows.push(row)
    }
  }
  return { rows, unreadable }
}

/** A row of the coverage table that does not count, and why. */
export interface StaleRow {
  readonly row: CoverageRow
  readonly reason: string
}

/** The judgments of the items, as the coverage table gives them. */
export interface Coverage {
  /** The judgment of each item that a row that counts covers, by the key of the item. */
  readonly judgments: ReadonlyMap<string, CoverageJudgment>
  readonly staleRows: readonly StaleRow[]
}

/**
 * Reads the rows `rows` against the blocks of a version: a row counts when
 * its block is there with the same key, its diagram types are among those the
 * block holds for, every test it names is in its test file (`testFile` gives
 * the text of a test file of `packages/tests/tests/`), and no earlier row
 * covers one of its items. A not-in-diagram judgment also needs every named
 * document to exist. If the row is unchanged from `base`, its documents must
 * be unchanged too; a changed row records the new judgment.
 */
export function coverageOf(
  rows: readonly CoverageRow[],
  blocks: ReadonlyMap<
    string,
    { readonly block: DocumentBlock; readonly diagrams: readonly string[] }
  >,
  testFile: (file: string) => string | undefined,
  reader: DocumentReader,
  base?: {
    readonly reader: DocumentReader
    readonly rows: readonly CoverageRow[]
  },
): Coverage {
  const judgments = new Map<string, CoverageJudgment>()
  const staleRows: StaleRow[] = []
  const baseRows = new Set(base?.rows.map((row) => JSON.stringify(row)))
  for (const row of rows) {
    const current = blocks.get(row.block)
    const missingTest =
      row.judgment.status === "shown"
        ? row.judgment.cases
            .flatMap((entry) => entry.tests)
            .find(
              (testCase) =>
                testFile(testCase.file)?.includes(testCase.text) !== true,
            )
        : undefined
    const otherDiagram = row.diagrams.find(
      (diagram) => current?.diagrams.includes(diagram) !== true,
    )
    const covered = row.diagrams.find((diagram) =>
      judgments.has(`${row.block}@${diagram}`),
    )
    const documents =
      row.judgment.status === "no-condition" &&
      row.judgment.kind === "not-in-diagram"
        ? row.judgment.documents
        : []
    const missingDocument = documents.find(
      (document) => reader.read(document) === undefined,
    )
    const changedDocument =
      base !== undefined && baseRows.has(JSON.stringify(row))
        ? documents.find(
            (document) => reader.read(document) !== base.reader.read(document),
          )
        : undefined
    const reason =
      current === undefined
        ? "no block has this key now: its text, its node type, or a section it links to changed, or it was removed"
        : missingTest !== undefined
          ? `the test file ${missingTest.file} no longer holds ${JSON.stringify(missingTest.text)}`
          : otherDiagram !== undefined
            ? `the block does not hold for the diagram type ${otherDiagram}`
            : covered !== undefined
              ? `an earlier row covers the diagram type ${covered}`
              : missingDocument !== undefined
                ? `the document ${missingDocument} is not there now; judge the row again`
                : changedDocument !== undefined
                  ? `the document ${changedDocument} changed since the base; judge the row again`
                  : undefined
    if (reason !== undefined) {
      staleRows.push({ row, reason })
      continue
    }
    for (const diagram of row.diagrams) {
      judgments.set(`${row.block}@${diagram}`, row.judgment)
    }
  }
  return { judgments, staleRows }
}

/** Whether a person reads the item that `judgment` judges: unless it is shown or states no condition. */
export function isRead(judgment: CoverageJudgment | undefined): boolean {
  return judgment === undefined || judgment.status === "not-shown"
}
