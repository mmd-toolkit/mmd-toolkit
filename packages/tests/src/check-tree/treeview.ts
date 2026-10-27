import { TreeviewText } from "../db-from-tree/treeview-text.ts"
import { isWhitespace } from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import {
  checkGap,
  checkRawUnit,
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
  textOf,
  checkTokenKinds,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import {
  treeviewClassEnd,
  treeviewIconEnd,
  treeviewUnit,
} from "./treeview-lexical.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { childNodesOf, nodesOf } from "./walk.ts"

const COMMON = [
  "TreeviewTitleStatement",
  "TreeviewAccTitleStatement",
  "TreeviewAccDescrStatement",
  "TreeviewAccDescrBlockStatement",
]
const ANNOTATIONS = [
  "TreeviewClassAnnotation",
  "TreeviewIconAnnotation",
  "TreeviewDescriptionAnnotation",
]
const PREFIX = ["TreeviewBranchPrefix"]
const DECORATION = ["TreeviewIgnoredText"]

/** ast/treeview.md: every child field, in the declared visitor order. */
export const TREEVIEW_CHILD_TYPES: FieldTable<readonly string[]> = {
  TreeviewDiagram: { body: ["TreeviewNode", ...DECORATION, ...COMMON] },
  TreeviewNode: {
    textBefore: DECORATION,
    prefix: PREFIX,
    textBeforeName: DECORATION,
    name: ["TreeviewIdentifier", "StringLiteral"],
    annotations: ANNOTATIONS,
    children: ["TreeviewNode"],
  },
  TreeviewClassAnnotation: {
    textBefore: DECORATION,
    prefix: PREFIX,
    name: ["Identifier"],
  },
  TreeviewIconAnnotation: {
    textBefore: DECORATION,
    prefix: PREFIX,
    name: ["Identifier"],
  },
  TreeviewDescriptionAnnotation: {
    textBefore: DECORATION,
    prefix: PREFIX,
    value: ["TreeviewLiteral"],
  },
  TreeviewTitleStatement: { prefix: PREFIX, value: ["TreeviewLiteral"] },
  TreeviewAccTitleStatement: { prefix: PREFIX, value: ["TreeviewLiteral"] },
  TreeviewAccDescrStatement: { prefix: PREFIX, value: ["TreeviewLiteral"] },
  TreeviewAccDescrBlockStatement: {
    prefix: PREFIX,
    textBeforeOpen: [...PREFIX, ...DECORATION],
    value: ["TreeviewLiteral"],
  },
}

/** True only when one authored range encloses the whole other range. */
function encloses(outer: TreeRange, inner: TreeRange): boolean {
  return outer[0] <= inner[0] && inner[1] <= outer[1]
}

/** Box forms outside an already-open leaf have exactly one retained source owner. */
function checkBoxOwners(
  reading: Reading,
  direct: TreeviewText,
  nodes: readonly CheckedNode[],
): void {
  const leaves = nodes.filter((node) =>
    ["StringLiteral", "TreeviewLiteral", "TreeviewIdentifier"].includes(
      node.type,
    ),
  )
  for (const line of direct.lines) {
    const range = line.prefix ?? line.decoration
    if (range === null) continue
    const type =
      line.prefix === null ? "TreeviewIgnoredText" : "TreeviewBranchPrefix"
    const enclosed = leaves.some((leaf) => encloses(leaf.range, range))
    const owners = nodes.filter(
      (node) => node.type === type && encloses(node.range, range),
    )
    reading.problems.expect(
      owners.length === (enclosed ? 0 : 1),
      "TreeviewDiagram",
      "each box prefix or decoration must have exactly one owner, or stay inside its enclosing leaf",
    )
    for (const owner of owners) {
      reading.problems.expectEqual(
        owner.range,
        range,
        label(owner),
        "the complete authored box form, without outer whitespace or LF",
      )
      if (type === "TreeviewBranchPrefix")
        reading.problems.expectEqual(
          owner.marker,
          line.marker,
          label(owner),
          "the first branch marker",
        )
    }
  }
  for (const node of nodes) {
    if (
      node.type !== "TreeviewBranchPrefix" &&
      node.type !== "TreeviewIgnoredText"
    )
      continue
    const matching = direct.lines.some((line) => {
      const range =
        node.type === "TreeviewBranchPrefix" ? line.prefix : line.decoration
      return (
        range !== null &&
        range[0] === node.range[0] &&
        range[1] === node.range[1]
      )
    })
    reading.problems.expect(
      matching,
      label(node),
      "the retained box form is not a whole applicable physical-line form",
    )
    if (node.type === "TreeviewIgnoredText")
      reading.problems.expect(
        node.kind === "box-decoration",
        label(node),
        "the only ignored kind is box-decoration",
      )
    checkTokenKinds(reading, node, ["RawText"], "an authored box form")
    checkRawUnit(reading, node)
  }
}

/** The next authored component determines a retained form's named owner. */
function checkNamedOwners(
  reading: Reading,
  nodes: readonly CheckedNode[],
): void {
  const hierarchy = nodes
    .filter((node) => node.type === "TreeviewNode")
    .sort(
      (a, b) =>
        (childOf(a, "name")?.range[0] ?? 0) -
        (childOf(b, "name")?.range[0] ?? 0),
    )
  const statements = nodes.filter(
    (node) => node.type === "TreeviewNode" || COMMON.includes(node.type),
  )
  const headerEnd =
    ownOf(reading.root, reading.root.body).tokens[0]?.range[1] ?? 0
  for (const form of nodes.filter(
    (node) =>
      node.type === "TreeviewIgnoredText" ||
      node.type === "TreeviewBranchPrefix",
  )) {
    const candidates: { node: CheckedNode; field: string; start: number }[] = []
    for (const node of nodes) {
      if (ANNOTATIONS.includes(node.type) || COMMON.includes(node.type)) {
        const marker = ownOf(reading.root, node).tokens[0]
        if (marker !== undefined)
          candidates.push({
            node,
            field:
              form.type === "TreeviewBranchPrefix" ? "prefix" : "textBefore",
            start: marker.range[0],
          })
      }
      if (node.type === "TreeviewAccDescrBlockStatement") {
        const open = ownOf(reading.root, node).tokens[1]
        if (open !== undefined)
          candidates.push({
            node,
            field: "textBeforeOpen",
            start: open.range[0],
          })
      }
      if (node.type === "TreeviewNode") {
        const name = childOf(node, "name")
        if (name === null) continue
        const previous = statements
          .filter((item) => item !== node && ownEnd(item) <= form.range[0])
          .sort((a, b) => ownEnd(a) - ownEnd(b))
          .at(-1)
        const before = gap(
          reading,
          previous === undefined ? headerEnd : ownEnd(previous),
          form.range[0],
        )
        if (
          form.type === "TreeviewBranchPrefix" ||
          [...before].some(horizontal)
        )
          candidates.push({
            node,
            field:
              form.type === "TreeviewBranchPrefix"
                ? "prefix"
                : "textBeforeName",
            start: name.range[0],
          })
      }
    }
    const expected = candidates
      .filter(
        ({ start, field, node }) =>
          start >= form.range[1] &&
          !(field === "textBefore" && COMMON.includes(node.type)) &&
          [...gap(reading, form.range[1], start)].every(
            (character) => horizontal(character) || character === "\n",
          ),
      )
      .sort((a, b) => a.start - b.start)[0]
    // Existing pending-name, annotation and block gaps take precedence. Only
    // remaining decorations between complete hierarchy nodes go to textBefore.
    const next = hierarchy.find(
      (node) => (childOf(node, "name")?.range[0] ?? 0) >= form.range[1],
    )
    const betweenNodes = hierarchy.some((node) => ownEnd(node) <= form.range[0])
    const owner =
      expected?.node ??
      (betweenNodes && next !== undefined ? next : reading.root.body)
    const field =
      expected?.field ?? (owner === reading.root.body ? "body" : "textBefore")
    const held = owner[field]
    reading.problems.expect(
      Array.isArray(held) ? held.includes(form) : held === form,
      label(form),
      `the retained form belongs to ${owner.type}.${field}`,
    )
  }
}

/** Raw leaves are whole lexical units at their actual positions, with original written values. */
function checkLeaf(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | undefined,
): void {
  const value = reading.converted.of(node.range)
  if (node.type === "TreeviewIdentifier" || node.type === "StringLiteral") {
    const unit = treeviewUnit(following(reading, node.range[0]))
    reading.problems.expect(
      unit?.kind === (node.type === "StringLiteral" ? "quoted" : "bare") &&
        unit.end === value.length &&
        (node.type !== "StringLiteral" || node.closed === true),
      label(node),
      "the name must be one complete first-priority bare or closed quoted unit",
    )
    if (node.type === "TreeviewIdentifier") {
      checkTokenKinds(reading, node, ["RawText"], "a bare name")
      checkRawUnit(reading, node)
    }
  } else if (node.type === "Identifier") {
    const length =
      parent?.type === "TreeviewClassAnnotation"
        ? treeviewClassEnd(following(reading, node.range[0]))
        : treeviewIconEnd(following(reading, node.range[0]))
    reading.problems.expect(
      value !== "" && length === value.length,
      label(node),
      "the class or complete icon reference must be one nonempty name atom",
    )
    checkTokenKinds(reading, node, ["Identifier"], "a class or icon name")
  } else if (node.type === "TreeviewLiteral") {
    reading.problems.expect(
      textOf(node) !== "",
      label(node),
      "an empty payload is null, never an empty literal",
    )
    checkTokenKinds(reading, node, ["RawText"], "a payload")
    checkRawUnit(reading, node)
  }
}

/** Empty and whitespace-only interiors differ; all authored padding belongs to a nonempty payload. */
function checkPayload(
  reading: Reading,
  node: CheckedNode,
  from: number,
  to: number,
  field = "value",
): void {
  const value = childOf(node, field)
  let start = from
  let end = to
  while (start < end && reading.written.isLeftOut(start)) start++
  while (end > start && reading.written.isLeftOut(end - 1)) end--
  const written = reading.written.of([start, end])
  reading.problems.expect(
    written === ""
      ? value === null
      : value !== null && value.range[0] === start && value.range[1] === end,
    label(node),
    "the payload must retain its complete authored interior and padding, or be null only after shared removals",
  )
}

/** Common forms own their punctuation and exact payload, without a trimmed block leaf. */
function checkCommon(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const keyword = own.tokens[0]
  if (keyword === undefined) return
  const kind = node.type.slice("Treeview".length, -"Statement".length)
  const block = kind === "AccDescrBlock"
  const title = kind === "Title"
  const word = title ? "title" : kind === "AccTitle" ? "accTitle" : "accDescr"
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    block ? [word, "{", "}"] : title ? [word] : [word, ":"],
    label(node),
    "the common statement's authored components",
  )
  const unit = treeviewUnit(following(reading, keyword.range[0]))
  const value = childOf(node, "value")
  reading.problems.expect(
    unit?.kind === kind &&
      (reading.converted.of([keyword.range[0], node.range[1]]).length ===
        unit.end ||
        (title && value === null && unit.end === word.length + 1)) &&
      (value === null
        ? unit.start === unit.valueEnd
        : reading.converted.of(value.range) ===
          following(reading, keyword.range[0]).slice(
            unit.start,
            unit.valueEnd,
          )),
    label(node),
    "the common value must fill its complete first-priority lexical form",
  )
  if (block) {
    const open = own.tokens[1]
    const close = own.tokens[2]
    if (open !== undefined && close !== undefined) {
      reading.problems.expect(
        [...gap(reading, keyword.range[1], open.range[0])].every((character) =>
          isWhitespace(character.codePointAt(0) ?? -1),
        ),
        label(node),
        "the block opener gap contains only common whitespace and its owned box forms",
      )
      checkPayload(reading, node, open.range[1], close.range[0])
    }
  } else {
    const mark = title ? keyword : own.tokens[1]
    if (mark === undefined) return
    let from = mark.range[1]
    if (title) {
      while (reading.written.isLeftOut(from)) from++
      if (horizontal(reading.text.charAt(from))) from++
    } else checkGap(reading, node, keyword.range[1], mark.range[0], false)
    checkPayload(reading, node, from, value?.range[1] ?? mark.range[1])
  }
}

