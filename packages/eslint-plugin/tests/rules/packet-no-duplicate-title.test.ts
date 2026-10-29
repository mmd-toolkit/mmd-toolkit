/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { packetNoDuplicateTitle } from "../../src/rules/packet-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("packet-no-duplicate-title", packetNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "packet-no-duplicate-title",
  packetNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/packet/titles-line-separators-content",
        filename: "titles-line-separators-content.mmd",
        code: `packet
title A\u2028title B
title A\u2028title B
accTitle: C\u2029accTitle: D
accTitle: C\u2029accTitle: D
`,
      },
    ],
    invalid: [
      {
        name: "invalid/packet/titles-lone-cr",
        filename: "titles-lone-cr.mmd",
        code: `packet\rtitle First\rtitle Second\raccTitle: First\raccTitle: Second\r`,
        errors: [
          {
            messageId: "duplicate",
            data: { kind: "title", statement: "title" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
          },
          {
            messageId: "duplicate",
            data: {
              kind: "accessible title",
              statement: "accTitle",
            },
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 17,
          },
        ],
      },
    ],
  },
)
