/**
 * The rule `journey-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { journeyNoDuplicateTitle } from "../../src/rules/journey-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-duplicate-title", journeyNoDuplicateTitle)
