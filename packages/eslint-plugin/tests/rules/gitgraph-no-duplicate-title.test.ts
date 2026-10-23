/** The rule on its document examples and fixture files. */
import { gitgraphNoDuplicateTitle } from "../../src/rules/gitgraph-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-duplicate-title", gitgraphNoDuplicateTitle)
