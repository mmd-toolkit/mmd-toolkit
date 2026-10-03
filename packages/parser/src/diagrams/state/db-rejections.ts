import type { Identifier, Range } from "../../ast.ts"
import type {
  StateAliasDefinitionStatement,
  StateLiteral,
  StateStatement,
} from "../../ast/state.ts"
import { isWhitespace } from "../../character-classes.ts"
import type { PendingToken } from "../../source-lexer.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"

/** What the walk keeps of one state: whether a visit gave it a description, how many descriptions it has, and the first statement that gave it a body. */
interface StateRecord {
  described: boolean
  descriptions: number
  body: Range | null
}

/**
 * diagrams/state.md, Rejections outside the grammar: the inputs that the
 * grammar accepts and mermaid.js rejects while it builds the Db. The
 * statements are walked in source order, a body where its statement
 * stands, and the walk keeps, for each state id, its descriptions and
 * whether it has a body (Building the summary from the tree, The walk). A
 * state with a body and more than one description is rejected, at the
 * statement that gave it its body. Two words between `state` and `{`, the
 * other rejection of the section, is made by the lexer.
 */
export class StateDbRejections {
  private readonly lines: LineIndex

  /** Building the summary from the tree, Ids: the id of each state in converted form. */
  private readonly stateIds: ReadonlyMap<Identifier | StateLiteral, string>

  /** The tokens of the diagram, for the `:` of an alias definition. */
  private readonly tokens: readonly PendingToken[]

  /** The source text, which the tokens are ranges of. */
  private readonly text: string

  /** The states seen so far, by id. */
  private readonly states = new Map<string, StateRecord>()

  public constructor(
    lines: LineIndex,
    stateIds: ReadonlyMap<Identifier | StateLiteral, string>,
    tokens: readonly PendingToken[],
    text: string,
  ) {
    this.lines = lines
    this.stateIds = stateIds
    this.tokens = tokens
    this.text = text
  }

  /** Walks `statements`, the body of the diagram; throws `ParseError` when a state with a body has more than one description. */
  public check(statements: readonly StateStatement[]): void {
    this.walk(statements)
    for (const record of this.states.values()) {
      if (record.body !== null && record.descriptions > 1) {
        throw new ParseError(
          "A composite state can have only one description",
          record.body,
          this.lines.location(record.body),
        )
      }
    }
  }

  /** The walk: the statements of a body, in order. */
  private walk(statements: readonly StateStatement[]): void {
    for (const statement of statements) this.apply(statement)
  }

  /** The walk: what one statement does to the descriptions and the bodies of its states. */
  private apply(statement: StateStatement): void {
    switch (statement.type) {
      case "StateDefinitionStatement":
        if (statement.reference.state.type === "Identifier") {
          this.visit(
            statement.reference.state,
            statement.description === null ? 0 : 1,
            null,
          )
        }
        return
      case "StateCompositeStatement":
        if (statement.id !== null && statement.body !== null) {
          this.visit(statement.id, 0, statement.range)
          this.walk(statement.body)
        }
        return
      case "StateAliasDefinitionStatement":
        if (statement.id !== null) {
          this.visit(
            statement.id,
            this.descriptionsOfAlias(statement),
            statement.body === null ? null : statement.range,
          )
        }
        if (statement.body !== null) this.walk(statement.body)
        return
      case "StateTransitionStatement":
      case "StatePseudostateDefinitionStatement":
      case "StateDividerStatement":
      case "StateNoteStatement":
      case "StateFloatingNoteStatement":
      case "StateClickStatement":
      case "StateClassDefStatement":
      case "StateClassStatement":
      case "StateStyleStatement":
      case "StateDirectionStatement":
      case "StateAccTitleStatement":
      case "StateAccDescrStatement":
      case "StateAccDescrBlockStatement":
      case "StateScaleStatement":
      case "StateHideEmptyDescriptionStatement":
      case "StateIgnoredStatement":
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * The walk: how many descriptions the alias definition `statement` gives:
   * with a body, its string; without one, its string and, after a `:`, the
   * second description, also when that is empty and has no node, which
   * the `:` token in the range of the statement shows; and none for a
   * string that is empty or all whitespace without a `:`.
   */
  private descriptionsOfAlias(
    statement: StateAliasDefinitionStatement,
  ): number {
    if (statement.body !== null) return 1
    const [start, end] = statement.range
    const hasColon = this.tokens.some(
      (token) =>
        token.kind === "Punctuator" &&
        start <= token.range[0] &&
        token.range[1] <= end &&
        this.text.slice(token.range[0], token.range[1]) === ":",
    )
    if (hasColon) return 2
    const blank = [...statement.description.value].every((character) =>
      isWhitespace(character.codePointAt(0) ?? 0),
    )
    return blank ? 0 : 1
  }

  /**
   * The walk: a visit of the state named by `name` with `descriptions`
   * descriptions, and the range of the statement that gives it a body, if
   * it does. A description replaces the id when the state has had none,
   * and is added after the others otherwise.
   */
  private visit(
    name: Identifier | StateLiteral,
    descriptions: number,
    body: Range | null,
  ): void {
    const id = this.stateIds.get(name)
    if (id === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: the state at ${name.range[0]} has no id`,
      )
    }
    const record = this.states.get(id) ?? {
      described: false,
      descriptions: 1,
      body: null,
    }
    for (let count = 0; count < descriptions; count += 1) {
      if (record.described) record.descriptions += 1
      record.described = true
    }
    record.body ??= body
    this.states.set(id, record)
  }
}