/** An annotation's leading whitespace remains outside its retained components. */
function checkAnnotation(
  reading: Reading,
  node: CheckedNode,
  previous: number,
): void {
  const own = ownOf(reading.root, node)
  const marker = own.tokens[0]
  if (marker === undefined) return
  const before = checkGap(reading, node, previous, marker.range[0], true)
  reading.problems.expect(
    horizontal(before.at(-1) ?? ""),
    label(node),
    "an annotation requires leading ASCII space/tab at its unit position",
  )
  const name = childOf(node, "name")
  if (node.type === "TreeviewClassAnnotation") {
    reading.problems.expectEqual(
      own.tokens.map((token) => token.value),
      [":::"],
      label(node),
      "the class marker",
    )
    if (name !== null)
      checkGap(reading, node, marker.range[1], name.range[0], false)
  } else if (node.type === "TreeviewIconAnnotation") {
    reading.problems.expectEqual(
      own.tokens.map((token) => token.value),
      ["icon", "(", ")"],
      label(node),
      "the icon call components",
    )
    const open = own.tokens[1]
    const close = own.tokens[2]
    if (open !== undefined && close !== undefined) {
      reading.problems.expect(
        reading.converted.of([marker.range[1], open.range[0]]) === "",
        label(node),
        "the icon word must touch its opener after shared removals",
      )
      checkPayload(reading, node, open.range[1], close.range[0], "name")
    }
  } else {
    reading.problems.expectEqual(
      own.tokens.map((token) => token.value),
      ["##"],
      label(node),
      "the description marker",
    )
    const value = childOf(node, "value")
    const suffix = following(reading, marker.range[1])
    const end = suffix.indexOf("\n")
    reading.problems.expect(
      reading.converted.of([marker.range[1], node.range[1]]) ===
        (end === -1 ? suffix : suffix.slice(0, end)),
      label(node),
      "a description owns all following line text",
    )
    checkPayload(
      reading,
      node,
      marker.range[1],
      value?.range[1] ?? marker.range[1],
    )
  }
}

