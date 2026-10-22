/**
 * The reading of a fixture's input that an implementation of the specification
 * has to give where it is not what mermaid.js gives: mermaid.js read with the
 * known divergence that changes how it reads the input taken out. It is
 * recorded in `specified.json` (see `docs/expected-results.md`).
 */
import type { MermaidConfig } from "../../packages/tests/src/index.ts"
import { scanSource } from "../../packages/tests/src/source-scan.ts"
import type {
  DivergenceRemoval,
  MermaidRun,
} from "../../packages/tests/src/mermaid.ts"
import {
  extractFrontmatterTitle,
  runMermaidWithEmbeddedData,
} from "../../packages/tests/src/mermaid.ts"

/**
 * The three divergences of the gantt lexer that act on a `%` comment: the
 * rules of one lexer for a `%` after a character, for a `%` comment and its
 * line break, and for `%%{`. A fixture of one is read through the rules of the
 * others, since a text with a comment that takes a character or a line break
 * reaches the rule for `%%{` through them (checked by running every gantt
 * fixture with the three removed: only the fixtures with one of the marks
 * differ).
 */
const GANTT_COMMENT_REMOVALS: readonly DivergenceRemoval[] = [
  "comment-takes-character",
  "comment-takes-line-break",
  "percent-brace-after-unit",
]

/**
 * The known divergences whose fixtures are read by mermaid.js with a part of
 * it taken out (lexer rules, or the detector of C4), each with the removals to
 * make. The two class divergences are taken out together: both change the
 * lexer of the class diagram, and a fixture of one can be read through the
 * rules of the other. `comment-takes-line-break` is also one of the three of
 * gantt, so its fixtures take out all four. The two divergences of the xychart
 * lexer are taken out together as well: a title that holds a digit after an
 * axis statement can stand beside a comment glued to a word.
 */
const REMOVALS_OF_MARKS: Readonly<
  Record<string, readonly DivergenceRemoval[]>
> = {
  "c4-keyword-anywhere": ["c4-keyword-anywhere"],
  "comment-takes-character": [
    ...GANTT_COMMENT_REMOVALS,
    "title-digit-after-axis-statement",
  ],
  "comment-takes-line-break": [
    ...GANTT_COMMENT_REMOVALS,
    "name-start-reads-unit",
  ],
  "name-start-reads-unit": [
    "comment-takes-line-break",
    "name-start-reads-unit",
  ],
  "percent-brace-after-unit": GANTT_COMMENT_REMOVALS,
  "title-digit-after-axis-statement": [
    "comment-takes-character",
    "title-digit-after-axis-statement",
  ],
}

/** The mark of the divergence that mermaid.js reads the frontmatter of differently. */
const HTML_TAG_MARK = "html-tag-in-frontmatter"

/** The mark of the divergence about a bare `%%` line before the header. */
const BARE_PERCENT_MARK = "bare-percent-line-before-header"

/** The mark of the divergence about a blank line after the header or after a comment line in a mindmap or a kanban. */
const BLANK_LINES_MARK = "blank-line-after-header-or-comments"

/**
 * What mermaid.js gives for `input` read as the specification reads it, for a
 * fixture with the mark `knownDivergence`; `undefined` where the mark has no
 * such reading. Throws where the reading cannot be made (see below).
 *
 * For `bare-percent-line-before-header` the input is read once more without
 * the bare `%%` lines before its header and the lines of whitespace only
 * among them (see {@link withoutBarePercentLinesBeforeHeader}): the
 * specification reads them as trivia in every diagram type, and mermaid.js
 * hands them to the lexer of a diagram type that does not read them so. The
 * title and the configuration do not depend on them.
 *
 * For `blank-line-after-header-or-comments` the input is read once more
 * without the empty lines and the lines of whitespace only after its header,
 * and without the whitespace that ends the header line (see
 * {@link withoutBlankLinesAfterHeader}): the specification reads them as
 * trivia, and mermaid.js hands them to a lexer whose grammar takes them only
 * in some places.
 *
 * For `html-tag-in-frontmatter` the input is read once more with every `<` of
 * its frontmatter replaced by `(`: mermaid.js finds HTML tags from the start
 * of the source, so a tag that starts in the frontmatter changes how it reads
 * the text, and the reference input has none. The values that depend on the
 * frontmatter (the title, the configuration) are those of the input as
 * written, since the specification reads the frontmatter as it is written.
 */
