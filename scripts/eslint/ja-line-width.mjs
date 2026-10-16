// An ESLint rule for Japanese Markdown documents (`.ja.md`), run through the
// Markdown language of @eslint/markdown: a line of prose may not be wider than
// 80 columns when it could have been wrapped. A column counts an East Asian
// wide or fullwidth character as 2 and any other character as 1.
//
// The rule reads the Markdown tree, not the text alone. Headings, tables, and
// code blocks are not prose and are left alone. Inside a paragraph (or any
// other container of inline content) a break may fall at whitespace or between
// two wide characters, except before a character that may not start a line
// (closing brackets, punctuation) or after one that may not end a line (opening
// brackets), and never inside inline code, a link, an image, inline HTML, a
// link definition, or a bracketed citation such as `[fixture: name]`, because
// the checks of this repository read a link and a citation on one line. A line
// is reported only when such a break exists within the first 80 columns and
// leaves more than closing punctuation after it; a line that holds one long
// link or one long name is not reported.

const LIMIT = 80

/** The East Asian wide and fullwidth ranges, by code point. */
const wideRanges = [
  [0x1100, 0x115f],
  [0x2e80, 0x303e],
  [0x3041, 0x33ff],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xa000, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe30, 0xfe4f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1f300, 0x1f64f],
  [0x1f900, 0x1f9ff],
  [0x20000, 0x3fffd],
]

/** Whether a character is East Asian wide or fullwidth. */
function isWide(character) {
  const codePoint = character.codePointAt(0)
  return wideRanges.some(([from, to]) => codePoint >= from && codePoint <= to)
}

/** The characters that may not start a line. */
const NO_LINE_START = new Set([
  ..."、。，．・：；？！）」』】〕〉》］｝”’,.:;?!)]}",
])

/** The characters that may not end a line. */
const NO_LINE_END = new Set([..."（「『【〔〈《［｛“‘([{"])

/** The node types whose whole lines are not prose. */
const NOT_PROSE = new Set(["code", "heading", "table", "yaml", "toml", "math"])

/** The node types inside which no break may fall. */
const UNBREAKABLE = new Set([
  "inlineCode",
  "html",
  "definition",
  "inlineMath",
  "link",
  "image",
  "linkReference",
  "imageReference",
])

/**
 * The spans of the text, as [start, end) offsets, inside which a line may not
 * break, and the lines that are not prose, collected from the tree.
 */
function collect(root, text) {
  const spans = []
  const skippedLines = new Set()

  /** Walks `node` and its children. */
  function visit(node) {
    const { position } = node
    if (position) {
      if (NOT_PROSE.has(node.type)) {
        for (
          let line = position.start.line;
          line <= position.end.line;
          line++
        ) {
          skippedLines.add(line)
        }
        return
      }
      if (UNBREAKABLE.has(node.type)) {
        spans.push([position.start.offset, position.end.offset])
        return
      }
      if (node.type === "paragraph") {
        // A bracketed citation, `[fixture: name]` or `[test: ...]`, is read on
        // one line by the checks of the documents. It is scanned in the source
        // of the paragraph, because inline code inside it splits the text
        // nodes of the tree.
        const source = text.slice(position.start.offset, position.end.offset)
        for (const match of source.matchAll(/\[[^\]]*\]/gu)) {
          const from = position.start.offset + match.index
          spans.push([from, from + match[0].length])
        }
      }
    }
    for (const child of node.children ?? []) visit(child)
  }

  visit(root)
  return { spans, skippedLines }
}

/** Whether `offset` lies inside one of `spans`. */
function inside(spans, offset) {
  return spans.some(([start, end]) => offset >= start && offset < end)
}

/** The columns of a whole line. */
function widthOf(line) {
  let width = 0
  for (const character of line) width += isWide(character) ? 2 : 1
  return width
}

/**
 * The columns of the longest prefix of `line` that ends at a break
 * opportunity within the limit and leaves more than closing punctuation, or
 * null when the line cannot be wrapped that way. `lineStart` is the offset of
 * the line in the text, for the span test.
 */
function wrappablePrefixWidth(line, lineStart, spans) {
  const characters = [...line]
  const offsets = []
  let offset = lineStart
  for (const character of characters) {
    offsets.push(offset)
    offset += character.length
  }
  const indentation = /^\s*(?:[*+\->]\s+|\d+\.\s+)?/u.exec(line)[0].length
  let width = 0
  let best = null
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
    const columns = isWide(character) ? 2 : 1
    if (width + columns > LIMIT) break
    width += columns
    const next = characters[i + 1]
    if (next === undefined || offsets[i] - lineStart < indentation) continue
    if (inside(spans, offsets[i]) && inside(spans, offsets[i + 1])) continue
    const atWhitespace = /\s/u.test(next)
    const betweenWide =
      isWide(character) &&
      isWide(next) &&
      !NO_LINE_START.has(next) &&
      !NO_LINE_END.has(character)
    if (!atWhitespace && !betweenWide) continue
    const rest = characters
      .slice(i + 1)
      .join("")
      .trim()
    if (rest === "" || [...rest].every((c) => NO_LINE_START.has(c))) continue
    best = width
  }
  return best
}

/** The rule. */
const jaLineWidth = {
  meta: {
    type: "layout",
    docs: {
      description: `Japanese prose is wrapped at ${LIMIT} columns (a wide character is 2)`,
    },
    messages: {
      tooWide:
        "This line is {{width}} columns wide; a break fits at column {{prefix}}.",
    },
    schema: [],
  },
  create(context) {
    const { sourceCode } = context
    return {
      root(root) {
        const { text } = sourceCode
        const { spans, skippedLines } = collect(root, text)
        let lineStart = 0
        text.split("\n").forEach((rawLine, index) => {
          const lineNumber = index + 1
          const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine
          const start = lineStart
          lineStart += rawLine.length + 1
          if (skippedLines.has(lineNumber)) return
          const width = widthOf(line)
          if (width <= LIMIT) return
          const prefix = wrappablePrefixWidth(line, start, spans)
          if (prefix === null) return
          context.report({
            loc: {
              start: { line: lineNumber, column: 0 },
              end: { line: lineNumber, column: [...line].length },
            },
            messageId: "tooWide",
            data: { width: String(width), prefix: String(prefix) },
          })
        })
      },
    }
  },
}

/** The local plugin that holds the rule. */
export const localPlugin = {
  meta: { name: "local", version: "0.0.0" },
  rules: { "ja-line-width": jaLineWidth },
}
