/**
 * The rule `block-no-duplicate-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoDuplicateBlock } from "../../src/rules/block-no-duplicate-block.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-duplicate-block", blockNoDuplicateBlock)
