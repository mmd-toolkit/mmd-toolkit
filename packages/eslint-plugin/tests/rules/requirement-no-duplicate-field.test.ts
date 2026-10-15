/**
 * The rule `requirement-no-duplicate-field`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoDuplicateField } from "../../src/rules/requirement-no-duplicate-field.ts"
import { testRule } from "../rule-test.ts"

testRule("requirement-no-duplicate-field", requirementNoDuplicateField)
