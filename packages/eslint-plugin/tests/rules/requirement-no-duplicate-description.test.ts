/**
 * The rule `requirement-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { requirementNoDuplicateDescription } from "../../src/rules/requirement-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "requirement-no-duplicate-description",
  requirementNoDuplicateDescription,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "requirement-no-duplicate-description",
  requirementNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/requirement/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/requirement-no-duplicate-description/valid/requirement/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `requirementDiagram
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  requirement r {
    id: 1
  }
`,
      },
      {
        name: "valid/requirement/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/requirement-no-duplicate-description/valid/requirement/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `requirementDiagram\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  requirement r {
    id: 1
  }
`,
      },
    ],
    invalid: [
      {
        name: "invalid/requirement/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/requirement-no-duplicate-description/invalid/requirement/description-equal-predecessor-crlf-input.mmd",
        code: `requirementDiagram\r
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
                output: `requirementDiagram\r
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
