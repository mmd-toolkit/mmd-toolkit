/**
 * The rule `sequence-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoDuplicateDescription } from "../../src/rules/sequence-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-duplicate-description", sequenceNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-duplicate-description",
  sequenceNoDuplicateDescription,
  {
    valid: [
      {
        name: "a line separator in an unclosed description block",
        filename: "input.mmd",
        code: `sequenceDiagram
accDescr: d
accDescr { x\u2028y
`,
      },

      {
        name: "valid/sequence/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/sequence-no-duplicate-description/valid/sequence/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `sequenceDiagram
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  A ->> B: x
`,
      },
      {
        name: "valid/sequence/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/sequence-no-duplicate-description/valid/sequence/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `sequenceDiagram\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  A ->> B: x
`,
      },
      {
        name: "valid/sequence/db-acc-descr-block-unclosed-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-duplicate-description/valid/sequence/db-acc-descr-block-unclosed-crlf-input.mmd",
        code: `sequenceDiagram\r
accDescr: d\r
accDescr { x\r
`,
      },
    ],
    invalid: [
      {
        name: "invalid/sequence/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-duplicate-description/invalid/sequence/description-equal-predecessor-crlf-input.mmd",
        code: `sequenceDiagram\r
accDescr: A\r
accDescr: A\r
accDescr: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `sequenceDiagram\r
accDescr: A\r
accDescr: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
