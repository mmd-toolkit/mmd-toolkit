/**
 * The rule `sequence-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoIgnoredText } from "../../src/rules/sequence-no-ignored-text.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-ignored-text", sequenceNoIgnoredText)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-ignored-text",
  sequenceNoIgnoredText,
  {
    valid: [],
    invalid: [
      {
        name: "two ignored units separated by a line separator",
        filename: "input.mmd",
        code: `sequenceDiagram
)\u2028)
`,
        errors: [
          {
            message: "mermaid.js reads `)` as no statement and drops it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 2,
            suggestions: [],
          },
          {
            message: "mermaid.js reads `)` as no statement and drops it.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 4,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
