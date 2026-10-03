import type { JsonObject } from "@mmd-toolkit/tests"
import type { DbSummary, EmbeddedValues } from "@mmd-toolkit/tests/mermaid"
import type {
  Identifier,
  Root,
  StateAliasDefinitionStatement,
  StateDiagram,
  StateDividerStatement,
  StateLiteral,
  StateDbTexts,
  StateNoteStatement,
  StateReference,
  StateStatement,
  StringLiteral,
} from "../../src/index.ts"
import type { Unit } from "../../src/diagrams/state/units.ts"
import { stateDbTexts } from "../../src/index.ts"
import { ConvertedText } from "./converted-text.ts"
import { descriptionOf, trimmed } from "./db-values.ts"
import { StateSource } from "./state-source.ts"

// diagrams/state.md, Db normalization: the summary of the Db that a state
// tree denotes, in the form of `normalizeState()` of `@mmd-toolkit/tests`.
// Every step below is a paragraph of "Building the summary from the tree",
// and its comment names it. Each step reads the values of the tree in
// converted form (see `converted-text.ts`).

/** The walk: a node of the summary, a state or a region, while it is built. */
interface StateEntry {
  readonly id: string
  shape: string | undefined
  /** The descriptions; they start as the id alone. */
  descriptions: string[]
  /** Whether a visit had a description, so that the descriptions are no longer the id alone. */
  described: boolean
  /** Whether a visit with a body was made. */
  hasBody: boolean
  readonly region: boolean
  parentId: string | undefined
  dir: string | undefined
}

/** The walk: what a visit of a state brings. */
interface Visit {
  /** The id of the composite state or region of the statement; null at the top level. */
  readonly parent: string | null
  /** The shape that the first visit sets; null for the visit of a note, which sets none. */
  readonly firstShape: string | null
  /** The descriptions of the visit; none when it has no description. */
  readonly descriptions: readonly string[]
  /** For a visit with a body, the direction of its body; null without a body. */
  readonly bodyDirection: string | null
  readonly region: boolean
}

/** The walk: the ids that make no node. */
const IDS_WITHOUT_NODE: readonly string[] = ["", "</choice>", "</join></fork>"]

/** The builder of the summary: the statements are walked in source order. */
class StateDbBuilder {
  private readonly title: string

  private accTitle = ""

  private accDescr = ""

  private readonly states = new Map<string, StateEntry>()

  private readonly notes: JsonObject[] = []

  private readonly transitions: JsonObject[] = []

  private readonly classDefs = new Map<string, string[]>()

  private readonly links: JsonObject[] = []

  private readonly classes = new Map<string, string[]>()

  private readonly styles = new Map<string, string[]>()

  /** Regions: the number of each divider among all dividers of the text, counted from 1. */
  private readonly dividerNumbers = new Map<StateDividerStatement, number>()

  /** Regions: how many regions after a last divider were visited. */
  private generatedRegions = 0

  private readonly source: StateSource

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The texts that the Db reads past the range of a value node (`stateDbTexts`). */
  private readonly dbTexts: StateDbTexts

  public constructor(source: string, root: Root, embedded: EmbeddedValues) {
    this.source = new StateSource(source, root)
    this.text = new ConvertedText(this.source.diagramText)
    this.dbTexts = stateDbTexts(root, source)
    this.title = embedded.title ?? ""
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: StateDiagram): DbSummary {
    this.numberDividers(diagram.body)
    this.walk(diagram.body, null)
    for (const statement of diagram.body) this.applyTopLevel(statement)
    return {
      direction: lastDirectionOf(diagram.body) ?? "TB",
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      states: [...this.states.values()].map((state) =>
        this.summaryOfState(state),
      ),
      notes: this.notes,
      transitions: this.transitions,
      classDefs: [...this.classDefs].map(([id, styles]) => ({ id, styles })),
      links: this.links,
    }
  }

  /** Regions: numbers the dividers of `statements` and of the bodies in them, in source order. */
  private numberDividers(statements: readonly StateStatement[]): void {
    for (const statement of statements) {
      if (statement.type === "StateDividerStatement") {
        this.dividerNumbers.set(statement, this.dividerNumbers.size + 1)
      }
      const body = bodyOf(statement)
      if (body !== null) this.numberDividers(body)
    }
  }

  /** The walk: the statements `statements`, whose parent is `parent`. */
  private walk(
    statements: readonly StateStatement[],
    parent: string | null,
  ): void {
    for (const statement of statements) this.walkStatement(statement, parent)
  }

