import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import { NULL_FIELD_RULES } from "../src/check-tree/null-fields.ts"
import type { CheckedRoot, TreeProblem } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import type { DiagramType } from "../src/index.ts"
import type { CorpusTree } from "./check-tree-recorded.ts"
import {
  mayHaveRecordedTrees,
  recordedTree,
  recordedTreesOfCorpus,
} from "./check-tree-recorded.ts"
import type { RecordedTree } from "./check-tree-recorded.ts"
import { locationOf } from "./check-tree-trees.ts"

// Every field of every node type of the tree, broken in a recorded tree, is
// reported by the check of a tree, and by the rule of that field: each row of
// the tables below says which problem, at which place and with which message
// or start of a message, the broken field must cause. A problem of another
// rule at the node does not satisfy a row. A field that may be null is also
// made null where the source writes it; the named cases further down do that
// for the fields of strings, and set it where the source writes none.

// The recorded trees are read once for the file (`recordedTreesOfCorpus()`),
// and the first tree for each case is taken from an index of them
// (`firstRecordedTrees()`): the first test, which reads them, takes about 2.5
// seconds and the others milliseconds; the limit is eight times that.
const READS_THE_RECORDED_TREES = 20_000

/** The problem that a broken field must cause: where it is, and what it says. */
interface ExpectedProblem {
  /** The `where` of the problem, or the range that the place it names lies in. */
  readonly where: string | TreeRange
  /** The message, or its fixed start when `exact` is not set: a message that holds the broken value has text that depends on it. */
  readonly message: string
  readonly exact?: true
}

/** Whether `where`, `Type at 3-9` and for a token also ` of "text"`, names a place in `expected`: the place itself, or one that lies in the range. */
function isAtExpectedPlace(
  where: string,
  expected: string | TreeRange,
): boolean {
  return typeof expected === "string"
    ? where === expected
    : isPlacedIn(where, expected)
}

/** Whether one of `problems` is the problem that `expected` describes. */
function isReported(
  problems: readonly TreeProblem[],
  expected: ExpectedProblem,
): boolean {
  return problems.some(
    (problem) =>
      isAtExpectedPlace(problem.where, expected.where) &&
      (expected.exact === true
        ? problem.message === expected.message
        : problem.message.startsWith(expected.message)),
  )
}

/** What a failure says of a row: the problem it expected, and the problems at its place that the check reported instead. */
function failureOf(
  row: string,
  expected: ExpectedProblem,
  problems: readonly TreeProblem[],
  treeName: string,
): string {
  const instead = problems
    .filter((problem) => isAtExpectedPlace(problem.where, expected.where))
    .map((problem) => problem.message)
  return `${row}: no problem at ${JSON.stringify(expected.where)} ${expected.exact === true ? "that says" : "that starts with"} ${JSON.stringify(expected.message)} in ${treeName}, but ${JSON.stringify(instead)}`
}

/**
 * The fields that hold a value, by `Type.field`, with the problem that the
 * rule of the field reports when the value is another one of its kind: the
 * start of its message, and where it is when it is not at the node that holds
 * the field.
 */
/** What the check of a requirement tree reports for a value that disagrees with the keyword that was written. */
const REQUIREMENT_PARTS =
  "the tokens that the node writes itself and its child nodes, in source order"

const VALUE_FIELD_REPORTS: Readonly<
  Record<string, { readonly message: string; readonly where?: string }>
