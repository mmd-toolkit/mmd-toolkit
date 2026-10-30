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
        name: "apostrophe-with-line-separator-in-directive",
        filename: "apostrophe-line-separator.mmd",
        code: `flowchart LR
%%{init: {"fontFamily": "O'Brien"}\u2028
A --> B
`,
        output: `flowchart LR
%%{init: {"fontFamily": "O\\u0027Brien"}\u2028
A --> B
`,
        errors: [
          {
            messageId: "apostropheInDoubleQuotedString",
            line: 2,
            column: 27,
            endLine: 2,
            endColumn: 28,
          },
        ],
      },
      {
        name: "apostrophe-multiline-crlf",
        filename: "apostrophe-multiline-crlf.mmd",
        code: `%%{init: {"fontFamily":\r
"O'Brien"}}%%\r
flowchart LR\r
A --> B\r
`,
        output: `%%{init: {"fontFamily":\r
"O\\u0027Brien"}}%%\r
flowchart LR\r
A --> B\r
`,
        errors: [
          {
            message:
              "mermaid.js turns this ' into \" before reading the JSON, which breaks it, so it reads no settings from this init directive. Write \\u0027.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 4,
          },
        ],
      },
      {
        name: "non-JSON-whitespace-inside-object",
        filename: "non-json-whitespace.mmd",
        code: `%%{init: {"theme":\u00a0"dark"}}%%
flowchart LR
A --> B
`,
        output: null,
        errors: [
          {
            message:
              "mermaid.js reads no settings from this init directive because its JSON argument is invalid.",
            line: 1,
            column: 19,
            endLine: 1,
            endColumn: 20,
          },
        ],
      },
      {
        name: "control-character-inside-string",
        filename: "control-character.mmd",
        code: `%%{init: {"theme":"da\u0001rk"}}%%
flowchart LR
A --> B
`,
        output: null,
        errors: [
          {
            message:
              "mermaid.js reads no settings from this init directive because its JSON argument is invalid.",
            line: 1,
            column: 22,
            endLine: 1,
            endColumn: 23,
          },
        ],
      },
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
            line: 4,
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
            column: 4,
            endLine: 1,
            endColumn: 8,
          },
        ],
      },
      {
        name: "trailing-comma-autofix-crlf",
        filename: "trailing-comma-autofix-crlf.mmd",
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
              "mermaid.js reads no settings from this init directive because of this trailing comma.",
            line: 1,
            column: 25,
            endLine: 1,
            endColumn: 26,
          },
        ],
      },
    ],
  },
)
