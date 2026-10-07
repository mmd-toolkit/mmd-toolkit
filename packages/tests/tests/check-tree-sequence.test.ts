import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedNode,
  CheckedRoot,
  CheckedToken,
  TreeProblem,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { getFixturesRoot } from "../src/index.ts"
import { replaceToken } from "./check-tree-recorded.ts"

// The checks of a sequence tree and of the `error` pseudo-diagram: they must
// pass the recorded trees and fail a recorded tree in which one thing is
// broken. Each case reads the tree of a named fixture, breaks one field or one
// token, and requires the problem that the check of that field reports.

/** A recorded tree with one thing broken, and the problem that the check must report. */
interface BrokenTree {
  readonly name: string
  /** The fixture whose recorded tree is broken: `sequence/<name>` or `common/<name>`. */
  readonly fixture: string
  /** Breaks the tree in place. */
  readonly mutate: (root: CheckedRoot) => void
  /** The `type` of the node or token that the problem is about. */
  readonly type: string
  /** A part of the message of the problem. */
  readonly message: string
}

/** The first node of `root` of the type `type` that `accepts`; the case fails when there is none. */
function findNode(
  root: CheckedRoot,
  type: string,
  accepts: (node: CheckedNode) => boolean = () => true,
): CheckedNode {
  const node = nodesOf(root).find(
    (candidate) => candidate.type === type && accepts(candidate),
  )
  if (node === undefined) throw new Error(`the tree has no such ${type}`)
  return node
}

/** The first token of `root` of the kind `kind` that `accepts`; the case fails when there is none. */
function findToken(
  root: CheckedRoot,
  kind: string,
  accepts: (token: CheckedToken) => boolean = () => true,
): CheckedToken {
  const token = root.tokens.find(
    (candidate) => candidate.type === kind && accepts(candidate),
  )
  if (token === undefined) throw new Error(`the tree has no such ${kind} token`)
  return token
}

/** `value`, a string, with `suffix` after it. */
function withSuffix(value: unknown, suffix: string): string {
  if (typeof value !== "string") throw new Error("the field is not a string")
  return value + suffix
}

/** The opposite of `value`, a boolean. */
function flipped(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("the field is not a boolean")
  return !value
}

/** Replaces the `range[0]` of `token`, which a recorded tree does not change. */
function startAt(token: CheckedToken, offset: number): void {
  Object.assign(token, { range: [offset, token.range[1]] })
}

/** Cuts the token of `node` after its first character into two tokens of the same kind. */
function splitTokenOf(root: CheckedRoot, node: CheckedNode): void {
  const token = findToken(
    root,
    "Punctuator",
    (candidate) =>
      candidate.range[0] === node.range[0] &&
      candidate.range[1] === node.range[1],
  )
  const middle = token.range[0] + 1
  const first: CheckedToken = {
    ...token,
    range: [token.range[0], middle],
    value: token.value.slice(0, 1),
  }
  const second: CheckedToken = {
    ...token,
    range: [middle, token.range[1]],
    value: token.value.slice(1),
  }
  const tokens = root.tokens.flatMap((candidate) =>
    candidate === token ? [first, second] : [candidate],
  )
  Object.assign(root, { tokens })
}

const WRAP_SITE = "sequence/config-sequence-wrap-site"
const BOX_COLOUR = "sequence/db-box-colour-candidate-word-prefix"
const ERROR_AFTER_INIT = "common/config-init-detection-rejects"
const ERROR_ACROSS_DIRECTIVES =
  "common/detect-directive-across-directive-closed"

