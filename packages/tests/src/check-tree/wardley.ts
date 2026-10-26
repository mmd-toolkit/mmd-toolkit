import { isWhitespace, isWordCharacter } from "../db-from-tree/characters.ts"
import {
  checkCommon,
  checkEnd,
  checkGap,
  checkHiddenGap,
  checkIgnored,
  checkNativeComments,
  checkPreheader,
  checkRawUnit,
  checkStatementNode,
  following,
  stringSpelling,
} from "./common-statement-checks.ts"
import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
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

const HIDDEN = ["WardleyIgnoredText"]
const NAME = ["WardleyIdentifier", "StringLiteral"]
const COMMON = [
  "WardleyTitleStatement",
  "WardleyAccTitleStatement",
  "WardleyAccDescrStatement",
  "WardleyAccDescrBlockStatement",
]
const DECLARATIONS = [
  "WardleyAnchorStatement",
  "WardleyComponentStatement",
  "WardleyAcceleratorStatement",
  "WardleyDeacceleratorStatement",
]
const DECORATIONS = [
  "WardleyLabelOffsetDecoration",
  "WardleySourceStrategyDecoration",
  "WardleyInertiaDecoration",
  "WardleyParenthesizedInertiaDecoration",
]
const WORDS = [
  "build",
  "buy",
  "outsource",
  "market",
  "wardley-beta",
  "size",
  "evolution",
  "anchor",
  "component",
  "label",
  "inertia",
  "evolve",
  "pipeline",
  "note",
  "annotations",
  "annotation",
  "accelerator",
  "deaccelerator",
]

/** Complete authored punctuation, including indivisible ports and arrow glyphs. */
export const WARDLEY_PUNCTUATORS: readonly string[] = [
  "[",
  ",",
  "]",
  "@",
  "/",
  "(",
  ")",
  "-",
  "{",
  "}",
  "->",
  "-->",
  "-.->",
  ">",
  "+",
  "<",
  "<>",
  "+>",
  "+<",
  "+<>",
  ";",
  ":",
]

