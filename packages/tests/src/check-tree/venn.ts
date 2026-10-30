import type { ConvertedText } from "../db-from-tree/converted-text.ts"
import { vennStyleAtomsOf } from "../db-from-tree/venn.ts"
import { isWhitespace } from "../db-from-tree/characters.ts"
import {
  checkChildTypes,
  checkFieldWords,
  checkListsWithAnEntry,
} from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  between,
  checkJoinedOwnText,
  checkLayout,
  checkOwnKinds,
  checkRangeIsHull,
  checkTextAfter,
  checkTokenKinds,
  childOf,
  entriesOf,
  ownOf,
  nextWrittenCharacter,
  presentChildren,
  readingOf,
  textOf,
} from "./statement-checks.ts"
import type { Own, Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { childNodesOf, walkNodes } from "./walk.ts"
import { diagramCommentRanges } from "./values.ts"

/** ast/venn.md: the alternatives of VennStatement. */
const STATEMENTS: readonly string[] = [
  "VennSubsetStatement",
  "VennTextStatement",
  "VennStyleStatement",
  "VennTitleStatement",
  "VennIgnoredText",
]
const NAMES: readonly string[] = ["Identifier", "StringLiteral"]

/** ast/venn.md: each child field's allowed types, in visit order. */
export const VENN_CHILD_TYPES: FieldTable<readonly string[]> = {
  VennDiagram: { body: STATEMENTS },
  VennSubsetStatement: {
    sets: NAMES,
    label: ["VennLabel"],
    size: ["NumericLiteral"],
  },
  VennTextStatement: {
    targets: NAMES,
    id: [...NAMES, "NumericLiteral"],
    label: ["VennLabel"],
  },
  VennStyleStatement: { targets: NAMES, properties: ["VennStyleProperty"] },
  VennStyleProperty: {
    key: ["Identifier"],
    value: ["StringLiteral", "VennLiteral"],
  },
  VennTitleStatement: { value: ["VennLiteral"] },
}

/** ast/venn.md: the two fixed kind fields. */
export const VENN_FIELD_WORDS: FieldTable<readonly string[]> = {
  VennSubsetStatement: { kind: ["set", "union"] },
  VennLabel: { kind: ["text", "string"] },
}

/** parser/docs/tokens/venn.md: commas, colons and label brackets. */
export const VENN_PUNCTUATORS: readonly string[] = [",", ":", "[", "]"]

const NONEMPTY_LISTS: Readonly<Record<string, readonly string[]>> = {
  VennSubsetStatement: ["sets"],
  VennStyleStatement: ["targets", "properties"],
}
const RESERVED: readonly string[] = [
  "venn-beta",
  "set",
  "union",
  "text",
  "style",
]

/** Bounded keyword rules precede identifiers, including before a hyphen. */
function startsReservedWord(text: string): boolean {
  return RESERVED.some(
    (word) =>
      text.toLowerCase().startsWith(word) &&
      !/\w/u.test(text.charAt(word.length)),
  )
}

/** Only ASCII space and tab separate units within a non-title statement. */
function horizontal(text: string): boolean {
  return [...text].every((character) => character === " " || character === "\t")
}

/** The layout of a comma-separated name or property list. */
function listLayout(length: number): string[] {
  return Array.from({ length }, (_, index) =>
    index === 0 ? [CHILD] : [",", CHILD],
  ).flat()
}

/** diagrams/venn.md: the statement list, ignored fragments, and implicit-text mode. */
function checkBody(reading: Reading, own: Own, converted: ConvertedText): void {
  const known = new Set<string>()
  const comments = diagramCommentRanges(
    reading.text,
    reading.root,
    reading.written,
  )
  const swallowed = reading.root.comments.flatMap(
    (comment): (readonly [number, number])[] => {
      if (comment.mark !== "%%" || reading.written.isLeftOut(comment.range[0]))
        return []
      let prefix = comment.range[0] - 1
      while (prefix >= 0 && reading.written.isLeftOut(prefix)) prefix--
      const code = reading.text.charCodeAt(prefix)
      return isWhitespace(code) ? [[prefix, prefix + 1]] : []
    },
  )

  /** Compare converted names without their one outer quote pair. */
  function nameOf(node: CheckedNode): string {
    const written = converted.of(node.range).trim()
    return node.type === "StringLiteral" ? written.slice(1, -1) : written
  }

  let previous = own.tokens[0]?.range[1] ?? reading.root.body.range[0]
  let enabled = false
  let lineStart = false
  let indentation = ""
  let modeStart = previous
  for (const node of entriesOf(reading.root.body, "body")) {
    if (node === null) continue
    const modeGap = converted.of([modeStart, node.range[0]])
    for (let at = 0; at < modeGap.length;) {
      const character = modeGap.charAt(at)
      // Lexical rules 1 and 2 run before the line-start rule: a bare %%
      // comment, or a comment with one swallowed prefix, preserves the mode.
      const bare =
        modeGap.startsWith("%%", at) && modeGap.charAt(at + 2) !== "{"
      const prefixed = character !== "}" && modeGap.startsWith("%%", at + 1)
      if (bare || prefixed) {
        const end = modeGap.indexOf("\n", at + (prefixed ? 3 : 2))
        at = end < 0 ? modeGap.length : end
        continue
      }
      if (character === "\n") {
        // Rule 8 takes the whole newline run; its last LF cannot then be
        // swallowed as a prefix. A spaces-only line splits that run.
        while (modeGap.charAt(at) === "\n") at++
        lineStart = true
        indentation = ""
        continue
      }
      if (character === " " || character === "\t") {
        // Rules 5/6 skip the whole run, without retrying rule 2 at its end.
        const start = at
        while (modeGap.charAt(at) === " " || modeGap.charAt(at) === "\t") at++
        indentation += modeGap.slice(start, at)
        continue
      }
      if (lineStart) {
        // Rule 7 precedes rule 9, so an unprefixed %%{ at line start
        // disables the mode before it becomes a diagram comment.
        enabled = false
        lineStart = false
      }
      if (modeGap.startsWith("%%", at)) {
        const end = modeGap.indexOf("\n", at + 2)
        at = end < 0 ? modeGap.length : end
      } else at++
    }
    const gap = reading.written.of(
      [previous, node.range[0]],
      [...comments, ...swallowed],
    )
    reading.problems.expect(
      [...gap].every((character) => " \t\r\n".includes(character)),
      label(node),
      "the statement gap is not Venn whitespace",
    )
    if (node.type !== "VennIgnoredText") {
      const implicit =
        node.type === "VennTextStatement" && node.targets === null
      const marker =
        enabled &&
        lineStart &&
        indentation.length > 0 &&
        horizontal(indentation)
      if (node.type === "VennTextStatement")
        reading.problems.expect(
          implicit === marker,
          label(node),
          "targets is null exactly for an enabled indented implicit-text marker",
        )
      if (lineStart && !implicit) enabled = false
      if (node.type === "VennSubsetStatement") {
        enabled = true
        const sets = entriesOf(node, "sets")
          .filter((entry) => entry !== null)
          .map(nameOf)
        if (node.kind === "set") {
          for (const name of sets) known.add(name)
        } else
          reading.problems.expect(
            sets.every((name) => known.has(name)),
            label(node),
            "a union member has no earlier set declaration",
          )
      }
      lineStart = false
      indentation = ""
    }
    previous = node.range[1]
    // Keep the swallowed prefix until its comment is read by rule 2.
    modeStart = node.type === "VennIgnoredText" ? node.range[0] : previous
  }
  const tail = reading.written.of(
    [previous, reading.text.length],
    [...comments, ...swallowed],
  )
  reading.problems.expect(
    [...tail].every((character) => " \t\r\n".includes(character)),
    label(reading.root.body),
    "the body has trailing text outside its statements",
  )
}

/** A bracket label keeps the complete written interior and allows empty quoted content. */
function checkLabel(reading: Reading, node: CheckedNode): void {
  const written = between(reading, ...node.range)
  const string = node.kind === "string"
  const open = string ? '["' : "["
  const close = string ? '"]' : "]"
  const interior = written.slice(open.length, -close.length)
  const converted = reading.attributeTextOf(node.range)
  const read = converted.slice(open.length, -close.length)
  reading.problems.expect(
    converted.startsWith(open) && converted.endsWith(close),
    label(node),
    "the label does not have the delimiters of its kind",
  )
  reading.problems.expectEqual(
    textOf(node),
    interior,
    label(node),
    "the label value is not its written interior",
  )
  reading.problems.expect(
    (string || interior !== "") &&
      !read.includes('"') &&
      (string || !read.includes("]")),
    label(node),
    "the label is empty or holds a character that ends its kind",
  )
  const own = ownOf(reading.root, node)
  checkJoinedOwnText(reading, node, own, written, false)
  const tokens = own.tokens
  reading.problems.expect(
    tokens[0]?.value === "[" &&
      tokens.at(-1)?.value === "]" &&
      tokens[0]?.type === "Punctuator" &&
      tokens.at(-1)?.type === "Punctuator",
    label(node),
    "the label brackets are not separate Punctuator tokens",
  )
  const content = tokens.slice(1, -1)
  const interiorRange: readonly [number, number] = [
    node.range[0] + 1,
    node.range[1] - 1,
  ]
  const expected = string
    ? reading.written.stringTokenKinds(interiorRange)
    : Array.from(
        { length: reading.written.cutsIn(interiorRange) + 1 },
        () => "RawText",
      )
  reading.problems.expectEqual(
    content.map((token) => token.type),
    expected,
    label(node),
    "the label content token kinds, split only at common trivia cuts",
  )
}

/** Only complete double-quoted strings, identifiers, and decimal numbers are shared Venn leaves. */
function checkLeaf(reading: Reading, node: CheckedNode): void {
  if (node.type === "Identifier") {
    checkTokenKinds(reading, node, ["Identifier"], "a Venn name or key")
    const name = textOf(node, "name")
    reading.problems.expect(
      /^[A-Z_a-z][\w-]*$/u.test(name) && !startsReservedWord(name),
      label(node),
      "the identifier is not a nonreserved Venn name",
    )
  } else if (node.type === "NumericLiteral") {
    checkTokenKinds(reading, node, ["Numeric"], "a Venn number")
    reading.problems.expect(
      /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(textOf(node, "raw")),
      label(node),
      "the number is not one decimal Venn unit",
    )
  } else if (node.type === "StringLiteral") {
    const written = reading.attributeTextOf(node.range)
    reading.problems.expect(
      node.closed === true &&
        written.startsWith('"') &&
        written.endsWith('"') &&
        !reading.attributeValueOf(node).includes('"'),
      label(node),
      "the string is not a closed double-quoted Venn string",
    )
  }
}

/** ast/venn.md, diagrams/venn.md and parser/docs/tokens/venn.md: first-stage checks. */
export function checkVennTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  const convertedText = reading.converted
  checkTokensInValueNodes(root, problems)
  checkBody(reading, ownOf(root, root.body), convertedText)
  for (const token of root.tokens) {
    if (token.type !== "Identifier" && token.type !== "Numeric") continue
    const unit = convertedText.of(token.range)
    const next = nextWrittenCharacter(reading, token.range[1])
    const continues =
      token.type === "Identifier"
        ? next !== undefined && /[\w-]/u.test(next)
        : next !== undefined &&
          (/\d/u.test(next) ||
            (next === "." &&
              !unit.includes(".") &&
              /\d/u.test(
                nextWrittenCharacter(reading, token.range[1] + 1) ?? "",
              )))
    const swallowed =
      unit.length === 1 &&
      root.comments.some(
        (comment) =>
          comment.mark === "%%" &&
          comment.range[0] >= token.range[1] &&
          between(reading, token.range[1], comment.range[0]) === "",
      )
    problems.expect(
      !continues && !swallowed,
      label(token),
      "the Venn unit ends early or is swallowed by the comment-prefix rule",
    )
  }
  walkNodes(root, (node, parent) => {
    checkChildTypes(reading, node, VENN_CHILD_TYPES)
    checkFieldWords(reading, node, VENN_FIELD_WORDS)
    checkListsWithAnEntry(reading, node, NONEMPTY_LISTS)
    checkLeaf(reading, node)
    if (!node.type.startsWith("Venn")) return
    const own = ownOf(root, node)
    checkRangeIsHull(reading, node, own)
    if (node.type === "VennLabel") {
      checkLabel(reading, node)
      return
    }
    if (node.type === "VennIgnoredText") {
      checkTokenKinds(reading, node, ["RawText"], "swallowed text")
      const value = textOf(node)
      const next = root.comments.find(
        (comment) => comment.range[0] >= node.range[1],
      )
      problems.expect(
        value.length === 1 &&
          value !== "}" &&
          !/\s/u.test(value) &&
          next?.mark === "%%" &&
          between(reading, node.range[1], next.range[0]) === "",
        label(node),
        "the ignored text is not one non-whitespace code unit swallowed before %%",
      )
      return
    }
    if (node.type === "VennLiteral") {
      problems.expect(textOf(node) !== "", label(node), "the literal is empty")
      const converted = convertedText.of(node.range)
      if (parent?.type === "VennStyleProperty") {
        const atoms = vennStyleAtomsOf(converted)
        const tokens = nodeTokensIn(root, node.range)
        let at = 0
        let valid = atoms !== null
        let earlierUnit = false
        let atomEnd = 0
        for (const atom of atoms ?? []) {
          atomEnd = converted.indexOf(atom, atomEnd) + atom.length
          earlierUnit ||=
            startsReservedWord(atom) ||
            (atom.toLowerCase() === "title" &&
              /^\s[^\n#;]+/u.test(converted.slice(atomEnd)))
          const kind =
            /^[A-Z_a-z]/u.test(atom) && !atom.includes("(")
              ? "Identifier"
              : atom.startsWith("#") || atom.includes("(")
                ? "RawText"
                : "Numeric"
          const firstIndex = at
          let remaining = atom
          let count = 0
          while (remaining !== "" && at < tokens.length) {
            const token = tokens[at++]
            if (token === undefined) break
            const part = convertedText.of(token.range)
            if (
              part === "" ||
              token.type !== kind ||
              !remaining.startsWith(part)
            ) {
              valid = false
              break
            }
            remaining = remaining.slice(part.length)
            count++
          }
          const first = tokens[firstIndex]
          const last = tokens[at - 1]
          const expectedCount =
            kind === "RawText" && first !== undefined && last !== undefined
              ? reading.written.cutsIn([first.range[0], last.range[1]]) + 1
              : 1
          if (remaining !== "" || count !== expectedCount) valid = false
        }
        problems.expect(
          valid && at === tokens.length,
          label(node),
          "the bare style atom token kinds or boundaries do not match the written units",
        )
        problems.expect(
          atoms !== null && !earlierUnit && !/^[\t ]|[\t ]$/u.test(converted),
          label(node),
          "the bare style value is not a nonempty sequence of Venn atoms",
        )
      } else {
        checkTokenKinds(reading, node, ["RawText"], "a Venn title")
        problems.expectEqual(
          nodeTokensIn(root, node.range).length,
          reading.written.cutsIn(node.range) + 1,
          label(node),
          "the title token count, split only at common trivia cuts",
        )
        problems.expect(
          !/[\n\r#;]/u.test(converted),
          label(node),
          "the title holds a character that ends its unit",
        )
      }
      return
    }
    checkOwnKinds(reading, node, own, VENN_PUNCTUATORS)
    const keyword = own.tokens[0]
    if (
      [
        "VennDiagram",
        "VennSubsetStatement",
        "VennTextStatement",
        "VennStyleStatement",
      ].includes(node.type) &&
      keyword !== undefined
    ) {
      const next = nextWrittenCharacter(reading, keyword.range[1])
      problems.expect(
        next === undefined || !/\w/u.test(next),
        label(node),
        "the keyword is followed by a word character",
      )
    }
    let layout: string[] = []
    switch (node.type) {
      case "VennDiagram":
        checkJoinedOwnText(reading, node, own, "venn-beta", false)
        return
      case "VennSubsetStatement": {
        const sets = entriesOf(node, "sets")
        problems.expect(
          node.kind === "set" ? sets.length === 1 : sets.length >= 2,
          label(node),
          "the subset has the wrong number of names for its kind",
        )
        layout = [
          textOf(node, "kind"),
          ...listLayout(sets.length),
          ...presentChildren(node, "label"),
          ...(childOf(node, "size") === null ? [] : [":", CHILD]),
        ]
        break
      }
      case "VennTextStatement":
        problems.expect(
          node.targets === null || entriesOf(node, "targets").length > 0,
          label(node),
          "the explicit target list is empty",
        )
        problems.expect(
          childOf(node, "id")?.type !== "NumericLiteral" || node.label === null,
          label(node),
          "a numeric text id has a label",
        )
        layout = [
          "text",
          ...listLayout(entriesOf(node, "targets").length),
          CHILD,
          ...presentChildren(node, "label"),
        ]
        break
      case "VennStyleStatement":
        layout = [
          "style",
          ...listLayout(entriesOf(node, "targets").length),
          ...listLayout(entriesOf(node, "properties").length),
        ]
        break
      case "VennStyleProperty":
        layout = [CHILD, ":", CHILD]
        break
      case "VennTitleStatement":
        layout = ["title", CHILD]
        checkTextAfter(reading, node, own, { field: "value", endsBefore: [] })
        break
      default:
        return
    }
    checkLayout(reading, node, own, layout)
    if (node.type === "VennTitleStatement") return
    const parts = [...own.tokens, ...childNodesOf(node)].sort(
      (a, b) => a.range[0] - b.range[0],
    )
    for (const [index, part] of parts.entries()) {
      const next = parts[index + 1]
      if (next !== undefined) {
        problems.expect(
          horizontal(between(reading, part.range[1], next.range[0])),
          label(node),
          "the argument gap is not ASCII space or tab",
        )
      }
    }
  })
}
