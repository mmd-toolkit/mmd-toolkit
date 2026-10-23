/**
 * The rule `requirement-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoIgnoredText } from "../../src/rules/requirement-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("requirement-no-ignored-text", requirementNoIgnoredText)
