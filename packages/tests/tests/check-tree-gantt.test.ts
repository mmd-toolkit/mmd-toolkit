import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  copyOf,
  firstNode,
  problemsOf,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import {
  buildTree,
  endAt,
  endOfSource,
  itFailsEach,
  nodeWith,
  ownKind,
  retype,
} from "./check-tree-built.ts"
import type { BrokenCase } from "./check-tree-built.ts"

// The trees of a gantt diagram made by hand: they are the smallest trees that
// hold the case they are about (see `check-tree-built.ts`), with the tokens
// that the table of Tokens of parser/docs/tokens/gantt.md and the ranges of
// parser/docs/positions/gantt.md give them. The recorded trees of the corpus
// are the other half of the tests below.

/** A gantt tree: the header `gantt`, a line feed, and the statements. */
function build(
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    { header: "gantt", diagramType: "gantt", bodyType: "GanttDiagram" },
    source,
    makeStatements,
  )
}

/** `a : done, 1d,` with the tag `done` and the items `1d` and null. */
function taskWithTag(): Built {
  return build("gantt\na : done, 1d,", (kit) => {
    const description = kit.token("RawText", "a ")
    kit.token("Punctuator", ":")
    const tag = kit.token("RawText", "done")
    kit.token("Punctuator", ",")
    const item = kit.token("RawText", "1d")
    const comma = kit.token("Punctuator", ",")
    return [
      kit.node("GanttTaskStatement", [description.range[0], comma.range[1]], {
        description: kit.node("GanttLiteral", description.range, {
          value: "a ",
        }),
        tags: [kit.node("Identifier", tag.range, { name: "done" })],
        items: [kit.node("GanttLiteral", item.range, { value: "1d" }), null],
      }),
    ]
  })
}

/** `a : do%%{x}%%ne, 1d`: the tag `done` that a directive cuts into two `RawText` tokens. */
function taskWithCutTag(): Built {
  return build("gantt\na : do%%{x}%%ne, 1d", (kit) => {
    const description = kit.token("RawText", "a ")
    kit.token("Punctuator", ":")
    const tagStart = kit.token("RawText", "do")
    kit.directive("%%{x}%%")
    const tagEnd = kit.token("RawText", "ne")
    kit.token("Punctuator", ",")
    const item = kit.token("RawText", "1d")
    return [
      kit.node("GanttTaskStatement", [description.range[0], item.range[1]], {
        description: kit.node("GanttLiteral", description.range, {
          value: "a ",
        }),
        tags: [
          kit.node("Identifier", [tagStart.range[0], tagEnd.range[1]], {
            name: "done",
          }),
        ],
        items: [kit.node("GanttLiteral", item.range, { value: "1d" })],
      }),
    ]
  })
}

/** `a : 1d` and three spaces: the range of the task ends at the item. */
function taskWithTrailingSpaces(): Built {
  return build("gantt\na : 1d   ", (kit) => {
    const description = kit.token("RawText", "a ")
    kit.token("Punctuator", ":")
    const item = kit.token("RawText", "1d")
    return [
      kit.node("GanttTaskStatement", [description.range[0], item.range[1]], {
        description: kit.node("GanttLiteral", description.range, {
          value: "a ",
        }),
        tags: [],
        items: [kit.node("GanttLiteral", item.range, { value: "1d" })],
      }),
    ]
  })
}

/** `a :` and three spaces: the one null item, and the range that ends at the colon. */
function taskWithBlankData(): Built {
  return build("gantt\na :   ", (kit) => {
    const description = kit.token("RawText", "a ")
    const colon = kit.token("Punctuator", ":")
    return [
      kit.node("GanttTaskStatement", [description.range[0], colon.range[1]], {
        description: kit.node("GanttLiteral", description.range, {
          value: "a ",
        }),
        tags: [],
        items: [null],
      }),
    ]
  })
}

/** The order of the parts of a click statement: `call f(1)` and `href "u"`. */
type ClickParts = "call-then-href" | "href-then-call"

