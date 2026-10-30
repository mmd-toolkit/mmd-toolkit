import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** Every occurrence and lexical role is supplied by the fixed test, without a parser. */
export function buildWardley(
  source: string,
  make: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "wardley-beta",
      diagramType: "wardley",
      bodyType: "WardleyDiagram",
      bodyFields: (body) => ({ textBeforeHeader: [], body }),
    },
    source,
    make,
  )
}

/** Named native forms are explicitly supplied, rather than discovered in source text. */
export type Gaps = Readonly<Record<string, (() => CheckedNode[]) | undefined>>

/** Collect the explicitly authored parts of one node in their source order. */
function parts(kit: Kit, type: string, gaps: Gaps = {}) {
  const pieces: { range: readonly [number, number] }[] = []
  const fields: Record<string, unknown> = {}
  return {
    token(value: string): void {
      pieces.push(kit.token("Punctuator", value))
    },
    word(value: string): void {
      pieces.push(kit.token("Keyword", value))
    },
    gap(field: string): void {
      const nodes = gaps[field]?.() ?? []
      fields[field] = nodes
      pieces.push(...nodes)
    },
    child(field: string, make: () => CheckedNode | null): void {
      const node = make()
      fields[field] = node
      if (node !== null) pieces.push(node)
    },
    list(field: string, make: () => CheckedNode[]): void {
      const nodes = make()
      fields[field] = nodes
      pieces.push(...nodes)
    },
    value(field: string, value: unknown): void {
      fields[field] = value
    },
    finish(): CheckedNode {
      return kit.node(type, hull(pieces), fields)
    },
  }
}

/** A quoted name or one explicitly identified bare-name unit. */
export function name(kit: Kit, raw: string, kind = "RawText"): CheckedNode {
  if (raw.startsWith('"') || raw.startsWith("'"))
    return kit.node("StringLiteral", kit.token("String", raw).range, {
      raw,
      value: raw.slice(1, -1),
      closed: true,
    })
  return kit.node("WardleyIdentifier", kit.token(kind, raw).range, {
    name: raw,
  })
}

/** An unsigned written number; the value is its double before normalization. */
export function number(kit: Kit, raw: string): CheckedNode {
  return kit.node("NumericLiteral", kit.token("Numeric", raw).range, {
    raw,
    value: Number(raw),
  })
}

/** A visibility/evolution pair keeps its written order and four independent gaps. */
export function coordinates(
  kit: Kit,
  visibility: string,
  evolution: string,
  gaps: Gaps = {},
): CheckedNode {
  const p = parts(kit, "WardleyCoordinates", gaps)
  p.token("[")
  p.gap("textBeforeVisibility")
  p.child("visibility", () => number(kit, visibility))
  p.gap("textBeforeComma")
  p.token(",")
  p.gap("textBeforeEvolution")
  p.child("evolution", () => number(kit, evolution))
  p.gap("textBeforeClose")
  p.token("]")
  return p.finish()
}

/** Signed offsets retain unsigned leaves and explicit sign flags. */
export function offset(
  kit: Kit,
  x: string,
  y: string,
  gaps: Gaps = {},
): CheckedNode {
  const p = parts(kit, "WardleyLabelOffsetDecoration", gaps)
  p.gap("textBefore")
  p.word("label")
  p.gap("textBeforeOpen")
  p.token("[")
  for (const [axis, raw] of [
    ["X", x],
    ["Y", y],
  ] as const) {
    if (axis === "Y") {
      p.gap("textBeforeComma")
      p.token(",")
    }
    p.gap(`textBefore${axis}`)
    p.value(`negative${axis}`, raw.startsWith("-"))
    if (raw.startsWith("-")) p.token("-")
    p.gap(`textAfter${axis}Sign`)
    p.child(`offset${axis}`, () =>
      number(kit, raw.startsWith("-") ? raw.slice(1) : raw),
    )
  }
  p.gap("textBeforeClose")
  p.token("]")
  return p.finish()
}

/** The fixed case chooses strategy, bare inertia or parenthesized inertia explicitly. */
export function decoration(
  kit: Kit,
  value: string,
  gaps: Gaps = {},
): CheckedNode {
  const bare = value === "inertia"
  const inertia = bare || value === "(inertia)"
  const p = parts(
    kit,
    inertia
      ? bare
        ? "WardleyInertiaDecoration"
        : "WardleyParenthesizedInertiaDecoration"
      : "WardleySourceStrategyDecoration",
    gaps,
  )
  p.gap("textBefore")
  if (!bare) p.token("(")
  if (inertia) {
    if (!bare) p.gap("textBeforeInertia")
    p.word("inertia")
  } else {
    p.gap("textBeforeValue")
    p.word(value)
    p.value("value", value)
  }
  if (!bare) {
    p.gap("textBeforeClose")
    p.token(")")
  }
  return p.finish()
}

