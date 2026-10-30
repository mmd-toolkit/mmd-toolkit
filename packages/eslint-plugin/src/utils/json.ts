import type { Range } from "@mmd-toolkit/parser"

const JSON_NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:(?:E|e)[+-]?\d+)?/uy
const LITERALS = [true, false, null].map((v) => [String(v), v] as const)

/** A complete value with any locally fixable problems kept for its caller. */
export interface ParsedJson {
  readonly invalid: false
  readonly value: JsonValueNode
  readonly problems: readonly JsonProblem[]
}

/** A fatal error with no partial value or fixable problems. */
export interface InvalidJson {
  readonly invalid: true
  readonly range: Range
}

/** A complete reading or the range of its fatal error. */
export type JsonReading = ParsedJson | InvalidJson

/** Keep duplicates so rules can compare and remove either occurrence. */
export interface JsonObject {
  readonly kind: "Object"
  readonly range: Range
  readonly members: readonly JsonMember[]
}

/** Keep the comma so removing a duplicate does not touch its neighbors. */
export interface JsonMember {
  readonly range: Range
  readonly key: JsonString
  readonly value: JsonValueNode
  readonly comma: Range | undefined
}

/** Array elements in source order for structural value comparison. */
export interface JsonArray {
  readonly kind: "Array"
  readonly range: Range
  readonly elements: readonly JsonValueNode[]
}

/** Keep written text for edits and the decoded value for comparison. */
export interface JsonString {
  readonly kind: "String"
  readonly range: Range
  readonly text: string
  readonly value: string
}

/** A decoded number so value comparisons ignore its spelling. */
export interface JsonNumber {
  readonly kind: "Number"
  readonly range: Range
  readonly value: number
}

/** A decoded boolean or null value. */
export interface JsonLiteral {
  readonly kind: "Literal"
  readonly range: Range
  readonly value: boolean | null
}

/** A JSON value retaining the structure and ranges needed by rules. */
export type JsonValueNode =
  JsonObject | JsonArray | JsonString | JsonNumber | JsonLiteral

/** A local correction that does not prevent a complete reading. */
export type JsonProblemKind =
  | "trailingComma"
  | "apostropheInDoubleQuotedString"
  | "escapedApostrophe"
  | "quoteInSingleQuotedString"

/** Reports and fixes must share the same written range. */
export interface JsonProblem {
  readonly kind: JsonProblemKind
  readonly range: Range
}

/** Stop a reading without exposing partial values to its caller. */
class JsonSyntaxError extends Error {
  public readonly range: Range

  public constructor(range: Range) {
    super("Invalid JSON")
    this.range = range
  }
}

/**
 * Directive arguments trim Unicode whitespace before JSON parsing, which
 * permits only ASCII whitespace. Written quotes locate apostrophe fixes when
 * Mermaid's conversion prevents a complete reading.
 */
