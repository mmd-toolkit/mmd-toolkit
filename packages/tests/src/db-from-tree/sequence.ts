import type { DataBlockEffect, EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  SequenceArrow,
  SequenceArrowMarker,
  SequenceBoxStatement,
  SequenceBoxText,
  SequenceDiagram,
  SequenceIdentifier,
  SequenceLiteral,
  SequenceMessageStatement,
  SequenceNoteStatement,
  SequenceParticipantStatement,
  SequenceSection,
  SequenceStatement,
  SequenceText,
  SequenceTitleStatement,
} from "./sequence-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { NumericLiteral, TreeRoot } from "./tree.ts"
import { descriptionOf, setOwnProperty, trimmed } from "./values.ts"

// docs/db-from-tree/sequence.md: the summary of the Db that a
// sequence tree denotes, in the form of `normalizeSequence()` of
// `@mmd-toolkit/tests`. Every step below is a paragraph of "Building the
// summary from the tree", and its comment names it. Each step reads the
// values of the tree in converted form (see `converted-text.ts`).

/**
 * Box colours: whether the colour candidate of a box is a colour, which
 * mermaid.js asks the browser. The answer is given from outside the tree.
 */
export type ColorAnswer = (candidate: string) => boolean

/**
 * Links and properties: an object whose keys an author wrote, as mermaid.js
 * fills it, by assignment: a key `__proto__` sets its prototype when the
 * value is an object or null, and is otherwise ignored. The summary records
 * such a prototype as a first entry `__proto__`.
 */
class AuthorObject {
  private prototype: object | null = null

  private readonly entries = new Map<string, unknown>()

  /** `object[key] = value`. */
  public assign(key: string, value: unknown): void {
    if (key !== "__proto__") {
      this.entries.set(key, value)
    } else if (typeof value === "object") {
      this.prototype = value
    }
  }

  /** The summary of the object. */
  public toJSON(): Record<string, unknown> {
    const summary: Record<string, unknown> = {}
    if (this.prototype !== null) {
      setOwnProperty(summary, "__proto__", this.prototype)
    }
    for (const [key, value] of this.entries) {
      setOwnProperty(summary, key, value)
    }
    return summary
  }
}

/** The summary: one participant. */
interface Participant {
  name: string
  description: string
  wrap: boolean
  links: AuthorObject
  properties: AuthorObject
  type: string
  prevActor?: string
  nextActor?: string
  box?: number
}

/** The summary: one box. */
interface Box {
  name?: string
  wrap: boolean
  fill: string
  actorKeys: string[]
}

/** The arrows: the half markers, in the order of the numbers that they give. */
const HALF_MARKERS: readonly SequenceArrowMarker[] = [
  "half-arrow-top",
  "half-arrow-bottom",
  "half-stick-top",
  "half-stick-bottom",
]

/** The arrows: for the line `solid`, the `type` that an end marker gives with no half marker. */
const SOLID_TYPES_OF_END_MARKERS: Readonly<
  Partial<Record<SequenceArrowMarker, number>>
> = {
  none: 5,
  arrow: 0,
  cross: 3,
  "open-arrow": 24,
}

/** Blocks: the types of the entries of each block, at its start, at each later section, and at its `end`. */
const BLOCK_TYPES: Readonly<
  Record<
    | "SequenceLoopStatement"
    | "SequenceAltStatement"
    | "SequenceOptStatement"
    | "SequenceParStatement"
    | "SequenceRectStatement"
    | "SequenceCriticalStatement"
    | "SequenceBreakStatement"
    | "SequenceParOverStatement",
    {
      readonly start: number
      readonly section: number | null
      readonly end: number
    }
  >
> = {
  SequenceLoopStatement: { start: 10, section: null, end: 11 },
  SequenceAltStatement: { start: 12, section: 13, end: 14 },
  SequenceOptStatement: { start: 15, section: null, end: 16 },
  SequenceParStatement: { start: 19, section: 20, end: 21 },
  SequenceRectStatement: { start: 22, section: null, end: 23 },
  SequenceCriticalStatement: { start: 27, section: 28, end: 29 },
  SequenceBreakStatement: { start: 30, section: null, end: 31 },
  SequenceParOverStatement: { start: 32, section: 20, end: 21 },
}

