/**
 * The rule `block-no-mismatched-shape`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoMismatchedShape } from "../../src/rules/block-no-mismatched-shape.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-mismatched-shape", blockNoMismatchedShape)
