import type { Identifier, Range } from "../../ast.ts"
import type {
  StateAliasDefinitionStatement,
  StateDividerStatement,
  StateLiteral,
  StateStatement,
  StateTerminal,
} from "../../ast/state.ts"
import { isWhitespace } from "../../character-classes.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"

/** What the walk keeps of one state: whether a visit gave it a description, how many descriptions it has, and the first statement that gave it a body. */
interface StateRecord {
  described: boolean
  descriptions: number
  body: Range | null
}

/**
 * The id of a state that mermaid.js makes at random: the last region of a
 * divided body, and the start state of a state whose id is such an id. It
 * equals no written id and no other id; the id of its start state is made
 * once, so that every StateTerminal that names it is the same state.
 */
class RandomId {
  private start: RandomId | null = null

  /** The id of the start state of the state whose id this is. */
  public startId(): RandomId {
    this.start ??= new RandomId()
    return this.start
  }
}

/**
 * The id of a state: a written id, or one made from it by adding `_start`,
 * or an id that mermaid.js makes at random ({@link RandomId}).
 */
type StateId = string | RandomId

/** The id of the start state of the state whose id is `parent`. */
function startIdOf(parent: StateId): StateId {
  return typeof parent === "string" ? `${parent}_start` : parent.startId()
}

/**
 * diagrams/state.md, Rejections outside the grammar: the inputs that the
 * grammar accepts and mermaid.js rejects while it builds the Db. The
 * statements are walked in source order, a body where its statement
 * stands, and the walk keeps, for each state id, its descriptions and
 * whether it has a body. A state with a body and more than one description
 * is rejected, at the statement that gave it its body. Two words between
 * `state` and `{`, the other rejection of the section, is made by the
 * lexer.
 *
 * The id of a StateTerminal, and of a state named `[*]`, is that of the
 * composite state or region that it lies in, or `root` at the top level,
 * followed by `_start`. A region of a divided body is a state with a
 * body. A region that a divider closes has the id `divider-id-` and the
 * number of that divider among all dividers of the text, in source order,
 * from 1, and the divider gives it its body; the last region has an id
 * that mermaid.js makes at random, which no other state has
 * ({@link RandomId}). A divider in a body that is not divided is a state
 * without a body, which gives no description, and needs no visit.
 */
export class StateDbRejections {
  private readonly lines: LineIndex

  /** Rejections outside the grammar: the id of each state in converted form. */
  private readonly stateIds: ReadonlyMap<Identifier | StateLiteral, string>

  /** Rejections outside the grammar: the alias definitions with a `:` (see `StateSyntax`). */
  private readonly aliasesWithColon: ReadonlySet<StateAliasDefinitionStatement>

  /** The states seen so far, by id. */
  private readonly states = new Map<StateId, StateRecord>()

  /** The number of each divider among all dividers of the text, in source order, from 1. */
  private readonly dividerNumbers = new Map<StateDividerStatement, number>()

  public constructor(
    lines: LineIndex,
    stateIds: ReadonlyMap<Identifier | StateLiteral, string>,
    aliasesWithColon: ReadonlySet<StateAliasDefinitionStatement>,
  ) {
    this.lines = lines
    this.stateIds = stateIds
    this.aliasesWithColon = aliasesWithColon
  }

