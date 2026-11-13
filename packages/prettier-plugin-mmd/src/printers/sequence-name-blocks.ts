import type {
  Node,
  SequenceDataBlock,
  SequenceParticipantStatement,
  SequenceStatement,
} from "@mmd-toolkit/ast"
import { walk } from "./layout.ts"
import type { Source } from "./source.ts"

/**
 * Whether a version that counts reads the text of a data block as a part of
 * the name of its participant: the versions before the data blocks have the
 * name rule `[^\->:\n,;]+?...`, which takes the `@{`, the text, and the `}`
 * into the name when the text holds none of the characters that end a name,
 * and the name is the text of the actor box. The whitespace of the block, and
 * the whitespace between the id and the `@{`, is then part of the name. A
 * text with a `:`, a `,`, a `;`, or a `>` is rejected there in both forms
 * (docs/sequence.md, Whitespace between tokens).
 */
export function isNameToOlderVersions(text: string): boolean {
  return ![":", ",", ";", ">", "\n", "\r"].some((character) =>
    text.includes(character),
  )
}

/**
 * Whether the statement has a data block that a version that counts reads as
 * a part of its name. Those versions have no `create`, and reject it.
 */
export function holdsNameLikeDataBlock(
  statement: SequenceStatement,
): statement is SequenceParticipantStatement & { data: SequenceDataBlock } {
  return (
    statement.type === "SequenceParticipantStatement" &&
    !statement.created &&
    statement.data !== null &&
    isNameToOlderVersions(statement.data.value)
  )
}

/** The data blocks that are read so, found once per source. */
const nameBlocksBySource = new WeakMap<Source, ReadonlySet<Node>>()

/** Whether the data block is one that a version that counts reads as a part of a name. */
export function isNameLikeDataBlock(source: Source, block: Node): boolean {
  let found = nameBlocksBySource.get(source)
  if (found === undefined) {
    const blocks = new Set<Node>()
    walk(source.root, (node) => {
      if (node.type === "SequenceParticipantStatement") {
        const statement = node as SequenceStatement
        if (holdsNameLikeDataBlock(statement)) blocks.add(statement.data)
      }
    })
    found = blocks
    nameBlocksBySource.set(source, found)
  }
  return found.has(block)
}
