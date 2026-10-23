/**
 * The rule `requirement-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoDuplicateDescription } from "../../src/rules/requirement-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "requirement-no-duplicate-description",
  requirementNoDuplicateDescription,
)