> = {
  "ClassArrow.value": {
    message: "value is not the texts of its tokens joined",
  },
  "ClassArrow.startMarker": { message: "the fields, written " },
  "ClassArrow.line": { message: "the fields, written " },
  "ClassArrow.endMarker": { message: "the fields, written " },
  "ClassAttribute.visibility": { message: "the visibility: " },
  "ClassAttribute.classifier": { message: "the classifier: " },
  "ClassDirectionStatement.direction": { message: "the keywords: " },
  "ClassIgnoredText.value": { message: "value is not its written text" },
  "ClassLinkStatement.target": {
    message: "the last token, which is the target: ",
  },
  "ClassLiteral.value": { message: "value is not its written text" },
  "ClassIdentifier.name": {
    message: "name is not the texts of its tokens joined",
  },
  "ClassMethod.visibility": { message: "the visibility: " },
  "ClassMethod.classifier": { message: "the classifier: " },
  "Comment.mark": { message: "the mark of a comment line is not %%" },
  "Comment.value": { message: "value of a comment line: " },
  "Directive.name": { message: "name: " },
  "Directive.value": { message: "value: " },
  "Directive.closed": {
    message: "the directives of the tree are not those of the source: ",
    where: "the directives",
  },
  "ErAttribute.optional": {
    message: "optional, which is whether a `?` follows the type: ",
  },
  "ErDirectionStatement.direction": {
    message: "the keywords, the value in upper case: ",
  },
  "ErIdentifier.name": { message: "name is not its written text" },
  "ErIgnoredText.value": { message: "value is not its written text" },
  "ErLiteral.value": { message: "value is not its written text" },
  "ErRelationship.leftCardinality": { message: "the fields, written " },
  "ErRelationship.line": { message: "the fields, written " },
  "ErRelationship.rightCardinality": { message: "the fields, written " },
  "FlowchartAccDescrBlockStatement.closed": {
    message: "closed is not whether the last token is `}`: ",
  },
  "FlowchartArrow.value": { message: "value is not its written text" },
  "FlowchartArrow.startMarker": {
    message: "the fields of the arrow, written ",
  },
  "FlowchartArrow.line": { message: "the fields of the arrow, written " },
  "FlowchartArrow.length": { message: "the fields of the arrow, written " },
  "FlowchartArrow.endMarker": { message: "the fields of the arrow, written " },
  "FlowchartClickUrlStatement.target": {
    message: "the target, which is the last token: ",
  },
  "FlowchartDataBlock.value": { message: "value is not its written text" },
  "FlowchartDiagram.direction": {
    message:
      "the direction of the header is not the first token of the diagram after the header keyword, or null when that is no direction: ",
  },
  "FlowchartDirectionStatement.direction": { message: "the keywords: " },
  "FlowchartIgnoredText.value": { message: "value is not its written text" },
  "FlowchartLabel.kind": {
    message: "the kind of the label, from the delimiter before its content: ",
  },
  "FlowchartLabel.value": { message: "value is not its written text" },
  "FlowchartLiteral.value": { message: "value is not its written text" },
  "FlowchartOpeningArrow.value": { message: "value is not its written text" },
  "FlowchartOpeningArrow.startMarker": {
    message: "the fields of the opening arrow, written ",
  },
  "FlowchartOpeningArrow.line": {
    message: "the line is that of the closing arrow: ",
  },
  "FlowchartShape.name": { message: "the name of the shape, written " },
  "Frontmatter.value": { message: "value: " },
  "Frontmatter.valueRange": { message: "value: " },
  "GanttLiteral.value": { message: "value is not its written text" },
  "GanttWeekdayStatement.day": {
    message: "the day, which is the day token in lower case: ",
  },
  "GanttWeekendStatement.day": {
    message: "the day, which is the day token in lower case: ",
  },
  "Identifier.name": { message: "name is not the texts of its tokens joined" },
  "JourneyIgnoredText.value": { message: "value is not its written text" },
  "JourneyLiteral.value": { message: "value is not its written text" },
  "MindmapLabel.kind": { message: "the field kind is " },
  "MindmapLabel.value": { message: "value is not its written text" },
  "MindmapLiteral.value": { message: "value is not its written text" },
  "MindmapNode.indent": {
    message: "the indent, which is the number of whitespace characters ",
  },
  "MindmapShape.closer": { message: "the field closer is " },
  "MindmapShape.opener": { message: "the field opener is " },
  "NumericLiteral.value": {
    message: "value is not the number that its written text writes",
  },
  "NumericLiteral.raw": { message: "raw: " },
  "RequirementDirectionStatement.direction": {
    message: REQUIREMENT_PARTS,
  },
  "RequirementElementField.field": { message: REQUIREMENT_PARTS },
  "RequirementIdentifier.name": { message: "name is not its written text" },
  "RequirementIgnoredText.value": { message: "value is not its written text" },
  "RequirementLiteral.value": { message: "value is not its written text" },
  "RequirementRelationshipStatement.arrow": {
    message: "the field arrow is ",
  },
  "RequirementRelationshipStatement.relationship": {
    message: REQUIREMENT_PARTS,
  },
  "RequirementRequirementStatement.requirementType": {
    message: REQUIREMENT_PARTS,
  },
  "RequirementRiskField.risk": { message: REQUIREMENT_PARTS },
  "RequirementValueField.field": { message: REQUIREMENT_PARTS },
  "RequirementVerifyMethodField.verifyMethod": { message: REQUIREMENT_PARTS },
  "Root.diagramType": { message: "the diagram type ", where: "Root" },
  "SequenceAccDescrBlockStatement.closed": {
    message: "closed, by whether its last token is `}`: ",
  },
  "SequenceArrow.value": { message: "value is not its written text" },
  "SequenceArrow.startMarker": { message: "fields, written " },
  "SequenceArrow.line": { message: "fields, written " },
  "SequenceArrow.endMarker": { message: "fields, written " },
  "SequenceAutonumberStatement.off": { message: "off: " },
  "SequenceBoxText.value": { message: "value is not its written text" },
  "SequenceDataBlock.value": { message: "value is not its written text" },
  "SequenceDestroyStatement.created": { message: "created: " },
  "SequenceIdentifier.name": { message: "name is not its written text" },
  "SequenceIgnoredStatement.value": {
    message: "value is not its written text",
  },
  "SequenceLiteral.value": { message: "value is not its written text" },
  "SequenceMessageStatement.fromCentralConnection": {
    message: "central connections, before and after the arrow: ",
  },
  "SequenceMessageStatement.activation": { message: "activation: " },
  "SequenceMessageStatement.toCentralConnection": {
    message: "central connections, before and after the arrow: ",
  },
  "SequenceNoteStatement.placement": { message: "placement: " },
  "SequenceParticipantStatement.kind": { message: "keyword: " },
  "SequenceParticipantStatement.created": { message: "created: " },
  "SequenceText.wrap": { message: "wrap, by the prefix: " },
  "StateAccDescrBlockStatement.closed": {
    message: "closed, which is whether it ends with }: ",
  },
  "StateDirectionStatement.direction": { message: "the keywords: " },
  "StateIgnoredStatement.value": { message: "value is not its written text" },
  "StateIgnoredText.value": { message: "value is not its written text" },
  "StateLiteral.value": { message: "value is not its written text" },
  "StateNoteStatement.position": {
    message: "the position, which is the word before `of`: ",
  },
  "StatePseudostateDefinitionStatement.kind": { message: "the kind " },
  "StringLiteral.value": { message: "value is not its written text" },
  "StringLiteral.raw": { message: "raw: " },
  "StringLiteral.closed": { message: "closed: " },
  "Token.value": { message: "value: " },
  "TimelineDiagram.direction": {
    message:
      "the direction of the header is not the token after the header keyword, or null when there is none: ",
  },
  "TimelineLiteral.value": { message: "value is not its written text" },
  "SankeyIdentifier.name": {
    message: "name is not its written text without the whitespace at its ends",
  },
  "SankeyLiteral.value": {
    message: "value is not its written text without the whitespace at its ends",
  },
}

