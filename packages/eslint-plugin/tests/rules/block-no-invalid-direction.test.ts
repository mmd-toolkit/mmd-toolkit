/**
 * The rule `block-no-invalid-direction`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoInvalidDirection } from "../../src/rules/block-no-invalid-direction.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-invalid-direction", blockNoInvalidDirection)
