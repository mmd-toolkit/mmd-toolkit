import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { commentOf, locationOf, tokenOf } from "./check-tree-trees.ts"

/** Retained prefixes supplied as complete occurrences, with explicit cuts and Comments. */
export function withPreheader(
  built: Built,
  prefix: "Architecture" | "Gitgraph" | "Info" | "Packet",
  parts: readonly (readonly [
    string,
    "yaml-block" | "directive",
    (readonly string[])?,
  ])[],
  comments: readonly string[],
): Built {
  const forms: CheckedNode[] = []
  const tokens = []
  let from = 0
  for (const [raw, kind, fragments] of parts) {
    const whole = tokenOf(built.source, "RawText", { text: raw, from })
    let pieceFrom = from
    for (const text of fragments ?? [raw]) {
      const token = tokenOf(built.source, "RawText", { text, from: pieceFrom })
      tokens.push(token)
      pieceFrom = token.range[1]
    }
    forms.push({
      type: `${prefix}IgnoredText`,
      kind,
      value: fragments?.join("") ?? raw,
      range: whole.range,
      loc: whole.loc,
    })
    from = whole.range[1]
  }
  const range = [
    forms[0]?.range[0] ?? built.tree.body.range[0],
    built.tree.body.range[1],
  ] as const
  setField(built.tree.body, "textBeforeHeader", forms)
  setField(built.tree.body, "range", range)
  setField(built.tree.body, "loc", locationOf(built.source, range))
  setField(built.tree, "tokens", [...tokens, ...built.tree.tokens])
  let commentFrom = 0
  setField(
    built.tree,
    "comments",
    comments.map((text) => {
      if (text === "%%")
        commentFrom = built.source.indexOf("\n%%\n", commentFrom) + 1
      const comment = commentOf(built.source, "%%", { text, from: commentFrom })
      commentFrom = comment.range[1]
      return comment
    }),
  )
  return built
}

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
  prefix: "Architecture" | "Gitgraph" | "Info" | "Packet",
  raw: string,
  kind: "yaml-block" | "directive",
): CheckedNode {
  return kit.node(`${prefix}IgnoredText`, kit.token("RawText", raw).range, {
    kind,
    value: raw,
  })
}

/** A common form with the literal boundaries supplied by the test. */
export function common(
  kit: Kit,
  prefix: "Architecture" | "Gitgraph" | "Info" | "Packet",
  kind: "Title" | "AccTitle" | "AccDescr" | "AccDescrBlock",
  value: string | null,
  after: () => CheckedNode[] = () => [],
): CheckedNode {
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
  make: (kit: Kit) => CheckedNode[],
  showInfo = false,
  beforeFlag: (kit: Kit) => CheckedNode[] = () => [],
): Built {
  let textBeforeShowInfo: CheckedNode[] = []
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
  make: (kit: Kit) => CheckedNode[],
  direction: "LR" | "TB" | "BT" | null = null,
  colon: boolean = direction !== null,
  gaps: {
    readonly beforeDirection?: (kit: Kit) => CheckedNode[]
    readonly beforeColon?: (kit: Kit) => CheckedNode[]
  } = {},
): Built {
  let textBeforeDirection: CheckedNode[] = []
  let textBeforeColon: CheckedNode[] = []
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
