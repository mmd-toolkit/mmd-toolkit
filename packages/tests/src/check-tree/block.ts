import { isWhitespace, isWordCharacter } from "../db-from-tree/characters.ts"
import { withAttributeQuotesRead } from "../db-from-tree/converted-text.ts"
import { trimmed } from "../db-from-tree/values.ts"
import { checkChildTypes, checkListsWithAnEntry } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  between,
  checkLayout,
  checkOwnKinds,
  checkRangeIsHull,
  childOf,
  entriesOf,
  isBlank,
  ownOf,
  presentChildren,
  readingOf,
  textOf,
} from "./statement-checks.ts"
import type { Own, Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

/** ast/block.md: the alternatives of BlockStatement. */
const STATEMENTS: readonly string[] = [
  "BlockNodeStatement",
  "BlockSpaceStatement",
  "BlockColumnsStatement",
  "BlockCompositeStatement",
  "BlockClassDefStatement",
  "BlockClassStatement",
  "BlockStyleStatement",
  "BlockAccDescrBlockStatement",
]

/** ast/block.md: the Type column of each child field, in visit order. */
export const BLOCK_CHILD_TYPES: FieldTable<readonly string[]> = {
  BlockDiagram: { body: STATEMENTS },
  BlockNodeStatement: {
    node: ["BlockNode"],
    width: ["NumericLiteral"],
    links: ["BlockLink"],
  },
  BlockNode: { id: ["Identifier"], shape: ["BlockShape", "BlockArrowShape"] },
  BlockShape: { label: ["StringLiteral"] },
  BlockArrowShape: { label: ["StringLiteral"], directions: ["BlockLiteral"] },
  BlockLink: {
    opening: ["BlockOpeningArrow"],
    label: ["StringLiteral"],
    arrow: ["BlockArrow"],
    target: ["BlockNode"],
  },
  BlockSpaceStatement: { width: ["NumericLiteral"] },
  BlockColumnsStatement: { count: ["NumericLiteral"] },
  BlockCompositeStatement: { head: ["BlockNodeStatement"], body: STATEMENTS },
  BlockClassDefStatement: { name: ["Identifier"], styles: ["BlockLiteral"] },
  BlockClassStatement: { ids: ["BlockLiteral"], cssClass: ["BlockLiteral"] },
  BlockStyleStatement: { id: ["Identifier"], styles: ["BlockLiteral"] },
}

/** diagrams/block.md, Shapes: every opening and closing is independent. */
export const BLOCK_SHAPE_OPENINGS: readonly string[] = [
  "-)",
  "(-",
  "))",
  ")",
  "(((",
  "((",
  "{{",
  "{",
  ">",
  "([",
  "(",
  "[[",
  "[|",
  "[(",
  "[\\",
  "[/",
  "[",
]
export const BLOCK_SHAPE_CLOSINGS: readonly string[] = [
  "(((",
  ")))",
  "))",
  "}}",
  "}",
  "(-",
  "-)",
  "((",
  "]]",
  "(",
  "])",
  "\\]",
  "/]",
  ")]",
  ")",
  "]>",
  "]",
]

/** ast/block.md, BlockArrowShape: the words of the directions. */
export const BLOCK_DIRECTIONS: readonly string[] = [
  "right",
  "left",
  "up",
  "down",
  "x",
  "y",
]

/** parser/docs/tokens/block.md: arrows are checked with their nodes. */
export const BLOCK_PUNCTUATORS: readonly string[] = [
  ...BLOCK_SHAPE_OPENINGS,
  ...BLOCK_SHAPE_CLOSINGS,
  "<[",
  "]>",
  "(",
  ")",
  ",",
  ":",
  "{",
  "}",
]

/** ast/block.md: lists that always contain an entry, null styles included. */
const NONEMPTY_LISTS: Readonly<Record<string, readonly string[]>> = {
  BlockDiagram: ["body"],
  BlockCompositeStatement: ["body"],
  BlockClassDefStatement: ["styles"],
  BlockStyleStatement: ["styles"],
  BlockClassStatement: ["ids"],
}

/** A node's own tokens and children have this layout and hull. Keywords retain their case in block. */
function layout(
  reading: Reading,
  node: CheckedNode,
  expected: readonly string[],
  own: Own = ownOf(reading.root, node),
): void {
  checkOwnKinds(reading, node, own, BLOCK_PUNCTUATORS)
  checkLayout(reading, node, own, expected, (token) => token.value)
  checkRangeIsHull(reading, node, own)
}

/** A comma-separated list, retaining a slot but no child for a null style. */
function listLayout(node: CheckedNode, field: string): string[] {
  return entriesOf(node, field).flatMap((entry, index) => [
    ...(index === 0 ? [] : [","]),
    ...(entry === null ? [] : [CHILD]),
  ])
}

/** diagrams/block.md: whitespace between parts, optionally required or restricted to one line. */
function gap(
  reading: Reading,
  node: CheckedNode,
  from: number,
  to: number,
  required = false,
  sameLine = false,
): void {
  const written = between(reading, from, to)
  reading.problems.expect(
    isBlank(written) &&
      (!required || written !== "") &&
      (!sameLine || (!written.includes("\r") && !written.includes("\n"))),
    label(node),
    `the gap ${JSON.stringify(written)} is not ${required ? "nonempty " : ""}${sameLine ? "same-line " : ""}whitespace`,
  )
}

/** Whether nothing of the written text lies between `from` and `to`: a directive between two units leaves them touching (diagrams/block.md, Directives inside units). */
function touches(reading: Reading, from: number, to: number): boolean {
  return between(reading, from, to) === ""
}

/** diagrams/block.md, Shapes: delimiters touch the string, while mixed pairs are valid. */
function checkShape(reading: Reading, node: CheckedNode): void {
  const open = textOf(node, "open")
  const close = textOf(node, "close")
  reading.problems.expect(
    BLOCK_SHAPE_OPENINGS.includes(open),
    label(node),
    `the shape opening ${JSON.stringify(open)} is unknown`,
  )
  reading.problems.expect(
    BLOCK_SHAPE_CLOSINGS.includes(close),
    label(node),
    `the shape closing ${JSON.stringify(close)} is unknown`,
  )
  layout(reading, node, [open, CHILD, close])
  const value = childOf(node, "label")
  const tokens = ownOf(reading.root, node).tokens
  if (value === null || tokens.length !== 2) return
  reading.problems.expect(
    touches(reading, tokens[0].range[1], value.range[0]) &&
      touches(reading, value.range[1], tokens[1].range[0]),
    label(node),
    "the shape has whitespace inside its delimiters",
  )
}

/**
 * ast/block.md, BlockArrowShape: a direction is a BlockLiteral of its word and
 * the whitespace written with it, after it, and, where no `,` stands before the
 * first, after the `(`; the tokens are the `RawText` tokens of that whitespace
 * (which a directive or a comment line cuts) and the `Keyword` token of the
 * word. A `,` and the whitespace after it belong to no direction.
 */
function checkDirection(
  reading: Reading,
  node: CheckedNode,
  direction: CheckedNode,
  leading: boolean,
): void {
  const tokens = nodeTokensIn(reading.root, direction.range)
  const wordIndex = tokens.findIndex((token) => token.type === "Keyword")
  const word = tokens[wordIndex]
  reading.problems.expect(
    word !== undefined &&
      tokens.every(
        (token, index) =>
          index === wordIndex ||
          (token.type === "RawText" && isBlank(token.value)),
      ),
    label(direction),
    "the tokens of a direction are the Keyword token of its word and the RawText tokens of whitespace",
  )
  reading.problems.expect(
    word !== undefined && BLOCK_DIRECTIONS.includes(word.value),
    label(node),
    "the directions include an unknown direction",
  )
  reading.problems.expect(
    leading || wordIndex <= 0,
    label(direction),
    "a direction has whitespace before its word, where a comma or another direction stands before it",
  )
}

/** diagrams/block.md, Block arrows: the directions with the optional commas before them. */
function checkBlockArrow(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const value = childOf(node, "label")
  const directions = entriesOf(node, "directions")
  reading.problems.expect(
    directions.length > 0 && directions.every((entry) => entry !== null),
    label(node),
    "the list directions is empty",
  )
  const open = own.tokens.find((token) => token.value === "(")
  const close = own.tokens.at(-1)
  const commas = own.tokens.filter((token) => token.value === ",")
  // The directions and the commas, in source order.
  const parts: { text: string; node: { range: readonly [number, number] } }[] =
    [
      ...directions.flatMap((direction) =>
        direction === null ? [] : [{ text: CHILD, node: direction }],
      ),
      ...commas.map((comma) => ({ text: ",", node: comma })),
    ].sort((a, b) => a.node.range[0] - b.node.range[0])
  reading.problems.expect(
    parts.length > 0 &&
      parts.at(-1)?.text !== "," &&
      parts.every(
        (part, index) => part.text !== "," || parts[index + 1]?.text !== ",",
      ),
    label(node),
    "a direction list has no final comma or consecutive commas",
  )
  layout(reading, node, [
    "<[",
    CHILD,
    "]>",
    "(",
    ...parts.map((part) => part.text),
    ")",
  ])
  if (open !== undefined && close !== undefined) {
    // A direction follows its predecessor without a gap, and a comma follows a
    // direction without a gap; the whitespace after a comma is in no token.
    let previous: { text: string; range: readonly [number, number] } = {
      text: "(",
      range: open.range,
    }
    for (const [index, part] of parts.entries()) {
      const written = between(reading, previous.range[1], part.node.range[0])
      // A direction touches what stands before it unless that is a comma, and
      // a comma touches only a direction before it.
      const touching =
        part.text === CHILD ? previous.text !== "," : previous.text === CHILD
      reading.problems.expect(
        touching ? written === "" : isBlank(written),
        label(node),
        "the gap between a direction or a comma and what stands before it",
      )
      const direction = directions.find((entry) => entry === part.node)
      if (direction !== undefined && direction !== null) {
        checkDirection(reading, node, direction, index === 0)
      }
      previous = { text: part.text, range: part.node.range }
    }
    reading.problems.expect(
      previous.text === CHILD
        ? touches(reading, previous.range[1], close.range[0])
        : true,
      label(node),
      "a direction does not end at the closing parenthesis",
    )
  }
  const tokens = own.tokens
  reading.problems.expect(
    tokens[0] !== undefined &&
      tokens[1] !== undefined &&
      value !== null &&
      touches(reading, tokens[0].range[1], value.range[0]) &&
      touches(reading, value.range[1], tokens[1].range[0]),
    label(node),
    "the block arrow has whitespace inside its brackets",
  )
}

/** ast/block.md, arrows: the characters determine the markers, line, and length, independently for the two arrows. */
function checkArrow(reading: Reading, node: CheckedNode): void {
  const written = textOf(node)
  const opening = node.type === "BlockOpeningArrow"
  const body = written.startsWith("<") ? written.slice(1) : written
  const valid = opening
    ? /^(?:--|==|-\.)$/u.test(body)
    : /^(?:-{2,}[->ox]|={2,}[=>ox]|-?\.+-[>ox]?)$/u.test(body)
  reading.problems.expect(
    valid,
    label(node),
    `the arrow ${JSON.stringify(written)} is not an ${opening ? "opening arrow" : "arrow"}`,
  )
  const line = body.includes(".")
    ? "dotted"
    : body.startsWith("=")
      ? "thick"
      : "solid"
  reading.problems.expectEqual(
    node.startMarker,
    written.startsWith("<") ? "arrow" : "none",
    label(node),
    "the startMarker of the arrow",
  )
  reading.problems.expectEqual(
    node.line,
    line,
    label(node),
    "the line of the arrow",
  )
  if (!opening) {
    const end = body.at(-1)
    const marker =
      end === ">"
        ? "arrow"
        : end === "x"
          ? "cross"
          : end === "o"
            ? "circle"
            : "none"
    const character = line === "dotted" ? "." : line === "thick" ? "=" : "-"
    reading.problems.expectEqual(
      node.endMarker,
      marker,
      label(node),
      "the endMarker of the arrow",
    )
    reading.problems.expectEqual(
      node.length,
      [...body].filter((part) => part === character).length,
      label(node),
      "the length of the arrow",
    )
  }
  reading.problems.expectEqual(
    nodeTokensIn(reading.root, node.range).map((token) => [
      token.type,
      token.range,
    ]),
    [["Punctuator", node.range]],
    label(node),
    "the tokens of the arrow",
  )
}

/** The literals of a rest-of-line statement: commas give slots, whitespace-only slots are null. */
function checkLine(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const keyword = own.tokens[0]
  const classStatement = node.type === "BlockClassStatement"
  const first = classStatement
    ? entriesOf(node, "ids")[0]
    : childOf(node, node.type === "BlockClassDefStatement" ? "name" : "id")
  if (keyword === undefined || first === null || first === undefined) return
  gap(reading, node, keyword.range[1], first.range[0], true)
  const ids = classStatement ? entriesOf(node, "ids") : [first]
  for (const [index, id] of ids.entries()) {
    if (id === null) continue
    if (classStatement) {
      // ast/block.md, BlockClassStatement: an id after a `,` holds the
      // whitespace after it, and the id before it holds none.
      const value = textOf(id)
      const word = value.slice(leadingWhitespaceOf(value))
      const whitespace = value.slice(0, value.length - word.length)
      reading.problems.expect(
        (index > 0 || whitespace === "") &&
          word !== "" &&
          [...word].every((c) => isWordCharacter(c.charCodeAt(0))),
        label(id),
        "the class id is not a word, or has whitespace before it where no comma stands before",
      )
      continue
    }
    const name = textOf(id, "name")
    const parts = node.type === "BlockStyleStatement" ? name.split(",") : [name]
    reading.problems.expect(
      parts.every(
        (part) =>
          part !== "" &&
          [...part].every((c) => isWordCharacter(c.charCodeAt(0))),
      ),
      label(id),
      "the style id or the class name is not made of word characters and its allowed commas",
    )
  }
  if (node.type === "BlockClassDefStatement")
    reading.problems.expect(
      textOf(first, "name") !== "DEFAULT",
      label(first),
      "DEFAULT is not a classDef name",
    )
  if (classStatement) {
    const last = ids.at(-1)
    const cssClass = childOf(node, "cssClass")
    layout(reading, node, [
      "class",
      ...listLayout(node, "ids"),
      ...presentChildren(node, "cssClass"),
    ])
    const commas = own.tokens.filter((token) => token.value === ",")
    for (const [index, comma] of commas.entries()) {
      const before = ids[index]
      const after = ids[index + 1]
      reading.problems.expect(
        before !== null &&
          before !== undefined &&
          touches(reading, before.range[1], comma.range[0]),
        label(node),
        "a class-id comma does not touch the id before it",
      )
      reading.problems.expect(
        after !== null &&
          after !== undefined &&
          touches(reading, comma.range[1], after.range[0]),
        label(node),
        "the id after a class-id comma does not start at the comma's end",
      )
    }
    if (last !== null && last !== undefined) {
      const end = cssClass?.range[0] ?? node.range[1]
      gap(reading, node, last.range[1], end, false, true)
    }
    if (cssClass !== null)
      reading.problems.expect(
        textOf(cssClass) !== "" &&
          trimmed(textOf(cssClass)) === textOf(cssClass) &&
          !textOf(cssClass).includes("\n") &&
          !textOf(cssClass).includes("\r"),
        label(cssClass),
        "the class name is empty, has whitespace at its ends, or spans lines",
      )
    return
  }
  const styles = entriesOf(node, "styles")
  layout(reading, node, [
    node.type === "BlockClassDefStatement" ? "classDef" : "style",
    CHILD,
    ...listLayout(node, "styles"),
  ])
  const commas = own.tokens.filter((token) => token.value === ",")
  for (const [index, style] of styles.entries()) {
    checkStyle(reading, node, {
      style,
      index,
      last: index === styles.length - 1,
      after: index === 0 ? first.range[1] : commas[index - 1]?.range[1],
      before: commas[index]?.range[0] ?? node.range[1],
    })
  }
}

/** A style slot of a `classDef` or `style` statement, with the places where the commas, or the name or the id, leave room for it. */
interface StyleSlot {
  readonly style: CheckedNode | null
  readonly index: number
  readonly last: boolean
  /** The end of the id, or of the `,` before the slot. */
  readonly after: number | undefined
  /** The start of the `,` after the slot, or the end of the statement. */
  readonly before: number
}

/**
 * ast/block.md, BlockLiteral: the styles are the parts between the `,` of the
 * rest of the line without the whitespace at its ends. A style keeps the
 * whitespace that lies between it and a `,`, so the first starts at its first
 * character that is not whitespace and the last ends at its last such
 * character; a part that is all whitespace between two `,` is a literal of
 * that whitespace; a part with nothing in it is null.
 */
function checkStyle(
  reading: Reading,
  node: CheckedNode,
  { style, index, last, after, before }: StyleSlot,
): void {
  if (after === undefined) return
  const classDef = node.type === "BlockClassDefStatement"
  const leading = classDef && index === 0
  const sameLine = !classDef || index > 0
  if (style === null) {
    // Nothing between two `,`; before the first and after the last `,` only
    // the whitespace that the rest of the line leaves out.
    const written = between(reading, after, before)
    reading.problems.expect(
      index === 0 || last ? isBlank(written) : written === "",
      label(node),
      `the style ${index} is null but its part has text`,
    )
    gap(reading, node, after, before, leading, sameLine)
    return
  }
  const value = textOf(style)
  reading.problems.expect(
    (index === 0
      ? isBlank(between(reading, after, style.range[0]))
      : touches(reading, after, style.range[0])) &&
      touches(reading, style.range[1], before),
    label(style),
    "the style does not start after the whitespace or the comma before it, or does not end at the comma after it",
  )
  reading.problems.expect(
    (index > 0 && !last) ||
      (value !== "" &&
        !isBlank(value) &&
        (index > 0 || leadingWhitespaceOf(value) === 0) &&
        (!last || !isWhitespace(value.charCodeAt(value.length - 1)))),
    label(style),
    "the first style starts with whitespace, the last ends with whitespace, or one of them is blank",
  )
  reading.problems.expect(
    !value.includes("\n") && !value.includes("\r"),
    label(style),
    "the style spans lines",
  )
  if (index === 0) {
    gap(reading, node, after, style.range[0], leading, sameLine)
  }
}

/** The number of whitespace characters at the start of `text`. */
function leadingWhitespaceOf(text: string): number {
  let count = 0
  while (count < text.length && isWhitespace(text.charCodeAt(count))) count++
  return count
}

/** Checks block-specific fields, values, layout, and leaf token kinds. */
export function checkBlockTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node, parent) => {
    checkChildTypes(reading, node, BLOCK_CHILD_TYPES)
    checkListsWithAnEntry(reading, node, NONEMPTY_LISTS)
    switch (node.type) {
      case "BlockDiagram":
      case "BlockCompositeStatement": {
        const composite = node.type === "BlockCompositeStatement"
        const head = childOf(node, "head")
        const first = ownOf(root, node).tokens[0]?.value ?? ""
        const headers =
          composite && head !== null ? ["block:"] : ["block", "block-beta"]
        problems.expect(
          headers.includes(first),
          label(node),
          "the header does not agree with the head",
        )
        layout(reading, node, [
          first,
          ...presentChildren(node, "head"),
          ...entriesOf(node, "body").map(() => CHILD),
          ...(composite ? ["end"] : []),
        ])
        problems.expect(
          entriesOf(node, "body").some(
            (statement) =>
              statement !== null &&
              statement.type !== "BlockAccDescrBlockStatement",
          ),
          label(node),
          "the body has no statement other than empty description blocks",
        )
        break
      }
      case "BlockNodeStatement": {
        layout(reading, node, [
          CHILD,
          ...(childOf(node, "width") === null ? [] : [":", CHILD]),
          ...entriesOf(node, "links").map(() => CHILD),
        ])
        const width = childOf(node, "width")
        if (width !== null) {
          const colon = ownOf(root, node).tokens[0]
          problems.expect(
            colon !== undefined &&
              touches(reading, colon.range[1], width.range[0]),
            label(node),
            "the width does not touch its colon",
          )
        }
        break
      }
      case "BlockNode":
        layout(reading, node, [CHILD, ...presentChildren(node, "shape")])
        break
      case "BlockShape":
        checkShape(reading, node)
        break
      case "BlockArrowShape":
        checkBlockArrow(reading, node)
        break
      case "BlockLink":
        problems.expect(
          (childOf(node, "opening") === null) ===
            (childOf(node, "label") === null),
          label(node),
          "opening and label must both be present or both be null",
        )
        layout(reading, node, [
          ...presentChildren(node, "opening", "label"),
          CHILD,
          CHILD,
        ])
        break
      case "BlockArrow":
      case "BlockOpeningArrow":
        checkArrow(reading, node)
        break
      case "BlockSpaceStatement": {
        const width = childOf(node, "width")
        layout(reading, node, width === null ? ["space"] : ["space:", CHILD])
        if (width !== null) {
          const keyword = ownOf(root, node).tokens[0]
          problems.expect(
            keyword !== undefined &&
              touches(reading, keyword.range[1], width.range[0]),
            label(node),
            "the space width does not touch space:",
          )
        }
        break
      }
      case "BlockColumnsStatement": {
        const count = childOf(node, "count")
        layout(
          reading,
          node,
          count === null ? ["columns", "auto"] : ["columns", CHILD],
        )
        const first = ownOf(root, node).tokens[0]
        const next = count ?? ownOf(root, node).tokens[1]
        if (first !== undefined && next !== undefined)
          gap(reading, node, first.range[1], next.range[0], true)
        break
      }
      case "BlockClassDefStatement":
      case "BlockClassStatement":
      case "BlockStyleStatement":
        checkLine(reading, node)
        break
      case "BlockAccDescrBlockStatement":
        layout(reading, node, ["accDescr", "{", "}"])
        break
      case "StringLiteral": {
        const written = withAttributeQuotesRead(reading.written.of(node.range))
        problems.expect(
          node.closed === true &&
            written.startsWith('"') &&
            written.endsWith('"') &&
            written.length > 2 &&
            !written.startsWith('"`') &&
            !written.slice(1, -1).includes('"'),
          label(node),
          "the label is not a closed nonempty string without markdown or inner quotes",
        )
        break
      }
      case "NumericLiteral":
        problems.expect(
          /^\d+$/u.test(reading.written.of(node.range)),
          label(node),
          "the width or count is not decimal digits",
        )
        break
      case "Identifier":
        if (parent?.type === "BlockNode")
          problems.expect(
            textOf(node, "name") !== "" &&
              [...withAttributeQuotesRead(textOf(node, "name"))].every(
                (c) =>
                  !isWhitespace(c.charCodeAt(0)) && !"([-){}<>:=".includes(c),
              ),
            label(node),
            "the node id is empty or holds a character that ends an id",
          )
        break
      default:
        break
    }
    if (["Identifier", "NumericLiteral", "BlockLiteral"].includes(node.type)) {
      const tokens = nodeTokensIn(root, node.range)
      const kind =
        node.type === "Identifier"
          ? "Identifier"
          : node.type === "NumericLiteral"
            ? "Numeric"
            : "RawText"
      // parser/docs/tokens/block.md: an id of `class` is the `RawText` tokens
      // of the whitespace after the `,` before it, and the `Identifier` token
      // of its word.
      const classId =
        node.type === "BlockLiteral" &&
        parent?.type === "BlockClassStatement" &&
        entriesOf(parent, "ids").includes(node)
      // The tokens of a direction are held to their kinds by checkBlockArrow().
      const direction =
        node.type === "BlockLiteral" &&
        parent?.type === "BlockArrowShape" &&
        entriesOf(parent, "directions").includes(node)
      problems.expect(
        direction ||
          (tokens.length > 0 &&
            tokens.every(
              (token, index) =>
                token.type ===
                (classId && index === tokens.length - 1 ? "Identifier" : kind),
            )),
        label(node),
        classId
          ? "the tokens of the id are not RawText tokens and the Identifier token of its word"
          : `the tokens of the value are not ${kind}`,
      )
      if (classId) {
        // The Identifier token is the word only, and the RawText tokens are
        // the whitespace before it.
        const value = textOf(node)
        const prefix = leadingWhitespaceOf(value)
        problems.expectEqual(
          [
            tokens
              .slice(0, -1)
              .map((token) => token.value)
              .join(""),
            tokens.at(-1)?.value,
          ],
          [value.slice(0, prefix), value.slice(prefix)],
          label(node),
          "the whitespace and the word of an id of class, in its RawText tokens and its Identifier token",
        )
      }
      problems.expectEqual(
        node.range,
        [tokens[0]?.range[0], tokens.at(-1)?.range[1]],
        label(node),
        "the range of the value from its first token to its last",
      )
      if (node.type === "BlockLiteral") {
        for (const [index, token] of tokens.entries()) {
          const next = tokens[index + 1]
          if (token.type !== "RawText" || next?.type !== "RawText") continue
          problems.expect(
            token.range[1] < next.range[0],
            label(node),
            "RawText tokens without a cut are one token",
          )
        }
      }
    }
  })
}
