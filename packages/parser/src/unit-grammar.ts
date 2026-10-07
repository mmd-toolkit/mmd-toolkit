import type {
  DiagramTokenKind,
  Identifier,
  Location,
  NumericLiteral,
  Range,
} from "./ast.ts"
import type { DiagramComment } from "./diagram-parsing.ts"
import type { DiagramUnit } from "./diagram-units.ts"
import { significantRangeOf } from "./diagram-units.ts"
import type { EmptyForm } from "./empty-forms.ts"
import { emptyFormError, emptyFormsOf } from "./empty-forms.ts"
import type { EmptyFormKind } from "./empty-forms.ts"
import { ParseError } from "./errors.ts"
import type { LineIndex } from "./positions.ts"
import type { PendingToken, SourceLexer } from "./source-lexer.ts"

/** The range and location of a node. */
export interface NodePlace {
  readonly range: Range
  readonly loc: Location
}

/**
 * What every diagram's recursive-descent grammar does with its units, as
 * ast.md decides it: reading the units one by one, the place of a node
 * made of units, the written text of a value, the shared leaf nodes, and the
 * tokens of the items of the grammar. A diagram's grammar extends it with
 * one method per production, and with the error for a unit that it cannot
 * read where it stands.
 */
export abstract class UnitGrammar<
  Name extends string,
  Unit extends DiagramUnit<Name>,
