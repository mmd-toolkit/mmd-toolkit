/**
 * The rule `block-no-duplicate-columns`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { blockNoDuplicateColumns } from "../../src/rules/block-no-duplicate-columns.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-duplicate-columns", blockNoDuplicateColumns)
