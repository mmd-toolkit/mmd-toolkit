/**
 * The rule `journey-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { journeyNoDuplicateDescription } from "../../src/rules/journey-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-duplicate-description", journeyNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "journey-no-duplicate-description",
  journeyNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/journey/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/journey-no-duplicate-description/valid/journey/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `journey
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  section S
    t: 5: Me
`,
      },
      {
        name: "valid/journey/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/journey-no-duplicate-description/valid/journey/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `journey\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  section S
    t: 5: Me
`,
      },
    ],
    invalid: [
      {
        name: "invalid/journey/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/journey-no-duplicate-description/invalid/journey/description-equal-predecessor-crlf-input.mmd",
        code: `journey\r
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
                output: `journey\r
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
