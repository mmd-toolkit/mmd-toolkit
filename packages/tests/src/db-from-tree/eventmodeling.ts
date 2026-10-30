import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import { isWhitespace } from "./characters.ts"
import type {
  EventmodelingData,
  EventmodelingDiagram,
} from "./eventmodeling-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeNode, TreeRoot } from "./tree.ts"

/** docs/db-from-tree/eventmodeling.md: publish accepted authored occurrences. */
export function eventmodelingDbOf(
  source: string,
  root: TreeRoot,
  diagram: EventmodelingDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const characters = readConvertedCharacters(source, root)
  const text = new ConvertedText(characters)
  const replace = textReplacementOf(embedded.config)
  const declarations = new Map<string, EventmodelingData>()
  const frames: JsonObject[] = []
  let accTitle = ""
  let accDescr = ""

  /** The entire EM_* terminal includes the surviving horizontal prefix. */
  function common(node: TreeNode): string {
    const before = text.indexAt(node.range[0])
    let prefix = ""
    for (let at = before - 1; at >= 0; at--) {
      const code = characters[at]?.codePoint
      if (code !== 0x20 && code !== 0x09) break
      prefix = String.fromCodePoint(code) + prefix
    }
    return prefix + text.of(node.range)
  }

  /** The common description setter folds whitespace after LF, without trimming. */
  function description(node: TreeNode): string {
    const value = replace(common(node))
    let result = ""
    for (let at = 0; at < value.length; at++) {
      result += value.charAt(at)
      if (value.charAt(at) === "\n")
        while (isWhitespace(value.charCodeAt(at + 1))) at++
    }
    return result
  }

  /** Retain body delimiters and the block terminal's immediately consumed LF. */
  function data(node: EventmodelingData): JsonObject {
    const quoted = node.value?.type === "StringLiteral"
    const open = text
      .tokensIn(node.range, root.tokens)
      .find((token) => token.type === "Punctuator" && token.value === "{")
    let value = quoted
      ? text.of(node.value.range)
      : text.of([open!.range[0], node.range[1]])
    if (node.type === "EventmodelingDataBlock") {
      // Include the logical LF that readConvertedCharacters appends at source.length.
      if (text.of([node.range[1], source.length + 1]).startsWith("\n"))
        value += "\n"
      return { kind: "block", value }
    }
    return { kind: "inline", value }
  }

  for (const statement of diagram.body)
    if (statement.type === "EventmodelingDataEntityStatement") {
      const name = text.of(statement.name.range)
      if (!declarations.has(name)) declarations.set(name, statement.data)
    }
  for (const statement of diagram.body) {
    switch (statement.type) {
      case "EventmodelingAccTitleStatement":
        accTitle = replace(common(statement)).trimStart()
        break
      case "EventmodelingAccDescrStatement":
      case "EventmodelingAccDescrBlockStatement":
        accDescr = description(statement)
        break
      case "EventmodelingTimeFrameStatement":
      case "EventmodelingResetFrameStatement": {
        const referenced =
          statement.dataReference === null
            ? undefined
            : declarations.get(text.of(statement.dataReference.name.range))
        const selected = referenced ?? statement.data
        frames.push({
          kind:
            statement.type === "EventmodelingTimeFrameStatement"
              ? "time"
              : "reset",
          name: text.of(statement.name.range),
          modelEntityType: statement.modelEntityType,
          entityIdentifier: [
            statement.entityIdentifier.head,
            ...statement.entityIdentifier.tail.map((part) => part.name),
          ]
            .map((part) => text.of(part.range))
            .join("."),
          sourceFrames: [
            ...new Set(
              statement.sourceFrames.map((part) => text.of(part.frame.range)),
            ),
          ].sort(),
          data: selected === null ? null : data(selected),
        })
        break
      }
      case "EventmodelingTitleStatement":
      case "EventmodelingDataEntityStatement":
      case "EventmodelingModelEntityStatement":
      case "EventmodelingNoteStatement":
      case "EventmodelingGwtStatement":
      case "EventmodelingIgnoredText":
        break
      default:
        throw new Error(
          `eventmodeling Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return { accTitle, accDescr, frames }
}
