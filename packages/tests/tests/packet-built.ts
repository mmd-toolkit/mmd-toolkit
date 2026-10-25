import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** A fixed source and its explicitly supplied packet occurrences, without a parser. */
export function buildPacket(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  header: "packet" | "packet-beta" = "packet",
): Built {
  return buildTree(
    {
      header,
      diagramType: "packet",
      bodyType: "PacketDiagram",
      bodyFields: (body) => ({ textBeforeHeader: [], body }),
    },
    source,
    make,
  )
}

/** A complete written number, including its rounded double value. */
export function number(kit: Kit, raw: string): CheckedNode {
  return kit.node("NumericLiteral", kit.token("Numeric", raw).range, {
    raw,
    value: Number(raw),
  })
}

/** A complete quoted label; its value keeps authored escapes. */
export function string(kit: Kit, raw: string): CheckedNode {
  return kit.node("StringLiteral", kit.token("String", raw).range, {
    raw,
    value: raw.slice(1, -1),
    closed: true,
  })
}

/** Hidden occurrences are supplied in their named authored gaps. */
interface LabelGaps {
  readonly beforeColon?: () => CheckedNode[]
  readonly beforeLabel?: () => CheckedNode[]
  readonly after?: () => CheckedNode[]
}

/** The common authored colon/label/suffix, after each form's numeric components. */
function labelFields(kit: Kit, raw: string, gaps: LabelGaps) {
  const textBeforeColon = gaps.beforeColon?.() ?? []
  const colon = kit.token("Punctuator", ":")
  const textBeforeLabel = gaps.beforeLabel?.() ?? []
  const label = string(kit, raw)
  const textAfter = gaps.after?.() ?? []
  return {
    fields: { textBeforeColon, textBeforeLabel, label, textAfter },
    pieces: [
      ...textBeforeColon,
      colon,
      ...textBeforeLabel,
      label,
      ...textAfter,
    ],
  }
}

/** A range retains both written endpoints and all four internal gaps. */
export function range(
  kit: Kit,
  startRaw: string,
  endRaw: string,
  raw: string,
  gaps: LabelGaps & {
    readonly beforeDash?: () => CheckedNode[]
    readonly beforeEnd?: () => CheckedNode[]
  } = {},
): CheckedNode {
  const start = number(kit, startRaw)
  const textBeforeDash = gaps.beforeDash?.() ?? []
  const dash = kit.token("Punctuator", "-")
  const textBeforeEnd = gaps.beforeEnd?.() ?? []
  const end = number(kit, endRaw)
  const label = labelFields(kit, raw, gaps)
  return kit.node(
    "PacketRangeBlockStatement",
    hull([
      start,
      ...textBeforeDash,
      dash,
      ...textBeforeEnd,
      end,
      ...label.pieces,
    ]),
    {
      start,
      textBeforeDash,
      textBeforeEnd,
      end,
      ...label.fields,
    },
  )
}

/** A single position has no synthesized end. */
export function single(
  kit: Kit,
  raw: string,
  labelRaw: string,
  gaps: LabelGaps = {},
): CheckedNode {
  const start = number(kit, raw)
  const label = labelFields(kit, labelRaw, gaps)
  return kit.node(
    "PacketSingleBlockStatement",
    hull([start, ...label.pieces]),
    { start, ...label.fields },
  )
}

/** A relative block retains plus and count, without absolute endpoints. */
export function relative(
  kit: Kit,
  raw: string,
  labelRaw: string,
  gaps: LabelGaps & { readonly beforeCount?: () => CheckedNode[] } = {},
): CheckedNode {
  const plus = kit.token("Punctuator", "+")
  const textBeforeCount = gaps.beforeCount?.() ?? []
  const count = number(kit, raw)
  const label = labelFields(kit, labelRaw, gaps)
  return kit.node(
    "PacketRelativeBlockStatement",
    hull([plus, ...textBeforeCount, count, ...label.pieces]),
    { textBeforeCount, count, ...label.fields },
  )
}
