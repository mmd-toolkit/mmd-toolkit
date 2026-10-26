import { isWhitespace } from "./characters.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { ConvertedCharacter } from "./converted-text.ts"
import type { TreeRange, TreeRoot } from "./tree.ts"

/** A physical line's source positions and its direct box-drawing reading. */
export interface TreeviewLine {
  readonly characters: readonly ConvertedCharacter[]
  readonly decoration: TreeRange | null
  readonly prefix: TreeRange | null
  readonly marker: string
  readonly indent: number
  readonly content: number
  readonly end: number
}

/** Branch markers are separate authored components from the following dashes. */
function isTreeviewBranch(character: string): boolean {
  return character !== "" && "└┗├┣".includes(character)
}

/** The box family that participates in mode and decoration classification. */
function isBox(character: string): boolean {
  return character !== "" && "─━│┃└┗├┣".includes(character)
}

/** Metadata-shaped physical lines are exempt from box classification. */
function isMetadata(text: string): boolean {
  if (
    text.startsWith("title") &&
    " \t".includes(text.charAt(5)) &&
    text.length > 5
  )
    return true
  for (const word of ["accTitle", "accDescr"]) {
    if (!text.startsWith(word)) continue
    let at = word.length
    while (text.charAt(at) === " " || text.charAt(at) === "\t") at++
    if (
      text.charAt(at) === ":" ||
      (word === "accDescr" && text.charAt(at) === "{")
    )
      return true
  }
  return false
}

/** Candidate lines ignore comments, metadata and vertical-only decoration. */
function isCandidate(text: string): boolean {
  const trimmed = text.trim()
  return (
    trimmed !== "" &&
    !trimmed.startsWith("%%") &&
    !isMetadata(trimmed) &&
    ![...text].every(
      (character) =>
        isWhitespace(character.codePointAt(0) ?? -1) ||
        character === "│" ||
        character === "┃",
    )
  )
}

/** Read columns as UTF-16 units, expanding each tab to four spaces. */
function branchColumn(text: string): number {
  let column = 0
  for (const character of text) {
    if (isTreeviewBranch(character)) return column
    column += character === "\t" ? 4 : character.length
  }
  return -1
}

/**
 * diagrams/treeview.md: direct readings stay attached to original source
 * positions. No rewritten source or rewritten offsets are constructed.
 */
export class TreeviewText extends ConvertedText {
  public readonly lines: readonly TreeviewLine[]

  public constructor(source: string, root: TreeRoot) {
    const converted = readConvertedCharacters(source, root)
    super(converted)
    const physical: ConvertedCharacter[][] = [[]]
    for (const character of converted) {
      physical.at(-1)!.push(character)
      if (character.codePoint === 0x0a) physical.push([])
    }
    const texts = physical.map((line) =>
      line
        .filter(({ codePoint }) => codePoint !== 0x0a)
        .map(({ codePoint }) => String.fromCodePoint(codePoint))
        .join(""),
    )
    const header = texts.findIndex((text) => text.trim() === "treeView-beta")
    const candidates = texts.filter(
      (text, index) => index > header && header !== -1 && isCandidate(text),
    )
    const active = candidates.some((text) => [...text].some(isBox))
    const width = candidates.map(branchColumn).find((column) => column > 0) ?? 4
    this.lines = physical.map((characters, index) => {
      const text = texts[index] ?? ""
      let decoration: TreeRange | null = null
      let prefix: TreeRange | null = null
      let marker = ""
      let indent = 0
      let content = 0
      let end = characters.length
      if (active && index > header && isCandidate(text)) {
        const branch = characters.findIndex(({ codePoint }) =>
          isTreeviewBranch(String.fromCodePoint(codePoint)),
        )
        if (branch !== -1) {
          let start = 0
          while (isWhitespace(characters[start]?.codePoint ?? -1)) start++
          let dash = branch + 1
          while (
            characters[dash]?.codePoint === 0x2500 ||
            characters[dash]?.codePoint === 0x2501
          )
            dash++
          prefix = [characters[start].start, characters[dash - 1].start + 1]
          marker = String.fromCodePoint(characters[branch].codePoint)
          indent = 4 * (Math.round(branchColumn(text) / width) + 1)
          content = dash
          while (
            characters[content]?.codePoint === 0x20 ||
            characters[content]?.codePoint === 0x09
          )
            content++
          end = characters.length
          while (isWhitespace(characters[end - 1]?.codePoint ?? -1)) end--
        } else if (
          [...text].every(
            (character) =>
              isWhitespace(character.codePointAt(0) ?? -1) || isBox(character),
          )
        ) {
          let start = 0
          let stop = characters.length
          while (isWhitespace(characters[start]?.codePoint ?? -1)) start++
          while (isWhitespace(characters[stop - 1]?.codePoint ?? -1)) stop--
          decoration = [characters[start].start, characters[stop - 1].start + 1]
        }
      } else if (
        active &&
        index > header &&
        text.trim() !== "" &&
        [...text].every(
          (character) =>
            isWhitespace(character.codePointAt(0) ?? -1) ||
            character === "│" ||
            character === "┃",
        )
      ) {
        let start = 0
        let stop = characters.length
        while (isWhitespace(characters[start]?.codePoint ?? -1)) start++
        while (isWhitespace(characters[stop - 1]?.codePoint ?? -1)) stop--
        decoration = [characters[start].start, characters[stop - 1].start + 1]
      }
      return {
        characters,
        decoration,
        prefix,
        marker,
        indent,
        content,
        end,
      }
    })
  }

  /** The direct value of a source range, with common and enclosed box forms read once. */
  public override of(
    range: TreeRange,
    leftOut: readonly TreeRange[] = [],
  ): string {
    let result = ""
    for (const line of this.lines) {
      if (line.decoration !== null) continue
      for (const [index, character] of line.characters.entries()) {
        const { start, codePoint } = character
        if (
          start < range[0] ||
          start >= range[1] ||
          leftOut.some(([from, to]) => from <= start && start < to)
        )
          continue
        if (line.prefix !== null) {
          if (start === line.prefix[0]) result += " ".repeat(line.indent)
          if (index < line.content) continue
          if (codePoint !== 0x0a && index >= line.end) continue
          if (codePoint === 0x09) {
            result += "    "
            continue
          }
        }
        result += String.fromCodePoint(codePoint)
      }
    }
    return result
  }
}
