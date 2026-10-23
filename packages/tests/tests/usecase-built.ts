import type { CheckedNode, CheckedToken } from "../src/check-tree/types.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"

/** Hand-written source occurrences; no input is lexed or parsed by these builders. */
export const USECASE = {
  header: "usecase-beta",
  diagramType: "usecase",
  bodyType: "UsecaseDiagram",
}

/** The hull of explicitly supplied written pieces. */
export function hull(
  ...pieces: readonly (CheckedNode | CheckedToken)[]
): TreeRange {
  return [
    Math.min(...pieces.map((piece) => piece.range[0])),
    Math.max(...pieces.map((piece) => piece.range[1])),
  ]
}

/** One explicit id token. */
export function id(kit: Kit, name: string): CheckedNode {
  return kit.node("Identifier", kit.token("Identifier", name).range, { name })
}

/** One explicit raw literal. */
export function literal(kit: Kit, value: string): CheckedNode {
  return kit.node("UsecaseLiteral", kit.token("RawText", value).range, {
    value,
  })
}

/** A written plain or markdown label, with its kind explicitly supplied. */
export function label(
  kit: Kit,
  raw: string,
  kind: "text" | "string" | "markdown" = "text",
): CheckedNode {
  const token = kit.token(kind === "text" ? "RawText" : "String", raw)
  const size = kind === "markdown" ? 2 : kind === "string" ? 1 : 0
  return kit.node("UsecaseLabel", token.range, {
    kind,
    value: size === 0 ? raw : raw.slice(size, -size),
  })
}

/** A metadata scalar string, including its shared raw/closed fields. */
export function string(kit: Kit, raw: string): CheckedNode {
  return kit.node("StringLiteral", kit.token("String", raw).range, {
    raw,
    value: raw.slice(1, -1),
    closed: true,
  })
}

/** Explicit property slots, preserving duplicate keys and separator spellings. */
export function metadata(
  kit: Kit,
  properties: readonly (readonly [
    key: string,
    value: string,
    separator?: string,
  ])[],
): CheckedNode {
  const open = kit.token("Punctuator", "@{")
  const children = properties.map(([key, value, separator], index) => {
    if (index > 0 && separator?.includes(",")) kit.token("Punctuator", ",")
    const k =
      key.startsWith('"') || key.startsWith("'")
        ? string(kit, key)
        : id(kit, key)
    kit.token("Punctuator", ":")
    const v =
      value.startsWith('"') || value.startsWith("'")
        ? string(kit, value)
        : id(kit, value)
    return kit.node("UsecaseMetadataProperty", hull(k, v), { key: k, value: v })
  })
  const close = kit.token("Punctuator", "}")
  return kit.node("UsecaseMetadata", hull(open, close), {
    properties: children,
  })
}

/** The written fields of an element; callers state its shape and quoted kind. */
export interface ElementFields {
  readonly label?: readonly [raw: string, kind: "text" | "string" | "markdown"]
  readonly shape?: "ellipse" | "rectangle"
  readonly metadata?: readonly (readonly [
    key: string,
    value: string,
    separator?: string,
  ])[]
  readonly stereotype?: string
  readonly classes?: readonly string[]
}

/** An actor/entity occurrence, excluding an actor statement's keyword. */
export function element(
  kit: Kit,
  name: string | null,
  isActor = false,
  fields: ElementFields = {},
): CheckedNode {
  const pieces: (CheckedNode | CheckedToken)[] = []
  const identifier = name === null ? null : id(kit, name)
  if (identifier !== null) pieces.push(identifier)
  if (fields.shape !== undefined)
    pieces.push(kit.token("Punctuator", fields.shape === "ellipse" ? "(" : "["))
  const content =
    fields.label === undefined ? null : label(kit, ...fields.label)
  if (content !== null) pieces.push(content)
  if (fields.shape !== undefined)
    pieces.push(kit.token("Punctuator", fields.shape === "ellipse" ? ")" : "]"))
  const meta =
    fields.metadata === undefined ? null : metadata(kit, fields.metadata)
  if (meta !== null) pieces.push(meta)
  let stereotype: CheckedNode | null = null
  if (fields.stereotype !== undefined) {
    pieces.push(kit.token("Punctuator", "<<"))
    stereotype = literal(kit, fields.stereotype)
    pieces.push(stereotype, kit.token("Punctuator", ">>"))
  }
  const classes = (fields.classes ?? []).map((cssClass, index) => {
    pieces.push(kit.token("Punctuator", index === 0 ? ":::" : ","))
    const child = id(kit, cssClass)
    pieces.push(child)
    return child
  })
  return kit.node(isActor ? "UsecaseActor" : "UsecaseEntity", hull(...pieces), {
    id: identifier,
    ...(isActor ? {} : { shape: fields.shape ?? null }),
    label: content,
    metadata: meta,
    stereotype,
    classes,
  })
}

