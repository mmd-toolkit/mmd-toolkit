/**
 * The rule `journey-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { journeyNoEmptyDescriptionBlock } from "../../src/rules/journey-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-empty-description-block", journeyNoEmptyDescriptionBlock)
