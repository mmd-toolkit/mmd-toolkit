/**
 * The rule `c4-no-duplicate-style`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { c4NoDuplicateStyle } from "../../src/rules/c4-no-duplicate-style.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-duplicate-style", c4NoDuplicateStyle)
