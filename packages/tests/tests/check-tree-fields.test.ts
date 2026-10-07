import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import { NULL_FIELD_RULES } from "../src/check-tree/null-fields.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { recordedTree } from "./check-tree-recorded.ts"
import type { RecordedTree } from "./check-tree-recorded.ts"
import { locationOf } from "./check-tree-trees.ts"

// Every field of every node type of the tree, broken in a recorded tree, is
// reported by the check of a tree, except the fields that `UNCHECKED_FIELDS`
// lists with the reason. A field that may be null is also made null where the
// source writes it, and set where the source writes none, and the problem is
// the field's own.

// The recorded trees are read once, and the first tree for each case is taken
// from an index of them (`firstRecordedTrees()`): the first test, which reads
// them, takes about 2.5 seconds and the others milliseconds; the limit is
// eight times that.
const READS_THE_RECORDED_TREES = 20_000

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
]

/**
 * The fields that the check of a tree does not compare with the source, with
 * the reason. A field that is not here is broken, and the check must report
 * the tree.
 */
const UNCHECKED_FIELDS: Readonly<Record<string, string>> = {}

/**
 * The fields of nodes that may be null whose node reports their absence in
 * its own check of its parts instead of the check of the tokens of a value,
 * each with a part of the message. The tokens of such a field lie in no node
 * that the field could hold, so the problem is not inside the range that the
 * field covered, but at the node that holds it.
 */
const REPORTED_BY_THEIR_NODE: Readonly<Record<string, string>> = {
  "SequenceBoxText.colorCandidate":
    "is neither in a part nor the whitespace between them",
  "SequenceBoxText.remainder":
    "is neither in a part nor the whitespace between them",
}

/** A recorded tree, with its input and its name. */
interface Recorded {
  readonly name: string
  readonly input: string
  readonly json: string
}

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
 * break a field in.
 */
interface FirstTrees {
  /** By the name of a type: the first tree that has an object of the type. */
  readonly ofType: ReadonlyMap<string, Recorded>
  /** By `Type.field`: the first tree that has an object of the type whose field is null. */
  readonly withNull: ReadonlyMap<string, Recorded>
  /** By `Type.field`: the first tree that has an object of the type whose field is not null. */
  readonly withValue: ReadonlyMap<string, Recorded>
}

