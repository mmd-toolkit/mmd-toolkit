import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** A fixed source with explicitly supplied occurrences, without a parser. */
export function buildArchitecture(
  source: string,
  make: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "architecture-beta",
      diagramType: "architecture",
      bodyType: "ArchitectureDiagram",
      bodyFields: (body) => ({ textBeforeHeader: [], body }),
    },
    source,
    make,
  )
}

/** A whole authored name, or the interior of an explicitly parenthesized icon. */
export function identifier(kit: Kit, name: string): CheckedNode {
  return kit.node("Identifier", kit.token("Identifier", name).range, { name })
}

/** A complete label with its lexical alternative supplied by the fixed case. */
export function architectureLabel(
  kit: Kit,
  raw: string,
  kind: "text" | "string" = "text",
): CheckedNode {
  const open = kit.token("Punctuator", "[")
  kit.token(kind === "string" ? "String" : "RawText", raw.slice(1, -1))
  const close = kit.token("Punctuator", "]")
  const count = kind === "string" ? 2 : 1
  return kit.node("ArchitectureLabel", hull([open, close]), {
    kind,
    value: raw.slice(count, -count),
  })
}

/** Each callback supplies only the hidden forms in its named source position. */
export type Gaps = Readonly<Record<string, (() => CheckedNode[]) | undefined>>

/** A flat declaration with explicitly supplied optional components. */
export function declaration(
  kit: Kit,
  kind: "Group" | "Service" | "Junction",
  name: string,
  options: {
    readonly icon?: string
    readonly title?: string
    readonly titleKind?: "text" | "string"
    readonly parent?: string
    readonly gaps?: Gaps
  } = {},
): CheckedNode {
  const pieces: { range: readonly [number, number] }[] = [
    kit.token("Keyword", kind.toLowerCase()),
  ]
  const fields: Record<string, unknown> = {}

  /** Append the supplied native forms in one explicitly named gap. */
  function gap(field: string): void {
    const nodes = options.gaps?.[field]?.() ?? []
    fields[field] = nodes
    pieces.push(...nodes)
  }

  gap("textBeforeId")
  const id = identifier(kit, name)
  fields.id = id
  pieces.push(id)
  if (kind !== "Junction") {
    gap("textBeforeIcon")
    let icon: CheckedNode | null = null
    if (options.icon !== undefined) {
      const raw = options.icon
      if (raw.startsWith("(")) {
        pieces.push(kit.token("Punctuator", "("))
        icon = identifier(kit, raw.slice(1, -1))
        pieces.push(icon)
        pieces.push(kit.token("Punctuator", ")"))
      } else {
        icon = kit.node("StringLiteral", kit.token("String", raw).range, {
          raw,
          value: raw.slice(1, -1),
          closed: true,
        })
        pieces.push(icon)
      }
    }
    fields.icon = icon
    gap("textBeforeTitle")
    const title =
      options.title === undefined
        ? null
        : architectureLabel(kit, options.title, options.titleKind)
    fields.title = title
    if (title !== null) pieces.push(title)
  }
  gap("textBeforeIn")
  if (options.parent !== undefined) pieces.push(kit.token("Keyword", "in"))
  gap("textBeforeParent")
  const parent =
    options.parent === undefined ? null : identifier(kit, options.parent)
  fields.in = parent
  if (parent !== null) pieces.push(parent)
  gap("textAfter")
  return kit.node(`Architecture${kind}Statement`, hull(pieces), fields)
}

