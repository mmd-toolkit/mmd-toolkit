import type { Directive, Range } from "@mmd-toolkit/parser"
import type { JsonValueNode, JsonReading } from "./json.ts"
import { sameJsonValue, mermaidReadsJson, parseInitJson } from "./json.ts"

/** Mirrors Mermaid's \w: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.ts#L62-L63 */
function isWordCharacter(character: string): boolean {
  return /^\w$/u.test(character)
}

/** Mirrors Mermaid's \s: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.ts#L62-L63 */
function isWhitespace(character: string | undefined): boolean {
  return character !== undefined && character.trim() === ""
}

/** Name ranges and argument starts must agree on padding. */
function skipWhitespace(value: string, start: number): number {
  let at = start
  while (isWhitespace(value[at])) at++
  return at
}

/** The tree already identifies the name; only its surrounding padding is read. */
function argumentStart(directive: Directive): number {
  const { name, value } = directive
  const nameStart = skipWhitespace(value, 0)
  let at = skipWhitespace(value, nameStart + name.length)
  if (value[at] === ":") at++
  return skipWhitespace(value, at)
}

const DIRECTIVE_OPEN_LENGTH = "%%{".length

/** Padding before the name is not part of its report or fix. */
export function directiveNameRange(directive: Directive): Range {
  const start =
    directive.range[0] +
    DIRECTIVE_OPEN_LENGTH +
    skipWhitespace(directive.value, 0)
  return [start, start + directive.name.length]
}

/**
 * start holds { or [; return the offset after its closing bracket, or
 * value.length when none closes it. The extent follows Mermaid's reading of
 * quotes: either unescaped quote closes a string.
 */
export function bracketedArgumentEnd(value: string, start: number): number {
  let depth = 0
  let inString = false
  for (let at = start; at < value.length; at++) {
    const character = value[at]
    if (inString) {
      if (character === "\\") at++
      else if (character === '"' || character === "'") inString = false
    } else if (character === '"' || character === "'") inString = true
    else if (character === "{" || character === "[") depth++
    else if ((character === "}" || character === "]") && --depth === 0)
      return at + 1
  }
  return value.length
}

/** Text on a later physical line counts only outside the name and opening JSON value. */
export function directiveTakesLaterLines(directive: Directive): boolean {
  const { value } = directive
  const start = argumentStart(directive)
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
export function initArgumentJson(directive: Directive): JsonReading | null {
  const start = argumentStart(directive)
  const argument = directive.value.slice(start)
  return argument === "" || isWordCharacter(argument[0])
    ? null
    : parseInitJson(
        argument,
        directive.range[0] + DIRECTIVE_OPEN_LENGTH + start,
      )
}

/** Configuration reads only a lowercase init or initialize suffix. */
function readsInitSettings(name: string): boolean {
  return name.endsWith("init") || name.endsWith("initialize")
}

/** Compare written and lowercase names to detect case-only errors in Mermaid's case-sensitive init/initialize suffixes. */
export function initNameCase(
  directive: Directive,
): "init" | "wrongCase" | "notInit" {
  if (readsInitSettings(directive.name)) return "init"
  return readsInitSettings(directive.name.toLowerCase())
    ? "wrongCase"
    : "notInit"
}

/** A JSON member's value and removable source range, before duplicate keys are reduced. */
interface InitJsonMember {
  readonly key: string
  readonly keyRange: Range
  readonly value: JsonValueNode
  readonly removalRange: Range
  readonly previous: InitJsonMember | undefined
}

/** A later conflicting member, and the earlier member it changes. */
export interface DuplicateInitMember {
  readonly current: InitJsonMember
  readonly previous: InitJsonMember
}

/** Each object's history is independent, including objects nested inside arrays. */
export function duplicateInitMembers(
  directive: Directive,
): readonly DuplicateInitMember[] {
  if (initNameCase(directive) !== "init") return []
  const parsed = initArgumentJson(directive)
  if (parsed === null || !mermaidReadsJson(parsed)) return []
  const duplicates: DuplicateInitMember[] = []
  collectDuplicateMembers(parsed.value, duplicates)
  return duplicates
}

/** Visit each member's value before recording it so nested duplicates are reported in source order. */
function collectDuplicateMembers(
  node: JsonValueNode,
  duplicates: DuplicateInitMember[],
): void {
  if (node.kind === "Array") {
    for (const element of node.elements)
      collectDuplicateMembers(element, duplicates)
  } else if (node.kind === "Object") {
    const members = new Map<string, InitJsonMember>()
    let previousComma: Range | undefined
    for (const member of node.members) {
      collectDuplicateMembers(member.value, duplicates)
      const previous = members.get(member.key.value)
      const current: InitJsonMember = {
        key: member.key.text.replaceAll("'", '"'),
        keyRange: member.key.range,
        value: member.value,
        previous,
        removalRange:
          previousComma === undefined
            ? [member.range[0], member.comma?.[1] ?? member.range[1]]
            : [previousComma[0], member.range[1]],
      }
      if (
        previous !== undefined &&
        !sameJsonValue(previous.value, member.value)
      )
        duplicates.push({ current, previous })
      members.set(member.key.value, current)
      previousComma = member.comma
    }
  }
}
