/**
 * The rule `block-no-spaced-class-id`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoSpacedClassId } from "../../src/rules/block-no-spaced-class-id.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-spaced-class-id", blockNoSpacedClassId)