/**
 * What the form of a tree says of a field of a node, or of a list of nodes,
 * that holds a string instead (`shape.ts`), by the shape of the field: the
 * kind that it wanted.
 */
const WANTED_BY_SHAPE: Readonly<Record<string, string>> = {
  node: "a node",
  nodeOrNull: "a node or null",
  nodeList: "a list",
  nodeListOrNull: "a list",
  nodeListWithNull: "a list",
}

/**
 * The fields of nodes that may be null whose null is reported by the check of
 * the punctuators instead of the one of the tokens of a value, by `Type.field`:
 * what the node writes for the field is a punctuator, which no node of a value
 * holds, so that it lies in a place where a punctuator of the diagram is none.
 */
const PUNCTUATOR_FIELDS: ReadonlySet<string> = new Set([
  "FlowchartLink.opening",
])

/** An object of a tree, a node or a record, with its fields. */
type TreeObject = Record<string, unknown>

/** The objects of the tree, by the name of their type: the nodes, and the records of the root. */
function objectsByType(tree: CheckedRoot): Map<string, TreeObject[]> {
  const byType = new Map<string, TreeObject[]>()

  /** Adds `object` to the objects of `type`. */
  function add(type: string, object: object): void {
    const list = byType.get(type) ?? []
    list.push(object as TreeObject)
    byType.set(type, list)
  }

  add("Root", tree)
  for (const token of tree.tokens) add("Token", token)
  for (const comment of tree.comments) add("Comment", comment)
  for (const directive of tree.directives) add("Directive", directive)
  if (tree.frontmatter !== null) add("Frontmatter", tree.frontmatter)
  for (const node of nodesOf(tree)) {
    if (node.type !== "Root") add(node.type, node)
  }
  return byType
}

/**
 * The first recorded tree of the corpus for each case that the tests below
 * break a field in: any recorded tree that has the case will do, and the
 * question of a test does not depend on which, since the problem that a row
 * requires has a message that is the same in every tree (a message that
 * depends on the tree is a named case below).
 */
interface FirstTrees {
  /** By the name of a type: the first tree that has an object of the type. */
  readonly ofType: ReadonlyMap<string, CorpusTree>
  /** By `Type.field`: the first tree that has an object of the type whose field is null. */
  readonly withNull: ReadonlyMap<string, CorpusTree>
  /** By `Type.field`: the first tree that has an object of the type whose field is not null. */
  readonly withValue: ReadonlyMap<string, CorpusTree>
}

/** Indexes the first tree of each case among the recorded trees of the corpus. */
function buildFirstTrees(trees: readonly CorpusTree[]): FirstTrees {
  const ofType = new Map<string, CorpusTree>()
  const withNull = new Map<string, CorpusTree>()
  const withValue = new Map<string, CorpusTree>()
  for (const recorded of trees) {
    const tree = JSON.parse(recorded.json) as CheckedRoot
    for (const [type, objects] of objectsByType(tree)) {
      if (!ofType.has(type)) ofType.set(type, recorded)
      for (const field of Object.keys(NODE_FIELDS[type] ?? {})) {
        const key = `${type}.${field}`
        for (const object of objects) {
          const index = object[field] === null ? withNull : withValue
          if (!index.has(key)) index.set(key, recorded)
        }
      }
    }
  }
  return { ofType, withNull, withValue }
}

let firstTrees: Promise<FirstTrees> | undefined

/** The index of the first recorded trees, built once for all the tests of this file. */
function firstRecordedTrees(): Promise<FirstTrees> {
  firstTrees ??= recordedTreesOfCorpus().then(buildFirstTrees)
  return firstTrees
}

/** The place of `object` as the problems name it: its `type` and its range. */
function placeOf(object: TreeObject): string {
  const [start, end] = object.range as TreeRange
  return `${String(object.type)} at ${start}-${end}`
}

/** The value that breaks the value of a field: a different one of the same kind. */
function brokenValue(value: unknown, valueType: string | undefined): unknown {
  switch (valueType) {
    case "boolean":
      return value !== true
    case "number":
      return typeof value === "number" ? value + 1 : 0
    case "range":
      return [0, 0]
    default:
      return typeof value === "string" ? `${value}Z` : "Z"
  }
}

/** The range that the node or the list of nodes `value` covers; none for an empty list. */
function rangeCoveredBy(value: unknown): TreeRange | null {
  if (Array.isArray(value)) {
    const first = value[0] as TreeObject | undefined
    const last = value.at(-1) as TreeObject | undefined
    return first === undefined || last === undefined
      ? null
      : [(first.range as TreeRange)[0], (last.range as TreeRange)[1]]
  }
  return (value as TreeObject).range as TreeRange
}