/** `click a, b`, a call and a link in the order `order`, and two spaces. */
function click(order: ClickParts): Built {
  const call = "call f(1)"
  const href = 'href "u"'
  const parts = order === "call-then-href" ? [call, href] : [href, call]
  return build(`gantt\nclick a, b ${parts.join(" ")}  `, (kit) => {
    const keyword = kit.token("Keyword", "click")
    const a = kit.token("Identifier", "a")
    kit.token("Punctuator", ",")
    const b = kit.token("Identifier", "b")
    let callNode: CheckedNode | null = null
    let hrefNode: CheckedNode | null = null
    let last = b
    for (const part of parts) {
      if (part === call) {
        const callKeyword = kit.token("Keyword", "call")
        const name = kit.token("RawText", "f")
        kit.token("Punctuator", "(")
        const args = kit.token("RawText", "1")
        last = kit.token("Punctuator", ")")
        callNode = kit.node(
          "GanttCallback",
          [callKeyword.range[0], last.range[1]],
          {
            name: kit.node("GanttLiteral", name.range, { value: "f" }),
            args: kit.node("GanttLiteral", args.range, { value: "1" }),
          },
        )
      } else {
        kit.token("Keyword", "href")
        last = kit.token("String", '"u"')
        hrefNode = kit.node("StringLiteral", last.range, {
          value: "u",
          raw: '"u"',
          closed: true,
        })
      }
    }
    return [
      kit.node("GanttClickStatement", [keyword.range[0], last.range[1]], {
        ids: [
          kit.node("Identifier", a.range, { name: "a" }),
          kit.node("Identifier", b.range, { name: "b" }),
        ],
        call: callNode,
        href: hrefNode,
      }),
    ]
  })
}

/** `click a href "u%%{x}%%v"`: the link that a directive cuts into two `StringFragment` tokens. */
function clickWithCutLink(): Built {
  return build('gantt\nclick a href "u%%{x}%%v"', (kit) => {
    const keyword = kit.token("Keyword", "click")
    const a = kit.token("Identifier", "a")
    kit.token("Keyword", "href")
    const start = kit.token("StringFragment", '"u')
    kit.directive("%%{x}%%")
    const end = kit.token("StringFragment", 'v"')
    return [
      kit.node("GanttClickStatement", [keyword.range[0], end.range[1]], {
        ids: [kit.node("Identifier", a.range, { name: "a" })],
        call: null,
        href: kit.node("StringLiteral", [start.range[0], end.range[1]], {
          value: "uv",
          raw: '"u%%{x}%%v"',
          closed: true,
        }),
      }),
    ]
  })
}

/** `includes a, b` followed by three spaces: a list of two items. */
function includes(): Built {
  return build("gantt\nincludes a, b   ", (kit) => {
    const keyword = kit.token("Keyword", "includes")
    const a = kit.token("Identifier", "a")
    kit.token("Punctuator", ",")
    const b = kit.token("Identifier", "b")
    return [
      kit.node("GanttIncludesStatement", [keyword.range[0], b.range[1]], {
        items: [
          kit.node("Identifier", a.range, { name: "a" }),
          kit.node("Identifier", b.range, { name: "b" }),
        ],
      }),
    ]
  })
}

/** `excludes` and three spaces: the list text is whitespace only, and the range covers the keyword alone. */
function excludesWithBlankList(): Built {
  return build("gantt\nexcludes   ", (kit) => {
    const keyword = kit.token("Keyword", "excludes")
    return [kit.node("GanttExcludesStatement", keyword.range, { items: [] })]
  })
}

/** `weekday Monday`: the day in lower case, the token as written. */
function weekday(): Built {
  return build("gantt\nweekday Monday", (kit) => {
    const keyword = kit.token("Keyword", "weekday")
    const day = kit.token("Keyword", "Monday")
    return [
      kit.node("GanttWeekdayStatement", [keyword.range[0], day.range[1]], {
        day: "monday",
      }),
    ]
  })
}

/** `accTitle: T` and two spaces: the range ends at the `T`. */
function accTitle(): Built {
  return build("gantt\naccTitle: T  ", (kit) => {
    const keyword = kit.token("Keyword", "accTitle")
    kit.token("Punctuator", ":")
    const text = kit.token("RawText", "T")
    return [
      kit.node("GanttAccTitleStatement", [keyword.range[0], text.range[1]], {
        value: kit.node("GanttLiteral", text.range, { value: "T" }),
      }),
    ]
  })
}

