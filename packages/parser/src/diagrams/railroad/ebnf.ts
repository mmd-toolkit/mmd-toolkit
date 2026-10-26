import type { DiagramCharacter } from "../../diagram-text.ts"
import type { RailroadExpression } from "../../ast/railroad.ts"
import { RailroadUnitLexer } from "./units.ts"
import { RailroadGrammar } from "./grammar.ts"

/** EBNF units: ISO comment, special sequence and YAML are the named longer alternatives. */
export class EbnfUnitLexer extends RailroadUnitLexer {
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readHeader(at, "railroad-ebnf-beta") ||
      this.readSymbol(at, "::=") ||
      this.readSymbol(at, "=") ||
      this.readSymbol(at, ";") ||
      this.readSymbol(at, "|") ||
      this.readSymbol(at, ",") ||
      this.readBlockComment(at, "(*", "*)") ||
      this.readSymbol(at, "(") ||
      this.readSymbol(at, ")") ||
      this.readSymbol(at, "[") ||
      this.readSymbol(at, "]") ||
      this.readSymbol(at, "{") ||
      this.readSymbol(at, "}") ||
      this.readSpecialSequence(at) ||
      this.readSymbol(at, "?") ||
      this.readSymbol(at, "*") ||
      this.readSymbol(at, "+") ||
      this.readYaml(at) ||
      this.readSymbol(at, "-") ||
      this.readMetadata(at) ||
      this.readName(at) ||
      this.readString(at, "string") ||
      this.readPadding(at) ||
      this.readHidden(at) ||
      this.readBlockComment(at, "/*", "*/")
    )
      return
    throw this.noRuleMatches(at)
  }
}

/** EBNF grammar: choice, optional-comma sequence, then left-folded postfix terms. */
export class EbnfGrammar extends RailroadGrammar {
  protected readonly dialect = "ebnf"

  protected override parseExpression(): RailroadExpression {
    return this.parseChoice("|")
  }

  protected override parseTerm(): RailroadExpression {
    let element = this.parsePrimary()
    for (;;) {
      const name = this.nameAfterHidden()
      if (name !== "?" && name !== "*" && name !== "+" && name !== "-")
        return element
      const textBeforeOperator = this.parseHidden()
      this.symbol(name)
      if (name === "-") {
        const textBeforeRight = this.parseHidden()
        const right = this.parsePrimary()
        element = {
          type: "RailroadExceptionExpression",
          left: element,
          textBeforeOperator,
          textBeforeRight,
          right,
          ...this.span(element, right),
        }
      } else
        element = {
          type: "RailroadPostfixExpression",
          element,
          textBeforeOperator,
          operator: name,
          ...this.throughPrevious(element),
        }
    }
  }

  protected override parsePrimary(): RailroadExpression {
    const unit = this.takeIf("special-sequence")
    if (unit !== null) {
      this.addItem("RawText", [unit])
      const place = this.placeOf([unit])
      return {
        type: "RailroadSpecialSequence",
        value: this.textOf([place.range[0] + 1, place.range[1] - 1]),
        ...place,
      }
    }
    return this.parseNaturalPrimary()
  }
}
