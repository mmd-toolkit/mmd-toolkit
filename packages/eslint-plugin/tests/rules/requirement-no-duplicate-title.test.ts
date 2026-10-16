/**
 * The rule `requirement-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoDuplicateTitle } from "../../src/rules/requirement-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("requirement-no-duplicate-title", requirementNoDuplicateTitle)