/** `dateFormat` and two spaces before `X` and two after: the text keeps its whitespace in its token. */
function dateFormat(): Built {
  return build("gantt\ndateFormat  X  ", (kit) => {
    const keyword = kit.token("Keyword", "dateFormat")
    const text = kit.token("RawText", " X  ")
    return [
      kit.node("GanttDateFormatStatement", [keyword.range[0], text.range[1]], {
        value: kit.node("GanttLiteral", text.range, { value: " X  " }),
      }),
    ]
  })
}

/** The trees that satisfy every sentence, by name. */
const VALID: Readonly<Record<string, () => Built>> = {
  "a task with a tag and a null last item": taskWithTag,
  "a task with a tag that a directive cuts": taskWithCutTag,
  "a task whose data is whitespace only": taskWithBlankData,
  "a click statement with a call before its link": () =>
    click("call-then-href"),
  "a click statement with a link before its call": () =>
    click("href-then-call"),
  "a click statement with a link that a directive cuts": clickWithCutLink,
  "an includes statement": includes,
  "an excludes statement with whitespace only": excludesWithBlankList,
  "a weekday statement": weekday,
  "an accessibility title": accTitle,
  "a setting whose text keeps its whitespace": dateFormat,
}

describe("checkTree: a gantt tree made by hand", () => {
  for (const [name, make] of Object.entries(VALID)) {
    it(`accepts ${name}`, () => {
      const { source, tree } = make()
      expect(checkTree(source, tree)).toEqual([])
    })
  }
})

