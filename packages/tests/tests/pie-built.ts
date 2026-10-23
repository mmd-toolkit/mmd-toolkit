import type { CheckedNode } from "../src/check-tree/types.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"

/** Hull of explicitly supplied occurrences; these helpers never lex or parse an input. */
function hull(pieces: readonly { readonly range: TreeRange }[]): TreeRange {
  return [
    Math.min(...pieces.map((piece) => piece.range[0])),
    Math.max(...pieces.map((piece) => piece.range[1])),
  ]
}

/** A fixed pie source with explicitly supplied statement occurrences. */
export function buildPie(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  showData = false,
): Built {
  return buildTree(
    {
      header: "pie",
      diagramType: "pie",
      bodyType: "PieDiagram",
      bodyFields: (body) => ({
        showData,
        textBeforeHeader: [],
        textBeforeShowData: [],
        body,
      }),
    },
    source,
    (kit) => {
      if (showData) kit.token("Keyword", "showData")
      return make(kit)
    },
  )
}

/** One explicitly delimited hidden form; its following LF is outside the node. */
export function ignored(
  kit: Kit,
  raw: string,
  kind: "yaml-block" | "directive",
): CheckedNode {
  return kit.node("PieIgnoredText", kit.token("RawText", raw).range, {
    kind,
    value: raw,
  })
}

/** The explicitly written gaps surrounding a section's fixed colon and numeric unit. */
export interface SectionGaps {
  readonly beforeColon?: () => CheckedNode[]
  readonly beforeValue?: () => CheckedNode[]
  readonly after?: () => CheckedNode[]
}

/** A section occurrence retaining its raw label, number and named hidden gaps. */
export function section(
  kit: Kit,
  label: string,
  number: string,
  gaps: SectionGaps = {},
): CheckedNode {
  const string = kit.node("StringLiteral", kit.token("String", label).range, {
    raw: label,
    value: label.slice(1, -1),
    closed: true,
  })
  const textBeforeColon = gaps.beforeColon?.() ?? []
  kit.token("Punctuator", ":")
  const textBeforeValue = gaps.beforeValue?.() ?? []
  const value = kit.node("NumericLiteral", kit.token("Numeric", number).range, {
    raw: number,
    value: Number(number),
  })
  const textAfter = gaps.after?.() ?? []
  return kit.node("PieSectionStatement", hull([string, value, ...textAfter]), {
    label: string,
    textBeforeColon,
    textBeforeValue,
    value,
    textAfter,
  })
}

/** An explicit common statement: null has no value token; blocks get their own braces. */
export function common(
  kit: Kit,
  type:
    | "PieTitleStatement"
    | "PieAccTitleStatement"
    | "PieAccDescrStatement"
    | "PieAccDescrBlockStatement",
  value: string | null,
  after: () => CheckedNode[] = () => [],
): CheckedNode {
  const title = type === "PieTitleStatement"
  const block = type === "PieAccDescrBlockStatement"
  const keyword = kit.token(
    "Keyword",
    title ? "title" : type === "PieAccTitleStatement" ? "accTitle" : "accDescr",
  )
  const pieces: { readonly range: TreeRange }[] = [keyword]
  if (!title) pieces.push(kit.token("Punctuator", block ? "{" : ":"))
  const literal =
    value === null
      ? null
      : kit.node("PieLiteral", kit.token("RawText", value).range, { value })
  if (literal !== null) pieces.push(literal)
  if (block) pieces.push(kit.token("Punctuator", "}"))
  const textAfter = after()
  pieces.push(...textAfter)
  return kit.node(type, hull(pieces), { value: literal, textAfter })
}
