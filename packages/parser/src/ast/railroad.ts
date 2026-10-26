import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/railroad.md, RailroadDiagram: authored source structure.
 *
 * ```text
 * railroad-beta
 * ^^^^^^^^^^^^^
 * title "Syntax"
 * ^^^^^^^^^^^^^^
 * accTitle: Rules
 * ^^^^^^^^^^^^^^^
 * accDescr: Short
 * ^^^^^^^^^^^^^^^
 * accDescr {}
 * ^^^^^^^^^^^
 * accDescr { Details }
 * ^^^^^^^^^^^^^^^^^^^^
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadDiagram extends NodeBase {
  readonly type: "RailroadDiagram"
  /** Retained native pre-header forms. */
  readonly textBeforeHeader: readonly RailroadIgnoredText[]
  /** All written statements and body hidden forms. */
  readonly body: readonly RailroadBodyItem[]
}

/**
 * ast/railroad.md, RailroadRule: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadRule extends NodeBase {
  readonly type: "RailroadRule"
  /** Authored declaration name. */
  readonly name: Identifier
  /** Forms between name and assignment. */
  readonly textBeforeOperator: readonly RailroadIgnoredText[]
  /** Forms after assignment. */
  readonly textBeforeDefinition: readonly RailroadIgnoredText[]
  /** The complete authored expression. */
  readonly definition: RailroadExpression
  /** Forms before the visible semicolon. */
  readonly textBeforeTerminator: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadTitleStatement: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * ^^^^^^^^^^^^^^
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 * ```
 */
export interface RailroadTitleStatement extends NodeBase {
  readonly type: "RailroadTitleStatement"
  /** Authored common-value text. */
  readonly value: RailroadLiteral | null
}

/**
 * ast/railroad.md, RailroadAccTitleStatement: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * ^^^^^^^^^^^^^^^
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 * ```
 */
export interface RailroadAccTitleStatement extends NodeBase {
  readonly type: "RailroadAccTitleStatement"
  /** Authored common-value text. */
  readonly value: RailroadLiteral | null
}

/**
 * ast/railroad.md, RailroadAccDescrStatement: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * ^^^^^^^^^^^^^^^
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 * ```
 */
export interface RailroadAccDescrStatement extends NodeBase {
  readonly type: "RailroadAccDescrStatement"
  /** Authored common-value text. */
  readonly value: RailroadLiteral | null
}

/**
 * ast/railroad.md, RailroadAccDescrBlockStatement: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * ^^^^^^^^^^^
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 * ```
 */
export interface RailroadAccDescrBlockStatement extends NodeBase {
  readonly type: "RailroadAccDescrBlockStatement"
  /** Authored common-value text. */
  readonly value: RailroadLiteral | null
}

/**
 * ast/railroad.md, RailroadLiteral: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 *       ^^^^^^^^
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 * ```
 */
export interface RailroadLiteral extends NodeBase {
  readonly type: "RailroadLiteral"
  /** Written metadata text. */
  readonly value: string
}

/**
 * ast/railroad.md, RailroadIgnoredText: authored source structure.
 *
 * ```text
 * railroad-beta
 * r = terminal("a");
 * ---
 * ^^^
 * x
 * ^
 * ---
 * ^^^
 * ```
 */
export interface RailroadIgnoredText extends NodeBase {
  readonly type: "RailroadIgnoredText"
  /** yaml-block or directive. */
  readonly kind: string
  /** Nonempty authored form including fences. */
  readonly value: string
}

/**
 * ast/railroad.md, RailroadExpressionMember: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                 ^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadExpressionMember extends NodeBase {
  readonly type: "RailroadExpressionMember"
  /** Forms before this expression within its list. */
  readonly textBefore: readonly RailroadIgnoredText[]
  /** The authored member expression. */
  readonly expression: RailroadExpression
  /** Forms after this expression within its list. */
  readonly textAfter: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadSequenceCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadSequenceCall extends NodeBase {
  readonly type: "RailroadSequenceCall"
  /** Forms between constructor and opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** One or more authored IR arguments. */
  readonly arguments: readonly RailroadExpressionMember[]
}

/**
 * ast/railroad.md, RailroadChoiceCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadChoiceCall extends NodeBase {
  readonly type: "RailroadChoiceCall"
  /** Forms between constructor and opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** One or more authored IR arguments. */
  readonly arguments: readonly RailroadExpressionMember[]
}