export async function specifiedRunOf(
  input: string,
  knownDivergence: string | undefined,
  config: MermaidConfig | undefined,
): Promise<MermaidRun | undefined> {
  if (knownDivergence === undefined) return undefined
  const options = config === undefined ? {} : { config }
  const removals = REMOVALS_OF_MARKS[knownDivergence]
  if (removals !== undefined) {
    return runMermaidWithEmbeddedData(input, {
      ...options,
      withoutDivergences: removals,
    })
  }
  if (knownDivergence === BARE_PERCENT_MARK) {
    return runMermaidWithEmbeddedData(
      withoutBarePercentLinesBeforeHeader(input),
      options,
    )
  }
  if (knownDivergence === BLANK_LINES_MARK) {
    return runMermaidWithEmbeddedData(
      withoutBlankLinesAfterHeader(input),
      options,
    )
  }
  if (knownDivergence !== HTML_TAG_MARK) return undefined
  const reference = await runMermaidWithEmbeddedData(
    withoutFrontmatterTagStarts(input),
    options,
  )
  // A reference input that mermaid.js rejects is the reading of the
  // specification (it rejects), unless the rejection comes from the
  // replacement itself, which can make the YAML of the frontmatter invalid:
  // then there is no reading to record, and whoever adds such a fixture
  // decides how its specified reading is made. When the YAML of the written
  // input is invalid as well, the replacement is not the cause.
  const written = await runMermaidWithEmbeddedData(input, options)
  if (
    !reference.outcome.accepted &&
    reference.outcome.error.name === "YAMLException" &&
    (written.outcome.accepted || written.outcome.error.name !== "YAMLException")
  ) {
    throw new Error(
      "the replacement of `<` in the frontmatter made its YAML invalid, so the specified reading cannot be taken from mermaid.js; decide how it is made for this fixture",
    )
  }
  if (!reference.outcome.accepted) return reference
  const title = extractFrontmatterTitle(input)
  const embedded = written.embedded ?? reference.embedded
  return {
    outcome: withTitle(reference, title),
    embedded:
      embedded === undefined || title === undefined
        ? embedded
        : { ...embedded, title },
  }
}

/**
 * The outcome of the reference run, where the title of the Db is `title`, the
 * title of the frontmatter as written: the Db of the reference input holds
 * the title with the `(` that stands in for a `<`, which is not what the
 * specification gives. The title is read from the frontmatter whether or not
 * mermaid.js accepts the input.
 */
function withTitle(
  reference: MermaidRun,
  title: string | undefined,
): MermaidRun["outcome"] {
  const { outcome } = reference
  if (
    !outcome.accepted ||
    outcome.db === null ||
    title === undefined ||
    outcome.db.title !== reference.embedded?.title
  ) {
    return outcome
  }
  return { ...outcome, db: { ...outcome.db, title } }
}

/**
 * `text` without the bare `%%` lines before its header, and the lines of
 * whitespace only among the lines before the header. A bare `%%` line is a
 * line that holds, after whitespace, `%%` alone, or `%%{` where no directive
 * starts (known-divergences/bare-percent-line-before-header.md). The lines
 * before the header are those after the frontmatter that are such lines,
 * comment lines, or directives, or hold whitespace only; the first other line
 * is the header, and nothing after it changes. A directive that starts on a
 * line stays, with the lines it spans and without the whitespace around it
 * on its line.
 */
export function withoutBarePercentLinesBeforeHeader(text: string): string {
  const frontmatter = frontmatterLength(text)
  // The frontmatter ends with the line of its closing `---`.
  const start = frontmatter === 0 ? 0 : lineEnd(text, frontmatter).next
  const directiveEnds = new Map(
    scanSource(text, start).directives.map((directive) => [
      directive.range[0],
      directive.scanEnd,
    ]),
  )
  let kept = ""
  let at = start
  while (at < text.length) {
    const end = lineEnd(text, at)
    const line = text.slice(at, end.content)
    const trimmed = line.trimStart()
    const marker = at + (line.length - trimmed.length)
    if (trimmed.trim() === "") {
      // A line of whitespace only: dropped.
    } else if (trimmed.startsWith("%%")) {
      const afterMarks = trimmed.slice(2)
      const directiveEnd = directiveEnds.get(marker)
      if (directiveEnd !== undefined) {
        // A directive stays, with the lines it spans, but not the whitespace
        // around it on its line: without the directive, that line would be a
        // line of whitespace only.
        const through = lineEnd(text, directiveEnd)
        const rest = text.slice(directiveEnd, through.content)
        kept +=
          text.slice(marker, directiveEnd) +
          (rest.trim() === "" ? "" : rest) +
          text.slice(through.content, through.next)
        at = through.next
        continue
      }
      if (afterMarks.trim() === "" || afterMarks.startsWith("{")) {
        // A bare `%%` line: dropped.
      } else {
        kept += text.slice(at, end.next)
      }
    } else {
      return text.slice(0, start) + kept + text.slice(at)
    }
    at = end.next
  }
  return text.slice(0, start) + kept
}

