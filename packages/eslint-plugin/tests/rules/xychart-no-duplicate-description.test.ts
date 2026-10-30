/**
 * The rule `xychart-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { xychartNoDuplicateDescription } from "../../src/rules/xychart-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-duplicate-description", xychartNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "xychart-no-duplicate-description",
  xychartNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/xychart/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/xychart-no-duplicate-description/valid/xychart/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `xychart
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  line [1]
`,
      },
      {
        name: "valid/xychart/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/xychart-no-duplicate-description/valid/xychart/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `xychart\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  line [1]
`,
      },
    ],
    invalid: [
      {
        name: "invalid/xychart/acc-descr-twice-crlf",
        filename:
          "tests/fixtures/rules/xychart-no-duplicate-description/invalid/xychart/acc-descr-twice-crlf-input.mmd",
        code: `xychart\r
  accDescr: a\r
  accDescr: b\r
  line [1]\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 14,
          },
        ],
      },
    ],
  },
)
