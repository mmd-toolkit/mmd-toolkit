import type { CheckedNode } from "../src/check-tree/types.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** Fixed source with explicitly authored nodes; this helper does not parse. */
export function buildTreeview(
  source: string,
  make: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "treeView-beta",
      diagramType: "treeView",
      bodyType: "TreeviewDiagram",
    },
    source,
    make,
  )
}

/** One retained source branch, with its marker supplied by the test. */
export function prefix(kit: Kit, raw: string, marker = "├"): CheckedNode {
  return kit.node("TreeviewBranchPrefix", kit.token("RawText", raw).range, {
    value: raw,
    marker,
  })
}

/** One whole branchless decoration, without its outer padding or LF. */
export function decoration(kit: Kit, raw = "│"): CheckedNode {
  return kit.node("TreeviewIgnoredText", kit.token("RawText", raw).range, {
    kind: "box-decoration",
    value: raw,
  })
}

/** An explicit bare or quoted name and its source-ordered annotations. */
export function row(
  kit: Kit,
  indent: number,
  raw: string,
  annotations: () => CheckedNode[] = () => [],
  branch: CheckedNode | null = null,
  textBeforeName: CheckedNode[] = [],
): CheckedNode {
  const quoted = raw.startsWith('"') || raw.startsWith("'")
  const token = kit.token(quoted ? "String" : "RawText", raw)
  const name = kit.node(
    quoted ? "StringLiteral" : "TreeviewIdentifier",
    token.range,
    quoted ? { raw, value: raw.slice(1, -1), closed: true } : { name: raw },
  )
  const members = annotations()
  return kit.node(
    "TreeviewNode",
    hull([
      ...(branch === null ? [] : [branch]),
      ...textBeforeName,
      name,
      ...members,
    ]),
    { indent, prefix: branch, textBeforeName, name, annotations: members },
  )
}

/** Explicit class/icon/description components, including empty written annotations. */
export function annotation(
  kit: Kit,
  kind: "Class" | "Icon" | "Description",
  raw: string | null,
  before: CheckedNode[] = [],
  branch: CheckedNode | null = null,
): CheckedNode {
  const pieces: { range: TreeRange }[] = [
    ...before,
    ...(branch === null ? [] : [branch]),
  ]
  pieces.push(
    kit.token(
      kind === "Icon" ? "Keyword" : "Punctuator",
      kind === "Class" ? ":::" : kind === "Icon" ? "icon" : "##",
    ),
  )
  if (kind === "Icon") pieces.push(kit.token("Punctuator", "("))
  const value =
    raw === null
      ? null
      : kit.node(
          kind === "Description" ? "TreeviewLiteral" : "Identifier",
          kit.token(kind === "Description" ? "RawText" : "Identifier", raw)
            .range,
          kind === "Description" ? { value: raw } : { name: raw },
        )
  if (value !== null) pieces.push(value)
  if (kind === "Icon") pieces.push(kit.token("Punctuator", ")"))
  return kit.node(`Treeview${kind}Annotation`, hull(pieces), {
    textBefore: before,
    prefix: branch,
    [kind === "Description" ? "value" : "name"]: value,
  })
}

/** Common payloads are supplied untrimmed, including the complete brace interior. */
export function common(
  kit: Kit,
  kind: "Title" | "AccTitle" | "AccDescr" | "AccDescrBlock",
  raw: string | null,
  branch: CheckedNode | null = null,
  gapBeforeOpen: () => CheckedNode[] = () => [],
): CheckedNode {
  const word =
    kind === "Title" ? "title" : kind === "AccTitle" ? "accTitle" : "accDescr"
  const pieces: { range: TreeRange }[] = [
    ...(branch === null ? [] : [branch]),
    kit.token("Keyword", word),
  ]
  const textBeforeOpen = kind === "AccDescrBlock" ? gapBeforeOpen() : []
  pieces.push(...textBeforeOpen)
  if (kind !== "Title")
    pieces.push(kit.token("Punctuator", kind === "AccDescrBlock" ? "{" : ":"))
  const value =
    raw === null
      ? null
      : kit.node(
          "TreeviewLiteral",
          kit.token(
            "RawText",
            raw,
            kind === "Title" ? pieces.at(-1)!.range[1] + 1 : undefined,
          ).range,
          { value: raw },
        )
  if (value !== null) pieces.push(value)
  if (kind === "AccDescrBlock") pieces.push(kit.token("Punctuator", "}"))
  return kit.node(`Treeview${kind}Statement`, hull(pieces), {
    prefix: branch,
    ...(kind === "AccDescrBlock" ? { textBeforeOpen } : {}),
    value,
  })
}
