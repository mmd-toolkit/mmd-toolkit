/**
 * The rule `class-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoDuplicateDescription } from "../../src/rules/class-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-duplicate-description", classNoDuplicateDescription)