/** ast/wardley.md: every child field in visitor order. */
export const WARDLEY_CHILD_TYPES: FieldTable<readonly string[]> = {
  WardleyDiagram: {
    textBeforeHeader: HIDDEN,
    body: [
      ...DECLARATIONS,
      "WardleyLinkStatement",
      "WardleyEvolveStatement",
      "WardleyPipelineStatement",
      "WardleyNoteStatement",
      "WardleyAnnotationsStatement",
      "WardleyAnnotationStatement",
      "WardleyEvolutionStatement",
      "WardleySizeStatement",
      ...COMMON,
      ...HIDDEN,
    ],
  },
  WardleyAnchorStatement: {
    textBeforeName: HIDDEN,
    name: NAME,
    textBeforeCoordinates: HIDDEN,
    coordinates: ["WardleyCoordinates"],
    textAfter: HIDDEN,
  },
  WardleyComponentStatement: {
    textBeforeName: HIDDEN,
    name: NAME,
    textBeforeCoordinates: HIDDEN,
    coordinates: ["WardleyCoordinates"],
    decorations: DECORATIONS,
    textAfter: HIDDEN,
  },
  WardleyLinkStatement: {
    from: NAME,
    textBeforeFromPort: HIDDEN,
    textBeforeArrow: HIDDEN,
    arrow: ["WardleyArrow"],
    textBeforeTo: HIDDEN,
    to: NAME,
    textBeforeToPort: HIDDEN,
    textBeforeLabel: HIDDEN,
    label: ["WardleyLiteral"],
    textAfter: HIDDEN,
  },
  WardleyEvolveStatement: {
    textBeforeComponent: HIDDEN,
    component: NAME,
    textBeforeTarget: HIDDEN,
    target: ["NumericLiteral"],
    textAfter: HIDDEN,
  },
  WardleyPipelineStatement: {
    textBeforeParent: HIDDEN,
    parent: NAME,
    textBeforeBody: HIDDEN,
    textAfterOpen: HIDDEN,
    body: ["WardleyPipelineComponent", ...HIDDEN],
    textAfter: HIDDEN,
  },
  WardleyPipelineComponent: {
    textBeforeName: HIDDEN,
    name: NAME,
    textBeforeOpen: HIDDEN,
    textBeforeEvolution: HIDDEN,
    evolution: ["NumericLiteral"],
    textBeforeClose: HIDDEN,
    labelOffset: ["WardleyLabelOffsetDecoration"],
    textAfter: HIDDEN,
  },
  WardleyNoteStatement: {
    textBeforeText: HIDDEN,
    text: ["StringLiteral"],
    textBeforeCoordinates: HIDDEN,
    coordinates: ["WardleyCoordinates"],
    textAfter: HIDDEN,
  },
  WardleyAnnotationsStatement: {
    textBeforeCoordinates: HIDDEN,
    coordinates: ["WardleyCoordinates"],
    textAfter: HIDDEN,
  },
  WardleyAnnotationStatement: {
    textBeforeNumber: HIDDEN,
    number: ["NumericLiteral"],
    textBeforeComma: HIDDEN,
    textBeforeCoordinates: HIDDEN,
    coordinates: ["WardleyCoordinates"],
    textBeforeText: HIDDEN,
    text: ["StringLiteral"],
    textAfter: HIDDEN,
  },
  WardleyAcceleratorStatement: {
    textBeforeName: HIDDEN,
    name: NAME,
    textBeforeCoordinates: HIDDEN,
    coordinates: ["WardleyCoordinates"],
    textAfter: HIDDEN,
  },
  WardleyDeacceleratorStatement: {
    textBeforeName: HIDDEN,
    name: NAME,
    textBeforeCoordinates: HIDDEN,
    coordinates: ["WardleyCoordinates"],
    textAfter: HIDDEN,
  },
  WardleyEvolutionStatement: { stages: ["WardleyEvolutionStage"] },
  WardleyEvolutionStage: {
    textBefore: HIDDEN,
    name: NAME,
    textBeforeBoundaryMark: HIDDEN,
    textBeforeBoundary: HIDDEN,
    boundary: ["NumericLiteral"],
    textBeforeSecondNameMark: HIDDEN,
    textBeforeSecondName: HIDDEN,
    secondName: NAME,
    textAfter: HIDDEN,
  },
  WardleySizeStatement: {
    textBeforeOpen: HIDDEN,
    textBeforeWidth: HIDDEN,
    width: ["NumericLiteral"],
    textBeforeComma: HIDDEN,
    textBeforeHeight: HIDDEN,
    height: ["NumericLiteral"],
    textBeforeClose: HIDDEN,
    textAfter: HIDDEN,
  },
  WardleyCoordinates: {
    textBeforeVisibility: HIDDEN,
    visibility: ["NumericLiteral"],
    textBeforeComma: HIDDEN,
    textBeforeEvolution: HIDDEN,
    evolution: ["NumericLiteral"],
    textBeforeClose: HIDDEN,
  },
  WardleyLabelOffsetDecoration: {
    textBefore: HIDDEN,
    textBeforeOpen: HIDDEN,
    textBeforeX: HIDDEN,
    textAfterXSign: HIDDEN,
    offsetX: ["NumericLiteral"],
    textBeforeComma: HIDDEN,
    textBeforeY: HIDDEN,
    textAfterYSign: HIDDEN,
    offsetY: ["NumericLiteral"],
    textBeforeClose: HIDDEN,
  },
  WardleySourceStrategyDecoration: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    textBeforeClose: HIDDEN,
  },
  WardleyInertiaDecoration: { textBefore: HIDDEN },
  WardleyParenthesizedInertiaDecoration: {
    textBefore: HIDDEN,
    textBeforeInertia: HIDDEN,
    textBeforeClose: HIDDEN,
  },
  WardleyArrow: { label: ["StringLiteral"] },
  WardleyTitleStatement: { value: ["WardleyLiteral"], textAfter: HIDDEN },
  WardleyAccTitleStatement: { value: ["WardleyLiteral"], textAfter: HIDDEN },
  WardleyAccDescrStatement: { value: ["WardleyLiteral"], textAfter: HIDDEN },
  WardleyAccDescrBlockStatement: {
    value: ["WardleyLiteral"],
    textAfter: HIDDEN,
  },
}

