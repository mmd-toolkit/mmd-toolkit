import type { DiagramType, Location, Range } from "./ast.ts"

/** Thrown by `parse()` when the input is rejected. */
export class ParseError extends SyntaxError {
  public override readonly name: string = "ParseError"

  /** The offset where the error was found, in UTF-16 code units; equal to `range[0]`. */
  public readonly index: number

  /** The source the error is about. */
  public readonly range: Range

  /** The same place as lines and columns. */
  public readonly loc: Location

  public constructor(message: string, range: Range, loc: Location) {
    super(message)
    this.index = range[0]
    this.range = range
    this.loc = loc
  }
}

/**
 * Thrown by `parse()` when the diagram type was detected but this parser
 * does not implement it yet.
 */
export class UnsupportedDiagramError extends Error {
  public override readonly name: string = "UnsupportedDiagramError"

  /** The detected diagram type. */
  public readonly diagramType: DiagramType

  public constructor(diagramType: DiagramType) {
    super(`Diagram type "${diagramType}" is not supported yet`)
    this.diagramType = diagramType
  }
}