/**
 * The arrows: the `type` of a message with the arrow `arrow`, from its line
 * and its markers: with an end marker that is a half marker, 41 to 44 for
 * the line `solid` and 51 to 54 for `dotted`; with such a start marker, 45
 * to 48 and 55 to 58; otherwise the number of the end marker for the line
 * `solid` (33 with the start and end marker `arrow`), one more for `dotted`.
 */
function arrowTypeOf(arrow: SequenceArrow): number {
  const dotted = arrow.line === "dotted"
  const endHalf = HALF_MARKERS.indexOf(arrow.endMarker)
  if (endHalf !== -1) return (dotted ? 51 : 41) + endHalf
  const startHalf = HALF_MARKERS.indexOf(arrow.startMarker)
  if (startHalf !== -1) return (dotted ? 55 : 45) + startHalf
  const solid =
    arrow.startMarker === "arrow" && arrow.endMarker === "arrow"
      ? 33
      : SOLID_TYPES_OF_END_MARKERS[arrow.endMarker]
  if (solid === undefined) {
    throw new Error(`sequence Db: unknown arrow ${JSON.stringify(arrow.value)}`)
  }
  return dotted ? solid + 1 : solid
}

/**
 * Box colours: the wrap prefix at the start of `text`, `wrap:` or
 * `nowrap:` after an optional `:`, and the rest of the text; the wrap is
 * null when there is no prefix.
 */
function withoutWrapPrefix(text: string): {
  readonly wrap: boolean | null
  readonly rest: string
} {
  const afterColon = text.startsWith(":") ? text.slice(1) : text
  if (afterColon.startsWith("wrap:")) {
    return { wrap: true, rest: afterColon.slice("wrap:".length) }
  }
  if (afterColon.startsWith("nowrap:")) {
    return { wrap: false, rest: afterColon.slice("nowrap:".length) }
  }
  return { wrap: null, rest: text }
}

/**
 * The builder of the summary: the statements are applied in source order,
 * a block's own entries before and after its body.
 */
class SequenceDbBuilder {
  private title: string

  private accTitle = ""

  private accDescr = ""

  private readonly actors = new Map<string, Participant>()

  /** The participant added last, the `prevActor` of the next one. */
  private lastActor: string | null = null

  private readonly boxes: Box[] = []

  private readonly createdActors = new Map<string, number>()

  private readonly destroyedActors = new Map<string, number>()

  private readonly messages: JsonObject[] = []

  /** The effects of the data blocks that are not applied yet, in source order. */
  private readonly dataBlockEffects: DataBlockEffect[]

  /** docs/db-from-tree/sequence.md: the wrap setting of the configuration, for a text without a wrap prefix. */
  private readonly wrapSetting: boolean

  private readonly isColor: ColorAnswer

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  private readonly root: TreeRoot

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  public constructor(
    source: string,
    root: TreeRoot,
    embedded: EmbeddedValues,
    isColor: ColorAnswer,
  ) {
    this.root = root
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
    this.title = this.replace(embedded.title ?? "")
    this.dataBlockEffects = [...embedded.dataBlockEffects]
    this.wrapSetting = wrapSettingOf(embedded.config)
    this.isColor = isColor
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: SequenceDiagram): DbSummary {
    this.applyAll(diagram.body, null)
    if (this.dataBlockEffects.length > 0) {
      throw new Error(
        `sequence Db: mermaid.js applied ${this.dataBlockEffects.length} more data blocks than the tree has`,
      )
    }
    return {
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      actors: [...this.actors.values()].map(
        (actor) =>
          ({
            ...actor,
            links: actor.links.toJSON(),
            properties: actor.properties.toJSON(),
          }) as unknown as JsonObject,
      ),
      boxes: this.boxes.map((box) => ({ ...box })),
      createdActors: [...this.createdActors].map(([id, messageIndex]) => ({
        id,
        messageIndex,
      })),
      destroyedActors: [...this.destroyedActors].map(([id, messageIndex]) => ({
        id,
        messageIndex,
      })),
      messages: this.messages,
    }
  }

  /** Applies `statements` in source order; `box` is the box they stand in, if any. */
  private applyAll(
    statements: readonly SequenceStatement[],
    box: number | null,
  ): void {
    for (const statement of statements) this.apply(statement, box)
  }

