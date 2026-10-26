import type { TreeRange } from "../src/db-from-tree/tree.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** Fixed source and explicitly supplied statements, without parsing the source. */
export function buildTreemap(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  beta = false,
): Built {
  return buildTree(
    {
      header: beta ? "treemap-beta" : "treemap",
      diagramType: "treemap",
      bodyType: "TreemapDiagram",
    },
    source,
    make,
  )
}

/** One authored section or leaf, with its indentation supplied explicitly. */
export function row(
  kit: Kit,
  indent: number,
  raw: string,
  number: string | null = null,
  selector: string | null = null,
  separator = ":",
): CheckedNode {
  const name = kit.node("StringLiteral", kit.token("String", raw).range, {
    raw,
    value: raw.slice(1, -1),
    closed: true,
  })
  const pieces: { range: TreeRange }[] = [name]
  let value: CheckedNode | null = null
  if (number !== null) {
    pieces.push(kit.token("Punctuator", separator))
    value = kit.node("NumericLiteral", kit.token("Numeric", number).range, {
      raw: number,
      value: Number.parseFloat(number.replaceAll(",", "")),
    })
    pieces.push(value)
  }
  let classSelector: CheckedNode | null = null
  if (selector !== null) {
    pieces.push(kit.token("Punctuator", ":::"))
    classSelector = kit.node(
      "Identifier",
      kit.token("Identifier", selector).range,
      { name: selector },
    )
    pieces.push(classSelector)
  }
  return kit.node(
    number === null ? "TreemapSection" : "TreemapLeaf",
    hull(pieces),
    { indent, name, ...(value === null ? {} : { value }), classSelector },
  )
}

/** One class composite, with complete raw style and terminal semicolon supplied. */
export function classDef(
  kit: Kit,
  indent: number,
  id: string,
  raw: string | null,
  semicolon = true,
): CheckedNode {
  const keyword = kit.token("Keyword", "classDef")
  const name = kit.node("Identifier", kit.token("Identifier", id).range, {
    name: id,
  })
  const style =
    raw === null
      ? null
      : kit.node("TreemapLiteral", kit.token("RawText", raw).range, {
          value: raw,
        })
  const pieces = [keyword, name, ...(style === null ? [] : [style])]
  if (semicolon) pieces.push(kit.token("Punctuator", ";"))
  return kit.node("TreemapClassDefStatement", hull(pieces), {
    indent,
    name,
    style,
  })
}

/** A common composite with exactly the authored value supplied by the test. */
export function common(
  kit: Kit,
  kind: "Title" | "AccTitle" | "AccDescr" | "AccDescrBlock",
  value: string | null,
): CheckedNode {
  const block = kind === "AccDescrBlock"
  const word =
    kind === "Title" ? "title" : kind === "AccTitle" ? "accTitle" : "accDescr"
  const pieces: { range: TreeRange }[] = [kit.token("Keyword", word)]
  if (kind !== "Title") pieces.push(kit.token("Punctuator", block ? "{" : ":"))
  const literal =
    value === null
      ? null
      : kit.node(
          "TreemapLiteral",
          kit.token(
            "RawText",
            value,
            kind === "Title" ? (pieces[0]?.range[1] ?? 0) + 1 : undefined,
          ).range,
          { value },
        )
  if (literal !== null) pieces.push(literal)
  if (block) pieces.push(kit.token("Punctuator", "}"))
  return kit.node(`Treemap${kind}Statement`, hull(pieces), { value: literal })
}
