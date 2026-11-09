// Shared Markdown source ranges, Japanese widths and break constraints.
import { util } from "prettier"

const LIMIT = 80

/**
 * Whether a character is wide: Prettier's `util.getStringWidth`, with which
 * Prettier wraps the English documents, gives it two columns.
 */
function isWide(character) {
  return util.getStringWidth(character) === 2
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

/** The outer protected ranges; nested ranges belong to the enclosing word. */
function outermostSpans(spans) {
  const result = []
  for (const span of spans.toSorted((a, b) => a[0] - b[0] || b[1] - a[1])) {
    const previous = result.at(-1)
    if (previous && span[0] < previous[1])
      previous[1] = Math.max(previous[1], span[1])
    else result.push([...span])
  }
  return result
}

/** Collects inline protection, emphasis and hard breaks for one paragraph. */
function collectInline(node, entry) {
  const { position } = node
  if (UNBREAKABLE.has(node.type)) {
    entry.spans.push([position.start.offset, position.end.offset, node.type])
    return
  }
  if (node.type === "break")
    entry.hardBreaks.push([position.start.offset, position.end.offset])
  if (["strong", "emphasis", "delete"].includes(node.type)) {
    const size = node.type === "emphasis" ? 1 : 2
    entry.emphasis.push({
      start: position.start.offset,
      openingEnd: position.start.offset + size,
      closingStart: position.end.offset - size,
      end: position.end.offset,
    })
  }
  for (const child of node.children ?? []) collectInline(child, entry)
}

/** Collects matching bracketed references, including their nested brackets. */
function collectCitations(entry) {
  const { text, node } = entry
  let start = 0
  let depth = 0
  let protectedIndex = 0
  for (
    let at = node.position.start.offset;
    at < node.position.end.offset;
    at++
  ) {
    if (text[at] === "\\") {
      at++
      continue
    }
    while (entry.spans[protectedIndex]?.[1] <= at) protectedIndex++
    const span = entry.spans[protectedIndex]
    if (depth === 0 && span && span[0] <= at) {
      at = span[1] - 1
      continue
    }
    if (text[at] === "[") {
      if (depth === 0) start = at
      depth++
    } else if (text[at] === "]" && depth > 0) {
      depth--
      if (depth === 0) entry.citations.push([start, at + 1, "citation"])
    }
  }
}

/** Paragraph-local source ranges and containers, collected from the Markdown tree. */
function collect(root, text) {
  const paragraphs = []

  /** Visits prose containers without traversing non-prose blocks. */
  function visit(node, ancestors = []) {
    if (node.type === "paragraph") {
      const entry = {
        node,
        text,
        ancestors,
        spans: [],
        citations: [],
        emphasis: [],
        hardBreaks: [],
      }
      collectInline(node, entry)
      collectCitations(entry)
      entry.spans = outermostSpans([...entry.spans, ...entry.citations])
      paragraphs.push(entry)
      return
    }
    if (NOT_PROSE.has(node.type) || ["html", "definition"].includes(node.type))
      return
    for (const child of node.children ?? []) visit(child, [...ancestors, node])
  }

  visit(root)
  return { paragraphs }
}

/** Whether a break preserves protected content, brackets and emphasis. */
function breakAllowed(
  left,
  right,
  offset,
  spans,
  emphasis = [],
  rightOffset = offset,
  leftOffset = offset,
) {
  if (NO_LINE_END.has(left) || NO_LINE_START.has(right)) return false
  if (spans.some(([start, end]) => offset > start && offset < end)) return false
  return !emphasis.some(
    (span) =>
      leftOffset === span.openingEnd ||
      rightOffset === span.closingStart ||
      (offset > span.start && offset <= span.openingEnd) ||
      (offset >= span.closingStart && offset < span.end),
  )
}

/** The columns of a whole line, as Prettier's `util.getStringWidth` counts them. */
function widthOf(line) {
  return util.getStringWidth(line)
}

/** Whether the whole line is one overlong word with inseparable punctuation and emphasis. */
function isOverlongWordLine(prefix, tokens) {
  let word = null
  let afterWord = false
  let width = widthOf(prefix)
  for (const token of tokens) {
    width += widthOf(token.value)
    if (token.protectedSpan) {
      if (afterWord || (word && word !== token.protectedSpan)) return false
      word = token.protectedSpan
    } else if (word) {
      afterWord = true
      if (!NO_LINE_START.has(token.value) && token.emphasisMarker !== "closing")
        return false
    } else if (
      !NO_LINE_END.has(token.value) &&
      token.emphasisMarker !== "opening"
    )
      return false
  }
  return word !== null && width > LIMIT
}

export {
  LIMIT,
  isWide,
  widthOf,
  NO_LINE_START,
  collect,
  breakAllowed,
  isOverlongWordLine,
}
