import type { MermaidConfig } from "../types.ts"
import { isWhitespace } from "./characters.ts"

// docs/db-from-tree.md, The replacement of characters: the replacement that
// mermaid.js applies to a text before it keeps it, which depends on the
// configuration alone.

/** The values of `securityLevel` that mermaid.js knows. */
const KNOWN_SECURITY_LEVELS: readonly unknown[] = [
  "strict",
  "loose",
  "antiscript",
  "sandbox",
]

/** The texts of an `htmlLabels` value that disable HTML labels, once trimmed and in lower case. */
const DISABLING_HTML_LABELS_TEXTS: readonly string[] = ["false", "null", "0"]

/** The text that stands for a line break while the characters are replaced. */
const LINE_BREAK_PLACEHOLDER = "#br#"

/** A function from the text that mermaid.js is given to the text that it keeps. */
export type TextReplacement = (text: string) => string

/**
 * Whether HTML labels are enabled in `config`: the value of the root
 * `htmlLabels` when it is set (neither `null` nor missing), else that of
 * `flowchart.htmlLabels` when it is set, else enabled. A value disables them
 * when it is `false` or its text, trimmed and in lower case, is `false`,
 * `null`, or `0` (so the number 0 does too); any other value enables them.
 */
function htmlLabelsEnabledIn(config: MermaidConfig): boolean {
  const flowchart = config.flowchart
  const flowchartValue =
    typeof flowchart === "object" &&
    flowchart !== null &&
    "htmlLabels" in flowchart
      ? flowchart.htmlLabels
      : undefined
  const value = config.htmlLabels ?? flowchartValue ?? true
  if (value === false) return false
  return !DISABLING_HTML_LABELS_TEXTS.includes(
    String(value).trim().toLowerCase(),
  )
}

/**
 * The length of the line break tag that starts at `offset` of `text`: `<`,
 * an optional `/`, `br` in any case, whitespace, an optional `/`, and `>`;
 * 0 when there is none.
 */
function lineBreakTagLengthAt(text: string, offset: number): number {
  if (text[offset] !== "<") return 0
  let end = offset + 1
  if (text[end] === "/") end += 1
  const b = text[end]
  const r = text[end + 1]
  if ((b !== "b" && b !== "B") || (r !== "r" && r !== "R")) return 0
  end += 2
  while (end < text.length && isWhitespace(text.charCodeAt(end))) end += 1
  if (text[end] === "/") end += 1
  if (text[end] !== ">") return 0
  return end + 1 - offset
}

/** `text` with each line break tag written as `#br#`. */
function withLineBreakPlaceholders(text: string): string {
  let result = ""
  let offset = 0
  while (offset < text.length) {
    const length = lineBreakTagLengthAt(text, offset)
    if (length === 0) {
      result += text[offset]
      offset += 1
    } else {
      result += LINE_BREAK_PLACEHOLDER
      offset += length
    }
  }
  return result
}

/**
 * The replacement that mermaid.js applies to each text that it keeps, when
 * HTML labels are enabled and `securityLevel` is none of `strict`, `loose`,
 * `antiscript`, and `sandbox`: each line break tag, and each `#br#` that the
 * author wrote, is `<br/>`, and each `<`, `>`, and `=` that is left is `&lt;`,
 * `&gt;`, and `&equals;`. Under any other configuration the text is kept as
 * it is.
 */
export function textReplacementOf(config: MermaidConfig): TextReplacement {
  if (
    KNOWN_SECURITY_LEVELS.includes(config.securityLevel) ||
    !htmlLabelsEnabledIn(config)
  ) {
    return (text) => text
  }
  return (text) =>
    withLineBreakPlaceholders(text)
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("=", "&equals;")
      .replaceAll(LINE_BREAK_PLACEHOLDER, "<br/>")
}
