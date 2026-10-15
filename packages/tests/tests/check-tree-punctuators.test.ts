import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { FLOWCHART_SHAPES } from "../src/check-tree/flowchart-shapes.ts"
import { PUNCTUATOR_TEXTS } from "../src/check-tree/punctuators.ts"
import type { TreeProblem } from "../src/check-tree/types.ts"
import { handMadeRoot } from "./check-tree-trees.ts"

// The table of the texts of the `Punctuator` tokens (`src/check-tree/
// punctuators.ts`) is a copy of the row `Punctuator` of the table of Tokens of
// each diagram, and the table of the shapes a copy of the table of Shapes of
// the flowchart document.

const HERE = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_DOCUMENTS = path.join(HERE, "../../parser/docs/tokens")
const FLOWCHART_DOCUMENT = path.join(
  HERE,
  "../../spec/docs/diagrams/flowchart.md",
)

/** The spans between backticks in `line`, with `\|` read as `|`. */
function spansOf(line: string): string[] {
  const spans: string[] = []
  for (const match of line.matchAll(/`([^`]+)`/gu)) {
    spans.push((match[1] ?? "").replaceAll("\\|", "|"))
  }
  return spans
}

/** The line of the document `file` that starts with `start`. */
function lineStartingWith(file: string, start: string): string {
  const line = readFileSync(file, "utf8")
    .split("\n")
    .find((candidate) => candidate.startsWith(start))
  if (line === undefined) throw new Error(`no line ${start} in ${file}`)
  return line
}

/** The texts that a row of the table of Tokens gives, leaving out the names of units, which have letters, and the quotes around a text. */
function textsOfRow(diagram: string): string[] {
  const row = lineStartingWith(
    path.join(TOKEN_DOCUMENTS, `${diagram}.md`),
    "| `Punctuator`",
  )
  return spansOf(row)
    .map((span) =>
      span.length > 1 && span.startsWith('"') && span.endsWith('"')
        ? span.slice(1, -1)
        : span,
    )
    .filter((span) => !/[A-Za-z]/u.test(span))
}

/** The diagrams, with the type of their body. */
const DIAGRAMS: readonly [string, string][] = [
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
]

/**
 * The texts of each diagram's table that its row of the table of Tokens does
 * not give as texts, with the reason; the table is the texts of the row and
 * these, and no others.
 */
function textsBesidesTheRow(diagram: string): string[] {
  switch (diagram) {
    // The row names the shapes by their rule, and the `data-start` unit,
    // which is `@{`, by its name.
    case "flowchart":
      return [
        ...FLOWCHART_SHAPES.flatMap((shape) => [
          shape.opening,
          ...shape.closings,
        ]),
        "@{",
      ]
    // The row says that `;` is what a `newline` unit is read from.
    case "sequence":
      return [";"]
    // The row says a `visibility` or `classifier` unit: the marks of
    // ast/class.md, ClassMethod and ClassAttribute.
    case "class":
      return ["+", "-", "#", "~", "$", "*"]
    // The row gives the symbols of the cardinalities with a letter (`|o`,
    // `}o`, `o|`, `o{`) among the names of units, which have letters too.
    case "er":
      return ["|o", "}o", "o|", "o{"]
    // The row names the openers and the closers of a shape by their kind.
    case "mindmap":
      return ["))", "(", "((", "[", "]", "{{", "}}", "(-", "-)"]
    default:
      return []
  }
}

/** The texts of `texts` once each, in order. */
function distinct(texts: readonly string[]): string[] {
  return [...new Set(texts)].sort()
}

describe("the table of the texts of Punctuator tokens", () => {
  for (const [diagram, body] of DIAGRAMS) {
    it(`is the texts of the Punctuator row of the ${diagram} tokens and those that the row does not give as texts, and no others`, () => {
      expect(distinct(PUNCTUATOR_TEXTS[body] ?? [])).toEqual(
        distinct([...textsOfRow(diagram), ...textsBesidesTheRow(diagram)]),
      )
    })
  }
})

/**
 * The characters that the rule of the unit `unit` of the flowchart document
 * lists before `followed by`, or, for a rule that has none, its text: the
 * first span of the line.
 */
function closingsOfRule(unit: string): string[] {
  const line = readFileSync(FLOWCHART_DOCUMENT, "utf8")
    .split("\n")
    .find((candidate) => candidate.includes(`\`${unit}\` unit`))
  if (line === undefined) throw new Error(`no rule for ${unit}`)
  const followed = line.indexOf("followed by")
  return followed === -1
    ? spansOf(line).slice(0, 1)
    : spansOf(line.slice(0, followed))
}

/** The closings that a unit named by a row of the table of shapes stands for. */
function closingsOfNamedEnd(unit: string): string[] {
  switch (unit) {
    case "backslash-end":
      return closingsOfRule(unit).map((c) => `${c}]`)
    case "ellipse-end":
      return closingsOfRule(unit).map((c) => `${c})`)
    case "slash-end":
      return closingsOfRule(unit)
    default:
      throw new Error(`no closings for ${unit}`)
  }
}

