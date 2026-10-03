import { describe, expect, it } from "vitest"
import type { DiagramType } from "../src/ast.ts"
import {
  buildDetectionInput,
  detect,
  detectors,
  removePercentRuns,
} from "../src/detection.ts"
import { readFrontmatterTrivia } from "../src/frontmatter.ts"
import { LineIndex } from "../src/positions.ts"
import { SourceLexer } from "../src/source-lexer.ts"
import { allDiagramTypes } from "./types.test.ts"

/** A lexer over `text` that starts after the frontmatter, as parse() creates it. */
function lexerOf(text: string): SourceLexer {
  const frontmatterTrivia = readFrontmatterTrivia(text, new LineIndex(text))
  return new SourceLexer(text, frontmatterTrivia?.textStart ?? 0)
}

/** The detection text of `text`, as parse() builds it. */
function detectionTextOf(text: string): string {
  return buildDetectionInput(lexerOf(text)).detectionText
}

// Expectations come from detection.md and common.md, Diagram detection.

describe("the detectors", () => {
  it("are the 39 entries of detection.md in order: every DiagramType once, and `---`", () => {
    const ids = detectors.map((detector) => detector.id)
    expect(ids).toEqual([
      ...(Object.keys(allDiagramTypes) as DiagramType[]).slice(0, 1),
      "---",
      ...(Object.keys(allDiagramTypes) as DiagramType[]).slice(1),
    ])
    expect(new Set(ids).size).toBe(39)
  })
})

describe("detect", () => {
  it.each([
    // Entry 1: the whole text, case-insensitively, trimmed.
    ["error", "error"],
    [" Error \n", "error"],
    ["ERROR", "error"],
    ["errors", null],
    // Entry 2: `---` at the start.
    ["---", "---"],
    ["  ---\nx", "---"],
    // Entry 3 comes before entry 17.
    ["flowchart-elk TD", "flowchart-elk"],
    ["flowchart LR", "flowchart-v2"],
    ["graph", "flowchart-v2"],
    ["graphic", "flowchart-v2"],
    ["flowchartLR", "flowchart-v2"],
    ["mindmap", "mindmap"],
    ["architecture-beta", "architecture"],
    // Entries 6, 16, 30: a non-word character or the end must follow.
    ["agentflow-beta", "agentflow"],
    ["agentflow-betaX", null],
    ["swimlane-beta LR", "swimlane"],
    ["swimlane-betaX", null],
    ["swimlane-beta\u00E9", "swimlane"],
    ["ishikawa", "ishikawa"],
    ["ishikawa-betaX", "ishikawa"],
    ["ishikawaX", null],
    ["ishikawa\u017F", "ishikawa"],
    ["ishikawa\u00E9", "ishikawa"],
    // Entry 7: `C4Context` at the start, the others anywhere.
    ["C4Context", "c4"],
    ["x C4Context", null],
    ["x C4Container", "c4"],
    ["sequenceDiagram\nA->>B: C4Component", "c4"],
    ["mindmap\n  C4Dynamic", "mindmap"],
    ["flowchart LR\nA-->C4Context", "flowchart-v2"],
    // Exact keywords.
    ["kanban", "kanban"],
    ["classDiagram-v2", "classDiagram"],
    ["erDiagram", "er"],
    ["gantt", "gantt"],
    ["info", "info"],
    ["infox", "info"],
    ["pie", "pie"],
    ["requirementDiagram", "requirement"],
    ["sequenceDiagram", "sequence"],
    ["sequencediagram", null],
    ["timeline", "timeline"],
    ["gitGraph", "gitGraph"],
    ["stateDiagram-v2", "stateDiagram"],
    ["journey", "journey"],
    ["quadrantChart", "quadrantChart"],
    ["sankey-beta", "sankey"],
    ["packet-beta", "packet"],
    ["xychart-beta", "xychart"],
    ["block-beta", "block"],
    ["eventmodeling", "eventmodeling"],
    ["treeView-beta", "treeView"],
    ["radar-beta", "radar"],
    ["treemap", "treemap"],
    ["venn-beta", "venn"],
    // Entries 30, 32-35, 37 are case-insensitive for ASCII letters only.
    ["ISHIKAWA", "ishikawa"],
    ["IsHiKaWa", "ishikawa"],
    ["ishi\u212Aawa", null],
    ["i\u017Fhikawa", null],
    ["Railroad-Beta", "railroad"],
    ["railroad-ebnf-beta", "railroadEbnf"],
    ["RAILROAD-ABNF-BETA", "railroadAbnf"],
    ["railroad-peg-beta", "railroadPeg"],
    ["WARDLEY-BETA", "wardley"],
    // Entries 38 and 39: what may follow.
    ["cynefin-beta", "cynefin"],
    ["cynefin-beta:", "cynefin"],
    ["cynefin-beta x", "cynefin"],
    ["cynefin-betax", null],
    ["usecase-beta", "usecase"],
    ["usecase-beta x", "usecase"],
    ["usecase-beta:", null],
    // Leading whitespace is skipped by every detector.
    ["\n\n  pie", "pie"],
    ["", null],
    ["hello", null],
  ])("%j is %s", (text, expected) => {
    expect(detect(text)).toBe(expected)
  })
})

