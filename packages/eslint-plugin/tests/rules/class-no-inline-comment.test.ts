/**
 * The rule `class-no-inline-comment`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { classNoInlineComment } from "../../src/rules/class-no-inline-comment.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-inline-comment", classNoInlineComment)

new RuleTester(LANGUAGE_CONFIG).run(
  "class-no-inline-comment",
  classNoInlineComment,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator after an inline comment",
        filename: "input.mmd",
        code: `classDiagram
A --> B %% c
\u2028
A : +int age
`,
        errors: [
          {
            message:
              "mermaid.js reads the line break after this comment as part of the comment, so that line break does not end the statement; put the comment on a line of its own.",
            line: 2,
            column: 9,
            endLine: 2,
            endColumn: 13,
            suggestions: [],
          },
        ],
      },
      {
        name: "a lone carriage return after an inline comment",
        filename: "input.mmd",
        code: `classDiagram\rAnimal <|-- Duck %% ducks\rclass Fish\r`,
        errors: [
          {
            message:
              "mermaid.js reads the line break after this comment as part of the comment, so that line break does not end the statement; put the comment on a line of its own.",
            line: 2,
            column: 18,
            endLine: 2,
            endColumn: 26,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
