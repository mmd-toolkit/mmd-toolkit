import type { RecordedNode } from "../src/recorded-tree.ts"
import type { Kit } from "./tree-built.ts"
import { buildTree } from "./tree-built.ts"
import type { Built } from "./tree-built.ts"

/** The range of the supplied authored components, without lexing or parsing. */
export function hull(
  pieces: readonly { range: readonly [number, number] }[],
): readonly [number, number] {
  return [
    Math.min(...pieces.map((piece) => piece.range[0])),
    Math.max(...pieces.map((piece) => piece.range[1])),
  ]
}

/** One explicitly delimited hidden match; its following LF is not part of it. */
export function ignored(
  kit: Kit,
  prefix:
    | "Architecture"
    | "Cynefin"
    | "Eventmodeling"
    | "Gitgraph"
    | "Info"
    | "Packet"
    | "Radar"
    | "Wardley",
  raw: string,
  kind: "yaml-block" | "directive",
): RecordedNode {
  return kit.node(`${prefix}IgnoredText`, kit.token("RawText", raw).range, {
    kind,
    value: raw,
  })
}

/** A common form with the literal boundaries supplied by the test. */
export function common(
  kit: Kit,
  prefix:
    | "Architecture"
    | "Cynefin"
    | "Gitgraph"
    | "Info"
    | "Packet"
    | "Radar"
    | "Wardley",
  kind: "Title" | "AccTitle" | "AccDescr" | "AccDescrBlock",
  value: string | null,
  after: () => RecordedNode[] = () => [],
): RecordedNode {
  const block = kind === "AccDescrBlock"
  const word =
    kind === "Title" ? "title" : kind === "AccTitle" ? "accTitle" : "accDescr"
  const pieces: { range: readonly [number, number] }[] = [
    kit.token("Keyword", word),
  ]
  if (kind !== "Title") pieces.push(kit.token("Punctuator", block ? "{" : ":"))
  const literal =
    value === null
      ? null
      : kit.node(`${prefix}Literal`, kit.token("RawText", value).range, {
          value,
        })
  if (literal !== null) pieces.push(literal)
  if (block) pieces.push(kit.token("Punctuator", "}"))
  const textAfter = after()
  pieces.push(...textAfter)
  return kit.node(`${prefix}${kind}Statement`, hull(pieces), {
    value: literal,
    textAfter,
  })
}

/** A fixed info input and explicitly supplied occurrences. */
export function buildInfo(
  source: string,
  make: (kit: Kit) => RecordedNode[],
  showInfo = false,
  beforeFlag: (kit: Kit) => RecordedNode[] = () => [],
): Built {
  let textBeforeShowInfo: RecordedNode[] = []
  return buildTree(
    {
      header: "info",
      diagramType: "info",
      bodyType: "InfoDiagram",
      bodyFields: (body) => ({
        showInfo,
        textBeforeHeader: [],
        textBeforeShowInfo,
        body,
      }),
    },
    source,
    (kit) => {
      if (showInfo) {
        textBeforeShowInfo = beforeFlag(kit)
        kit.token("Keyword", "showInfo")
      }
      return make(kit)
    },
  )
}

/** A fixed gitgraph input and authored header components. */
export function buildGitgraph(
  source: string,
  make: (kit: Kit) => RecordedNode[],
  direction: "LR" | "TB" | "BT" | null = null,
  colon: boolean = direction !== null,
  gaps: {
    readonly beforeDirection?: (kit: Kit) => RecordedNode[]
    readonly beforeColon?: (kit: Kit) => RecordedNode[]
  } = {},
): Built {
  let textBeforeDirection: RecordedNode[] = []
  let textBeforeColon: RecordedNode[] = []
  return buildTree(
    {
      header: "gitGraph",
      diagramType: "gitGraph",
      bodyType: "GitgraphDiagram",
      bodyFields: (body) => ({
        direction,
        textBeforeHeader: [],
        textBeforeDirection,
        textBeforeColon,
        body,
      }),
    },
    source,
    (kit) => {
      if (direction !== null) {
        textBeforeDirection = gaps.beforeDirection?.(kit) ?? []
        kit.token("Keyword", direction)
      }
      if (colon) {
        textBeforeColon = gaps.beforeColon?.(kit) ?? []
        kit.token("Punctuator", ":")
      }
      return make(kit)
    },
  )
}
