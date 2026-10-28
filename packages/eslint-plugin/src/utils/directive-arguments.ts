import type { Directive } from "@mmd-toolkit/parser"

/** The ASCII word characters used by directive names and word arguments. */
function isWordCharacter(character: string | undefined): boolean {
  return (
    character !== undefined &&
    ((character >= "a" && character <= "z") ||
      (character >= "A" && character <= "Z") ||
      (character >= "0" && character <= "9") ||
      character === "_")
  )
}

/** Directive padding includes line terminators and Unicode whitespace. */
function isWhitespace(character: string | undefined): boolean {
  return character !== undefined && character.trim() === ""
}

/** Skip padding, the written name, an optional colon and the argument's padding. */
function argumentStart(value: string): number {
  let at = 0
  while (isWhitespace(value[at])) at++
  while (isWordCharacter(value[at])) at++
  while (isWhitespace(value[at])) at++
  if (value[at] === ":") at++
  while (isWhitespace(value[at])) at++
  return at
}

/** Balance argument brackets without validating JSON, ignoring quoted text and escapes. */
function bracketedArgumentEnd(value: string, start: number): number {
  let depth = 0
  let quote: string | null = null
  for (let at = start; at < value.length; at++) {
    const character = value[at]
    if (quote !== null) {
      if (character === "\\") at++
      else if (character === quote) quote = null
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === "{" || character === "[") {
      depth++
    } else if (character === "}" || character === "]") {
      depth--
      if (depth === 0) return at + 1
    }
  }
  return value.length
}

/** Text on a later physical line counts only outside the name and opening JSON value. */
export function directiveTakesLaterLines(directive: Directive): boolean {
  const { value } = directive
  const start = argumentStart(value)
  const argumentEnd =
    value[start] === "{" || value[start] === "["
      ? bracketedArgumentEnd(value, start)
      : start
  let laterLine = false
  for (let at = 0; at < value.length; at++) {
    const character = value[at]
    if (character === "\n" || character === "\r") laterLine = true
    else if (at >= argumentEnd && laterLine && !isWhitespace(character)) {
      return true
    }
  }
  return false
}

/** A word argument and an absent argument supply no JSON settings. */
function freeTextArgument(directive: Directive): string | null {
  const start = argumentStart(directive.value)
  return start === directive.value.length ||
    isWordCharacter(directive.value[start])
    ? null
    : directive.value.slice(start).trim()
}

/** Configuration reads only a lowercase init or initialize suffix. */
function readsInitSettings(name: string): boolean {
  return name.endsWith("init") || name.endsWith("initialize")
}

/** Validate with the JSON reader before inspecting members or reporting invalid text. */
function parsesAsJson(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

/** A case-only suffix mistake, or JSON invalid both as written and after quote conversion. */
export function invalidInitReason(
  directive: Directive,
): "nameCase" | "invalid" | null {
  if (!readsInitSettings(directive.name)) {
    return readsInitSettings(directive.name.toLowerCase()) ? "nameCase" : null
  }
  const argument = freeTextArgument(directive)
  if (
    argument === null ||
    parsesAsJson(argument.replaceAll("'", '"')) ||
    parsesAsJson(argument)
  ) {
    return null
  }
  return "invalid"
}

/** Later conflicting keys in JSON spelling; comparisons use decoded keys and values. */
export function duplicateInitKeys(directive: Directive): readonly string[] {
  if (!readsInitSettings(directive.name)) return []
  const argument = freeTextArgument(directive)
  if (argument === null) return []
  const text = argument.replaceAll("'", '"')
  if (!parsesAsJson(text)) return []

  // Validation happens before this traversal. Read every member before reducing
  // an object's final value, so JSON.parse cannot discard a repeated key.
  let at = 0
  const duplicates: string[] = []

  /** Advance over JSON padding, whose validity was checked at the entry. */
  function skipWhitespace(): void {
    while (isWhitespace(text[at])) at++
  }

  /** Keep the literal for diagnostics and decode the string for comparisons. */
  function readString(): { literal: string; value: string } {
    const start = at++
    while (text[at] !== '"') at += text[at] === "\\" ? 2 : 1
    at++
    const literal = text.slice(start, at)
    return { literal, value: JSON.parse(literal) as string }
  }

  /** Sorted members represent the final object value without losing earlier observations. */
  function readObject(): string {
    at++
    const members = new Map<string, string>()
    skipWhitespace()
    while (text[at] !== "}") {
      const key = readString()
      skipWhitespace()
      at++ // The validated colon.
      const value = readValue()
      const previous = members.get(key.value)
      if (previous !== undefined && previous !== value) {
        duplicates.push(key.literal)
      }
      members.set(key.value, value)
      skipWhitespace()
      if (text[at] !== ",") break
      at++
      skipWhitespace()
    }
    at++
    return `{${[...members]
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, value]) => `${JSON.stringify(key)}:${value}`)
      .join(",")}}`
  }

  /** Array order is part of its value; each element can hold further objects. */
  function readArray(): string {
    at++
    const values: string[] = []
    skipWhitespace()
    while (text[at] !== "]") {
      values.push(readValue())
      skipWhitespace()
      if (text[at] !== ",") break
      at++
      skipWhitespace()
    }
    at++
    return `[${values.join(",")}]`
  }

  /** Read by JSON syntax; numeric spellings compare by their parsed number. */
  function readValue(): string {
    skipWhitespace()
    if (text[at] === "{") return readObject()
    if (text[at] === "[") return readArray()
    if (text[at] === '"') return JSON.stringify(readString().value)
    const start = at
    while (at < text.length && !",]} \t\n\r".includes(text[at])) at++
    const literal = text.slice(start, at)
    return literal === "true" || literal === "false" || literal === "null"
      ? literal
      : String(Number(literal))
  }

  readValue()
  return duplicates
}