/** Fixed authored choices are checked independently against their source spelling. */
export const WARDLEY_FIELD_WORDS: FieldTable<readonly string[]> = {
  WardleyIgnoredText: { kind: ["yaml-block", "directive"] },
  WardleySourceStrategyDecoration: {
    value: ["build", "buy", "outsource", "market"],
  },
  WardleyArrow: {
    kind: ["dependency", "flow"],
    line: ["solid", "dotted"],
    startMarker: ["none", "arrow"],
    endMarker: ["none", "arrow"],
  },
}

/** ASCII letters start spaced names; their following parts have a different initial set. */
function letter(character: string): boolean {
  return (
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z")
  )
}

/** The decimal alternative precedes the integer's zero and nonzero alternatives. */
function numberUnit(text: string): { end: number; decimal: boolean } {
  let digits = 0
  while (text.charAt(digits) >= "0" && text.charAt(digits) <= "9") digits++
  if (digits === 0) return { end: 0, decimal: false }
  if (text.charAt(digits) === ".") {
    let end = digits + 1
    while (text.charAt(end) >= "0" && text.charAt(end) <= "9") end++
    if (end > digits + 1) return { end, decimal: true }
  }
  return {
    end: text.startsWith("0")
      ? 1
      : text.charAt(digits) === "."
        ? Math.max(0, digits - 1)
        : digits,
    decimal: false,
  }
}

/** A name is the complete first applicable spaced-name or id-name at its position. */
function nameUnit(text: string): { end: number; kind: string } {
  if (WORDS.some((word) => text.startsWith(word)) || numberUnit(text).end > 0)
    return { end: 0, kind: "Identifier" }
  const excluded =
    (text.startsWith("title") && isWhitespace(text.charCodeAt(5))) ||
    text.startsWith("accTitle") ||
    text.startsWith("accDescr")
  if (letter(text.charAt(0)) && !excluded) {
    let end = 1

    /** A name part ends before the dash of ->. */
    function continuation(at: number): boolean {
      const c = text.charAt(at)
      return (
        isWordCharacter(text.charCodeAt(at)) ||
        ["(", ")", "&"].includes(c) ||
        (c === "-" && text.charAt(at + 1) !== ">")
      )
    }

    while (continuation(end)) end++
    for (;;) {
      let next = end
      while (text.charAt(next) === " " || text.charAt(next) === "\t") next++
      if (
        next === end ||
        (!letter(text.charAt(next)) && text.charAt(next) !== "(")
      )
        break
      end = next + 1
      while (continuation(end)) end++
    }
    return { end, kind: "RawText" }
  }
  for (const word of ["accTitle", "accDescr"]) {
    if (!text.startsWith(word)) continue
    let at = word.length
    while (text.charAt(at) === " " || text.charAt(at) === "\t") at++
    if (text.charAt(at) === ":") return { end: 0, kind: "Identifier" }
    if (word === "accDescr") {
      at = word.length
      while (isWhitespace(text.charCodeAt(at))) at++
      if (text.charAt(at) === "{") return { end: 0, kind: "Identifier" }
    }
  }
  if (text.startsWith("title")) return { end: 0, kind: "Identifier" }
  let end = 0
  if (isWordCharacter(text.charCodeAt(0))) {
    while (isWordCharacter(text.charCodeAt(end)) || text.charAt(end) === "-")
      end++
    while (text.charAt(end - 1) === "-") end--
  }
  return { end, kind: "Identifier" }
}

