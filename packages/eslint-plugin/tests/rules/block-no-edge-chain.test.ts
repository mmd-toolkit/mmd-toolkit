/**
 * The rule `block-no-edge-chain`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { blockNoEdgeChain } from "../../src/rules/block-no-edge-chain.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-edge-chain", blockNoEdgeChain)

new RuleTester(LANGUAGE_CONFIG).run("block-no-edge-chain", blockNoEdgeChain, {
  valid: [],
  invalid: [
    {
      name: "invalid/block/chain-crlf",
      filename:
        "tests/fixtures/rules/block-no-edge-chain/invalid/block/chain-crlf-input.mmd",
      code: `block\r
  A --> B --> C\r
`,
      output: `block\r
  A --> B\r
  B --> C\r
`,
      errors: [
        {
          message:
            "mermaid.js keeps only the last link of this chain, with no start; earlier links are lost and their blocks are not declared by this statement.",
          line: 2,
          column: 3,
          endLine: 2,
          endColumn: 16,
        },
      ],
    },
  ],
})
