/**
 * The rule `gantt-no-unknown-exclude`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoUnknownExclude } from "../../src/rules/gantt-no-unknown-exclude.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-unknown-exclude", ganttNoUnknownExclude)
