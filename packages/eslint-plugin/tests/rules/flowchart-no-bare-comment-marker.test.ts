/**
 * The rule `flowchart-no-bare-comment-marker`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoBareCommentMarker } from "../../src/rules/flowchart-no-bare-comment-marker.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-bare-comment-marker", flowchartNoBareCommentMarker)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-bare-comment-marker",
  flowchartNoBareCommentMarker,
  {
    valid: [
      {
        name: "a bare comment marker before a line separator and a vertex",
        filename: "input.mmd",
        code: `flowchart LR
%%\u2028  A
`,
      },
    ],
    invalid: [],
  },
)
