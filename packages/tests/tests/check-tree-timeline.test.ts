import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  TIMELINE_CHILD_TYPES,
  TIMELINE_DIRECTIONS,
} from "../src/check-tree/timeline.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { BrokenCase, Built, Kit } from "./check-tree-built.ts"
import { buildTree, itFailsEach, nodeWith } from "./check-tree-built.ts"
import {
  firstNode,
  problemsOf,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  readFieldMeanings,
  readFieldTables,
  readTreeDocuments,
} from "./spec-field-tables.ts"

// The trees of a timeline diagram made by hand: they are the smallest trees
// that hold the case they are about (see `check-tree-built.ts`). The tokens of
// the header, the direction, and the keywords are `Keyword` tokens, those of
// `:`, `{`, and `}` are `Punctuator` tokens, and those of a text are `RawText`
// tokens (parser/docs/tokens/timeline.md).

/** The kind of the header, the direction, and the keywords. */
const KEYWORD = "Keyword"

/** The kind of `:`, `{`, and `}`. */
const PUNCTUATOR = "Punctuator"

/** A tree of `source`, whose header is followed by the direction `direction` where it is not null. */
function build(
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
function literal(kit: Kit, text: string, value = text): CheckedNode {
  const token = kit.token("RawText", text)
  return kit.node("TimelineLiteral", token.range, { value })
}

/** A period and the events that follow it: the `:` and the event text of each; `afterPeriod` makes what lies between the period and its first event. */
function period(
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

/** An event statement: the `:` and the event text of each of its events. */
function eventStatement(kit: Kit, texts: readonly string[]): CheckedNode {
  const written: CheckedNode[] = []
  let start = -1
  for (const text of texts) {
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
function keywordAndText(
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
function block(kit: Kit, keyword: string, text: string | null): CheckedNode {
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

/** Every kind of statement: the direction, a title, the accessibility statements, a section, a period with events on its line and on the lines after, a period that starts with `%{`, a period with a comment after it, and an event statement. */
function everyKindOfStatement(): Built {
  return build(
    "timeline TD\n  title T\n  accTitle: Aa\n  accDescr: Dd\n  accDescr {\n  B\n  }\n  accDescr {}\n  section S\n  2004 : e1 : e2\n       : e3\n  %{x}\n  : e4\n  y # c\n  : e5\n  section U\n  : e6\n",
    "TD",
    (kit) => [
      keywordAndText(kit, "TimelineTitleStatement", "title", "value", "T"),
      keywordAndText(
        kit,
        "TimelineAccTitleStatement",
        "accTitle",
        "value",
        "Aa",
        ":",
      ),
      keywordAndText(
        kit,
        "TimelineAccDescrStatement",
        "accDescr",
        "value",
        "Dd",
        ":",
      ),
      block(kit, "accDescr", "B"),
      block(kit, "accDescr", null),
      keywordAndText(kit, "TimelineSectionStatement", "section", "name", "S"),
      period(kit, "2004 ", ["e1 ", "e2", "e3"]),
      period(kit, "%{x}", ["e4"]),
      period(kit, "y ", ["e5"], () => {
        kit.comment("#", "# c")
      }),
      keywordAndText(kit, "TimelineSectionStatement", "section", "name", "U"),
      eventStatement(kit, ["e6"]),
    ],
  )
}

/** The header alone: no statement. */
function headerOnly(): Built {
  return build("timeline\n", null, () => [])
}

/** The direction in lower case, and an event after a title. */
function lowerCaseDirectionAndEventAfterTitle(): Built {
  return build("timeline td\n  a\n  title T\n  : e\n", "td", (kit) => [
    period(kit, "a", []),
    keywordAndText(kit, "TimelineTitleStatement", "title", "value", "T"),
    eventStatement(kit, ["e"]),
  ])
}

/** Texts that look like other units: a keyword with a suffix, a keyword and no text, a keyword and an empty line, the keywords of the accessibility statements without their `:` and `{`, and a `%` and a `{`. */
function periodsThatLookLikeOtherUnits(): Built {
  return build(
    "timeline\n  timelinex\n\n  title\n\n  title \n\n  section\n\n  sectionx\n  accTitle\n  accDescr\n  %{x}\n",
    null,
    (kit) =>
      [
        "timelinex",
        "title",
        "title ",
        "section",
        "sectionx",
        "accTitle",
        "accDescr",
        "%{x}",
      ].map((text) => period(kit, text, [])),
  )
}

/** A directive line with no indentation after `title` leaves an empty line, so `title` is a period (diagrams/timeline.md, Trivia between units). */
function titleBeforeDirectiveLine(): Built {
  return build("timeline\n  title\n%%{init: {}}%%\nT\n", null, (kit) => {
    const title = period(kit, "title", [])
    kit.directive("%%{init: {}}%%")
    return [title, period(kit, "T", [])]
  })
}

/** The texts of the units with the whitespace that they keep: a period before its colon, an event at its ends, a title and a section at their ends, and the texts that start after a line feed. */
function whitespaceOfTexts(): Built {
  return build(
    "timeline\n  title   T  \n  section  S \n  a  :  e  : f\n  b :\n  g\n  accTitle:\n  H\n  accDescr {  J\n  K  }\n",
    null,
    (kit) => [
      keywordAndText(kit, "TimelineTitleStatement", "title", "value", "  T  "),
      keywordAndText(kit, "TimelineSectionStatement", "section", "name", " S "),
      period(kit, "a  ", [" e  ", "f"]),
      period(kit, "b ", ["  g"]),
      keywordAndText(
        kit,
        "TimelineAccTitleStatement",
        "accTitle",
        "value",
        "H",
        ":",
      ),
      block(kit, "accDescr", "J\n  K"),
    ],
  )
}

/** An event after a statement that is not a period, and a `:` inside an event. */
function eventsAfterOtherStatements(): Built {
  return build(
    "timeline\n  a\n  accTitle: A\n  : e:f : g :h\n  accDescr {}\n  : i\n",
    null,
    (kit) => [
      period(kit, "a", []),
      keywordAndText(
        kit,
        "TimelineAccTitleStatement",
        "accTitle",
        "value",
        "A",
        ":",
      ),
      eventStatement(kit, ["e:f ", "g :h"]),
      block(kit, "accDescr", null),
      eventStatement(kit, ["i"]),
    ],
  )
}

/** An entity in a period and in an event: it is read as a placeholder, so its `#` ends no period (common.md, Entities). */
function entities(): Built {
  return build("timeline\n  a #35; b : c #35; d\n", null, (kit) => [
    period(kit, "a #35; b ", ["c #35; d"]),
  ])
}

const VALID: readonly [string, () => Built][] = [
  ["an entity in a period and in an event", entities],
  ["every kind of statement", everyKindOfStatement],
  ["the header alone", headerOnly],
  [
    "the direction in lower case and an event after a title",
    lowerCaseDirectionAndEventAfterTitle,
  ],
  ["periods that look like other units", periodsThatLookLikeOtherUnits],
  ["a title keyword before a directive line", titleBeforeDirectiveLine],
  ["the whitespace of the texts", whitespaceOfTexts],
  ["events after other statements", eventsAfterOtherStatements],
]

describe("the check of a timeline tree", () => {
  for (const [name, built] of VALID) {
    it(`accepts ${name}`, () => {
      const { source, tree } = built()
      expect(checkTree(source, tree)).toEqual([])
    })
  }
})

/** The part of the message of the problem that the node of the type `owner` reports: `where: message`. */
function at(owner: string, message: string): string {
  return `${owner} at #: ${message}`
}

/** Sets the value of the literal whose value is `from` to `to`. */
function literalBecomes(from: string, to: string): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, "TimelineLiteral", "value", from), "value", to)
  }
}

/** Moves the start of the range of the literal whose value is `value` by `by`. */
function literalStartsMoved(value: string, by: number): BrokenCase["mutate"] {
  return (tree) => {
    const node = nodeWith(tree, "TimelineLiteral", "value", value)
    setField(node, "range", [node.range[0] + by, node.range[1]])
  }
}

/** Moves the end of the range of the literal whose value is `value` by `by`. */
function literalEndsMoved(value: string, by: number): BrokenCase["mutate"] {
  return (tree) => {
    const node = nodeWith(tree, "TimelineLiteral", "value", value)
    setField(node, "range", [node.range[0], node.range[1] + by])
  }
}

const ALL_STATEMENTS =
  "TimelinePeriodStatement or TimelineEventStatement or TimelineTitleStatement or TimelineSectionStatement or TimelineAccTitleStatement or TimelineAccDescrStatement or TimelineAccDescrBlockStatement"

// ast/timeline.md, the Type column: the child nodes of a field are of the
// types that its table gives. Each case puts a node of another type into a
// field.
const WRONG_CHILD_TYPES: readonly BrokenCase[] = [
  {
    name: "a literal among the statements of the body",
    built: everyKindOfStatement,
    mutate: (tree) => {
      const body = nodeWith(tree, "TimelineDiagram").body as CheckedNode[]
      body.push(nodeWith(tree, "TimelineLiteral", "value", "T"))
    },
    expected: at(
      "TimelineDiagram",
      `the field body holds a TimelineLiteral, not a ${ALL_STATEMENTS}`,
    ),
  },
  {
    name: "a statement as the period of a period statement",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "TimelinePeriodStatement"),
        "period",
        nodeWith(tree, "TimelineTitleStatement"),
      )
    },
    expected: at(
      "TimelinePeriodStatement",
      "the field period holds a TimelineTitleStatement, not a TimelineLiteral",
    ),
  },
  {
    name: "a statement among the events of a period statement",
    built: everyKindOfStatement,
    mutate: (tree) => {
      const events = nodeWith(tree, "TimelinePeriodStatement")
        .events as CheckedNode[]
      events.push(nodeWith(tree, "TimelineSectionStatement"))
    },
    expected: at(
      "TimelinePeriodStatement",
      "the field events holds a TimelineSectionStatement, not a TimelineLiteral",
    ),
  },
  {
    name: "a statement among the events of an event statement",
    built: everyKindOfStatement,
    mutate: (tree) => {
      const events = nodeWith(tree, "TimelineEventStatement")
        .events as CheckedNode[]
      events.push(nodeWith(tree, "TimelineSectionStatement"))
    },
    expected: at(
      "TimelineEventStatement",
      "the field events holds a TimelineSectionStatement, not a TimelineLiteral",
    ),
  },
  {
    name: "a statement as the value of a title statement",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "TimelineTitleStatement"),
        "value",
        nodeWith(tree, "TimelineSectionStatement"),
      )
    },
    expected: at(
      "TimelineTitleStatement",
      "the field value holds a TimelineSectionStatement, not a TimelineLiteral",
    ),
  },
  {
    name: "a statement as the name of a section statement",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "TimelineSectionStatement"),
        "name",
        nodeWith(tree, "TimelineTitleStatement"),
      )
    },
    expected: at(
      "TimelineSectionStatement",
      "the field name holds a TimelineTitleStatement, not a TimelineLiteral",
    ),
  },
  {
    name: "a statement as the value of an accessibility title",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "TimelineAccTitleStatement"),
        "value",
        nodeWith(tree, "TimelineTitleStatement"),
      )
    },
    expected: at(
      "TimelineAccTitleStatement",
      "the field value holds a TimelineTitleStatement, not a TimelineLiteral",
    ),
  },
  {
    name: "a statement as the value of a description block",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "TimelineAccDescrBlockStatement", "value", null),
        "value",
        nodeWith(tree, "TimelineTitleStatement"),
      )
    },
    expected: at(
      "TimelineAccDescrBlockStatement",
      "the field value holds a TimelineTitleStatement, not a TimelineLiteral",
    ),
  },
]

