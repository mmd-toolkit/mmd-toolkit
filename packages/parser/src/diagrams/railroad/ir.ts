import type { DiagramCharacter } from "../../diagram-text.ts"
import type { RailroadExpression } from "../../ast/railroad.ts"
import { RailroadUnitLexer } from "./units.ts"
import { RailroadGrammar } from "./grammar.ts"

/** IR units, in their stated first-match order, with only explicit longer alternatives. */
export class IrUnitLexer extends RailroadUnitLexer {
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readHeader(at, "railroad-beta") ||
      this.readConstructor(at, "nonterminal") ||
      this.readConstructor(at, "zeroOrMore") ||
      this.readConstructor(at, "oneOrMore") ||
      this.readConstructor(at, "sequence") ||
      this.readConstructor(at, "optional") ||
      this.readConstructor(at, "terminal") ||
      this.readConstructor(at, "special") ||
      this.readConstructor(at, "choice") ||
      this.readSymbol(at, "=") ||
      this.readSymbol(at, ";") ||
      this.readSymbol(at, "(") ||
      this.readSymbol(at, ",") ||
      this.readSymbol(at, ")") ||
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

/** IR grammar: eight authored constructors, with no bare expression leaves. */
export class IrGrammar extends RailroadGrammar {
  protected readonly dialect = "ir"

  protected override parseExpression(): RailroadExpression {
    const start = this.next
    const keyword = this.peek()?.name
    if (
      keyword !== "sequence" &&
      keyword !== "choice" &&
      keyword !== "optional" &&
      keyword !== "oneOrMore" &&
      keyword !== "zeroOrMore" &&
      keyword !== "terminal" &&
      keyword !== "nonterminal" &&
      keyword !== "special"
    )
      throw this.unexpected(this.peek())
    this.addItem("Keyword", [this.take(keyword)])
    const textBeforeOpen = this.parseHidden()
    this.symbol("(")
    if (keyword === "sequence" || keyword === "choice") {
      const args = []
      for (;;) {
        const before = this.parseHidden()
        const expression = this.parseExpression()
        const after = this.parseHidden()
        args.push(this.member(expression, before, after))
        if (this.peek()?.name !== ",") break
        this.symbol(",")
      }
      this.symbol(")")
      return {
        type:
          keyword === "sequence"
            ? "RailroadSequenceCall"
            : "RailroadChoiceCall",
        textBeforeOpen,
        arguments: args,
        ...this.placeFrom(start),
      }
    }
    const before = this.parseHidden()
    if (
      keyword === "terminal" ||
      keyword === "nonterminal" ||
      keyword === "special"
    ) {
      const value = this.closedStringLiteralOf(this.take("string"))
      const textBeforeClose = this.parseHidden()
      this.symbol(")")
      const place = this.placeFrom(start)
      if (keyword === "terminal")
        return {
          type: "RailroadTerminalCall",
          textBeforeOpen,
          textBeforeValue: before,
          value,
          textBeforeClose,
          ...place,
        }
      if (keyword === "nonterminal")
        return {
          type: "RailroadNonterminalCall",
          textBeforeOpen,
          textBeforeName: before,
          name: value,
          textBeforeClose,
          ...place,
        }
      return {
        type: "RailroadSpecialCall",
        textBeforeOpen,
        textBeforeText: before,
        text: value,
        textBeforeClose,
        ...place,
      }
    }
    const element = this.parseExpression()
    const textBeforeClose = this.parseHidden()
    this.symbol(")")
    return {
      type:
        keyword === "optional"
          ? "RailroadOptionalCall"
          : keyword === "oneOrMore"
            ? "RailroadOneOrMoreCall"
            : "RailroadZeroOrMoreCall",
      textBeforeOpen,
      textBeforeElement: before,
      element,
      textBeforeClose,
      ...this.placeFrom(start),
    }
  }
}