/** Reads the recorded trees of the corpus once, and indexes the first tree of each case. */
async function buildFirstTrees(): Promise<FirstTrees> {
  const ofType = new Map<string, Recorded>()
  const withNull = new Map<string, Recorded>()
  const withValue = new Map<string, Recorded>()
  for (const diagram of DIAGRAMS) {
    for (const fixture of await loadFixtures(diagram)) {
      const file = path.join(
        getFixturesRoot(),
        diagram,
        fixture.name,
        "ast.json",
      )
      if (!existsSync(file)) continue
      const recorded: Recorded = {
        name: `${diagram}/${fixture.name}`,
        input: fixture.input,
        json: readFileSync(file, "utf8"),
      }
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
  }
  return { ofType, withNull, withValue }
}

let firstTrees: Promise<FirstTrees> | undefined

/** The index of the first recorded trees, built once for all the tests of this file. */
function firstRecordedTrees(): Promise<FirstTrees> {
  firstTrees ??= buildFirstTrees()
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

describe("the fields of the nodes of a recorded tree", () => {
  it(
    "are all reported when broken, except those listed as unchecked",
    async () => {
      const first = await firstRecordedTrees()
      const unreported: string[] = []
      for (const [type, fields] of Object.entries(NODE_FIELDS)) {
        const recorded = first.ofType.get(type)
        for (const [field, spec] of Object.entries(fields)) {
          if (recorded === undefined) {
            unreported.push(`${type}.${field}: no recorded tree has it`)
            continue
          }
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instances = objectsByType(tree).get(type) ?? []
          // An instance with a value in the field when there is one, so that
          // the field is broken from a value, else any instance.
          const instance =
            instances.find((candidate) => candidate[field] !== null) ??
            instances[0]
          if (instance === undefined) continue
          instance[field] =
            spec.shape === "value"
              ? brokenValue(instance[field], spec.valueType)
              : "Z"
          if (
            checkTree(recorded.input, tree).length === 0 &&
            !Object.hasOwn(UNCHECKED_FIELDS, `${type}.${field}`)
          ) {
            unreported.push(`${type}.${field}`)
          }
        }
      }
      expect(unreported).toEqual([])
    },
    READS_THE_RECORDED_TREES,
  )

  it(
    "are reported at their own node when a field of a string that may be null is null where a word is written, and a word where none is written",
    async () => {
      // The first test breaks each field from a word, to another word: a check
      // that reads the field only when it is not null passes that. Here the
      // field is made null where the source writes the word, and a word where
      // it writes none, and the problem is the one of the node that holds the
      // field. Its message is in the named cases below.
      const first = await firstRecordedTrees()
      const unreported: string[] = []
      for (const [type, fields] of Object.entries(NODE_FIELDS)) {
        for (const [field, spec] of Object.entries(fields)) {
          if (spec.valueType !== "stringOrNull") continue
          for (const [written, broken] of [
            [true, null],
            [false, "Z"],
          ] as const) {
            const case_ = `${type}.${field} ${written ? "null where a word is written" : "a word where none is written"}`
            const recorded = (written ? first.withValue : first.withNull).get(
              `${type}.${field}`,
            )
            if (recorded === undefined) {
              unreported.push(`${case_}: no recorded tree has it`)
              continue
            }
            const tree = JSON.parse(recorded.json) as CheckedRoot
            const instance = (objectsByType(tree).get(type) ?? []).find(
              (candidate) => (candidate[field] !== null) === written,
            )
            if (instance === undefined) continue
            instance[field] = broken
            const where = placeOf(instance)
            const problems = checkTree(recorded.input, tree)
            if (!problems.some((problem) => problem.where === where)) {
              unreported.push(
                `${case_}: no problem at ${where} in ${recorded.name}`,
              )
            }
          }
        }
      }
      expect(unreported).toEqual([])
    },
    READS_THE_RECORDED_TREES,
  )

  it(
    "are reported at the place of the field, or at its node where it writes no node, when a field of a node that may be null is null where a node is written",
    async () => {
      // A field of a node or of a list of nodes that is made null where the
      // source writes it leaves its tokens outside every node: the check
      // reports them where the tokens of a value are placed, inside the range
      // that the field covered. Where what the node writes for the field is no
      // value (a keyword or a punctuator of the node, the braces of a body), the
      // check of `null-fields.ts` reports the node that holds the field.
      const first = await firstRecordedTrees()
      const unreported: string[] = []
      for (const [type, fields] of Object.entries(NODE_FIELDS)) {
        for (const [field, spec] of Object.entries(fields)) {
          if (!NULLABLE_NODE_SHAPES.has(spec.shape)) continue
          const key = `${type}.${field}`
          const recorded = first.withValue.get(key)
          if (recorded === undefined) {
            unreported.push(`${key}: no recorded tree has it`)
            continue
          }
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instance = (objectsByType(tree).get(type) ?? []).find(
            (candidate) => candidate[field] !== null,
          )
          if (instance === undefined) continue
          const covered = rangeCoveredBy(instance[field])
          instance[field] = null
          const where = placeOf(instance)
          const problems = checkTree(recorded.input, tree)
          const byTheirNode = REPORTED_BY_THEIR_NODE[key]
          const found = problems.some(
            (problem) =>
              (problem.where === where &&
                (problem.message.startsWith(
                  `the field ${field} is null, but`,
                ) ||
                  (byTheirNode !== undefined &&
                    problem.message.includes(byTheirNode)))) ||
              (covered !== null && isPlacedIn(problem.where, covered)),
          )
          if (!found) {
            unreported.push(`${key}: not reported in ${recorded.name}`)
          }
        }
      }
      expect(unreported).toEqual([])
    },
    READS_THE_RECORDED_TREES,
  )

  it(
    "are reported at their node when a body is a list where the node writes no `{`",
    async () => {
      const first = await firstRecordedTrees()
      const unreported: string[] = []
      for (const [type, rules] of Object.entries(NULL_FIELD_RULES)) {
        for (const rule of rules) {
          if (rule.kind !== "braces") continue
          const recorded = first.withNull.get(`${type}.${rule.field}`)
          if (recorded === undefined) {
            unreported.push(`${type}.${rule.field}: no recorded tree has it`)
            continue
          }
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instance = (objectsByType(tree).get(type) ?? []).find(
            (candidate) => candidate[rule.field] === null,
          )
          if (instance === undefined) continue
          instance[rule.field] = []
          const where = placeOf(instance)
          const prefix = `the field ${rule.field} is a list, but the node has no`
          if (
            !checkTree(recorded.input, tree).some(
              (problem) =>
                problem.where === where && problem.message.startsWith(prefix),
            )
          ) {
            unreported.push(`${type}.${rule.field}: not reported`)
          }
        }
      }
      expect(unreported).toEqual([])
    },
    READS_THE_RECORDED_TREES,
  )
})

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
]

/** What a case does to the field, for the name of its test. */
function doneBy(testCase: FieldCase): string {
  return testCase.set === null
    ? "made null where it is written"
    : `set to ${JSON.stringify(testCase.set)} where it is not written`
}

describe("a field that may be null, in the tree of a named fixture", () => {
  for (const testCase of [...STRING_FIELD_CASES, ...NULL_FIELD_CASES]) {
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
