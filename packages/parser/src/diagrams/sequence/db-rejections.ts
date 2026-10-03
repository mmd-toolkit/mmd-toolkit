import type { Range } from "../../ast.ts"
import type {
  SequenceIdentifier,
  SequenceMessageStatement,
  SequenceStatement,
} from "../../ast/sequence.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"

/** A participant that a `create` or a `destroy` waits for its message. */
interface Waiting {
  readonly id: string
}

/**
 * diagrams/sequence.md, Rejections outside the grammar: the inputs that the
 * grammar accepts and mermaid.js rejects while it builds the Db. The
 * statements are walked in source order, a block's body where the block
 * stands, and each check keeps what the Db would hold of it: the
 * participants added so far, the box of each, and how often each was
 * activated and deactivated. The first statement that makes the input
 * rejected throws a `ParseError` there.
 */
export class SequenceDbRejections {
  private readonly lines: LineIndex

  /** The ids of the participants added so far. */
  private readonly participants = new Set<string>()

  /** The box of each participant that has one, by the box statement's place in the walk. */
  private readonly boxOfParticipant = new Map<string, number>()

  /** How many entries of type 17 and of type 18 each participant has had. */
  private readonly activations = new Map<
    string,
    { readonly activated: number; readonly deactivated: number }
  >()

  /** The participant that the last `create` waits for its message, if one waits. */
  private createWaiting: Waiting | null = null

  /** The participant that the last `destroy` waits for its message, if one waits. */
  private destroyWaiting: Waiting | null = null

  /** How many boxes the walk has entered. */
  private boxCount = 0

  public constructor(lines: LineIndex) {
    this.lines = lines
  }

  /** Walks `statements`, the body of the diagram; throws `ParseError` at the first rejection. */
  public check(statements: readonly SequenceStatement[]): void {
    this.walk(statements, null)
  }

  /** Walks `statements` in source order; `box` is the box they stand in, if any. */
  private walk(
    statements: readonly SequenceStatement[],
    box: number | null,
  ): void {
    for (const statement of statements) this.apply(statement, box)
  }

  /** Rejections outside the grammar: what one statement does to the participants, in the order of the Db. */
  private apply(statement: SequenceStatement, box: number | null): void {
    switch (statement.type) {
      case "SequenceParticipantStatement":
        if (statement.created) this.create(statement.id)
        this.addInBox(statement.id, box)
        return
      case "SequenceDestroyStatement":
        if (statement.created) {
          this.create(statement.id)
          this.add(statement.id.name)
        } else {
          this.destroyWaiting = { id: statement.id.name }
        }
        return
      case "SequenceBoxStatement": {
        this.boxCount += 1
        this.walk(statement.body, this.boxCount)
        return
      }
      case "SequenceMessageStatement":
        this.message(statement)
        return
      case "SequenceActivateStatement":
        this.activate(statement.id.name)
        return
      case "SequenceDeactivateStatement":
        this.deactivate(statement.id.name, statement.id.range)
        return
      case "SequenceNoteStatement":
        for (const id of statement.ids) this.add(id.name)
        return
      case "SequenceLinksStatement":
      case "SequenceLinkStatement":
      case "SequencePropertiesStatement":
      case "SequenceDetailsStatement":
        this.add(statement.id.name)
        return
      case "SequenceLoopStatement":
      case "SequenceOptStatement":
      case "SequenceBreakStatement":
      case "SequenceRectStatement":
        this.walk(statement.body, box)
        return
      case "SequenceAltStatement":
      case "SequenceParStatement":
      case "SequenceParOverStatement":
      case "SequenceCriticalStatement":
        for (const section of statement.sections) this.walk(section.body, box)
        return
      case "SequenceAutonumberStatement":
      case "SequenceTitleStatement":
      case "SequenceAccTitleStatement":
      case "SequenceAccDescrStatement":
      case "SequenceAccDescrBlockStatement":
      case "SequenceIgnoredStatement":
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /** Participants: adds the participant `id` where it is not there yet. */
  private add(id: string): void {
    this.participants.add(id)
  }

  /**
   * Participants: adds the participant of a participant statement, `id`,
   * inside the box `box` when it stands in one. Inside a box, a participant
   * that has another box already makes the input rejected.
   */
  private addInBox(id: SequenceIdentifier, box: number | null): void {
    if (box !== null) {
      const existing = this.boxOfParticipant.get(id.name)
      if (existing !== undefined && existing !== box) {
        throw this.rejection("A participant cannot be in two boxes", id.range)
      }
      this.boxOfParticipant.set(id.name, box)
    }
    this.add(id.name)
  }

  /**
   * Create and destroy: `create` with the id `id`, rejected when a
   * participant with that id exists already; the created participant waits
   * for its message.
   */
  private create(id: SequenceIdentifier): void {
    if (this.participants.has(id.name)) {
      throw this.rejection(
        "A participant that exists already cannot be created",
        id.range,
      )
    }
    this.createWaiting = { id: id.name }
  }

  /**
   * Messages: adds the two participants, checks the message that a
   * `create` or a `destroy` waits for, and adds the entries of activation.
   * A `create` that waits takes the message; a `destroy` waits for the
   * next message that no `create` takes.
   */
  private message(statement: SequenceMessageStatement): void {
    const from = statement.from.name
    const to = statement.to.name
    this.add(from)
    this.add(to)
    if (this.createWaiting !== null) {
      if (to !== this.createWaiting.id) {
        throw this.rejection(
          "The message after create must go to the created participant",
          statement.range,
        )
      }
      this.createWaiting = null
    } else if (this.destroyWaiting !== null) {
      const { id } = this.destroyWaiting
      if (from !== id && to !== id) {
        throw this.rejection(
          "The message after destroy must come from or go to the destroyed participant",
          statement.range,
        )
      }
      this.destroyWaiting = null
    }
    if (statement.activation === "+") this.activate(to)
    if (statement.activation === "-") {
      this.deactivate(from, statement.from.range)
    }
  }

  /** An entry of type 17 for the participant `id`. */
  private activate(id: string): void {
    const { activated, deactivated } = this.activationsOf(id)
    this.activations.set(id, { activated: activated + 1, deactivated })
  }

  /**
   * An entry of type 18 for the participant `id`, rejected when the
   * entries of type 17 for it so far are not more than those of type 18.
   * The error is at `range`, the id that names the participant.
   */
  private deactivate(id: string, range: Range): void {
    const { activated, deactivated } = this.activationsOf(id)
    if (activated <= deactivated) {
      throw this.rejection(
        "A participant that is not active cannot be deactivated",
        range,
      )
    }
    this.activations.set(id, { activated, deactivated: deactivated + 1 })
  }

  /** How many entries of type 17 and of type 18 the participant `id` has had. */
  private activationsOf(id: string): {
    readonly activated: number
    readonly deactivated: number
  } {
    return this.activations.get(id) ?? { activated: 0, deactivated: 0 }
  }

  /** The error of a rejection outside the grammar, at `range`. */
  private rejection(message: string, range: Range): ParseError {
    return new ParseError(message, range, this.lines.location(range))
  }
}
