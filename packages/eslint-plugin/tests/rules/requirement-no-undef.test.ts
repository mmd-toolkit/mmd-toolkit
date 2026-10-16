/**
 * The rule `requirement-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoUndef } from "../../src/rules/requirement-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("requirement-no-undef", requirementNoUndef)
