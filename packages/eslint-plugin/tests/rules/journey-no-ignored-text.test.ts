/**
 * The rule `journey-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { journeyNoIgnoredText } from "../../src/rules/journey-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-ignored-text", journeyNoIgnoredText)