/**
 * ast/railroad.md, RailroadOptionalCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                                                                               ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadOptionalCall extends NodeBase {
  readonly type: "RailroadOptionalCall"
  /** Forms before the opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** Forms after the opening parenthesis. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** The single authored IR operand. */
  readonly element: RailroadExpression
  /** Forms before the closing parenthesis. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadOneOrMoreCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                                                                                                                                   ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadOneOrMoreCall extends NodeBase {
  readonly type: "RailroadOneOrMoreCall"
  /** Forms before the opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** Forms after the opening parenthesis. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** The single authored IR operand. */
  readonly element: RailroadExpression
  /** Forms before the closing parenthesis. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadZeroOrMoreCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                                                                                                        ^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadZeroOrMoreCall extends NodeBase {
  readonly type: "RailroadZeroOrMoreCall"
  /** Forms before the opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** Forms after the opening parenthesis. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** The single authored IR operand. */
  readonly element: RailroadExpression
  /** Forms before the closing parenthesis. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadTerminalCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                 ^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadTerminalCall extends NodeBase {
  readonly type: "RailroadTerminalCall"
  /** Forms before the opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** Forms before the quoted argument. */
  readonly textBeforeValue: readonly RailroadIgnoredText[]
  /** The single quoted argument, including an empty string. */
  readonly value: StringLiteral
  /** Forms before the closing parenthesis. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadNonterminalCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                                  ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadNonterminalCall extends NodeBase {
  readonly type: "RailroadNonterminalCall"
  /** Forms before the opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** Forms before the quoted argument. */
  readonly textBeforeName: readonly RailroadIgnoredText[]
  /** The single quoted argument, including an empty string. */
  readonly name: StringLiteral
  /** Forms before the closing parenthesis. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadSpecialCall: authored source structure.
 *
 * ```text
 * railroad-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
 *                                                              ^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadSpecialCall extends NodeBase {
  readonly type: "RailroadSpecialCall"
  /** Forms before the opening parenthesis. */
  readonly textBeforeOpen: readonly RailroadIgnoredText[]
  /** Forms before the quoted argument. */
  readonly textBeforeText: readonly RailroadIgnoredText[]
  /** The single quoted argument, including an empty string. */
  readonly text: StringLiteral
  /** Forms before the closing parenthesis. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadChoiceExpression: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadChoiceExpression extends NodeBase {
  readonly type: "RailroadChoiceExpression"
  /** Two or more authored alternatives. */
  readonly alternatives: readonly RailroadExpressionMember[]
}

/**
 * ast/railroad.md, RailroadSequenceExpression: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *           ^^^^^^^^^
 * ```
 */
export interface RailroadSequenceExpression extends NodeBase {
  readonly type: "RailroadSequenceExpression"
  /** Two or more authored sequence elements. */
  readonly elements: readonly RailroadExpressionMember[]
}

/**
 * ast/railroad.md, RailroadGroupExpression: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *          ^^^^^^^^^^^
 * ```
 */
export interface RailroadGroupExpression extends NodeBase {
  readonly type: "RailroadGroupExpression"
  /** Forms after the opener. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** The complete nonempty inner expression. */
  readonly element: RailroadExpression
  /** Forms before the closer. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadOptionalGroupExpression: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *                               ^^^^^
 * ```
 */
export interface RailroadOptionalGroupExpression extends NodeBase {
  readonly type: "RailroadOptionalGroupExpression"
  /** Forms after the opener. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** The complete nonempty inner expression. */
  readonly element: RailroadExpression
  /** Forms before the closer. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadRepetitionGroupExpression: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *                                     ^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadRepetitionGroupExpression extends NodeBase {
  readonly type: "RailroadRepetitionGroupExpression"
  /** Forms after the opener. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** The complete nonempty inner expression. */
  readonly element: RailroadExpression
  /** Forms before the closer. */
  readonly textBeforeClose: readonly RailroadIgnoredText[]
}

/**
 * ast/railroad.md, RailroadPostfixExpression: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *          ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadPostfixExpression extends NodeBase {
  readonly type: "RailroadPostfixExpression"
  /** The preceding operand. */
  readonly element: RailroadExpression
  /** Forms before the postfix symbol. */
  readonly textBeforeOperator: readonly RailroadIgnoredText[]
  /** One of ?, * or +. */
  readonly operator: string
}

/**
 * ast/railroad.md, RailroadExceptionExpression: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *          ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadExceptionExpression extends NodeBase {
  readonly type: "RailroadExceptionExpression"
  /** The preceding EBNF term expression. */
  readonly left: RailroadExpression
  /** Forms before the minus. */
  readonly textBeforeOperator: readonly RailroadIgnoredText[]
  /** Forms after the minus. */
  readonly textBeforeRight: readonly RailroadIgnoredText[]
  /** An EBNF primary only. */
  readonly right: RailroadExpression
}

/**
 * ast/railroad.md, RailroadSpecialSequence: authored source structure.
 *
 * ```text
 * railroad-ebnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
 *                                       ^^^^^^^^^^^
 * ```
 */
export interface RailroadSpecialSequence extends NodeBase {
  readonly type: "RailroadSpecialSequence"
  /** Authored interior without the two question marks. */
  readonly value: string
}

