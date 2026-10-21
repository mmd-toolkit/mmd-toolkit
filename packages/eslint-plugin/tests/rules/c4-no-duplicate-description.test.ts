/**
 * The rule `c4-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { c4NoDuplicateDescription } from "../../src/rules/c4-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-duplicate-description", c4NoDuplicateDescription)
