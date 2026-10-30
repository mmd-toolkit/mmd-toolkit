// Japanese prose has one sentence per line, with greedy comma wrapping.
import markdown from "@eslint/markdown"
import {
  LIMIT,
  isWide,
  widthOf,
  collect,
  breakAllowed,
  NO_LINE_START,
  isOverlongWordLine,
} from "../utils/japanese-prose.mjs"

const OPEN = new Map([
  ["（", "）"],
  ["「", "」"],
  ["『", "』"],
  ["【", "】"],
  ["〔", "〕"],
  ["〈", "〉"],
  ["《", "》"],
  ["(", ")"],
])

/** The paragraph's source characters and original container prefixes. */
function paragraphTokens(entry) {
  const { text, node } = entry
  const start = node.position.start.offset
  const end = node.position.end.offset
  const lineStart = text.lastIndexOf("\n", start - 1) + 1
  const firstPrefix = text.slice(lineStart, start)
  const continuation = firstPrefix.replace(/[^\t >]/gu, " ")
  const quoteDepth = entry.ancestors.filter(
    (n) => n.type === "blockquote",
  ).length
  const hardBreakStarts = new Set(entry.hardBreaks.map(([from]) => from))
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
          entry.hardBreaks.some(([a, b]) => from >= a && from < b),
      })
    } else {
      const value = String.fromCodePoint(text.codePointAt(at))
      const token = { value, from: at, to: at + value.length, raw: value }
      // The `\` that marks a hard break belongs to the text before it.
      if (value === "\\" && hardBreakStarts.has(at))
        token.hardBreakMarker = true
      tokens.push(token)
      at += value.length
    }
  }
  let protectedIndex = 0
  const emphasisMarkers = new Map()
  for (const span of entry.emphasis) {
    for (let offset = span.start; offset < span.openingEnd; offset++)
      emphasisMarkers.set(offset, "opening")
    for (let offset = span.closingStart; offset < span.end; offset++)
      emphasisMarkers.set(offset, "closing")
  }
  for (const token of tokens) {
    while (entry.spans[protectedIndex]?.[1] <= token.from) protectedIndex++
    const span = entry.spans[protectedIndex]
    if (span && span[0] <= token.from && token.to <= span[1])
      token.protectedSpan = span
    token.emphasisMarker = emphasisMarkers.get(token.from)
  }
  return { tokens, firstPrefix, continuation, start, end }
}

/** Joins soft breaks, preserving protected ranges and Markdown hard breaks. */
function joinLines(tokens) {
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
      token.protectedSpan
    ) {
      result.push(token)
      continue
    }
    const bothWide = isWide(left.value) && isWide(right.value)
    let from = token.from
    while (result.at(-1)?.value === " " && !result.at(-1).protectedSpan)
      from = result.pop().from
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

/** The bracket pairs that close within the same hard-break segment. */
function matchedBrackets(tokens) {
  const pending = new Map()
  const opens = new Set()
  const closes = new Set()
  for (const [index, token] of tokens.entries()) {
    if (token.hard) {
      pending.clear()
      continue
    }
    if (token.protectedSpan) continue
    const closing = OPEN.get(token.value)
    if (closing) {
      if (!pending.has(closing)) pending.set(closing, [])
      pending.get(closing).push(index)
    } else {
      const opening = pending.get(token.value)?.pop()
      if (opening !== undefined) {
        opens.add(opening)
        closes.add(index)
      }
    }
  }
  return { opens, closes }
}

/** Sentence ranges, including closing emphasis and every following citation. */
function sentences(tokens, info) {
  const ranges = []
  const pairs = matchedBrackets(tokens)
  const emphasisEnds = new Map(
    info.emphasis.map((span) => [span.closingStart, span.end]),
  )
  const citations = new Map(info.citations.map(([from, to]) => [from, to]))
  let depth = 0
  let start = 0
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.hard) {
      ranges.push({ start, end: i, next: i + 1, separator: token.raw })
      start = i + 1
      depth = 0
      continue
    }
    if (token.protectedSpan) continue
    if (pairs.opens.has(i)) depth++
    if (pairs.closes.has(i)) depth--
    if (token.value !== "。" || depth > 0) continue
    let end = i + 1
    while (emphasisEnds.has(tokens[end]?.from)) {
      const closingEnd = emphasisEnds.get(tokens[end].from)
      while (end < tokens.length && tokens[end].from < closingEnd) end++
    }
    if (tokens[end]?.hardBreakMarker) end++
    let afterBody = end
    while (whitespace(tokens[afterBody])) afterBody++
    if (tokens[afterBody]?.hard || NO_LINE_START.has(tokens[afterBody]?.value))
      continue
    const bodyEnd = end
    const references = []
    for (;;) {
      let at = end
      while (whitespace(tokens[at])) at++
      const citationEnd = citations.get(tokens[at]?.from)
      if (citationEnd === undefined) break
      const referenceStart = at
      while (at < tokens.length && tokens[at].from < citationEnd) at++
      // Punctuation that may not start a line stays with its reference.
      while (NO_LINE_START.has(tokens[at]?.value) && !tokens[at].protectedSpan)
        at++
      if (tokens[at]?.hardBreakMarker) at++
      references.push({ start: referenceStart, end: at })
      end = at
    }
    let next = end
    while (whitespace(tokens[next])) next++
    if (tokens[next]?.hard) {
      if (references.length === 0) continue
      // A hard break after the references closes the sentence; the spaces
      // that mark the break stay with the last reference.
      references.at(-1).end = next
      ranges.push({
        start,
        end: next,
        next: next + 1,
        separator: tokens[next].raw,
        bodyEnd,
        references,
      })
      start = next + 1
      depth = 0
      i = next
      continue
    }
    ranges.push({ start, end, next, bodyEnd, references })
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
  const characters = []
  const newline = info.text.indexOf("\n", tokens[start].from)
  const lineEnd = newline === -1 ? info.text.length : newline
  for (
    let i = start;
    i < tokens.length && tokens[i].value !== "\n" && tokens[i].from < lineEnd;
    i++
  )
    characters.push(tokens[i].value)
  const source = characters.join("")
  const tree = paragraphTree(`prose\n${source}`, "")
  return tree?.children.length === 1 && tree.children[0].type === "paragraph"
}

