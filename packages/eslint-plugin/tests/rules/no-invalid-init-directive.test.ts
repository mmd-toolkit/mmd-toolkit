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
    invalid: [],
  },
)
