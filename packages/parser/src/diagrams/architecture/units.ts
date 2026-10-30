import { isWordCharacter } from "../../character-classes.ts"
import {
  COLON,
  HYPHEN_MINUS,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LESS_THAN_SIGN,
  GREATER_THAN_SIGN,
  LINE_FEED,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
} from "../../code-points.ts"
import { CommonFormUnitLexer } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import { isCodePointAt, matchWord, samePosition } from "../../scanning.ts"

/** diagrams/architecture.md, Ordered rules: authored components of complete matches. */
type ArchitectureUnitName =
  | "architecture-beta"
  | "junction"
  | "service"
  | "column"
  | "group"
  | "align"
  | "row"
  | "--"
  | "in"
  | "-"
  | "port-direction"
  | "arrow-marker"
  | "string"
  | "("
  | "icon-name"
  | ")"
  | "["
  | "label-string"
  | "label-text"
  | "]"

/** Diagram-specific units and the shared composite common forms. */
export type UnitName = ArchitectureUnitName | CommonFormUnitName

/** Each component keeps its common converted spelling. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/architecture.md, Ordered rules: one lexical context, first complete match. */
export class ArchitectureUnitLexer extends CommonFormUnitLexer<ArchitectureUnitName> {
  /** Rules 1-26 are tried in their stated priority order at every position. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readWord(at, "architecture-beta") ||
      this.readWord(at, "junction") ||
      this.readWord(at, "service") ||
      this.readWord(at, "column") ||
      this.readWord(at, "group") ||
      this.readWord(at, "align") ||
      this.readWord(at, "row") ||
      this.readDash(at, "--") ||
      this.readWord(at, "in") ||
      this.readPunctuation(at, COLON, ":") ||
      this.readDash(at, "-") ||
      this.readDirection(at) ||
      this.readGroupModifier(at) ||
      this.readMarker(at) ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readString(at, "string") ||
      this.readId(at) ||
      this.readNewline(at) ||
      this.readWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at) ||
      this.readIcon(at) ||
      this.readLabel(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Both dash rules prefer a complete longer YAML form; -- stays indivisible. */
  private readDash(at: DiagramCharacter, word: "--" | "-"): boolean {
    const match = matchWord(this.reader, at, word)
    if (match === null) return false
    if (!this.readYaml(at)) this.read(word, at, match.end)
    return true
  }

  /** Port-direction takes one L/R/T/B without a name boundary. */
  private readDirection(at: DiagramCharacter): boolean {
    if (!["L", "R", "T", "B"].includes(String.fromCodePoint(at.codePoint)))
      return false
    this.read("port-direction", at, this.reader.after(at))
    return true
  }

  /** {group} is a complete match with three indivisible authored components. */
  private readGroupModifier(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "{group}")
    if (match === null) return false
    const group = this.reader.after(at)!
    const close = matchWord(this.reader, group, "group")!.end!
    this.addUnit("{", at, group)
    this.addUnit("group", group, close)
    this.read("}", close, match.end)
    return true
  }

  /** Either marker spelling is accepted at either arrow end. */
  private readMarker(at: DiagramCharacter): boolean {
    if (at.codePoint !== LESS_THAN_SIGN && at.codePoint !== GREATER_THAN_SIGN)
      return false
    this.read("arrow-marker", at, this.reader.after(at))
    return true
  }

  /** Icons: parentheses around a nonempty ASCII word/dash/colon name. */
  private readIcon(at: DiagramCharacter): boolean {
    if (at.codePoint !== LEFT_PARENTHESIS) return false
    const name = this.reader.after(at)
    let close = name
    while (
      close !== null &&
      (isWordCharacter(close.codePoint) ||
        close.codePoint === HYPHEN_MINUS ||
        close.codePoint === COLON)
    )
      close = this.reader.after(close)
    if (
      name === null ||
      samePosition(name, close) ||
      !isCodePointAt(close, RIGHT_PARENTHESIS)
    )
      return false
    this.addUnit("(", at, name)
    this.addUnit("icon-name", name, close)
    this.read(")", close, this.reader.after(close))
    return true
  }

  /** Labels: complete double/single quoted alternative first, then maximal nonempty bare content. */
  private readLabel(at: DiagramCharacter): boolean {
    if (at.codePoint !== LEFT_SQUARE_BRACKET) return false
    const content = this.reader.after(at)
    if (content === null) return false
    const quoted = this.matchString(content)
    let close = quoted?.end ?? null
    let kind: "label-string" | "label-text" = "label-string"
    if (!isCodePointAt(close, RIGHT_SQUARE_BRACKET)) {
      kind = "label-text"
      close = content
      while (
        close !== null &&
        close.codePoint !== LEFT_SQUARE_BRACKET &&
        close.codePoint !== RIGHT_SQUARE_BRACKET &&
        close.codePoint !== LINE_FEED
      )
        close = this.reader.after(close)
      if (
        samePosition(content, close) ||
        !isCodePointAt(close, RIGHT_SQUARE_BRACKET)
      )
        return false
    }
    this.addUnit("[", at, content)
    this.addUnit(kind, content, close, "keep-whitespace")
    this.read("]", close, this.reader.after(close))
    return true
  }
}
