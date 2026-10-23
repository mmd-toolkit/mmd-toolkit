/**
 * The rule `gantt-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoDuplicateDescription } from "../../src/rules/gantt-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-duplicate-description", ganttNoDuplicateDescription)