// ast/timeline.md, TimelineDiagram: the direction is `LR` or `TD`, in any
// case, or null.
const WRONG_DIRECTION: readonly BrokenCase[] = [
  {
    name: "a direction that is none of the directions",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(nodeWith(tree, "TimelineDiagram"), "direction", "BT")
    },
    expected: at(
      "TimelineDiagram",
      'the direction is "BT", none of LR, TD in any case',
    ),
  },
  {
    name: "a direction of a word that starts with a direction",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(nodeWith(tree, "TimelineDiagram"), "direction", "TDx")
    },
    expected: at(
      "TimelineDiagram",
      'the direction is "TDx", none of LR, TD in any case',
    ),
  },
]

// ast/timeline.md, TimelineEventStatement and TimelinePeriodStatement, and
// diagrams/timeline.md, The statement context: the events that follow one
// another belong to one statement, and the first belongs to the period
// statement before them.
const BROKEN_STATEMENT_ORDER: readonly BrokenCase[] = [
  {
    name: "an event statement with no event",
    built: everyKindOfStatement,
    mutate: (tree) => {
      setField(nodeWith(tree, "TimelineEventStatement"), "events", [])
    },
    expected: at("TimelineEventStatement", "the list events is empty"),
  },
  {
    name: "an event statement right after a period statement",
    built: eventsAfterOtherStatements,
    mutate: (tree) => {
      const body = nodeWith(tree, "TimelineDiagram").body as CheckedNode[]
      body.splice(1, 1)
    },
    expected: at(
      "TimelineEventStatement",
      "follows a period statement or an event statement, or starts the body",
    ),
  },
  {
    name: "an event statement right after an event statement",
    built: eventsAfterOtherStatements,
    mutate: (tree) => {
      const body = nodeWith(tree, "TimelineDiagram").body as CheckedNode[]
      body.splice(3, 1)
    },
    expected: at(
      "TimelineEventStatement",
      "follows a period statement or an event statement, or starts the body",
    ),
  },
  {
    name: "an event statement that starts the body",
    built: lowerCaseDirectionAndEventAfterTitle,
    mutate: (tree) => {
      const body = nodeWith(tree, "TimelineDiagram").body as CheckedNode[]
      const [event] = body.splice(2, 1)
      if (event !== undefined) body.unshift(event)
    },
    expected: at(
      "TimelineEventStatement",
      "follows a period statement or an event statement, or starts the body",
    ),
  },
  {
    name: "an event statement before every period statement",
    built: lowerCaseDirectionAndEventAfterTitle,
    mutate: (tree) => {
      const body = nodeWith(tree, "TimelineDiagram").body as CheckedNode[]
      body.splice(0, 1)
    },
    expected: at(
      "TimelineEventStatement",
      "comes before every period statement, which the input rejects",
    ),
  },
]