/** Whether the place that `where` names, `Type at 3-9` and for a token also ` of "text"`, lies in `range`. */
function isPlacedIn(where: string, range: TreeRange): boolean {
  const [, place] = where.split(" at ")
  const [numbers] = (place ?? "").split(" ")
  const [start, end] = (numbers ?? "").split("-").map(Number)
  return (
    start !== undefined &&
    end !== undefined &&
    range[0] <= start &&
    end <= range[1]
  )
}

/** The kinds of the nullable fields that are not values. */
const NULLABLE_NODE_SHAPES: ReadonlySet<string> = new Set([
  "nodeOrNull",
  "nodeListOrNull",
])

/**
 * The problem that a broken field `type.field` causes in `instance`: for a
 * field that holds a value, the one that the table `VALUE_FIELD_REPORTS` names
 * for its rule; for a field of a node or of a list, the one that the form of
 * the tree reports when it holds a string.
 */
function expectedForBrokenField(
  type: string,
  field: string,
  shape: string,
  instance: TreeObject,
): ExpectedProblem {
  const key = `${type}.${field}`
  if (shape !== "value") {
    return {
      where: placeOf(instance),
      message: `the field ${field} is string, not ${WANTED_BY_SHAPE[shape]}`,
      exact: true,
    }
  }
  const report = VALUE_FIELD_REPORTS[key]
  if (report === undefined) {
    throw new Error(`${key} has no row of the rules of the values`)
  }
  return { where: report.where ?? placeOf(instance), message: report.message }
}

/** A field of a node of a named fixture that is changed, and the problem that the check reports for it. */
interface FieldCase {
  readonly diagram: DiagramType
  readonly fixture: string
  readonly type: string
  readonly field: string
  /** What the field is set to; the first node of the type whose field is not null is taken for `null`, and the first whose field is null for any other. */
  readonly set: unknown
  /** The message of the problem at the node that holds the field. */
  readonly message: string
}

/**
 * The fields of nodes that may be null whose null the node reports with the
 * place of the token that is no part of its text, which depends on the tree,
 * each in the tree of a named fixture: the problem is at the node, with that
 * message.
 */
const PART_FIELD_CASES: readonly FieldCase[] = [
  {
    diagram: "sequence",
    fixture: "config-security-level-loose-title-and-box",
    type: "SequenceBoxText",
    field: "colorCandidate",
    set: null,
    message:
      "RawText at 43-44 is neither in a part nor the whitespace between them",
  },
  {
    diagram: "sequence",
    fixture: "config-security-level-loose-title-and-box",
    type: "SequenceBoxText",
    field: "remainder",
    set: null,
    message:
      "RawText at 44-54 is neither in a part nor the whitespace between them",
  },
]

