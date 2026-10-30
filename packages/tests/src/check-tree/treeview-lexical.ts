import {
  isDigit,
  isWhitespace,
  isWordCharacter,
} from "../db-from-tree/characters.ts"
import { afterHorizontal, horizontal } from "./common-statement-checks.ts"

/** A lexical match only: this module neither parses a body nor decides acceptance. */
export interface TreeviewUnit {
  readonly kind: string
  readonly end: number
  readonly start?: number
  readonly valueEnd?: number
}

/** A whole class-name atom at the current component position. */
export function treeviewClassEnd(text: string): number {
  if (!isWordCharacter(text.charCodeAt(0)) || isDigit(text.charCodeAt(0)))
    return 0
  let end = 1
  while (isWordCharacter(text.charCodeAt(end)) || text.charAt(end) === "-")
    end++
  return end
}

/** A whole icon-reference atom, including an optional colon and required tail. */
export function treeviewIconEnd(text: string): number {
  let end = 0
  while (isWordCharacter(text.charCodeAt(end)) || text.charAt(end) === "-")
    end++
  if (text.charAt(end) === ":") {
    const tail = ++end
    while (isWordCharacter(text.charCodeAt(end)) || text.charAt(end) === "-")
      end++
    if (tail === end) return -1
  }
  return end
}

/** Bare names stop at the first whitespace-led annotation start, even if it later fails. */
export function treeviewBareEnd(text: string): number {
  if (
    text === "" ||
    " \t\r\n\"'".includes(text.charAt(0)) ||
    text.startsWith(":::") ||
    text.startsWith("icon(") ||
    text.startsWith("##")
  )
    return 0
  let end = 1
  while (
    end < text.length &&
    text.charAt(end) !== "\n" &&
    text.charAt(end) !== "\r"
  ) {
    if (horizontal(text.charAt(end))) {
      const next = text.slice(afterHorizontal(text, end))
      if (
        next.startsWith("icon(") ||
        next.startsWith("##") ||
        (next.startsWith(":::") &&
          treeviewClassEnd(next.slice(afterHorizontal(next, 3))) > 0)
      )
        break
    }
    end++
  }
  return end
}

/** diagrams/treeview.md: common composite first-match priority and untrimmed payload bounds. */
export function treeviewCommon(text: string): TreeviewUnit | undefined {
  const padding = afterHorizontal(text, 0)
  const rest = text.slice(padding)
  for (const [word, kind] of [
    ["accDescr", "AccDescr"],
    ["accTitle", "AccTitle"],
    ["title", "Title"],
  ] as const) {
    if (!rest.startsWith(word)) continue
    let at = padding + word.length
    if (kind !== "Title") {
      const colon = afterHorizontal(text, at)
      if (text.charAt(colon) === ":") at = colon + 1
      else if (kind === "AccDescr") {
        while (isWhitespace(text.charCodeAt(at))) at++
        const close = text.indexOf("}", at + 1)
        if (text.charAt(at) === "{" && close !== -1)
          return {
            kind: "AccDescrBlock",
            start: at + 1,
            valueEnd: close,
            end: close + 1,
          }
        continue
      } else continue
    } else if (horizontal(text.charAt(at))) at++
    else return { kind, start: at, valueEnd: at, end: at }
    const start = at
    while (
      at < text.length &&
      text.charAt(at) !== "\n" &&
      text.charAt(at) !== "\r" &&
      !text.startsWith("%%", at)
    )
      at++
    return { kind, start, valueEnd: at, end: at }
  }
  return undefined
}

/** The first matching lexical unit at a native position, independent of grammar state. */
export function treeviewUnit(text: string): TreeviewUnit | undefined {
  const header = "treeView-beta"
  if (
    text.startsWith(header) &&
    (text.length === header.length ||
      isWhitespace(text.charCodeAt(header.length)) ||
      text.startsWith("%%", header.length)) &&
    treeviewBareEnd(text) <= header.length
  )
    return { kind: "header", end: header.length }
  const common = treeviewCommon(text)
  if (common !== undefined) return common
  const padding = afterHorizontal(text, 0)
  if (padding > 0) {
    const rest = text.slice(padding)
    if (rest.startsWith(":::")) {
      const start = padding + afterHorizontal(rest, 3)
      const length = treeviewClassEnd(text.slice(start))
      if (length > 0)
        return {
          kind: "Class",
          start,
          valueEnd: start + length,
          end: start + length,
        }
    }
    if (rest.startsWith("icon(")) {
      const start = padding + 5
      const length = treeviewIconEnd(text.slice(start))
      if (length >= 0 && text.charAt(start + length) === ")")
        return {
          kind: "Icon",
          start,
          valueEnd: start + length,
          end: start + length + 1,
        }
    }
    if (rest.startsWith("##")) {
      const start = padding + 2
      let end = start
      while (
        end < text.length &&
        text.charAt(end) !== "\r" &&
        text.charAt(end) !== "\n"
      )
        end++
      return { kind: "Description", start, valueEnd: end, end }
    }
    return { kind: "indentation", end: padding }
  }
  const quote = text.charAt(0)
  if (quote === "'" || quote === '"') {
    const close = text.indexOf(quote, 1)
    if (close !== -1) return { kind: "quoted", end: close + 1 }
  }
  if (text.startsWith("%%")) {
    const lf = text.indexOf("\n")
    return { kind: "comment", end: lf === -1 ? text.length : lf }
  }
  if (text.startsWith("\n")) return { kind: "newline", end: 1 }
  const end = treeviewBareEnd(text)
  return end === 0 ? undefined : { kind: "bare", end }
}
