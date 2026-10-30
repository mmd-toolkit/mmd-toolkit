/**
 * The rule `class-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { classNoDuplicateDescription } from "../../src/rules/class-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-duplicate-description", classNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "class-no-duplicate-description",
  classNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/class/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/class-no-duplicate-description/valid/class/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `classDiagram
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  class A
`,
      },
      {
        name: "valid/class/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/class-no-duplicate-description/valid/class/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `classDiagram\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  class A
`,
      },
    ],
    invalid: [
      {
        name: "a line separator after a description",
        filename: "input.mmd",
        code: `classDiagram
accDescr: d
accDescr:\u2028class A
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 18,
          },
        ],
      },

      {
        name: "invalid/class/db-acc-descr-line-empty-takes-next-line-crlf",
        filename:
          "tests/fixtures/rules/class-no-duplicate-description/invalid/class/db-acc-descr-line-empty-takes-next-line-crlf-input.mmd",
        code: `classDiagram\r
accDescr: d\r
accDescr:\r
class A\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 4,
            endColumn: 8,
          },
        ],
      },
    ],
  },
)
