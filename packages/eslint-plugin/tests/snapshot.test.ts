/**
 * Shows, as snapshots of eslint-snapshot-rule-tester, where ESLint sees the
 * nodes, the tokens, and the comments of some inputs of the conformance
 * corpus. The tokens include the directives and the frontmatter. The rules
 * here only observe: each reports every element it is given, so that the
 * snapshot marks its range in the text. The inputs cover the line
 * terminators, the diagram types of the flowchart nodes, the parts of the text
 * that are not nodes, the comments of a sequence diagram, and the statements,
 * members, and comments of a class diagram.
 */
import type { Rule } from "eslint"
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester"
import type { Node } from "@mmd-toolkit/parser"
import type { DiagramType } from "@mmd-toolkit/tests"
import type { MermaidRuleDefinition } from "../src/index.ts"
import { LANGUAGE_CONFIG, loadCorpus } from "./helpers.ts"

/** The fixtures whose inputs are shown, with what each one is chosen for. */
const SHOWN_FIXTURES: readonly {
  readonly diagram: DiagramType
  readonly name: string
}[] = [
  // A flowchart with a link, written with `\n` and with `\r\n`. The tester
  // shows the text in lines that end at `\n` or `\r\n` only, so an input with
  // a lone `\r` is not shown here; language.test.ts checks its positions.
  { diagram: "flowchart", name: "spec-swimlanes-diagram-20540af2" },
  { diagram: "common", name: "crlf" },
  // The other diagram type ids of the flowchart nodes.
  { diagram: "common", name: "detect-minimal-flowchart-elk" },
  // Frontmatter, with `\r\n`.
  { diagram: "flowchart", name: "frontmatter-title-crlf" },
  // A comment line that holds a directive, and a subgraph.
  { diagram: "common", name: "config-directive-in-comment" },
  // A directive inside the text of a label: it cuts the text into two tokens.
  { diagram: "common", name: "directive-in-label-text" },
  // Text on a direction line that mermaid.js does not read.
  { diagram: "flowchart", name: "lex-direction-line-percent-after-value" },
  // The error pseudo-diagram and a comment after it.
  { diagram: "common", name: "error-trailing-comment-line" },
  // Comments of a sequence diagram: `#`, and `%%` in the middle of a line.
  { diagram: "sequence", name: "lex-hash-comment-after-unit" },
  { diagram: "sequence", name: "lex-percent-comment-after-unit" },
  // A class diagram with generic names, cardinalities, labels, an annotation,
  // and a class body.
  { diagram: "class", name: "demo-classchart-83b40212" },
  // The fields of a method, and the marks of its visibility and classifier.
  { diagram: "class", name: "tokens-method-fields" },
  // A namespace, with names in backquotes.
  { diagram: "class", name: "spec-class-abe81127" },
  // A comment after a relation, and, in a class body, `%%` after a member,
  // which is part of the text of the member and not a comment.
  { diagram: "class", name: "lex-comment-blank-line-after" },
  { diagram: "class", name: "lex-member-percent" },
]

const fixtures = new Map(
  (await loadCorpus()).map((fixture) => [
    `${fixture.diagram}/${fixture.name}`,
    fixture,
  ]),
)

/** The test cases: each shown fixture, by its input. */
const cases = SHOWN_FIXTURES.map(({ diagram, name }) => {
  const id = `${diagram}/${name}`
  const fixture = fixtures.get(id)
  if (fixture === undefined) throw new Error(`No fixture ${id}`)
  return { name: id, filename: `${id}.mmd`, code: fixture.input }
})

/** Reports every node when ESLint enters it. */
const nodes: MermaidRuleDefinition = {
  meta: { type: "problem", messages: { node: "{{type}}" } },
  create(context) {
    return {
      "*"(node: Node) {
        context.report({
          loc: node.loc,
          messageId: "node",
          data: { type: node.type },
        })
      },
    }
  },
}

/** Reports every token and every comment. */
const tokens: MermaidRuleDefinition = {
  meta: { type: "problem", messages: { element: "{{type}} {{value}}" } },
  create(context) {
    const sourceCode = context.sourceCode
    return {
      Root() {
        const root = sourceCode.ast
        const elements = [...root.tokens, ...sourceCode.comments]
        for (const element of elements) {
          context.report({
            loc: element.loc,
            messageId: "element",
            data: { type: element.type, value: JSON.stringify(element.value) },
          })
        }
      },
    }
  },
}

const tester = new SnapshotRuleTester(LANGUAGE_CONFIG)

// The tester takes the rule types of JavaScript; ESLint runs a rule of any
// language the same way.
tester.run("nodes", nodes as unknown as Rule.RuleModule, {
  valid: [],
  invalid: cases,
})
tester.run("tokens", tokens as unknown as Rule.RuleModule, {
  valid: [],
  invalid: cases,
})