const BROKEN_TREES: readonly BrokenTree[] = [
  // ast/sequence.md: the value of a leaf node is its written text.
  {
    name: "a SequenceIdentifier whose name is not its written text",
    fixture: WRAP_SITE,
    mutate: (root) => {
      const node = findNode(root, "SequenceIdentifier")
      Object.assign(node, { name: withSuffix(node.name, "x") })
    },
    type: "SequenceIdentifier",
    message: "name is not its written text",
  },
  {
    name: "a SequenceLiteral whose value is not its written text",
    fixture: WRAP_SITE,
    mutate: (root) => {
      const node = findNode(root, "SequenceLiteral")
      Object.assign(node, { value: withSuffix(node.value, "x") })
    },
    type: "SequenceLiteral",
    message: "value is not its written text",
  },
  {
    name: "a SequenceBoxText whose value is not its written text",
    fixture: BOX_COLOUR,
    mutate: (root) => {
      const node = findNode(root, "SequenceBoxText")
      Object.assign(node, { value: withSuffix(node.value, "x") })
    },
    type: "SequenceBoxText",
    message: "value is not its written text",
  },
  {
    name: "a SequenceIgnoredStatement whose value is not its written text",
    fixture: "sequence/db-ignored-line-after-wrapped-message",
    mutate: (root) => {
      const node = findNode(root, "SequenceIgnoredStatement")
      Object.assign(node, { value: withSuffix(node.value, "x") })
    },
    type: "SequenceIgnoredStatement",
    message: "value is not its written text",
  },
  {
    name: "a SequenceArrow whose value is not its written text",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceArrow"), { value: "->>>" })
    },
    type: "SequenceArrow",
    message: "value is not its written text",
  },
  {
    name: "a SequenceDataBlock whose value is not the text between @{ and }",
    fixture: "sequence/db-data-block-alias-and-as",
    mutate: (root) => {
      const node = findNode(root, "SequenceDataBlock")
      Object.assign(node, { value: withSuffix(node.value, "x") })
    },
    type: "SequenceDataBlock",
    message: "value is not its written text",
  },
  {
    name: "a NumericLiteral whose value is not the number that its written text writes",
    fixture: "sequence/db-autonumber-fraction",
    mutate: (root) => {
      const node = findNode(root, "NumericLiteral")
      Object.assign(node, { value: 7 })
    },
    type: "NumericLiteral",
    message: "value is not the number that its written text writes: 7, not 0.5",
  },
  // parser/docs/tokens.md, A token that a directive cuts: a number is one
  // token, with no cut to explain a second one.
  {
    name: "a number written as two Numeric tokens that no cut separates",
    fixture: "sequence/db-autonumber-fraction",
    mutate: (root) => {
      replaceToken(
        root,
        findToken(root, "Numeric", (token) => token.value === ".5"),
        [
          ["Numeric", 0, 1],
          ["Numeric", 1, 2],
        ],
      )
    },
    type: "NumericLiteral",
    message: "has 2 tokens, not the one that a node of this type has",
  },
  // ast.md, Nodes: whitespace inside a value lies in its tokens.
  {
    name: "a literal whose tokens leave out the whitespace inside its value",
    fixture: "sequence/db-acc-descr-outer-replaces-loop",
    mutate: (root) => {
      replaceToken(
        root,
        findToken(root, "RawText", (token) => token.value === "every minute"),
        [
          ["RawText", 0, 5],
          ["RawText", 6, 12],
        ],
      )
    },
    type: "SequenceLiteral",
    message:
      'the texts of its tokens joined are not its written text: "everyminute", not "every minute"',
  },
  // ast/sequence.md, SequenceParticipantStatement and
  // SequenceDestroyStatement: `created` and `kind`.
  {
    name: "a participant statement whose created is flipped",
    fixture: BOX_COLOUR,
    mutate: (root) => {
      const node = findNode(root, "SequenceParticipantStatement")
      Object.assign(node, { created: flipped(node.created) })
    },
    type: "SequenceParticipantStatement",
    message: "created: true, not false",
  },
  {
    name: "a participant statement whose kind is not its keyword",
    fixture: BOX_COLOUR,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceParticipantStatement"), {
        kind: "actor",
      })
    },
    type: "SequenceParticipantStatement",
    message: 'keyword: "actor", not "participant"',
  },
  {
    name: "a destroy statement whose created is flipped",
    fixture: "sequence/db-box-destroy-inside",
    mutate: (root) => {
      const node = findNode(root, "SequenceDestroyStatement")
      Object.assign(node, { created: flipped(node.created) })
    },
    type: "SequenceDestroyStatement",
    message: "created: true, not false",
  },
  // ast/sequence.md, SequenceText: `wrap` is the prefix that the text starts with.
  {
    name: "a text with the prefix wrap whose wrap is nowrap",
    fixture: "sequence/db-block-loop-wrap",
    mutate: (root) => {
      Object.assign(
        findNode(root, "SequenceText", (node) => node.wrap === "wrap"),
        { wrap: "nowrap" },
      )
    },
    type: "SequenceText",
    message: 'wrap, by the prefix: "nowrap", not "wrap"',
  },
  {
    name: "a text without a prefix whose wrap is wrap",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(
        findNode(root, "SequenceText", (node) => node.wrap === null),
        { wrap: "wrap" },
      )
    },
    type: "SequenceText",
    message: 'wrap, by the prefix: "wrap", not null',
  },
  // ast/sequence.md, SequenceMessageStatement: `activation` is a token.
  {
    name: "a message whose activation is not the token after its arrow",
    fixture: "sequence/db-message-activate-target",
    mutate: (root) => {
      Object.assign(
        findNode(
          root,
          "SequenceMessageStatement",
          (node) => node.activation === "+",
        ),
        { activation: "-" },
      )
    },
    type: "SequenceMessageStatement",
    message: 'activation: "-", not "+"',
  },
  {
    name: "a message with an activation that has no token",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(
        findNode(
          root,
          "SequenceMessageStatement",
          (node) => node.activation === null,
        ),
        { activation: "+" },
      )
    },
    type: "SequenceMessageStatement",
    message: 'activation: "+", not null',
  },
  {
    name: "a message whose activation is null where a + follows its arrow",
    fixture: "sequence/db-message-activate-target",
    mutate: (root) => {
      Object.assign(
        findNode(
          root,
          "SequenceMessageStatement",
          (node) => node.activation === "+",
        ),
        { activation: null },
      )
    },
    type: "SequenceMessageStatement",
    message: 'activation: null, not "+"',
  },
  // ast/sequence.md, SequenceMessageStatement: a central connection is a `()` token.
  {
    name: "a message with a central connection that has no token",
    fixture: WRAP_SITE,
    mutate: (root) => {
      const node = findNode(root, "SequenceMessageStatement")
      Object.assign(node, {
        fromCentralConnection: flipped(node.fromCentralConnection),
      })
    },
    type: "SequenceMessageStatement",
    message:
      "central connections, before and after the arrow: [true,false], not [false,false]",
  },
  {
    name: "a message whose central connection token is not counted",
    fixture: "sequence/db-message-central-connection-both",
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceMessageStatement"), {
        toCentralConnection: false,
      })
    },
    type: "SequenceMessageStatement",
    message:
      "central connections, before and after the arrow: [true,false], not [true,true]",
  },
  {
    name: "a message whose central connections are swapped",
    fixture: "sequence/db-message-central-connection-source",
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceMessageStatement"), {
        fromCentralConnection: false,
        toCentralConnection: true,
      })
    },
    type: "SequenceMessageStatement",
    message:
      "central connections, before and after the arrow: [false,true], not [true,false]",
  },
  // ast/sequence.md, SequenceArrow: one token, and the fields that it writes.
  {
    name: "an arrow whose startMarker is not written",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceArrow"), { startMarker: "arrow" })
    },
    type: "SequenceArrow",
    message: "fields, written ->>",
  },
  {
    name: "an arrow whose line is not written",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceArrow"), { line: "dotted" })
    },
    type: "SequenceArrow",
    message: "fields, written ->>",
  },
  {
    name: "an arrow whose endMarker is not written",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceArrow"), { endMarker: "cross" })
    },
    type: "SequenceArrow",
    message: "fields, written ->>",
  },
  {
    name: "an arrow written as two tokens",
    fixture: WRAP_SITE,
    mutate: (root) => {
      splitTokenOf(root, findNode(root, "SequenceArrow"))
    },
    type: "SequenceArrow",
    message: 'tokens: [["Punctuator",[',
  },
  {
    name: "an arrow whose token is a Keyword",
    fixture: WRAP_SITE,
    mutate: (root) => {
      const arrow = findNode(root, "SequenceArrow")
      Object.assign(
        findToken(
          root,
          "Punctuator",
          (token) => token.range[0] === arrow.range[0],
        ),
        { type: "Keyword" },
      )
    },
    type: "SequenceArrow",
    message: 'tokens: [["Keyword"',
  },
  // ast/sequence.md, SequenceBoxText: each part is a token of its own.
  {
    name: "a box text whose colorCandidate is missing",
    fixture: BOX_COLOUR,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceBoxText"), { colorCandidate: null })
    },
    type: "SequenceBoxText",
    message: "is neither in a part nor the whitespace between them",
  },
  {
    name: "a box text whose remainder is missing",
    fixture: BOX_COLOUR,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceBoxText"), { remainder: null })
    },
    type: "SequenceBoxText",
    message: "is neither in a part nor the whitespace between them",
  },
  // ast/sequence.md, SequenceAccDescrBlockStatement: `closed` is whether `}` ends it.
  {
    name: "a closed description block whose closed is false",
    fixture: "sequence/db-acc-descr-block-after-message",
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceAccDescrBlockStatement"), {
        closed: false,
      })
    },
    type: "SequenceAccDescrBlockStatement",
    message: "closed, by whether its last token is `}`: false, not true",
  },
  {
    name: "an unclosed description block whose closed is true",
    fixture: "sequence/db-acc-descr-block-unclosed",
    mutate: (root) => {
      Object.assign(
        findNode(
          root,
          "SequenceAccDescrBlockStatement",
          (node) => node.closed === false,
        ),
        { closed: true },
      )
    },
    type: "SequenceAccDescrBlockStatement",
    message: "closed, by whether its last token is `}`: true, not false",
  },
  // ast/sequence.md, SequenceNoteStatement: `placement` is the words after `note`.
  {
    name: "a note over two participants placed left of",
    fixture: "sequence/db-note-over-two",
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceNoteStatement"), {
        placement: "left of",
      })
    },
    type: "SequenceNoteStatement",
    message: 'placement: "left of", not "over"',
  },
  {
    name: "a note right of a participant placed left of",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceNoteStatement"), {
        placement: "left of",
      })
    },
    type: "SequenceNoteStatement",
    message: 'placement: "left of", not "right of"',
  },
  // ast/sequence.md, SequenceAutonumberStatement: `off`.
  {
    name: "an autonumber statement whose off is flipped",
    fixture: "sequence/db-autonumber-bare",
    mutate: (root) => {
      const node = findNode(root, "SequenceAutonumberStatement")
      Object.assign(node, { off: flipped(node.off) })
    },
    type: "SequenceAutonumberStatement",
    message: "off: true, not false",
  },
  {
    name: "an autonumber statement written off whose off is false",
    fixture: "sequence/db-autonumber-off",
    mutate: (root) => {
      Object.assign(findNode(root, "SequenceAutonumberStatement"), {
        off: false,
      })
    },
    type: "SequenceAutonumberStatement",
    message: "off: false, not true",
  },
  // parser/docs/tokens.md, Tokens: tokens of values lie in value nodes, and the
  // others do not.
  {
    name: "a Keyword token retyped Identifier, which lies in no value node",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(findToken(root, "Keyword"), { type: "Identifier" })
    },
    type: "Identifier",
    message: "lies in no value node",
  },
  {
    name: "a RawText token retyped Keyword, which lies in a value node",
    fixture: WRAP_SITE,
    mutate: (root) => {
      Object.assign(findToken(root, "RawText"), { type: "Keyword" })
    },
    type: "Keyword",
    message: "lies in the value node SequenceIdentifier",
  },
  // ast.md, ErrorDiagram: RawText tokens, with no whitespace, that do not touch.
  {
    name: "an error diagram token that is not a RawText token",
    fixture: ERROR_AFTER_INIT,
    mutate: (root) => {
      Object.assign(findToken(root, "RawText"), { type: "Keyword" })
    },
    type: "Keyword",
    message: 'kind: "Keyword", not "RawText"',
  },
  {
    name: "an error diagram token that holds a space",
    fixture: ERROR_AFTER_INIT,
    mutate: (root) => {
      const token = findToken(root, "RawText")
      Object.assign(token, { value: withSuffix(token.value, " ") })
    },
    type: "RawText",
    message: "holds whitespace or a line terminator",
  },
  {
    name: "an error diagram token that holds a line feed",
    fixture: ERROR_AFTER_INIT,
    mutate: (root) => {
      const token = findToken(root, "RawText")
      Object.assign(token, { value: withSuffix(token.value, "\n") })
    },
    type: "RawText",
    message: "holds whitespace or a line terminator",
  },
  {
    name: "an error diagram token that holds a line separator",
    fixture: ERROR_AFTER_INIT,
    mutate: (root) => {
      const token = findToken(root, "RawText")
      Object.assign(token, { value: withSuffix(token.value, "\u2028") })
    },
    type: "RawText",
    message: "holds whitespace or a line terminator",
  },
  {
    name: "an error diagram token that touches the token before it",
    fixture: ERROR_ACROSS_DIRECTIVES,
    mutate: (root) => {
      const [first, second] = root.tokens.filter(
        (token) => token.type === "RawText",
      )
      if (first === undefined || second === undefined) {
        throw new Error("the tree has fewer than two RawText tokens")
      }
      startAt(second, first.range[1])
    },
    type: "RawText",
    message: "touches the token before it",
  },
]

