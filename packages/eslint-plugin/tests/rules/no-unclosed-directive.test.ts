import { RuleTester } from "eslint"
import { noUnclosedDirective } from "../../src/rules/no-unclosed-directive.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("no-unclosed-directive", noUnclosedDirective)

new RuleTester(LANGUAGE_CONFIG).run(
  "no-unclosed-directive",
  noUnclosedDirective,
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
        name: "valid/flowchart/legacy-common-comment-directive-unclosed-trailing-blank-lines",
        filename:
          "legacy-common-comment-directive-unclosed-trailing-blank-lines.mmd",
        code: `flowchart LR
%% %%{init: {}\u0020
\u0020

`,
      },
      {
        name: "valid/flowchart/legacy-common-directive-spans-lone-cr",
        filename: "legacy-common-directive-spans-lone-cr.mmd",
        code: `%%{init: {'theme':\r'dark'}}%%
flowchart LR
A-->B
`,
      },
      {
        name: "valid/flowchart/legacy-a-line-separator-before-a-directive-closes",
        filename: "legacy-a-line-separator-before-a-directive-closes.mmd",
        code: `%%{init: {'theme':'dark'}\u2028}%%
flowchart LR
A-->B
`,
      },
      {
        name: "valid/sequence/legacy-a-line-separator-after-an-unclosed-sequence-directive",
        filename:
          "legacy-a-line-separator-after-an-unclosed-sequence-directive.mmd",
        code: `sequenceDiagram
participant A@{ "style": "x:#y" };participant C;participant E%%{init: {}\u2028;participant D
A->>B: y`,
      },
      {
        name: "valid/sequence/legacy-a-paragraph-separator-after-an-unclosed-sequence-directive",
        filename:
          "legacy-a-paragraph-separator-after-an-unclosed-sequence-directive.mmd",
        code: `sequenceDiagram
participant A@{ "style": "x:#y" };participant C;participant E%%{init: {}\u2029;participant D
A->>B: y`,
      },
      {
        name: "valid/flowchart/legacy-a-line-separator-after-an-unclosed-flowchart-directive",
        filename:
          "legacy-a-line-separator-after-an-unclosed-flowchart-directive.mmd",
        code: `flowchart LR
  A --> B
  %%{init: {"theme": "dark"}\u2028  C --> D
`,
      },
      {
        name: "valid/flowchart/legacy-a-paragraph-separator-after-an-unclosed-flowchart-directive",
        filename:
          "legacy-a-paragraph-separator-after-an-unclosed-flowchart-directive.mmd",
        code: `flowchart LR
  A --> B
  %%{init: {"theme": "dark"}\u2029  C --> D
`,
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
        name: "invalid/sequence/legacy-sequence-tokens-ignored-semicolon-separator-unclosed-directive-carriage-return",
        filename:
          "legacy-sequence-tokens-ignored-semicolon-separator-unclosed-directive-carriage-return.mmd",
        code: `sequenceDiagram
  participant A@{ "style": "x:#y" };participant C;participant E%%{init: {}\r;participant D
  A->>B: y
`,
        errors: [
          {
            message:
              "mermaid.js takes text from later lines into this directive, so that text disappears from the diagram.",
            line: 2,
            column: 64,
            endLine: 4,
            endColumn: 11,
          },
        ],
      },
      {
        name: "invalid/flowchart/boundary-word-argument-after-lone-cr",
        filename: "boundary-word-argument-after-lone-cr.mmd",
        code: `flowchart LR\rA --> B\r%%{wrap\rC --> D`,
        errors: [
          {
            message:
              "mermaid.js takes text from later lines into this directive, so that text disappears from the diagram.",
            line: 3,
            column: 1,
            endLine: 4,
            endColumn: 2,
          },
        ],
      },
    ],
  },
)
