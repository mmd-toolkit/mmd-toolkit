import type { Range, Root } from "../../src/index.ts"
import type { Unit } from "../../src/diagrams/flowchart/units.ts"
import type { DiagramTextReader } from "../../src/diagram-text.ts"
import { lexFlowchart } from "../../src/diagrams/flowchart/index.ts"
import { openSource } from "../../src/parse.ts"
import type { SourceLexer } from "../../src/source-lexer.ts"

/**
 * Test helper, not public API: the source of a flowchart as the parser
 * reads it, with the shared lexer and the units of diagrams/flowchart.md,
 * Lexical structure. The helpers that read the source again take every
 * lexical decision from here: where a string's content lies and which
 * `click` is a `click` unit.
 */
export class FlowchartSource {
  public readonly lexer: SourceLexer

  /** The diagram text, which the units were read from. */
  public readonly diagramText: DiagramTextReader

  /** The units of the diagram text, in source order. */
  public readonly units: readonly Unit[]

  /** Click and callbacks: the whitespace characters with which the lexer left a click context. */
  public readonly clickContextExits: readonly Range[]

  public constructor(text: string, root: Root) {
    const { lexer, frontmatter } = openSource(text)
    this.lexer = lexer
    const { text: diagramText, ...lexing } = lexFlowchart({
      lexer,
      frontmatter,
      diagramType: root.diagramType,
    })
    this.diagramText = diagramText
    this.units = lexing.units
    this.clickContextExits = lexing.clickContextExits
  }

  /** The units that start in `range`. */
  public unitsIn(range: Range): Unit[] {
    return this.units.filter(
      (unit) => range[0] <= unit.start && unit.start < range[1],
    )
  }

  /**
   * Strings: what the value of the node with the range `range` leaves out
   * of it: the delimiters of the string or markdown string that is the
   * first unit in it, around its content (Subgraphs). None when the node
   * does not start with a string.
   */
  public stringDelimitersIn(range: Range): Range[] {
    const [first] = this.unitsIn(range)
    if (first?.content == null) return []
    return [
      [first.start, first.content[0]],
      [first.content[1], first.end],
    ]
  }
}