> {
  /**
   * The units of the diagram text that the grammar reads, in source order:
   * those of the lexer, without the units taken out
   * ({@link UnitGrammar.takeOut}).
   */
  protected units: readonly Unit[]

  protected readonly lexer: SourceLexer

  protected readonly lines: LineIndex

  /** Which unit is read next. */
  protected next = 0

  /**
   * The empty form that each unit belongs to, for the units of the empty
   * forms of the diagram (see `emptyFormsOf`), which no rule of the
   * grammar takes.
   */
  private readonly emptyFormOfUnit: ReadonlyMap<Unit, EmptyForm<Unit>>

  private readonly tokens: PendingToken[] = []

  /** The diagram comments that the diagram's lexer read, in source order; none for a diagram whose lexer reads none. */
  private readonly diagramComments: readonly DiagramComment[]

  protected constructor(
    units: readonly Unit[],
    lexer: SourceLexer,
    emptyFormKinds: readonly EmptyFormKind[],
    diagramComments: readonly DiagramComment[],
  ) {
    this.units = units
    this.lexer = lexer
    this.diagramComments = diagramComments
    this.lines = lexer.lines
    this.emptyFormOfUnit = new Map(
      emptyFormsOf(units, emptyFormKinds).flatMap((form) =>
        form.units.map((unit): [Unit, EmptyForm<Unit>] => [unit, form]),
      ),
    )
  }

  /**
   * The error for the unit `unit`, which the grammar cannot read where it
   * stands, or for the end of the text when it is null. When the cause is
   * one that a known divergence names ({@link UnitGrammar.knownDivergenceAt}),
   * the error names it; otherwise the range is the unit without its
   * whitespace, and the empty range at its start for a unit that is all
   * whitespace.
   */
  protected unexpected(unit: Unit | null): ParseError {
    const divergence = unit === null ? null : this.knownDivergenceAt(unit)
    if (divergence !== null) return divergence
    const end = this.lexer.text.length
    const range: Range =
      unit === null
        ? [end, end]
        : (unit.significantRange ?? [unit.start, unit.start])
    // An empty range at the end of the text, also that of a unit that is all
    // whitespace there, means that the text ends where more is needed.
    return new ParseError(
      range[0] === end ? "Unexpected end of text" : "Unexpected token",
      range,
      this.lines.location(range),
    )
  }

  /**
   * The error of a known divergence whose cause is at the unit `unit`, which
   * the grammar cannot read where it stands, such as a unit of an empty form
   * (see {@link UnitGrammar.emptyFormErrorAt}); null when no known divergence
   * is the cause. Each diagram says where it looks for the cause.
   */
  protected abstract knownDivergenceAt(unit: Unit): ParseError | null

  /**
   * known-divergences/tokenless-empty-forms.md: the error for the empty
   * form that `unit` belongs to (`emptyFormError`); null when it belongs to
   * none.
   */
  protected emptyFormErrorAt(unit: Unit): ParseError | null {
    const form = this.emptyFormOf(unit)
    return form === null ? null : emptyFormError(form, this.lines)
  }

  /** The empty form that `unit` belongs to; null when it belongs to none. */
  protected emptyFormOf(unit: Unit): EmptyForm<Unit> | null {
    return this.emptyFormOfUnit.get(unit) ?? null
  }

  /**
   * Each diagram's Empty description blocks before a separator:
   * `statement-end = empty-description-block* separator`, after the last
   * unit of a statement. The index of its separator, the unit after the
   * `empty-description-block`s that start at the next unit, which the
   * caller reads as statements of their own; the separator is a unit named
   * in `separators`, or, when `endOfText` holds, the end of the text, where
   * the index is that of no unit. When no separator follows, the error is
   * that of the first block, which then lies inside a statement, or of the
   * unit, when no block comes before it.
   */
  protected statementEndAt(
    separators: readonly Name[],
    endOfText: boolean,
  ): number {
    let end = this.next
    for (;;) {
      const unit = this.units.at(end)
      const form = unit === undefined ? null : this.emptyFormOf(unit)
      if (form?.kind !== "empty-description-block" || form.units[0] !== unit) {
        break
      }
      end += form.units.length
    }
    const separator = this.units.at(end)
    const separates =
      separator === undefined ? endOfText : separators.includes(separator.name)
    if (!separates) throw this.unexpected(this.peek())
    return end
  }

  /**
   * Takes `units`, which all lie after the next unit, out of the units that
   * the grammar reads; the units before the next one keep their indices.
   */
  protected takeOut(units: readonly Unit[]): void {
    const taken = new Set(units)
    for (const unit of units) {
      if (this.units.indexOf(unit) < this.next) {
        throw new Error(
          `mmd-toolkit parser bug: the unit at ${unit.start} is read already`,
        )
      }
    }
    this.units = this.units.filter((unit) => !taken.has(unit))
  }

  /** The tokens of the items read so far, in source order. */
  protected tokensInOrder(): PendingToken[] {
    return [...this.tokens].sort((a, b) => a.range[0] - b.range[0])
  }

  /** The next unit, or null at the end of the text. */
  protected peek(): Unit | null {
    return this.units[this.next] ?? null
  }

  /** The name of the unit at `index`, or null after the last unit. */
  protected nameAt(index: number): Name | null {
    return this.units[index]?.name ?? null
  }

  /** Reads the next unit, which must be named `name`. */
  protected take(name: Name): Unit {
    const unit = this.peek()
    if (unit === null || unit.name !== name) throw this.unexpected(unit)
    this.next += 1
    return unit
  }

  /** Reads the next unit when it is named `name`; null otherwise. */
  protected takeIf(name: Name): Unit | null {
    const unit = this.peek()
    if (unit === null || unit.name !== name) return null
    this.next += 1
    return unit
  }

  /** Reads the units from the next one that have one of `names`, as many as there are. */
  protected takeWhile(names: readonly Name[]): Unit[] {
    const units: Unit[] = []
    for (
      let unit = this.peek();
      unit !== null && names.includes(unit.name);
      unit = this.peek()
    ) {
      units.push(unit)
      this.next += 1
    }
    return units
  }

  /** Reads the units named `name` from the next one, as many as there are. */
  protected takeAll(name: Name): void {
    this.takeWhile([name])
  }

  /** The place of the node whose units are those from index `start` up to the next unit (see {@link UnitGrammar.placeOf}). */
  protected placeFrom(start: number): NodePlace {
    return this.placeOf(this.units.slice(start, this.next))
  }

  /**
   * ast.md, Nodes: the place of the node whose units are `units`: from the
   * start of its first token to the end of its last token. A node without
   * a token, whose text is all whitespace, covers its units instead: from
   * the start of its first unit to the end of its last.
   */
  protected placeOf(units: readonly Unit[]): NodePlace {
    if (units.length === 0) {
      throw new Error("mmd-toolkit parser bug: a node has no unit")
    }
    const significant = units.flatMap((unit) =>
      unit.significantRange === null ? [] : [unit.significantRange],
    )
    const range: Range =
      significant.length === 0
        ? [units[0].start, units[units.length - 1].end]
        : [significant[0][0], significant[significant.length - 1][1]]
    return { range, loc: this.lines.location(range) }
  }

  /** ast.md, Nodes: the written text over the range `range`, without `delimiters`. */
  protected textOf(range: Range, delimiters: readonly Range[] = []): string {
    const leftOut = [...delimiters].sort((a, b) => a[0] - b[0])
    return this.lexer.textOfRange(range[0], range[1], leftOut)
  }

  /**
   * ast.md, Nodes: the written text over the range `range` of a node of text
   * that mermaid.js does not read, which leaves out the comments in the
   * range too, the diagram comments of the diagram's lexer as well as the
   * comment regions.
   */
  protected unreadTextOf(range: Range): string {
    const comments = this.diagramComments
      .map((comment) => comment.range)
      .filter(([start, end]) => range[0] <= start && end <= range[1])
    return this.textOf(range, comments)
  }

  /** The written text of `unit` without the whitespace at its ends, for the words and arrows that are strings in the tree. */
  protected textOfUnit(unit: Unit): string {
    return this.textOf(significantRangeOf(unit))
  }

  /**
   * ast.md, Shared leaf nodes > Identifier: the Identifier whose units are
   * `units`, one `Identifier` item. Its name is the written text of each
   * unit, joined in order; no whitespace lies inside or between the units.
   */
  protected identifierOf(units: readonly Unit[]): Identifier {
    this.addItem("Identifier", units)
    const place = this.placeOf(units)
    const name = units
      .filter((unit) => unit.significantRange !== null)
      .map((unit) => this.textOfUnit(unit))
      .join("")
    return { type: "Identifier", name, ...place }
  }

  /**
   * ast.md, Shared leaf nodes > NumericLiteral: the NumericLiteral of the
   * `number` unit `unit`, whose value is the number that its characters
   * write. The unit is one `Numeric` item.
   */
  protected numericLiteralOf(unit: Unit): NumericLiteral {
    this.addItem("Numeric", [unit])
    const place = this.placeOf([unit])
    return {
      type: "NumericLiteral",
      value: Number(unit.text),
      raw: this.lexer.text.slice(...place.range),
      ...place,
    }
  }

  /**
   * `docs/tokens.md`, Tokens: the tokens of one item of the grammar, whose units are
   * `units`, of kind `kind`. Every unit of the item has that kind. A token
   * is a run of the item's units (see {@link UnitGrammar.runsOf}), without
   * the whitespace at its ends unless a unit keeps it; a run that is all
   * whitespace gives no token.
   */
  protected addItem(kind: DiagramTokenKind, units: readonly Unit[]): void {
    this.addUnitsAndTokens(kind, units, false)
  }

  /**
   * `docs/tokens.md`, Tokens: the tokens of an item of kind `kind`, whose units are
   * `units`, that goes on with a value that starts before it, in another
   * item, as the text after the string that a label starts with: the
   * whitespace at the start of its first token lies inside the value, which
   * mermaid.js reads, so the token keeps it (`docs/tokens.md`, Tokens).
   */
  protected addItemContinuingValue(
    kind: DiagramTokenKind,
    units: readonly Unit[],
  ): void {
    this.addUnitsAndTokens(kind, units, true)
  }

  /**
   * `docs/tokens.md`, Tokens: one token of kind `kind` of the whitespace at
   * `range`, which a value holds and the token of no unit does: the value of
   * a label that is all whitespace, and the whitespace between the parts of
   * a sequence box text. A cut in it cuts it as any token.
   */
  protected addWhitespaceToken(kind: DiagramTokenKind, range: Range): void {
    this.tokens.push({ kind, range })
  }

  /**
   * The range from the first to the last character of the diagram text in
   * `range`, the characters that no directive, comment region, or `;` that
   * the line rule ignores holds (common.md, Reading a source); null when
   * there is none. A token starts and ends with such a character.
   */
  protected diagramTextIn(range: Range): Range | null {
    let first: number | null = null
    let last = range[0]
    let offset = range[0]
    while (offset < range[1]) {
      const element = this.lexer.readAt(offset)
      if (element.kind === "character") {
        if (element.endOfText || element.start >= range[1]) break
        first ??= element.start
        last = element.end
      }
      offset = element.end
    }
    return first === null ? null : [first, last]
  }

  /**
   * The tokens of one item, of kind `kind`,
   * whose units are `units`, the units of an item that goes on with a value
   * that starts before it when `continuesValue` is true
   * ({@link UnitGrammar.addItemContinuingValue}).
   */
  private addUnitsAndTokens(
    kind: DiagramTokenKind,
    units: readonly Unit[],
    continuesValue: boolean,
  ): void {
    let first = true
    for (const run of this.runsOf(kind, units)) {
      const range = this.significantRangeOfRun(run)
      if (range === null) continue
      const start = first && continuesValue ? run[0].start : range[0]
      this.tokens.push({ kind, range: [start, range[1]] })
      first = false
    }
  }

  /**
   * `docs/tokens.md`, Tokens: the runs of the units `units` of one item of kind
   * `kind`, the maximal runs of units that follow one another with nothing
   * between them, in source order. Where a run breaks is the diagram's to
   * say (see {@link UnitGrammar.breaksRun}).
   */
  protected runsOf(kind: DiagramTokenKind, units: readonly Unit[]): Unit[][] {
    const runs: Unit[][] = []
    for (const unit of units) {
      const run = runs.at(-1)
      const previous = run?.at(-1)
      if (
        run === undefined ||
        previous === undefined ||
        this.breaksRun(kind, previous, unit)
      ) {
        runs.push([unit])
      } else {
        run.push(unit)
      }
    }
    return runs
  }

  /**
   * `docs/tokens.md`, Tokens: whether a run of units of one item of kind `kind`
   * breaks between `previous` and `unit`, the next unit of the item. It
   * breaks where the units do not follow one another in the units of the
   * text, which is where a unit of another item lies between them; a
   * diagram whose whitespace belongs to no unit also breaks it where
   * characters lie between them.
   */
  protected breaksRun(
    _kind: DiagramTokenKind,
    previous: Unit,
    unit: Unit,
  ): boolean {
    return unit.index !== previous.index + 1
  }

  /** The source range from the first to the last character of `run` that is not whitespace; null when the run is all whitespace. */
  private significantRangeOfRun(run: readonly Unit[]): Range | null {
    const significant = run.flatMap((unit) =>
      unit.significantRange === null ? [] : [unit.significantRange],
    )
    if (significant.length === 0) return null
    return [significant[0][0], significant[significant.length - 1][1]]
  }
}
