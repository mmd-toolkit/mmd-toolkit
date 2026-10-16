/**
 * The rule `timeline-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { timelineNoDuplicateDescription } from "../../src/rules/timeline-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("timeline-no-duplicate-description", timelineNoDuplicateDescription)
