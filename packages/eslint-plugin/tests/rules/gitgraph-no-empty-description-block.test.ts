/** The rule on its document examples and fixture files. */
import { gitgraphNoEmptyDescriptionBlock } from "../../src/rules/gitgraph-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-empty-description-block", gitgraphNoEmptyDescriptionBlock)