const BROKEN: readonly BrokenCase[] = [
  // Tokens: a keyword is a `Keyword` token, and `:`, `,`, `{`, `}`, `(`, `)`
  // are `Punctuator` tokens, in the node that writes them.
  {
    name: "the keyword of a click statement as a RawText token",
    built: () => click("call-then-href"),
    mutate: retype("click", "RawText"),
    expected: ownKind("click", "GanttClickStatement", "RawText", "Keyword"),
  },
  {
    name: "the colon of a task as a Keyword token",
    built: taskWithTag,
    mutate: retype(":", "Keyword"),
    expected: ownKind(":", "GanttTaskStatement", "Keyword", "Punctuator"),
  },
  {
    name: "the parenthesis of a call as a Keyword token",
    built: () => click("call-then-href"),
    mutate: retype("(", "Keyword"),
    expected: ownKind("(", "GanttCallback", "Keyword", "Punctuator"),
  },
  {
    name: "the day of a weekday statement as a RawText token",
    built: weekday,
    mutate: retype("Monday", "RawText"),
    expected: ownKind("Monday", "GanttWeekdayStatement", "RawText", "Keyword"),
  },
  {
    name: "the header as an Identifier token",
    built: weekday,
    mutate: retype("gantt", "Identifier"),
    expected: ownKind("gantt", "GanttDiagram", "Identifier", "Keyword"),
  },
  // Tokens: a text unit is a `RawText` token, a name unit an `Identifier`
  // token, and a tag, a `data-item` unit, is `RawText` tokens too.
  {
    name: "the description of a task as a Keyword token",
    built: taskWithTag,
    mutate: retype("a ", "Keyword"),
    expected:
      "GanttLiteral at #: the tokens of a GanttLiteral are not all of the kind RawText: Keyword",
  },
  {
    name: "an item of task data as an Identifier token",
    built: taskWithTag,
    mutate: retype("1d", "Identifier"),
    expected:
      "GanttLiteral at #: the tokens of a GanttLiteral are not all of the kind RawText: Identifier",
  },
  {
    name: "the text of a setting as a String token",
    built: dateFormat,
    mutate: retype(" X  ", "String"),
    expected:
      "GanttLiteral at #: the tokens of a GanttLiteral are not all of the kind RawText: String",
  },
  {
    name: "a tag as an Identifier token",
    built: taskWithTag,
    mutate: retype("done", "Identifier"),
    expected:
      "Identifier at #: the tokens of a tag are not all of the kind RawText: Identifier",
  },
  {
    name: "a tag that a directive cuts, one fragment of which is an Identifier token",
    built: taskWithCutTag,
    mutate: retype("ne", "Identifier"),
    expected:
      "Identifier at #: the tokens of a tag are not all of the kind RawText: RawText, Identifier",
  },
  {
    name: "an id of a click statement as a RawText token",
    built: () => click("call-then-href"),
    mutate: retype("a", "RawText"),
    expected:
      "Identifier at #: the tokens of an id are not all of the kind Identifier: RawText",
  },
  {
    name: "an item of a list as a RawText token",
    built: includes,
    mutate: retype("b", "RawText"),
    expected:
      "Identifier at #: the tokens of an item of a list are not all of the kind Identifier: RawText",
  },
  {
    name: "the string of a link as a RawText token",
    built: () => click("call-then-href"),
    mutate: retype('"u"', "RawText"),
    expected:
      "StringLiteral at #: the tokens of the string are not one String token or StringFragment tokens: RawText",
  },
  {
    name: "the string of a link that a directive cuts, as String tokens",
    built: clickWithCutLink,
    mutate: retype('"u', "String"),
    expected:
      "StringLiteral at #: the tokens of the string are not one String token or StringFragment tokens: String, StringFragment",
  },
  // Positions: the range runs from the first of the tokens and child nodes of
  // a node to the last, so it does not cover the whitespace after them.
  {
    name: "a task whose range covers the whitespace after its last token",
    built: taskWithTrailingSpaces,
    mutate: endAt("GanttTaskStatement", endOfSource),
    expected:
      "GanttTaskStatement at #: the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a task whose range ends before the last comma, which its data holds",
    built: taskWithTag,
    mutate: endAt("GanttTaskStatement", (_tree, source) => source.length - 1),
    expected:
      "GanttTaskStatement at #: the number of the item, which is one more than the separators: 3, not 2",
  },
  {
    name: "a click statement that ends at its link when its call is written after it",
    built: () => click("href-then-call"),
    mutate: endAt(
      "GanttClickStatement",
      (tree) => nodeWith(tree, "StringLiteral").range[1],
    ),
    expected:
      "GanttClickStatement at #: the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a click statement whose range covers the whitespace after its last part",
    built: () => click("call-then-href"),
    mutate: endAt("GanttClickStatement", endOfSource),
    expected:
      "GanttClickStatement at #: the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a call part that ends before its parenthesis",
    built: () => click("call-then-href"),
    mutate: endAt(
      "GanttCallback",
      (tree) => (nodeWith(tree, "GanttCallback").args as CheckedNode).range[1],
    ),
    expected:
      'GanttCallback at #: the tokens of the node outside its child nodes, joined: "call(", not "call()"',
  },
  {
    name: "a list whose range covers the whitespace after its last item",
    built: includes,
    mutate: endAt("GanttIncludesStatement", endOfSource),
    expected:
      "GanttIncludesStatement at #: the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a list of whitespace only whose range covers the whitespace after the keyword",
    built: excludesWithBlankList,
    mutate: endAt("GanttExcludesStatement", endOfSource),
    expected:
      "GanttExcludesStatement at #: the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "an accessibility title whose range covers the whitespace after its text",
    built: accTitle,
    mutate: endAt("GanttAccTitleStatement", endOfSource),
    expected:
      "GanttAccTitleStatement at #: the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a link that does not run from a quote to a quote",
    built: () => click("call-then-href"),
    mutate: (tree) => {
      setField(nodeWith(tree, "StringLiteral"), "raw", '"u')
    },
    expected:
      'StringLiteral at #: the link does not run from `"` to `"`: "\\"u"',
  },
]

describe("checkTree: the tokens and ranges of a gantt tree", () => {
  itFailsEach(BROKEN)
})

/** `tree` with the tag renamed to `name`. */
function withTagName(tree: CheckedRoot, name: string): CheckedRoot {
  const copy = copyOf(tree)
  setField(nodeWith(copy, "Identifier"), "name", name)
  return copy
}

