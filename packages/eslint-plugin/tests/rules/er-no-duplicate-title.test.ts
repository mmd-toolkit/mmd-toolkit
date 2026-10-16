/**
 * The rule `er-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { erNoDuplicateTitle } from "../../src/rules/er-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-duplicate-title", erNoDuplicateTitle)
