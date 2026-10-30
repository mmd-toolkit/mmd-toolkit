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
        output: `classDiagram
%% c
A --> B
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
          },
        ],
      },
      {
        name: "a lone carriage return after an inline comment",
        filename: "input.mmd",
        code: `classDiagram\rAnimal <|-- Duck %% ducks\rclass Fish\r`,
        output: `classDiagram\r%% ducks\rAnimal <|-- Duck\rclass Fish\r`,
        errors: [
          {
            message:
              "mermaid.js reads the line break after this comment as part of the comment, so that line break does not end the statement; put the comment on a line of its own.",
            line: 2,
            column: 18,
            endLine: 2,
            endColumn: 26,
          },
        ],
      },

      {
        name: "invalid/class/div-comment-then-statement-crlf",
        filename:
          "tests/fixtures/rules/class-no-inline-comment/invalid/class/div-comment-then-statement-crlf-input.mmd",
        code: `classDiagram\r
Animal <|-- Duck %% ducks\r
class Fish\r
`,
        output: `classDiagram\r
%% ducks\r
Animal <|-- Duck\r
class Fish\r
`,
        errors: [
          {
            message:
              "mermaid.js reads the line break after this comment as part of the comment, so that line break does not end the statement; put the comment on a line of its own.",
            line: 2,
            column: 18,
            endLine: 2,
            endColumn: 26,
          },
        ],
      },
      {
        name: "invalid/class/lex-comment-then-spaces-line-crlf",
        filename:
          "tests/fixtures/rules/class-no-inline-comment/invalid/class/lex-comment-then-spaces-line-crlf-input.mmd",
        code: `classDiagram\r
A --> B %% c\r
  \r
A : +int age\r
`,
        output: `classDiagram\r
%% c\r
A --> B\r
  \r
A : +int age\r
`,
        errors: [
          {
            message:
              "mermaid.js reads the line break after this comment as part of the comment, so that line break does not end the statement; put the comment on a line of its own.",
            line: 2,
            column: 9,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
    ],
  },
)
