import type { DiagramCharacter } from "../../diagram-text.ts"
import type { RailroadExpression } from "../../ast/railroad.ts"
import { RailroadUnitLexer } from "./units.ts"
import { RailroadGrammar } from "./grammar.ts"

/** PEG units, with the assignment kept whole and all prefix/postfix symbols separate. */
export class PegUnitLexer extends RailroadUnitLexer {
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readHeader(at, "railroad-peg-beta") ||
      this.readSymbol(at, "<-") ||
      this.readSymbol(at, ";") ||
      this.readSymbol(at, "/") ||
      this.readSymbol(at, "&") ||
      this.readSymbol(at, "!") ||
      this.readSymbol(at, "?") ||
      this.readSymbol(at, "*") ||
      this.readSymbol(at, "+") ||
      this.readSymbol(at, "(") ||
      this.readSymbol(at, ")") ||
      this.readSymbol(at, ".") ||
      this.readMetadata(at) ||
      this.readName(at) ||
      this.readString(at, "string") ||
      this.readPadding(at) ||
      this.readHidden(at) ||
      this.readLineComment(at, "#")
    )
      return
    throw this.noRuleMatches(at)
  }
}

/** PEG grammar: one suffix binds inside one optional predicate prefix. */
export class PegGrammar extends RailroadGrammar {
  protected readonly dialect = "peg"

  protected override parseExpression(): RailroadExpression {
    return this.parseChoice("/")
  }

  protected override parseTerm(): RailroadExpression {
    const prefix = this.takeIf("&") ?? this.takeIf("!")
    if (prefix !== null) this.addItem("Punctuator", [prefix])
    const textBeforeElement = prefix === null ? [] : this.parseHidden()
    let element = this.parsePrimary()
    const name = this.nameAfterHidden()
    if (name === "?" || name === "*" || name === "+") {
      const textBeforeOperator = this.parseHidden()
      this.symbol(name)
      element = {
        type: "RailroadPostfixExpression",
        element,
        textBeforeOperator,
        operator: name,
        ...this.throughPrevious(element),
      }
    }
    return prefix === null
      ? element
      : {
          type: "RailroadPredicateExpression",
          operator: prefix.name,
          textBeforeElement,
          element,
          ...this.span(this.placeOf([prefix]), element),
        }
  }

  protected override parsePrimary(): RailroadExpression {
    const dot = this.takeIf(".")
    if (dot === null) return this.parseNaturalPrimary()
    this.addItem("Punctuator", [dot])
    return { type: "RailroadAnyExpression", ...this.placeOf([dot]) }
  }
}
