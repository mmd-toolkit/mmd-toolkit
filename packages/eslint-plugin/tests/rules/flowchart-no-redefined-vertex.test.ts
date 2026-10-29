/**
 * The rule `flowchart-no-redefined-vertex`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoRedefinedVertex } from "../../src/rules/flowchart-no-redefined-vertex.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-redefined-vertex", flowchartNoRedefinedVertex)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-redefined-vertex",
  flowchartNoRedefinedVertex,
  {
    valid: [
      {
        name: "valid/flowchart/db-redefined-vertex-label-differs-by-cr-and-lf",
        filename: "db-redefined-vertex-label-differs-by-cr-and-lf.mmd",
        code: `flowchart LR
  A["a\rb"]
  A["a
b"]
`,
      },
      {
        name: "valid/flowchart/db-vertex-label-carriage-return-no-line-feed",
        filename: "db-vertex-label-carriage-return-no-line-feed.mmd",
        code: `flowchart LR
  A["a
b"]
  A["a\rb"]
`,
      },

      {
        name: "valid/flowchart/db-redefined-vertex-label-differs-by-crlf-and-lf",
        filename:
          "tests/fixtures/rules/flowchart-no-redefined-vertex/valid/flowchart/db-redefined-vertex-label-differs-by-crlf-and-lf-input.mmd",
        code: `flowchart LR
  A["a\r
b"]\r
  A["a
b"]
`,
      },
      {
        name: "valid/flowchart/db-vertex-label-carriage-return-redefined",
        filename:
          "tests/fixtures/rules/flowchart-no-redefined-vertex/valid/flowchart/db-vertex-label-carriage-return-redefined-input.mmd",
        code: `flowchart LR
  A["a
b"]
  A["a\r
b"]
`,
      },
      {
        name: "valid/flowchart/label-line-breaks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/flowchart-no-redefined-vertex/valid/flowchart/label-line-breaks-crlf-and-lf-input.mmd",
        code: `flowchart LR\r
  A["a\r
b"] --> B\r
  C --> A["a
b"]\r
`,
      },
    ],
    invalid: [],
  },
)