/** The end of this occurrence's syntax, excluding its descendants. */
function ownEnd(node: CheckedNode): number {
  if (node.type !== "TreeviewNode") return node.range[1]
  return (
    entriesOf(node, "annotations").at(-1)?.range[1] ??
    childOf(node, "name")?.range[1] ??
    node.range[1]
  )
}

/** Independently check the nearest still-open smaller-indent parent, including files. */
function checkParents(reading: Reading, ordered: readonly CheckedNode[]): void {
  const expected = new Map<CheckedNode, CheckedNode[]>()
  const roots: CheckedNode[] = []
  const open: CheckedNode[] = []
  for (const node of ordered) {
    while (
      open.length > 0 &&
      Number(open.at(-1)?.indent) >= Number(node.indent)
    )
      open.pop()
    const parent = open.at(-1)
    if (parent === undefined) roots.push(node)
    else expected.set(parent, [...(expected.get(parent) ?? []), node])
    open.push(node)
  }
  for (const node of [reading.root.body, ...ordered]) {
    const actual = entriesOf(
      node,
      node === reading.root.body ? "body" : "children",
    ).filter((child) => child?.type === "TreeviewNode")
    reading.problems.expectEqual(
      actual.map((child) => child?.range),
      (node === reading.root.body ? roots : (expected.get(node) ?? [])).map(
        (child) => child.range,
      ),
      label(node),
      "the children do not follow the treeview nearest-smaller-indent parent rule",
    )
  }
}

