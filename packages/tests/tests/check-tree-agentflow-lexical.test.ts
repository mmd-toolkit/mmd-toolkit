import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import type { Kit } from "./check-tree-built.ts"
import {
  afAccessibility,
  afCallback,
  afContainer,
  afGroup,
  afIgnored,
  afLabel,
  afLinkStyle,
  afName,
  afStatement,
  afStyling,
  afUrl,
  afVertex,
  agentflowTree,
} from "./agentflow-built.ts"
import { recordedTree, setField } from "./check-tree-recorded.ts"

const fixtures = loadFixtures("agentflow")

/** These trees deliberately give rejected spellings internally consistent values and tokens. */
const INVALID_LEAVES: readonly {
  readonly fixture: string
  readonly make: (kit: Kit) => CheckedNode[]
  readonly problem: string
}[] = [
  {
    fixture: "gram-click-url-merged-strings",
    make: (kit) => {
      const vertex = afStatement(kit, afGroup(kit, [() => afVertex(kit, "A")]))
      const click = afUrl(kit, ["A"], '"u""v"')
      // Keep the value consistent with the initial string delimiters: only the
      // lexical extent is false, rather than also breaking value agreement.
      setField(click.url as object, "value", 'u"v"')
      return [vertex, click]
    },
    problem: "one complete string unit",
  },
  {
    fixture: "gram-name-click-second-string",
    make: (kit) => [
      afContainer(kit, "flow", () => {
        const marker = afIgnored(kit, "click", "click")
        const first = kit.token("String", '"A"')
        const tail = kit.token("RawText", '"B"')
        const label = kit.node(
          "AgentflowLabel",
          [first.range[0], tail.range[1]],
          { kind: "string", value: 'A"B"' },
        )
        return afName(kit, [marker, label])
      }),
    ],
    problem: "not another string",
  },
  {
    fixture: "lex-class-suffix-equals",
    make: (kit) => [
      afStatement(kit, afGroup(kit, [() => afVertex(kit, "A", null, "=")])),
    ],
    problem: "id position",
  },
  {
    fixture: "gram-class-target-global",
    make: (kit) => [afStyling(kit, "class", ["A", "global"], ["hot"])],
    problem: "id-list position",
  },
  {
    fixture: "gram-props-number-unit",
    make: (kit) => [
      afStatement(
        kit,
        afGroup(kit, [
          () =>
            afVertex(kit, "A", {
              opening: "[|",
              closing: "]",
              name: "rectangle",
              raw: "Label",
              property: ["1", "value"],
            }),
        ]),
      ),
    ],
    problem: "property position",
  },
  {
    fixture: "gram-interpolate-default-name",
    make: (kit) => [afLinkStyle(kit, null, "default", [])],
    problem: "name position",
  },
  {
    fixture: "lex-vertex-equals-alone",
    make: (kit) => [afStatement(kit, afGroup(kit, [() => afVertex(kit, "=")]))],
    problem: "id position",
  },
  {
    fixture: "lex-vertex-supplementary-alone",
    make: (kit) => [
      afStatement(kit, afGroup(kit, [() => afVertex(kit, "\ud83d\ude00")])),
    ],
    problem: "id position",
  },
  {
    fixture: "gram-bare-label-open-bracket",
    make: (kit) => [
      afStatement(
        kit,
        afGroup(kit, [
          () =>
            afVertex(kit, "A", {
              opening: "[",
              closing: "]",
              name: "rectangle",
              raw: "[",
            }),
        ]),
      ),
    ],
    problem: "label context",
  },
  {
    fixture: "gram-bare-label-pipe",
    make: (kit) => [
      afStatement(
        kit,
        afGroup(kit, [
          () =>
            afVertex(kit, "A", {
              opening: "[",
              closing: "]",
              name: "rectangle",
              raw: "|",
            }),
        ]),
      ),
    ],
    problem: "label context",
  },
  {
    fixture: "gram-slanted-label-open-bracket",
    make: (kit) => [
      afStatement(
        kit,
        afGroup(kit, [
          () =>
            afVertex(kit, "A", {
              opening: "[/",
              closing: "/]",
              name: "lean-right",
              raw: "[",
            }),
        ]),
      ),
    ],
    problem: "slanted context",
  },
  {
    fixture: "gram-ellipse-label-open-paren",
    make: (kit) => [
      afStatement(
        kit,
        afGroup(kit, [
          () =>
            afVertex(kit, "A", {
              opening: "(-",
              closing: "-)",
              name: "ellipse",
              raw: "(",
            }),
        ]),
      ),
    ],
    problem: "ellipse context",
  },
  {
    fixture: "lex-style-equals-in-value",
    make: (kit) => [afStyling(kit, "style", ["A"], ["fill=red"])],
    problem: "style position",
  },
  {
    fixture: "gram-bare-callback-global",
    make: (kit) => [
      afStatement(kit, afGroup(kit, [() => afVertex(kit, "A")])),
      afCallback(kit, ["A"], "global", false, null),
    ],
    problem: "name position",
  },
  {
    fixture: "gram-connector-name-default",
    make: (kit) => [
      afContainer(kit, "connector", () =>
        afName(kit, [afLabel(kit, "default")]),
      ),
    ],
    problem: "container-name position",
  },
]

