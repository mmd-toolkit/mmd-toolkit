import type { Range } from "./ast.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "./diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "./diagram-units.ts"
import { ParseError } from "./errors.ts"
import type { LineIndex } from "./positions.ts"

/**
 * What every diagram's lexer does in the same way, as each diagram's Units
 * and contexts describes it: the stack of contexts, which starts in the
 * statement context; at each place, the first rule of the current context
 * that matches; and, at the end of the text, the error of a context that
 * the text may not end in. A diagram's lexer extends it with one method
 * per rule, the reading of each context ({@link UnitLexer.readInContext}),
 * and the making of its units ({@link UnitLexer.addUnit}), whose fields
 * differ from one diagram type to another.
 */
export abstract class UnitLexer<
  Context extends string,
  Name extends string,
  Unit extends DiagramUnit<Name>,
> {
  protected readonly reader: DiagramText

  protected readonly lines: LineIndex

  /** The units read so far, in source order. */
  protected readonly units: Unit[] = []

  /** The place of the next character to read; null at the end of the text. */
  protected position: DiagramPosition

  /** The stack of contexts; the last one is the current context. */
  private readonly contexts: Context[]

  /** For each context on the stack but the first, where it was entered, for the error at the end of the text. */
  private readonly entries: Range[] = []

  /**
   * Units and contexts: for each context, null when the text may end in
   * it; otherwise the message of the error when the text ends in it, which
   * says what is not closed.
   */
  private readonly endOfTextMessages: Readonly<Record<Context, string | null>>

  protected constructor(
    reader: DiagramText,
    lines: LineIndex,
    statementContext: Context,
    endOfTextMessages: Readonly<Record<Context, string | null>>,
  ) {
    this.reader = reader
    this.lines = lines
    this.position = reader.first()
    this.contexts = [statementContext]
    this.endOfTextMessages = endOfTextMessages
  }

  /** Applies the first rule of `context` that matches at `at`. */
  protected abstract readInContext(at: DiagramCharacter, context: Context): void

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`, whose token leaves out the whitespace at its
   * ends as `ends` says, and returns it. Each diagram makes its units, with
   * the fields of its own, and may take more of them after `ends`.
   */
  protected abstract addUnit(
    name: Name,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends?: UnitEnds,
  ): Unit

  /** Reads the unit named `name` from `at` up to `to`, and goes on after it; `ends` as in {@link UnitLexer.addUnit}. */
  protected read(
    name: Name,
    at: DiagramCharacter,
    to: DiagramPosition,
    ends?: UnitEnds,
  ): Unit {
    const unit = this.addUnit(name, at, to, ends)
    this.position = to
    return unit
  }

  /** Reads the diagram text to its end, the first rule of the current context that matches at each place. */
  protected readToEnd(): void {
    while (this.position !== null) {
      this.readInContext(this.position, this.currentContext())
    }
  }

  /** The current context: the top of the stack. */
  protected currentContext(): Context {
    return this.contexts[this.contexts.length - 1]
  }

  /** The context that the current context was entered from; null for the statement context, which the lexer starts in. */
  protected outerContext(): Context | null {
    return this.contexts.at(-2) ?? null
  }

  /** Where the current context was entered; null for the statement context, which the lexer starts in. */
  protected currentEntry(): Range | null {
    return this.entries.at(-1) ?? null
  }

  /** Units and contexts: enters `context`, which goes on top of the stack, entered at `entry`. */
  protected enter(context: Context, entry: Range): void {
    this.contexts.push(context)
    this.entries.push(entry)
  }

  /**
   * Units and contexts: leaves the current context. Leaving the statement
   * context keeps the statement context, as diagrams/flowchart.md,
   * diagrams/class.md, and diagrams/state.md say; no rule of the other
   * diagram types leaves it.
   */
  protected leave(): void {
    if (this.contexts.length === 1) return
    this.contexts.pop()
    this.entries.pop()
  }

  /**
   * Units and contexts: the error when the text ends in the current
   * context, at where it was entered, saying what is not closed; null when
   * the text may end there.
   */
  protected endOfTextError(): ParseError | null {
    const message = this.endOfTextMessages[this.currentContext()]
    const entry = this.currentEntry()
    if (message === null || entry === null) return null
    return new ParseError(message, entry, this.lines.location(entry))
  }

  /** Units and contexts: throws when the text ends in a context that may not end there. */
  protected checkEndOfText(): void {
    const error = this.endOfTextError()
    if (error !== null) throw error
  }

  /** The error for a place where no rule of the current context matches: the character there. */
  protected noRuleMatches(at: DiagramCharacter): ParseError {
    const range: Range = [at.start, at.end]
    return new ParseError(
      "Unexpected character",
      range,
      this.lines.location(range),
    )
  }
}