/** Body gaps assign one indentation run; decorations leave that pending run intact. */
function checkBody(reading: Reading, direct: TreeviewText): void {
  const diagram = reading.root.body
  const own = ownOf(reading.root, diagram)
  const header = own.tokens[0]
  reading.problems.expect(
    own.tokens.length === 1 &&
      header?.value === "treeView-beta" &&
      treeviewUnit(following(reading, header.range[0]))?.kind === "header",
    label(diagram),
    "the diagram owns exactly its complete case-sensitive header",
  )
  if (header === undefined) return
  const passed = reading.root.comments.some(
    (comment) =>
      comment.range[0] < header.range[0] &&
      !reading.written.isLeftOut(comment.range[0]) &&
      reading.converted.of(comment.range).trimEnd() === "%%",
  )
  const prefix = checkGap(
    reading,
    diagram,
    reading.root.frontmatter?.range[1] ?? 0,
    header.range[0],
    true,
    null,
    passed,
  )
  if (!passed)
    reading.problems.expect(
      [...prefix].every((character) => character === "\n"),
      label(diagram),
      "only native LF may follow a retained pre-header Comment without a passed bare line",
    )
  let end = header.range[1]
  let previous: CheckedNode | null = null
  const statements = nodesOf(reading.root)
    .filter(
      (node) => node.type === "TreeviewNode" || COMMON.includes(node.type),
    )
    .sort(
      (a, b) =>
        (childOf(a, "name")?.range[0] ?? a.range[0]) -
        (childOf(b, "name")?.range[0] ?? b.range[0]),
    )
  for (const item of statements) {
    let spacing = checkGap(
      reading,
      item,
      end,
      item.type === "TreeviewNode"
        ? (childOf(item, "name")?.range[0] ?? item.range[0])
        : (ownOf(reading.root, item).tokens[0]?.range[0] ?? item.range[0]),
      true,
    )
    if (
      previous?.type === "TreeviewTitleStatement" &&
      childOf(previous, "value") === null &&
      horizontal(spacing.charAt(0))
    )
      spacing = spacing.slice(1)
    if (item.type === "TreeviewNode") {
      let runs = 0
      let count = 0
      let active = false
      for (const character of spacing) {
        if (horizontal(character)) {
          if (!active) runs++
          active = true
          count++
        } else active = false
      }
      reading.problems.expect(
        Number.isInteger(item.indent) &&
          Number(item.indent) >= 0 &&
          count === item.indent &&
          runs <= 1,
        label(item),
        "indent must equal its one assigned ordinary run or branch depth, with decorations preserving the pending run",
      )
      const supplied = childOf(item, "prefix")
      const from = end
      const expected = direct.lines.find(
        (line) =>
          line.prefix !== null &&
          line.prefix[0] >= from &&
          line.prefix[1] <= (childOf(item, "name")?.range[0] ?? 0),
      )
      reading.problems.expect(
        expected === undefined
          ? supplied === null
          : supplied !== null && supplied.range[0] === expected.prefix?.[0],
        label(item),
        "the indentation-supplying prefix belongs to Node.prefix",
      )
      let at = childOf(item, "name")?.range[1] ?? item.range[0]
      for (const annotation of entriesOf(item, "annotations")) {
        if (annotation === null) continue
        checkAnnotation(reading, annotation, at)
        at = annotation.range[1]
      }
    }
    end = ownEnd(item)
    previous = item
  }
  let trailing = gap(reading, end, reading.text.length)
  if (
    previous?.type === "TreeviewTitleStatement" &&
    childOf(previous, "value") === null &&
    horizontal(trailing.charAt(0))
  )
    trailing = trailing.slice(1)
  reading.problems.expect(
    [...trailing].every((character) => character === "\n"),
    label(diagram),
    "the final gap contains only hidden LF and complete decorations or comments",
  )
}

