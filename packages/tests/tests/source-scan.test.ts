import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { scanSource } from "../src/source-scan.ts"

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
]

/** U+2028 LINE SEPARATOR, which is not a line terminator of the grammar. */
const U2028 = String.fromCharCode(0x2028)

/** U+2029 PARAGRAPH SEPARATOR, which is not a line terminator of the grammar. */
const U2029 = String.fromCharCode(0x2029)

describe("scanSource: directives", () => {
  it("finds a closed directive, with the whitespace before its `}%%` in it", () => {
    const text = "%%{init: {} }%% x"
    expect(scanSource(text, 0).directives).toEqual([
      { range: [0, 15], scanEnd: 15, closed: true },
    ])
  })

  it("takes a word as the whole argument", () => {
    const text = "%%{init: dark foo}%%"
    const [directive] = scanSource(text, 0).directives
    expect(directive).toEqual({ range: [0, 13], scanEnd: 14, closed: false })
  })

  it("lets the whitespace before the argument cross line breaks", () => {
    const text = "%%{wrap\nA\nB"
    const [directive] = scanSource(text, 0).directives
    // The argument is `A`; the scan takes the line break after it too.
    expect(directive).toEqual({ range: [0, 9], scanEnd: 10, closed: false })
  })

  it("runs a free text to the end of the text, without its trailing whitespace in the range", () => {
    const text = '%%{init: {"a": 1} \n'
    const [directive] = scanSource(text, 0).directives
    expect(directive?.range).toEqual([0, 17])
    expect(directive?.scanEnd).toBe(text.length)
  })

  it("stops a free text before U+2028 and lets `}%%` close the directive after it", () => {
    const text = "%%{init: {}\u2028}%%"
    expect(scanSource(text, 0).directives).toEqual([
      { range: [0, 15], scanEnd: 15, closed: true },
    ])
  })

  it("does not start a directive where no word follows `%%{`", () => {
    expect(scanSource("%%{ }%% %%{-x}%%", 0).directives).toEqual([])
  })
})

describe("scanSource: comment lines", () => {
  it("finds a comment line with the whitespace-only lines before it in its region", () => {
    const text = "x\n \n  %% c\ny"
    expect(scanSource(text, 0).commentLines).toEqual([
      { commentStart: 6, commentEnd: 10, region: [2, 11] },
    ])
  })

  it("finds a comment after U+2028", () => {
    const text = "A\u2028%% c\nB"
    expect(scanSource(text, 0).commentLines).toEqual([
      { commentStart: 2, commentEnd: 6, region: [2, 7] },
    ])
  })

  it("finds a comment after a lone CR and after U+2029", () => {
    const afterLoneCr = "A\r%% c\nB"
    expect(scanSource(afterLoneCr, 0).commentLines).toEqual([
      { commentStart: 2, commentEnd: 6, region: [2, 7] },
    ])
    const afterParagraphSeparator = `A${U2029}%% c\nB`
    expect(scanSource(afterParagraphSeparator, 0).commentLines).toEqual([
      { commentStart: 2, commentEnd: 6, region: [2, 7] },
    ])
  })

  it("finds a line of `%%` and U+2028 or U+2029 only as a comment line", () => {
    for (const separator of [U2028, U2029]) {
      const text = `x\n%%${separator}\ny`
      expect(scanSource(text, 0).commentLines).toEqual([
        { commentStart: 2, commentEnd: 5, region: [2, 6] },
      ])
    }
  })

  it("does not find a `%%` at the end of the text as a comment line", () => {
    expect(scanSource("x\n%%", 0).commentLines).toEqual([])
  })

  it("does not find a `%%` after other text, a `%%` alone, or a `%%{` line", () => {
    expect(scanSource("A %% c", 0).commentLines).toEqual([])
    expect(scanSource("x\n%%\ny", 0).commentLines).toEqual([])
    expect(scanSource("x\n%%{-\ny", 0).commentLines).toEqual([])
  })

  it("joins the two `%` of a comment across a directive", () => {
    const text = "%%%{init: {}}%%% c"
    const [line] = scanSource(text, 0).commentLines
    expect(line?.commentStart).toBe(0)
    expect(line?.commentEnd).toBe(text.length)
  })

  it("carries a comment over a line break that a directive in it takes", () => {
    const text = "x\n%% %%{wrap\nA\nB --> C"
    const [line] = scanSource(text, 0).commentLines
    expect(line?.commentEnd).toBe(text.length)
  })
})

describe("scanSource: the recorded trees", () => {
  it("finds the directives and the comment lines that every recorded tree has", async () => {
    const differing: string[] = []
    for (const diagram of DIAGRAMS) {
      for (const fixture of await loadFixtures(diagram)) {
        const file = path.join(
          getFixturesRoot(),
          diagram,
          fixture.name,
          "ast.json",
        )
        if (!existsSync(file)) continue
        const tree = JSON.parse(readFileSync(file, "utf8")) as {
          frontmatter: { range: [number, number] } | null
          directives: { range: [number, number]; closed: boolean }[]
          comments: { range: [number, number] }[]
        }
        const scan = scanSource(fixture.input, tree.frontmatter?.range[1] ?? 0)
        const scannedDirectives = scan.directives.map(
          (directive) => [...directive.range, directive.closed] as const,
        )
        const recordedDirectives = tree.directives.map(
          (directive) => [...directive.range, directive.closed] as const,
        )
        // The comment lines are the comments of the tree that start where
        // a comment line starts; the other comments are diagram comments.
        const recordedComments = tree.comments
          .filter((comment) =>
            scan.commentLines.some(
              (line) => line.commentStart === comment.range[0],
            ),
          )
          .map((comment) => comment.range)
        const scannedComments = scan.commentLines.map(
          (line) => [line.commentStart, line.commentEnd] as const,
        )
        if (
          JSON.stringify(scannedDirectives) !==
            JSON.stringify(recordedDirectives) ||
          JSON.stringify(scannedComments) !== JSON.stringify(recordedComments)
        ) {
          differing.push(`${diagram}/${fixture.name}`)
        }
      }
    }
    expect(differing).toEqual([])
  }, 60_000)
})
