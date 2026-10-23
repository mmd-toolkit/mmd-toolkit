/**
 * The rule `c4-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { c4NoDuplicateTitle } from "../../src/rules/c4-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-duplicate-title", c4NoDuplicateTitle)
