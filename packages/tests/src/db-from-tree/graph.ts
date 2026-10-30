import type { ConvertedCharacter } from "./converted-text.ts"
import type { TreeRange, TreeRoot } from "./tree.ts"

// diagrams/flowchart.md and diagrams/agentflow.md, Strings: where the content of a string lies in the
// source. A string is one unit from its opening `"` to its closing `"`; the
// lexer reads it in nested contexts, and the value of a string is the one
// run of content that the contexts read, so what the contexts read besides
// the run, their delimiters, is left out of the value. The tree has the
// tokens of the string, not the contexts, so the contexts are read again from
// the converted form of the text, as the lexer reads it: a `"` that is an
// attribute quote is a `'` there, and a comment region, which cuts the tokens
// of a string, is not there.

const QUOTE = '"'

const BACKTICK = "`"

/** The context that the lexer is in while it reads a string. */
type StringContext = "string" | "markdown"

/** Where the content run of a string lies among the characters that it is read from, by index. */
interface StringUnit {
  /** The index of the first character of the content run. */
  readonly contentStart: number
  /** The index after the last character of the content run. */
  readonly contentEnd: number
  /** The index after the last character of the string: its closing `"`. */
  readonly end: number
}

/**
 * Strings: reads the string that starts at the index `from` of `characters`,
 * with the rules of the string context and of the markdown string context,
 * and returns where its content run lies. The string ends when the lexer
 * leaves the context that its opening `"` entered.
 */
function readStringUnit(
  characters: readonly string[],
  from: number,
): StringUnit {
  /** The character at `index`, or the empty text after the last. */
  function at(index: number): string {
    return characters[index] ?? ""
  }

  const contexts: StringContext[] = []
  let index = from
  // The opening `"` enters the markdown string context when a backtick
  // follows it, and the string context otherwise.
  if (at(index) === QUOTE && at(index + 1) === BACKTICK) {
    contexts.push("markdown")
    index += 2
  } else if (at(index) === QUOTE) {
    contexts.push("string")
    index += 1
  } else {
    throw new Error(
      `graph Db: a string starts with ${JSON.stringify(at(index))}`,
    )
  }
  let contentStart = -1
  let contentEnd = -1
  let runs = 0

  /** Reads a run of content: the characters up to one of `stops`. */
  function readRun(stops: readonly string[]): void {
    const start = index
    while (index < characters.length && !stops.includes(at(index))) index += 1
    runs += 1
    if (contentStart === -1) contentStart = start
    contentEnd = index
  }

  while (contexts.length > 0) {
    if (index >= characters.length) {
      throw new Error("graph Db: a string is not closed")
    }
    const here = at(index)
    const next = at(index + 1)
    if (contexts.at(-1) === "string") {
      if (here === QUOTE && next === BACKTICK) {
        contexts.push("markdown")
        index += 2
      } else if (here === QUOTE) {
        contexts.pop()
        index += 1
      } else {
        readRun([QUOTE])
      }
    } else if (here === BACKTICK && next === QUOTE) {
      contexts.pop()
      index += 2
    } else if (here === QUOTE && next === BACKTICK) {
      contexts.push("markdown")
      index += 2
    } else if (here === QUOTE) {
      contexts.push("string")
      index += 1
    } else if (here === BACKTICK) {
      throw new Error(
        "graph Db: a backtick in a markdown string matches no rule",
      )
    } else {
      readRun([BACKTICK, QUOTE])
    }
  }
  // Only one nonempty run supplies a string value. Recognized empty forms
  // retained as IgnoredText have RawText tokens and do not use this reader.
  if (runs !== 1) {
    throw new Error(`graph Db: a string with ${runs} runs of content`)
  }
  return { contentStart, contentEnd, end: index }
}

/**
 * The delimiters of the strings of a tree. A string is one `String` token,
 * or, where a comment region or a `;` that the line rule ignores cuts it,
 * `StringFragment` tokens, the first of which starts at the opening `"`.
 */
export class StringDelimiters {
  /** The converted form of the diagram text, one character each, as the lexer reads it. */
  private readonly characters: readonly string[]

  /** The offset of each converted character. */
  private readonly offsets: readonly number[]

  /** The index of the first converted character at each offset where a token of a string starts. */
  private readonly stringStarts = new Map<number, number>()

