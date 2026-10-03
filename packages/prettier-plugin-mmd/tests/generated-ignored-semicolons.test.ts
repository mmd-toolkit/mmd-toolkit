/**
 * Formats statements whose Db text reaches past the range of a node with
 * `;` written inside and after that text: one to three `;`, with whitespace
 * or a directive around them, at every place where the Db reads the text
 * (the styles of a flowchart, the name of a subgraph, a sequence title, a
 * generic type, the second description of an alias, a note). Each line
 * holds `style:#x`, so the line rule ignores the last `;` of it, and the
 * others separate statements or belong to the text. Formatting must keep
 * what mermaid.js reads from the Db text (diagrams/<diagram>.md, Building
 * the summary from the tree) whichever `;` the rule ignores.
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** The marker in a template, where `;` and whitespace are put. */
const MARKER = "@"

/** A diagram type with templates for the places that the Db reads. */
interface Templates {
  readonly header: string
  readonly templates: readonly string[]
}

const templatesByDiagram: readonly Templates[] = [
  {
    header: "flowchart LR",
    templates: [
      "style A fill:#f00@,@ stroke:#333@",
      "style A style:#x@,@  fill:red@",
      "classDef c fill:#f00@,  @,@ stroke:#333@",
      "linkStyle 0 stroke:#f00@ ,@ fill:red@",
      "linkStyle default interpolate basis@ stroke:style:#x@",
      "style A fill:#f00 accDescr {}@ accDescr {}@",
      "subgraph S style:#x@",
      'subgraph "S" style:#x@',
      "subgraph style:#x@ accDescr {}@",
    ],
  },
  {
    header: "sequenceDiagram",
    templates: [
      "title style:#x@",
      "title: style:#x@",
      "title@ style:#x@",
      "title%%{init: {}}%% style:#x@",
      "title\n  style:#x@",
      "title style:#x@ accDescr {}@",
    ],
  },
  {
    header: "classDiagram",
    templates: [
      "class A~style:#x~@",
      "class A~ style:#x ~@",
      "class A~  ~@",
      "A : + style:#x@ int",
      "class A {\n+int style:#x@\n}",
    ],
  },
  {
    header: "stateDiagram-v2",
    templates: [
      'state "d" as A@ : style:#x@ : y@',
      'state "d" as A : style:#x@',
      'state "d" as A style:#x@',
      'state "d" as A : x@',
      "note left of A@ : style:#x@",
      "note left of A  : style:#x@",
    ],
  },
]

/** What can stand at a marker when a template has one marker. */
const fillsForOne: readonly string[] = [
  "",
  ";",
  " ;",
  "; ",
  " ; ",
  ";;",
  "; ;",
  ";;;",
  "; ; ;",
  ";  ",
  ";\t",
  " ;  ",
  " %%{init: {}}%%;",
  ";%%{init: {}}%% ",
]

/** What can stand at a marker when a template has several. */
const fillsForMany: readonly string[] = ["", ";", " ;", "; ", ";;", " ; ; "]

/** The text from `parts` with `fills` put between them, after `text`. */
function* fillParts(
  parts: readonly string[],
  fills: readonly string[],
  index: number,
  text: string,
): Generator<string> {
  if (index === parts.length) {
    yield text
    return
  }
  for (const fill of index === 0 ? [""] : fills) {
    yield* fillParts(parts, fills, index + 1, `${text}${fill}${parts[index]}`)
  }
}

/** Every template with every combination of fills at its markers. */
function fillTemplate(template: string): Generator<string> {
  const parts = template.split(MARKER)
  return fillParts(
    parts,
    parts.length === 2 ? fillsForOne : fillsForMany,
    0,
    "",
  )
}

/** Every template filled, alone and followed by another statement. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const { header, templates } of templatesByDiagram) {
    for (const template of templates) {
      for (const statement of fillTemplate(template)) {
        const closing = statement.startsWith("subgraph") ? "\nend" : ""
        yield { text: `${header}\n${statement}\nA${closing}\n`, options: {} }
        yield { text: `${header}\n${statement}${closing}\n`, options: {} }
      }
    }
  }
}

/** What is put at an offset of a statement. */
const insertions: readonly string[] = [";", " ;", "; ", ";;"]

/** What follows the statement after the insertion. */
const trailings: readonly string[] = ["", "  "]

/**
 * Every template without its markers, with one insertion at each of its
 * offsets: the places inside a Db text, before it, and after it.
 */
function* makeSweepInputs(): Generator<GeneratedInput> {
  for (const { header, templates } of templatesByDiagram) {
    for (const template of templates) {
      const statement = template.split(MARKER).join("")
      const closing = statement.startsWith("subgraph") ? "\nend" : ""
      for (let offset = 0; offset <= statement.length; offset++) {
        for (const insertion of insertions) {
          for (const trailing of trailings) {
            const text = `${statement.slice(0, offset)}${insertion}${statement.slice(offset)}${trailing}`
            yield { text: `${header}\n${text}${closing}\n`, options: {} }
          }
        }
      }
    }
  }
}

describe("a Db text with `;` written in and after it", () => {
  it("is formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(
      [makeInputs, makeSweepInputs].flatMap((make) => [...make()]),
    )
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 1_800_000)
})
