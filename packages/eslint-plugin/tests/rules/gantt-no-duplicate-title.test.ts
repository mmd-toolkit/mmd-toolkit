/**
 * The rule `gantt-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoDuplicateTitle } from "../../src/rules/gantt-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-duplicate-title", ganttNoDuplicateTitle)