describe("checkTree: a gantt tag", () => {
  it("accepts a tag that a directive cuts, whose name is its written text (ast/gantt.md, GanttTaskStatement)", () => {
    const { source, tree } = taskWithCutTag()
    expect(checkTree(source, tree)).toEqual([])
  })

  it("fails a tag whose name is not its written text, also when a directive cuts it", () => {
    const { source, tree } = taskWithCutTag()
    for (const name of ["do", "do%%{x}%%ne", "dane"]) {
      const messages = checkTree(source, withTagName(tree, name)).map(
        (problem) => problem.message,
      )
      expect(
        messages.some((message) =>
          message.startsWith("name is not its written text"),
        ),
        name,
      ).toBe(true)
    }
  })
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture, as in the check of an ER
// tree.

const RECORDED_CASES: readonly MutationCase[] = [
  // The kinds of the tokens that a node writes itself.
  {
    name: "the keyword of a click statement as a RawText token",
    fixture: "gram-click-call-then-href",
    mutate: retypeIn("GanttClickStatement", "Keyword", "click", "RawText"),
    expected:
      'the kind of a token that the node writes itself: "RawText", not "Keyword"',
  },
  {
    name: "the colon of a task as a Keyword token",
    fixture: "gram-task",
    mutate: retypeIn("GanttTaskStatement", "Punctuator", ":", "Keyword"),
    expected:
      'the kind of a token that the node writes itself: "Keyword", not "Punctuator"',
  },
  {
    name: "the day of a weekday statement as a RawText token",
    fixture: "db-weekday-last-wins",
    mutate: retypeIn("GanttWeekdayStatement", "Keyword", "monday", "RawText"),
    expected:
      'the kind of a token that the node writes itself: "RawText", not "Keyword"',
  },
  {
    name: "the braces of a description block as Keyword tokens",
    fixture: "gram-acc-descr-block",
    mutate: retypeIn(
      "GanttAccDescrBlockStatement",
      "Punctuator",
      "}",
      "Keyword",
    ),
    expected:
      'the kind of a token that the node writes itself: "Keyword", not "Punctuator"',
  },
  // The kinds of the tokens of the values.
  {
    name: "the description of a task as a Keyword token",
    fixture: "gram-task",
    mutate: retypeIn("GanttLiteral", "RawText", null, "Keyword"),
    expected: "the tokens of a GanttLiteral are not all of the kind RawText",
  },
  {
    name: "a tag that a directive cuts, one fragment of which is an Identifier token",
    fixture: "gram-task-tag-cut-by-directive",
    mutate: retypeIn("Identifier", "RawText", "ne", "Identifier"),
    expected: "the tokens of a tag are not all of the kind RawText",
  },
  {
    name: "an id of a click statement as a RawText token",
    fixture: "gram-click-ids-list",
    mutate: retypeIn("GanttClickStatement", "Identifier", null, "RawText"),
    expected: "the tokens of an id are not all of the kind Identifier",
  },
  {
    name: "an item of a list as a RawText token",
    fixture: "db-excludes-tokens",
    mutate: retypeIn("GanttExcludesStatement", "Identifier", null, "RawText"),
    expected:
      "the tokens of an item of a list are not all of the kind Identifier",
  },
  {
    name: "the string of a link as a RawText token",
    fixture: "gram-click-call-then-href",
    mutate: retypeIn("StringLiteral", "String", null, "RawText"),
    expected:
      "the tokens of the string are not one String token or StringFragment tokens",
  },
  // The ranges.
  {
    name: "a task whose range covers the whitespace after its colon",
    fixture: "lex-task-data-whitespace-only",
    mutate: setEnd("GanttTaskStatement", (root) => root.range[1]),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a task whose range ends before the last comma",
    fixture: "gram-task-trailing-comma",
    mutate: setEnd(
      "GanttTaskStatement",
      (root) => firstNode(root, "GanttLiteral").range[1] + 2,
    ),
    expected: "the number of the item, which is one more than the separators",
  },
  {
    name: "a click statement that ends at its link when its call is written after it",
    fixture: "gram-click-href-then-call",
    mutate: setEnd(
      "GanttClickStatement",
      (root) => firstNode(root, "StringLiteral").range[1],
    ),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a call part that ends before its parenthesis",
    fixture: "gram-click-call-then-href",
    mutate: setEnd(
      "GanttCallback",
      (root) =>
        (firstNode(root, "GanttCallback").name as CheckedNode).range[1] + 1,
    ),
    expected:
      'the tokens of the node outside its child nodes, joined: "call(", not "call()"',
  },
  {
    name: "an accessibility title whose range covers the whitespace after its text",
    fixture: "gram-acc-title-trailing-spaces",
    mutate: setEnd("GanttAccTitleStatement", (root) => root.range[1]),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a link that does not run from a quote to a quote",
    fixture: "gram-click-call-then-href",
    mutate: (root) => {
      setField(firstNode(root, "StringLiteral"), "raw", '"u')
    },
    expected: 'the link does not run from `"` to `"`',
  },
]

describe("the check of a gantt tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("gantt", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})
