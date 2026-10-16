/**
 * The rule `er-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { erNoDuplicateDescription } from "../../src/rules/er-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-duplicate-description", erNoDuplicateDescription)
