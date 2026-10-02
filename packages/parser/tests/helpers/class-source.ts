import type { Range, Root } from "../../src/index.ts"
import type { DiagramTextReader } from "../../src/diagram-text.ts"
import { lexClass } from "../../src/diagrams/class/index.ts"
import type {
  ClassLexing,
  MemberLine,
  Unit,
} from "../../src/diagrams/class/units.ts"
import { openSource } from "../../src/parse.ts"
import type { SourceLexer } from "../../src/source-lexer.ts"

/**
 * Test helper, not public API: the source of a class diagram as the parser
 * reads it, with the shared lexer and the units of diagrams/class.md,
 * Lexical structure. The helpers that read the source again take every
 * lexical decision from here.
 */
export class ClassSource {
  public readonly lexer: SourceLexer

  /** The diagram text, which the units were read from. */
  public readonly diagramText: DiagramTextReader

  /** The units of the diagram text, in source order. */
  public readonly units: readonly Unit[]

  /** Members and annotations: the units of the member line of a label (see `ClassLexing`). */
  private readonly memberLineOfLabel: ClassLexing["memberLineOfLabel"]

  public constructor(text: string, root: Root) {
    const { lexer, frontmatter } = openSource(text)
    this.lexer = lexer
    const {
      text: diagramText,
      units,
      memberLineOfLabel,
    } = lexClass({
      lexer,
      frontmatter,
      diagramType: root.diagramType,
    })
    this.diagramText = diagramText
    this.units = units
    this.memberLineOfLabel = memberLineOfLabel
  }

  /**
   * Member lines: the member line of the member whose range is `range`: a
   * line of a class body, whose units are among the units of the diagram
   * text, or the text of the label of a member statement, which the lexer
   * divides as a member line when it is asked for it.
   */
  public memberLineAt(range: Range): MemberLine {
    const inBody = this.units.find(
      (unit) =>
        unit.memberLine !== null &&
        unit.significantRange !== null &&
        range[0] <= unit.significantRange[0] &&
        unit.significantRange[1] <= range[1],
    )?.memberLine
    if (inBody !== undefined && inBody !== null) return inBody
    const label = this.units.find(
      (unit) =>
        unit.name === "label" && unit.start <= range[0] && range[1] <= unit.end,
    )
    const line =
      label === undefined ? undefined : this.memberLineOfLabel(label)[0]
    if (line?.memberLine === undefined || line.memberLine === null) {
      throw new Error(`no member line at ${range[0]}`)
    }
    return line.memberLine
  }

  /**
   * The units that start inside `range`, in source order: the units of the
   * node whose range it is. A unit may end after the range, with the
   * whitespace at its end.
   */
  public unitsIn(range: Range): Unit[] {
    return this.units.filter(
      (unit) => range[0] <= unit.start && unit.start < range[1],
    )
  }
}
