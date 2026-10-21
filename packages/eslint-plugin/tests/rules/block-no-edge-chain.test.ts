/**
 * The rule `block-no-edge-chain`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoEdgeChain } from "../../src/rules/block-no-edge-chain.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-edge-chain", blockNoEdgeChain)
