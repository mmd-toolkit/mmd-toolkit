/**
 * Runs ESLint's Linter on Mermaid text with the plugin and a rule that only
 * observes: it records the nodes in the order in which ESLint visits them and
 * keeps the `SourceCode` object, and it reports nothing.
 */
import type { Linter } from "eslint"
import { Linter as LinterClass } from "eslint"
import type { Node } from "@mmd-toolkit/parser"
import type { DiagramType, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import plugin from "../src/index.ts"
import type { MermaidRuleDefinition, MermaidSourceCode } from "../src/index.ts"

/** One visit of ESLint to a node: entering it or leaving it. */
export interface Visit {
  readonly phase: "enter" | "leave"
  readonly node: Node
}

/** What the observing rule saw, and the messages of the Linter. */
export interface Observation {
  readonly messages: Linter.LintMessage[]
  /** Null when the text was not parsed, and so no rule ran. */
  readonly sourceCode: MermaidSourceCode | null
  readonly visits: readonly Visit[]
}

/** The file name given to the Linter: the recommended configuration matches `.mmd`. */
const FILENAME = "input.mmd"

/**
 * ESLint removes a byte order mark at the start of a file before the language
 * parses it, so the language reads the text without it.
 */
export function withoutByteOrderMark(text: string): string {
  return text.startsWith("\uFEFF") ? text.slice(1) : text
}

/** Lints `text` with the plugin's recommended configuration and the observing rule. */
export function observe(text: string): Observation {
  let sourceCode: MermaidSourceCode | null = null
  const visits: Visit[] = []
  const observer: MermaidRuleDefinition = {
    meta: { type: "problem" },
    create(context) {
      sourceCode = context.sourceCode
      return {
        "*"(node: Node) {
          visits.push({ phase: "enter", node })
        },
        "*:exit"(node: Node) {
          visits.push({ phase: "leave", node })
        },
      }
    },
  }
  const config: Linter.Config[] = [
    plugin.configs.recommended,
    {
      files: ["**/*.mmd"],
      plugins: { test: { rules: { observe: observer } } },
      rules: { "test/observe": "error" },
    },
  ]
  const messages = new LinterClass({ configType: "flat" }).verify(
    text,
    config,
    FILENAME,
  )
  return { messages, sourceCode, visits }
}

/**
 * Every directory of fixtures of the conformance corpus. The type makes a
 * diagram type added to `DiagramType` an error here until it is listed.
 */
const CORPUS_DIAGRAMS: Record<DiagramType, true> = {
  common: true,
  flowchart: true,
  sequence: true,
  class: true,
}

/** Every fixture of the conformance corpus, of every diagram type. */
export async function loadCorpus(): Promise<Fixture[]> {
  const diagrams = Object.keys(CORPUS_DIAGRAMS) as DiagramType[]
  const fixtures = await Promise.all(
    diagrams.map((diagram) => loadFixtures(diagram)),
  )
  return fixtures.flat()
}
