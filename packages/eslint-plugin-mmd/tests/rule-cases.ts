/**
 * The test cases of a rule: the examples that the English document of the
 * rule shows, so that the examples and the behavior of the rule cannot drift
 * apart, and the inputs in the fixture directory of the rule,
 * `tests/fixtures/rules/<name>/`, laid out as in ota-meshi's ESLint plugins,
 * which use the same tester: each `<case>-input.mmd` under
 * `valid/` or `invalid/`, in any subdirectory, is a case, and a file or a
 * directory whose name starts with `_` is not. The Japanese document shows
 * the same examples; `check:docs` checks that.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import {
  mmdCodeBlocks,
  RULE_DOCS_DIR,
  ruleDocumentPath,
} from "../tools/rule-docs.ts"

/** The fixture directories of the rules: `<name>/valid/` and `<name>/invalid/`. */
export const RULE_FIXTURES_DIR: string = fileURLToPath(
  new URL("fixtures/rules/", import.meta.url),
)

/** The end of the name of an input file of a rule fixture. */
export const INPUT_SUFFIX = "-input.mmd"

/** The line of a rule document that the examples of incorrect code follow. */
const INCORRECT_HEADING = "Examples of **incorrect** code for this rule:"

/** The line of a rule document that the examples of correct code follow. */
const CORRECT_HEADING = "Examples of **correct** code for this rule:"

/** The examples of a rule document. */
export interface RuleExamples {
  /** The code blocks after the heading of the incorrect examples. */
  readonly incorrect: readonly string[]
  /** The code blocks after the heading of the correct examples. */
  readonly correct: readonly string[]
}

/** A test case of eslint-snapshot-rule-tester. */
export interface RuleCase {
  readonly name: string
  readonly filename: string
  readonly code: string
}

/** The part of `text` from the line `heading` to the next `## ` heading. */
function sectionAfter(text: string, heading: string, path: string): string {
  const start = text.indexOf(`\n${heading}\n`)
  if (start === -1) throw new Error(`${path} has no line "${heading}"`)
  const end = text.indexOf("\n## ", start + 1)
  return end === -1 ? text.slice(start) : text.slice(start, end)
}

/**
 * The examples of the English document of the rule `name` (such as
 * `flowchart/no-ignored-text`). The incorrect examples come before the
 * correct ones, in the section on the details of the rule.
 */
export function ruleExamples(name: string): RuleExamples {
  const path = ruleDocumentPath(RULE_DOCS_DIR, name, "en")
  const document = readFileSync(path, "utf8")
  const incorrectToEnd = sectionAfter(document, INCORRECT_HEADING, path)
  const correctStart = incorrectToEnd.indexOf(`\n${CORRECT_HEADING}\n`)
  if (correctStart === -1) {
    throw new Error(`${path} has no line "${CORRECT_HEADING}"`)
  }
  return {
    incorrect: mmdCodeBlocks(incorrectToEnd.slice(0, correctStart)),
    correct: mmdCodeBlocks(incorrectToEnd.slice(correctStart)),
  }
}

/**
 * The example at `index` of its `kind`, as a snapshot test case. The tester
 * enables the rule under `rule-to-test/`, so remove only the leading authoring
 * comment that would also enable it under `mmd/` and duplicate every report.
 * The site and parser checks still read the complete published example.
 */
function exampleCase(
  name: string,
  kind: "incorrect" | "correct",
  code: string,
  index: number,
): RuleCase {
  const directive = `%% eslint mmd/${name}: error\n`
  return {
    name: `docs/rules/${name}.md ${kind} ${index + 1}`,
    filename: `${name}-${kind}-${index + 1}.mmd`,
    code: code.startsWith(directive) ? code.slice(directive.length) : code,
  }
}

/**
 * The input files under `directory`, in any subdirectory, as paths relative
 * to it, sorted; a file or a directory whose name starts with `_` is left out.
 */
export function inputFiles(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory).sort()) {
    if (entry.startsWith("_")) continue
    if (statSync(`${directory}${entry}`).isDirectory()) {
      files.push(
        ...inputFiles(`${directory}${entry}/`).map(
          (file) => `${entry}/${file}`,
        ),
      )
    } else if (entry.endsWith(INPUT_SUFFIX)) {
      files.push(entry)
    }
  }
  return files
}

/** The cases of the fixture directory `<name>/<kind>/` of the rule `name`. */
function fixtureCases(name: string, kind: "valid" | "invalid"): RuleCase[] {
  const directory = `${RULE_FIXTURES_DIR}${name}/${kind}/`
  return inputFiles(directory).map((file) => ({
    name: `${kind}/${file.slice(0, -INPUT_SUFFIX.length)}`,
    filename: `tests/fixtures/rules/${name}/${kind}/${file}`,
    code: readFileSync(`${directory}${file}`, "utf8"),
  }))
}

/**
 * The test cases of the rule `name` for the tester: the incorrect examples of
 * its document and the inputs of `invalid/` are invalid, the correct examples
 * and the inputs of `valid/` valid.
 */
export function ruleCases(name: string): {
  valid: RuleCase[]
  invalid: RuleCase[]
} {
  const examples = ruleExamples(name)
  return {
    valid: [
      ...examples.correct.map((code, index) =>
        exampleCase(name, "correct", code, index),
      ),
      ...fixtureCases(name, "valid"),
    ],
    invalid: [
      ...examples.incorrect.map((code, index) =>
        exampleCase(name, "incorrect", code, index),
      ),
      ...fixtureCases(name, "invalid"),
    ],
  }
}
