// Japanese prose has one sentence per line, with greedy comma wrapping.
import markdown from "@eslint/markdown"
import {
  LIMIT,
  isWide,
  widthOf,
  collect,
  inside,
  breakAllowed,
  NO_LINE_START,
} from "../utils/japanese-prose.mjs"

const OPEN = new Map([
  ["（", "）"],
  ["「", "」"],
  ["『", "』"],
  ["【", "】"],
  ["〔", "〕"],
  ["〈", "〉"],
  ["《", "》"],
])
const CLOSE = new Set(OPEN.values())

/** The paragraph's source characters and original container prefixes. */
function paragraphTokens(text, entry, info) {
  const { node } = entry
  const start = node.position.start.offset
  const end = node.position.end.offset
  const lineStart = text.lastIndexOf("\n", start - 1) + 1
  const firstPrefix = text.slice(lineStart, start)
  const continuation = firstPrefix.replace(/[^\t >]/gu, " ")
  const quoteDepth = entry.ancestors.filter(
    (n) => n.type === "blockquote",
  ).length
  const tokens = []
  let at = start
  while (at < end) {
    if (text[at] === "\n" || text.slice(at, at + 2) === "\r\n") {
      const from = at
      at += text[at] === "\r" ? 2 : 1
      let quotes = 0
      while (at < end) {
        if (text[at] === " " || text[at] === "\t") at++
        else if (text[at] === ">" && quotes < quoteDepth) {
          quotes++
          at++
        } else break
      }
      const before = text.slice(start, from)
      tokens.push({
        value: "\n",
        from,
        to: at,
        raw: text.slice(from, at),
        hard:
          / {2,}$/u.test(before) ||
          info.hardBreaks.some(([a, b]) => from >= a && from < b),
      })
    } else {
      const value = String.fromCodePoint(text.codePointAt(at))
      tokens.push({ value, from: at, to: at + value.length, raw: value })
      at += value.length
    }
  }
  return { tokens, firstPrefix, continuation, start, end }
}

/** Joins only soft breaks with at least one wide neighbor. */
function joinLines(tokens, info) {
  const result = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const left = result.findLast(
      (t) => t.value !== "" && t.value !== " " && t.value !== "\t",
    )
    const right = tokens[i + 1]
    if (
      token.value !== "\n" ||
      token.hard ||
      !left ||
      !right ||
      inside(info.spans, token.from)
    ) {
      result.push(token)
      continue
    }
    if (!isWide(left.value) && !isWide(right.value)) {
      result.push(token)
      continue
    }
    const bothWide = isWide(left.value) && isWide(right.value)
    let from = token.from
    while (result.at(-1)?.value === " ") from = result.pop().from
    result.push({
      value: bothWide ? "" : " ",
      from,
      to: token.to,
      raw: "",
      joined: true,
    })
  }
  return result
}

/** Whether a token separates sentences or a sentence from its citations. */
function whitespace(token) {
  return token && !token.hard && /^[\t\n ]*$/u.test(token.value)
}

/** Sentence ranges, with closing emphasis and following citations attached. */
function sentences(tokens, info) {
  const ranges = []
  const brackets = []
  let start = 0
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.hard) {
      ranges.push({ start, end: i, next: i + 1, separator: token.raw })
      start = i + 1
      brackets.length = 0
      continue
    }
    if (inside(info.spans, token.from)) continue
    if (OPEN.has(token.value)) brackets.push(OPEN.get(token.value))
    else if (CLOSE.has(token.value) && brackets.at(-1) === token.value)
      brackets.pop()
    if (token.value !== "。" || brackets.length) continue
    let end = i + 1
    for (;;) {
      const from = tokens[end]?.from
      const closer = info.emphasis.find((s) => s.closingStart === from)
      if (!closer) break
      while (end < tokens.length && tokens[end].from < closer.end) end++
    }
    // Only a complete bracketed citation, not the label of a Markdown link.
    for (;;) {
      let at = end
      while (whitespace(tokens[at])) at++
      if (at === end) break
      const citation = info.citations.find(
        ([a, b]) =>
          a === tokens[at]?.from &&
          !info.spans.some(
            ([x, y, type]) => type !== "citation" && x <= a && y >= b,
          ),
      )
      if (!citation) break
      while (at < tokens.length && tokens[at].from < citation[1]) at++
      end = at
    }
    let next = end
    while (whitespace(tokens[next])) next++
    if (tokens[next]?.hard) continue
    if (NO_LINE_START.has(tokens[next]?.value)) continue
    ranges.push({ start, end, next })
    start = next
    i = next - 1
  }
  if (start < tokens.length)
    ranges.push({ start, end: tokens.length, next: tokens.length })
  return ranges
}

