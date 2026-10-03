import type { Frontmatter, Range, Root } from "./ast.ts"
import { buildDetectionInput, detect } from "./detection.ts"
import type { DiagramInput } from "./diagram-parsing.ts"
import { parseClassDiagram } from "./diagrams/class/index.ts"
import { parseErrorDiagram } from "./diagrams/error.ts"
import { parseSequenceDiagram } from "./diagrams/sequence/index.ts"
import { parseStateDiagram } from "./diagrams/state/index.ts"
import { parseFlowchartDiagram } from "./diagrams/flowchart/index.ts"
import { ParseError, UnsupportedDiagramError } from "./errors.ts"
import { readFrontmatterTrivia } from "./frontmatter.ts"
import { LineIndex } from "./positions.ts"
import { SourceLexer } from "./source-lexer.ts"
import { lineTerminatorEnd, nextOffset } from "./text-cursor.ts"

/**
 * The range a detection failure is reported at: from the first character
 * that is not trivia to the end of its line, or an empty range at the end of
 * the text when there is no such character.
 */
function detectionFailureRange(text: string, firstTokenOffset: number): Range {
  if (firstTokenOffset >= text.length) {
    return [firstTokenOffset, firstTokenOffset]
  }
  let offset = firstTokenOffset
  while (offset < text.length && lineTerminatorEnd(text, offset) === null) {
    offset = nextOffset(text, offset)
  }
  return [firstTokenOffset, offset]
}

/** The source as `parse()` opens it, before detection. */
export interface OpenedSource {
  readonly lines: LineIndex
  /** The shared lexer, which reads the text after the frontmatter. */
  readonly lexer: SourceLexer
  readonly frontmatter: Frontmatter | null
}

/**
 * common.md, Frontmatter: opens `text`. Frontmatter is decided once, at the
 * start of the source; the shared lexer reads the text after it. Not public
 * API: the tests read the source with the same lexer.
 */
export function openSource(text: string): OpenedSource {
  const lines = new LineIndex(text)
  const frontmatterTrivia = readFrontmatterTrivia(text, lines)
  return {
    lines,
    lexer: new SourceLexer(text, frontmatterTrivia?.textStart ?? 0),
    frontmatter: frontmatterTrivia?.frontmatter ?? null,
  }
}

/**
 * Parses Mermaid text into the tree of ast.md. Throws `ParseError` when the
 * input is rejected and `UnsupportedDiagramError` when the diagram type is
 * detected but not implemented yet.
 */
export function parse(text: string): Root {
  const { lines, lexer, frontmatter } = openSource(text)
  const { detectionText, firstTokenOffset } = buildDetectionInput(lexer)
  const detected = detect(detectionText)
  if (detected === null) {
    const range = detectionFailureRange(text, firstTokenOffset)
    throw new ParseError(
      "No diagram type detected",
      range,
      lines.location(range),
    )
  }
  if (detected === "---") {
    const range: Range = [firstTokenOffset, firstTokenOffset + 3]
    throw new ParseError(
      "Diagrams beginning with --- are not valid: the block is not frontmatter",
      range,
      lines.location(range),
    )
  }
  const input: DiagramInput = {
    lexer,
    frontmatter,
    diagramType: detected,
  }
  switch (detected) {
    case "error":
      return parseErrorDiagram(input)
    case "flowchart-v2":
    case "flowchart-elk":
    case "swimlane":
      return parseFlowchartDiagram(input)
    case "sequence":
      return parseSequenceDiagram(input)
    case "classDiagram":
      return parseClassDiagram(input)
    case "stateDiagram":
      return parseStateDiagram(input)
    default:
      throw new UnsupportedDiagramError(detected)
  }
}