describe("removePercentRuns", () => {
  it.each([
    // The whitespace before `%%`, the `%%`, and the rest of the line become one
    // line break.
    ["error %% x\n", "error\n"],
    ["error %% x\nmore", "error\nmore"],
    ["%%\nerror", "\nerror"],
    // A `%%` with no line break after it is left alone, and so is what follows.
    ["error %% x", "error %% x"],
    ["error %% x\n%% y", "error\n%% y"],
    // The whitespace before reaches back across line breaks, but not into
    // removed text.
    ["a\n\n  %% x\nb", "a\nb"],
    ["a %% x\n \n%% y\nb", "a\n\nb"],
    // `\r\n` and `\r` are line breaks.
    ["error %% x\r\n", "error\n"],
    ["error %% x\rb", "error\nb"],
    // U+2028 is whitespace before `%%`, and not a line break after it.
    ["a\u2028%% x\nb", "a\nb"],
    ["a %% x\u2028b", "a %% x\u2028b"],
    ["", ""],
  ])("%j becomes %j", (text, expected) => {
    expect(removePercentRuns(text)).toBe(expected)
  })
})

describe("buildDetectionInput", () => {
  it("reports the first character that is not trivia", () => {
    expect(
      buildDetectionInput(lexerOf("  %% c\n%%{a}%% x")).firstTokenOffset,
    ).toBe(15)
    expect(buildDetectionInput(lexerOf("%% c\n")).firstTokenOffset).toBe(5)
    expect(buildDetectionInput(lexerOf("")).firstTokenOffset).toBe(0)
  })

  it.each([
    // Directives and comment regions are left out, leading whitespace is
    // removed.
    ["%%{init: {}}%%\n  pie\n%% c\n  x", "pie\n  x"],
    ["err%%{init: {}}%%or", "error"],
    // A comment whose `%%` has a directive between its two `%` is left out.
    ["%%%{init: {}}%%% c\nerror", "error"],
    // A `%%` that is formed by leaving out a directive and is no comment is
    // removed with its line break.
    ["%%%{a}%%%\nerror", "\nerror"],
    // The second directive scan finds a directive formed by leaving out one.
    ["error %%%%{wrap}%%{x}%%", "error "],
    // A `---` block at the start is removed again, and then the `%%` runs.
    ["\n---\ntitle: T\n---\nerror\n", "error\n"],
    ["\uFEFF---\ntitle: x\n---\nerror", "error"],
    ["error %% x\n", "error\n"],
    ["%%{ }%%\nflowchart LR", "\nflowchart LR"],
    ["%% a\n%% b", ""],
    ["", ""],
    // The frontmatter of the source is left out; a `---` block after
    // leading trivia is removed again by the second frontmatter attempt.
    ["---\na: 1\n---\npie", "pie"],
    ["\n---\r\n%% c\n\n---\nerror\n", "error\n"],
    // Each line terminator of the source is one `\n`: no comment start lies
    // between the characters of `\r\n`, a lone `\r` stays apart from a `\n`
    // after a directive left out between them, and the `\n` that ends a
    // comment is left out with its comment region.
    ["x\r\n%% c\r\ny", "x\ny"],
    ["x\r%%{wrap}%%\ny", "x\n\ny"],
    ["x\r%% c\ny", "x\ny"],
    // A comment region starts right after U+2028, indent included.
    ["error\u2028  %% c", "error\u2028"],
    // The second directive scan finds directives that whitespace and a word
    // follow only once comment regions and directives are left out.
    ["%%{\n%% comment\nkanban\n  A-->B\n", "-->B\n"],
    ["%%{\n%%{wrap}%%\nerror", ""],
    ["%%{\n%%{wrap}%%\nx}%%error", "error"],
    ["%%{\n%%{\n%%{wrap}%%\nflowchart LR\nA-->B", "\nA-->B"],
  ])("%j gives %j", (text, expected) => {
    expect(detectionTextOf(text)).toBe(expected)
  })
})
