/**
 * The rule `requirement-no-duplicate-name`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoDuplicateName } from "../../src/rules/requirement-no-duplicate-name.ts"
import { testRule } from "../rule-test.ts"

testRule("requirement-no-duplicate-name", requirementNoDuplicateName)