  public constructor(
    root: TreeRoot,
    characters: readonly ConvertedCharacter[],
  ) {
    this.characters = characters.map(({ codePoint }) =>
      String.fromCodePoint(codePoint),
    )
    this.offsets = characters.map(({ start }) => start)
    const tokenStarts = new Set<number>()
    for (const token of root.tokens) {
      if (token.type === "String" || token.type === "StringFragment") {
        tokenStarts.add(token.range[0])
      }
    }
    this.offsets.forEach((offset, index) => {
      if (tokenStarts.has(offset) && !this.stringStarts.has(offset)) {
        this.stringStarts.set(offset, index)
      }
    })
  }

  /**
   * What the value of the node with the range `range` leaves out of it: the
   * delimiters around the content of the string or markdown string that its
   * first token starts, the opening ones before the content and the closing
   * ones after it. None when the node does not start with a string.
   */
  public around(range: TreeRange): TreeRange[] {
    const first = this.stringStarts.get(range[0])
    if (first === undefined) return []
    const unit = readStringUnit(this.characters, first)
    return [
      [this.offsetAt(first), this.offsetAt(unit.contentStart - 1) + 1],
      [this.offsetAt(unit.contentEnd), this.offsetAt(unit.end - 1) + 1],
    ]
  }

  /** The offset of the converted character `index`. */
  private offsetAt(index: number): number {
    const offset = this.offsets[index]
    if (offset === undefined) {
      throw new Error(`graph Db: no converted character ${index}`)
    }
    return offset
  }
}

/** A graph element that receives classes. */
interface ClassifiedElement {
  readonly id: string
  readonly classes: string[]
}

/** A graph vertex that can receive a click URL. */
interface LinkedVertex extends ClassifiedElement {
  link?: string
  linkTarget?: string
}

/** A graph edge that can receive numbered link styles. */
interface StyledEdge {
  interpolate?: string
  style?: string[]
}

/** The last authored container with this id, shared by the two graph Db readings. */
export function lastGraphWithId<T extends ClassifiedElement>(
  containers: readonly T[],
  id: string,
): T | undefined {
  return containers.findLast((container) => container.id === id)
}

/** The class step: vertex, first edge and last container, independently. */
export function applyGraphClass(
  ids: readonly string[],
  cssClass: string,
  vertices: ReadonlyMap<string, ClassifiedElement>,
  edges: readonly ClassifiedElement[],
  containers: readonly ClassifiedElement[],
): void {
  for (const id of ids) {
    vertices.get(id)?.classes.push(cssClass)
    edges.find((edge) => edge.id === id)?.classes.push(cssClass)
    lastGraphWithId(containers, id)?.classes.push(cssClass)
  }
}

/** Numbered link styles affect existing edges and supply fill:none when absent. */
export function applyGraphLinkStyle(
  indices: readonly number[],
  interpolate: string | null,
  styles: string[],
  edges: readonly StyledEdge[],
): void {
  if (styles.length > 0 && !styles.some((style) => style.startsWith("fill")))
    styles.push("fill:none")
  for (const index of indices) {
    const edge = edges[index]
    if (edge === undefined)
      throw new Error(
        `graph Db: linkStyle numbers the link ${index}, which no statement before it made`,
      )
    if (interpolate !== null) edge.interpolate = interpolate
    if (styles.length > 0) edge.style = styles
  }
}

/** A click's values after the diagram-specific AST fields have been read. */
export type GraphClick =
  | {
      readonly kind: "callback"
      readonly name: string
      readonly args: string | null
    }
  | {
      readonly kind: "url"
      readonly url: string
      readonly target: string | null
    }

/** Click effects: calls or vertex links, the clickable class, then tooltips. */
export function applyGraphClick(
  ids: readonly string[],
  click: GraphClick,
  tooltip: string | null,
  vertices: ReadonlyMap<string, LinkedVertex>,
  edges: readonly ClassifiedElement[],
  containers: readonly ClassifiedElement[],
  calls: { id: string; name: string; args: string | null }[],
  tooltips: Map<string, string>,
): void {
  for (const id of ids) {
    if (click.kind === "callback") {
      // Calls are recorded even when the id names no vertex.
      calls.push({ id, name: click.name, args: click.args })
    } else {
      const vertex = vertices.get(id)
      if (vertex === undefined) continue
      if (click.url === "") delete vertex.link
      else vertex.link = click.url
      if (click.target === null) delete vertex.linkTarget
      else vertex.linkTarget = click.target
    }
  }
  applyGraphClass(ids, "clickable", vertices, edges, containers)
  if (tooltip !== null) for (const id of ids) tooltips.set(id, tooltip)
}
