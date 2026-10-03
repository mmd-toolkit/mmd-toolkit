import type { Range, Root } from "../../src/index.ts"
import type { DiagramTextReader } from "../../src/diagram-text.ts"
import { lexState } from "../../src/diagrams/state/index.ts"
import type { Unit, UnitName } from "../../src/diagrams/state/units.ts"
import { openSource } from "../../src/parse.ts"
import type { SourceLexer } from "../../src/source-lexer.ts"

/**
 * Test helper, not public API: the source of a state diagram as the parser
 * reads it, with the shared lexer and the units of diagrams/state.md,
 * Lexical structure. The helpers that read the source again take every
 * lexical decision from here.
 */
export class StateSource {
  public readonly lexer: SourceLexer

  /** The diagram text, which the units were read from. */
  public readonly diagramText: DiagramTextReader

  /** The units of the diagram text, in source order. */
  public readonly units: readonly Unit[]

  public constructor(text: string, root: Root) {
    const { lexer, frontmatter } = openSource(text)
    this.lexer = lexer
    const { text: diagramText, units } = lexState({
      lexer,
      frontmatter,
      diagramType: root.diagramType,
    })
    this.diagramText = diagramText
    this.units = units
  }

  /**
   * The classDef, class, and style contexts: the parts of the text that the
   * styles context reads after the unit `before`, divided at its `,`
   * units: for each part, its `style-text` unit, or null when the part is
   * empty or all whitespace. A text without units has no parts.
   */
  public stylePartsAfter(before: Unit): (Unit | null)[] {
    const parts: (Unit | null)[] = []
    let part: Unit | null = null
    let index = before.index + 1
    for (; index < this.units.length; index += 1) {
      const unit = this.units[index]
      if (unit.name === "style-text") part = unit
      else if (unit.name === ",") {
        parts.push(part)
        part = null
      } else break
    }
    if (index === before.index + 1) return []
    parts.push(part)
    return parts
  }

  /**
   * The style context: the last unit of the ids after the `style` unit
   * `style`, the `id` and `,` units that follow one another with nothing
   * between them.
   */
  public lastIdUnitAfter(style: Unit): Unit {
    let last = this.units[style.index + 1]
    for (
      let next = this.units.at(last.index + 1);
      next !== undefined &&
      (next.name === "id" || next.name === ",") &&
      next.start === last.end;
      next = this.units.at(next.index + 1)
    ) {
      last = next
    }
    return last
  }

  /**
   * The unit named `name` that starts inside `range`, the range of the
   * statement that it belongs to; null when there is none.
   */
  public unitIn(range: Range, name: UnitName): Unit | null {
    return (
      this.units.find(
        (unit) =>
          unit.name === name && range[0] <= unit.start && unit.start < range[1],
      ) ?? null
    )
  }
}
