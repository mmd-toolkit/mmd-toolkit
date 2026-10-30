/**
 * The rule `gantt-no-invalid-tag`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { ganttNoInvalidTag } from "../../src/rules/gantt-no-invalid-tag.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-invalid-tag", ganttNoInvalidTag)

new RuleTester(LANGUAGE_CONFIG).run("gantt-no-invalid-tag", ganttNoInvalidTag, {
  valid: [],
  invalid: [
    {
      name: "autofix-crlf",
      filename: "autofix-crlf.mmd",
      code: `gantt\r
b : Done crit, 1d\r
`,
      output: `gantt\r
b : done, crit, 1d\r
`,
      errors: [
        {
          message:
            "mermaid.js does not read `Done` as a tag here: it takes this as an item of the data.",
          line: 2,
          column: 5,
          endLine: 2,
          endColumn: 14,
        },
      ],
    },
  ],
})