  /** The walk: what one statement adds. */
  private walkStatement(
    statement: StateStatement,
    parent: string | null,
  ): void {
    switch (statement.type) {
      case "StateDefinitionStatement":
        this.visitReference(
          statement.reference,
          parent,
          "_start",
          statement.description === null
            ? []
            : [this.valueOf(statement.description)],
        )
        return
      case "StateTransitionStatement": {
        const start = this.visitReference(statement.from, parent, "_start", [])
        const end = this.visitReference(statement.to, parent, "_end", [])
        this.transitions.push({
          start,
          end,
          label: statement.label === null ? "" : this.valueOf(statement.label),
        })
        return
      }
      case "StateCompositeStatement":
        if (statement.id === null || statement.body === null) return
        this.visitComposite(
          this.valueOf(statement.id),
          parent,
          [],
          statement.body,
        )
        return
      case "StateAliasDefinitionStatement":
        this.walkAlias(statement, parent)
        return
      case "StatePseudostateDefinitionStatement":
        this.visit(statement.id === null ? "" : this.valueOf(statement.id), {
          parent,
          firstShape: statement.kind,
          descriptions: [],
          bodyDirection: null,
          region: false,
        })
        return
      case "StateNoteStatement":
        this.walkNote(statement, parent)
        return
      case "StateDividerStatement":
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
          `state Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Ids, and the walk: visits the state of `reference`, whose parent is
   * `parent`; a StateTerminal has the id of its parent, or `root`,
   * followed by `suffix`. Returns the id.
   */
  private visitReference(
    reference: StateReference,
    parent: string | null,
    suffix: "_start" | "_end",
    descriptions: readonly string[],
  ): string {
    const terminal = reference.state.type === "StateTerminal"
    const id = terminal
      ? `${parent ?? "root"}${suffix}`
      : this.valueOf(reference.state)
    this.visit(id, {
      parent,
      firstShape: !terminal
        ? "rect"
        : suffix === "_start"
          ? "stateStart"
          : "stateEnd",
      descriptions,
      bodyDirection: null,
      region: false,
    })
    return id
  }

  /**
   * The walk: an alias definition. Its description is the value of its
   * string without the whitespace at its ends, or, with a body, the text
   * between its quotes; with a `:`, its second description is the text of
   * the `second-description` unit, whitespace included, or the empty text
   * when there is no such unit. Without a body and without a `:`, a string
   * that is empty once trimmed gives no description.
   */
  private walkAlias(
    statement: StateAliasDefinitionStatement,
    parent: string | null,
  ): void {
    const id = statement.id === null ? "" : this.valueOf(statement.id)
    const text = this.stringTextOf(statement.description)
    if (statement.body !== null) {
      this.visitComposite(id, parent, [text], statement.body)
      return
    }
    const descriptions = [trimmed(text)]
    // The second description, whose range is that of `stateDbTexts`, also
    // when it is empty or all whitespace.
    const second = this.dbTexts.secondDescriptions.get(statement)
    if (second !== undefined) {
      descriptions.push(this.text.of(second.range, second.leftOut))
    }
    this.visit(id, {
      parent,
      firstShape: "rect",
      descriptions:
        descriptions.length === 1 && descriptions[0] === "" ? [] : descriptions,
      bodyDirection: null,
      region: false,
    })
  }

  /**
   * The walk: a composite state with the body `body`, and a body with
   * dividers and statements after the last of them, which is walked as its
   * regions. A body whose last statement is a divider is walked as it is,
   * each divider adding a region without statements (provisional: the
   * specification does not say so yet).
   */
  private visitComposite(
    id: string,
    parent: string | null,
    descriptions: readonly string[],
    body: readonly StateStatement[],
  ): void {
    const dividers = body.filter(
      (statement) => statement.type === "StateDividerStatement",
    )
    const regions = dividers.length > 0 && body.at(-1) !== dividers.at(-1)
    // The direction statements of a body with regions lie in its regions.
    this.visit(id, {
      parent,
      firstShape: "rect",
      descriptions,
      bodyDirection: regions ? "TB" : (lastDirectionOf(body) ?? "TB"),
      region: false,
    })
    if (!regions) {
      for (const statement of body) {
        if (statement.type === "StateDividerStatement") {
          this.visit(this.dividerIdOf(statement), {
            parent: id,
            firstShape: "divider",
            descriptions: [],
            bodyDirection: null,
            region: true,
          })
        } else this.walkStatement(statement, id)
      }
      return
    }
    let region: StateStatement[] = []
    for (const statement of body) {
      if (statement.type !== "StateDividerStatement") {
        region.push(statement)
        continue
      }
      this.walkRegion(this.dividerIdOf(statement), id, region)
      region = []
    }
    this.generatedRegions += 1
    this.walkRegion(`generated-region-${this.generatedRegions}`, id, region)
  }

  /** Regions: the id of the region that the divider `divider` closes. */
  private dividerIdOf(divider: StateDividerStatement): string {
    const number = this.dividerNumbers.get(divider)
    if (number === undefined) throw new Error("state Db: an unnumbered divider")
    return `divider-id-${number}`
  }

  /** Regions: visits the region `id` of the composite state `parent`, and walks its statements. */
  private walkRegion(
    id: string,
    parent: string,
    statements: readonly StateStatement[],
  ): void {
    this.visit(id, {
      parent,
      firstShape: "divider",
      descriptions: [],
      bodyDirection: lastDirectionOf(statements) ?? "TB",
      region: true,
    })
    this.walk(statements, id)
  }

  /**
   * The walk: a note visits its state, and adds a note: its position as
   * written, and, on one line, the text from right after the `note-id`
   * unit to the end of the `note-text` unit, without its first two
   * characters and without the whitespace at its ends; over lines, the
   * value of its text.
   */
  private walkNote(statement: StateNoteStatement, parent: string | null): void {
    // An empty note id is the empty state, which is not visited.
    const state = statement.state === null ? "" : this.valueOf(statement.state)
    if (statement.state !== null) {
      this.visit(state, {
        parent,
        firstShape: null,
        descriptions: [],
        bodyDirection: null,
        region: false,
      })
    }
    const position = this.source.unitIn(statement.range, "position")
    if (position === null) throw new Error("state Db: a note has no position")
    const overLines = this.source.unitIn(statement.range, "end note") !== null
    let text: string
    if (overLines) {
      text = statement.text === null ? "" : this.valueOf(statement.text)
    } else {
      // The text from the end of the `note-id` to the end of the
      // `note-text`, whose range is that of `stateDbTexts`.
      const afterIdText = this.dbTexts.noteTexts.get(statement)
      if (afterIdText === undefined) {
        throw new Error("state Db: a note on one line has no id or text")
      }
      const afterId = [...this.text.of(afterIdText.range, afterIdText.leftOut)]
      text = trimmed(afterId.slice(2).join(""))
    }
    this.notes.push({ state, position: position.text, text })
  }

  /**
   * The walk: visiting a state adds a node with its id, when there is
   * none, and sets its parent, its descriptions, its shape, and its
   * direction.
   */
  private visit(id: string, visit: Visit): void {
    if (IDS_WITHOUT_NODE.includes(id)) return
    let state = this.states.get(id)
    if (state === undefined) {
      state = {
        id,
        shape: visit.firstShape ?? undefined,
        descriptions: [id],
        described: false,
        hasBody: false,
        region: visit.region,
        parentId: undefined,
        dir: undefined,
      }
      this.states.set(id, state)
    }
    if (visit.parent !== null) state.parentId = visit.parent
    if (visit.descriptions.length > 0) {
      if (state.described) state.descriptions.push(...visit.descriptions)
      else state.descriptions = [...visit.descriptions]
      state.described = true
      if (state.descriptions.length > 1) state.shape = "rectWithTitle"
      else state.shape = state.hasBody ? "roundedWithTitle" : "rect"
    }
    if (visit.bodyDirection !== null && !state.hasBody) {
      state.shape = visit.region ? "divider" : "roundedWithTitle"
      state.dir = visit.bodyDirection
      state.hasBody = true
    }
  }

  /** After the walk: the summary of one state, with its label and descriptions. */
  private summaryOfState(state: StateEntry): JsonObject {
    const [label, ...others] = state.descriptions
    return {
      id: state.id,
      ...(state.shape === undefined ? {} : { shape: state.shape }),
      label: state.region ? "" : label,
      ...(state.described && !state.region ? { description: others } : {}),
      classes: this.classes.get(state.id) ?? [],
      styles: this.styles.get(state.id) ?? [],
      ...(state.parentId === undefined ? {} : { parentId: state.parentId }),
      ...(state.dir === undefined ? {} : { dir: state.dir }),
    }
  }

  /**
   * Classes and styles, class definitions, links, and accessibility
   * statements: what a statement at the top level adds.
   */
  private applyTopLevel(statement: StateStatement): void {
    switch (statement.type) {
      case "StateTransitionStatement":
        this.addReferenceClass(statement.from, "_start")
        this.addReferenceClass(statement.to, "_end")
        return
      case "StateClassStatement": {
        const cssClass =
          statement.cssClass === null ? "" : this.valueOf(statement.cssClass)
        for (const state of statement.states) {
          this.addClass(this.valueOf(state), cssClass)
        }
        return
      }
      case "StateStyleStatement": {
        // The text after the ids gives at least one part, also when it is
        // empty or all whitespace.
        const keyword = this.source.unitIn(statement.range, "style")
        if (keyword === null) throw new Error("state Db: a style without style")
        const parts = this.partsAfter(this.source.lastIdUnitAfter(keyword))
        const styles = (parts.length === 0 ? [""] : parts).map((part) =>
          trimmed(part.split(";").join("")),
        )
        for (const state of statement.states) {
          if (state !== null) this.styles.set(this.valueOf(state), styles)
        }
        return
      }
      case "StateClassDefStatement": {
        const name = this.source.unitIn(statement.range, "class-name")
        if (name === null) throw new Error("state Db: a classDef without name")
        const id = this.valueOf(statement.cssClass)
        const styles = this.classDefs.get(id) ?? []
        for (const part of this.partsAfter(name)) {
          styles.push(trimmed(part.replace(";", "")))
        }
        this.classDefs.set(id, styles)
        return
      }
      case "StateClickStatement":
        this.links.push({
          state:
            statement.reference.state.type === "StateTerminal"
              ? "[*]"
              : this.valueOf(statement.reference.state),
          url: this.valueOf(statement.url),
          tooltip:
            statement.tooltip === null ? "" : this.valueOf(statement.tooltip),
        })
        return
      case "StateAccTitleStatement":
        this.accTitle =
          statement.value === null ? "" : this.valueOf(statement.value)
        return
      case "StateAccDescrStatement":
        this.accDescr =
          statement.value === null
            ? ""
            : descriptionOf(this.valueOf(statement.value))
        return
      case "StateAccDescrBlockStatement":
        // A block that is not closed sets the empty description; a closed
        // block without text changes nothing.
        if (!statement.closed) this.accDescr = ""
        else if (statement.value !== null) {
          this.accDescr = descriptionOf(this.valueOf(statement.value))
        }
        break
      default:
        // The other statements add nothing here.
        break
    }
  }

  /** Classes and styles: the class after `:::` of a reference in a transition at the top level. */
  private addReferenceClass(
    reference: StateReference,
    suffix: "_start" | "_end",
  ): void {
    if (reference.cssClass === null) return
    const id =
      reference.state.type === "StateTerminal"
        ? `root${suffix}`
        : this.valueOf(reference.state)
    this.addClass(id, this.valueOf(reference.cssClass))
  }

  /** Classes and styles: adds the class `cssClass` to the state `id`. */
  private addClass(id: string, cssClass: string): void {
    const classes = this.classes.get(id) ?? []
    classes.push(cssClass)
    this.classes.set(id, classes)
  }

  /**
   * Classes and styles, and class definitions: the parts of the text of
   * the styles context after the unit `before`, empty parts included.
   */
  private partsAfter(before: Unit): string[] {
    return this.source
      .stylePartsAfter(before)
      .map((part) =>
        part === null ? "" : this.text.of([part.start, part.end]),
      )
  }

  /** The converted form of the text of a leaf node; a string with its quotes. */
  private valueOf(node: Identifier | StateLiteral | StringLiteral): string {
    return this.text.of(node.range)
  }

  /** The converted form of the text of the string `string` between its quotes. */
  private stringTextOf(string: StringLiteral): string {
    const [start, end] = string.range
    return this.text.of([start + 1, end - 1])
  }
}

/** The statements of the body of `statement`; null when it has none. */
function bodyOf(statement: StateStatement): readonly StateStatement[] | null {
  if (
    statement.type === "StateCompositeStatement" ||
    statement.type === "StateAliasDefinitionStatement"
  ) {
    return statement.body
  }
  return null
}

/** The direction of the last direction statement of `statements`; null when there is none. */
function lastDirectionOf(statements: readonly StateStatement[]): string | null {
  const directions = statements.flatMap((statement) =>
    statement.type === "StateDirectionStatement" ? [statement.direction] : [],
  )
  return directions.at(-1) ?? null
}

/**
 * Test helper: the Db summary that the state tree `diagram` of the source
 * `source` denotes (see `dbOf()`).
 */
export function stateDbOf(
  source: string,
  root: Root,
  diagram: StateDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new StateDbBuilder(source, root, embedded).summaryOf(diagram)
}
