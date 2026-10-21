import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { C4_FIELD_WORDS } from "../src/check-tree/c4.ts"
import { KEYWORD_TEXTS } from "../src/check-tree/keywords.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { directiveOf, handMadeRoot } from "./check-tree-trees.ts"

// parser/docs/tokens.md, A token that a directive cuts: a directive between
// two `Keyword` tokens cuts a keyword only when the two texts joined are a
// keyword of the diagram; two keywords that a diagram lets follow each other
// with nothing between are units of their own.

/** The diagrams, with the type of their body. */
const DIAGRAMS: readonly [DiagramType, string][] = [
  ["flowchart", "FlowchartDiagram"],
  ["sequence", "SequenceDiagram"],
  ["class", "ClassDiagram"],
  ["state", "StateDiagram"],
  ["er", "ErDiagram"],
  ["gantt", "GanttDiagram"],
  ["journey", "JourneyDiagram"],
  ["requirement", "RequirementDiagram"],
  ["mindmap", "MindmapDiagram"],
  ["timeline", "TimelineDiagram"],
  ["sankey", "SankeyDiagram"],
  ["xychart", "XychartDiagram"],
  ["quadrant", "QuadrantDiagram"],
  ["block", "BlockDiagram"],
  ["kanban", "KanbanDiagram"],
  ["c4", "C4Diagram"],
]

/** The messages of the problems of the check of cut tokens, for the tree of the text of the `Keyword` tokens `fragments` with a directive between each two, in the body of the type `body`. */
function cutProblems(body: string, ...fragments: string[]): string[] {
  const directive = "%%{init: {}}%%"
  const text = fragments.join(directive)
  const tokens: [string, { text: string; from: number }][] = []
  const directives = []
  let from = 0
  for (const [index, fragment] of fragments.entries()) {
    if (index > 0) {
      tokens.push(["Directive", { text: directive, from }])
      directives.push(directiveOf(text, { text: directive, from }))
      from += directive.length
    }
    tokens.push(["Keyword", { text: fragment, from }])
    from += fragment.length
  }
  const tree = handMadeRoot(text, { bodyType: body, tokens, directives })
  return checkTree(text, tree)
    .filter((problem) => problem.message.includes("a Keyword token is cut"))
    .map((problem) => problem.message)
}

describe("the check of the cut Keyword tokens", () => {
  it("reports a cut C4 header and call keyword", () => {
    expect(cutProblems("C4Diagram", "C4", "Context")).toHaveLength(1)
    expect(cutProblems("C4Diagram", "Person", "_Ext")).toHaveLength(1)
  })
  it("reports a cut kanban header", () => {
    expect(cutProblems("KanbanDiagram", "kan", "ban")).toHaveLength(1)
  })

  it("reports two Keyword tokens whose texts joined are a keyword of the diagram", () => {
    expect(cutProblems("FlowchartDiagram", "sub", "graph")).toHaveLength(1)
    expect(cutProblems("StateDiagram", "state", "diagram")).toHaveLength(1)
    expect(cutProblems("SequenceDiagram", "par", "_over")).toHaveLength(1)
    expect(cutProblems("StateDiagram", "<<cho", "ice>>")).toHaveLength(1)
    expect(cutProblems("ErDiagram", "sub", "graph")).toHaveLength(1)
  })

  it("reports three Keyword tokens whose texts joined are a keyword of the diagram, though no two of them are one, at the first", () => {
    // `su`, `bgr`, and `aph` are `subgraph`, and none of `subgr` and `bgraph`
    // is a keyword.
    expect(cutProblems("FlowchartDiagram", "su", "bgr", "aph")).toEqual([
      'a Keyword token is cut: Keyword at 0-2, Keyword at 16-19, Keyword at 33-36 are the fragments of "subgraph"',
    ])
    expect(cutProblems("SequenceDiagram", "pa", "rtici", "pant")).toEqual([
      'a Keyword token is cut: Keyword at 0-2, Keyword at 16-21, Keyword at 35-39 are the fragments of "participant"',
    ])
    expect(cutProblems("ClassDiagram", "class", "Dia", "gram")).toEqual([
      'a Keyword token is cut: Keyword at 0-5, Keyword at 19-22, Keyword at 36-40 are the fragments of "classDiagram"',
    ])
    expect(cutProblems("StateDiagram", "<<ch", "oice", ">>")).toEqual([
      'a Keyword token is cut: Keyword at 0-4, Keyword at 18-22, Keyword at 36-38 are the fragments of "<<choice>>"',
    ])
    expect(cutProblems("ErDiagram", "optional", "ly t", "o")).toEqual([
      'a Keyword token is cut: Keyword at 0-8, Keyword at 22-26, Keyword at 40-41 are the fragments of "optionally to"',
    ])
  })

  it("reports four Keyword tokens whose texts joined are a keyword, and every shorter run of them that is one", () => {
    // `s`, `ub`, `gra`, and `ph` are `subgraph`, and the last two are `graph`,
    // a keyword of a flowchart too.
    expect(cutProblems("FlowchartDiagram", "s", "ub", "gra", "ph")).toEqual([
      'a Keyword token is cut: Keyword at 0-1, Keyword at 15-17, Keyword at 31-34, Keyword at 48-50 are the fragments of "subgraph"',
      'a Keyword token is cut: Keyword at 31-34, Keyword at 48-50 are the fragments of "graph"',
    ])
  })

  it("does not report three Keyword tokens whose texts joined are no keyword of the diagram", () => {
    // `su`, `bgr`, and `ap` make `subgrap`, and `su` and `bgr` make `subgr`.
    expect(cutProblems("FlowchartDiagram", "su", "bgr", "ap")).toEqual([])
    // `par` and `_ov` make `par_ov`, which is no keyword; `par_over` is.
    expect(cutProblems("SequenceDiagram", "par", "_ov")).toEqual([])
  })

  it("does not report two keywords that a diagram lets follow each other with nothing between", () => {
    // `state A <<choice>>%%{init: {}}%%accDescr {}` is a pseudostate mark and
    // the start of an empty description block.
    expect(cutProblems("StateDiagram", "<<choice>>", "accDescr")).toEqual([])
    expect(cutProblems("StateDiagram", "<<fork>>", "accDescr")).toEqual([])
  })
})