/** A period, event, or text that holds `character` inside, where it ends the unit. */
const ENDING_CHARACTERS: readonly string[] = ["#", ":", "\n", "\r"]

// diagrams/timeline.md, The statement context, rule 14, and ast/timeline.md,
// TimelinePeriodStatement: a period is never empty; it starts with no
// whitespace and with no unit of a rule before the rule of a period; it holds
// none of `#`, `:`, and a line terminator; and it runs to a `#`, a `:`, the end
// of its line, or the end of the text.
const BROKEN_PERIODS: readonly BrokenCase[] = [
  {
    name: "an empty period",
    built: everyKindOfStatement,
    mutate: literalBecomes("2004 ", ""),
    expected: at("TimelineLiteral", "the period is empty"),
  },
  {
    name: "a period that starts with whitespace",
    built: everyKindOfStatement,
    mutate: literalBecomes("2004 ", " 2004 "),
    expected: at(
      "TimelineLiteral",
      'the period " 2004 " starts with whitespace, which is the indentation',
    ),
  },
  ...ENDING_CHARACTERS.map((character): BrokenCase => ({
    name: `a period that holds ${JSON.stringify(character)}`,
    built: everyKindOfStatement,
    mutate: literalBecomes("2004 ", `20${character}04 `),
    // A `#` in the expected text would stand for a range.
    expected: at(
      "TimelineLiteral",
      character === "#"
        ? 'the period "20'
        : `the period ${JSON.stringify(`20${character}04 `)} holds ${JSON.stringify(character)}, which ends a period`,
    ),
  })),
  {
    name: "a period that ends before its last character",
    built: everyKindOfStatement,
    mutate: literalEndsMoved("2004 ", -1),
    expected: at(
      "TimelineLiteral",
      // A `#` in the expected text would stand for a range.
      'the period ends before " ", which does not end it: a period runs to a `',
    ),
  },
]