describe("the fields of the nodes of a recorded tree", () => {
  it(
    "are all reported when broken, at the place and by the rule of the field",
    async () => {
      const first = await firstRecordedTrees()
      const unreported: string[] = []
      for (const [type, fields] of Object.entries(NODE_FIELDS)) {
        if (!mayHaveRecordedTrees(type)) continue
        const recorded = first.ofType.get(type)
        for (const [field, spec] of Object.entries(fields)) {
          const row = `${type}.${field}`
          if (recorded === undefined) {
            unreported.push(`${row}: no recorded tree has it`)
            continue
          }
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instances = objectsByType(tree).get(type) ?? []
          // An instance with a value in the field when there is one, so that
          // the field is broken from a value, else any instance.
          const instance =
            instances.find((candidate) => candidate[field] !== null) ??
            instances[0]
          if (instance === undefined) {
            throw new Error(`${recorded.name} has no ${type}`)
          }
          instance[field] =
            spec.shape === "value"
              ? brokenValue(instance[field], spec.valueType)
              : "Z"
          const expected = expectedForBrokenField(
            type,
            field,
            spec.shape,
            instance,
          )
          const problems = checkTree(recorded.input, tree)
          if (!isReported(problems, expected)) {
            unreported.push(failureOf(row, expected, problems, recorded.name))
          }
        }
      }
      expect(unreported).toEqual([])
    },
    READS_THE_RECORDED_TREES,
  )

  it("have a row of the rules of the values for every field that holds a value, and for no other", () => {
    const valueFields = Object.entries(NODE_FIELDS)
      .filter(([type]) => mayHaveRecordedTrees(type))
      .flatMap(([type, fields]) =>
        Object.entries(fields)
          .filter(([, spec]) => spec.shape === "value")
          .map(([field]) => `${type}.${field}`),
      )
    expect(Object.keys(VALUE_FIELD_REPORTS).sort()).toEqual(valueFields.sort())
  })

  it("name a message for every shape of a field of a node or of a list", () => {
    const shapes = new Set(
      Object.values(NODE_FIELDS).flatMap((fields) =>
        Object.values(fields).map((spec) => spec.shape),
      ),
    )
    shapes.delete("value")
    expect([...shapes].sort()).toEqual(Object.keys(WANTED_BY_SHAPE).sort())
  })

  it(
    "are reported inside the range that the field covered, by the rule of the placement of tokens, when a field of a node that may be null is null where a node is written, except for the fields that a named case takes",
    async () => {
      // A field of a node or of a list of nodes that is made null where the
      // source writes it leaves its tokens outside every node: the check
      // reports them where the tokens of a value are placed, inside the range
      // that the field covered, with the message that they lie in no value
      // node, except for the fields of `PUNCTUATOR_FIELDS`, which the check of
      // the punctuators reports in that range. The fields that the node
      // reports with a message of its own (the rules of `null-fields.ts`, and
      // `PART_FIELD_CASES`) are taken by the named cases below, each in the
      // tree of a fixture: whether the rule finds the field depends on what
      // the tree writes (a note on one line reports it only after two
      // whitespace characters), and so does the message.
      const first = await firstRecordedTrees()
      const namedFields = new Set([
        ...Object.entries(NULL_FIELD_RULES).flatMap(([type, rules]) =>
          rules.map((rule) => `${type}.${rule.field}`),
        ),
        ...PART_FIELD_CASES.map(
          (testCase) => `${testCase.type}.${testCase.field}`,
        ),
      ])
      const unreported: string[] = []
      for (const [type, fields] of Object.entries(NODE_FIELDS)) {
        if (!mayHaveRecordedTrees(type)) continue
        for (const [field, spec] of Object.entries(fields)) {
          if (!NULLABLE_NODE_SHAPES.has(spec.shape)) continue
          const key = `${type}.${field}`
          if (namedFields.has(key)) continue
          const recorded = first.withValue.get(key)
          if (recorded === undefined) {
            unreported.push(`${key}: no recorded tree has it`)
            continue
          }
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instance = (objectsByType(tree).get(type) ?? []).find(
            (candidate) => candidate[field] !== null,
          )
          if (instance === undefined) {
            throw new Error(`${recorded.name} has no ${key} that is not null`)
          }
          const covered = rangeCoveredBy(instance[field])
          instance[field] = null
          if (covered === null) {
            throw new Error(`${key} covers nothing in ${recorded.name}`)
          }
          const expected: ExpectedProblem = PUNCTUATOR_FIELDS.has(key)
            ? { where: covered, message: "the Punctuator text " }
            : { where: covered, message: "lies in no value node", exact: true }
          const problems = checkTree(recorded.input, tree)
          if (!isReported(problems, expected)) {
            unreported.push(failureOf(key, expected, problems, recorded.name))
          }
        }
      }
      expect(unreported).toEqual([])
    },
    READS_THE_RECORDED_TREES,
  )

  it(
    "are reported at their node, by the rule of the field, when a body is a list where the node writes no `{`",
    async () => {
      const first = await firstRecordedTrees()
      const unreported: string[] = []
      for (const [type, rules] of Object.entries(NULL_FIELD_RULES)) {
        for (const rule of rules) {
          if (rule.kind !== "braces") continue
          const key = `${type}.${rule.field}`
          const recorded = first.withNull.get(key)
          if (recorded === undefined) {
            unreported.push(`${key}: no recorded tree has it`)
            continue
          }
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instance = (objectsByType(tree).get(type) ?? []).find(
            (candidate) => candidate[rule.field] === null,
          )
          if (instance === undefined) {
            throw new Error(`${recorded.name} has no ${key} that is null`)
          }
          instance[rule.field] = []
          const expected: ExpectedProblem = {
            where: placeOf(instance),
            message: `the field ${rule.field} is a list, but the node has no`,
          }
          const problems = checkTree(recorded.input, tree)
          if (!isReported(problems, expected)) {
            unreported.push(failureOf(key, expected, problems, recorded.name))
          }
        }
      }
      expect(unreported).toEqual([])
    },
    READS_THE_RECORDED_TREES,
  )
})

/** The place of the first object of `type` in the tree of the case, with the problems of the tree in which the field of the object is set. */
function problemsOf(testCase: FieldCase): {
  where: string
  problems: readonly { where: string; message: string }[]
} {
  const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
  const instance = (objectsByType(tree).get(testCase.type) ?? []).find(
    (candidate) =>
      (candidate[testCase.field] !== null) === (testCase.set === null),
  )
  if (instance === undefined) {
    throw new Error(
      `${testCase.fixture} has no ${testCase.type} to set ${testCase.field} in`,
    )
  }
  instance[testCase.field] = testCase.set
  return { where: placeOf(instance), problems: checkTree(input, tree) }
}

/**
 * The fields of strings that may be null, made null where the node writes a
 * word and set to a word where it writes none, each in the tree of a named
 * fixture: the problem is at the node, with the message of the check of the
 * field.
 */
