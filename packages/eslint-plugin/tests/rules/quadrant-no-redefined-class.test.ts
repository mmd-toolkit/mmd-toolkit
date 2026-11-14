/**
 * The rule `quadrant-no-redefined-class`, on the examples of its document, on
 * the inputs of its fixture directory, and on class names that go on across a
 * comment region, whose U+2028 is written as an escape.
 */
import { RuleTester } from "eslint"
import { quadrantNoRedefinedClass } from "../../src/rules/quadrant-no-redefined-class.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-redefined-class", quadrantNoRedefinedClass)

new RuleTester(LANGUAGE_CONFIG).run(
  "quadrant-no-redefined-class",
  quadrantNoRedefinedClass,
  {
    valid: [
      {
        name: "valid/quadrant/class-name-comment-region-is-another-class",
        filename: "class-name-comment-region-is-another-class.mmd",
        code: `quadrantChart
  classDef a\u2028%% c
b color: #f00
  classDef a color: #0f0
`,
      },
    ],
    invalid: [
      {
        name: "invalid/quadrant/class-name-comment-region-then-plain-name",
        filename: "class-name-comment-region-then-plain-name.mmd",
        code: `quadrantChart
  classDef a\u2028%% c
b color: #f00
  classDef a\u2028b color: #0f0
`,
        errors: [
          {
            message:
              "mermaid.js replaces the styles of the class `a\u2028b`, set earlier, with those of this `classDef`.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 27,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `quadrantChart
  classDef a\u2028%% c
b color: #f00
`,
              },
              {
                desc: "Remove the earlier statement.",
                output: `quadrantChart
  classDef a\u2028b color: #0f0
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/quadrant/class-name-plain-then-comment-region",
        filename: "class-name-plain-then-comment-region.mmd",
        code: `quadrantChart
  classDef a\u2028b color: #f00
  classDef a\u2028%% c
b color: #0f0
`,
        errors: [
          {
            message:
              "mermaid.js replaces the styles of the class `a\u2028b`, set earlier, with those of this `classDef`.",
            line: 3,
            column: 3,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `quadrantChart
  classDef a\u2028b color: #f00
`,
              },
              {
                desc: "Remove the earlier statement.",
                output: `quadrantChart
  classDef a\u2028%% c
b color: #0f0
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/quadrant/class-name-two-comment-regions-then-plain-name",
        filename: "class-name-two-comment-regions-then-plain-name.mmd",
        code: `quadrantChart
classDef a\u2028%% c
b\u2028%% d
c color: #f00
classDef a\u2028b\u2028c color: #0f0
`,
        errors: [
          {
            message:
              "mermaid.js replaces the styles of the class `a\u2028b\u2028c`, set earlier, with those of this `classDef`.",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 27,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `quadrantChart
classDef a\u2028%% c
b\u2028%% d
c color: #f00
`,
              },
              {
                desc: "Remove the earlier statement.",
                output: `quadrantChart
classDef a\u2028b\u2028c color: #0f0
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/quadrant/class-name-comment-region-with-directive-then-plain-name",
        filename:
          "class-name-comment-region-with-directive-then-plain-name.mmd",
        code: `quadrantChart
classDef a\u2028%%{init: {}}%% %% c
b color: #f00
classDef a\u2028b color: #0f0
`,
        errors: [
          {
            message:
              "mermaid.js replaces the styles of the class `a\u2028b`, set earlier, with those of this `classDef`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 25,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `quadrantChart
classDef a\u2028%%{init: {}}%% %% c
b color: #f00
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/quadrant/class-name-plain-then-comment-region-with-directive",
        filename: "class-name-plain-then-comment-region-with-directive.mmd",
        code: `quadrantChart
classDef a\u2028b color: #f00
classDef a\u2028%%{init: {}}%% %% c
b color: #0f0
`,
        errors: [
          {
            message:
              "mermaid.js replaces the styles of the class `a\u2028b`, set earlier, with those of this `classDef`.",
            line: 3,
            column: 1,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove the earlier statement.",
                output: `quadrantChart
classDef a\u2028%%{init: {}}%% %% c
b color: #0f0
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
