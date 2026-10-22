/**
 * The rule `no-unclosed-directive`, with the inputs of the fixtures that its
 * document cites.
 */
import { RuleTester } from "eslint"
import type { DiagramType } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { noUnclosedDirective } from "../../src/rules/no-unclosed-directive.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

/** The diagram types whose fixtures the cases use. */
const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
]

const fixtures = new Map(
  await Promise.all(
    DIAGRAMS.map(
      async (diagram) =>
        [
          diagram,
          new Map(
            (await loadFixtures(diagram)).map((fixture) => [
              fixture.name,
              fixture,
            ]),
          ),
        ] as const,
    ),
  ),
)

/** The test case of the input of the fixture `name` of `diagram`. */
function fixtureCase(
  name: string,
  diagram: DiagramType = "common",
): {
  name: string
  filename: string
  code: string
} {
  const fixture = fixtures.get(diagram)?.get(name)
  if (fixture === undefined) throw new Error(`No fixture ${diagram}/${name}`)
  return {
    name: `${diagram}/${name}`,
    filename: `${diagram}/${name}.mmd`,
    code: fixture.input,
  }
}

/**
 * The inputs of the rule, each for one case that its document distinguishes:
 * the argument that is cut, the place of the directive, the other rules of the
 * language that meet it there (a comment line, a line terminator, an ignored
 * `;`), and the diagram type.
 */
const INVALID: readonly { case: string; diagram: DiagramType; name: string }[] =
  [
    {
      case: "an argument of JSON, between statements",
      diagram: "common",
      name: "directive-unclosed",
    },
    {
      case: "an argument of JSON, right after the header",
      diagram: "common",
      name: "directive-unclosed-after-header",
    },
    {
      case: "a word argument that takes the first word of the next line",
      diagram: "common",
      name: "directive-word-argument-unclosed-next-line",
    },
    {
      case: "a directive in a comment line",
      diagram: "common",
      name: "comment-directive-unclosed-line-feed-at-end",
    },
    {
      case: "a directive in a comment line, with blank lines after it",
      diagram: "common",
      name: "comment-directive-unclosed-trailing-blank-lines",
    },
    {
      case: "a word argument in a comment line that takes the next lines",
      diagram: "common",
      name: "comment-directive-word-argument-takes-next-lines",
    },
    {
      case: "a directive with an ignored `;` after it",
      diagram: "flowchart",
      name: "ignored-semicolon-after-directive-e2bd2cc0",
    },
    {
      case: "a word argument with an ignored `;` after it",
      diagram: "flowchart",
      name: "ignored-semicolon-after-directive-31a08a0d",
    },
    {
      case: "a directive in a text with `\\r\\n` after it",
      diagram: "sequence",
      name: "tokens-sequence-hash-comment-style-text-open-directive-ac56ea97",
    },
    {
      case: "a directive with blank lines after it",
      diagram: "sequence",
      name: "tokens-sequence-hash-comment-style-text-open-directive-869f782d",
    },
    {
      case: "a directive with a `\\r` after it",
      diagram: "sequence",
      name: "tokens-ignored-semicolon-separator-unclosed-directive-carriage-return",
    },
    {
      case: "a directive after a `#` comment",
      diagram: "sequence",
      name: "tokens-sequence-hash-comment-after-message-open-directive-semicolon-98bc590a",
    },
    {
      case: "a directive after a `%` comment",
      diagram: "sequence",
      name: "tokens-sequence-single-percent-comment-after-autonumber-open-directive-741a95e6",
    },
    {
      case: "a word argument in the text of a message: it ends after the word, and `foo}%%` is text",
      diagram: "sequence",
      name: "db-unclosed-directive-in-message-text",
    },
    {
      case: "a sequence diagram",
      diagram: "sequence",
      name: "directive-unclosed-between-statements",
    },
    {
      case: "a class diagram",
      diagram: "class",
      name: "directive-unclosed-between-statements",
    },
    {
      case: "a state diagram",
      diagram: "state",
      name: "directive-unclosed-between-statements",
    },
  ]

