import {
  isDigit,
  isWhitespace,
  isWordCharacter,
} from "../db-from-tree/characters.ts"
import {
  afterHorizontal,
  checkCommon,
  checkGap,
  checkStatementNode,
  following,
  gap,
  horizontal,
} from "./common-statement-checks.ts"
import { checkChildTypes } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  childOf,
  entriesOf,
  ownOf,
  readingOf,
  checkTokenKinds,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

const COMMON = [
  "TreemapTitleStatement",
  "TreemapAccTitleStatement",
  "TreemapAccDescrStatement",
  "TreemapAccDescrBlockStatement",
]
const ROWS = ["TreemapSection", "TreemapLeaf", "TreemapClassDefStatement"]

/** ast/treemap.md: all child fields, in visitor order; the body stays flat. */
export const TREEMAP_CHILD_TYPES: FieldTable<readonly string[]> = {
  TreemapDiagram: { body: [...ROWS, ...COMMON] },
  TreemapSection: { name: ["StringLiteral"], classSelector: ["Identifier"] },
  TreemapLeaf: {
    name: ["StringLiteral"],
    value: ["NumericLiteral"],
    classSelector: ["Identifier"],
  },
  TreemapClassDefStatement: { name: ["Identifier"], style: ["TreemapLiteral"] },
  TreemapTitleStatement: { value: ["TreemapLiteral"] },
  TreemapAccTitleStatement: { value: ["TreemapLiteral"] },
  TreemapAccDescrStatement: { value: ["TreemapLiteral"] },
  TreemapAccDescrBlockStatement: { value: ["TreemapLiteral"] },
}

/** The complete identifier at the start of text; class names use it inside their composite. */
function identifierEnd(text: string): number {
  if (!isWordCharacter(text.charCodeAt(0)) || isDigit(text.charCodeAt(0)))
    return 0
  let end = 1
  while (isWordCharacter(text.charCodeAt(end))) end++
  return end
}

/** Earlier common/header/class-definition alternatives at a selector position. */
function earlierIdentifier(text: string): boolean {
  if (text.startsWith("title") || text.startsWith("treemap")) return true
  if (text.startsWith("accTitle"))
    return text.charAt(afterHorizontal(text, 8)) === ":"
  if (text.startsWith("accDescr")) {
    if (text.charAt(afterHorizontal(text, 8)) === ":") return true
    let at = 8
    while (isWhitespace(text.charCodeAt(at))) at++
    if (text.charAt(at) === "{" && text.includes("}", at + 1)) return true
  }
  if (!text.startsWith("classDef") || !isWhitespace(text.charCodeAt(8)))
    return false
  let at = 8
  while (isWhitespace(text.charCodeAt(at))) at++
  return identifierEnd(text.slice(at)) >= 2
}

/** Shared leaves are whole units in treemap's first-applicable lexical order. */
function checkLeaf(
  reading: Reading,
  node: CheckedNode,
  classNames: ReadonlySet<CheckedNode>,
): void {
  const value = reading.converted.of(node.range)
  const rest = following(reading, node.range[0])
  if (node.type === "Identifier") {
    reading.problems.expect(
      identifierEnd(rest) === value.length &&
        value.length > 0 &&
        (classNames.has(node) ? value.length >= 2 : !earlierIdentifier(rest)),
      label(node),
      "the identifier is not a complete unit at its authored position",
    )
    checkTokenKinds(reading, node, ["Identifier"], "an identifier")
  } else if (node.type === "NumericLiteral") {
    let end = 0
    while (
      end < rest.length &&
      (isDigit(rest.charCodeAt(end)) || "_.,".includes(rest.charAt(end)))
    )
      end++
    reading.problems.expect(
      value.length > 0 &&
        end === value.length &&
        (isDigit(value.charCodeAt(0)) || value.startsWith(".")),
      label(node),
      "the number is not a complete digit/dot-led numeric unit",
    )
    checkTokenKinds(reading, node, ["Numeric"], "a treemap number")
  } else if (node.type === "StringLiteral") {
    const quote = value.charAt(0)
    reading.problems.expect(
      node.closed === true &&
        (quote === '"' || quote === "'") &&
        value.indexOf(quote, 1) === value.length - 1,
      label(node),
      "the string must end at the first matching quote, without escape decoding",
    )
  }
}

/** ASCII indentation is one unit; comments and line feeds can separate components. */
function indentationCount(
  reading: Reading,
  node: CheckedNode,
  value: string,
): number {
  let runs = 0
  let count = 0
  let inRun = false
  for (const character of value) {
    if (horizontal(character)) {
      if (!inRun) runs++
      inRun = true
      count++
    } else inRun = false
  }
  reading.problems.expect(
    runs <= 1,
    label(node),
    "the gap contains two separate indentation units",
  )
  return count
}

