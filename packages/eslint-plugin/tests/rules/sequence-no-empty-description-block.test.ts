/**
 * The rule `sequence-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoEmptyDescriptionBlock } from "../../src/rules/sequence-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-empty-description-block", sequenceNoEmptyDescriptionBlock)