const STRING_FIELD_CASES: readonly FieldCase[] = [
  {
    diagram: "class",
    fixture: "config-security-level-loose-click",
    type: "ClassLinkStatement",
    field: "target",
    set: null,
    message: 'the last token, which is the target: "_self", not null',
  },
  {
    diagram: "class",
    fixture: "config-security-level-sandbox-link-default-target",
    type: "ClassLinkStatement",
    field: "target",
    set: "Z",
    message: 'the last token, which is the target: null, not "Z"',
  },
  {
    diagram: "common",
    fixture: "comment-after-directive",
    type: "Comment",
    field: "mark",
    set: null,
    message: "the mark of a comment line is not %%",
  },
  {
    diagram: "sequence",
    fixture: "lex-hash-comment-across-comment-line",
    type: "Comment",
    field: "mark",
    set: "Z",
    message: "the mark Z is no mark of the comments of a SequenceDiagram",
  },
  {
    diagram: "flowchart",
    fixture: "click-link-url-as-written",
    type: "FlowchartClickUrlStatement",
    field: "target",
    set: null,
    message: 'the target, which is the last token: "_blank", not null',
  },
  {
    diagram: "flowchart",
    fixture: "click-link-url-as-written",
    type: "FlowchartClickUrlStatement",
    field: "target",
    set: "Z",
    message: 'the target, which is the last token: null, not "Z"',
  },
  {
    diagram: "common",
    fixture: "bom-mid-text",
    type: "FlowchartDiagram",
    field: "direction",
    set: null,
    message:
      'the direction of the header is not the first token of the diagram after the header keyword, or null when that is no direction: null, not "LR"',
  },
  {
    diagram: "common",
    fixture: "detect-minimal-flowchart-elk",
    type: "FlowchartDiagram",
    field: "direction",
    set: "Z",
    message:
      'the direction of the header is not the first token of the diagram after the header keyword, or null when that is no direction: "Z", not null',
  },
  {
    diagram: "timeline",
    fixture: "db-direction-td",
    type: "TimelineDiagram",
    field: "direction",
    set: null,
    message:
      'the direction of the header is not the token after the header keyword, or null when there is none: null, not "TD"',
  },
  {
    diagram: "timeline",
    fixture: "db-header-only",
    type: "TimelineDiagram",
    field: "direction",
    set: "Z",
    message:
      'the direction of the header is not the token after the header keyword, or null when there is none: "Z", not null',
  },
  {
    diagram: "sequence",
    fixture: "config-wrap-site-activation-entries",
    type: "SequenceMessageStatement",
    field: "activation",
    set: null,
    message: 'activation: null, not "+"',
  },
  {
    diagram: "sequence",
    fixture: "config-init-trailing-comma",
    type: "SequenceMessageStatement",
    field: "activation",
    set: "Z",
    message: 'activation: "Z", not null',
  },
  {
    diagram: "sequence",
    fixture: "config-wrap-site-block-nowrap-prefix",
    type: "SequenceText",
    field: "wrap",
    set: null,
    message: 'wrap, by the prefix: null, not "nowrap"',
  },
  {
    diagram: "sequence",
    fixture: "config-init-trailing-comma",
    type: "SequenceText",
    field: "wrap",
    set: "Z",
    message: 'wrap, by the prefix: "Z", not null',
  },
]

/**
 * The fields of nodes that may be null, each in the tree of a named fixture
 * where the node writes something for the field outside its children, made
 * null; and the lists that the node writes with braces, set to `[]` where the
 * node writes no `{`. The problem is at the node, with the message of
 * `null-fields.ts`.
 */