/** Rows retain authored punctuation and allow indentation only beside their separator. */
function checkRow(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const name = childOf(node, "name")
  const value = childOf(node, "value")
  const selector = childOf(node, "classSelector")
  const leaf = node.type === "TreemapLeaf"
  const expected = [
    ...(leaf ? [own.tokens[0]?.value ?? ""] : []),
    ...(selector === null ? [] : [":::"]),
  ]
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    expected,
    label(node),
    "the row's separator and selector components",
  )
  if (name === null) return
  let end = name.range[1]
  if (leaf) {
    const separator = own.tokens[0]
    reading.problems.expect(
      separator?.value === ":" || separator?.value === ",",
      label(node),
      "a leaf requires its authored colon or comma",
    )
    if (separator !== undefined && value !== null) {
      indentationCount(
        reading,
        node,
        checkGap(reading, node, end, separator.range[0], true),
      )
      indentationCount(
        reading,
        node,
        checkGap(reading, node, separator.range[1], value.range[0], true),
      )
      end = value.range[1]
    }
  }
  if (selector !== null) {
    const marker = own.tokens.at(-1)
    if (marker !== undefined) {
      for (const [from, to] of [
        [end, marker.range[0]],
        [marker.range[1], selector.range[0]],
      ] as const) {
        const spacing = checkGap(reading, node, from, to, true)
        reading.problems.expect(
          [...spacing].every((character) => character === "\n"),
          label(node),
          "a selector gap cannot contain indentation",
        )
      }
    }
  }
}

/** The class name and style fill the composite, including its maximal separator whitespace. */
function checkClass(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const keyword = own.tokens[0]
  const name = childOf(node, "name")
  const style = childOf(node, "style")
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    own.tokens.length === 2 ? ["classDef", ";"] : ["classDef"],
    label(node),
    "the class definition's fixed components",
  )
  if (keyword === undefined || name === null) return
  const before = reading.converted.of([keyword.range[1], name.range[0]])
  reading.problems.expect(
    before.length > 0 &&
      [...before].every((character) => isWhitespace(character.charCodeAt(0))),
    label(node),
    "classDef requires common whitespace before its name",
  )
  const rest = following(reading, name.range[1])
  let start = 0
  while (isWhitespace(rest.charCodeAt(start))) start++
  let end = start
  if (start > 0)
    while (
      end < rest.length &&
      rest.charAt(end) !== ";" &&
      rest.charAt(end) !== "\n"
    )
      end++
  const expected = rest.slice(start, end)
  reading.problems.expect(
    expected === ""
      ? style === null
      : style !== null && reading.converted.of(style.range) === expected,
    label(node),
    "the style must fill the complete whitespace-led class value, or be null when empty",
  )
  if (style !== null) {
    const separator = reading.converted.of([name.range[1], style.range[0]])
    reading.problems.expect(
      separator.length > 0 &&
        [...separator].every((character) =>
          isWhitespace(character.charCodeAt(0)),
        ) &&
        !isWhitespace(reading.converted.of(style.range).charCodeAt(0)),
      label(node),
      "the class style starts after maximal common whitespace",
    )
  }
  const semicolon = own.tokens[1]
  reading.problems.expect(
    (semicolon !== undefined) === (rest.charAt(end) === ";"),
    label(node),
    "the terminal class semicolon must be owned by its statement",
  )
  if (semicolon !== undefined) {
    const suffix = reading.converted.of([name.range[1], semicolon.range[0]])
    reading.problems.expect(
      suffix === rest.slice(0, end),
      label(node),
      "the class semicolon follows its complete composite value",
    )
  }
}

/** Native percent comments cannot start inside any earlier composite value. */
function checkComments(reading: Reading): void {
  const enclosed: CheckedNode[] = []
  walkNodes(reading.root, (node) => {
    if (
      node.type === "StringLiteral" ||
      node.type === "TreemapClassDefStatement" ||
      COMMON.includes(node.type)
    )
      enclosed.push(node)
  })
  for (const comment of reading.root.comments) {
    if (reading.written.isLeftOut(comment.range[0])) {
      reading.problems.expect(
        !reading.root.directives.some(
          (directive) =>
            directive.range[0] <= comment.range[0] &&
            comment.range[0] < directive.range[1],
        ),
        label(comment),
        "a native Comment cannot start inside a removed source Directive",
      )
      continue
    }
    reading.problems.expect(
      comment.mark === "%%" || comment.mark === null,
      label(comment),
      "a native treemap comment has mark %% or continues a cut comment",
    )
    reading.problems.expect(
      !enclosed.some(
        (node) =>
          node.range[0] <= comment.range[0] && comment.range[0] < node.range[1],
      ),
      label(comment),
      "a native Comment cannot start inside an earlier composite or string",
    )
    const value = reading.converted.of(comment.range)
    const remainder =
      gap(reading, comment.range[0], reading.text.length).split("\n")[0] ?? ""
    reading.problems.expect(
      (comment.mark === null || value.startsWith("%%")) &&
        [...remainder].every(horizontal),
      label(comment),
      "a native Comment must fill its percent-pair line",
    )
  }
}

