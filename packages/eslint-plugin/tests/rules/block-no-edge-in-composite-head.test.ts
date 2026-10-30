/**
 * The rule `block-no-edge-in-composite-head`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoEdgeInCompositeHead } from "../../src/rules/block-no-edge-in-composite-head.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-edge-in-composite-head", blockNoEdgeInCompositeHead)