/** Components consume only their own tokens and assign each hidden gap once. */
function components(reading: Reading, node: CheckedNode) {
  const tokens = ownOf(reading.root, node).tokens
  let index = 0
  let end = node.range[0]
  let previous: CheckedNode | null = null

  /** A gap permits native forms only in its declared owner. */
  function before(next: number, field?: string, compact = false): void {
    if (field !== undefined) checkHiddenGap(reading, node, field, end, next)
    else {
      const value = checkGap(reading, node, end, next, false, previous)
      if (compact)
        reading.problems.expect(
          value === "",
          label(node),
          "a composite component permits common trivia only",
        )
    }
    previous = null
  }

  return {
    token(
      expected: readonly string[],
      field?: string,
      compact = false,
    ): string {
      const token = tokens[index++]
      reading.problems.expect(
        token !== undefined && expected.includes(token.value),
        label(node),
        `the authored component must be ${expected.join(" or ")}`,
      )
      if (token === undefined) return ""
      before(token.range[0], field, compact)
      end = token.range[1]
      return token.value
    },
    child(field: string, gapField?: string, compact = false): void {
      const child = childOf(node, field)
      if (child === null) return
      before(child.range[0], gapField, compact)
      end = child.range[1]
    },
    member(child: CheckedNode): void {
      before(child.range[0])
      end = child.range[1]
      previous = entriesOf(child, "textAfter").at(-1) ?? null
    },
    absent(field: string): void {
      reading.problems.expect(
        entriesOf(node, field).length === 0,
        label(node),
        `the absent component's ${field} gap must be empty`,
      )
    },
    pipeline(): void {
      const body = entriesOf(node, "body").filter((item) => item !== null)
      const close = tokens[index]
      const first = body[0]?.range[0] ?? close?.range[0] ?? end
      const forms = entriesOf(node, "textAfterOpen").filter(
        (item) => item !== null,
      )
      const last = forms.at(-1)
      checkHiddenGap(reading, node, "textAfterOpen", end, last?.range[1] ?? end)
      const opening = checkGap(
        reading,
        node,
        last?.range[1] ?? end,
        first,
        true,
        last ?? null,
      )
      reading.problems.expect(
        opening.includes("\n"),
        label(node),
        "a pipeline opener requires a surviving visible LF",
      )
      reading.problems.expect(
        body.some((item) => item.type === "WardleyPipelineComponent"),
        label(node),
        "a pipeline body requires a written component",
      )
      end = first
      previous = null
      for (const item of body) {
        if (previous !== null && previous.type !== "WardleyIgnoredText")
          checkEnd(reading, previous, item.range[0])
        else checkGap(reading, node, end, item.range[0], true, previous)
        end = item.range[1]
        previous = item
      }
      if (previous !== null && previous.type !== "WardleyIgnoredText")
        checkEnd(reading, previous, close?.range[0] ?? end)
      else checkGap(reading, node, end, close?.range[0] ?? end, true, previous)
      end = close?.range[0] ?? end
      previous = null
    },
    finish(suffix = true): void {
      reading.problems.expect(
        index === tokens.length,
        label(node),
        "unexpected authored components remain",
      )
      if (suffix) checkHiddenGap(reading, node, "textAfter", end, node.range[1])
      else checkGap(reading, node, end, node.range[1], false, previous)
    },
  }
}

/** Authored arrow fields describe its glyph; label markers affect only the Db. */
function checkArrow(reading: Reading, node: CheckedNode): void {
  const value = reading.converted.of(node.range)
  const flow = value.startsWith("+")
  const content = childOf(node, "label")
  const parts = components(reading, node)
  let marker = ">"
  if (flow) {
    parts.token(["+"])
    parts.child("label", undefined, true)
    marker = parts.token(["<>", "<", ">"], undefined, true)
    reading.problems.expect(
      content !== null && reading.converted.of(content.range).startsWith("'"),
      label(node),
      "a flow arrow requires its whole single-quoted label",
    )
  } else {
    parts.token(["->", "-->", "-.->", ">"])
    reading.problems.expect(
      content === null,
      label(node),
      "a dependency arrow has no label",
    )
  }
  parts.finish(false)
  const expected = {
    kind: flow ? "flow" : "dependency",
    line: value === "-.->" ? "dotted" : "solid",
    startMarker: flow && marker.includes("<") ? "arrow" : "none",
    endMarker: !flow || marker.includes(">") ? "arrow" : "none",
  }
  for (const [field, word] of Object.entries(expected))
    reading.problems.expectEqual(
      node[field],
      word,
      label(node),
      `the arrow's written ${field}`,
    )
}

