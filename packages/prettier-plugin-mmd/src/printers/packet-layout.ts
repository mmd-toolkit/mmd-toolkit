import type {
  Node,
  PacketBodyItem,
  PacketDiagram,
  PacketIgnoredText,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  protectSemicolonPrefixes,
} from "./layout.ts"
import type { Source } from "./source.ts"
import { findStructuralToken } from "./source.ts"

/** Written leaves retain quotes, digits and hidden source (docs/packet.md). */
export const packetValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "NumericLiteral",
  "PacketLiteral",
  "PacketIgnoredText",
])

/** The first atom is the authored header keyword, after any retained prefix. */
export function layoutPacketHeader(
  source: Source,
  diagram: PacketDiagram,
): AtomLayout {
  const keyword = expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the packet header",
  )
  return {
    atoms: [{ start: keyword.range[0], end: keyword.range[1] }],
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * Ordinary block components touch except after the colon. Hidden/global
 * trivia retain their source boundaries; common forms use shared layouts
 * (diagrams/packet.md, Grammar; docs/packet.md, Range dash, Relative plus
 * and Block colons).
 */
export function layoutPacketStatement(
  source: Source,
  statement: PacketBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  const values = collectValueNodes(statement, packetValueNodeTypes)
  const hidden = values.filter(
    (value): value is PacketIgnoredText => value.type === "PacketIgnoredText",
  )
  let layout: AtomLayout
  switch (statement.type) {
    case "PacketIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules: new Map(),
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "PacketAccDescrBlockStatement":
      layout = layoutCommonDescription(source, statement, packetValueNodeTypes)
      break
    case "PacketTitleStatement":
    case "PacketAccTitleStatement":
    case "PacketAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "PacketTitleStatement",
      )
      break
    case "PacketRangeBlockStatement":
    case "PacketSingleBlockStatement":
    case "PacketRelativeBlockStatement": {
      const atoms = collectAtoms(source, start, end, values, [])
      const rules = new Map<number, GapRule>()
      for (const atom of atoms.slice(1)) {
        rules.set(
          atom.start,
          atom.start === statement.label.range[0] ? "space" : "none",
        )
      }
      layout = { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown packet item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(source, start, end, layout.atoms),
    },
    hidden,
  )
}