/** The common source-range and punctuation constraints at a candidate. */
function allowed(left, right, offset, info) {
  return (
    left &&
    right &&
    breakAllowed(
      left.value,
      right.value,
      offset,
      info.spans,
      info.emphasis,
      right.from,
      left.to,
    )
  )
}

/** A continuation must remain prose, rather than start a list or another block. */
function continuesParagraph(tokens, start, info) {
  // Prettier rejoins a line starting with a bare asterisk before punctuation.
  // A parsed emphasis opener is safe; a literal operator stays with its prose.
  if (
    tokens[start]?.value === "*" &&
    NO_LINE_START.has(tokens[start + 1]?.value) &&
    !info.emphasis.some((span) => span.start === tokens[start].from)
  )
    return false
  const source = tokens
    .slice(start)
    .map((token) => token.value)
    .join("")
  const tree = paragraphTree(`prose\n${source}`, "")
  return tree?.children.length === 1 && tree.children[0].type === "paragraph"
}

/** The characters of the tokens, joined. */
function textOf(tokens) {
  return tokens.map((t) => t.value).join("")
}

/** A break at the halfwidth space `i` between halfwidth neighbors, or null. */
function spaceBreak(tokens, i, info) {
  let next = i + 1
  while (tokens[next]?.value === " ") next++
  const left = tokens[i - 1]
  const right = tokens[next]
  if (!left || !right || isWide(left.value) || isWide(right.value)) return null
  if (!allowed(left, right, tokens[i].from, info)) return null
  if (!continuesParagraph(tokens, next, info)) return null
  return { end: i, next }
}

/** A break after the comma `i`, or null. */
function commaBreak(tokens, i, info) {
  let next = i + 1
  while (tokens[next]?.value === " ") next++
  if (!allowed(tokens[i], tokens[next], tokens[i].to, info)) return null
  if (!continuesParagraph(tokens, next, info)) return null
  return { end: i + 1, next }
}

/** The last allowed break whose line fits within the limit, or null. */
function lastBreakWithin(tokens, prefix, info) {
  let width = widthOf(prefix)
  let best = null
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.value === " " && tokens[i - 1]?.value !== " ")
      best = spaceBreak(tokens, i, info) ?? best
    width += widthOf(token.value)
    if (width > LIMIT) break
    if (token.value === "、") best = commaBreak(tokens, i, info) ?? best
  }
  return best
}

/** The first allowed break of the line, or null. */
function firstBreak(tokens, info) {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const found =
      token.value === " " && tokens[i - 1]?.value !== " "
        ? spaceBreak(tokens, i, info)
        : token.value === "、"
          ? commaBreak(tokens, i, info)
          : null
    if (found !== null) return found
  }
  return null
}

/** Whether a line exceeds the limit only because of one unbreakable span. */
function widerOnlyBySpan(prefix, tokens, info) {
  let widest = 0
  for (const [from, to] of info.spans) {
    const span = tokens.filter((t) => t.from >= from && t.to <= to)
    if (span.length > 0) widest = Math.max(widest, widthOf(textOf(span)))
  }
  return widest > 0 && widthOf(prefix + textOf(tokens)) - widest <= LIMIT
}

/**
 * Greedily wraps a soft line. A line that is too wide only because of an
 * unbreakable span is kept as it is; any other line that cannot be made to fit
 * returns null, without partially wrapping the soft line.
 */
function wrapLine(tokens, firstPrefix, continuation, info) {
  const lines = []
  let remaining = tokens.filter((t) => t.value !== "")
  let prefix = firstPrefix
  while (remaining.length > 0) {
    if (widthOf(prefix + textOf(remaining)) <= LIMIT) {
      lines.push(textOf(remaining))
      break
    }
    const within = lastBreakWithin(remaining, prefix, info)
    const found = within ?? firstBreak(remaining, info)
    const line = found === null ? remaining : remaining.slice(0, found.end)
    if (within === null && !widerOnlyBySpan(prefix, line, info)) return null
    lines.push(textOf(line))
    remaining = found === null ? [] : remaining.slice(found.next)
    prefix = continuation
  }
  return lines.join(`\n${continuation}`)
}