/** The recorded tree and the input of `fixture`. */
function readFixture(fixture: string): { text: string; root: CheckedRoot } {
  const directory = path.join(getFixturesRoot(), fixture)
  return {
    text: readFileSync(path.join(directory, "input.mmd"), "utf8"),
    // The recorded tree is JSON; checkTree reports what in it does not hold.
    root: JSON.parse(
      readFileSync(path.join(directory, "ast.json"), "utf8"),
    ) as CheckedRoot,
  }
}

/** Whether a problem is about a node or token of the type `type` and says `message`. */
function says(
  problems: readonly TreeProblem[],
  type: string,
  message: string,
): boolean {
  return problems.some(
    (problem) =>
      problem.where.startsWith(`${type} at `) &&
      problem.message.includes(message),
  )
}

describe("checkTree: sequence trees and the error pseudo-diagram", () => {
  const fixtures = [...new Set(BROKEN_TREES.map((broken) => broken.fixture))]
  for (const fixture of fixtures) {
    it(`passes the recorded tree of ${fixture}`, () => {
      const { text, root } = readFixture(fixture)
      expect(checkTree(text, root)).toEqual([])
    })
  }

  for (const broken of BROKEN_TREES) {
    it(`fails ${broken.name} (${broken.fixture})`, () => {
      const { text, root } = readFixture(broken.fixture)
      broken.mutate(root)
      const problems = checkTree(text, root)
      expect(
        says(problems, broken.type, broken.message),
        JSON.stringify(problems),
      ).toBe(true)
    })
  }
})
