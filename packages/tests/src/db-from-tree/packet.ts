import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { PacketDiagram } from "./packet-tree.ts"
import { commonValue, decodedString } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** docs/db-from-tree/packet.md: logical endpoints and the published rows have separate state. */
export function packetDbOf(
  source: string,
  root: TreeRoot,
  diagram: PacketDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const config = embedded.config.packet
  const settings =
    typeof config === "object" && config !== null && !Array.isArray(config)
      ? (config as JsonObject)
      : {}
  const width = settings.bitsPerRow ?? 32
  const rowWidth = Number(width)
  // The publication guard adds before comparing: a string concatenates with 1.
  const limit = Number(typeof width === "string" ? `${width}1` : rowWidth + 1)
  const packet: JsonObject[][] = []
  let word: JsonObject[] = []
  let row = 1
  let lastEnd = -1
  let title = ""
  let accTitle = ""
  let accDescr = ""
  for (const statement of diagram.body) {
    switch (statement.type) {
      case "PacketIgnoredText":
        break
      case "PacketTitleStatement":
      case "PacketAccTitleStatement":
      case "PacketAccDescrStatement":
      case "PacketAccDescrBlockStatement": {
        const value = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "PacketAccDescrBlockStatement",
        )
        if (statement.type === "PacketTitleStatement") title = value
        else if (statement.type === "PacketAccTitleStatement") accTitle = value
        else accDescr = value
        break
      }
      case "PacketRangeBlockStatement":
      case "PacketSingleBlockStatement":
      case "PacketRelativeBlockStatement": {
        let start =
          statement.type === "PacketRelativeBlockStatement"
            ? lastEnd + 1
            : Number(text.of(statement.start.range))
        const end =
          statement.type === "PacketRangeBlockStatement"
            ? Number(text.of(statement.end.range))
            : start +
              (statement.type === "PacketRelativeBlockStatement"
                ? Number(text.of(statement.count.range))
                : 1) -
              1
        lastEnd = end
        const label = decodedString(
          text.of([statement.label.range[0] + 1, statement.label.range[1] - 1]),
        )
        while (word.length <= limit && packet.length < 10_000) {
          const boundary = row * rowWidth
          const fits = end + 1 <= boundary
          const blockEnd = fits ? end : boundary - 1
          word.push({
            start: numberOrText(start),
            end: numberOrText(blockEnd),
            label,
          })
          if (blockEnd + 1 === boundary) {
            packet.push(word)
            word = []
            row++
          }
          if (fits) break
          start = boundary
        }
        break
      }
      default:
        throw new Error(
          `packet Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  if (word.length > 0) packet.push(word)
  return {
    title: replace(title || embedded.title || ""),
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    packet,
  }
}