// diagrams/timeline.md, The statement context, rule 13, and ast/timeline.md,
// TimelinePeriodStatement: an event is the text after a `:` and one whitespace
// character, up to a `:` that whitespace follows or the end of its line; it is
// never empty, holds no line terminator, and holds a `:` only where a
// character that is no whitespace follows it. Only whitespace and diagram
// comments lie between it and the item before it, besides the `:` and the one
// whitespace character.
const BROKEN_EVENTS: readonly BrokenCase[] = [
  {
    name: "an empty event",
    built: everyKindOfStatement,
    mutate: literalBecomes("e2", ""),
    expected: at("TimelineLiteral", "the event is empty"),
  },
  ...["\n", "\r"].map((character): BrokenCase => ({
    name: `an event that holds ${JSON.stringify(character)}`,
    built: everyKindOfStatement,
    mutate: literalBecomes("e2", `e${character}2`),
    expected: at(
      "TimelineLiteral",
      `the event ${JSON.stringify(`e${character}2`)} holds a line terminator, which ends it`,
    ),
  })),
  {
    name: "an event that holds a colon and whitespace",
    built: everyKindOfStatement,
    mutate: literalBecomes("e2", "e: 2"),
    expected: at(
      "TimelineLiteral",
      'the event "e: 2" holds a `:` that no character other than whitespace follows, which starts the next event',
    ),
  },
  {
    name: "an event that ends with a colon",
    built: everyKindOfStatement,
    mutate: literalBecomes("e2", "e2:"),
    expected: at(
      "TimelineLiteral",
      'the event "e2:" holds a `:` that no character other than whitespace follows, which starts the next event',
    ),
  },
  {
    name: "an event that starts one character late",
    built: everyKindOfStatement,
    mutate: literalStartsMoved("e2", 1),
    expected: at(
      "TimelinePeriodStatement",
      'the written text before the event "e2"',
    ),
  },
  {
    name: "an event that starts one character early",
    built: everyKindOfStatement,
    mutate: literalStartsMoved("e2", -1),
    expected: at(
      "TimelinePeriodStatement",
      'the written text before the event "e2"',
    ),
  },
  {
    name: "an event of an event statement that starts one character late",
    built: everyKindOfStatement,
    mutate: literalStartsMoved("e6", 1),
    expected: at(
      "TimelineEventStatement",
      'the written text before the event "e6"',
    ),
  },
  {
    name: "an event that ends before its last character",
    built: everyKindOfStatement,
    mutate: literalEndsMoved("e3", -1),
    expected: at(
      "TimelineLiteral",
      'the event ends before "3", which does not end it: an event runs to a `:`, to the end of its line, or to the end of the text',
    ),
  },
]

// ast/timeline.md, TimelineTitleStatement and TimelineSectionStatement: the
// text starts after the keyword and one whitespace character; a title runs to
// the end of its line, a section name to a `:` or the end of its line; neither
// is empty or holds a line terminator.
const BROKEN_TITLES_AND_SECTIONS: readonly BrokenCase[] = [
  {
    name: "an empty title",
    built: everyKindOfStatement,
    mutate: literalBecomes("T", ""),
    expected: at("TimelineTitleStatement", "the value is empty"),
  },
  {
    name: "a title that holds a line feed",
    built: everyKindOfStatement,
    mutate: literalBecomes("T", "T\nU"),
    expected: at(
      "TimelineTitleStatement",
      'the value "T\\nU" holds a line terminator, which ends it',
    ),
  },
  {
    name: "a title that starts at the whitespace character after the keyword",
    built: everyKindOfStatement,
    mutate: literalStartsMoved("T", -1),
    expected: at(
      "TimelineTitleStatement",
      "the value does not follow the keyword title and one whitespace character",
    ),
  },
  {
    name: "a title that ends before the whitespace at its end",
    built: whitespaceOfTexts,
    mutate: literalEndsMoved("  T  ", -1),
    expected: at(
      "TimelineTitleStatement",
      'the value ends before " ", which does not end its line: a title runs to the end of its line',
    ),
  },
  {
    name: "an empty section name",
    built: everyKindOfStatement,
    mutate: literalBecomes("S", ""),
    expected: at("TimelineSectionStatement", "the name is empty"),
  },
  {
    name: "a section name that holds a colon",
    built: everyKindOfStatement,
    mutate: literalBecomes("S", "S:T"),
    expected: at(
      "TimelineSectionStatement",
      'the name "S:T" holds a `:`, which ends the name of a section',
    ),
  },
  {
    name: "a section name that holds a line feed",
    built: everyKindOfStatement,
    mutate: literalBecomes("S", "S\nT"),
    expected: at(
      "TimelineSectionStatement",
      'the name "S\\nT" holds a line terminator, which ends it',
    ),
  },
  {
    name: "a section name that starts at the whitespace character after the keyword",
    built: everyKindOfStatement,
    mutate: literalStartsMoved("S", -1),
    expected: at(
      "TimelineSectionStatement",
      "the name does not follow the keyword section and one whitespace character",
    ),
  },
  {
    name: "a section name that ends before the whitespace at its end",
    built: whitespaceOfTexts,
    mutate: literalEndsMoved(" S ", -1),
    expected: at(
      "TimelineSectionStatement",
      'the name ends before " ", which does not end it: a name runs to a `:`, to the end of its line, or to the end of the text',
    ),
  },
]

