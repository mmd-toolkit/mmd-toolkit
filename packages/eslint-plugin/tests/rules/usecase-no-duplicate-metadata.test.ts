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
            data: { key: "icon", id: "A" },
            line: 4,
            column: 4,
            endLine: 4,
            endColumn: 20,
            suggestions: [
              {
                desc: "Remove this metadata property.",
                output: `usecase-beta
actor A
A@{icon:"fa:user\u2028x"}
`,
              },
              {
                desc: "Remove the earlier metadata property.",
                output: `usecase-beta
actor A
A@{icon:"fa:user\u2029x"}
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/usecase/metadata-crlf",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-metadata/invalid/usecase/metadata-crlf-input.mmd",
        code: `usecase-beta
actor A\r
A@{type:hollow}\r
A@{type:awesome}\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the `type` value given earlier for `A` with this value.",
            line: 4,
            column: 4,
            endLine: 4,
            endColumn: 16,
            suggestions: [
              {
                desc: "Remove this metadata property.",
                output: `usecase-beta
actor A\r
A@{type:hollow}\r
`,
              },
              {
                desc: "Remove the earlier metadata property.",
                output: `usecase-beta
actor A\r
A@{type:awesome}\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/usecase/metadata-icon-crlf-content",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-metadata/invalid/usecase/metadata-icon-crlf-content-input.mmd",
        code: `usecase-beta
actor A
A@{icon:"fa:user"}
A@{icon:"fa:gear"}\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the `icon` value given earlier for `A` with this value.",
            line: 4,
            column: 4,
            endLine: 4,
            endColumn: 18,
            suggestions: [
              {
                desc: "Remove this metadata property.",
                output: `usecase-beta
actor A
A@{icon:"fa:user"}
`,
              },
              {
                desc: "Remove the earlier metadata property.",
                output: `usecase-beta
actor A
A@{icon:"fa:gear"}\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
