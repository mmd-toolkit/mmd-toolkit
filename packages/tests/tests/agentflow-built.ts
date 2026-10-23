import type { CheckedNode } from "../src/check-tree/types.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"

/** Fixed source and explicitly supplied productions; no lexer or parser runs. */
export function agentflowTree(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  direction: string | null = "TB",
): Built {
  return buildTree(
    {
      header: "agentflow-beta",
      diagramType: "agentflow",
      bodyType: "AgentflowDiagram",
      bodyFields: (body) => ({ direction, body }),
    },
    source,
    (kit) => {
      if (direction !== null) kit.token("Keyword", direction)
      return make(kit)
    },
  )
}

/** A node's written hull; every production supplies its own fields. */
export function afNode(
  kit: Kit,
  type: string,
  parts: readonly { readonly range: TreeRange }[],
  fields: Record<string, unknown>,
): CheckedNode {
  const first = parts[0]
  const last = parts.at(-1)
  if (first === undefined || last === undefined)
    throw new Error("a hand-built node needs a written part")
  return kit.node(`Agentflow${type}`, [first.range[0], last.range[1]], fields)
}

/** A shared Identifier at its explicit next occurrence. */
export function afId(kit: Kit, name: string): CheckedNode {
  const token = kit.token("Identifier", name)
  return kit.node("Identifier", token.range, { name })
}

/** A label with the initial form stated by the case, rather than inferred by a parser. */
export function afLabel(
  kit: Kit,
  raw: string,
  kind = "text",
  value: string = raw,
  from?: number,
): CheckedNode {
  const token = kit.token(kind === "text" ? "RawText" : "String", raw, from)
  return kit.node("AgentflowLabel", token.range, { kind, value })
}

/** A retained literal, including all supplied padding. */
export function afLiteral(kit: Kit, value: string): CheckedNode {
  const token = kit.token("RawText", value)
  return kit.node("AgentflowLiteral", token.range, { value })
}

/** One complete opaque block. Its interior is never read as YAML. */
export function afData(kit: Kit, raw: string): CheckedNode {
  const first = kit.token("Punctuator", "@{")
  const value = raw.slice(2, -1)
  if (value !== "") kit.token("RawText", value)
  const last = kit.token("Punctuator", "}")
  return afNode(kit, "DataBlock", [first, last], { value })
}

/** An erased prefix with its explicit recognized kind and full authored spelling. */
export function afIgnored(
  kit: Kit,
  raw: string,
  kind: string,
  pieces: readonly (readonly [string, string])[] = [["RawText", raw]],
): CheckedNode {
  const tokens = pieces.map(([tokenKind, value]) => kit.token(tokenKind, value))
  return afNode(kit, "IgnoredText", tokens, { kind, value: raw })
}

/** Name fragments are supplied separately, including click exits and erased forms. */
export function afName(kit: Kit, parts: readonly CheckedNode[]): CheckedNode {
  return afNode(kit, "Name", parts, { parts })
}

export interface VertexForm {
  readonly opening: string
  readonly closing: string
  readonly name: string
  readonly raw: string
  readonly value?: string
  readonly kind?: string
  readonly property?: readonly [string, string]
}

/** One written occurrence, with its own shape, class suffix and adjacent blocks. */
export function afVertex(
  kit: Kit,
  name: string,
  form: VertexForm | null = null,
  cssClass: string | null = null,
  data: readonly string[] = [],
): CheckedNode {
  const id = afId(kit, name)
  let shape: CheckedNode | null = null
  if (form !== null) {
    const opening = kit.token("Punctuator", form.opening)
    let property: CheckedNode | null = null
    if (form.property !== undefined) {
      const first = afId(kit, form.property[0])
      kit.token("Punctuator", ":")
      const value = afId(kit, form.property[1])
      property = afNode(kit, "ShapeProperty", [first, value], {
        name: first,
        value,
      })
      kit.token("Punctuator", "|")
    }
    const label = afLabel(kit, form.raw, form.kind, form.value)
    const closing = kit.token("Punctuator", form.closing)
    shape = afNode(kit, "Shape", [opening, closing], {
      name: form.name,
      property,
      label,
    })
  }
  let css: CheckedNode | null = null
  if (cssClass !== null) {
    kit.token("Punctuator", ":::")
    css = afId(kit, cssClass)
  }
  const blocks = data.map((raw) => afData(kit, raw))
  return afNode(
    kit,
    "Vertex",
    [
      id,
      ...(shape === null ? [] : [shape]),
      ...(css === null ? [] : [css]),
      ...blocks,
    ],
    { id, shape, cssClass: css, data: blocks },
  )
}

