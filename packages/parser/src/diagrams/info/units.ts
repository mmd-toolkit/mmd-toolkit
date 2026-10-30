import { CommonFormUnitLexer } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"

/** diagrams/info.md, Ordered rules: composite forms split at component boundaries. */
export type UnitName = "showInfo" | "info" | CommonFormUnitName

/** One lexical component; the converted text is never an AST value. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/info.md, Lexical structure: apply the first complete rule at each position. */
export class InfoUnitLexer extends CommonFormUnitLexer<"showInfo" | "info"> {
  /** Ordered rules 1-10, tried again after every successful match. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readKeyword(at, "showInfo") ||
      this.readKeyword(at, "info") ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readNewline(at) ||
      this.readWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }
}
