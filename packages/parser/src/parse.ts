import type { DiagramType, Frontmatter, Range, Root } from "./ast.ts"
import type { Detection } from "./detection.ts"
import { detectDiagram } from "./detection.ts"
import type { DiagramInput } from "./diagram-parsing.ts"
import { parseClassDiagram } from "./diagrams/class/index.ts"
import { parseErDiagram } from "./diagrams/er/index.ts"
import { parseErrorDiagram } from "./diagrams/error.ts"
import { parseSequenceDiagram } from "./diagrams/sequence/index.ts"
import { parseStateDiagram } from "./diagrams/state/index.ts"
import { parseFlowchartDiagram } from "./diagrams/flowchart/index.ts"
import { parseGanttDiagram } from "./diagrams/gantt/index.ts"
import { ParseError, UnsupportedDiagramError } from "./errors.ts"
import { readFrontmatterTrivia } from "./frontmatter.ts"
import { LineIndex } from "./positions.ts"
import { SourceLexer } from "./source-lexer.ts"
import { lineTerminatorEnd, nextOffset } from "./text-cursor.ts"

/**
 * error-positions.md, Before the diagram: the range a detection failure is
 * reported at: from the detection point to the end of its line, or an empty
 * range at the end of the text when there is no diagram text.
 */
function detectionFailureRange(text: string, detectionPoint: number): Range {
  if (detectionPoint >= text.length) {
    return [detectionPoint, detectionPoint]
  }
  let offset = detectionPoint
  while (offset < text.length && lineTerminatorEnd(text, offset) === null) {
    offset = nextOffset(text, offset)
  }
  return [detectionPoint, offset]
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
 * The input of the parser of the diagram type `diagramType`, which
 * `detection` found in the source `opened`: its lexer starts where
 * detection left the text. Not public API: the tests read the source with
 * the same input.
 */
export function diagramInputOf(
  opened: OpenedSource,
  detection: Detection,
  diagramType: DiagramType,
): DiagramInput {
  return {
    lexer: opened.lexer,
    frontmatter: opened.frontmatter,
    diagramType,
    textStart: detection.positionReached,
    passed: detection.passed,
  }
}

/**
 * Parses Mermaid text into the tree of ast.md. Throws `ParseError` when the
 * input is rejected and `UnsupportedDiagramError` when the diagram type is
 * detected but not implemented yet.
 */
export function parse(text: string): Root {
  const opened = openSource(text)
  const { lines } = opened
  const detection = detectDiagram(opened.lexer)
  const { detected, detectionPoint, positionReached } = detection
  if (detected === null) {
    const range = detectionFailureRange(text, detectionPoint)
    throw new ParseError(
      "No diagram type detected",
      range,
      lines.location(range),
    )
  }
  if (detected === "---") {
    const range: Range = [positionReached, positionReached + 3]
    throw new ParseError(
      "Diagrams beginning with --- are not valid: the block is not frontmatter",
      range,
      lines.location(range),
    )
  }
  const input = diagramInputOf(opened, detection, detected)
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
    case "er":
      return parseErDiagram(input)
    case "gantt":
      return parseGanttDiagram(input)
    default:
      throw new UnsupportedDiagramError(detected)
  }
}