function readJson(
  text: string,
  offset: number,
  quotes: "json" | "mermaid" | "written",
): JsonReading {
  const apostropheIsQuote: boolean = quotes !== "json"
  const eitherQuoteClosesString: boolean = quotes === "mermaid"
  const reportsQuotesAsWritten: boolean = quotes === "written"
  const escapedApostropheIsDoubleQuote: boolean = quotes === "mermaid"
  let at = apostropheIsQuote ? text.length - text.trimStart().length : 0
  const limit = apostropheIsQuote
    ? Math.max(at, text.trimEnd().length)
    : text.length
  const problems: JsonProblem[] = []

  /** Rule locations and edits use absolute UTF-16 offsets. */
  function range(start: number, end: number): Range {
    return [offset + start, offset + end]
  }

  /** Fatal errors discard partial values; EOF ranges must stay inside the argument. */
  function fail(start: number, end: number = start + 1): never {
    throw new JsonSyntaxError(range(start, Math.min(end, limit)))
  }

  /** Local corrections keep reading so one directive can report each fix. */
  function problem(kind: JsonProblemKind, start: number, end: number): void {
    problems.push({ kind, range: range(start, end) })
  }

  /** Only argument edges accept whitespace outside JSON's ASCII set. */
  function skipWhitespace(): void {
    while (at < limit && " \t\n\r".includes(text[at])) at++
  }

  /** Only directive arguments undergo Mermaid's apostrophe conversion. */
  function isQuote(character: string | undefined): boolean {
    return character === '"' || (apostropheIsQuote && character === "'")
  }

  /** Parents must not receive partial values after a fatal syntax error. */
  function readValue(): JsonValueNode {
    skipWhitespace()
    return (
      readObject() ??
      readArray() ??
      readString() ??
      readNumber() ??
      readLiteral() ??
      fail(at)
    )
  }

  /** Member ranges and commas keep duplicate-key removals local to the object. */
  function readObject(): JsonObject | undefined {
    if (text[at] !== "{") return undefined
    const start = at++
    const members: JsonMember[] = []
    skipWhitespace()
    while (text[at] !== "}") {
      const key = readString() ?? fail(at >= limit ? start : at)
      skipWhitespace()
      if (text[at] !== ":") fail(at)
      at++
      const value = readValue()
      const end = offset + at
      const comma = readSeparator("}", start)
      members.push({ range: [key.range[0], end], key, value, comma })
    }
    at++
    return { kind: "Object", range: range(start, at), members }
  }

  /** Elements stay in source order for structural value comparison. */
  function readArray(): JsonArray | undefined {
    if (text[at] !== "[") return undefined
    const start = at++
    const elements: JsonValueNode[] = []
    skipWhitespace()
    while (text[at] !== "]") {
      elements.push(readValue())
      readSeparator("]", start)
    }
    at++
    return { kind: "Array", range: range(start, at), elements }
  }

  /** An absent separator at EOF is anchored to its opening bracket. */
  function readSeparator(close: "}" | "]", start: number): Range | undefined {
    skipWhitespace()
    if (text[at] === ",") {
      const commaStart = at++
      skipWhitespace()
      if (text[at] === "}" || text[at] === "]")
        problem("trailingComma", commaStart, commaStart + 1)
      else if (at >= limit || text[at] === "," || text[at] === ":") fail(at)
      return range(commaStart, commaStart + 1)
    }
    if (text[at] !== close) fail(at >= limit ? start : at)
    return undefined
  }

  /** Quote fixes need written escape ranges before Mermaid rewrites them. */
  function readString(): JsonString | undefined {
    const quote = text[at]
    if (!isQuote(quote)) return undefined

    /** Mermaid converts apostrophes before JSON can distinguish delimiters. */
    function closes(character: string | undefined): boolean {
      return eitherQuoteClosesString ? isQuote(character) : character === quote
    }

    const start = at++
    let value = ""
    while (at < limit && !closes(text[at])) {
      const characterStart = at
      const character = text[at++]
      let decoded = character
      if (character === "\\") {
        const escaped = text[at]
        at = Math.min(at + (escaped === "u" ? 5 : 1), limit)
        if (escaped === "'" && apostropheIsQuote) {
          problem("escapedApostrophe", characterStart, at)
          decoded = escapedApostropheIsDoubleQuote ? '"' : "'"
        } else {
          try {
            const escape = text.slice(characterStart, at)
            decoded = JSON.parse(`"${escape}"`) as string
          } catch {
            fail(characterStart, at)
          }
        }
      } else if (character.charCodeAt(0) < 0x20) fail(characterStart, at)
      else if (reportsQuotesAsWritten && isQuote(character)) {
        problem(
          quote === '"'
            ? "apostropheInDoubleQuotedString"
            : "quoteInSingleQuotedString",
          characterStart,
          at,
        )
      }
      value += decoded
    }
    if (closes(text[at])) at++
    else fail(start, limit)
    return {
      kind: "String",
      range: range(start, at),
      text: text.slice(start, at),
      value,
    }
  }

  /** Decode numbers so comparisons ignore their spelling. */
  function readNumber(): JsonNumber | undefined {
    JSON_NUMBER.lastIndex = at
    const match = JSON_NUMBER.exec(text)
    if (match === null) return undefined
    const start = at
    at += match[0].length
    if (text[at] >= "0" && text[at] <= "9") fail(at)
    return {
      kind: "Number",
      range: range(start, at),
      value: Number(match[0]),
    }
  }

  /** Decode JSON keywords to their boolean or null values. */
  function readLiteral(): JsonLiteral | undefined {
    const literal = LITERALS.find(([keyword]) => text.startsWith(keyword, at))
    if (!literal) return undefined
    const [keyword, value] = literal
    const start = at
    at += keyword.length
    return {
      kind: "Literal",
      range: range(start, at),
      value,
    }
  }

  try {
    const value = readValue()
    skipWhitespace()
    if (at < limit) fail(at, limit)
    return { invalid: false, value, problems }
  } catch (error) {
    if (!(error instanceof JsonSyntaxError)) throw error
    return { invalid: true, range: error.range }
  }
}

/**
 * Strict JSON keeps apostrophes and skips only JSON whitespace. A reading with
 * invalid: false may still carry problems (a trailing comma); callers needing
 * JSON.parse's success must also check that problems is empty.
 */
export function parseJson(text: string, offset: number): JsonReading {
  return readJson(text, offset, "json")
}

/**
 * Prefer Mermaid's reading. Only a fatal error tries quotes as written to
 * locate fixable characters; if that also fails, keep Mermaid's error alone.
 */
export function parseInitJson(text: string, offset: number): JsonReading {
  const mermaid = readJson(text, offset, "mermaid")
  if (!mermaid.invalid) return mermaid
  const written = readJson(text, offset, "written")
  return written.invalid ? mermaid : written
}

/** Whether Mermaid obtains a value, including one changed by escaped apostrophes. */
export function mermaidReadsJson(parsed: JsonReading): parsed is ParsedJson {
  return (
    !parsed.invalid &&
    parsed.problems.every((problem) => problem.kind === "escapedApostrophe")
  )
}

/** The last value written for a key is the one JSON.parse keeps. */
function membersByKey(object: JsonObject): Map<string, JsonValueNode> {
  return new Map(object.members.map(({ key, value }) => [key.value, value]))
}

/** Compare decoded values, independent of spelling and object member order. */
export function sameJsonValue(a: JsonValueNode, b: JsonValueNode): boolean {
  switch (a.kind) {
    case "String":
    case "Number":
    case "Literal":
      return b.kind === a.kind && a.value === b.value
    case "Array":
      return (
        b.kind === "Array" &&
        a.elements.length === b.elements.length &&
        a.elements.every((value, index) =>
          sameJsonValue(value, b.elements[index]),
        )
      )
    case "Object": {
      if (b.kind !== "Object") return false
      const left = membersByKey(a)
      const right = membersByKey(b)
      return (
        left.size === right.size &&
        [...left].every(([key, value]) => {
          const other = right.get(key)
          return other !== undefined && sameJsonValue(value, other)
        })
      )
    }
    default: {
      const unreachable: never = a
      throw new Error(`Unexpected JSON value: ${String(unreachable)}`)
    }
  }
}