/** A group, whose members and ampersands the case supplies in source order. */
export function afGroup(
  kit: Kit,
  builders: readonly (() => CheckedNode)[],
): CheckedNode {
  const vertices = builders.map((build, index) => {
    if (index > 0) kit.token("Punctuator", "&")
    return build()
  })
  return afNode(kit, "VertexGroup", vertices, { vertices })
}

/** Fields are supplied independently of the operator's written spelling. */
export function afArrow(
  kit: Kit,
  value: string,
  line: string,
  length: number,
  endMarker: string,
): CheckedNode {
  const token = kit.token("Punctuator", value)
  return kit.node("AgentflowArrow", token.range, {
    value,
    startMarker: "none",
    line,
    length,
    endMarker,
  })
}

/** A bare group, or a chain whose links have already been built in source order. */
export function afStatement(
  kit: Kit,
  first: CheckedNode,
  links: readonly CheckedNode[] = [],
): CheckedNode {
  return afNode(kit, "VertexStatement", [first, ...links], { first, links })
}

/** A closed link, optionally with a written edge id and pipe label. */
export function afLink(
  kit: Kit,
  arrow: () => CheckedNode,
  target: () => CheckedNode,
  id: string | null = null,
  content: (() => CheckedNode) | null = null,
): CheckedNode {
  const writtenId = id === null ? null : afId(kit, id)
  if (writtenId !== null) kit.token("Punctuator", "@")
  const mark = arrow()
  let label: CheckedNode | null = null
  if (content !== null) {
    kit.token("Punctuator", "|")
    label = content()
    kit.token("Punctuator", "|")
  }
  const group = target()
  return afNode(
    kit,
    "Link",
    [...(writtenId === null ? [] : [writtenId]), mark, group],
    { id: writtenId, opening: null, arrow: mark, label, target: group },
  )
}

/** A body-free connector or a flow/global with an explicit body callback. */
export function afContainer(
  kit: Kit,
  keyword: "flow" | "connector" | "global",
  name: (() => CheckedNode) | null,
  body: () => CheckedNode[] = () => [],
  title: (() => CheckedNode) | null = null,
  data: readonly string[] = [],
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const writtenName = name?.() ?? null
  let writtenTitle: CheckedNode | null = null
  let titleEnd: { readonly range: TreeRange } | null = null
  if (title !== null) {
    kit.token("Punctuator", "[")
    writtenTitle = title()
    titleEnd = kit.token("Punctuator", "]")
  }
  const blocks = data.map((raw) => afData(kit, raw))
  const statements = body()
  const end = keyword === "connector" ? null : kit.token("Keyword", "end")
  return afNode(
    kit,
    keyword === "flow"
      ? "FlowStatement"
      : keyword === "global"
        ? "GlobalStatement"
        : "ConnectorStatement",
    [
      first,
      ...(writtenName === null ? [] : [writtenName]),
      ...(writtenTitle === null ? [] : [writtenTitle]),
      ...(titleEnd === null ? [] : [titleEnd]),
      ...blocks,
      ...statements,
      ...(end === null ? [] : [end]),
    ],
    keyword === "global"
      ? { body: statements }
      : keyword === "connector"
        ? { name: writtenName, title: writtenTitle, data: blocks }
        : {
            name: writtenName,
            title: writtenTitle,
            data: blocks,
            body: statements,
          },
  )
}

/** A shared closed string; padding and escapes are supplied as authored text. */
export function afString(
  kit: Kit,
  raw: string,
  value: string = raw.slice(1, -1),
): CheckedNode {
  const token = kit.token("String", raw)
  return kit.node("StringLiteral", token.range, { raw, value, closed: true })
}

/** One id-list slot for each supplied name, including null empty slots. */
export function afIds(
  kit: Kit,
  names: readonly (string | null)[],
): (CheckedNode | null)[] {
  return names.map((name, at) => {
    if (at > 0) kit.token("Punctuator", ",")
    return name === null ? null : afId(kit, name)
  })
}

/** A fixed written comma list, retaining its last comma even for a null final slot. */
function afList(
  kit: Kit,
  values: readonly (string | null)[],
  make: (value: string) => CheckedNode,
): {
  entries: (CheckedNode | null)[]
  last: { readonly range: TreeRange } | null
} {
  let last: { readonly range: TreeRange } | null = null
  const entries = values.map((value, at) => {
    if (at > 0) last = kit.token("Punctuator", ",")
    const entry = value === null ? null : make(value)
    if (entry !== null) last = entry
    return entry
  })
  return { entries, last }
}