/** The name and the opening of a shape, and its closings in order, as one text. */
function describeShape(
  shape: { name: string; opening: string },
  closings: readonly string[],
): string {
  return `${shape.name} ${shape.opening}: ${closings.toSorted().join(" ")}`
}

/** The closings that a row of the table of the document gives: its closing, or those of the unit that it names. */
function closingsOfRow(row: { closing: string }): string[] {
  return row.closing.endsWith("-end")
    ? closingsOfNamedEnd(row.closing)
    : [row.closing]
}

describe("the table of the shapes of a flowchart", () => {
  const rows = readFileSync(FLOWCHART_DOCUMENT, "utf8")
    .split("\n")
    .filter((line) => /^\| `[^`]+`(?: … `[^`]+`)+ +\|/u.test(line))
    .map((line) => {
      const cells = line.split(/(?<!\\)\|/u).map((cell) => cell.trim())
      const spans = spansOf(cells[1] ?? "")
      return {
        opening: spans[0] ?? "",
        closing: spans.at(-1) ?? "",
        name: spansOf(cells[2] ?? "")[0] ?? "",
      }
    })

  it("is the rows of the specification: the name and the opening of each, and the closings that it names, or that the rule of the unit that it names gives, and no others", () => {
    expect(
      FLOWCHART_SHAPES.map((shape) =>
        describeShape(shape, shape.closings),
      ).sort(),
    ).toEqual(rows.map((row) => describeShape(row, closingsOfRow(row))).sort())
  })
})

/** The problems that say a `Punctuator` token has a text that its diagram does not have, for the tree of a body of the type `body` that is one `Punctuator` token of the text `text`. */
function textProblems(body: string, text: string): TreeProblem[] {
  const root = handMadeRoot(text, {
    bodyType: body,
    tokens: [["Punctuator", text]],
  })
  return checkTree(text, root).filter((problem) =>
    problem.message.includes("is none of those"),
  )
}

describe("the check of the text of a Punctuator token", () => {
  it("reports a text that a flowchart has none of, though another diagram has it", () => {
    // `+` is a text of a sequence diagram and of a class diagram.
    expect(textProblems("FlowchartDiagram", "+")).toEqual([
      {
        where: "Punctuator at 0-1",
        message:
          'the Punctuator text "+" is none of those of a FlowchartDiagram',
      },
    ])
  })

  it("reports a text that a sequence diagram has none of, though a flowchart has it", () => {
    // `&` is a text of a flowchart.
    expect(textProblems("SequenceDiagram", "&")).toEqual([
      {
        where: "Punctuator at 0-1",
        message:
          'the Punctuator text "&" is none of those of a SequenceDiagram',
      },
    ])
  })

  it("reports a text that a gantt diagram has none of, though a state diagram has it", () => {
    // `"` is no `Punctuator` text of a gantt diagram: the quotes of a link
    // are in a `String` token.
    expect(textProblems("GanttDiagram", '"')).toEqual([
      {
        where: "Punctuator at 0-1",
        message: 'the Punctuator text "\\"" is none of those of a GanttDiagram',
      },
    ])
  })

  it("reports a text that a class diagram has none of", () => {
    expect(textProblems("ClassDiagram", "&")).toEqual([
      {
        where: "Punctuator at 0-1",
        message: 'the Punctuator text "&" is none of those of a ClassDiagram',
      },
    ])
  })

  it("reports a text that a state diagram has none of", () => {
    expect(textProblems("StateDiagram", "|")).toEqual([
      {
        where: "Punctuator at 0-1",
        message: 'the Punctuator text "|" is none of those of a StateDiagram',
      },
    ])
  })

  it("reports a text that an ER diagram has none of", () => {
    expect(textProblems("ErDiagram", "&")).toEqual([
      {
        where: "Punctuator at 0-1",
        message: 'the Punctuator text "&" is none of those of a ErDiagram',
      },
    ])
  })

  it("reports a text that is the beginning of one that the diagram has", () => {
    // `:::` is a text of a flowchart; `::` is not.
    expect(textProblems("FlowchartDiagram", "::")).toEqual([
      {
        where: "Punctuator at 0-2",
        message:
          'the Punctuator text "::" is none of those of a FlowchartDiagram',
      },
    ])
  })

  it("does not report a text that the diagram has", () => {
    expect(textProblems("FlowchartDiagram", "&")).toEqual([])
    expect(textProblems("SequenceDiagram", "+")).toEqual([])
    expect(textProblems("ClassDiagram", "<<")).toEqual([])
    expect(textProblems("StateDiagram", "[*]")).toEqual([])
    expect(textProblems("ErDiagram", "|o")).toEqual([])
    expect(textProblems("GanttDiagram", ":")).toEqual([])
    expect(textProblems("GanttDiagram", "(")).toEqual([])
  })
})