/** Native comments must not steal text from earlier values or lexical units. */
function checkComments(reading: Reading, nodes: readonly CheckedNode[]): void {
  const header = ownOf(reading.root, reading.root.body).tokens[0]
  for (const comment of reading.root.comments) {
    if (
      comment.range[0] < (header?.range[0] ?? 0) ||
      reading.written.isLeftOut(comment.range[0])
    )
      continue
    const enclosed = nodes.some(
      (node) =>
        ["StringLiteral", "TreeviewIdentifier", "TreeviewLiteral"].includes(
          node.type,
        ) && encloses(node.range, comment.range),
    )
    const unit = treeviewUnit(following(reading, comment.range[0]))
    reading.problems.expect(
      !enclosed && (comment.mark === null || unit?.kind === "comment"),
      label(comment),
      "a native Comment cannot start inside an earlier name or composite payload",
    )
  }
}

/** Tree conditions only; parser result records determine acceptance. */
export function checkTreeviewTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const original = readingOf(text, root, problems)
  const direct = new TreeviewText(text, root)
  const reading: Reading = { ...original, converted: direct }
  const nodes = nodesOf(root)
  checkTokensInValueNodes(root, problems)
  checkBoxOwners(original, direct, nodes)
  checkNamedOwners(reading, nodes)
  checkComments(reading, nodes)
  for (const node of nodes) {
    checkChildTypes(reading, node, TREEVIEW_CHILD_TYPES)
    const parent = nodes.find((candidate) =>
      childNodesOf(candidate).includes(node),
    )
    checkLeaf(reading, node, parent)
    if (
      !node.type.startsWith("Treeview") ||
      [
        "TreeviewIdentifier",
        "TreeviewLiteral",
        "TreeviewBranchPrefix",
        "TreeviewIgnoredText",
      ].includes(node.type)
    )
      continue
    checkStatementNode(reading, node, [":::", "##", "(", ")", ":", "{", "}"])
    if (COMMON.includes(node.type)) checkCommon(reading, node)
  }
  checkBody(reading, direct)
  checkParents(
    reading,
    nodes
      .filter((node) => node.type === "TreeviewNode")
      .sort(
        (a, b) =>
          (childOf(a, "name")?.range[0] ?? 0) -
          (childOf(b, "name")?.range[0] ?? 0),
      ),
  )
}