/** Composite separators consumed beyond a null value are not new indentation. */
function afterConsumed(
  reading: Reading,
  previous: CheckedNode | null,
  value: string,
): string {
  if (
    previous?.type === "TreemapTitleStatement" &&
    childOf(previous, "value") === null &&
    horizontal(value.charAt(0))
  )
    return value.slice(1)
  if (
    previous?.type === "TreemapClassDefStatement" &&
    childOf(previous, "style") === null &&
    ownOf(reading.root, previous).tokens.length === 1
  ) {
    let at = 0
    while (isWhitespace(value.charCodeAt(at))) at++
    return value.slice(at)
  }
  return value
}

/** Flat body gaps keep consumed composite whitespace out of indentation. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const header = own.tokens[0]
  reading.problems.expect(
    own.tokens.length === 1 &&
      (header?.value === "treemap" || header?.value === "treemap-beta"),
    label(node),
    "the diagram owns exactly one complete treemap header",
  )
  if (header === undefined) return
  reading.problems.expect(
    !following(reading, header.range[0]).startsWith("treemap-beta") ||
      header.value === "treemap-beta",
    label(header),
    "the beta header must be one whole keyword",
  )
  const passedBare = reading.root.comments.some(
    (comment) =>
      comment.range[0] < header.range[0] &&
      !reading.written.isLeftOut(comment.range[0]) &&
      reading.converted.of(comment.range).trimEnd() === "%%",
  )
  const prefix = checkGap(
    reading,
    node,
    reading.root.frontmatter?.range[1] ?? 0,
    header.range[0],
    true,
    null,
    passedBare,
  )
  if (!passedBare)
    reading.problems.expect(
      [...prefix].every((character) => character === "\n"),
      label(node),
      "a pre-header gap without a passed bare line must contain only native LF",
    )
  let end = header.range[1]
  let previous: CheckedNode | null = null
  for (const item of entriesOf(node, "body")) {
    if (item === null) continue
    if (ROWS.includes(item.type)) {
      const value = checkGap(reading, item, end, item.range[0], true)
      const indent = indentationCount(
        reading,
        item,
        afterConsumed(reading, previous, value),
      )
      reading.problems.expect(
        Number.isInteger(item.indent) && item.indent === indent,
        label(item),
        "indent must equal the counted ASCII space/tab before the row",
      )
    } else {
      const value = afterConsumed(
        reading,
        previous,
        checkGap(reading, item, end, item.range[0], true),
      )
      // Only the horizontal padding directly before a common keyword belongs to that composite.
      let padding = value.length
      while (padding > 0 && horizontal(value.charAt(padding - 1))) padding--
      reading.problems.expect(
        [...value.slice(0, padding)].every((character) => character === "\n"),
        label(item),
        "a common statement cannot consume an earlier indentation unit",
      )
    }
    end = item.range[1]
    previous = item
  }
  const trailing = afterConsumed(
    reading,
    previous,
    gap(reading, end, reading.text.length),
  )
  reading.problems.expect(
    [...trailing].every((character) => character === "\n"),
    label(node),
    "the trailing gap contains an unused indentation unit or unreadable text",
  )
}

/** Tree conditions only; fixture result records check the parser's acceptance. */
export function checkTreemapTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  const classNames = new Set<CheckedNode>()
  walkNodes(root, (node) => {
    if (node.type === "TreemapClassDefStatement") {
      const name = childOf(node, "name")
      if (name !== null) classNames.add(name)
    }
  })
  checkComments(reading)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, TREEMAP_CHILD_TYPES)
    checkLeaf(reading, node, classNames)
    if (!node.type.startsWith("Treemap")) return
    checkStatementNode(reading, node, [":", ",", ":::", ";", "{", "}"])
    if (node.type === "TreemapDiagram") checkDiagram(reading, node)
    else if (node.type === "TreemapSection" || node.type === "TreemapLeaf")
      checkRow(reading, node)
    else if (node.type === "TreemapClassDefStatement") checkClass(reading, node)
    else if (COMMON.includes(node.type)) checkCommon(reading, node)
  })
}
