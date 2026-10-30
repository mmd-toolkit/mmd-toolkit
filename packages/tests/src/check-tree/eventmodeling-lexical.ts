import {
  isDigit,
  isWhitespace,
  isWordCharacter,
} from "../db-from-tree/characters.ts"
import {
  afterHorizontal,
  boundary,
  directiveEnd,
} from "./common-statement-checks.ts"

/** diagrams/eventmodeling.md: whole reserved words, before identifier. */
export const EVENTMODELING_WORDS: readonly string[] = [
  "eventmodeling",
  "resetframe",
  "readmodel",
  "processor",
  "timeframe",
  "command",
  "entity",
  "event",
  "jsobj",
  "figma",
  "given",
  "json",
  "salt",
  "html",
  "text",
  "data",
  "note",
  "when",
  "then",
  "rmo",
  "cmd",
  "evt",
  "pcr",
  "uri",
  "gwt",
  "ui",
  "md",
  "tf",
  "rf",
]

/** One lexical match, without grammar or reference acceptance decisions. */
export interface EventmodelingUnit {
  readonly kind: string
  /** Significant start, excluding leading ASCII padding of a composite. */
  readonly start: number
  /** End of the retained form, excluding a consumed closing LF. */
  readonly end: number
  /** Position after the whole lexical match, including consumed whitespace. */
  readonly next: number
  readonly payload?: readonly [number, number]
}

/** Block data and YAML try a body line before the adjacent empty alternative. */
function blockEnd(
  text: string,
  at: number,
  open: string,
  close: string,
): number | undefined {
  if (!text.startsWith(open, at)) return undefined
  const opening = afterHorizontal(text, at + open.length)
  if (text.charAt(opening) !== "\n") return undefined
  const body = opening + 1
  const empty =
    text.startsWith(close, body) && boundary(text, body + close.length)
      ? body + close.length
      : undefined
  for (
    let lf = text.indexOf("\n", body);
    lf !== -1;
    lf = text.indexOf("\n", lf + 1)
  )
    if (text.startsWith(close, lf + 1) && boundary(text, lf + 1 + close.length))
      return lf + 1 + close.length
  return empty
}

/** Inline bodies end at the last same-line closer; backslashes have no escape role. */
function inlineEnd(text: string, at: number): number | undefined {
  const open = text.charAt(at)
  if (open !== "{" && open !== '"' && open !== "'") return undefined
  const close = open === "{" ? "}" : open
  let end: number | undefined
  for (let next = at + 1; next < text.length; next++) {
    const character = text.charAt(next)
    if (["\r", "\n", "\u2028", "\u2029"].includes(character)) break
    if (character === close) end = next + 1
  }
  return end
}

/** Metadata line text prefers the first percent pair, then its physical line end. */
function lineEnd(text: string, at: number): number {
  let end = at
  while (
    end < text.length &&
    text.charAt(end) !== "\n" &&
    !text.startsWith("%%", end)
  )
    end++
  return end
}

/** The first applicable unit at an authored position; no productions are parsed. */
export function eventmodelingUnit(
  text: string,
  at: number,
): EventmodelingUnit | undefined {
  const start = at
  let idEnd = at
  if (isWordCharacter(text.charCodeAt(at)) && !isDigit(text.charCodeAt(at))) {
    idEnd++
    while (isWordCharacter(text.charCodeAt(idEnd))) idEnd++
  }
  for (const word of EVENTMODELING_WORDS) {
    const end = at + word.length
    if (!text.startsWith(word, at) || idEnd > end) continue
    if (
      word === "eventmodeling" &&
      !boundary(text, end) &&
      !text.startsWith("%%", end)
    )
      continue
    return { kind: "keyword", start, end, next: end }
  }
  for (const glyph of ["->>", "[[", "]]", "`", "."])
    if (text.startsWith(glyph, at))
      return {
        kind: "punctuation",
        start,
        end: at + glyph.length,
        next: at + glyph.length,
      }
  if (idEnd > at) return { kind: "identifier", start, end: idEnd, next: idEnd }
  if (isDigit(text.charCodeAt(at))) {
    let end = at
    while (end < at + 3 && isDigit(text.charCodeAt(end))) end++
    return { kind: "frame", start, end, next: end }
  }
  const inline = inlineEnd(text, at)
  if (inline !== undefined)
    return {
      kind: "inline",
      start,
      end: inline,
      next: inline,
      payload: [at + 1, inline - 1],
    }
  const block = blockEnd(text, at, "{", "}")
  if (block !== undefined)
    return {
      kind: "block",
      start,
      end: block,
      next: block + (text.charAt(block) === "\n" ? 1 : 0),
      payload: [at + 1, block - 1],
    }
  const wordStart = afterHorizontal(text, at)
  for (const word of ["accDescr", "accTitle", "title"]) {
    if (!text.startsWith(word, wordStart)) continue
    let payload = wordStart + word.length
    if (word === "title") {
      if (text.charAt(payload) === " " || text.charAt(payload) === "\t") {
        payload++
        const end = lineEnd(text, payload)
        return {
          kind: "title",
          start: wordStart,
          end: end === payload ? wordStart + word.length : end,
          next: end,
          payload: [payload, end],
        }
      }
      return {
        kind: "title",
        start: wordStart,
        end: payload,
        next: payload,
        payload: [payload, payload],
      }
    }
    payload = afterHorizontal(text, payload)
    if (text.charAt(payload) === ":") {
      payload++
      const end = lineEnd(text, payload)
      return {
        kind: word === "accTitle" ? "accTitle" : "accDescr",
        start: wordStart,
        end,
        next: end,
        payload: [payload, end],
      }
    }
    if (word === "accDescr") {
      while (isWhitespace(text.charCodeAt(payload))) payload++
      if (text.charAt(payload) !== "{") continue
      const end = text.indexOf("}", payload + 1)
      if (end !== -1)
        return {
          kind: "accDescrBlock",
          start: wordStart,
          end: end + 1,
          next: end + 1,
          payload: [payload + 1, end],
        }
    }
  }
  if (isWhitespace(text.charCodeAt(at))) {
    let end = at + 1
    while (isWhitespace(text.charCodeAt(end))) end++
    return { kind: "whitespace", start, end, next: end }
  }
  const yaml = blockEnd(text, at, "---", "---")
  if (yaml !== undefined)
    return {
      kind: "yaml-block",
      start,
      end: yaml,
      next: yaml + (text.charAt(yaml) === "\n" ? 1 : 0),
    }
  const directive = directiveEnd(text.slice(at))
  if (directive !== undefined) {
    const end = at + directive
    return {
      kind: "directive",
      start,
      end,
      next: end + (text.charAt(end) === "\n" ? 1 : 0),
    }
  }
  if (text.startsWith("%%", at) || text.startsWith("//", at)) {
    const lf = text.indexOf("\n", at)
    const end = lf === -1 ? text.length : lf
    return {
      kind: text.startsWith("%%", at)
        ? "percent-comment"
        : "slash-line-comment",
      start,
      end,
      next: end,
    }
  }
  if (text.startsWith("/*", at)) {
    const close = text.indexOf("*/", at + 2)
    if (close !== -1)
      return {
        kind: "slash-block-comment",
        start,
        end: close + 2,
        next: close + 2,
      }
  }
  return undefined
}