/** Wraps a complete sentence; retained halfwidth and hard breaks stay fixed. */
function wrapSentence(tokens, firstPrefix, continuation, info) {
  const lines = []
  let start = 0
  for (let i = 0; i <= tokens.length; i++) {
    if (i !== tokens.length && tokens[i].value !== "\n") continue
    const prefix = lines.length ? continuation : firstPrefix
    const line = wrapLine(tokens.slice(start, i), prefix, continuation, info)
    if (line === null) return null
    lines.push(line)
    if (i < tokens.length) lines.push(tokens[i].raw)
    start = i + 1
  }
  return lines.join("")
}

/** Inline structure and non-whitespace content, including protected values. */
function signature(node) {
  const result = { ...node }
  delete result.position
  if (node.type === "text") result.value = node.value.replace(/[\t\n\r ]/gu, "")
  if (node.children) result.children = node.children.map(signature)
  return result
}

/** Parses the source in its original list/quote container for the shape check. */
function paragraphTree(source, continuation) {
  const body = source
    .split("\n")
    .map((line, index) =>
      index > 0 && line.startsWith(continuation)
        ? line.slice(continuation.length)
        : line,
    )
    .join("\n")
  const parsed = markdown.languages.gfm.parse(
    { body },
    { languageOptions: { frontmatter: "yaml" } },
  )
  return parsed.ok ? signature(parsed.ast) : null
}

/** Computes one paragraph's normal form and records sentences left untouched. */
function paragraphNormalForm(text, entry, info) {
  const original = paragraphTokens(text, entry, info)
  const joined = joinLines(original.tokens, info)
  const ranges = sentences(joined, info)
  const pieces = []
  const unfixable = []
  for (const [index, range] of ranges.entries()) {
    const tokens = joined.slice(range.start, range.end)
    const firstPrefix =
      index === 0 ? original.firstPrefix : original.continuation
    const wrapped = wrapSentence(
      tokens,
      firstPrefix,
      original.continuation,
      info,
    )
    if (wrapped === null) {
      const from = tokens[0].from
      const to = tokens.at(-1).to
      pieces.push(text.slice(from, to))
      unfixable.push({
        from,
        to,
        width: widthOf(
          firstPrefix +
            tokens.map((t) => (t.value === "\n" ? "" : t.value)).join(""),
        ),
        reason: "No complete layout within 80 columns",
      })
    } else pieces.push(wrapped)
    if (index < ranges.length - 1)
      pieces.push(range.separator ?? `\n${original.continuation}`)
  }
  const output = pieces.join("")
  const source = text.slice(original.start, original.end)
  if (
    output !== source &&
    JSON.stringify(paragraphTree(source, original.continuation)) !==
      JSON.stringify(paragraphTree(output, original.continuation))
  ) {
    return {
      text: source,
      unfixable: [
        {
          from: original.start,
          to: original.end,
          width: widthOf(
            joined.map((t) => (t.value === "\n" ? "" : t.value)).join(""),
          ),
          reason: "Wrapping would change Markdown structure",
        },
      ],
    }
  }
  return { text: output, unfixable }
}

/** A single, nonoverlapping whitespace fix for each changed paragraph. */
export const jaLineBreaks = {
  meta: {
    type: "layout",
    docs: {
      description: "Normalize Japanese prose sentence breaks and wrapping",
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      normalize:
        "Use one sentence per line and wrap long sentences after 、 within 80 columns.",
      cannotFit:
        "This sentence is {{width}} columns wide and cannot be broken after 、 within 80 columns: split it or add a 、.",
    },
  },
  create(context) {
    return {
      root(root) {
        const { text } = context.sourceCode
        const info = collect(root, text)
        for (const entry of info.paragraphs) {
          const { node } = entry
          const result = paragraphNormalForm(text, entry, entry)
          const range = [node.position.start.offset, node.position.end.offset]
          for (const sentence of result.unfixable) {
            context.report({
              loc: {
                start: context.sourceCode.getLocFromIndex(sentence.from),
                end: context.sourceCode.getLocFromIndex(sentence.to),
              },
              messageId: "cannotFit",
              data: { width: sentence.width },
            })
          }
          const source = text.slice(range[0], range[1])
          if (result.text !== source) {
            let difference = 0
            while (
              difference < source.length &&
              source[difference] === result.text[difference]
            )
              difference++
            context.report({
              loc: context.sourceCode.getLocFromIndex(range[0] + difference),
              messageId: "normalize",
              fix(fixer) {
                return fixer.replaceTextRange(range, result.text)
              },
            })
          }
        }
      },
    }
  },
}