/** Each statement is checked from authored components, without semantic acceptance state. */
function checkForm(reading: Reading, node: CheckedNode): void {
  const p = components(reading, node)
  if (DECLARATIONS.includes(node.type)) {
    p.token([
      node.type === "WardleyAnchorStatement"
        ? "anchor"
        : node.type === "WardleyComponentStatement"
          ? "component"
          : node.type === "WardleyAcceleratorStatement"
            ? "accelerator"
            : "deaccelerator",
    ])
    p.child("name", "textBeforeName")
    p.child("coordinates", "textBeforeCoordinates")
    if (node.type === "WardleyComponentStatement") {
      let order = -1
      for (const decoration of entriesOf(node, "decorations")) {
        if (decoration === null) continue
        const next =
          decoration.type === "WardleyLabelOffsetDecoration"
            ? 0
            : decoration.type === "WardleySourceStrategyDecoration"
              ? 1
              : 2
        reading.problems.expect(
          next > order,
          label(node),
          "decorations must be offset, strategy, then one inertia form",
        )
        order = next
        p.member(decoration)
      }
    }
  } else
    switch (node.type) {
      case "WardleyCoordinates":
        p.token(["["])
        p.child("visibility", "textBeforeVisibility")
        p.token([","], "textBeforeComma")
        p.child("evolution", "textBeforeEvolution")
        p.token(["]"], "textBeforeClose")
        p.finish(false)
        return
      case "WardleyLabelOffsetDecoration":
        p.token(["label"], "textBefore")
        p.token(["["], "textBeforeOpen")
        for (const axis of ["X", "Y"]) {
          const magnitude = childOf(node, `offset${axis}`)
          const lower =
            axis === "X"
              ? node.range[0]
              : (childOf(node, "offsetX")?.range[1] ?? node.range[0])
          if (magnitude !== null)
            reading.problems.expectEqual(
              node[`negative${axis}`],
              ownOf(reading.root, node).tokens.some(
                (token) =>
                  token.value === "-" &&
                  token.range[0] >= lower &&
                  token.range[1] <= magnitude.range[0],
              ),
              label(node),
              `the written negative${axis} sign`,
            )
          if (axis === "Y") p.token([","], "textBeforeComma")
          if (node[`negative${axis}`] === true) {
            p.token(["-"], `textBefore${axis}`)
            p.child(`offset${axis}`, `textAfter${axis}Sign`)
          } else {
            p.absent(`textAfter${axis}Sign`)
            p.child(`offset${axis}`, `textBefore${axis}`)
          }
        }
        p.token(["]"], "textBeforeClose")
        p.finish(false)
        return
      case "WardleySourceStrategyDecoration": {
        p.token(["("], "textBefore")
        const word = p.token(
          ["build", "buy", "outsource", "market"],
          "textBeforeValue",
        )
        reading.problems.expectEqual(
          node.value,
          word,
          label(node),
          "the written source strategy",
        )
        p.token([")"], "textBeforeClose")
        p.finish(false)
        return
      }
      case "WardleyInertiaDecoration":
        p.token(["inertia"], "textBefore")
        p.finish(false)
        return
      case "WardleyParenthesizedInertiaDecoration":
        p.token(["("], "textBefore")
        p.token(["inertia"], "textBeforeInertia")
        p.token([")"], "textBeforeClose")
        p.finish(false)
        return
      case "WardleyEvolveStatement":
        p.token(["evolve"])
        p.child("component", "textBeforeComponent")
        p.child("target", "textBeforeTarget")
        break
      case "WardleyPipelineStatement":
        p.token(["pipeline"])
        p.child("parent", "textBeforeParent")
        p.token(["{"], "textBeforeBody")
        p.pipeline()
        p.token(["}"])
        break
      case "WardleyPipelineComponent":
        p.token(["component"])
        p.child("name", "textBeforeName")
        p.token(["["], "textBeforeOpen")
        p.child("evolution", "textBeforeEvolution")
        p.token(["]"], "textBeforeClose")
        p.child("labelOffset")
        break
      case "WardleyNoteStatement":
        p.token(["note"])
        p.child("text", "textBeforeText")
        p.child("coordinates", "textBeforeCoordinates")
        break
      case "WardleyAnnotationsStatement":
        p.token(["annotations"])
        p.child("coordinates", "textBeforeCoordinates")
        break
      case "WardleyAnnotationStatement":
        p.token(["annotation"])
        p.child("number", "textBeforeNumber")
        p.token([","], "textBeforeComma")
        p.child("coordinates", "textBeforeCoordinates")
        p.child("text", "textBeforeText")
        break
      case "WardleySizeStatement":
        p.token(["size"])
        p.token(["["], "textBeforeOpen")
        p.child("width", "textBeforeWidth")
        p.token([","], "textBeforeComma")
        p.child("height", "textBeforeHeight")
        p.token(["]"], "textBeforeClose")
        break
      case "WardleyEvolutionStatement": {
        p.token(["evolution"])
        const stages = entriesOf(node, "stages").filter(
          (stage) => stage !== null,
        )
        reading.problems.expect(
          stages.length >= 2,
          label(node),
          "evolution requires at least two written stages",
        )
        for (const [index, stage] of stages.entries()) {
          if (index > 0) p.token(["->"])
          p.member(stage)
        }
        p.finish(false)
        return
      }
      case "WardleyEvolutionStage":
        p.child("name", "textBefore")
        if (childOf(node, "boundary") !== null) {
          p.token(["@"], "textBeforeBoundaryMark")
          p.child("boundary", "textBeforeBoundary")
        } else {
          p.absent("textBeforeBoundaryMark")
          p.absent("textBeforeBoundary")
        }
        if (childOf(node, "secondName") !== null) {
          p.token(["/"], "textBeforeSecondNameMark")
          p.child("secondName", "textBeforeSecondName")
        } else {
          p.absent("textBeforeSecondNameMark")
          p.absent("textBeforeSecondName")
        }
        break
      case "WardleyLinkStatement":
        for (const side of ["from", "to"]) {
          const target = childOf(node, "to")
          const port = ownOf(reading.root, node).tokens.find(
            (token) =>
              ["+<>", "+>", "+<"].includes(token.value) &&
              target !== null &&
              (side === "from"
                ? token.range[1] <= target.range[0]
                : token.range[0] >= target.range[1]),
          )
          const direction =
            port === undefined
              ? null
              : port.value === "+<>"
                ? "bidirectional"
                : port.value === "+>"
                  ? "forward"
                  : "backward"
          reading.problems.expectEqual(
            node[`${side}Port`],
            direction,
            label(node),
            `the written ${side}Port direction`,
          )
        }
        p.child("from")
        for (const side of ["from", "to"]) {
          if (side === "to") {
            if (childOf(node, "arrow") !== null)
              p.child("arrow", "textBeforeArrow")
            else p.absent("textBeforeArrow")
            p.child("to", "textBeforeTo")
          }
          const field =
            side === "from" ? "textBeforeFromPort" : "textBeforeToPort"
          if (node[`${side}Port`] === null) p.absent(field)
          else {
            const port = p.token(["+<>", "+>", "+<"], field)
            reading.problems.expectEqual(
              node[`${side}Port`],
              port === "+<>"
                ? "bidirectional"
                : port === "+>"
                  ? "forward"
                  : "backward",
              label(node),
              "the written port direction",
            )
          }
        }
        if (childOf(node, "label") !== null) {
          p.token([";"], "textBeforeLabel")
          p.child("label", undefined, true)
          const content = childOf(node, "label")
          if (content !== null) {
            const tail = following(reading, content.range[0])
            const lf = tail.indexOf("\n")
            reading.problems.expectEqual(
              reading.converted.of(content.range),
              lf === -1 ? tail : tail.slice(0, lf),
              label(node),
              "the semicolon label owns the complete physical-line value",
            )
          }
          reading.problems.expect(
            entriesOf(node, "textAfter").length === 0,
            label(node),
            "a semicolon label owns the whole remaining physical line",
          )
        } else p.absent("textBeforeLabel")
        break
      default:
        return
    }
  p.finish()
}