/** The characters of the tokens, joined. */
function textOf(tokens) {
  return tokens.map((t) => t.value).join("")
}

/** A break at the space run starting at `i`, or null. */
function spaceBreak(tokens, i, info) {
  let next = i + 1
  while (tokens[next]?.value === " ") next++
  const left = tokens[i - 1]
  const right = tokens[next]
  if (!left || !right) return null
  // A space between two wide characters is not a break: a break there is not
  // beside a code span, a link, or a Latin word, and the join would drop it.
  if (isWide(left.value) && isWide(right.value)) return null
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
  let comma = null
  let space = null
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.value === " " && tokens[i - 1]?.value !== " ")
      space = spaceBreak(tokens, i, info) ?? space
    width += widthOf(token.value)
    if (width > LIMIT) break
    if (token.value === "、") comma = commaBreak(tokens, i, info) ?? comma
  }
  return comma ?? space
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

/**
 * Greedily wraps a soft line. Only a protected word that exceeds the limit by
 * itself may remain too wide; otherwise failure leaves the whole sentence unchanged.
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
    if (within === null && !isOverlongWordLine(prefix, line)) return null
    lines.push(textOf(line))
    remaining = found === null ? [] : remaining.slice(found.next)
    prefix = continuation
  }
  return lines.join(`\n${continuation}`)
}

/** Wraps a sentence while retaining protected and hard line breaks. */
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

/** Appends reference groups after laying out the body, retaining adjacent `][`. */
function appendReferences(
  body,
  references,
  tokens,
  firstPrefix,
  continuation,
  info,
) {
  let output = body
  for (let i = 0; i < references.length; i++) {
    const start = references[i].start
    let end = references[i].end
    while (references[i + 1]?.start === end) end = references[++i].end
    const group = tokens.slice(start, end)
    const newline = output.lastIndexOf("\n")
    const lastLine =
      newline === -1 ? firstPrefix + output : output.slice(newline + 1)
    const firstLineEnd = group.findIndex((token) => token.value === "\n")
    const firstLine = firstLineEnd === -1 ? group : group.slice(0, firstLineEnd)
    const fits = widthOf(`${lastLine} ${textOf(firstLine)}`) <= LIMIT
    const prefix = fits ? `${lastLine} ` : continuation
    const reference = wrapSentence(group, prefix, continuation, info)
    if (reference === null) return null
    output += (fits ? " " : `\n${continuation}`) + reference
  }
  return output
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
function paragraphNormalForm(entry) {
  const { text } = entry
  const original = paragraphTokens(entry)
  const joined = joinLines(original.tokens)
  const ranges = sentences(joined, entry)
  const pieces = []
  const unfixable = []
  for (const [index, range] of ranges.entries()) {
    const tokens = joined.slice(range.start, range.end)
    const firstPrefix =
      index === 0 ? original.firstPrefix : original.continuation
    let wrapped = wrapSentence(
      joined.slice(range.start, range.bodyEnd ?? range.end),
      firstPrefix,
      original.continuation,
      entry,
    )
    if (wrapped !== null && range.references?.length)
      wrapped = appendReferences(
        wrapped,
        range.references,
        joined,
        firstPrefix,
        original.continuation,
        entry,
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
    if (range.separator !== undefined || index < ranges.length - 1)
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
        "Use one sentence per line and wrap long sentences after 、 or at a space within 80 columns, with following references on the last line or continuation lines.",
      cannotFit:
        "This sentence is {{width}} columns wide and cannot be broken after 、 or at a space within 80 columns: split it or add a 、.",
    },
  },
  create(context) {
    return {
      root(root) {
        const { text } = context.sourceCode
        const info = collect(root, text)
        for (const entry of info.paragraphs) {
          const { node } = entry
          const result = paragraphNormalForm(entry)
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
