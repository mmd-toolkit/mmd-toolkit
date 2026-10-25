import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** A fixed source with explicitly supplied authored occurrences, without a parser. */
export function buildRadar(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  colon = false,
  beforeColon: (kit: Kit) => CheckedNode[] = () => [],
): Built {
  let textBeforeColon: CheckedNode[] = []
  return buildTree(
    {
      header: "radar-beta",
      diagramType: "radar",
      bodyType: "RadarDiagram",
      bodyFields: (body) => ({ textBeforeHeader: [], textBeforeColon, body }),
    },
    source,
    (kit) => {
      if (colon) {
        textBeforeColon = beforeColon(kit)
        kit.token("Punctuator", ":")
      }
      return make(kit)
    },
  )
}

/** A fixed numeric spelling and its shared double value. */
export function number(kit: Kit, raw: string): CheckedNode {
  return kit.node("NumericLiteral", kit.token("Numeric", raw).range, {
    raw,
    value: Number(raw),
  })
}

/** One complete authored name. */
function identifier(kit: Kit, name: string): CheckedNode {
  return kit.node("Identifier", kit.token("Identifier", name).range, { name })
}

/** Every native gap is supplied explicitly by the test, never inferred from source. */
export type RadarGaps = Readonly<
  Record<string, (() => CheckedNode[]) | undefined>
>

/** The common declaration name and optional bracketed label. */
function declarationFields(
  kit: Kit,
  nameText: string,
  labelRaw: string | null,
  gaps: RadarGaps,
) {
  const textBefore = gaps.textBefore?.() ?? []
  const name = identifier(kit, nameText)
  const textBeforeLabel =
    labelRaw === null ? [] : (gaps.textBeforeLabel?.() ?? [])
  const open = labelRaw === null ? [] : [kit.token("Punctuator", "[")]
  const textBeforeLabelValue =
    labelRaw === null ? [] : (gaps.textBeforeLabelValue?.() ?? [])
  const label =
    labelRaw === null
      ? null
      : kit.node("StringLiteral", kit.token("String", labelRaw).range, {
          raw: labelRaw,
          value: labelRaw.slice(1, -1),
          closed: true,
        })
  const textBeforeLabelClose =
    labelRaw === null ? [] : (gaps.textBeforeLabelClose?.() ?? [])
  const close = labelRaw === null ? [] : [kit.token("Punctuator", "]")]
  return {
    fields: {
      textBefore,
      name,
      textBeforeLabel,
      textBeforeLabelValue,
      label,
      textBeforeLabelClose,
    },
    pieces: [
      ...textBefore,
      name,
      ...textBeforeLabel,
      ...open,
      ...textBeforeLabelValue,
      ...(label === null ? [] : [label]),
      ...textBeforeLabelClose,
      ...close,
    ],
  }
}

/** An authored axis member, with no derived reference state. */
export function axis(
  kit: Kit,
  name: string,
  labelRaw: string | null = null,
  gaps: RadarGaps = {},
): CheckedNode {
  const declaration = declarationFields(kit, name, labelRaw, gaps)
  const textAfter = gaps.textAfter?.() ?? []
  return kit.node("RadarAxis", hull([...declaration.pieces, ...textAfter]), {
    ...declaration.fields,
    textAfter,
  })
}

/** One explicitly supplied positional or named entry. */
export function entry(
  kit: Kit,
  raw: string,
  name: string | null = null,
  colon: boolean = name !== null,
  gaps: RadarGaps = {},
): CheckedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const axisNode = name === null ? null : identifier(kit, name)
  const textBeforeColon = colon ? (gaps.textBeforeColon?.() ?? []) : []
  const mark = colon ? [kit.token("Punctuator", ":")] : []
  const textBeforeValue = name === null ? [] : (gaps.textBeforeValue?.() ?? [])
  const value = number(kit, raw)
  const textAfter = gaps.textAfter?.() ?? []
  const range = hull([
    ...textBefore,
    ...(axisNode === null ? [] : [axisNode]),
    ...textBeforeColon,
    ...mark,
    ...textBeforeValue,
    value,
    ...textAfter,
  ])
  return kit.node(
    name === null ? "RadarNumberEntry" : "RadarNamedEntry",
    range,
    name === null
      ? { textBefore, value, textAfter }
      : {
          textBefore,
          axis: axisNode,
          textBeforeColon,
          textBeforeValue,
          value,
          textAfter,
        },
  )
}

/** An authored curve with the supplied entry list and its written commas. */
export function curve(
  kit: Kit,
  name: string,
  entries: readonly (() => CheckedNode)[],
  labelRaw: string | null = null,
  gaps: RadarGaps = {},
): CheckedNode {
  const declaration = declarationFields(kit, name, labelRaw, gaps)
  const textBeforeEntries = gaps.textBeforeEntries?.() ?? []
  const open = kit.token("Punctuator", "{")
  const values: CheckedNode[] = []
  for (const [index, make] of entries.entries()) {
    if (index > 0) kit.token("Punctuator", ",")
    values.push(make())
  }
  const close = kit.token("Punctuator", "}")
  const textAfter = gaps.textAfter?.() ?? []
  return kit.node(
    "RadarCurve",
    hull([
      ...declaration.pieces,
      ...textBeforeEntries,
      open,
      ...values,
      close,
      ...textAfter,
    ]),
    { ...declaration.fields, textBeforeEntries, entries: values, textAfter },
  )
}

/** The option keyword and its unconverted numeric leaf or fixed string. */
export function option(
  kit: Kit,
  word: "showLegend" | "ticks" | "max" | "min" | "graticule",
  raw: string,
  gaps: RadarGaps = {},
): CheckedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const keyword = kit.token("Keyword", word)
  const textBeforeValue = gaps.textBeforeValue?.() ?? []
  const fixed = word === "showLegend" || word === "graticule"
  const value = fixed ? kit.token("Keyword", raw) : number(kit, raw)
  const textAfter = gaps.textAfter?.() ?? []
  const kind =
    word === "showLegend"
      ? "ShowLegend"
      : word === "ticks"
        ? "Ticks"
        : word === "max"
          ? "Max"
          : word === "min"
            ? "Min"
            : "Graticule"
  return kit.node(
    `Radar${kind}Option`,
    hull([...textBefore, keyword, ...textBeforeValue, value, ...textAfter]),
    { textBefore, textBeforeValue, value: fixed ? raw : value, textAfter },
  )
}

/** A fixed comma group, with one keyword per axis/curve statement. */
export function group(
  kit: Kit,
  kind: "Axis" | "Curve" | "Options",
  members: readonly (() => CheckedNode)[],
): CheckedNode {
  const pieces =
    kind === "Options"
      ? []
      : [kit.token("Keyword", kind === "Axis" ? "axis" : "curve")]
  const values: CheckedNode[] = []
  for (const [index, make] of members.entries()) {
    if (index > 0) pieces.push(kit.token("Punctuator", ","))
    values.push(make())
  }
  const field =
    kind === "Axis" ? "axes" : kind === "Curve" ? "curves" : "options"
  return kit.node(`Radar${kind}Statement`, hull([...pieces, ...values]), {
    [field]: values,
  })
}