/** Every shared leaf is checked in its owning lexical role. */
export function checkWardleyTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  const flowLabels = new Set<CheckedNode>()
  const integerOnly = new Set<CheckedNode>()
  const eitherNumber = new Set<CheckedNode>()
  const nodes: CheckedNode[] = []
  walkNodes(root, (node) => {
    nodes.push(node)
    if (node.type === "WardleyArrow") {
      const content = childOf(node, "label")
      if (content !== null) flowLabels.add(content)
    }
    const fields =
      node.type === "WardleyLabelOffsetDecoration"
        ? ["offsetX", "offsetY"]
        : node.type === "WardleySizeStatement"
          ? ["width", "height"]
          : node.type === "WardleyAnnotationStatement"
            ? ["number"]
            : []
    for (const field of fields) {
      const child = childOf(node, field)
      if (child !== null) integerOnly.add(child)
    }
    if (
      ["WardleyAnnotationsStatement", "WardleyAnnotationStatement"].includes(
        node.type,
      )
    ) {
      const pair = childOf(node, "coordinates")
      if (pair !== null)
        for (const field of ["visibility", "evolution"]) {
          const child = childOf(pair, field)
          if (child !== null) eitherNumber.add(child)
        }
    }
  })
  checkTokensInValueNodes(root, problems)
  for (const node of nodes) {
    checkChildTypes(reading, node, WARDLEY_CHILD_TYPES)
    checkFieldWords(reading, node, WARDLEY_FIELD_WORDS)
    const value = reading.converted.of(node.range)
    if (node.type === "WardleyIdentifier") {
      const match = nameUnit(following(reading, node.range[0]))
      problems.expect(
        value.length > 0 && match.end === value.length,
        label(node),
        "the name is not one complete first-match lexical unit",
      )
      checkTokenKinds(reading, node, [match.kind], "a Wardley comparison name")
      if (match.kind === "RawText") checkRawUnit(reading, node)
    } else if (node.type === "NumericLiteral") {
      const match = numberUnit(following(reading, node.range[0]))
      problems.expect(
        value.length > 0 &&
          match.end === value.length &&
          (integerOnly.has(node)
            ? !match.decimal
            : eitherNumber.has(node) || match.decimal),
        label(node),
        "the number is not one complete unsigned integer or decimal in its authored role",
      )
      checkTokenKinds(reading, node, ["Numeric"], "a Wardley number")
    } else if (node.type === "StringLiteral") {
      const valid = flowLabels.has(node)
        ? value.startsWith("'") &&
          value.endsWith("'") &&
          !value.slice(1, -1).includes("'")
        : stringSpelling(value)
      problems.expect(
        node.closed === true && valid,
        label(node),
        "the string is not one complete closed lexical value in its authored role",
      )
    }
    if (!node.type.startsWith("Wardley")) continue
    if (node.type === "WardleyIdentifier") continue
    checkStatementNode(reading, node, WARDLEY_PUNCTUATORS)
    if (node.type === "WardleyIgnoredText") {
      problems.expect(
        reading.written
          .of(node.range)
          .startsWith(node.kind === "yaml-block" ? "---" : "%%{"),
        label(node),
        "a retained form begins at its opener without padding",
      )
      checkIgnored(reading, node)
    } else if (COMMON.includes(node.type)) checkCommon(reading, node)
    else if (node.type === "WardleyArrow") checkArrow(reading, node)
    else if (node.type === "WardleyLiteral")
      problems.expect(value.length > 0, label(node), "a literal is nonempty")
    else if (node.type === "WardleyDiagram") {
      const own = ownOf(root, node)
      const header = own.tokens[0]
      problems.expect(
        own.tokens.length === 1 && header?.value === "wardley-beta",
        label(node),
        "the written header must be wardley-beta",
      )
      if (header === undefined) continue
      checkNativeComments(reading, header.range[1])
      for (const comment of root.comments) {
        const at = comment.range[0]
        if (at < header.range[1] || reading.written.isLeftOut(at)) continue
        for (const enclosing of nodes) {
          if (
            [
              "WardleyLiteral",
              "WardleyArrow",
              "WardleyIgnoredText",
              ...COMMON,
            ].includes(enclosing.type)
          )
            problems.expect(
              at < enclosing.range[0] || at >= enclosing.range[1],
              label(comment),
              "a native Comment cannot replace an earlier enclosing lexical value",
            )
        }
      }
      checkPreheader(reading, node)
      checkHiddenGap(
        reading,
        node,
        "textBeforeHeader",
        node.range[0],
        header.range[0],
        true,
        true,
      )
      let end = header.range[1]
      let previous: CheckedNode | null = null
      for (const item of entriesOf(node, "body")) {
        if (item === null) continue
        if (previous !== null && previous.type !== "WardleyIgnoredText") {
          const last =
            previous.type === "WardleyEvolutionStatement"
              ? (entriesOf(previous, "stages").at(-1) ?? previous)
              : previous
          checkEnd(reading, last, item.range[0])
        } else checkGap(reading, node, end, item.range[0], true, previous)
        end = item.range[1]
        previous = item
      }
      if (previous !== null && previous.type !== "WardleyIgnoredText") {
        const last =
          previous.type === "WardleyEvolutionStatement"
            ? (entriesOf(previous, "stages").at(-1) ?? previous)
            : previous
        checkEnd(reading, last, text.length)
      } else checkGap(reading, node, end, text.length, true, previous)
    } else checkForm(reading, node)
  }
}