/**
 * `text` without the empty lines and the lines of whitespace only after its
 * header, and without the whitespace that ends the header line (the divergence
 * `blank-line-after-header-or-comments` of the mindmap and the kanban). A line
 * is of whitespace only when nothing but whitespace is left of it once the
 * directives are taken out: mermaid.js removes a directive before it reads the
 * text, so the line of a directive alone is such a line. Every directive after
 * the header moves to a line of its own before it, so that the title and the
 * configuration do not change and no line is left with only a directive. A line
 * feed goes before a U+2028 or a U+2029 that ends a diagram comment when a
 * statement follows it on its line ({@link lineBreakAfterCommentSeparators}).
 * The lines before the header (blank lines, comment lines, directives) and the
 * comment lines and node lines after it stay as they are.
 *
 * The header is the first line after the frontmatter that is neither a line of
 * whitespace only nor a comment line. Throws where a line to take out stands
 * inside text that a node holds across lines (a shape or an icon that is not
 * closed yet), where a blank line is a character of the text and the specified
 * reading cannot be made by taking lines out.
 */
export function withoutBlankLinesAfterHeader(text: string): string {
  const frontmatter = frontmatterLength(text)
  const start = frontmatter === 0 ? 0 : lineEnd(text, frontmatter).next
  const directives = scanSource(text, start).directives
  const inDirective = new Uint8Array(text.length)
  for (const directive of directives) {
    inDirective.fill(1, directive.range[0], directive.scanEnd)
  }

  /** The next physical line terminator outside directives: their interior joins the visible line. */
  function visibleLineEnd(at: number): {
    readonly content: number
    readonly next: number
  } {
    let end = lineEnd(text, at)
    while (inDirective[end.content] === 1) end = lineEnd(text, end.next)
    return end
  }

  /** The text of the line from `at` to `end` without its directives. */
  function visibleOf(at: number, end: number): string {
    let visible = ""
    for (let index = at; index < end; index++) {
      if (inDirective[index] !== 1) visible += text.charAt(index)
    }
    return visible
  }

  /** The directives that start on the line from `at` to `end`, as written. */
  function directivesOf(at: number, end: number): string[] {
    return directives
      .filter(
        (directive) => at <= directive.range[0] && directive.range[0] < end,
      )
      .map((directive) => text.slice(directive.range[0], directive.scanEnd))
  }

  let at = start
  while (at < text.length) {
    const end = visibleLineEnd(at)
    const visible = visibleOf(at, end.content).trim()
    if (visible !== "" && !visible.startsWith("%%")) break
    at = end.next
  }
  if (at >= text.length) return text
  const header = visibleLineEnd(at)
  const moved = directivesOf(at, header.content)
  let kept =
    lineBreakAfterCommentSeparators(visibleOf(at, header.content).trimEnd()) +
    text.slice(header.content, header.next)
  let open = 0
  let cursor = header.next
  while (cursor < text.length) {
    const end = visibleLineEnd(cursor)
    const visible = visibleOf(cursor, end.content)
    open = Math.max(0, open + openersIn(visible))
    if (visible.trim() === "") {
      if (open > 0) {
        throw new Error(
          "a line to take out stands inside the text of a node that is not closed yet; the specified reading cannot be made by taking lines out",
        )
      }
      moved.push(...directivesOf(cursor, end.content))
    } else {
      moved.push(...directivesOf(cursor, end.content))
      kept +=
        lineBreakAfterCommentSeparators(visible) +
        text.slice(end.content, end.next)
    }
    cursor = end.next
  }
  return (
    text.slice(0, at) +
    moved.map((directive) => `${directive}\n`).join("") +
    kept
  )
}

/**
 * `line` with a line feed before each U+2028 or U+2029 that ends a diagram
 * comment when a statement follows it on the line: the comment of mermaid.js
 * ends there, as a line feed ends it, but its grammar needs a line feed between
 * the comment and the statement, and the specification reads the separator as
 * whitespace, so that the indentation of the statement stays. A separator that
 * ends a comment with only whitespace after it on the line is left out with
 * that whitespace. A `%%` starts a
 * comment when only whitespace, the header, or the end of a shape or of an icon
 * (`)`, `]`, `}`, `(`) stands before it on the line, as the lexer reads it; a
 * `%%` in the text of a node is no comment.
 */
