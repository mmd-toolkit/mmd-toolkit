/**
 * The rule `sankey-no-empty-node`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sankeyNoEmptyNode } from "../../src/rules/sankey-no-empty-node.ts"
import { testRule } from "../rule-test.ts"

testRule("sankey-no-empty-node", sankeyNoEmptyNode)
