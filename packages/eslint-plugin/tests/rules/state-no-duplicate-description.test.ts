/**
 * The rule `state-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { stateNoDuplicateDescription } from "../../src/rules/state-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-duplicate-description", stateNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "state-no-duplicate-description",
  stateNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/state/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/state-no-duplicate-description/valid/state/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `stateDiagram-v2
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  A --> B
`,
      },
      {
        name: "valid/state/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/state-no-duplicate-description/valid/state/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `stateDiagram-v2\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  A --> B
`,
      },
    ],
    invalid: [
      {
        name: "invalid/state/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/state-no-duplicate-description/invalid/state/description-equal-predecessor-crlf-input.mmd",
        code: `stateDiagram-v2\r
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
                output: `stateDiagram-v2\r
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
