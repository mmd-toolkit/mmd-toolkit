import { RuleTester } from "eslint"
import { flowchartNoRedefinedSubgraph } from "../../src/rules/flowchart-no-redefined-subgraph.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-redefined-subgraph", flowchartNoRedefinedSubgraph)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-redefined-subgraph",
  flowchartNoRedefinedSubgraph,
  {
    valid: [
      {
        name: "title-crlf-content-equal",
        filename: "title-crlf-content-equal.mmd",
        code: `flowchart LR\r
subgraph S ["One\r
Two"]\r
A\r
end\r
subgraph S ["One
Two"]
B
end
`,
      },
      {
        name: "title-lone-cr-content-equal",
        filename: "title-lone-cr-content-equal.mmd",
        code: `flowchart LR
subgraph S ["One\rTwo"]
A
end
subgraph S ["One
Two"]
B
end
`,
      },
    ],
    invalid: [],
  },
)
