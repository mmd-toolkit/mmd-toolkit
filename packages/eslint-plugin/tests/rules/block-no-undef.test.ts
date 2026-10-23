/**
 * The rule `block-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoUndef } from "../../src/rules/block-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-undef", blockNoUndef)
