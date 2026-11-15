import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"

/** The kind of the header, the direction, and the keywords. */
const KEYWORD = "Keyword"

/** The kind of `:`, `{`, and `}`. */
const PUNCTUATOR = "Punctuator"

/** A tree of `source`, whose header is followed by the direction `direction` where it is not null. */
export function buildTimeline(
  source: string,
  direction: string | null,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "timeline",
      diagramType: "timeline",
      bodyType: "TimelineDiagram",
      bodyFields: (nodes) => ({ direction, body: nodes }),
    },
    source,
    (kit) => {
      if (direction !== null) kit.token(KEYWORD, direction)
      return makeStatements(kit)
    },
  )
}

/** A text without quotes: its `RawText` token, and the `TimelineLiteral` that holds it. */
export function literal(
  kit: Kit,
  text: string,
  value: string = text,
): CheckedNode {
  const token = kit.token("RawText", text)
  return kit.node("TimelineLiteral", token.range, { value })
}

/** A period and the events that follow it: the `:` and the event text of each; `afterPeriod` makes what lies between the period and its first event. */
export function period(
  kit: Kit,
  text: string,
  events: readonly string[],
  afterPeriod: () => void = () => undefined,
): CheckedNode {
  const first = literal(kit, text)
  afterPeriod()
  const written = events.map((event) => {
    kit.token(PUNCTUATOR, ":")
    return literal(kit, event)
  })
  const last = written.at(-1) ?? first
  return kit.node("TimelinePeriodStatement", [first.range[0], last.range[1]], {
    period: first,
    events: written,
  })
}

/** An event statement: the `:` and the text of each event; `betweenEvents` records their intervening trivia. */
export function eventStatement(
  kit: Kit,
  texts: readonly string[],
  betweenEvents: () => void = () => undefined,
): CheckedNode {
  const written: CheckedNode[] = []
  let start = -1
  for (const text of texts) {
    if (start !== -1) betweenEvents()
    const colon = kit.token(PUNCTUATOR, ":")
    if (start === -1) start = colon.range[0]
    written.push(literal(kit, text))
  }
  return kit.node(
    "TimelineEventStatement",
    [start, written.at(-1)?.range[1] ?? start],
    { events: written },
  )
}

/** A statement of a keyword and one text: `title` and its value, `section` and its name, or an accessibility statement with its `:`. */
export function keywordAndText(
  kit: Kit,
  type: string,
  keyword: string,
  field: string,
  text: string,
  mark: string | null = null,
): CheckedNode {
  const first = kit.token(KEYWORD, keyword)
  if (mark !== null) kit.token(PUNCTUATOR, mark)
  const value = literal(kit, text)
  return kit.node(type, [first.range[0], value.range[1]], { [field]: value })
}

/** An `accDescr` block with its text, or without text where `text` is null. */
export function block(
  kit: Kit,
  keyword: string,
  text: string | null,
): CheckedNode {
  const first = kit.token(KEYWORD, keyword)
  kit.token(PUNCTUATOR, "{")
  const value = text === null ? null : literal(kit, text)
  const closing = kit.token(PUNCTUATOR, "}")
  return kit.node(
    "TimelineAccDescrBlockStatement",
    [first.range[0], closing.range[1]],
    { value },
  )
}
