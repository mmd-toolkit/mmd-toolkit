/**
 * Formats class statements of many forms, where formatting changes the
 * whitespace between tokens (docs/class.md): relations with names of every
 * form, every arrow with whitespace inside it or none, cardinalities, and
 * labels, among them labels of only whitespace and labels on a line that
 * holds a `;`; member statements, and member lines with whitespace between
 * their parts; and class statements with a label, a CSS
 * class or an annotation, a generic type, and member bodies on one line or
 * several.
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/**
 * Class names of every form: a word, name parts with whitespace, `-`, and
 * `.` between them, a backquoted name with and without parts before it,
 * generic types with and without whitespace inside, a name that starts
 * with a digit, and names that start with `o` or a keyword.
 */
const names: readonly string[] = [
  "A",
  "Foo Bar",
  "A - B",
  "a.b.C",
  "a . b",
  "`x y`",
  "A.`b c`",
  "A~T~",
  "A~ T ~",
  "A~~",
  "1A",
  "oB",
  "order",
  "noteX",
]

/** The relation ends (diagrams/class.md, Relations), and none. */
const ends: readonly string[] = ["", "<|", "|>", "<", ">", "*", "o", "()"]

/** The lines of a relation. */
const lines: readonly string[] = ["--", ".."]

/**
 * The whitespace written around and inside an arrow: before it, between
 * its start and its line, between its line and its end, and after it.
 */
const spacings: readonly (readonly [string, string, string, string])[] = [
  ["", "", "", ""],
  [" ", "", "", " "],
  [" ", " ", " ", " "],
  ["  ", "\t", "  ", "\t"],
]

/** What follows the target: labels and comments. */
const labels: readonly string[] = [
  "",
  " : x",
  ":x",
  " : x y ",
  " : ",
  ":  ",
  " : #f00;",
  ":#f00;",
  " %% c",
  "%% c",
]

/** A relation statement. */
function relation(
  from: string,
  [start, line, end]: readonly [string, string, string],
  to: string,
  [before, inStart, inEnd, after]: readonly [string, string, string, string],
  cardinalities: readonly [string, string],
  label: string,
): GeneratedInput {
  const [fromCardinality, toCardinality] = cardinalities
  const arrow = `${start}${start === "" ? "" : inStart}${line}${end === "" ? "" : inEnd}${end}`
  const text = `${from}${before}${fromCardinality}${before}${arrow}${after}${toCardinality}${after}${to}${label}`
  return {
    text: `classDiagram\nclass ${firstName(from)}\n${text}\n`,
    options: {},
  }
}

/**
 * A plain name of a class name, declared first, so that a `style` or a
 * relation finds a class: the name up to its first whitespace or `~`.
 */
function firstName(name: string): string {
  let end = 0
  while (end < name.length && name[end] !== " " && name[end] !== "~") end++
  return name.slice(0, end) === "" ? "A" : name.slice(0, end)
}

/** Every arrow: each pair of ends with each line. */
const arrows: readonly (readonly [string, string, string])[] = ends.flatMap(
  (start) =>
    lines.flatMap((line) => ends.map((end) => [start, line, end] as const)),
)

/** Cardinalities: none, on one side, and on both, one of them empty. */
const cardinalityPairs: readonly (readonly [string, string])[] = [
  ["", ""],
  ['"1"', ""],
  ['"1"', '"*"'],
  ['""', '"many"'],
]

/** Member statements and member lines. */
const memberTexts: readonly string[] = [
  "+int x",
  "+ foo()",
  "+foo( a ) int",
  "+foo()$ int",
  "-bar() int$",
  "<< y z >>",
  "x %% c",
  "+x style:#a;",
]

/**
 * Member lines with whitespace between their parts: one space, two, or a
 * tab after the visibility mark, around the parameters, before the return
 * type and before a classifier, and around the text of an annotation; and
 * method lines with U+2028 or U+2029, where the whitespace at the start of
 * a segment is part of what mermaid.js reads (diagrams/class.md, Member
 * lines).
 */
const spacedMemberLines: readonly string[] = [
  ...[" ", "  ", "\t"].flatMap((space) => [
    `+${space}foo(a)${space}int`,
    `+foo(${space}a${space})${space}int${space}$`,
    `-bar()${space}$`,
    `+foo(a) int${space}$`,
    `<<${space}y${space}z${space}>>`,
  ]),
  ...["\u2028", "\u2029"].flatMap((separator) => [
    `+a${separator}b(c) int`,
    `+a${separator} b(c)  int`,
    `+b(c) in${separator}t`,
    `+b(c)${separator} int`,
    `+b(c) int${separator}  $`,
  ]),
]

/** Class statements with what may follow the name. */
const classStatements: readonly string[] = [
  'class A["x"]',
  'class A ["x y"]',
  "class A:::c",
  "class A <<x>>",
  "class A<<x>>",
  "class A~T~",
  "class A~ T ~ <<x>>",
  "class A {}",
  "class A { }",
  "class A:::c { }",
  "class A {\n}",
  "class A:::c {\n  \n\n}",
  'class A~T~["x"] {}',
  "class A { %%{init: {}}%% }",
  "class A {\n%% c\n}",
  "class A:::c {\n  \n%% c\n}",
  "class A:::c { %%{init: {}}%%\n}",
  "class A { +x }",
  "class A{+x}",
  "class A {\n+x\n  -y()\n}",
  "class A {\n%% c\n+x\n\n\n+y\n}",
  "class A {+x\n+y}",
  'class A ["x"] {\n<<interface>>\n+x\n}',
]

/**
 * Every pair of names with two arrows, two spacings, and three labels;
 * every arrow with two plain names, every spacing, cardinalities, and
 * label; then the member statements and the class statements.
 */
function* makeInputs(): Generator<GeneratedInput> {
  for (const from of names) {
    for (const to of names) {
      for (const arrow of [arrows[1], arrows[29]]) {
        for (const spacing of spacings.slice(1, 3)) {
          for (const label of [labels[0], labels[1], labels[4]]) {
            yield relation(from, arrow, to, spacing, ["", ""], label)
          }
        }
      }
    }
  }
  for (const arrow of arrows) {
    for (const spacing of spacings) {
      for (const cardinalities of cardinalityPairs) {
        for (const label of labels) {
          yield relation("A", arrow, "B", spacing, cardinalities, label)
        }
      }
    }
  }
  for (const name of names) {
    for (const text of memberTexts) {
      for (const colon of [" : ", ":", " :", ":  "]) {
        yield {
          text: `classDiagram\n${name}${colon}${text}\n`,
          options: {},
        }
      }
    }
  }
  for (const line of spacedMemberLines) {
    yield { text: `classDiagram\nA : ${line}\n`, options: {} }
    yield { text: `classDiagram\nclass A {\n${line}\n}\n`, options: {} }
  }
  for (const statement of classStatements) {
    yield { text: `classDiagram\n${statement}\n`, options: {} }
    yield {
      text: `classDiagram\nnamespace N {\n${statement}\n}\n`,
      options: {},
    }
  }
}

describe("class statements", () => {
  it("are formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 3_600_000)
})
