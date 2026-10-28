// Shared Markdown source ranges, Japanese widths and break constraints.
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
  const paragraphs = []
  const citations = []
  const emphasis = []
  const hardBreaks = []

  /** Walks `node` and its children. */
  function visit(node, ancestors = []) {
    const { position } = node
    if (position) {
      if (
        NOT_PROSE.has(node.type) ||
        (["html", "definition"].includes(node.type) &&
          !ancestors.some((ancestor) => ancestor.type === "paragraph"))
      ) {
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
        spans.push([position.start.offset, position.end.offset, node.type])
        return
      }
      if (node.type === "break")
        hardBreaks.push([position.start.offset, position.end.offset])
      if (["strong", "emphasis", "delete"].includes(node.type)) {
        const size = node.type === "emphasis" ? 1 : 2
        emphasis.push({
          start: position.start.offset,
          openingEnd: position.start.offset + size,
          closingStart: position.end.offset - size,
          end: position.end.offset,
        })
      }
      if (node.type === "paragraph") {
        paragraphs.push({ node, ancestors })
      }
    }
    for (const child of node.children ?? []) visit(child, [...ancestors, node])
  }

  visit(root)
  for (const paragraph of paragraphs) {
    const from = paragraph.node.position.start.offset
    const to = paragraph.node.position.end.offset
    const protectedSpans = spans.filter(([a, b]) => a >= from && b <= to)
    let start = 0
    let depth = 0
    for (let at = from; at < to; at++) {
      if (text[at] === "\\") {
        at++
        continue
      }
      if (depth === 0) {
        const protectedSpan = protectedSpans.find(([a, b]) => at >= a && at < b)
        if (protectedSpan) {
          at = protectedSpan[1] - 1
          continue
        }
      }
      if (text[at] === "[") {
        if (depth === 0) start = at
        depth++
      } else if (text[at] === "]" && depth > 0) {
        depth--
        if (depth === 0) {
          const span = [start, at + 1, "citation"]
          spans.push(span)
          citations.push(span)
          protectedSpans.push(span)
        }
      }
    }
    paragraph.spans = protectedSpans
    paragraph.citations = citations.filter(([a, b]) => a >= from && b <= to)
    paragraph.emphasis = emphasis.filter((s) => s.start >= from && s.end <= to)
    paragraph.hardBreaks = hardBreaks.filter(([a, b]) => a >= from && b <= to)
  }
  return { spans, skippedLines, paragraphs, citations, emphasis, hardBreaks }
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

export {
  LIMIT,
  isWide,
  widthOf,
  NO_LINE_START,
  NO_LINE_END,
  collect,
  inside,
  breakAllowed,
}