const NULL_FIELD_CASES: readonly FieldCase[] = [
  {
    diagram: "class",
    fixture: "bare-marker-directive-lines-eb14dc76",
    type: "ClassDeclaration",
    field: "members",
    set: null,
    message:
      'the field members is null, but the Punctuator "{" at 21-22 opens the body of the class (ast/class.md, ClassDeclaration: the member lines between `{` and `}`; null without a body)',
  },
  {
    diagram: "class",
    fixture: "db-annotation-twice",
    type: "ClassDeclaration",
    field: "members",
    set: [],
    message:
      "the field members is a list, but the node has no `{` that opens the body of the class (ast/class.md, ClassDeclaration: the member lines between `{` and `}`; null without a body)",
  },
  {
    diagram: "class",
    fixture: "gram-member-visibility-whitespace-body-0184dca2",
    type: "ClassMemberStatement",
    field: "member",
    set: null,
    message:
      'the field member is null, but the Punctuator "+" at 17-18 follows the `:` of the statement (ast/class.md, ClassMemberStatement: the member after the `:`)',
  },
  {
    diagram: "sequence",
    fixture: "db-message-wrap-prefix-without-text",
    type: "SequenceMessageStatement",
    field: "text",
    set: null,
    message:
      'the field text is null, but the Keyword "wrap:" at 23-28 follows the `:` of the message (ast/sequence.md, SequenceMessageStatement: the text after the `:`)',
  },
  {
    diagram: "sequence",
    fixture: "db-participant-alias-wrap-prefix",
    type: "SequenceParticipantStatement",
    field: "alias",
    set: null,
    message:
      'the field alias is null, but the Keyword "wrap:" at 33-38 follows the `as` of the participant (ast/sequence.md, SequenceParticipantStatement: the text after `as`)',
  },
  {
    diagram: "state",
    fixture: "db-composite-id-terminal-after-empty-string",
    type: "StateCompositeStatement",
    field: "textBeforeBody",
    set: null,
    message:
      'the field textBeforeBody is null, but the Keyword "accDescr" at 34-42 is text before the `{` of the body that mermaid.js does not read (ast/state.md, StateCompositeStatement: textBeforeBody)',
  },
  {
    diagram: "state",
    fixture: "gram-ignored-state-after-comment-before-body",
    type: "StateCompositeStatement",
    field: "textBeforeBody",
    set: null,
    message:
      'the field textBeforeBody is null, but the Keyword "state" at 33-38 is text before the `{` of the body that mermaid.js does not read (ast/state.md, StateCompositeStatement: textBeforeBody)',
  },
  {
    diagram: "state",
    fixture: "db-dir-first-body-empty",
    type: "StateCompositeStatement",
    field: "body",
    set: null,
    message:
      'the field body is null, but the Punctuator "{" at 24-25 opens the body of the state (ast/state.md, StateCompositeStatement: the statements between `{` and `}`; null without a body)',
  },
  {
    diagram: "state",
    fixture: "gram-state-empty-string-before-name",
    type: "StateCompositeStatement",
    field: "body",
    set: [],
    message:
      "the field body is a list, but the node has no `{` that opens the body of the state (ast/state.md, StateCompositeStatement: the statements between `{` and `}`; null without a body)",
  },
  {
    diagram: "state",
    fixture: "gram-empty-description-block-after-comment-line-before-body",
    type: "StateAliasDefinitionStatement",
    field: "textBeforeBody",
    set: null,
    message:
      'the field textBeforeBody is null, but the Keyword "accDescr" at 36-44 is text before the `{` of the body that mermaid.js does not read (ast/state.md, StateAliasDefinitionStatement: textBeforeBody)',
  },
  {
    diagram: "state",
    fixture: "gram-ignored-state-before-alias-body-next-line",
    type: "StateAliasDefinitionStatement",
    field: "textBeforeBody",
    set: null,
    message:
      'the field textBeforeBody is null, but the Keyword "state" at 35-40 is text before the `{` of the body that mermaid.js does not read (ast/state.md, StateAliasDefinitionStatement: textBeforeBody)',
  },
  {
    diagram: "state",
    fixture: "gram-ignored-percent-before-alias-body-next-line",
    type: "StateAliasDefinitionStatement",
    field: "body",
    set: null,
    message:
      'the field body is null, but the Punctuator "{" at 37-38 opens the body of the state (ast/state.md, StateAliasDefinitionStatement: the statements between `{` and `}`; null without a body)',
  },
  {
    diagram: "state",
    fixture: "db-alias-blank-without-body",
    type: "StateAliasDefinitionStatement",
    field: "body",
    set: [],
    message:
      "the field body is a list, but the node has no `{` that opens the body of the state (ast/state.md, StateAliasDefinitionStatement: the statements between `{` and `}`; null without a body)",
  },
  {
    diagram: "state",
    fixture: "note-colon-whitespace-0090782c",
    type: "StateNoteStatement",
    field: "text",
    set: null,
    message:
      'the field text is null, but the Punctuator ":" at 34-35 follows two or more whitespace characters and so starts the text (diagrams/state.md, The note contexts: with two or more whitespace characters before the `:`, the `:` is a character of the text)',
  },
  {
    diagram: "state",
    fixture: "note-colon-whitespace-1021f32a",
    type: "StateNoteStatement",
    field: "text",
    set: null,
    message:
      'the field text is null, but the Punctuator ":" at 48-49 follows two or more whitespace characters and so starts the text (diagrams/state.md, The note contexts: with two or more whitespace characters before the `:`, the `:` is a character of the text)',
  },
  {
    diagram: "er",
    fixture: "gram-attribute",
    type: "ErEntityStatement",
    field: "attributes",
    set: null,
    message:
      'the field attributes is null, but the Punctuator "{" at 12-13 opens the attribute block of the entity (ast/er.md, ErEntityStatement: the items between `{` and `}`; empty for a block without items, null when there is no block)',
  },
  {
    diagram: "er",
    fixture: "gram-alias",
    type: "ErEntityStatement",
    field: "attributes",
    set: [],
    message:
      "the field attributes is a list, but the node has no `{` that opens the attribute block of the entity (ast/er.md, ErEntityStatement: the items between `{` and `}`; empty for a block without items, null when there is no block)",
  },
  {
    diagram: "er",
    fixture: "gram-subgraph-title",
    type: "ErSubgraphStatement",
    field: "title",
    set: null,
    message:
      'the field title is null, but the Punctuator "[" at 21-22 opens the title of the subgraph (ast/er.md, ErSubgraphStatement: the entity names between `[` and `]`; null when there is no title)',
  },
  {
    diagram: "er",
    fixture: "gram-subgraph",
    type: "ErSubgraphStatement",
    field: "title",
    set: [],
    message:
      "the field title is a list, but the node has no `[` that opens the title of the subgraph (ast/er.md, ErSubgraphStatement: the entity names between `[` and `]`; null when there is no title)",
  },
]

/** What a case does to the field, for the name of its test. */
function doneBy(testCase: FieldCase): string {
  return testCase.set === null
    ? "made null where it is written"
    : `set to ${JSON.stringify(testCase.set)} where it is not written`
}

