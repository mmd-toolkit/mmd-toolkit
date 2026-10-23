/**
 * The rule `timeline-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { timelineNoEmptyDescriptionBlock } from "../../src/rules/timeline-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("timeline-no-empty-description-block", timelineNoEmptyDescriptionBlock)
