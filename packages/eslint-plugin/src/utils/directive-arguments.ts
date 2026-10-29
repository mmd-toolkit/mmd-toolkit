import type { Directive, Range } from "@mmd-toolkit/parser"

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

/** The authored argument range, without the directive name or surrounding padding. */
export function directiveArgumentRange(directive: Directive): Range {
  const offset = directive.range[0] + 3
  return [
    offset + argumentStart(directive.value),
    offset + directive.value.trimEnd().length,
  ]
}

/** The authored argument after its name, optional colon and padding. */
export function directiveArgumentText(directive: Directive): string {
  return directive.value.slice(argumentStart(directive.value)).trim()
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
export function directiveValueTakesLaterLines(value: string): boolean {
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

/** Apply the same lost-line decision to the source directive. */
export function directiveTakesLaterLines(directive: Directive): boolean {
  return directiveValueTakesLaterLines(directive.value)
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
export function parsesAsJson(text: string): boolean {
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

/** A JSON member's value and removable source range, before duplicate keys are reduced. */
export interface InitJsonMember {
  readonly key: string
  readonly value: string
  readonly removalRange: Range
  readonly previous: InitJsonMember | undefined
}

/** A later conflicting member, and the earlier member it changes. */
export interface DuplicateInitMember {
  readonly current: InitJsonMember
  readonly previous: InitJsonMember
}

/** Later conflicting keys in JSON spelling; keep every member for comparison and edits. */
export function duplicateInitMembers(
  directive: Directive,
): readonly DuplicateInitMember[] {
  if (!readsInitSettings(directive.name)) return []
  const argument = freeTextArgument(directive)
  if (argument === null) return []
  const text = argument.replaceAll("'", '"')
  if (!parsesAsJson(text)) return []
  const offset = directiveArgumentRange(directive)[0]
  let at = 0
  const duplicates: DuplicateInitMember[] = []

  /** Advance over validated JSON padding. */
  function skipWhitespace(): void {
    while (isWhitespace(text[at])) at++
  }

  /** Decode the key while preserving its spelling for the report. */
  function readString(): { literal: string; value: string } {
    const start = at++
    while (text[at] !== '"') at += text[at] === "\\" ? 2 : 1
    at++
    const literal = text.slice(start, at)
    return { literal, value: JSON.parse(literal) as string }
  }

  /** Keep each member's separator range and only then reduce the final object value. */
  function readObject(): string {
    at++
    const members = new Map<string, InitJsonMember>()
    let comma: number | undefined
    skipWhitespace()
    while (text[at] !== "}") {
      const start = at
      const key = readString()
      skipWhitespace()
      at++
      const value = readValue()
      const end = at
      skipWhitespace()
      const previous = members.get(key.value)
      const current: InitJsonMember = {
        key: key.literal,
        value,
        previous,
        removalRange:
          comma === undefined
            ? [offset + start, offset + (text[at] === "," ? at + 1 : end)]
            : [offset + comma, offset + end],
      }
      if (previous !== undefined && previous.value !== value)
        duplicates.push({ current, previous })
      members.set(key.value, current)
      if (text[at] !== ",") break
      comma = at++
      skipWhitespace()
    }
    at++
    return `{${[...members]
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, member]) => `${JSON.stringify(key)}:${member.value}`)
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

  /** Numeric spellings compare by the same double, including infinities. */
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
