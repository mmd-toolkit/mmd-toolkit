/**
 * The rule `block-no-useless-width`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoUselessWidth } from "../../src/rules/block-no-useless-width.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-useless-width", blockNoUselessWidth)
