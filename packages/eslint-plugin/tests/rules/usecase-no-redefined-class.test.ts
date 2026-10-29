import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
/** The rule `usecase-no-redefined-class`, on its document examples and fixture inputs. */
import { usecaseNoRedefinedClass } from "../../src/rules/usecase-no-redefined-class.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-redefined-class", usecaseNoRedefinedClass)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-redefined-class",
  usecaseNoRedefinedClass,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/usecase/classdef-crlf",
        filename:
          "tests/fixtures/rules/usecase-no-redefined-class/invalid/usecase/classdef-crlf-input.mmd",
        code: `usecase-beta
classDef hot fill:red\r
classDef hot stroke:blue\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the styles of the class `hot`, set earlier, with those of this `classDef`.",
            line: 3,
            column: 10,
            endLine: 3,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this class definition.",
                output: `usecase-beta
classDef hot fill:red\r
`,
              },
              {
                desc: "Remove the earlier class definition.",
                output: `usecase-beta
classDef hot stroke:blue\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
