/**
 * The rule `gantt-no-duplicate-id`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoDuplicateId } from "../../src/rules/gantt-no-duplicate-id.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-duplicate-id", ganttNoDuplicateId)
