import { isWhitespace, isWordCharacter } from "../db-from-tree/characters.ts"
import { trimmed } from "../db-from-tree/values.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import { label } from "./problems.ts"
import {
  childOf,
  entriesOf,
  ownOf,
  textOf,
  checkTokenKinds,
  checkRangeIsHull,
  checkOwnKinds,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { nodeTokensIn } from "./tokens.ts"
import type { CheckedNode } from "./types.ts"
import { childNodesOf, walkNodes } from "./walk.ts"

/** Common structural invariants, including source order and whole raw lexical values. */
export function checkStatementNode(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkRangeIsHull(reading, node, own)
  if (node.type.endsWith("Literal") || node.type.endsWith("IgnoredText")) {
    checkTokenKinds(reading, node, ["RawText"], "a common value or hidden form")
    checkRawUnit(reading, node)
    return
  }
  checkOwnKinds(reading, node, own, [":", "{", "}"])
  const children = childNodesOf(node)
  for (const [index, child] of children.entries()) {
    const next = children[index + 1]
    if (next !== undefined)
      reading.problems.expect(
        child.range[1] <= next.range[0],
        label(node),
        "child fields are not in their specified source order",
      )
  }
}

/** A completed statement needs a surviving EOL; hidden body forms need only readable gaps. */
export function checkStatementBody(
  reading: Reading,
  node: CheckedNode,
  from: number,
): void {
  let end = from
  let previous: CheckedNode | null = null
  for (const item of entriesOf(node, "body")) {
    if (item === null) continue
    if (previous !== null && !previous.type.endsWith("IgnoredText"))
      checkEnd(reading, previous, item.range[0])
    else checkGap(reading, node, end, item.range[0], true, previous)
    end = item.range[1]
    previous = item
  }
  if (previous !== null && !previous.type.endsWith("IgnoredText"))
    checkEnd(reading, previous, reading.text.length)
  else checkGap(reading, node, end, reading.text.length, true, previous)
}

// Shared lexical forms and gap rules. Each diagram checker assigns a form
// to the named position defined by its AST specification.

/** Whether a character is hidden horizontal whitespace, rather than common whitespace. */
export function horizontal(character: string): boolean {
  return character === " " || character === "\t"
}

/** The offset after a maximal run of ASCII horizontal whitespace. */
export function afterHorizontal(text: string, at: number): number {
  let end = at
  while (horizontal(text.charAt(end))) end++
  return end
}

/** A keyword/hidden closer boundary on the converted text; EOF is also a boundary. */
export function boundary(text: string, at: number): boolean {
  return at === text.length || isWhitespace(text.charCodeAt(at))
}

/** Hidden YAML: prefer the earliest qualifying closer after a body line, then an empty body. */
export function yamlEnd(text: string): number | undefined {
  if (!text.startsWith("---")) return undefined
  const opener = afterHorizontal(text, 3)
  if (text.charAt(opener) !== "\n") return undefined
  let line = opener + 1
  const emptyEnd =
    text.startsWith("---", line) && boundary(text, line + 3)
      ? line + 3
      : undefined
  let lf = text.indexOf("\n", line)
  while (lf !== -1) {
    line = lf + 1
    if (text.startsWith("---", line) && boundary(text, line + 3))
      return line + 3
    lf = text.indexOf("\n", line)
  }
  return emptyEnd
}

/** Hidden directives allow punctuation bodies and end at the first qualifying bounded closer. */
export function directiveEnd(text: string): number | undefined {
  if (!text.startsWith("%%{")) return undefined
  for (let at = 3; at < text.length; at++)
    if (text.startsWith("}%%", at) && boundary(text, at + 3)) return at + 3
  return undefined
}

/** The converted text following an occurrence, including the common appended LF. */
export function following(reading: Reading, end: number): string {
  return reading.converted.of([end, reading.text.length + 1])
}

/** The written CR/CRLF/LF consumed by a hidden form, if it immediately follows in converted text. */
export function consumedLineFeed(
  reading: Reading,
  node: CheckedNode,
): TreeRange[] {
  if (!following(reading, node.range[1]).startsWith("\n")) return []
  for (let at = node.range[1]; at < reading.text.length; at++) {
    if (reading.written.isLeftOut(at)) continue
    if (reading.text.charAt(at) === "\r")
      return [[at, at + (reading.text.charAt(at + 1) === "\n" ? 2 : 1)]]
    if (reading.text.charAt(at) === "\n") return [[at, at + 1]]
    break
  }
  return []
}

/** ASCII trivia between units, leaving out actual comments and a hidden form's consumed LF. */
export function gap(
  reading: Reading,
  from: number,
  to: number,
  preceding: CheckedNode | null = null,
  preheader = false,
): string {
  // Comment records exclude trailing whitespace, but the native lexical
  // comment still consumes it, including LS/PS before a physical line end.
  // Before the header, detection also passes the bare line's following
  // whitespace, line terminators and common source trivia without rereading it.
  const omitted = reading.root.comments.map((comment): TreeRange => {
    let end = comment.range[1]
    while (end < reading.text.length) {
      const character = reading.text.charAt(end)
      if (!preheader && (character === "\r" || character === "\n")) break
      if (
        !isWhitespace(reading.text.charCodeAt(end)) &&
        !(preheader && reading.written.isLeftOut(end))
      )
        break
      end++
    }
    return [comment.range[0], end]
  })
  if (preceding?.type.endsWith("IgnoredText"))
    omitted.push(...consumedLineFeed(reading, preceding))
  return reading.converted.of([from, to], omitted)
}

/** A gap has no unreadable characters, and can optionally contain visible newlines. */
export function checkGap(
  reading: Reading,
  node: CheckedNode,
  from: number,
  to: number,
  newline: boolean,
  preceding: CheckedNode | null = null,
  preheader = false,
): string {
  const value = gap(reading, from, to, preceding, preheader)
  reading.problems.expect(
    from <= to &&
      [...value].every(
        (character) => horizontal(character) || (newline && character === "\n"),
      ),
    label(node),
    `the gap is not ${newline ? "ASCII whitespace and LF" : "hidden ASCII whitespace"}: ${JSON.stringify(value)}`,
  )
  return value
}

/** The hidden forms assigned to one gap must precede its next visible unit, without visible LF. */
export function checkHiddenGap(
  reading: Reading,
  node: CheckedNode,
  field: string,
  from: number,
  to: number,
  newline = false,
  preheader = false,
): void {
  let end = from
  let previous: CheckedNode | null = null
  for (const hidden of entriesOf(node, field)) {
    if (hidden === null) continue
    checkGap(reading, node, end, hidden.range[0], newline, previous, preheader)
    end = hidden.range[1]
    previous = hidden
  }
  checkGap(reading, node, end, to, newline, previous, preheader)
}

/** After detection, native comments lose to a hidden directive and cannot start inside a string or composite block. */
export function checkNativeComments(reading: Reading, headerEnd: number): void {
  const enclosed: TreeRange[] = []
  walkNodes(reading.root, (node) => {
    if (node.type === "StringLiteral") enclosed.push(node.range)
    if (node.type.endsWith("AccDescrBlockStatement")) {
      const close = ownOf(reading.root, node).tokens.find(
        (token) => token.value === "}",
      )
      if (close !== undefined) enclosed.push([node.range[0], close.range[1]])
    }
  })
  for (const comment of reading.root.comments) {
    const at = comment.range[0]
    if (at < headerEnd || reading.written.isLeftOut(at)) continue
    reading.problems.expect(
      !enclosed.some(([from, to]) => from <= at && at < to),
      label(comment),
      "a native Comment cannot start inside a STRING or composite description block",
    )
    reading.problems.expect(
      directiveEnd(following(reading, at)) === undefined,
      label(comment),
      "the earlier hidden DIRECTIVE rule matches at this native Comment",
    )
  }
}

/** The ignored node covers one whole hidden match, excluding its consumed final LF. */
export function checkIgnored(reading: Reading, node: CheckedNode): void {
  const value = reading.converted.of(node.range)
  const suffix = following(reading, node.range[1])
  const end =
    textOf(node, "kind") === "yaml-block"
      ? yamlEnd(value + suffix)
      : directiveEnd(value + suffix)
  reading.problems.expect(
    value.length > 0 && end === value.length,
    label(node),
    "the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
  )
  checkTokenKinds(reading, node, ["RawText"], "a hidden form")
}

/** Quoted strings end at their matching closer; escapes cannot cross a line terminator. */
export function stringSpelling(value: string): boolean {
  const quote = value.charAt(0)
  if (quote !== "'" && quote !== '"') return false
  for (let at = 1; at < value.length; at++) {
    const character = value.charAt(at)
    if (character === quote) return at === value.length - 1
    if (character !== "\\") continue
    const escaped = value.charAt(++at)
    if (
      escaped === "" ||
      escaped === "\n" ||
      escaped === "\r" ||
      escaped === "\u2028" ||
      escaped === "\u2029"
    )
      return false
  }
  return false
}

/** A common statement's value fills its composite lexical form, before any hidden trailing forms. */
export function checkCommon(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const block = node.type.endsWith("AccDescrBlockStatement")
  const title =
    node.type.endsWith("TitleStatement") &&
    !node.type.endsWith("AccTitleStatement")
  const word = title
    ? "title"
    : node.type.endsWith("AccTitleStatement")
      ? "accTitle"
      : "accDescr"
  const expected = block ? `${word}{}` : title ? word : `${word}:`
  reading.problems.expectEqual(
    own.text,
    expected,
    label(node),
    "the common statement's fixed components",
  )
  const keyword = own.tokens[0]
  if (keyword === undefined) return
  const value = childOf(node, "value")
  const after = entriesOf(node, "textAfter").filter((entry) => entry !== null)
  const contentEnd = after[0]?.range[0] ?? node.range[1]
  const whole = reading.converted.of([
    keyword.range[0],
    reading.text.length + 1,
  ])
  let start = word.length
  let end: number
  if (block) {
    while (isWhitespace(whole.charCodeAt(start))) start++
    reading.problems.expect(
      whole.charAt(start) === "{",
      label(node),
      "the block opener must follow common whitespace",
    )
    const close = whole.indexOf("}", start + 1)
    reading.problems.expect(
      close !== -1,
      label(node),
      "the description block is not closed",
    )
    start++
    end = close === -1 ? whole.length : close
    while (start < end && isWhitespace(whole.charCodeAt(start))) start++
    while (end > start && isWhitespace(whole.charCodeAt(end - 1))) end--
  } else {
    if (title) {
      if (horizontal(whole.charAt(start))) start++
    } else {
      start = afterHorizontal(whole, start)
      reading.problems.expect(
        whole.charAt(start) === ":",
        label(node),
        "the colon gap must be ASCII space/tab",
      )
      start++
    }
    end = start
    // Without title's one separator the bare keyword has no value.
    if (!title || start > word.length) {
      while (
        end < whole.length &&
        whole.charAt(end) !== "\n" &&
        !whole.startsWith("%%", end)
      )
        end++
    }
  }
  const expectedValue = whole.slice(start, end)
  reading.problems.expect(
    expectedValue === ""
      ? value === null
      : value !== null && reading.converted.of(value.range) === expectedValue,
    label(node),
    "the common value is not the complete composite lexical value (or null when empty)",
  )
  if (value !== null) {
    reading.problems.expect(
      textOf(value) !== "" &&
        (!block || trimmed(textOf(value)) === textOf(value)),
      label(value),
      "a common literal must be nonempty, with a block interior trimmed",
    )
  }
  const mark = block
    ? own.tokens.at(-1)
    : title
      ? keyword
      : own.tokens.find((token) => token.value === ":")
  const lexicalEnd = block
    ? mark?.range[1]
    : (value?.range[1] ?? mark?.range[1])
  if (lexicalEnd !== undefined)
    checkHiddenGap(reading, node, "textAfter", lexicalEnd, node.range[1])
  reading.problems.expect(
    contentEnd >= (value?.range[1] ?? keyword.range[1]),
    label(node),
    "hidden trailing text precedes the common value",
  )
}

/** After a completed statement a visible LF must survive all trailing hidden forms, unless only EOF follows. */
export function checkEnd(
  reading: Reading,
  statement: CheckedNode,
  next: number,
): void {
  const after = entriesOf(statement, "textAfter")
  const previous = after.at(-1) ?? null
  const value = checkGap(
    reading,
    statement,
    statement.range[1],
    next,
    true,
    previous,
  )
  if (next < reading.text.length)
    reading.problems.expect(
      value.includes("\n"),
      label(statement),
      "a following statement requires visible EOL; a hidden form consumed the only LF",
    )
}

/** Detection passes at most one common-frontmatter-shaped block before bare lines and its second directive scan. */
export function checkPreheader(reading: Reading, node: CheckedNode): void {
  const forms = entriesOf(node, "textBeforeHeader").filter(
    (form) => form !== null,
  )
  let yamlSeen = false
  for (const [index, form] of forms.entries()) {
    const value = reading.converted.of(form.range)
    if (form.kind === "yaml-block") {
      reading.problems.expect(
        !yamlSeen && index === 0,
        label(form),
        "detection passes only one retained YAML block, before second-scan directives",
      )
      yamlSeen = true
      const openingLF = value.indexOf("\n")
      const closingStart = value.length - 3
      const bodyLF = value.indexOf("\n", openingLF + 1)
      const tail = following(reading, form.range[1])
      reading.problems.expect(
        openingLF !== -1 &&
          bodyLF !== -1 &&
          bodyLF < closingStart &&
          tail.charAt(afterHorizontal(tail, 0)) === "\n",
        label(form),
        "a pre-header YAML block requires a body line and a closing fence alone on its line",
      )
      reading.problems.expect(
        !reading.root.comments.some(
          (comment) =>
            comment.range[0] < form.range[0] &&
            comment.range[0] >= (reading.root.frontmatter?.range[1] ?? 0) &&
            !reading.written.isLeftOut(comment.range[0]),
        ),
        label(form),
        "a native bare percent line before YAML prevents detection from skipping it",
      )
    } else {
      let at = 3
      while (isWhitespace(value.charCodeAt(at))) at++
      reading.problems.expect(
        isWordCharacter(value.charCodeAt(at)),
        label(form),
        "a pre-header hidden directive must be found by the second word-type scan; bare percent forms are Comments",
      )
    }
  }
}

/** A common value or hidden lexical unit fragments only where common source trivia cuts it. */
export function checkRawUnit(reading: Reading, node: CheckedNode): void {
  const tokens = nodeTokensIn(reading.root, node.range)
  for (const [index, token] of tokens.entries()) {
    const next = tokens[index + 1]
    if (next === undefined) continue
    let cut = false
    for (let at = token.range[1]; at < next.range[0]; at++)
      if (reading.written.isLeftOut(at)) cut = true
    reading.problems.expect(
      cut,
      label(node),
      "one RawText lexical unit can fragment only at common source trivia",
    )
  }
}
