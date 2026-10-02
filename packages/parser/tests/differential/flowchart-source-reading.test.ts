/**
 * The test helpers that read a flowchart's source again, the Db summary
 * (`dbOf`) and the check of the tree (`checkTree`), take every lexical
 * decision from the parser's units: where a string's content lies, which
 * `click` is a `click` unit, and where the first style of a statement
 * starts. Each input here once made a helper decide one of these by a rule
 * of its own; the Db built from the tree must be that of the pinned
 * mermaid.js, and the tree must pass the check.
 *
 * The inputs with an empty string were read by those helpers before the
 * specification rejected empty strings
 * (known-divergences/tokenless-empty-forms.md). They stay as inputs of that
 * divergence: the parser rejects each at its empty string, and where its lexer
 * reads the reference input as the units of the input but those of the empty
 * strings, and accepts it, the Db of the reference input is the Db that
 * mermaid.js gives the input.
 */
import { describe, expect, it } from "vitest"
import { runMermaidWithEmbeddedData } from "@mmd-toolkit/tests/mermaid"
import { parse } from "../../src/index.ts"
import { checkTree } from "../helpers/check-tree.ts"
import { dbOf } from "../helpers/db.ts"
import {
  keepsUnitsWithoutEmptyForms,
  withoutEmptyForms,
} from "../helpers/reference-inputs.ts"

const inputs = [
  // A `click` inside a string or inside an id run is no `click` unit.
  'flowchart TD\nsubgraph "click me"\nend',
  'flowchart TD\nsubgraph "click me"[Title]\nend',
  "flowchart TD\nsubgraph xclick me\nA\nend",
  // The content of a string, with nested contexts, an ignored `;` between
  // delimiters, and attribute quotes.
  'flowchart TD\nA[""`x`""]',
  'flowchart TD\nA\nclick A href "u"``""',
  'flowchart TD\nA["style:#x";``""]',
  'flowchart TD\nA["<a x="y""] --> B',
]

describe("the helpers read a flowchart's source through the parser's units", () => {
  it.each(inputs)("%j", async (text) => {
    const run = await runMermaidWithEmbeddedData(text)
    if (!run.outcome.accepted || run.embedded === undefined) {
      throw new Error("mermaid.js rejects the input")
    }
    const root = parse(text)
    checkTree(text, root)
    expect(dbOf(text, root, run.embedded)).toEqual(run.outcome.db)
  })
})

const inputsWithEmptyStrings = [
  // Empty strings that are not `""`.
  'flowchart LR\n1"``"2-->B',
  'flowchart LR\nstyle A fill:"``"red',
  'flowchart LR\nA["x""``"y]',
  'flowchart TD\nA["``"x]',
  // An empty string after the `space` that a statement reads before its
  // styles.
  'flowchart LR\nA-->B\nlinkStyle 0 "" fill:red',
  'flowchart LR\nstyle A "" fill:red',
  'flowchart LR\nclassDef c "" fill:red',
  'flowchart LR\nstyle A "" ,fill:red',
  // The same, where the statement ends after the empty string.
  'flowchart LR\nstyle A "" ;fill:red',
  'flowchart LR\nstyle A "" ;',
  'flowchart LR\nstyle A "" \nB',
  'flowchart LR\nstyle A """" ;B',
  'flowchart LR\nstyle A "``" ;B',
  'flowchart LR\nclassDef c "" ;B',
  'flowchart LR\nclassDef a,b "" ;B',
  'flowchart LR\nA-->B\nlinkStyle 0 "" ;C',
  'flowchart LR\nA-->B\nlinkStyle 0,0 "" ;C',
  'flowchart LR\nA-->B\nlinkStyle default "" ;C',
  'flowchart LR\nA-->B\nlinkStyle 0 interpolate basis "" ;C',
  'flowchart LR\nA-->B\nlinkStyle default interpolate basis "" ;C',
]

describe("the helpers read the reference input of an empty string through the parser's units", () => {
  it.each(inputsWithEmptyStrings)("%j", async (text) => {
    const run = await runMermaidWithEmbeddedData(text)
    if (!run.outcome.accepted || run.embedded === undefined) {
      throw new Error("mermaid.js rejects the input")
    }
    expect(() => parse(text)).toThrow("An empty string cannot be written here")
    const reference = withoutEmptyForms(text)
    if (reference === null || !keepsUnitsWithoutEmptyForms(text)) return
    const root = parse(reference)
    checkTree(reference, root)
    expect(dbOf(reference, root, run.embedded)).toEqual(run.outcome.db)
  })
})