/** A declaration keeps its optional decorations and native forms independently. */
export function declaration(
  kit: Kit,
  kind: "anchor" | "component" | "accelerator" | "deaccelerator",
  raw: string,
  visibility: string,
  evolution: string,
  options: {
    readonly gaps?: Gaps
    readonly coordinateGaps?: Gaps
    readonly decorations?: () => CheckedNode[]
    readonly nameKind?: string
  } = {},
): CheckedNode {
  const p = parts(
    kit,
    `Wardley${kind.charAt(0).toUpperCase()}${kind.slice(1)}Statement`,
    options.gaps,
  )
  p.word(kind)
  p.gap("textBeforeName")
  p.child("name", () => name(kit, raw, options.nameKind))
  p.gap("textBeforeCoordinates")
  p.child("coordinates", () =>
    coordinates(kit, visibility, evolution, options.coordinateGaps),
  )
  if (kind === "component")
    p.list("decorations", () => options.decorations?.() ?? [])
  p.gap("textAfter")
  return p.finish()
}

/** A child has only its evolution and optional label offset. */
export function pipelineChild(
  kit: Kit,
  raw: string,
  evolution: string,
  options: { readonly gaps?: Gaps; readonly offset?: () => CheckedNode } = {},
): CheckedNode {
  const p = parts(kit, "WardleyPipelineComponent", options.gaps)
  p.word("component")
  p.gap("textBeforeName")
  p.child("name", () => name(kit, raw))
  p.gap("textBeforeOpen")
  p.token("[")
  p.gap("textBeforeEvolution")
  p.child("evolution", () => number(kit, evolution))
  p.gap("textBeforeClose")
  p.token("]")
  p.child("labelOffset", () => options.offset?.() ?? null)
  p.gap("textAfter")
  return p.finish()
}

/** Body order is supplied explicitly, including retained hidden forms. */
export function pipeline(
  kit: Kit,
  parent: string,
  body: () => CheckedNode[],
  gaps: Gaps = {},
): CheckedNode {
  const p = parts(kit, "WardleyPipelineStatement", gaps)
  p.word("pipeline")
  p.gap("textBeforeParent")
  p.child("parent", () => name(kit, parent))
  p.gap("textBeforeBody")
  p.token("{")
  p.gap("textAfterOpen")
  p.list("body", body)
  p.token("}")
  p.gap("textAfter")
  return p.finish()
}

/** The flow label is explicitly supplied; glyph fields describe the written end marker. */
export function arrow(
  kit: Kit,
  glyph: string,
  flowLabel?: string,
): CheckedNode {
  const pieces: { range: readonly [number, number] }[] = []
  let label: CheckedNode | null = null
  if (flowLabel === undefined) pieces.push(kit.token("Punctuator", glyph))
  else {
    pieces.push(kit.token("Punctuator", "+"))
    label = name(kit, flowLabel)
    pieces.push(label, kit.token("Punctuator", glyph))
  }
  return kit.node("WardleyArrow", hull(pieces), {
    value: flowLabel === undefined ? glyph : `+${flowLabel}${glyph}`,
    kind: flowLabel === undefined ? "dependency" : "flow",
    line: glyph === "-.->" ? "dotted" : "solid",
    startMarker:
      flowLabel !== undefined && glyph.includes("<") ? "arrow" : "none",
    label,
    endMarker:
      flowLabel === undefined || glyph.includes(">") ? "arrow" : "none",
  })
}

/** Both ports and labels remain authored even when their derived values lose precedence. */
export function link(
  kit: Kit,
  from: string,
  to: string,
  options: {
    readonly gaps?: Gaps
    readonly fromPort?: string
    readonly toPort?: string
    readonly arrow?: () => CheckedNode
    readonly label?: string
  } = {},
): CheckedNode {
  const p = parts(kit, "WardleyLinkStatement", options.gaps)
  p.child("from", () => name(kit, from))
  p.gap("textBeforeFromPort")
  for (const side of ["from", "to"]) {
    if (side === "to") {
      p.gap("textBeforeArrow")
      p.child("arrow", () => options.arrow?.() ?? null)
      p.gap("textBeforeTo")
      p.child("to", () => name(kit, to))
      p.gap("textBeforeToPort")
    }
    const port = options[side === "from" ? "fromPort" : "toPort"]
    if (port !== undefined) p.token(port)
    p.value(
      `${side}Port`,
      port === undefined
        ? null
        : port === "+<>"
          ? "bidirectional"
          : port === "+<"
            ? "backward"
            : "forward",
    )
  }
  p.gap("textBeforeLabel")
  if (options.label !== undefined) p.token(";")
  p.child("label", () =>
    options.label === undefined
      ? null
      : kit.node("WardleyLiteral", kit.token("RawText", options.label).range, {
          value: options.label,
        }),
  )
  p.gap("textAfter")
  return p.finish()
}

