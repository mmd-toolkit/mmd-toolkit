/**
 * Checks that the rules of a diagram type report nothing on the trees of the
 * other diagram types. A rule of a diagram type has handlers only for the node
 * types of its diagram type, so ESLint never calls them on another diagram;
 * a rule that starts from `Root` and forgets to look at the diagram type is
 * caught here. A few inputs of the corpus that the parser accepts for each
 * type of diagram (`tests/corpus-kinds.ts`) are run with the rules of every
 * diagram type but its own.
 */
import type { Linter } from "eslint"
import { Linter as LinterClass } from "eslint"
import { describe, expect, it } from "vitest"
import type { DiagramBody } from "@mmd-toolkit/parser"
import { rules } from "../src/rules/index.ts"
import { kindedInputs, pickByKind } from "./corpus-kinds.ts"
import { LANGUAGE_CONFIG, loadCorpus } from "./helpers.ts"

/**
 * The directories of the rules of a diagram type, each with the type of the
 * diagram whose tree its rules read. A directory is named after the document
 * of `@mmd-toolkit/spec` that defines the nodes of the diagram type.
 */
const RULE_DIAGRAMS: Readonly<Record<string, DiagramBody["type"]>> = {
  class: "ClassDiagram",
  flowchart: "FlowchartDiagram",
  sequence: "SequenceDiagram",
  state: "StateDiagram",
}

/** The directory of a rule of a diagram type, or null for a common rule. */
function directoryOf(name: string): string | null {
  const slash = name.indexOf("/")
  return slash === -1 ? null : name.slice(0, slash)
}

/** The configuration that enables, as errors, the rules of every diagram type whose diagram is not `body`. */
function otherDiagramRules(body: DiagramBody["type"]): Linter.Config {
  const enabled = Object.keys(rules).filter((name) => {
    const directory = directoryOf(name)
    return directory !== null && RULE_DIAGRAMS[directory] !== body
  })
  return {
    ...LANGUAGE_CONFIG,
    rules: Object.fromEntries(enabled.map((name) => [`mmd/${name}`, "error"])),
  }
}

/**
 * A few inputs of the corpus that the parser accepts for each type of diagram,
 * each with the type of its diagram: whether a rule reports on another diagram
 * does not depend on the other kinds of input.
 */
const accepted = pickByKind(
  kindedInputs(await loadCorpus()).filter((input) => input.root !== null),
  (input) => input.kinds.filter((kind) => kind.startsWith("body:")),
).flatMap((input) =>
  input.root === null
    ? []
    : [
        {
          name: input.name,
          input: input.fixture.input,
          body: input.root.body.type,
        },
      ],
)

const linter = new LinterClass({ configType: "flat" })

describe("the rules of a diagram type", () => {
  it("have a directory listed here", () => {
    const directories = new Set(
      Object.keys(rules).flatMap((name) => directoryOf(name) ?? []),
    )
    for (const directory of directories) {
      expect(RULE_DIAGRAMS).toHaveProperty(directory)
    }
  })

  it.each(accepted.map((input) => [input.name, input]))(
    "report nothing on %s, except those of its diagram type",
    (_name, input) => {
      const messages = linter.verify(
        input.input,
        otherDiagramRules(input.body),
        "input.mmd",
      )
      expect(messages).toEqual([])
    },
  )
})