/**
 * ast/railroad.md, RailroadRepeatExpression: authored source structure.
 *
 * ```text
 * railroad-abnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = 002*004("a" / %X41.42-43) [other] 0*1"" 3"x" *"z";
 *        ^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RailroadRepeatExpression extends NodeBase {
  readonly type: "RailroadRepeatExpression"
  /** The authored exact count or starred form. */
  readonly repeat: NumericLiteral | RailroadRepeatRange
  /** Forms after the complete repeat. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** One ABNF primary. */
  readonly element: RailroadExpression
}

/**
 * ast/railroad.md, RailroadRepeatRange: authored source structure.
 *
 * ```text
 * railroad-abnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = 002*004("a" / %X41.42-43) [other] 0*1"" 3"x" *"z";
 *        ^^^^^^^
 * ```
 */
export interface RailroadRepeatRange extends NodeBase {
  readonly type: "RailroadRepeatRange"
  /** The written lower count, null when omitted. */
  readonly minimum: NumericLiteral | null
  /** The written upper count, null when omitted. */
  readonly maximum: NumericLiteral | null
}

/**
 * ast/railroad.md, RailroadNumericValue: authored source structure.
 *
 * ```text
 * railroad-abnf-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item = 002*004("a" / %X41.42-43) [other] 0*1"" 3"x" *"z";
 *                      ^^^^^^^^^^
 * ```
 */
export interface RailroadNumericValue extends NodeBase {
  readonly type: "RailroadNumericValue"
  /** The complete authored percent-value text. */
  readonly value: string
}

/**
 * ast/railroad.md, RailroadPredicateExpression: authored source structure.
 *
 * ```text
 * railroad-peg-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item <- &("a" / ref)+ !. "b"? "c"* (("d"));
 *         ^^^^^^^^^^^^^
 * ```
 */
export interface RailroadPredicateExpression extends NodeBase {
  readonly type: "RailroadPredicateExpression"
  /** & or !. */
  readonly operator: string
  /** Forms after the prefix symbol. */
  readonly textBeforeElement: readonly RailroadIgnoredText[]
  /** The full PEG suffix operand. */
  readonly element: RailroadExpression
}

/**
 * ast/railroad.md, RailroadAnyExpression: authored source structure.
 *
 * ```text
 * railroad-peg-beta
 * title "Syntax"
 * accTitle: Rules
 * accDescr: Short
 * accDescr {}
 * accDescr { Details }
 * item <- &("a" / ref)+ !. "b"? "c"* (("d"));
 *                        ^
 * ```
 */
export interface RailroadAnyExpression extends NodeBase {
  readonly type: "RailroadAnyExpression"
}

/** Expressions admitted by the selected dialect; range/member nodes are children only. */
export type RailroadExpression =
  | Identifier
  | StringLiteral
  | RailroadSequenceCall
  | RailroadChoiceCall
  | RailroadOptionalCall
  | RailroadOneOrMoreCall
  | RailroadZeroOrMoreCall
  | RailroadTerminalCall
  | RailroadNonterminalCall
  | RailroadSpecialCall
  | RailroadChoiceExpression
  | RailroadSequenceExpression
  | RailroadGroupExpression
  | RailroadOptionalGroupExpression
  | RailroadRepetitionGroupExpression
  | RailroadPostfixExpression
  | RailroadExceptionExpression
  | RailroadRepeatExpression
  | RailroadPredicateExpression
  | RailroadAnyExpression
  | RailroadSpecialSequence
  | RailroadNumericValue

/** Every written statement and native hidden form, in source order. */
export type RailroadBodyItem =
  | RailroadRule
  | RailroadTitleStatement
  | RailroadAccTitleStatement
  | RailroadAccDescrStatement
  | RailroadAccDescrBlockStatement
  | RailroadIgnoredText

/** All thirty node types of ast/railroad.md, in document order. */
export type RailroadNode =
  | RailroadDiagram
  | RailroadRule
  | RailroadTitleStatement
  | RailroadAccTitleStatement
  | RailroadAccDescrStatement
  | RailroadAccDescrBlockStatement
  | RailroadLiteral
  | RailroadIgnoredText
  | RailroadExpressionMember
  | RailroadSequenceCall
  | RailroadChoiceCall
  | RailroadOptionalCall
  | RailroadOneOrMoreCall
  | RailroadZeroOrMoreCall
  | RailroadTerminalCall
  | RailroadNonterminalCall
  | RailroadSpecialCall
  | RailroadChoiceExpression
  | RailroadSequenceExpression
  | RailroadGroupExpression
  | RailroadOptionalGroupExpression
  | RailroadRepetitionGroupExpression
  | RailroadPostfixExpression
  | RailroadExceptionExpression
  | RailroadSpecialSequence
  | RailroadRepeatExpression
  | RailroadRepeatRange
  | RailroadNumericValue
  | RailroadPredicateExpression
  | RailroadAnyExpression