/** One explicitly supplied port-to-port arrow, keeping its complete written value. */
export function edge(
  kit: Kit,
  lhs: string,
  rhs: string,
  options: {
    readonly value: string
    readonly start?: string
    readonly end?: string
    readonly startMarker?: "<" | ">"
    readonly endMarker?: "<" | ">"
    readonly title?: string
    readonly titleKind?: "text" | "string"
    readonly lhsGroup?: boolean
    readonly rhsGroup?: boolean
    readonly gaps?: Gaps
    readonly arrowGaps?: Gaps
  },
): CheckedNode {
  const pieces: { range: readonly [number, number] }[] = []
  const fields: Record<string, unknown> = {}

  /** Append the supplied native forms in one explicitly named gap. */
  function gap(field: string): void {
    const nodes = options.gaps?.[field]?.() ?? []
    fields[field] = nodes
    pieces.push(...nodes)
  }

  /** Write the complete modifier only when the fixed case supplies it. */
  function modifier(side: "lhs" | "rhs"): void {
    const present = options[side === "lhs" ? "lhsGroup" : "rhsGroup"] ?? false
    fields[`${side}Group`] = present
    if (present) {
      pieces.push(
        kit.token("Punctuator", "{"),
        kit.token("Keyword", "group"),
        kit.token("Punctuator", "}"),
      )
    }
  }

  const lhsId = identifier(kit, lhs)
  fields.lhsId = lhsId
  pieces.push(lhsId)
  gap("textBeforeLhsGroup")
  modifier("lhs")
  gap("textBeforeArrow")
  const arrowPieces: { range: readonly [number, number] }[] = []
  const arrowFields: Record<string, unknown> = {}

  /** Append the arrow gap in its independently owned component order. */
  function ag(field: string): void {
    const nodes = options.arrowGaps?.[field]?.() ?? []
    arrowFields[field] = nodes
    arrowPieces.push(...nodes)
  }

  arrowPieces.push(kit.token("Punctuator", ":"))
  ag("textBeforeStartDirection")
  arrowPieces.push(kit.token("Keyword", options.start ?? "R"))
  arrowFields.startDirection = options.start ?? "R"
  ag("textBeforeStartMarker")
  if (options.startMarker !== undefined)
    arrowPieces.push(kit.token("Punctuator", options.startMarker))
  arrowFields.startMarker = options.startMarker === undefined ? "none" : "arrow"
  ag("textBeforeLine")
  arrowPieces.push(
    kit.token("Punctuator", options.title === undefined ? "--" : "-"),
  )
  arrowFields.line = "solid"
  ag("textBeforeTitle")
  const title =
    options.title === undefined
      ? null
      : architectureLabel(kit, options.title, options.titleKind)
  arrowFields.title = title
  if (title !== null) arrowPieces.push(title)
  ag("textBeforeEndDash")
  if (title !== null) arrowPieces.push(kit.token("Punctuator", "-"))
  ag("textBeforeEndMarker")
  if (options.endMarker !== undefined)
    arrowPieces.push(kit.token("Punctuator", options.endMarker))
  arrowFields.endMarker = options.endMarker === undefined ? "none" : "arrow"
  ag("textBeforeEndDirection")
  arrowPieces.push(kit.token("Keyword", options.end ?? "L"))
  arrowFields.endDirection = options.end ?? "L"
  ag("textBeforeEndColon")
  arrowPieces.push(kit.token("Punctuator", ":"))
  const arrow = kit.node("ArchitectureArrow", hull(arrowPieces), {
    value: options.value,
    ...arrowFields,
  })
  fields.arrow = arrow
  pieces.push(arrow)
  gap("textBeforeRhsId")
  const rhsId = identifier(kit, rhs)
  fields.rhsId = rhsId
  pieces.push(rhsId)
  gap("textBeforeRhsGroup")
  modifier("rhs")
  gap("textAfter")
  return kit.node("ArchitectureEdgeStatement", hull(pieces), fields)
}

/** Ordered members own their own preceding hidden forms, including the first. */
export function alignment(
  kit: Kit,
  direction: "row" | "column",
  members: readonly string[],
  options: {
    readonly beforeDirection?: () => CheckedNode[]
    readonly beforeMembers?: readonly (() => CheckedNode[])[]
    readonly after?: () => CheckedNode[]
  } = {},
): CheckedNode {
  const start = kit.token("Keyword", "align")
  const textBeforeDirection = options.beforeDirection?.() ?? []
  const word = kit.token("Keyword", direction)
  const list = members.map((name, index) => {
    const textBeforeId = options.beforeMembers?.[index]?.() ?? []
    const id = identifier(kit, name)
    return kit.node(
      "ArchitectureAlignmentMember",
      hull([...textBeforeId, id]),
      { textBeforeId, id },
    )
  })
  const textAfter = options.after?.() ?? []
  return kit.node(
    "ArchitectureAlignmentStatement",
    hull([start, ...textBeforeDirection, word, ...list, ...textAfter]),
    { textBeforeDirection, direction, members: list, textAfter },
  )
}
