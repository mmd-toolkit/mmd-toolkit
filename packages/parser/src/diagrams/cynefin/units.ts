import { COLON } from "../../code-points.ts"
import { CommonFormUnitLexer } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import { matchWord } from "../../scanning.ts"

/** diagrams/cynefin.md, Ordered units: fixed authored atoms and header components. */
type CynefinUnitName =
  "header-colon" | "header-bare" | "transition-arrow" | "domain-name" | "string"

/** Cynefin units and the reachable shared composite components. */
export type UnitName = CynefinUnitName | CommonFormUnitName

/** The lexer supplies every boundary used by the grammar. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/cynefin.md, Ordered units: one context with first-match priority. */
export class CynefinUnitLexer extends CommonFormUnitLexer<CynefinUnitName> {
  /** Rules 1-14: no longer alternatives, numeric terminals or general ID terminal. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readColonHeader(at) ||
      this.readBareHeader(at) ||
      this.readAtom(at, "-->", "transition-arrow") ||
      this.readPunctuation(at, COLON, ":") ||
      this.readAtom(at, "complex", "domain-name") ||
      this.readAtom(at, "complicated", "domain-name") ||
      this.readAtom(at, "clear", "domain-name") ||
      this.readAtom(at, "chaotic", "domain-name") ||
      this.readAtom(at, "confusion", "domain-name") ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
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

  /** Header-colon: attached colon without a following boundary, split at authored components. */
  private readColonHeader(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "cynefin-beta:")
    if (match === null) return false
    const colon = matchWord(this.reader, at, "cynefin-beta")!.end!
    this.addUnit("header-colon", at, colon)
    this.read(":", colon, match.end)
    return true
  }

  /** Header-bare: common whitespace, EOF or a percent pair must follow the word. */
  private readBareHeader(at: DiagramCharacter): boolean {
    const match = this.matchKeyword(at, "cynefin-beta")
    if (match === null) return false
    this.read("header-bare", at, match.end)
    return true
  }

  /** Fixed domains have no suffix boundary; the transition arrow remains indivisible. */
  private readAtom(
    at: DiagramCharacter,
    spelling: string,
    name: "domain-name" | "transition-arrow",
  ): boolean {
    const match = matchWord(this.reader, at, spelling)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }
}
