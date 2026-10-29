import { RuleTester } from "eslint"
import { noInvalidInitDirective } from "../../src/rules/no-invalid-init-directive.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("no-invalid-init-directive", noInvalidInitDirective)

new RuleTester(LANGUAGE_CONFIG).run(
  "no-invalid-init-directive",
  noInvalidInitDirective,
  {
    valid: [
      {
        name: "valid/flowchart/flowchart-unclosed-ls",
        filename: "flowchart-unclosed-ls.mmd",
        code: `flowchart LR
%%{init: {"theme":"dark"}\u2028
A --> B`,
      },
      {
        name: "valid/flowchart/flowchart-unclosed-ps",
        filename: "flowchart-unclosed-ps.mmd",
        code: `flowchart LR
%%{init: {"theme":"dark"}\u2029
A --> B`,
      },
      {
        name: "valid/flowchart/boundary-word-argument-after-lone-cr",
        filename: "boundary-word-argument-after-lone-cr.mmd",
        code: `flowchart LR\rA --> B\r%%{wrap\rC --> D`,
      },
      {
        name: "valid/flowchart/boundary-word-argument-after-ls",
        filename: "boundary-word-argument-after-ls.mmd",
        code: `flowchart LR
A --> B
%%{wrap\u2028C --> D`,
      },
      {
        name: "valid/flowchart/boundary-word-argument-after-ps",
        filename: "boundary-word-argument-after-ps.mmd",
        code: `flowchart LR
A --> B
%%{wrap\u2029C --> D`,
      },
      {
        name: "valid/flowchart/boundary-tabs-around-name-colon-and-json",
        filename: "boundary-tabs-around-name-colon-and-json.mmd",
        code: `%%{\tinit\t:\t{'theme':'dark'}\t}%%
flowchart LR
A --> B`,
      },
    ],
    invalid: [
      {
        name: "invalid/flowchart/flowchart-unclosed-crlf",
        filename:
          "tests/fixtures/rules/no-invalid-init-directive/invalid/flowchart/flowchart-unclosed-crlf-input.mmd",
        code: `flowchart LR\r
A --> B\r
%%{init: {"theme":"dark"}\r
A --> B`,
        output: null,
        errors: [
          {
            message:
              "mermaid.js reads no settings from this init directive because its JSON argument is invalid.",
            line: 3,
            column: 1,
            endLine: 4,
            endColumn: 8,
          },
        ],
      },

      {
        name: "name-case-autofix-crlf",
        filename: "name-case-autofix-crlf.mmd",
        code: `%%{INIT: {"theme":"dark"}}%%\r
flowchart LR\r
A --> B\r
`,
        output: `%%{init: {"theme":"dark"}}%%\r
flowchart LR\r
A --> B\r
`,
        errors: [
          {
            message:
              "mermaid.js reads no settings from `INIT`; init directive names are case-sensitive.",
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: 29,
          },
        ],
      },
      {
        name: "json-commas-autofix-crlf",
        filename: "json-commas-autofix-crlf.mmd",
        code: `%%{init: {"theme":"dark",}}%%\r
flowchart LR\r
A --> B\r
`,
        output: `%%{init: {"theme":"dark"}}%%\r
flowchart LR\r
A --> B\r
`,
        errors: [
          {
            message:
              "mermaid.js reads no settings from this init directive because its JSON argument is invalid.",
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: 30,
          },
        ],
      },
    ],
  },
)
