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
import type { GeneratedInput } from "../generated.ts"
import { pairwiseIndexes } from "../pairwise.ts"

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

/**
 * Every template with the fills at its markers: every fill for a template
 * with one marker, and for the others the fills together in pairs (see
 * `pairwise.ts`).
 */
function fillTemplate(template: string): string[] {
  const parts = template.split(MARKER)
  const markers = parts.length - 1
  if (markers === 0) return [template]
  const fills = markers === 1 ? fillsForOne : fillsForMany
  return pairwiseIndexes(
    Array.from({ length: markers }, () => fills.length),
  ).map((row) =>
    parts
      .map((part, index) =>
        index === 0 ? part : `${fills[row[index - 1]]}${part}`,
      )
      .join(""),
  )
}

/** Every template filled, alone and followed by another statement. */
export function* makeInputs(): Generator<GeneratedInput> {
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
 * Whether a word of letters and digits starts or ends at the offset, or
 * the text does: inside a word every offset reads the same.
 */
function isWordEdge(text: string, offset: number): boolean {
  return isWordCharacter(text[offset - 1]) !== isWordCharacter(text[offset])
}

/** Whether a character is an ASCII letter or digit. */
function isWordCharacter(character: string | undefined): boolean {
  return (
    character !== undefined &&
    ((character >= "0" && character <= "9") ||
      (character >= "A" && character <= "Z") ||
      (character >= "a" && character <= "z"))
  )
}

/**
 * Every template without its markers, with one insertion at each of its
 * word edges: the places inside a Db text, before it, and after it.
 */
export function* makeSweepInputs(): Generator<GeneratedInput> {
  for (const { header, templates } of templatesByDiagram) {
    for (const template of templates) {
      const statement = template.split(MARKER).join("")
      const closing = statement.startsWith("subgraph") ? "\nend" : ""
      for (let offset = 0; offset <= statement.length; offset++) {
        if (!isWordEdge(statement, offset)) continue
        for (const [index, insertion] of insertions.entries()) {
          // The trailing text takes turns from one insertion and offset to
          // the next.
          const trailing = trailings[(index + offset) % trailings.length]
          const text = `${statement.slice(0, offset)}${insertion}${statement.slice(offset)}${trailing}`
          yield { text: `${header}\n${text}${closing}\n`, options: {} }
        }
      }
    }
  }
}