const TOKEN_DOCUMENTS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../parser/docs/tokens",
)

/** The spans of the Keyword row of a table of Tokens that name a unit, and not a word. */
const UNIT_NAMES: ReadonlySet<string> = new Set([
  "Keyword",
  "header",
  "header-keyword",
  "header-direction",
  "orientation",
  "direction-value",
  "direction-value",
  "link-target",
  "ignored-state",
  "description-word",
  "wrap-prefix",
  "day",
])

/** The spans of the Keyword row of the table of Tokens of a diagram that name a unit of that diagram, where the same word is a keyword in another diagram (`direction`). */
const UNIT_NAMES_OF_DIAGRAM: Readonly<Record<string, readonly string[]>> = {
  timeline: ["direction"],
  // The colon in the explanation of block: and space: belongs to those
  // keywords, and is not a Keyword token of its own.
  block: [":"],
}

/** The days that a `day` unit of a gantt diagram is, in lower case (diagrams/gantt.md, The statement context). */
const DAYS: readonly string[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

/** The values of a `direction-value` unit, of a direction statement; a flowchart's `header-direction` unit has them too. */
const DIRECTION_VALUES: readonly string[] = ["tb", "bt", "rl", "lr"]

/** The values of a `link-target` unit. */
const LINK_TARGETS: readonly string[] = ["_self", "_blank", "_parent", "_top"]

/**
 * The texts of the units that the Keyword row of the table of Tokens of
 * `diagram` names without their text: the words of the header, of a
 * direction, of a link target, a pseudostate mark, and a wrap prefix, as the
 * rules of the lexer of the diagram give them (parser/docs/tokens/
 * <diagram>.md, Keyword; the specification of the diagram, its lexical rules).
 */
function textsOfUnitsInTheRow(diagram: string): string[] {
  switch (diagram) {
    // The header keywords, and the directions of the header context, which
    // include the characters `v`, `<`, `>`, and `^`.
    case "flowchart":
      return [
        "flowchart",
        "flowchart-elk",
        "graph",
        "swimlane-beta",
        ...DIRECTION_VALUES,
        "td",
        "br",
        "v",
        "<",
        ">",
        "^",
        ...LINK_TARGETS,
      ]
    case "sequence":
      return ["wrap:", ":wrap:", "nowrap:", ":nowrap:"]
    case "class":
      return [
        "classdiagram",
        "classdiagram-v2",
        ...DIRECTION_VALUES,
        ...LINK_TARGETS,
      ]
    case "state":
      return [
        "statediagram",
        "statediagram-v2",
        "description",
        "left",
        "right",
        ...DIRECTION_VALUES,
        "<<choice>>",
        "<<fork>>",
        "<<join>>",
        "[[choice]]",
        "[[fork]]",
        "[[join]]",
      ]
    case "er":
      return ["erdiagram", ...DIRECTION_VALUES]
    case "gantt":
      return ["gantt", ...DAYS]
    case "journey":
      return ["journey"]
    // The header, and the units that the row names by their kind: the kinds
    // of requirement, the names of the fields, the risks, the methods, the
    // relationships (rule 15 of The statement context), and the values of
    // `direction`.
    case "mindmap":
      return ["mindmap"]
    case "kanban":
      return ["kanban"]
    case "c4":
      return [
        "c4context",
        "c4container",
        "c4component",
        "c4dynamic",
        "c4deployment",
        ...[
          "C4ElementStatement",
          "C4BoundaryStatement",
          "C4RelationshipStatement",
          "C4UpdateStatement",
        ]
          .flatMap((type) => C4_FIELD_WORDS[type]?.keyword ?? [])
          .map((word) => word.toLowerCase()),
      ]
    // The row gives the two headers as texts.
    case "sankey":
      return []
    // The header and the orientation units, which the row names by their kind.
    case "xychart":
      return ["xychart", "xychart-beta", "vertical", "horizontal"]
    // The row names the header by its kind, and the middle two of the four
    // `quadrant-N` words by the range `quadrant-1` to `quadrant-4`.
    case "block":
      return ["right", "left", "up", "down", "x", "y"]
    case "quadrant":
      return ["quadrantchart", "quadrant-2", "quadrant-3"]
    // The header, and the two values of the `direction` unit.
    case "timeline":
      return ["timeline", "lr", "td"]
    case "requirement":
      return [
        "requirementdiagram",
        "requirement",
        "functionalrequirement",
        "interfacerequirement",
        "performancerequirement",
        "physicalrequirement",
        "designconstraint",
        "id",
        "text",
        "risk",
        "verifymethod",
        "type",
        "docref",
        "low",
        "medium",
        "high",
        "analysis",
        "demonstration",
        "inspection",
        "test",
        "contains",
        "copies",
        "derives",
        "satisfies",
        "verifies",
        "refines",
        "traces",
        ...DIRECTION_VALUES,
      ]
    default:
      throw new Error(`no diagram ${diagram}`)
  }
}

/** The texts of `texts` once each, in order. */
function distinct(texts: readonly string[]): string[] {
  return [...new Set(texts)].sort()
}

describe("the table of the texts of Keyword tokens", () => {
  it("holds the text, in lower case, of every Keyword token of every recorded tree", async () => {
    const missing = new Set<string>()
    for (const [diagram, body] of DIAGRAMS) {
      const texts = new Set(KEYWORD_TEXTS[body] ?? [])
      for (const fixture of await loadFixtures(diagram)) {
        const file = path.join(
          getFixturesRoot(),
          diagram,
          fixture.name,
          "ast.json",
        )
        if (!existsSync(file)) continue
        const tree = JSON.parse(readFileSync(file, "utf8")) as CheckedRoot
        for (const token of tree.tokens) {
          if (
            token.type === "Keyword" &&
            !texts.has(token.value.toLowerCase())
          ) {
            missing.add(`${diagram}: ${token.value}`)
          }
        }
      }
    }
    expect([...missing]).toEqual([])
  }, 120_000)

  for (const [diagram, body] of DIAGRAMS) {
    it(`is the words of the Keyword row of the ${diagram} tokens, in lower case, and the texts that the row names as units without their text, and no others`, () => {
      const row = readFileSync(
        path.join(TOKEN_DOCUMENTS, `${diagram}.md`),
        "utf8",
      )
        .split("\n")
        .find((line) => line.startsWith("| `Keyword`"))
      expect(row, diagram).toBeDefined()
      const words = [...(row ?? "").matchAll(/`([^`]+)`/gu)]
        .map((match) => match[1] ?? "")
        .filter(
          (span) =>
            !UNIT_NAMES.has(span) &&
            !(UNIT_NAMES_OF_DIAGRAM[diagram] ?? []).includes(span),
        )
        .map((word) => word.toLowerCase())
      expect(distinct(KEYWORD_TEXTS[body] ?? [])).toEqual(
        distinct([...words, ...textsOfUnitsInTheRow(diagram)]),
      )
    })
  }
})