function lineBreakAfterCommentSeparators(line: string): string {
  let result = ""
  let before = ""
  let index = 0
  while (index < line.length) {
    if (!line.startsWith("%%", index) || !startsComment(before)) {
      result += line.charAt(index)
      before += line.charAt(index)
      index++
      continue
    }
    let end = index
    while (end < line.length && !"\u2028\u2029".includes(line.charAt(end))) {
      end++
    }
    result += line.slice(index, end)
    if (end === line.length) break
    // The separator ends the comment. With a statement after it on the line, a
    // line feed goes before it; with only whitespace after it, the separator
    // and the whitespace are the end of a line of whitespace and go.
    if (line.slice(end + 1).trim() === "") break
    result += `\n${line.charAt(end)}`
    before = ""
    index = end + 1
  }
  return result
}

/** The headers of the diagram types of the divergence `blank-line-after-header-or-comments`: a `%%` after one of them on its line starts a comment. */
const HEADERS_OF_BLANK_LINE_DIVERGENCE: readonly string[] = [
  "mindmap",
  "kanban",
  "ishikawa",
  "ishikawa-beta",
]

/** Whether a `%%` after `before` on its line starts a comment (see {@link lineBreakAfterCommentSeparators}). */
function startsComment(before: string): boolean {
  const trimmed = before.trim()
  return (
    trimmed === "" ||
    HEADERS_OF_BLANK_LINE_DIVERGENCE.includes(trimmed) ||
    ")]}(".includes(trimmed.charAt(trimmed.length - 1))
  )
}

/** How many more brackets of a node text `line` opens than it closes (negative where it closes more). */
function openersIn(line: string): number {
  let count = 0
  for (const character of line) {
    if (character === "(" || character === "[" || character === "{") count++
    if (character === ")" || character === "]" || character === "}") count--
  }
  return count
}

/**
 * Where the line that starts at `at` ends: `content` is the offset of its
 * line terminator (a line feed, a CRLF, or a lone CR), or the end of the text,
 * and `next` the offset after the terminator.
 */
function lineEnd(
  text: string,
  at: number,
): { readonly content: number; readonly next: number } {
  for (let index = at; index < text.length; index++) {
    const character = text.charAt(index)
    if (character === "\n") return { content: index, next: index + 1 }
    if (character === "\r") {
      return {
        content: index,
        next: text.charAt(index + 1) === "\n" ? index + 2 : index + 1,
      }
    }
  }
  return { content: text.length, next: text.length }
}

/**
 * `text` with every `<` of its frontmatter replaced by `(`. The frontmatter
 * is what mermaid.js takes as such: the text starts with `---`, after blanks
 * that stand for its indentation, and the first line that holds `---` alone
 * after the same indentation closes it.
 */
export function withoutFrontmatterTagStarts(text: string): string {
  const length = frontmatterLength(text)
  return text.slice(0, length).replaceAll("<", "(") + text.slice(length)
}

/**
 * The number of characters of the frontmatter at the start of `text`, up to
 * its closing `---`, or 0: mermaid.js's rule is blanks (the indentation), `---`,
 * blanks and a line break, the lines of the frontmatter, and a line break, the
 * same indentation, `---`, blanks and a line break.
 */
function frontmatterLength(text: string): number {
  let indentation = 0
  while (indentation < text.length && isBlank(text.charAt(indentation))) {
    indentation++
  }
  if (!text.startsWith("---", indentation)) return 0
  let opening = indentation + 3
  while (opening < text.length && isBlank(text.charAt(opening))) opening++
  if (!isLineBreak(text.charAt(opening))) return 0
  const indent = text.slice(0, indentation)
  for (let at = opening + 1; at < text.length; at++) {
    if (!isLineBreak(text.charAt(at))) continue
    if (
      text.startsWith(indent, at + 1) &&
      closesAt(text, at + 1 + indentation)
    ) {
      return at + 1 + indentation + 3
    }
  }
  return 0
}

/** Whether `---` at `at` is followed by blanks and a line break. */
function closesAt(text: string, at: number): boolean {
  if (!text.startsWith("---", at)) return false
  for (let end = at + 3; end < text.length; end++) {
    const character = text.charAt(end)
    if (isLineBreak(character)) return true
    if (!isBlank(character)) return false
  }
  return false
}

/** Whether `character` is a line break of mermaid.js's frontmatter rule. */
function isLineBreak(character: string): boolean {
  return character === "\n" || character === "\r"
}

/** Whether `character` is white space other than a line break. */
function isBlank(character: string): boolean {
  return character.trim() === "" && !isLineBreak(character)
}