  /** Walks `statements`, the body of the diagram; throws `ParseError` when a state with a body has more than one description. */
  public check(statements: readonly StateStatement[]): void {
    this.numberDividers(statements)
    this.walk(statements, "root")
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

  /** The number of each divider of `statements` and of the bodies in them, in source order. */
  private numberDividers(statements: readonly StateStatement[]): void {
    for (const statement of statements) {
      if (statement.type === "StateDividerStatement") {
        this.dividerNumbers.set(statement, this.dividerNumbers.size + 1)
      } else if (
        (statement.type === "StateCompositeStatement" ||
          statement.type === "StateAliasDefinitionStatement") &&
        statement.body !== null
      ) {
        this.numberDividers(statement.body)
      }
    }
  }

  /**
   * The walk: the statements of a body, in order, in the composite state
   * whose id is `parent`, or `root` at the top level. A body is divided
   * when it has dividers and its last statement is not one; it is then
   * walked as its regions, each the parent of its statements.
   */
  private walk(statements: readonly StateStatement[], parent: StateId): void {
    const divided =
      statements.some(
        (statement) => statement.type === "StateDividerStatement",
      ) && statements.at(-1)?.type !== "StateDividerStatement"
    if (!divided) {
      for (const statement of statements) this.apply(statement, parent)
      return
    }
    let region: StateStatement[] = []
    for (const statement of statements) {
      if (statement.type === "StateDividerStatement") {
        // A region that a divider statement closes is a state with a body,
        // which the divider statement gives it.
        const id = `divider-id-${this.dividerNumberOf(statement)}`
        this.visit(id, 0, statement.range)
        this.walk(region, id)
        region = []
      } else {
        region.push(statement)
      }
    }
    // No statement names the last region, so no description makes it
    // rejected, and it needs no visit.
    this.walk(region, new RandomId())
  }

  /** The number of the divider `divider` ({@link StateDbRejections.numberDividers}). */
  private dividerNumberOf(divider: StateDividerStatement): number {
    const number = this.dividerNumbers.get(divider)
    if (number === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: the divider at ${divider.range[0]} has no number`,
      )
    }
    return number
  }

  /**
   * The walk: what one statement does to the descriptions and the bodies of
   * its states, in the composite state or region whose id is `parent`.
   */
  private apply(statement: StateStatement, parent: StateId): void {
    switch (statement.type) {
      case "StateDefinitionStatement":
        this.visit(
          this.idOf(statement.reference.state, parent),
          statement.description === null ? 0 : 1,
          null,
        )
        return
      case "StateCompositeStatement":
        if (statement.id !== null && statement.body !== null) {
          const id = this.idOf(statement.id, parent)
          this.visit(id, 0, statement.range)
          this.walk(statement.body, id)
        }
        return
      case "StateAliasDefinitionStatement": {
        const id =
          statement.id === null ? null : this.idOf(statement.id, parent)
        if (id !== null) {
          this.visit(
            id,
            this.descriptionsOfAlias(statement),
            statement.body === null ? null : statement.range,
          )
        }
        if (statement.body !== null) this.walk(statement.body, id ?? parent)
        return
      }
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
   * second description, also when that is empty and has no node; and none
   * for a string that is empty or all whitespace without a `:`.
   */
  private descriptionsOfAlias(
    statement: StateAliasDefinitionStatement,
  ): number {
    if (statement.body !== null) return 1
    if (this.aliasesWithColon.has(statement)) return 2
    const blank = [...statement.description.value].every((character) =>
      isWhitespace(character.codePointAt(0) ?? 0),
    )
    return blank ? 0 : 1
  }

  /**
   * The id of the state that `name` names where it stands before the arrow
   * of a transition or alone, in the composite state or region whose id is
   * `parent`: a StateTerminal, and a state named `[*]`, have the id of the
   * start state of `parent` ({@link startIdOf}).
   */
  private idOf(
    name: Identifier | StateLiteral | StateTerminal,
    parent: StateId,
  ): StateId {
    if (name.type === "StateTerminal") return startIdOf(parent)
    const id = this.stateIds.get(name)
    if (id === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: the state at ${name.range[0]} has no id`,
      )
    }
    return id === "[*]" ? startIdOf(parent) : id
  }

  /**
   * The walk: a visit of the state whose id is `id` with `descriptions`
   * descriptions, and the range of the statement that gives it a body, if
   * it does. A description replaces the id when the state has had none,
   * and is added after the others otherwise.
   */
  private visit(id: StateId, descriptions: number, body: Range | null): void {
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
