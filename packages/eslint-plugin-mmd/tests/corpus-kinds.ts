/**
 * Picks the inputs of the conformance corpus that the tests of the language
 * run on. The corpus holds one input for each claim of the specification,
 * about four thousand; the language gives ESLint what the parser gives it,
 * and what it does depends on the kinds of input: the diagram type, whether
 * the parser accepts the text, the line terminators, and the kinds of the
 * nodes, tokens, and comments of the tree. A test of the language takes a few
 * inputs of each kind, which the parser and the corpus test one by one.
 *
 * A kind is a feature that an input has, such as `token:Keyword` or
 * `terminator:U+2029`. The kinds are those the inputs show, so a kind that the
 * parser adds is picked up without a change here.
 */
import type { Fixture } from "@mmd-toolkit/tests"
import {
  parse,
  ParseError,
  traverseNodes,
  UnsupportedDiagramError,
} from "@mmd-toolkit/parser"
import type { Comment, Root, Token } from "@mmd-toolkit/parser"
import { withoutByteOrderMark } from "./helpers.ts"

/** An input of the corpus, with the kinds that it has. */
export interface KindedInput {
  readonly fixture: Fixture
  /** `diagram/name` of the fixture. */
  readonly name: string
  /** The kinds of the input. */
  readonly kinds: readonly string[]
  /** The tree, when the parser accepts the text. */
  readonly root: Root | null
}

/** How many inputs of each kind a test takes. */
const INPUTS_PER_KIND = 3

/** How many inputs of each kind of node a test takes: one shows how the language treats a node of that type. */
const INPUTS_PER_NODE_TYPE = 1

/** The kinds of the line terminators in `text`. */
function terminatorKinds(text: string): string[] {
  const kinds: string[] = []
  if (text.includes("\r\n")) kinds.push("terminator:CRLF")
  if (/(?<!\r)\n/u.test(text)) kinds.push("terminator:LF")
  if (/\r(?!\n)/u.test(text)) kinds.push("terminator:CR")
  if (text.includes("\u2028")) kinds.push("terminator:U+2028")
  if (text.includes("\u2029")) kinds.push("terminator:U+2029")
  return kinds
}

/** The kinds of the tree `root` of a text: its parts and what they span. */
function treeKinds(root: Root): string[] {
  const kinds = new Set<string>([`body:${root.body.type}`])
  if (root.frontmatter !== null) kinds.add("frontmatter")
  for (const directive of root.directives) {
    kinds.add(directive.closed ? "directive:closed" : "directive:unclosed")
  }
  for (const comment of root.comments) {
    kinds.add(`comment:${comment.mark ?? "fragment"}`)
  }
  for (const token of root.tokens) kinds.add(`token:${token.type}`)
  traverseNodes(root, {
    enterNode(node) {
      kinds.add(`node:${node.type}`)
    },
    leaveNode() {
      // Each node is listed on entering it.
    },
  })
  if (root.tokens.some(spansLines)) kinds.add("multiline:token")
  if (root.comments.some(spansLines)) kinds.add("multiline:comment")
  return [...kinds]
}

/** Whether `element` starts and ends on different lines. */
function spansLines(element: Token | Comment): boolean {
  return element.loc.start.line !== element.loc.end.line
}

/** The input `fixture` with its kinds. */
function kindedInput(fixture: Fixture): KindedInput {
  const text = withoutByteOrderMark(fixture.input)
  const kinds = [`diagram:${fixture.diagram}`, ...terminatorKinds(text)]
  if (text !== fixture.input) kinds.push("byte-order-mark")
  if (text.trim() === "") kinds.push("blank")
  if (!/[\n\r\u2028\u2029]$/u.test(text)) kinds.push("no-final-terminator")
  let root: Root | null = null
  try {
    root = parse(text)
    kinds.push("outcome:accepted", ...treeKinds(root))
  } catch (error) {
    if (error instanceof ParseError) {
      kinds.push("outcome:rejected")
      kinds.push(
        error.loc.start.line === 1 ? "error:first-line" : "error:later-line",
      )
    } else if (error instanceof UnsupportedDiagramError) {
      kinds.push("outcome:unsupported")
    } else {
      // A bug of the parser: the test of the language must run on it.
      kinds.push("outcome:bug")
    }
  }
  return { fixture, name: `${fixture.diagram}/${fixture.name}`, kinds, root }
}

/**
 * From `inputs`, the first `INPUTS_PER_KIND` of each kind that `kindsOf` gives
 * for an input (`INPUTS_PER_NODE_TYPE` for a kind of node), the shortest
 * inputs first, in the order of `inputs`.
 */
export function pickByKind(
  inputs: readonly KindedInput[],
  kindsOf: (input: KindedInput) => readonly string[] = (input) => input.kinds,
): KindedInput[] {
  const shortestFirst = [...inputs].sort(
    (a, b) =>
      a.fixture.input.length - b.fixture.input.length ||
      a.name.localeCompare(b.name),
  )
  const picked = new Set<KindedInput>()
  const taken = new Map<string, number>()
  for (const input of shortestFirst) {
    for (const kind of kindsOf(input)) {
      const limit = kind.startsWith("node:")
        ? INPUTS_PER_NODE_TYPE
        : INPUTS_PER_KIND
      const count = taken.get(kind) ?? 0
      if (count >= limit) continue
      taken.set(kind, count + 1)
      picked.add(input)
    }
  }
  return inputs.filter((input) => picked.has(input))
}

/** The inputs of the corpus `fixtures`, each with its kinds. */
export function kindedInputs(fixtures: readonly Fixture[]): KindedInput[] {
  return fixtures.map(kindedInput)
}