/** The inputs that the rule does not report: directives that are closed, in each place and diagram type. */
const VALID: readonly { case: string; diagram: DiagramType; name: string }[] = [
  {
    case: "a closed directive before the header",
    diagram: "common",
    name: "directive-init-theme",
  },
  {
    case: "a closed directive in the middle of a line",
    diagram: "common",
    name: "directive-mid-line",
  },
  {
    case: "a closed directive with single quotes in its argument",
    diagram: "common",
    name: "directive-single-quotes",
  },
  {
    case: "a closed directive after a link, with no space",
    diagram: "common",
    name: "directive-after-link",
  },
  {
    case: "a closed directive in a comment line",
    diagram: "common",
    name: "directive-in-comment",
  },
  {
    case: "a closed directive in a string",
    diagram: "common",
    name: "directive-in-string",
  },
  {
    case: "a closed directive that a lone `\\r` crosses",
    diagram: "common",
    name: "directive-spans-lone-cr",
  },
  {
    case: "a closed directive of a sequence diagram",
    diagram: "sequence",
    name: "config-init-trailing-comma",
  },
  {
    case: "a closed directive of a class diagram",
    diagram: "class",
    name: "config-init-trailing-comma",
  },
  {
    case: "a closed directive of a state diagram",
    diagram: "state",
    name: "config-init-trailing-comma",
  },
]

testRule("no-unclosed-directive", noUnclosedDirective, {
  valid: VALID.map((each) => fixtureCase(each.name, each.diagram)),
  invalid: INVALID.map((each) => fixtureCase(each.name, each.diagram)),
})

new RuleTester(LANGUAGE_CONFIG).run(
  "no-unclosed-directive",
  noUnclosedDirective,
  {
    valid: [
      {
        name: "a line separator before a directive closes",
        filename: "input.mmd",
        code: `%%{init: {'theme':'dark'}\u2028}%%
flowchart LR
A-->B
`,
      },
    ],
    invalid: [
      {
        name: "a line separator after an unclosed sequence directive",
        filename: "input.mmd",
        code: `sequenceDiagram
participant A@{ "style": "x:#y" };participant C;participant E%%{init: {}\u2028;participant D
A->>B: y`,
        errors: [
          {
            message:
              "This directive has no closing `}%%`: mermaid.js ends it where its argument ends and removes it, with what it covers, from the diagram.",
            line: 2,
            column: 62,
            endLine: 2,
            endColumn: 73,
            suggestions: [],
          },
        ],
      },
      {
        name: "a paragraph separator after an unclosed sequence directive",
        filename: "input.mmd",
        code: `sequenceDiagram
participant A@{ "style": "x:#y" };participant C;participant E%%{init: {}\u2029;participant D
A->>B: y`,
        errors: [
          {
            message:
              "This directive has no closing `}%%`: mermaid.js ends it where its argument ends and removes it, with what it covers, from the diagram.",
            line: 2,
            column: 62,
            endLine: 2,
            endColumn: 73,
            suggestions: [],
          },
        ],
      },
      {
        name: "a line separator after an unclosed flowchart directive",
        filename: "input.mmd",
        code: `flowchart LR
  A --> B
  %%{init: {"theme": "dark"}\u2028  C --> D
`,
        errors: [
          {
            message:
              "This directive has no closing `}%%`: mermaid.js ends it where its argument ends and removes it, with what it covers, from the diagram.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 29,
            suggestions: [],
          },
        ],
      },
      {
        name: "a paragraph separator after an unclosed flowchart directive",
        filename: "input.mmd",
        code: `flowchart LR
  A --> B
  %%{init: {"theme": "dark"}\u2029  C --> D
`,
        errors: [
          {
            message:
              "This directive has no closing `}%%`: mermaid.js ends it where its argument ends and removes it, with what it covers, from the diagram.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 29,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
