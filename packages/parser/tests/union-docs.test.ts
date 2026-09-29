import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// The union types of fixed words describe each value twice: in the list of
// the JSDoc before the type, which an editor shows on the type's name, and
// in the JSDoc of each member, for a reader of the source. The two must say
// the same thing. The source is read with string operations only.

/** The union types whose values are documented, by the source file that defines them. */
const DOCUMENTED_UNIONS: Readonly<Record<string, readonly string[]>> = {
  "src/ast.ts": ["DiagramTokenKind", "TokenKind"],
  "src/ast/flowchart.ts": [
    "FlowchartShapeName",
    "FlowchartArrowMarker",
    "FlowchartArrowLine",
    "FlowchartOpeningArrowLine",
    "FlowchartLabelKind",
    "FlowchartLinkTarget",
    "FlowchartStatementDirection",
  ],
  "src/ast/sequence.ts": [
    "SequenceParticipantKind",
    "SequenceActivation",
    "SequenceArrowMarker",
    "SequenceArrowLine",
    "SequenceNotePlacement",
    "SequenceWrap",
  ],
}

/** The descriptions of the values of one union type, as two lists of `[value, text]`. */
interface UnionDocs {
  /** From the list in the JSDoc before the type, in its order. */
  readonly list: [string, string][]
  /** From the JSDoc of each member that is a string literal, in its order. */
  readonly members: [string, string][]
}

/** The start of an entry of the list: `- ` and the value in quotes, in a code span. */
const ENTRY_START = '- `"'

/** The end of the value of an entry, before its text. */
const ENTRY_VALUE_END = '"`: '

/**
 * The descriptions of the union type `name` in the source `text`. An entry
 * of the list is a line ` * - \`"value"\`: text`, continued by the lines
 * that start with ` *   `; a member is a line `| "value"` after a line
 * `/** text *\/`.
 */
function unionDocsOf(text: string, name: string): UnionDocs {
  const declaration = `export type ${name} =`
  const declarationStart = text.indexOf(declaration)
  if (declarationStart === -1) throw new Error(`no type ${name}`)
  const docStart = text.lastIndexOf("/**", declarationStart)
  const list: [string, string][] = []
  for (const line of text.slice(docStart, declarationStart).split("\n")) {
    const content = line.startsWith(" * ") ? line.slice(3) : null
    if (content?.startsWith(ENTRY_START)) {
      const valueEnd = content.indexOf(ENTRY_VALUE_END)
      list.push([
        content.slice(ENTRY_START.length, valueEnd),
        content.slice(valueEnd + ENTRY_VALUE_END.length),
      ])
    } else if (content?.startsWith("  ") && list.length > 0) {
      const last = list[list.length - 1]
      last[1] = `${last[1]} ${content.trim()}`
    }
  }
  const bodyEnd = text.indexOf("\n\n", declarationStart)
  const members: [string, string][] = []
  let comment: string | null = null
  for (const line of text.slice(declarationStart, bodyEnd).split("\n")) {
    const trimmed = line.trim()
    if (trimmed.startsWith("/** ") && trimmed.endsWith(" */")) {
      comment = trimmed.slice("/** ".length, -" */".length)
    } else if (trimmed.startsWith('| "')) {
      members.push([trimmed.slice('| "'.length, -1), comment ?? ""])
      comment = null
    }
  }
  return { list, members }
}

describe("the documented union types", () => {
  for (const [file, names] of Object.entries(DOCUMENTED_UNIONS)) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
    for (const name of names) {
      it(`${name} says the same of each value in its list and in its member`, () => {
        const { list, members } = unionDocsOf(text, name)
        expect(members.length).toBeGreaterThan(0)
        expect(members.every(([, comment]) => comment !== "")).toBe(true)
        expect(list).toEqual(members)
      })
    }
  }
})