// ast/timeline.md, TimelineAccTitleStatement, TimelineAccDescrStatement, and
// TimelineAccDescrBlockStatement: the text follows the keyword, a `:`, and the
// whitespace after it, or the keyword, a `{`, and its whitespace; it is never
// empty, has no whitespace at its ends, and runs to the end of its line, or to
// the whitespace before the `}` of a block, whose text holds no `}`.
const BROKEN_ACCESSIBILITY: readonly BrokenCase[] = [
  ...[
    ["accessibility title", "TimelineAccTitleStatement", "Aa", "accTitle"],
    [
      "accessibility description",
      "TimelineAccDescrStatement",
      "Dd",
      "accDescr",
    ],
  ].flatMap(([name, type, text, keyword]): BrokenCase[] => [
    {
      name: `an empty ${name}`,
      built: everyKindOfStatement,
      mutate: literalBecomes(text ?? "", ""),
      expected: at(type ?? "", "the value is empty"),
    },
    {
      name: `an ${name} that holds a line feed`,
      built: everyKindOfStatement,
      mutate: literalBecomes(text ?? "", "a\nb"),
      expected: at(
        type ?? "",
        'the value "a\\nb" holds a line terminator, which ends it',
      ),
    },
    {
      name: `an ${name} that starts with whitespace`,
      built: everyKindOfStatement,
      mutate: literalBecomes(text ?? "", ` ${text}`),
      expected: at(
        type ?? "",
        `the value ${JSON.stringify(` ${text}`)} starts or ends with whitespace, which is not part of it`,
      ),
    },
    {
      name: `an ${name} that ends with whitespace`,
      built: everyKindOfStatement,
      mutate: literalBecomes(text ?? "", `${text} `),
      expected: at(
        type ?? "",
        `the value ${JSON.stringify(`${text} `)} starts or ends with whitespace, which is not part of it`,
      ),
    },
    {
      name: `an ${name} that starts before the colon`,
      built: everyKindOfStatement,
      mutate: literalStartsMoved(text ?? "", -3),
      expected: at(
        type ?? "",
        `the value does not follow the keyword ${(keyword ?? "").toLowerCase()}, a \`:\`, and whitespace`,
      ),
    },
    {
      name: `an ${name} that ends before its last character`,
      built: everyKindOfStatement,
      mutate: literalEndsMoved(text ?? "", -1),
      expected: at(type ?? "", "the value does not run to the end of its line"),
    },
  ]),
  {
    name: "a description block whose text holds a closing brace",
    built: everyKindOfStatement,
    mutate: literalBecomes("B", "B}"),
    expected: at(
      "TimelineAccDescrBlockStatement",
      'the value "B}" holds a `}`, which closes the block',
    ),
  },
  {
    name: "a description block whose text is empty",
    built: everyKindOfStatement,
    mutate: literalBecomes("B", ""),
    expected: at("TimelineAccDescrBlockStatement", "the value is empty"),
  },
  {
    name: "a description block whose text starts with whitespace",
    built: everyKindOfStatement,
    mutate: literalBecomes("B", " B"),
    expected: at(
      "TimelineAccDescrBlockStatement",
      'the value " B" starts or ends with whitespace, which is not part of it',
    ),
  },
  {
    name: "a description block whose text starts before the brace",
    built: everyKindOfStatement,
    mutate: literalStartsMoved("B", -5),
    expected: at(
      "TimelineAccDescrBlockStatement",
      "the value does not follow the keyword accDescr, a `{`, and whitespace",
    ),
  },
  {
    name: "a description block whose text ends before its last character",
    built: whitespaceOfTexts,
    mutate: literalEndsMoved("J\n  K", -1),
    expected: at(
      "TimelineAccDescrBlockStatement",
      'the written text after the value is "K  }", not whitespace and the closing `}`',
    ),
  },
  {
    name: "a description block without text that has text between its braces",
    built: () =>
      build("timeline\n  accDescr { x }\n", null, (kit) => [
        block(kit, "accDescr", "x"),
      ]),
    mutate: (tree) => {
      setField(nodeWith(tree, "TimelineAccDescrBlockStatement"), "value", null)
    },
    expected: at(
      "TimelineAccDescrBlockStatement",
      'the written text "accDescr { x }" of a block without text is not the keyword accDescr, `{`, whitespace, and `}`',
    ),
  },
]

/** A tree that holds a period where the lexer reads a unit of a rule before the rule of a period: it starts the unit in the text, also on the lines after the period. */
interface WrongReading {
  readonly name: string
  readonly built: () => Built
  readonly expected: string
}

const STARTS_WITH = ", which a rule before the rule of a period reads"