describe("Agentflow leaf vocabularies", () => {
  for (const testCase of INVALID_LEAVES)
    it(`rejects the false reading of ${testCase.fixture}`, async () => {
      const fixture = (await fixtures).find(
        (entry) => entry.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error(testCase.fixture)
      expect(fixture.expected.accepted).toBe(false)
      const { tree } = agentflowTree(fixture.input, testCase.make, null)
      const problems = checkTree(fixture.input, tree)
      expect(
        problems.some((problem) => problem.message.includes(testCase.problem)),
        JSON.stringify(problems),
      ).toBe(true)
    })
})

const CLICK_EMPTY_NAMES: readonly {
  readonly fixture: string
  readonly keyword: "flow" | "connector"
  readonly prefix?: string
  readonly empty: string
  readonly emptyKind: "empty-string" | "empty-markdown-string"
  readonly call?: boolean
  readonly tail?: string
  readonly kind?: string
  readonly value?: string
}[] = [
  {
    fixture: "lex-name-click-empty-string-before-text",
    keyword: "flow",
    empty: '""',
    emptyKind: "empty-string",
    tail: "A",
  },
  {
    fixture: "lex-name-click-empty-markdown-before-text",
    keyword: "flow",
    empty: '"``"',
    emptyKind: "empty-markdown-string",
    tail: "A",
  },
  {
    fixture: "lex-name-click-empty-string-before-string",
    keyword: "flow",
    empty: '""',
    emptyKind: "empty-string",
    tail: '"A"',
    kind: "string",
    value: "A",
  },
  {
    fixture: "lex-name-click-empty-string-then-call",
    keyword: "flow",
    empty: '""',
    emptyKind: "empty-string",
    call: true,
    tail: " A",
  },
  {
    fixture: "lex-connector-name-click-empty-string-tail",
    keyword: "connector",
    prefix: "F ",
    empty: '""',
    emptyKind: "empty-string",
  },
]

describe("Agentflow recognized empty names", () => {
  for (const testCase of CLICK_EMPTY_NAMES)
    it(testCase.fixture, async () => {
      const fixture = (await fixtures).find(
        (entry) => entry.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error(testCase.fixture)
      const { tree } = agentflowTree(
        fixture.input,
        (kit) => [
          afContainer(kit, testCase.keyword, () => {
            const parts: CheckedNode[] = []
            if (testCase.prefix !== undefined)
              parts.push(afLabel(kit, testCase.prefix))
            parts.push(
              afIgnored(kit, "click", "click"),
              afIgnored(kit, testCase.empty, testCase.emptyKind),
            )
            if (testCase.call)
              parts.push(afIgnored(kit, "call ()", "empty-call"))
            if (testCase.tail !== undefined)
              parts.push(
                afLabel(kit, testCase.tail, testCase.kind, testCase.value),
              )
            return afName(kit, parts)
          }),
        ],
        null,
      )
      expect(fixture.expected.accepted).toBe(true)
      expect(checkTree(fixture.input, tree)).toEqual([])
    })
})

describe("Agentflow connector-name adjacency", () => {
  for (const name of [
    "lex-connector-name-click-empty-string-adjacent-text",
    "lex-connector-name-click-empty-string-adjacent-semicolon",
    "lex-connector-name-click-empty-string-no-id-adjacent-semicolon",
    "lex-connector-name-click-empty-string-trailing-semicolon",
    "lex-connector-name-click-empty-markdown-adjacent-text",
    "lex-connector-name-click-empty-markdown-adjacent-semicolon",
    "lex-connector-name-click-empty-markdown-trailing-semicolon",
    "lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon",
    "lex-connector-name-click-empty-string-then-markdown",
  ])
    it(`checks the recorded tree and Db of ${name}`, async () => {
      const fixture = (await fixtures).find((entry) => entry.name === name)
      if (fixture === undefined) throw new Error(name)
      const embedded = embeddedValuesOf(fixture, fixture.expected)
      if (!fixture.expected.accepted || embedded === undefined)
        throw new Error("the connector needs a recorded Db")
      const { input, tree } = recordedTree("agentflow", name)
      expect(checkTree(input, tree)).toEqual([])
      expect(
        dbFromTree(
          input,
          tree as unknown as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
      ).toEqual(fixture.expected.db)
    })

  const rejectedFlows: readonly {
    readonly fixture: string
    readonly empty: string
    readonly kind: "empty-string" | "empty-markdown-string"
    readonly where: string
  }[] = [
    {
      fixture: "gram-name-click-empty-string-adjacent-text",
      empty: '""',
      kind: "empty-string",
      where: "AgentflowLabel at 28-29",
    },
    {
      fixture: "gram-flow-name-click-empty-markdown-adjacent-rejected",
      empty: '"``"',
      kind: "empty-markdown-string",
      where: "AgentflowLabel at 30-31",
    },
  ]
  for (const testCase of rejectedFlows)
    it(`rejects the adjacent ${testCase.kind} continuation in a flow name`, async () => {
      const fixture = (await fixtures).find(
        (entry) => entry.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error(testCase.fixture)
      expect(fixture.expected.accepted).toBe(false)
      const { tree } = agentflowTree(
        fixture.input,
        (kit) => [
          afContainer(kit, "flow", () =>
            afName(kit, [
              afIgnored(kit, "click", "click"),
              afIgnored(kit, testCase.empty, testCase.kind),
              afLabel(kit, "A"),
            ]),
          ),
        ],
        null,
      )
      expect(checkTree(fixture.input, tree)).toContainEqual({
        where: testCase.where,
        message:
          "bare name text after an empty string requires the click-context exit",
      })
    })
})

// These fixed size cases are recorded by the parser session; no parser runs here.
for (const name of [
  "frontmatter-extra-trivia-below",
  "frontmatter-extra-trivia-boundary",
  "frontmatter-extra-whitespace-line-boundary",
  "frontmatter-extra-trivia-above",
  "frontmatter-extra-trivia-indent-above",
])
  it(`checks the default-size branch of ${name}`, () => {
    const { input, tree } = recordedTree("agentflow", name)
    expect(checkTree(input, tree)).toEqual([])
  })

it("rejects an accessibility value that swallows its closing brace and the next vertex", async () => {
  const fixture = (await fixtures).find(
    (entry) => entry.name === "db-accessibility-block",
  )
  if (fixture === undefined) throw new Error("db-accessibility-block")
  expect(fixture.expected.accepted).toBe(true)
  const { tree } = agentflowTree(fixture.input, (kit) => [
    afAccessibility(kit, "accDescr", "first\n  second\n}\nA\n", true, false),
  ])
  expect(
    checkTree(fixture.input, tree).some(
      (problem) =>
        problem.message ===
        "an accessibility block value stops at its first closing brace",
    ),
  ).toBe(true)
})