  /** Building the summary from the tree: one statement. */
  private apply(statement: SequenceStatement, box: number | null): void {
    switch (statement.type) {
      case "SequenceParticipantStatement":
        this.applyParticipantStatement(statement, box)
        return
      case "SequenceDestroyStatement": {
        const id = this.idOf(statement.id)
        if (statement.created) {
          // Create and destroy: as `create participant` with the id.
          this.addParticipant(id, id, this.wrapSetting, "participant", box)
          this.createdActors.set(id, this.messages.length)
        } else {
          this.destroyedActors.set(id, this.messages.length)
        }
        return
      }
      case "SequenceBoxStatement":
        this.applyBox(statement)
        return
      case "SequenceMessageStatement":
        this.applyMessage(statement)
        return
      case "SequenceAutonumberStatement": {
        const message: JsonObject =
          statement.start === null
            ? { visible: !statement.off }
            : {
                visible: true,
                start: this.numberOf(statement.start),
                step:
                  statement.step === null ? 1 : this.numberOf(statement.step),
              }
        this.messages.push({ message, wrap: false, type: 26 })
        return
      }
      case "SequenceActivateStatement":
        this.addEntryFor(this.idOf(statement.id), 17)
        return
      case "SequenceDeactivateStatement":
        this.addEntryFor(this.idOf(statement.id), 18)
        return
      case "SequenceNoteStatement":
        this.applyNote(statement)
        return
      case "SequenceLinksStatement":
      case "SequencePropertiesStatement": {
        const id = this.idOf(statement.id)
        this.addMentioned(id)
        const field =
          statement.type === "SequenceLinksStatement" ? "links" : "properties"
        this.copyJsonKeys(id, field, this.textOf(statement.text))
        return
      }
      case "SequenceLinkStatement": {
        const id = this.idOf(statement.id)
        this.addMentioned(id)
        const { label, url } = linkOf(this.replace(this.textOf(statement.text)))
        this.actorOf(id).links.assign(label, url)
        return
      }
      case "SequenceDetailsStatement":
        // Links and properties: mermaid.js looks for an element of the
        // page, and the summary is made as on a page without one.
        this.addMentioned(this.idOf(statement.id))
        return
      case "SequenceTitleStatement":
        this.applyTitle(statement)
        return
      case "SequenceAccTitleStatement":
        this.accTitle = this.replace(this.literalTextOf(statement.value) ?? "")
        return
      case "SequenceAccDescrStatement": {
        const value = this.literalTextOf(statement.value)
        this.accDescr = value === null ? "" : this.replace(descriptionOf(value))
        return
      }
      case "SequenceAccDescrBlockStatement": {
        // A block that is not closed sets the empty description, whatever
        // its text; a closed block without text changes nothing.
        const value = this.literalTextOf(statement.value)
        if (!statement.closed) this.accDescr = ""
        else if (value !== null) {
          this.accDescr = this.replace(descriptionOf(value))
        }
        return
      }
      case "SequenceLoopStatement":
      case "SequenceOptStatement":
      case "SequenceBreakStatement":
        this.applyBlock(statement.type, [
          { text: statement.text, body: statement.body },
        ])
        return
      case "SequenceRectStatement":
        this.applyBlock(statement.type, [
          { text: statement.color, body: statement.body },
        ])
        return
      case "SequenceAltStatement":
      case "SequenceParStatement":
      case "SequenceParOverStatement":
      case "SequenceCriticalStatement":
        this.applyBlock(statement.type, statement.sections)
        return
      case "SequenceIgnoredStatement":
        return
      default:
        throw new Error(
          `sequence Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Participants: a participant statement adds its id with the description
   * of its `as` text, if any, and its kind, after `create` when it has one;
   * then the effect of its data block is applied.
   */
  private applyParticipantStatement(
    statement: SequenceParticipantStatement,
    box: number | null,
  ): void {
    const id = this.idOf(statement.id)
    // The statement has a description when it has `as`, which is the empty
    // text when nothing follows `as`; the tree then has no `alias` node, and
    // the `as` shows in the tokens only.
    const hasAs = this.root.tokens.some(
      (token) =>
        token.type === "Keyword" &&
        token.value.toLowerCase() === "as" &&
        statement.range[0] <= token.range[0] &&
        token.range[1] <= statement.range[1],
    )
    const description = hasAs ? this.textOf(statement.alias) : null
    const wrap = this.wrapOf(statement.alias)
    this.addParticipant(id, description, wrap, statement.kind, box)
    if (statement.created) this.createdActors.set(id, this.messages.length)
    if (statement.data !== null) this.applyDataBlock(id)
  }

  /**
   * Participants: adds a participant with the id `id`, the description
   * `description` (null when there is none), its wrap, and the kind `type`,
   * inside the box `box` when it stands in one.
   */
  private addParticipant(
    id: string,
    description: string | null,
    wrap: boolean,
    type: string,
    box: number | null,
  ): void {
    const existing = this.actors.get(id)
    // Inside a box, a participant that exists already and has no box gets
    // the box, before anything else.
    if (box !== null && existing !== undefined && existing.box === undefined) {
      existing.box = box
    }
    if (existing !== undefined && description === null) return
    const actor: Participant = {
      name: id,
      description: description ?? id,
      wrap,
      links: new AuthorObject(),
      properties: new AuthorObject(),
      type,
    }
    if (this.lastActor !== null) actor.prevActor = this.lastActor
    const keptBox = existing?.box
    if (keptBox !== undefined) actor.box = keptBox
    else if (box !== null) actor.box = box
    this.actors.set(id, actor)
    if (this.lastActor !== null) {
      const previous = this.actors.get(this.lastActor)
      if (previous !== undefined) previous.nextActor = id
    }
    this.lastActor = id
    if (box !== null) this.boxes[box].actorKeys.push(id)
  }

  /**
   * Participants: a message, a note, and a `links`, `link`, `properties`, or
   * `details` statement add each id they name with no description and the
   * kind `participant`.
   */
  private addMentioned(id: string): void {
    this.addParticipant(id, null, this.wrapSetting, "participant", null)
  }

  /** The participant with the id `id`, which is added already. */
  private actorOf(id: string): Participant {
    const actor = this.actors.get(id)
    if (actor === undefined) {
      throw new Error(`sequence Db: no participant ${JSON.stringify(id)}`)
    }
    return actor
  }

  /** Data blocks in the Db: the next entry of `dataBlockEffects`, for the participant `id`. */
  private applyDataBlock(id: string): void {
    const effect = this.dataBlockEffects.shift()
    if (effect === undefined) {
      throw new Error(
        `sequence Db: mermaid.js applied no data block for the one of ${JSON.stringify(id)}`,
      )
    }
    if (effect.id !== id) {
      throw new Error(
        `sequence Db: mermaid.js applied a data block of ${JSON.stringify(effect.id)} for the one of ${JSON.stringify(id)}`,
      )
    }
    const actor = this.actorOf(id)
    for (const [key, value] of Object.entries(effect.set)) {
      setOwnProperty(actor, key, value)
    }
  }

  /** Boxes: a box, its entry in `boxes`, and the participant statements inside it. */
  private applyBox(statement: SequenceBoxStatement): void {
    const box = this.boxes.length
    this.boxes.push(this.boxOf(statement.text))
    this.applyAll(statement.body, box)
  }

  /**
   * Box colours: the `name`, `fill`, and `wrap` of a box with the text
   * `text`, given whether its colour candidate is a colour.
   */
  private boxOf(text: SequenceBoxText | null): Box {
    if (text === null) {
      return { wrap: this.wrapSetting, fill: "transparent", actorKeys: [] }
    }
    const candidate =
      text.colorCandidate === null
        ? null
        : this.text.of(text.colorCandidate.range)
    // The split gets the box text, whose parts keep U+2028 and U+2029, and
    // reads a U+2028 or U+2029 only in the whitespace between the name of a
    // colour function and its `(`, the only whitespace that a colour
    // candidate holds before its first `(`. With one anywhere else in the
    // text, its end included, it does not match, and the box has no name and
    // no colour.
    const splitText = this.text.of(text.range)
    const separatorsReadUpTo =
      candidate === null ? 0 : Math.max(candidate.indexOf("("), 0)
    const unreadPart = splitText.slice(separatorsReadUpTo)
    if (unreadPart.includes("\u2028") || unreadPart.includes("\u2029")) {
      return { wrap: this.wrapSetting, fill: "transparent", actorKeys: [] }
    }
    const isColor = candidate !== null && this.isColor(candidate)
    let nameText: string
    if (isColor) {
      nameText =
        text.remainder === null ? "" : this.text.of(text.remainder.range)
    } else {
      nameText = this.text.of(text.range)
    }
    const { wrap, rest } = withoutWrapPrefix(nameText)
    const name = this.replace(trimmed(rest))
    return {
      ...(name === "" ? {} : { name }),
      wrap: wrap ?? this.wrapSetting,
      fill: isColor && candidate !== null ? candidate : "transparent",
      actorKeys: [],
    }
  }

  /** Messages: a message statement and the entries after it. */
  private applyMessage(statement: SequenceMessageStatement): void {
    const from = this.idOf(statement.from)
    const to = this.idOf(statement.to)
    this.addMentioned(from)
    this.addMentioned(to)
    const central =
      statement.fromCentralConnection && statement.toCentralConnection
        ? 61
        : statement.toCentralConnection
          ? 59
          : statement.fromCentralConnection
            ? 60
            : 0
    this.messages.push({
      from,
      to,
      message: this.textOf(statement.text),
      wrap: this.wrapOf(statement.text),
      type: arrowTypeOf(statement.arrow),
      activate:
        statement.activation === "+" || central === 59 || central === 61,
      centralConnection: central,
    })
    if (statement.activation === "+") this.addEntryFor(to, 17)
    if (statement.activation === "-") this.addEntryFor(from, 18)
    if (statement.toCentralConnection) this.addEntryFor(to, 59)
    if (statement.fromCentralConnection) this.addEntryFor(from, 60)
  }

  /** Messages: an entry for one participant, of type `type`. */
  private addEntryFor(id: string, type: number): void {
    this.messages.push({
      from: id,
      message: "",
      wrap: this.wrapSetting,
      type,
      activate: false,
      centralConnection: 0,
    })
  }

  /** Notes: a note statement. */
  private applyNote(statement: SequenceNoteStatement): void {
    for (const id of statement.ids) this.addMentioned(this.idOf(id))
    const [first, second] = statement.ids
    this.messages.push({
      from: this.idOf(first),
      to: this.idOf(second ?? first),
      message: this.textOf(statement.text),
      wrap: this.wrapOf(statement.text),
      type: 2,
      placement:
        statement.placement === "left of"
          ? 0
          : statement.placement === "right of"
            ? 1
            : 2,
    })
  }

  /** Blocks: the entry at the start, one for each later section, the body of each, and the entry at `end`. */
  private applyBlock(
    type: keyof typeof BLOCK_TYPES,
    sections: readonly Pick<SequenceSection, "text" | "body">[],
  ): void {
    const types = BLOCK_TYPES[type]
    sections.forEach((section, index) => {
      const entryType = index === 0 ? types.start : types.section
      if (entryType === null) {
        throw new Error(`sequence Db: ${type} has no sections`)
      }
      this.messages.push(this.blockEntry(section.text, entryType))
      this.applyAll(section.body, null)
    })
    this.messages.push({
      message: "",
      wrap: this.wrapSetting,
      type: types.end,
      activate: false,
      centralConnection: 0,
    })
  }

  /** Blocks: the entry of a block's start or section with the text `text`. */
  private blockEntry(text: SequenceText | null, type: number): JsonObject {
    return {
      message: this.textOf(text),
      wrap: this.wrapOf(text),
      type,
      activate: false,
      centralConnection: 0,
    }
  }

  /** Titles: `title` sets the title to the value of its SequenceTitleStatement, the text of its `title-text` unit as written, whitespace included. */
  private applyTitle(statement: SequenceTitleStatement): void {
    this.title = this.replace(this.text.of(statement.value.range))
  }

  /**
   * Links and properties: reads `text` as JSON and copies each key of the
   * value into the participant's `field`: the names of an object, the
   * elements of an array and the UTF-16 code units of a string under their
   * positions from 0, and nothing for a number, `true`, `false`, or
   * `null`. A text that is not JSON changes nothing.
   */
  private copyJsonKeys(
    id: string,
    field: "links" | "properties",
    text: string,
  ): void {
    // The text that mermaid.js reads as JSON is the text after the
    // replacement of characters, and, for links, with `&equals;` written as
    // `=` again.
    const replaced = this.replace(text)
    let value: unknown
    try {
      value = JSON.parse(
        field === "links" ? withEqualsSigns(replaced) : replaced,
      )
    } catch {
      return
    }
    const target = this.actorOf(id)[field]
    for (const [key, entry] of jsonKeysOf(value)) target.assign(key, entry)
  }

  /** Text parts: the text of a text part, without the whitespace at its ends, or the empty text when there is none. */
  private textOf(text: SequenceText | null): string {
    return this.literalTextOf(text?.value ?? null) ?? ""
  }

  /** Text parts: the wrap of a text part: true after `wrap:`, false after `nowrap:`, and the wrap setting otherwise. */
  private wrapOf(text: SequenceText | null): boolean {
    if (text?.wrap === "wrap") return true
    if (text?.wrap === "nowrap") return false
    return this.wrapSetting
  }

  /** Autonumber: the number that the converted form of a number writes, or its text where it is no finite number (the summary has no `Infinity`). */
  private numberOf(literal: NumericLiteral): number | string {
    return numberOrText(Number(this.text.of(literal.range)))
  }

  /**
   * Participants: the id of `id` in converted form, as the lexer reads it
   * (an entity in an id is its placeholder). The whitespace that a directive
   * in the id has on its sides is part of it, as in the written name.
   */
  private idOf(id: SequenceIdentifier): string {
    return this.text.of(id.range)
  }

  /** The converted form of the value of `literal`; null when there is none. */
  private literalTextOf(literal: SequenceLiteral | null): string | null {
    return literal === null ? null : this.text.of(literal.range)
  }
}

/** Links and properties: the keys of the JSON value `value`, with their values, in order. */
function jsonKeysOf(value: unknown): [string, unknown][] {
  if (typeof value === "string") {
    const keys: [string, unknown][] = []
    for (let index = 0; index < value.length; index += 1) {
      keys.push([String(index), value[index]])
    }
    return keys
  }
  if (Array.isArray(value)) {
    return value.map((entry: unknown, index): [string, unknown] => [
      String(index),
      entry,
    ])
  }
  if (typeof value === "object" && value !== null) return Object.entries(value)
  return []
}

/** Links and properties: `text` with each `&equals;`, which the replacement of characters writes for `=`, written as `=` again. */
function withEqualsSigns(text: string): string {
  return text.replaceAll("&equals;", "=")
}

/**
 * Links and properties: the label and the URL of a `link` text, given as the
 * text after the replacement of characters: the position of the first `@` is
 * taken in that text, and the label and the URL are cut, at that position,
 * from the text with `&equals;` written as `=` again. The label is the text
 * before the `@` without the character just before the `@`, and the URL the
 * text after that `@`, each without whitespace at its ends. When the `@` is
 * the first character, the label is the text without its last character;
 * when it is the second, the label is empty. Without an `@`, the label is
 * the text without its last two characters, and the URL the whole text.
 */
function linkOf(replaced: string): {
  readonly label: string
  readonly url: string
} {
  const at = replaced.indexOf("@")
  const text = withEqualsSigns(replaced)
  if (at === -1) {
    return { label: trimmed(text.slice(0, -2)), url: trimmed(text) }
  }
  const url = trimmed(text.slice(at + 1))
  if (at === 0) return { label: trimmed(text.slice(0, -1)), url }
  return { label: trimmed(text.slice(0, at - 1)), url }
}

/** docs/db-from-tree/sequence.md: true when `wrap` or `sequence.wrap` of the configuration is true. */
function wrapSettingOf(config: EmbeddedValues["config"]): boolean {
  const record = config as Record<string, unknown>
  if (record.wrap === true) return true
  const sequence = record.sequence
  return (
    typeof sequence === "object" &&
    sequence !== null &&
    "wrap" in sequence &&
    sequence.wrap === true
  )
}

/**
 * docs/db-from-tree/sequence.md: the summary of the Db that the
 * sequence `diagram` denotes. The title, the configuration, and the effects
 * of the data blocks come from mermaid.js through `embedded`, and whether a
 * box's colour candidate is a colour through `isColor`: the tree does not
 * read embedded data, and the answer about a colour is not in the text.
 */
export function sequenceDbOf(
  source: string,
  root: TreeRoot,
  diagram: SequenceDiagram,
  embedded: EmbeddedValues,
  isColor: ColorAnswer,
): DbSummary {
  return new SequenceDbBuilder(source, root, embedded, isColor).summaryOf(
    diagram,
  )
}
