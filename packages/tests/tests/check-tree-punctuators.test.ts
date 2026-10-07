import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { FLOWCHART_SHAPES } from "../src/check-tree/flowchart-shapes.ts"
import { PUNCTUATOR_TEXTS } from "../src/check-tree/punctuators.ts"

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
  return `${shape.name} ${shape.opening}: ${[...closings].sort().join(" ")}`
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
