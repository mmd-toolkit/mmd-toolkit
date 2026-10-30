import { COLON, HYPHEN_MINUS, PLUS_SIGN } from "../../code-points.ts"
import { CommonFormUnitLexer } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"

/** diagrams/packet.md, Ordered rules, split only at authored component boundaries. */
export type UnitName =
  | "packet-beta"
  | "packet"
  | "range-dash"
  | "relative-plus"
  | "integer"
  | "string"
  | CommonFormUnitName

/** Each unit keeps its converted spelling for numeric interpretation. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/packet.md, Lexical structure: one context; the first matching rule wins. */
export class PacketUnitLexer extends CommonFormUnitLexer<
  | "packet-beta"
  | "packet"
  | "range-dash"
  | "relative-plus"
  | "integer"
  | "string"
> {
  /** Ordered rules 1-15, restarted after each successful match. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readKeyword(at, "packet-beta", "unchecked") ||
      this.readKeyword(at, "packet") ||
      this.readRangeDash(at) ||
      this.readPunctuation(at, PLUS_SIGN, "relative-plus") ||
      this.readPunctuation(at, COLON, ":") ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readInteger(at, "integer") ||
      this.readString(at, "string") ||
      this.readNewline(at) ||
      this.readWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Rule 3: a complete hidden YAML match wins over its first range dash. */
  private readRangeDash(at: DiagramCharacter): boolean {
    if (at.codePoint !== HYPHEN_MINUS) return false
    return (
      this.readYaml(at) || this.readPunctuation(at, HYPHEN_MINUS, "range-dash")
    )
  }
}