// diagrams/timeline.md, The statement context: the lexer reads a unit of a
// rule before the rule of a period at the start of a period, and the
// whitespace after `title`, `section`, `accTitle`, and `accDescr` can be a line
// feed, so the unit can run over the lines after the period; a comment line in
// between is removed first.
const WRONG_READINGS: readonly WrongReading[] = [
  {
    name: "a period that starts with a comment",
    built: () =>
      build("timeline\n  % x\n", null, (kit) => [period(kit, "% x", [])]),
    expected: `the period "% x" starts with a comment${STARTS_WITH}`,
  },
  {
    name: "a period that starts with the header keyword in upper case",
    built: () =>
      build("timeline\n  TIMELINE y\n", null, (kit) => [
        period(kit, "TIMELINE y", []),
      ]),
    expected: `the period "TIMELINE y" starts with the keyword timeline${STARTS_WITH}`,
  },
  {
    name: "a period that starts with a title statement on its line",
    built: () =>
      build("timeline\n  Title\ty\n", null, (kit) => [
        period(kit, "Title\ty", []),
      ]),
    expected: `the period "Title\\ty" starts with a title statement${STARTS_WITH}`,
  },
  {
    name: "a period that starts with a section statement on its line",
    built: () =>
      build("timeline\n  section y\n", null, (kit) => [
        period(kit, "section y", []),
      ]),
    expected: `the period "section y" starts with a section statement${STARTS_WITH}`,
  },
  {
    name: "a period `title` whose text is on the next line",
    built: () =>
      build("timeline\n  title\n    T\n", null, (kit) => [
        period(kit, "title", []),
        period(kit, "T", []),
      ]),
    expected: `the period "title" starts with a title statement${STARTS_WITH}`,
  },
  {
    name: "a period `title` whose text is on the line after a comment line",
    built: () =>
      build("timeline\n  title\n  %% c\n    T\n", null, (kit) => {
        const title = period(kit, "title", [])
        kit.comment("%%", "%% c")
        return [title, period(kit, "T", [])]
      }),
    expected: `the period "title" starts with a title statement${STARTS_WITH}`,
  },
  {
    name: "a period `section` whose text is on the next line",
    built: () =>
      build("timeline\n  section\n    S\n", null, (kit) => [
        period(kit, "section", []),
        period(kit, "S", []),
      ]),
    expected: `the period "section" starts with a section statement${STARTS_WITH}`,
  },
  {
    name: "a period `accTitle` whose colon is on the next line",
    built: () =>
      build("timeline\n  accTitle\n  : x\n", null, (kit) => [
        period(kit, "accTitle", ["x"]),
      ]),
    expected: `the period "accTitle" starts with an accTitle statement${STARTS_WITH}`,
  },
  {
    name: "a period `accTitle` whose colon is on the line after a comment line",
    built: () =>
      build("timeline\n  accTitle\n  %% c\n  : x\n", null, (kit) => {
        const accTitle = literal(kit, "accTitle")
        kit.comment("%%", "%% c")
        kit.token(PUNCTUATOR, ":")
        const event = literal(kit, "x")
        return [
          kit.node(
            "TimelinePeriodStatement",
            [accTitle.range[0], event.range[1]],
            { period: accTitle, events: [event] },
          ),
        ]
      }),
    expected: `the period "accTitle" starts with an accTitle statement${STARTS_WITH}`,
  },
  {
    name: "a period `accDescr` whose colon is on the next line",
    built: () =>
      build("timeline\n  accDescr\n  : x\n", null, (kit) => [
        period(kit, "accDescr", ["x"]),
      ]),
    expected: `the period "accDescr" starts with an accDescr statement${STARTS_WITH}`,
  },
  {
    name: "a period `accDescr` whose brace is on the next line",
    built: () =>
      build("timeline\n  accDescr\n  {\n  x\n  }\n", null, (kit) => [
        period(kit, "accDescr", []),
      ]),
    expected: `the period "accDescr" starts with an accDescr statement${STARTS_WITH}`,
  },
  {
    name: "a period that starts with an accessibility description block on its line",
    built: () =>
      build("timeline\n  accDescr {y\n", null, (kit) => [
        period(kit, "accDescr {y", []),
      ]),
    expected: `the period "accDescr {y" starts with an accDescr statement${STARTS_WITH}`,
  },
]

describe("the check of a timeline tree: the reading of a period", () => {
  for (const reading of WRONG_READINGS) {
    it(`fails ${reading.name}`, () => {
      const { source, tree } = reading.built()
      const messages = checkTree(source, tree).map((problem) => problem.message)
      expect(messages).toContain(reading.expected)
    })
  }
})

describe("the check of a timeline tree: the statements", () => {
  itFailsEach(WRONG_CHILD_TYPES)
  itFailsEach(WRONG_DIRECTION)
  itFailsEach(BROKEN_STATEMENT_ORDER)
  itFailsEach(BROKEN_PERIODS)
  itFailsEach(BROKEN_EVENTS)
  itFailsEach(BROKEN_TITLES_AND_SECTIONS)
  itFailsEach(BROKEN_ACCESSIBILITY)
})

/** The words of `text` that are timeline type names. */
function typeNamesIn(text: string): string[] {
  return [...text.matchAll(/[A-Z][A-Za-z]*[a-z][A-Za-z]*/gu)]
    .map((match) => match[0])
    .filter((name) => name.startsWith("Timeline"))
}

