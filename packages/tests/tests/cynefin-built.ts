import type { RecordedNode } from "../src/recorded-tree.ts"
import { buildTree } from "./tree-built.ts"
import type { Built, Kit } from "./tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** A fixed input and explicitly supplied occurrences, without a parser or lexer. */
export function buildCynefin(
  source: string,
  make: (kit: Kit) => RecordedNode[],
  colon = false,
): Built {
  return buildTree(
    {
      header: "cynefin-beta",
      diagramType: "cynefin",
      bodyType: "CynefinDiagram",
      bodyFields: (body) => ({ textBeforeHeader: [], body }),
    },
    source,
    (kit) => {
      if (colon) kit.token("Punctuator", ":")
      return make(kit)
    },
  )
}

/** Every hidden gap is supplied explicitly, rather than inferred from the input. */
type Gaps = Readonly<Record<string, (() => RecordedNode[]) | undefined>>

/** One authored quoted string, retaining its escapes and empty interior. */
export function string(kit: Kit, raw: string): RecordedNode {
  return kit.node("StringLiteral", kit.token("String", raw).range, {
    raw,
    value: raw.slice(1, -1),
    closed: true,
  })
}

/** One item with independently supplied before/after ownership. */
export function item(kit: Kit, raw: string, gaps: Gaps = {}): RecordedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const label = string(kit, raw)
  const textAfter = gaps.textAfter?.() ?? []
  return kit.node(
    "CynefinDomainItem",
    hull([...textBefore, label, ...textAfter]),
    {
      textBefore,
      label,
      textAfter,
    },
  )
}

/** A domain occurrence remains a block even when its authored items are empty. */
export function domain(
  kit: Kit,
  name: string,
  items: readonly (() => RecordedNode)[] = [],
  afterName: () => RecordedNode[] = () => [],
): RecordedNode {
  const keyword = kit.token("Keyword", name)
  const textAfterName = afterName()
  const members = items.map((make) => make())
  return kit.node(
    "CynefinDomainStatement",
    hull([keyword, ...textAfterName, ...members]),
    {
      name,
      textAfterName,
      items: members,
    },
  )
}

/** A transition retains self loops, empty labels and every named native gap. */
export function transition(
  kit: Kit,
  from: string,
  to: string,
  labelRaw: string | null = null,
  gaps: Gaps = {},
): RecordedNode {
  const source = kit.token("Keyword", from)
  const textBeforeArrow = gaps.textBeforeArrow?.() ?? []
  const arrow = kit.node("CynefinArrow", kit.token("Punctuator", "-->").range, {
    value: "-->",
    startMarker: "none",
    line: "solid",
    endMarker: "arrow",
  })
  const textBeforeTo = gaps.textBeforeTo?.() ?? []
  const target = kit.token("Keyword", to)
  const textBeforeColon =
    labelRaw === null ? [] : (gaps.textBeforeColon?.() ?? [])
  const colon = labelRaw === null ? [] : [kit.token("Punctuator", ":")]
  const textBeforeLabel =
    labelRaw === null ? [] : (gaps.textBeforeLabel?.() ?? [])
  const label = labelRaw === null ? null : string(kit, labelRaw)
  const textAfter = gaps.textAfter?.() ?? []
  return kit.node(
    "CynefinTransitionStatement",
    hull([
      source,
      ...textBeforeArrow,
      arrow,
      ...textBeforeTo,
      target,
      ...textBeforeColon,
      ...colon,
      ...textBeforeLabel,
      ...(label === null ? [] : [label]),
      ...textAfter,
    ]),
    {
      from,
      textBeforeArrow,
      arrow,
      textBeforeTo,
      to,
      textBeforeColon,
      textBeforeLabel,
      label,
      textAfter,
    },
  )
}