describe("a field that may be null, in the tree of a named fixture", () => {
  for (const testCase of [
    ...STRING_FIELD_CASES,
    ...NULL_FIELD_CASES,
    ...PART_FIELD_CASES,
  ]) {
    it(`${testCase.type}.${testCase.field} ${doneBy(testCase)}: ${testCase.diagram}/${testCase.fixture}`, () => {
      const { where, problems } = problemsOf(testCase)
      expect(problems).toContainEqual({ where, message: testCase.message })
    })
  }

  it("is named for every field of a string that may be null, in both directions", () => {
    const named = new Set(
      STRING_FIELD_CASES.map(
        (testCase) =>
          `${testCase.type}.${testCase.field} ${testCase.set === null}`,
      ),
    )
    const expected: string[] = []
    for (const [type, fields] of Object.entries(NODE_FIELDS)) {
      for (const [field, spec] of Object.entries(fields)) {
        if (spec.valueType !== "stringOrNull") continue
        expected.push(`${type}.${field} true`, `${type}.${field} false`)
      }
    }
    expect([...named].sort()).toEqual(expected.sort())
  })

  it("is named for every rule of the check of the fields that are null where written, in both directions where the field is a list", () => {
    const named = new Set(
      NULL_FIELD_CASES.map(
        (testCase) =>
          `${testCase.type}.${testCase.field} ${testCase.set === null}`,
      ),
    )
    const expected: string[] = []
    for (const [type, rules] of Object.entries(NULL_FIELD_RULES)) {
      for (const rule of rules) {
        expected.push(`${type}.${rule.field} true`)
        if (rule.kind === "braces") expected.push(`${type}.${rule.field} false`)
      }
    }
    expect([...named].sort()).toEqual(expected.sort())
  })

  it("is a field of the table of the fields that may be null, for every rule of the check", () => {
    for (const [type, rules] of Object.entries(NULL_FIELD_RULES)) {
      for (const rule of rules) {
        const shape = NODE_FIELDS[type]?.[rule.field]?.shape ?? ""
        expect(NULLABLE_NODE_SHAPES.has(shape), `${type}.${rule.field}`).toBe(
          true,
        )
      }
    }
  })
})

// diagrams/state.md, The note contexts: with two or more whitespace characters
// before the `:` of a note on one line, the `:` is a character of the text;
// with one, it is the `:` of the note, and the text, empty after it, is null.
// The fixtures `note-colon-one-whitespace-space`, `-tab`, and
// `-before-directive` write the second case. A tree for each is made by hand
// from the recorded tree of a fixture that writes the first, with the input
// shortened by one whitespace character, the ranges after it moved, and the
// text that held the `:` made null, so that the test does not wait for the
// parser to record the trees of the new fixtures.

/**
 * The input and the tree with `remove` characters of the input at `at`
 * replaced by `insert`: the offsets from the end of the replaced characters
 * on move with the change, and every `loc` is that of its range.
 */
function withInputEdited(
  recorded: RecordedTree,
  at: number,
  remove: number,
  insert: string,
): RecordedTree {
  const input =
    recorded.input.slice(0, at) + insert + recorded.input.slice(at + remove)
  const by = insert.length - remove

  /** Moves the offsets of the ranges under `value`, and sets the `loc` of each. */
  function edit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const entry of value) edit(entry)
      return
    }
    if (typeof value !== "object" || value === null) return
    const object = value as TreeObject
    if (Array.isArray(object.range)) {
      const [start, end] = (object.range as number[]).map((offset) =>
        offset >= at + remove ? offset + by : offset,
      )
      object.range = [start, end]
      object.loc = locationOf(input, [start ?? 0, end ?? 0])
    }
    for (const entry of Object.values(object)) edit(entry)
  }

  const tree = JSON.parse(JSON.stringify(recorded.tree)) as CheckedRoot
  edit(tree)
  return { input, tree }
}

/** `recorded` with the text of its one note made null: the text that held the `:` is none. */
function withoutNoteText(recorded: RecordedTree): RecordedTree {
  const note = nodesOf(recorded.tree).find(
    (node) => node.type === "StateNoteStatement",
  )
  if (note === undefined) throw new Error("the tree has no note")
  Object.assign(note, { text: null })
  return recorded
}

describe("a note on one line whose `:` follows one whitespace character", () => {
  const WITH_TWO_TABS = "note-colon-whitespace-0090782c"
  const WITH_TWO_SPACES_AND_DIRECTIVE = "note-colon-whitespace-1021f32a"

  /** The offset of `text` in the input of the fixture. */
  function offsetIn(recorded: RecordedTree, text: string): number {
    return recorded.input.indexOf(text)
  }

  it("is accepted with a tab, the text empty: note-colon-one-whitespace-tab", () => {
    const base = recordedTree("state", WITH_TWO_TABS)
    const made = withoutNoteText(
      withInputEdited(base, offsetIn(base, "\t\t:"), 1, ""),
    )
    expect(made.input).toBe("stateDiagram-v2\nA\nnote left of A\t: ")
    expect(checkTree(made.input, made.tree)).toEqual([])
  })

  it("is accepted with a space, the text empty: note-colon-one-whitespace-space", () => {
    const base = recordedTree("state", WITH_TWO_TABS)
    const made = withoutNoteText(
      withInputEdited(base, offsetIn(base, "\t\t:"), 2, " "),
    )
    expect(made.input).toBe("stateDiagram-v2\nA\nnote left of A : ")
    expect(checkTree(made.input, made.tree)).toEqual([])
  })

  it("is accepted with a space before a directive that lies before the `:`, the text empty: note-colon-one-whitespace-before-directive", () => {
    const base = recordedTree("state", WITH_TWO_SPACES_AND_DIRECTIVE)
    const withoutOneSpace = withInputEdited(
      base,
      offsetIn(base, "  %%{"),
      1,
      "",
    )
    const made = withoutNoteText(
      withInputEdited(withoutOneSpace, withoutOneSpace.input.length - 1, 1, ""),
    )
    expect(made.input).toBe(
      "stateDiagram-v2\nA\nnote left of A %%{init: {}}%%: ",
    )
    expect(checkTree(made.input, made.tree)).toEqual([])
  })
})
