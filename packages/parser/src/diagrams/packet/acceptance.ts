import type { PacketDiagram, PacketBodyItem } from "../../ast/packet.ts"
import { ParseError } from "../../errors.ts"

/** diagrams/packet.md, Semantic acceptance conditions: ordered double arithmetic and row-boundary gates. */
export function checkPacketBlocks(
  diagram: PacketDiagram,
  bitsPerRow = 32,
): void {
  let lastEnd = -1
  let row = 1
  let fragments = 0
  let publishedRows = 0
  for (const statement of diagram.body) {
    if (
      statement.type !== "PacketRangeBlockStatement" &&
      statement.type !== "PacketSingleBlockStatement" &&
      statement.type !== "PacketRelativeBlockStatement"
    )
      continue
    if (
      statement.type === "PacketRangeBlockStatement" &&
      statement.end.value < statement.start.value
    )
      rejectBlock(statement, "Packet range end is less than its start")
    const nextStart = lastEnd + 1
    const start =
      statement.type === "PacketRelativeBlockStatement"
        ? nextStart
        : statement.start.value
    if (start !== nextStart)
      rejectBlock(
        statement,
        "Packet block start must follow the previous logical endpoint",
      )
    if (
      statement.type === "PacketRelativeBlockStatement" &&
      statement.count.value === 0
    )
      rejectBlock(statement, "Packet relative count must be greater than zero")
    const end =
      statement.type === "PacketRangeBlockStatement"
        ? statement.end.value
        : start +
          (statement.type === "PacketSingleBlockStatement"
            ? 1
            : statement.count.value) -
          1
    lastEnd = end
    let pendingStart = start
    while (fragments <= bitsPerRow + 1 && publishedRows < 10_000) {
      if (pendingStart > end)
        rejectBlock(statement, "Packet fragment start exceeds its end")
      const boundary = row * bitsPerRow
      const remainder = !(end + 1 <= boundary)
      const fittingEnd = remainder ? boundary - 1 : end
      fragments += 1
      if (fittingEnd + 1 === boundary) {
        publishedRows += 1
        row += 1
        fragments = 0
      }
      if (!remainder) break
      pendingStart = boundary
    }
  }
}

/** Error positions: a semantic rejection covers the authored block, including its hidden suffix. */
function rejectBlock(statement: PacketBodyItem, message: string): never {
  throw new ParseError(message, statement.range, statement.loc)
}