/** The three style/class forms, with explicit operand lists. */
export function afStyling(
  kit: Kit,
  keyword: "style" | "classDef" | "class",
  ids: readonly (string | null)[],
  values: readonly (string | null)[],
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const written = afList(kit, ids, (id) => afId(kit, id))
  if (keyword === "class") {
    const cssClass = afId(kit, values[0] ?? "")
    return afNode(kit, "ClassStatement", [first, cssClass], {
      ids: written.entries,
      cssClass,
    })
  }
  const styles = afList(kit, values, (value) => afLiteral(kit, value))
  return afNode(
    kit,
    keyword === "style" ? "StyleStatement" : "ClassDefStatement",
    [first, styles.last ?? written.last ?? first],
    keyword === "style"
      ? { id: written.entries[0], styles: styles.entries }
      : { cssClasses: written.entries, styles: styles.entries },
  )
}

/** Interpolation and styles are supplied independently of the selected indices. */
export function afLinkStyle(
  kit: Kit,
  indices: readonly string[] | null,
  interpolate: string | null,
  values: readonly (string | null)[],
): CheckedNode {
  const first = kit.token("Keyword", "linkStyle")
  const defaultToken = indices === null ? kit.token("Keyword", "default") : null
  const written = (indices ?? []).map((raw, at) => {
    if (at > 0) kit.token("Punctuator", ",")
    const token = kit.token("Numeric", raw)
    return kit.node("NumericLiteral", token.range, { value: Number(raw), raw })
  })
  if (interpolate !== null) kit.token("Keyword", "interpolate")
  const name = interpolate === null ? null : afId(kit, interpolate)
  const styles = afList(kit, values, (value) => afLiteral(kit, value))
  const last = styles.last ?? name ?? written.at(-1) ?? defaultToken ?? first
  return afNode(
    kit,
    indices === null ? "DefaultLinkStyleStatement" : "LinkStyleStatement",
    [first, last],
    {
      ...(indices === null ? {} : { indices: written }),
      interpolate: name,
      styles: styles.entries,
    },
  )
}

/** The callback form, including its explicit parentheses and optional tooltip. */
export function afCallback(
  kit: Kit,
  ids: readonly (string | null)[],
  name: string,
  call: boolean,
  args: string | null,
  tooltip: string | null = null,
): CheckedNode {
  const first = kit.token("Keyword", "click")
  const written = afIds(kit, ids)
  if (call) kit.token("Keyword", "call")
  const callback = call ? afLiteral(kit, name) : afId(kit, name)
  let end: { readonly range: TreeRange } = callback
  let argumentsNode: CheckedNode | null = null
  if (call) {
    kit.token("Punctuator", "(")
    argumentsNode = args === null ? null : afLiteral(kit, args)
    end = kit.token("Punctuator", ")")
  }
  const tip = tooltip === null ? null : afString(kit, tooltip)
  return afNode(kit, "ClickCallbackStatement", [first, tip ?? end], {
    ids: written,
    callback,
    arguments: argumentsNode,
    textBeforeTooltip: [],
    tooltip: tip,
  })
}

/** A URL form with the href keyword and target chosen by the case. */
export function afUrl(
  kit: Kit,
  ids: readonly (string | null)[],
  raw: string,
  href = false,
  tooltip: string | null = null,
  target: string | null = null,
): CheckedNode {
  const first = kit.token("Keyword", "click")
  const written = afIds(kit, ids)
  if (href) kit.token("Keyword", "href")
  const url = afString(kit, raw)
  const tip = tooltip === null ? null : afString(kit, tooltip)
  const last = target === null ? (tip ?? url) : kit.token("Keyword", target)
  return afNode(kit, "ClickUrlStatement", [first, last], {
    ids: written,
    textBeforeUrl: [],
    url,
    textBeforeTooltip: [],
    tooltip: tip,
    target,
  })
}

/** A line or block accessibility value, without interpreting its text. */
export function afAccessibility(
  kit: Kit,
  keyword: "accTitle" | "accDescr",
  value: string | null,
  block = false,
  closed = true,
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const separator = kit.token("Punctuator", block ? "{" : ":")
  const text = value === null ? null : afLiteral(kit, value)
  const last =
    block && closed ? kit.token("Punctuator", "}") : (text ?? separator)
  return afNode(
    kit,
    block
      ? "AccDescrBlockStatement"
      : keyword === "accTitle"
        ? "AccTitleStatement"
        : "AccDescrStatement",
    [first, last],
    { value: text, ...(block ? { closed } : {}) },
  )
}