/** A target remains a numeric leaf even when the comparison id is missing. */
export function evolve(
  kit: Kit,
  raw: string,
  target: string,
  gaps: Gaps = {},
): CheckedNode {
  const p = parts(kit, "WardleyEvolveStatement", gaps)
  p.word("evolve")
  p.gap("textBeforeComponent")
  p.child("component", () => name(kit, raw))
  p.gap("textBeforeTarget")
  p.child("target", () => number(kit, target))
  p.gap("textAfter")
  return p.finish()
}

/** The supplied statement kind determines its concrete coordinate/text components. */
export function positioned(
  kit: Kit,
  kind: "note" | "annotations" | "annotation",
  visibility: string,
  evolution: string,
  raw?: string,
  index = "1",
  gaps: Gaps = {},
  coordinateGaps: Gaps = {},
): CheckedNode {
  const p = parts(
    kit,
    `Wardley${kind.charAt(0).toUpperCase()}${kind.slice(1)}Statement`,
    gaps,
  )
  p.word(kind)
  if (kind === "note") {
    p.gap("textBeforeText")
    p.child("text", () => name(kit, raw ?? '""'))
  }
  if (kind === "annotation") {
    p.gap("textBeforeNumber")
    p.child("number", () => number(kit, index))
    p.gap("textBeforeComma")
    p.token(",")
  }
  p.gap("textBeforeCoordinates")
  p.child("coordinates", () =>
    coordinates(kit, visibility, evolution, coordinateGaps),
  )
  if (kind === "annotation") {
    p.gap("textBeforeText")
    p.child("text", () => name(kit, raw ?? '""'))
  }
  p.gap("textAfter")
  return p.finish()
}

/** Size dimensions remain their supplied unsigned integer spellings. */
export function size(
  kit: Kit,
  width: string,
  height: string,
  gaps: Gaps = {},
): CheckedNode {
  const p = parts(kit, "WardleySizeStatement", gaps)
  p.word("size")
  p.gap("textBeforeOpen")
  p.token("[")
  p.gap("textBeforeWidth")
  p.child("width", () => number(kit, width))
  p.gap("textBeforeComma")
  p.token(",")
  p.gap("textBeforeHeight")
  p.child("height", () => number(kit, height))
  p.gap("textBeforeClose")
  p.token("]")
  p.gap("textAfter")
  return p.finish()
}

/** Stage options are authored values, never effective axis arrays. */
export function stage(
  kit: Kit,
  raw: string,
  options: {
    readonly boundary?: string
    readonly secondName?: string
    readonly gaps?: Gaps
  } = {},
): CheckedNode {
  const p = parts(kit, "WardleyEvolutionStage", options.gaps)
  p.gap("textBefore")
  p.child("name", () => name(kit, raw))
  p.gap("textBeforeBoundaryMark")
  if (options.boundary !== undefined) p.token("@")
  p.gap("textBeforeBoundary")
  p.child("boundary", () =>
    options.boundary === undefined ? null : number(kit, options.boundary),
  )
  p.gap("textBeforeSecondNameMark")
  if (options.secondName !== undefined) p.token("/")
  p.gap("textBeforeSecondName")
  p.child("secondName", () =>
    options.secondName === undefined ? null : name(kit, options.secondName),
  )
  p.gap("textAfter")
  return p.finish()
}

/** Stage separators are supplied between explicitly built stage nodes. */
export function evolutionStatement(
  kit: Kit,
  stages: readonly (() => CheckedNode)[],
): CheckedNode {
  const word = kit.token("Keyword", "evolution")
  const nodes = stages.map((make, index) => {
    if (index > 0) kit.token("Punctuator", "->")
    return make()
  })
  return kit.node("WardleyEvolutionStatement", hull([word, ...nodes]), {
    stages: nodes,
  })
}
