/**
 * The rule `sequence-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoDuplicateTitle } from "../../src/rules/sequence-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-duplicate-title", sequenceNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-duplicate-title",
  sequenceNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator after an accessibility title",
        filename: "input.mmd",
        code: `sequenceDiagram
accTitle: t
accTitle:\u2028foo
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `sequenceDiagram
accTitle: t
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `sequenceDiagram
accTitle:\u2028foo
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/sequence/db-acc-title-line-empty-takes-next-line-cr",
        filename:
          "tests/fixtures/rules/sequence-no-duplicate-title/invalid/sequence/db-acc-title-line-empty-takes-next-line-cr-input.mmd",
        code: `sequenceDiagram\raccTitle: t\raccTitle:\rfoo\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 4,
            endColumn: 4,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `sequenceDiagram\raccTitle: t\r`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `sequenceDiagram\raccTitle:\rfoo\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/sequence/db-acc-title-line-empty-takes-next-line-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-duplicate-title/invalid/sequence/db-acc-title-line-empty-takes-next-line-crlf-input.mmd",
        code: `sequenceDiagram\r
accTitle: t\r
accTitle:\r
foo\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 4,
            endColumn: 4,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `sequenceDiagram\r
accTitle: t\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `sequenceDiagram\r
accTitle:\r
foo\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/sequence/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-duplicate-title/invalid/sequence/title-equal-predecessor-crlf-input.mmd",
        code: `sequenceDiagram\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `sequenceDiagram\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
