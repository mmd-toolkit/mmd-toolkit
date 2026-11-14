/**
 * Which conditions of the documents of the tree `checkTree` is shown to
 * check: for each block of those documents and the diagram types it holds
 * for, either the test cases in which `checkTree` reports a tree that breaks
 * the condition, or why that cannot be shown. A block and a diagram type
 * without a row are not judged yet. `tools/recorded-trees.ts` asks a person to
 * read every recorded tree that changes against the conditions that are not
 * shown. The blocks, their keys, and the use of this table are defined in
 * `packages/tests/docs/recorded-trees.md`; this file does not import
 * `checkTree`.
 */

/** A test case in which `checkTree` reports a tree that breaks the condition. */
export interface CoverageCase {
  /** The test file, relative to `packages/tests/tests/`. */
  readonly file: string
  /** A string that the test file holds and that names the case, such as the name of the fixture that it breaks. */
  readonly text: string
}

/** Why `checkTree` is not shown to check a condition. */
export type NotShownReason =
  /** No rule of `checkTree` is about the condition. */
  | "no-rule"
  /** A rule is about the condition, but a case that breaks a part of it is not reported. */
  | "rule-misses-condition"

/** The judgment of a block for some diagram types. */
export type CoverageJudgment =
  | {
      readonly status: "shown"
      /** For each case that the block distinguishes, a test case that breaks it. */
      readonly cases: readonly CoverageCase[]
    }
  | {
      readonly status: "not-shown"
      readonly reason: NotShownReason
      /** What is not checked, in words. */
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

/** The table, in the order of the documents and their blocks. */
export const COVERAGE: readonly CoverageRow[] = []
