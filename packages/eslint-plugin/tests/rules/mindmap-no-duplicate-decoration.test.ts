/**
 * The rule `mindmap-no-duplicate-decoration`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { mindmapNoDuplicateDecoration } from "../../src/rules/mindmap-no-duplicate-decoration.ts"
import { testRule } from "../rule-test.ts"

testRule("mindmap-no-duplicate-decoration", mindmapNoDuplicateDecoration)

new RuleTester(LANGUAGE_CONFIG).run(
  "mindmap-no-duplicate-decoration",
  mindmapNoDuplicateDecoration,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/mindmap/class-twice-crlf",
        filename:
          "tests/fixtures/rules/mindmap-no-duplicate-decoration/invalid/mindmap/class-twice-crlf-input.mmd",
        code: `mindmap\r
  root\r
    :::urgent\r
    :::large\r
`,
        errors: [
          {
            message:
              "mermaid.js keeps only the last class line and drops the earlier ones for this node.",
            line: 4,
            column: 5,
            endLine: 4,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `mindmap\r
  root\r
    :::urgent\r
`,
              },
              {
                desc: "Remove the earlier statement.",
                output: `mindmap\r
  root\r
    :::large\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
