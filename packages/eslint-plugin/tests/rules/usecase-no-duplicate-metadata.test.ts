/** The rule `usecase-no-duplicate-metadata`, on its document examples and fixture inputs. */
import { RuleTester } from "eslint"
import { usecaseNoDuplicateMetadata } from "../../src/rules/usecase-no-duplicate-metadata.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-duplicate-metadata", usecaseNoDuplicateMetadata)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-duplicate-metadata",
  usecaseNoDuplicateMetadata,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/usecase/metadata-icon-ls-ps",
        filename: "metadata-icon-ls-ps.mmd",
        code: `usecase-beta
actor A
A@{icon:"fa:user\u2028x"}
A@{icon:"fa:user\u2029x"}
`,
        errors: [
          {
            messageId: "duplicate",
            data: { key: "icon", id: "A", line: "3" },
            line: 4,
            column: 4,
            endLine: 4,
            endColumn: 20,
          },
        ],
      },
    ],
  },
)
