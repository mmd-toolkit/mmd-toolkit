/**
 * The rule `gantt-no-duplicate-setting`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoDuplicateSetting } from "../../src/rules/gantt-no-duplicate-setting.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-duplicate-setting", ganttNoDuplicateSetting)