/** The words between backquotes in `meaning`. */
function wordsOfMeaning(meaning: string): string[] {
  return [...meaning.matchAll(/`([^`]+)`/gu)].map((match) => match[1] ?? "")
}

/** The type names that the sentence `**TimelineStatement** is a …` of ast/timeline.md lists. */
function statementTypesOfDocument(): string[] {
  const document = readTreeDocuments().find((text) =>
    text.includes("**TimelineStatement** is a "),
  )
  if (document === undefined) throw new Error("no TimelineStatement")
  const start = document.indexOf("**TimelineStatement** is a ")
  const sentence = document.slice(start, document.indexOf(".\n", start))
  return typeNamesIn(sentence.slice("**TimelineStatement**".length))
}

/** The node types that the Type column cell `cell` names, with `TimelineStatement` as the statements it stands for. */
function typesOfCell(cell: string, statements: readonly string[]): string[] {
  return typeNamesIn(cell).flatMap((type) =>
    type === "TimelineStatement" ? statements : [type],
  )
}

describe("the tables of the check of a timeline tree", () => {
  const statements = statementTypesOfDocument()
  it("give the child types that the Type column of ast/timeline.md gives", () => {
    const documented = readFieldTables()
    const differing: string[] = []
    for (const [type, fields] of Object.entries(TIMELINE_CHILD_TYPES)) {
      for (const [field, allowed] of Object.entries(fields)) {
        const cell = documented.get(type)?.get(field) ?? ""
        if (
          JSON.stringify(typesOfCell(cell, statements).sort()) !==
          JSON.stringify([...allowed].sort())
        ) {
          differing.push(`${type}.${field}: ${cell}`)
        }
      }
    }
    expect(differing).toEqual([])
  })

  it("give a child type for every field of the timeline types that holds a node", () => {
    const missing: string[] = []
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Timeline")) continue
      for (const [field, cell] of fields) {
        if (
          typesOfCell(cell, statements).length > 0 &&
          TIMELINE_CHILD_TYPES[type]?.[field] === undefined
        ) {
          missing.push(`${type}.${field}: ${cell}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it("give the directions that the Meaning column of ast/timeline.md lists", () => {
    const meaning = readFieldMeanings().get("TimelineDiagram")?.get("direction")
    expect(wordsOfMeaning(meaning ?? "")).toEqual([...TIMELINE_DIRECTIONS])
  })
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture.

const OWN_KIND = "the kind of a token that the node writes itself"
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"
const NOT_RAW_TEXT = "the tokens of a TimelineLiteral are not all of the kind"

/** Sets the value of the first literal whose value is `from` to `to`. */
function literalIn(from: string, to: string): MutationCase["mutate"] {
  return (root) => {
    setField(
      nodesOfType(root, "TimelineLiteral").find(
        (node) => node.value === from,
      ) ?? firstNode(root, "TimelineLiteral"),
      "value",
      to,
    )
  }
}

/** The nodes of `root` of the type `type`. */
function nodesOfType(root: CheckedRoot, type: string): CheckedNode[] {
  return nodesOf(root).filter((node) => node.type === type)
}

/** Moves the start of the range of the first node of the type `type` by `by`. */
function startMoved(type: string, by: number): MutationCase["mutate"] {
  return (root) => {
    const node = firstNode(root, type)
    setField(node, "range", [node.range[0] + by, node.range[1]])
  }
}

/** Moves the end of the range of the first node of the type `type` by `by`. */
function endMoved(type: string, by: number): MutationCase["mutate"] {
  return (root) => {
    const node = firstNode(root, type)
    setField(node, "range", [node.range[0], node.range[1] + by])
  }
}

const RECORDED_CASES: readonly MutationCase[] = [
  // parser/docs/tokens/timeline.md, Tokens: the kinds of the tokens that a
  // node writes itself.
  {
    name: "the header as a RawText token",
    fixture: "db-header-only",
    mutate: retypeIn("TimelineDiagram", "Keyword", "timeline", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "the direction as a Punctuator token",
    fixture: "db-direction-td",
    mutate: retypeIn("TimelineDiagram", "Keyword", "TD", "Punctuator"),
    expected: `${OWN_KIND}: "Punctuator", not "Keyword"`,
  },
  {
    name: "the keyword of a title statement as a RawText token",
    fixture: "db-title-statement",
    mutate: retypeIn("TimelineTitleStatement", "Keyword", "title", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "the keyword of a section statement as a Punctuator token",
    fixture: "db-section-statement",
    mutate: retypeIn(
      "TimelineSectionStatement",
      "Keyword",
      "section",
      "Punctuator",
    ),
    expected: `${OWN_KIND}: "Punctuator", not "Keyword"`,
  },
  {
    name: "the keyword of an accessibility title as a RawText token",
    fixture: "db-acc-title-statement",
    mutate: retypeIn(
      "TimelineAccTitleStatement",
      "Keyword",
      "accTitle",
      "RawText",
    ),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "the colon of an accessibility title as a Keyword token",
    fixture: "db-acc-title-statement",
    mutate: retypeIn("TimelineAccTitleStatement", "Punctuator", ":", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the keyword of an accessibility description as a RawText token",
    fixture: "db-acc-descr-statement",
    mutate: retypeIn(
      "TimelineAccDescrStatement",
      "Keyword",
      "accDescr",
      "RawText",
    ),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "the opening brace of a description block as a Keyword token",
    fixture: "db-acc-descr-block",
    mutate: retypeIn(
      "TimelineAccDescrBlockStatement",
      "Punctuator",
      "{",
      "Keyword",
    ),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the closing brace of a description block as a Keyword token",
    fixture: "db-acc-descr-block",
    mutate: retypeIn(
      "TimelineAccDescrBlockStatement",
      "Punctuator",
      "}",
      "Keyword",
    ),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the colon of an event as a Keyword token",
    fixture: "db-period-and-event",
    mutate: retypeIn("TimelinePeriodStatement", "Punctuator", ":", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the colon of an event statement as a Keyword token",
    fixture: "db-event-after-section-joins-earlier-task",
    mutate: retypeIn("TimelineEventStatement", "Punctuator", ":", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  // parser/docs/tokens/timeline.md, Tokens: the tokens of a text are RawText.
  {
    name: "the period as a Keyword token",
    fixture: "db-period-and-event",
    mutate: retypeIn("TimelineLiteral", "RawText", "a ", "Keyword"),
    expected: NOT_RAW_TEXT,
  },
  {
    name: "an event as a Punctuator token",
    fixture: "db-period-and-event",
    mutate: (root) => {
      const token = root.tokens.find((candidate) => candidate.value === "e")
      if (token === undefined) throw new Error("no token e")
      setField(token, "type", "Punctuator")
    },
    expected: NOT_RAW_TEXT,
  },
  {
    name: "the title as a Keyword token",
    fixture: "db-title-statement",
    mutate: retypeIn("TimelineLiteral", "RawText", "T", "Keyword"),
    expected: NOT_RAW_TEXT,
  },
  // The direction is the token after the header, or null.
  {
    name: "a direction where the header has none",
    fixture: "db-header-only",
    mutate: (root) => {
      setField(firstNode(root, "TimelineDiagram"), "direction", "TD")
    },
    expected: "the direction of the header is not the token after the header",
  },
  {
    name: "a direction that is none of the directions",
    fixture: "db-direction-td",
    mutate: (root) => {
      setField(firstNode(root, "TimelineDiagram"), "direction", "BT")
    },
    expected: 'the direction is "BT", none of LR, TD in any case',
  },
  // parser/docs/positions/timeline.md, Ranges.
  {
    name: "a period statement that ends before its last event",
    fixture: "db-period-and-event",
    mutate: endMoved("TimelinePeriodStatement", -1),
    expected: "does not run from the start of a token to the end of a token",
  },
  {
    name: "a period statement that starts one character early",
    fixture: "db-period-and-event",
    mutate: startMoved("TimelinePeriodStatement", -1),
    expected: HULL,
  },
  {
    name: "a title statement whose range covers the line feed after its text",
    fixture: "db-title-trailing-spaces",
    mutate: endMoved("TimelineTitleStatement", 1),
    expected: HULL,
  },
  {
    name: "a section statement whose range covers the line feed after its text",
    fixture: "db-section-trailing-spaces",
    mutate: endMoved("TimelineSectionStatement", 1),
    expected: HULL,
  },
  {
    name: "an accessibility title whose range covers the whitespace at the end of its line",
    fixture: "db-acc-title-trailing-spaces",
    mutate: endMoved("TimelineAccTitleStatement", 3),
    expected: HULL,
  },
  {
    name: "an event statement that starts one character early",
    fixture: "db-event-after-section-joins-earlier-task",
    mutate: startMoved("TimelineEventStatement", -1),
    expected: HULL,
  },
  {
    name: "a diagram whose range ends before the last token",
    fixture: "db-period-and-event",
    mutate: setEnd("TimelineDiagram", () => 15),
    expected: "does not run from the start of a token to the end of a token",
  },
  {
    name: "a diagram whose range starts after its header",
    fixture: "db-period-and-event",
    mutate: startMoved("TimelineDiagram", 1),
    expected: HULL,
  },
  {
    name: "a period whose range leaves out the whitespace at its end",
    fixture: "db-period-trailing-spaces",
    mutate: (root) => {
      const first = firstNode(root, "TimelineLiteral")
      setField(first, "range", [first.range[0], first.range[1] - 1])
    },
    expected: "does not run from the start of a token to the end of a token",
  },
  // The rules that do not read the kinds and the ranges.
  {
    name: "a period that holds a `#` that starts no entity",
    fixture: "db-period-only",
    mutate: literalIn("a", "a#b"),
    expected: 'holds "#", which ends a period',
  },
  {
    name: "an event statement that comes first in the body",
    fixture: "db-event-after-section-joins-earlier-task",
    mutate: (root) => {
      const body = firstNode(root, "TimelineDiagram").body as CheckedNode[]
      const last = body.pop()
      if (last !== undefined) body.unshift(last)
    },
    expected: "comes before every period statement",
  },
  {
    name: "a title text that holds a line feed",
    fixture: "db-title-statement",
    mutate: literalIn("T", "T\nU"),
    expected: "holds a line terminator, which ends it",
  },
  {
    name: "a description block text that holds a closing brace",
    fixture: "db-acc-descr-block",
    mutate: literalIn("line1\n  line2", "line1}"),
    expected: "holds a `}`, which closes the block",
  },
]

describe("the check of a timeline tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("timeline", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})