/** One explicitly written standalone entity declaration. */
export function entity(
  kit: Kit,
  name: string | null,
  fields: ElementFields = {},
): CheckedNode {
  const child = element(kit, name, false, fields)
  return kit.node("UsecaseEntityStatement", child.range, { entity: child })
}

/** One explicitly written actor-list statement. */
export function actor(
  kit: Kit,
  name: string | null,
  fields: ElementFields = {},
): CheckedNode {
  const keyword = kit.token("Keyword", "actor")
  const child = element(kit, name, true, fields)
  return kit.node("UsecaseActorStatement", hull(keyword, child), {
    actors: [child],
  })
}

/** An explicit arrow, with the field values a test states rather than infers. */
export function arrow(
  kit: Kit,
  value: string,
  fields: Readonly<Record<string, unknown>> = {},
  opening = false,
): CheckedNode {
  return kit.node(
    opening ? "UsecaseOpeningArrow" : "UsecaseArrow",
    kit.token("Punctuator", value).range,
    {
      value,
      startMarker: "none",
      ...(opening ? {} : { endMarker: "arrow" }),
      line: "solid",
      length: 2,
      ...fields,
    },
  )
}

/** A fixed simple relationship, also useful for source-vs-map-order checks. */
export function relationship(
  kit: Kit,
  source: string,
  target: string,
): CheckedNode {
  const a = element(kit, source)
  const mark = arrow(kit, "-->")
  const b = element(kit, target)
  return kit.node("UsecaseRelationshipStatement", hull(a, b), {
    source: a,
    id: null,
    kind: "association",
    opening: null,
    label: null,
    arrow: mark,
    target: b,
  })
}

/** A JSON block's interior is supplied whole and opaque, not interpreted. */
export function json(kit: Kit, name: string, interior: string): CheckedNode {
  const keyword = kit.token("Keyword", "json")
  const identifier = id(kit, name)
  const at = kit.token("Punctuator", "@")
  kit.token("Punctuator", "{")
  if (interior !== "") kit.token("RawText", interior)
  const close = kit.token("Punctuator", "}")
  const data = kit.node("UsecaseJsonDataBlock", hull(at, close), {
    value: interior,
  })
  return kit.node("UsecaseJsonStatement", hull(keyword, close), {
    id: identifier,
    data,
    classes: [],
  })
}

/** A native standalone metadata update with authored properties. */
export function update(
  kit: Kit,
  target: string,
  properties: readonly (readonly [string, string, string?])[],
): CheckedNode {
  const name = id(kit, target)
  const data = metadata(kit, properties)
  return kit.node("UsecaseMetadataAssignmentStatement", hull(name, data), {
    target: name,
    metadata: data,
  })
}

/** A CSS declaration with explicitly supplied padding/value text. */
export function css(kit: Kit, name: string, value: string): CheckedNode {
  const prefix = name.startsWith("--") ? kit.token("Punctuator", "--") : null
  const word = kit.token(
    "Identifier",
    prefix === null ? name : name.slice(2).trimStart(),
  )
  const property = kit.node(
    "UsecaseIdentifier",
    prefix === null ? word.range : hull(prefix, word),
    { name },
  )
  kit.token("Punctuator", ":")
  const content = literal(kit, value)
  return kit.node("UsecaseStyleDeclaration", hull(property, content), {
    name: property,
    value: content,
  })
}

/** A style statement with one explicitly supplied declaration. */
export function style(
  kit: Kit,
  target: string,
  name: string,
  value: string,
): CheckedNode {
  const keyword = kit.token("Keyword", "style")
  const identifier = id(kit, target)
  const declaration = css(kit, name, value)
  return kit.node("UsecaseStyleStatement", hull(keyword, declaration), {
    target: identifier,
    styles: [declaration],
  })
}

/** Accessibility interiors retain all supplied whitespace, including exactly empty null. */
export function accessibility(
  kit: Kit,
  kind: "title" | "description" | "block",
  value: string,
): CheckedNode {
  const keyword = kit.token(
    "Keyword",
    kind === "title" ? "accTitle" : "accDescr",
  )
  const delimiter = kit.token("Punctuator", kind === "block" ? "{" : ":")
  const content = value === "" ? null : literal(kit, value)
  const end =
    kind === "block" ? kit.token("Punctuator", "}") : (content ?? delimiter)
  return kit.node(
    kind === "title"
      ? "UsecaseAccTitleStatement"
      : kind === "block"
        ? "UsecaseAccDescrBlockStatement"
        : "UsecaseAccDescrStatement",
    hull(keyword, end),
    { value: content },
  )
}

/** Build a named fixed input without creating or recording a parser. */
export function built(
  source: string,
  statements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(USECASE, source, statements)
}
