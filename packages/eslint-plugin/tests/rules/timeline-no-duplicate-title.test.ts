/**
 * The rule `timeline-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { timelineNoDuplicateTitle } from "../../src/rules/timeline-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("timeline-no-duplicate-title", timelineNoDuplicateTitle)
