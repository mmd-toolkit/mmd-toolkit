import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import {
  afContainer,
  afGroup,
  afIgnored,
  afLabel,
  afName,
  afStatement,
  afVertex,
  agentflowTree,
} from "./agentflow-built.ts"
import type { Kit } from "./check-tree-built.ts"

/** The click unit ends before its exit character, which belongs to no Name part. */
function clickName(kit: Kit): CheckedNode {
  return afName(kit, [afIgnored(kit, "click", "click"), afLabel(kit, "A")])
}

/** One explicit body member, without reading syntax from the input. */
function member(kit: Kit, id = "B"): CheckedNode[] {
  return [afStatement(kit, afGroup(kit, [() => afVertex(kit, id)]))]
}

const HEADINGS: readonly {
  readonly fixture: string
  readonly make: (kit: Kit) => CheckedNode[]
}[] = [
  {
    fixture: "name-click-exit-before-title-tab",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => clickName(kit),
        () => member(kit),
        () => afLabel(kit, "T"),
      ),
    ],
  },
  {
    fixture: "name-click-exit-before-title-lf",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => clickName(kit),
        () => member(kit),
        () => afLabel(kit, "T"),
      ),
    ],
  },
  {
    fixture: "name-click-exit-before-title-ls",
    make: (kit) => [
      afContainer(
        kit,
        "connector",
        () => clickName(kit),
        undefined,
        () => afLabel(kit, "T"),
      ),
    ],
  },
  {
    fixture: "name-click-exit-before-data-tab",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => clickName(kit),
        () => member(kit),
        null,
        ["@{ custom: x }"],
      ),
    ],
  },
  {
    fixture: "name-click-exit-before-separator-space",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => clickName(kit),
        () => {
          kit.token("Punctuator", ";")
          const body = member(kit)
          kit.token("Punctuator", ";")
          return body
        },
      ),
    ],
  },
  {
    fixture: "name-heading-title-interior-padding",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => afName(kit, [afLabel(kit, "F   ")]),
        () => member(kit, "A"),
        () => afLabel(kit, "T"),
      ),
      afContainer(
        kit,
        "connector",
        () => afName(kit, [afLabel(kit, "C ")]),
        undefined,
        () => afLabel(kit, "U"),
      ),
    ],
  },
]

const fixtures = loadFixtures("agentflow")

