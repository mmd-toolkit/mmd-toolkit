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
        output: null,
        errors: [
          {
            message: "mermaid.js reads `)` as no statement and drops it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 2,
          },
          {
            message: "mermaid.js reads `)` as no statement and drops it.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 4,
          },
        ],
      },

      {
        name: "invalid/sequence/lex-invalid-line-cr",
        filename:
          "tests/fixtures/rules/sequence-no-ignored-text/invalid/sequence/lex-invalid-line-cr-input.mmd",
        code: `sequenceDiagram\r)\rA->>B: x\r`,
        output: null,
        errors: [
          {
            message: "mermaid.js reads `)` as no statement and drops it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 2,
          },
        ],
      },
      {
        name: "invalid/sequence/lex-invalid-line-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-ignored-text/invalid/sequence/lex-invalid-line-crlf-input.mmd",
        code: `sequenceDiagram\r
)\r
A->>B: x\r
`,
        output: null,
        errors: [
          {
            message: "mermaid.js reads `)` as no statement and drops it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 2,
          },
        ],
      },

      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `sequenceDiagram\r
A->>B: call(x\r
)\r
`,
        output: `sequenceDiagram\r
A->>B: call(x)\r
`,
        errors: [
          {
            message: "mermaid.js reads `)` as no statement and drops it.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 2,
          },
        ],
      },
    ],
  },
)
