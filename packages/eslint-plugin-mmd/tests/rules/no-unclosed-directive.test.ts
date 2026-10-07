/**
 * The rule `no-unclosed-directive`, with the inputs of the fixtures that its
 * document cites.
 */
import type { Rule } from "eslint"
import { Linter } from "eslint"
import { describe, expect, it } from "vitest"
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester"
import type { DiagramType } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { noUnclosedDirective } from "../../src/rules/no-unclosed-directive.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"

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

const tester = new SnapshotRuleTester(LANGUAGE_CONFIG)

// The tester takes the rule types of JavaScript; ESLint runs a rule of any
// language the same way.
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
    case: "a closed directive with a U+2028 in it",
    diagram: "common",
    name: "directive-u2028-before-closing",
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

// The tester takes the rule types of JavaScript; ESLint runs a rule of any
// language the same way.
tester.run(
  "no-unclosed-directive",
  noUnclosedDirective as unknown as Rule.RuleModule,
  {
    valid: VALID.map((each) => fixtureCase(each.name, each.diagram)),
    invalid: INVALID.map((each) => fixtureCase(each.name, each.diagram)),
  },
)

/**
 * The inputs with a U+2028 or a U+2029 after the directive: a snapshot would
 * hold the character, so the test counts the reports instead.
 */
const SEPARATORS: readonly {
  case: string
  diagram: DiagramType
  name: string
}[] = [
  {
    case: "a directive with a U+2028 after it",
    diagram: "sequence",
    name: "tokens-ignored-semicolon-separator-unclosed-directive-line-separator",
  },
  {
    case: "a directive with a U+2029 after it",
    diagram: "sequence",
    name: "tokens-ignored-semicolon-separator-unclosed-directive-paragraph-separator",
  },
]

describe("no-unclosed-directive, with a line separator after the directive", () => {
  it.each(SEPARATORS.map((each) => [each.case, each]))("%s", (_case, each) => {
    const { code } = fixtureCase(each.name, each.diagram)
    const messages = new Linter({ configType: "flat" }).verify(
      code,
      {
        ...LANGUAGE_CONFIG,
        rules: { "mmd/no-unclosed-directive": "error" },
      } as never,
      "input.mmd",
    )
    expect(messages.map((message) => message.messageId)).toHaveLength(1)
  })
})