describe("Agentflow heading boundaries", () => {
  for (const testCase of HEADINGS)
    it(testCase.fixture, async () => {
      const fixture = (await fixtures).find(
        (entry) => entry.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error(testCase.fixture)
      const embedded = embeddedValuesOf(fixture, fixture.expected)
      if (!fixture.expected.accepted || embedded === undefined)
        throw new Error("the heading needs a recorded Db")
      const { tree } = agentflowTree(fixture.input, testCase.make)
      expect(checkTree(fixture.input, tree)).toEqual([])
      expect(
        dbFromTree(
          fixture.input,
          tree as unknown as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
      ).toEqual(fixture.expected.db)
    })
})

// An erased form satisfies click without leaving its context.
const ERASED_TAILS: readonly {
  readonly source: string
  readonly keyword: "flow" | "connector"
  readonly empty: string
  readonly emptyKind: "empty-string" | "empty-markdown-string"
  readonly boundary: "lf" | "semicolon" | "connector" | "eof"
}[] = [
  {
    source: 'agentflow-beta TB\nflow F click ""\n\nA\nend\n',
    keyword: "flow",
    empty: '""',
    emptyKind: "empty-string",
    boundary: "lf",
  },
  {
    source: 'agentflow-beta TB\nflow F click "``"\n\nA\nend\n',
    keyword: "flow",
    empty: '"``"',
    emptyKind: "empty-markdown-string",
    boundary: "lf",
  },
  {
    source: 'agentflow-beta TB\nflow F click "" ;A;end\n',
    keyword: "flow",
    empty: '""',
    emptyKind: "empty-string",
    boundary: "semicolon",
  },
  {
    source: 'agentflow-beta TB\nflow F click "``" ;A;end\n',
    keyword: "flow",
    empty: '"``"',
    emptyKind: "empty-markdown-string",
    boundary: "semicolon",
  },
  {
    source: 'agentflow-beta TB\nconnector F click ""\t;A\n',
    keyword: "connector",
    empty: '""',
    emptyKind: "empty-string",
    boundary: "connector",
  },
  {
    source: 'agentflow-beta TB\nconnector F click "``"\t;A\n',
    keyword: "connector",
    empty: '"``"',
    emptyKind: "empty-markdown-string",
    boundary: "connector",
  },
  {
    source: 'agentflow-beta TB\nconnector F click ""\t',
    keyword: "connector",
    empty: '""',
    emptyKind: "empty-string",
    boundary: "eof",
  },
  {
    source: 'agentflow-beta TB\nconnector F click "``"\t',
    keyword: "connector",
    empty: '"``"',
    emptyKind: "empty-markdown-string",
    boundary: "eof",
  },
]

for (const testCase of ERASED_TAILS)
  it(`keeps the exit after ${testCase.empty} before ${testCase.boundary}`, () => {
    const { source, tree } = agentflowTree(testCase.source, (kit) => {
      const container = afContainer(
        kit,
        testCase.keyword,
        () =>
          afName(kit, [
            afLabel(kit, "F "),
            afIgnored(kit, "click", "click"),
            afIgnored(kit, testCase.empty, testCase.emptyKind),
          ]),
        () => {
          if (testCase.boundary === "semicolon") kit.token("Punctuator", ";")
          const body = testCase.keyword === "flow" ? member(kit, "A") : []
          if (testCase.boundary === "semicolon") kit.token("Punctuator", ";")
          return body
        },
      )
      if (testCase.boundary === "connector") {
        kit.token("Punctuator", ";")
        return [container, ...member(kit, "A")]
      }
      return [container]
    })
    expect(checkTree(source, tree)).toEqual([])
  })

const BROKEN_HEADINGS: readonly {
  readonly name: string
  readonly source: string
  readonly make: (kit: Kit) => CheckedNode[]
  readonly problem: string
}[] = [
  {
    name: "a title cannot replace a click-id suffix before the exit",
    source: "agentflow-beta TB\nflow click A[T]\nB\nend\n",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => clickName(kit),
        () => member(kit),
        () => afLabel(kit, "T"),
      ),
    ],
    problem: "requires its one-whitespace exit",
  },
  {
    name: "an erased empty form does not exit click before a title",
    source: 'agentflow-beta TB\nflow F click ""[T]\nB\nend\n',
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () =>
          afName(kit, [
            afLabel(kit, "F "),
            afIgnored(kit, "click", "click"),
            afIgnored(kit, '""', "empty-string"),
          ]),
        () => member(kit),
        () => afLabel(kit, "T"),
      ),
    ],
    problem: "requires its one-whitespace exit",
  },
  {
    name: "heading data needs the click exit too",
    source: "agentflow-beta TB\nflow click A@{ custom: x }\nB\nend\n",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => clickName(kit),
        () => member(kit),
        null,
        ["@{ custom: x }"],
      ),
    ],
    problem: "requires its one-whitespace exit",
  },
  {
    name: "a second exit space must stay in a Name part",
    source: "agentflow-beta TB\nflow click A  [T]\nB\nend\n",
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => clickName(kit),
        () => member(kit),
        () => afLabel(kit, "T"),
      ),
    ],
    problem: "the bracket title must follow",
  },
  {
    name: "ordinary label padding cannot precede a quoted title",
    source: 'agentflow-beta TB\nflow F[ "T"]\nA\nend\n',
    make: (kit) => [
      afContainer(
        kit,
        "flow",
        () => afName(kit, [afLabel(kit, "F")]),
        () => member(kit, "A"),
        () => afLabel(kit, '"T"', "string", "T"),
      ),
    ],
    problem: "the bracket title must follow",
  },
  {
    name: "a sole click-exit LF is no flow separator",
    source: "agentflow-beta TB\nflow click A\nend\n",
    make: (kit) => [afContainer(kit, "flow", () => clickName(kit))],
    problem: "a flow/global heading requires its statement separator",
  },
  {
    name: "an erased string still needs a separator after its exit LF",
    source: 'agentflow-beta TB\nflow F click ""\nend\n',
    make: (kit) => [
      afContainer(kit, "flow", () =>
        afName(kit, [
          afLabel(kit, "F "),
          afIgnored(kit, "click", "click"),
          afIgnored(kit, '""', "empty-string"),
        ]),
      ),
    ],
    problem: "a flow/global heading requires its statement separator",
  },
]

for (const testCase of BROKEN_HEADINGS)
  it(`rejects ${testCase.name}`, () => {
    const { tree } = agentflowTree(testCase.source, testCase.make)
    const problems = checkTree(testCase.source, tree)
    expect(
      problems.some((problem) => problem.message.includes(testCase.problem)),
      JSON.stringify(problems),
    ).toBe(true)
  })
