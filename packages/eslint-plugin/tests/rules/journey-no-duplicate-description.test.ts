/**
 * The rule `journey-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { journeyNoDuplicateDescription } from "../../src/rules/journey-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-duplicate-description", journeyNoDuplicateDescription)
