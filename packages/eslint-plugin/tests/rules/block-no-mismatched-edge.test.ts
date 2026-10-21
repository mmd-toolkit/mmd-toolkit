/**
 * The rule `block-no-mismatched-edge`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoMismatchedEdge } from "../../src/rules/block-no-mismatched-edge.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-mismatched-edge", blockNoMismatchedEdge)
