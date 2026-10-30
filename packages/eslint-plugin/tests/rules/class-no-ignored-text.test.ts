/**
 * The rule `class-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { classNoIgnoredText } from "../../src/rules/class-no-ignored-text.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-ignored-text", classNoIgnoredText)

new RuleTester(LANGUAGE_CONFIG).run(
  "class-no-ignored-text",
  classNoIgnoredText,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator before a method",
        filename: "input.mmd",
        code: `classDiagram
class A {
+a\u2028b(c) int
}
`,
        errors: [
          {
            message:
              "mermaid.js reads only a part of this method line and drops `+a`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 3,
          },
        ],
      },
      {
        name: "a line separator after a method",
        filename: "input.mmd",
        code: `classDiagram
class A {
+b(c) in\u2028t
}
`,
        errors: [
          {
            message:
              "mermaid.js reads only a part of this method line and drops `t`.",
            line: 3,
            column: 10,
            endLine: 3,
            endColumn: 11,
          },
        ],
      },
    ],
  },
)
