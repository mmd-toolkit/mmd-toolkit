/**
 * The rule `journey-no-invalid-score`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { journeyNoInvalidScore } from "../../src/rules/journey-no-invalid-score.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-invalid-score", journeyNoInvalidScore)
