/**
 * The rule `flowchart/no-unclosed-description-block`, on the examples of its
 * document and on the fixtures that record what mermaid.js does with an
 * unclosed `accDescr {` block.
 */
import { noUnclosedDescriptionBlock } from "../../../src/rules/flowchart/no-unclosed-description-block.ts"
import { testRule } from "../../rule-test.ts"

testRule(
  "flowchart/no-unclosed-description-block",
  noUnclosedDescriptionBlock,
  {
    kind: "rules",
    rules: {
      "flowchart/no-duplicate-description":
        "A description set before the block, which the closed block replaces.",
    },
  },
)
