/**
 * common.md, Entities: where a rule reads one character at a time, the
 * placeholder of an entity is one unit, which holds the entity's source
 * characters (in flowchart, the link text contexts and the ellipse
 * context). Each input puts an entity into a link text or an ellipse label,
 * at every position; `parse()` must accept and reject what the pinned
 * mermaid.js does, give its Db, and give a tree that passes the check.
 */
import { describe, expect, it } from "vitest"
import { runMermaidWithEmbeddedData } from "@mmd-toolkit/tests/mermaid"
import { ParseError, parse } from "../../src/index.ts"
import { problemsOfTree } from "../../tests/helpers/tree-problems.ts"
import { dbOfTree } from "../../tests/helpers/db-of-tree.ts"

/** Texts whose link text or ellipse label the entities are put into. */
const bases = [
  "flowchart LR\nA-- t -->B",
  "flowchart LR\nA== t ==>B",
  "flowchart LR\nA-. t .->B",
  "flowchart LR\nA(-t-)",
]

/** A named entity, a numeric entity, and one whose word is a head letter. */
const entities = ["#amp;", "#35;", "#x;"]

/** Each entity at each position after the header of each base. */
function insertedInputs(): string[] {
  const inputs: string[] = []
  for (const base of bases) {
    const bodyStart = base.indexOf("\n") + 1
    for (let at = bodyStart; at <= base.length; at++) {
      for (const entity of entities) {
        inputs.push(base.slice(0, at) + entity + base.slice(at))
      }
    }
  }
  return inputs
}

const inputs = [
  ...insertedInputs(),
  "flowchart LR\nA--#x;#y;-->B",
  "flowchart LR\nA--#x%%{init: {}}%%y;-->B",
  "flowchart LR\nA--#x;--#y;-->B",
  "flowchart LR\nA#x;-->B",
]

describe("an entity in a context that reads one character at a time", () => {
  it.each(inputs)("%j", async (text) => {
    const run = await runMermaidWithEmbeddedData(text)
    let root
    try {
      root = parse(text)
    } catch (error) {
      // An internal error is no rejection.
      if (!(error instanceof ParseError)) throw error
      expect(run.outcome.accepted, error.message).toBe(false)
      return
    }
    if (!run.outcome.accepted || run.embedded === undefined) {
      throw new Error("mermaid.js rejects what parse() accepts")
    }
    expect(problemsOfTree(text, root)).toEqual([])
    expect(dbOfTree(text, root, run.embedded)).toEqual(run.outcome.db)
  })
})
